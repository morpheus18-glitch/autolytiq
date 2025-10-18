import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import {
  CommunicationRecord,
  getLeadById,
  getThreadPreview,
  groupCommunicationsByThread,
  useCommunicationsStore,
} from '@/stores/communications-store';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Paperclip, Send, Smile, Sparkles, Star, UploadCloud } from 'lucide-react';
import { format, formatDistanceToNow, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

const emojiPalette = ['😀', '🚗', '🎉', '✅', '⚡️', '📅', '👍', '🙏', '🔥', '💡'];

const getInitials = (name?: string) =>
  name
    ?.split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() ?? 'LM';

export default function SMSInbox() {
  const { communications, leads, quickReplies, addCommunication, markThreadRead, toggleStar } = useCommunicationsStore(
    (state) => ({
      communications: state.communications,
      leads: state.leads,
      quickReplies: state.quickReplies.filter((reply) => reply.channel === 'sms'),
      addCommunication: state.addCommunication,
      markThreadRead: state.markThreadRead,
      toggleStar: state.toggleStar,
    }),
  );
  const { toast } = useToast();

  const smsThreads = useMemo(() => groupCommunicationsByThread(communications, 'sms'), [communications]);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(smsThreads[0]?.[0].threadId ?? null);
  const [draft, setDraft] = useState('');

  const activeThread = useMemo<CommunicationRecord[] | undefined>(() => {
    if (!activeThreadId) return undefined;
    return communications
      .filter((message) => message.threadId === activeThreadId)
      .sort((a, b) => parseISO(a.createdAt).getTime() - parseISO(b.createdAt).getTime());
  }, [communications, activeThreadId]);

  const activeLead = useMemo(() => (activeThread ? getLeadById(leads, activeThread[0].leadId) : undefined), [activeThread, leads]);

  const handleSelectThread = (threadId: string) => {
    setActiveThreadId(threadId);
    markThreadRead(threadId);
  };

  const handleSend = () => {
    if (!activeThread || !activeLead) {
      toast({ title: 'Select a conversation', description: 'Choose a thread to reply to.' });
      return;
    }
    if (!draft.trim()) {
      toast({ title: 'Message empty', description: 'Type a message before sending.', variant: 'destructive' });
      return;
    }
    const outbound: CommunicationRecord = {
      id: `sms-${Math.random().toString(36).slice(2)}`,
      threadId: activeThread[0].threadId,
      leadId: activeLead.id,
      channel: 'sms',
      direction: 'outbound',
      preview: draft,
      body: draft,
      createdAt: new Date().toISOString(),
      status: 'sent',
      unread: false,
      starred: false,
      requiresReply: false,
    };
    addCommunication(outbound);
    setDraft('');
    toast({ title: 'SMS sent', description: `Delivered to ${activeLead.name}` });
  };

  return (
    <div className="flex h-full flex-col gap-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold">SMS Inbox</h1>
        <p className="text-sm text-muted-foreground">Threaded conversations with quick replies, emoji, and attachment support.</p>
      </div>
      <div className="flex h-[75vh] flex-1 flex-col gap-4 lg:flex-row">
        <Card className="flex w-full flex-col lg:w-1/3">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Conversations ({smsThreads.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-hidden p-0">
            <ScrollArea className="h-full">
              <div className="divide-y divide-border/60">
                {smsThreads.map((thread) => {
                  const preview = getThreadPreview(thread);
                  const lead = getLeadById(leads, preview.leadId);
                  const isActive = activeThreadId === preview.threadId;
                  return (
                    <button
                      key={preview.id}
                      type="button"
                      onClick={() => handleSelectThread(preview.threadId)}
                      className={cn(
                        'flex w-full items-start gap-3 bg-background px-4 py-3 text-left transition hover:bg-muted/60',
                        isActive ? 'border-l-4 border-primary bg-primary/5' : '',
                      )}
                    >
                      <Avatar className="h-10 w-10 border border-border/40">
                        <AvatarFallback>{getInitials(lead?.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex flex-1 flex-col gap-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <span>{lead?.name ?? 'Lead'}</span>
                            {thread.some((message) => message.requiresReply) ? (
                              <Badge variant="destructive" className="text-[10px]">
                                Needs reply
                              </Badge>
                            ) : null}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{formatDistanceToNow(parseISO(preview.createdAt), { addSuffix: true })}</span>
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
                        <p className="text-xs text-muted-foreground">{preview.preview}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="flex flex-1 flex-col">
          <CardHeader className="border-b border-border/60">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              {activeLead ? activeLead.name : 'Select a conversation'}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-1 flex-col p-0">
            {activeThread ? (
              <>
                <ScrollArea className="h-full flex-1 p-6">
                  <div className="space-y-3">
                    {activeThread.map((message) => (
                      <div
                        key={message.id}
                        className={cn(
                          'max-w-[75%] rounded-2xl px-4 py-3 text-sm shadow-sm',
                          message.direction === 'outbound'
                            ? 'ml-auto bg-primary text-primary-foreground'
                            : 'mr-auto border border-border/60 bg-background',
                        )}
                      >
                        <p className="whitespace-pre-line">{message.body}</p>
                        <div className="mt-2 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
                          <span>{format(parseISO(message.createdAt), 'p')}</span>
                          <Badge variant="outline">{message.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="space-y-3 border-t border-border/60 p-4">
                  <div className="flex flex-wrap gap-2">
                    {quickReplies.map((reply) => (
                      <Button key={reply.id} size="sm" variant="secondary" onClick={() => setDraft(reply.content)}>
                        {reply.label}
                      </Button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Button type="button" variant="outline" size="icon">
                        <Paperclip className="h-4 w-4" />
                      </Button>
                      <Button type="button" variant="outline" size="icon">
                        <UploadCloud className="h-4 w-4" />
                      </Button>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button type="button" variant="outline" size="icon">
                            <Smile className="h-4 w-4" />
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="grid w-48 grid-cols-5 gap-2 p-2">
                          {emojiPalette.map((emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              className="text-2xl"
                              onClick={() => setDraft((value) => `${value}${emoji}`)}
                            >
                              {emoji}
                            </button>
                          ))}
                        </PopoverContent>
                      </Popover>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      AI sentiment stable · {activeThread.filter((message) => message.direction === 'outbound').length} replies sent
                    </span>
                  </div>
                  <Textarea
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Type a message..."
                    className="min-h-[120px]"
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Sparkles className="h-3 w-3" /> Suggested: Offer instant reschedule link.
                    </div>
                    <Button onClick={handleSend} className="gap-2">
                      <Send className="h-4 w-4" /> Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                Select an SMS thread to begin.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
