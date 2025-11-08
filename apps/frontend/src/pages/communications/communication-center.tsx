import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CommunicationFilter,
  CommunicationRecord,
  TemplateDefinition,
  getLeadById,
  getThreadPreview,
  groupCommunicationsByThread,
  useCommunicationsStore,
} from '@/stores/communications-store';
import { UnifiedFilters } from '@/components/communications/UnifiedFilters.tsx';
import { TemplatePicker } from '@/components/communications/TemplatePicker.tsx';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { ScrollArea } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Input } from '@repo/ui';
import { Separator } from '@repo/ui';
import { Switch } from '@repo/ui';
import { useToast } from '@repo/ui';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import {
  AlertTriangle,
  BellRing,
  CheckCircle,
  Clock,
  Mail,
  MessageCircle,
  Phone,
  Send,
  Sparkles,
  Star,
} from 'lucide-react';

const CHANNEL_ICONS: Record<string, JSX.Element> = {
  call: <Phone className="h-4 w-4 text-primary" />,
  sms: <MessageCircle className="h-4 w-4 text-emerald-500" />,
  email: <Mail className="h-4 w-4 text-sky-500" />,
};

const filterOrder: CommunicationFilter[] = ['unread', 'starred', 'needsReply', 'followUp'];

const getInitials = (name?: string) =>
  name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'LM';

const truncate = (value: string, length = 120) => (value.length > length ? `${value.slice(0, length)}…` : value);

const sortThreadChronologically = (thread: CommunicationRecord[]) =>
  thread.slice().sort((a, b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime());

export default function CommunicationCenter() {
  const {
    communications,
    leads,
    quickReplies,
    templates,
    reminders,
    markThreadRead,
    toggleStar,
    addCommunication,
    completeReminder,
    setActiveLead,
    activateRealtimeFeed,
  } = useCommunicationsStore((state) => ({
    communications: state.communications,
    leads: state.leads,
    quickReplies: state.quickReplies,
    templates: state.templates,
    reminders: state.reminders,
    markThreadRead: state.markThreadRead,
    toggleStar: state.toggleStar,
    addCommunication: state.addCommunication,
    completeReminder: state.completeReminder,
    setActiveLead: state.setActiveLead,
    activateRealtimeFeed: state.activateRealtimeFeed,
  }));

  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState<'all' | 'sms' | 'email' | 'call'>('all');
  const [activeFilters, setActiveFilters] = useState<CommunicationFilter[]>(['unread']);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [draftMessage, setDraftMessage] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateDefinition | null>(null);
  const [sending, setSending] = useState(false);
  const [notificationPrefs, setNotificationPrefs] = useState({ email: true, sms: true, push: true });

  useEffect(() => {
    const stop = activateRealtimeFeed();
    return stop;
  }, [activateRealtimeFeed]);

  const groupedThreads = useMemo(() => {
    if (activeTab === 'all') {
      return groupCommunicationsByThread(communications);
    }
    return groupCommunicationsByThread(communications, activeTab);
  }, [communications, activeTab]);

  const filterCounts = useMemo(() => {
    const counts: Record<CommunicationFilter, number> = {
      unread: 0,
      starred: 0,
      needsReply: 0,
      followUp: 0,
    };
    groupCommunicationsByThread(communications).forEach((thread) => {
      if (thread.some((message) => message.unread)) counts.unread += 1;
      if (thread.some((message) => message.starred)) counts.starred += 1;
      if (thread.some((message) => message.requiresReply)) counts.needsReply += 1;
      if (thread.some((message) => message.followUpDue && parseISO(message.followUpDue) > new Date()))
        counts.followUp += 1;
    });
    return counts;
  }, [communications]);

  const filteredThreads = useMemo(() => {
    if (activeFilters.length === 0) {
      return groupedThreads;
    }
    return groupedThreads.filter((thread) => {
      return activeFilters.every((filter) => {
        switch (filter) {
          case 'unread':
            return thread.some((message) => message.unread);
          case 'starred':
            return thread.some((message) => message.starred);
          case 'needsReply':
            return thread.some((message) => message.requiresReply);
          case 'followUp':
            return thread.some((message) => message.followUpDue && parseISO(message.followUpDue) > new Date());
          default:
            return true;
        }
      });
    });
  }, [groupedThreads, activeFilters]);

  useEffect(() => {
    if (filteredThreads.length === 0) {
      setSelectedThreadId(null);
      return;
    }
    if (!selectedThreadId) {
      setSelectedThreadId(filteredThreads[0][0].threadId);
      return;
    }
    const stillVisible = filteredThreads.some((thread) => thread[0].threadId === selectedThreadId);
    if (!stillVisible) {
      setSelectedThreadId(filteredThreads[0][0].threadId);
    }
  }, [filteredThreads, selectedThreadId]);

  const selectedThread = useMemo(() => {
    if (!selectedThreadId) return undefined;
    return sortThreadChronologically(communications.filter((message) => message.threadId === selectedThreadId));
  }, [communications, selectedThreadId]);

  useEffect(() => {
    if (!selectedThread) {
      setDraftMessage('');
      setEmailSubject('');
      return;
    }
    setDraftMessage('');
    const latest = [...selectedThread].reverse()[0];
    if (latest.channel === 'email') {
      const lastSubject = [...selectedThread]
        .reverse()
        .find((message) => message.subject)?.subject;
      setEmailSubject(lastSubject ? (lastSubject.startsWith('Re:') ? lastSubject : `Re: ${lastSubject}`) : 'Re: Update');
    } else {
      setEmailSubject('');
    }
    setSelectedTemplate(null);
  }, [selectedThreadId, selectedThread]);

  const selectedLead = useMemo(() => {
    if (!selectedThread || selectedThread.length === 0) return undefined;
    return getLeadById(leads, selectedThread[0].leadId);
  }, [leads, selectedThread]);

  const selectedChannel = selectedThread?.[0]?.channel ?? 'sms';

  const threadReminders = useMemo(
    () =>
      selectedLead
        ? reminders
            .filter((reminder) => reminder.leadId === selectedLead.id)
            .sort((a, b) => parseISO(a.dueAt).getTime() - parseISO(b.dueAt).getTime())
        : [],
    [reminders, selectedLead],
  );

  const quickRepliesForChannel = useMemo(
    () => quickReplies.filter((reply) => reply.channel === (selectedChannel === 'call' ? 'sms' : selectedChannel)),
    [quickReplies, selectedChannel],
  );

  const templateChannel = selectedChannel === 'call' ? 'sms' : (selectedChannel as 'sms' | 'email');

  const handleToggleFilter = (filter: CommunicationFilter) => {
    setActiveFilters((prev) => (prev.includes(filter) ? prev.filter((item) => item !== filter) : [...prev, filter]));
  };

  const handleSelectThread = (thread: CommunicationRecord[]) => {
    const preview = getThreadPreview(thread);
    setSelectedThreadId(preview.threadId);
    markThreadRead(preview.threadId);
    setActiveLead(preview.leadId);
  };

  const handleInsertTemplate = (template: TemplateDefinition) => {
    setSelectedTemplate(template);
    setDraftMessage(template.body);
    if (template.subject) {
      setEmailSubject(template.subject);
    }
  };

  const handleSend = async () => {
    if (!selectedThread || !selectedLead) {
      toast({ title: 'Select a conversation', description: 'Choose a thread to reply to.' });
      return;
    }
    if (!draftMessage.trim()) {
      toast({ title: 'Message required', description: 'Add a message before sending.', variant: 'destructive' });
      return;
    }
    setSending(true);
    const nowIso = new Date().toISOString();
    const outbound: CommunicationRecord = {
      id: `out-${Math.random().toString(36).slice(2)}`,
      threadId: selectedThread[0].threadId,
      leadId: selectedLead.id,
      channel: selectedChannel,
      direction: 'outbound',
      subject: selectedChannel === 'email' ? emailSubject : undefined,
      preview: truncate(draftMessage, 90),
      body: draftMessage,
      createdAt: nowIso,
      status: 'sent',
      unread: false,
      starred: false,
      requiresReply: false,
      aiRecommendations: selectedTemplate?.variables ?? [],
    };
    addCommunication(outbound);
    markThreadRead(outbound.threadId);
    setDraftMessage('');
    setSelectedTemplate(null);
    toast({
      title: selectedChannel === 'email' ? 'Email sent' : 'Message sent',
      description: `Delivered to ${selectedLead.name}`,
    });
    setSending(false);
  };

  const filterDefinitions = useMemo(
    () =>
      filterOrder.map((id) => ({
        id,
        label:
          id === 'unread'
            ? 'Unread'
            : id === 'starred'
            ? 'Starred'
            : id === 'needsReply'
            ? 'Needs reply'
            : 'Follow-up',
        icon:
          id === 'unread' ? (
            <Mail className="h-4 w-4" />
          ) : id === 'starred' ? (
            <Star className="h-4 w-4" />
          ) : id === 'needsReply' ? (
            <MessageCircle className="h-4 w-4" />
          ) : (
            <Clock className="h-4 w-4" />
          ),
        count: filterCounts[id],
      })),
    [filterCounts],
  );

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Communication Center</h1>
          <p className="text-sm text-muted-foreground">
            Unified inbox with AI prioritization across calls, SMS, and email. Real-time updates stream in automatically.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link to="/call-center" className="flex items-center gap-2">
              <Phone className="h-4 w-4" /> Launch call controls
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/appointment-calendar" className="flex items-center gap-2">
              <Clock className="h-4 w-4" /> Schedule appointment
            </Link>
          </Button>
        </div>
      </div>

      <UnifiedFilters filters={filterDefinitions} active={activeFilters} onToggle={handleToggleFilter} onClear={() => setActiveFilters([])} />

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)} className="flex h-full flex-1 flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="call">Calls</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
          <TabsTrigger value="email">Email</TabsTrigger>
        </TabsList>
        <TabsContent value={activeTab} className="flex flex-1 flex-col gap-4 lg:flex-row">
          <Card className="flex h-[75vh] flex-col lg:w-1/3">
            <CardHeader className="border-b border-border/60 pb-4">
              <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                Inbox ({filteredThreads.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 overflow-hidden p-0">
              <ScrollArea className="h-full">
                <div className="divide-y divide-border/60">
                  {filteredThreads.map((thread) => {
                    const preview = getThreadPreview(thread);
                    const lead = getLeadById(leads, preview.leadId);
                    const isActive = selectedThreadId === preview.threadId;
                    return (
                      <button
                        key={preview.id}
                        type="button"
                        onClick={() => handleSelectThread(thread)}
                        className={cn(
                          'flex w-full items-start gap-3 bg-background px-4 py-3 text-left transition hover:bg-muted/60',
                          isActive ? 'border-l-4 border-primary bg-primary/5' : '',
                        )}
                      >
                        <Avatar className="h-10 w-10 border border-border/40">
                          <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${lead?.name ?? 'Lead'}`} />
                          <AvatarFallback>{getInitials(lead?.name)}</AvatarFallback>
                        </Avatar>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                              <span>{lead?.name ?? 'Unknown Lead'}</span>
                              {CHANNEL_ICONS[preview.channel]}
                              {thread.some((message) => message.requiresReply) ? (
                                <Badge variant="destructive" className="text-[10px]">
                                  Needs reply
                                </Badge>
                              ) : null}
                              {thread.some((message) => message.followUpDue && parseISO(message.followUpDue) > new Date()) ? (
                                <Badge variant="outline" className="text-[10px]">
                                  Follow-up
                                </Badge>
                              ) : null}
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground">
                                {formatDistanceToNow(parseISO(preview.createdAt), { addSuffix: true })}
                              </span>
                              <button
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleStar(preview.id);
                                }}
                                className="text-muted-foreground transition hover:text-yellow-500"
                              >
                                <Star className={cn('h-4 w-4', preview.starred ? 'fill-yellow-400 text-yellow-500' : '')} />
                              </button>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">{truncate(preview.preview)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          <div className="flex h-[75vh] flex-1 flex-col gap-4 lg:flex-row">
            <Card className="flex flex-1 flex-col">
              <CardHeader className="border-b border-border/60">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Conversation
                  {selectedChannel === 'call' ? (
                    <Badge variant="outline" className="text-[11px]">
                      Call summary
                    </Badge>
                  ) : null}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col p-0">
                {selectedThread ? (
                  <>
                    <ScrollArea className="h-full flex-1 p-6">
                      <div className="space-y-4">
                        {selectedThread.map((message) => (
                          <div
                            key={message.id}
                            className={cn(
                              'flex max-w-2xl flex-col gap-2 rounded-xl border border-border/60 bg-muted/30 p-4 shadow-sm',
                              message.direction === 'outbound'
                                ? 'ml-auto border-primary/60 bg-primary/10'
                                : 'mr-auto border-border/40',
                            )}
                          >
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                              <span className="font-semibold uppercase tracking-wide">
                                {message.direction === 'outbound' ? 'You' : selectedLead?.name ?? 'Lead'}
                              </span>
                              <span>{format(parseISO(message.createdAt), 'PPpp')}</span>
                            </div>
                            {message.subject ? (
                              <p className="text-sm font-semibold">{message.subject}</p>
                            ) : null}
                            <p className="whitespace-pre-line text-sm text-foreground">{message.body}</p>
                            <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" /> {formatDistanceToNow(parseISO(message.createdAt), { addSuffix: true })}
                              </span>
                              {message.status ? <Badge variant="outline">{message.status}</Badge> : null}
                              {message.sentiment ? (
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <Sparkles className="h-3 w-3" /> {message.sentiment}
                                </Badge>
                              ) : null}
                            </div>
                            {message.aiRecommendations && message.aiRecommendations.length ? (
                              <div className="flex flex-wrap gap-2">
                                {message.aiRecommendations.map((recommendation) => (
                                  <Badge key={recommendation} variant="secondary" className="text-[10px]">
                                    {recommendation}
                                  </Badge>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                    {selectedChannel === 'call' ? (
                      <div className="border-t border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                        This call is logged. Use the disposition modal in Call Center to capture next actions or send a recap via
                        email templates.
                      </div>
                    ) : (
                      <div className="border-t border-border/60 p-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <TemplatePicker channel={templateChannel} templates={templates} onSelect={handleInsertTemplate} />
                          <div className="flex flex-wrap gap-2">
                            {quickRepliesForChannel.map((reply) => (
                              <Button
                                key={reply.id}
                                type="button"
                                variant="secondary"
                                size="sm"
                                onClick={() => setDraftMessage(reply.content)}
                              >
                                {reply.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                        <div className="mt-4 space-y-3">
                          {selectedChannel === 'email' ? (
                            <Input
                              value={emailSubject}
                              onChange={(event) => setEmailSubject(event.target.value)}
                              placeholder="Email subject"
                            />
                          ) : null}
                          <Textarea
                            value={draftMessage}
                            onChange={(event) => setDraftMessage(event.target.value)}
                            placeholder={`Type your ${selectedChannel === 'email' ? 'email' : 'reply'}...`}
                            className="min-h-[140px]"
                          />
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3" />
                                {selectedTemplate ? 'Template applied with merge fields ready.' : 'AI suggests addressing incentives early.'}
                              </div>
                              <div className="flex items-center gap-1">
                                <CheckCircle className="h-3 w-3 text-emerald-500" />
                                Open & click tracking enabled
                              </div>
                            </div>
                            <Button type="button" onClick={handleSend} disabled={sending}>
                              <Send className="mr-2 h-4 w-4" /> Send
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    Select a conversation to view details.
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="flex w-full max-w-sm flex-col">
              <CardHeader className="border-b border-border/60 pb-4">
                <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                  Lead context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-4">
                {selectedLead ? (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-base font-semibold">{selectedLead.name}</p>
                        <p className="text-xs text-muted-foreground">{selectedLead.status} · {selectedLead.stage}</p>
                      </div>
                      <Badge variant="secondary" className="text-sm">
                        Score {selectedLead.leadScore}
                      </Badge>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" /> Last contact {formatDistanceToNow(parseISO(selectedLead.lastContact), { addSuffix: true })}
                      </p>
                      {selectedLead.nextContact ? (
                        <p className="flex items-center gap-2 text-muted-foreground">
                          <BellRing className="h-4 w-4" /> Next touch {formatDistanceToNow(parseISO(selectedLead.nextContact), { addSuffix: true })}
                        </p>
                      ) : null}
                      <p>Email: {selectedLead.email}</p>
                      <p>Phone: {selectedLead.phone}</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {selectedLead.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-[10px] uppercase tracking-wide">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold">Reminders</span>
                        <Badge variant="outline">{threadReminders.length}</Badge>
                      </div>
                      <div className="space-y-2">
                        {threadReminders.map((reminder) => (
                          <div key={reminder.id} className="rounded-md border border-border/40 bg-muted/20 p-2 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-foreground">{reminder.title}</span>
                              <Badge variant={reminder.completed ? 'secondary' : 'outline'}>
                                {reminder.completed ? 'Done' : format(parseISO(reminder.dueAt), 'PP p')}
                              </Badge>
                            </div>
                            <div className="mt-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Channel: {reminder.channel.toUpperCase()}</span>
                              {!reminder.completed ? (
                                <Button size="sm" variant="ghost" onClick={() => completeReminder(reminder.id)}>
                                  Complete
                                </Button>
                              ) : null}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <p className="text-sm font-semibold">Notifications</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Email alerts</span>
                        <Switch
                          checked={notificationPrefs.email}
                          onCheckedChange={(checked) => setNotificationPrefs((prefs) => ({ ...prefs, email: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>SMS nudges</span>
                        <Switch
                          checked={notificationPrefs.sms}
                          onCheckedChange={(checked) => setNotificationPrefs((prefs) => ({ ...prefs, sms: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Workspace push</span>
                        <Switch
                          checked={notificationPrefs.push}
                          onCheckedChange={(checked) => setNotificationPrefs((prefs) => ({ ...prefs, push: checked }))}
                        />
                      </div>
                    </div>
                    <Separator />
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/customer-profile?leadId=${selectedLead.id}`}>View full lead profile</Link>
                    </Button>
                  </>
                ) : (
                  <div className="flex flex-col items-center gap-3 text-center text-sm text-muted-foreground">
                    <AlertTriangle className="h-8 w-8" />
                    Select a conversation to load lead insights.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
