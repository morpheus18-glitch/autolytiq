import { lazy, type ComponentType } from 'react';

// Lazy load all routes for optimal bundle size
const Sitemap = lazy(() => import('@/pages/sitemap'));
const Dashboard = lazy(() => import('@/pages/dashboard'));
const Settings = lazy(() => import('@/pages/settings'));
const UserPermissions = lazy(() => import('@/pages/admin/user-permissions'));
const RolePresets = lazy(() => import('@/pages/admin/role-presets'));

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
  { path: '/', component: Sitemap },
  { path: '/sitemap', component: Sitemap },
  { path: '/dashboard', component: Dashboard },
  { path: '/settings/:tab?', component: Settings },
  { path: '/admin/user-permissions', component: UserPermissions },
  { path: '/admin/role-presets', component: RolePresets },
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
