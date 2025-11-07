
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import * as XLSX from 'xlsx';
import { z } from 'zod';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@repo/ui';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@repo/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@repo/ui';
import { Badge } from '@repo/ui';
import { ToggleSwitch } from '@/components/settings/ToggleSwitch.tsx';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useSettingsSection } from './useSettingsSection';
import {
  analyticsRetentionOptions,
  backupRetentionOptions,
  backupScheduleOptions,
  customerRetentionOptions,
  dataExportEntities,
  dataExportFormats,
  dataSettingsSchema,
  defaultDataSettings,
  leadRetentionOptions,
  type AnalyticsRetentionWindow,
  type BackupRetentionWindow,
  type BackupSchedule,
  type DataExportEntity,
  type DataExportFormat,
  type DataSettings,
  type LeadRetentionWindow,
  type CustomerRetentionWindow,
} from '@shared/settings-schema';

const backupHistorySchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  sizeBytes: z.number().nonnegative(),
  type: z.enum(['AUTO', 'MANUAL']),
  status: z.string(),
  downloadUrl: z.string().url().optional(),
});

const gdprRequestSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  email: z.string().email(),
  requestedAt: z.string(),
  type: z.enum(['DELETE', 'EXPORT']),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'DECLINED']),
  notes: z.string().optional(),
});

const exportJobResponseSchema = z.object({
  jobId: z.string(),
  status: z.enum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']).default('PENDING'),
  downloadUrl: z.string().url().optional(),
  message: z.string().optional(),
  requestedAt: z.string().optional(),
});

const exportJobStatusSchema = exportJobResponseSchema.extend({
  updatedAt: z.string().optional(),
});

type ExportJobStatus = z.infer<typeof exportJobStatusSchema>;

type ExportJobRecord = ExportJobStatus & {
  format: DataExportFormat;
  entities: DataExportEntity[];
  label?: string;
};

const exportFormSchema = z
  .object({
    format: z.enum(dataExportFormats),
    entities: z.array(z.enum(dataExportEntities)).min(1, 'Select at least one data category'),
    dateRange: z
      .object({
        start: z.string().min(1, 'Select a start date'),
        end: z.string().min(1, 'Select an end date'),
      })
      .refine((value) => !value.start || !value.end || value.start <= value.end, {
        message: 'End date must be after the start date',
        path: ['end'],
      }),
  })
  .strict();

type ExportFormValues = z.infer<typeof exportFormSchema>;

interface ExportRequestPayload {
  format: DataExportFormat;
  entities: DataExportEntity[];
  dateRange?: { start: string; end: string } | null;
  filters?: Record<string, unknown>;
  label?: string;
}

interface ImportColumnDefinition {
  value: string;
  label: string;
  required?: boolean;
}

interface ParsedImportFile {
  headers: string[];
  previewRows: string[][];
}

const datasetLabels: Record<DataExportEntity, string> = {
  CUSTOMERS: 'Customers',
  VEHICLES: 'Vehicles',
  DEALS: 'Deals',
  INVENTORY: 'Inventory',
  JOURNAL_ENTRIES: 'Journal Entries',
  LEADS: 'Leads',
  SERVICE_APPOINTMENTS: 'Service Appointments',
  ANALYTICS_EVENTS: 'Analytics Events',
};

const exportFormatLabels: Record<DataExportFormat, string> = {
  CSV: 'CSV (Comma separated)',
  JSON: 'JSON',
  EXCEL: 'Excel (.xlsx)',
};

const backupScheduleLabels: Record<BackupSchedule, string> = {
  DAILY_2AM: 'Daily at 2:00 AM',
  EVERY_12H: 'Every 12 hours',
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

const backupRetentionLabels: Record<BackupRetentionWindow, string> = {
  '7': '7 days',
  '14': '14 days',
  '30': '30 days',
  '60': '60 days',
  '90': '90 days',
};

const customerRetentionLabels: Record<CustomerRetentionWindow, string> = {
  '1Y': '1 year',
  '2Y': '2 years',
  '5Y': '5 years',
  '7Y': '7 years',
  INDEFINITE: 'Indefinite',
};

const leadRetentionLabels: Record<LeadRetentionWindow, string> = {
  '6M': '6 months',
  '1Y': '1 year',
  '2Y': '2 years',
};

const analyticsRetentionLabels: Record<AnalyticsRetentionWindow, string> = {
  '1Y': '1 year',
  '2Y': '2 years',
  '5Y': '5 years',
};

const datasetFieldOptions: Record<DataExportEntity, ImportColumnDefinition[]> = {
  CUSTOMERS: [
    { value: 'firstName', label: 'First Name', required: true },
    { value: 'lastName', label: 'Last Name', required: true },
    { value: 'email', label: 'Email Address' },
    { value: 'phone', label: 'Phone Number' },
    { value: 'company', label: 'Company' },
    { value: 'address', label: 'Street Address' },
    { value: 'city', label: 'City' },
    { value: 'state', label: 'State/Province' },
    { value: 'postalCode', label: 'Postal Code' },
  ],
  VEHICLES: [
    { value: 'vin', label: 'VIN', required: true },
    { value: 'stockNumber', label: 'Stock Number', required: true },
    { value: 'make', label: 'Make', required: true },
    { value: 'model', label: 'Model', required: true },
    { value: 'year', label: 'Model Year' },
    { value: 'trim', label: 'Trim' },
    { value: 'status', label: 'Inventory Status' },
    { value: 'mileage', label: 'Mileage' },
  ],
  DEALS: [
    { value: 'dealNumber', label: 'Deal Number', required: true },
    { value: 'customerId', label: 'Customer ID', required: true },
    { value: 'vehicleVin', label: 'Vehicle VIN', required: true },
    { value: 'salesperson', label: 'Salesperson' },
    { value: 'status', label: 'Deal Status' },
    { value: 'grossProfit', label: 'Gross Profit' },
    { value: 'submittedAt', label: 'Submitted Date' },
  ],
  INVENTORY: [
    { value: 'sku', label: 'SKU', required: true },
    { value: 'name', label: 'Item Name', required: true },
    { value: 'quantity', label: 'Quantity On Hand', required: true },
    { value: 'location', label: 'Storage Location' },
    { value: 'cost', label: 'Unit Cost' },
    { value: 'status', label: 'Status' },
  ],
  JOURNAL_ENTRIES: [
    { value: 'entryNumber', label: 'Entry Number', required: true },
    { value: 'entryDate', label: 'Entry Date', required: true },
    { value: 'account', label: 'Account', required: true },
    { value: 'debit', label: 'Debit Amount' },
    { value: 'credit', label: 'Credit Amount' },
    { value: 'memo', label: 'Memo' },
  ],
  LEADS: [
    { value: 'leadId', label: 'Lead ID', required: true },
    { value: 'source', label: 'Source', required: true },
    { value: 'status', label: 'Status' },
    { value: 'assignedTo', label: 'Assigned To' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'createdAt', label: 'Created At' },
  ],
  SERVICE_APPOINTMENTS: [
    { value: 'appointmentId', label: 'Appointment ID', required: true },
    { value: 'customerId', label: 'Customer ID', required: true },
    { value: 'appointmentDate', label: 'Appointment Date', required: true },
    { value: 'advisor', label: 'Service Advisor' },
    { value: 'vehicleVin', label: 'Vehicle VIN' },
    { value: 'status', label: 'Status' },
  ],
  ANALYTICS_EVENTS: [
    { value: 'eventName', label: 'Event Name', required: true },
    { value: 'occurredAt', label: 'Occurred At', required: true },
    { value: 'customerId', label: 'Customer ID' },
    { value: 'sessionId', label: 'Session ID' },
    { value: 'metadata', label: 'Metadata JSON' },
  ],
};

function createDefaultValues(): DataSettings {
  return {
    backup: {
      ...defaultDataSettings.backup,
      storage: { ...defaultDataSettings.backup.storage },
    },
    retention: { ...defaultDataSettings.retention },
  } satisfies DataSettings;
}

function formatBytes(sizeBytes: number): string {
  if (!Number.isFinite(sizeBytes) || sizeBytes <= 0) {
    return '0 B';
  }

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.min(Math.floor(Math.log(sizeBytes) / Math.log(1024)), units.length - 1);
  const value = sizeBytes / 1024 ** exponent;
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${units[exponent]}`;
}

async function parseImportFile(file: File): Promise<ParsedImportFile> {
  const extension = file.name.toLowerCase();
  let workbook: XLSX.WorkBook;

  if (extension.endsWith('.csv') || extension.endsWith('.tsv')) {
    const raw = await file.text();
    workbook = XLSX.read(raw, { type: 'string' });
  } else if (extension.endsWith('.xls') || extension.endsWith('.xlsx')) {
    const buffer = await file.arrayBuffer();
    workbook = XLSX.read(buffer, { type: 'array' });
  } else {
    throw new Error('Unsupported file type. Upload a CSV or Excel file.');
  }

  const [sheetName] = workbook.SheetNames;
  if (!sheetName) {
    throw new Error('Uploaded file does not contain any worksheets.');
  }

  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(sheet, {
    header: 1,
    raw: false,
    defval: '',
    blankrows: false,
  });

  if (rows.length === 0) {
    throw new Error('Uploaded file is empty.');
  }

  const headers = rows[0]?.map((value) => String(value ?? '').trim()) ?? [];
  if (!headers.length) {
    throw new Error('The uploaded file is missing a header row.');
  }

  const previewRows = rows.slice(1, 6).map((row) =>
    headers.map((_, index) => {
      const value = row?.[index];
      return value === undefined || value === null ? '' : String(value);
    }),
  );

  return { headers, previewRows };
}

function buildAutoMappings(
  headers: string[],
  dataset: DataExportEntity,
): Record<string, string> {
  const autoMappings: Record<string, string> = {};
  const availableFields = datasetFieldOptions[dataset] ?? [];

  headers.forEach((header) => {
    const normalized = header.trim().toLowerCase();
    const matchedField = availableFields.find((field) => {
      if (field.value.toLowerCase() === normalized) {
        return true;
      }

      const labelNormalized = field.label.trim().toLowerCase();
      return labelNormalized === normalized || normalized.replace(/\s+/g, '') === labelNormalized.replace(/\s+/g, '');
    });

    if (matchedField) {
      autoMappings[header] = matchedField.value;
    }
  });

  return autoMappings;
}

export function DataSettings(): JSX.Element {
  const defaultValues = useMemo(() => createDefaultValues(), []);
  const { toast } = useToast();

  const { form, query, mutation, onSubmit } = useSettingsSection<DataSettings>({
    endpoint: 'backup/config',
    schema: dataSettingsSchema,
    defaultValues,
    successMessage: 'Data settings saved',
  });

  const historyQuery = useQuery({
    queryKey: ['settings', 'backup-history'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/backup/history');
      const json = (await response.json()) as unknown;
      const parsed = z.array(backupHistorySchema).safeParse(json);
      return parsed.success ? parsed.data.slice(0, 30) : [];
    },
  });

  const gdprRequestsQuery = useQuery({
    queryKey: ['settings', 'gdpr-requests'],
    queryFn: async () => {
      const response = await apiRequest('/api/settings/gdpr/requests');
      const json = (await response.json()) as unknown;
      const parsed = z.array(gdprRequestSchema).safeParse(json);
      return parsed.success ? parsed.data : [];
    },
  });

  const triggerBackupMutation = useMutation({
    mutationFn: async () => {
      await apiRequest('POST', '/api/settings/backup/trigger', {});
    },
    onSuccess: () => {
      toast({ title: 'Backup started', description: 'A new manual backup has been queued.' });
      void historyQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to trigger a backup.';
      toast({ title: 'Backup failed', description: message, variant: 'destructive' });
    },
  });

  const restoreBackupMutation = useMutation({
    mutationFn: async (backupId: string) => {
      await apiRequest('POST', `/api/settings/backup/restore/${encodeURIComponent(backupId)}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Restore queued', description: 'Backup restore request submitted.' });
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to restore the selected backup.';
      toast({ title: 'Restore failed', description: message, variant: 'destructive' });
    },
  });

  const exportMutation = useMutation({
    mutationFn: async (payload: ExportRequestPayload) => {
      const response = await apiRequest('POST', '/api/settings/export-data', payload);
      const json = (await response.json()) as unknown;
      return exportJobResponseSchema.parse(json);
    },
    onSuccess: (job, variables) => {
      const exportLabel = variables.label ?? `${variables.entities.map((entity) => datasetLabels[entity]).join(', ')} export`;
      toast({ title: 'Export started', description: `${exportLabel} job has been queued.` });
      setExportJobs((current) => {
        if (current.some((existing) => existing.jobId === job.jobId)) {
          return current;
        }

        return [
          ...current,
          {
            ...job,
            format: variables.format,
            entities: variables.entities,
            label: variables.label,
          },
        ];
      });
      pollExportStatus(job.jobId);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to start export job.';
      toast({ title: 'Export failed', description: message, variant: 'destructive' });
    },
  });

  const deleteCustomerMutation = useMutation({
    mutationFn: async (customerIdentifier: string) => {
      await apiRequest('POST', `/api/settings/gdpr/delete-customer/${encodeURIComponent(customerIdentifier)}`, {});
    },
    onSuccess: () => {
      toast({ title: 'Deletion requested', description: 'Customer data removal has been queued.' });
      void gdprRequestsQuery.refetch();
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to process the deletion request.';
      toast({ title: 'Request failed', description: message, variant: 'destructive' });
    },
  });

  const [restoreTarget, setRestoreTarget] = useState<z.infer<typeof backupHistorySchema> | null>(null);
  const [exportJobs, setExportJobs] = useState<ExportJobRecord[]>([]);
  const pollers = useRef<Record<string, number>>({});
  const [importDataset, setImportDataset] = useState<DataExportEntity>('CUSTOMERS');
  const [importFile, setImportFile] = useState<File | null>(null);
  const [columnMappings, setColumnMappings] = useState<Record<string, string>>({});
  const [importHeaders, setImportHeaders] = useState<string[]>([]);
  const [previewRows, setPreviewRows] = useState<string[][]>([]);
  const [importErrors, setImportErrors] = useState<string[]>([]);
  const [isParsingFile, setParsingFile] = useState(false);
  const [customerLookup, setCustomerLookup] = useState('');

  const exportForm = useForm<ExportFormValues>({
    resolver: zodResolver(exportFormSchema),
    defaultValues: {
      format: 'CSV',
      entities: ['CUSTOMERS'],
      dateRange: { start: '', end: '' },
    },
  });

  const pollExportStatus = useCallback(
    (jobId: string) => {
      if (pollers.current[jobId]) {
        return;
      }

      const intervalId = window.setInterval(async () => {
        try {
          const response = await apiRequest(`/api/settings/export-data/${encodeURIComponent(jobId)}/status`);
          const json = (await response.json()) as unknown;
          const parsed = exportJobStatusSchema.safeParse(json);

          if (!parsed.success) {
            return;
          }

          const status = parsed.data;
          setExportJobs((jobs) =>
            jobs.map((job) => (job.jobId === jobId ? { ...job, ...status } : job)),
          );

          if (status.status === 'COMPLETED' || status.status === 'FAILED') {
            window.clearInterval(intervalId);
            delete pollers.current[jobId];
            if (status.status === 'COMPLETED') {
              toast({ title: 'Export ready', description: 'Your export file is ready to download.' });
            } else {
              toast({
                title: 'Export failed',
                description: status.message ?? 'The export job did not complete successfully.',
                variant: 'destructive',
              });
            }
          }
        } catch (error) {
          window.clearInterval(intervalId);
          delete pollers.current[jobId];
          console.error('Failed to poll export status', error);
        }
      }, 4000);

      pollers.current[jobId] = intervalId;
    },
    [toast],
  );

  useEffect(() => {
    return () => {
      Object.values(pollers.current).forEach((intervalId) => window.clearInterval(intervalId));
    };
  }, []);

  const availableColumns = datasetFieldOptions[importDataset] ?? [];
  const requiredColumns = availableColumns.filter((column) => column.required);

  const backups = historyQuery.data ?? [];
  const gdprRequests = gdprRequestsQuery.data ?? [];

  const handleFileSelection = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) {
      return;
    }

    const file = fileList[0];
    setImportErrors([]);
    setParsingFile(true);

    try {
      const parsed = await parseImportFile(file);
      const autoMappings = buildAutoMappings(parsed.headers, importDataset);
      setColumnMappings(autoMappings);
      setImportHeaders(parsed.headers);
      setPreviewRows(parsed.previewRows);
      setImportFile(file);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to parse uploaded file.';
      setImportErrors([message]);
      setImportFile(null);
      setPreviewRows([]);
      setColumnMappings({});
      setImportHeaders([]);
    } finally {
      setParsingFile(false);
    }
  };

  useEffect(() => {
    if (!importHeaders.length) {
      return;
    }

    const autoMappings = buildAutoMappings(importHeaders, importDataset);
    setColumnMappings((previous) => {
      if (Object.keys(previous).length === 0) {
        return autoMappings;
      }

      const validTargets = new Set((datasetFieldOptions[importDataset] ?? []).map((field) => field.value));
      const next: Record<string, string> = {};

      importHeaders.forEach((header) => {
        const existing = previous[header];
        if (existing && validTargets.has(existing)) {
          next[header] = existing;
        } else if (autoMappings[header]) {
          next[header] = autoMappings[header];
        } else {
          next[header] = '';
        }
      });

      return next;
    });
  }, [importDataset, importHeaders]);

  const validateImport = (): boolean => {
    const errors: string[] = [];
    if (!importFile) {
      errors.push('Upload a CSV or Excel file to import.');
    }

    const mappedValues = Object.values(columnMappings).filter((value) => value);
    if (!mappedValues.length) {
      errors.push('Map at least one column to a system field.');
    }

    requiredColumns.forEach((column) => {
      if (!mappedValues.includes(column.value)) {
        errors.push(`Map required field: ${column.label}.`);
      }
    });

    setImportErrors(errors);
    return errors.length === 0;
  };

  const importMutation = useMutation({
    mutationFn: async () => {
      if (!importFile) {
        throw new Error('Select a file to import.');
      }

      const payloadMappings = Object.entries(columnMappings).reduce<Record<string, string>>((acc, [source, target]) => {
        if (target) {
          acc[source] = target;
        }
        return acc;
      }, {});

      const formData = new FormData();
      formData.append('dataset', importDataset);
      formData.append('mappings', JSON.stringify(payloadMappings));
      formData.append('file', importFile);

      const response = await fetch('/api/settings/import-data', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || 'Import failed');
      }

      return (await response.json()) as { message?: string };
    },
    onSuccess: (result) => {
      toast({
        title: 'Import started',
        description: result?.message ?? 'Your import is being processed in the background.',
      });
      setImportFile(null);
      setPreviewRows([]);
      setColumnMappings({});
      setImportErrors([]);
      setImportHeaders([]);
    },
    onError: (error: unknown) => {
      const message = error instanceof Error ? error.message : 'Unable to import data.';
      toast({ title: 'Import failed', description: message, variant: 'destructive' });
    },
  });

  if (query.isLoading) {
    return <Skeleton className="h-[720px] w-full" />;
  }

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
              name="backup.autoBackupEnabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={(value) => field.onChange(value)}
                  label="Enable automatic backups"
                  description="Run scheduled backups according to the configured schedule."
                />
              )}
            />
            <FormField
              control={form.control}
              name="backup.schedule"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backup Schedule</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {backupScheduleOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {backupScheduleLabels[option]}
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
              name="backup.retentionDays"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Retention Period</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {backupRetentionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {backupRetentionLabels[option]}
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
              name="backup.storage.bucket"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>S3 Bucket Name</FormLabel>
                  <FormControl>
                    <Input placeholder="autolytiq-production-backups" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backup.storage.region"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Region</FormLabel>
                  <FormControl>
                    <Input placeholder="us-east-1" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backup.storage.accessKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Access Key</FormLabel>
                  <FormControl>
                    <Input placeholder="AKIA..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backup.storage.secretKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Secret Key</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => triggerBackupMutation.mutate()}
              disabled={triggerBackupMutation.isPending}
            >
              {triggerBackupMutation.isPending ? 'Starting…' : 'Run Manual Backup'}
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Saving…' : 'Save Data Settings'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Backup History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {historyQuery.isLoading ? (
              <Skeleton className="h-48 w-full" />
            ) : backups.length === 0 ? (
              <p className="text-sm text-muted-foreground">No backups have been generated yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {backups.map((backup) => (
                      <TableRow key={backup.id}>
                        <TableCell>{new Date(backup.createdAt).toLocaleString()}</TableCell>
                        <TableCell>{formatBytes(backup.sizeBytes)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{backup.type === 'AUTO' ? 'Automated' : 'Manual'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={backup.status === 'COMPLETED' ? 'secondary' : backup.status === 'FAILED' ? 'destructive' : 'outline'}
                          >
                            {backup.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const href = backup.downloadUrl ?? `/api/settings/backup/download/${encodeURIComponent(backup.id)}`;
                                window.open(href, '_blank');
                              }}
                            >
                              Download
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setRestoreTarget(backup)}
                            >
                              Restore
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Export Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Form {...exportForm}>
              <form
                onSubmit={exportForm.handleSubmit((values) => {
                  const payload: ExportRequestPayload = {
                    format: values.format,
                    entities: values.entities,
                    dateRange: values.dateRange.start && values.dateRange.end ? values.dateRange : null,
                  };
                  exportMutation.mutate(payload);
                })}
                className="grid gap-4 md:grid-cols-2"
              >
                <FormField
                  control={exportForm.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Export Format</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select format" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {dataExportFormats.map((format) => (
                            <SelectItem key={format} value={format}>
                              {exportFormatLabels[format]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={exportForm.control}
                  name="entities"
                  render={({ field }) => {
                    const value = Array.isArray(field.value)
                      ? (field.value as DataExportEntity[])
                      : [];
                    return (
                      <FormItem className="md:col-span-2">
                        <FormLabel>Select Data Sets</FormLabel>
                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                          {dataExportEntities.map((entity) => {
                            const checked = value.includes(entity);
                            return (
                              <label
                                key={entity}
                                className="flex cursor-pointer items-center gap-2 rounded-md border border-border bg-card px-3 py-2"
                              >
                                <Checkbox
                                  checked={checked}
                                  onCheckedChange={() => {
                                    const next = checked
                                      ? value.filter((item) => item !== entity)
                                      : [...value, entity];
                                    field.onChange(next);
                                  }}
                                />
                                <span className="text-sm font-medium text-foreground">{datasetLabels[entity]}</span>
                              </label>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
                <div className="flex flex-col gap-2">
                  <FormLabel htmlFor="export-start">Start Date</FormLabel>
                  <FormField
                    control={exportForm.control}
                    name="dateRange.start"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input id="export-start" type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <FormLabel htmlFor="export-end">End Date</FormLabel>
                  <FormField
                    control={exportForm.control}
                    name="dateRange.end"
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input id="export-end" type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" disabled={exportMutation.isPending}>
                    {exportMutation.isPending ? 'Preparing…' : 'Start Export'}
                  </Button>
                </div>
              </form>
            </Form>

            {exportJobs.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Recent export jobs</h3>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Job</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Requested</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {exportJobs.map((job) => (
                        <TableRow key={job.jobId}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{job.label ?? 'Data export'}</span>
                              <span className="text-xs text-muted-foreground">
                                {exportFormatLabels[job.format]} • {job.entities.map((entity) => datasetLabels[entity]).join(', ')}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                job.status === 'COMPLETED'
                                  ? 'secondary'
                                  : job.status === 'FAILED'
                                  ? 'destructive'
                                  : 'outline'
                              }
                            >
                              {job.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {job.requestedAt
                              ? new Date(job.requestedAt).toLocaleString()
                              : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={job.status !== 'COMPLETED'}
                              onClick={() => {
                                const href = job.downloadUrl ?? `/api/settings/export-data/${encodeURIComponent(job.jobId)}/download`;
                                window.open(href, '_blank');
                              }}
                            >
                              Download
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Import Data</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <FormLabel>Data Set</FormLabel>
                <Select
                  value={importDataset}
                  onValueChange={(value: DataExportEntity) => {
                    setImportDataset(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select data set" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataExportEntities.map((entity) => (
                      <SelectItem key={entity} value={entity}>
                        {datasetLabels[entity]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="import-file">Upload File</FormLabel>
                <Input
                  id="import-file"
                  type="file"
                  accept=".csv,.tsv,.xls,.xlsx"
                  onChange={(event) => void handleFileSelection(event.target.files)}
                  disabled={isParsingFile}
                />
                <p className="text-xs text-muted-foreground">
                  Accepts CSV or Excel files. Include a header row for column mapping.
                </p>
              </div>
            </div>

            {importErrors.length > 0 ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-destructive">
                {importErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : null}

            {Object.keys(columnMappings).length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Column Mapping</h3>
                <div className="overflow-x-auto rounded-md border border-dashed border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source Column</TableHead>
                        <TableHead>Maps To</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Object.keys(columnMappings).map((column) => (
                        <TableRow key={column}>
                          <TableCell className="font-medium text-foreground">{column}</TableCell>
                          <TableCell>
                            <Select
                              value={columnMappings[column] ?? ''}
                              onValueChange={(value) =>
                                setColumnMappings((previous) => ({
                                  ...previous,
                                  [column]: value,
                                }))
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Skip column" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">Do not import</SelectItem>
                                {availableColumns.map((field) => (
                                  <SelectItem key={field.value} value={field.value}>
                                    {field.label}
                                    {field.required ? ' *' : ''}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : null}

            {previewRows.length > 0 ? (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-muted-foreground">Validation Preview</h3>
                <div className="overflow-x-auto rounded-md border border-border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {Object.keys(columnMappings).map((column) => (
                          <TableHead key={column}>{column}</TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewRows.map((row, rowIndex) => (
                        <TableRow key={`preview-${rowIndex}`}>
                          {row.map((value, columnIndex) => {
                            const header = Object.keys(columnMappings)[columnIndex];
                            const mappedField = columnMappings[header];
                            const isRequired = mappedField
                              ? availableColumns.find((column) => column.value === mappedField)?.required
                              : false;
                            const isEmpty = !value && isRequired;
                            return (
                              <TableCell
                                key={`${rowIndex}-${columnIndex}`}
                                className={isEmpty ? 'bg-destructive/10 text-destructive' : ''}
                              >
                                {value || '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                <p className="text-xs text-muted-foreground">
                  Required fields marked with * must contain data. Empty required values are highlighted in red.
                </p>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button
              type="button"
              onClick={() => {
                if (!validateImport()) {
                  return;
                }
                importMutation.mutate();
              }}
              disabled={importMutation.isPending || isParsingFile}
            >
              {importMutation.isPending ? 'Importing…' : 'Import Data'}
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Data Retention Policies</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="retention.customer"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer Data</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {customerRetentionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {customerRetentionLabels[option]}
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
              name="retention.lead"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lead Data</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {leadRetentionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {leadRetentionLabels[option]}
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
              name="retention.analytics"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Analytics Data</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select retention" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {analyticsRetentionOptions.map((option) => (
                        <SelectItem key={option} value={option}>
                          {analyticsRetentionLabels[option]}
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
              name="retention.autoPurgeEnabled"
              render={({ field }) => (
                <ToggleSwitch
                  enabled={field.value}
                  onChange={(value) => field.onChange(value)}
                  label="Automatically purge expired records"
                  description="Records exceeding the configured retention period will be removed automatically."
                />
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">GDPR & Privacy</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <Input
                placeholder="Search by customer ID or email"
                value={customerLookup}
                onChange={(event) => setCustomerLookup(event.target.value)}
                className="max-w-sm"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  if (!customerLookup.trim()) {
                    toast({
                      title: 'Provide a customer identifier',
                      description: 'Enter a customer ID or email address to continue.',
                      variant: 'destructive',
                    });
                    return;
                  }

                  deleteCustomerMutation.mutate(customerLookup.trim());
                }}
                disabled={deleteCustomerMutation.isPending}
              >
                {deleteCustomerMutation.isPending ? 'Submitting…' : 'Delete Customer Data'}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  if (!customerLookup.trim()) {
                    toast({
                      title: 'Provide a customer identifier',
                      description: 'Enter a customer ID or email address to continue.',
                      variant: 'destructive',
                    });
                    return;
                  }

                  exportMutation.mutate({
                    format: 'JSON',
                    entities: ['CUSTOMERS'],
                    filters: { customerId: customerLookup.trim() },
                    label: `Customer export (${customerLookup.trim()})`,
                  });
                }}
                disabled={exportMutation.isPending}
              >
                {exportMutation.isPending ? 'Queuing…' : 'Export Customer Data'}
              </Button>
            </div>

            {gdprRequestsQuery.isLoading ? (
              <Skeleton className="h-40 w-full" />
            ) : gdprRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground">No GDPR deletion requests have been submitted.</p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Requested</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gdprRequests.map((request) => (
                      <TableRow key={request.id}>
                        <TableCell>{new Date(request.requestedAt).toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{request.customerName}</span>
                            <span className="text-xs text-muted-foreground">{request.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{request.type === 'DELETE' ? 'Deletion' : 'Export'}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              request.status === 'COMPLETED'
                                ? 'secondary'
                                : request.status === 'DECLINED'
                                ? 'destructive'
                                : 'outline'
                            }
                          >
                            {request.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                          {request.notes ?? '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
      <AlertDialog open={restoreTarget !== null} onOpenChange={(open) => !open && setRestoreTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore backup</AlertDialogTitle>
            <AlertDialogDescription>
              Restoring a backup will overwrite current data with the snapshot from{' '}
              {restoreTarget ? new Date(restoreTarget.createdAt).toLocaleString() : 'the selected backup'}. This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restoreBackupMutation.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (!restoreTarget) {
                  return;
                }
                restoreBackupMutation.mutate(restoreTarget.id);
                setRestoreTarget(null);
              }}
              disabled={restoreBackupMutation.isPending}
            >
              {restoreBackupMutation.isPending ? 'Restoring…' : 'Confirm Restore'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}

export default DataSettings;

