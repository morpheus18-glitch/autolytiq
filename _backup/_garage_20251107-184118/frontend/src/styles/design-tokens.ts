/**
 * AutolytiQ Design Token System
 * Advanced, highly customizable design tokens for consistent theming
 */

export const designTokens = {
  // Color System
  colors: {
    // Brand colors
    brand: {
      primary: 'hsl(199, 89%, 48%)', // Aurora Blue
      secondary: 'hsl(258, 90%, 66%)', // Ultraviolet
      accent: 'hsl(25, 95%, 53%)', // Ember Orange

      // Primary variations
      primaryLight: 'hsl(199, 89%, 58%)',
      primaryDark: 'hsl(199, 89%, 38%)',
      primarySubtle: 'hsl(199, 70%, 95%)',

      // Secondary variations
      secondaryLight: 'hsl(258, 90%, 76%)',
      secondaryDark: 'hsl(258, 90%, 56%)',
      secondarySubtle: 'hsl(258, 70%, 95%)',

      // Accent variations
      accentLight: 'hsl(25, 95%, 63%)',
      accentDark: 'hsl(25, 95%, 43%)',
      accentSubtle: 'hsl(25, 70%, 95%)',
    },

    // Semantic colors
    semantic: {
      success: 'hsl(142, 71%, 45%)',
      successLight: 'hsl(142, 71%, 55%)',
      successSubtle: 'hsl(142, 71%, 95%)',

      error: 'hsl(0, 91%, 71%)',
      errorLight: 'hsl(0, 91%, 81%)',
      errorSubtle: 'hsl(0, 70%, 95%)',

      warning: 'hsl(38, 92%, 50%)',
      warningLight: 'hsl(38, 92%, 60%)',
      warningSubtle: 'hsl(38, 70%, 95%)',

      info: 'hsl(199, 89%, 48%)',
      infoLight: 'hsl(199, 89%, 58%)',
      infoSubtle: 'hsl(199, 70%, 95%)',
    },

    // Neutral palette
    neutral: {
      50: 'hsl(217, 42%, 98%)',
      100: 'hsl(217, 42%, 94%)',
      200: 'hsl(217, 34%, 88%)',
      300: 'hsl(215, 24%, 76%)',
      400: 'hsl(215, 16%, 51%)',
      500: 'hsl(215, 24%, 36%)',
      600: 'hsl(215, 24%, 26%)',
      700: 'hsl(215, 28%, 19%)',
      800: 'hsl(222, 47%, 12%)',
      900: 'hsl(222, 47%, 8%)',
      950: 'hsl(220, 46%, 5%)',
    },

    // Surface colors
    surface: {
      base: 'hsl(0, 0%, 100%)',
      elevated: 'hsl(0, 0%, 100%)',
      overlay: 'hsla(0, 0%, 100%, 0.95)',

      // Dark mode surfaces
      baseDark: 'hsl(220, 46%, 5%)',
      elevatedDark: 'hsl(222, 47%, 12%)',
      overlayDark: 'hsla(222, 47%, 12%, 0.95)',
    },

    // Text colors
    text: {
      primary: 'hsl(222, 47%, 11%)',
      secondary: 'hsl(215, 24%, 36%)',
      tertiary: 'hsl(215, 16%, 51%)',
      disabled: 'hsl(215, 24%, 76%)',
      inverse: 'hsl(0, 0%, 100%)',

      // Dark mode
      primaryDark: 'hsl(214, 47%, 97%)',
      secondaryDark: 'hsl(217, 42%, 94%)',
      tertiaryDark: 'hsl(215, 24%, 76%)',
      disabledDark: 'hsl(215, 24%, 36%)',
    },
  },

  // Typography System
  typography: {
    fontFamily: {
      sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      base: '1rem',       // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px
      '7xl': '4.5rem',    // 72px
    },

    fontWeight: {
      light: '300',
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

  // Spacing System (8px base)
  spacing: {
    0: '0',
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    11: '2.75rem',    // 44px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  // Border Radius System
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    base: '0.25rem',  // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Shadow System
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    base: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',

    // Brand shadows
    brand: '0 10px 25px -10px hsl(199 89% 48% / 0.4), 0 4px 12px -4px hsl(258 90% 66% / 0.3)',
    brandHover: '0 14px 32px -12px hsl(199 89% 48% / 0.5), 0 6px 16px -6px hsl(258 90% 66% / 0.4)',

    // Glass effect
    glass: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    glassInset: 'inset 0 1px 0 rgba(255, 255, 255, 0.3)',
  },

  // Elevation/Z-index System
  elevation: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
    notification: 1700,
  },

  // Transition System
  transitions: {
    duration: {
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },

    timing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    },
  },

  // Blur Effects
  blur: {
    none: '0',
    sm: '4px',
    base: '8px',
    md: '12px',
    lg: '16px',
    xl: '24px',
    '2xl': '40px',
    '3xl': '64px',
  },

  // Opacity Scale
  opacity: {
    0: '0',
    5: '0.05',
    10: '0.1',
    20: '0.2',
    25: '0.25',
    30: '0.3',
    40: '0.4',
    50: '0.5',
    60: '0.6',
    70: '0.7',
    75: '0.75',
    80: '0.8',
    90: '0.9',
    95: '0.95',
    100: '1',
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',
        base: '2.5rem',
        lg: '3rem',
        xl: '3.5rem',
      },
      padding: {
        sm: '0.5rem 1rem',
        base: '0.75rem 1.5rem',
        lg: '1rem 2rem',
        xl: '1.25rem 2.5rem',
      },
    },

    input: {
      height: {
        sm: '2rem',
        base: '2.5rem',
        lg: '3rem',
      },
      padding: {
        sm: '0.5rem 0.75rem',
        base: '0.75rem 1rem',
        lg: '1rem 1.25rem',
      },
    },

    card: {
      padding: {
        sm: '1rem',
        base: '1.5rem',
        lg: '2rem',
        xl: '2.5rem',
      },
      borderRadius: '1rem',
    },
  },
} as const;

export type DesignTokens = typeof designTokens;

// Helper function to get nested token values
export function getToken<T>(path: string, fallback?: T): T | string {
  const keys = path.split('.');
  let value: any = designTokens;

  for (const key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return fallback as T;
    }
  }

  return value;
}
