import { useMemo, useState } from 'react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import { Button } from '@repo/ui';
import { Label } from '@repo/ui';
import { RadioGroup, RadioGroupItem } from '@repo/ui';
import { Checkbox } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Input } from '@repo/ui';
import { Calendar } from '@repo/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { cn } from '@/lib/utils';
import { CalendarDays, Clock, Loader2 } from 'lucide-react';
import { addDays, addMinutes } from 'date-fns';

export interface DispositionForm {
  outcome: string;
  nextActions: string[];
  followUpAt?: Date;
  followUpChannel?: 'call' | 'sms' | 'email';
  notes: string;
  durationMinutes?: number;
}

export interface DispositionModalProps {
  open: boolean;
  isSubmitting?: boolean;
  leadName: string;
  defaultOutcome?: string;
  defaultDuration?: number;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: DispositionForm) => void;
}

const DISPOSITION_OUTCOMES = [
  { value: 'connected', label: 'Connected - Qualified' },
  { value: 'left-voicemail', label: 'Left Voicemail' },
  { value: 'reschedule', label: 'Reschedule Requested' },
  { value: 'no-show', label: 'No Show' },
  { value: 'not-interested', label: 'Not Interested' },
];

const FOLLOW_UP_CHANNELS: Array<{ value: 'call' | 'sms' | 'email'; label: string }> = [
  { value: 'call', label: 'Call' },
  { value: 'sms', label: 'SMS' },
  { value: 'email', label: 'Email' },
];

const NEXT_ACTIONS = [
  'Send recap email',
  'Schedule appointment',
  'Escalate to manager',
  'Send financing link',
  'Assign follow-up reminder',
];

export function DispositionModal({
  open,
  isSubmitting = false,
  leadName,
  defaultOutcome = 'connected',
  defaultDuration = 5,
  onOpenChange,
  onSubmit,
}: DispositionModalProps) {
  const [outcome, setOutcome] = useState(defaultOutcome);
  const [nextActions, setNextActions] = useState<string[]>(['Assign follow-up reminder']);
  const [followUpAt, setFollowUpAt] = useState<Date | undefined>(addMinutes(new Date(), 90));
  const [followUpChannel, setFollowUpChannel] = useState<'call' | 'sms' | 'email'>('sms');
  const [notes, setNotes] = useState('');
  const [durationMinutes, setDurationMinutes] = useState<number>(defaultDuration);

  const formattedFollowUp = useMemo(() => {
    if (!followUpAt) return 'Select date';
    return `${format(followUpAt, 'PPPP')} at ${format(followUpAt, 'p')}`;
  }, [followUpAt]);

  const toggleNextAction = (action: string) => {
    setNextActions((prev) =>
      prev.includes(action) ? prev.filter((item) => item !== action) : [...prev, action],
    );
  };

  const handleSubmit = () => {
    onSubmit({ outcome, nextActions, followUpAt, followUpChannel, notes, durationMinutes });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Log call disposition</DialogTitle>
          <DialogDescription>
            Capture the outcome and next steps for <span className="font-medium text-foreground">{leadName}</span>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2">
          <section className="space-y-3">
            <Label className="text-sm font-medium">Outcome</Label>
            <RadioGroup value={outcome} onValueChange={setOutcome} className="grid gap-2">
              {DISPOSITION_OUTCOMES.map((option) => (
                <Label
                  key={option.value}
                  htmlFor={`outcome-${option.value}`}
                  className={cn(
                    'flex cursor-pointer items-center justify-between rounded-md border border-border/50 bg-muted/30 px-4 py-3 text-sm shadow-sm transition hover:border-primary',
                    outcome === option.value ? 'border-primary bg-primary/5 text-primary-foreground' : '',
                  )}
                >
                  <div className="flex items-center gap-3">
                    <RadioGroupItem value={option.value} id={`outcome-${option.value}`} />
                    <span>{option.label}</span>
                  </div>
                </Label>
              ))}
            </RadioGroup>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Call duration (minutes)</Label>
              <Input
                type="number"
                min={1}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(Number(event.target.value) || 0)}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Notes & AI script highlights</Label>
              <Textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Summarize the conversation and capture any commitments."
                className="min-h-[120px]"
              />
            </div>
          </section>

          <section className="space-y-4">
            <div className="space-y-3 rounded-lg border border-border/60 bg-muted/20 p-4">
              <Label className="text-sm font-medium">Next actions</Label>
              <div className="grid gap-2">
                {NEXT_ACTIONS.map((action) => (
                  <Label key={action} className="flex items-center gap-2 text-sm">
                    <Checkbox
                      checked={nextActions.includes(action)}
                      onCheckedChange={() => toggleNextAction(action)}
                      id={`action-${action}`}
                    />
                    <span>{action}</span>
                  </Label>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Follow-up channel</Label>
              <div className="grid grid-cols-3 gap-2">
                {FOLLOW_UP_CHANNELS.map((channel) => (
                  <Button
                    key={channel.value}
                    type="button"
                    variant={followUpChannel === channel.value ? 'default' : 'outline'}
                    onClick={() => setFollowUpChannel(channel.value)}
                  >
                    {channel.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Follow-up time</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex w-full items-center justify-between gap-2 text-left font-normal"
                  >
                    <div className="flex flex-col text-left">
                      <span className="text-sm">{formattedFollowUp}</span>
                      <span className="text-xs text-muted-foreground">AI suggests 90 minutes after call</span>
                    </div>
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <Calendar
                    mode="single"
                    selected={followUpAt}
                    onSelect={(date) => date && setFollowUpAt(addMinutes(date, 90))}
                    disabled={(date) => date < addDays(new Date(), -1)}
                    initialFocus
                  />
                  <div className="mt-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={followUpAt ? format(followUpAt, 'HH:mm') : '09:00'}
                      onChange={(event) => {
                        if (!followUpAt) {
                          const base = new Date();
                          const [hours, minutes] = event.target.value.split(':').map(Number);
                          base.setHours(hours, minutes, 0, 0);
                          setFollowUpAt(base);
                          return;
                        }
                        const [hours, minutes] = event.target.value.split(':').map(Number);
                        const updated = new Date(followUpAt);
                        updated.setHours(hours, minutes, 0, 0);
                        setFollowUpAt(updated);
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm text-primary">
              Our AI assistant recommends confirming next steps via {followUpChannel.toUpperCase()} within 2 hours to
              maintain a {leadName.split(' ')[0]} satisfaction score above 90%.
            </div>
          </section>
        </div>

        <DialogFooter className="pt-4">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" /> Logging...
              </span>
            ) : (
              'Save disposition'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default DispositionModal;
