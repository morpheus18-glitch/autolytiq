/**
 * Deal Studio Context
 *
 * Global state management for Deal Studio
 * Handles deal structure, calculations, and AI recommendations
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

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

  // Payment Lock State
  const [paymentLocked, setPaymentLocked] = useState(false);
  const [lockedPayment, setLockedPaymentState] = useState<number | null>(null);

  // Calculation State
  const [isCalculating, setIsCalculating] = useState(false);
  const [payment, setPayment] = useState<PaymentCalculation | null>(null);
  const [profit, setProfit] = useState<ProfitBreakdown | null>(null);

  // UI State
  const [dossierCollapsed, setDossierCollapsed] = useState(false);
  const [aiExpanded, setAIExpanded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  /**
   * Update deal structure
   */
  const updateDeal = useCallback((updates: Partial<DealStructure>) => {
    setDeal((prev) => {
      const newDeal = { ...prev, ...updates };

      // Trigger calculation
      calculatePayment(newDeal);

      return newDeal;
    });
  }, []);

  /**
   * Reset deal to defaults
   */
  const resetDeal = useCallback(() => {
    setDeal(getDefaultDeal());
    setPaymentLocked(false);
    setLockedPaymentState(null);
    setPayment(null);
    setProfit(null);
  }, []);

  /**
   * Toggle payment lock
   */
  const togglePaymentLock = useCallback(() => {
    if (!paymentLocked && payment) {
      // Lock at current payment
      setLockedPaymentState(payment.monthlyPayment);
    } else {
      // Unlock
      setLockedPaymentState(null);
    }
    setPaymentLocked(!paymentLocked);
  }, [paymentLocked, payment]);

  /**
   * Set specific locked payment amount
   */
  const setLockedPayment = useCallback((amount: number) => {
    setLockedPaymentState(amount);
    setPaymentLocked(true);
  }, []);

  /**
   * Calculate payment and profit
   * TODO: Replace with actual Rust service call
   */
  const calculatePayment = useCallback((dealStructure: DealStructure) => {
    setIsCalculating(true);

    // Simulate async calculation (will be replaced with Rust gRPC call)
    setTimeout(() => {
      // Calculate net trade
      const netTrade = dealStructure.tradeValue - dealStructure.tradePayoff;

      // Calculate total F&I products
      const totalFI =
        dealStructure.warranty +
        dealStructure.gap +
        dealStructure.maintenance +
        dealStructure.paintProtection;

      // Calculate amount financed
      const amountFinanced =
        dealStructure.salePrice -
        dealStructure.downPayment -
        netTrade +
        totalFI;

      // Calculate monthly payment (simple amortization)
      const monthlyRate = dealStructure.apr / 100 / 12;
      const numPayments = dealStructure.term;

      let monthlyPayment = 0;
      if (amountFinanced > 0 && monthlyRate > 0) {
        monthlyPayment =
          (amountFinanced * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
          (Math.pow(1 + monthlyRate, numPayments) - 1);
      } else if (amountFinanced > 0) {
        monthlyPayment = amountFinanced / numPayments;
      }

      const totalInterest = monthlyPayment * numPayments - amountFinanced;
      const totalCost = dealStructure.salePrice + totalInterest + totalFI;

      // Calculate profit
      const frontEndProfit = dealStructure.salePrice - dealStructure.vehicleCost;

      // Assume 30% margin on F&I products
      const backEndProfit =
        (dealStructure.warranty * 0.3) +
        (dealStructure.gap * 0.3) +
        (dealStructure.maintenance * 0.3) +
        (dealStructure.paintProtection * 0.3);

      const totalProfit = frontEndProfit + backEndProfit;
      const vehicleMargin = dealStructure.vehicleCost > 0
        ? (frontEndProfit / dealStructure.vehicleCost) * 100
        : 0;
      const fiMargin = totalFI > 0
        ? (backEndProfit / totalFI) * 100
        : 0;

      // Set results
      setPayment({
        monthlyPayment,
        totalFinanced: amountFinanced,
        totalInterest,
        totalCost,
        amountFinanced,
      });

      setProfit({
        frontEndProfit,
        backEndProfit,
        totalProfit,
        vehicleMargin,
        fiMargin,
      });

      setIsCalculating(false);
    }, 50); // 50ms delay to simulate calculation
  }, []);

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
    paymentLocked,
    lockedPayment,
    togglePaymentLock,
    setLockedPayment,
    isCalculating,
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
