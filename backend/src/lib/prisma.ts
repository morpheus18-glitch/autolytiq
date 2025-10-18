import { Prisma, PrismaClient } from '@prisma/client';
import pino from 'pino';
import {
  getEffectiveTenantId,
  getTenantContext,
  isSuperAdmin,
  isTenantScoped as contextIsTenantScoped,
  requireTenantId,
} from './tenant-context.js';

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
  'LenderSubmission',
  'Contract',
  'FundingChecklist',
  'GLAccount',
  'JournalEntry',
  'JournalEntryLine',
  'Commission',
  'Report',
  'Notification',
  'AuditLog',
  'SystemSetting',
];

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
  process.env.NODE_ENV === 'development'
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
  return client;
}

const globalWithPrisma = globalThis as GlobalPrisma;
export const prisma = globalWithPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== 'production') {
  globalWithPrisma.prisma = prisma;
}

export function assertTenantScope() {
  if (!isSuperAdmin()) {
    requireTenantId();
  }
}

export const isTenantScoped = contextIsTenantScoped;

export default prisma;
