/**
 * Policy Engine - Entry Point
 *
 * Tenant→Role→User policy resolution with field masking
 */

export * from './rules.js';
export * from './evaluate.js';
export * from './applyMasks.js';
export * from './registry.js';

// Re-export common types for convenience
export type {
  PolicyRule,
  Scope,
  FieldMask,
  FieldMaskAction,
  AbacCondition,
} from './rules.js';

export type {
  PolicyContext,
  PolicyDecision,
} from './evaluate.js';
