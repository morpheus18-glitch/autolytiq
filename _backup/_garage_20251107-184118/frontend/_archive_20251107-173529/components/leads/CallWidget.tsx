import { useEffect, useMemo, useState } from 'react';
import { Phone, PhoneOff, MicOff, Mic, Volume2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Button } from '@repo/ui';
import { Textarea } from '@repo/ui';
import dayjs from 'dayjs';
import { useToast } from '@repo/ui';

interface CallWidgetProps {
  leadName: string;
  phoneNumber?: string | null;
  onInitiate?: (phoneNumber: string) => Promise<void> | void;
  onComplete?: (note: string) => Promise<void> | void;
}

export function CallWidget({ leadName, phoneNumber, onInitiate, onComplete }: CallWidgetProps) {
  const [isCalling, setIsCalling] = useState(false);
  const [callStartedAt, setCallStartedAt] = useState<Date | null>(null);
  const [note, setNote] = useState('');
  const [mute, setMute] = useState(false);
  const { toast } = useToast();

  const formattedNumber = useMemo(() => {
    if (!phoneNumber) return 'No number on file';
    return phoneNumber.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
  }, [phoneNumber]);

  useEffect(() => {
    if (isCalling && !callStartedAt) {
      setCallStartedAt(new Date());
    }
  }, [isCalling, callStartedAt]);

  const callDuration = useMemo(() => {
    if (!callStartedAt) return '00:00';
    const diff = dayjs().diff(callStartedAt, 'second');
    const minutes = String(Math.floor(diff / 60)).padStart(2, '0');
    const seconds = String(diff % 60).padStart(2, '0');
    return `${minutes}:${seconds}`;
  }, [callStartedAt]);

  const handleStartCall = async () => {
    if (!phoneNumber) {
      toast({ title: 'No phone number available', variant: 'destructive' });
      return;
    }

    try {
      await onInitiate?.(phoneNumber);
      setIsCalling(true);
      setCallStartedAt(new Date());
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to initiate call';
      toast({ title: 'Call failed', description: message, variant: 'destructive' });
    }
  };

  const handleEndCall = async () => {
    setIsCalling(false);
    if (note.trim()) {
      await onComplete?.(note);
      toast({ title: 'Call logged', description: 'Your notes have been saved.' });
      setNote('');
    }
  };

  return (
    <Card className="border-slate-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold text-slate-900">Call {leadName}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm text-slate-600">
        <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
          <span className="font-medium text-slate-900">{formattedNumber}</span>
          <span className="text-xs uppercase text-slate-500">{isCalling ? 'Live' : 'Ready'}</span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="flex-1 bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={handleStartCall}
            disabled={isCalling}
          >
            <Phone className="mr-2 h-4 w-4" /> Start Call
          </Button>
          <Button variant="outline" size="icon" onClick={() => setMute((prev) => !prev)} disabled={!isCalling}>
            {mute ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button variant="outline" size="icon" disabled={!isCalling}>
            <Volume2 className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>{isCalling ? `Duration ${callDuration}` : 'Not connected'}</span>
          {isCalling && (
            <Button variant="destructive" size="sm" onClick={handleEndCall}>
              <PhoneOff className="mr-2 h-4 w-4" /> End Call
            </Button>
          )}
        </div>
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase text-slate-500">Call Notes</label>
          <Textarea
            placeholder="Document outcomes, objections, and next steps"
            value={note}
            rows={4}
            onChange={(event) => setNote(event.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default CallWidget;
