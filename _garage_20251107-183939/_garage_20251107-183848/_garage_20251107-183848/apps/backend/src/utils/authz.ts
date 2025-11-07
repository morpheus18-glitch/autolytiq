import type { Request } from 'express';
import { ApiError } from '../lib/errors';
import type { Role } from '../types/roles';

interface TenantContext {
  tenantId: string;
  userId: string;
  userRoles: Role[];
  permissions: string[];
  isSuperAdmin: boolean;
}

export function assertTenantContext(req: Request): TenantContext {
  const tenantId = req.context?.tenantId;
  const userId = req.context?.user?.id;
  const userRoles = req.context?.roles ?? [];
  const permissions = req.context?.permissions ?? [];
  const isSuperAdmin = req.context?.isSuperAdmin ?? false;

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

  return { tenantId, userId, userRoles, permissions, isSuperAdmin };
}

/**
 * Check if the user has a specific permission
 */
export function hasPermission(req: Request, permission: string): boolean {
  const context = assertTenantContext(req);

  // Super admin has all permissions
  if (context.isSuperAdmin) {
    return true;
  }

  // Check for wildcard permission
  if (context.permissions.includes('*')) {
    return true;
  }

  // Check for specific permission
  if (context.permissions.includes(permission)) {
    return true;
  }

  // Check for wildcard category permission (e.g., "deals.*" grants "deals.view", "deals.create", etc.)
  const [category] = permission.split('.');
  if (category && context.permissions.includes(`${category}.*`)) {
    return true;
  }

  return false;
}

/**
 * Check if the user has any of the specified permissions
 */
export function hasAnyPermission(req: Request, permissions: string[]): boolean {
  return permissions.some((permission) => hasPermission(req, permission));
}

/**
 * Check if the user has all of the specified permissions
 */
export function hasAllPermissions(req: Request, permissions: string[]): boolean {
  return permissions.every((permission) => hasPermission(req, permission));
}

/**
 * Assert that the user has a specific permission
 * @throws ApiError if permission is not granted
 */
export function assertPermission(req: Request, permission: string): void {
  if (!hasPermission(req, permission)) {
    throw new ApiError('INSUFFICIENT_PERMISSIONS', 'You do not have permission to perform this action.', {
      status: 403,
      details: { requiredPermission: permission },
    });
  }
}

/**
 * Assert that the user has any of the specified permissions
 * @throws ApiError if none of the permissions are granted
 */
export function assertAnyPermission(req: Request, permissions: string[]): void {
  if (!hasAnyPermission(req, permissions)) {
    throw new ApiError('INSUFFICIENT_PERMISSIONS', 'You do not have permission to perform this action.', {
      status: 403,
      details: { requiredPermissions: permissions },
    });
  }
}

/**
 * Assert that the user has all of the specified permissions
 * @throws ApiError if any permission is missing
 */
export function assertAllPermissions(req: Request, permissions: string[]): void {
  if (!hasAllPermissions(req, permissions)) {
    throw new ApiError('INSUFFICIENT_PERMISSIONS', 'You do not have permission to perform this action.', {
      status: 403,
      details: { requiredPermissions: permissions },
    });
  }
}

/**
 * Legacy role-based check (deprecated - use permission-based checks instead)
 * @deprecated Use assertPermission or assertAnyPermission instead
 */
export function assertRole(req: Request, minimumRole: Role): void {
  const { userRoles, isSuperAdmin } = assertTenantContext(req);

  // Super admin bypasses role checks
  if (isSuperAdmin) {
    return;
  }

  // Map roles to permissions for backward compatibility
  const ROLE_PERMISSIONS: Record<Role, string[]> = {
    ADMIN: ['*'],
    MANAGER: ['*'],
    SALES_MANAGER: ['deals.*', 'leads.*', 'customers.*', 'inventory.view'],
    FI_MANAGER: ['finance.*', 'deals.viewPricing', 'deals.editPricing'],
    FINANCE: ['finance.view', 'deals.viewPricing'],
    SALES: ['deals.view', 'leads.view', 'customers.view'],
    BDC: ['leads.*', 'customers.view'],
    SERVICE: ['service.*'],
  };

  const requiredPermissions = ROLE_PERMISSIONS[minimumRole] || [];

  // Check if user's role grants the required permissions
  const hasRolePermissions = userRoles.some((role) => {
    const rolePerms = ROLE_PERMISSIONS[role] || [];
    return rolePerms.includes('*') ||
           requiredPermissions.some((reqPerm) => rolePerms.includes(reqPerm));
  });

  if (!hasRolePermissions) {
    throw new ApiError('INSUFFICIENT_PERMISSIONS', 'You do not have permission to perform this action.', {
      status: 403,
      details: { requiredRole: minimumRole, roles: userRoles },
    });
  }
}
