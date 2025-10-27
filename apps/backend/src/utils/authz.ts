import type { Request } from 'express';
import { ApiError } from '../lib/errors.js';
import type { Role } from '../types/roles.js';

interface TenantContext {
  tenantId: string;
  userId: string;
  userRoles: Role[];
}

const ROLE_LEVEL: Record<Role, number> = {
  ADMIN: 6,
  MANAGER: 5,
  SALES_MANAGER: 5,
  FI_MANAGER: 4,
  FINANCE: 3,
  SALES: 2,
  BDC: 2,
  SERVICE: 2,
};

export function assertTenantContext(req: Request): TenantContext {
  const tenantId = req.context?.tenantId;
  const userId = req.context?.user?.id;
  const userRoles = req.context?.roles ?? [];

  if (!req.context?.user || !userId) {
    throw new ApiError('AUTHENTICATION_REQUIRED', 'Authentication is required to access this resource.', {
      status: 401,
    });
  }

  if (!tenantId) {
    throw new ApiError('TENANT_REQUIRED', 'Tenant context is required to access this resource.', {
      status: 403,
    });
  }

  return { tenantId, userId, userRoles };
}

export function assertRole(req: Request, minimumRole: Role): void {
  const { userRoles } = assertTenantContext(req);
  const minimumLevel = ROLE_LEVEL[minimumRole];

  if (typeof minimumLevel === 'undefined') {
    throw new ApiError('INVALID_ROLE', `Role ${minimumRole} is not recognized in authorization checks.`, {
      status: 500,
    });
  }

  const hasRole = userRoles.some((role) => {
    const level = ROLE_LEVEL[role];
    return typeof level === 'number' && level >= minimumLevel;
  });

  if (!hasRole) {
    throw new ApiError('INSUFFICIENT_PERMISSIONS', 'You do not have permission to perform this action.', {
      status: 403,
      details: { requiredRole: minimumRole, roles: userRoles },
    });
  }
}
