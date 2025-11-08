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
declare const designTokens: {
    readonly colors: {
        readonly primary: {
            readonly 50: "#EDF8FF";
            readonly 100: "#D6EFFF";
            readonly 200: "#B6E3FF";
            readonly 300: "#84D3FF";
            readonly 400: "#4AB9FF";
            readonly 500: "#2196F3";
            readonly 600: "#0277BD";
            readonly 700: "#01579B";
            readonly 800: "#014A82";
            readonly 900: "#013E6D";
            readonly 950: "#00274A";
        };
        readonly secondary: {
            readonly 50: "#F5F3FF";
            readonly 100: "#EDE9FE";
            readonly 200: "#DDD6FE";
            readonly 300: "#C4B5FD";
            readonly 400: "#A78BFA";
            readonly 500: "#8B5CF6";
            readonly 600: "#7C3AED";
            readonly 700: "#6D28D9";
            readonly 800: "#5B21B6";
            readonly 900: "#4C1D95";
            readonly 950: "#2E1065";
        };
        readonly neutral: {
            readonly 0: "#FFFFFF";
            readonly 50: "#F8FAFC";
            readonly 100: "#F1F5F9";
            readonly 200: "#E2E8F0";
            readonly 300: "#CBD5E1";
            readonly 400: "#94A3B8";
            readonly 500: "#64748B";
            readonly 600: "#475569";
            readonly 700: "#334155";
            readonly 800: "#1E293B";
            readonly 900: "#0F172A";
            readonly 950: "#020617";
        };
        readonly success: {
            readonly 50: "#F0FDF4";
            readonly 100: "#DCFCE7";
            readonly 500: "#22C55E";
            readonly 600: "#16A34A";
            readonly 700: "#15803D";
            readonly 900: "#14532D";
        };
        readonly error: {
            readonly 50: "#FEF2F2";
            readonly 100: "#FEE2E2";
            readonly 500: "#EF4444";
            readonly 600: "#DC2626";
            readonly 700: "#B91C1C";
            readonly 900: "#7F1D1D";
        };
        readonly warning: {
            readonly 50: "#FFFBEB";
            readonly 100: "#FEF3C7";
            readonly 500: "#F59E0B";
            readonly 600: "#D97706";
            readonly 700: "#B45309";
            readonly 900: "#78350F";
        };
        readonly info: {
            readonly 50: "#EFF6FF";
            readonly 100: "#DBEAFE";
            readonly 500: "#3B82F6";
            readonly 600: "#2563EB";
            readonly 700: "#1D4ED8";
            readonly 900: "#1E3A8A";
        };
        readonly automotive: {
            readonly gold: "#F5C453";
            readonly steel: "#8B96A5";
            readonly racing: "#F22F46";
            readonly electric: "#00D4AA";
            readonly midnight: "#0D1117";
        };
        readonly status: {
            readonly ok: "#22C55E";
            readonly caution: "#F59E0B";
            readonly risk: "#EF4444";
            readonly critical: "#DC2626";
            readonly info: "#3B82F6";
            readonly muted: "#64748B";
        };
    };
    readonly gradients: {
        readonly brand: "linear-gradient(135deg, #2196F3 0%, #8B5CF6 55%, #F59E0B 100%)";
        readonly aurora: "linear-gradient(145deg, rgba(33,150,243,0.85), rgba(139,92,246,0.85))";
        readonly glass: "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(248,250,252,0.75))";
        readonly depth: "radial-gradient(circle at top, rgba(33,150,243,0.15), rgba(13,17,23,0.95))";
    };
    readonly surface: {
        readonly light: {
            readonly base: "#F8FAFC";
            readonly elevated: "#FFFFFF";
            readonly subtle: "#F1F5F9";
            readonly hover: "#E2E8F0";
            readonly outline: "rgba(100, 116, 139, 0.24)";
            readonly glow: "rgba(33, 150, 243, 0.35)";
        };
        readonly dark: {
            readonly base: "#0D1117";
            readonly elevated: "#161B22";
            readonly subtle: "#1F2937";
            readonly hover: "#374151";
            readonly outline: "rgba(148, 163, 184, 0.18)";
            readonly glow: "rgba(139, 92, 246, 0.32)";
        };
    };
    readonly text: {
        readonly light: {
            readonly primary: "#0F172A";
            readonly secondary: "#475569";
            readonly tertiary: "#64748B";
            readonly disabled: "#94A3B8";
            readonly inverse: "#FFFFFF";
        };
        readonly dark: {
            readonly primary: "#F1F5F9";
            readonly secondary: "#CBD5E1";
            readonly tertiary: "#94A3B8";
            readonly disabled: "#64748B";
            readonly inverse: "#0F172A";
        };
    };
    readonly typography: {
        readonly fontFamily: {
            readonly sans: "\"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Roboto, \"Helvetica Neue\", Arial, sans-serif";
            readonly mono: "\"JetBrains Mono\", \"SF Mono\", \"Fira Code\", Consolas, Monaco, monospace";
            readonly display: "\"Cal Sans\", \"Inter\", system-ui, sans-serif";
        };
        readonly fontSize: {
            readonly xs: "0.6875rem";
            readonly sm: "0.8125rem";
            readonly base: "0.9375rem";
            readonly lg: "1.0625rem";
            readonly xl: "1.1875rem";
            readonly '2xl': "1.375rem";
            readonly '3xl': "1.75rem";
            readonly '4xl': "2.125rem";
            readonly '5xl': "2.75rem";
            readonly '6xl': "3.5rem";
        };
        readonly fontWeight: {
            readonly light: "300";
            readonly normal: "400";
            readonly medium: "500";
            readonly semibold: "600";
            readonly bold: "700";
            readonly extrabold: "800";
        };
        readonly lineHeight: {
            readonly none: "1";
            readonly tight: "1.25";
            readonly snug: "1.4";
            readonly normal: "1.5";
            readonly relaxed: "1.6";
            readonly loose: "1.75";
        };
        readonly letterSpacing: {
            readonly tighter: "-0.04em";
            readonly tight: "-0.02em";
            readonly normal: "0";
            readonly wide: "0.02em";
            readonly wider: "0.04em";
            readonly widest: "0.08em";
        };
        readonly rendering: {
            readonly smooth: {
                readonly WebkitFontSmoothing: "antialiased";
                readonly MozOsxFontSmoothing: "grayscale";
                readonly textRendering: "optimizeLegibility";
            };
            readonly geometric: {
                readonly WebkitFontSmoothing: "antialiased";
                readonly MozOsxFontSmoothing: "grayscale";
                readonly textRendering: "geometricPrecision";
            };
        };
    };
    readonly spacing: {
        readonly 0: "0";
        readonly px: "1px";
        readonly 0.5: "0.125rem";
        readonly 1: "0.25rem";
        readonly 1.5: "0.375rem";
        readonly 2: "0.5rem";
        readonly 2.5: "0.625rem";
        readonly 3: "0.75rem";
        readonly 3.5: "0.875rem";
        readonly 4: "1rem";
        readonly 5: "1.25rem";
        readonly 6: "1.5rem";
        readonly 7: "1.75rem";
        readonly 8: "2rem";
        readonly 9: "2.25rem";
        readonly 10: "2.5rem";
        readonly 11: "2.75rem";
        readonly 12: "3rem";
        readonly 14: "3.5rem";
        readonly 16: "4rem";
        readonly 20: "5rem";
        readonly 24: "6rem";
        readonly 32: "8rem";
    };
    readonly shadows: {
        readonly none: "none";
        readonly xs: "0 1px 2px 0 rgba(0, 0, 0, 0.05)";
        readonly sm: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)";
        readonly base: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)";
        readonly md: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";
        readonly lg: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
        readonly xl: "0 25px 50px -12px rgba(0, 0, 0, 0.25)";
        readonly '2xl': "0 35px 60px -15px rgba(0, 0, 0, 0.3)";
        readonly inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)";
        readonly glow: "0 0 0 3px rgba(33, 150, 243, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.1)";
        readonly glowPurple: "0 0 0 3px rgba(139, 92, 246, 0.15), 0 1px 3px 0 rgba(0, 0, 0, 0.1)";
        readonly dark: {
            readonly xs: "0 1px 2px 0 rgba(0, 0, 0, 0.3)";
            readonly sm: "0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.4)";
            readonly base: "0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)";
            readonly md: "0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -4px rgba(0, 0, 0, 0.4)";
            readonly lg: "0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)";
            readonly xl: "0 25px 50px -12px rgba(0, 0, 0, 0.6)";
            readonly glow: "0 0 0 3px rgba(33, 150, 243, 0.25), 0 1px 3px 0 rgba(0, 0, 0, 0.5)";
        };
    };
    readonly elevation: {
        readonly 0: "none";
        readonly 1: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)";
        readonly 2: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)";
        readonly 3: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)";
        readonly 4: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)";
    };
    readonly borders: {
        readonly width: {
            readonly 0: "0";
            readonly 1: "1px";
            readonly 2: "2px";
            readonly 4: "4px";
            readonly 8: "8px";
        };
        readonly radius: {
            readonly none: "0";
            readonly sm: "0.25rem";
            readonly base: "0.375rem";
            readonly md: "0.5rem";
            readonly lg: "0.75rem";
            readonly xl: "1rem";
            readonly '2xl': "1.5rem";
            readonly '3xl': "2rem";
            readonly full: "9999px";
        };
        readonly color: {
            readonly light: {
                readonly subtle: "rgba(226, 232, 240, 0.5)";
                readonly base: "rgba(203, 213, 225, 0.7)";
                readonly strong: "rgba(148, 163, 184, 0.9)";
            };
            readonly dark: {
                readonly subtle: "rgba(55, 65, 81, 0.5)";
                readonly base: "rgba(75, 85, 99, 0.7)";
                readonly strong: "rgba(107, 114, 128, 0.9)";
            };
        };
    };
    readonly layout: {
        readonly maxWidth: {
            readonly sm: "640px";
            readonly md: "768px";
            readonly lg: "1024px";
            readonly xl: "1280px";
            readonly '2xl': "1536px";
            readonly '3xl': "1920px";
            readonly full: "100%";
        };
        readonly container: {
            readonly padding: {
                readonly mobile: "1rem";
                readonly tablet: "1.5rem";
                readonly desktop: "2rem";
            };
        };
        readonly sidebar: {
            readonly width: "280px";
            readonly widthCollapsed: "72px";
        };
        readonly header: {
            readonly height: "56px";
        };
    };
    readonly animation: {
        readonly duration: {
            readonly instant: "50ms";
            readonly fast: "150ms";
            readonly base: "200ms";
            readonly slow: "300ms";
            readonly slower: "500ms";
        };
        readonly easing: {
            readonly linear: "linear";
            readonly easeIn: "cubic-bezier(0.4, 0, 1, 1)";
            readonly easeOut: "cubic-bezier(0, 0, 0.2, 1)";
            readonly easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)";
            readonly smooth: "cubic-bezier(0.4, 0, 0.2, 1)";
            readonly bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)";
            readonly spring: "cubic-bezier(0.34, 1.56, 0.64, 1)";
        };
    };
    readonly zIndex: {
        readonly base: 0;
        readonly dropdown: 1000;
        readonly sticky: 1020;
        readonly fixed: 1030;
        readonly backdrop: 1040;
        readonly modal: 1050;
        readonly popover: 1060;
        readonly tooltip: 1070;
        readonly toast: 1080;
    };
};
/**
 * Get color with opacity
 */
declare function colorWithOpacity(color: string, opacity: number): string;
/**
 * Responsive spacing helper
 */
declare function responsiveSpacing(mobile: string, desktop: string): {
    base: "1.75rem" | "2.75rem" | "3.5rem" | "0" | "1px" | "0.125rem" | "0.25rem" | "0.375rem" | "0.5rem" | "0.625rem" | "0.75rem" | "0.875rem" | "1rem" | "1.25rem" | "1.5rem" | "2rem" | "2.25rem" | "2.5rem" | "3rem" | "4rem" | "5rem" | "6rem" | "8rem";
    md: "1.75rem" | "2.75rem" | "3.5rem" | "0" | "1px" | "0.125rem" | "0.25rem" | "0.375rem" | "0.5rem" | "0.625rem" | "0.75rem" | "0.875rem" | "1rem" | "1.25rem" | "1.5rem" | "2rem" | "2.25rem" | "2.5rem" | "3rem" | "4rem" | "5rem" | "6rem" | "8rem";
};
type DesignTokens = typeof designTokens;
type ThemeName = 'light' | 'dark' | 'high-contrast' | 'automotive';
interface ThemeConfig {
    name: ThemeName;
    displayName: string;
    description: string;
}
declare const themes: Record<ThemeName, ThemeConfig>;
/**
 * Set the active theme by updating the data-theme attribute
 */
declare function setTheme(theme: ThemeName): void;
/**
 * Get the currently active theme
 */
declare function getTheme(): ThemeName;
/**
 * Initialize theme from localStorage or system preference
 */
declare function initTheme(): void;
/**
 * Listen for system theme changes
 */
declare function watchSystemTheme(callback: (theme: ThemeName) => void): () => void;
/**
 * Get all available themes
 */
declare function getAvailableThemes(): ThemeConfig[];
/**
 * Check if a theme name is valid
 */
declare function isValidTheme(theme: string): theme is ThemeName;

export { type DesignTokens, type ThemeConfig, type ThemeName, colorWithOpacity, designTokens, getAvailableThemes, getTheme, initTheme, isValidTheme, responsiveSpacing, setTheme, themes, watchSystemTheme };
