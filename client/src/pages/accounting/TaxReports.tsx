import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import AccountingLayout from './AccountingLayout';
import { createTaxReportRequest, fetchTaxReports } from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const TAX_TYPES = [
  { label: 'Sales Tax', value: 'SALES_TAX' },
  { label: 'Payroll Tax', value: 'PAYROLL_TAX' },
  { label: 'Income Tax', value: 'INCOME_TAX' },
];

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

interface TaxReportFormValues {
  type: string;
  periodStart: string;
  periodEnd: string;
  jurisdiction: string;
  recipients: string;
}

function parseRecipients(value: string): string[] {
  return value
    .split(',')
    .map((recipient) => recipient.trim())
    .filter(Boolean);
}

export default function TaxReports() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const form = useForm<TaxReportFormValues>({
    defaultValues: {
      type: 'SALES_TAX',
      periodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      periodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      jurisdiction: '',
      recipients: '',
    },
  });

  const { control, handleSubmit, register, reset } = form;

  const { data: reports, isLoading } = useQuery({
    queryKey: ['accounting', 'tax-reports'],
    queryFn: () => fetchTaxReports(),
  });

  const createMutation = useMutation({
    mutationFn: createTaxReportRequest,
    onSuccess: (report) => {
      toast({ title: 'Tax report generated', description: `${report.type.replace('_', ' ')} • ${currency.format(report.totalTax)}` });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'tax-reports'] });
      reset({
        type: report.type,
        periodStart: format(new Date(report.periodStart), 'yyyy-MM-dd'),
        periodEnd: format(new Date(report.periodEnd), 'yyyy-MM-dd'),
        jurisdiction: report.jurisdiction,
        recipients: '',
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to create report',
        description: error instanceof Error ? error.message : 'Please verify the reporting period and try again.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!values.jurisdiction.trim()) {
      toast({ title: 'Jurisdiction required', description: 'Provide a tax jurisdiction or authority name.', variant: 'destructive' });
      return;
    }
    createMutation.mutate({
      type: values.type,
      periodStart: new Date(values.periodStart).toISOString(),
      periodEnd: new Date(values.periodEnd).toISOString(),
      jurisdiction: values.jurisdiction.trim(),
      recipients: parseRecipients(values.recipients),
    });
  });

  const sortedReports = useMemo(() => {
    return (reports ?? []).slice().sort((a, b) => new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime());
  }, [reports]);

  return (
    <AccountingLayout>
      <StatementHeader title="Tax Reports" />

      <div className="grid gap-6 lg:grid-cols-[1fr,1.2fr]">
        <Card>
          <CardHeader>
            <CardTitle>Generate tax report</CardTitle>
            <CardDescription>Calculate sales, payroll, or income tax obligations and optionally email stakeholders.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Report type</label>
                <Controller
                  control={control}
                  name="type"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose tax type" />
                      </SelectTrigger>
                      <SelectContent>
                        {TAX_TYPES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="periodStart">
                    Period start
                  </label>
                  <Input id="periodStart" type="date" {...register('periodStart')} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground" htmlFor="periodEnd">
                    Period end
                  </label>
                  <Input id="periodEnd" type="date" {...register('periodEnd')} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="jurisdiction">
                  Jurisdiction / Authority
                </label>
                <Input id="jurisdiction" placeholder="State of California" {...register('jurisdiction')} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="recipients">
                  Email recipients (comma separated)
                </label>
                <Textarea id="recipients" rows={3} placeholder="cfo@example.com, controller@example.com" {...register('recipients')} />
              </div>

              <div className="flex items-center justify-end gap-2">
                <Button type="submit" disabled={createMutation.isLoading}>
                  {createMutation.isLoading ? 'Generating…' : 'Generate report'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent reports</CardTitle>
            <CardDescription>Historical tax filings, generated with tenant-level isolation and audit logging.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-6">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : sortedReports.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Type</TableHead>
                      <TableHead className="w-[160px]">Jurisdiction</TableHead>
                      <TableHead className="w-[160px]">Period</TableHead>
                      <TableHead className="text-right">Total Tax</TableHead>
                      <TableHead className="w-[160px]">Recipients</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.type.replace('_', ' ')}</TableCell>
                        <TableCell>{report.jurisdiction}</TableCell>
                        <TableCell>
                          {format(new Date(report.periodStart), 'MMM d')} – {format(new Date(report.periodEnd), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-right font-semibold">{currency.format(report.totalTax)}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {report.emailedTo.length > 0 ? report.emailedTo.join(', ') : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="p-6 text-sm text-muted-foreground">No tax reports generated yet. Use the form to calculate liabilities.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
