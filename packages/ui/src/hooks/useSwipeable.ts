/**
 * useSwipeable Hook
 * Custom swipe gesture detection for mobile interactions
 * Zero dependencies - pure DOM event handling
 */

import { useRef, useEffect, useCallback, useState } from 'react';

export interface SwipeableOptions {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  threshold?: number; // Minimum distance in pixels to trigger swipe
  preventDefaultTouchmoveEvent?: boolean;
}

export interface SwipeableHandlers {
  onTouchStart: (e: React.TouchEvent) => void;
  onTouchMove: (e: React.TouchEvent) => void;
  onTouchEnd: (e: React.TouchEvent) => void;
}

interface TouchPosition {
  x: number;
  y: number;
  time: number;
}

export function useSwipeable(options: SwipeableOptions): SwipeableHandlers {
  const {
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    threshold = 50,
    preventDefaultTouchmoveEvent = false,
  } = options;

  const touchStart = useRef<TouchPosition | null>(null);
  const touchEnd = useRef<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchEnd.current = null;
    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (preventDefaultTouchmoveEvent) {
        e.preventDefault();
      }
      const touch = e.touches[0];
      if (!touch) return;
      touchEnd.current = {
        x: touch.clientX,
        y: touch.clientY,
        time: Date.now(),
      };
    },
    [preventDefaultTouchmoveEvent]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current || !touchEnd.current) return;

    const deltaX = touchEnd.current.x - touchStart.current.x;
    const deltaY = touchEnd.current.y - touchStart.current.y;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    // Determine if horizontal or vertical swipe
    if (absDeltaX > absDeltaY) {
      // Horizontal swipe
      if (absDeltaX > threshold) {
        if (deltaX > 0) {
          onSwipeRight?.();
        } else {
          onSwipeLeft?.();
        }
      }
    } else {
      // Vertical swipe
      if (absDeltaY > threshold) {
        if (deltaY > 0) {
          onSwipeDown?.();
        } else {
          onSwipeUp?.();
        }
      }
    }

    touchStart.current = null;
    touchEnd.current = null;
  }, [threshold, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown]);

  return {
    onTouchStart: handleTouchStart,
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
  };
}

/**
 * useSwipeableCard Hook
 * Enhanced swipeable for card actions with visual feedback
 * Returns swipe offset for visual animations
 */
export interface SwipeableCardOptions {
  onSwipeLeftAction?: () => void;
  onSwipeRightAction?: () => void;
  threshold?: number;
  actionThreshold?: number; // Distance needed to trigger action (default: 100px)
}

export function useSwipeableCard(options: SwipeableCardOptions) {
  const {
    onSwipeLeftAction,
    onSwipeRightAction,
    threshold = 10,
    actionThreshold = 100,
  } = options;

  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const touchStart = useRef<TouchPosition | null>(null);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    if (!touch) return;
    touchStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
    setIsSwiping(true);
  }, []);

  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStart.current) return;

      const touch = e.touches[0];
      if (!touch) return;
      const deltaX = touch.clientX - touchStart.current.x;
      const deltaY = touch.clientY - touchStart.current.y;

      // Only handle horizontal swipes
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
        e.preventDefault();
        // Limit swipe distance to prevent over-swiping
        const limitedOffset = Math.max(-150, Math.min(150, deltaX));
        setSwipeOffset(limitedOffset);
      }
    },
    [threshold]
  );

  const handleTouchEnd = useCallback(() => {
    if (!touchStart.current) return;

    const offset = swipeOffset;

    // Trigger action if threshold reached
    if (Math.abs(offset) >= actionThreshold) {
      if (offset > 0) {
        onSwipeRightAction?.();
      } else {
        onSwipeLeftAction?.();
      }
    }

    // Reset state
    setSwipeOffset(0);
    setIsSwiping(false);
    touchStart.current = null;
  }, [swipeOffset, actionThreshold, onSwipeLeftAction, onSwipeRightAction]);

  return {
    swipeOffset,
    isSwiping,
    handlers: {
      onTouchStart: handleTouchStart,
      onTouchMove: handleTouchMove,
      onTouchEnd: handleTouchEnd,
    },
  };
}

/**
 * useLongPress Hook
 * Detect long press gestures for context menus
 */
export interface LongPressOptions {
  onLongPress: () => void;
  delay?: number; // Milliseconds to wait before triggering (default: 500ms)
  onPress?: () => void; // Optional regular press handler
}

export function useLongPress(options: LongPressOptions) {
  const { onLongPress, delay = 500, onPress } = options;
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pressedRef = useRef(false);

  const start = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      pressedRef.current = true;
      timeoutRef.current = setTimeout(() => {
        if (pressedRef.current) {
          onLongPress();
        }
      }, delay);
    },
    [onLongPress, delay]
  );

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (pressedRef.current && onPress) {
      onPress();
    }

    pressedRef.current = false;
  }, [onPress]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: cancel,
    onMouseLeave: cancel,
    onTouchStart: start,
    onTouchEnd: cancel,
  };
}
