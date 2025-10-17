import type { Request, Response } from 'express';
import { AccountType, JournalStatus, NormalBalance, TaxReportType } from '@prisma/client';
import {
  getDashboardMetrics,
  getIncomeStatement,
  getBalanceSheet,
  getCashFlowStatement,
  listJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  postJournalEntry,
  generateDealJournalEntry,
  listGLAccounts,
  upsertGLAccount,
  deactivateGLAccount,
  previewPayroll,
  finalizePayroll,
  listPayrolls,
  getPayrollById,
  generateTaxReport,
  listTaxReports,
  exportStatement,
  emailStatement,
} from '../services/accounting.service.js';
import {
  getBalanceSheetReport,
  type BalanceSheetComparisonMode,
} from '../services/balance-sheet-report.service.js';
import { BadRequest } from '../lib/errors.js';

function requireTenantId(req: Request): string {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    throw BadRequest('Tenant context is required');
  }
  return tenantId;
}

function parseDate(value: unknown): Date | undefined {
  if (!value) {
    return undefined;
  }
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    throw BadRequest('Invalid date value');
  }
  return date;
}

function parseBoolean(value: unknown): boolean | undefined {
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  return String(value).toLowerCase() === 'true';
}

function coerceNumber(value: unknown): number {
  const result = Number(value);
  if (!Number.isFinite(result)) {
    throw BadRequest('Invalid numeric value');
  }
  return result;
}

export async function getDashboard(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const metrics = await getDashboardMetrics(tenantId);
  res.json({ data: metrics });
}

export async function getIncomeStatementController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);
  const statement = await getIncomeStatement(tenantId, { startDate, endDate });
  res.json({ data: statement });
}

export async function getBalanceSheetController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);
  const statement = await getBalanceSheet(tenantId, { startDate, endDate });
  res.json({ data: statement });
}

export async function getBalanceSheetReportController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const asOfDate = parseDate(req.query.date) ?? new Date();
  const comparisonParam = String(req.query.comparison ?? 'NONE').toUpperCase();
  const comparison: BalanceSheetComparisonMode =
    comparisonParam === 'PREVIOUS_MONTH' || comparisonParam === 'PREVIOUS_YEAR' ? comparisonParam : 'NONE';

  const report = await getBalanceSheetReport(tenantId, { asOfDate, comparison });
  res.json({ data: report });
}

export async function getCashFlowController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);
  const statement = await getCashFlowStatement(tenantId, { startDate, endDate });
  res.json({ data: statement });
}

export async function getJournalEntries(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const status = req.query.status ? (String(req.query.status).toUpperCase() as JournalStatus) : undefined;
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);
  const skip = req.query.skip ? Number(req.query.skip) : undefined;
  const take = req.query.take ? Number(req.query.take) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;
  const accountId = req.query.accountId ? String(req.query.accountId) : undefined;

  const result = await listJournalEntries(tenantId, { status, startDate, endDate, skip, take, search, accountId });
  res.json({ data: result });
}

export async function getJournalEntry(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const { id } = req.params;
  if (!id) {
    throw BadRequest('Journal entry id is required');
  }
  const entry = await getJournalEntryById(tenantId, id);
  res.json({ data: entry });
}

export async function createJournalEntryController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const userId = req.user!.userId;
  const { memo, postingDate, status, dealId, lines } = req.body ?? {};

  if (!postingDate) {
    throw BadRequest('postingDate is required');
  }
  if (!Array.isArray(lines) || lines.length < 2) {
    throw BadRequest('Journal entry must include at least two lines');
  }

  const normalizedLines = lines.map((line: any) => ({
    glAccountId: String(line.glAccountId),
    type: String(line.type).toUpperCase() as 'DEBIT' | 'CREDIT',
    amount: coerceNumber(line.amount),
    description: line.description ? String(line.description) : undefined,
  }));

  const entry = await createJournalEntry(tenantId, userId, {
    memo,
    postingDate: new Date(postingDate),
    status: status ? (String(status).toUpperCase() as JournalStatus) : undefined,
    dealId: dealId ? String(dealId) : undefined,
    lines: normalizedLines,
  });

  res.status(201).json({ data: entry });
}

export async function postJournalEntryController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const userId = req.user!.userId;
  const { id } = req.params;
  if (!id) {
    throw BadRequest('Journal entry id is required');
  }
  const entry = await postJournalEntry(tenantId, userId, id);
  res.json({ data: entry });
}

export async function generateDealEntry(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const userId = req.user!.userId;
  const { dealId } = req.body ?? {};
  if (!dealId) {
    throw BadRequest('dealId is required');
  }
  const entry = await generateDealJournalEntry(tenantId, userId, String(dealId));
  res.status(201).json({ data: entry });
}

export async function listAccounts(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const accounts = await listGLAccounts(tenantId);
  res.json({ data: accounts });
}

export async function upsertAccount(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const userId = req.user!.userId;
  const { id } = req.params;
  const { accountNumber, accountName, accountType, normalBalance, parentAccountId, isActive } = req.body ?? {};

  if (!accountNumber || !accountName || !accountType || !normalBalance) {
    throw BadRequest('accountNumber, accountName, accountType, and normalBalance are required');
  }

  const account = await upsertGLAccount(tenantId, userId, {
    id: id ? String(id) : undefined,
    accountNumber: String(accountNumber),
    accountName: String(accountName),
    accountType: accountType as AccountType,
    normalBalance: normalBalance as NormalBalance,
    parentAccountId: parentAccountId ? String(parentAccountId) : null,
    isActive: parseBoolean(isActive) ?? true,
  });

  res.status(id ? 200 : 201).json({ data: account });
}

export async function deactivateAccount(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const userId = req.user!.userId;
  const { id } = req.params;
  if (!id) {
    throw BadRequest('Account id is required');
  }
  const account = await deactivateGLAccount(tenantId, userId, id);
  res.json({ data: account });
}

export async function previewPayrollController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const periodStart = parseDate(req.body?.periodStart);
  const periodEnd = parseDate(req.body?.periodEnd);
  if (!periodStart || !periodEnd) {
    throw BadRequest('periodStart and periodEnd are required');
  }
  const preview = await previewPayroll(tenantId, {
    periodStart,
    periodEnd,
    commissionTiers: req.body?.commissionTiers,
    deductionRates: req.body?.deductionRates,
    employerTaxRate: req.body?.employerTaxRate,
    basePay: req.body?.basePay,
    adjustments: req.body?.adjustments,
    additionalDeductions: req.body?.additionalDeductions,
  });
  res.json({ data: preview });
}

export async function finalizePayrollController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const userId = req.user!.userId;
  const periodStart = parseDate(req.body?.periodStart);
  const periodEnd = parseDate(req.body?.periodEnd);
  if (!periodStart || !periodEnd) {
    throw BadRequest('periodStart and periodEnd are required');
  }
  const payroll = await finalizePayroll(tenantId, userId, {
    periodStart,
    periodEnd,
    commissionTiers: req.body?.commissionTiers,
    deductionRates: req.body?.deductionRates,
    employerTaxRate: req.body?.employerTaxRate,
    basePay: req.body?.basePay,
    adjustments: req.body?.adjustments,
    additionalDeductions: req.body?.additionalDeductions,
    approve: parseBoolean(req.body?.approve),
    cashAccountId: req.body?.cashAccountId,
    tenantId,
  });
  res.status(201).json({ data: payroll });
}

export async function listPayrollsController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const payrolls = await listPayrolls(tenantId);
  res.json({ data: payrolls });
}

export async function getPayrollController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const { id } = req.params;
  if (!id) {
    throw BadRequest('Payroll id is required');
  }
  const payroll = await getPayrollById(tenantId, id);
  res.json({ data: payroll });
}

export async function generateTaxReportController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const userId = req.user!.userId;
  const type = req.body?.type ? (String(req.body.type).toUpperCase() as TaxReportType) : undefined;
  if (!type) {
    throw BadRequest('Tax report type is required');
  }
  const periodStart = parseDate(req.body?.periodStart);
  const periodEnd = parseDate(req.body?.periodEnd);
  const jurisdiction = req.body?.jurisdiction ? String(req.body.jurisdiction) : undefined;
  if (!periodStart || !periodEnd || !jurisdiction) {
    throw BadRequest('periodStart, periodEnd, and jurisdiction are required');
  }
  const report = await generateTaxReport(tenantId, userId, {
    type,
    periodStart,
    periodEnd,
    jurisdiction,
    recipients: Array.isArray(req.body?.recipients)
      ? (req.body.recipients as string[]).map(String)
      : undefined,
  });
  res.status(201).json({ data: report });
}

export async function listTaxReportsController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const limit = req.query.limit ? Number(req.query.limit) : 50;
  const reports = await listTaxReports(tenantId, limit);
  res.json({ data: reports });
}

export async function exportStatementController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const statement = String(req.params.statement) as 'pl' | 'balance-sheet' | 'cash-flow';
  const format = (req.query.format ?? 'pdf') as 'pdf' | 'excel' | 'quickbooks';
  const startDate = parseDate(req.query.startDate);
  const endDate = parseDate(req.query.endDate);

  const exportResult = await exportStatement(tenantId, statement, format, { startDate, endDate });
  res.setHeader('Content-Type', exportResult.contentType);
  res.setHeader('Content-Disposition', `attachment; filename="${exportResult.filename}"`);
  res.send(exportResult.body);
}

export async function emailStatementController(req: Request, res: Response) {
  const tenantId = requireTenantId(req);
  const statement = String(req.body?.statement ?? 'pl') as 'pl' | 'balance-sheet' | 'cash-flow';
  const recipients: string[] = Array.isArray(req.body?.recipients)
    ? (req.body.recipients as string[]).map(String)
    : [];
  const startDate = parseDate(req.body?.startDate);
  const endDate = parseDate(req.body?.endDate);

  await emailStatement(tenantId, statement, recipients, { startDate, endDate });
  res.status(202).json({ data: { ok: true } });
}
