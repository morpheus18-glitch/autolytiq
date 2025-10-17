import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Link } from 'wouter';
import AccountingLayout from './AccountingLayout';
import { fetchPayrolls, fetchPayroll } from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });

export default function Payroll() {
  const { data: payrolls, isLoading } = useQuery({
    queryKey: ['accounting', 'payrolls'],
    queryFn: fetchPayrolls,
  });
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { data: payrollDetail, isLoading: detailLoading } = useQuery({
    queryKey: ['accounting', 'payroll', selectedId],
    queryFn: () => fetchPayroll(selectedId as string),
    enabled: Boolean(selectedId),
  });

  return (
    <AccountingLayout>
      <StatementHeader
        title="Payroll & Commissions"
        actions={
          <Link href="/accounting/payroll/calculate">
            <Button>Run Payroll</Button>
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.5fr,1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Payroll History</CardTitle>
            <CardDescription>Review net pay, employer tax, and posting status for each payroll run.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isLoading ? (
              <div className="space-y-2 p-6">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[140px]">Period</TableHead>
                      <TableHead className="w-[120px]">Status</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead className="text-right">Taxes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrolls?.map((payroll) => {
                      const isSelected = payroll.id === selectedId;
                      return (
                        <TableRow
                          key={payroll.id}
                          className={isSelected ? 'bg-muted/40' : 'cursor-pointer hover:bg-muted/40'}
                          onClick={() => setSelectedId(payroll.id)}
                        >
                          <TableCell className="font-medium">
                            {format(new Date(payroll.periodStart), 'MMM d')} – {format(new Date(payroll.periodEnd), 'MMM d, yyyy')}
                          </TableCell>
                          <TableCell>
                            <Badge variant={payroll.status === 'POSTED' ? 'default' : payroll.status === 'APPROVED' ? 'secondary' : 'outline'}>
                              {payroll.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{currency.format(payroll.totalGross)}</TableCell>
                          <TableCell className="text-right">{currency.format(payroll.totalNet)}</TableCell>
                          <TableCell className="text-right">{currency.format(payroll.totalTaxes)}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                {payrolls && payrolls.length === 0 && (
                  <p className="p-6 text-sm text-muted-foreground">No payroll runs yet. Start by running your first payroll.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Payroll Detail</CardTitle>
            <CardDescription>
              {selectedId ? 'Line-level payroll information with commissions and deductions.' : 'Select a payroll run to view summary.'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {detailLoading ? (
              <Skeleton className="h-32" />
            ) : payrollDetail ? (
              <>
                <div className="grid gap-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Period</span>
                    <span className="font-medium">
                      {format(new Date(payrollDetail.periodStart), 'MMM d')} – {format(new Date(payrollDetail.periodEnd), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Gross</span>
                    <span className="font-semibold">{currency.format(payrollDetail.totalGross)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Net</span>
                    <span className="font-semibold">{currency.format(payrollDetail.totalNet)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Taxes</span>
                    <span className="font-semibold">{currency.format(payrollDetail.totalTaxes)}</span>
                  </div>
                  {payrollDetail.journalEntryId && (
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Journal Entry</span>
                      <Link href={`/accounting/journal-entries/${payrollDetail.journalEntryId}`}>
                        <Button variant="link" className="px-0">
                          View entry
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold uppercase text-muted-foreground">Employees</h4>
                  <div className="max-h-64 space-y-2 overflow-y-auto pr-2">
                    {payrollDetail.lines.map((line) => (
                      <div key={line.id} className="rounded-lg border bg-muted/30 p-3 text-sm">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">{line.userId}</span>
                          <span className="text-muted-foreground">Net {currency.format(line.netPay)}</span>
                        </div>
                        <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                          <span>Gross: {currency.format(line.grossPay)}</span>
                          <span>Deductions: {currency.format(line.deductions)}</span>
                          <span>Employer Taxes: {currency.format(line.employerTaxes)}</span>
                          {line.commissionAmount !== undefined && (
                            <span>Commissions: {currency.format(line.commissionAmount ?? 0)}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">Payroll detail will appear here once a run is selected.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
