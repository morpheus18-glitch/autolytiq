import { useMemo, useState, type ChangeEvent } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth } from 'date-fns';
import {
  fetchFiDashboardActiveDeals,
  fetchFiDashboardCommission,
  fetchFiDashboardKpis,
  fetchFiDashboardLenderPerformance,
  fetchFiDashboardProductPerformance,
  listLenders,
  type FiDashboardActiveDealDto,
  type FiDashboardCommissionDto,
  type FiDashboardFilters,
  type FiDashboardKpisDto,
  type FiDashboardLenderPerformanceDto,
  type FiDashboardMetricDto,
  type FiDashboardProductPerformanceDto,
  type LenderDto,
} from '../api';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Input } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { cn } from '@/lib/utils';
import { TrendingDown, TrendingUp, Minus, DollarSign, Package, Percent, ClipboardCheck } from 'lucide-react';

interface FilterState {
  startDate: Date;
  endDate: Date;
  lenderId: string | 'all';
  salespersonId: string | 'all';
}

function toDateInputValue(date: Date) {
  return format(date, 'yyyy-MM-dd');
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value ?? 0);
}

function formatCurrencyWithCents(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value ?? 0);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

function formatDecimal(value: number) {
  return value.toFixed(2);
}

function formatDateTime(value: string | null) {
  if (!value) {
    return '—';
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return '—';
  }
  return format(parsed, 'MMM d, yyyy');
}

function TrendBadge({ metric, emphasizeCurrency }: { metric: FiDashboardMetricDto; emphasizeCurrency?: boolean }) {
  const { delta, percentChange } = metric;
  const isUp = delta > 0;
  const isDown = delta < 0;
  const Icon = isUp ? TrendingUp : isDown ? TrendingDown : Minus;
  const tone = isUp ? 'text-emerald-600 bg-emerald-100' : isDown ? 'text-rose-600 bg-rose-100' : 'text-slate-500 bg-slate-100';
  const absoluteDelta = Math.abs(delta);
  const formattedDelta = emphasizeCurrency
    ? formatCurrencyWithCents(absoluteDelta)
    : Number.isInteger(absoluteDelta)
      ? absoluteDelta.toLocaleString()
      : absoluteDelta.toFixed(2);
  const formattedPercent = percentChange === null ? null : `${percentChange > 0 ? '+' : ''}${percentChange.toFixed(1)}%`;

  return (
    <div className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium', tone)}>
      <Icon className="h-3 w-3" />
      <span>{delta === 0 ? 'Flat vs LM' : `${delta > 0 ? 'Up' : 'Down'} ${formattedDelta}`}</span>
      {formattedPercent ? <span className="text-[10px] text-slate-600">({formattedPercent})</span> : null}
    </div>
  );
}

function MetricCard({
  title,
  icon: Icon,
  metric,
  formatter,
  emphasizeCurrency,
}: {
  title: string;
  icon: typeof DollarSign;
  metric?: FiDashboardMetricDto;
  formatter: (value: number) => string;
  emphasizeCurrency?: boolean;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-2">
        {metric ? (
          <>
            <div className="text-2xl font-semibold tracking-tight">{formatter(metric.value)}</div>
            <TrendBadge metric={metric} emphasizeCurrency={emphasizeCurrency} />
          </>
        ) : (
          <Skeleton className="h-12 w-full" />
        )}
      </CardContent>
    </Card>
  );
}

function useDashboardFilters(filters: FilterState): FiDashboardFilters {
  return useMemo(() => {
    const payload: FiDashboardFilters = {
      startDate: filters.startDate.toISOString(),
      endDate: filters.endDate.toISOString(),
    };
    if (filters.lenderId !== 'all') {
      payload.lenderId = filters.lenderId;
    }
    if (filters.salespersonId !== 'all') {
      payload.salespersonId = filters.salespersonId;
    }
    return payload;
  }, [filters]);
}

function useSalespersonOptions(activeDeals?: FiDashboardActiveDealDto[]) {
  return useMemo(() => {
    if (!activeDeals) {
      return [] as Array<{ id: string; name: string }>;
    }
    const map = new Map<string, string>();
    for (const deal of activeDeals) {
      if (deal.salesperson) {
        map.set(deal.salesperson.id, deal.salesperson.name);
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [activeDeals]);
}

export default function FIManagerDashboard() {
  const [filters, setFilters] = useState<FilterState>({
    startDate: startOfMonth(new Date()),
    endDate: new Date(),
    lenderId: 'all',
    salespersonId: 'all',
  });

  const dashboardFilters = useDashboardFilters(filters);

  const lendersQuery = useQuery<LenderDto[]>({
    queryKey: ['fi', 'lenders'],
    queryFn: () => listLenders(),
  });

  const kpiQuery = useQuery<FiDashboardKpisDto>({
    queryKey: ['fi', 'dashboard', 'kpis', dashboardFilters],
    queryFn: () => fetchFiDashboardKpis(dashboardFilters),
  });

  const activeDealsQuery = useQuery<FiDashboardActiveDealDto[]>({
    queryKey: ['fi', 'dashboard', 'active-deals', dashboardFilters],
    queryFn: () => fetchFiDashboardActiveDeals(dashboardFilters),
  });

  const productPerformanceQuery = useQuery<FiDashboardProductPerformanceDto[]>({
    queryKey: ['fi', 'dashboard', 'product-performance', dashboardFilters],
    queryFn: () => fetchFiDashboardProductPerformance(dashboardFilters),
  });

  const lenderPerformanceQuery = useQuery<FiDashboardLenderPerformanceDto[]>({
    queryKey: ['fi', 'dashboard', 'lender-performance', dashboardFilters],
    queryFn: () => fetchFiDashboardLenderPerformance(dashboardFilters),
  });

  const commissionQuery = useQuery<FiDashboardCommissionDto>({
    queryKey: ['fi', 'dashboard', 'commission', dashboardFilters],
    queryFn: () => fetchFiDashboardCommission(dashboardFilters),
  });

  const salespersonOptions = useSalespersonOptions(activeDealsQuery.data);

  const handleDateChange = (type: 'start' | 'end') => (event: ChangeEvent<HTMLInputElement>) => {
    if (!event.target.value) {
      return;
    }
    const nextDate = new Date(event.target.value);
    if (Number.isNaN(nextDate.getTime())) {
      return;
    }
    setFilters((prev) => ({
      ...prev,
      [type === 'start' ? 'startDate' : 'endDate']: nextDate,
    }));
  };

  const handleLenderChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      lenderId: value,
    }));
  };

  const handleSalespersonChange = (value: string) => {
    setFilters((prev) => ({
      ...prev,
      salespersonId: value,
    }));
  };

  const lenders = lendersQuery.data ?? [];
  const kpis = kpiQuery.data;
  const activeDeals = activeDealsQuery.data ?? [];
  const productPerformance = productPerformanceQuery.data ?? [];
  const lenderPerformance = lenderPerformanceQuery.data ?? [];
  const commission = commissionQuery.data;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold">F&amp;I Manager Dashboard</h1>
          <p className="text-muted-foreground">
            Real-time performance insights across contracted deals, product penetration, and lender pipeline.
          </p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Start Date</span>
            <Input type="date" value={toDateInputValue(filters.startDate)} onChange={handleDateChange('start')} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">End Date</span>
            <Input type="date" value={toDateInputValue(filters.endDate)} onChange={handleDateChange('end')} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Lender</span>
            <Select value={filters.lenderId} onValueChange={handleLenderChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All lenders" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All lenders</SelectItem>
                {lenders.map((lender) => (
                  <SelectItem key={lender.id} value={lender.id}>
                    {lender.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs font-medium text-muted-foreground">Salesperson</span>
            <Select value={filters.salespersonId} onValueChange={handleSalespersonChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All salespeople" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All salespeople</SelectItem>
                {salespersonOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Deals Contracted"
          icon={ClipboardCheck}
          metric={kpis?.dealsContracted}
          formatter={(value) => value.toLocaleString()}
        />
        <MetricCard
          title="Products per Deal"
          icon={Package}
          metric={kpis?.productsPerDeal}
          formatter={formatDecimal}
        />
        <MetricCard
          title="Product Penetration"
          icon={Percent}
          metric={kpis?.productPenetration}
          formatter={formatPercent}
        />
        <MetricCard
          title="Back-End Gross"
          icon={DollarSign}
          metric={kpis?.backGross}
          formatter={formatCurrencyWithCents}
          emphasizeCurrency
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Active Deal Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            {activeDealsQuery.isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : activeDeals.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active deals within the selected range.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Deal</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Amount Financed</TableHead>
                    <TableHead className="text-right">Back Gross</TableHead>
                    <TableHead>Lender</TableHead>
                    <TableHead>Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activeDeals.map((deal) => (
                    <TableRow key={deal.id}>
                      <TableCell className="font-medium">{deal.dealNumber}</TableCell>
                      <TableCell>{deal.customerName || '—'}</TableCell>
                      <TableCell>
                        {deal.vehicle
                          ? [deal.vehicle.year, deal.vehicle.make, deal.vehicle.model].filter(Boolean).join(' ')
                          : '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{deal.status}</Badge>
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(deal.amountFinanced)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(deal.totalFiGross)}</TableCell>
                      <TableCell>{deal.lenderName ?? '—'}</TableCell>
                      <TableCell>{formatDateTime(deal.updatedAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Commission Summary</CardTitle>
          </CardHeader>
          <CardContent>
            {commissionQuery.isLoading || !commission ? (
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Deals Closed</span>
                  <span className="text-lg font-semibold">{commission.dealsClosed.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Back-End Gross</span>
                  <span className="text-lg font-semibold">{formatCurrencyWithCents(commission.totalBackGross)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Commission Rate</span>
                  <span className="text-lg font-semibold">{formatPercent(commission.rate * 100)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Base Commission</span>
                  <span className="text-lg font-semibold">{formatCurrencyWithCents(commission.baseCommission)}</span>
                </div>
                <div className="space-y-2 rounded-lg border p-3">
                  <div className="text-sm font-medium">Bonuses</div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Volume Bonus {commission.bonuses.volumeTarget ? `(≥ ${commission.bonuses.volumeTarget})` : ''}</span>
                    <span className={commission.bonuses.volumeAchieved ? 'text-emerald-600' : 'text-muted-foreground'}>
                      {formatCurrencyWithCents(commission.bonuses.volumeBonus)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span>Gross Bonus {commission.bonuses.grossTarget ? `(≥ ${formatCurrency(commission.bonuses.grossTarget)})` : ''}</span>
                    <span className={commission.bonuses.grossAchieved ? 'text-emerald-600' : 'text-muted-foreground'}>
                      {formatCurrencyWithCents(commission.bonuses.grossBonus)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm font-semibold">
                    <span>Total Bonus</span>
                    <span>{formatCurrencyWithCents(commission.bonuses.totalBonus)}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t pt-3">
                  <span className="text-sm font-medium text-muted-foreground">Total Compensation</span>
                  <span className="text-xl font-semibold">{formatCurrencyWithCents(commission.totalCompensation)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {productPerformanceQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : productPerformance.length === 0 ? (
            <p className="text-sm text-muted-foreground">No product sales recorded for the selected range.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead className="text-right">Sold</TableHead>
                  <TableHead className="text-right">Penetration</TableHead>
                  <TableHead className="text-right">Avg Retail</TableHead>
                  <TableHead className="text-right">Total Retail</TableHead>
                  <TableHead className="text-right">Avg Markup</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {productPerformance.map((row) => (
                  <TableRow key={`${row.productName}-${row.provider ?? 'na'}`}>
                    <TableCell className="font-medium">{row.productName}</TableCell>
                    <TableCell>{row.category ?? '—'}</TableCell>
                    <TableCell>{row.provider ?? '—'}</TableCell>
                    <TableCell className="text-right">{row.soldCount}</TableCell>
                    <TableCell className="text-right">{formatPercent(row.penetrationRate)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyWithCents(row.averagePrice)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyWithCents(row.totalRevenue)}</TableCell>
                    <TableCell className="text-right">{formatCurrencyWithCents(row.averageMarkup)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lender Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {lenderPerformanceQuery.isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : lenderPerformance.length === 0 ? (
            <p className="text-sm text-muted-foreground">No lender submissions matched the selected filters.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Lender</TableHead>
                  <TableHead className="text-right">Submitted</TableHead>
                  <TableHead className="text-right">Approved</TableHead>
                  <TableHead className="text-right">Approval %</TableHead>
                  <TableHead className="text-right">Avg APR</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lenderPerformance.map((row) => (
                  <TableRow key={row.lenderId}>
                    <TableCell className="font-medium">{row.lenderName}</TableCell>
                    <TableCell className="text-right">{row.submitted}</TableCell>
                    <TableCell className="text-right">{row.approved}</TableCell>
                    <TableCell className="text-right">{formatPercent(row.approvalRate)}</TableCell>
                    <TableCell className="text-right">{row.averageApr.toFixed(3)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
