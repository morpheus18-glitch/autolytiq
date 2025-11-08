import { useState, useEffect } from 'react';

/**
 * Breakpoint constants matching design system
 */
export const BREAKPOINTS = {
  mobile: 0,
  tablet: 768,
  desktop: 1024,
  wide: 1280,
  ultrawide: 1920,
} as const;

export type Breakpoint = keyof typeof BREAKPOINTS;

/**
 * Hook to detect if the current viewport is mobile
 * @param breakpoint - The breakpoint to check against (default: 'tablet')
 * @returns true if viewport width is below the breakpoint
 *
 * @example
 * const isMobile = useMobile(); // true if width < 768px
 * const isSmallScreen = useMobile('desktop'); // true if width < 1024px
 */
export function useMobile(breakpoint: Breakpoint = 'tablet'): boolean {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth < BREAKPOINTS[breakpoint];
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setIsMobile(e.matches);
    };

    // Set initial value
    setIsMobile(mediaQuery.matches);

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy API fallback
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [breakpoint]);

  return isMobile;
}

/**
 * Hook to get the current breakpoint
 * @returns The current active breakpoint
 *
 * @example
 * const breakpoint = useBreakpoint();
 * // returns 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide'
 */
export function useBreakpoint(): Breakpoint {
  const [breakpoint, setBreakpoint] = useState<Breakpoint>(() => {
    if (typeof window === 'undefined') return 'desktop';

    const width = window.innerWidth;
    if (width >= BREAKPOINTS.ultrawide) return 'ultrawide';
    if (width >= BREAKPOINTS.wide) return 'wide';
    if (width >= BREAKPOINTS.desktop) return 'desktop';
    if (width >= BREAKPOINTS.tablet) return 'tablet';
    return 'mobile';
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      let newBreakpoint: Breakpoint;

      if (width >= BREAKPOINTS.ultrawide) {
        newBreakpoint = 'ultrawide';
      } else if (width >= BREAKPOINTS.wide) {
        newBreakpoint = 'wide';
      } else if (width >= BREAKPOINTS.desktop) {
        newBreakpoint = 'desktop';
      } else if (width >= BREAKPOINTS.tablet) {
        newBreakpoint = 'tablet';
      } else {
        newBreakpoint = 'mobile';
      }

      if (newBreakpoint !== breakpoint) {
        setBreakpoint(newBreakpoint);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return breakpoint;
}

/**
 * Hook to get viewport dimensions
 * @returns Object with width and height
 *
 * @example
 * const { width, height } = useViewport();
 */
export function useViewport() {
  const [viewport, setViewport] = useState<{ width: number; height: number }>(() => {
    if (typeof window === 'undefined') {
      return { width: 1024, height: 768 };
    }
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  });

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return viewport;
}

/**
 * Hook to check if viewport matches specific media query
 * @param query - Media query string
 * @returns true if query matches
 *
 * @example
 * const isLandscape = useMediaQuery('(orientation: landscape)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setMatches(e.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy API fallback
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, [query]);

  return matches;
}

/**
 * Hook to detect touch device
 * @returns true if device supports touch
 */
export function useTouchDevice(): boolean {
  const [isTouch, setIsTouch] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  });

  useEffect(() => {
    const checkTouch = () => {
      setIsTouch('ontouchstart' in window || navigator.maxTouchPoints > 0);
    };

    // Check on mount
    checkTouch();

    // Some devices might add touch support dynamically
    window.addEventListener('touchstart', checkTouch, { once: true });
    return () => window.removeEventListener('touchstart', checkTouch);
  }, []);

  return isTouch;
}

/**
 * Hook to get responsive value based on current breakpoint
 * @param values - Object with values for each breakpoint
 * @returns The value for the current breakpoint
 *
 * @example
 * const columns = useResponsiveValue({
 *   mobile: 1,
 *   tablet: 2,
 *   desktop: 3,
 *   wide: 4,
 * });
 */
export function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined {
  const breakpoint = useBreakpoint();

  // Return exact match if available
  if (values[breakpoint] !== undefined) {
    return values[breakpoint];
  }

  // Fallback to next smallest breakpoint
  const breakpointOrder: Breakpoint[] = ['mobile', 'tablet', 'desktop', 'wide', 'ultrawide'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  for (let i = currentIndex - 1; i >= 0; i--) {
    const fallbackBreakpoint = breakpointOrder[i];
    if (values[fallbackBreakpoint] !== undefined) {
      return values[fallbackBreakpoint];
    }
  }

  return undefined;
}
