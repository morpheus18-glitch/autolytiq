import * as Dialog from '@radix-ui/react-dialog';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { lockScroll, unlockScroll } from '../../../lib/scroll-lock';
import { cn } from '@/lib/utils';

const DRAG_THRESHOLD = 120;

export interface BottomSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BottomSheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  className,
}: BottomSheetProps) {
  const startY = useRef<number | null>(null);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

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

  const resetDrag = useCallback(() => {
    startY.current = null;
    setDragOffset(0);
    setIsDragging(false);
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    startY.current = event.clientY;
    setIsDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!isDragging || startY.current === null) {
        return;
      }

      const delta = event.clientY - startY.current;
      if (delta > 0) {
        setDragOffset(delta);
      }
    },
    [isDragging],
  );

  const handlePointerUp = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (startY.current === null) {
        return;
      }

      if (dragOffset > DRAG_THRESHOLD) {
        onOpenChange(false);
      }

      event.currentTarget.releasePointerCapture(event.pointerId);
      resetDrag();
    },
    [dragOffset, onOpenChange, resetDrag],
  );

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-modalBackdrop bg-overlay-scrim animate-fade-in" />
        <Dialog.Content
          className={cn(
            'pointer-events-none fixed inset-x-0 bottom-0 z-modal flex flex-col rounded-t-3xl border-t border-neutral-200/50 bg-surface-base pb-[env(safe-area-inset-bottom)] text-neutral-900 shadow-modal transition-transform duration-base ease-out dark:border-neutral-700/40 dark:bg-surface-dark dark:text-neutral-50',
            className,
          )}
          style={{
            transform: `translateY(${dragOffset}px)`,
          }}
        >
          <div
            className={cn(
              'pointer-events-auto flex flex-col gap-4 px-6 pt-4',
              isDragging ? 'cursor-grabbing' : 'cursor-grab',
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={resetDrag}
            onPointerLeave={isDragging ? resetDrag : undefined}
          >
            <div className="mx-auto h-1.5 w-16 rounded-full bg-neutral-300 dark:bg-neutral-700" />
            <div>
              {title ? (
                <Dialog.Title className="text-base font-semibold text-neutral-900 dark:text-neutral-100">{title}</Dialog.Title>
              ) : null}
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-neutral-600 dark:text-neutral-300">
                  {description}
                </Dialog.Description>
              ) : null}
            </div>
          </div>
          <div className="pointer-events-auto scrollbar-custom max-h-[60vh] overflow-y-auto px-6 pb-6">
            {children}
          </div>
          {footer ? (
            <div className="pointer-events-auto border-t border-neutral-200/50 bg-surface-muted/70 px-6 py-4 dark:border-neutral-700/50 dark:bg-surface-dark/60">
              {footer}
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default BottomSheet;
