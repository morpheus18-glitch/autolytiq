/**
 * Seed Configuration
 * Central configuration for database seeding
 */

export const SEED_CONFIG = {
  DEALERSHIP_SUBDOMAIN: 'sunrise-motors',
  DEVELOPER_EMAIL: 'developer@sunrisemotors.demo',
  DEVELOPER_PASSWORD: 'DevAccess!2024',
} as const;

export const DEFAULT_ALLOWED_ROUTES = [
  '/',
  '/dashboard',
  '/inventory',
  '/inventory/pricing',
  '/inventory/lot-management',
  '/inventory/:id',
  '/sales',
  '/deals',
  '/crm',
  '/customers',
  '/leads',
  '/trade-appraisals',
  '/finance',
  '/finance/lenders',
  '/finance/rates',
  '/finance/compliance',
  '/reports',
  '/reports/sales',
  '/reports/inventory',
  '/workflow-assistant',
] as const;

export const DEFAULT_NAVIGATION_SECTIONS = [
  'inventory',
  'crm',
  'sales',
  'finance',
  'reports',
] as const;

export const DEFAULT_QUICK_ACTIONS = ['/customers', '/inventory', '/deals'] as const;

export const DEFAULT_HOME_PATH = '/dashboard' as const;
