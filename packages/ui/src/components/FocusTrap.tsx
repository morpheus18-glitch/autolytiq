import * as React from 'react';

/**
 * FocusTrap component
 * Traps keyboard focus within a container
 * Essential for modals, dialogs, and overlays
 */

export interface FocusTrapProps extends React.HTMLAttributes<HTMLDivElement> {
  active?: boolean;
  returnFocus?: boolean;
  children: React.ReactNode;
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(', ');

export const FocusTrap = React.forwardRef<HTMLDivElement, FocusTrapProps>(
  ({ active = true, returnFocus = true, children, ...props }, ref) => {
    const containerRef = React.useRef<HTMLDivElement>(null);
    const previouslyFocused = React.useRef<HTMLElement | null>(null);

    React.useImperativeHandle(ref, () => containerRef.current!);

    React.useEffect(() => {
      if (!active) return;

      // Store previously focused element
      previouslyFocused.current = document.activeElement as HTMLElement;

      const container = containerRef.current;
      if (!container) return;

      // Get all focusable elements
      const getFocusableElements = () => {
        return Array.from(
          container.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
        ).filter((el) => {
          return (
            el.offsetWidth > 0 ||
            el.offsetHeight > 0 ||
            el.getClientRects().length > 0
          );
        });
      };

      // Focus first element
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      }

      // Handle tab key
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key !== 'Tab') return;

        const focusableElements = getFocusableElements();
        if (focusableElements.length === 0) return;

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstElement) {
            lastElement.focus();
            event.preventDefault();
          }
        } else {
          // Tab
          if (document.activeElement === lastElement) {
            firstElement.focus();
            event.preventDefault();
          }
        }
      };

      container.addEventListener('keydown', handleKeyDown);

      // Cleanup
      return () => {
        container.removeEventListener('keydown', handleKeyDown);

        // Return focus to previously focused element
        if (returnFocus && previouslyFocused.current) {
          previouslyFocused.current.focus();
        }
      };
    }, [active, returnFocus]);

    return (
      <div ref={containerRef} {...props}>
        {children}
      </div>
    );
  }
);

FocusTrap.displayName = 'FocusTrap';
