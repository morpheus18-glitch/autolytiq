import type { ReactNode } from 'react';
import TopNavigation from '@/components/top-navigation';
import { MobileFooterMenu } from '@/components/mobile-footer-menu';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-[100dvh] app-surface text-foreground">
      <div className="absolute inset-0 grid-overlay opacity-70 dark:opacity-40 pointer-events-none" aria-hidden="true" />
      <TopNavigation />
      <main className="relative flex-1 w-full">
        <div className="w-full min-h-[100dvh]">
          <div className="relative z-10 px-4 py-6 sm:px-8 sm:py-8 lg:px-10 lg:py-10 max-w-7xl mx-auto pb-24 lg:pb-14">
            {children}
          </div>
        </div>
      </main>
      <MobileFooterMenu />
    </div>
  );
}
