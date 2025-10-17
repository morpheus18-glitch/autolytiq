import { PrismaClient, Prisma, TenantStatus } from '@prisma/client';
import bcrypt from 'bcrypt';
import { randomBytes, randomUUID, createHash } from 'crypto';
import { BadRequest, NotFound } from '../lib/errors.js';
import {
  analyticsSettingsSchema,
  backupSettingsSchema,
  brandingSchema,
  customEventSchema,
  dataSettingsSchema,
  dealershipSettingsSchema,
  featureFlagSchema,
  integrationSchema,
  notificationsSchema,
  pricingRulesSchema,
  scheduledReportSchema,
  securitySettingsSchema,
  templateSchema,
  userSchema,
} from '../validations/settings.validation.js';
import type { z } from 'zod';

const prisma = new PrismaClient();

type DealershipSettings = z.infer<typeof dealershipSettingsSchema>;
type PricingRules = z.infer<typeof pricingRulesSchema>;
type NotificationSettings = z.infer<typeof notificationsSchema>;
type BrandingSettings = z.infer<typeof brandingSchema>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;
type IntegrationSettings = z.infer<typeof integrationSchema>;
type BackupSettings = z.infer<typeof backupSettingsSchema>;
type DataSettings = z.infer<typeof dataSettingsSchema>;
type AnalyticsSettings = z.infer<typeof analyticsSettingsSchema>;
type TemplateDefinition = z.infer<typeof templateSchema>;
type CustomEventDefinition = z.infer<typeof customEventSchema>;
type ScheduledReportDefinition = z.infer<typeof scheduledReportSchema>;
type FeatureFlagDefinition = z.infer<typeof featureFlagSchema>;
type UserInput = z.infer<typeof userSchema>;

type ApiKeyRecord = {
  id: string;
  label: string;
  hash: string;
  createdAt: string;
  lastUsedAt: string | null;
};

type ExportJobRecord = {
  id: string;
  type: 'EXPORT' | 'IMPORT' | 'BACKUP' | 'RESTORE';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  metadata?: Record<string, unknown>;
};

function toJsonValue<T>(value: T): Prisma.InputJsonValue {
  const normalized = value === undefined ? null : value;
  return JSON.parse(JSON.stringify(normalized)) as Prisma.InputJsonValue;
}

async function getSetting<T>(tenantId: string, key: string, fallback: T): Promise<T> {
  const record = await prisma.systemSetting.findFirst({ where: { tenantId, key } });
  return ((record?.value as T) ?? fallback) as T;
}

async function upsertSetting<T>(tenantId: string, key: string, value: T, userId: string): Promise<T> {
  const payload = toJsonValue(value);
  await prisma.systemSetting.upsert({
    where: { tenantId_key: { tenantId, key } },
    update: { value: payload, updatedBy: userId, updatedAt: new Date() },
    create: { tenantId, key, value: payload, updatedBy: userId },
  });
  return value;
}

function sanitizeUserUpdate(data: Partial<UserInput>): Prisma.UserUpdateInput {
  const sanitized: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (value !== undefined) {
      sanitized[key] = value;
    }
  }
  if (sanitized.permissions) {
    sanitized.permissions = sanitized.permissions as Record<string, unknown>;
  }
  if (sanitized.phone === undefined) {
    delete sanitized.phone;
  }
  return sanitized as Prisma.UserUpdateInput;
}

export function logAudit(tenantId: string, userId: string, action: string, resource: string, details?: unknown, ipAddress?: string) {
  const auditData: Parameters<typeof prisma.auditLog.create>[0]['data'] = {
    tenantId,
    userId,
    action,
    resource,
    ipAddress,
  };
  if (details !== undefined) {
    auditData.details = toJsonValue(details);
  }
  return prisma.auditLog.create({ data: auditData });
}

// Dealership Settings
const defaultDealershipSettings: DealershipSettings = {
  businessName: '',
  address: {},
  phone: '(000) 000-0000',
  email: '',
  website: undefined,
  taxId: '00-0000000',
  dealerLicense: undefined,
  businessHours: {},
  docFee: 0,
  registrationFee: 0,
  salesTaxRate: 0,
  logoUrl: undefined,
};

export function getDealershipSettings(tenantId: string) {
  return getSetting<DealershipSettings>(tenantId, 'dealership_info', defaultDealershipSettings);
}

export function updateDealershipSettings(tenantId: string, data: DealershipSettings, userId: string) {
  return upsertSetting(tenantId, 'dealership_info', data, userId);
}

// Pricing Rules
const defaultPricingRules: PricingRules = {
  aiPricingEnabled: true,
  pricingStrategy: 'MARKET_COMPETITIVE',
  aiAdjustmentRange: { min: -10, max: 10 },
  marginRules: { newVehicles: 2000, usedVehicles: 1500, cpo: 1800 },
  dealPack: 500,
  fiMinimum: 800,
  agingDiscounts: { days30: 2, days60: 5, days90: 8, days120Plus: 12 },
  approvalThresholds: { frontGross: 1000, fiGross: 500 },
};

export function getPricingRules(tenantId: string) {
  return getSetting<PricingRules>(tenantId, 'pricing_rules', defaultPricingRules);
}

export function updatePricingRules(tenantId: string, data: PricingRules, userId: string) {
  return upsertSetting(tenantId, 'pricing_rules', data, userId);
}

// Users
export async function listUsers(
  tenantId: string,
  {
    skip,
    take,
    search,
    role,
  }: {
    skip: number;
    take: number;
    search?: string;
    role?: string;
  },
) {
  const where: Prisma.UserWhereInput = { tenantId };
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  if (role) {
    where.role = role as Prisma.UserWhereInput['role'];
  }
  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        status: true,
        lastLoginAt: true,
        createdAt: true,
        permissions: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
  return { items, total };
}

export async function createUser(tenantId: string, data: UserInput) {
  if (!data.password) {
    throw BadRequest('Password required');
  }
  const existing = await prisma.user.findFirst({ where: { tenantId, email: data.email } });
  if (existing) {
    throw BadRequest('Email already exists');
  }
  const passwordHash = await bcrypt.hash(data.password, 10);
  const created = await prisma.user.create({
    data: {
      tenantId,
      email: data.email,
      password: passwordHash,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone ?? null,
      role: data.role,
      status: data.status ?? 'ACTIVE',
      permissions: data.permissions ?? {},
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
      permissions: true,
    },
  });
  return created;
}

export async function updateUser(tenantId: string, id: string, data: Partial<UserInput>) {
  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) {
    throw NotFound('User not found');
  }
  const update: Prisma.UserUpdateInput = sanitizeUserUpdate(data);
  if (data.password) {
    update.password = await bcrypt.hash(data.password, 10);
  }
  if (data.status) {
    update.status = data.status;
  }
  const updated = await prisma.user.update({
    where: { id },
    data: update,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      role: true,
      status: true,
      permissions: true,
      updatedAt: true,
    },
  });
  return updated;
}

export async function deactivateUser(tenantId: string, id: string) {
  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) {
    throw NotFound('User not found');
  }
  return prisma.user.update({
    where: { id },
    data: { status: 'INACTIVE' },
    select: {
      id: true,
      status: true,
    },
  });
}

export async function resetUserPassword(tenantId: string, id: string, temporaryPassword: string, performedBy: string) {
  const user = await prisma.user.findFirst({ where: { id, tenantId } });
  if (!user) {
    throw NotFound('User not found');
  }
  const passwordHash = await bcrypt.hash(temporaryPassword, 10);
  await prisma.user.update({ where: { id }, data: { password: passwordHash, status: 'ACTIVE' } });
  await logAudit(tenantId, performedBy, 'RESET_USER_PASSWORD', 'user', { id }, undefined);
  return { id, temporaryPassword };
}

// Template helpers
const defaultTemplates: TemplateDefinition[] = [];

export async function listTemplates(tenantId: string) {
  return getSetting<TemplateDefinition[]>(tenantId, 'templates', defaultTemplates);
}

export async function upsertTemplate(tenantId: string, templateId: string, data: Partial<TemplateDefinition>, userId: string) {
  const templates = await listTemplates(tenantId);
  const now = new Date().toISOString();
  const existingIndex = templates.findIndex((tpl) => tpl.id === templateId);
  const updatedTemplate: TemplateDefinition = {
    id: templateId,
    name: data.name ?? `Template ${templateId}`,
    type: data.type ?? 'EMAIL',
    subject: data.subject,
    body: data.body ?? '',
    updatedAt: now,
  };
  if (existingIndex >= 0) {
    templates[existingIndex] = { ...templates[existingIndex], ...updatedTemplate, updatedAt: now };
  } else {
    templates.push(updatedTemplate);
  }
  await upsertSetting(tenantId, 'templates', templates, userId);
  return updatedTemplate;
}

export async function renderTemplatePreview(_tenantId: string, data: { body: string; variables?: Record<string, string> }) {
  const variables = data.variables ?? {};
  let rendered = data.body;
  for (const [key, value] of Object.entries(variables)) {
    rendered = rendered.replaceAll(`{{${key}}}`, value);
  }
  return { preview: rendered };
}

export async function sendTemplateTest(_tenantId: string, _templateId: string, payload: { channel: string; target: string }) {
  return {
    status: 'queued',
    channel: payload.channel,
    target: payload.target,
    queuedAt: new Date().toISOString(),
  };
}

// Notifications
const defaultNotificationSettings: NotificationSettings = {
  email: { enabled: true, senderName: '', senderEmail: '' },
  sms: { enabled: false, provider: '', fromNumber: undefined },
  alerts: [],
};

export function getNotificationSettings(tenantId: string) {
  return getSetting<NotificationSettings>(tenantId, 'notification_settings', defaultNotificationSettings);
}

export function updateNotificationSettings(tenantId: string, data: NotificationSettings, userId: string) {
  return upsertSetting(tenantId, 'notification_settings', data, userId);
}

// Branding
const defaultBrandingSettings: BrandingSettings = {
  primaryColor: '#000000',
  secondaryColor: '#FFFFFF',
  accentColor: '#FF9900',
  logoUrl: undefined,
  faviconUrl: undefined,
  typography: { headingFont: 'Inter', bodyFont: 'Inter' },
};

export function getBrandingSettings(tenantId: string) {
  return getSetting<BrandingSettings>(tenantId, 'branding_settings', defaultBrandingSettings);
}

export function updateBrandingSettings(tenantId: string, data: BrandingSettings, userId: string) {
  return upsertSetting(tenantId, 'branding_settings', data, userId);
}

export async function saveBrandAsset(tenantId: string, _buffer: Buffer | undefined, filename: string, userId: string) {
  const url = `https://cdn.autolytiq.local/${tenantId}/branding/${filename}`;
  const branding = await getBrandingSettings(tenantId);
  const updated = { ...branding, logoUrl: url } as BrandingSettings;
  await upsertSetting(tenantId, 'branding_settings', updated, userId);
  return { url };
}

export async function deleteBrandAsset(tenantId: string, assetType: string, userId: string) {
  const branding = await getBrandingSettings(tenantId);
  if (assetType === 'logo') {
    branding.logoUrl = undefined;
  }
  if (assetType === 'favicon') {
    branding.faviconUrl = undefined;
  }
  await upsertSetting(tenantId, 'branding_settings', branding, userId);
}

// Security
const defaultSecuritySettings: SecuritySettings = {
  mfaRequired: false,
  passwordRotationDays: 90,
  sessionTimeoutMinutes: 30,
  allowedIpRanges: [],
  blockedCountries: [],
};

export function getSecuritySettings(tenantId: string) {
  return getSetting<SecuritySettings>(tenantId, 'security_settings', defaultSecuritySettings);
}

export function updateSecuritySettings(tenantId: string, data: SecuritySettings, userId: string) {
  return upsertSetting(tenantId, 'security_settings', data, userId);
}

export async function listApiKeys(tenantId: string) {
  const keys = await getSetting<ApiKeyRecord[]>(tenantId, 'api_keys', []);
  return keys.map(({ hash, ...rest }) => rest);
}

export async function createApiKey(tenantId: string, label: string, userId: string) {
  const keys = await getSetting<ApiKeyRecord[]>(tenantId, 'api_keys', []);
  const secret = `ak_${randomBytes(24).toString('base64url')}`;
  const id = randomUUID();
  const createdAt = new Date().toISOString();
  const hash = createHash('sha256').update(secret).digest('hex');
  keys.push({ id, label, createdAt, lastUsedAt: null, hash });
  await upsertSetting(tenantId, 'api_keys', keys, userId);
  return { id, label, createdAt, lastUsedAt: null, secret };
}

export async function deleteApiKey(tenantId: string, apiKeyId: string, userId: string) {
  const keys = await getSetting<ApiKeyRecord[]>(tenantId, 'api_keys', []);
  const filtered = keys.filter((key) => key.id !== apiKeyId);
  if (filtered.length === keys.length) {
    throw NotFound('API key not found');
  }
  await upsertSetting(tenantId, 'api_keys', filtered, userId);
}

// Audit Logs
export async function getAuditLogs(tenantId: string, skip: number, take: number) {
  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
    }),
    prisma.auditLog.count({ where: { tenantId } }),
  ]);
  return { items, total };
}

// Integrations
export function listIntegrations(tenantId: string) {
  return getSetting<Record<string, IntegrationSettings>>(tenantId, 'integrations', {});
}

export async function getIntegration(tenantId: string, name: string) {
  const integrations = await listIntegrations(tenantId);
  return integrations[name] ?? { enabled: false };
}

export async function updateIntegration(tenantId: string, name: string, data: IntegrationSettings, userId: string) {
  const integrations = await listIntegrations(tenantId);
  integrations[name] = data;
  await upsertSetting(tenantId, 'integrations', integrations, userId);
  return integrations[name];
}

export async function triggerIntegrationTest(_tenantId: string, name: string) {
  return { name, status: 'queued', triggeredAt: new Date().toISOString() };
}

export async function triggerIntegrationSync(_tenantId: string, name: string) {
  return { name, status: 'queued', jobId: `sync_${Date.now()}` };
}

// Backup & Data
const defaultBackupSettings: BackupSettings = {
  schedule: 'WEEKLY',
  retentionDays: 30,
  destination: 'S3',
  encryption: true,
};

export function getBackupSettings(tenantId: string) {
  return getSetting<BackupSettings>(tenantId, 'backup_settings', defaultBackupSettings);
}

export function updateBackupSettings(tenantId: string, data: BackupSettings, userId: string) {
  return upsertSetting(tenantId, 'backup_settings', data, userId);
}

export async function triggerBackupJob(tenantId: string, userId: string) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  const job: ExportJobRecord = {
    id: randomUUID(),
    type: 'BACKUP',
    status: 'pending',
    createdAt: new Date().toISOString(),
  };
  jobs.push(job);
  await upsertSetting(tenantId, 'jobs', jobs, userId);
  return job;
}

export async function listBackupHistory(tenantId: string) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  return jobs.filter((job) => job.type === 'BACKUP' || job.type === 'RESTORE');
}

export async function triggerRestoreJob(tenantId: string, backupId: string, userId: string) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  const job: ExportJobRecord = {
    id: randomUUID(),
    type: 'RESTORE',
    status: 'pending',
    createdAt: new Date().toISOString(),
    metadata: { backupId },
  };
  jobs.push(job);
  await upsertSetting(tenantId, 'jobs', jobs, userId);
  return job;
}

export async function startDataExport(tenantId: string, userId: string, metadata: Record<string, unknown>) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  const job: ExportJobRecord = {
    id: randomUUID(),
    type: 'EXPORT',
    status: 'pending',
    createdAt: new Date().toISOString(),
    metadata,
  };
  jobs.push(job);
  await upsertSetting(tenantId, 'jobs', jobs, userId);
  return job;
}

export async function getExportJob(tenantId: string, jobId: string) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  const job = jobs.find((item) => item.id === jobId && item.type === 'EXPORT');
  if (!job) {
    throw NotFound('Export job not found');
  }
  return job;
}

export async function getExportDownloadUrl(tenantId: string, jobId: string) {
  const job = await getExportJob(tenantId, jobId);
  return { url: `https://downloads.autolytiq.local/${tenantId}/exports/${jobId}.csv`, status: job.status };
}

export async function importDataJob(tenantId: string, userId: string, metadata: Record<string, unknown>) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  const job: ExportJobRecord = {
    id: randomUUID(),
    type: 'IMPORT',
    status: 'pending',
    createdAt: new Date().toISOString(),
    metadata,
  };
  jobs.push(job);
  await upsertSetting(tenantId, 'jobs', jobs, userId);
  return job;
}

export async function requestCustomerDeletion(tenantId: string, customerId: string, userId: string) {
  await logAudit(tenantId, userId, 'GDPR_DELETE_CUSTOMER', 'customer', { customerId });
  return { status: 'queued', customerId };
}

// Data settings
const defaultDataSettings: DataSettings = {
  autoPurgeInactiveCustomersDays: undefined,
  autoPurgeLeadsDays: undefined,
  piiAccessRoles: ['ADMIN'],
};

export function getDataSettings(tenantId: string) {
  return getSetting<DataSettings>(tenantId, 'data_settings', defaultDataSettings);
}

export function updateDataSettings(tenantId: string, data: DataSettings, userId: string) {
  return upsertSetting(tenantId, 'data_settings', data, userId);
}

// Analytics
const defaultAnalyticsSettings: AnalyticsSettings = {
  dashboardRefreshMinutes: 15,
  conversionGoals: [],
  widgets: [],
};

export function getAnalyticsSettings(tenantId: string) {
  return getSetting<AnalyticsSettings>(tenantId, 'analytics_settings', defaultAnalyticsSettings);
}

export function updateAnalyticsSettings(tenantId: string, data: AnalyticsSettings, userId: string) {
  return upsertSetting(tenantId, 'analytics_settings', data, userId);
}

const defaultCustomEvents: CustomEventDefinition[] = [];

export function listCustomEvents(tenantId: string) {
  return getSetting<CustomEventDefinition[]>(tenantId, 'custom_events', defaultCustomEvents);
}

export async function createCustomEvent(tenantId: string, event: CustomEventDefinition, userId: string) {
  const events = await listCustomEvents(tenantId);
  events.push(event);
  await upsertSetting(tenantId, 'custom_events', events, userId);
  return event;
}

export async function deleteCustomEvent(tenantId: string, eventId: string, userId: string) {
  const events = await listCustomEvents(tenantId);
  const filtered = events.filter((event) => event.id !== eventId);
  if (filtered.length === events.length) {
    throw NotFound('Custom event not found');
  }
  await upsertSetting(tenantId, 'custom_events', filtered, userId);
}

const defaultScheduledReports: ScheduledReportDefinition[] = [];

export function listScheduledReports(tenantId: string) {
  return getSetting<ScheduledReportDefinition[]>(tenantId, 'scheduled_reports', defaultScheduledReports);
}

export async function createScheduledReport(tenantId: string, report: ScheduledReportDefinition, userId: string) {
  const reports = await listScheduledReports(tenantId);
  reports.push(report);
  await upsertSetting(tenantId, 'scheduled_reports', reports, userId);
  return report;
}

export async function updateScheduledReport(tenantId: string, reportId: string, data: Partial<ScheduledReportDefinition>, userId: string) {
  const reports = await listScheduledReports(tenantId);
  const index = reports.findIndex((report) => report.id === reportId);
  if (index < 0) {
    throw NotFound('Scheduled report not found');
  }
  reports[index] = { ...reports[index], ...data };
  await upsertSetting(tenantId, 'scheduled_reports', reports, userId);
  return reports[index];
}

export async function deleteScheduledReport(tenantId: string, reportId: string, userId: string) {
  const reports = await listScheduledReports(tenantId);
  const filtered = reports.filter((report) => report.id !== reportId);
  if (filtered.length === reports.length) {
    throw NotFound('Scheduled report not found');
  }
  await upsertSetting(tenantId, 'scheduled_reports', filtered, userId);
}

// Developer Tools
const defaultFeatureFlags: FeatureFlagDefinition[] = [];

export function listFeatureFlags(tenantId: string) {
  return getSetting<FeatureFlagDefinition[]>(tenantId, 'feature_flags', defaultFeatureFlags);
}

export async function updateFeatureFlag(tenantId: string, flagKey: string, enabled: boolean, userId: string) {
  const flags = await listFeatureFlags(tenantId);
  const index = flags.findIndex((flag) => flag.key === flagKey);
  const updated: FeatureFlagDefinition = index >= 0 ? { ...flags[index], enabled } : { key: flagKey, enabled, description: '' };
  if (index >= 0) {
    flags[index] = updated;
  } else {
    flags.push(updated);
  }
  await upsertSetting(tenantId, 'feature_flags', flags, userId);
  return updated;
}

export async function getSystemStatus(tenantId: string) {
  await prisma.$queryRaw`SELECT 1`;
  const queuedJobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  return {
    api: 'ok',
    database: 'ok',
    queuedJobs: queuedJobs.length,
    timestamp: new Date().toISOString(),
  };
}

export async function restartService(_tenantId: string, service: string) {
  return { service, status: 'queued', requestedAt: new Date().toISOString() };
}

export function getTenantInfo(tenantId: string) {
  return prisma.tenant.findUnique({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      plan: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

export async function updateTenantSettings(tenantId: string, data: { name?: string; status?: TenantStatus }) {
  const tenant = await prisma.tenant.findUnique({ where: { id: tenantId } });
  if (!tenant) {
    throw NotFound('Tenant not found');
  }
  const payload: Prisma.TenantUpdateInput = {};
  if (data.name !== undefined) {
    payload.name = data.name;
  }
  if (data.status !== undefined) {
    payload.status = data.status;
  }
  if (Object.keys(payload).length === 0) {
    return prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, name: true, plan: true, status: true, createdAt: true, updatedAt: true },
    });
  }
  return prisma.tenant.update({
    where: { id: tenantId },
    data: payload,
    select: { id: true, name: true, plan: true, status: true, createdAt: true, updatedAt: true },
  });
}

export async function runSqlQuery(_tenantId: string, query: string) {
  const sanitized = query.trim();
  if (!/^select/i.test(sanitized)) {
    throw BadRequest('Only SELECT queries are permitted');
  }
  const rows = (await prisma.$queryRawUnsafe(sanitized)) as unknown[];
  const columns = rows.length > 0 ? Object.keys(rows[0] as Record<string, unknown>) : [];
  return { rows, columns };
}

export async function getRequestLogs(tenantId: string) {
  const logs = await prisma.auditLog.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return logs;
}

export async function getJobQueue(tenantId: string) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  return jobs;
}

export async function triggerJob(tenantId: string, jobName: string, userId: string, payload?: Record<string, unknown>) {
  const jobs = await getSetting<ExportJobRecord[]>(tenantId, 'jobs', []);
  const job: ExportJobRecord = {
    id: randomUUID(),
    type: 'EXPORT',
    status: 'pending',
    createdAt: new Date().toISOString(),
    metadata: { jobName, payload },
  };
  jobs.push(job);
  await upsertSetting(tenantId, 'jobs', jobs, userId);
  return job;
}

export async function getSystemLogs(_tenantId: string) {
  return [] as Array<{ timestamp: string; level: string; message: string }>;
}

export async function clearCache(_tenantId: string) {
  return { status: 'cleared', clearedAt: new Date().toISOString() };
}

export async function getWebhookLogs(_tenantId: string) {
  return [] as Array<{ id: string; endpoint: string; status: number; deliveredAt: string }>;
}

export async function getPerformanceQueries(_tenantId: string) {
  return [] as Array<{ query: string; avgDurationMs: number; calls: number }>;
}

export async function getPerformanceEndpoints(_tenantId: string) {
  return [] as Array<{ path: string; avgResponseMs: number; p95Ms: number }>;
}
