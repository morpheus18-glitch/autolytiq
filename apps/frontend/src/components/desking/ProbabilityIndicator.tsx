import type { CSSProperties } from 'react';
import { TrendingDown, TrendingUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProbabilityIndicatorProps {
  value: number; // 0-1
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  trend?: 'up' | 'down' | 'flat';
  className?: string;
}

const sizeMap: Record<NonNullable<ProbabilityIndicatorProps['size']>, string> = {
  sm: 'h-14 w-14 text-xs',
  md: 'h-20 w-20 text-sm',
  lg: 'h-28 w-28 text-base',
};

function resolveColor(value: number) {
  if (value >= 0.8) return '#16a34a';
  if (value >= 0.6) return '#0ea5e9';
  if (value >= 0.4) return '#f59e0b';
  return '#ef4444';
}

export function ProbabilityIndicator({ value, label, size = 'md', trend = 'flat', className }: ProbabilityIndicatorProps) {
  const percentage = Math.max(0, Math.min(100, Math.round(value * 100)));
  const color = resolveColor(value);
  const indicatorStyle: CSSProperties = {
    background: `conic-gradient(${color} ${percentage}%, rgba(148, 163, 184, 0.2) ${percentage}% 100%)`,
  };

  const trendIcon =
    trend === 'up'
      ? <TrendingUp className="h-4 w-4 text-emerald-500" />
      : trend === 'down'
        ? <TrendingDown className="h-4 w-4 text-rose-500" />
        : <Minus className="h-4 w-4 text-slate-400" />;

  return (
    <div className={cn('flex flex-col items-center gap-2', className)}>
      <div
        className={cn('relative flex items-center justify-center rounded-full bg-slate-200/30 p-[3px]', sizeMap[size])}
        style={indicatorStyle}
      >
        <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-background text-foreground">
          <span className="text-lg font-semibold">{percentage}%</span>
          {label && <span className="text-xs text-muted-foreground">{label}</span>}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        {trendIcon}
        <span>{trend === 'up' ? 'Improving' : trend === 'down' ? 'Softening' : 'Steady'}</span>
      </div>
    </div>
  );
}

export default ProbabilityIndicator;
