import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  ChevronDown,
  ChevronRight,
  Edit3,
  FileStack,
  Loader2,
  MoreVertical,
  Plus,
  Search,
} from 'lucide-react';
import AccountingLayout from './AccountingLayout';
import { GLAccountFormContent } from './GLAccountForm';
import {
  fetchAccounts,
  fetchAccountBalance,
  fetchAccountTransactions,
  importStandardCoaRequest,
  reorderAccountsRequest,
  upsertAccountRequest,
  type AccountNode,
} from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

type GLAccountType = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE';

const TYPE_COLORS: Record<GLAccountType, string> = {
  ASSET: 'border-emerald-500 text-emerald-600',
  LIABILITY: 'border-amber-500 text-amber-600',
  EQUITY: 'border-indigo-500 text-indigo-600',
  REVENUE: 'border-sky-500 text-sky-600',
  EXPENSE: 'border-rose-500 text-rose-600',
};

const TYPE_FILTER_OPTIONS = [
  { label: 'All Types', value: 'ALL' },
  { label: 'Asset', value: 'ASSET' },
  { label: 'Liability', value: 'LIABILITY' },
  { label: 'Equity', value: 'EQUITY' },
  { label: 'Revenue', value: 'REVENUE' },
  { label: 'Expense', value: 'EXPENSE' },
] as const;

type AccountTypeFilter = 'ALL' | GLAccountType;

type FormMode = 'create' | 'edit';

interface FilteredNode extends AccountNode {
  children: FilteredNode[];
}

function flattenAccounts(accounts: AccountNode[]): AccountNode[] {
  const list: AccountNode[] = [];
  const stack = [...accounts];
  while (stack.length) {
    const node = stack.shift()!;
    list.push(node);
    if (node.children?.length) {
      stack.unshift(...node.children);
    }
  }
  return list;
}

function filterAccounts(
  accounts: AccountNode[],
  search: string,
  typeFilter: AccountTypeFilter,
  includeInactive: boolean,
): FilteredNode[] {
  const query = search.trim().toLowerCase();
  return accounts
    .map((account) => {
      const children = filterAccounts(account.children ?? [], search, typeFilter, includeInactive);
      const matchesSearch =
        !query ||
        account.accountNumber.toLowerCase().includes(query) ||
        account.accountName.toLowerCase().includes(query);
      const matchesType = typeFilter === 'ALL' || account.accountType === typeFilter;
      const matchesActive = includeInactive || account.isActive;
      if ((matchesSearch && matchesType && matchesActive) || children.length > 0) {
        return { ...account, children };
      }
      return null;
    })
    .filter((node): node is FilteredNode => Boolean(node));
}

function getSiblings(accounts: AccountNode[], parentId: string | null) {
  if (!parentId) {
    return accounts;
  }
  const findParent = (nodes: AccountNode[]): AccountNode | null => {
    for (const node of nodes) {
      if (node.id === parentId) return node;
      const found = findParent(node.children ?? []);
      if (found) return found;
    }
    return null;
  };
  const parent = findParent(accounts);
  return parent ? parent.children ?? [] : [];
}

export default function GLAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<AccountTypeFilter>('ALL');
  const [showInactive, setShowInactive] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [balanceAccountId, setBalanceAccountId] = useState<string | null>(null);
  const [transactionsAccount, setTransactionsAccount] = useState<AccountNode | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const balanceDate = useMemo(() => format(new Date(), 'yyyy-MM-dd'), []);

  const { data: accounts, isLoading, isFetching } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const flattened = useMemo(() => flattenAccounts(accounts ?? []), [accounts]);
  const selectedAccount = flattened.find((node) => node.id === selectedAccountId) ?? null;

  useEffect(() => {
    if (accounts && accounts.length) {
      setExpanded(new Set(accounts.map((account) => account.id)));
    }
  }, [accounts]);

  useEffect(() => {
    if (!selectedAccountId && accounts && accounts.length) {
      setSelectedAccountId(accounts[0]?.id ?? null);
    }
  }, [accounts, selectedAccountId]);

  const filteredTree = useMemo(
    () => filterAccounts(accounts ?? [], search, typeFilter, showInactive),
    [accounts, search, typeFilter, showInactive],
  );

  const { data: balanceInfo } = useQuery({
    queryKey: ['accounting', 'accounts', balanceAccountId, 'balance', balanceDate],
    queryFn: () => fetchAccountBalance(balanceAccountId!, balanceDate),
    enabled: Boolean(balanceAccountId),
  });

  const { data: transactionLines, isLoading: transactionsLoading } = useQuery({
    queryKey: ['accounting', 'accounts', transactionsAccount?.id, 'transactions'],
    queryFn: () => fetchAccountTransactions(transactionsAccount!.id),
    enabled: Boolean(transactionsAccount),
  });

  const importMutation = useMutation({
    mutationFn: importStandardCoaRequest,
    onSuccess: () => {
      toast({ title: 'Standard chart imported', description: 'Automotive COA has been added to your tenant.' });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to import chart',
        description: error instanceof Error ? error.message : 'Try again in a few minutes.',
        variant: 'destructive',
      });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: reorderAccountsRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to reorder accounts',
        description: error instanceof Error ? error.message : 'Drag and drop is limited to matching parents.',
        variant: 'destructive',
      });
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (account: AccountNode) =>
      upsertAccountRequest({
        id: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType,
        normalBalance: account.normalBalance,
        category: account.category ?? null,
        parentAccountId: account.parentAccountId ?? null,
        description: account.description ?? undefined,
        taxLineMapping: account.taxLineMapping ?? undefined,
        isActive: !account.isActive,
        allowManual: account.allowManual ?? true,
      }),
    onSuccess: (account) => {
      toast({
        title: account.isActive ? 'Account activated' : 'Account inactivated',
        description: `${account.accountNumber} ${account.accountName}`,
      });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to update account',
        description: error instanceof Error ? error.message : 'Please verify account balance requirements.',
        variant: 'destructive',
      });
    },
  });

  const handleToggleExpand = useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const handleCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = (account?: AccountNode) => {
    if (account) {
      setSelectedAccountId(account.id);
    }
    setFormMode('edit');
    setFormOpen(true);
  };

  const handleDrop = (target: AccountNode) => {
    if (!draggingId || draggingId === target.id || !accounts) return;
    const sourceAccount = flattened.find((account) => account.id === draggingId);
    if (!sourceAccount) return;
    const sourceParent = sourceAccount.parentAccountId ?? null;
    const targetParent = target.parentAccountId ?? null;
    if (sourceParent !== targetParent) {
      toast({
        title: 'Cannot reorder across parents',
        description: 'Drag and drop is limited to accounts that share the same parent.',
        variant: 'destructive',
      });
      return;
    }
    const siblings = getSiblings(accounts, sourceParent);
    const orderedIds = siblings.map((sibling) => sibling.id);
    const sourceIndex = orderedIds.indexOf(sourceAccount.id);
    const targetIndex = orderedIds.indexOf(target.id);
    if (sourceIndex === -1 || targetIndex === -1) return;
    orderedIds.splice(sourceIndex, 1);
    orderedIds.splice(targetIndex, 0, sourceAccount.id);
    reorderMutation.mutate({ parentAccountId: sourceParent, orderedIds });
  };

  const renderTree = (nodes: FilteredNode[], depth = 0) => {
    return nodes.map((node) => {
      const hasChildren = node.children.length > 0;
      const isExpanded = expanded.has(node.id);
      const balanceValue =
        balanceInfo && balanceAccountId === node.id ? balanceInfo.balance : Number(node.balance ?? 0);
      return (
        <div key={node.id}>
          <div
            className={cn(
              'group flex items-center gap-2 rounded-md border-l-4 bg-background px-2 py-1 text-sm transition-colors',
              TYPE_COLORS[node.accountType as GLAccountType] ?? 'border-muted text-muted-foreground',
              selectedAccountId === node.id ? 'bg-primary/10' : 'hover:bg-muted/80',
              !node.isActive && 'text-muted-foreground opacity-80',
            )}
            style={{ marginLeft: depth * 16 }}
            draggable
            onDragStart={() => setDraggingId(node.id)}
            onDragEnd={() => setDraggingId(null)}
            onDragOver={(event) => {
              event.preventDefault();
              event.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(event) => {
              event.preventDefault();
              handleDrop(node);
            }}
            onClick={() => setSelectedAccountId(node.id)}
            onMouseEnter={() => setBalanceAccountId(node.id)}
          >
            <button
              type="button"
              className="flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
              onClick={(event) => {
                event.stopPropagation();
                if (hasChildren) {
                  handleToggleExpand(node.id);
                }
              }}
            >
              {hasChildren ? (
                isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />
              ) : (
                <span className="h-4 w-4" />
              )}
            </button>
            <div className="flex min-w-0 flex-1 items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">{node.accountNumber}</span>
              <span className="truncate font-medium">
                {node.accountName}
                {!node.isActive && <span className="ml-1 text-xs font-normal text-muted-foreground">(Inactive)</span>}
              </span>
              <Tooltip delayDuration={150}>
                <TooltipTrigger asChild>
                  <span className="ml-auto whitespace-nowrap text-xs font-semibold text-muted-foreground">
                    {currency.format(Number(balanceValue || 0))}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  Balance as of {format(new Date(balanceDate), 'MMM d, yyyy')}
                </TooltipContent>
              </Tooltip>
            </div>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs"
              onClick={(event) => {
                event.stopPropagation();
                handleEdit(node);
              }}
            >
              <Edit3 className="mr-1 h-3.5 w-3.5" /> Edit
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="icon" variant="ghost" className="h-7 w-7">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    setSelectedAccountId(node.id);
                    handleEdit(node);
                  }}
                >
                  Edit Account
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    setTransactionsAccount(node);
                  }}
                >
                  View Transactions
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    if (Math.abs(Number(node.balance ?? 0)) > 0 && node.isActive) {
                      toast({
                        title: 'Balance must be zero',
                        description: 'Clear outstanding balance before inactivating the account.',
                        variant: 'destructive',
                      });
                      return;
                    }
                    toggleActiveMutation.mutate(node);
                  }}
                >
                  {node.isActive ? 'Mark Inactive' : 'Activate'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {hasChildren && isExpanded && <div className="space-y-1">{renderTree(node.children, depth + 1)}</div>}
        </div>
      );
    });
  };

  if (isLoading) {
    return (
      <AccountingLayout>
        <StatementHeader title="General Ledger Accounts" />
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Loading accounts…</CardTitle>
            <CardDescription>Fetching chart of accounts for this tenant.</CardDescription>
          </CardHeader>
          <CardContent className="flex h-64 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </AccountingLayout>
    );
  }

  const balanceDisplay = balanceInfo && balanceAccountId === selectedAccount?.id ? balanceInfo.balance : Number(selectedAccount?.balance ?? 0);

  return (
    <AccountingLayout>
      <StatementHeader title="General Ledger Accounts" description="Maintain the tenant-specific chart of accounts, balances, and posting permissions." />

      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> New Account
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => importMutation.mutate()}
          disabled={importMutation.isPending}
        >
          {importMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileStack className="mr-2 h-4 w-4" />} 
          Import Standard Automotive COA
        </Button>
        {isFetching && <Badge variant="secondary">Refreshing…</Badge>}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-4">
        <div className="relative w-full max-w-sm">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder="Search accounts"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <Select value={typeFilter} onValueChange={(value) => setTypeFilter(value as AccountTypeFilter)}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Account Type" />
          </SelectTrigger>
          <SelectContent>
            {TYPE_FILTER_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2">
          <Switch checked={showInactive} onCheckedChange={setShowInactive} id="show-inactive" />
          <label htmlFor="show-inactive" className="text-sm text-muted-foreground">
            Show Inactive
          </label>
        </div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[420px,1fr]">
        <Card className="h-[calc(100vh-260px)] min-h-[480px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Chart of Accounts</CardTitle>
              <CardDescription>Drag to reorder siblings. Click an account to view details.</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            {filteredTree.length > 0 ? (
              <TooltipProvider>
                <ScrollArea className="h-[calc(100vh-360px)] min-h-[360px] pr-2">
                  <div className="space-y-1">{renderTree(filteredTree)}</div>
                </ScrollArea>
              </TooltipProvider>
            ) : (
              <p className="text-sm text-muted-foreground">
                No accounts match your filters. Adjust filters or import the standard automotive chart of accounts.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="h-[calc(100vh-260px)] min-h-[480px]">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selectedAccount ? selectedAccount.accountName : 'Account Details'}</CardTitle>
              <CardDescription>
                {selectedAccount
                  ? `${selectedAccount.accountNumber} • ${selectedAccount.accountType} • ${selectedAccount.category ?? 'Uncategorized'}`
                  : 'Select an account from the tree to review balances, structure, and metadata.'}
              </CardDescription>
            </div>
            {selectedAccount && (
              <Badge variant={selectedAccount.isActive ? 'default' : 'secondary'}>
                {selectedAccount.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-6">
            {selectedAccount ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Balance</p>
                    <p className="text-2xl font-bold text-foreground">{currency.format(Number(balanceDisplay ?? 0))}</p>
                    <p className="text-xs text-muted-foreground">As of {format(new Date(balanceDate), 'MMMM d, yyyy')}</p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-semibold uppercase text-muted-foreground">Account Number</p>
                    <p className="text-lg font-medium text-foreground">{selectedAccount.accountNumber}</p>
                    <p className="text-xs text-muted-foreground">{selectedAccount.allowManual === false ? 'System generated only' : 'Manual journal entries allowed'}</p>
                  </div>
                </div>
                <div className="grid gap-3 text-sm">
                  <div className="rounded-lg border p-4">
                    <p className="font-medium text-foreground">Posting Configuration</p>
                    <dl className="mt-2 grid gap-2 text-xs text-muted-foreground md:grid-cols-2">
                      <div>
                        <dt className="uppercase tracking-wide">Type</dt>
                        <dd className="text-sm text-foreground">{selectedAccount.accountType}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide">Category</dt>
                        <dd className="text-sm text-foreground">{selectedAccount.category ?? 'Uncategorized'}</dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide">Parent Account</dt>
                        <dd className="text-sm text-foreground">
                          {selectedAccount.parentAccountId
                            ? flattened.find((node) => node.id === selectedAccount.parentAccountId)?.accountName ?? 'Parent account'
                            : 'Top level'}
                        </dd>
                      </div>
                      <div>
                        <dt className="uppercase tracking-wide">Tax Mapping</dt>
                        <dd className="text-sm text-foreground">{selectedAccount.taxLineMapping ?? 'Not mapped'}</dd>
                      </div>
                    </dl>
                  </div>
                  {selectedAccount.description && (
                    <div className="rounded-lg border p-4">
                      <p className="font-medium text-foreground">Description</p>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedAccount.description}</p>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => handleEdit(selectedAccount)}>
                    <Edit3 className="mr-2 h-4 w-4" /> Edit Account
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setTransactionsAccount(selectedAccount)}>
                    View Transactions
                  </Button>
                  <Button
                    size="sm"
                    variant={selectedAccount.isActive ? 'ghost' : 'secondary'}
                    onClick={() => {
                      if (selectedAccount.isActive && Math.abs(Number(selectedAccount.balance ?? 0)) > 0) {
                        toast({
                          title: 'Balance must be zero',
                          description: 'Clear outstanding balance before inactivating the account.',
                          variant: 'destructive',
                        });
                        return;
                      }
                      toggleActiveMutation.mutate(selectedAccount);
                    }}
                    disabled={toggleActiveMutation.isPending}
                  >
                    {toggleActiveMutation.isPending
                      ? 'Updating…'
                      : selectedAccount.isActive
                      ? 'Mark Inactive'
                      : 'Activate Account'}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select an account to view configuration, balances, and available actions.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{formMode === 'edit' ? 'Edit General Ledger Account' : 'Create General Ledger Account'}</DialogTitle>
          </DialogHeader>
          <GLAccountFormContent
            accounts={accounts ?? []}
            accountId={formMode === 'edit' ? selectedAccount?.id : undefined}
            defaultValues={
              formMode === 'edit' && selectedAccount
                ? {
                    accountNumber: selectedAccount.accountNumber,
                    accountName: selectedAccount.accountName,
                    accountType: selectedAccount.accountType as GLAccountType,
                    category: selectedAccount.category ?? '',
                    parentAccountId: selectedAccount.parentAccountId ?? '',
                    description: selectedAccount.description ?? '',
                    taxLineMapping: selectedAccount.taxLineMapping ?? '',
                    isActive: Boolean(selectedAccount.isActive),
                    allowManual: selectedAccount.allowManual ?? true,
                    balance: Number(selectedAccount.balance ?? 0),
                  }
                : undefined
            }
            onSuccess={(account) => {
              setSelectedAccountId(account.id);
              setFormOpen(false);
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(transactionsAccount)} onOpenChange={(open) => !open && setTransactionsAccount(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Transactions • {transactionsAccount?.accountNumber} {transactionsAccount?.accountName}</DialogTitle>
          </DialogHeader>
          {transactionsLoading ? (
            <div className="flex h-48 items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : transactionLines && transactionLines.length > 0 ? (
            <ScrollArea className="h-96 pr-4">
              <table className="w-full text-sm">
                <thead className="text-xs uppercase text-muted-foreground">
                  <tr className="border-b">
                    <th className="px-3 py-2 text-left">Date</th>
                    <th className="px-3 py-2 text-left">Journal Entry</th>
                    <th className="px-3 py-2 text-left">Description</th>
                    <th className="px-3 py-2 text-right">Debit</th>
                    <th className="px-3 py-2 text-right">Credit</th>
                  </tr>
                </thead>
                <tbody>
                  {transactionLines.map((line) => (
                    <tr key={line.id} className="border-b last:border-0">
                      <td className="px-3 py-2 text-left text-xs text-muted-foreground">
                        {format(new Date(line.postingDate), 'MMM d, yyyy')}
                      </td>
                      <td className="px-3 py-2 text-left font-medium">
                        {line.journalEntryNumber ?? line.journalEntryId}
                      </td>
                      <td className="px-3 py-2 text-left text-muted-foreground">
                        {line.description ?? line.memo ?? '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-emerald-600">
                        {line.debit ? currency.format(line.debit) : '—'}
                      </td>
                      <td className="px-3 py-2 text-right font-medium text-rose-600">
                        {line.credit ? currency.format(line.credit) : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </ScrollArea>
          ) : (
            <p className="text-sm text-muted-foreground">No transactions have been posted to this account yet.</p>
          )}
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );
}
