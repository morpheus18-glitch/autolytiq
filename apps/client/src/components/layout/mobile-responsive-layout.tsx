import { ReactNode, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useScrollLock } from '@/hooks/use-scroll-lock';
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User, 
  ChevronDown,
  Home,
  Users,
  Car,
  Calculator,
  BarChart3,
  MessageSquare,
  Cog
} from "lucide-react";
import { Link, useLocation } from "wouter";
import { isHomePath } from "@/lib/userHomePath";

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  stickyHeader?: boolean;
}

const navigationItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
  { name: "Sales & Leads", href: "/sales", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Car },
  { name: "Deal Desk", href: "/professional-deal-desk", icon: Calculator },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Market Leads", href: "/market-leads", icon: MessageSquare },
  { name: "Enhanced Inventory", href: "/enhanced-inventory", icon: Car },
  { name: "Enhanced Customers", href: "/enhanced-customers", icon: Users },
  { name: "Enhanced Sales", href: "/enhanced-sales", icon: Calculator },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function MobileResponsiveLayout({
  children,
  title,
  subtitle,
  headerActions,
  stickyHeader = true
}: MobileResponsiveLayoutProps) {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Lock scroll when mobile menu is open
  useScrollLock(isMenuOpen);

  return (
    <div className="min-h-[100dvh] bg-gray-50 dark:bg-gray-900">
      {/* Fixed Mobile-First Header - Enhanced Responsiveness */}
      <header className={`${stickyHeader ? 'fixed' : 'relative'} top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 min-h-[56px]">
          {/* Left - Mobile Menu and Logo */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Navigation */}
            <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden p-1 sm:p-2">
                  <Menu className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 sm:w-72 p-0 overflow-y-auto h-[100dvh]">
                <div className="flex flex-col h-full">
                  <div className="p-4 sm:p-6 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs sm:text-sm">AiQ</span>
                      </div>
                      <span className="font-semibold text-base sm:text-lg">AutolytiQ</span>
                    </div>
                  </div>
                  <nav className="flex-1 p-3 sm:p-4 overflow-y-auto">
                    <div className="space-y-1 sm:space-y-2">
                      {navigationItems.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <Button
                            variant={item.href === '/dashboard' ? (isHomePath(location) ? "default" : "ghost") : location === item.href || location.startsWith(`${item.href}/`) ? "default" : "ghost"}
                            className="w-full justify-start gap-2 sm:gap-3 h-10 sm:h-11 text-sm"
                          >
                            <item.icon className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{item.name}</span>
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo - Mobile Optimized */}
            <Link href="/">
              <div className="flex items-center gap-1 sm:gap-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xs sm:text-sm">AiQ</span>
                </div>
                <span className="font-semibold text-sm sm:text-lg hidden xs:block">AutolytiQ</span>
              </div>
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/dashboard">
              <Button variant={isHomePath(location) ? "default" : "ghost"} size="sm">Dashboard</Button>
            </Link>
            <Link href="/sales"><Button variant={location === "/sales" ? "default" : "ghost"} size="sm">Sales</Button></Link>
            <Link href="/inventory"><Button variant={location === "/inventory" ? "default" : "ghost"} size="sm">Inventory</Button></Link>
            <Link href="/analytics"><Button variant={location === "/analytics" ? "default" : "ghost"} size="sm">Analytics</Button></Link>
          </nav>

          {/* Right - User Actions - Mobile Optimized */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex p-1 sm:p-2">
              <Search className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative p-1 sm:p-2">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-0.5 -right-0.5 w-2 h-2 p-0 bg-red-500 rounded-full"></Badge>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:block text-sm">Austin W.</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content - Mobile Optimized */}
      <main className={`${stickyHeader ? 'pt-14 sm:pt-16' : ''} min-h-[100dvh]`}>
        {/* Page Header - Mobile Optimized */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-3 sm:px-4 lg:px-6 py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white leading-tight">
                {title}
              </h1>
              {subtitle && (
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Page Content - Mobile Optimized */}
        <div className="px-3 sm:px-4 lg:px-6 py-4 sm:py-6 pb-20 md:pb-6">
          {children}
        </div>
      </main>
    </div>
  );
}