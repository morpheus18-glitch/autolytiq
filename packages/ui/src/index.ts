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

// Accessibility Components
export { VisuallyHidden, type VisuallyHiddenProps } from './components/VisuallyHidden.js';
export { SkipLink, SkipLinks, type SkipLinkProps, type SkipLinksProps } from './components/SkipLink.js';
export { FocusTrap, type FocusTrapProps } from './components/FocusTrap.js';
export { ColorContrastChecker, type ColorContrastCheckerProps } from './components/ColorContrastChecker.js';

// Layout & Navigation Components
export {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavItem,
  type SidebarProps
} from './components/Sidebar.js';
export {
  AppShell,
  AppHeader,
  AppFooter,
  AppMain,
  AppAside,
  type AppShellProps,
  type AppHeaderProps,
  type AppFooterProps,
  type AppAsideProps
} from './components/AppShell.js';
export { Stepper, type StepperProps, type Step } from './components/Stepper.js';

// Quality Gate Components
export {
  ErrorBoundary,
  withErrorBoundary,
  useErrorHandler,
  type ErrorBoundaryProps
} from './components/ErrorBoundary.js';
export {
  LoadingBoundary,
  Skeleton as LoadingSkeleton,
  SuspenseBoundary,
  withLoadingBoundary,
  type LoadingBoundaryProps,
  type SuspenseBoundaryProps
} from './components/LoadingBoundary.js';
export {
  FeatureFlag,
  FeatureFlagProvider,
  FeatureFlagSwitch,
  MultiFeatureFlag,
  useFeatureFlags,
  useFeatureFlag,
  withFeatureFlag,
  type FeatureFlagProps,
  type FeatureFlagProviderProps,
  type FeatureFlagSwitchProps,
  type MultiFeatureFlagProps
} from './components/FeatureFlag.js';

// Role & Permission Components
export {
  RoleGuard,
  PermissionGate,
  Restricted,
  AuthProvider,
  useAuth,
  withRoleGuard,
  withPermissionGate,
  type RoleGuardProps,
  type PermissionGateProps,
  type RestrictedProps,
  type AuthProviderProps,
  type User,
  type Role,
  type Permission
} from './components/RoleGuard.js';

// Motion Components
export { Collapse, type CollapseProps } from './components/Collapse.js';

// New Architecture Components
export {
  UniformShell,
  type UniformShellProps,
  type NavModule,
} from './components/UniformShell.js';

// Layout Templates
export { ListDetailLayout, type ListDetailLayoutProps } from './layouts/ListDetailLayout.js';
export { FullDensityLayout, type FullDensityLayoutProps } from './layouts/FullDensityLayout.js';
export { FocusStudioLayout, type FocusStudioLayoutProps } from './layouts/FocusStudioLayout.js';

// Hooks (Legacy - will be deprecated)
export {
  useMobile,
  useViewport,
  useMediaQuery,
  useTouchDevice,
  useResponsiveValue,
} from './hooks/useMobile.js';

export {
  useTheme,
  usePrefersDarkMode,
  usePrefersReducedMotion,
} from './hooks/useTheme.js';

export {
  useColorContrast,
  useAccessibleForeground,
  type UseColorContrastOptions,
  type UseColorContrastReturn,
} from './hooks/useColorContrast.js';

export {
  useBreakpoint,
  useBreakpointUp,
  useBreakpointDown,
  useMobileBreakpoint,
  useTabletBreakpoint,
  useDesktopBreakpoint,
  BREAKPOINTS as UI_BREAKPOINTS,
  type Breakpoint,
} from './hooks/useBreakpoint.js';

// Utilities
export { cn } from './utils/cn.js';
export {
  getContrastRatio,
  checkContrast,
  getSuggestedForeground,
  isDark,
  getComplianceLevel,
  type ContrastResult,
} from './utils/colorAccessibility.js';

// Import styles (consumers should import this in their app)
export const styles = '@repo/ui/styles.css';
