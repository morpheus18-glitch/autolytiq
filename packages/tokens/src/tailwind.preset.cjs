/**
 * @autolytiq/tokens - Tailwind CSS Preset
 *
 * This preset provides the complete design token system for Autolytiq.
 * Import colors from the new color system.
 */

const { colors, semanticColors } = require('./colors-new.ts');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  theme: {
    extend: {
      colors: {
        // ═══════════════════════════════════════════════════════════════
        // PRIMITIVE COLORS (direct access)
        // ═══════════════════════════════════════════════════════════════
        neutral: colors.neutral,
        accent: colors.accent,
        blue: colors.blue,
        success: colors.success,
        error: colors.error,
        warning: colors.warning,
        info: colors.info,

        // ═══════════════════════════════════════════════════════════════
        // SEMANTIC COLORS (theme-aware - use these in components)
        // ═══════════════════════════════════════════════════════════════
        // Backgrounds
        'surface-base': 'var(--color-surface-base)',
        'surface-elevated': 'var(--color-surface-elevated)',
        'surface-inset': 'var(--color-surface-inset)',
        'surface-subtle': 'var(--color-surface-subtle)',
        'surface-muted': 'var(--color-surface-muted)',

        // Borders
        'border-base': 'var(--color-border-base)',
        'border-muted': 'var(--color-border-muted)',
        'border-strong': 'var(--color-border-strong)',

        // Text
        'text-primary': 'var(--color-text-primary)',
        'text-secondary': 'var(--color-text-secondary)',
        'text-tertiary': 'var(--color-text-tertiary)',
        'text-placeholder': 'var(--color-text-placeholder)',
        'text-inverse': 'var(--color-text-inverse)',

        // Actions
        'accent-primary': 'var(--color-accent-primary)',
        'accent-primary-hover': 'var(--color-accent-primary-hover)',
        'accent-primary-active': 'var(--color-accent-primary-active)',
        'accent-secondary': 'var(--color-accent-secondary)',
        'accent-secondary-hover': 'var(--color-accent-secondary-hover)',

        // Links
        'link-base': 'var(--color-link-base)',
        'link-hover': 'var(--color-link-hover)',

        // Status
        'status-success': 'var(--color-status-success)',
        'status-success-bg': 'var(--color-status-success-bg)',
        'status-error': 'var(--color-status-error)',
        'status-error-bg': 'var(--color-status-error-bg)',
        'status-warning': 'var(--color-status-warning)',
        'status-warning-bg': 'var(--color-status-warning-bg)',
        'status-info': 'var(--color-status-info)',
        'status-info-bg': 'var(--color-status-info-bg)',
      },

      // ═══════════════════════════════════════════════════════════════
      // SPACING (8px base grid)
      // ═══════════════════════════════════════════════════════════════
      spacing: {
        0: '0',
        0.5: '2px',  // 0.125rem
        1: '4px',    // 0.25rem
        1.5: '6px',  // 0.375rem
        2: '8px',    // 0.5rem - BASE UNIT
        3: '12px',   // 0.75rem
        4: '16px',   // 1rem
        5: '20px',   // 1.25rem
        6: '24px',   // 1.5rem
        8: '32px',   // 2rem
        10: '40px',  // 2.5rem
        12: '48px',  // 3rem
        16: '64px',  // 4rem
        20: '80px',  // 5rem
        24: '96px',  // 6rem
        32: '128px', // 8rem
      },

      // ═══════════════════════════════════════════════════════════════
      // TYPOGRAPHY
      // ═══════════════════════════════════════════════════════════════
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Roboto',
          '"Helvetica Neue"',
          'Arial',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          '"Fira Code"',
          'Consolas',
          'Monaco',
          '"Courier New"',
          'monospace',
        ],
      },

      fontSize: {
        xs: ['12px', { lineHeight: '16px', letterSpacing: '0' }],
        sm: ['14px', { lineHeight: '20px', letterSpacing: '0' }],
        base: ['16px', { lineHeight: '24px', letterSpacing: '0' }],
        lg: ['18px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        xl: ['20px', { lineHeight: '28px', letterSpacing: '-0.01em' }],
        '2xl': ['24px', { lineHeight: '32px', letterSpacing: '-0.02em' }],
        '3xl': ['30px', { lineHeight: '36px', letterSpacing: '-0.02em' }],
        '4xl': ['36px', { lineHeight: '40px', letterSpacing: '-0.02em' }],
        '5xl': ['48px', { lineHeight: '48px', letterSpacing: '-0.03em' }],
      },

      fontWeight: {
        normal: '400',
        medium: '500',
        semibold: '600',
        bold: '700',
      },

      // ═══════════════════════════════════════════════════════════════
      // BORDER RADIUS
      // ═══════════════════════════════════════════════════════════════
      borderRadius: {
        none: '0',
        sm: '4px',
        DEFAULT: '6px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        full: '9999px',
      },

      // ═══════════════════════════════════════════════════════════════
      // SHADOWS
      // ═══════════════════════════════════════════════════════════════
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        DEFAULT: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        none: 'none',
      },

      // ═══════════════════════════════════════════════════════════════
      // ANIMATIONS
      // ═══════════════════════════════════════════════════════════════
      transitionDuration: {
        fast: '150ms',
        DEFAULT: '200ms',
        slow: '300ms',
      },

      transitionTimingFunction: {
        DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
        'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)',
        elastic: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },

      keyframes: {
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'fade-out': {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        'slide-in-up': {
          from: { transform: 'translateY(10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-down': {
          from: { transform: 'translateY(-10px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-in-left': {
          from: { transform: 'translateX(-10px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'slide-in-right': {
          from: { transform: 'translateX(10px)', opacity: '0' },
          to: { transform: 'translateX(0)', opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.95)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
      },

      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'fade-out': 'fade-out 200ms ease-out',
        'slide-in-up': 'slide-in-up 300ms ease-out',
        'slide-in-down': 'slide-in-down 300ms ease-out',
        'slide-in-left': 'slide-in-left 300ms ease-out',
        'slide-in-right': 'slide-in-right 300ms ease-out',
        'scale-in': 'scale-in 200ms ease-out',
        'spin': 'spin 1s linear infinite',
      },
    },
  },
  plugins: [
    // Custom utility classes
    function ({ addUtilities, addComponents }) {
      // Focus ring utility
      addUtilities({
        '.focus-ring': {
          '@apply focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-surface-base': {},
        },
        '.transition-smooth': {
          '@apply transition-all duration-200 ease-in-out': {},
        },
        '.disabled': {
          '@apply opacity-50 cursor-not-allowed pointer-events-none': {},
        },
      });

      // Common component patterns
      addComponents({
        '.card': {
          '@apply bg-surface-elevated border border-border-base rounded-lg shadow-sm': {},
        },
        '.card-interactive': {
          '@apply card hover:shadow-md transition-smooth cursor-pointer': {},
        },
        '.input-base': {
          '@apply w-full rounded-md border border-border-base bg-surface-base px-3 py-2 text-sm placeholder:text-text-placeholder focus-ring disabled:disabled': {},
        },
      });
    },
  ],
};
