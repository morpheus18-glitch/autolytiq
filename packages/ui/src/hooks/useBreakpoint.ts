/**
 * useBreakpoint Hook
 *
 * Core hook for responsive layouts - the "translation mechanism"
 * Tells components whether they're on mobile, tablet, or desktop
 */

import { useState, useEffect } from 'react';

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export const BREAKPOINTS = {
  xs: 0,      // Mobile (< 640px)
  sm: 640,    // Large mobile / Small tablet
  md: 768,    // Tablet
  lg: 1024,   // Desktop
  xl: 1280,   // Large desktop
  '2xl': 1536, // Extra large desktop
} as const;

/**
 * Get the current breakpoint based on window width
 */
function getBreakpoint(width: number): Breakpoint {
  if (width < BREAKPOINTS.sm) return 'xs';
  if (width < BREAKPOINTS.md) return 'sm';
  if (width < BREAKPOINTS.lg) return 'md';
  if (width < BREAKPOINTS.xl) return 'lg';
  if (width < BREAKPOINTS['2xl']) return 'xl';
  return '2xl';
}

/**
 * Hook to get current breakpoint
 * Updates when window resizes
 *
 * @example
 * const breakpoint = useBreakpoint();
 * if (breakpoint === 'xs') {
 *   return <MobileLayout />;
 * }
 * return <DesktopLayout />;
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() =>
    typeof window !== 'undefined' ? getBreakpoint(window.innerWidth) : 'lg'
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      setBreakpoint(getBreakpoint(window.innerWidth));
    };

    // Use ResizeObserver for better performance if available
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(document.documentElement);

      return () => {
        resizeObserver.disconnect();
      };
    }

    // Fallback to window resize event
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return breakpoint;
}

/**
 * Hook to check if current breakpoint matches or exceeds target
 *
 * @example
 * const isDesktop = useBreakpointUp('lg');
 * // true if window width >= 1024px
 */
export function useBreakpointUp(target: Breakpoint): boolean {
  const current = useBreakpoint();
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  const currentIndex = breakpointOrder.indexOf(current);
  const targetIndex = breakpointOrder.indexOf(target);

  return currentIndex >= targetIndex;
}

/**
 * Hook to check if current breakpoint is below target
 *
 * @example
 * const isMobile = useBreakpointDown('sm');
 * // true if window width < 640px
 */
export function useBreakpointDown(target: Breakpoint): boolean {
  const current = useBreakpoint();
  const breakpointOrder: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];

  const currentIndex = breakpointOrder.indexOf(current);
  const targetIndex = breakpointOrder.indexOf(target);

  return currentIndex < targetIndex;
}

/**
 * Hook to check if we're on a mobile device
 *
 * @example
 * const isMobile = useMobileBreakpoint();
 * // true if breakpoint === 'xs'
 */
export function useMobileBreakpoint(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'xs';
}

/**
 * Hook to check if we're on a tablet
 *
 * @example
 * const isTablet = useTabletBreakpoint();
 * // true if breakpoint === 'sm' or 'md'
 */
export function useTabletBreakpoint(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'sm' || breakpoint === 'md';
}

/**
 * Hook to check if we're on desktop
 *
 * @example
 * const isDesktop = useDesktopBreakpoint();
 * // true if breakpoint >= 'lg'
 */
export function useDesktopBreakpoint(): boolean {
  const breakpoint = useBreakpoint();
  return breakpoint === 'lg' || breakpoint === 'xl' || breakpoint === '2xl';
}
