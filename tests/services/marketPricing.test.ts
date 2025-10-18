import { describe, expect, it } from 'vitest';
import {
  agingAdjustments,
  competitiveRange,
  getMarketData,
  markdownSuggestions,
  type ComparableSale,
  type VehicleDescriptor,
} from '../../src/services/marketPricing.service.js';

describe('marketPricing.service', () => {
  const vehicle: VehicleDescriptor = {
    make: 'Toyota',
    model: 'Camry',
    year: 2022,
    segment: 'Sedan',
  };

  const baseDate = new Date('2024-04-01T00:00:00Z');

  const comparables: ComparableSale[] = [
    {
      vehicle: { make: 'Toyota', model: 'Camry', year: 2023, segment: 'Sedan' },
      salePrice: 27900,
      saleDate: '2024-03-28',
    },
    {
      vehicle: { make: 'Toyota', model: 'Camry', year: 2022, segment: 'Sedan' },
      salePrice: 27450,
      saleDate: '2024-03-18',
    },
    {
      vehicle: { make: 'Toyota', model: 'Camry', year: 2021, segment: 'Sedan' },
      salePrice: 26800,
      saleDate: '2024-03-05',
    },
    {
      vehicle: { make: 'Toyota', model: 'Camry', year: 2019, segment: 'Sedan' },
      salePrice: 21900,
      saleDate: '2024-02-15',
    },
    {
      vehicle: { make: 'Toyota', model: 'Corolla', year: 2022, segment: 'Sedan' },
      salePrice: 22900,
      saleDate: '2024-03-21',
    },
  ];

  it('aggregates market data for comparable vehicles within the window', () => {
    const summary = getMarketData(vehicle, comparables, { asOfDate: baseDate });
    expect(summary.sampleSize).toBe(3);
    expect(summary.medianPrice).toBeCloseTo(27450, 2);
    expect(summary.averagePrice).toBeCloseTo(27383.33, 2);
    expect(summary.minPrice).toBe(26800);
    expect(summary.maxPrice).toBe(27900);
  });

  it('provides competitive range and markdown suggestions', () => {
    const summary = getMarketData(vehicle, comparables, { asOfDate: baseDate });
    const range = competitiveRange(summary);
    expect(range.floor).toBeLessThanOrEqual(range.ceiling);
    expect(range.target).toBe(summary.medianPrice);

    const recommendations = markdownSuggestions(28995, summary, 65);
    expect(recommendations.suggestedPrice).toBeLessThan(28995);
    expect(recommendations.markdownAmount).toBeGreaterThan(0);
    expect(recommendations.agingAdjustment.adjustedPrice).toBeLessThanOrEqual(range.ceiling);
  });

  it('handles empty market data gracefully', () => {
    const emptySummary = getMarketData(vehicle, [], { asOfDate: baseDate });
    expect(emptySummary.sampleSize).toBe(0);

    const range = competitiveRange(emptySummary);
    expect(range).toEqual({ floor: 0, target: 0, ceiling: 0 });

    const markdown = markdownSuggestions(25995, emptySummary, 100);
    expect(markdown.suggestedPrice).toBeLessThanOrEqual(25995);
    expect(markdown.agingAdjustment.adjustmentAmount).toBeLessThanOrEqual(0);
  });

  it('calculates aging adjustments with custom bands', () => {
    const adjustment = agingAdjustments(75, 28000, {
      agingBands: [
        { maxDays: 30, adjustmentPercent: 0 },
        { maxDays: 60, adjustmentPercent: -0.02 },
        { maxDays: 90, adjustmentPercent: -0.04 },
      ],
    });

    expect(adjustment.adjustedPrice).toBeCloseTo(26880, 2);
    expect(adjustment.adjustmentPercent).toBeCloseTo(-0.04, 4);
  });
});
