import { describe, expect, it } from 'vitest';
import {
  calculateFinanceReserve,
  calculateGross,
  type DealGrossInput,
} from '../../src/services/grossCalculator.service.js';

describe('grossCalculator.service', () => {
  it('computes blended gross metrics with backend products and reserves', () => {
    const input: DealGrossInput = {
      sellingPrice: 35000,
      vehicleCost: 28000,
      pack: 500,
      overAllow: 1000,
      tradeReserve: 400,
      amountFinanced: 32000,
      rateMarkup: 2.5,
      termMonths: 60,
      participation: 0.7,
      backendProducts: [
        { id: 'warr', name: 'Warranty', price: 1800, cost: 900 },
        { id: 'gap', name: 'GAP', price: 950, cost: 250 },
        { id: 'etch', name: 'Resistall', price: 400, cost: 50, participation: 0.5 },
      ],
    };

    const breakdown = calculateGross(input);
    expect(breakdown.frontGross).toBeCloseTo(5900, 2);
    expect(breakdown.financeReserve).toBe(2800);
    expect(breakdown.backendGross).toBeCloseTo(1775, 2);
    expect(breakdown.totalGross).toBeCloseTo(10475, 2);
    expect(breakdown.totalRevenue).toBeCloseTo(41150, 2);
    expect(breakdown.totalCost).toBeCloseTo(30675, 2);

    expect(breakdown.backendProducts).toHaveLength(3);
    expect(breakdown.backendProducts[2]).toMatchObject({
      id: 'etch',
      gross: 175,
      revenue: 200,
      cost: 25,
    });
  });

  it('defaults optional inputs and guards invalid numbers', () => {
    const minimal: DealGrossInput = {
      sellingPrice: 25000,
      vehicleCost: 21000,
    };

    const breakdown = calculateGross(minimal);
    expect(breakdown.frontGross).toBeCloseTo(4000, 2);
    expect(breakdown.financeReserve).toBe(0);
    expect(breakdown.backendGross).toBe(0);
    expect(breakdown.totalGross).toBeCloseTo(4000, 2);

    expect(() => calculateFinanceReserve(-1, 1.5, 60, 1)).toThrowError('amountFinanced');
    expect(() => calculateFinanceReserve(20000, 1.5, -12, 1)).not.toThrow();
  });

  it('caps finance participation between 0 and 1', () => {
    const reserve = calculateFinanceReserve(15000, 3, 48, 1.5);
    // participation > 1 should be treated as 1
    expect(reserve).toBeCloseTo(1800, 2);
  });
});
