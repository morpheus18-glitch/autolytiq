/**
 * Calculation Engine
 * 
 * Core tax and fee computation logic for automotive deals.
 * Handles purchase and lease calculations with state-specific tax rules.
 */

import type { TaxRule, FeeCatalogItem } from '@shared/schema';

export interface DealInputs {
  vehiclePrice: number;
  vehicleCost?: number;
  tradeValue: number;
  tradePayoff: number;
  downPayment: number;
  rebates: number;
  warrantyPrice?: number;
  gapPrice?: number;
  financeReserveAmount?: number;
  financeReserveType?: 'percent' | 'flat';
}

export interface FeeLineItem {
  code: string;
  label: string;
  amount: number; // in dollars
  taxable: boolean;
}

export interface TaxLineItem {
  label: string;
  basis: string;
  rate: number;
  amount: number; // in dollars
  ruleId: number;
}

export interface LeaseBreakdown {
  capCost: number;
  capCostReduction: number;
  adjustedCapCost: number;
  residual: number;
  depreciation: number;
  basePayment: number;
  rentCharge: number;
  totalTax: number;
  monthlyPayment: number;
}

export interface DealCalculation {
  subtotal: number;
  fees: {
    taxableFees: number;
    nontaxFees: number;
    lineItems: FeeLineItem[];
  };
  taxes: {
    taxBase: number;
    totalTax: number;
    lineItems: TaxLineItem[];
  };
  totals: {
    vehiclePrice: number;
    taxableFees: number;
    nontaxFees: number;
    totalTax: number;
    grandTotal: number;
  };
  tradeEquity: {
    tradeValue: number;
    tradePayoff: number;
    netTradeValue: number;
  };
  profit?: {
    frontEnd: number;
    backEnd: number;
    total: number;
  };
}

export class CalculationEngine {
  /**
   * Calculate total fees and separate taxable vs non-taxable
   */
  static computeFees(
    dealInputs: DealInputs,
    fees: FeeCatalogItem[]
  ): { taxableFees: number; nontaxFees: number; lineItems: FeeLineItem[] } {
    let taxableFees = 0;
    let nontaxFees = 0;
    const lineItems: FeeLineItem[] = [];

    for (const fee of fees) {
      const amount = (fee.amountCents || 0) / 100; // Convert cents to dollars
      
      if (fee.taxable) {
        taxableFees += amount;
      } else {
        nontaxFees += amount;
      }

      lineItems.push({
        code: fee.code || '',
        label: fee.label || '',
        amount,
        taxable: fee.taxable || false,
      });
    }

    return { taxableFees, nontaxFees, lineItems };
  }

  /**
   * Calculate tax base according to tax rules
   */
  static computeTaxBase(
    dealInputs: DealInputs,
    fees: { taxableFees: number },
    rules: TaxRule[]
  ): number {
    if (rules.length === 0) {
      return 0;
    }

    // Use the basis from the first rule (they should all be consistent for a jurisdiction)
    const primaryRule = rules[0];
    const basis = primaryRule.basis;

    const { vehiclePrice, tradeValue, tradePayoff } = dealInputs;
    const netTradeValue = tradeValue - tradePayoff;

    let taxBase = 0;

    switch (basis) {
      case 'price':
        // Tax on full vehicle price + taxable fees (no trade credit)
        taxBase = vehiclePrice + fees.taxableFees;
        break;

      case 'net_of_trade':
        // Tax on vehicle price minus trade allowance + taxable fees
        taxBase = Math.max(0, vehiclePrice - tradeValue) + fees.taxableFees;
        break;

      case 'payment':
        // For lease: tax on monthly payment (not implemented here, handled in lease calc)
        taxBase = 0;
        break;

      case 'cap_cost':
        // For lease: tax on capitalized cost
        taxBase = vehiclePrice + fees.taxableFees;
        break;

      default:
        taxBase = vehiclePrice + fees.taxableFees;
    }

    return Math.max(0, taxBase);
  }

  /**
   * Calculate taxes with support for compound taxes
   */
  static computeTaxes(
    taxBase: number,
    rules: TaxRule[]
  ): { taxLines: TaxLineItem[]; totalTax: number } {
    const taxLines: TaxLineItem[] = [];
    let totalTax = 0;
    let compoundBase = taxBase;

    // Rules are already ordered by precedence
    for (const rule of rules) {
      const rate = parseFloat(rule.rate || '0');
      const currentBase = rule.isCompound ? compoundBase : taxBase;
      const taxAmount = currentBase * rate;

      taxLines.push({
        label: rule.notes || `${(rate * 100).toFixed(2)}% Tax`,
        basis: rule.basis || 'price',
        rate,
        amount: taxAmount,
        ruleId: rule.id,
      });

      totalTax += taxAmount;
      
      // If compound, add this tax to the base for next tax
      if (rule.isCompound) {
        compoundBase += taxAmount;
      }
    }

    return { taxLines, totalTax };
  }

  /**
   * Calculate lease monthly payment
   */
  static computeLeasePayment(
    capCost: number,
    residual: number,
    moneyFactor: number,
    term: number,
    fees: number,
    taxes: number
  ): { monthlyPayment: number; breakdown: LeaseBreakdown } {
    const adjustedCapCost = capCost + fees;
    const depreciation = adjustedCapCost - residual;
    const basePayment = depreciation / term;
    const rentCharge = (adjustedCapCost + residual) * moneyFactor;
    const monthlyTax = taxes / term;
    const monthlyPayment = basePayment + rentCharge + monthlyTax;

    return {
      monthlyPayment,
      breakdown: {
        capCost,
        capCostReduction: 0,
        adjustedCapCost,
        residual,
        depreciation,
        basePayment,
        rentCharge,
        totalTax: taxes,
        monthlyPayment,
      },
    };
  }

  /**
   * Calculate finance monthly payment (simple amortization)
   */
  static computeFinancePayment(
    principal: number,
    apr: number,
    term: number
  ): number {
    if (apr === 0) {
      return principal / term;
    }

    const monthlyRate = apr / 12;
    const payment =
      (principal * monthlyRate * Math.pow(1 + monthlyRate, term)) /
      (Math.pow(1 + monthlyRate, term) - 1);

    return payment;
  }

  /**
   * Main deal calculation orchestrator
   */
  static calculateDeal(
    dealInputs: DealInputs,
    fees: FeeCatalogItem[],
    taxRules: TaxRule[]
  ): DealCalculation {
    // 1. Compute fees
    const feeCalc = this.computeFees(dealInputs, fees);

    // 2. Compute tax base
    const taxBase = this.computeTaxBase(dealInputs, feeCalc, taxRules);

    // 3. Compute taxes
    const taxCalc = this.computeTaxes(taxBase, taxRules);

    // 4. Calculate trade equity
    const netTradeValue = dealInputs.tradeValue - dealInputs.tradePayoff;

    // 5. Calculate totals
    const vehiclePrice = dealInputs.vehiclePrice;
    const taxableFees = feeCalc.taxableFees;
    const nontaxFees = feeCalc.nontaxFees;
    const totalTax = taxCalc.totalTax;
    const grandTotal = vehiclePrice + taxableFees + nontaxFees + totalTax;

    // 6. Calculate profit (if cost provided)
    let profit: { frontEnd: number; backEnd: number; total: number } | undefined;
    
    if (dealInputs.vehicleCost !== undefined) {
      const frontEnd = vehiclePrice - dealInputs.vehicleCost;
      
      let backEnd = 0;
      backEnd += dealInputs.warrantyPrice || 0;
      backEnd += dealInputs.gapPrice || 0;
      
      if (dealInputs.financeReserveAmount) {
        if (dealInputs.financeReserveType === 'percent') {
          // Calculate percentage of amount financed
          const amountFinanced = grandTotal - dealInputs.downPayment - netTradeValue;
          backEnd += amountFinanced * (dealInputs.financeReserveAmount / 100);
        } else {
          // Flat dollar amount
          backEnd += dealInputs.financeReserveAmount;
        }
      }

      profit = {
        frontEnd,
        backEnd,
        total: frontEnd + backEnd,
      };
    }

    return {
      subtotal: vehiclePrice,
      fees: {
        taxableFees: feeCalc.taxableFees,
        nontaxFees: feeCalc.nontaxFees,
        lineItems: feeCalc.lineItems,
      },
      taxes: {
        taxBase,
        totalTax: taxCalc.totalTax,
        lineItems: taxCalc.taxLines,
      },
      totals: {
        vehiclePrice,
        taxableFees,
        nontaxFees,
        totalTax,
        grandTotal,
      },
      tradeEquity: {
        tradeValue: dealInputs.tradeValue,
        tradePayoff: dealInputs.tradePayoff,
        netTradeValue,
      },
      profit,
    };
  }

  /**
   * Helper: Calculate amount financed
   */
  static calculateAmountFinanced(
    grandTotal: number,
    downPayment: number,
    netTradeValue: number,
    rebates: number
  ): number {
    return Math.max(0, grandTotal - downPayment - netTradeValue - rebates);
  }

  /**
   * Helper: Format currency
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  }

  /**
   * Helper: Format percentage
   */
  static formatPercent(rate: number, decimals: number = 2): string {
    return `${(rate * 100).toFixed(decimals)}%`;
  }
}
