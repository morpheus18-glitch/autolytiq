import { z } from "zod";

/** ─────────────────────────────
 * Enums (mirror Prisma)
 * ───────────────────────────── */
export const DealStatus = z.enum(["WORKING","PENCILED","SUBMITTED","CLOSED","LOST"]);
export type DealStatus = z.infer<typeof DealStatus>;

export const CreditTier = z.enum(["TIER_1","TIER_2","TIER_3","TIER_4","SUBPRIME"]);
export type CreditTier = z.infer<typeof CreditTier>;

export const ResidenceType = z.enum(["OWN","RENT","OTHER"]);
export type ResidenceType = z.infer<typeof ResidenceType>;

export const Recommendation = z.enum(["STRONG","MODERATE","WEAK","DO_NOT_SUBMIT"]);
export type Recommendation = z.infer<typeof Recommendation>;

/** ─────────────────────────────
 * Core atoms
 * ───────────────────────────── */
export const Money = z.number().finite().min(-9_999_999_999).max(9_999_999_999);
export const Percent = z.number().finite().min(0).max(100);
export const APR = z.number().finite().min(0).max(99.99);
export const TermMonths = z.number().int().min(1).max(120);
export const Probability = z.number().finite().min(0).max(100);

export const Id = z.string().min(1);
export const ISODate = z.string().datetime({ offset: true }).or(z.string().datetime()); // allow UTC/plain

/** ─────────────────────────────
 * Vehicle / Customer
 * ───────────────────────────── */
export const VehicleInfo = z.object({
  id: Id,
  vin: z.string().min(8).max(32),
  stockNumber: z.string().min(1),
  make: z.string().min(1),
  model: z.string().min(1),
  modelCategory: z.string().min(1).optional(),
  year: z.number().int().min(1980).max(2100),
  mileage: z.number().int().min(0),
  color: z.string().min(1).optional(),
  msrp: Money.nonnegative(),
  cost: Money.nonnegative(),
  pack: Money.nonnegative().default(0),
  daysInStock: z.number().int().min(0),
  age: z.number().int().min(0).optional(), // derived
});

export type VehicleInfo = z.infer<typeof VehicleInfo>;

export const CustomerProfile = z.object({
  id: Id,
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  creditScore: z.number().int().min(300).max(900).optional(),
  monthlyIncome: Money.nonnegative().optional(),
  monthlyObligations: Money.nonnegative().default(0),
  employmentLength: z.number().int().min(0).max(600).optional(), // months
  residenceType: ResidenceType.optional(),
  bankruptcies: z.number().int().min(0).max(10).default(0),
  repoHistory: z.boolean().default(false),
  dti: Percent.optional(), // derived
});

export type CustomerProfile = z.infer<typeof CustomerProfile>;

/** ─────────────────────────────
 * Payment / Gross calculations
 * ───────────────────────────── */
export const PaymentCalculation = z.object({
  monthlyPayment: Money,
  totalPayment: Money,
  totalInterest: Money,
  apr: APR,
  term: TermMonths,
});

export type PaymentCalculation = z.infer<typeof PaymentCalculation>;

export const GrossBreakdown = z.object({
  sellingPrice: Money,
  cost: Money,
  pack: Money,
  tradeOverAllow: Money,
  tradeReserve: Money,
});

export const GrossCalculation = z.object({
  frontGross: Money,
  financeReserve: Money,
  backendGross: Money,
  totalGross: Money,
  breakdown: GrossBreakdown,
});

export type GrossCalculation = z.infer<typeof GrossCalculation>;

/** ─────────────────────────────
 * Deal structure
 * ───────────────────────────── */
export const Fees = z.object({
  taxAmount: Money.nonnegative().default(0),
  docFee: Money.nonnegative().default(0),
  registration: Money.nonnegative().default(0),
  titleFee: Money.nonnegative().default(0),
  otherFees: Money.nonnegative().default(0),
});

export const Rebate = z.object({
  id: Id.optional(),
  label: z.string(),
  amount: Money.nonnegative(),
  applied: z.boolean().default(true),
});

export const FIProduct = z.object({
  code: z.string(),
  label: z.string(),
  retailPrice: Money.nonnegative(),
  dealerCost: Money.nonnegative().optional(),
});

export const DealStructure = z.object({
  // vehicle/customer pointers for convenience
  vehicle: VehicleInfo,
  customer: CustomerProfile.optional(),

  // pricing
  sellingPrice: Money.nonnegative(),
  tradeAllowance: Money.nonnegative().optional(),
  tradeACV: Money.nonnegative().optional(),
  tradePayoff: Money.nonnegative().optional(),
  tradeReserve: Money.nonnegative().default(0),
  cashDown: Money.nonnegative().default(0),
  rebatesTotal: Money.nonnegative().default(0),
  rebates: z.array(Rebate).default([]),

  // rates/terms
  term: TermMonths,
  buyRate: APR.optional(),
  sellRate: APR.optional(),
  apr: APR.optional(), // effective
  amountFinanced: Money.nonnegative().optional(), // derived
  ltv: Percent.optional(),
  pti: Percent.optional(),

  // fees
  fees: Fees.default({} as any),

  // FI products (optional at desking)
  fiProducts: z.array(FIProduct).optional(),

  // scoring
  aiScore: z.number().min(0).max(100).optional(),
  closeProbability: Probability.optional(),
  approvalProbability: Probability.optional(),
  totalGross: Money.optional(),
  payment: Money.optional(),
});

export type DealStructure = z.infer<typeof DealStructure>;

/** ─────────────────────────────
 * Optimizer / Counter / Approvals
 * ───────────────────────────── */
export const OptimizationGoals = z.object({
  maximizeGross: z.boolean().default(true),
  maximizeClose: z.boolean().default(true),
  maximizeApproval: z.boolean().default(true),
  minimizePayment: z.boolean().default(false),
});
export type OptimizationGoals = z.infer<typeof OptimizationGoals>;

export const OptimizationConstraints = z.object({
  minGross: Money.nonnegative().optional(),
  maxPayment: Money.nonnegative().optional(),
  preferredTerm: TermMonths.optional(),
  maxLTV: Percent.optional(),
  targetPayment: Money.nonnegative().optional(),
  maxDiscount: Money.nonnegative().optional(),
});
export type OptimizationConstraints = z.infer<typeof OptimizationConstraints>;

export const OptimizationRequest = z.object({
  tenantId: Id,
  deal: z.object({
    vehicle: VehicleInfo,
    customer: CustomerProfile.optional(),
    structure: DealStructure.pick({
      sellingPrice: true,
      tradeAllowance: true,
      tradePayoff: true,
      cashDown: true,
      rebatesTotal: true,
      term: true,
      apr: true,
    }),
  }),
  goals: OptimizationGoals,
  constraints: OptimizationConstraints.optional(),
});
export type OptimizationRequest = z.infer<typeof OptimizationRequest>;

export const AlternativeStructure = DealStructure.extend({
  label: z.string().optional(),
});
export type AlternativeStructure = z.infer<typeof AlternativeStructure>;

export const OptimizationAnalysis = z.object({
  closeProbability: Probability,
  approvalProbability: Probability,
  projectedGross: Money,
  competitiveness: z.number().min(0).max(100),
  riskScore: z.number().min(0).max(100),
});

export const OptimizationResponse = z.object({
  recommendedStructure: DealStructure,
  alternatives: z.array(AlternativeStructure).default([]),
  analysis: OptimizationAnalysis,
  insights: z.array(z.string()).default([]),
  warnings: z.array(z.string()).default([]),
});
export type OptimizationResponse = z.infer<typeof OptimizationResponse>;

export const CounterCustomerInput = z.object({
  sellingPriceRequest: Money.nonnegative().optional(),
  paymentRequest: Money.nonnegative().optional(),
  tradeValueRequest: Money.nonnegative().optional(),
  downPaymentObjection: z.boolean().optional(),
  otherObjections: z.string().optional(),
  competitorInfo: z.object({
    dealership: z.string(),
    price: Money.nonnegative(),
    vehicle: z.string(),
  }).optional(),
  urgencyLevel: z.enum(["LOW","MEDIUM","HIGH"]).default("MEDIUM"),
  buyingSignals: z.array(z.string()).default([]),
});
export type CounterCustomerInput = z.infer<typeof CounterCustomerInput>;

export const CounterOption = z.object({
  id: Id,
  label: z.string(),
  recommended: z.boolean().default(false),
  newSellingPrice: Money.nonnegative(),
  reductionGiven: Money.nonnegative().default(0),
  newPayment: Money.nonnegative(),
  newGross: Money,
  closeProbability: Probability,
  approvalProbability: Probability,
  aiScore: z.number().min(0).max(100),
  reasoning: z.string(),
});
export type CounterOption = z.infer<typeof CounterOption>;

export const AlternativePath = z.object({
  label: z.string(),
  structure: DealStructure,
  payment: Money.nonnegative().optional(),
  gross: Money.optional(),
  closeProbability: Probability.optional(),
});
export type AlternativePath = z.infer<typeof AlternativePath>;

export const CounterAnalysisRequest = z.object({
  dealId: Id,
  originalStructure: DealStructure,
  customerCounter: CounterCustomerInput,
});
export type CounterAnalysisRequest = z.infer<typeof CounterAnalysisRequest>;

export const CounterAnalysisResponse = z.object({
  dealHealth: z.enum(["STRONG","SALVAGEABLE","WEAK","LOST"]),
  recommendedStrategy: z.string(),
  counterOptions: z.array(CounterOption),
  alternativeStructures: z.array(AlternativePath),
  negotiationScripts: z.array(z.object({
    title: z.string(),
    script: z.string(),
  })).default([]),
  insights: z.array(z.string()).default([]),
});
export type CounterAnalysisResponse = z.infer<typeof CounterAnalysisResponse>;

export const ApprovalPredictionRequest = z.object({
  customer: CustomerProfile.pick({
    creditScore: true,
    monthlyIncome: true,
    monthlyObligations: true,
    employmentLength: true,
    residenceType: true,
    bankruptcies: true,
    repoHistory: true
  }),
  deal: z.object({
    amountFinanced: Money.nonnegative(),
    term: TermMonths,
    ltv: Percent,
    pti: Percent,
    vehicleAge: z.number().int().min(0),
  }),
  lender: z.object({
    id: Id,
    creditTiers: z.array(CreditTier),
    maxLTV: Percent,
    maxPTI: Percent,
    minCreditScore: z.number().int().min(300).max(900),
    name: z.string().optional(),
  }),
});
export type ApprovalPredictionRequest = z.infer<typeof ApprovalPredictionRequest>;

export const StipulationPrediction = z.object({
  code: z.string(),
  label: z.string(),
});
export type StipulationPrediction = z.infer<typeof StipulationPrediction>;

export const ApprovalPrediction = z.object({
  lenderId: Id,
  lenderName: z.string(),
  approvalProbability: Probability,
  recommendedTier: z.string(),
  estimatedRate: APR,
  estimatedReserve: Money.nonnegative(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  stipulations: z.array(StipulationPrediction),
  recommendation: Recommendation,
});
export type ApprovalPrediction = z.infer<typeof ApprovalPrediction>;
