import { Link, useLocation } from "wouter";
import { Car, BarChart3, Handshake, Users, TrendingUp, Settings, Target, Wrench, DollarSign, Shield, Building } from "lucide-react";

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
      { name: "Analytics", href: "/analytics", icon: TrendingUp },
      { name: "Competitive Pricing", href: "/competitive-pricing", icon: Target },
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

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Logo and Brand */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Car className="text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">DMD</h1>
            <p className="text-sm text-gray-500">Dealership Management</p>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {navigation.map((item) => {
          // Dashboard (standalone item)
          if (item.href && !item.isSection) {
            const Icon = item.icon;
            const isActive = location === item.href;
            
            return (
              <Link key={item.name} href={item.href}>
                <a
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isActive
                      ? "text-primary bg-blue-50"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </a>
              </Link>
            );
          }
          
          // Section headers with children
          if (item.isSection && item.children) {
            return (
              <div key={item.name} className="space-y-1">
                <div className="px-4 py-2 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                  {item.name}
                </div>
                {item.children.map((child) => {
                  const Icon = child.icon;
                  const isActive = location === child.href;
                  
                  return (
                    <Link key={child.name} href={child.href}>
                      <a
                        className={`flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isActive
                            ? "text-primary bg-blue-50"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{child.name}</span>
                      </a>
                    </Link>
                  );
                })}
              </div>
            );
          }
          
          return null;
        })}
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <Users className="text-gray-600 w-5 h-5" />
          </div>
          <div>
            <p className="font-medium text-gray-900">John Smith</p>
            <p className="text-sm text-gray-500">Sales Manager</p>
          </div>
        </div>
      </div>
    </div>
  );
}
