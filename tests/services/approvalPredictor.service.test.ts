import { beforeEach, describe, expect, it, vi } from 'vitest';
import { optimizeForApproval, predictApprovals } from '../../src/services/approvalPredictor.service.js';

vi.mock('../../src/lib/prisma.js', () => {
  const lender = { findMany: vi.fn() };
  return {
    prisma: { lender },
  };
});

vi.mock('../../src/services/ml.service.js', () => ({
  mlService: {
    predictApproval: vi.fn(),
  },
}));

vi.mock('../../src/services/desking.service.js', () => ({
  recordApproval: vi.fn(),
}));

const { prisma: prismaMock } = await import('../../src/lib/prisma.js');
const { mlService: mlServiceMock } = await import('../../src/services/ml.service.js');
const { recordApproval } = await import('../../src/services/desking.service.js');
const deskingMock = { recordApproval } as { recordApproval: ReturnType<typeof vi.fn> };

describe('approvalPredictor.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.lender.findMany.mockResolvedValue([
      { id: 'lender-1', name: 'Prime Bank', maxTerm: 72 },
      { id: 'lender-2', name: 'Community CU', maxTerm: 84 },
    ]);

    deskingMock.recordApproval.mockResolvedValue({
      id: 'approval-1',
      lenderId: 'lender-1',
      lenderName: 'Prime Bank',
      approvalProbability: 0.65,
      recommendedTier: 'TIER_1',
      estimatedRate: 5.2,
      estimatedReserve: 300,
      strengths: [],
      weaknesses: [],
      stipulations: [],
      recommendation: 'STRONG',
      versionId: null,
      worksheetId: null,
      createdAt: new Date().toISOString(),
    });
  });

  const baseParams = {
    tenantId: 'tenant-1',
    dealId: 'deal-1',
    structure: {
      pricing: { salePrice: 30000, dealerDiscounts: [], accessories: [] },
      trade: { allowance: 1000, payoff: 0 },
      cashDown: { total: 2000 },
      fees: [{ code: 'DOC', label: 'Doc Fee', amount: 299 }],
      taxes: [{ jurisdiction: 'IL', rate: 0.08, amount: 2400 }],
      backendProducts: [],
    },
    customer: {
      firstName: 'Jamie',
      lastName: 'Rivera',
      creditScore: 720,
      creditTier: 'TIER_1',
      residenceType: 'OWN',
    },
    vehicle: {
      vin: 'VIN123',
      year: 2023,
      make: 'Toyota',
      model: 'Camry',
    },
    payment: { amountFinanced: 25000, apr: 6, termMonths: 60, monthlyPayment: 483, dueAtSigning: 2500 },
  } as const;

  it('predicts approvals for active lenders and persists results', async () => {
    mlServiceMock.predictApproval
      .mockResolvedValueOnce({
        result: {
          dealId: 'deal-1',
          lenderId: 'lender-1',
          lenderName: 'Prime Bank',
          approvalProbability: 0.6,
          recommendedTier: 'TIER_1',
          strengths: [],
          weaknesses: [],
          stipulations: [],
          recommendation: 'STRONG',
        },
        traceId: 'trace-1',
      })
      .mockResolvedValueOnce({
        result: {
          dealId: 'deal-1',
          lenderId: 'lender-2',
          lenderName: 'Community CU',
          approvalProbability: 0.55,
          recommendedTier: 'TIER_2',
          strengths: [],
          weaknesses: [],
          stipulations: [],
          recommendation: 'MODERATE',
        },
        traceId: 'trace-2',
      });

    const { approvals, traces } = await predictApprovals({ ...baseParams });

    expect(approvals).toHaveLength(2);
    expect(deskingMock.recordApproval).toHaveBeenCalledTimes(2);
    expect(traces).toEqual({ 'lender-1': 'trace-1', 'lender-2': 'trace-2' });
  });

  it('evaluates strategies to improve approval odds', async () => {
    mlServiceMock.predictApproval
      .mockResolvedValueOnce({
        result: {
          dealId: 'deal-1',
          lenderId: 'lender-1',
          lenderName: 'Prime Bank',
          approvalProbability: 0.5,
          recommendedTier: 'TIER_1',
          strengths: [],
          weaknesses: [],
          stipulations: [],
          recommendation: 'MODERATE',
        },
        traceId: 'baseline-1',
      })
      .mockResolvedValueOnce({
        result: {
          dealId: 'deal-1',
          lenderId: 'lender-2',
          lenderName: 'Community CU',
          approvalProbability: 0.52,
          recommendedTier: 'TIER_2',
          strengths: [],
          weaknesses: [],
          stipulations: [],
          recommendation: 'MODERATE',
        },
        traceId: 'baseline-2',
      })
      .mockResolvedValueOnce({
        result: {
          dealId: 'deal-1',
          lenderId: 'lender-1',
          lenderName: 'Prime Bank',
          approvalProbability: 0.62,
          recommendedTier: 'TIER_1',
          strengths: [],
          weaknesses: [],
          stipulations: [],
          recommendation: 'STRONG',
        },
        traceId: 'candidate-1',
      })
      .mockResolvedValueOnce({
        result: {
          dealId: 'deal-1',
          lenderId: 'lender-2',
          lenderName: 'Community CU',
          approvalProbability: 0.6,
          recommendedTier: 'TIER_1',
          strengths: [],
          weaknesses: [],
          stipulations: [],
          recommendation: 'STRONG',
        },
        traceId: 'candidate-2',
      })
      .mockResolvedValue({
        result: {
          dealId: 'deal-1',
          lenderId: 'lender-1',
          lenderName: 'Prime Bank',
          approvalProbability: 0.57,
          recommendedTier: 'TIER_1',
          strengths: [],
          weaknesses: [],
          stipulations: [],
          recommendation: 'MODERATE',
        },
        traceId: 'candidate-3',
      });

    const candidate = await optimizeForApproval({ ...baseParams });

    expect(candidate).not.toBeNull();
    expect(candidate?.improvement).toBeGreaterThan(0);
    expect(candidate?.approvals).toHaveLength(2);
  });
});

