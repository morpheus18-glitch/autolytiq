import * as React from 'react';
import { cn } from '../utils/cn.js';
import { Loader2 } from 'lucide-react';

/**
 * LoadingBoundary component
 * Shows loading state while children are loading
 * Supports React Suspense
 */

export interface LoadingBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  isLoading?: boolean;
  delay?: number;
  minDuration?: number;
}

export const LoadingBoundary: React.FC<LoadingBoundaryProps> = ({
  children,
  fallback,
  isLoading = false,
  delay = 0,
  minDuration = 0,
}) => {
  const [shouldShow, setShouldShow] = React.useState(delay === 0);
  const [startTime, setStartTime] = React.useState<number | null>(null);

  React.useEffect(() => {
    if (isLoading) {
      // Record when loading started
      setStartTime(Date.now());

      if (delay > 0) {
        const timer = setTimeout(() => {
          setShouldShow(true);
        }, delay);

        return () => clearTimeout(timer);
      } else {
        setShouldShow(true);
      }
    } else if (startTime && minDuration > 0) {
      // Ensure loading is shown for minimum duration
      const elapsed = Date.now() - startTime;
      const remaining = minDuration - elapsed;

      if (remaining > 0) {
        const timer = setTimeout(() => {
          setShouldShow(false);
          setStartTime(null);
        }, remaining);

        return () => clearTimeout(timer);
      } else {
        setShouldShow(false);
        setStartTime(null);
      }
    } else {
      setShouldShow(false);
      setStartTime(null);
    }
  }, [isLoading, delay, minDuration, startTime]);

  if (isLoading && shouldShow) {
    return <>{fallback || <DefaultLoadingFallback />}</>;
  }

  return <>{children}</>;
};

/**
 * Default loading fallback UI
 */
const DefaultLoadingFallback: React.FC = () => {
  return (
    <div className="flex min-h-[200px] items-center justify-center p-6">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        <p className="text-sm text-gray-600">Loading...</p>
      </div>
    </div>
  );
};

/**
 * Skeleton component
 * Shows a loading placeholder
 */
interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  width?: string | number;
  height?: string | number;
  circle?: boolean;
  count?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className,
  width,
  height,
  circle = false,
  count = 1,
  ...props
}) => {
  const style: React.CSSProperties = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  const skeletons = Array.from({ length: count }, (_, index) => (
    <div
      key={index}
      className={cn(
        'animate-pulse bg-gray-200',
        circle ? 'rounded-full' : 'rounded',
        !height && 'h-4',
        className
      )}
      style={style}
      {...props}
    />
  ));

  return count > 1 ? (
    <div className="flex flex-col gap-2">{skeletons}</div>
  ) : (
    <>{skeletons}</>
  );
};

/**
 * withLoadingBoundary HOC
 * Wraps a component with a LoadingBoundary
 */
export function withLoadingBoundary<P extends object>(
  Component: React.ComponentType<P>,
  loadingBoundaryProps?: Omit<LoadingBoundaryProps, 'children'>
) {
  const Wrapped: React.FC<P> = (props) => (
    <LoadingBoundary {...loadingBoundaryProps}>
      <Component {...props} />
    </LoadingBoundary>
  );

  Wrapped.displayName = `withLoadingBoundary(${Component.displayName || Component.name})`;

  return Wrapped;
}

/**
 * SuspenseBoundary component
 * Combines React Suspense with custom fallback
 */
export interface SuspenseBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const SuspenseBoundary: React.FC<SuspenseBoundaryProps> = ({
  children,
  fallback,
}) => {
  return (
    <React.Suspense fallback={fallback || <DefaultLoadingFallback />}>
      {children}
    </React.Suspense>
  );
};
