import { QueryClient, QueryFunction } from '@tanstack/react-query';
import { API_BASE_URL } from '@/config/api';
import { getAuthToken } from './auth';

function resolveUrl(path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }
  if (path.startsWith('/')) {
    return `${API_BASE_URL}${path}`;
  }
  return `${API_BASE_URL}/${path}`;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      const text = await res.text();
      console.error('API Error Response:', text);
      let errorMessage = text || res.statusText;
      
      // Try to parse JSON error response
      try {
        const parsed = JSON.parse(text);
        errorMessage = parsed.error || parsed.message || text;
      } catch {
        // If not JSON, use the text as is
      }
      
      throw new Error(`${res.status}: ${errorMessage}`);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  methodOrUrl: string,
  urlOrOptions?: string | { method?: string; body?: unknown },
  data?: unknown | undefined,
): Promise<Response> {
  let method: string;
  let url: string;
  let body: unknown;

  // Handle both patterns: apiRequest(url, options) and apiRequest(method, url, data)
  if (typeof urlOrOptions === 'string') {
    // Pattern: apiRequest(method, url, data)
    method = methodOrUrl;
    url = urlOrOptions;
    body = data;
  } else {
    // Pattern: apiRequest(url, options)
    method = urlOrOptions?.method || 'GET';
    url = methodOrUrl;
    body = urlOrOptions?.body;
  }

  const token = getAuthToken();
  const headers: Record<string, string> = {};

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(resolveUrl(url), {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  await throwIfResNotOk(res);
  return res;
}

type UnauthorizedBehavior = 'returnNull' | 'throw';
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const requestUrl = Array.isArray(queryKey)
      ? resolveUrl(['', ...queryKey.map(String)].join('/').replace(/\/+/g, '/'))
      : resolveUrl(String(queryKey));

    const token = getAuthToken();
    const headers: Record<string, string> = {};

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(requestUrl, {
      headers,
      credentials: 'include',
    });

    if (unauthorizedBehavior === 'returnNull' && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: 'throw' }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
