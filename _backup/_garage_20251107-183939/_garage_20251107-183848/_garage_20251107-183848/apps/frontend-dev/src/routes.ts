import type { AppRoute } from '@/types/navigation';

export const appRoutes: AppRoute[] = [
  {
    path: '/',
    label: 'Home',
    description: 'Overview of the incremental rebuild roadmap and current development focus.',
  },
  {
    path: '/settings',
    label: 'Settings',
    description: 'Foundation settings and configuration primitives to test domain concepts.',
  },
];
