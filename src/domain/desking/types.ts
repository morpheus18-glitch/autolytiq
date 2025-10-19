export const DEAL_STATUSES = ['WORKING', 'PENCILED', 'SUBMITTED', 'CLOSED', 'LOST'] as const;
export type DealStatus = (typeof DEAL_STATUSES)[number];

export const CREDIT_TIERS = ['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5', 'TIER_6'] as const;
export type CreditTier = (typeof CREDIT_TIERS)[number];

export const RESIDENCE_TYPES = ['OWN', 'RENT', 'LEASE', 'FAMILY', 'MILITARY', 'OTHER'] as const;
export type ResidenceType = (typeof RESIDENCE_TYPES)[number];

export const RECOMMENDATIONS = ['STRONG', 'MODERATE', 'WEAK', 'DO_NOT_SUBMIT'] as const;
export type Recommendation = (typeof RECOMMENDATIONS)[number];

export const COUNTER_OUTCOMES = ['PENDING', 'ACCEPTED', 'DECLINED'] as const;
export type CounterOfferOutcome = (typeof COUNTER_OUTCOMES)[number];

export interface FeeLine {
  code: string;
  label: string;
  amount: number;
  taxable?: boolean;
}

export interface BackendProduct {
  code: string;
  name: string;
  price: number;
  cost?: number;
  termMonths?: number;
}

export interface DealStructure {
  pricing: {
    msrp?: number;
    salePrice: number;
    dealerDiscounts?: Array<{ label: string; amount: number }>;
    accessories?: Array<{ label: string; amount: number }>;
  };
  trade?: {
    allowance?: number;
    payoff?: number;
    equity?: number;
    description?: string;
    vehicle?: VehicleInfo;
  };
  cashDown?: {
    customerCash?: number;
    manufacturerRebate?: number;
    tradeEquity?: number;
    total: number;
  };
  fees: FeeLine[];
  taxes: Array<{ jurisdiction: string; rate: number; amount: number }>;
  backendProducts?: BackendProduct[];
  lender?: {
    preferredLenderId?: string;
    backupLenderId?: string;
    maxTerm?: number;
    minTerm?: number;
    targetPayment?: number;
  };
}

export interface VehicleInfo {
  id?: string;
  vin: string;
  stockNumber?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage?: number;
  type?: 'NEW' | 'USED' | 'CERTIFIED';
  msrp?: number;
  salePrice?: number;
  exteriorColor?: string;
  interiorColor?: string;
}

export interface CustomerProfile {
  id?: string;
  firstName: string;
  lastName: string;
  email?: string;
  creditScore: number;
  creditTier: CreditTier;
  residenceType: ResidenceType;
  residenceDurationMonths?: number;
  monthlyIncome?: number;
  employmentStatus?: string;
  employerName?: string;
  debtToIncomeRatio?: number;
  hasCoBuyer?: boolean;
}

export interface PaymentCalculation {
  amountFinanced: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  dueAtSigning?: number;
}

export interface GrossCalculation {
  frontEnd: number;
  backEnd: number;
  financeReserve?: number;
  docFee?: number;
  pack?: number;
  total: number;
}

export interface OptimizationGoals {
  targetPayment?: number;
  minimumGross?: number;
  maximumTerm?: number;
  preserveProducts?: string[];
  lenderPreference?: string;
}

export interface OptimizationConstraints {
  maxTerm?: number;
  minTerm?: number;
  minCashDown?: number;
  maxCashDown?: number;
  allowedTiers?: CreditTier[];
  residenceType?: ResidenceType;
  bannedProducts?: string[];
}

export interface OptimizationRequest {
  dealId: string;
  worksheetId?: string;
  versionId?: string;
  structure: DealStructure;
  customerProfile: CustomerProfile;
  vehicle: VehicleInfo;
  currentPayment: PaymentCalculation;
  goals: OptimizationGoals;
  constraints: OptimizationConstraints;
}

export interface AlternativeStructure {
  id: string;
  label: string;
  structure: DealStructure;
  payment: PaymentCalculation;
  gross: GrossCalculation;
  probabilityOfClose?: number;
  notes?: string;
}

export interface OptimizationResponse {
  worksheetId: string;
  versionId?: string;
  recommendedStructure: DealStructure;
  projectedGross?: GrossCalculation;
  insights: string[];
  warnings: string[];
  alternatives: AlternativeStructure[];
}

export interface CounterAnalysisRequest {
  dealId: string;
  worksheetId: string;
  versionId?: string;
  customerInput: {
    customerConcern: string;
    requestedPayment?: number;
    requestedTerm?: number;
    requestedCashDown?: number;
    requestedApr?: number;
    notes?: string;
  };
}

export interface CounterOption {
  id: string;
  label: string;
  structure: DealStructure;
  payment: PaymentCalculation;
  gross: GrossCalculation;
  probabilityOfClose?: number;
  notes?: string;
  rebuttalScript?: string;
}

export interface CounterAnalysisResponse {
  summary: string;
  options: CounterOption[];
  recommendation?: string;
  recommendedOptionId?: string;
  confidence?: number;
  outcome?: CounterOfferOutcome;
}

export interface ApprovalPredictionRequest {
  dealId: string;
  worksheetId?: string;
  versionId?: string;
  lenderId: string;
  structure: DealStructure;
  customerProfile: CustomerProfile;
  vehicle: VehicleInfo;
  payment: PaymentCalculation;
}

export interface Stipulation {
  code: string;
  description: string;
  required: boolean;
  category?: string;
  documents?: string[];
}

export interface ApprovalPrediction {
  dealId: string;
  worksheetId?: string;
  versionId?: string;
  lenderId: string;
  lenderName: string;
  approvalProbability: number;
  recommendedTier: CreditTier;
  estimatedRate?: number;
  estimatedReserve?: number;
  strengths: string[];
  weaknesses: string[];
  stipulations: Stipulation[];
  recommendation: Recommendation;
}
