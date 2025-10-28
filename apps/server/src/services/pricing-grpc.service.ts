/**
 * Pricing Service gRPC Client
 * High-performance pricing calculations via Rust microservice
 */

import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { join } from 'path';

const PROTO_PATH = join(__dirname, '../../../services/rust/proto/price_engine.proto');
const PRICING_SERVICE_URL = process.env.PRICING_GRPC_ADDR || 'localhost:50051';
const PRICING_TIMEOUT_MS = 5000; // 5s timeout

// Load proto with all dependencies
const packageDefinition = protoLoader.loadSync(
  [PROTO_PATH, join(__dirname, '../../../services/rust/proto/common.proto')],
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true,
    includeDirs: [join(__dirname, '../../../services/rust/proto')],
  }
);

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const pricingProto = protoDescriptor.autolytiq.pricing;

// Create gRPC client with connection pooling
let client: any = null;

function getClient() {
  if (!client) {
    client = new pricingProto.PriceEngine(
      PRICING_SERVICE_URL,
      grpc.credentials.createInsecure(), // Use TLS in production with proper certs
      {
        'grpc.keepalive_time_ms': 10000,
        'grpc.keepalive_timeout_ms': 5000,
        'grpc.keepalive_permit_without_calls': 1,
        'grpc.http2.max_pings_without_data': 0,
        'grpc.http2.min_time_between_pings_ms': 10000,
      }
    );
  }
  return client;
}

// Request metadata helper
function createMetadata(tenantId: string, userId?: string) {
  return {
    tenant_id: tenantId,
    user_id: userId || 'system',
    request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
  };
}

// Types
export interface MarketDataRequest {
  tenantId: string;
  userId?: string;
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  radiusMiles?: number;
  zipCode?: string;
}

export interface GrossRequest {
  tenantId: string;
  userId?: string;
  vehiclePrice: number;
  vehicleCost: number;
  tradeInAllowance?: number;
  tradeInActualValue?: number;
  pack?: number;
  additionalFees?: Array<{ name: string; amount: number; taxable: boolean }>;
  fiProducts?: Array<{ name: string; cost: number; sellPrice: number }>;
}

export interface PaymentRequest {
  tenantId: string;
  userId?: string;
  amountFinanced: number;
  apr: number;
  termMonths: number;
  salesTaxRate?: number;
  downPayment?: number;
  tradeInValue?: number;
  rebates?: number;
}

/**
 * Get market data for vehicle pricing
 */
export async function getMarketData(data: MarketDataRequest): Promise<any> {
  const deadline = Date.now() + PRICING_TIMEOUT_MS;
  const client = getClient();

  return new Promise((resolve, reject) => {
    const start = Date.now();

    client.GetMarketData(
      {
        metadata: createMetadata(data.tenantId, data.userId),
        vin: data.vin || '',
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim || '',
        mileage: data.mileage,
        condition: data.condition,
        radius_miles: data.radiusMiles || 50,
        zip_code: data.zipCode || '',
        time_window_days: 90,
        year_variance: 2,
        mileage_variance: 20000,
      },
      { deadline },
      (error: any, response: any) => {
        const duration = Date.now() - start;

        if (error) {
          console.error('Pricing service GetMarketData failed', {
            error: error.message,
            code: error.code,
            duration,
            timeout: error.code === grpc.status.DEADLINE_EXCEEDED,
          });

          // Fallback to heuristic calculation
          resolve(getFallbackMarketData(data));
        } else {
          console.log('Pricing service GetMarketData success', { duration });
          resolve(transformMarketDataResponse(response));
        }
      }
    );
  });
}

/**
 * Calculate gross profit on a deal
 */
export async function calculateGross(data: GrossRequest): Promise<any> {
  const deadline = Date.now() + PRICING_TIMEOUT_MS;
  const client = getClient();

  return new Promise((resolve, reject) => {
    const start = Date.now();

    client.CalculateGross(
      {
        metadata: createMetadata(data.tenantId, data.userId),
        vehicle_price: { value: data.vehiclePrice.toString() },
        vehicle_cost: { value: data.vehicleCost.toString() },
        trade_in_allowance: data.tradeInAllowance
          ? { value: data.tradeInAllowance.toString() }
          : { value: '0' },
        trade_in_actual_value: data.tradeInActualValue
          ? { value: data.tradeInActualValue.toString() }
          : { value: '0' },
        pack: data.pack ? { value: data.pack.toString() } : { value: '0' },
        additional_fees: (data.additionalFees || []).map((f) => ({
          name: f.name,
          amount: { value: f.amount.toString() },
          taxable: f.taxable,
        })),
        fi_products: (data.fiProducts || []).map((p) => ({
          name: p.name,
          cost: { value: p.cost.toString() },
          sell_price: { value: p.sellPrice.toString() },
        })),
      },
      { deadline },
      (error: any, response: any) => {
        const duration = Date.now() - start;

        if (error) {
          console.error('Pricing service CalculateGross failed', {
            error: error.message,
            code: error.code,
            duration,
            timeout: error.code === grpc.status.DEADLINE_EXCEEDED,
          });

          // Fallback to simple calculation
          resolve(getFallbackGross(data));
        } else {
          console.log('Pricing service CalculateGross success', { duration });
          resolve(transformGrossResponse(response));
        }
      }
    );
  });
}

/**
 * Calculate payment structure
 */
export async function calculatePayment(data: PaymentRequest): Promise<any> {
  const deadline = Date.now() + PRICING_TIMEOUT_MS;
  const client = getClient();

  return new Promise((resolve, reject) => {
    const start = Date.now();

    client.CalculatePayment(
      {
        metadata: createMetadata(data.tenantId, data.userId),
        amount_financed: { value: data.amountFinanced.toString() },
        apr: data.apr,
        term_months: data.termMonths,
        sales_tax_rate: data.salesTaxRate || 0,
        down_payment: data.downPayment ? { value: data.downPayment.toString() } : { value: '0' },
        trade_in_value: data.tradeInValue ? { value: data.tradeInValue.toString() } : { value: '0' },
        rebates: data.rebates ? { value: data.rebates.toString() } : { value: '0' },
      },
      { deadline },
      (error: any, response: any) => {
        const duration = Date.now() - start;

        if (error) {
          console.error('Pricing service CalculatePayment failed', {
            error: error.message,
            code: error.code,
            duration,
            timeout: error.code === grpc.status.DEADLINE_EXCEEDED,
          });

          // Fallback to simple calculation
          resolve(getFallbackPayment(data));
        } else {
          console.log('Pricing service CalculatePayment success', { duration });
          resolve(transformPaymentResponse(response));
        }
      }
    );
  });
}

/**
 * Health check for pricing service
 */
export async function checkHealth(): Promise<{ healthy: boolean; version?: string }> {
  const client = getClient();

  return new Promise((resolve) => {
    client.GetHealth({}, { deadline: Date.now() + 2000 }, (error: any, response: any) => {
      if (error) {
        resolve({ healthy: false });
      } else {
        resolve({
          healthy: response.status === 'healthy',
          version: response.version,
        });
      }
    });
  });
}

// Transform response helpers
function transformMarketDataResponse(response: any) {
  const competitive = response.competitive_range || {};
  return {
    competitiveRange: {
      floorPrice: parseFloat(competitive.floor_price?.value || '0'),
      targetPrice: parseFloat(competitive.target_price?.value || '0'),
      ceilingPrice: parseFloat(competitive.ceiling_price?.value || '0'),
      averagePrice: parseFloat(competitive.average_price?.value || '0'),
      compCount: competitive.comp_count || 0,
      daysToSaleAvg: competitive.days_to_sale_avg || 0,
    },
    comparables: (response.comparables || []).map((c: any) => ({
      id: c.id,
      vin: c.vin,
      year: c.year,
      make: c.make,
      model: c.model,
      trim: c.trim,
      mileage: c.mileage,
      price: parseFloat(c.price?.value || '0'),
      daysOnMarket: c.days_on_market,
      distanceMiles: c.distance_miles,
    })),
    statistics: response.statistics
      ? {
          averageDaysToSale: response.statistics.average_days_to_sale,
          inventoryCount: response.statistics.inventory_count,
          priceVolatility: response.statistics.price_volatility,
        }
      : null,
  };
}

function transformGrossResponse(response: any) {
  return {
    frontGross: parseFloat(response.front_gross?.value || '0'),
    backGross: parseFloat(response.back_gross?.value || '0'),
    totalGross: parseFloat(response.total_gross?.value || '0'),
    grossPercentage: response.gross_percentage || 0,
    breakdown: response.breakdown
      ? {
          vehicleProfit: parseFloat(response.breakdown.vehicle_profit?.value || '0'),
          tradeProfit: parseFloat(response.breakdown.trade_profit?.value || '0'),
          packProfit: parseFloat(response.breakdown.pack_profit?.value || '0'),
          feeProfit: parseFloat(response.breakdown.fee_profit?.value || '0'),
          fiProfit: parseFloat(response.breakdown.fi_profit?.value || '0'),
        }
      : null,
  };
}

function transformPaymentResponse(response: any) {
  return {
    monthlyPayment: parseFloat(response.monthly_payment?.value || '0'),
    totalAmount: parseFloat(response.total_amount?.value || '0'),
    totalInterest: parseFloat(response.total_interest?.value || '0'),
    totalPrincipal: parseFloat(response.total_principal?.value || '0'),
    dtiRatio: response.dti_ratio || 0,
    ptiRatio: response.pti_ratio || 0,
    schedule: (response.schedule || []).map((s: any) => ({
      paymentNumber: s.payment_number,
      paymentAmount: parseFloat(s.payment_amount?.value || '0'),
      principal: parseFloat(s.principal?.value || '0'),
      interest: parseFloat(s.interest?.value || '0'),
      balance: parseFloat(s.balance?.value || '0'),
    })),
  };
}

// Fallback functions (simple heuristics if Rust service is down)
function getFallbackMarketData(data: MarketDataRequest) {
  console.warn('Using fallback market data calculation');
  const baseValue = 25000; // Simplified
  return {
    competitiveRange: {
      floorPrice: baseValue * 0.85,
      targetPrice: baseValue,
      ceilingPrice: baseValue * 1.15,
      averagePrice: baseValue,
      compCount: 0,
      daysToSaleAvg: 45,
    },
    comparables: [],
    statistics: null,
  };
}

function getFallbackGross(data: GrossRequest) {
  console.warn('Using fallback gross calculation');
  const vehicleProfit = data.vehiclePrice - data.vehicleCost;
  const tradeProfit = (data.tradeInActualValue || 0) - (data.tradeInAllowance || 0);
  const frontGross = vehicleProfit + tradeProfit - (data.pack || 0);

  return {
    frontGross,
    backGross: 0,
    totalGross: frontGross,
    grossPercentage: data.vehiclePrice > 0 ? (frontGross / data.vehiclePrice) * 100 : 0,
    breakdown: {
      vehicleProfit,
      tradeProfit,
      packProfit: -(data.pack || 0),
      feeProfit: 0,
      fiProfit: 0,
    },
  };
}

function getFallbackPayment(data: PaymentRequest) {
  console.warn('Using fallback payment calculation');
  const monthlyRate = data.apr / 100 / 12;
  const numPayments = data.termMonths;

  let monthlyPayment: number;
  if (monthlyRate > 0) {
    const factor = Math.pow(1 + monthlyRate, numPayments);
    monthlyPayment = (data.amountFinanced * monthlyRate * factor) / (factor - 1);
  } else {
    monthlyPayment = data.amountFinanced / numPayments;
  }

  const totalAmount = monthlyPayment * numPayments;
  const totalInterest = totalAmount - data.amountFinanced;

  return {
    monthlyPayment,
    totalAmount,
    totalInterest,
    totalPrincipal: data.amountFinanced,
    dtiRatio: 0,
    ptiRatio: 0,
    schedule: [],
  };
}

// Graceful shutdown
export function closeClient() {
  if (client) {
    client.close();
    client = null;
  }
}
