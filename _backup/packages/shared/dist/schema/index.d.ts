import { z } from 'zod';

/**
 * Card Definition Schema
 *
 * Defines the structure for dashboard cards with role-based permissions,
 * data sources, and visual presentation rules.
 *
 * Bridge to DashboardWidget: Use `deriveFromWidget()` to convert legacy
 * WidgetConfig to CardDef format.
 */
/**
 * Card kinds define the visual pattern and data structure
 */
type CardKind = 'metric' | 'trend' | 'list' | 'table' | 'calendar' | 'kanban' | 'alert' | 'custom';
/**
 * Card context determines which entity ID is passed to data source
 */
type CardContext = 'deal' | 'customer' | 'vehicle' | 'store' | 'tenant' | 'none';
/**
 * Card size determines grid layout dimensions
 */
type CardSize = 'SMALL' | 'MEDIUM' | 'LARGE' | 'WIDE' | 'FULL';
/**
 * Card priority affects rendering order and visual emphasis
 */
type CardPriority = 'critical' | 'high' | 'normal' | 'low';
/**
 * Card Definition
 *
 * Complete specification for a dashboard card including permissions,
 * data source, visual presentation, and behavior.
 */
interface CardDef {
    /**
     * Unique identifier for the card (e.g., "active-deals", "hot-leads")
     */
    key: string;
    /**
     * Visual pattern and data structure
     */
    kind: CardKind;
    /**
     * Context entity required to render this card
     */
    context: CardContext;
    /**
     * Permissions required to view this card
     * Empty array = no permission check (public card)
     */
    requiredPermissions: string[];
    /**
     * Roles allowed to view this card (optional - prefer permissions)
     * If both roles and permissions are specified, user must have BOTH
     */
    roles?: string[];
    /**
     * Grid layout size
     */
    size: CardSize;
    /**
     * Path to lazy-loaded component
     * Example: "@/components/widgets/ActiveDealsWidget"
     */
    componentPath: string;
    /**
     * API endpoint or data source function
     * Example: "/api/deals?status=ACTIVE&limit=5"
     * Optional: if omitted, component handles its own data fetching
     */
    dataSource?: string;
    /**
     * Auto-refresh interval in milliseconds
     * Example: 30000 = refresh every 30 seconds
     * Optional: if omitted, no auto-refresh
     */
    refreshInterval?: number;
    /**
     * Feature flags required for this card to be visible
     * Example: ["ai-coach", "deal-optimizer"]
     * Optional: if omitted, no feature flag checks
     */
    featureFlags?: string[];
    /**
     * Display title for the card (optional - component can override)
     */
    title?: string;
    /**
     * Description for the card (optional - used in card library)
     */
    description?: string;
    /**
     * Priority level for rendering order and visual emphasis
     * Optional: defaults to "normal"
     */
    priority?: CardPriority;
    /**
     * Tags for filtering in card library
     * Example: ["sales", "deals", "crm"]
     */
    tags?: string[];
    /**
     * Custom configuration passed to component
     * Example: { limit: 10, sortBy: "createdAt" }
     */
    config?: Record<string, any>;
}
/**
 * Bridge function: Convert legacy WidgetConfig to CardDef
 *
 * Use this to gradually migrate existing widgets to the new card system
 * without breaking current dashboards.
 *
 * @param widgetConfig Legacy widget configuration
 * @returns CardDef compatible with new registry
 */
declare function deriveFromWidget(widgetConfig: {
    id: string;
    key: string;
    position?: {
        x: number;
        y: number;
    };
    size?: {
        w: number;
        h: number;
    };
    config?: any;
}): CardDef;
/**
 * Example Card Definitions
 */
declare const EXAMPLE_CARDS: CardDef[];

declare const vehicleStatusSchema: z.ZodEnum<["available", "pending", "sold", "maintenance", "in-transit", "reserved"]>;
declare const insertVehicleSchema: z.ZodObject<{
    make: z.ZodString;
    model: z.ZodString;
    year: z.ZodNumber;
    vin: z.ZodString;
    price: z.ZodNumber;
    status: z.ZodEnum<["available", "pending", "sold", "maintenance", "in-transit", "reserved"]>;
    trim: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    mileage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    engine: z.ZodOptional<z.ZodString>;
    transmission: z.ZodOptional<z.ZodString>;
    fuelType: z.ZodOptional<z.ZodString>;
    bodyStyle: z.ZodOptional<z.ZodString>;
    doors: z.ZodOptional<z.ZodNumber>;
    drivetrain: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    msrp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, "strict", z.ZodTypeAny, {
    status: "available" | "pending" | "sold" | "maintenance" | "in-transit" | "reserved";
    make: string;
    model: string;
    year: number;
    vin: string;
    price: number;
    trim?: string | undefined;
    description?: string | undefined;
    imageUrl?: string | undefined;
    mileage?: number | null | undefined;
    engine?: string | undefined;
    transmission?: string | undefined;
    fuelType?: string | undefined;
    bodyStyle?: string | undefined;
    doors?: number | undefined;
    drivetrain?: string | undefined;
    color?: string | undefined;
    location?: string | undefined;
    msrp?: number | null | undefined;
    cost?: number | null | undefined;
}, {
    status: "available" | "pending" | "sold" | "maintenance" | "in-transit" | "reserved";
    make: string;
    model: string;
    year: number;
    vin: string;
    price: number;
    trim?: string | undefined;
    description?: string | undefined;
    imageUrl?: string | undefined;
    mileage?: number | null | undefined;
    engine?: string | undefined;
    transmission?: string | undefined;
    fuelType?: string | undefined;
    bodyStyle?: string | undefined;
    doors?: number | undefined;
    drivetrain?: string | undefined;
    color?: string | undefined;
    location?: string | undefined;
    msrp?: number | null | undefined;
    cost?: number | null | undefined;
}>;
type InsertVehicle = z.infer<typeof insertVehicleSchema>;
declare const vehicleSchema: z.ZodObject<z.objectUtil.extendShape<{
    make: z.ZodString;
    model: z.ZodString;
    year: z.ZodNumber;
    vin: z.ZodString;
    price: z.ZodNumber;
    status: z.ZodEnum<["available", "pending", "sold", "maintenance", "in-transit", "reserved"]>;
    trim: z.ZodOptional<z.ZodString>;
    description: z.ZodOptional<z.ZodString>;
    imageUrl: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodLiteral<"">]>>;
    mileage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    engine: z.ZodOptional<z.ZodString>;
    transmission: z.ZodOptional<z.ZodString>;
    fuelType: z.ZodOptional<z.ZodString>;
    bodyStyle: z.ZodOptional<z.ZodString>;
    doors: z.ZodOptional<z.ZodNumber>;
    drivetrain: z.ZodOptional<z.ZodString>;
    color: z.ZodOptional<z.ZodString>;
    location: z.ZodOptional<z.ZodString>;
    msrp: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
}, {
    id: z.ZodUnion<[z.ZodString, z.ZodNumber]>;
    tenantId: z.ZodOptional<z.ZodString>;
    stockNumber: z.ZodOptional<z.ZodString>;
    stockNo: z.ZodOptional<z.ZodString>;
    salePrice: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    daysInStock: z.ZodOptional<z.ZodNumber>;
    createdAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    updatedAt: z.ZodOptional<z.ZodUnion<[z.ZodString, z.ZodDate]>>;
    mileage: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    cost: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    features: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    packages: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    aiInsights: z.ZodOptional<z.ZodObject<{
        demandScore: z.ZodOptional<z.ZodNumber>;
        daysToSell: z.ZodOptional<z.ZodNumber>;
        priceOptimal: z.ZodOptional<z.ZodBoolean>;
        recommendedActions: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        demandScore?: number | undefined;
        daysToSell?: number | undefined;
        priceOptimal?: boolean | undefined;
        recommendedActions?: string[] | undefined;
    }, {
        demandScore?: number | undefined;
        daysToSell?: number | undefined;
        priceOptimal?: boolean | undefined;
        recommendedActions?: string[] | undefined;
    }>>;
    listing: z.ZodOptional<z.ZodObject<{
        isListed: z.ZodOptional<z.ZodBoolean>;
        channels: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
    }, "strip", z.ZodTypeAny, {
        isListed?: boolean | undefined;
        channels?: string[] | undefined;
    }, {
        isListed?: boolean | undefined;
        channels?: string[] | undefined;
    }>>;
    metadata: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodUnknown>>;
    category: z.ZodOptional<z.ZodString>;
    segment: z.ZodOptional<z.ZodString>;
}>, "strict", z.ZodTypeAny, {
    status: "available" | "pending" | "sold" | "maintenance" | "in-transit" | "reserved";
    make: string;
    model: string;
    year: number;
    vin: string;
    price: number;
    id: string | number;
    trim?: string | undefined;
    description?: string | undefined;
    imageUrl?: string | undefined;
    mileage?: number | null | undefined;
    engine?: string | undefined;
    transmission?: string | undefined;
    fuelType?: string | undefined;
    bodyStyle?: string | undefined;
    doors?: number | undefined;
    drivetrain?: string | undefined;
    color?: string | undefined;
    location?: string | undefined;
    msrp?: number | null | undefined;
    cost?: number | null | undefined;
    tenantId?: string | undefined;
    stockNumber?: string | undefined;
    stockNo?: string | undefined;
    salePrice?: number | null | undefined;
    daysInStock?: number | undefined;
    createdAt?: string | Date | undefined;
    updatedAt?: string | Date | undefined;
    features?: string[] | undefined;
    packages?: string[] | undefined;
    tags?: string[] | undefined;
    aiInsights?: {
        demandScore?: number | undefined;
        daysToSell?: number | undefined;
        priceOptimal?: boolean | undefined;
        recommendedActions?: string[] | undefined;
    } | undefined;
    listing?: {
        isListed?: boolean | undefined;
        channels?: string[] | undefined;
    } | undefined;
    metadata?: Record<string, unknown> | undefined;
    category?: string | undefined;
    segment?: string | undefined;
}, {
    status: "available" | "pending" | "sold" | "maintenance" | "in-transit" | "reserved";
    make: string;
    model: string;
    year: number;
    vin: string;
    price: number;
    id: string | number;
    trim?: string | undefined;
    description?: string | undefined;
    imageUrl?: string | undefined;
    mileage?: number | null | undefined;
    engine?: string | undefined;
    transmission?: string | undefined;
    fuelType?: string | undefined;
    bodyStyle?: string | undefined;
    doors?: number | undefined;
    drivetrain?: string | undefined;
    color?: string | undefined;
    location?: string | undefined;
    msrp?: number | null | undefined;
    cost?: number | null | undefined;
    tenantId?: string | undefined;
    stockNumber?: string | undefined;
    stockNo?: string | undefined;
    salePrice?: number | null | undefined;
    daysInStock?: number | undefined;
    createdAt?: string | Date | undefined;
    updatedAt?: string | Date | undefined;
    features?: string[] | undefined;
    packages?: string[] | undefined;
    tags?: string[] | undefined;
    aiInsights?: {
        demandScore?: number | undefined;
        daysToSell?: number | undefined;
        priceOptimal?: boolean | undefined;
        recommendedActions?: string[] | undefined;
    } | undefined;
    listing?: {
        isListed?: boolean | undefined;
        channels?: string[] | undefined;
    } | undefined;
    metadata?: Record<string, unknown> | undefined;
    category?: string | undefined;
    segment?: string | undefined;
}>;
type Vehicle = z.infer<typeof vehicleSchema>;
interface Activity {
    id: string | number;
    type: string;
    description: string;
    createdAt: string | Date;
    userId?: string | number;
    icon?: string;
    metadata?: Record<string, unknown>;
}
interface CustomerTouchpoint {
    type: string;
    date: string;
    notes?: string | null;
    outcome?: string | null;
    channel?: string | null;
    owner?: string | null;
}
interface CustomerJourney {
    stage: string;
    probability?: number;
    touchpoints?: CustomerTouchpoint[];
    nextAction?: string | null;
    actionDueDate?: string | null;
}
interface CustomerDigitalProfile {
    websiteVisits?: number;
    emailEngagement?: number;
    smsEngagement?: number;
    preferredChannel?: string | null;
    socialReach?: number;
}
interface Customer {
    id: number;
    tenantId?: string;
    name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    phone?: string | null;
    cellPhone?: string | null;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    zipCode?: string | null;
    status?: string | null;
    leadSource?: string | null;
    leadScore?: number | null;
    salesConsultant?: string | null;
    dateOfBirth?: string | null;
    creditScore?: number | null;
    income?: number | null;
    notes?: string | null;
    tags?: string[];
    lifetimeValue?: number | null;
    lastContactDate?: string | null;
    nextFollowUpDate?: string | null;
    createdAt?: string;
    updatedAt?: string;
    customerJourney?: CustomerJourney;
    digitalProfile?: CustomerDigitalProfile;
    activities?: Activity[];
    vehicles?: Vehicle[];
    leads?: Lead[];
    sales?: Sale[];
    metadata?: Record<string, unknown>;
}
interface Lead {
    id: string | number;
    customerId?: number | null;
    customerName?: string | null;
    email?: string | null;
    phone?: string | null;
    status?: string | null;
    priority?: string | null;
    salesConsultant?: string | null;
    leadSource?: string | null;
    vehicleInterest?: string | null;
    estimatedValue?: number | null;
    followUpDate?: string | null;
    leadNumber?: string | null;
    notes?: string | null;
    score?: number | null;
    channel?: string | null;
    stage?: string | null;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}
interface Sale {
    id: string | number;
    dealId?: string | number | null;
    customerId?: number | null;
    vehicleId?: number | null;
    salePrice?: number | null;
    grossProfit?: number | null;
    financeStatus?: string | null;
    status?: string | null;
    soldAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}
interface Deal {
    id: string;
    tenantId?: string;
    customerId: string;
    vehicleId?: string | null;
    userId?: string;
    status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'FUNDED' | 'DELIVERED' | 'CANCELLED';
    totalAmount: number;
    downPayment?: number;
    tradeInValue?: number;
    financingAmount?: number;
    monthlyPayment?: number | null;
    term?: number | null;
    apr?: number | null;
    createdAt: Date;
    updatedAt: Date;
    closedAt?: Date | null;
}
interface CreditApplication {
    id: string | number;
    customerId?: number | null;
    dealId?: string | null;
    fullName: string;
    status?: string | null;
    submittedAt?: string | null;
    decisionAt?: string | null;
    currentIncome?: number | null;
    rentMortgage?: number | null;
    notes?: string | null;
    consentGiven?: boolean;
    applicantEmail?: string | null;
    applicantPhone?: string | null;
    coApplicants?: Array<{
        firstName?: string | null;
        lastName?: string | null;
        email?: string | null;
        phone?: string | null;
    }>;
    metadata?: Record<string, unknown>;
}
interface FiProductCostStructure {
    basePrice: number;
    markup: number;
    type: string;
}
interface FiProductRetailPricing {
    minPrice: number;
    maxPrice: number;
    recommended: number;
}
interface FiProductEligibilityCriteria {
    vehicleAge: number;
    mileage: number;
    minCreditScore: number;
}
interface FiProductTermOptions {
    months: number[];
    coverage: string;
}
interface FiProduct {
    id: number;
    name: string;
    category: string;
    provider: string;
    description: string;
    margin: string;
    isActive: boolean;
    costStructure: FiProductCostStructure;
    retailPricing: FiProductRetailPricing;
    eligibilityCriteria: FiProductEligibilityCriteria;
    termOptions: FiProductTermOptions;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}
interface InsertFiProduct {
    name: string;
    category: string;
    provider: string;
    description: string;
    margin: string;
    isActive: boolean;
    costStructure: FiProductCostStructure;
    retailPricing: FiProductRetailPricing;
    eligibilityCriteria: FiProductEligibilityCriteria;
    termOptions: FiProductTermOptions;
}
interface LenderApplication {
    id: number;
    lenderId: number;
    status: string;
    submittedAt: string;
    reviewedAt?: string | null;
    notes?: string | null;
    assignedTo?: string | null;
    documents?: string[];
    metadata?: Record<string, unknown>;
}
interface InsertLenderApplication {
    lenderId: number;
    status: string;
    notes?: string | null;
    assignedTo?: string | null;
}
interface Department {
    id: number;
    name: string;
    description?: string | null;
    managerId?: number | null;
    createdAt?: string;
    updatedAt?: string;
    metadata?: Record<string, unknown>;
}
interface Role {
    id: number;
    name: string;
    description?: string | null;
    departmentId?: number | null;
    permissions?: string[];
    hierarchy?: number | null;
    isSystem?: boolean;
    userCount?: number;
    createdAt?: string;
    updatedAt?: string;
}
interface Permission {
    id: string;
    name: string;
    description: string;
    category?: string;
    resource?: string;
    action?: string;
}
interface User {
    id: number;
    name: string;
    firstName?: string | null;
    lastName?: string | null;
    email: string;
    phone?: string | null;
    role: string;
    status: string;
    departmentId?: number | null;
    permissions?: string[];
    lastLoginAt?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
interface LeadDistributionRule {
    id: number;
    ruleName: string;
    source: string;
    leadType: string;
    priority: string;
    vehicleType: string;
    assignmentMethod: string;
    assignToRole?: string | null;
    assignToUser?: string | null;
    territory?: string | null;
    maxLeadsPerUser: number;
    businessHoursOnly: boolean;
    weekendsIncluded: boolean;
    isActive: boolean;
    createdAt?: string;
    updatedAt?: string;
    conditions?: Record<string, unknown>;
}
interface InsertLeadDistributionRule {
    ruleName: string;
    source: string;
    leadType: string;
    priority: string;
    vehicleType: string;
    assignmentMethod: string;
    assignToRole?: string | null;
    assignToUser?: string | null;
    territory?: string | null;
    maxLeadsPerUser: number;
    businessHoursOnly: boolean;
    weekendsIncluded: boolean;
    isActive?: boolean;
}
interface SystemRole {
    id: number;
    name: string;
    displayName: string;
    description?: string | null;
    permissions: string[];
    hierarchy: number;
    isSystem: boolean;
    userCount?: number;
    createdAt?: string;
    updatedAt?: string;
}
interface InsertSystemRole {
    name: string;
    displayName: string;
    description?: string | null;
    permissions: string[];
    hierarchy: number;
    isSystem?: boolean;
}
interface CompetitivePricing {
    id: string | number;
    vehicleId?: number | null;
    make: string;
    model: string;
    trim?: string | null;
    year: number;
    price: string;
    mileage?: number | null;
    source: string;
    location?: string | null;
    sourceUrl?: string | null;
    listedAt?: string | null;
    marketScore?: number | null;
    metadata?: Record<string, unknown>;
}
interface PricingInsights {
    id: string | number;
    vehicleId?: number | null;
    make: string;
    model: string;
    year: number;
    currentPrice: string;
    suggestedPrice: string;
    marketAverage: string;
    priceRange?: {
        min: number;
        max: number;
    };
    confidence: number | string;
    recommendedAction: string;
    position?: "below" | "average" | "above" | string;
    factors?: Record<string, number>;
    metadata?: Record<string, unknown>;
}
interface MerchandisingStrategies {
    id: string | number;
    strategy: string;
    description: string;
    priority: number | string;
    estimatedImpact: string;
    implementationCost?: string | null;
    expectedROI: number | string;
    channelRecommendations?: string[];
    actions?: string[];
    metadata?: Record<string, unknown>;
}
interface MarketTrends {
    id: string | number;
    category: string;
    direction: "up" | "down" | "stable" | string;
    description: string;
    strength: number | string;
    dataPoints: number;
    timeframe?: string | null;
    region?: string | null;
    metadata?: Record<string, unknown>;
}
interface ServiceOrder {
    id: number;
    workOrderNumber: string;
    customerId: number;
    vehicleId: number | null;
    serviceAdvisorId: number | null;
    technicianId: number | null;
    status: string;
    serviceType: string;
    description?: string | null;
    laborRate?: number | null;
    scheduledDate?: string | null;
    completedDate?: string | null;
    totalAmount?: string | number | null;
    notes?: string | null;
    createdAt?: string;
    updatedAt?: string;
}
type CreditApplicationStatus = CreditApplication["status"];

export { type Activity, type CardContext, type CardDef, type CardKind, type CardPriority, type CardSize, type CompetitivePricing, type CreditApplication, type CreditApplicationStatus, type Customer, type CustomerDigitalProfile, type CustomerJourney, type CustomerTouchpoint, type Deal, type Department, EXAMPLE_CARDS, type FiProduct, type FiProductCostStructure, type FiProductEligibilityCriteria, type FiProductRetailPricing, type FiProductTermOptions, type InsertFiProduct, type InsertLeadDistributionRule, type InsertLenderApplication, type InsertSystemRole, type InsertVehicle, type Lead, type LeadDistributionRule, type LenderApplication, type MarketTrends, type MerchandisingStrategies, type Permission, type PricingInsights, type Role, type Sale, type ServiceOrder, type SystemRole, type User, type Vehicle, deriveFromWidget, insertVehicleSchema, vehicleSchema, vehicleStatusSchema };
