import { useState, useRef, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronDown, 
  Search, 
  Bell, 
  Settings, 
  LogOut,
  User,
  Car,
  DollarSign,
  Calculator,
  Shield,
  Users,
  BarChart3,
  FileText,
  CreditCard,
  Handshake,
  Building,
  Target,
  TrendingUp,
  UserPlus,
  Archive,
  PieChart,
  Wallet,
  Receipt,
  BookOpen,
  Brain
} from "lucide-react";

interface NavItem {
  label: string;
  href: string;
  icon: any;
  badge?: string;
}

interface NavSection {
  title: string;
  icon: any;
  items: NavItem[];
}

const navigationSections: NavSection[] = [
  {
    title: "Sales",
    icon: Handshake,
    items: [
      { label: "Dashboard", href: "/", icon: BarChart3 },
      { label: "Leads & Prospects", href: "/leads", icon: Target },
      { label: "Customer Management", href: "/customers", icon: Users },
      { label: "Deal Desk", href: "/deals", icon: FileText },
      { label: "Showroom Manager", href: "/showroom", icon: Building },
      { label: "Sales Reports", href: "/reports", icon: TrendingUp },
    ]
  },
  {
    title: "Finance",
    icon: DollarSign,
    items: [
      { label: "F&I Dashboard", href: "/finance", icon: CreditCard },
      { label: "Deal Structuring", href: "/finance/structuring", icon: Calculator },
      { label: "Lender Management", href: "/finance/lenders", icon: Building },
      { label: "Rate Sheets", href: "/finance/rates", icon: FileText },
      { label: "Compliance", href: "/finance/compliance", icon: Shield },
      { label: "F&I Reports", href: "/finance/reports", icon: PieChart },
    ]
  },
  {
    title: "Accounting",
    icon: Calculator,
    items: [
      { label: "Accounting Dashboard", href: "/accounting", icon: Receipt },
      { label: "Chart of Accounts", href: "/accounting/chart", icon: BookOpen },
      { label: "Journal Entries", href: "/accounting/journal", icon: FileText },
      { label: "Deal Finalization", href: "/accounting/finalization", icon: Wallet },
      { label: "Financial Reports", href: "/accounting/reports", icon: BarChart3 },
      { label: "Reconciliation", href: "/accounting/reconciliation", icon: Target },
    ]
  },
  {
    title: "Admin",
    icon: Settings,
    items: [
      { label: "System Settings", href: "/admin/settings", icon: Settings },
      { label: "Dealership Config", href: "/admin/dealership", icon: Building },
      { label: "Inventory Management", href: "/inventory", icon: Car },
      { label: "Multi-Store Management", href: "/multi-store-management", icon: Archive },
      { label: "ML Control Center", href: "/ml-control", icon: Brain },
      { label: "API Integrations", href: "/admin/integrations", icon: Shield },
      { label: "System Health", href: "/admin/health", icon: TrendingUp },
    ]
  },
  {
    title: "User Management",
    icon: Users,
    items: [
      { label: "Staff Directory", href: "/users", icon: Users },
      { label: "Roles & Permissions", href: "/admin/roles", icon: Shield },
      { label: "Performance Tracking", href: "/admin/performance", icon: Target },
      { label: "Training Center", href: "/admin/training", icon: BookOpen },
      { label: "User Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Add New User", href: "/users/new", icon: UserPlus },
    ]
  }
];

export default function TopNavbar() {
  const [location] = useLocation();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const dropdownRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isClickInsideAnyDropdown = Object.values(dropdownRefs.current).some(ref => 
        ref && ref.contains(event.target as Node)
      );
      
      if (!isClickInsideAnyDropdown) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleDropdown = (sectionTitle: string) => {
    setActiveDropdown(activeDropdown === sectionTitle ? null : sectionTitle);
  };

  const isActiveRoute = (href: string) => {
    if (href === "/") return location === "/";
    return location.startsWith(href);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-4">
            <Link href="/">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AiQ</span>
                </div>
                <span className="hidden md:block text-xl font-bold text-gray-900 dark:text-white">
                  AutolytiQ
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Menu with Cut-out Design */}
          <div className="hidden lg:flex items-center space-x-1">
            {navigationSections.map((section) => (
              <div key={section.title} className="relative" ref={el => dropdownRefs.current[section.title] = el}>
                <Button
                  variant="ghost"
                  onClick={() => toggleDropdown(section.title)}
                  className={`
                    relative px-4 py-2 h-10 rounded-none border-b-2 transition-all duration-200
                    ${activeDropdown === section.title 
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' 
                      : 'border-transparent hover:border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }
                    ${section.items.some(item => isActiveRoute(item.href))
                      ? 'border-green-500 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                      : ''
                    }
                  `}
                  style={{
                    clipPath: activeDropdown === section.title 
                      ? 'polygon(0 0, calc(100% - 12px) 0, 100% 100%, 12px 100%)' 
                      : 'none'
                  }}
                >
                  <section.icon className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">{section.title}</span>
                  <ChevronDown className={`h-4 w-4 ml-1 transition-transform duration-200 ${
                    activeDropdown === section.title ? 'rotate-180' : ''
                  }`} />
                </Button>

                {/* Dropdown Menu with Cut-out Design */}
                {activeDropdown === section.title && (
                  <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50"
                       style={{
                         clipPath: 'polygon(0 8px, 20px 0, 100% 0, 100% calc(100% - 8px), calc(100% - 20px) 100%, 0 100%)'
                       }}>
                    <div className="p-2">
                      <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider px-3 py-2 border-b border-gray-100 dark:border-gray-700">
                        {section.title}
                      </div>
                      <div className="mt-2 space-y-1">
                        {section.items.map((item) => (
                          <Link key={item.href} href={item.href}>
                            <div
                              className={`
                                flex items-center px-3 py-2.5 text-sm rounded-md transition-all duration-150
                                ${isActiveRoute(item.href)
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }
                              `}
                              onClick={() => setActiveDropdown(null)}
                            >
                              <item.icon className="h-4 w-4 mr-3 opacity-75" />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-2 text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-3">
            {/* Search Bar */}
            <div className="hidden md:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 w-64 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs bg-red-500">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src="/placeholder-avatar.jpg" />
                <AvatarFallback className="bg-blue-100 text-blue-600 text-xs font-medium">
                  AW
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <div className="text-sm font-medium text-gray-900 dark:text-white">Austin Williams</div>
                <div className="text-xs text-gray-500 dark:text-gray-400">Sales Manager</div>
              </div>
              <Button variant="ghost" size="sm">
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="sm" className="lg:hidden">
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="lg:hidden border-t border-gray-200 dark:border-gray-700">
        <div className="px-4 py-3 space-y-2">
          {navigationSections.map((section) => (
            <div key={section.title}>
              <Button
                variant="ghost"
                onClick={() => toggleDropdown(section.title)}
                className="w-full justify-between h-10 px-3"
              >
                <div className="flex items-center">
                  <section.icon className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">{section.title}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${
                  activeDropdown === section.title ? 'rotate-180' : ''
                }`} />
              </Button>
              
              {activeDropdown === section.title && (
                <div className="mt-2 pl-7 space-y-1 border-l-2 border-blue-200 dark:border-blue-800">
                  {section.items.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <div
                        className={`
                          flex items-center px-3 py-2 text-sm rounded-md transition-all duration-150
                          ${isActiveRoute(item.href)
                            ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium'
                            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                          }
                        `}
                        onClick={() => setActiveDropdown(null)}
                      >
                        <item.icon className="h-4 w-4 mr-3 opacity-75" />
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {item.badge}
                          </Badge>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </nav>
  );
}