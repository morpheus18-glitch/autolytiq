import { Fragment, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth } from 'date-fns';
import AccountingLayout from './AccountingLayout';
import { fetchIncomeStatement } from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { ExportButton } from '@/components/accounting/ExportButton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
});

export default function PLStatement() {
  const [range, setRange] = useState(() => ({ startDate: startOfMonth(new Date()), endDate: new Date() }));
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});

  const { data: statement, isLoading } = useQuery({
    queryKey: ['accounting', 'pl', range.startDate.toISOString(), range.endDate.toISOString()],
    queryFn: () => fetchIncomeStatement({ startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() }),
  });

  if (isLoading || !statement) {
    return (
      <AccountingLayout>
        <Skeleton className="h-12 w-72" />
        <Skeleton className="h-64" />
      </AccountingLayout>
    );
  }

  return (
    <AccountingLayout>
      <StatementHeader
        title="Profit & Loss Statement"
        startDate={range.startDate}
        endDate={range.endDate}
        onRangeChange={({ startDate, endDate }) => setRange({ startDate, endDate })}
        actions={<ExportButton statement="pl" startDate={range.startDate} endDate={range.endDate} />}
      />

      <div className="space-y-6">
        {statement.sections.map((section) => (
          <Card key={section.label} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{section.label}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {currency.format(section.total)} total {section.label.toLowerCase()}
                </p>
              </div>
              <div className="text-right text-sm font-semibold text-muted-foreground">
                {currency.format(section.total)}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[220px]">Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="w-[140px] text-right">Amount</TableHead>
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
                          <TableCell className="font-medium">
                            <div className="flex flex-col">
                              <span>{account.accountName}</span>
                              <span className="text-xs text-muted-foreground">{account.accountNumber}</span>
                            </div>
                          </TableCell>
                          <TableCell>{account.entries.length > 0 ? `${account.entries.length} transactions` : 'No activity'}</TableCell>
                          <TableCell className="text-right font-semibold">
                            {currency.format(account.total)}
                          </TableCell>
                        </TableRow>
                        {isExpanded && account.entries.length > 0 && (
                          <TableRow key={`${account.accountId}-entries`} className="bg-muted/30">
                            <TableCell colSpan={3}>
                              <div className="space-y-2">
                                {account.entries.map((entry) => (
                                  <div key={entry.journalEntryId} className="flex items-center justify-between text-sm">
                                    <div>
                                      <p className="font-medium text-foreground">{entry.entryNumber}</p>
                                      <p className="text-xs text-muted-foreground">
                                        {format(new Date(entry.postingDate), 'MMM d, yyyy')} • {entry.memo ?? 'No memo'}
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs text-emerald-600">
                                        Debit: {currency.format(entry.debit)} | Credit: {currency.format(entry.credit)}
                                      </p>
                                    </div>
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
