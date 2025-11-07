/**
 * Insight Rule Registry
 *
 * Runtime rule registration and lookup
 */

import type { InsightRule } from './types.js';

/**
 * Global rule storage
 */
const RULES: Record<string, InsightRule> = {};

/**
 * Register a new insight rule
 * @param rule - Rule definition
 */
export function registerRule(rule: InsightRule): void {
  if (RULES[rule.key]) {
    console.warn(`[InsightRegistry] Overwriting existing rule: ${rule.key}`);
  }
  RULES[rule.key] = rule;
}

/**
 * Register multiple rules at once
 * @param rules - Array of rule definitions
 */
export function registerRules(rules: InsightRule[]): void {
  rules.forEach(registerRule);
}

/**
 * Get all registered rules
 * @returns Array of all rules
 */
export function listRules(): InsightRule[] {
  return Object.values(RULES);
}

/**
 * Get a specific rule by key
 * @param key - Rule key
 * @returns Rule definition or undefined
 */
export function getRule(key: string): InsightRule | undefined {
  return RULES[key];
}

/**
 * Check if a rule exists
 * @param key - Rule key
 * @returns True if rule is registered
 */
export function hasRule(key: string): boolean {
  return key in RULES;
}

/**
 * Remove a rule from registry
 * @param key - Rule key
 * @returns True if rule was removed
 */
export function unregisterRule(key: string): boolean {
  if (RULES[key]) {
    delete RULES[key];
    return true;
  }
  return false;
}

/**
 * Clear all rules (useful for testing)
 */
export function clearRules(): void {
  Object.keys(RULES).forEach((key) => delete RULES[key]);
}

/**
 * Get rules filtered by domain
 * @param domain - Domain to filter by
 * @returns Array of rules in domain
 */
export function getRulesByDomain(domain: string): InsightRule[] {
  return Object.values(RULES).filter((rule) => rule.domain === domain);
}

/**
 * Get rules filtered by severity
 * @param severity - Severity to filter by
 * @returns Array of rules with severity
 */
export function getRulesBySeverity(severity: string): InsightRule[] {
  return Object.values(RULES).filter((rule) => rule.severity === severity);
}

/**
 * Get rules filtered by tag
 * @param tag - Tag to filter by
 * @returns Array of rules with tag
 */
export function getRulesByTag(tag: string): InsightRule[] {
  return Object.values(RULES).filter((rule) => rule.tags?.includes(tag));
}
