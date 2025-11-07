/**
 * RBAC Effective Permissions System
 *
 * Implements a flexible permission system with:
 * - Role-based default permissions
 * - User-specific overrides (grants + denies)
 * - Deny priority over allow
 * - Simple permission checking API
 */

export interface RbacRole {
  id: string;
  name: string;
  permissions: string[];
}

export interface RbacUser {
  id: string;
  roleIds: string[];
}

export interface PermissionGrant {
  userId: string;
  permission: string;
  granted: boolean; // true = grant, false = deny
  reason?: string;
  grantedBy?: string;
  grantedAt?: Date;
}

export interface EffectivePermissions {
  userId: string;
  roleIds: string[];
  permissions: Set<string>;
  denials: Set<string>;
}

/**
 * Build effective permissions for a user
 *
 * Priority order:
 * 1. Explicit denials (highest priority)
 * 2. Explicit grants
 * 3. Role defaults (lowest priority)
 *
 * @param user User object with roleIds
 * @param roles Array of all roles
 * @param grants Array of user-specific permission grants/denials
 * @returns EffectivePermissions object
 */
export function buildEffectivePermissions(
  user: RbacUser,
  roles: RbacRole[],
  grants: PermissionGrant[]
): EffectivePermissions {
  const effective: EffectivePermissions = {
    userId: user.id,
    roleIds: user.roleIds,
    permissions: new Set(),
    denials: new Set(),
  };

  // Step 1: Collect role-based permissions (lowest priority)
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  for (const roleId of user.roleIds) {
    const role = roleMap.get(roleId);
    if (role) {
      role.permissions.forEach((perm) => effective.permissions.add(perm));
    }
  }

  // Step 2: Apply user-specific grants and denials
  const userGrants = grants.filter((g) => g.userId === user.id);
  for (const grant of userGrants) {
    if (grant.granted) {
      // Explicit grant - add to permissions
      effective.permissions.add(grant.permission);
    } else {
      // Explicit denial - add to denials and remove from permissions
      effective.denials.add(grant.permission);
      effective.permissions.delete(grant.permission);
    }
  }

  return effective;
}

/**
 * Create a permission checker function
 *
 * @param effective EffectivePermissions object
 * @returns Function that checks if user has a permission
 */
export function makePermChecker(effective: EffectivePermissions): (permission: string) => boolean {
  return (permission: string): boolean => {
    // Denials take absolute priority
    if (effective.denials.has(permission)) {
      return false;
    }
    // Check if user has the permission
    return effective.permissions.has(permission);
  };
}

/**
 * Check if user has any of the specified permissions
 *
 * @param effective EffectivePermissions object
 * @param permissions Array of permissions to check
 * @returns true if user has at least one permission
 */
export function hasAnyPermission(effective: EffectivePermissions, permissions: string[]): boolean {
  const can = makePermChecker(effective);
  return permissions.some((perm) => can(perm));
}

/**
 * Check if user has all of the specified permissions
 *
 * @param effective EffectivePermissions object
 * @param permissions Array of permissions to check
 * @returns true if user has all permissions
 */
export function hasAllPermissions(effective: EffectivePermissions, permissions: string[]): boolean {
  const can = makePermChecker(effective);
  return permissions.every((perm) => can(perm));
}

/**
 * Get all permissions user does NOT have
 *
 * @param effective EffectivePermissions object
 * @param requestedPermissions Array of permissions to check
 * @returns Array of missing permissions
 */
export function getMissingPermissions(
  effective: EffectivePermissions,
  requestedPermissions: string[]
): string[] {
  const can = makePermChecker(effective);
  return requestedPermissions.filter((perm) => !can(perm));
}

/**
 * Serialize effective permissions to JSON (for caching)
 *
 * @param effective EffectivePermissions object
 * @returns JSON-serializable object
 */
export function serializePermissions(effective: EffectivePermissions): {
  userId: string;
  roleIds: string[];
  permissions: string[];
  denials: string[];
} {
  return {
    userId: effective.userId,
    roleIds: effective.roleIds,
    permissions: Array.from(effective.permissions),
    denials: Array.from(effective.denials),
  };
}

/**
 * Deserialize effective permissions from JSON
 *
 * @param data Serialized permissions
 * @returns EffectivePermissions object
 */
export function deserializePermissions(data: {
  userId: string;
  roleIds: string[];
  permissions: string[];
  denials: string[];
}): EffectivePermissions {
  return {
    userId: data.userId,
    roleIds: data.roleIds,
    permissions: new Set(data.permissions),
    denials: new Set(data.denials),
  };
}

/**
 * Common permission constants
 */
export const Permissions = {
  // Customer PII
  VIEW_CUSTOMER_PII: 'VIEW_CUSTOMER_PII',
  EDIT_CUSTOMER_PII: 'EDIT_CUSTOMER_PII',
  EXPORT_CUSTOMER_PII: 'EXPORT_CUSTOMER_PII',

  // Deals
  VIEW_DEAL: 'VIEW_DEAL',
  CREATE_DEAL: 'CREATE_DEAL',
  EDIT_DEAL: 'EDIT_DEAL',
  DELETE_DEAL: 'DELETE_DEAL',
  APPROVE_DEAL: 'APPROVE_DEAL',
  VIEW_DEAL_COST: 'VIEW_DEAL_COST',
  VIEW_DEAL_MARGIN: 'VIEW_DEAL_MARGIN',

  // Leads
  VIEW_LEAD: 'VIEW_LEAD',
  CREATE_LEAD: 'CREATE_LEAD',
  EDIT_LEAD: 'EDIT_LEAD',
  ASSIGN_LEAD: 'ASSIGN_LEAD',

  // Inventory
  VIEW_INVENTORY: 'VIEW_INVENTORY',
  EDIT_INVENTORY: 'EDIT_INVENTORY',
  VIEW_INVENTORY_COST: 'VIEW_INVENTORY_COST',
  PRICE_VEHICLE: 'PRICE_VEHICLE',

  // Analytics
  VIEW_ANALYTICS: 'VIEW_ANALYTICS',
  VIEW_TEAM_PERFORMANCE: 'VIEW_TEAM_PERFORMANCE',
  VIEW_FINANCIAL_REPORTS: 'VIEW_FINANCIAL_REPORTS',

  // Administration
  MANAGE_USERS: 'MANAGE_USERS',
  MANAGE_ROLES: 'MANAGE_ROLES',
  VIEW_AUDIT_LOG: 'VIEW_AUDIT_LOG',
  MANAGE_SETTINGS: 'MANAGE_SETTINGS',

  // Insights
  VIEW_INSIGHTS: 'VIEW_INSIGHTS',
  CREATE_INSIGHTS: 'CREATE_INSIGHTS',
  CLAIM_INSIGHTS: 'CLAIM_INSIGHTS',
  RESOLVE_INSIGHTS: 'RESOLVE_INSIGHTS',

  // Widgets/Dashboard
  CUSTOMIZE_DASHBOARD: 'CUSTOMIZE_DASHBOARD',
  VIEW_SYSTEM_HEALTH: 'VIEW_SYSTEM_HEALTH',
} as const;

/**
 * Role permission presets
 */
export const RolePresets: Record<string, string[]> = {
  SALESPERSON: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.CREATE_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.VIEW_LEAD,
    Permissions.CREATE_LEAD,
    Permissions.EDIT_LEAD,
    Permissions.VIEW_INVENTORY,
    Permissions.VIEW_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD,
  ],

  SALES_MANAGER: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.CREATE_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.APPROVE_DEAL,
    Permissions.VIEW_DEAL_COST,
    Permissions.VIEW_DEAL_MARGIN,
    Permissions.VIEW_LEAD,
    Permissions.CREATE_LEAD,
    Permissions.EDIT_LEAD,
    Permissions.ASSIGN_LEAD,
    Permissions.VIEW_INVENTORY,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_TEAM_PERFORMANCE,
    Permissions.VIEW_INSIGHTS,
    Permissions.CREATE_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.RESOLVE_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD,
  ],

  FINANCE_MANAGER: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.EDIT_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.APPROVE_DEAL,
    Permissions.VIEW_DEAL_COST,
    Permissions.VIEW_DEAL_MARGIN,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_FINANCIAL_REPORTS,
    Permissions.VIEW_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.RESOLVE_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD,
  ],

  GM: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.EDIT_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.CREATE_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.DELETE_DEAL,
    Permissions.APPROVE_DEAL,
    Permissions.VIEW_DEAL_COST,
    Permissions.VIEW_DEAL_MARGIN,
    Permissions.VIEW_LEAD,
    Permissions.ASSIGN_LEAD,
    Permissions.VIEW_INVENTORY,
    Permissions.EDIT_INVENTORY,
    Permissions.VIEW_INVENTORY_COST,
    Permissions.PRICE_VEHICLE,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_TEAM_PERFORMANCE,
    Permissions.VIEW_FINANCIAL_REPORTS,
    Permissions.MANAGE_USERS,
    Permissions.VIEW_INSIGHTS,
    Permissions.CREATE_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.RESOLVE_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD,
    Permissions.VIEW_SYSTEM_HEALTH,
  ],

  ADMIN: [
    // All permissions
    ...Object.values(Permissions),
  ],
};
