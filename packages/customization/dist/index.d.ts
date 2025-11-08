import { PolicyRule } from '@repo/policy-engine';

/**
 * Customization Schema
 */
interface CustomizationConfig {
    dashboards?: {
        layout?: 'grid' | 'list' | 'compact';
        widgets?: string[];
        defaultView?: string;
    };
    insights?: {
        enabled?: boolean;
        autoRefresh?: boolean;
        refreshInterval?: number;
    };
    commandPalette?: {
        enabled?: boolean;
        recentCommands?: number;
    };
    theme?: {
        mode?: 'light' | 'dark' | 'auto';
        accentColor?: string;
    };
}
declare const DEFAULT_CONFIG: CustomizationConfig;

/**
 * Customization Cascade - Global→Tenant→Role→Team→User
 */

interface CustomizationLayer {
    level: 'global' | 'tenant' | 'role' | 'team' | 'user';
    id: string;
    config: Record<string, any>;
    policyRules?: PolicyRule[];
    priority: number;
}
/**
 * Get cascaded configuration
 * Priority: user > team > role > tenant > global (last writer wins, deny > allow)
 */
declare function getConfig(context: {
    tenantId: string;
    roleIds?: string[];
    teamId?: string;
    userId?: string;
}): Record<string, any>;
/**
 * Merge layers with priority
 */
declare function mergeLayers(layers: CustomizationLayer[]): Record<string, any>;
/**
 * Invalidate cache
 */
declare function invalidateCache(context?: {
    tenantId?: string;
    roleId?: string;
    userId?: string;
}): void;

export { type CustomizationConfig, type CustomizationLayer, DEFAULT_CONFIG, getConfig, invalidateCache, mergeLayers };
