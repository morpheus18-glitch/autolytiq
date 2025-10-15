import { createDomainEvent, type EventBus } from "../../core";
import type { IStorage } from "../../storage";
import type {
  CreditApplication,
  FiProduct,
  FinanceMenu,
} from "@shared/schema";
import type {
  CreditApplicationCreatedEvent,
  CreditApplicationStatusEvent,
  FinanceMenuPresentedEvent,
} from "./fi-events";

export interface FinanceMenuRequest {
  dealId: string;
  customerId: number;
  presentedBy: string;
  productIds: number[];
  apr?: number;
  termMonths?: number;
  cashDown?: number;
  buyRate?: number;
  notes?: string;
}

export interface CreditApplicationRequest {
  customerId: number;
  fullName: string;
  dateOfBirth: string;
  ssn: string;
  employmentHistory?: any[];
  currentIncome: number;
  rentMortgage: number;
  consentGiven?: boolean;
  notes?: string;
}

export interface CreditApplicationUpdate {
  status?: string;
  approvalAmount?: number | null;
  interestRate?: number | null;
  termMonths?: number;
  notes?: string;
}

export class FiService {
  constructor(private readonly storage: IStorage, private readonly eventBus: EventBus) {}

  async listProducts(): Promise<FiProduct[]> {
    return this.storage.getFiProducts();
  }

  async listFinanceMenus(): Promise<FinanceMenu[]> {
    return this.storage.getFinanceMenus();
  }

  async createFinanceMenu(request: FinanceMenuRequest) {
    const deal = await this.storage.getDeal(request.dealId);
    if (!deal) {
      throw new Error(`Deal ${request.dealId} not found`);
    }

    const termMonths = request.termMonths ?? (deal.term ? Number(deal.term) : 72);
    const apr = request.apr ?? (deal.rate ? Number(String(deal.rate).replace("%", "")) : 6.25);
    const amountFinanced = this.deriveAmountFinanced(deal, request.cashDown);

    const basePayment = this.calculatePayment(amountFinanced, apr, termMonths);

    const products = await this.resolveProducts(request.productIds);
    const productSummary = this.buildProductSummary(products, termMonths);
    const finalPayment = Math.round(
      (basePayment.monthlyPayment + productSummary.monthlyAddOn) * 100
    ) / 100;

    const presentationPackages = this.buildPresentationPackages(
      products,
      basePayment,
      termMonths
    );

    const financeMenuPayload: any = {
      customerId: request.customerId,
      presentedBy: request.presentedBy,
      vehicleId: deal.vehicleId ? Number(deal.vehicleId) : undefined,
      basePayment: basePayment.monthlyPayment,
      selectedProducts: productSummary.selectedProducts,
      totalProductCost: productSummary.totalRetail,
      finalPayment,
      presentationData: {
        apr,
        termMonths,
        amountFinanced,
        packages: presentationPackages,
      },
      notes: request.notes,
    };

    const numericDealId = Number.parseInt(String(request.dealId), 10);
    if (!Number.isNaN(numericDealId)) {
      financeMenuPayload.dealId = numericDealId;
    }

    const menu = await this.storage.createFinanceMenu(financeMenuPayload);

    const productsForEvent = productSummary.selectedProducts.map((product) => ({
      productId: product.productId,
      price: product.price,
    }));

    const event: FinanceMenuPresentedEvent = createDomainEvent("fi.menu.presented", {
      menuId: menu.id,
      customerId: menu.customerId,
      dealId: request.dealId,
      presentedBy: request.presentedBy,
      basePayment: basePayment.monthlyPayment,
      finalPayment,
      selectedProducts: productsForEvent,
    });
    await this.eventBus.publish(event);

    return {
      menu,
      basePayment,
      productSummary,
      presentationPackages,
    };
  }

  async createCreditApplication(request: CreditApplicationRequest) {
    const application = await this.storage.createCreditApplication({
      customerId: request.customerId,
      fullName: request.fullName,
      dateOfBirth: request.dateOfBirth,
      ssn: request.ssn,
      employmentHistory: request.employmentHistory,
      currentIncome: request.currentIncome,
      rentMortgage: request.rentMortgage,
      consentGiven: request.consentGiven,
      notes: request.notes,
    });

    const createdEvent: CreditApplicationCreatedEvent = createDomainEvent(
      "fi.credit.application.created",
      {
        applicationId: application.id,
        customerId: application.customerId,
        submittedAt: new Date(application.createdAt as any).toISOString(),
      }
    );
    await this.eventBus.publish(createdEvent);

    return application;
  }

  async listCreditApplications(customerId: number): Promise<CreditApplication[]> {
    return this.storage.getCreditApplications(customerId);
  }

  async updateCreditApplication(
    applicationId: number,
    updates: CreditApplicationUpdate
  ) {
    const payload: Partial<CreditApplication> = {};
    if (updates.status !== undefined) {
      payload.status = updates.status;
    }
    if (updates.approvalAmount !== undefined) {
      payload.approvalAmount =
        updates.approvalAmount === null ? null : updates.approvalAmount.toFixed(2);
    }
    if (updates.interestRate !== undefined) {
      payload.interestRate =
        updates.interestRate === null ? null : updates.interestRate.toFixed(2);
    }
    if (updates.termMonths !== undefined) {
      payload.termMonths = updates.termMonths;
    }
    if (updates.notes !== undefined) {
      payload.notes = updates.notes;
    }
    payload.updatedAt = new Date();

    const updated = await this.storage.updateCreditApplication(applicationId, payload);
    if (!updated) {
      throw new Error(`Credit application ${applicationId} not found`);
    }

    const statusEvent: CreditApplicationStatusEvent = createDomainEvent(
      "fi.credit.application.updated",
      {
        applicationId: updated.id,
        customerId: updated.customerId,
        status: updated.status,
        decisionAmount:
          updates.approvalAmount ?? (updated.approvalAmount ? Number(updated.approvalAmount) : null),
        interestRate:
          updates.interestRate ?? (updated.interestRate ? Number(updated.interestRate) : null),
      }
    );
    await this.eventBus.publish(statusEvent);

    return updated;
  }

  private deriveAmountFinanced(deal: any, overrideCashDown?: number) {
    if (deal.financeBalance) {
      return Number(deal.financeBalance);
    }

    const salePrice = Number(deal.salePrice ?? 0);
    const down = overrideCashDown ?? Number(deal.cashDown ?? 0);
    const tradeAllowance = Number(deal.tradeAllowance ?? 0);
    const tradePayoff = Number(deal.tradePayoff ?? 0);
    const rebates = Number(deal.rebates ?? 0);
    const docFee = Number(deal.docFee ?? 0);
    const taxes = Number(deal.salesTax ?? 0);
    const otherFees = Number(deal.registrationFee ?? 0);

    return Math.max(0, salePrice - down - tradeAllowance - rebates + tradePayoff + docFee + taxes + otherFees);
  }

  private calculatePayment(amountFinanced: number, apr: number, termMonths: number) {
    const ratePerMonth = apr / 1200;
    let monthlyPayment = 0;
    if (termMonths <= 0) {
      monthlyPayment = amountFinanced;
    } else if (ratePerMonth === 0) {
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

  private async resolveProducts(productIds: number[]): Promise<FiProduct[]> {
    const products: FiProduct[] = [];
    for (const id of productIds) {
      const product = await this.storage.getFiProduct(id);
      if (!product) {
        throw new Error(`F&I product ${id} not found`);
      }
      products.push(product);
    }
    return products;
  }

  private buildProductSummary(products: FiProduct[], termMonths: number) {
    let totalRetail = 0;
    const selectedProducts = products.map((product) => {
      const retailPricing: any = product.retailPricing ?? {};
      const price = Number(
        retailPricing.recommended ?? retailPricing.maxPrice ?? retailPricing.minPrice ?? 0
      );
      totalRetail += price;
      return {
        productId: product.id,
        name: product.name,
        category: product.category,
        price,
      };
    });

    const monthlyAddOn = termMonths > 0 ? Math.round((totalRetail / termMonths) * 100) / 100 : 0;

    return { selectedProducts, totalRetail: Math.round(totalRetail * 100) / 100, monthlyAddOn };
  }

  private buildPresentationPackages(
    products: FiProduct[],
    basePayment: { monthlyPayment: number },
    termMonths: number
  ) {
    if (products.length === 0) {
      return [
        {
          name: "Compliance Only",
          description: "Base payment without aftermarket products",
          monthlyPayment: basePayment.monthlyPayment,
          products: [],
        },
      ];
    }

    const sorted = [...products].sort((a, b) => {
      const retailA = Number((a.retailPricing as any)?.recommended ?? 0);
      const retailB = Number((b.retailPricing as any)?.recommended ?? 0);
      return retailB - retailA;
    });

    const tiers = [
      {
        name: "Platinum Protection",
        includeCount: sorted.length,
        description: "Maximum coverage including all available products",
      },
      {
        name: "Gold Coverage",
        includeCount: Math.max(1, sorted.length - 1),
        description: "High-value bundle for primary risks",
      },
      {
        name: "Silver Essentials",
        includeCount: Math.max(1, Math.ceil(sorted.length / 2)),
        description: "Balanced protection for budget-conscious buyers",
      },
      {
        name: "Compliance Only",
        includeCount: 0,
        description: "Base payment without aftermarket products",
      },
    ];

    return tiers.map((tier) => {
      const tierProducts = tier.includeCount === 0 ? [] : sorted.slice(0, tier.includeCount);
      const totalRetail = tierProducts.reduce((sum, product) => {
        const retail = Number((product.retailPricing as any)?.recommended ?? 0);
        return sum + retail;
      }, 0);
      const monthlyAddOn = tier.includeCount === 0 || termMonths === 0 ? 0 : totalRetail / termMonths;
      const monthlyPayment = Math.round((basePayment.monthlyPayment + monthlyAddOn) * 100) / 100;

      return {
        name: tier.name,
        description: tier.description,
        monthlyPayment,
        products: tierProducts.map((product) => ({
          id: product.id,
          name: product.name,
          category: product.category,
          price: Number((product.retailPricing as any)?.recommended ?? 0),
        })),
      };
    });
  }
}
