import { z } from 'zod';
import {
  COUNTER_OUTCOMES,
  CREDIT_TIERS,
  DEAL_STATUSES,
  RESIDENCE_TYPES,
  RECOMMENDATIONS,
} from './types.js';

export const feeLineSchema = z.object({
  code: z.string().min(1),
  label: z.string().min(1),
  amount: z.number(),
  taxable: z.boolean().optional(),
});

export const backendProductSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  price: z.number(),
  cost: z.number().optional(),
  termMonths: z.number().int().positive().optional(),
});

export const vehicleInfoSchema = z.object({
  id: z.string().min(1).optional(),
  vin: z.string().min(8),
  stockNumber: z.string().min(1).optional(),
  year: z.number().int(),
  make: z.string().min(1),
  model: z.string().min(1),
  trim: z.string().optional(),
  mileage: z.number().nonnegative().optional(),
  type: z.enum(['NEW', 'USED', 'CERTIFIED']).optional(),
  msrp: z.number().nonnegative().optional(),
  salePrice: z.number().nonnegative().optional(),
  exteriorColor: z.string().optional(),
  interiorColor: z.string().optional(),
});

export const dealStructureSchema = z.object({
  pricing: z.object({
    msrp: z.number().nonnegative().optional(),
    salePrice: z.number(),
    dealerDiscounts: z
      .array(z.object({ label: z.string().min(1), amount: z.number() }))
      .optional(),
    accessories: z.array(z.object({ label: z.string().min(1), amount: z.number() })).optional(),
  }),
  trade: z
    .object({
      allowance: z.number().nonnegative().optional(),
      payoff: z.number().nonnegative().optional(),
      equity: z.number().optional(),
      description: z.string().optional(),
      vehicle: vehicleInfoSchema.optional(),
    })
    .optional(),
  cashDown: z
    .object({
      customerCash: z.number().nonnegative().optional(),
      manufacturerRebate: z.number().nonnegative().optional(),
      tradeEquity: z.number().optional(),
      total: z.number().nonnegative(),
    })
    .optional(),
  fees: z.array(feeLineSchema),
  taxes: z.array(z.object({ jurisdiction: z.string().min(1), rate: z.number(), amount: z.number() })),
  backendProducts: z.array(backendProductSchema).optional(),
  lender: z
    .object({
      preferredLenderId: z.string().min(1).optional(),
      backupLenderId: z.string().min(1).optional(),
      maxTerm: z.number().int().positive().optional(),
      minTerm: z.number().int().positive().optional(),
      targetPayment: z.number().nonnegative().optional(),
    })
    .optional(),
});

export const customerProfileSchema = z.object({
  id: z.string().min(1).optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email().optional(),
  creditScore: z.number().int().nonnegative(),
  creditTier: z.enum(CREDIT_TIERS),
  residenceType: z.enum(RESIDENCE_TYPES),
  residenceDurationMonths: z.number().int().nonnegative().optional(),
  monthlyIncome: z.number().nonnegative().optional(),
  employmentStatus: z.string().optional(),
  employerName: z.string().optional(),
  debtToIncomeRatio: z.number().nonnegative().optional(),
  hasCoBuyer: z.boolean().optional(),
});

export const paymentCalculationSchema = z.object({
  amountFinanced: z.number(),
  apr: z.number(),
  termMonths: z.number().int().positive(),
  monthlyPayment: z.number(),
  dueAtSigning: z.number().nonnegative().optional(),
});

export const grossCalculationSchema = z.object({
  frontEnd: z.number(),
  backEnd: z.number(),
  financeReserve: z.number().optional(),
  docFee: z.number().optional(),
  pack: z.number().optional(),
  total: z.number(),
});

export const optimizationGoalsSchema = z.object({
  targetPayment: z.number().nonnegative().optional(),
  minimumGross: z.number().optional(),
  maximumTerm: z.number().int().positive().optional(),
  preserveProducts: z.array(z.string()).optional(),
  lenderPreference: z.string().optional(),
});

export const optimizationConstraintsSchema = z.object({
  maxTerm: z.number().int().positive().optional(),
  minTerm: z.number().int().positive().optional(),
  minCashDown: z.number().nonnegative().optional(),
  maxCashDown: z.number().nonnegative().optional(),
  allowedTiers: z.array(z.enum(CREDIT_TIERS)).optional(),
  residenceType: z.enum(RESIDENCE_TYPES).optional(),
  bannedProducts: z.array(z.string()).optional(),
});

export const alternativeStructureSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  structure: dealStructureSchema,
  payment: paymentCalculationSchema,
  gross: grossCalculationSchema,
  probabilityOfClose: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export const optimizationRequestSchema = z.object({
  dealId: z.string().min(1),
  worksheetId: z.string().min(1).optional(),
  versionId: z.string().min(1).optional(),
  structure: dealStructureSchema,
  customerProfile: customerProfileSchema,
  vehicle: vehicleInfoSchema,
  currentPayment: paymentCalculationSchema,
  goals: optimizationGoalsSchema,
  constraints: optimizationConstraintsSchema,
});

export const optimizationResponseSchema = z.object({
  worksheetId: z.string().min(1),
  versionId: z.string().min(1).optional(),
  recommendedStructure: dealStructureSchema,
  projectedGross: grossCalculationSchema.optional(),
  insights: z.array(z.string()),
  warnings: z.array(z.string()),
  alternatives: z.array(alternativeStructureSchema),
});

export const counterAnalysisRequestSchema = z.object({
  dealId: z.string().min(1),
  worksheetId: z.string().min(1),
  versionId: z.string().min(1).optional(),
  customerInput: z.object({
    customerConcern: z.string().min(1),
    requestedPayment: z.number().optional(),
    requestedTerm: z.number().int().positive().optional(),
    requestedCashDown: z.number().nonnegative().optional(),
    requestedApr: z.number().optional(),
    notes: z.string().optional(),
  }),
});

export const counterOptionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  structure: dealStructureSchema,
  payment: paymentCalculationSchema,
  gross: grossCalculationSchema,
  probabilityOfClose: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
  rebuttalScript: z.string().optional(),
});

export const counterAnalysisResponseSchema = z.object({
  summary: z.string().min(1),
  options: z.array(counterOptionSchema),
  recommendation: z.string().optional(),
  recommendedOptionId: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  outcome: z.enum(COUNTER_OUTCOMES).optional(),
});

export const stipulationSchema = z.object({
  code: z.string().min(1),
  description: z.string().min(1),
  required: z.boolean(),
  category: z.string().optional(),
  documents: z.array(z.string()).optional(),
});

export const approvalPredictionRequestSchema = z.object({
  dealId: z.string().min(1),
  worksheetId: z.string().min(1).optional(),
  versionId: z.string().min(1).optional(),
  lenderId: z.string().min(1),
  structure: dealStructureSchema,
  customerProfile: customerProfileSchema,
  vehicle: vehicleInfoSchema,
  payment: paymentCalculationSchema,
});

export const approvalPredictionSchema = z.object({
  dealId: z.string().min(1),
  worksheetId: z.string().min(1).optional(),
  versionId: z.string().min(1).optional(),
  lenderId: z.string().min(1),
  lenderName: z.string().min(1),
  approvalProbability: z.number().min(0).max(1),
  recommendedTier: z.enum(CREDIT_TIERS),
  estimatedRate: z.number().nonnegative().optional(),
  estimatedReserve: z.number().optional(),
  strengths: z.array(z.string()),
  weaknesses: z.array(z.string()),
  stipulations: z.array(stipulationSchema),
  recommendation: z.enum(RECOMMENDATIONS),
});

export const dealWorksheetStatusSchema = z.enum(DEAL_STATUSES);
