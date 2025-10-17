import {
  securitySettingsSchema,
  apiKeySchema,
  apiKeyWithSecretSchema,
  webhookSchema,
  webhookInputSchema,
  paginatedAuditLogSchema,
  type SecuritySettings,
  type ApiKeyRecord,
  type ApiKeyWithSecret,
  type WebhookConfig,
  type WebhookInput,
} from '@shared/settings-schema';
import { apiRequest } from './queryClient';
import { z } from 'zod';

export async function fetchSecuritySettings(): Promise<SecuritySettings> {
  const response = await apiRequest('/api/settings/security');
  const json = (await response.json()) as unknown;
  return securitySettingsSchema.parse(json);
}

export async function updateSecuritySettings(payload: SecuritySettings): Promise<SecuritySettings> {
  const validated = securitySettingsSchema.parse(payload);
  const response = await apiRequest('PUT', '/api/settings/security', validated);
  const json = (await response.json()) as unknown;
  return securitySettingsSchema.parse(json);
}

export async function fetchApiKeys(): Promise<ApiKeyRecord[]> {
  const response = await apiRequest('/api/settings/api-keys');
  const json = (await response.json()) as unknown;
  return z.array(apiKeySchema).parse(json);
}

export async function createApiKey(name: string): Promise<ApiKeyWithSecret> {
  const response = await apiRequest('POST', '/api/settings/api-keys', { name });
  const json = (await response.json()) as unknown;
  return apiKeyWithSecretSchema.parse(json);
}

export async function revokeApiKey(id: string): Promise<void> {
  await apiRequest('DELETE', `/api/settings/api-keys/${id}`);
}

export async function createWebhook(payload: WebhookInput): Promise<WebhookConfig> {
  const validated = webhookInputSchema.parse(payload);
  const response = await apiRequest('POST', '/api/settings/security/webhooks', validated);
  const json = (await response.json()) as unknown;
  return webhookSchema.parse(json);
}

export async function updateWebhook(id: string, payload: WebhookInput): Promise<WebhookConfig> {
  const validated = webhookInputSchema.parse(payload);
  const response = await apiRequest('PUT', `/api/settings/security/webhooks/${id}`, validated);
  const json = (await response.json()) as unknown;
  return webhookSchema.parse(json);
}

export async function deleteWebhook(id: string): Promise<void> {
  await apiRequest('DELETE', `/api/settings/security/webhooks/${id}`);
}

export interface FetchAuditLogParams {
  page?: number;
  pageSize?: number;
  startDate?: string;
  endDate?: string;
  userId?: string;
  action?: string;
}

const auditParamsSchema = z.object({
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  userId: z.string().optional(),
  action: z.string().optional(),
});

export async function fetchAuditLogs(params: FetchAuditLogParams = {}) {
  const normalized = auditParamsSchema.parse({ ...params });
  const query = new URLSearchParams();

  Object.entries(normalized).forEach(([key, value]) => {
    if (!value) {
      return;
    }
    query.set(key, value);
  });

  const response = await apiRequest(`/api/settings/audit-logs?${query.toString()}`);
  const json = (await response.json()) as unknown;
  return paginatedAuditLogSchema.parse(json);
}
