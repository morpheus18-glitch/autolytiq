import { useState, useCallback } from 'react';

export interface UsePaymentLockReturn {
  lockedPayment: number | null;
  lockPayment: (payment: number) => void;
  unlockPayment: () => void;
  isLocked: boolean;
}

/**
 * Hook for payment lock functionality
 * Allows user to lock target payment and adjust other levers
 */
export function usePaymentLock(): UsePaymentLockReturn {
  const [lockedPayment, setLockedPayment] = useState<number | null>(null);

  const lockPayment = useCallback((payment: number) => {
    setLockedPayment(payment);
    console.log('[usePaymentLock] Payment locked:', payment);
  }, []);

  const unlockPayment = useCallback(() => {
    setLockedPayment(null);
    console.log('[usePaymentLock] Payment unlocked');
  }, []);

  return {
    lockedPayment,
    lockPayment,
    unlockPayment,
    isLocked: lockedPayment !== null,
  };
}
