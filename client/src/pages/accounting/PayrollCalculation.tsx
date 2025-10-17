import { useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { startOfMonth, endOfMonth, format } from 'date-fns';
import { useLocation } from 'wouter';
import AccountingLayout from './AccountingLayout';
import {
  fetchAccounts,
  previewPayrollRequest,
  finalizePayrollRequest,
  type PayrollPreview,
  type AccountNode,
} from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

interface CommissionTierForm {
  threshold: number;
  rate: number;
}

interface RateEntryForm {
  name: string;
  rate: number;
}

interface AmountEntryForm {
  userId: string;
  amount: number;
}

interface PayrollFormValues {
  periodStart: string;
  periodEnd: string;
  employerTaxRate: number;
  commissionTiers: CommissionTierForm[];
  deductionRates: RateEntryForm[];
  basePay: AmountEntryForm[];
  adjustments: AmountEntryForm[];
  additionalDeductions: AmountEntryForm[];
  approve: boolean;
  cashAccountId: string;
}

function flattenAccounts(accounts: AccountNode[]): AccountNode[] {
  const stack = [...accounts];
  const list: AccountNode[] = [];
  while (stack.length) {
    const node = stack.shift()!;
    list.push(node);
    if (node.children?.length) stack.push(...node.children);
  }
  return list;
}

export default function PayrollCalculation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [preview, setPreview] = useState<PayrollPreview | null>(null);

  const form = useForm<PayrollFormValues>({
    defaultValues: {
      periodStart: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
      periodEnd: format(endOfMonth(new Date()), 'yyyy-MM-dd'),
      employerTaxRate: 7.65,
      commissionTiers: [
        { threshold: 0, rate: 3 },
        { threshold: 50000, rate: 4.5 },
      ],
      deductionRates: [
        { name: 'Federal', rate: 20 },
        { name: 'State', rate: 4 },
      ],
      basePay: [],
      adjustments: [],
      additionalDeductions: [],
      approve: true,
      cashAccountId: '',
    },
  });

  const { control, handleSubmit, register, watch, resetField } = form;
  const periodStartField = register('periodStart');
  const periodEndField = register('periodEnd');
  const employerTaxField = register('employerTaxRate', { valueAsNumber: true });
  const commissionArray = useFieldArray({ control, name: 'commissionTiers' });
  const deductionArray = useFieldArray({ control, name: 'deductionRates' });
  const basePayArray = useFieldArray({ control, name: 'basePay' });
  const adjustmentsArray = useFieldArray({ control, name: 'adjustments' });
  const deductionAdjustArray = useFieldArray({ control, name: 'additionalDeductions' });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const flattenedAccounts = useMemo(() => flattenAccounts(accounts ?? []), [accounts]);
  const cashAccounts = useMemo(
    () =>
      flattenedAccounts.filter((account) =>
        /cash|bank|checking|payroll/i.test(`${account.accountName} ${account.accountNumber}`),
      ),
    [flattenedAccounts],
  );

  const previewMutation = useMutation({
    mutationFn: previewPayrollRequest,
    onSuccess: (data) => {
      setPreview(data);
      toast({ title: 'Payroll preview ready', description: `Net payroll ${currency.format(data.totals.net)}` });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to preview payroll',
        description: error instanceof Error ? error.message : 'Check your payroll configuration and try again.',
        variant: 'destructive',
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: finalizePayrollRequest,
    onSuccess: (payload) => {
      toast({
        title: 'Payroll finalized',
        description: `Payroll ${payload.id} processed. Journal entry ${payload.journalEntryId ?? 'pending'}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'payrolls'] });
      navigate('/accounting/payroll');
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to finalize payroll',
        description: error instanceof Error ? error.message : 'Please resolve validation issues and try again.',
        variant: 'destructive',
      });
    },
  });

  const transformValues = (values: PayrollFormValues) => {
    const tiers = values.commissionTiers
      .filter((tier) => !Number.isNaN(tier.threshold) && !Number.isNaN(tier.rate))
      .map((tier) => ({ threshold: Number(tier.threshold), rate: Number(tier.rate) / 100 }))
      .sort((a, b) => a.threshold - b.threshold);

    const deductionRates = values.deductionRates.reduce<Record<string, number>>((acc, item) => {
      if (item.name && !Number.isNaN(item.rate)) {
        acc[item.name] = Number(item.rate) / 100;
      }
      return acc;
    }, {});

    const toAmountMap = (entries: AmountEntryForm[]) =>
      entries.reduce<Record<string, number>>((acc, item) => {
        if (item.userId && !Number.isNaN(item.amount)) {
          acc[item.userId] = Number(item.amount);
        }
        return acc;
      }, {});

    return {
      periodStart: new Date(values.periodStart).toISOString(),
      periodEnd: new Date(values.periodEnd).toISOString(),
      commissionTiers: tiers,
      deductionRates,
      employerTaxRate: Number(values.employerTaxRate) / 100,
      basePay: toAmountMap(values.basePay),
      adjustments: toAmountMap(values.adjustments),
      additionalDeductions: toAmountMap(values.additionalDeductions),
    };
  };

  const submitPreview = handleSubmit((values) => {
    const payload = transformValues(values);
    previewMutation.mutate(payload);
  });

  const submitFinalize = handleSubmit((values) => {
    if (!preview) {
      toast({
        title: 'Preview required',
        description: 'Generate a payroll preview before finalizing.',
        variant: 'destructive',
      });
      return;
    }
    if (!values.cashAccountId) {
      toast({
        title: 'Cash account required',
        description: 'Select the cash or payroll account to credit when posting the payroll.',
        variant: 'destructive',
      });
      return;
    }
    const basePayload = transformValues(values);
    finalizeMutation.mutate({
      ...basePayload,
      approve: values.approve,
      cashAccountId: values.cashAccountId,
    });
  });

  if (accountsLoading) {
    return (
      <AccountingLayout>
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-80" />
      </AccountingLayout>
    );
  }

  return (
    <AccountingLayout>
      <StatementHeader title="Payroll Calculation" />

      <div className="grid gap-6 lg:grid-cols-[1.4fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Payroll Parameters</CardTitle>
            <CardDescription>Configure commission tiers, deduction rates, and adjustments for this payroll cycle.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="periodStart">
                  Period start
                </label>
                <Input
                  id="periodStart"
                  type="date"
                  {...periodStartField}
                  onChange={(event) => {
                    periodStartField.onChange(event);
                    const currentEnd = watch('periodEnd');
                    if (currentEnd && new Date(event.target.value) > new Date(currentEnd)) {
                      resetField('periodEnd');
                    }
                  }}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="periodEnd">
                  Period end
                </label>
                <Input id="periodEnd" type="date" {...periodEndField} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="employerTaxRate">
                  Employer tax rate (%)
                </label>
                <Input id="employerTaxRate" type="number" step="0.01" min="0" {...employerTaxField} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Cash account</label>
                <Controller
                  control={control}
                  name="cashAccountId"
                  render={({ field }) => (
                    <Select value={field.value} onValueChange={field.onChange}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select cash/bank account" />
                      </SelectTrigger>
                      <SelectContent>
                        {cashAccounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            <span className="font-mono text-xs text-muted-foreground">{account.accountNumber}</span>{' '}
                            {account.accountName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Commission tiers</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => commissionArray.append({ threshold: 0, rate: 0 })}>
                  Add tier
                </Button>
              </div>
              <div className="space-y-2">
                {commissionArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Threshold ($)</label>
                      <Input type="number" step="100" min="0" {...register(`commissionTiers.${index}.threshold`, { valueAsNumber: true })} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Rate (%)</label>
                      <Input type="number" step="0.01" min="0" {...register(`commissionTiers.${index}.rate`, { valueAsNumber: true })} />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => commissionArray.remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Withholding rates</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => deductionArray.append({ name: '', rate: 0 })}>
                  Add rate
                </Button>
              </div>
              <div className="space-y-2">
                {deductionArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Name</label>
                      <Input placeholder="Federal" {...register(`deductionRates.${index}.name`)} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Rate (%)</label>
                      <Input type="number" step="0.01" min="0" {...register(`deductionRates.${index}.rate`, { valueAsNumber: true })} />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => deductionArray.remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Base pay</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => basePayArray.append({ userId: '', amount: 0 })}>
                  Add employee
                </Button>
              </div>
              <div className="space-y-2">
                {basePayArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">User ID</label>
                      <Input placeholder="user_123" {...register(`basePay.${index}.userId`)} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Amount ($)</label>
                      <Input type="number" step="0.01" min="0" {...register(`basePay.${index}.amount`, { valueAsNumber: true })} />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => basePayArray.remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Adjustments</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => adjustmentsArray.append({ userId: '', amount: 0 })}>
                  Add adjustment
                </Button>
              </div>
              <div className="space-y-2">
                {adjustmentsArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">User ID</label>
                      <Input placeholder="user_123" {...register(`adjustments.${index}.userId`)} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Amount ($)</label>
                      <Input type="number" step="0.01" {...register(`adjustments.${index}.amount`, { valueAsNumber: true })} />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => adjustmentsArray.remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Additional deductions</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => deductionAdjustArray.append({ userId: '', amount: 0 })}>
                  Add deduction
                </Button>
              </div>
              <div className="space-y-2">
                {deductionAdjustArray.fields.map((field, index) => (
                  <div key={field.id} className="grid gap-2 rounded-lg border p-3 md:grid-cols-5">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">User ID</label>
                      <Input placeholder="user_123" {...register(`additionalDeductions.${index}.userId`)} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-medium uppercase text-muted-foreground">Amount ($)</label>
                      <Input type="number" step="0.01" {...register(`additionalDeductions.${index}.amount`, { valueAsNumber: true })} />
                    </div>
                    <div className="flex items-end justify-end">
                      <Button type="button" variant="ghost" size="sm" onClick={() => deductionAdjustArray.remove(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
              <div>
                <p className="text-sm font-medium text-foreground">Approve payroll immediately</p>
                <p className="text-xs text-muted-foreground">
                  Approved payrolls create posted journal entries and mark commissions as paid.
                </p>
              </div>
              <Controller
                control={control}
                name="approve"
                render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>

            <div className="flex items-center justify-end gap-3">
              <Button type="button" variant="outline" onClick={submitPreview} disabled={previewMutation.isLoading}>
                {previewMutation.isLoading ? 'Calculating…' : 'Preview Payroll'}
              </Button>
              <Button type="button" onClick={submitFinalize} disabled={finalizeMutation.isLoading}>
                {finalizeMutation.isLoading ? 'Finalizing…' : 'Finalize & Post'}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader>
            <CardTitle>Preview Summary</CardTitle>
            <CardDescription>Payroll totals, net pay, and per-employee drill-down for validation.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {preview ? (
              <>
                <div className="rounded-lg border bg-muted/30 p-4 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total gross</span>
                    <span className="font-semibold">{currency.format(preview.totals.gross)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total net</span>
                    <span className="font-semibold">{currency.format(preview.totals.net)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Employee withholding</span>
                    <span className="font-semibold">{currency.format(preview.totals.employeeWithholding)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Employer taxes</span>
                    <span className="font-semibold">{currency.format(preview.totals.employerTaxes)}</span>
                  </div>
                </div>
                <div className="max-h-[420px] overflow-y-auto rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Employee</TableHead>
                        <TableHead className="text-right">Gross</TableHead>
                        <TableHead className="text-right">Commissions</TableHead>
                        <TableHead className="text-right">Net</TableHead>
                        <TableHead className="text-right">Withholding</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {preview.lines.map((line) => (
                        <TableRow key={line.userId}>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{line.userName}</span>
                              <span className="text-xs text-muted-foreground">{line.userId}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right">{currency.format(line.grossPay)}</TableCell>
                          <TableCell className="text-right">
                            {currency.format(line.commissionTotal + line.commissionBonus)}
                          </TableCell>
                          <TableCell className="text-right">{currency.format(line.netPay)}</TableCell>
                          <TableCell className="text-right">{currency.format(line.withholding)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Generate a preview to review payroll totals before posting.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
