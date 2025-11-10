import { useCallback, useMemo } from 'react';
import { useAuth } from './useAuth';

export interface PermissionedUser {
  id: string;
  role: string;
  permissions?: string[];
  featureFlags?: string[];
  developer?: boolean;
  [key: string]: unknown;
}

interface UsePermissionsResult {
  user: PermissionedUser | undefined;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  canAccessDeveloper: boolean;
}

export function usePermissions(): UsePermissionsResult {
  const { user } = useAuth();

  const normalizedUser = user as PermissionedUser | undefined;

  const permissionSet = useMemo(() => {
    if (!normalizedUser?.permissions) {
      return new Set<string>();
    }

    return new Set(
      normalizedUser.permissions
        .filter((permission): permission is string => typeof permission === 'string')
        .map((permission) => permission.toLowerCase()),
    );
  }, [normalizedUser?.permissions]);

  const roleValue = useMemo(() => normalizedUser?.role?.toUpperCase() ?? '', [normalizedUser?.role]);

  const isSuperUser = useMemo(() => {
    if (!normalizedUser) {
      return false;
    }

    if (roleValue === 'SUPER_ADMIN' || roleValue === 'SUPERUSER') {
      return true;
    }

    return permissionSet.has('*');
  }, [normalizedUser, permissionSet, roleValue]);

  const hasRole = useCallback(
    (role: string) => isSuperUser || roleValue === role.toUpperCase(),
    [isSuperUser, roleValue],
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => roles.some((role) => hasRole(role)),
    [hasRole],
  );

  const hasPermission = useCallback(
    (permission: string) => isSuperUser || permissionSet.has(permission.toLowerCase()),
    [isSuperUser, permissionSet],
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => permissions.some((permission) => hasPermission(permission)),
    [hasPermission],
  );

  const canAccessDeveloper = useMemo(() => {
    if (!normalizedUser) {
      return false;
    }

    if (isSuperUser) {
      return true;
    }

    if (normalizedUser.developer === true) {
      return true;
    }

    if (hasPermission('developer:access')) {
      return true;
    }

    return normalizedUser.featureFlags?.includes('developer_portal') ?? false;
  }, [hasPermission, isSuperUser, normalizedUser]);

  return {
    user: normalizedUser,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccessDeveloper,
  };
}
