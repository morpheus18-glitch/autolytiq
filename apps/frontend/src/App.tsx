import { useMemo, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/theme-context';
import { QuickViewProvider } from '@/contexts/QuickViewContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/hooks/useAuth';
import Landing from '@/pages/landing';
import Login from '@/pages/login';
import NotFound from '@/pages/not-found';
import AppShell from '@/components/layout/app-shell';
import { getAppRoutes } from '@/routes';

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

  console.log('[Router] Rendering with state:', { isLoading, isAuthenticated, hasUser: Boolean(user) });

  if (isLoading) {
    console.log('[Router] Showing loading spinner');
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
    console.log('[Router] Not authenticated, showing landing/login');
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Landing />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  console.log('[Router] Authenticated, showing app shell');

  return (
    <Routes>
      <Route element={<AppShell />}>
        {getAppRoutes(allowedRouteSet)}
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            <QuickViewProvider>
              <BrowserRouter>
                <Router />
              </BrowserRouter>
              <Toaster />
            </QuickViewProvider>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
// trigger build
