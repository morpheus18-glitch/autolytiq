import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  varchar,
  decimal,
  json,
  primaryKey,
  unique,
  date,
  jsonb,
  index,
  uuid,
  foreignKey,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations, sql } from "drizzle-orm";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// =============================
// Multi-tenant organization layer
// =============================

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    parentId: uuid("parent_id"),
    name: varchar("name", { length: 255 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }),
    slug: varchar("slug", { length: 120 }).notNull().unique(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    onboardingStatus: varchar("onboarding_status", { length: 50 })
      .default("not_started")
      .notNull(),
    subscriptionPlan: varchar("subscription_plan", { length: 50 })
      .default("standard")
      .notNull(),
    timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
    locale: varchar("locale", { length: 20 }).default("en-US").notNull(),
    industry: varchar("industry", { length: 100 }).default("automotive").notNull(),
    dataRegion: varchar("data_region", { length: 50 }).default("us-east").notNull(),
    crmEnabled: boolean("crm_enabled").default(true).notNull(),
    dmsEnabled: boolean("dms_enabled").default(true).notNull(),
    inventoryEnabled: boolean("inventory_enabled").default(true).notNull(),
    marketingEnabled: boolean("marketing_enabled").default(true).notNull(),
    supportPlan: varchar("support_plan", { length: 50 }).default("standard").notNull(),
    billingEmail: varchar("billing_email", { length: 255 }),
    primaryDomain: varchar("primary_domain", { length: 255 }),
    logoUrl: varchar("logo_url", { length: 500 }),
    settings: jsonb("settings").default({}).notNull(),
    complianceTags: jsonb("compliance_tags").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    parentIdx: index("organizations_parent_idx").on(table.parentId),
    parentFk: foreignKey({
      name: "organizations_parent_id_fkey",
      columns: [table.parentId],
      foreignColumns: [table.id],
    }),
  }),
);

export const organizationSettings = pgTable(
  "organization_settings",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    category: varchar("category", { length: 100 }).default("general").notNull(),
    settings: jsonb("settings").default({}).notNull(),
    updatedBy: varchar("updated_by", { length: 100 }),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_settings_org_idx").on(table.organizationId),
    unique("organization_settings_org_category_unique").on(
      table.organizationId,
      table.category,
    ),
  ],
);

export const organizationFeatures = pgTable(
  "organization_features",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    featureKey: varchar("feature_key", { length: 100 }).notNull(),
    isEnabled: boolean("is_enabled").default(true).notNull(),
    rolloutStrategy: varchar("rollout_strategy", { length: 50 }).default("all").notNull(),
    rolloutMetadata: jsonb("rollout_metadata").default({}).notNull(),
    enforcedAt: timestamp("enforced_at"),
    expiresAt: timestamp("expires_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_features_org_idx").on(table.organizationId),
    unique("organization_features_unique").on(table.organizationId, table.featureKey),
  ],
);

export const organizationDomains = pgTable(
  "organization_domains",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    domain: varchar("domain", { length: 255 }).notNull(),
    purpose: varchar("purpose", { length: 50 }).default("login").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    verificationStatus: varchar("verification_status", { length: 50 })
      .default("pending")
      .notNull(),
    verifiedAt: timestamp("verified_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_domains_org_idx").on(table.organizationId),
    unique("organization_domains_unique").on(table.organizationId, table.domain),
  ],
);

export const organizationBillingProfiles = pgTable(
  "organization_billing_profiles",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    billingName: varchar("billing_name", { length: 255 }).notNull(),
    billingEmail: varchar("billing_email", { length: 255 }).notNull(),
    billingPhone: varchar("billing_phone", { length: 50 }),
    address: jsonb("address").default({}).notNull(),
    paymentMethod: varchar("payment_method", { length: 50 }).default("invoice").notNull(),
    billingCycle: varchar("billing_cycle", { length: 50 }).default("monthly").notNull(),
    currency: varchar("currency", { length: 10 }).default("USD").notNull(),
    taxId: varchar("tax_id", { length: 100 }),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("organization_billing_profiles_org_idx").on(table.organizationId)],
);

export const organizationIntegrations = pgTable(
  "organization_integrations",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    integrationType: varchar("integration_type", { length: 100 }).notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    credentials: jsonb("credentials").default({}).notNull(),
    syncState: jsonb("sync_state").default({}).notNull(),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_integrations_org_idx").on(table.organizationId),
    unique("organization_integrations_unique").on(
      table.organizationId,
      table.integrationType,
    ),
  ],
);

export const organizationAuditLog = pgTable(
  "organization_audit_log",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    actorId: varchar("actor_id", { length: 100 }),
    action: varchar("action", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("organization_audit_log_org_idx").on(table.organizationId)],
);

export const organizationDataPolicies = pgTable(
  "organization_data_policies",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    policyType: varchar("policy_type", { length: 100 }).notNull(),
    retentionPeriodDays: integer("retention_period_days").default(0).notNull(),
    legalBasis: varchar("legal_basis", { length: 100 }),
    autoArchive: boolean("auto_archive").default(false).notNull(),
    autoDelete: boolean("auto_delete").default(false).notNull(),
    policyDocumentUrl: varchar("policy_document_url", { length: 500 }),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_data_policies_org_idx").on(table.organizationId),
    unique("organization_data_policies_unique").on(
      table.organizationId,
      table.policyType,
    ),
  ],
);

export const organizationUnits = pgTable(
  "organization_units",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    parentUnitId: uuid("parent_unit_id"),
    name: varchar("name", { length: 255 }).notNull(),
    code: varchar("code", { length: 50 }),
    unitType: varchar("unit_type", { length: 50 })
      .default("dealership")
      .notNull(),
    timezone: varchar("timezone", { length: 100 }).default("UTC").notNull(),
    currency: varchar("currency", { length: 10 }).default("USD").notNull(),
    locale: varchar("locale", { length: 20 }).default("en-US").notNull(),
    contactEmail: varchar("contact_email", { length: 255 }),
    contactPhone: varchar("contact_phone", { length: 50 }),
    address: jsonb("address").default({}).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index("organization_units_org_idx").on(table.organizationId),
    parentIdx: index("organization_units_parent_idx").on(table.parentUnitId),
    parentFk: foreignKey({
      name: "organization_units_parent_unit_id_fkey",
      columns: [table.parentUnitId],
      foreignColumns: [table.id],
    }),
  }),
);

export const organizationUnitSettings = pgTable(
  "organization_unit_settings",
  {
    id: serial("id").primaryKey(),
    unitId: uuid("unit_id")
      .references(() => organizationUnits.id)
      .notNull(),
    category: varchar("category", { length: 100 }).default("general").notNull(),
    settings: jsonb("settings").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_unit_settings_unit_idx").on(table.unitId),
    unique("organization_unit_settings_unique").on(table.unitId, table.category),
  ],
);

export const organizationUnitHours = pgTable(
  "organization_unit_hours",
  {
    id: serial("id").primaryKey(),
    unitId: uuid("unit_id")
      .references(() => organizationUnits.id)
      .notNull(),
    dayOfWeek: integer("day_of_week").notNull(),
    openTime: varchar("open_time", { length: 20 }),
    closeTime: varchar("close_time", { length: 20 }),
    isClosed: boolean("is_closed").default(false).notNull(),
    department: varchar("department", { length: 100 }).default("sales").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [index("organization_unit_hours_unit_idx").on(table.unitId)],
);

export const organizationUnitChannels = pgTable(
  "organization_unit_channels",
  {
    id: serial("id").primaryKey(),
    unitId: uuid("unit_id")
      .references(() => organizationUnits.id)
      .notNull(),
    channelType: varchar("channel_type", { length: 50 }).notNull(),
    label: varchar("label", { length: 100 }),
    value: varchar("value", { length: 255 }).notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_unit_channels_unit_idx").on(table.unitId),
    unique("organization_unit_channels_unique").on(
      table.unitId,
      table.channelType,
      table.value,
    ),
  ],
);

export const organizationInvites = pgTable(
  "organization_invites",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    roleId: integer("role_id").references(() => roles.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    invitedBy: varchar("invited_by", { length: 100 }),
    token: varchar("token", { length: 255 }).notNull().unique(),
    expiresAt: timestamp("expires_at").notNull(),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_invites_org_idx").on(table.organizationId),
    unique("organization_invites_unique").on(table.organizationId, table.email),
  ],
);

export const entityScopes = pgTable(
  "entity_scopes",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    entityType: varchar("entity_type", { length: 100 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    visibility: varchar("visibility", { length: 50 }).default("private").notNull(),
    accessMatrix: jsonb("access_matrix").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("entity_scopes_org_idx").on(table.organizationId, table.entityType),
    unique("entity_scopes_unique").on(table.entityType, table.entityId),
  ],
);

export const salesPipelines = pgTable(
  "sales_pipelines",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    name: varchar("name", { length: 150 }).notNull(),
    pipelineType: varchar("pipeline_type", { length: 50 })
      .default("vehicle_sales")
      .notNull(),
    isDefault: boolean("is_default").default(false).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    weightingStrategy: varchar("weighting_strategy", { length: 50 })
      .default("probability")
      .notNull(),
    settings: jsonb("settings").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("sales_pipelines_org_idx").on(table.organizationId),
    unique("sales_pipelines_unique").on(table.organizationId, table.name),
  ],
);

export const pipelineStages = pgTable(
  "pipeline_stages",
  {
    id: serial("id").primaryKey(),
    pipelineId: uuid("pipeline_id")
      .references(() => salesPipelines.id)
      .notNull(),
    name: varchar("name", { length: 150 }).notNull(),
    probability: integer("probability").default(0).notNull(),
    sortOrder: integer("sort_order").default(0).notNull(),
    stageType: varchar("stage_type", { length: 50 })
      .default("standard")
      .notNull(),
    exitCriteria: jsonb("exit_criteria").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("pipeline_stages_pipeline_idx").on(table.pipelineId),
    unique("pipeline_stages_unique").on(table.pipelineId, table.name),
  ],
);

export const revenueTargets = pgTable(
  "revenue_targets",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    departmentId: integer("department_id").references(() => departments.id),
    ownerId: varchar("owner_id", { length: 100 }).references(() => users.id),
    period: varchar("period", { length: 20 }).default("monthly").notNull(),
    periodStart: date("period_start").notNull(),
    periodEnd: date("period_end").notNull(),
    targetType: varchar("target_type", { length: 50 }).default("gross").notNull(),
    targetAmount: decimal("target_amount", { precision: 14, scale: 2 }).notNull(),
    stretchGoal: decimal("stretch_goal", { precision: 14, scale: 2 }),
    actualAmount: decimal("actual_amount", { precision: 14, scale: 2 }),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("revenue_targets_org_idx").on(table.organizationId, table.periodStart),
    index("revenue_targets_unit_idx").on(table.unitId),
  ],
);

export const inventoryPools = pgTable(
  "inventory_pools",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    name: varchar("name", { length: 150 }).notNull(),
    poolType: varchar("pool_type", { length: 50 }).default("showroom").notNull(),
    criteria: jsonb("criteria").default({}).notNull(),
    distributionStrategy: varchar("distribution_strategy", { length: 50 })
      .default("balanced")
      .notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("inventory_pools_org_idx").on(table.organizationId),
    unique("inventory_pools_unique").on(table.organizationId, table.name),
  ],
);

export const marketingCampaigns = pgTable(
  "marketing_campaigns",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    name: varchar("name", { length: 200 }).notNull(),
    objective: varchar("objective", { length: 100 }).default("lead_generation").notNull(),
    status: varchar("status", { length: 50 }).default("draft").notNull(),
    startDate: date("start_date"),
    endDate: date("end_date"),
    budgetAmount: decimal("budget_amount", { precision: 14, scale: 2 }),
    spendAmount: decimal("spend_amount", { precision: 14, scale: 2 }),
    primaryChannel: varchar("primary_channel", { length: 50 }),
    audienceDefinition: jsonb("audience_definition").default({}).notNull(),
    trackingParameters: jsonb("tracking_parameters").default({}).notNull(),
    attributionModel: varchar("attribution_model", { length: 50 }).default("multi_touch").notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdBy: varchar("created_by", { length: 100 }).references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("marketing_campaigns_org_idx").on(table.organizationId),
    index("marketing_campaigns_unit_idx").on(table.unitId),
    unique("marketing_campaigns_unique").on(table.organizationId, table.name),
  ],
);

export const marketingCampaignChannels = pgTable(
  "marketing_campaign_channels",
  {
    id: serial("id").primaryKey(),
    campaignId: integer("campaign_id")
      .references(() => marketingCampaigns.id)
      .notNull(),
    channel: varchar("channel", { length: 100 }).notNull(),
    budgetAmount: decimal("budget_amount", { precision: 14, scale: 2 }),
    spendAmount: decimal("spend_amount", { precision: 14, scale: 2 }),
    targetCpa: decimal("target_cpa", { precision: 14, scale: 2 }),
    trackingParameters: jsonb("tracking_parameters").default({}).notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("marketing_campaign_channels_campaign_idx").on(table.campaignId),
    unique("marketing_campaign_channels_unique").on(table.campaignId, table.channel),
  ],
);

export const marketingAudiences = pgTable(
  "marketing_audiences",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    name: varchar("name", { length: 200 }).notNull(),
    audienceType: varchar("audience_type", { length: 50 }).default("crm").notNull(),
    sizeEstimate: integer("size_estimate"),
    definition: jsonb("definition").default({}).notNull(),
    syncTargets: jsonb("sync_targets").default({}).notNull(),
    lastSyncedAt: timestamp("last_synced_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("marketing_audiences_org_idx").on(table.organizationId),
    unique("marketing_audiences_unique").on(table.organizationId, table.name),
  ],
);

export const marketingAttributionEvents = pgTable(
  "marketing_attribution_events",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    campaignId: integer("campaign_id").references(() => marketingCampaigns.id),
    entityType: varchar("entity_type", { length: 50 }).notNull(),
    entityId: varchar("entity_id", { length: 100 }).notNull(),
    touchpointType: varchar("touchpoint_type", { length: 50 }).notNull(),
    touchpointDate: timestamp("touchpoint_date").notNull(),
    weight: decimal("weight", { precision: 5, scale: 2 }).default("1.00").notNull(),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("marketing_attribution_events_org_idx").on(table.organizationId),
    index("marketing_attribution_events_campaign_idx").on(table.campaignId),
  ],
);

// Departments table
export const departments = pgTable(
  "departments",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    parentDepartmentId: integer("parent_department_id"),
    name: text("name").notNull(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    orgIdx: index("departments_org_idx").on(table.organizationId),
    unitIdx: index("departments_unit_idx").on(table.unitId),
    orgNameUnique: unique("departments_org_name_unique").on(
      table.organizationId,
      table.name,
    ),
    parentFk: foreignKey({
      name: "departments_parent_department_id_fkey",
      columns: [table.parentDepartmentId],
      foreignColumns: [table.id],
    }),
  }),
);

// Roles table
export const roles = pgTable(
  "roles",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    name: text("name").notNull(),
    description: text("description"),
    departmentId: integer("department_id").references(() => departments.id),
    scope: varchar("scope", { length: 50 }).default("tenant").notNull(),
    isSystem: boolean("is_system").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("roles_org_idx").on(table.organizationId),
    index("roles_unit_idx").on(table.unitId),
    unique("roles_org_name_unique").on(table.organizationId, table.name),
  ],
);

// Permissions table
export const permissions = pgTable(
  "permissions",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    name: text("name").notNull(),
    description: text("description"),
    resource: text("resource").notNull(), // vehicles, customers, leads, sales, reports, etc.
    action: text("action").notNull(), // create, read, update, delete, export, etc.
    module: varchar("module", { length: 50 }).default("core").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("permissions_org_idx").on(table.organizationId),
    unique("permissions_org_name_unique").on(table.organizationId, table.name),
  ],
);

// Role permissions junction table
export const rolePermissions = pgTable("role_permissions", {
  roleId: integer("role_id").references(() => roles.id).notNull(),
  permissionId: integer("permission_id").references(() => permissions.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.roleId, table.permissionId] }),
}));

// Updated users table for Multi-Provider OAuth Auth compatibility
export const users = pgTable(
  "users",
  {
    id: varchar("id").primaryKey().notNull(), // Changed to varchar for OAuth Auth
    organizationId: uuid("organization_id").references(() => organizations.id),
    primaryUnitId: uuid("primary_unit_id").references(() => organizationUnits.id),
    email: varchar("email").unique(),
    workEmail: varchar("work_email"),
    firstName: varchar("first_name"),
    lastName: varchar("last_name"),
    profileImageUrl: varchar("profile_image_url"),
    provider: varchar("provider").default("replit"), // oauth provider: replit, google, github, apple
    // Legacy fields for backward compatibility
    username: text("username").unique(),
    password: text("password"),
    name: text("name"),
    phone: text("phone"),
    mobilePhone: text("mobile_phone"),
    roleId: integer("role_id").references(() => roles.id),
    departmentId: integer("department_id").references(() => departments.id),
    title: varchar("title", { length: 120 }),
    timeZone: varchar("time_zone", { length: 50 }),
    locale: varchar("locale", { length: 20 }),
    isActive: boolean("is_active").default(true).notNull(),
    isSuspended: boolean("is_suspended").default(false).notNull(),
    lastLogin: timestamp("last_login"),
    lastPasswordResetAt: timestamp("last_password_reset_at"),
    invitedAt: timestamp("invited_at"),
    invitationAcceptedAt: timestamp("invitation_accepted_at"),
    mfaEnabled: boolean("mfa_enabled").default(false).notNull(),
    mfaMethods: jsonb("mfa_methods").default({}).notNull(),
    notificationPreferences: jsonb("notification_preferences").default({}).notNull(),
    accessMetadata: jsonb("access_metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
  },
  (table) => [
    index("users_org_idx").on(table.organizationId),
    index("users_unit_idx").on(table.primaryUnitId),
  ],
);

export const organizationMemberships = pgTable(
  "organization_memberships",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id")
      .references(() => organizations.id)
      .notNull(),
    userId: varchar("user_id", { length: 100 })
      .references(() => users.id)
      .notNull(),
    roleId: integer("role_id").references(() => roles.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    isPrimary: boolean("is_primary").default(false).notNull(),
    status: varchar("status", { length: 50 }).default("active").notNull(),
    invitedBy: varchar("invited_by", { length: 100 }),
    invitedAt: timestamp("invited_at"),
    acceptedAt: timestamp("accepted_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("organization_memberships_org_idx").on(table.organizationId),
    index("organization_memberships_user_idx").on(table.userId),
    unique("organization_memberships_unique").on(
      table.organizationId,
      table.userId,
      table.unitId,
    ),
  ],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: serial("id").primaryKey(),
    uuid: varchar("uuid", { length: 36 }).unique().notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    inventoryPoolId: integer("inventory_pool_id").references(() => inventoryPools.id),
    make: text("make").notNull(),
    model: text("model").notNull(),
    year: integer("year").notNull(),
    vin: text("vin").notNull().unique(),
    trim: text("trim"),
    mileage: integer("mileage"),
    price: integer("price").notNull(),
    originalPrice: integer("original_price"),
    costPrice: integer("cost_price"),
    status: text("status").notNull(), // available, pending, sold, maintenance, reserved, in-transit
    condition: text("condition").default("good"), // excellent, good, fair, poor
    description: text("description"),
    imageUrl: text("image_url"),

    // Enhanced listing capabilities
    listing: json("listing").$type<{
      isListed: boolean;
      listingSites: string[]; // autotrader, cars.com, etc.
      listingStatus: string;
      seoTitle?: string;
      seoDescription?: string;
      keywords?: string[];
      featuredUntil?: string;
    }>(),

    // Enhanced media management
    media: json("media").$type<Array<{
      url: string;
      label: string;
      type: 'image' | 'video' | 'document' | '360-view';
      order: number;
      isMain?: boolean;
    }>>(),

    // AI-enhanced valuations
    valuations: json("valuations").$type<{
      kbb?: number;
      mmr?: number;
      blackBook?: number;
      jdPower?: number;
      aiEstimate?: number;
      marketTrend?: 'rising' | 'stable' | 'falling';
      confidenceScore?: number;
      lastUpdated?: string;
    }>(),

    // Enhanced specifications
    specifications: json("specifications").$type<{
      engine?: string;
      transmission?: string;
      drivetrain?: string;
      fuelType?: string;
      mpgCity?: number;
      mpgHighway?: number;
      exteriorColor?: string;
      interiorColor?: string;
      features?: string[];
      safetyRating?: number;
      warrantyInfo?: string;
    }>(),

    // Location and logistics
    location: json("location").$type<{
      lot?: string;
      row?: string;
      space?: string;
      building?: string;
      notes?: string;
    }>(),

    // Enhanced tracking
    auditLogs: json("audit_logs").$type<Array<{user: string; action: string; timestamp: string; details?: string}>>(),
    priceHistory: json("price_history").$type<Array<{price: number; user: string; timestamp: string; reason?: string}>>(),
    tags: json("tags").$type<string[]>(),

    // AI/ML insights
    aiInsights: json("ai_insights").$type<{
      demandScore?: number;
      priceOptimal?: boolean;
      recommendedActions?: string[];
      marketPosition?: string;
      daysToSell?: number;
      lastAnalyzed?: string;
    }>(),
  
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("vehicles_org_idx").on(table.organizationId),
    index("vehicles_unit_idx").on(table.unitId),
    index("vehicles_pool_idx").on(table.inventoryPoolId),
  ],
);

export const customers = pgTable(
  "customers",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    ownerId: varchar("owner_id", { length: 100 }).references(() => users.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").unique(),
    phone: text("phone"),
    cellPhone: text("cell_phone"),
    workPhone: text("work_phone"),
    address: text("address"),
    city: text("city"),
    state: text("state"),
    zipCode: text("zip_code"),
    dateOfBirth: text("date_of_birth"),
    driversLicenseNumber: text("drivers_license_number"),
    driversLicenseState: text("drivers_license_state"),
    ssn: text("ssn"),
    creditScore: integer("credit_score"),
    income: decimal("income", { precision: 10, scale: 2 }),
    employment: json("employment"),
    bankingInfo: json("banking_info"),
    insurance: json("insurance"),
    preferences: json("preferences"),
    leadSource: text("lead_source"),
    referredBy: text("referred_by"),
    communicationPreferences: json("communication_preferences"),
    purchaseHistory: json("purchase_history"),
    serviceHistory: json("service_history"),
    followUpSchedule: json("follow_up_schedule"),
    tags: json("tags"),
    notes: text("notes"),

    // Enhanced CRM capabilities
    leadScore: integer("lead_score").default(0),
    buyingTimeframe: text("buying_timeframe"), // immediate, 30-days, 90-days, future
    budgetRange: json("budget_range").$type<{min?: number; max?: number}>(),
    tradeInVehicle: json("trade_in_vehicle").$type<{
      make?: string;
      model?: string;
      year?: number;
      mileage?: number;
      estimatedValue?: number;
      owedAmount?: number;
    }>(),

    // Digital engagement
    digitalProfile: json("digital_profile").$type<{
      websiteVisits?: number;
      lastWebsiteVisit?: string;
      emailEngagement?: number;
      smsEngagement?: number;
      socialMediaProfiles?: string[];
      preferredContactTime?: string;
      communicationStyle?: 'formal' | 'casual' | 'professional';
    }>(),

    // Enhanced customer status tracking
    customerJourney: json("customer_journey").$type<{
      stage: 'prospect' | 'lead' | 'qualified' | 'negotiating' | 'sold' | 'service';
      touchpoints: Array<{
        type: string;
        date: string;
        notes: string;
        outcome: string;
      }>;
      nextAction?: string;
      actionDueDate?: string;
    probability?: number;
  }>(),
  
    salesConsultant: text("sales_consultant"),
    status: text("status").notNull().default("prospect"),
    lastContactDate: timestamp("last_contact_date"),
    nextFollowUpDate: timestamp("next_follow_up_date"),
    name: text("name").notNull(),
    licenseNumber: text("license_number"),
    licenseState: text("license_state"),
    licenseExpiry: timestamp("license_expiry"),
    profileImage: text("profile_image"),
    socialSecurityNumber: text("ssn_encrypted"), // Encrypted storage
    preferredContactMethod: text("preferred_contact_method"),
    isActive: boolean("is_active").default(true),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("customers_org_idx").on(table.organizationId),
    index("customers_unit_idx").on(table.unitId),
    index("customers_owner_idx").on(table.ownerId),
  ],
);

// Credit Applications
export const creditApplications = pgTable("credit_applications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  applicationDate: timestamp("application_date").defaultNow().notNull(),
  fullName: text("full_name").notNull(),
  dateOfBirth: text("date_of_birth").notNull(),
  ssn: text("ssn").notNull(), // Encrypted
  employmentHistory: json("employment_history").$type<Array<{
    employer: string;
    position: string;
    startDate: string;
    endDate?: string;
    income: number;
    phone: string;
  }>>(),
  currentIncome: decimal("current_income", { precision: 10, scale: 2 }),
  rentMortgage: decimal("rent_mortgage", { precision: 10, scale: 2 }),
  consentGiven: boolean("consent_given").default(false),
  status: text("status").notNull().default("pending"), // pending, submitted, approved, rejected
  submittedAt: timestamp("submitted_at"),
  approvedAt: timestamp("approved_at"),
  rejectedAt: timestamp("rejected_at"),
  rejectionReason: text("rejection_reason"),
  approvalAmount: decimal("approval_amount", { precision: 10, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 2 }),
  termMonths: integer("term_months"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Co-Applicants
export const coApplicants = pgTable("co_applicants", {
  id: serial("id").primaryKey(),
  creditApplicationId: integer("credit_application_id").references(() => creditApplications.id).notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: text("date_of_birth").notNull(),
  ssn: text("ssn").notNull(), // Encrypted
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  employmentHistory: json("employment_history").$type<Array<{
    employer: string;
    position: string;
    startDate: string;
    endDate?: string;
    income: number;
    phone: string;
  }>>(),
  currentIncome: decimal("current_income", { precision: 10, scale: 2 }),
  creditScore: integer("credit_score"),
  status: text("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Trade Vehicles
export const tradeVehicles = pgTable("trade_vehicles", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  year: integer("year").notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  trim: text("trim"),
  vin: text("vin").notNull(),
  mileage: integer("mileage"),
  condition: text("condition"), // excellent, good, fair, poor
  estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
  kbbValue: decimal("kbb_value", { precision: 10, scale: 2 }),
  mmrValue: decimal("mmr_value", { precision: 10, scale: 2 }),
  actualValue: decimal("actual_value", { precision: 10, scale: 2 }),
  photos: json("photos").$type<Array<{url: string; caption: string}>>(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, appraised, accepted, rejected
  appraisedAt: timestamp("appraised_at"),
  appraisedBy: text("appraised_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Showroom Visits
export const showroomVisits = pgTable("showroom_visits", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  visitDate: timestamp("visit_date").defaultNow().notNull(),
  status: text("status").notNull().default("scheduled"), // scheduled, arrived, in_meeting, test_drive, left, sold
  assignedSalesperson: text("assigned_salesperson"),
  scheduledTime: timestamp("scheduled_time"),
  arrivedTime: timestamp("arrived_time"),
  meetingStartTime: timestamp("meeting_start_time"),
  testDriveStartTime: timestamp("test_drive_start_time"),
  leftTime: timestamp("left_time"),
  soldTime: timestamp("sold_time"),
  vehicleOfInterest: text("vehicle_of_interest"),
  comments: text("comments"),
  statusHistory: json("status_history").$type<Array<{
    status: string;
    timestamp: string;
    user: string;
    comment: string;
  }>>(),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Salesperson Notes
export const salespersonNotes = pgTable("salesperson_notes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  salespersonId: integer("salesperson_id").references(() => users.id).notNull(),
  note: text("note").notNull(),
  flaggedForManager: boolean("flagged_for_manager").default(false),
  flaggedAt: timestamp("flagged_at"),
  reviewedAt: timestamp("reviewed_at"),
  reviewedBy: integer("reviewed_by").references(() => users.id),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const leads = pgTable(
  "leads",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    pipelineId: uuid("pipeline_id").references(() => salesPipelines.id),
    stageId: integer("stage_id").references(() => pipelineStages.id),
    ownerId: varchar("owner_id", { length: 100 }).references(() => users.id),
    customerId: integer("customer_id").references(() => customers.id),
    leadNumber: text("lead_number").notNull().unique(),
    source: text("source").notNull(),
    status: text("status").notNull().default("new"),
    priority: text("priority").notNull().default("medium"),
    temperature: text("temperature").notNull().default("warm"),
    interestedVehicles: json("interested_vehicles"),
    budget: json("budget"),
    timeline: text("timeline"),
    tradeInInfo: json("trade_in_info"),
    financing: json("financing"),
    assignedTo: text("assigned_to").notNull(),
    lastActivity: timestamp("last_activity"),
    nextFollowUp: timestamp("next_follow_up"),
    activities: json("activities"),
    tags: json("tags"),
    notes: text("notes"),
    conversionProbability: decimal("conversion_probability", { precision: 5, scale: 2 }),
    estimatedValue: decimal("estimated_value", { precision: 10, scale: 2 }),
    competitorInfo: json("competitor_info"),
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone"),
    interestedIn: text("interested_in"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("leads_org_idx").on(table.organizationId),
    index("leads_unit_idx").on(table.unitId),
    index("leads_pipeline_idx").on(table.pipelineId, table.stageId),
    index("leads_owner_idx").on(table.ownerId),
  ],
);

export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  type: text("type").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  scheduledDate: timestamp("scheduled_date").notNull(),
  duration: integer("duration").notNull().default(60),
  status: text("status").notNull().default("scheduled"),
  assignedTo: text("assigned_to").notNull(),
  location: text("location"),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  confirmationSent: boolean("confirmation_sent").default(false),
  reminderSent: boolean("reminder_sent").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const communications = pgTable("communications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  type: text("type").notNull(),
  direction: text("direction").notNull(),
  channel: text("channel").notNull(),
  subject: text("subject"),
  content: text("content"),
  sentBy: text("sent_by"),
  sentTo: text("sent_to"),
  status: text("status").notNull().default("sent"),
  readAt: timestamp("read_at"),
  repliedAt: timestamp("replied_at"),
  attachments: json("attachments"),
  metadata: json("metadata"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id),
  leadId: integer("lead_id").references(() => leads.id),
  title: text("title").notNull(),
  description: text("description"),
  type: text("type").notNull(),
  priority: text("priority").notNull().default("medium"),
  status: text("status").notNull().default("pending"),
  assignedTo: text("assigned_to").notNull(),
  assignedBy: text("assigned_by"),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  completedBy: text("completed_by"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sales = pgTable(
  "sales",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    pipelineId: uuid("pipeline_id").references(() => salesPipelines.id),
    stageId: integer("stage_id").references(() => pipelineStages.id),
    dealId: integer("deal_id"),
    vehicleId: integer("vehicle_id").references(() => vehicles.id).notNull(),
    customerId: integer("customer_id").references(() => customers.id).notNull(),
    salesPersonId: integer("sales_person_id").references(() => users.id).notNull(),
    salePrice: integer("sale_price").notNull(),
    saleDate: timestamp("sale_date").defaultNow().notNull(),
    notes: text("notes"),
  },
  (table) => [
    index("sales_org_idx").on(table.organizationId),
    index("sales_unit_idx").on(table.unitId),
    index("sales_pipeline_idx").on(table.pipelineId, table.stageId),
  ],
);

export const activities = pgTable(
  "activities",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    type: text("type").notNull(), // sale, lead, vehicle_added, etc.
    description: text("description").notNull(),
    entityType: text("entity_type"),
    entityId: text("entity_id"),
    userId: integer("user_id").references(() => users.id),
    metadata: jsonb("metadata").default({}).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("activities_org_idx").on(table.organizationId),
    index("activities_unit_idx").on(table.unitId),
    index("activities_entity_idx").on(table.entityType, table.entityId),
  ],
);

// Service Department Tables
export const serviceParts = pgTable(
  "service_parts",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    partNumber: text("part_number").notNull().unique(),
    partName: text("part_name").notNull(),
    description: text("description"),
    category: text("category").notNull(), // engine, transmission, body, etc.
    supplier: text("supplier"),
    cost: decimal("cost").notNull(),
    retailPrice: decimal("retail_price").notNull(),
    quantityInStock: integer("quantity_in_stock").default(0).notNull(),
    minimumStock: integer("minimum_stock").default(0).notNull(),
    location: text("location"), // warehouse location
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("service_parts_org_idx").on(table.organizationId),
    index("service_parts_unit_idx").on(table.unitId),
  ],
);

export const serviceOrders = pgTable(
  "service_orders",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    workOrderNumber: text("work_order_number").notNull().unique(),
    customerId: integer("customer_id").references(() => customers.id).notNull(),
    vehicleId: integer("vehicle_id").references(() => vehicles.id),
    serviceAdvisorId: integer("service_advisor_id").references(() => users.id),
    technicianId: integer("technician_id").references(() => users.id),
    status: text("status").notNull(), // scheduled, in_progress, completed, cancelled
    serviceType: text("service_type").notNull(), // maintenance, repair, inspection
    description: text("description").notNull(),
    laborHours: decimal("labor_hours").default("0"),
    laborRate: decimal("labor_rate").notNull(),
    partsTotal: decimal("parts_total").default("0"),
    laborTotal: decimal("labor_total").default("0"),
    taxAmount: decimal("tax_amount").default("0"),
    totalAmount: decimal("total_amount").default("0"),
    scheduledDate: timestamp("scheduled_date"),
    completedDate: timestamp("completed_date"),
    notes: text("notes"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("service_orders_org_idx").on(table.organizationId),
    index("service_orders_unit_idx").on(table.unitId),
  ],
);

export const serviceOrderParts = pgTable("service_order_parts", {
  id: serial("id").primaryKey(),
  serviceOrderId: integer("service_order_id").references(() => serviceOrders.id).notNull(),
  partId: integer("part_id").references(() => serviceParts.id).notNull(),
  quantity: integer("quantity").notNull(),
  unitCost: decimal("unit_cost").notNull(),
  unitPrice: decimal("unit_price").notNull(),
  totalCost: decimal("total_cost").notNull(),
  totalPrice: decimal("total_price").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Accounting Department Tables
export const employees = pgTable(
  "employees",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    employeeNumber: text("employee_number").notNull().unique(),
    userId: integer("user_id").references(() => users.id),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    email: text("email").notNull().unique(),
    phone: text("phone"),
    address: text("address"),
    position: text("position").notNull(),
    departmentId: integer("department_id").references(() => departments.id).notNull(),
    hireDate: timestamp("hire_date").notNull(),
    terminationDate: timestamp("termination_date"),
    salary: decimal("salary"),
    hourlyRate: decimal("hourly_rate"),
    payrollType: text("payroll_type").notNull(), // salary, hourly
    isActive: boolean("is_active").default(true).notNull(),
    emergencyContact: text("emergency_contact"),
    emergencyPhone: text("emergency_phone"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("employees_org_idx").on(table.organizationId),
    index("employees_unit_idx").on(table.unitId),
  ],
);

export const payroll = pgTable(
  "payroll",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    employeeId: integer("employee_id").references(() => employees.id).notNull(),
    payPeriodStart: timestamp("pay_period_start").notNull(),
    payPeriodEnd: timestamp("pay_period_end").notNull(),
    hoursWorked: decimal("hours_worked").default("0"),
    regularHours: decimal("regular_hours").default("0"),
    overtimeHours: decimal("overtime_hours").default("0"),
    grossPay: decimal("gross_pay").notNull(),
    taxes: decimal("taxes").default("0"),
    deductions: decimal("deductions").default("0"),
    netPay: decimal("net_pay").notNull(),
    status: text("status").notNull(), // draft, processed, paid
    processedAt: timestamp("processed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("payroll_org_idx").on(table.organizationId),
    index("payroll_unit_idx").on(table.unitId),
  ],
);

export const financialTransactions = pgTable(
  "financial_transactions",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    transactionType: text("transaction_type").notNull(), // sale, service, expense, payroll
    referenceId: integer("reference_id"), // links to sale_id, service_order_id, etc.
    description: text("description").notNull(),
    amount: decimal("amount").notNull(),
    category: text("category").notNull(),
    account: text("account").notNull(),
    transactionDate: timestamp("transaction_date").notNull(),
    createdBy: integer("created_by").references(() => users.id),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("financial_transactions_org_idx").on(table.organizationId),
    index("financial_transactions_unit_idx").on(table.unitId),
    index("financial_transactions_type_idx").on(table.transactionType, table.transactionDate),
  ],
);

export const visitorSessions = pgTable(
  "visitor_sessions",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    sessionId: text("session_id").notNull().unique(),
    visitorId: text("visitor_id").notNull(),
    userAgent: text("user_agent"),
    ipAddress: text("ip_address"),
    referrer: text("referrer"),
    landingPage: text("landing_page"),
    deviceType: text("device_type"), // desktop, mobile, tablet
    browserName: text("browser_name"),
    operatingSystem: text("operating_system"),
    country: text("country"),
    city: text("city"),
    isReturningVisitor: boolean("is_returning_visitor").default(false),
    totalPageViews: integer("total_page_views").default(0),
    sessionDuration: integer("session_duration").default(0), // in seconds
    lastActivity: timestamp("last_activity").defaultNow().notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("visitor_sessions_org_idx").on(table.organizationId),
    index("visitor_sessions_unit_idx").on(table.unitId),
  ],
);

export const pageViews = pgTable(
  "page_views",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    sessionId: text("session_id").references(() => visitorSessions.sessionId).notNull(),
    pageUrl: text("page_url").notNull(),
    pageTitle: text("page_title"),
    timeOnPage: integer("time_on_page").default(0), // in seconds
    scrollDepth: integer("scroll_depth").default(0), // percentage
    exitPage: boolean("exit_page").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("page_views_org_idx").on(table.organizationId),
    index("page_views_unit_idx").on(table.unitId),
  ],
);

export const customerInteractions = pgTable(
  "customer_interactions",
  {
    id: serial("id").primaryKey(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    sessionId: text("session_id").references(() => visitorSessions.sessionId).notNull(),
    interactionType: text("interaction_type").notNull(), // vehicle_view, lead_form, contact_click, etc.
    elementId: text("element_id"),
    vehicleId: integer("vehicle_id").references(() => vehicles.id),
    data: text("data"), // JSON string for additional data
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("customer_interactions_org_idx").on(table.organizationId),
    index("customer_interactions_unit_idx").on(table.unitId),
  ],
);

// Customer management tables
export const customerNotes = pgTable("customer_notes", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  noteType: text("note_type").notNull(), // call, meeting, email, general
  subject: text("subject").notNull(),
  content: text("content").notNull(),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerCalls = pgTable("customer_calls", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  callType: text("call_type").notNull(), // inbound, outbound
  phoneNumber: text("phone_number").notNull(),
  duration: integer("duration"), // in seconds
  callStatus: text("call_status").notNull(), // completed, missed, busy, no_answer
  notes: text("notes"),
  recordingUrl: text("recording_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerVehiclesOfInterest = pgTable("customer_vehicles_of_interest", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  make: text("make"),
  model: text("model"),
  year: integer("year"),
  minPrice: integer("min_price"),
  maxPrice: integer("max_price"),
  preferredFeatures: text("preferred_features").array(),
  priority: text("priority").notNull().default("medium"), // low, medium, high
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerTradeIns = pgTable("customer_trade_ins", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  mileage: integer("mileage"),
  condition: text("condition").notNull(), // excellent, good, fair, poor
  estimatedValue: integer("estimated_value"),
  actualValue: integer("actual_value"),
  vin: text("vin"),
  images: text("images").array(),
  notes: text("notes"),
  status: text("status").notNull().default("pending"), // pending, appraised, accepted, declined
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerCreditApplications = pgTable("customer_credit_applications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  userId: integer("user_id").references(() => users.id).notNull(),
  applicationStatus: text("application_status").notNull(), // submitted, pending, approved, denied
  lenderName: text("lender_name"),
  creditScore: integer("credit_score"),
  approvedAmount: integer("approved_amount"),
  interestRate: decimal("interest_rate"),
  termMonths: integer("term_months"),
  monthlyPayment: integer("monthly_payment"),
  downPayment: integer("down_payment"),
  applicationData: text("application_data"), // Encrypted JSON
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
  processedAt: timestamp("processed_at"),
});

export const customerDocuments = pgTable("customer_documents", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  documentType: text("document_type").notNull(), // license, insurance, proof_of_income, etc.
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  isVerified: boolean("is_verified").default(false),
  verifiedBy: integer("verified_by").references(() => users.id),
  verifiedAt: timestamp("verified_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const customerLeadSources = pgTable("customer_lead_sources", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  sourceType: text("source_type").notNull(), // website, referral, walk_in, phone, social_media, etc.
  sourceName: text("source_name"), // specific source name
  campaignId: text("campaign_id"),
  referralCustomerId: integer("referral_customer_id").references(() => customers.id),
  utmSource: text("utm_source"),
  utmMedium: text("utm_medium"),
  utmCampaign: text("utm_campaign"),
  conversionValue: integer("conversion_value"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const competitorAnalytics = pgTable("competitor_analytics", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").references(() => visitorSessions.sessionId).notNull(),
  competitorDomain: text("competitor_domain").notNull(),
  visitDuration: integer("visit_duration"), // in seconds
  pagesVisited: integer("pages_visited"),
  lastVisited: timestamp("last_visited").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Competitive pricing data
export const competitivePricing = pgTable("competitive_pricing", {
  id: serial("id").primaryKey(),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  trim: varchar("trim", { length: 100 }),
  mileage: integer("mileage"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  source: varchar("source", { length: 255 }).notNull(),
  sourceUrl: varchar("source_url", { length: 500 }),
  location: varchar("location", { length: 255 }),
  condition: varchar("condition", { length: 50 }),
  features: text("features").array(),
  images: text("images").array(),
  scrapedAt: timestamp("scraped_at").defaultNow(),
  isActive: boolean("is_active").default(true),
});

// ML pricing insights
export const pricingInsights = pgTable("pricing_insights", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  make: varchar("make", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  year: integer("year").notNull(),
  currentPrice: decimal("current_price", { precision: 10, scale: 2 }).notNull(),
  suggestedPrice: decimal("suggested_price", { precision: 10, scale: 2 }).notNull(),
  marketAverage: decimal("market_average", { precision: 10, scale: 2 }).notNull(),
  priceRange: json("price_range").$type<{min: number, max: number}>(),
  competitorCount: integer("competitor_count").notNull(),
  confidence: decimal("confidence", { precision: 5, scale: 2 }).notNull(),
  pricePosition: varchar("price_position", { length: 20 }).notNull(), // "below", "average", "above"
  recommendedAction: varchar("recommended_action", { length: 50 }).notNull(),
  factors: json("factors").$type<{
    mileage: number,
    age: number,
    condition: number,
    features: number,
    location: number,
    demand: number
  }>(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// Merchandising strategies
export const merchandisingStrategies = pgTable("merchandising_strategies", {
  id: serial("id").primaryKey(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  strategy: varchar("strategy", { length: 100 }).notNull(),
  description: text("description").notNull(),
  priority: integer("priority").notNull(),
  estimatedImpact: varchar("estimated_impact", { length: 20 }).notNull(),
  implementationCost: decimal("implementation_cost", { precision: 10, scale: 2 }),
  expectedROI: decimal("expected_roi", { precision: 5, scale: 2 }),
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Market trends
export const marketTrends = pgTable("market_trends", {
  id: serial("id").primaryKey(),
  category: varchar("category", { length: 100 }).notNull(),
  trend: varchar("trend", { length: 100 }).notNull(),
  direction: varchar("direction", { length: 20 }).notNull(), // "up", "down", "stable"
  strength: decimal("strength", { precision: 5, scale: 2 }).notNull(),
  timeframe: varchar("timeframe", { length: 50 }).notNull(),
  description: text("description").notNull(),
  dataPoints: integer("data_points").notNull(),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

// ========================================
// F&I (Finance & Insurance) Tables
// ========================================

// Credit pull records and consent tracking
export const creditPulls = pgTable("credit_pulls", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  dealId: integer("deal_id").references(() => sales.id),
  pulledBy: varchar("pulled_by").notNull(), // User who initiated pull
  bureau: varchar("bureau").notNull(), // Experian, Equifax, TransUnion
  provider: varchar("provider").notNull(), // RouteOne, Dealertrack, 700Credit, etc.
  creditScore: integer("credit_score"),
  reportData: jsonb("report_data"), // Full credit report JSON
  consentGiven: boolean("consent_given").default(false),
  consentTimestamp: timestamp("consent_timestamp"),
  purpose: varchar("purpose").notNull(), // "auto_loan", "lease", "evaluation"
  costCents: integer("cost_cents"), // Cost in cents
  status: varchar("status").default("pending"), // pending, completed, failed, expired
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lender applications and responses
export const lenderApplications = pgTable("lender_applications", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  dealId: integer("deal_id").references(() => sales.id),
  creditPullId: integer("credit_pull_id").references(() => creditPulls.id),
  lenderName: varchar("lender_name").notNull(),
  lenderCode: varchar("lender_code").notNull(),
  submittedBy: varchar("submitted_by").notNull(),
  applicationData: jsonb("application_data").notNull(),
  responseData: jsonb("response_data"),
  status: varchar("status").default("pending"), // pending, conditional, approved, declined, stipulations
  approvalAmount: decimal("approval_amount", { precision: 10, scale: 2 }),
  interestRate: decimal("interest_rate", { precision: 5, scale: 4 }),
  termMonths: integer("term_months"),
  monthlyPayment: decimal("monthly_payment", { precision: 8, scale: 2 }),
  stipulations: jsonb("stipulations"), // Array of required documents/conditions
  reserveAmount: decimal("reserve_amount", { precision: 8, scale: 2 }),
  backendEligibility: jsonb("backend_eligibility"), // Which products are eligible
  expirationDate: timestamp("expiration_date"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// F&I Product catalog (warranties, GAP, etc.)
export const fiProducts = pgTable("fi_products", {
  id: serial("id").primaryKey(),
  name: varchar("name").notNull(),
  category: varchar("category").notNull(), // warranty, gap, tire_wheel, maintenance, etc.
  description: text("description"),
  provider: varchar("provider").notNull(),
  costStructure: jsonb("cost_structure").notNull(), // Pricing tiers, term-based costs
  retailPricing: jsonb("retail_pricing").notNull(),
  margin: decimal("margin", { precision: 5, scale: 2 }),
  eligibilityCriteria: jsonb("eligibility_criteria"),
  termOptions: jsonb("term_options"), // Available terms/coverage periods
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Finance menu presentations to customers
export const financeMenus = pgTable("finance_menus", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  dealId: integer("deal_id").references(() => sales.id),
  presentedBy: varchar("presented_by").notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  basePayment: decimal("base_payment", { precision: 8, scale: 2 }).notNull(),
  selectedProducts: jsonb("selected_products"), // Array of selected product IDs with pricing
  totalProductCost: decimal("total_product_cost", { precision: 10, scale: 2 }).default('0'),
  finalPayment: decimal("final_payment", { precision: 8, scale: 2 }).notNull(),
  customerResponse: varchar("customer_response"), // accepted, declined, pending
  digitalSignature: text("digital_signature"),
  presentationData: jsonb("presentation_data"), // Full menu state for recreation
  notes: text("notes"),
  presentedAt: timestamp("presented_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// F&I audit trail for compliance
export const fiAuditLog = pgTable("fi_audit_log", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(),
  action: varchar("action").notNull(), // credit_pull, lender_submit, menu_present, etc.
  entityType: varchar("entity_type").notNull(), // customer, deal, application
  entityId: integer("entity_id").notNull(),
  details: jsonb("details"),
  ipAddress: varchar("ip_address"),
  userAgent: text("user_agent"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Insert schemas
export const insertOrganizationSchema = createInsertSchema(organizations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationSettingSchema = createInsertSchema(organizationSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationFeatureSchema = createInsertSchema(organizationFeatures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationDomainSchema = createInsertSchema(organizationDomains).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationBillingProfileSchema = createInsertSchema(organizationBillingProfiles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationIntegrationSchema = createInsertSchema(organizationIntegrations).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationAuditLogSchema = createInsertSchema(organizationAuditLog).omit({
  id: true,
  createdAt: true,
});
export const insertOrganizationDataPolicySchema = createInsertSchema(organizationDataPolicies).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationUnitSchema = createInsertSchema(organizationUnits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationUnitSettingSchema = createInsertSchema(organizationUnitSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationUnitHourSchema = createInsertSchema(organizationUnitHours).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationUnitChannelSchema = createInsertSchema(organizationUnitChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertOrganizationInviteSchema = createInsertSchema(organizationInvites).omit({
  id: true,
  createdAt: true,
});
export const insertOrganizationMembershipSchema = createInsertSchema(organizationMemberships).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertEntityScopeSchema = createInsertSchema(entityScopes).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertSalesPipelineSchema = createInsertSchema(salesPipelines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertPipelineStageSchema = createInsertSchema(pipelineStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertRevenueTargetSchema = createInsertSchema(revenueTargets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertInventoryPoolSchema = createInsertSchema(inventoryPools).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertMarketingCampaignSchema = createInsertSchema(marketingCampaigns).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertMarketingCampaignChannelSchema = createInsertSchema(marketingCampaignChannels).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertMarketingAudienceSchema = createInsertSchema(marketingAudiences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertMarketingAttributionEventSchema = createInsertSchema(marketingAttributionEvents).omit({
  id: true,
  createdAt: true,
});
export const insertDepartmentSchema = createInsertSchema(departments).omit({ id: true, createdAt: true });
export const insertRoleSchema = createInsertSchema(roles).omit({ id: true, createdAt: true });
export const insertPermissionSchema = createInsertSchema(permissions).omit({ id: true, createdAt: true });
export const insertRolePermissionSchema = createInsertSchema(rolePermissions).omit({ createdAt: true });
export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, updatedAt: true });
export const insertEmployeeSchema = createInsertSchema(employees).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServicePartSchema = createInsertSchema(serviceParts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceOrderSchema = createInsertSchema(serviceOrders).omit({ id: true, createdAt: true, updatedAt: true });
export const insertServiceOrderPartSchema = createInsertSchema(serviceOrderParts).omit({ id: true, createdAt: true });
export const insertPayrollSchema = createInsertSchema(payroll).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinancialTransactionSchema = createInsertSchema(financialTransactions).omit({ id: true, createdAt: true });
export const insertVehicleSchema = createInsertSchema(vehicles).omit({ id: true, uuid: true, createdAt: true });
export const insertCustomerSchema = createInsertSchema(customers).omit({ id: true, createdAt: true });
export const insertLeadSchema = createInsertSchema(leads).omit({ id: true, createdAt: true });
export const insertSaleSchema = createInsertSchema(sales).omit({ id: true, saleDate: true });
export const insertActivitySchema = createInsertSchema(activities).omit({ id: true, createdAt: true });
export const insertVisitorSessionSchema = createInsertSchema(visitorSessions).omit({ id: true, createdAt: true, lastActivity: true });
export const insertPageViewSchema = createInsertSchema(pageViews).omit({ id: true, createdAt: true });
export const insertCustomerInteractionSchema = createInsertSchema(customerInteractions).omit({ id: true, createdAt: true });
export const insertCompetitorAnalyticsSchema = createInsertSchema(competitorAnalytics).omit({ id: true, createdAt: true });
export const insertCompetitivePricingSchema = createInsertSchema(competitivePricing).omit({ id: true, scrapedAt: true });
export const insertPricingInsightsSchema = createInsertSchema(pricingInsights).omit({ id: true, lastUpdated: true });
export const insertMerchandisingStrategiesSchema = createInsertSchema(merchandisingStrategies).omit({ id: true, createdAt: true, updatedAt: true });
export const insertMarketTrendsSchema = createInsertSchema(marketTrends).omit({ id: true, lastUpdated: true });
export const insertCustomerNoteSchema = createInsertSchema(customerNotes).omit({ id: true, createdAt: true });
export const insertCustomerCallSchema = createInsertSchema(customerCalls).omit({ id: true, createdAt: true });
export const insertCustomerVehicleOfInterestSchema = createInsertSchema(customerVehiclesOfInterest).omit({ id: true, createdAt: true });
export const insertCustomerTradeInSchema = createInsertSchema(customerTradeIns).omit({ id: true, createdAt: true });
export const insertCustomerCreditApplicationSchema = createInsertSchema(customerCreditApplications).omit({ id: true, submittedAt: true });
export const insertCustomerDocumentSchema = createInsertSchema(customerDocuments).omit({ id: true, createdAt: true });
export const insertCustomerLeadSourceSchema = createInsertSchema(customerLeadSources).omit({ id: true, createdAt: true });

// F&I Insert Schemas
export const insertCreditPullSchema = createInsertSchema(creditPulls).omit({ id: true, createdAt: true, updatedAt: true });
export const insertLenderApplicationSchema = createInsertSchema(lenderApplications).omit({ id: true, submittedAt: true, createdAt: true, updatedAt: true });
export const insertFiProductSchema = createInsertSchema(fiProducts).omit({ id: true, createdAt: true, updatedAt: true });
export const insertFinanceMenuSchema = createInsertSchema(financeMenus).omit({ id: true, presentedAt: true, createdAt: true, updatedAt: true });
export const insertFiAuditLogSchema = createInsertSchema(fiAuditLog).omit({ id: true, timestamp: true });

// Showroom Manager - Daily customer tracking for showroom floor management
export const showroomSessions = pgTable("showroom_sessions", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  vehicleId: integer("vehicle_id").references(() => vehicles.id),
  stockNumber: varchar("stock_number", { length: 50 }),
  salespersonId: integer("salesperson_id").references(() => users.id),
  leadSource: varchar("lead_source", { length: 50 }),
  eventStatus: varchar("event_status", { length: 50 }).default("pending").notNull(), // sold, dead, working, pending, sent_to_finance
  dealStage: varchar("deal_stage", { length: 50 }).default("vehicle_selection").notNull(), // vehicle_selection, test_drive, numbers, closed_deal, finalized
  notes: text("notes"),
  timeEntered: timestamp("time_entered").defaultNow().notNull(),
  timeExited: timestamp("time_exited"),
  sessionDate: date("session_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertShowroomSessionSchema = createInsertSchema(showroomSessions).omit({ id: true, createdAt: true, updatedAt: true });

// New customer detail insert schemas
export const insertCreditApplicationSchema = createInsertSchema(creditApplications).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCoApplicantSchema = createInsertSchema(coApplicants).omit({ id: true, createdAt: true, updatedAt: true });
export const insertTradeVehicleSchema = createInsertSchema(tradeVehicles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertShowroomVisitSchema = createInsertSchema(showroomVisits).omit({ id: true, createdAt: true, updatedAt: true });
export const insertSalespersonNoteSchema = createInsertSchema(salespersonNotes).omit({ id: true, createdAt: true, updatedAt: true });

export type Organization = typeof organizations.$inferSelect;
export type InsertOrganization = z.infer<typeof insertOrganizationSchema>;
export type OrganizationSetting = typeof organizationSettings.$inferSelect;
export type InsertOrganizationSetting = z.infer<typeof insertOrganizationSettingSchema>;
export type OrganizationFeature = typeof organizationFeatures.$inferSelect;
export type InsertOrganizationFeature = z.infer<typeof insertOrganizationFeatureSchema>;
export type OrganizationDomain = typeof organizationDomains.$inferSelect;
export type InsertOrganizationDomain = z.infer<typeof insertOrganizationDomainSchema>;
export type OrganizationBillingProfile = typeof organizationBillingProfiles.$inferSelect;
export type InsertOrganizationBillingProfile = z.infer<typeof insertOrganizationBillingProfileSchema>;
export type OrganizationIntegration = typeof organizationIntegrations.$inferSelect;
export type InsertOrganizationIntegration = z.infer<typeof insertOrganizationIntegrationSchema>;
export type OrganizationAuditLogEntry = typeof organizationAuditLog.$inferSelect;
export type InsertOrganizationAuditLogEntry = z.infer<typeof insertOrganizationAuditLogSchema>;
export type OrganizationDataPolicy = typeof organizationDataPolicies.$inferSelect;
export type InsertOrganizationDataPolicy = z.infer<typeof insertOrganizationDataPolicySchema>;
export type OrganizationUnit = typeof organizationUnits.$inferSelect;
export type InsertOrganizationUnit = z.infer<typeof insertOrganizationUnitSchema>;
export type OrganizationUnitSetting = typeof organizationUnitSettings.$inferSelect;
export type InsertOrganizationUnitSetting = z.infer<typeof insertOrganizationUnitSettingSchema>;
export type OrganizationUnitHour = typeof organizationUnitHours.$inferSelect;
export type InsertOrganizationUnitHour = z.infer<typeof insertOrganizationUnitHourSchema>;
export type OrganizationUnitChannel = typeof organizationUnitChannels.$inferSelect;
export type InsertOrganizationUnitChannel = z.infer<typeof insertOrganizationUnitChannelSchema>;
export type OrganizationInvite = typeof organizationInvites.$inferSelect;
export type InsertOrganizationInvite = z.infer<typeof insertOrganizationInviteSchema>;
export type OrganizationMembership = typeof organizationMemberships.$inferSelect;
export type InsertOrganizationMembership = z.infer<typeof insertOrganizationMembershipSchema>;
export type EntityScope = typeof entityScopes.$inferSelect;
export type InsertEntityScope = z.infer<typeof insertEntityScopeSchema>;
export type SalesPipeline = typeof salesPipelines.$inferSelect;
export type InsertSalesPipeline = z.infer<typeof insertSalesPipelineSchema>;
export type PipelineStage = typeof pipelineStages.$inferSelect;
export type InsertPipelineStage = z.infer<typeof insertPipelineStageSchema>;
export type RevenueTarget = typeof revenueTargets.$inferSelect;
export type InsertRevenueTarget = z.infer<typeof insertRevenueTargetSchema>;
export type InventoryPool = typeof inventoryPools.$inferSelect;
export type InsertInventoryPool = z.infer<typeof insertInventoryPoolSchema>;
export type MarketingCampaign = typeof marketingCampaigns.$inferSelect;
export type InsertMarketingCampaign = z.infer<typeof insertMarketingCampaignSchema>;
export type MarketingCampaignChannel = typeof marketingCampaignChannels.$inferSelect;
export type InsertMarketingCampaignChannel = z.infer<typeof insertMarketingCampaignChannelSchema>;
export type MarketingAudience = typeof marketingAudiences.$inferSelect;
export type InsertMarketingAudience = z.infer<typeof insertMarketingAudienceSchema>;
export type MarketingAttributionEvent = typeof marketingAttributionEvents.$inferSelect;
export type InsertMarketingAttributionEvent = z.infer<typeof insertMarketingAttributionEventSchema>;
export type Department = typeof departments.$inferSelect;
export type Role = typeof roles.$inferSelect;
export type Permission = typeof permissions.$inferSelect;
export type RolePermission = typeof rolePermissions.$inferSelect;

// New customer detail types
export type CreditApplication = typeof creditApplications.$inferSelect;
export type CoApplicant = typeof coApplicants.$inferSelect;
export type TradeVehicle = typeof tradeVehicles.$inferSelect;
export type ShowroomVisit = typeof showroomVisits.$inferSelect;
export type SalespersonNote = typeof salespersonNotes.$inferSelect;
export type ShowroomSession = typeof showroomSessions.$inferSelect;
export type User = typeof users.$inferSelect;

// Notifications schema
export const notifications = pgTable("notifications", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id),
  type: varchar("type").notNull(), // 'lead', 'sale', 'inventory', 'system', 'message', 'alert'
  priority: varchar("priority").notNull().default("normal"), // 'low', 'normal', 'high', 'urgent'
  title: varchar("title").notNull(),
  message: text("message").notNull(),
  actionUrl: varchar("action_url"), // URL to navigate when clicked
  actionData: jsonb("action_data"), // Additional data for the action
  isRead: boolean("is_read").default(false),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow(),
  expiresAt: timestamp("expires_at"),
});

// Notification templates for different triggers
export const notificationTemplates = pgTable("notification_templates", {
  id: varchar("id").primaryKey().notNull(),
  type: varchar("type").notNull(),
  trigger: varchar("trigger").notNull(), // 'new_lead', 'deal_closed', 'low_inventory', etc.
  title: varchar("title").notNull(),
  messageTemplate: text("message_template").notNull(), // Template with placeholders
  actionUrl: varchar("action_url"),
  priority: varchar("priority").default("normal"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Notification preferences by user
export const notificationPreferences = pgTable("notification_preferences", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  type: varchar("type").notNull(),
  enabled: boolean("enabled").default(true),
  pushEnabled: boolean("push_enabled").default(true),
  emailEnabled: boolean("email_enabled").default(false),
  smsEnabled: boolean("sms_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = typeof notifications.$inferInsert;
export type NotificationTemplate = typeof notificationTemplates.$inferSelect;
export type InsertNotificationTemplate = typeof notificationTemplates.$inferInsert;
export type NotificationPreference = typeof notificationPreferences.$inferSelect;
export type InsertNotificationPreference = typeof notificationPreferences.$inferInsert;

// F&I Types
export type CreditPull = typeof creditPulls.$inferSelect;
export type LenderApplication = typeof lenderApplications.$inferSelect;
export type FiProduct = typeof fiProducts.$inferSelect;
export type FinanceMenu = typeof financeMenus.$inferSelect;
export type FiAuditLog = typeof fiAuditLog.$inferSelect;

export type InsertCreditPull = z.infer<typeof insertCreditPullSchema>;
export type InsertLenderApplication = z.infer<typeof insertLenderApplicationSchema>;
export type InsertFiProduct = z.infer<typeof insertFiProductSchema>;
export type InsertFinanceMenu = z.infer<typeof insertFinanceMenuSchema>;
export type InsertFiAuditLog = z.infer<typeof insertFiAuditLogSchema>;

// Deal Management Schema
export const deals = pgTable(
  "deals",
  {
    id: text("id").primaryKey().notNull(),
    organizationId: uuid("organization_id").references(() => organizations.id),
    unitId: uuid("unit_id").references(() => organizationUnits.id),
    pipelineId: uuid("pipeline_id").references(() => salesPipelines.id),
    stageId: integer("stage_id").references(() => pipelineStages.id),
    salesManagerId: varchar("sales_manager_id", { length: 100 }).references(() => users.id),
    dealNumber: text("deal_number").unique().notNull(),
    status: text("status").notNull().default("open"), // open, finalized, funded, cancelled

    // Vehicle Information
    vehicleId: text("vehicle_id").references(() => vehicles.id),
    vin: text("vin"),
    msrp: integer("msrp"),
    salePrice: integer("sale_price"),

    // Customer Information
    customerId: text("customer_id").references(() => customers.id),
    buyerName: text("buyer_name").notNull(),
    coBuyerName: text("co_buyer_name"),

    // Trade Information
    tradeVin: text("trade_vin"),
    tradeYear: integer("trade_year"),
    tradeMake: text("trade_make"),
    tradeModel: text("trade_model"),
    tradeTrim: text("trade_trim"),
    tradeMileage: integer("trade_mileage"),
    tradeCondition: text("trade_condition"), // excellent, good, fair, poor
    tradeAllowance: integer("trade_allowance").default(0),
    tradePayoff: integer("trade_payoff").default(0),
    tradeActualCashValue: integer("trade_actual_cash_value").default(0),

    // Payoff Information
    payoffLenderName: text("payoff_lender_name"),
    payoffLenderAddress: text("payoff_lender_address"),
    payoffLenderCity: text("payoff_lender_city"),
    payoffLenderState: text("payoff_lender_state"),
    payoffLenderZip: text("payoff_lender_zip"),
    payoffLenderPhone: text("payoff_lender_phone"),
    payoffAccountNumber: text("payoff_account_number"),
    payoffAmount: integer("payoff_amount").default(0),
    payoffPerDiem: decimal("payoff_per_diem", { precision: 10, scale: 2 }).default("0"),
    payoffGoodThrough: date("payoff_good_through"),

    // Insurance Information
    insuranceCompany: text("insurance_company"),
    insuranceAgent: text("insurance_agent"),
    insurancePhone: text("insurance_phone"),
    insurancePolicyNumber: text("insurance_policy_number"),
    insuranceEffectiveDate: date("insurance_effective_date"),
    insuranceExpirationDate: date("insurance_expiration_date"),
    insuranceDeductible: integer("insurance_deductible"),
    insuranceCoverage: json("insurance_coverage").$type<{
      liability: boolean;
      collision: boolean;
      comprehensive: boolean;
      uninsured: boolean;
      pip: boolean;
    }>(),

    // Financial Structure
    dealType: text("deal_type").notNull(), // retail, lease, cash
    cashDown: integer("cash_down").default(0),
    rebates: integer("rebates").default(0),
    salesTax: integer("sales_tax").default(0),
    docFee: integer("doc_fee").default(0),
    titleFee: integer("title_fee").default(0),
    registrationFee: integer("registration_fee").default(0),
    financeBalance: integer("finance_balance").default(0),

    // Credit Information
    creditStatus: text("credit_status"), // approved, pending, denied
    creditTier: text("credit_tier"), // A+, A, B, C, D
    term: integer("term"),
    rate: text("rate"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow(),
    finalizedAt: timestamp("finalized_at"),

    // User tracking
    salesPersonId: text("sales_person_id"),
    financeManagerId: text("finance_manager_id"),
});

export const dealProducts = pgTable("deal_products", {
  id: text("id").primaryKey().notNull(),
  dealId: text("deal_id").references(() => deals.id).notNull(),
  productName: text("product_name").notNull(),
  retailPrice: integer("retail_price").notNull(),
  cost: integer("cost").notNull(),
  category: text("category"), // warranty, gap, tire_wheel, maintenance
  createdAt: timestamp("created_at").defaultNow(),
});

export const dealGross = pgTable("deal_gross", {
  id: text("id").primaryKey().notNull(),
  dealId: text("deal_id").references(() => deals.id).notNull(),
  frontEndGross: integer("front_end_gross").default(0),
  financeReserve: integer("finance_reserve").default(0),
  productGross: integer("product_gross").default(0),
  packCost: integer("pack_cost").default(0),
  netGross: integer("net_gross").default(0),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

export const accountingEntries = pgTable("accounting_entries", {
  id: text("id").primaryKey().notNull(),
  dealId: text("deal_id").references(() => deals.id).notNull(),
  accountCode: text("account_code").notNull(),
  accountName: text("account_name").notNull(),
  debit: integer("debit").default(0),
  credit: integer("credit").default(0),
  memo: text("memo"),
  entryDate: timestamp("entry_date").defaultNow(),
});

export const chartOfAccounts = pgTable("chart_of_accounts", {
  id: text("id").primaryKey().notNull(),
  code: text("code").unique().notNull(),
  name: text("name").notNull(),
  category: text("category").notNull(), // asset, liability, equity, revenue, expense
  subCategory: text("sub_category"),
  isActive: boolean("is_active").default(true),
});

// Deal Relations
export const dealRelations = relations(deals, ({ one, many }) => ({
  vehicle: one(vehicles, {
    fields: [deals.vehicleId],
    references: [vehicles.id],
  }),
  customer: one(customers, {
    fields: [deals.customerId],
    references: [customers.id],
  }),
  products: many(dealProducts),
  gross: one(dealGross),
  accountingEntries: many(accountingEntries),
}));

export const dealProductsRelations = relations(dealProducts, ({ one }) => ({
  deal: one(deals, {
    fields: [dealProducts.dealId],
    references: [deals.id],
  }),
}));

export const dealGrossRelations = relations(dealGross, ({ one }) => ({
  deal: one(deals, {
    fields: [dealGross.dealId],
    references: [deals.id],
  }),
}));

export const accountingEntriesRelations = relations(accountingEntries, ({ one }) => ({
  deal: one(deals, {
    fields: [accountingEntries.dealId],
    references: [deals.id],
  }),
}));

// Deal Management Insert Schemas and Types
export const insertDealSchema = createInsertSchema(deals);
export const insertDealProductSchema = createInsertSchema(dealProducts);
export const insertDealGrossSchema = createInsertSchema(dealGross);
export const insertAccountingEntrySchema = createInsertSchema(accountingEntries);

export type Deal = typeof deals.$inferSelect;
export type InsertDeal = typeof deals.$inferInsert;
export type DealProduct = typeof dealProducts.$inferSelect;
export type InsertDealProduct = typeof dealProducts.$inferInsert;
export type DealGross = typeof dealGross.$inferSelect;
export type InsertDealGross = typeof dealGross.$inferInsert;
export type AccountingEntry = typeof accountingEntries.$inferSelect;
export type InsertAccountingEntry = typeof accountingEntries.$inferInsert;
export type ChartOfAccount = typeof chartOfAccounts.$inferSelect;
export type Employee = typeof employees.$inferSelect;
export type ServicePart = typeof serviceParts.$inferSelect;
export type ServiceOrder = typeof serviceOrders.$inferSelect;
export type ServiceOrderPart = typeof serviceOrderParts.$inferSelect;
export type Payroll = typeof payroll.$inferSelect;
export type FinancialTransaction = typeof financialTransactions.$inferSelect;
export type Vehicle = typeof vehicles.$inferSelect;
export type Customer = typeof customers.$inferSelect;
export type Lead = typeof leads.$inferSelect;
export type Sale = typeof sales.$inferSelect;
export type Activity = typeof activities.$inferSelect;
export type VisitorSession = typeof visitorSessions.$inferSelect;
export type PageView = typeof pageViews.$inferSelect;
export type CustomerInteraction = typeof customerInteractions.$inferSelect;
export type CompetitorAnalytics = typeof competitorAnalytics.$inferSelect;
export type CompetitivePricing = typeof competitivePricing.$inferSelect;
export type PricingInsights = typeof pricingInsights.$inferSelect;
export type MerchandisingStrategies = typeof merchandisingStrategies.$inferSelect;
export type MarketTrends = typeof marketTrends.$inferSelect;

export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type InsertRole = z.infer<typeof insertRoleSchema>;
export type InsertPermission = z.infer<typeof insertPermissionSchema>;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpsertUser = typeof users.$inferInsert;

// System User Management Schema (Enhanced with password auth)
export const systemUsers = pgTable("system_users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").notNull().unique(),
  firstName: varchar("first_name").notNull(),
  lastName: varchar("last_name").notNull(),
  username: varchar("username").notNull().unique(),
  passwordHash: varchar("password_hash").notNull(),
  role: varchar("role").notNull(),
  department: varchar("department").notNull(),
  phone: varchar("phone"),
  address: text("address"),
  bio: text("bio"),
  profileImage: varchar("profile_image_url"),
  isActive: boolean("is_active").default(true),
  permissions: text("permissions").array().$type<string[]>(),
  preferences: jsonb("preferences").$type<{
    theme: string;
    notifications: boolean;
    emailUpdates: boolean;
    timezone: string;
  }>(),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const userSessions = pgTable("user_sessions", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => systemUsers.id, { onDelete: 'cascade' }),
  sessionToken: varchar("session_token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const systemRoles = pgTable("system_roles", {
  id: varchar("id").primaryKey().notNull(),
  name: varchar("name").notNull(),
  description: text("description"),
  permissions: text("permissions").array().$type<string[]>(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const activityLog = pgTable("activity_log", {
  id: varchar("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().references(() => systemUsers.id, { onDelete: 'cascade' }),
  action: varchar("action").notNull(),
  details: text("details"),
  timestamp: timestamp("timestamp").defaultNow(),
});

// User Management Insert Schemas
export const insertSystemUserSchema = createInsertSchema(systemUsers).omit({ id: true, createdAt: true, updatedAt: true });
export const insertUserSessionSchema = createInsertSchema(userSessions).omit({ id: true, createdAt: true });
export const insertSystemRoleSchema = createInsertSchema(systemRoles).omit({ id: true, createdAt: true, updatedAt: true });
export const insertActivityLogSchema = createInsertSchema(activityLog).omit({ id: true, timestamp: true });

// User Management Types
export type SystemUser = typeof systemUsers.$inferSelect;
export type InsertSystemUser = z.infer<typeof insertSystemUserSchema>;
export type UserSession = typeof userSessions.$inferSelect;
export type InsertUserSession = z.infer<typeof insertUserSessionSchema>;
export type SystemRole = typeof systemRoles.$inferSelect;
export type InsertSystemRole = z.infer<typeof insertSystemRoleSchema>;
export type ActivityLogEntry = typeof activityLog.$inferSelect;
export type InsertActivityLogEntry = z.infer<typeof insertActivityLogSchema>;
export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type InsertServicePart = z.infer<typeof insertServicePartSchema>;
export type InsertServiceOrder = z.infer<typeof insertServiceOrderSchema>;
export type InsertServiceOrderPart = z.infer<typeof insertServiceOrderPartSchema>;
export type InsertPayroll = z.infer<typeof insertPayrollSchema>;
export type InsertFinancialTransaction = z.infer<typeof insertFinancialTransactionSchema>;
export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type InsertLead = z.infer<typeof insertLeadSchema>;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type InsertVisitorSession = z.infer<typeof insertVisitorSessionSchema>;
export type InsertPageView = z.infer<typeof insertPageViewSchema>;
export type InsertCustomerInteraction = z.infer<typeof insertCustomerInteractionSchema>;
export type InsertCompetitorAnalytics = z.infer<typeof insertCompetitorAnalyticsSchema>;
export type InsertCompetitivePricing = z.infer<typeof insertCompetitivePricingSchema>;
export type InsertPricingInsights = z.infer<typeof insertPricingInsightsSchema>;
export type InsertMerchandisingStrategies = z.infer<typeof insertMerchandisingStrategiesSchema>;
export type InsertMarketTrends = z.infer<typeof insertMarketTrendsSchema>;

// Import Accounting Schema Tables for DMS Accounting Suite
export * from './accounting-schema';
export type InsertCustomerNote = z.infer<typeof insertCustomerNoteSchema>;
export type InsertCustomerCall = z.infer<typeof insertCustomerCallSchema>;
export type InsertCustomerVehicleOfInterest = z.infer<typeof insertCustomerVehicleOfInterestSchema>;
export type InsertCustomerTradeIn = z.infer<typeof insertCustomerTradeInSchema>;
export type InsertCustomerCreditApplication = z.infer<typeof insertCustomerCreditApplicationSchema>;
export type InsertCustomerDocument = z.infer<typeof insertCustomerDocumentSchema>;
export type InsertCustomerLeadSource = z.infer<typeof insertCustomerLeadSourceSchema>;

export type CustomerNote = typeof customerNotes.$inferSelect;
export type CustomerCall = typeof customerCalls.$inferSelect;
export type CustomerVehicleOfInterest = typeof customerVehiclesOfInterest.$inferSelect;
export type CustomerTradeIn = typeof customerTradeIns.$inferSelect;
export type CustomerCreditApplication = typeof customerCreditApplications.$inferSelect;
export type CustomerDocument = typeof customerDocuments.$inferSelect;
export type CustomerLeadSource = typeof customerLeadSources.$inferSelect;

// Deal Desk Tables - Removed to avoid conflicts with comprehensive deal schema below

// Additional interfaces for vehicle management
export interface MediaItem {
  url: string;
  label: string;
  type: string;
}

export interface PriceHistoryEntry {
  price: number;
  user: string;
  timestamp: string;
  reason?: string;
}

export interface AuditLogEntry {
  user: string;
  action: string;
  timestamp: string;
  details?: string;
}

// XML Leads and Lead Distribution System
export const xmlLeads = pgTable("xml_leads", {
  id: serial("id").primaryKey(),
  rawXml: text("raw_xml").notNull(), // Original XML data
  source: varchar("source", { length: 100 }).notNull(), // AutoTrader, Cars.com, etc
  leadId: varchar("lead_id", { length: 100 }), // External lead ID
  customerName: varchar("customer_name", { length: 200 }),
  customerEmail: varchar("customer_email", { length: 200 }),
  customerPhone: varchar("customer_phone", { length: 50 }),
  interestedIn: varchar("interested_in", { length: 500 }),
  message: text("message"),
  vehicleOfInterest: varchar("vehicle_of_interest", { length: 200 }),
  appointmentRequested: boolean("appointment_requested").default(false),
  tradeInVehicle: varchar("trade_in_vehicle", { length: 200 }),
  financingPreferred: boolean("financing_preferred").default(false),
  leadType: varchar("lead_type", { length: 50 }).default("inquiry"), // inquiry, appointment, service, etc
  priority: varchar("priority", { length: 20 }).default("medium"), // high, medium, low
  status: varchar("status", { length: 50 }).default("new"), // new, assigned, contacted, qualified, lost, converted
  assignedTo: varchar("assigned_to", { length: 100 }),
  assignedBy: varchar("assigned_by", { length: 100 }),
  processedAt: timestamp("processed_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Lead Distribution Rules
export const leadDistributionRules = pgTable("lead_distribution_rules", {
  id: serial("id").primaryKey(),
  ruleName: varchar("rule_name", { length: 100 }).notNull(),
  source: varchar("source", { length: 100 }), // AutoTrader, Cars.com, etc
  leadType: varchar("lead_type", { length: 50 }), // inquiry, appointment, service
  priority: varchar("priority", { length: 20 }), // high, medium, low
  vehicleType: varchar("vehicle_type", { length: 50 }), // new, used, certified
  assignmentMethod: varchar("assignment_method", { length: 50 }).default("round_robin"), // round_robin, random, skill_based, territory
  assignToRole: varchar("assign_to_role", { length: 100 }),
  assignToUser: varchar("assign_to_user", { length: 100 }),
  maxLeadsPerUser: integer("max_leads_per_user").default(10),
  businessHoursOnly: boolean("business_hours_only").default(true),
  weekendsIncluded: boolean("weekends_included").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enhanced Role-Based Access Control (renamed to avoid conflict)
export const enterpriseRoles = pgTable("enterprise_roles", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
  displayName: varchar("display_name", { length: 100 }).notNull(),
  description: text("description"),
  permissions: text("permissions").array().notNull(), // ['leads.view', 'leads.assign', 'deals.edit']
  hierarchy: integer("hierarchy").default(0), // Higher number = higher authority
  isSystem: boolean("is_system").default(false), // System roles can't be deleted
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// User Role Assignments
export const userEnterpriseRoles = pgTable("user_enterprise_roles", {
  userId: varchar("user_id").notNull().references(() => users.id),
  roleId: integer("role_id").notNull().references(() => enterpriseRoles.id),
  assignedBy: varchar("assigned_by", { length: 100 }),
  assignedAt: timestamp("assigned_at").defaultNow(),
}, (table) => ({
  pk: primaryKey({ columns: [table.userId, table.roleId] }),
}));

// Module Configuration
export const moduleConfigs = pgTable("module_configs", {
  id: serial("id").primaryKey(),
  moduleName: varchar("module_name", { length: 100 }).notNull(), // 'leads', 'inventory', 'deals', etc
  isEnabled: boolean("is_enabled").default(true),
  settings: jsonb("settings").notNull().default({}), // Module-specific settings
  permissions: jsonb("permissions").notNull().default({}), // Permission overrides
  workflows: jsonb("workflows").notNull().default({}), // Workflow configurations
  integrations: jsonb("integrations").notNull().default({}), // API keys and integration settings
  notifications: jsonb("notifications").notNull().default({}), // Notification rules
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Log for Configuration Changes
export const systemConfigAuditLog = pgTable("system_config_audit_log", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 100 }).notNull(), // 'role', 'user', 'module_config', etc
  entityId: varchar("entity_id", { length: 100 }).notNull(),
  action: varchar("action", { length: 100 }).notNull(), // 'created', 'updated', 'deleted', 'assigned'
  changeDescription: text("change_description"),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  userId: varchar("user_id", { length: 100 }).notNull(),
  timestamp: timestamp("timestamp").defaultNow(),
});

// Advanced Enterprise Features for Next-Gen DMS/CRM

// Customer 360° Intelligence - Unified customer timeline
export const customerTimeline = pgTable("customer_timeline", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  eventType: text("event_type").notNull(), // sales, service, finance, marketing, web, chat, phone
  eventDescription: text("event_description").notNull(),
  eventData: jsonb("event_data"), // Flexible JSON for event-specific data
  source: text("source").notNull(), // department/system that generated event
  userId: varchar("user_id").references(() => users.id),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  metadata: jsonb("metadata"), // Additional context
});

// AI-Powered Decision Support
export const aiInsights = pgTable("ai_insights", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // deal_desk_copilot, inventory_optimizer, compliance_checker
  entityType: text("entity_type").notNull(), // deal, vehicle, customer
  entityId: integer("entity_id").notNull(),
  insight: jsonb("insight").notNull(), // AI-generated recommendations/warnings
  confidence: decimal("confidence", { precision: 3, scale: 2 }), // 0.00-1.00
  status: text("status").default("pending").notNull(), // pending, reviewed, applied, dismissed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Real-Time Collaboration
export const collaborationThreads = pgTable("collaboration_threads", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // deal, customer, vehicle
  entityId: integer("entity_id").notNull(),
  title: text("title").notNull(),
  status: text("status").default("active").notNull(), // active, resolved, archived
  priority: text("priority").default("normal").notNull(), // low, normal, high, urgent
  assignedTo: varchar("assigned_to").references(() => users.id),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("deals_org_idx").on(table.organizationId),
    index("deals_unit_idx").on(table.unitId),
    index("deals_pipeline_idx").on(table.pipelineId, table.stageId),
  ],
);

export const collaborationMessages = pgTable("collaboration_messages", {
  id: serial("id").primaryKey(),
  threadId: integer("thread_id").references(() => collaborationThreads.id).notNull(),
  userId: varchar("user_id").references(() => users.id).notNull(),
  message: text("message").notNull(),
  messageType: text("message_type").default("comment").notNull(), // comment, task, escalation, approval_request
  attachments: jsonb("attachments"), // File metadata
  mentions: jsonb("mentions"), // User IDs mentioned in message
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Advanced Analytics & KPIs
export const kpiMetrics = pgTable("kpi_metrics", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  metricValue: decimal("metric_value", { precision: 15, scale: 2 }).notNull(),
  metricType: text("metric_type").notNull(), // sales, inventory, finance, operations
  department: text("department"),
  period: text("period").notNull(), // daily, weekly, monthly, quarterly
  periodStart: date("period_start").notNull(),
  periodEnd: date("period_end").notNull(),
  metadata: jsonb("metadata"), // Additional context like comparisons, breakdowns
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Smart Deduplication System
export const duplicateCustomers = pgTable("duplicate_customers", {
  id: serial("id").primaryKey(),
  primaryCustomerId: integer("primary_customer_id").references(() => customers.id).notNull(),
  duplicateCustomerId: integer("duplicate_customer_id").references(() => customers.id).notNull(),
  similarityScore: decimal("similarity_score", { precision: 3, scale: 2 }).notNull(),
  matchingFields: jsonb("matching_fields").notNull(), // Fields that matched
  status: text("status").default("detected").notNull(), // detected, merged, dismissed
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Workflow Automation System
export const workflowTemplates = pgTable("workflow_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  triggerType: text("trigger_type").notNull(), // event, schedule, manual
  triggerConditions: jsonb("trigger_conditions").notNull(),
  actions: jsonb("actions").notNull(), // Array of workflow actions
  isActive: boolean("is_active").default(true).notNull(),
  department: text("department"),
  createdBy: varchar("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const workflowExecutions = pgTable("workflow_executions", {
  id: serial("id").primaryKey(),
  templateId: integer("template_id").references(() => workflowTemplates.id).notNull(),
  entityType: text("entity_type").notNull(),
  entityId: integer("entity_id").notNull(),
  status: text("status").default("running").notNull(), // running, completed, failed, cancelled
  executionData: jsonb("execution_data"), // Runtime data and results
  error: text("error"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Predictive Analytics
export const predictiveScores = pgTable("predictive_scores", {
  id: serial("id").primaryKey(),
  entityType: text("entity_type").notNull(), // customer, vehicle, deal
  entityId: integer("entity_id").notNull(),
  scoreType: text("score_type").notNull(), // churn_risk, deal_probability, inventory_turn
  score: decimal("score", { precision: 3, scale: 2 }).notNull(), // 0.00-1.00
  factors: jsonb("factors"), // Contributing factors and weights
  modelVersion: text("model_version").notNull(),
  confidence: decimal("confidence", { precision: 3, scale: 2 }),
  validUntil: timestamp("valid_until"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Market Benchmarking
export const marketBenchmarks = pgTable("market_benchmarks", {
  id: serial("id").primaryKey(),
  metricName: text("metric_name").notNull(),
  ourValue: decimal("our_value", { precision: 15, scale: 2 }).notNull(),
  marketAverage: decimal("market_average", { precision: 15, scale: 2 }),
  regionalAverage: decimal("regional_average", { precision: 15, scale: 2 }),
  percentile: integer("percentile"), // Where we rank (1-100)
  vehicleSegment: text("vehicle_segment"), // new, used, truck, suv, etc.
  timeframe: text("timeframe").notNull(), // month, quarter, year
  dataSource: text("data_source").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas for new enterprise tables
export const insertCustomerTimelineSchema = createInsertSchema(customerTimeline).omit({ id: true, timestamp: true });
export const insertAiInsightsSchema = createInsertSchema(aiInsights).omit({ id: true, createdAt: true });
export const insertCollaborationThreadsSchema = createInsertSchema(collaborationThreads).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCollaborationMessagesSchema = createInsertSchema(collaborationMessages).omit({ id: true, timestamp: true });
export const insertKpiMetricsSchema = createInsertSchema(kpiMetrics).omit({ id: true, createdAt: true });
export const insertDuplicateCustomersSchema = createInsertSchema(duplicateCustomers).omit({ id: true, createdAt: true });
export const insertWorkflowTemplatesSchema = createInsertSchema(workflowTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertWorkflowExecutionsSchema = createInsertSchema(workflowExecutions).omit({ id: true, startedAt: true });
export const insertPredictiveScoresSchema = createInsertSchema(predictiveScores).omit({ id: true, createdAt: true });
export const insertMarketBenchmarksSchema = createInsertSchema(marketBenchmarks).omit({ id: true, createdAt: true });

// Types for new enterprise features
export type CustomerTimeline = typeof customerTimeline.$inferSelect;
export type AiInsights = typeof aiInsights.$inferSelect;
export type CollaborationThreads = typeof collaborationThreads.$inferSelect;
export type CollaborationMessages = typeof collaborationMessages.$inferSelect;
export type KpiMetrics = typeof kpiMetrics.$inferSelect;
export type DuplicateCustomers = typeof duplicateCustomers.$inferSelect;
export type WorkflowTemplates = typeof workflowTemplates.$inferSelect;
export type WorkflowExecutions = typeof workflowExecutions.$inferSelect;
export type PredictiveScores = typeof predictiveScores.$inferSelect;
export type MarketBenchmarks = typeof marketBenchmarks.$inferSelect;

export type InsertCustomerTimeline = z.infer<typeof insertCustomerTimelineSchema>;
export type InsertAiInsights = z.infer<typeof insertAiInsightsSchema>;
export type InsertCollaborationThreads = z.infer<typeof insertCollaborationThreadsSchema>;
export type InsertCollaborationMessages = z.infer<typeof insertCollaborationMessagesSchema>;
export type InsertKpiMetrics = z.infer<typeof insertKpiMetricsSchema>;
export type InsertDuplicateCustomers = z.infer<typeof insertDuplicateCustomersSchema>;
export type InsertWorkflowTemplates = z.infer<typeof insertWorkflowTemplatesSchema>;
export type InsertWorkflowExecutions = z.infer<typeof insertWorkflowExecutionsSchema>;
export type InsertPredictiveScores = z.infer<typeof insertPredictiveScoresSchema>;
export type InsertMarketBenchmarks = z.infer<typeof insertMarketBenchmarksSchema>;

// Lead Assignment History
export const leadAssignmentHistory = pgTable("lead_assignment_history", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => xmlLeads.id),
  assignedFrom: varchar("assigned_from", { length: 100 }),
  assignedTo: varchar("assigned_to", { length: 100 }).notNull(),
  assignedBy: varchar("assigned_by", { length: 100 }).notNull(),
  reason: varchar("reason", { length: 200 }), // "Auto-assigned", "Manual reassignment", etc
  assignedAt: timestamp("assigned_at").defaultNow(),
});

// Lead Communication Log
export const leadCommunications = pgTable("lead_communications", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull().references(() => xmlLeads.id),
  communicationType: varchar("communication_type", { length: 50 }).notNull(), // 'call', 'email', 'sms', 'appointment'
  direction: varchar("direction", { length: 10 }).notNull(), // 'inbound', 'outbound'
  subject: varchar("subject", { length: 200 }),
  content: text("content"),
  performedBy: varchar("performed_by", { length: 100 }),
  scheduledFor: timestamp("scheduled_for"),
  completedAt: timestamp("completed_at"),
  outcome: varchar("outcome", { length: 100 }), // 'no_answer', 'voicemail', 'connected', 'appointment_set'
  nextFollowUp: timestamp("next_follow_up"),
  createdAt: timestamp("created_at").defaultNow(),
});

// XML Lead Processing Schema and Types
export const insertXmlLeadSchema = createInsertSchema(xmlLeads);
export const insertLeadDistributionRuleSchema = createInsertSchema(leadDistributionRules);
// Removed duplicate - using insertSystemRoleSchema from user management section above
export const insertUserEnterpriseRoleSchema = createInsertSchema(userEnterpriseRoles);
export const insertModuleConfigSchema = createInsertSchema(moduleConfigs);
export const insertSystemConfigAuditLogSchema = createInsertSchema(systemConfigAuditLog);
export const insertLeadAssignmentHistorySchema = createInsertSchema(leadAssignmentHistory);
export const insertLeadCommunicationSchema = createInsertSchema(leadCommunications);

export type XmlLead = typeof xmlLeads.$inferSelect;
export type InsertXmlLead = typeof xmlLeads.$inferInsert;
export type LeadDistributionRule = typeof leadDistributionRules.$inferSelect;
export type InsertLeadDistributionRule = typeof leadDistributionRules.$inferInsert;
// Removed duplicate - using types from user management section above
export type UserEnterpriseRole = typeof userEnterpriseRoles.$inferSelect;
export type InsertUserEnterpriseRole = typeof userEnterpriseRoles.$inferInsert;
export type ModuleConfig = typeof moduleConfigs.$inferSelect;
export type InsertModuleConfig = typeof moduleConfigs.$inferInsert;
export type SystemConfigAuditLog = typeof systemConfigAuditLog.$inferSelect;
export type InsertSystemConfigAuditLog = typeof systemConfigAuditLog.$inferInsert;
export type LeadAssignmentHistory = typeof leadAssignmentHistory.$inferSelect;
export type InsertLeadAssignmentHistory = typeof leadAssignmentHistory.$inferInsert;
export type LeadCommunication = typeof leadCommunications.$inferSelect;
export type InsertLeadCommunication = typeof leadCommunications.$inferInsert;

// Customer Text Messages System
export const textMessages = pgTable("text_messages", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  senderId: varchar("sender_id").references(() => users.id), // varchar to match users.id
  direction: text("direction").notNull(), // inbound, outbound
  phoneNumber: text("phone_number").notNull(),
  messageBody: text("message_body").notNull(),
  status: text("status").default("sent").notNull(), // sent, delivered, failed, pending
  messageType: text("message_type").default("sms").notNull(), // sms, mms
  attachments: jsonb("attachments"), // media files, images, documents
  campaignId: integer("campaign_id"),
  threadId: text("thread_id"), // for message threading/conversations
  cost: decimal("cost", { precision: 8, scale: 4 }),
  deliveredAt: timestamp("delivered_at"),
  readAt: timestamp("read_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Phone Call Management System
export const phoneCalls = pgTable("phone_calls", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => customers.id).notNull(),
  userId: varchar("user_id").references(() => users.id), // varchar to match users.id
  direction: text("direction").notNull(), // inbound, outbound
  phoneNumber: text("phone_number").notNull(),
  status: text("status").notNull(), // completed, missed, busy, no_answer, failed
  duration: integer("duration"), // in seconds
  recordingUrl: text("recording_url"), // URL to call recording
  callNotes: text("call_notes"),
  followUpRequired: boolean("follow_up_required").default(false),
  followUpDate: timestamp("follow_up_date"),
  callPurpose: text("call_purpose"), // sales, service, follow_up, support
  outcome: text("outcome"), // sale, appointment, callback, no_interest, etc.
  tags: jsonb("tags"), // categorization tags
  cost: decimal("cost", { precision: 8, scale: 4 }),
  externalCallId: text("external_call_id"), // third-party phone system ID
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Text Message Templates
export const messageTemplates = pgTable("message_templates", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // greeting, follow_up, appointment, promotional, service
  subject: text("subject"),
  body: text("body").notNull(),
  variables: jsonb("variables"), // placeholder variables like {customerName}, {dealerName}
  isActive: boolean("is_active").default(true),
  createdBy: varchar("created_by").references(() => users.id), // varchar to match users.id
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Communication Settings and Configuration
export const communicationSettings = pgTable("communication_settings", {
  id: serial("id").primaryKey(),
  settingKey: text("setting_key").notNull().unique(),
  settingValue: jsonb("setting_value"),
  displayName: text("display_name"),
  description: text("description"),
  category: text("category").notNull(), // sms, phone, email, general
  dataType: text("data_type").notNull(), // string, number, boolean, json
  isRequired: boolean("is_required").default(false),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas for communication tables
export const insertTextMessageSchema = createInsertSchema(textMessages).omit({ id: true, createdAt: true });
export const insertPhoneCallSchema = createInsertSchema(phoneCalls).omit({ id: true, createdAt: true });
export const insertMessageTemplateSchema = createInsertSchema(messageTemplates).omit({ id: true, createdAt: true, updatedAt: true });
export const insertCommunicationSettingSchema = createInsertSchema(communicationSettings).omit({ id: true, createdAt: true, updatedAt: true });

// Types for communication tables
export type TextMessage = typeof textMessages.$inferSelect;
export type InsertTextMessage = typeof textMessages.$inferInsert;
export type PhoneCall = typeof phoneCalls.$inferSelect;
export type InsertPhoneCall = typeof phoneCalls.$inferInsert;
export type MessageTemplate = typeof messageTemplates.$inferSelect;
export type InsertMessageTemplate = typeof messageTemplates.$inferInsert;
export type CommunicationSetting = typeof communicationSettings.$inferSelect;
export type InsertCommunicationSetting = typeof communicationSettings.$inferInsert;

// ========================================
// AI MARKET LEAD ENGINE - Lead Generation & Intelligence System
// ========================================

// Market Leads - captured from web scraping and social monitoring
export const marketLeads = pgTable("market_leads", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  email: varchar("email"),
  phone: varchar("phone"),
  contact: varchar("contact"), // general contact info
  source: varchar("source").notNull(), // website/platform where found
  sourceUrl: varchar("source_url"), // specific URL where found
  postContent: text("post_content"), // original post/message content
  vehicleInterest: text("vehicle_interest").array().default([]),
  intentScore: integer("intent_score").default(0), // 0-100 ML-generated score
  lifecycleStage: varchar("lifecycle_stage").notNull().default("awareness"), // awareness, consideration, intent, purchase, ownership
  region: varchar("region"),
  budgetRange: varchar("budget_range"),
  timeframe: varchar("timeframe"), // when they plan to buy
  lastSeen: timestamp("last_seen").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  isConverted: boolean("is_converted").default(false),
  convertedCustomerId: varchar("converted_customer_id"), // links to customers table when converted
  status: varchar("status").default("new"), // new, contacted, qualified, lost
});

// Lead Activity - track all interactions and signals
export const leadActivity = pgTable("lead_activity", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => marketLeads.id),
  type: varchar("type").notNull(), // post, search, visit, inquiry, etc.
  detail: text("detail").notNull(),
  source: varchar("source"), // where this activity was found
  timestamp: timestamp("timestamp").defaultNow(),
  confidence: integer("confidence").default(100), // ML confidence in this signal
  metadata: jsonb("metadata"), // additional structured data
});

// Lead Alerts - ML-triggered notifications for hot leads
export const leadAlerts = pgTable("lead_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => marketLeads.id),
  trigger: varchar("trigger").notNull(), // high_intent, repeat_visits, price_shopping, etc.
  message: text("message").notNull(),
  priority: varchar("priority").default("medium"), // low, medium, high, critical
  status: varchar("status").default("new"), // new, read, actioned, dismissed
  createdAt: timestamp("created_at").defaultNow(),
  actionedBy: varchar("actioned_by"), // user who took action
  actionedAt: timestamp("actioned_at"),
});

// Lead Sources - track where we're finding leads
export const leadSources = pgTable("lead_sources", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: varchar("name").notNull(),
  url: varchar("url").notNull(),
  type: varchar("type").notNull(), // forum, marketplace, social, review_site, etc.
  isActive: boolean("is_active").default(true),
  lastScraped: timestamp("last_scraped"),
  totalLeadsFound: integer("total_leads_found").default(0),
  successRate: integer("success_rate").default(0), // conversion rate
  createdAt: timestamp("created_at").defaultNow(),
});

// ML Intent Scores - historical scoring for trend analysis
export const intentScores = pgTable("intent_scores", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  leadId: varchar("lead_id").notNull().references(() => marketLeads.id),
  score: integer("score").notNull(),
  factors: text("factors").array(), // what drove this score
  modelVersion: varchar("model_version"),
  calculatedAt: timestamp("calculated_at").defaultNow(),
});

// Zod schemas for validation
export const insertMarketLeadSchema = createInsertSchema(marketLeads);
export const insertLeadActivitySchema = createInsertSchema(leadActivity);
export const insertLeadAlertSchema = createInsertSchema(leadAlerts);
export const insertLeadSourceSchema = createInsertSchema(leadSources);
export const insertIntentScoreSchema = createInsertSchema(intentScores);

// Types
export type MarketLead = typeof marketLeads.$inferSelect;
export type InsertMarketLead = z.infer<typeof insertMarketLeadSchema>;

export type LeadActivity = typeof leadActivity.$inferSelect;
export type InsertLeadActivity = z.infer<typeof insertLeadActivitySchema>;

export type LeadAlert = typeof leadAlerts.$inferSelect;
export type InsertLeadAlert = z.infer<typeof insertLeadAlertSchema>;

export type LeadSource = typeof leadSources.$inferSelect;
export type InsertLeadSource = z.infer<typeof insertLeadSourceSchema>;

export type IntentScore = typeof intentScores.$inferSelect;
export type InsertIntentScore = z.infer<typeof insertIntentScoreSchema>;
