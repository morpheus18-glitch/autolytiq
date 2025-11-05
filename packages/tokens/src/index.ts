/**
 * AutolytiQ Design System v2.0
 * Premium enterprise design tokens with ultra-crisp typography
 *
 * Philosophy:
 * - Clarity over decoration
 * - Consistency over creativity
 * - Premium feel with sophisticated dark mode
 * - Ultra-crisp text rendering with optimal contrast
 */

export const designTokens = {
  // ═════════════════════════════════════════════════════════════════════════
  // COLORS - Premium, Sophisticated Palette
  // ═════════════════════════════════════════════════════════════════════════

  colors: {
    // Primary: Luminous electric blue inspired by automotive digital cockpits
    primary: {
      50: '#EDF8FF',
      100: '#D6EFFF',
      200: '#B6E3FF',
      300: '#84D3FF',
      400: '#4AB9FF',
      500: '#2196F3',
      600: '#0277BD',
      700: '#01579B',
      800: '#014A82',
      900: '#013E6D',
      950: '#00274A',
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

    // Neutrals: Warm grays with optimal contrast for both light and dark modes
    neutral: {
      0: '#FFFFFF',
      50: '#F8FAFC',    // Softer white for light mode backgrounds
      100: '#F1F5F9',   // Light gray for subtle surfaces
      200: '#E2E8F0',   // Borders in light mode
      300: '#CBD5E1',   // Muted text in light mode
      400: '#94A3B8',   // Secondary text
      500: '#64748B',   // Tertiary text
      600: '#475569',   // Dark gray
      700: '#334155',   // Darker text
      800: '#1E293B',   // Very dark gray for text on light
      900: '#0F172A',   // Near black but not pure black
      950: '#020617',   // Deepest shade
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

    // Automotive accents for storytelling moments
    automotive: {
      gold: '#F5C453',
      steel: '#8B96A5',
      racing: '#F22F46',
      electric: '#00D4AA',
      midnight: '#0D1117',
    },
  },

  // Brand gradients and glows for premium surfaces
  gradients: {
    brand: 'linear-gradient(135deg, #2196F3 0%, #8B5CF6 55%, #F59E0B 100%)',
    aurora: 'linear-gradient(145deg, rgba(33,150,243,0.85), rgba(139,92,246,0.85))',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.75))',
    depth: 'radial-gradient(circle at top, rgba(33,150,243,0.15), rgba(13,17,23,0.95))',
  },

  // Surface colors for sophisticated layering
  surface: {
    light: {
      base: '#F8FAFC',              // Main background - soft white
      elevated: '#FFFFFF',          // Cards and modals - pure white with shadow
      subtle: '#F1F5F9',            // Subtle backgrounds
      hover: '#E2E8F0',             // Hover states
      outline: 'rgba(100, 116, 139, 0.24)',
      glow: 'rgba(33, 150, 243, 0.35)',
    },
    dark: {
      base: '#0D1117',              // Main background - GitHub dark inspired
      elevated: '#161B22',          // Cards - slightly lighter
      subtle: '#1F2937',            // Subtle backgrounds
      hover: '#374151',             // Hover states
      outline: 'rgba(148, 163, 184, 0.18)',
      glow: 'rgba(139, 92, 246, 0.32)',
    },
  },

  // Text colors optimized for readability
  text: {
    light: {
      primary: '#0F172A',           // Main text - near black
      secondary: '#475569',         // Secondary text
      tertiary: '#64748B',          // Muted text
      disabled: '#94A3B8',          // Disabled text
      inverse: '#FFFFFF',           // Text on dark backgrounds
    },
    dark: {
      primary: '#F1F5F9',           // Main text - soft white, not harsh
      secondary: '#CBD5E1',         // Secondary text
      tertiary: '#94A3B8',          // Muted text
      disabled: '#64748B',          // Disabled text
      inverse: '#0F172A',           // Text on light backgrounds
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // TYPOGRAPHY - Ultra-Crisp, Premium Text Rendering
  // ═════════════════════════════════════════════════════════════════════════

  typography: {
    fontFamily: {
      sans: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      mono: '"JetBrains Mono", "SF Mono", "Fira Code", Consolas, Monaco, monospace',
      display: '"Cal Sans", "Inter", system-ui, sans-serif',
    },

    fontSize: {
      xs: '0.6875rem',     // 11px - tiny labels
      sm: '0.8125rem',     // 13px - small text, better for density
      base: '0.9375rem',   // 15px - body text, crisp at any DPI
      lg: '1.0625rem',     // 17px - emphasized text
      xl: '1.1875rem',     // 19px - large text
      '2xl': '1.375rem',   // 22px - headings
      '3xl': '1.75rem',    // 28px - large headings
      '4xl': '2.125rem',   // 34px - hero text
      '5xl': '2.75rem',    // 44px - display
      '6xl': '3.5rem',     // 56px - hero display
    },

    fontWeight: {
      light: '300',
      normal: '400',
      medium: '500',
      semibold: '600',
      bold: '700',
      extrabold: '800',
    },

    lineHeight: {
      none: '1',
      tight: '1.25',
      snug: '1.4',
      normal: '1.5',
      relaxed: '1.6',
      loose: '1.75',
    },

    letterSpacing: {
      tighter: '-0.04em',
      tight: '-0.02em',
      normal: '0',
      wide: '0.02em',
      wider: '0.04em',
      widest: '0.08em',
    },

    // Text rendering optimizations for crisp display
    rendering: {
      // Use for body text - smooth rendering
      smooth: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'optimizeLegibility',
      },
      // Use for UI labels and buttons - geometric rendering
      geometric: {
        WebkitFontSmoothing: 'antialiased',
        MozOsxFontSmoothing: 'grayscale',
        textRendering: 'geometricPrecision',
      },
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SPACING - Consistent, Breathing Room with Finer Increments
  // ═════════════════════════════════════════════════════════════════════════

  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',     // 2px
    1: '0.25rem',        // 4px
    1.5: '0.375rem',     // 6px
    2: '0.5rem',         // 8px
    2.5: '0.625rem',     // 10px
    3: '0.75rem',        // 12px
    3.5: '0.875rem',     // 14px
    4: '1rem',           // 16px
    5: '1.25rem',        // 20px
    6: '1.5rem',         // 24px
    7: '1.75rem',        // 28px
    8: '2rem',           // 32px
    9: '2.25rem',        // 36px
    10: '2.5rem',        // 40px
    11: '2.75rem',       // 44px
    12: '3rem',          // 48px
    14: '3.5rem',        // 56px
    16: '4rem',          // 64px
    20: '5rem',          // 80px
    24: '6rem',          // 96px
    32: '8rem',          // 128px
  },

  // ═════════════════════════════════════════════════════════════════════════
  // SHADOWS - Sophisticated Elevation with Natural Depth
  // ═════════════════════════════════════════════════════════════════════════

  shadows: {
    none: 'none',
    // Subtle elevation for cards in light mode
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
    base: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
    md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
    lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
    xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    '2xl': '0 35px 60px -15px rgba(0, 0, 0, 0.3)',
    // Inner shadow for input fields
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    // Premium glow for focus states
    glow: '0 0 0 3px rgba(33, 150, 243, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    glowPurple: '0 0 0 3px rgba(139, 92, 246, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    // Dark mode shadows - more subtle
    dark: {
      xs: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
      sm: '0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)',
      base: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
      md: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)',
      lg: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)',
      xl: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
      glow: '0 0 0 3px rgba(33, 150, 243, 0.25), 0 1px 3px 0 rgba(0, 0, 0, 0.5)',
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // BORDERS - Clean Lines with Premium Feel
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
      sm: '0.25rem',       // 4px
      base: '0.375rem',    // 6px - slightly rounder for premium feel
      md: '0.5rem',        // 8px
      lg: '0.75rem',       // 12px
      xl: '1rem',          // 16px
      '2xl': '1.5rem',     // 24px
      '3xl': '2rem',       // 32px
      full: '9999px',
    },
    color: {
      light: {
        subtle: 'rgba(226, 232, 240, 0.5)',
        base: 'rgba(203, 213, 225, 0.7)',
        strong: 'rgba(148, 163, 184, 0.9)',
      },
      dark: {
        subtle: 'rgba(55, 65, 81, 0.5)',
        base: 'rgba(75, 85, 99, 0.7)',
        strong: 'rgba(107, 114, 128, 0.9)',
      },
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // LAYOUT - Grid & Containers with Optimal Density
  // ═════════════════════════════════════════════════════════════════════════

  layout: {
    maxWidth: {
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
      '3xl': '1920px',
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
      width: '280px',
      widthCollapsed: '72px',
    },
    header: {
      height: '56px',        // Slightly shorter for more content
    },
  },

  // ═════════════════════════════════════════════════════════════════════════
  // ANIMATION - Subtle, Professional, Buttery Smooth
  // ═════════════════════════════════════════════════════════════════════════

  animation: {
    duration: {
      instant: '50ms',
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
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
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

// ═════════════════════════════════════════════════════════════════════════
// THEME SYSTEM
// ═════════════════════════════════════════════════════════════════════════

export type ThemeName = 'light' | 'dark' | 'high-contrast' | 'automotive';

export interface ThemeConfig {
  name: ThemeName;
  displayName: string;
  description: string;
}

export const themes: Record<ThemeName, ThemeConfig> = {
  light: {
    name: 'light',
    displayName: 'Light',
    description: 'Clean and bright theme for daytime use',
  },
  dark: {
    name: 'dark',
    displayName: 'Dark',
    description: 'Comfortable premium dark theme with softer contrast',
  },
  'high-contrast': {
    name: 'high-contrast',
    displayName: 'High Contrast',
    description: 'Enhanced contrast for accessibility',
  },
  automotive: {
    name: 'automotive',
    displayName: 'Automotive Pro',
    description: 'Premium automotive-inspired dark theme',
  },
};

/**
 * Set the active theme by updating the data-theme attribute
 */
export function setTheme(theme: ThemeName): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);

  // Store preference
  try {
    localStorage.setItem('autolytiq-theme', theme);
  } catch (e) {
    // localStorage might not be available
  }
}

/**
 * Get the currently active theme
 */
export function getTheme(): ThemeName {
  if (typeof document === 'undefined') return 'light';

  const stored = typeof localStorage !== 'undefined'
    ? localStorage.getItem('autolytiq-theme')
    : null;

  if (stored && stored in themes) {
    return stored as ThemeName;
  }

  const attribute = document.documentElement.getAttribute('data-theme');
  if (attribute && attribute in themes) {
    return attribute as ThemeName;
  }

  // Check system preference
  if (typeof window !== 'undefined' && window.matchMedia) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }

  return 'light';
}

/**
 * Initialize theme from localStorage or system preference
 */
export function initTheme(): void {
  if (typeof document === 'undefined') return;

  const theme = getTheme();
  setTheme(theme);
}

/**
 * Listen for system theme changes
 */
export function watchSystemTheme(callback: (theme: ThemeName) => void): () => void {
  if (typeof window === 'undefined' || !window.matchMedia) {
    return () => {};
  }

  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  const handler = (e: MediaQueryListEvent | MediaQueryList) => {
    const theme = e.matches ? 'dark' : 'light';
    callback(theme);
  };

  // Modern API
  if (mediaQuery.addEventListener) {
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }

  // Legacy API
  mediaQuery.addListener(handler);
  return () => mediaQuery.removeListener(handler);
}

/**
 * Get all available themes
 */
export function getAvailableThemes(): ThemeConfig[] {
  return Object.values(themes);
}

/**
 * Check if a theme name is valid
 */
export function isValidTheme(theme: string): theme is ThemeName {
  return theme in themes;
}
