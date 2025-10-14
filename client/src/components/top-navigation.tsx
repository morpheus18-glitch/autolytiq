import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import {
  Car,
  Settings,
  Bell,
  Search,
  Plus,
  ChevronDown,
  User,
  LogOut,
  Shield,
  Menu,
  X,
  ArrowRight,
  Database
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
import { QUICK_ACTIONS, WORKFLOW_SECTIONS } from '@/config/navigation';

export default function TopNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();
  const resolveActiveTab = (pathname: string) => {
    const matched = WORKFLOW_SECTIONS.find(tab =>
      pathname.startsWith(tab.path) ||
      tab.subItems?.some(item =>
        pathname.startsWith(item.path) ||
        item.matchPaths?.some(match => pathname.startsWith(match))
      )
    );
    return matched?.id ?? 'inventory';
  };

  const [activeTab, setActiveTab] = useState(() => resolveActiveTab(location));
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentTab = WORKFLOW_SECTIONS.find(tab => tab.id === activeTab);

  const handleQuickAction = (target: string) => {
    window.location.href = target;
  };

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Auto-detect current section
  useEffect(() => {
    const resolved = resolveActiveTab(location);
    if (resolved !== activeTab) {
      setActiveTab(resolved);
    }
  }, [location, activeTab]);

  return (
    <>
      {/* Mobile-First Navigation */}
      <div className="sticky top-0 z-50 border-b border-border/60 backdrop-blur-xl bg-white/80 dark:bg-slate-950/70 supports-[backdrop-filter]:bg-white/65 dark:supports-[backdrop-filter]:bg-slate-950/60 shadow-[0_12px_40px_-28px_rgba(15,23,42,0.55)]">
        {/* Main Mobile Header */}
        <div className="flex items-center justify-between h-14 px-4 sm:px-5 lg:h-16 lg:px-8 w-full max-w-7xl mx-auto">
          {/* Left: Logo + Mobile Menu */}
          <div className="flex items-center gap-3 flex-1">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary/85 to-secondary/80 text-primary-foreground flex items-center justify-center shadow-[0_10px_18px_-12px_rgba(59,130,246,0.65)]">
                <Car className="w-5 h-5" />
              </div>
              <div className="hidden sm:flex flex-col leading-tight">
                <span className="text-[1.05rem] font-semibold text-foreground tracking-tight">AutolytiQ</span>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-[0.2em]">Sales intelligence</span>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-2 ml-3">
              <span className="metric-chip">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/40" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
                </span>
                Live pipeline
              </span>
            </div>

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden ml-auto rounded-xl h-10 w-10 text-foreground hover:bg-primary/10"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Center: Desktop Navigation (Hidden on Mobile) */}
          <nav className="hidden lg:flex items-center space-x-1 flex-1 justify-center max-w-4xl">
            {WORKFLOW_SECTIONS.map((tab) => {
              const isActive = activeTab === tab.id;
              const Icon = tab.icon;

              return (
                <DropdownMenu key={tab.id}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all rounded-xl ${
                        isActive
                          ? 'bg-primary/90 text-primary-foreground shadow-[0_12px_30px_-20px_rgba(59,130,246,0.8)]'
                          : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {tab.label}
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="start"
                    className="w-64 max-h-96 overflow-y-auto rounded-xl border border-border/80 shadow-xl backdrop-blur-xl bg-white/90 dark:bg-slate-900/90"
                  >
                    <DropdownMenuLabel className="flex items-center gap-2 text-foreground">
                      <Icon className="w-4 h-4" />
                      {tab.label}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {tab.subItems?.map((item) => {
                      const ItemIcon = item.icon;
                      return (
                        <DropdownMenuItem key={item.path} asChild>
                          <Link
                            href={item.path}
                            className="flex items-center gap-3 w-full p-3 rounded-lg transition-colors hover:bg-primary/5"
                          >
                            <ItemIcon className="w-4 h-4 text-muted-foreground" />
                            <div className="flex-1">
                              <span className="text-sm font-medium text-foreground">{item.label}</span>
                            </div>
                            {item.badge && (
                              <Badge variant="outline" className="text-xs text-primary border-primary/40">
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
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 w-52 rounded-xl border-border/60 bg-white/75 dark:bg-slate-900/70"
              />
            </div>

            {/* Desktop Quick Actions */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" className="hidden lg:flex items-center gap-2 rounded-xl bg-secondary/10 text-secondary-foreground hover:bg-secondary/20">
                  <Plus className="w-4 h-4 text-secondary" />
                  <span className="hidden xl:inline font-medium">New</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 rounded-xl border border-border/70 shadow-xl backdrop-blur-lg bg-white/95 dark:bg-slate-900/90"
              >
                <DropdownMenuLabel>Quick Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {QUICK_ACTIONS.map((action) => {
                  const ActionIcon = action.icon;
                  const accent = action.accentClass ?? 'text-primary';
                  return (
                    <DropdownMenuItem
                      key={action.id}
                      onClick={() => handleQuickAction(action.target)}
                    >
                      <ActionIcon className={`w-4 h-4 mr-2 ${accent}`} />
                      {action.label}
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative hidden lg:flex rounded-xl hover:bg-primary/10">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <Badge variant="outline" className="absolute -top-1 -right-1 w-4 h-4 flex items-center justify-center p-0 text-[0.6rem] bg-primary text-primary-foreground border-none">
                3
              </Badge>
            </Button>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-primary/10">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 bg-primary/10 text-primary">
                    <User className="w-4 h-4" />
                  </div>
                  <span className="hidden lg:inline text-sm font-medium truncate max-w-24 text-foreground">
                    {(user as any)?.firstName || 'User'}
                  </span>
                  <ChevronDown className="w-3 h-3 hidden lg:inline flex-shrink-0" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-60 rounded-xl border border-border/70 shadow-xl backdrop-blur-lg bg-white/95 dark:bg-slate-900/90"
              >
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium text-foreground">
                      {(user as any)?.firstName} {(user as any)?.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">{(user as any)?.email}</p>
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
        <div className="lg:hidden fixed inset-0 z-50 overflow-y-auto bg-gradient-to-b from-white via-white/95 to-primary/5 dark:from-slate-950 dark:via-slate-950/95 dark:to-slate-900">
          <div className="min-h-screen">
            {/* Mobile Header */}
            <div className="flex items-center justify-between h-14 px-4 border-b border-border/60 bg-white/85 dark:bg-slate-950/80 backdrop-blur-xl sticky top-0">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/85 to-secondary/80 text-primary-foreground flex items-center justify-center">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-lg font-semibold text-foreground">AutolytiQ</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 rounded-xl hover:bg-primary/10"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Content */}
            <div className="p-4 space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search vehicles, customers, deals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 py-3 text-base rounded-xl border border-border/60 bg-white/80 dark:bg-slate-950/70"
                />
              </div>

              {/* Navigation Sections */}
              <div className="space-y-4">
                {WORKFLOW_SECTIONS.map((tab) => {
                  const Icon = tab.icon;
                  
                  return (
                    <div key={tab.id} className="space-y-2">
                      {/* Section Header */}
                      <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 dark:bg-slate-900/60">
                        <Icon className="w-5 h-5 text-primary" />
                        <span className="font-semibold text-foreground">{tab.label}</span>
                      </div>

                      {/* Section Items */}
                      {tab.subItems && (
                        <div className="ml-4 space-y-1">
                          {tab.subItems.map((item) => {
                            const ItemIcon = item.icon;
                            const isActive = location === item.path || item.matchPaths?.some(match => location.startsWith(match));

                            return (
                              <Link
                                key={item.path}
                                href={item.path}
                                className={`flex items-center justify-between p-3 rounded-xl transition-colors ${
                                  isActive
                                    ? 'bg-primary/15 text-primary border border-primary/30 shadow-sm'
                                    : 'text-foreground/80 hover:bg-primary/10 active:bg-primary/15'
                                }`}
                                onClick={() => setIsMobileMenuOpen(false)}
                              >
                                <div className="flex items-center gap-3">
                                  <ItemIcon className="w-5 h-5 text-muted-foreground" />
                                  <span className="font-medium text-foreground">{item.label}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  {item.badge && (
                                    <Badge variant="outline" className="text-xs text-primary border-primary/40">
                                      {item.badge}
                                    </Badge>
                                  )}
                                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
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
              <div className="border-t border-border/70 pt-6 space-y-4">
                <h3 className="font-semibold text-foreground">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                  {QUICK_ACTIONS.map((action) => {
                    const ActionIcon = action.icon;
                    return (
                      <Button
                        key={action.id}
                        variant="ghost"
                        className="justify-start gap-3 p-4 h-auto rounded-xl border border-border/60 bg-white/80 dark:bg-slate-950/70 hover:bg-primary/10"
                        onClick={() => {
                          handleQuickAction(action.target);
                          setIsMobileMenuOpen(false);
                        }}
                      >
                        <ActionIcon className={`w-5 h-5 ${action.accentClass ?? 'text-primary'}`} />
                        <div className="text-left text-foreground">
                          <div className="font-medium">{action.label}</div>
                          <div className="text-sm text-muted-foreground">{action.description}</div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </div>

              {/* User Account Section */}
              <div className="border-t border-border/70 pt-6 space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 dark:bg-slate-900/60">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-primary/15 text-primary">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-medium text-foreground">
                      {(user as any)?.firstName} {(user as any)?.lastName}
                    </div>
                    <div className="text-sm text-muted-foreground">{(user as any)?.email}</div>
                  </div>
                </div>

                <div className="space-y-1">
                  <Button asChild variant="ghost" className="w-full justify-start gap-3 p-3 h-auto rounded-xl hover:bg-primary/10">
                    <Link href="/admin/system-settings">
                      <Settings className="w-5 h-5" />
                      Settings & Preferences
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start gap-3 p-3 h-auto rounded-xl hover:bg-primary/10">
                    <Link href="/admin/security-center">
                      <Shield className="w-5 h-5" />
                      Security & Privacy
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start gap-3 p-3 h-auto rounded-xl text-destructive hover:text-destructive hover:bg-destructive/10"
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
        <div className="hidden lg:block border-t border-border/70 bg-gradient-to-r from-white via-primary/5 to-white dark:from-slate-950 dark:via-slate-950/80 dark:to-slate-950 px-6 py-3">
          <div className="max-w-7xl mx-auto">
            <nav className="flex items-center space-x-6 overflow-x-auto">
              {currentTab.subItems.map((item) => {
                const isActive = location === item.path || item.matchPaths?.some(match => location.startsWith(match));
                const ItemIcon = item.icon;

                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-xl whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-white text-primary shadow-[0_12px_32px_-24px_rgba(59,130,246,0.6)] border border-primary/20'
                        : 'text-muted-foreground hover:text-foreground hover:bg-primary/10'
                    }`}
                  >
                    <ItemIcon className="w-4 h-4" />
                    {item.label}
                    {item.badge && (
                      <Badge variant="outline" className="text-xs ml-1 text-primary border-primary/40">
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