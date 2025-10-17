import express from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import { requireDeveloperAccess } from '../middleware/dev.middleware.js';
import { upload } from '../middleware/upload.middleware.js';
import { wrapAsync } from '../lib/errors.js';
import * as controller from '../controllers/settings.controller.js';

const router = express.Router();

router.use(authenticate);

// Dealership
router.get('/dealership', wrapAsync(controller.getDealershipSettings));
router.put('/dealership', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.updateDealershipSettings));

// Users
router.get('/users', requireRole(['ADMIN']), wrapAsync(controller.getUsers));
router.post('/users', requireRole(['ADMIN']), wrapAsync(controller.createUser));
router.put('/users/:id', requireRole(['ADMIN']), wrapAsync(controller.updateUser));
router.delete('/users/:id', requireRole(['ADMIN']), wrapAsync(controller.deleteUser));
router.post('/users/:id/reset-password', requireRole(['ADMIN']), wrapAsync(controller.resetUserPassword));

// Pricing Rules
router.get('/pricing-rules', wrapAsync(controller.getPricingRules));
router.put('/pricing-rules', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.updatePricingRules));

// Templates
router.get('/templates', wrapAsync(controller.listTemplates));
router.put('/templates/:id', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.updateTemplate));
router.post('/templates/:id/preview', wrapAsync(controller.previewTemplate));
router.post('/templates/:id/test-send', wrapAsync(controller.sendTemplateTest));

// Notifications
router.get('/notifications', wrapAsync(controller.getNotificationSettings));
router.put('/notifications', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.updateNotificationSettings));
router.post('/notifications/test-email', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.sendTestEmail));
router.post('/notifications/test-sms', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.sendTestSms));

// Security
router.get('/security', requireRole(['ADMIN']), wrapAsync(controller.getSecuritySettings));
router.put('/security', requireRole(['ADMIN']), wrapAsync(controller.updateSecuritySettings));
router.get('/api-keys', requireRole(['ADMIN']), wrapAsync(controller.listApiKeys));
router.post('/api-keys', requireRole(['ADMIN']), wrapAsync(controller.createApiKey));
router.delete('/api-keys/:id', requireRole(['ADMIN']), wrapAsync(controller.deleteApiKey));
router.get('/audit-logs', requireRole(['ADMIN']), wrapAsync(controller.listAuditLogs));

// Branding
router.get('/branding', wrapAsync(controller.getBranding));
router.put('/branding', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.updateBranding));
router.post('/branding/upload-logo', requireRole(['ADMIN', 'MANAGER']), upload.single('logo'), wrapAsync(controller.uploadLogo));
router.delete('/branding/logo/:type', requireRole(['ADMIN']), wrapAsync(controller.deleteBrandAsset));

// Integrations
router.get('/integrations', requireRole(['ADMIN']), wrapAsync(controller.listIntegrations));
router.get('/integrations/:name', requireRole(['ADMIN']), wrapAsync(controller.getIntegration));
router.put('/integrations/:name', requireRole(['ADMIN']), wrapAsync(controller.updateIntegration));
router.post('/integrations/:name/test', requireRole(['ADMIN']), wrapAsync(controller.testIntegration));
router.post('/integrations/:name/sync', requireRole(['ADMIN']), wrapAsync(controller.syncIntegration));

// Backup & Data
router.get('/backup/config', requireRole(['ADMIN']), wrapAsync(controller.getBackupConfig));
router.put('/backup/config', requireRole(['ADMIN']), wrapAsync(controller.updateBackupConfig));
router.post('/backup/trigger', requireRole(['ADMIN']), wrapAsync(controller.triggerBackup));
router.get('/backup/history', requireRole(['ADMIN']), wrapAsync(controller.getBackupHistory));
router.post('/backup/restore/:id', requireRole(['ADMIN']), wrapAsync(controller.restoreBackup));
router.post('/export-data', requireRole(['ADMIN']), wrapAsync(controller.exportData));
router.get('/export-data/:jobId/status', requireRole(['ADMIN']), wrapAsync(controller.getExportStatus));
router.get('/export-data/:jobId/download', requireRole(['ADMIN']), wrapAsync(controller.downloadExport));
router.post('/import-data', requireRole(['ADMIN']), upload.single('file'), wrapAsync(controller.importData));
router.post('/gdpr/delete-customer/:customerId', requireRole(['ADMIN']), wrapAsync(controller.deleteCustomerData));
router.get('/data-settings', requireRole(['ADMIN']), wrapAsync(controller.getDataSettings));
router.put('/data-settings', requireRole(['ADMIN']), wrapAsync(controller.updateDataSettings));

// Analytics
router.get('/analytics', wrapAsync(controller.getAnalytics));
router.put('/analytics', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.updateAnalytics));
router.get('/analytics/custom-events', wrapAsync(controller.listCustomEvents));
router.post('/analytics/custom-events', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.createCustomEvent));
router.delete('/analytics/custom-events/:id', requireRole(['ADMIN']), wrapAsync(controller.deleteCustomEvent));
router.get('/analytics/scheduled-reports', wrapAsync(controller.listScheduledReports));
router.post('/analytics/scheduled-reports', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.createScheduledReport));
router.put('/analytics/scheduled-reports/:id', requireRole(['ADMIN', 'MANAGER']), wrapAsync(controller.updateScheduledReport));
router.delete('/analytics/scheduled-reports/:id', requireRole(['ADMIN']), wrapAsync(controller.deleteScheduledReport));

// Developer
router.use('/developer', requireRole(['ADMIN']), requireDeveloperAccess);
router.get('/developer/system-status', wrapAsync(controller.getSystemStatus));
router.post('/developer/restart-service/:service', wrapAsync(controller.restartService));
router.get('/developer/tenant-info', wrapAsync(controller.getTenantInfo));
router.put('/developer/tenant-settings', wrapAsync(controller.updateTenantSettings));
router.post('/developer/sql-query', wrapAsync(controller.runSqlQuery));
router.get('/developer/request-logs', wrapAsync(controller.getRequestLogs));
router.get('/developer/job-queue', wrapAsync(controller.getJobQueue));
router.post('/developer/trigger-job/:jobName', wrapAsync(controller.triggerJob));
router.get('/developer/logs', wrapAsync(controller.getSystemLogs));
router.get('/developer/feature-flags', wrapAsync(controller.listFeatureFlags));
router.put('/developer/feature-flags/:flag', wrapAsync(controller.updateFeatureFlag));
router.post('/developer/cache/clear', wrapAsync(controller.clearCache));
router.get('/developer/webhooks/logs', wrapAsync(controller.getWebhookLogs));
router.get('/developer/performance/queries', wrapAsync(controller.getPerformanceQueries));
router.get('/developer/performance/endpoints', wrapAsync(controller.getPerformanceEndpoints));

export default router;
