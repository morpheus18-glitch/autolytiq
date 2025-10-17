import { useEffect, useMemo } from 'react';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useRoute, useLocation } from 'wouter';
import AccountingLayout from './AccountingLayout';
import { fetchAccounts, fetchJournalEntry, createJournalEntryRequest, postJournalEntryRequest } from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { JournalEntryLine } from '@/components/accounting/JournalEntryLine';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface JournalEntryLineForm {
  glAccountId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
}

interface JournalEntryFormValues {
  memo: string;
  postingDate: string;
  status: 'DRAFT' | 'POSTED' | 'VOID';
  dealId?: string;
  lines: JournalEntryLineForm[];
}

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export default function JournalEntryForm() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [isNewRoute] = useRoute('/accounting/journal-entries/new');
  const [isExistingRoute, params] = useRoute('/accounting/journal-entries/:id');
  const entryId = !isNewRoute && isExistingRoute ? params.id : undefined;

  const form = useForm<JournalEntryFormValues>({
    defaultValues: {
      memo: '',
      postingDate: format(new Date(), 'yyyy-MM-dd'),
      status: 'DRAFT',
      dealId: '',
      lines: [
        { glAccountId: '', type: 'DEBIT', amount: 0, description: '' },
        { glAccountId: '', type: 'CREDIT', amount: 0, description: '' },
      ],
    },
  });

  const { control, handleSubmit, watch, reset, formState } = form;
  const { fields, append, remove } = useFieldArray({ control, name: 'lines' });

  const { data: accounts, isLoading: accountsLoading } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const { data: entry, isLoading: entryLoading } = useQuery({
    queryKey: ['accounting', 'journal-entry', entryId],
    queryFn: () => fetchJournalEntry(entryId as string),
    enabled: Boolean(entryId),
  });

  useEffect(() => {
    if (entry) {
      reset({
        memo: entry.memo ?? '',
        postingDate: format(new Date(entry.postingDate), 'yyyy-MM-dd'),
        status: entry.status as JournalEntryFormValues['status'],
        dealId: entry.deal?.id ?? '',
        lines: entry.lines.map((line) => ({
          glAccountId: line.glAccountId,
          type: line.type,
          amount: line.amount,
          description: line.description ?? '',
        })),
      });
    }
  }, [entry, reset]);

  const watchedLines = watch('lines');
  const totals = useMemo(() => {
    return watchedLines.reduce(
      (acc, line) => {
        const amount = Number(line.amount ?? 0);
        if (line.type === 'DEBIT') {
          acc.debits += amount;
        } else {
          acc.credits += amount;
        }
        return acc;
      },
      { debits: 0, credits: 0 },
    );
  }, [watchedLines]);

  const balanceDifference = useMemo(() => Math.abs(totals.debits - totals.credits), [totals]);

  const createMutation = useMutation({
    mutationFn: createJournalEntryRequest,
    onSuccess: (data) => {
      toast({ title: 'Journal entry saved', description: `Entry ${data.entryNumber} created.` });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
      navigate(`/accounting/journal-entries/${data.id}`);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to save entry',
        description: error instanceof Error ? error.message : 'Please verify the journal entry details.',
        variant: 'destructive',
      });
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => postJournalEntryRequest(id),
    onSuccess: (data) => {
      toast({ title: 'Journal entry posted', description: `Entry ${data.entryNumber} posted successfully.` });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entry', data.id] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Posting failed',
        description: error instanceof Error ? error.message : 'Could not post journal entry.',
        variant: 'destructive',
      });
    },
  });

  const onSubmit = handleSubmit((values) => {
    if (!accounts || accounts.length === 0) {
      toast({ title: 'Chart of accounts missing', description: 'Create GL accounts before posting journal entries.', variant: 'destructive' });
      return;
    }
    const sanitizedLines = values.lines
      .map((line) => ({
        glAccountId: line.glAccountId,
        type: line.type,
        amount: Number(line.amount ?? 0),
        description: line.description ?? undefined,
      }))
      .filter((line) => line.glAccountId && line.amount > 0);

    if (sanitizedLines.length < 2) {
      toast({
        title: 'Two balanced lines required',
        description: 'Add at least one debit and one credit line with positive amounts.',
        variant: 'destructive',
      });
      return;
    }

    const totalDebits = sanitizedLines.filter((line) => line.type === 'DEBIT').reduce((sum, line) => sum + line.amount, 0);
    const totalCredits = sanitizedLines.filter((line) => line.type === 'CREDIT').reduce((sum, line) => sum + line.amount, 0);
    if (Math.abs(totalDebits - totalCredits) > 0.01) {
      toast({
        title: 'Entry out of balance',
        description: 'Total debits must equal total credits before submission.',
        variant: 'destructive',
      });
      return;
    }

    createMutation.mutate({
      memo: values.memo || undefined,
      postingDate: new Date(values.postingDate).toISOString(),
      status: values.status,
      dealId: values.dealId || undefined,
      lines: sanitizedLines,
    });
  });

  const isExisting = Boolean(entryId);
  const isPosted = entry?.status === 'POSTED';
  const isReadOnly = isExisting;

  if (accountsLoading || (entryId && entryLoading)) {
    return (
      <AccountingLayout>
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64" />
      </AccountingLayout>
    );
  }

  const accountOptions = accounts ?? [];

  return (
    <AccountingLayout>
      <StatementHeader
        title={isExisting ? `Journal Entry ${entry?.entryNumber ?? ''}` : 'New Journal Entry'}
        startDate={entry ? new Date(entry.postingDate) : undefined}
        endDate={entry ? new Date(entry.postingDate) : undefined}
      />

      <form onSubmit={onSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <CardTitle>Entry Details</CardTitle>
                <CardDescription>Provide GAAP-compliant information for this journal entry.</CardDescription>
              </div>
              {entry && (
                <Badge variant={entry.status === 'POSTED' ? 'default' : entry.status === 'VOID' ? 'destructive' : 'secondary'}>
                  {entry.status}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="memo">
                Memo
              </label>
              <Input id="memo" disabled={isReadOnly} {...form.register('memo')} placeholder="Description of transaction" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="postingDate">
                Posting date
              </label>
              <Input id="postingDate" type="date" disabled={isReadOnly} {...form.register('postingDate')} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Status</label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={(value) => field.onChange(value as JournalEntryFormValues['status'])}
                    disabled={isReadOnly}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="POSTED">Posted</SelectItem>
                      <SelectItem value="VOID">Void</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="dealId">
                Deal ID (optional)
              </label>
              <Input id="dealId" disabled={isReadOnly} {...form.register('dealId')} placeholder="Link to originating deal" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <div>
              <CardTitle>Lines</CardTitle>
              <CardDescription>Debits must equal credits. Use department-specific GL accounts when applicable.</CardDescription>
            </div>
            {!isReadOnly && (
              <Button type="button" variant="outline" onClick={() => append({ glAccountId: '', type: 'DEBIT', amount: 0, description: '' })}>
                Add Line
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-3">
            {fields.map((field, index) => (
              <JournalEntryLine
                key={field.id}
                index={index}
                control={control}
                remove={remove}
                accounts={accountOptions}
                errors={formState.errors}
                disabled={isReadOnly}
              />
            ))}
            <div className="flex flex-col gap-2 rounded-lg bg-muted/40 p-4 text-sm">
              <div className="flex justify-between font-medium">
                <span>Total debits</span>
                <span>{currency.format(totals.debits)}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total credits</span>
                <span>{currency.format(totals.credits)}</span>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Difference</span>
                <span className={balanceDifference > 0.01 ? 'text-destructive' : ''}>{currency.format(balanceDifference)}</span>
              </div>
            </div>
            {isReadOnly && entry && (
              <p className="text-xs text-muted-foreground">
                This journal entry is read-only. To adjust, create a reversing or adjusting entry referencing #{entry.entryNumber}.
              </p>
            )}
          </CardContent>
        </Card>

        {!isReadOnly && (
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={createMutation.isLoading}>
              {createMutation.isLoading ? 'Saving…' : 'Save Journal Entry'}
            </Button>
          </div>
        )}
      </form>

      {isExisting && !isPosted && (
        <div className="flex items-center justify-end pt-4">
          <Button onClick={() => postMutation.mutate(entryId!)} disabled={postMutation.isLoading}>
            {postMutation.isLoading ? 'Posting…' : 'Post Entry'}
          </Button>
        </div>
      )}
    </AccountingLayout>
  );
}
