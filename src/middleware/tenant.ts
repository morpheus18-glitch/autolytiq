import type { RequestHandler } from 'express';
import { tenantContext } from '../lib/prisma.js';

const TENANT_HEADER = 'x-tenant-id';

export const tenantScope: RequestHandler = (req, res, next) => {
  const headerTenant = req.get(TENANT_HEADER) ?? req.get(TENANT_HEADER.toUpperCase());
  const tenantId = req.context?.user?.tenantId ?? headerTenant ?? req.context?.tenantId;

  if (!tenantId) {
    return res.status(403).json({ message: 'Tenant scope is required' });
  }

  req.context = {
    ...req.context,
    tenantId,
  };

  tenantContext.run({ tenantId }, () => {
    next();
  });
};
