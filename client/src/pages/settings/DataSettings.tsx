import { useMutation, useQuery } from '@tanstack/react-query';
import { z } from 'zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { useSettingsSection } from './useSettingsSection';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  autoBackupEnabled: z.boolean().default(true),
  backupSchedule: z.enum(['DAILY_2AM', 'EVERY_12H', 'WEEKLY', 'MONTHLY']).default('DAILY_2AM'),
  retentionPeriod: z.enum(['7', '14', '30', '60', '90']).default('30'),
  bucketName: z.string().min(1),
  bucketRegion: z.string().min(1),
  accessKey: z.string().min(1),
  secretKey: z.string().min(1),
});

type DataSettingsFormValues = z.infer<typeof formSchema>;

const defaultValues: DataSettingsFormValues = {
  autoBackupEnabled: true,
  backupSchedule: 'DAILY_2AM',
  retentionPeriod: '30',
  bucketName: '',
  bucketRegion: '',
  accessKey: '',
  secretKey: '',
};

const backupHistorySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  size: z.number(),
  type: z.enum(['AUTO', 'MANUAL']).default('AUTO'),
  status: z.string(),
});

export function DataSettings(): JSX.Element {
  const { toast } = useToast();

  const { form, query, mutation, onSubmit } = useSettingsSection<DataSettingsFormValues>({
    endpoint: 'backup/config',
    schema: formSchema,
    defaultValues,
    successMessage: 'Backup preferences saved',
  });

  const historyQuery = useQuery({
    queryKey: ['settings', 'backup-history'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/backup/history');
      const json = (await response.json()) as unknown;
      const parsed = z.array(backupHistorySchema).safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return [] as z.infer<typeof backupHistorySchema>[];
    },
  });

  const triggerBackupMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/settings/backup/trigger', {});
    },
    onSuccess: () => {
      toast({ title: 'Backup started' });
      void historyQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to trigger backup.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      await apiRequest('POST', `/api/settings/backup/restore/${backupId}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Restore queued' });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to restore backup.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/settings/export-data', {});
      return response.json();
    },
    onSuccess: () => {
      toast({ title: 'Export started' });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to export data.';
      toast({ title: 'Action failed', description: message, variant: 'destructive' });
    },
  });

  if (query.isLoading) {
    return <Skeleton className="h-[500px] w-full" />;
  }

  const backups = historyQuery.data ?? [];

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Backup Configuration</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="autoBackupEnabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Enable automatic backups"
                  description="Run scheduled backups based on the cadence below."
                />
              )}
            />
            <FormField
              control={form.control}
              name="backupSchedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backup Schedule</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="DAILY_2AM">Daily at 2AM</SelectItem>
                      <SelectItem value="EVERY_12H">Every 12 Hours</SelectItem>
                      <SelectItem value="WEEKLY">Weekly</SelectItem>
                      <SelectItem value="MONTHLY">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="retentionPeriod"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retention Period</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="14">14 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bucketName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Bucket Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="bucketRegion"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Key</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => triggerBackupMutation.mutate()}
              disabled={triggerBackupMutation.isPending}
            >
              {triggerBackupMutation.isPending ? 'Starting…' : 'Run Manual Backup'}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Backup Settings'}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Backup History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {historyQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : backups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No backups found.</p>
            ) : (
              <table className="min-w-full divide-y divide-border text-sm">
                <thead>
                  <tr className="bg-muted/70">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Size</th>
                    <th className="px-3 py-2 text-left">Type</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {backups.map((backup) => (
                    <tr key={backup.id}>
                      <td className="px-3 py-2 text-sm text-foreground">
                        {new Date(backup.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">
                        {(backup.size / (1024 * 1024)).toFixed(2)} MB
                      </td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{backup.type}</td>
                      <td className="px-3 py-2 text-sm text-muted-foreground">{backup.status}</td>
                      <td className="px-3 py-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              window.open(`/api/settings/backup/download/${backup.id}`, '_blank');
                            }}
                          >
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => restoreBackupMutation.mutate(backup.id)}
                            disabled={restoreBackupMutation.isPending}
                          >
                            Restore
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Export & Import</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? 'Preparing…' : 'Export Data'}
            </Button>
            <p className="text-sm text-muted-foreground">
              Exports run asynchronously; you will receive a notification when the download is ready.
            </p>
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

export default DataSettings;
