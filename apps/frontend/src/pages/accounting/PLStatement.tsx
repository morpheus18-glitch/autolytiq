import { useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { endOfDay, format, startOfDay, startOfMonth } from 'date-fns';
import AccountingLayout from './AccountingLayout';
import {
  emailStatementRequest,
  exportStatementRequest,
  fetchPLStatementTransactions,
  fetchProfitAndLossStatement,
  type PLComparisonMode,
  type PLStatementLineItem,
  type PLStatementTransaction,
  type ProfitAndLossStatement,
} from '@/lib/accountingApi';
import { fetchSettingsSection } from '@/lib/settingsApi';
import {
  dealershipSettingsSchema,
  defaultDealershipSettings,
  type DealershipSettings,
} from '@shared/settings-schema';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { Calendar } from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { Badge } from '@repo/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@repo/ui';
import { Input } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { ScrollArea } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { parseEmailAddresses } from '@/lib/email';
import { Alert, AlertDescription, AlertTitle } from '@repo/ui';
import { cn } from '@/lib/utils';
import {
  CalendarIcon,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  Printer,
  TrendingUp,
} from 'lucide-react';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const COMPARISON_OPTIONS: Array<{ value: PLComparisonMode; label: string }> = [
  { value: 'NONE', label: 'None' },
  { value: 'PREVIOUS_PERIOD', label: 'Previous Period' },
  { value: 'SAME_PERIOD_LAST_YEAR', label: 'Same Period Last Year' },
  { value: 'BUDGET', label: 'Budget' },
];

interface FlattenedRow {
  id: string;
  depth: number;
  line: PLStatementLineItem;
  isExpandable: boolean;
  isExpanded: boolean;
}

function getLineIdentifier(line: PLStatementLineItem): string {
  return line.id ?? line.key ?? line.label;
}

function formatCurrencyValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return currencyFormatter.format(value);
}

function formatDelta(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  const formatted = currencyFormatter.format(value);
  return value > 0 ? `+${formatted}` : formatted;
}

function formatPercentValue(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  const normalized = Math.abs(value) <= 1 ? value : value / 100;
  return percentFormatter.format(normalized);
}

function findLineByPredicate(
  lines: PLStatementLineItem[] | undefined,
  predicate: (line: PLStatementLineItem) => boolean,
): PLStatementLineItem | null {
  if (!lines) {
    return null;
  }
  for (const line of lines) {
    if (predicate(line)) {
      return line;
    }
    const childMatch = findLineByPredicate(line.children, predicate);
    if (childMatch) {
      return childMatch;
    }
  }
  return null;
}

function formatDateLabel(dateInput?: string | Date | null): string | null {
  if (!dateInput) {
    return null;
  }
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return format(date, 'MMM d, yyyy');
}

export default function PLStatement(): JSX.Element {
  const initialRange = useMemo(() => {
    const now = new Date();
    return {
      startDate: startOfDay(startOfMonth(now)),
      endDate: endOfDay(now),
    };
  }, []);

  const [range, setRange] = useState<{ startDate: Date; endDate: Date }>(initialRange);
  const [comparison, setComparison] = useState<PLComparisonMode>('NONE');
  const [expandedLines, setExpandedLines] = useState<Set<string>>(new Set());
  const [drilldownLine, setDrilldownLine] = useState<PLStatementLineItem | null>(null);
  const [drilldownTransactions, setDrilldownTransactions] = useState<PLStatementTransaction[]>([]);
  const [isDrilldownLoading, setIsDrilldownLoading] = useState(false);
  const [drilldownError, setDrilldownError] = useState<string | null>(null);
  const [activeExport, setActiveExport] = useState<'pdf' | 'excel' | null>(null);
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('Profit & Loss Statement');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const { toast } = useToast();

  const statementQuery = useQuery<ProfitAndLossStatement>({
    queryKey: [
      'accounting',
      'pl-statement',
      range.startDate.toISOString(),
      range.endDate.toISOString(),
      comparison,
    ],
    queryFn: () =>
      fetchProfitAndLossStatement({
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        comparison,
      }),
  });

  const { data: dealershipSettings } = useQuery<DealershipSettings>({
    queryKey: ['settings', 'dealership'],
    queryFn: () =>
      fetchSettingsSection<DealershipSettings>(
        'dealership',
        dealershipSettingsSchema,
        defaultDealershipSettings,
      ),
  });

  const statement = statementQuery.data;
  const isLoading = statementQuery.isLoading;
  const isFetching = statementQuery.isFetching;
  const statementError = statementQuery.error;

  useEffect(() => {
    if (!statement?.lines) {
      setExpandedLines(new Set());
      return;
    }
    const initialExpanded = new Set<string>();
    statement.lines.forEach((line) => {
      if (line.children && line.children.length > 0) {
        initialExpanded.add(getLineIdentifier(line));
      }
    });
    setExpandedLines(initialExpanded);
  }, [statement?.lines]);

  const appliedComparisonMode: PLComparisonMode = statement?.comparison?.mode ?? comparison;
  const appliedComparisonLabel =
    statement?.comparison?.label ??
    COMPARISON_OPTIONS.find((option) => option.value === appliedComparisonMode)?.label ??
    'None';
  const showComparisonColumns = appliedComparisonMode !== 'NONE';
  const comparisonPeriodLabel = statement?.comparison?.startDate && statement?.comparison?.endDate
    ? `${formatDateLabel(statement.comparison.startDate)} – ${formatDateLabel(statement.comparison.endDate)}`
    : null;

  const dealershipName = useMemo(() => {
    const fromStatement = statement?.dealershipName?.trim();
    if (fromStatement) {
      return fromStatement;
    }
    const fromSettings = dealershipSettings?.businessName?.trim();
    if (fromSettings) {
      return fromSettings;
    }
    return 'Your Dealership';
  }, [dealershipSettings?.businessName, statement?.dealershipName]);

  const fromLabel = format(range.startDate, 'MMM d, yyyy');
  const toLabel = format(range.endDate, 'MMM d, yyyy');
  const rangeLabel = `${fromLabel} – ${toLabel}`;
  const periodLabel = `For the period ${fromLabel} to ${toLabel}`;

  const summaryCards = useMemo(() => {
    if (!statement) {
      return [] as Array<{ id: string; label: string; line: PLStatementLineItem }>;
    }
    const descriptors = [
      { id: 'grossProfit', label: 'Gross Profit', predicate: (line: PLStatementLineItem) => /gross profit/i.test(line.label) },
      {
        id: 'operatingIncome',
        label: 'Operating Income (EBITDA)',
        predicate: (line: PLStatementLineItem) => /operating income/i.test(line.label) || /ebitda/i.test(line.label),
      },
      {
        id: 'netIncome',
        label: 'Net Income',
        predicate: (line: PLStatementLineItem) => /net income(?!.*tax)/i.test(line.label),
      },
    ];
    return descriptors
      .map((descriptor) => {
        const match = findLineByPredicate(statement.lines, descriptor.predicate);
        return match ? { id: descriptor.id, label: descriptor.label, line: match } : null;
      })
      .filter((card): card is { id: string; label: string; line: PLStatementLineItem } => Boolean(card));
  }, [statement]);

  const rows = useMemo<FlattenedRow[]>(() => {
    if (!statement) {
      return [];
    }
    const flatten = (items: PLStatementLineItem[], depth = 0): FlattenedRow[] =>
      items.flatMap((item) => {
        const id = getLineIdentifier(item);
        const isExpandable = Boolean(item.children && item.children.length > 0);
        const isExpanded = isExpandable ? expandedLines.has(id) : false;
        const currentRow: FlattenedRow = { id, depth, line: item, isExpandable, isExpanded };
        if (isExpandable && isExpanded && item.children) {
          return [currentRow, ...flatten(item.children, depth + 1)];
        }
        return [currentRow];
      });
    return flatten(statement.lines);
  }, [expandedLines, statement]);

  const toggleLine = useCallback((line: PLStatementLineItem) => {
    setExpandedLines((previous) => {
      const next = new Set(previous);
      const identifier = getLineIdentifier(line);
      if (next.has(identifier)) {
        next.delete(identifier);
      } else {
        next.add(identifier);
      }
      return next;
    });
  }, []);

  const openDrilldown = useCallback(
    async (line: PLStatementLineItem) => {
      setDrilldownLine(line);
      setDrilldownError(null);
      const existingTransactions = Array.isArray(line.transactions) ? line.transactions : [];
      setDrilldownTransactions(existingTransactions);
      if (existingTransactions.length > 0 || !line.drilldownEndpoint) {
        setIsDrilldownLoading(false);
        return;
      }
      setIsDrilldownLoading(true);
      try {
        const transactions = await fetchPLStatementTransactions({
          lineId: line.id,
          endpoint: line.drilldownEndpoint,
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString(),
          comparison: appliedComparisonMode,
        });
        setDrilldownTransactions(transactions);
      } catch (error) {
        setDrilldownError(error instanceof Error ? error.message : 'Unable to load supporting transactions.');
      } finally {
        setIsDrilldownLoading(false);
      }
    },
    [appliedComparisonMode, range.endDate, range.startDate],
  );

  const handleRowClick = useCallback(
    (row: FlattenedRow) => {
      const hasTransactions = Boolean(row.line.transactions && row.line.transactions.length > 0);
      const hasEndpoint = Boolean(row.line.drilldownEndpoint);
      if (hasTransactions || hasEndpoint) {
        void openDrilldown(row.line);
        return;
      }
      if (row.isExpandable) {
        toggleLine(row.line);
      }
    },
    [openDrilldown, toggleLine],
  );

  const handleExport = useCallback(
    async (format: 'pdf' | 'excel') => {
      if (activeExport) {
        return;
      }
      setActiveExport(format);
      try {
        const result = await exportStatementRequest('pl', format, {
          startDate: range.startDate.toISOString(),
          endDate: range.endDate.toISOString(),
          comparison: appliedComparisonMode !== 'NONE' ? appliedComparisonMode : undefined,
        });
        const url = URL.createObjectURL(result.blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = result.filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        toast({ title: 'Export ready', description: `Downloaded ${result.filename}` });
      } catch (error) {
        toast({
          title: 'Export failed',
          description: error instanceof Error ? error.message : 'Unable to export statement.',
          variant: 'destructive',
        });
      } finally {
        setActiveExport(null);
      }
    },
    [activeExport, appliedComparisonMode, range.endDate, range.startDate, toast],
  );

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const openEmailDialog = useCallback(() => {
    const defaultSubject = `Profit & Loss Statement – ${fromLabel} to ${toLabel}`;
    const defaultMessage = `Please find attached the Profit & Loss Statement covering ${rangeLabel}.`;
    setEmailSubject(defaultSubject);
    setEmailMessage(defaultMessage);
    setIsEmailDialogOpen(true);
  }, [fromLabel, rangeLabel, toLabel]);

  const handleSendEmail = useCallback(async () => {
    const recipients = parseEmailAddresses(emailRecipients);
    if (recipients.length === 0) {
      toast({
        title: 'Recipients required',
        description: 'Enter at least one email address before sending.',
        variant: 'destructive',
      });
      return;
    }
    setIsSendingEmail(true);
    try {
      await emailStatementRequest({
        statement: 'pl',
        recipients,
        startDate: range.startDate.toISOString(),
        endDate: range.endDate.toISOString(),
        comparison: appliedComparisonMode !== 'NONE' ? appliedComparisonMode : undefined,
        subject: emailSubject.trim() || `Profit & Loss Statement – ${rangeLabel}`,
        message: emailMessage.trim() || undefined,
      });
      toast({ title: 'Email sent', description: 'Your Profit & Loss Statement has been emailed.' });
      setIsEmailDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Email failed',
        description: error instanceof Error ? error.message : 'Unable to send statement email.',
        variant: 'destructive',
      });
    } finally {
      setIsSendingEmail(false);
    }
  }, [
    emailMessage,
    emailRecipients,
    emailSubject,
    appliedComparisonMode,
    range.endDate,
    range.startDate,
    rangeLabel,
    toast,
  ]);

  const errorMessage = statementError instanceof Error
    ? statementError.message
    : statementError
      ? 'Unable to load Profit & Loss Statement.'
      : null;

  return (
    <AccountingLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {dealershipName}
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Profit &amp; Loss Statement</h1>
                {isFetching && !isLoading && (
                  <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{periodLabel}</p>
              {showComparisonColumns && (
                <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="bg-primary/10 text-primary">
                    Comparing to {appliedComparisonLabel}
                  </Badge>
                  {comparisonPeriodLabel && <span className="text-muted-foreground">({comparisonPeriodLabel})</span>}
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleExport('pdf')}
                disabled={activeExport !== null}
                className="gap-2"
              >
                {activeExport === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="h-4 w-4" />
                )}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleExport('excel')}
                disabled={activeExport !== null}
                className="gap-2"
              >
                {activeExport === 'excel' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <FileSpreadsheet className="h-4 w-4" />
                )}
                Excel
              </Button>
              <Button variant="outline" size="sm" onClick={openEmailDialog} className="gap-2">
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap items-center gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex min-w-[240px] items-center justify-start gap-2 text-left"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="truncate">{rangeLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={{ from: range.startDate, to: range.endDate }}
                    defaultMonth={range.startDate}
                    numberOfMonths={2}
                    onSelect={(value) => {
                      if (value?.from && value?.to) {
                        setRange({ startDate: startOfDay(value.from), endDate: endOfDay(value.to) });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              <Select
                value={comparison}
                onValueChange={(value) => setComparison(value as PLComparisonMode)}
              >
                <SelectTrigger className="w-[220px]">
                  <SelectValue placeholder="Comparison mode" />
                </SelectTrigger>
                <SelectContent>
                  {COMPARISON_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="destructive">
            <AlertTitle>Unable to load Profit &amp; Loss Statement</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-[120px] w-full" />
            <Skeleton className="h-[520px] w-full" />
          </div>
        ) : (
          <>
            {summaryCards.length > 0 && (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {summaryCards.map(({ id, label, line }) => {
                  const comparisonValue =
                    appliedComparisonMode === 'BUDGET'
                      ? line.budgetAmount ?? line.comparisonAmount ?? null
                      : line.comparisonAmount ?? null;
                  const varianceAmount =
                    line.varianceAmount ??
                    (comparisonValue !== null && comparisonValue !== undefined
                      ? line.currentAmount - comparisonValue
                      : null);
                  const variancePercent =
                    line.variancePercent ??
                    (comparisonValue && comparisonValue !== 0
                      ? (line.currentAmount - comparisonValue) / Math.abs(comparisonValue)
                      : null);
                  return (
                    <Card key={id} className="shadow-sm">
                      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </CardHeader>
                      <CardContent className="space-y-1">
                        <div className="text-2xl font-semibold text-foreground">
                          {formatCurrencyValue(line.currentAmount)}
                        </div>
                        {line.percentOfRevenue !== undefined && line.percentOfRevenue !== null && (
                          <p className="text-xs text-muted-foreground">
                            {formatPercentValue(line.percentOfRevenue)} of revenue
                          </p>
                        )}
                        {showComparisonColumns && (
                          <p className="text-xs text-muted-foreground">
                            Variance: <span className={cn(varianceAmount && varianceAmount < 0 ? 'text-rose-600' : 'text-emerald-600')}>
                              {formatDelta(varianceAmount)}
                            </span>{' '}
                            ({formatPercentValue(variancePercent)})
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="overflow-hidden rounded-lg border bg-background shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[260px]">Line Item</TableHead>
                    <TableHead className="w-[160px] text-right">Current</TableHead>
                    {showComparisonColumns && (
                      <TableHead className="w-[160px] text-right">{appliedComparisonLabel}</TableHead>
                    )}
                    {showComparisonColumns && (
                      <TableHead className="w-[160px] text-right">
                        {appliedComparisonMode === 'BUDGET' ? 'Variance vs Budget' : 'Variance'}
                      </TableHead>
                    )}
                    {showComparisonColumns && (
                      <TableHead className="w-[120px] text-right">Variance %</TableHead>
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={showComparisonColumns ? 5 : 2} className="py-10 text-center text-sm text-muted-foreground">
                        No line items available for the selected period.
                      </TableCell>
                    </TableRow>
                  )}
                  {rows.map((row, index) => {
                    const line = row.line;
                    const labelLower = line.label.toLowerCase();
                    const isTotalLine = line.type === 'TOTAL' || /^=?.*total/.test(labelLower);
                    const isSubtotalLine = line.type === 'SUBTOTAL';
                    const isSummaryLine = /gross profit|operating income|ebitda|net income/.test(labelLower);
                    const canDrillDown = Boolean(line.transactions?.length || line.drilldownEndpoint);
                    const comparisonValue = showComparisonColumns
                      ? appliedComparisonMode === 'BUDGET'
                        ? line.budgetAmount ?? line.comparisonAmount ?? null
                        : line.comparisonAmount ?? null
                      : null;
                    const varianceAmount = showComparisonColumns
                      ? line.varianceAmount ??
                        (comparisonValue !== null && comparisonValue !== undefined
                          ? line.currentAmount - comparisonValue
                          : null)
                      : null;
                    const variancePercent = showComparisonColumns
                      ? line.variancePercent ??
                        (comparisonValue && comparisonValue !== 0
                          ? (line.currentAmount - comparisonValue) / Math.abs(comparisonValue)
                          : null)
                      : null;

                    return (
                      <TableRow
                        key={`${row.id}-${index}`}
                        onClick={() => handleRowClick(row)}
                        className={cn(
                          canDrillDown || row.isExpandable ? 'cursor-pointer hover:bg-muted/40' : undefined,
                          isTotalLine ? 'bg-muted/20 font-semibold uppercase text-foreground' : undefined,
                          !isTotalLine && (isSubtotalLine || isSummaryLine) ? 'font-semibold text-foreground' : undefined,
                        )}
                      >
                        <TableCell
                          style={{ paddingLeft: `${row.depth * 1.5 + 1}rem` }}
                          className="whitespace-nowrap text-sm text-foreground"
                        >
                          <div className="flex items-center gap-2">
                            {row.isExpandable && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  toggleLine(line);
                                }}
                                aria-label={row.isExpanded ? 'Collapse section' : 'Expand section'}
                              >
                                <ChevronRight
                                  className={cn(
                                    'h-4 w-4 transition-transform',
                                    row.isExpanded ? 'rotate-90' : undefined,
                                  )}
                                />
                              </Button>
                            )}
                            <span>{line.label}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right text-sm font-medium text-foreground">
                          <div className="flex flex-col items-end">
                            <span className={cn(line.currentAmount < 0 ? 'text-rose-600' : undefined)}>
                              {formatCurrencyValue(line.currentAmount)}
                            </span>
                            {line.percentOfRevenue !== undefined && line.percentOfRevenue !== null && (
                              <span className="text-xs text-muted-foreground">
                                {formatPercentValue(line.percentOfRevenue)} of revenue
                              </span>
                            )}
                          </div>
                        </TableCell>
                        {showComparisonColumns && (
                          <TableCell className="text-right text-sm text-muted-foreground">
                            {formatCurrencyValue(comparisonValue)}
                          </TableCell>
                        )}
                        {showComparisonColumns && (
                          <TableCell
                            className={cn(
                              'text-right text-sm font-medium',
                              varianceAmount !== null && varianceAmount !== undefined
                                ? varianceAmount < 0
                                  ? 'text-rose-600'
                                  : varianceAmount > 0
                                    ? 'text-emerald-600'
                                    : 'text-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {formatDelta(varianceAmount)}
                          </TableCell>
                        )}
                        {showComparisonColumns && (
                          <TableCell
                            className={cn(
                              'text-right text-sm',
                              variancePercent !== null && variancePercent !== undefined
                                ? variancePercent < 0
                                  ? 'text-rose-600'
                                  : variancePercent > 0
                                    ? 'text-emerald-600'
                                    : 'text-muted-foreground'
                                : 'text-muted-foreground',
                            )}
                          >
                            {formatPercentValue(variancePercent)}
                          </TableCell>
                        )}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </div>

      <Dialog
        open={Boolean(drilldownLine)}
        onOpenChange={(open) => {
          if (!open) {
            setDrilldownLine(null);
            setDrilldownTransactions([]);
            setDrilldownError(null);
            setIsDrilldownLoading(false);
          }
        }}
      >
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{drilldownLine?.label ?? 'Line Item Details'}</DialogTitle>
            <DialogDescription>
              {drilldownLine ? `Transactions contributing to ${drilldownLine.label.toLowerCase()} for ${rangeLabel}.` : ''}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {drilldownLine && (
              <div className="flex flex-wrap items-center gap-6 text-sm">
                <span className="font-medium text-foreground">
                  Current: {formatCurrencyValue(drilldownLine.currentAmount)}
                </span>
                {showComparisonColumns && (
                  <span className="text-muted-foreground">
                    {appliedComparisonLabel}: {formatCurrencyValue(
                      appliedComparisonMode === 'BUDGET'
                        ? drilldownLine.budgetAmount ?? drilldownLine.comparisonAmount
                        : drilldownLine.comparisonAmount,
                    )}
                  </span>
                )}
                {drilldownLine.percentOfRevenue !== undefined && drilldownLine.percentOfRevenue !== null && (
                  <span className="text-muted-foreground">
                    {formatPercentValue(drilldownLine.percentOfRevenue)} of revenue
                  </span>
                )}
              </div>
            )}
            {drilldownError && (
              <Alert variant="destructive">
                <AlertTitle>Unable to load transactions</AlertTitle>
                <AlertDescription>{drilldownError}</AlertDescription>
              </Alert>
            )}
            {isDrilldownLoading ? (
              <Skeleton className="h-[240px] w-full" />
            ) : drilldownTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No supporting transactions were returned for this line item.
              </p>
            ) : (
              <ScrollArea className="h-[320px] rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[120px]">Date</TableHead>
                      <TableHead className="w-[140px]">Reference</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="w-[140px]">Department</TableHead>
                      <TableHead className="w-[140px]">Salesperson</TableHead>
                      <TableHead className="w-[120px] text-right">Debit</TableHead>
                      <TableHead className="w-[120px] text-right">Credit</TableHead>
                      <TableHead className="w-[120px] text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {drilldownTransactions.map((transaction) => {
                      const debit = transaction.debit ?? null;
                      const credit = transaction.credit ?? null;
                      return (
                        <TableRow key={transaction.id}>
                          <TableCell>{formatDateLabel(transaction.date)}</TableCell>
                          <TableCell>{transaction.reference ?? '—'}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{transaction.description}</span>
                              {transaction.memo && (
                                <span className="text-xs text-muted-foreground">{transaction.memo}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>{transaction.department ?? '—'}</TableCell>
                          <TableCell>{transaction.salesperson ?? '—'}</TableCell>
                          <TableCell className="text-right">
                            {debit !== null ? formatCurrencyValue(debit) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {credit !== null ? formatCurrencyValue(credit) : '—'}
                          </TableCell>
                          <TableCell className="text-right font-medium text-foreground">
                            {formatCurrencyValue(transaction.amount)}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrilldownLine(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Profit &amp; Loss Statement</DialogTitle>
            <DialogDescription>
              Send the current statement as an attachment to one or more recipients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="pl-email-recipients">
                Recipients
              </label>
              <Input
                id="pl-email-recipients"
                placeholder="finance@example.com, controller@example.com"
                value={emailRecipients}
                onChange={(event) => setEmailRecipients(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate multiple email addresses with commas.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="pl-email-subject">
                Subject
              </label>
              <Input
                id="pl-email-subject"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="pl-email-message">
                Message
              </label>
              <Textarea
                id="pl-email-message"
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
                rows={5}
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setIsEmailDialogOpen(false)} disabled={isSendingEmail}>
              Cancel
            </Button>
            <Button onClick={() => void handleSendEmail()} disabled={isSendingEmail} className="gap-2">
              {isSendingEmail ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mail className="h-4 w-4" />}
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );
}
