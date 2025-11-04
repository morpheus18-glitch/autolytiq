import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { fileURLToPath } from 'url';
import { logger } from '../logger.js';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

type PriceEnginePackageDefinition = grpc.GrpcObject & {
  autolytiq: grpc.GrpcObject & {
    pricing: grpc.GrpcObject & {
      PriceEngine: grpc.ServiceClientConstructor;
    };
  };
};

type PriceEngineServiceClient = grpc.Client & {
  GetMarketData(
    request: MarketDataRequest & { metadata: RequestMetadata },
    callback: (error: grpc.ServiceError | null, response: any) => void,
  ): void;
  CalculateGross(
    request: GrossRequest & { metadata: RequestMetadata },
    callback: (error: grpc.ServiceError | null, response: any) => void,
  ): void;
  CalculatePayment(
    request: PaymentRequest & { metadata: RequestMetadata },
    callback: (error: grpc.ServiceError | null, response: any) => void,
  ): void;
  SuggestMarkdown(
    request: MarkdownRequest & { metadata: RequestMetadata },
    callback: (error: grpc.ServiceError | null, response: any) => void,
  ): void;
  GetHealth(
    request: { include_dependencies?: boolean },
    callback: (error: grpc.ServiceError | null, response: any) => void,
  ): void;
};

// Load proto definitions
const PROTO_PATH = path.join(__dirname, '../../../../../services/rust/proto/price_engine.proto');
const COMMON_PROTO_PATH = path.join(__dirname, '../../../../../services/rust/proto/common.proto');

const packageDefinition = protoLoader.loadSync([PROTO_PATH, COMMON_PROTO_PATH], {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
  includeDirs: [path.join(__dirname, '../../../../../services/rust/proto')],
});

const priceEnginePackage = grpc.loadPackageDefinition(packageDefinition) as PriceEnginePackageDefinition;
const priceEngineProto = priceEnginePackage.autolytiq.pricing;

export interface MarketDataRequest {
  metadata: RequestMetadata;
  vin?: string;
  year: number;
  make: string;
  model: string;
  trim?: string;
  mileage: number;
  condition?: string;
  radius_miles?: number;
  zip_code?: string;
  time_window_days?: number;
  year_variance?: number;
  mileage_variance?: number;
}

export interface RequestMetadata {
  request_id: string;
  tenant_id: string;
  user_id?: string;
  idempotency_key?: string;
  timestamp_ms: number;
  correlation_id?: string;
}

export interface Money {
  amount_cents: number;
  currency: string;
}

export interface GrossRequest {
  metadata: RequestMetadata;
  vehicle_price: Money;
  vehicle_cost: Money;
  pack?: Money;
  trade_value?: Money;
  trade_payoff?: Money;
  trade_allowance?: Money;
  rate_markup?: { value: string };
  term_months?: number;
  amount_financed?: Money;
  participation?: number;
  products?: Array<{
    type: string;
    price: Money;
    cost: Money;
    participation: number;
  }>;
}

export interface PaymentRequest {
  metadata: RequestMetadata;
  amount_financed: Money;
  apr: { value: string };
  term_months: number;
  gross_monthly_income?: Money;
  total_monthly_debt?: Money;
}

export interface MarkdownRequest {
  metadata: RequestMetadata;
  current_price: Money;
  cost: Money;
  days_in_stock: number;
  first_listed_date?: string;
  market_range?: any;
  aging_bands?: Array<{
    days_threshold: number;
    markdown_percentage: number;
  }>;
}

export class PriceEngineClient {
  private client: PriceEngineServiceClient;
  private url: string;

  constructor(url = process.env.PRICE_ENGINE_URL || 'localhost:50051') {
    this.url = url;
    this.client = new priceEngineProto.PriceEngine(
      url,
      grpc.credentials.createInsecure(),
    ) as unknown as PriceEngineServiceClient;
    logger.info(`PriceEngine gRPC client connected to ${url}`);
  }

  /**
   * Create request metadata from tenant context
   */
  private createMetadata(tenantId: string, userId?: string, idempotencyKey?: string): RequestMetadata {
    return {
      request_id: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      tenant_id: tenantId,
      user_id: userId,
      idempotency_key: idempotencyKey,
      timestamp_ms: Date.now(),
    };
  }

  /**
   * Convert dollars to Money protobuf type
   */
  private dollarsToMoney(dollars: number, currency = 'USD'): Money {
    return {
      amount_cents: Math.round(dollars * 100),
      currency,
    };
  }

  /**
   * Convert Money protobuf type to dollars
   */
  private moneyToDollars(money?: Money): number {
    if (!money) return 0;
    return money.amount_cents / 100;
  }

  /**
   * Get market data and competitive pricing range
   */
  async getMarketData(
    tenantId: string,
    request: Omit<MarketDataRequest, 'metadata'>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId),
      };

      this.client.GetMarketData(fullRequest, (error: any, response: any) => {
        if (error) {
          logger.error(
            'PriceEngine GetMarketData error',
            error instanceof Error ? error : undefined,
            { request: fullRequest },
          );
          reject(error);
        } else {
          logger.debug('PriceEngine GetMarketData success', { response });
          resolve(response);
        }
      });
    });
  }

  /**
   * Calculate gross profit breakdown
   */
  async calculateGross(
    tenantId: string,
    request: Omit<GrossRequest, 'metadata'>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId),
      };

      this.client.CalculateGross(fullRequest, (error: any, response: any) => {
        if (error) {
          logger.error(
            'PriceEngine CalculateGross error',
            error instanceof Error ? error : undefined,
            { request: fullRequest },
          );
          reject(error);
        } else {
          logger.debug('PriceEngine CalculateGross success', { response });
          resolve(response);
        }
      });
    });
  }

  /**
   * Calculate payment and amortization
   */
  async calculatePayment(
    tenantId: string,
    request: Omit<PaymentRequest, 'metadata'>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId),
      };

      this.client.CalculatePayment(fullRequest, (error: any, response: any) => {
        if (error) {
          logger.error(
            'PriceEngine CalculatePayment error',
            error instanceof Error ? error : undefined,
            { request: fullRequest },
          );
          reject(error);
        } else {
          logger.debug('PriceEngine CalculatePayment success', { response });
          resolve(response);
        }
      });
    });
  }

  /**
   * Suggest price markdown based on aging
   */
  async suggestMarkdown(
    tenantId: string,
    request: Omit<MarkdownRequest, 'metadata'>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const fullRequest = {
        ...request,
        metadata: this.createMetadata(tenantId),
      };

      this.client.SuggestMarkdown(fullRequest, (error: any, response: any) => {
        if (error) {
          logger.error(
            'PriceEngine SuggestMarkdown error',
            error instanceof Error ? error : undefined,
            { request: fullRequest },
          );
          reject(error);
        } else {
          logger.debug('PriceEngine SuggestMarkdown success', { response });
          resolve(response);
        }
      });
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<any> {
    return new Promise((resolve, reject) => {
      this.client.GetHealth({ include_dependencies: true }, (error: any, response: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(response);
        }
      });
    });
  }

  /**
   * Close the client connection
   */
  close() {
    this.client.close();
    logger.info('PriceEngine gRPC client closed');
  }
}

// Export singleton instance
export const priceEngineClient = new PriceEngineClient();
