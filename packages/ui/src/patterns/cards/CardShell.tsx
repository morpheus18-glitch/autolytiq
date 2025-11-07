/**
 * CardShell - Base Card Pattern
 *
 * Universal card wrapper with consistent styling, accessibility, and loading states.
 * All card patterns (MetricCard, TrendCard, etc.) should use this as their base.
 *
 * Features:
 * - Semantic HTML (section/article with role)
 * - Keyboard navigation (focusable, ARIA)
 * - Loading/error states
 * - Priority-based visual emphasis
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../utils/cn.js';
import { Surface } from '../../primitives/Surface.js';
import { Skeleton } from '../../components/Skeleton.js';
import { Alert } from '../../components/Alert.js';
// Note: CardPriority type from @repo/shared
// Defined locally to avoid build dependency issues
type CardPriority = 'critical' | 'high' | 'normal' | 'low';

export const cardShellVariants = cva('', {
  variants: {
    /**
     * Priority level (affects border color and visual emphasis)
     */
    priority: {
      critical: 'border-l-4 border-l-red-500',
      high: 'border-l-4 border-l-orange-500',
      normal: '',
      low: 'opacity-90',
    },
    /**
     * Size
     */
    size: {
      SMALL: 'min-h-[120px]',
      MEDIUM: 'min-h-[200px]',
      LARGE: 'min-h-[320px]',
      WIDE: 'min-h-[160px]',
      FULL: 'min-h-[400px]',
    },
  },
  defaultVariants: {
    priority: 'normal',
    size: 'MEDIUM',
  },
});

export interface CardShellProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'title'>,
    VariantProps<typeof cardShellVariants> {
  /**
   * Card title (for accessibility)
   */
  title?: string;
  /**
   * Card description (for accessibility)
   */
  description?: string;
  /**
   * Loading state
   */
  isLoading?: boolean;
  /**
   * Error state
   */
  error?: Error | string | null;
  /**
   * Retry callback for error state
   */
  onRetry?: () => void;
  /**
   * Children (card content)
   */
  children: React.ReactNode;
  /**
   * HTML element to render
   */
  as?: 'div' | 'section' | 'article';
  /**
   * Interactive (clickable)
   */
  interactive?: boolean;
  /**
   * ARIA role
   */
  role?: string;
}

/**
 * CardShell Component
 *
 * Base card pattern with loading/error states and accessibility.
 *
 * @example
 * <CardShell
 *   title="Active Deals"
 *   description="List of currently active deals"
 *   priority="high"
 *   size="MEDIUM"
 *   isLoading={isLoading}
 *   error={error}
 * >
 *   <CardContent />
 * </CardShell>
 */
export const CardShell = React.forwardRef<HTMLElement, CardShellProps>(
  (
    {
      as = 'section',
      className,
      title,
      description,
      priority,
      size,
      isLoading,
      error,
      onRetry,
      interactive = false,
      role = 'region',
      children,
      ...props
    },
    ref
  ) => {
    // Render loading state
    if (isLoading) {
      return (
        <Surface
          as={as}
          ref={ref as any}
          className={cn(cardShellVariants({ priority, size }), className)}
          elevation="sm"
          padding="lg"
          role={role}
          aria-label={title}
          aria-busy="true"
          aria-live="polite"
          {...props}
        >
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-3 w-3/4" />
          </div>
        </Surface>
      );
    }

    // Render error state
    if (error) {
      const errorMessage = typeof error === 'string' ? error : error.message;
      return (
        <Surface
          as={as}
          ref={ref as any}
          className={cn(cardShellVariants({ priority, size }), className)}
          elevation="sm"
          padding="lg"
          role={role}
          aria-label={title}
          aria-live="assertive"
          {...props}
        >
          <Alert variant="error">
            <p className="text-sm font-medium">Failed to load card</p>
            <p className="text-xs text-gray-600 mt-1">{errorMessage}</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="mt-3 text-xs text-blue-600 hover:text-blue-800 font-medium underline"
              >
                Retry
              </button>
            )}
          </Alert>
        </Surface>
      );
    }

    // Render normal state
    return (
      <Surface
        as={as}
        ref={ref as any}
        className={cn(cardShellVariants({ priority, size }), className)}
        elevation="sm"
        padding="lg"
        interactive={interactive ? 'hover' : 'none'}
        role={role}
        aria-label={title}
        aria-description={description}
        tabIndex={interactive ? 0 : undefined}
        {...props}
      >
        {children}
      </Surface>
    );
  }
);

CardShell.displayName = 'CardShell';

/**
 * CardHeader - Standard header for cards
 */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Title text
   */
  title: string;
  /**
   * Description text (optional)
   */
  description?: string;
  /**
   * Action button/element (optional)
   */
  action?: React.ReactNode;
  /**
   * Icon (optional)
   */
  icon?: React.ReactNode;
}

export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, title, description, action, icon, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn('flex items-start justify-between mb-4', className)}
        {...props}
      >
        <div className="flex items-start gap-3 flex-1 min-w-0">
          {icon && <div className="flex-shrink-0 mt-0.5">{icon}</div>}
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h3>
            {description && (
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 truncate">
                {description}
              </p>
            )}
          </div>
        </div>
        {action && <div className="flex-shrink-0 ml-2">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';
