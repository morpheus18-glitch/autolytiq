/**
 * Action Bar (Mobile)
 *
 * Sticky footer with actions: Paste to Chat, Close
 */

import { MessageSquare, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionBarProps {
  /** Callback when "Paste to Chat" is clicked */
  onPasteToChat?: () => void;
  /** Callback when "Close" is clicked */
  onClose: () => void;
  /** Disable paste button */
  disablePaste?: boolean;
  /** Optional custom class name */
  className?: string;
}

export function ActionBar({
  onPasteToChat,
  onClose,
  disablePaste = false,
  className,
}: ActionBarProps) {
  return (
    <div className={cn(
      'fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-50',
      className
    )}>
      <div className="flex items-center gap-3 p-4">
        {/* Paste to Chat Button */}
        {onPasteToChat && (
          <button
            onClick={onPasteToChat}
            disabled={disablePaste}
            className={cn(
              'flex-1 py-3 rounded-lg font-semibold text-sm transition-all shadow-md',
              disablePaste
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700 active:scale-95'
            )}
          >
            <div className="flex items-center justify-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span>Paste to Chat</span>
            </div>
          </button>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          className="px-6 py-3 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm hover:bg-slate-200 transition-all active:scale-95"
        >
          <div className="flex items-center justify-center gap-2">
            <X className="h-4 w-4" />
            <span>Close</span>
          </div>
        </button>
      </div>
    </div>
  );
}
