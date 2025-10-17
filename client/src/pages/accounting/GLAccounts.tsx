import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import AccountingLayout from './AccountingLayout';
import { AccountTree } from '@/components/accounting/AccountTree';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  fetchAccounts,
  deactivateAccountRequest,
  upsertAccountRequest,
  type AccountNode,
} from '@/lib/accountingApi';
import { GLAccountFormContent } from './GLAccountForm';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'wouter';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

function flattenAccounts(accounts: AccountNode[]): AccountNode[] {
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

export default function GLAccounts() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const flattened = useMemo(() => flattenAccounts(accounts ?? []), [accounts]);
  const selected = flattened.find((account) => account.id === selectedAccountId) ?? null;

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => deactivateAccountRequest(id),
    onSuccess: () => {
      toast({ title: 'Account deactivated', description: 'Account removed from posting lists.' });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to deactivate account',
        description: error instanceof Error ? error.message : 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  const activateMutation = useMutation({
    mutationFn: (account: AccountNode) =>
      upsertAccountRequest({
        id: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType,
        normalBalance: account.normalBalance,
        parentAccountId: account.parentAccountId ?? undefined,
        isActive: true,
      }),
    onSuccess: () => {
      toast({ title: 'Account activated', description: 'Account available for new postings.' });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts'] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to activate account',
        description: error instanceof Error ? error.message : 'Try again later.',
        variant: 'destructive',
      });
    },
  });

  if (isLoading) {
    return (
      <AccountingLayout>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-80" />
      </AccountingLayout>
    );
  }

  const handleCreate = () => {
    setFormMode('create');
    setFormOpen(true);
  };

  const handleEdit = () => {
    if (!selected) {
      toast({ title: 'Select an account', description: 'Choose an account from the tree to edit.' });
      return;
    }
    setFormMode('edit');
    setFormOpen(true);
  };

  const toggleActive = () => {
    if (!selected) return;
    if (selected.isActive) {
      deactivateMutation.mutate(selected.id);
    } else {
      activateMutation.mutate(selected);
    }
  };

  return (
    <AccountingLayout>
      <StatementHeader title="Chart of Accounts" />

      <div className="grid gap-6 lg:grid-cols-[360px,1fr]">
        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Accounts</CardTitle>
              <CardDescription>Hierarchical chart of accounts scoped to this tenant.</CardDescription>
            </div>
            <Button size="sm" variant="outline" onClick={handleCreate}>
              New Account
            </Button>
          </CardHeader>
          <CardContent>
            {accounts && accounts.length > 0 ? (
              <AccountTree
                accounts={accounts}
                selectedAccountId={selectedAccountId ?? undefined}
                onSelect={(account) => setSelectedAccountId(account.id)}
                showBalance
              />
            ) : (
              <p className="text-sm text-muted-foreground">No accounts defined yet. Create the first account to begin.</p>
            )}
          </CardContent>
        </Card>

        <Card className="h-full">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{selected ? selected.accountName : 'Account Detail'}</CardTitle>
              <CardDescription>
                {selected
                  ? `${selected.accountNumber} • ${selected.accountType} • Normal ${selected.normalBalance}`
                  : 'Select an account from the tree to review balances and status.'}
              </CardDescription>
            </div>
            {selected && (
              <Badge variant={selected.isActive ? 'default' : 'secondary'}>
                {selected.isActive ? 'Active' : 'Inactive'}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {selected ? (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Balance</p>
                    <p className="text-2xl font-semibold text-foreground">
                      {currency.format(Number(selected.balance ?? 0))}
                    </p>
                  </div>
                  <div className="rounded-lg border bg-muted/40 p-4">
                    <p className="text-xs font-medium uppercase text-muted-foreground">Account Number</p>
                    <p className="text-lg font-semibold text-foreground">{selected.accountNumber}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={handleEdit}>
                    Edit Account
                  </Button>
                  <Button
                    size="sm"
                    variant={selected.isActive ? 'outline' : 'secondary'}
                    onClick={toggleActive}
                    disabled={deactivateMutation.isLoading || activateMutation.isLoading}
                  >
                    {selected.isActive
                      ? deactivateMutation.isLoading
                        ? 'Deactivating…'
                        : 'Deactivate'
                      : activateMutation.isLoading
                      ? 'Activating…'
                      : 'Activate'}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => navigate(`/accounting/journal-entries?account=${selected.id}`)}>
                    View Transactions
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Choose an account to display metrics and management actions.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{formMode === 'edit' ? 'Edit account' : 'New account'}</DialogTitle>
          </DialogHeader>
          <GLAccountFormContent
            accounts={accounts ?? []}
            accountId={formMode === 'edit' ? selected?.id : undefined}
            defaultValues={
              formMode === 'edit' && selected
                ? {
                    accountNumber: selected.accountNumber,
                    accountName: selected.accountName,
                    accountType: selected.accountType,
                    normalBalance: selected.normalBalance as 'DEBIT' | 'CREDIT',
                    parentAccountId: selected.parentAccountId ?? null,
                    isActive: Boolean(selected.isActive),
                  }
                : undefined
            }
            onSuccess={(account) => {
              setFormOpen(false);
              setSelectedAccountId(account.id);
            }}
            onCancel={() => setFormOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );
}
