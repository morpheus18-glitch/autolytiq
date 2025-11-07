import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { ScrollArea } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { useSearchParams } from 'react-router-dom';
import {
  CommunicationRecord,
  LeadProfile,
  getLeadById,
  useCommunicationsStore,
} from '@/stores/communications-store';
import { format, parseISO } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui';
import { DollarSign, Mail, MessageCircle, PhoneCall, ShieldCheck, Sparkles, Users } from 'lucide-react';

const channelIcons: Record<string, JSX.Element> = {
  call: <PhoneCall className="h-4 w-4 text-primary" />,
  email: <Mail className="h-4 w-4 text-sky-500" />,
  sms: <MessageCircle className="h-4 w-4 text-emerald-500" />,
};

const getInitials = (name?: string) =>
  name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'LM';

export default function CustomerProfile() {
  const { leads, communications, reminders, appointments } = useCommunicationsStore((state) => ({
    leads: state.leads,
    communications: state.communications,
    reminders: state.reminders,
    appointments: state.appointments,
  }));

  const [searchParams, setSearchParams] = useSearchParams();
  const initialLeadId = searchParams.get('leadId') ?? leads[0]?.id ?? '';
  const [leadId, setLeadId] = useState(initialLeadId);

  useEffect(() => {
    if (leadId) {
      setSearchParams({ leadId });
    }
  }, [leadId, setSearchParams]);

  const lead = useMemo<LeadProfile | undefined>(() => getLeadById(leads, leadId), [leads, leadId]);
  const contactHistory = useMemo<CommunicationRecord[]>(
    () => communications.filter((record) => record.leadId === leadId).sort((a, b) => parseISO(b.createdAt).getTime() - parseISO(a.createdAt).getTime()),
    [communications, leadId],
  );
  const upcomingAppointments = useMemo(
    () => appointments.filter((appointment) => appointment.leadId === leadId && parseISO(appointment.start) > new Date()),
    [appointments, leadId],
  );
  const leadReminders = useMemo(() => reminders.filter((reminder) => reminder.leadId === leadId && !reminder.completed), [reminders, leadId]);

  if (!lead) {
    return (
      <div className="p-6">
        <p className="text-sm text-muted-foreground">No lead selected.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Avatar className="h-14 w-14 border border-border/40">
            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead.name}`} />
            <AvatarFallback>{getInitials(lead.name)}</AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-semibold">{lead.name}</h1>
            <p className="text-sm text-muted-foreground">
              {lead.status} · {lead.stage} · Lead score {lead.leadScore}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select lead" />
            </SelectTrigger>
            <SelectContent>
              {leads.map((candidate) => (
                <SelectItem key={candidate.id} value={candidate.id}>
                  {candidate.name} · {candidate.status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Sparkles className="h-4 w-4" /> Next best action
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Lifecycle overview</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Contact</p>
                <p className="text-sm text-foreground">{lead.email}</p>
                <p className="text-sm text-foreground">{lead.phone}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {lead.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-[10px] uppercase tracking-wide">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Preferences</p>
                <p className="text-sm text-foreground">Channels: {lead.preferences.contactMethods.join(', ')}</p>
                <p className="text-sm text-foreground">Time: {lead.preferences.preferredTimes.join(', ')}</p>
                <p className="text-sm text-foreground">Vehicles: {lead.preferences.vehiclesOfInterest.join(', ')}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Financial profile</p>
                <p className="text-sm text-foreground">Credit score {lead.financialProfile.creditScore}</p>
                <p className="text-sm text-foreground">Pre-approval ${lead.financialProfile.preApprovalAmount.toLocaleString()}</p>
                <p className="text-sm text-foreground">Budget ${lead.financialProfile.monthlyBudget.toLocaleString()}/mo</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Opt-ins</p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Mail className="h-4 w-4 text-sky-500" /> {lead.optIns.email ? 'Email' : 'No email'}
                  <MessageCircle className="h-4 w-4 text-emerald-500" /> {lead.optIns.sms ? 'SMS' : 'No SMS'}
                  <PhoneCall className="h-4 w-4 text-primary" /> {lead.optIns.phone ? 'Phone' : 'No phone'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Household & loyalty</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Household</p>
                <ul className="space-y-2 text-sm">
                  {lead.household.map((member) => (
                    <li key={member.name} className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-xs text-muted-foreground">{member.relationship}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Lifetime value</p>
                <div className="flex items-center gap-2 text-3xl font-semibold text-foreground">
                  <DollarSign className="h-6 w-6" /> {lead.lifetimeValue.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Last purchase {lead.lastPurchase ? format(new Date(lead.lastPurchase), 'PPP') : 'N/A'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Next best offer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p className="text-base font-semibold text-foreground">{lead.nextBestOffer.title}</p>
              <p className="text-muted-foreground">{lead.nextBestOffer.description}</p>
              <div className="rounded-md border border-primary/40 bg-primary/10 p-3 text-xs text-primary">
                <Sparkles className="mr-2 inline h-4 w-4" /> {lead.nextBestOffer.reason}
              </div>
              <Button className="gap-2" variant="secondary">
                <ShieldCheck className="h-4 w-4" /> Generate personalized proposal
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Contact history</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="max-h-[320px]">
                <div className="divide-y divide-border/60">
                  {contactHistory.map((message) => (
                    <div key={message.id} className="flex items-start gap-3 px-4 py-3 text-sm">
                      {channelIcons[message.channel]}
                      <div>
                        <p className="font-semibold text-foreground">
                          {message.direction === 'outbound' ? 'You' : lead.name} · {format(parseISO(message.createdAt), 'PPpp')}
                        </p>
                        <p className="text-xs text-muted-foreground">{message.preview}</p>
                        {message.aiRecommendations && message.aiRecommendations.length ? (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {message.aiRecommendations.map((tip) => (
                              <Badge key={tip} variant="outline" className="text-[10px]">
                                {tip}
                              </Badge>
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Reminders</p>
                <ul className="space-y-2">
                  {leadReminders.map((reminder) => (
                    <li key={reminder.id} className="rounded-md border border-border/60 bg-muted/20 p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{reminder.title}</span>
                        <Badge variant="outline">{format(parseISO(reminder.dueAt), 'PP p')}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">Channel: {reminder.channel.toUpperCase()}</p>
                    </li>
                  ))}
                  {leadReminders.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No open reminders.</p>
                  ) : null}
                </ul>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Upcoming appointments</p>
                <ul className="space-y-2">
                  {upcomingAppointments.map((appointment) => (
                    <li key={appointment.id} className="rounded-md border border-border/60 bg-muted/20 p-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-foreground">{appointment.title}</span>
                        <Badge variant="outline">{format(parseISO(appointment.start), 'PP p')}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{appointment.location}</p>
                    </li>
                  ))}
                  {upcomingAppointments.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No upcoming appointments.</p>
                  ) : null}
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
