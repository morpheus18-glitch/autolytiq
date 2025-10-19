export interface DealParty {
  name: string;
  email: string;
  phone: string;
  creditScore: number;
}

export interface DealVehicle {
  vin: string;
  year: number;
  make: string;
  model: string;
  trim: string;
  stockNumber: string;
  msrp: number;
  salePrice: number;
  mileage: number;
  exteriorColor: string;
  interiorColor: string;
}

export interface DealFeeSummary {
  docFee: number;
  acquisitionFee: number;
  licenseFee: number;
  registration: number;
  taxes: number;
}

export interface DealGrossMetrics {
  frontGross: number;
  backGross: number;
  fAndIGross: number;
  totalGross: number;
  targetGross: number;
}

export interface PaymentScenario {
  id: string;
  label: string;
  monthlyPayment: number;
  apr: number;
  termMonths: number;
  totalDueAtSigning: number;
  totalOfPayments: number;
  cashDown: number;
  residual?: number;
  lender?: string;
  isCustomerCounter?: boolean;
  badges?: string[];
  notes?: string[];
  version: string;
}

export interface DealVersion {
  id: string;
  createdAt: string;
  createdBy: string;
  scenarioId: string;
  summary: string;
}

export interface DealTimelineEvent {
  id: string;
  label: string;
  timestamp: string;
  by: string;
  status: 'completed' | 'pending' | 'upcoming';
}

export interface DeskingDeal {
  id: string;
  dealership: string;
  deskManager: string;
  createdAt: string;
  status: 'structuring' | 'submitted' | 'delivered';
  customer: DealParty;
  vehicle: DealVehicle;
  fees: DealFeeSummary;
  gross: DealGrossMetrics;
  timeline: DealTimelineEvent[];
  scenarios: PaymentScenario[];
  versions: DealVersion[];
  activeScenarioId: string;
}

export interface ApprovalProbability {
  lender: string;
  probability: number;
  avgFundingTimeDays: number;
  programs: string[];
  highlights: string[];
}

export interface ApprovalPredictions {
  overallProbability: number;
  likelyFundingWindowHours: number;
  riskSignals: string[];
  approvals: ApprovalProbability[];
}

export interface SimilarDealSummary {
  id: string;
  customer: string;
  vehicle: string;
  structure: string;
  payment: number;
  closeProbability: number;
  highlights: string[];
}

export interface DealOptimizationInput {
  action: 'initial' | 'customer-counter' | 'run-deal';
  context?: Record<string, unknown>;
}

export interface DealOptimizationResult {
  scenario: PaymentScenario;
  narrative: string;
}
