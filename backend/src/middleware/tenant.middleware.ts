import { NextFunction, Request, Response } from 'express';
import { BadRequest } from '../lib/errors.js';
import { requireTenantId, setTenantContext } from '../lib/tenant-context.js';

export function tenantScope(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw BadRequest('Tenant middleware requires authenticated user context');
  }

  const headerTenantId = req.header('x-tenant-id') ?? undefined;
  const effectiveTenantId = req.user.isSuperAdmin
    ? req.user.impersonatedTenantId ?? headerTenantId ?? req.user.tenantId
    : req.user.tenantId ?? headerTenantId;

  if (!effectiveTenantId) {
    throw BadRequest('Tenant identifier is required');
  }

  if (req.user.isSuperAdmin && headerTenantId) {
    req.user.impersonatedTenantId = headerTenantId;
  }

  req.user.tenantId = effectiveTenantId;

  setTenantContext({
    tenantId: effectiveTenantId,
    impersonatedTenantId: req.user.impersonatedTenantId,
  });

  requireTenantId();
  next();
}

export const attachTenantContext = tenantScope;
