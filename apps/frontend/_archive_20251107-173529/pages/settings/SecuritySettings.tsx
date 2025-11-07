import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  securitySettingsSchema,
  sessionTimeoutOptions,
  rememberDurationOptions,
  webhookStatusOptions,
  webhookInputSchema,
  type SecuritySettings,
  type WebhookInput,
} from '@shared/settings-schema';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@repo/ui';
import { usePermissions } from '@/hooks/usePermissions';
import {
  createApiKey,
  createWebhook,
  deleteWebhook,
  fetchApiKeys,
  fetchAuditLogs,
  fetchSecuritySettings,
  revokeApiKey,
  updateSecuritySettings,
  updateWebhook,
  type FetchAuditLogParams,
} from '@/lib/settingsSecurityApi';
import { cn } from '@/lib/utils';
import { Download, KeyRound, Plus, ShieldAlert, UploadCloud, Workflow } from 'lucide-react';
import { format } from 'date-fns';

type SecurityFormValues = SecuritySettings;
type WebhookFormValues = z.infer<typeof webhookInputSchema>;

const defaultSecurityValues: SecurityFormValues = securitySettingsSchema.parse({});

const webhookFormSchema = webhookInputSchema;

const webhookDefaults: WebhookFormValues = {
  event: '',
  url: '',
  secret: '',
  status: 'ACTIVE',
};

const formatSessionOption = (value: string): string => {
  if (value.endsWith('m')) {
    const amount = Number(value.slice(0, -1));
    return `${amount} minute${amount === 1 ? '' : 's'}`;
  }
  if (value.endsWith('h')) {
    const amount = Number(value.slice(0, -1));
    return `${amount} hour${amount === 1 ? '' : 's'}`;
  }
  return value;
};

const formatRememberOption = (value: string): string => {
  const amount = Number(value.replace('d', ''));
  return `${amount} day${amount === 1 ? '' : 's'}`;
};

const buildPageRange = (current: number, total: number, max = 7): number[] => {
  if (total <= max) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  const half = Math.floor(max / 2);
  let start = Math.max(1, current - half);
  let end = Math.min(total, start + max - 1);
  start = Math.max(1, end - max + 1);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
};

export function SecuritySettings(): JSX.Element {
  const { hasRole } = usePermissions();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySettingsSchema),
    defaultValues: defaultSecurityValues,
  });

  const [apiKeyDialogOpen, setApiKeyDialogOpen] = useState(false);
  const [apiKeyName, setApiKeyName] = useState('');
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [webhookTargetId, setWebhookTargetId] = useState<string | null>(null);
  const [webhookDeleteTarget, setWebhookDeleteTarget] = useState<string | null>(null);
  const [auditPage, setAuditPage] = useState(1);
  const auditPageSize = 15;
  const [auditFilters, setAuditFilters] = useState<Omit<FetchAuditLogParams, 'page' | 'pageSize'>>({});

  const webhookForm = useForm<WebhookFormValues>({
    resolver: zodResolver(webhookFormSchema),
    defaultValues: webhookDefaults,
  });

  const securityQuery = useQuery({
    queryKey: ['settings', 'security', 'config'],
    queryFn: fetchSecuritySettings,
  });

  useEffect(() => {
    if (securityQuery.data) {
      form.reset(securityQuery.data);
    }
  }, [securityQuery.data, form]);

  const apiKeysQuery = useQuery({
    queryKey: ['settings', 'security', 'apiKeys'],
    queryFn: fetchApiKeys,
  });

  const auditQuery = useQuery({
    queryKey: ['settings', 'security', 'auditLogs', auditPage, auditFilters],
    queryFn: () =>
      fetchAuditLogs({
        page: auditPage,
        pageSize: auditPageSize,
        ...auditFilters,
      }),
    placeholderData: (previousData) => previousData,
  });

  const updateSecurityMutation = useMutation({
    mutationFn: updateSecuritySettings,
    onSuccess: (data) => {
      form.reset(data);
      queryClient.setQueryData(['settings', 'security', 'config'], data);
      toast({ title: 'Security configuration saved' });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save changes.';
      toast({ title: 'Save failed', description: message.replace(/^\d+:\s*/, ''), variant: 'destructive' });
    },
  });

  const createKeyMutation = useMutation({
    mutationFn: (name: string) => createApiKey(name),
    onSuccess: (apiKey) => {
      toast({
        title: 'API key generated',
        description: (
          <div className="space-y-1">
            <p>Store this value securely. It will not be shown again.</p>
            <code className="inline-block rounded bg-muted px-2 py-1 text-sm font-semibold">{apiKey.secret}</code>
          </div>
        ),
      });
      setApiKeyName('');
      setApiKeyDialogOpen(false);
      void queryClient.invalidateQueries({ queryKey: ['settings', 'security', 'apiKeys'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to generate API key.';
      toast({ title: 'Action failed', description: message.replace(/^\d+:\s*/, ''), variant: 'destructive' });
    },
  });

  const revokeKeyMutation = useMutation({
    mutationFn: (id: string) => revokeApiKey(id),
    onSuccess: () => {
      toast({ title: 'API key revoked' });
      void queryClient.invalidateQueries({ queryKey: ['settings', 'security', 'apiKeys'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to revoke API key.';
      toast({ title: 'Action failed', description: message.replace(/^\d+:\s*/, ''), variant: 'destructive' });
    },
  });

  const upsertWebhookMutation = useMutation({
    mutationFn: async (values: WebhookFormValues) => {
      if (webhookTargetId) {
        return updateWebhook(webhookTargetId, values);
      }
      return createWebhook(values);
    },
    onSuccess: () => {
      toast({ title: webhookTargetId ? 'Webhook updated' : 'Webhook added' });
      setWebhookDialogOpen(false);
      setWebhookTargetId(null);
      webhookForm.reset(webhookDefaults);
      void queryClient.invalidateQueries({ queryKey: ['settings', 'security', 'config'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to save webhook.';
      toast({ title: 'Action failed', description: message.replace(/^\d+:\s*/, ''), variant: 'destructive' });
    },
  });

  const deleteWebhookMutation = useMutation({
    mutationFn: (id: string) => deleteWebhook(id),
    onSuccess: () => {
      toast({ title: 'Webhook removed' });
      setWebhookDeleteTarget(null);
      void queryClient.invalidateQueries({ queryKey: ['settings', 'security', 'config'] });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to delete webhook.';
      toast({ title: 'Action failed', description: message.replace(/^\d+:\s*/, ''), variant: 'destructive' });
    },
  });

  const onSubmit = form.handleSubmit((values) => updateSecurityMutation.mutate(values));

  const logs = auditQuery.data?.data ?? [];
  const totalLogs = auditQuery.data?.meta.total ?? 0;
  const auditPageCount = Math.max(1, Math.ceil(totalLogs / auditPageSize));
  const auditPages = buildPageRange(auditPage, auditPageCount);

  const handleExportLogs = () => {
    if (logs.length === 0) {
      toast({ title: 'No rows to export', description: 'Adjust your filters to include some activity.' });
      return;
    }

    const header = ['Timestamp', 'User', 'Action', 'Resource', 'IP', 'Details'];
    const rows = logs.map((log) => [
      log.timestamp,
      log.userName,
      log.action,
      log.resource,
      log.ipAddress ?? '',
      log.details ?? '',
    ]);

    const csv = [header, ...rows]
      .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `security-audit-${Date.now()}.csv`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const openWebhookDialog = (webhookId?: string) => {
    if (webhookId && securityQuery.data) {
      const target = securityQuery.data.webhooks.find((webhook) => webhook.id === webhookId);
      if (target) {
        webhookForm.reset({
          event: target.event,
          url: target.url,
          secret: target.secret,
          status: target.status,
        });
        setWebhookTargetId(target.id);
      }
    } else {
      webhookForm.reset(webhookDefaults);
      setWebhookTargetId(null);
    }
    setWebhookDialogOpen(true);
  };

  if (!hasRole('ADMIN')) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <ShieldAlert className="h-5 w-5" /> Restricted Access
          </CardTitle>
          <CardDescription>Only administrators can manage global security policies.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  if (securityQuery.isLoading) {
    return <Skeleton className="h-[640px] w-full" />;
  }

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Authentication Policies</CardTitle>
              <CardDescription>Strengthen login requirements to protect every dealership tenant.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="twoFactorEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-col justify-between rounded-lg border p-4">
                    <div className="space-y-1">
                      <FormLabel>Require two-factor authentication</FormLabel>
                      <p className="text-sm text-muted-foreground">Strongly recommended for administrator and finance roles.</p>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="minPasswordLength"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Minimum password length</FormLabel>
                    <div className="rounded-lg border p-4">
                      <FormControl>
                        <Slider
                          min={8}
                          max={20}
                          step={1}
                          value={[field.value]}
                          onValueChange={(values) => field.onChange(values[0])}
                        />
                      </FormControl>
                      <p className="mt-2 text-sm text-muted-foreground">Current requirement: {field.value} characters</p>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {(['requireUppercase', 'requireNumber', 'requireSpecial'] as const).map((name) => (
                <FormField
                  key={name}
                  control={form.control}
                  name={name}
                  render={({ field }) => (
                    <FormItem className="flex flex-col justify-between rounded-lg border p-4">
                      <div className="space-y-1">
                        <FormLabel>
                          {name === 'requireUppercase'
                            ? 'Require uppercase characters'
                            : name === 'requireNumber'
                              ? 'Require numeric characters'
                              : 'Require special characters'}
                        </FormLabel>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
              <FormField
                control={form.control}
                name="sessionTimeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Session timeout</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {sessionTimeoutOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {formatSessionOption(option)}
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
                name="rememberDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Remember me duration</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {rememberDurationOptions.map((option) => (
                          <SelectItem key={option} value={option}>
                            {formatRememberOption(option)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-xl font-semibold">Access Control</CardTitle>
              <CardDescription>Control where and how authenticated sessions are permitted.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="ipWhitelist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP whitelist</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder={'192.168.0.1\n10.0.0.0/24'}
                        value={(field.value ?? []).join('\n')}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value
                              .split('\n')
                              .map((ip) => ip.trim())
                              .filter((ip) => ip.length > 0),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>Only these addresses may initiate a new session.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ipBlacklist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>IP blacklist</FormLabel>
                    <FormControl>
                      <Textarea
                        rows={5}
                        placeholder={'0.0.0.0\n203.0.113.42'}
                        value={(field.value ?? []).join('\n')}
                        onChange={(event) =>
                          field.onChange(
                            event.target.value
                              .split('\n')
                              .map((ip) => ip.trim())
                              .filter((ip) => ip.length > 0),
                          )
                        }
                      />
                    </FormControl>
                    <FormDescription>These sources will always be denied access.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="maxFailedAttempts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max failed login attempts</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={20}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value || '1'))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lockoutMinutes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lockout duration (minutes)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        max={480}
                        value={field.value}
                        onChange={(event) => field.onChange(Number(event.target.value || '1'))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter className="justify-end">
              <Button type="submit" disabled={updateSecurityMutation.isPending}>
                {updateSecurityMutation.isPending ? 'Saving…' : 'Save security settings'}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </Form>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <KeyRound className="h-5 w-5" /> API Keys
          </CardTitle>
          <CardDescription>Provision and revoke programmatic access keys.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => setApiKeyDialogOpen(true)} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Generate new key
          </Button>
          <div className="rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Masked value</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Last used</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apiKeysQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : apiKeysQuery.data?.length ? (
                  apiKeysQuery.data.map((key) => (
                    <TableRow key={key.id}>
                      <TableCell>{key.name}</TableCell>
                      <TableCell className="font-mono text-sm">{key.maskedKey}</TableCell>
                      <TableCell>{format(new Date(key.createdAt), 'PP p')}</TableCell>
                      <TableCell>{key.lastUsedAt ? format(new Date(key.lastUsedAt), 'PP p') : 'Never'}</TableCell>
                      <TableCell>
                        <span className={cn('text-xs font-medium uppercase', key.status === 'ACTIVE' ? 'text-emerald-600' : 'text-muted-foreground')}>
                          {key.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => revokeKeyMutation.mutate(key.id)}
                          disabled={key.status !== 'ACTIVE' || revokeKeyMutation.isPending}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No API keys have been generated yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <UploadCloud className="h-5 w-5" /> Webhook endpoints
          </CardTitle>
          <CardDescription>Deliver event notifications to your downstream systems.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={() => openWebhookDialog()} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add webhook
          </Button>
          <div className="rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Destination URL</TableHead>
                  <TableHead>Secret</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {securityQuery.data?.webhooks.length ? (
                  securityQuery.data.webhooks.map((webhook) => (
                    <TableRow key={webhook.id}>
                      <TableCell>{webhook.event}</TableCell>
                      <TableCell className="max-w-sm truncate" title={webhook.url}>
                        {webhook.url}
                      </TableCell>
                      <TableCell className="font-mono text-sm">{webhook.secret}</TableCell>
                      <TableCell>
                        <span className={cn('text-xs font-medium uppercase', webhook.status === 'ACTIVE' ? 'text-emerald-600' : 'text-muted-foreground')}>
                          {webhook.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="ghost" size="sm" onClick={() => openWebhookDialog(webhook.id)}>
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive"
                          onClick={() => setWebhookDeleteTarget(webhook.id)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-sm text-muted-foreground">
                      No webhooks configured yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Workflow className="h-5 w-5" /> Audit log
          </CardTitle>
          <CardDescription>Review every security-sensitive action captured by the platform.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <Input
              type="date"
              value={auditFilters.startDate ?? ''}
              onChange={(event) => {
                setAuditFilters((current) => ({ ...current, startDate: event.target.value || undefined }));
                setAuditPage(1);
              }}
              placeholder="Start date"
            />
            <Input
              type="date"
              value={auditFilters.endDate ?? ''}
              onChange={(event) => {
                setAuditFilters((current) => ({ ...current, endDate: event.target.value || undefined }));
                setAuditPage(1);
              }}
              placeholder="End date"
            />
            <Input
              value={auditFilters.userId ?? ''}
              onChange={(event) => {
                setAuditFilters((current) => ({ ...current, userId: event.target.value || undefined }));
                setAuditPage(1);
              }}
              placeholder="Filter by user ID"
            />
            <Input
              value={auditFilters.action ?? ''}
              onChange={(event) => {
                setAuditFilters((current) => ({ ...current, action: event.target.value || undefined }));
                setAuditPage(1);
              }}
              placeholder="Filter by action"
            />
          </div>
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{totalLogs} events found</p>
            <Button variant="outline" onClick={handleExportLogs} disabled={logs.length === 0}>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </Button>
          </div>
          <div className="rounded border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Resource</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditQuery.isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Skeleton className="h-8 w-full" />
                    </TableCell>
                  </TableRow>
                ) : logs.length ? (
                  logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>{format(new Date(log.timestamp), 'PP p')}</TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>{log.action}</TableCell>
                      <TableCell>{log.resource}</TableCell>
                      <TableCell>{log.ipAddress ?? '—'}</TableCell>
                      <TableCell className="max-w-xs truncate" title={log.details ?? ''}>
                        {log.details ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                      No audit records match the current filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (auditPage > 1) {
                      setAuditPage((page) => page - 1);
                    }
                  }}
                  aria-disabled={auditPage === 1}
                  className={cn(auditPage === 1 && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
              {auditPages.map((pageNumber) => (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    href="#"
                    isActive={pageNumber === auditPage}
                    onClick={(event) => {
                      event.preventDefault();
                      setAuditPage(pageNumber);
                    }}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  href="#"
                  onClick={(event) => {
                    event.preventDefault();
                    if (auditPage < auditPageCount) {
                      setAuditPage((page) => page + 1);
                    }
                  }}
                  aria-disabled={auditPage >= auditPageCount}
                  className={cn(auditPage >= auditPageCount && 'pointer-events-none opacity-50')}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </CardContent>
      </Card>

      <Dialog open={apiKeyDialogOpen} onOpenChange={setApiKeyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate new API key</DialogTitle>
            <DialogDescription>Provide a descriptive name so you can identify this key later.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Input value={apiKeyName} onChange={(event) => setApiKeyName(event.target.value)} placeholder="Integration name" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApiKeyDialogOpen(false)} disabled={createKeyMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => apiKeyName.trim() && createKeyMutation.mutate(apiKeyName.trim())}
              disabled={createKeyMutation.isPending || apiKeyName.trim().length === 0}
            >
              {createKeyMutation.isPending ? 'Generating…' : 'Generate key'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={webhookDialogOpen} onOpenChange={(open) => {
        setWebhookDialogOpen(open);
        if (!open) {
          setWebhookTargetId(null);
        }
      }}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{webhookTargetId ? 'Edit webhook' : 'Add webhook'}</DialogTitle>
            <DialogDescription>Configure the destination for outbound webhook events.</DialogDescription>
          </DialogHeader>
          <Form {...webhookForm}>
            <form
              onSubmit={webhookForm.handleSubmit((values) => upsertWebhookMutation.mutate(values))}
              className="space-y-4"
            >
              <FormField
                control={webhookForm.control}
                name="event"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="deal.created" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={webhookForm.control}
                name="url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination URL</FormLabel>
                    <FormControl>
                      <Input type="url" {...field} placeholder="https://example.com/webhooks" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={webhookForm.control}
                name="secret"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Signing secret</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Used to sign webhook payloads" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={webhookForm.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {webhookStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
                            {status}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button variant="outline" type="button" onClick={() => setWebhookDialogOpen(false)} disabled={upsertWebhookMutation.isPending}>
                  Cancel
                </Button>
                <Button type="submit" disabled={upsertWebhookMutation.isPending}>
                  {upsertWebhookMutation.isPending ? 'Saving…' : webhookTargetId ? 'Update webhook' : 'Create webhook'}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={webhookDeleteTarget !== null} onOpenChange={(open) => !open && setWebhookDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete webhook</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone and will stop deliveries to the endpoint.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteWebhookMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => webhookDeleteTarget && deleteWebhookMutation.mutate(webhookDeleteTarget)}
              disabled={deleteWebhookMutation.isPending}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default SecuritySettings;
