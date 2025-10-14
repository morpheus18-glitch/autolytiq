import type { ReactNode } from 'react';
import TopNavigation from '@/components/top-navigation';
import { MobileFooterMenu } from '@/components/mobile-footer-menu';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <TopNavigation />
      <main className="flex-1 w-full">
        <div className="w-full min-h-screen">
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8 max-w-7xl mx-auto pb-20 lg:pb-8">
            {children}
          </div>
        </div>
      </main>
      <MobileFooterMenu />
    </div>
  );
}
