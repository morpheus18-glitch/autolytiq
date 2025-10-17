import { useEffect, useMemo, useState } from 'react';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { RichTextEditor } from '@/components/settings/RichTextEditor';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton';
import { useSettingsSection } from './useSettingsSection';

const DEFAULT_TIMESTAMP = '2024-01-01T00:00:00.000Z';

const documentTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  content: z.string(),
  updatedAt: z.string(),
});

const emailTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  subject: z.string(),
  body: z.string(),
  updatedAt: z.string(),
});

const smsTemplateSchema = z.object({
  id: z.string(),
  name: z.string(),
  message: z.string().max(480),
  updatedAt: z.string(),
});

const formSchema = z.object({
  documents: z.array(documentTemplateSchema),
  emails: z.array(emailTemplateSchema),
  sms: z.array(smsTemplateSchema),
});

export type FormsSettingsForm = z.infer<typeof formSchema>;

const documentTemplates = [
  { id: 'credit-application', name: 'Credit Application' },
  { id: 'bill-of-sale', name: 'Bill of Sale' },
  { id: 'purchase-agreement', name: 'Purchase Agreement' },
  { id: 'trade-in-appraisal', name: 'Trade-In Appraisal' },
  { id: 'delivery-checklist', name: 'Delivery Checklist' },
  { id: 'customer-satisfaction', name: 'Customer Satisfaction Survey' },
];

const emailTemplates = [
  { id: 'new-lead', name: 'New Lead Welcome' },
  { id: 'appointment-confirmation', name: 'Appointment Confirmation' },
  { id: 'deal-approved', name: 'Deal Approved' },
  { id: 'payment-reminder', name: 'Payment Reminder' },
  { id: 'service-reminder', name: 'Service Reminder' },
  { id: 'follow-up', name: 'Follow-Up Sequences' },
];

const smsTemplates = [
  { id: 'appointment-reminder', name: 'Appointment Reminder' },
  { id: 'deal-update', name: 'Deal Update' },
  { id: 'payment-due', name: 'Payment Due' },
  { id: 'follow-up-message', name: 'Follow-Up Message' },
];

const defaultValues: FormsSettingsForm = {
  documents: documentTemplates.map((template) => ({
    ...template,
    content: '',
    updatedAt: DEFAULT_TIMESTAMP,
  })),
  emails: emailTemplates.map((template) => ({
    ...template,
    subject: '',
    body: '',
    updatedAt: DEFAULT_TIMESTAMP,
  })),
  sms: smsTemplates.map((template) => ({
    ...template,
    message: '',
    updatedAt: DEFAULT_TIMESTAMP,
  })),
};

export function FormsSettings(): JSX.Element {
  const { form, query, mutation, onSubmit } = useSettingsSection<FormsSettingsForm>({
    endpoint: 'templates',
    schema: formSchema,
    defaultValues,
    successMessage: 'Templates saved',
  });

  const documents = form.watch('documents');
  const emails = form.watch('emails');
  const sms = form.watch('sms');

  const [activeDocumentId, setActiveDocumentId] = useState(() => documents[0]?.id ?? documentTemplates[0].id);
  const [activeEmailId, setActiveEmailId] = useState(() => emails[0]?.id ?? emailTemplates[0].id);
  const [activeSmsId, setActiveSmsId] = useState(() => sms[0]?.id ?? smsTemplates[0].id);

  const activeDocument = useMemo(
    () => documents.find((template) => template.id === activeDocumentId) ?? documents[0],
    [activeDocumentId, documents],
  );
  const activeEmail = useMemo(
    () => emails.find((template) => template.id === activeEmailId) ?? emails[0],
    [activeEmailId, emails],
  );
  const activeSms = useMemo(
    () => sms.find((template) => template.id === activeSmsId) ?? sms[0],
    [activeSmsId, sms],
  );

  useEffect(() => {
    if (documents.length > 0 && !documents.some((template) => template.id === activeDocumentId)) {
      setActiveDocumentId(documents[0].id);
    }
  }, [activeDocumentId, documents]);

  useEffect(() => {
    if (emails.length > 0 && !emails.some((template) => template.id === activeEmailId)) {
      setActiveEmailId(emails[0].id);
    }
  }, [activeEmailId, emails]);

  useEffect(() => {
    if (sms.length > 0 && !sms.some((template) => template.id === activeSmsId)) {
      setActiveSmsId(sms[0].id);
    }
  }, [activeSmsId, sms]);

  if (query.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
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
            <CardContent className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <div className="space-y-2">
                {documents.map((template) => (
                  <button
                    type="button"
                    key={template.id}
                    onClick={() => setActiveDocumentId(template.id)}
                    className={`w-full rounded border px-3 py-2 text-left text-sm transition-colors ${
                      template.id === activeDocument?.id
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
              <div className="space-y-4">
                <RichTextEditor
                  label={activeDocument?.name ?? 'Template'}
                  value={activeDocument?.content ?? ''}
                  onChange={(value) => {
                    form.setValue(
                      'documents',
                      documents.map((template) =>
                        template.id === activeDocument?.id ? { ...template, content: value } : template,
                      ),
                      { shouldDirty: true },
                    );
                  }}
                />
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
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Subject</label>
                  <input
                    type="text"
                    value={activeEmail?.subject ?? ''}
                    onChange={(event) => {
                      form.setValue(
                        'emails',
                        emails.map((template) =>
                          template.id === activeEmail?.id
                            ? { ...template, subject: event.target.value }
                            : template,
                        ),
                        { shouldDirty: true },
                      );
                    }}
                    className="w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <RichTextEditor
                  label={activeEmail?.name ?? 'Email Template'}
                  value={activeEmail?.body ?? ''}
                  onChange={(value) => {
                    form.setValue(
                      'emails',
                      emails.map((template) =>
                        template.id === activeEmail?.id ? { ...template, body: value } : template,
                      ),
                      { shouldDirty: true },
                    );
                  }}
                />
                <TestConnectionButton
                  variant="outline"
                  onTest={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 500));
                  }}
                >
                  Send Test Email
                </TestConnectionButton>
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
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Message ({activeSms?.message.length ?? 0}/480)</label>
                <textarea
                  value={activeSms?.message ?? ''}
                  onChange={(event) => {
                    const value = event.target.value.slice(0, 480);
                    form.setValue(
                      'sms',
                      sms.map((template) =>
                        template.id === activeSms?.id ? { ...template, message: value } : template,
                      ),
                      { shouldDirty: true },
                    );
                  }}
                  className="min-h-[200px] w-full rounded border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <TestConnectionButton
                  variant="outline"
                  onTest={async () => {
                    await new Promise((resolve) => setTimeout(resolve, 400));
                  }}
                >
                  Send Test SMS
                </TestConnectionButton>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Card>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Templates'}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default FormsSettings;
