import { API_BASE_URL } from '@/config/api';
import { apiRequest } from '@/lib/queryClient';

export interface StatementAccountEntry {
  journalEntryId: string;
  entryNumber: string;
  postingDate: string;
  memo?: string | null;
  debit: number;
  credit: number;
}

export interface StatementAccount {
  accountId: string;
  accountNumber: string;
  accountName: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  total: number;
  entries: StatementAccountEntry[];
}

export interface FinancialStatementSection {
  label: string;
  total: number;
  accounts: StatementAccount[];
}

export interface FinancialStatement {
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  sections: FinancialStatementSection[];
  totals: Record<string, number>;
}

export type PLComparisonMode = 'NONE' | 'PREVIOUS_PERIOD' | 'SAME_PERIOD_LAST_YEAR' | 'BUDGET';

export interface PLStatementTransaction {
  id: string;
  transactionId?: string;
  date: string;
  description: string;
  reference?: string | null;
  memo?: string | null;
  amount: number;
  debit?: number | null;
  credit?: number | null;
  department?: string | null;
  salesperson?: string | null;
  dealNumber?: string | null;
}

export interface PLStatementLineItem {
  id: string;
  key?: string;
  label: string;
  type?: 'SECTION' | 'GROUP' | 'LINE' | 'SUBTOTAL' | 'TOTAL';
  currentAmount: number;
  comparisonAmount?: number | null;
  budgetAmount?: number | null;
  varianceAmount?: number | null;
  variancePercent?: number | null;
  percentOfRevenue?: number | null;
  children?: PLStatementLineItem[];
  transactions?: PLStatementTransaction[];
  drilldownEndpoint?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface ProfitAndLossStatement {
  dealershipName?: string | null;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  comparison?: {
    mode: PLComparisonMode;
    label?: string;
    startDate?: string;
    endDate?: string;
  } | null;
  totals?: Record<string, number>;
  lines: PLStatementLineItem[];
}

export interface DashboardMetrics {
  period: { start: string; end: string };
  revenue: number;
  grossProfit: number;
  netIncome: number;
  cashBalance: number;
  receivables: number;
  payables: number;
  dealVolume: number;
  postedJournalEntries: number;
  trailingNetIncome: number;
}

export interface AccountingDashboardKpi {
  current: number;
  previous: number;
  change: number;
  trend?: number[];
  margin?: number;
  percentOfRevenue?: number;
}

export interface AccountingDashboardResponse {
  kpis: {
    totalRevenue: AccountingDashboardKpi;
    grossProfit: AccountingDashboardKpi;
    netIncome: AccountingDashboardKpi;
    operatingExpenses: AccountingDashboardKpi;
  };
  revenueChart: Array<{ date: string; revenue: number }>;
  profitBreakdown: Array<{ name: string; value: number; percentage: number }>;
  monthlyComparison: Array<{ month: string; revenue: number; expenses: number; profit: number }>;
  departmentPerformance: Array<{ department: string; revenue: number; cost: number; margin: number }>;
  recentTransactions: Array<{
    id: string;
    date: string;
    number?: string;
    description: string;
    account: string;
    debit: number;
    credit: number;
  }>;
}

export interface JournalEntryLineResponse {
  id: string;
  glAccountId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string | null;
  glAccount: {
    id: string;
    accountNumber: string;
    accountName: string;
    accountType: string;
  };
}

export interface JournalEntryResponse {
  id: string;
  entryNumber: string;
  memo?: string | null;
  status: string;
  postingDate: string;
  deal?: { id: string; dealNumber: string | null } | null;
  postedBy?: { id: string; firstName: string; lastName: string } | null;
  lines: JournalEntryLineResponse[];
}

export interface PaginatedJournalEntries {
  items: JournalEntryResponse[];
  total: number;
}

export interface AccountNode {
  id: string;
  tenantId: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  parentAccountId?: string | null;
  isActive: boolean;
  balance?: number | string | null;
  children: AccountNode[];
}

export interface PayrollPreviewLine {
  userId: string;
  userName: string;
  grossPay: number;
  commissionTotal: number;
  commissionBonus: number;
  basePay: number;
  adjustments: number;
  deductions: number;
  employerTaxes: number;
  netPay: number;
  withholding: number;
  commissionIds: string[];
}

export interface PayrollPreview {
  periodStart: string;
  periodEnd: string;
  lines: PayrollPreviewLine[];
  totals: {
    gross: number;
    net: number;
    employeeWithholding: number;
    employerTaxes: number;
  };
}

export interface PayrollResponse {
  id: string;
  periodStart: string;
  periodEnd: string;
  status: string;
  totalGross: number;
  totalNet: number;
  totalTaxes: number;
  journalEntryId?: string | null;
  lines: Array<{
    id: string;
    userId: string;
    grossPay: number;
    deductions: number;
    employerTaxes: number;
    netPay: number;
    commissionAmount?: number | null;
  }>;
}

export interface TaxReportResponse {
  id: string;
  type: string;
  periodStart: string;
  periodEnd: string;
  totalTax: number;
  jurisdiction: string;
  emailedTo: string[];
  generatedAt: string;
}

async function apiJson<T>(url: string, options?: { method?: string; body?: any }): Promise<T> {
  const res = await apiRequest(url, { method: options?.method ?? 'GET', body: options?.body });
  if (res.headers.get('content-length') === '0') {
    return {} as T;
  }
  return (await res.json()) as T;
}

export function fetchDashboardMetrics() {
  return apiJson<{ data: DashboardMetrics }>('/api/accounting/dashboard').then((res) => res.data);
}

export async function fetchAccountingDashboard(params: {
  startDate: string;
  endDate: string;
  compareToLast?: boolean;
}) {
  const search = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
  if (params.compareToLast) {
    search.set('compareToLast', 'true');
  }
  const response = await apiRequest(`/api/accounting/dashboard?${search.toString()}`);
  const payload = await response.json();
  if (payload && typeof payload === 'object' && 'data' in payload) {
    return (payload as { data: AccountingDashboardResponse }).data;
  }
  return payload as AccountingDashboardResponse;
}

export function fetchIncomeStatement(params: { startDate?: string; endDate?: string }) {
  const search = new URLSearchParams();
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  return apiJson<{ data: FinancialStatement }>(`/api/accounting/statements/pl?${search.toString()}`).then((res) => res.data);
}

function toNumber(value: unknown, fallback = 0): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }
  if (typeof value === 'bigint') {
    return Number(value);
  }
  return fallback;
}

function toNullableNumber(value: unknown): number | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = toNumber(value, Number.NaN);
  return Number.isNaN(parsed) ? null : parsed;
}

function normalizeTransaction(row: any): PLStatementTransaction {
  const debit = toNullableNumber(row?.debit ?? row?.debitAmount);
  const credit = toNullableNumber(row?.credit ?? row?.creditAmount);
  const amount = (() => {
    const baseAmount = row?.amount ?? row?.netAmount ?? row?.total ?? row?.value;
    if (baseAmount !== undefined && baseAmount !== null) {
      const numeric = toNumber(baseAmount, Number.NaN);
      if (!Number.isNaN(numeric)) {
        return numeric;
      }
    }
    if (debit !== null || credit !== null) {
      return (debit ?? 0) - (credit ?? 0);
    }
    return 0;
  })();

  const transactionId =
    row?.transactionId ??
    row?.id ??
    row?.journalEntryId ??
    row?.entryId ??
    row?.documentNumber ??
    row?.reference ??
    row?.externalId ??
    row?.memo ??
    `${row?.date ?? ''}-${row?.description ?? Math.random().toString(36).slice(2)}`;

  return {
    id: String(transactionId),
    transactionId: row?.transactionId ? String(row.transactionId) : undefined,
    date: String(
      row?.date ??
        row?.postingDate ??
        row?.transactionDate ??
        row?.occurredOn ??
        row?.glDate ??
        new Date().toISOString(),
    ),
    description: String(row?.description ?? row?.memo ?? row?.name ?? 'Transaction'),
    reference:
      row?.reference ??
      row?.documentNumber ??
      row?.entryNumber ??
      row?.invoiceNumber ??
      row?.dealNumber ??
      null,
    memo: row?.memo ?? row?.notes ?? null,
    amount,
    debit,
    credit,
    department: row?.department ?? row?.departmentName ?? row?.orgUnit ?? null,
    salesperson: row?.salesperson ?? row?.employee ?? row?.associate ?? null,
    dealNumber: row?.dealNumber ?? row?.dealId ?? null,
  };
}

function normalizeLineItem(line: any): PLStatementLineItem {
  const children = Array.isArray(line?.children) ? line.children.map((child: any) => normalizeLineItem(child)) : [];
  const transactions = Array.isArray(line?.transactions)
    ? line.transactions.map((transaction: any) => normalizeTransaction(transaction))
    : undefined;
  const type: PLStatementLineItem['type'] = line?.type ?? (children.length > 0 ? 'SECTION' : undefined);
  const comparisonAmount =
    toNullableNumber(
      line?.comparisonAmount ??
        line?.comparison ??
        line?.previous ??
        line?.prior ??
        (line?.budgetAmount !== undefined ? line?.budgetAmount : undefined),
    ) ?? undefined;

  const generatedId =
    line?.id ??
    line?.key ??
    line?.code ??
    line?.label ??
    line?.name ??
    (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Math.random().toString(36).slice(2));

  return {
    id: String(generatedId),
    key: line?.key ?? line?.code ?? line?.id ?? undefined,
    label: String(line?.label ?? line?.name ?? line?.accountName ?? 'Line Item'),
    type,
    currentAmount: toNumber(line?.currentAmount ?? line?.current ?? line?.amount ?? line?.value ?? 0, 0),
    comparisonAmount,
    budgetAmount: toNullableNumber(line?.budgetAmount ?? line?.plan ?? undefined) ?? undefined,
    varianceAmount:
      toNullableNumber(line?.varianceAmount ?? line?.variance?.amount ?? line?.delta ?? line?.change ?? undefined) ?? undefined,
    variancePercent:
      toNullableNumber(
        line?.variancePercent ??
          line?.variance?.percent ??
          line?.variancePct ??
          line?.variancePercentage ??
          line?.changePercent ??
          line?.deltaPercent ??
          undefined,
      ) ?? undefined,
    percentOfRevenue:
      toNullableNumber(
        line?.percentOfRevenue ??
          line?.margin ??
          line?.profitability ??
          line?.grossMargin ??
          line?.percent ??
          line?.percentage ??
          undefined,
      ) ?? undefined,
    children: children.length > 0 ? children : undefined,
    transactions,
    drilldownEndpoint:
      typeof line?.drilldownEndpoint === 'string'
        ? line?.drilldownEndpoint
        : typeof line?.drilldownUrl === 'string'
          ? line?.drilldownUrl
          : typeof line?.transactionsEndpoint === 'string'
            ? line?.transactionsEndpoint
            : null,
    metadata: typeof line?.metadata === 'object' && line?.metadata !== null ? { ...line.metadata } : null,
  };
}

export function fetchProfitAndLossStatement(params: {
  startDate: string;
  endDate: string;
  comparison?: PLComparisonMode;
}) {
  const search = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
  if (params.comparison && params.comparison !== 'NONE') {
    search.set('comparison', params.comparison);
  }

  return apiJson<{ data: ProfitAndLossStatement }>(`/api/accounting/pl-statement?${search.toString()}`).then((res) => {
    const payload = res.data;
    const lines = Array.isArray(payload?.lines) ? payload.lines.map((line) => normalizeLineItem(line)) : [];
    const result: ProfitAndLossStatement = {
      dealershipName: payload?.dealershipName ?? null,
      generatedAt: payload?.generatedAt ?? new Date().toISOString(),
      period: payload?.period ?? { startDate: params.startDate, endDate: params.endDate },
      comparison: payload?.comparison ?? (params.comparison ? { mode: params.comparison } : null),
      totals: payload?.totals ?? {},
      lines,
    };
    return result;
  });
}

export function fetchPLStatementTransactions(params: {
  lineId: string;
  startDate: string;
  endDate: string;
  comparison?: PLComparisonMode;
  endpoint?: string | null;
}) {
  const search = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
  if (params.comparison && params.comparison !== 'NONE') {
    search.set('comparison', params.comparison);
  }

  const baseEndpoint = params.endpoint ?? `/api/accounting/pl-statement/${encodeURIComponent(params.lineId)}/transactions`;
  const separator = baseEndpoint.includes('?') ? '&' : '?';
  return apiJson<{ data: PLStatementTransaction[] }>(`${baseEndpoint}${separator}${search.toString()}`).then((res) =>
    Array.isArray(res.data) ? res.data.map((item) => normalizeTransaction(item)) : [],
  );
}

export function fetchBalanceSheet(params: { startDate?: string; endDate?: string }) {
  const search = new URLSearchParams();
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  return apiJson<{ data: FinancialStatement }>(`/api/accounting/statements/balance-sheet?${search.toString()}`).then(
    (res) => res.data,
  );
}

export function fetchCashFlow(params: { startDate?: string; endDate?: string }) {
  const search = new URLSearchParams();
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  return apiJson<{ data: FinancialStatement }>(`/api/accounting/statements/cash-flow?${search.toString()}`).then((res) => res.data);
}

export function fetchJournalEntries(params: {
  status?: string;
  startDate?: string;
  endDate?: string;
  skip?: number;
  take?: number;
  search?: string;
  accountId?: string;
}) {
  const search = new URLSearchParams();
  if (params.status) search.set('status', params.status);
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  if (params.skip !== undefined) search.set('skip', String(params.skip));
  if (params.take !== undefined) search.set('take', String(params.take));
  if (params.search) search.set('search', params.search);
  if (params.accountId) search.set('accountId', params.accountId);
  return apiJson<{ data: PaginatedJournalEntries }>(`/api/accounting/journal-entries?${search.toString()}`).then((res) => res.data);
}

export function fetchJournalEntry(id: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/${id}`).then((res) => res.data);
}

export function createJournalEntryRequest(payload: {
  memo?: string;
  postingDate: string;
  status?: string;
  dealId?: string;
  lines: Array<{ glAccountId: string; type: 'DEBIT' | 'CREDIT'; amount: number; description?: string }>;
}) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries`, { method: 'POST', body: payload }).then(
    (res) => res.data,
  );
}

export function postJournalEntryRequest(id: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/${id}/post`, { method: 'POST' }).then(
    (res) => res.data,
  );
}

export function autoGenerateJournalEntry(dealId: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/auto-generate`, {
    method: 'POST',
    body: { dealId },
  }).then((res) => res.data);
}

export function fetchAccounts() {
  return apiJson<{ data: AccountNode[] }>(`/api/accounting/gl-accounts`).then((res) => res.data);
}

export function upsertAccountRequest(payload: {
  id?: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  parentAccountId?: string | null;
  isActive?: boolean;
}) {
  const method = payload.id ? 'PUT' : 'POST';
  const path = payload.id ? `/api/accounting/gl-accounts/${payload.id}` : `/api/accounting/gl-accounts`;
  return apiJson<{ data: AccountNode }>(path, { method, body: payload }).then((res) => res.data);
}

export function deactivateAccountRequest(id: string) {
  return apiJson<{ data: AccountNode }>(`/api/accounting/gl-accounts/${id}`, { method: 'DELETE' }).then((res) => res.data);
}

export function previewPayrollRequest(payload: {
  periodStart: string;
  periodEnd: string;
  commissionTiers?: Array<{ threshold: number; rate: number }>;
  deductionRates?: Record<string, number>;
  employerTaxRate?: number;
  basePay?: Record<string, number>;
  adjustments?: Record<string, number>;
  additionalDeductions?: Record<string, number>;
}) {
  return apiJson<{ data: PayrollPreview }>(`/api/accounting/payroll/preview`, { method: 'POST', body: payload }).then(
    (res) => res.data,
  );
}

export function finalizePayrollRequest(payload: {
  periodStart: string;
  periodEnd: string;
  commissionTiers?: Array<{ threshold: number; rate: number }>;
  deductionRates?: Record<string, number>;
  employerTaxRate?: number;
  basePay?: Record<string, number>;
  adjustments?: Record<string, number>;
  additionalDeductions?: Record<string, number>;
  approve?: boolean;
  cashAccountId?: string;
}) {
  return apiJson<{ data: PayrollResponse }>(`/api/accounting/payroll/finalize`, { method: 'POST', body: payload }).then(
    (res) => res.data,
  );
}

export function fetchPayrolls() {
  return apiJson<{ data: PayrollResponse[] }>(`/api/accounting/payroll`).then((res) => res.data);
}

export function fetchPayroll(id: string) {
  return apiJson<{ data: PayrollResponse }>(`/api/accounting/payroll/${id}`).then((res) => res.data);
}

export function createTaxReportRequest(payload: {
  type: string;
  periodStart: string;
  periodEnd: string;
  jurisdiction: string;
  recipients?: string[];
}) {
  return apiJson<{ data: TaxReportResponse }>(`/api/accounting/tax-reports`, { method: 'POST', body: payload }).then(
    (res) => res.data,
  );
}

export function fetchTaxReports(limit = 50) {
  return apiJson<{ data: TaxReportResponse[] }>(`/api/accounting/tax-reports?limit=${limit}`).then((res) => res.data);
}

export function emailDashboardReport(payload: {
  recipients: string[];
  subject: string;
  message?: string;
  formats: Array<'pdf' | 'excel'>;
  startDate: string;
  endDate: string;
  compareToLast?: boolean;
}) {
  return apiJson(`/api/accounting/dashboard/email`, { method: 'POST', body: payload });
}

export function scheduleDashboardReport(payload: {
  recipients: string[];
  frequency: 'daily' | 'weekly' | 'monthly';
  time: string;
  dayOfWeek?: string;
  formats: Array<'pdf' | 'excel'>;
  startDate: string;
  endDate: string;
  compareToLast?: boolean;
}) {
  return apiJson(`/api/accounting/dashboard/schedule`, { method: 'POST', body: payload });
}

export async function exportStatementRequest(
  statement: 'pl' | 'balance-sheet' | 'cash-flow',
  format: 'pdf' | 'excel' | 'quickbooks',
  params: { startDate?: string; endDate?: string; comparison?: string },
) {
  const url = new URL(`${API_BASE_URL}/api/accounting/statements/${statement}/export`);
  url.searchParams.set('format', format);
  if (params.startDate) url.searchParams.set('startDate', params.startDate);
  if (params.endDate) url.searchParams.set('endDate', params.endDate);
  if (params.comparison) url.searchParams.set('comparison', params.comparison);
  const response = await fetch(url.toString(), {
    method: 'POST',
    credentials: 'include',
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || response.statusText);
  }
  const blob = await response.blob();
  const filename = response.headers.get('content-disposition')?.split('filename="')[1]?.replace('"', '') ??
    `statement.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : 'iif'}`;
  return { blob, filename };
}

export function emailStatementRequest(payload: {
  statement: 'pl' | 'balance-sheet' | 'cash-flow';
  recipients: string[];
  startDate?: string;
  endDate?: string;
  comparison?: string;
  subject?: string;
  message?: string;
}) {
  return apiJson(`/api/accounting/statements/email`, { method: 'POST', body: payload });
}
