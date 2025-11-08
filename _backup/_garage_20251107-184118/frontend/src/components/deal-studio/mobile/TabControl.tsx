/**
 * Tab Control (Mobile)
 *
 * Segmented control for switching between tabs
 * Simulator | AI Coach
 */

import { Calculator, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export type DealStudioTab = 'simulator' | 'ai-coach';

export interface TabControlProps {
  /** Currently active tab */
  activeTab: DealStudioTab;
  /** Callback when tab changes */
  onChange: (tab: DealStudioTab) => void;
  /** Optional custom class name */
  className?: string;
}

export function TabControl({ activeTab, onChange, className }: TabControlProps) {
  return (
    <div className={cn('bg-white border-b border-slate-200', className)}>
      <div className="flex items-center p-2 gap-2">
        {/* Simulator Tab */}
        <button
          onClick={() => onChange('simulator')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'simulator'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-300/50'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Calculator className="h-4 w-4" />
          <span>Simulator</span>
        </button>

        {/* AI Coach Tab */}
        <button
          onClick={() => onChange('ai-coach')}
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all',
            activeTab === 'ai-coach'
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-300/50'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          )}
        >
          <Sparkles className="h-4 w-4" />
          <span>AI Coach</span>
        </button>
      </div>
    </div>
  );
}

/**
 * Tab indicator for visual feedback
 */
export function TabIndicator({ activeTab }: { activeTab: DealStudioTab }) {
  return (
    <div className="relative h-1 bg-slate-200">
      <div
        className={cn(
          'absolute inset-y-0 w-1/2 transition-all duration-300',
          activeTab === 'simulator'
            ? 'left-0 bg-blue-600'
            : 'left-1/2 bg-gradient-to-r from-purple-600 to-pink-600'
        )}
      />
    </div>
  );
}
