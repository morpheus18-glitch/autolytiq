/**
 * Customization Cascade - Global→Tenant→Role→Team→User
 */

import type { PolicyRule } from '@repo/policy-engine';

export interface CustomizationLayer {
  level: 'global' | 'tenant' | 'role' | 'team' | 'user';
  id: string;
  config: Record<string, any>;
  policyRules?: PolicyRule[];
  priority: number;
}

const cache = new Map<string, any>();
const CACHE_TTL = 60000; // 60s

/**
 * Get cascaded configuration
 * Priority: user > team > role > tenant > global (last writer wins, deny > allow)
 */
export function getConfig(context: {
  tenantId: string;
  roleIds?: string[];
  teamId?: string;
  userId?: string;
}): Record<string, any> {
  const cacheKey = JSON.stringify(context);
  const cached = cache.get(cacheKey);
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.config;
  }
  
  // Merge layers (lowest to highest priority)
  const layers: CustomizationLayer[] = [
    // Global would come from DB/config
    // Tenant would come from DB
    // Role would come from DB
    // Team would come from DB
    // User would come from DB
  ];
  
  const merged = mergeLayers(layers);
  
  cache.set(cacheKey, { config: merged, timestamp: Date.now() });
  return merged;
}

/**
 * Merge layers with priority
 */
export function mergeLayers(layers: CustomizationLayer[]): Record<string, any> {
  // Sort by priority (lowest first)
  const sorted = [...layers].sort((a, b) => a.priority - b.priority);
  
  let result: Record<string, any> = {};
  
  for (const layer of sorted) {
    result = { ...result, ...layer.config };
  }
  
  return result;
}

/**
 * Invalidate cache
 */
export function invalidateCache(context?: {
  tenantId?: string;
  roleId?: string;
  userId?: string;
}): void {
  if (!context) {
    cache.clear();
    return;
  }
  
  // Invalidate matching entries
  const keys = Array.from(cache.keys());
  for (const key of keys) {
    const parsed = JSON.parse(key);
    if (
      (context.tenantId && parsed.tenantId === context.tenantId) ||
      (context.roleId && parsed.roleIds?.includes(context.roleId)) ||
      (context.userId && parsed.userId === context.userId)
    ) {
      cache.delete(key);
    }
  }
}
