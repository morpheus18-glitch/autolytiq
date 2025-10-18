import { API_BASE_URL } from '@/config/api';
import { apiRequest } from '@/lib/queryClient';

export interface DealParticipant {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface DealVehicle {
  id: string;
  year?: number;
  make?: string;
  model?: string;
  vin?: string;
}

export interface DealJacketDto {
  id: string;
  tenantId: string;
  dealNumber: string;
  status: string;
  sellingPrice: string;
  tradeValue?: string | null;
  tradePayoff?: string | null;
  netTrade?: string | null;
  cashDown: string;
  amountFinanced: string;
  lenderId?: string | null;
  apr?: string | null;
  term?: number | null;
  monthlyPayment?: string | null;
  fiProducts: unknown;
  totalFiGross?: string | null;
  dealDate: string;
  contractDate?: string | null;
  fundedDate?: string | null;
  deliveredDate?: string | null;
  customer: DealParticipant;
  vehicle: DealVehicle;
  salesperson: DealParticipant;
  fiManager?: DealParticipant | null;
}

export interface DealDocumentDto {
  id: string;
  dealId: string;
  type: string;
  category: string;
  name: string;
  fileName: string;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  uploadedBy: string;
  uploadedAt: string;
  downloadUrl?: string;
}

export interface CreditReferenceDto {
  name: string;
  relationship: string;
  phone: string;
}

export interface CoApplicantDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
  ssn?: string;
}

export interface CreditApplicationDto {
  id: string;
  dealId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  ssnMasked?: string | null;
  dateOfBirth: string;
  phone: string;
  email: string;
  currentStreet: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  yearsAtAddress: number;
  monthsAtAddress: number;
  residenceType: string;
  monthlyPayment?: string | null;
  previousStreet?: string | null;
  previousCity?: string | null;
  previousState?: string | null;
  previousZip?: string | null;
  employer: string;
  jobTitle: string;
  yearsEmployed: number;
  monthsEmployed: number;
  monthlyIncome: string;
  employerPhone: string;
  otherIncomeSource?: string | null;
  otherIncomeAmount?: string | null;
  coApplicant?: CoApplicantDto | null;
  references: CreditReferenceDto[];
  authorizeCredit: boolean;
  certifyAccuracy: boolean;
  privacyConsent: boolean;
  signature?: string | null;
  signedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreditApplicationPayload {
  dealId: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  ssn?: string | null;
  dateOfBirth: string;
  phone: string;
  email: string;
  currentStreet: string;
  currentCity: string;
  currentState: string;
  currentZip: string;
  yearsAtAddress: number;
  monthsAtAddress: number;
  residenceType: string;
  monthlyPayment?: number | null;
  previousStreet?: string | null;
  previousCity?: string | null;
  previousState?: string | null;
  previousZip?: string | null;
  employer: string;
  jobTitle: string;
  yearsEmployed: number;
  monthsEmployed: number;
  monthlyIncome: number;
  employerPhone: string;
  otherIncomeSource?: string | null;
  otherIncomeAmount?: number | null;
  coApplicant?: CoApplicantDto | null;
  references: CreditReferenceDto[];
  authorizeCredit: boolean;
  certifyAccuracy: boolean;
  privacyConsent: boolean;
  signature?: string | null;
  signedAt?: string | null;
}

export interface CreditReportDto {
  id: string;
  dealId: string;
  bureau: string;
  pullType: string;
  experianScore?: number | null;
  transUnionScore?: number | null;
  equifaxScore?: number | null;
  mergedScore?: number | null;
  scoreRange?: string | null;
  totalAccounts: number;
  openAccounts: number;
  totalRevolvingCredit: string;
  totalRevolvingBalance: string;
  utilizationPercent: string;
  totalInstallmentDebt: string;
  monthlyDebtObligations: string;
  onTimePaymentPercent: string;
  late30Days: number;
  late60Days: number;
  late90PlusDays: number;
  collections: number;
  chargeOffs: number;
  bankruptcies: number;
  foreclosures: number;
  hardInquiries: number;
  softInquiries: number;
  tradeLines: Array<Record<string, unknown>>;
  rawResponse: Record<string, unknown>;
  pdfUrl?: string | null;
  pulledAt: string;
}

export interface PullCreditPayload {
  dealId: string;
  bureau: 'experian' | 'transunion' | 'equifax' | 'tri-merge';
  pullType: 'soft' | 'hard';
}

export interface ShareCreditReportPayload {
  dealId: string;
  emails: string[];
  message?: string;
}

export async function fetchDealJacket(dealId: string) {
  const res = await apiRequest(`/fi/deals/${dealId}`);
  return res.json() as Promise<DealJacketDto>;
}

export async function updateDealJacket(dealId: string, payload: Partial<Record<string, unknown>>) {
  const res = await apiRequest('PUT', `/fi/deals/${dealId}`, payload);
  return res.json() as Promise<DealJacketDto>;
}

export async function listDealDocuments(dealId: string) {
  const res = await apiRequest(`/fi/deals/${dealId}/documents`);
  return res.json() as Promise<DealDocumentDto[]>;
}

function resolveApiUrl(path: string) {
  if (path.startsWith('http')) {
    return path;
  }
  return `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

export async function uploadDealDocument(
  dealId: string,
  input: { type: string; category: string; name?: string; file: File },
) {
  const formData = new FormData();
  formData.append('type', input.type);
  formData.append('category', input.category);
  if (input.name) {
    formData.append('name', input.name);
  }
  formData.append('file', input.file);

  const response = await fetch(resolveApiUrl(`/fi/deals/${dealId}/documents/upload`), {
    method: 'POST',
    body: formData,
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to upload document');
  }

  return (await response.json()) as DealDocumentDto;
}

export async function deleteDealDocument(dealId: string, documentId: string) {
  const response = await fetch(resolveApiUrl(`/fi/deals/${dealId}/documents/${documentId}`), {
    method: 'DELETE',
    credentials: 'include',
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || 'Failed to delete document');
  }
}

export async function fetchCreditApplication(dealId: string) {
  try {
    const res = await apiRequest(`/fi/credit/application/${dealId}`);
    return (await res.json()) as CreditApplicationDto;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('404')) {
      return null;
    }
    throw error;
  }
}

export async function saveCreditApplication(payload: CreditApplicationPayload) {
  const res = await apiRequest('POST', '/fi/credit/application', payload);
  return (await res.json()) as CreditApplicationDto;
}

export async function pullCredit(payload: PullCreditPayload) {
  const res = await apiRequest('POST', '/fi/credit/pull', payload);
  return (await res.json()) as CreditReportDto;
}

export async function fetchCreditReport(dealId: string) {
  try {
    const res = await apiRequest(`/fi/credit/report/${dealId}`);
    return (await res.json()) as CreditReportDto;
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('404')) {
      return null;
    }
    throw error;
  }
}

export async function shareCreditReport(payload: ShareCreditReportPayload) {
  const res = await apiRequest('POST', '/fi/credit/share', payload);
  return res.json() as Promise<{ status: string; recipients: string[]; sentAt: string; pdfUrl?: string | null }>;
}
