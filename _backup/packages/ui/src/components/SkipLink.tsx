import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../utils/cn.js';

/**
 * SkipLink component
 * Allows keyboard users to skip to main content
 * Essential for WCAG compliance
 */

const skipLinkVariants = cva(
  'absolute left-0 top-0 z-[9999] px-4 py-2 font-medium transition-transform duration-200',
  {
    variants: {
      variant: {
        default: 'bg-primary-600 text-white',
        ghost: 'bg-gray-900 text-white',
        outline: 'bg-white text-gray-900 border-2 border-gray-900',
      },
      position: {
        'top-left': 'left-0 top-0',
        'top-center': 'left-1/2 -translate-x-1/2 top-0',
        'top-right': 'right-0 top-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      position: 'top-left',
    },
  }
);

export interface SkipLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>,
    VariantProps<typeof skipLinkVariants> {
  href: string;
  label?: string;
}

export const SkipLink = React.forwardRef<HTMLAnchorElement, SkipLinkProps>(
  ({ className, variant, position, href, label = 'Skip to main content', ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          skipLinkVariants({ variant, position }),
          '-translate-y-full focus:translate-y-0',
          className
        )}
        {...props}
      >
        {label}
      </a>
    );
  }
);

SkipLink.displayName = 'SkipLink';

/**
 * SkipLinks component
 * Container for multiple skip links
 */

export interface SkipLinksProps extends React.HTMLAttributes<HTMLDivElement> {
  links: Array<{ href: string; label: string }>;
  variant?: VariantProps<typeof skipLinkVariants>['variant'];
}

export const SkipLinks: React.FC<SkipLinksProps> = ({
  className,
  links,
  variant = 'default',
  ...props
}) => {
  return (
    <div className={cn('sr-only focus-within:not-sr-only', className)} {...props}>
      {links.map((link, index) => (
        <SkipLink key={index} href={link.href} label={link.label} variant={variant} />
      ))}
    </div>
  );
};

SkipLinks.displayName = 'SkipLinks';
