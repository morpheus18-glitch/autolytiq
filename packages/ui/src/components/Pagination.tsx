import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
} from 'lucide-react';

const paginationVariants = cva('flex items-center gap-1', {
  variants: {
    variant: {
      default: '',
      compact: 'gap-0',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
      lg: 'text-base',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
});

const paginationButtonVariants = cva(
  'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'hover:bg-surface-subtle',
        ghost: 'hover:bg-surface-subtle',
        outline: 'border border-border-base hover:bg-surface-subtle',
      },
      size: {
        sm: 'h-8 w-8 text-xs',
        md: 'h-9 w-9 text-sm',
        lg: 'h-10 w-10 text-base',
      },
      active: {
        true: 'bg-accent-primary text-white hover:bg-accent-primary/90',
        false: 'text-text-primary',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
      active: false,
    },
  }
);

export interface PaginationProps extends VariantProps<typeof paginationVariants> {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  showFirstLast?: boolean;
  showPrevNext?: boolean;
  siblingCount?: number;
  boundaryCount?: number;
  disabled?: boolean;
  className?: string;
  buttonVariant?: 'default' | 'ghost' | 'outline';
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  showFirstLast = true,
  showPrevNext = true,
  siblingCount = 1,
  boundaryCount = 1,
  disabled = false,
  variant = 'default',
  size = 'md',
  buttonVariant = 'default',
  className,
}: PaginationProps) => {
  const getPageNumbers = () => {
    const range = (start: number, end: number) => {
      const length = end - start + 1;
      return Array.from({ length }, (_, i) => start + i);
    };

    const totalNumbers = siblingCount * 2 + 3 + boundaryCount * 2;

    if (totalNumbers >= totalPages) {
      return range(1, totalPages);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
    const rightSiblingIndex = Math.min(
      currentPage + siblingCount,
      totalPages - boundaryCount
    );

    const showLeftDots = leftSiblingIndex > boundaryCount + 2;
    const showRightDots = rightSiblingIndex < totalPages - boundaryCount - 1;

    if (!showLeftDots && showRightDots) {
      const leftItemCount = siblingCount * 2 + boundaryCount + 2;
      return [
        ...range(1, leftItemCount),
        'dots-right',
        ...range(totalPages - boundaryCount + 1, totalPages),
      ];
    }

    if (showLeftDots && !showRightDots) {
      const rightItemCount = siblingCount * 2 + boundaryCount + 2;
      return [
        ...range(1, boundaryCount),
        'dots-left',
        ...range(totalPages - rightItemCount + 1, totalPages),
      ];
    }

    return [
      ...range(1, boundaryCount),
      'dots-left',
      ...range(leftSiblingIndex, rightSiblingIndex),
      'dots-right',
      ...range(totalPages - boundaryCount + 1, totalPages),
    ];
  };

  const pages = getPageNumbers();

  const handlePageClick = (page: number) => {
    if (disabled || page < 1 || page > totalPages || page === currentPage) return;
    onPageChange(page);
  };

  return (
    <nav
      aria-label="Pagination"
      className={paginationVariants({ variant, size, className })}
    >
      {showFirstLast && (
        <button
          onClick={() => handlePageClick(1)}
          disabled={disabled || currentPage === 1}
          className={paginationButtonVariants({ variant: buttonVariant, size })}
          aria-label="Go to first page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>
      )}

      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage - 1)}
          disabled={disabled || currentPage === 1}
          className={paginationButtonVariants({ variant: buttonVariant, size })}
          aria-label="Go to previous page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}

      {pages.map((page, index) => {
        if (page === 'dots-left' || page === 'dots-right') {
          return (
            <span
              key={`dots-${index}`}
              className={paginationButtonVariants({ variant: buttonVariant, size })}
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          );
        }

        const pageNumber = page as number;
        return (
          <button
            key={pageNumber}
            onClick={() => handlePageClick(pageNumber)}
            disabled={disabled}
            className={paginationButtonVariants({
              variant: buttonVariant,
              size,
              active: pageNumber === currentPage,
            })}
            aria-label={`Go to page ${pageNumber}`}
            aria-current={pageNumber === currentPage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        );
      })}

      {showPrevNext && (
        <button
          onClick={() => handlePageClick(currentPage + 1)}
          disabled={disabled || currentPage === totalPages}
          className={paginationButtonVariants({ variant: buttonVariant, size })}
          aria-label="Go to next page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}

      {showFirstLast && (
        <button
          onClick={() => handlePageClick(totalPages)}
          disabled={disabled || currentPage === totalPages}
          className={paginationButtonVariants({ variant: buttonVariant, size })}
          aria-label="Go to last page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      )}
    </nav>
  );
};

Pagination.displayName = 'Pagination';

export { Pagination, paginationVariants, paginationButtonVariants };
