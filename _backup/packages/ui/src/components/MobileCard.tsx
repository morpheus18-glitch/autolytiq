/**
 * MobileCard - Mobile-optimized card with responsive layouts
 * 
 * Provides mobile and desktop layouts with proper touch targets
 * and content stacking.
 */

import React from 'react';
import { cn } from '../utils/cn.js';
import { useMobileBreakpoint } from '../hooks/useBreakpoint.js';
import { Card, CardContent } from './Card.js';

export interface MobileCardProps {
  /** Mobile layout content */
  mobileLayout: React.ReactNode;
  /** Desktop layout content */
  desktopLayout: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Card padding */
  padding?: 'sm' | 'md' | 'lg';
}

const paddingClasses = {
  sm: 'p-3 sm:p-4',
  md: 'p-4 sm:p-6',
  lg: 'p-6 sm:p-8',
};

export function MobileCard({
  mobileLayout,
  desktopLayout,
  className,
  padding = 'md',
}: MobileCardProps) {
  const isMobile = useMobileBreakpoint();

  return (
    <Card className={className}>
      <CardContent className={paddingClasses[padding]}>
        <div className="sm:hidden">
          {mobileLayout}
        </div>
        <div className="hidden sm:block">
          {desktopLayout}
        </div>
      </CardContent>
    </Card>
  );
}

export interface MobileListItemProps {
  /** Primary text */
  primary: string;
  /** Secondary text */
  secondary?: string;
  /** Amount/value to display */
  value?: string | number;
  /** Value color */
  valueColor?: 'default' | 'success' | 'error' | 'warning';
  /** Badges */
  badges?: React.ReactNode;
  /** Actions */
  actions?: React.ReactNode;
  /** Meta info (date, category, etc) */
  meta?: React.ReactNode;
  /** Custom className */
  className?: string;
}

const valueColorClasses = {
  default: 'text-text-primary',
  success: 'text-[rgb(var(--success))]',
  error: 'text-[rgb(var(--error))]',
  warning: 'text-[rgb(var(--warning))]',
};

export function MobileListItem({
  primary,
  secondary,
  value,
  valueColor = 'default',
  badges,
  meta,
  actions,
  className,
}: MobileListItemProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {/* Header Row */}
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-text-primary truncate">{primary}</div>
          {secondary && (
            <div className="text-xs text-text-secondary mt-0.5 truncate">{secondary}</div>
          )}
        </div>
        {value && (
          <div className={cn('font-bold text-lg flex-shrink-0', valueColorClasses[valueColor])}>
            {value}
          </div>
        )}
      </div>

      {/* Meta Row */}
      {meta && (
        <div className="flex items-center gap-2 text-xs text-text-tertiary">
          {meta}
        </div>
      )}

      {/* Badges Row */}
      {badges && (
        <div className="flex items-center gap-2 flex-wrap">
          {badges}
        </div>
      )}

      {/* Actions Row */}
      {actions && (
        <div className="flex gap-2 pt-2 border-t border-border-base">
          {actions}
        </div>
      )}
    </div>
  );
}
