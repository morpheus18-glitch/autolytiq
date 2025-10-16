import type { ReactNode } from 'react';
import TopNavigation from '@/components/top-navigation';
import { MobileFooterMenu } from '@/components/mobile-footer-menu';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative flex min-h-[100dvh] flex-col app-surface text-foreground overflow-x-hidden">
      <div className="absolute inset-0 pointer-events-none grid-overlay opacity-70 dark:opacity-40" aria-hidden="true" />
      <TopNavigation />
      <main className="relative flex-1 w-full overflow-x-hidden">
        <div className="w-full max-w-full">
          <div className="relative z-10 mx-auto max-w-7xl px-3 pt-4 pb-mobile-footer sm:px-6 sm:pt-6 md:px-8 md:pt-8 lg:px-10 lg:pt-10">
            {children}
          </div>
        </div>
      </main>
      <MobileFooterMenu />
    </div>
  );
}
