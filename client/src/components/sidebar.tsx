import { Link, useLocation } from "wouter";
import { 
  Car, 
  BarChart3, 
  Handshake, 
  Users, 
  TrendingUp, 
  Settings, 
  Target, 
  Wrench, 
  DollarSign, 
  Shield, 
  Building, 
  Calculator,
  Menu,
  X,
  Brain,
  Timer,
  Cog,
  MessageSquare,
  Workflow,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navigation = [
  { name: "Dashboard", href: "/", icon: BarChart3 },
  
  // Sales Department
  { 
    name: "Sales Department", 
    isSection: true,
    children: [
      { name: "Inventory", href: "/inventory", icon: Car },
      { name: "Sales & Leads", href: "/sales", icon: Handshake },
      { name: "Mobile Sales", href: "/sales-mobile", icon: Handshake },
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Deal Desk", href: "/deals", icon: Calculator },
      { name: "Showroom Manager", href: "/showroom-manager", icon: Timer },
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
      { name: "Financial Reports", href: "/accounting/reports", icon: DollarSign },
      { name: "Payroll", href: "/accounting/payroll", icon: Users },
      { name: "Transactions", href: "/accounting/transactions", icon: BarChart3 },
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
    ]
  },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onClose, onToggle }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {/* Mobile menu button */}
      <div className="md:hidden fixed top-2 left-2 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="bg-white dark:bg-gray-800 shadow-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-700 p-2"
        >
          {isOpen ? <X className="h-3 w-3" /> : <Menu className="h-3 w-3" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        sidebar
        fixed md:relative
        top-0 left-0
        h-full
        w-80 md:w-64
        bg-white dark:bg-gray-900
        shadow-xl 
        border-r 
        border-gray-200 dark:border-gray-700 
        flex 
        flex-col
        z-50
        transform 
        transition-transform 
        duration-300 
        ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0
      `}>
        {/* Logo and Brand */}
        <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 md:space-x-3">
              <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Car className="text-white text-sm md:text-lg" />
              </div>
              <div>
                <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-gray-100">AutolytiQ</h1>
                <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">Dealership Management</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden p-1 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-2 md:p-4 space-y-1 md:space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            if (item.isSection) {
              return (
                <div key={item.name} className="mb-3 md:mb-4">
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    {item.name}
                  </h3>
                  <div className="space-y-1">
                    {item.children?.map((child) => {
                      const isActive = location === child.href;
                      const Icon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href || '#'}
                          className={`
                            flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                            ${isActive 
                              ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                            }
                          `}
                          onClick={onClose}
                        >
                          {Icon && <Icon className="mr-3 h-4 w-4 flex-shrink-0" />}
                          <span className="truncate">{child.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            } else {
              const isActive = location === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href || '#'}
                  className={`
                    flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 mb-2
                    ${isActive 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md' 
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                    }
                  `}
                  onClick={onClose}
                >
                  {Icon && <Icon className="mr-3 h-4 w-4 flex-shrink-0" />}
                  <span className="truncate">{item.name}</span>
                </Link>
              );
            }
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
            <p>© 2025 AutolytiQ System</p>
            <p className="text-gray-400 dark:text-gray-500">v2.0.0 Enterprise</p>
          </div>
        </div>
      </div>
    </>
  );
}