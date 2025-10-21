import { Prisma, PrismaClient } from '@prisma/client';
import pino from 'pino';
import { env } from '../config/env.js';
import {
  getEffectiveTenantId,
  getTenantContext,
  isSuperAdmin,
  isTenantScoped as contextIsTenantScoped,
  requireTenantId,
  runWithTenantContext,
} from './tenant-context.js';
import { buildCustomerSearchVector, buildVehicleSearchVector } from '../../shared/search-vector.js';

const logger = pino({ name: 'prisma' });

const TENANT_SCOPED_MODELS: Prisma.ModelName[] = [
  'User',
  'Customer',
  'CustomerInteraction',
  'CustomerVehicle',
  'Lead',
  'Activity',
  'Appointment',
  'LeadScore',
  'Communication',
  'EmailTemplate',
  'SMSTemplate',
  'Automation',
  'Vehicle',
  'VehicleHistory',
  'Deal',
  'DealJacket',
  'CreditApplication',
  'Lender',
  'LenderSubmission',
  'Contract',
  'FundingChecklist',
  'FundingRequest',
  'FIProduct',
  'MenuConfiguration',
  'GLAccount',
  'JournalEntry',
  'JournalEntryLine',
  'Commission',
  'Report',
  'Notification',
  'AuditLog',
  'SystemSetting',
  'WorkflowDefinition',
  'WorkflowStage',
  'VehicleWorkflow',
  'StageTransition',
  'WorkflowTask',
  'TransportOrder',
  'PipelineAggregate',
];

type SearchVectorModel = 'Customer' | 'Vehicle';

const SEARCH_VECTOR_MODELS: ReadonlySet<SearchVectorModel> = new Set(['Customer', 'Vehicle']);

const CUSTOMER_SEARCH_FIELDS = ['firstName', 'lastName', 'email', 'phone'] as const;
const VEHICLE_SEARCH_FIELDS = ['vin', 'make', 'model'] as const;

type CustomerSearchField = (typeof CUSTOMER_SEARCH_FIELDS)[number];
type VehicleSearchField = (typeof VEHICLE_SEARCH_FIELDS)[number];

type CustomerSearchSnapshot = {
  id: string;
  tenantId: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  phone: string | null;
  searchVector: string | null;
};

type VehicleSearchSnapshot = {
  id: string;
  tenantId: string;
  vin: string | null;
  make: string | null;
  model: string | null;
  searchVector: string | null;
};

function isSearchVectorModel(model?: Prisma.ModelName): model is SearchVectorModel {
  return typeof model === 'string' && SEARCH_VECTOR_MODELS.has(model as SearchVectorModel);
}

function extractScalarString(value: unknown): string | null | undefined {
  if (value === undefined) {
    return undefined;
  }

  if (value === null || typeof value === 'string') {
    return value;
  }

  if (typeof value === 'object' && value !== null && 'set' in (value as Record<string, unknown>)) {
    const setValue = (value as Record<string, unknown>).set;
    if (setValue === undefined || setValue === null || typeof setValue === 'string') {
      return setValue as string | null | undefined;
    }
  }

  return undefined;
}

function shouldRebuildSearchVector(model: SearchVectorModel, data: unknown): boolean {
  if (!data || typeof data !== 'object') {
    return false;
  }

  const keys = model === 'Customer' ? CUSTOMER_SEARCH_FIELDS : VEHICLE_SEARCH_FIELDS;
  return keys.some((field) => field in (data as Record<string, unknown>));
}

function mergeCustomerFields(
  data: Record<string, unknown>,
  fallback?: CustomerSearchSnapshot,
): Record<CustomerSearchField, string | null | undefined> {
  const result: Record<CustomerSearchField, string | null | undefined> = {
    firstName: fallback?.firstName ?? undefined,
    lastName: fallback?.lastName ?? undefined,
    email: fallback?.email ?? undefined,
    phone: fallback?.phone ?? undefined,
  };

  for (const field of CUSTOMER_SEARCH_FIELDS) {
    const value = extractScalarString((data as Record<string, unknown>)[field]);
    if (value !== undefined) {
      result[field] = value;
    }
  }

  return result;
}

function mergeVehicleFields(
  data: Record<string, unknown>,
  fallback?: VehicleSearchSnapshot,
): Record<VehicleSearchField, string | null | undefined> {
  const result: Record<VehicleSearchField, string | null | undefined> = {
    vin: fallback?.vin ?? undefined,
    make: fallback?.make ?? undefined,
    model: fallback?.model ?? undefined,
  };

  for (const field of VEHICLE_SEARCH_FIELDS) {
    const value = extractScalarString((data as Record<string, unknown>)[field]);
    if (value !== undefined) {
      result[field] = value;
    }
  }

  return result;
}

function combineWithTenantFilter<T extends Record<string, unknown> | undefined>(where: T, tenantId: string) {
  if (!where || Object.keys(where).length === 0) {
    return { tenantId };
  }

  return { AND: [where, { tenantId }] };
}

const CUSTOMER_SNAPSHOT_SELECT = {
  id: true,
  tenantId: true,
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  searchVector: true,
} as const;

const VEHICLE_SNAPSHOT_SELECT = {
  id: true,
  tenantId: true,
  vin: true,
  make: true,
  model: true,
  searchVector: true,
} as const;

function setSearchVectorValue(
  model: 'Customer' | 'Vehicle',
  target: Record<string, unknown>,
  fallback?: CustomerSearchSnapshot | VehicleSearchSnapshot,
) {
  if (model === 'Customer') {
    const merged = mergeCustomerFields(target, fallback as CustomerSearchSnapshot | undefined);
    const vector = buildCustomerSearchVector({
      firstName: merged.firstName ?? null,
      lastName: merged.lastName ?? null,
      email: merged.email ?? null,
      phone: merged.phone ?? null,
    });
    (target as Record<string, unknown>).searchVector = vector ?? null;
    return;
  }

  const merged = mergeVehicleFields(target, fallback as VehicleSearchSnapshot | undefined);
  const vector = buildVehicleSearchVector({
    vin: merged.vin ?? null,
    make: merged.make ?? null,
    model: merged.model ?? null,
  });
  (target as Record<string, unknown>).searchVector = vector ?? null;
}

function runWithoutSearchVector<T>(tenantId: string, callback: () => T): T;
function runWithoutSearchVector<T>(tenantId: string, callback: () => Promise<T>): Promise<T>;
function runWithoutSearchVector<T>(tenantId: string, callback: () => T | Promise<T>): T | Promise<T> {
  const current = getTenantContext() ?? {};
  return runWithTenantContext({ ...current, tenantId, skipSearchVector: true }, callback);
}

async function fetchCustomerSnapshot(
  client: PrismaClient,
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Promise<CustomerSearchSnapshot | null> {
  return runWithoutSearchVector(tenantId, () =>
    client.customer.findFirst({
      where: combineWithTenantFilter(where, tenantId),
      select: CUSTOMER_SNAPSHOT_SELECT,
    }),
  );
}

async function fetchCustomerSnapshots(
  client: PrismaClient,
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Promise<CustomerSearchSnapshot[]> {
  return runWithoutSearchVector(tenantId, () =>
    client.customer.findMany({
      where: combineWithTenantFilter(where, tenantId),
      select: CUSTOMER_SNAPSHOT_SELECT,
    }),
  );
}

async function fetchVehicleSnapshot(
  client: PrismaClient,
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Promise<VehicleSearchSnapshot | null> {
  return runWithoutSearchVector(tenantId, () =>
    client.vehicle.findFirst({
      where: combineWithTenantFilter(where, tenantId),
      select: VEHICLE_SNAPSHOT_SELECT,
    }),
  );
}

async function fetchVehicleSnapshots(
  client: PrismaClient,
  where: Record<string, unknown> | undefined,
  tenantId: string,
): Promise<VehicleSearchSnapshot[]> {
  return runWithoutSearchVector(tenantId, () =>
    client.vehicle.findMany({
      where: combineWithTenantFilter(where, tenantId),
      select: VEHICLE_SNAPSHOT_SELECT,
    }),
  );
}

async function persistCustomerSearchVector(
  client: PrismaClient,
  tenantId: string,
  snapshot: CustomerSearchSnapshot,
): Promise<string | null> {
  const vector = buildCustomerSearchVector(snapshot);

  if (vector === snapshot.searchVector) {
    return vector;
  }

  await runWithoutSearchVector(tenantId, () =>
    client.customer.updateMany({
      where: { id: snapshot.id, tenantId },
      data: { searchVector: vector },
    }),
  );

  return vector;
}

async function persistVehicleSearchVector(
  client: PrismaClient,
  tenantId: string,
  snapshot: VehicleSearchSnapshot,
): Promise<string | null> {
  const vector = buildVehicleSearchVector(snapshot);

  if (vector === snapshot.searchVector) {
    return vector;
  }

  await runWithoutSearchVector(tenantId, () =>
    client.vehicle.updateMany({
      where: { id: snapshot.id, tenantId },
      data: { searchVector: vector },
    }),
  );

  return vector;
}

function applySearchVectorPreprocess(
  model: SearchVectorModel,
  action: Prisma.PrismaAction,
  args: Prisma.MiddlewareParams['args'] | undefined,
) {
  if (!args) {
    return;
  }

  switch (action) {
    case 'create':
    case 'createMany': {
      const data = args.data;
      if (!data) {
        return;
      }

      if (Array.isArray(data)) {
        for (const entry of data) {
          setSearchVectorValue(model, entry as Record<string, unknown>);
        }
      } else {
        setSearchVectorValue(model, data as Record<string, unknown>);
      }
      break;
    }
    case 'upsert': {
      if (args.create) {
        setSearchVectorValue(model, args.create as Record<string, unknown>);
      }
      break;
    }
    default:
      break;
  }
}

async function rebuildSearchVectorsAfterAction(
  client: PrismaClient,
  tenantId: string,
  model: SearchVectorModel,
  action: Prisma.PrismaAction,
  args: Prisma.MiddlewareParams['args'] | undefined,
  result: unknown,
) {
  if (action === 'updateMany') {
    const data = args?.data as Record<string, unknown> | undefined;
    if (!shouldRebuildSearchVector(model, data)) {
      return;
    }

    if (model === 'Customer') {
      const snapshots = await fetchCustomerSnapshots(client, args?.where as Record<string, unknown> | undefined, tenantId);
      for (const snapshot of snapshots) {
        await persistCustomerSearchVector(client, tenantId, snapshot);
      }
      return;
    }

    const snapshots = await fetchVehicleSnapshots(client, args?.where as Record<string, unknown> | undefined, tenantId);
    for (const snapshot of snapshots) {
      await persistVehicleSearchVector(client, tenantId, snapshot);
    }
    return;
  }

  if (action === 'update' || action === 'upsert') {
    const data = (action === 'upsert' ? args?.update : args?.data) as Record<string, unknown> | undefined;
    if (!shouldRebuildSearchVector(model, data)) {
      return;
    }

    if (model === 'Customer') {
      const snapshot = await fetchCustomerSnapshot(client, args?.where as Record<string, unknown> | undefined, tenantId);
      if (!snapshot) {
        return;
      }
      const vector = await persistCustomerSearchVector(client, tenantId, snapshot);
      if (result && typeof result === 'object' && result !== null && 'searchVector' in result) {
        (result as Record<string, unknown>).searchVector = vector ?? null;
      }
      return;
    }

    const snapshot = await fetchVehicleSnapshot(client, args?.where as Record<string, unknown> | undefined, tenantId);
    if (!snapshot) {
      return;
    }
    const vector = await persistVehicleSearchVector(client, tenantId, snapshot);
    if (result && typeof result === 'object' && result !== null && 'searchVector' in result) {
      (result as Record<string, unknown>).searchVector = vector ?? null;
    }
  }
}

function searchVectorMiddleware(client: PrismaClient): Prisma.Middleware {
  return async (params, next) => {
    const ctx = getTenantContext();
    if (ctx?.skipSearchVector) {
      return next(params);
    }

    if (!isSearchVectorModel(params.model)) {
      return next(params);
    }

    const tenantId = getEffectiveTenantId();
    if (!tenantId) {
      if (ctx?.isSuperAdmin && !ctx.impersonatedTenantId) {
        return next(params);
      }
      throw new Error(`Tenant context is required for ${params.model} operations.`);
    }

    applySearchVectorPreprocess(params.model, params.action, params.args);
    const result = await next(params);
    await rebuildSearchVectorsAfterAction(client, tenantId, params.model, params.action, params.args, result);
    return result;
  };
}

function shouldIsolate(model?: Prisma.ModelName) {
  return model !== undefined && TENANT_SCOPED_MODELS.includes(model);
}

function injectTenantFilter(
  params: Prisma.MiddlewareParams,
  tenantId: string,
): Prisma.MiddlewareParams['args'] {
  const args = params.args ?? {};

  switch (params.action) {
    case 'findUnique':
      params.action = 'findFirst';
      args.where = { AND: [args.where ?? {}, { tenantId }] };
      break;
    case 'findFirst':
    case 'findMany':
    case 'update':
    case 'updateMany':
    case 'delete':
    case 'deleteMany':
    case 'aggregate':
    case 'count':
    case 'groupBy':
      args.where = { AND: [args.where ?? {}, { tenantId }] };
      break;
    case 'upsert':
      args.where = { AND: [args.where ?? {}, { tenantId }] };
      if (args.create) {
        args.create = Array.isArray(args.create)
          ? args.create.map((entry: any) => ({ tenantId, ...entry }))
          : { tenantId, ...args.create };
      }
      if (args.update) {
        args.update = { ...args.update, tenantId };
      }
      break;
    case 'create':
    case 'createMany':
      if (Array.isArray(args.data)) {
        args.data = args.data.map((entry: any) => ({ tenantId, ...entry }));
      } else if (args.data) {
        args.data = { tenantId, ...args.data };
      }
      break;
    default:
      break;
  }

  return args;
}

function tenantIsolationMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (!shouldIsolate(params.model)) {
      return next(params);
    }

    const ctx = getTenantContext();
    if (!ctx) {
      throw new Error(`Tenant context is required for ${params.model} operations.`);
    }

    if (ctx.isSuperAdmin && !ctx.impersonatedTenantId) {
      return next(params);
    }

    const tenantId = getEffectiveTenantId();
    if (!tenantId) {
      throw new Error(`Tenant context missing tenantId for ${params.model}`);
    }

    params.args = injectTenantFilter(params, tenantId);

    return next(params);
  };
}

const logConfiguration: Prisma.LogDefinition[] =
  env.NODE_ENV === 'development'
    ? [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'error' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'info' },
      ]
    : [{ emit: 'stdout', level: 'error' }];

type GlobalPrisma = typeof globalThis & { prisma?: PrismaClient };

function createClient() {
  const client = new PrismaClient({ log: logConfiguration });
  client.$use(tenantIsolationMiddleware());
  client.$use(searchVectorMiddleware(client));
  return client;
}

const globalWithPrisma = globalThis as GlobalPrisma;
export const prisma = globalWithPrisma.prisma ?? createClient();

if (env.NODE_ENV !== 'production') {
  globalWithPrisma.prisma = prisma;
}

export function assertTenantScope() {
  if (!isSuperAdmin()) {
    requireTenantId();
  }
}

export const isTenantScoped = contextIsTenantScoped;

export default prisma;
