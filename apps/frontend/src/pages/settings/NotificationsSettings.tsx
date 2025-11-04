import { useEffect, useMemo } from 'react';
import { type FieldPath } from 'react-hook-form';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton';
import { apiRequest } from '@/lib/queryClient';
import { useSettingsSection } from './useSettingsSection';

const notificationEventSchema = z.object({
  id: z.string(),
  email: z.boolean(),
  sms: z.boolean(),
  inApp: z.boolean(),
});

const smtpSchema = z.object({
  host: z.string().min(1, 'SMTP host is required'),
  port: z.coerce.number().int().positive(),
  username: z.string().min(1, 'SMTP username is required'),
  password: z.string().min(1, 'SMTP password is required'),
  fromName: z.string().min(1, 'From name is required'),
  fromEmail: z.string().email('Enter a valid sender email'),
});

const smsSchema = z.object({
  accountSid: z.string().optional().default(''),
  authToken: z.string().optional().default(''),
  phoneNumber: z.string().optional().default(''),
});

const formSchema = z.object({
  events: z.array(notificationEventSchema),
  smtp: smtpSchema,
  sms: smsSchema,
});

type NotificationChannel = 'email' | 'sms' | 'inApp';

interface NotificationEventDefinition {
  id: string;
  label: string;
  recipients: string;
  defaultChannels: Record<NotificationChannel, boolean>;
}

const notificationEventDefinitions: NotificationEventDefinition[] = [
  {
    id: 'new-lead-assigned',
    label: 'New Lead Assigned',
    recipients: 'Assigned salesperson',
    defaultChannels: { email: true, sms: false, inApp: true },
  },
  {
    id: 'deal-submitted',
    label: 'Deal Submitted for Approval',
    recipients: 'Sales managers',
    defaultChannels: { email: true, sms: false, inApp: true },
  },
  {
    id: 'deal-approved',
    label: 'Deal Approved',
    recipients: 'Salesperson & customer',
    defaultChannels: { email: true, sms: true, inApp: true },
  },
  {
    id: 'deal-rejected',
    label: 'Deal Rejected',
    recipients: 'Salesperson',
    defaultChannels: { email: true, sms: false, inApp: true },
  },
  {
    id: 'payment-due',
    label: 'Payment Due',
    recipients: 'Customer',
    defaultChannels: { email: true, sms: true, inApp: true },
  },
  {
    id: 'payment-received',
    label: 'Payment Received',
    recipients: 'Accounting team',
    defaultChannels: { email: true, sms: false, inApp: true },
  },
  {
    id: 'follow-up-reminder',
    label: 'Follow-Up Reminder',
    recipients: 'Salesperson',
    defaultChannels: { email: true, sms: true, inApp: true },
  },
  {
    id: 'inventory-low',
    label: 'Inventory Low Stock',
    recipients: 'Inventory manager',
    defaultChannels: { email: true, sms: false, inApp: true },
  },
  {
    id: 'inventory-aging',
    label: 'Inventory Aging',
    recipients: 'Sales managers',
    defaultChannels: { email: true, sms: false, inApp: true },
  },
  {
    id: 'customer-birthday',
    label: 'Customer Birthday',
    recipients: 'Salesperson & customer',
    defaultChannels: { email: true, sms: true, inApp: true },
  },
  {
    id: 'service-appointment',
    label: 'Service Appointment Reminder',
    recipients: 'Customer',
    defaultChannels: { email: true, sms: true, inApp: true },
  },
];

export type NotificationsForm = z.infer<typeof formSchema>;

const defaultValues: NotificationsForm = {
  events: notificationEventDefinitions.map(({ id, defaultChannels }) => ({
    id,
    email: defaultChannels.email,
    sms: defaultChannels.sms,
    inApp: defaultChannels.inApp,
  })),
  smtp: {
    host: '',
    port: 587,
    username: '',
    password: '',
    fromName: '',
    fromEmail: '',
  },
  sms: {
    accountSid: '',
    authToken: '',
    phoneNumber: '',
  },
};

function normalizeNotificationValues(values: NotificationsForm): NotificationsForm {
  const knownIds = new Set(notificationEventDefinitions.map((definition) => definition.id));
  const existingEvents = values.events ?? [];
  const normalizedEvents = notificationEventDefinitions.map((definition) => {
    const match = existingEvents.find((event) => event.id === definition.id);
    if (match) {
      return {
        id: definition.id,
        email: !!match.email,
        sms: !!match.sms,
        inApp: !!match.inApp,
      };
    }
    return {
      id: definition.id,
      email: definition.defaultChannels.email,
      sms: definition.defaultChannels.sms,
      inApp: definition.defaultChannels.inApp,
    };
  });

  const additionalEvents = existingEvents.filter((event) => !knownIds.has(event.id));

  return {
    events: [...normalizedEvents, ...additionalEvents],
    smtp: {
      host: values.smtp.host ?? '',
      port: Number.isFinite(Number(values.smtp.port)) ? Number(values.smtp.port) : defaultValues.smtp.port,
      username: values.smtp.username ?? '',
      password: values.smtp.password ?? '',
      fromName: values.smtp.fromName ?? '',
      fromEmail: values.smtp.fromEmail ?? '',
    },
    sms: {
      accountSid: values.sms.accountSid ?? '',
      authToken: values.sms.authToken ?? '',
      phoneNumber: values.sms.phoneNumber ?? '',
    },
  };
}

export function NotificationsSettings(): JSX.Element {
  const { form, query, mutation } = useSettingsSection<NotificationsForm>({
    endpoint: 'notifications',
    schema: formSchema,
    defaultValues,
    successMessage: 'Notification preferences saved',
  });

  const events = form.watch('events');

  useEffect(() => {
    if (query.data) {
      form.reset(normalizeNotificationValues(query.data));
    }
  }, [form, query.data]);

  const displayEvents = useMemo(() => {
    const eventMap = new Map(events?.map((event) => [event.id, event]));
    return notificationEventDefinitions.map((definition) => ({
      definition,
      config:
        eventMap.get(definition.id) ?? {
          id: definition.id,
          email: definition.defaultChannels.email,
          sms: definition.defaultChannels.sms,
          inApp: definition.defaultChannels.inApp,
        },
    }));
  }, [events]);

  const handleChannelToggle = (eventId: string, channel: NotificationChannel, isEnabled: boolean) => {
    const currentEvents = form.getValues('events') ?? [];
    const definitionsSet = new Set(notificationEventDefinitions.map((definition) => definition.id));
    const updatedEvents = notificationEventDefinitions.map((definition) => {
      const existing = currentEvents.find((event) => event.id === definition.id) ?? {
        id: definition.id,
        email: definition.defaultChannels.email,
        sms: definition.defaultChannels.sms,
        inApp: definition.defaultChannels.inApp,
      };
      if (definition.id === eventId) {
        return { ...existing, [channel]: isEnabled };
      }
      return existing;
    });
    const extraEvents = currentEvents.filter((event) => !definitionsSet.has(event.id));
    form.setValue('events', [...updatedEvents, ...extraEvents], { shouldDirty: true });
  };

  const handleSubmit = form.handleSubmit((values) => {
    const normalized = normalizeNotificationValues(values);
    mutation.mutate(normalized);
  });

  const smtpFieldPaths: FieldPath<NotificationsForm>[] = [
    'smtp.host',
    'smtp.port',
    'smtp.username',
    'smtp.password',
    'smtp.fromName',
    'smtp.fromEmail',
  ];

  const smsFieldPaths: FieldPath<NotificationsForm>[] = [
    'sms.accountSid',
    'sms.authToken',
    'sms.phoneNumber',
  ];

  if (query.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Notification Channels</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/70">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Event</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">Email</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">SMS</th>
                  <th className="px-4 py-3 text-center font-medium text-muted-foreground">In-App</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card/30">
                {displayEvents.map(({ definition, config }) => (
                  <tr key={definition.id}>
                    <td className="px-4 py-3 text-sm text-foreground">
                      <div className="flex flex-col">
                        <span className="font-medium">{definition.label}</span>
                        <span className="text-xs text-muted-foreground">{definition.recipients}</span>
                      </div>
                    </td>
                    {(['email', 'sms', 'inApp'] as const).map((channel) => (
                      <td key={channel} className="px-4 py-3 text-center">
                        <Checkbox
                          checked={config[channel]}
                          onCheckedChange={(checked) =>
                            handleChannelToggle(definition.id, channel, checked === true)
                          }
                          aria-label={`${channel} notifications for ${definition.label}`}
                        />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Email Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="smtp.host"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Host</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp.port"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SMTP Port</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value || '0'))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp.username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input {...field} autoComplete="username" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp.password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="current-password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp.fromName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="smtp.fromEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>From Email</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <TestConnectionButton
                variant="outline"
                successMessage="SMTP connection successful"
                errorMessage="SMTP test failed"
                onTest={async () => {
                  const isValid = await form.trigger(smtpFieldPaths, {
                    shouldFocus: true,
                  });
                  if (!isValid) {
                    throw new Error('Please resolve SMTP configuration errors before testing.');
                  }
                  const values = form.getValues();
                  await apiRequest('POST', '/api/settings/notifications/test-email', {
                    smtp: values.smtp,
                  });
                }}
              >
                Test SMTP Connection
              </TestConnectionButton>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">SMS Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="sms.accountSid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Account SID</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sms.authToken"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Auth Token</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sms.phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input placeholder="+15551234567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2">
              <TestConnectionButton
                variant="outline"
                successMessage="Test SMS sent"
                errorMessage="SMS test failed"
                onTest={async () => {
                  form.clearErrors(smsFieldPaths);
                  const smsValues = form.getValues('sms');
                  const missingFields: Array<{ path: FieldPath<NotificationsForm>; message: string }> = [];
                  if (!smsValues.accountSid?.trim()) {
                    missingFields.push({ path: 'sms.accountSid', message: 'Account SID is required to test SMS.' });
                  }
                  if (!smsValues.authToken?.trim()) {
                    missingFields.push({ path: 'sms.authToken', message: 'Auth token is required to test SMS.' });
                  }
                  if (!smsValues.phoneNumber?.trim()) {
                    missingFields.push({ path: 'sms.phoneNumber', message: 'Phone number is required to test SMS.' });
                  }

                  if (missingFields.length > 0) {
                    missingFields.forEach(({ path, message }) => {
                      form.setError(path, { type: 'manual', message });
                    });
                    throw new Error('Provide Twilio credentials before sending a test SMS.');
                  }

                  await apiRequest('POST', '/api/settings/notifications/test-sms', {
                    sms: smsValues,
                  });
                }}
              >
                Send Test SMS
              </TestConnectionButton>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Notification Settings'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default NotificationsSettings;
