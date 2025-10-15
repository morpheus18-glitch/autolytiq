import { ReactNode } from 'react';
import { useLocation } from 'wouter';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Menu, 
  Search, 
  Bell, 
  Settings, 
  User, 
  ChevronDown, 
  Filter,
  Download,
  Plus,
  RefreshCw
} from "lucide-react";

interface UniformPageProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showSearch?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
  filters?: ReactNode;
  stats?: Array<{
    label: string;
    value: string | number;
    icon?: ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }>;
}

export default function UniformPage({
  children,
  title,
  subtitle,
  showSearch = true,
  searchValue = "",
  onSearchChange,
  actions,
  filters,
  stats
}: UniformPageProps) {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Fixed Uniform Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between px-3 sm:px-4 md:px-6 py-3 sm:py-3.5">
          {/* Left - Logo and Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            <Button 
              variant="ghost" 
              size="sm" 
              className="lg:hidden h-10 w-10 sm:h-9 sm:w-9 p-0"
              onClick={() => setLocation('/showroom-manager')}
              data-testid="button-uniform-menu"
            >
              <Menu className="w-5 h-5" />
            </Button>
            
            <div 
              className="flex items-center gap-2 cursor-pointer" 
              onClick={() => setLocation('/')}
            >
              <div className="w-9 h-9 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-600 to-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">AiQ</span>
              </div>
              <span className="font-semibold text-base sm:text-lg hidden sm:block">AutolytiQ</span>
            </div>
          </div>

          {/* Center - Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/')}
            >
              Dashboard
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/customers')}
            >
              Sales <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/professional-deal-desk')}
            >
              Finance <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/inventory')}
            >
              Inventory
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/analytics')}
            >
              Analytics
            </Button>
          </nav>

          {/* Right - Actions */}
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="relative"
              onClick={() => setLocation('/notifications')}
            >
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-1 -right-1 w-2 h-2 p-0 bg-red-500"></Badge>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLocation('/admin/settings')}
            >
              <Settings className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="gap-2"
              onClick={() => setLocation('/admin/user-profile')}
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:block text-sm">Austin W.</span>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-16 sm:pt-[4.25rem] pb-20 md:pb-6">
        {/* Page Header with Stats */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
            {/* Title and Actions */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">
                    {subtitle}
                  </p>
                )}
              </div>
              
              {actions && (
                <div className="flex items-center gap-2 sm:gap-3">
                  {actions}
                </div>
              )}
            </div>

            {/* Stats Cards */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-5 md:mb-6">
                {stats.map((stat, index) => (
                  <Card key={index}>
                    <CardContent className="p-3 sm:p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">
                            {stat.label}
                          </p>
                          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 dark:text-white mt-0.5">
                            {stat.value}
                          </p>
                        </div>
                        {stat.icon && (
                          <div className="p-1.5 sm:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {stat.icon}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Search and Filters */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {showSearch && (
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search..."
                      value={searchValue}
                      onChange={(e) => onSearchChange?.(e.target.value)}
                      className="pl-10 h-10 sm:h-9"
                      data-testid="input-uniform-search"
                    />
                  </div>
                </div>
              )}
              
              {filters && (
                <div className="flex items-center gap-2">
                  {filters}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-5 md:py-6">
          {children}
        </div>
      </main>
    </div>
  );
}