export interface RateSheetTier {
  id: string;
  tier: string;
  minScore: number;
  maxScore?: number;
  buyRate: number;
  sellRate: number;
  participation?: number;
  maxTermMonths?: number;
  maxLtv?: number;
  maxPti?: number;
  maxReserve?: number;
  effectiveFrom: Date | string;
  effectiveTo?: Date | string;
}

export interface LenderProfile {
  id: string;
  tenantId: string;
  name: string;
  status?: 'active' | 'inactive';
  rateSheets: RateSheetTier[];
  maxReserve?: number;
  maxLtv?: number;
  maxPti?: number;
  maxTermMonths?: number;
  minCreditScore?: number;
  maxCreditScore?: number;
}

export interface CustomerProfile {
  creditScore: number;
  monthlyIncome: number;
  monthlyDebt?: number;
}

export interface DealStructure {
  amountFinanced: number;
  advanceValue: number;
  monthlyPayment: number;
  termMonths: number;
  reserveAmount?: number;
}

export interface LenderApplicationContext {
  customer: CustomerProfile;
  deal: DealStructure;
}

export interface ActiveLender extends LenderProfile {
  activeRateSheets: RateSheetTier[];
}

export type LenderViolationCode = 'TIER' | 'TERM' | 'LTV' | 'PTI' | 'RESERVE';

export interface LenderViolation {
  code: LenderViolationCode;
  message: string;
  limit?: number;
  actual?: number;
}

const roundToCents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const toDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return value;
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    throw new RangeError(`Invalid date supplied: ${value}`);
  }
  return parsed;
};

const isRateSheetActive = (tier: RateSheetTier, asOfDate: Date): boolean => {
  const effectiveFrom = toDate(tier.effectiveFrom);
  if (effectiveFrom > asOfDate) {
    return false;
  }
  if (!tier.effectiveTo) {
    return true;
  }
  return toDate(tier.effectiveTo) >= asOfDate;
};

export const getActiveLenders = (
  tenantId: string,
  lenders: LenderProfile[],
  asOf: Date = new Date()
): ActiveLender[] => {
  return lenders
    .filter((lender) => lender.tenantId === tenantId && lender.status !== 'inactive')
    .map<ActiveLender>((lender) => ({
      ...lender,
      activeRateSheets: lender.rateSheets.filter((tier) => isRateSheetActive(tier, asOf)),
    }))
    .filter((lender) => lender.activeRateSheets.length > 0);
};

export const computeTier = (customer: CustomerProfile, lender: ActiveLender): RateSheetTier | null => {
  const sorted = [...lender.activeRateSheets].sort((a, b) => b.minScore - a.minScore);
  return (
    sorted.find((tier) => {
      if (customer.creditScore < tier.minScore) {
        return false;
      }
      if (tier.maxScore !== undefined && customer.creditScore > tier.maxScore) {
        return false;
      }
      return true;
    }) ?? null
  );
};

const DEFAULT_MAX_RESERVE_RATIO = 0.1;
const DEFAULT_MAX_LTV = 1.25;
const DEFAULT_MAX_PTI = 0.2;

export const maxReserve = (
  deal: DealStructure,
  lender: ActiveLender,
  tier: RateSheetTier | null
): number => {
  if (!Number.isFinite(deal.amountFinanced) || deal.amountFinanced < 0) {
    throw new RangeError('amountFinanced must be a non-negative finite number');
  }

  const reserveLimit = Math.min(
    lender.maxReserve ?? Number.POSITIVE_INFINITY,
    tier?.maxReserve ?? Number.POSITIVE_INFINITY,
    deal.amountFinanced * DEFAULT_MAX_RESERVE_RATIO
  );

  if (!Number.isFinite(reserveLimit)) {
    return Number.POSITIVE_INFINITY;
  }

  return roundToCents(Math.max(reserveLimit, 0));
};

export const maxLTV = (lender: ActiveLender, tier: RateSheetTier | null): number => {
  const limit = Math.min(
    lender.maxLtv ?? Number.POSITIVE_INFINITY,
    tier?.maxLtv ?? Number.POSITIVE_INFINITY,
    DEFAULT_MAX_LTV
  );

  if (!Number.isFinite(limit)) {
    return DEFAULT_MAX_LTV;
  }
  return Math.max(limit, 0);
};

export const maxPTI = (lender: ActiveLender, tier: RateSheetTier | null): number => {
  const limit = Math.min(
    lender.maxPti ?? Number.POSITIVE_INFINITY,
    tier?.maxPti ?? Number.POSITIVE_INFINITY,
    DEFAULT_MAX_PTI
  );

  if (!Number.isFinite(limit)) {
    return DEFAULT_MAX_PTI;
  }
  return Math.max(limit, 0);
};

export const listViolations = (
  context: LenderApplicationContext,
  lender: ActiveLender
): LenderViolation[] => {
  const violations: LenderViolation[] = [];
  const tier = computeTier(context.customer, lender);

  if (!tier) {
    violations.push({ code: 'TIER', message: 'Customer does not qualify for any active tier' });
    return violations;
  }

  const termLimit = tier.maxTermMonths ?? lender.maxTermMonths;
  if (termLimit !== undefined && context.deal.termMonths > termLimit) {
    violations.push({
      code: 'TERM',
      message: `Requested term exceeds lender maximum of ${termLimit} months`,
      limit: termLimit,
      actual: context.deal.termMonths,
    });
  }

  if (!Number.isFinite(context.deal.advanceValue) || context.deal.advanceValue <= 0) {
    throw new RangeError('advanceValue must be a positive finite number');
  }

  const ltvLimit = maxLTV(lender, tier);
  const ltv = context.deal.amountFinanced / context.deal.advanceValue;
  if (ltvLimit > 0 && ltv > ltvLimit) {
    violations.push({
      code: 'LTV',
      message: `Requested structure exceeds LTV limit of ${(ltvLimit * 100).toFixed(1)}%`,
      limit: ltvLimit,
      actual: Math.round((ltv + Number.EPSILON) * 10000) / 10000,
    });
  }

  if (!Number.isFinite(context.customer.monthlyIncome) || context.customer.monthlyIncome <= 0) {
    throw new RangeError('monthlyIncome must be a positive finite number');
  }

  const ptiLimit = maxPTI(lender, tier);
  const pti = context.deal.monthlyPayment / context.customer.monthlyIncome;
  if (ptiLimit > 0 && pti > ptiLimit) {
    violations.push({
      code: 'PTI',
      message: `Payment to income ratio exceeds ${(ptiLimit * 100).toFixed(1)}% limit`,
      limit: ptiLimit,
      actual: Math.round((pti + Number.EPSILON) * 10000) / 10000,
    });
  }

  if (context.deal.reserveAmount !== undefined) {
    const reserveLimit = maxReserve(context.deal, lender, tier);
    if (Number.isFinite(reserveLimit) && context.deal.reserveAmount > reserveLimit) {
      violations.push({
        code: 'RESERVE',
        message: 'Requested reserve exceeds lender maximum',
        limit: reserveLimit,
        actual: roundToCents(context.deal.reserveAmount),
      });
    }
  }

  return violations;
};

export const isStructureEligible = (
  context: LenderApplicationContext,
  lender: ActiveLender
): boolean => {
  return listViolations(context, lender).length === 0;
};
