import { useEffect, useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useRoute } from 'react-router-dom';
import { z } from 'zod';
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
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';
import { StatementHeader } from '@/components/accounting/StatementHeader.tsx';

const ACCOUNT_TYPES = [
  { label: 'Asset', value: 'ASSET' },
  { label: 'Liability', value: 'LIABILITY' },
  { label: 'Equity', value: 'EQUITY' },
  { label: 'Revenue', value: 'REVENUE' },
  { label: 'Expense', value: 'EXPENSE' },
] as const;

type AccountTypeValue = (typeof ACCOUNT_TYPES)[number]['value'];

const ACCOUNT_CATEGORIES: Record<AccountTypeValue, string[]> = {
  ASSET: ['Current Assets', 'Fixed Assets', 'Other Assets'],
  LIABILITY: ['Current Liabilities', 'Long-term Liabilities', 'Other Liabilities'],
  EQUITY: ["Owner's Equity", 'Retained Earnings', 'Other Equity'],
  REVENUE: ['Vehicle Sales', 'F&I Revenue', 'Service Revenue', 'Parts Revenue', 'Other Revenue'],
  EXPENSE: ['Cost of Goods Sold', 'Operating Expenses', 'Personnel Expenses', 'Marketing', 'Other Expenses'],
};

const accountFormSchema = z.object({
  accountNumber: z
    .string()
    .trim()
    .regex(/^\d{4,7}$/u, 'Account number must be 4-7 digits.'),
  accountName: z.string().trim().min(1, 'Account name is required.'),
  accountType: z.enum(['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE']),
  category: z.string().trim().optional(),
  parentAccountId: z.string().trim().optional(),
  description: z.string().trim().optional(),
  taxLineMapping: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  allowManual: z.boolean().default(true),
});

type GLAccountFormValues = z.infer<typeof accountFormSchema>;

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

interface GLAccountFormContentProps {
  accounts: AccountNode[];
  accountId?: string;
  defaultValues?: Partial<GLAccountFormValues> & { balance?: number | null };
  onSuccess?: (account: AccountNode) => void;
  onCancel?: () => void;
}

export function GLAccountFormContent({
  accounts,
  accountId,
  defaultValues,
  onSuccess,
  onCancel,
}: GLAccountFormContentProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const flattened = useMemo(() => flattenAccounts(accounts), [accounts]);
  const currentAccount = accountId ? flattened.find((node) => node.id === accountId) : undefined;

  const initialValues = useMemo(
    () => ({
      accountNumber: defaultValues?.accountNumber ?? '',
      accountName: defaultValues?.accountName ?? '',
      accountType: (defaultValues?.accountType as AccountTypeValue | undefined) ?? 'ASSET',
      category: defaultValues?.category ?? '',
      parentAccountId: defaultValues?.parentAccountId ?? '',
      description: defaultValues?.description ?? '',
      taxLineMapping: defaultValues?.taxLineMapping ?? '',
      isActive: defaultValues?.isActive ?? true,
      allowManual: defaultValues?.allowManual ?? true,
    }),
    [defaultValues],
  );

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setError,
    setValue,
    formState: { errors },
  } = useForm<GLAccountFormValues>({
    resolver: zodResolver(accountFormSchema),
    defaultValues: initialValues,
  });

  useEffect(() => {
    reset(initialValues);
  }, [initialValues, reset]);

  const selectedType = watch('accountType');
  const selectedCategory = watch('category');
  const availableCategories = ACCOUNT_CATEGORIES[selectedType];

  useEffect(() => {
    if (availableCategories.length === 0) {
      setValue('category', '', { shouldDirty: false, shouldTouch: true });
      return;
    }
    if (!selectedCategory || !availableCategories.includes(selectedCategory)) {
      setValue('category', availableCategories[0] ?? '', { shouldDirty: false, shouldTouch: true });
    }
  }, [availableCategories, selectedCategory, setValue]);

  const parentOptions = useMemo(() => {
    const invalidIds = new Set<string>();
    if (currentAccount) {
      const addDescendants = (node: AccountNode) => {
        for (const child of node.children ?? []) {
          invalidIds.add(child.id);
          addDescendants(child);
        }
      };
      invalidIds.add(currentAccount.id);
      addDescendants(currentAccount);
    }
    return flattened.filter((node) => {
      const isTopLevel = node.parentAccountId === null || node.parentAccountId === undefined || node.parentAccountId === '';
      return isTopLevel && !invalidIds.has(node.id) && node.accountType === selectedType;
    });
  }, [flattened, currentAccount, selectedType]);

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

  const onSubmit = handleSubmit((values) => {
    const trimmedNumber = values.accountNumber.trim();
    const trimmedName = values.accountName.trim();

    const duplicate = flattened.find(
      (account) => account.accountNumber === trimmedNumber && account.id !== accountId,
    );
    if (duplicate) {
      setError('accountNumber', { type: 'validate', message: 'Account number must be unique.' });
      return;
    }

    if (!trimmedName) {
      setError('accountName', { type: 'validate', message: 'Account name is required.' });
      return;
    }

    const currentBalance = Number(defaultValues?.balance ?? currentAccount?.balance ?? 0);
    if (!values.isActive && Math.abs(currentBalance) > 0) {
      toast({
        title: 'Cannot deactivate account',
        description: 'Accounts with a non-zero balance must remain active until cleared.',
        variant: 'destructive',
      });
      return;
    }

    const category = values.category?.trim() ?? '';
    const parentAccountId = values.parentAccountId?.trim() ?? '';
    const description = values.description?.trim() ?? '';
    const taxLineMapping = values.taxLineMapping?.trim() ?? '';

    mutation.mutate({
      id: accountId,
      accountNumber: trimmedNumber,
      accountName: trimmedName,
      accountType: values.accountType,
      normalBalance:
        currentAccount?.normalBalance ??
        (values.accountType === 'ASSET' || values.accountType === 'EXPENSE' ? 'DEBIT' : 'CREDIT'),
      category: category ? category : null,
      parentAccountId: parentAccountId ? parentAccountId : null,
      description: description ? description : undefined,
      taxLineMapping: taxLineMapping ? taxLineMapping : undefined,
      isActive: values.isActive,
      allowManual: values.allowManual,
    });
  });

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="accountNumber">
            Account Number
          </label>
          <Controller
            control={control}
            name="accountNumber"
            render={({ field }) => <Input id="accountNumber" inputMode="numeric" placeholder="1131" {...field} />}
          />
          {errors.accountNumber && <p className="text-xs text-destructive">{errors.accountNumber.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="accountName">
            Account Name
          </label>
          <Controller
            control={control}
            name="accountName"
            render={({ field }) => <Input id="accountName" placeholder="Operating Account" {...field} />}
          />
          {errors.accountName && <p className="text-xs text-destructive">{errors.accountName.message}</p>}
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Type</label>
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
          <label className="text-sm font-medium">Category</label>
          <Controller
            control={control}
            name="category"
            render={({ field }) => (
              <Select
                value={field.value ?? ''}
                onValueChange={(value) => field.onChange(value)}
                disabled={availableCategories.length === 0}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Parent Account</label>
          <Controller
            control={control}
            name="parentAccountId"
            render={({ field }) => (
              <Select value={field.value ?? ''} onValueChange={(value) => field.onChange(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Top level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">(None)</SelectItem>
                  {parentOptions.map((account) => (
                    <SelectItem key={account.id} value={account.id}>
                      <span className="font-mono text-xs text-muted-foreground">{account.accountNumber}</span> {account.accountName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="taxLineMapping">
            Tax Line Mapping
          </label>
          <Controller
            control={control}
            name="taxLineMapping"
            render={({ field }) => <Input id="taxLineMapping" placeholder="IRS Form Line" {...field} />}
          />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium" htmlFor="description">
            Description
          </label>
          <Controller
            control={control}
            name="description"
            render={({ field }) => <Textarea id="description" rows={3} placeholder="Optional description" {...field} />}
          />
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Active Status</p>
            <p className="text-xs text-muted-foreground">
              Inactive accounts remain in historical reports but cannot be posted to.
            </p>
          </div>
          <Controller
            control={control}
            name="isActive"
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div>
            <p className="text-sm font-medium">Allow Manual Journal Entries</p>
            <p className="text-xs text-muted-foreground">
              Disable to restrict postings to automated system activity only.
            </p>
          </div>
          <Controller
            control={control}
            name="allowManual"
            render={({ field }) => <Switch checked={field.value} onCheckedChange={field.onChange} />}
          />
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
  const [isNewRoute] = useMatch('/accounting/gl-accounts/new');
  const [isEditRoute, params] = useMatch('/accounting/gl-accounts/:id/edit');
  const accountId = !isNewRoute && isEditRoute ? params.id : undefined;

  const { data: accounts, isLoading } = useQuery({
    queryKey: ['accounting', 'accounts'],
    queryFn: fetchAccounts,
  });

  const flattened = useMemo(() => flattenAccounts(accounts ?? []), [accounts]);
  const selectedAccount = accountId ? flattened.find((account) => account.id === accountId) : undefined;

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
            Define the chart of accounts structure, categories, and posting permissions for this tenant.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GLAccountFormContent
            accounts={accounts ?? []}
            accountId={accountId}
            defaultValues={
              selectedAccount
                ? {
                    accountNumber: selectedAccount.accountNumber,
                    accountName: selectedAccount.accountName,
                    accountType: selectedAccount.accountType as AccountTypeValue,
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
            onSuccess={(account) => navigate(`/accounting/gl-accounts?focus=${account.id}`)}
            onCancel={() => navigate('/accounting/gl-accounts')}
          />
        </CardContent>
      </Card>
    </AccountingLayout>
  );
}
