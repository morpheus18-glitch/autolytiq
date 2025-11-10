import * as class_variance_authority_types from 'class-variance-authority/types';
import * as React$1 from 'react';
import React__default from 'react';
import { VariantProps } from 'class-variance-authority';
import * as react_jsx_runtime from 'react/jsx-runtime';
import { ClassValue } from 'clsx';

declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "success" | null | undefined;
    size?: "sm" | "md" | "lg" | "icon" | null | undefined;
    fullWidth?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React$1.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}
declare const Button: React$1.ForwardRefExoticComponent<ButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

declare const iconButtonVariants: (props?: ({
    variant?: "outline" | "ghost" | "danger" | "default" | "subtle" | null | undefined;
    size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined;
    shape?: "square" | "rounded" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface IconButtonProps extends React$1.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof iconButtonVariants> {
    icon: React$1.ReactNode;
    loading?: boolean;
    'aria-label': string;
}
declare const IconButton: React$1.ForwardRefExoticComponent<IconButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

declare const inputVariants: (props?: ({
    variant?: "success" | "default" | "error" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface InputProps extends Omit<React$1.InputHTMLAttributes<HTMLInputElement>, 'size'>, VariantProps<typeof inputVariants> {
    error?: boolean;
    success?: boolean;
    leftIcon?: React$1.ReactNode;
    rightIcon?: React$1.ReactNode;
}
declare const Input: React$1.ForwardRefExoticComponent<InputProps & React$1.RefAttributes<HTMLInputElement>>;

declare const selectVariants: (props?: ({
    variant?: "success" | "default" | "error" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};
interface SelectProps extends Omit<React$1.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>, VariantProps<typeof selectVariants> {
    options?: SelectOption[];
    placeholder?: string;
    error?: boolean;
    success?: boolean;
    onValueChange?: (value: string) => void;
}
declare const Select: React$1.ForwardRefExoticComponent<SelectProps & React$1.RefAttributes<HTMLSelectElement>>;

declare const checkboxVariants: (props?: ({
    variant?: "success" | "default" | "error" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CheckboxProps extends Omit<React$1.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>, VariantProps<typeof checkboxVariants> {
    label?: string;
    error?: boolean;
    indeterminate?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
declare const Checkbox: React$1.ForwardRefExoticComponent<CheckboxProps & React$1.RefAttributes<HTMLInputElement>>;

declare const radioVariants: (props?: ({
    variant?: "success" | "default" | "error" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface RadioProps extends Omit<React$1.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>, VariantProps<typeof radioVariants> {
    label?: string;
    error?: boolean;
}
declare const Radio: React$1.ForwardRefExoticComponent<RadioProps & React$1.RefAttributes<HTMLInputElement>>;
interface RadioGroupProps {
    name: string;
    value?: string;
    defaultValue?: string;
    onValueChange?: (value: string) => void;
    children: React$1.ReactNode;
    className?: string;
}
declare const RadioGroup: {
    ({ name, value, defaultValue, onValueChange, children, className, }: RadioGroupProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const RadioGroupItem: React$1.ForwardRefExoticComponent<RadioProps & React$1.RefAttributes<HTMLInputElement>>;

declare const switchVariants: (props?: ({
    variant?: "success" | "default" | "error" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SwitchProps extends Omit<React$1.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>, VariantProps<typeof switchVariants> {
    label?: string;
    error?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
declare const Switch: React$1.ForwardRefExoticComponent<SwitchProps & React$1.RefAttributes<HTMLInputElement>>;

declare const labelVariants: (props?: ({
    variant?: "success" | "default" | "error" | "muted" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    required?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface LabelProps extends React$1.LabelHTMLAttributes<HTMLLabelElement>, VariantProps<typeof labelVariants> {
    error?: boolean;
}
declare const Label: React$1.ForwardRefExoticComponent<LabelProps & React$1.RefAttributes<HTMLLabelElement>>;

declare const formFieldVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const formDescriptionVariants: (props?: ({
    variant?: "success" | "default" | "error" | "info" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface FormFieldProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof formFieldVariants> {
    label?: string;
    description?: string;
    error?: string;
    success?: string;
    required?: boolean;
    htmlFor?: string;
    showIcon?: boolean;
}
declare const FormField: React$1.ForwardRefExoticComponent<FormFieldProps & React$1.RefAttributes<HTMLDivElement>>;

declare const tableVariants: (props?: ({
    variant?: "default" | "striped" | "bordered" | null | undefined;
    density?: "compact" | "normal" | "comfortable" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TableProps extends React$1.TableHTMLAttributes<HTMLTableElement>, VariantProps<typeof tableVariants> {
}
declare const Table: React$1.ForwardRefExoticComponent<TableProps & React$1.RefAttributes<HTMLTableElement>>;
declare const TableHeader: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableSectionElement> & React$1.RefAttributes<HTMLTableSectionElement>>;
declare const TableBody: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableSectionElement> & React$1.RefAttributes<HTMLTableSectionElement>>;
declare const TableFooter: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableSectionElement> & React$1.RefAttributes<HTMLTableSectionElement>>;
declare const TableRow: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableRowElement> & {
    clickable?: boolean;
} & React$1.RefAttributes<HTMLTableRowElement>>;
declare const TableHead: React$1.ForwardRefExoticComponent<React$1.ThHTMLAttributes<HTMLTableCellElement> & {
    sortable?: boolean;
} & React$1.RefAttributes<HTMLTableCellElement>>;
declare const TableCell: React$1.ForwardRefExoticComponent<React$1.TdHTMLAttributes<HTMLTableCellElement> & React$1.RefAttributes<HTMLTableCellElement>>;
declare const TableCaption: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLTableCaptionElement> & React$1.RefAttributes<HTMLTableCaptionElement>>;

declare const cardVariants: (props?: ({
    variant?: "ghost" | "default" | "elevated" | "outlined" | null | undefined;
    interactive?: boolean | null | undefined;
    padding?: "sm" | "md" | "lg" | "none" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CardProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
}
declare const Card: React$1.ForwardRefExoticComponent<CardProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const CardDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;

declare const badgeVariants: (props?: ({
    variant?: "secondary" | "outline" | "success" | "default" | "error" | "info" | "warning" | "solid" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    rounded?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface BadgeProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    icon?: React$1.ReactNode;
    onRemove?: () => void;
}
declare const Badge: React$1.ForwardRefExoticComponent<BadgeProps & React$1.RefAttributes<HTMLDivElement>>;

declare const chipVariants: (props?: ({
    variant?: "primary" | "success" | "default" | "error" | "outlined" | "warning" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    clickable?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ChipProps extends Omit<React$1.HTMLAttributes<HTMLDivElement>, 'onClick'>, VariantProps<typeof chipVariants> {
    label: string;
    avatar?: React$1.ReactNode;
    icon?: React$1.ReactNode;
    onRemove?: () => void;
    onClick?: () => void;
    disabled?: boolean;
}
declare const Chip: React$1.ForwardRefExoticComponent<ChipProps & React$1.RefAttributes<HTMLDivElement>>;
interface ChipGroupProps {
    children: React$1.ReactNode;
    spacing?: 'sm' | 'md' | 'lg';
    wrap?: boolean;
    className?: string;
}
declare const ChipGroup: React$1.FC<ChipGroupProps>;

declare const avatarVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xl" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AvatarProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof avatarVariants> {
    src?: string;
    alt?: string;
    fallback?: string;
}
declare const Avatar: React$1.ForwardRefExoticComponent<AvatarProps & React$1.RefAttributes<HTMLDivElement>>;
declare const AvatarImage: React$1.ForwardRefExoticComponent<React$1.ImgHTMLAttributes<HTMLImageElement> & React$1.RefAttributes<HTMLImageElement>>;
declare const AvatarFallback: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;

declare const tooltipVariants: (props?: ({
    variant?: "success" | "default" | "error" | "info" | "warning" | "light" | null | undefined;
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TooltipProps extends VariantProps<typeof tooltipVariants> {
    content: React$1.ReactNode;
    children: React$1.ReactNode;
    showArrow?: boolean;
    delayDuration?: number;
    disabled?: boolean;
    className?: string;
}
declare const Tooltip: {
    ({ content, children, variant, side, showArrow, delayDuration, disabled, className, }: TooltipProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const alertVariants: (props?: ({
    variant?: "success" | "default" | "error" | "info" | "warning" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AlertProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
    icon?: React$1.ReactNode;
    title?: string;
    action?: React$1.ReactNode;
}
declare const Alert: React$1.ForwardRefExoticComponent<AlertProps & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const AlertDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;

declare const progressVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const progressBarVariants: (props?: ({
    variant?: "success" | "default" | "error" | "warning" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ProgressProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof progressVariants>, VariantProps<typeof progressBarVariants> {
    value: number;
    max?: number;
    showLabel?: boolean;
}
declare const Progress: React$1.ForwardRefExoticComponent<ProgressProps & React$1.RefAttributes<HTMLDivElement>>;

declare const spinnerVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined;
    variant?: "primary" | "secondary" | "success" | "default" | "error" | "warning" | null | undefined;
    speed?: "normal" | "fast" | "slow" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SpinnerProps extends Omit<React$1.HTMLAttributes<HTMLDivElement>, 'children'>, VariantProps<typeof spinnerVariants> {
    label?: string;
    labelPosition?: 'top' | 'bottom' | 'left' | 'right';
}
declare const Spinner: React$1.ForwardRefExoticComponent<SpinnerProps & React$1.RefAttributes<HTMLDivElement>>;

declare const skeletonVariants: (props?: ({
    variant?: "text" | "default" | "circular" | "rectangular" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SkeletonProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
}
declare const Skeleton: React$1.ForwardRefExoticComponent<SkeletonProps & React$1.RefAttributes<HTMLDivElement>>;

declare const dividerVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
    thickness?: "base" | "thin" | "thick" | null | undefined;
    spacing?: "sm" | "md" | "lg" | "none" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface DividerProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof dividerVariants> {
    label?: string;
    labelPosition?: 'left' | 'center' | 'right';
}
declare const Divider: React$1.ForwardRefExoticComponent<DividerProps & React$1.RefAttributes<HTMLDivElement>>;

declare const dotVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xs" | "xl" | null | undefined;
    variant?: "primary" | "success" | "default" | "error" | "info" | "warning" | "gray" | null | undefined;
    pulse?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface DotProps extends Omit<React$1.HTMLAttributes<HTMLDivElement>, 'children'>, VariantProps<typeof dotVariants> {
    label?: string;
    ping?: boolean;
    position?: 'inline' | 'top-right' | 'bottom-right' | 'top-left' | 'bottom-left';
}
declare const Dot: React$1.ForwardRefExoticComponent<DotProps & React$1.RefAttributes<HTMLDivElement>>;
interface DotGroupProps {
    children: React$1.ReactNode;
    orientation?: 'horizontal' | 'vertical';
    spacing?: 'sm' | 'md' | 'lg';
    className?: string;
}
declare const DotGroup: React$1.FC<DotGroupProps>;

declare const kbdVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface KbdProps extends React$1.HTMLAttributes<HTMLElement>, VariantProps<typeof kbdVariants> {
    keys?: string | string[];
    separator?: React$1.ReactNode;
    platform?: 'mac' | 'windows' | 'auto';
}
declare const Kbd: React$1.ForwardRefExoticComponent<KbdProps & React$1.RefAttributes<HTMLElement>>;

/**
 * Menu - Dropdown menu with items and groups
 *
 * Complete menu system with items, sub-menus, separators, and groups.
 *
 * Features:
 * - Menu items with icons and shortcuts
 * - Sub-menus (nested menus)
 * - Item groups with labels
 * - Separators
 * - Disabled items
 * - Checkbox items
 * - Radio groups
 *
 * Perfect for: Context menus, dropdown actions, command palettes
 */

interface MenuItem {
    id: string;
    label: string;
    icon?: React$1.ReactNode;
    shortcut?: string;
    disabled?: boolean;
    onClick?: () => void;
    href?: string;
    type?: 'item' | 'checkbox' | 'radio';
    checked?: boolean;
    subMenu?: MenuItem[];
}
interface MenuGroup {
    label?: string;
    items: MenuItem[];
}
interface MenuProps {
    items?: MenuItem[];
    groups?: MenuGroup[];
    onItemClick?: (item: MenuItem) => void;
    className?: string;
}
declare const Menu: React$1.ForwardRefExoticComponent<MenuProps & React$1.RefAttributes<HTMLDivElement>>;
declare const MenuSeparator: React$1.FC<{
    className?: string;
}>;

interface TabsProps extends React$1.HTMLAttributes<HTMLDivElement> {
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
}
declare const Tabs: React$1.ForwardRefExoticComponent<TabsProps & React$1.RefAttributes<HTMLDivElement>>;
interface TabsListProps extends React$1.HTMLAttributes<HTMLDivElement> {
}
declare const TabsList: React$1.ForwardRefExoticComponent<TabsListProps & React$1.RefAttributes<HTMLDivElement>>;
interface TabsTriggerProps extends React$1.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string;
}
declare const TabsTrigger: React$1.ForwardRefExoticComponent<TabsTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
interface TabsContentProps extends React$1.HTMLAttributes<HTMLDivElement> {
    value: string;
}
declare const TabsContent: React$1.ForwardRefExoticComponent<TabsContentProps & React$1.RefAttributes<HTMLDivElement>>;

declare const sheetOverlayVariants: (props?: ({
    state?: "open" | "closed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const sheetContentVariants: (props?: ({
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
    state?: "open" | "closed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SheetProps extends VariantProps<typeof sheetContentVariants> {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    title?: React$1.ReactNode;
    description?: React$1.ReactNode;
    children: React$1.ReactNode;
    footer?: React$1.ReactNode;
    showCloseButton?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
    className?: string;
}
declare const Sheet: {
    ({ open, onOpenChange, title, description, children, footer, side, showCloseButton, closeOnOverlayClick, closeOnEscape, className, }: SheetProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const SheetPortal: ({ children }: {
    children: React$1.ReactNode;
}) => react_jsx_runtime.JSX.Element;
declare const SheetOverlay: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & {
    state?: "open" | "closed";
} & React$1.RefAttributes<HTMLDivElement>>;
declare const SheetContent: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & VariantProps<(props?: ({
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
    state?: "open" | "closed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string> & React$1.RefAttributes<HTMLDivElement>>;
declare const SheetHeader: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const SheetFooter: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const SheetTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const SheetDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const SheetTrigger: React$1.ForwardRefExoticComponent<React$1.ButtonHTMLAttributes<HTMLButtonElement> & React$1.RefAttributes<HTMLButtonElement>>;
declare const SheetClose: React$1.ForwardRefExoticComponent<React$1.ButtonHTMLAttributes<HTMLButtonElement> & React$1.RefAttributes<HTMLButtonElement>>;

/**
 * SwipeableCard Component
 * Card with swipe-to-action functionality
 * Shows action buttons on left/right swipe
 */

interface SwipeAction {
    label: string;
    icon?: React$1.ReactNode;
    color?: 'primary' | 'success' | 'danger' | 'warn';
    onClick: () => void;
}
interface SwipeableCardProps {
    children: React$1.ReactNode;
    leftAction?: SwipeAction;
    rightAction?: SwipeAction;
    className?: string;
    disabled?: boolean;
}
declare const SwipeableCard: React$1.ForwardRefExoticComponent<SwipeableCardProps & React$1.RefAttributes<HTMLDivElement>>;

/**
 * PullToRefresh Component
 * Wrapper component that adds pull-to-refresh functionality
 * Shows animated spinner while refreshing
 */

interface PullToRefreshProps {
    children: React$1.ReactNode;
    onRefresh: () => Promise<void>;
    threshold?: number;
    className?: string;
    disabled?: boolean;
}
declare const PullToRefresh: React$1.ForwardRefExoticComponent<PullToRefreshProps & React$1.RefAttributes<HTMLDivElement>>;

type SortDirection = 'asc' | 'desc' | null;
interface DataTableColumn<T = any> {
    id: string;
    header: string | React$1.ReactNode;
    accessorKey?: keyof T;
    accessorFn?: (row: T) => any;
    cell?: (info: {
        row: T;
        value: any;
        rowIndex: number;
    }) => React$1.ReactNode;
    sortable?: boolean;
    filterable?: boolean;
    width?: number | string;
    minWidth?: number;
    maxWidth?: number;
    align?: 'left' | 'center' | 'right';
    footer?: React$1.ReactNode;
}
interface DataTableSort {
    columnId: string;
    direction: SortDirection;
}
interface DataTableFilter {
    columnId: string;
    value: any;
    operator?: 'equals' | 'contains' | 'gt' | 'lt' | 'between';
}
interface DataTableState {
    sorting: DataTableSort[];
    filters: DataTableFilter[];
    selectedRows: Set<string | number>;
    pagination: {
        pageIndex: number;
        pageSize: number;
    };
}
declare const dataTableVariants: (props?: ({
    variant?: "default" | "bordered" | "minimal" | null | undefined;
    density?: "compact" | "normal" | "comfortable" | null | undefined;
    striped?: boolean | null | undefined;
    hoverable?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface DataTableProps<T = any> extends Omit<React$1.HTMLAttributes<HTMLTableElement>, 'children'>, VariantProps<typeof dataTableVariants> {
    columns: DataTableColumn<T>[];
    data: T[];
    getRowId?: (row: T, index: number) => string | number;
    state?: Partial<DataTableState>;
    onStateChange?: (state: DataTableState) => void;
    enableSorting?: boolean;
    enableFiltering?: boolean;
    enableRowSelection?: boolean;
    enableMultiRowSelection?: boolean;
    enablePagination?: boolean;
    enableVirtualization?: boolean;
    onRowClick?: (row: T, index: number) => void;
    onRowSelect?: (selectedRows: Set<string | number>) => void;
    onSort?: (sorting: DataTableSort[]) => void;
    onFilter?: (filters: DataTableFilter[]) => void;
    loading?: boolean;
    loadingRows?: number;
    emptyMessage?: React$1.ReactNode;
    pageSize?: number;
    pageIndex?: number;
    totalRows?: number;
    stickyHeader?: boolean;
    maxHeight?: string;
}
declare const DataTable: {
    <T extends Record<string, any>>({ columns, data, getRowId, state: externalState, onStateChange, enableSorting, enableFiltering, enableRowSelection, enableMultiRowSelection, enablePagination, enableVirtualization, onRowClick, onRowSelect, onSort, onFilter, loading, loadingRows, emptyMessage, pageSize: externalPageSize, pageIndex: externalPageIndex, totalRows, stickyHeader, maxHeight, variant, density, striped, hoverable, className, ...props }: DataTableProps<T>): react_jsx_runtime.JSX.Element;
    displayName: string;
};

/**
 * QueryBuilder - Visual query builder for complex data filtering
 *
 * Features:
 * - Visual AND/OR logic builder
 * - Field selection with type awareness
 * - Operator selection (equals, contains, gt, lt, between, in, etc.)
 * - Value input with type validation
 * - Nested condition groups
 * - Export to SQL/JSON
 * - Query templates
 *
 * Perfect for: Financial reports, CRM filters, inventory search
 */

type FieldType = 'string' | 'number' | 'date' | 'boolean' | 'select' | 'multi-select';
interface QueryField {
    id: string;
    label: string;
    type: FieldType;
    options?: {
        label: string;
        value: any;
    }[];
    placeholder?: string;
}
type OperatorType = 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'starts_with' | 'ends_with' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in' | 'not_in' | 'is_null' | 'is_not_null';
interface QueryCondition {
    id: string;
    field: string;
    operator: OperatorType;
    value: any;
}
interface QueryGroup {
    id: string;
    combinator: 'AND' | 'OR';
    conditions: QueryCondition[];
    groups: QueryGroup[];
}
interface Query {
    root: QueryGroup;
}
interface QueryBuilderProps {
    fields: QueryField[];
    query?: Query;
    onChange?: (query: Query) => void;
    maxDepth?: number;
    className?: string;
}
declare const QueryBuilder: React$1.FC<QueryBuilderProps>;
declare const queryToSQL: (query: Query, tableName: string) => string;
declare const queryToJSON: (query: Query) => string;

type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';
interface LiveMessage<T = any> {
    id: string;
    timestamp: Date;
    type?: string;
    data: T;
    priority?: 'low' | 'normal' | 'high' | 'critical';
}
interface LiveDataFeedProps<T = any> {
    url?: string;
    onConnect?: () => void;
    onDisconnect?: () => void;
    onMessage?: (message: LiveMessage<T>) => void;
    onError?: (error: Error) => void;
    messages?: LiveMessage<T>[];
    renderMessage: (message: LiveMessage<T>, index: number) => React$1.ReactNode;
    maxMessages?: number;
    autoScroll?: boolean;
    showTimestamps?: boolean;
    showTypes?: boolean;
    groupByType?: boolean;
    allowFilter?: boolean;
    filterPlaceholder?: string;
    filterFn?: (message: LiveMessage<T>, filterText: string) => boolean;
    allowPause?: boolean;
    allowExport?: boolean;
    exportFilename?: string;
    height?: string;
    emptyMessage?: React$1.ReactNode;
    className?: string;
}
declare const LiveDataFeed: {
    <T extends unknown>({ url, onConnect, onDisconnect, onMessage, onError, messages: externalMessages, renderMessage, maxMessages, autoScroll, showTimestamps, showTypes, groupByType, allowFilter, filterPlaceholder, filterFn, allowPause, allowExport, exportFilename, height, emptyMessage, className, }: LiveDataFeedProps<T>): react_jsx_runtime.JSX.Element;
    displayName: string;
};

/**
 * PivotTable - Excel-like pivot table for financial data aggregation
 *
 * Features:
 * - Drag & drop rows/columns/values
 * - Multiple aggregation functions (sum, avg, count, min, max)
 * - Subtotals and grand totals
 * - Expand/collapse row groups
 * - Export to CSV/Excel
 * - Conditional formatting
 * - Drill-down to detail view
 *
 * Perfect for: Financial reports, sales analysis, inventory summaries
 */
type AggregationFunction = 'sum' | 'avg' | 'count' | 'min' | 'max' | 'first' | 'last';
interface PivotField {
    id: string;
    label: string;
    dataType?: 'string' | 'number' | 'date' | 'boolean';
    format?: (value: any) => string;
}
interface PivotValueField extends PivotField {
    aggregation: AggregationFunction;
}
interface PivotConfig {
    rows: PivotField[];
    columns: PivotField[];
    values: PivotValueField[];
    filters?: Record<string, any>;
}
interface PivotCell {
    rowPath: string[];
    columnPath: string[];
    value: number;
    count: number;
    rawValues?: any[];
}
interface PivotRow {
    path: string[];
    label: string;
    level: number;
    isExpanded: boolean;
    isSubtotal: boolean;
    isGrandTotal: boolean;
    cells: Record<string, PivotCell>;
}
interface PivotTableProps<T extends Record<string, any>> {
    data: T[];
    config: PivotConfig;
    onConfigChange?: (config: PivotConfig) => void;
    onCellClick?: (cell: PivotCell) => void;
    onExport?: (format: 'csv' | 'excel') => void;
    showSubtotals?: boolean;
    showGrandTotals?: boolean;
    className?: string;
}
declare const PivotTable: {
    <T extends Record<string, any>>({ data, config, onConfigChange, onCellClick, onExport, showSubtotals, showGrandTotals, className, }: PivotTableProps<T>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const exportPivotToCSV: (pivot: {
    rows: PivotRow[];
}, config: PivotConfig) => string;

type TrendDirection = 'up' | 'down' | 'flat';
type MetricStatus = 'success' | 'warning' | 'error' | 'neutral';
interface AggregateMetric {
    label: string;
    value: number | string;
    format?: (value: number | string) => string;
    unit?: string;
    decimals?: number;
}
interface TrendData {
    direction: TrendDirection;
    value: number;
    label?: string;
}
interface ComparisonData {
    label: string;
    current: number;
    previous: number;
    format?: (value: number) => string;
}
declare const aggregateCardVariants: (props?: ({
    variant?: "success" | "default" | "error" | "warning" | "accent" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    interactive?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AggregateCardProps extends Omit<React$1.HTMLAttributes<HTMLDivElement>, 'onClick'>, VariantProps<typeof aggregateCardVariants> {
    metric: AggregateMetric;
    trend?: TrendData;
    comparison?: ComparisonData;
    sparklineData?: number[];
    icon?: React$1.ReactNode;
    status?: MetricStatus;
    description?: string;
    tooltip?: string;
    loading?: boolean;
    onClick?: () => void;
}
declare const AggregateCard: React$1.ForwardRefExoticComponent<AggregateCardProps & React$1.RefAttributes<HTMLDivElement>>;
interface AggregateCardGridProps {
    children: React$1.ReactNode;
    columns?: 1 | 2 | 3 | 4 | 6;
    gap?: 2 | 4 | 6 | 8;
    className?: string;
}
declare const AggregateCardGrid: React$1.FC<AggregateCardGridProps>;
declare const calculateTrend: (current: number, previous: number) => TrendData;
declare const aggregateData: <T extends Record<string, any>>(data: T[], field: keyof T, aggregation: "sum" | "avg" | "count" | "min" | "max") => number;

/**
 * FilterPanel - Advanced multi-field filtering sidebar
 *
 * Features:
 * - Multiple filter types (text, number, date, select, range)
 * - Saved filter presets
 * - Active filter badges
 * - Clear all filters
 * - Export/import filter state
 * - Filter summary
 *
 * Perfect for: Data tables, reports, search interfaces
 */

type FilterType = 'text' | 'number' | 'date' | 'select' | 'multiselect' | 'range' | 'boolean';
interface FilterField {
    id: string;
    label: string;
    type: FilterType;
    options?: {
        label: string;
        value: any;
    }[];
    placeholder?: string;
    min?: number;
    max?: number;
    step?: number;
}
interface FilterValue {
    fieldId: string;
    value: any;
    operator?: 'equals' | 'contains' | 'gt' | 'gte' | 'lt' | 'lte' | 'between' | 'in';
}
interface FilterPreset {
    id: string;
    name: string;
    filters: FilterValue[];
    isDefault?: boolean;
}
interface FilterState {
    activeFilters: FilterValue[];
    activePreset?: string;
}
interface FilterPanelProps {
    fields: FilterField[];
    state?: FilterState;
    onChange?: (state: FilterState) => void;
    presets?: FilterPreset[];
    onSavePreset?: (name: string, filters: FilterValue[]) => void;
    onLoadPreset?: (preset: FilterPreset) => void;
    onExport?: () => void;
    onImport?: (filters: FilterValue[]) => void;
    showPresets?: boolean;
    showExport?: boolean;
    collapsible?: boolean;
    defaultExpanded?: boolean;
    className?: string;
}
declare const FilterPanel: React$1.FC<FilterPanelProps>;
declare const applyFilters: <T extends Record<string, any>>(data: T[], filters: FilterValue[]) => T[];
declare const exportFilters: (filters: FilterValue[]) => string;
declare const importFilters: (json: string) => FilterValue[];

type ExportFormat = 'csv' | 'excel' | 'json' | 'pdf';
interface ExportColumn<T = any> {
    id: string;
    label: string;
    accessor: keyof T | ((row: T) => any);
    format?: (value: any, row: T) => string;
}
interface ExportOptions {
    filename?: string;
    format: ExportFormat;
    columns?: string[];
    includeHeaders?: boolean;
    dateFormat?: string;
}
interface DataExporterProps<T extends Record<string, any>> {
    data: T[];
    columns: ExportColumn<T>[];
    filename?: string;
    formats?: ExportFormat[];
    defaultFormat?: ExportFormat;
    onExport?: (format: ExportFormat, options: ExportOptions) => void;
    renderTrigger?: (props: {
        onClick: () => void;
        loading: boolean;
    }) => React$1.ReactNode;
    className?: string;
}
declare const DataExporter: {
    <T extends Record<string, any>>({ data, columns, filename, formats, defaultFormat, onExport, renderTrigger, className, }: DataExporterProps<T>): string | number | boolean | Iterable<React$1.ReactNode> | react_jsx_runtime.JSX.Element | null | undefined;
    displayName: string;
};

/**
 * DealJacket - Digital Deal Jacket with Document Management
 *
 * The complete digital deal folder containing all documents,
 * forms, signatures, and state tracking for an automotive deal.
 *
 * Features:
 * - Document upload/download/preview
 * - E-signature integration
 * - State machine workflow (draft → submitted → approved → funded)
 * - Required document checklist
 * - Compliance verification
 * - Audit trail
 * - Print-ready packet generation
 *
 * Perfect for: F&I, Deal desking, Compliance, Archiving
 */

type DealJacketStatus = 'draft' | 'pending_signatures' | 'submitted' | 'in_review' | 'approved' | 'funded' | 'rejected' | 'cancelled';
type DocumentType = 'buyers_order' | 'credit_app' | 'drivers_license' | 'insurance_card' | 'trade_title' | 'trade_payoff' | 'finance_contract' | 'warranty_contract' | 'aftermarket_contract' | 'odometer_disclosure' | 'title_application' | 'registration_docs' | 'other';
type DocumentStatus = 'pending' | 'uploaded' | 'signed' | 'verified' | 'rejected';
interface DealDocument {
    id: string;
    type: DocumentType;
    label: string;
    required: boolean;
    status: DocumentStatus;
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    uploadedBy?: string;
    uploadedAt?: Date;
    signedBy?: string[];
    signedAt?: Date;
    verifiedBy?: string;
    verifiedAt?: Date;
    rejectionReason?: string;
    version?: number;
}
interface DealJacketData {
    dealId: string;
    dealNumber: string;
    customerName: string;
    vehicleDescription: string;
    status: DealJacketStatus;
    createdAt: Date;
    updatedAt: Date;
    documents: DealDocument[];
    signatures: {
        customer: boolean;
        cobuyer?: boolean;
        salesPerson: boolean;
        manager: boolean;
        fiManager?: boolean;
    };
    complianceChecks: {
        id: string;
        label: string;
        status: 'pending' | 'passed' | 'failed';
        message?: string;
    }[];
    auditTrail: {
        id: string;
        timestamp: Date;
        user: string;
        action: string;
        details?: string;
    }[];
}
interface DealJacketProps {
    data: DealJacketData;
    onDocumentUpload?: (docType: DocumentType, file: File) => Promise<void>;
    onDocumentDownload?: (document: DealDocument) => void;
    onDocumentPreview?: (document: DealDocument) => void;
    onDocumentDelete?: (documentId: string) => void;
    onSignatureRequest?: (signers: string[]) => void;
    onStatusChange?: (newStatus: DealJacketStatus) => void;
    onPrintPacket?: () => void;
    readOnly?: boolean;
    className?: string;
}
declare const DealJacket: React$1.FC<DealJacketProps>;
declare const getRequiredDocumentsForDealType: (dealType: "cash" | "finance" | "lease") => DocumentType[];
declare const calculateDocumentCompletionScore: (documents: DealDocument[]) => number;

/**
 * DealWorkspace - Complete Deal Management Workspace
 *
 * Unified workspace combining:
 * - Deal Jacket (documents)
 * - Deal State Machine
 * - Timeline/Activity
 * - Notes & Communications
 * - AI Recommendations
 *
 * Features:
 * - State-aware interface (adapts to current deal stage)
 * - Contextual actions based on state
 * - Integrated document management
 * - Real-time collaboration
 * - Activity timeline
 * - Quick actions sidebar
 *
 * Perfect for: Deal Desking, F&I workflow, Manager review
 */

type DealStage = 'lead' | 'qualified' | 'appointment' | 'showroom' | 'test_drive' | 'negotiation' | 'pending_approval' | 'approved' | 'finance' | 'contracted' | 'delivered' | 'lost';
interface DealStateTransition {
    from: DealStage;
    to: DealStage;
    action: string;
    requiredPermission?: string;
    requiredDocuments?: string[];
    validations?: {
        field: string;
        message: string;
        validator: (deal: DealWorkspaceData) => boolean;
    }[];
}
interface DealActivity {
    id: string;
    timestamp: Date;
    user: string;
    userRole: string;
    type: 'status_change' | 'document' | 'note' | 'communication' | 'ai_action' | 'approval';
    title: string;
    description?: string;
    metadata?: Record<string, any>;
}
interface DealWorkspaceData {
    dealId: string;
    dealNumber: string;
    stage: DealStage;
    status: 'active' | 'paused' | 'on_hold' | 'cancelled';
    customer: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        creditScore?: number;
    };
    cobuyer?: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
    };
    vehicle: {
        id: string;
        vin: string;
        year: number;
        make: string;
        model: string;
        trim?: string;
        stock: string;
        cost: number;
        price: number;
    };
    tradeIn?: {
        vin: string;
        year: number;
        make: string;
        model: string;
        mileage: number;
        condition: string;
        estimatedValue: number;
        payoffAmount?: number;
    };
    structure?: {
        salePrice: number;
        downPayment: number;
        tradeAllowance?: number;
        amountFinanced: number;
        term: number;
        rate: number;
        monthlyPayment: number;
    };
    metrics: {
        grossProfit: number;
        frontEndProfit: number;
        backEndProfit: number;
        totalProfit: number;
        approvalProbability?: number;
        closeProbability?: number;
    };
    createdAt: Date;
    updatedAt: Date;
    stageEnteredAt: Date;
    timeInStage: number;
    assignedTo: {
        salesperson?: string;
        manager?: string;
        fiManager?: string;
    };
    activities: DealActivity[];
    stats: {
        documentsComplete: number;
        documentsTotal: number;
        signaturesComplete: number;
        signaturesTotal: number;
        tasksComplete: number;
        tasksTotal: number;
    };
}
declare const DEAL_TRANSITIONS: DealStateTransition[];
interface DealWorkspaceProps {
    data: DealWorkspaceData;
    onStageChange?: (newStage: DealStage) => Promise<void>;
    onStatusChange?: (newStatus: 'active' | 'paused' | 'on_hold' | 'cancelled') => void;
    onActivityAdd?: (activity: Omit<DealActivity, 'id' | 'timestamp'>) => void;
    onDocumentAction?: (action: 'upload' | 'view' | 'sign') => void;
    readOnly?: boolean;
    className?: string;
}
declare const DealWorkspace: React$1.FC<DealWorkspaceProps>;
declare const canTransition: (from: DealStage, to: DealStage, userPermissions: string[]) => boolean;
declare const getStageProgress: (stage: DealStage) => number;

/**
 * RoleDashboard - Role-Based Intuitive State Dashboard
 *
 * Intelligent dashboard system that adapts to user role and current state.
 * Shows the right information at the right time based on:
 * - User role (Salesperson, Manager, F&I, GM, Admin)
 * - Current deal state
 * - Active priorities
 * - Time-sensitive actions
 *
 * Features:
 * - Role-specific layouts and widgets
 * - State-aware content (what you need NOW)
 * - Priority-based action lists
 * - Real-time updates
 * - Customizable widget grid
 * - Saved dashboard presets
 *
 * Perfect for: Daily operations, Manager oversight, Executive reporting
 */

type UserRole = 'salesperson' | 'sales_manager' | 'fi_manager' | 'gm' | 'admin' | 'inventory_manager' | 'bdc_agent';
type WidgetType = 'active_deals' | 'hot_leads' | 'appointments_today' | 'pending_approvals' | 'revenue_today' | 'revenue_month' | 'conversion_rate' | 'inventory_alerts' | 'aged_inventory' | 'pending_deliveries' | 'finance_pending' | 'credit_approvals' | 'profitability' | 'team_performance' | 'ai_insights' | 'tasks' | 'recent_activity' | 'sales_funnel';
type WidgetSize = 'sm' | 'md' | 'lg' | 'xl';
type Priority = 'critical' | 'high' | 'normal' | 'low';
interface WidgetData {
    id: string;
    type: WidgetType;
    title: string;
    value: number | string;
    subtitle?: string;
    trend?: {
        direction: 'up' | 'down' | 'flat';
        value: number;
        label?: string;
    };
    priority?: Priority;
    actionLabel?: string;
    onAction?: () => void;
    metadata?: Record<string, any>;
}
interface DashboardWidget {
    id: string;
    type: WidgetType;
    size: WidgetSize;
    position: {
        row: number;
        col: number;
    };
    data?: WidgetData;
    visible: boolean;
}
interface DashboardPreset {
    id: string;
    name: string;
    role: UserRole;
    widgets: Omit<DashboardWidget, 'data'>[];
    isDefault?: boolean;
}
interface DealState {
    id: string;
    status: 'lead' | 'in_showroom' | 'test_drive' | 'negotiation' | 'pending_approval' | 'approved' | 'pending_fi' | 'contracted' | 'delivered';
    customerName: string;
    vehicleDescription: string;
    priority: Priority;
    urgencyScore: number;
    nextAction: string;
    timeInState: number;
    assignedTo?: string;
}
interface StateAwareContext {
    activeDeals: DealState[];
    urgentActions: {
        id: string;
        type: 'approval' | 'signature' | 'document' | 'follow_up' | 'appointment';
        description: string;
        deadline?: Date;
        priority: Priority;
        onClick?: () => void;
    }[];
    metrics: {
        revenue: {
            today: number;
            month: number;
            goal: number;
        };
        deals: {
            active: number;
            closed: number;
            goal: number;
        };
        leads: {
            hot: number;
            total: number;
        };
    };
}
declare const DASHBOARD_PRESETS: Record<UserRole, DashboardPreset>;
interface RoleDashboardProps {
    role: UserRole;
    context: StateAwareContext;
    preset?: DashboardPreset;
    onWidgetAction?: (widgetId: string, action: string) => void;
    onCustomize?: () => void;
    onPresetChange?: (preset: DashboardPreset) => void;
    editable?: boolean;
    className?: string;
}
declare const RoleDashboard: React$1.FC<RoleDashboardProps>;
declare const calculateUrgencyScore: (deal: DealState) => number;
declare const getRecommendedWidgetsForRole: (role: UserRole) => WidgetType[];

interface ListDetailLayoutProps {
    /** List panel content */
    list: React__default.ReactNode;
    /** Detail panel content */
    detail?: React__default.ReactNode;
    /** Whether detail is currently shown (mobile) */
    showDetail?: boolean;
    /** Callback when back button clicked (mobile) */
    onBack?: () => void;
    /** List panel width (default: 'md' = 384px) */
    listWidth?: 'sm' | 'md' | 'lg';
    /** Custom className */
    className?: string;
}
declare function ListDetailLayout({ list, detail, showDetail, onBack, listWidth, className, }: ListDetailLayoutProps): react_jsx_runtime.JSX.Element;
declare namespace ListDetailLayout {
    var displayName: string;
}

interface FullDensityLayoutProps {
    /** Main content (DataTable, Calendar, etc.) */
    children: React__default.ReactNode;
    /** Optional toolbar above content */
    toolbar?: React__default.ReactNode;
    /** Mobile summary cards (replaces main content on mobile) */
    mobileSummary?: React__default.ReactNode;
    /** Max width constraint (default: none) */
    maxWidth?: 'lg' | 'xl' | '2xl' | 'full';
    /** Padding (default: 'md') */
    padding?: 'none' | 'sm' | 'md' | 'lg';
    /** Custom className */
    className?: string;
}
declare function FullDensityLayout({ children, toolbar, mobileSummary, maxWidth, padding, className, }: FullDensityLayoutProps): react_jsx_runtime.JSX.Element;
declare namespace FullDensityLayout {
    var displayName: string;
}

interface FocusStudioLayoutProps {
    /** Left panel: Context/Dossier */
    left: React__default.ReactNode;
    /** Center panel: Main workspace */
    center: React__default.ReactNode;
    /** Right panel: Assistant/AI */
    right: React__default.ReactNode;
    /** Mobile header */
    mobileHeader?: React__default.ReactNode;
    /** On close (mobile) */
    onClose?: () => void;
    /** Custom className */
    className?: string;
}
declare function FocusStudioLayout({ left, center, right, mobileHeader, onClose, className, }: FocusStudioLayoutProps): react_jsx_runtime.JSX.Element;
declare namespace FocusStudioLayout {
    var displayName: string;
}

declare const boxVariants: (props?: ({
    display?: "none" | "grid" | "inline" | "flex" | "block" | "inline-block" | "inline-flex" | "inline-grid" | null | undefined;
    position?: "fixed" | "absolute" | "relative" | "static" | "sticky" | null | undefined;
    padding?: "sm" | "md" | "lg" | "none" | "xs" | "xl" | "2xl" | null | undefined;
    margin?: "sm" | "md" | "lg" | "none" | "xs" | "xl" | "auto" | "2xl" | null | undefined;
    width?: "max" | "min" | "auto" | "full" | "screen" | "fit" | null | undefined;
    height?: "max" | "min" | "auto" | "full" | "screen" | "fit" | null | undefined;
    overflow?: "hidden" | "auto" | "scroll" | "visible" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface BoxProps extends React$1.HTMLAttributes<HTMLElement>, VariantProps<typeof boxVariants> {
    /**
     * HTML element to render
     */
    as?: 'div' | 'section' | 'article' | 'main' | 'aside' | 'nav' | 'header' | 'footer';
    /**
     * Children elements
     */
    children?: React$1.ReactNode;
}
/**
 * Box Component
 *
 * Universal container with controlled variants for display, position, spacing.
 *
 * @example
 * <Box padding="md" margin="auto" width="full">
 *   <p>Content</p>
 * </Box>
 */
declare const Box: React$1.ForwardRefExoticComponent<BoxProps & React$1.RefAttributes<HTMLElement>>;

declare const stackVariants: (props?: ({
    gap?: "sm" | "md" | "lg" | "none" | "xs" | "xl" | "2xl" | null | undefined;
    align?: "end" | "center" | "baseline" | "start" | "stretch" | null | undefined;
    justify?: "end" | "center" | "between" | "start" | "around" | "evenly" | null | undefined;
    width?: "auto" | "full" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface StackProps extends React$1.HTMLAttributes<HTMLElement>, VariantProps<typeof stackVariants> {
    /**
     * HTML element to render
     */
    as?: 'div' | 'section' | 'article' | 'ul' | 'ol';
    /**
     * Children elements
     */
    children: React$1.ReactNode;
}
/**
 * Stack Component
 *
 * Flexbox container for vertical layouts with consistent spacing.
 *
 * @example
 * <Stack gap="lg" align="center">
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </Stack>
 */
declare const Stack: React$1.ForwardRefExoticComponent<StackProps & React$1.RefAttributes<HTMLElement>>;

declare const inlineVariants: (props?: ({
    gap?: "sm" | "md" | "lg" | "none" | "xs" | "xl" | "2xl" | null | undefined;
    align?: "end" | "center" | "baseline" | "start" | "stretch" | null | undefined;
    justify?: "end" | "center" | "between" | "start" | "around" | "evenly" | null | undefined;
    wrap?: "wrap" | "nowrap" | "wrap-reverse" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface InlineProps extends React$1.HTMLAttributes<HTMLElement>, VariantProps<typeof inlineVariants> {
    /**
     * HTML element to render
     */
    as?: 'div' | 'span' | 'nav' | 'ul';
    /**
     * Children elements
     */
    children: React$1.ReactNode;
}
/**
 * Inline Component
 *
 * Flexbox container for horizontal layouts with consistent spacing.
 *
 * @example
 * <Inline gap="sm" align="center" justify="between">
 *   <Button>Left</Button>
 *   <Button>Right</Button>
 * </Inline>
 */
declare const Inline: React$1.ForwardRefExoticComponent<InlineProps & React$1.RefAttributes<HTMLElement>>;

declare const surfaceVariants: (props?: ({
    variant?: "subtle" | "base" | "muted" | "info" | "elevated" | "transparent" | "ok" | "caution" | "risk" | null | undefined;
    elevation?: "sm" | "md" | "lg" | "none" | "xl" | null | undefined;
    border?: "none" | "default" | "strong" | null | undefined;
    padding?: "sm" | "md" | "lg" | "none" | "xs" | "xl" | "2xl" | null | undefined;
    radius?: "sm" | "md" | "lg" | "none" | "xl" | "full" | null | undefined;
    interactive?: "none" | "hover" | "press" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SurfaceProps extends React$1.HTMLAttributes<HTMLElement>, VariantProps<typeof surfaceVariants> {
    /**
     * HTML element to render
     */
    as?: 'div' | 'section' | 'article' | 'aside';
    /**
     * Children elements
     */
    children: React$1.ReactNode;
}
/**
 * Surface Component
 *
 * Elevated container with controlled background, shadow, border, and padding.
 * Use as the foundation for card patterns.
 *
 * @example
 * <Surface elevation="md" padding="lg" interactive="hover">
 *   <Text>Card content</Text>
 * </Surface>
 */
declare const Surface: React$1.ForwardRefExoticComponent<SurfaceProps & React$1.RefAttributes<HTMLElement>>;

declare const textVariants: (props?: ({
    variant?: "display" | "body" | "caption" | "h1" | "h2" | "h3" | "h4" | "largeTitle" | "title1" | "title2" | "title3" | "bodySemibold" | "subheadline" | "footnote" | "footnoteSemibold" | "captionSemibold" | "ui" | "mono" | null | undefined;
    color?: "primary" | "secondary" | "success" | "error" | "muted" | "info" | "warning" | "accent" | "tertiary" | null | undefined;
    weight?: "bold" | "normal" | "light" | "medium" | "semibold" | null | undefined;
    align?: "center" | "left" | "right" | "justify" | null | undefined;
    truncate?: "none" | "single" | "double" | "triple" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TextProps extends Omit<React$1.HTMLAttributes<HTMLElement>, 'color'>, VariantProps<typeof textVariants> {
    /**
     * HTML element to render
     */
    as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label' | 'legend' | 'code';
    /**
     * Children elements
     */
    children: React$1.ReactNode;
}
/**
 * Text Component
 *
 * Universal text renderer with typography tokens from @repo/tokens.
 * Use instead of raw HTML text elements for consistency.
 *
 * @example
 * <Text variant="h2" color="primary">Heading</Text>
 * <Text variant="body" color="secondary" truncate="single">
 *   Long text that will be truncated...
 * </Text>
 */
declare const Text: React$1.ForwardRefExoticComponent<TextProps & React$1.RefAttributes<HTMLElement>>;

declare const cardShellVariants: (props?: ({
    priority?: "normal" | "high" | "low" | "critical" | null | undefined;
    size?: "SMALL" | "MEDIUM" | "LARGE" | "WIDE" | "FULL" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CardShellProps extends Omit<React$1.HTMLAttributes<HTMLElement>, 'title'>, VariantProps<typeof cardShellVariants> {
    /**
     * Card title (for accessibility)
     */
    title?: string;
    /**
     * Card description (for accessibility)
     */
    description?: string;
    /**
     * Loading state
     */
    isLoading?: boolean;
    /**
     * Error state
     */
    error?: Error | string | null;
    /**
     * Retry callback for error state
     */
    onRetry?: () => void;
    /**
     * Children (card content)
     */
    children: React$1.ReactNode;
    /**
     * HTML element to render
     */
    as?: 'div' | 'section' | 'article';
    /**
     * Interactive (clickable)
     */
    interactive?: boolean;
    /**
     * ARIA role
     */
    role?: string;
}

declare const metricVariants: (props?: ({
    trend?: "none" | "up" | "down" | "neutral" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface MetricCardProps extends Omit<CardShellProps, 'children'> {
    /**
     * Metric value (main number)
     */
    value: string | number;
    /**
     * Metric label (e.g., "Active Deals")
     */
    label: string;
    /**
     * Metric description (optional)
     */
    description?: string;
    /**
     * Change indicator (e.g., "+12%", "-3")
     */
    change?: string;
    /**
     * Trend direction
     */
    trend?: VariantProps<typeof metricVariants>['trend'];
    /**
     * Icon element (optional)
     */
    icon?: React$1.ReactNode;
    /**
     * Badge text (optional, e.g., "This Week")
     */
    badge?: string;
    /**
     * Action button (optional)
     */
    action?: React$1.ReactNode;
}
/**
 * MetricCard Component
 *
 * Display a single metric with optional trend indicator.
 *
 * @example
 * <MetricCard
 *   title="Active Deals"
 *   value={23}
 *   label="deals in progress"
 *   change="+5"
 *   trend="up"
 *   priority="high"
 * />
 */
declare const MetricCard: React$1.ForwardRefExoticComponent<MetricCardProps & React$1.RefAttributes<HTMLElement>>;

/**
 * ListCard - Vertical List Display Pattern
 *
 * Use for displaying lists of items in cards.
 * Examples: Active Deals, Hot Leads, Recent Activities, Pending Tasks
 */

interface ListItem {
    id: string | number;
    /**
     * Primary text (required)
     */
    primary: string;
    /**
     * Secondary text (optional)
     */
    secondary?: string;
    /**
     * Tertiary text (optional, e.g., timestamp)
     */
    tertiary?: string;
    /**
     * Icon element (optional)
     */
    icon?: React$1.ReactNode;
    /**
     * Action element (optional, e.g., button, badge)
     */
    action?: React$1.ReactNode;
    /**
     * Click handler (optional)
     */
    onClick?: () => void;
    /**
     * Metadata for custom rendering
     */
    metadata?: Record<string, any>;
}
interface ListCardProps extends Omit<CardShellProps, 'children'> {
    /**
     * List items to display
     */
    items: ListItem[];
    /**
     * Empty state message
     */
    emptyMessage?: string;
    /**
     * Maximum height (enables scrolling)
     */
    maxHeight?: number | string;
    /**
     * Custom render function for items
     */
    renderItem?: (item: ListItem, index: number) => React$1.ReactNode;
    /**
     * Icon for card header (optional)
     */
    icon?: React$1.ReactNode;
    /**
     * Action button for card header (optional)
     */
    action?: React$1.ReactNode;
}
/**
 * ListCard Component
 *
 * Display a scrollable list of items with consistent styling.
 *
 * @example
 * <ListCard
 *   title="Active Deals"
 *   description="Deals currently in progress"
 *   items={deals}
 *   emptyMessage="No active deals"
 *   maxHeight={400}
 *   priority="high"
 * />
 */
declare const ListCard: React$1.ForwardRefExoticComponent<ListCardProps & React$1.RefAttributes<HTMLElement>>;

/**
 * TrendCard - Metric with Trend Visualization Pattern
 *
 * Use for displaying a metric with historical trend data.
 * Examples: "Revenue Trend", "Deal Velocity", "Conversion Rate Over Time"
 */

interface TrendDataPoint {
    /**
     * X-axis value (e.g., date, timestamp)
     */
    x: string | number;
    /**
     * Y-axis value (metric value)
     */
    y: number;
    /**
     * Label for tooltip (optional)
     */
    label?: string;
}
interface TrendCardProps extends Omit<CardShellProps, 'children'> {
    /**
     * Current metric value
     */
    value: string | number;
    /**
     * Metric label
     */
    label: string;
    /**
     * Change indicator (e.g., "+12%")
     */
    change?: string;
    /**
     * Trend direction
     */
    trend?: 'up' | 'down' | 'neutral';
    /**
     * Historical data points for sparkline
     */
    data?: TrendDataPoint[];
    /**
     * Time period label (e.g., "Last 7 days")
     */
    period?: string;
    /**
     * Icon element (optional)
     */
    icon?: React$1.ReactNode;
    /**
     * Action button (optional)
     */
    action?: React$1.ReactNode;
}
/**
 * TrendCard Component
 *
 * Display a metric with sparkline trend visualization.
 *
 * @example
 * <TrendCard
 *   title="Revenue"
 *   value="$145K"
 *   label="this month"
 *   change="+12%"
 *   trend="up"
 *   data={historicalData}
 *   period="Last 30 days"
 *   priority="high"
 * />
 */
declare const TrendCard: React$1.ForwardRefExoticComponent<TrendCardProps & React$1.RefAttributes<HTMLElement>>;

/**
 * Breakpoint constants matching design system
 */
declare const BREAKPOINTS: {
    readonly mobile: 0;
    readonly tablet: 768;
    readonly desktop: 1024;
    readonly wide: 1280;
    readonly ultrawide: 1920;
};
type Breakpoint = keyof typeof BREAKPOINTS;
/**
 * Hook to detect if the current viewport is mobile
 * @param breakpoint - The breakpoint to check against (default: 'tablet')
 * @returns true if viewport width is below the breakpoint
 *
 * @example
 * const isMobile = useMobile(); // true if width < 768px
 * const isSmallScreen = useMobile('desktop'); // true if width < 1024px
 */
declare function useMobile(breakpoint?: Breakpoint): boolean;
/**
 * Hook to get the current breakpoint
 * @returns The current active breakpoint
 *
 * @example
 * const breakpoint = useBreakpoint();
 * // returns 'mobile' | 'tablet' | 'desktop' | 'wide' | 'ultrawide'
 */
declare function useBreakpoint(): Breakpoint;
/**
 * Hook to get viewport dimensions
 * @returns Object with width and height
 *
 * @example
 * const { width, height } = useViewport();
 */
declare function useViewport(): {
    width: number;
    height: number;
};
/**
 * Hook to check if viewport matches specific media query
 * @param query - Media query string
 * @returns true if query matches
 *
 * @example
 * const isLandscape = useMediaQuery('(orientation: landscape)');
 * const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 */
declare function useMediaQuery(query: string): boolean;
/**
 * Hook to detect touch device
 * @returns true if device supports touch
 */
declare function useTouchDevice(): boolean;
/**
 * Hook to get responsive value based on current breakpoint
 * @param values - Object with values for each breakpoint
 * @returns The value for the current breakpoint
 *
 * @example
 * const columns = useResponsiveValue({
 *   mobile: 1,
 *   tablet: 2,
 *   desktop: 3,
 *   wide: 4,
 * });
 */
declare function useResponsiveValue<T>(values: Partial<Record<Breakpoint, T>>): T | undefined;

/**
 * useSwipeable Hook
 * Custom swipe gesture detection for mobile interactions
 * Zero dependencies - pure DOM event handling
 */
interface SwipeableOptions {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
    onSwipeUp?: () => void;
    onSwipeDown?: () => void;
    threshold?: number;
    preventDefaultTouchmoveEvent?: boolean;
}
interface SwipeableHandlers {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
}
declare function useSwipeable(options: SwipeableOptions): SwipeableHandlers;
/**
 * useSwipeableCard Hook
 * Enhanced swipeable for card actions with visual feedback
 * Returns swipe offset for visual animations
 */
interface SwipeableCardOptions {
    onSwipeLeftAction?: () => void;
    onSwipeRightAction?: () => void;
    threshold?: number;
    actionThreshold?: number;
}
declare function useSwipeableCard(options: SwipeableCardOptions): {
    swipeOffset: number;
    isSwiping: boolean;
    handlers: {
        onTouchStart: (e: React.TouchEvent) => void;
        onTouchMove: (e: React.TouchEvent) => void;
        onTouchEnd: () => void;
    };
};
/**
 * useLongPress Hook
 * Detect long press gestures for context menus
 */
interface LongPressOptions {
    onLongPress: () => void;
    delay?: number;
    onPress?: () => void;
}
declare function useLongPress(options: LongPressOptions): {
    onMouseDown: (e: React.TouchEvent | React.MouseEvent) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    onTouchStart: (e: React.TouchEvent | React.MouseEvent) => void;
    onTouchEnd: () => void;
};

/**
 * usePullToRefresh Hook
 * Implements pull-to-refresh functionality for mobile
 * Zero dependencies - pure touch event handling
 */
interface PullToRefreshOptions {
    onRefresh: () => Promise<void>;
    threshold?: number;
    maxPullDistance?: number;
    resistance?: number;
    disabled?: boolean;
}
interface PullToRefreshState {
    pullDistance: number;
    isRefreshing: boolean;
    canRefresh: boolean;
}
declare function usePullToRefresh(options: PullToRefreshOptions): {
    containerRef: React$1.MutableRefObject<HTMLElement | null>;
    pullDistance: number;
    isRefreshing: boolean;
    canRefresh: boolean;
};

/**
 * @repo/ui Custom Icon Library
 * All icons are custom SVG components built from scratch
 * No external icon libraries - fully custom design system
 */

interface IconProps extends React$1.SVGProps<SVGSVGElement> {
    size?: number;
}
declare const Home: React$1.FC<IconProps>;
declare const Briefcase: React$1.FC<IconProps>;
declare const BarChart3: React$1.FC<IconProps>;
declare const Settings: React$1.FC<IconProps>;
declare const ChevronRight: React$1.FC<IconProps>;
declare const Phone: React$1.FC<IconProps>;
declare const MessageSquare: React$1.FC<IconProps>;
declare const Calendar: React$1.FC<IconProps>;
declare const Users: React$1.FC<IconProps>;
declare const Car: React$1.FC<IconProps>;
declare const FileText: React$1.FC<IconProps>;
declare const CheckCircle: React$1.FC<IconProps>;
declare const AlertCircle: React$1.FC<IconProps>;
declare const Clock: React$1.FC<IconProps>;
declare const DollarSign: React$1.FC<IconProps>;
declare const TrendingUp: React$1.FC<IconProps>;
declare const TrendingDown: React$1.FC<IconProps>;
declare const X: React$1.FC<IconProps>;
declare const MenuIcon: React$1.FC<IconProps>;
declare const Search: React$1.FC<IconProps>;
declare const Sun: React$1.FC<IconProps>;
declare const Moon: React$1.FC<IconProps>;
declare const Bell: React$1.FC<IconProps>;
declare const User: React$1.FC<IconProps>;

/**
 * Merge Tailwind CSS classes with proper precedence
 */
declare function cn(...inputs: ClassValue[]): string;

export { AggregateCard, AggregateCardGrid, type AggregateCardGridProps, type AggregateCardProps, type AggregateMetric, type AggregationFunction, Alert, AlertCircle, AlertDescription, type AlertProps, AlertTitle, Avatar, AvatarFallback, AvatarImage, type AvatarProps, BREAKPOINTS, Badge, type BadgeProps, BarChart3, Bell, Box, type BoxProps, type Breakpoint, Briefcase, Button, type ButtonProps, Calendar, Car, Card, CardContent, CardDescription, CardFooter, CardHeader, type CardProps, CardTitle, CheckCircle, Checkbox, type CheckboxProps, ChevronRight, Chip, ChipGroup, type ChipGroupProps, type ChipProps, Clock, type ComparisonData, type ConnectionStatus, DASHBOARD_PRESETS, DEAL_TRANSITIONS, type DashboardPreset, type DashboardWidget, DataExporter, type DataExporterProps, DataTable, type DataTableColumn, type DataTableFilter, type DataTableProps, type DataTableSort, type DataTableState, type DealActivity, type DealDocument, DealJacket, type DealJacketData, type DealJacketProps, type DealJacketStatus, type DealStage, type DealState, type DealStateTransition, DealWorkspace, type DealWorkspaceData, type DealWorkspaceProps, Divider, type DividerProps, type DocumentStatus, type DocumentType, DollarSign, Dot, DotGroup, type DotGroupProps, type DotProps, type ExportColumn, type ExportFormat, type ExportOptions, type FieldType, FileText, type FilterField, FilterPanel, type FilterPanelProps, type FilterPreset, type FilterState, type FilterType, type FilterValue, FocusStudioLayout, type FocusStudioLayoutProps, FormField, type FormFieldProps, FullDensityLayout, type FullDensityLayoutProps, Home, IconButton, type IconButtonProps, type IconProps, Inline, type InlineProps, Input, type InputProps, Kbd, type KbdProps, Label, type LabelProps, ListCard, type ListCardProps, ListDetailLayout, type ListDetailLayoutProps, type ListItem, LiveDataFeed, type LiveDataFeedProps, type LiveMessage, type LongPressOptions, Menu, type MenuGroup, MenuIcon, type MenuItem, type MenuProps, MenuSeparator, MessageSquare, MetricCard, type MetricCardProps, type MetricStatus, Moon, type OperatorType, Phone, type PivotCell, type PivotConfig, type PivotField, type PivotRow, PivotTable, type PivotTableProps, type PivotValueField, type Priority, Progress, type ProgressProps, PullToRefresh, type PullToRefreshOptions, type PullToRefreshProps, type PullToRefreshState, type Query, QueryBuilder, type QueryBuilderProps, type QueryCondition, type QueryField, type QueryGroup, Radio, RadioGroup, RadioGroupItem, type RadioGroupProps, type RadioProps, RoleDashboard, type RoleDashboardProps, Search, Select, type SelectOption, type SelectProps, Settings, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, type SheetProps, SheetTitle, SheetTrigger, Skeleton, type SkeletonProps, type SortDirection, Spinner, type SpinnerProps, Stack, type StackProps, type StateAwareContext, Sun, Surface, type SurfaceProps, type SwipeAction, SwipeableCard, type SwipeableCardOptions, type SwipeableCardProps, type SwipeableHandlers, type SwipeableOptions, Switch, type SwitchProps, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, type TableProps, TableRow, Tabs, TabsContent, type TabsContentProps, TabsList, type TabsListProps, type TabsProps, TabsTrigger, type TabsTriggerProps, Text, type TextProps, Tooltip, type TooltipProps, TrendCard, type TrendCardProps, type TrendData, type TrendDataPoint, type TrendDirection, TrendingDown, TrendingUp, User, type UserRole, Users, type WidgetData, type WidgetSize, type WidgetType, X, aggregateData, alertVariants, applyFilters, avatarVariants, badgeVariants, boxVariants, buttonVariants, calculateDocumentCompletionScore, calculateTrend, calculateUrgencyScore, canTransition, cardVariants, checkboxVariants, cn, exportFilters, exportPivotToCSV, formDescriptionVariants, formFieldVariants, getRecommendedWidgetsForRole, getRequiredDocumentsForDealType, getStageProgress, importFilters, inlineVariants, inputVariants, labelVariants, metricVariants, progressBarVariants, progressVariants, queryToJSON, queryToSQL, radioVariants, selectVariants, sheetContentVariants, sheetOverlayVariants, skeletonVariants, stackVariants, surfaceVariants, switchVariants, tableVariants, textVariants, tooltipVariants, useBreakpoint, useLongPress, useMediaQuery, useMobile, usePullToRefresh, useResponsiveValue, useSwipeable, useSwipeableCard, useTouchDevice, useViewport };
