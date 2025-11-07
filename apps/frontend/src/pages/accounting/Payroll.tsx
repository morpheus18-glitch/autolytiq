import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  isSameYear,
  isWithinInterval,
  lastDayOfMonth,
  setDate,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import { Calculator, Download, Eye, FileSpreadsheet, History, MinusCircle, PlusCircle } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import AccountingLayout from './AccountingLayout';
import { fetchPayrolls } from '@/lib/accountingApi';
import { fetchUsers } from '@/lib/settingsUsersApi';
import { StatementHeader } from '@/components/accounting/StatementHeader.tsx';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { Table, TableBody, TableCell, TableFooter, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@repo/ui';
import { useToast } from '@repo/ui';
import type { PayrollResponse } from '@/lib/accountingApi';
import type { SettingsUser } from '@shared/settings-schema';

type PayrollFrequency = 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

const frequencyOptions: Array<{ value: PayrollFrequency; label: string }> = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
  { value: 'semi-monthly', label: 'Semi-monthly' },
  { value: 'monthly', label: 'Monthly' },
];

function getPeriod(date: Date, frequency: PayrollFrequency) {
  const base = startOfDay(date);
  if (frequency === 'weekly') {
    const start = startOfWeek(base, { weekStartsOn: 0 });
    return { start, end: addDays(start, 6) };
  }
  if (frequency === 'bi-weekly') {
    const start = startOfWeek(base, { weekStartsOn: 0 });
    return { start, end: addDays(start, 13) };
  }
  if (frequency === 'semi-monthly') {
    const firstHalf = base.getDate() <= 15;
    const monthStart = startOfMonth(base);
    if (firstHalf) {
      const start = monthStart;
      const end = setDate(new Date(monthStart), 15);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    const start = setDate(new Date(monthStart), 16);
    const end = endOfMonth(start);
    end.setHours(23, 59, 59, 999);
    return { start, end };
  }
  const start = startOfMonth(base);
  const end = endOfMonth(base);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

function shiftAnchor(current: Date, frequency: PayrollFrequency, direction: 1 | -1) {
  if (frequency === 'weekly') {
    return addDays(current, direction * 7);
  }
  if (frequency === 'bi-weekly') {
    return addDays(current, direction * 14);
  }
  if (frequency === 'semi-monthly') {
    const period = getPeriod(current, 'semi-monthly');
    const startDay = period.start.getDate();
    if (direction === 1) {
      if (startDay === 1) {
        return setDate(new Date(period.start), 16);
      }
      const nextMonth = startOfMonth(addMonths(period.start, 1));
      return nextMonth;
    }
    if (startDay === 1) {
      const previousMonth = addMonths(period.start, -1);
      return setDate(startOfMonth(previousMonth), 16);
    }
    return startOfMonth(period.start);
  }
  return startOfMonth(addMonths(current, direction));
}

function formatPeriod(start: Date, end: Date) {
  const sameMonth = start.getMonth() === end.getMonth();
  const sameYear = start.getFullYear() === end.getFullYear();
  if (sameMonth && sameYear) {
    return `${format(start, 'MMM d')}–${format(end, 'd, yyyy')}`;
  }
  if (sameYear) {
    return `${format(start, 'MMM d')}–${format(end, 'MMM d, yyyy')}`;
  }
  return `${format(start, 'MMM d, yyyy')} – ${format(end, 'MMM d, yyyy')}`;
}

export default function Payroll() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [frequency, setFrequency] = useState<PayrollFrequency>('semi-monthly');
  const [anchorDate, setAnchorDate] = useState(() => getPeriod(new Date(), 'semi-monthly').start);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [detailLine, setDetailLine] = useState<{ payroll: PayrollResponse; lineId: string } | null>(null);

  const period = useMemo(() => getPeriod(anchorDate, frequency), [anchorDate, frequency]);

  useEffect(() => {
    const aligned = getPeriod(new Date(), frequency).start;
    setAnchorDate(aligned);
  }, [frequency]);

  const { data: payrolls, isLoading: payrollLoading } = useQuery({
    queryKey: ['accounting', 'payrolls'],
    queryFn: () => fetchPayrolls(),
  });

  const { data: users } = useQuery({
    queryKey: ['settings', 'users', 'payroll'],
    queryFn: () => fetchUsers({ pageSize: 200, status: 'ACTIVE' }),
  });

  const userDirectory = useMemo(() => {
    const directory = new Map<string, SettingsUser>();
    if (users?.data) {
      users.data.forEach((user) => {
        directory.set(user.id, user);
      });
    }
    return directory;
  }, [users]);

  const payrollList = payrolls ?? [];
  const periodPayroll = useMemo(() => {
    return payrollList.find((record) => {
      const start = new Date(record.periodStart);
      const end = new Date(record.periodEnd);
      return isWithinInterval(period.start, { start, end }) || isWithinInterval(period.end, { start, end });
    }) ?? payrollList[0];
  }, [payrollList, period.start, period.end]);

  const [selectedPayrollId, setSelectedPayrollId] = useState<string | undefined>(periodPayroll?.id);

  useEffect(() => {
    if (periodPayroll?.id) {
      setSelectedPayrollId(periodPayroll.id);
    }
  }, [periodPayroll?.id]);

  const selectedPayroll = useMemo(
    () => payrollList.find((record) => record.id === selectedPayrollId),
    [payrollList, selectedPayrollId],
  );

  const yearToDate = useMemo(() => {
    const map = new Map<string, { gross: number; net: number }>();
    const now = new Date();
    payrollList.forEach((run) => {
      const end = new Date(run.periodEnd);
      if (!isSameYear(end, now)) {
        return;
      }
      run.lines.forEach((line) => {
        const current = map.get(line.userId) ?? { gross: 0, net: 0 };
        current.gross += line.grossPay;
        current.net += line.netPay;
        map.set(line.userId, current);
      });
    });
    return map;
  }, [payrollList]);

  const employeeRows = useMemo(() => {
    if (!selectedPayroll) {
      return [] as Array<{
        lineId: string;
        employeeId: string;
        name: string;
        role: string;
        payProfile: string;
        gross: number;
        deductions: number;
        net: number;
        ytdGross: number;
        ytdNet: number;
      }>;
    }
    return selectedPayroll.lines.map((line) => {
      const user = userDirectory.get(line.userId);
      const name = user ? `${user.firstName} ${user.lastName}` : line.userId;
      const role = user?.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : 'Team Member';
      const payProfile = line.commissionAmount && line.commissionAmount > 0 ? 'Commission' : 'Salary';
      const ytd = yearToDate.get(line.userId) ?? { gross: line.grossPay, net: line.netPay };
      return {
        lineId: line.id,
        employeeId: line.userId,
        name,
        role,
        payProfile,
        gross: line.grossPay,
        deductions: line.deductions,
        net: line.netPay,
        ytdGross: ytd.gross,
        ytdNet: ytd.net,
      };
    });
  }, [selectedPayroll, userDirectory, yearToDate]);

  const totals = useMemo(() => {
    return employeeRows.reduce(
      (acc, row) => {
        acc.gross += row.gross;
        acc.deductions += row.deductions;
        acc.net += row.net;
        acc.ytdGross += row.ytdGross;
        acc.ytdNet += row.ytdNet;
        return acc;
      },
      { gross: 0, deductions: 0, net: 0, ytdGross: 0, ytdNet: 0 },
    );
  }, [employeeRows]);

  const historyRecords = useMemo(() => {
    return [...payrollList].sort((a, b) => new Date(b.periodEnd).getTime() - new Date(a.periodEnd).getTime());
  }, [payrollList]);

  const handleNavigateToCalculation = () => {
    const params = new URLSearchParams({
      startDate: format(period.start, 'yyyy-MM-dd'),
      endDate: format(period.end, 'yyyy-MM-dd'),
      frequency,
    });
    navigate(`/accounting/payroll/calculate?${params.toString()}`);
  };

  const handleExport = async (formatType: 'excel' | 'adp' | 'quickbooks') => {
    if (!selectedPayroll) {
      toast({ title: 'No payroll selected', description: 'Choose a payroll period before exporting.', variant: 'destructive' });
      return;
    }
    const url = `/api/accounting/payroll/${selectedPayroll.id}/export?format=${formatType}`;
    window.open(url, '_blank');
    toast({
      title: 'Export started',
      description: `Generating ${formatType.toUpperCase()} export for ${formatPeriod(
        new Date(selectedPayroll.periodStart),
        new Date(selectedPayroll.periodEnd),
      )}.`,
    });
  };

  const handleViewPayStub = (payrollId: string, employeeId: string) => {
    window.open(`/api/accounting/payroll/${payrollId}/${employeeId}/paystub`, '_blank', 'noopener,noreferrer');
  };

  const handleSelectPeriod = (record: PayrollResponse) => {
    setSelectedPayrollId(record.id);
    setAnchorDate(new Date(record.periodStart));
    setHistoryOpen(false);
  };

  const detailRecord = detailLine
    ? selectedPayroll?.lines.find((line) => line.id === detailLine.lineId)
    : undefined;

  return (
    <AccountingLayout>
      <StatementHeader
        title="Payroll Dashboard"
        description="Control payroll cycles, manage commission payouts, and finalize journal-ready totals."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setHistoryOpen(true)}>
              <History className="mr-2 h-4 w-4" /> View Previous Periods
            </Button>
            <Button onClick={handleNavigateToCalculation}>
              <Calculator className="mr-2 h-4 w-4" /> Calculate Payroll
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 xl:grid-cols-[1.8fr,1fr]">
        <Card>
          <CardHeader className="gap-4 space-y-0 sm:flex sm:items-start sm:justify-between">
            <div>
              <CardTitle>Pay Period</CardTitle>
              <CardDescription>Adjust cadence to jump between payroll runs and align exports to GL close timing.</CardDescription>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Select value={frequency} onValueChange={(value: PayrollFrequency) => setFrequency(value)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Frequency" />
                </SelectTrigger>
                <SelectContent>
                  {frequencyOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAnchorDate((current) => shiftAnchor(current, frequency, -1))}
                  aria-label="Previous period"
                >
                  <MinusCircle className="h-4 w-4" />
                </Button>
                <div className="min-w-[180px] rounded-md border px-4 py-2 text-center text-sm font-medium">
                  {formatPeriod(period.start, period.end)}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setAnchorDate((current) => shiftAnchor(current, frequency, 1))}
                  aria-label="Next period"
                >
                  <PlusCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Tabs value={selectedPayroll?.id ?? 'none'} onValueChange={setSelectedPayrollId}>
              <TabsList className="flex h-auto flex-wrap items-center gap-2 rounded-lg bg-muted/40 p-1 text-sm">
                {payrollList.slice(0, 4).map((run) => (
                  <TabsTrigger key={run.id} value={run.id} className="rounded-md">
                    {format(new Date(run.periodStart), 'MMM d')}–{format(new Date(run.periodEnd), 'MMM d')}
                  </TabsTrigger>
                ))}
              </TabsList>
              <TabsContent value={selectedPayroll?.id ?? 'none'} className="mt-6">
                {payrollLoading ? (
                  <Skeleton className="h-64" />
                ) : selectedPayroll ? (
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="rounded-md border bg-muted/30 px-4 py-3">
                        <div className="text-muted-foreground">Status</div>
                        <div className="mt-1 flex items-center gap-2 font-medium">
                          <Badge variant={selectedPayroll.status === 'FINALIZED' ? 'default' : 'secondary'}>
                            {selectedPayroll.status}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(selectedPayroll.periodStart), 'MMM d')} – {format(
                              new Date(selectedPayroll.periodEnd),
                              'MMM d, yyyy',
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="rounded-md border bg-muted/30 px-4 py-3">
                        <div className="text-muted-foreground">Total Gross</div>
                        <div className="mt-1 text-lg font-semibold">{currency.format(selectedPayroll.totalGross)}</div>
                      </div>
                      <div className="rounded-md border bg-muted/30 px-4 py-3">
                        <div className="text-muted-foreground">Total Net</div>
                        <div className="mt-1 text-lg font-semibold">{currency.format(selectedPayroll.totalNet)}</div>
                      </div>
                      <div className="rounded-md border bg-muted/30 px-4 py-3">
                        <div className="text-muted-foreground">Taxes & Benefits</div>
                        <div className="mt-1 text-lg font-semibold">{currency.format(selectedPayroll.totalTaxes)}</div>
                      </div>
                      {selectedPayroll.journalEntryId && (
                        <Link
                          href={`/accounting/journal-entries/${selectedPayroll.journalEntryId}`}
                          className="rounded-md border bg-muted/20 px-4 py-3 text-sm font-medium hover:bg-muted"
                        >
                          View Journal Entry
                        </Link>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h3 className="text-base font-semibold">Employee Summary</h3>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Export
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Export current payroll</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleExport('excel')}>
                            <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel Workbook
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('adp')}>
                            <Download className="mr-2 h-4 w-4" /> ADP Workforce Now
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleExport('quickbooks')}>
                            <Download className="mr-2 h-4 w-4" /> QuickBooks Payroll
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    <div className="overflow-x-auto rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="min-w-[200px]">Name</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Gross (period)</TableHead>
                            <TableHead className="text-right">Deductions</TableHead>
                            <TableHead className="text-right">Net Pay</TableHead>
                            <TableHead className="text-right">YTD Gross</TableHead>
                            <TableHead className="text-right">YTD Net</TableHead>
                            <TableHead className="w-[180px] text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {employeeRows.map((row) => (
                            <TableRow key={row.lineId}>
                              <TableCell className="font-medium">{row.name}</TableCell>
                              <TableCell>{row.role}</TableCell>
                              <TableCell>
                                <Badge variant="outline">{row.payProfile}</Badge>
                              </TableCell>
                              <TableCell className="text-right">{currency.format(row.gross)}</TableCell>
                              <TableCell className="text-right">{currency.format(row.deductions)}</TableCell>
                              <TableCell className="text-right">{currency.format(row.net)}</TableCell>
                              <TableCell className="text-right">{currency.format(row.ytdGross)}</TableCell>
                              <TableCell className="text-right">{currency.format(row.ytdNet)}</TableCell>
                              <TableCell>
                                <div className="flex justify-end gap-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => setDetailLine({ payroll: selectedPayroll, lineId: row.lineId })}
                                  >
                                    <Eye className="mr-2 h-4 w-4" /> Detail
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="secondary"
                                    onClick={() => handleViewPayStub(selectedPayroll.id, row.employeeId)}
                                  >
                                    <Download className="mr-2 h-4 w-4" /> Pay Stub
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                          {employeeRows.length === 0 && (
                            <TableRow>
                              <TableCell colSpan={9} className="py-12 text-center text-sm text-muted-foreground">
                                No employees processed for this payroll period yet.
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                        {employeeRows.length > 0 && (
                          <TableFooter>
                            <TableRow>
                              <TableCell className="font-semibold">Totals</TableCell>
                              <TableCell />
                              <TableCell />
                              <TableCell className="text-right font-semibold">{currency.format(totals.gross)}</TableCell>
                              <TableCell className="text-right font-semibold">{currency.format(totals.deductions)}</TableCell>
                              <TableCell className="text-right font-semibold">{currency.format(totals.net)}</TableCell>
                              <TableCell className="text-right font-semibold">{currency.format(totals.ytdGross)}</TableCell>
                              <TableCell className="text-right font-semibold">{currency.format(totals.ytdNet)}</TableCell>
                              <TableCell />
                            </TableRow>
                          </TableFooter>
                        )}
                      </Table>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
                    No payroll history is available for the selected cadence.
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Commission & Bonus Logic</CardTitle>
            <CardDescription>Transparency for front-end and F&I commission structures applied to each payroll run.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="rounded-md border border-dashed bg-muted/30 p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Front-End Vehicle Deals</h4>
              <ul className="space-y-1">
                <li>• 3% on the first $1,000 of front gross</li>
                <li>• 4% on the next $1,000</li>
                <li>• 5% on gross above $2,000</li>
              </ul>
            </div>
            <div className="rounded-md border border-dashed bg-muted/30 p-4">
              <h4 className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Backend (F&amp;I) Products</h4>
              <p className="leading-relaxed">
                Flat 5% of F&amp;I gross paid on reserve, VSC, GAP, and ancillary products. Manager overrides automatically allocate
                1% of team deal gross.
              </p>
            </div>
            <div className="rounded-md border border-dashed bg-muted/30 p-4 space-y-2">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground">Volume Programs</h4>
              <p>• 10–14 units: $500 bonus</p>
              <p>• 15–19 units: $1,000 bonus</p>
              <p>• 20+ units: $1,500 bonus</p>
              <p className="text-xs text-muted-foreground">Chargebacks for canceled deals within 90 days reverse in the next payroll.</p>
            </div>
            <div className="rounded-md border bg-muted/30 p-4 text-xs text-muted-foreground">
              NACHA exports, QuickBooks/ADP sync, and pay stubs are generated during finalization to ensure GL balances tie out.
            </div>
          </CardContent>
        </Card>
      </div>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Previous Payroll Periods</DialogTitle>
            <DialogDescription>Review historical payroll runs and jump directly into any closed period.</DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] space-y-3 overflow-y-auto pr-2 text-sm">
            {historyRecords.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <div className="font-medium">
                    {format(new Date(record.periodStart), 'MMM d, yyyy')} – {format(new Date(record.periodEnd), 'MMM d, yyyy')}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground">Gross {currency.format(record.totalGross)} · Net {currency.format(record.totalNet)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={record.status === 'FINALIZED' ? 'default' : 'secondary'}>{record.status}</Badge>
                  <Button variant="outline" size="sm" onClick={() => handleSelectPeriod(record)}>
                    View Period
                  </Button>
                </div>
              </div>
            ))}
            {historyRecords.length === 0 && (
              <div className="py-8 text-center text-muted-foreground">No historical payroll runs found.</div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detailRecord)} onOpenChange={() => setDetailLine(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Employee Payroll Detail</DialogTitle>
            <DialogDescription>Drill into gross, deductions, and year-to-date balances for compliance audits.</DialogDescription>
          </DialogHeader>
          {selectedPayroll && detailRecord && (
            <div className="space-y-4 text-sm">
              <div className="grid gap-3 rounded-md border bg-muted/30 p-4">
                <DetailRow label="Pay Period" value={formatPeriod(new Date(selectedPayroll.periodStart), new Date(selectedPayroll.periodEnd))} />
                <DetailRow label="Gross Pay" value={currency.format(detailRecord.grossPay)} emphasize />
                <DetailRow label="Employee Deductions" value={currency.format(detailRecord.deductions)} />
                <DetailRow label="Employer Taxes" value={currency.format(detailRecord.employerTaxes)} />
                <DetailRow label="Commission" value={currency.format(detailRecord.commissionAmount ?? 0)} />
                <DetailRow label="Net Pay" value={currency.format(detailRecord.netPay)} emphasize />
                <DetailRow
                  label="Year-to-Date Net"
                  value={currency.format(yearToDate.get(detailRecord.userId)?.net ?? detailRecord.netPay)}
                />
              </div>
              <div className="rounded-md border bg-muted/20 p-3 text-xs text-muted-foreground">
                For manual overrides, use the payroll calculation workspace and provide a business justification to maintain the
                audit trail.
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );
}

function DetailRow({ label, value, emphasize }: { label: string; value: string; emphasize?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={emphasize ? 'font-semibold text-foreground' : 'font-medium'}>{value}</span>
    </div>
  );
}
