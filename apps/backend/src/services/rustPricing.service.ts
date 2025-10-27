import { priceEngineClient } from '../lib/grpc/priceEngineClient.js';
import { logger } from '../lib/logger.js';

function logRustServiceError(message: string, error: unknown, metadata: Record<string, unknown>): void {
  if (error instanceof Error) {
    logger.error(message, error, metadata);
    return;
  }

  logger.error(message, undefined, { ...metadata, error });
}

/**
 * Rust-powered pricing service
 * Wraps the gRPC client with a TypeScript-friendly interface
 */
export class RustPricingService {
  /**
   * Get market data for a vehicle
   */
  async getMarketData(params: {
    tenantId: string;
    year: number;
    make: string;
    model: string;
    trim?: string;
    mileage: number;
    zipCode?: string;
    radiusMiles?: number;
    timeWindowDays?: number;
  }) {
    try {
      const response = await priceEngineClient.getMarketData(params.tenantId, {
        year: params.year,
        make: params.make,
        model: params.model,
        trim: params.trim,
        mileage: params.mileage,
        zip_code: params.zipCode,
        radius_miles: params.radiusMiles || 100,
        time_window_days: params.timeWindowDays || 90,
      });

      return this.transformMarketDataResponse(response);
    } catch (error) {
      logRustServiceError('Failed to get market data from Rust service', error, { params });
      throw new Error('Failed to get market data');
    }
  }

  /**
   * Calculate gross profit breakdown
   */
  async calculateGross(params: {
    tenantId: string;
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
  }) {
    try {
      const response = await priceEngineClient.calculateGross(params.tenantId, {
        vehicle_price: this.toMoney(params.vehiclePrice),
        vehicle_cost: this.toMoney(params.vehicleCost),
        pack: params.pack ? this.toMoney(params.pack) : undefined,
        trade_value: params.tradeValue ? this.toMoney(params.tradeValue) : undefined,
        trade_payoff: params.tradePayoff ? this.toMoney(params.tradePayoff) : undefined,
        trade_allowance: params.tradeAllowance ? this.toMoney(params.tradeAllowance) : undefined,
        rate_markup: params.rateMarkup ? { value: params.rateMarkup.toString() } : undefined,
        term_months: params.termMonths || 0,
        amount_financed: params.amountFinanced ? this.toMoney(params.amountFinanced) : undefined,
        participation: params.participation || 1.0,
        products: params.products?.map((p) => ({
          type: p.type,
          price: this.toMoney(p.price),
          cost: this.toMoney(p.cost),
          participation: p.participation,
        })),
      });

      return this.transformGrossResponse(response);
    } catch (error) {
      logRustServiceError('Failed to calculate gross from Rust service', error, { params });
      throw new Error('Failed to calculate gross');
    }
  }

  /**
   * Calculate payment details
   */
  async calculatePayment(params: {
    tenantId: string;
    amountFinanced: number;
    apr: number;
    termMonths: number;
    grossMonthlyIncome?: number;
    totalMonthlyDebt?: number;
  }) {
    try {
      const response = await priceEngineClient.calculatePayment(params.tenantId, {
        amount_financed: this.toMoney(params.amountFinanced),
        apr: { value: params.apr.toString() },
        term_months: params.termMonths,
        gross_monthly_income: params.grossMonthlyIncome
          ? this.toMoney(params.grossMonthlyIncome)
          : undefined,
        total_monthly_debt: params.totalMonthlyDebt
          ? this.toMoney(params.totalMonthlyDebt)
          : undefined,
      });

      return this.transformPaymentResponse(response);
    } catch (error) {
      logRustServiceError('Failed to calculate payment from Rust service', error, { params });
      throw new Error('Failed to calculate payment');
    }
  }

  /**
   * Suggest price markdown
   */
  async suggestMarkdown(params: {
    tenantId: string;
    currentPrice: number;
    cost: number;
    daysInStock: number;
    marketRange?: {
      floorPrice: number;
      targetPrice: number;
      ceilingPrice: number;
      averagePrice: number;
      compCount: number;
      daysToSaleAvg: number;
    };
  }) {
    try {
      const response = await priceEngineClient.suggestMarkdown(params.tenantId, {
        current_price: this.toMoney(params.currentPrice),
        cost: this.toMoney(params.cost),
        days_in_stock: params.daysInStock,
        market_range: params.marketRange
          ? {
              floor_price: this.toMoney(params.marketRange.floorPrice),
              target_price: this.toMoney(params.marketRange.targetPrice),
              ceiling_price: this.toMoney(params.marketRange.ceilingPrice),
              average_price: this.toMoney(params.marketRange.averagePrice),
              comp_count: params.marketRange.compCount,
              days_to_sale_avg: params.marketRange.daysToSaleAvg,
            }
          : undefined,
      });

      return this.transformMarkdownResponse(response);
    } catch (error) {
      logRustServiceError('Failed to suggest markdown from Rust service', error, { params });
      throw new Error('Failed to suggest markdown');
    }
  }

  // Helper methods for type conversion

  private toMoney(dollars: number) {
    return {
      amount_cents: Math.round(dollars * 100),
      currency: 'USD',
    };
  }

  private fromMoney(money?: any): number {
    if (!money) return 0;
    return money.amount_cents / 100;
  }

  private transformMarketDataResponse(response: any) {
    return {
      competitiveRange: response.competitive_range
        ? {
            floorPrice: this.fromMoney(response.competitive_range.floor_price),
            targetPrice: this.fromMoney(response.competitive_range.target_price),
            ceilingPrice: this.fromMoney(response.competitive_range.ceiling_price),
            averagePrice: this.fromMoney(response.competitive_range.average_price),
            compCount: response.competitive_range.comp_count,
            daysToSaleAvg: response.competitive_range.days_to_sale_avg,
          }
        : null,
      comparables: response.comparables.map((comp: any) => ({
        id: comp.id,
        vin: comp.vin,
        year: comp.year,
        make: comp.make,
        model: comp.model,
        trim: comp.trim,
        mileage: comp.mileage,
        price: this.fromMoney(comp.price),
        daysOnMarket: comp.days_on_market,
        saleDate: comp.sale_date,
        source: comp.source,
        matchScore: comp.match_score,
      })),
      statistics: response.statistics
        ? {
            totalCompsFound: response.statistics.total_comps_found,
            compsUsed: response.statistics.comps_used,
            priceStdDev: response.statistics.price_std_dev,
            mileageStdDev: response.statistics.mileage_std_dev,
            pricePerMile: this.fromMoney(response.statistics.price_per_mile),
          }
        : null,
    };
  }

  private transformGrossResponse(response: any) {
    const breakdown = response.breakdown;
    if (!breakdown) return null;

    return {
      frontEndGross: this.fromMoney(breakdown.front_end_gross),
      tradeReserve: this.fromMoney(breakdown.trade_reserve),
      totalFrontGross: this.fromMoney(breakdown.total_front_gross),
      financeReserve: this.fromMoney(breakdown.finance_reserve),
      backEndGross: this.fromMoney(breakdown.back_end_gross),
      productProfits: breakdown.product_profits.map((p: any) => ({
        type: p.type,
        sellingPrice: this.fromMoney(p.selling_price),
        cost: this.fromMoney(p.cost),
        profit: this.fromMoney(p.profit),
        participation: p.participation,
      })),
      totalGross: this.fromMoney(breakdown.total_gross),
      grossPercentage: breakdown.gross_percentage,
    };
  }

  private transformPaymentResponse(response: any) {
    return {
      monthlyPayment: this.fromMoney(response.monthly_payment),
      totalInterest: this.fromMoney(response.total_interest),
      totalPayment: this.fromMoney(response.total_payment),
      ptiRatio: response.pti_ratio,
      dtiRatio: response.dti_ratio,
      amortizationSchedule: response.amortization_schedule.map((entry: any) => ({
        paymentNumber: entry.payment_number,
        paymentAmount: this.fromMoney(entry.payment_amount),
        principal: this.fromMoney(entry.principal),
        interest: this.fromMoney(entry.interest),
        balance: this.fromMoney(entry.balance),
      })),
    };
  }

  private transformMarkdownResponse(response: any) {
    return {
      suggestedPrice: this.fromMoney(response.suggested_price),
      markdownAmount: this.fromMoney(response.markdown_amount),
      markdownPercentage: response.markdown_percentage,
      agingBand: response.aging_band,
      competitivePosition: response.competitive_position,
      recommendation: response.recommendation,
      projectedGross: this.fromMoney(response.projected_gross),
      estimatedDaysToSale: response.estimated_days_to_sale,
    };
  }
}

// Export singleton instance
export const rustPricingService = new RustPricingService();
