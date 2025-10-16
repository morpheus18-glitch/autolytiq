import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { type ReactNode, useEffect } from 'react';
import { lockScroll, unlockScroll } from '../../../lib/scroll-lock';
import { cn } from '@/lib/utils';

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
  contentClassName?: string;
  showCloseButton?: boolean;
}

export function Modal({
  open,
  onOpenChange,
  title,
  description,
  footer,
  children,
  className,
  contentClassName,
  showCloseButton = true,
}: ModalProps) {
  useEffect(() => {
    if (open) {
      lockScroll();
      return () => {
        unlockScroll();
      };
    }

    unlockScroll();

    return undefined;
  }, [open]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modalBackdrop bg-overlay-backdrop animate-fade-in" />
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-modal w-[min(92vw,640px)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-neutral-200/50 bg-surface-base p-0 text-neutral-900 shadow-modal outline-none transition-all duration-base ease-out dark:border-neutral-700/40 dark:bg-surface-dark dark:text-neutral-50',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/60',
            className,
          )}
        >
          <div className="flex items-center justify-between border-b border-neutral-200/60 px-6 py-4 dark:border-neutral-700/60">
            <div>
              {title ? (
                <Dialog.Title className="text-lg font-semibold text-neutral-900 dark:text-neutral-50">{title}</Dialog.Title>
              ) : null}
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
            {showCloseButton ? (
              <Dialog.Close asChild>
                <button
                  type="button"
                  aria-label="Close modal"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-transparent text-neutral-500 transition-colors duration-fast hover:border-neutral-200 hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/50 dark:hover:border-neutral-700 dark:hover:text-neutral-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </Dialog.Close>
            ) : null}
          </div>
          <div className={cn('scrollbar-custom max-h-[65vh] overflow-y-auto px-6 py-5', contentClassName)}>{children}</div>
          {footer ? (
            <div className="flex flex-col gap-3 border-t border-neutral-200/60 bg-surface-muted/70 px-6 py-4 dark:border-neutral-700/60 dark:bg-surface-dark/60">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default Modal;
