import type { VehicleDescriptor } from './marketPricing.service.js';

export type DealStatus = 'closed' | 'lost' | 'pending';

export interface DealSnapshot {
  id: string;
  status: DealStatus;
  closeDate: Date | string;
  vehicle: VehicleDescriptor;
  frontGross: number;
  financeReserve: number;
  totalGross?: number;
}

export interface SimilarDealsOptions {
  windowDays?: number;
  yearVariance?: number;
}

export interface SimilarDealsMetrics {
  sampleSize: number;
  averageFrontGross: number;
  averageReserve: number;
  averageTotalGross: number;
  closeRate: number;
}

export interface SimilarDealsResult {
  deals: DealSnapshot[];
  metrics: SimilarDealsMetrics;
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

const daysBetween = (start: Date, end: Date): number => {
  const diff = start.getTime() - end.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const matchesVehicleClass = (
  target: VehicleDescriptor,
  candidate: VehicleDescriptor,
  yearVariance: number
): boolean => {
  if (target.make.toLowerCase() !== candidate.make.toLowerCase()) {
    return false;
  }
  if (target.model.toLowerCase() !== candidate.model.toLowerCase()) {
    return false;
  }
  return Math.abs(target.year - candidate.year) <= yearVariance;
};

const average = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};

export const findSimilarDeals = (
  vehicle: VehicleDescriptor,
  deals: DealSnapshot[],
  options: SimilarDealsOptions = {},
  asOf: Date = new Date()
): SimilarDealsResult => {
  const windowDays = options.windowDays ?? 90;
  const yearVariance = options.yearVariance ?? 2;

  const relevantDeals = deals.filter((deal) => {
    const closeDate = toDate(deal.closeDate);
    const age = daysBetween(asOf, closeDate);
    if (age < 0 || age > windowDays) {
      return false;
    }
    return matchesVehicleClass(vehicle, deal.vehicle, yearVariance);
  });

  const closedDeals = relevantDeals.filter((deal) => deal.status === 'closed');
  const opportunityCount = relevantDeals.filter((deal) => deal.status === 'closed' || deal.status === 'lost').length;
  const closeRate = opportunityCount === 0 ? 0 : closedDeals.length / opportunityCount;

  const frontGrossAvg = average(closedDeals.map((deal) => deal.frontGross));
  const reserveAvg = average(closedDeals.map((deal) => deal.financeReserve));
  const totalGrossAvg = average(closedDeals.map((deal) => deal.totalGross ?? deal.frontGross + deal.financeReserve));

  return {
    deals: closedDeals,
    metrics: {
      sampleSize: closedDeals.length,
      averageFrontGross: roundToCents(frontGrossAvg),
      averageReserve: roundToCents(reserveAvg),
      averageTotalGross: roundToCents(totalGrossAvg),
      closeRate: Math.round((closeRate + Number.EPSILON) * 10000) / 10000,
    },
  };
};
