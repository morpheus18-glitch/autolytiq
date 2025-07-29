import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  ChevronDown, 
  ChevronRight,
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
  Menu,
  X,
  Brain,
  Database
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
      { label: "AI Market Leads", href: "/market-leads", icon: Brain, badge: "AI" },
      { label: "Data Center", href: "/automotive-data-center", icon: Database, badge: "API" },
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
      { label: "Deal Structuring", href: "/finance/structuring", icon: Calculator, badge: "Pro" },
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
      { label: "Deal Finalization", href: "/accounting/deals", icon: FileText },
      { label: "Chart of Accounts", href: "/accounting/chart", icon: BookOpen },
      { label: "Vehicle Profit", href: "/accounting/profit", icon: TrendingUp },
      { label: "Finance Reserves", href: "/accounting/reserves", icon: Wallet },
      { label: "Monthly Close", href: "/accounting/close", icon: Archive },
    ]
  },
  {
    title: "Admin",
    icon: Shield,
    items: [
      { label: "System Settings", href: "/admin/settings", icon: Settings },
      { label: "User Management", href: "/admin/users", icon: Users },
      { label: "Dealership Config", href: "/admin/dealership", icon: Building },
      { label: "Integration Setup", href: "/admin/integrations", icon: Archive },
      { label: "Security Center", href: "/admin/security", icon: Shield },
    ]
  },
  {
    title: "User Management",
    icon: User,
    items: [
      { label: "Staff Directory", href: "/users/staff", icon: Users },
      { label: "Role Management", href: "/users/roles", icon: Shield },
      { label: "Performance", href: "/users/performance", icon: TrendingUp },
      { label: "Training Center", href: "/users/training", icon: BookOpen },
    ]
  }
];

interface SidebarNavigationProps {
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export default function SidebarNavigation({ isCollapsed = false, onToggleCollapse }: SidebarNavigationProps) {
  const [location] = useLocation();
  const [expandedSections, setExpandedSections] = useState<string[]>(["Sales"]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleSection = (sectionTitle: string) => {
    if (isCollapsed) return; // Don't expand sections when collapsed
    
    setExpandedSections(prev => 
      prev.includes(sectionTitle) 
        ? prev.filter(s => s !== sectionTitle)
        : [...prev, sectionTitle]
    );
  };

  const isActiveRoute = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  const sidebarWidth = isCollapsed ? "w-16" : "w-64";

  return (
    <>
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="sm"
        className="fixed top-4 left-4 z-50 lg:hidden"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`${
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-50 ${sidebarWidth} bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ease-in-out`}>
        
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">AiQ</span>
                  </div>
                  <div>
                    <h1 className="text-lg font-bold text-gray-900">AutolytiQ</h1>
                    <p className="text-xs text-gray-600">Enterprise DMS</p>
                  </div>
                </div>
              </div>
            )}
            
            {isCollapsed && (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center mx-auto">
                <span className="text-white font-bold text-sm">AiQ</span>
              </div>
            )}

            {/* Mobile Close Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>

            {/* Desktop Collapse Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="hidden lg:flex"
              onClick={onToggleCollapse}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-2 px-3">
            {navigationSections.map((section) => (
              <div key={section.title} className="space-y-1">
                {/* Section Header */}
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-start h-9 px-3 ${
                    isCollapsed ? 'justify-center px-0' : ''
                  }`}
                  onClick={() => toggleSection(section.title)}
                >
                  <section.icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                  {!isCollapsed && (
                    <>
                      <span className="font-medium">{section.title}</span>
                      <ChevronDown className={`ml-auto h-4 w-4 transition-transform ${
                        expandedSections.includes(section.title) ? 'rotate-180' : ''
                      }`} />
                    </>
                  )}
                </Button>

                {/* Section Items */}
                {(expandedSections.includes(section.title) || isCollapsed) && (
                  <div className={`space-y-1 ${isCollapsed ? '' : 'ml-6'}`}>
                    {section.items.map((item) => (
                      <Link key={item.href} href={item.href}>
                        <Button
                          variant={isActiveRoute(item.href) ? "default" : "ghost"}
                          size="sm"
                          className={`w-full justify-start h-8 px-3 text-sm ${
                            isCollapsed ? 'justify-center px-0' : ''
                          } ${isActiveRoute(item.href) 
                            ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
                            : 'hover:bg-gray-100'
                          }`}
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          <item.icon className={`h-4 w-4 ${isCollapsed ? '' : 'mr-2'}`} />
                          {!isCollapsed && (
                            <>
                              <span>{item.label}</span>
                              {item.badge && (
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </>
                          )}
                        </Button>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-4">
          <div className={`flex items-center space-x-3 ${isCollapsed ? 'justify-center' : ''}`}>
            <Avatar className="h-8 w-8">
              <AvatarImage src="/placeholder-avatar.jpg" />
              <AvatarFallback>AW</AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">Austin Williams</p>
                <p className="text-xs text-gray-500 truncate">Sales Manager</p>
              </div>
            )}
            <Button variant="ghost" size="sm" className={isCollapsed ? 'p-0' : ''}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}