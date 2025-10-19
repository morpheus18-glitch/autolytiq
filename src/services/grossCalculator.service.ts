export interface BackendProductSelection {
  id: string;
  name: string;
  price: number;
  cost?: number;
  participation?: number;
}

export interface DealGrossInput {
  sellingPrice: number;
  vehicleCost: number;
  pack?: number;
  overAllow?: number;
  tradeReserve?: number;
  amountFinanced?: number;
  rateMarkup?: number;
  termMonths?: number;
  participation?: number;
  backendProducts?: BackendProductSelection[];
}

export interface BackendProductBreakdown {
  id: string;
  name: string;
  revenue: number;
  cost: number;
  gross: number;
}

export interface GrossTotals {
  frontGross: number;
  financeReserve: number;
  backendGross: number;
  totalGross: number;
  totalRevenue: number;
  totalCost: number;
}

export interface GrossBreakdown extends GrossTotals {
  backendProducts: BackendProductBreakdown[];
}

const roundToCents = (value: number): number => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const sum = (values: number[]): number => values.reduce((total, value) => total + value, 0);

const ensureNonNegative = (value: number | undefined, label: string): number => {
  if (value === undefined) {
    return 0;
  }
  if (!Number.isFinite(value) || value < 0) {
    throw new RangeError(`${label} must be a non-negative finite number`);
  }
  return value;
};

const normalizePercentage = (value: number | undefined, fallback = 0): number => {
  if (value === undefined) {
    return fallback;
  }
  if (!Number.isFinite(value)) {
    throw new RangeError('Percentage inputs must be finite numbers');
  }
  return value;
};

export const calculateFinanceReserve = (
  amountFinanced: number,
  markup: number,
  termMonths: number,
  participation: number
): number => {
  if (!Number.isFinite(amountFinanced) || amountFinanced < 0) {
    throw new RangeError('amountFinanced must be a non-negative finite number');
  }
  if (!Number.isFinite(termMonths) || termMonths <= 0) {
    return 0;
  }

  const normalizedParticipation = Math.min(Math.max(participation, 0), 1);
  const reserve = amountFinanced * (markup / 100) * (termMonths / 12) * normalizedParticipation;
  return roundToCents(Math.max(reserve, 0));
};

export const calculateGross = (input: DealGrossInput): GrossBreakdown => {
  const sellingPrice = ensureNonNegative(input.sellingPrice, 'sellingPrice');
  const vehicleCost = ensureNonNegative(input.vehicleCost, 'vehicleCost');
  const pack = ensureNonNegative(input.pack, 'pack');
  const overAllow = ensureNonNegative(input.overAllow, 'overAllow');
  const tradeReserve = ensureNonNegative(input.tradeReserve, 'tradeReserve');
  const amountFinanced = input.amountFinanced ?? sellingPrice;
  if (!Number.isFinite(amountFinanced) || amountFinanced < 0) {
    throw new RangeError('amountFinanced must be a non-negative finite number');
  }

  const frontGross = roundToCents(
    sellingPrice - vehicleCost - pack - overAllow + tradeReserve
  );

  const termMonths = input.termMonths ?? 0;
  const rateMarkup = normalizePercentage(input.rateMarkup);
  const participation = input.participation ?? 1;
  const financeReserve = calculateFinanceReserve(amountFinanced, rateMarkup, termMonths, participation);

  const backendProducts = (input.backendProducts ?? []).map<BackendProductBreakdown>((product) => {
    const revenue = ensureNonNegative(product.price, `backend product ${product.name} price`);
    const cost = ensureNonNegative(product.cost, `backend product ${product.name} cost`);
    const effectiveParticipation = product.participation ?? 1;
    const recognizedRevenue = revenue * effectiveParticipation;
    const recognizedCost = cost * effectiveParticipation;
    const gross = roundToCents(recognizedRevenue - recognizedCost);
    return {
      id: product.id,
      name: product.name,
      revenue: roundToCents(recognizedRevenue),
      cost: roundToCents(recognizedCost),
      gross,
    };
  });

  const backendGross = roundToCents(sum(backendProducts.map((product) => product.gross)));
  const backendRevenue = roundToCents(sum(backendProducts.map((product) => product.revenue)));
  const backendCost = roundToCents(sum(backendProducts.map((product) => product.cost)));

  const totalGross = roundToCents(frontGross + financeReserve + backendGross);
  const totalRevenue = roundToCents(sellingPrice + backendRevenue + financeReserve + tradeReserve);
  const totalCost = roundToCents(vehicleCost + pack + overAllow + backendCost);

  return {
    frontGross,
    financeReserve,
    backendGross,
    totalGross,
    totalRevenue,
    totalCost,
    backendProducts,
  };
};
