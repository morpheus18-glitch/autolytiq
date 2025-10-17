import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'wouter';
import AccountingLayout from './AccountingLayout';
import {
  fetchAccounts,
  upsertAccountRequest,
  type AccountNode,
} from '@/lib/accountingApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { StatementHeader } from '@/components/accounting/StatementHeader';

const ACCOUNT_TYPES = [
  { label: 'Asset', value: 'ASSET' },
  { label: 'Liability', value: 'LIABILITY' },
  { label: 'Equity', value: 'EQUITY' },
  { label: 'Revenue', value: 'REVENUE' },
  { label: 'Expense', value: 'EXPENSE' },
];

const NORMAL_BALANCES: Array<{ label: string; value: 'DEBIT' | 'CREDIT' }> = [
  { label: 'Debit', value: 'DEBIT' },
  { label: 'Credit', value: 'CREDIT' },
];

interface GLAccountFormValues {
  accountNumber: string;
  accountName: string;
  accountType: string;
  normalBalance: 'DEBIT' | 'CREDIT';
  parentAccountId?: string | null;
  isActive: boolean;
}

function flattenAccounts(accounts: AccountNode[]): AccountNode[] {
  const result: AccountNode[] = [];
  const traverse = (nodes: AccountNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children?.length) {
        traverse(node.children);
      }
    }
  };
  traverse(accounts);
  return result;
}

interface GLAccountFormContentProps {
  accounts: AccountNode[];
  accountId?: string;
  defaultValues?: Partial<GLAccountFormValues>;
  onSuccess?: (account: AccountNode) => void;
  onCancel?: () => void;
}

export function GLAccountFormContent({ accounts, accountId, defaultValues, onSuccess, onCancel }: GLAccountFormContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { control, handleSubmit, reset, watch, register } = useForm<GLAccountFormValues>({
    defaultValues: {
      accountNumber: '',
      accountName: '',
      accountType: 'ASSET',
      normalBalance: 'DEBIT',
      parentAccountId: null,
      isActive: true,
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      reset({
        accountNumber: defaultValues.accountNumber ?? '',
        accountName: defaultValues.accountName ?? '',
        accountType: defaultValues.accountType ?? 'ASSET',
        normalBalance: defaultValues.normalBalance ?? 'DEBIT',
        parentAccountId: defaultValues.parentAccountId ?? null,
        isActive: defaultValues.isActive ?? true,
      });
    }
  }, [defaultValues, reset]);

  const mutation = useMutation({
    mutationFn: upsertAccountRequest,
    onSuccess: (account) => {
      toast({ title: 'Account saved', description: `${account.accountNumber} • ${account.accountName}` });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'accounts'] });
      onSuccess?.(account);
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to save account',
        description: error instanceof Error ? error.message : 'Please verify account details.',
        variant: 'destructive',
      });
    },
  });

  const flattened = useMemo(() => flattenAccounts(accounts), [accounts]);
  const parentOptions = useMemo(
    () => flattened.filter((account) => account.id !== accountId),
    [flattened, accountId],
  );
  const isActive = watch('isActive');

  const onSubmit = handleSubmit((values) => {
    if (!values.accountNumber.trim() || !values.accountName.trim()) {
      toast({ title: 'Missing required fields', description: 'Account number and name are required.', variant: 'destructive' });
      return;
    }

    mutation.mutate({
      id: accountId,
      accountNumber: values.accountNumber.trim(),
      accountName: values.accountName.trim(),
      accountType: values.accountType,
      normalBalance: values.normalBalance,
      parentAccountId: values.parentAccountId ?? undefined,
      isActive: values.isActive,
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="accountNumber">
            Account Number
          </label>
          <Input id="accountNumber" placeholder="1000" {...register('accountNumber')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground" htmlFor="accountName">
            Account Name
          </label>
          <Input id="accountName" placeholder="Cash" {...register('accountName')} />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Account Type</label>
          <Controller
            control={control}
            name="accountType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {ACCOUNT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Normal Balance</label>
          <Controller
            control={control}
            name="normalBalance"
            render={({ field }) => (
              <Select value={field.value} onValueChange={(value) => field.onChange(value as 'DEBIT' | 'CREDIT')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select balance" />
                </SelectTrigger>
                <SelectContent>
                  {NORMAL_BALANCES.map((balance) => (
                    <SelectItem key={balance.value} value={balance.value}>
                      {balance.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Parent Account</label>
          <Controller
            control={control}
            name="parentAccountId"
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => field.onChange(value ? value : null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Top level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">(None)</SelectItem>
                  {parentOptions.map((account) => (
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
        <div className="flex items-center gap-2 pt-8">
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => (
              <Switch checked={field.value} onCheckedChange={field.onChange} />
            )}
          />
          <span className="text-sm text-muted-foreground">
            {isActive
              ? 'Account is available when posting journal entries.'
              : 'Inactive accounts remain in historical reports but cannot be posted.'}
          </span>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={mutation.isLoading}>
          {mutation.isLoading ? 'Saving…' : 'Save Account'}
        </Button>
      </div>
    </form>
  );
}

export default function GLAccountForm() {
  const [, navigate] = useLocation();
  const [isNewRoute] = useRoute('/accounting/gl-accounts/new');
  const [isEditRoute, params] = useRoute('/accounting/gl-accounts/:id/edit');
  const accountId = !isNewRoute && isEditRoute ? params.id : undefined;

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const flattened = useMemo(() => flattenAccounts(accounts ?? []), [accounts]);
  const selectedAccount = flattened.find((account) => account.id === accountId);

  if (isLoading) {
    return (
      <AccountingLayout>
        <Skeleton className="h-12 w-64" />
        <Skeleton className="h-64" />
      </AccountingLayout>
    );
  }

  return (
    <AccountingLayout>
      <StatementHeader title={accountId ? 'Edit GL Account' : 'New GL Account'} />
      <Card>
        <CardHeader>
          <CardTitle>{accountId ? 'Update account' : 'Add new account'}</CardTitle>
          <CardDescription>
            Define chart of account structure, normal balances, and activation status. Every account is tenant-isolated.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GLAccountFormContent
            accounts={accounts ?? []}
            accountId={accountId}
            defaultValues={selectedAccount ? {
              accountNumber: selectedAccount.accountNumber,
              accountName: selectedAccount.accountName,
              accountType: selectedAccount.accountType,
              normalBalance: selectedAccount.normalBalance as 'DEBIT' | 'CREDIT',
              parentAccountId: selectedAccount.parentAccountId ?? null,
              isActive: Boolean(selectedAccount.isActive),
            } : undefined}
            onSuccess={(account) => navigate(`/accounting/gl-accounts?focus=${account.id}`)}
            onCancel={() => navigate('/accounting/gl-accounts')}
          />
        </CardContent>
      </Card>
    </AccountingLayout>
  );
}
