import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";

export interface AuthTokens {
  realtime: string | null;
}

export interface AuthStore {
  id: string;
  code: string;
  name: string;
  timezone: string;
}

export interface AuthAccess {
  homePath?: string;
  allowedRoutes: string[];
  navigationSections: string[];
  quickActions: string[];
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
  store: AuthStore;
  access: AuthAccess;
  tokens?: AuthTokens;
}

export function useAuth() {
  const { data, isLoading, error } = useQuery<AuthUser | null>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn<AuthUser | null>({ on401: "returnNull" }),
    retry: false,
  });

  // If there's an error (e.g., network failure), treat as not authenticated
  // This prevents infinite loading when backend is unavailable
  const isLoadingWithTimeout = isLoading && !error;

  return {
    user: data ?? undefined,
    isLoading: isLoadingWithTimeout,
    isAuthenticated: Boolean(data),
    error,
  };
}