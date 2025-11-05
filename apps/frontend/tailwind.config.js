/** @type {import('tailwindcss').Config} */
const formsPlugin = require('@tailwindcss/forms');
const typographyPlugin = require('@tailwindcss/typography');
const tailwindcssAnimate = require('tailwindcss-animate');

// Import from the built tokens package - use require for CommonJS compatibility
const { colorWithOpacity, designTokens } = require('../../packages/tokens/dist/index.js');

const parseFontStack = (stack) =>
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
  // Semantic colors - use CSS variables for proper dark mode support
  background: 'rgb(var(--background) / <alpha-value>)',
  foreground: 'rgb(var(--foreground) / <alpha-value>)',
  card: {
    DEFAULT: 'rgb(var(--card) / <alpha-value>)',
    foreground: 'rgb(var(--card-foreground) / <alpha-value>)',
  },
  popover: {
    DEFAULT: 'rgb(var(--popover) / <alpha-value>)',
    foreground: 'rgb(var(--popover-foreground) / <alpha-value>)',
  },
  muted: {
    DEFAULT: 'rgb(var(--muted) / <alpha-value>)',
    foreground: 'rgb(var(--muted-foreground) / <alpha-value>)',
  },
  accent: {
    DEFAULT: 'rgb(var(--accent) / <alpha-value>)',
    foreground: 'rgb(var(--accent-foreground) / <alpha-value>)',
  },
  destructive: {
    DEFAULT: 'rgb(var(--destructive) / <alpha-value>)',
    foreground: 'rgb(var(--destructive-foreground) / <alpha-value>)',
  },
  border: 'rgb(var(--border) / <alpha-value>)',
  input: 'rgb(var(--input) / <alpha-value>)',
  ring: 'rgb(var(--ring) / <alpha-value>)',
  surface: {
    base: 'rgb(var(--surface-base) / <alpha-value>)',
    muted: 'rgb(var(--surface-muted) / <alpha-value>)',
    strong: 'rgb(var(--surface-strong) / <alpha-value>)',
    glass: 'var(--surface-glass)',
    highlight: 'rgb(var(--surface-highlight) / <alpha-value>)',
  },
  overlay: {
    backdrop: colorWithOpacity(designTokens.surface.dark.base, 0.7),
    scrim: colorWithOpacity(designTokens.colors.secondary[950], 0.6),
  },
};

module.exports = {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
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
};
