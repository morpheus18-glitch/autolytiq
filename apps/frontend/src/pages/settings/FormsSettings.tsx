import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/settings/RichTextEditor';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton';
import { useToast } from '@/hooks/use-toast';
import { fetchSettingsSection } from '@/lib/settingsApi';
import {
  downloadTemplatePdf,
  previewTemplateHtml,
  templatesResponseSchema,
  testSendTemplate,
  updateTemplate,
  type DocumentTemplate,
  type EmailTemplate,
  type SmsTemplate,
  type TemplatesResponse,
} from '@/lib/templatesApi';

const DEFAULT_TIMESTAMP = '2024-01-01T00:00:00.000Z';

const documentTemplateSeeds: Array<[id: string, name: string]> = [
  ['credit-application', 'Credit Application'],
  ['bill-of-sale', 'Bill of Sale'],
  ['purchase-agreement', 'Purchase Agreement'],
  ['trade-in-appraisal', 'Trade-In Appraisal'],
  ['delivery-checklist', 'Delivery Checklist'],
  ['customer-satisfaction', 'Customer Satisfaction Survey'],
];

const emailTemplateSeeds: Array<[id: string, name: string]> = [
  ['new-lead', 'New Lead Welcome'],
  ['appointment-confirmation', 'Appointment Confirmation'],
  ['deal-approved', 'Deal Approved'],
  ['payment-reminder', 'Payment Reminder'],
  ['service-reminder', 'Service Reminder'],
  ['follow-up', 'Follow-Up Sequences'],
];

const smsTemplateSeeds: Array<[id: string, name: string]> = [
  ['appointment-reminder', 'Appointment Reminder'],
  ['deal-update', 'Deal Update'],
  ['payment-due', 'Payment Due'],
  ['follow-up-message', 'Follow-Up Message'],
];

const defaultTemplates: TemplatesResponse = {
  documents: documentTemplateSeeds.map(([id, name]) => ({
    id,
    name,
    type: 'DOCUMENT',
    content: '',
    updatedAt: DEFAULT_TIMESTAMP,
  })),
  emails: emailTemplateSeeds.map(([id, name]) => ({
    id,
    name,
    type: 'EMAIL',
    subject: '',
    body: '',
    updatedAt: DEFAULT_TIMESTAMP,
  })),
  sms: smsTemplateSeeds.map(([id, name]) => ({
    id,
    name,
    type: 'SMS',
    message: '',
    updatedAt: DEFAULT_TIMESTAMP,
  })),
};

const documentEditorSchema = z.object({
  content: z.string().min(1, 'Document content is required.'),
});

const emailEditorSchema = z.object({
  subject: z.string().min(1, 'Subject is required.'),
  body: z.string().min(1, 'Email body is required.'),
});

const smsEditorSchema = z.object({
  message: z
    .string()
    .min(1, 'Message is required.')
    .max(160, 'SMS messages are limited to 160 characters.'),
});

const emailAddressSchema = z.string().email('Enter a valid email address.');
const phoneNumberSchema = z
  .string()
  .min(10, 'Enter a valid phone number.')
  .max(20, 'Phone number is too long.');

type DocumentEditorValues = z.infer<typeof documentEditorSchema>;
type EmailEditorValues = z.infer<typeof emailEditorSchema>;
type SmsEditorValues = z.infer<typeof smsEditorSchema>;

const EMAIL_VARIABLES = ['{{customerName}}', '{{vehicleName}}', '{{appointmentDate}}', '{{dealNumber}}'];
const SMS_VARIABLES = ['{{customerName}}', '{{appointmentDate}}', '{{vehicleName}}'];

export function FormsSettings(): JSX.Element {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const queryKey = ['settings', 'templates'] as const;

  const query = useQuery({
    queryKey,
    queryFn: () => fetchSettingsSection('templates', templatesResponseSchema, defaultTemplates),
  });

  const templates = query.data ?? defaultTemplates;
  const documents = templates.documents;
  const emails = templates.emails;
  const sms = templates.sms;

  const [activeEmailId, setActiveEmailId] = React.useState<string>(() => emails[0]?.id ?? emailTemplateSeeds[0][0]);
  const [activeSmsId, setActiveSmsId] = React.useState<string>(() => sms[0]?.id ?? smsTemplateSeeds[0][0]);
  const [documentEditor, setDocumentEditor] = React.useState<DocumentTemplate | null>(null);
  const [previewTemplate, setPreviewTemplate] = React.useState<{ name: string; html: string } | null>(null);
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const [previewingId, setPreviewingId] = React.useState<string | null>(null);
  const [downloadingId, setDownloadingId] = React.useState<string | null>(null);
  const [savingTemplateId, setSavingTemplateId] = React.useState<string | null>(null);
  const [testEmailAddress, setTestEmailAddress] = React.useState('');
  const [testSmsNumber, setTestSmsNumber] = React.useState('');

  const activeEmail = React.useMemo<EmailTemplate | null>(
    () => emails.find((template) => template.id === activeEmailId) ?? emails[0] ?? null,
    [activeEmailId, emails],
  );

  const activeSms = React.useMemo<SmsTemplate | null>(
    () => sms.find((template) => template.id === activeSmsId) ?? sms[0] ?? null,
    [activeSmsId, sms],
  );

  React.useEffect(() => {
    if (emails.length > 0 && !emails.some((template) => template.id === activeEmailId)) {
      setActiveEmailId(emails[0].id);
    }
  }, [activeEmailId, emails]);

  React.useEffect(() => {
    if (sms.length > 0 && !sms.some((template) => template.id === activeSmsId)) {
      setActiveSmsId(sms[0].id);
    }
  }, [activeSmsId, sms]);

  const documentForm = useForm<DocumentEditorValues>({
    resolver: zodResolver(documentEditorSchema),
    defaultValues: { content: '' },
  });

  const emailForm = useForm<EmailEditorValues>({
    resolver: zodResolver(emailEditorSchema),
    defaultValues: { subject: '', body: '' },
  });

  const smsForm = useForm<SmsEditorValues>({
    resolver: zodResolver(smsEditorSchema),
    defaultValues: { message: '' },
  });

  React.useEffect(() => {
    if (documentEditor) {
      documentForm.reset({ content: documentEditor.content });
    }
  }, [documentEditor, documentForm]);

  React.useEffect(() => {
    if (activeEmail) {
      emailForm.reset({ subject: activeEmail.subject, body: activeEmail.body });
    }
  }, [activeEmail, emailForm]);

  React.useEffect(() => {
    if (activeSms) {
      smsForm.reset({ message: activeSms.message });
    }
  }, [activeSms, smsForm]);

  const updateMutation = useMutation({
    mutationFn: updateTemplate,
    onSuccess: (updatedTemplate) => {
      queryClient.setQueryData(queryKey, (current: TemplatesResponse | undefined) => {
        if (!current) {
          return current;
        }

        const next: TemplatesResponse = JSON.parse(JSON.stringify(current));
        if (updatedTemplate.type === 'DOCUMENT') {
          next.documents = next.documents.map((template) =>
            template.id === updatedTemplate.id ? updatedTemplate : template,
          );
        } else if (updatedTemplate.type === 'EMAIL') {
          next.emails = next.emails.map((template) =>
            template.id === updatedTemplate.id ? updatedTemplate : template,
          );
        } else {
          next.sms = next.sms.map((template) =>
            template.id === updatedTemplate.id ? updatedTemplate : template,
          );
        }

        return next;
      });

      if (updatedTemplate.type === 'EMAIL' && activeEmail?.id === updatedTemplate.id) {
        emailForm.reset({ subject: updatedTemplate.subject, body: updatedTemplate.body });
      }

      if (updatedTemplate.type === 'SMS' && activeSms?.id === updatedTemplate.id) {
        smsForm.reset({ message: updatedTemplate.message });
      }

      toast({
        title: 'Template saved',
        description: `${updatedTemplate.name} has been updated.`,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save template.';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
    },
    onSettled: () => {
      setSavingTemplateId(null);
    },
  });

  const previewMutation = useMutation({
    mutationFn: ({ template }: { template: DocumentTemplate }) => previewTemplateHtml(template.id),
    onSuccess: (result, { template }) => {
      setPreviewTemplate({ name: template.name, html: result.html });
      setPreviewOpen(true);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to generate preview.';
      toast({ title: 'Preview failed', description: message, variant: 'destructive' });
    },
    onSettled: () => {
      setPreviewingId(null);
    },
  });

  const downloadMutation = useMutation({
    mutationFn: ({ template }: { template: DocumentTemplate }) => downloadTemplatePdf(template.id),
    onSuccess: (blob, { template }) => {
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${template.name.replace(/\s+/g, '-').toLowerCase()}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);

      toast({
        title: 'Download started',
        description: `${template.name} PDF is downloading.`,
      });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to download template.';
      toast({ title: 'Download failed', description: message, variant: 'destructive' });
    },
    onSettled: () => {
      setDownloadingId(null);
    },
  });

  const handleSaveDocument = documentForm.handleSubmit(async (values) => {
    if (!documentEditor) {
      return;
    }

    setSavingTemplateId(documentEditor.id);
    await updateMutation.mutateAsync({
      id: documentEditor.id,
      type: 'DOCUMENT',
      name: documentEditor.name,
      updatedAt: documentEditor.updatedAt,
      content: values.content,
    });

    setDocumentEditor(null);
  });

  const handleSaveEmail = emailForm.handleSubmit(async (values) => {
    if (!activeEmail) {
      return;
    }

    setSavingTemplateId(activeEmail.id);
    await updateMutation.mutateAsync({
      id: activeEmail.id,
      type: 'EMAIL',
      name: activeEmail.name,
      updatedAt: activeEmail.updatedAt,
      subject: values.subject,
      body: values.body,
    });
  });

  const handleSaveSms = smsForm.handleSubmit(async (values) => {
    if (!activeSms) {
      return;
    }

    setSavingTemplateId(activeSms.id);
    await updateMutation.mutateAsync({
      id: activeSms.id,
      type: 'SMS',
      name: activeSms.name,
      updatedAt: activeSms.updatedAt,
      message: values.message,
    });
  });

  const handleTestEmail = async (): Promise<void> => {
    if (!activeEmail) {
      throw new Error('Select an email template first.');
    }

    const parsedEmail = emailAddressSchema.safeParse(testEmailAddress.trim());
    if (!parsedEmail.success) {
      throw new Error(parsedEmail.error.issues[0]?.message ?? 'Enter a valid email address.');
    }

    const values = emailForm.getValues();
    const parsedTemplate = emailEditorSchema.safeParse(values);
    if (!parsedTemplate.success) {
      throw new Error(parsedTemplate.error.issues[0]?.message ?? 'Fix template errors before testing.');
    }

    await testSendTemplate({
      id: activeEmail.id,
      channel: 'EMAIL',
      recipient: parsedEmail.data,
      subject: parsedTemplate.data.subject,
      body: parsedTemplate.data.body,
    });
  };

  const handleTestSms = async (): Promise<void> => {
    if (!activeSms) {
      throw new Error('Select an SMS template first.');
    }

    const parsedNumber = phoneNumberSchema.safeParse(testSmsNumber.trim());
    if (!parsedNumber.success) {
      throw new Error(parsedNumber.error.issues[0]?.message ?? 'Enter a valid phone number.');
    }

    const values = smsForm.getValues();
    const parsedTemplate = smsEditorSchema.safeParse(values);
    if (!parsedTemplate.success) {
      throw new Error(parsedTemplate.error.issues[0]?.message ?? 'Fix template errors before testing.');
    }

    await testSendTemplate({
      id: activeSms.id,
      channel: 'SMS',
      recipient: parsedNumber.data,
      message: parsedTemplate.data.message,
    });
  };

  const handlePreviewDocument = (template: DocumentTemplate) => {
    setPreviewingId(template.id);
    previewMutation.mutate({ template });
  };

  const handleDownloadDocument = (template: DocumentTemplate) => {
    setDownloadingId(template.id);
    downloadMutation.mutate({ template });
  };

  const smsMessageValue = smsForm.watch('message');
  const smsMessageLength = smsMessageValue?.length ?? 0;

  if (query.isLoading) {
    return <Skeleton className="h-[640px] w-full" />;
  }

  return (
    <>
      <Tabs defaultValue="documents" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="emails">Emails</TabsTrigger>
          <TabsTrigger value="sms">SMS</TabsTrigger>
        </TabsList>
        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Document Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {documents.map((template) => (
                  <div key={template.id} className="flex flex-col justify-between rounded-lg border p-4 shadow-sm">
                    <div className="space-y-1">
                      <h3 className="text-base font-semibold">{template.name}</h3>
                      <p className="text-xs text-muted-foreground">
                        Last modified {new Date(template.updatedAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button variant="outline" size="sm" onClick={() => setDocumentEditor(template)}>
                        Edit
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handlePreviewDocument(template)}
                        disabled={previewMutation.isPending}
                      >
                        {previewMutation.isPending && previewingId === template.id ? 'Previewing…' : 'Preview'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownloadDocument(template)}
                        disabled={downloadMutation.isPending}
                      >
                        {downloadMutation.isPending && downloadingId === template.id ? 'Downloading…' : 'Download PDF'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="emails">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Email Templates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                {emails.map((template) => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => setActiveEmailId(template.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                      template.id === activeEmail?.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Last updated {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
              <div className="space-y-6">
                <Form {...emailForm}>
                  <form onSubmit={handleSaveEmail} className="space-y-6">
                    <FormField
                      control={emailForm.control}
                      name="subject"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Subject</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Welcome to our dealership!" />
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
                          <FormLabel>Email Body</FormLabel>
                          <FormControl>
                            <RichTextEditor
                              value={field.value}
                              onChange={field.onChange}
                              variables={EMAIL_VARIABLES}
                              description="Use merge tags to personalize emails."
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-end">
                        <div className="flex-1 space-y-1">
                          <Label htmlFor="test-email">Send test email to</Label>
                          <Input
                            id="test-email"
                            type="email"
                            value={testEmailAddress}
                            onChange={(event) => setTestEmailAddress(event.target.value)}
                            placeholder="sales-manager@example.com"
                          />
                        </div>
                        <TestConnectionButton
                          variant="outline"
                          onTest={handleTestEmail}
                          successMessage="Test email sent"
                          errorMessage="Test email failed"
                        >
                          Send Test Email
                        </TestConnectionButton>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Test sends use the current subject and body with sample merge data.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!activeEmail || (updateMutation.isPending && savingTemplateId === activeEmail.id)}
                      >
                        {updateMutation.isPending && savingTemplateId === activeEmail?.id
                          ? 'Saving…'
                          : 'Save Email Template'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">SMS Templates</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                {sms.map((template) => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => setActiveSmsId(template.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                      template.id === activeSms?.id
                        ? 'border-primary bg-primary/10 text-primary'
                        : 'border-border hover:bg-muted'
                    }`}
                  >
                    <div className="font-medium">{template.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Last updated {new Date(template.updatedAt).toLocaleDateString()}
                    </div>
                  </button>
                ))}
              </div>
              <div className="space-y-6">
                <Form {...smsForm}>
                  <form onSubmit={handleSaveSms} className="space-y-6">
                    <FormField
                      control={smsForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Message
                            <span className="ml-2 text-xs text-muted-foreground">({smsMessageLength}/160)</span>
                          </FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              onChange={(event) => field.onChange(event.target.value.slice(0, 160))}
                              placeholder="Hi {{customerName}}, your appointment is confirmed for {{appointmentDate}}."
                              className="min-h-[180px]"
                            />
                          </FormControl>
                          <p className="text-xs text-muted-foreground">
                            Available variables: {SMS_VARIABLES.join(', ')}
                          </p>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="space-y-3 rounded-lg border p-4">
                      <div className="flex flex-col gap-2 md:flex-row md:items-end">
                        <div className="flex-1 space-y-1">
                          <Label htmlFor="test-sms">Send test SMS to</Label>
                          <Input
                            id="test-sms"
                            value={testSmsNumber}
                            onChange={(event) => setTestSmsNumber(event.target.value)}
                            placeholder="+15551234567"
                          />
                        </div>
                        <TestConnectionButton
                          variant="outline"
                          onTest={handleTestSms}
                          successMessage="Test SMS sent"
                          errorMessage="Test SMS failed"
                        >
                          Send Test SMS
                        </TestConnectionButton>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        SMS messages are capped at 160 characters. Variables expand with live customer data.
                      </p>
                    </div>
                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        disabled={!activeSms || (updateMutation.isPending && savingTemplateId === activeSms.id)}
                      >
                        {updateMutation.isPending && savingTemplateId === activeSms?.id
                          ? 'Saving…'
                          : 'Save SMS Template'}
                      </Button>
                    </div>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={Boolean(documentEditor)} onOpenChange={(open) => { if (!open) setDocumentEditor(null); }}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{documentEditor?.name ?? 'Edit Document Template'}</DialogTitle>
            <DialogDescription>
              Maintain compliance and consistency across every deal document.
            </DialogDescription>
          </DialogHeader>
          <Form {...documentForm}>
            <form onSubmit={handleSaveDocument} className="space-y-6">
              <FormField
                control={documentForm.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Template Content</FormLabel>
                    <FormControl>
                      <RichTextEditor value={field.value} onChange={field.onChange} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDocumentEditor(null)}
                  disabled={updateMutation.isPending && savingTemplateId === documentEditor?.id}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={updateMutation.isPending && savingTemplateId === documentEditor?.id}
                >
                  {updateMutation.isPending && savingTemplateId === documentEditor?.id
                    ? 'Saving…'
                    : 'Save Document'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Preview — {previewTemplate?.name}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[70vh] rounded border p-4">
            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: previewTemplate?.html ?? '' }}
            />
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default FormsSettings;
