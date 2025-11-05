import * as React from 'react';
import { cn } from '../utils/cn.js';

/**
 * Collapse component
 * Animated height transition for showing/hiding content
 */

export interface CollapseProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  duration?: number;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export const Collapse = React.forwardRef<HTMLDivElement, CollapseProps>(
  ({ className, open, duration = 300, onOpenChange, children, ...props }, ref) => {
    const contentRef = React.useRef<HTMLDivElement>(null);
    const [height, setHeight] = React.useState<number | 'auto'>(open ? 'auto' : 0);
    const [isAnimating, setIsAnimating] = React.useState(false);

    React.useEffect(() => {
      if (!contentRef.current) return;

      const contentHeight = contentRef.current.scrollHeight;

      if (open) {
        setIsAnimating(true);
        setHeight(contentHeight);

        const timer = setTimeout(() => {
          setHeight('auto');
          setIsAnimating(false);
          onOpenChange?.(true);
        }, duration);

        return () => clearTimeout(timer);
      } else {
        setHeight(contentHeight);
        requestAnimationFrame(() => {
          setIsAnimating(true);
          setHeight(0);
        });

        const timer = setTimeout(() => {
          setIsAnimating(false);
          onOpenChange?.(false);
        }, duration);

        return () => clearTimeout(timer);
      }
    }, [open, duration, onOpenChange]);

    return (
      <div
        ref={ref}
        className={cn('overflow-hidden', className)}
        style={{
          height: height === 'auto' ? 'auto' : `${height}px`,
          transition: isAnimating ? `height ${duration}ms ease-in-out` : 'none',
        }}
        {...props}
      >
        <div ref={contentRef}>{children}</div>
      </div>
    );
  }
);

Collapse.displayName = 'Collapse';
