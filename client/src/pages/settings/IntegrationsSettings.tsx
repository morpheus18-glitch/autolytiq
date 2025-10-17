import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';

const integrationSchema = z.object({
  name: z.string(),
  label: z.string(),
  category: z.string(),
  status: z.string().default('DISCONNECTED'),
  description: z.string().optional(),
});

type IntegrationListItem = z.infer<typeof integrationSchema>;

const integrationConfigSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).default('INACTIVE'),
  credentials: z.record(z.string()).default({}),
  webhookUrl: z.string().optional().default(''),
  syncFrequency: z.enum(['REALTIME', 'HOURLY', 'DAILY']).default('REALTIME'),
});

type IntegrationConfig = z.infer<typeof integrationConfigSchema>;

const integrationCatalog: Record<string, { category: string; description: string; fields: { key: string; label: string; type?: 'password' }[] }> = {
  'cdk-drive': {
    category: 'DMS Systems',
    description: 'Connect to CDK Drive for inventory and deal synchronization.',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    ],
  },
  'reynolds-reynolds': {
    category: 'DMS Systems',
    description: 'Integrate with Reynolds & Reynolds DMS.',
    fields: [
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password', type: 'password' },
    ],
  },
  'dealertrack-dms': {
    category: 'DMS Systems',
    description: 'Automate push/pull with Dealertrack DMS.',
    fields: [
      { key: 'dealerCode', label: 'Dealer Code' },
      { key: 'apiKey', label: 'API Key', type: 'password' },
    ],
  },
  experian: {
    category: 'Credit Bureaus',
    description: 'Pull credit bureau data from Experian Automotive.',
    fields: [
      { key: 'apiUsername', label: 'API Username' },
      { key: 'apiPassword', label: 'API Password', type: 'password' },
      { key: 'memberCode', label: 'Member Code' },
    ],
  },
  transunion: {
    category: 'Credit Bureaus',
    description: 'Retrieve TransUnion credit reports.',
    fields: [
      { key: 'apiUsername', label: 'API Username' },
      { key: 'apiPassword', label: 'API Password', type: 'password' },
      { key: 'memberCode', label: 'Member Code' },
    ],
  },
  equifax: {
    category: 'Credit Bureaus',
    description: 'Integrate with Equifax for credit pulls.',
    fields: [
      { key: 'apiUsername', label: 'API Username' },
      { key: 'apiPassword', label: 'API Password', type: 'password' },
      { key: 'memberCode', label: 'Member Code' },
    ],
  },
  mailchimp: {
    category: 'Marketing',
    description: 'Sync marketing audiences with Mailchimp.',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
  },
  hubspot: {
    category: 'Marketing',
    description: 'Connect CRM and marketing automation via HubSpot.',
    fields: [{ key: 'clientId', label: 'Client ID' }],
  },
  'twilio-sms': {
    category: 'Communications',
    description: 'Send SMS via Twilio.',
    fields: [
      { key: 'accountSid', label: 'Account SID' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'phoneNumber', label: 'Phone Number' },
    ],
  },
  'quickbooks-online': {
    category: 'Accounting',
    description: 'Sync deals and journal entries with QuickBooks Online.',
    fields: [{ key: 'refreshToken', label: 'Refresh Token', type: 'password' }],
  },
};

const toTitleCase = (value: string): string =>
  value
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());

const defaultIntegrations: IntegrationListItem[] = Object.entries(integrationCatalog).map(([name, info]) => ({
  name,
  label: toTitleCase(name),
  category: info.category,
  status: 'DISCONNECTED',
  description: info.description,
}));

export function IntegrationsSettings(): JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'integrations'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/integrations');
      const json = (await response.json()) as unknown;
      const parsed = z.array(integrationSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return defaultIntegrations;
    },
  });

  const integrations = useMemo(() => data ?? defaultIntegrations, [data]);

  const configQuery = useQuery({
    queryKey: ['settings', 'integration-config', selectedIntegration?.name],
    enabled: !!selectedIntegration,
    queryFn: async () => {
      if (!selectedIntegration) {
        return integrationConfigSchema.parse({});
      }
      const response = await apiRequest(`/api/settings/integrations/${selectedIntegration.name}`);
      const json = (await response.json()) as unknown;
      const parsed = integrationConfigSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return integrationConfigSchema.parse({});
    },
  });

  const configForm = useForm<IntegrationConfig>({
    defaultValues: integrationConfigSchema.parse({}),
  });

  useEffect(() => {
    if (configQuery.data) {
      configForm.reset(configQuery.data);
    }
  }, [configForm, configQuery.data]);

  const isConfigLoading = configQuery.isLoading;

  const upsertMutation = useMutation({
    mutationFn: async (values: IntegrationConfig) => {
      if (!selectedIntegration) {
        throw new Error('No integration selected');
      }
      const response = await apiRequest('PUT', `/api/settings/integrations/${selectedIntegration.name}`, values);
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Integration updated' });
      void queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] });
      setSelectedIntegration(null);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update integration.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const testConnection = async () => {
    if (!selectedIntegration) {
      return;
    }
    const response = await apiRequest('POST', `/api/settings/integrations/${selectedIntegration.name}/test`, {});
    await response.json();
  };

  const grouped = useMemo(() => {
    return integrations.reduce<Record<string, IntegrationListItem[]>>((acc, integration) => {
      if (!acc[integration.category]) {
        acc[integration.category] = [];
      }
      acc[integration.category].push(integration);
      return acc;
    }, {});
  }, [integrations]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([category, items]) => (
        <div key={category} className="space-y-3">
          <h2 className="text-lg font-semibold">{category}</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {items.map((integration) => (
              <Card key={integration.name} className="flex flex-col justify-between">
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{integration.label}</CardTitle>
                  <Badge variant={integration.status === 'CONNECTED' ? 'default' : 'secondary'}>{integration.status}</Badge>
                  <p className="text-xs text-muted-foreground">{integration.description}</p>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  <Button variant="outline" onClick={() => setSelectedIntegration(integration)}>
                    Configure
                  </Button>
                  <TestConnectionButton
                    variant="ghost"
                    onTest={async () => {
                      const response = await apiRequest(
                        'POST',
                        `/api/settings/integrations/${integration.name}/test`,
                        {},
                      );
                      await response.json();
                    }}
                  >
                    Test Connection
                  </TestConnectionButton>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
      <Dialog open={!!selectedIntegration} onOpenChange={(open) => (!open ? setSelectedIntegration(null) : null)}>
        {selectedIntegration ? (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{selectedIntegration.label} Configuration</DialogTitle>
            </DialogHeader>
            <Form {...configForm}>
              <form
                className="space-y-4"
                onSubmit={configForm.handleSubmit((values) => upsertMutation.mutate(values))}
              >
                <FormField
                  control={configForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Active</SelectItem>
                          <SelectItem value="INACTIVE">Inactive</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {integrationCatalog[selectedIntegration.name]?.fields.map((fieldDef) => (
                  <FormField
                    key={fieldDef.key}
                    control={configForm.control}
                    name={`credentials.${fieldDef.key}` as const}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{fieldDef.label}</FormLabel>
                        <FormControl>
                          <Input
                            type={fieldDef.type === 'password' ? 'password' : 'text'}
                            {...field}
                            value={field.value ?? ''}
                            disabled={isConfigLoading}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ))}
                <FormField
                  control={configForm.control}
                  name="webhookUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Webhook URL</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://"
                          {...field}
                          value={field.value ?? ''}
                          disabled={isConfigLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={configForm.control}
                  name="syncFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sync Frequency</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select frequency" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="REALTIME">Real-time</SelectItem>
                          <SelectItem value="HOURLY">Hourly</SelectItem>
                          <SelectItem value="DAILY">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-between gap-3">
                  <TestConnectionButton variant="outline" onTest={testConnection} disabled={isConfigLoading}>
                    Test Connection
                  </TestConnectionButton>
                  <Button type="submit" disabled={isConfigLoading || upsertMutation.isPending}>
                    {upsertMutation.isPending ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

export default IntegrationsSettings;
