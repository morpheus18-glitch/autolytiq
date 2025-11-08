import { describe, expect, it } from 'vitest';
import { findSimilarDeals, type DealSnapshot } from '../../src/services/similarDeals.service.js';
import type { VehicleDescriptor } from '../../src/services/marketPricing.service.js';

describe('similarDeals.service', () => {
  const subject: VehicleDescriptor = { make: 'Honda', model: 'Civic', year: 2023 };
  const asOf = new Date('2024-05-01T00:00:00Z');

  const deals: DealSnapshot[] = [
    {
      id: '1',
      status: 'closed',
      closeDate: '2024-04-20',
      vehicle: { make: 'Honda', model: 'Civic', year: 2023 },
      frontGross: 1800,
      financeReserve: 450,
      totalGross: 2400,
    },
    {
      id: '2',
      status: 'closed',
      closeDate: '2024-03-12',
      vehicle: { make: 'Honda', model: 'Civic', year: 2022 },
      frontGross: 1600,
      financeReserve: 375,
    },
    {
      id: '3',
      status: 'closed',
      closeDate: '2024-02-15',
      vehicle: { make: 'Honda', model: 'Civic', year: 2021 },
      frontGross: 1400,
      financeReserve: 325,
      totalGross: 1750,
    },
    {
      id: '4',
      status: 'lost',
      closeDate: '2024-03-22',
      vehicle: { make: 'Honda', model: 'Civic', year: 2022 },
      frontGross: 0,
      financeReserve: 0,
    },
    {
      id: '5',
      status: 'lost',
      closeDate: '2023-12-10',
      vehicle: { make: 'Honda', model: 'Civic', year: 2023 },
      frontGross: 0,
      financeReserve: 0,
    },
    {
      id: '6',
      status: 'closed',
      closeDate: '2024-04-05',
      vehicle: { make: 'Honda', model: 'Accord', year: 2023 },
      frontGross: 1700,
      financeReserve: 400,
    },
  ];

  it('summarizes similar deals and KPI metrics', () => {
    const result = findSimilarDeals(subject, deals, {}, asOf);
    expect(result.deals).toHaveLength(3);
    expect(result.metrics.sampleSize).toBe(3);
    expect(result.metrics.averageFrontGross).toBeCloseTo(1600, 2);
    expect(result.metrics.averageReserve).toBeCloseTo(383.33, 2);
    expect(result.metrics.averageTotalGross).toBeCloseTo(2041.67, 2);
    expect(result.metrics.closeRate).toBeCloseTo(0.75, 4);
  });
});
