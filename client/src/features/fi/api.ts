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

export interface LenderDto {
  id: string;
  tenantId: string;
  name: string;
  type: string;
  apiProvider: string;
  isActive: boolean;
  tierRange: string;
  maxTerm: number;
  maxLtv: string;
  minCreditScore?: number | null;
  maxCreditScore?: number | null;
  applicationFee?: string | null;
}

export interface LenderStipulationDto {
  id: string;
  description: string;
  status: 'REQUIRED' | 'SATISFIED' | 'WAIVED';
  dueDate?: string | null;
  receivedAt?: string | null;
  notes?: string | null;
}

export interface LenderSubmissionDto {
  id: string;
  tenantId: string;
  dealId: string;
  lenderId: string;
  submittedAt: string;
  submittedBy: string;
  requestPayload: Record<string, unknown>;
  status: string;
  respondedAt?: string | null;
  responsePayload?: Record<string, unknown> | null;
  amountApproved?: string | null;
  apr?: string | null;
  buyRate?: string | null;
  dealerReserve?: string | null;
  maxReserve?: string | null;
  term?: number | null;
  monthlyPayment?: string | null;
  declineReason?: string | null;
  declineCode?: string | null;
  stipulations?: LenderStipulationDto[] | null;
  isSelected: boolean;
  selectedAt?: string | null;
  expiresAt?: string | null;
  lender: LenderDto;
}

export interface FIProductDto {
  id: string;
  tenantId: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  coverageDetails: unknown;
  cost: number;
  retailPrice: number;
  markup: number;
  margin: number;
  term?: number | null;
  termType?: string | null;
  deductible?: number | null;
  minVehicleAge?: number | null;
  maxVehicleAge?: number | null;
  minMileage?: number | null;
  maxMileage?: number | null;
  isActive: boolean;
}

export interface MenuOptionProductDto {
  id: string;
  name: string;
  category: string;
  provider: string;
  description: string;
  coverageDetails: unknown;
  cost: number;
  retailPrice: number;
  markup: number;
  term?: number | null;
  termType?: string | null;
  deductible?: number | null;
  minVehicleAge?: number | null;
  maxVehicleAge?: number | null;
  minMileage?: number | null;
  maxMileage?: number | null;
}

export interface MenuOptionDto {
  code: 'A' | 'B' | 'C' | 'D';
  label: string;
  products: MenuOptionProductDto[];
  totalRetail: number;
  totalCost: number;
  totalMarkup: number;
  paymentImpact: number | null;
}

export interface MenuAvailabilityDto {
  product: FIProductDto;
  eligible: boolean;
  reasons: string[];
}

export interface MenuConfigurationDto {
  id: string | null;
  dealId: string;
  options: MenuOptionDto[];
  selectedOption: string | null;
  selectedProducts: MenuOptionDto | null;
  totalProductCost: number | null;
  totalMarkup: number | null;
  paymentImpact: number | null;
  selectedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface MenuPresentationDto {
  configuration: MenuConfigurationDto;
  availableProducts: MenuAvailabilityDto[];
  baseAmountFinanced: number;
  baseMonthlyPayment: number | null;
  apr: number | null;
  term: number | null;
  vehicle: { year: number | null; mileage: number | null };
}

export interface FiDashboardMetricDto {
  value: number;
  previous: number;
  delta: number;
  percentChange: number | null;
}

export interface FiDashboardKpisDto {
  range: { start: string; end: string };
  dealsContracted: FiDashboardMetricDto;
  productsPerDeal: FiDashboardMetricDto;
  productPenetration: FiDashboardMetricDto;
  backGross: FiDashboardMetricDto;
}

export interface FiDashboardActiveDealDto {
  id: string;
  dealNumber: string;
  status: string;
  dealDate: string | null;
  contractDate: string | null;
  updatedAt: string | null;
  amountFinanced: number;
  totalFiGross: number;
  lenderId: string | null;
  lenderName: string | null;
  customerName: string;
  vehicle: { year: number | null; make: string | null; model: string | null } | null;
  salesperson: { id: string; name: string } | null;
  fiManager: { id: string; name: string } | null;
}

export interface FiDashboardProductPerformanceDto {
  productName: string;
  category: string | null;
  provider: string | null;
  soldCount: number;
  penetrationRate: number;
  averagePrice: number;
  totalRevenue: number;
  averageMarkup: number;
}

export interface FiDashboardLenderPerformanceDto {
  lenderId: string;
  lenderName: string;
  submitted: number;
  approved: number;
  approvalRate: number;
  averageApr: number;
}

export interface FiDashboardCommissionDto {
  dealsClosed: number;
  totalBackGross: number;
  rate: number;
  baseCommission: number;
  bonuses: {
    volumeTarget?: number;
    volumeBonus: number;
    volumeAchieved: boolean;
    grossTarget?: number;
    grossBonus: number;
    grossAchieved: boolean;
    totalBonus: number;
  };
  totalCompensation: number;
}

export interface FiDashboardFilters {
  startDate?: string;
  endDate?: string;
  lenderId?: string;
  salespersonId?: string;
}

export interface MenuBuilderOptionInput {
  code: 'A' | 'B' | 'C' | 'D';
  label?: string;
  productIds: string[];
}

export interface MenuBuildPayload {
  dealId: string;
  options: MenuBuilderOptionInput[];
}

export interface MenuSelectionPayload {
  optionCode?: string | null;
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

export type FundingTimelineStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';

export type FundingTimelineEventType =
  | 'CHECKS'
  | 'SUBMISSION'
  | 'REVIEW'
  | 'APPROVAL'
  | 'FUNDED'
  | 'NOTE'
  | 'WEBHOOK'
  | 'CANCELLATION';

export interface FundingTimelineEntryDto {
  id: string;
  type: FundingTimelineEventType;
  status: FundingTimelineStatus;
  label: string;
  timestamp: string;
  message?: string | null;
  expectedAt?: string | null;
  metadata?: Record<string, unknown> | null;
}

export interface FundingPacketDto {
  documentId: string;
  url: string;
  fileName: string;
  generatedAt: string;
}

export interface FundingRequestDto {
  id: string;
  dealId: string;
  tenantId: string;
  lenderId: string;
  amountRequested: number;
  fundingMethod: string;
  bankAccountId?: string | null;
  status: string;
  submittedAt?: string | null;
  reviewedAt?: string | null;
  approvedAt?: string | null;
  fundedAt?: string | null;
  fundedAmount?: number | null;
  lenderRefNumber?: string | null;
  timeline: FundingTimelineEntryDto[];
  journalEntryId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PreFundingChecklistDto {
  ready: boolean;
  contractsComplete: boolean;
  complianceComplete: boolean;
  stipulationsComplete: boolean;
  fundingChecklistComplete: boolean;
  outstandingContracts: string[];
  outstandingStipulations: Array<{ id: string; description: string }>;
  messages: string[];
}

export interface FundingDealSummaryDto {
  id: string;
  dealNumber: string;
  status: string;
  amountFinanced: number;
  cashDown: number;
  lenderId?: string | null;
  lenderName?: string | null;
  customerName: string;
  apr?: number | null;
  term?: number | null;
}

export interface FundingStatusDto {
  deal: FundingDealSummaryDto;
  request: FundingRequestDto | null;
  preFunding: PreFundingChecklistDto;
  packet: FundingPacketDto | null;
}

export interface FundingSubmissionPayload {
  dealId: string;
  fundingMethod: 'ACH' | 'WIRE' | 'CHECK';
  amountRequested: number;
  bankAccountId?: string | null;
  submissionType?: 'INTEGRATION' | 'MANUAL';
  externalReference?: string | null;
  notes?: string | null;
  previewOnly?: boolean;
}

export interface FundingStatusUpdatePayload {
  dealId: string;
  status?: string;
  entryId?: string;
  eventType?: FundingTimelineEventType;
  eventStatus?: FundingTimelineStatus;
  note?: string | null;
  expectedAt?: string | null;
}

export interface MarkFundingPayload {
  dealId: string;
  fundedAmount: number;
  fundedAt?: string | null;
  lenderRefNumber?: string | null;
  notes?: string | null;
}

export interface FundingCancellationPayload {
  dealId: string;
  reason?: string | null;
}

export type ComplianceGroup = 'federal' | 'state' | 'lender' | 'internal';

export interface ComplianceItemDto {
  id: string;
  title: string;
  description: string;
  required: boolean;
  completed: boolean;
  completedAt: string | null;
  statute?: string | null;
  source: ComplianceGroup;
  documentUrl?: string | null;
  notes?: string | null;
  dueDate?: string | null;
  autoGenerateType?: 'buyers-guide' | 'tila';
  autoGenerated?: boolean;
}

export interface ComplianceChecklistProgressDto {
  completedItems: number;
  totalItems: number;
  percentComplete: number;
  isComplete: boolean;
  completedAt: string | null;
}

export interface ComplianceMetadataDto {
  stateLabel: string;
  dealNumber: string;
  customerName: string;
  vehicleDescription: string;
  lenderName: string | null;
  lenderSubmissionId: string | null;
  lenderStatus: string | null;
  lastUpdated: string;
}

export interface ComplianceChecklistDto {
  id: string;
  dealId: string;
  state: string;
  progress: ComplianceChecklistProgressDto;
  groups: Record<ComplianceGroup, ComplianceItemDto[]>;
  metadata: ComplianceMetadataDto;
}

export interface GeneratedComplianceDocumentDto {
  id: string;
  type: 'buyers-guide' | 'tila';
  url: string;
  fileName: string;
}

export interface ComplianceDocumentResultDto {
  checklist: ComplianceChecklistDto;
  document: GeneratedComplianceDocumentDto;
}

export interface ComplianceUpdateInput {
  group: ComplianceGroup;
  itemId: string;
  completed: boolean;
  documentUrl?: string;
  notes?: string;
}

export interface StateComplianceRequirementDto {
  state: string;
  label: string;
  requirements: Array<{ id: string; title: string; description: string; statute: string }>;
}

export type ContractType =
  | 'RISC'
  | 'BUYERS_ORDER'
  | 'VSC'
  | 'GAP'
  | 'TIRE_WHEEL'
  | 'ODOMETER'
  | 'BILL_OF_SALE'
  | 'TILA'
  | 'PRIVACY'
  | 'ARBITRATION'
  | 'TRADE_IN'
  | 'POA';

export type ContractStatus = 'DRAFT' | 'SENT' | 'VIEWED' | 'SIGNED' | 'COMPLETED' | 'VOIDED';

export interface ContractSignerDto {
  name: string;
  email: string;
  role: string;
  roleLabel?: string;
  routingOrder?: number;
}

export interface ContractDto {
  id: string;
  tenantId: string;
  dealId: string;
  type: ContractType;
  name: string;
  templateId?: string | null;
  pdfUrl?: string | null;
  docusignEnvelopeId?: string | null;
  status: ContractStatus;
  sentAt?: string | null;
  viewedAt?: string | null;
  signedAt?: string | null;
  completedAt?: string | null;
  signers: ContractSignerDto[];
  contractData: Record<string, unknown>;
  generatedBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContractStatusResponse {
  contracts: ContractDto[];
  allSigned: boolean;
  requiredCompleted: ContractType[];
}

export interface ContractGenerationInput {
  type: ContractType;
  name?: string;
  templateId?: string | null;
  contractData?: Record<string, unknown>;
  signers?: ContractSignerDto[];
}

export interface GenerateContractsPayload {
  dealId: string;
  contracts: ContractGenerationInput[];
}

export interface SendContractsPayload {
  dealId: string;
  contractIds?: string[];
  signers: ContractSignerDto[];
  message?: string;
}

export const CONTRACT_LABELS: Record<ContractType, string> = {
  RISC: 'Retail Installment Sales Contract',
  BUYERS_ORDER: "Buyer’s Order",
  VSC: 'Vehicle Service Contract',
  GAP: 'GAP Waiver',
  TIRE_WHEEL: 'Tire & Wheel Protection',
  ODOMETER: 'Odometer Disclosure',
  BILL_OF_SALE: 'Bill of Sale',
  TILA: 'Truth in Lending',
  PRIVACY: 'Privacy Policy Acknowledgement',
  ARBITRATION: 'Arbitration Agreement',
  TRADE_IN: 'Trade-In Agreement',
  POA: 'Power of Attorney',
};

export const REQUIRED_CONTRACT_TYPES: ContractType[] = [
  'RISC',
  'BUYERS_ORDER',
  'BILL_OF_SALE',
  'TILA',
  'PRIVACY',
  'ARBITRATION',
  'POA',
];

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

export interface SubmitLendersPayload {
  dealId: string;
  lenderIds: string[];
  desiredTerm?: number | null;
}

export interface CounterOfferPayload {
  submissionId: string;
  amount?: number | null;
  apr?: number | null;
  term?: number | null;
  message?: string | null;
}

export interface SatisfyStipulationPayload {
  submissionId: string;
  stipulationId: string;
  note?: string | null;
}

function buildDashboardQuery(filters?: FiDashboardFilters) {
  if (!filters) {
    return '';
  }
  const params = new URLSearchParams();
  if (filters.startDate) {
    params.set('startDate', filters.startDate);
  }
  if (filters.endDate) {
    params.set('endDate', filters.endDate);
  }
  if (filters.lenderId) {
    params.set('lenderId', filters.lenderId);
  }
  if (filters.salespersonId) {
    params.set('salespersonId', filters.salespersonId);
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}

export async function fetchFiDashboardKpis(filters?: FiDashboardFilters) {
  const res = await apiRequest(`/fi/dashboard/kpis${buildDashboardQuery(filters)}`);
  return res.json() as Promise<FiDashboardKpisDto>;
}

export async function fetchFiDashboardActiveDeals(filters?: FiDashboardFilters) {
  const res = await apiRequest(`/fi/dashboard/active-deals${buildDashboardQuery(filters)}`);
  return res.json() as Promise<FiDashboardActiveDealDto[]>;
}

export async function fetchFiDashboardProductPerformance(filters?: FiDashboardFilters) {
  const res = await apiRequest(`/fi/dashboard/product-performance${buildDashboardQuery(filters)}`);
  return res.json() as Promise<FiDashboardProductPerformanceDto[]>;
}

export async function fetchFiDashboardLenderPerformance(filters?: FiDashboardFilters) {
  const res = await apiRequest(`/fi/dashboard/lender-performance${buildDashboardQuery(filters)}`);
  return res.json() as Promise<FiDashboardLenderPerformanceDto[]>;
}

export async function fetchFiDashboardCommission(filters?: FiDashboardFilters) {
  const res = await apiRequest(`/fi/dashboard/commission${buildDashboardQuery(filters)}`);
  return res.json() as Promise<FiDashboardCommissionDto>;
}

export async function fetchDealJacket(dealId: string) {
  const res = await apiRequest(`/fi/deals/${dealId}`);
  return res.json() as Promise<DealJacketDto>;
}

export async function updateDealJacket(dealId: string, payload: Partial<Record<string, unknown>>) {
  const res = await apiRequest('PUT', `/fi/deals/${dealId}`, payload);
  return res.json() as Promise<DealJacketDto>;
}

export async function listLenders() {
  const res = await apiRequest('/fi/lenders');
  return res.json() as Promise<LenderDto[]>;
}

export async function submitLenders(payload: SubmitLendersPayload) {
  const res = await apiRequest('POST', '/fi/lenders/submit', payload);
  return res.json() as Promise<LenderSubmissionDto[]>;
}

export async function fetchLenderDecisions(dealId: string) {
  const res = await apiRequest(`/fi/lenders/decisions/${dealId}`);
  return res.json() as Promise<LenderSubmissionDto[]>;
}

export async function selectLenderSubmission(payload: { submissionId: string }) {
  const res = await apiRequest('POST', '/fi/lenders/select-decision', payload);
  return res.json() as Promise<LenderSubmissionDto>;
}

export async function submitCounterOffer(payload: CounterOfferPayload) {
  const res = await apiRequest('POST', '/fi/lenders/counter-offer', payload);
  return res.json() as Promise<LenderSubmissionDto>;
}

export async function satisfyStipulation(payload: SatisfyStipulationPayload) {
  const res = await apiRequest('POST', '/fi/lenders/satisfy-stipulation', payload);
  return res.json() as Promise<LenderSubmissionDto>;
}

export async function fetchFundingStatus(dealId: string) {
  const res = await apiRequest(`/fi/funding/status/${dealId}`);
  return res.json() as Promise<FundingStatusDto>;
}

export async function submitFundingRequest(payload: FundingSubmissionPayload) {
  const res = await apiRequest('POST', '/fi/funding/submit', payload);
  return res.json() as Promise<FundingStatusDto>;
}

export async function updateFundingStatus(payload: FundingStatusUpdatePayload) {
  const res = await apiRequest('PUT', '/fi/funding/update-status', payload);
  return res.json() as Promise<FundingStatusDto>;
}

export async function markDealFunded(payload: MarkFundingPayload) {
  const res = await apiRequest('POST', '/fi/funding/mark-funded', payload);
  return res.json() as Promise<FundingStatusDto>;
}

export async function cancelFunding(payload: FundingCancellationPayload) {
  const res = await apiRequest('POST', '/fi/funding/cancel', payload);
  return res.json() as Promise<FundingStatusDto>;
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

export async function fetchComplianceChecklist(dealId: string): Promise<ComplianceChecklistDto> {
  const res = await apiRequest(`/fi/compliance/checklist/${dealId}`);
  const json = await res.json();
  return json.data as ComplianceChecklistDto;
}

export async function updateComplianceChecklistItems(payload: {
  dealId: string;
  updates?: ComplianceUpdateInput[];
  completeAll?: boolean;
}): Promise<ComplianceChecklistDto> {
  const res = await apiRequest('POST', '/fi/compliance/mark-complete', payload);
  const json = await res.json();
  return json.data as ComplianceChecklistDto;
}

export async function generateComplianceDocument(
  dealId: string,
  type: 'buyers-guide' | 'tila',
): Promise<ComplianceDocumentResultDto> {
  const res = await apiRequest('POST', `/fi/compliance/generate-doc/${type}`, { dealId });
  const json = await res.json();
  return json.data as ComplianceDocumentResultDto;
}

export async function fetchStateComplianceRequirements(state: string): Promise<StateComplianceRequirementDto> {
  const res = await apiRequest(`/fi/compliance/state-requirements/${state}`);
  const json = await res.json();
  return json.data as StateComplianceRequirementDto;
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

export async function listFiProducts(): Promise<FIProductDto[]> {
  const res = await apiRequest('/fi/products');
  return res.json();
}

export async function fetchMenuConfiguration(dealId: string): Promise<MenuPresentationDto> {
  const res = await apiRequest(`/fi/menu/${dealId}`);
  return res.json();
}

export async function buildMenuConfiguration(payload: MenuBuildPayload): Promise<MenuPresentationDto> {
  const res = await apiRequest('POST', '/fi/menu/build', payload);
  return res.json();
}

export async function selectMenuOption(
  dealId: string,
  payload: MenuSelectionPayload,
): Promise<MenuPresentationDto> {
  const res = await apiRequest('POST', `/fi/menu/${dealId}/select-option`, payload);
  return res.json();
}

export async function fetchFiProductDetails(productId: string): Promise<FIProductDto> {
  const res = await apiRequest(`/fi/product-details/${productId}`);
  return res.json();
}

export async function fetchContractStatuses(dealId: string): Promise<ContractStatusResponse> {
  const res = await apiRequest(`/fi/contracts/status/${dealId}`);
  return res.json();
}

export async function generateContracts(payload: GenerateContractsPayload): Promise<ContractDto[]> {
  const res = await apiRequest('POST', '/fi/contracts/generate', payload);
  return res.json();
}

export async function sendContracts(payload: SendContractsPayload) {
  const res = await apiRequest('POST', '/fi/contracts/send-for-signature', payload);
  return res.json() as Promise<{ envelopeId: string; contractIds: string[]; status: string; sentAt: string }>;
}

export function downloadContract(contractId: string) {
  window.location.href = resolveApiUrl(`/fi/contracts/download/${contractId}`);
}
