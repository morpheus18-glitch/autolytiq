/**
 * Autolytiq Deal Studio
 *
 * Mission Control for Vehicle Negotiations
 * - Real-time calculations powered by Rust (< 100ms)
 * - AI-powered recommendations and insights
 * - Payment lock and reverse calculation
 * - Seamless integration with DM chat
 */

import { useState } from 'react';
import { CustomerDossier } from './CustomerDossier';
import { LiveSimulator } from './LiveSimulator';
import { AICompanion } from './AICompanion';
import { ChevronLeft, ChevronRight, Minimize2 } from 'lucide-react';
import { Button } from '@repo/ui';

interface DealStudioProps {
  dealId?: string;
  customerId?: string;
  vehicleId?: string;
}

export default function DealStudio({ dealId, customerId, vehicleId }: DealStudioProps) {
  const [leftPanelCollapsed, setLeftPanelCollapsed] = useState(false);
  const [rightPanelCollapsed, setRightPanelCollapsed] = useState(false);

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Header Bar */}
      <div className="h-12 bg-surface-base border-b border-border-base flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-text-primary">Autolytiq Deal Studio</h1>
          {dealId && (
            <span className="text-sm text-text-tertiary">Deal #{dealId}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            Save Draft
          </Button>
          <Button variant="outline" size="sm">
            <Minimize2 className="h-4 w-4 mr-2" />
            Minimize
          </Button>
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Panel 1: Customer Dossier (Left - 25%) */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            border-r border-border-base bg-surface-muted
            ${leftPanelCollapsed ? 'w-0' : 'w-1/4'}
            overflow-hidden
          `}
        >
          {!leftPanelCollapsed && (
            <div className="h-full flex flex-col">
              <div className="h-10 bg-surface-base border-b border-border-base flex items-center justify-between px-4">
                <h2 className="text-sm font-medium text-text-primary">Customer Dossier</h2>
                <button
                  onClick={() => setLeftPanelCollapsed(true)}
                  className="p-1 hover:bg-surface-muted rounded"
                >
                  <ChevronLeft className="h-4 w-4 text-text-tertiary" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <CustomerDossier customerId={customerId} />
              </div>
            </div>
          )}
        </div>

        {/* Expand Left Panel Button */}
        {leftPanelCollapsed && (
          <button
            onClick={() => setLeftPanelCollapsed(false)}
            className="w-6 bg-surface-base border-r border-border-base hover:bg-surface-muted flex items-center justify-center group"
          >
            <ChevronRight className="h-4 w-4 text-text-tertiary group-hover:text-text-primary" />
          </button>
        )}

        {/* Panel 2: Live Desking Simulator (Center - 50%) */}
        <div
          className={`
            flex-1 transition-all duration-300 ease-in-out
            ${leftPanelCollapsed && rightPanelCollapsed ? 'w-full' :
              leftPanelCollapsed || rightPanelCollapsed ? 'w-3/4' : 'w-1/2'}
          `}
        >
          <LiveSimulator
            dealId={dealId}
            vehicleId={vehicleId}
            customerId={customerId}
          />
        </div>

        {/* Expand Right Panel Button */}
        {rightPanelCollapsed && (
          <button
            onClick={() => setRightPanelCollapsed(false)}
            className="w-6 bg-surface-base border-l border-border-base hover:bg-surface-muted flex items-center justify-center group"
          >
            <ChevronLeft className="h-4 w-4 text-text-tertiary group-hover:text-text-primary" />
          </button>
        )}

        {/* Panel 3: AI Companion (Right - 25%) */}
        <div
          className={`
            transition-all duration-300 ease-in-out
            border-l border-border-base bg-surface-muted
            ${rightPanelCollapsed ? 'w-0' : 'w-1/4'}
            overflow-hidden
          `}
        >
          {!rightPanelCollapsed && (
            <div className="h-full flex flex-col">
              <div className="h-10 bg-surface-base border-b border-border-base flex items-center justify-between px-4">
                <h2 className="text-sm font-medium text-text-primary">AI Companion</h2>
                <button
                  onClick={() => setRightPanelCollapsed(true)}
                  className="p-1 hover:bg-surface-muted rounded"
                >
                  <ChevronRight className="h-4 w-4 text-text-tertiary" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <AICompanion dealId={dealId} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
