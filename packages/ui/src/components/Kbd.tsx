/**
 * Kbd - Keyboard key display
 *
 * Display keyboard shortcuts and keys with proper styling.
 *
 * Features:
 * - Platform-aware (Cmd vs Ctrl)
 * - Size variants
 * - Multiple keys in sequence
 * - Modifier key formatting
 *
 * Perfect for: Keyboard shortcuts, documentation, hotkey hints
 */

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

// ═══════════════════════════════════════════════════════════════
// VARIANTS
// ═══════════════════════════════════════════════════════════════

const kbdVariants = cva(
  'inline-flex items-center justify-center font-mono font-medium rounded border border-border-base bg-surface-elevated shadow-sm',
  {
    variants: {
      size: {
        sm: 'px-1.5 py-0.5 text-xs min-w-[20px]',
        md: 'px-2 py-1 text-sm min-w-[24px]',
        lg: 'px-2.5 py-1.5 text-base min-w-[28px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  }
);

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export interface KbdProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof kbdVariants> {
  keys?: string | string[];
  separator?: React.ReactNode;
  platform?: 'mac' | 'windows' | 'auto';
}

export const Kbd = React.forwardRef<HTMLElement, KbdProps>(
  ({ keys, separator, platform = 'auto', size, className, children, ...props }, ref) => {
    const isMac = React.useMemo(() => {
      if (platform === 'auto') {
        if (typeof window !== 'undefined') {
          return /Mac|iPhone|iPad|iPod/.test(window.navigator.userAgent);
        }
        return false;
      }
      return platform === 'mac';
    }, [platform]);

    const formatKey = (key: string): string => {
      const keyMap: Record<string, string> = {
        // Modifier keys
        cmd: isMac ? '⌘' : 'Ctrl',
        command: isMac ? '⌘' : 'Ctrl',
        ctrl: isMac ? '⌃' : 'Ctrl',
        control: isMac ? '⌃' : 'Ctrl',
        alt: isMac ? '⌥' : 'Alt',
        option: isMac ? '⌥' : 'Alt',
        shift: isMac ? '⇧' : 'Shift',
        meta: isMac ? '⌘' : 'Win',

        // Navigation
        enter: '↵',
        return: '↵',
        backspace: '⌫',
        delete: isMac ? '⌦' : 'Del',
        esc: 'Esc',
        escape: 'Esc',
        tab: '⇥',
        space: '␣',
        spacebar: '␣',

        // Arrows
        up: '↑',
        down: '↓',
        left: '←',
        right: '→',
        arrowup: '↑',
        arrowdown: '↓',
        arrowleft: '←',
        arrowright: '→',
      };

      return keyMap[key.toLowerCase()] || key;
    };

    const renderKeys = () => {
      if (children) {
        return children;
      }

      if (!keys) {
        return null;
      }

      const keyArray = Array.isArray(keys) ? keys : [keys];
      const defaultSeparator = <span className="mx-1 text-text-tertiary">+</span>;

      return keyArray.map((key, index) => (
        <React.Fragment key={index}>
          {index > 0 && (separator !== undefined ? separator : defaultSeparator)}
          <kbd className={cn(kbdVariants({ size }), className)} {...props}>
            {formatKey(key)}
          </kbd>
        </React.Fragment>
      ));
    };

    if (children || !keys) {
      return (
        <kbd ref={ref} className={cn(kbdVariants({ size }), className)} {...props}>
          {children}
        </kbd>
      );
    }

    return <span ref={ref as any}>{renderKeys()}</span>;
  }
);

Kbd.displayName = 'Kbd';
