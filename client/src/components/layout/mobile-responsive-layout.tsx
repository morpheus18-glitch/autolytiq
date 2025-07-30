import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
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

interface MobileResponsiveLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  headerActions?: ReactNode;
  stickyHeader?: boolean;
}

const navigationItems = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Sales & Leads", href: "/sales", icon: Users },
  { name: "Inventory", href: "/inventory", icon: Car },
  { name: "Deal Desk", href: "/deal-desk", icon: Calculator },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "Market Leads", href: "/market-leads", icon: MessageSquare },
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Mobile-First Header */}
      <header className={`${stickyHeader ? 'fixed' : 'relative'} top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm`}>
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left - Mobile Menu and Logo */}
          <div className="flex items-center gap-3">
            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="lg:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 p-0">
                <div className="flex flex-col h-full">
                  <div className="p-6 border-b">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">AiQ</span>
                      </div>
                      <span className="font-semibold text-lg">AutolytiQ</span>
                    </div>
                  </div>
                  <nav className="flex-1 p-4">
                    <div className="space-y-2">
                      {navigationItems.map((item) => (
                        <Link key={item.name} href={item.href}>
                          <Button
                            variant={location === item.href ? "default" : "ghost"}
                            className="w-full justify-start gap-3"
                          >
                            <item.icon className="w-4 h-4" />
                            {item.name}
                          </Button>
                        </Link>
                      ))}
                    </div>
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
            
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AiQ</span>
                </div>
                <span className="font-semibold text-lg hidden sm:block">AutolytiQ</span>
              </div>
            </Link>
          </div>

          {/* Center - Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link href="/"><Button variant={location === "/" ? "default" : "ghost"} size="sm">Dashboard</Button></Link>
            <Link href="/sales"><Button variant={location === "/sales" ? "default" : "ghost"} size="sm">Sales</Button></Link>
            <Link href="/inventory"><Button variant={location === "/inventory" ? "default" : "ghost"} size="sm">Inventory</Button></Link>
            <Link href="/analytics"><Button variant={location === "/analytics" ? "default" : "ghost"} size="sm">Analytics</Button></Link>
          </nav>

          {/* Right - User Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="hidden sm:flex">
              <Search className="w-4 h-4" />
            </Button>
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500"></Badge>
            </Button>
            
            <Button variant="ghost" size="sm" className="gap-2">
              <User className="w-4 h-4" />
              <span className="hidden sm:block text-sm">Austin W.</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={`${stickyHeader ? 'pt-16' : ''} min-h-screen`}>
        {/* Page Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                {title}
              </h1>
              {subtitle && (
                <p className="text-gray-600 dark:text-gray-400 mt-1">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex items-center gap-3 flex-wrap">
                {headerActions}
              </div>
            )}
          </div>
        </div>

        {/* Page Content */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
}