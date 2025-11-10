import { ReactNode } from 'react';
import { MobileBottomTabNav } from './MobileBottomTabNav';
import { useMobile } from '@repo/ui';

interface MobileShellProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export function MobileShell({ children, showBottomNav = true }: MobileShellProps) {
  const isMobile = useMobile();

  return (
    <div className="min-h-screen bg-bg-0">
      {/* Main content with bottom padding on mobile to prevent tab overlap */}
      <main className={isMobile && showBottomNav ? 'pb-20' : ''}>
        {children}
      </main>

      {/* Bottom tab navigation - only on mobile */}
      {isMobile && showBottomNav && <MobileBottomTabNav />}
    </div>
  );
}
