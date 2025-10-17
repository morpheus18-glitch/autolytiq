import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth } from 'date-fns';
import AccountingLayout from './AccountingLayout';
import { fetchCashFlow } from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { ExportButton } from '@/components/accounting/ExportButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export default function CashFlowStatement() {
  const [range, setRange] = useState(() => ({ startDate: startOfMonth(new Date()), endDate: new Date() }));
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});

  const { data: statement, isLoading } = useQuery({
    queryKey: ['accounting', 'cash-flow', range.startDate.toISOString(), range.endDate.toISOString()],
    queryFn: () => fetchCashFlow({ startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() }),
  });

  if (isLoading || !statement) {
    return (
      <AccountingLayout>
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64" />
      </AccountingLayout>
    );
  }

  const netChange = statement.totals.netChange ?? 0;

  return (
    <AccountingLayout>
      <StatementHeader
        title="Cash Flow Statement"
        startDate={range.startDate}
        endDate={range.endDate}
        onRangeChange={({ startDate, endDate }) => setRange({ startDate, endDate })}
        actions={<ExportButton statement="cash-flow" startDate={range.startDate} endDate={range.endDate} />}
      />

      <Card className="bg-muted/40">
        <CardHeader>
          <CardTitle>Net Change in Cash</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold text-emerald-600">{currency.format(netChange)}</p>
        </CardContent>
      </Card>

      <div className="space-y-6">
        {statement.sections.map((section) => (
          <Card key={section.label} className="shadow-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>{section.label}</CardTitle>
                <span className="text-sm font-semibold text-muted-foreground">{currency.format(section.total)}</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cash Account</TableHead>
                    <TableHead className="text-right">Net Movement</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.accounts.map((account) => {
                    const isExpanded = expandedAccounts[account.accountId];
                    return (
                      <Fragment key={account.accountId}>
                        <TableRow
                          className="cursor-pointer"
                          onClick={() =>
                            setExpandedAccounts((prev) => ({
                              ...prev,
                              [account.accountId]: !prev[account.accountId],
                            }))
                          }
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{account.accountName}</span>
                              <span className="text-xs text-muted-foreground">{account.accountNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{currency.format(account.total)}</TableCell>
                        </TableRow>
                        {isExpanded && account.entries.length > 0 && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={2}>
                              <div className="space-y-2 text-sm">
                                {account.entries.map((entry) => (
                                  <div key={entry.journalEntryId} className="flex items-center justify-between">
                                    <span>{entry.entryNumber}</span>
                                    <span className="text-muted-foreground">
                                      {currency.format(entry.debit - entry.credit)} • {new Date(entry.postingDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </AccountingLayout>
  );
}
