import { z } from 'zod';
import {
  approvalPredictionRequestSchema,
  counterAnalysisRequestSchema,
  dealStructureSchema,
  dealWorksheetStatusSchema,
  grossCalculationSchema,
  optimizationRequestSchema,
  paymentCalculationSchema,
} from '../domain/desking/schemas.js';

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
  status: dealWorksheetStatusSchema.default('WORKING'),
  structure: dealStructureSchema,
  totals: worksheetTotalsSchema,
  payment: paymentCalculationSchema,
  aiScore: z.number().min(0).max(1).optional(),
  commitVersion: z
    .object({
      label: z.string().optional(),
      grossBreakdown: grossCalculationSchema.optional(),
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

export const optimizeDealSchema = optimizationRequestSchema;

export const counterAnalysisSchema = counterAnalysisRequestSchema;

export const approvalRefreshSchema = approvalPredictionRequestSchema;

export type WorksheetSaveInput = z.infer<typeof worksheetSaveSchema>;
export type WorksheetPrintInput = z.infer<typeof worksheetPrintSchema>;
export type VersionSelectInput = z.infer<typeof versionSelectSchema>;
export type OptimizeDealInput = z.infer<typeof optimizeDealSchema>;
export type CounterAnalysisInput = z.infer<typeof counterAnalysisSchema>;
export type ApprovalRefreshInput = z.infer<typeof approvalRefreshSchema>;
