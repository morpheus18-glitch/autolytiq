import { Prisma, PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

import { buildCustomerSearchVector, buildVehicleSearchVector } from '../../shared/search-vector.js';

interface TenantContextValue {
  tenantId?: string;
  skipSearchVector?: boolean;
}

const tenantStorage = new AsyncLocalStorage<TenantContextValue>();

const tenantScopedModels = new Set<Prisma.ModelName>([
  // Core CRM
  Prisma.ModelName.User,
  Prisma.ModelName.Customer,
  Prisma.ModelName.CustomerInteraction,
  Prisma.ModelName.CustomerVehicle,
  Prisma.ModelName.Lead,
  Prisma.ModelName.LeadScore,
  Prisma.ModelName.Activity,
  Prisma.ModelName.Appointment,
  Prisma.ModelName.Communication,

  // Templates & Automation
  Prisma.ModelName.EmailTemplate,
  Prisma.ModelName.SMSTemplate,
  Prisma.ModelName.Automation,
  Prisma.ModelName.AutomationExecution,

  // Inventory
  Prisma.ModelName.Vehicle,
  Prisma.ModelName.VehicleHistory,
  Prisma.ModelName.Appraisal,
  Prisma.ModelName.ReconItem,
  Prisma.ModelName.PriceHistory,
  Prisma.ModelName.AuctionPurchase,
  Prisma.ModelName.WholesaleListing,
  Prisma.ModelName.MarketComp,

  // Deals & F&I
  Prisma.ModelName.Deal,
  Prisma.ModelName.DealWorksheet,
  Prisma.ModelName.DealVersion,
  Prisma.ModelName.DealOptimization,
  Prisma.ModelName.DealJacket,
  Prisma.ModelName.CounterOffer,
  Prisma.ModelName.ApprovalPrediction,
  Prisma.ModelName.CreditSubmissionDraft,
  Prisma.ModelName.ComplianceChecklist,
  Prisma.ModelName.CreditApplication,
  Prisma.ModelName.CreditReport,
  Prisma.ModelName.Contract,
  Prisma.ModelName.DealDocument,
  Prisma.ModelName.FundingChecklist,
  Prisma.ModelName.FundingRequest,

  // F&I Products & Lenders
  Prisma.ModelName.FIProduct,
  Prisma.ModelName.MenuConfiguration,
  Prisma.ModelName.Lender,
  Prisma.ModelName.LenderSubmission,

  // Accounting
  Prisma.ModelName.GLAccount,
  Prisma.ModelName.JournalEntry,
  Prisma.ModelName.JournalEntryLine,
  Prisma.ModelName.Commission,

  // Workflow & Operations
  Prisma.ModelName.WorkflowDefinition,
  Prisma.ModelName.WorkflowStage,
  Prisma.ModelName.VehicleWorkflow,
  Prisma.ModelName.StageTransition,
  Prisma.ModelName.WorkflowTask,
  Prisma.ModelName.TransportOrder,

  // System
  Prisma.ModelName.Notification,
  Prisma.ModelName.Report,
  Prisma.ModelName.PipelineAggregate,
  Prisma.ModelName.AuditLog,
  Prisma.ModelName.SystemSetting,
]);

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

function withTenantGuard<T extends Prisma.MiddlewareParams>(params: T) {
  if (!params.model || !tenantScopedModels.has(params.model)) {
    return { params, tenantId: undefined } as const;
  }

  const store = tenantStorage.getStore();
  const tenantId = store?.tenantId;

  if (!tenantId) {
    throw new Error(`Tenant context is required for ${params.model} operations.`);
  }

  return { params, tenantId } as const;
}

function applyTenantFilters(
  params: Prisma.MiddlewareParams,
  tenantId: string,
): Prisma.MiddlewareParams {
  params.args = params.args ?? {};

  switch (params.action) {
    case 'findUnique': {
      params.action = 'findFirst';
      params.args.where = { AND: [params.args.where ?? {}, { tenantId }] };
      break;
    }
    case 'findFirst':
    case 'findMany':
    case 'count':
    case 'aggregate':
    case 'groupBy':
    case 'delete':
    case 'deleteMany':
    case 'update':
    case 'updateMany': {
      params.args.where = { AND: [params.args.where ?? {}, { tenantId }] };
      break;
    }
    case 'create':
    case 'createMany': {
      if (Array.isArray(params.args.data)) {
        params.args.data = params.args.data.map((entry: Record<string, unknown>) => ({
          tenantId,
          ...entry,
        }));
      } else if (params.args.data) {
        params.args.data = { tenantId, ...params.args.data };
      }
      break;
    }
    case 'upsert': {
      params.args.where = { AND: [params.args.where ?? {}, { tenantId }] };
      if (params.args.create) {
        params.args.create = { tenantId, ...params.args.create };
      }
      if (params.args.update) {
        params.args.update = { ...params.args.update, tenantId };
      }
      break;
    }
    default:
      break;
  }

  return params;
}

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

function shouldRebuildSearchVector(model: Prisma.ModelName, data: unknown): boolean {
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
  model: SearchVectorModel,
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
  const current = tenantStorage.getStore() ?? {};
  const context: TenantContextValue = { ...current, tenantId, skipSearchVector: true };
  return tenantStorage.run(context, callback);
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

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

  client.$use(async (params, next) => {
    const store = tenantStorage.getStore();
    if (store?.skipSearchVector) {
      return next(params);
    }

    const { params: guardedParams, tenantId } = withTenantGuard(params);

    if (!tenantId) {
      return next(guardedParams);
    }

    if (isSearchVectorModel(guardedParams.model)) {
      applySearchVectorPreprocess(guardedParams.model, guardedParams.action, guardedParams.args);
    }

    const scopedParams = applyTenantFilters(guardedParams, tenantId);
    const result = await next(scopedParams);

    if (isSearchVectorModel(guardedParams.model)) {
      await rebuildSearchVectorsAfterAction(
        client,
        tenantId,
        guardedParams.model,
        guardedParams.action,
        scopedParams.args,
        result,
      );
    }

    return result;
  });

  return client;
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export const tenantContext = tenantStorage;

export function runWithTenant<T>(tenantId: string, callback: () => T): T {
  const current = tenantStorage.getStore() ?? {};
  return tenantStorage.run({ ...current, tenantId }, callback);
}

export function getTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}

export function getEffectiveTenantId(): string | null {
  return tenantStorage.getStore()?.tenantId ?? null;
}

export function runWithTenantContext<T>(context: TenantContextValue, callback: () => T): T;
export function runWithTenantContext<T>(context: TenantContextValue, callback: () => Promise<T>): Promise<T>;
export function runWithTenantContext<T>(
  context: TenantContextValue,
  callback: () => T | Promise<T>,
): T | Promise<T> {
  const current = tenantStorage.getStore() ?? {};
  return tenantStorage.run({ ...current, ...context }, callback);
}

export function isTenantScoped(): boolean {
  return Boolean(getTenantId());
}

export function toInputJson<T>(value: T): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}
