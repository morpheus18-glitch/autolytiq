import { z } from "zod";

const VIN_REGEX = /^[A-HJ-NPR-Z0-9]{11,17}$/i;

export const vehicleStatusSchema = z.enum([
  "available",
  "pending",
  "sold",
  "maintenance",
  "in-transit",
  "reserved",
]);

const optionalUrl = z.union([z.string().url("Provide a valid URL"), z.literal("")]).optional();
const optionalNullableNumber = z.number().nonnegative().nullable().optional();

export const insertVehicleSchema = z
  .object({
    make: z.string().min(1, "Make is required"),
    model: z.string().min(1, "Model is required"),
    year: z
      .number({ invalid_type_error: "Year is required" })
      .int()
      .min(1900, "Enter a valid model year")
      .max(new Date().getFullYear() + 2, "Model year is too far in the future"),
    vin: z
      .string()
      .min(11, "VIN must be at least 11 characters")
      .max(17, "VIN must be 17 characters or fewer")
      .regex(VIN_REGEX, "VIN must contain only letters and numbers"),
    price: z.number({ invalid_type_error: "Price is required" }).nonnegative("Price must be positive"),
    status: vehicleStatusSchema,
    trim: z.string().optional(),
    description: z.string().max(4000).optional(),
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
    cost: optionalNullableNumber,
  })
  .strict();

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;

export const vehicleSchema = insertVehicleSchema
  .extend({
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
    aiInsights: z
      .object({
        demandScore: z.number().int().min(0).max(100).optional(),
        daysToSell: z.number().int().nonnegative().optional(),
        priceOptimal: z.boolean().optional(),
        recommendedActions: z.array(z.string()).optional(),
      })
      .optional(),
    listing: z
      .object({
        isListed: z.boolean().optional(),
        channels: z.array(z.string()).optional(),
      })
      .optional(),
    metadata: z.record(z.unknown()).optional(),
    category: z.string().optional(),
    segment: z.string().optional(),
  })
  .strict();

export type Vehicle = z.infer<typeof vehicleSchema>;

export interface Activity {
  id: string | number;
  type: string;
  description: string;
  createdAt: string | Date;
  userId?: string | number;
  icon?: string;
  metadata?: Record<string, unknown>;
}

export interface CustomerTouchpoint {
  type: string;
  date: string;
  notes?: string | null;
  outcome?: string | null;
  channel?: string | null;
  owner?: string | null;
}

export interface CustomerJourney {
  stage: string;
  probability?: number;
  touchpoints?: CustomerTouchpoint[];
  nextAction?: string | null;
  actionDueDate?: string | null;
}

export interface CustomerDigitalProfile {
  websiteVisits?: number;
  emailEngagement?: number;
  smsEngagement?: number;
  preferredChannel?: string | null;
  socialReach?: number;
}

export interface Customer {
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

export interface Lead {
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

export interface Sale {
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

export interface Deal {
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

export interface CreditApplication {
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

export interface FiProductCostStructure {
  basePrice: number;
  markup: number;
  type: string;
}

export interface FiProductRetailPricing {
  minPrice: number;
  maxPrice: number;
  recommended: number;
}

export interface FiProductEligibilityCriteria {
  vehicleAge: number;
  mileage: number;
  minCreditScore: number;
}

export interface FiProductTermOptions {
  months: number[];
  coverage: string;
}

export interface FiProduct {
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

export interface InsertFiProduct {
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

export interface LenderApplication {
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

export interface InsertLenderApplication {
  lenderId: number;
  status: string;
  notes?: string | null;
  assignedTo?: string | null;
}

export interface Department {
  id: number;
  name: string;
  description?: string | null;
  managerId?: number | null;
  createdAt?: string;
  updatedAt?: string;
  metadata?: Record<string, unknown>;
}

export interface Role {
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

export interface Permission {
  id: string;
  name: string;
  description: string;
  category?: string;
  resource?: string;
  action?: string;
}

export interface User {
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

export interface LeadDistributionRule {
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

export interface InsertLeadDistributionRule {
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

export interface SystemRole {
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

export interface InsertSystemRole {
  name: string;
  displayName: string;
  description?: string | null;
  permissions: string[];
  hierarchy: number;
  isSystem?: boolean;
}

export interface CompetitivePricing {
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

export interface PricingInsights {
  id: string | number;
  vehicleId?: number | null;
  make: string;
  model: string;
  year: number;
  currentPrice: string;
  suggestedPrice: string;
  marketAverage: string;
  priceRange?: { min: number; max: number };
  confidence: number | string;
  recommendedAction: string;
  position?: "below" | "average" | "above" | string;
  factors?: Record<string, number>;
  metadata?: Record<string, unknown>;
}

export interface MerchandisingStrategies {
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

export interface MarketTrends {
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

export interface ServiceOrder {
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

export type CreditApplicationStatus = CreditApplication["status"];
