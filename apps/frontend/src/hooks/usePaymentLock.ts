/**
 * usePaymentLock Hook
 *
 * Manages payment lock functionality with reverse calculation
 * When payment is locked, adjusts sale price to maintain target payment
 */

import { useState, useCallback, useEffect } from 'react';
import { calculateRequiredPrice } from './useDealCalculation';
import type { DealStructure } from '@/contexts/DealStudioContext';

interface UsePaymentLockOptions {
  /** Minimum allowed sale price */
  minPrice?: number;
  /** Maximum allowed sale price */
  maxPrice?: number;
  /** Callback when sale price needs to be adjusted */
  onPriceAdjust?: (newPrice: number) => void;
  /** Callback when lock becomes infeasible */
  onInfeasible?: (reason: string) => void;
}

interface UsePaymentLockReturn {
  /** Whether payment is currently locked */
  isLocked: boolean;
  /** The locked payment amount */
  lockedPayment: number | null;
  /** Whether reverse calculation is in progress */
  isAdjusting: boolean;
  /** Lock payment at current amount */
  lockPayment: (amount: number) => void;
  /** Unlock payment */
  unlockPayment: () => void;
  /** Toggle lock state */
  toggleLock: (currentPayment: number) => void;
  /** Adjust price to maintain locked payment */
  adjustPriceForLockedPayment: (deal: DealStructure) => Promise<void>;
  /** Whether locked payment is feasible */
  isFeasible: boolean;
  /** Reason if infeasible */
  infeasibleReason: string | null;
}

/**
 * Hook for managing payment lock with automatic price adjustment
 */
export function usePaymentLock(
  options: UsePaymentLockOptions = {}
): UsePaymentLockReturn {
  const {
    minPrice = 0,
    maxPrice = 200000,
    onPriceAdjust,
    onInfeasible,
  } = options;

  const [isLocked, setIsLocked] = useState(false);
  const [lockedPayment, setLockedPayment] = useState<number | null>(null);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isFeasible, setIsFeasible] = useState(true);
  const [infeasibleReason, setInfeasibleReason] = useState<string | null>(null);

  /**
   * Lock payment at specific amount
   */
  const lockPayment = useCallback((amount: number) => {
    setIsLocked(true);
    setLockedPayment(amount);
    setIsFeasible(true);
    setInfeasibleReason(null);
  }, []);

  /**
   * Unlock payment
   */
  const unlockPayment = useCallback(() => {
    setIsLocked(false);
    setLockedPayment(null);
    setIsFeasible(true);
    setInfeasibleReason(null);
  }, []);

  /**
   * Toggle lock state
   */
  const toggleLock = useCallback((currentPayment: number) => {
    setIsLocked((prev) => {
      if (!prev) {
        // Locking
        setLockedPayment(currentPayment);
        setIsFeasible(true);
        setInfeasibleReason(null);
      } else {
        // Unlocking
        setLockedPayment(null);
        setIsFeasible(true);
        setInfeasibleReason(null);
      }
      return !prev;
    });
  }, []);

  /**
   * Adjust sale price to maintain locked payment
   * Called when user changes down payment, trade, term, or APR while locked
   */
  const adjustPriceForLockedPayment = useCallback(async (deal: DealStructure) => {
    if (!isLocked || !lockedPayment) {
      return;
    }

    setIsAdjusting(true);

    try {
      const netTrade = deal.tradeValue - deal.tradePayoff;
      const totalAddOns =
        deal.warranty +
        deal.gap +
        deal.maintenance +
        deal.paintProtection;

      const result = await calculateRequiredPrice({
        targetPayment: lockedPayment,
        downPayment: deal.downPayment,
        netTrade,
        term: deal.term,
        apr: deal.apr,
        addOns: totalAddOns,
        minPrice: Math.max(minPrice, deal.vehicleCost), // Can't go below cost
        maxPrice,
      });

      if (result.feasible) {
        // Success - adjust price
        setIsFeasible(true);
        setInfeasibleReason(null);

        if (onPriceAdjust) {
          onPriceAdjust(result.requiredPrice);
        }
      } else {
        // Not feasible
        setIsFeasible(false);
        setInfeasibleReason(result.reason || 'Cannot achieve target payment');

        if (onInfeasible) {
          onInfeasible(result.reason || 'Cannot achieve target payment');
        }

        // Still adjust to closest possible
        if (onPriceAdjust) {
          onPriceAdjust(result.requiredPrice);
        }
      }
    } catch (err) {
      console.error('Price adjustment failed:', err);
      setIsFeasible(false);
      setInfeasibleReason('Calculation error occurred');

      if (onInfeasible) {
        onInfeasible('Calculation error occurred');
      }
    } finally {
      setIsAdjusting(false);
    }
  }, [isLocked, lockedPayment, minPrice, maxPrice, onPriceAdjust, onInfeasible]);

  return {
    isLocked,
    lockedPayment,
    isAdjusting,
    lockPayment,
    unlockPayment,
    toggleLock,
    adjustPriceForLockedPayment,
    isFeasible,
    infeasibleReason,
  };
}

/**
 * Hook for payment lock with automatic adjustment on deal changes
 * Automatically calls adjustPriceForLockedPayment when relevant fields change
 */
export function useAutoAdjustPaymentLock(
  deal: DealStructure,
  options: UsePaymentLockOptions = {}
) {
  const paymentLock = usePaymentLock(options);

  // Auto-adjust when locked and deal structure changes
  useEffect(() => {
    if (paymentLock.isLocked && paymentLock.lockedPayment) {
      // Only adjust if user changed something that affects payment
      // (down payment, trade, term, APR, add-ons)
      paymentLock.adjustPriceForLockedPayment(deal);
    }
  }, [
    deal.downPayment,
    deal.tradeValue,
    deal.tradePayoff,
    deal.term,
    deal.apr,
    deal.warranty,
    deal.gap,
    deal.maintenance,
    deal.paintProtection,
    paymentLock.isLocked,
    // Note: We don't include salePrice here because that's what we're adjusting
  ]);

  return paymentLock;
}
