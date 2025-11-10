/**
 * Typography System
 *
 * iOS-inspired typography scale with SF Pro characteristics
 * Based on iOS_QUALITY_STANDARDS.md specifications
 */

export const typography = {
  /**
   * iOS Large Titles - 34px
   * Used for main page headers (Settings, Messages, etc.)
   */
  largeTitle: {
    fontSize: '34px',
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.02em',
  },

  /**
   * iOS Title 1 - 28px
   * Used for section headers
   */
  title1: {
    fontSize: '28px',
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.015em',
  },

  /**
   * iOS Title 2 - 22px
   * Used for card titles and subsection headers
   */
  title2: {
    fontSize: '22px',
    fontWeight: 600,
    lineHeight: 1.2,
    letterSpacing: '-0.01em',
  },

  /**
   * iOS Title 3 - 20px
   * Used for smaller section headers
   */
  title3: {
    fontSize: '20px',
    fontWeight: 600,
    lineHeight: 1.25,
    letterSpacing: 'normal',
  },

  /**
   * iOS Body - 17px
   * Primary body text and list items
   */
  body: {
    fontSize: '17px',
    fontWeight: 400,
    lineHeight: 1.4,
    letterSpacing: 'normal',
  },

  /**
   * iOS Body Semibold - 17px
   * Emphasized body text
   */
  bodySemibold: {
    fontSize: '17px',
    fontWeight: 600,
    lineHeight: 1.4,
    letterSpacing: '-0.003em',
  },

  /**
   * iOS Subheadline - 15px
   * Secondary text in lists
   */
  subheadline: {
    fontSize: '15px',
    fontWeight: 400,
    lineHeight: 1.35,
    letterSpacing: 'normal',
  },

  /**
   * iOS Footnote - 13px
   * Tertiary text and metadata
   */
  footnote: {
    fontSize: '13px',
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: 'normal',
  },

  /**
   * iOS Footnote Semibold - 13px
   * Emphasized footnote text
   */
  footnoteSemibold: {
    fontSize: '13px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: 'normal',
  },

  /**
   * iOS Caption - 12px
   * Small labels and captions
   */
  caption: {
    fontSize: '12px',
    fontWeight: 400,
    lineHeight: 1.3,
    letterSpacing: 'normal',
  },

  /**
   * iOS Caption Semibold - 12px
   * Emphasized captions
   */
  captionSemibold: {
    fontSize: '12px',
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: 'normal',
  },
};

/**
 * Font families
 */
export const fontFamilies = {
  default: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
};

/**
 * Typography CSS variables for Tailwind config
 */
export const typographyVars = {
  '--font-family-default': fontFamilies.default,
  '--font-family-mono': fontFamilies.mono,

  // Large Title
  '--font-size-large-title': typography.largeTitle.fontSize,
  '--font-weight-large-title': typography.largeTitle.fontWeight.toString(),
  '--line-height-large-title': typography.largeTitle.lineHeight.toString(),
  '--letter-spacing-large-title': typography.largeTitle.letterSpacing,

  // Title 1
  '--font-size-title1': typography.title1.fontSize,
  '--font-weight-title1': typography.title1.fontWeight.toString(),
  '--line-height-title1': typography.title1.lineHeight.toString(),
  '--letter-spacing-title1': typography.title1.letterSpacing,

  // Title 2
  '--font-size-title2': typography.title2.fontSize,
  '--font-weight-title2': typography.title2.fontWeight.toString(),
  '--line-height-title2': typography.title2.lineHeight.toString(),
  '--letter-spacing-title2': typography.title2.letterSpacing,

  // Title 3
  '--font-size-title3': typography.title3.fontSize,
  '--font-weight-title3': typography.title3.fontWeight.toString(),
  '--line-height-title3': typography.title3.lineHeight.toString(),
  '--letter-spacing-title3': typography.title3.letterSpacing,

  // Body
  '--font-size-body': typography.body.fontSize,
  '--font-weight-body': typography.body.fontWeight.toString(),
  '--line-height-body': typography.body.lineHeight.toString(),
  '--letter-spacing-body': typography.body.letterSpacing,

  // Body Semibold
  '--font-size-body-semibold': typography.bodySemibold.fontSize,
  '--font-weight-body-semibold': typography.bodySemibold.fontWeight.toString(),
  '--line-height-body-semibold': typography.bodySemibold.lineHeight.toString(),
  '--letter-spacing-body-semibold': typography.bodySemibold.letterSpacing,

  // Subheadline
  '--font-size-subheadline': typography.subheadline.fontSize,
  '--font-weight-subheadline': typography.subheadline.fontWeight.toString(),
  '--line-height-subheadline': typography.subheadline.lineHeight.toString(),
  '--letter-spacing-subheadline': typography.subheadline.letterSpacing,

  // Footnote
  '--font-size-footnote': typography.footnote.fontSize,
  '--font-weight-footnote': typography.footnote.fontWeight.toString(),
  '--line-height-footnote': typography.footnote.lineHeight.toString(),
  '--letter-spacing-footnote': typography.footnote.letterSpacing,

  // Footnote Semibold
  '--font-size-footnote-semibold': typography.footnoteSemibold.fontSize,
  '--font-weight-footnote-semibold': typography.footnoteSemibold.fontWeight.toString(),
  '--line-height-footnote-semibold': typography.footnoteSemibold.lineHeight.toString(),
  '--letter-spacing-footnote-semibold': typography.footnoteSemibold.letterSpacing,

  // Caption
  '--font-size-caption': typography.caption.fontSize,
  '--font-weight-caption': typography.caption.fontWeight.toString(),
  '--line-height-caption': typography.caption.lineHeight.toString(),
  '--letter-spacing-caption': typography.caption.letterSpacing,

  // Caption Semibold
  '--font-size-caption-semibold': typography.captionSemibold.fontSize,
  '--font-weight-caption-semibold': typography.captionSemibold.fontWeight.toString(),
  '--line-height-caption-semibold': typography.captionSemibold.lineHeight.toString(),
  '--letter-spacing-caption-semibold': typography.captionSemibold.letterSpacing,
};
