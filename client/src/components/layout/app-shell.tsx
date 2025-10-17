import type { ReactNode } from 'react';
import TopNavigation from '@/components/top-navigation';
import { MobileFooterMenu } from '@/components/mobile-footer-menu';
import MobileLayout from '@/components/layouts/MobileLayout';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <MobileLayout
      header={<TopNavigation />}
      bottomNav={<MobileFooterMenu />}
      className="app-surface text-foreground"
      contentClassName="relative z-0 w-full px-4 pt-6 pb-6 sm:px-6 md:px-8 lg:px-10"
    >
      <div className="pointer-events-none" aria-hidden="true">
        <div className="absolute inset-0 z-0 grid-overlay opacity-70 dark:opacity-40" />
      </div>
      <div className="relative z-10">{children}</div>
    </MobileLayout>
  );
}
