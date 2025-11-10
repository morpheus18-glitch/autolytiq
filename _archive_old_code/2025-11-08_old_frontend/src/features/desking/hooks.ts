import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addDays, formatISO } from 'date-fns';
import { apiRequest } from '@/lib/queryClient';
import type {
  ApprovalPredictions,
  DealOptimizationInput,
  DealOptimizationResult,
  DeskingDeal,
  PaymentScenario,
  SimilarDealSummary,
} from './types';

const mockDeal: DeskingDeal = {
  id: 'demo-deal-001',
  dealership: 'Autolytiq Cadillac of Austin',
  deskManager: 'Jordan Blake',
  createdAt: formatISO(addDays(new Date(), -1)),
  status: 'structuring',
  customer: {
    name: 'Cameron Lee',
    email: 'cameron.lee@email.com',
    phone: '(512) 555-1183',
    creditScore: 712,
  },
  vehicle: {
    vin: '1GYS4JEF6KR276512',
    year: 2023,
    make: 'Cadillac',
    model: 'Escalade Sport Platinum',
    trim: '4WD V8',
    stockNumber: 'A3275',
    msrp: 107990,
    salePrice: 102450,
    mileage: 8200,
    exteriorColor: 'Black Raven',
    interiorColor: 'Jet Black',
  },
  fees: {
    docFee: 399,
    acquisitionFee: 895,
    licenseFee: 180,
    registration: 210,
    taxes: 6123,
  },
  gross: {
    frontGross: 2175,
    backGross: 1465,
    fAndIGross: 920,
    totalGross: 2175 + 1465 + 920,
    targetGross: 5200,
  },
  timeline: [
    {
      id: 'timeline-1',
      label: 'Lead created',
      timestamp: formatISO(addDays(new Date(), -5)),
      by: 'Digital Retailing',
      status: 'completed',
    },
    {
      id: 'timeline-2',
      label: 'Showroom appointment',
      timestamp: formatISO(addDays(new Date(), -2)),
      by: 'BDC',
      status: 'completed',
    },
    {
      id: 'timeline-3',
      label: 'Test drive & needs analysis',
      timestamp: formatISO(addDays(new Date(), -1)),
      by: 'Alex Morgan',
      status: 'completed',
    },
    {
      id: 'timeline-4',
      label: 'Structuring desk review',
      timestamp: formatISO(new Date()),
      by: 'Jordan Blake',
      status: 'pending',
    },
    {
      id: 'timeline-5',
      label: 'Lender submission',
      timestamp: formatISO(addDays(new Date(), 1)),
      by: 'F&I',
      status: 'upcoming',
    },
  ],
  scenarios: [
    {
      id: 'scenario-balanced',
      label: 'Smart Retail 72 @ 6.49%',
      monthlyPayment: 612.43,
      apr: 6.49,
      termMonths: 72,
      totalDueAtSigning: 2500,
      totalOfPayments: 612.43 * 72,
      cashDown: 2000,
      lender: 'Ally Financial',
      badges: ['Recommended', 'Balanced Gross'],
      notes: [
        'Keeps front gross above $2,000 with menu bundle.',
        'Aligns with customer budget target of $620/mo.',
      ],
      version: 'v1',
    },
    {
      id: 'scenario-customer-counter',
      label: 'Customer Counter 75 @ 5.99%',
      monthlyPayment: 585.17,
      apr: 5.99,
      termMonths: 75,
      totalDueAtSigning: 2000,
      totalOfPayments: 585.17 * 75,
      cashDown: 1500,
      lender: 'GM Financial',
      isCustomerCounter: true,
      badges: ['Customer Counter', 'Keeps ACV'],
      notes: [
        'Extends term to preserve payment expectation.',
        'Still qualifies for Tier A program with 712 FICO.',
      ],
      version: 'v2',
    },
    {
      id: 'scenario-lease',
      label: 'Lease 36/12k @ 4.29%',
      monthlyPayment: 978.61,
      apr: 4.29,
      termMonths: 36,
      totalDueAtSigning: 3995,
      totalOfPayments: 978.61 * 36,
      cashDown: 3500,
      residual: 61400,
      lender: 'GM Financial',
      badges: ['Alternative Structure', 'High Equity Retention'],
      notes: ['Best match if customer prioritizes payment-to-mileage ratio.'],
      version: 'v3',
    },
  ],
  versions: [
    {
      id: 'v1',
      createdAt: formatISO(addDays(new Date(), -1)),
      createdBy: 'Jordan Blake',
      scenarioId: 'scenario-balanced',
      summary: 'Initial pencil built around Ally Smart Retail 72 @ 6.49%.',
    },
    {
      id: 'v2',
      createdAt: formatISO(addDays(new Date(), -1)),
      createdBy: 'Alex Morgan',
      scenarioId: 'scenario-customer-counter',
      summary: 'Customer asked for payment under $600; extended term to 75 months.',
    },
    {
      id: 'v3',
      createdAt: formatISO(addDays(new Date(), -1)),
      createdBy: 'Jordan Blake',
      scenarioId: 'scenario-lease',
      summary: 'Lease backup with higher payment but stronger retention.',
    },
  ],
  activeScenarioId: 'scenario-balanced',
};

const mockPredictions: ApprovalPredictions = {
  overallProbability: 0.78,
  likelyFundingWindowHours: 28,
  riskSignals: ['DTI at 41% with requested accessories', 'Premium SUV segment trending slower approvals last 7 days'],
  approvals: [
    {
      lender: 'Ally Financial',
      probability: 0.82,
      avgFundingTimeDays: 1.2,
      programs: ['Smart Retail 72', 'Rate Lock 30-day'],
      highlights: ['Prefers LTV below 115% (current 108%)', 'Pushes for service contract to secure tier bump'],
    },
    {
      lender: 'GM Financial',
      probability: 0.76,
      avgFundingTimeDays: 1.6,
      programs: ['Premier Retail', 'Lease Loyalty'],
      highlights: ['High appetite for Escalade inventory', 'Requires proof of residence update'],
    },
    {
      lender: 'Wells Fargo Dealer Services',
      probability: 0.63,
      avgFundingTimeDays: 2.1,
      programs: ['Platinum 72', 'Loyalty Cash'],
      highlights: ['Prefers payment-to-income under 15% (currently 13.8%)'],
    },
  ],
};

const mockSimilarDeals: SimilarDealSummary[] = [
  {
    id: 'deal-9021',
    customer: 'R. Bennett',
    vehicle: '2023 Escalade Sport Platinum',
    structure: '72 @ 6.69% | $2,000 down',
    payment: 624.11,
    closeProbability: 0.81,
    highlights: ['Closed in 2.3 days', 'Used Ally Smart Retail program'],
  },
  {
    id: 'deal-8984',
    customer: 'L. Ortega',
    vehicle: '2022 Escalade Premium Luxury',
    structure: '75 @ 6.24% | $1,750 down',
    payment: 598.45,
    closeProbability: 0.73,
    highlights: ['Customer counter accepted after price protection'],
  },
  {
    id: 'deal-9150',
    customer: 'S. Carter',
    vehicle: '2023 Escalade Sport',
    structure: '36/12 lease @ 4.49%',
    payment: 955.38,
    closeProbability: 0.68,
    highlights: ['Lease alternative secured positive equity trade cycle'],
  },
];

async function safeJsonRequest<T>(url: string, options?: { method?: string; body?: unknown }) {
  try {
    const response = await apiRequest(url, {
      method: options?.method ?? 'GET',
      body: options?.body,
    });
    const data = (await response.json()) as T;
    return data;
  } catch (error) {
    console.warn('[desking] Falling back to mock data for', url, error);
    return null;
  }
}

async function fetchDeal(dealId: string) {
  const liveDeal = await safeJsonRequest<DeskingDeal>(`/api/desking/deals/${dealId}`);
  if (liveDeal) {
    return liveDeal;
  }
  return mockDeal;
}

async function requestOptimization(
  dealId: string,
  input: DealOptimizationInput,
): Promise<DealOptimizationResult> {
  const response = await safeJsonRequest<DealOptimizationResult>('/api/desking/optimize', {
    method: 'POST',
    body: { dealId, ...input },
  });
  if (response) {
    return response;
  }

  const baseScenario = mockDeal.scenarios.find(s => s.id === mockDeal.activeScenarioId) ?? mockDeal.scenarios[0];
  const paymentAdjustments: Record<DealOptimizationInput['action'], number> = {
    initial: 0,
    'customer-counter': -22,
    'run-deal': 18,
  };
  const aprAdjustments: Record<DealOptimizationInput['action'], number> = {
    initial: -0.15,
    'customer-counter': -0.35,
    'run-deal': 0.4,
  };

  const action = input.action;
  const nextMonthly = Math.max(485, baseScenario.monthlyPayment + paymentAdjustments[action]);
  const nextTerm = action === 'run-deal' ? 66 : action === 'customer-counter' ? 75 : baseScenario.termMonths;
  const updatedScenario: PaymentScenario = {
    ...baseScenario,
    id: `scenario-${action}-${Date.now()}`,
    label:
      action === 'customer-counter'
        ? 'Customer Counter Optimized 75 @ 5.64%'
        : action === 'run-deal'
          ? 'Performance Push 66 @ 6.89%'
          : 'Initial Pencil 72 @ 6.34%',
    monthlyPayment: nextMonthly,
    apr: Math.max(3.5, baseScenario.apr + aprAdjustments[action]),
    termMonths: nextTerm,
    totalOfPayments: nextMonthly * nextTerm,
    totalDueAtSigning:
      action === 'customer-counter' ? baseScenario.totalDueAtSigning - 300 : baseScenario.totalDueAtSigning + 250,
    cashDown: action === 'customer-counter' ? baseScenario.cashDown - 500 : baseScenario.cashDown + 250,
    lender: action === 'run-deal' ? 'Wells Fargo Dealer Services' : baseScenario.lender,
    isCustomerCounter: action === 'customer-counter',
    badges:
      action === 'run-deal'
        ? ['Max Gross Focus', 'Requires Manager Approval']
        : action === 'customer-counter'
          ? ['Customer Counter', 'Maintains Program Tier']
          : ['Recommended', 'AI Generated'],
    notes:
      action === 'run-deal'
        ? [
            'Targets $400 increase in total gross.',
            'Confirms accessory bundle retention.',
          ]
        : action === 'customer-counter'
          ? [
              'Reduces drive-off by $300; maintain menu value by moving VSC to rate.',
              'Term stretch approved by lender guidelines.',
            ]
          : [
              'Aligns with payment-to-income goal under 14%.',
              'Incorporates AI-selected service contract for tier bump.',
            ],
    version: 'pending',
  };

  return {
    scenario: updatedScenario,
    narrative:
      action === 'run-deal'
        ? 'AI recommends a performance push version to maximize gross while staying within lender appetite.'
        : action === 'customer-counter'
          ? 'Customer counter absorbed with targeted concessions and lender-aligned structure.'
          : 'Initial pencil aligned with customer expectations and gross objectives.',
  };
}

async function fetchPredictions(dealId: string) {
  const data = await safeJsonRequest<ApprovalPredictions>(`/api/desking/deals/${dealId}/approval-predictions`);
  return data ?? mockPredictions;
}

async function fetchSimilarDeals(dealId: string) {
  const data = await safeJsonRequest<SimilarDealSummary[]>(`/api/desking/deals/${dealId}/similar`);
  return data ?? mockSimilarDeals;
}

export function useDeal(dealId: string) {
  return useQuery({
    queryKey: ['desking', 'deal', dealId],
    queryFn: () => fetchDeal(dealId),
  });
}

export function useOptimizeDeal(dealId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DealOptimizationInput) => requestOptimization(dealId, input),
    onSuccess: result => {
      queryClient.setQueryData<DeskingDeal | undefined>(['desking', 'deal', dealId], current => {
        if (!current) {
          return current;
        }
        const timestamp = formatISO(new Date());
        const newVersionId = `v${current.versions.length + 1}`;
        return {
          ...current,
          scenarios: [
            { ...result.scenario, version: newVersionId },
            ...current.scenarios,
          ],
          versions: [
            {
              id: newVersionId,
              createdAt: timestamp,
              createdBy: 'AI Deal Optimizer',
              scenarioId: result.scenario.id,
              summary: result.narrative,
            },
            ...current.versions,
          ],
          activeScenarioId: result.scenario.id,
        };
      });
    },
  });
}

export function useApprovalPredictions(dealId: string) {
  return useQuery({
    queryKey: ['desking', 'deal', dealId, 'approval-predictions'],
    queryFn: () => fetchPredictions(dealId),
  });
}

export function useSimilarDeals(dealId: string) {
  return useQuery({
    queryKey: ['desking', 'deal', dealId, 'similar-deals'],
    queryFn: () => fetchSimilarDeals(dealId),
  });
}
