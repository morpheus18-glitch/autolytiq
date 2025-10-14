import { Switch, Route } from 'wouter';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from '@/contexts/theme-context';
import { useAuth } from '@/hooks/useAuth';
import { usePixelTracker } from '@/hooks/use-pixel-tracker';
import Landing from '@/pages/landing';
import Login from '@/pages/login';
import AuthTest from '@/pages/auth-test';
import NotFound from '@/pages/not-found';
import AppShell from '@/components/layout/app-shell';
import { TrackingPixel } from '@/components/tracking-pixel';
import { appRoutes } from '@/routes';

function Router() {
  usePixelTracker();

  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Switch>
        <Route path="/login" component={Login} />
        <Route path="/auth-test" component={AuthTest} />
        <Route component={Landing} />
      </Switch>
    );
  }

  return (
    <AppShell>
      <Switch>
        {appRoutes.map((route) => (
          <Route key={route.path} path={route.path} component={route.component} />
        ))}
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
          <TrackingPixel />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
