/**
 * Accounting Service
 * Core accounting operations including journal entries, financial statements, and reconciliation
 */

import { db as prisma } from '@repo/db';
import {
  JournalStatus,
  JournalEntryType,
  LineType,
  AccountType,
  type Deal,
  type JournalEntry,
  type GLAccount,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';

// ==================== TYPES ====================

export interface PostDealJournalEntryInput {
  dealId: string;
  tenantId: string;
  userId: string;
  postingDate?: Date;
}

export interface JournalEntryInput {
  tenantId: string;
  entryType: JournalEntryType;
  memo: string;
  postingDate: Date;
  userId: string;
  dealId?: string;
  lines: Array<{
    glAccountId: string;
    type: LineType;
    amount: number;
    description?: string;
  }>;
}

export interface FinancialStatement {
  startDate: Date;
  endDate: Date;
  revenue: {
    vehicleSales: number;
    fiProducts: number;
    serviceRevenue: number;
    total: number;
  };
  cogs: {
    vehicleCost: number;
    reconCost: number;
    packAmount: number;
    total: number;
  };
  grossProfit: {
    frontEnd: number;
    backEnd: number;
    service: number;
    total: number;
    margin: number; // Percentage
  };
  expenses: {
    salaries: number;
    commissions: number;
    advertising: number;
    rent: number;
    utilities: number;
    insurance: number;
    other: number;
    total: number;
  };
  netIncome: number;
  netMargin: number; // Percentage
}

export interface BalanceSheet {
  asOfDate: Date;
  assets: {
    cash: number;
    accountsReceivable: number;
    inventory: number;
    totalCurrent: number;
    fixedAssets: number;
    totalAssets: number;
  };
  liabilities: {
    accountsPayable: number;
    flooring: number; // Floor plan financing
    totalCurrent: number;
    longTermDebt: number;
    totalLiabilities: number;
  };
  equity: {
    capital: number;
    retainedEarnings: number;
    currentPeriod: number;
    totalEquity: number;
  };
}

export interface CashReconciliation {
  date: Date;
  openingBalance: number;
  cashSales: number;
  downPayments: number;
  otherReceipts: number;
  totalReceipts: number;
  expenses: number;
  commissions: number;
  otherDisbursements: number;
  totalDisbursements: number;
  closingBalance: number;
  bankBalance?: number;
  variance?: number;
}

export interface DealProfitAnalysis {
  dealId: string;
  dealNumber: string;
  customerId: string;
  customerName: string;
  vehicleId: string;
  vehicleDescription: string;
  dealDate: Date;
  salesPerson: string;
  frontEndGross: number;
  backEndGross: number;
  reserveGross: number;
  totalGross: number;
  totalCost: number;
  netProfit: number;
  profitMargin: number;
  commissions: Array<{
    userId: string;
    userName: string;
    type: string;
    amount: number;
  }>;
}

// ==================== GL ACCOUNT MANAGEMENT ====================

/**
 * Get or create standard GL accounts for tenant
 */
export async function ensureStandardGLAccounts(tenantId: string): Promise<Map<string, GLAccount>> {
  const accounts = new Map<string, GLAccount>();

  // Define standard chart of accounts for auto dealerships
  const standardAccounts = [
    // ASSETS (1000-1999)
    { number: '1000', name: 'Cash', type: AccountType.ASSET, balance: 'DEBIT' },
    { number: '1100', name: 'Accounts Receivable', type: AccountType.ASSET, balance: 'DEBIT' },
    { number: '1200', name: 'Vehicle Inventory', type: AccountType.ASSET, balance: 'DEBIT' },
    { number: '1210', name: 'Parts Inventory', type: AccountType.ASSET, balance: 'DEBIT' },
    { number: '1500', name: 'Fixed Assets', type: AccountType.ASSET, balance: 'DEBIT' },

    // LIABILITIES (2000-2999)
    { number: '2000', name: 'Accounts Payable', type: AccountType.LIABILITY, balance: 'CREDIT' },
    { number: '2100', name: 'Floor Plan Payable', type: AccountType.LIABILITY, balance: 'CREDIT' },
    { number: '2200', name: 'Commissions Payable', type: AccountType.LIABILITY, balance: 'CREDIT' },
    { number: '2500', name: 'Long-Term Debt', type: AccountType.LIABILITY, balance: 'CREDIT' },

    // EQUITY (3000-3999)
    { number: '3000', name: 'Owner\'s Capital', type: AccountType.EQUITY, balance: 'CREDIT' },
    { number: '3900', name: 'Retained Earnings', type: AccountType.EQUITY, balance: 'CREDIT' },

    // REVENUE (4000-4999)
    { number: '4000', name: 'Vehicle Sales Revenue', type: AccountType.REVENUE, balance: 'CREDIT' },
    { number: '4100', name: 'F&I Product Revenue', type: AccountType.REVENUE, balance: 'CREDIT' },
    { number: '4200', name: 'Service Revenue', type: AccountType.REVENUE, balance: 'CREDIT' },
    { number: '4300', name: 'Finance Reserve', type: AccountType.REVENUE, balance: 'CREDIT' },

    // COGS (5000-5999)
    { number: '5000', name: 'Vehicle Cost of Sales', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '5100', name: 'Reconditioning Cost', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '5200', name: 'Pack Amount', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '5300', name: 'Parts Cost of Sales', type: AccountType.EXPENSE, balance: 'DEBIT' },

    // OPERATING EXPENSES (6000-6999)
    { number: '6000', name: 'Salaries Expense', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '6100', name: 'Commission Expense', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '6200', name: 'Advertising Expense', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '6300', name: 'Rent Expense', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '6400', name: 'Utilities Expense', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '6500', name: 'Insurance Expense', type: AccountType.EXPENSE, balance: 'DEBIT' },
    { number: '6900', name: 'Miscellaneous Expense', type: AccountType.EXPENSE, balance: 'DEBIT' },
  ];

  // Create accounts if they don't exist
  for (const acct of standardAccounts) {
    const existing = await prisma.gLAccount.findUnique({
      where: {
        tenantId_accountNumber: {
          tenantId,
          accountNumber: acct.number,
        },
      },
    });

    if (existing) {
      accounts.set(acct.number, existing);
    } else {
      const created = await prisma.gLAccount.create({
        data: {
          tenantId,
          accountNumber: acct.number,
          accountName: acct.name,
          accountType: acct.type,
          normalBalance: acct.balance as 'DEBIT' | 'CREDIT',
          balance: new Decimal(0),
        },
      });
      accounts.set(acct.number, created);
    }
  }

  return accounts;
}

/**
 * Get GL account by account number
 */
export async function getGLAccountByNumber(
  tenantId: string,
  accountNumber: string
): Promise<GLAccount | null> {
  return prisma.gLAccount.findUnique({
    where: {
      tenantId_accountNumber: { tenantId, accountNumber },
    },
  });
}

// ==================== JOURNAL ENTRY OPERATIONS ====================

/**
 * Create a manual journal entry
 */
export async function createJournalEntry(input: JournalEntryInput): Promise<JournalEntry> {
  // Validate: debits must equal credits
  const totalDebits = input.lines
    .filter(l => l.type === LineType.DEBIT)
    .reduce((sum, l) => sum + l.amount, 0);

  const totalCredits = input.lines
    .filter(l => l.type === LineType.CREDIT)
    .reduce((sum, l) => sum + l.amount, 0);

  if (Math.abs(totalDebits - totalCredits) > 0.01) {
    throw new Error(`Journal entry not balanced: Debits ${totalDebits} != Credits ${totalCredits}`);
  }

  // Generate entry number
  const count = await prisma.journalEntry.count({ where: { tenantId: input.tenantId } });
  const entryNumber = `JE-${String(count + 1).padStart(6, '0')}`;

  // Create journal entry with lines
  const entry = await prisma.journalEntry.create({
    data: {
      tenantId: input.tenantId,
      entryNumber,
      memo: input.memo,
      entryType: input.entryType,
      status: JournalStatus.DRAFT,
      postingDate: input.postingDate,
      postedById: input.userId,
      dealId: input.dealId,
      amountCents: Math.round(totalDebits * 100),
      lines: {
        create: input.lines.map(line => ({
          tenantId: input.tenantId,
          glAccountId: line.glAccountId,
          type: line.type,
          amount: new Decimal(line.amount),
          description: line.description,
        })),
      },
    },
    include: {
      lines: {
        include: {
          glAccount: true,
        },
      },
    },
  });

  return entry;
}

/**
 * Post a journal entry (changes status from DRAFT to POSTED and updates GL balances)
 */
export async function postJournalEntry(
  journalEntryId: string,
  tenantId: string,
  userId: string
): Promise<JournalEntry> {
  const entry = await prisma.journalEntry.findUnique({
    where: { id: journalEntryId },
    include: {
      lines: {
        include: {
          glAccount: true,
        },
      },
    },
  });

  if (!entry || entry.tenantId !== tenantId) {
    throw new Error('Journal entry not found');
  }

  if (entry.status === JournalStatus.POSTED) {
    throw new Error('Journal entry already posted');
  }

  // Update GL account balances
  for (const line of entry.lines) {
    const account = line.glAccount;
    const currentBalance = account.balance ? parseFloat(account.balance.toString()) : 0;
    const lineAmount = parseFloat(line.amount.toString());

    let newBalance: number;

    // Update balance based on normal balance and transaction type
    if (account.normalBalance === 'DEBIT') {
      newBalance = line.type === LineType.DEBIT
        ? currentBalance + lineAmount
        : currentBalance - lineAmount;
    } else {
      newBalance = line.type === LineType.CREDIT
        ? currentBalance + lineAmount
        : currentBalance - lineAmount;
    }

    await prisma.gLAccount.update({
      where: { id: account.id },
      data: { balance: new Decimal(newBalance) },
    });
  }

  // Mark entry as posted
  const posted = await prisma.journalEntry.update({
    where: { id: journalEntryId },
    data: {
      status: JournalStatus.POSTED,
      postedAt: new Date(),
    },
    include: {
      lines: {
        include: {
          glAccount: true,
        },
      },
    },
  });

  return posted;
}

/**
 * Auto-post journal entry from a deal
 * Creates double-entry accounting records for vehicle sale
 */
export async function postDealJournalEntry(input: PostDealJournalEntryInput): Promise<JournalEntry> {
  const { dealId, tenantId, userId, postingDate = new Date() } = input;

  // Get deal with all details
  const deal = await prisma.deal.findUnique({
    where: { id: dealId },
    include: {
      vehicle: true,
      customer: true,
      tradeIn: true,
    },
  });

  if (!deal || deal.tenantId !== tenantId) {
    throw new Error('Deal not found');
  }

  // Ensure GL accounts exist
  const accounts = await ensureStandardGLAccounts(tenantId);

  const lines: JournalEntryInput['lines'] = [];

  // DEBIT: Cash (down payment + trade equity)
  const cashDown = deal.cashDownCents ? deal.cashDownCents / 100 : 0;
  const tradeEquity = deal.tradeEquityCents ? deal.tradeEquityCents / 100 : 0;
  const totalCash = cashDown + tradeEquity;

  if (totalCash > 0) {
    lines.push({
      glAccountId: accounts.get('1000')!.id,
      type: LineType.DEBIT,
      amount: totalCash,
      description: `Cash received - Deal ${deal.dealNumber}`,
    });
  }

  // DEBIT: Accounts Receivable (financed amount)
  const financed = deal.amountFinancedCents ? deal.amountFinancedCents / 100 : 0;
  if (financed > 0) {
    lines.push({
      glAccountId: accounts.get('1100')!.id,
      type: LineType.DEBIT,
      amount: financed,
      description: `Financed amount - Deal ${deal.dealNumber}`,
    });
  }

  // CREDIT: Vehicle Sales Revenue (selling price)
  const sellingPrice = deal.sellingPriceCents ? deal.sellingPriceCents / 100 : parseFloat(deal.netVehiclePrice.toString());
  lines.push({
    glAccountId: accounts.get('4000')!.id,
    type: LineType.CREDIT,
    amount: sellingPrice,
    description: `Vehicle sale - ${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}`,
  });

  // DEBIT: Vehicle Cost of Sales (dealer cost)
  const vehicleCost = deal.dealerCostCents ? deal.dealerCostCents / 100 : 0;
  if (vehicleCost > 0) {
    lines.push({
      glAccountId: accounts.get('5000')!.id,
      type: LineType.DEBIT,
      amount: vehicleCost,
      description: `Cost of vehicle sold - ${deal.vehicle.stockNumber}`,
    });
  }

  // CREDIT: Vehicle Inventory (remove from inventory)
  if (vehicleCost > 0) {
    lines.push({
      glAccountId: accounts.get('1200')!.id,
      type: LineType.CREDIT,
      amount: vehicleCost,
      description: `Remove from inventory - ${deal.vehicle.stockNumber}`,
    });
  }

  // F&I Products
  const fiRevenue = deal.totalFiCents ? deal.totalFiCents / 100 : 0;
  if (fiRevenue > 0) {
    lines.push({
      glAccountId: accounts.get('4100')!.id,
      type: LineType.CREDIT,
      amount: fiRevenue,
      description: `F&I products - Deal ${deal.dealNumber}`,
    });
  }

  // Finance Reserve
  const reserve = deal.reserveGrossCents ? deal.reserveGrossCents / 100 : 0;
  if (reserve > 0) {
    lines.push({
      glAccountId: accounts.get('4300')!.id,
      type: LineType.CREDIT,
      amount: reserve,
      description: `Finance reserve - Deal ${deal.dealNumber}`,
    });
  }

  // Pack Amount
  const pack = deal.packCents ? deal.packCents / 100 : 0;
  if (pack > 0) {
    lines.push({
      glAccountId: accounts.get('5200')!.id,
      type: LineType.DEBIT,
      amount: pack,
      description: `Pack - Deal ${deal.dealNumber}`,
    });
  }

  // Create and post journal entry
  const entry = await createJournalEntry({
    tenantId,
    entryType: JournalEntryType.DEAL_POSTING,
    memo: `Auto-posted from Deal ${deal.dealNumber} - ${deal.customer.firstName} ${deal.customer.lastName}`,
    postingDate,
    userId,
    dealId,
    lines,
  });

  // Auto-post immediately
  return postJournalEntry(entry.id, tenantId, userId);
}

// ==================== FINANCIAL STATEMENTS ====================

/**
 * Generate Profit & Loss Statement
 */
export async function generateProfitLoss(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<FinancialStatement> {
  // Get all deals in period
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      dealDate: {
        gte: startDate,
        lte: endDate,
      },
      status: 'DELIVERED',
    },
    include: {
      vehicle: true,
    },
  });

  // Calculate revenue
  const vehicleSales = deals.reduce((sum, d) => {
    const price = d.sellingPriceCents ? d.sellingPriceCents / 100 : parseFloat(d.netVehiclePrice.toString());
    return sum + price;
  }, 0);

  const fiProducts = deals.reduce((sum, d) => {
    const fi = d.totalFiCents ? d.totalFiCents / 100 : 0;
    return sum + fi;
  }, 0);

  // Get service revenue from service orders
  const serviceOrders = await prisma.serviceOrder.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: 'COMPLETED',
    },
  });

  const serviceRevenue = serviceOrders.reduce((sum, so) => {
    return sum + parseFloat(so.totalPrice.toString());
  }, 0);

  const totalRevenue = vehicleSales + fiProducts + serviceRevenue;

  // Calculate COGS
  const vehicleCost = deals.reduce((sum, d) => {
    const cost = d.dealerCostCents ? d.dealerCostCents / 100 : 0;
    return sum + cost;
  }, 0);

  const reconCost = 0; // TODO: Calculate from service orders tagged as recon
  const packAmount = deals.reduce((sum, d) => {
    const pack = d.packCents ? d.packCents / 100 : 0;
    return sum + pack;
  }, 0);

  const totalCOGS = vehicleCost + reconCost + packAmount;

  // Calculate gross profit
  const frontEndGross = deals.reduce((sum, d) => {
    const gross = d.frontGrossCents ? d.frontGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const backEndGross = deals.reduce((sum, d) => {
    const gross = d.backGrossCents ? d.backGrossCents / 100 : 0;
    return sum + gross;
  }, 0);

  const totalGross = frontEndGross + backEndGross + serviceRevenue;
  const grossMargin = totalRevenue > 0 ? (totalGross / totalRevenue) * 100 : 0;

  // Calculate expenses
  const commissions = await prisma.commission.findMany({
    where: {
      tenantId,
      createdAt: { gte: startDate, lte: endDate },
      status: { in: ['APPROVED', 'PAID'] },
    },
  });

  const commissionTotal = commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

  // Get expenses from GL accounts (6000-6999)
  const expenseAccounts = await prisma.gLAccount.findMany({
    where: {
      tenantId,
      accountType: AccountType.EXPENSE,
      accountNumber: {
        gte: '6000',
        lt: '7000',
      },
    },
  });

  const expensesByCategory = {
    salaries: expenseAccounts.find(a => a.accountNumber === '6000')?.balance ? parseFloat(expenseAccounts.find(a => a.accountNumber === '6000')!.balance!.toString()) : 0,
    commissions: commissionTotal,
    advertising: expenseAccounts.find(a => a.accountNumber === '6200')?.balance ? parseFloat(expenseAccounts.find(a => a.accountNumber === '6200')!.balance!.toString()) : 0,
    rent: expenseAccounts.find(a => a.accountNumber === '6300')?.balance ? parseFloat(expenseAccounts.find(a => a.accountNumber === '6300')!.balance!.toString()) : 0,
    utilities: expenseAccounts.find(a => a.accountNumber === '6400')?.balance ? parseFloat(expenseAccounts.find(a => a.accountNumber === '6400')!.balance!.toString()) : 0,
    insurance: expenseAccounts.find(a => a.accountNumber === '6500')?.balance ? parseFloat(expenseAccounts.find(a => a.accountNumber === '6500')!.balance!.toString()) : 0,
    other: expenseAccounts.find(a => a.accountNumber === '6900')?.balance ? parseFloat(expenseAccounts.find(a => a.accountNumber === '6900')!.balance!.toString()) : 0,
  };

  const totalExpenses = Object.values(expensesByCategory).reduce((sum, val) => sum + val, 0);

  const netIncome = totalGross - totalExpenses;
  const netMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

  return {
    startDate,
    endDate,
    revenue: {
      vehicleSales,
      fiProducts,
      serviceRevenue,
      total: totalRevenue,
    },
    cogs: {
      vehicleCost,
      reconCost,
      packAmount,
      total: totalCOGS,
    },
    grossProfit: {
      frontEnd: frontEndGross,
      backEnd: backEndGross,
      service: serviceRevenue,
      total: totalGross,
      margin: grossMargin,
    },
    expenses: expensesByCategory,
    netIncome,
    netMargin,
  };
}

/**
 * Generate Balance Sheet
 */
export async function generateBalanceSheet(
  tenantId: string,
  asOfDate: Date = new Date()
): Promise<BalanceSheet> {
  const accounts = await prisma.gLAccount.findMany({
    where: { tenantId, isActive: true },
  });

  const getBalance = (accountNumber: string): number => {
    const account = accounts.find(a => a.accountNumber === accountNumber);
    return account?.balance ? parseFloat(account.balance.toString()) : 0;
  };

  // Get inventory value
  const inventoryValue = await prisma.vehicle.aggregate({
    where: {
      tenantId,
      status: { in: ['AVAILABLE', 'PENDING', 'RECON'] },
    },
    _sum: {
      costCents: true,
    },
  });

  const inventory = inventoryValue._sum.costCents ? inventoryValue._sum.costCents / 100 : 0;

  const cash = getBalance('1000');
  const ar = getBalance('1100');
  const fixedAssets = getBalance('1500');
  const totalAssets = cash + ar + inventory + fixedAssets;

  const ap = getBalance('2000');
  const flooring = getBalance('2100');
  const commissionsPayable = getBalance('2200');
  const totalCurrentLiabilities = ap + flooring + commissionsPayable;
  const longTermDebt = getBalance('2500');
  const totalLiabilities = totalCurrentLiabilities + longTermDebt;

  const capital = getBalance('3000');
  const retainedEarnings = getBalance('3900');
  const currentPeriod = totalAssets - totalLiabilities - capital - retainedEarnings;
  const totalEquity = capital + retainedEarnings + currentPeriod;

  return {
    asOfDate,
    assets: {
      cash,
      accountsReceivable: ar,
      inventory,
      totalCurrent: cash + ar + inventory,
      fixedAssets,
      totalAssets,
    },
    liabilities: {
      accountsPayable: ap,
      flooring,
      totalCurrent: totalCurrentLiabilities,
      longTermDebt,
      totalLiabilities,
    },
    equity: {
      capital,
      retainedEarnings,
      currentPeriod,
      totalEquity,
    },
  };
}

/**
 * Cash reconciliation report
 */
export async function generateCashReconciliation(
  tenantId: string,
  date: Date
): Promise<CashReconciliation> {
  const startOfDay = new Date(date);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setHours(23, 59, 59, 999);

  // Get opening balance (cash account balance at start of day)
  const cashAccount = await getGLAccountByNumber(tenantId, '1000');
  const openingBalance = cashAccount?.balance ? parseFloat(cashAccount.balance.toString()) : 0;

  // Get cash transactions for the day
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startOfDay, lte: endOfDay },
      status: { in: ['DELIVERED', 'FUNDED'] },
    },
  });

  const cashSales = deals.reduce((sum, d) => {
    const cash = d.cashDownCents ? d.cashDownCents / 100 : 0;
    return sum + cash;
  }, 0);

  const downPayments = cashSales;

  const commissions = await prisma.commission.findMany({
    where: {
      tenantId,
      paidDate: { gte: startOfDay, lte: endOfDay },
      status: 'PAID',
    },
  });

  const commissionsPaid = commissions.reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0);

  const totalReceipts = cashSales + downPayments;
  const totalDisbursements = commissionsPaid;
  const closingBalance = openingBalance + totalReceipts - totalDisbursements;

  return {
    date,
    openingBalance,
    cashSales,
    downPayments,
    otherReceipts: 0,
    totalReceipts,
    expenses: 0,
    commissions: commissionsPaid,
    otherDisbursements: 0,
    totalDisbursements,
    closingBalance,
  };
}

/**
 * Get deal profit analysis
 */
export async function getDealProfitAnalysis(
  tenantId: string,
  startDate: Date,
  endDate: Date
): Promise<DealProfitAnalysis[]> {
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      dealDate: { gte: startDate, lte: endDate },
      status: { in: ['DELIVERED', 'FUNDED'] },
    },
    include: {
      customer: true,
      vehicle: true,
      salesPerson: true,
      commissions: {
        include: {
          user: true,
        },
      },
    },
  });

  return deals.map(deal => {
    const frontGross = deal.frontGrossCents ? deal.frontGrossCents / 100 : 0;
    const backGross = deal.backGrossCents ? deal.backGrossCents / 100 : 0;
    const reserveGross = deal.reserveGrossCents ? deal.reserveGrossCents / 100 : 0;
    const totalGross = deal.totalGrossCents ? deal.totalGrossCents / 100 : 0;
    const totalCost = deal.dealerCostCents ? deal.dealerCostCents / 100 : 0;
    const netProfit = totalGross - totalCost;
    const profitMargin = totalGross > 0 ? (netProfit / totalGross) * 100 : 0;

    return {
      dealId: deal.id,
      dealNumber: deal.dealNumber,
      customerId: deal.customerId,
      customerName: `${deal.customer.firstName} ${deal.customer.lastName}`,
      vehicleId: deal.vehicleId,
      vehicleDescription: `${deal.vehicle.year} ${deal.vehicle.make} ${deal.vehicle.model}`,
      dealDate: deal.dealDate,
      salesPerson: `${deal.salesPerson.firstName} ${deal.salesPerson.lastName}`,
      frontEndGross: frontGross,
      backEndGross: backGross,
      reserveGross,
      totalGross,
      totalCost,
      netProfit,
      profitMargin,
      commissions: deal.commissions.map(c => ({
        userId: c.userId,
        userName: `${c.user.firstName} ${c.user.lastName}`,
        type: c.commissionType,
        amount: parseFloat(c.amount.toString()),
      })),
    };
  });
}
