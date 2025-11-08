import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

const tableVariants = cva('w-full caption-bottom text-sm', {
  variants: {
    variant: {
      default: '',
      striped: '[&_tbody_tr:nth-child(odd)]:bg-surface-subtle',
      bordered: 'border border-border-base',
    },
    density: {
      compact: '[&_td]:py-2 [&_th]:py-2',
      normal: '[&_td]:py-3 [&_th]:py-3',
      comfortable: '[&_td]:py-4 [&_th]:py-4',
    },
  },
  defaultVariants: {
    variant: 'default',
    density: 'normal',
  },
});

export interface TableProps
  extends React.TableHTMLAttributes<HTMLTableElement>,
    VariantProps<typeof tableVariants> {}

const Table = React.forwardRef<HTMLTableElement, TableProps>(
  ({ className, variant, density, ...props }, ref) => (
    <div className="relative w-full overflow-auto">
      <table
        ref={ref}
        className={tableVariants({ variant, density, className })}
        {...props}
      />
    </div>
  )
);
Table.displayName = 'Table';

const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <thead
    ref={ref}
    className={`border-b border-border-base ${className || ''}`}
    {...props}
  />
));
TableHeader.displayName = 'TableHeader';

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody ref={ref} className={`[&_tr:last-child]:border-0 ${className || ''}`} {...props} />
));
TableBody.displayName = 'TableBody';

const TableFooter = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tfoot
    ref={ref}
    className={`border-t border-border-base bg-surface-subtle font-medium ${className || ''}`}
    {...props}
  />
));
TableFooter.displayName = 'TableFooter';

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement> & { clickable?: boolean }
>(({ className, clickable, ...props }, ref) => (
  <tr
    ref={ref}
    className={`border-b border-border-base transition-colors ${
      clickable
        ? 'cursor-pointer hover:bg-surface-subtle data-[state=selected]:bg-surface-subtle'
        : 'data-[state=selected]:bg-surface-subtle'
    } ${className || ''}`}
    {...props}
  />
));
TableRow.displayName = 'TableRow';

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement> & { sortable?: boolean }
>(({ className, sortable, children, ...props }, ref) => (
  <th
    ref={ref}
    className={`h-12 px-4 text-left align-middle font-medium text-text-secondary [&:has([role=checkbox])]:pr-0 ${
      sortable ? 'cursor-pointer hover:text-text-primary' : ''
    } ${className || ''}`}
    {...props}
  >
    {sortable ? (
      <div className="flex items-center gap-2">
        {children}
        <span className="text-xs opacity-50">⇅</span>
      </div>
    ) : (
      children
    )}
  </th>
));
TableHead.displayName = 'TableHead';

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={`px-4 align-middle [&:has([role=checkbox])]:pr-0 ${className || ''}`}
    {...props}
  />
));
TableCell.displayName = 'TableCell';

const TableCaption = React.forwardRef<
  HTMLTableCaptionElement,
  React.HTMLAttributes<HTMLTableCaptionElement>
>(({ className, ...props }, ref) => (
  <caption
    ref={ref}
    className={`mt-4 text-sm text-text-secondary ${className || ''}`}
    {...props}
  />
));
TableCaption.displayName = 'TableCaption';

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
  tableVariants,
};
