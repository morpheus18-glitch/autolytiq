/**
 * @autolytiq/tokens
 * Design system tokens - ESM module
 */

// Re-export tokens if they exist
export * from './colors-new.js';

// Export token access helper
export function getCSSVar(path: string): string {
  return `var(--${path.replace(/\./g, '-')})`;
}

export const version = '1.0.0';
