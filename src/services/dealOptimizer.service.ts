import { Prisma, RetailDealStatus } from '@prisma/client';
import { prisma, toInputJson } from '../lib/prisma.js';
import { mlService } from './ml.service.js';
import { getScoringConfig, type ScoringConfig } from '../config/scoring.js';
import {
  competitiveRange,
  getMarketData,
  type ComparableSale,
  type VehicleDescriptor,
} from './marketPricing.service.js';
import {
  findSimilarDeals,
  type DealSnapshot,
} from './similarDeals.service.js';
import {
  getActiveLenders,
  listViolations,
  type LenderProfile,
  type LenderViolation,
  type RateSheetTier,
} from './lenderRules.service.js';
import { amortization } from './paymentCalculator.service.js';
import { calculateGross } from './grossCalculator.service.js';
import type {
  CounterAnalysisPayload,
  CounterAnalysisRequest,
  CounterAnalysisResponse,
  CounterOption,
  CreditTier,
  DealStructure,
  GrossCalculation,
  LenderCriteriaEntry,
  MarketComparable,
  MarketDataContext,
  MarketDataRange,
  MarketDataSummary,
  OptimizationPayload,
  OptimizationRequest,
  OptimizationResponse,
  PaymentCalculation,
  SimilarDealMetrics,
  SimilarDealSnapshot,
  SimilarDealsContext,
} from '../domain/desking/types.js';
import { recordCounterOffer, recordOptimization, type OptimizationView, type VersionView } from './desking.service.js';

type DecimalLike = Prisma.Decimal | number | string | null | undefined;

const RETAIL_CLOSED_STATUSES: RetailDealStatus[] = [
  RetailDealStatus.APPROVED,
  RetailDealStatus.FUNDED,
  RetailDealStatus.DELIVERED,
];

const CREDIT_TIER_VALUES: readonly CreditTier[] = [
  'TIER_1',
  'TIER_2',
  'TIER_3',
  'TIER_4',
  'TIER_5',
  'TIER_6',
];

const toCreditTier = (value: string): CreditTier =>
  CREDIT_TIER_VALUES.includes(value as CreditTier) ? (value as CreditTier) : 'TIER_1';

const roundToCents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const decimalToNumber = (value: DecimalLike): number | null => {
  if (value == null) {
    return null;
  }
  if (value instanceof Prisma.Decimal) {
    return value.toNumber();
  }
  const parsed = typeof value === 'string' ? Number.parseFloat(value) : value;
  return Number.isFinite(parsed) ? (parsed as number) : null;
};

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

const isJsonObject = (value: Prisma.JsonValue | null): value is Prisma.JsonObject =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const parseWorksheetSnapshot = (
  value: Prisma.JsonValue | null,
): { structure: DealStructure; payment: PaymentCalculation; totals?: WorksheetTotalsSnapshot } | null => {
  if (!isJsonObject(value)) {
    return null;
  }
  if (!('structure' in value) || !('payment' in value)) {
    return null;
  }
  return value as unknown as {
    structure: DealStructure;
    payment: PaymentCalculation;
    totals?: WorksheetTotalsSnapshot;
  };
};

const parseGrossSnapshot = (value: Prisma.JsonValue | null): GrossCalculation | undefined => {
  if (!isJsonObject(value)) {
    return undefined;
  }
  return value as unknown as GrossCalculation;
};

function normalizeObjectiveWeights(
  base: ScoringConfig['objectives'],
  override?: Partial<ScoringConfig['objectives']> | null,
): ScoringConfig['objectives'] {
  const merged: ScoringConfig['objectives'] = {
    gross_weight: base.gross_weight,
    close_weight: base.close_weight,
    approval_weight: base.approval_weight,
    payment_weight: base.payment_weight,
  };

  if (override) {
    for (const [key, value] of Object.entries(override)) {
      if (value == null || Number.isNaN(value)) {
        continue;
      }
      switch (key) {
        case 'gross_weight':
          merged.gross_weight = value;
          break;
        case 'close_weight':
          merged.close_weight = value;
          break;
        case 'approval_weight':
          merged.approval_weight = value;
          break;
        case 'payment_weight':
          merged.payment_weight = value;
          break;
        default:
          break;
      }
    }
  }

  const total =
    merged.gross_weight + merged.close_weight + merged.approval_weight + merged.payment_weight;
  if (total <= 0) {
    return merged;
  }

  const normalize = (value: number) => value / total;
  return {
    gross_weight: normalize(merged.gross_weight),
    close_weight: normalize(merged.close_weight),
    approval_weight: normalize(merged.approval_weight),
    payment_weight: normalize(merged.payment_weight),
  };
}

interface StructureFinancials {
  basePrice: number;
  dealerDiscounts: number;
  accessories: number;
  fees: number;
  taxes: number;
  backend: number;
  cashDown: number;
  tradeAllowance: number;
  tradePayoff: number;
  tradeEquity: number;
  amountFinanced: number;
  dueAtSigning: number;
  advanceValue: number;
}

interface VehicleCostProfile {
  cost: number;
  pack?: number;
}

interface WorksheetTotalsSnapshot {
  salePrice: number;
  tradeAllowance: number;
  tradePayoff: number;
  tradeEquity: number;
  cashDown: number;
  fees: number;
  backendProducts: number;
  taxes: number;
  amountFinanced: number;
  dueAtSigning: number;
  frontEndGross?: number;
  backEndGross?: number;
  financeReserve?: number;
  totalGross?: number;
}

function deriveStructureFinancials(structure: DealStructure): StructureFinancials {
  const dealerDiscounts = sum((structure.pricing.dealerDiscounts ?? []).map((line) => line.amount));
  const accessories = sum((structure.pricing.accessories ?? []).map((line) => line.amount));
  const fees = sum(structure.fees.map((fee) => fee.amount));
  const taxes = sum(structure.taxes.map((tax) => tax.amount));
  const backend = sum((structure.backendProducts ?? []).map((product) => product.price));

  const cashDownBreakdown = structure.cashDown
    ? [
        structure.cashDown.customerCash,
        structure.cashDown.manufacturerRebate,
        structure.cashDown.tradeEquity,
      ].filter((value): value is number => typeof value === 'number')
    : [];
  const cashDown = structure.cashDown?.total ?? sum(cashDownBreakdown);

  const tradeAllowance = structure.trade?.allowance ?? 0;
  const tradePayoff = structure.trade?.payoff ?? 0;
  const tradeEquity = structure.trade?.equity ?? roundToCents(tradeAllowance - tradePayoff);

  const basePrice = roundToCents(structure.pricing.salePrice - dealerDiscounts + accessories);
  const advanceValue = structure.pricing.msrp ?? structure.pricing.salePrice;

  const amountFinanced = roundToCents(basePrice - cashDown - tradeEquity + fees + taxes + backend);
  const dueAtSigning = roundToCents(Math.max(cashDown + fees + taxes, 0));

  return {
    basePrice,
    dealerDiscounts,
    accessories,
    fees,
    taxes,
    backend,
    cashDown,
    tradeAllowance,
    tradePayoff,
    tradeEquity,
    amountFinanced: Math.max(amountFinanced, 0),
    dueAtSigning,
    advanceValue: Math.max(roundToCents(advanceValue), 1),
  };
}

function buildPayment(amountFinanced: number, apr: number, termMonths: number, dueAtSigning: number): PaymentCalculation {
  const schedule = amortization({ amountFinanced, apr, term: termMonths });
  return {
    amountFinanced: roundToCents(amountFinanced),
    apr,
    termMonths: schedule.termInMonths,
    monthlyPayment: roundToCents(schedule.monthlyPayment),
    dueAtSigning: roundToCents(dueAtSigning),
  };
}

function buildTotals(structure: DealStructure, metrics: StructureFinancials, payment: PaymentCalculation): WorksheetTotalsSnapshot {
  return {
    salePrice: structure.pricing.salePrice,
    tradeAllowance: metrics.tradeAllowance,
    tradePayoff: metrics.tradePayoff,
    tradeEquity: metrics.tradeEquity,
    cashDown: metrics.cashDown,
    fees: metrics.fees,
    backendProducts: metrics.backend,
    taxes: metrics.taxes,
    amountFinanced: payment.amountFinanced,
    dueAtSigning: payment.dueAtSigning ?? metrics.dueAtSigning,
  };
}

function buildGross(
  structure: DealStructure,
  metrics: StructureFinancials,
  payment: PaymentCalculation,
  vehicleCost: VehicleCostProfile | null,
): GrossCalculation {
  const gross = calculateGross({
    sellingPrice: structure.pricing.salePrice,
    vehicleCost: vehicleCost?.cost ?? structure.pricing.salePrice * 0.88,
    pack: vehicleCost?.pack,
    overAllow: Math.max(metrics.tradePayoff - metrics.tradeAllowance, 0),
    tradeReserve: Math.max(metrics.tradeEquity, 0),
    amountFinanced: payment.amountFinanced,
    termMonths: payment.termMonths,
    rateMarkup: 0,
    participation: 1,
    backendProducts: (structure.backendProducts ?? []).map((product) => ({
      id: product.code,
      name: product.name,
      price: product.price,
      cost: product.cost ?? 0,
      participation: 1,
    })),
  });

  return {
    frontEnd: roundToCents(gross.frontGross),
    backEnd: roundToCents(gross.backendGross),
    financeReserve: roundToCents(gross.financeReserve),
    docFee: structure.fees.find((fee) => fee.code.toLowerCase().includes('doc'))?.amount,
    pack: vehicleCost?.pack ? roundToCents(vehicleCost.pack) : undefined,
    total: roundToCents(gross.totalGross),
  };
}

async function loadVehicleCost(
  tenantId: string,
  vehicle: { id?: string; vin?: string },
): Promise<VehicleCostProfile | null> {
  const where = vehicle.id
    ? { tenantId, id: vehicle.id }
    : vehicle.vin
      ? { tenantId, vin: vehicle.vin }
      : null;

  if (!where) {
    return null;
  }

  const record = await prisma.vehicle.findFirst({ where });

  if (!record) {
    return null;
  }

  const cost =
    decimalToNumber(record.acquisitionCost) ??
    decimalToNumber(record.invoiceCost) ??
    decimalToNumber(record.marketValue) ??
    decimalToNumber(record.msrp) ??
    0;

  const pack = decimalToNumber(record.reconActual) ?? decimalToNumber(record.reconEstimate) ?? undefined;

  return { cost, pack: pack ?? undefined };
}

function toMarketComparableSummary(summary: ReturnType<typeof getMarketData>): MarketDataContext {
  const contextSummary: MarketDataSummary = {
    sampleSize: summary.sampleSize,
    averagePrice: summary.averagePrice,
    medianPrice: summary.medianPrice,
    minPrice: summary.minPrice,
    maxPrice: summary.maxPrice,
    stdDeviation: summary.stdDeviation,
  };

  const rangeResult = competitiveRange(summary);
  const range: MarketDataRange = {
    floor: rangeResult.floor,
    target: rangeResult.target,
    ceiling: rangeResult.ceiling,
  };

  const comparables: MarketComparable[] = (summary.comparables as ComparableSale[]).map((sale) => ({
    vehicle: {
      vin: sale.vehicle.vin,
      year: sale.vehicle.year,
      make: sale.vehicle.make,
      model: sale.vehicle.model,
      trim: sale.vehicle.trim,
      segment: sale.vehicle.segment,
    },
    salePrice: sale.salePrice,
    saleDate: sale.saleDate instanceof Date ? sale.saleDate.toISOString() : sale.saleDate,
    daysInStock: sale.daysInStock,
    mileage: sale.mileage,
    source: sale.source,
  }));

  return {
    summary: contextSummary,
    competitiveRange: range,
    comparables,
  };
}

function toSimilarDealsContext(result: ReturnType<typeof findSimilarDeals>): SimilarDealsContext {
  const deals: SimilarDealSnapshot[] = result.deals.map((deal) => ({
    id: deal.id,
    status: deal.status,
    closeDate: deal.closeDate instanceof Date ? deal.closeDate.toISOString() : deal.closeDate,
    vehicle: {
      vin: deal.vehicle.vin,
      year: deal.vehicle.year,
      make: deal.vehicle.make,
      model: deal.vehicle.model,
      trim: deal.vehicle.trim,
    },
    frontGross: deal.frontGross,
    financeReserve: deal.financeReserve,
    totalGross: deal.totalGross,
  }));

  const metrics: SimilarDealMetrics = {
    sampleSize: result.metrics.sampleSize,
    averageFrontGross: result.metrics.averageFrontGross,
    averageReserve: result.metrics.averageReserve,
    averageTotalGross: result.metrics.averageTotalGross,
    closeRate: result.metrics.closeRate,
  };

  return { deals, metrics };
}

function buildRateSheetTier(
  lender: LenderProfile,
  program: { effectiveFrom: string; effectiveTo?: string },
  tier: { tier: string; apr: number; reserve?: number; maxTerm?: number },
  index: number,
  total: number,
): RateSheetTier {
  const minScore = lender.minCreditScore ?? 300;
  const maxScore = lender.maxCreditScore ?? 850;
  const span = Math.max(Math.floor((maxScore - minScore + 1) / total), 1);
  const lower = minScore + span * index;
  const upper = index === total - 1 ? maxScore : lower + span - 1;

  return {
    id: `${lender.id}:${tier.tier}:${index}`,
    tier: tier.tier as RateSheetTier['tier'],
    minScore: lower,
    maxScore: upper,
    buyRate: tier.apr,
    sellRate: tier.reserve != null ? tier.apr + tier.reserve * 100 : tier.apr,
    participation: tier.reserve ?? undefined,
    maxTermMonths: tier.maxTerm,
    maxReserve: tier.reserve ?? undefined,
    effectiveFrom: new Date(program.effectiveFrom),
    effectiveTo: program.effectiveTo ? new Date(program.effectiveTo) : undefined,
  };
}

function parseLenderProfiles(
  tenantId: string,
  records: Array<{
    id: string;
    name: string;
    apiCredentials: Prisma.JsonValue;
    isActive: boolean;
    maxLtv?: DecimalLike;
    maxTerm?: number;
    minCreditScore?: number | null;
    maxCreditScore?: number | null;
  }>,
): LenderProfile[] {
  return records.map<LenderProfile>((record) => {
    const credentials = (record.apiCredentials as {
      rateSheets?: Array<{
        effectiveFrom: string;
        effectiveTo?: string;
        tiers: Array<{ tier: string; apr: number; reserve?: number; maxTerm?: number }>;
      }>;
    }) ?? {};

    const sheets = (credentials.rateSheets ?? []).flatMap((sheet) =>
      (sheet.tiers ?? []).map((tier, index, array) =>
        buildRateSheetTier(
          {
            id: record.id,
            tenantId,
            name: record.name,
            status: record.isActive ? 'active' : 'inactive',
            rateSheets: [],
            maxReserve: undefined,
            maxLtv: decimalToNumber(record.maxLtv) ?? undefined,
            maxPti: undefined,
            maxTermMonths: record.maxTerm ?? undefined,
            minCreditScore: record.minCreditScore ?? undefined,
            maxCreditScore: record.maxCreditScore ?? undefined,
          },
          sheet,
          tier,
          index,
          array.length,
        ),
      ),
    );

    return {
      id: record.id,
      tenantId,
      name: record.name,
      status: record.isActive ? 'active' : 'inactive',
      rateSheets: sheets,
      maxReserve: undefined,
      maxLtv: decimalToNumber(record.maxLtv) ?? undefined,
      maxPti: undefined,
      maxTermMonths: record.maxTerm ?? undefined,
      minCreditScore: record.minCreditScore ?? undefined,
      maxCreditScore: record.maxCreditScore ?? undefined,
    } satisfies LenderProfile;
  });
}

function summarizeViolations(violations: LenderViolation[]): LenderCriteriaEntry['violations'] {
  return violations.map((violation) => ({
    code: violation.code,
    message: violation.message,
    limit: violation.limit,
    actual: violation.actual,
  }));
}

async function buildLenderCriteria(
  tenantId: string,
  request: OptimizationRequest,
  metrics: StructureFinancials,
): Promise<LenderCriteriaEntry[]> {
  const lenders = await prisma.lender.findMany({
    where: { tenantId, isActive: true },
    select: {
      id: true,
      name: true,
      apiCredentials: true,
      isActive: true,
      maxLtv: true,
      maxTerm: true,
      minCreditScore: true,
      maxCreditScore: true,
    },
  });

  if (lenders.length === 0) {
    return [];
  }

  const profiles = parseLenderProfiles(tenantId, lenders);
  const active = getActiveLenders(tenantId, profiles);

  const contextDeal = {
    amountFinanced: metrics.amountFinanced,
    advanceValue: metrics.advanceValue,
    monthlyPayment: request.currentPayment.monthlyPayment,
    termMonths: request.currentPayment.termMonths,
    reserveAmount: 0,
  } satisfies Parameters<typeof listViolations>[0]['deal'];

  const customer = {
    creditScore: request.customerProfile.creditScore,
    monthlyIncome: Math.max(request.customerProfile.monthlyIncome ?? 1, 1),
    monthlyDebt:
      request.customerProfile.debtToIncomeRatio && request.customerProfile.monthlyIncome
        ? request.customerProfile.debtToIncomeRatio * request.customerProfile.monthlyIncome
        : undefined,
  } satisfies Parameters<typeof listViolations>[0]['customer'];

  const entries: LenderCriteriaEntry[] = [];

  for (const lender of active) {
    let violations: LenderViolation[] = [];
    try {
      violations = listViolations({ customer, deal: contextDeal }, lender);
    } catch (error) {
      if (process.env.NODE_ENV !== 'test') {
        console.warn('Unable to evaluate lender criteria', { lenderId: lender.id, error });
      }
      violations = [];
    }

    entries.push({
      lenderId: lender.id,
      lenderName: lender.name,
      maxTermMonths: lender.maxTermMonths,
      maxLtv: lender.maxLtv,
      maxPti: lender.maxPti,
      tiers: lender.activeRateSheets.map((tier) => ({
        id: tier.id,
        tier: toCreditTier(tier.tier),
        minScore: tier.minScore,
        maxScore: tier.maxScore,
        buyRate: tier.buyRate,
        sellRate: tier.sellRate,
        participation: tier.participation,
        maxTermMonths: tier.maxTermMonths,
        maxReserve: tier.maxReserve,
      })),
      violations: summarizeViolations(violations),
    });
  }

  return entries;
}

async function createOptimizationVersion(
  tenantId: string,
  dealId: string,
  worksheetId: string,
  userId: string,
  structure: DealStructure,
  payment: PaymentCalculation,
  gross: GrossCalculation | null,
): Promise<VersionView> {
  const metrics = deriveStructureFinancials(structure);
  const totals = buildTotals(structure, metrics, payment);

  const version = await prisma.dealVersion.create({
    data: {
      tenantId,
      dealId,
      worksheetId,
      snapshot: toInputJson({ structure, totals, payment }),
      grossBreakdown: gross ? toInputJson(gross) : undefined,
      createdById: userId,
      label: 'AI Recommendation',
    },
  });

  await prisma.dealWorksheet.update({
    where: { id: worksheetId },
    data: { versionPointerId: version.id },
  });

  return {
    id: version.id,
    dealId: version.dealId,
    worksheetId: version.worksheetId,
    label: version.label,
    closeProbability: null,
    approvalProbability: null,
    aiScore: null,
    grossBreakdown: gross ?? null,
    createdAt: version.createdAt.toISOString(),
  } satisfies VersionView;
}

function ensureOptionMetrics(
  option: CounterOption,
  vehicleCost: VehicleCostProfile | null,
  fallbackPayment: PaymentCalculation,
): CounterOption {
  const metrics = deriveStructureFinancials(option.structure);
  const payment = option.payment ?? fallbackPayment;
  const normalizedPayment = buildPayment(
    payment.amountFinanced && payment.amountFinanced > 0
      ? payment.amountFinanced
      : metrics.amountFinanced,
    payment.apr ?? fallbackPayment.apr,
    payment.termMonths && payment.termMonths > 0 ? payment.termMonths : fallbackPayment.termMonths,
    metrics.dueAtSigning,
  );
  const gross = buildGross(option.structure, metrics, normalizedPayment, vehicleCost);
  return {
    ...option,
    payment: normalizedPayment,
    gross,
    rebuttalScript: generateRebuttal(option.label, normalizedPayment, gross, fallbackPayment),
  };
}

function generateRebuttal(
  label: string,
  payment: PaymentCalculation,
  gross: GrossCalculation,
  baseline: PaymentCalculation,
): string {
  const delta = payment.monthlyPayment - baseline.monthlyPayment;
  const change = delta === 0 ? 'matches your target payment' : delta > 0 ? `is $${Math.abs(delta).toFixed(2)} higher` : `saves $${Math.abs(delta).toFixed(2)}`;
  return `${label}: Payment ${change} with total gross of $${gross.total.toFixed(2)} keeps the deal approvable.`;
}

export async function optimizeDeal(params: {
  tenantId: string;
  dealId: string;
  userId: string;
  request: OptimizationRequest;
  requestId?: string;
  scoringOverride?: Partial<ScoringConfig['objectives']> | null;
}): Promise<{
  optimization: OptimizationView;
  recommendation: OptimizationResponse;
  version?: VersionView | null;
  traceId?: string;
}> {
  const { tenantId, dealId, userId, request, requestId, scoringOverride } = params;

  const vehicleContext = {
    vin: request.vehicle.vin,
    year: request.vehicle.year,
    make: request.vehicle.make,
    model: request.vehicle.model,
    trim: request.vehicle.trim,
  } satisfies VehicleDescriptor;

  const [vehicleCost, marketData, similarDeals] = await Promise.all([
    loadVehicleCost(tenantId, { id: request.vehicle.id, vin: request.vehicle.vin }),
    (async () => {
      const comparables = await prisma.marketComp.findMany({
        where: request.vehicle.id
          ? { tenantId, vehicleId: request.vehicle.id }
          : {
              tenantId,
              vehicle: {
                make: { equals: request.vehicle.make, mode: 'insensitive' },
                model: { equals: request.vehicle.model, mode: 'insensitive' },
              },
            },
        orderBy: { listedAt: 'desc' },
        take: 50,
      });

      const comparableSales: ComparableSale[] = comparables.map((comp) => ({
        vehicle: {
          vin: comp.compVin ?? undefined,
          year: comp.year ?? request.vehicle.year,
          make: comp.make ?? request.vehicle.make,
          model: comp.model ?? request.vehicle.model,
          trim: comp.trim ?? undefined,
          segment: undefined,
        },
        salePrice: decimalToNumber(comp.price) ?? request.vehicle.salePrice ?? request.structure.pricing.salePrice,
        saleDate: comp.listedAt ?? new Date(),
        daysInStock: comp.distance ?? undefined,
        mileage: comp.mileage ?? undefined,
        source: comp.source ?? undefined,
      }));

      const summary = getMarketData(vehicleContext, comparableSales);
      return toMarketComparableSummary({ ...summary, comparables: comparableSales });
    })(),
    (async () => {
      const deals = await prisma.deal.findMany({
        where: {
          tenantId,
          status: { in: RETAIL_CLOSED_STATUSES },
          vehicle: {
            make: { equals: request.vehicle.make, mode: 'insensitive' },
            model: { equals: request.vehicle.model, mode: 'insensitive' },
          },
        },
        include: { vehicle: true },
        orderBy: { dealDate: 'desc' },
        take: 100,
      });

      const snapshots: DealSnapshot[] = deals.map((deal) => ({
        id: deal.id,
        status: 'closed',
        closeDate: deal.dealDate,
        vehicle: {
          vin: deal.vehicle.vin,
          year: deal.vehicle.year,
          make: deal.vehicle.make,
          model: deal.vehicle.model,
          trim: deal.vehicle.trim ?? undefined,
        },
        frontGross: decimalToNumber(deal.frontEndGross) ?? 0,
        financeReserve: decimalToNumber(deal.dealerReserve) ?? 0,
        totalGross: decimalToNumber(deal.totalGross) ?? undefined,
      }));

      const result = findSimilarDeals(vehicleContext, snapshots);
      return toSimilarDealsContext(result);
    })(),
  ]);

  const structureMetrics = deriveStructureFinancials(request.structure);
  const lenderCriteria = await buildLenderCriteria(tenantId, request, structureMetrics);

  const scoringConfig = getScoringConfig();
  const effectiveObjectives = normalizeObjectiveWeights(scoringConfig.objectives, scoringOverride ?? undefined);
  const scoringSnapshot = structuredClone(scoringConfig) as ScoringConfig;
  scoringSnapshot.objectives = effectiveObjectives;

  const payload: OptimizationPayload = {
    ...request,
    ...(scoringOverride ? { scoringOverride: scoringSnapshot.objectives } : {}),
    marketData,
    similarDeals,
    lenderCriteria,
    scoringConfig: scoringSnapshot,
  };

  const { result, traceId } = await mlService.optimizeDeal(payload, { tenantId, requestId });

  const recommendedMetrics = deriveStructureFinancials(result.recommendedStructure);
  const recommendedPayment = buildPayment(
    recommendedMetrics.amountFinanced,
    request.currentPayment.apr,
    request.currentPayment.termMonths,
    recommendedMetrics.dueAtSigning,
  );
  const recommendedGross = buildGross(result.recommendedStructure, recommendedMetrics, recommendedPayment, vehicleCost);

  const alternatives = result.alternatives.map((alternative) => {
    const metrics = deriveStructureFinancials(alternative.structure);
    const payment = buildPayment(
      alternative.payment.amountFinanced ?? metrics.amountFinanced,
      alternative.payment.apr ?? request.currentPayment.apr,
      alternative.payment.termMonths ?? request.currentPayment.termMonths,
      metrics.dueAtSigning,
    );
    const gross = buildGross(alternative.structure, metrics, payment, vehicleCost);
    return {
      ...alternative,
      payment,
      gross,
    };
  });

  const enrichedResponse: OptimizationResponse = {
    ...result,
    worksheetId: result.worksheetId ?? request.worksheetId ?? '',
    versionId: result.versionId,
    recommendedStructure: result.recommendedStructure,
    projectedGross: recommendedGross,
    alternatives,
  };

  let version: VersionView | null = null;

  if (request.worksheetId) {
    version = await createOptimizationVersion(
      tenantId,
      dealId,
      request.worksheetId,
      userId,
      result.recommendedStructure,
      recommendedPayment,
      recommendedGross,
    );
    enrichedResponse.versionId = version.id;
  }

  if (traceId) {
    console.info('ML optimizeDeal trace', { tenantId, dealId, traceId });
  }

  const optimization = await recordOptimization(tenantId, dealId, userId, request, enrichedResponse, traceId);

  return { optimization, recommendation: enrichedResponse, version, traceId };
}

export async function analyzeCounter(params: {
  tenantId: string;
  dealId: string;
  userId: string;
  request: CounterAnalysisRequest;
  requestId?: string;
}): Promise<{
  counter: Awaited<ReturnType<typeof recordCounterOffer>>;
  analysis: CounterAnalysisResponse;
  traceId?: string;
}> {
  const { tenantId, dealId, userId, request, requestId } = params;

  const version = await prisma.dealVersion.findFirst({
    where: { tenantId, dealId, id: request.versionId },
  });

  if (!version) {
    throw new Error('Base version not found for counter analysis.');
  }

  const snapshot = parseWorksheetSnapshot(version.snapshot);
  if (!snapshot) {
    throw new Error('Stored version snapshot is missing desking data.');
  }

  const worksheet = request.worksheetId
    ? await prisma.dealWorksheet.findFirst({
        where: { tenantId, id: request.worksheetId },
        include: { vehicle: true },
      })
    : null;

  const vehicleLookup = worksheet
    ? { id: worksheet.vehicleId }
    : { id: snapshot.structure.trade?.vehicle?.id, vin: snapshot.structure.trade?.vehicle?.vin };

  const vehicleCost = await loadVehicleCost(tenantId, vehicleLookup);

  const vehicleContext: VehicleDescriptor = {
    vin: worksheet?.vehicle?.vin ?? snapshot.structure.trade?.vehicle?.vin ?? '',
    year:
      worksheet?.vehicle?.year ??
      snapshot.structure.trade?.vehicle?.year ??
      request.customerInput.requestedTerm ??
      new Date().getFullYear(),
    make: worksheet?.vehicle?.make ?? snapshot.structure.trade?.vehicle?.make ?? request.customerInput.customerConcern,
    model: worksheet?.vehicle?.model ?? snapshot.structure.trade?.vehicle?.model ?? 'Vehicle',
    trim: worksheet?.vehicle?.trim ?? snapshot.structure.trade?.vehicle?.trim ?? undefined,
  };

  const comparables = await prisma.marketComp.findMany({
    where: worksheet
      ? { tenantId, vehicleId: worksheet.vehicleId }
      : { tenantId, vehicle: { make: { equals: vehicleContext.make, mode: 'insensitive' } } },
    orderBy: { listedAt: 'desc' },
    take: 50,
  });

  const comparableSales: ComparableSale[] = comparables.map((comp) => ({
    vehicle: {
      vin: comp.compVin ?? undefined,
      year: comp.year ?? vehicleContext.year,
      make: comp.make ?? vehicleContext.make,
      model: comp.model ?? vehicleContext.model,
      trim: comp.trim ?? undefined,
      segment: undefined,
    },
    salePrice: decimalToNumber(comp.price) ?? snapshot.structure.pricing.salePrice,
    saleDate: comp.listedAt ?? new Date(),
    daysInStock: comp.distance ?? undefined,
    mileage: comp.mileage ?? undefined,
    source: comp.source ?? undefined,
  }));

  const marketSummary = toMarketComparableSummary({ ...getMarketData(vehicleContext, comparableSales), comparables: comparableSales });

  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      status: { in: RETAIL_CLOSED_STATUSES },
      vehicle: worksheet
        ? { id: worksheet.vehicleId }
        : { make: { equals: vehicleContext.make, mode: 'insensitive' }, model: { equals: vehicleContext.model, mode: 'insensitive' } },
    },
    include: { vehicle: true },
    orderBy: { dealDate: 'desc' },
    take: 100,
  });

  const similarSnapshots: DealSnapshot[] = deals.map((deal) => ({
    id: deal.id,
    status: 'closed',
    closeDate: deal.dealDate,
    vehicle: {
      vin: deal.vehicle.vin,
      year: deal.vehicle.year,
      make: deal.vehicle.make,
      model: deal.vehicle.model,
      trim: deal.vehicle.trim ?? undefined,
    },
    frontGross: decimalToNumber(deal.frontEndGross) ?? 0,
    financeReserve: decimalToNumber(deal.dealerReserve) ?? 0,
    totalGross: decimalToNumber(deal.totalGross) ?? undefined,
  }));

  const similarContext = toSimilarDealsContext(findSimilarDeals(vehicleContext, similarSnapshots));

  const payload: CounterAnalysisPayload = {
    ...request,
    originalStructure: snapshot.structure,
    originalPayment: snapshot.payment,
    originalGross: parseGrossSnapshot(version.grossBreakdown),
    marketData: marketSummary,
    similarDeals: similarContext,
  };

  const { result, traceId } = await mlService.analyzeCounter(payload, { tenantId, requestId });

  const normalizedOptions = result.options.map((option) => ensureOptionMetrics(option, vehicleCost, snapshot.payment));
  const analysis: CounterAnalysisResponse = {
    ...result,
    options: normalizedOptions.map((option) => ({
      ...option,
      rebuttalScript: generateRebuttal(option.label, option.payment, option.gross, snapshot.payment),
    })),
  };

  if (!analysis.recommendedOptionId && analysis.options.length > 0) {
    analysis.recommendedOptionId = analysis.options[0].id;
  }

  if (traceId) {
    console.info('ML analyzeCounter trace', { tenantId, dealId, traceId });
  }

  const counter = await recordCounterOffer(tenantId, dealId, userId, request, analysis);

  return { counter, analysis, traceId };
}

