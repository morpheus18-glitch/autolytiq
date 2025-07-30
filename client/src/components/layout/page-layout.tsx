import { ReactNode } from 'react';
import { Button } from "@/components/ui/button";
import { Menu, Search, Bell, Settings, User, ChevronDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface PageLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
  showSearch?: boolean;
  className?: string;
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  actions, 
  showSearch = false,
  className = ""
}: PageLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Left section - Logo and Mobile Menu */}
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="lg:hidden">
              <Menu className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AiQ</span>
              </div>
              <span className="font-semibold text-lg hidden sm:block">AutolytiQ</span>
            </div>
          </div>

          {/* Center section - Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button variant="ghost" size="sm" className="text-sm">
              Dashboard
            </Button>
            <Button variant="ghost" size="sm" className="text-sm">
              Sales
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="ghost" size="sm" className="text-sm">
              Finance
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <Button variant="ghost" size="sm" className="text-sm">
              Inventory
            </Button>
            <Button variant="ghost" size="sm" className="text-sm">
              Analytics
            </Button>
          </nav>

          {/* Right section - Actions */}
          <div className="flex items-center gap-2">
            {showSearch && (
              <Button variant="ghost" size="sm" className="hidden sm:flex">
                <Search className="w-4 h-4" />
              </Button>
            )}
            
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500"></Badge>
            </Button>
            
            <Button variant="ghost" size="sm">
              <Settings className="w-4 h-4" />
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
      <main className="pt-16">
        {/* Page Header */}
        {(title || subtitle || actions) && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
            <div className="px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  {title && (
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {title}
                    </h1>
                  )}
                  {subtitle && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {subtitle}
                    </p>
                  )}
                </div>
                {actions && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {actions}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Page Content */}
        <div className={`px-4 sm:px-6 lg:px-8 py-6 ${className}`}>
          {children}
        </div>
      </main>
    </div>
  );
}