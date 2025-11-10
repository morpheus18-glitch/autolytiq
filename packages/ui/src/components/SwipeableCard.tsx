/**
 * SwipeableCard Component
 * Card with swipe-to-action functionality
 * Shows action buttons on left/right swipe
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import { useSwipeableCard } from '../hooks/useSwipeable.js';

export interface SwipeAction {
  label: string;
  icon?: React.ReactNode;
  color?: 'primary' | 'success' | 'danger' | 'warn';
  onClick: () => void;
}

export interface SwipeableCardProps {
  children: React.ReactNode;
  leftAction?: SwipeAction;
  rightAction?: SwipeAction;
  className?: string;
  disabled?: boolean;
}

const actionColors = {
  primary: 'bg-accent-primary',
  success: 'bg-accent-success',
  danger: 'bg-accent-danger',
  warn: 'bg-accent-warn',
};

export const SwipeableCard = React.forwardRef<HTMLDivElement, SwipeableCardProps>(
  ({ children, leftAction, rightAction, className, disabled = false }, ref) => {
    const { swipeOffset, isSwiping, handlers } = useSwipeableCard({
      onSwipeLeftAction: leftAction?.onClick,
      onSwipeRightAction: rightAction?.onClick,
      actionThreshold: 100,
    });

    // Don't show swipe on desktop or if disabled
    const [isMobile, setIsMobile] = React.useState(false);

    React.useEffect(() => {
      setIsMobile('ontouchstart' in window);
    }, []);

    if (!isMobile || disabled) {
      return (
        <div ref={ref} className={cn('relative', className)}>
          {children}
        </div>
      );
    }

    const showLeftAction = swipeOffset > 50 && rightAction;
    const showRightAction = swipeOffset < -50 && leftAction;

    return (
      <div ref={ref} className={cn('relative overflow-hidden', className)}>
        {/* Left action background */}
        {rightAction && (
          <div
            className={cn(
              'absolute inset-y-0 left-0 flex items-center justify-start px-4',
              'transition-opacity duration-200',
              actionColors[rightAction.color || 'primary'],
              showLeftAction ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              width: Math.max(0, swipeOffset),
            }}
          >
            {rightAction.icon && (
              <span className="text-white">{rightAction.icon}</span>
            )}
            <span className="ml-2 text-sm font-medium text-white">
              {rightAction.label}
            </span>
          </div>
        )}

        {/* Right action background */}
        {leftAction && (
          <div
            className={cn(
              'absolute inset-y-0 right-0 flex items-center justify-end px-4',
              'transition-opacity duration-200',
              actionColors[leftAction.color || 'danger'],
              showRightAction ? 'opacity-100' : 'opacity-0'
            )}
            style={{
              width: Math.max(0, -swipeOffset),
            }}
          >
            <span className="mr-2 text-sm font-medium text-white">
              {leftAction.label}
            </span>
            {leftAction.icon && (
              <span className="text-white">{leftAction.icon}</span>
            )}
          </div>
        )}

        {/* Card content */}
        <div
          className={cn(
            'relative bg-bg-1 transition-transform',
            isSwiping ? 'duration-0' : 'duration-300'
          )}
          style={{
            transform: `translateX(${swipeOffset}px)`,
          }}
          {...handlers}
        >
          {children}
        </div>
      </div>
    );
  }
);

SwipeableCard.displayName = 'SwipeableCard';
