import { useMemo, Suspense } from 'react';
import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/theme-context';
import { useAuth } from '@/hooks/useAuth';
import Landing from '@/pages/landing';
import Login from '@/pages/login';
import NotFound from '@/pages/not-found';
import AppShell from '@/components/layout/app-shell';
import { appRoutes } from '@/routes';

// Loading fallback component
function RouteLoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-brand-primary"></div>
        <p className="mt-4 text-sm text-neutral-600">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  const { user, isAuthenticated, isLoading } = useAuth();

  const allowedRouteSet = useMemo(() => {
    const allowed = user?.access?.allowedRoutes ?? [];
    return new Set(allowed.length > 0 ? allowed : ['*']);
  }, [user?.access?.allowedRoutes]);

  const filteredRoutes = useMemo(() => {
    if (allowedRouteSet.has('*')) {
      return appRoutes;
    }

    return appRoutes.filter((route) => allowedRouteSet.has(route.path));
  }, [allowedRouteSet]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(var(--vh,1vh)*100)] bg-surface-base">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-brand-primary"></div>
          <p className="mt-4 text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <AppShell>
      <Suspense fallback={<RouteLoadingFallback />}>
        <Switch>
          {filteredRoutes.map((route) => (
            <Route key={route.path} path={route.path} component={route.component} />
          ))}
          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
