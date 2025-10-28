import type { PropsWithChildren } from 'react';
import { Link, useLocation } from 'wouter';

import type { AppRoute } from '@/types/navigation';
import { cn } from '@/lib/utils';

interface AppShellProps extends PropsWithChildren {
  readonly routes: AppRoute[];
}

export function AppShell({ routes, children }: AppShellProps) {
  const [location] = useLocation();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <div className="app-header__identity">
            <span className="app-header__badge">Autolytiq Dev Path</span>
            <h1 className="app-header__title">Incremental Rebuild Workspace</h1>
            <p className="app-header__subtitle">
              This environment intentionally keeps only foundational features so the team can reintroduce complex
              workflows in a controlled manner.
            </p>
          </div>
          <nav className="app-nav" aria-label="Primary">
            {routes.map((route) => (
              <Link key={route.path} href={route.path} className="app-nav__link-wrapper">
                <span
                  className={cn('app-nav__link', location === route.path && 'app-nav__link--active')}
                  title={route.description}
                >
                  {route.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="app-main">{children}</main>
      <footer className="app-footer">
        Built for validating flows before promoting them back into production.
      </footer>
    </div>
  );
}
