import { useMemo, useState } from 'react';
import { addHours, format, isWithinInterval, parseISO, setHours, setMinutes } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { CalendarGrid, CalendarView } from '@/components/communications/CalendarGrid';
import {
  AppointmentRecord,
  Reminder,
  useCommunicationsStore,
} from '@/stores/communications-store';
import { CalendarDays, Clock, Plus, Sparkles } from 'lucide-react';

const appointmentTypes: AppointmentRecord['type'][] = ['In-store Visit', 'Virtual Demo', 'Service', 'Delivery'];
const appointmentStatuses: AppointmentRecord['status'][] = ['Scheduled', 'Confirmed', 'Completed', 'Cancelled', 'No Show'];

const generateId = (prefix: string) =>
  `${prefix}-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)}`;

export default function AppointmentCalendar() {
  const { appointments, leads, upsertAppointment, addReminder } = useCommunicationsStore((state) => ({
    appointments: state.appointments,
    leads: state.leads,
    upsertAppointment: state.upsertAppointment,
    addReminder: state.addReminder,
  }));
  const { toast } = useToast();

  const [view, setView] = useState<CalendarView>('week');
  const [date, setDate] = useState(new Date());
  const [statusFilters, setStatusFilters] = useState<AppointmentRecord['status'][]>([]);
  const [typeFilters, setTypeFilters] = useState<AppointmentRecord['type'][]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedType, setSelectedType] = useState<AppointmentRecord['type']>('In-store Visit');
  const [appointmentDate, setAppointmentDate] = useState<Date>(addHours(new Date(), 24));
  const [location, setLocation] = useState('Showroom 1');
  const [notes, setNotes] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState<AppointmentRecord | null>(null);

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      if (statusFilters.length && !statusFilters.includes(appointment.status)) return false;
      if (typeFilters.length && !typeFilters.includes(appointment.type)) return false;
      return true;
    });
  }, [appointments, statusFilters, typeFilters]);

  const conflicts = useMemo(() => {
    const items: Array<{ appointment: AppointmentRecord; conflict: string }> = [];
    filteredAppointments.forEach((current, index) => {
      filteredAppointments.slice(index + 1).forEach((other) => {
        if (
          isWithinInterval(parseISO(current.start), {
            start: parseISO(other.start),
            end: parseISO(other.end),
          }) ||
          isWithinInterval(parseISO(other.start), {
            start: parseISO(current.start),
            end: parseISO(current.end),
          })
        ) {
          items.push({ appointment: current, conflict: `Overlap with ${other.title}` });
        }
      });
    });
    return items;
  }, [filteredAppointments]);

  const aiSuggestions = useMemo(
    () => [
      { label: 'Tomorrow 10:30 AM · Virtual Demo', value: addHours(new Date(), 26), type: 'Virtual Demo' as AppointmentRecord['type'] },
      { label: 'Saturday 1:00 PM · In-store Visit', value: setHours(setMinutes(addHours(new Date(), 72), 0), 13), type: 'In-store Visit' as AppointmentRecord['type'] },
      { label: 'Next Monday 4:15 PM · Delivery', value: setHours(setMinutes(addHours(new Date(), 96), 15), 16), type: 'Delivery' as AppointmentRecord['type'] },
    ],
    [],
  );

  const handleSaveAppointment = () => {
    if (!selectedLeadId) {
      toast({ title: 'Select lead', description: 'Choose a lead for the appointment.', variant: 'destructive' });
      return;
    }
    const end = addHours(appointmentDate, selectedType === 'Service' ? 2 : 1);
    const appointment: AppointmentRecord = {
      id: selectedAppointment?.id ?? generateId('apt'),
      leadId: selectedLeadId,
      title: `${selectedType} with ${leads.find((lead) => lead.id === selectedLeadId)?.name ?? 'Lead'}`,
      type: selectedType,
      status: 'Scheduled',
      start: appointmentDate.toISOString(),
      end: end.toISOString(),
      location,
      advisor: leads.find((lead) => lead.id === selectedLeadId)?.assignedTo ?? 'Team',
      notes,
      aiSuggestions: ['Send confirmation SMS', 'Attach prep checklist'],
      conflicts: conflicts
        .filter((conflict) => conflict.appointment.id === selectedAppointment?.id)
        .map((conflict) => conflict.conflict),
    };

    upsertAppointment(appointment);

    const reminder: Reminder = {
      id: generateId('rem'),
      leadId: selectedLeadId,
      title: `${selectedType} reminder`,
      dueAt: appointmentDate.toISOString(),
      channel: 'appointment',
      notifyMinutesBefore: 90,
      completed: false,
    };
    addReminder(reminder);

    toast({ title: 'Appointment scheduled', description: `Reserved ${format(appointmentDate, 'PPpp')}` });
    setModalOpen(false);
    setSelectedAppointment(null);
    setNotes('');
  };

  const handleSelectAppointment = (appointment: AppointmentRecord) => {
    setSelectedAppointment(appointment);
    setSelectedLeadId(appointment.leadId);
    setSelectedType(appointment.type);
    setAppointmentDate(new Date(appointment.start));
    setLocation(appointment.location);
    setNotes(appointment.notes ?? '');
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Appointment Calendar</h1>
          <p className="text-sm text-muted-foreground">
            Drag to reschedule, filter by status, and let AI recommend the next best meeting time.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setView('day')} variant={view === 'day' ? 'default' : 'outline'}>
            Day
          </Button>
          <Button onClick={() => setView('week')} variant={view === 'week' ? 'default' : 'outline'}>
            Week
          </Button>
          <Button onClick={() => setView('month')} variant={view === 'month' ? 'default' : 'outline'}>
            Month
          </Button>
          <Button onClick={() => setModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> New appointment
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="flex flex-wrap items-center justify-between gap-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Schedule
              <div className="flex flex-wrap gap-2">
                {appointmentStatuses.map((status) => (
                  <Badge
                    key={status}
                    variant={statusFilters.includes(status) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      setStatusFilters((prev) =>
                        prev.includes(status) ? prev.filter((item) => item !== status) : [...prev, status],
                      )
                    }
                  >
                    {status}
                  </Badge>
                ))}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <CalendarGrid
              view={view}
              date={date}
              appointments={filteredAppointments}
              onSelectAppointment={handleSelectAppointment}
            />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Filters & insights
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {appointmentTypes.map((type) => (
                  <Badge
                    key={type}
                    variant={typeFilters.includes(type) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() =>
                      setTypeFilters((prev) =>
                        prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type],
                      )
                    }
                  >
                    {type}
                  </Badge>
                ))}
              </div>
              <div className="rounded-lg border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
                <Sparkles className="mr-2 inline h-4 w-4" />
                AI flags ideal timeslots based on lead availability and store capacity.
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Conflict warnings</p>
                {conflicts.length ? (
                  <ScrollArea className="max-h-[160px]">
                    <ul className="space-y-2 text-xs text-amber-600">
                      {conflicts.map(({ appointment, conflict }) => (
                        <li key={`${appointment.id}-${conflict}`}>
                          <Clock className="mr-2 inline h-3 w-3" /> {appointment.title}: {conflict}
                        </li>
                      ))}
                    </ul>
                  </ScrollArea>
                ) : (
                  <p className="text-xs text-muted-foreground">No conflicts detected.</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI suggestions</p>
                <div className="space-y-2">
                  {aiSuggestions.map((suggestion) => (
                    <button
                      key={suggestion.label}
                      type="button"
                      onClick={() => {
                        setSelectedType(suggestion.type);
                        setAppointmentDate(suggestion.value);
                        setModalOpen(true);
                      }}
                      className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-left text-xs transition hover:border-primary"
                    >
                      {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Selected appointment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {selectedAppointment ? (
                <>
                  <p className="text-base font-semibold">{selectedAppointment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(selectedAppointment.start), 'PPpp')} · {selectedAppointment.location}
                  </p>
                  <Badge variant="outline">{selectedAppointment.status}</Badge>
                  {selectedAppointment.aiSuggestions?.length ? (
                    <div className="flex flex-wrap gap-2">
                      {selectedAppointment.aiSuggestions.map((tip) => (
                        <Badge key={tip} variant="secondary" className="text-[10px]">
                          {tip}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  {selectedAppointment.conflicts?.length ? (
                    <div className="rounded-md bg-amber-100 p-2 text-xs text-amber-800">
                      Conflicts: {selectedAppointment.conflicts.join(', ')}
                    </div>
                  ) : null}
                  <div className="flex gap-2">
                    <Button size="sm" variant="secondary" onClick={() => setModalOpen(true)}>
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setAppointmentDate(addHours(new Date(selectedAppointment.start), 1))}
                    >
                      Suggest new time
                    </Button>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Select an appointment to view details.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <CalendarDays className="h-5 w-5" />
              {selectedAppointment ? 'Update appointment' : 'New appointment'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Lead</Label>
              <Select value={selectedLeadId} onValueChange={setSelectedLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={selectedType} onValueChange={(value) => setSelectedType(value as AppointmentRecord['type'])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Calendar mode="single" selected={appointmentDate} onSelect={(date) => date && setAppointmentDate(addHours(date, 9))} />
            </div>
            <div className="space-y-2">
              <Label>Time</Label>
              <Input
                type="time"
                value={format(appointmentDate, 'HH:mm')}
                onChange={(event) => {
                  const [hours, minutes] = event.target.value.split(':').map(Number);
                  setAppointmentDate((prev) => setMinutes(setHours(prev, hours), minutes));
                }}
              />
              <p className="text-xs text-muted-foreground">Drag in the calendar to reschedule after saving.</p>
            </div>
            <div className="space-y-2">
              <Label>Location</Label>
              <Input value={location} onChange={(event) => setLocation(event.target.value)} placeholder="Location" />
            </div>
            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Include prep checklist, assigned staff, equipment needs..."
                className="min-h-[120px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSaveAppointment}>
              Save appointment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
