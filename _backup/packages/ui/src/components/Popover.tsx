import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const popoverContentVariants = cva(
  'absolute z-50 rounded-md border border-border-base bg-surface-base shadow-lg outline-none transition-all duration-150',
  {
    variants: {
      align: {
        start: 'left-0',
        center: 'left-1/2 -translate-x-1/2',
        end: 'right-0',
      },
      side: {
        top: 'bottom-full mb-2',
        bottom: 'top-full mt-2',
        left: 'right-full mr-2',
        right: 'left-full ml-2',
      },
      size: {
        sm: 'w-64',
        md: 'w-80',
        lg: 'w-96',
        auto: 'w-auto',
      },
      state: {
        open: 'opacity-100 scale-100',
        closed: 'opacity-0 scale-95 pointer-events-none',
      },
    },
    defaultVariants: {
      align: 'start',
      side: 'bottom',
      size: 'md',
      state: 'closed',
    },
  }
);

const popoverArrowVariants = cva('absolute w-3 h-3 rotate-45 bg-surface-base border', {
  variants: {
    side: {
      top: 'top-full left-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-b border-border-base',
      bottom:
        'bottom-full left-1/2 -translate-x-1/2 translate-y-1/2 border-l border-t border-border-base',
      left: 'left-full top-1/2 -translate-x-1/2 -translate-y-1/2 border-r border-t border-border-base',
      right:
        'right-full top-1/2 translate-x-1/2 -translate-y-1/2 border-l border-b border-border-base',
    },
  },
  defaultVariants: {
    side: 'bottom',
  },
});

export interface PopoverProps extends VariantProps<typeof popoverContentVariants> {
  trigger: React.ReactNode;
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  modal?: boolean;
  showArrow?: boolean;
  showCloseButton?: boolean;
  title?: React.ReactNode;
  className?: string;
}

const Popover = ({
  trigger,
  children,
  open: controlledOpen,
  onOpenChange,
  align = 'start',
  side = 'bottom',
  size = 'md',
  modal = false,
  showArrow = false,
  showCloseButton = false,
  title,
  className,
}: PopoverProps) => {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const popoverRef = React.useRef<HTMLDivElement>(null);

  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen;
  const setIsOpen = onOpenChange || setUncontrolledOpen;

  const state = isOpen ? 'open' : 'closed';

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, setIsOpen]);

  return (
    <div className="relative inline-block" ref={popoverRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {(isOpen || state === 'open') && (
        <>
          {modal && (
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          )}
          <div
            className={popoverContentVariants({ align, side, size, state, className })}
            role="dialog"
          >
            {showArrow && <div className={popoverArrowVariants({ side })} />}

            {(title || showCloseButton) && (
              <div className="flex items-center justify-between px-4 py-3 border-b border-border-base">
                {title && (
                  <h3 className="text-sm font-semibold text-text-primary">{title}</h3>
                )}
                {showCloseButton && (
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-1 rounded-md hover:bg-surface-subtle transition-colors ml-auto"
                    aria-label="Close"
                  >
                    <X className="w-4 h-4 text-text-secondary" />
                  </button>
                )}
              </div>
            )}

            <div className="p-4">{children}</div>
          </div>
        </>
      )}
    </div>
  );
};

Popover.displayName = 'Popover';

export { Popover, popoverContentVariants, popoverArrowVariants };
