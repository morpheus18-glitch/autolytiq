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

  // Light theme (default)
  lines.push(':root, :root[data-theme="light"] {');
  const lightTokens = flattenTokens(tokens.semantic.light as unknown as TokenValue, 'semantic');
  for (const [key, value] of Object.entries(lightTokens)) {
    lines.push(`  ${key}: ${value};`);
  }
  lines.push('}\n');

  // Dark theme
  lines.push(':root[data-theme="dark"] {');
  const darkTokens = flattenTokens(tokens.semantic.dark as unknown as TokenValue, 'semantic');
  for (const [key, value] of Object.entries(darkTokens)) {
    lines.push(`  ${key}: ${value};`);
  }
  lines.push('}\n');

  // Auto dark mode based on system preference
  lines.push('@media (prefers-color-scheme: dark) {');
  lines.push('  :root:not([data-theme="light"]) {');
  for (const [key, value] of Object.entries(darkTokens)) {
    lines.push(`    ${key}: ${value};`);
  }
  lines.push('  }');
  lines.push('}\n');

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

  // Helper function to get CSS variable name
  lines.push('export function getCSSVar(path: string): string {');
  lines.push('  return `var(--${path.replace(/\\./g, \'-\')})`;');
  lines.push('}\n');

  return lines.join('\n');
}

// Write output files
try {
  const distDir = join(__dirname, '../dist');
  mkdirSync(distDir, { recursive: true });

  const css = generateCSS();
  const ts = generateTypeScript();

  writeFileSync(join(distDir, 'tokens.css'), css);
  writeFileSync(join(distDir, 'tokens.ts'), ts);

  console.log('✅ Generated dist/tokens.css');
  console.log('✅ Generated dist/tokens.ts');
} catch (error) {
  console.error('❌ Failed to generate tokens:', error);
  process.exit(1);
}
