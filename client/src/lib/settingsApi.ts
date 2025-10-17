import { type ZodSchema } from 'zod';
import { apiRequest } from './queryClient';

export async function fetchSettingsSection<T>(
  endpoint: string,
  schema: ZodSchema<T>,
  fallback: T,
): Promise<T> {
  try {
    const response = await apiRequest(`/api/settings/${endpoint}`);
    const data = (await response.json()) as unknown;
    const parsed = schema.safeParse(data);
    if (parsed.success) {
      return parsed.data;
    }
    return fallback;
  } catch (error) {
    console.warn(`Failed to load settings from ${endpoint}:`, error);
    return fallback;
  }
}

export async function updateSettingsSection<T>(
  endpoint: string,
  schema: ZodSchema<T>,
  payload: T,
): Promise<T> {
  const response = await apiRequest('PUT', `/api/settings/${endpoint}`, payload);
  const data = response.headers.get('Content-Type')?.includes('application/json')
    ? ((await response.json()) as unknown)
    : payload;
  const parsed = schema.safeParse(data);
  if (parsed.success) {
    return parsed.data;
  }
  return payload;
}
