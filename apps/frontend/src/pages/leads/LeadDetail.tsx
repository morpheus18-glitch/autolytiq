import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { useInfiniteQuery, useMutation, useQuery, useQueryClient, type InfiniteData } from '@tanstack/react-query';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Badge,
  Modal,
  FormField,
  Input,
} from '@repo/ui';
// TODO: Missing components to be added to @repo/ui
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import { ArrowLeft, CalendarClock, CheckCircle2, Mail, MessageSquare, PhoneCall, Sparkles } from 'lucide-react';
import ActivityFeed from '@/components/leads/ActivityFeed.tsx';
import AIInsights from '@/components/leads/AIInsights.tsx';
import AppointmentCard from '@/components/leads/AppointmentCard.tsx';
import CallWidget from '@/components/leads/CallWidget.tsx';
import SMSThread from '@/components/leads/SMSThread.tsx';
import LeadScoreBadge from '@/components/leads/LeadScoreBadge.tsx';
import { useLeadSocket } from '@/hooks/use-lead-socket';
import { fetchLeadDetail, fetchLeadTimeline, createLeadActivity } from '@/lib/leadsApi';
import type {
  AIInsight,
  LeadActivityItem,
  LeadActivityPage,
  LeadDetail as LeadDetailType,
  SMSMessage,
} from '@/types/leads';
import { useToast } from '@/hooks/use-toast';

dayjs.extend(relativeTime);

const noteSchema = z.object({ content: z.string().min(2, 'Add more detail to your note.') });
const taskSchema = z.object({
  title: z.string().min(2),
  dueDate: z.string().min(1),
  owner: z.string().min(2),
});
const callSchema = z.object({
  summary: z.string().min(2),
  outcome: z.string().min(2),
});
const emailSchema = z.object({
  subject: z.string().min(2),
  body: z.string().min(10),
});
const meetingSchema = z.object({
  date: z.string().min(1),
  time: z.string().min(1),
  location: z.string().min(2),
});

export default function LeadDetail() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [highlightIds, setHighlightIds] = useState<Set<string>>(new Set());
  const highlightTimeouts = useRef<number[]>([]);

  const flashHighlight = useCallback((activityId: string) => {
    setHighlightIds((current) => {
      const next = new Set(current);
      next.add(activityId);
      return next;
    });
    const timeout = window.setTimeout(() => {
      setHighlightIds((current) => {
        if (!current.has(activityId)) return current;
        const next = new Set(current);
        next.delete(activityId);
        return next;
      });
      highlightTimeouts.current = highlightTimeouts.current.filter((value) => value !== timeout);
    }, 4000);
    highlightTimeouts.current.push(timeout);
  }, []);

  useEffect(() => () => {
    highlightTimeouts.current.forEach((timeout) => window.clearTimeout(timeout));
    highlightTimeouts.current = [];
  }, []);

  const leadQuery = useQuery({
    queryKey: ['lead-detail', id],
    queryFn: () => fetchLeadDetail(id!),
    enabled: Boolean(id),
  });

  const lead = leadQuery.data;

  const timelineQuery = useInfiniteQuery<LeadActivityPage, Error, InfiniteData<LeadActivityPage>, [string, string | undefined]>({
    queryKey: ['lead-timeline', id],
    queryFn: ({ pageParam }) =>
      fetchLeadTimeline({ leadId: id!, cursor: (pageParam as string | undefined) ?? undefined }),
    getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
    initialPageParam: undefined,
    enabled: Boolean(id),
  });

  const noteForm = useForm({ resolver: zodResolver(noteSchema), defaultValues: { content: '' } });
  const taskForm = useForm({ resolver: zodResolver(taskSchema), defaultValues: { title: '', dueDate: '', owner: '' } });
  const callForm = useForm({ resolver: zodResolver(callSchema), defaultValues: { summary: '', outcome: '' } });
  const emailForm = useForm({ resolver: zodResolver(emailSchema), defaultValues: { subject: '', body: '' } });
  const meetingForm = useForm({ resolver: zodResolver(meetingSchema), defaultValues: { date: '', time: '', location: '' } });

  const activityMutation = useMutation({
    mutationFn: (payload: Omit<LeadActivityItem, 'id' | 'leadId' | 'timestamp'>) =>
      createLeadActivity(id!, payload),
    onSuccess: (activity) => {
      flashHighlight(activity.id);
      queryClient.setQueryData(['lead-detail', id], (existing: LeadDetailType | undefined) =>
        existing ? { ...existing, activities: [activity, ...(existing.activities ?? [])] } : existing,
      );
        queryClient.setQueryData<InfiniteData<LeadActivityPage>>(['lead-timeline', id], (existing) => {
          if (!existing) return existing;
          return {
            ...existing,
            pages: existing.pages.map((page, index) =>
              index === 0 ? { ...page, items: [activity, ...page.items] } : page,
            ),
          };
        });
      toast({ title: 'Activity logged', description: 'Timeline updated in real-time.' });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : 'Unable to log activity.';
      toast({ title: 'Failed to log activity', description: message, variant: 'destructive' });
    },
  });

  useLeadSocket({
    tenantId: lead?.tenantId ?? undefined,
    onLeadUpdated: (updated) => {
      if (updated.id !== id) return;
      queryClient.setQueryData(['lead-detail', id], (existing: LeadDetailType | undefined) =>
        existing ? { ...existing, ...updated } : existing,
      );
    },
    onActivityCreated: (activity) => {
      if (activity.leadId !== id) return;
      flashHighlight(activity.id);
      queryClient.setQueryData(['lead-detail', id], (existing: LeadDetailType | undefined) =>
        existing ? { ...existing, activities: [activity, ...(existing.activities ?? [])] } : existing,
      );
      queryClient.setQueryData<InfiniteData<LeadActivityPage>>(['lead-timeline', id], (existing) => {
        if (!existing) return existing;
        return {
          ...existing,
          pages: existing.pages.map((page, index) =>
            index === 0 ? { ...page, items: [activity, ...page.items] } : page,
          ),
        };
      });
    },
  });

  const handleCreateActivity = useCallback(
    (payload: Omit<LeadActivityItem, 'id' | 'leadId' | 'timestamp'>, reset: () => void) => {
      activityMutation.mutate(payload, {
        onSuccess: () => reset(),
      });
    },
    [activityMutation],
  );

  const insights: AIInsight[] = useMemo(() => {
    if (!lead) return [];
    const recommendations: AIInsight[] = [];

    if (lead.intentScore >= 80) {
      recommendations.push({
        id: 'call-now',
        title: 'Immediate call recommended',
        description: `${lead.name.split(' ')[0]} engaged recently. A direct phone call will help secure next steps.`,
        impact: 'high',
        cta: { label: 'Call lead now', action: 'call' },
        supportingPoints: [
          'High intent score indicates strong buying signals',
          'Last activity occurred within the last 24 hours',
        ],
      });
    }

    if (lead.lifecycleStage === 'consideration') {
      recommendations.push({
        id: 'send-offer',
        title: 'Share tailored financing options',
        description: 'Lead is weighing vehicles and financing—send curated incentives to nudge a decision.',
        impact: 'medium',
        cta: { label: 'Draft personalized email', action: 'email' },
      });
    }

    if (!recommendations.length) {
      recommendations.push({
        id: 'nurture',
        title: 'Keep nurturing the lead',
        description: 'Maintain consistent follow-up cadence and deliver timely updates on inventory.',
        impact: 'low',
        cta: { label: 'Schedule touchpoint', action: 'task' },
      });
    }

    return recommendations;
  }, [lead]);

  const appointment = useMemo(() => {
    if (!lead?.nextTaskAt) {
      return {
        id: 'follow-up',
        startsAt: dayjs().add(1, 'day').hour(10).minute(0).toISOString(),
        endsAt: dayjs().add(1, 'day').hour(10).minute(30).toISOString(),
        location: lead?.region ?? 'Sales floor',
        topic: 'Follow-up conversation',
        attendees: ['You', lead?.name ?? 'Prospect'],
        status: 'scheduled' as const,
      };
    }
    return {
      id: 'scheduled',
      startsAt: lead.nextTaskAt,
      endsAt: dayjs(lead.nextTaskAt).add(30, 'minute').toISOString(),
      location: lead.region ?? 'Showroom',
      topic: 'Vehicle presentation',
      attendees: ['You', lead.name],
      status: 'scheduled' as const,
    };
  }, [lead]);

  const smsMessages: SMSMessage[] = useMemo(() => {
    const smsActivities = (lead?.activities ?? []).filter((activity) => activity.type === 'sms');
    if (smsActivities.length) {
      return smsActivities.map((activity, index) => ({
        id: activity.id ?? `sms-${index}`,
        sender: activity.direction === 'outbound' ? 'agent' : 'lead',
        body: activity.detail,
        timestamp: activity.timestamp,
        status: (activity.metadata?.status as SMSMessage['status']) ?? 'delivered',
      }));
    }

    return [
      {
        id: 'intro',
        sender: 'agent',
        body: `Hi ${lead?.name ?? 'there'}, thanks for requesting information. Do you have a few minutes to chat?`,
        timestamp: dayjs().subtract(2, 'hour').toISOString(),
        status: 'read',
      },
      {
        id: 'response',
        sender: 'lead',
        body: "Yes I do! I'm comparing trims right now.",
        timestamp: dayjs().subtract(90, 'minute').toISOString(),
        status: 'delivered',
      },
    ];
  }, [lead]);

  const intelligence = useMemo(() => {
    if (!lead) return [];
    return [
      {
        label: 'Lifecycle Stage',
        value: lead.lifecycleStage,
      },
      {
        label: 'Intent Score',
        value: <LeadScoreBadge score={lead.intentScore} size="sm" />,
      },
      {
        label: 'Timeframe',
        value: lead.timeframe ?? 'Not specified',
      },
      {
        label: 'Budget Range',
        value: lead.budgetRange ?? 'Not provided',
      },
      {
        label: 'Region',
        value: lead.region ?? '—',
      },
      {
        label: 'Last Interaction',
        value: lead.lastInteractionAt ? dayjs(lead.lastInteractionAt).fromNow() : 'No activity logged',
      },
    ];
  }, [lead]);

  const renderIntelligence = () => (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">Lead Intelligence</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-slate-600">
        {intelligence.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-4">
            <span className="text-slate-500">{item.label}</span>
            <span className="font-medium text-slate-900">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );

  const renderVehicles = () => {
    const interestList = Array.isArray(lead?.vehicleInterest)
      ? lead?.vehicleInterest.map((vehicle, index) => {
          if (typeof vehicle === 'string') return vehicle;
          return [vehicle.year, vehicle.make, vehicle.model, vehicle.trim].filter(Boolean).join(' ');
        })
      : [];

    if (!interestList?.length) {
      return <p className="text-sm text-slate-500">No vehicle interests captured yet.</p>;
    }

    return (
      <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
        {interestList.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    );
  };

  const renderQuickActions = () => (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs defaultValue="note" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="note">Note</TabsTrigger>
            <TabsTrigger value="task">Task</TabsTrigger>
            <TabsTrigger value="call">Log Call</TabsTrigger>
            <TabsTrigger value="email">Email</TabsTrigger>
            <TabsTrigger value="meeting">Schedule</TabsTrigger>
          </TabsList>
          <TabsContent value="note" className="mt-4">
            <Form {...noteForm}>
              <form
                onSubmit={noteForm.handleSubmit((values) =>
                  handleCreateActivity({ type: 'note', detail: values.content }, () => noteForm.reset()),
                )}
                className="space-y-3"
              >
                <FormField
                  control={noteForm.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Internal note</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Summarize your insight or follow-up plan" rows={4} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Save note
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="task" className="mt-4">
            <Form {...taskForm}>
              <form
                onSubmit={taskForm.handleSubmit((values) =>
                  handleCreateActivity(
                    {
                      type: 'task',
                      detail: values.title,
                      metadata: { dueDate: values.dueDate, owner: values.owner },
                    },
                    () => taskForm.reset(),
                  ),
                )}
                className="space-y-3"
              >
                <FormField
                  control={taskForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Task</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Schedule follow-up call" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={taskForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={taskForm.control}
                    name="owner"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Owner</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Assign to" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <Button type="submit" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Create task
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="call" className="mt-4">
            <Form {...callForm}>
              <form
                onSubmit={callForm.handleSubmit((values) =>
                  handleCreateActivity(
                    { type: 'call', detail: values.summary, metadata: { outcome: values.outcome } },
                    () => callForm.reset(),
                  ),
                )}
                className="space-y-3"
              >
                <FormField
                  control={callForm.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Conversation summary</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={3} placeholder="Discussed financing options and trade-in." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={callForm.control}
                  name="outcome"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outcome</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Requested proposal" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="bg-slate-900 text-white hover:bg-slate-800">
                  Log call
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="email" className="mt-4">
            <Form {...emailForm}>
              <form
                onSubmit={emailForm.handleSubmit((values) =>
                  handleCreateActivity(
                    { type: 'email', detail: values.subject, metadata: { body: values.body } },
                    () => emailForm.reset(),
                  ),
                )}
                className="space-y-3"
              >
                <FormField
                  control={emailForm.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Subject line</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Financing options attached" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={emailForm.control}
                  name="body"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea {...field} rows={4} placeholder="Provide details on incentives, approvals, and next steps." />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="bg-indigo-600 text-white hover:bg-indigo-700">
                  Log email
                </Button>
              </form>
            </Form>
          </TabsContent>
          <TabsContent value="meeting" className="mt-4">
            <Form {...meetingForm}>
              <form
                onSubmit={meetingForm.handleSubmit((values) =>
                  handleCreateActivity(
                    {
                      type: 'meeting',
                      detail: `Meeting on ${values.date} at ${values.time}`,
                      metadata: { location: values.location },
                    },
                    () => meetingForm.reset(),
                  ),
                )}
                className="space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={meetingForm.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={meetingForm.control}
                    name="time"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Time</FormLabel>
                        <FormControl>
                          <Input type="time" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={meetingForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Showroom - Desk 3" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" size="sm" className="bg-emerald-600 text-white hover:bg-emerald-700">
                  Schedule meeting
                </Button>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  if (leadQuery.isLoading || !lead) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-40 animate-pulse rounded bg-slate-100" />
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
          <div className="h-96 animate-pulse rounded bg-slate-100" />
          <div className="h-[600px] animate-pulse rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/leads')}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to leads
        </Button>
        <Badge variant="secondary" className="capitalize">
          {lead.status}
        </Badge>
        <LeadScoreBadge score={lead.intentScore} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <div className="space-y-6">
          {renderQuickActions()}
          {renderIntelligence()}
          <AIInsights insights={insights} onAction={() => setIsAiModalOpen(true)} />
          <AppointmentCard appointment={appointment} />
          <CallWidget
            leadName={lead.name}
            phoneNumber={lead.phone}
            onInitiate={() => {
              toast({ title: 'Dialing', description: `Calling ${lead.name}…` });
            }}
            onComplete={(note) => {
              handleCreateActivity({ type: 'call', detail: note }, () => undefined);
            }}
          />
          <SMSThread messages={smsMessages} />
        </div>

        <div className="space-y-6">
          <Card className="border-slate-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-semibold text-slate-900">{lead.name}</CardTitle>
              <p className="text-sm text-slate-500">{lead.email ?? lead.phone ?? 'No contact details available'}</p>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex items-center gap-3">
                <PhoneCall className="h-4 w-4 text-indigo-600" />
                <span>{lead.phone ?? 'No phone on record'}</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-emerald-600" />
                <span>{lead.email ?? 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-3">
                <CalendarClock className="h-4 w-4 text-amber-600" />
                <span>Created {lead.createdAt ? dayjs(lead.createdAt).fromNow() : '—'}</span>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold text-slate-900">Summary</h3>
                <p className="text-sm text-slate-600">
                  {lead.notes ?? 'AI assistant will capture intent, objections, and decision criteria as you log interactions.'}
                </p>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="timeline" className="space-y-4">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="timeline">Timeline</TabsTrigger>
              <TabsTrigger value="emails">Emails</TabsTrigger>
              <TabsTrigger value="sms">SMS</TabsTrigger>
              <TabsTrigger value="calls">Calls</TabsTrigger>
              <TabsTrigger value="tasks">Tasks</TabsTrigger>
              <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
            </TabsList>
            <TabsContent value="timeline">
              <ActivityFeed query={timelineQuery} enableRealtimeBadge highlightIds={highlightIds} />
            </TabsContent>
            <TabsContent value="emails">
              <Card className="border-slate-200">
                <CardContent className="space-y-3 p-4 text-sm text-slate-600">
                  {(lead.activities ?? [])
                    .filter((activity) => activity.type === 'email')
                    .map((activity) => (
                      <div key={activity.id} className="rounded-lg border border-slate-200 p-3">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-slate-900">{activity.detail}</span>
                          <span className="text-xs text-slate-500">{dayjs(activity.timestamp).format('MMM D, h:mm A')}</span>
                        </div>
                        <p className="mt-2 text-slate-600 text-sm">
                          {(activity.metadata?.body as string) ?? 'Email logged from CRM sync.'}
                        </p>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="sms">
              <SMSThread messages={smsMessages} />
            </TabsContent>
            <TabsContent value="calls">
              <Card className="border-slate-200">
                <CardContent className="space-y-3 p-4 text-sm text-slate-600">
                  {(lead.activities ?? [])
                    .filter((activity) => activity.type === 'call')
                    .map((activity) => (
                      <div key={activity.id} className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-slate-900">{activity.detail}</p>
                          <p className="text-xs text-slate-500">
                            Outcome: {(activity.metadata?.outcome as string) ?? 'Documented'}
                          </p>
                        </div>
                        <span className="text-xs text-slate-500">{dayjs(activity.timestamp).fromNow()}</span>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="tasks">
              <Card className="border-slate-200">
                <CardContent className="space-y-3 p-4 text-sm text-slate-600">
                  {(lead.activities ?? [])
                    .filter((activity) => activity.type === 'task')
                    .map((activity) => (
                      <div key={activity.id} className="flex items-center justify-between rounded-lg border border-slate-200 p-3">
                        <div>
                          <p className="font-medium text-slate-900">{activity.detail}</p>
                          <p className="text-xs text-slate-500">
                            Due {dayjs(activity.metadata?.dueDate as string).format('MMM D, YYYY')} | Owner:{' '}
                            {(activity.metadata?.owner as string) ?? 'Unassigned'}
                          </p>
                        </div>
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Open
                        </Badge>
                      </div>
                    ))}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="vehicles">
              <Card className="border-slate-200">
                <CardContent className="space-y-3 p-4">
                  <h3 className="text-sm font-semibold text-slate-900">Vehicles of Interest</h3>
                  {renderVehicles()}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Modal
        open={isAiModalOpen}
        onClose={() => setIsAiModalOpen(false)}
        title={
          <span className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-indigo-600" /> AI Next Move Recommendation
          </span>
        }
      >
        <div className="space-y-4 text-sm text-slate-600">
          <p>
            AutolytiQ Intelligence suggests combining a high-energy phone call with a tailored financing email follow-up.
            This sequencing captures the lead while intent is highest and keeps asynchronous communication aligned.
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>Call within the next 15 minutes to confirm preferred vehicle configuration.</li>
            <li>Send a templated email summarizing pricing, incentives, and appointment availability.</li>
            <li>Schedule a demo drive within 48 hours to prevent competitor leakage.</li>
          </ul>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="secondary" onClick={() => setIsAiModalOpen(false)}>
            Dismiss
          </Button>
          <Button variant="primary" onClick={() => setIsAiModalOpen(false)}>
            Apply recommendation
          </Button>
        </div>
      </Modal>
    </div>
  );
}
