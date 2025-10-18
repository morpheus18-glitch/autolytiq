import { Flame, ThermometerSun, Snowflake } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LeadScoreBadgeProps {
  score: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

function getScoreVariant(score: number) {
  if (score >= 85) {
    return {
      label: 'Hot',
      icon: Flame,
      wrapper: 'bg-red-100 text-red-700 border-red-200',
    } as const;
  }

  if (score >= 60) {
    return {
      label: 'Warm',
      icon: ThermometerSun,
      wrapper: 'bg-orange-100 text-orange-700 border-orange-200',
    } as const;
  }

  return {
    label: 'Cold',
    icon: Snowflake,
    wrapper: 'bg-sky-100 text-sky-700 border-sky-200',
  } as const;
}

export function LeadScoreBadge({ score, className, size = 'md' }: LeadScoreBadgeProps) {
  const variant = getScoreVariant(score);
  const Icon = variant.icon;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-sm px-2.5 py-1 gap-1.5',
    lg: 'text-base px-3 py-1.5 gap-2',
  }[size];

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium tracking-tight transition-colors',
        variant.wrapper,
        sizeClasses,
        className,
      )}
    >
      <Icon className={cn('h-4 w-4', size === 'lg' && 'h-5 w-5')} />
      <span>{variant.label}</span>
      <span className="font-semibold">{Math.round(score)}</span>
    </span>
  );
}

export default LeadScoreBadge;
