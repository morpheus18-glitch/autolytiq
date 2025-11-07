import { useEffect, useMemo, useState } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { ChevronsUpDown, Loader2, Plus, Trash2 } from 'lucide-react';
import { useLocation, useRoute } from 'react-router-dom';
import AccountingLayout from './AccountingLayout';
import { StatementHeader } from '@/components/accounting/StatementHeader.tsx';
import { Button } from '@repo/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Input } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Switch } from '@repo/ui';
import { Label } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@repo/ui';
import { cn } from '@/lib/utils';
import { Skeleton } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import {
  fetchAccounts,
  fetchJournalEntry,
  createJournalEntryRequest,
  updateJournalEntryRequest,
  postJournalEntryRequest,
  type AccountNode,
  type JournalEntryResponse,
  type JournalEntryType,
  type UpsertJournalEntryPayload,
} from '@/lib/accountingApi';

interface JournalEntryLineFormValue {
  id?: string;
  accountId: string;
  debit?: number | null;
  credit?: number | null;
  memo?: string;
}

interface JournalEntryFormValues {
  date: string;
  type: JournalEntryType;
  description: string;
  memo?: string;
  dealId?: string;
  isRecurring: boolean;
  recurringFrequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | '';
  recurringStartDate?: string;
  recurringEndDate?: string;
  lines: JournalEntryLineFormValue[];
}

const ENTRY_TYPE_OPTIONS: Array<{ label: string; value: JournalEntryType }> = [
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Auto-Deal', value: 'AUTO_DEAL' },
  { label: 'Auto-Payment', value: 'AUTO_PAYMENT' },
  { label: 'Adjustment', value: 'ADJUSTMENT' },
  { label: 'Recurring', value: 'RECURRING' },
  { label: 'Reclassification', value: 'RECLASSIFICATION' },
];

const RECURRING_FREQUENCY_OPTIONS = [
  { label: 'Monthly', value: 'MONTHLY' },
  { label: 'Quarterly', value: 'QUARTERLY' },
  { label: 'Yearly', value: 'YEARLY' },
];

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

function flattenAccounts(accounts: AccountNode[] | undefined): AccountNode[] {
  if (!accounts) return [];
  const list: AccountNode[] = [];
  const stack = [...accounts];
  while (stack.length) {
    const node = stack.shift()!;
    list.push(node);
    if (node.children?.length) {
      stack.push(...node.children);
    }
  }
  return list;
}

interface AccountSelectProps {
  value: string;
  onChange: (value: string) => void;
  accounts: AccountNode[];
  disabled?: boolean;
}

function AccountSelect({ value, onChange, accounts, disabled }: AccountSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = accounts.find((account) => account.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          className="w-full justify-between"
          disabled={disabled}
        >
          {selected ? (
            <div className="flex flex-col items-start text-left">
              <span className="text-sm font-medium text-foreground">{selected.accountNumber}</span>
              <span className="text-xs text-muted-foreground">{selected.accountName}</span>
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Select account</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search accounts" />
          <CommandList>
            <CommandEmpty>No account found.</CommandEmpty>
            <CommandGroup>
              {accounts.map((account) => (
                <CommandItem
                  key={account.id}
                  value={`${account.accountNumber} ${account.accountName}`}
                  onSelect={() => {
                    onChange(account.id);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">{account.accountNumber}</span>
                    <span className="text-xs text-muted-foreground">{account.accountName}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

interface JournalEntryFormContainerProps {
  mode: 'create' | 'edit' | 'view';
  entryId?: string;
  onCancel?: () => void;
  onSuccess?: (entry: JournalEntryResponse, intent: 'draft' | 'post') => void;
  onEntryLoaded?: (entry: JournalEntryResponse) => void;
}

function sanitizeLine(line: JournalEntryLineFormValue): { accountId: string; debit?: number | null; credit?: number | null; memo?: string | null } {
  const debit = Number(line.debit ?? 0);
  const credit = Number(line.credit ?? 0);
  return {
    accountId: line.accountId,
    debit: debit > 0 ? Number(debit.toFixed(2)) : null,
    credit: credit > 0 ? Number(credit.toFixed(2)) : null,
    memo: line.memo?.trim() ? line.memo.trim() : null,
  };
}

export function JournalEntryFormContainer({ mode, entryId, onCancel, onSuccess, onEntryLoaded }: JournalEntryFormContainerProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: accountsData, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const flattenedAccounts = useMemo(() => flattenAccounts(accountsData), [accountsData]);

  const { data: entryData, isLoading: entryLoading } = useQuery({
    queryKey: ['accounting', 'journal-entry', entryId],
    queryFn: () => fetchJournalEntry(entryId!),
    enabled: Boolean(entryId),
  });

  useEffect(() => {
    if (entryData) {
      onEntryLoaded?.(entryData);
    }
  }, [entryData, onEntryLoaded]);

  const defaultValues: JournalEntryFormValues = useMemo(
    () => ({
      date: format(new Date(), 'yyyy-MM-dd'),
      type: 'MANUAL',
      description: '',
      memo: '',
      dealId: '',
      isRecurring: false,
      recurringFrequency: '',
      recurringStartDate: '',
      recurringEndDate: '',
      lines: [
        { accountId: '', debit: null, credit: null, memo: '' },
        { accountId: '', debit: null, credit: null, memo: '' },
      ],
    }),
    [],
  );

  const form = useForm<JournalEntryFormValues>({
    defaultValues,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState,
    watch,
    setValue,
  } = form;

  const { fields, append, remove } = useFieldArray({ name: 'lines', control });

  useEffect(() => {
    if (entryData) {
      const entry = entryData;
      reset({
        date: format(new Date(entry.date), 'yyyy-MM-dd'),
        type: entry.type,
        description: entry.description ?? '',
        memo: entry.memo ?? '',
        dealId: entry.dealId ?? '',
        isRecurring: entry.isRecurring,
        recurringFrequency: entry.recurringFrequency ?? '',
        recurringStartDate: entry.recurringStartDate ? format(new Date(entry.recurringStartDate), 'yyyy-MM-dd') : '',
        recurringEndDate: entry.recurringEndDate ? format(new Date(entry.recurringEndDate), 'yyyy-MM-dd') : '',
        lines:
          entry.lines.length > 0
            ? entry.lines.map((line) => ({
                id: line.id,
                accountId: line.accountId,
                debit: line.debit ?? null,
                credit: line.credit ?? null,
                memo: line.memo ?? '',
              }))
            : defaultValues.lines,
      });
    }
  }, [entryData, reset, defaultValues.lines]);

  const watchedLines = watch('lines');
  const totals = useMemo(() => {
    return watchedLines.reduce(
      (acc, line) => {
        const debit = Number(line.debit ?? 0);
        const credit = Number(line.credit ?? 0);
        if (debit > 0) {
          acc.debits += debit;
        }
        if (credit > 0) {
          acc.credits += credit;
        }
        return acc;
      },
      { debits: 0, credits: 0 },
    );
  }, [watchedLines]);

  const balanceDifference = useMemo(() => Math.abs(totals.debits - totals.credits), [totals]);
  const isBalanced = balanceDifference < 0.01;

  const createMutation = useMutation({
    mutationFn: createJournalEntryRequest,
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpsertJournalEntryPayload }) =>
      updateJournalEntryRequest(id, payload),
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => postJournalEntryRequest(id),
  });

  const onSubmit = async (values: JournalEntryFormValues, intent: 'draft' | 'post') => {
    if (!values.date) {
      toast({
        title: 'Posting date required',
        description: 'Select a posting date before saving the entry.',
        variant: 'destructive',
      });
      return;
    }

    const sanitizedLines = values.lines
      .map(sanitizeLine)
      .filter((line) => line.accountId && ((line.debit ?? 0) > 0 || (line.credit ?? 0) > 0));

    if (sanitizedLines.length < 2) {
      toast({
        title: 'Two lines required',
        description: 'Add at least one debit and one credit line.',
        variant: 'destructive',
      });
      return;
    }

    const invalidLine = sanitizedLines.find((line) => (line.debit ?? 0) > 0 && (line.credit ?? 0) > 0);
    if (invalidLine) {
      toast({
        title: 'Invalid line item',
        description: 'Each line must contain either a debit or a credit amount, not both.',
        variant: 'destructive',
      });
      return;
    }

    if (intent === 'post' && !isBalanced) {
      toast({
        title: 'Entry not balanced',
        description: 'Debits must equal credits before posting.',
        variant: 'destructive',
      });
      return;
    }

    const payload: UpsertJournalEntryPayload = {
      date: new Date(values.date).toISOString(),
      type: values.type,
      description: values.description?.trim() ?? '',
      memo: values.memo?.trim() ? values.memo.trim() : null,
      dealId: values.dealId?.trim() ? values.dealId.trim() : null,
      isRecurring: values.isRecurring,
      recurringFrequency: values.isRecurring ? (values.recurringFrequency || null) : null,
      recurringStartDate:
        values.isRecurring && values.recurringStartDate
          ? new Date(values.recurringStartDate).toISOString()
          : null,
      recurringEndDate:
        values.isRecurring && values.recurringEndDate ? new Date(values.recurringEndDate).toISOString() : null,
      status: 'DRAFT',
      lines: sanitizedLines,
    };

    try {
      let entry: JournalEntryResponse;
      if (mode === 'create') {
        entry = await createMutation.mutateAsync(payload);
      } else if (entryId) {
        entry = await updateMutation.mutateAsync({ id: entryId, payload });
      } else {
        throw new Error('Missing journal entry identifier');
      }

      if (intent === 'post') {
        entry = await postMutation.mutateAsync(entry.id);
      }

      toast({
        title: intent === 'post' ? 'Journal entry posted' : 'Journal entry saved',
        description:
          intent === 'post'
            ? 'Entry was validated and posted successfully.'
            : 'Draft entry stored successfully.',
      });

      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entry', entry.id] });
      onSuccess?.(entry, intent);
    } catch (error) {
      toast({
        title: 'Unable to save entry',
        description: error instanceof Error ? error.message : 'Unexpected error saving journal entry.',
        variant: 'destructive',
      });
    }
  };

  const submitDraft = handleSubmit((values) => onSubmit(values, 'draft'));
  const submitPost = handleSubmit((values) => onSubmit(values, 'post'));

  const isReadOnly = mode === 'view';
  const isProcessing = createMutation.isLoading || updateMutation.isLoading || postMutation.isLoading;

  if (accountsLoading || (entryId && entryLoading)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-80" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <form className="space-y-6" onSubmit={submitDraft}>
      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Entry Details</CardTitle>
            <CardDescription>Provide contextual information for financial audit trails.</CardDescription>
          </div>
          {entryData && (
            <Badge variant={entryData.status === 'POSTED' ? 'default' : entryData.status === 'VOID' ? 'destructive' : 'secondary'}>
              {entryData.status}
            </Badge>
          )}
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Posting Date</Label>
            <Input id="date" type="date" disabled={isReadOnly} {...form.register('date')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="type">Entry Type</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => field.onChange(value as JournalEntryType)}
                  disabled={isReadOnly}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ENTRY_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={3}
              disabled={isReadOnly}
              placeholder="Summarize the purpose of this entry"
              {...form.register('description')}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (optional)</Label>
            <Input id="memo" disabled={isReadOnly} placeholder="Optional memo" {...form.register('memo')} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="dealId">Linked Deal (optional)</Label>
            <Input id="dealId" disabled={isReadOnly} placeholder="deal_123" {...form.register('dealId')} />
          </div>
          <div className="flex items-center gap-3 rounded-lg border p-4 md:col-span-2">
            <Controller
              control={control}
              name="isRecurring"
              render={({ field }) => (
                <Switch
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked)}
                  disabled={isReadOnly}
                />
              )}
            />
            <div>
              <p className="text-sm font-medium text-foreground">Recurring Entry</p>
              <p className="text-xs text-muted-foreground">Enable to schedule this entry across future periods.</p>
            </div>
          </div>
          {watch('isRecurring') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="recurringFrequency">Frequency</Label>
                <Controller
                  control={control}
                  name="recurringFrequency"
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={(value) => field.onChange(value as JournalEntryFormValues['recurringFrequency'])}
                      disabled={isReadOnly}
                    >
                      <SelectTrigger id="recurringFrequency">
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        {RECURRING_FREQUENCY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurringStartDate">Start Date</Label>
                <Input id="recurringStartDate" type="date" disabled={isReadOnly} {...form.register('recurringStartDate')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="recurringEndDate">End Date</Label>
                <Input id="recurringEndDate" type="date" disabled={isReadOnly} {...form.register('recurringEndDate')} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <CardTitle>Line Items</CardTitle>
            <CardDescription>Ensure debits and credits balance prior to posting.</CardDescription>
          </div>
          {!isReadOnly && (
            <Button type="button" variant="outline" onClick={() => append({ accountId: '', debit: null, credit: null, memo: '' })}>
              <Plus className="mr-2 h-4 w-4" /> Add Line
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[260px]">Account</TableHead>
                  <TableHead className="w-[140px] text-right">Debit</TableHead>
                  <TableHead className="w-[140px] text-right">Credit</TableHead>
                  <TableHead>Memo</TableHead>
                  {!isReadOnly && <TableHead className="w-[80px]" />}
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.map((field, index) => (
                  <TableRow key={field.id}>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`lines.${index}.accountId`}
                        render={({ field: lineField }) => (
                          <AccountSelect
                            value={lineField.value}
                            onChange={(value) => lineField.onChange(value)}
                            accounts={flattenedAccounts}
                            disabled={isReadOnly}
                          />
                        )}
                      />
                      {formState.errors.lines?.[index]?.accountId && (
                        <p className="mt-1 text-xs text-destructive">Account required</p>
                      )}
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`lines.${index}.debit`}
                        render={({ field: lineField }) => (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={lineField.value ?? ''}
                            disabled={isReadOnly}
                            onChange={(event) => {
                              const value = event.target.value;
                              const numeric = value === '' ? null : Number(value);
                              lineField.onChange(numeric);
                              if (numeric && numeric > 0) {
                                setValue(`lines.${index}.credit`, null);
                              }
                            }}
                            className="text-right"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`lines.${index}.credit`}
                        render={({ field: lineField }) => (
                          <Input
                            type="number"
                            step="0.01"
                            min="0"
                            value={lineField.value ?? ''}
                            disabled={isReadOnly}
                            onChange={(event) => {
                              const value = event.target.value;
                              const numeric = value === '' ? null : Number(value);
                              lineField.onChange(numeric);
                              if (numeric && numeric > 0) {
                                setValue(`lines.${index}.debit`, null);
                              }
                            }}
                            className="text-right"
                          />
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        control={control}
                        name={`lines.${index}.memo`}
                        render={({ field: lineField }) => (
                          <Input
                            value={lineField.value ?? ''}
                            placeholder="Optional memo"
                            disabled={isReadOnly}
                            onChange={lineField.onChange}
                          />
                        )}
                      />
                    </TableCell>
                    {!isReadOnly && (
                      <TableCell className="text-right">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => remove(index)}
                          disabled={fields.length <= 2}
                          title="Remove line"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-4 text-sm">
            <div className="flex items-center justify-between font-medium">
              <span>Total Debits</span>
              <span>{currency.format(totals.debits)}</span>
            </div>
            <div className="flex items-center justify-between font-medium">
              <span>Total Credits</span>
              <span>{currency.format(totals.credits)}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Difference</span>
              <span className={isBalanced ? 'text-emerald-600' : 'text-destructive'}>
                {currency.format(balanceDifference)}
              </span>
            </div>
            <p className={cn('text-xs', isBalanced ? 'text-emerald-600' : 'text-destructive')}>
              {isBalanced ? '✓ Entry balanced' : '⚠ Entry not balanced'}
            </p>
          </div>
        </CardContent>
      </Card>

      {!isReadOnly && (
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <Button type="button" variant="ghost" onClick={onCancel} disabled={isProcessing}>
            Cancel
          </Button>
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isProcessing}>
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
                </>
              ) : (
                'Save Draft'
              )}
            </Button>
            <Button type="button" variant="secondary" onClick={submitPost} disabled={isProcessing || (entryData?.status === 'POSTED' && mode !== 'create')}>
              {postMutation.isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Post Entry
            </Button>
          </div>
        </div>
      )}
    </form>
  );
}

export default function JournalEntryFormPage() {
  const [, navigate] = useLocation();
  const [isNewRoute] = useMatch('/accounting/journal-entries/new');
  const [isExistingRoute, params] = useMatch('/accounting/journal-entries/:id');
  const entryId = isExistingRoute ? params.id : undefined;
  const mode: 'create' | 'edit' = isNewRoute ? 'create' : 'edit';

  const [headerDate, setHeaderDate] = useState<Date | undefined>();

  useEffect(() => {
    if (mode === 'create') {
      setHeaderDate(new Date());
    }
  }, [mode]);

  return (
    <AccountingLayout>
      <StatementHeader
        title={mode === 'create' ? 'New Journal Entry' : `Journal Entry ${entryId ?? ''}`}
        startDate={headerDate}
        endDate={headerDate}
      />
      <JournalEntryFormContainer
        mode={mode}
        entryId={entryId}
        onCancel={() => navigate('/accounting/journal-entries')}
        onEntryLoaded={(entry) => setHeaderDate(new Date(entry.date))}
        onSuccess={(entry, _intent) => {
          setHeaderDate(new Date(entry.date));
          if (mode === 'create') {
            navigate(`/accounting/journal-entries/${entry.id}`);
          }
        }}
      />
    </AccountingLayout>
  );
}
