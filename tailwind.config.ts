import type { Config } from "tailwindcss";
import { tokens } from './client/src/config/design-tokens';

const parseFontStack = (stack: string) =>
  stack
    .split(",")
    .map((font) => font.trim())
    .map((font) => font.replace(/^"|"$/g, "").replace(/^'|'$/g, ""));

export default {
  darkMode: ["class"],
  content: ["./client/index.html", "./client/src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    screens: tokens.breakpoints,
    extend: {
      colors: {
        transparent: "transparent",
        current: "currentColor",
        white: "#ffffff",
        black: "#000000",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: tokens.colors.brand.primary,
          foreground: tokens.colors.brand.primaryForeground,
        },
        secondary: {
          DEFAULT: tokens.colors.brand.secondary,
          foreground: tokens.colors.brand.secondaryForeground,
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: tokens.colors.brand.accent,
          foreground: tokens.colors.brand.accentForeground,
        },
        destructive: {
          DEFAULT: tokens.colors.semantic.danger,
          foreground: tokens.colors.semantic.dangerForeground,
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: tokens.colors.brand.primary,
        brand: {
          primary: tokens.colors.brand.primary,
          "primary-foreground": tokens.colors.brand.primaryForeground,
          secondary: tokens.colors.brand.secondary,
          "secondary-foreground": tokens.colors.brand.secondaryForeground,
          accent: tokens.colors.brand.accent,
          "accent-foreground": tokens.colors.brand.accentForeground,
        },
        surface: {
          base: tokens.colors.surface.base,
          muted: tokens.colors.surface.muted,
          strong: tokens.colors.surface.strong,
          glass: tokens.colors.surface.glass,
          dark: tokens.colors.surface.dark,
        },
        semantic: {
          success: tokens.colors.semantic.success,
          "success-foreground": tokens.colors.semantic.successForeground,
          warning: tokens.colors.semantic.warning,
          "warning-foreground": tokens.colors.semantic.warningForeground,
          danger: tokens.colors.semantic.danger,
          "danger-foreground": tokens.colors.semantic.dangerForeground,
          info: tokens.colors.semantic.info,
          "info-foreground": tokens.colors.semantic.infoForeground,
        },
        neutral: tokens.colors.neutral,
        gray: tokens.colors.grayscale,
        chart: tokens.colors.charts,
        sidebar: {
          DEFAULT: tokens.colors.sidebar.background,
          foreground: tokens.colors.sidebar.foreground,
          primary: tokens.colors.sidebar.primary,
          "primary-foreground": tokens.colors.sidebar.primaryForeground,
          accent: tokens.colors.sidebar.accent,
          "accent-foreground": tokens.colors.sidebar.accentForeground,
          border: tokens.colors.sidebar.border,
          ring: tokens.colors.sidebar.ring,
        },
        overlay: {
          backdrop: tokens.colors.overlay.backdrop,
          scrim: tokens.colors.overlay.scrim,
        },
      },
      spacing: tokens.spacing,
      fontFamily: {
        sans: parseFontStack(tokens.typography.fontFamily.sans),
        heading: parseFontStack(tokens.typography.fontFamily.heading),
        mono: parseFontStack(tokens.typography.fontFamily.mono),
      },
      fontWeight: tokens.typography.weight,
      fontSize: Object.fromEntries(
        Object.entries(tokens.typography.sizes).map(([key, value]) => [
          key,
          [value.fontSize, { lineHeight: value.lineHeight }],
        ]),
      ),
      borderRadius: {
        none: tokens.radii.none,
        xs: tokens.radii.xs,
        sm: tokens.radii.sm,
        DEFAULT: tokens.radii.lg,
        md: tokens.radii.md,
        lg: tokens.radii.lg,
        xl: tokens.radii.xl,
        "2xl": tokens.radii["2xl"],
        "3xl": tokens.radii["3xl"],
        full: tokens.radii.full,
      },
      boxShadow: {
        xs: tokens.shadows.xs,
        sm: tokens.shadows.sm,
        md: tokens.shadows.md,
        lg: tokens.shadows.lg,
        xl: tokens.shadows.xl,
        modal: tokens.shadows.modal,
        popover: tokens.shadows.popover,
      },
      zIndex: tokens.zIndex,
      transitionDuration: tokens.transitions.durations,
      transitionTimingFunction: tokens.transitions.timing,
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "slide-up": {
          from: { transform: "translateY(100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "slide-down": {
          from: { transform: "translateY(-100%)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.96)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "slide-up": "slide-up 0.3s var(--slide-easing, ease-out)",
        "slide-down": "slide-down 0.3s var(--slide-easing, ease-out)",
        "fade-in": "fade-in 0.25s ease-out",
        "scale-in": "scale-in 0.25s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate"), require("@tailwindcss/typography")],
} satisfies Config;
