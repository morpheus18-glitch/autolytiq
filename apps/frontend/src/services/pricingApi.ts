/**
 * Pricing API Client
 *
 * REST API client for Rust-powered pricing calculations
 * Connects to Node.js backend which bridges to Rust gRPC service
 */

const API_BASE = '/api/pricing';

export interface PaymentCalculationRequest {
  amountFinanced: number;
  apr: number;
  termMonths: number;
  grossMonthlyIncome?: number;
  totalMonthlyDebt?: number;
}

export interface PaymentCalculationResponse {
  monthlyPayment: number;
  totalInterest: number;
  totalPayment: number;
  ptiRatio?: number;
  dtiRatio?: number;
  amortizationSchedule: Array<{
    paymentNumber: number;
    paymentAmount: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
}

export interface GrossCalculationRequest {
  vehiclePrice: number;
  vehicleCost: number;
  pack?: number;
  tradeValue?: number;
  tradePayoff?: number;
  tradeAllowance?: number;
  rateMarkup?: number;
  termMonths?: number;
  amountFinanced?: number;
  participation?: number;
  products?: Array<{
    type: string;
    price: number;
    cost: number;
    participation: number;
  }>;
}

export interface GrossCalculationResponse {
  frontEndGross: number;
  tradeReserve: number;
  totalFrontGross: number;
  financeReserve: number;
  backEndGross: number;
  productProfits: Array<{
    type: string;
    sellingPrice: number;
    cost: number;
    profit: number;
    participation: number;
  }>;
  totalGross: number;
  grossPercentage: number;
}

export interface MarketDataRequest {
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  zipCode?: string;
  radiusMiles?: number;
  timeWindowDays?: number;
}

export interface MarketDataResponse {
  competitiveRange: {
    floorPrice: number;
    targetPrice: number;
    ceilingPrice: number;
    averagePrice: number;
    compCount: number;
    daysToSaleAvg: number;
  } | null;
  comparables: Array<{
    id: string;
    vin: string;
    year: number;
    make: string;
    model: string;
    trim: string;
    mileage: number;
    price: number;
    daysOnMarket: number;
    saleDate: string;
    source: string;
    matchScore: number;
  }>;
  statistics: {
    totalCompsFound: number;
    compsUsed: number;
    priceStdDev: number;
    mileageStdDev: number;
    pricePerMile: number;
  } | null;
}

/**
 * Calculate payment details using Rust service
 */
export async function calculatePayment(
  params: PaymentCalculationRequest,
  signal?: AbortSignal
): Promise<PaymentCalculationResponse> {
  const response = await fetch(`${API_BASE}/calculate-payment`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || 'Failed to calculate payment');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Calculate gross profit breakdown using Rust service
 */
export async function calculateGross(
  params: GrossCalculationRequest,
  signal?: AbortSignal
): Promise<GrossCalculationResponse> {
  const response = await fetch(`${API_BASE}/calculate-gross`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || 'Failed to calculate gross');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Get market data and competitive pricing
 */
export async function getMarketData(
  params: MarketDataRequest,
  signal?: AbortSignal
): Promise<MarketDataResponse> {
  const response = await fetch(`${API_BASE}/market-data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(params),
    signal,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.message || error.error || 'Failed to get market data');
  }

  const result = await response.json();
  return result.data;
}

/**
 * Health check for pricing service
 */
export async function checkPricingServiceHealth(): Promise<{
  success: boolean;
  status: string;
  message: string;
  sampleCalculation?: { monthlyPayment: number };
}> {
  const response = await fetch(`${API_BASE}/health`, {
    method: 'GET',
  });

  return response.json();
}
