import { createDomainEvent, type EventBus } from "../../core";
import type { IStorage } from "../../storage";
import type { Deal } from "@shared/schema";
import type {
  DealStructuredEvent,
  PaymentCalculatedEvent,
  TradeValuationCompletedEvent,
} from "./desking-events";

export interface DealWorksheetInput {
  dealId?: string;
  salePrice: number;
  msrp?: number;
  vehicleCost: number;
  downPayment: number;
  tradeAllowance?: number;
  tradePayoff?: number;
  rebates?: number;
  docFee?: number;
  otherFees?: number;
  taxes?: number;
  apr: number;
  buyRate?: number;
  termMonths: number;
  productCost?: number;
  productPrice?: number;
  packFee?: number;
  holdback?: number;
  creditScore?: number;
}

export interface DealStructureInput extends DealWorksheetInput {
  status?: string;
}

export interface DealWorksheetResult {
  amountFinanced: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  apr: number;
  termMonths: number;
  frontEndGross: number;
  financeReserve: number;
  productGross: number;
  backEndGross: number;
  netGross: number;
  rebatesApplied: number;
  lenders: Array<{
    name: string;
    program: string;
    apr: number;
    buyRate: number;
    termMonths: number;
    monthlyPayment: number;
    reserveEarnings: number;
  }>;
  incentives: {
    stackable: string[];
    nonStackable: string[];
    totalRebates: number;
    docFee: number;
    otherFees: number;
  };
}

export interface TradeValuationRequest {
  vin?: string;
  year: number;
  make: string;
  model: string;
  mileage?: number;
  condition: "excellent" | "good" | "fair" | "poor";
  payoffAmount?: number;
  trim?: string;
}

export interface TradeValuationResult {
  vin?: string;
  marketValue: number;
  tradeInValue: number;
  recommendedAllowance: number;
  netEquity: number;
  condition: "excellent" | "good" | "fair" | "poor";
  year: number;
  make: string;
  model: string;
  mileage?: number;
  trim?: string;
}

const LENDER_PROGRAMS = [
  {
    name: "AutoNation Financial",
    program: "Prime Retail",
    minScore: 720,
    apr: 5.49,
    buyRate: 4.75,
    maxTerm: 72,
  },
  {
    name: "Northwind Credit Union",
    program: "Preferred",
    minScore: 680,
    apr: 6.25,
    buyRate: 5.25,
    maxTerm: 75,
  },
  {
    name: "Summit Lending",
    program: "Standard Retail",
    minScore: 640,
    apr: 7.49,
    buyRate: 6.49,
    maxTerm: 72,
  },
  {
    name: "Horizon Capital",
    program: "Near Prime",
    minScore: 600,
    apr: 8.99,
    buyRate: 7.75,
    maxTerm: 66,
  },
];

export class DeskingService {
  constructor(private readonly storage: IStorage, private readonly eventBus: EventBus) {}

  async listDeals(): Promise<Deal[]> {
    return this.storage.getAllDeals();
  }

  async getDealSummary(dealId: string): Promise<{
    deal: Deal | undefined;
    worksheet?: DealWorksheetResult;
  }> {
    const deal = await this.storage.getDeal(dealId);
    if (!deal) {
      return { deal: undefined };
    }

    const worksheet = await this.buildWorksheetFromDeal(deal);
    return { deal, worksheet };
  }

  async evaluateTradeIn(request: TradeValuationRequest): Promise<TradeValuationResult> {
    const currentYear = new Date().getFullYear();
    const age = Math.max(0, currentYear - request.year);

    const baseValue = this.estimateBaseValue(request.make, request.model);
    const depreciationMultiplier = Math.max(0.2, 1 - 0.12 * age);

    let mileageAdjustment = 1;
    if (request.mileage) {
      const expectedMileage = age === 0 ? 15000 : age * 12000;
      const delta = request.mileage - expectedMileage;
      mileageAdjustment -= Math.min(0.25, delta / 60000);
    }

    const conditionAdjustment = this.getConditionAdjustment(request.condition);

    const marketValue = Math.max(
      1000,
      baseValue * depreciationMultiplier * mileageAdjustment * conditionAdjustment
    );
    const tradeInValue = Math.round(marketValue * 0.92);
    const recommendedAllowance = Math.round(marketValue * 0.95);
    const payoff = request.payoffAmount ?? 0;
    const netEquity = Math.round(tradeInValue - payoff);

    const valuation: TradeValuationResult = {
      vin: request.vin,
      marketValue: Math.round(marketValue),
      tradeInValue,
      recommendedAllowance,
      netEquity,
      condition: request.condition,
      year: request.year,
      make: request.make,
      model: request.model,
      mileage: request.mileage,
      trim: request.trim,
    };

    const event: TradeValuationCompletedEvent = createDomainEvent(
      "desking.trade.valuation.completed",
      {
        vin: request.vin,
        year: request.year,
        make: request.make,
        model: request.model,
        mileage: request.mileage,
        condition: request.condition,
        marketValue: valuation.marketValue,
        tradeInValue: valuation.tradeInValue,
        recommendedAllowance: valuation.recommendedAllowance,
        netEquity: valuation.netEquity,
      }
    );
    await this.eventBus.publish(event);

    return valuation;
  }

  async calculateDealWorksheet(
    input: DealWorksheetInput,
    { emitEvent = true }: { emitEvent?: boolean } = { emitEvent: true }
  ): Promise<DealWorksheetResult> {
    const amountFinanced = this.calculateAmountFinanced(input);
    const paymentBreakdown = this.calculatePayment(amountFinanced, input.apr, input.termMonths);

    const financeReserve = this.calculateFinanceReserve(
      amountFinanced,
      input.apr,
      input.buyRate ?? input.apr - 1.0,
      input.termMonths
    );
    const productGross = Math.max(0, (input.productPrice ?? 0) - (input.productCost ?? 0));
    const backEndGross = financeReserve + productGross;

    const frontEndGross = this.calculateFrontGross(input);
    const netGross = frontEndGross + backEndGross + (input.holdback ?? 0) - (input.packFee ?? 0);

    const lenders = this.buildLenderOptions(
      input.creditScore,
      amountFinanced,
      input.termMonths
    );

    const incentives = this.buildIncentiveMatrix(input);

    const worksheet: DealWorksheetResult = {
      amountFinanced,
      monthlyPayment: paymentBreakdown.monthlyPayment,
      totalInterest: paymentBreakdown.totalInterest,
      totalCost: paymentBreakdown.totalCost,
      apr: input.apr,
      termMonths: input.termMonths,
      frontEndGross,
      financeReserve,
      productGross,
      backEndGross,
      netGross,
      rebatesApplied: input.rebates ?? 0,
      lenders,
      incentives,
    };

    if (emitEvent) {
      const event: PaymentCalculatedEvent = createDomainEvent("desking.payment.calculated", {
        dealId: input.dealId,
        amountFinanced: worksheet.amountFinanced,
        monthlyPayment: worksheet.monthlyPayment,
        apr: worksheet.apr,
        termMonths: worksheet.termMonths,
        totalInterest: worksheet.totalInterest,
        totalCost: worksheet.totalCost,
      });
      await this.eventBus.publish(event);
    }

    return worksheet;
  }

  async updateDealStructure(dealId: string, payload: DealStructureInput) {
    const deal = await this.storage.getDeal(dealId);
    if (!deal) {
      throw new Error(`Deal ${dealId} not found`);
    }

    const worksheet = await this.calculateDealWorksheet({ ...payload, dealId }, { emitEvent: false });

    const updates: Partial<Deal> = {
      salePrice: Math.round(payload.salePrice),
      msrp: payload.msrp ? Math.round(payload.msrp) : deal.msrp,
      cashDown: Math.round(payload.downPayment),
      tradeAllowance: Math.round(payload.tradeAllowance ?? deal.tradeAllowance ?? 0),
      tradePayoff: Math.round(payload.tradePayoff ?? deal.tradePayoff ?? 0),
      rebates: Math.round(payload.rebates ?? deal.rebates ?? 0),
      docFee: Math.round(payload.docFee ?? deal.docFee ?? 0),
      registrationFee: Math.round(payload.otherFees ?? deal.registrationFee ?? 0),
      salesTax: Math.round(payload.taxes ?? deal.salesTax ?? 0),
      financeBalance: Math.round(worksheet.amountFinanced),
      term: payload.termMonths,
      rate: `${payload.apr.toFixed(2)}%`,
      updatedAt: new Date(),
      status: payload.status ?? deal.status ?? "structuring",
    };

    const updated = (await this.storage.updateDeal(dealId, updates)) ?? {
      ...deal,
      ...updates,
    };

    const event: DealStructuredEvent = createDomainEvent("desking.deal.structured", {
      dealId,
      status: updated.status ?? "structuring",
      worksheet: {
        amountFinanced: worksheet.amountFinanced,
        monthlyPayment: worksheet.monthlyPayment,
        apr: worksheet.apr,
        termMonths: worksheet.termMonths,
        frontEndGross: worksheet.frontEndGross,
        backEndGross: worksheet.backEndGross,
        netGross: worksheet.netGross,
        rebatesApplied: worksheet.rebatesApplied,
      },
    });
    await this.eventBus.publish(event);

    return { deal: updated, worksheet };
  }

  private async buildWorksheetFromDeal(deal: Deal): Promise<DealWorksheetResult | undefined> {
    if (!deal.salePrice) {
      return undefined;
    }

    const worksheetInput: DealWorksheetInput = {
      dealId: deal.id,
      salePrice: Number(deal.salePrice) || 0,
      msrp: deal.msrp ? Number(deal.msrp) : undefined,
      vehicleCost: deal.msrp ? Number(deal.msrp) * 0.92 : Number(deal.salePrice) * 0.9,
      downPayment: Number(deal.cashDown ?? 0),
      tradeAllowance: Number(deal.tradeAllowance ?? 0),
      tradePayoff: Number(deal.tradePayoff ?? 0),
      rebates: Number(deal.rebates ?? 0),
      docFee: Number(deal.docFee ?? 0),
      otherFees: Number(deal.registrationFee ?? 0),
      taxes: Number(deal.salesTax ?? 0),
      apr: deal.rate ? Number(String(deal.rate).replace("%", "")) : 6.25,
      termMonths: deal.term ? Number(deal.term) : 72,
      buyRate: deal.rate ? Math.max(0, Number(String(deal.rate).replace("%", "")) - 1) : 5.25,
      productCost: 0,
      productPrice: 0,
      packFee: 350,
      holdback: deal.msrp ? Number(deal.msrp) * 0.02 : 0,
      creditScore: 710,
    };

    return this.calculateDealWorksheet(worksheetInput, { emitEvent: false });
  }

  private calculateAmountFinanced(input: DealWorksheetInput): number {
    const grossPrice =
      input.salePrice + (input.docFee ?? 0) + (input.otherFees ?? 0) + (input.taxes ?? 0);
    const credits = (input.downPayment ?? 0) + (input.tradeAllowance ?? 0) + (input.rebates ?? 0);
    const payoffs = input.tradePayoff ?? 0;

    return Math.max(0, Math.round(grossPrice - credits + payoffs));
  }

  private calculatePayment(amountFinanced: number, apr: number, termMonths: number) {
    const ratePerMonth = apr / 1200;
    if (termMonths <= 0) {
      return {
        monthlyPayment: amountFinanced,
        totalInterest: 0,
        totalCost: amountFinanced,
      };
    }

    let monthlyPayment = 0;
    if (ratePerMonth === 0) {
      monthlyPayment = amountFinanced / termMonths;
    } else {
      const factor = Math.pow(1 + ratePerMonth, termMonths);
      monthlyPayment = (amountFinanced * ratePerMonth * factor) / (factor - 1);
    }

    const totalCost = monthlyPayment * termMonths;
    const totalInterest = totalCost - amountFinanced;

    return {
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
      totalInterest: Math.round(totalInterest * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
    };
  }

  private calculateFinanceReserve(
    amountFinanced: number,
    apr: number,
    buyRate: number,
    termMonths: number
  ): number {
    const spread = Math.max(0, apr - buyRate);
    if (spread === 0) {
      return 0;
    }

    const reserve = amountFinanced * (spread / 100) * (termMonths / 12) * 0.7;
    return Math.round(reserve * 100) / 100;
  }

  private calculateFrontGross(input: DealWorksheetInput): number {
    const salePrice = input.salePrice;
    const cost = input.vehicleCost;
    const pack = input.packFee ?? 0;
    const holdback = input.holdback ?? 0;
    const rebates = input.rebates ?? 0;

    const gross = salePrice - cost - pack - rebates + holdback;
    return Math.round(gross * 100) / 100;
  }

  private buildLenderOptions(
    creditScore: number | undefined,
    amountFinanced: number,
    termMonths: number
  ) {
    const score = creditScore ?? 700;
    return LENDER_PROGRAMS.filter((program) => score >= program.minScore)
      .map((program) => {
        const adjustedApr = program.apr + (termMonths > program.maxTerm ? 0.75 : 0);
        const reserve = this.calculateFinanceReserve(
          amountFinanced,
          adjustedApr,
          program.buyRate,
          termMonths
        );
        const payment = this.calculatePayment(amountFinanced, adjustedApr, termMonths);
        return {
          name: program.name,
          program: program.program,
          apr: Math.round(adjustedApr * 100) / 100,
          buyRate: program.buyRate,
          termMonths,
          monthlyPayment: payment.monthlyPayment,
          reserveEarnings: reserve,
        };
      })
      .sort((a, b) => a.apr - b.apr)
      .slice(0, 3);
  }

  private buildIncentiveMatrix(input: DealWorksheetInput) {
    const rebates = input.rebates ?? 0;
    const stackable: string[] = [];
    const nonStackable: string[] = [];

    if (rebates > 0) {
      stackable.push(`OEM Customer Cash $${rebates.toLocaleString()}`);
    }
    if ((input.tradeAllowance ?? 0) > 0) {
      stackable.push("Trade-in equity applied");
    }
    if ((input.docFee ?? 0) > 0) {
      nonStackable.push("Doc fee required");
    }

    return {
      stackable,
      nonStackable,
      totalRebates: rebates,
      docFee: input.docFee ?? 0,
      otherFees: input.otherFees ?? 0,
    };
  }

  private estimateBaseValue(make: string, model: string): number {
    const key = `${make} ${model}`.toLowerCase();
    if (key.includes("truck")) {
      return 42000;
    }
    if (key.includes("suv") || key.includes("cx") || key.includes("cr-v") || key.includes("rav")) {
      return 38000;
    }
    if (key.includes("hybrid") || key.includes("ev")) {
      return 40000;
    }
    return 32000;
  }

  private getConditionAdjustment(condition: TradeValuationRequest["condition"]): number {
    switch (condition) {
      case "excellent":
        return 1.05;
      case "good":
        return 1;
      case "fair":
        return 0.9;
      case "poor":
        return 0.75;
      default:
        return 1;
    }
  }
}
