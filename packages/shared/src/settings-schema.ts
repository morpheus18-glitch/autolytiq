// Settings schema types for system configuration
import { z } from 'zod';

export interface SystemSettings {
  id: string;
  tenantId: string;
  category: SettingCategory;
  key: string;
  value: string;
  type: SettingType;
  isEncrypted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SettingCategory {
  GENERAL = 'GENERAL',
  SECURITY = 'SECURITY',
  INTEGRATION = 'INTEGRATION',
  NOTIFICATION = 'NOTIFICATION',
  BILLING = 'BILLING',
  CUSTOM = 'CUSTOM',
}

export enum SettingType {
  STRING = 'STRING',
  NUMBER = 'NUMBER',
  BOOLEAN = 'BOOLEAN',
  JSON = 'JSON',
}

// Security settings
export interface SecuritySettings {
  twoFactorEnabled: boolean;
  sessionTimeout: number;
  passwordPolicy: PasswordPolicy;
  ipWhitelist: string[];
  apiRateLimits: ApiRateLimits;
}

export interface PasswordPolicy {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
  expiryDays: number;
}

export interface ApiRateLimits {
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
}

// User settings
export interface UserSettings {
  id: string;
  userId: string;
  tenantId: string;
  notifications: NotificationPreferences;
  display: DisplayPreferences;
  privacy: PrivacyPreferences;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  push: boolean;
  inApp: boolean;
  frequency: 'realtime' | 'hourly' | 'daily' | 'weekly';
}

export interface DisplayPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  timezone: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
}

export interface PrivacyPreferences {
  profileVisibility: 'public' | 'private' | 'team';
  showEmail: boolean;
  showPhone: boolean;
  allowAnalytics: boolean;
}

// Integration settings
export interface IntegrationSettings {
  id: string;
  tenantId: string;
  type: IntegrationType;
  name: string;
  config: Record<string, any>;
  isActive: boolean;
  credentials: Record<string, any>;
  lastSync: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum IntegrationType {
  CRM = 'CRM',
  ACCOUNTING = 'ACCOUNTING',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PAYMENT = 'PAYMENT',
  DMS = 'DMS',
  CREDIT_BUREAU = 'CREDIT_BUREAU',
  CUSTOM = 'CUSTOM',
}

// Zod schemas for validation
export const passwordPolicySchema = z.object({
  minLength: z.number(),
  requireUppercase: z.boolean(),
  requireLowercase: z.boolean(),
  requireNumbers: z.boolean(),
  requireSpecialChars: z.boolean(),
  expiryDays: z.number(),
});

export const apiRateLimitsSchema = z.object({
  requestsPerMinute: z.number(),
  requestsPerHour: z.number(),
  requestsPerDay: z.number(),
});

export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean(),
  sessionTimeout: z.number(),
  passwordPolicy: passwordPolicySchema,
  ipWhitelist: z.array(z.string()),
  apiRateLimits: apiRateLimitsSchema,
});

export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  createdAt: z.date(),
  lastUsed: z.date().nullable(),
});

export type ApiKeyRecord = z.infer<typeof apiKeySchema>;

export const apiKeyWithSecretSchema = z.object({
  id: z.string(),
  name: z.string(),
  key: z.string(),
  secret: z.string(),
  createdAt: z.date(),
});

export type ApiKeyWithSecret = z.infer<typeof apiKeyWithSecretSchema>;

export const webhookInputSchema = z.object({
  url: z.string().url(),
  events: z.array(z.string()),
  isActive: z.boolean().default(true),
  secret: z.string().optional(),
});

export type WebhookInput = z.infer<typeof webhookInputSchema>;

export const webhookSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  events: z.array(z.string()),
  isActive: z.boolean(),
  secret: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type WebhookConfig = z.infer<typeof webhookSchema>;

export const auditLogSchema = z.object({
  id: z.string(),
  userId: z.string(),
  action: z.string(),
  entityType: z.string().optional(),
  entityId: z.string().optional(),
  changes: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
  createdAt: z.date(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

export const paginatedAuditLogSchema = z.object({
  logs: z.array(auditLogSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export type PaginatedAuditLog = z.infer<typeof paginatedAuditLogSchema>;
