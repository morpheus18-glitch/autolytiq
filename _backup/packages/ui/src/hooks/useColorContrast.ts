/**
 * useColorContrast Hook
 *
 * React hook for checking color contrast compliance
 * Useful for dynamic color selection and accessibility validation
 */

import { useMemo } from 'react';
import { checkContrast, getSuggestedForeground, isDark, type ContrastResult } from '../utils/colorAccessibility.js';

export interface UseColorContrastOptions {
  /** Foreground color (hex) */
  foreground: string;
  /** Background color (hex) */
  background: string;
  /** Minimum contrast ratio required (default: 4.5 for AA normal text) */
  minRatio?: number;
}

export interface UseColorContrastReturn {
  /** Contrast check result */
  result: ContrastResult;
  /** Whether the combination meets the minimum ratio */
  isAccessible: boolean;
  /** Suggested foreground color for optimal contrast */
  suggestedForeground: '#000000' | '#FFFFFF';
  /** Whether the background is dark */
  isDarkBackground: boolean;
}

/**
 * Hook to check color contrast and accessibility compliance
 */
export function useColorContrast({
  foreground,
  background,
  minRatio = 4.5,
}: UseColorContrastOptions): UseColorContrastReturn {
  const result = useMemo(() => checkContrast(foreground, background), [foreground, background]);

  const suggestedForeground = useMemo(() => getSuggestedForeground(background), [background]);

  const isDarkBackground = useMemo(() => isDark(background), [background]);

  const isAccessible = useMemo(() => result.ratio >= minRatio, [result.ratio, minRatio]);

  return {
    result,
    isAccessible,
    suggestedForeground,
    isDarkBackground,
  };
}

/**
 * Hook to get accessible foreground color for a given background
 */
export function useAccessibleForeground(background: string): '#000000' | '#FFFFFF' {
  return useMemo(() => getSuggestedForeground(background), [background]);
}
