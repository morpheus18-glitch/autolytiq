import type { ReactNode } from 'react';
import TopNavigation from '@/components/top-navigation';
import { MobileFooterMenu } from '@/components/mobile-footer-menu';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_hsl(var(--surface)/0.55),_transparent_60%),_linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--surface-muted)))] dark:bg-[radial-gradient(circle_at_top_left,_hsl(var(--surface)/0.4),_transparent_60%),_linear-gradient(180deg,_hsl(var(--background)),_hsl(var(--surface-muted)))]">
      <TopNavigation />
      <main className="relative flex-1 w-full">
        <div className="w-full min-h-screen">
          <div className="px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-10 max-w-7xl mx-auto pb-24 lg:pb-12">
            {children}
          </div>
        </div>
      </main>
      <MobileFooterMenu />
    </div>
  );
}
