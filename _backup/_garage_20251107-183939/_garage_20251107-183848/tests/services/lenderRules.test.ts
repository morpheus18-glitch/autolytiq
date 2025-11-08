import { describe, expect, it } from 'vitest';
import {
  computeTier,
  getActiveLenders,
  isStructureEligible,
  listViolations,
  maxPTI,
  maxReserve,
  type ActiveLender,
  type CustomerProfile,
  type DealStructure,
  type LenderProfile,
} from '../../src/services/lenderRules.service.js';

describe('lenderRules.service', () => {
  const lenders: LenderProfile[] = [
    {
      id: 'lender-1',
      tenantId: 'tenant-1',
      name: 'Prime Auto Bank',
      status: 'active',
      maxReserve: 2500,
      maxLtv: 1.2,
      maxPti: 0.18,
      maxTermMonths: 75,
      rateSheets: [
        {
          id: 'tier-a',
          tier: 'A',
          minScore: 720,
          maxScore: 850,
          buyRate: 4.5,
          sellRate: 6.0,
          maxTermMonths: 72,
          maxLtv: 1.1,
          maxPti: 0.17,
          maxReserve: 2000,
          effectiveFrom: '2024-01-01',
        },
        {
          id: 'tier-b',
          tier: 'B',
          minScore: 640,
          maxScore: 719,
          buyRate: 6.9,
          sellRate: 9.5,
          maxTermMonths: 75,
          maxLtv: 1.2,
          maxPti: 0.2,
          maxReserve: 2500,
          effectiveFrom: '2024-01-01',
        },
      ],
    },
    {
      id: 'lender-2',
      tenantId: 'tenant-2',
      name: 'Closed Credit Union',
      status: 'inactive',
      rateSheets: [
        {
          id: 'tier-c',
          tier: 'C',
          minScore: 580,
          buyRate: 9.9,
          sellRate: 12.5,
          effectiveFrom: '2024-01-01',
        },
      ],
    },
  ];

  const customer: CustomerProfile = {
    creditScore: 705,
    monthlyIncome: 4200,
  };

  const activeLenders = getActiveLenders('tenant-1', lenders, new Date('2024-03-01'));
  const primeLender = activeLenders[0] as ActiveLender;

  it('filters active lenders with valid rate sheets', () => {
    expect(activeLenders).toHaveLength(1);
    expect(primeLender.activeRateSheets).toHaveLength(2);
  });

  it('selects the correct tier based on credit profile', () => {
    const tier = computeTier(customer, primeLender);
    expect(tier?.tier).toBe('B');
    expect(maxReserve(
      { amountFinanced: 22000, advanceValue: 20000, monthlyPayment: 0, termMonths: 60 },
      primeLender,
      tier
    )).toBeCloseTo(2200, 2);
    expect(maxPTI(primeLender, tier)).toBeCloseTo(0.18, 4);
  });

  it('identifies structure violations against lender guidelines', () => {
    const deal: DealStructure = {
      amountFinanced: 26000,
      advanceValue: 20000,
      monthlyPayment: 780,
      termMonths: 84,
      reserveAmount: 3500,
    };

    const violations = listViolations({ customer, deal }, primeLender);
    expect(violations).toHaveLength(4);
    expect(violations.map((v) => v.code).sort()).toEqual(['LTV', 'PTI', 'RESERVE', 'TERM']);
  });

  it('validates eligible structures', () => {
    const deal: DealStructure = {
      amountFinanced: 21000,
      advanceValue: 20000,
      monthlyPayment: 525,
      termMonths: 72,
      reserveAmount: 1500,
    };

    const eligible = isStructureEligible({ customer, deal }, primeLender);
    expect(eligible).toBe(true);
  });

  it('flags customers that do not match any tier', () => {
    const prospect: CustomerProfile = { creditScore: 500, monthlyIncome: 4000 };
    const violations = listViolations(
      {
        customer: prospect,
        deal: { amountFinanced: 18000, advanceValue: 16000, monthlyPayment: 400, termMonths: 60 },
      },
      primeLender
    );

    expect(violations).toEqual([
      { code: 'TIER', message: 'Customer does not qualify for any active tier' },
    ]);
  });
});
