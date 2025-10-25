import type { DealTimelineEvent } from '@/features/desking/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { CheckCircle2, Clock3, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface DealTimelineTrackerProps {
  events: DealTimelineEvent[];
}

export function DealTimelineTracker({ events }: DealTimelineTrackerProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Deal Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <ol className="relative border-l border-border/60 pl-6">
          {events.map(event => {
            const icon =
              event.status === 'completed'
                ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                : event.status === 'pending'
                  ? <Clock3 className="h-5 w-5 text-primary" />
                  : <Circle className="h-5 w-5 text-muted-foreground" />;

            return (
              <li key={event.id} className="mb-6 last:mb-0">
                <div className="absolute -left-3 flex h-6 w-6 items-center justify-center rounded-full bg-background">
                  {icon}
                </div>
                <div className={cn('rounded-lg border border-border/70 bg-muted/30 p-4', event.status === 'pending' && 'border-primary/80 bg-primary/5')}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-foreground">{event.label}</p>
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{format(new Date(event.timestamp), 'PPp')}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">{event.by}</p>
                </div>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}

export default DealTimelineTracker;
