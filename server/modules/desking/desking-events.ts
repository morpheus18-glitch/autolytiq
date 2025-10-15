import type { DomainEvent } from "../../core";

export type PaymentCalculatedEvent = DomainEvent<
  "desking.payment.calculated",
  {
    dealId?: string;
    amountFinanced: number;
    monthlyPayment: number;
    apr: number;
    termMonths: number;
    totalInterest: number;
    totalCost: number;
  }
>;

export type TradeValuationCompletedEvent = DomainEvent<
  "desking.trade.valuation.completed",
  {
    vin?: string;
    year: number;
    make: string;
    model: string;
    mileage?: number;
    condition: "excellent" | "good" | "fair" | "poor";
    marketValue: number;
    tradeInValue: number;
    recommendedAllowance: number;
    netEquity: number;
  }
>;

export type DealStructuredEvent = DomainEvent<
  "desking.deal.structured",
  {
    dealId: string;
    status: string;
    worksheet: {
      amountFinanced: number;
      monthlyPayment: number;
      apr: number;
      termMonths: number;
      frontEndGross: number;
      backEndGross: number;
      netGross: number;
      rebatesApplied: number;
    };
  }
>;
