import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export interface AuthTokens {
  realtime: string | null;
}

export interface AuthAccess {
  homePath?: string;
  allowedRoutes: string[];
  navigationSections: string[];
  quickActions: string[];
}

export interface AuthTenant {
  id: string;
  name: string;
  subdomain: string;
}

export interface AuthUser {
  id: string;
  userId: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  featureFlags: string[];
  tenantId: string;
  tenant: AuthTenant;
  access: AuthAccess;
  tokens?: AuthTokens;
}

export function useAuth() {
  const { data, isLoading } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn<AuthUser | null>({ on401: "returnNull" }),
    retry: false,
  });

  return {
    user: data ?? undefined,
    isLoading,
    isAuthenticated: Boolean(data),
  };
}