import { useState, Fragment } from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AccountNode } from '@/lib/accountingApi';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

interface AccountTreeProps {
  accounts: AccountNode[];
  selectedAccountId?: string;
  onSelect?: (account: AccountNode) => void;
  showBalance?: boolean;
}

function AccountTreeItem({
  account,
  depth,
  selectedAccountId,
  onSelect,
  showBalance,
}: {
  account: AccountNode;
  depth: number;
  selectedAccountId?: string;
  onSelect?: (account: AccountNode) => void;
  showBalance?: boolean;
}) {
  const [isOpen, setOpen] = useState(depth < 1);
  const hasChildren = account.children.length > 0;

  return (
    <Fragment>
      <button
        type="button"
        onClick={() => (hasChildren ? setOpen((prev) => !prev) : onSelect?.(account))}
        onDoubleClick={() => onSelect?.(account)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors',
          selectedAccountId === account.id ? 'bg-primary/10 text-primary-foreground' : 'hover:bg-muted',
        )}
        style={{ paddingLeft: `${depth * 1.25 + 0.75}rem` }}
      >
        {hasChildren ? (
          isOpen ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )
        ) : (
          <span className="inline-block h-4 w-4" />
        )}
        <span className="font-mono text-xs text-muted-foreground">{account.accountNumber}</span>
        <span className="flex-1 truncate">{account.accountName}</span>
        {showBalance && account.balance !== undefined && account.balance !== null && (
          <span className="text-right text-xs font-semibold text-muted-foreground">
            {currency.format(Number(account.balance))}
          </span>
        )}
      </button>
      {hasChildren && isOpen && (
        <div className="space-y-1">
          {account.children.map((child) => (
            <AccountTreeItem
              key={child.id}
              account={child}
              depth={depth + 1}
              selectedAccountId={selectedAccountId}
              onSelect={onSelect}
              showBalance={showBalance}
            />
          ))}
        </div>
      )}
    </Fragment>
  );
}

export function AccountTree({ accounts, selectedAccountId, onSelect, showBalance = true }: AccountTreeProps) {
  return (
    <div className="rounded-lg border bg-card">
      <div className="divide-y">
        {accounts.map((account) => (
          <AccountTreeItem
            key={account.id}
            account={account}
            depth={0}
            selectedAccountId={selectedAccountId}
            onSelect={onSelect}
            showBalance={showBalance}
          />
        ))}
      </div>
    </div>
  );
}

export default AccountTree;
