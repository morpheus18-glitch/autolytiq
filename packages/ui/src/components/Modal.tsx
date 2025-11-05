import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X } from 'lucide-react';
import { Button } from './Button';

const modalOverlayVariants = cva(
  'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-200',
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

const modalContentVariants = cva(
  'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full bg-surface-base rounded-lg shadow-xl transition-all duration-200',
  {
    variants: {
      size: {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-4xl',
        full: 'max-w-[95vw] max-h-[95vh]',
      },
      state: {
        open: 'scale-100 opacity-100',
        closed: 'scale-95 opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      size: 'md',
      state: 'closed',
    },
  }
);

export interface ModalProps extends VariantProps<typeof modalContentVariants> {
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

const Modal = ({
  open = false,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = 'md',
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className,
}: ModalProps) => {
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

  if (!open && state === 'closed') return null;

  return (
    <>
      <div
        className={modalOverlayVariants({ state })}
        onClick={handleOverlayClick}
        aria-hidden="true"
      />
      <div
        className={modalContentVariants({ size, state, className })}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
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

        <div className="p-6 overflow-y-auto max-h-[calc(95vh-200px)]">
          {children}
        </div>

        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border-base">
            {footer}
          </div>
        )}
      </div>
    </>
  );
};

Modal.displayName = 'Modal';

export { Modal, modalOverlayVariants, modalContentVariants };
