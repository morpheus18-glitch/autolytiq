import { NextFunction, Request, Response } from 'express';
import { BadRequest } from '../lib/errors.js';
import { requireTenantId, setTenantContext } from '../lib/tenant-context.js';

export function attachTenantContext(req: Request, _res: Response, next: NextFunction) {
  if (!req.user) {
    throw BadRequest('Tenant middleware requires authenticated user context');
  }

  const tenantId = req.user.isSuperAdmin
    ? req.user.impersonatedTenantId ?? req.user.tenantId
    : req.user.tenantId;

  if (!tenantId) {
    throw BadRequest('Tenant identifier is required');
  }

  req.user.tenantId = tenantId;

  setTenantContext({
    tenantId,
    impersonatedTenantId: req.user.impersonatedTenantId,
  });

  requireTenantId();
  next();
}
