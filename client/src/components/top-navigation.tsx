import React, { useState } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Car,
  Users,
  Calculator,
  BarChart3,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  LogOut,
  Wrench,
  FileText,
  DollarSign,
  TrendingUp,
  Shield,
  Database,
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';

interface WorkflowTab {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  path: string;
  subItems?: {
    label: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[];
}

const workflowTabs: WorkflowTab[] = [
  {
    id: 'inventory',
    label: 'Inventory',
    icon: Car,
    path: '/inventory',
    subItems: [
      { label: 'Vehicle Inventory', path: '/inventory', icon: Car },
      { label: 'Lot Management', path: '/inventory/lot-management', icon: Database },
      { label: 'Pricing Insights', path: '/inventory/pricing', icon: TrendingUp }
    ]
  },
  {
    id: 'sales',
    label: 'Sales Process',
    icon: DollarSign,
    path: '/sales',
    subItems: [
      { label: 'Active Deals', path: '/deal-desk', icon: Calculator, badge: '3' },
      { label: 'Leads Pipeline', path: '/leads', icon: Users },
      { label: 'Customer Management', path: '/customers', icon: Users },
      { label: 'Trade Appraisals', path: '/trade-appraisals', icon: Car }
    ]
  },
  {
    id: 'service',
    label: 'Service',
    icon: Wrench,
    path: '/service',
    subItems: [
      { label: 'Today\'s Appointments', path: '/service/appointments', icon: Wrench, badge: '7' },
      { label: 'Service History', path: '/service/history', icon: FileText },
      { label: 'Parts Inventory', path: '/service/parts', icon: Database },
      { label: 'Technician Schedule', path: '/service/schedule', icon: Users }
    ]
  },
  {
    id: 'intelligence',
    label: 'Intelligence',
    icon: BarChart3,
    path: '/analytics',
    subItems: [
      { label: 'Performance Dashboard', path: '/analytics', icon: BarChart3 },
      { label: 'ML Control Center', path: '/ml-control', icon: TrendingUp },
      { label: 'Market Intelligence', path: '/competitive-pricing', icon: BarChart3 },
      { label: 'Predictive Analytics', path: '/ml-model-comparison', icon: Database }
    ]
  },
  {
    id: 'reports',
    label: 'Reports',
    icon: FileText,
    path: '/reports',
    subItems: [
      { label: 'Sales Reports', path: '/reports/sales', icon: DollarSign },
      { label: 'Inventory Reports', path: '/reports/inventory', icon: Car },
      { label: 'Service Reports', path: '/reports/service', icon: Wrench },
      { label: 'Financial Reports', path: '/reports/financial', icon: BarChart3 }
    ]
  }
];

export default function TopNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState(() => {
    return workflowTabs.find(tab => location.startsWith(tab.path))?.id || 'inventory';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentTab = workflowTabs.find(tab => tab.id === activeTab);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'new-deal':
        window.location.href = '/deal-desk';
        break;
      case 'add-vehicle':
        // Trigger add vehicle modal
        break;
      case 'schedule-service':
        window.location.href = '/service/appointments';
        break;
    }
  };

  return (
    <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      {/* Main Navigation Bar */}
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 hidden sm:inline">AutolytiQ</span>
            </Link>
            
            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>

            {/* Workflow Tabs */}
            <nav className="hidden lg:flex items-center space-x-1">
              {workflowTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <DropdownMenu key={tab.id}>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant={isActive ? "default" : "ghost"}
                        className={`flex items-center gap-2 px-3 py-2 text-sm font-medium ${
                          isActive ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                        onClick={() => setActiveTab(tab.id)}
                      >
                        <Icon className="w-4 h-4" />
                        {tab.label}
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-56">
                      <DropdownMenuLabel className="flex items-center gap-2">
                        <Icon className="w-4 h-4" />
                        {tab.label}
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      {tab.subItems?.map((item) => {
                        const ItemIcon = item.icon;
                        return (
                          <DropdownMenuItem key={item.path} asChild>
                            <Link href={item.path} className="flex items-center gap-2 w-full">
                              <ItemIcon className="w-4 h-4" />
                              <span className="flex-1">{item.label}</span>
                              {item.badge && (
                                <Badge variant="destructive" className="text-xs">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          </DropdownMenuItem>
                        );
                      })}
                    </DropdownMenuContent>
                  </DropdownMenu>
                );
              })}
            </nav>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-2">
            {/* Quick Search - Desktop Only */}
            <div className="hidden lg:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search vehicles, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {/* Quick Actions - Hidden on mobile */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="hidden sm:flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden md:inline">Quick Action</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleQuickAction('new-deal')}>
                  <Calculator className="w-4 h-4 mr-2" />
                  Start New Deal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAction('add-vehicle')}>
                  <Car className="w-4 h-4 mr-2" />
                  Add Vehicle
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleQuickAction('schedule-service')}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Schedule Service
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hidden sm:flex">
              <Bell className="w-5 h-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <span className="hidden md:inline text-sm font-medium">
                    {(user as any)?.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 hidden sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{(user as any)?.firstName} {(user as any)?.lastName}</p>
                    <p className="text-xs text-gray-500">{(user as any)?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="w-4 h-4 mr-2" />
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Shield className="w-4 h-4 mr-2" />
                  Security
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Preferences
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <a href="/api/logout" className="flex items-center w-full">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-lg z-50">
          <div className="px-4 py-4 space-y-4">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search vehicles, customers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>

            {/* Mobile Navigation Tabs */}
            <div className="space-y-2">
              {workflowTabs.map((tab) => {
                const isActive = activeTab === tab.id;
                const Icon = tab.icon;
                
                return (
                  <div key={tab.id}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-2 ${
                        isActive ? 'bg-blue-600 text-white' : 'text-gray-600'
                      }`}
                      onClick={() => {
                        setActiveTab(tab.id);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </Button>
                    
                    {/* Mobile Sub-items */}
                    {isActive && tab.subItems && (
                      <div className="ml-6 mt-2 space-y-1">
                        {tab.subItems.map((item) => {
                          const ItemIcon = item.icon;
                          const isSubActive = location === item.path;
                          
                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              className={`flex items-center gap-2 px-3 py-2 text-sm rounded-md ${
                                isSubActive
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'text-gray-600 hover:bg-gray-100'
                              }`}
                              onClick={() => setIsMobileMenuOpen(false)}
                            >
                              <ItemIcon className="w-4 h-4" />
                              {item.label}
                              {item.badge && (
                                <Badge variant="destructive" className="text-xs ml-auto">
                                  {item.badge}
                                </Badge>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Mobile Quick Actions */}
            <div className="border-t pt-4 space-y-2">
              <p className="text-sm font-medium text-gray-700">Quick Actions</p>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  handleQuickAction('new-deal');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Calculator className="w-4 h-4" />
                Start New Deal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => {
                  handleQuickAction('add-vehicle');
                  setIsMobileMenuOpen(false);
                }}
              >
                <Car className="w-4 h-4" />
                Add Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sub-Navigation */}
      {currentTab?.subItems && !isMobileMenuOpen && (
        <div className="hidden lg:block bg-gray-50 border-t border-gray-200 px-4 lg:px-6 py-2">
          <nav className="flex items-center space-x-6 overflow-x-auto">
            {currentTab.subItems.map((item) => {
              const isActive = location === item.path;
              const ItemIcon = item.icon;
              
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    isActive
                      ? 'bg-white text-blue-600 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                  }`}
                >
                  <ItemIcon className="w-4 h-4" />
                  {item.label}
                  {item.badge && (
                    <Badge variant="destructive" className="text-xs ml-1">
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </div>
  );
}