# Part 3 Settings & Configuration Module Prompt

```
You are building Part 3 of an enterprise automotive DMS/CRM system: the Settings & Configuration Module.

CONTEXT:
- Tech Stack: React 18 + TypeScript + Vite + Tailwind CSS (frontend), Express.js + TypeScript + Prisma ORM (backend), PostgreSQL
- Multi-tenant SaaS with row-level security (tenant_id on all tables)
- JWT authentication already implemented
- Express API on port 5000, React frontend on port 3000
- Database already has: Tenant, User, Customer, Vehicle, Deal, JournalEntry, GLAccount, SystemSetting tables

YOUR MISSION:
Build a comprehensive dealership settings interface with 11 configuration sections (10 standard + 1 developer portal). This is where dealerships configure their entire operation and where developers can debug/monitor the multi-tenant system.

════════════════════════════════════════════════════════════════════
SECTION 1: SETTINGS LAYOUT
════════════════════════════════════════════════════════════════════

Create SettingsLayout.tsx with:
- Responsive sidebar with icons (Building2, Users, DollarSign, FileText, Bell, Shield, Palette, Plug, Database, BarChart3, Code from lucide-react)
- 11 navigation items
- Mobile hamburger menu
- Permission-based visibility (hide admin-only sections for non-admins)
- Active state highlighting
- Use React Router's Outlet for nested routes

════════════════════════════════════════════════════════════════════
SECTION 2: DEALERSHIP INFO (DealershipSettings.tsx)
════════════════════════════════════════════════════════════════════

Build form with these fields:
- Business Name (text, required)
- Address (street, city, state, zip)
- Phone (format: (555) 123-4567)
- Email (email validation)
- Website URL (optional)
- Tax ID / EIN (format: 12-3456789)
- Dealer License Number (text)
- Business Hours (select dropdowns for open/close times, per day of week)
- Doc Fee (currency input, default $399)
- Registration Fee (currency input, default $299)
- State Sales Tax Rate (percentage, e.g., 7.5%)
- Logo upload (accept .png, .jpg, max 2MB)

Use React Hook Form + Zod validation
Save button with loading state
Success toast on save
API: GET /api/settings/dealership, PUT /api/settings/dealership

Store in SystemSetting table with key='dealership_info', value={...json}

════════════════════════════════════════════════════════════════════
SECTION 3: USERS & ROLES (UsersSettings.tsx)
════════════════════════════════════════════════════════════════════

Build two-panel layout:

LEFT PANEL - User List Table:
- Columns: Name, Email, Role, Status, Last Login, Actions
- Search/filter by name, email, role
- Sortable columns
- "Add User" button (opens modal)
- Actions: Edit, Deactivate, Reset Password

RIGHT PANEL - User Form Modal (opens on Add/Edit):
- First Name, Last Name
- Email (unique per tenant)
- Phone
- Role dropdown: ADMIN, MANAGER, SALES, FINANCE, SERVICE, BDC
- Status toggle: Active / Inactive
- Password (only on create, min 8 chars)
- Permissions checkboxes:
  * View All Deals
  * Edit All Deals
  * Delete Deals
  * View Reports
  * Manage Inventory
  * Approve Deals
  * Access Accounting
  * Manage Settings

API Endpoints:
- GET /api/settings/users (returns paginated user list)
- POST /api/settings/users (create new user)
- PUT /api/settings/users/:id (update user)
- DELETE /api/settings/users/:id (soft delete - set status to inactive)
- POST /api/settings/users/:id/reset-password (send reset email)

Validation: Email must be unique within tenant

════════════════════════════════════════════════════════════════════
SECTION 4: PRICING RULES (PricingRulesSettings.tsx)
════════════════════════════════════════════════════════════════════

Build form with:

AI PRICING CONTROLS:
- Toggle: Enable AI Pricing (default: true)
- Pricing Strategy dropdown:
  * Market Competitive (match market)
  * Premium (10-15% above market)
  * Volume (5-10% below market for faster turnover)
- AI Adjustment Range: Min % / Max % sliders (-15% to +20%)

MARGIN RULES (by vehicle type):
- New Vehicles: Minimum front gross $____ (default $2000)
- Used Vehicles: Minimum front gross $____ (default $1500)
- Certified Pre-Owned: Minimum front gross $____ (default $1800)

DEAL STRUCTURE:
- Default Deal Pack: $____ (default $500)
- F&I Minimum: $____ (default $800)

AGING DISCOUNTS (automatic price reductions):
- 30 Days: -____% (default -2%)
- 60 Days: -____% (default -5%)
- 90 Days: -____% (default -8%)
- 120+ Days: -____% (default -12%)

APPROVAL THRESHOLDS:
- Deals below $____ front gross require manager approval (default $1000)
- Deals below $____ F&I require finance manager approval (default $500)

API: GET /api/settings/pricing-rules, PUT /api/settings/pricing-rules

════════════════════════════════════════════════════════════════════
SECTION 5: FORMS & TEMPLATES (FormsSettings.tsx)
════════════════════════════════════════════════════════════════════

Build three-tab interface:

TAB 1 - DOCUMENT TEMPLATES:
List of templates:
- Credit Application
- Bill of Sale
- Purchase Agreement
- Trade-In Appraisal
- Delivery Checklist
- Customer Satisfaction Survey

Each template card shows:
- Template name
- Last modified date
- "Edit" button (opens rich text editor modal)
- "Preview" button
- "Download PDF" button

TAB 2 - EMAIL TEMPLATES:
List of email templates:
- New Lead Welcome
- Appointment Confirmation
- Deal Approved
- Payment Reminder
- Service Reminder
- Follow-Up Sequences

Editor modal with:
- Subject line
- Rich text editor (support HTML, variables like {{customerName}}, {{vehicleName}})
- Test email button
- Save/Cancel

TAB 3 - SMS TEMPLATES:
List of SMS templates:
- Appointment Reminder
- Deal Update
- Payment Due
- Follow-Up Message

Editor with:
- Message body (160 char counter)
- Variable support
- Test SMS button

API:
- GET /api/settings/templates
- PUT /api/settings/templates/:id
- POST /api/settings/templates/:id/preview
- POST /api/settings/templates/:id/test-send

For Phase 1: Just show list and basic editor. Form builder can be future enhancement.

════════════════════════════════════════════════════════════════════
SECTION 6: NOTIFICATIONS (NotificationsSettings.tsx)
════════════════════════════════════════════════════════════════════

Build notification configuration table:

EVENT TRIGGERS (toggles for Email / SMS / In-App):
- New Lead Assigned (notify: assigned salesperson)
- Deal Submitted for Approval (notify: managers)
- Deal Approved (notify: salesperson, customer)
- Deal Rejected (notify: salesperson)
- Payment Due (notify: customer)
- Payment Received (notify: accounting)
- Follow-Up Reminder (notify: salesperson)
- Inventory Alert - Low Stock (notify: inventory manager)
- Inventory Alert - Aging Vehicle (notify: managers)
- Customer Birthday (notify: salesperson, customer)
- Service Appointment Reminder (notify: customer)

CONFIGURATION SECTION:
- SMTP Email Configuration:
  * Host, Port, Username, Password
  * From Name, From Email
  * Test Connection button
- SMS Configuration (Twilio):
  * Account SID, Auth Token
  * Phone Number
  * Test SMS button

API:
- GET /api/settings/notifications
- PUT /api/settings/notifications
- POST /api/settings/notifications/test-email
- POST /api/settings/notifications/test-sms

════════════════════════════════════════════════════════════════════
SECTION 7: SECURITY (SecuritySettings.tsx)
════════════════════════════════════════════════════════════════════

Build security control panel:

AUTHENTICATION:
- Enable Two-Factor Authentication (toggle)
- Password Requirements:
  * Minimum length (slider: 8-20, default 12)
  * Require uppercase (toggle)
  * Require numbers (toggle)
  * Require special characters (toggle)
- Session Timeout (dropdown: 15min, 30min, 1hr, 2hr, 4hr, 8hr)
- Remember Me Duration (dropdown: 7 days, 14 days, 30 days)

ACCESS CONTROL:
- IP Whitelist (textarea, one IP/CIDR per line)
- IP Blacklist (textarea)
- Max Failed Login Attempts (number, default 5)
- Lockout Duration (number in minutes, default 30)

API SECURITY:
- API Keys Table:
  * Key Name, Key Value (masked), Created Date, Last Used, Actions
  * Generate New Key button
  * Revoke button
- Webhook URLs:
  * Event, URL, Secret, Status, Actions
  * Add Webhook button

AUDIT LOG VIEWER:
- Table with columns: Timestamp, User, Action, Resource, IP Address, Details
- Filters: Date range, User, Action type
- Export to CSV button
- Pagination

API:
- GET /api/settings/security
- PUT /api/settings/security
- GET /api/settings/api-keys
- POST /api/settings/api-keys (generate new key)
- DELETE /api/settings/api-keys/:id
- GET /api/settings/audit-logs (querystring: ?startDate=&endDate=&userId=&action=)

════════════════════════════════════════════════════════════════════
SECTION 8: BRANDING (BrandingSettings.tsx)
════════════════════════════════════════════════════════════════════

Build branding customization interface:

COLORS:
- Primary Color (color picker, default #2563EB)
- Secondary Color (color picker, default #7C3AED)
- Accent Color (color picker, default #10B981)
- Success Color (default #10B981)
- Warning Color (default #F59E0B)
- Error Color (default #EF4444)
- Live preview panel showing buttons/cards with selected colors

LOGOS:
- Primary Logo (light background) - upload, max 500KB, .png/.jpg/.svg
- Logo for Dark Mode (dark background) - upload
- Favicon - upload .ico or .png
- Preview section showing logos

EMAIL BRANDING:
- Email Header HTML editor (with variable support)
- Email Footer HTML editor
- Preview button

DOCUMENT BRANDING:
- Invoice Header (upload image or HTML)
- Invoice Footer
- Purchase Agreement Header

CUSTOMER PORTAL THEME:
- Enable Custom Theme (toggle)
- Font Family (dropdown: Inter, Roboto, Open Sans, Lato, Montserrat)
- Border Radius (slider: 0-20px, default 8px)

API:
- GET /api/settings/branding
- PUT /api/settings/branding
- POST /api/settings/branding/upload-logo (multipart/form-data)
- DELETE /api/settings/branding/logo/:type

════════════════════════════════════════════════════════════════════
SECTION 9: INTEGRATIONS (IntegrationsSettings.tsx)
════════════════════════════════════════════════════════════════════

Build integration management dashboard:

INTEGRATION CARDS (grid layout, card per integration):

1. DMS SYSTEMS:
   - CDK Drive
   - Reynolds & Reynolds
   - Dealertrack DMS
   Each card: Logo, Status badge, Configure button, Test Connection button

2. CREDIT BUREAUS:
   - Experian Automotive
   - TransUnion
   - Equifax
   Fields: API Username, API Password, Member Code

3. LENDING:
   - RouteOne
   - CreditMaker
   - Dealertrack
   Fields: Dealer Code, Username, Password, API Key

4. ACCOUNTING:
   - QuickBooks Online
   - Xero
   - Sage Intacct
   OAuth flow or API credentials

5. MARKETING:
   - Mailchimp (API Key)
   - HubSpot (OAuth)
   - Facebook Lead Ads (OAuth)
   - Google Ads (OAuth)

6. COMMUNICATIONS:
   - Twilio (Account SID, Auth Token, Phone Number)
   - SendGrid (API Key)
   - Slack (Webhook URL)

INTEGRATION CONFIGURATION MODAL:
- Integration name (read-only)
- Status toggle (Active/Inactive)
- Credentials form (dynamic based on integration type)
- Webhook URL (if applicable)
- Sync frequency dropdown (Real-time, Hourly, Daily)
- Last Sync timestamp
- Test Connection button (makes API call to /api/settings/integrations/:name/test)
- Save button

API:
- GET /api/settings/integrations (list all with status)
- GET /api/settings/integrations/:name (get specific integration config)
- PUT /api/settings/integrations/:name (update config)
- POST /api/settings/integrations/:name/test (test connection)
- POST /api/settings/integrations/:name/sync (manual sync trigger)

════════════════════════════════════════════════════════════════════
SECTION 10: DATA & BACKUP (DataSettings.tsx)
════════════════════════════════════════════════════════════════════

Build data management interface:

BACKUP CONFIGURATION:
- Auto Backup toggle (default: on)
- Backup Schedule dropdown (Daily at 2AM, Every 12 hours, Weekly, Monthly)
- Retention Period (dropdown: 7 days, 14 days, 30 days, 60 days, 90 days)
- Backup Storage: S3 bucket configuration (Bucket name, Region, Access Key, Secret Key)
- Manual Backup button (triggers immediate backup)

BACKUP HISTORY TABLE:
- Columns: Date, Size, Type (Auto/Manual), Status, Actions (Download, Restore)
- Show last 30 backups
- Restore button (with confirmation modal)

EXPORT DATA:
- Export Format: Dropdown (CSV, JSON, Excel)
- Select Data: Checkboxes (Customers, Vehicles, Deals, Inventory, Journal Entries, etc.)
- Date Range: Start date, End date
- Export button (generates file, shows download link)

IMPORT DATA:
- Upload CSV/Excel file
- Map columns wizard (drag-drop mapping interface)
- Validation preview table
- Import button

DATA RETENTION:
- Customer Data Retention: (dropdown: 1 year, 2 years, 5 years, 7 years, Indefinite)
- Lead Data Retention: (dropdown: 6 months, 1 year, 2 years)
- Analytics Data Retention: (dropdown: 1 year, 2 years, 5 years)
- Auto-purge old data toggle

GDPR COMPLIANCE:
- Data Deletion Requests table (customer requests to delete data)
- "Delete Customer Data" button (search customer, confirm, permanently delete)
- Export Customer Data button (for GDPR data portability)

API:
- GET /api/settings/backup/config
- PUT /api/settings/backup/config
- POST /api/settings/backup/trigger
- GET /api/settings/backup/history
- POST /api/settings/backup/restore/:id
- POST /api/settings/export-data (returns job ID)
- GET /api/settings/export-data/:jobId/status
- GET /api/settings/export-data/:jobId/download
- POST /api/settings/import-data
- POST /api/settings/gdpr/delete-customer/:customerId

════════════════════════════════════════════════════════════════════
SECTION 11: ANALYTICS & TRACKING (AnalyticsSettings.tsx)
════════════════════════════════════════════════════════════════════

Build analytics configuration:

PIXEL TRACKING:
- Enable Pixel Tracking toggle (default: on)
- Tracking Domain: text input (e.g., analytics.yourdealership.com)
- Install Instructions: Code snippet to copy-paste into website
- Events being tracked table: Event Name, Count (last 30 days), Status

EXTERNAL ANALYTICS:
- Google Analytics:
  * GA4 Measurement ID (format: G-XXXXXXXXXX)
  * Test Connection button
- Facebook Pixel:
  * Pixel ID (format: 123456789012345)
  * Test Connection button
- Google Tag Manager:
  * Container ID (format: GTM-XXXXXXX)
  
CUSTOM EVENTS:
- Table of custom event definitions:
  * Event Name, Description, Parameters, Actions (Edit/Delete)
- Add Custom Event button (modal with: name, description, parameter schema)

CONVERSION GOALS:
- List of conversion goals:
  * Goal Name (e.g., "Lead Submitted", "Test Drive Scheduled", "Deal Closed")
  * Trigger (dropdown: Page View, Event, Custom)
  * Value (optional, for revenue goals)
  * Status (Active/Inactive)

DASHBOARD PREFERENCES:
- Default Date Range (dropdown: Last 7 days, Last 30 days, Last 90 days, Year to Date)
- Widgets to Display (checkboxes):
  * Revenue Chart
  * Lead Sources
  * Conversion Funnel
  * Sales Performance
  * Inventory Metrics
  * Top Salespeople
- Refresh Interval (dropdown: Manual, 5 min, 15 min, 1 hour)

REPORT SCHEDULING:
- Table of scheduled reports:
  * Report Name, Frequency, Recipients, Last Sent, Actions
- Add Schedule button (modal):
  * Report Type dropdown
  * Frequency (Daily, Weekly, Monthly)
  * Day/Time
  * Recipients (multi-email input)
  * Format (PDF, Excel, CSV)

API:
- GET /api/settings/analytics
- PUT /api/settings/analytics
- GET /api/settings/analytics/custom-events
- POST /api/settings/analytics/custom-events
- DELETE /api/settings/analytics/custom-events/:id
- GET /api/settings/analytics/scheduled-reports
- POST /api/settings/analytics/scheduled-reports
- PUT /api/settings/analytics/scheduled-reports/:id
- DELETE /api/settings/analytics/scheduled-reports/:id

════════════════════════════════════════════════════════════════════
SECTION 12: DEVELOPER PORTAL (DeveloperSettings.tsx) **NEW**
════════════════════════════════════════════════════════════════════

Build developer/technical support interface:

TAB 1 - SYSTEM STATUS:
- Service Health Cards:
  * Express API: Status, Uptime, Last Restart, Memory Usage, CPU
  * PostgreSQL: Status, Connections, Database Size, Query Performance
  * Redis: Status, Memory Usage, Keys Count
  * ClickHouse: Status, Queries/sec, Data Size
  * ML Service: Status, Model Version, Last Training
- Overall System Health: Green/Yellow/Red indicator
- Restart Service buttons (with confirmation)

TAB 2 - TENANT MANAGEMENT:
- Current Tenant Info:
  * Tenant ID, Name, Created Date, Status
  * Database Stats: Record counts per table
  * Storage Usage: MB used / limit
  * API Usage: Requests today / rate limit
- Tenant Settings:
  * Feature Flags (toggle features on/off per tenant)
  * Rate Limits: API requests per hour
  * Storage Limits: Max GB
  * User Limits: Max users
- Danger Zone:
  * Reset Tenant Data button (deletes all data, keeps config)
  * Delete Tenant button (permanent deletion)

TAB 3 - DATABASE CONSOLE:
- SQL Query Editor (Monaco editor or similar)
- Execute Query button
- Results table (with pagination)
- Query History (last 20 queries)
- Saved Queries dropdown
- Export Results (CSV/JSON)
- Warning banner: "Direct database access - be careful!"

TAB 4 - API DEBUGGING:
- Request Logger (live stream):
  * Timestamp, Method, Path, Status Code, Duration, User
  * Filter by: Status Code, Path, User, Date Range
  * Search bar
- Failed Requests (last 100):
  * Error message, Stack trace, Request details
  * Retry button
- API Performance Metrics:
  * Slowest endpoints (bar chart)
  * Error rate by endpoint (table)
  * Request volume over time (line chart)

TAB 5 - JOB QUEUE MONITORING:
- Celery Worker Status:
  * Active workers count
  * Tasks processing
  * Tasks queued
  * Tasks failed (last hour)
- Job Queue Tables:
  * PENDING: Job Name, Enqueued At, Priority, Actions (Cancel)
  * PROCESSING: Job Name, Started At, Progress %, Worker ID
  * COMPLETED: Job Name, Duration, Completed At, Actions (Retry, View Result)
  * FAILED: Job Name, Error, Failed At, Retry Count, Actions (Retry, Delete)
- Manual Job Triggers:
  * Retrain ML Model button
  * Update Lead Scores button
  * Optimize Inventory button
  * Generate Reports button
  * Run Backup button

TAB 6 - SYSTEM LOGS:
- Log Viewer (real-time tail):
  * Timestamp, Level, Service, Message
  * Filters: Level (DEBUG/INFO/WARN/ERROR), Service, Date Range
  * Search bar
  * Auto-refresh toggle
  * Download Logs button
- Log Statistics:
  * Errors in last hour
  * Warnings in last hour
  * Top error messages (frequency table)

TAB 7 - FEATURE FLAGS:
- Feature Flag Table:
  * Feature Name, Description, Status (Global On/Off), Rollout %
  * Per-Tenant Override column
- Add Feature Flag button
- Features examples:
  * enable_ai_pricing
  * enable_pixel_tracking
  * enable_advanced_reporting
  * enable_multi_location
  * enable_service_module

TAB 8 - CACHE MANAGEMENT:
- Redis Cache Stats:
  * Keys count, Memory used, Hit rate, Evictions
- Clear Cache buttons:
  * Clear All Cache (with confirmation)
  * Clear User Sessions
  * Clear Query Cache
  * Clear ML Model Cache
- Cache Key Browser:
  * Search for keys
  * View key value
  * Delete key button

TAB 9 - WEBHOOKS & INTEGRATIONS:
- Webhook Log Table:
  * Timestamp, Event Type, URL, Status Code, Response Time, Retry Count
  * Filter by: Event Type, Status, Date Range
  * Retry Failed Webhooks button
- Integration Health:
  * Card per integration showing: Name, Status, Last Sync, Error Count
  * Force Sync button
  * View Logs button

TAB 10 - PERFORMANCE PROFILER:
- Database Query Profiler:
  * Slowest queries (table with query, time, frequency)
  * Missing indexes suggestions
  * Query optimization hints
- API Response Times:
  * P50, P95, P99 latencies by endpoint
  * Slowest endpoints table
- Memory Profiler:
  * Heap usage over time (chart)
  * Memory leaks detection
  * Garbage collection stats

API Endpoints:
- GET /api/developer/system-status
- POST /api/developer/restart-service/:service
- GET /api/developer/tenant-info
- PUT /api/developer/tenant-settings
- POST /api/developer/sql-query
- GET /api/developer/request-logs
- GET /api/developer/job-queue
- POST /api/developer/trigger-job/:jobName
- GET /api/developer/logs
- GET /api/developer/feature-flags
- PUT /api/developer/feature-flags/:flag
- POST /api/developer/cache/clear
- GET /api/developer/webhooks/logs
- GET /api/developer/performance/queries
- GET /api/developer/performance/endpoints

SECURITY: This section requires both ADMIN role AND a special "developer" permission flag.

════════════════════════════════════════════════════════════════════
SHARED COMPONENTS TO BUILD
════════════════════════════════════════════════════════════════════

1. ColorPicker.tsx:
   - Visual color picker (use react-colorful library)
   - Hex input field
   - Preset colors
   - Props: value, onChange, label

2. ImageUploader.tsx:
   - Drag-drop upload area
   - File type validation (accept .png, .jpg, .svg)
   - Size validation (max 2MB by default, configurable)
   - Image preview
   - Remove button
   - Upload progress bar
   - Props: onUpload, maxSize, acceptedTypes, currentImage

3. RichTextEditor.tsx:
   - Use TipTap or Quill.js
   - Toolbar: Bold, Italic, Underline, Link, Bullet List, Number List
   - Variable insertion ({{customerName}}, {{vehicleName}}, etc.)
   - HTML output
   - Props: value, onChange, variables

4. ToggleSwitch.tsx:
   - Animated toggle (Headless UI Switch)
   - Label support
   - Disabled state
   - Props: enabled, onChange, label, disabled

5. PermissionsMatrix.tsx:
   - Table with permissions as rows, roles as columns
   - Checkboxes in cells
   - Select all row/column
   - Props: permissions, roles, values, onChange

6. AuditLogTable.tsx:
   - Paginated table with search/filter
   - Columns: Timestamp, User, Action, Resource, IP, Details
   - Expandable row for full details
   - Export to CSV button
   - Props: logs, loading, onPageChange, onFilter

7. TestConnectionButton.tsx:
   - Button with loading spinner
   - Success/error states (green checkmark / red X)
   - Tooltip with error message on failure
   - Props: onTest, label

════════════════════════════════════════════════════════════════════
BACKEND IMPLEMENTATION
════════════════════════════════════════════════════════════════════

File: /backend/src/routes/settings.routes.ts

import express from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import * as settingsController from '../controllers/settings.controller';
import { upload } from '../middleware/upload.middleware';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Dealership settings
router.get('/dealership', settingsController.getDealershipSettings);
router.put('/dealership', requireRole(['ADMIN', 'MANAGER']), settingsController.updateDealershipSettings);

// Users & roles
router.get('/users', requireRole(['ADMIN']), settingsController.getUsers);
router.post('/users', requireRole(['ADMIN']), settingsController.createUser);
router.put('/users/:id', requireRole(['ADMIN']), settingsController.updateUser);
router.delete('/users/:id', requireRole(['ADMIN']), settingsController.deleteUser);
router.post('/users/:id/reset-password', requireRole(['ADMIN']), settingsController.resetUserPassword);

// Pricing rules
router.get('/pricing-rules', settingsController.getPricingRules);
router.put('/pricing-rules', requireRole(['ADMIN', 'MANAGER']), settingsController.updatePricingRules);

// Templates
router.get('/templates', settingsController.getTemplates);
router.put('/templates/:id', settingsController.updateTemplate);
router.post('/templates/:id/preview', settingsController.previewTemplate);
router.post('/templates/:id/test-send', settingsController.testSendTemplate);

// Notifications
router.get('/notifications', settingsController.getNotificationSettings);
router.put('/notifications', settingsController.updateNotificationSettings);
router.post('/notifications/test-email', settingsController.testEmail);
router.post('/notifications/test-sms', settingsController.testSMS);

// Security
router.get('/security', requireRole(['ADMIN']), settingsController.getSecuritySettings);
router.put('/security', requireRole(['ADMIN']), settingsController.updateSecuritySettings);
router.get('/api-keys', requireRole(['ADMIN']), settingsController.getApiKeys);
router.post('/api-keys', requireRole(['ADMIN']), settingsController.generateApiKey);
router.delete('/api-keys/:id', requireRole(['ADMIN']), settingsController.revokeApiKey);
router.get('/audit-logs', requireRole(['ADMIN']), settingsController.getAuditLogs);

// Branding
router.get('/branding', settingsController.getBrandingSettings);
router.put('/branding', settingsController.updateBrandingSettings);
router.post('/branding/upload-logo', upload.single('logo'), settingsController.uploadLogo);
router.delete('/branding/logo/:type', settingsController.deleteLogo);

// Integrations
router.get('/integrations', requireRole(['ADMIN']), settingsController.getIntegrations);
router.get('/integrations/:name', requireRole(['ADMIN']), settingsController.getIntegrationConfig);
router.put('/integrations/:name', requireRole(['ADMIN']), settingsController.updateIntegrationConfig);
router.post('/integrations/:name/test', requireRole(['ADMIN']), settingsController.testIntegration);
router.post('/integrations/:name/sync', requireRole(['ADMIN']), settingsController.syncIntegration);

// Backup & Data
router.get('/backup/config', requireRole(['ADMIN']), settingsController.getBackupConfig);
router.put('/backup/config', requireRole(['ADMIN']), settingsController.updateBackupConfig);
router.post('/backup/trigger', requireRole(['ADMIN']), settingsController.triggerBackup);
router.get('/backup/history', requireRole(['ADMIN']), settingsController.getBackupHistory);
router.post('/backup/restore/:id', requireRole(['ADMIN']), settingsController.restoreBackup);
router.post('/export-data', requireRole(['ADMIN']), settingsController.exportData);
router.get('/export-data/:jobId/status', requireRole(['ADMIN']), settingsController.getExportStatus);
router.get('/export-data/:jobId/download', requireRole(['ADMIN']), settingsController.downloadExport);
router.post('/import-data', requireRole(['ADMIN']), upload.single('file'), settingsController.importData);

// Analytics
router.get('/analytics', settingsController.getAnalyticsSettings);
router.put('/analytics', settingsController.updateAnalyticsSettings);
router.get('/analytics/custom-events', settingsController.getCustomEvents);
router.post('/analytics/custom-events', settingsController.createCustomEvent);
router.delete('/analytics/custom-events/:id', settingsController.deleteCustomEvent);
router.get('/analytics/scheduled-reports', settingsController.getScheduledReports);
router.post('/analytics/scheduled-reports', settingsController.createScheduledReport);
router.put('/analytics/scheduled-reports/:id', settingsController.updateScheduledReport);
router.delete('/analytics/scheduled-reports/:id', settingsController.deleteScheduledReport);

// Developer portal (requires special permission)
router.use('/developer', requireRole(['ADMIN']), requireDeveloperAccess);
router.get('/developer/system-status', settingsController.getSystemStatus);
router.post('/developer/restart-service/:service', settingsController.restartService);
router.get('/developer/tenant-info', settingsController.getTenantInfo);
router.put('/developer/tenant-settings', settingsController.updateTenantSettings);
router.post('/developer/sql-query', settingsController.executeSqlQuery);
router.get('/developer/request-logs', settingsController.getRequestLogs);
router.get('/developer/job-queue', settingsController.getJobQueue);
router.post('/developer/trigger-job/:jobName', settingsController.triggerJob);
router.get('/developer/logs', settingsController.getSystemLogs);
router.get('/developer/feature-flags', settingsController.getFeatureFlags);
router.put('/developer/feature-flags/:flag', settingsController.updateFeatureFlag);
router.post('/developer/cache/clear', settingsController.clearCache);
router.get('/developer/webhooks/logs', settingsController.getWebhookLogs);
router.get('/developer/performance/queries', settingsController.getSlowQueries);
router.get('/developer/performance/endpoints', settingsController.getEndpointPerformance);

export default router;

════════════════════════════════════════════════════════════════════

File: /backend/src/controllers/settings.controller.ts

Create controller with all handler functions. Each function should:
1. Extract tenantId from req.user
2. Use settingsService to handle business logic
3. Return proper HTTP status codes
4. Handle errors with try-catch
5. Log audit events for sensitive changes

Example structure:

export const getDealershipSettings = async (req: Request, res: Response) => {
  try {
    const { tenantId } = req.user;
    const settings = await settingsService.getDealershipSettings(tenantId);
    res.json(settings);
  } catch (error) {
    console.error('Error fetching dealership settings:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateDealershipSettings = async (req: Request, res: Response) => {
  try {
    const { tenantId, userId } = req.user;
    const settings = await settingsService.updateDealershipSettings(
      tenantId,
      req.body,
      userId
    );
    
    // Log audit event
    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE_DEALERSHIP_SETTINGS',
      resource: 'settings',
      details: req.body,
    });
    
    res.json(settings);
  } catch (error) {
    console.error('Error updating dealership settings:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

// Implement all other controller functions following this pattern

════════════════════════════════════════════════════════════════════

File: /backend/src/services/settings.service.ts

Create service with all business logic. Use Prisma for database operations.

Example structure:

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getDealershipSettings = async (tenantId: string) => {
  const setting = await prisma.systemSetting.findFirst({
    where: {
      tenantId,
      key: 'dealership_info',
    },
  });
  
  return setting?.value || getDefaultDealershipSettings();
};

export const updateDealershipSettings = async (
  tenantId: string,
  data: any,
  userId: string
) => {
  return await prisma.systemSetting.upsert({
    where: {
      tenantId_key: {
        tenantId,
        key: 'dealership_info',
      },
    },
    update: {
      value: data,
      updatedBy: userId,
      updatedAt: new Date(),
    },
    create: {
      tenantId,
      key: 'dealership_info',
      value: data,
      updatedBy: userId,
    },
  });
};

export const getUsers = async (tenantId: string, params: any) => {
  const { page = 1, limit = 20, search, role } = params;
  
  const where: any = { tenantId };
  
  if (search) {
    where.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  if (role) {
    where.role = role;
  }
  
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
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
      },
    }),
    prisma.user.count({ where }),
  ]);
  
  return {
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const createUser = async (tenantId: string, data: any) => {
  const { email, password, ...userData } = data;
  
  // Check if email exists
  const existingUser = await prisma.user.findFirst({
    where: { tenantId, email },
  });
  
  if (existingUser) {
    throw new Error('Email already exists');
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return await prisma.user.create({
    data: {
      ...userData,
      email,
      password: hashedPassword,
      tenantId,
      status: 'ACTIVE',
    },
  });
};

// Implement all other service functions

════════════════════════════════════════════════════════════════════

File: /backend/src/validations/settings.validation.ts

import { z } from 'zod';

export const dealershipSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  address: z.object({
    street: z.string(),
    city: z.string(),
    state: z.string(),
    zipCode: z.string(),
  }),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
  email: z.string().email(),
  website: z.string().url().optional(),
  taxId: z.string().regex(/^\d{2}-\d{7}$/),
  dealerLicense: z.string(),
  businessHours: z.record(z.object({
    open: z.string(),
    close: z.string(),
    closed: z.boolean(),
  })),
  docFee: z.number().min(0),
  registrationFee: z.number().min(0),
  salesTaxRate: z.number().min(0).max(100),
});

export const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES', 'FINANCE', 'SERVICE', 'BDC']),
  password: z.string().min(8).optional(), // Only for create
  permissions: z.object({
    viewAllDeals: z.boolean(),
    editAllDeals: z.boolean(),
    deleteDeals: z.boolean(),
    viewReports: z.boolean(),
    manageInventory: z.boolean(),
    approveDeals: z.boolean(),
    accessAccounting: z.boolean(),
    manageSettings: z.boolean(),
  }),
});

export const pricingRulesSchema = z.object({
  aiPricingEnabled: z.boolean(),
  pricingStrategy: z.enum(['MARKET_COMPETITIVE', 'PREMIUM', 'VOLUME']),
  aiAdjustmentRange: z.object({
    min: z.number().min(-100).max(0),
    max: z.number().min(0).max(100),
  }),
  marginRules: z.object({
    newVehicles: z.number().min(0),
    usedVehicles: z.number().min(0),
    cpo: z.number().min(0),
  }),
  dealPack: z.number().min(0),
  fiMinimum: z.number().min(0),
  agingDiscounts: z.object({
    days30: z.number(),
    days60: z.number(),
    days90: z.number(),
    days120Plus: z.number(),
  }),
  approvalThresholds: z.object({
    frontGross: z.number(),
    fiGross: z.number(),
  }),
});

// Add more validation schemas for other settings sections

════════════════════════════════════════════════════════════════════
DATABASE SCHEMA
════════════════════════════════════════════════════════════════════

The SystemSetting table should already exist in your Prisma schema:

model SystemSetting {
  id        String   @id @default(uuid())
  tenantId  String
  key       String   // e.g., 'dealership_info', 'pricing_rules', etc.
  value     Json     // Store settings as flexible JSON
  updatedBy String
  updatedAt DateTime @updatedAt
  createdAt DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User   @relation(fields: [updatedBy], references: [id])

  @@unique([tenantId, key])
  @@index([tenantId])
}

If you need to add an AuditLog table:

model AuditLog {
  id        String   @id @default(uuid())
  tenantId  String
  userId    String
  action    String   // e.g., 'UPDATE_DEALERSHIP_SETTINGS'
  resource  String   // e.g., 'settings'
  details   Json?
  ipAddress String?
  createdAt DateTime @default(now())

  tenant Tenant @relation(fields: [tenantId], references: [id])
  user   User   @relation(fields: [userId], references: [id])

  @@index([tenantId])
  @@index([userId])
  @@index([createdAt])
}

════════════════════════════════════════════════════════════════════
DELIVERABLES CHECKLIST
════════════════════════════════════════════════════════════════════

Frontend Components:
✅ SettingsLayout.tsx - Main layout with sidebar
✅ DealershipSettings.tsx - Complete form with all fields
✅ UsersSettings.tsx - User management table + modal
✅ PricingRulesSettings.tsx - Pricing configuration form
✅ FormsSettings.tsx - Template editor interface
✅ NotificationsSettings.tsx - Notification config table
✅ SecuritySettings.tsx - Security controls + audit log viewer
✅ BrandingSettings.tsx - Branding customization
✅ IntegrationsSettings.tsx - Integration management cards
✅ DataSettings.tsx - Backup config + export/import
✅ AnalyticsSettings.tsx - Analytics configuration
✅ DeveloperSettings.tsx - Developer portal with 10 tabs

Shared Components:
✅ ColorPicker.tsx
✅ ImageUploader.tsx
✅ RichTextEditor.tsx
✅ ToggleSwitch.tsx
✅ PermissionsMatrix.tsx
✅ AuditLogTable.tsx
✅ TestConnectionButton.tsx

Backend Files:
✅ settings.routes.ts - All API routes
✅ settings.controller.ts - All controller functions
✅ settings.service.ts - All business logic
✅ settings.validation.ts - Zod validation schemas
✅ settings.middleware.ts - Role checking, developer access

Database:
✅ SystemSetting model (should exist)
✅ AuditLog model (add if missing)
✅ Migration files

Features:
✅ Multi-tenant isolation (all queries filter by tenantId)
✅ Role-based access control (admin-only sections)
✅ Developer portal access control (special permission)
✅ Auto-save indicators
✅ Loading states on all actions
✅ Success/error toasts
✅ Form validation with Zod
✅ Responsive design
✅ Audit logging for sensitive changes

════════════════════════════════════════════════════════════════════
IMPLEMENTATION INSTRUCTIONS
════════════════════════════════════════════════════════════════════

1. CREATE FRONTEND STRUCTURE:
   - Create all 12 page components in /frontend/src/pages/settings/
   - Create all 7 shared components in /frontend/src/components/settings/
   - Use React Hook Form for all forms
   - Use TanStack Query for API calls
   - Use existing design tokens for styling

2. CREATE BACKEND STRUCTURE:
   - Create routes file with all endpoints
   - Create controller with all handler functions
   - Create service with all business logic using Prisma
   - Create validation schemas with Zod
   - Add role-checking middleware

3. UPDATE APP ROUTING:
   Add to your main router:
   
   <Route path="/settings" element={<SettingsLayout />}>
     <Route index element={<Navigate to="/settings/dealership" />} />
     <Route path="dealership" element={<DealershipSettings />} />
     <Route path="users" element={<UsersSettings />} />
     <Route path="pricing" element={<PricingRulesSettings />} />
     <Route path="forms" element={<FormsSettings />} />
     <Route path="notifications" element={<NotificationsSettings />} />
     <Route path="security" element={<SecuritySettings />} />
     <Route path="branding" element={<BrandingSettings />} />
     <Route path="integrations" element={<IntegrationsSettings />} />
     <Route path="data" element={<DataSettings />} />
     <Route path="analytics" element={<AnalyticsSettings />} />
     <Route path="developer" element={<DeveloperSettings />} />
   </Route>

4. UPDATE BACKEND APP:
   Add to your Express app:
   
   import settingsRoutes from './routes/settings.routes';
   app.use('/api/settings', settingsRoutes);

5. DATABASE MIGRATION:
   If AuditLog doesn't exist, add it and run:
   
   npx prisma migrate dev --name add-audit-log

6. INSTALL DEPENDENCIES:
   Frontend:
   npm install react-colorful @tiptap/react @tiptap/starter-kit
   
   Backend:
   npm install multer sharp

7. TESTING:
   - Test each settings section independently
   - Verify multi-tenant isolation (data from one tenant not visible to another)
   - Test role-based access (non-admins can't access restricted sections)
   - Test all form validations
   - Test file uploads (logos)
   - Test integration test connections
   - Test audit logging

════════════════════════════════════════════════════════════════════

NOW BUILD ALL OF PART 3 WITH COMPLETE, PRODUCTION-READY CODE.

Remember:
- No placeholders or TODOs
- All TypeScript code must be fully typed
- Include proper error handling
- Add loading states everywhere
- Include success/error toasts
- Follow existing design patterns
- Make it production-ready
- Multi-tenant awareness on all queries
- Developer portal is the most complex - give it special attention

PROVIDE COMPLETE FILES FOR ALL COMPONENTS AND BACKEND CODE.
```

Copy the prompt above and paste it into a new Claude chat to have Part 3 built! 🚀
