import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';

const sheetOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300',
  {
    variants: {
      state: {
        open: 'opacity-100',
        closed: 'opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      state: 'closed',
    },
  }
);

const sheetContentVariants = cva(
  'fixed z-50 bg-surface-base shadow-xl transition-transform duration-300 overflow-y-auto',
  {
    variants: {
      side: {
        top: 'top-0 left-0 right-0 h-auto max-h-[80vh] border-b border-border-base',
        bottom: 'bottom-0 left-0 right-0 h-auto max-h-[80vh] border-t border-border-base',
        left: 'top-0 left-0 bottom-0 w-full sm:max-w-md border-r border-border-base',
        right: 'top-0 right-0 bottom-0 w-full sm:max-w-md border-l border-border-base',
      },
      state: {
        open: '',
        closed: '',
      },
    },
    compoundVariants: [
      {
        side: 'top',
        state: 'open',
        className: 'translate-y-0',
      },
      {
        side: 'top',
        state: 'closed',
        className: '-translate-y-full',
      },
      {
        side: 'bottom',
        state: 'open',
        className: 'translate-y-0',
      },
      {
        side: 'bottom',
        state: 'closed',
        className: 'translate-y-full',
      },
      {
        side: 'left',
        state: 'open',
        className: 'translate-x-0',
      },
      {
        side: 'left',
        state: 'closed',
        className: '-translate-x-full',
      },
      {
        side: 'right',
        state: 'open',
        className: 'translate-x-0',
      },
      {
        side: 'right',
        state: 'closed',
        className: 'translate-x-full',
      },
    ],
    defaultVariants: {
      side: 'right',
      state: 'closed',
    },
  }
);

export interface SheetProps extends VariantProps<typeof sheetContentVariants> {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showCloseButton?: boolean;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  className?: string;
}

const Sheet = ({
  open = false,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = 'right',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: SheetProps) => {
  const state = open ? 'open' : 'closed';

  React.useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange?.(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, closeOnEscape, onOpenChange]);

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const handleOverlayClick = () => {
    if (closeOnOverlayClick) {
      onOpenChange?.(false);
    }
  };

  return (
    <>
      <div
        className={sheetOverlayVariants({ state })}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        className={sheetContentVariants({ side, state, className })}
        role="dialog"
        aria-modal="true"
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between p-6 border-b border-border-base">
            <div className="flex-1">
              {title && (
                <h2 className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-1 text-sm text-text-secondary">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                onClick={() => onOpenChange?.(false)}
                className="ml-4 p-1 rounded-md hover:bg-surface-subtle transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-text-secondary" />
              </button>
            )}
          </div>
        )}

        <div className="flex-1 p-6">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border-base">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

Sheet.displayName = 'Sheet';

export { Sheet, sheetOverlayVariants, sheetContentVariants };
