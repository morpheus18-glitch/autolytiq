import React, { useState, useEffect } from 'react';
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
  X,
  Home,
  ArrowRight
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

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Auto-detect current section
  useEffect(() => {
    const currentSection = workflowTabs.find(tab => 
      location.startsWith(tab.path) || 
      tab.subItems?.some(item => location.startsWith(item.path))
    );
    if (currentSection && currentSection.id !== activeTab) {
      setActiveTab(currentSection.id);
    }
  }, [location, activeTab]);

  return (
    <>
      {/* Mobile-First Navigation */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
        {/* Main Mobile Header */}
        <div className="flex items-center justify-between h-14 px-4 lg:h-16 lg:px-6">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900 hidden sm:inline lg:text-xl">AutolytiQ</span>
            </Link>
            
            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden p-2"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Center: Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl">
            {workflowTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;
              
              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all ${
                        isActive ? 'bg-blue-600 text-white shadow-md' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-64 max-h-96 overflow-y-auto">
                    <DropdownMenuLabel className="flex items-center gap-2 text-gray-900">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tab.subItems?.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link href={item.path} className="flex items-center gap-3 w-full p-3 hover:bg-gray-50">
                            <ItemIcon className="w-4 h-4 text-gray-500" />
                            <div className="flex-1">
                              <span className="text-sm font-medium">{item.label}</span>
                            </div>
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

          {/* Right: Actions + User Menu */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Desktop Search */}
            <div className="hidden xl:flex relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-48"
              />
            </div>

            {/* Desktop Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="hidden lg:flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  <span className="hidden xl:inline">New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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
            <Button variant="ghost" size="sm" className="relative hidden lg:flex">
              <Bell className="w-5 h-5" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-xs">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 p-2">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-blue-600" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium truncate max-w-24">
                    {(user as any)?.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 hidden lg:inline flex-shrink-0" />
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
                <DropdownMenuItem asChild>
                  <Link href="/admin/user-profile" className="flex items-center cursor-pointer">
                    <User className="w-4 h-4 mr-2" />
                    Profile Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/security-center" className="flex items-center cursor-pointer">
                    <Shield className="w-4 h-4 mr-2" />
                    Security
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/system-settings" className="flex items-center cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Preferences
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dealer-configuration" className="flex items-center cursor-pointer">
                    <Database className="w-4 h-4 mr-2" />
                    Dealer Config
                  </Link>
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

      {/* Full-Screen Mobile Navigation Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-white z-50 overflow-y-auto">
          <div className="min-h-screen">
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-gray-200 bg-white sticky top-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Car className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold text-gray-900">AutolytiQ</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Content */}
            <div className="p-4 space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search vehicles, customers, deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 text-base border-gray-300 rounded-lg"
                />
              </div>

              {/* Navigation Sections */}
              <div className="space-y-4">
                {workflowTabs.map((tab) => {
                  const Icon = tab.icon;
                  
                  return (
                    <div key={tab.id} className="space-y-2">
                      {/* Section Header */}
                      <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                        <Icon className="w-5 h-5 text-blue-600" />
                        <span className="font-semibold text-gray-900">{tab.label}</span>
                      </div>
                      
                      {/* Section Items */}
                      {tab.subItems && (
                        <div className="ml-4 space-y-1">
                          {tab.subItems.map((item) => {
                            const ItemIcon = item.icon;
                            const isActive = location === item.path;
                            
                            return (
                              <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                                  isActive
                                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <div className="flex items-center gap-3">
                                  <ItemIcon className="w-5 h-5" />
                                  <span className="font-medium">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.badge && (
                                    <Badge variant="destructive" className="text-xs">
                                      {item.badge}
                                    </Badge>
                                  )}
                                  <ArrowRight className="w-4 h-4 text-gray-400" />
                                </div>
                              </Link>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Actions Section */}
              <div className="border-t pt-6 space-y-4">
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  <Button
                    variant="outline"
                    className="justify-start gap-3 p-4 h-auto"
                    onClick={() => {
                      handleQuickAction('new-deal');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Calculator className="w-5 h-5 text-blue-600" />
                    <div className="text-left">
                      <div className="font-medium">Start New Deal</div>
                      <div className="text-sm text-gray-500">Create a new customer deal</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 p-4 h-auto"
                    onClick={() => {
                      handleQuickAction('add-vehicle');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Car className="w-5 h-5 text-green-600" />
                    <div className="text-left">
                      <div className="font-medium">Add Vehicle</div>
                      <div className="text-sm text-gray-500">Add to inventory</div>
                    </div>
                  </Button>
                  <Button
                    variant="outline"
                    className="justify-start gap-3 p-4 h-auto"
                    onClick={() => {
                      handleQuickAction('schedule-service');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <Wrench className="w-5 h-5 text-orange-600" />
                    <div className="text-left">
                      <div className="font-medium">Schedule Service</div>
                      <div className="text-sm text-gray-500">Book service appointment</div>
                    </div>
                  </Button>
                </div>
              </div>

              {/* User Account Section */}
              <div className="border-t pt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      {(user as any)?.firstName} {(user as any)?.lastName}
                    </div>
                    <div className="text-sm text-gray-500">{(user as any)?.email}</div>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto">
                    <Settings className="w-5 h-5" />
                    Settings & Preferences
                  </Button>
                  <Button variant="ghost" className="w-full justify-start gap-3 p-3 h-auto">
                    <Shield className="w-5 h-5" />
                    Security & Privacy
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start gap-3 p-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => window.location.href = '/api/logout'}
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Desktop Sub-Navigation */}
      {currentTab?.subItems && !isMobileMenuOpen && (
        <div className="hidden lg:block bg-gray-50 border-t border-gray-200 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center space-x-6 overflow-x-auto">
              {currentTab.subItems.map((item) => {
                const isActive = location === item.path;
                const ItemIcon = item.icon;
                
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-blue-600 shadow-sm border border-blue-100'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-white/70'
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
        </div>
      )}
    </>
  );
}