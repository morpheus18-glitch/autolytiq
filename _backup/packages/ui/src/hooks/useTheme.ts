import { useState, useEffect, useCallback } from 'react';
import {
  getTheme,
  setTheme as setThemeToken,
  watchSystemTheme,
  type ThemeName
} from '@repo/tokens';

/**
 * Hook to manage theme state and changes
 * @returns Object with current theme, setter, and theme info
 *
 * @example
 * const { theme, setTheme, isDark } = useTheme();
 */
export function useTheme() {
  const [theme, setThemeState] = useState<ThemeName>(() => getTheme());
  const [systemTheme, setSystemTheme] = useState<ThemeName>('light');

  useEffect(() => {
    // Initialize theme on mount
    const currentTheme = getTheme();
    setThemeState(currentTheme);

    // Watch for system theme changes
    const unsubscribe = watchSystemTheme((newTheme) => {
      setSystemTheme(newTheme);
    });

    return unsubscribe;
  }, []);

  const setTheme = useCallback((newTheme: ThemeName) => {
    setThemeToken(newTheme);
    setThemeState(newTheme);
  }, []);

  const toggleTheme = useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  }, [theme, setTheme]);

  return {
    theme,
    setTheme,
    toggleTheme,
    systemTheme,
    isDark: theme === 'dark' || theme === 'automotive',
    isLight: theme === 'light',
    isHighContrast: theme === 'high-contrast',
  };
}

/**
 * Hook to detect if user prefers dark mode
 * @returns true if dark mode is preferred
 */
export function usePrefersDarkMode(): boolean {
  const [prefersDark, setPrefersDark] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersDark(e.matches);
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy API fallback
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersDark;
}

/**
 * Hook to detect if user prefers reduced motion
 * @returns true if reduced motion is preferred
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
      setPrefersReduced(e.matches);
    };

    // Modern API
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }

    // Legacy API fallback
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }, []);

  return prefersReduced;
}
