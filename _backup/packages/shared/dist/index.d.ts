export { Activity, CardContext, CardDef, CardKind, CardPriority, CardSize, CompetitivePricing, CreditApplication, CreditApplicationStatus, Customer, CustomerDigitalProfile, CustomerJourney, CustomerTouchpoint, Deal, Department, EXAMPLE_CARDS, FiProduct, FiProductCostStructure, FiProductEligibilityCriteria, FiProductRetailPricing, FiProductTermOptions, InsertFiProduct, InsertLeadDistributionRule, InsertLenderApplication, InsertSystemRole, InsertVehicle, Lead, LeadDistributionRule, LenderApplication, MarketTrends, MerchandisingStrategies, Permission, PricingInsights, Role, Sale, ServiceOrder, SystemRole, User, Vehicle, deriveFromWidget, insertVehicleSchema, vehicleSchema, vehicleStatusSchema } from './schema/index.js';
export { AnalyticsDashboardRange, AnalyticsEventMetric, AnalyticsRefreshInterval, AnalyticsRetentionWindow, AnalyticsSettings, AnalyticsWidget, ApiKeyRecord, ApiKeyStatus, ApiKeyWithSecret, AuditLogEntry, BackupRetentionWindow, BackupSchedule, BrandingSettings, BusinessDay, BusinessHour, ConversionGoal, ConversionGoalStatus, ConversionGoalTrigger, CreateSettingsUserInput, CustomEventDefinition, CustomEventInput, CustomEventParameter, CustomEventParameterType, CustomerRetentionWindow, DAY_LABELS, DataExportEntity, DataExportFormat, DataSettings, DealershipSettings, LeadRetentionWindow, RememberDurationOption, ReportFormat, ReportFrequency, ScheduledReportDefinition, ScheduledReportInput, SecuritySettings, SessionTimeoutOption, SettingsUser, SettingsUserInput, SettingsUserPermissionKey, SettingsUserRole, SettingsUserStatus, UpdateSettingsUserInput, WebhookConfig, WebhookInput, WebhookStatus, analyticsDashboardRanges, analyticsEventMetricSchema, analyticsRefreshIntervals, analyticsRetentionOptions, analyticsSettingsSchema, analyticsWidgetOptions, apiKeySchema, apiKeyStatusOptions, apiKeyWithSecretSchema, auditLogSchema, backupRetentionOptions, backupScheduleOptions, brandingSettingsSchema, businessDays, conversionGoalStatusOptions, conversionGoalTriggerOptions, createSettingsUserSchema, customEventInputSchema, customEventParameterTypes, customEventSchema, customerRetentionOptions, dataExportEntities, dataExportFormats, dataSettingsSchema, dealershipSettingsSchema, defaultAnalyticsSettings, defaultBrandingSettings, defaultDataSettings, defaultDealershipSettings, leadRetentionOptions, paginatedAuditLogSchema, paginatedSettingsUsersSchema, rememberDurationOptions, reportFormatOptions, reportFrequencyOptions, scheduledReportInputSchema, scheduledReportSchema, securitySettingsSchema, sessionTimeoutOptions, settingsUserInputSchema, settingsUserPermissionKeys, settingsUserPermissionsSchema, settingsUserRoles, settingsUserSchema, settingsUserStatuses, updateSettingsUserSchema, webhookInputSchema, webhookSchema, webhookStatusOptions } from './settings-schema/index.js';
export { A as AcknowledgeInsightRequest, n as AssignInsightRequest, C as ClaimInsightRequest, c as Insight, d as InsightAction, e as InsightAudience, k as InsightFilterOptions, h as InsightPayload, b as InsightPriority, g as InsightRule, l as InsightSortBy, m as InsightSortOrder, a as InsightState, i as InsightStateTransitions, I as InsightType, f as InsightUserState, R as ResolveInsightRequest, S as SnoozeInsightRequest, o as calculateSnoozeUntil, r as getPriorityScore, p as isInsightExpired, q as isInsightSnoozed, j as isValidTransition } from './insights-DN_WgXev.js';
import 'zod';

/**
 * RBAC Effective Permissions System
 *
 * Implements a flexible permission system with:
 * - Role-based default permissions
 * - User-specific overrides (grants + denies)
 * - Deny priority over allow
 * - Simple permission checking API
 */
interface RbacRole {
    id: string;
    name: string;
    permissions: string[];
}
interface RbacUser {
    id: string;
    roleIds: string[];
}
interface PermissionGrant {
    userId: string;
    permission: string;
    granted: boolean;
    reason?: string;
    grantedBy?: string;
    grantedAt?: Date;
}
interface EffectivePermissions {
    userId: string;
    roleIds: string[];
    permissions: Set<string>;
    denials: Set<string>;
}
/**
 * Build effective permissions for a user
 *
 * Priority order:
 * 1. Explicit denials (highest priority)
 * 2. Explicit grants
 * 3. Role defaults (lowest priority)
 *
 * @param user User object with roleIds
 * @param roles Array of all roles
 * @param grants Array of user-specific permission grants/denials
 * @returns EffectivePermissions object
 */
declare function buildEffectivePermissions(user: RbacUser, roles: RbacRole[], grants: PermissionGrant[]): EffectivePermissions;
/**
 * Create a permission checker function
 *
 * @param effective EffectivePermissions object
 * @returns Function that checks if user has a permission
 */
declare function makePermChecker(effective: EffectivePermissions): (permission: string) => boolean;
/**
 * Check if user has any of the specified permissions
 *
 * @param effective EffectivePermissions object
 * @param permissions Array of permissions to check
 * @returns true if user has at least one permission
 */
declare function hasAnyPermission(effective: EffectivePermissions, permissions: string[]): boolean;
/**
 * Check if user has all of the specified permissions
 *
 * @param effective EffectivePermissions object
 * @param permissions Array of permissions to check
 * @returns true if user has all permissions
 */
declare function hasAllPermissions(effective: EffectivePermissions, permissions: string[]): boolean;
/**
 * Get all permissions user does NOT have
 *
 * @param effective EffectivePermissions object
 * @param requestedPermissions Array of permissions to check
 * @returns Array of missing permissions
 */
declare function getMissingPermissions(effective: EffectivePermissions, requestedPermissions: string[]): string[];
/**
 * Serialize effective permissions to JSON (for caching)
 *
 * @param effective EffectivePermissions object
 * @returns JSON-serializable object
 */
declare function serializePermissions(effective: EffectivePermissions): {
    userId: string;
    roleIds: string[];
    permissions: string[];
    denials: string[];
};
/**
 * Deserialize effective permissions from JSON
 *
 * @param data Serialized permissions
 * @returns EffectivePermissions object
 */
declare function deserializePermissions(data: {
    userId: string;
    roleIds: string[];
    permissions: string[];
    denials: string[];
}): EffectivePermissions;
/**
 * Common permission constants
 */
declare const Permissions: {
    readonly VIEW_CUSTOMER_PII: "VIEW_CUSTOMER_PII";
    readonly EDIT_CUSTOMER_PII: "EDIT_CUSTOMER_PII";
    readonly EXPORT_CUSTOMER_PII: "EXPORT_CUSTOMER_PII";
    readonly VIEW_DEAL: "VIEW_DEAL";
    readonly CREATE_DEAL: "CREATE_DEAL";
    readonly EDIT_DEAL: "EDIT_DEAL";
    readonly DELETE_DEAL: "DELETE_DEAL";
    readonly APPROVE_DEAL: "APPROVE_DEAL";
    readonly VIEW_DEAL_COST: "VIEW_DEAL_COST";
    readonly VIEW_DEAL_MARGIN: "VIEW_DEAL_MARGIN";
    readonly VIEW_LEAD: "VIEW_LEAD";
    readonly CREATE_LEAD: "CREATE_LEAD";
    readonly EDIT_LEAD: "EDIT_LEAD";
    readonly ASSIGN_LEAD: "ASSIGN_LEAD";
    readonly VIEW_INVENTORY: "VIEW_INVENTORY";
    readonly EDIT_INVENTORY: "EDIT_INVENTORY";
    readonly VIEW_INVENTORY_COST: "VIEW_INVENTORY_COST";
    readonly PRICE_VEHICLE: "PRICE_VEHICLE";
    readonly VIEW_ANALYTICS: "VIEW_ANALYTICS";
    readonly VIEW_TEAM_PERFORMANCE: "VIEW_TEAM_PERFORMANCE";
    readonly VIEW_FINANCIAL_REPORTS: "VIEW_FINANCIAL_REPORTS";
    readonly MANAGE_USERS: "MANAGE_USERS";
    readonly MANAGE_ROLES: "MANAGE_ROLES";
    readonly VIEW_AUDIT_LOG: "VIEW_AUDIT_LOG";
    readonly MANAGE_SETTINGS: "MANAGE_SETTINGS";
    readonly VIEW_INSIGHTS: "VIEW_INSIGHTS";
    readonly CREATE_INSIGHTS: "CREATE_INSIGHTS";
    readonly CLAIM_INSIGHTS: "CLAIM_INSIGHTS";
    readonly RESOLVE_INSIGHTS: "RESOLVE_INSIGHTS";
    readonly CUSTOMIZE_DASHBOARD: "CUSTOMIZE_DASHBOARD";
    readonly VIEW_SYSTEM_HEALTH: "VIEW_SYSTEM_HEALTH";
};
/**
 * Role permission presets
 */
declare const RolePresets: Record<string, string[]>;

export { type EffectivePermissions, type PermissionGrant, Permissions, type RbacRole, type RbacUser, RolePresets, buildEffectivePermissions, deserializePermissions, getMissingPermissions, hasAllPermissions, hasAnyPermission, makePermChecker, serializePermissions };
