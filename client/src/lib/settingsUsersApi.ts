import {
  paginatedSettingsUsersSchema,
  settingsUserSchema,
  createSettingsUserSchema,
  updateSettingsUserSchema,
  type SettingsUser,
  type CreateSettingsUserInput,
  type UpdateSettingsUserInput,
} from '@shared/settings-schema';
import { apiRequest } from './queryClient';
import { z } from 'zod';

export interface FetchUsersParams {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  status?: string;
  sortBy?: 'name' | 'email' | 'role' | 'status' | 'lastLogin';
  sortOrder?: 'asc' | 'desc';
}

const userParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(10),
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  sortBy: z.enum(['name', 'email', 'role', 'status', 'lastLogin']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc'),
});

export async function fetchUsers(params: FetchUsersParams = {}) {
  const normalized = userParamsSchema.parse({ ...params });
  const query = new URLSearchParams();

  Object.entries(normalized).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    query.set(key, String(value));
  });

  const response = await apiRequest(`/api/settings/users?${query.toString()}`);
  const json = (await response.json()) as unknown;
  return paginatedSettingsUsersSchema.parse(json);
}

export async function createUser(payload: CreateSettingsUserInput): Promise<SettingsUser> {
  const validated = createSettingsUserSchema.parse(payload);
  const response = await apiRequest('POST', '/api/settings/users', validated);
  const json = (await response.json()) as unknown;
  return settingsUserSchema.parse(json);
}

export async function updateUser(userId: string, payload: UpdateSettingsUserInput): Promise<SettingsUser> {
  const validated = updateSettingsUserSchema.parse(payload);
  const response = await apiRequest('PUT', `/api/settings/users/${userId}`, validated);
  const json = (await response.json()) as unknown;
  return settingsUserSchema.parse(json);
}

export async function deactivateUser(userId: string): Promise<void> {
  await apiRequest('DELETE', `/api/settings/users/${userId}`);
}

export interface ResetPasswordResponse {
  message: string;
  temporaryPassword?: string;
}

export async function resetUserPassword(userId: string): Promise<ResetPasswordResponse> {
  const response = await apiRequest('POST', `/api/settings/users/${userId}/reset-password`);
  const json = (await response.json()) as unknown;
  return z
    .object({
      message: z.string(),
      temporaryPassword: z.string().optional(),
    })
    .parse(json);
}
