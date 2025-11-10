/**
 * usePullToRefresh Hook
 * Implements pull-to-refresh functionality for mobile
 * Zero dependencies - pure touch event handling
 */

import { useRef, useCallback, useState, useEffect } from 'react';

export interface PullToRefreshOptions {
  onRefresh: () => Promise<void>;
  threshold?: number; // Distance to pull before refresh triggers (default: 80px)
  maxPullDistance?: number; // Maximum pull distance (default: 120px)
  resistance?: number; // Pull resistance factor (default: 2.5)
  disabled?: boolean;
}

export interface PullToRefreshState {
  pullDistance: number;
  isRefreshing: boolean;
  canRefresh: boolean;
}

export function usePullToRefresh(options: PullToRefreshOptions) {
  const {
    onRefresh,
    threshold = 80,
    maxPullDistance = 120,
    resistance = 2.5,
    disabled = false,
  } = options;

  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [canRefresh, setCanRefresh] = useState(false);

  const touchStart = useRef<{ y: number; scrollTop: number } | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  const handleTouchStart = useCallback((e: TouchEvent) => {
    if (disabled || isRefreshing) return;

    const container = containerRef.current;
    if (!container) return;

    // Only trigger if scrolled to top
    if (container.scrollTop === 0) {
      const touch = e.touches[0];
      if (!touch) return;
      touchStart.current = {
        y: touch.clientY,
        scrollTop: container.scrollTop,
      };
    }
  }, [disabled, isRefreshing]);

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (disabled || isRefreshing || !touchStart.current) return;

      const container = containerRef.current;
      if (!container || container.scrollTop > 0) {
        touchStart.current = null;
        return;
      }

      const touch = e.touches[0];
      if (!touch) return;
      const deltaY = touch.clientY - touchStart.current.y;

      if (deltaY > 0) {
        // Pulling down
        e.preventDefault();

        // Apply resistance
        const distance = Math.min(
          maxPullDistance,
          deltaY / resistance
        );

        setPullDistance(distance);
        setCanRefresh(distance >= threshold);
      }
    },
    [disabled, isRefreshing, threshold, maxPullDistance, resistance]
  );

  const handleTouchEnd = useCallback(async () => {
    if (disabled || isRefreshing || !touchStart.current) return;

    if (canRefresh) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
        setCanRefresh(false);
      }
    } else {
      setPullDistance(0);
      setCanRefresh(false);
    }

    touchStart.current = null;
  }, [disabled, isRefreshing, canRefresh, onRefresh]);

  // Attach event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return {
    containerRef,
    pullDistance,
    isRefreshing,
    canRefresh,
  };
}
