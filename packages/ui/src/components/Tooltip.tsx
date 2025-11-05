import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const tooltipVariants = cva(
  'absolute z-50 px-3 py-1.5 text-xs font-medium rounded-md shadow-md pointer-events-none transition-opacity duration-150',
  {
    variants: {
      variant: {
        default: 'bg-neutral-900 text-white',
        light: 'bg-white text-neutral-900 border border-border-base',
        error: 'bg-status-error text-white',
        success: 'bg-status-success text-white',
        warning: 'bg-status-warning text-white',
        info: 'bg-accent-info text-white',
      },
      side: {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
      },
    },
    defaultVariants: {
      variant: 'default',
      side: 'top',
    },
  }
);

const tooltipArrowVariants = cva('absolute w-2 h-2 rotate-45', {
  variants: {
    variant: {
      default: 'bg-neutral-900',
      light: 'bg-white border border-border-base',
      error: 'bg-status-error',
      success: 'bg-status-success',
      warning: 'bg-status-warning',
      info: 'bg-accent-info',
    },
    side: {
      top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2',
      bottom: 'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2',
      left: 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2',
      right: 'right-full top-1/2 translate-x-1/2 -translate-y-1/2',
    },
  },
  defaultVariants: {
    variant: 'default',
    side: 'top',
  },
});

export interface TooltipProps extends VariantProps<typeof tooltipVariants> {
  content: React.ReactNode;
  children: React.ReactNode;
  showArrow?: boolean;
  delayDuration?: number;
  disabled?: boolean;
  className?: string;
}

const Tooltip = ({
  content,
  children,
  variant = 'default',
  side = 'top',
  showArrow = true,
  delayDuration = 200,
  disabled = false,
  className,
}: TooltipProps) => {
  const [isVisible, setIsVisible] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const handleMouseEnter = () => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayDuration);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  React.useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      {isVisible && content && (
        <div
          className={tooltipVariants({ variant, side, className })}
          style={{ opacity: isVisible ? 1 : 0 }}
          role="tooltip"
        >
          {content}
          {showArrow && (
            <div className={tooltipArrowVariants({ variant, side })} />
          )}
        </div>
      )}
    </div>
  );
};

Tooltip.displayName = 'Tooltip';

export { Tooltip, tooltipVariants };
