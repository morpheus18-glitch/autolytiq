import type { Prisma } from '@prisma/client';
import { getTenantIdFromContext } from './tenant-context.js';

const TENANTED_MODELS = new Set<Prisma.ModelName>([
  'User',
  'Customer',
  'CustomerInteraction',
  'CustomerVehicle',
  'Vehicle',
  'VehicleHistory',
  'Deal',
  'DealDocument',
  'GLAccount',
  'JournalEntry',
  'JournalEntryLine',
  'Commission',
  'Report',
  'Notification',
  'AuditLog',
  'SystemSetting',
]);

function shouldFilterByTenant(model?: Prisma.ModelName): boolean {
  return model !== undefined && TENANTED_MODELS.has(model);
}

function mergeWhereClause(where: Prisma.MiddlewareParams['args']['where'], tenantId: string) {
  if (!where || Object.keys(where).length === 0) {
    return { tenantId };
  }

  return {
    AND: [where, { tenantId }],
  };
}

function ensureTenantOnData(data: any, tenantId: string) {
  if (!data) return;
  if (Array.isArray(data)) {
    data.forEach((entry) => {
      if (entry && typeof entry === 'object' && !entry.tenantId) {
        entry.tenantId = tenantId;
      }
    });
    return;
  }

  if (!data.tenantId) {
    data.tenantId = tenantId;
  }
}

export function tenantIsolationMiddleware(): Prisma.Middleware {
  return async (params, next) => {
    if (!shouldFilterByTenant(params.model)) {
      return next(params);
    }

    if (!params.args) {
      params.args = {};
    }

    const tenantId = getTenantIdFromContext();

    if (!tenantId) {
      throw new Error(`Tenant context is required for ${params.model} operations.`);
    }

    switch (params.action) {
      case 'create':
        ensureTenantOnData(params.args.data, tenantId);
        break;
      case 'createMany':
        ensureTenantOnData(params.args.data, tenantId);
        break;
      case 'upsert':
        params.args.where = mergeWhereClause(params.args.where, tenantId);
        ensureTenantOnData(params.args.create, tenantId);
        ensureTenantOnData(params.args.update, tenantId);
        break;
      case 'update':
      case 'updateMany':
      case 'delete':
      case 'deleteMany':
      case 'findFirst':
      case 'findMany':
      case 'aggregate':
      case 'count':
      case 'groupBy':
        params.args.where = mergeWhereClause(params.args.where, tenantId);
        break;
      case 'findUnique':
        params.action = 'findFirst';
        params.args.where = mergeWhereClause(params.args.where, tenantId);
        break;
      default:
        break;
    }

    return next(params);
  };
}

export { shouldFilterByTenant };
