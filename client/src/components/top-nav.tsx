import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
// Removed unused imports for cleaner code
import {
  Home,
  Car,
  Users,
  TrendingUp,
  BarChart3,
  DollarSign,
  FileText,
  Settings,
  ChevronDown,
  UserCog,
  Building2,
  Wrench,
  Calculator,
  Brain,
  Target,
  LogOut,
  User,
  Bell,
  Search,
  Menu
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const primaryNavItems = [
  { 
    label: "Dashboard", 
    path: "/", 
    icon: Home,
    description: "Overview & Analytics"
  },
  { 
    label: "Inventory", 
    path: "/inventory", 
    icon: Car,
    description: "Vehicle Management"
  },
  { 
    label: "Sales", 
    path: "/sales", 
    icon: TrendingUp,
    description: "Leads & Opportunities"
  },
  { 
    label: "Customers", 
    path: "/customers", 
    icon: Users,
    description: "Customer Database"
  },
  { 
    label: "Deal Desk", 
    path: "/deal-desk", 
    icon: DollarSign,
    description: "F&I Processing"
  },
  { 
    label: "Showroom", 
    path: "/showroom-manager", 
    icon: Building2,
    description: "Floor Management"
  },
];

const secondaryNavItems = [
  {
    label: "Analytics",
    items: [
      { label: "Reports", path: "/reports", icon: FileText, description: "Business Reports" },
      { label: "Analytics", path: "/analytics", icon: BarChart3, description: "Performance Metrics" },
      { label: "ML Dashboard", path: "/ml-dashboard", icon: Brain, description: "AI Insights" },
      { label: "Competitive Pricing", path: "/competitive-pricing", icon: Target, description: "Market Analysis" },
    ]
  },
  {
    label: "Management",
    items: [
      { label: "Admin", path: "/admin/users", icon: UserCog, description: "User Management" },
      { label: "Service", path: "/service/orders", icon: Wrench, description: "Service Department" },
      { label: "Accounting", path: "/accounting/reports", icon: Calculator, description: "Financial Management" },
    ]
  }
];

interface TopNavProps {
  className?: string;
}

export default function TopNav({ className }: TopNavProps) {
  const [location] = useLocation();
  const { user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const isActivePath = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  return (
    <header className={cn("bg-white border-b border-gray-200 shadow-sm", className)}>
      {/* Top Bar with Logo and User Info */}
      <div className="h-16 px-4 lg:px-6 flex items-center justify-between">
        {/* Logo and Brand */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">A</span>
            </div>
            <span className="text-xl font-bold text-gray-900 hidden sm:block">AutolytiQ</span>
          </div>
          
          {/* Quick Search - Desktop only */}
          <div className="hidden lg:flex items-center space-x-2 ml-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search inventory, customers..."
                className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Right Side - Notifications and User Menu */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <Button variant="ghost" size="sm" className="relative">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 text-white rounded-full flex items-center justify-center">
              3
            </span>
          </Button>

          {/* User Info */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-medium">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div className="hidden md:block text-left">
                <div className="text-sm font-medium">{user?.firstName} {user?.lastName}</div>
                <div className="text-xs text-gray-500">{user?.email}</div>
              </div>
            </div>
            
            {/* Simple Settings Link */}
            <Link href="/settings">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
            
            {/* Logout Button */}
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-t border-gray-100">
        {/* Desktop Navigation */}
        <div className="hidden md:block">
          <div className="px-4 lg:px-6">
            <div className="flex items-center space-x-1">
              {/* Primary Navigation */}
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 transition-colors",
                        isActive
                          ? "border-blue-600 text-blue-600 bg-blue-50"
                          : "border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}

              {/* Secondary Navigation - Simple Links */}
              <Link href="/reports">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 transition-colors",
                    isActivePath("/reports")
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  <span>Reports</span>
                </Button>
              </Link>
              
              <Link href="/analytics">
                <Button
                  variant="ghost"
                  className={cn(
                    "flex items-center space-x-2 px-4 py-3 text-sm font-medium rounded-none border-b-2 transition-colors",
                    isActivePath("/analytics")
                      ? "border-blue-600 text-blue-600 bg-blue-50"
                      : "border-transparent text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-4 py-4 space-y-2">
              {primaryNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isActivePath(item.path);
                
                return (
                  <Link key={item.path} href={item.path}>
                    <Button
                      variant="ghost"
                      className={cn(
                        "w-full justify-start space-x-2 px-3 py-2",
                        isActive
                          ? "bg-blue-50 text-blue-600"
                          : "text-gray-700 hover:bg-gray-50"
                      )}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </Button>
                  </Link>
                );
              })}
              
              {/* Mobile Secondary Items */}
              {secondaryNavItems.map((group) => (
                <div key={group.label} className="pt-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-3 pb-2">
                    {group.label}
                  </div>
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link key={item.path} href={item.path}>
                        <Button
                          variant="ghost"
                          className="w-full justify-start space-x-2 px-3 py-2 text-gray-700 hover:bg-gray-50"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </Button>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}