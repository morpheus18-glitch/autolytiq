import { Request, Response } from 'express';
import { z } from 'zod';
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
import { ok, created, noContent } from '../lib/response.js';
import { parsePagination } from '../lib/pagination.js';
import { Unprocessable, BadRequest } from '../lib/errors.js';
import * as svc from '../services/settings.service.js';

const createUserSchema = userSchema.extend({ password: z.string().min(8) });
const updateUserSchema = userSchema.partial();
const templateUpdateSchema = templateSchema.partial().extend({ body: z.string().optional() });
const templateTestSchema = z.object({ channel: z.string(), target: z.string() });
const integrationUpdateSchema = integrationSchema.extend({});
const exportRequestSchema = z.object({ entities: z.array(z.string()), format: z.enum(['CSV', 'PDF', 'JSON']).default('CSV') });
const importRequestSchema = z.object({ entity: z.string(), mode: z.enum(['UPSERT', 'INSERT']).default('UPSERT') });
const featureFlagUpdateSchema = z.object({ enabled: z.boolean() });
const sqlQuerySchema = z.object({ query: z.string().min(1) });
const tenantSettingsSchema = z.object({ name: z.string().optional(), status: z.enum(['ACTIVE', 'SUSPENDED', 'CANCELLED']).optional() });
const apiKeySchema = z.object({ label: z.string().min(1) });
const triggerJobSchema = z.object({ payload: z.record(z.any()).optional() });

// Dealership
export async function getDealershipSettings(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const settings = await svc.getDealershipSettings(tenantId);
  return ok(res, settings);
}

export async function updateDealershipSettings(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = dealershipSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid dealership settings', parsed.error.flatten());
  }
  const updated = await svc.updateDealershipSettings(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_DEALERSHIP_SETTINGS', 'settings', parsed.data, ip);
  return ok(res, updated);
}

// Users
export async function getUsers(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const { page, limit, skip, take } = parsePagination(req.query as Record<string, string>);
  const { items, total } = await svc.listUsers(tenantId, {
    skip,
    take,
    search: (req.query.search as string) || undefined,
    role: (req.query.role as string) || undefined,
  });
  return ok(res, { items, page, limit, total, pages: Math.ceil(total / limit) });
}

export async function createUser(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid user', parsed.error.flatten());
  }
  const user = await svc.createUser(tenantId, parsed.data);
  await svc.logAudit(tenantId, userId, 'CREATE_USER', 'user', { id: user.id }, ip);
  return created(res, user);
}

export async function updateUser(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = updateUserSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid user update', parsed.error.flatten());
  }
  const user = await svc.updateUser(tenantId, req.params.id, parsed.data);
  await svc.logAudit(tenantId, userId, 'UPDATE_USER', 'user', { id: req.params.id }, ip);
  return ok(res, user);
}

export async function deleteUser(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const result = await svc.deactivateUser(tenantId, req.params.id);
  await svc.logAudit(tenantId, userId, 'DEACTIVATE_USER', 'user', { id: req.params.id }, ip);
  return ok(res, result);
}

export async function resetUserPassword(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const temporaryPassword = req.body?.temporaryPassword as string | undefined;
  if (!temporaryPassword) {
    throw BadRequest('temporaryPassword is required');
  }
  const payload = await svc.resetUserPassword(tenantId, req.params.id, temporaryPassword, userId);
  return ok(res, payload);
}

// Pricing Rules
export async function getPricingRules(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const rules = await svc.getPricingRules(tenantId);
  return ok(res, rules);
}

export async function updatePricingRules(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = pricingRulesSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid pricing rules', parsed.error.flatten());
  }
  const updated = await svc.updatePricingRules(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_PRICING_RULES', 'settings', parsed.data, ip);
  return ok(res, updated);
}

// Templates
export async function listTemplates(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const templates = await svc.listTemplates(tenantId);
  return ok(res, templates);
}

export async function updateTemplate(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = templateUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid template', parsed.error.flatten());
  }
  const updated = await svc.upsertTemplate(tenantId, req.params.id, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_TEMPLATE', 'template', { id: req.params.id }, ip);
  return ok(res, updated);
}

export async function previewTemplate(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const parsed = z
    .object({ body: z.string().min(1), variables: z.record(z.string()).optional() })
    .safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid template preview request', parsed.error.flatten());
  }
  const preview = await svc.renderTemplatePreview(tenantId, parsed.data);
  return ok(res, preview);
}

export async function sendTemplateTest(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const parsed = templateTestSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid test request', parsed.error.flatten());
  }
  const result = await svc.sendTemplateTest(tenantId, req.params.id, parsed.data);
  return ok(res, result);
}

// Notifications
export async function getNotificationSettings(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const settings = await svc.getNotificationSettings(tenantId);
  return ok(res, settings);
}

export async function updateNotificationSettings(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = notificationsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid notification settings', parsed.error.flatten());
  }
  const updated = await svc.updateNotificationSettings(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_NOTIFICATION_SETTINGS', 'settings', parsed.data, ip);
  return ok(res, updated);
}

export async function sendTestEmail(req: Request, res: Response) {
  const parsed = z.object({ to: z.string().email() }).safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid test email payload', parsed.error.flatten());
  }
  return created(res, { status: 'queued', to: parsed.data.to, queuedAt: new Date().toISOString() });
}

export async function sendTestSms(req: Request, res: Response) {
  const parsed = z.object({ to: z.string().min(5) }).safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid test SMS payload', parsed.error.flatten());
  }
  return created(res, { status: 'queued', to: parsed.data.to, queuedAt: new Date().toISOString() });
}

// Security
export async function getSecuritySettings(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const settings = await svc.getSecuritySettings(tenantId);
  return ok(res, settings);
}

export async function updateSecuritySettings(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = securitySettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid security settings', parsed.error.flatten());
  }
  const updated = await svc.updateSecuritySettings(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_SECURITY_SETTINGS', 'settings', parsed.data, ip);
  return ok(res, updated);
}

export async function listApiKeys(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const keys = await svc.listApiKeys(tenantId);
  return ok(res, keys);
}

export async function createApiKey(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = apiKeySchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid API key request', parsed.error.flatten());
  }
  const key = await svc.createApiKey(tenantId, parsed.data.label, userId);
  await svc.logAudit(tenantId, userId, 'CREATE_API_KEY', 'security', { id: key.id }, ip);
  return created(res, key);
}

export async function deleteApiKey(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  await svc.deleteApiKey(tenantId, req.params.id, userId);
  await svc.logAudit(tenantId, userId, 'DELETE_API_KEY', 'security', { id: req.params.id }, ip);
  return noContent(res);
}

export async function listAuditLogs(req: Request, res: Response) {
  const { tenantId } = req.user!;
  const { page, limit, skip, take } = parsePagination(req.query as Record<string, string>);
  const { items, total } = await svc.getAuditLogs(tenantId, skip, take);
  return ok(res, { items, page, limit, total, pages: Math.ceil(total / limit) });
}

// Branding
export async function getBranding(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const branding = await svc.getBrandingSettings(tenantId);
  return ok(res, branding);
}

export async function updateBranding(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = brandingSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid branding payload', parsed.error.flatten());
  }
  const updated = await svc.updateBrandingSettings(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_BRANDING', 'branding', parsed.data, ip);
  return ok(res, updated);
}

export async function uploadLogo(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  if (!req.file) {
    throw BadRequest('File is required');
  }
  const uploaded = await svc.saveBrandAsset(tenantId, req.file.buffer, req.file.originalname, userId);
  await svc.logAudit(tenantId, userId, 'UPLOAD_BRAND_ASSET', 'branding', { filename: req.file.originalname }, ip);
  return created(res, uploaded);
}

export async function deleteBrandAsset(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  await svc.deleteBrandAsset(tenantId, req.params.type, userId);
  await svc.logAudit(tenantId, userId, 'DELETE_BRAND_ASSET', 'branding', { type: req.params.type }, ip);
  return noContent(res);
}

// Integrations
export async function listIntegrations(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const integrations = await svc.listIntegrations(tenantId);
  return ok(res, integrations);
}

export async function getIntegration(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const integration = await svc.getIntegration(tenantId, req.params.name);
  return ok(res, integration);
}

export async function updateIntegration(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = integrationUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid integration payload', parsed.error.flatten());
  }
  const updated = await svc.updateIntegration(tenantId, req.params.name, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_INTEGRATION', 'integration', { name: req.params.name }, ip);
  return ok(res, updated);
}

export async function testIntegration(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const result = await svc.triggerIntegrationTest(tenantId, req.params.name);
  return ok(res, result);
}

export async function syncIntegration(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const result = await svc.triggerIntegrationSync(tenantId, req.params.name);
  return ok(res, result);
}

// Backup & Data
export async function getBackupConfig(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const settings = await svc.getBackupSettings(tenantId);
  return ok(res, settings);
}

export async function updateBackupConfig(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = backupSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid backup settings', parsed.error.flatten());
  }
  const updated = await svc.updateBackupSettings(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_BACKUP_SETTINGS', 'settings', parsed.data, ip);
  return ok(res, updated);
}

export async function triggerBackup(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const job = await svc.triggerBackupJob(tenantId, userId);
  await svc.logAudit(tenantId, userId, 'TRIGGER_BACKUP', 'backup', { jobId: job.id }, ip);
  return created(res, job);
}

export async function getBackupHistory(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const history = await svc.listBackupHistory(tenantId);
  return ok(res, history);
}

export async function restoreBackup(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const job = await svc.triggerRestoreJob(tenantId, req.params.id, userId);
  await svc.logAudit(tenantId, userId, 'TRIGGER_RESTORE', 'backup', { jobId: job.id }, ip);
  return created(res, job);
}

export async function exportData(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = exportRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw Unprocessable('Invalid export request', parsed.error.flatten());
  }
  const job = await svc.startDataExport(tenantId, userId, parsed.data);
  await svc.logAudit(tenantId, userId, 'EXPORT_DATA', 'data', { jobId: job.id }, ip);
  return created(res, job);
}

export async function getExportStatus(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const job = await svc.getExportJob(tenantId, req.params.jobId);
  return ok(res, job);
}

export async function downloadExport(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const download = await svc.getExportDownloadUrl(tenantId, req.params.jobId);
  return ok(res, download);
}

export async function importData(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  if (!req.file) {
    throw BadRequest('File is required');
  }
  const parsed = importRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw Unprocessable('Invalid import request', parsed.error.flatten());
  }
  const job = await svc.importDataJob(tenantId, userId, { ...parsed.data, filename: req.file.originalname });
  await svc.logAudit(tenantId, userId, 'IMPORT_DATA', 'data', { jobId: job.id }, ip);
  return created(res, job);
}

export async function deleteCustomerData(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const payload = await svc.requestCustomerDeletion(tenantId, req.params.customerId, userId);
  return ok(res, payload);
}

export async function getDataSettings(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const settings = await svc.getDataSettings(tenantId);
  return ok(res, settings);
}

export async function updateDataSettings(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = dataSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid data settings', parsed.error.flatten());
  }
  const updated = await svc.updateDataSettings(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_DATA_SETTINGS', 'data', parsed.data, ip);
  return ok(res, updated);
}

// Analytics
export async function getAnalytics(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const settings = await svc.getAnalyticsSettings(tenantId);
  return ok(res, settings);
}

export async function updateAnalytics(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = analyticsSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid analytics settings', parsed.error.flatten());
  }
  const updated = await svc.updateAnalyticsSettings(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_ANALYTICS_SETTINGS', 'analytics', parsed.data, ip);
  return ok(res, updated);
}

export async function listCustomEvents(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const events = await svc.listCustomEvents(tenantId);
  return ok(res, events);
}

export async function createCustomEvent(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = customEventSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid custom event', parsed.error.flatten());
  }
  const event = await svc.createCustomEvent(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'CREATE_CUSTOM_EVENT', 'analytics', { id: event.id }, ip);
  return created(res, event);
}

export async function deleteCustomEvent(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  await svc.deleteCustomEvent(tenantId, req.params.id, userId);
  await svc.logAudit(tenantId, userId, 'DELETE_CUSTOM_EVENT', 'analytics', { id: req.params.id }, ip);
  return noContent(res);
}

export async function listScheduledReports(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const reports = await svc.listScheduledReports(tenantId);
  return ok(res, reports);
}

export async function createScheduledReport(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = scheduledReportSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid scheduled report', parsed.error.flatten());
  }
  const report = await svc.createScheduledReport(tenantId, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'CREATE_SCHEDULED_REPORT', 'analytics', { id: report.id }, ip);
  return created(res, report);
}

export async function updateScheduledReport(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = scheduledReportSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid scheduled report update', parsed.error.flatten());
  }
  const report = await svc.updateScheduledReport(tenantId, req.params.id, parsed.data, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_SCHEDULED_REPORT', 'analytics', { id: req.params.id }, ip);
  return ok(res, report);
}

export async function deleteScheduledReport(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  await svc.deleteScheduledReport(tenantId, req.params.id, userId);
  await svc.logAudit(tenantId, userId, 'DELETE_SCHEDULED_REPORT', 'analytics', { id: req.params.id }, ip);
  return noContent(res);
}

// Developer
export async function getSystemStatus(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const status = await svc.getSystemStatus(tenantId);
  return ok(res, status);
}

export async function restartService(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const result = await svc.restartService(tenantId, req.params.service);
  return ok(res, result);
}

export async function getTenantInfo(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const tenant = await svc.getTenantInfo(tenantId);
  return ok(res, tenant);
}

export async function updateTenantSettings(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const parsed = tenantSettingsSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid tenant settings', parsed.error.flatten());
  }
  const tenant = await svc.updateTenantSettings(tenantId, parsed.data);
  return ok(res, tenant);
}

export async function runSqlQuery(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const parsed = sqlQuerySchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid SQL query', parsed.error.flatten());
  }
  const result = await svc.runSqlQuery(tenantId, parsed.data.query);
  return ok(res, result);
}

export async function getRequestLogs(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const logs = await svc.getRequestLogs(tenantId);
  return ok(res, logs);
}

export async function getJobQueue(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const jobs = await svc.getJobQueue(tenantId);
  return ok(res, jobs);
}

export async function triggerJob(req: Request, res: Response) {
  const { tenantId, userId } = req.user!;
  const parsed = triggerJobSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    throw Unprocessable('Invalid job payload', parsed.error.flatten());
  }
  const job = await svc.triggerJob(tenantId, req.params.jobName, userId, parsed.data.payload ?? {});
  return created(res, job);
}

export async function getSystemLogs(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const logs = await svc.getSystemLogs(tenantId);
  return ok(res, logs);
}

export async function listFeatureFlags(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const flags = await svc.listFeatureFlags(tenantId);
  return ok(res, flags);
}

export async function updateFeatureFlag(req: Request, res: Response) {
  const { tenantId, userId, ip } = req.user!;
  const parsed = featureFlagUpdateSchema.safeParse(req.body);
  if (!parsed.success) {
    throw Unprocessable('Invalid feature flag payload', parsed.error.flatten());
  }
  const flag = await svc.updateFeatureFlag(tenantId, req.params.flag, parsed.data.enabled, userId);
  await svc.logAudit(tenantId, userId, 'UPDATE_FEATURE_FLAG', 'feature_flag', { key: req.params.flag }, ip);
  return ok(res, flag);
}

export async function clearCache(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const result = await svc.clearCache(tenantId);
  return ok(res, result);
}

export async function getWebhookLogs(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const logs = await svc.getWebhookLogs(tenantId);
  return ok(res, logs);
}

export async function getPerformanceQueries(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const queries = await svc.getPerformanceQueries(tenantId);
  return ok(res, queries);
}

export async function getPerformanceEndpoints(req: Request, res: Response) {
  const tenantId = req.user!.tenantId;
  const endpoints = await svc.getPerformanceEndpoints(tenantId);
  return ok(res, endpoints);
}
