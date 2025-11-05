/**
 * ColorContrastChecker Component
 *
 * Visual component to check and display WCAG color contrast compliance
 * Useful for design systems, accessibility audits, and color selection
 */

import React from 'react';
import { checkContrast, getComplianceLevel, type ContrastResult } from '../utils/colorAccessibility.js';
import { Badge } from './Badge.js';
import { cn } from '../utils/cn.js';

export interface ColorContrastCheckerProps {
  /** Foreground color (hex) */
  foreground: string;
  /** Background color (hex) */
  background: string;
  /** Show large text compliance */
  showLargeText?: boolean;
  /** Show compliance badges */
  showBadges?: boolean;
  /** Show color swatches */
  showSwatches?: boolean;
  /** Custom className */
  className?: string;
}

export function ColorContrastChecker({
  foreground,
  background,
  showLargeText = true,
  showBadges = true,
  showSwatches = true,
  className,
}: ColorContrastCheckerProps) {
  const result: ContrastResult = checkContrast(foreground, background);
  const normalLevel = getComplianceLevel(result.ratio, false);
  const largeLevel = getComplianceLevel(result.ratio, true);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'AAA':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-100';
      case 'AA':
        return 'bg-warning-100 text-warning-800 dark:bg-warning-900 dark:text-warning-100';
      default:
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-100';
    }
  };

  return (
    <div className={cn('space-y-4 rounded-lg border border-neutral-200 p-4 dark:border-neutral-800', className)}>
      {/* Color Swatches */}
      {showSwatches && (
        <div className="flex gap-3">
          <div className="flex-1">
            <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Foreground
            </div>
            <div
              className="h-16 w-full rounded border border-neutral-300 dark:border-neutral-700"
              style={{ backgroundColor: foreground }}
            />
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {foreground.toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Background
            </div>
            <div
              className="h-16 w-full rounded border border-neutral-300 dark:border-neutral-700"
              style={{ backgroundColor: background }}
            />
            <div className="mt-1 text-xs text-neutral-500 dark:text-neutral-500">
              {background.toUpperCase()}
            </div>
          </div>
          <div className="flex-1">
            <div className="mb-2 text-xs font-medium text-neutral-600 dark:text-neutral-400">
              Preview
            </div>
            <div
              className="flex h-16 w-full items-center justify-center rounded border border-neutral-300 text-sm font-medium dark:border-neutral-700"
              style={{ backgroundColor: background, color: foreground }}
            >
              Sample Text
            </div>
          </div>
        </div>
      )}

      {/* Contrast Ratio */}
      <div className="flex items-center justify-between border-t border-neutral-200 pt-4 dark:border-neutral-800">
        <div>
          <div className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
            Contrast Ratio
          </div>
          <div className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {result.ratio}:1
          </div>
        </div>

        {/* Compliance Badges */}
        {showBadges && (
          <div className="flex gap-2">
            <div className="text-right">
              <div className="mb-1 text-xs text-neutral-500">Normal Text</div>
              <Badge className={cn('text-xs font-semibold', getLevelColor(normalLevel))}>
                {normalLevel}
              </Badge>
            </div>
            {showLargeText && (
              <div className="text-right">
                <div className="mb-1 text-xs text-neutral-500">Large Text</div>
                <Badge className={cn('text-xs font-semibold', getLevelColor(largeLevel))}>
                  {largeLevel}
                </Badge>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Compliance Details */}
      <div className="grid grid-cols-2 gap-3 border-t border-neutral-200 pt-4 text-xs dark:border-neutral-800">
        <div>
          <div className="mb-2 font-semibold text-neutral-700 dark:text-neutral-300">
            WCAG AA
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Normal (4.5:1)</span>
              <span className={cn('font-medium', result.AA.normal ? 'text-success-600' : 'text-error-600')}>
                {result.AA.normal ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
            {showLargeText && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Large (3:1)</span>
                <span className={cn('font-medium', result.AA.large ? 'text-success-600' : 'text-error-600')}>
                  {result.AA.large ? '✓ Pass' : '✗ Fail'}
                </span>
              </div>
            )}
          </div>
        </div>
        <div>
          <div className="mb-2 font-semibold text-neutral-700 dark:text-neutral-300">
            WCAG AAA
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-neutral-600 dark:text-neutral-400">Normal (7:1)</span>
              <span className={cn('font-medium', result.AAA.normal ? 'text-success-600' : 'text-error-600')}>
                {result.AAA.normal ? '✓ Pass' : '✗ Fail'}
              </span>
            </div>
            {showLargeText && (
              <div className="flex items-center justify-between">
                <span className="text-neutral-600 dark:text-neutral-400">Large (4.5:1)</span>
                <span className={cn('font-medium', result.AAA.large ? 'text-success-600' : 'text-error-600')}>
                  {result.AAA.large ? '✓ Pass' : '✗ Fail'}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

ColorContrastChecker.displayName = 'ColorContrastChecker';
