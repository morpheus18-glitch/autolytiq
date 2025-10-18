import { Prisma, PrismaClient } from '@prisma/client';
import { AsyncLocalStorage } from 'node:async_hooks';

interface TenantContextValue {
  tenantId?: string;
}

const tenantStorage = new AsyncLocalStorage<TenantContextValue>();

const tenantScopedModels = new Set<Prisma.ModelName>([
  Prisma.ModelName.User,
  Prisma.ModelName.Customer,
  Prisma.ModelName.Lead,
  Prisma.ModelName.Activity,
  Prisma.ModelName.Appointment,
  Prisma.ModelName.LeadScore,
  Prisma.ModelName.Communication,
  Prisma.ModelName.EmailTemplate,
  Prisma.ModelName.SMSTemplate,
  Prisma.ModelName.Automation,
  Prisma.ModelName.AutomationExecution,
]);

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

function createPrismaClient() {
  const client = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn', 'error'] : ['warn', 'error'],
  });

  client.$use(async (params, next) => {
    const { tenantId } = withTenantGuard(params);

    if (!tenantId) {
      return next(params);
    }

    const scopedParams = applyTenantFilters(params, tenantId);
    return next(scopedParams);
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
  return tenantStorage.run({ tenantId }, callback);
}

export function getTenantId(): string | undefined {
  return tenantStorage.getStore()?.tenantId;
}

export function isTenantScoped(): boolean {
  return Boolean(getTenantId());
}
