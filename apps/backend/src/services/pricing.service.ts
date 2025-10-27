import { fileURLToPath } from 'url';
import path from 'path';
import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import { logger } from '../lib/logger.js';

const protoDir = path.dirname(fileURLToPath(import.meta.url));
const PROTO_PATH = path.resolve(protoDir, '../proto/pricing/v1/pricing.proto');
const PRICING_SERVICE_URL = process.env.PRICING_GRPC_ADDR || 'localhost:50051';
const PRICING_TIMEOUT_MS = 40; // 40ms SLA

// Load proto
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const protoDescriptor = grpc.loadPackageDefinition(packageDefinition) as any;
const pricingProto = protoDescriptor.pricing.v1;

// Create client
const client = new pricingProto.PricingService(
  PRICING_SERVICE_URL,
  grpc.credentials.createInsecure()
);

interface MarketDataRequest {
  tenantId: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition: string;
}

interface GrossRequest {
  tenantId: string;
  vehiclePrice: number;
  vehicleCost: number;
  pack: number;
  additionalFees?: Array<{ name: string; amount: number; taxable: boolean }>;
  fiProducts?: Array<{ name: string; cost: number; sellPrice: number }>;
}

interface PaymentRequest {
  tenantId: string;
  amountFinanced: number;
  apr: number;
  termMonths: number;
  salesTaxRate: number;
  fees?: Array<{ name: string; amount: number; taxable: boolean }>;
}

/**
 * Get market data for vehicle pricing
 */
export async function getMarketData(data: MarketDataRequest): Promise<any> {
  const deadline = new Date(Date.now() + PRICING_TIMEOUT_MS);

  return new Promise((resolve) => {
    const start = Date.now();

    client.getMarketData(
      {
        tenant_id: data.tenantId,
        year: data.year,
        make: data.make,
        model: data.model,
        trim: data.trim || '',
        mileage: data.mileage,
        condition: data.condition,
      },
      { deadline },
      (error: any, response: any) => {
        const duration = Date.now() - start;

        if (error) {
          logger.error('Pricing service getMarketData failed', {
            error: error.message,
            duration,
            timeout: error.code === grpc.status.DEADLINE_EXCEEDED,
          });

          resolve(getFallbackMarketData(data));
        } else {
          logger.info('Pricing service getMarketData success', { duration });
          resolve(response);
        }
      }
    );
  });
}

/**
 * Calculate gross profit on a deal
 */
export async function calculateGross(data: GrossRequest): Promise<any> {
  const deadline = new Date(Date.now() + PRICING_TIMEOUT_MS);

  return new Promise((resolve) => {
    const start = Date.now();

    client.calculateGross(
      {
        tenant_id: data.tenantId,
        vehicle_price: data.vehiclePrice,
        vehicle_cost: data.vehicleCost,
        pack: data.pack,
        additional_fees: data.additionalFees || [],
        fi_products: data.fiProducts || [],
      },
      { deadline },
      (error: any, response: any) => {
        const duration = Date.now() - start;

        if (error) {
          logger.error('Pricing service calculateGross failed', {
            error: error.message,
            duration,
            timeout: error.code === grpc.status.DEADLINE_EXCEEDED,
          });

          resolve(getFallbackGross(data));
        } else {
          logger.info('Pricing service calculateGross success', { duration });
          resolve(response);
        }
      }
    );
  });
}

/**
 * Calculate payment structure
 */
export async function calculatePayments(data: PaymentRequest): Promise<any> {
  const deadline = new Date(Date.now() + PRICING_TIMEOUT_MS);

  return new Promise((resolve) => {
    const start = Date.now();

    client.calculatePayments(
      {
        tenant_id: data.tenantId,
        amount_financed: data.amountFinanced,
        apr: data.apr,
        term_months: data.termMonths,
        sales_tax_rate: data.salesTaxRate,
        fees: data.fees || [],
      },
      { deadline },
      (error: any, response: any) => {
        const duration = Date.now() - start;

        if (error) {
          logger.error('Pricing service calculatePayments failed', {
            error: error.message,
            duration,
            timeout: error.code === grpc.status.DEADLINE_EXCEEDED,
          });

          resolve(getFallbackPayments(data));
        } else {
          logger.info('Pricing service calculatePayments success', { duration });
          resolve(response);
        }
      }
    );
  });
}

/**
 * Health check
 */
export async function checkHealth(): Promise<{ healthy: boolean; version?: string }> {
  return new Promise((resolve) => {
    client.check({}, { deadline: Date.now() + 1000 }, (error: any, response: any) => {
      if (error) {
        resolve({ healthy: false });
      } else {
        resolve({ healthy: true, version: response.version });
      }
    });
  });
}

// Fallback functions (simple heuristics if Rust service is down)

function getFallbackMarketData(data: MarketDataRequest): any {
  const baseValue = 25000;
  return {
    kbb_trade_in: baseValue * 0.85,
    kbb_retail: baseValue * 1.15,
    nada_clean: baseValue * 0.9,
    black_book_average: baseValue * 0.88,
    market_average: baseValue,
    recommended_price: baseValue * 1.1,
    confidence: 0.5,
    comparables: [],
  };
}

function getFallbackGross(data: GrossRequest): any {
  const frontGross = data.vehiclePrice - data.vehicleCost - data.pack;
  return {
    front_gross: frontGross,
    back_gross: 0,
    total_gross: frontGross,
    gross_percentage: data.vehiclePrice > 0 ? (frontGross / data.vehiclePrice) * 100 : 0,
    breakdown: {
      vehicle_profit: data.vehiclePrice - data.vehicleCost,
      pack_profit: -data.pack,
      fee_profit: 0,
      fi_profit: 0,
    },
  };
}

function getFallbackPayments(data: PaymentRequest): any {
  const monthlyPayment = data.amountFinanced / data.termMonths;

  return {
    monthly_payment: monthlyPayment,
    total_amount: monthlyPayment * data.termMonths,
    total_interest: 0,
    total_principal: data.amountFinanced,
    schedule: [],
  };
}
