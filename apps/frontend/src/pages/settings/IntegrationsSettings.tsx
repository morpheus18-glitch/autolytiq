import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { formatDistanceToNow } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@repo/ui';
import { Badge, type BadgeProps } from '@repo/ui';
import { Button } from '@repo/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@repo/ui';
import { Input } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { TestConnectionButton } from '@/components/settings/TestConnectionButton.tsx';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useForm } from 'react-hook-form';

type IntegrationStatus = string;

type IntegrationListItem = {
  name: string;
  label: string;
  category: string;
  status: IntegrationStatus;
  description?: string;
  logoUrl?: string | null;
  lastSyncAt?: string | null;
};

interface IntegrationFieldDefinition {
  key: string;
  label: string;
  type?: 'password' | 'text';
  placeholder?: string;
}

interface IntegrationDefinition {
  name: string;
  label: string;
  category: string;
  description: string;
  logoUrl?: string;
  fields: IntegrationFieldDefinition[];
}

const integrationDefinitions: IntegrationDefinition[] = [
  {
    name: 'experian-automotive',
    label: 'Experian Automotive',
    category: 'Credit & Data Services',
    description: 'Pull detailed credit bureau data for soft and hard inquiries with Experian Automotive.',
    logoUrl: 'https://logo.clearbit.com/experian.com',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'subscriberCode', label: 'Subscriber Code' },
    ],
  },
  {
    name: 'equifax-automotive',
    label: 'Equifax Automotive',
    category: 'Credit & Data Services',
    description: 'Automate credit pulls and risk scoring through Equifax Automotive.',
    logoUrl: 'https://logo.clearbit.com/equifax.com',
    fields: [
      { key: 'memberNumber', label: 'Member Number' },
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'securityCode', label: 'Security Code' },
    ],
  },
  {
    name: 'transunion-automotive',
    label: 'TransUnion Automotive',
    category: 'Credit & Data Services',
    description: 'Streamline TransUnion automotive credit reports and score retrieval.',
    logoUrl: 'https://logo.clearbit.com/transunion.com',
    fields: [
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password', type: 'password' },
      { key: 'subcode', label: 'Subcode' },
    ],
  },
  {
    name: 'nhtsa-vin-decoder',
    label: 'NHTSA VIN Decoder',
    category: 'Credit & Data Services',
    description: 'Decode VINs with real-time data directly from the National Highway Traffic Safety Administration.',
    logoUrl: 'https://logo.clearbit.com/nhtsa.gov',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
  },
  {
    name: 'carfax',
    label: 'Carfax Vehicle History',
    category: 'Credit & Data Services',
    description: 'Pull vehicle history and title checks from Carfax.',
    logoUrl: 'https://logo.clearbit.com/carfax.com',
    fields: [
      { key: 'partnerId', label: 'Partner ID' },
      { key: 'partnerPassword', label: 'Partner Password', type: 'password' },
      { key: 'dealerCode', label: 'Dealer Code' },
    ],
  },
  {
    name: 'black-book',
    label: 'Black Book',
    category: 'Credit & Data Services',
    description: 'Access daily vehicle valuation feeds from Black Book.',
    logoUrl: 'https://logo.clearbit.com/blackbook.com',
    fields: [
      { key: 'accountId', label: 'Account ID' },
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'dealerId', label: 'Dealer ID' },
    ],
  },
  {
    name: 'kelley-blue-book',
    label: 'Kelley Blue Book',
    category: 'Credit & Data Services',
    description: 'Connect to KBB for live vehicle valuation benchmarks.',
    logoUrl: 'https://logo.clearbit.com/kbb.com',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
    ],
  },
  {
    name: 'edmunds',
    label: 'Edmunds',
    category: 'Credit & Data Services',
    description: 'Synchronize incentive, pricing, and specification data from Edmunds.',
    logoUrl: 'https://logo.clearbit.com/edmunds.com',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'partnerId', label: 'Partner ID' },
    ],
  },
  {
    name: 'market-data-intelligence',
    label: 'Market Data Intelligence',
    category: 'Credit & Data Services',
    description: 'Consume competitive pricing and market demand analytics from preferred market data providers.',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'region', label: 'Default Region' },
    ],
  },
  {
    name: 'sendgrid',
    label: 'SendGrid',
    category: 'Communication Tools',
    description: 'Send transactional and campaign emails using Twilio SendGrid.',
    logoUrl: 'https://logo.clearbit.com/sendgrid.com',
    fields: [{ key: 'apiKey', label: 'API Key', type: 'password' }],
  },
  {
    name: 'aws-ses',
    label: 'AWS SES',
    category: 'Communication Tools',
    description: 'Deliver high-volume email via Amazon Simple Email Service.',
    logoUrl: 'https://logo.clearbit.com/aws.amazon.com',
    fields: [
      { key: 'accessKeyId', label: 'Access Key ID' },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
      { key: 'region', label: 'Region' },
    ],
  },
  {
    name: 'mailgun',
    label: 'Mailgun',
    category: 'Communication Tools',
    description: 'Send transactional email and manage inbound routes with Mailgun.',
    logoUrl: 'https://logo.clearbit.com/mailgun.com',
    fields: [
      { key: 'domain', label: 'Domain' },
      { key: 'apiKey', label: 'API Key', type: 'password' },
    ],
  },
  {
    name: 'twilio',
    label: 'Twilio SMS',
    category: 'Communication Tools',
    description: 'Power SMS, MMS, and voice workflows with Twilio.',
    logoUrl: 'https://logo.clearbit.com/twilio.com',
    fields: [
      { key: 'accountSid', label: 'Account SID' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
      { key: 'messagingServiceSid', label: 'Messaging Service SID' },
    ],
  },
  {
    name: 'plivo',
    label: 'Plivo',
    category: 'Communication Tools',
    description: 'Send SMS worldwide through Plivo messaging APIs.',
    fields: [
      { key: 'authId', label: 'Auth ID' },
      { key: 'authToken', label: 'Auth Token', type: 'password' },
    ],
  },
  {
    name: 'ringcentral',
    label: 'RingCentral',
    category: 'Communication Tools',
    description: 'Enable click-to-call and call logging with RingCentral.',
    logoUrl: 'https://logo.clearbit.com/ringcentral.com',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'serverUrl', label: 'Server URL', placeholder: 'https://platform.ringcentral.com' },
    ],
  },
  {
    name: 'vonage',
    label: 'Vonage',
    category: 'Communication Tools',
    description: 'Integrate Vonage voice and messaging for click-to-dial experiences.',
    logoUrl: 'https://logo.clearbit.com/vonage.com',
    fields: [
      { key: 'apiKey', label: 'API Key' },
      { key: 'apiSecret', label: 'API Secret', type: 'password' },
    ],
  },
  {
    name: 'intercom',
    label: 'Intercom',
    category: 'Communication Tools',
    description: 'Embed live chat and customer messaging via Intercom.',
    logoUrl: 'https://logo.clearbit.com/intercom.com',
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password' },
      { key: 'workspaceId', label: 'Workspace ID' },
    ],
  },
  {
    name: 'drift',
    label: 'Drift',
    category: 'Communication Tools',
    description: 'Deploy Drift chatbots and messaging on your storefront.',
    logoUrl: 'https://logo.clearbit.com/drift.com',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'verificationToken', label: 'Verification Token', type: 'password' },
    ],
  },
  {
    name: 'mailchimp',
    label: 'Mailchimp',
    category: 'Marketing Platforms',
    description: 'Sync audiences and campaigns with Mailchimp marketing automation.',
    logoUrl: 'https://logo.clearbit.com/mailchimp.com',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'serverPrefix', label: 'Server Prefix' },
    ],
  },
  {
    name: 'constant-contact',
    label: 'Constant Contact',
    category: 'Marketing Platforms',
    description: 'Connect email marketing flows using Constant Contact.',
    fields: [
      { key: 'apiKey', label: 'API Key' },
      { key: 'accessToken', label: 'Access Token', type: 'password' },
    ],
  },
  {
    name: 'klaviyo',
    label: 'Klaviyo',
    category: 'Marketing Platforms',
    description: 'Run lifecycle marketing campaigns powered by Klaviyo segments.',
    logoUrl: 'https://logo.clearbit.com/klaviyo.com',
    fields: [
      { key: 'privateApiKey', label: 'Private API Key', type: 'password' },
      { key: 'publicApiKey', label: 'Public API Key' },
    ],
  },
  {
    name: 'facebook-lead-ads',
    label: 'Facebook Lead Ads',
    category: 'Marketing Platforms',
    description: 'Ingest Facebook lead forms in real time.',
    logoUrl: 'https://logo.clearbit.com/facebook.com',
    fields: [
      { key: 'appId', label: 'App ID' },
      { key: 'appSecret', label: 'App Secret', type: 'password' },
      { key: 'pageId', label: 'Page ID' },
    ],
  },
  {
    name: 'google-ads',
    label: 'Google Ads',
    category: 'Marketing Platforms',
    description: 'Push offline conversions and retrieve ad performance from Google Ads.',
    logoUrl: 'https://logo.clearbit.com/ads.google.com',
    fields: [
      { key: 'developerToken', label: 'Developer Token', type: 'password' },
      { key: 'clientId', label: 'OAuth Client ID' },
      { key: 'clientSecret', label: 'OAuth Client Secret', type: 'password' },
    ],
  },
  {
    name: 'google-analytics',
    label: 'Google Analytics',
    category: 'Marketing Platforms',
    description: 'Send dealership events to GA4 for attribution tracking.',
    logoUrl: 'https://logo.clearbit.com/analytics.google.com',
    fields: [
      { key: 'measurementId', label: 'Measurement ID' },
      { key: 'apiSecret', label: 'API Secret', type: 'password' },
    ],
  },
  {
    name: 'facebook-pixel',
    label: 'Facebook Pixel',
    category: 'Marketing Platforms',
    description: 'Track conversions and retarget visitors using Facebook Pixel.',
    fields: [
      { key: 'pixelId', label: 'Pixel ID' },
      { key: 'accessToken', label: 'Access Token', type: 'password' },
    ],
  },
  {
    name: 'quickbooks-export',
    label: 'QuickBooks Online Export',
    category: 'Accounting Export',
    description: 'Export GL entries and receivables into QuickBooks Online.',
    logoUrl: 'https://logo.clearbit.com/quickbooks.intuit.com',
    fields: [
      { key: 'realmId', label: 'Realm ID' },
      { key: 'refreshToken', label: 'Refresh Token', type: 'password' },
    ],
  },
  {
    name: 'xero-export',
    label: 'Xero Export',
    category: 'Accounting Export',
    description: 'Send journal entries and invoices to Xero for downstream accounting.',
    logoUrl: 'https://logo.clearbit.com/xero.com',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'tenantId', label: 'Tenant ID' },
    ],
  },
  {
    name: 'sage-intacct-export',
    label: 'Sage Intacct Export',
    category: 'Accounting Export',
    description: 'Streamline one-way exports into Sage Intacct for finance teams.',
    fields: [
      { key: 'senderId', label: 'Sender ID' },
      { key: 'senderPassword', label: 'Sender Password', type: 'password' },
      { key: 'companyId', label: 'Company ID' },
      { key: 'userId', label: 'User ID' },
      { key: 'userPassword', label: 'User Password', type: 'password' },
    ],
  },
  {
    name: 'csv-export',
    label: 'CSV / SFTP Export',
    category: 'Accounting Export',
    description: 'Deliver scheduled CSV or Excel exports to downstream accounting partners.',
    fields: [
      { key: 'sftpHost', label: 'SFTP Host' },
      { key: 'sftpUsername', label: 'SFTP Username' },
      { key: 'sftpPassword', label: 'SFTP Password', type: 'password' },
      { key: 'directory', label: 'Remote Directory', placeholder: '/exports' },
    ],
  },
  {
    name: 'stripe-payments',
    label: 'Stripe',
    category: 'Payment Processing',
    description: 'Accept deposits and online payments via Stripe.',
    logoUrl: 'https://logo.clearbit.com/stripe.com',
    fields: [
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
      { key: 'publishableKey', label: 'Publishable Key' },
      { key: 'webhookSecret', label: 'Webhook Secret', type: 'password' },
    ],
  },
  {
    name: 'square',
    label: 'Square',
    category: 'Payment Processing',
    description: 'Sync POS payments and refunds from Square.',
    logoUrl: 'https://logo.clearbit.com/squareup.com',
    fields: [
      { key: 'accessToken', label: 'Access Token', type: 'password' },
      { key: 'locationId', label: 'Location ID' },
    ],
  },
  {
    name: 'authorize-net',
    label: 'Authorize.net',
    category: 'Payment Processing',
    description: 'Process credit card and ACH transactions through Authorize.net.',
    fields: [
      { key: 'apiLoginId', label: 'API Login ID' },
      { key: 'transactionKey', label: 'Transaction Key', type: 'password' },
    ],
  },
  {
    name: 'ach-payments',
    label: 'ACH Processor',
    category: 'Payment Processing',
    description: 'Enable direct ACH transfers for recurring payments and payoffs.',
    fields: [
      { key: 'processorId', label: 'Processor ID' },
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'endpoint', label: 'Endpoint URL', placeholder: 'https://api.processor.com' },
    ],
  },
  {
    name: 'docusign',
    label: 'DocuSign',
    category: 'Document Services',
    description: 'Manage digital signatures and envelopes through DocuSign.',
    logoUrl: 'https://logo.clearbit.com/docusign.com',
    fields: [
      { key: 'integrationKey', label: 'Integration Key' },
      { key: 'secretKey', label: 'Secret Key', type: 'password' },
      { key: 'accountId', label: 'Account ID' },
      { key: 'baseUrl', label: 'Base URL', placeholder: 'https://account.docusign.com' },
    ],
  },
  {
    name: 'hellosign',
    label: 'HelloSign',
    category: 'Document Services',
    description: 'Collect legally binding signatures with HelloSign.',
    logoUrl: 'https://logo.clearbit.com/hellosign.com',
    fields: [
      { key: 'apiKey', label: 'API Key', type: 'password' },
      { key: 'clientId', label: 'Client ID' },
    ],
  },
  {
    name: 'adobe-sign',
    label: 'Adobe Sign',
    category: 'Document Services',
    description: 'Route agreements for signature via Adobe Sign.',
    logoUrl: 'https://logo.clearbit.com/adobe.com',
    fields: [
      { key: 'clientId', label: 'Client ID' },
      { key: 'clientSecret', label: 'Client Secret', type: 'password' },
      { key: 'technicalAccountId', label: 'Technical Account ID' },
      { key: 'organizationId', label: 'Organization ID' },
    ],
  },
  {
    name: 'dmv-e-filing',
    label: 'DMV e-Filing',
    category: 'Document Services',
    description: 'Submit registration and title paperwork through state DMV e-filing endpoints.',
    fields: [
      { key: 'agency', label: 'Agency' },
      { key: 'username', label: 'Username' },
      { key: 'password', label: 'Password', type: 'password' },
      { key: 'endpoint', label: 'Endpoint URL' },
    ],
  },
  {
    name: 'aws-s3-storage',
    label: 'AWS S3',
    category: 'Storage & CDN',
    description: 'Store vehicle media and documents securely in Amazon S3.',
    logoUrl: 'https://logo.clearbit.com/aws.amazon.com',
    fields: [
      { key: 'bucket', label: 'Bucket Name' },
      { key: 'accessKeyId', label: 'Access Key ID' },
      { key: 'secretAccessKey', label: 'Secret Access Key', type: 'password' },
      { key: 'region', label: 'Region' },
    ],
  },
  {
    name: 'azure-blob-storage',
    label: 'Azure Blob Storage',
    category: 'Storage & CDN',
    description: 'Back up documents and deliver media via Azure Blob Storage.',
    logoUrl: 'https://logo.clearbit.com/azure.microsoft.com',
    fields: [
      { key: 'connectionString', label: 'Connection String', type: 'password' },
      { key: 'container', label: 'Container' },
    ],
  },
  {
    name: 'cloudflare-images',
    label: 'Cloudflare Images',
    category: 'Storage & CDN',
    description: 'Optimize and serve media assets using Cloudflare Images and CDN.',
    logoUrl: 'https://logo.clearbit.com/cloudflare.com',
    fields: [
      { key: 'accountId', label: 'Account ID' },
      { key: 'apiToken', label: 'API Token', type: 'password' },
    ],
  },
];

const integrationCatalog = integrationDefinitions.reduce<Record<string, IntegrationDefinition>>((acc, definition) => {
  acc[definition.name] = definition;
  return acc;
}, {});

const categoryOrder = Array.from(new Set(integrationDefinitions.map((definition) => definition.category)));

const integrationListSchema = z.array(
  z.object({
    name: z.string(),
    label: z.string().optional(),
    category: z.string().optional(),
    status: z.string().optional(),
    description: z.string().optional(),
    logoUrl: z.string().optional().nullable(),
    lastSyncAt: z.string().optional().nullable(),
  }),
);

const integrationConfigSchema = z.object({
  status: z.enum(['ACTIVE', 'INACTIVE']).default('INACTIVE'),
  credentials: z.record(z.string()).default({}),
  webhookUrl: z.string().optional().default(''),
  syncFrequency: z.enum(['REALTIME', 'HOURLY', 'DAILY']).default('REALTIME'),
  lastSyncAt: z.string().optional().nullable(),
});

type IntegrationConfigFormValues = z.infer<typeof integrationConfigSchema>;
type IntegrationConfigPayload = Omit<IntegrationConfigFormValues, 'lastSyncAt'>;

const emptyConfig: IntegrationConfigFormValues = {
  status: 'INACTIVE',
  credentials: {},
  webhookUrl: '',
  syncFrequency: 'REALTIME',
  lastSyncAt: null,
};

const defaultIntegrations: IntegrationListItem[] = integrationDefinitions.map((definition) => ({
  name: definition.name,
  label: definition.label,
  category: definition.category,
  status: 'DISCONNECTED',
  description: definition.description,
  logoUrl: definition.logoUrl,
  lastSyncAt: null,
}));

const toTitleCase = (value: string): string =>
  value
    .replace(/[\-_]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

function mergeIntegrationDefinition(item: z.infer<typeof integrationListSchema>[number]): IntegrationListItem {
  const definition = integrationCatalog[item.name];
  const label = item.label ?? definition?.label ?? toTitleCase(item.name);
  const category = item.category ?? definition?.category ?? 'Other Integrations';
  const description = item.description ?? definition?.description ?? '';
  const logoUrl = item.logoUrl ?? definition?.logoUrl ?? null;
  const status = (item.status ?? 'DISCONNECTED').toString();
  const lastSyncAt = item.lastSyncAt ?? null;
  return { name: item.name, label, category, status, description, logoUrl, lastSyncAt };
}

function normalizeIntegrationConfig(
  name: string,
  config: Partial<IntegrationConfigFormValues>,
): IntegrationConfigFormValues {
  const definition = integrationCatalog[name];
  const normalizedStatus = config.status?.toUpperCase() === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE';
  const frequency = config.syncFrequency?.toUpperCase();
  const normalizedFrequency: IntegrationConfigFormValues['syncFrequency'] =
    frequency === 'HOURLY' ? 'HOURLY' : frequency === 'DAILY' ? 'DAILY' : 'REALTIME';
  const credentialsSource: Record<string, string> = { ...(config.credentials ?? {}) };
  if (definition) {
    for (const field of definition.fields) {
      if (credentialsSource[field.key] === undefined) {
        credentialsSource[field.key] = '';
      }
    }
  }

  return {
    status: normalizedStatus,
    syncFrequency: normalizedFrequency,
    webhookUrl: config.webhookUrl ?? '',
    credentials: credentialsSource,
    lastSyncAt: config.lastSyncAt ?? null,
  };
}

function getStatusVariant(status: IntegrationStatus): BadgeProps['variant'] {
  const normalized = status.toUpperCase();
  if (['CONNECTED', 'ACTIVE', 'ENABLED', 'ONLINE'].includes(normalized)) {
    return 'default';
  }
  if (['ERROR', 'FAILED', 'DEGRADED'].includes(normalized)) {
    return 'destructive';
  }
  return 'secondary';
}

function getInitials(label: string): string {
  const parts = label.split(' ').filter(Boolean);
  if (parts.length === 0) {
    return label.slice(0, 2).toUpperCase();
  }
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function IntegrationsSettings(): JSX.Element {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedIntegration, setSelectedIntegration] = useState<IntegrationListItem | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['settings', 'integrations'],
    queryFn: async () => {
      try {
        const response = await apiRequest('/api/settings/integrations');
        const json = (await response.json()) as unknown;
        const parsed = integrationListSchema.safeParse(json);
        if (parsed.success) {
          const map = new Map(defaultIntegrations.map((integration) => [integration.name, { ...integration }]));
          parsed.data.forEach((item) => {
            const merged = mergeIntegrationDefinition(item);
            map.set(merged.name, merged);
          });
          return Array.from(map.values());
        }
      } catch (error) {
        console.warn('Failed to load integrations', error);
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
        return emptyConfig;
      }
      try {
        const response = await apiRequest(`/api/settings/integrations/${selectedIntegration.name}`);
        const json = (await response.json()) as unknown;
        const parsed = integrationConfigSchema.safeParse(json);
        if (parsed.success) {
          return normalizeIntegrationConfig(selectedIntegration.name, parsed.data);
        }
      } catch (error) {
        console.warn('Failed to load integration configuration', error);
      }
      return normalizeIntegrationConfig(selectedIntegration.name, {});
    },
  });

  const configForm = useForm<IntegrationConfigFormValues>({
    defaultValues: emptyConfig,
  });

  useEffect(() => {
    if (!selectedIntegration) {
      configForm.reset(emptyConfig);
      return;
    }
    configForm.reset(normalizeIntegrationConfig(selectedIntegration.name, {}));
  }, [configForm, selectedIntegration?.name, selectedIntegration]);

  useEffect(() => {
    if (configQuery.data && selectedIntegration) {
      configForm.reset(configQuery.data);
    }
  }, [configForm, configQuery.data, selectedIntegration]);

  const isConfigLoading = configQuery.isLoading;
  const isConfigFetching = configQuery.isFetching && !configQuery.isLoading;

  const upsertMutation = useMutation<IntegrationConfigFormValues, unknown, IntegrationConfigPayload>({
    mutationFn: async (payload) => {
      if (!selectedIntegration) {
        throw new Error('No integration selected');
      }
      const response = await apiRequest('PUT', `/api/settings/integrations/${selectedIntegration.name}`, payload);
      if (response.headers.get('Content-Type')?.includes('application/json')) {
        const json = (await response.json()) as unknown;
        const parsed = integrationConfigSchema.safeParse(json);
        if (parsed.success) {
          return normalizeIntegrationConfig(selectedIntegration.name, parsed.data);
        }
      }
      return normalizeIntegrationConfig(selectedIntegration.name, {
        ...payload,
        lastSyncAt: configForm.getValues('lastSyncAt') ?? null,
      });
    },
    onSuccess: (normalized) => {
      configForm.reset(normalized);
      toast({ title: 'Integration updated' });
      void queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] });
      if (selectedIntegration) {
        void configQuery.refetch();
      }
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update integration.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const syncMutation = useMutation({
    mutationFn: async () => {
      if (!selectedIntegration) {
        throw new Error('No integration selected');
      }
      await apiRequest('POST', `/api/settings/integrations/${selectedIntegration.name}/sync`, {});
    },
    onSuccess: () => {
      toast({ title: 'Sync started' });
      void queryClient.invalidateQueries({ queryKey: ['settings', 'integrations'] });
      void configQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to start sync.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const handleConfigSubmit = configForm.handleSubmit((values) => {
    const { lastSyncAt: _lastSyncAt, ...payload } = values;
    upsertMutation.mutate(payload);
  });

  const handleTestConnection = async () => {
    if (!selectedIntegration) {
      throw new Error('No integration selected');
    }
    const { lastSyncAt: _lastSyncAt, ...payload } = configForm.getValues();
    await apiRequest('POST', `/api/settings/integrations/${selectedIntegration.name}/test`, payload);
  };

  const disableForm = isConfigLoading || upsertMutation.isPending || syncMutation.isPending;
  const disableTest = disableForm || isConfigFetching;

  const grouped = useMemo(() => {
    return integrations.reduce<Record<string, IntegrationListItem[]>>((acc, integration) => {
      acc[integration.category] = acc[integration.category] || [];
      acc[integration.category].push(integration);
      return acc;
    }, {});
  }, [integrations]);

  const orderedCategories = useMemo(() => {
    const known = categoryOrder.filter((category) => (grouped[category]?.length ?? 0) > 0);
    const extras = Object.keys(grouped)
      .filter((category) => !categoryOrder.includes(category))
      .sort();
    return [...known, ...extras];
  }, [grouped]);

  const lastSyncAt = configForm.watch('lastSyncAt');
  const lastSyncDescription = useMemo(() => {
    if (!lastSyncAt) {
      return 'Never';
    }
    const date = new Date(lastSyncAt);
    if (Number.isNaN(date.getTime())) {
      return 'Unknown';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  }, [lastSyncAt]);
  const lastSyncAbsolute = useMemo(() => {
    if (!lastSyncAt) {
      return undefined;
    }
    const date = new Date(lastSyncAt);
    if (Number.isNaN(date.getTime())) {
      return undefined;
    }
    return date.toLocaleString();
  }, [lastSyncAt]);

  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  return (
    <div className="space-y-6">
      {orderedCategories.map((category) => {
        const items = grouped[category] ?? [];
        if (items.length === 0) {
          return null;
        }
        const sortedItems = [...items].sort((a, b) => a.label.localeCompare(b.label));
        return (
          <div key={category} className="space-y-3">
            <h2 className="text-lg font-semibold">{category}</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {sortedItems.map((integration) => (
                <Card key={integration.name} className="flex flex-col justify-between">
                  <CardHeader className="space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {integration.logoUrl ? (
                            <AvatarImage src={integration.logoUrl} alt={integration.label} />
                          ) : null}
                          <AvatarFallback>{getInitials(integration.label)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <CardTitle className="text-base font-semibold leading-tight">
                            {integration.label}
                          </CardTitle>
                          <CardDescription>{integration.description}</CardDescription>
                        </div>
                      </div>
                      <Badge variant={getStatusVariant(integration.status)}>
                        {toTitleCase(integration.status)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 pt-0">
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <Button
                        className="w-full sm:w-auto"
                        variant="outline"
                        onClick={() => setSelectedIntegration(integration)}
                      >
                        Configure
                      </Button>
                      <TestConnectionButton
                        className="w-full sm:w-auto"
                        variant="ghost"
                        successMessage="Connection succeeded"
                        errorMessage="Connection test failed"
                        onTest={async () => {
                          await apiRequest('POST', `/api/settings/integrations/${integration.name}/test`, {});
                        }}
                      >
                        Test Connection
                      </TestConnectionButton>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
      <Dialog open={!!selectedIntegration} onOpenChange={(open) => (!open ? setSelectedIntegration(null) : null)}>
        {selectedIntegration ? (
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedIntegration.label}</DialogTitle>
              <DialogDescription>{selectedIntegration.description}</DialogDescription>
            </DialogHeader>
            {isConfigLoading && !configQuery.data ? (
              <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ) : (
              <Form {...configForm}>
                <form className="space-y-4" onSubmit={handleConfigSubmit}>
                  <div>
                    <FormLabel>Name</FormLabel>
                    <Input value={selectedIntegration.label} readOnly disabled className="mt-1" />
                  </div>
                  <FormField
                    control={configForm.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger disabled={disableForm}>
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
                  {(() => {
                    const definition = integrationCatalog[selectedIntegration.name];
                    const credentialFields = definition?.fields ?? [];
                    if (credentialFields.length === 0) {
                      return (
                        <p className="rounded-md border border-dashed border-border px-3 py-2 text-sm text-muted-foreground">
                          This integration does not require credential configuration.
                        </p>
                      );
                    }
                    return (
                      <div className="grid gap-4 md:grid-cols-2">
                        {credentialFields.map((fieldDef) => (
                          <FormField
                            key={fieldDef.key}
                            control={configForm.control}
                            name={`credentials.${fieldDef.key}` as const}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{fieldDef.label}</FormLabel>
                                <FormControl>
                                  <Input
                                    {...field}
                                    value={field.value ?? ''}
                                    type={fieldDef.type === 'password' ? 'password' : 'text'}
                                    placeholder={fieldDef.placeholder}
                                    disabled={disableForm}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    );
                  })()}
                  <FormField
                    control={configForm.control}
                    name="webhookUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Webhook URL</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            value={field.value ?? ''}
                            placeholder="https://"
                            disabled={disableForm}
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
                            <SelectTrigger disabled={disableForm}>
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
                  <p className="text-xs text-muted-foreground">
                    Last sync: {lastSyncDescription}
                    {lastSyncAbsolute ? ` • ${lastSyncAbsolute}` : ''}
                  </p>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => syncMutation.mutate()}
                      disabled={disableForm}
                    >
                      {syncMutation.isPending ? 'Starting sync…' : 'Sync Now'}
                    </Button>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      <TestConnectionButton
                        variant="outline"
                        onTest={handleTestConnection}
                        disabled={disableTest}
                        successMessage="Connection succeeded"
                        errorMessage="Connection test failed"
                      >
                        Test Connection
                      </TestConnectionButton>
                      <Button type="submit" disabled={disableForm || isConfigFetching}>
                        {upsertMutation.isPending ? 'Saving…' : 'Save Changes'}
                      </Button>
                    </div>
                  </div>
                </form>
              </Form>
            )}
          </DialogContent>
        ) : null}
      </Dialog>
    </div>
  );
}

export default IntegrationsSettings;
