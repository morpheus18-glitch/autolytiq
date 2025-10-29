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
    // Primary: Luminous electric blue inspired by automotive digital cockpits
    primary: {
      50: '#E6F6FF',
      100: '#C8EAFF',
      200: '#9AD9FF',
      300: '#5BC0FF',
      400: '#26A5FA',
      500: '#0EA5E9',
      600: '#0284C7',
      700: '#0369A1',
      800: '#075985',
      900: '#0C4A6E',
      950: '#082F49',
    },

    // Secondary: Vibrant ultraviolet for depth and premium contrast
    secondary: {
      50: '#F5F3FF',
      100: '#EDE9FE',
      200: '#DDD6FE',
      300: '#C4B5FD',
      400: '#A78BFA',
      500: '#8B5CF6',
      600: '#7C3AED',
      700: '#6D28D9',
      800: '#5B21B6',
      900: '#4C1D95',
      950: '#2E1065',
    },

    // Neutrals: Cool gray neutrals with subtle blue undertones for HDR contrast
    neutral: {
      0: '#FFFFFF',
      50: '#F4F7FB',
      100: '#E9EEF6',
      200: '#D6DEEB',
      300: '#B9C4D5',
      400: '#94A5BC',
      500: '#6E7F96',
      600: '#51607A',
      700: '#3A475B',
      800: '#252F3D',
      900: '#0F172A',
      950: '#070B13',
    },

    // Semantic Colors (status indicators)
    success: {
      50: '#ECFDF5',
      100: '#D1FAE5',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      900: '#14532D',
    },

    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      500: '#F87171',
      600: '#EF4444',
      700: '#DC2626',
      900: '#7F1D1D',
    },

    warning: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      500: '#F97316',
      600: '#EA580C',
      700: '#C2410C',
      900: '#7C2D12',
    },

    info: {
      50: '#E8F5FF',
      100: '#CCE8FF',
      500: '#38BDF8',
      600: '#0EA5E9',
      700: '#0284C7',
      900: '#0F4C75',
    },

    // Automotive accents for storytelling moments
    automotive: {
      gold: '#F5C453',
      steel: '#718196',
      racing: '#F22F46',
      electric: '#00D4AA',
      midnight: '#101733',
    },
  },

  // Brand gradients and glows for premium surfaces
  gradients: {
    brand: 'linear-gradient(135deg, #0EA5E9 0%, #8B5CF6 55%, #F97316 100%)',
    aurora: 'linear-gradient(145deg, rgba(14,165,233,0.85), rgba(139,92,246,0.85))',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.82), rgba(244,247,251,0.66))',
    depth: 'radial-gradient(circle at top, rgba(14,165,233,0.18), rgba(17,24,39,0.92))',
  },

  surface: {
    light: {
      base: '#F4F7FB',
      elevated: '#FFFFFF',
      subtle: '#E9EEF6',
      outline: 'rgba(148, 165, 188, 0.35)',
      glow: 'rgba(14, 165, 233, 0.35)',
    },
    dark: {
      base: '#050914',
      elevated: 'rgba(15, 23, 42, 0.92)',
      subtle: 'rgba(37, 47, 61, 0.68)',
      outline: 'rgba(100, 116, 139, 0.35)',
      glow: 'rgba(139, 92, 246, 0.35)',
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
    sm: '0 1px 2px 0 rgb(15 23 42 / 0.05)',
    base: '0 1px 3px 0 rgb(15 23 42 / 0.12), 0 1px 2px -1px rgb(15 23 42 / 0.08)',
    md: '0 8px 16px -6px rgb(15 23 42 / 0.14), 0 4px 8px -4px rgb(15 23 42 / 0.12)',
    lg: '0 16px 32px -12px rgb(8 47 73 / 0.22), 0 6px 14px -4px rgb(15 23 42 / 0.14)',
    xl: '0 24px 48px -20px rgb(8 47 73 / 0.25), 0 8px 24px -8px rgb(76 29 149 / 0.2)',
    '2xl': '0 35px 65px -25px rgb(8 47 73 / 0.3), 0 20px 35px -15px rgb(15 23 42 / 0.28)',
    inner: 'inset 0 2px 6px 0 rgb(255 255 255 / 0.12)',
    glow: '0 0 0 1px rgba(14,165,233,0.45), 0 18px 35px -15px rgba(139,92,246,0.45)',
    'pixel-emboss': '0 0 0 1px rgba(8,47,73,0.45), 0 6px 0 0 rgba(8,47,73,0.35), inset 0 1px 0 0 rgba(255,255,255,0.6)',
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
      light: 'rgba(213, 221, 233, 0.9)',
      base: 'rgba(148, 165, 188, 0.65)',
      dark: 'rgba(82, 96, 122, 0.75)',
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
