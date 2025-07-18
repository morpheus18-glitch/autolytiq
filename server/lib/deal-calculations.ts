import type { Deal, DealProduct } from '@shared/schema';

export interface GrossCalculation {
  frontEndGross: number;
  financeReserve: number;
  productGross: number;
  packCost: number;
  netGross: number;
}

export interface AccountingEntry {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
  memo: string;
}

// Standard dealership pack costs by vehicle category
const PACK_COSTS = {
  new: 500,
  used: 300,
  certified: 400,
};

// Finance reserve calculation (points over buy rate)
const FINANCE_RESERVE_POINTS = 2.0; // 2 points over buy rate

export function calculateDealGross(deal: Deal, products: DealProduct[] = [], vehicleCost: number = 0): GrossCalculation {
  // Front-end gross (sale price - vehicle cost - trade adjustment)
  const tradeAdjustment = (deal.tradeAllowance || 0) - (deal.tradePayoff || 0);
  const frontEndGross = (deal.salePrice || 0) - vehicleCost - Math.max(0, tradeAdjustment);

  // Finance reserve calculation
  // Typically 2 points over buy rate shared between dealer and lender
  const financeAmount = deal.financeBalance || 0;
  const reserveRate = FINANCE_RESERVE_POINTS / 100;
  const financeReserve = financeAmount * reserveRate * ((deal.term || 60) / 12);

  // F&I product gross
  const productGross = products.reduce((total, product) => {
    return total + (product.retailPrice - product.cost);
  }, 0);

  // Pack cost (standard dealer overhead per vehicle)
  const packCost = PACK_COSTS.used; // Default to used vehicle pack

  // Net gross profit
  const netGross = frontEndGross + financeReserve + productGross - packCost;

  return {
    frontEndGross,
    financeReserve,
    productGross,
    packCost,
    netGross,
  };
}

export function generateAccountingEntries(deal: Deal, gross: GrossCalculation): AccountingEntry[] {
  const entries: AccountingEntry[] = [];

  // Vehicle sale revenue
  if (deal.salePrice) {
    entries.push({
      accountCode: '4010',
      accountName: 'Vehicle Sales Revenue',
      debit: 0,
      credit: deal.salePrice,
      memo: `Sale of VIN ${deal.vin} to ${deal.buyerName}`,
    });

    entries.push({
      accountCode: '1210',
      accountName: 'Accounts Receivable',
      debit: deal.salePrice,
      credit: 0,
      memo: `Receivable for deal #${deal.dealNumber}`,
    });
  }

  // Trade-in vehicle
  if (deal.tradeAllowance && deal.tradeAllowance > 0) {
    entries.push({
      accountCode: '1310',
      accountName: 'Trade Vehicle Inventory',
      debit: deal.tradeAllowance,
      credit: 0,
      memo: `Trade-in VIN ${deal.tradeVin} allowance`,
    });
  }

  // Trade payoff
  if (deal.tradePayoff && deal.tradePayoff > 0) {
    entries.push({
      accountCode: '2110',
      accountName: 'Trade Payoffs Payable',
      debit: 0,
      credit: deal.tradePayoff,
      memo: `Payoff for trade VIN ${deal.tradeVin}`,
    });
  }

  // Cash down payment
  if (deal.cashDown && deal.cashDown > 0) {
    entries.push({
      accountCode: '1010',
      accountName: 'Cash',
      debit: deal.cashDown,
      credit: 0,
      memo: `Cash down payment for deal #${deal.dealNumber}`,
    });
  }

  // Finance reserve
  if (gross.financeReserve > 0) {
    entries.push({
      accountCode: '4020',
      accountName: 'Finance Reserve Revenue',
      debit: 0,
      credit: gross.financeReserve,
      memo: `Finance reserve for deal #${deal.dealNumber}`,
    });
  }

  // Sales tax
  if (deal.salesTax && deal.salesTax > 0) {
    entries.push({
      accountCode: '2210',
      accountName: 'Sales Tax Payable',
      debit: 0,
      credit: deal.salesTax,
      memo: `Sales tax for deal #${deal.dealNumber}`,
    });
  }

  // Documentation fees
  if (deal.docFee && deal.docFee > 0) {
    entries.push({
      accountCode: '4030',
      accountName: 'Documentation Fee Revenue',
      debit: 0,
      credit: deal.docFee,
      memo: `Doc fee for deal #${deal.dealNumber}`,
    });
  }

  // Deal gross reserve
  if (gross.netGross !== 0) {
    entries.push({
      accountCode: '3000',
      accountName: 'Deal Gross Reserve',
      debit: gross.netGross > 0 ? 0 : Math.abs(gross.netGross),
      credit: gross.netGross > 0 ? gross.netGross : 0,
      memo: `Net gross for deal #${deal.dealNumber}`,
    });
  }

  return entries;
}

export function calculateMonthlyPayment(
  principal: number,
  annualRate: number,
  termMonths: number
): number {
  if (annualRate === 0) return principal / termMonths;
  
  const monthlyRate = annualRate / 100 / 12;
  const payment = principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / 
                 (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  return Math.round(payment * 100) / 100;
}

export function calculateSalesTax(salePrice: number, taxRate: number = 0.0875): number {
  return Math.round(salePrice * taxRate);
}

export function generateDealNumber(): string {
  const date = new Date();
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  
  return `${year}${month}${day}-${random}`;
}

// Standard F&I products with typical costs and retail prices
export const FI_PRODUCTS = {
  extended_warranty: {
    name: 'Extended Warranty',
    category: 'warranty',
    retailPrice: 2495,
    cost: 1247,
  },
  gap_coverage: {
    name: 'GAP Coverage',
    category: 'gap',
    retailPrice: 795,
    cost: 199,
  },
  tire_wheel: {
    name: 'Tire & Wheel Protection',
    category: 'tire_wheel',
    retailPrice: 1295,
    cost: 295,
  },
  maintenance_plan: {
    name: 'Maintenance Plan',
    category: 'maintenance',
    retailPrice: 1895,
    cost: 695,
  },
  paint_protection: {
    name: 'Paint Protection',
    category: 'protection',
    retailPrice: 1495,
    cost: 295,
  },
};

export function validateDealStructure(deal: Partial<Deal>): string[] {
  const errors: string[] = [];

  if (!deal.buyerName?.trim()) {
    errors.push('Buyer name is required');
  }

  if (!deal.salePrice || deal.salePrice <= 0) {
    errors.push('Sale price must be greater than zero');
  }

  if (!deal.dealType) {
    errors.push('Deal type is required');
  }

  if (deal.tradeAllowance && deal.tradeAllowance < 0) {
    errors.push('Trade allowance cannot be negative');
  }

  if (deal.tradePayoff && deal.tradePayoff < 0) {
    errors.push('Trade payoff cannot be negative');
  }

  if (deal.cashDown && deal.cashDown < 0) {
    errors.push('Cash down cannot be negative');
  }

  return errors;
}