/**
 * Deal Studio Desktop Layout
 *
 * Three-panel cockpit layout for desktop
 * Panel 1 (Left): Customer Dossier - 25%
 * Panel 2 (Center): Live Simulator - 50%
 * Panel 3 (Right): AI Companion - 25%
 */

import { useDealStudio } from '@/contexts/DealStudioContext';
import { CustomerDossierPanel } from './CustomerDossierPanel';
import { LiveSimulatorPanel } from './LiveSimulatorPanel';
import { AICompanionPanel } from './AICompanionPanel';
import { X, Minimize2, Maximize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DealStudioDesktopProps {
  /** Optional callback when studio is closed */
  onClose?: () => void;
  /** Whether studio is in full-screen mode */
  fullScreen?: boolean;
  /** Optional custom class name */
  className?: string;
}

export function DealStudioDesktop({
  onClose,
  fullScreen = false,
  className,
}: DealStudioDesktopProps) {
  const { dossierCollapsed, aiExpanded } = useDealStudio();

  // Calculate panel widths
  const dossierWidth = dossierCollapsed ? '64px' : '25%';
  const aiWidth = aiExpanded ? '50%' : '25%';

  // Calculate simulator width dynamically
  const getSimulatorWidth = () => {
    if (dossierCollapsed && aiExpanded) return 'calc(100% - 64px - 50%)';
    if (dossierCollapsed) return 'calc(100% - 64px - 25%)';
    if (aiExpanded) return 'calc(100% - 25% - 50%)';
    return '50%';
  };

  return (
    <div
      className={cn(
        'flex flex-col h-screen bg-slate-100',
        fullScreen && 'fixed inset-0 z-50',
        className
      )}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-white border-b border-slate-200 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-black text-lg">A</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900">
                Autolytiq Deal Studio
              </h1>
              <p className="text-xs text-slate-500">
                Mission Control for Deal Desking
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Indicators */}
          <div className="flex items-center gap-2 mr-4">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg text-xs font-semibold">
              <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
              <span>Live Pricing</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg text-xs font-semibold">
              <div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse" />
              <span>AI Active</span>
            </div>
          </div>

          {/* Window Controls */}
          {onClose && (
            <>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                title="Minimize"
              >
                <Minimize2 className="h-5 w-5 text-slate-600" />
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-red-100 rounded-lg transition-colors group"
                title="Close"
              >
                <X className="h-5 w-5 text-slate-600 group-hover:text-red-600" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Panel 1: Customer Dossier (Left) */}
        <div
          className={cn(
            'flex-shrink-0 bg-slate-50 border-r border-slate-200 overflow-y-auto transition-all duration-300',
            dossierCollapsed && 'overflow-hidden'
          )}
          style={{ width: dossierWidth }}
        >
          <CustomerDossierPanel />
        </div>

        {/* Panel 2: Live Simulator (Center) */}
        <div
          className="flex-shrink-0 bg-white overflow-y-auto transition-all duration-300"
          style={{ width: getSimulatorWidth() }}
        >
          <LiveSimulatorPanel />
        </div>

        {/* Panel 3: AI Companion (Right) */}
        <div
          className="flex-shrink-0 bg-purple-50/30 border-l border-purple-200/50 overflow-y-auto transition-all duration-300"
          style={{ width: aiWidth }}
        >
          <AICompanionPanel />
        </div>
      </div>
    </div>
  );
}
