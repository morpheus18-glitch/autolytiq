import { z } from 'zod';

// -----------------------------------------------------------------------------
// User & Role Management Schemas
// -----------------------------------------------------------------------------

export const settingsUserRoles = ['ADMIN', 'MANAGER', 'SALES', 'FINANCE', 'SERVICE', 'BDC'] as const;

export type SettingsUserRole = (typeof settingsUserRoles)[number];

export const settingsUserStatuses = ['ACTIVE', 'INACTIVE'] as const;

export type SettingsUserStatus = (typeof settingsUserStatuses)[number];

export const settingsUserPermissionKeys = [
  'viewAllDeals',
  'editAllDeals',
  'deleteDeals',
  'viewReports',
  'manageInventory',
  'approveDeals',
  'accessAccounting',
  'manageSettings',
] as const;

export type SettingsUserPermissionKey = (typeof settingsUserPermissionKeys)[number];

const permissionShape = settingsUserPermissionKeys.reduce(
  (accumulator, permission) => {
    accumulator[permission] = z.boolean().default(false);
    return accumulator;
  },
  {} as Record<SettingsUserPermissionKey, z.ZodType<boolean>>,
);

export const settingsUserPermissionsSchema = z
  .object(permissionShape)
  .strict();

const userPhoneRegex = /^(?:\+?[0-9.\-()\s]{7,20})$/;

const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(''))
  .superRefine((value, ctx) => {
    if (!value) {
      return;
    }

    if (!userPhoneRegex.test(value)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Enter a valid phone number',
      });
    }
  })
  .transform((value) => (value ? value : ''));

export const settingsUserInputSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Provide a valid email'),
  phone: optionalPhoneSchema,
  role: z.enum(settingsUserRoles),
  status: z.enum(settingsUserStatuses).default('ACTIVE'),
  permissions: settingsUserPermissionsSchema,
});

export const createSettingsUserSchema = settingsUserInputSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long'),
});

export const updateSettingsUserSchema = settingsUserInputSchema.extend({
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password is too long')
    .optional(),
});

export const settingsUserSchema = settingsUserInputSchema.extend({
  id: z.string(),
  lastLoginAt: z.string().datetime().nullable().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const paginatedSettingsUsersSchema = z.object({
  data: z.array(settingsUserSchema),
  meta: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  }),
});

export type SettingsUserInput = z.infer<typeof settingsUserInputSchema>;
export type CreateSettingsUserInput = z.infer<typeof createSettingsUserSchema>;
export type UpdateSettingsUserInput = z.infer<typeof updateSettingsUserSchema>;
export type SettingsUser = z.infer<typeof settingsUserSchema>;

// -----------------------------------------------------------------------------
// Security Configuration Schemas
// -----------------------------------------------------------------------------

export const sessionTimeoutOptions = ['15m', '30m', '1h', '2h', '4h', '8h'] as const;
export const rememberDurationOptions = ['7d', '14d', '30d'] as const;

export const webhookStatusOptions = ['ACTIVE', 'INACTIVE'] as const;

const stringListSchema = z
  .array(z.string().trim())
  .default([])
  .transform((items) => items.filter((item) => item.length > 0));

export const webhookInputSchema = z.object({
  event: z.string().min(1, 'Event name is required'),
  url: z.string().url('Provide a valid URL'),
  secret: z.string().min(8, 'Secret must be at least 8 characters'),
  status: z.enum(webhookStatusOptions).default('ACTIVE'),
});

export const webhookSchema = webhookInputSchema.extend({
  id: z.string(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const securitySettingsSchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  minPasswordLength: z.number().int().min(8).max(20).default(12),
  requireUppercase: z.boolean().default(true),
  requireNumber: z.boolean().default(true),
  requireSpecial: z.boolean().default(true),
  sessionTimeout: z.enum(sessionTimeoutOptions).default('30m'),
  rememberDuration: z.enum(rememberDurationOptions).default('14d'),
  ipWhitelist: stringListSchema,
  ipBlacklist: stringListSchema,
  maxFailedAttempts: z.number().int().min(1).max(20).default(5),
  lockoutMinutes: z.number().int().min(1).max(8 * 60).default(30),
  webhooks: z.array(webhookSchema).default([]),
});

export type SecuritySettings = z.infer<typeof securitySettingsSchema>;
export type WebhookConfig = z.infer<typeof webhookSchema>;
export type WebhookInput = z.infer<typeof webhookInputSchema>;

export const apiKeyStatusOptions = ['ACTIVE', 'REVOKED'] as const;

export const apiKeySchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Key name is required'),
  maskedKey: z.string(),
  createdAt: z.string().datetime(),
  lastUsedAt: z.string().datetime().nullable(),
  status: z.enum(apiKeyStatusOptions).default('ACTIVE'),
});

export const apiKeyWithSecretSchema = apiKeySchema.extend({
  secret: z.string(),
});

export type ApiKeyRecord = z.infer<typeof apiKeySchema>;
export type ApiKeyWithSecret = z.infer<typeof apiKeyWithSecretSchema>;

export const auditLogEntrySchema = z.object({
  id: z.string(),
  timestamp: z.string().datetime(),
  userName: z.string(),
  userId: z.string().optional(),
  action: z.string(),
  resource: z.string(),
  ipAddress: z.string().nullable().optional(),
  details: z.string().nullable().optional(),
});

export const paginatedAuditLogSchema = z.object({
  data: z.array(auditLogEntrySchema),
  meta: z.object({
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    total: z.number().int().min(0),
  }),
});

export type AuditLogEntry = z.infer<typeof auditLogEntrySchema>;

export const WEEK_DAYS = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

export type WeekDay = (typeof WEEK_DAYS)[number];

const timeRegex = /^([01]\d|2[0-3]):[0-5]\d$/;

const timeSchema = z
  .string({ required_error: 'Time is required' })
  .regex(timeRegex, 'Use 24-hour time in HH:MM format');

const businessHourSchema = z.object({
  day: z.enum(WEEK_DAYS),
  openTime: timeSchema,
  closeTime: timeSchema,
  closed: z.boolean(),
});

export const businessHoursSchema = z
  .array(businessHourSchema)
  .length(WEEK_DAYS.length, 'Provide business hours for each day of the week')
  .superRefine((hours, ctx) => {
    const seen = new Set<WeekDay>();
    hours.forEach((hour, index) => {
      if (seen.has(hour.day)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Duplicate day entries are not allowed',
          path: [index, 'day'],
        });
      }
      seen.add(hour.day);

      if (!hour.closed) {
        if (!timeRegex.test(hour.openTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Opening time is required when the dealership is open',
            path: [index, 'openTime'],
          });
        }
        if (!timeRegex.test(hour.closeTime)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Closing time is required when the dealership is open',
            path: [index, 'closeTime'],
          });
        }
        if (hour.closeTime <= hour.openTime) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Closing time must be later than opening time',
            path: [index, 'closeTime'],
          });
        }
      }
    });
  });

const optionalUrlSchema = z
  .union([z.string().url(), z.literal(''), z.null(), z.undefined()])
  .transform((value) => {
    if (!value) {
      return '';
    }
    return value;
  });

const currencySchema = z
  .coerce
  .number({ invalid_type_error: 'Enter a valid amount' })
  .min(0, 'Amount cannot be negative')
  .max(1_000_000, 'Amount is unreasonably large');

const phoneRegex = /^(?:\(\d{3}\) \d{3}-\d{4})$/;
const taxIdRegex = /^\d{2}-\d{7}$/;
const zipRegex = /^\d{5}(?:-\d{4})?$/;
const stateRegex = /^(?:A[EKLRZ]|C[AOT]|D[EC]|F[LM]|G[AU]|H[HI]|I[ADLN]|K[SY]|LA|M[ADEHINOPST]|N[CDEHJMVY]|O[HK]|P[AE]|R[IL]|S[CD]|T[NX]|UT|V[AIT]|W[AIVY])$/;

export const dealershipSettingsSchema = z.object({
  businessName: z.string().min(1, 'Business name is required'),
  address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z
      .string()
      .toUpperCase()
      .regex(stateRegex, 'Use a valid two-letter state abbreviation'),
    zip: z.string().regex(zipRegex, 'Use a valid ZIP code (12345 or 12345-6789)'),
  }),
  phone: z.string().regex(phoneRegex, 'Use the format (555) 123-4567'),
  email: z.string().email('Enter a valid email address'),
  websiteUrl: optionalUrlSchema,
  taxId: z.string().regex(taxIdRegex, 'Use the format 12-3456789'),
  dealerLicenseNumber: z.string().min(1, 'Dealer license number is required'),
  businessHours: businessHoursSchema,
  docFee: currencySchema,
  registrationFee: currencySchema,
  stateSalesTaxRate: z
    .coerce
    .number({ invalid_type_error: 'Enter a valid percentage' })
    .min(0, 'Tax rate cannot be negative')
    .max(100, 'Tax rate cannot exceed 100%'),
  logoUrl: optionalUrlSchema,
});

export type DealershipSettings = z.infer<typeof dealershipSettingsSchema>;
export type BusinessHour = DealershipSettings['businessHours'][number];

const colorHexSchema = z
  .string({ required_error: 'Color is required' })
  .regex(/^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Provide a valid hex color');

const htmlContentSchema = z
  .string()
  .max(20000, 'Content is too long');

export const brandAssetTypes = [
  'logo',
  'darkLogo',
  'favicon',
  'invoiceHeader',
  'purchaseAgreementHeader',
] as const;

export type BrandAssetType = (typeof brandAssetTypes)[number];

export const brandingSettingsSchema = z.object({
  colors: z.object({
    primary: colorHexSchema,
    secondary: colorHexSchema,
    accent: colorHexSchema,
    success: colorHexSchema,
    warning: colorHexSchema,
    error: colorHexSchema,
  }),
  logos: z.object({
    logo: optionalUrlSchema,
    darkLogo: optionalUrlSchema,
    favicon: optionalUrlSchema,
  }),
  emailBranding: z.object({
    headerHtml: htmlContentSchema,
    footerHtml: htmlContentSchema,
  }),
  documentBranding: z.object({
    invoiceHeaderHtml: htmlContentSchema,
    invoiceHeaderImageUrl: optionalUrlSchema,
    invoiceFooterHtml: htmlContentSchema,
    purchaseAgreementHeaderHtml: htmlContentSchema,
    purchaseAgreementHeaderImageUrl: optionalUrlSchema,
  }),
  portalTheme: z.object({
    enabled: z.boolean(),
    fontFamily: z.enum(['Inter', 'Roboto', 'Open Sans', 'Lato', 'Montserrat']),
    borderRadius: z.number().min(0, 'Border radius cannot be negative').max(20, 'Border radius must be 20px or less'),
  }),
});

export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;

export const defaultBusinessHours: DealershipSettings['businessHours'] = WEEK_DAYS.map((day) => ({
  day,
  openTime: '09:00',
  closeTime: '18:00',
  closed: day === 'sunday',
}));

export const defaultDealershipSettings: DealershipSettings = {
  businessName: '',
  address: {
    street: '',
    city: '',
    state: '',
    zip: '',
  },
  phone: '',
  email: '',
  websiteUrl: '',
  taxId: '',
  dealerLicenseNumber: '',
  businessHours: defaultBusinessHours,
  docFee: 0,
  registrationFee: 0,
  stateSalesTaxRate: 0,
  logoUrl: '',
};

export const defaultBrandingSettings: BrandingSettings = {
  colors: {
    primary: '#2563EB',
    secondary: '#7C3AED',
    accent: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
  },
  logos: {
    logo: '',
    darkLogo: '',
    favicon: '',
  },
  emailBranding: {
    headerHtml: '',
    footerHtml: '',
  },
  documentBranding: {
    invoiceHeaderHtml: '',
    invoiceHeaderImageUrl: '',
    invoiceFooterHtml: '',
    purchaseAgreementHeaderHtml: '',
    purchaseAgreementHeaderImageUrl: '',
  },
  portalTheme: {
    enabled: false,
    fontFamily: 'Inter',
    borderRadius: 8,
  },
};

export const DAY_LABELS: Record<WeekDay, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

// -----------------------------------------------------------------------------
// Data & Backup Schemas
// -----------------------------------------------------------------------------

export const backupScheduleOptions = ['DAILY_2AM', 'EVERY_12H', 'WEEKLY', 'MONTHLY'] as const;

export type BackupSchedule = (typeof backupScheduleOptions)[number];

export const backupRetentionOptions = ['7', '14', '30', '60', '90'] as const;

export type BackupRetentionWindow = (typeof backupRetentionOptions)[number];

export const backupStorageSchema = z
  .object({
    bucket: z.string().min(1, 'Bucket name is required'),
    region: z.string().min(1, 'Region is required'),
    accessKey: z.string().min(1, 'Access key is required'),
    secretKey: z.string().min(1, 'Secret key is required'),
  })
  .strict();

export type BackupStorageSettings = z.infer<typeof backupStorageSchema>;

export const backupSettingsSchema = z
  .object({
    autoBackupEnabled: z.boolean().default(true),
    schedule: z.enum(backupScheduleOptions).default('DAILY_2AM'),
    retentionDays: z.enum(backupRetentionOptions).default('30'),
    storage: backupStorageSchema,
  })
  .strict();

export type BackupSettings = z.infer<typeof backupSettingsSchema>;

export const customerRetentionOptions = ['1Y', '2Y', '5Y', '7Y', 'INDEFINITE'] as const;
export const leadRetentionOptions = ['6M', '1Y', '2Y'] as const;
export const analyticsRetentionOptions = ['1Y', '2Y', '5Y'] as const;

export type CustomerRetentionWindow = (typeof customerRetentionOptions)[number];
export type LeadRetentionWindow = (typeof leadRetentionOptions)[number];
export type AnalyticsRetentionWindow = (typeof analyticsRetentionOptions)[number];

export const dataRetentionSettingsSchema = z
  .object({
    customer: z.enum(customerRetentionOptions).default('INDEFINITE'),
    lead: z.enum(leadRetentionOptions).default('1Y'),
    analytics: z.enum(analyticsRetentionOptions).default('2Y'),
    autoPurgeEnabled: z.boolean().default(false),
  })
  .strict();

export type DataRetentionSettings = z.infer<typeof dataRetentionSettingsSchema>;

export const dataSettingsSchema = z
  .object({
    backup: backupSettingsSchema,
    retention: dataRetentionSettingsSchema,
  })
  .strict();

export type DataSettings = z.infer<typeof dataSettingsSchema>;

export const defaultDataSettings: DataSettings = {
  backup: {
    autoBackupEnabled: true,
    schedule: 'DAILY_2AM',
    retentionDays: '30',
    storage: {
      bucket: '',
      region: '',
      accessKey: '',
      secretKey: '',
    },
  },
  retention: {
    customer: 'INDEFINITE',
    lead: '1Y',
    analytics: '2Y',
    autoPurgeEnabled: false,
  },
};

export const dataExportFormats = ['CSV', 'JSON', 'EXCEL'] as const;

export type DataExportFormat = (typeof dataExportFormats)[number];

export const dataExportEntities = [
  'CUSTOMERS',
  'VEHICLES',
  'DEALS',
  'INVENTORY',
  'JOURNAL_ENTRIES',
  'LEADS',
  'SERVICE_APPOINTMENTS',
  'ANALYTICS_EVENTS',
] as const;

export type DataExportEntity = (typeof dataExportEntities)[number];

// -----------------------------------------------------------------------------
// Analytics & Tracking Schemas
// -----------------------------------------------------------------------------

export const analyticsDashboardRanges = ['LAST_7', 'LAST_30', 'LAST_90', 'YTD'] as const;
export const analyticsRefreshIntervals = ['MANUAL', '5M', '15M', '1H'] as const;

export type AnalyticsDashboardRange = (typeof analyticsDashboardRanges)[number];
export type AnalyticsRefreshInterval = (typeof analyticsRefreshIntervals)[number];

export const analyticsWidgetOptions = [
  'REVENUE',
  'LEAD_SOURCES',
  'CONVERSION_FUNNEL',
  'SALES_PERFORMANCE',
  'INVENTORY_METRICS',
  'TOP_SALESPEOPLE',
] as const;

export type AnalyticsWidget = (typeof analyticsWidgetOptions)[number];

export const conversionGoalTriggerOptions = ['PAGE_VIEW', 'EVENT', 'CUSTOM'] as const;
export const conversionGoalStatusOptions = ['ACTIVE', 'INACTIVE'] as const;

export type ConversionGoalTrigger = (typeof conversionGoalTriggerOptions)[number];
export type ConversionGoalStatus = (typeof conversionGoalStatusOptions)[number];

export const conversionGoalSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, 'Goal name is required'),
    triggerType: z.enum(conversionGoalTriggerOptions),
    triggerValue: z.string().min(1, 'Trigger value is required'),
    value: z.number().min(0, 'Goal value must be zero or positive').default(0),
    status: z.enum(conversionGoalStatusOptions).default('ACTIVE'),
  })
  .strict();

export type ConversionGoal = z.infer<typeof conversionGoalSchema>;

export const analyticsSettingsSchema = z
  .object({
    pixelTracking: z
      .object({
        enabled: z.boolean().default(true),
        trackingDomain: z.string().optional().default(''),
      })
      .strict(),
    external: z
      .object({
        googleAnalyticsId: z.string().optional().default(''),
        facebookPixelId: z.string().optional().default(''),
        tagManagerId: z.string().optional().default(''),
      })
      .strict(),
    dashboard: z
      .object({
        defaultDateRange: z.enum(analyticsDashboardRanges).default('LAST_30'),
        widgets: z.array(z.enum(analyticsWidgetOptions)).default([
          'REVENUE',
          'LEAD_SOURCES',
          'CONVERSION_FUNNEL',
        ]),
        refreshInterval: z.enum(analyticsRefreshIntervals).default('15M'),
      })
      .strict(),
    conversionGoals: z.array(conversionGoalSchema).default([]),
  })
  .strict();

export type AnalyticsSettings = z.infer<typeof analyticsSettingsSchema>;

export const defaultAnalyticsSettings: AnalyticsSettings = {
  pixelTracking: {
    enabled: true,
    trackingDomain: '',
  },
  external: {
    googleAnalyticsId: '',
    facebookPixelId: '',
    tagManagerId: '',
  },
  dashboard: {
    defaultDateRange: 'LAST_30',
    widgets: ['REVENUE', 'LEAD_SOURCES', 'CONVERSION_FUNNEL'],
    refreshInterval: '15M',
  },
  conversionGoals: [
    {
      id: 'goal-lead-submitted',
      name: 'Lead Submitted',
      triggerType: 'EVENT',
      triggerValue: 'lead_submitted',
      value: 0,
      status: 'ACTIVE',
    },
    {
      id: 'goal-test-drive',
      name: 'Test Drive Scheduled',
      triggerType: 'EVENT',
      triggerValue: 'test_drive_scheduled',
      value: 0,
      status: 'ACTIVE',
    },
    {
      id: 'goal-deal-closed',
      name: 'Deal Closed',
      triggerType: 'CUSTOM',
      triggerValue: 'deal_closed',
      value: 500,
      status: 'ACTIVE',
    },
  ],
};

export const analyticsEventStatusOptions = ['ACTIVE', 'PAUSED'] as const;

export type AnalyticsEventStatus = (typeof analyticsEventStatusOptions)[number];

export const analyticsEventMetricSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    countLast30Days: z.number().min(0).default(0),
    status: z.enum(analyticsEventStatusOptions).default('ACTIVE'),
  })
  .strict();

export type AnalyticsEventMetric = z.infer<typeof analyticsEventMetricSchema>;

export const customEventParameterTypes = ['string', 'number', 'boolean', 'object', 'array'] as const;

export type CustomEventParameterType = (typeof customEventParameterTypes)[number];

export const customEventParameterSchema = z
  .object({
    name: z.string().min(1, 'Parameter name is required'),
    type: z.enum(customEventParameterTypes).default('string'),
    required: z.boolean().default(false),
  })
  .strict();

export const customEventSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, 'Event name is required'),
    description: z.string().optional().default(''),
    parameters: z.array(customEventParameterSchema).default([]),
  })
  .strict();

export type CustomEventDefinition = z.infer<typeof customEventSchema>;

export const customEventInputSchema = customEventSchema.omit({ id: true });

export type CustomEventInput = z.infer<typeof customEventInputSchema>;

export const reportFrequencyOptions = ['DAILY', 'WEEKLY', 'MONTHLY'] as const;
export const reportFormatOptions = ['PDF', 'EXCEL', 'CSV'] as const;

export type ReportFrequency = (typeof reportFrequencyOptions)[number];
export type ReportFormat = (typeof reportFormatOptions)[number];

export const scheduledReportSchema = z
  .object({
    id: z.string(),
    name: z.string().min(1, 'Report name is required'),
    reportType: z.string().min(1, 'Report type is required'),
    frequency: z.enum(reportFrequencyOptions),
    dayOfWeek: z.string().optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    timeOfDay: z.string().min(1, 'Time of day is required'),
    recipients: z.array(z.string().email('Enter a valid recipient email')).min(1, 'At least one recipient'),
    format: z.enum(reportFormatOptions),
    lastSentAt: z.string().datetime().nullable().optional(),
    status: z.enum(['ACTIVE', 'PAUSED']).default('ACTIVE'),
  })
  .strict();

export type ScheduledReportDefinition = z.infer<typeof scheduledReportSchema>;

export const scheduledReportInputSchema = scheduledReportSchema.omit({ id: true, lastSentAt: true });

export type ScheduledReportInput = z.infer<typeof scheduledReportInputSchema>;
