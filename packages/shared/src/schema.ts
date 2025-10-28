// Shared schema types based on Prisma models
// This provides a centralized type definition for the frontend

export enum PreferredContactMethod {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  SMS = 'SMS',
  ANY = 'ANY',
}

export enum LeadSource {
  WEBSITE = 'WEBSITE',
  PHONE = 'PHONE',
  EMAIL = 'EMAIL',
  WALK_IN = 'WALK_IN',
  REFERRAL = 'REFERRAL',
  SOCIAL_MEDIA = 'SOCIAL_MEDIA',
  ADVERTISING = 'ADVERTISING',
  OTHER = 'OTHER',
}

export enum LeadStatus {
  NEW = 'NEW',
  CONTACTED = 'CONTACTED',
  QUALIFIED = 'QUALIFIED',
  NEGOTIATING = 'NEGOTIATING',
  WON = 'WON',
  LOST = 'LOST',
}

// Base Customer type matching Prisma schema
export interface Customer {
  id: string;
  tenantId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  mobile: string | null;
  cellPhone: string | null; // Alias for mobile
  dateOfBirth: Date | null;
  driversLicenseNumber: string | null;
  driversLicenseState: string | null;
  ssn: string | null;
  addressStreet: string | null;
  addressCity: string | null;
  addressState: string | null;
  addressZip: string | null;
  addressCountry: string | null;
  // Aliases for backwards compatibility
  address: string | null; // Alias for addressStreet
  city: string | null; // Alias for addressCity
  state: string | null; // Alias for addressState
  zipCode: string | null; // Alias for addressZip
  preferredContactMethod: PreferredContactMethod;
  leadSource: LeadSource;
  leadStatus: LeadStatus;
  leadScore: number;
  creditScore: number | null;
  income: number | null;
  assignedToUserId: string | null;
  salesConsultant: string | null; // Alias for assignedToUserId
  status: string | null; // Additional status field
  tags: string[];
  notes: string | null;
  lifetimeValue: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
  searchVector: string | null;
  // Relations - optional for frontend
  digitalProfile?: CustomerDigitalProfile;
  customerJourney?: CustomerJourney;
}

// Digital profile tracking for customers
export interface CustomerDigitalProfile {
  id: string;
  customerId: string;
  websiteVisits: number;
  lastWebsiteVisit: Date | null;
  emailEngagement: number;
  smsEngagement: number;
  communicationStyle: string | null;
  preferredContactTime: string | null;
  socialMediaProfiles: Record<string, any>;
  behaviorTags: string[];
  interestCategories: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Customer journey tracking
export interface CustomerJourney {
  id: string;
  customerId: string;
  stage: 'prospect' | 'lead' | 'qualified' | 'negotiating' | 'sold' | 'lost';
  probability: number;
  nextAction: string | null;
  actionDueDate: Date | null;
  touchpoints: CustomerTouchpoint[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerTouchpoint {
  id: string;
  type: string;
  date: string;
  notes: string;
  outcome: string;
}

// Pricing insights type
export interface PricingInsights {
  id: string;
  vehicleId: string;
  make: string;
  model: string;
  year: number;
  currentPrice: string;
  suggestedPrice: string;
  marketPrice: number;
  competitorPrices: number[];
  recommendedPrice: number;
  pricePosition: 'low' | 'average' | 'high' | 'below' | 'above' | null;
  demandScore: number;
  confidence: number;
  updatedAt: Date;
}

// Competitive pricing type
export interface CompetitivePricing {
  id: string;
  source: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  location: string;
  url: string;
  scrapedAt: Date;
}

// Market trends type
export interface MarketTrends {
  id: string;
  category: string;
  direction: 'up' | 'down';
  strength: string;
  description: string;
  dataPoints: number;
  updatedAt: Date;
}

// Vehicle types
export interface Vehicle {
  id: string;
  tenantId: string;
  vin: string;
  stockNumber: string;
  year: number;
  make: string;
  model: string;
  trim: string | null;
  bodyStyle: string | null;
  exteriorColor: string | null;
  interiorColor: string | null;
  mileage: number;
  price: number;
  cost: number | null;
  status: VehicleStatus;
  condition: VehicleCondition;
  location: string | null;
  description: string | null;
  features: string[];
  images: string[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  SOLD = 'SOLD',
  PENDING = 'PENDING',
  RESERVED = 'RESERVED',
  IN_TRANSIT = 'IN_TRANSIT',
}

export enum VehicleCondition {
  NEW = 'NEW',
  USED = 'USED',
  CERTIFIED = 'CERTIFIED',
}

// User types
export interface User {
  id: string;
  tenantId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  departmentId: string | null;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  SALES = 'SALES',
  FINANCE = 'FINANCE',
  SERVICE = 'SERVICE',
  USER = 'USER',
}

// Activity types
export interface Activity {
  id: string;
  tenantId: string;
  type: ActivityType;
  entityType: string;
  entityId: string;
  userId: string;
  customerId: string | null;
  dealId: string | null;
  description: string;
  metadata: Record<string, any>;
  createdAt: Date;
}

export enum ActivityType {
  CALL = 'CALL',
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  MEETING = 'MEETING',
  NOTE = 'NOTE',
  TASK = 'TASK',
  TEST_DRIVE = 'TEST_DRIVE',
  QUOTE = 'QUOTE',
  FOLLOW_UP = 'FOLLOW_UP',
  OTHER = 'OTHER',
}

// Deal types
export interface Deal {
  id: string;
  tenantId: string;
  customerId: string;
  vehicleId: string | null;
  userId: string;
  status: DealStatus;
  totalAmount: number;
  downPayment: number;
  tradeInValue: number;
  financingAmount: number;
  monthlyPayment: number | null;
  term: number | null;
  apr: number | null;
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export enum DealStatus {
  DRAFT = 'DRAFT',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  FUNDED = 'FUNDED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

// Lead types
export interface Lead {
  id: string;
  tenantId: string;
  customerId: string | null;
  source: LeadSource;
  status: LeadStatus;
  score: number;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  notes: string | null;
  assignedToUserId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

// Sale types
export interface Sale {
  id: string;
  tenantId: string;
  dealId: string;
  customerId: string;
  vehicleId: string;
  userId: string;
  saleDate: Date;
  saleAmount: number;
  commission: number;
  status: 'pending' | 'completed' | 'cancelled';
  paymentMethod: string;
  createdAt: Date;
  updatedAt: Date;
}

// Credit Application types
export interface CreditApplication {
  id: string;
  tenantId: string;
  customerId: string;
  dealId: string | null;
  applicationType: 'individual' | 'joint';
  employmentStatus: string;
  employer: string | null;
  occupation: string | null;
  annualIncome: number;
  monthlyIncome: number;
  housingStatus: 'own' | 'rent' | 'other';
  monthlyPayment: number;
  otherIncome: number | null;
  status: 'draft' | 'submitted' | 'approved' | 'denied' | 'pending';
  submittedAt: Date | null;
  approvedAt: Date | null;
  deniedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
