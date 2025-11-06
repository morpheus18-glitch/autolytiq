import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { PropsWithChildren } from 'react';

const NAVIGATION_ITEMS = [
  { label: 'Dashboard', to: '/accounting', exact: true },
  { label: 'P&L Statement', to: '/accounting/pl-statement' },
  { label: 'Balance Sheet', to: '/accounting/balance-sheet' },
  { label: 'Cash Flow', to: '/accounting/cash-flow' },
  { label: 'Journal Entries', to: '/accounting/journal-entries' },
  { label: 'Chart of Accounts', to: '/accounting/gl-accounts' },
  { label: 'Payroll', to: '/accounting/payroll' },
  { label: 'Tax Reports', to: '/accounting/tax-reports' },
];

export function AccountingLayout({ children }: PropsWithChildren) {
  const [location] = useLocation();

  return (
    <div className="flex min-h-full flex-col gap-6">
      <div className="rounded-xl border bg-card/50 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = item.exact ? location === item.to : location.startsWith(item.to);
            return (
              <Link key={item.to} href={item.to} className="group">
                <span
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground shadow'
                      : 'bg-muted text-muted-foreground hover:bg-muted/70',
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </div>
      <Separator />
      <div className="space-y-6 pb-12">{children}</div>
    </div>
  );
}

export default AccountingLayout;
