import { z } from 'zod';

export const DealStatus = z.enum(['WORKING', 'PENCILED', 'SUBMITTED', 'CLOSED', 'LOST']);
export type DealStatus = z.infer<typeof DealStatus>;

export const CreditTier = z.enum(['TIER_1', 'TIER_2', 'TIER_3', 'TIER_4', 'TIER_5', 'TIER_6']);
export type CreditTier = z.infer<typeof CreditTier>;

export const ResidenceType = z.enum(['OWN', 'RENT', 'LEASE', 'FAMILY', 'MILITARY', 'OTHER']);
export type ResidenceType = z.infer<typeof ResidenceType>;

export const Recommendation = z.enum(['STRONG', 'MODERATE', 'WEAK', 'DO_NOT_SUBMIT']);
export type Recommendation = z.infer<typeof Recommendation>;

const Money = z.number().finite();
const Percentage = z.number().finite();
const Rate = z.number().finite();
const TermMonths = z.number().int().min(1);

export const Id = z.string().min(1);
export const ISODate = z.string().datetime({ offset: true }).or(z.string().datetime());

const FeeLine = z.object({
  code: z.string(),
  label: z.string(),
  amount: Money,
  taxable: z.boolean().optional(),
});

export const BackendProduct = z.object({
  code: z.string(),
  name: z.string(),
  price: Money,
  cost: Money.optional(),
  termMonths: z.number().int().min(0).optional(),
});
export type BackendProduct = z.infer<typeof BackendProduct>;

export const VehicleInfo = z.object({
  id: Id.optional(),
  vin: z.string().min(1),
  stockNumber: z.string().optional(),
  year: z.number().int().min(1900),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  mileage: z.number().int().min(0).optional(),
  msrp: Money.optional(),
  salePrice: Money.optional(),
  cost: Money.optional(),
  pack: Money.optional(),
  daysInStock: z.number().int().min(0).optional(),
  modelCategory: z.string().optional(),
  color: z.string().optional(),
  age: z.number().int().min(0).optional(),
});
export type VehicleInfo = z.infer<typeof VehicleInfo>;

export const CustomerProfile = z.object({
  id: Id.optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  creditScore: z.number().int().min(300).max(900),
  creditTier: CreditTier,
  residenceType: ResidenceType,
  residenceDurationMonths: z.number().int().min(0).optional(),
  monthlyIncome: Money.optional(),
  employmentStatus: z.string().optional(),
  employerName: z.string().optional(),
  debtToIncomeRatio: Percentage.optional(),
  hasCoBuyer: z.boolean().optional(),
});
export type CustomerProfile = z.infer<typeof CustomerProfile>;

export const PaymentCalculation = z.object({
  amountFinanced: Money,
  apr: Rate,
  termMonths: TermMonths,
  monthlyPayment: Money,
  dueAtSigning: Money.optional(),
});
export type PaymentCalculation = z.infer<typeof PaymentCalculation>;

export const GrossCalculation = z.object({
  frontEnd: Money,
  backEnd: Money,
  financeReserve: Money.optional(),
  docFee: Money.optional(),
  pack: Money.optional(),
  total: Money,
});
export type GrossCalculation = z.infer<typeof GrossCalculation>;

export const DealStructure = z.object({
  pricing: z.object({
    msrp: Money.optional(),
    salePrice: Money,
    dealerDiscounts: z
      .array(
        z.object({
          label: z.string(),
          amount: Money,
        }),
      )
      .optional(),
    accessories: z
      .array(
        z.object({
          label: z.string(),
          amount: Money,
        }),
      )
      .optional(),
  }),
  trade: z
    .object({
      allowance: Money.optional(),
      payoff: Money.optional(),
      equity: Money.optional(),
      description: z.string().optional(),
      vehicle: VehicleInfo.optional(),
    })
    .optional(),
  cashDown: z
    .object({
      customerCash: Money.optional(),
      manufacturerRebate: Money.optional(),
      tradeEquity: Money.optional(),
      total: Money,
    })
    .optional(),
  fees: z.array(FeeLine),
  taxes: z.array(
    z.object({
      jurisdiction: z.string(),
      rate: Percentage,
      amount: Money,
    }),
  ),
  backendProducts: z.array(BackendProduct).optional(),
  lender: z
    .object({
      preferredLenderId: Id.optional(),
      backupLenderId: Id.optional(),
      maxTerm: z.number().int().min(0).optional(),
      minTerm: z.number().int().min(0).optional(),
      targetPayment: Money.optional(),
    })
    .optional(),
});
export type DealStructure = z.infer<typeof DealStructure>;

export const OptimizationGoals = z.object({
  targetPayment: Money.optional(),
  minimumGross: Money.optional(),
  maximumTerm: z.number().int().min(0).optional(),
  preserveProducts: z.array(z.string()).optional(),
  lenderPreference: Id.optional(),
});
export type OptimizationGoals = z.infer<typeof OptimizationGoals>;

export const OptimizationConstraints = z.object({
  maxTerm: z.number().int().min(0).optional(),
  minTerm: z.number().int().min(0).optional(),
  minCashDown: Money.optional(),
  maxCashDown: Money.optional(),
  allowedTiers: z.array(CreditTier).optional(),
  residenceType: ResidenceType.optional(),
  bannedProducts: z.array(z.string()).optional(),
});
export type OptimizationConstraints = z.infer<typeof OptimizationConstraints>;

export const OptimizationRequest = z.object({
  dealId: Id,
  worksheetId: Id.optional(),
  versionId: Id.optional(),
  structure: DealStructure,
  customerProfile: CustomerProfile,
  vehicle: VehicleInfo,
  currentPayment: PaymentCalculation,
  goals: OptimizationGoals,
  constraints: OptimizationConstraints.optional().default({}),
  scoringOverride: z
    .object({
      gross_weight: Percentage.optional(),
      close_weight: Percentage.optional(),
      approval_weight: Percentage.optional(),
      payment_weight: Percentage.optional(),
    })
    .partial()
    .optional(),
});
export type OptimizationRequest = z.infer<typeof OptimizationRequest>;

export const CounterAnalysisRequest = z.object({
  dealId: Id,
  worksheetId: Id,
  versionId: Id.optional(),
  customerInput: z.object({
    customerConcern: z.string().min(1),
    requestedPayment: Money.optional(),
    requestedTerm: z.number().int().min(0).optional(),
    requestedCashDown: Money.optional(),
    requestedApr: Percentage.optional(),
    notes: z.string().optional(),
  }),
});
export type CounterAnalysisRequest = z.infer<typeof CounterAnalysisRequest>;

export const CounterCustomerInput = CounterAnalysisRequest.shape.customerInput;
export type CounterCustomerInput = z.infer<typeof CounterCustomerInput>;

export const CounterOption = z.object({
  id: Id,
  label: z.string(),
  structure: DealStructure,
  payment: PaymentCalculation,
  gross: GrossCalculation,
  probabilityOfClose: Percentage.optional(),
  notes: z.string().optional(),
});
export type CounterOption = z.infer<typeof CounterOption>;

export const CounterAnalysisResponse = z.object({
  summary: z.string(),
  options: z.array(CounterOption),
  recommendation: z.string().optional(),
  recommendedOptionId: Id.optional(),
  confidence: Percentage.optional(),
  outcome: Recommendation.optional(),
});
export type CounterAnalysisResponse = z.infer<typeof CounterAnalysisResponse>;

export const ApprovalPredictionRequest = z.object({
  dealId: Id,
  worksheetId: Id.optional(),
  versionId: Id.optional(),
  lenderId: Id,
  structure: DealStructure,
  customerProfile: CustomerProfile,
  vehicle: VehicleInfo,
  payment: PaymentCalculation,
});
export type ApprovalPredictionRequest = z.infer<typeof ApprovalPredictionRequest>;

export const StipulationPrediction = z.object({
  code: z.string(),
  label: z.string(),
  required: z.boolean().optional(),
});
export type StipulationPrediction = z.infer<typeof StipulationPrediction>;

export const ApprovalPrediction = z.object({
  lenderId: Id,
  lenderName: z.string(),
  approvalProbability: Percentage,
  recommendedTier: CreditTier,
  estimatedRate: Rate.optional(),
  estimatedReserve: Money.optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  stipulations: z.array(StipulationPrediction),
  recommendation: Recommendation,
});
export type ApprovalPrediction = z.infer<typeof ApprovalPrediction>;

