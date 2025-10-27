/**
 * AutolytiQ Theme Utility
 * Module-specific gradient colors and design patterns
 */

export type ModuleType = 
  | 'desking' 
  | 'accounting' 
  | 'crm' 
  | 'inventory' 
  | 'analytics' 
  | 'service';

export interface ModuleTheme {
  gradient: string;
  primaryClass: string;
  lightBgClass: string;
  iconClass: string;
  badgeClass: string;
  cardClass: string;
  hoverBgClass: string;
}

/**
 * Module color themes - Full Tailwind classes to prevent purging
 */
export const moduleThemes: Record<ModuleType, ModuleTheme> = {
  desking: {
    gradient: 'from-blue-600 to-blue-700',
    primaryClass: 'text-blue-600',
    lightBgClass: 'bg-blue-50',
    iconClass: 'text-blue-600',
    badgeClass: 'bg-blue-100 text-blue-700',
    cardClass: 'bg-blue-100',
    hoverBgClass: 'hover:bg-blue-700'
  },
  accounting: {
    gradient: 'from-emerald-600 to-emerald-700',
    primaryClass: 'text-emerald-600',
    lightBgClass: 'bg-emerald-50',
    iconClass: 'text-emerald-600',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    cardClass: 'bg-emerald-100',
    hoverBgClass: 'hover:bg-emerald-700'
  },
  crm: {
    gradient: 'from-indigo-600 to-indigo-700',
    primaryClass: 'text-indigo-600',
    lightBgClass: 'bg-indigo-50',
    iconClass: 'text-indigo-600',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    cardClass: 'bg-indigo-100',
    hoverBgClass: 'hover:bg-indigo-700'
  },
  inventory: {
    gradient: 'from-slate-600 to-slate-700',
    primaryClass: 'text-slate-600',
    lightBgClass: 'bg-slate-50',
    iconClass: 'text-slate-600',
    badgeClass: 'bg-slate-100 text-slate-700',
    cardClass: 'bg-slate-100',
    hoverBgClass: 'hover:bg-slate-700'
  },
  analytics: {
    gradient: 'from-purple-600 to-purple-700',
    primaryClass: 'text-purple-600',
    lightBgClass: 'bg-purple-50',
    iconClass: 'text-purple-600',
    badgeClass: 'bg-purple-100 text-purple-700',
    cardClass: 'bg-purple-100',
    hoverBgClass: 'hover:bg-purple-700'
  },
  service: {
    gradient: 'from-teal-600 to-teal-700',
    primaryClass: 'text-teal-600',
    lightBgClass: 'bg-teal-50',
    iconClass: 'text-teal-600',
    badgeClass: 'bg-teal-100 text-teal-700',
    cardClass: 'bg-teal-100',
    hoverBgClass: 'hover:bg-teal-700'
  }
};

/**
 * Get module theme
 */
export function getModuleTheme(module: ModuleType): ModuleTheme {
  return moduleThemes[module];
}

/**
 * Get gradient header classes
 */
export function getHeaderGradient(module: ModuleType): string {
  return `bg-gradient-to-r ${moduleThemes[module].gradient}`;
}

/**
 * Get icon color class
 */
export function getIconColor(module: ModuleType): string {
  return moduleThemes[module].iconClass;
}

/**
 * Get badge classes
 */
export function getBadgeClasses(module: ModuleType): string {
  return moduleThemes[module].badgeClass;
}

/**
 * Get primary color class (for buttons, links, etc)
 */
export function getPrimaryColor(module: ModuleType): string {
  return moduleThemes[module].primaryClass;
}

/**
 * Get light background class
 */
export function getLightBg(module: ModuleType): string {
  return moduleThemes[module].lightBgClass;
}

/**
 * Get card background class
 */
export function getCardBg(module: ModuleType): string {
  return moduleThemes[module].cardClass;
}

/**
 * Get hover background class
 */
export function getHoverBg(module: ModuleType): string {
  return moduleThemes[module].hoverBgClass;
}

/**
 * Status badge colors (universal across modules)
 */
export const statusColors = {
  success: 'bg-green-100 text-green-700',
  warning: 'bg-yellow-100 text-yellow-700',
  error: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  pending: 'bg-orange-100 text-orange-700',
  active: 'bg-green-500 text-white',
  inactive: 'bg-gray-500 text-white',
  hot: 'bg-red-100 text-red-700',
  warm: 'bg-orange-100 text-orange-700',
  cold: 'bg-blue-100 text-blue-700'
};

/**
 * Get status badge classes
 */
export function getStatusBadge(status: string): string {
  const statusLower = status.toLowerCase().replace(/\s+/g, '_');
  return statusColors[statusLower as keyof typeof statusColors] || statusColors.info;
}

/**
 * Metric card gradient backgrounds
 */
export const metricGradients = {
  green: 'from-green-500 to-green-600',
  blue: 'from-blue-500 to-blue-600',
  orange: 'from-orange-500 to-orange-600',
  purple: 'from-purple-500 to-purple-600',
  red: 'from-red-500 to-red-600',
  emerald: 'from-emerald-500 to-emerald-600'
};
