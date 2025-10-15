import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Users,
  Car,
  DollarSign,
  Wrench,
  BarChart3,
  Database,
  TrendingUp,
  Handshake,
  Calculator,
  Timer,
  Settings,
  MessageSquare,
  Building,
  FileText,
  Megaphone,
  Menu as MenuIcon
} from 'lucide-react';

export interface NavigationItem {
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
  matchPaths?: string[];
}


export interface NavigationSection {
  id: string;
  label: string;
  icon: LucideIcon;
  path: string;
  subItems?: NavigationItem[];
}

export interface MobileNavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  color: string;
  isMenu?: boolean;
  matchPaths?: string[];
}


export interface QuickAction {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
  target: string;
  accentClass?: string;
}


export const WORKFLOW_SECTIONS: NavigationSection[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Car,
    path: '/inventory',
    subItems: [
      { label: 'Vehicle Inventory', path: '/inventory', icon: Car },
      { label: 'Lot Management', path: '/inventory/lot-management', icon: Database },
      { label: 'Pricing Insights', path: '/inventory/pricing', icon: TrendingUp }
    ]
  },
  {
    id: 'crm',
    label: 'CRM & Leads',
    icon: Users,
    path: '/crm',
    subItems: [
      { label: 'CRM Command Center', path: '/crm', icon: Users },
      { label: 'Lead Pipeline', path: '/leads', icon: Handshake, matchPaths: ['/sales', '/leads'] },
      { label: 'Market Lead Engine', path: '/market-leads', icon: Megaphone },
      { label: 'Customer Records', path: '/customers', icon: Users }
    ]
  },
  {
    id: 'sales',
    label: 'Sales Process',
    icon: DollarSign,
    path: '/sales',
    subItems: [
      { label: 'Active Deals', path: '/deals', icon: Calculator, badge: '3', matchPaths: ['/deals', '/deal-log', '/deal-pipeline', '/deals-list'] },
      { label: 'Deal Desk', path: '/professional-deal-desk', icon: Calculator, matchPaths: ['/professional-deal-desk', '/deal-desk', '/deal-working', '/deals-finance', '/finance/structuring'] },
      { label: 'Leads Pipeline', path: '/leads', icon: Users },
      { label: 'Customer Management', path: '/customers', icon: Users },
      { label: 'Trade Appraisals', path: '/trade-appraisals', icon: Car }
    ]
  },
  {
    id: 'service',
    label: 'Service',
    icon: Wrench,
    path: '/service',
    subItems: [
      { label: "Today's Appointments", path: '/service/appointments', icon: Wrench, badge: '7' },
      { label: 'Service History', path: '/service/history', icon: MessageSquare },
      { label: 'Parts Inventory', path: '/service/parts', icon: Database },
      { label: 'Technician Schedule', path: '/service/schedule', icon: Users }
    ]
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: BarChart3,
    path: '/analytics',
    subItems: [
      { label: 'Performance Dashboard', path: '/analytics', icon: BarChart3 },
      { label: 'Market Intelligence', path: '/competitive-pricing', icon: TrendingUp },
      { label: 'Predictive Analytics', path: '/ml-model-comparison', icon: Database }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    subItems: [
      { label: 'Sales Reports', path: '/reports/sales', icon: DollarSign },
      { label: 'Inventory Reports', path: '/reports/inventory', icon: Car },
      { label: 'Service Reports', path: '/reports/service', icon: Wrench },
      { label: 'Financial Reports', path: '/reports/financial', icon: BarChart3 }
    ]
  }
];

export const MOBILE_PRIMARY_NAV_ITEMS: MobileNavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600', matchPaths: ['/customers/'] },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-purple-600', matchPaths: ['/inventory/'] },
  { name: 'More', href: '#', icon: MenuIcon, color: 'text-gray-600', isMenu: true }
];

export const MOBILE_ALL_NAV_ITEMS: MobileNavItem[] = [
  { name: 'Dashboard', href: '/', icon: Home, color: 'text-blue-600' },
  { name: 'CRM & Leads', href: '/crm', icon: Users, color: 'text-sky-600', matchPaths: ['/crm'] },
  { name: 'Sales & Leads', href: '/sales', icon: Handshake, color: 'text-indigo-600', matchPaths: ['/leads'] },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600' },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-purple-600' },
  { name: 'Deals', href: '/deals', icon: Calculator, color: 'text-orange-600', matchPaths: ['/deals', '/deal-log', '/deal-pipeline', '/deals-list'] },
  { name: 'Deal Desk', href: '/professional-deal-desk', icon: Calculator, color: 'text-rose-600', matchPaths: ['/professional-deal-desk', '/deal-desk', '/deal-working', '/deals-finance', '/finance/structuring'] },
  { name: 'Showroom', href: '/showroom', icon: Timer, color: 'text-cyan-600', matchPaths: ['/showroom-manager'] },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, color: 'text-pink-600', matchPaths: ['/analytics/customer-lifecycle', '/competitive-pricing', '/ml-model-comparison'] },
  { name: 'Reports', href: '/reports', icon: BarChart3, color: 'text-yellow-600', matchPaths: ['/reports/sales', '/reports/inventory', '/reports/service', '/reports/financial'] },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
  { name: 'Admin', href: '/admin/settings', icon: Building, color: 'text-red-600', matchPaths: ['/admin/'] }
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'new-deal',
    label: 'Start New Deal',
    description: 'Create a new customer deal',
    icon: Calculator,
    target: '/deals',
    accentClass: 'text-blue-600'
  },
  {
    id: 'add-vehicle',
    label: 'Add Vehicle',
    description: 'Add to inventory',
    icon: Car,
    target: '/inventory?view=add-vehicle',
    accentClass: 'text-green-600'
  },
  {
    id: 'schedule-service',
    label: 'Schedule Service',
    description: 'Book service appointment',
    icon: Wrench,
    target: '/service/appointments',
    accentClass: 'text-orange-600'
  }
];

export const MOBILE_QUICK_ACTIONS = [
  { label: 'Add Customer', href: '/customers', icon: Users },
  { label: 'Add Vehicle', href: '/inventory', icon: Car },
  { label: 'New Deal', href: '/deals', icon: Calculator },
  { label: 'Open Deal Desk', href: '/professional-deal-desk', icon: Calculator },
  { label: 'Track Visit', href: '/showroom', icon: Timer }
] as const;
