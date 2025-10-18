import {
  AccountType,
  CommissionStatus,
  JournalStatus,
  NormalBalance,
  PayrollStatus,
  Prisma,
  TaxReportType,
} from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import type { TransportOptions } from 'nodemailer';
import prisma from '../lib/prisma.js';
import { BadRequest, NotFound } from '../lib/errors.js';
import {
  buildIncomeStatement,
  buildBalanceSheet,
  buildCashFlowStatement,
  getAccountBalances,
  type FinancialStatementResult,
  type StatementOptions,
} from '../utils/financial-statement-generator.js';
import {
  calculatePayrollPreview,
  type PayrollCalculationOptions,
} from '../utils/payroll-calculator.js';
import {
  generateJournalEntryFromDeal,
  createJournalEntryFromGenerated,
  createPayrollJournalEntry,
  assertBalancedLines,
  type JournalEntryLineInput,
} from '../utils/journal-entry-generator.js';
import {
  exportStatementToPdf,
  exportStatementToExcel,
  exportStatementToQuickBooks,
  sendReportEmail,
  type ExportFormat,
} from '../utils/export-handlers.js';

const DEFAULT_STATEMENT_RANGE_DAYS = 30;

type DateRange = { startDate: Date; endDate: Date };

type StatementComparisonRange = { startDate?: Date; endDate?: Date };

export interface ProfitAndLossLine {
  accountId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  percentOfRevenue: number;
  comparisonAmount?: number;
  variance?: number;
  variancePercent?: number;
}

export interface ProfitAndLossSection {
  label: string;
  total: number;
  percentOfRevenue: number;
  comparisonTotal?: number;
  varianceTotal?: number;
  lines: ProfitAndLossLine[];
}

export interface ProfitAndLossStatement {
  period: { startDate: string; endDate: string };
  sections: ProfitAndLossSection[];
  totals: { revenue: number; grossProfit: number; netIncome: number };
  comparison?: {
    period: { startDate: string; endDate: string };
    totals: { revenue: number; grossProfit: number; netIncome: number };
  };
}

export interface BalanceSheetAccountLine {
  accountId: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  comparisonBalance?: number;
  variance?: number;
}

export interface BalanceSheetSection {
  type: AccountType;
  total: number;
  comparisonTotal?: number;
  varianceTotal?: number;
  accounts: BalanceSheetAccountLine[];
}

export interface BalanceSheetRatios {
  assetsToLiabilities: number;
  debtToEquity: number;
  equityRatio: number;
}

export interface BalanceSheetStatement {
  asOf: string;
  sections: BalanceSheetSection[];
  totals: {
    assets: number;
    liabilities: number;
    equity: number;
    liabilitiesAndEquity: number;
  };
  ratios: BalanceSheetRatios;
  comparison?: {
    asOf: string;
    totals: {
      assets: number;
      liabilities: number;
      equity: number;
      liabilitiesAndEquity: number;
    };
  };
}

export interface CashFlowLine {
  label: string;
  amount: number;
}

export interface CashFlowSection {
  category: 'OPERATING' | 'INVESTING' | 'FINANCING' | 'SUPPLEMENTAL';
  label: string;
  total: number;
  lines: CashFlowLine[];
}

export interface CashFlowStatement {
  period: { startDate: string; endDate: string };
  method: 'INDIRECT' | 'DIRECT';
  sections: CashFlowSection[];
  totals: {
    netChange: number;
    operating: number;
    investing: number;
    financing: number;
  };
  cash: { opening: number; closing: number };
}

export interface PayrollComputationResult {
  period: { startDate: string; endDate: string };
  employees: PayrollPreviewResult['lines'];
  totals: PayrollPreviewResult['totals'];
}

export interface ChartOfAccountsImportResult {
  summary: { created: number; existing: number; failed: number };
  accounts: Array<{
    accountNumber: string;
    accountName: string;
    status: 'created' | 'exists' | 'failed';
    message?: string;
    id?: string;
  }>;
}

type JournalEntryPayload = {
  memo?: string;
  postingDate: Date;
  status?: JournalStatus;
  dealId?: string;
  lines: JournalEntryLineInput[];
};

type JournalEntryFilters = {
  status?: JournalStatus;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  skip?: number;
  take?: number;
  accountId?: string;
};

type ExportResult = {
  filename: string;
  contentType: string;
  body: Buffer;
};

type PayrollFinalizeOptions = PayrollCalculationOptions & {
  approve?: boolean;
  cashAccountId?: string;
};

type TaxReportInput = {
  type: TaxReportType;
  periodStart: Date;
  periodEnd: Date;
  jurisdiction: string;
  recipients?: string[];
};

type DashboardMetrics = {
  period: {
    start: string;
    end: string;
  };
  revenue: number;
  grossProfit: number;
  netIncome: number;
  cashBalance: number;
  receivables: number;
  payables: number;
  dealVolume: number;
  postedJournalEntries: number;
  trailingNetIncome: number;
};

function toDecimal(value: Prisma.Decimal | Decimal | number | null | undefined): Decimal {
  if (value instanceof Decimal) {
    return value;
  }
  if (value && typeof (value as Prisma.Decimal)?.toString === 'function') {
    return new Decimal((value as Prisma.Decimal).toString());
  }
  if (typeof value === 'number') {
    return new Decimal(value);
  }
  return new Decimal(0);
}

function decimalToNumber(value: Decimal): number {
  return Number(value.toFixed(2));
}

function percentageOf(part: Decimal, total: Decimal): number {
  if (total.isZero()) {
    return 0;
  }
  return decimalToNumber(part.div(total).mul(100));
}

function isEffectivelyZero(value: Decimal): boolean {
  return value.abs().lessThan(new Decimal('0.005'));
}

function getRevenueTotal(statement: FinancialStatementResult): Decimal {
  if (statement.totals.revenue !== undefined && statement.totals.revenue !== null) {
    return toDecimal(statement.totals.revenue);
  }
  const revenueSection = statement.sections.find((section) => /revenue/i.test(section.label));
  return toDecimal(revenueSection?.total ?? 0);
}

function resolveComparisonRange(range: DateRange, comparison?: StatementComparisonRange): DateRange | undefined {
  if (!comparison) {
    return undefined;
  }
  if (comparison.startDate && comparison.endDate) {
    return resolveRange({ startDate: comparison.startDate, endDate: comparison.endDate });
  }
  const duration = range.endDate.getTime() - range.startDate.getTime();
  const comparisonEnd = comparison.endDate ?? new Date(range.startDate.getTime() - 1);
  const comparisonStart = comparison.startDate ?? new Date(comparisonEnd.getTime() - duration);
  return resolveRange({ startDate: comparisonStart, endDate: comparisonEnd });
}

function resolveRange(range?: Partial<DateRange>): DateRange {
  const endDate = range?.endDate ?? new Date();
  const startDate = range?.startDate ?? new Date(endDate.getTime() - DEFAULT_STATEMENT_RANGE_DAYS * 24 * 60 * 60 * 1000);
  if (endDate < startDate) {
    throw BadRequest('End date must be on or after start date');
  }
  return { startDate, endDate };
}

async function logAudit(
  tenantId: string,
  userId: string,
  action: string,
  resource: string,
  details?: Prisma.InputJsonValue,
) {
  await prisma.auditLog.create({
    data: {
      tenantId,
      userId,
      action,
      resource,
      details,
    },
  });
}

function normalizeAmount(value: Prisma.Decimal | number | null | undefined): number {
  if (!value) {
    return 0;
  }
  if (typeof value === 'number') {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
  return Math.round((value.toNumber() + Number.EPSILON) * 100) / 100;
}

export function createStatementOptions(
  tenantId: string,
  range?: Partial<DateRange>,
  includeTransactions = true,
): StatementOptions {
  const { startDate, endDate } = resolveRange(range);
  return {
    tenantId,
    startDate,
    endDate,
    includeTransactions,
  };
}

const STANDARD_CHART_OF_ACCOUNTS: Array<{
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
}> = [
  { accountNumber: '1000', accountName: 'Cash and Cash Equivalents', accountType: AccountType.ASSET, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '1100', accountName: 'Accounts Receivable', accountType: AccountType.ASSET, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '1200', accountName: 'Inventory', accountType: AccountType.ASSET, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '1300', accountName: 'Vehicle Receivables', accountType: AccountType.ASSET, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '1400', accountName: 'Floorplan Advances', accountType: AccountType.ASSET, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '1500', accountName: 'Prepaid Expenses', accountType: AccountType.ASSET, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '2000', accountName: 'Accounts Payable', accountType: AccountType.LIABILITY, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '2100', accountName: 'Floorplan Payable', accountType: AccountType.LIABILITY, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '2200', accountName: 'Sales Tax Payable', accountType: AccountType.LIABILITY, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '2300', accountName: 'Payroll Liabilities', accountType: AccountType.LIABILITY, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '2400', accountName: 'Customer Deposits', accountType: AccountType.LIABILITY, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '3000', accountName: "Owner's Equity", accountType: AccountType.EQUITY, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '3100', accountName: 'Retained Earnings', accountType: AccountType.EQUITY, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '3200', accountName: 'Distributions', accountType: AccountType.EQUITY, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '4000', accountName: 'Vehicle Sales Revenue', accountType: AccountType.REVENUE, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '4100', accountName: 'Finance and Insurance Revenue', accountType: AccountType.REVENUE, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '4200', accountName: 'Service Contract Revenue', accountType: AccountType.REVENUE, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '4300', accountName: 'Other Income', accountType: AccountType.REVENUE, normalBalance: NormalBalance.CREDIT },
  { accountNumber: '5000', accountName: 'Cost of Goods Sold - Vehicles', accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '5100', accountName: 'Commissions Expense', accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '5200', accountName: 'Payroll Expense', accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '5300', accountName: 'Rent and Occupancy', accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '5400', accountName: 'Marketing Expense', accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT },
  { accountNumber: '5500', accountName: 'Dealer Reserve Expense', accountType: AccountType.EXPENSE, normalBalance: NormalBalance.DEBIT },
];

type BalanceSnapshotAccount = {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: AccountType;
  normalBalance: NormalBalance;
};

type BalanceSnapshot = {
  asOf: Date;
  accounts: BalanceSnapshotAccount[];
  balances: Map<string, Decimal>;
};

function endOfDay(date: Date): Date {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy;
}

function previousDayEnd(date: Date): Date {
  const previous = new Date(date);
  previous.setDate(previous.getDate() - 1);
  return endOfDay(previous);
}

async function buildBalanceSnapshot(tenantId: string, asOf: Date): Promise<BalanceSnapshot> {
  const endDate = endOfDay(asOf);
  const [accounts, balances] = await Promise.all([
    prisma.gLAccount.findMany({
      where: {
        tenantId,
        accountType: { in: [AccountType.ASSET, AccountType.LIABILITY, AccountType.EQUITY] },
      },
      select: {
        id: true,
        accountNumber: true,
        accountName: true,
        accountType: true,
        normalBalance: true,
      },
      orderBy: { accountNumber: 'asc' },
    }),
    getAccountBalances(prisma, {
      tenantId,
      startDate: new Date(0),
      endDate,
      includeTransactions: false,
    }),
  ]);

  const balanceMap = new Map<string, Decimal>();
  for (const account of balances) {
    balanceMap.set(account.accountId, toDecimal(account.total));
  }

  return { asOf: endDate, accounts, balances: balanceMap };
}

function mapCashFlowCategory(label: string): CashFlowSection['category'] {
  if (/operating/i.test(label)) {
    return 'OPERATING';
  }
  if (/investing/i.test(label)) {
    return 'INVESTING';
  }
  if (/financing/i.test(label)) {
    return 'FINANCING';
  }
  return 'SUPPLEMENTAL';
}

export async function generatePLStatement(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  comparison?: StatementComparisonRange,
): Promise<ProfitAndLossStatement> {
  const range = resolveRange({ startDate, endDate });
  const [statement, comparisonRange] = await Promise.all([
    buildIncomeStatement(prisma, createStatementOptions(tenantId, range)),
    Promise.resolve(resolveComparisonRange(range, comparison)),
  ]);
  const comparisonStatement = comparisonRange
    ? await buildIncomeStatement(prisma, createStatementOptions(tenantId, comparisonRange))
    : undefined;

  const revenueTotal = getRevenueTotal(statement);
  const comparisonRevenue = comparisonStatement ? getRevenueTotal(comparisonStatement) : new Decimal(0);

  const sections = statement.sections.map((section) => {
    const sectionTotal = toDecimal(section.total);
    const comparisonSection = comparisonStatement?.sections.find((candidate) => candidate.label === section.label);
    const comparisonTotal = comparisonSection ? toDecimal(comparisonSection.total) : undefined;

    const lines = section.accounts.map((account) => {
      const amount = toDecimal(account.total);
      const comparisonAccount = comparisonSection?.accounts.find((candidate) => candidate.accountId === account.accountId);
      const comparisonAmount = comparisonAccount ? toDecimal(comparisonAccount.total) : undefined;
      const variance = comparisonAmount ? amount.minus(comparisonAmount) : undefined;
      const variancePercent = comparisonAmount && !comparisonAmount.isZero()
        ? variance!.div(comparisonAmount).mul(100)
        : undefined;

      return {
        accountId: account.accountId,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: decimalToNumber(amount),
        percentOfRevenue: percentageOf(amount.abs(), revenueTotal.abs()),
        comparisonAmount: comparisonAmount ? decimalToNumber(comparisonAmount) : undefined,
        variance: variance ? decimalToNumber(variance) : undefined,
        variancePercent: variancePercent ? decimalToNumber(variancePercent) : undefined,
      } satisfies ProfitAndLossLine;
    });

    return {
      label: section.label,
      total: decimalToNumber(sectionTotal),
      percentOfRevenue: percentageOf(sectionTotal.abs(), revenueTotal.abs()),
      comparisonTotal: comparisonTotal ? decimalToNumber(comparisonTotal) : undefined,
      varianceTotal: comparisonTotal ? decimalToNumber(sectionTotal.minus(comparisonTotal)) : undefined,
      lines,
    } satisfies ProfitAndLossSection;
  });

  return {
    period: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
    sections,
    totals: {
      revenue: decimalToNumber(revenueTotal),
      grossProfit: normalizeAmount(statement.totals.grossProfit ?? 0),
      netIncome: normalizeAmount(statement.totals.netIncome ?? 0),
    },
    comparison: comparisonStatement
      ? {
          period: { startDate: comparisonRange!.startDate.toISOString(), endDate: comparisonRange!.endDate.toISOString() },
          totals: {
            revenue: decimalToNumber(comparisonRevenue),
            grossProfit: normalizeAmount(comparisonStatement.totals.grossProfit ?? 0),
            netIncome: normalizeAmount(comparisonStatement.totals.netIncome ?? 0),
          },
        }
      : undefined,
  } satisfies ProfitAndLossStatement;
}

function buildBalanceSection(
  type: AccountType,
  snapshot: BalanceSnapshot,
  comparisonSnapshot?: BalanceSnapshot,
): { section: BalanceSheetSection; total: Decimal; comparisonTotal?: Decimal } {
  const linesInternal: Array<{ account: BalanceSnapshotAccount; balance: Decimal; comparison?: Decimal }> = [];
  for (const account of snapshot.accounts) {
    if (account.accountType !== type) {
      continue;
    }
    const balance = snapshot.balances.get(account.id) ?? new Decimal(0);
    const comparisonBalance = comparisonSnapshot?.balances.get(account.id);
    if (isEffectivelyZero(balance) && (!comparisonBalance || isEffectivelyZero(comparisonBalance))) {
      continue;
    }
    linesInternal.push({ account, balance, comparison: comparisonBalance });
  }

  const total = linesInternal.reduce((sum, entry) => sum.add(entry.balance), new Decimal(0));
  const comparisonTotal = comparisonSnapshot
    ? linesInternal.reduce((sum, entry) => sum.add(entry.comparison ?? new Decimal(0)), new Decimal(0))
    : undefined;

  const accounts = linesInternal.map((entry) => ({
    accountId: entry.account.id,
    accountNumber: entry.account.accountNumber,
    accountName: entry.account.accountName,
    balance: decimalToNumber(entry.balance),
    comparisonBalance: entry.comparison ? decimalToNumber(entry.comparison) : undefined,
    variance: entry.comparison ? decimalToNumber(entry.balance.minus(entry.comparison)) : undefined,
  }));

  return {
    section: {
      type,
      total: decimalToNumber(total),
      comparisonTotal: comparisonTotal ? decimalToNumber(comparisonTotal) : undefined,
      varianceTotal: comparisonTotal ? decimalToNumber(total.minus(comparisonTotal)) : undefined,
      accounts,
    },
    total,
    comparisonTotal,
  };
}

export async function generateBalanceSheet(
  tenantId: string,
  date?: Date,
  comparisonDate?: Date,
): Promise<BalanceSheetStatement> {
  const asOf = date ? endOfDay(date) : endOfDay(new Date());
  const [snapshot, comparisonSnapshot] = await Promise.all([
    buildBalanceSnapshot(tenantId, asOf),
    comparisonDate ? buildBalanceSnapshot(tenantId, comparisonDate) : Promise.resolve<BalanceSnapshot | undefined>(undefined),
  ]);

  const assetSection = buildBalanceSection(AccountType.ASSET, snapshot, comparisonSnapshot);
  const liabilitySection = buildBalanceSection(AccountType.LIABILITY, snapshot, comparisonSnapshot);
  const equitySection = buildBalanceSection(AccountType.EQUITY, snapshot, comparisonSnapshot);

  const assets = assetSection.total;
  const liabilities = liabilitySection.total;
  const equity = equitySection.total;
  const liabilitiesAndEquity = liabilities.add(equity);

  const ratios: BalanceSheetRatios = {
    assetsToLiabilities: liabilities.isZero() ? 0 : decimalToNumber(assets.div(liabilities)),
    debtToEquity: equity.isZero() ? 0 : decimalToNumber(liabilities.div(equity)),
    equityRatio: assets.isZero() ? 0 : decimalToNumber(equity.div(assets)),
  };

  return {
    asOf: snapshot.asOf.toISOString(),
    sections: [assetSection.section, liabilitySection.section, equitySection.section],
    totals: {
      assets: decimalToNumber(assets),
      liabilities: decimalToNumber(liabilities),
      equity: decimalToNumber(equity),
      liabilitiesAndEquity: decimalToNumber(liabilitiesAndEquity),
    },
    ratios,
    comparison: comparisonSnapshot
      ? {
          asOf: comparisonSnapshot.asOf.toISOString(),
          totals: {
            assets: decimalToNumber(assetSection.comparisonTotal ?? new Decimal(0)),
            liabilities: decimalToNumber(liabilitySection.comparisonTotal ?? new Decimal(0)),
            equity: decimalToNumber(equitySection.comparisonTotal ?? new Decimal(0)),
            liabilitiesAndEquity: decimalToNumber(
              (liabilitySection.comparisonTotal ?? new Decimal(0)).add(equitySection.comparisonTotal ?? new Decimal(0)),
            ),
          },
        }
      : undefined,
  } satisfies BalanceSheetStatement;
}

export async function generateCashFlow(
  tenantId: string,
  startDate?: Date,
  endDate?: Date,
  method: 'INDIRECT' | 'DIRECT' = 'INDIRECT',
): Promise<CashFlowStatement> {
  const normalizedMethod = method.toUpperCase() as 'INDIRECT' | 'DIRECT';
  if (normalizedMethod !== 'INDIRECT') {
    throw BadRequest('Only the indirect cash flow method is currently supported');
  }
  const range = resolveRange({ startDate, endDate });
  const statement = await buildCashFlowStatement(prisma, createStatementOptions(tenantId, range));

  const sectionsInternal = statement.sections.map((section) => {
    const sectionTotal = toDecimal(section.total);
    return {
      category: mapCashFlowCategory(section.label),
      label: section.label,
      total: decimalToNumber(sectionTotal),
      totalDecimal: sectionTotal,
      lines: section.accounts.map((account) => ({
        label: account.accountName,
        amount: normalizeAmount(account.total),
      })),
    };
  });

  const totalsDecimal = sectionsInternal.reduce(
    (acc, section) => {
      if (section.category === 'OPERATING') {
        acc.operating = acc.operating.add(section.totalDecimal);
      } else if (section.category === 'INVESTING') {
        acc.investing = acc.investing.add(section.totalDecimal);
      } else if (section.category === 'FINANCING') {
        acc.financing = acc.financing.add(section.totalDecimal);
      }
      return acc;
    },
    { operating: new Decimal(0), investing: new Decimal(0), financing: new Decimal(0) },
  );

  const netChange = totalsDecimal.operating.add(totalsDecimal.investing).add(totalsDecimal.financing);
  const openingBalance = await getAccountBalanceByName(tenantId, /cash|bank|checking|savings/i, previousDayEnd(range.startDate));
  const closingBalance = await getAccountBalanceByName(tenantId, /cash|bank|checking|savings/i, endOfDay(range.endDate));

  return {
    period: { startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() },
    method: normalizedMethod,
    sections: sectionsInternal.map(({ totalDecimal, ...section }) => section),
    totals: {
      netChange: decimalToNumber(netChange),
      operating: decimalToNumber(totalsDecimal.operating),
      investing: decimalToNumber(totalsDecimal.investing),
      financing: decimalToNumber(totalsDecimal.financing),
    },
    cash: {
      opening: normalizeAmount(openingBalance),
      closing: normalizeAmount(closingBalance),
    },
  } satisfies CashFlowStatement;
}

type AutoJournalEntryInput = {
  tenantId: string;
  dealId: string;
  userId: string;
  status?: JournalStatus;
  memoOverride?: string;
  postingDate?: Date;
};

export async function autoGenerateJournalEntry(input: AutoJournalEntryInput) {
  const { tenantId, dealId, userId } = input;
  if (!tenantId || !dealId || !userId) {
    throw BadRequest('tenantId, dealId, and userId are required for automatic journal entry generation');
  }
  const generated = await generateJournalEntryFromDeal(prisma, tenantId, dealId);
  const payload = {
    ...generated,
    memo: input.memoOverride ?? generated.memo,
    postingDate: input.postingDate ?? generated.postingDate,
  } satisfies typeof generated;
  assertBalancedLines(payload.lines);
  const status = input.status ?? JournalStatus.POSTED;
  const entry = await createJournalEntryFromGenerated(prisma, tenantId, userId, payload, status, dealId);
  await logAudit(tenantId, userId, 'CREATE', 'JournalEntry', { id: entry.id, dealId, autoGenerated: true });
  return entry;
}

export async function calculatePayroll(
  tenantId: string,
  startDate: Date,
  endDate: Date,
): Promise<PayrollComputationResult> {
  const range = resolveRange({ startDate, endDate });
  const result = await calculatePayrollPreview(prisma, {
    tenantId,
    periodStart: range.startDate,
    periodEnd: range.endDate,
  });
  return {
    period: { startDate: result.periodStart, endDate: result.periodEnd },
    employees: result.lines,
    totals: result.totals,
  } satisfies PayrollComputationResult;
}

export async function importStandardCOA(tenantId: string): Promise<ChartOfAccountsImportResult> {
  const results: ChartOfAccountsImportResult['accounts'] = [];
  let created = 0;
  let existing = 0;
  let failed = 0;

  for (const template of STANDARD_CHART_OF_ACCOUNTS) {
    try {
      const current = await prisma.gLAccount.findFirst({
        where: {
          tenantId,
          OR: [
            { accountNumber: template.accountNumber },
            { accountName: template.accountName },
          ],
        },
      });
      if (current) {
        existing += 1;
        results.push({
          accountNumber: current.accountNumber,
          accountName: current.accountName,
          status: 'exists',
          id: current.id,
        });
        continue;
      }

      const account = await prisma.gLAccount.create({
        data: {
          tenantId,
          accountNumber: template.accountNumber,
          accountName: template.accountName,
          accountType: template.accountType,
          normalBalance: template.normalBalance,
          isActive: true,
        },
      });
      created += 1;
      results.push({
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        status: 'created',
        id: account.id,
      });
    } catch (error: any) {
      failed += 1;
      results.push({
        accountNumber: template.accountNumber,
        accountName: template.accountName,
        status: 'failed',
        message: error?.message ?? 'Failed to import account',
      });
    }
  }

  return {
    summary: { created, existing, failed },
    accounts: results,
  } satisfies ChartOfAccountsImportResult;
}

function getSmtpTransportOptions(): TransportOptions {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587;
  if (!host || !user || !pass) {
    throw BadRequest('SMTP settings are not configured');
  }
  return {
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  } satisfies TransportOptions;
}

async function getAccountBalanceByName(tenantId: string, pattern: RegExp, asOf?: Date): Promise<number> {
  const range = asOf
    ? { startDate: new Date(0), endDate: endOfDay(asOf) }
    : undefined;
  const balances = await getAccountBalances(prisma, createStatementOptions(tenantId, range, false));
  return balances
    .filter((account) => pattern.test(account.accountName))
    .reduce((sum, account) => sum + account.total, 0);
}

export async function getDashboardMetrics(tenantId: string): Promise<DashboardMetrics> {
  const range = resolveRange({
    startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
    endDate: new Date(),
  });

  const incomeStatement = await buildIncomeStatement(prisma, createStatementOptions(tenantId, range, false));
  const trailingRange = resolveRange({
    startDate: new Date(range.startDate.getFullYear(), range.startDate.getMonth() - 11, 1),
    endDate: range.endDate,
  });
  const trailingIncome = await buildIncomeStatement(prisma, createStatementOptions(tenantId, trailingRange, false));

  const cashBalance = await getAccountBalanceByName(tenantId, /cash|bank|checking|savings/i);
  const receivables = await getAccountBalanceByName(tenantId, /receivable/i);
  const payables = await getAccountBalanceByName(tenantId, /payable/i);

  const [dealVolume, postedJournalEntries] = await Promise.all([
    prisma.deal.count({
      where: {
        tenantId,
        dealDate: {
          gte: range.startDate,
          lte: range.endDate,
        },
        status: { in: ['APPROVED', 'FUNDED', 'DELIVERED'] },
      },
    }),
    prisma.journalEntry.count({
      where: {
        tenantId,
        status: JournalStatus.POSTED,
        postingDate: {
          gte: range.startDate,
          lte: range.endDate,
        },
      },
    }),
  ]);

  return {
    period: {
      start: range.startDate.toISOString(),
      end: range.endDate.toISOString(),
    },
    revenue: incomeStatement.totals.revenue ?? 0,
    grossProfit: incomeStatement.totals.grossProfit ?? 0,
    netIncome: incomeStatement.totals.netIncome ?? 0,
    cashBalance,
    receivables,
    payables,
    dealVolume,
    postedJournalEntries,
    trailingNetIncome: trailingIncome.totals.netIncome ?? 0,
  };
}

export async function getIncomeStatement(
  tenantId: string,
  range?: Partial<DateRange>,
): Promise<FinancialStatementResult> {
  return buildIncomeStatement(prisma, createStatementOptions(tenantId, range));
}

export async function getBalanceSheet(
  tenantId: string,
  range?: Partial<DateRange>,
): Promise<FinancialStatementResult> {
  return buildBalanceSheet(prisma, createStatementOptions(tenantId, range, false));
}

export async function getCashFlowStatement(
  tenantId: string,
  range?: Partial<DateRange>,
): Promise<FinancialStatementResult> {
  return buildCashFlowStatement(prisma, createStatementOptions(tenantId, range));
}

export async function listJournalEntries(
  tenantId: string,
  filters: JournalEntryFilters,
) {
  const where: Prisma.JournalEntryWhereInput = {
    tenantId,
  };
  if (filters.status) {
    where.status = filters.status;
  }
  if (filters.startDate || filters.endDate) {
    where.postingDate = {
      gte: filters.startDate,
      lte: filters.endDate,
    };
  }
  if (filters.search) {
    where.OR = [
      { entryNumber: { contains: filters.search, mode: 'insensitive' } },
      { memo: { contains: filters.search, mode: 'insensitive' } },
    ];
  }
  if (filters.accountId) {
    where.lines = {
      some: {
        glAccountId: filters.accountId,
      },
    };
  }

  const skip = filters.skip ?? 0;
  const take = Math.min(filters.take ?? 50, 200);

  const [items, total] = await Promise.all([
    prisma.journalEntry.findMany({
      where,
      skip,
      take,
      orderBy: { postingDate: 'desc' },
      include: {
        lines: {
          include: {
            glAccount: {
              select: { id: true, accountNumber: true, accountName: true, accountType: true },
            },
          },
        },
        postedBy: {
          select: { id: true, firstName: true, lastName: true },
        },
        deal: {
          select: { id: true, dealNumber: true },
        },
      },
    }),
    prisma.journalEntry.count({ where }),
  ]);

  return { items, total };
}

export async function getJournalEntryById(tenantId: string, id: string) {
  const entry = await prisma.journalEntry.findFirst({
    where: { tenantId, id },
    include: {
      lines: {
        include: { glAccount: true },
      },
      postedBy: {
        select: { id: true, firstName: true, lastName: true },
      },
      deal: {
        select: { id: true, dealNumber: true },
      },
    },
  });
  if (!entry) {
    throw NotFound('Journal entry not found');
  }
  return entry;
}

export async function createJournalEntry(
  tenantId: string,
  userId: string,
  payload: JournalEntryPayload,
) {
  if (!payload.lines || payload.lines.length < 2) {
    throw BadRequest('Journal entry must include at least two lines');
  }
  assertBalancedLines(payload.lines);
  const status = payload.status ?? JournalStatus.DRAFT;
  const entry = await createJournalEntryFromGenerated(
    prisma,
    tenantId,
    userId,
    {
      memo: payload.memo ?? 'Manual entry',
      postingDate: payload.postingDate,
      lines: payload.lines,
    },
    status,
    payload.dealId,
  );
  await logAudit(tenantId, userId, 'CREATE', 'JournalEntry', { id: entry.id, status });
  return entry;
}

export async function postJournalEntry(
  tenantId: string,
  userId: string,
  id: string,
) {
  const existing = await prisma.journalEntry.findFirst({ where: { tenantId, id } });
  if (!existing) {
    throw NotFound('Journal entry not found');
  }
  if (existing.status === JournalStatus.POSTED) {
    return existing;
  }
  const updated = await prisma.journalEntry.update({
    where: { id },
    data: {
      status: JournalStatus.POSTED,
      postedById: userId,
      postedAt: new Date(),
    },
  });
  await logAudit(tenantId, userId, 'UPDATE', 'JournalEntry', { id, status: JournalStatus.POSTED });
  return updated;
}

export async function generateDealJournalEntry(
  tenantId: string,
  userId: string,
  dealId: string,
) {
  const payload = await generateJournalEntryFromDeal(prisma, tenantId, dealId);
  const entry = await createJournalEntryFromGenerated(prisma, tenantId, userId, payload, JournalStatus.POSTED, dealId);
  await logAudit(tenantId, userId, 'CREATE', 'JournalEntry', { id: entry.id, dealId });
  return entry;
}

type AccountNode = Prisma.GLAccountGetPayload<{ include: { parentAccount: false } }> & { children: AccountNode[] };

export async function listGLAccounts(tenantId: string) {
  const accounts = await prisma.gLAccount.findMany({
    where: { tenantId },
    orderBy: [{ accountNumber: 'asc' }],
  });

  const byId = new Map<string, AccountNode>();
  for (const account of accounts) {
    byId.set(account.id, { ...account, children: [] });
  }

  const roots: AccountNode[] = [];
  for (const account of accounts) {
    const wrapped = byId.get(account.id)!;
    if (account.parentAccountId && byId.has(account.parentAccountId)) {
      byId.get(account.parentAccountId)!.children.push(wrapped);
    } else {
      roots.push(wrapped);
    }
  }

  return roots;
}

export async function upsertGLAccount(
  tenantId: string,
  userId: string,
  input: {
    id?: string;
    accountNumber: string;
    accountName: string;
    accountType: AccountType;
    normalBalance: NormalBalance;
    parentAccountId?: string | null;
    isActive?: boolean;
  },
) {
  if (!input.accountNumber || !input.accountName) {
    throw BadRequest('Account number and name are required');
  }
  let account;
  if (input.id) {
    account = await prisma.gLAccount.update({
      where: { id: input.id },
      data: {
        accountNumber: input.accountNumber,
        accountName: input.accountName,
        accountType: input.accountType,
        normalBalance: input.normalBalance,
        parentAccountId: input.parentAccountId ?? null,
        isActive: input.isActive ?? true,
      },
    });
    await logAudit(tenantId, userId, 'UPDATE', 'GLAccount', { id: input.id });
  } else {
    account = await prisma.gLAccount.create({
      data: {
        tenantId,
        accountNumber: input.accountNumber,
        accountName: input.accountName,
        accountType: input.accountType,
        normalBalance: input.normalBalance,
        parentAccountId: input.parentAccountId ?? null,
        isActive: input.isActive ?? true,
      },
    });
    await logAudit(tenantId, userId, 'CREATE', 'GLAccount', { id: account.id });
  }
  return account;
}

export async function deactivateGLAccount(tenantId: string, userId: string, id: string) {
  const account = await prisma.gLAccount.update({
    where: { id },
    data: { isActive: false },
  });
  await logAudit(tenantId, userId, 'UPDATE', 'GLAccount', { id, isActive: false });
  return account;
}

export async function previewPayroll(
  tenantId: string,
  options: Omit<PayrollCalculationOptions, 'tenantId'>,
) {
  return calculatePayrollPreview(prisma, { ...options, tenantId });
}

export async function finalizePayroll(
  tenantId: string,
  userId: string,
  options: PayrollFinalizeOptions,
) {
  const preview = await calculatePayrollPreview(prisma, { ...options, tenantId });
  if (!preview.lines.length) {
    throw BadRequest('No commission or payroll data available for the selected period');
  }

  const result = await prisma.$transaction(async (tx) => {
    const payroll = await tx.payroll.create({
      data: {
        tenantId,
        periodStart: options.periodStart,
        periodEnd: options.periodEnd,
        status: PayrollStatus.APPROVED,
        totalGross: preview.totals.gross,
        totalNet: preview.totals.net,
        totalTaxes: preview.totals.employeeWithholding + preview.totals.employerTaxes,
        createdById: userId,
      },
    });

    for (const line of preview.lines) {
      const payrollLine = await tx.payrollLine.create({
        data: {
          tenantId,
          payrollId: payroll.id,
          userId: line.userId,
          grossPay: line.grossPay,
          deductions: line.deductions,
          employerTaxes: line.employerTaxes,
          netPay: line.netPay,
          commissionAmount: line.commissionTotal + line.commissionBonus,
        },
      });

      if (line.commissionIds.length) {
        await tx.commission.updateMany({
          where: { id: { in: line.commissionIds } },
          data: { status: CommissionStatus.PAID, payrollLineId: payrollLine.id },
        });
      }
    }

    const journalEntry = await createPayrollJournalEntry(
      tx,
      tenantId,
      userId,
      options.periodEnd,
      {
        gross: preview.totals.gross,
        net: preview.totals.net,
        employeeWithholding: preview.totals.employeeWithholding,
        employerTaxes: preview.totals.employerTaxes,
      },
      options.cashAccountId,
    );

    const finalized = await tx.payroll.update({
      where: { id: payroll.id },
      data: {
        status: PayrollStatus.POSTED,
        approvedById: options.approve ? userId : null,
        journalEntryId: journalEntry.id,
      },
      include: {
        lines: true,
      },
    });

    return finalized;
  });

  await logAudit(tenantId, userId, 'CREATE', 'Payroll', { id: result.id });
  return result;
}

export async function listPayrolls(tenantId: string) {
  return prisma.payroll.findMany({
    where: { tenantId },
    orderBy: { periodEnd: 'desc' },
    include: {
      lines: true,
      journalEntry: true,
    },
  });
}

export async function getPayrollById(tenantId: string, id: string) {
  const payroll = await prisma.payroll.findFirst({
    where: { tenantId, id },
    include: {
      lines: {
        include: {
          user: { select: { id: true, firstName: true, lastName: true } },
        },
      },
      journalEntry: true,
    },
  });
  if (!payroll) {
    throw NotFound('Payroll not found');
  }
  return payroll;
}

async function calculateSalesTax(tenantId: string, range: DateRange) {
  const deals = await prisma.deal.findMany({
    where: {
      tenantId,
      status: { in: ['APPROVED', 'FUNDED', 'DELIVERED'] },
      dealDate: {
        gte: range.startDate,
        lte: range.endDate,
      },
    },
    select: { salesTax: true },
  });
  return deals.reduce((sum, deal) => sum + normalizeAmount(deal.salesTax), 0);
}

async function calculatePayrollTax(tenantId: string, range: DateRange) {
  const payrolls = await prisma.payroll.findMany({
    where: {
      tenantId,
      periodStart: { lte: range.endDate },
      periodEnd: { gte: range.startDate },
    },
    include: { lines: true },
  });
  return payrolls.reduce((sum, payroll) => sum + normalizeAmount(payroll.totalTaxes), 0);
}

async function calculateIncomeTax(tenantId: string, range: DateRange) {
  const incomeStatement = await buildIncomeStatement(prisma, createStatementOptions(tenantId, range, false));
  const netIncome = incomeStatement.totals.netIncome ?? 0;
  const assumedRate = 0.21;
  return Math.max(0, netIncome * assumedRate);
}

export async function generateTaxReport(
  tenantId: string,
  userId: string,
  input: TaxReportInput,
) {
  const range = resolveRange({ startDate: input.periodStart, endDate: input.periodEnd });
  let totalTax = 0;
  if (input.type === TaxReportType.SALES_TAX) {
    totalTax = await calculateSalesTax(tenantId, range);
  } else if (input.type === TaxReportType.PAYROLL_TAX) {
    totalTax = await calculatePayrollTax(tenantId, range);
  } else {
    totalTax = await calculateIncomeTax(tenantId, range);
  }

  const report = await prisma.taxReport.create({
    data: {
      tenantId,
      type: input.type,
      periodStart: range.startDate,
      periodEnd: range.endDate,
      totalTax,
      jurisdiction: input.jurisdiction,
      data: {
        jurisdiction: input.jurisdiction,
        computedRate: input.type === TaxReportType.INCOME_TAX ? 0.21 : undefined,
      },
      emailedTo: input.recipients ?? [],
      generatedById: userId,
    },
  });

  await logAudit(tenantId, userId, 'CREATE', 'TaxReport', { id: report.id, type: input.type });
  return report;
}

export async function listTaxReports(tenantId: string, limit = 50) {
  return prisma.taxReport.findMany({
    where: { tenantId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
}

export async function exportStatement(
  tenantId: string,
  statement: 'pl' | 'balance-sheet' | 'cash-flow',
  format: ExportFormat,
  range?: Partial<DateRange>,
): Promise<ExportResult> {
  let statementResult: FinancialStatementResult;
  let title = '';
  switch (statement) {
    case 'pl':
      statementResult = await getIncomeStatement(tenantId, range);
      title = 'Income Statement';
      break;
    case 'balance-sheet':
      statementResult = await getBalanceSheet(tenantId, range);
      title = 'Balance Sheet';
      break;
    case 'cash-flow':
      statementResult = await getCashFlowStatement(tenantId, range);
      title = 'Cash Flow Statement';
      break;
    default:
      throw BadRequest('Unsupported statement type');
  }

  const subtitle = `${statementResult.period.startDate.slice(0, 10)} – ${statementResult.period.endDate.slice(0, 10)}`;
  let body: Buffer;
  let contentType: string;
  let extension: string;

  if (format === 'pdf') {
    body = await exportStatementToPdf(statementResult, { title, subtitle });
    contentType = 'application/pdf';
    extension = 'pdf';
  } else if (format === 'excel') {
    body = await exportStatementToExcel(statementResult, { title, subtitle });
    contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    extension = 'xlsx';
  } else {
    body = exportStatementToQuickBooks(statementResult);
    contentType = 'text/plain';
    extension = 'iif';
  }

  const filename = `${title.toLowerCase().replace(/\s+/g, '-')}-${statementResult.period.endDate.slice(0, 10)}.${extension}`;
  return { filename, contentType, body };
}

export async function emailStatement(
  tenantId: string,
  statement: 'pl' | 'balance-sheet' | 'cash-flow',
  recipients: string[],
  range?: Partial<DateRange>,
) {
  if (!recipients.length) {
    throw BadRequest('At least one recipient is required');
  }
  const exportResult = await exportStatement(tenantId, statement, 'pdf', range);
  const transport = getSmtpTransportOptions();
  await sendReportEmail(transport, {
    to: recipients,
    subject: `Autolytiq ${exportResult.filename}`,
    html: `<p>Please find the attached ${statement.replace('-', ' ')}.</p>`,
    attachments: [
      {
        filename: exportResult.filename,
        content: exportResult.body,
        contentType: exportResult.contentType,
      },
    ],
  });
}
