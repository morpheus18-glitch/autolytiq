/**
 * Deal Studio - Responsive Wrapper
 *
 * Automatically detects viewport size and renders:
 * - DealStudioDesktop for screens >= 1024px (desktop/tablet landscape)
 * - DealStudioMobile for screens < 1024px (mobile/tablet portrait)
 *
 * Provides unified API for both layouts
 */

import { useState, useEffect } from 'react';
import { DealStudioMobile } from './mobile/DealStudioMobile';
import { DealStudioDesktop } from './desktop/DealStudioDesktop';
import { DealStudioProvider } from '@/contexts/DealStudioContext';

export interface DealStudioProps {
  /** Whether modal is open */
  open?: boolean;
  /** Callback when modal should close */
  onClose?: () => void;
  /** Callback when deal is pasted to chat */
  onPasteToChat?: (message: string) => void;
  /** Force mobile layout even on desktop (for testing) */
  forceMobile?: boolean;
  /** Force desktop layout even on mobile (for testing) */
  forceDesktop?: boolean;
  /** Optional custom class name */
  className?: string;
}

/**
 * Responsive Deal Studio
 *
 * Automatically switches between desktop and mobile layouts based on viewport size.
 * Breakpoint: 1024px (Tailwind 'lg' breakpoint)
 */
export function DealStudio({
  open = false,
  onClose,
  onPasteToChat,
  forceMobile = false,
  forceDesktop = false,
  className,
}: DealStudioProps) {
  const [isMobile, setIsMobile] = useState(() => {
    if (forceMobile) return true;
    if (forceDesktop) return false;
    return typeof window !== 'undefined' && window.innerWidth < 1024;
  });

  useEffect(() => {
    // If layout is forced, don't listen to resize events
    if (forceMobile || forceDesktop) return;

    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    // Add resize listener
    window.addEventListener('resize', handleResize);

    // Check on mount
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [forceMobile, forceDesktop]);

  // Desktop layout (three-panel interface)
  const renderDesktop = () => {
    return (
      <DealStudioDesktop
        open={open}
        onClose={onClose}
        onPasteToChat={onPasteToChat}
      />
    );
  };

  // Mobile layout (full-screen with tabs)
  const renderMobile = () => {
    return (
      <DealStudioMobile
        open={open}
        onClose={onClose}
        onPasteToChat={onPasteToChat}
        className={className}
      />
    );
  };

  // Don't render anything if not open
  if (!open) return null;

  // Render appropriate layout
  return (
    <DealStudioProvider>
      {isMobile ? renderMobile() : renderDesktop()}
    </DealStudioProvider>
  );
}

/**
 * Hook to control Deal Studio (works for both mobile and desktop)
 */
export function useDealStudioModal() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen((prev) => !prev);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
}

/**
 * Detect if current viewport is mobile
 */
export function useIsMobile(breakpoint: number = 1024): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    return typeof window !== 'undefined' && window.innerWidth < breakpoint;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [breakpoint]);

  return isMobile;
}
