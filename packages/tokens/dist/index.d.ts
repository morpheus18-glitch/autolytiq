/**
 * ChatGPT/GitHub Inspired Color System
 *
 * Philosophy:
 * - Clean, minimal aesthetic like ChatGPT
 * - Professional depth like GitHub
 * - Optimized for long work sessions
 * - Perfect contrast ratios (WCAG AAA where possible)
 */
declare const colors: {
    neutral: {
        0: string;
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
        925: string;
        950: string;
        975: string;
    };
    accent: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    blue: {
        50: string;
        100: string;
        200: string;
        300: string;
        400: string;
        500: string;
        600: string;
        700: string;
        800: string;
        900: string;
    };
    success: {
        50: string;
        100: string;
        500: string;
        600: string;
        700: string;
        900: string;
    };
    error: {
        50: string;
        100: string;
        500: string;
        600: string;
        700: string;
        900: string;
    };
    warning: {
        50: string;
        100: string;
        500: string;
        600: string;
        700: string;
        900: string;
    };
    info: {
        50: string;
        100: string;
        500: string;
        600: string;
        700: string;
        900: string;
    };
};
/**
 * Semantic color mappings for light/dark modes
 * These match ChatGPT/GitHub patterns
 */
declare const semanticColors: {
    light: {
        canvas: string;
        elevated: string;
        inset: string;
        border: {
            default: string;
            muted: string;
            strong: string;
        };
        text: {
            primary: string;
            secondary: string;
            tertiary: string;
            placeholder: string;
            inverse: string;
        };
        action: {
            primary: string;
            hover: string;
            active: string;
        };
        link: {
            default: string;
            hover: string;
        };
    };
    dark: {
        canvas: string;
        elevated: string;
        inset: string;
        border: {
            default: string;
            muted: string;
            strong: string;
        };
        text: {
            primary: string;
            secondary: string;
            tertiary: string;
            placeholder: string;
            inverse: string;
        };
        action: {
            primary: string;
            hover: string;
            active: string;
        };
        link: {
            default: string;
            hover: string;
        };
    };
};

/**
 * @autolytiq/tokens
 * Design system tokens - ESM module
 */

declare function getCSSVar(path: string): string;
declare const version = "1.0.0";

export { colors, getCSSVar, semanticColors, version };
