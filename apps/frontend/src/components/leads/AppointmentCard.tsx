import { CalendarClock, MapPin, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import type { Appointment } from '@/types/leads';
import dayjs from 'dayjs';

interface AppointmentCardProps {
  appointment: Appointment;
}

export function AppointmentCard({ appointment }: AppointmentCardProps) {
  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <CalendarClock className="h-4 w-4 text-indigo-600" />
          Upcoming Appointment
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        <div>
          <p className="font-medium text-slate-900">{appointment.topic}</p>
          <p>{dayjs(appointment.startsAt).format('MMMM D, YYYY h:mm A')}</p>
          <p className="text-xs text-slate-500">
            {dayjs(appointment.startsAt).format('h:mm A')} – {dayjs(appointment.endsAt).format('h:mm A')} ({dayjs(appointment.endsAt).diff(dayjs(appointment.startsAt), 'minute')} min)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-slate-400" />
          <span>{appointment.location}</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span>{appointment.attendees.join(', ')}</span>
        </div>
        <div className="text-xs uppercase tracking-wide text-slate-500">Status: {appointment.status}</div>
      </CardContent>
    </Card>
  );
}

export default AppointmentCard;
