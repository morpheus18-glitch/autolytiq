import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth } from 'date-fns';
import { Link, useLocation, useSearch } from 'wouter';
import AccountingLayout from './AccountingLayout';
import {
  fetchJournalEntries,
  autoGenerateJournalEntry,
  type JournalEntryResponse,
  fetchAccounts,
  type AccountNode,
} from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Posted', value: 'POSTED' },
  { label: 'Void', value: 'VOID' },
];
const PAGE_SIZE = 25;

type Totals = { debit: number; credit: number };

function calculateTotals(entry: JournalEntryResponse): Totals {
  return entry.lines.reduce(
    (acc, line) => {
      if (line.type === 'DEBIT') {
        acc.debit += line.amount;
      } else {
        acc.credit += line.amount;
      }
      return acc;
    },
    { debit: 0, credit: 0 },
  );
}

export default function JournalEntries() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  const initialAccount = searchParams.get('account') ?? '';

  const [range, setRange] = useState(() => ({ startDate: startOfMonth(new Date()), endDate: new Date() }));
  const [status, setStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [autoDialogOpen, setAutoDialogOpen] = useState(false);
  const [dealId, setDealId] = useState('');
  const [accountId, setAccountId] = useState(initialAccount);

  const { data: accountTree } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: [
      'accounting',
      'journal-entries',
      status,
      search,
      accountId,
      range.startDate.toISOString(),
      range.endDate.toISOString(),
      page,
    ],
    queryFn: () =>
      fetchJournalEntries({
        status: status || undefined,
        search: search ? search.trim() : undefined,
        accountId: accountId || undefined,
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        skip: page * PAGE_SIZE,
        take: PAGE_SIZE,
      }),
  });

  const autoGenerateMutation = useMutation({
    mutationFn: autoGenerateJournalEntry,
    onSuccess: (entry) => {
      toast({ title: 'Journal entry created', description: `Entry ${entry.entryNumber} generated from deal.` });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
      setAutoDialogOpen(false);
      setDealId('');
      navigate(`/accounting/journal-entries/${entry.id}`);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Auto-generation failed',
        description: error instanceof Error ? error.message : 'Unable to generate entry from deal',
        variant: 'destructive',
      });
    },
  });

  const totalPages = useMemo(() => {
    if (!data?.total) return 1;
    return Math.max(1, Math.ceil(data.total / PAGE_SIZE));
  }, [data?.total]);

  const isEmpty = !isLoading && (data?.items.length ?? 0) === 0;

  const accountOptions = useMemo(() => {
    const flatten = (nodes: AccountNode[] | undefined): AccountNode[] => {
      if (!nodes) return [];
      const list: AccountNode[] = [];
      const stack = [...nodes];
      while (stack.length) {
        const node = stack.shift()!;
        list.push(node);
        if (node.children?.length) {
          stack.push(...node.children);
        }
      }
      return list;
    };
    return flatten(accountTree);
  }, [accountTree]);

  return (
    <AccountingLayout>
      <StatementHeader
        title="Journal Entries"
        startDate={range.startDate}
        endDate={range.endDate}
        onRangeChange={({ startDate, endDate }) => {
          setRange({ startDate, endDate });
          setPage(0);
        }}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setAutoDialogOpen(true)}>
              Auto-generate from Deal
            </Button>
            <Link href="/accounting/journal-entries/new">
              <Button>Create Manual Entry</Button>
            </Link>
          </div>
        }
      />

      <Card>
        <CardHeader className="flex flex-wrap items-center justify-between gap-4">
          <CardTitle className="text-base font-semibold">Filters</CardTitle>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Search entry number or memo"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(0);
                }}
                className="w-[240px]"
              />
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value || 'all'} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={accountId}
                onValueChange={(value) => {
                  setAccountId(value);
                  setPage(0);
                }}
              >
                <SelectTrigger className="w-[240px]">
                  <SelectValue placeholder="All accounts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All accounts</SelectItem>
                  {accountOptions.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <span className="font-mono text-xs text-muted-foreground">{account.accountNumber}</span>{' '}
                      {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button variant="secondary" onClick={() => queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] })} disabled={isFetching}>
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : isEmpty ? (
            <div className="p-6 text-center text-sm text-muted-foreground">No journal entries found for the selected filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[160px]">Entry</TableHead>
                    <TableHead className="w-[110px]">Posting Date</TableHead>
                    <TableHead className="w-[120px]">Status</TableHead>
                    <TableHead>Memo</TableHead>
                    <TableHead className="w-[140px] text-right">Debits</TableHead>
                    <TableHead className="w-[140px] text-right">Credits</TableHead>
                    <TableHead className="w-[160px]">Deal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.items.map((entry) => {
                    const totals = calculateTotals(entry);
                    return (
                      <TableRow key={entry.id} className="cursor-pointer" onClick={() => navigate(`/accounting/journal-entries/${entry.id}`)}>
                        <TableCell className="font-medium">{entry.entryNumber}</TableCell>
                        <TableCell>{format(new Date(entry.postingDate), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          <Badge variant={entry.status === 'POSTED' ? 'default' : entry.status === 'VOID' ? 'destructive' : 'secondary'}>
                            {entry.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{entry.memo ?? '—'}</TableCell>
                        <TableCell className="text-right font-medium">{currency.format(totals.debit)}</TableCell>
                        <TableCell className="text-right font-medium">{currency.format(totals.credit)}</TableCell>
                        <TableCell>{entry.deal?.dealNumber ?? '—'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page + 1} of {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setPage((prev) => Math.max(prev - 1, 0))} disabled={page === 0}>
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
              disabled={page >= totalPages - 1}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      <Dialog open={autoDialogOpen} onOpenChange={setAutoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Generate Entry from Deal</DialogTitle>
            <DialogDescription>Provide a deal ID to generate balanced journal entries automatically.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground" htmlFor="deal-id-input">
              Deal identifier
            </label>
            <Input
              id="deal-id-input"
              placeholder="e.g. deal_123"
              value={dealId}
              onChange={(event) => setDealId(event.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAutoDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => autoGenerateMutation.mutate(dealId)}
              disabled={!dealId || autoGenerateMutation.isLoading}
            >
              {autoGenerateMutation.isLoading ? 'Generating…' : 'Generate'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );
}
