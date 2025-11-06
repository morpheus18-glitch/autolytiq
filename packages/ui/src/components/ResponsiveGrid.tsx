/**
 * ResponsiveGrid - Mobile-first responsive grid
 * 
 * Automatically adjusts columns based on screen size.
 * Uses design tokens for spacing.
 */

import React from 'react';
import { cn } from '../utils/cn.js';

export interface ResponsiveGridProps {
  /** Grid content */
  children: React.ReactNode;
  /** Number of columns on desktop */
  cols?: 1 | 2 | 3 | 4 | 5 | 6;
  /** Number of columns on mobile (default: 1) */
  mobileCols?: 1 | 2;
  /** Gap size */
  gap?: 'sm' | 'md' | 'lg';
  /** Custom className */
  className?: string;
}

const colClasses = {
  1: 'sm:grid-cols-1',
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
  5: 'sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
  6: 'sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6',
};

const mobileColClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
};

const gapClasses = {
  sm: 'gap-3',
  md: 'gap-3 sm:gap-4',
  lg: 'gap-4 sm:gap-6',
};

export function ResponsiveGrid({
  children,
  cols = 2,
  mobileCols = 1,
  gap = 'md',
  className,
}: ResponsiveGridProps) {
  return (
    <div className={cn(
      'grid',
      mobileColClasses[mobileCols],
      colClasses[cols],
      gapClasses[gap],
      className
    )}>
      {children}
    </div>
  );
}
