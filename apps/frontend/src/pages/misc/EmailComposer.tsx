import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { TemplatePicker } from '@/components/communications/TemplatePicker.tsx';
import { RichTextEditor } from '@/components/settings/RichTextEditor.tsx';
import {
  CommunicationRecord,
  TemplateDefinition,
  useCommunicationsStore,
} from '@/stores/communications-store';
import { addHours, format, isAfter } from 'date-fns';
import { CalendarDays, Clock, Paperclip, Send, Sparkles } from 'lucide-react';

interface AttachmentItem {
  id: string;
  name: string;
  size: string;
}

const generateAttachment = (): AttachmentItem => {
  const id = Math.random().toString(36).slice(2);
  const sampleFiles = [
    { name: 'PaymentOptions.pdf', size: '245 KB' },
    { name: 'BuildSheet.xlsx', size: '192 KB' },
    { name: 'LoyaltyIncentives.pdf', size: '356 KB' },
  ];
  return { id, ...sampleFiles[Math.floor(Math.random() * sampleFiles.length)] };
};

export default function EmailComposer() {
  const { leads, templates, addCommunication } = useCommunicationsStore((state) => ({
    leads: state.leads,
    templates: state.templates,
    addCommunication: state.addCommunication,
  }));
  const { toast } = useToast();

  const [leadId, setLeadId] = useState(leads[0]?.id ?? '');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [scheduleAt, setScheduleAt] = useState<Date | undefined>(addHours(new Date(), 2));
  const [openTracking, setOpenTracking] = useState(true);
  const [clickTracking, setClickTracking] = useState(true);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);

  const selectedLead = leads.find((lead) => lead.id === leadId);

  const mergeFields = useMemo(() => {
    const unique = new Set<string>();
    templates
      .filter((template) => template.channel === 'email')
      .forEach((template) => template.variables.forEach((variable) => unique.add(variable)));
    return Array.from(unique);
  }, [templates]);

  const handleTemplateSelect = (template: TemplateDefinition) => {
    setSubject(template.subject ?? subject);
    setBody(template.body);
  };

  const handleAddAttachment = () => {
    setAttachments((prev) => [...prev, generateAttachment()]);
  };

  const handleRemoveAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((item) => item.id !== id));
  };

  const handleSend = () => {
    if (!selectedLead) {
      toast({ title: 'Select a lead', description: 'Choose a recipient before sending.', variant: 'destructive' });
      return;
    }
    if (!subject.trim() || !body.trim()) {
      toast({ title: 'Email incomplete', description: 'Subject and body are required.', variant: 'destructive' });
      return;
    }

    const scheduled = scheduleAt && isAfter(scheduleAt, new Date());
    const record: CommunicationRecord = {
      id: `email-${Math.random().toString(36).slice(2)}`,
      threadId: `thread-${selectedLead.id}-email`,
      leadId: selectedLead.id,
      channel: 'email',
      direction: 'outbound',
      subject,
      preview: body.slice(0, 90),
      body,
      createdAt: new Date().toISOString(),
      status: scheduled ? 'scheduled' : 'sent',
      unread: false,
      starred: false,
      requiresReply: false,
      attachments: attachments.map((attachment) => ({ name: attachment.name, url: '#', type: 'file' })),
      aiRecommendations: [
        openTracking ? 'Open tracking enabled' : 'Open tracking disabled',
        clickTracking ? 'Click tracking enabled' : 'Click tracking disabled',
      ],
    };

    addCommunication(record);
    toast({
      title: scheduled ? 'Email scheduled' : 'Email sent',
      description: `${selectedLead.name} will receive the update ${scheduled ? `on ${format(scheduleAt!, 'PPpp')}` : 'shortly'}.`,
    });
    setBody('');
    setSubject('');
    setAttachments([]);
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Email Composer</h1>
        <p className="text-sm text-muted-foreground">
          Drag-and-drop templates, merge fields, and delivery intelligence for high-performing outreach.
        </p>
      </div>
      <Card className="border-border/60">
        <CardHeader className="border-b border-border/60 pb-4">
          <CardTitle className="flex items-center justify-between text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Compose email
            <TemplatePicker channel="email" templates={templates} triggerLabel="Templates" onSelect={handleTemplateSelect} />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Recipient</Label>
              <Select value={leadId} onValueChange={setLeadId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select lead" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead) => (
                    <SelectItem key={lead.id} value={lead.id}>
                      {lead.name} · {lead.email}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Schedule send</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button type="button" variant="outline" className="flex w-full items-center justify-between">
                    <span>{scheduleAt ? format(scheduleAt, 'PPpp') : 'Send immediately'}</span>
                    <CalendarDays className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <Calendar mode="single" selected={scheduleAt} onSelect={(date) => date && setScheduleAt(addHours(date, 9))} />
                  <div className="mt-4 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="time"
                      value={scheduleAt ? format(scheduleAt, 'HH:mm') : '09:00'}
                      onChange={(event) => {
                        const [hours, minutes] = event.target.value.split(':').map(Number);
                        setScheduleAt((prev) => {
                          const date = prev ?? new Date();
                          const clone = new Date(date);
                          clone.setHours(hours, minutes, 0, 0);
                          return clone;
                        });
                      }}
                    />
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Subject</Label>
            <Input value={subject} onChange={(event) => setSubject(event.target.value)} placeholder="Subject line" />
          </div>

          <div className="space-y-2">
            <Label>Body</Label>
            <RichTextEditor value={body} onChange={setBody} variables={mergeFields} />
          </div>

          <div className="space-y-3">
            <Label>Attachments</Label>
            <div className="flex flex-wrap gap-2">
              {attachments.map((attachment) => (
                <Badge key={attachment.id} variant="secondary" className="flex items-center gap-2">
                  <Paperclip className="h-3 w-3" />
                  {attachment.name}
                  <span className="text-[10px] text-muted-foreground">{attachment.size}</span>
                  <button type="button" onClick={() => handleRemoveAttachment(attachment.id)} className="text-xs text-destructive">
                    Remove
                  </button>
                </Badge>
              ))}
              <Button type="button" variant="outline" size="sm" onClick={handleAddAttachment} className="gap-2">
                <Paperclip className="h-4 w-4" /> Add attachment
              </Button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Engagement tracking</Label>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
                <span>Open tracking</span>
                <Switch checked={openTracking} onCheckedChange={(checked) => setOpenTracking(checked)} />
              </div>
              <div className="flex items-center justify-between rounded-md border border-border/60 bg-muted/20 p-3 text-sm">
                <span>Click tracking</span>
                <Switch checked={clickTracking} onCheckedChange={(checked) => setClickTracking(checked)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Merge fields</Label>
              <div className="flex flex-wrap gap-2">
                {mergeFields.map((field) => (
                  <Badge key={field} variant="outline" className="text-[10px] uppercase tracking-wide">
                    {field}
                  </Badge>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Highlighted fields auto-populate with lead data, ensuring personalized outreach.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Sparkles className="h-4 w-4" />
              {scheduleAt && isAfter(scheduleAt, new Date())
                ? 'AI recommends sending two hours before appointment for best engagement.'
                : 'Optimal send window is weekday mornings — AI will adjust if engagement drops.'}
            </div>
            <Button onClick={handleSend} className="gap-2">
              <Send className="h-4 w-4" /> {scheduleAt && isAfter(scheduleAt, new Date()) ? 'Schedule send' : 'Send now'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
