/**
 * Chip - Compact element for tags, filters, selections
 *
 * Small pill-shaped element for displaying tags, selections, or filters.
 * Similar to Badge but with more interaction options.
 *
 * Features:
 * - Removable (with X button)
 * - Clickable
 * - Avatar/icon support
 * - Multiple color variants
 * - Size variants
 *
 * Perfect for: Tags, filters, multi-select, contact lists
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';
import { X } from 'lucide-react';

// ═══════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════

const chipVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full font-medium transition-colors',
  {
    variants: {
      variant: {
        default: 'bg-surface-subtle text-text-primary border border-border-base',
        primary: 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20',
        success: 'bg-status-success/10 text-status-success border border-status-success/20',
        warning: 'bg-status-warning/10 text-status-warning border border-status-warning/20',
        error: 'bg-status-error/10 text-status-error border border-status-error/20',
        outlined: 'bg-transparent text-text-primary border-2 border-border-base',
      },
      size: {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-1.5 text-base',
      },
      clickable: {
        true: 'cursor-pointer hover:opacity-80 active:scale-95',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      clickable: false,
    },
  }
);

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface ChipProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'>,
    VariantProps<typeof chipVariants> {
  label: string;
  avatar?: React.ReactNode;
  icon?: React.ReactNode;
  onRemove?: () => void;
  onClick?: () => void;
  disabled?: boolean;
}

export const Chip = React.forwardRef<HTMLDivElement, ChipProps>(
  (
    {
      label,
      avatar,
      icon,
      onRemove,
      onClick,
      disabled,
      variant,
      size,
      clickable,
      className,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable || !!onClick;

    return (
      <div
        ref={ref}
        className={cn(
          chipVariants({ variant, size, clickable: isClickable && !disabled }),
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
        onClick={disabled ? undefined : onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick && !disabled ? 0 : undefined}
        {...props}
      >
        {avatar && <div className="flex-shrink-0">{avatar}</div>}
        {icon && <div className="flex-shrink-0 text-current">{icon}</div>}
        <span className="truncate">{label}</span>
        {onRemove && !disabled && (
          <button
            type="button"
            className="flex-shrink-0 rounded-full hover:bg-black/10 dark:hover:bg-white/10 p-0.5 transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label="Remove"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    );
  }
);

Chip.displayName = 'Chip';

// ═══════════════════════════════════════════════════════════════
// CHIP GROUP
// ═══════════════════════════════════════════════════════════════

export interface ChipGroupProps {
  children: React.ReactNode;
  spacing?: 'sm' | 'md' | 'lg';
  wrap?: boolean;
  className?: string;
}

export const ChipGroup: React.FC<ChipGroupProps> = ({
  children,
  spacing = 'md',
  wrap = true,
  className,
}) => {
  return (
    <div
      className={cn(
        'flex items-center',
        wrap && 'flex-wrap',
        spacing === 'sm' && 'gap-1',
        spacing === 'md' && 'gap-2',
        spacing === 'lg' && 'gap-3',
        className
      )}
    >
      {children}
    </div>
  );
};

ChipGroup.displayName = 'ChipGroup';
