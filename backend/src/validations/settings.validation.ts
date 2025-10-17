import { z } from 'zod';

export const dealershipSettingsSchema = z.object({
  businessName: z.string().min(1),
  address: z.object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zipCode: z.string().optional(),
  }),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/),
  email: z.string().email(),
  website: z.string().url().optional(),
  taxId: z.string().regex(/^\d{2}-\d{7}$/),
  dealerLicense: z.string().optional(),
  businessHours: z.record(
    z.object({
      open: z.string(),
      close: z.string(),
      closed: z.boolean(),
    }),
  ),
  docFee: z.number().min(0),
  registrationFee: z.number().min(0),
  salesTaxRate: z.number().min(0).max(100),
  logoUrl: z.string().url().optional(),
});

export const userSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().optional(),
  role: z.enum(['ADMIN', 'MANAGER', 'SALES', 'FINANCE', 'SERVICE', 'BDC']),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  password: z.string().min(8).optional(),
  isSuperAdmin: z.boolean().optional(),
  permissions: z
    .object({
      viewAllDeals: z.boolean(),
      editAllDeals: z.boolean(),
      deleteDeals: z.boolean(),
      viewReports: z.boolean(),
      manageInventory: z.boolean(),
      approveDeals: z.boolean(),
      accessAccounting: z.boolean(),
      manageSettings: z.boolean(),
    })
    .partial()
    .optional(),
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

export const notificationsSchema = z.object({
  email: z.object({
    enabled: z.boolean(),
    senderName: z.string().min(1),
    senderEmail: z.string().email(),
  }),
  sms: z.object({
    enabled: z.boolean(),
    provider: z.string().min(1),
    fromNumber: z.string().optional(),
  }),
  alerts: z.array(z.object({ type: z.string(), enabled: z.boolean() })),
});

export const brandingSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
  logoUrl: z.string().url().optional(),
  faviconUrl: z.string().url().optional(),
  typography: z.object({
    headingFont: z.string(),
    bodyFont: z.string(),
  }),
});

export const securitySettingsSchema = z.object({
  mfaRequired: z.boolean(),
  passwordRotationDays: z.number().min(0),
  sessionTimeoutMinutes: z.number().min(5),
  allowedIpRanges: z.array(z.string()).optional(),
  blockedCountries: z.array(z.string()).optional(),
});

export const integrationSchema = z.object({
  enabled: z.boolean(),
  credentials: z.record(z.string()).optional(),
  settings: z.record(z.any()).optional(),
});

export const backupSettingsSchema = z.object({
  schedule: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  retentionDays: z.number().min(1),
  destination: z.enum(['S3', 'AZURE_BLOB', 'GCS']),
  encryption: z.boolean(),
});

export const dataSettingsSchema = z.object({
  autoPurgeInactiveCustomersDays: z.number().min(0).optional(),
  autoPurgeLeadsDays: z.number().min(0).optional(),
  piiAccessRoles: z.array(z.string()),
});

export const analyticsSettingsSchema = z.object({
  dashboardRefreshMinutes: z.number().min(1),
  conversionGoals: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      target: z.number().min(0),
      active: z.boolean(),
    }),
  ),
  widgets: z.array(z.object({ id: z.string(), type: z.string(), position: z.number() })),
});

export const templateSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['EMAIL', 'SMS', 'DOCUMENT']),
  subject: z.string().optional(),
  body: z.string(),
  updatedAt: z.string(),
});

export const customEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  metric: z.string(),
  status: z.enum(['ACTIVE', 'PAUSED']),
  parameters: z.array(z.object({ key: z.string(), type: z.string(), required: z.boolean() })),
});

export const scheduledReportSchema = z.object({
  id: z.string(),
  name: z.string(),
  frequency: z.enum(['DAILY', 'WEEKLY', 'MONTHLY']),
  recipients: z.array(z.string().email()),
  format: z.enum(['PDF', 'CSV']),
  active: z.boolean(),
});

export const featureFlagSchema = z.object({
  key: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
});

export const apiKeySchema = z.object({
  id: z.string(),
  label: z.string(),
  lastUsedAt: z.string().nullable(),
  createdAt: z.string(),
});

export const auditLogSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  userId: z.string(),
  action: z.string(),
  resource: z.string(),
  details: z.any().optional(),
  ipAddress: z.string().nullable(),
  createdAt: z.string(),
});
