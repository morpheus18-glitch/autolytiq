import { describe, expect, it } from 'vitest';
import {
  amortization,
  aprFromBuySell,
  computeDTI,
  computePTI,
  normalizeTerm,
  type LoanAmortizationInput,
} from '../../src/services/paymentCalculator.service.js';

describe('paymentCalculator.service', () => {
  const amortizationCases: Array<{
    name: string;
    input: LoanAmortizationInput;
    expected: { monthly: number; total: number; interest: number };
  }> = [
    {
      name: 'standard rate 60 month',
      input: { amountFinanced: 25000, apr: 6.5, term: 60 },
      expected: { monthly: 489.15, total: 29349, interest: 4349 },
    },
    {
      name: 'zero rate loan',
      input: { amountFinanced: 18000, apr: 0, term: { years: 3 } },
      expected: { monthly: 500, total: 18000, interest: 0 },
    },
    {
      name: 'high apr extended term with fees',
      input: { amountFinanced: 32000, apr: 12.25, term: '84', fees: 495 },
      expected: { monthly: 577.98, total: 48550.32, interest: 16055.32 },
    },
  ];

  it.each(amortizationCases)('$name amortization', ({ input, expected }) => {
    const result = amortization(input);
    expect(result.monthlyPayment).toBeCloseTo(expected.monthly, 2);
    expect(result.totalPayment).toBeCloseTo(expected.total, 2);
    expect(result.totalInterest).toBeCloseTo(expected.interest, 2);
  });

  it('normalizes varied term formats', () => {
    expect(normalizeTerm(36)).toBe(36);
    expect(normalizeTerm({ years: 5 })).toBe(60);
    expect(normalizeTerm('48 months')).toBe(48);
    expect(normalizeTerm('6y')).toBe(72);
  });

  it('calculates apr markup between buy and sell rates', () => {
    expect(aprFromBuySell(5.5, 7)).toBeCloseTo(1.5, 4);
    expect(aprFromBuySell(7.25, 6.9)).toBe(0);
  });

  it('computes pti and dti ratios with basis point precision', () => {
    expect(computePTI(450, 4500)).toBeCloseTo(0.1, 4);
    expect(computeDTI(1750, 4500)).toBeCloseTo(0.3889, 4);
  });

  it('throws on invalid income inputs for ratios', () => {
    expect(() => computePTI(200, 0)).toThrowError('grossMonthlyIncome must be a positive finite number');
    expect(() => computeDTI(200, -1)).toThrowError('grossMonthlyIncome must be a positive finite number');
  });
});
