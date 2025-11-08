#!/usr/bin/env node
/**
 * Build script to generate CSS and TypeScript files from tokens.json
 * Outputs: dist/tokens.css, dist/tokens.ts
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface TokenValue {
  [key: string]: string | TokenValue;
}

interface Tokens {
  primitives: {
    colors: TokenValue;
    spacing: TokenValue;
    radius: TokenValue;
    shadows: TokenValue;
    typography: TokenValue;
    motion: TokenValue;
  };
  semantic: {
    light: TokenValue;
    dark: TokenValue;
  };
}

// Read tokens.json
const tokensPath = join(__dirname, '../tokens.json');
const tokens: Tokens = JSON.parse(readFileSync(tokensPath, 'utf-8'));

// Helper to resolve token references
function resolveTokenValue(value: string, tokens: Tokens): string {
  if (typeof value !== 'string' || !value.startsWith('{')) {
    return value;
  }

  const path = value.slice(1, -1); // Remove { and }
  const parts = path.split('.');
  let current: any = tokens;

  for (const part of parts) {
    current = current[part];
    if (!current) {
      console.warn(`Could not resolve token path: ${path}`);
      return value;
    }
  }

  return typeof current === 'string' ? current : value;
}

// Flatten nested objects to CSS variables
function flattenTokens(obj: TokenValue, prefix = '', theme?: string): Record<string, string> {
  const result: Record<string, string> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newPrefix = prefix ? `${prefix}-${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenTokens(value, newPrefix, theme));
    } else {
      const resolvedValue = resolveTokenValue(value as string, tokens);
      result[`--${newPrefix}`] = resolvedValue;
    }
  }

  return result;
}

// Generate CSS
function generateCSS(): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * AutolytiQ Design Tokens');
  lines.push(' * Auto-generated from tokens.json');
  lines.push(' * DO NOT EDIT MANUALLY');
  lines.push(' */\n');

  // Root variables (primitives)
  lines.push(':root {');
  const primitives = flattenTokens(tokens.primitives as unknown as TokenValue);
  for (const [key, value] of Object.entries(primitives)) {
    lines.push(`  ${key}: ${value};`);
  }
  lines.push('}\n');

  // Get all theme names from semantic tokens
  const themeNames = Object.keys(tokens.semantic);

  // Generate CSS for each theme
  const themeTokensMap = new Map<string, Record<string, string>>();

  for (const themeName of themeNames) {
    const themeTokens = flattenTokens(
      tokens.semantic[themeName as keyof typeof tokens.semantic] as unknown as TokenValue,
      'semantic'
    );
    themeTokensMap.set(themeName, themeTokens);

    // Light theme is default
    if (themeName === 'light') {
      lines.push(':root, :root[data-theme="light"] {');
    } else {
      lines.push(`:root[data-theme="${themeName}"] {`);
    }

    for (const [key, value] of Object.entries(themeTokens)) {
      lines.push(`  ${key}: ${value};`);
    }
    lines.push('}\n');
  }

  // Auto dark mode based on system preference (only if dark theme exists)
  if (themeTokensMap.has('dark')) {
    const darkTokens = themeTokensMap.get('dark')!;
    lines.push('@media (prefers-color-scheme: dark) {');
    lines.push('  :root:not([data-theme]) {');
    for (const [key, value] of Object.entries(darkTokens)) {
      lines.push(`    ${key}: ${value};`);
    }
    lines.push('  }');
    lines.push('}\n');
  }

  return lines.join('\n');
}

// Generate TypeScript
function generateTypeScript(): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * AutolytiQ Design Tokens');
  lines.push(' * Auto-generated from tokens.json');
  lines.push(' * DO NOT EDIT MANUALLY');
  lines.push(' */\n');

  function objToTS(obj: any, indent = 0): string {
    const spaces = '  '.repeat(indent);
    const innerSpaces = '  '.repeat(indent + 1);
    const lines: string[] = ['{'];

    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        lines.push(`${innerSpaces}${key}: ${objToTS(value, indent + 1)},`);
      } else {
        const resolvedValue = resolveTokenValue(value as string, tokens);
        lines.push(`${innerSpaces}${key}: '${resolvedValue}',`);
      }
    }

    lines.push(`${spaces}}`);
    return lines.join('\n');
  }

  lines.push('export const tokens = ' + objToTS(tokens) + ' as const;\n');
  lines.push('export type Tokens = typeof tokens;\n');

  // Export theme names
  const themeNames = Object.keys(tokens.semantic);
  lines.push(`export const themeNames = ${JSON.stringify(themeNames)} as const;\n`);
  lines.push('export type ThemeName = typeof themeNames[number];\n');

  // Helper function to get CSS variable name
  lines.push('export function getCSSVar(path: string): string {');
  lines.push('  return `var(--${path.replace(/\\./g, \'-\')})`;');
  lines.push('}\n');

  return lines.join('\n');
}

// Helper to quote keys that start with numbers or have special chars
function quoteKey(key: string): string {
  if (/^[0-9]/.test(key) || /[^a-zA-Z0-9_$]/.test(key)) {
    return `'${key}'`;
  }
  return key;
}

// Generate Tailwind preset
function generateTailwindPreset(): string {
  const lines: string[] = [];

  lines.push('/**');
  lines.push(' * AutolytiQ Tailwind Preset');
  lines.push(' * Auto-generated from tokens.json');
  lines.push(' * DO NOT EDIT MANUALLY');
  lines.push(' */\n');

  lines.push('module.exports = {');
  lines.push('  theme: {');
  lines.push('    extend: {');

  // Colors
  lines.push('      colors: {');
  for (const [colorName, colorShades] of Object.entries(tokens.primitives.colors)) {
    lines.push(`        ${quoteKey(colorName)}: {`);
    for (const [shade, value] of Object.entries(colorShades)) {
      lines.push(`          ${quoteKey(shade)}: '${value}',`);
    }
    lines.push('        },');
  }
  // Add semantic colors using CSS variables
  lines.push('        surface: {');
  lines.push("          base: 'var(--semantic-surface-base)',");
  lines.push("          elevated: 'var(--semantic-surface-elevated)',");
  lines.push("          overlay: 'var(--semantic-surface-overlay)',");
  lines.push("          subtle: 'var(--semantic-surface-subtle)',");
  lines.push("          muted: 'var(--semantic-surface-muted)',");
  lines.push('        },');
  lines.push('        text: {');
  lines.push("          primary: 'var(--semantic-text-primary)',");
  lines.push("          secondary: 'var(--semantic-text-secondary)',");
  lines.push("          tertiary: 'var(--semantic-text-tertiary)',");
  lines.push("          disabled: 'var(--semantic-text-disabled)',");
  lines.push("          inverse: 'var(--semantic-text-inverse)',");
  lines.push('        },');
  lines.push('        border: {');
  lines.push("          base: 'var(--semantic-border-base)',");
  lines.push("          strong: 'var(--semantic-border-strong)',");
  lines.push("          subtle: 'var(--semantic-border-subtle)',");
  lines.push('        },');
  lines.push('        accent: {');
  lines.push("          primary: 'var(--semantic-accent-primary)',");
  lines.push("          'primary-hover': 'var(--semantic-accent-primaryHover)',");
  lines.push("          'primary-subtle': 'var(--semantic-accent-primarySubtle)',");
  lines.push("          secondary: 'var(--semantic-accent-secondary)',");
  lines.push("          'secondary-hover': 'var(--semantic-accent-secondaryHover)',");
  lines.push('        },');
  lines.push('        status: {');
  lines.push("          success: 'var(--semantic-status-success)',");
  lines.push("          'success-subtle': 'var(--semantic-status-successSubtle)',");
  lines.push("          warning: 'var(--semantic-status-warning)',");
  lines.push("          'warning-subtle': 'var(--semantic-status-warningSubtle)',");
  lines.push("          error: 'var(--semantic-status-error)',");
  lines.push("          'error-subtle': 'var(--semantic-status-errorSubtle)',");
  lines.push("          info: 'var(--semantic-status-info)',");
  lines.push("          'info-subtle': 'var(--semantic-status-infoSubtle)',");
  lines.push('        },');
  lines.push('      },');

  // Spacing
  lines.push('      spacing: {');
  for (const [key, value] of Object.entries(tokens.primitives.spacing)) {
    lines.push(`        ${quoteKey(key)}: '${value}',`);
  }
  lines.push('      },');

  // Border radius
  lines.push('      borderRadius: {');
  for (const [key, value] of Object.entries(tokens.primitives.radius)) {
    lines.push(`        ${quoteKey(key)}: '${value}',`);
  }
  lines.push('      },');

  // Box shadows
  lines.push('      boxShadow: {');
  for (const [key, value] of Object.entries(tokens.primitives.shadows)) {
    lines.push(`        ${quoteKey(key)}: '${value}',`);
  }
  lines.push('      },');

  // Font family - need to parse and properly quote each font
  lines.push('      fontFamily: {');
  for (const [key, value] of Object.entries(tokens.primitives.typography.fontFamily)) {
    // Parse the comma-separated font list and ensure each is properly quoted
    const fonts = (value as string).split(',').map(f => f.trim());
    const quotedFonts = fonts.map(font => {
      // If already quoted, keep as is; otherwise quote it
      if (font.startsWith('"') || font.startsWith("'")) {
        return font;
      }
      return `'${font}'`;
    }).join(', ');
    lines.push(`        ${quoteKey(key)}: [${quotedFonts}],`);
  }
  lines.push('      },');

  // Font size
  lines.push('      fontSize: {');
  for (const [key, value] of Object.entries(tokens.primitives.typography.fontSize)) {
    lines.push(`        ${quoteKey(key)}: '${value}',`);
  }
  lines.push('      },');

  // Font weight
  lines.push('      fontWeight: {');
  for (const [key, value] of Object.entries(tokens.primitives.typography.fontWeight)) {
    lines.push(`        ${key}: '${value}',`);
  }
  lines.push('      },');

  // Line height
  lines.push('      lineHeight: {');
  for (const [key, value] of Object.entries(tokens.primitives.typography.lineHeight)) {
    lines.push(`        ${key}: '${value}',`);
  }
  lines.push('      },');

  // Animation duration
  lines.push('      transitionDuration: {');
  for (const [key, value] of Object.entries(tokens.primitives.motion.duration)) {
    lines.push(`        ${key}: '${value}',`);
  }
  lines.push('      },');

  // Animation easing
  lines.push('      transitionTimingFunction: {');
  for (const [key, value] of Object.entries(tokens.primitives.motion.easing)) {
    lines.push(`        ${key}: '${value}',`);
  }
  lines.push('      },');

  lines.push('    },');
  lines.push('  },');
  lines.push('};\n');

  return lines.join('\n');
}

// Write output files
try {
  const distDir = join(__dirname, '../dist');
  mkdirSync(distDir, { recursive: true });

  const css = generateCSS();
  const ts = generateTypeScript();
  const tailwindPreset = generateTailwindPreset();

  writeFileSync(join(distDir, 'tokens.css'), css);
  writeFileSync(join(distDir, 'tokens.ts'), ts);
  writeFileSync(join(distDir, 'tailwind.preset.cjs'), tailwindPreset);

  console.log('✅ Generated dist/tokens.css');
  console.log('✅ Generated dist/tokens.ts');
  console.log('✅ Generated dist/tailwind.preset.cjs');
} catch (error) {
  console.error('❌ Failed to generate tokens:', error);
  process.exit(1);
}
