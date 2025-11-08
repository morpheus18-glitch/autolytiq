/**
 * ResponsiveActions - Mobile-optimized action buttons
 * 
 * Shows icon-only on mobile, icon + text on desktop.
 * Wraps properly on small screens.
 */

import React from 'react';
import { cn } from '../utils/cn.js';
import { useMobileBreakpoint } from '../hooks/useBreakpoint.js';
import { Button, type ButtonProps } from './Button.js';

export interface ResponsiveButtonProps extends Omit<ButtonProps, 'children'> {
  /** Button text */
  text: string;
  /** Icon component */
  icon?: React.ReactNode;
  /** Show text on mobile */
  showTextOnMobile?: boolean;
}

export function ResponsiveButton({
  text,
  icon,
  showTextOnMobile = false,
  size = 'sm',
  className,
  ...props
}: ResponsiveButtonProps) {
  const isMobile = useMobileBreakpoint();

  return (
    <Button size={size} className={className} {...props}>
      {icon && (
        <span className={cn(isMobile && !showTextOnMobile ? '' : 'sm:mr-2')}>
          {icon}
        </span>
      )}
      <span className={cn(
        isMobile && !showTextOnMobile && 'sr-only',
        !isMobile && 'inline'
      )}>
        {text}
      </span>
    </Button>
  );
}

export interface ResponsiveActionsProps {
  /** Action buttons */
  children: React.ReactNode;
  /** Custom className */
  className?: string;
  /** Alignment */
  align?: 'left' | 'center' | 'right';
}

const alignClasses = {
  left: 'justify-start',
  center: 'justify-center',
  right: 'justify-end',
};

export function ResponsiveActions({
  children,
  className,
  align = 'right',
}: ResponsiveActionsProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 flex-wrap',
      alignClasses[align],
      className
    )}>
      {children}
    </div>
  );
}
