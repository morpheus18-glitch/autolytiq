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
  Shield,
  ShieldCheck,
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
      { label: 'Pricing Insights', path: '/inventory/pricing', icon: TrendingUp },
      { label: 'Trade Appraisals', path: '/inventory/trade-appraisals', icon: Car },
      { label: 'Competitive Pricing', path: '/inventory/competitive-pricing', icon: TrendingUp }
    ]
  },
  {
    id: 'crm',
    label: 'CRM & Leads',
    icon: Users,
    path: '/leads',
    subItems: [
      { label: 'Lead Management', path: '/leads/management', icon: Users },
      { label: 'Lead Dashboard', path: '/leads/dashboard', icon: Handshake },
      { label: 'Market Leads', path: '/leads/market', icon: Megaphone },
      { label: 'Customer Records', path: '/customers', icon: Users },
      { label: 'Customer Detail', path: '/customers/detail', icon: User }
    ]
  },
  {
    id: 'sales',
    label: 'Sales Process',
    icon: DollarSign,
    path: '/deals',
    subItems: [
      { label: 'Active Deals', path: '/deals', icon: Calculator, badge: '3' },
      { label: 'Deal Desk', path: '/deals/deal-desk', icon: Calculator },
      { label: 'Leads Pipeline', path: '/leads/dashboard', icon: Users },
      { label: 'Customer Management', path: '/customers', icon: Users }
    ]
  },
  {
    id: 'finance',
    label: 'Finance & Insurance',
    icon: Shield,
    path: '/finance',
    subItems: [
      {
        label: 'F&I Command Center',
        path: '/finance',
        icon: Shield,
        matchPaths: ['/fi-dashboard', '/fi/deal-jackets', '/fi/deals'],
      },
      {
        label: 'Lender Network',
        path: '/finance/lenders',
        icon: Handshake,
        matchPaths: ['/fi/deals', '/fi/deals/:id/lenders'],
      },
      { label: 'Rate Sheets', path: '/finance/rates', icon: DollarSign },
      {
        label: 'Compliance Engine',
        path: '/finance/compliance',
        icon: ShieldCheck,
      },
      { label: 'Finance Reports', path: '/finance/reports', icon: BarChart3 },
      {
        label: 'F&I Configuration',
        path: '/fi-configuration',
        icon: Settings,
        matchPaths: ['/fi-configuration'],
      },
    ],
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
      { label: 'CRM Analytics', path: '/analytics/crm', icon: Users },
      { label: 'Market Intelligence', path: '/inventory/competitive-pricing', icon: TrendingUp },
      { label: 'ML Model Comparison', path: '/admin/ml-model-comparison', icon: Database }
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
  },
  {
    id: 'accounting',
    label: 'Accounting',
    icon: Calculator,
    path: '/accounting',
    subItems: [
      { label: 'Accounting Dashboard', path: '/accounting', icon: BarChart3 },
      { label: 'Transactions', path: '/accounting/transactions', icon: FileText },
      { label: 'Financial Reports', path: '/accounting/reports', icon: DollarSign },
      { label: 'Payroll', path: '/accounting/payroll', icon: Users }
    ]
  }
];

export const MOBILE_PRIMARY_NAV_ITEMS: MobileNavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-600', matchPaths: ['/', '/dashboard'] },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600', matchPaths: ['/customers/'] },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-purple-600', matchPaths: ['/inventory/'] },
  { name: 'More', href: '#', icon: MenuIcon, color: 'text-gray-600', isMenu: true }
];

export const MOBILE_ALL_NAV_ITEMS: MobileNavItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: Home, color: 'text-blue-600', matchPaths: ['/', '/dashboard'] },
  { name: 'Leads', href: '/leads/dashboard', icon: Users, color: 'text-sky-600', matchPaths: ['/leads'] },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600' },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-purple-600' },
  { name: 'Finance & Insurance', href: '/finance', icon: Shield, color: 'text-emerald-600', matchPaths: ['/finance', '/fi-dashboard'] },
  { name: 'Accounting', href: '/accounting', icon: DollarSign, color: 'text-emerald-600', matchPaths: ['/accounting/'] },
  { name: 'Deals', href: '/deals', icon: Calculator, color: 'text-orange-600' },
  { name: 'Deal Desk', href: '/deals/deal-desk', icon: Calculator, color: 'text-rose-600' },
  { name: 'Communications', href: '/communications/center', icon: MessageSquare, color: 'text-cyan-600' },
  { name: 'Analytics', href: '/analytics', icon: TrendingUp, color: 'text-pink-600' },
  { name: 'Reports', href: '/reports', icon: BarChart3, color: 'text-yellow-600' },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
  { name: 'Admin', href: '/admin/system-health', icon: Building, color: 'text-red-600', matchPaths: ['/admin/'] }
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
  { label: 'Open F&I Dashboard', href: '/finance', icon: Shield },
  { label: 'Track Visit', href: '/showroom', icon: Timer }
] as const;
