import { z } from 'zod';

/**
 * =========================
 * User management schemas
 * =========================
 */
declare const settingsUserRoles: readonly ["SALES", "SALES_MANAGER", "FINANCE", "FINANCE_MANAGER", "SERVICE", "SERVICE_MANAGER", "BDC", "ACCOUNTING", "OPERATIONS", "MARKETING", "ADMIN", "SUPER_ADMIN"];
type SettingsUserRole = (typeof settingsUserRoles)[number];
declare const settingsUserStatuses: readonly ["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"];
type SettingsUserStatus = (typeof settingsUserStatuses)[number];
declare const settingsUserPermissionKeys: readonly ["viewAllDeals", "editAllDeals", "deleteDeals", "viewReports", "manageInventory", "approveDeals", "accessAccounting", "manageSettings"];
type SettingsUserPermissionKey = (typeof settingsUserPermissionKeys)[number];
declare const settingsUserPermissionsSchema: z.ZodObject<{
    viewAllDeals: z.ZodDefault<z.ZodBoolean>;
    editAllDeals: z.ZodDefault<z.ZodBoolean>;
    deleteDeals: z.ZodDefault<z.ZodBoolean>;
    viewReports: z.ZodDefault<z.ZodBoolean>;
    manageInventory: z.ZodDefault<z.ZodBoolean>;
    approveDeals: z.ZodDefault<z.ZodBoolean>;
    accessAccounting: z.ZodDefault<z.ZodBoolean>;
    manageSettings: z.ZodDefault<z.ZodBoolean>;
}, "strip", z.ZodTypeAny, {
    viewAllDeals: boolean;
    editAllDeals: boolean;
    deleteDeals: boolean;
    viewReports: boolean;
    manageInventory: boolean;
    approveDeals: boolean;
    accessAccounting: boolean;
    manageSettings: boolean;
}, {
    viewAllDeals?: boolean | undefined;
    editAllDeals?: boolean | undefined;
    deleteDeals?: boolean | undefined;
    viewReports?: boolean | undefined;
    manageInventory?: boolean | undefined;
    approveDeals?: boolean | undefined;
    accessAccounting?: boolean | undefined;
    manageSettings?: boolean | undefined;
}>;
declare const settingsUserInputSchema: z.ZodObject<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string | undefined>;
    role: z.ZodDefault<z.ZodEnum<["SALES", "SALES_MANAGER", "FINANCE", "FINANCE_MANAGER", "SERVICE", "SERVICE_MANAGER", "BDC", "ACCOUNTING", "OPERATIONS", "MARKETING", "ADMIN", "SUPER_ADMIN"]>>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"]>>;
    permissions: z.ZodDefault<z.ZodObject<{
        viewAllDeals: z.ZodDefault<z.ZodBoolean>;
        editAllDeals: z.ZodDefault<z.ZodBoolean>;
        deleteDeals: z.ZodDefault<z.ZodBoolean>;
        viewReports: z.ZodDefault<z.ZodBoolean>;
        manageInventory: z.ZodDefault<z.ZodBoolean>;
        approveDeals: z.ZodDefault<z.ZodBoolean>;
        accessAccounting: z.ZodDefault<z.ZodBoolean>;
        manageSettings: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    }, {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    }>>;
}, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED";
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN";
    permissions: {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    };
}, {
    firstName: string;
    lastName: string;
    email: string;
    status?: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED" | undefined;
    phone?: string | undefined;
    role?: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN" | undefined;
    permissions?: {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    } | undefined;
}>;
type SettingsUserInput = z.infer<typeof settingsUserInputSchema>;
declare const createSettingsUserSchema: z.ZodObject<z.objectUtil.extendShape<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string | undefined>;
    role: z.ZodDefault<z.ZodEnum<["SALES", "SALES_MANAGER", "FINANCE", "FINANCE_MANAGER", "SERVICE", "SERVICE_MANAGER", "BDC", "ACCOUNTING", "OPERATIONS", "MARKETING", "ADMIN", "SUPER_ADMIN"]>>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"]>>;
    permissions: z.ZodDefault<z.ZodObject<{
        viewAllDeals: z.ZodDefault<z.ZodBoolean>;
        editAllDeals: z.ZodDefault<z.ZodBoolean>;
        deleteDeals: z.ZodDefault<z.ZodBoolean>;
        viewReports: z.ZodDefault<z.ZodBoolean>;
        manageInventory: z.ZodDefault<z.ZodBoolean>;
        approveDeals: z.ZodDefault<z.ZodBoolean>;
        accessAccounting: z.ZodDefault<z.ZodBoolean>;
        manageSettings: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    }, {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    }>>;
}, {
    password: z.ZodString;
}>, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED";
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN";
    permissions: {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    };
    password: string;
}, {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    status?: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED" | undefined;
    phone?: string | undefined;
    role?: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN" | undefined;
    permissions?: {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    } | undefined;
}>;
type CreateSettingsUserInput = z.infer<typeof createSettingsUserSchema>;
declare const updateSettingsUserSchema: z.ZodObject<z.objectUtil.extendShape<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string | undefined>;
    role: z.ZodDefault<z.ZodEnum<["SALES", "SALES_MANAGER", "FINANCE", "FINANCE_MANAGER", "SERVICE", "SERVICE_MANAGER", "BDC", "ACCOUNTING", "OPERATIONS", "MARKETING", "ADMIN", "SUPER_ADMIN"]>>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"]>>;
    permissions: z.ZodDefault<z.ZodObject<{
        viewAllDeals: z.ZodDefault<z.ZodBoolean>;
        editAllDeals: z.ZodDefault<z.ZodBoolean>;
        deleteDeals: z.ZodDefault<z.ZodBoolean>;
        viewReports: z.ZodDefault<z.ZodBoolean>;
        manageInventory: z.ZodDefault<z.ZodBoolean>;
        approveDeals: z.ZodDefault<z.ZodBoolean>;
        accessAccounting: z.ZodDefault<z.ZodBoolean>;
        manageSettings: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    }, {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    }>>;
}, {
    password: z.ZodOptional<z.ZodString>;
}>, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED";
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN";
    permissions: {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    };
    password?: string | undefined;
}, {
    firstName: string;
    lastName: string;
    email: string;
    status?: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED" | undefined;
    phone?: string | undefined;
    role?: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN" | undefined;
    permissions?: {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    } | undefined;
    password?: string | undefined;
}>;
type UpdateSettingsUserInput = z.infer<typeof updateSettingsUserSchema>;
declare const settingsUserSchema: z.ZodObject<z.objectUtil.extendShape<{
    firstName: z.ZodString;
    lastName: z.ZodString;
    email: z.ZodString;
    phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string | undefined>;
    role: z.ZodDefault<z.ZodEnum<["SALES", "SALES_MANAGER", "FINANCE", "FINANCE_MANAGER", "SERVICE", "SERVICE_MANAGER", "BDC", "ACCOUNTING", "OPERATIONS", "MARKETING", "ADMIN", "SUPER_ADMIN"]>>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"]>>;
    permissions: z.ZodDefault<z.ZodObject<{
        viewAllDeals: z.ZodDefault<z.ZodBoolean>;
        editAllDeals: z.ZodDefault<z.ZodBoolean>;
        deleteDeals: z.ZodDefault<z.ZodBoolean>;
        viewReports: z.ZodDefault<z.ZodBoolean>;
        manageInventory: z.ZodDefault<z.ZodBoolean>;
        approveDeals: z.ZodDefault<z.ZodBoolean>;
        accessAccounting: z.ZodDefault<z.ZodBoolean>;
        manageSettings: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    }, {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    }>>;
}, {
    id: z.ZodString;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    lastLoginAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}>, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED";
    id: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    role: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN";
    permissions: {
        viewAllDeals: boolean;
        editAllDeals: boolean;
        deleteDeals: boolean;
        viewReports: boolean;
        manageInventory: boolean;
        approveDeals: boolean;
        accessAccounting: boolean;
        manageSettings: boolean;
    };
    lastLoginAt?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    firstName: string;
    lastName: string;
    email: string;
    status?: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED" | undefined;
    phone?: string | undefined;
    role?: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN" | undefined;
    permissions?: {
        viewAllDeals?: boolean | undefined;
        editAllDeals?: boolean | undefined;
        deleteDeals?: boolean | undefined;
        viewReports?: boolean | undefined;
        manageInventory?: boolean | undefined;
        approveDeals?: boolean | undefined;
        accessAccounting?: boolean | undefined;
        manageSettings?: boolean | undefined;
    } | undefined;
    lastLoginAt?: string | null | undefined;
}>;
type SettingsUser = z.infer<typeof settingsUserSchema>;
declare const paginatedSettingsUsersSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<z.objectUtil.extendShape<{
        firstName: z.ZodString;
        lastName: z.ZodString;
        email: z.ZodString;
        phone: z.ZodEffects<z.ZodOptional<z.ZodString>, string, string | undefined>;
        role: z.ZodDefault<z.ZodEnum<["SALES", "SALES_MANAGER", "FINANCE", "FINANCE_MANAGER", "SERVICE", "SERVICE_MANAGER", "BDC", "ACCOUNTING", "OPERATIONS", "MARKETING", "ADMIN", "SUPER_ADMIN"]>>;
        status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "INVITED", "SUSPENDED"]>>;
        permissions: z.ZodDefault<z.ZodObject<{
            viewAllDeals: z.ZodDefault<z.ZodBoolean>;
            editAllDeals: z.ZodDefault<z.ZodBoolean>;
            deleteDeals: z.ZodDefault<z.ZodBoolean>;
            viewReports: z.ZodDefault<z.ZodBoolean>;
            manageInventory: z.ZodDefault<z.ZodBoolean>;
            approveDeals: z.ZodDefault<z.ZodBoolean>;
            accessAccounting: z.ZodDefault<z.ZodBoolean>;
            manageSettings: z.ZodDefault<z.ZodBoolean>;
        }, "strip", z.ZodTypeAny, {
            viewAllDeals: boolean;
            editAllDeals: boolean;
            deleteDeals: boolean;
            viewReports: boolean;
            manageInventory: boolean;
            approveDeals: boolean;
            accessAccounting: boolean;
            manageSettings: boolean;
        }, {
            viewAllDeals?: boolean | undefined;
            editAllDeals?: boolean | undefined;
            deleteDeals?: boolean | undefined;
            viewReports?: boolean | undefined;
            manageInventory?: boolean | undefined;
            approveDeals?: boolean | undefined;
            accessAccounting?: boolean | undefined;
            manageSettings?: boolean | undefined;
        }>>;
    }, {
        id: z.ZodString;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        lastLoginAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }>, "strict", z.ZodTypeAny, {
        status: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED";
        id: string;
        createdAt: string;
        updatedAt: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        role: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN";
        permissions: {
            viewAllDeals: boolean;
            editAllDeals: boolean;
            deleteDeals: boolean;
            viewReports: boolean;
            manageInventory: boolean;
            approveDeals: boolean;
            accessAccounting: boolean;
            manageSettings: boolean;
        };
        lastLoginAt?: string | null | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        firstName: string;
        lastName: string;
        email: string;
        status?: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED" | undefined;
        phone?: string | undefined;
        role?: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN" | undefined;
        permissions?: {
            viewAllDeals?: boolean | undefined;
            editAllDeals?: boolean | undefined;
            deleteDeals?: boolean | undefined;
            viewReports?: boolean | undefined;
            manageInventory?: boolean | undefined;
            approveDeals?: boolean | undefined;
            accessAccounting?: boolean | undefined;
            manageSettings?: boolean | undefined;
        } | undefined;
        lastLoginAt?: string | null | undefined;
    }>, "many">;
    meta: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        pageCount: z.ZodOptional<z.ZodNumber>;
        hasNext: z.ZodOptional<z.ZodBoolean>;
        hasPrevious: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    }, {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    data: {
        status: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED";
        id: string;
        createdAt: string;
        updatedAt: string;
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
        role: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN";
        permissions: {
            viewAllDeals: boolean;
            editAllDeals: boolean;
            deleteDeals: boolean;
            viewReports: boolean;
            manageInventory: boolean;
            approveDeals: boolean;
            accessAccounting: boolean;
            manageSettings: boolean;
        };
        lastLoginAt?: string | null | undefined;
    }[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    };
}, {
    data: {
        id: string;
        createdAt: string;
        updatedAt: string;
        firstName: string;
        lastName: string;
        email: string;
        status?: "ACTIVE" | "INACTIVE" | "INVITED" | "SUSPENDED" | undefined;
        phone?: string | undefined;
        role?: "SALES_MANAGER" | "BDC" | "SALES" | "FINANCE" | "FINANCE_MANAGER" | "SERVICE" | "SERVICE_MANAGER" | "ACCOUNTING" | "OPERATIONS" | "MARKETING" | "ADMIN" | "SUPER_ADMIN" | undefined;
        permissions?: {
            viewAllDeals?: boolean | undefined;
            editAllDeals?: boolean | undefined;
            deleteDeals?: boolean | undefined;
            viewReports?: boolean | undefined;
            manageInventory?: boolean | undefined;
            approveDeals?: boolean | undefined;
            accessAccounting?: boolean | undefined;
            manageSettings?: boolean | undefined;
        } | undefined;
        lastLoginAt?: string | null | undefined;
    }[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    };
}>;
/**
 * =========================
 * Security settings schemas
 * =========================
 */
declare const sessionTimeoutOptions: readonly ["15m", "30m", "1h", "2h", "4h", "8h"];
type SessionTimeoutOption = (typeof sessionTimeoutOptions)[number];
declare const rememberDurationOptions: readonly ["7d", "14d", "30d", "60d", "90d"];
type RememberDurationOption = (typeof rememberDurationOptions)[number];
declare const webhookStatusOptions: readonly ["ACTIVE", "PAUSED", "DISABLED"];
type WebhookStatus = (typeof webhookStatusOptions)[number];
declare const webhookSchema: z.ZodObject<{
    id: z.ZodString;
    event: z.ZodString;
    url: z.ZodString;
    secret: z.ZodString;
    status: z.ZodEnum<["ACTIVE", "PAUSED", "DISABLED"]>;
    createdAt: z.ZodString;
    updatedAt: z.ZodOptional<z.ZodString>;
    lastTriggeredAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "PAUSED" | "DISABLED";
    id: string;
    createdAt: string;
    event: string;
    url: string;
    secret: string;
    updatedAt?: string | undefined;
    lastTriggeredAt?: string | null | undefined;
}, {
    status: "ACTIVE" | "PAUSED" | "DISABLED";
    id: string;
    createdAt: string;
    event: string;
    url: string;
    secret: string;
    updatedAt?: string | undefined;
    lastTriggeredAt?: string | null | undefined;
}>;
type WebhookConfig = z.infer<typeof webhookSchema>;
declare const webhookInputSchema: z.ZodObject<{
    event: z.ZodString;
    url: z.ZodString;
    secret: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "PAUSED", "DISABLED"]>>;
}, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "PAUSED" | "DISABLED";
    event: string;
    url: string;
    secret: string;
}, {
    event: string;
    url: string;
    secret: string;
    status?: "ACTIVE" | "PAUSED" | "DISABLED" | undefined;
}>;
type WebhookInput = z.infer<typeof webhookInputSchema>;
declare const apiKeyStatusOptions: readonly ["ACTIVE", "REVOKED", "EXPIRED"];
type ApiKeyStatus = (typeof apiKeyStatusOptions)[number];
declare const apiKeySchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    maskedKey: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "REVOKED", "EXPIRED"]>>;
    createdAt: z.ZodString;
    lastUsedAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "REVOKED" | "EXPIRED";
    id: string;
    createdAt: string;
    name: string;
    maskedKey: string;
    lastUsedAt?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    name: string;
    maskedKey: string;
    status?: "ACTIVE" | "REVOKED" | "EXPIRED" | undefined;
    lastUsedAt?: string | null | undefined;
}>;
type ApiKeyRecord = z.infer<typeof apiKeySchema>;
declare const apiKeyWithSecretSchema: z.ZodObject<z.objectUtil.extendShape<{
    id: z.ZodString;
    name: z.ZodString;
    maskedKey: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "REVOKED", "EXPIRED"]>>;
    createdAt: z.ZodString;
    lastUsedAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, {
    secret: z.ZodString;
}>, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "REVOKED" | "EXPIRED";
    id: string;
    createdAt: string;
    secret: string;
    name: string;
    maskedKey: string;
    lastUsedAt?: string | null | undefined;
}, {
    id: string;
    createdAt: string;
    secret: string;
    name: string;
    maskedKey: string;
    status?: "ACTIVE" | "REVOKED" | "EXPIRED" | undefined;
    lastUsedAt?: string | null | undefined;
}>;
type ApiKeyWithSecret = z.infer<typeof apiKeyWithSecretSchema>;
declare const auditLogSchema: z.ZodObject<{
    id: z.ZodString;
    timestamp: z.ZodString;
    userId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    userName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    action: z.ZodString;
    resource: z.ZodString;
    ipAddress: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    details: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    id: string;
    timestamp: string;
    action: string;
    resource: string;
    userId?: string | null | undefined;
    userName?: string | null | undefined;
    ipAddress?: string | null | undefined;
    details?: string | null | undefined;
}, {
    id: string;
    timestamp: string;
    action: string;
    resource: string;
    userId?: string | null | undefined;
    userName?: string | null | undefined;
    ipAddress?: string | null | undefined;
    details?: string | null | undefined;
}>;
type AuditLogEntry = z.infer<typeof auditLogSchema>;
declare const paginatedAuditLogSchema: z.ZodObject<{
    data: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        timestamp: z.ZodString;
        userId: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        userName: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        action: z.ZodString;
        resource: z.ZodString;
        ipAddress: z.ZodNullable<z.ZodOptional<z.ZodString>>;
        details: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        id: string;
        timestamp: string;
        action: string;
        resource: string;
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        ipAddress?: string | null | undefined;
        details?: string | null | undefined;
    }, {
        id: string;
        timestamp: string;
        action: string;
        resource: string;
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        ipAddress?: string | null | undefined;
        details?: string | null | undefined;
    }>, "many">;
    meta: z.ZodObject<{
        total: z.ZodNumber;
        page: z.ZodNumber;
        pageSize: z.ZodNumber;
        pageCount: z.ZodOptional<z.ZodNumber>;
        hasNext: z.ZodOptional<z.ZodBoolean>;
        hasPrevious: z.ZodOptional<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    }, {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    data: {
        id: string;
        timestamp: string;
        action: string;
        resource: string;
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        ipAddress?: string | null | undefined;
        details?: string | null | undefined;
    }[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    };
}, {
    data: {
        id: string;
        timestamp: string;
        action: string;
        resource: string;
        userId?: string | null | undefined;
        userName?: string | null | undefined;
        ipAddress?: string | null | undefined;
        details?: string | null | undefined;
    }[];
    meta: {
        total: number;
        page: number;
        pageSize: number;
        pageCount?: number | undefined;
        hasNext?: boolean | undefined;
        hasPrevious?: boolean | undefined;
    };
}>;
declare const securitySettingsSchema: z.ZodObject<{
    twoFactorEnabled: z.ZodDefault<z.ZodBoolean>;
    minPasswordLength: z.ZodDefault<z.ZodNumber>;
    requireUppercase: z.ZodDefault<z.ZodBoolean>;
    requireNumber: z.ZodDefault<z.ZodBoolean>;
    requireSpecial: z.ZodDefault<z.ZodBoolean>;
    sessionTimeout: z.ZodDefault<z.ZodEnum<["15m", "30m", "1h", "2h", "4h", "8h"]>>;
    rememberDuration: z.ZodDefault<z.ZodEnum<["7d", "14d", "30d", "60d", "90d"]>>;
    ipWhitelist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    ipBlacklist: z.ZodDefault<z.ZodArray<z.ZodString, "many">>;
    maxFailedAttempts: z.ZodDefault<z.ZodNumber>;
    lockoutMinutes: z.ZodDefault<z.ZodNumber>;
    webhooks: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        event: z.ZodString;
        url: z.ZodString;
        secret: z.ZodString;
        status: z.ZodEnum<["ACTIVE", "PAUSED", "DISABLED"]>;
        createdAt: z.ZodString;
        updatedAt: z.ZodOptional<z.ZodString>;
        lastTriggeredAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        status: "ACTIVE" | "PAUSED" | "DISABLED";
        id: string;
        createdAt: string;
        event: string;
        url: string;
        secret: string;
        updatedAt?: string | undefined;
        lastTriggeredAt?: string | null | undefined;
    }, {
        status: "ACTIVE" | "PAUSED" | "DISABLED";
        id: string;
        createdAt: string;
        event: string;
        url: string;
        secret: string;
        updatedAt?: string | undefined;
        lastTriggeredAt?: string | null | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    twoFactorEnabled: boolean;
    minPasswordLength: number;
    requireUppercase: boolean;
    requireNumber: boolean;
    requireSpecial: boolean;
    sessionTimeout: "15m" | "30m" | "1h" | "2h" | "4h" | "8h";
    rememberDuration: "7d" | "14d" | "30d" | "60d" | "90d";
    ipWhitelist: string[];
    ipBlacklist: string[];
    maxFailedAttempts: number;
    lockoutMinutes: number;
    webhooks: {
        status: "ACTIVE" | "PAUSED" | "DISABLED";
        id: string;
        createdAt: string;
        event: string;
        url: string;
        secret: string;
        updatedAt?: string | undefined;
        lastTriggeredAt?: string | null | undefined;
    }[];
}, {
    twoFactorEnabled?: boolean | undefined;
    minPasswordLength?: number | undefined;
    requireUppercase?: boolean | undefined;
    requireNumber?: boolean | undefined;
    requireSpecial?: boolean | undefined;
    sessionTimeout?: "15m" | "30m" | "1h" | "2h" | "4h" | "8h" | undefined;
    rememberDuration?: "7d" | "14d" | "30d" | "60d" | "90d" | undefined;
    ipWhitelist?: string[] | undefined;
    ipBlacklist?: string[] | undefined;
    maxFailedAttempts?: number | undefined;
    lockoutMinutes?: number | undefined;
    webhooks?: {
        status: "ACTIVE" | "PAUSED" | "DISABLED";
        id: string;
        createdAt: string;
        event: string;
        url: string;
        secret: string;
        updatedAt?: string | undefined;
        lastTriggeredAt?: string | null | undefined;
    }[] | undefined;
}>;
type SecuritySettings = z.infer<typeof securitySettingsSchema>;
declare const brandingSettingsSchema: z.ZodObject<{
    colors: z.ZodObject<{
        primary: z.ZodDefault<z.ZodString>;
        secondary: z.ZodDefault<z.ZodString>;
        accent: z.ZodDefault<z.ZodString>;
        success: z.ZodDefault<z.ZodString>;
        warning: z.ZodDefault<z.ZodString>;
        error: z.ZodDefault<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        warning: string;
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        error: string;
    }, {
        warning?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        accent?: string | undefined;
        success?: string | undefined;
        error?: string | undefined;
    }>;
    logos: z.ZodObject<{
        logo: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string, string | undefined>>;
        darkLogo: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string, string | undefined>>;
        favicon: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string, string | undefined>>;
    }, "strict", z.ZodTypeAny, {
        logo: string;
        darkLogo: string;
        favicon: string;
    }, {
        logo?: string | undefined;
        darkLogo?: string | undefined;
        favicon?: string | undefined;
    }>;
    emailBranding: z.ZodObject<{
        headerHtml: z.ZodDefault<z.ZodString>;
        footerHtml: z.ZodDefault<z.ZodString>;
        fromName: z.ZodDefault<z.ZodString>;
        fromEmail: z.ZodDefault<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
        replyTo: z.ZodDefault<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
        signature: z.ZodDefault<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        headerHtml: string;
        footerHtml: string;
        fromName: string;
        fromEmail: string;
        replyTo: string;
        signature: string;
    }, {
        headerHtml?: string | undefined;
        footerHtml?: string | undefined;
        fromName?: string | undefined;
        fromEmail?: string | undefined;
        replyTo?: string | undefined;
        signature?: string | undefined;
    }>;
    documentBranding: z.ZodObject<{
        invoiceHeaderImageUrl: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string, string | undefined>>;
        purchaseAgreementHeaderImageUrl: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string, string | undefined>>;
        invoiceHeaderHtml: z.ZodDefault<z.ZodString>;
        invoiceFooterHtml: z.ZodDefault<z.ZodString>;
        purchaseAgreementHeaderHtml: z.ZodDefault<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        invoiceHeaderImageUrl: string;
        purchaseAgreementHeaderImageUrl: string;
        invoiceHeaderHtml: string;
        invoiceFooterHtml: string;
        purchaseAgreementHeaderHtml: string;
    }, {
        invoiceHeaderImageUrl?: string | undefined;
        purchaseAgreementHeaderImageUrl?: string | undefined;
        invoiceHeaderHtml?: string | undefined;
        invoiceFooterHtml?: string | undefined;
        purchaseAgreementHeaderHtml?: string | undefined;
    }>;
    portalTheme: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        fontFamily: z.ZodDefault<z.ZodString>;
        borderRadius: z.ZodDefault<z.ZodNumber>;
    }, "strict", z.ZodTypeAny, {
        enabled: boolean;
        fontFamily: string;
        borderRadius: number;
    }, {
        enabled?: boolean | undefined;
        fontFamily?: string | undefined;
        borderRadius?: number | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    colors: {
        warning: string;
        primary: string;
        secondary: string;
        accent: string;
        success: string;
        error: string;
    };
    logos: {
        logo: string;
        darkLogo: string;
        favicon: string;
    };
    emailBranding: {
        headerHtml: string;
        footerHtml: string;
        fromName: string;
        fromEmail: string;
        replyTo: string;
        signature: string;
    };
    documentBranding: {
        invoiceHeaderImageUrl: string;
        purchaseAgreementHeaderImageUrl: string;
        invoiceHeaderHtml: string;
        invoiceFooterHtml: string;
        purchaseAgreementHeaderHtml: string;
    };
    portalTheme: {
        enabled: boolean;
        fontFamily: string;
        borderRadius: number;
    };
}, {
    colors: {
        warning?: string | undefined;
        primary?: string | undefined;
        secondary?: string | undefined;
        accent?: string | undefined;
        success?: string | undefined;
        error?: string | undefined;
    };
    logos: {
        logo?: string | undefined;
        darkLogo?: string | undefined;
        favicon?: string | undefined;
    };
    emailBranding: {
        headerHtml?: string | undefined;
        footerHtml?: string | undefined;
        fromName?: string | undefined;
        fromEmail?: string | undefined;
        replyTo?: string | undefined;
        signature?: string | undefined;
    };
    documentBranding: {
        invoiceHeaderImageUrl?: string | undefined;
        purchaseAgreementHeaderImageUrl?: string | undefined;
        invoiceHeaderHtml?: string | undefined;
        invoiceFooterHtml?: string | undefined;
        purchaseAgreementHeaderHtml?: string | undefined;
    };
    portalTheme: {
        enabled?: boolean | undefined;
        fontFamily?: string | undefined;
        borderRadius?: number | undefined;
    };
}>;
type BrandingSettings = z.infer<typeof brandingSettingsSchema>;
declare const defaultBrandingSettings: BrandingSettings;
/**
 * =========================
 * Dealership settings schemas
 * =========================
 */
declare const businessDays: readonly ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
type BusinessDay = (typeof businessDays)[number];
declare const DAY_LABELS: Record<BusinessDay, string>;
declare const businessHourSchema: z.ZodObject<{
    day: z.ZodEnum<["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]>;
    openTime: z.ZodDefault<z.ZodString>;
    closeTime: z.ZodDefault<z.ZodString>;
    closed: z.ZodDefault<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
    openTime: string;
    closeTime: string;
    closed: boolean;
}, {
    day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
    openTime?: string | undefined;
    closeTime?: string | undefined;
    closed?: boolean | undefined;
}>;
type BusinessHour = z.infer<typeof businessHourSchema>;
declare const dealershipSettingsSchema: z.ZodObject<{
    businessName: z.ZodString;
    dealerLicenseNumber: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    email: z.ZodString;
    phone: z.ZodString;
    websiteUrl: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string, string | undefined>>;
    taxId: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    docFee: z.ZodDefault<z.ZodNumber>;
    registrationFee: z.ZodDefault<z.ZodNumber>;
    stateSalesTaxRate: z.ZodDefault<z.ZodNumber>;
    address: z.ZodObject<{
        street: z.ZodDefault<z.ZodString>;
        city: z.ZodDefault<z.ZodString>;
        state: z.ZodDefault<z.ZodString>;
        zip: z.ZodDefault<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        street: string;
        city: string;
        state: string;
        zip: string;
    }, {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
    }>;
    businessHours: z.ZodDefault<z.ZodArray<z.ZodObject<{
        day: z.ZodEnum<["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]>;
        openTime: z.ZodDefault<z.ZodString>;
        closeTime: z.ZodDefault<z.ZodString>;
        closed: z.ZodDefault<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
        openTime: string;
        closeTime: string;
        closed: boolean;
    }, {
        day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
        openTime?: string | undefined;
        closeTime?: string | undefined;
        closed?: boolean | undefined;
    }>, "many">>;
    logoUrl: z.ZodDefault<z.ZodEffects<z.ZodUnion<[z.ZodOptional<z.ZodString>, z.ZodLiteral<"">]>, string, string | undefined>>;
}, "strict", z.ZodTypeAny, {
    email: string;
    phone: string;
    businessName: string;
    dealerLicenseNumber: string;
    websiteUrl: string;
    taxId: string;
    docFee: number;
    registrationFee: number;
    stateSalesTaxRate: number;
    address: {
        street: string;
        city: string;
        state: string;
        zip: string;
    };
    businessHours: {
        day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
        openTime: string;
        closeTime: string;
        closed: boolean;
    }[];
    logoUrl: string;
}, {
    email: string;
    phone: string;
    businessName: string;
    address: {
        street?: string | undefined;
        city?: string | undefined;
        state?: string | undefined;
        zip?: string | undefined;
    };
    dealerLicenseNumber?: string | undefined;
    websiteUrl?: string | undefined;
    taxId?: string | undefined;
    docFee?: number | undefined;
    registrationFee?: number | undefined;
    stateSalesTaxRate?: number | undefined;
    businessHours?: {
        day: "MONDAY" | "TUESDAY" | "WEDNESDAY" | "THURSDAY" | "FRIDAY" | "SATURDAY" | "SUNDAY";
        openTime?: string | undefined;
        closeTime?: string | undefined;
        closed?: boolean | undefined;
    }[] | undefined;
    logoUrl?: string | undefined;
}>;
type DealershipSettings = z.infer<typeof dealershipSettingsSchema>;
declare const defaultDealershipSettings: DealershipSettings;
/**
 * =========================
 * Data governance schemas
 * =========================
 */
declare const backupScheduleOptions: readonly ["DAILY_2AM", "EVERY_12H", "WEEKLY", "MONTHLY"];
type BackupSchedule = (typeof backupScheduleOptions)[number];
declare const backupRetentionOptions: readonly ["7", "14", "30", "60", "90"];
type BackupRetentionWindow = (typeof backupRetentionOptions)[number];
declare const dataExportEntities: readonly ["CUSTOMERS", "VEHICLES", "DEALS", "INVENTORY", "JOURNAL_ENTRIES", "LEADS", "SERVICE_APPOINTMENTS", "ANALYTICS_EVENTS"];
type DataExportEntity = (typeof dataExportEntities)[number];
declare const dataExportFormats: readonly ["CSV", "JSON", "EXCEL"];
type DataExportFormat = (typeof dataExportFormats)[number];
declare const customerRetentionOptions: readonly ["1Y", "2Y", "5Y", "7Y", "INDEFINITE"];
type CustomerRetentionWindow = (typeof customerRetentionOptions)[number];
declare const leadRetentionOptions: readonly ["6M", "1Y", "2Y"];
type LeadRetentionWindow = (typeof leadRetentionOptions)[number];
declare const analyticsRetentionOptions: readonly ["90D", "180D", "1Y", "2Y"];
type AnalyticsRetentionWindow = (typeof analyticsRetentionOptions)[number];
declare const dataSettingsSchema: z.ZodObject<{
    backup: z.ZodObject<{
        autoBackupEnabled: z.ZodDefault<z.ZodBoolean>;
        schedule: z.ZodDefault<z.ZodEnum<["DAILY_2AM", "EVERY_12H", "WEEKLY", "MONTHLY"]>>;
        retentionDays: z.ZodDefault<z.ZodEnum<["7", "14", "30", "60", "90"]>>;
        storage: z.ZodObject<{
            bucket: z.ZodDefault<z.ZodString>;
            region: z.ZodDefault<z.ZodString>;
            accessKey: z.ZodDefault<z.ZodString>;
            secretKey: z.ZodDefault<z.ZodString>;
        }, "strict", z.ZodTypeAny, {
            bucket: string;
            region: string;
            accessKey: string;
            secretKey: string;
        }, {
            bucket?: string | undefined;
            region?: string | undefined;
            accessKey?: string | undefined;
            secretKey?: string | undefined;
        }>;
    }, "strict", z.ZodTypeAny, {
        schedule: "DAILY_2AM" | "EVERY_12H" | "WEEKLY" | "MONTHLY";
        autoBackupEnabled: boolean;
        retentionDays: "7" | "14" | "30" | "60" | "90";
        storage: {
            bucket: string;
            region: string;
            accessKey: string;
            secretKey: string;
        };
    }, {
        storage: {
            bucket?: string | undefined;
            region?: string | undefined;
            accessKey?: string | undefined;
            secretKey?: string | undefined;
        };
        schedule?: "DAILY_2AM" | "EVERY_12H" | "WEEKLY" | "MONTHLY" | undefined;
        autoBackupEnabled?: boolean | undefined;
        retentionDays?: "7" | "14" | "30" | "60" | "90" | undefined;
    }>;
    retention: z.ZodObject<{
        customer: z.ZodDefault<z.ZodEnum<["1Y", "2Y", "5Y", "7Y", "INDEFINITE"]>>;
        lead: z.ZodDefault<z.ZodEnum<["6M", "1Y", "2Y"]>>;
        analytics: z.ZodDefault<z.ZodEnum<["90D", "180D", "1Y", "2Y"]>>;
        autoPurgeEnabled: z.ZodDefault<z.ZodBoolean>;
    }, "strict", z.ZodTypeAny, {
        customer: "1Y" | "2Y" | "5Y" | "7Y" | "INDEFINITE";
        analytics: "1Y" | "2Y" | "90D" | "180D";
        lead: "1Y" | "2Y" | "6M";
        autoPurgeEnabled: boolean;
    }, {
        customer?: "1Y" | "2Y" | "5Y" | "7Y" | "INDEFINITE" | undefined;
        analytics?: "1Y" | "2Y" | "90D" | "180D" | undefined;
        lead?: "1Y" | "2Y" | "6M" | undefined;
        autoPurgeEnabled?: boolean | undefined;
    }>;
}, "strict", z.ZodTypeAny, {
    backup: {
        schedule: "DAILY_2AM" | "EVERY_12H" | "WEEKLY" | "MONTHLY";
        autoBackupEnabled: boolean;
        retentionDays: "7" | "14" | "30" | "60" | "90";
        storage: {
            bucket: string;
            region: string;
            accessKey: string;
            secretKey: string;
        };
    };
    retention: {
        customer: "1Y" | "2Y" | "5Y" | "7Y" | "INDEFINITE";
        analytics: "1Y" | "2Y" | "90D" | "180D";
        lead: "1Y" | "2Y" | "6M";
        autoPurgeEnabled: boolean;
    };
}, {
    backup: {
        storage: {
            bucket?: string | undefined;
            region?: string | undefined;
            accessKey?: string | undefined;
            secretKey?: string | undefined;
        };
        schedule?: "DAILY_2AM" | "EVERY_12H" | "WEEKLY" | "MONTHLY" | undefined;
        autoBackupEnabled?: boolean | undefined;
        retentionDays?: "7" | "14" | "30" | "60" | "90" | undefined;
    };
    retention: {
        customer?: "1Y" | "2Y" | "5Y" | "7Y" | "INDEFINITE" | undefined;
        analytics?: "1Y" | "2Y" | "90D" | "180D" | undefined;
        lead?: "1Y" | "2Y" | "6M" | undefined;
        autoPurgeEnabled?: boolean | undefined;
    };
}>;
type DataSettings = z.infer<typeof dataSettingsSchema>;
declare const defaultDataSettings: DataSettings;
/**
 * =========================
 * Analytics settings schemas
 * =========================
 */
declare const analyticsDashboardRanges: readonly ["LAST_7", "LAST_30", "LAST_90", "YTD"];
type AnalyticsDashboardRange = (typeof analyticsDashboardRanges)[number];
declare const analyticsRefreshIntervals: readonly ["MANUAL", "5M", "15M", "1H"];
type AnalyticsRefreshInterval = (typeof analyticsRefreshIntervals)[number];
declare const analyticsWidgetOptions: readonly ["REVENUE", "LEAD_SOURCES", "CONVERSION_FUNNEL", "SALES_PERFORMANCE", "INVENTORY_METRICS", "TOP_SALESPEOPLE"];
type AnalyticsWidget = (typeof analyticsWidgetOptions)[number];
declare const conversionGoalTriggerOptions: readonly ["PAGE_VIEW", "EVENT", "CUSTOM"];
type ConversionGoalTrigger = (typeof conversionGoalTriggerOptions)[number];
declare const conversionGoalStatusOptions: readonly ["ACTIVE", "INACTIVE"];
type ConversionGoalStatus = (typeof conversionGoalStatusOptions)[number];
declare const customEventParameterTypes: readonly ["string", "number", "boolean", "date", "currency"];
type CustomEventParameterType = (typeof customEventParameterTypes)[number];
declare const reportFrequencyOptions: readonly ["DAILY", "WEEKLY", "MONTHLY"];
type ReportFrequency = (typeof reportFrequencyOptions)[number];
declare const reportFormatOptions: readonly ["PDF", "EXCEL", "CSV"];
type ReportFormat = (typeof reportFormatOptions)[number];
declare const analyticsEventMetricSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE", "PAUSED"]>>;
    countLast30Days: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE" | "PAUSED";
    id: string;
    name: string;
    countLast30Days: number;
}, {
    id: string;
    name: string;
    status?: "ACTIVE" | "INACTIVE" | "PAUSED" | undefined;
    countLast30Days?: number | undefined;
}>;
type AnalyticsEventMetric = z.infer<typeof analyticsEventMetricSchema>;
declare const customEventParameterSchema: z.ZodObject<{
    name: z.ZodString;
    type: z.ZodEnum<["string", "number", "boolean", "date", "currency"]>;
    required: z.ZodDefault<z.ZodBoolean>;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}, "strict", z.ZodTypeAny, {
    type: "string" | "number" | "boolean" | "date" | "currency";
    name: string;
    required: boolean;
    description?: string | null | undefined;
}, {
    type: "string" | "number" | "boolean" | "date" | "currency";
    name: string;
    description?: string | null | undefined;
    required?: boolean | undefined;
}>;
type CustomEventParameter = z.infer<typeof customEventParameterSchema>;
declare const customEventInputSchema: z.ZodObject<{
    name: z.ZodString;
    description: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    parameters: z.ZodDefault<z.ZodArray<z.ZodObject<Omit<{
        name: z.ZodString;
        type: z.ZodEnum<["string", "number", "boolean", "date", "currency"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "description">, "strict", z.ZodTypeAny, {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        required: boolean;
    }, {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        required?: boolean | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    description: string;
    name: string;
    parameters: {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        required: boolean;
    }[];
}, {
    name: string;
    description?: string | undefined;
    parameters?: {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        required?: boolean | undefined;
    }[] | undefined;
}>;
type CustomEventInput = z.infer<typeof customEventInputSchema>;
declare const customEventSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    parameters: z.ZodDefault<z.ZodArray<z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<["string", "number", "boolean", "date", "currency"]>;
        required: z.ZodDefault<z.ZodBoolean>;
        description: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, "strict", z.ZodTypeAny, {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        required: boolean;
        description?: string | null | undefined;
    }, {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        description?: string | null | undefined;
        required?: boolean | undefined;
    }>, "many">>;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    id: string;
    name: string;
    parameters: {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        required: boolean;
        description?: string | null | undefined;
    }[];
    description?: string | null | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
}, {
    id: string;
    name: string;
    description?: string | null | undefined;
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    parameters?: {
        type: "string" | "number" | "boolean" | "date" | "currency";
        name: string;
        description?: string | null | undefined;
        required?: boolean | undefined;
    }[] | undefined;
}>;
type CustomEventDefinition = z.infer<typeof customEventSchema>;
declare const scheduledReportInputSchema: z.ZodObject<z.objectUtil.extendShape<{
    name: z.ZodString;
    reportType: z.ZodString;
    frequency: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY"]>;
    dayOfWeek: z.ZodOptional<z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>>;
    dayOfMonth: z.ZodOptional<z.ZodNumber>;
    timeOfDay: z.ZodDefault<z.ZodString>;
    recipients: z.ZodArray<z.ZodString, "many">;
    format: z.ZodDefault<z.ZodEnum<["PDF", "EXCEL", "CSV"]>>;
}, {
    recipients: z.ZodArray<z.ZodString, "many">;
}>, "strict", z.ZodTypeAny, {
    name: string;
    reportType: string;
    frequency: "WEEKLY" | "MONTHLY" | "DAILY";
    timeOfDay: string;
    recipients: string[];
    format: "CSV" | "EXCEL" | "PDF";
    dayOfWeek?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | undefined;
    dayOfMonth?: number | undefined;
}, {
    name: string;
    reportType: string;
    frequency: "WEEKLY" | "MONTHLY" | "DAILY";
    recipients: string[];
    dayOfWeek?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | undefined;
    dayOfMonth?: number | undefined;
    timeOfDay?: string | undefined;
    format?: "CSV" | "EXCEL" | "PDF" | undefined;
}>;
type ScheduledReportInput = z.infer<typeof scheduledReportInputSchema>;
declare const scheduledReportSchema: z.ZodObject<z.objectUtil.extendShape<{
    name: z.ZodString;
    reportType: z.ZodString;
    frequency: z.ZodEnum<["DAILY", "WEEKLY", "MONTHLY"]>;
    dayOfWeek: z.ZodOptional<z.ZodEnum<["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]>>;
    dayOfMonth: z.ZodOptional<z.ZodNumber>;
    timeOfDay: z.ZodDefault<z.ZodString>;
    recipients: z.ZodArray<z.ZodString, "many">;
    format: z.ZodDefault<z.ZodEnum<["PDF", "EXCEL", "CSV"]>>;
}, {
    id: z.ZodString;
    createdAt: z.ZodOptional<z.ZodString>;
    updatedAt: z.ZodOptional<z.ZodString>;
    lastRunAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    nextRunAt: z.ZodNullable<z.ZodOptional<z.ZodString>>;
}>, "strict", z.ZodTypeAny, {
    id: string;
    name: string;
    reportType: string;
    frequency: "WEEKLY" | "MONTHLY" | "DAILY";
    timeOfDay: string;
    recipients: string[];
    format: "CSV" | "EXCEL" | "PDF";
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    dayOfWeek?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | undefined;
    dayOfMonth?: number | undefined;
    lastRunAt?: string | null | undefined;
    nextRunAt?: string | null | undefined;
}, {
    id: string;
    name: string;
    reportType: string;
    frequency: "WEEKLY" | "MONTHLY" | "DAILY";
    recipients: string[];
    createdAt?: string | undefined;
    updatedAt?: string | undefined;
    dayOfWeek?: "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday" | "sunday" | undefined;
    dayOfMonth?: number | undefined;
    timeOfDay?: string | undefined;
    format?: "CSV" | "EXCEL" | "PDF" | undefined;
    lastRunAt?: string | null | undefined;
    nextRunAt?: string | null | undefined;
}>;
type ScheduledReportDefinition = z.infer<typeof scheduledReportSchema>;
declare const conversionGoalSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    triggerType: z.ZodEnum<["PAGE_VIEW", "EVENT", "CUSTOM"]>;
    triggerValue: z.ZodDefault<z.ZodString>;
    value: z.ZodDefault<z.ZodNumber>;
    status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE"]>>;
}, "strict", z.ZodTypeAny, {
    status: "ACTIVE" | "INACTIVE";
    value: number;
    id: string;
    name: string;
    triggerType: "PAGE_VIEW" | "EVENT" | "CUSTOM";
    triggerValue: string;
}, {
    id: string;
    name: string;
    triggerType: "PAGE_VIEW" | "EVENT" | "CUSTOM";
    status?: "ACTIVE" | "INACTIVE" | undefined;
    value?: number | undefined;
    triggerValue?: string | undefined;
}>;
type ConversionGoal = z.infer<typeof conversionGoalSchema>;
declare const analyticsSettingsSchema: z.ZodObject<{
    pixelTracking: z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        trackingDomain: z.ZodDefault<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        enabled: boolean;
        trackingDomain: string;
    }, {
        enabled?: boolean | undefined;
        trackingDomain?: string | undefined;
    }>;
    external: z.ZodObject<{
        googleAnalyticsId: z.ZodDefault<z.ZodString>;
        facebookPixelId: z.ZodDefault<z.ZodString>;
        tagManagerId: z.ZodDefault<z.ZodString>;
    }, "strict", z.ZodTypeAny, {
        googleAnalyticsId: string;
        facebookPixelId: string;
        tagManagerId: string;
    }, {
        googleAnalyticsId?: string | undefined;
        facebookPixelId?: string | undefined;
        tagManagerId?: string | undefined;
    }>;
    dashboard: z.ZodObject<{
        defaultDateRange: z.ZodDefault<z.ZodEnum<["LAST_7", "LAST_30", "LAST_90", "YTD"]>>;
        refreshInterval: z.ZodDefault<z.ZodEnum<["MANUAL", "5M", "15M", "1H"]>>;
        widgets: z.ZodDefault<z.ZodArray<z.ZodEnum<["REVENUE", "LEAD_SOURCES", "CONVERSION_FUNNEL", "SALES_PERFORMANCE", "INVENTORY_METRICS", "TOP_SALESPEOPLE"]>, "many">>;
    }, "strict", z.ZodTypeAny, {
        defaultDateRange: "LAST_7" | "LAST_30" | "LAST_90" | "YTD";
        refreshInterval: "MANUAL" | "5M" | "15M" | "1H";
        widgets: ("REVENUE" | "LEAD_SOURCES" | "CONVERSION_FUNNEL" | "SALES_PERFORMANCE" | "INVENTORY_METRICS" | "TOP_SALESPEOPLE")[];
    }, {
        defaultDateRange?: "LAST_7" | "LAST_30" | "LAST_90" | "YTD" | undefined;
        refreshInterval?: "MANUAL" | "5M" | "15M" | "1H" | undefined;
        widgets?: ("REVENUE" | "LEAD_SOURCES" | "CONVERSION_FUNNEL" | "SALES_PERFORMANCE" | "INVENTORY_METRICS" | "TOP_SALESPEOPLE")[] | undefined;
    }>;
    conversionGoals: z.ZodDefault<z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        triggerType: z.ZodEnum<["PAGE_VIEW", "EVENT", "CUSTOM"]>;
        triggerValue: z.ZodDefault<z.ZodString>;
        value: z.ZodDefault<z.ZodNumber>;
        status: z.ZodDefault<z.ZodEnum<["ACTIVE", "INACTIVE"]>>;
    }, "strict", z.ZodTypeAny, {
        status: "ACTIVE" | "INACTIVE";
        value: number;
        id: string;
        name: string;
        triggerType: "PAGE_VIEW" | "EVENT" | "CUSTOM";
        triggerValue: string;
    }, {
        id: string;
        name: string;
        triggerType: "PAGE_VIEW" | "EVENT" | "CUSTOM";
        status?: "ACTIVE" | "INACTIVE" | undefined;
        value?: number | undefined;
        triggerValue?: string | undefined;
    }>, "many">>;
}, "strict", z.ZodTypeAny, {
    pixelTracking: {
        enabled: boolean;
        trackingDomain: string;
    };
    external: {
        googleAnalyticsId: string;
        facebookPixelId: string;
        tagManagerId: string;
    };
    dashboard: {
        defaultDateRange: "LAST_7" | "LAST_30" | "LAST_90" | "YTD";
        refreshInterval: "MANUAL" | "5M" | "15M" | "1H";
        widgets: ("REVENUE" | "LEAD_SOURCES" | "CONVERSION_FUNNEL" | "SALES_PERFORMANCE" | "INVENTORY_METRICS" | "TOP_SALESPEOPLE")[];
    };
    conversionGoals: {
        status: "ACTIVE" | "INACTIVE";
        value: number;
        id: string;
        name: string;
        triggerType: "PAGE_VIEW" | "EVENT" | "CUSTOM";
        triggerValue: string;
    }[];
}, {
    pixelTracking: {
        enabled?: boolean | undefined;
        trackingDomain?: string | undefined;
    };
    external: {
        googleAnalyticsId?: string | undefined;
        facebookPixelId?: string | undefined;
        tagManagerId?: string | undefined;
    };
    dashboard: {
        defaultDateRange?: "LAST_7" | "LAST_30" | "LAST_90" | "YTD" | undefined;
        refreshInterval?: "MANUAL" | "5M" | "15M" | "1H" | undefined;
        widgets?: ("REVENUE" | "LEAD_SOURCES" | "CONVERSION_FUNNEL" | "SALES_PERFORMANCE" | "INVENTORY_METRICS" | "TOP_SALESPEOPLE")[] | undefined;
    };
    conversionGoals?: {
        id: string;
        name: string;
        triggerType: "PAGE_VIEW" | "EVENT" | "CUSTOM";
        status?: "ACTIVE" | "INACTIVE" | undefined;
        value?: number | undefined;
        triggerValue?: string | undefined;
    }[] | undefined;
}>;
type AnalyticsSettings = z.infer<typeof analyticsSettingsSchema>;
declare const defaultAnalyticsSettings: AnalyticsSettings;

export { type AnalyticsDashboardRange, type AnalyticsEventMetric, type AnalyticsRefreshInterval, type AnalyticsRetentionWindow, type AnalyticsSettings, type AnalyticsWidget, type ApiKeyRecord, type ApiKeyStatus, type ApiKeyWithSecret, type AuditLogEntry, type BackupRetentionWindow, type BackupSchedule, type BrandingSettings, type BusinessDay, type BusinessHour, type ConversionGoal, type ConversionGoalStatus, type ConversionGoalTrigger, type CreateSettingsUserInput, type CustomEventDefinition, type CustomEventInput, type CustomEventParameter, type CustomEventParameterType, type CustomerRetentionWindow, DAY_LABELS, type DataExportEntity, type DataExportFormat, type DataSettings, type DealershipSettings, type LeadRetentionWindow, type RememberDurationOption, type ReportFormat, type ReportFrequency, type ScheduledReportDefinition, type ScheduledReportInput, type SecuritySettings, type SessionTimeoutOption, type SettingsUser, type SettingsUserInput, type SettingsUserPermissionKey, type SettingsUserRole, type SettingsUserStatus, type UpdateSettingsUserInput, type WebhookConfig, type WebhookInput, type WebhookStatus, analyticsDashboardRanges, analyticsEventMetricSchema, analyticsRefreshIntervals, analyticsRetentionOptions, analyticsSettingsSchema, analyticsWidgetOptions, apiKeySchema, apiKeyStatusOptions, apiKeyWithSecretSchema, auditLogSchema, backupRetentionOptions, backupScheduleOptions, brandingSettingsSchema, businessDays, conversionGoalStatusOptions, conversionGoalTriggerOptions, createSettingsUserSchema, customEventInputSchema, customEventParameterTypes, customEventSchema, customerRetentionOptions, dataExportEntities, dataExportFormats, dataSettingsSchema, dealershipSettingsSchema, defaultAnalyticsSettings, defaultBrandingSettings, defaultDataSettings, defaultDealershipSettings, leadRetentionOptions, paginatedAuditLogSchema, paginatedSettingsUsersSchema, rememberDurationOptions, reportFormatOptions, reportFrequencyOptions, scheduledReportInputSchema, scheduledReportSchema, securitySettingsSchema, sessionTimeoutOptions, settingsUserInputSchema, settingsUserPermissionKeys, settingsUserPermissionsSchema, settingsUserRoles, settingsUserSchema, settingsUserStatuses, updateSettingsUserSchema, webhookInputSchema, webhookSchema, webhookStatusOptions };
