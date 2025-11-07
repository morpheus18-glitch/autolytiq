import * as React from 'react';
import { PageContainer, PageHeader } from '@repo/ui';
import { PaymentPanel } from './components/PaymentPanel.js';
import { usePaymentLock } from './hooks/usePaymentLock.js';

export interface DealStudioDesktopProps {
  dealId: string;
}

export function DealStudioDesktop({ dealId }: DealStudioDesktopProps) {
  const { lockedPayment, lockPayment, unlockPayment } = usePaymentLock();

  return (
    <PageContainer>
      <PageHeader
        title={`Deal Studio - ${dealId.slice(0, 8)}`}
        description="Deal desking workspace (scaffolding)"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left Panel: Customer Dossier (placeholder) */}
        <div className="border border-border-base rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">Customer Dossier</h3>
          <p className="text-xs text-text-secondary">
            Placeholder for customer credit, history, preferences
          </p>
        </div>

        {/* Center Panel: Payment Simulator */}
        <div className="border border-border-base rounded-lg p-4">
          <PaymentPanel
            dealId={dealId}
            lockedPayment={lockedPayment}
            onLockPayment={lockPayment}
            onUnlockPayment={unlockPayment}
          />
        </div>

        {/* Right Panel: AI Companion (placeholder) */}
        <div className="border border-border-base rounded-lg p-4">
          <h3 className="text-sm font-semibold mb-2">AI Companion</h3>
          <p className="text-xs text-text-secondary">
            Placeholder for AI recommendations, sensitivity analysis
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
