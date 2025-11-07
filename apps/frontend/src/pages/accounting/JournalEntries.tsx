import { Fragment, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format, startOfMonth } from 'date-fns';
import { ChevronDown, ChevronRight, Download, FileInput, MoreHorizontal, PlusCircle, RefreshCcw } from 'lucide-react';
import AccountingLayout from './AccountingLayout';
import { StatementHeader } from '@/components/accounting/StatementHeader.tsx';
import {
  fetchAccounts,
  fetchJournalEntries,
  deleteJournalEntryRequest,
  duplicateJournalEntryRequest,
  exportJournalEntriesRequest,
  importJournalEntriesRequest,
  postJournalEntryRequest,
  voidJournalEntryRequest,
  type AccountNode,
  type JournalEntryStatus,
  type JournalEntryType,
} from '@/lib/accountingApi';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Card, CardContent } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@repo/ui';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import { JournalEntryFormContainer } from './JournalEntryForm';

const PAGE_SIZE = 25;

const STATUS_FILTERS: Array<{ label: string; value: JournalEntryStatus | '' }> = [
  { label: 'All Statuses', value: '' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Posted', value: 'POSTED' },
  { label: 'Void', value: 'VOID' },
];

const TYPE_FILTERS: Array<{ label: string; value: JournalEntryType | '' }> = [
  { label: 'All Types', value: '' },
  { label: 'Manual', value: 'MANUAL' },
  { label: 'Auto-Deal', value: 'AUTO_DEAL' },
  { label: 'Auto-Payment', value: 'AUTO_PAYMENT' },
  { label: 'Adjustment', value: 'ADJUSTMENT' },
  { label: 'Recurring', value: 'RECURRING' },
  { label: 'Reclassification', value: 'RECLASSIFICATION' },
];

const SORT_OPTIONS: Array<{ label: string; value: 'date' | 'entryNumber' | 'amount' }> = [
  { label: 'Date', value: 'date' },
  { label: 'Entry #', value: 'entryNumber' },
  { label: 'Amount', value: 'amount' },
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

interface ModalState {
  open: boolean;
  mode: 'create' | 'edit' | 'view';
  entryId?: string;
}

export default function JournalEntries() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<JournalEntryStatus | ''>('');
  const [type, setType] = useState<JournalEntryType | ''>('');
  const [sort, setSort] = useState<'date' | 'entryNumber' | 'amount'>('date');
  const [accountId, setAccountId] = useState('');
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState(() => ({ start: startOfMonth(new Date()), end: new Date() }));
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [modalState, setModalState] = useState<ModalState>({ open: false, mode: 'create' });
  const [voidEntryId, setVoidEntryId] = useState<string | null>(null);

  const { data: accounts } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const flattenedAccounts = useMemo(() => flattenAccounts(accounts), [accounts]);

  const journalEntriesQuery = useQuery({
    queryKey: [
      'accounting',
      'journal-entries',
      page,
      search,
      status,
      type,
      accountId,
      dateRange.start.toISOString(),
      dateRange.end.toISOString(),
      sort,
    ],
    queryFn: () =>
      fetchJournalEntries({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: status || undefined,
        type: type || undefined,
        accountId: accountId || undefined,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        sort,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteJournalEntryRequest(id),
    onSuccess: () => {
      toast({ title: 'Draft entry deleted' });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to delete entry',
        description: error instanceof Error ? error.message : 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const postMutation = useMutation({
    mutationFn: (id: string) => postJournalEntryRequest(id),
    onSuccess: (entry) => {
      toast({ title: 'Journal entry posted', description: `${entry.entryNumber ?? entry.id} posted successfully.` });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entry', entry.id] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Posting failed',
        description: error instanceof Error ? error.message : 'Could not post journal entry.',
        variant: 'destructive',
      });
    },
  });

  const voidMutation = useMutation({
    mutationFn: (payload: { id: string; voidDate: string }) => voidJournalEntryRequest(payload.id, payload.voidDate),
    onSuccess: (entry) => {
      toast({
        title: 'Entry voided',
        description: `Voided ${entry.entryNumber ?? entry.id}. Reversing entry created.`,
      });
      setVoidEntryId(null);
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entry', entry.id] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to void entry',
        description: error instanceof Error ? error.message : 'Unexpected error voiding journal entry.',
        variant: 'destructive',
      });
    },
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => duplicateJournalEntryRequest(id),
    onSuccess: (entry) => {
      toast({
        title: 'Journal entry duplicated',
        description: 'A new draft entry was created from the original.',
      });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
      setModalState({ open: true, mode: 'edit', entryId: entry.id });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Duplicate failed',
        description: error instanceof Error ? error.message : 'Unable to duplicate entry.',
        variant: 'destructive',
      });
    },
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => importJournalEntriesRequest(file),
    onSuccess: (result) => {
      const imported = result.data?.imported ?? 0;
      toast({
        title: 'Entries imported',
        description: imported ? `${imported} entries processed successfully.` : 'Import completed.',
      });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Import failed',
        description: error instanceof Error ? error.message : 'Unable to import entries.',
        variant: 'destructive',
      });
    },
  });

  const totalPages = useMemo(() => {
    if (!journalEntriesQuery.data?.total) return 1;
    return Math.max(1, Math.ceil(journalEntriesQuery.data.total / PAGE_SIZE));
  }, [journalEntriesQuery.data?.total]);

  const entries = useMemo(() => {
    const items = journalEntriesQuery.data?.items ?? [];
    if (sort === 'amount') {
      return [...items].sort((a, b) => b.totalDebit - a.totalDebit);
    }
    if (sort === 'entryNumber') {
      return [...items].sort((a, b) => (a.entryNumber ?? '').localeCompare(b.entryNumber ?? ''));
    }
    return items;
  }, [journalEntriesQuery.data?.items, sort]);

  const handleExport = async () => {
    try {
      const blob = await exportJournalEntriesRequest({
        search: search.trim() || undefined,
        status: status || undefined,
        type: type || undefined,
        accountId: accountId || undefined,
        startDate: dateRange.start.toISOString(),
        endDate: dateRange.end.toISOString(),
        sort,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `journal-entries-${format(dateRange.start, 'yyyyMMdd')}-${format(dateRange.end, 'yyyyMMdd')}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast({ title: 'Export started', description: 'Journal entries exported to Excel.' });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unable to export journal entries.',
        variant: 'destructive',
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
      event.target.value = '';
    }
  };

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const closeModal = () => setModalState({ open: false, mode: 'create' });

  const openModal = (mode: 'create' | 'edit' | 'view', entryId?: string) => {
    setModalState({ open: true, mode, entryId });
  };

  const handlePost = (id: string) => {
    postMutation.mutate(id);
  };

  const handleVoid = (id: string) => {
    setVoidEntryId(id);
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  const loading = journalEntriesQuery.isLoading;
  const isEmpty = !loading && (entries.length === 0);

  return (
    <AccountingLayout>
      <StatementHeader
        title="Journal Entries"
        startDate={dateRange.start}
        endDate={dateRange.end}
        onRangeChange={({ startDate, endDate }) => {
          setDateRange({ start: startDate, end: endDate });
          setPage(1);
        }}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => openModal('create')}>
              <PlusCircle className="mr-2 h-4 w-4" /> New Entry
            </Button>
            <Button variant="outline" onClick={handleExport} disabled={journalEntriesQuery.isFetching}>
              <Download className="mr-2 h-4 w-4" /> Export to Excel
            </Button>
            <Button variant="outline" onClick={handleImportClick} disabled={importMutation.isLoading}>
              <FileInput className="mr-2 h-4 w-4" /> Import Entries
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
        }
      />

      <Card className="mt-6">
        <CardContent className="space-y-4 pt-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Input
                placeholder="Search entry #, description, account"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-[260px]"
              />
              <Select
                value={type}
                onValueChange={(value) => {
                  setType(value as JournalEntryType | '');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Entry Type" />
                </SelectTrigger>
                <SelectContent>
                  {TYPE_FILTERS.map((option) => (
                    <SelectItem key={option.value || 'all-types'} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={status}
                onValueChange={(value) => {
                  setStatus(value as JournalEntryStatus | '');
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_FILTERS.map((option) => (
                    <SelectItem key={option.value || 'all-status'} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={accountId}
                onValueChange={(value) => {
                  setAccountId(value);
                  setPage(1);
                }}
              >
                <SelectTrigger className="w-full sm:w-[220px]">
                  <SelectValue placeholder="All Accounts" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  <SelectItem value="">All Accounts</SelectItem>
                  {flattenedAccounts.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <span className="font-mono text-xs text-muted-foreground">{account.accountNumber}</span>{' '}
                      {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={sort} onValueChange={(value) => setSort(value as typeof sort)}>
                <SelectTrigger className="w-full sm:w-[160px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                type="button"
                variant="outline"
                onClick={() => journalEntriesQuery.refetch()}
                disabled={journalEntriesQuery.isFetching}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
              </Button>
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
              <Skeleton className="h-12" />
            </div>
          ) : isEmpty ? (
            <div className="py-16 text-center text-sm text-muted-foreground">
              No journal entries match the selected filters.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40px]" />
                    <TableHead>Entry #</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Total Debit</TableHead>
                    <TableHead className="text-right">Total Credit</TableHead>
                    <TableHead>Created By</TableHead>
                    <TableHead className="w-[60px]" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {entries.map((entry) => {
                    const isExpanded = expandedRows.has(entry.id);
                    return (
                      <Fragment key={entry.id}>
                        <TableRow className="align-top">
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => toggleRow(entry.id)}
                              aria-label={isExpanded ? 'Collapse row' : 'Expand row'}
                            >
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </Button>
                          </TableCell>
                          <TableCell>
                            <Button variant="link" className="px-0" onClick={() => openModal('view', entry.id)}>
                              {entry.entryNumber ?? '—'}
                            </Button>
                          </TableCell>
                          <TableCell>{format(new Date(entry.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{entry.description}</TableCell>
                          <TableCell>
                            <Badge variant="outline">{TYPE_FILTERS.find((option) => option.value === entry.type)?.label ?? entry.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                entry.status === 'POSTED'
                                  ? 'default'
                                  : entry.status === 'VOID'
                                    ? 'destructive'
                                    : 'secondary'
                              }
                            >
                              {entry.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">{currency.format(entry.totalDebit)}</TableCell>
                          <TableCell className="text-right font-medium">{currency.format(entry.totalCredit)}</TableCell>
                          <TableCell>{entry.createdBy?.name ?? '—'}</TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => openModal('view', entry.id)}>View</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openModal('edit', entry.id)}>Edit</DropdownMenuItem>
                                {entry.status === 'DRAFT' && (
                                  <DropdownMenuItem onClick={() => handlePost(entry.id)}>Post</DropdownMenuItem>
                                )}
                                {entry.status === 'POSTED' && (
                                  <DropdownMenuItem onClick={() => handleVoid(entry.id)}>Void</DropdownMenuItem>
                                )}
                                <DropdownMenuItem onClick={() => duplicateMutation.mutate(entry.id)}>
                                  Duplicate
                                </DropdownMenuItem>
                                {entry.status === 'DRAFT' && (
                                  <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(entry.id)}>
                                    Delete Draft
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow>
                            <TableCell colSpan={10} className="bg-muted/40">
                              <div className="space-y-4 p-4">
                                <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                  <span>Created {format(new Date(entry.createdAt), 'MMM d, yyyy h:mm a')}</span>
                                  {entry.updatedAt !== entry.createdAt && (
                                    <span>Updated {format(new Date(entry.updatedAt), 'MMM d, yyyy h:mm a')}</span>
                                  )}
                                  {entry.voidedAt && <span>Voided {format(new Date(entry.voidedAt), 'MMM d, yyyy')}</span>}
                                </div>
                                <div className="overflow-x-auto">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead>Account</TableHead>
                                        <TableHead className="text-right">Debit</TableHead>
                                        <TableHead className="text-right">Credit</TableHead>
                                        <TableHead>Memo</TableHead>
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {entry.lines.map((line) => (
                                        <TableRow key={line.id}>
                                          <TableCell>
                                            <div className="flex flex-col">
                                              <span className="font-medium">{line.accountNumber}</span>
                                              <span className="text-xs text-muted-foreground">{line.accountName}</span>
                                            </div>
                                          </TableCell>
                                          <TableCell className="text-right">{line.debit ? currency.format(line.debit) : '—'}</TableCell>
                                          <TableCell className="text-right">{line.credit ? currency.format(line.credit) : '—'}</TableCell>
                                          <TableCell>{line.memo ?? '—'}</TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <Button variant="outline" onClick={() => openModal('edit', entry.id)}>
                                    Edit
                                  </Button>
                                  {entry.status === 'DRAFT' && (
                                    <Button onClick={() => handlePost(entry.id)} disabled={postMutation.isLoading}>
                                      {postMutation.isLoading ? 'Posting…' : 'Post Entry'}
                                    </Button>
                                  )}
                                  {entry.status === 'POSTED' && (
                                    <Button variant="destructive" onClick={() => handleVoid(entry.id)} disabled={voidMutation.isLoading}>
                                      Void Entry
                                    </Button>
                                  )}
                                  {entry.status === 'DRAFT' && (
                                    <Button variant="destructive" onClick={() => handleDelete(entry.id)} disabled={deleteMutation.isLoading}>
                                      Delete Draft
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
              <span>
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((prev) => Math.max(1, prev - 1))}>
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={modalState.open} onOpenChange={(open) => (open ? null : closeModal())}>
        <DialogContent className="max-h-[90vh] w-full max-w-5xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {modalState.mode === 'create'
                ? 'New Journal Entry'
                : modalState.mode === 'edit'
                  ? 'Edit Journal Entry'
                  : 'View Journal Entry'}
            </DialogTitle>
          </DialogHeader>
          <JournalEntryFormContainer
            mode={modalState.mode}
            entryId={modalState.entryId}
            onCancel={closeModal}
            onSuccess={(_entry, _intent) => {
              closeModal();
              queryClient.invalidateQueries({ queryKey: ['accounting', 'journal-entries'] });
            }}
          />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(voidEntryId)} onOpenChange={(open) => (!open ? setVoidEntryId(null) : null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Void journal entry?</AlertDialogTitle>
            <AlertDialogDescription>
              Voiding this entry will create an automatic reversing entry, mark the original entry as void, capture your user
              and timestamp, and link the entries together. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setVoidEntryId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (voidEntryId) {
                  voidMutation.mutate({ id: voidEntryId, voidDate: new Date().toISOString() });
                }
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Void Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AccountingLayout>
  );
}
