import type { PermissionedUser } from '@/hooks/usePermissions';

const DEFAULT_HOME_PATH = '/dashboard';

type MaybeString = string | null | undefined;
type MaybeStringArray = Array<string | null | undefined> | null | undefined;

type AccessAware = {
  access?: {
    homePath?: string | null;
  };
};

type RoleAwareShape = Pick<PermissionedUser, 'role' | 'permissions' | 'featureFlags' | 'developer'>;

export type RoleAwareUser = (RoleAwareShape & AccessAware) | null | undefined;

function normalizeRole(role: MaybeString): string {
  if (typeof role === 'string') {
    return role.trim().toUpperCase();
  }
  return '';
}

function normalizePermissions(permissions: MaybeStringArray): string[] {
  if (!Array.isArray(permissions)) {
    return [];
  }

  return permissions
    .map((permission) => (typeof permission === 'string' ? permission.toLowerCase() : null))
    .filter((permission): permission is string => Boolean(permission));
}

function normalizeFeatureFlags(flags: MaybeStringArray): string[] {
  if (!Array.isArray(flags)) {
    return [];
  }

  return flags
    .map((flag) => (typeof flag === 'string' ? flag.toLowerCase() : null))
    .filter((flag): flag is string => Boolean(flag));
}

function roleIncludes(role: string, tokens: string[]): boolean {
  if (!role) {
    return false;
  }
  return tokens.some((token) => role.includes(token));
}

function hasPermissionPrefix(permissions: string[], prefix: string): boolean {
  return permissions.some((permission) => permission.startsWith(prefix));
}

export function getUserLandingPath(user: RoleAwareUser): string {
  if (!user) {
    return DEFAULT_HOME_PATH;
  }

  const explicitHome = user.access?.homePath;
  if (explicitHome && typeof explicitHome === 'string') {
    return explicitHome;
  }

  const normalizedRole = normalizeRole(user.role ?? null);
  const permissions = normalizePermissions(user.permissions ?? null);
  const featureFlags = normalizeFeatureFlags(user.featureFlags ?? null);

  const isSuperUser = permissions.includes('*');
  const hasDeveloperAccess =
    user.developer === true ||
    featureFlags.includes('developer_portal') ||
    hasPermissionPrefix(permissions, 'developer');

  if (hasDeveloperAccess || roleIncludes(normalizedRole, ['DEVELOPER', 'ENGINEER', 'TECHNOLOGY'])) {
    return '/ml-developer-admin';
  }

  if (
    roleIncludes(normalizedRole, ['ACCOUNT', 'FINANCE', 'CONTROLLER', 'COMPTROLLER', 'ADMIN', 'OPERATIONS']) ||
    hasPermissionPrefix(permissions, 'accounting') ||
    hasPermissionPrefix(permissions, 'finance') ||
    isSuperUser
  ) {
    return '/accounting';
  }

  if (roleIncludes(normalizedRole, ['SALES', 'BDC']) || hasPermissionPrefix(permissions, 'sales')) {
    return '/sales';
  }

  if (roleIncludes(normalizedRole, ['SERVICE']) || hasPermissionPrefix(permissions, 'service')) {
    return '/service';
  }

  if (roleIncludes(normalizedRole, ['CRM', 'CUSTOMER']) || hasPermissionPrefix(permissions, 'customers')) {
    return '/crm';
  }

  return DEFAULT_HOME_PATH;
}

export function isHomePath(pathname: string): boolean {
  return pathname === '/' || pathname === DEFAULT_HOME_PATH;
}
