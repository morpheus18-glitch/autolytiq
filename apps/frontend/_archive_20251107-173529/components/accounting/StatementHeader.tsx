import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { Button } from '@repo/ui';
import { Calendar } from '@repo/ui';
import { cn } from '@/lib/utils';
import { useMemo } from 'react';

interface StatementHeaderProps {
  title: string;
  startDate?: Date;
  endDate?: Date;
  onRangeChange?: (range: { startDate: Date; endDate: Date }) => void;
  actions?: React.ReactNode;
}

export function StatementHeader({ title, startDate, endDate, onRangeChange, actions }: StatementHeaderProps) {
  const rangeLabel = useMemo(() => {
    if (startDate && endDate) {
      return `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;
    }
    return 'Select range';
  }, [startDate, endDate]);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">{title}</h1>
        {startDate && endDate && (
          <p className="text-sm text-muted-foreground">Period: {rangeLabel}</p>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className={cn(
                'flex min-w-[220px] items-center justify-start gap-2',
                !startDate || !endDate ? 'text-muted-foreground' : 'text-foreground',
              )}
            >
              <CalendarIcon className="h-4 w-4" />
              {rangeLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-auto p-0">
            <Calendar
              mode="range"
              selected={
                startDate && endDate
                  ? { from: startDate, to: endDate }
                  : undefined
              }
              defaultMonth={startDate ?? endDate ?? new Date()}
              onSelect={(range) => {
                if (range?.from && range?.to) {
                  onRangeChange?.({ startDate: range.from, endDate: range.to });
                }
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
        {actions}
      </div>
    </div>
  );
}

export default StatementHeader;
