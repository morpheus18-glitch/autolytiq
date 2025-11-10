import { useMemo } from 'react';
import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { AppointmentRecord } from '@/stores/communications-store';
import { cn } from '@/lib/utils';
import { Badge } from '@repo/ui';
import { ScrollArea } from '@repo/ui';

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarGridProps {
  view: CalendarView;
  date: Date;
  appointments: AppointmentRecord[];
  onSelectAppointment?: (appointment: AppointmentRecord) => void;
}

const STATUS_COLORS: Record<AppointmentRecord['status'], string> = {
  Scheduled: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200',
  Confirmed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200',
  Completed: 'bg-slate-200 text-slate-700 dark:bg-slate-500/20 dark:text-slate-200',
  Cancelled: 'bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200',
  'No Show': 'bg-amber-100 text-amber-800 dark:bg-amber-500/20 dark:text-amber-200',
};

const APPOINTMENT_TYPE_COLORS: Record<AppointmentRecord['type'], string> = {
  'In-store Visit': 'border-l-4 border-primary',
  'Virtual Demo': 'border-l-4 border-sky-500',
  Service: 'border-l-4 border-amber-500',
  Delivery: 'border-l-4 border-emerald-500',
};

function DayColumn({
  day,
  isCurrentMonth,
  isHighlighted,
  isActive,
  appointments,
  onSelectAppointment,
}: {
  day: Date;
  isCurrentMonth: boolean;
  isHighlighted: boolean;
  isActive: boolean;
  appointments: AppointmentRecord[];
  onSelectAppointment?: (appointment: AppointmentRecord) => void;
}) {
  return (
    <div
      className={cn(
        'flex flex-col rounded-lg border border-border/60 bg-background shadow-sm',
        isHighlighted ? 'ring-2 ring-primary' : '',
        isActive ? 'bg-primary/5' : '',
      )}
    >
      <div className="flex items-center justify-between border-b border-border/40 px-3 py-2 text-sm font-semibold">
        <span className={cn(!isCurrentMonth ? 'text-muted-foreground' : '')}>{format(day, 'EEE dd')}</span>
        {isToday(day) ? <Badge variant="outline">Today</Badge> : null}
      </div>
      <ScrollArea className="h-[260px]">
        <div className="space-y-2 p-3">
          {appointments.length === 0 ? (
            <p className="text-xs text-muted-foreground">No appointments</p>
          ) : (
            appointments.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => onSelectAppointment?.(appointment)}
                className={cn(
                  'w-full rounded-md border border-border/50 bg-muted/30 p-2 text-left text-xs transition hover:border-primary hover:bg-primary/10',
                  APPOINTMENT_TYPE_COLORS[appointment.type],
                )}
              >
                <div className="flex items-center justify-between text-[11px] font-medium uppercase tracking-wide">
                  <span>{appointment.type}</span>
                  <span>{format(new Date(appointment.start), 'p')}</span>
                </div>
                <p className="mt-1 text-sm font-semibold text-foreground">{appointment.title}</p>
                <p className="text-xs text-muted-foreground">{appointment.location}</p>
                <Badge className={cn('mt-2 w-fit text-[10px]', STATUS_COLORS[appointment.status])}>
                  {appointment.status}
                </Badge>
              </button>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

function MonthCell({
  day,
  isCurrentMonth,
  isHighlighted,
  appointments,
  onSelectAppointment,
}: {
  day: Date;
  isCurrentMonth: boolean;
  isHighlighted: boolean;
  appointments: AppointmentRecord[];
  onSelectAppointment?: (appointment: AppointmentRecord) => void;
}) {
  return (
    <div
      className={cn(
        'flex min-h-[120px] flex-col rounded-lg border border-border/50 bg-background p-2 text-xs transition hover:border-primary',
        isHighlighted ? 'ring-2 ring-primary' : '',
        !isCurrentMonth ? 'bg-muted/20 text-muted-foreground' : '',
      )}
    >
      <div className="mb-1 flex items-center justify-between text-[11px] font-semibold uppercase">
        <span>{format(day, 'd')}</span>
        {isToday(day) ? <Badge variant="secondary">Today</Badge> : null}
      </div>
      <div className="space-y-1">
        {appointments.slice(0, 3).map((appointment) => (
          <button
            key={appointment.id}
            type="button"
            onClick={() => onSelectAppointment?.(appointment)}
            className="w-full truncate rounded border border-border/40 bg-muted/30 px-2 py-1 text-left text-[11px] hover:border-primary hover:bg-primary/10"
          >
            <span className="font-semibold">{format(new Date(appointment.start), 'p')} </span>
            {appointment.title}
          </button>
        ))}
        {appointments.length > 3 ? (
          <p className="text-[10px] text-muted-foreground">+{appointments.length - 3} more</p>
        ) : null}
      </div>
    </div>
  );
}

export function CalendarGrid({ view, date, appointments, onSelectAppointment }: CalendarGridProps) {
  const weekDays = useMemo(() => {
    const start = startOfWeek(date, { weekStartsOn: 0 });
    return Array.from({ length: 7 }).map((_, index) => addDays(start, index));
  }, [date]);

  if (view === 'day') {
    const dayAppointments = appointments
      .filter((appointment) => isSameDay(new Date(appointment.start), date))
      .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-border/60 bg-muted/20 p-3">
          <p className="text-sm font-semibold">{format(date, 'PPPP')}</p>
          <p className="text-xs text-muted-foreground">
            Drag and drop reschedule is available for confirmed appointments. Hover to reveal drag handle.
          </p>
        </div>
        <div className="space-y-3">
          {dayAppointments.length === 0 ? (
            <p className="text-sm text-muted-foreground">No appointments scheduled.</p>
          ) : (
            dayAppointments.map((appointment) => (
              <button
                key={appointment.id}
                type="button"
                onClick={() => onSelectAppointment?.(appointment)}
                className={cn(
                  'group flex w-full items-start gap-3 rounded-lg border border-border/60 bg-background p-4 text-left shadow-sm transition hover:border-primary',
                  APPOINTMENT_TYPE_COLORS[appointment.type],
                )}
              >
                <div className="mt-1 h-10 w-10 rounded-md bg-primary/10 text-center text-xs font-semibold uppercase leading-10 text-primary">
                  {format(new Date(appointment.start), 'p')}
                </div>
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2 text-sm font-semibold">
                    <span>{appointment.title}</span>
                    <Badge className={cn('text-[10px]', STATUS_COLORS[appointment.status])}>{appointment.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(appointment.start), 'p')} - {format(new Date(appointment.end), 'p')} · {appointment.location}
                  </p>
                  {appointment.notes ? (
                    <p className="text-xs text-foreground/80">{appointment.notes}</p>
                  ) : null}
                  {appointment.conflicts && appointment.conflicts.length ? (
                    <div className="rounded-md bg-amber-100/80 p-2 text-[11px] text-amber-900">
                      Conflicts: {appointment.conflicts.join(', ')}
                    </div>
                  ) : null}
                  {appointment.aiSuggestions && appointment.aiSuggestions.length ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {appointment.aiSuggestions.map((suggestion) => (
                        <Badge key={suggestion} variant="outline" className="text-[10px]">
                          {suggestion}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    );
  }

  if (view === 'week') {
    return (
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {weekDays.map((day) => (
          <DayColumn
            key={day.toISOString()}
            day={day}
            isCurrentMonth={isSameMonth(day, date)}
            isHighlighted={isSameDay(day, date)}
            isActive={isToday(day)}
            appointments={appointments.filter((appointment) => isSameDay(new Date(appointment.start), day))}
            onSelectAppointment={onSelectAppointment}
          />
        ))}
      </div>
    );
  }

  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const calendarDays: Date[] = [];
  let pointer = gridStart;
  while (pointer <= gridEnd) {
    calendarDays.push(pointer);
    pointer = addDays(pointer, 1);
  }

  return (
    <div className="grid gap-2 md:grid-cols-4 xl:grid-cols-7">
      {calendarDays.map((day) => (
        <MonthCell
          key={day.toISOString()}
          day={day}
          isCurrentMonth={isSameMonth(day, date)}
          isHighlighted={isSameDay(day, date)}
          appointments={appointments.filter((appointment) => isSameDay(new Date(appointment.start), day))}
          onSelectAppointment={onSelectAppointment}
        />
      ))}
    </div>
  );
}

export default CalendarGrid;
