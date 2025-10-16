import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "wouter";
import {
  ArrowRight,
  Bell,
  Car,
  ChevronDown,
  Database,
  Menu,
  Plus,
  Search,
  Settings,
  Shield,
  User,
  X,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { QUICK_ACTIONS, WORKFLOW_SECTIONS } from "@/config/navigation";
import { cn } from "@/lib/utils";

export default function TopNavigation() {
  const [location] = useLocation();
  const { user } = useAuth();

  const resolveActiveTab = (pathname: string) => {
    const matched = WORKFLOW_SECTIONS.find((tab) =>
      pathname.startsWith(tab.path) ||
      tab.subItems?.some((item) =>
        pathname.startsWith(item.path) || item.matchPaths?.some((match) => pathname.startsWith(match))
      )
    );
    return matched?.id ?? "inventory";
  };

  const [activeTab, setActiveTab] = useState(() => resolveActiveTab(location));
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !navRef.current) {
      return;
    }

    const updateNavHeight = () => {
      if (!navRef.current) return;
      document.documentElement.style.setProperty(
        "--top-nav-height",
        `${navRef.current.offsetHeight}px`
      );
    };

    updateNavHeight();

    const resizeObserver = new ResizeObserver(updateNavHeight);
    resizeObserver.observe(navRef.current);
    window.addEventListener("resize", updateNavHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", updateNavHeight);
    };
  }, []);

  const currentTab = WORKFLOW_SECTIONS.find((tab) => tab.id === activeTab);

  const handleQuickAction = (target: string) => {
    window.location.href = target;
  };

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  useEffect(() => {
    const resolved = resolveActiveTab(location);
    if (resolved !== activeTab) {
      setActiveTab(resolved);
    }
  }, [location, activeTab]);

  return (
    <>
      <div
        ref={navRef}
        className="sticky top-0 z-50 px-2 pt-2 pb-2 sm:px-4 sm:pt-3 sm:pb-3 lg:px-10 lg:pt-4 lg:pb-3"
      >
        <div className="relative">
          <div className="absolute inset-x-0 -top-2 h-px gradient-divider opacity-70" aria-hidden="true" />
          <div className="glass-panel relative flex flex-col gap-2 sm:gap-3 rounded-xl sm:rounded-2xl px-2 py-2 shadow-card-xl sm:px-4 sm:py-3 lg:px-6 lg:py-4">
            <div className="flex items-center justify-between gap-2 sm:gap-3">
              <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                <Link href="/" className="flex items-center gap-2 sm:gap-3">
                  <span className="inline-flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl brand-gradient shadow-brand">
                    <Car className="h-4 w-4 sm:h-5 sm:w-5" />
                  </span>
                  <div className="hidden sm:flex flex-col">
                    <span className="text-base font-semibold leading-tight text-foreground">AutolytiQ</span>
                    <span className="text-[11px] uppercase tracking-[0.32em] text-muted-foreground/80">
                      AI Revenue Engine
                    </span>
                  </div>
                  <span className="sm:hidden text-sm font-semibold text-foreground">AutolytiQ</span>
                </Link>
                <Button
                  variant="ghost"
                  size="sm"
                  className="lg:hidden h-12 w-12 md:h-10 md:w-10 p-0 text-muted-foreground"
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  aria-label="Toggle navigation menu"
                  data-testid="button-mobile-menu"
                >
                  {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </Button>
              </div>

              <nav className="hidden flex-1 items-center justify-center gap-1 lg:flex">
                {WORKFLOW_SECTIONS.map((tab) => {
                  const isActive = activeTab === tab.id;
                  const Icon = tab.icon;

                  return (
                    <DropdownMenu key={tab.id}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={cn(
                            "group relative flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-all",
                            "text-muted-foreground/80 hover:text-foreground",
                            "hover:bg-white/60 dark:hover:bg-white/10",
                            isActive &&
                              "bg-white/70 text-foreground shadow-md dark:bg-white/10 dark:text-white",
                            isActive &&
                              "after:absolute after:inset-x-1 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-gradient-to-r after:from-primary after:via-accent after:to-secondary"
                          )}
                        >
                          <Icon className="h-4 w-4" />
                          {tab.label}
                          <ChevronDown className="h-3 w-3 opacity-70 transition-transform group-data-[state=open]:rotate-180" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-72 max-h-96 overflow-y-auto border-0 bg-transparent p-0"
                      >
                        <div className="glass-card rounded-xl p-3">
                          <DropdownMenuLabel className="flex items-center gap-2 text-sm font-semibold text-foreground">
                            <Icon className="h-4 w-4" />
                            {tab.label}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator className="my-2" />
                          <div className="space-y-1">
                            {tab.subItems?.map((item) => {
                              const ItemIcon = item.icon;
                              return (
                                <DropdownMenuItem key={item.path} asChild className="focus:bg-transparent">
                                  <Link
                                    href={item.path}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-white/70 hover:text-foreground dark:hover:bg-white/10"
                                  >
                                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                      <ItemIcon className="h-4 w-4" />
                                    </span>
                                    <span className="flex-1 text-sm font-medium">{item.label}</span>
                                    {item.badge && (
                                      <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                                        {item.badge}
                                      </Badge>
                                    )}
                                  </Link>
                                </DropdownMenuItem>
                              );
                            })}
                          </div>
                        </div>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                })}
              </nav>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative hidden xl:flex">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={16} />
                  <Input
                    type="text"
                    placeholder="Search the AutolytiQ fabric"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    className="w-56 rounded-xl border-border/80 bg-transparent pl-10 text-sm focus-visible:ring-2 focus-visible:ring-primary/40"
                  />
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="hidden items-center gap-2 rounded-xl bg-white/80 text-foreground shadow-sm hover:bg-white/90 dark:bg-white/10 dark:text-white dark:hover:bg-white/20 lg:flex"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="hidden xl:inline">New</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60 border-0 bg-transparent p-0">
                    <div className="glass-card rounded-xl p-3">
                      <DropdownMenuLabel className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Quick Actions
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-2" />
                      <div className="space-y-1">
                        {QUICK_ACTIONS.map((action) => {
                          const ActionIcon = action.icon;
                          const accent = action.accentClass ?? "text-primary";
                          return (
                            <DropdownMenuItem
                              key={action.id}
                              onClick={() => handleQuickAction(action.target)}
                              className="flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-foreground hover:bg-white/70 focus:bg-white/70 dark:hover:bg-white/10"
                            >
                              <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10", accent)}>
                                <ActionIcon className="h-4 w-4" />
                              </span>
                              <span className="font-medium">{action.label}</span>
                            </DropdownMenuItem>
                          );
                        })}
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <Button
                  variant="ghost"
                  size="sm"
                  className="relative hidden h-9 w-9 items-center justify-center rounded-xl text-muted-foreground hover:text-foreground lg:flex"
                >
                  <Bell className="h-4 w-4" />
                  <Badge className="badge-glow absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                    3
                  </Badge>
                </Button>

                <ThemeToggle />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2 rounded-xl px-2 py-1.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <User className="h-4 w-4" />
                      </span>
                      <span className="hidden max-w-[7rem] truncate text-sm font-medium text-foreground xl:inline">
                        {(user as any)?.firstName || "User"}
                      </span>
                      <ChevronDown className="hidden h-3 w-3 opacity-60 xl:inline" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64 border-0 bg-transparent p-0">
                    <div className="glass-card rounded-xl p-3">
                      <DropdownMenuLabel className="flex flex-col space-y-1 text-foreground">
                        <p className="text-sm font-semibold">
                          {(user as any)?.firstName} {(user as any)?.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{(user as any)?.email}</p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-white/60 dark:hover:bg-white/10">
                        <Link href="/admin/user-profile" className="flex items-center">
                          <User className="mr-2 h-4 w-4" />
                          Profile Settings
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-white/60 dark:hover:bg-white/10">
                        <Link href="/admin/security-center" className="flex items-center">
                          <Shield className="mr-2 h-4 w-4" />
                          Security
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-white/60 dark:hover:bg-white/10">
                        <Link href="/admin/system-settings" className="flex items-center">
                          <Settings className="mr-2 h-4 w-4" />
                          Preferences
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild className="cursor-pointer rounded-lg px-3 py-2 text-sm hover:bg-white/60 dark:hover:bg-white/10">
                        <Link href="/admin/dealer-configuration" className="flex items-center">
                          <Database className="mr-2 h-4 w-4" />
                          Dealer Config
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className="my-2" />
                      <DropdownMenuItem className="cursor-pointer rounded-lg px-3 py-2 text-sm text-destructive hover:bg-destructive/10">
                        <a href="/api/logout" className="flex w-full items-center">
                          <LogOut className="mr-2 h-4 w-4" />
                          Sign Out
                        </a>
                      </DropdownMenuItem>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-muted-foreground/80">
                <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] dark:bg-white/10">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_0_4px_rgba(59,130,246,0.18)]" />
                  {currentTab?.label ?? "Inventory Pipeline"}
                </span>
                <span className="hidden sm:inline text-muted-foreground/70">
                  Connected to AutolytiQ data fabric in real time
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground/80">
                <span className="hidden items-center gap-1 sm:flex">
                  <Shield className="h-3.5 w-3.5 text-primary/80" />
                  <span>Enterprise-grade encryption</span>
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-primary/8 px-2.5 py-1 font-medium text-primary/85">
                  <ArrowRight className="h-3 w-3" />
                  Sales, analytics &amp; AI in sync
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col">
          <div className="flex h-16 items-center justify-between border-b border-border/50 px-4 bg-background/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl brand-gradient shadow-brand">
                <Car className="h-5 w-5" />
              </span>
              <span className="text-base font-semibold text-foreground">AutolytiQ</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(false)}
              className="h-12 w-12 rounded-xl p-0 text-muted-foreground hover:text-foreground"
              aria-label="Close navigation"
              data-testid="button-close-menu"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto overscroll-contain">
            <div className="space-y-6 px-4 pb-28 pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground/60" size={18} />
              <Input
                type="text"
                placeholder="Search vehicles, customers, deals..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="h-12 rounded-xl border-border/60 bg-white/85 pl-11 text-base shadow-sm focus-visible:ring-2 focus-visible:ring-primary/35 dark:bg-white/10"
              />
            </div>

            <div className="space-y-5">
              {WORKFLOW_SECTIONS.map((tab) => {
                const Icon = tab.icon;
                return (
                  <div key={tab.id} className="space-y-2">
                    <div className="flex items-center gap-3 rounded-xl bg-white/85 px-4 py-3 text-sm font-semibold text-foreground shadow-sm dark:bg-white/10">
                      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="h-5 w-5" />
                      </span>
                      {tab.label}
                    </div>
                    {tab.subItems && (
                      <div className="ml-2 space-y-1.5">
                        {tab.subItems.map((item) => {
                          const ItemIcon = item.icon;
                          const isActive =
                            location === item.path || item.matchPaths?.some((match) => location.startsWith(match));

                          return (
                            <Link
                              key={item.path}
                              href={item.path}
                              className={cn(
                                "flex items-center justify-between gap-3 rounded-xl px-4 py-3.5 min-h-[56px] text-sm transition-all",
                                isActive
                                  ? "bg-primary/15 text-primary shadow-sm"
                                  : "text-foreground/80 hover:bg-white/70 hover:text-foreground dark:hover:bg-white/10"
                              )}
                              onClick={() => setIsMobileMenuOpen(false)}
                              data-testid={`link-mobile-nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
                            >
                              <span className="flex items-center gap-3 text-left">
                                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                  <ItemIcon className="h-5 w-5" />
                                </span>
                                <span className="font-medium leading-snug">{item.label}</span>
                              </span>
                              <span className="flex items-center gap-2">
                                {item.badge && (
                                  <Badge variant="secondary" className="text-[10px] uppercase tracking-wide">
                                    {item.badge}
                                  </Badge>
                                )}
                                <ArrowRight className="h-4 w-4 text-muted-foreground/70" />
                              </span>
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="border-t border-border/60 pt-6">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground/70">Quick Actions</h3>
              <div className="mt-3 grid grid-cols-1 gap-3">
                {QUICK_ACTIONS.map((action) => {
                  const ActionIcon = action.icon;
                  return (
                    <Button
                      key={action.id}
                      variant="outline"
                      className="flex items-center justify-start gap-3 rounded-xl border-border/60 px-4 py-3 text-left text-sm hover:border-primary/35 hover:text-primary"
                      onClick={() => {
                        handleQuickAction(action.target);
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <ActionIcon className="h-4 w-4" />
                      </span>
                      <span>
                        <div className="font-semibold">{action.label}</div>
                        <div className="text-xs text-muted-foreground/80">{action.description}</div>
                      </span>
                    </Button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-border/55 pt-6">
              <div className="flex items-center gap-3 rounded-xl bg-white/85 px-4 py-3 shadow-sm dark:bg-white/10">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-5 w-5" />
                </span>
                <div>
                  <div className="text-sm font-semibold text-foreground">
                    {(user as any)?.firstName} {(user as any)?.lastName}
                  </div>
                  <div className="text-xs text-muted-foreground">{(user as any)?.email}</div>
                </div>
              </div>

              <div className="mt-3 space-y-1">
                <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-lg px-4 py-3 text-sm hover:bg-white/75 dark:hover:bg-white/10">
                  <Link href="/admin/system-settings">
                    <Settings className="h-5 w-5" />
                    Settings &amp; Preferences
                  </Link>
                </Button>
                <Button asChild variant="ghost" className="w-full justify-start gap-3 rounded-lg px-4 py-3 text-sm hover:bg-white/75 dark:hover:bg-white/10">
                  <Link href="/admin/security-center">
                    <Shield className="h-5 w-5" />
                    Security &amp; Privacy
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 rounded-lg px-4 py-3 text-sm text-destructive hover:bg-destructive/15"
                  onClick={() => (window.location.href = "/api/logout")}
                >
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </Button>
              </div>
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
}
