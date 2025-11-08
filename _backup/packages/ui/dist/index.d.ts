import * as class_variance_authority_types from 'class-variance-authority/types';
import * as React$1 from 'react';
import React__default from 'react';
import { VariantProps } from 'class-variance-authority';
import * as react_jsx_runtime from 'react/jsx-runtime';
import * as SelectPrimitive from '@radix-ui/react-select';
import * as SliderPrimitive from '@radix-ui/react-slider';
import { DayPicker } from 'react-day-picker';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as SeparatorPrimitive from '@radix-ui/react-separator';
import * as PopoverPrimitive from '@radix-ui/react-popover';
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import * as _radix_ui_react_slot from '@radix-ui/react-slot';
import * as react_hook_form from 'react-hook-form';
import { FieldValues, FieldPath, ControllerProps } from 'react-hook-form';
import * as LabelPrimitive from '@radix-ui/react-label';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import * as TogglePrimitive from '@radix-ui/react-toggle';
import * as ToggleGroupPrimitive from '@radix-ui/react-toggle-group';
import * as CollapsiblePrimitive from '@radix-ui/react-collapsible';
import { LucideIcon } from 'lucide-react';
import { Insight } from '@repo/insights-engine';
import { ThemeName } from '@repo/tokens';
import { ClassValue } from 'clsx';

declare const boxVariants: (props?: ({
    display?: "block" | "inline" | "inline-block" | "flex" | "inline-flex" | "grid" | "inline-grid" | "none" | null | undefined;
    position?: "static" | "relative" | "absolute" | "fixed" | "sticky" | null | undefined;
    padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | null | undefined;
    margin?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "auto" | null | undefined;
    width?: "auto" | "full" | "screen" | "min" | "max" | "fit" | null | undefined;
    height?: "auto" | "full" | "screen" | "min" | "max" | "fit" | null | undefined;
    overflow?: "hidden" | "auto" | "visible" | "scroll" | null | undefined;
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
    gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | null | undefined;
    align?: "start" | "center" | "end" | "stretch" | "baseline" | null | undefined;
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly" | null | undefined;
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
    gap?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | null | undefined;
    align?: "start" | "center" | "end" | "stretch" | "baseline" | null | undefined;
    justify?: "start" | "center" | "end" | "between" | "around" | "evenly" | null | undefined;
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
    variant?: "base" | "elevated" | "subtle" | "transparent" | "ok" | "caution" | "risk" | "info" | "muted" | null | undefined;
    elevation?: "none" | "sm" | "md" | "lg" | "xl" | null | undefined;
    border?: "default" | "none" | "strong" | null | undefined;
    padding?: "none" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | null | undefined;
    radius?: "none" | "sm" | "md" | "lg" | "xl" | "full" | null | undefined;
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
    variant?: "display" | "h1" | "h2" | "h3" | "h4" | "body" | "ui" | "caption" | "mono" | null | undefined;
    color?: "info" | "muted" | "primary" | "secondary" | "tertiary" | "accent" | "success" | "warning" | "error" | null | undefined;
    weight?: "light" | "normal" | "medium" | "semibold" | "bold" | null | undefined;
    align?: "center" | "justify" | "left" | "right" | null | undefined;
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
    priority?: "normal" | "critical" | "high" | "low" | null | undefined;
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
/**
 * CardShell Component
 *
 * Base card pattern with loading/error states and accessibility.
 *
 * @example
 * <CardShell
 *   title="Active Deals"
 *   description="List of currently active deals"
 *   priority="high"
 *   size="MEDIUM"
 *   isLoading={isLoading}
 *   error={error}
 * >
 *   <CardContent />
 * </CardShell>
 */
declare const CardShell: React$1.ForwardRefExoticComponent<CardShellProps & React$1.RefAttributes<HTMLElement>>;
/**
 * CardHeader - Standard header for cards
 */
interface CardHeaderProps extends React$1.HTMLAttributes<HTMLDivElement> {
    /**
     * Title text
     */
    title: string;
    /**
     * Description text (optional)
     */
    description?: string;
    /**
     * Action button/element (optional)
     */
    action?: React$1.ReactNode;
    /**
     * Icon (optional)
     */
    icon?: React$1.ReactNode;
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

interface PageContainerProps {
    /** Page content */
    children: React__default.ReactNode;
    /** Custom className */
    className?: string;
    /** Remove default padding */
    noPadding?: boolean;
    /** Maximum width constraint */
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
}
declare function PageContainer({ children, className, noPadding, maxWidth, }: PageContainerProps): react_jsx_runtime.JSX.Element;

interface ResponsiveGridProps {
    /** Grid content */
    children: React__default.ReactNode;
    /** Number of columns on desktop */
    cols?: 1 | 2 | 3 | 4 | 5 | 6;
    /** Number of columns on mobile (default: 1) */
    mobileCols?: 1 | 2;
    /** Gap size */
    gap?: 'sm' | 'md' | 'lg';
    /** Custom className */
    className?: string;
}
declare function ResponsiveGrid({ children, cols, mobileCols, gap, className, }: ResponsiveGridProps): react_jsx_runtime.JSX.Element;

interface MobileCardProps {
    /** Mobile layout content */
    mobileLayout: React__default.ReactNode;
    /** Desktop layout content */
    desktopLayout: React__default.ReactNode;
    /** Custom className */
    className?: string;
    /** Card padding */
    padding?: 'sm' | 'md' | 'lg';
}
declare function MobileCard({ mobileLayout, desktopLayout, className, padding, }: MobileCardProps): react_jsx_runtime.JSX.Element;
interface MobileListItemProps {
    /** Primary text */
    primary: string;
    /** Secondary text */
    secondary?: string;
    /** Amount/value to display */
    value?: string | number;
    /** Value color */
    valueColor?: 'default' | 'success' | 'error' | 'warning';
    /** Badges */
    badges?: React__default.ReactNode;
    /** Actions */
    actions?: React__default.ReactNode;
    /** Meta info (date, category, etc) */
    meta?: React__default.ReactNode;
    /** Custom className */
    className?: string;
}
declare function MobileListItem({ primary, secondary, value, valueColor, badges, meta, actions, className, }: MobileListItemProps): react_jsx_runtime.JSX.Element;

declare const buttonVariants: (props?: ({
    variant?: "primary" | "secondary" | "success" | "outline" | "ghost" | "danger" | null | undefined;
    size?: "sm" | "md" | "lg" | "icon" | null | undefined;
    fullWidth?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ButtonProps extends React$1.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}
declare const Button: React$1.ForwardRefExoticComponent<ButtonProps & React$1.RefAttributes<HTMLButtonElement>>;

interface ResponsiveButtonProps extends Omit<ButtonProps, 'children'> {
    /** Button text */
    text: string;
    /** Icon component */
    icon?: React__default.ReactNode;
    /** Show text on mobile */
    showTextOnMobile?: boolean;
}
declare function ResponsiveButton({ text, icon, showTextOnMobile, size, className, ...props }: ResponsiveButtonProps): react_jsx_runtime.JSX.Element;
interface ResponsiveActionsProps {
    /** Action buttons */
    children: React__default.ReactNode;
    /** Custom className */
    className?: string;
    /** Alignment */
    align?: 'left' | 'center' | 'right';
}
declare function ResponsiveActions({ children, className, align, }: ResponsiveActionsProps): react_jsx_runtime.JSX.Element;

declare const inputVariants: (props?: ({
    variant?: "default" | "success" | "error" | null | undefined;
    inputSize?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface InputProps extends React$1.InputHTMLAttributes<HTMLInputElement>, VariantProps<typeof inputVariants> {
    error?: string;
    hint?: string;
    label?: string;
    leftIcon?: React$1.ReactNode;
    rightIcon?: React$1.ReactNode;
}
declare const Input: React$1.ForwardRefExoticComponent<InputProps & React$1.RefAttributes<HTMLInputElement>>;

declare const cardVariants: (props?: ({
    variant?: "default" | "outline" | "ghost" | null | undefined;
    padding?: "none" | "sm" | "md" | "lg" | null | undefined;
    hover?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface CardProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof cardVariants> {
}
declare const Card: React$1.ForwardRefExoticComponent<CardProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CardHeader: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const CardTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const CardDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const CardContent: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const CardFooter: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;

declare const badgeVariants: (props?: ({
    variant?: "default" | "info" | "secondary" | "success" | "warning" | "error" | "outline" | "solid" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    rounded?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface BadgeProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {
    icon?: React$1.ReactNode;
    onRemove?: () => void;
}
declare const Badge: React$1.ForwardRefExoticComponent<BadgeProps & React$1.RefAttributes<HTMLDivElement>>;

interface PageHeaderProps extends React$1.HTMLAttributes<HTMLDivElement> {
    icon?: React$1.ReactNode;
    title: string;
    description?: string;
    actions?: React$1.ReactNode;
}
declare const PageHeader: React$1.ForwardRefExoticComponent<PageHeaderProps & React$1.RefAttributes<HTMLDivElement>>;

declare const statCardVariants: (props?: ({
    hover?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface StatCardProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof statCardVariants> {
    label: string;
    value: string | number;
    change?: string;
    icon?: React$1.ReactNode;
    iconBg?: string;
    iconColor?: string;
}
declare const StatCard: React$1.ForwardRefExoticComponent<StatCardProps & React$1.RefAttributes<HTMLDivElement>>;

interface SearchInputProps extends Omit<InputProps, 'type'> {
    onSearch?: (value: string) => void;
}
declare const SearchInput: React$1.ForwardRefExoticComponent<SearchInputProps & React$1.RefAttributes<HTMLInputElement>>;

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

declare const skeletonVariants: (props?: ({
    variant?: "default" | "text" | "circular" | "rectangular" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SkeletonProps$1 extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof skeletonVariants> {
}
declare const Skeleton$1: React$1.ForwardRefExoticComponent<SkeletonProps$1 & React$1.RefAttributes<HTMLDivElement>>;

declare const alertVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "error" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AlertProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof alertVariants> {
    icon?: React$1.ReactNode;
    title?: string;
    action?: React$1.ReactNode;
}
declare const Alert: React$1.ForwardRefExoticComponent<AlertProps & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertTitle: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLHeadingElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const AlertDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;

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

interface EmptyStateProps extends React$1.HTMLAttributes<HTMLDivElement> {
    icon?: React$1.ReactNode;
    title: string;
    description?: string;
    action?: React$1.ReactNode;
}
declare const EmptyState: React$1.ForwardRefExoticComponent<EmptyStateProps & React$1.RefAttributes<HTMLDivElement>>;

interface QuickActionProps extends React$1.HTMLAttributes<HTMLDivElement> {
    icon: React$1.ReactNode;
    title: string;
    description?: string;
    href?: string;
    badge?: React$1.ReactNode;
}
declare const QuickAction: React$1.ForwardRefExoticComponent<QuickActionProps & React$1.RefAttributes<HTMLDivElement>>;

declare const progressVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const progressBarVariants: (props?: ({
    variant?: "default" | "success" | "warning" | "error" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ProgressProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof progressVariants>, VariantProps<typeof progressBarVariants> {
    value: number;
    max?: number;
    showLabel?: boolean;
}
declare const Progress: React$1.ForwardRefExoticComponent<ProgressProps & React$1.RefAttributes<HTMLDivElement>>;

declare const selectVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    tone?: "default" | "subtle" | "danger" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
type SelectOption = {
    label: string;
    value: string;
    disabled?: boolean;
};
interface SelectProps extends Omit<React$1.SelectHTMLAttributes<HTMLSelectElement>, 'size' | 'onChange'>, VariantProps<typeof selectVariants> {
    options?: SelectOption[];
    placeholder?: string;
    onValueChange?: (value: string) => void;
}
declare const Select: React$1.ForwardRefExoticComponent<SelectProps & React$1.RefAttributes<HTMLSelectElement>>;

declare const SelectRoot: React$1.FC<SelectPrimitive.SelectProps>;
declare const SelectGroup: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectValue: React$1.ForwardRefExoticComponent<SelectPrimitive.SelectValueProps & React$1.RefAttributes<HTMLSpanElement>>;
declare const SelectTrigger: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectTriggerProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const SelectScrollUpButton: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollUpButtonProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectScrollDownButton: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectScrollDownButtonProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectContent: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectLabel: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectLabelProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectItem: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const SelectSeparator: React$1.ForwardRefExoticComponent<Omit<SelectPrimitive.SelectSeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const textareaVariants: (props?: ({
    variant?: "default" | "success" | "error" | null | undefined;
    textareaSize?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface TextareaProps extends React$1.TextareaHTMLAttributes<HTMLTextAreaElement>, VariantProps<typeof textareaVariants> {
    error?: string;
    hint?: string;
    label?: string;
}
declare const Textarea: React$1.ForwardRefExoticComponent<TextareaProps & React$1.RefAttributes<HTMLTextAreaElement>>;

declare const checkboxVariants: (props?: ({
    variant?: "default" | "success" | "error" | null | undefined;
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
    variant?: "default" | "success" | "error" | null | undefined;
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
    variant?: "default" | "success" | "error" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SwitchProps extends Omit<React$1.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'>, VariantProps<typeof switchVariants> {
    label?: string;
    error?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}
declare const Switch: React$1.ForwardRefExoticComponent<SwitchProps & React$1.RefAttributes<HTMLInputElement>>;

declare const labelVariants: (props?: ({
    variant?: "default" | "muted" | "success" | "error" | null | undefined;
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
    variant?: "default" | "info" | "success" | "error" | null | undefined;
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
declare const FormField$1: React$1.ForwardRefExoticComponent<FormFieldProps & React$1.RefAttributes<HTMLDivElement>>;

declare const Slider: React$1.ForwardRefExoticComponent<Omit<SliderPrimitive.SliderProps & React$1.RefAttributes<HTMLSpanElement>, "ref"> & React$1.RefAttributes<HTMLSpanElement>>;

type CalendarProps = React$1.ComponentProps<typeof DayPicker>;
declare function Calendar({ className, classNames, showOutsideDays, ...props }: CalendarProps): react_jsx_runtime.JSX.Element;
declare namespace Calendar {
    var displayName: string;
}

type NoteContext = 'customer' | 'showroom' | 'appraisal' | 'deal' | 'vehicle' | 'lead' | 'service' | 'standalone';
interface Note {
    id: string;
    content: string;
    context: NoteContext;
    entityId: string;
    entityType?: string;
    createdBy: string;
    createdByName?: string;
    createdAt: string;
    updatedAt?: string;
    isPrivate?: boolean;
    tags?: string[];
}
interface NotesProps extends Omit<React$1.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
    /** Context determines where the note is saved */
    context: NoteContext;
    /** ID of the entity this note belongs to (customerId, appraisalId, etc.) */
    entityId: string;
    /** For standalone context, specify the entity type */
    entityType?: string;
    /** Initial note value */
    value?: string;
    /** Callback when note is saved */
    onSave?: (note: Note) => void;
    /** Callback when note content changes */
    onChange?: (content: string) => void;
    /** Auto-save delay in milliseconds (default: 2000ms) */
    autoSaveDelay?: number;
    /** Show character count */
    showCharacterCount?: boolean;
    /** Maximum characters allowed */
    maxLength?: number;
    /** Show save status indicator */
    showSaveStatus?: boolean;
    /** Mark note as private (only visible to creator) */
    isPrivate?: boolean;
    /** User ID creating the note */
    userId?: string;
    /** User name creating the note */
    userName?: string;
    /** Additional tags for categorization */
    tags?: string[];
    /** Custom placeholder based on context */
    contextPlaceholder?: boolean;
    /** Height variant */
    height?: 'sm' | 'md' | 'lg' | 'xl';
    className?: string;
}
declare const notesVariants: (props?: ({
    height?: "sm" | "md" | "lg" | "xl" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const Notes: React$1.ForwardRefExoticComponent<NotesProps & React$1.RefAttributes<HTMLTextAreaElement>>;

declare const tableVariants: (props?: ({
    variant?: "default" | "striped" | "bordered" | null | undefined;
    density?: "normal" | "compact" | "comfortable" | null | undefined;
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

declare const tooltipVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "error" | "light" | null | undefined;
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

declare const TooltipProvider: ({ delayDuration, skipDelayDuration, ...props }: TooltipPrimitive.TooltipProviderProps) => react_jsx_runtime.JSX.Element;
declare const TooltipRoot: React$1.FC<TooltipPrimitive.TooltipProps>;
declare const TooltipTrigger: React$1.ForwardRefExoticComponent<TooltipPrimitive.TooltipTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const TooltipContent: React$1.ForwardRefExoticComponent<Omit<TooltipPrimitive.TooltipContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const Separator: React$1.ForwardRefExoticComponent<Omit<SeparatorPrimitive.SeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const laneBoardVariants: (props?: ({
    padding?: "none" | "sm" | "md" | "lg" | null | undefined;
    gap?: "sm" | "md" | "lg" | null | undefined;
    height?: "auto" | "full" | "screen" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface LaneBoardProps extends React__default.HTMLAttributes<HTMLDivElement>, VariantProps<typeof laneBoardVariants> {
    /** Optional custom class name */
    className?: string;
}
/**
 * Container for kanban lanes with horizontal scrolling
 */
declare const LaneBoard: React__default.ForwardRefExoticComponent<LaneBoardProps & React__default.RefAttributes<HTMLDivElement>>;
declare const laneVariants: (props?: ({
    width?: "sm" | "md" | "lg" | "full" | null | undefined;
    maxHeight?: "none" | "sm" | "md" | "lg" | "full" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface LaneProps extends React__default.HTMLAttributes<HTMLDivElement>, VariantProps<typeof laneVariants> {
    /** Lane title */
    title: string;
    /** Lane count badge */
    count?: number;
    /** Optional lane color */
    color?: 'neutral' | 'blue' | 'green' | 'yellow' | 'red' | 'purple';
    /** Optional custom class name */
    className?: string;
}
/**
 * Individual lane in the kanban board
 */
declare const Lane: React__default.ForwardRefExoticComponent<LaneProps & React__default.RefAttributes<HTMLDivElement>>;

declare const laneCardVariants: (props?: ({
    size?: "sm" | "md" | "lg" | null | undefined;
    tone?: "info" | "success" | "warning" | "error" | "neutral" | null | undefined;
    hover?: "none" | "subtle" | "lift" | "glow" | null | undefined;
    dragging?: boolean | null | undefined;
    selected?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface LaneCardProps extends React__default.HTMLAttributes<HTMLDivElement>, VariantProps<typeof laneCardVariants> {
    /** Whether card is being dragged */
    isDragging?: boolean;
    /** Whether card is selected */
    isSelected?: boolean;
    /** Optional custom class name */
    className?: string;
}
/**
 * Card for use in kanban lanes
 * Supports drag-and-drop via draggable attribute
 */
declare const LaneCard: React__default.ForwardRefExoticComponent<LaneCardProps & React__default.RefAttributes<HTMLDivElement>>;
/**
 * Card Header - Optional title/subtitle section
 */
declare const LaneCardHeader: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
/**
 * Card Title
 */
declare const LaneCardTitle: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLHeadingElement> & React__default.RefAttributes<HTMLHeadingElement>>;
/**
 * Card Description/Subtitle
 */
declare const LaneCardDescription: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLParagraphElement> & React__default.RefAttributes<HTMLParagraphElement>>;
/**
 * Card Content - Main body
 */
declare const LaneCardContent: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
/**
 * Card Footer - Optional actions/metadata
 */
declare const LaneCardFooter: React__default.ForwardRefExoticComponent<React__default.HTMLAttributes<HTMLDivElement> & React__default.RefAttributes<HTMLDivElement>>;
/**
 * Card Badge - Small status indicator
 */
interface LaneCardBadgeProps extends React__default.HTMLAttributes<HTMLSpanElement> {
    variant?: 'neutral' | 'success' | 'warning' | 'error' | 'info';
}
declare const LaneCardBadge: React__default.ForwardRefExoticComponent<LaneCardBadgeProps & React__default.RefAttributes<HTMLSpanElement>>;

declare const modalOverlayVariants: (props?: ({
    state?: "open" | "closed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const modalContentVariants: (props?: ({
    size?: "sm" | "md" | "lg" | "xl" | "full" | null | undefined;
    state?: "open" | "closed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ModalProps extends VariantProps<typeof modalContentVariants> {
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
declare const Modal: {
    ({ open, onOpenChange, title, description, children, footer, size, showCloseButton, closeOnOverlayClick, closeOnEscape, className, }: ModalProps): react_jsx_runtime.JSX.Element | null;
    displayName: string;
};

declare const dropdownContentVariants: (props?: ({
    align?: "start" | "center" | "end" | null | undefined;
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
    state?: "open" | "closed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const dropdownItemVariants: (props?: ({
    variant?: "default" | "destructive" | null | undefined;
    disabled?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface DropdownItem {
    label: React$1.ReactNode;
    value?: string;
    icon?: React$1.ReactNode;
    shortcut?: string;
    disabled?: boolean;
    destructive?: boolean;
    separator?: boolean;
    submenu?: DropdownItem[];
    onSelect?: () => void;
}
interface DropdownProps extends VariantProps<typeof dropdownContentVariants> {
    trigger: React$1.ReactNode;
    items: DropdownItem[];
    onItemSelect?: (value?: string) => void;
    className?: string;
    modal?: boolean;
}
declare const Dropdown: {
    ({ trigger, items, onItemSelect, align, side, className, modal, }: DropdownProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const popoverContentVariants: (props?: ({
    align?: "start" | "center" | "end" | null | undefined;
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
    size?: "sm" | "md" | "lg" | "auto" | null | undefined;
    state?: "open" | "closed" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const popoverArrowVariants: (props?: ({
    side?: "left" | "right" | "top" | "bottom" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface PopoverProps extends VariantProps<typeof popoverContentVariants> {
    trigger: React$1.ReactNode;
    children: React$1.ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    modal?: boolean;
    showArrow?: boolean;
    showCloseButton?: boolean;
    title?: React$1.ReactNode;
    className?: string;
}
declare const Popover: {
    ({ trigger, children, open: controlledOpen, onOpenChange, align, side, size, modal, showArrow, showCloseButton, title, className, }: PopoverProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const PopoverRoot: React$1.FC<PopoverPrimitive.PopoverProps>;
declare const PopoverTrigger: React$1.ForwardRefExoticComponent<PopoverPrimitive.PopoverTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const PopoverAnchor: React$1.ForwardRefExoticComponent<PopoverPrimitive.PopoverAnchorProps & React$1.RefAttributes<HTMLDivElement>>;
declare const PopoverContent: React$1.ForwardRefExoticComponent<Omit<PopoverPrimitive.PopoverContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

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

declare const toastVariants: (props?: ({
    variant?: "default" | "info" | "success" | "warning" | "error" | null | undefined;
    position?: "top-left" | "top-center" | "top-right" | "bottom-left" | "bottom-center" | "bottom-right" | null | undefined;
    state?: "entering" | "entered" | "exiting" | "exited" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface ToastProps extends VariantProps<typeof toastVariants> {
    id?: string;
    title?: React$1.ReactNode;
    description?: React$1.ReactNode;
    action?: React$1.ReactNode;
    duration?: number;
    onClose?: () => void;
    showIcon?: boolean;
    showCloseButton?: boolean;
    className?: string;
}
declare const Toast: {
    ({ id, title, description, action, variant, position, duration, onClose, showIcon, showCloseButton, className, }: ToastProps): react_jsx_runtime.JSX.Element | null;
    displayName: string;
};
type ToastType = Omit<ToastProps, 'onClose'> & {
    id: string;
};
interface ToastContextValue {
    toasts: ToastType[];
    addToast: (toast: Omit<ToastType, 'id'>) => string;
    removeToast: (id: string) => void;
    removeAllToasts: () => void;
}
declare const useToast: () => ToastContextValue;
declare const ToastProvider: ({ children }: {
    children: React$1.ReactNode;
}) => react_jsx_runtime.JSX.Element;

declare function Toaster(): react_jsx_runtime.JSX.Element;

declare const Command: React$1.ForwardRefExoticComponent<Omit<{
    children?: React$1.ReactNode;
} & Pick<Pick<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React$1.HTMLAttributes<HTMLDivElement>> & {
    ref?: React$1.Ref<HTMLDivElement>;
} & {
    asChild?: boolean;
}, "key" | keyof React$1.HTMLAttributes<HTMLDivElement> | "asChild"> & {
    label?: string;
    shouldFilter?: boolean;
    filter?: (value: string, search: string, keywords?: string[]) => number;
    defaultValue?: string;
    value?: string;
    onValueChange?: (value: string) => void;
    loop?: boolean;
    disablePointerSelection?: boolean;
    vimBindings?: boolean;
} & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandInput: React$1.ForwardRefExoticComponent<Omit<Omit<Pick<Pick<React$1.DetailedHTMLProps<React$1.InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>, "key" | keyof React$1.InputHTMLAttributes<HTMLInputElement>> & {
    ref?: React$1.Ref<HTMLInputElement>;
} & {
    asChild?: boolean;
}, "key" | "asChild" | keyof React$1.InputHTMLAttributes<HTMLInputElement>>, "onChange" | "type" | "value"> & {
    value?: string;
    onValueChange?: (search: string) => void;
} & React$1.RefAttributes<HTMLInputElement>, "ref"> & React$1.RefAttributes<HTMLInputElement>>;
declare const CommandList: React$1.ForwardRefExoticComponent<Omit<{
    children?: React$1.ReactNode;
} & Pick<Pick<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React$1.HTMLAttributes<HTMLDivElement>> & {
    ref?: React$1.Ref<HTMLDivElement>;
} & {
    asChild?: boolean;
}, "key" | keyof React$1.HTMLAttributes<HTMLDivElement> | "asChild"> & {
    label?: string;
} & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandEmpty: React$1.ForwardRefExoticComponent<Omit<{
    children?: React$1.ReactNode;
} & Pick<Pick<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React$1.HTMLAttributes<HTMLDivElement>> & {
    ref?: React$1.Ref<HTMLDivElement>;
} & {
    asChild?: boolean;
}, "key" | keyof React$1.HTMLAttributes<HTMLDivElement> | "asChild"> & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandGroup: React$1.ForwardRefExoticComponent<Omit<{
    children?: React$1.ReactNode;
} & Omit<Pick<Pick<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React$1.HTMLAttributes<HTMLDivElement>> & {
    ref?: React$1.Ref<HTMLDivElement>;
} & {
    asChild?: boolean;
}, "key" | keyof React$1.HTMLAttributes<HTMLDivElement> | "asChild">, "heading" | "value"> & {
    heading?: React$1.ReactNode;
    value?: string;
    forceMount?: boolean;
} & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandSeparator: React$1.ForwardRefExoticComponent<Omit<Pick<Pick<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React$1.HTMLAttributes<HTMLDivElement>> & {
    ref?: React$1.Ref<HTMLDivElement>;
} & {
    asChild?: boolean;
}, "key" | keyof React$1.HTMLAttributes<HTMLDivElement> | "asChild"> & {
    alwaysRender?: boolean;
} & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandItem: React$1.ForwardRefExoticComponent<Omit<{
    children?: React$1.ReactNode;
} & Omit<Pick<Pick<React$1.DetailedHTMLProps<React$1.HTMLAttributes<HTMLDivElement>, HTMLDivElement>, "key" | keyof React$1.HTMLAttributes<HTMLDivElement>> & {
    ref?: React$1.Ref<HTMLDivElement>;
} & {
    asChild?: boolean;
}, "key" | keyof React$1.HTMLAttributes<HTMLDivElement> | "asChild">, "onSelect" | "value" | "disabled"> & {
    disabled?: boolean;
    onSelect?: (value: string) => void;
    value?: string;
    keywords?: string[];
    forceMount?: boolean;
} & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const CommandShortcut: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLSpanElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const AlertDialog: React$1.FC<AlertDialogPrimitive.AlertDialogProps>;
declare const AlertDialogTrigger: React$1.ForwardRefExoticComponent<AlertDialogPrimitive.AlertDialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const AlertDialogPortal: React$1.FC<AlertDialogPrimitive.AlertDialogPortalProps>;
declare const AlertDialogOverlay: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogOverlayProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertDialogContent: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const AlertDialogHeader: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const AlertDialogFooter: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const AlertDialogTitle: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogTitleProps & React$1.RefAttributes<HTMLHeadingElement>, "ref"> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const AlertDialogDescription: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>, "ref"> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const AlertDialogAction: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogActionProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;
declare const AlertDialogCancel: React$1.ForwardRefExoticComponent<Omit<AlertDialogPrimitive.AlertDialogCancelProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & React$1.RefAttributes<HTMLButtonElement>>;

declare const Dialog: React$1.FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: React$1.FC<DialogPrimitive.DialogPortalProps>;
declare const DialogClose: React$1.ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DialogOverlay: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogOverlayProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DialogContent: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DialogHeader: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const DialogFooter: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLDivElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};
declare const DialogTitle: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogTitleProps & React$1.RefAttributes<HTMLHeadingElement>, "ref"> & React$1.RefAttributes<HTMLHeadingElement>>;
declare const DialogDescription: React$1.ForwardRefExoticComponent<Omit<DialogPrimitive.DialogDescriptionProps & React$1.RefAttributes<HTMLParagraphElement>, "ref"> & React$1.RefAttributes<HTMLParagraphElement>>;

declare const DropdownMenu: React$1.FC<DropdownMenuPrimitive.DropdownMenuProps>;
declare const DropdownMenuTrigger: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const DropdownMenuGroup: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuPortal: React$1.FC<DropdownMenuPrimitive.DropdownMenuPortalProps>;
declare const DropdownMenuSub: React$1.FC<DropdownMenuPrimitive.DropdownMenuSubProps>;
declare const DropdownMenuRadioGroup: React$1.ForwardRefExoticComponent<DropdownMenuPrimitive.DropdownMenuRadioGroupProps & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSubTrigger: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubTriggerProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSubContent: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSubContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuContent: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuContentProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuCheckboxItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuCheckboxItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuRadioItem: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuRadioItemProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuLabel: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuLabelProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & {
    inset?: boolean;
} & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuSeparator: React$1.ForwardRefExoticComponent<Omit<DropdownMenuPrimitive.DropdownMenuSeparatorProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const DropdownMenuShortcut: {
    ({ className, ...props }: React$1.HTMLAttributes<HTMLSpanElement>): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>(props: react_hook_form.FormProviderProps<TFieldValues, TContext, TTransformedValues>) => React$1.JSX.Element;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => react_jsx_runtime.JSX.Element;
declare const useFormField: () => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    isValidating: boolean;
    error?: react_hook_form.FieldError;
    id: string;
    name: string;
    formItemId: string;
    formDescriptionId: string;
    formMessageId: string;
};
declare const FormItem: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
declare const FormLabel: React$1.ForwardRefExoticComponent<Omit<LabelPrimitive.LabelProps & React$1.RefAttributes<HTMLLabelElement>, "ref"> & React$1.RefAttributes<HTMLLabelElement>>;
declare const FormControl: React$1.ForwardRefExoticComponent<Omit<_radix_ui_react_slot.SlotProps & React$1.RefAttributes<HTMLElement>, "ref"> & React$1.RefAttributes<HTMLElement>>;
declare const FormDescription: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;
declare const FormMessage: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLParagraphElement> & React$1.RefAttributes<HTMLParagraphElement>>;

declare const ScrollArea: React$1.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;
declare const ScrollBar: React$1.ForwardRefExoticComponent<Omit<ScrollAreaPrimitive.ScrollAreaScrollbarProps & React$1.RefAttributes<HTMLDivElement>, "ref"> & React$1.RefAttributes<HTMLDivElement>>;

declare const toggleVariants: (props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const Toggle: React$1.ForwardRefExoticComponent<Omit<TogglePrimitive.ToggleProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & VariantProps<(props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string> & React$1.RefAttributes<HTMLButtonElement>>;

declare const ToggleGroup: React$1.ForwardRefExoticComponent<((Omit<ToggleGroupPrimitive.ToggleGroupSingleProps & React$1.RefAttributes<HTMLDivElement>, "ref"> | Omit<ToggleGroupPrimitive.ToggleGroupMultipleProps & React$1.RefAttributes<HTMLDivElement>, "ref">) & VariantProps<(props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string>) & React$1.RefAttributes<HTMLDivElement>>;
declare const ToggleGroupItem: React$1.ForwardRefExoticComponent<Omit<ToggleGroupPrimitive.ToggleGroupItemProps & React$1.RefAttributes<HTMLButtonElement>, "ref"> & VariantProps<(props?: ({
    variant?: "default" | "outline" | null | undefined;
    size?: "default" | "sm" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string> & React$1.RefAttributes<HTMLButtonElement>>;

declare const Collapsible: React$1.ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleProps & React$1.RefAttributes<HTMLDivElement>>;
declare const CollapsibleTrigger: React$1.ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleTriggerProps & React$1.RefAttributes<HTMLButtonElement>>;
declare const CollapsibleContent: React$1.ForwardRefExoticComponent<CollapsiblePrimitive.CollapsibleContentProps & React$1.RefAttributes<HTMLDivElement>>;

interface CollapsibleSectionProps {
    title: string;
    icon?: LucideIcon;
    isExpanded: boolean;
    onToggle: () => void;
    children: React.ReactNode;
    badge?: string;
    iconColor?: string;
    className?: string;
}
declare function CollapsibleSection({ title, icon: Icon, isExpanded, onToggle, children, badge, iconColor, className }: CollapsibleSectionProps): react_jsx_runtime.JSX.Element;

declare const accordionVariants: (props?: ({
    variant?: "default" | "ghost" | "separated" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AccordionItem {
    id: string;
    title: React$1.ReactNode;
    content: React$1.ReactNode;
    disabled?: boolean;
    icon?: React$1.ReactNode;
}
interface AccordionProps extends VariantProps<typeof accordionVariants> {
    items: AccordionItem[];
    type?: 'single' | 'multiple';
    defaultValue?: string | string[];
    value?: string | string[];
    onValueChange?: (value: string | string[]) => void;
    className?: string;
    collapsible?: boolean;
}
declare const Accordion: {
    ({ items, type, defaultValue, value: controlledValue, onValueChange, variant, className, collapsible, }: AccordionProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const breadcrumbVariants: (props?: ({
    variant?: "default" | "subtle" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const breadcrumbItemVariants: (props?: ({
    active?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface BreadcrumbItem {
    label: React$1.ReactNode;
    href?: string;
    icon?: React$1.ReactNode;
    onClick?: () => void;
}
interface BreadcrumbProps extends VariantProps<typeof breadcrumbVariants> {
    items: BreadcrumbItem[];
    separator?: React$1.ReactNode;
    showHomeIcon?: boolean;
    maxItems?: number;
    className?: string;
}
declare const Breadcrumb: {
    ({ items, separator, showHomeIcon, maxItems, variant, size, className, }: BreadcrumbProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

declare const paginationVariants: (props?: ({
    variant?: "default" | "compact" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
declare const paginationButtonVariants: (props?: ({
    variant?: "default" | "outline" | "ghost" | null | undefined;
    size?: "sm" | "md" | "lg" | null | undefined;
    active?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface PaginationProps extends VariantProps<typeof paginationVariants> {
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
declare const Pagination: {
    ({ currentPage, totalPages, onPageChange, showFirstLast, showPrevNext, siblingCount, boundaryCount, disabled, variant, size, buttonVariant, className, }: PaginationProps): react_jsx_runtime.JSX.Element;
    displayName: string;
};

/**
 * VisuallyHidden component
 * Hides content visually but keeps it accessible to screen readers
 * Useful for skip links, labels, and announcements
 */
declare const visuallyHiddenVariants: (props?: ({
    focusable?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface VisuallyHiddenProps extends React$1.HTMLAttributes<HTMLSpanElement>, VariantProps<typeof visuallyHiddenVariants> {
    as?: 'span' | 'div' | 'label' | 'p';
}
declare const VisuallyHidden: React$1.ForwardRefExoticComponent<VisuallyHiddenProps & React$1.RefAttributes<HTMLElement>>;

/**
 * SkipLink component
 * Allows keyboard users to skip to main content
 * Essential for WCAG compliance
 */
declare const skipLinkVariants: (props?: ({
    variant?: "default" | "outline" | "ghost" | null | undefined;
    position?: "top-left" | "top-center" | "top-right" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SkipLinkProps extends Omit<React$1.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>, VariantProps<typeof skipLinkVariants> {
    href: string;
    label?: string;
}
declare const SkipLink: React$1.ForwardRefExoticComponent<SkipLinkProps & React$1.RefAttributes<HTMLAnchorElement>>;
/**
 * SkipLinks component
 * Container for multiple skip links
 */
interface SkipLinksProps extends React$1.HTMLAttributes<HTMLDivElement> {
    links: Array<{
        href: string;
        label: string;
    }>;
    variant?: VariantProps<typeof skipLinkVariants>['variant'];
}
declare const SkipLinks: React$1.FC<SkipLinksProps>;

/**
 * FocusTrap component
 * Traps keyboard focus within a container
 * Essential for modals, dialogs, and overlays
 */
interface FocusTrapProps extends React$1.HTMLAttributes<HTMLDivElement> {
    active?: boolean;
    returnFocus?: boolean;
    children: React$1.ReactNode;
}
declare const FocusTrap: React$1.ForwardRefExoticComponent<FocusTrapProps & React$1.RefAttributes<HTMLDivElement>>;

/**
 * ColorContrastChecker Component
 *
 * Visual component to check and display WCAG color contrast compliance
 * Useful for design systems, accessibility audits, and color selection
 */
interface ColorContrastCheckerProps {
    /** Foreground color (hex) */
    foreground: string;
    /** Background color (hex) */
    background: string;
    /** Show large text compliance */
    showLargeText?: boolean;
    /** Show compliance badges */
    showBadges?: boolean;
    /** Show color swatches */
    showSwatches?: boolean;
    /** Custom className */
    className?: string;
}
declare function ColorContrastChecker({ foreground, background, showLargeText, showBadges, showSwatches, className, }: ColorContrastCheckerProps): react_jsx_runtime.JSX.Element;
declare namespace ColorContrastChecker {
    var displayName: string;
}

/**
 * Sidebar component
 * Collapsible navigation sidebar for app layouts
 */
declare const sidebarVariants: (props?: ({
    variant?: "default" | "primary" | "dark" | null | undefined;
    position?: "left" | "right" | null | undefined;
    size?: "sm" | "md" | "lg" | "full" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface SidebarProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof sidebarVariants> {
    collapsed?: boolean;
    collapsible?: boolean;
    onCollapse?: (collapsed: boolean) => void;
}
declare const Sidebar: React$1.ForwardRefExoticComponent<SidebarProps & React$1.RefAttributes<HTMLDivElement>>;
/**
 * SidebarHeader component
 */
declare const SidebarHeader: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
/**
 * SidebarContent component
 */
declare const SidebarContent: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
/**
 * SidebarFooter component
 */
declare const SidebarFooter: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
/**
 * SidebarNav component
 */
declare const SidebarNav: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLElement> & React$1.RefAttributes<HTMLElement>>;
/**
 * SidebarNavItem component
 */
interface SidebarNavItemProps extends React$1.AnchorHTMLAttributes<HTMLAnchorElement> {
    active?: boolean;
    icon?: React$1.ReactNode;
}
declare const SidebarNavItem: React$1.ForwardRefExoticComponent<SidebarNavItemProps & React$1.RefAttributes<HTMLAnchorElement>>;

/**
 * AppShell component
 * Complete application layout with header, sidebar, footer, and main content
 */
declare const appShellVariants: (props?: ({
    variant?: "default" | "dark" | "clean" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AppShellProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof appShellVariants> {
    header?: React$1.ReactNode;
    sidebar?: React$1.ReactNode;
    footer?: React$1.ReactNode;
    aside?: React$1.ReactNode;
    children: React$1.ReactNode;
}
declare const AppShell: React$1.ForwardRefExoticComponent<AppShellProps & React$1.RefAttributes<HTMLDivElement>>;
/**
 * AppHeader component
 */
declare const appHeaderVariants: (props?: ({
    variant?: "default" | "primary" | "dark" | null | undefined;
    sticky?: boolean | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AppHeaderProps extends React$1.HTMLAttributes<HTMLElement>, VariantProps<typeof appHeaderVariants> {
    logo?: React$1.ReactNode;
    nav?: React$1.ReactNode;
    actions?: React$1.ReactNode;
}
declare const AppHeader: React$1.ForwardRefExoticComponent<AppHeaderProps & React$1.RefAttributes<HTMLElement>>;
/**
 * AppFooter component
 */
declare const appFooterVariants: (props?: ({
    variant?: "default" | "dark" | "minimal" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AppFooterProps extends React$1.HTMLAttributes<HTMLElement>, VariantProps<typeof appFooterVariants> {
}
declare const AppFooter: React$1.ForwardRefExoticComponent<AppFooterProps & React$1.RefAttributes<HTMLElement>>;
/**
 * AppMain component
 */
declare const AppMain: React$1.ForwardRefExoticComponent<React$1.HTMLAttributes<HTMLDivElement> & React$1.RefAttributes<HTMLDivElement>>;
/**
 * AppAside component
 */
declare const appAsideVariants: (props?: ({
    variant?: "default" | "dark" | null | undefined;
    width?: "sm" | "md" | "lg" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface AppAsideProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof appAsideVariants> {
}
declare const AppAside: React$1.ForwardRefExoticComponent<AppAsideProps & React$1.RefAttributes<HTMLDivElement>>;

/**
 * Stepper component
 * Multi-step progress indicator for wizards and forms
 */
declare const stepperVariants: (props?: ({
    orientation?: "horizontal" | "vertical" | null | undefined;
    variant?: "default" | "pills" | "dots" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface Step {
    id: string;
    label: string;
    description?: string;
    optional?: boolean;
    icon?: React$1.ReactNode;
}
interface StepperProps extends React$1.HTMLAttributes<HTMLDivElement>, VariantProps<typeof stepperVariants> {
    steps: Step[];
    currentStep: number;
    onStepClick?: (stepIndex: number) => void;
    clickable?: boolean;
}
declare const Stepper: React$1.ForwardRefExoticComponent<StepperProps & React$1.RefAttributes<HTMLDivElement>>;

/**
 * ErrorBoundary component
 * Catches JavaScript errors anywhere in the child component tree
 */
interface ErrorBoundaryProps {
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
    onError?: (error: Error, errorInfo: React$1.ErrorInfo) => void;
    resetKeys?: Array<string | number>;
}
interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}
declare class ErrorBoundary extends React$1.Component<ErrorBoundaryProps, ErrorBoundaryState> {
    constructor(props: ErrorBoundaryProps);
    static getDerivedStateFromError(error: Error): ErrorBoundaryState;
    componentDidCatch(error: Error, errorInfo: React$1.ErrorInfo): void;
    componentDidUpdate(prevProps: ErrorBoundaryProps): void;
    reset: () => void;
    render(): string | number | boolean | Iterable<React$1.ReactNode> | react_jsx_runtime.JSX.Element | null | undefined;
}
/**
 * withErrorBoundary HOC
 * Wraps a component with an ErrorBoundary
 */
declare function withErrorBoundary<P extends object>(Component: React$1.ComponentType<P>, errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>): React$1.FC<P>;
/**
 * useErrorHandler hook
 * Allows functional components to throw errors to nearest ErrorBoundary
 */
declare function useErrorHandler(givenError?: unknown): (error: unknown) => void;

/**
 * LoadingBoundary component
 * Shows loading state while children are loading
 * Supports React Suspense
 */
interface LoadingBoundaryProps {
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
    isLoading?: boolean;
    delay?: number;
    minDuration?: number;
}
declare const LoadingBoundary: React$1.FC<LoadingBoundaryProps>;
/**
 * Skeleton component
 * Shows a loading placeholder
 */
interface SkeletonProps extends React$1.HTMLAttributes<HTMLDivElement> {
    width?: string | number;
    height?: string | number;
    circle?: boolean;
    count?: number;
}
declare const Skeleton: React$1.FC<SkeletonProps>;
/**
 * withLoadingBoundary HOC
 * Wraps a component with a LoadingBoundary
 */
declare function withLoadingBoundary<P extends object>(Component: React$1.ComponentType<P>, loadingBoundaryProps?: Omit<LoadingBoundaryProps, 'children'>): React$1.FC<P>;
/**
 * SuspenseBoundary component
 * Combines React Suspense with custom fallback
 */
interface SuspenseBoundaryProps {
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
}
declare const SuspenseBoundary: React$1.FC<SuspenseBoundaryProps>;

/**
 * FeatureFlag component
 * Conditionally renders children based on feature flags
 */
type FeatureFlags = Record<string, boolean>;
interface FeatureFlagContextValue {
    flags: FeatureFlags;
    isEnabled: (flag: string) => boolean;
    enable: (flag: string) => void;
    disable: (flag: string) => void;
    toggle: (flag: string) => void;
}
/**
 * FeatureFlagProvider component
 * Provides feature flag context to children
 */
interface FeatureFlagProviderProps {
    children: React$1.ReactNode;
    flags?: FeatureFlags;
    fallback?: React$1.ReactNode;
}
declare const FeatureFlagProvider: React$1.FC<FeatureFlagProviderProps>;
/**
 * useFeatureFlags hook
 * Access feature flags from context
 */
declare function useFeatureFlags(): FeatureFlagContextValue;
/**
 * useFeatureFlag hook
 * Check if a specific feature is enabled
 */
declare function useFeatureFlag(flag: string): boolean;
/**
 * FeatureFlag component
 * Renders children only if feature is enabled
 */
interface FeatureFlagProps {
    flag: string;
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
}
declare const FeatureFlag: React$1.FC<FeatureFlagProps>;
/**
 * FeatureFlagSwitch component
 * Renders different children based on feature flag state
 */
interface FeatureFlagSwitchProps {
    flag: string;
    on: React$1.ReactNode;
    off: React$1.ReactNode;
}
declare const FeatureFlagSwitch: React$1.FC<FeatureFlagSwitchProps>;
/**
 * withFeatureFlag HOC
 * Wraps a component with feature flag check
 */
declare function withFeatureFlag<P extends object>(Component: React$1.ComponentType<P>, flag: string, fallback?: React$1.ReactNode): React$1.FC<P>;
/**
 * MultiFeatureFlag component
 * Renders children only if ALL specified features are enabled
 */
interface MultiFeatureFlagProps {
    flags: string[];
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
    requireAll?: boolean;
}
declare const MultiFeatureFlag: React$1.FC<MultiFeatureFlagProps>;

/**
 * Role and Permission Guard components
 * Controls access based on user roles and permissions
 */
type Role = string;
type Permission = string;
interface User {
    id: string;
    roles: Role[];
    permissions: Permission[];
}
interface AuthContextValue {
    user: User | null;
    hasRole: (role: Role | Role[]) => boolean;
    hasPermission: (permission: Permission | Permission[]) => boolean;
    hasAnyRole: (roles: Role[]) => boolean;
    hasAllRoles: (roles: Role[]) => boolean;
    hasAnyPermission: (permissions: Permission[]) => boolean;
    hasAllPermissions: (permissions: Permission[]) => boolean;
}
/**
 * AuthProvider component
 * Provides authentication context to children
 */
interface AuthProviderProps {
    children: React$1.ReactNode;
    user: User | null;
}
declare const AuthProvider: React$1.FC<AuthProviderProps>;
/**
 * useAuth hook
 * Access authentication context
 */
declare function useAuth(): AuthContextValue;
/**
 * RoleGuard component
 * Renders children only if user has the required role(s)
 */
interface RoleGuardProps {
    role?: Role | Role[];
    anyRole?: Role[];
    allRoles?: Role[];
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
}
declare const RoleGuard: React$1.FC<RoleGuardProps>;
/**
 * PermissionGate component
 * Renders children only if user has the required permission(s)
 */
interface PermissionGateProps {
    permission?: Permission | Permission[];
    anyPermission?: Permission[];
    allPermissions?: Permission[];
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
}
declare const PermissionGate: React$1.FC<PermissionGateProps>;
/**
 * withRoleGuard HOC
 * Wraps a component with role-based access control
 */
declare function withRoleGuard<P extends object>(Component: React$1.ComponentType<P>, roles: Role | Role[], fallback?: React$1.ReactNode): React$1.FC<P>;
/**
 * withPermissionGate HOC
 * Wraps a component with permission-based access control
 */
declare function withPermissionGate<P extends object>(Component: React$1.ComponentType<P>, permissions: Permission | Permission[], fallback?: React$1.ReactNode): React$1.FC<P>;
/**
 * Restricted component
 * Combines role and permission checks
 */
interface RestrictedProps {
    roles?: Role | Role[];
    permissions?: Permission | Permission[];
    requireAll?: boolean;
    children: React$1.ReactNode;
    fallback?: React$1.ReactNode;
}
declare const Restricted: React$1.FC<RestrictedProps>;

/**
 * Collapse component
 * Animated height transition for showing/hiding content
 */
interface CollapseProps extends React$1.HTMLAttributes<HTMLDivElement> {
    open: boolean;
    duration?: number;
    onOpenChange?: (open: boolean) => void;
    children: React$1.ReactNode;
}
declare const Collapse: React$1.ForwardRefExoticComponent<CollapseProps & React$1.RefAttributes<HTMLDivElement>>;

interface SearchSuggestion {
    text: string;
    category: 'entity' | 'filter' | 'recent' | 'popular';
    icon?: string;
    count?: number;
    type?: string;
}
interface IntelligentSearchProps {
    placeholder?: string;
    suggestions?: SearchSuggestion[];
    recentSearches?: string[];
    popularSearches?: string[];
    shortcuts?: Array<{
        label: string;
        query: string;
    }>;
    onSearch: (query: string) => void;
    onSuggestionClick?: (suggestion: SearchSuggestion) => void;
    className?: string;
}
declare function IntelligentSearch({ placeholder, suggestions, recentSearches, popularSearches, shortcuts, onSearch, onSuggestionClick, className, }: IntelligentSearchProps): react_jsx_runtime.JSX.Element;
declare namespace IntelligentSearch {
    var displayName: string;
}

interface NavModule {
    id: string;
    label: string;
    icon: React__default.ComponentType<{
        className?: string;
    }>;
    path?: string;
    subItems?: {
        id: string;
        label: string;
        path: string;
    }[];
}
interface UniformShellProps {
    /** Navigation modules */
    modules: NavModule[];
    /** Active module ID */
    activeModule?: string;
    /** Active sub-item ID */
    activeSubItem?: string;
    /** Tenant/Dealership name */
    tenant?: string;
    /** User name */
    user?: string;
    /** User avatar URL */
    userAvatar?: string;
    /** Notification count */
    notifications?: number;
    /** Current theme */
    theme?: 'light' | 'dark' | 'system';
    /** On theme toggle */
    onThemeToggle?: () => void;
    /** On navigation click */
    onNavigate?: (moduleId: string, subItemId?: string) => void;
    /** On search */
    onSearch?: (query: string) => void;
    /** Search suggestions */
    searchSuggestions?: SearchSuggestion[];
    /** Recent searches */
    recentSearches?: string[];
    /** Popular searches */
    popularSearches?: string[];
    /** Search shortcuts */
    searchShortcuts?: Array<{
        label: string;
        query: string;
    }>;
    /** On tenant switcher click */
    onTenantSwitch?: () => void;
    /** On user menu click */
    onUserMenuClick?: () => void;
    /** On logout click */
    onLogout?: () => void;
    /** On settings click */
    onSettings?: () => void;
    /** Content to render */
    children: React__default.ReactNode;
    /** Custom className */
    className?: string;
}
declare function UniformShell({ modules, activeModule, activeSubItem, tenant, user, userAvatar, notifications, theme, onThemeToggle, onNavigate, onSearch, searchSuggestions, recentSearches, popularSearches, searchShortcuts, onTenantSwitch, onUserMenuClick, onLogout, onSettings, children, className, }: UniformShellProps): react_jsx_runtime.JSX.Element;
declare namespace UniformShell {
    var displayName: string;
}

interface Tenant {
    id: string;
    name: string;
    logo?: string;
}
interface TenantSwitcherProps {
    isOpen: boolean;
    onClose: () => void;
    tenants: Tenant[];
    currentTenantId: string;
    onSwitch: (tenantId: string) => void;
}
declare function TenantSwitcher({ isOpen, onClose, tenants, currentTenantId, onSwitch, }: TenantSwitcherProps): react_jsx_runtime.JSX.Element;
declare namespace TenantSwitcher {
    var displayName: string;
}

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

type ShowroomManagerLayoutProps = {
    className?: string;
    left: React$1.ReactNode;
    right: React$1.ReactNode;
    mobileTabs?: React$1.ReactNode;
};
declare function ShowroomManagerLayout({ left, right, mobileTabs, className, }: ShowroomManagerLayoutProps): react_jsx_runtime.JSX.Element;

type VehicleSummary = {
    id: string;
    stock?: string;
    vin?: string;
    year?: number;
    make?: string;
    model?: string;
    trim?: string;
    miles?: number;
    price?: number;
    daysInStock?: number;
    demandTag?: 'High' | 'Normal' | 'Low';
    acv?: number;
    grossHint?: number;
};
type VehicleCardProps = {
    vehicle?: VehicleSummary;
    loading?: boolean;
    onOpenQuickView?: (id: string) => void;
    className?: string;
};
declare function VehicleCard({ vehicle, loading, onOpenQuickView, className, }: VehicleCardProps): react_jsx_runtime.JSX.Element | null;

type CustomerSummary = {
    id: string;
    name: string;
    phone?: string;
    email?: string;
    score?: number;
    lastTouch?: string;
    privacy?: {
        hasPII?: boolean;
    };
};
type CustomerCardProps = {
    customer?: CustomerSummary;
    loading?: boolean;
    className?: string;
};
declare function CustomerCard({ customer, loading, className, }: CustomerCardProps): react_jsx_runtime.JSX.Element | null;

/**
 * QuickView Component
 *
 * Hook-in point for quick view functionality.
 * The app will attach content to a sheet/modal via portal or route.
 * This keeps the UI library pure and allows apps to control the detail content.
 */
type QuickViewProps = {
    id: string;
    type?: 'vehicle' | 'customer' | 'deal' | 'lead';
    className?: string;
};
declare function QuickView({ id, type, className }: QuickViewProps): react_jsx_runtime.JSX.Element;

declare const insightCardVariants: (props?: ({
    severity?: "normal" | "critical" | "high" | "low" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface InsightCardProps extends VariantProps<typeof insightCardVariants> {
    insight: Insight;
    onAction?: (action: string, params?: Record<string, any>) => void;
    className?: string;
}
declare function InsightCard({ insight, severity, onAction, className }: InsightCardProps): react_jsx_runtime.JSX.Element;

interface InsightListProps {
    insights: Insight[];
    onAction?: (action: string, params?: Record<string, any>) => void;
    emptyMessage?: string;
}
declare function InsightList({ insights, onAction, emptyMessage }: InsightListProps): react_jsx_runtime.JSX.Element;

declare const statusPulseVariants: (props?: ({
    status?: "success" | "normal" | "critical" | "high" | "low" | null | undefined;
} & class_variance_authority_types.ClassProp) | undefined) => string;
interface StatusPulseProps extends VariantProps<typeof statusPulseVariants> {
    label: string;
    count?: number;
    className?: string;
}
declare function StatusPulse({ status, label, count, className }: StatusPulseProps): react_jsx_runtime.JSX.Element;

/**
 * Breakpoint constants matching design system
 */
declare const BREAKPOINTS$1: {
    readonly mobile: 0;
    readonly tablet: 768;
    readonly desktop: 1024;
    readonly wide: 1280;
    readonly ultrawide: 1920;
};
type Breakpoint$1 = keyof typeof BREAKPOINTS$1;
/**
 * Hook to detect if the current viewport is mobile
 * @param breakpoint - The breakpoint to check against (default: 'tablet')
 * @returns true if viewport width is below the breakpoint
 *
 * @example
 * const isMobile = useMobile(); // true if width < 768px
 * const isSmallScreen = useMobile('desktop'); // true if width < 1024px
 */
declare function useMobile(breakpoint?: Breakpoint$1): boolean;
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
declare function useResponsiveValue<T>(values: Partial<Record<Breakpoint$1, T>>): T | undefined;

/**
 * Hook to manage theme state and changes
 * @returns Object with current theme, setter, and theme info
 *
 * @example
 * const { theme, setTheme, isDark } = useTheme();
 */
declare function useTheme(): {
    theme: ThemeName;
    setTheme: (newTheme: ThemeName) => void;
    toggleTheme: () => void;
    systemTheme: ThemeName;
    isDark: boolean;
    isLight: boolean;
    isHighContrast: boolean;
};
/**
 * Hook to detect if user prefers dark mode
 * @returns true if dark mode is preferred
 */
declare function usePrefersDarkMode(): boolean;
/**
 * Hook to detect if user prefers reduced motion
 * @returns true if reduced motion is preferred
 */
declare function usePrefersReducedMotion(): boolean;

/**
 * Color Accessibility Utilities
 *
 * Provides functions to check and ensure WCAG 2.1 color contrast compliance
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 *
 * WCAG Standards:
 * - Level AA: 4.5:1 for normal text, 3:1 for large text
 * - Level AAA: 7:1 for normal text, 4.5:1 for large text
 */
interface ContrastResult {
    ratio: number;
    AA: {
        normal: boolean;
        large: boolean;
    };
    AAA: {
        normal: boolean;
        large: boolean;
    };
}
/**
 * Calculate contrast ratio between two colors
 * https://www.w3.org/WAI/GL/wiki/Contrast_ratio
 */
declare function getContrastRatio(foreground: string, background: string): number;
/**
 * Check if color combination meets WCAG standards
 */
declare function checkContrast(foreground: string, background: string): ContrastResult;
/**
 * Get suggested foreground color (black or white) for optimal contrast
 */
declare function getSuggestedForeground(background: string): '#000000' | '#FFFFFF';
/**
 * Check if a color is "dark" (luminance < 0.5)
 */
declare function isDark(color: string): boolean;
/**
 * Get WCAG compliance level for a contrast ratio
 */
declare function getComplianceLevel(ratio: number, isLargeText?: boolean): 'AAA' | 'AA' | 'Fail';

/**
 * useColorContrast Hook
 *
 * React hook for checking color contrast compliance
 * Useful for dynamic color selection and accessibility validation
 */

interface UseColorContrastOptions {
    /** Foreground color (hex) */
    foreground: string;
    /** Background color (hex) */
    background: string;
    /** Minimum contrast ratio required (default: 4.5 for AA normal text) */
    minRatio?: number;
}
interface UseColorContrastReturn {
    /** Contrast check result */
    result: ContrastResult;
    /** Whether the combination meets the minimum ratio */
    isAccessible: boolean;
    /** Suggested foreground color for optimal contrast */
    suggestedForeground: '#000000' | '#FFFFFF';
    /** Whether the background is dark */
    isDarkBackground: boolean;
}
/**
 * Hook to check color contrast and accessibility compliance
 */
declare function useColorContrast({ foreground, background, minRatio, }: UseColorContrastOptions): UseColorContrastReturn;
/**
 * Hook to get accessible foreground color for a given background
 */
declare function useAccessibleForeground(background: string): '#000000' | '#FFFFFF';

/**
 * useBreakpoint Hook
 *
 * Core hook for responsive layouts - the "translation mechanism"
 * Tells components whether they're on mobile, tablet, or desktop
 */
type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
declare const BREAKPOINTS: {
    readonly xs: 0;
    readonly sm: 640;
    readonly md: 768;
    readonly lg: 1024;
    readonly xl: 1280;
    readonly '2xl': 1536;
};
/**
 * Hook to get current breakpoint
 * Updates when window resizes
 *
 * @example
 * const breakpoint = useBreakpoint();
 * if (breakpoint === 'xs') {
 *   return <MobileLayout />;
 * }
 * return <DesktopLayout />;
 */
declare function useBreakpoint(): Breakpoint;
/**
 * Hook to check if current breakpoint matches or exceeds target
 *
 * @example
 * const isDesktop = useBreakpointUp('lg');
 * // true if window width >= 1024px
 */
declare function useBreakpointUp(target: Breakpoint): boolean;
/**
 * Hook to check if current breakpoint is below target
 *
 * @example
 * const isMobile = useBreakpointDown('sm');
 * // true if window width < 640px
 */
declare function useBreakpointDown(target: Breakpoint): boolean;
/**
 * Hook to check if we're on a mobile device
 *
 * @example
 * const isMobile = useMobileBreakpoint();
 * // true if breakpoint === 'xs'
 */
declare function useMobileBreakpoint(): boolean;
/**
 * Hook to check if we're on a tablet
 *
 * @example
 * const isTablet = useTabletBreakpoint();
 * // true if breakpoint === 'sm' or 'md'
 */
declare function useTabletBreakpoint(): boolean;
/**
 * Hook to check if we're on desktop
 *
 * @example
 * const isDesktop = useDesktopBreakpoint();
 * // true if breakpoint >= 'lg'
 */
declare function useDesktopBreakpoint(): boolean;

/**
 * Merge Tailwind CSS classes with proper precedence
 */
declare function cn(...inputs: ClassValue[]): string;

/**
 * @repo/ui - AutolytiQ Component Library
 * A comprehensive React component library built on design tokens
 */

declare const styles = "@repo/ui/styles.css";

export { Accordion, type AccordionItem, type AccordionProps, Alert, AlertDescription, AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogOverlay, AlertDialogPortal, AlertDialogTitle, AlertDialogTrigger, type AlertProps, AlertTitle, AppAside, type AppAsideProps, AppFooter, type AppFooterProps, AppHeader, type AppHeaderProps, AppMain, AppShell, type AppShellProps, AuthProvider, type AuthProviderProps, Avatar, AvatarFallback, AvatarImage, type AvatarProps, Badge, type BadgeProps, Box, type BoxProps, Breadcrumb, type BreadcrumbItem, type BreadcrumbProps, type Breakpoint, Button, type ButtonProps, Calendar, type CalendarProps, Card, CardContent, CardDescription, CardFooter, CardHeader, type CardHeaderProps, type CardProps, CardShell, type CardShellProps, CardTitle, Checkbox, type CheckboxProps, Collapse, type CollapseProps, Collapsible, CollapsibleContent, CollapsibleSection, CollapsibleTrigger, ColorContrastChecker, type ColorContrastCheckerProps, Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut, type ContrastResult, CustomerCard, type CustomerCardProps, type CustomerSummary, Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogOverlay, DialogPortal, DialogTitle, DialogTrigger, Dropdown, type DropdownItem, DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, type DropdownProps, EmptyState, type EmptyStateProps, ErrorBoundary, type ErrorBoundaryProps, FeatureFlag, type FeatureFlagProps, FeatureFlagProvider, type FeatureFlagProviderProps, FeatureFlagSwitch, type FeatureFlagSwitchProps, FocusStudioLayout, type FocusStudioLayoutProps, FocusTrap, type FocusTrapProps, Form, FormControl, FormDescription, FormField$1 as FormField, type FormFieldProps, FormItem, FormLabel, FormMessage, FullDensityLayout, type FullDensityLayoutProps, Inline, type InlineProps, Input, type InputProps, InsightCard, type InsightCardProps, InsightList, type InsightListProps, IntelligentSearch, type IntelligentSearchProps, Label, type LabelProps, Lane, LaneBoard, type LaneBoardProps, LaneCard, LaneCardBadge, type LaneCardBadgeProps, LaneCardContent, LaneCardDescription, LaneCardFooter, LaneCardHeader, type LaneCardProps, LaneCardTitle, type LaneProps, ListCard, type ListCardProps, ListDetailLayout, type ListDetailLayoutProps, type ListItem, LoadingBoundary, type LoadingBoundaryProps, Skeleton as LoadingSkeleton, MetricCard, type MetricCardProps, MobileCard, type MobileCardProps, MobileListItem, type MobileListItemProps, Modal, type ModalProps, MultiFeatureFlag, type MultiFeatureFlagProps, type NavModule, type Note, type NoteContext, Notes, type NotesProps, PageContainer, type PageContainerProps, PageHeader, type PageHeaderProps, Pagination, type PaginationProps, type Permission, PermissionGate, type PermissionGateProps, Popover, PopoverAnchor, PopoverContent, type PopoverProps, PopoverTrigger, Progress, type ProgressProps, QuickAction, type QuickActionProps, QuickView, type QuickViewProps, FormField as RHFFormField, Radio, RadioGroup, RadioGroupItem, type RadioGroupProps, type RadioProps, PopoverRoot as RadixPopover, SelectRoot as RadixSelect, TooltipRoot as RadixTooltip, ResponsiveActions, type ResponsiveActionsProps, ResponsiveButton, type ResponsiveButtonProps, ResponsiveGrid, type ResponsiveGridProps, Restricted, type RestrictedProps, type Role, RoleGuard, type RoleGuardProps, ScrollArea, ScrollBar, SearchInput, type SearchInputProps, type SearchSuggestion, Select, SelectContent, SelectGroup, SelectItem, SelectLabel, type SelectProps, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger, SelectValue, Separator, Sheet, SheetClose, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetOverlay, SheetPortal, type SheetProps, SheetTitle, SheetTrigger, ShowroomManagerLayout, type ShowroomManagerLayoutProps, Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarNav, SidebarNavItem, type SidebarProps, Skeleton$1 as Skeleton, type SkeletonProps$1 as SkeletonProps, SkipLink, type SkipLinkProps, SkipLinks, type SkipLinksProps, Slider, Stack, type StackProps, StatCard, type StatCardProps, StatusPulse, type StatusPulseProps, type Step, Stepper, type StepperProps, Surface, type SurfaceProps, SuspenseBoundary, type SuspenseBoundaryProps, Switch, type SwitchProps, Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, type TableProps, TableRow, Tabs, TabsContent, TabsList, type TabsProps, TabsTrigger, type Tenant, TenantSwitcher, type TenantSwitcherProps, Text, type TextProps, Textarea, type TextareaProps, Toast, type ToastProps, ToastProvider, Toaster, Toggle, ToggleGroup, ToggleGroupItem, Tooltip, TooltipContent, type TooltipProps, TooltipProvider, TooltipTrigger, TrendCard, type TrendCardProps, type TrendDataPoint, BREAKPOINTS as UI_BREAKPOINTS, UniformShell, type UniformShellProps, type UseColorContrastOptions, type UseColorContrastReturn, type User, VehicleCard, type VehicleCardProps, type VehicleSummary, VisuallyHidden, type VisuallyHiddenProps, accordionVariants, alertVariants, avatarVariants, badgeVariants, boxVariants, breadcrumbItemVariants, breadcrumbVariants, buttonVariants, cardShellVariants, cardVariants, checkContrast, checkboxVariants, cn, dropdownContentVariants, dropdownItemVariants, formDescriptionVariants, formFieldVariants, getComplianceLevel, getContrastRatio, getSuggestedForeground, inlineVariants, inputVariants, isDark, labelVariants, metricVariants, modalContentVariants, modalOverlayVariants, notesVariants, paginationButtonVariants, paginationVariants, popoverArrowVariants, popoverContentVariants, progressBarVariants, progressVariants, radioVariants, selectVariants, sheetContentVariants, sheetOverlayVariants, skeletonVariants, stackVariants, statCardVariants, styles, surfaceVariants, switchVariants, tableVariants, textVariants, textareaVariants, toastVariants, toggleVariants, tooltipVariants, useAccessibleForeground, useAuth, useBreakpoint, useBreakpointDown, useBreakpointUp, useColorContrast, useDesktopBreakpoint, useErrorHandler, useFeatureFlag, useFeatureFlags, useFormField, useMediaQuery, useMobile, useMobileBreakpoint, usePrefersDarkMode, usePrefersReducedMotion, useResponsiveValue, useTabletBreakpoint, useTheme, useToast, useTouchDevice, useViewport, withErrorBoundary, withFeatureFlag, withLoadingBoundary, withPermissionGate, withRoleGuard };
