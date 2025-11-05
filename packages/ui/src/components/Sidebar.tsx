import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';
import { ChevronLeft, ChevronRight } from 'lucide-react';

/**
 * Sidebar component
 * Collapsible navigation sidebar for app layouts
 */

const sidebarVariants = cva(
  'flex flex-col border-r bg-white transition-all duration-300 ease-in-out',
  {
    variants: {
      variant: {
        default: 'border-gray-200',
        dark: 'bg-gray-900 border-gray-800',
        primary: 'bg-primary-50 border-primary-200',
      },
      position: {
        left: 'left-0',
        right: 'right-0 border-l border-r-0',
      },
      size: {
        sm: 'w-48',
        md: 'w-64',
        lg: 'w-80',
        full: 'w-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'left',
      size: 'md',
    },
  }
);

export interface SidebarProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof sidebarVariants> {
  collapsed?: boolean;
  collapsible?: boolean;
  onCollapse?: (collapsed: boolean) => void;
}

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarProps>(
  (
    {
      className,
      variant,
      position,
      size,
      collapsed = false,
      collapsible = false,
      onCollapse,
      children,
      ...props
    },
    ref
  ) => {
    const [isCollapsed, setIsCollapsed] = React.useState(collapsed);

    React.useEffect(() => {
      setIsCollapsed(collapsed);
    }, [collapsed]);

    const handleToggle = () => {
      const newCollapsed = !isCollapsed;
      setIsCollapsed(newCollapsed);
      onCollapse?.(newCollapsed);
    };

    return (
      <div
        ref={ref}
        className={cn(
          sidebarVariants({ variant, position, size }),
          isCollapsed && 'w-16',
          className
        )}
        {...props}
      >
        {children}
        {collapsible && (
          <button
            onClick={handleToggle}
            className={cn(
              'absolute -right-3 top-4 flex h-6 w-6 items-center justify-center rounded-full border bg-white shadow-sm hover:shadow-md transition-shadow',
              variant === 'dark' && 'bg-gray-800 border-gray-700'
            )}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {position === 'left' ? (
              isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )
            ) : isCollapsed ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
      </div>
    );
  }
);

Sidebar.displayName = 'Sidebar';

/**
 * SidebarHeader component
 */
export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-2 p-4 border-b border-gray-200', className)}
      {...props}
    />
  );
});

SidebarHeader.displayName = 'SidebarHeader';

/**
 * SidebarContent component
 */
export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('flex-1 overflow-y-auto overflow-x-hidden p-4', className)}
      {...props}
    />
  );
});

SidebarContent.displayName = 'SidebarContent';

/**
 * SidebarFooter component
 */
export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('mt-auto p-4 border-t border-gray-200', className)}
      {...props}
    />
  );
});

SidebarFooter.displayName = 'SidebarFooter';

/**
 * SidebarNav component
 */
export const SidebarNav = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ className, ...props }, ref) => {
  return <nav ref={ref} className={cn('flex flex-col gap-1', className)} {...props} />;
});

SidebarNav.displayName = 'SidebarNav';

/**
 * SidebarNavItem component
 */
interface SidebarNavItemProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  active?: boolean;
  icon?: React.ReactNode;
}

export const SidebarNavItem = React.forwardRef<HTMLAnchorElement, SidebarNavItemProps>(
  ({ className, active, icon, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        className={cn(
          'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
          active
            ? 'bg-primary-100 text-primary-900'
            : 'text-gray-700 hover:bg-gray-100',
          className
        )}
        {...props}
      >
        {icon && <span className="flex-shrink-0">{icon}</span>}
        <span className="truncate">{children}</span>
      </a>
    );
  }
);

SidebarNavItem.displayName = 'SidebarNavItem';
