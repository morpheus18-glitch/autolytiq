import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton';
import { useSettingsSection } from './useSettingsSection';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  pixelTrackingEnabled: z.boolean().default(true),
  trackingDomain: z.string().optional().default(''),
  googleAnalyticsId: z.string().optional().default(''),
  facebookPixelId: z.string().optional().default(''),
  tagManagerId: z.string().optional().default(''),
  defaultDateRange: z.enum(['LAST_7', 'LAST_30', 'LAST_90', 'YTD']).default('LAST_30'),
  refreshInterval: z.enum(['MANUAL', '5M', '15M', '1H']).default('15M'),
  widgets: z.array(z.enum(['REVENUE', 'LEADS', 'CONVERSION', 'SALES', 'INVENTORY', 'SALESPEOPLE'])).default([
    'REVENUE',
    'LEADS',
    'CONVERSION',
  ]),
});

type AnalyticsFormValues = z.infer<typeof formSchema>;

const defaultValues: AnalyticsFormValues = {
  pixelTrackingEnabled: true,
  trackingDomain: '',
  googleAnalyticsId: '',
  facebookPixelId: '',
  tagManagerId: '',
  defaultDateRange: 'LAST_30',
  refreshInterval: '15M',
  widgets: ['REVENUE', 'LEADS', 'CONVERSION'],
};

const customEventSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional(),
  parameters: z.array(z.string()).default([]),
});

export function AnalyticsSettings(): JSX.Element {
  const { toast } = useToast();
  const { form, query, mutation, onSubmit } = useSettingsSection<AnalyticsFormValues>({
    endpoint: 'analytics',
    schema: formSchema,
    defaultValues,
    successMessage: 'Analytics preferences saved',
  });

  const customEventsQuery = useQuery({
    queryKey: ['settings', 'analytics', 'custom-events'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/analytics/custom-events');
      const json = (await response.json()) as unknown;
      const parsed = z.array(customEventSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [] as z.infer<typeof customEventSchema>[];
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest('DELETE', `/api/settings/analytics/custom-events/${eventId}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Event removed' });
      void customEventsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to delete event.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  if (query.isLoading) {
    return <Skeleton className="h-[520px] w-full" />;
  }

  const widgets = form.watch('widgets');
  const customEvents = customEventsQuery.data ?? [];

  const toggleWidget = (widget: AnalyticsFormValues['widgets'][number]) => {
    const next = widgets.includes(widget)
      ? widgets.filter((item) => item !== widget)
      : [...widgets, widget];
    form.setValue('widgets', next, { shouldDirty: true });
  };

  const widgetOptions: { key: AnalyticsFormValues['widgets'][number]; label: string }[] = [
    { key: 'REVENUE', label: 'Revenue Chart' },
    { key: 'LEADS', label: 'Lead Sources' },
    { key: 'CONVERSION', label: 'Conversion Funnel' },
    { key: 'SALES', label: 'Sales Performance' },
    { key: 'INVENTORY', label: 'Inventory Metrics' },
    { key: 'SALESPEOPLE', label: 'Top Salespeople' },
  ];

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Tracking Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pixelTrackingEnabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Enable pixel tracking"
                  description="Track customer engagement across web touchpoints."
                />
              )}
            />
            <FormField
              control={form.control}
              name="trackingDomain"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tracking Domain</FormLabel>
                  <FormControl>
                    <Input placeholder="analytics.yourdealership.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="googleAnalyticsId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GA4 Measurement ID</FormLabel>
                  <FormControl>
                    <Input placeholder="G-XXXXXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="facebookPixelId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Facebook Pixel ID</FormLabel>
                  <FormControl>
                    <Input placeholder="123456789012345" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tagManagerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Google Tag Manager ID</FormLabel>
                  <FormControl>
                    <Input placeholder="GTM-XXXXXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3">
            <TestConnectionButton
              variant="outline"
              onTest={async () => {
                const response = await apiRequest('POST', '/api/settings/analytics/test-connections', {
                  trackers: {
                    googleAnalyticsId: form.getValues('googleAnalyticsId'),
                    facebookPixelId: form.getValues('facebookPixelId'),
                    tagManagerId: form.getValues('tagManagerId'),
                  },
                });
                await response.json();
              }}
            >
              Test Tracking Connections
            </TestConnectionButton>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Dashboard Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="defaultDateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Date Range</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="LAST_7">Last 7 days</SelectItem>
                      <SelectItem value="LAST_30">Last 30 days</SelectItem>
                      <SelectItem value="LAST_90">Last 90 days</SelectItem>
                      <SelectItem value="YTD">Year to Date</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="refreshInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Interval</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MANUAL">Manual</SelectItem>
                      <SelectItem value="5M">Every 5 minutes</SelectItem>
                      <SelectItem value="15M">Every 15 minutes</SelectItem>
                      <SelectItem value="1H">Every hour</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 space-y-2">
              <FormLabel>Widgets</FormLabel>
              <div className="grid gap-2 sm:grid-cols-2">
                {widgetOptions.map((option) => (
                  <label key={option.key} className="flex items-center gap-2 rounded border border-border bg-card px-3 py-2">
                    <Checkbox
                      checked={widgets.includes(option.key)}
                      onCheckedChange={() => toggleWidget(option.key)}
                    />
                    <span className="text-sm text-foreground">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Analytics Settings'}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Custom Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {customEventsQuery.isLoading ? (
              <Skeleton className="h-32 w-full" />
            ) : customEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom events defined.</p>
            ) : (
              <table className="min-w-full divide-y divide-border text-sm">
                <thead className="bg-muted/70">
                  <tr>
                    <th className="px-3 py-2 text-left">Event</th>
                    <th className="px-3 py-2 text-left">Parameters</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {customEvents.map((event) => (
                    <tr key={event.id}>
                      <td className="px-3 py-2 text-sm text-foreground">
                        <div className="font-medium">{event.name}</div>
                        {event.description ? (
                          <p className="text-xs text-muted-foreground">{event.description}</p>
                        ) : null}
                      </td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {event.parameters.length ? event.parameters.join(', ') : '—'}
                      </td>
                      <td className="px-3 py-2 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteEventMutation.mutate(event.id)}
                          disabled={deleteEventMutation.isPending}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

export default AnalyticsSettings;
