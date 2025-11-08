/**
 * FullDensityLayout - Layout B
 *
 * For high-information, full-screen tasks.
 * Single, wide-open content area with optional toolbar.
 *
 * Use Cases:
 * - Accounting: General ledger, A/R, A/P reports (100% DataTables)
 * - DMS Service: Service scheduler Calendar view
 * - Dev Portal: Full-width API documentation
 * - Marketing: Email campaign builder
 *
 * Mobile: Becomes "Summary Cards"
 * - Cannot show full DataTable on phone
 * - Shows dashboard of summary cards instead
 * - Tap card → navigate to mobile-optimized list
 */

import React from 'react';
import { cn } from '../utils/cn.js';
import { useMobileBreakpoint } from '../hooks/useBreakpoint.js';

export interface FullDensityLayoutProps {
  /** Main content (DataTable, Calendar, etc.) */
  children: React.ReactNode;
  /** Optional toolbar above content */
  toolbar?: React.ReactNode;
  /** Mobile summary cards (replaces main content on mobile) */
  mobileSummary?: React.ReactNode;
  /** Max width constraint (default: none) */
  maxWidth?: 'lg' | 'xl' | '2xl' | 'full';
  /** Padding (default: 'md') */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

export function FullDensityLayout({
  children,
  toolbar,
  mobileSummary,
  maxWidth = 'full',
  padding = 'md',
  className,
}: FullDensityLayoutProps) {
  const isMobile = useMobileBreakpoint();

  const maxWidthClasses = {
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-none',
  };

  const paddingClasses = {
    none: 'p-0',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div className={cn('h-full overflow-auto', className)}>
      <div className={cn('mx-auto', maxWidthClasses[maxWidth], paddingClasses[padding])}>
        {/* Optional Toolbar */}
        {toolbar && (
          <div className="mb-4 flex items-center justify-between">
            {toolbar}
          </div>
        )}

        {/* Main Content */}
        {isMobile && mobileSummary ? (
          // Mobile: Show summary cards instead of full DataTable
          <div className="space-y-4">
            {mobileSummary}
          </div>
        ) : (
          // Desktop: Show full content
          children
        )}
      </div>
    </div>
  );
}

FullDensityLayout.displayName = 'FullDensityLayout';
