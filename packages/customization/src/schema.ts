/**
 * Customization Schema
 */

export interface CustomizationConfig {
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

export const DEFAULT_CONFIG: CustomizationConfig = {
  dashboards: {
    layout: 'grid',
    defaultView: 'overview',
  },
  insights: {
    enabled: true,
    autoRefresh: true,
    refreshInterval: 300000, // 5 min
  },
  commandPalette: {
    enabled: true,
    recentCommands: 5,
  },
  theme: {
    mode: 'auto',
  },
};
