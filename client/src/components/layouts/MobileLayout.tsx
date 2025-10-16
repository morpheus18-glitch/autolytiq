import { type ReactNode, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';

export interface MobileLayoutProps {
  header?: ReactNode;
  headerClassName?: string;
  bottomNav?: ReactNode;
  bottomNavClassName?: string;
  children: ReactNode;
  className?: string;
  mainClassName?: string;
  contentClassName?: string;
}

const VIEWPORT_VAR = '--vh';

export function MobileLayout({
  header,
  headerClassName,
  bottomNav,
  bottomNavClassName,
  children,
  className,
  mainClassName,
  contentClassName,
}: MobileLayoutProps) {
  useEffect(() => {
    const setViewportUnit = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty(VIEWPORT_VAR, `${vh}px`);
    };

    setViewportUnit();

    window.addEventListener('resize', setViewportUnit);
    window.addEventListener('orientationchange', setViewportUnit);

    return () => {
      window.removeEventListener('resize', setViewportUnit);
      window.removeEventListener('orientationchange', setViewportUnit);
    };
  }, []);

  const containerStyle = useMemo(
    () => ({
      minHeight: 'calc(var(--vh, 1vh) * 100)',
    }),
    [],
  );

  const hasBottomNav = Boolean(bottomNav);

  return (
    <div
      className={cn(
        'relative flex w-full flex-1 flex-col overflow-hidden bg-surface-base text-neutral-900 transition-colors duration-base dark:bg-surface-dark dark:text-neutral-50',
        className,
      )}
      style={containerStyle}
    >
      {header ? (
        <header
          className={cn(
            'flex h-16 flex-none items-center border-b border-neutral-200/60 bg-surface-glass/95 px-4 backdrop-blur-xl transition-colors duration-base supports-[backdrop-filter]:bg-surface-glass/80 dark:border-neutral-700/60 dark:bg-surface-dark/75',
            'z-sticky top-0 left-0 right-0',
            headerClassName,
          )}
        >
          {header}
        </header>
      ) : null}
      <main
        className={cn(
          'relative flex-1 overflow-y-auto overscroll-y-contain bg-transparent [-webkit-overflow-scrolling:touch]',
          hasBottomNav ? 'pb-24 md:pb-16' : 'pb-12',
          mainClassName,
        )}
      >
        <div
          className={cn(
            'mx-auto min-h-full w-full max-w-7xl px-4 pb-[calc(env(safe-area-inset-bottom)+1.5rem)] pt-6 sm:px-6 md:px-8 lg:px-10',
            hasBottomNav && 'pb-[calc(env(safe-area-inset-bottom)+6rem)]',
            contentClassName,
          )}
        >
          {children}
        </div>
      </main>
      {hasBottomNav ? (
        <nav
          className={cn(
            'pointer-events-auto fixed inset-x-0 bottom-0 flex flex-none justify-center border-t border-neutral-200/60 bg-surface-glass/95 pb-[env(safe-area-inset-bottom)] pt-2 backdrop-blur-2xl transition-colors duration-base supports-[backdrop-filter]:bg-surface-glass/80 dark:border-neutral-700/60 dark:bg-surface-dark/80',
            'z-sticky',
            bottomNavClassName,
          )}
        >
          <div className="w-full max-w-5xl px-4">{bottomNav}</div>
        </nav>
      ) : null}
    </div>
  );
}

export default MobileLayout;
