import * as React from 'react';

/**
 * Role and Permission Guard components
 * Controls access based on user roles and permissions
 */

export type Role = string;
export type Permission = string;

export interface User {
  id: string;
  roles: Role[];
  permissions: Permission[];
}

interface AuthContextValue {
  user: User | null;
  hasRole: (role: Role | Role[]) => boolean;
  hasPermission: (permission: Permission | Permission[]) => boolean;
  hasAnyRole: (roles: Role[]) => boolean;
  hasAllRoles: (roles: Role[]) => boolean;
  hasAnyPermission: (permissions: Permission[]) => boolean;
  hasAllPermissions: (permissions: Permission[]) => boolean;
}

const AuthContext = React.createContext<AuthContextValue | undefined>(undefined);

/**
 * AuthProvider component
 * Provides authentication context to children
 */
export interface AuthProviderProps {
  children: React.ReactNode;
  user: User | null;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, user }) => {
  const hasRole = React.useCallback(
    (role: Role | Role[]): boolean => {
      if (!user) return false;
      const roles = Array.isArray(role) ? role : [role];
      return roles.some((r) => user.roles.includes(r));
    },
    [user]
  );

  const hasPermission = React.useCallback(
    (permission: Permission | Permission[]): boolean => {
      if (!user) return false;
      const permissions = Array.isArray(permission) ? permission : [permission];
      return permissions.some((p) => user.permissions.includes(p));
    },
    [user]
  );

  const hasAnyRole = React.useCallback(
    (roles: Role[]): boolean => {
      if (!user) return false;
      return roles.some((role) => user.roles.includes(role));
    },
    [user]
  );

  const hasAllRoles = React.useCallback(
    (roles: Role[]): boolean => {
      if (!user) return false;
      return roles.every((role) => user.roles.includes(role));
    },
    [user]
  );

  const hasAnyPermission = React.useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.some((permission) => user.permissions.includes(permission));
    },
    [user]
  );

  const hasAllPermissions = React.useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return permissions.every((permission) => user.permissions.includes(permission));
    },
    [user]
  );

  const value: AuthContextValue = {
    user,
    hasRole,
    hasPermission,
    hasAnyRole,
    hasAllRoles,
    hasAnyPermission,
    hasAllPermissions,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth hook
 * Access authentication context
 */
export function useAuth(): AuthContextValue {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

/**
 * RoleGuard component
 * Renders children only if user has the required role(s)
 */
export interface RoleGuardProps {
  role?: Role | Role[];
  anyRole?: Role[];
  allRoles?: Role[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  anyRole,
  allRoles,
  children,
  fallback = null,
}) => {
  const { hasRole, hasAnyRole, hasAllRoles } = useAuth();

  let hasAccess = true;

  if (role !== undefined) {
    hasAccess = hasAccess && hasRole(role);
  }

  if (anyRole !== undefined) {
    hasAccess = hasAccess && hasAnyRole(anyRole);
  }

  if (allRoles !== undefined) {
    hasAccess = hasAccess && hasAllRoles(allRoles);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * PermissionGate component
 * Renders children only if user has the required permission(s)
 */
export interface PermissionGateProps {
  permission?: Permission | Permission[];
  anyPermission?: Permission[];
  allPermissions?: Permission[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  anyPermission,
  allPermissions,
  children,
  fallback = null,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = useAuth();

  let hasAccess = true;

  if (permission !== undefined) {
    hasAccess = hasAccess && hasPermission(permission);
  }

  if (anyPermission !== undefined) {
    hasAccess = hasAccess && hasAnyPermission(anyPermission);
  }

  if (allPermissions !== undefined) {
    hasAccess = hasAccess && hasAllPermissions(allPermissions);
  }

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * withRoleGuard HOC
 * Wraps a component with role-based access control
 */
export function withRoleGuard<P extends object>(
  Component: React.ComponentType<P>,
  roles: Role | Role[],
  fallback?: React.ReactNode
) {
  const Wrapped: React.FC<P> = (props) => {
    const { hasRole } = useAuth();

    if (!hasRole(roles)) {
      return <>{fallback}</>;
    }

    return <Component {...props} />;
  };

  Wrapped.displayName = `withRoleGuard(${Component.displayName || Component.name})`;

  return Wrapped;
}

/**
 * withPermissionGate HOC
 * Wraps a component with permission-based access control
 */
export function withPermissionGate<P extends object>(
  Component: React.ComponentType<P>,
  permissions: Permission | Permission[],
  fallback?: React.ReactNode
) {
  const Wrapped: React.FC<P> = (props) => {
    const { hasPermission } = useAuth();

    if (!hasPermission(permissions)) {
      return <>{fallback}</>;
    }

    return <Component {...props} />;
  };

  Wrapped.displayName = `withPermissionGate(${Component.displayName || Component.name})`;

  return Wrapped;
}

/**
 * Restricted component
 * Combines role and permission checks
 */
export interface RestrictedProps {
  roles?: Role | Role[];
  permissions?: Permission | Permission[];
  requireAll?: boolean; // true = AND, false = OR
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const Restricted: React.FC<RestrictedProps> = ({
  roles,
  permissions,
  requireAll = true,
  children,
  fallback = null,
}) => {
  const { hasRole, hasPermission } = useAuth();

  const hasRoleAccess = roles !== undefined ? hasRole(roles) : true;
  const hasPermissionAccess = permissions !== undefined ? hasPermission(permissions) : true;

  const hasAccess = requireAll
    ? hasRoleAccess && hasPermissionAccess
    : hasRoleAccess || hasPermissionAccess;

  if (!hasAccess) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
