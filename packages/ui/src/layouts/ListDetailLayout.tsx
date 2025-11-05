/**
 * ListDetailLayout - Layout A
 *
 * The workhorse for browsing data.
 * Two-panel layout: List on left, Detail on right.
 *
 * Use Cases:
 * - CRM: [List of Customers] | [Customer Profile]
 * - Inventory: [List of Vehicles] | [Vehicle Detail]
 * - DMS Parts: [List of Parts] | [Part Details & Stock]
 *
 * Mobile: Becomes "Stack Navigation"
 * - List takes full screen
 * - Detail slides in from right when item selected
 */

import React from 'react';
import { cn } from '../utils/cn.js';
import { useMobileBreakpoint } from '../hooks/useBreakpoint.js';
import { ChevronLeft } from 'lucide-react';

export interface ListDetailLayoutProps {
  /** List panel content */
  list: React.ReactNode;
  /** Detail panel content */
  detail?: React.ReactNode;
  /** Whether detail is currently shown (mobile) */
  showDetail?: boolean;
  /** Callback when back button clicked (mobile) */
  onBack?: () => void;
  /** List panel width (default: 'md' = 384px) */
  listWidth?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

export function ListDetailLayout({
  list,
  detail,
  showDetail = false,
  onBack,
  listWidth = 'md',
  className,
}: ListDetailLayoutProps) {
  const isMobile = useMobileBreakpoint();

  const widthClasses = {
    sm: 'w-80',     // 320px
    md: 'w-96',     // 384px
    lg: 'w-[480px]', // 480px
  };

  // Mobile: Stack Navigation
  if (isMobile) {
    return (
      <div className={cn('h-full', className)}>
        {/* List Screen */}
        <div className={cn('h-full overflow-auto', showDetail && 'hidden')}>
          {list}
        </div>

        {/* Detail Screen (slides in from right) */}
        {showDetail && detail && (
          <div className="flex h-full flex-col">
            {/* Sticky Back Button */}
            <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-default bg-elevated px-4 py-3">
              <button
                onClick={onBack}
                className="flex items-center gap-2 text-sm text-secondary hover:text-primary"
              >
                <ChevronLeft className="h-[18px] w-[18px]" />
                <span>Back</span>
              </button>
            </div>

            {/* Detail Content */}
            <div className="flex-1 overflow-auto">
              {detail}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Desktop: Two-Panel Layout
  return (
    <div className={cn('flex h-full', className)}>
      {/* List Panel */}
      <div className={cn(
        'flex-shrink-0 border-r border-default bg-elevated overflow-auto',
        widthClasses[listWidth]
      )}>
        {list}
      </div>

      {/* Detail Panel */}
      <div className="flex-1 overflow-auto bg-canvas">
        {detail || (
          <div className="flex h-full items-center justify-center">
            <div className="text-center text-tertiary">
              <p className="text-sm">Select an item to view details</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

ListDetailLayout.displayName = 'ListDetailLayout';
