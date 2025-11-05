/**
 * @repo/ui - AutolytiQ Component Library
 * A comprehensive React component library built on design tokens
 */

// Components
export { Button, buttonVariants, type ButtonProps } from './components/Button.js';
export { Input, inputVariants, type InputProps } from './components/Input.js';
export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  cardVariants,
  type CardProps,
} from './components/Card.js';
export { Badge, badgeVariants, type BadgeProps } from './components/Badge.js';
export { PageHeader, type PageHeaderProps } from './components/PageHeader.js';
export { StatCard, statCardVariants, type StatCardProps } from './components/StatCard.js';
export { SearchInput, type SearchInputProps } from './components/SearchInput.js';
export { Avatar, avatarVariants, type AvatarProps } from './components/Avatar.js';
export { Skeleton, skeletonVariants, type SkeletonProps } from './components/Skeleton.js';
export { Alert, alertVariants, type AlertProps } from './components/Alert.js';
export { Tabs, TabsList, TabsTrigger, TabsContent, type TabsProps } from './components/Tabs.js';
export { EmptyState, type EmptyStateProps } from './components/EmptyState.js';
export { QuickAction, type QuickActionProps } from './components/QuickAction.js';
export { Progress, progressVariants, progressBarVariants, type ProgressProps } from './components/Progress.js';

// Tier 1: Form Components
export { Select, selectVariants, type SelectProps } from './components/Select.js';
export { Checkbox, checkboxVariants, type CheckboxProps } from './components/Checkbox.js';
export { Radio, RadioGroup, radioVariants, type RadioProps, type RadioGroupProps } from './components/Radio.js';
export { Switch, switchVariants, type SwitchProps } from './components/Switch.js';
export { Label, labelVariants, type LabelProps } from './components/Label.js';
export { FormField, formFieldVariants, formDescriptionVariants, type FormFieldProps } from './components/FormField.js';

// Tier 2: Data Display Components
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
  type TableProps,
} from './components/Table.js';
export { Tooltip, tooltipVariants, type TooltipProps } from './components/Tooltip.js';

// Tier 3: Overlay Components
export { Modal, modalOverlayVariants, modalContentVariants, type ModalProps } from './components/Modal.js';
export { Dropdown, dropdownContentVariants, dropdownItemVariants, type DropdownProps, type DropdownItem } from './components/Dropdown.js';
export { Popover, popoverContentVariants, popoverArrowVariants, type PopoverProps } from './components/Popover.js';
export { Sheet, sheetOverlayVariants, sheetContentVariants, type SheetProps } from './components/Sheet.js';
export { Toast, ToastProvider, useToast, toastVariants, type ToastProps } from './components/Toast.js';

// Tier 4: Navigation Components
export { Accordion, accordionVariants, type AccordionProps, type AccordionItem } from './components/Accordion.js';
export { Breadcrumb, breadcrumbVariants, breadcrumbItemVariants, type BreadcrumbProps, type BreadcrumbItem } from './components/Breadcrumb.js';
export { Pagination, paginationVariants, paginationButtonVariants, type PaginationProps } from './components/Pagination.js';

// Hooks
export {
  useMobile,
  useBreakpoint,
  useViewport,
  useMediaQuery,
  useTouchDevice,
  useResponsiveValue,
  BREAKPOINTS,
  type Breakpoint,
} from './hooks/useMobile.js';

export {
  useTheme,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from './hooks/useTheme.js';

// Utilities
export { cn } from './utils/cn.js';

// Import styles (consumers should import this in their app)
export const styles = '@repo/ui/styles.css';
