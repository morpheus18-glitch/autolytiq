import { useState } from 'react';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch';
import { AuditLogTable, type AuditLogEntry } from '@/components/settings/AuditLogTable';
import { useSettingsSection } from './useSettingsSection';
import { apiRequest } from '@/lib/queryClient';

const securitySchema = z.object({
  twoFactorEnabled: z.boolean().default(false),
  minPasswordLength: z.number().min(8).max(20).default(12),
  requireUppercase: z.boolean().default(true),
  requireNumber: z.boolean().default(true),
  requireSpecial: z.boolean().default(true),
  sessionTimeout: z.enum(['15m', '30m', '1h', '2h', '4h', '8h']).default('30m'),
  rememberDuration: z.enum(['7d', '14d', '30d']).default('14d'),
  ipWhitelist: z.string().default(''),
  ipBlacklist: z.string().default(''),
  maxFailedAttempts: z.number().min(1).default(5),
  lockoutMinutes: z.number().min(0).default(30),
});

export type SecuritySettingsForm = z.infer<typeof securitySchema>;

const defaultValues: SecuritySettingsForm = {
  twoFactorEnabled: false,
  minPasswordLength: 12,
  requireUppercase: true,
  requireNumber: true,
  requireSpecial: true,
  sessionTimeout: '30m',
  rememberDuration: '14d',
  ipWhitelist: '',
  ipBlacklist: '',
  maxFailedAttempts: 5,
  lockoutMinutes: 30,
};

const auditLogResponseSchema = z.object({
  logs: z
    .array(
      z.object({
        id: z.string(),
        timestamp: z.string(),
        user: z.string(),
        action: z.string(),
        resource: z.string(),
        ipAddress: z.string().nullable().optional(),
        details: z.string().optional(),
      }),
    )
    .default([]),
  page: z.number().default(1),
  total: z.number().default(0),
  pageSize: z.number().default(20),
});

export function SecuritySettings(): JSX.Element {
  const { form, query, mutation, onSubmit } = useSettingsSection<SecuritySettingsForm>({
    endpoint: 'security',
    schema: securitySchema,
    defaultValues,
    successMessage: 'Security configuration saved',
  });

  const [logPage, setLogPage] = useState(1);
  const [logSearch, setLogSearch] = useState('');

  const auditLogQuery = useQuery({
    queryKey: ['settings', 'security', 'logs', logPage, logSearch],
    queryFn: async () => {
      const params = new URLSearchParams({ page: logPage.toString() });
      if (logSearch) {
        params.set('search', logSearch);
      }
      const response = await apiRequest(`/api/settings/audit-logs?${params.toString()}`);
      const json = (await response.json()) as unknown;
      const parsed = auditLogResponseSchema.safeParse(json);
      if (parsed.success) {
        return parsed.data;
      }
      return { logs: [], page: 1, total: 0, pageSize: 20 } satisfies z.infer<typeof auditLogResponseSchema>;
    },
  });

  if (query.isLoading) {
    return <Skeleton className="h-[480px] w-full" />;
  }

  const logs = auditLogQuery.data?.logs ?? [];
  const page = auditLogQuery.data?.page ?? 1;
  const total = auditLogQuery.data?.total ?? 0;
  const pageSize = auditLogQuery.data?.pageSize ?? 20;

  return (
    <Form {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Authentication Policies</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="twoFactorEnabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Require two-factor authentication"
                  description="Applies to all administrator accounts."
                />
              )}
            />
            <FormField
              control={form.control}
              name="minPasswordLength"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Minimum Password Length</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={8}
                      max={20}
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value || '8'))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="requireUppercase"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={field.onChange}
                  label="Require uppercase characters"
                />
              )}
            />
            <FormField
              control={form.control}
              name="requireNumber"
              render={({ field }) => (
                <ToggleSwitch enabled={field.value} onChange={field.onChange} label="Require numeric characters" />
              )}
            />
            <FormField
              control={form.control}
              name="requireSpecial"
              render={({ field }) => (
                <ToggleSwitch enabled={field.value} onChange={field.onChange} label="Require special characters" />
              )}
            />
            <FormField
              control={form.control}
              name="sessionTimeout"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Session Timeout</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="15m">15 minutes</SelectItem>
                      <SelectItem value="30m">30 minutes</SelectItem>
                      <SelectItem value="1h">1 hour</SelectItem>
                      <SelectItem value="2h">2 hours</SelectItem>
                      <SelectItem value="4h">4 hours</SelectItem>
                      <SelectItem value="8h">8 hours</SelectItem>
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
                  <FormLabel>Remember Me Duration</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="7d">7 days</SelectItem>
                      <SelectItem value="14d">14 days</SelectItem>
                      <SelectItem value="30d">30 days</SelectItem>
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
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="ipWhitelist"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>IP Whitelist</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="192.168.0.1\n10.0.0.0/24" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ipBlacklist"
              render={({ field }) => (
                <FormItem className="md:col-span-1">
                  <FormLabel>IP Blacklist</FormLabel>
                  <FormControl>
                    <Textarea rows={4} placeholder="0.0.0.0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="maxFailedAttempts"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Max Failed Attempts</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
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
                  <FormLabel>Lockout Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      {...field}
                      onChange={(event) => field.onChange(Number(event.target.value || '0'))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Security Settings'}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Audit Trail</CardTitle>
          </CardHeader>
          <CardContent>
            <AuditLogTable
              logs={logs as AuditLogEntry[]}
              loading={auditLogQuery.isLoading}
              page={page}
              total={total}
              pageSize={pageSize}
              onPageChange={(next) => setLogPage(next)}
              filterValue={logSearch}
              onFilterChange={(value) => {
                setLogSearch(value);
                setLogPage(1);
              }}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  );
}

export default SecuritySettings;
