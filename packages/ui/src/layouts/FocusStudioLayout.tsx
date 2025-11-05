/**
 * FocusStudioLayout - Layout C
 *
 * Specialized layout for high-intensity, multi-source tasks.
 * The "Dynamic Focus" 3-panel layout.
 *
 * Use Cases:
 * - Desking: Manager's Command Center (Dossier | Simulator | AI Coach)
 * - Advanced Reporting: BI Dashboard Builder (Metrics | Canvas | Properties)
 *
 * Structure (Desktop):
 * - Left Panel (1/4): Context/Dossier
 * - Center Panel (1/2): Main workspace/Simulator
 * - Right Panel (1/4): Assistant/AI Coach
 *
 * Mobile: Becomes "Focus-Stack Modal"
 * - Slides up from bottom
 * - Scrolling stack layout:
 *   - Dossier Header (sticky)
 *   - AI Coach Card (collapsible)
 *   - Simulator Levers (scrollable)
 */

import React, { useState } from 'react';
import { cn } from '../utils/cn.js';
import { useMobileBreakpoint } from '../hooks/useBreakpoint.js';
import { X, ChevronDown, ChevronUp } from 'lucide-react';

export interface FocusStudioLayoutProps {
  /** Left panel: Context/Dossier */
  left: React.ReactNode;
  /** Center panel: Main workspace */
  center: React.ReactNode;
  /** Right panel: Assistant/AI */
  right: React.ReactNode;
  /** Mobile header */
  mobileHeader?: React.ReactNode;
  /** On close (mobile) */
  onClose?: () => void;
  /** Custom className */
  className?: string;
}

export function FocusStudioLayout({
  left,
  center,
  right,
  mobileHeader,
  onClose,
  className,
}: FocusStudioLayoutProps) {
  const isMobile = useMobileBreakpoint();
  const [aiCollapsed, setAiCollapsed] = useState(false);

  // Mobile: Focus-Stack Modal
  if (isMobile) {
    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="fixed inset-x-0 bottom-0 top-16 z-50 flex flex-col rounded-t-2xl bg-canvas shadow-2xl">
          {/* Sticky Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-default bg-elevated px-4 py-3">
            {mobileHeader || <div className="text-lg font-semibold">Deal Studio</div>}
            <button
              onClick={onClose}
              className="rounded p-1.5 text-secondary hover:bg-inset hover:text-primary"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-auto">
            {/* Dossier/Context (from left panel) */}
            <div className="border-b border-default p-4">
              {left}
            </div>

            {/* AI Coach Card (collapsible) */}
            <div className="border-b border-default">
              <button
                onClick={() => setAiCollapsed(!aiCollapsed)}
                className="flex w-full items-center justify-between bg-elevated px-4 py-3 text-left"
              >
                <span className="font-medium text-primary">AI Recommendations</span>
                {aiCollapsed ? <ChevronDown className="h-[18px] w-[18px]" /> : <ChevronUp className="h-[18px] w-[18px]" />}
              </button>
              {!aiCollapsed && (
                <div className="p-4">
                  {right}
                </div>
              )}
            </div>

            {/* Simulator/Main Workspace (from center panel) */}
            <div className="p-4">
              {center}
            </div>
          </div>
        </div>
      </>
    );
  }

  // Desktop: 3-Panel Layout
  return (
    <div className={cn('flex h-full', className)}>
      {/* Left Panel (1/4): Context/Dossier */}
      <div className="w-1/4 border-r border-default bg-elevated overflow-auto">
        {left}
      </div>

      {/* Center Panel (1/2): Main Workspace */}
      <div className="w-1/2 overflow-auto bg-canvas">
        {center}
      </div>

      {/* Right Panel (1/4): AI Assistant */}
      <div className="w-1/4 border-l border-default bg-elevated overflow-auto">
        {right}
      </div>
    </div>
  );
}

FocusStudioLayout.displayName = 'FocusStudioLayout';
