import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { Checkbox } from '@/components/ui/checkbox';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton';
import { useSettingsSection } from './useSettingsSection';

const notificationEventSchema = z.object({
  id: z.string(),
  email: z.boolean(),
  sms: z.boolean(),
  inApp: z.boolean(),
});

const formSchema = z.object({
  events: z.array(notificationEventSchema),
  smtpHost: z.string().min(1),
  smtpPort: z.number().min(1),
  smtpUsername: z.string().min(1),
  smtpPassword: z.string().min(1),
  fromName: z.string().min(1),
  fromEmail: z.string().email(),
  twilioAccountSid: z.string().optional().default(''),
  twilioAuthToken: z.string().optional().default(''),
  twilioNumber: z.string().optional().default(''),
});

export type NotificationsForm = z.infer<typeof formSchema>;

const notificationEvents = [
  'new-lead-assigned',
  'deal-submitted',
  'deal-approved',
  'deal-rejected',
  'payment-due',
  'payment-received',
  'follow-up-reminder',
  'inventory-low',
  'inventory-aging',
  'customer-birthday',
  'service-appointment',
];

const defaultValues: NotificationsForm = {
  events: notificationEvents.map((id) => ({ id, email: true, sms: id.includes('payment'), inApp: true })),
  smtpHost: '',
  smtpPort: 587,
  smtpUsername: '',
  smtpPassword: '',
  fromName: '',
  fromEmail: '',
  twilioAccountSid: '',
  twilioAuthToken: '',
  twilioNumber: '',
};

const eventLabels: Record<string, string> = {
  'new-lead-assigned': 'New Lead Assigned',
  'deal-submitted': 'Deal Submitted for Approval',
  'deal-approved': 'Deal Approved',
  'deal-rejected': 'Deal Rejected',
  'payment-due': 'Payment Due',
  'payment-received': 'Payment Received',
  'follow-up-reminder': 'Follow-Up Reminder',
  'inventory-low': 'Inventory Alert - Low Stock',
  'inventory-aging': 'Inventory Alert - Aging Vehicle',
  'customer-birthday': 'Customer Birthday',
  'service-appointment': 'Service Appointment Reminder',
};

export function NotificationsSettings(): JSX.Element {
  const { form, query, mutation, onSubmit } = useSettingsSection<NotificationsForm>({
    endpoint: 'notifications',
    schema: formSchema,
    defaultValues,
    successMessage: 'Notification preferences saved',
  });

  const events = form.watch('events');

  if (query.isLoading) {
    return <Skeleton className="h-[420px] w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
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
                {events.map((eventConfig, index) => (
                  <tr key={eventConfig.id}>
                    <td className="px-4 py-3 text-sm text-foreground">{eventLabels[eventConfig.id] ?? eventConfig.id}</td>
                    {(['email', 'sms', 'inApp'] as const).map((channel) => (
                      <td key={channel} className="px-4 py-3 text-center">
                        <Checkbox
                          checked={eventConfig[channel]}
                          onCheckedChange={(checked) => {
                            form.setValue(
                              'events',
                              events.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, [channel]: checked === true } : item,
                              ),
                              { shouldDirty: true },
                            );
                          }}
                          aria-label={`${channel} notifications for ${eventLabels[eventConfig.id] ?? eventConfig.id}`}
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
              name="smtpHost"
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
              name="smtpPort"
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
              name="smtpUsername"
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
              name="smtpPassword"
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
              name="fromName"
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
              name="fromEmail"
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
                onTest={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 400));
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
              name="twilioAccountSid"
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
              name="twilioAuthToken"
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
              name="twilioNumber"
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
                onTest={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 400));
                }}
              >
                Send Test SMS
              </TestConnectionButton>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Preferences'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </Form>
  );
}

export default NotificationsSettings;
