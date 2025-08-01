import { 
  BarChart3,
  Car,
  Handshake,
  Users,
  Calculator,
  FileText,
  Timer,
  TrendingUp,
  Target,
  Brain,
  Shield,
  Workflow,
  MessageSquare,
  Building,
  Wrench,
  DollarSign,
  Settings,
  User
} from "lucide-react";

export interface NavigationItem {
  name: string;
  href?: string;
  icon?: any;
  isSection?: boolean;
  children?: NavigationItem[];
  badge?: string;
}

export const navigation: NavigationItem[] = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: BarChart3 
  },
  
  // Sales Department
  { 
    name: "Sales Department", 
    isSection: true,
    children: [
      { name: "Inventory", href: "/inventory", icon: Car },
      { name: "Sales & Leads", href: "/sales", icon: Handshake },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Deals", href: "/deals-list", icon: FileText },
      { name: "Showroom Manager", href: "/showroom-manager", icon: Timer },
      { name: "Deal Jackets", href: "/deal-jackets/sample_deal", icon: FileText },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Competitive Pricing", href: "/competitive-pricing", icon: Target },
      { name: "ML Dashboard", href: "/ml-dashboard", icon: Brain },
      { name: "F&I Operations", href: "/fi-dashboard", icon: Shield },
      { name: "Smart Workflows", href: "/workflow-assistant", icon: Workflow },
      { name: "Communication Demo", href: "/communication-demo", icon: MessageSquare },
      { name: "AI Smart Search", href: "/ai-smart-search", icon: Brain },
    ]
  },
  
  // Service Department
  { 
    name: "Service Department", 
    isSection: true,
    children: [
      { name: "Service Orders", href: "/service/orders", icon: Wrench },
      { name: "Parts Inventory", href: "/service/parts", icon: Car },
      { name: "Service Reports", href: "/service/reports", icon: BarChart3 },
    ]
  },
  
  // Accounting Department
  { 
    name: "Accounting Department", 
    isSection: true,
    children: [
      { name: "Accounting Dashboard", href: "/accounting", icon: DollarSign },
      { name: "Financial Reports", href: "/accounting/reports", icon: BarChart3 },
      { name: "Payroll", href: "/accounting/payroll", icon: Users },
      { name: "Transactions", href: "/accounting/transactions", icon: FileText },
    ]
  },
  
  // Administration
  { 
    name: "Administration", 
    isSection: true,
    children: [
      { name: "User Management", href: "/admin/user-management", icon: Users },
      { name: "My Profile", href: "/admin/user-profile", icon: User },
      { name: "System Configuration", href: "/admin/system-configuration", icon: Settings },
      { name: "Lead Distribution", href: "/admin/lead-distribution", icon: Target },
      { name: "Enterprise Config", href: "/admin/comprehensive-settings", icon: Settings },
      { name: "Multi-Store Management", href: "/multi-store-management", icon: Building },
      { name: "Multi-Store Management", href: "/multi-store-management", icon: Building },
    ]
  },
];