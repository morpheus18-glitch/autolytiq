/**
 * useDealCalculation Hook
 *
 * Manages real-time payment calculations via Rust pricing service
 * Includes debouncing, caching, and error handling
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { calculatePayment } from '@/lib/pricingService';
import type { DealStructure, PaymentCalculation } from '@/contexts/DealStudioContext';

interface UseDealCalculationOptions {
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  /** Whether to auto-calculate on deal changes */
  autoCalculate?: boolean;
  /** Enable caching of results */
  enableCache?: boolean;
}

interface UseDealCalculationReturn {
  /** Current payment calculation result */
  payment: PaymentCalculation | null;
  /** Whether calculation is in progress */
  isCalculating: boolean;
  /** Error message if calculation failed */
  error: string | null;
  /** Manually trigger calculation */
  calculate: (deal: DealStructure) => Promise<void>;
  /** Clear cached results */
  clearCache: () => void;
  /** Response time of last calculation (ms) */
  lastCalculationTime: number | null;
}

/**
 * Hook for managing deal payment calculations with Rust service
 */
export function useDealCalculation(
  deal: DealStructure,
  options: UseDealCalculationOptions = {}
): UseDealCalculationReturn {
  const {
    debounceMs = 50,
    autoCalculate = true,
    enableCache = true,
  } = options;

  const [payment, setPayment] = useState<PaymentCalculation | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastCalculationTime, setLastCalculationTime] = useState<number | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, PaymentCalculation>>(new Map());
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Generate cache key from deal structure
   */
  const getCacheKey = useCallback((dealData: DealStructure): string => {
    const netTrade = dealData.tradeValue - dealData.tradePayoff;
    const totalAddOns =
      dealData.warranty +
      dealData.gap +
      dealData.maintenance +
      dealData.paintProtection;

    return `${dealData.salePrice}|${dealData.downPayment}|${netTrade}|${dealData.term}|${dealData.apr}|${totalAddOns}`;
  }, []);

  /**
   * Perform calculation
   */
  const calculate = useCallback(async (dealData: DealStructure) => {
    // Check cache first
    const cacheKey = getCacheKey(dealData);
    if (enableCache && cacheRef.current.has(cacheKey)) {
      setPayment(cacheRef.current.get(cacheKey)!);
      setIsCalculating(false);
      return;
    }

    // Abort any in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setIsCalculating(true);
    setError(null);

    const startTime = performance.now();

    try {
      // Calculate net trade and total add-ons
      const netTrade = dealData.tradeValue - dealData.tradePayoff;
      const totalAddOns =
        dealData.warranty +
        dealData.gap +
        dealData.maintenance +
        dealData.paintProtection;

      // Call Rust pricing service (via HTTP bridge or gRPC)
      const result = await calculatePayment({
        vehiclePrice: dealData.salePrice,
        downPayment: dealData.downPayment,
        tradeValue: dealData.tradeValue,
        tradePayoff: dealData.tradePayoff,
        apr: dealData.apr,
        term: dealData.term,
        addOns: totalAddOns,
      });

      const calculationTime = performance.now() - startTime;
      setLastCalculationTime(calculationTime);

      // Map to PaymentCalculation format
      const paymentData: PaymentCalculation = {
        monthlyPayment: result.monthlyPayment,
        totalFinanced: result.totalFinanced,
        totalInterest: result.totalInterest,
        totalCost: result.totalCost,
        amountFinanced: dealData.salePrice - dealData.downPayment - netTrade + totalAddOns,
      };

      // Cache result
      if (enableCache) {
        cacheRef.current.set(cacheKey, paymentData);
      }

      setPayment(paymentData);
      setIsCalculating(false);
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        console.error('Deal calculation error:', err);
        setError('Calculation failed. Please try again.');
        setIsCalculating(false);
      }
    }
  }, [enableCache, getCacheKey]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  /**
   * Auto-calculate on deal changes
   */
  useEffect(() => {
    if (!autoCalculate) return;

    // Clear existing debounce timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // Set new debounce timer
    debounceTimerRef.current = setTimeout(() => {
      calculate(deal);
    }, debounceMs);

    // Cleanup
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [deal, autoCalculate, debounceMs, calculate]);

  return {
    payment,
    isCalculating,
    error,
    calculate,
    clearCache,
    lastCalculationTime,
  };
}

/**
 * Calculate required sale price to achieve target payment (for Payment Lock feature)
 */
export async function calculateRequiredPrice(params: {
  targetPayment: number;
  downPayment: number;
  netTrade: number;
  term: number;
  apr: number;
  addOns: number;
  minPrice: number;
  maxPrice: number;
}): Promise<{
  requiredPrice: number;
  feasible: boolean;
  reason?: string;
}> {
  const { targetPayment, downPayment, netTrade, term, apr, addOns, minPrice, maxPrice } = params;

  // Use binary search to find the required price
  let low = minPrice;
  let high = maxPrice;
  const tolerance = 1; // $1 tolerance
  const maxIterations = 50;

  for (let i = 0; i < maxIterations; i++) {
    const mid = (low + high) / 2;

    try {
      const result = await calculatePayment({
        vehiclePrice: mid,
        downPayment,
        tradeValue: netTrade >= 0 ? netTrade : 0,
        tradePayoff: netTrade < 0 ? -netTrade : 0,
        apr,
        term,
        addOns,
      });

      const diff = result.monthlyPayment - targetPayment;

      if (Math.abs(diff) < tolerance) {
        // Found it!
        return { requiredPrice: mid, feasible: true };
      }

      if (result.monthlyPayment > targetPayment) {
        // Price is too high, search lower half
        high = mid;
      } else {
        // Price is too low, search upper half
        low = mid;
      }
    } catch (err) {
      console.error('Binary search iteration failed:', err);
      break;
    }
  }

  // Check if we got close enough
  const finalPrice = (low + high) / 2;

  try {
    const result = await calculatePayment({
      vehiclePrice: finalPrice,
      downPayment,
      tradeValue: netTrade >= 0 ? netTrade : 0,
      tradePayoff: netTrade < 0 ? -netTrade : 0,
      apr,
      term,
      addOns,
    });

    const diff = Math.abs(result.monthlyPayment - targetPayment);

    if (diff < 5) {
      // Within $5/month is acceptable
      return { requiredPrice: finalPrice, feasible: true };
    }

    // Not feasible within range
    if (finalPrice <= minPrice) {
      return {
        requiredPrice: minPrice,
        feasible: false,
        reason: 'Target payment requires sale price below minimum',
      };
    }

    if (finalPrice >= maxPrice) {
      return {
        requiredPrice: maxPrice,
        feasible: false,
        reason: 'Target payment requires sale price above maximum',
      };
    }

    return {
      requiredPrice: finalPrice,
      feasible: false,
      reason: 'Unable to achieve exact target payment',
    };
  } catch (err) {
    console.error('Final calculation failed:', err);
    return {
      requiredPrice: finalPrice,
      feasible: false,
      reason: 'Calculation error',
    };
  }
}
