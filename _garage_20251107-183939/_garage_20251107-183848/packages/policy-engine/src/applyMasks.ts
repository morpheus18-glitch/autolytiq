/**
 * Apply Masks - Field-Level Data Masking
 *
 * Applies field masks (hide/redact/mask) to payload objects
 */

import type { FieldMask, FieldMaskAction } from './rules.js';

/**
 * Apply field masks to a payload object
 *
 * Mutates the object in-place for performance.
 * Clone before calling if you need to preserve original.
 */
export function applyMasks<T extends Record<string, any>>(
  payload: T,
  masks: FieldMask[]
): T {
  for (const mask of masks) {
    applyMask(payload, mask);
  }
  return payload;
}

/**
 * Apply a single field mask
 */
export function applyMask<T extends Record<string, any>>(
  payload: T,
  mask: FieldMask
): void {
  const value = getPath(payload, mask.path);
  
  if (value === undefined) {
    // Field doesn't exist, skip
    return;
  }
  
  switch (mask.action) {
    case 'hide':
      // Remove field entirely
      deletePath(payload, mask.path);
      break;
      
    case 'redact':
      // Replace with static replacement
      setPath(payload, mask.path, mask.replacement || '[REDACTED]');
      break;
      
    case 'mask':
      // Partially mask value (preserve last N chars)
      const masked = maskValue(value, mask.replacement);
      setPath(payload, mask.path, masked);
      break;
  }
}

/**
 * Get value at JSON path
 */
export function getPath(obj: any, path: string): any {
  const parts = path.split('.');
  let current = obj;
  
  for (const part of parts) {
    if (current == null) return undefined;
    current = current[part];
  }
  
  return current;
}

/**
 * Set value at JSON path
 */
export function setPath(obj: any, path: string, value: any): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  let current = obj;
  
  for (const part of parts) {
    if (current[part] == null) {
      current[part] = {};
    }
    current = current[part];
  }
  
  current[last] = value;
}

/**
 * Delete value at JSON path
 */
export function deletePath(obj: any, path: string): void {
  const parts = path.split('.');
  const last = parts.pop()!;
  let current = obj;
  
  for (const part of parts) {
    if (current == null) return;
    current = current[part];
  }
  
  if (current != null) {
    delete current[last];
  }
}

/**
 * Mask a value using replacement pattern
 *
 * Patterns:
 * - "***-**-####" keeps last 4 chars (SSN: 123-45-6789 → ***-**-6789)
 * - "****####" keeps last 4 chars (License: ABC12345 → ****2345)
 * - "**** **** **** ####" keeps last 4 chars (Card: 1234 5678 9012 3456 → **** **** **** 3456)
 */
export function maskValue(value: any, pattern?: string): string {
  const str = String(value);
  
  if (!pattern) {
    // Default: show last 4 chars
    return str.length > 4 
      ? '*'.repeat(str.length - 4) + str.slice(-4)
      : '****';
  }
  
  // Count '#' characters (visible chars)
  const visibleCount = (pattern.match(/#/g) || []).length;
  
  if (visibleCount === 0) {
    // No visible chars, just return pattern
    return pattern;
  }
  
  // Get last N chars from value
  const visible = str.slice(-visibleCount);
  
  // Replace '#' with actual chars from end
  let result = pattern;
  for (let i = visible.length - 1; i >= 0; i--) {
    result = result.replace(/#/, visible[i]);
  }
  
  return result;
}

/**
 * Clone object deeply (for immutable masking)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any;
  }
  
  const cloned: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      cloned[key] = deepClone((obj as any)[key]);
    }
  }
  
  return cloned;
}

/**
 * Apply masks immutably (returns new object)
 */
export function applyMasksImmutable<T extends Record<string, any>>(
  payload: T,
  masks: FieldMask[]
): T {
  const cloned = deepClone(payload);
  return applyMasks(cloned, masks);
}

/**
 * Mask multiple payloads (batch operation)
 */
export function applyMasksBatch<T extends Record<string, any>>(
  payloads: T[],
  masks: FieldMask[]
): T[] {
  return payloads.map(payload => applyMasksImmutable(payload, masks));
}

/**
 * Common mask patterns
 */
export const MaskPatterns = {
  SSN: '***-**-####',
  PHONE: '(***) ***-####',
  EMAIL: '*****@*****.***',
  CARD: '**** **** **** ####',
  LICENSE: '****####',
  ACCOUNT: '****####',
  ROUTING: '****####',
  FULL_REDACT: '[REDACTED]',
  PARTIAL_NAME: '**** ####',
} as const;
