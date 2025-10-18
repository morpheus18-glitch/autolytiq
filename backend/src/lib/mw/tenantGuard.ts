import type { Request } from 'express';
import { Forbidden } from '../errors.js';

export function requireTenantIdFromRequest(req: Request): string {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    throw Forbidden('Tenant context is required for this operation');
  }
  return tenantId;
}

export function assertTenantMatch(recordTenantId: string, tenantId: string) {
  if (recordTenantId !== tenantId) {
    throw Forbidden('Cross-tenant access is not allowed');
  }
}

export function assertUserTenant(req: Request, tenantId: string) {
  const userTenantId = requireTenantIdFromRequest(req);
  if (userTenantId !== tenantId) {
    throw Forbidden('Tenant mismatch detected');
  }
}
