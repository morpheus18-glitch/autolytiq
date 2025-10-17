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
  dealershipName?: string | null;
  generatedAt: string;
  period: {
    startDate: string;
    endDate: string;
  };
  sections: FinancialStatementSection[];
  totals: Record<string, number>;
  method?: 'indirect' | 'direct' | null;
}

export type BalanceSheetComparisonMode = 'NONE' | 'PREVIOUS_MONTH' | 'PREVIOUS_YEAR';

export interface BalanceSheetAccountBreakdown {
  accountId: string;
  accountNumber: string;
  accountName: string;
  amount: number;
  comparisonAmount: number;
  entries: StatementAccountEntry[];
}

export interface BalanceSheetLineItem {
  key: string;
  label: string;
  type: 'GROUP' | 'LINE' | 'SUBTOTAL' | 'TOTAL';
  amount: number;
  comparisonAmount: number;
  children?: BalanceSheetLineItem[];
  accounts?: BalanceSheetAccountBreakdown[];
}

export interface BalanceSheetSection {
  key: 'ASSETS' | 'LIABILITIES_EQUITY';
  label: string;
  total: number;
  comparisonTotal: number;
  children: BalanceSheetLineItem[];
}

export interface BalanceSheetRatios {
  currentRatio: number | null;
  quickRatio: number | null;
  debtToEquity: number | null;
  workingCapital: number;
  inventoryTurnover: number | null;
  daysSalesInInventory: number | null;
}

export interface BalanceSheetReport {
  dealershipName?: string | null;
  asOfDate: string;
  generatedAt: string;
  comparison?: {
    mode: BalanceSheetComparisonMode;
    asOfDate?: string | null;
  } | null;
  sections: BalanceSheetSection[];
  totals: {
    currentAssets: number;
    totalAssets: number;
    netFixedAssets: number;
    totalFixedAssets: number;
    currentLiabilities: number;
    longTermLiabilities: number;
    totalLiabilities: number;
    totalEquity: number;
  };
  ratios: BalanceSheetRatios;
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

export type JournalEntryStatus = 'DRAFT' | 'POSTED' | 'VOID';
export type JournalEntryType =
  | 'MANUAL'
  | 'AUTO_DEAL'
  | 'AUTO_PAYMENT'
  | 'ADJUSTMENT'
  | 'RECURRING'
  | 'RECLASSIFICATION';

export interface JournalEntryLineResponse {
  id: string;
  accountId: string;
  accountNumber: string;
  accountName: string;
  debit: number;
  credit: number;
  memo?: string | null;
}

export interface JournalEntryResponse {
  id: string;
  entryNumber?: string | null;
  date: string;
  description: string;
  type: JournalEntryType;
  status: JournalEntryStatus;
  memo?: string | null;
  totalDebit: number;
  totalCredit: number;
  createdBy: { id: string; name: string };
  createdAt: string;
  updatedAt: string;
  dealId?: string | null;
  voidedAt?: string | null;
  voidedBy?: { id: string; name: string } | null;
  voidedByEntryId?: string | null;
  isRecurring: boolean;
  recurringFrequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | null;
  recurringStartDate?: string | null;
  recurringEndDate?: string | null;
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
  category?: string | null;
  parentAccountId?: string | null;
  description?: string | null;
  taxLineMapping?: string | null;
  isActive: boolean;
  allowManual?: boolean;
  balance?: number | string | null;
  children: AccountNode[];
}

export interface AccountTransactionLine {
  id: string;
  journalEntryId: string;
  journalEntryNumber?: string | null;
  postingDate: string;
  description?: string | null;
  memo?: string | null;
  debit: number;
  credit: number;
  createdAt?: string;
}

export interface AccountBalanceResponse {
  accountId: string;
  asOfDate: string;
  balance: number;
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

export interface SalesTaxInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  subtotal: number;
  taxRate: number;
  taxAmount: number;
  total: number;
  jurisdiction: string;
}

export interface SalesTaxJurisdictionSummary {
  jurisdiction: string;
  taxRate: number;
  taxableSales: number;
  taxCollected: number;
}

export interface SalesTaxReport {
  invoices: SalesTaxInvoice[];
  totals: {
    taxableSales: number;
    taxCollected: number;
  };
  jurisdictions: SalesTaxJurisdictionSummary[];
  filedAt?: string | null;
  generatedAt?: string | null;
}

export type PayrollQuarter = 'Q1' | 'Q2' | 'Q3' | 'Q4';

export interface Payroll941LineItem {
  key: string;
  label: string;
  amount: number;
  description?: string | null;
  format?: 'currency' | 'number' | 'percentage';
}

export interface Payroll941Report {
  quarter: PayrollQuarter;
  year: number;
  lines: Payroll941LineItem[];
  totals: {
    taxableWages: number;
    totalLiability: number;
    totalDeposits: number;
    balanceDue: number;
  };
  filedAt?: string | null;
  computedAt?: string | null;
}

export interface Contractor1099Record {
  id: string;
  name: string;
  taxId: string;
  address: string;
  totalPaid: number;
  generatedAt?: string | null;
  status?: 'pending' | 'generated' | 'filed';
}

export interface Contractors1099Response {
  year: number;
  contractors: Contractor1099Record[];
  totals: {
    contractorCount: number;
    totalPaid: number;
  };
  filedAt?: string | null;
  generatedAt?: string | null;
}

export interface YearEndCategorySummary {
  label: string;
  amount: number;
  notes?: string | null;
}

export interface YearEndScheduleRow {
  label: string;
  amount: number;
  priorYearAmount?: number | null;
  date?: string | null;
  notes?: string | null;
}

export interface YearEndSummary {
  year: number;
  revenueByCategory: YearEndCategorySummary[];
  expenseByCategory: YearEndCategorySummary[];
  depreciationSchedule: YearEndScheduleRow[];
  assetPurchases: YearEndScheduleRow[];
  debtPrincipal: YearEndScheduleRow[];
  ownerDraws: YearEndScheduleRow[];
  keyDeductions: YearEndCategorySummary[];
  estimatedTaxLiability: number;
  filedAt?: string | null;
  generatedAt?: string | null;
}

export interface TaxReportFiledResponse {
  type: string;
  filedAt: string;
  filedBy?: string | null;
  context?: Record<string, unknown> | null;
}

export interface MarkTaxReportFiledPayload {
  type: 'sales-tax' | '941' | '1099' | 'year-end';
  filedAt?: string;
  context?: Record<string, unknown>;
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

function normalizeStatementAccount(account: any, fallbackId: string): StatementAccount {
  const accountIdSource =
    account?.accountId ??
    account?.id ??
    account?.glAccountId ??
    account?.glAccountID ??
    account?.accountNumber ??
    account?.number ??
    fallbackId;
  const normalBalanceRaw = typeof account?.normalBalance === 'string' ? account.normalBalance.toUpperCase() : null;
  const entries = Array.isArray(account?.entries)
    ? account.entries.map((entry: any, entryIndex: number) => {
        const entryIdSource =
          entry?.journalEntryId ??
          entry?.journal_entry_id ??
          entry?.id ??
          entry?.entryId ??
          `${accountIdSource}-entry-${entryIndex}`;
        const postingDateValue =
          typeof entry?.postingDate === 'string'
            ? entry.postingDate
            : typeof entry?.date === 'string'
              ? entry.date
              : new Date().toISOString();
        const memoValue =
          entry?.memo !== undefined && entry?.memo !== null
            ? String(entry.memo)
            : entry?.description !== undefined && entry?.description !== null
              ? String(entry.description)
              : null;
        return {
          journalEntryId: String(entryIdSource),
          entryNumber: String(
            entry?.entryNumber ??
              entry?.entry_number ??
              entry?.reference ??
              entry?.documentNumber ??
              entry?.document_number ??
              entryIdSource ??
              entryIndex + 1,
          ),
          postingDate: postingDateValue,
          memo: memoValue,
          debit: toNumber(
            entry?.debit ??
              entry?.debitAmount ??
              entry?.amountDebit ??
              entry?.debit_value ??
              entry?.debit_amount ??
              0,
            0,
          ),
          credit: toNumber(
            entry?.credit ??
              entry?.creditAmount ??
              entry?.amountCredit ??
              entry?.credit_value ??
              entry?.credit_amount ??
              0,
            0,
          ),
        };
      })
    : [];

  return {
    accountId: String(accountIdSource),
    accountNumber:
      account?.accountNumber !== undefined && account?.accountNumber !== null
        ? String(account.accountNumber)
        : account?.number !== undefined && account?.number !== null
          ? String(account.number)
          : '',
    accountName:
      account?.accountName !== undefined && account?.accountName !== null
        ? String(account.accountName)
        : account?.name !== undefined && account?.name !== null
          ? String(account.name)
          : 'Account',
    normalBalance: normalBalanceRaw === 'CREDIT' ? 'CREDIT' : 'DEBIT',
    total: toNumber(account?.total ?? account?.amount ?? account?.balance ?? account?.value ?? 0, 0),
    entries,
  };
}

function normalizeStatementSection(section: any, index: number): FinancialStatementSection {
  const labelValue =
    section?.label !== undefined && section?.label !== null
      ? String(section.label)
      : section?.name !== undefined && section?.name !== null
        ? String(section.name)
        : `Section ${index + 1}`;
  const accounts = Array.isArray(section?.accounts)
    ? section.accounts.map((account: any, accountIndex: number) =>
        normalizeStatementAccount(account, `${index}-${accountIndex}`),
      )
    : [];

  return {
    label: labelValue,
    total: toNumber(section?.total ?? section?.amount ?? section?.value ?? 0, 0),
    accounts,
  };
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

export function fetchBalanceSheet(params: { date: string; comparison?: BalanceSheetComparisonMode }) {
  const search = new URLSearchParams();
  search.set('date', params.date);
  if (params.comparison && params.comparison !== 'NONE') {
    search.set('comparison', params.comparison);
  }
  return apiJson<{ data: BalanceSheetReport }>(`/api/accounting/balance-sheet?${search.toString()}`).then((res) => res.data);
}

export function fetchCashFlow(params: { startDate?: string; endDate?: string; method?: 'indirect' | 'direct' }) {
  const search = new URLSearchParams();
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  if (params.method) search.set('method', params.method);

  return apiJson<{ data: any }>(`/api/accounting/cash-flow?${search.toString()}`).then((res) => {
    const payload = res.data ?? {};
    const sections = Array.isArray(payload?.sections)
      ? payload.sections.map((section: any, index: number) => normalizeStatementSection(section, index))
      : [];

    const totals: Record<string, number> = {};
    if (payload?.totals && typeof payload.totals === 'object') {
      Object.entries(payload.totals as Record<string, unknown>).forEach(([key, value]) => {
        totals[key] = toNumber(value, 0);
      });
    }

    const periodPayload =
      payload?.period && typeof payload.period === 'object' && payload.period !== null ? payload.period : null;
    const defaultStart = params.startDate ?? new Date().toISOString();
    const defaultEnd = params.endDate ?? new Date().toISOString();
    const period = periodPayload
      ? {
          startDate: String(periodPayload.startDate ?? defaultStart),
          endDate: String(periodPayload.endDate ?? defaultEnd),
        }
      : { startDate: defaultStart, endDate: defaultEnd };

    const rawMethod = typeof payload?.method === 'string' ? payload.method.toLowerCase() : null;
    const method: 'indirect' | 'direct' | null =
      rawMethod === 'indirect' || rawMethod === 'direct' ? rawMethod : params.method ?? null;

    const result: FinancialStatement = {
      dealershipName:
        typeof payload?.dealershipName === 'string' && payload.dealershipName.trim().length > 0
          ? payload.dealershipName
          : null,
      generatedAt: typeof payload?.generatedAt === 'string' ? payload.generatedAt : new Date().toISOString(),
      period,
      sections,
      totals,
      method,
    };

    return result;
  });
}

export function fetchJournalEntries(params: {
  page?: number;
  limit?: number;
  search?: string;
  type?: JournalEntryType | '';
  status?: JournalEntryStatus | '';
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sort?: 'date' | 'entryNumber' | 'amount';
}) {
  const search = new URLSearchParams();
  const page = params.page ?? 1;
  const limit = params.limit ?? 25;
  search.set('page', String(page));
  search.set('limit', String(limit));
  search.set('skip', String((page - 1) * limit));
  search.set('take', String(limit));
  if (params.search) search.set('search', params.search);
  if (params.type) search.set('type', params.type);
  if (params.status) search.set('status', params.status);
  if (params.accountId) search.set('accountId', params.accountId);
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  if (params.sort) search.set('sort', params.sort);
  return apiJson<{ data: PaginatedJournalEntries }>(`/api/accounting/journal-entries?${search.toString()}`).then((res) => res.data);
}

export function fetchJournalEntry(id: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/${id}`).then((res) => res.data);
}

export interface JournalEntryLinePayload {
  accountId: string;
  debit?: number | null;
  credit?: number | null;
  memo?: string | null;
}

export interface UpsertJournalEntryPayload {
  date: string;
  type: JournalEntryType;
  description: string;
  memo?: string | null;
  isRecurring?: boolean;
  recurringFrequency?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | null;
  recurringStartDate?: string | null;
  recurringEndDate?: string | null;
  dealId?: string | null;
  status?: JournalEntryStatus;
  lines: JournalEntryLinePayload[];
}

export function createJournalEntryRequest(payload: UpsertJournalEntryPayload) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries`, { method: 'POST', body: payload }).then(
    (res) => res.data,
  );
}

export function updateJournalEntryRequest(id: string, payload: UpsertJournalEntryPayload) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/${id}`, { method: 'PUT', body: payload }).then(
    (res) => res.data,
  );
}

export function deleteJournalEntryRequest(id: string) {
  return apiJson<{ data: { success: boolean } }>(`/api/accounting/journal-entries/${id}`, {
    method: 'DELETE',
  }).then((res) => res.data);
}

export function postJournalEntryRequest(id: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/${id}/post`, { method: 'POST' }).then(
    (res) => res.data,
  );
}

export function voidJournalEntryRequest(id: string, voidDate: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/${id}/void`, {
    method: 'POST',
    body: { voidDate },
  }).then((res) => res.data);
}

export function duplicateJournalEntryRequest(id: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/${id}/duplicate`, {
    method: 'POST',
  }).then((res) => res.data);
}

export function autoGenerateJournalEntry(dealId: string) {
  return apiJson<{ data: JournalEntryResponse }>(`/api/accounting/journal-entries/auto-generate`, {
    method: 'POST',
    body: { dealId },
  }).then((res) => res.data);
}

async function ensureOk(res: Response) {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || res.statusText);
  }
}

export async function exportJournalEntriesRequest(params: {
  search?: string;
  type?: JournalEntryType | '';
  status?: JournalEntryStatus | '';
  accountId?: string;
  startDate?: string;
  endDate?: string;
  sort?: 'date' | 'entryNumber' | 'amount';
}) {
  const search = new URLSearchParams();
  if (params.search) search.set('search', params.search);
  if (params.type) search.set('type', params.type);
  if (params.status) search.set('status', params.status);
  if (params.accountId) search.set('accountId', params.accountId);
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  if (params.sort) search.set('sort', params.sort);
  const res = await fetch(`${API_BASE_URL}/api/accounting/journal-entries/export?${search.toString()}`, {
    credentials: 'include',
  });
  await ensureOk(res);
  return res.blob();
}

export async function importJournalEntriesRequest(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE_URL}/api/accounting/journal-entries/import`, {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });
  await ensureOk(res);
  return (await res.json()) as { data: { imported: number; duplicates?: number } };
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
  category?: string | null;
  parentAccountId?: string | null;
  description?: string | null;
  taxLineMapping?: string | null;
  isActive?: boolean;
  allowManual?: boolean;
}) {
  const method = payload.id ? 'PUT' : 'POST';
  const path = payload.id ? `/api/accounting/gl-accounts/${payload.id}` : `/api/accounting/gl-accounts`;
  return apiJson<{ data: AccountNode }>(path, { method, body: payload }).then((res) => res.data);
}

export function deactivateAccountRequest(id: string) {
  return apiJson<{ data: AccountNode }>(`/api/accounting/gl-accounts/${id}`, { method: 'DELETE' }).then((res) => res.data);
}

export function importStandardCoaRequest() {
  return apiJson<{ data: AccountNode[] }>(`/api/accounting/gl-accounts/import-standard`, { method: 'POST' }).then(
    (res) => res.data,
  );
}

export function fetchAccountTransactions(id: string) {
  return apiJson<{ data: AccountTransactionLine[] }>(`/api/accounting/gl-accounts/${id}/transactions`).then(
    (res) => res.data,
  );
}

export function fetchAccountBalance(id: string, date?: string) {
  const params = new URLSearchParams();
  if (date) {
    params.set('date', date);
  }
  const query = params.toString();
  return apiJson<{ data: AccountBalanceResponse }>(
    `/api/accounting/gl-accounts/${id}/balance${query ? `?${query}` : ''}`,
  ).then((res) => res.data);
}

export function reorderAccountsRequest(payload: { parentAccountId?: string | null; orderedIds: string[] }) {
  return apiJson<{ data: AccountNode[] }>(`/api/accounting/gl-accounts/reorder`, { method: 'POST', body: payload }).then(
    (res) => res.data,
  );
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

export function fetchSalesTaxReport(params: { startDate: string; endDate: string; jurisdictions?: string[] }) {
  const search = new URLSearchParams({ startDate: params.startDate, endDate: params.endDate });
  if (params.jurisdictions && params.jurisdictions.length > 0) {
    search.set('jurisdiction', params.jurisdictions.join(','));
  }
  return apiJson<{ data: SalesTaxReport }>(`/api/accounting/tax-reports/sales-tax?${search.toString()}`).then((res) => res.data);
}

export function fetchPayroll941Report(params: { quarter: PayrollQuarter; year: number }) {
  const search = new URLSearchParams({ quarter: params.quarter, year: params.year.toString() });
  return apiJson<{ data: Payroll941Report }>(`/api/accounting/tax-reports/941?${search.toString()}`).then((res) => res.data);
}

export function fetchContractors1099(params: { year: number }) {
  const search = new URLSearchParams({ year: params.year.toString() });
  return apiJson<{ data: Contractors1099Response }>(`/api/accounting/tax-reports/1099?${search.toString()}`).then((res) => res.data);
}

export function fetchYearEndSummary(year: number) {
  const search = new URLSearchParams({ year: year.toString() });
  return apiJson<{ data: YearEndSummary }>(`/api/accounting/tax-reports/year-end?${search.toString()}`).then((res) => res.data);
}

type TaxReportExportFormat = 'pdf' | 'excel' | 'csv' | 'zip';

async function exportTaxReportFile(
  type: 'sales-tax' | '941' | '1099' | 'year-end',
  format: TaxReportExportFormat,
  params: Record<string, string>,
) {
  const url = new URL(`${API_BASE_URL}/api/accounting/tax-reports/${type}/export`);
  url.searchParams.set('format', format);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || response.statusText);
  }

  const blob = await response.blob();
  const filename =
    response.headers.get('content-disposition')?.split('filename="')[1]?.replace('"', '') ??
    `tax-report-${type}.${format === 'excel' ? 'xlsx' : format === 'pdf' ? 'pdf' : format === 'csv' ? 'csv' : 'zip'}`;

  return { blob, filename };
}

export function exportSalesTaxReport(
  format: 'pdf' | 'excel',
  params: { startDate: string; endDate: string; jurisdictions?: string[] },
) {
  const searchParams: Record<string, string> = { startDate: params.startDate, endDate: params.endDate };
  if (params.jurisdictions && params.jurisdictions.length > 0) {
    searchParams.jurisdiction = params.jurisdictions.join(',');
  }
  return exportTaxReportFile('sales-tax', format, searchParams);
}

export function exportPayroll941Report(params: { quarter: PayrollQuarter; year: number }) {
  return exportTaxReportFile('941', 'pdf', {
    quarter: params.quarter,
    year: params.year.toString(),
  });
}

export function exportContractor1099Report(params: { year: number; format: 'pdf' | 'csv' | 'zip'; contractorId?: string }) {
  const searchParams: Record<string, string> = { year: params.year.toString() };
  if (params.contractorId) {
    searchParams.contractorId = params.contractorId;
  }
  return exportTaxReportFile('1099', params.format, searchParams);
}

export function exportYearEndPack(year: number) {
  return exportTaxReportFile('year-end', 'zip', { year: year.toString() });
}

export function markTaxReportFiled(payload: MarkTaxReportFiledPayload) {
  const { type, filedAt, context } = payload;
  const body = {
    filedAt: filedAt ?? new Date().toISOString(),
    context: context ?? {},
  };
  return apiJson<{ data: TaxReportFiledResponse }>(`/api/accounting/tax-reports/${type}/mark-filed`, {
    method: 'POST',
    body,
  }).then((res) => res.data);
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
  params: { startDate?: string; endDate?: string; comparison?: string; method?: string },
) {
  const url = new URL(`${API_BASE_URL}/api/accounting/statements/${statement}/export`);
  url.searchParams.set('format', format);
  if (params.startDate) url.searchParams.set('startDate', params.startDate);
  if (params.endDate) url.searchParams.set('endDate', params.endDate);
  if (params.comparison) url.searchParams.set('comparison', params.comparison);
  if (params.method) url.searchParams.set('method', params.method);
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
  method?: string;
}) {
  return apiJson(`/api/accounting/statements/email`, { method: 'POST', body: payload });
}
