/**
 * PageContainer - Mobile-first page wrapper
 * 
 * Provides consistent responsive padding and layout for all pages.
 * Uses design tokens for spacing.
 */

import React from 'react';
import { cn } from '../utils/cn.js';
import { useMobileBreakpoint } from '../hooks/useBreakpoint.js';

export interface PageContainerProps {
  /** Page content */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Remove default padding */
  noPadding?: boolean;
  /** Maximum width constraint */
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}

const maxWidthClasses = {
  sm: 'max-w-screen-sm',
  md: 'max-w-screen-md',
  lg: 'max-w-screen-lg',
  xl: 'max-w-screen-xl',
  '2xl': 'max-w-screen-2xl',
  full: 'max-w-full',
};

export function PageContainer({
  children,
  className,
  noPadding = false,
  maxWidth = 'full',
}: PageContainerProps) {
  const isMobile = useMobileBreakpoint();

  return (
    <div
      className={cn(
        'w-full mx-auto',
        !noPadding && (isMobile ? 'p-4' : 'p-6'),
        maxWidthClasses[maxWidth],
        className
      )}
    >
      {children}
    </div>
  );
}
