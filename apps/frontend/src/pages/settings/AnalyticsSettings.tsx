
import { useCallback, useMemo, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Textarea } from '@repo/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@repo/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui';
import { Checkbox } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { Badge } from '@repo/ui';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch.tsx';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton.tsx';
import { useToast } from '@repo/ui';
import { apiRequest } from '@/lib/queryClient';
import { useSettingsSection } from './useSettingsSection';
import {
  analyticsDashboardRanges,
  analyticsEventMetricSchema,
  analyticsRefreshIntervals,
  analyticsSettingsSchema,
  analyticsWidgetOptions,
  conversionGoalStatusOptions,
  conversionGoalTriggerOptions,
  customEventInputSchema,
  customEventParameterTypes,
  customEventSchema,
  defaultAnalyticsSettings,
  reportFormatOptions,
  reportFrequencyOptions,
  scheduledReportInputSchema,
  scheduledReportSchema,
  type AnalyticsDashboardRange,
  type AnalyticsEventMetric,
  type AnalyticsRefreshInterval,
  type AnalyticsSettings,
  type AnalyticsWidget,
  type ConversionGoal,
  type ConversionGoalStatus,
  type ConversionGoalTrigger,
  type CustomEventDefinition,
  type CustomEventInput,
  type CustomEventParameterType,
  type ScheduledReportDefinition,
  type ScheduledReportInput,
} from '@shared/settings-schema';

const customEventsListSchema = z.array(customEventSchema);
const scheduledReportsListSchema = z.array(scheduledReportSchema);
const analyticsEventsListSchema = z.array(analyticsEventMetricSchema);

function createDefaultValues(): AnalyticsSettings {
  return {
    pixelTracking: { ...defaultAnalyticsSettings.pixelTracking },
    external: { ...defaultAnalyticsSettings.external },
    dashboard: {
      ...defaultAnalyticsSettings.dashboard,
      widgets: [...defaultAnalyticsSettings.dashboard.widgets],
    },
    conversionGoals: defaultAnalyticsSettings.conversionGoals.map((goal) => ({ ...goal })),
  } satisfies AnalyticsSettings;
}

const widgetLabels: Record<AnalyticsWidget, string> = {
  REVENUE: 'Revenue',
  LEAD_SOURCES: 'Lead Sources',
  CONVERSION_FUNNEL: 'Conversion Funnel',
  SALES_PERFORMANCE: 'Sales Performance',
  INVENTORY_METRICS: 'Inventory Metrics',
  TOP_SALESPEOPLE: 'Top Salespeople',
};

const dashboardRangeLabels: Record<AnalyticsDashboardRange, string> = {
  LAST_7: 'Last 7 days',
  LAST_30: 'Last 30 days',
  LAST_90: 'Last 90 days',
  YTD: 'Year to date',
};

const refreshIntervalLabels: Record<AnalyticsRefreshInterval, string> = {
  MANUAL: 'Manual',
  '5M': 'Every 5 minutes',
  '15M': 'Every 15 minutes',
  '1H': 'Every hour',
};

const conversionTriggerLabels: Record<ConversionGoalTrigger, string> = {
  PAGE_VIEW: 'Page View',
  EVENT: 'Event',
  CUSTOM: 'Custom Trigger',
};

const conversionStatusLabels: Record<ConversionGoalStatus, string> = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
};

const reportFrequencyLabels: Record<(typeof reportFrequencyOptions)[number], string> = {
  DAILY: 'Daily',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

const reportFormatLabels: Record<(typeof reportFormatOptions)[number], string> = {
  PDF: 'PDF',
  EXCEL: 'Excel',
  CSV: 'CSV',
};

const dayOfWeekOptions = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

const scheduleFormSchema = scheduledReportInputSchema;

type ScheduleFormValues = z.infer<typeof scheduleFormSchema>;

function formatTimeLabel(value: string): string {
  if (!value) {
    return '';
  }
  try {
    const [hourString, minuteString] = value.split(':');
    const hour = Number.parseInt(hourString, 10);
    if (Number.isNaN(hour)) {
      return value;
    }
    const minute = Number.parseInt(minuteString ?? '0', 10);
    const suffix = hour >= 12 ? 'PM' : 'AM';
    const normalizedHour = hour % 12 === 0 ? 12 : hour % 12;
    return `${normalizedHour}:${minute.toString().padStart(2, '0')} ${suffix}`;
  } catch {
    return value;
  }
}

function buildTrackingSnippet(domain: string): string {
  const safeDomain = domain.trim() || 'analytics.example.com';
  return `<!-- Autolytiq Pixel -->
<script>
  (function(){
    window.autolytiq = window.autolytiq || [];
    window.autolytiq.push({ ts: Date.now(), domain: '${safeDomain}' });
    var script = document.createElement('script');
    script.src = 'https://${safeDomain}/pixel.js';
    script.defer = true;
    document.head.appendChild(script);
  })();
</script>`;
}

export function AnalyticsSettings(): JSX.Element {
  const defaultValues = useMemo(() => createDefaultValues(), []);
  const { toast } = useToast();

  const { form, query, mutation, onSubmit } = useSettingsSection<AnalyticsSettings>({
    endpoint: 'analytics',
    schema: analyticsSettingsSchema,
    defaultValues,
    successMessage: 'Analytics settings saved',
  });

  const eventsQuery = useQuery({
    queryKey: ['settings', 'analytics', 'events'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/analytics/events');
      const json = (await response.json()) as unknown;
      const parsed = analyticsEventsListSchema.safeParse(json);
      return parsed.success ? parsed.data : [];
    },
  });

  const customEventsQuery = useQuery({
    queryKey: ['settings', 'analytics', 'custom-events'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/analytics/custom-events');
      const json = (await response.json()) as unknown;
      const parsed = customEventsListSchema.safeParse(json);
      return parsed.success ? parsed.data : [];
    },
  });

  const scheduledReportsQuery = useQuery({
    queryKey: ['settings', 'analytics', 'scheduled-reports'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/analytics/scheduled-reports');
      const json = (await response.json()) as unknown;
      const parsed = scheduledReportsListSchema.safeParse(json);
      return parsed.success ? parsed.data : [];
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: string) => {
      await apiRequest('DELETE', `/api/settings/analytics/custom-events/${encodeURIComponent(eventId)}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Custom event deleted' });
      void customEventsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to delete custom event.';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    },
  });

  const saveEventMutation = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: CustomEventInput }) => {
      if (id) {
        const response = await apiRequest('PUT', `/api/settings/analytics/custom-events/${encodeURIComponent(id)}`, payload);
        const json = (await response.json()) as unknown;
        return customEventSchema.parse(json);
      }
      const response = await apiRequest('POST', '/api/settings/analytics/custom-events', payload);
      const json = (await response.json()) as unknown;
      return customEventSchema.parse(json);
    },
    onSuccess: () => {
      toast({ title: 'Custom event saved' });
      setEventDialogOpen(false);
      setEditingEvent(null);
      eventForm.reset({ name: '', description: '', parameters: [] });
      eventParameters.replace([]);
      void customEventsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save custom event.';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
    },
  });

  const deleteScheduleMutation = useMutation({
    mutationFn: async (scheduleId: string) => {
      await apiRequest('DELETE', `/api/settings/analytics/scheduled-reports/${encodeURIComponent(scheduleId)}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Report schedule removed' });
      void scheduledReportsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to delete scheduled report.';
      toast({ title: 'Delete failed', description: message, variant: 'destructive' });
    },
  });

  const saveScheduleMutation = useMutation({
    mutationFn: async ({ id, payload }: { id?: string; payload: ScheduledReportInput }) => {
      if (id) {
        const response = await apiRequest('PUT', `/api/settings/analytics/scheduled-reports/${encodeURIComponent(id)}`, payload);
        const json = (await response.json()) as unknown;
        return scheduledReportSchema.parse(json);
      }
      const response = await apiRequest('POST', '/api/settings/analytics/scheduled-reports', payload);
      const json = (await response.json()) as unknown;
      return scheduledReportSchema.parse(json);
    },
    onSuccess: () => {
      toast({ title: 'Report schedule saved' });
      setScheduleDialogOpen(false);
      setEditingSchedule(null);
      scheduleForm.reset({
        name: '',
        reportType: '',
        frequency: 'WEEKLY',
        dayOfWeek: 'monday',
        dayOfMonth: undefined,
        timeOfDay: '09:00',
        recipients: [''],
        format: 'PDF',
      });
      scheduleRecipients.replace(['']);
      void scheduledReportsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save scheduled report.';
      toast({ title: 'Save failed', description: message, variant: 'destructive' });
    },
  });

  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CustomEventDefinition | null>(null);
  const eventForm = useForm<CustomEventInput>({
    resolver: zodResolver(customEventInputSchema),
    defaultValues: { name: '', description: '', parameters: [] },
  });
  const eventParameters = useFieldArray({ control: eventForm.control, name: 'parameters' });

  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduledReportDefinition | null>(null);
  const scheduleForm = useForm<ScheduleFormValues>({
    resolver: zodResolver(scheduleFormSchema),
    defaultValues: {
      name: '',
      reportType: '',
      frequency: 'WEEKLY',
      dayOfWeek: 'monday',
      dayOfMonth: undefined,
      timeOfDay: '09:00',
      recipients: [''],
      format: 'PDF',
    },
  });
  const scheduleRecipients = useFieldArray({ control: scheduleForm.control, name: 'recipients' });

  const trackingDomain = form.watch('pixelTracking.trackingDomain');
  const widgets = form.watch('dashboard.widgets');
  const conversionGoals = form.watch('conversionGoals');
  const trackingSnippet = useMemo(() => buildTrackingSnippet(trackingDomain ?? ''), [trackingDomain]);

  const events = eventsQuery.data ?? [];
  const customEvents = customEventsQuery.data ?? [];
  const scheduledReports = scheduledReportsQuery.data ?? [];

  const toggleWidget = (widget: AnalyticsWidget) => {
    const current = form.getValues('dashboard.widgets');
    if (current.includes(widget)) {
      form.setValue(
        'dashboard.widgets',
        current.filter((item) => item !== widget),
        { shouldDirty: true },
      );
    } else {
      form.setValue('dashboard.widgets', [...current, widget], { shouldDirty: true });
    }
  };

  const handleOpenEventDialog = (event?: CustomEventDefinition) => {
    if (event) {
      setEditingEvent(event);
      eventForm.reset({
        name: event.name,
        description: event.description ?? '',
        parameters: event.parameters.map((parameter) => ({
          name: parameter.name,
          type: parameter.type as CustomEventParameterType,
          required: parameter.required ?? false,
        })),
      });
      eventParameters.replace(
        event.parameters.map((parameter) => ({
          name: parameter.name,
          type: parameter.type as CustomEventParameterType,
          required: parameter.required ?? false,
        })),
      );
    } else {
      setEditingEvent(null);
      eventForm.reset({ name: '', description: '', parameters: [] });
      eventParameters.replace([]);
    }
    setEventDialogOpen(true);
  };

  const handleOpenScheduleDialog = (schedule?: ScheduledReportDefinition) => {
    if (schedule) {
      setEditingSchedule(schedule);
      scheduleForm.reset({
        name: schedule.name,
        reportType: schedule.reportType,
        frequency: schedule.frequency,
        dayOfWeek: schedule.dayOfWeek ?? 'monday',
        dayOfMonth: schedule.dayOfMonth ?? 1,
        timeOfDay: schedule.timeOfDay,
        recipients: schedule.recipients.length ? schedule.recipients : [''],
        format: schedule.format,
      });
      scheduleRecipients.replace(schedule.recipients.length ? schedule.recipients : ['']);
    } else {
      setEditingSchedule(null);
      scheduleForm.reset({
        name: '',
        reportType: '',
        frequency: 'WEEKLY',
        dayOfWeek: 'monday',
        dayOfMonth: undefined,
        timeOfDay: '09:00',
        recipients: [''],
        format: 'PDF',
      });
      scheduleRecipients.replace(['']);
    }
    setScheduleDialogOpen(true);
  };

  const handleAddGoal = () => {
    const goals = form.getValues('conversionGoals');
    const newGoal: ConversionGoal = {
      id: `goal-${crypto.randomUUID()}`,
      name: 'New Goal',
      triggerType: 'EVENT',
      triggerValue: '',
      value: 0,
      status: 'ACTIVE',
    };
    form.setValue('conversionGoals', [...goals, newGoal], { shouldDirty: true });
  };

  const handleRemoveGoal = (goalId: string) => {
    const goals = form.getValues('conversionGoals');
    form.setValue(
      'conversionGoals',
      goals.filter((goal) => goal.id !== goalId),
      { shouldDirty: true },
    );
  };

  const testTracker = useCallback(
    async (service: 'google-analytics' | 'facebook-pixel' | 'google-tag-manager') => {
      const payload = {
        service,
        credentials: {
          googleAnalyticsId: form.getValues('external.googleAnalyticsId'),
          facebookPixelId: form.getValues('external.facebookPixelId'),
          tagManagerId: form.getValues('external.tagManagerId'),
          trackingDomain: form.getValues('pixelTracking.trackingDomain'),
        },
      };
      await apiRequest('POST', '/api/settings/analytics/test-connections', payload);
    },
    [form],
  );

  if (query.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Pixel Tracking</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="pixelTracking.enabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={(value) => field.onChange(value)}
                  label="Enable pixel tracking"
                  description="Collect behavioral data across web properties for analytics."
                />
              )}
            />
            <FormField
              control={form.control}
              name="pixelTracking.trackingDomain"
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
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <FormLabel>Install Instructions</FormLabel>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(trackingSnippet);
                      toast({ title: 'Snippet copied to clipboard' });
                    } catch (error) {
                      const message = error instanceof Error ? error.message : 'Copy failed.';
                      toast({ title: 'Copy failed', description: message, variant: 'destructive' });
                    }
                  }}
                >
                  Copy Snippet
                </Button>
              </div>
              <div className="rounded-md border border-dashed border-border bg-muted/40 p-4">
                <pre className="overflow-x-auto text-xs leading-relaxed text-muted-foreground">
                  <code>{trackingSnippet}</code>
                </pre>
              </div>
            </div>
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-muted-foreground">Tracked events (last 30 days)</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => void eventsQuery.refetch()}
                  disabled={eventsQuery.isFetching}
                >
                  Refresh
                </Button>
              </div>
              {eventsQuery.isLoading ? (
                <Skeleton className="h-32 w-full" />
              ) : events.length === 0 ? (
                <p className="text-sm text-muted-foreground">No events have been captured in the last 30 days.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-border text-sm">
                    <thead className="bg-muted/60">
                      <tr>
                        <th className="px-3 py-2 text-left font-medium">Event</th>
                        <th className="px-3 py-2 text-left font-medium">Count</th>
                        <th className="px-3 py-2 text-left font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {events.map((event) => (
                        <tr key={event.id}>
                          <td className="px-3 py-2 text-foreground">{event.name}</td>
                          <td className="px-3 py-2 text-muted-foreground">{event.countLast30Days.toLocaleString()}</td>
                          <td className="px-3 py-2">
                            <Badge variant={event.status === 'ACTIVE' ? 'secondary' : 'outline'}>{event.status}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">External Analytics Integrations</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="external.googleAnalyticsId"
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
            <div className="flex items-end">
              <TestConnectionButton
                variant="outline"
                onTest={() => testTracker('google-analytics')}
                disabled={!form.getValues('external.googleAnalyticsId')}
              >
                Test GA4 Connection
              </TestConnectionButton>
            </div>
            <FormField
              control={form.control}
              name="external.facebookPixelId"
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
            <div className="flex items-end">
              <TestConnectionButton
                variant="outline"
                onTest={() => testTracker('facebook-pixel')}
                disabled={!form.getValues('external.facebookPixelId')}
              >
                Test Facebook Pixel
              </TestConnectionButton>
            </div>
            <FormField
              control={form.control}
              name="external.tagManagerId"
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
            <div className="flex items-end">
              <TestConnectionButton
                variant="outline"
                onTest={() => testTracker('google-tag-manager')}
                disabled={!form.getValues('external.tagManagerId')}
              >
                Test GTM Container
              </TestConnectionButton>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Dashboard Preferences</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="dashboard.defaultDateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Date Range</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {analyticsDashboardRanges.map((range) => (
                        <SelectItem key={range} value={range}>
                          {dashboardRangeLabels[range]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dashboard.refreshInterval"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Refresh Interval</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select interval" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {analyticsRefreshIntervals.map((interval) => (
                        <SelectItem key={interval} value={interval}>
                          {refreshIntervalLabels[interval]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="md:col-span-2 space-y-2">
              <FormLabel>Dashboard Widgets</FormLabel>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {analyticsWidgetOptions.map((widget) => (
                  <label
                    key={widget}
                    className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
                  >
                    <Checkbox
                      checked={widgets.includes(widget)}
                      onCheckedChange={() => toggleWidget(widget)}
                    />
                    <span className="text-sm text-foreground">{widgetLabels[widget]}</span>
                  </label>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Conversion Goals</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={handleAddGoal}>
              Add Goal
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversionGoals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No conversion goals defined.</p>
            ) : (
              <div className="space-y-4">
                {conversionGoals.map((goal, index) => (
                  <div key={goal.id} className="rounded-md border border-border p-4">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start">
                      <div className="flex-1 space-y-2">
                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                          Goal Name
                        </FormLabel>
                        <Input
                          value={goal.name}
                          onChange={(event) => {
                            const goals = [...conversionGoals];
                            goals[index] = { ...goal, name: event.target.value };
                            form.setValue('conversionGoals', goals, { shouldDirty: true });
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                          Trigger
                        </FormLabel>
                        <Select
                          value={goal.triggerType}
                          onValueChange={(value: ConversionGoalTrigger) => {
                            const goals = [...conversionGoals];
                            goals[index] = { ...goal, triggerType: value };
                            form.setValue('conversionGoals', goals, { shouldDirty: true });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {conversionGoalTriggerOptions.map((option) => (
                              <SelectItem key={option} value={option}>
                                {conversionTriggerLabels[option]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1 space-y-2">
                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                          Trigger Value
                        </FormLabel>
                        <Input
                          value={goal.triggerValue}
                          onChange={(event) => {
                            const goals = [...conversionGoals];
                            goals[index] = { ...goal, triggerValue: event.target.value };
                            form.setValue('conversionGoals', goals, { shouldDirty: true });
                          }}
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <FormLabel className="text-xs font-semibold uppercase text-muted-foreground">
                          Goal Value
                        </FormLabel>
                        <Input
                          type="number"
                          value={goal.value ?? 0}
                          onChange={(event) => {
                            const goals = [...conversionGoals];
                            goals[index] = { ...goal, value: Number(event.target.value) };
                            form.setValue('conversionGoals', goals, { shouldDirty: true });
                          }}
                        />
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                      <ToggleSwitch
                        enabled={goal.status === 'ACTIVE'}
                        onChange={(value) => {
                          const goals = [...conversionGoals];
                          goals[index] = { ...goal, status: value ? 'ACTIVE' : 'INACTIVE' };
                          form.setValue('conversionGoals', goals, { shouldDirty: true });
                        }}
                        label={`Status: ${conversionStatusLabels[goal.status]}`}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveGoal(goal.id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Custom Events</CardTitle>
            <Button type="button" onClick={() => handleOpenEventDialog()}>
              Add Custom Event
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {customEventsQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : customEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No custom events defined.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Event</th>
                      <th className="px-3 py-2 text-left font-medium">Parameters</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {customEvents.map((event) => (
                      <tr key={event.id}>
                        <td className="px-3 py-2 text-foreground">
                          <div className="font-medium">{event.name}</div>
                          {event.description ? (
                            <p className="text-xs text-muted-foreground">{event.description}</p>
                          ) : null}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {event.parameters.length === 0
                            ? '—'
                            : event.parameters
                                .map((parameter) => `${parameter.name} (${parameter.type}${parameter.required ? ', required' : ''})`)
                                .join(', ')}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenEventDialog(event)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEventMutation.mutate(event.id)}
                              disabled={deleteEventMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold">Report Scheduling</CardTitle>
            <Button type="button" onClick={() => handleOpenScheduleDialog()}>
              Add Schedule
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {scheduledReportsQuery.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : scheduledReports.length === 0 ? (
              <p className="text-sm text-muted-foreground">No scheduled reports configured.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium">Report</th>
                      <th className="px-3 py-2 text-left font-medium">Frequency</th>
                      <th className="px-3 py-2 text-left font-medium">Recipients</th>
                      <th className="px-3 py-2 text-left font-medium">Last Sent</th>
                      <th className="px-3 py-2 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {scheduledReports.map((report) => (
                      <tr key={report.id}>
                        <td className="px-3 py-2 text-foreground">
                          <div className="font-medium">{report.name}</div>
                          <p className="text-xs text-muted-foreground">{report.reportType}</p>
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {reportFrequencyLabels[report.frequency]}
                          {report.frequency === 'WEEKLY' && report.dayOfWeek ? ` • ${report.dayOfWeek}` : null}
                          {report.frequency === 'MONTHLY' && report.dayOfMonth ? ` • Day ${report.dayOfMonth}` : null}
                          {' • '}
                          {formatTimeLabel(report.timeOfDay)}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {report.recipients.join(', ')}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {report.lastSentAt ? new Date(report.lastSentAt).toLocaleString() : '—'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleOpenScheduleDialog(report)}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteScheduleMutation.mutate(report.id)}
                              disabled={deleteScheduleMutation.isPending}
                            >
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Saving…' : 'Save Analytics Settings'}
          </Button>
        </div>
      </form>

      <Dialog
        open={eventDialogOpen}
        onOpenChange={(open) => {
          setEventDialogOpen(open);
          if (!open) {
            setEditingEvent(null);
            eventForm.reset({ name: '', description: '', parameters: [] });
            eventParameters.replace([]);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingEvent ? 'Edit Custom Event' : 'Create Custom Event'}</DialogTitle>
          </DialogHeader>
          <Form {...eventForm}>
            <form
              onSubmit={eventForm.handleSubmit((values) => {
                saveEventMutation.mutate({ id: editingEvent?.id, payload: values });
              })}
              className="space-y-4"
            >
              <FormField
                control={eventForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Vehicle Viewed" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={eventForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Describe when this event is triggered" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <FormLabel>Parameters</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => eventParameters.append({ name: '', type: 'string', required: false })}
                  >
                    Add Parameter
                  </Button>
                </div>
                {eventParameters.fields.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No parameters required for this event.</p>
                ) : (
                  <div className="space-y-3">
                    {eventParameters.fields.map((field, index) => (
                      <div key={field.id} className="grid gap-3 rounded-md border border-border p-3 md:grid-cols-3">
                        <FormField
                          control={eventForm.control}
                          name={`parameters.${index}.name`}
                          render={({ field: parameterField }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="lead_id" {...parameterField} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name={`parameters.${index}.type`}
                          render={({ field: parameterField }) => (
                            <FormItem>
                              <FormLabel>Type</FormLabel>
                              <Select value={parameterField.value} onValueChange={parameterField.onChange}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {customEventParameterTypes.map((type) => (
                                    <SelectItem key={type} value={type}>
                                      {type}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={eventForm.control}
                          name={`parameters.${index}.required`}
                          render={({ field: parameterField }) => (
                            <FormItem className="flex flex-col justify-end space-y-2">
                              <FormLabel>Required</FormLabel>
                              <div className="flex items-center gap-2">
                                <Checkbox
                                  checked={parameterField.value}
                                  onCheckedChange={(value) => parameterField.onChange(Boolean(value))}
                                />
                                <span className="text-sm text-muted-foreground">Required field</span>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <div className="md:col-span-3 flex justify-end">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => eventParameters.remove(index)}
                          >
                            Remove Parameter
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setEventDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveEventMutation.isPending}>
                  {saveEventMutation.isPending ? 'Saving…' : 'Save Event'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={scheduleDialogOpen}
        onOpenChange={(open) => {
          setScheduleDialogOpen(open);
          if (!open) {
            setEditingSchedule(null);
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingSchedule ? 'Edit Scheduled Report' : 'Add Scheduled Report'}</DialogTitle>
          </DialogHeader>
          <Form {...scheduleForm}>
            <form
              onSubmit={scheduleForm.handleSubmit((values) => {
                const recipients = values.recipients.map((recipient) => recipient.trim()).filter((recipient) => recipient.length > 0);
                if (recipients.length === 0) {
                  scheduleForm.setError('recipients', {
                    type: 'manual',
                    message: 'Provide at least one recipient email address.',
                  });
                  return;
                }

                const payload: ScheduledReportInput = {
                  name: values.name,
                  reportType: values.reportType,
                  frequency: values.frequency,
                  dayOfWeek: values.frequency === 'WEEKLY' ? values.dayOfWeek : undefined,
                  dayOfMonth: values.frequency === 'MONTHLY' ? values.dayOfMonth : undefined,
                  timeOfDay: values.timeOfDay,
                  recipients,
                  format: values.format,
                };

                saveScheduleMutation.mutate({ id: editingSchedule?.id, payload });
              })}
              className="space-y-4"
            >
              <FormField
                control={scheduleForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Schedule Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Weekly performance digest" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={scheduleForm.control}
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Type</FormLabel>
                    <FormControl>
                      <Input placeholder="Sales Performance" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={scheduleForm.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Frequency</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        field.onChange(value);
                        if (value !== 'WEEKLY') {
                          scheduleForm.setValue('dayOfWeek', undefined, { shouldDirty: true });
                        } else if (!scheduleForm.getValues('dayOfWeek')) {
                          scheduleForm.setValue('dayOfWeek', 'monday', { shouldDirty: true });
                        }
                        if (value !== 'MONTHLY') {
                          scheduleForm.setValue('dayOfMonth', undefined, { shouldDirty: true });
                        } else if (!scheduleForm.getValues('dayOfMonth')) {
                          scheduleForm.setValue('dayOfMonth', 1, { shouldDirty: true });
                        }
                      }}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportFrequencyOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {reportFrequencyLabels[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {scheduleForm.watch('frequency') === 'WEEKLY' ? (
                <FormField
                  control={scheduleForm.control}
                  name="dayOfWeek"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Week</FormLabel>
                      <Select value={field.value ?? 'monday'} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dayOfWeekOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              {scheduleForm.watch('frequency') === 'MONTHLY' ? (
                <FormField
                  control={scheduleForm.control}
                  name="dayOfMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Day of Month</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={31}
                          value={field.value ?? ''}
                          onChange={(event) => field.onChange(event.target.value ? Number(event.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
              <FormField
                control={scheduleForm.control}
                name="timeOfDay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="space-y-3">
                <FormLabel>Recipients</FormLabel>
                {scheduleRecipients.fields.map((field, index) => (
                  <div key={field.id} className="flex items-center gap-2">
                    <Input
                      placeholder="analytics@dealership.com"
                      {...scheduleForm.register(`recipients.${index}` as const)}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => scheduleRecipients.remove(index)}
                      disabled={scheduleRecipients.fields.length === 1}
                    >
                      Remove
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => scheduleRecipients.append('')}
                >
                  Add Recipient
                </Button>
                <FormMessage>{scheduleForm.formState.errors.recipients?.message}</FormMessage>
              </div>
              <FormField
                control={scheduleForm.control}
                name="format"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Format</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {reportFormatOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {reportFormatLabels[option]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={saveScheduleMutation.isPending}>
                  {saveScheduleMutation.isPending ? 'Saving…' : 'Save Schedule'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Form>
  );
}

export default AnalyticsSettings;
