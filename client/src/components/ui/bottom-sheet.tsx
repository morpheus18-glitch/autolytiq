import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className
}: BottomSheetProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        data-testid="backdrop-bottom-sheet"
      />

      {/* Sheet */}
      <div
        className={cn(
          "relative w-full md:max-w-2xl bg-white md:rounded-2xl rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        {/* Handle for mobile */}
        <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mt-3 mb-4 md:hidden" />

        {/* Header */}
        {title && (
          <div className="px-6 pb-4 border-b border-gray-200">
            <div className="flex items-start justify-between">
              <h2 className="text-xl font-bold">{title}</h2>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors"
                data-testid="button-close-bottom-sheet"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-6">
          {children}
        </div>
      </div>
    </div>
  );
}
