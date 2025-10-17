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

  const hasRole = useCallback(
    (role: string) => roleValue === role.toUpperCase(),
    [roleValue],
  );

  const hasAnyRole = useCallback(
    (roles: string[]) => roles.some((role) => hasRole(role)),
    [hasRole],
  );

  const hasPermission = useCallback(
    (permission: string) => permissionSet.has(permission.toLowerCase()),
    [permissionSet],
  );

  const hasAnyPermission = useCallback(
    (permissions: string[]) => permissions.some((permission) => hasPermission(permission)),
    [hasPermission],
  );

  const canAccessDeveloper = useMemo(() => {
    if (!normalizedUser) {
      return false;
    }

    if (normalizedUser.developer === true) {
      return true;
    }

    if (hasPermission('developer:access')) {
      return true;
    }

    return normalizedUser.featureFlags?.includes('developer_portal') ?? false;
  }, [hasPermission, normalizedUser]);

  return {
    user: normalizedUser,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    canAccessDeveloper,
  };
}
