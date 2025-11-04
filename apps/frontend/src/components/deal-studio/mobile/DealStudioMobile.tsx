/**
 * Deal Studio Mobile
 *
 * Full-screen modal with tabbed interface
 * Optimized for touch and mobile workflows
 */

import { useState, useCallback } from 'react';
import { useDealStudio } from '@/contexts/DealStudioContext';
import { CompactDossierHeader } from './CompactDossierHeader';
import { TabControl, type DealStudioTab } from './TabControl';
import { SimulatorTab } from './SimulatorTab';
import { AICoachTab } from './AICoachTab';
import { ActionBar } from './ActionBar';
import { formatCurrency } from '../shared/DealSlider';
import { cn } from '@/lib/utils';

export interface DealStudioMobileProps {
  /** Whether modal is open */
  open?: boolean;
  /** Callback when modal should close */
  onClose?: () => void;
  /** Callback when deal is pasted to chat */
  onPasteToChat?: (message: string) => void;
  /** Optional custom class name */
  className?: string;
}

export function DealStudioMobile({
  open = false,
  onClose,
  onPasteToChat,
  className,
}: DealStudioMobileProps) {
  const { deal, payment, profit, closeStudio } = useDealStudio();
  const [activeTab, setActiveTab] = useState<DealStudioTab>('simulator');

  const handleClose = useCallback(() => {
    if (onClose) {
      onClose();
    } else {
      closeStudio();
    }
  }, [onClose, closeStudio]);

  const handlePasteToChat = useCallback(() => {
    if (!payment) return;

    // Format deal summary for chat
    const netTrade = deal.tradeValue - deal.tradePayoff;
    const totalFI = deal.warranty + deal.gap + deal.maintenance + deal.paintProtection;

    const message = `Great news! I can do:

💰 ${formatCurrency(payment.monthlyPayment)}/month for ${deal.term} months
💵 ${formatCurrency(deal.downPayment)} down payment
${netTrade > 0 ? `🔄 ${formatCurrency(netTrade)} trade equity\n` : ''}🚗 ${deal.vehicleId ? '2024 F-150 Lariat' : 'Your vehicle'}

${totalFI > 0 ? `Includes: ${[
  deal.warranty > 0 && 'Warranty',
  deal.gap > 0 && 'GAP',
  deal.maintenance > 0 && 'Maintenance',
  deal.paintProtection > 0 && 'Paint Protection',
].filter(Boolean).join(', ')}\n\n` : ''}Ready to move forward? 🎉`;

    if (onPasteToChat) {
      onPasteToChat(message);
    }

    handleClose();
  }, [deal, payment, onPasteToChat, handleClose]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed inset-0 bg-white z-50 flex flex-col',
        className
      )}
    >
      {/* Drag Handle */}
      <div className="flex items-center justify-center py-2 bg-slate-50">
        <div className="w-12 h-1 bg-slate-300 rounded-full" />
      </div>

      {/* Compact Dossier Header */}
      <CompactDossierHeader />

      {/* Tab Control */}
      <TabControl
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden bg-slate-50">
        {activeTab === 'simulator' ? <SimulatorTab /> : <AICoachTab />}
      </div>

      {/* Action Bar */}
      <ActionBar
        onPasteToChat={payment ? handlePasteToChat : undefined}
        onClose={handleClose}
        disablePaste={!payment}
      />
    </div>
  );
}

/**
 * Hook to control mobile Deal Studio
 */
export function useMobileDealStudio() {
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}
