/**
 * AutolytiQ Design System
 * Enterprise-grade design tokens inspired by ChatGPT, GitHub, RouteOne
 *
 * Philosophy:
 * - Clarity over decoration
 * - Consistency over creativity
 * - Data density with breathing room
 * - Professional, trustworthy, premium
 */

export const designTokens = {
  // ═════════════════════════════════════════════════════════════════════════
  // COLORS - Professional, Sophisticated Palette
  // ═════════════════════════════════════════════════════════════════════════

  colors: {
    // Primary: Professional Blue (trust, automotive industry standard)
    // Inspired by LinkedIn, Microsoft, Chase
    primary: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      200: '#BFDBFE',
      300: '#93C5FD',
      400: '#60A5FA',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      800: '#1E40AF',
      900: '#1E3A8A',
      950: '#172554',
    },

    // Secondary: Sophisticated Slate (professional gray-blue)
    secondary: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
      950: '#020617',
    },

    // Neutrals: Pure grays for text and backgrounds
    neutral: {
      0: '#FFFFFF',
      50: '#FAFAFA',
      100: '#F5F5F5',
      200: '#E5E5E5',
      300: '#D4D4D4',
      400: '#A3A3A3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
      950: '#0A0A0A',
    },

    // Semantic Colors (status indicators)
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      900: '#14532D',
    },

    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      900: '#7F1D1D',
    },

    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      900: '#78350F',
    },

    info: {
      50: '#EFF6FF',
      100: '#DBEAFE',
      500: '#3B82F6',
      600: '#2563EB',
      700: '#1D4ED8',
      900: '#1E3A8A',
    },

    // Automotive Specific (optional accents)
    automotive: {
      gold: '#D4AF37',
      steel: '#71797E',
      racing: '#DC0000',
      electric: '#00D4AA',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TYPOGRAPHY - Crisp, Readable, Professional
  // ═════════════════════════════════════════════════════════════════════════

  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", "Fira Code", Consolas, Monaco, "Courier New", monospace',
      display: '"Cal Sans", "Inter", system-ui, sans-serif',
    },

    fontSize: {
      xs: '0.75rem',
      sm: '0.875rem',
      base: '1rem',
      lg: '1.125rem',
      xl: '1.25rem',
      '2xl': '1.5rem',
      '3xl': '1.875rem',
      '4xl': '2.25rem',
      '5xl': '3rem',
      '6xl': '3.75rem',
    },

    fontWeight: {
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.375',
      normal: '1.5',
      relaxed: '1.625',
      loose: '2',
    },

    letterSpacing: {
      tighter: '-0.05em',
      tight: '-0.025em',
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
      widest: '0.1em',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SPACING - Consistent, Breathing Room
  // ═════════════════════════════════════════════════════════════════════════

  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',
    1.5: '0.375rem',
    2: '0.5rem',
    2.5: '0.625rem',
    3: '0.75rem',
    3.5: '0.875rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
    9: '2.25rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SHADOWS - Subtle Elevation
  // ═════════════════════════════════════════════════════════════════════════

  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  },

  // ═════════════════════════════════════════════════════════════════════════
  // BORDERS - Clean Lines
  // ═════════════════════════════════════════════════════════════════════════

  borders: {
    width: {
      0: '0',
      1: '1px',
      2: '2px',
      4: '4px',
      8: '8px',
    },
    radius: {
      none: '0',
      sm: '0.25rem',
      base: '0.5rem',
      md: '0.75rem',
      lg: '1rem',
      xl: '1.5rem',
      '2xl': '2rem',
      full: '9999px',
    },
    color: {
      light: 'rgb(229 231 235)',
      base: 'rgb(209 213 219)',
      dark: 'rgb(156 163 175)',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LAYOUT - Grid & Containers
  // ═════════════════════════════════════════════════════════════════════════

  layout: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      full: '100%',
    },
    container: {
      padding: {
        mobile: '1rem',
        tablet: '1.5rem',
        desktop: '2rem',
      },
    },
    sidebar: {
      width: '256px',
      widthCollapsed: '64px',
    },
    header: {
      height: '64px',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ANIMATION - Subtle, Professional
  // ═════════════════════════════════════════════════════════════════════════

  animation: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // Z-INDEX - Layering System
  // ═════════════════════════════════════════════════════════════════════════

  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    backdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    toast: 1080,
  },
} as const;

// ═════════════════════════════════════════════════════════════════════════
// HELPER FUNCTIONS
// ═════════════════════════════════════════════════════════════════════════

const HEX_REGEX = /^#?([a-f\d]{3}|[a-f\d]{6})$/i;

const expandHex = (hex: string): string => {
  const normalized = hex.startsWith('#') ? hex.slice(1) : hex;
  if (normalized.length === 3) {
    return normalized
      .split('')
      .map((char) => char + char)
      .join('');
  }
  return normalized.padEnd(6, '0');
};

/**
 * Get color with opacity
 */
export function colorWithOpacity(color: string, opacity: number): string {
  if (!HEX_REGEX.test(color)) {
    throw new Error(`colorWithOpacity expects a hex color value. Received: ${color}`);
  }

  const expanded = expandHex(color);
  const bigint = parseInt(expanded, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  const clampedOpacity = Math.min(1, Math.max(0, opacity));
  return `rgba(${r}, ${g}, ${b}, ${clampedOpacity})`;
}

/**
 * Responsive spacing helper
 */
export function responsiveSpacing(mobile: string, desktop: string) {
  return {
    base: designTokens.spacing[mobile as keyof typeof designTokens.spacing],
    md: designTokens.spacing[desktop as keyof typeof designTokens.spacing],
  };
}

// Export type for TypeScript autocomplete
export type DesignTokens = typeof designTokens;
