/**
 * Deal Studio Desktop - Three-Panel Layout
 *
 * Full desktop experience with three persistent panels:
 * - Left: Deal Structure Controls (380px)
 * - Center: Deal Preview & Analysis (flex-1)
 * - Right: AI Coach (400px)
 */

import { LeftPanel } from './LeftPanel';
import { CenterPanel } from './CenterPanel';
import { RightPanel } from './RightPanel';
import { X } from 'lucide-react';

export interface DealStudioDesktopProps {
  open: boolean;
  onClose: () => void;
  onPasteToChat?: (message: string) => void;
}

export function DealStudioDesktop({ open, onClose }: DealStudioDesktopProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-surface-base z-50 flex flex-col">
      {/* Top Bar */}
      <div className="h-14 bg-surface-elevated border-b border-border-base flex items-center justify-between px-6 flex-shrink-0">
        <div>
          <h1 className="text-xl font-bold text-text-primary">Deal Studio</h1>
          <p className="text-xs text-text-tertiary">Desktop Mode - Full Feature Set</p>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-lg hover:bg-surface-subtle transition-colors text-text-secondary hover:text-text-primary"
          aria-label="Close Deal Studio"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Three-Panel Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Deal Controls */}
        <div className="w-[380px] flex-shrink-0">
          <LeftPanel />
        </div>

        {/* Center Panel - Deal Preview */}
        <div className="flex-1 min-w-0">
          <CenterPanel />
        </div>

        {/* Right Panel - AI Coach */}
        <div className="w-[400px] flex-shrink-0">
          <RightPanel />
        </div>
      </div>
    </div>
  );
}
