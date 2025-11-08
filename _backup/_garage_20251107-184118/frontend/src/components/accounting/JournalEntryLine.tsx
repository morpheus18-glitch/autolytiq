import { Controller, Control, FieldErrors } from 'react-hook-form';
import { Button } from '@repo/ui';
import { Input } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import type { AccountNode } from '@/lib/accountingApi';

interface JournalEntryFormLine {
  glAccountId: string;
  type: 'DEBIT' | 'CREDIT';
  amount: number;
  description?: string;
}

interface JournalEntryLineProps {
  index: number;
  control: Control<{ lines: JournalEntryFormLine[] }>;
  remove: (index: number) => void;
  accounts: AccountNode[];
  errors?: FieldErrors<{ lines: JournalEntryFormLine[] }>;
  disabled?: boolean;
}

function flattenAccounts(accounts: AccountNode[]): AccountNode[] {
  const result: AccountNode[] = [];
  const traverse = (nodes: AccountNode[]) => {
    for (const node of nodes) {
      result.push(node);
      if (node.children.length) {
        traverse(node.children);
      }
    }
  };
  traverse(accounts);
  return result;
}

export function JournalEntryLine({ index, control, remove, accounts, errors, disabled = false }: JournalEntryLineProps) {
  const flatAccounts = flattenAccounts(accounts);
  const fieldError = errors?.lines?.[index];

  return (
    <div className="grid grid-cols-12 items-center gap-2 rounded-lg border px-3 py-2">
      <div className="col-span-4">
        <Controller
          control={control}
          name={`lines.${index}.glAccountId`}
          render={({ field }) => (
            <Select onValueChange={field.onChange} value={field.value} disabled={disabled}>
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {flatAccounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    <div className="flex flex-col">
                      <span className="font-medium">{account.accountName}</span>
                      <span className="text-xs text-muted-foreground">{account.accountNumber}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {fieldError?.glAccountId && (
          <p className="mt-1 text-xs text-destructive">Account is required</p>
        )}
      </div>
      <div className="col-span-2">
        <Controller
          control={control}
          name={`lines.${index}.type`}
          render={({ field }) => (
            <Select
              onValueChange={(value) => field.onChange(value as 'DEBIT' | 'CREDIT')}
              value={field.value}
              disabled={disabled}
            >
              <SelectTrigger disabled={disabled}>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBIT">Debit</SelectItem>
                <SelectItem value="CREDIT">Credit</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </div>
      <div className="col-span-3">
        <Controller
          control={control}
          name={`lines.${index}.amount`}
          render={({ field }) => (
            <Input
              type="number"
              step="0.01"
              min="0"
              value={field.value ?? ''}
              onChange={(event) => field.onChange(parseFloat(event.target.value))}
              placeholder="0.00"
              disabled={disabled}
            />
          )}
        />
        {fieldError?.amount && (
          <p className="mt-1 text-xs text-destructive">Amount is required</p>
        )}
      </div>
      <div className="col-span-2">
        <Controller
          control={control}
          name={`lines.${index}.description`}
          render={({ field }) => (
            <Input value={field.value ?? ''} onChange={field.onChange} placeholder="Memo" disabled={disabled} />
          )}
        />
      </div>
      <div className="col-span-1 flex justify-end">
        <Button type="button" variant="ghost" size="sm" onClick={() => remove(index)} disabled={disabled}>
          Remove
        </Button>
      </div>
    </div>
  );
}

export default JournalEntryLine;
