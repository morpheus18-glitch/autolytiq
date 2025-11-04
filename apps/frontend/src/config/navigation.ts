import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Users,
  User,
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
  Menu as MenuIcon,
  ClipboardCheck,
  PencilLine,
  GitCompare,
  UserCheck,
  TrendingDown,
  Phone,
  Mail,
  MessageCircle,
  BookOpen,
  Lock,
  UserCog,
  Briefcase,
  School,
  Activity,
  Globe,
  Palette,
  Bell,
  Key,
  Store,
  CreditCard,
  Receipt,
  Landmark,
  PiggyBank,
  Wallet,
  ArrowUpDown,
  FileSignature,
  FolderOpen,
  CheckSquare,
  Send,
  FileCheck,
  Columns,
  Store,
  Scan
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
    id: 'desking',
    label: 'Desking Tools',
    icon: PencilLine,
    path: '/desking/workspace',
    subItems: [
      { label: 'Initial Pencil', path: '/desking/initial-pencil', icon: PencilLine },
      { label: 'Desking Workspace', path: '/desking/workspace', icon: Briefcase },
      { label: 'Deal Comparison', path: '/desking/deal-comparison', icon: GitCompare },
      { label: 'Customer Counter', path: '/desking/customer-counter', icon: UserCheck },
      { label: 'Approval Analysis', path: '/desking/approval-analysis', icon: CheckSquare }
    ]
  },
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Car,
    path: '/inventory',
    subItems: [
      { label: 'Vehicle Inventory', path: '/inventory', icon: Car },
      { label: 'Trade Appraisal', path: '/inventory/trade-appraisal', icon: Scan },
      { label: 'Vehicle Detail', path: '/inventory/vehicle/1', icon: Car },
      { label: 'Lot Management', path: '/inventory/lot-management', icon: Database },
      { label: 'Pricing Insights', path: '/inventory/pricing', icon: TrendingUp },
      { label: 'Competitive Pricing', path: '/inventory/competitive-pricing', icon: TrendingUp }
    ]
  },
  {
    id: 'crm',
    label: 'CRM & Leads',
    icon: Users,
    path: '/crm/pipeline',
    subItems: [
      { label: 'Lead Pipeline', path: '/crm/pipeline', icon: Columns },
      { label: 'Showroom Manager', path: '/showroom/manager', icon: Store },
      { label: 'Lead Management', path: '/leads/management', icon: Users },
      { label: 'Lead Dashboard', path: '/leads/dashboard', icon: Handshake },
      { label: 'Market Leads', path: '/leads/market', icon: Megaphone },
      { label: 'Customer Records', path: '/customers', icon: Users },
      { label: 'Customer Detail', path: '/customers/detail/1', icon: User },
      { label: 'Texting Portal', path: '/customers/texting-portal', icon: MessageCircle },
      { label: 'Phone Calls', path: '/customers/phone-calls', icon: Phone },
      { label: 'Customer Lifecycle', path: '/analytics/customer-lifecycle', icon: Activity }
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
    path: '/misc/fi-dashboard',
    subItems: [
      {
        label: 'F&I Command Center',
        path: '/misc/fi-dashboard',
        icon: Shield,
        matchPaths: ['/fi-dashboard', '/misc/fi-dashboard'],
      },
      {
        label: 'Deal Desk',
        path: '/deals/deal-desk',
        icon: FileSignature,
        matchPaths: ['/deals/deal-desk'],
      },
      {
        label: 'Digital Deal Jackets',
        path: '/fi/deal-jackets',
        icon: FileText,
      },
      {
        label: 'Lender Submissions',
        path: '/fi/lender-submissions',
        icon: Send,
      },
      {
        label: 'Contracting',
        path: '/fi/contracting',
        icon: FileCheck,
      },
      {
        label: 'Lender Network',
        path: '/finance/lenders',
        icon: Handshake,
      },
      { label: 'Rate Sheets', path: '/finance/rates', icon: DollarSign },
      {
        label: 'Compliance Manager',
        path: '/finance/compliance-manager',
        icon: ShieldCheck,
      },
      { label: 'Finance Reports', path: '/finance/reports', icon: BarChart3 },
      {
        label: 'F&I Configuration',
        path: '/misc/fi-configuration',
        icon: Settings,
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
      { label: 'Technician Schedule', path: '/service/schedule', icon: Users },
      { label: 'Service Orders', path: '/service/orders', icon: ClipboardCheck },
      { label: 'Service Overview', path: '/service/overview', icon: Activity },
      { label: 'Service Reports', path: '/service/reports', icon: FileText }
    ]
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: BarChart3,
    path: '/analytics/crm',
    subItems: [
      { label: 'CRM Analytics', path: '/analytics/crm', icon: Users },
      { label: 'Customer Lifecycle', path: '/analytics/customer-lifecycle', icon: Activity },
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
      { label: 'Accounting Dashboard', path: '/accounting/dashboard', icon: BarChart3 },
      { label: 'Transactions', path: '/accounting/transactions', icon: FileText },
      { label: 'Chart of Accounts', path: '/accounting/chart-of-accounts', icon: FolderOpen },
      { label: 'GL Accounts', path: '/accounting/gl-accounts', icon: BookOpen },
      { label: 'GL Account Form', path: '/accounting/gl-account-form', icon: FileText },
      { label: 'Journal Entries', path: '/accounting/journal-entries', icon: PencilLine },
      { label: 'Journal Entry Form', path: '/accounting/journal-entry-form', icon: FileSignature },
      { label: 'Monthly Close', path: '/accounting/monthly-close', icon: CheckSquare },
      { label: 'Vehicle Profit', path: '/accounting/vehicle-profit', icon: Car },
      { label: 'Finance Reserves', path: '/accounting/finance-reserves', icon: PiggyBank },
      { label: 'Deal Finalization', path: '/accounting/deal-finalization', icon: ClipboardCheck },
      { label: 'Payroll', path: '/accounting/payroll', icon: Users },
      { label: 'Payroll Calculation', path: '/accounting/payroll-calculation', icon: Calculator },
      { label: 'Balance Sheet', path: '/accounting/balance-sheet', icon: Landmark },
      { label: 'P&L Statement', path: '/accounting/pl-statement', icon: TrendingUp },
      { label: 'Cash Flow Statement', path: '/accounting/cash-flow-statement', icon: Wallet },
      { label: 'Tax Reports', path: '/accounting/tax-reports', icon: Receipt },
      { label: 'Financial Reports', path: '/accounting/reports', icon: DollarSign },
      { label: 'Accounting Layout', path: '/accounting/layout', icon: Settings },
      { label: 'Accounting Dashboard Alt', path: '/accounting/dashboard-alt', icon: BarChart3 }
    ]
  },
  {
    id: 'communications',
    label: 'Communications',
    icon: MessageSquare,
    path: '/communications',
    subItems: [
      { label: 'Communication Center', path: '/communications/center', icon: MessageSquare },
      { label: 'Call Center', path: '/communications/call-center', icon: Phone },
      { label: 'Email Composer', path: '/communications/email', icon: Mail },
      { label: 'SMS Inbox', path: '/communications/sms', icon: MessageCircle },
      { label: 'Communication Demo', path: '/communications/demo', icon: Globe }
    ]
  },
  {
    id: 'admin',
    label: 'Admin',
    icon: Building,
    path: '/admin',
    subItems: [
      { label: 'System Health', path: '/admin/system-health', icon: Activity },
      { label: 'User Management', path: '/admin/user-management', icon: Users },
      { label: 'User Profile', path: '/admin/user-profile', icon: User },
      { label: 'User Permissions', path: '/admin/user-permissions', icon: Key },
      { label: 'Users', path: '/admin/users', icon: Users },
      { label: 'Roles', path: '/admin/roles', icon: Shield },
      { label: 'Role Management', path: '/admin/role-management', icon: UserCog },
      { label: 'Role Presets', path: '/admin/role-presets', icon: ClipboardCheck },
      { label: 'Departments', path: '/admin/departments', icon: Building },
      { label: 'Security Center', path: '/admin/security-center', icon: Lock },
      { label: 'Training Center', path: '/admin/training-center', icon: School },
      { label: 'System Settings', path: '/admin/system-settings', icon: Settings },
      { label: 'System Configuration', path: '/admin/system-configuration', icon: Database },
      { label: 'Dealer Configuration', path: '/admin/dealer-configuration', icon: Store },
      { label: 'Multi-Store', path: '/admin/multi-store', icon: Store },
      { label: 'Integration Setup', path: '/admin/integration-setup', icon: Globe },
      { label: 'Communication Settings', path: '/admin/communication-settings', icon: MessageSquare },
      { label: 'Comprehensive Settings', path: '/admin/comprehensive-settings', icon: Settings },
      { label: 'Lead Distribution', path: '/admin/lead-distribution', icon: Users },
      { label: 'Performance Tracking', path: '/admin/performance-tracking', icon: TrendingUp },
      { label: 'ML Developer', path: '/admin/ml-developer', icon: Database },
      { label: 'ML Model Comparison', path: '/admin/ml-model-comparison', icon: GitCompare }
    ]
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: Settings,
    path: '/settings',
    subItems: [
      { label: 'Settings Overview', path: '/settings', icon: Settings },
      { label: 'Analytics Settings', path: '/settings/analytics', icon: BarChart3 },
      { label: 'Branding Settings', path: '/settings/branding', icon: Palette },
      { label: 'Data Settings', path: '/settings/data', icon: Database },
      { label: 'Dealership Settings', path: '/settings/dealership', icon: Store },
      { label: 'Developer Settings', path: '/settings/developer', icon: Database },
      { label: 'Forms Settings', path: '/settings/forms', icon: FileText },
      { label: 'Integrations Settings', path: '/settings/integrations', icon: Globe },
      { label: 'Notifications Settings', path: '/settings/notifications', icon: Bell },
      { label: 'Pricing Rules Settings', path: '/settings/pricing-rules', icon: DollarSign },
      { label: 'Security Settings', path: '/settings/security', icon: Lock },
      { label: 'Settings Layout', path: '/settings/layout', icon: Settings },
      { label: 'Users Settings', path: '/settings/users', icon: Users }
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
  { name: 'Desking Tools', href: '/desking/workspace', icon: PencilLine, color: 'text-indigo-600', matchPaths: ['/desking/'] },
  { name: 'Leads', href: '/leads/dashboard', icon: Users, color: 'text-sky-600', matchPaths: ['/leads'] },
  { name: 'Customers', href: '/customers', icon: Users, color: 'text-green-600' },
  { name: 'Inventory', href: '/inventory', icon: Car, color: 'text-purple-600' },
  { name: 'Finance & Insurance', href: '/misc/fi-dashboard', icon: Shield, color: 'text-emerald-600', matchPaths: ['/finance/', '/misc/fi-dashboard', '/misc/fi-configuration'] },
  { name: 'Accounting', href: '/accounting/dashboard', icon: Calculator, color: 'text-teal-600', matchPaths: ['/accounting/'] },
  { name: 'Deals', href: '/deals', icon: DollarSign, color: 'text-orange-600' },
  { name: 'Deal Desk', href: '/deals/deal-desk', icon: Briefcase, color: 'text-rose-600' },
  { name: 'Service', href: '/service/appointments', icon: Wrench, color: 'text-amber-600', matchPaths: ['/service/'] },
  { name: 'Communications', href: '/communications/center', icon: MessageSquare, color: 'text-cyan-600' },
  { name: 'Analytics', href: '/analytics/crm', icon: TrendingUp, color: 'text-pink-600', matchPaths: ['/analytics/'] },
  { name: 'Reports', href: '/reports/sales', icon: BarChart3, color: 'text-yellow-600', matchPaths: ['/reports/'] },
  { name: 'Settings', href: '/settings', icon: Settings, color: 'text-gray-600' },
  { name: 'Admin', href: '/admin/system-health', icon: Building, color: 'text-red-600', matchPaths: ['/admin/'] }
];

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'desking-workspace',
    label: 'Desking Workspace',
    description: 'Start desking a deal',
    icon: PencilLine,
    target: '/desking/workspace',
    accentClass: 'text-indigo-600'
  },
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
    id: 'fi-dashboard',
    label: 'F&I Dashboard',
    description: 'Manage finance & insurance',
    icon: Shield,
    target: '/misc/fi-dashboard',
    accentClass: 'text-emerald-600'
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
  { label: 'Desking Workspace', href: '/desking/workspace', icon: PencilLine },
  { label: 'Initial Pencil', href: '/desking/initial-pencil', icon: PencilLine },
  { label: 'Add Customer', href: '/customers', icon: Users },
  { label: 'Add Vehicle', href: '/inventory', icon: Car },
  { label: 'New Deal', href: '/deals', icon: Calculator },
  { label: 'Deal Desk', href: '/deals/deal-desk', icon: Briefcase },
  { label: 'F&I Dashboard', href: '/misc/fi-dashboard', icon: Shield },
  { label: 'F&I Configuration', href: '/misc/fi-configuration', icon: Settings },
  { label: 'Service Appointment', href: '/service/appointments', icon: Wrench }
] as const;
