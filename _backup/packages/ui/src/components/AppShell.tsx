import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

/**
 * AppShell component
 * Complete application layout with header, sidebar, footer, and main content
 */

const appShellVariants = cva('min-h-screen flex flex-col', {
  variants: {
    variant: {
      default: 'bg-gray-50',
      clean: 'bg-white',
      dark: 'bg-gray-900',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AppShellProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appShellVariants> {
  header?: React.ReactNode;
  sidebar?: React.ReactNode;
  footer?: React.ReactNode;
  aside?: React.ReactNode;
  children: React.ReactNode;
}

export const AppShell = React.forwardRef<HTMLDivElement, AppShellProps>(
  ({ className, variant, header, sidebar, footer, aside, children, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(appShellVariants({ variant }), className)} {...props}>
        {header && <div className="flex-shrink-0 z-10">{header}</div>}

        <div className="flex flex-1 overflow-hidden">
          {sidebar && <div className="flex-shrink-0">{sidebar}</div>}

          <main className="flex-1 overflow-y-auto">{children}</main>

          {aside && <div className="flex-shrink-0">{aside}</div>}
        </div>

        {footer && <div className="flex-shrink-0">{footer}</div>}
      </div>
    );
  }
);

AppShell.displayName = 'AppShell';

/**
 * AppHeader component
 */
const appHeaderVariants = cva(
  'flex items-center justify-between border-b bg-white px-4 py-3',
  {
    variants: {
      variant: {
        default: 'border-gray-200',
        dark: 'bg-gray-900 border-gray-800',
        primary: 'bg-primary-600 border-primary-700 text-white',
      },
      sticky: {
        true: 'sticky top-0 z-50',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      sticky: true,
    },
  }
);

export interface AppHeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof appHeaderVariants> {
  logo?: React.ReactNode;
  nav?: React.ReactNode;
  actions?: React.ReactNode;
}

export const AppHeader = React.forwardRef<HTMLElement, AppHeaderProps>(
  ({ className, variant, sticky, logo, nav, actions, children, ...props }, ref) => {
    return (
      <header
        ref={ref}
        className={cn(appHeaderVariants({ variant, sticky }), className)}
        {...props}
      >
        {logo && <div className="flex items-center gap-4">{logo}</div>}
        {nav && <nav className="flex-1 px-4">{nav}</nav>}
        {actions && <div className="flex items-center gap-2">{actions}</div>}
        {children}
      </header>
    );
  }
);

AppHeader.displayName = 'AppHeader';

/**
 * AppFooter component
 */
const appFooterVariants = cva('border-t bg-white px-4 py-6', {
  variants: {
    variant: {
      default: 'border-gray-200 text-gray-600',
      dark: 'bg-gray-900 border-gray-800 text-gray-400',
      minimal: 'border-gray-100 text-gray-500 py-3',
    },
  },
  defaultVariants: {
    variant: 'default',
  },
});

export interface AppFooterProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof appFooterVariants> {}

export const AppFooter = React.forwardRef<HTMLElement, AppFooterProps>(
  ({ className, variant, ...props }, ref) => {
    return (
      <footer
        ref={ref}
        className={cn(appFooterVariants({ variant }), className)}
        {...props}
      />
    );
  }
);

AppFooter.displayName = 'AppFooter';

/**
 * AppMain component
 */
export const AppMain = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn('p-6', className)} {...props} />;
  }
);

AppMain.displayName = 'AppMain';

/**
 * AppAside component
 */
const appAsideVariants = cva('border-l bg-white', {
  variants: {
    variant: {
      default: 'border-gray-200',
      dark: 'bg-gray-900 border-gray-800',
    },
    width: {
      sm: 'w-64',
      md: 'w-80',
      lg: 'w-96',
    },
  },
  defaultVariants: {
    variant: 'default',
    width: 'md',
  },
});

export interface AppAsideProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof appAsideVariants> {}

export const AppAside = React.forwardRef<HTMLDivElement, AppAsideProps>(
  ({ className, variant, width, ...props }, ref) => {
    return (
      <aside
        ref={ref}
        className={cn(appAsideVariants({ variant, width }), className)}
        {...props}
      />
    );
  }
);

AppAside.displayName = 'AppAside';
