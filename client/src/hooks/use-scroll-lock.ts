import { useEffect } from 'react';

/**
 * Hook to lock body scroll when overlays/modals are open
 * Prevents background content from scrolling on mobile
 */
export function useScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;
    
    // Get scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Lock scroll
    document.body.style.overflow = 'hidden';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
    
    // Prevent iOS rubber band scrolling
    document.body.style.position = 'fixed';
    document.body.style.top = `-${window.scrollY}px`;
    document.body.style.width = '100%';
    
    return () => {
      // Get the scroll position before unlocking
      const scrollY = document.body.style.top;
      
      // Restore original styles
      document.body.style.overflow = originalStyle;
      document.body.style.paddingRight = originalPaddingRight;
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.width = '';
      
      // Restore scroll position
      window.scrollTo(0, parseInt(scrollY || '0') * -1);
    };
  }, [isLocked]);
}
