import { z } from "zod";

/**
 * =========================
 * User management schemas
 * =========================
 */

export const settingsUserRoles = [
  "SALES",
  "SALES_MANAGER",
  "FINANCE",
  "FINANCE_MANAGER",
  "SERVICE",
  "SERVICE_MANAGER",
  "BDC",
  "ACCOUNTING",
  "OPERATIONS",
  "MARKETING",
  "ADMIN",
  "SUPER_ADMIN",
] as const;

export type SettingsUserRole = (typeof settingsUserRoles)[number];

export const settingsUserStatuses = ["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"] as const;

export type SettingsUserStatus = (typeof settingsUserStatuses)[number];

export const settingsUserPermissionKeys = [
  "viewAllDeals",
  "editAllDeals",
  "deleteDeals",
  "viewReports",
  "manageInventory",
  "approveDeals",
  "accessAccounting",
  "manageSettings",
] as const;

export type SettingsUserPermissionKey = (typeof settingsUserPermissionKeys)[number];

export const settingsUserPermissionsSchema = z.object({
  viewAllDeals: z.boolean().default(false),
  editAllDeals: z.boolean().default(false),
  deleteDeals: z.boolean().default(false),
  viewReports: z.boolean().default(false),
  manageInventory: z.boolean().default(false),
  approveDeals: z.boolean().default(false),
  accessAccounting: z.boolean().default(false),
  manageSettings: z.boolean().default(false),
});

const nameSchema = z.string().trim().min(1, "Required").max(120);
const optionalPhoneSchema = z
  .string()
  .trim()
  .max(32)
  .optional()
  .transform((value) => value ?? "");

export const settingsUserInputSchema = z
  .object({
    firstName: nameSchema,
    lastName: nameSchema,
    email: z.string().trim().email(),
    phone: optionalPhoneSchema,
    role: z.enum(settingsUserRoles).default("SALES"),
    status: z.enum(settingsUserStatuses).default("ACTIVE"),
    permissions: settingsUserPermissionsSchema.default({
      viewAllDeals: false,
      editAllDeals: false,
      deleteDeals: false,
      viewReports: false,
      manageInventory: false,
      approveDeals: false,
      accessAccounting: false,
      manageSettings: false,
    }),
  })
  .strict();

export type SettingsUserInput = z.infer<typeof settingsUserInputSchema>;

export const createSettingsUserSchema = settingsUserInputSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long"),
});

export type CreateSettingsUserInput = z.infer<typeof createSettingsUserSchema>;

export const updateSettingsUserSchema = settingsUserInputSchema.extend({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password is too long")
    .optional(),
});

export type UpdateSettingsUserInput = z.infer<typeof updateSettingsUserSchema>;

export const settingsUserSchema = settingsUserInputSchema
  .extend({
    id: z.string(),
    createdAt: z.string(),
    updatedAt: z.string(),
    lastLoginAt: z.string().optional().nullable(),
  })
  .strict();

export type SettingsUser = z.infer<typeof settingsUserSchema>;

const paginationMetaSchema = z
  .object({
    total: z.number().int().nonnegative(),
    page: z.number().int().min(1),
    pageSize: z.number().int().min(1),
    pageCount: z.number().int().min(1).optional(),
    hasNext: z.boolean().optional(),
    hasPrevious: z.boolean().optional(),
  })
  .strict();

export const paginatedSettingsUsersSchema = z
  .object({
    data: z.array(settingsUserSchema),
    meta: paginationMetaSchema,
  })
  .strict();

/**
 * =========================
 * Security settings schemas
 * =========================
 */

export const sessionTimeoutOptions = ["15m", "30m", "1h", "2h", "4h", "8h"] as const;
export type SessionTimeoutOption = (typeof sessionTimeoutOptions)[number];

export const rememberDurationOptions = ["7d", "14d", "30d", "60d", "90d"] as const;
export type RememberDurationOption = (typeof rememberDurationOptions)[number];

export const webhookStatusOptions = ["ACTIVE", "PAUSED", "DISABLED"] as const;
export type WebhookStatus = (typeof webhookStatusOptions)[number];

export const webhookSchema = z
  .object({
    id: z.string(),
    event: z.string().trim().min(1),
    url: z.string().trim().url(),
    secret: z.string().trim().min(1),
    status: z.enum(webhookStatusOptions),
    createdAt: z.string(),
    updatedAt: z.string().optional(),
    lastTriggeredAt: z.string().optional().nullable(),
  })
  .strict();

export type WebhookConfig = z.infer<typeof webhookSchema>;

export const webhookInputSchema = z
  .object({
    event: z.string().trim().min(1, "Event is required"),
    url: z.string().trim().url("Provide a valid HTTPS endpoint"),
    secret: z.string().trim().min(1, "Secret is required"),
    status: z.enum(webhookStatusOptions).default("ACTIVE"),
  })
  .strict();

export type WebhookInput = z.infer<typeof webhookInputSchema>;

export const apiKeyStatusOptions = ["ACTIVE", "REVOKED", "EXPIRED"] as const;
export type ApiKeyStatus = (typeof apiKeyStatusOptions)[number];

export const apiKeySchema = z
  .object({
    id: z.string(),
    name: z.string().trim().min(1),
    maskedKey: z.string().trim().min(4),
    status: z.enum(apiKeyStatusOptions).default("ACTIVE"),
    createdAt: z.string(),
    lastUsedAt: z.string().optional().nullable(),
  })
  .strict();

export type ApiKeyRecord = z.infer<typeof apiKeySchema>;

export const apiKeyWithSecretSchema = apiKeySchema.extend({
  secret: z.string().trim().min(10),
});

export type ApiKeyWithSecret = z.infer<typeof apiKeyWithSecretSchema>;

export const auditLogSchema = z
  .object({
    id: z.string(),
    timestamp: z.string(),
    userId: z.string().optional().nullable(),
    userName: z.string().optional().nullable(),
    action: z.string(),
    resource: z.string(),
    ipAddress: z.string().optional().nullable(),
    details: z.string().optional().nullable(),
  })
  .strict();

export type AuditLogEntry = z.infer<typeof auditLogSchema>;

export const paginatedAuditLogSchema = z
  .object({
    data: z.array(auditLogSchema),
    meta: paginationMetaSchema,
  })
  .strict();

export const securitySettingsSchema = z
  .object({
    twoFactorEnabled: z.boolean().default(false),
    minPasswordLength: z.number().int().min(8).max(128).default(12),
    requireUppercase: z.boolean().default(true),
    requireNumber: z.boolean().default(true),
    requireSpecial: z.boolean().default(false),
    sessionTimeout: z.enum(sessionTimeoutOptions).default("30m"),
    rememberDuration: z.enum(rememberDurationOptions).default("30d"),
    ipWhitelist: z.array(z.string().trim().min(1)).default([]),
    ipBlacklist: z.array(z.string().trim().min(1)).default([]),
    maxFailedAttempts: z.number().int().min(1).max(20).default(5),
    lockoutMinutes: z.number().int().min(1).max(480).default(15),
    webhooks: z.array(webhookSchema).default([]),
  })
  .strict();

export type SecuritySettings = z.infer<typeof securitySettingsSchema>;

/**
 * =========================
 * Branding settings schemas
 * =========================
 */

const hexColorSchema = z.string().regex(/^#([0-9a-fA-F]{6})$/, "Must be a hex color");
const optionalUrlSchema = z
  .string()
  .trim()
  .url()
  .optional()
  .or(z.literal(""))
  .transform((value) => value ?? "");

export const brandingSettingsSchema = z
  .object({
    colors: z
      .object({
        primary: hexColorSchema.default("#2563EB"),
        secondary: hexColorSchema.default("#1F2937"),
        accent: hexColorSchema.default("#F59E0B"),
        success: hexColorSchema.default("#059669"),
        warning: hexColorSchema.default("#D97706"),
        error: hexColorSchema.default("#DC2626"),
      })
      .strict(),
    logos: z
      .object({
        logo: optionalUrlSchema.default(""),
        darkLogo: optionalUrlSchema.default(""),
        favicon: optionalUrlSchema.default(""),
      })
      .strict(),
    emailBranding: z
      .object({
        headerHtml: z.string().default(""),
        footerHtml: z.string().default(""),
        fromName: z.string().default(""),
        fromEmail: z.union([z.string().trim().email(), z.literal("")]).default(""),
        replyTo: z.union([z.string().trim().email(), z.literal("")]).default(""),
        signature: z.string().default(""),
      })
      .strict(),
    documentBranding: z
      .object({
        invoiceHeaderImageUrl: optionalUrlSchema.default(""),
        purchaseAgreementHeaderImageUrl: optionalUrlSchema.default(""),
        invoiceHeaderHtml: z.string().default(""),
        invoiceFooterHtml: z.string().default(""),
        purchaseAgreementHeaderHtml: z.string().default(""),
      })
      .strict(),
    portalTheme: z
      .object({
        enabled: z.boolean().default(false),
        fontFamily: z.string().default("Inter"),
        borderRadius: z.number().min(0).max(20).default(6),
      })
      .strict(),
  })
  .strict();

export type BrandingSettings = z.infer<typeof brandingSettingsSchema>;

export const defaultBrandingSettings: BrandingSettings = brandingSettingsSchema.parse({});

/**
 * =========================
 * Dealership settings schemas
 * =========================
 */

export const businessDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY",
] as const;

export type BusinessDay = (typeof businessDays)[number];

export const DAY_LABELS: Record<BusinessDay, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const businessHourSchema = z
  .object({
    day: z.enum(businessDays),
    openTime: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
    closeTime: z.string().regex(/^\d{2}:\d{2}$/).default("18:00"),
    closed: z.boolean().default(false),
  })
  .strict();

export type BusinessHour = z.infer<typeof businessHourSchema>;

export const dealershipSettingsSchema = z
  .object({
    businessName: z.string().trim().min(1, "Business name is required"),
    dealerLicenseNumber: z.string().trim().optional().default(""),
    email: z.string().trim().email(),
    phone: z.string().trim().min(7, "Phone is required"),
    websiteUrl: optionalUrlSchema.default(""),
    taxId: z.string().trim().optional().default(""),
    docFee: z.number().min(0).default(0),
    registrationFee: z.number().min(0).default(0),
    stateSalesTaxRate: z.number().min(0).max(100).default(0),
    address: z
      .object({
        street: z.string().trim().default(""),
        city: z.string().trim().default(""),
        state: z.string().trim().length(2, "Use state abbreviation").default(""),
        zip: z.string().trim().default(""),
      })
      .strict(),
    businessHours: z
      .array(businessHourSchema)
      .default(
        businessDays.map((day) => ({
          day,
          openTime: "09:00",
          closeTime: "18:00",
          closed: day === "SUNDAY",
        } satisfies BusinessHour)),
      ),
    logoUrl: optionalUrlSchema.default(""),
  })
  .strict();

export type DealershipSettings = z.infer<typeof dealershipSettingsSchema>;

export const defaultDealershipSettings: DealershipSettings = {
  businessName: "",
  dealerLicenseNumber: "",
  email: "",
  phone: "",
  websiteUrl: "",
  taxId: "",
  docFee: 0,
  registrationFee: 0,
  stateSalesTaxRate: 0,
  address: {
    street: "",
    city: "",
    state: "",
    zip: "",
  },
  businessHours: businessDays.map((day) => ({
    day,
    openTime: "09:00",
    closeTime: "18:00",
    closed: day === "SUNDAY",
  })),
  logoUrl: "",
} satisfies DealershipSettings;

/**
 * =========================
 * Data governance schemas
 * =========================
 */

export const backupScheduleOptions = ["DAILY_2AM", "EVERY_12H", "WEEKLY", "MONTHLY"] as const;
export type BackupSchedule = (typeof backupScheduleOptions)[number];

export const backupRetentionOptions = ["7", "14", "30", "60", "90"] as const;
export type BackupRetentionWindow = (typeof backupRetentionOptions)[number];

export const dataExportEntities = [
  "CUSTOMERS",
  "VEHICLES",
  "DEALS",
  "INVENTORY",
  "JOURNAL_ENTRIES",
  "LEADS",
  "SERVICE_APPOINTMENTS",
  "ANALYTICS_EVENTS",
] as const;
export type DataExportEntity = (typeof dataExportEntities)[number];

export const dataExportFormats = ["CSV", "JSON", "EXCEL"] as const;
export type DataExportFormat = (typeof dataExportFormats)[number];

export const customerRetentionOptions = ["1Y", "2Y", "5Y", "7Y", "INDEFINITE"] as const;
export type CustomerRetentionWindow = (typeof customerRetentionOptions)[number];

export const leadRetentionOptions = ["6M", "1Y", "2Y"] as const;
export type LeadRetentionWindow = (typeof leadRetentionOptions)[number];

export const analyticsRetentionOptions = ["90D", "180D", "1Y", "2Y"] as const;
export type AnalyticsRetentionWindow = (typeof analyticsRetentionOptions)[number];

export const dataSettingsSchema = z
  .object({
    backup: z
      .object({
        autoBackupEnabled: z.boolean().default(true),
        schedule: z.enum(backupScheduleOptions).default("DAILY_2AM"),
        retentionDays: z.enum(backupRetentionOptions).default("30"),
        storage: z
          .object({
            bucket: z.string().trim().default(""),
            region: z.string().trim().default(""),
            accessKey: z.string().trim().default(""),
            secretKey: z.string().trim().default(""),
          })
          .strict(),
      })
      .strict(),
    retention: z
      .object({
        customer: z.enum(customerRetentionOptions).default("5Y"),
        lead: z.enum(leadRetentionOptions).default("1Y"),
        analytics: z.enum(analyticsRetentionOptions).default("1Y"),
        autoPurgeEnabled: z.boolean().default(false),
      })
      .strict(),
  })
  .strict();

export type DataSettings = z.infer<typeof dataSettingsSchema>;

export const defaultDataSettings: DataSettings = dataSettingsSchema.parse({});

/**
 * =========================
 * Analytics settings schemas
 * =========================
 */

export const analyticsDashboardRanges = ["LAST_7", "LAST_30", "LAST_90", "YTD"] as const;
export type AnalyticsDashboardRange = (typeof analyticsDashboardRanges)[number];

export const analyticsRefreshIntervals = ["MANUAL", "5M", "15M", "1H"] as const;
export type AnalyticsRefreshInterval = (typeof analyticsRefreshIntervals)[number];

export const analyticsWidgetOptions = [
  "REVENUE",
  "LEAD_SOURCES",
  "CONVERSION_FUNNEL",
  "SALES_PERFORMANCE",
  "INVENTORY_METRICS",
  "TOP_SALESPEOPLE",
] as const;
export type AnalyticsWidget = (typeof analyticsWidgetOptions)[number];

export const conversionGoalTriggerOptions = ["PAGE_VIEW", "EVENT", "CUSTOM"] as const;
export type ConversionGoalTrigger = (typeof conversionGoalTriggerOptions)[number];

export const conversionGoalStatusOptions = ["ACTIVE", "INACTIVE"] as const;
export type ConversionGoalStatus = (typeof conversionGoalStatusOptions)[number];

export const customEventParameterTypes = ["string", "number", "boolean", "date", "currency"] as const;
export type CustomEventParameterType = (typeof customEventParameterTypes)[number];

export const reportFrequencyOptions = ["DAILY", "WEEKLY", "MONTHLY"] as const;
export type ReportFrequency = (typeof reportFrequencyOptions)[number];

export const reportFormatOptions = ["PDF", "EXCEL", "CSV"] as const;
export type ReportFormat = (typeof reportFormatOptions)[number];

const analyticsEventStatusOptions = ["ACTIVE", "INACTIVE", "PAUSED"] as const;

export const analyticsEventMetricSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    status: z.enum(analyticsEventStatusOptions).default("ACTIVE"),
    countLast30Days: z.number().int().nonnegative().default(0),
  })
  .strict();

export type AnalyticsEventMetric = z.infer<typeof analyticsEventMetricSchema>;

const customEventParameterSchema = z
  .object({
    name: z.string().trim().min(1),
    type: z.enum(customEventParameterTypes),
    required: z.boolean().default(false),
    description: z.string().optional().nullable(),
  })
  .strict();

export type CustomEventParameter = z.infer<typeof customEventParameterSchema>;

export const customEventInputSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required"),
    description: z.string().trim().optional().default(""),
    parameters: z.array(customEventParameterSchema.omit({ description: true })).default([]),
  })
  .strict();

export type CustomEventInput = z.infer<typeof customEventInputSchema>;

export const customEventSchema = z
  .object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional().nullable(),
    parameters: z.array(customEventParameterSchema).default([]),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
  })
  .strict();

export type CustomEventDefinition = z.infer<typeof customEventSchema>;

const scheduledReportBaseSchema = z
  .object({
    name: z.string().trim().min(1),
    reportType: z.string().trim().min(1),
    frequency: z.enum(reportFrequencyOptions),
    dayOfWeek: z
      .enum([
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
      ] as const)
      .optional(),
    dayOfMonth: z.number().int().min(1).max(31).optional(),
    timeOfDay: z.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
    recipients: z.array(z.string().email()).min(1),
    format: z.enum(reportFormatOptions).default("PDF"),
  })
  .strict();

export const scheduledReportInputSchema = scheduledReportBaseSchema.extend({
  recipients: z.array(z.string().email().min(1)).min(1),
});

export type ScheduledReportInput = z.infer<typeof scheduledReportInputSchema>;

export const scheduledReportSchema = scheduledReportBaseSchema.extend({
  id: z.string(),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional(),
  lastRunAt: z.string().optional().nullable(),
  nextRunAt: z.string().optional().nullable(),
});

export type ScheduledReportDefinition = z.infer<typeof scheduledReportSchema>;

const conversionGoalSchema = z
  .object({
    id: z.string(),
    name: z.string().trim().min(1),
    triggerType: z.enum(conversionGoalTriggerOptions),
    triggerValue: z.string().trim().default(""),
    value: z.number().min(0).default(0),
    status: z.enum(conversionGoalStatusOptions).default("ACTIVE"),
  })
  .strict();

export type ConversionGoal = z.infer<typeof conversionGoalSchema>;

export const analyticsSettingsSchema = z
  .object({
    pixelTracking: z
      .object({
        enabled: z.boolean().default(false),
        trackingDomain: z.string().trim().default("analytics.autolytiq.com"),
      })
      .strict(),
    external: z
      .object({
        googleAnalyticsId: z.string().trim().default(""),
        facebookPixelId: z.string().trim().default(""),
        tagManagerId: z.string().trim().default(""),
      })
      .strict(),
    dashboard: z
      .object({
        defaultDateRange: z.enum(analyticsDashboardRanges).default("LAST_30"),
        refreshInterval: z.enum(analyticsRefreshIntervals).default("15M"),
        widgets: z.array(z.enum(analyticsWidgetOptions)).default([...analyticsWidgetOptions]),
      })
      .strict(),
    conversionGoals: z.array(conversionGoalSchema).default([]),
  })
  .strict();

export type AnalyticsSettings = z.infer<typeof analyticsSettingsSchema>;

export const defaultAnalyticsSettings: AnalyticsSettings = analyticsSettingsSchema.parse({});
