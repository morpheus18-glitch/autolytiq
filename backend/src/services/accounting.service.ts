import {
  AccountType,
  CommissionStatus,
  JournalStatus,
  NormalBalance,
  PayrollStatus,
  Prisma,
  TaxReportType,
} from '@prisma/client';
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

async function getAccountBalanceByName(tenantId: string, pattern: RegExp): Promise<number> {
  const balances = await getAccountBalances(prisma, createStatementOptions(tenantId));
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
