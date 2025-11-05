import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { ChevronRight, Home } from 'lucide-react';

const breadcrumbVariants = cva('flex items-center flex-wrap gap-1 text-sm', {
  variants: {
    variant: {
      default: '',
      subtle: 'text-text-secondary',
    },
    size: {
      sm: 'text-xs gap-0.5',
      md: 'text-sm gap-1',
      lg: 'text-base gap-2',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const breadcrumbItemVariants = cva('transition-colors', {
  variants: {
    active: {
      true: 'text-text-primary font-medium pointer-events-none',
      false: 'text-text-secondary hover:text-text-primary cursor-pointer',
    },
  },
  defaultVariants: {
    active: false,
  },
});

export interface BreadcrumbItem {
  label: React.ReactNode;
  href?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
}

export interface BreadcrumbProps extends VariantProps<typeof breadcrumbVariants> {
  items: BreadcrumbItem[];
  separator?: React.ReactNode;
  showHomeIcon?: boolean;
  maxItems?: number;
  className?: string;
}

const Breadcrumb = ({
  items,
  separator,
  showHomeIcon = false,
  maxItems,
  variant = 'default',
  size = 'md',
  className,
}: BreadcrumbProps) => {
  const Separator = separator || <ChevronRight className="w-4 h-4 text-text-secondary" />;

  // Collapse items if maxItems is set
  let displayItems = items;
  let hasCollapsed = false;

  if (maxItems && items.length > maxItems) {
    hasCollapsed = true;
    const firstItems = items.slice(0, 1);
    const lastItems = items.slice(items.length - (maxItems - 2));
    displayItems = [...firstItems, { label: '...' }, ...lastItems];
  }

  return (
    <nav aria-label="Breadcrumb" className={breadcrumbVariants({ variant, size, className })}>
      <ol className="flex items-center flex-wrap gap-1">
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCollapsed = item.label === '...';

          return (
            <React.Fragment key={index}>
              <li className="flex items-center gap-1">
                {index === 0 && showHomeIcon && (
                  <Home className="w-4 h-4 mr-1 text-text-secondary" />
                )}

                {isCollapsed ? (
                  <span className="px-1 text-text-secondary">...</span>
                ) : item.href || item.onClick ? (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (item.onClick) {
                        e.preventDefault();
                        item.onClick();
                      }
                    }}
                    className={breadcrumbItemVariants({ active: isLast })}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className="inline-flex mr-1.5">{item.icon}</span>
                    )}
                    {item.label}
                  </a>
                ) : (
                  <span
                    className={breadcrumbItemVariants({ active: isLast })}
                    aria-current={isLast ? 'page' : undefined}
                  >
                    {item.icon && (
                      <span className="inline-flex mr-1.5">{item.icon}</span>
                    )}
                    {item.label}
                  </span>
                )}
              </li>

              {!isLast && (
                <li aria-hidden="true" className="flex items-center">
                  {Separator}
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};

Breadcrumb.displayName = 'Breadcrumb';

export { Breadcrumb, breadcrumbVariants, breadcrumbItemVariants };
