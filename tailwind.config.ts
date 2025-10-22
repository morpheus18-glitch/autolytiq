import type { Config } from 'tailwindcss';
import formsPlugin from '@tailwindcss/forms';
import typographyPlugin from '@tailwindcss/typography';
import tailwindcssAnimate from 'tailwindcss-animate';
import { colorWithOpacity, designTokens } from './client/src/lib/design-tokens';

const parseFontStack = (stack: string) =>
  stack
    .split(',')
    .map((font) => font.trim())
    .map((font) => font.replace(/^"|"$/g, '').replace(/^'|'$/g, ''));

const fontFamily = Object.fromEntries(
  Object.entries(designTokens.typography.fontFamily).map(([key, value]) => [
    key,
    parseFontStack(value),
  ]),
);

const screens = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
};

const colors = {
  primary: designTokens.colors.primary,
  secondary: designTokens.colors.secondary,
  neutral: designTokens.colors.neutral,
  success: designTokens.colors.success,
  error: designTokens.colors.error,
  warning: designTokens.colors.warning,
  info: designTokens.colors.info,
  automotive: designTokens.colors.automotive,
  brand: {
    electric: designTokens.colors.primary[400],
    ultraviolet: designTokens.colors.secondary[500],
    ember: designTokens.colors.warning[500],
    aurora: designTokens.colors.info[500],
  },
  background: designTokens.surface.light.base,
  foreground: designTokens.colors.neutral[900],
  card: {
    DEFAULT: designTokens.surface.light.elevated,
    foreground: designTokens.colors.neutral[900],
  },
  popover: {
    DEFAULT: designTokens.surface.light.elevated,
    foreground: designTokens.colors.neutral[900],
  },
  muted: {
    DEFAULT: designTokens.surface.light.subtle,
    foreground: designTokens.colors.neutral[600],
  },
  accent: {
    DEFAULT: designTokens.colors.secondary[50],
    foreground: designTokens.colors.secondary[700],
  },
  destructive: {
    DEFAULT: designTokens.colors.error[600],
    foreground: designTokens.colors.neutral[0],
  },
  border: designTokens.surface.light.outline,
  input: designTokens.surface.light.outline,
  ring: designTokens.colors.primary[400],
  surface: {
    base: designTokens.surface.light.base,
    muted: designTokens.surface.light.subtle,
    strong: designTokens.surface.light.elevated,
    glass: 'rgba(255, 255, 255, 0.82)',
    highlight: designTokens.surface.light.glow,
    dark: designTokens.surface.dark.base,
  },
  overlay: {
    backdrop: colorWithOpacity(designTokens.surface.dark.base, 0.7),
    scrim: colorWithOpacity(designTokens.colors.secondary[950], 0.6),
  },
};

export default {
  darkMode: ['class'],
  content: ['./client/index.html', './client/src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    screens,
    container: {
      center: true,
      padding: {
        DEFAULT: designTokens.layout.container.padding.desktop,
        sm: designTokens.layout.container.padding.mobile,
        md: designTokens.layout.container.padding.tablet,
        lg: designTokens.layout.container.padding.desktop,
      },
    },
    extend: {
      colors: {
        transparent: 'transparent',
        current: 'currentColor',
        white: '#ffffff',
        black: '#000000',
        ...colors,
      },
      spacing: designTokens.spacing,
      fontFamily,
      fontWeight: designTokens.typography.fontWeight,
      fontSize: designTokens.typography.fontSize,
      lineHeight: designTokens.typography.lineHeight,
      letterSpacing: designTokens.typography.letterSpacing,
      borderRadius: {
        none: designTokens.borders.radius.none,
        xs: designTokens.borders.radius.sm,
        sm: designTokens.borders.radius.sm,
        DEFAULT: designTokens.borders.radius.base,
        md: designTokens.borders.radius.md,
        lg: designTokens.borders.radius.lg,
        xl: designTokens.borders.radius.xl,
        '2xl': designTokens.borders.radius['2xl'],
        full: designTokens.borders.radius.full,
      },
      borderWidth: designTokens.borders.width,
      boxShadow: {
        ...designTokens.shadows,
        brand: designTokens.shadows.glow,
      },
      maxWidth: designTokens.layout.maxWidth,
      zIndex: designTokens.zIndex,
      transitionDuration: designTokens.animation.duration,
      transitionTimingFunction: designTokens.animation.easing,
      backgroundImage: {
        'gradient-brand': designTokens.gradients.brand,
        'gradient-aurora': designTokens.gradients.aurora,
        'gradient-glass': designTokens.gradients.glass,
        'gradient-depth': designTokens.gradients.depth,
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        'scale-in': {
          from: { transform: 'scale(0.96)', opacity: '0' },
          to: { transform: 'scale(1)', opacity: '1' },
        },
        'slide-up': {
          from: { transform: 'translateY(100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        'slide-down': {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.25s ease-out',
        'scale-in': 'scale-in 0.25s ease-out',
        'slide-up': 'slide-up 0.3s var(--slide-easing, ease-out)',
        'slide-down': 'slide-down 0.3s var(--slide-easing, ease-out)',
      },
    },
  },
  plugins: [tailwindcssAnimate, formsPlugin, typographyPlugin],
} satisfies Config;
