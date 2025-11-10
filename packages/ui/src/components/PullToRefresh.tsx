/**
 * PullToRefresh Component
 * Wrapper component that adds pull-to-refresh functionality
 * Shows animated spinner while refreshing
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import { usePullToRefresh } from '../hooks/usePullToRefresh.js';

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
  disabled?: boolean;
}

export const PullToRefresh = React.forwardRef<HTMLDivElement, PullToRefreshProps>(
  ({ children, onRefresh, threshold = 80, className, disabled = false }, ref) => {
    const { containerRef, pullDistance, isRefreshing, canRefresh } = usePullToRefresh({
      onRefresh,
      threshold,
      disabled,
    });

    const spinnerRotation = isRefreshing ? 0 : (pullDistance / threshold) * 360;

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn('relative overflow-auto', className)}
      >
        {/* Pull indicator */}
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-center transition-opacity duration-200"
          style={{
            height: pullDistance,
            opacity: pullDistance > 0 ? 1 : 0,
          }}
        >
          <div
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-full transition-colors',
              canRefresh
                ? 'bg-accent-success text-white'
                : 'bg-bg-2 text-text-muted'
            )}
            style={{
              transform: `rotate(${spinnerRotation}deg)`,
              transition: isRefreshing ? 'none' : 'transform 0.1s linear',
            }}
          >
            {isRefreshing ? (
              <svg
                className="animate-spin w-5 h-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
          </div>
        </div>

        {/* Content with padding when pulling */}
        <div
          style={{
            transform: `translateY(${pullDistance}px)`,
            transition: pullDistance === 0 ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {children}
        </div>
      </div>
    );
  }
);

PullToRefresh.displayName = 'PullToRefresh';
