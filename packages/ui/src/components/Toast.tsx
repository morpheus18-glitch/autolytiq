import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const toastVariants = cva(
  'pointer-events-auto w-full max-w-sm rounded-lg border shadow-lg transition-all duration-300',
  {
    variants: {
      variant: {
        default: 'bg-surface-base border-border-base',
        success: 'bg-status-success/10 border-status-success/20',
        error: 'bg-status-error/10 border-status-error/20',
        warning: 'bg-status-warning/10 border-status-warning/20',
        info: 'bg-accent-info/10 border-accent-info/20',
      },
      position: {
        'top-left': 'top-4 left-4',
        'top-center': 'top-4 left-1/2 -translate-x-1/2',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-4 right-4',
      },
      state: {
        entering: 'animate-in slide-in-from-top-2',
        entered: 'opacity-100',
        exiting: 'animate-out slide-out-to-top-2 opacity-0',
        exited: 'opacity-0 pointer-events-none',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top-right',
      state: 'entered',
    },
  }
);

export interface ToastProps extends VariantProps<typeof toastVariants> {
  id?: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
  showIcon?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

const Toast = ({
  id,
  title,
  description,
  action,
  variant = 'default',
  position = 'top-right',
  duration = 5000,
  onClose,
  showIcon = true,
  showCloseButton = true,
  className,
}: ToastProps) => {
  const [state, setState] = React.useState<'entering' | 'entered' | 'exiting' | 'exited'>(
    'entering'
  );

  React.useEffect(() => {
    // Transition from entering to entered
    const enterTimer = setTimeout(() => setState('entered'), 100);

    // Auto-dismiss after duration
    const dismissTimer = duration
      ? setTimeout(() => {
          setState('exiting');
          setTimeout(() => {
            setState('exited');
            onClose?.();
          }, 300);
        }, duration)
      : undefined;

    return () => {
      clearTimeout(enterTimer);
      if (dismissTimer) clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  const handleClose = () => {
    setState('exiting');
    setTimeout(() => {
      setState('exited');
      onClose?.();
    }, 300);
  };

  const getIcon = () => {
    switch (variant) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-status-success" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-status-error" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-status-warning" />;
      case 'info':
        return <Info className="w-5 h-5 text-accent-info" />;
      default:
        return null;
    }
  };

  if (state === 'exited') return null;

  return (
    <div className={`fixed z-[100] ${toastVariants({ variant, position, state, className })}`}>
      <div className="flex gap-3 p-4">
        {showIcon && getIcon() && (
          <div className="flex-shrink-0 mt-0.5">{getIcon()}</div>
        )}

        <div className="flex-1 min-w-0">
          {title && (
            <div className="text-sm font-semibold text-text-primary">{title}</div>
          )}
          {description && (
            <div className="mt-1 text-sm text-text-secondary">{description}</div>
          )}
          {action && <div className="mt-3">{action}</div>}
        </div>

        {showCloseButton && (
          <button
            onClick={handleClose}
            className="flex-shrink-0 p-1 rounded-md hover:bg-surface-subtle transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-text-secondary" />
          </button>
        )}
      </div>
    </div>
  );
};

Toast.displayName = 'Toast';

// Toast Container and Provider
type ToastType = Omit<ToastProps, 'onClose'> & { id: string };

interface ToastContextValue {
  toasts: ToastType[];
  addToast: (toast: Omit<ToastType, 'id'>) => string;
  removeToast: (id: string) => void;
  removeAllToasts: () => void;
}

const ToastContext = React.createContext<ToastContextValue | undefined>(undefined);

export const useToast = () => {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
};

export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = React.useState<ToastType[]>([]);

  const addToast = (toast: Omit<ToastType, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
    return id;
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const removeAllToasts = () => {
    setToasts([]);
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAllToasts }}>
      {children}
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => removeToast(toast.id)} />
      ))}
    </ToastContext.Provider>
  );
};

export { Toast, toastVariants };
