import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfMonth } from 'date-fns';
import {
  CalendarIcon,
  FileSpreadsheet,
  FileText,
  Loader2,
  Mail,
  Printer,
} from 'lucide-react';
import AccountingLayout from './AccountingLayout';
import {
  emailStatementRequest,
  exportStatementRequest,
  fetchCashFlow,
  type FinancialStatementSection,
} from '@/lib/accountingApi';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  ResponsiveContainer,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  Bar,
  Cell,
} from 'recharts';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

type CashFlowMethod = 'indirect' | 'direct';
type GroupKey = 'operating' | 'investing' | 'financing' | 'summary' | 'other';

interface GroupedSection {
  section: FinancialStatementSection;
  normalized: string;
  index: number;
}

interface WaterfallPoint {
  key: string;
  name: string;
  base: number;
  value: number;
  labelValue: number;
  displayValue: number;
  cumulative: number;
  type: 'start' | 'operating' | 'investing' | 'financing' | 'end';
  isTotal: boolean;
}

const WATERFALL_COLORS: Record<WaterfallPoint['type'], string> = {
  start: '#6B7280',
  operating: '#059669',
  investing: '#DC2626',
  financing: '#2563EB',
  end: '#1F2937',
};

const OPERATING_KEYWORDS = [
  'operating',
  'netincome',
  'adjustments',
  'depreciation',
  'amortization',
  'lossgainonsale',
  'gainonsale',
  'lossonsale',
  'saleofassets',
  'baddebt',
  'accountsreceivable',
  'receivables',
  'inventory',
  'prepaid',
  'accountspayable',
  'accrued',
  'deposits',
];

const INVESTING_KEYWORDS = [
  'investing',
  'ppe',
  'propertyplant',
  'equipment',
  'saleofequipment',
  'purchaseofinvestments',
  'saleofinvestments',
  'capitalexpenditures',
];

const FINANCING_KEYWORDS = [
  'financing',
  'floorplan',
  'borrowing',
  'longtermdebt',
  'ownercontributions',
  'ownerdraws',
  'equity',
];

const SUMMARY_KEYWORDS = [
  'netincrease',
  'netdecrease',
  'netchange',
  'cashatbeginning',
  'beginningcash',
  'cashatend',
  'endingcash',
  'cashending',
  'cashsummary',
  'cashbalance',
];

const SUMMARY_PRIMARY_KEYWORDS = [
  'netincrease',
  'netchange',
  'cashatbeginning',
  'beginningcash',
  'cashatend',
  'endingcash',
];

function normalizeLabel(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function determineGroup(normalized: string): GroupKey {
  if (SUMMARY_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'summary';
  }
  if (OPERATING_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'operating';
  }
  if (INVESTING_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'investing';
  }
  if (FINANCING_KEYWORDS.some((keyword) => normalized.includes(keyword))) {
    return 'financing';
  }
  return 'other';
}

function isGroupTotalLabel(normalized: string) {
  return (
    normalized.includes('netcashprovided') ||
    normalized.includes('netcashused') ||
    normalized.includes('netcashfrom')
  );
}

function isSummaryPrimaryLabel(normalized: string) {
  return SUMMARY_PRIMARY_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

function isHighlightedSection(normalized: string) {
  return (
    isGroupTotalLabel(normalized) ||
    normalized.includes('netincrease') ||
    normalized.includes('netchange') ||
    normalized.includes('endingcash') ||
    normalized.includes('cashatend')
  );
}

function formatCurrency(value: number | null | undefined) {
  const numeric = typeof value === 'number' && Number.isFinite(value) ? value : 0;
  return currencyFormatter.format(numeric);
}

function formatDateLabel(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }
  return format(parsed, 'MMM d, yyyy');
}

function buildWaterfallData(
  beginningCash: number,
  operating: number,
  investing: number,
  financing: number,
  endingCash: number,
): WaterfallPoint[] {
  const data: WaterfallPoint[] = [];
  const startBase = Math.min(beginningCash, 0);
  data.push({
    key: 'start',
    name: 'Beginning Cash',
    base: startBase,
    value: Math.abs(beginningCash - startBase),
    labelValue: beginningCash,
    displayValue: beginningCash,
    cumulative: beginningCash,
    type: 'start',
    isTotal: true,
  });

  let cumulative = beginningCash;
  const steps: Array<{ key: WaterfallPoint['type']; name: string; amount: number }> = [
    { key: 'operating', name: 'Operating', amount: operating },
    { key: 'investing', name: 'Investing', amount: investing },
    { key: 'financing', name: 'Financing', amount: financing },
  ];

  steps.forEach((step) => {
    const previous = cumulative;
    cumulative += step.amount;
    const lower = Math.min(previous, cumulative);
    const upper = Math.max(previous, cumulative);
    data.push({
      key: step.key,
      name: `${step.name} Activities`,
      base: lower,
      value: Math.abs(upper - lower),
      labelValue: step.amount,
      displayValue: step.amount,
      cumulative,
      type: step.key,
      isTotal: false,
    });
  });

  const endBase = Math.min(endingCash, 0);
  data.push({
    key: 'end',
    name: 'Ending Cash',
    base: endBase,
    value: Math.abs(endingCash - endBase),
    labelValue: endingCash,
    displayValue: endingCash,
    cumulative: endingCash,
    type: 'end',
    isTotal: true,
  });

  return data;
}
export default function CashFlowStatement() {
  const [range, setRange] = useState(() => ({ startDate: startOfMonth(new Date()), endDate: new Date() }));
  const [method, setMethod] = useState<CashFlowMethod>('indirect');
  const [expandedAccounts, setExpandedAccounts] = useState<Record<string, boolean>>({});
  const [activeExport, setActiveExport] = useState<'pdf' | 'excel' | null>(null);
  const [isEmailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setSendingEmail] = useState(false);
  const { toast } = useToast();

  const isoStart = useMemo(() => format(range.startDate, 'yyyy-MM-dd'), [range.startDate]);
  const isoEnd = useMemo(() => format(range.endDate, 'yyyy-MM-dd'), [range.endDate]);

  const statementQuery = useQuery({
    queryKey: ['accounting', 'cash-flow', method, isoStart, isoEnd],
    queryFn: () => fetchCashFlow({ startDate: isoStart, endDate: isoEnd, method }),
  });

  const statement = statementQuery.data;
  const isLoading = statementQuery.isLoading;
  const isFetching = statementQuery.isFetching;
  const statementError = statementQuery.error;

  const dealershipName = useMemo(
    () => (statement?.dealershipName?.trim() ? statement.dealershipName.trim() : 'Dealership'),
    [statement?.dealershipName],
  );

  const rangePickerLabel = useMemo(
    () => `${format(range.startDate, 'MMM d, yyyy')} – ${format(range.endDate, 'MMM d, yyyy')}`,
    [range.endDate, range.startDate],
  );
  const periodLabel = useMemo(
    () => `For the period ${format(range.startDate, 'MMMM d, yyyy')} to ${format(range.endDate, 'MMMM d, yyyy')}`,
    [range.endDate, range.startDate],
  );
  const methodLabel = useMemo(() => (method === 'indirect' ? 'Indirect Method' : 'Direct Method'), [method]);
  const emailSubjectFallback = useMemo(
    () =>
      `Statement of Cash Flows – ${format(range.startDate, 'MMM d, yyyy')} to ${format(range.endDate, 'MMM d, yyyy')} (${methodLabel})`,
    [methodLabel, range.endDate, range.startDate],
  );
  const emailMessageFallback = useMemo(
    () => `Please find attached the Statement of Cash Flows for ${periodLabel}.`,
    [periodLabel],
  );

  useEffect(() => {
    if (!statement?.method) {
      return;
    }
    const normalized = statement.method.toLowerCase();
    if (normalized === 'indirect' || normalized === 'direct') {
      setMethod((prev) => (prev === normalized ? prev : (normalized as CashFlowMethod)));
    }
  }, [statement?.method]);

  useEffect(() => {
    setExpandedAccounts({});
  }, [statement?.generatedAt, method]);

  const groupedSections = useMemo(() => {
    const groups: Record<GroupKey, GroupedSection[]> = {
      operating: [],
      investing: [],
      financing: [],
      summary: [],
      other: [],
    };
    if (!statement?.sections) {
      return groups;
    }
    statement.sections.forEach((section, index) => {
      const normalized = normalizeLabel(section.label);
      const groupKey = determineGroup(normalized);
      groups[groupKey].push({ section, normalized, index });
    });
    (Object.keys(groups) as GroupKey[]).forEach((key) => {
      groups[key].sort((a, b) => a.index - b.index);
    });
    return groups;
  }, [statement?.sections]);

  const allSectionsOrdered = useMemo(
    () =>
      statement?.sections?.map((section, index) => ({
        section,
        normalized: normalizeLabel(section.label),
        index,
      })) ?? [],
    [statement?.sections],
  );

  const { operating: operatingSections, investing: investingSections, financing: financingSections, summary: summarySections, other: otherSections } =
    groupedSections;

  const summaryTotals = useMemo(() => {
    const map = new Map<string, number>();
    summarySections.forEach(({ normalized, section }) => {
      map.set(normalized, section.total);
    });
    return map;
  }, [summarySections]);

  const normalizedTotals = useMemo(() => {
    const map = new Map<string, number>();
    if (!statement?.totals) {
      return map;
    }
    Object.entries(statement.totals).forEach(([key, value]) => {
      if (typeof value === 'number' && Number.isFinite(value)) {
        map.set(normalizeLabel(key), value);
      }
    });
    return map;
  }, [statement?.totals]);

  const findTotalValue = useCallback(
    (keys: string[]) => {
      if (!statement?.totals) {
        return undefined;
      }
      for (const key of keys) {
        const direct = statement.totals[key];
        if (typeof direct === 'number' && Number.isFinite(direct)) {
          return direct;
        }
      }
      for (const key of keys) {
        const normalized = normalizeLabel(key);
        if (normalizedTotals.has(normalized)) {
          return normalizedTotals.get(normalized);
        }
      }
      return undefined;
    },
    [normalizedTotals, statement?.totals],
  );

  const getSummaryValue = useCallback(
    (keys: string[]) => {
      for (const key of keys) {
        const normalized = normalizeLabel(key);
        if (summaryTotals.has(normalized)) {
          return summaryTotals.get(normalized);
        }
      }
      return undefined;
    },
    [summaryTotals],
  );

  const getGroupHighlightTotal = useCallback((sections: GroupedSection[]) => {
    const highlight = sections.find((item) => isGroupTotalLabel(item.normalized));
    return highlight?.section.total;
  }, []);

  const netOperating =
    findTotalValue(['netOperatingCash', 'operatingActivities', 'operating', 'netCashProvidedByOperatingActivities']) ??
    getGroupHighlightTotal(operatingSections) ??
    0;
  const netInvesting =
    findTotalValue(['netInvestingCash', 'investingActivities', 'investing', 'netCashUsedInInvestingActivities']) ??
    getGroupHighlightTotal(investingSections) ??
    0;
  const netFinancing =
    findTotalValue(['netFinancingCash', 'financingActivities', 'financing', 'netCashProvidedByFinancingActivities']) ??
    getGroupHighlightTotal(financingSections) ??
    0;

  const netChangeCandidate =
    findTotalValue(['netChange', 'netIncrease', 'netIncreaseInCash', 'netCashChange']) ??
    getSummaryValue(['netincreasedecreaseincash', 'netincreaseincash', 'netchangeincash', 'netchange']);
  const netChange = netChangeCandidate ?? netOperating + netInvesting + netFinancing;

  const beginningCashCandidate =
    findTotalValue(['beginningCash', 'cashBeginning', 'cashAtBeginning', 'cashAtBeginningOfPeriod', 'openingCash']) ??
    getSummaryValue(['cashatbeginningofperiod', 'beginningcash', 'cashbeginning', 'openingcash']);
  const endingCashCandidate =
    findTotalValue(['endingCash', 'cashEnding', 'cashAtEnd', 'cashAtEndOfPeriod', 'closingCash']) ??
    getSummaryValue(['cashatendofperiod', 'endingcash', 'cashending', 'closingcash']);

  const endingCash = endingCashCandidate ?? (beginningCashCandidate !== undefined ? beginningCashCandidate + netChange : netChange);
  const beginningCash = beginningCashCandidate ?? endingCash - netChange;

  const waterfallData = useMemo(
    () => buildWaterfallData(beginningCash, netOperating, netInvesting, netFinancing, endingCash),
    [beginningCash, endingCash, netFinancing, netInvesting, netOperating],
  );

  const hasPrimaryGroups =
    operatingSections.length > 0 || investingSections.length > 0 || financingSections.length > 0;
  const fallbackSections = hasPrimaryGroups ? [] : allSectionsOrdered;
  const summaryExtraSections = summarySections.filter((item) => !isSummaryPrimaryLabel(item.normalized));

  const errorMessage =
    statementError instanceof Error
      ? statementError.message
      : statementError
        ? 'Unable to load Cash Flow Statement.'
        : null;

  const toggleAccount = useCallback((accountId: string) => {
    setExpandedAccounts((prev) => ({
      ...prev,
      [accountId]: !prev[accountId],
    }));
  }, []);

  const handleExport = useCallback(
    async (formatType: 'pdf' | 'excel') => {
      if (activeExport) {
        return;
      }
      setActiveExport(formatType);
      try {
        const result = await exportStatementRequest('cash-flow', formatType, {
          startDate: isoStart,
          endDate: isoEnd,
          method,
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
          description: error instanceof Error ? error.message : 'Unable to export cash flow statement.',
          variant: 'destructive',
        });
      } finally {
        setActiveExport(null);
      }
    },
    [activeExport, isoEnd, isoStart, method, toast],
  );

  const handlePrint = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  }, []);

  const openEmailDialog = useCallback(() => {
    setEmailSubject(emailSubjectFallback);
    setEmailMessage(emailMessageFallback);
    setEmailDialogOpen(true);
  }, [emailMessageFallback, emailSubjectFallback]);

  const handleSendEmail = useCallback(async () => {
    const recipients = emailRecipients
      .split(',')
      .map((recipient) => recipient.trim())
      .filter(Boolean);
    if (recipients.length === 0) {
      toast({
        title: 'Recipients required',
        description: 'Enter at least one email address before sending.',
        variant: 'destructive',
      });
      return;
    }
    setSendingEmail(true);
    try {
      await emailStatementRequest({
        statement: 'cash-flow',
        recipients,
        startDate: isoStart,
        endDate: isoEnd,
        method,
        subject: emailSubject.trim() || emailSubjectFallback,
        message: emailMessage.trim() || emailMessageFallback,
      });
      toast({ title: 'Email sent', description: 'Your Statement of Cash Flows has been emailed.' });
      setEmailDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Email failed',
        description: error instanceof Error ? error.message : 'Unable to send cash flow statement email.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  }, [
    emailMessage,
    emailMessageFallback,
    emailRecipients,
    emailSubject,
    emailSubjectFallback,
    isoEnd,
    isoStart,
    method,
    toast,
  ]);

  const onToggleMethod = useCallback((value: string) => {
    if (value === 'indirect' || value === 'direct') {
      setMethod(value);
    }
  }, []);

  const renderSectionBlock = useCallback(
    (item: GroupedSection) => {
      const { section, normalized } = item;
      const highlight = isHighlightedSection(normalized);
      const amountClass = highlight
        ? section.total >= 0
          ? 'text-emerald-600'
          : 'text-rose-600'
        : 'text-foreground';
      return (
        <div key={`${item.index}-${section.label}`} className="space-y-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{section.label}</p>
            </div>
            <span className={`text-sm font-semibold ${amountClass}`}>{formatCurrency(section.total)}</span>
          </div>
          {section.accounts.length > 0 ? (
            <div className="overflow-hidden rounded-lg border bg-background">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {section.accounts.map((account) => {
                    const isExpanded = Boolean(expandedAccounts[account.accountId]);
                    return (
                      <Fragment key={account.accountId}>
                        <TableRow
                          className="cursor-pointer transition hover:bg-muted/40"
                          onClick={() => toggleAccount(account.accountId)}
                        >
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium text-foreground">{account.accountName}</span>
                              {account.accountNumber && (
                                <span className="text-xs text-muted-foreground">{account.accountNumber}</span>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-right font-semibold">{formatCurrency(account.total)}</TableCell>
                        </TableRow>
                        {isExpanded && (
                          <TableRow className="bg-muted/30">
                            <TableCell colSpan={2}>
                              <div className="space-y-2">
                                {account.entries.length > 0 ? (
                                  account.entries.map((entry) => {
                                    const amount = (entry.debit ?? 0) - (entry.credit ?? 0);
                                    return (
                                      <div
                                        key={entry.journalEntryId}
                                        className="flex flex-col gap-1 rounded-md border bg-background/80 p-3 sm:flex-row sm:items-center sm:justify-between"
                                      >
                                        <div className="space-y-1">
                                          <p className="text-sm font-medium text-foreground">{entry.entryNumber}</p>
                                          {entry.memo && (
                                            <p className="text-xs text-muted-foreground">{entry.memo}</p>
                                          )}
                                        </div>
                                        <div className="flex flex-col items-start gap-1 text-xs text-muted-foreground sm:items-end sm:text-sm">
                                          <span>{formatDateLabel(entry.postingDate)}</span>
                                          <span className="font-semibold text-foreground">{formatCurrency(amount)}</span>
                                        </div>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <p className="text-sm text-muted-foreground">No supporting journal entries.</p>
                                )}
                              </div>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="rounded-md border border-dashed bg-muted/20 p-4 text-sm text-muted-foreground">
              No activity recorded for this line.
            </div>
          )}
        </div>
      );
    },
    [expandedAccounts, toggleAccount],
  );

  const renderGroupCard = useCallback(
    (title: string, sections: GroupedSection[]) => {
      if (!sections.length) {
        return null;
      }
      const headerTotal = getGroupHighlightTotal(sections);
      return (
        <Card key={title}>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>{title}</CardTitle>
              {headerTotal !== undefined && (
                <span
                  className={`text-sm font-semibold ${headerTotal >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}
                >
                  {formatCurrency(headerTotal)}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {sections.map((item) => renderSectionBlock(item))}
          </CardContent>
        </Card>
      );
    },
    [getGroupHighlightTotal, renderSectionBlock],
  );

  if (isLoading && !statement) {
    return (
      <AccountingLayout>
        <div className="space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-10 w-80" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            <Skeleton className="h-48" />
            <Skeleton className="h-48" />
          </div>
          <Skeleton className="h-96" />
        </div>
      </AccountingLayout>
    );
  }

  return (
    <AccountingLayout>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div className="space-y-2">
              <p className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{dealershipName}</p>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-foreground">Statement of Cash Flows</h1>
                {isFetching && !isLoading && (
                  <Badge variant="outline" className="flex items-center gap-1 text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Updating
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{periodLabel}</p>
              <p className="text-xs text-muted-foreground">{methodLabel}</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void handleExport('pdf')}
                disabled={activeExport !== null}
              >
                {activeExport === 'pdf' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2"
                onClick={() => void handleExport('excel')}
                disabled={activeExport !== null}
              >
                {activeExport === 'excel' ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSpreadsheet className="h-4 w-4" />}
                Excel
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={openEmailDialog}>
                <Mail className="h-4 w-4" />
                Email
              </Button>
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Print
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-muted-foreground">Method</span>
                <ToggleGroup type="single" value={method} onValueChange={onToggleMethod} size="sm">
                  <ToggleGroupItem value="indirect">Indirect</ToggleGroupItem>
                  <ToggleGroupItem value="direct">Direct</ToggleGroupItem>
                </ToggleGroup>
              </div>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex min-w-[240px] items-center justify-start gap-2 text-left"
                  >
                    <CalendarIcon className="h-4 w-4" />
                    <span className="truncate">{rangePickerLabel}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="start" className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={{ from: range.startDate, to: range.endDate }}
                    defaultMonth={range.startDate}
                    numberOfMonths={2}
                    onSelect={(selected) => {
                      if (selected?.from && selected?.to) {
                        setRange({ startDate: selected.from, endDate: selected.to });
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          {errorMessage && (
            <Alert variant="destructive">
              <AlertTitle>Unable to load cash flow statement</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
        </div>

        {statement && (
          <>
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-sm font-medium text-muted-foreground">Net Increase (Decrease) in Cash</dt>
                      <dd className={`text-sm font-semibold ${netChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(netChange)}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-sm font-medium text-muted-foreground">Cash at Beginning of Period</dt>
                      <dd className="text-sm font-semibold text-foreground">{formatCurrency(beginningCash)}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <dt className="text-sm font-medium text-muted-foreground">Cash at End of Period</dt>
                      <dd className="text-sm font-semibold text-foreground">{formatCurrency(endingCash)}</dd>
                    </div>
                    {summaryExtraSections.map((item) => (
                      <div key={item.section.label} className="flex items-center justify-between gap-3">
                        <dt className="text-sm text-muted-foreground">{item.section.label}</dt>
                        <dd className="text-sm font-semibold text-foreground">
                          {formatCurrency(item.section.total)}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Cash Flow Waterfall</CardTitle>
                </CardHeader>
                <CardContent className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={waterfallData} margin={{ top: 16, right: 24, left: 8, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis width={100} tickFormatter={(value: number) => formatCurrency(value)} />
                      <RechartsTooltip
                        formatter={(_value, _name, item) => {
                          const payload = (item?.payload ?? {}) as WaterfallPoint;
                          const label = payload.isTotal ? 'Balance' : 'Change';
                          return [formatCurrency(payload.displayValue), label];
                        }}
                        labelFormatter={(label) => label as string}
                      />
                      <Bar dataKey="base" stackId="a" fill="transparent" isAnimationActive={false} />
                      <Bar dataKey="value" stackId="a" barSize={36} isAnimationActive={false} radius={[4, 4, 4, 4]}>
                        {waterfallData.map((entry) => (
                          <Cell key={entry.key} fill={WATERFALL_COLORS[entry.type]} />
                        ))}
                      </Bar>
                    </ComposedChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {hasPrimaryGroups ? (
                <>
                  {renderGroupCard('Operating Activities', operatingSections)}
                  {renderGroupCard('Investing Activities', investingSections)}
                  {renderGroupCard('Financing Activities', financingSections)}
                </>
              ) : (
                fallbackSections.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Cash Flow Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {fallbackSections.map((item) => renderSectionBlock(item))}
                    </CardContent>
                  </Card>
                )
              )}

              {hasPrimaryGroups && otherSections.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Additional Cash Flow Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {otherSections.map((item) => renderSectionBlock(item))}
                  </CardContent>
                </Card>
              )}
            </div>
          </>
        )}
      </div>

      <Dialog open={isEmailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Email Statement of Cash Flows</DialogTitle>
            <DialogDescription>
              Send the Statement of Cash Flows for {rangePickerLabel} to selected recipients.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="cash-flow-email-recipients">
                Recipients
              </label>
              <Input
                id="cash-flow-email-recipients"
                placeholder="finance@dealership.com, controller@dealership.com"
                value={emailRecipients}
                onChange={(event) => setEmailRecipients(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate multiple email addresses with commas.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="cash-flow-email-subject">
                Subject
              </label>
              <Input
                id="cash-flow-email-subject"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground" htmlFor="cash-flow-email-message">
                Message
              </label>
              <Textarea
                id="cash-flow-email-message"
                rows={5}
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
                placeholder={emailMessageFallback}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)} disabled={isSendingEmail}>
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
