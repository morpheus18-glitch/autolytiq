import { useState } from 'react';
import { useMutation, useQueries, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const systemStatusSchema = z.object({
  services: z.array(
    z.object({
      name: z.string(),
      status: z.enum(['UP', 'DEGRADED', 'DOWN']).default('UP'),
      uptime: z.string().optional(),
      lastRestart: z.string().optional(),
      memoryUsage: z.number().optional(),
      cpu: z.number().optional(),
    }),
  ),
  overallStatus: z.enum(['GREEN', 'YELLOW', 'RED']).default('GREEN'),
});

const tenantInfoSchema = z.object({
  tenantId: z.string(),
  name: z.string(),
  createdAt: z.string(),
  status: z.string(),
  recordCounts: z.record(z.number()),
  storageUsageMb: z.number(),
  storageLimitMb: z.number().optional(),
  apiUsageToday: z.number().optional(),
  apiLimit: z.number().optional(),
});

const requestLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  method: z.string(),
  path: z.string(),
  statusCode: z.number(),
  durationMs: z.number(),
  user: z.string().optional(),
});

const jobQueueSchema = z.object({
  pending: z.array(z.object({ id: z.string(), name: z.string(), enqueuedAt: z.string(), priority: z.string().optional() })),
  processing: z.array(z.object({ id: z.string(), name: z.string(), startedAt: z.string(), progress: z.number().optional() })),
  completed: z.array(z.object({ id: z.string(), name: z.string(), durationMs: z.number(), completedAt: z.string() })),
  failed: z.array(z.object({ id: z.string(), name: z.string(), error: z.string(), failedAt: z.string(), retryCount: z.number() })),
});

const systemLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  level: z.string(),
  service: z.string(),
  message: z.string(),
});

const featureFlagSchema = z.object({
  key: z.string(),
  name: z.string(),
  description: z.string().optional(),
  enabled: z.boolean(),
});

const webhookLogSchema = z.object({
  id: z.string(),
  timestamp: z.string(),
  eventType: z.string(),
  url: z.string(),
  statusCode: z.number(),
  responseTimeMs: z.number(),
  retryCount: z.number(),
});

const slowQuerySchema = z.object({
  query: z.string(),
  durationMs: z.number(),
  frequency: z.number(),
});

const endpointPerformanceSchema = z.object({
  endpoint: z.string(),
  p50: z.number(),
  p95: z.number(),
  p99: z.number(),
  errorRate: z.number(),
});

export function DeveloperSettings(): JSX.Element {
  const { toast } = useToast();
  const [sql, setSql] = useState('SELECT NOW();');
  const [sqlResult, setSqlResult] = useState<unknown>(null);

  const systemStatusQuery = useQuery({
    queryKey: ['developer', 'system-status'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/developer/system-status');
      const json = (await response.json()) as unknown;
      const parsed = systemStatusSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return systemStatusSchema.parse({ services: [], overallStatus: 'GREEN' });
    },
  });

  const tenantInfoQuery = useQuery({
    queryKey: ['developer', 'tenant-info'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/developer/tenant-info');
      const json = (await response.json()) as unknown;
      const parsed = tenantInfoSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return tenantInfoSchema.parse({
        tenantId: 'unknown',
        name: 'Unknown Tenant',
        createdAt: new Date().toISOString(),
        status: 'ACTIVE',
        recordCounts: {},
        storageUsageMb: 0,
      });
    },
  });

  const requestLogsQuery = useQuery({
    queryKey: ['developer', 'request-logs'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/developer/request-logs');
      const json = (await response.json()) as unknown;
      const parsed = z.array(requestLogSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [] as z.infer<typeof requestLogSchema>[];
    },
  });

  const jobQueueQuery = useQuery({
    queryKey: ['developer', 'job-queue'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/developer/job-queue');
      const json = (await response.json()) as unknown;
      const parsed = jobQueueSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return jobQueueSchema.parse({ pending: [], processing: [], completed: [], failed: [] });
    },
  });

  const logsQuery = useQuery({
    queryKey: ['developer', 'system-logs'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/developer/logs');
      const json = (await response.json()) as unknown;
      const parsed = z.array(systemLogSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [] as z.infer<typeof systemLogSchema>[];
    },
  });

  const featureFlagsQuery = useQuery({
    queryKey: ['developer', 'feature-flags'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/developer/feature-flags');
      const json = (await response.json()) as unknown;
      const parsed = z.array(featureFlagSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [] as z.infer<typeof featureFlagSchema>[];
    },
  });

  const webhookLogsQuery = useQuery({
    queryKey: ['developer', 'webhook-logs'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/developer/webhooks/logs');
      const json = (await response.json()) as unknown;
      const parsed = z.array(webhookLogSchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [] as z.infer<typeof webhookLogSchema>[];
    },
  });

  const [slowQueriesQuery, endpointPerformanceQuery] = useQueries({
    queries: [
      {
        queryKey: ['developer', 'performance', 'queries'],
        queryFn: async () => {
          const response = await apiRequest('/api/settings/developer/performance/queries');
          const json = (await response.json()) as unknown;
          const parsed = z.array(slowQuerySchema).safeParse(json);
          if (parsed.success) {
            return parsed.data;
          }
          return [] as z.infer<typeof slowQuerySchema>[];
        },
      },
      {
        queryKey: ['developer', 'performance', 'endpoints'],
        queryFn: async () => {
          const response = await apiRequest('/api/settings/developer/performance/endpoints');
          const json = (await response.json()) as unknown;
          const parsed = z.array(endpointPerformanceSchema).safeParse(json);
          if (parsed.success) {
            return parsed.data;
          }
          return [] as z.infer<typeof endpointPerformanceSchema>[];
        },
      },
    ],
  });

  const executeSqlMutation = useMutation({
    mutationFn: async (queryText: string) => {
      const response = await apiRequest('POST', '/api/settings/developer/sql-query', { query: queryText });
      return response.json();
    },
    onSuccess: (result) => {
      setSqlResult(result);
      toast({ title: 'Query executed' });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Query failed.';
      toast({ title: 'Execution failed', description: message, variant: 'destructive' });
    },
  });

  const triggerJobMutation = useMutation({
    mutationFn: async (jobName: string) => {
      await apiRequest('POST', `/api/settings/developer/trigger-job/${jobName}`, {});
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
    mutationFn: async ({ key, enabled }: { key: string; enabled: boolean }) => {
      await apiRequest('PUT', `/api/settings/developer/feature-flags/${key}`, { enabled });
    },
    onSuccess: () => {
      toast({ title: 'Feature flag updated' });
      void featureFlagsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to update flag.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const clearCacheMutation = useMutation({
    mutationFn: async (scope: string) => {
      await apiRequest('POST', '/api/settings/developer/cache/clear', { scope });
    },
    onSuccess: () => {
      toast({ title: 'Cache cleared' });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to clear cache.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const cacheActions = [
    { label: 'Clear All Cache', scope: 'all' },
    { label: 'Clear User Sessions', scope: 'sessions' },
    { label: 'Clear Query Cache', scope: 'queries' },
    { label: 'Clear ML Model Cache', scope: 'ml' },
  ];

  const performanceData = {
    slowQueries: slowQueriesQuery.data ?? [],
    endpointMetrics: endpointPerformanceQuery.data ?? [],
  };

  return (
    <Tabs defaultValue="status" className="space-y-6">
      <TabsList className="flex flex-wrap gap-2">
        <TabsTrigger value="status">System Status</TabsTrigger>
        <TabsTrigger value="tenant">Tenant</TabsTrigger>
        <TabsTrigger value="database">Database</TabsTrigger>
        <TabsTrigger value="api">API Logs</TabsTrigger>
        <TabsTrigger value="jobs">Jobs</TabsTrigger>
        <TabsTrigger value="logs">System Logs</TabsTrigger>
        <TabsTrigger value="features">Feature Flags</TabsTrigger>
        <TabsTrigger value="cache">Cache</TabsTrigger>
        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        <TabsTrigger value="performance">Performance</TabsTrigger>
      </TabsList>
      <TabsContent value="status">
        {systemStatusQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {systemStatusQuery.data?.services.map((service) => (
              <Card key={service.name}>
                <CardHeader>
                  <CardTitle className="text-base font-semibold">{service.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-1 text-sm text-muted-foreground">
                  <p>Status: {service.status}</p>
                  {service.uptime ? <p>Uptime: {service.uptime}</p> : null}
                  {service.lastRestart ? <p>Last restart: {new Date(service.lastRestart).toLocaleString()}</p> : null}
                  {service.memoryUsage ? <p>Memory: {service.memoryUsage.toFixed(2)} MB</p> : null}
                  {service.cpu ? <p>CPU: {service.cpu.toFixed(2)}%</p> : null}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="tenant">
        {tenantInfoQuery.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : tenantInfoQuery.data ? (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Tenant Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-1 text-sm text-muted-foreground">
                <p>ID: {tenantInfoQuery.data.tenantId}</p>
                <p>Name: {tenantInfoQuery.data.name}</p>
                <p>Status: {tenantInfoQuery.data.status}</p>
                <p>Created: {new Date(tenantInfoQuery.data.createdAt).toLocaleString()}</p>
                <p>
                  Storage: {tenantInfoQuery.data.storageUsageMb.toFixed(1)} MB
                  {tenantInfoQuery.data.storageLimitMb
                    ? ` / ${tenantInfoQuery.data.storageLimitMb.toFixed(1)} MB`
                    : ''}
                </p>
                {tenantInfoQuery.data.apiUsageToday ? (
                  <p>
                    API Usage: {tenantInfoQuery.data.apiUsageToday}
                    {tenantInfoQuery.data.apiLimit ? ` / ${tenantInfoQuery.data.apiLimit}` : ''}
                  </p>
                ) : null}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Record Counts</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full text-sm text-muted-foreground">
                  <tbody>
                    {Object.entries(tenantInfoQuery.data.recordCounts).map(([table, count]) => (
                      <tr key={table}>
                        <td className="py-1 font-medium text-foreground">{table}</td>
                        <td className="py-1 text-right">{count.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </TabsContent>
      <TabsContent value="database">
        <div className="grid gap-4 md:grid-cols-[1fr,1fr]">
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold">SQL Console</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={sql} onChange={(event) => setSql(event.target.value)} rows={8} />
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => executeSqlMutation.mutate(sql)}
                  disabled={executeSqlMutation.isPending}
                >
                  {executeSqlMutation.isPending ? 'Executing…' : 'Run Query'}
                </Button>
              </div>
              {sqlResult ? (
                <pre className="max-h-64 overflow-auto rounded bg-muted p-3 text-xs text-foreground">
                  {JSON.stringify(sqlResult, null, 2)}
                </pre>
              ) : null}
            </CardContent>
          </Card>
          <Card className="md:col-span-1">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Job Triggers</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['retrain-model', 'update-lead-scores', 'optimize-inventory', 'generate-reports', 'run-backup'].map(
                (job) => (
                  <Button
                    key={job}
                    variant="outline"
                    className="w-full justify-between"
                    onClick={() => triggerJobMutation.mutate(job)}
                    disabled={triggerJobMutation.isPending}
                  >
                    <span>{job.replace(/-/g, ' ')}</span>
                    <span className="text-xs text-muted-foreground">Trigger</span>
                  </Button>
                ),
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
      <TabsContent value="api">
        {requestLogsQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/70">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Method</th>
                <th className="px-3 py-2 text-left">Path</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-left">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {requestLogsQuery.data?.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2">{log.method}</td>
                  <td className="px-3 py-2">{log.path}</td>
                  <td className="px-3 py-2">{log.statusCode}</td>
                  <td className="px-3 py-2">{log.durationMs.toFixed(0)} ms</td>
                  <td className="px-3 py-2">{log.user ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TabsContent>
      <TabsContent value="jobs">
        {jobQueueQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Pending</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {jobQueueQuery.data?.pending.length ? (
                  jobQueueQuery.data.pending.map((job) => (
                    <div key={job.id} className="rounded border border-border p-3">
                      <p className="font-medium text-foreground">{job.name}</p>
                      <p>Queued: {new Date(job.enqueuedAt).toLocaleString()}</p>
                      {job.priority ? <p>Priority: {job.priority}</p> : null}
                    </div>
                  ))
                ) : (
                  <p>No pending jobs.</p>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-semibold">Failed</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                {jobQueueQuery.data?.failed.length ? (
                  jobQueueQuery.data.failed.map((job) => (
                    <div key={job.id} className="rounded border border-border p-3">
                      <p className="font-medium text-foreground">{job.name}</p>
                      <p>Error: {job.error}</p>
                      <p>Failed: {new Date(job.failedAt).toLocaleString()}</p>
                    </div>
                  ))
                ) : (
                  <p>No failed jobs.</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </TabsContent>
      <TabsContent value="logs">
        {logsQuery.isLoading ? (
          <Skeleton className="h-48 w-full" />
        ) : (
          <div className="space-y-2">
            {logsQuery.data?.map((log) => (
              <div key={log.id} className="rounded border border-border bg-card px-3 py-2 text-sm text-muted-foreground">
                <div className="flex justify-between">
                  <span className="font-medium text-foreground">{log.service}</span>
                  <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                </div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-wide">
                  <span>{log.level}</span>
                </div>
                <p>{log.message}</p>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="features">
        {featureFlagsQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <div className="space-y-3">
            {featureFlagsQuery.data?.map((flag) => (
              <div key={flag.key} className="rounded border border-border bg-card px-3 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground">{flag.name}</p>
                    {flag.description ? (
                      <p className="text-xs text-muted-foreground">{flag.description}</p>
                    ) : null}
                  </div>
                  <ToggleSwitch
                    enabled={flag.enabled}
                    onChange={(enabled) => updateFeatureFlagMutation.mutate({ key: flag.key, enabled })}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </TabsContent>
      <TabsContent value="cache">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cacheActions.map((action) => (
            <Button
              key={action.scope}
              variant="outline"
              onClick={() => clearCacheMutation.mutate(action.scope)}
              disabled={clearCacheMutation.isPending}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </TabsContent>
      <TabsContent value="webhooks">
        {webhookLogsQuery.isLoading ? (
          <Skeleton className="h-40 w-full" />
        ) : (
          <table className="min-w-full divide-y divide-border text-sm">
            <thead className="bg-muted/70">
              <tr>
                <th className="px-3 py-2 text-left">Time</th>
                <th className="px-3 py-2 text-left">Event</th>
                <th className="px-3 py-2 text-left">URL</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Duration</th>
                <th className="px-3 py-2 text-left">Retries</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {webhookLogsQuery.data?.map((log) => (
                <tr key={log.id}>
                  <td className="px-3 py-2">{new Date(log.timestamp).toLocaleString()}</td>
                  <td className="px-3 py-2">{log.eventType}</td>
                  <td className="px-3 py-2">{log.url}</td>
                  <td className="px-3 py-2">{log.statusCode}</td>
                  <td className="px-3 py-2">{log.responseTimeMs} ms</td>
                  <td className="px-3 py-2">{log.retryCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </TabsContent>
      <TabsContent value="performance">
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Slow Queries</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {slowQueriesQuery.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : performanceData.slowQueries.length === 0 ? (
                <p>No slow queries reported.</p>
              ) : (
                performanceData.slowQueries.map((entry, index) => (
                  <div key={`${entry.query}-${index}`} className="rounded border border-border p-3">
                    <p className="font-medium text-foreground">{entry.query}</p>
                    <p>Duration: {entry.durationMs.toFixed(2)} ms</p>
                    <p>Occurrences: {entry.frequency}</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base font-semibold">Endpoint Latency</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              {endpointPerformanceQuery.isLoading ? (
                <Skeleton className="h-24 w-full" />
              ) : performanceData.endpointMetrics.length === 0 ? (
                <p>No endpoint metrics available.</p>
              ) : (
                performanceData.endpointMetrics.map((metric) => (
                  <div key={metric.endpoint} className="rounded border border-border p-3">
                    <p className="font-medium text-foreground">{metric.endpoint}</p>
                    <p>P50: {metric.p50.toFixed(0)} ms</p>
                    <p>P95: {metric.p95.toFixed(0)} ms</p>
                    <p>P99: {metric.p99.toFixed(0)} ms</p>
                    <p>Error Rate: {(metric.errorRate * 100).toFixed(2)}%</p>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </TabsContent>
    </Tabs>
  );
}

export default DeveloperSettings;
