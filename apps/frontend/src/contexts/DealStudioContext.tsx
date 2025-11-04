/**
 * Deal Studio Context
 *
 * Global state management for Deal Studio
 * Handles deal structure, calculations, and AI recommendations
 * Integrated with Rust pricing service and payment lock
 */

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useDealCalculation } from '@/hooks/useDealCalculation';
import { useAutoAdjustPaymentLock } from '@/hooks/usePaymentLock';
import { useLivePricing } from '@/hooks/useLivePricing';

// Deal Structure Interface
export interface DealStructure {
  // Vehicle
  vehicleId?: string;
  vehiclePrice: number;
  vehicleCost: number;

  // Customer
  customerId?: string;
  creditScore: number;

  // Deal Terms
  salePrice: number;
  downPayment: number;
  tradeValue: number;
  tradePayoff: number;
  term: number; // months
  apr: number;

  // F&I Products
  warranty: number;
  gap: number;
  maintenance: number;
  paintProtection: number;
}

// Payment Calculation Result
export interface PaymentCalculation {
  monthlyPayment: number;
  totalFinanced: number;
  totalInterest: number;
  totalCost: number;
  amountFinanced: number;
}

// Profit Breakdown
export interface ProfitBreakdown {
  frontEndProfit: number;
  backEndProfit: number;
  totalProfit: number;
  vehicleMargin: number;
  fiMargin: number;
}

// Context Type
export interface DealStudioContextType {
  // Deal Structure
  deal: DealStructure;
  updateDeal: (updates: Partial<DealStructure>) => void;
  resetDeal: () => void;

  // Payment Lock
  paymentLocked: boolean;
  lockedPayment: number | null;
  togglePaymentLock: () => void;
  setLockedPayment: (payment: number) => void;

  // Calculation State
  isCalculating: boolean;
  payment: PaymentCalculation | null;
  profit: ProfitBreakdown | null;

  // Panel State (desktop)
  dossierCollapsed: boolean;
  toggleDossier: () => void;
  aiExpanded: boolean;
  toggleAIPanel: () => void;

  // Modal State (mobile)
  isOpen: boolean;
  openStudio: () => void;
  closeStudio: () => void;
}

// Create Context
const DealStudioContext = createContext<DealStudioContextType | undefined>(undefined);

// Default Deal Structure
const getDefaultDeal = (): DealStructure => ({
  vehiclePrice: 0,
  vehicleCost: 0,
  creditScore: 680,
  salePrice: 0,
  downPayment: 0,
  tradeValue: 0,
  tradePayoff: 0,
  term: 60,
  apr: 5.99,
  warranty: 0,
  gap: 0,
  maintenance: 0,
  paintProtection: 0,
});

// Provider Props
interface DealStudioProviderProps {
  children: ReactNode;
  initialDeal?: Partial<DealStructure>;
}

/**
 * Deal Studio Provider
 */
export function DealStudioProvider({ children, initialDeal }: DealStudioProviderProps) {
  // Deal State
  const [deal, setDeal] = useState<DealStructure>({
    ...getDefaultDeal(),
    ...initialDeal,
  });

  // UI State
  const [dossierCollapsed, setDossierCollapsed] = useState(false);
  const [aiExpanded, setAIExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Use Rust-powered calculation hook
  const {
    payment,
    isCalculating,
    error: calculationError,
    clearCache,
    lastCalculationTime,
  } = useDealCalculation(deal, {
    debounceMs: 50,
    autoCalculate: true,
    enableCache: true,
  });

  // Use payment lock hook with auto-adjustment
  const paymentLock = useAutoAdjustPaymentLock(deal, {
    minPrice: deal.vehicleCost,
    maxPrice: deal.vehiclePrice * 1.5,
    onPriceAdjust: (newPrice) => {
      // Auto-adjust sale price when payment is locked
      setDeal((prev) => ({ ...prev, salePrice: newPrice }));
    },
    onInfeasible: (reason) => {
      console.warn('Payment lock infeasible:', reason);
    },
  });

  // Use live pricing WebSocket
  const livePricing = useLivePricing({
    vehicleId: deal.vehicleId,
    autoConnect: true,
    onPricingUpdate: (update) => {
      console.log('Live pricing update:', update);
      // Could auto-update vehiclePrice here if desired
    },
    onRateUpdate: (update) => {
      console.log('Live rate update:', update);
      // Could auto-update apr here if desired
    },
  });

  // Profit State (calculated from payment results)
  const [profit, setProfit] = useState<ProfitBreakdown | null>(null);

  /**
   * Update deal structure
   */
  const updateDeal = useCallback((updates: Partial<DealStructure>) => {
    setDeal((prev) => ({...prev, ...updates }));
    // Calculation happens automatically via useDealCalculation hook
  }, []);

  /**
   * Reset deal to defaults
   */
  const resetDeal = useCallback(() => {
    setDeal(getDefaultDeal());
    paymentLock.unlockPayment();
    setProfit(null);
    clearCache();
  }, [paymentLock, clearCache]);

  /**
   * Toggle payment lock
   */
  const togglePaymentLock = useCallback(() => {
    if (payment) {
      paymentLock.toggleLock(payment.monthlyPayment);
    }
  }, [paymentLock, payment]);

  /**
   * Set specific locked payment amount
   */
  const setLockedPayment = useCallback((amount: number) => {
    paymentLock.lockPayment(amount);
  }, [paymentLock]);

  /**
   * Calculate profit when payment updates
   * (Payment calculation is handled by Rust via useDealCalculation hook)
   */
  useEffect(() => {
    if (!payment) {
      setProfit(null);
      return;
    }

    // Calculate total F&I products
    const totalFI =
      deal.warranty +
      deal.gap +
      deal.maintenance +
      deal.paintProtection;

    // Calculate profit
    const frontEndProfit = deal.salePrice - deal.vehicleCost;

    // Assume 30% margin on F&I products
    const backEndProfit =
      (deal.warranty * 0.3) +
      (deal.gap * 0.3) +
      (deal.maintenance * 0.3) +
      (deal.paintProtection * 0.3);

    const totalProfit = frontEndProfit + backEndProfit;
    const vehicleMargin = deal.vehicleCost > 0
      ? (frontEndProfit / deal.vehicleCost) * 100
      : 0;
    const fiMargin = totalFI > 0
      ? (backEndProfit / totalFI) * 100
      : 0;

    setProfit({
      frontEndProfit,
      backEndProfit,
      totalProfit,
      vehicleMargin,
      fiMargin,
    });
  }, [payment, deal.salePrice, deal.vehicleCost, deal.warranty, deal.gap, deal.maintenance, deal.paintProtection]);

  /**
   * Toggle dossier panel
   */
  const toggleDossier = useCallback(() => {
    setDossierCollapsed((prev) => !prev);
  }, []);

  /**
   * Toggle AI panel
   */
  const toggleAIPanel = useCallback(() => {
    setAIExpanded((prev) => !prev);
  }, []);

  /**
   * Open studio modal (mobile)
   */
  const openStudio = useCallback(() => {
    setIsOpen(true);
  }, []);

  /**
   * Close studio modal (mobile)
   */
  const closeStudio = useCallback(() => {
    setIsOpen(false);
  }, []);

  // Context value
  const value: DealStudioContextType = {
    deal,
    updateDeal,
    resetDeal,
    paymentLocked: paymentLock.isLocked,
    lockedPayment: paymentLock.lockedPayment,
    togglePaymentLock,
    setLockedPayment,
    isCalculating: isCalculating || paymentLock.isAdjusting,
    payment,
    profit,
    dossierCollapsed,
    toggleDossier,
    aiExpanded,
    toggleAIPanel,
    isOpen,
    openStudio,
    closeStudio,
  };

  return (
    <DealStudioContext.Provider value={value}>
      {children}
    </DealStudioContext.Provider>
  );
}

/**
 * Hook to use Deal Studio context
 */
export function useDealStudio() {
  const context = useContext(DealStudioContext);
  if (context === undefined) {
    throw new Error('useDealStudio must be used within a DealStudioProvider');
  }
  return context;
}
