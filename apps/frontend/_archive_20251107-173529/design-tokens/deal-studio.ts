/**
 * Deal Studio Design Tokens
 *
 * Specialized design system for the Autolytiq Deal Studio
 * Distinct from main app - "cockpit" aesthetic
 */

export const dealStudioTokens = {
  // Colors - Deal Studio specific palette
  colors: {
    // Brand
    brand: {
      primary: '#0066FF',      // Autolytiq blue
      secondary: '#7C3AED',    // Purple for AI
      accent: '#10B981',       // Green for profit
      warning: '#F59E0B',      // Yellow for caution
      danger: '#EF4444',       // Red for loss
    },

    // Backgrounds
    background: {
      default: '#FFFFFF',
      muted: '#F8FAFC',
      elevated: '#FFFFFF',
      dark: '#0F172A',
      darkMuted: '#1E293B',
      darkElevated: '#334155',
    },

    // Text
    text: {
      primary: '#0F172A',
      secondary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
      disabled: '#CBD5E1',
    },

    // Semantic - Deal Studio specific
    deal: {
      profitGreen: '#10B981',
      profitYellow: '#F59E0B',
      profitRed: '#EF4444',
      aiPurple: '#7C3AED',
      aiPurpleLight: '#A78BFA',
      paymentBlue: '#0066FF',
      lockedBlue: '#0EA5E9',
      calculating: '#3B82F6',
    },

    // Status badges
    status: {
      excellent: '#10B981',    // 740+ FICO
      good: '#0066FF',         // 670-739 FICO
      fair: '#F59E0B',         // 580-669 FICO
      poor: '#EF4444',         // <580 FICO
    },

    // Panel backgrounds
    panel: {
      dossier: '#F8FAFC',      // Panel 1 - Light muted
      simulator: '#FFFFFF',     // Panel 2 - Clean white
      aiCompanion: '#F5F3FF',  // Panel 3 - Subtle purple tint
    },

    // Card gradients
    gradients: {
      payment: 'from-blue-50 to-purple-50',
      profit: 'from-green-50 to-emerald-50',
      ai: 'from-purple-50 to-pink-50',
      warning: 'from-yellow-50 to-orange-50',
      danger: 'from-red-50 to-pink-50',
    },
  },

  // Spacing - Consistent scale
  spacing: {
    xs: '0.25rem',    // 4px
    sm: '0.5rem',     // 8px
    md: '1rem',       // 16px
    lg: '1.5rem',     // 24px
    xl: '2rem',       // 32px
    '2xl': '3rem',    // 48px
    '3xl': '4rem',    // 64px
    '4xl': '6rem',    // 96px
  },

  // Typography
  typography: {
    fontFamily: {
      body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      mono: "'JetBrains Mono', 'SF Mono', 'Monaco', 'Courier New', monospace",
    },

    fontSize: {
      xs: '0.75rem',      // 12px
      sm: '0.875rem',     // 14px
      md: '1rem',         // 16px
      lg: '1.125rem',     // 18px
      xl: '1.25rem',      // 20px
      '2xl': '1.5rem',    // 24px
      '3xl': '1.875rem',  // 30px
      '4xl': '2.25rem',   // 36px
      '5xl': '3rem',      // 48px
      '6xl': '3.75rem',   // 60px - Payment display
      '7xl': '4.5rem',    // 72px - Hero numbers
      display: '4.5rem',  // 72px
    },

    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      black: 900,
    },

    lineHeight: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.75,
    },
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',    // 4px
    md: '0.5rem',     // 8px
    lg: '0.75rem',    // 12px
    xl: '1rem',       // 16px
    '2xl': '1.5rem',  // 24px
    full: '9999px',   // Pills
  },

  // Shadows
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    glow: '0 0 20px rgba(0, 102, 255, 0.3)',
    glowGreen: '0 0 20px rgba(16, 185, 129, 0.3)',
    glowPurple: '0 0 20px rgba(124, 58, 237, 0.3)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },

  // Transitions
  transitions: {
    fast: '100ms',
    normal: '200ms',
    slow: '300ms',
    smooth: '400ms',
  },

  // Animation curves
  easings: {
    easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
    easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Breakpoints
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    laptop: '1024px',
    desktop: '1280px',
    wide: '1536px',
  },

  // Panel widths (desktop)
  panelWidths: {
    dossier: '25%',         // Panel 1
    dossierCollapsed: '64px',
    simulator: '50%',        // Panel 2
    simulatorExpanded: '75%',
    aiCompanion: '25%',      // Panel 3
    aiCompanionExpanded: '50%',
  },

  // Z-index layers
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    modal: 1200,
    popover: 1300,
    toast: 1400,
    tooltip: 1500,
  },
} as const;

// Export individual token groups for convenience
export const dealColors = dealStudioTokens.colors;
export const dealSpacing = dealStudioTokens.spacing;
export const dealTypography = dealStudioTokens.typography;
export const dealShadows = dealStudioTokens.shadows;
export const dealTransitions = dealStudioTokens.transitions;

// Utility function to get profit color based on amount and thresholds
export function getProfitColor(
  profit: number,
  thresholds: { min: number; target: number }
): string {
  if (profit >= thresholds.target) return dealColors.deal.profitGreen;
  if (profit >= thresholds.min) return dealColors.deal.profitYellow;
  return dealColors.deal.profitRed;
}

// Utility function to get credit score color
export function getCreditScoreColor(score: number): string {
  if (score >= 740) return dealColors.status.excellent;
  if (score >= 670) return dealColors.status.good;
  if (score >= 580) return dealColors.status.fair;
  return dealColors.status.poor;
}

// Utility function to get probability color
export function getProbabilityColor(probability: number): string {
  if (probability >= 0.7) return dealColors.deal.profitGreen;
  if (probability >= 0.5) return dealColors.deal.profitYellow;
  return dealColors.deal.profitRed;
}

export default dealStudioTokens;
