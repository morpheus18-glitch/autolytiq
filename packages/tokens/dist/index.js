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

// src/index.ts
function getCSSVar(path) {
  return `var(--${path.replace(/\./g, "-")})`;
}
var version = "1.0.0";
export {
  colors,
  getCSSVar,
  semanticColors,
  version
};
//# sourceMappingURL=index.js.map