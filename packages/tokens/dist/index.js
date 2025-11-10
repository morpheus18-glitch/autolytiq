// src/colors-new.ts
var colors = {
  // ═══════════════════════════════════════════════════════════════
  // NEUTRALS - GitHub/ChatGPT inspired grays
  // ═══════════════════════════════════════════════════════════════
  neutral: {
    // Light mode (GitHub inspired)
    0: "#FFFFFF",
    // Pure white
    50: "#F6F8FA",
    // GitHub elevated bg (light)
    100: "#EAEEF2",
    // Subtle borders
    200: "#D0D7DE",
    // Muted borders
    300: "#AFB8C1",
    // Placeholder text
    400: "#8C959F",
    // Secondary text
    500: "#6E7781",
    // Tertiary text
    600: "#57606A",
    // Body text (light mode)
    700: "#424A53",
    // Headings (light mode)
    800: "#32383F",
    // Strong emphasis
    900: "#24292F",
    // GitHub text (light mode)
    // Dark mode (ChatGPT/GitHub hybrid)
    925: "#1C2128",
    // GitHub dark borders
    950: "#161B22",
    // GitHub dark elevated
    975: "#0D1117"
    // GitHub dark background
  },
  // ═══════════════════════════════════════════════════════════════
  // ACCENT - Teal/Green hybrid (ChatGPT + GitHub)
  // ═══════════════════════════════════════════════════════════════
  accent: {
    50: "#ECFDF5",
    100: "#D1FAE5",
    200: "#A7F3D0",
    300: "#6EE7B7",
    400: "#34D399",
    // ChatGPT teal
    500: "#10B981",
    // Primary action color
    600: "#059669",
    // Hover state
    700: "#047857",
    800: "#065F46",
    900: "#064E3B"
  },
  // ═══════════════════════════════════════════════════════════════
  // BLUE - GitHub blue for links and secondary actions
  // ═══════════════════════════════════════════════════════════════
  blue: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    200: "#BFDBFE",
    300: "#93C5FD",
    400: "#60A5FA",
    500: "#3B82F6",
    // Links
    600: "#2563EB",
    // GitHub blue
    700: "#1D4ED8",
    800: "#1E40AF",
    900: "#1E3A8A"
  },
  // ═══════════════════════════════════════════════════════════════
  // SEMANTIC COLORS
  // ═══════════════════════════════════════════════════════════════
  success: {
    50: "#F0FDF4",
    100: "#DCFCE7",
    500: "#22C55E",
    // GitHub green
    600: "#16A34A",
    700: "#15803D",
    900: "#14532D"
  },
  error: {
    50: "#FEF2F2",
    100: "#FEE2E2",
    500: "#EF4444",
    600: "#DC2626",
    // GitHub red
    700: "#B91C1C",
    900: "#7F1D1D"
  },
  warning: {
    50: "#FFFBEB",
    100: "#FEF3C7",
    500: "#F59E0B",
    600: "#D97706",
    700: "#B45309",
    900: "#78350F"
  },
  info: {
    50: "#EFF6FF",
    100: "#DBEAFE",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8",
    900: "#1E3A8A"
  }
};
var semanticColors = {
  light: {
    // Backgrounds
    canvas: colors.neutral[0],
    // #FFFFFF - Main background
    elevated: colors.neutral[50],
    // #F6F8FA - Cards, panels
    inset: colors.neutral[100],
    // #EAEEF2 - Inset areas
    // Borders
    border: {
      default: colors.neutral[200],
      // #D0D7DE
      muted: colors.neutral[100],
      // #EAEEF2
      strong: colors.neutral[300]
      // #AFB8C1
    },
    // Text
    text: {
      primary: colors.neutral[900],
      // #24292F - Body text
      secondary: colors.neutral[600],
      // #57606A - Secondary
      tertiary: colors.neutral[500],
      // #6E7781 - Tertiary
      placeholder: colors.neutral[400],
      // #8C959F - Placeholders
      inverse: colors.neutral[0]
      // #FFFFFF - On dark bg
    },
    // Interactive
    action: {
      primary: colors.accent[500],
      // #10B981 - Primary actions
      hover: colors.accent[600],
      // #059669 - Hover state
      active: colors.accent[700]
      // #047857 - Active state
    },
    link: {
      default: colors.blue[600],
      // #2563EB - Links
      hover: colors.blue[700]
      // #1D4ED8 - Link hover
    }
  },
  dark: {
    // Backgrounds (ChatGPT/GitHub hybrid)
    canvas: colors.neutral[975],
    // #0D1117 - Main background
    elevated: colors.neutral[950],
    // #161B22 - Cards, panels
    inset: colors.neutral[925],
    // #1C2128 - Inset areas
    // Borders
    border: {
      default: colors.neutral[800],
      // #32383F
      muted: colors.neutral[925],
      // #1C2128
      strong: colors.neutral[700]
      // #424A53
    },
    // Text
    text: {
      primary: "#ECECF1",
      // ChatGPT white (slightly warm)
      secondary: "#C5C5D2",
      // ChatGPT muted
      tertiary: "#9B9BA7",
      // Subtle text
      placeholder: "#6E6E80",
      // Placeholders
      inverse: colors.neutral[900]
      // #24292F - On light bg
    },
    // Interactive
    action: {
      primary: colors.accent[400],
      // #34D399 - Brighter for dark
      hover: colors.accent[500],
      // #10B981 - Hover
      active: colors.accent[600]
      // #059669 - Active
    },
    link: {
      default: colors.blue[400],
      // #60A5FA - Brighter for dark
      hover: colors.blue[300]
      // #93C5FD - Link hover
    }
  }
};

// src/typography.ts
var typography = {
  /**
   * iOS Large Titles - 34px
   * Used for main page headers (Settings, Messages, etc.)
   */
  largeTitle: {
    fontSize: "34px",
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: "-0.02em"
  },
  /**
   * iOS Title 1 - 28px
   * Used for section headers
   */
  title1: {
    fontSize: "28px",
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: "-0.015em"
  },
  /**
   * iOS Title 2 - 22px
   * Used for card titles and subsection headers
   */
  title2: {
    fontSize: "22px",
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: "-0.01em"
  },
  /**
   * iOS Title 3 - 20px
   * Used for smaller section headers
   */
  title3: {
    fontSize: "20px",
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: "normal"
  },
  /**
   * iOS Body - 17px
   * Primary body text and list items
   */
  body: {
    fontSize: "17px",
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: "normal"
  },
  /**
   * iOS Body Semibold - 17px
   * Emphasized body text
   */
  bodySemibold: {
    fontSize: "17px",
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: "-0.003em"
  },
  /**
   * iOS Subheadline - 15px
   * Secondary text in lists
   */
  subheadline: {
    fontSize: "15px",
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: "normal"
  },
  /**
   * iOS Footnote - 13px
   * Tertiary text and metadata
   */
  footnote: {
    fontSize: "13px",
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: "normal"
  },
  /**
   * iOS Footnote Semibold - 13px
   * Emphasized footnote text
   */
  footnoteSemibold: {
    fontSize: "13px",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "normal"
  },
  /**
   * iOS Caption - 12px
   * Small labels and captions
   */
  caption: {
    fontSize: "12px",
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: "normal"
  },
  /**
   * iOS Caption Semibold - 12px
   * Emphasized captions
   */
  captionSemibold: {
    fontSize: "12px",
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "normal"
  }
};
var fontFamilies = {
  default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace'
};
var typographyVars = {
  "--font-family-default": fontFamilies.default,
  "--font-family-mono": fontFamilies.mono,
  // Large Title
  "--font-size-large-title": typography.largeTitle.fontSize,
  "--font-weight-large-title": typography.largeTitle.fontWeight.toString(),
  "--line-height-large-title": typography.largeTitle.lineHeight.toString(),
  "--letter-spacing-large-title": typography.largeTitle.letterSpacing,
  // Title 1
  "--font-size-title1": typography.title1.fontSize,
  "--font-weight-title1": typography.title1.fontWeight.toString(),
  "--line-height-title1": typography.title1.lineHeight.toString(),
  "--letter-spacing-title1": typography.title1.letterSpacing,
  // Title 2
  "--font-size-title2": typography.title2.fontSize,
  "--font-weight-title2": typography.title2.fontWeight.toString(),
  "--line-height-title2": typography.title2.lineHeight.toString(),
  "--letter-spacing-title2": typography.title2.letterSpacing,
  // Title 3
  "--font-size-title3": typography.title3.fontSize,
  "--font-weight-title3": typography.title3.fontWeight.toString(),
  "--line-height-title3": typography.title3.lineHeight.toString(),
  "--letter-spacing-title3": typography.title3.letterSpacing,
  // Body
  "--font-size-body": typography.body.fontSize,
  "--font-weight-body": typography.body.fontWeight.toString(),
  "--line-height-body": typography.body.lineHeight.toString(),
  "--letter-spacing-body": typography.body.letterSpacing,
  // Body Semibold
  "--font-size-body-semibold": typography.bodySemibold.fontSize,
  "--font-weight-body-semibold": typography.bodySemibold.fontWeight.toString(),
  "--line-height-body-semibold": typography.bodySemibold.lineHeight.toString(),
  "--letter-spacing-body-semibold": typography.bodySemibold.letterSpacing,
  // Subheadline
  "--font-size-subheadline": typography.subheadline.fontSize,
  "--font-weight-subheadline": typography.subheadline.fontWeight.toString(),
  "--line-height-subheadline": typography.subheadline.lineHeight.toString(),
  "--letter-spacing-subheadline": typography.subheadline.letterSpacing,
  // Footnote
  "--font-size-footnote": typography.footnote.fontSize,
  "--font-weight-footnote": typography.footnote.fontWeight.toString(),
  "--line-height-footnote": typography.footnote.lineHeight.toString(),
  "--letter-spacing-footnote": typography.footnote.letterSpacing,
  // Footnote Semibold
  "--font-size-footnote-semibold": typography.footnoteSemibold.fontSize,
  "--font-weight-footnote-semibold": typography.footnoteSemibold.fontWeight.toString(),
  "--line-height-footnote-semibold": typography.footnoteSemibold.lineHeight.toString(),
  "--letter-spacing-footnote-semibold": typography.footnoteSemibold.letterSpacing,
  // Caption
  "--font-size-caption": typography.caption.fontSize,
  "--font-weight-caption": typography.caption.fontWeight.toString(),
  "--line-height-caption": typography.caption.lineHeight.toString(),
  "--letter-spacing-caption": typography.caption.letterSpacing,
  // Caption Semibold
  "--font-size-caption-semibold": typography.captionSemibold.fontSize,
  "--font-weight-caption-semibold": typography.captionSemibold.fontWeight.toString(),
  "--line-height-caption-semibold": typography.captionSemibold.lineHeight.toString(),
  "--letter-spacing-caption-semibold": typography.captionSemibold.letterSpacing
};

// src/index.ts
function getCSSVar(path) {
  return `var(--${path.replace(/\./g, "-")})`;
}
var version = "1.0.0";
export {
  colors,
  fontFamilies,
  getCSSVar,
  semanticColors,
  typography,
  typographyVars,
  version
};
//# sourceMappingURL=index.js.map