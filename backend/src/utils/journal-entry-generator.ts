import {
  AccountType,
  GLAccount,
  JournalStatus,
  LineType,
  NormalBalance,
  PrismaClient,
} from '@prisma/client';
import { BadRequest, NotFound } from '../lib/errors.js';

export interface JournalEntryLineInput {
  glAccountId: string;
  type: LineType;
  amount: number;
  description?: string;
}

export interface GeneratedJournalEntry {
  memo: string;
  postingDate: Date;
  lines: JournalEntryLineInput[];
}

type AccountPreference = {
  accountNumber?: string;
  accountType?: AccountType;
  normalBalance?: NormalBalance;
  fallbackName?: RegExp;
};

const DEFAULT_ACCOUNT_MAPPING: Record<string, AccountPreference> = {
  cash: { accountNumber: '1000', accountType: AccountType.ASSET, fallbackName: /cash|bank/i },
  accountsReceivable: { accountNumber: '1200', accountType: AccountType.ASSET, fallbackName: /receivable/i },
  salesRevenue: { accountNumber: '4000', accountType: AccountType.REVENUE, fallbackName: /vehicle revenue|sales/i },
  dealerReserve: { accountNumber: '4100', accountType: AccountType.REVENUE, fallbackName: /reserve/i },
  cogs: { accountNumber: '5000', accountType: AccountType.EXPENSE, fallbackName: /cogs|cost of goods/i },
  inventory: { accountNumber: '1400', accountType: AccountType.ASSET, fallbackName: /inventory/i },
  salesTaxPayable: { accountNumber: '2200', accountType: AccountType.LIABILITY, fallbackName: /sales tax/i },
  payrollExpense: { accountNumber: '5200', accountType: AccountType.EXPENSE, fallbackName: /payroll expense/i },
  payrollLiability: { accountNumber: '2300', accountType: AccountType.LIABILITY, fallbackName: /payroll liabilities/i },
  payrollTaxPayable: { accountNumber: '2310', accountType: AccountType.LIABILITY, fallbackName: /tax payable/i },
};

async function resolveAccount(
  prisma: PrismaClient,
  tenantId: string,
  preference: AccountPreference,
  context: string,
): Promise<GLAccount> {
  const where: Record<string, unknown> = { tenantId, isActive: true };
  if (preference.accountNumber) {
    where.accountNumber = preference.accountNumber;
  }
  if (preference.accountType) {
    where.accountType = preference.accountType;
  }
  if (preference.normalBalance) {
    where.normalBalance = preference.normalBalance;
  }

  let account = await prisma.gLAccount.findFirst({
    where,
    orderBy: { accountNumber: 'asc' },
  });

  if (!account && preference.fallbackName) {
    const candidates = await prisma.gLAccount.findMany({
      where: {
        tenantId,
        isActive: true,
        ...(preference.accountType ? { accountType: preference.accountType } : {}),
        ...(preference.normalBalance ? { normalBalance: preference.normalBalance } : {}),
      },
      orderBy: { accountNumber: 'asc' },
    });
    account = candidates.find((candidate) => preference.fallbackName!.test(candidate.accountName)) ?? null;
  }

  if (!account) {
    throw BadRequest(`Unable to resolve ${context} account. Please configure the chart of accounts.`);
  }

  return account;
}

function toAmount(value: unknown): number {
  if (!value) {
    return 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? Math.round((numeric + Number.EPSILON) * 100) / 100 : 0;
}

function pushLine(lines: JournalEntryLineInput[], line: JournalEntryLineInput) {
  if (line.amount <= 0) {
    return;
  }
  lines.push({ ...line, amount: Math.round((line.amount + Number.EPSILON) * 100) / 100 });
}

function calculateTotals(lines: JournalEntryLineInput[]) {
  let debit = 0;
  let credit = 0;
  for (const line of lines) {
    if (line.type === LineType.DEBIT) {
      debit += line.amount;
    } else {
      credit += line.amount;
    }
  }
  return { debit: Math.round(debit * 100) / 100, credit: Math.round(credit * 100) / 100 };
}

function ensureBalanced(lines: JournalEntryLineInput[]) {
  const { debit, credit } = calculateTotals(lines);
  const delta = Math.abs(debit - credit);
  if (delta > 0.01) {
    throw BadRequest(`Journal entry is not balanced. Debits ${debit.toFixed(2)} / Credits ${credit.toFixed(2)}`);
  }
}

export function assertBalancedLines(lines: JournalEntryLineInput[]) {
  ensureBalanced(lines);
}

async function generateEntryNumber(
  prisma: PrismaClient,
  tenantId: string,
  postingDate: Date,
): Promise<string> {
  const start = new Date(postingDate);
  start.setHours(0, 0, 0, 0);
  const end = new Date(postingDate);
  end.setHours(23, 59, 59, 999);

  const count = await prisma.journalEntry.count({
    where: {
      tenantId,
      postingDate: {
        gte: start,
        lte: end,
      },
    },
  });

  const sequence = (count + 1).toString().padStart(4, '0');
  const yyyy = postingDate.getUTCFullYear();
  const mm = (postingDate.getUTCMonth() + 1).toString().padStart(2, '0');
  const dd = postingDate.getUTCDate().toString().padStart(2, '0');
  return `JE-${yyyy}${mm}${dd}-${sequence}`;
}

export async function generateJournalEntryFromDeal(
  prisma: PrismaClient,
  tenantId: string,
  dealId: string,
): Promise<GeneratedJournalEntry> {
  const deal = await prisma.deal.findFirst({
    where: { id: dealId, tenantId },
    include: {
      vehicle: true,
      customer: true,
    },
  });

  if (!deal) {
    throw NotFound('Deal not found');
  }

  const postingDate = deal.deliveryDate ?? deal.dealDate ?? new Date();

  const [cashAccount, arAccount, revenueAccount, dealerReserveAccount, cogsAccount, inventoryAccount, salesTaxAccount] =
    await Promise.all([
      resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.cash, 'cash'),
      resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.accountsReceivable, 'accounts receivable'),
      resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.salesRevenue, 'sales revenue'),
      resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.dealerReserve, 'dealer reserve'),
      resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.cogs, 'cost of goods sold'),
      resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.inventory, 'inventory'),
      resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.salesTaxPayable, 'sales tax payable'),
    ]);

  const lines: JournalEntryLineInput[] = [];

  const netPrice = toAmount(deal.netVehiclePrice);
  const docFee = toAmount(deal.docFee);
  const registrationFee = toAmount(deal.registrationFee);
  const salesTax = toAmount(deal.salesTax);
  const dealerReserve = toAmount(deal.dealerReserve);
  const downPayment = toAmount(deal.downPayment);
  const amountFinanced = toAmount(deal.amountFinanced);
  const vehicleCost = toAmount(deal.vehicle.invoiceCost);
  const tradeAllowance = toAmount(deal.tradeAllowance);
  const tradePayoff = toAmount(deal.tradePayoff);
  const gapRevenue = toAmount(deal.gapCost);
  const maintenanceRevenue = toAmount(deal.maintenanceCost);
  const warrantyRevenue = toAmount(deal.warrantyCost);

  const revenueTotal = netPrice + docFee + registrationFee + gapRevenue + maintenanceRevenue + warrantyRevenue + dealerReserve;

  pushLine(lines, {
    glAccountId: revenueAccount.id,
    type: LineType.CREDIT,
    amount: revenueTotal - dealerReserve,
    description: 'Vehicle and F&I revenue',
  });

  if (dealerReserve > 0) {
    pushLine(lines, {
      glAccountId: dealerReserveAccount.id,
      type: LineType.CREDIT,
      amount: dealerReserve,
      description: 'Dealer reserve income',
    });
  }

  if (salesTax > 0) {
    pushLine(lines, {
      glAccountId: salesTaxAccount.id,
      type: LineType.CREDIT,
      amount: salesTax,
      description: 'Sales tax payable',
    });
  }

  if (vehicleCost > 0) {
    pushLine(lines, {
      glAccountId: cogsAccount.id,
      type: LineType.DEBIT,
      amount: vehicleCost,
      description: 'Cost of goods sold',
    });

    pushLine(lines, {
      glAccountId: inventoryAccount.id,
      type: LineType.CREDIT,
      amount: vehicleCost,
      description: 'Inventory relief',
    });
  }

  if (tradeAllowance > 0) {
    pushLine(lines, {
      glAccountId: inventoryAccount.id,
      type: LineType.DEBIT,
      amount: tradeAllowance,
      description: 'Trade-in inventory',
    });
  }

  if (tradePayoff > 0) {
    const tradePayableAccount = await resolveAccount(
      prisma,
      tenantId,
      { accountNumber: '2350', accountType: AccountType.LIABILITY, fallbackName: /trade.*payable/i },
      'trade payoff liability',
    );
    pushLine(lines, {
      glAccountId: tradePayableAccount.id,
      type: LineType.CREDIT,
      amount: tradePayoff,
      description: 'Trade payoff liability',
    });
  }

  if (downPayment > 0) {
    pushLine(lines, {
      glAccountId: cashAccount.id,
      type: LineType.DEBIT,
      amount: downPayment,
      description: 'Customer cash down payment',
    });
  }

  const { debit, credit } = calculateTotals(lines);
  const outstanding = Math.round((credit - debit) * 100) / 100;
  if (outstanding !== 0) {
    pushLine(lines, {
      glAccountId: arAccount.id,
      type: outstanding > 0 ? LineType.DEBIT : LineType.CREDIT,
      amount: Math.abs(outstanding),
      description: 'Vehicle receivable balance',
    });
  }

  ensureBalanced(lines);

  return {
    memo: `Deal ${deal.dealNumber} - ${deal.customer.firstName ?? ''} ${deal.customer.lastName ?? ''}`.trim(),
    postingDate,
    lines,
  };
}

export async function createJournalEntryFromGenerated(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  payload: GeneratedJournalEntry,
  status: JournalStatus = JournalStatus.POSTED,
  dealId?: string,
) {
  ensureBalanced(payload.lines);
  const entryNumber = await generateEntryNumber(prisma, tenantId, payload.postingDate);

  return prisma.journalEntry.create({
    data: {
      tenantId,
      entryNumber,
      memo: payload.memo,
      status,
      postingDate: payload.postingDate,
      postedById: userId,
      postedAt: status === JournalStatus.POSTED ? new Date() : null,
      dealId,
      lines: {
        createMany: {
          data: payload.lines.map((line) => ({
            tenantId,
            glAccountId: line.glAccountId,
            type: line.type,
            amount: line.amount,
            description: line.description,
          })),
        },
      },
    },
  });
}

export async function createPayrollJournalEntry(
  prisma: PrismaClient,
  tenantId: string,
  userId: string,
  postingDate: Date,
  totals: { gross: number; net: number; employeeWithholding: number; employerTaxes: number },
  cashAccountId?: string,
) {
  const [payrollExpenseAccount, payrollLiabilityAccount, payrollTaxAccount, cashAccount] = await Promise.all([
    resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.payrollExpense, 'payroll expense'),
    resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.payrollLiability, 'payroll liability'),
    resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.payrollTaxPayable, 'payroll tax payable'),
    cashAccountId
      ? prisma.gLAccount.findFirst({ where: { tenantId, id: cashAccountId } }).then((account) => {
          if (!account) {
            throw BadRequest('Invalid cash account for payroll posting');
          }
          return account;
        })
      : resolveAccount(prisma, tenantId, DEFAULT_ACCOUNT_MAPPING.cash, 'cash'),
  ]);

  const lines: JournalEntryLineInput[] = [
    { glAccountId: payrollExpenseAccount.id, type: LineType.DEBIT, amount: totals.gross, description: 'Payroll expense' },
  ];

  if (totals.employerTaxes > 0) {
    lines.push({
      glAccountId: payrollExpenseAccount.id,
      type: LineType.DEBIT,
      amount: totals.employerTaxes,
      description: 'Employer payroll taxes',
    });
  }

  if (totals.employeeWithholding > 0) {
    lines.push({
      glAccountId: payrollTaxAccount.id,
      type: LineType.CREDIT,
      amount: totals.employeeWithholding,
      description: 'Payroll taxes payable',
    });
  }

  lines.push({
    glAccountId: payrollLiabilityAccount.id,
    type: LineType.CREDIT,
    amount: totals.gross - totals.employeeWithholding,
    description: 'Net payroll liability',
  });

  lines.push({
    glAccountId: cashAccount.id,
    type: LineType.CREDIT,
    amount: totals.net,
    description: 'Payroll cash disbursement',
  });

  ensureBalanced(lines);

  return createJournalEntryFromGenerated(
    prisma,
    tenantId,
    userId,
    {
      memo: 'Automated payroll journal entry',
      postingDate,
      lines,
    },
    JournalStatus.POSTED,
  );
}

export type DealJournalEntryLine = {
  accountNumber: string;
  debit: number;
  credit: number;
  memo: string;
};

export type DealJournalEntryPayload = {
  date: Date;
  description: string;
  type: 'AUTO_DEAL';
  dealId: string;
  lines: DealJournalEntryLine[];
};

export type Deal = {
  id: string;
  dealNumber: string;
  closedDate: Date | string;
  sellingPrice?: number | null;
  cashDown?: number | null;
  amountFinanced?: number | null;
  vehicleCost?: number | null;
  tradeInValue?: number | null;
  fiProducts?: number | null;
  salespersonName?: string | null;
};

const toNumber = (value: number | string | null | undefined): number => {
  if (value == null) {
    return 0;
  }
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : 0;
};

const calculateCommission = (deal: Deal) => {
  const frontGross = toNumber(deal.sellingPrice) - toNumber(deal.vehicleCost);
  const backGross = toNumber(deal.fiProducts) * 0.5; // assume 50% margin

  let frontCommission = 0;
  if (frontGross <= 1000) frontCommission = frontGross * 0.03;
  else if (frontGross <= 2000) frontCommission = 30 + (frontGross - 1000) * 0.04;
  else frontCommission = 30 + 40 + (frontGross - 2000) * 0.05;

  const backCommission = backGross * 0.05;
  return frontCommission + backCommission;
};

export const generateDealJournalEntry = async (deal: Deal): Promise<DealJournalEntryPayload> => {
  const lines: DealJournalEntryLine[] = [];

  const cashDown = toNumber(deal.cashDown);
  const amountFinanced = toNumber(deal.amountFinanced);
  const sellingPrice = toNumber(deal.sellingPrice);
  const vehicleCost = toNumber(deal.vehicleCost);
  const tradeInValue = toNumber(deal.tradeInValue);
  const fiProducts = toNumber(deal.fiProducts);

  if (cashDown > 0) {
    lines.push({ accountNumber: '1110', debit: cashDown, credit: 0, memo: 'Cash down payment' });
  }
  if (amountFinanced > 0) {
    lines.push({ accountNumber: '1120', debit: amountFinanced, credit: 0, memo: 'Financed amount' });
  }
  if (sellingPrice > 0) {
    lines.push({ accountNumber: '4110', debit: 0, credit: sellingPrice, memo: 'Vehicle sale' });
  }

  if (vehicleCost > 0) {
    lines.push({ accountNumber: '5100', debit: vehicleCost, credit: 0, memo: 'Cost of vehicle sold' });
    lines.push({ accountNumber: '1140', debit: 0, credit: vehicleCost, memo: 'Remove from inventory' });
  }

  if (tradeInValue > 0) {
    lines.push({ accountNumber: '1140', debit: tradeInValue, credit: 0, memo: 'Trade-in vehicle' });
    lines.push({ accountNumber: '2160', debit: 0, credit: tradeInValue, memo: 'Trade-in credit' });
  }

  if (fiProducts > 0) {
    lines.push({ accountNumber: '1110', debit: fiProducts, credit: 0, memo: 'F&I products' });
    lines.push({ accountNumber: '4200', debit: 0, credit: fiProducts, memo: 'F&I products sold' });
  }

  const commission = calculateCommission(deal);
  if (commission > 0) {
    lines.push({
      accountNumber: '6200',
      debit: commission,
      credit: 0,
      memo: `Commission - ${deal.salespersonName ?? 'Salesperson'}`,
    });
    lines.push({ accountNumber: '2150', debit: 0, credit: commission, memo: 'Commission payable' });
  }

  const date = deal.closedDate instanceof Date ? deal.closedDate : new Date(deal.closedDate);

  return {
    date,
    description: `Vehicle Sale - Deal #${deal.dealNumber}`,
    type: 'AUTO_DEAL',
    dealId: deal.id,
    lines,
  };
};

