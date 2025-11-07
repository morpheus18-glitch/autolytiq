/**
 * Policy Registry - Load and Merge Rules
 *
 * Loads rules from defaults + tenant config
 * Supports customization cascade
 */

import type { PolicyRule } from './rules.js';
import { DEFAULT_GLOBAL_RULES, DEFAULT_ROLE_RULES } from './rules.js';

export interface PolicyRegistry {
  /** All registered rules */
  rules: Map<string, PolicyRule>;
  /** Last updated timestamp */
  lastUpdated: Date;
}

let registry: PolicyRegistry = {
  rules: new Map(),
  lastUpdated: new Date(),
};

/**
 * Initialize registry with defaults
 */
export function initRegistry(): void {
  registry.rules.clear();
  
  // Load global defaults
  for (const rule of DEFAULT_GLOBAL_RULES) {
    registry.rules.set(rule.id, rule);
  }
  
  // Load role defaults
  for (const rule of Object.values(DEFAULT_ROLE_RULES)) {
    registry.rules.set(rule.id, rule);
  }
  
  registry.lastUpdated = new Date();
}

/**
 * Load rules from external source (database, config file, etc.)
 */
export function loadRules(rules: PolicyRule[]): void {
  for (const rule of rules) {
    registry.rules.set(rule.id, rule);
  }
  registry.lastUpdated = new Date();
}

/**
 * Add or update a single rule
 */
export function upsertRule(rule: PolicyRule): void {
  registry.rules.set(rule.id, rule);
  registry.lastUpdated = new Date();
}

/**
 * Remove a rule
 */
export function deleteRule(ruleId: string): void {
  registry.rules.delete(ruleId);
  registry.lastUpdated = new Date();
}

/**
 * Get all rules
 */
export function getAllRules(): PolicyRule[] {
  return Array.from(registry.rules.values());
}

/**
 * Get rules for specific context
 */
export function getRulesForContext(filter: {
  tenantId?: string;
  roleIds?: string[];
  userId?: string;
  teamId?: string;
}): PolicyRule[] {
  return Array.from(registry.rules.values()).filter(rule => {
    // Always include global rules
    if (rule.level === 'global') return true;
    
    // Include tenant rules
    if (rule.level === 'tenant' && rule.tenantId === filter.tenantId) return true;
    
    // Include role rules
    if (rule.level === 'role' && filter.roleIds?.includes(rule.roleId!)) return true;
    
    // Include team rules
    if (rule.level === 'team' && rule.teamId === filter.teamId) return true;
    
    // Include user rules
    if (rule.level === 'user' && rule.userId === filter.userId) return true;
    
    return false;
  });
}

/**
 * Get a specific rule by ID
 */
export function getRule(ruleId: string): PolicyRule | undefined {
  return registry.rules.get(ruleId);
}

/**
 * Clear all rules (use with caution)
 */
export function clearRegistry(): void {
  registry.rules.clear();
  registry.lastUpdated = new Date();
}

/**
 * Get registry metadata
 */
export function getRegistryInfo(): {
  ruleCount: number;
  lastUpdated: Date;
  rulesByLevel: Record<string, number>;
} {
  const rules = Array.from(registry.rules.values());
  const rulesByLevel: Record<string, number> = {};
  
  for (const rule of rules) {
    rulesByLevel[rule.level] = (rulesByLevel[rule.level] || 0) + 1;
  }
  
  return {
    ruleCount: rules.length,
    lastUpdated: registry.lastUpdated,
    rulesByLevel,
  };
}

// Initialize with defaults on module load
initRegistry();
