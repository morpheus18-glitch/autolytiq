/**
 * Card Patterns - Dashboard card components
 *
 * Pre-built card patterns for common dashboard use cases.
 * All cards are built on CardShell with consistent accessibility and loading states.
 */

export {
  CardShell,
  CardHeader,
  cardShellVariants,
  type CardShellProps,
  type CardHeaderProps,
} from './CardShell.js';

export {
  MetricCard,
  metricVariants,
  type MetricCardProps,
} from './MetricCard.js';

export {
  ListCard,
  type ListCardProps,
  type ListItem,
} from './ListCard.js';

export {
  TrendCard,
  type TrendCardProps,
  type TrendDataPoint,
} from './TrendCard.js';
