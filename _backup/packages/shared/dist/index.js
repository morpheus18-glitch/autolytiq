// src/schema/index.ts
import { z } from "zod";

// src/schemas/card.ts
function deriveFromWidget(widgetConfig) {
  const mapSize = (w, h) => {
    if (!w || !h) return "MEDIUM";
    if (w === 1 && h === 1) return "SMALL";
    if (w === 2 && h === 2) return "LARGE";
    if (w >= 3 && h === 1) return "WIDE";
    if (w >= 3 && h >= 2) return "FULL";
    return "MEDIUM";
  };
  const inferKind = (key) => {
    if (key.includes("metric") || key.includes("count")) return "metric";
    if (key.includes("trend") || key.includes("chart")) return "trend";
    if (key.includes("list") || key.includes("leads")) return "list";
    if (key.includes("table") || key.includes("grid")) return "table";
    if (key.includes("calendar") || key.includes("schedule")) return "calendar";
    if (key.includes("kanban") || key.includes("board")) return "kanban";
    if (key.includes("alert") || key.includes("warning")) return "alert";
    return "custom";
  };
  return {
    key: widgetConfig.key,
    kind: inferKind(widgetConfig.key),
    context: "none",
    // Widgets don't specify context, default to none
    requiredPermissions: [],
    // No permission checks on legacy widgets (unsafe!)
    size: mapSize(widgetConfig.size?.w, widgetConfig.size?.h),
    componentPath: `@/components/widgets/${widgetConfig.key.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join("")}Widget`,
    config: widgetConfig.config
  };
}
var EXAMPLE_CARDS = [
  {
    key: "active-deals",
    kind: "list",
    context: "none",
    requiredPermissions: ["DEAL_VIEW"],
    roles: ["SALESPERSON", "SALES_MANAGER", "GM"],
    size: "MEDIUM",
    componentPath: "@/components/widgets/ActiveDealsWidget",
    dataSource: "/api/deals?status=ACTIVE&limit=5",
    refreshInterval: 3e4,
    title: "Active Deals",
    description: "List of currently active deals in progress",
    priority: "high",
    tags: ["sales", "deals"]
  },
  {
    key: "hot-leads",
    kind: "list",
    context: "none",
    requiredPermissions: ["LEAD_VIEW"],
    roles: ["SALESPERSON", "BDC", "SALES_MANAGER"],
    size: "MEDIUM",
    componentPath: "@/components/widgets/HotLeadsWidget",
    dataSource: "/api/leads?status=HOT&limit=5",
    refreshInterval: 6e4,
    title: "Hot Leads",
    description: "High-priority leads requiring immediate follow-up",
    priority: "critical",
    tags: ["sales", "leads", "crm"]
  },
  {
    key: "sales-metrics",
    kind: "metric",
    context: "none",
    requiredPermissions: ["ANALYTICS_VIEW"],
    roles: ["SALES_MANAGER", "GM", "CONTROLLER"],
    size: "SMALL",
    componentPath: "@/components/widgets/SalesMetricsWidget",
    dataSource: "/api/analytics/sales/today",
    refreshInterval: 3e5,
    // 5 minutes
    title: "Sales Today",
    description: "Total sales count and revenue for today",
    priority: "normal",
    tags: ["analytics", "sales"]
  },
  {
    key: "inventory-aging",
    kind: "table",
    context: "none",
    requiredPermissions: ["INVENTORY_VIEW"],
    roles: ["SALES_MANAGER", "GM", "USED_CAR_MANAGER"],
    size: "LARGE",
    componentPath: "@/components/widgets/InventoryAgingWidget",
    dataSource: "/api/inventory/aging",
    refreshInterval: 36e5,
    // 1 hour
    title: "Inventory Aging",
    description: "Vehicles by days in stock with pricing recommendations",
    priority: "normal",
    tags: ["inventory", "analytics"]
  }
];

// src/schema/index.ts
var VIN_REGEX = /^[A-HJ-NPR-Z0-9]{11,17}$/i;
var vehicleStatusSchema = z.enum([
  "available",
  "pending",
  "sold",
  "maintenance",
  "in-transit",
  "reserved"
]);
var optionalUrl = z.union([z.string().url("Provide a valid URL"), z.literal("")]).optional();
var optionalNullableNumber = z.number().nonnegative().nullable().optional();
var insertVehicleSchema = z.object({
  make: z.string().min(1, "Make is required"),
  model: z.string().min(1, "Model is required"),
  year: z.number({ invalid_type_error: "Year is required" }).int().min(1900, "Enter a valid model year").max((/* @__PURE__ */ new Date()).getFullYear() + 2, "Model year is too far in the future"),
  vin: z.string().min(11, "VIN must be at least 11 characters").max(17, "VIN must be 17 characters or fewer").regex(VIN_REGEX, "VIN must contain only letters and numbers"),
  price: z.number({ invalid_type_error: "Price is required" }).nonnegative("Price must be positive"),
  status: vehicleStatusSchema,
  trim: z.string().optional(),
  description: z.string().max(4e3).optional(),
  imageUrl: optionalUrl,
  mileage: optionalNullableNumber,
  engine: z.string().optional(),
  transmission: z.string().optional(),
  fuelType: z.string().optional(),
  bodyStyle: z.string().optional(),
  doors: z.number().int().min(0).optional(),
  drivetrain: z.string().optional(),
  color: z.string().optional(),
  location: z.string().optional(),
  msrp: optionalNullableNumber,
  cost: optionalNullableNumber
}).strict();
var vehicleSchema = insertVehicleSchema.extend({
  id: z.union([z.string(), z.number()]),
  tenantId: z.string().optional(),
  stockNumber: z.string().optional(),
  stockNo: z.string().optional(),
  salePrice: optionalNullableNumber,
  daysInStock: z.number().int().nonnegative().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  mileage: optionalNullableNumber,
  cost: optionalNullableNumber,
  features: z.array(z.string()).optional(),
  packages: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  aiInsights: z.object({
    demandScore: z.number().int().min(0).max(100).optional(),
    daysToSell: z.number().int().nonnegative().optional(),
    priceOptimal: z.boolean().optional(),
    recommendedActions: z.array(z.string()).optional()
  }).optional(),
  listing: z.object({
    isListed: z.boolean().optional(),
    channels: z.array(z.string()).optional()
  }).optional(),
  metadata: z.record(z.unknown()).optional(),
  category: z.string().optional(),
  segment: z.string().optional()
}).strict();

// src/settings-schema/index.ts
import { z as z2 } from "zod";
var settingsUserRoles = [
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
  "SUPER_ADMIN"
];
var settingsUserStatuses = ["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"];
var settingsUserPermissionKeys = [
  "viewAllDeals",
  "editAllDeals",
  "deleteDeals",
  "viewReports",
  "manageInventory",
  "approveDeals",
  "accessAccounting",
  "manageSettings"
];
var settingsUserPermissionsSchema = z2.object({
  viewAllDeals: z2.boolean().default(false),
  editAllDeals: z2.boolean().default(false),
  deleteDeals: z2.boolean().default(false),
  viewReports: z2.boolean().default(false),
  manageInventory: z2.boolean().default(false),
  approveDeals: z2.boolean().default(false),
  accessAccounting: z2.boolean().default(false),
  manageSettings: z2.boolean().default(false)
});
var nameSchema = z2.string().trim().min(1, "Required").max(120);
var optionalPhoneSchema = z2.string().trim().max(32).optional().transform((value) => value ?? "");
var settingsUserInputSchema = z2.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: z2.string().trim().email(),
  phone: optionalPhoneSchema,
  role: z2.enum(settingsUserRoles).default("SALES"),
  status: z2.enum(settingsUserStatuses).default("ACTIVE"),
  permissions: settingsUserPermissionsSchema.default({
    viewAllDeals: false,
    editAllDeals: false,
    deleteDeals: false,
    viewReports: false,
    manageInventory: false,
    approveDeals: false,
    accessAccounting: false,
    manageSettings: false
  })
}).strict();
var createSettingsUserSchema = settingsUserInputSchema.extend({
  password: z2.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long")
});
var updateSettingsUserSchema = settingsUserInputSchema.extend({
  password: z2.string().min(8, "Password must be at least 8 characters").max(128, "Password is too long").optional()
});
var settingsUserSchema = settingsUserInputSchema.extend({
  id: z2.string(),
  createdAt: z2.string(),
  updatedAt: z2.string(),
  lastLoginAt: z2.string().optional().nullable()
}).strict();
var paginationMetaSchema = z2.object({
  total: z2.number().int().nonnegative(),
  page: z2.number().int().min(1),
  pageSize: z2.number().int().min(1),
  pageCount: z2.number().int().min(1).optional(),
  hasNext: z2.boolean().optional(),
  hasPrevious: z2.boolean().optional()
}).strict();
var paginatedSettingsUsersSchema = z2.object({
  data: z2.array(settingsUserSchema),
  meta: paginationMetaSchema
}).strict();
var sessionTimeoutOptions = ["15m", "30m", "1h", "2h", "4h", "8h"];
var rememberDurationOptions = ["7d", "14d", "30d", "60d", "90d"];
var webhookStatusOptions = ["ACTIVE", "PAUSED", "DISABLED"];
var webhookSchema = z2.object({
  id: z2.string(),
  event: z2.string().trim().min(1),
  url: z2.string().trim().url(),
  secret: z2.string().trim().min(1),
  status: z2.enum(webhookStatusOptions),
  createdAt: z2.string(),
  updatedAt: z2.string().optional(),
  lastTriggeredAt: z2.string().optional().nullable()
}).strict();
var webhookInputSchema = z2.object({
  event: z2.string().trim().min(1, "Event is required"),
  url: z2.string().trim().url("Provide a valid HTTPS endpoint"),
  secret: z2.string().trim().min(1, "Secret is required"),
  status: z2.enum(webhookStatusOptions).default("ACTIVE")
}).strict();
var apiKeyStatusOptions = ["ACTIVE", "REVOKED", "EXPIRED"];
var apiKeySchema = z2.object({
  id: z2.string(),
  name: z2.string().trim().min(1),
  maskedKey: z2.string().trim().min(4),
  status: z2.enum(apiKeyStatusOptions).default("ACTIVE"),
  createdAt: z2.string(),
  lastUsedAt: z2.string().optional().nullable()
}).strict();
var apiKeyWithSecretSchema = apiKeySchema.extend({
  secret: z2.string().trim().min(10)
});
var auditLogSchema = z2.object({
  id: z2.string(),
  timestamp: z2.string(),
  userId: z2.string().optional().nullable(),
  userName: z2.string().optional().nullable(),
  action: z2.string(),
  resource: z2.string(),
  ipAddress: z2.string().optional().nullable(),
  details: z2.string().optional().nullable()
}).strict();
var paginatedAuditLogSchema = z2.object({
  data: z2.array(auditLogSchema),
  meta: paginationMetaSchema
}).strict();
var securitySettingsSchema = z2.object({
  twoFactorEnabled: z2.boolean().default(false),
  minPasswordLength: z2.number().int().min(8).max(128).default(12),
  requireUppercase: z2.boolean().default(true),
  requireNumber: z2.boolean().default(true),
  requireSpecial: z2.boolean().default(false),
  sessionTimeout: z2.enum(sessionTimeoutOptions).default("30m"),
  rememberDuration: z2.enum(rememberDurationOptions).default("30d"),
  ipWhitelist: z2.array(z2.string().trim().min(1)).default([]),
  ipBlacklist: z2.array(z2.string().trim().min(1)).default([]),
  maxFailedAttempts: z2.number().int().min(1).max(20).default(5),
  lockoutMinutes: z2.number().int().min(1).max(480).default(15),
  webhooks: z2.array(webhookSchema).default([])
}).strict();
var hexColorSchema = z2.string().regex(/^#([0-9a-fA-F]{6})$/, "Must be a hex color");
var optionalUrlSchema = z2.string().trim().url().optional().or(z2.literal("")).transform((value) => value ?? "");
var brandingSettingsSchema = z2.object({
  colors: z2.object({
    primary: hexColorSchema.default("#2563EB"),
    secondary: hexColorSchema.default("#1F2937"),
    accent: hexColorSchema.default("#F59E0B"),
    success: hexColorSchema.default("#059669"),
    warning: hexColorSchema.default("#D97706"),
    error: hexColorSchema.default("#DC2626")
  }).strict(),
  logos: z2.object({
    logo: optionalUrlSchema.default(""),
    darkLogo: optionalUrlSchema.default(""),
    favicon: optionalUrlSchema.default("")
  }).strict(),
  emailBranding: z2.object({
    headerHtml: z2.string().default(""),
    footerHtml: z2.string().default(""),
    fromName: z2.string().default(""),
    fromEmail: z2.union([z2.string().trim().email(), z2.literal("")]).default(""),
    replyTo: z2.union([z2.string().trim().email(), z2.literal("")]).default(""),
    signature: z2.string().default("")
  }).strict(),
  documentBranding: z2.object({
    invoiceHeaderImageUrl: optionalUrlSchema.default(""),
    purchaseAgreementHeaderImageUrl: optionalUrlSchema.default(""),
    invoiceHeaderHtml: z2.string().default(""),
    invoiceFooterHtml: z2.string().default(""),
    purchaseAgreementHeaderHtml: z2.string().default("")
  }).strict(),
  portalTheme: z2.object({
    enabled: z2.boolean().default(false),
    fontFamily: z2.string().default("Inter"),
    borderRadius: z2.number().min(0).max(20).default(6)
  }).strict()
}).strict();
var defaultBrandingSettings = brandingSettingsSchema.parse({});
var businessDays = [
  "MONDAY",
  "TUESDAY",
  "WEDNESDAY",
  "THURSDAY",
  "FRIDAY",
  "SATURDAY",
  "SUNDAY"
];
var DAY_LABELS = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday"
};
var businessHourSchema = z2.object({
  day: z2.enum(businessDays),
  openTime: z2.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  closeTime: z2.string().regex(/^\d{2}:\d{2}$/).default("18:00"),
  closed: z2.boolean().default(false)
}).strict();
var dealershipSettingsSchema = z2.object({
  businessName: z2.string().trim().min(1, "Business name is required"),
  dealerLicenseNumber: z2.string().trim().optional().default(""),
  email: z2.string().trim().email(),
  phone: z2.string().trim().min(7, "Phone is required"),
  websiteUrl: optionalUrlSchema.default(""),
  taxId: z2.string().trim().optional().default(""),
  docFee: z2.number().min(0).default(0),
  registrationFee: z2.number().min(0).default(0),
  stateSalesTaxRate: z2.number().min(0).max(100).default(0),
  address: z2.object({
    street: z2.string().trim().default(""),
    city: z2.string().trim().default(""),
    state: z2.string().trim().length(2, "Use state abbreviation").default(""),
    zip: z2.string().trim().default("")
  }).strict(),
  businessHours: z2.array(businessHourSchema).default(
    businessDays.map((day) => ({
      day,
      openTime: "09:00",
      closeTime: "18:00",
      closed: day === "SUNDAY"
    }))
  ),
  logoUrl: optionalUrlSchema.default("")
}).strict();
var defaultDealershipSettings = {
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
    zip: ""
  },
  businessHours: businessDays.map((day) => ({
    day,
    openTime: "09:00",
    closeTime: "18:00",
    closed: day === "SUNDAY"
  })),
  logoUrl: ""
};
var backupScheduleOptions = ["DAILY_2AM", "EVERY_12H", "WEEKLY", "MONTHLY"];
var backupRetentionOptions = ["7", "14", "30", "60", "90"];
var dataExportEntities = [
  "CUSTOMERS",
  "VEHICLES",
  "DEALS",
  "INVENTORY",
  "JOURNAL_ENTRIES",
  "LEADS",
  "SERVICE_APPOINTMENTS",
  "ANALYTICS_EVENTS"
];
var dataExportFormats = ["CSV", "JSON", "EXCEL"];
var customerRetentionOptions = ["1Y", "2Y", "5Y", "7Y", "INDEFINITE"];
var leadRetentionOptions = ["6M", "1Y", "2Y"];
var analyticsRetentionOptions = ["90D", "180D", "1Y", "2Y"];
var dataSettingsSchema = z2.object({
  backup: z2.object({
    autoBackupEnabled: z2.boolean().default(true),
    schedule: z2.enum(backupScheduleOptions).default("DAILY_2AM"),
    retentionDays: z2.enum(backupRetentionOptions).default("30"),
    storage: z2.object({
      bucket: z2.string().trim().default(""),
      region: z2.string().trim().default(""),
      accessKey: z2.string().trim().default(""),
      secretKey: z2.string().trim().default("")
    }).strict()
  }).strict(),
  retention: z2.object({
    customer: z2.enum(customerRetentionOptions).default("5Y"),
    lead: z2.enum(leadRetentionOptions).default("1Y"),
    analytics: z2.enum(analyticsRetentionOptions).default("1Y"),
    autoPurgeEnabled: z2.boolean().default(false)
  }).strict()
}).strict();
var defaultDataSettings = dataSettingsSchema.parse({});
var analyticsDashboardRanges = ["LAST_7", "LAST_30", "LAST_90", "YTD"];
var analyticsRefreshIntervals = ["MANUAL", "5M", "15M", "1H"];
var analyticsWidgetOptions = [
  "REVENUE",
  "LEAD_SOURCES",
  "CONVERSION_FUNNEL",
  "SALES_PERFORMANCE",
  "INVENTORY_METRICS",
  "TOP_SALESPEOPLE"
];
var conversionGoalTriggerOptions = ["PAGE_VIEW", "EVENT", "CUSTOM"];
var conversionGoalStatusOptions = ["ACTIVE", "INACTIVE"];
var customEventParameterTypes = ["string", "number", "boolean", "date", "currency"];
var reportFrequencyOptions = ["DAILY", "WEEKLY", "MONTHLY"];
var reportFormatOptions = ["PDF", "EXCEL", "CSV"];
var analyticsEventStatusOptions = ["ACTIVE", "INACTIVE", "PAUSED"];
var analyticsEventMetricSchema = z2.object({
  id: z2.string(),
  name: z2.string(),
  status: z2.enum(analyticsEventStatusOptions).default("ACTIVE"),
  countLast30Days: z2.number().int().nonnegative().default(0)
}).strict();
var customEventParameterSchema = z2.object({
  name: z2.string().trim().min(1),
  type: z2.enum(customEventParameterTypes),
  required: z2.boolean().default(false),
  description: z2.string().optional().nullable()
}).strict();
var customEventInputSchema = z2.object({
  name: z2.string().trim().min(1, "Name is required"),
  description: z2.string().trim().optional().default(""),
  parameters: z2.array(customEventParameterSchema.omit({ description: true })).default([])
}).strict();
var customEventSchema = z2.object({
  id: z2.string(),
  name: z2.string(),
  description: z2.string().optional().nullable(),
  parameters: z2.array(customEventParameterSchema).default([]),
  createdAt: z2.string().optional(),
  updatedAt: z2.string().optional()
}).strict();
var scheduledReportBaseSchema = z2.object({
  name: z2.string().trim().min(1),
  reportType: z2.string().trim().min(1),
  frequency: z2.enum(reportFrequencyOptions),
  dayOfWeek: z2.enum([
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday"
  ]).optional(),
  dayOfMonth: z2.number().int().min(1).max(31).optional(),
  timeOfDay: z2.string().regex(/^\d{2}:\d{2}$/).default("09:00"),
  recipients: z2.array(z2.string().email()).min(1),
  format: z2.enum(reportFormatOptions).default("PDF")
}).strict();
var scheduledReportInputSchema = scheduledReportBaseSchema.extend({
  recipients: z2.array(z2.string().email().min(1)).min(1)
});
var scheduledReportSchema = scheduledReportBaseSchema.extend({
  id: z2.string(),
  createdAt: z2.string().optional(),
  updatedAt: z2.string().optional(),
  lastRunAt: z2.string().optional().nullable(),
  nextRunAt: z2.string().optional().nullable()
});
var conversionGoalSchema = z2.object({
  id: z2.string(),
  name: z2.string().trim().min(1),
  triggerType: z2.enum(conversionGoalTriggerOptions),
  triggerValue: z2.string().trim().default(""),
  value: z2.number().min(0).default(0),
  status: z2.enum(conversionGoalStatusOptions).default("ACTIVE")
}).strict();
var analyticsSettingsSchema = z2.object({
  pixelTracking: z2.object({
    enabled: z2.boolean().default(false),
    trackingDomain: z2.string().trim().default("analytics.autolytiq.com")
  }).strict(),
  external: z2.object({
    googleAnalyticsId: z2.string().trim().default(""),
    facebookPixelId: z2.string().trim().default(""),
    tagManagerId: z2.string().trim().default("")
  }).strict(),
  dashboard: z2.object({
    defaultDateRange: z2.enum(analyticsDashboardRanges).default("LAST_30"),
    refreshInterval: z2.enum(analyticsRefreshIntervals).default("15M"),
    widgets: z2.array(z2.enum(analyticsWidgetOptions)).default([...analyticsWidgetOptions])
  }).strict(),
  conversionGoals: z2.array(conversionGoalSchema).default([])
}).strict();
var defaultAnalyticsSettings = analyticsSettingsSchema.parse({});

// src/rbac.ts
function buildEffectivePermissions(user, roles, grants) {
  const effective = {
    userId: user.id,
    roleIds: user.roleIds,
    permissions: /* @__PURE__ */ new Set(),
    denials: /* @__PURE__ */ new Set()
  };
  const roleMap = new Map(roles.map((r) => [r.id, r]));
  for (const roleId of user.roleIds) {
    const role = roleMap.get(roleId);
    if (role) {
      role.permissions.forEach((perm) => effective.permissions.add(perm));
    }
  }
  const userGrants = grants.filter((g) => g.userId === user.id);
  for (const grant of userGrants) {
    if (grant.granted) {
      effective.permissions.add(grant.permission);
    } else {
      effective.denials.add(grant.permission);
      effective.permissions.delete(grant.permission);
    }
  }
  return effective;
}
function makePermChecker(effective) {
  return (permission) => {
    if (effective.denials.has(permission)) {
      return false;
    }
    return effective.permissions.has(permission);
  };
}
function hasAnyPermission(effective, permissions) {
  const can = makePermChecker(effective);
  return permissions.some((perm) => can(perm));
}
function hasAllPermissions(effective, permissions) {
  const can = makePermChecker(effective);
  return permissions.every((perm) => can(perm));
}
function getMissingPermissions(effective, requestedPermissions) {
  const can = makePermChecker(effective);
  return requestedPermissions.filter((perm) => !can(perm));
}
function serializePermissions(effective) {
  return {
    userId: effective.userId,
    roleIds: effective.roleIds,
    permissions: Array.from(effective.permissions),
    denials: Array.from(effective.denials)
  };
}
function deserializePermissions(data) {
  return {
    userId: data.userId,
    roleIds: data.roleIds,
    permissions: new Set(data.permissions),
    denials: new Set(data.denials)
  };
}
var Permissions = {
  // Customer PII
  VIEW_CUSTOMER_PII: "VIEW_CUSTOMER_PII",
  EDIT_CUSTOMER_PII: "EDIT_CUSTOMER_PII",
  EXPORT_CUSTOMER_PII: "EXPORT_CUSTOMER_PII",
  // Deals
  VIEW_DEAL: "VIEW_DEAL",
  CREATE_DEAL: "CREATE_DEAL",
  EDIT_DEAL: "EDIT_DEAL",
  DELETE_DEAL: "DELETE_DEAL",
  APPROVE_DEAL: "APPROVE_DEAL",
  VIEW_DEAL_COST: "VIEW_DEAL_COST",
  VIEW_DEAL_MARGIN: "VIEW_DEAL_MARGIN",
  // Leads
  VIEW_LEAD: "VIEW_LEAD",
  CREATE_LEAD: "CREATE_LEAD",
  EDIT_LEAD: "EDIT_LEAD",
  ASSIGN_LEAD: "ASSIGN_LEAD",
  // Inventory
  VIEW_INVENTORY: "VIEW_INVENTORY",
  EDIT_INVENTORY: "EDIT_INVENTORY",
  VIEW_INVENTORY_COST: "VIEW_INVENTORY_COST",
  PRICE_VEHICLE: "PRICE_VEHICLE",
  // Analytics
  VIEW_ANALYTICS: "VIEW_ANALYTICS",
  VIEW_TEAM_PERFORMANCE: "VIEW_TEAM_PERFORMANCE",
  VIEW_FINANCIAL_REPORTS: "VIEW_FINANCIAL_REPORTS",
  // Administration
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_ROLES: "MANAGE_ROLES",
  VIEW_AUDIT_LOG: "VIEW_AUDIT_LOG",
  MANAGE_SETTINGS: "MANAGE_SETTINGS",
  // Insights
  VIEW_INSIGHTS: "VIEW_INSIGHTS",
  CREATE_INSIGHTS: "CREATE_INSIGHTS",
  CLAIM_INSIGHTS: "CLAIM_INSIGHTS",
  RESOLVE_INSIGHTS: "RESOLVE_INSIGHTS",
  // Widgets/Dashboard
  CUSTOMIZE_DASHBOARD: "CUSTOMIZE_DASHBOARD",
  VIEW_SYSTEM_HEALTH: "VIEW_SYSTEM_HEALTH"
};
var RolePresets = {
  SALESPERSON: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.CREATE_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.VIEW_LEAD,
    Permissions.CREATE_LEAD,
    Permissions.EDIT_LEAD,
    Permissions.VIEW_INVENTORY,
    Permissions.VIEW_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD
  ],
  SALES_MANAGER: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.CREATE_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.APPROVE_DEAL,
    Permissions.VIEW_DEAL_COST,
    Permissions.VIEW_DEAL_MARGIN,
    Permissions.VIEW_LEAD,
    Permissions.CREATE_LEAD,
    Permissions.EDIT_LEAD,
    Permissions.ASSIGN_LEAD,
    Permissions.VIEW_INVENTORY,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_TEAM_PERFORMANCE,
    Permissions.VIEW_INSIGHTS,
    Permissions.CREATE_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.RESOLVE_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD
  ],
  FINANCE_MANAGER: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.EDIT_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.APPROVE_DEAL,
    Permissions.VIEW_DEAL_COST,
    Permissions.VIEW_DEAL_MARGIN,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_FINANCIAL_REPORTS,
    Permissions.VIEW_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.RESOLVE_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD
  ],
  GM: [
    Permissions.VIEW_CUSTOMER_PII,
    Permissions.EDIT_CUSTOMER_PII,
    Permissions.VIEW_DEAL,
    Permissions.CREATE_DEAL,
    Permissions.EDIT_DEAL,
    Permissions.DELETE_DEAL,
    Permissions.APPROVE_DEAL,
    Permissions.VIEW_DEAL_COST,
    Permissions.VIEW_DEAL_MARGIN,
    Permissions.VIEW_LEAD,
    Permissions.ASSIGN_LEAD,
    Permissions.VIEW_INVENTORY,
    Permissions.EDIT_INVENTORY,
    Permissions.VIEW_INVENTORY_COST,
    Permissions.PRICE_VEHICLE,
    Permissions.VIEW_ANALYTICS,
    Permissions.VIEW_TEAM_PERFORMANCE,
    Permissions.VIEW_FINANCIAL_REPORTS,
    Permissions.MANAGE_USERS,
    Permissions.VIEW_INSIGHTS,
    Permissions.CREATE_INSIGHTS,
    Permissions.CLAIM_INSIGHTS,
    Permissions.RESOLVE_INSIGHTS,
    Permissions.CUSTOMIZE_DASHBOARD,
    Permissions.VIEW_SYSTEM_HEALTH
  ],
  ADMIN: [
    // All permissions
    ...Object.values(Permissions)
  ]
};

// src/insights.ts
var InsightStateTransitions = {
  new: ["ack", "snoozed", "claimed", "resolved"],
  ack: ["snoozed", "claimed", "resolved"],
  snoozed: ["new", "ack", "claimed", "resolved"],
  claimed: ["resolved"],
  resolved: []
  // Terminal state
};
function isValidTransition(from, to) {
  return InsightStateTransitions[from].includes(to);
}
function calculateSnoozeUntil(durationMs) {
  return new Date(Date.now() + durationMs);
}
function isInsightExpired(insight) {
  if (!insight.expiresAt) return false;
  return /* @__PURE__ */ new Date() > insight.expiresAt;
}
function isInsightSnoozed(state) {
  if (state.state !== "snoozed") return false;
  if (!state.snoozeUntil) return false;
  return /* @__PURE__ */ new Date() < state.snoozeUntil;
}
function getPriorityScore(priority) {
  const scores = {
    critical: 4,
    high: 3,
    normal: 2,
    low: 1
  };
  return scores[priority];
}
export {
  DAY_LABELS,
  EXAMPLE_CARDS,
  InsightStateTransitions,
  Permissions,
  RolePresets,
  analyticsDashboardRanges,
  analyticsEventMetricSchema,
  analyticsRefreshIntervals,
  analyticsRetentionOptions,
  analyticsSettingsSchema,
  analyticsWidgetOptions,
  apiKeySchema,
  apiKeyStatusOptions,
  apiKeyWithSecretSchema,
  auditLogSchema,
  backupRetentionOptions,
  backupScheduleOptions,
  brandingSettingsSchema,
  buildEffectivePermissions,
  businessDays,
  calculateSnoozeUntil,
  conversionGoalStatusOptions,
  conversionGoalTriggerOptions,
  createSettingsUserSchema,
  customEventInputSchema,
  customEventParameterTypes,
  customEventSchema,
  customerRetentionOptions,
  dataExportEntities,
  dataExportFormats,
  dataSettingsSchema,
  dealershipSettingsSchema,
  defaultAnalyticsSettings,
  defaultBrandingSettings,
  defaultDataSettings,
  defaultDealershipSettings,
  deriveFromWidget,
  deserializePermissions,
  getMissingPermissions,
  getPriorityScore,
  hasAllPermissions,
  hasAnyPermission,
  insertVehicleSchema,
  isInsightExpired,
  isInsightSnoozed,
  isValidTransition,
  leadRetentionOptions,
  makePermChecker,
  paginatedAuditLogSchema,
  paginatedSettingsUsersSchema,
  rememberDurationOptions,
  reportFormatOptions,
  reportFrequencyOptions,
  scheduledReportInputSchema,
  scheduledReportSchema,
  securitySettingsSchema,
  serializePermissions,
  sessionTimeoutOptions,
  settingsUserInputSchema,
  settingsUserPermissionKeys,
  settingsUserPermissionsSchema,
  settingsUserRoles,
  settingsUserSchema,
  settingsUserStatuses,
  updateSettingsUserSchema,
  vehicleSchema,
  vehicleStatusSchema,
  webhookInputSchema,
  webhookSchema,
  webhookStatusOptions
};
//# sourceMappingURL=index.js.map