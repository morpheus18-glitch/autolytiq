/**
 * Theme Management Utility
 * Handles light/dark theme toggling with system preference detection
 */

export type Theme = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'autolytiq-theme';

/**
 * Get the user's system theme preference
 */
function getSystemTheme(): 'light' | 'dark' {
  if (typeof window === 'undefined') return 'light';
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

/**
 * Get the stored theme preference
 */
export function getStoredTheme(): Theme {
  if (typeof window === 'undefined') return 'system';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'light' || stored === 'dark' || stored === 'system') {
      return stored;
    }
  } catch (error) {
    console.warn('Failed to read theme from localStorage:', error);
  }
  return 'system';
}

/**
 * Get the effective theme (resolves 'system' to actual theme)
 */
export function getEffectiveTheme(theme: Theme): 'light' | 'dark' {
  if (theme === 'system') {
    return getSystemTheme();
  }
  return theme;
}

/**
 * Apply theme to document
 */
export function applyTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  const effectiveTheme = getEffectiveTheme(theme);
  const root = document.documentElement;

  // Set data-theme attribute
  root.setAttribute('data-theme', effectiveTheme);

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    const color = effectiveTheme === 'dark' ? '#030712' : '#ffffff';
    metaThemeColor.setAttribute('content', color);
  }
}

/**
 * Set and persist theme
 */
export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch (error) {
    console.warn('Failed to save theme to localStorage:', error);
  }

  applyTheme(theme);
}

/**
 * Toggle between light and dark themes
 */
export function toggleTheme(): Theme {
  const currentTheme = getStoredTheme();
  const effectiveTheme = getEffectiveTheme(currentTheme);
  const newTheme = effectiveTheme === 'light' ? 'dark' : 'light';
  setTheme(newTheme);
  return newTheme;
}

/**
 * Initialize theme on app load
 */
export function initializeTheme(): void {
  if (typeof window === 'undefined') return;

  const storedTheme = getStoredTheme();
  applyTheme(storedTheme);

  // Listen for system theme changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const handleChange = () => {
    const current = getStoredTheme();
    if (current === 'system') {
      applyTheme('system');
    }
  };

  // Modern browsers
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handleChange);
  } else {
    // Fallback for older browsers
    mediaQuery.addListener(handleChange);
  }
}

/**
 * React hook for theme management
 */
export function useTheme() {
  if (typeof window === 'undefined') {
    return {
      theme: 'system' as Theme,
      effectiveTheme: 'light' as 'light' | 'dark',
      setTheme: () => {},
      toggleTheme: () => 'light' as Theme,
    };
  }

  const [theme, setThemeState] = React.useState<Theme>(getStoredTheme);
  const effectiveTheme = getEffectiveTheme(theme);

  const updateTheme = React.useCallback((newTheme: Theme) => {
    setTheme(newTheme);
    setThemeState(newTheme);
  }, []);

  const toggle = React.useCallback(() => {
    const newTheme = toggleTheme();
    setThemeState(newTheme);
    return newTheme;
  }, []);

  React.useEffect(() => {
    initializeTheme();
  }, []);

  return {
    theme,
    effectiveTheme,
    setTheme: updateTheme,
    toggleTheme: toggle,
  };
}

// Export React for the hook
import * as React from 'react';
