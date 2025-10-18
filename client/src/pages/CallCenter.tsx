import { useEffect, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  CommunicationRecord,
  LeadProfile,
  Reminder,
  useCommunicationsStore,
} from '@/stores/communications-store';
import DispositionModal, { DispositionForm } from '@/components/communications/DispositionModal';
import { formatDistanceToNow } from 'date-fns';
import { AlertCircle, Clock, Headset, PhoneIncoming, PhoneOutgoing, Sparkles } from 'lucide-react';

const callScripts: Record<string, string[]> = {
  discovery: [
    'Confirm preferred vehicle configuration and usage needs.',
    'Validate financing comfort and timeline to purchase.',
    'Offer AI-generated incentive stack based on buyer persona.',
  ],
  followUp: [
    'Confirm previous touch-point outcomes and next steps.',
    'Share relevant testimonial or delivery timeline confidence.',
    'Close with a specific call-to-action (appt, deposit, financing).',
  ],
};

const generateReminderId = () =>
  `rem-${typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2)}`;

export default function CallCenter() {
  const { leads, addCommunication, addReminder } = useCommunicationsStore((state) => ({
    leads: state.leads,
    addCommunication: state.addCommunication,
    addReminder: state.addReminder,
  }));
  const { toast } = useToast();

  const [callModalOpen, setCallModalOpen] = useState(false);
  const [dispositionOpen, setDispositionOpen] = useState(false);
  const [activeLead, setActiveLead] = useState<LeadProfile | null>(null);
  const [callState, setCallState] = useState<'idle' | 'ringing' | 'connected' | 'ended'>('idle');
  const [callNotes, setCallNotes] = useState('');
  const [callDuration, setCallDuration] = useState(0);

  const callQueue = useMemo(
    () =>
      leads
        .slice()
        .sort((a, b) => b.leadScore - a.leadScore)
        .map((lead) => ({
          lead,
          reason:
            lead.nextContact && new Date(lead.nextContact) < new Date()
              ? 'Follow-up due now'
              : 'High engagement',
        })),
    [leads],
  );

  useEffect(() => {
    if (callState !== 'connected') {
      return;
    }
    const interval = setInterval(() => setCallDuration((value) => value + 1), 1000);
    return () => clearInterval(interval);
  }, [callState]);

  useEffect(() => {
    if (callState !== 'ringing') {
      return;
    }
    const timeout = setTimeout(() => setCallState('connected'), 1500);
    return () => clearTimeout(timeout);
  }, [callState]);

  const handleDialLead = (lead: LeadProfile) => {
    setActiveLead(lead);
    setCallState('ringing');
    setCallNotes('');
    setCallDuration(0);
    setCallModalOpen(true);
  };

  const handleHangUp = () => {
    setCallModalOpen(false);
    setCallState('ended');
    setDispositionOpen(true);
  };

  const handleDispositionSubmit = (form: DispositionForm) => {
    if (!activeLead) return;
    const nowIso = new Date().toISOString();
    const record: CommunicationRecord = {
      id: `call-${Math.random().toString(36).slice(2)}`,
      threadId: `thread-${activeLead.id}-call`,
      leadId: activeLead.id,
      channel: 'call',
      direction: 'outbound',
      preview: `${form.outcome} · ${callNotes || 'Call logged'}`,
      body: callNotes || 'Call summary captured in disposition.',
      createdAt: nowIso,
      status: form.outcome === 'connected' ? 'answered' : 'missed',
      unread: false,
      starred: form.outcome === 'connected',
      requiresReply: form.nextActions.includes('Send recap email') || form.nextActions.includes('Schedule appointment'),
      followUpDue: form.followUpAt ? form.followUpAt.toISOString() : undefined,
      durationSeconds: (form.durationMinutes ?? callDuration / 60) * 60,
      transcriptSummary: form.notes,
      aiRecommendations: form.nextActions,
    };

    addCommunication(record);

    if (form.followUpAt) {
      const reminder: Reminder = {
        id: generateReminderId(),
        leadId: activeLead.id,
        title: `${form.followUpChannel?.toUpperCase() ?? 'Follow-up'} after call`,
        dueAt: form.followUpAt.toISOString(),
        channel: form.followUpChannel ?? 'call',
        notifyMinutesBefore: 30,
        completed: false,
      };
      addReminder(reminder);
    }

    setDispositionOpen(false);
    setCallState('idle');
    toast({ title: 'Call logged', description: `${activeLead.name} disposition saved.` });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Call Center</h1>
        <p className="text-sm text-muted-foreground">
          Click-to-call with AI prompts and structured dispositions keeps every conversation actionable.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
        <Card className="border-border/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Priority queue</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[70vh]">
              <div className="divide-y divide-border/60">
                {callQueue.map(({ lead, reason }) => (
                  <div key={lead.id} className="flex items-center justify-between gap-4 px-6 py-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-base font-semibold text-foreground">{lead.name}</span>
                        <Badge variant="secondary">Score {lead.leadScore}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {lead.status} · Last touch {formatDistanceToNow(new Date(lead.lastContact), { addSuffix: true })}
                      </p>
                      <p className="mt-1 text-xs text-emerald-600 dark:text-emerald-300">{reason}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button onClick={() => handleDialLead(lead)} className="gap-2">
                        <PhoneOutgoing className="h-4 w-4" /> Call now
                      </Button>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Sparkles className="h-3 w-3" /> AI suggests referencing {lead.nextBestOffer.title}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader className="border-b border-border/60 pb-4">
            <CardTitle className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Team call health</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                <span>Connection rate</span>
                <span>82%</span>
              </div>
              <Progress value={82} className="mt-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                <span>Avg handle time</span>
                <span>06:12</span>
              </div>
              <Progress value={64} className="mt-2" />
            </div>
            <div>
              <div className="flex items-center justify-between text-xs uppercase text-muted-foreground">
                <span>Next actions scheduled</span>
                <span>74%</span>
              </div>
              <Progress value={74} className="mt-2" />
            </div>
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 p-3 text-xs text-amber-800 dark:text-amber-200">
              <AlertCircle className="mr-2 inline h-4 w-4" />
              Pro tip: dispositions with scheduled follow-ups convert 3× better than voicemail-only outcomes.
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={callModalOpen} onOpenChange={(open) => (open ? setCallModalOpen(true) : handleHangUp())}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
              <Headset className="h-5 w-5 text-primary" />
              {callState === 'ringing' ? 'Dialing' : callState === 'connected' ? 'Live call' : 'Disconnected'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="rounded-lg border border-border/60 bg-muted/20 p-4">
              <p className="text-sm font-semibold">{activeLead?.name}</p>
              <p className="text-xs text-muted-foreground">{activeLead?.phone}</p>
              <p className="text-xs text-muted-foreground">{activeLead?.stage} · {activeLead?.status}</p>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background p-4">
              <div className="text-sm font-semibold">
                {callState === 'ringing' ? 'Connecting…' : `Call duration ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`}
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Clock className="h-4 w-4" /> Auto-logging in CRM
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">AI talking points</p>
                <div className="space-y-2 rounded-md border border-primary/40 bg-primary/5 p-3 text-sm">
                  {(callScripts.discovery || []).map((line) => (
                    <p key={line}>• {line}</p>
                  ))}
                </div>
                <div className="space-y-2 rounded-md border border-secondary/40 bg-secondary/10 p-3 text-sm">
                  {(callScripts.followUp || []).map((line) => (
                    <p key={line}>• {line}</p>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Call notes</p>
                <Textarea
                  value={callNotes}
                  onChange={(event) => setCallNotes(event.target.value)}
                  placeholder="Log commitments, objections, and follow-ups."
                  className="min-h-[180px]"
                />
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={handleHangUp} variant="destructive" className="gap-2">
                <PhoneIncoming className="h-4 w-4" /> Hang up & disposition
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DispositionModal
        open={dispositionOpen}
        onOpenChange={(open) => setDispositionOpen(open)}
        leadName={activeLead?.name ?? 'Lead'}
        defaultDuration={Math.max(5, Math.round(callDuration / 60))}
        onSubmit={handleDispositionSubmit}
      />
    </div>
  );
}
