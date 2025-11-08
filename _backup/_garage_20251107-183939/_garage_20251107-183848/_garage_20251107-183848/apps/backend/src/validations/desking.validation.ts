import { z } from 'zod';
import {
  ApprovalPredictionRequest,
  CounterAnalysisRequest,
  DealStatus,
  DealStructure,
  GrossCalculation,
  OptimizationRequest,
  PaymentCalculation,
} from '../domain/desking/schemas';

export const worksheetTotalsSchema = z.object({
  salePrice: z.number(),
  tradeAllowance: z.number().optional(),
  tradePayoff: z.number().optional(),
  tradeEquity: z.number().optional(),
  cashDown: z.number().optional(),
  fees: z.number().optional(),
  backendProducts: z.number().optional(),
  taxes: z.number().optional(),
  amountFinanced: z.number(),
  dueAtSigning: z.number().optional(),
  frontEndGross: z.number().optional(),
  backEndGross: z.number().optional(),
  financeReserve: z.number().optional(),
  totalGross: z.number().optional(),
});

export const worksheetSaveSchema = z.object({
  worksheetId: z.string().min(1).optional(),
  customerId: z.string().min(1),
  vehicleId: z.string().min(1),
  salespersonId: z.string().min(1).optional(),
  status: DealStatus.default('WORKING'),
  structure: DealStructure,
  totals: worksheetTotalsSchema,
  payment: PaymentCalculation,
  aiScore: z.number().min(0).max(1).optional(),
  commitVersion: z
    .object({
      label: z.string().optional(),
      grossBreakdown: GrossCalculation.optional(),
      closeProbability: z.number().min(0).max(1).optional(),
      approvalProbability: z.number().min(0).max(1).optional(),
      aiScore: z.number().min(0).max(1).optional(),
    })
    .optional(),
});

export const worksheetPrintSchema = z.object({
  worksheetId: z.string().min(1),
  versionId: z.string().min(1).optional(),
});

export const versionSelectSchema = z.object({
  worksheetId: z.string().min(1),
  versionId: z.string().min(1),
});

const scoringOverrideSchema = z
  .object({
    gross_weight: z.number().min(0).max(100).optional(),
    close_weight: z.number().min(0).max(100).optional(),
    approval_weight: z.number().min(0).max(100).optional(),
    payment_weight: z.number().min(0).max(100).optional(),
  })
  .partial();

export const optimizeDealSchema = OptimizationRequest.extend({
  scoringOverride: scoringOverrideSchema.optional(),
});

export const counterAnalysisSchema = CounterAnalysisRequest;

export const approvalRefreshSchema = ApprovalPredictionRequest;

export type WorksheetSaveInput = z.infer<typeof worksheetSaveSchema>;
export type WorksheetPrintInput = z.infer<typeof worksheetPrintSchema>;
export type VersionSelectInput = z.infer<typeof versionSelectSchema>;
export type OptimizeDealInput = z.infer<typeof optimizeDealSchema>;
export type CounterAnalysisInput = z.infer<typeof counterAnalysisSchema>;
export type ApprovalRefreshInput = z.infer<typeof approvalRefreshSchema>;
