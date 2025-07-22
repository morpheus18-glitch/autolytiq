import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  MessageSquare,
  Phone,
  Brain,
  Zap,
  ChevronDown,
  Menu
} from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { ThemeToggle } from './theme-toggle';

interface Notification {
  id: number;
  type: 'message' | 'lead' | 'ai' | 'system';
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
}

export default function EnterpriseHeader() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock notifications for professional demo
  const notifications: Notification[] = [
    {
      id: 1,
      type: 'lead',
      title: 'High-Value Lead Alert',
      description: 'Jennifer Wilson - $85K budget, requires immediate follow-up',
      timestamp: '2 min ago',
      read: false
    },
    {
      id: 2,
      type: 'message',
      title: 'Customer Message',
      description: 'Michael Johnson asking about test drive availability',
      timestamp: '5 min ago',
      read: false
    },
    {
      id: 3,
      type: 'ai',
      title: 'AI Recommendation Ready',
      description: 'Price optimization suggestions for 5 vehicles',
      timestamp: '10 min ago',
      read: true
    },
    {
      id: 4,
      type: 'system',
      title: 'Daily Report Generated',
      description: 'Sales and inventory report is now available',
      timestamp: '1 hour ago',
      read: true
    }
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const quickSearchSuggestions = [
    { type: 'customer', text: 'high credit score customers', icon: User },
    { type: 'inventory', text: 'luxury vehicles under $50k', icon: Search },
    { type: 'ai', text: 'customers interested in hybrid', icon: Brain },
    { type: 'communication', text: 'pending customer responses', icon: MessageSquare }
  ];

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'lead': return <Zap className="w-4 h-4 text-blue-500" />;
      case 'message': return <MessageSquare className="w-4 h-4 text-green-500" />;
      case 'ai': return <Brain className="w-4 h-4 text-purple-500" />;
      case 'system': return <Settings className="w-4 h-4 text-gray-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const handleGlobalSearch = () => {
    if (searchQuery.trim()) {
      // Navigate to smart search with query
      window.location.href = `/ai-smart-search?query=${encodeURIComponent(searchQuery)}`;
      setSearchOpen(false);
      setSearchQuery('');
    }
  };

  const currentPageTitle = () => {
    if (location === '/') return 'Dashboard';
    if (location.includes('customers')) return 'Customer Management';
    if (location.includes('inventory')) return 'Inventory Management';
    if (location.includes('deals')) return 'Deal Desk';
    if (location.includes('ai-smart-search')) return 'AI Smart Search';
    if (location.includes('communication')) return 'Communications';
    if (location.includes('competitive-pricing')) return 'Competitive Pricing';
    if (location.includes('analytics')) return 'Analytics & Reports';
    if (location.includes('admin')) return 'Administration';
    return 'AutolytiQ';
  };

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-3 sm:px-4 py-2 sm:py-3 sticky top-0 z-50">
      <div className="flex items-center justify-between">
        {/* Left Section - Logo & Page Title */}
        <div className="flex items-center space-x-2 sm:space-x-4 min-w-0 flex-1">
          <div className="flex items-center space-x-2 sm:space-x-3 min-w-0">
            <Link href="/">
              <div className="flex items-center space-x-1 sm:space-x-2">
                <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-xs sm:text-sm">A</span>
                </div>
                <span className="hidden sm:block font-bold text-lg sm:text-xl text-gray-900 dark:text-gray-100">AutolytiQ</span>
                <span className="sm:hidden font-bold text-sm text-gray-900 dark:text-gray-100">AutolytiQ</span>
              </div>
            </Link>
            <div className="hidden lg:block">
              <span className="text-gray-400">/</span>
              <span className="ml-2 text-gray-700 dark:text-gray-300 font-medium text-sm">{currentPageTitle()}</span>
            </div>
          </div>
        </div>

        {/* Center Section - Global Search */}
        <div className="flex-1 max-w-sm sm:max-w-xl mx-2 sm:mx-4">
          <Dialog open={searchOpen} onOpenChange={setSearchOpen}>
            <DialogTrigger asChild>
              <div className="relative">
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400" />
                <Input
                  placeholder="Search or ask AI..."
                  className="pl-7 sm:pl-10 pr-8 sm:pr-12 py-1.5 sm:py-2 w-full bg-gray-50 border-gray-200 focus:bg-white text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setSearchOpen(true)}
                  onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
                />
                <Badge variant="secondary" className="absolute right-2 sm:right-3 top-1/2 transform -translate-y-1/2 text-xs px-1 sm:px-2">
                  AI
                </Badge>
              </div>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <DialogTitle>AI-Powered Search</DialogTitle>
                <DialogDescription>
                  Search across customers, inventory, or use natural language queries
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Try: 'customers interested in luxury vehicles'"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleGlobalSearch()}
                    className="flex-1"
                  />
                  <Button onClick={handleGlobalSearch}>Search</Button>
                </div>
                
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Quick Searches:</p>
                  <div className="space-y-1">
                    {quickSearchSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left"
                        onClick={() => {
                          setSearchQuery(suggestion.text);
                          handleGlobalSearch();
                        }}
                      >
                        <suggestion.icon className="w-4 h-4 mr-2" />
                        {suggestion.text}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Right Section - Actions & User Menu */}
        <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
          {/* Quick Action Buttons */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link href="/communication-demo">
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>Message</span>
              </Button>
            </Link>
            <Link href="/ai-smart-search">
              <Button variant="outline" size="sm" className="flex items-center space-x-1">
                <Brain className="w-4 h-4" />
                <span>AI Search</span>
              </Button>
            </Link>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="relative p-1.5 sm:p-2">
                <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                {unreadCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 sm:-top-2 sm:-right-2 h-4 w-4 sm:h-5 sm:w-5 flex items-center justify-center text-xs bg-red-500 text-white">
                    {unreadCount}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                Notifications
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {unreadCount} new
                  </Badge>
                )}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem key={notification.id} className="flex items-start p-3 hover:bg-gray-50">
                    <div className="mr-3 mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-medium text-sm">{notification.title}</p>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                      <p className="text-xs text-gray-400 mt-1">{notification.timestamp}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center space-x-1 sm:space-x-2 p-1.5 sm:p-2">
                <User className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden md:block text-sm">{(user as any)?.first_name || 'User'}</span>
                <ChevronDown className="w-2 h-2 sm:w-3 sm:h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <Link href="/admin/user-profile">
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <Link href="/admin/settings">
                <DropdownMenuItem>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}