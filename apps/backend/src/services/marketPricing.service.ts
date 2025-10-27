export interface VehicleDescriptor {
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  segment?: string;
}

export interface ComparableSale {
  vehicle: VehicleDescriptor;
  salePrice: number;
  saleDate: Date | string;
  daysInStock?: number;
  mileage?: number;
  source?: string;
}

export interface MarketDataOptions {
  windowDays?: number;
  yearVariance?: number;
  asOfDate?: Date;
}

export interface MarketDataSummary {
  sampleSize: number;
  averagePrice: number;
  medianPrice: number;
  minPrice: number;
  maxPrice: number;
  stdDeviation: number;
  comparables: ComparableSale[];
}

export interface CompetitiveRangeResult {
  floor: number;
  target: number;
  ceiling: number;
}

export interface AgingAdjustmentResult {
  adjustmentPercent: number;
  adjustmentAmount: number;
  adjustedPrice: number;
}

export interface MarkdownSuggestionOptions {
  agingBands?: AgingBand[];
}

export interface MarkdownSuggestionResult {
  suggestedPrice: number;
  markdownAmount: number;
  competitiveRange: CompetitiveRangeResult;
  agingAdjustment: AgingAdjustmentResult;
}

export interface AgingBand {
  maxDays: number;
  adjustmentPercent: number;
}

const roundToCents = (value: number): number => Math.round((value + Number.EPSILON) * 100) / 100;

const defaultAgingBands: AgingBand[] = [
  { maxDays: 30, adjustmentPercent: 0 },
  { maxDays: 45, adjustmentPercent: -0.01 },
  { maxDays: 60, adjustmentPercent: -0.02 },
  { maxDays: 90, adjustmentPercent: -0.03 },
  { maxDays: Number.POSITIVE_INFINITY, adjustmentPercent: -0.05 },
];

const toDate = (value: Date | string): Date => {
  if (value instanceof Date) {
    return value;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    throw new RangeError(`Invalid date value: ${value}`);
  }
  return date;
};

const daysBetween = (start: Date, end: Date): number => {
  const diff = start.getTime() - end.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
};

const calculateAverage = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  const sum = values.reduce((total, value) => total + value, 0);
  return sum / values.length;
};

const calculateMedian = (values: number[]): number => {
  if (values.length === 0) {
    return 0;
  }
  const sorted = [...values].sort((a, b) => a - b);
  const midpoint = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 0) {
    return (sorted[midpoint - 1] + sorted[midpoint]) / 2;
  }
  return sorted[midpoint];
};

const calculateStdDeviation = (values: number[], average: number): number => {
  if (values.length <= 1) {
    return 0;
  }
  const variance = values.reduce((total, value) => total + Math.pow(value - average, 2), 0) / values.length;
  return Math.sqrt(variance);
};

const matchesVehicle = (subject: VehicleDescriptor, comparable: VehicleDescriptor, yearVariance: number): boolean => {
  if (subject.make.toLowerCase() !== comparable.make.toLowerCase()) {
    return false;
  }
  if (subject.model.toLowerCase() !== comparable.model.toLowerCase()) {
    return false;
  }
  if (Math.abs(subject.year - comparable.year) > yearVariance) {
    return false;
  }
  if (subject.segment && comparable.segment && subject.segment.toLowerCase() !== comparable.segment.toLowerCase()) {
    return false;
  }
  return true;
};

export const getMarketData = (
  vehicle: VehicleDescriptor,
  comparables: ComparableSale[],
  options: MarketDataOptions = {}
): MarketDataSummary => {
  const windowDays = options.windowDays ?? 30;
  const yearVariance = options.yearVariance ?? 1;
  const asOfDate = options.asOfDate ?? new Date();

  const filtered = comparables.filter((sale) => {
    const saleDate = toDate(sale.saleDate);
    const age = daysBetween(asOfDate, saleDate);
    if (age < 0 || age > windowDays) {
      return false;
    }
    return matchesVehicle(vehicle, sale.vehicle, yearVariance);
  });

  const prices = filtered.map((sale) => sale.salePrice).filter((price) => Number.isFinite(price));
  const average = calculateAverage(prices);
  const median = calculateMedian(prices);
  const stdDeviation = calculateStdDeviation(prices, average);
  const min = prices.length > 0 ? Math.min(...prices) : 0;
  const max = prices.length > 0 ? Math.max(...prices) : 0;

  return {
    sampleSize: filtered.length,
    averagePrice: roundToCents(average),
    medianPrice: roundToCents(median),
    minPrice: roundToCents(min),
    maxPrice: roundToCents(max),
    stdDeviation: roundToCents(stdDeviation),
    comparables: filtered,
  };
};

export const competitiveRange = (summary: MarketDataSummary): CompetitiveRangeResult => {
  if (summary.sampleSize === 0) {
    return { floor: 0, target: 0, ceiling: 0 };
  }

  const spread = summary.stdDeviation || (summary.maxPrice - summary.minPrice) / 4 || summary.medianPrice * 0.02;
  const floor = Math.max(summary.minPrice, summary.medianPrice - spread);
  const ceiling = Math.min(summary.maxPrice || summary.medianPrice + spread, summary.medianPrice + spread);

  return {
    floor: roundToCents(floor),
    target: roundToCents(summary.medianPrice),
    ceiling: roundToCents(Math.max(ceiling, summary.medianPrice)),
  };
};

export const agingAdjustments = (
  daysInStock: number,
  basePrice: number,
  options?: MarkdownSuggestionOptions
): AgingAdjustmentResult => {
  if (!Number.isFinite(daysInStock) || daysInStock < 0) {
    throw new RangeError('daysInStock must be a non-negative finite number');
  }
  if (!Number.isFinite(basePrice) || basePrice < 0) {
    throw new RangeError('basePrice must be a non-negative finite number');
  }

  const bands = options?.agingBands ?? defaultAgingBands;
  const band = bands.find((entry) => daysInStock <= entry.maxDays) ?? bands[bands.length - 1];
  const percent = band.adjustmentPercent;
  const adjustedPrice = roundToCents(basePrice * (1 + percent));

  return {
    adjustmentPercent: Math.round((percent + Number.EPSILON) * 10000) / 10000,
    adjustmentAmount: roundToCents(adjustedPrice - basePrice),
    adjustedPrice,
  };
};

export const markdownSuggestions = (
  currentPrice: number,
  marketSummary: MarketDataSummary,
  daysInStock: number,
  options?: MarkdownSuggestionOptions
): MarkdownSuggestionResult => {
  if (!Number.isFinite(currentPrice) || currentPrice < 0) {
    throw new RangeError('currentPrice must be a non-negative finite number');
  }

  const range = competitiveRange(marketSummary);
  if (marketSummary.sampleSize === 0) {
    const adjustment = agingAdjustments(daysInStock, currentPrice, options);
    return {
      suggestedPrice: roundToCents(Math.min(currentPrice, adjustment.adjustedPrice)),
      markdownAmount: roundToCents(currentPrice - Math.min(currentPrice, adjustment.adjustedPrice)),
      competitiveRange: range,
      agingAdjustment: adjustment,
    };
  }

  const adjustmentBase = range.target || marketSummary.averagePrice;
  const aging = agingAdjustments(daysInStock, adjustmentBase, options);
  const suggestedPrice = roundToCents(Math.min(range.ceiling, Math.max(range.floor, aging.adjustedPrice)));
  const markdownAmount = roundToCents(Math.max(currentPrice - suggestedPrice, 0));

  return {
    suggestedPrice,
    markdownAmount,
    competitiveRange: range,
    agingAdjustment: aging,
  };
};
