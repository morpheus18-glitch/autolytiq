import type { Request, Response } from 'express';
import { z } from 'zod';
import { AccountType, JournalStatus, NormalBalance, TaxReportType } from '@prisma/client';
import {
  generatePLStatement,
  generateBalanceSheet,
  generateCashFlow,
  autoGenerateJournalEntry,
  calculatePayroll,
  importStandardCOA,
  getDashboardMetrics,
  listJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  postJournalEntry,
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

type ControllerContext = { req: Request; res: Response; tenantId: string };

type StreamPayload = { filename: string; contentType: string; body: Buffer };

type HandlerResult = { status?: number; body: unknown } | { status?: number; stream: StreamPayload };

const lineTypeEnum = { DEBIT: 'DEBIT', CREDIT: 'CREDIT' } as const;

function requireTenantId(req: Request): string {
  const tenantId = req.user?.tenantId;
  if (!tenantId) {
    throw BadRequest('Tenant context is required');
  }
  return tenantId;
}

function enumSchema<T extends Record<string, string>>(enumObject: T, label: string) {
  return z
    .union([z.nativeEnum(enumObject), z.string()])
    .transform((value) => value.toString().trim().toUpperCase())
    .refine((value) => (Object.values(enumObject) as string[]).includes(value), `${label} is invalid`)
    .transform((value) => value as T[keyof T]);
}

const lineTypeSchema = z
  .string()
  .transform((value) => value.toString().trim().toUpperCase())
  .refine((value) => (Object.values(lineTypeEnum) as string[]).includes(value), 'line type is invalid')
  .transform((value) => value as (typeof lineTypeEnum)[keyof typeof lineTypeEnum]);

function parseWith<T>(schema: z.ZodType<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw BadRequest('Invalid request parameters', error.flatten());
    }
    throw error;
  }
}

const createHandler = (
  handler: (context: ControllerContext) => Promise<HandlerResult>,
) =>
  async (req: Request, res: Response) => {
    const tenantId = requireTenantId(req);
    const result = await handler({ req, res, tenantId });
    if ('stream' in result) {
      res.setHeader('Content-Type', result.stream.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.stream.filename}"`);
      res.status(result.status ?? 200).send(result.stream.body);
      return;
    }
    res.status(result.status ?? 200).json(result.body);
  };

const dateRangeQuerySchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const comparisonRangeSchema = z.object({
  comparisonStartDate: z.coerce.date().optional(),
  comparisonEndDate: z.coerce.date().optional(),
});

const balanceSheetQuerySchema = z.object({
  date: z.coerce.date().optional(),
  comparisonDate: z.coerce.date().optional(),
});

const balanceSheetReportQuerySchema = z.object({
  date: z.coerce.date().optional(),
  comparison: z.string().trim().optional(),
});

const cashFlowQuerySchema = dateRangeQuerySchema.extend({
  method: z.string().trim().optional(),
});

const journalFiltersSchema = z.object({
  status: enumSchema(JournalStatus, 'status').optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
  skip: z.coerce.number().int().min(0).optional(),
  take: z.coerce.number().int().min(1).max(200).optional(),
  search: z.string().trim().optional(),
  accountId: z.string().trim().optional(),
});

const amountSchema = z
  .coerce
  .number()
  .refine((value) => Number.isFinite(value), 'amount must be a finite number')
  .transform((value) => Math.round((value + Number.EPSILON) * 100) / 100);

const journalLineSchema = z.object({
  glAccountId: z.string().min(1, 'glAccountId is required'),
  type: lineTypeSchema,
  amount: amountSchema,
  description: z.string().trim().optional(),
});

const journalEntrySchema = z.object({
  memo: z.string().trim().optional(),
  postingDate: z.coerce.date(),
  status: enumSchema(JournalStatus, 'status').optional(),
  dealId: z.string().trim().optional(),
  lines: z.array(journalLineSchema).min(2, 'At least two lines are required'),
});

const upsertAccountSchema = z.object({
  accountNumber: z.string().trim().min(1),
  accountName: z.string().trim().min(1),
  accountType: enumSchema(AccountType, 'accountType'),
  normalBalance: enumSchema(NormalBalance, 'normalBalance'),
  parentAccountId: z.union([z.string().trim().min(1), z.null()]).optional(),
  isActive: z.coerce.boolean().optional(),
});

const payrollOptionsSchema = z.object({
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  commissionTiers: z
    .array(
      z.object({ threshold: z.coerce.number(), rate: z.coerce.number() }),
    )
    .optional(),
  deductionRates: z
    .object({
      federal: z.coerce.number(),
      state: z.coerce.number(),
      fica: z.coerce.number(),
      other: z.coerce.number().optional(),
    })
    .optional(),
  employerTaxRate: z.coerce.number().optional(),
  basePay: z.record(z.coerce.number()).optional(),
  adjustments: z.record(z.coerce.number()).optional(),
  additionalDeductions: z.record(z.coerce.number()).optional(),
});

const finalizePayrollSchema = payrollOptionsSchema.extend({
  approve: z.coerce.boolean().optional(),
  cashAccountId: z.string().trim().optional(),
});

const taxReportSchema = z.object({
  type: enumSchema(TaxReportType, 'type'),
  periodStart: z.coerce.date(),
  periodEnd: z.coerce.date(),
  jurisdiction: z.string().trim().min(2),
  recipients: z.array(z.string().trim().email()).optional(),
});

const statementTypeSchema = z.enum(['pl', 'balance-sheet', 'cash-flow']);

const exportQuerySchema = dateRangeQuerySchema.extend({
  format: z.enum(['pdf', 'excel', 'quickbooks']).optional(),
});

const emailStatementSchema = dateRangeQuerySchema.extend({
  statement: statementTypeSchema.default('pl'),
  recipients: z.array(z.string().trim().email()).min(1),
});

const idParamSchema = z.object({ id: z.string().trim().min(1) });

export const getDashboard = createHandler(async ({ tenantId }) => {
  const metrics = await getDashboardMetrics(tenantId);
  return { body: { data: metrics } };
});

export const getIncomeStatementController = createHandler(async ({ req, tenantId }) => {
  const query = parseWith(dateRangeQuerySchema.merge(comparisonRangeSchema), req.query);
  const comparison =
    query.comparisonStartDate || query.comparisonEndDate
      ? { startDate: query.comparisonStartDate, endDate: query.comparisonEndDate }
      : undefined;
  const statement = await generatePLStatement(tenantId, query.startDate, query.endDate, comparison);
  return { body: { data: statement } };
});

export const getBalanceSheetController = createHandler(async ({ req, tenantId }) => {
  const query = parseWith(balanceSheetQuerySchema, req.query);
  const sheet = await generateBalanceSheet(tenantId, query.date, query.comparisonDate);
  return { body: { data: sheet } };
});

export const getBalanceSheetReportController = createHandler(async ({ req, tenantId }) => {
  const query = parseWith(balanceSheetReportQuerySchema, req.query);
  const comparisonValue = (query.comparison ?? 'NONE').toUpperCase();
  const comparison: BalanceSheetComparisonMode =
    comparisonValue === 'PREVIOUS_MONTH' || comparisonValue === 'PREVIOUS_YEAR' ? comparisonValue : 'NONE';
  const report = await getBalanceSheetReport(tenantId, {
    asOfDate: query.date ?? new Date(),
    comparison,
  });
  return { body: { data: report } };
});

export const getCashFlowController = createHandler(async ({ req, tenantId }) => {
  const query = parseWith(cashFlowQuerySchema, req.query);
  const method = (query.method ?? 'INDIRECT').toUpperCase() as 'INDIRECT' | 'DIRECT';
  const statement = await generateCashFlow(tenantId, query.startDate, query.endDate, method);
  return { body: { data: statement } };
});

export const getJournalEntries = createHandler(async ({ req, tenantId }) => {
  const filters = parseWith(journalFiltersSchema, req.query);
  const entries = await listJournalEntries(tenantId, filters);
  return { body: { data: entries } };
});

export const getJournalEntry = createHandler(async ({ req, tenantId }) => {
  const { id } = parseWith(idParamSchema, req.params);
  const entry = await getJournalEntryById(tenantId, id);
  return { body: { data: entry } };
});

export const createJournalEntryController = createHandler(async ({ req, tenantId }) => {
  const payload = parseWith(journalEntrySchema, req.body ?? {});
  const userId = req.user!.userId;
  const entry = await createJournalEntry(tenantId, userId, {
    memo: payload.memo,
    postingDate: payload.postingDate,
    status: payload.status,
    dealId: payload.dealId,
    lines: payload.lines.map((line) => ({
      glAccountId: line.glAccountId,
      type: line.type,
      amount: line.amount,
      description: line.description,
    })),
  });
  return { status: 201, body: { data: entry } };
});

export const postJournalEntryController = createHandler(async ({ req, tenantId }) => {
  const { id } = parseWith(idParamSchema, req.params);
  const userId = req.user!.userId;
  const entry = await postJournalEntry(tenantId, userId, id);
  return { body: { data: entry } };
});

export const generateDealEntry = createHandler(async ({ req, tenantId }) => {
  const body = parseWith(z.object({ dealId: z.string().trim().min(1) }), req.body ?? {});
  const userId = req.user!.userId;
  const entry = await autoGenerateJournalEntry({ tenantId, dealId: body.dealId, userId });
  return { status: 201, body: { data: entry } };
});

export const listAccounts = createHandler(async ({ tenantId }) => {
  const accounts = await listGLAccounts(tenantId);
  return { body: { data: accounts } };
});

export const upsertAccount = createHandler(async ({ req, tenantId }) => {
  const data = parseWith(upsertAccountSchema, req.body ?? {});
  const { id } = req.params as { id?: string };
  const userId = req.user!.userId;
  const account = await upsertGLAccount(tenantId, userId, {
    id,
    accountNumber: data.accountNumber,
    accountName: data.accountName,
    accountType: data.accountType,
    normalBalance: data.normalBalance,
    parentAccountId: data.parentAccountId ?? null,
    isActive: data.isActive ?? true,
  });
  return { status: id ? 200 : 201, body: { data: account } };
});

export const deactivateAccount = createHandler(async ({ req, tenantId }) => {
  const { id } = parseWith(idParamSchema, req.params);
  const userId = req.user!.userId;
  const account = await deactivateGLAccount(tenantId, userId, id);
  return { body: { data: account } };
});

export const previewPayrollController = createHandler(async ({ req, tenantId }) => {
  const options = parseWith(payrollOptionsSchema, req.body ?? {});
  const preview = await previewPayroll(tenantId, {
    periodStart: options.periodStart,
    periodEnd: options.periodEnd,
    commissionTiers: options.commissionTiers,
    deductionRates: options.deductionRates,
    employerTaxRate: options.employerTaxRate,
    basePay: options.basePay,
    adjustments: options.adjustments,
    additionalDeductions: options.additionalDeductions,
  });
  return { body: { data: preview } };
});

export const finalizePayrollController = createHandler(async ({ req, tenantId }) => {
  const options = parseWith(finalizePayrollSchema, req.body ?? {});
  const userId = req.user!.userId;
  const payroll = await finalizePayroll(tenantId, userId, {
    periodStart: options.periodStart,
    periodEnd: options.periodEnd,
    commissionTiers: options.commissionTiers,
    deductionRates: options.deductionRates,
    employerTaxRate: options.employerTaxRate,
    basePay: options.basePay,
    adjustments: options.adjustments,
    additionalDeductions: options.additionalDeductions,
    approve: options.approve,
    cashAccountId: options.cashAccountId,
    tenantId,
  });
  return { status: 201, body: { data: payroll } };
});

export const calculatePayrollController = createHandler(async ({ req, tenantId }) => {
  const range = parseWith(dateRangeQuerySchema, req.query);
  if (!range.startDate || !range.endDate) {
    throw BadRequest('startDate and endDate are required');
  }
  const result = await calculatePayroll(tenantId, range.startDate, range.endDate);
  return { body: { data: result } };
});

export const listPayrollsController = createHandler(async ({ tenantId }) => {
  const payrolls = await listPayrolls(tenantId);
  return { body: { data: payrolls } };
});

export const getPayrollController = createHandler(async ({ req, tenantId }) => {
  const { id } = parseWith(idParamSchema, req.params);
  const payroll = await getPayrollById(tenantId, id);
  return { body: { data: payroll } };
});

export const generateTaxReportController = createHandler(async ({ req, tenantId }) => {
  const payload = parseWith(taxReportSchema, req.body ?? {});
  const userId = req.user!.userId;
  if (payload.periodEnd < payload.periodStart) {
    throw BadRequest('periodEnd must be on or after periodStart');
  }
  const report = await generateTaxReport(tenantId, userId, {
    type: payload.type,
    periodStart: payload.periodStart,
    periodEnd: payload.periodEnd,
    jurisdiction: payload.jurisdiction,
    recipients: payload.recipients,
  });
  return { status: 201, body: { data: report } };
});

export const listTaxReportsController = createHandler(async ({ req, tenantId }) => {
  const query = parseWith(z.object({ limit: z.coerce.number().int().min(1).max(200).optional() }), req.query);
  const reports = await listTaxReports(tenantId, query.limit ?? 50);
  return { body: { data: reports } };
});

export const exportStatementController = createHandler(async ({ req, tenantId }) => {
  const statement = parseWith(statementTypeSchema, req.params.statement);
  const query = parseWith(exportQuerySchema, req.query);
  const range = { startDate: query.startDate, endDate: query.endDate };
  const exportResult = await exportStatement(tenantId, statement, query.format ?? 'pdf', range);
  return { stream: exportResult };
});

export const emailStatementController = createHandler(async ({ req, tenantId }) => {
  const payload = parseWith(emailStatementSchema, req.body ?? {});
  await emailStatement(tenantId, payload.statement, payload.recipients, {
    startDate: payload.startDate,
    endDate: payload.endDate,
  });
  return { status: 202, body: { data: { ok: true } } };
});

export const importStandardChartOfAccountsController = createHandler(async ({ tenantId }) => {
  const result = await importStandardCOA(tenantId);
  return { status: 201, body: { data: result } };
});
