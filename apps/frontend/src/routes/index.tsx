import { lazy, type ComponentType } from 'react';

// Lazy load all routes for optimal bundle size
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Settings = lazy(() => import('@/pages/settings'));

interface RouteDefinition {
  path: string;
  component: ComponentType<any>;
  aliases?: string[];
}

export interface ResolvedRoute {
  path: string;
  component: ComponentType<any>;
  aliasFor?: string;
}

const routeDefinitions: RouteDefinition[] = [
  { path: '/', component: Dashboard },
  { path: '/dashboard', component: Dashboard },
  { path: '/settings/:tab?', component: Settings },
];

export const appRoutes: ResolvedRoute[] = routeDefinitions.flatMap((route) => {
  const resolved: ResolvedRoute[] = [
    { path: route.path, component: route.component }
  ];

  if (route.aliases) {
    for (const alias of route.aliases) {
      resolved.push({ path: alias, component: route.component, aliasFor: route.path });
    }
  }

  return resolved;
});
