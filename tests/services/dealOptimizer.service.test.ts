import { beforeEach, describe, expect, it, vi } from 'vitest';
import { optimizeDeal, analyzeCounter } from '../../src/services/dealOptimizer.service.js';
import type { OptimizationPayload } from '../../src/domain/desking/types.js';

vi.mock('@prisma/client', () => ({
  Prisma: {
    Decimal: class Decimal {
      private readonly value: number;
      constructor(value: number | string) {
        this.value = typeof value === 'string' ? Number.parseFloat(value) : value;
      }

      toNumber() {
        return this.value;
      }
    },
  },
  RetailDealStatus: {
    APPROVED: 'APPROVED',
    FUNDED: 'FUNDED',
    DELIVERED: 'DELIVERED',
  },
}));

vi.mock('../../src/lib/prisma.js', () => {
  const marketComp = { findMany: vi.fn() };
  const deal = { findMany: vi.fn() };
  const lender = { findMany: vi.fn() };
  const dealVersion = { create: vi.fn(), findFirst: vi.fn() };
  const dealWorksheet = { update: vi.fn(), findFirst: vi.fn() };
  const vehicle = { findFirst: vi.fn() };

  return {
    prisma: { marketComp, deal, lender, dealVersion, dealWorksheet, vehicle },
    toInputJson: (value: unknown) => value,
  };
});

vi.mock('../../src/services/ml.service.js', () => ({
  mlService: {
    optimizeDeal: vi.fn(),
    analyzeCounter: vi.fn(),
  },
}));

vi.mock('../../src/services/desking.service.js', () => ({
  recordOptimization: vi.fn(),
  recordCounterOffer: vi.fn(),
}));

const { prisma: prismaMock } = await import('../../src/lib/prisma.js');
const { mlService: mlServiceMock } = await import('../../src/services/ml.service.js');
const { recordOptimization, recordCounterOffer } = await import('../../src/services/desking.service.js');
const deskingMock = { recordOptimization, recordCounterOffer } as {
  recordOptimization: ReturnType<typeof vi.fn>;
  recordCounterOffer: ReturnType<typeof vi.fn>;
};

describe('dealOptimizer.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    prismaMock.marketComp.findMany.mockResolvedValue([]);
    prismaMock.deal.findMany.mockResolvedValue([]);
    prismaMock.lender.findMany.mockResolvedValue([
      {
        id: 'lender-1',
        name: 'Prime Bank',
        isActive: true,
        apiCredentials: {
          rateSheets: [
            {
              effectiveFrom: '2024-01-01',
              tiers: [
                {
                  tier: 'TIER_1',
                  apr: 5.25,
                  reserve: 0.5,
                  maxTerm: 72,
                },
              ],
            },
          ],
        },
        maxReserve: null,
        maxLtv: null,
        maxPti: null,
        maxTerm: 72,
        minCreditScore: 640,
        maxCreditScore: 850,
      },
    ]);
    prismaMock.dealVersion.create.mockResolvedValue({
      id: 'version-1',
      tenantId: 'tenant-1',
      dealId: 'deal-1',
      worksheetId: 'worksheet-1',
      snapshot: {},
      grossBreakdown: {},
      closeProbability: null,
      approvalProbability: null,
      aiScore: null,
      label: 'AI Recommendation',
      createdById: 'user-1',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });
    prismaMock.dealWorksheet.update.mockResolvedValue({ id: 'worksheet-1' });
    prismaMock.dealVersion.findFirst.mockResolvedValue(null);
    prismaMock.dealWorksheet.findFirst.mockResolvedValue(null);
    prismaMock.vehicle.findFirst.mockResolvedValue(null);

    mlServiceMock.optimizeDeal.mockResolvedValue({
      result: {
        worksheetId: 'worksheet-1',
        versionId: undefined,
        recommendedStructure: {
          pricing: { salePrice: 30000, dealerDiscounts: [], accessories: [] },
          trade: { allowance: 1000, payoff: 0 },
          cashDown: { total: 2000 },
          fees: [{ code: 'DOC', label: 'Doc Fee', amount: 299 }],
          taxes: [{ jurisdiction: 'IL', rate: 0.08, amount: 2400 }],
          backendProducts: [],
        },
        projectedGross: undefined,
        insights: ['Use extended term to meet payment goal'],
        warnings: [],
        alternatives: [
          {
            id: 'alt-1',
            label: 'Longer Term',
            structure: {
              pricing: { salePrice: 30000, dealerDiscounts: [], accessories: [] },
              trade: { allowance: 1000, payoff: 0 },
              cashDown: { total: 1500 },
              fees: [{ code: 'DOC', label: 'Doc Fee', amount: 299 }],
              taxes: [{ jurisdiction: 'IL', rate: 0.08, amount: 2400 }],
              backendProducts: [],
            },
            payment: { amountFinanced: 0, apr: 6, termMonths: 72, monthlyPayment: 0 },
            gross: { frontEnd: 0, backEnd: 0, financeReserve: 0, docFee: 299, pack: 0, total: 0 },
          },
        ],
      },
      traceId: 'trace-123',
    });

    mlServiceMock.analyzeCounter.mockResolvedValue({
      result: {
        summary: 'Customer requested lower payment',
        options: [
          {
            id: 'opt-1',
            label: 'Match Payment',
            structure: {
              pricing: { salePrice: 30000, dealerDiscounts: [], accessories: [] },
              trade: { allowance: 1000, payoff: 0 },
              cashDown: { total: 2000 },
              fees: [{ code: 'DOC', label: 'Doc Fee', amount: 299 }],
              taxes: [{ jurisdiction: 'IL', rate: 0.08, amount: 2400 }],
              backendProducts: [],
            },
            payment: { amountFinanced: 0, apr: 6, termMonths: 60, monthlyPayment: 0 },
            gross: { frontEnd: 0, backEnd: 0, financeReserve: 0, docFee: 299, pack: 0, total: 0 },
            probabilityOfClose: 0.62,
          },
        ],
        recommendedOptionId: 'opt-1',
        insights: [],
        warnings: [],
      },
      traceId: 'trace-counter',
    });

    deskingMock.recordOptimization.mockResolvedValue({
      id: 'optimization-1',
      worksheetId: 'worksheet-1',
      versionId: 'version-1',
      goals: {},
      constraints: {},
      recommendedStructure: {},
      alternatives: [],
      insights: [],
      warnings: [],
      projectedGross: 1500,
      mlTraceId: 'trace-123',
      createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    });

    deskingMock.recordCounterOffer.mockResolvedValue({
      id: 'counter-1',
      worksheetId: 'worksheet-1',
      versionId: 'version-1',
      outcome: 'PENDING',
      summary: 'Customer requested lower payment',
      options: [],
      createdAt: new Date('2024-01-01T00:00:00.000Z').toISOString(),
    });
  });

  it('enriches optimization payload and records result', async () => {
    const request = {
      tenantId: 'tenant-1',
      dealId: 'deal-1',
      userId: 'user-1',
      request: {
        dealId: 'deal-1',
        worksheetId: 'worksheet-1',
        structure: {
          pricing: { salePrice: 30000, dealerDiscounts: [], accessories: [] },
          trade: { allowance: 1000, payoff: 0 },
          cashDown: { total: 2000 },
          fees: [{ code: 'DOC', label: 'Doc Fee', amount: 299 }],
          taxes: [{ jurisdiction: 'IL', rate: 0.08, amount: 2400 }],
          backendProducts: [],
        },
        customerProfile: {
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
        currentPayment: { amountFinanced: 25000, apr: 6, termMonths: 60, monthlyPayment: 483, dueAtSigning: 2500 },
        goals: {},
        constraints: {},
      },
    } as const;

    const result = await optimizeDeal(request);

    expect(mlServiceMock.optimizeDeal).toHaveBeenCalled();
    const payload = mlServiceMock.optimizeDeal.mock.calls[0][0] as OptimizationPayload;
    expect(payload.marketData).toBeDefined();
    expect(payload.similarDeals).toBeDefined();
    expect(payload.lenderCriteria).toHaveLength(1);

    expect(deskingMock.recordOptimization).toHaveBeenCalledWith(
      request.tenantId,
      request.dealId,
      request.userId,
      request.request,
      expect.objectContaining({ projectedGross: expect.objectContaining({ total: expect.any(Number) }) }),
      'trace-123',
    );

    expect(result.recommendation.projectedGross?.total).toBeGreaterThan(0);
    expect(result.version?.id).toBe('version-1');
  });

  it('analyzes counter offers and returns enriched options', async () => {
    prismaMock.dealVersion.findFirst.mockResolvedValue({
      id: 'version-1',
      tenantId: 'tenant-1',
      dealId: 'deal-1',
      worksheetId: 'worksheet-1',
      snapshot: {
        structure: {
          pricing: { salePrice: 30000, dealerDiscounts: [], accessories: [] },
          trade: { allowance: 1000, payoff: 0 },
          cashDown: { total: 2000 },
          fees: [{ code: 'DOC', label: 'Doc Fee', amount: 299 }],
          taxes: [{ jurisdiction: 'IL', rate: 0.08, amount: 2400 }],
          backendProducts: [],
        },
        payment: { amountFinanced: 25000, apr: 6, termMonths: 60, monthlyPayment: 483, dueAtSigning: 2500 },
      },
      grossBreakdown: null,
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date('2024-01-01T00:00:00.000Z'),
    });

    prismaMock.dealWorksheet.findFirst.mockResolvedValue({
      id: 'worksheet-1',
      vehicleId: 'vehicle-1',
      vehicle: { vin: 'VIN123', year: 2023, make: 'Toyota', model: 'Camry', trim: 'XLE' },
    });

    const response = await analyzeCounter({
      tenantId: 'tenant-1',
      dealId: 'deal-1',
      userId: 'user-1',
      request: {
        dealId: 'deal-1',
        worksheetId: 'worksheet-1',
        versionId: 'version-1',
        customerInput: { customerConcern: 'Lower payment' },
      },
    });

    expect(mlServiceMock.analyzeCounter).toHaveBeenCalled();
    expect(deskingMock.recordCounterOffer).toHaveBeenCalled();
    expect(response.analysis.options[0].payment.monthlyPayment).toBeGreaterThan(0);
  });
});
