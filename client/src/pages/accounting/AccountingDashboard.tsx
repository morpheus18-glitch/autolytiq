import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { startOfMonth } from 'date-fns';
import AccountingLayout from './AccountingLayout';
import { fetchBalanceSheet, fetchDashboardMetrics, fetchIncomeStatement } from '@/lib/accountingApi';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { BalanceDisplay } from '@/components/accounting/BalanceDisplay';
import { FinancialChart } from '@/components/accounting/FinancialChart';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function AccountingDashboard() {
  const [range, setRange] = useState(() => ({ startDate: startOfMonth(new Date()), endDate: new Date() }));

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['accounting', 'dashboard'],
    queryFn: fetchDashboardMetrics,
  });

  const { data: incomeStatement, isLoading: incomeLoading } = useQuery({
    queryKey: ['accounting', 'dashboard', 'pl', range.startDate.toISOString(), range.endDate.toISOString()],
    queryFn: () =>
      fetchIncomeStatement({ startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() }),
  });

  const { data: balanceSheet, isLoading: balanceLoading } = useQuery({
    queryKey: ['accounting', 'dashboard', 'balance', range.startDate.toISOString(), range.endDate.toISOString()],
    queryFn: () =>
      fetchBalanceSheet({ startDate: range.startDate.toISOString(), endDate: range.endDate.toISOString() }),
  });

  const revenueBreakdown = useMemo(() => {
    const revenue = incomeStatement?.sections.find((section) => section.label === 'Revenue');
    const cogs = incomeStatement?.sections.find((section) => section.label === 'Cost of Goods Sold');
    const expenses = incomeStatement?.sections.find((section) => section.label === 'Operating Expenses');
    return [
      { category: 'Revenue', amount: revenue?.total ?? 0 },
      { category: 'Cost of Goods', amount: cogs?.total ?? 0 },
      { category: 'Operating Expenses', amount: expenses?.total ?? 0 },
    ];
  }, [incomeStatement]);

  const balanceData = useMemo(() => {
    const assets = balanceSheet?.sections.find((section) => section.label === 'Assets');
    const liabilities = balanceSheet?.sections.find((section) => section.label === 'Liabilities');
    const equity = balanceSheet?.sections.find((section) => section.label === 'Equity');
    return [
      { category: 'Assets', value: assets?.total ?? 0 },
      { category: 'Liabilities', value: liabilities?.total ?? 0 },
      { category: 'Equity', value: equity?.total ?? 0 },
    ];
  }, [balanceSheet]);

  if (metricsLoading || incomeLoading || balanceLoading) {
    return (
      <AccountingLayout>
        <div className="space-y-4">
          <Skeleton className="h-10 w-64" />
          <div className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-64" />
        </div>
      </AccountingLayout>
    );
  }

  return (
    <AccountingLayout>
      <StatementHeader
        title="Accounting & Financial Overview"
        startDate={range.startDate}
        endDate={range.endDate}
        onRangeChange={({ startDate, endDate }) => setRange({ startDate, endDate })}
      />

      {metrics && (
        <div className="grid gap-4 md:grid-cols-4">
          <BalanceDisplay title="Monthly Revenue" value={metrics.revenue} subtitle="Recognized this month" />
          <BalanceDisplay title="Gross Profit" value={metrics.grossProfit} subtitle="Total gross profit" />
          <BalanceDisplay title="Net Income" value={metrics.netIncome} subtitle="Current period" />
          <BalanceDisplay title="Cash Balance" value={metrics.cashBalance} subtitle="All cash accounts" />
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Income Statement Composition</h2>
            <p className="text-sm text-muted-foreground">Breakdown of revenues and expenses for the selected period.</p>
            <div className="mt-4 h-[260px]">
              <FinancialChart
                data={revenueBreakdown}
                xKey="category"
                type="bar"
                series={[{ dataKey: 'amount', name: 'Amount', color: '#2563eb' }]}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold">Balance Sheet Snapshot</h2>
            <p className="text-sm text-muted-foreground">Assets, liabilities, and equity as of the end date.</p>
            <div className="mt-4 h-[260px]">
              <FinancialChart
                data={balanceData}
                xKey="category"
                type="bar"
                series={[{ dataKey: 'value', name: 'Total', color: '#22c55e' }]}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </AccountingLayout>
  );
}
