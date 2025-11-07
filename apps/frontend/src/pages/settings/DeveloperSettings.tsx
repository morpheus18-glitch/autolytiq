import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { z } from 'zod';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@repo/ui';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@repo/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@repo/ui';
import { Input } from '@repo/ui';
import { Label } from '@repo/ui';
import { ScrollArea } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Separator } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch.tsx';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@repo/ui';
import { usePermissions } from '@/hooks/usePermissions';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Bar, BarChart } from 'recharts';
const serviceStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['UP', 'DEGRADED', 'DOWN']).default('UP'),
  uptime: z.string().optional(),
  lastRestart: z.string().optional(),
  memoryUsageMb: z.number().optional(),
  cpuPercent: z.number().optional(),
  connections: z.number().optional(),
  dbSizeMb: z.number().optional(),
  queryPerformanceMs: z.number().optional(),
  qps: z.number().optional(),
  modelVersion: z.string().optional(),
  lastTrainingAt: z.string().optional(),
});

const redisKeySchema = z.object({
  key: z.string(),
  valuePreview: z.string().optional(),
  ttlSeconds: z.number().optional(),
});

const systemStatusResponseSchema = z.object({
  overallHealth: z.enum(['GREEN', 'YELLOW', 'RED']).default('GREEN'),
  services: z.array(serviceStatusSchema).default([]),
  redis: z
    .object({
      memoryUsageMb: z.number().optional(),
      keys: z.number().optional(),
      hitRate: z.number().optional(),
      evictions: z.number().optional(),
      samples: z.array(redisKeySchema).default([]),
    })
    .optional(),
});

type SystemStatusResponse = {
  overallHealth: 'GREEN' | 'YELLOW' | 'RED';
  services: z.infer<typeof serviceStatusSchema>[];
  redis: {
    memoryUsageMb: number;
    keys: number;
    hitRate: number;
    evictions: number;
    samples: z.infer<typeof redisKeySchema>[];
  };
};

const DEFAULT_SYSTEM_STATUS: SystemStatusResponse = {
  overallHealth: 'GREEN',
  services: [],
  redis: { memoryUsageMb: 0, keys: 0, hitRate: 0, evictions: 0, samples: [] },
};

function normalizeSystemStatus(data: unknown): SystemStatusResponse {
  const parsed = systemStatusResponseSchema.safeParse(data);
  if (!parsed.success) {
    return DEFAULT_SYSTEM_STATUS;
  }
  const redis = parsed.data.redis ?? { memoryUsageMb: 0, keys: 0, hitRate: 0, evictions: 0, samples: [] };
  return {
    overallHealth: parsed.data.overallHealth,
    services: parsed.data.services,
    redis: {
      memoryUsageMb: redis.memoryUsageMb ?? 0,
      keys: redis.keys ?? 0,
      hitRate: redis.hitRate ?? 0,
      evictions: redis.evictions ?? 0,
      samples: redis.samples ?? [],
    },
  };
}

const tenantSettingsSchema = z.object({
  featureFlags: z.record(z.boolean()).default({}),
  rateLimitPerHour: z.number().optional(),
  storageLimitGb: z.number().optional(),
  userLimit: z.number().optional(),
});

const tenantInfoSchema = z.object({
  tenant: z.object({
    id: z.string(),
    name: z.string(),
    status: z.string(),
    createdAt: z.string(),
  }),
  recordCounts: z.record(z.number()).default({}),
  storageUsageMb: z.number().optional(),
  storageLimitMb: z.number().optional(),
  apiUsageToday: z.number().optional(),
  apiLimit: z.number().optional(),
  settings: tenantSettingsSchema.optional(),
});

interface TenantSettingsDraft {
  featureFlags: Record<string, boolean>;
  rateLimitPerHour?: number;
  storageLimitGb?: number;
  userLimit?: number;
}

interface TenantInfoNormalized {
  tenant: z.infer<typeof tenantInfoSchema>['tenant'];
  recordCounts: Record<string, number>;
  storageUsageMb?: number;
  storageLimitMb?: number;
  apiUsageToday?: number;
  apiLimit?: number;
  settings: TenantSettingsDraft;
}

const DEFAULT_TENANT_INFO: TenantInfoNormalized = {
  tenant: { id: 'unknown', name: 'Unknown Tenant', status: 'UNKNOWN', createdAt: new Date(0).toISOString() },
  recordCounts: {},
  settings: { featureFlags: {} },
};

function normalizeTenantInfo(data: unknown): TenantInfoNormalized {
  const parsed = tenantInfoSchema.safeParse(data);
  if (!parsed.success) {
    return DEFAULT_TENANT_INFO;
  }
  return {
    tenant: parsed.data.tenant,
    recordCounts: parsed.data.recordCounts,
    storageUsageMb: parsed.data.storageUsageMb,
    storageLimitMb: parsed.data.storageLimitMb,
    apiUsageToday: parsed.data.apiUsageToday,
    apiLimit: parsed.data.apiLimit,
    settings: {
      featureFlags: parsed.data.settings?.featureFlags ?? {},
      rateLimitPerHour: parsed.data.settings?.rateLimitPerHour ?? parsed.data.apiLimit,
      storageLimitGb:
        parsed.data.settings?.storageLimitGb ??
        (parsed.data.storageLimitMb ? parsed.data.storageLimitMb / 1024 : undefined),
      userLimit: parsed.data.settings?.userLimit,
    },
  };
}

const sqlResultSchema = z.object({
  columns: z.array(z.string()).optional(),
  rows: z.array(z.record(z.any())).default([]),
  durationMs: z.number().optional(),
  rowCount: z.number().optional(),
  message: z.string().optional(),
});

type SqlResult = z.infer<typeof sqlResultSchema>;

const requestLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  method: z.string(),
  path: z.string(),
  statusCode: z.number(),
  durationMs: z.number(),
  user: z.string().optional(),
  error: z.string().optional(),
  stack: z.string().optional(),
});

type RequestLog = z.infer<typeof requestLogSchema>;

const jobTaskSchema = z.object({
  id: z.string(),
  name: z.string(),
  enqueuedAt: z.string().optional(),
  startedAt: z.string().optional(),
  completedAt: z.string().optional(),
  failedAt: z.string().optional(),
  priority: z.string().optional(),
  progress: z.number().optional(),
  durationMs: z.number().optional(),
  error: z.string().optional(),
  retryCount: z.number().optional(),
  workerId: z.string().optional(),
});

type JobTask = z.infer<typeof jobTaskSchema>;

const jobQueueSchema = z.object({
  workers: z
    .object({
      active: z.number().optional(),
      processing: z.number().optional(),
      queued: z.number().optional(),
      failedLastHour: z.number().optional(),
    })
    .optional(),
  queues: z
    .object({
      pending: z.array(jobTaskSchema).default([]),
      processing: z.array(jobTaskSchema).default([]),
      completed: z.array(jobTaskSchema).default([]),
      failed: z.array(jobTaskSchema).default([]),
    })
    .default({ pending: [], processing: [], completed: [], failed: [] }),
});

interface JobQueueNormalized {
  workers: {
    active: number;
    processing: number;
    queued: number;
    failedLastHour: number;
  };
  queues: {
    pending: JobTask[];
    processing: JobTask[];
    completed: JobTask[];
    failed: JobTask[];
  };
}

const DEFAULT_JOB_QUEUE: JobQueueNormalized = {
  workers: { active: 0, processing: 0, queued: 0, failedLastHour: 0 },
  queues: { pending: [], processing: [], completed: [], failed: [] },
};

function normalizeJobQueue(data: unknown): JobQueueNormalized {
  const parsed = jobQueueSchema.safeParse(data);
  if (!parsed.success) {
    return DEFAULT_JOB_QUEUE;
  }
  return {
    workers: {
      active: parsed.data.workers?.active ?? 0,
      processing: parsed.data.workers?.processing ?? 0,
      queued: parsed.data.workers?.queued ?? 0,
      failedLastHour: parsed.data.workers?.failedLastHour ?? 0,
    },
    queues: parsed.data.queues,
  };
}

const systemLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: z.enum(['DEBUG', 'INFO', 'WARN', 'ERROR']).catch('INFO'),
  service: z.string(),
  message: z.string(),
});

type SystemLog = z.infer<typeof systemLogSchema>;

const featureFlagSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean().optional(),
  rolloutPercentage: z.number().optional(),
  overrides: z.record(z.boolean()).optional(),
});

type FeatureFlag = z.infer<typeof featureFlagSchema>;

const webhookLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  eventType: z.string(),
  url: z.string(),
  statusCode: z.number(),
  responseTimeMs: z.number(),
  retryCount: z.number().optional(),
});

const integrationStatusSchema = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(['HEALTHY', 'WARNING', 'ERROR']).catch('HEALTHY'),
  lastSyncAt: z.string().optional(),
  errorCount: z.number().optional(),
});

const webhookLogsResponseSchema = z.object({
  logs: z.array(webhookLogSchema).default([]),
  integrations: z.array(integrationStatusSchema).default([]),
});

type WebhookLogsResponse = z.infer<typeof webhookLogsResponseSchema>;

const slowQuerySchema = z.object({
  query: z.string(),
  durationMs: z.number(),
  frequency: z.number().optional(),
  missingIndexes: z.array(z.string()).optional(),
  hint: z.string().optional(),
});

type SlowQueryInsight = z.infer<typeof slowQuerySchema>;

const memoryProfilerSchema = z.object({
  heapSamples: z.array(z.object({ timestamp: z.string(), heapMb: z.number() })).default([]),
  leakWarnings: z.array(z.string()).default([]),
  gcStats: z
    .object({
      minorGcCount: z.number().optional(),
      majorGcCount: z.number().optional(),
      avgPauseMs: z.number().optional(),
    })
    .default({}),
});

type MemoryProfilerInsight = z.infer<typeof memoryProfilerSchema>;

const performanceQueriesSchema = z.object({
  slowQueries: z.array(slowQuerySchema).default([]),
  missingIndexes: z.array(z.string()).default([]),
  optimizationHints: z.array(z.string()).default([]),
  memory: memoryProfilerSchema.optional(),
});

interface PerformanceQueriesNormalized {
  slowQueries: SlowQueryInsight[];
  missingIndexes: string[];
  optimizationHints: string[];
  memory?: MemoryProfilerInsight;
}

const endpointMetricSchema = z.object({
  endpoint: z.string(),
  p50: z.number(),
  p95: z.number(),
  p99: z.number(),
  errorRate: z.number(),
  volume: z.number().optional(),
});

type EndpointMetric = z.infer<typeof endpointMetricSchema>;

const requestVolumePointSchema = z.object({
  timestamp: z.string(),
  count: z.number(),
});

const slowestTableSchema = z.object({
  name: z.string(),
  avgMs: z.number(),
});

const performanceEndpointsSchema = z.object({
  endpoints: z.array(endpointMetricSchema).default([]),
  requestVolume: z.array(requestVolumePointSchema).default([]),
  slowestTables: z.array(slowestTableSchema).default([]),
});

interface PerformanceEndpointsNormalized {
  endpoints: EndpointMetric[];
  requestVolume: z.infer<typeof requestVolumePointSchema>[];
  slowestTables: z.infer<typeof slowestTableSchema>[];
}

const createId = () =>
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2);
function useDeveloperSystemStatus(enabled: boolean) {
  return useQuery<SystemStatusResponse>({
    queryKey: ['developer', 'system-status'],
    enabled,
    refetchInterval: enabled ? 30000 : false,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/system-status');
      const json = (await response.json()) as unknown;
      return normalizeSystemStatus(json);
    },
  });
}

function useDeveloperTenantInfo(enabled: boolean) {
  return useQuery<TenantInfoNormalized>({
    queryKey: ['developer', 'tenant-info'],
    enabled,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/tenant-info');
      const json = (await response.json()) as unknown;
      return normalizeTenantInfo(json);
    },
  });
}

function useDeveloperRequestLogs(enabled: boolean) {
  return useQuery<RequestLog[]>({
    queryKey: ['developer', 'request-logs'],
    enabled,
    refetchInterval: enabled ? 15000 : false,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/request-logs');
      const json = (await response.json()) as unknown;
      const parsed = z.array(requestLogSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [];
    },
  });
}

function useDeveloperJobQueue(enabled: boolean) {
  return useQuery<JobQueueNormalized>({
    queryKey: ['developer', 'job-queue'],
    enabled,
    refetchInterval: enabled ? 10000 : false,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/job-queue');
      const json = (await response.json()) as unknown;
      return normalizeJobQueue(json);
    },
  });
}

function useDeveloperLogs(enabled: boolean, autoRefresh: boolean) {
  return useQuery<SystemLog[]>({
    queryKey: ['developer', 'logs'],
    enabled,
    refetchInterval: enabled && autoRefresh ? 5000 : false,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/logs');
      const json = (await response.json()) as unknown;
      const parsed = z.array(systemLogSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [];
    },
  });
}

function useDeveloperFeatureFlags(enabled: boolean) {
  return useQuery<FeatureFlag[]>({
    queryKey: ['developer', 'feature-flags'],
    enabled,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/feature-flags');
      const json = (await response.json()) as unknown;
      const parsed = z.array(featureFlagSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [];
    },
  });
}

function useDeveloperWebhookLogs(enabled: boolean) {
  return useQuery<WebhookLogsResponse>({
    queryKey: ['developer', 'webhooks', 'logs'],
    enabled,
    refetchInterval: enabled ? 20000 : false,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/webhooks/logs');
      const json = (await response.json()) as unknown;
      const parsed = webhookLogsResponseSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return { logs: [], integrations: [] } satisfies WebhookLogsResponse;
    },
  });
}

function useDeveloperPerformance(enabled: boolean) {
  const slowQueries = useQuery<PerformanceQueriesNormalized>({
    queryKey: ['developer', 'performance', 'queries'],
    enabled,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/performance/queries');
      const json = (await response.json()) as unknown;
      if (Array.isArray(json)) {
        return { slowQueries: json, missingIndexes: [], optimizationHints: [] } satisfies PerformanceQueriesNormalized;
      }
      const parsed = performanceQueriesSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return { slowQueries: [], missingIndexes: [], optimizationHints: [] } satisfies PerformanceQueriesNormalized;
    },
  });

  const endpoints = useQuery<PerformanceEndpointsNormalized>({
    queryKey: ['developer', 'performance', 'endpoints'],
    enabled,
    queryFn: async () => {
      const response = await apiRequest('/api/developer/performance/endpoints');
      const json = (await response.json()) as unknown;
      if (Array.isArray(json)) {
        return { endpoints: json, requestVolume: [], slowestTables: [] } satisfies PerformanceEndpointsNormalized;
      }
      const parsed = performanceEndpointsSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return { endpoints: [], requestVolume: [], slowestTables: [] } satisfies PerformanceEndpointsNormalized;
    },
  });

  return { slowQueries, endpoints };
}

interface QueryHistoryItem {
  id: string;
  query: string;
  executedAt: string;
  durationMs?: number;
  rowCount?: number;
  error?: string;
}

interface SavedQuery {
  id: string;
  name: string;
  query: string;
}
export function DeveloperSettings(): JSX.Element {
  const { toast } = useToast();
  const { user, hasRole, hasPermission } = usePermissions();
  const queryClient = useQueryClient();

  const isAdmin = hasRole('ADMIN');
  const hasDeveloperPermission = hasPermission('developer') || hasPermission('developer:access');
  const isAuthorized = Boolean(user && isAdmin && hasDeveloperPermission);

  const [autoRefreshLogs, setAutoRefreshLogs] = useState(true);
  const [sql, setSql] = useState('SELECT NOW();');
  const [sqlResult, setSqlResult] = useState<SqlResult | null>(null);
  const [sqlPage, setSqlPage] = useState(0);
  const [history, setHistory] = useState<QueryHistoryItem[]>([]);
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const [selectedSavedQuery, setSelectedSavedQuery] = useState<string>();
  const [tenantSettingsDraft, setTenantSettingsDraft] = useState<TenantSettingsDraft>({ featureFlags: {} });
  const [newFlagOpen, setNewFlagOpen] = useState(false);
  const [newFlag, setNewFlag] = useState({ key: '', name: '', description: '' });
  const [requestStatusFilter, setRequestStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILED'>('ALL');
  const [requestMethodFilter, setRequestMethodFilter] = useState<string>('ALL');
  const [requestSearch, setRequestSearch] = useState('');
  const [logLevelFilter, setLogLevelFilter] = useState<'ALL' | 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'>('ALL');
  const [logServiceFilter, setLogServiceFilter] = useState<string>('ALL');
  const [logSearch, setLogSearch] = useState('');
  const [cacheSearch, setCacheSearch] = useState('');
  const [selectedCacheKey, setSelectedCacheKey] = useState<z.infer<typeof redisKeySchema> | null>(null);
  const [webhookStatusFilter, setWebhookStatusFilter] = useState<string>('ALL');
  const [webhookEventFilter, setWebhookEventFilter] = useState<string>('ALL');
  const [webhookSearch, setWebhookSearch] = useState('');

  const systemStatusQuery = useDeveloperSystemStatus(isAuthorized);
  const tenantInfoQuery = useDeveloperTenantInfo(isAuthorized);
  const requestLogsQuery = useDeveloperRequestLogs(isAuthorized);
  const jobQueueQuery = useDeveloperJobQueue(isAuthorized);
  const logsQuery = useDeveloperLogs(isAuthorized, autoRefreshLogs);
  const featureFlagsQuery = useDeveloperFeatureFlags(isAuthorized);
  const webhookLogsQuery = useDeveloperWebhookLogs(isAuthorized);
  const performanceQueries = useDeveloperPerformance(isAuthorized);

  useEffect(() => {
    if (tenantInfoQuery.data) {
      setTenantSettingsDraft({
        featureFlags: { ...tenantInfoQuery.data.settings.featureFlags },
        rateLimitPerHour: tenantInfoQuery.data.settings.rateLimitPerHour,
        storageLimitGb: tenantInfoQuery.data.settings.storageLimitGb,
        userLimit: tenantInfoQuery.data.settings.userLimit,
      });
    }
  }, [tenantInfoQuery.data]);

  useEffect(() => {
    const samples = systemStatusQuery.data?.redis.samples ?? [];
    if (!selectedCacheKey && samples.length > 0) {
      setSelectedCacheKey(samples[0]);
    }
  }, [selectedCacheKey, systemStatusQuery.data?.redis.samples]);

  const restartServiceMutation = useMutation({
    mutationFn: async (serviceId: string) => {
      await apiRequest('POST', `/api/developer/restart-service/${serviceId}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Restart requested' });
      void queryClient.invalidateQueries({ queryKey: ['developer', 'system-status'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to restart service.';
      toast({ title: 'Restart failed', description: message, variant: 'destructive' });
    },
  });

  const updateTenantSettingsMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      await apiRequest('PUT', '/api/developer/tenant-settings', payload);
    },
    onSuccess: () => {
      toast({ title: 'Tenant settings updated' });
      void tenantInfoQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update tenant settings.';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    },
  });

  const executeSqlMutation = useMutation({
    mutationFn: async (queryText: string) => {
      const response = await apiRequest('POST', '/api/developer/sql-query', { query: queryText });
      const json = (await response.json()) as unknown;
      const parsed = sqlResultSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return sqlResultSchema.parse(json);
    },
    onSuccess: (result, queryText) => {
      setSqlResult(result);
      const historyEntry: QueryHistoryItem = {
        id: createId(),
        query: queryText,
        executedAt: new Date().toISOString(),
        durationMs: result.durationMs,
        rowCount: result.rowCount ?? result.rows.length,
      };
      setHistory((previous) => [historyEntry, ...previous].slice(0, 20));
      toast({ title: 'Query executed successfully' });
    },
    onError: (error, queryText) => {
      const message = error instanceof Error ? error.message : 'Query failed to execute.';
      const historyEntry: QueryHistoryItem = {
        id: createId(),
        query: queryText,
        executedAt: new Date().toISOString(),
        error: message,
      };
      setHistory((previous) => [historyEntry, ...previous].slice(0, 20));
      toast({ title: 'Execution failed', description: message, variant: 'destructive' });
    },
  });

  const triggerJobMutation = useMutation({
    mutationFn: async ({ jobName, payload }: { jobName: string; payload?: Record<string, unknown> }) => {
      await apiRequest('POST', `/api/developer/trigger-job/${jobName}`, payload ?? {});
    },
    onSuccess: () => {
      toast({ title: 'Job triggered' });
      void jobQueueQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to trigger job.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const updateFeatureFlagMutation = useMutation({
    mutationFn: async (payload: { key: string; data: Partial<FeatureFlag> }) => {
      await apiRequest('PUT', `/api/developer/feature-flags/${payload.key}`, payload.data);
    },
    onSuccess: () => {
      toast({ title: 'Feature flag updated' });
      void featureFlagsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update feature flag.';
      toast({ title: 'Update failed', description: message, variant: 'destructive' });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async (scope: string) => {
      await apiRequest('POST', '/api/developer/cache/clear', { scope });
    },
    onSuccess: () => {
      toast({ title: 'Cache cleared' });
      void systemStatusQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to clear cache.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const downloadSqlResult = useCallback(
    (format: 'csv' | 'json') => {
      if (!sqlResult || typeof window === 'undefined') {
        return;
      }
      const rows = sqlResult.rows ?? [];
      if (format === 'json') {
        const blob = new Blob([JSON.stringify(rows, null, 2)], { type: 'application/json' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `query-result-${Date.now()}.json`;
        link.click();
        return;
      }

      const columns = sqlResult.columns ?? (rows.length ? Object.keys(rows[0]) : []);
      const csvLines = [columns.join(',')];
      rows.forEach((row) => {
        const line = columns
          .map((column) => {
            const value = row[column];
            if (value === null || value === undefined) {
              return '';
            }
            const stringValue = String(value).replace(/"/g, '""');
            return /,|\n|"/.test(stringValue) ? `"${stringValue}"` : stringValue;
          })
          .join(',');
        csvLines.push(line);
      });
      const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `query-result-${Date.now()}.csv`;
      link.click();
    },
    [sqlResult],
  );

  const downloadLogs = useCallback(() => {
    if (!logsQuery.data || typeof window === 'undefined') {
      return;
    }
    const blob = new Blob([JSON.stringify(logsQuery.data, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `system-logs-${Date.now()}.json`;
    link.click();
  }, [logsQuery.data]);

  const handleSaveTenantSettings = useCallback(() => {
    updateTenantSettingsMutation.mutate({
      featureFlags: tenantSettingsDraft.featureFlags,
      rateLimitPerHour: tenantSettingsDraft.rateLimitPerHour,
      storageLimitGb: tenantSettingsDraft.storageLimitGb,
      userLimit: tenantSettingsDraft.userLimit,
    });
  }, [tenantSettingsDraft, updateTenantSettingsMutation]);

  const handleResetTenant = useCallback(() => {
    updateTenantSettingsMutation.mutate({ action: 'reset-data' });
  }, [updateTenantSettingsMutation]);

  const handleDeleteTenant = useCallback(() => {
    updateTenantSettingsMutation.mutate({ action: 'delete-tenant' });
  }, [updateTenantSettingsMutation]);

  const handleAddFeatureFlag = useCallback(() => {
    if (!newFlag.key.trim() || !newFlag.name.trim()) {
      toast({ title: 'Flag details required', description: 'Provide both a key and a name.' });
      return;
    }
    updateFeatureFlagMutation.mutate({
      key: newFlag.key,
      data: { name: newFlag.name, description: newFlag.description, enabled: false },
    });
    setNewFlag({ key: '', name: '', description: '' });
    setNewFlagOpen(false);
  }, [newFlag, toast, updateFeatureFlagMutation]);

  const tenantInfo = tenantInfoQuery.data ?? DEFAULT_TENANT_INFO;

  const tenantFeatureFlags = useMemo(() => {
    const knownFlags = [
      'enable_ai_pricing',
      'enable_pixel_tracking',
      'enable_advanced_reporting',
      'enable_multi_location',
      'enable_service_module',
    ];
    const keys = new Set([...knownFlags, ...Object.keys(tenantSettingsDraft.featureFlags ?? {})]);
    return Array.from(keys).sort();
  }, [tenantSettingsDraft.featureFlags]);

  const filteredRequestLogs = useMemo(() => {
    if (!requestLogsQuery.data) {
      return [] as RequestLog[];
    }
    return requestLogsQuery.data.filter((log) => {
      if (requestStatusFilter === 'FAILED' && log.statusCode < 400) {
        return false;
      }
      if (requestStatusFilter === 'SUCCESS' && log.statusCode >= 400) {
        return false;
      }
      if (requestMethodFilter !== 'ALL' && log.method !== requestMethodFilter) {
        return false;
      }
      if (requestSearch) {
        const needle = requestSearch.toLowerCase();
        if (!log.path.toLowerCase().includes(needle) && !(log.user ?? '').toLowerCase().includes(needle)) {
          return false;
        }
      }
      return true;
    });
  }, [requestLogsQuery.data, requestMethodFilter, requestSearch, requestStatusFilter]);

  const failedRequests = useMemo(
    () => filteredRequestLogs.filter((log) => log.statusCode >= 400).slice(0, 100),
    [filteredRequestLogs],
  );

  const filteredLogs = useMemo(() => {
    if (!logsQuery.data) {
      return [] as SystemLog[];
    }
    return logsQuery.data.filter((log) => {
      if (logLevelFilter !== 'ALL' && log.level !== logLevelFilter) {
        return false;
      }
      if (logServiceFilter !== 'ALL' && log.service !== logServiceFilter) {
        return false;
      }
      if (logSearch && !log.message.toLowerCase().includes(logSearch.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [logLevelFilter, logSearch, logServiceFilter, logsQuery.data]);

  const logStats = useMemo(() => {
    if (!logsQuery.data) {
      return { errorsLastHour: 0, warningsLastHour: 0, topErrors: [] as { message: string; count: number }[] };
    }
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    let errorsLastHour = 0;
    let warningsLastHour = 0;
    const errorCount = new Map<string, number>();
    logsQuery.data.forEach((log) => {
      const timestamp = new Date(log.timestamp).getTime();
      if (log.level === 'ERROR') {
        if (timestamp >= oneHourAgo) {
          errorsLastHour += 1;
        }
        errorCount.set(log.message, (errorCount.get(log.message) ?? 0) + 1);
      }
      if (log.level === 'WARN' && timestamp >= oneHourAgo) {
        warningsLastHour += 1;
      }
    });
    const topErrors = Array.from(errorCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([message, count]) => ({ message, count }));
    return { errorsLastHour, warningsLastHour, topErrors };
  }, [logsQuery.data]);

  const performanceMetrics = useMemo(() => {
    const queryData = performanceQueries.slowQueries.data ?? {
      slowQueries: [] as SlowQueryInsight[],
      missingIndexes: [] as string[],
      optimizationHints: [] as string[],
      memory: undefined,
    };
    const endpointData = performanceQueries.endpoints.data ?? {
      endpoints: [] as EndpointMetric[],
      requestVolume: [] as z.infer<typeof requestVolumePointSchema>[],
      slowestTables: [] as z.infer<typeof slowestTableSchema>[],
    };
    return {
      slowQueries: queryData.slowQueries,
      missingIndexes: queryData.missingIndexes,
      optimizationHints: queryData.optimizationHints,
      memory: queryData.memory,
      endpoints: endpointData.endpoints,
      requestVolume: endpointData.requestVolume,
      slowestTables: endpointData.slowestTables,
    };
  }, [performanceQueries.endpoints.data, performanceQueries.slowQueries.data]);

  const requestVolumeData = useMemo(() => {
    if (performanceMetrics.requestVolume.length) {
      return performanceMetrics.requestVolume.map((point) => ({
        timestamp: new Date(point.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        count: point.count,
      }));
    }
    const buckets = new Map<string, number>();
    filteredRequestLogs.forEach((log) => {
      const key = new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      buckets.set(key, (buckets.get(key) ?? 0) + 1);
    });
    return Array.from(buckets.entries()).map(([timestamp, count]) => ({ timestamp, count }));
  }, [filteredRequestLogs, performanceMetrics.requestVolume]);

  const slowestEndpoints = useMemo(() => {
    return [...performanceMetrics.endpoints].sort((a, b) => b.p95 - a.p95).slice(0, 5);
  }, [performanceMetrics.endpoints]);

  const sqlRows = sqlResult?.rows ?? [];
  const sqlColumns = useMemo(
    () => sqlResult?.columns ?? (sqlRows.length ? Object.keys(sqlRows[0]) : []),
    [sqlResult?.columns, sqlRows],
  );
  const pageSize = 20;
  const paginatedSqlRows = useMemo(() => {
    const start = sqlPage * pageSize;
    return sqlRows.slice(start, start + pageSize);
  }, [sqlPage, sqlRows]);

  useEffect(() => {
    if (!sqlResult) {
      setSqlPage(0);
      return;
    }
    if (sqlPage * pageSize >= sqlRows.length) {
      setSqlPage(0);
    }
  }, [sqlPage, sqlResult, sqlRows.length]);

  const cacheSamples = useMemo(() => {
    const samples = systemStatusQuery.data?.redis.samples ?? [];
    if (!cacheSearch) {
      return samples;
    }
    const needle = cacheSearch.toLowerCase();
    return samples.filter((sample) => sample.key.toLowerCase().includes(needle));
  }, [cacheSearch, systemStatusQuery.data?.redis.samples]);

  const uniqueLogServices = useMemo(() => {
    const services = new Set<string>();
    logsQuery.data?.forEach((log) => services.add(log.service));
    return Array.from(services).sort();
  }, [logsQuery.data]);

  const webhookLogs = webhookLogsQuery.data?.logs ?? [];
  const integrationStatuses = webhookLogsQuery.data?.integrations ?? [];

  const filteredWebhookLogs = useMemo(() => {
    return webhookLogs
      .filter((log) => {
        if (webhookStatusFilter === 'FAILED' && log.statusCode < 400) {
          return false;
        }
        if (webhookStatusFilter === 'SUCCESS' && log.statusCode >= 400) {
          return false;
        }
        if (webhookEventFilter !== 'ALL' && log.eventType !== webhookEventFilter) {
          return false;
        }
        if (webhookSearch) {
          const needle = webhookSearch.toLowerCase();
          if (!log.url.toLowerCase().includes(needle) && !log.eventType.toLowerCase().includes(needle)) {
            return false;
          }
        }
        return true;
      })
      .slice(0, 200);
  }, [webhookEventFilter, webhookLogs, webhookSearch, webhookStatusFilter]);

  const webhookEventOptions = useMemo(() => {
    const events = new Set<string>();
    webhookLogs.forEach((log) => events.add(log.eventType));
    return Array.from(events).sort();
  }, [webhookLogs]);

  const manualJobs = [
    { jobName: 'retrain-ml-model', label: 'Retrain ML Model' },
    { jobName: 'update-lead-scores', label: 'Update Lead Scores' },
    { jobName: 'optimize-inventory', label: 'Optimize Inventory' },
    { jobName: 'generate-reports', label: 'Generate Reports' },
    { jobName: 'run-backup', label: 'Run Backup' },
  ];

  const jobWorkers = jobQueueQuery.data?.workers ?? DEFAULT_JOB_QUEUE.workers;
  const jobQueues = jobQueueQuery.data?.queues ?? DEFAULT_JOB_QUEUE.queues;
  const featureFlags = featureFlagsQuery.data ?? [];
  const memorySamples = performanceMetrics.memory?.heapSamples ?? [];
  const leakWarnings = performanceMetrics.memory?.leakWarnings ?? [];
  const gcStats = performanceMetrics.memory?.gcStats ?? {};
  const slowestTables = performanceMetrics.slowestTables;

  if (!isAuthorized) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Developer Portal</CardTitle>
          <CardDescription>Administrator access with developer permissions is required.</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertTitle>Access restricted</AlertTitle>
            <AlertDescription>
              You must be an administrator with developer privileges enabled to view these tools.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Developer Portal</h1>
          <p className="text-sm text-muted-foreground">
            Operational visibility, debugging tools, and tenant administration controls for engineering teams.
          </p>
        </div>
        <Badge
          variant={
            systemStatusQuery.data?.overallHealth === 'GREEN'
              ? 'default'
              : systemStatusQuery.data?.overallHealth === 'YELLOW'
              ? 'secondary'
              : 'destructive'
          }
          className="self-start uppercase md:self-center"
        >
          {systemStatusQuery.data?.overallHealth ?? 'UNKNOWN'}
        </Badge>
      </div>

      <Tabs defaultValue="system-status" className="space-y-4">
        <TabsList className="grid grid-cols-2 gap-2 md:grid-cols-5">
          <TabsTrigger value="system-status">System Status</TabsTrigger>
          <TabsTrigger value="tenant">Tenant Management</TabsTrigger>
          <TabsTrigger value="database">Database Console</TabsTrigger>
          <TabsTrigger value="api-debugging">API Debugging</TabsTrigger>
          <TabsTrigger value="jobs">Job Queue</TabsTrigger>
          <TabsTrigger value="logs">System Logs</TabsTrigger>
          <TabsTrigger value="feature-flags">Feature Flags</TabsTrigger>
          <TabsTrigger value="cache">Cache</TabsTrigger>
          <TabsTrigger value="integrations">Webhooks & Integrations</TabsTrigger>
          <TabsTrigger value="performance">Performance Profiler</TabsTrigger>
        </TabsList>
        <TabsContent value="system-status" className="space-y-4">
          {systemStatusQuery.isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="h-44 animate-pulse bg-muted/30" />
              ))}
            </div>
          ) : (
            <>
              <Card>
                <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Overall Health</CardTitle>
                    <CardDescription>Aggregated status across core services.</CardDescription>
                  </div>
                  <Badge
                    variant={
                      systemStatusQuery.data?.overallHealth === 'GREEN'
                        ? 'default'
                        : systemStatusQuery.data?.overallHealth === 'YELLOW'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className="uppercase"
                  >
                    {systemStatusQuery.data?.overallHealth ?? 'UNKNOWN'}
                  </Badge>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {systemStatusQuery.data?.services.map((service) => (
                    <Card key={service.id} className="border-border/80 bg-background/60">
                      <CardHeader className="space-y-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-semibold">{service.name}</CardTitle>
                          <Badge
                            variant={
                              service.status === 'UP'
                                ? 'default'
                                : service.status === 'DEGRADED'
                                ? 'secondary'
                                : 'destructive'
                            }
                            className="text-[10px] uppercase"
                          >
                            {service.status}
                          </Badge>
                        </div>
                        <CardDescription>
                          {service.lastRestart
                            ? `Restarted ${formatDistanceToNow(new Date(service.lastRestart), { addSuffix: true })}`
                            : 'No restart data'}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-1 text-xs text-muted-foreground">
                        {service.uptime ? <p>Uptime: {service.uptime}</p> : null}
                        {typeof service.memoryUsageMb === 'number' ? <p>Memory: {service.memoryUsageMb.toFixed(1)} MB</p> : null}
                        {typeof service.cpuPercent === 'number' ? <p>CPU: {service.cpuPercent.toFixed(1)}%</p> : null}
                        {typeof service.connections === 'number' ? <p>Connections: {service.connections}</p> : null}
                        {typeof service.dbSizeMb === 'number' ? <p>DB Size: {service.dbSizeMb.toFixed(1)} MB</p> : null}
                        {typeof service.queryPerformanceMs === 'number' ? (
                          <p>Query perf: {service.queryPerformanceMs.toFixed(1)} ms</p>
                        ) : null}
                        {typeof service.qps === 'number' ? <p>QPS: {service.qps.toFixed(1)}</p> : null}
                        {service.modelVersion ? <p>Model: {service.modelVersion}</p> : null}
                        {service.lastTrainingAt ? <p>Training: {new Date(service.lastTrainingAt).toLocaleString()}</p> : null}
                      </CardContent>
                      <CardFooter className="justify-end">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button size="sm" variant="outline" disabled={restartServiceMutation.isPending}>
                              Restart Service
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Restart {service.name}?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This requests a rolling restart. Existing sessions may be interrupted briefly.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel disabled={restartServiceMutation.isPending}>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                disabled={restartServiceMutation.isPending}
                                onClick={() => restartServiceMutation.mutate(service.id)}
                              >
                                Confirm
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </CardFooter>
                    </Card>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Redis Cache</CardTitle>
                  <CardDescription>Key metrics for cache sizing and performance.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Keys</p>
                    <p className="text-lg font-semibold">{systemStatusQuery.data?.redis.keys ?? 0}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Memory</p>
                    <p className="text-lg font-semibold">
                      {(systemStatusQuery.data?.redis.memoryUsageMb ?? 0).toFixed(1)} MB
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Hit Rate</p>
                    <p className="text-lg font-semibold">
                      {((systemStatusQuery.data?.redis.hitRate ?? 0) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Evictions</p>
                    <p className="text-lg font-semibold">{systemStatusQuery.data?.redis.evictions ?? 0}</p>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>
        <TabsContent value="tenant" className="space-y-4">
          {tenantInfoQuery.isLoading ? (
            <Card className="h-64 animate-pulse bg-muted/30" />
          ) : (
            <div className="grid gap-4 xl:grid-cols-[2fr,3fr]">
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Tenant Overview</CardTitle>
                    <CardDescription>Lifecycle and usage summary for the active tenant.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-muted-foreground">Tenant ID</span>
                      <span className="text-right font-medium">{tenantInfo.tenant.id}</span>
                      <span className="text-muted-foreground">Name</span>
                      <span className="text-right font-medium">{tenantInfo.tenant.name}</span>
                      <span className="text-muted-foreground">Status</span>
                      <span className="text-right font-medium">{tenantInfo.tenant.status}</span>
                      <span className="text-muted-foreground">Created</span>
                      <span className="text-right font-medium">
                        {new Date(tenantInfo.tenant.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <Separator />
                    <div className="grid grid-cols-2 gap-y-2">
                      <span className="text-muted-foreground">Storage</span>
                      <span className="text-right font-medium">
                        {(tenantInfo.storageUsageMb ?? 0).toFixed(1)} MB
                        {tenantInfo.storageLimitMb
                          ? ` / ${(tenantInfo.storageLimitMb / 1024).toFixed(1)} GB`
                          : ''}
                      </span>
                      <span className="text-muted-foreground">API Usage Today</span>
                      <span className="text-right font-medium">
                        {tenantInfo.apiUsageToday ?? 0}
                        {tenantInfo.apiLimit ? ` / ${tenantInfo.apiLimit}` : ''}
                      </span>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Record Counts</CardTitle>
                    <CardDescription>Per-table row counts for data volume monitoring.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {Object.entries(tenantInfo.recordCounts).map(([table, count]) => (
                      <div key={table} className="flex items-center justify-between">
                        <span className="text-muted-foreground">{table}</span>
                        <span className="font-medium">{count.toLocaleString()}</span>
                      </div>
                    ))}
                    {Object.keys(tenantInfo.recordCounts).length === 0 ? (
                      <p className="text-muted-foreground">No record count data available.</p>
                    ) : null}
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base font-semibold">Tenant Settings</CardTitle>
                    <CardDescription>Toggle feature access and adjust tenant-specific limits.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Feature Flags</h4>
                      <div className="space-y-2">
                        {tenantFeatureFlags.map((flag) => (
                          <div
                            key={flag}
                            className="flex items-center justify-between rounded border border-border/60 px-3 py-2"
                          >
                            <span className="text-sm font-medium">{flag}</span>
                            <ToggleSwitch
                              enabled={tenantSettingsDraft.featureFlags?.[flag] ?? false}
                              onChange={(enabled) =>
                                setTenantSettingsDraft((previous) => ({
                                  ...previous,
                                  featureFlags: {
                                    ...previous.featureFlags,
                                    [flag]: enabled,
                                  },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-1">
                        <Label htmlFor="rateLimit">Rate Limit (requests/hour)</Label>
                        <Input
                          id="rateLimit"
                          type="number"
                          inputMode="numeric"
                          value={tenantSettingsDraft.rateLimitPerHour ?? ''}
                          onChange={(event) =>
                            setTenantSettingsDraft((previous) => ({
                              ...previous,
                              rateLimitPerHour: event.target.value ? Number(event.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="storageLimit">Storage Limit (GB)</Label>
                        <Input
                          id="storageLimit"
                          type="number"
                          inputMode="decimal"
                          value={tenantSettingsDraft.storageLimitGb ?? ''}
                          onChange={(event) =>
                            setTenantSettingsDraft((previous) => ({
                              ...previous,
                              storageLimitGb: event.target.value ? Number(event.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-1">
                        <Label htmlFor="userLimit">User Limit</Label>
                        <Input
                          id="userLimit"
                          type="number"
                          inputMode="numeric"
                          value={tenantSettingsDraft.userLimit ?? ''}
                          onChange={(event) =>
                            setTenantSettingsDraft((previous) => ({
                              ...previous,
                              userLimit: event.target.value ? Number(event.target.value) : undefined,
                            }))
                          }
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => tenantInfoQuery.refetch()}
                        disabled={updateTenantSettingsMutation.isPending}
                      >
                        Reset
                      </Button>
                      <Button
                        type="button"
                        onClick={handleSaveTenantSettings}
                        disabled={updateTenantSettingsMutation.isPending}
                      >
                        Save Changes
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-destructive/40">
                  <CardHeader>
                    <CardTitle className="text-base font-semibold text-destructive">Danger Zone</CardTitle>
                    <CardDescription>Irreversible operations. All actions are audited.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full border-amber-500 text-amber-600 hover:bg-amber-500/10"
                          disabled={updateTenantSettingsMutation.isPending}
                        >
                          Reset Tenant Data
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Reset tenant data?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Transactional data will be purged while configuration is retained. This cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={updateTenantSettingsMutation.isPending}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            disabled={updateTenantSettingsMutation.isPending}
                            onClick={handleResetTenant}
                          >
                            Confirm Reset
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          className="w-full"
                          disabled={updateTenantSettingsMutation.isPending}
                        >
                          Delete Tenant
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete tenant permanently?</AlertDialogTitle>
                          <AlertDialogDescription>
                            All tenant data and configuration will be permanently removed. This action cannot be reversed.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel disabled={updateTenantSettingsMutation.isPending}>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={updateTenantSettingsMutation.isPending}
                            onClick={handleDeleteTenant}
                          >
                            Permanently Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </TabsContent>
        <TabsContent value="database" className="space-y-4">
          <Alert>
            <AlertTitle>Direct database access</AlertTitle>
            <AlertDescription>
              Queries execute against live infrastructure. Validate statements and limit scope before running.
            </AlertDescription>
          </Alert>

          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">SQL Editor</CardTitle>
                <CardDescription>Ad-hoc query execution with export and history tracking.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea value={sql} onChange={(event) => setSql(event.target.value)} rows={10} />
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => executeSqlMutation.mutate(sql)}
                      disabled={executeSqlMutation.isPending || !sql.trim()}
                    >
                      {executeSqlMutation.isPending ? 'Executing…' : 'Run Query'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setSavedQueries((previous) => [
                          { id: createId(), name: `Query ${previous.length + 1}`, query: sql },
                          ...previous,
                        ]);
                        toast({ title: 'Query saved locally' });
                      }}
                    >
                      Save Query
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => downloadSqlResult('csv')} disabled={!sqlResult}>
                      Export CSV
                    </Button>
                    <Button type="button" variant="outline" onClick={() => downloadSqlResult('json')} disabled={!sqlResult}>
                      Export JSON
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Select
                    value={selectedSavedQuery ?? ''}
                    onValueChange={(value) => {
                      setSelectedSavedQuery(value);
                      const saved = savedQueries.find((entry) => entry.id === value);
                      if (saved) {
                        setSql(saved.query);
                      }
                    }}
                  >
                    <SelectTrigger className="w-60">
                      <SelectValue placeholder="Saved queries" />
                    </SelectTrigger>
                    <SelectContent>
                      {savedQueries.length === 0 ? <SelectItem value="">No saved queries</SelectItem> : null}
                      {savedQueries.map((entry) => (
                        <SelectItem key={entry.id} value={entry.id}>
                          {entry.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedSavedQuery ? (
                    <Button
                      type="button"
                      size="icon"
                      variant="ghost"
                      onClick={() => {
                        setSavedQueries((previous) => previous.filter((entry) => entry.id !== selectedSavedQuery));
                        setSelectedSavedQuery(undefined);
                      }}
                    >
                      ✕
                    </Button>
                  ) : null}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold">Results</h4>
                    {sqlResult?.rowCount !== undefined ? (
                      <span className="text-xs text-muted-foreground">{sqlResult.rowCount} rows</span>
                    ) : null}
                  </div>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {sqlColumns.map((column) => (
                            <TableHead key={column}>{column}</TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedSqlRows.map((row, index) => (
                          <TableRow key={`${index}-${row.id ?? index}`}>
                            {sqlColumns.map((column) => (
                              <TableCell key={column} className="max-w-[240px] truncate">
                                {String(row[column] ?? '')}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                        {paginatedSqlRows.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={sqlColumns.length || 1} className="text-center text-muted-foreground">
                              {sqlResult ? 'Query returned no rows.' : 'Execute a query to view results.'}
                            </TableCell>
                          </TableRow>
                        ) : null}
                      </TableBody>
                    </Table>
                  </div>
                  {sqlRows.length > pageSize ? (
                    <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSqlPage((previous) => Math.max(0, previous - 1))}
                        disabled={sqlPage === 0}
                      >
                        Previous
                      </Button>
                      <span>
                        Page {sqlPage + 1} of {Math.ceil(sqlRows.length / pageSize)}
                      </span>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setSqlPage((previous) => previous + 1)}
                        disabled={(sqlPage + 1) * pageSize >= sqlRows.length}
                      >
                        Next
                      </Button>
                    </div>
                  ) : null}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Execution History</CardTitle>
                <CardDescription>Last 20 queries executed from this browser.</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[420px] pr-3">
                  <div className="space-y-3 text-xs">
                    {history.map((entry) => (
                      <div key={entry.id} className="space-y-2 rounded border border-border/60 p-3">
                        <div className="flex items-center justify-between text-[11px] uppercase text-muted-foreground">
                          <span>{new Date(entry.executedAt).toLocaleString()}</span>
                          {entry.error ? (
                            <Badge variant="destructive" className="text-[10px]">
                              Failed
                            </Badge>
                          ) : (
                            <Badge variant="default" className="text-[10px]">
                              Success
                            </Badge>
                          )}
                        </div>
                        <pre className="max-h-24 overflow-auto whitespace-pre-wrap text-foreground">{entry.query}</pre>
                        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                          <span>
                            Rows: {entry.rowCount ?? '—'} | Duration:{' '}
                            {entry.durationMs !== undefined ? `${entry.durationMs.toFixed(1)} ms` : '—'}
                          </span>
                          {entry.error ? <span className="text-destructive">{entry.error}</span> : null}
                        </div>
                      </div>
                    ))}
                    {history.length === 0 ? (
                      <p className="text-muted-foreground">Run a query to populate execution history.</p>
                    ) : null}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="api-debugging" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Live Request Logger</CardTitle>
              <CardDescription>Inspect inbound API traffic with filtering and search.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Select value={requestStatusFilter} onValueChange={(value) => setRequestStatusFilter(value as typeof requestStatusFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="SUCCESS">Success only</SelectItem>
                    <SelectItem value="FAILED">Failed only</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={requestMethodFilter} onValueChange={setRequestMethodFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All methods</SelectItem>
                    {['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].map((method) => (
                      <SelectItem key={method} value={method}>
                        {method}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search by path or user"
                  value={requestSearch}
                  onChange={(event) => setRequestSearch(event.target.value)}
                  className="md:col-span-2"
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Method</TableHead>
                      <TableHead>Path</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequestLogs.map((log) => (
                      <TableRow key={log.id} className={log.statusCode >= 400 ? 'bg-destructive/5' : undefined}>
                        <TableCell>{new Date(log.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>{log.method}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{log.path}</TableCell>
                        <TableCell>{log.statusCode}</TableCell>
                        <TableCell>{log.durationMs.toFixed(1)} ms</TableCell>
                        <TableCell>{log.user ?? '—'}</TableCell>
                      </TableRow>
                    ))}
                    {filteredRequestLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground">
                          No requests match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 lg:grid-cols-[2fr,1fr]">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Failed Requests (last 100)</CardTitle>
                <CardDescription>Retry failed calls and inspect diagnostic context.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {failedRequests.map((log) => (
                  <div key={log.id} className="space-y-2 rounded border border-destructive/40 bg-destructive/5 p-3">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <Badge variant="destructive">{log.statusCode}</Badge>
                    </div>
                    <div className="text-sm font-medium">
                      {log.method} {log.path}
                    </div>
                    <p className="text-xs text-muted-foreground">User: {log.user ?? 'Unknown'}</p>
                    {log.error ? <p className="text-xs text-destructive">{log.error}</p> : null}
                    {log.stack ? (
                      <pre className="max-h-40 overflow-auto whitespace-pre-wrap rounded bg-muted/40 p-2 text-[11px]">
                        {log.stack}
                      </pre>
                    ) : null}
                    <div className="flex justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          triggerJobMutation.mutate({ jobName: 'retry-api-request', payload: { requestId: log.id } })
                        }
                        disabled={triggerJobMutation.isPending}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                ))}
                {failedRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No failed requests in the selected window.</p>
                ) : null}
              </CardContent>
            </Card>

            <div className="grid gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Request Volume</CardTitle>
                  <CardDescription>Requests grouped by minute for the selected time window.</CardDescription>
                </CardHeader>
                <CardContent className="h-48">
                  {requestVolumeData.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No request data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={requestVolumeData}>
                        <XAxis dataKey="timestamp" hide={requestVolumeData.length > 12} />
                        <YAxis allowDecimals={false} width={40} />
                        <Tooltip formatter={(value: number) => [`${value} requests`, 'Volume']} />
                        <Line type="monotone" dataKey="count" stroke="#2563eb" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">Slowest Endpoints</CardTitle>
                  <CardDescription>Ranked by 95th percentile latency.</CardDescription>
                </CardHeader>
                <CardContent className="h-48">
                  {slowestEndpoints.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No latency data available.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={slowestEndpoints} layout="vertical" margin={{ left: 80 }}>
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="endpoint" width={200} />
                        <Tooltip formatter={(value: number) => [`${value.toFixed(1)} ms`, 'P95']} />
                        <Bar dataKey="p95" fill="#7c3aed" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Error Rate by Endpoint</CardTitle>
              <CardDescription>Track reliability across API surface area.</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Endpoint</TableHead>
                    <TableHead>P50</TableHead>
                    <TableHead>P95</TableHead>
                    <TableHead>P99</TableHead>
                    <TableHead>Error Rate</TableHead>
                    <TableHead>Volume</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {performanceMetrics.endpoints.map((metric) => (
                    <TableRow key={metric.endpoint}>
                      <TableCell className="max-w-[320px] truncate">{metric.endpoint}</TableCell>
                      <TableCell>{metric.p50.toFixed(1)} ms</TableCell>
                      <TableCell>{metric.p95.toFixed(1)} ms</TableCell>
                      <TableCell>{metric.p99.toFixed(1)} ms</TableCell>
                      <TableCell>{(metric.errorRate * 100).toFixed(2)}%</TableCell>
                      <TableCell>{metric.volume ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                  {performanceMetrics.endpoints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground">
                        No endpoint performance data available.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Worker Status</CardTitle>
              <CardDescription>Real-time insight into queue throughput.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Active Workers</p>
                <p className="text-lg font-semibold">{jobWorkers.active}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Processing</p>
                <p className="text-lg font-semibold">{jobWorkers.processing}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Queued</p>
                <p className="text-lg font-semibold">{jobWorkers.queued}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Failures (1h)</p>
                <p className="text-lg font-semibold">{jobWorkers.failedLastHour}</p>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Pending Jobs</CardTitle>
                <CardDescription>Jobs awaiting worker assignment.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Enqueued</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobQueues.pending.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.name}</TableCell>
                        <TableCell>{job.enqueuedAt ? new Date(job.enqueuedAt).toLocaleString() : '—'}</TableCell>
                        <TableCell>{job.priority ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerJobMutation.mutate({ jobName: 'cancel-job', payload: { jobId: job.id } })}
                            disabled={triggerJobMutation.isPending}
                          >
                            Cancel
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {jobQueues.pending.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No pending jobs.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Processing Jobs</CardTitle>
                <CardDescription>Jobs currently in-flight.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Started</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Worker</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobQueues.processing.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.name}</TableCell>
                        <TableCell>{job.startedAt ? new Date(job.startedAt).toLocaleString() : '—'}</TableCell>
                        <TableCell>{job.progress !== undefined ? `${job.progress.toFixed(0)}%` : '—'}</TableCell>
                        <TableCell>{job.workerId ?? '—'}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerJobMutation.mutate({ jobName: 'prioritize-job', payload: { jobId: job.id } })}
                            disabled={triggerJobMutation.isPending}
                          >
                            Boost
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {jobQueues.processing.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No jobs processing.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Completed Jobs</CardTitle>
                <CardDescription>Recent completions with duration metrics.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Completed</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobQueues.completed.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.name}</TableCell>
                        <TableCell>{job.durationMs ? `${job.durationMs.toFixed(0)} ms` : '—'}</TableCell>
                        <TableCell>{job.completedAt ? new Date(job.completedAt).toLocaleString() : '—'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerJobMutation.mutate({ jobName: 'retry-job', payload: { jobId: job.id } })}
                            disabled={triggerJobMutation.isPending}
                          >
                            Retry
                          </Button>
                          <Button size="sm" variant="ghost">
                            View Result
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {jobQueues.completed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No completed jobs yet.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Failed Jobs</CardTitle>
                <CardDescription>Inspect failures and trigger manual retries.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Job</TableHead>
                      <TableHead>Error</TableHead>
                      <TableHead>Failed At</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {jobQueues.failed.map((job) => (
                      <TableRow key={job.id}>
                        <TableCell>{job.name}</TableCell>
                        <TableCell className="max-w-[260px] truncate">{job.error ?? 'Unknown error'}</TableCell>
                        <TableCell>{job.failedAt ? new Date(job.failedAt).toLocaleString() : '—'}</TableCell>
                        <TableCell>{job.retryCount ?? 0}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => triggerJobMutation.mutate({ jobName: 'retry-job', payload: { jobId: job.id } })}
                            disabled={triggerJobMutation.isPending}
                          >
                            Retry
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => triggerJobMutation.mutate({ jobName: 'purge-job', payload: { jobId: job.id } })}
                            disabled={triggerJobMutation.isPending}
                          >
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {jobQueues.failed.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No failed jobs. Great work!
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Manual Triggers</CardTitle>
              <CardDescription>Execute high-impact workflows on demand.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 md:grid-cols-3">
              {manualJobs.map((job) => (
                <Button
                  key={job.jobName}
                  variant="outline"
                  className="justify-between"
                  onClick={() => triggerJobMutation.mutate({ jobName: job.jobName })}
                  disabled={triggerJobMutation.isPending}
                >
                  <span>{job.label}</span>
                  <span className="text-xs text-muted-foreground">Trigger</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">System Logs</CardTitle>
              <CardDescription>Streaming service logs with filtering and export.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Select value={logLevelFilter} onValueChange={(value) => setLogLevelFilter(value as typeof logLevelFilter)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All levels</SelectItem>
                    <SelectItem value="DEBUG">Debug</SelectItem>
                    <SelectItem value="INFO">Info</SelectItem>
                    <SelectItem value="WARN">Warn</SelectItem>
                    <SelectItem value="ERROR">Error</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={logServiceFilter} onValueChange={setLogServiceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All services</SelectItem>
                    {uniqueLogServices.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search message"
                  value={logSearch}
                  onChange={(event) => setLogSearch(event.target.value)}
                  className="md:col-span-2"
                />
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Auto-refresh</span>
                  <ToggleSwitch enabled={autoRefreshLogs} onChange={setAutoRefreshLogs} />
                </div>
                <Button variant="outline" onClick={downloadLogs} disabled={!logsQuery.data?.length}>
                  Download Logs
                </Button>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredLogs.map((log) => (
                      <TableRow key={log.id} className={log.level === 'ERROR' ? 'bg-destructive/5' : undefined}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.level}</TableCell>
                        <TableCell>{log.service}</TableCell>
                        <TableCell className="max-w-[480px] truncate">{log.message}</TableCell>
                      </TableRow>
                    ))}
                    {filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center text-muted-foreground">
                          No log entries match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Log Insights</CardTitle>
              <CardDescription>Key metrics derived from the latest log stream.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              <div>
                <p className="text-muted-foreground">Errors (last hour)</p>
                <p className="text-lg font-semibold">{logStats.errorsLastHour}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Warnings (last hour)</p>
                <p className="text-lg font-semibold">{logStats.warningsLastHour}</p>
              </div>
              <div className="md:col-span-3">
                <p className="text-muted-foreground">Top error messages</p>
                {logStats.topErrors.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recurring errors detected.</p>
                ) : (
                  <ul className="mt-2 space-y-1 text-sm">
                    {logStats.topErrors.map((entry) => (
                      <li key={entry.message} className="flex justify-between">
                        <span className="max-w-[480px] truncate">{entry.message}</span>
                        <span className="text-muted-foreground">×{entry.count}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="feature-flags" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-semibold">Feature Flags</h3>
              <p className="text-sm text-muted-foreground">
                Manage global feature rollout and tenant-specific overrides.
              </p>
            </div>
            <Dialog open={newFlagOpen} onOpenChange={setNewFlagOpen}>
              <DialogTrigger asChild>
                <Button>Add Feature Flag</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create feature flag</DialogTitle>
                  <DialogDescription>Define a new globally available feature toggle.</DialogDescription>
                </DialogHeader>
                <div className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="flagKey">Key</Label>
                    <Input
                      id="flagKey"
                      placeholder="enable_new_feature"
                      value={newFlag.key}
                      onChange={(event) => setNewFlag((previous) => ({ ...previous, key: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="flagName">Name</Label>
                    <Input
                      id="flagName"
                      placeholder="New Feature"
                      value={newFlag.name}
                      onChange={(event) => setNewFlag((previous) => ({ ...previous, name: event.target.value }))}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="flagDescription">Description</Label>
                    <Textarea
                      id="flagDescription"
                      rows={3}
                      value={newFlag.description}
                      onChange={(event) => setNewFlag((previous) => ({ ...previous, description: event.target.value }))}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setNewFlagOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFeatureFlag} disabled={updateFeatureFlagMutation.isPending}>
                    Create
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="overflow-x-auto p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="px-6">Feature</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Global</TableHead>
                    <TableHead>Rollout %</TableHead>
                    <TableHead>Overrides</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {featureFlags.map((flag) => (
                    <TableRow key={flag.key}>
                      <TableCell className="px-6">
                        <div className="font-medium text-foreground">{flag.name ?? flag.key}</div>
                        <div className="text-xs text-muted-foreground">{flag.key}</div>
                      </TableCell>
                      <TableCell className="max-w-[320px] truncate text-sm text-muted-foreground">
                        {flag.description ?? '—'}
                      </TableCell>
                      <TableCell>
                        <ToggleSwitch
                          enabled={flag.enabled ?? false}
                          onChange={(enabled) => updateFeatureFlagMutation.mutate({ key: flag.key, data: { enabled } })}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          inputMode="decimal"
                          className="w-24"
                          defaultValue={flag.rolloutPercentage ?? 0}
                          onBlur={(event) =>
                            updateFeatureFlagMutation.mutate({
                              key: flag.key,
                              data: { rolloutPercentage: Number(event.target.value) },
                            })
                          }
                        />
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {flag.overrides ? `${Object.keys(flag.overrides).length} tenants` : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                  {featureFlags.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-6 text-center text-muted-foreground">
                        No feature flags configured.
                      </TableCell>
                    </TableRow>
                  ) : null}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="cache" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Cache Management</CardTitle>
              <CardDescription>Monitor cache health and selectively purge data.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-4 text-sm">
              <div>
                <p className="text-muted-foreground">Keys</p>
                <p className="text-lg font-semibold">{systemStatusQuery.data?.redis.keys ?? 0}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Memory</p>
                <p className="text-lg font-semibold">
                  {(systemStatusQuery.data?.redis.memoryUsageMb ?? 0).toFixed(1)} MB
                </p>
              </div>
              <div>
                <p className="text-muted-foreground">Hit Rate</p>
                <p className="text-lg font-semibold">{((systemStatusQuery.data?.redis.hitRate ?? 0) * 100).toFixed(1)}%</p>
              </div>
              <div>
                <p className="text-muted-foreground">Evictions</p>
                <p className="text-lg font-semibold">{systemStatusQuery.data?.redis.evictions ?? 0}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={clearCacheMutation.isPending}>
                  Clear All Cache
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all cache?</AlertDialogTitle>
                  <AlertDialogDescription>
                    All cached content, including sessions and ML models, will be removed immediately.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={clearCacheMutation.isPending}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    disabled={clearCacheMutation.isPending}
                    onClick={() => clearCacheMutation.mutate('all')}
                  >
                    Clear Everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
            <Button
              variant="outline"
              onClick={() => clearCacheMutation.mutate('sessions')}
              disabled={clearCacheMutation.isPending}
            >
              Clear Sessions
            </Button>
            <Button
              variant="outline"
              onClick={() => clearCacheMutation.mutate('queries')}
              disabled={clearCacheMutation.isPending}
            >
              Clear Query Cache
            </Button>
            <Button
              variant="outline"
              onClick={() => clearCacheMutation.mutate('ml')}
              disabled={clearCacheMutation.isPending}
            >
              Clear ML Cache
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Key Browser</CardTitle>
              <CardDescription>Search cached keys and inspect stored values.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[2fr,3fr]">
              <div className="space-y-3">
                <Input
                  placeholder="Search keys"
                  value={cacheSearch}
                  onChange={(event) => setCacheSearch(event.target.value)}
                />
                <ScrollArea className="h-64 rounded border border-border/60">
                  <div className="divide-y divide-border text-sm">
                    {cacheSamples.map((sample) => (
                      <button
                        key={sample.key}
                        type="button"
                        onClick={() => setSelectedCacheKey(sample)}
                        className={`w-full truncate px-3 py-2 text-left hover:bg-muted ${
                          selectedCacheKey?.key === sample.key ? 'bg-muted' : ''
                        }`}
                      >
                        {sample.key}
                      </button>
                    ))}
                    {cacheSamples.length === 0 ? (
                      <p className="px-3 py-4 text-sm text-muted-foreground">No cache keys available.</p>
                    ) : null}
                  </div>
                </ScrollArea>
              </div>

              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Selected Key</p>
                  <p className="text-lg font-semibold">{selectedCacheKey?.key ?? 'None'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">TTL</p>
                  <p className="font-medium">{selectedCacheKey?.ttlSeconds ?? '—'} seconds</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Value</p>
                  <pre className="max-h-64 overflow-auto rounded border border-border/60 bg-muted/50 p-3 text-xs">
                    {selectedCacheKey?.valuePreview ?? 'No preview available.'}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Webhook Deliveries</CardTitle>
              <CardDescription>Track outbound webhook attempts and diagnose failures.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 md:grid-cols-4">
                <Select value={webhookStatusFilter} onValueChange={setWebhookStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All statuses</SelectItem>
                    <SelectItem value="SUCCESS">Delivered</SelectItem>
                    <SelectItem value="FAILED">Failed</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={webhookEventFilter} onValueChange={setWebhookEventFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ALL">All events</SelectItem>
                    {webhookEventOptions.map((event) => (
                      <SelectItem key={event} value={event}>
                        {event}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  placeholder="Search by URL or event"
                  value={webhookSearch}
                  onChange={(event) => setWebhookSearch(event.target.value)}
                  className="md:col-span-2"
                />
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Event</TableHead>
                      <TableHead>URL</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Retries</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredWebhookLogs.map((log) => (
                      <TableRow key={log.id} className={log.statusCode >= 400 ? 'bg-destructive/5' : undefined}>
                        <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                        <TableCell>{log.eventType}</TableCell>
                        <TableCell className="max-w-[320px] truncate">{log.url}</TableCell>
                        <TableCell>{log.statusCode}</TableCell>
                        <TableCell>{log.responseTimeMs} ms</TableCell>
                        <TableCell>{log.retryCount ?? 0}</TableCell>
                        <TableCell className="text-right">
                          {log.statusCode >= 400 ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                triggerJobMutation.mutate({ jobName: 'retry-webhook', payload: { deliveryId: log.id } })
                              }
                              disabled={triggerJobMutation.isPending}
                            >
                              Retry
                            </Button>
                          ) : (
                            <span className="text-xs text-muted-foreground">Delivered</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredWebhookLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground">
                          No webhook deliveries match the current filters.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Integration Health</CardTitle>
              <CardDescription>Monitor external system syncs and trigger manual operations.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {integrationStatuses.map((integration) => (
                <Card key={integration.id} className="border-border/70 bg-background/60">
                  <CardHeader className="space-y-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-semibold">{integration.name}</CardTitle>
                      <Badge
                        variant={
                          integration.status === 'HEALTHY'
                            ? 'default'
                            : integration.status === 'WARNING'
                            ? 'secondary'
                            : 'destructive'
                        }
                        className="uppercase"
                      >
                        {integration.status}
                      </Badge>
                    </div>
                    <CardDescription>
                      Last sync {integration.lastSyncAt ? new Date(integration.lastSyncAt).toLocaleString() : 'never'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm text-muted-foreground">
                    <p>Error count: {integration.errorCount ?? 0}</p>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        triggerJobMutation.mutate({ jobName: 'force-integration-sync', payload: { integrationId: integration.id } })
                      }
                      disabled={triggerJobMutation.isPending}
                    >
                      Force Sync
                    </Button>
                    <Button size="sm" variant="ghost">
                      View Logs
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              {integrationStatuses.length === 0 ? (
                <p className="text-sm text-muted-foreground">No integrations configured.</p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Slow Queries</CardTitle>
                <CardDescription>Top database queries by execution time.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {performanceQueries.slowQueries.isLoading ? (
                  <p className="text-muted-foreground">Loading slow query data…</p>
                ) : performanceMetrics.slowQueries.length === 0 ? (
                  <p className="text-muted-foreground">No slow queries reported.</p>
                ) : (
                  performanceMetrics.slowQueries.map((query, index) => (
                    <div key={`${query.query}-${index}`} className="rounded border border-border/60 bg-background/60 p-3">
                      <p className="font-medium text-foreground">{query.query}</p>
                      <p>Duration: {query.durationMs.toFixed(1)} ms</p>
                      <p>Occurrences: {query.frequency ?? 1}</p>
                      {query.missingIndexes?.length ? (
                        <p className="text-xs text-muted-foreground">
                          Missing indexes: {query.missingIndexes.join(', ')}
                        </p>
                      ) : null}
                      {query.hint ? <p className="text-xs text-muted-foreground">Hint: {query.hint}</p> : null}
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Optimization Insights</CardTitle>
                <CardDescription>Recommendations based on recent query analysis.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <p className="font-medium">Missing Indexes</p>
                  {performanceMetrics.missingIndexes.length === 0 ? (
                    <p className="text-muted-foreground">No missing indexes detected.</p>
                  ) : (
                    <ul className="list-inside list-disc text-muted-foreground">
                      {performanceMetrics.missingIndexes.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <p className="font-medium">Optimization Hints</p>
                  {performanceMetrics.optimizationHints.length === 0 ? (
                    <p className="text-muted-foreground">No additional tuning hints available.</p>
                  ) : (
                    <ul className="list-inside list-disc text-muted-foreground">
                      {performanceMetrics.optimizationHints.map((hint, index) => (
                        <li key={`${hint}-${index}`}>{hint}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">API Response Times</CardTitle>
                <CardDescription>Aggregate latency percentiles across endpoints.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Endpoint</TableHead>
                      <TableHead>P50</TableHead>
                      <TableHead>P95</TableHead>
                      <TableHead>P99</TableHead>
                      <TableHead>Error Rate</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {performanceMetrics.endpoints.map((metric) => (
                      <TableRow key={metric.endpoint}>
                        <TableCell className="max-w-[320px] truncate">{metric.endpoint}</TableCell>
                        <TableCell>{metric.p50.toFixed(1)} ms</TableCell>
                        <TableCell>{metric.p95.toFixed(1)} ms</TableCell>
                        <TableCell>{metric.p99.toFixed(1)} ms</TableCell>
                        <TableCell>{(metric.errorRate * 100).toFixed(2)}%</TableCell>
                      </TableRow>
                    ))}
                    {performanceMetrics.endpoints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No endpoint metrics available.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Slowest Tables</CardTitle>
                <CardDescription>Average query time per table.</CardDescription>
              </CardHeader>
              <CardContent className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Table</TableHead>
                      <TableHead>Average Time</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {slowestTables.map((table) => (
                      <TableRow key={table.name}>
                        <TableCell>{table.name}</TableCell>
                        <TableCell>{table.avgMs.toFixed(1)} ms</TableCell>
                      </TableRow>
                    ))}
                    {slowestTables.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={2} className="text-center text-muted-foreground">
                          No slow table data available.
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Memory Profiler</CardTitle>
              <CardDescription>Heap utilization trends and GC statistics.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 lg:grid-cols-[3fr,2fr]">
              <div className="h-56">
                {memorySamples.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No memory samples recorded.</p>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={memorySamples.map((sample) => ({
                        timestamp: new Date(sample.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                        heap: sample.heapMb,
                      }))}
                    >
                      <XAxis dataKey="timestamp" hide={memorySamples.length > 12} />
                      <YAxis width={50} />
                      <Tooltip formatter={(value: number) => [`${value.toFixed(1)} MB`, 'Heap']} />
                      <Line type="monotone" dataKey="heap" stroke="#10b981" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Garbage Collection</p>
                  <p>Minor GC: {gcStats?.minorGcCount ?? 0}</p>
                  <p>Major GC: {gcStats?.majorGcCount ?? 0}</p>
                  <p>Avg Pause: {gcStats?.avgPauseMs ? `${gcStats.avgPauseMs.toFixed(2)} ms` : '—'}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Leak Detection</p>
                  {leakWarnings.length === 0 ? (
                    <p className="text-muted-foreground">No leak patterns detected.</p>
                  ) : (
                    <ul className="list-inside list-disc text-muted-foreground">
                      {leakWarnings.map((warning, index) => (
                        <li key={`${warning}-${index}`}>{warning}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default DeveloperSettings;
