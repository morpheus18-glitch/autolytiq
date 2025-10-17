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

export function fetchIncomeStatement(params: { startDate?: string; endDate?: string }) {
  const search = new URLSearchParams();
  if (params.startDate) search.set('startDate', params.startDate);
  if (params.endDate) search.set('endDate', params.endDate);
  return apiJson<{ data: FinancialStatement }>(`/api/accounting/statements/pl?${search.toString()}`).then((res) => res.data);
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

export async function exportStatementRequest(
  statement: 'pl' | 'balance-sheet' | 'cash-flow',
  format: 'pdf' | 'excel' | 'quickbooks',
  params: { startDate?: string; endDate?: string },
) {
  const url = new URL(`${API_BASE_URL}/api/accounting/statements/${statement}/export`);
  url.searchParams.set('format', format);
  if (params.startDate) url.searchParams.set('startDate', params.startDate);
  if (params.endDate) url.searchParams.set('endDate', params.endDate);
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
}) {
  return apiJson(`/api/accounting/statements/email`, { method: 'POST', body: payload });
}
