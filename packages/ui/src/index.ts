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
