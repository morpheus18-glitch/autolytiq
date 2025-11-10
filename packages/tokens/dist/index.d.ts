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
 * Typography System
 *
 * iOS-inspired typography scale with SF Pro characteristics
 * Based on iOS_QUALITY_STANDARDS.md specifications
 */
declare const typography: {
    /**
     * iOS Large Titles - 34px
     * Used for main page headers (Settings, Messages, etc.)
     */
    largeTitle: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Title 1 - 28px
     * Used for section headers
     */
    title1: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Title 2 - 22px
     * Used for card titles and subsection headers
     */
    title2: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Title 3 - 20px
     * Used for smaller section headers
     */
    title3: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Body - 17px
     * Primary body text and list items
     */
    body: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Body Semibold - 17px
     * Emphasized body text
     */
    bodySemibold: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Subheadline - 15px
     * Secondary text in lists
     */
    subheadline: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Footnote - 13px
     * Tertiary text and metadata
     */
    footnote: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Footnote Semibold - 13px
     * Emphasized footnote text
     */
    footnoteSemibold: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Caption - 12px
     * Small labels and captions
     */
    caption: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
    /**
     * iOS Caption Semibold - 12px
     * Emphasized captions
     */
    captionSemibold: {
        fontSize: string;
        fontWeight: number;
        lineHeight: number;
        letterSpacing: string;
    };
};
/**
 * Font families
 */
declare const fontFamilies: {
    default: string;
    mono: string;
};
/**
 * Typography CSS variables for Tailwind config
 */
declare const typographyVars: {
    '--font-family-default': string;
    '--font-family-mono': string;
    '--font-size-large-title': string;
    '--font-weight-large-title': string;
    '--line-height-large-title': string;
    '--letter-spacing-large-title': string;
    '--font-size-title1': string;
    '--font-weight-title1': string;
    '--line-height-title1': string;
    '--letter-spacing-title1': string;
    '--font-size-title2': string;
    '--font-weight-title2': string;
    '--line-height-title2': string;
    '--letter-spacing-title2': string;
    '--font-size-title3': string;
    '--font-weight-title3': string;
    '--line-height-title3': string;
    '--letter-spacing-title3': string;
    '--font-size-body': string;
    '--font-weight-body': string;
    '--line-height-body': string;
    '--letter-spacing-body': string;
    '--font-size-body-semibold': string;
    '--font-weight-body-semibold': string;
    '--line-height-body-semibold': string;
    '--letter-spacing-body-semibold': string;
    '--font-size-subheadline': string;
    '--font-weight-subheadline': string;
    '--line-height-subheadline': string;
    '--letter-spacing-subheadline': string;
    '--font-size-footnote': string;
    '--font-weight-footnote': string;
    '--line-height-footnote': string;
    '--letter-spacing-footnote': string;
    '--font-size-footnote-semibold': string;
    '--font-weight-footnote-semibold': string;
    '--line-height-footnote-semibold': string;
    '--letter-spacing-footnote-semibold': string;
    '--font-size-caption': string;
    '--font-weight-caption': string;
    '--line-height-caption': string;
    '--letter-spacing-caption': string;
    '--font-size-caption-semibold': string;
    '--font-weight-caption-semibold': string;
    '--line-height-caption-semibold': string;
    '--letter-spacing-caption-semibold': string;
};

/**
 * @autolytiq/tokens
 * Design system tokens - ESM module
 */

declare function getCSSVar(path: string): string;
declare const version = "1.0.0";

export { colors, fontFamilies, getCSSVar, semanticColors, typography, typographyVars, version };
