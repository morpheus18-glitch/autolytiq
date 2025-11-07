import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';

interface AIInsightPanelProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  badgeText?: string;
  badgeTone?: 'primary' | 'accent' | 'neutral';
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
}

const badgeToneMap: Record<NonNullable<AIInsightPanelProps['badgeTone']>, string> = {
  primary: 'bg-primary/10 text-primary border border-primary/20',
  accent: 'bg-accent/10 text-accent border border-accent/20',
  neutral: 'bg-muted text-muted-foreground border border-border/70',
};

export function AIInsightPanel({
  title,
  description,
  icon,
  badgeText,
  badgeTone = 'primary',
  actions,
  children,
  className,
}: AIInsightPanelProps) {
  return (
    <Card className={cn('shadow-sm border-border/60 bg-white/70 dark:bg-slate-900/60 backdrop-blur', className)}>
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {icon && <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">{icon}</span>}
            <div>
              <CardTitle className="text-base font-semibold text-foreground">{title}</CardTitle>
              {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {badgeText && (
              <Badge className={cn('rounded-full px-3 py-1 text-xs font-medium', badgeToneMap[badgeTone])}>
                {badgeText}
              </Badge>
            )}
            {actions}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        {children}
      </CardContent>
    </Card>
  );
}

export default AIInsightPanel;
