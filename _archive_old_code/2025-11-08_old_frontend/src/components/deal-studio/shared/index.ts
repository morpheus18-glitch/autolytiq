/**
 * Deal Studio Shared Components
 *
 * Centralized export for all shared Deal Studio components
 * Used by both desktop and mobile layouts
 */

export { LivePaymentDisplay } from './LivePaymentDisplay';
export type { LivePaymentDisplayProps } from './LivePaymentDisplay';

export { DealSlider, formatCurrency, formatPercentage } from './DealSlider';
export type { DealSliderProps } from './DealSlider';

export { ProfitBadge, ProfitMeter, ProfitBreakdown } from './ProfitBadge';
export type { ProfitBadgeProps, ProfitMeterProps, ProfitBreakdownProps } from './ProfitBadge';

export { AICoachCard } from './AICoachCard';
export type { AICoachCardProps } from './AICoachCard';

export { DealStructureSummary } from './DealStructureSummary';
export type { DealStructureSummaryProps } from './DealStructureSummary';

export { FIProductSelector, defaultFIProducts } from './FIProductSelector';
export type { FIProductSelectorProps, FIProduct } from './FIProductSelector';
