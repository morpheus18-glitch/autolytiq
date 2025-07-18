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
  Timer
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
      { name: "Customers", href: "/customers", icon: Users },
      { name: "Deal Desk", href: "/deals", icon: Calculator },
      { name: "Showroom Manager", href: "/showroom-manager", icon: Timer },
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
      { name: "Reports", href: "/reports", icon: BarChart3 },
      { name: "Competitive Pricing", href: "/competitive-pricing", icon: Target },
      { name: "ML Dashboard", href: "/ml-dashboard", icon: Brain },
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
      { name: "Departments", href: "/admin/departments", icon: Building },
      { name: "Roles & Permissions", href: "/admin/roles", icon: Shield },
      { name: "User Management", href: "/admin/users", icon: Users },
      { name: "Settings", href: "/settings", icon: Settings },
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
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="bg-white shadow-md"
        >
          {isOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div className={`
        sidebar
        fixed md:relative
        top-0 left-0
        h-full
        w-64 
        bg-white 
        shadow-lg 
        border-r 
        border-gray-200 
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
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Car className="text-white text-lg" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">AutolytiQ</h1>
                <p className="text-sm text-gray-500">Dealership Management</p>
              </div>
            </div>
            {/* Close button for mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="md:hidden"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navigation.map((item) => {
            if (item.isSection) {
              return (
                <div key={item.name}>
                  <h3 className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    {item.name}
                  </h3>
                  <div className="space-y-1">
                    {item.children?.map((child) => {
                      const isActive = location === child.href;
                      const Icon = child.icon;
                      return (
                        <Link
                          key={child.href}
                          href={child.href}
                          className={`
                            flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                            ${isActive 
                              ? 'bg-primary text-white' 
                              : 'text-gray-700 hover:bg-gray-100'
                            }
                          `}
                          onClick={onClose}
                        >
                          <Icon className="mr-3 h-4 w-4" />
                          {child.name}
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
                  href={item.href}
                  className={`
                    flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-primary text-white' 
                      : 'text-gray-700 hover:bg-gray-100'
                    }
                  `}
                  onClick={onClose}
                >
                  <Icon className="mr-3 h-4 w-4" />
                  {item.name}
                </Link>
              );
            }
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            <p>© 2024 AutolytiQ System</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </div>
    </>
  );
}