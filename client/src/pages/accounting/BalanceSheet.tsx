import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  Download,
  ListTree,
  Loader2,
  Mail,
  Printer,
} from 'lucide-react';
import AccountingLayout from './AccountingLayout';
import {
  emailStatementRequest,
  exportStatementRequest,
  fetchBalanceSheet,
  type BalanceSheetComparisonMode,
  type BalanceSheetLineItem,
  type BalanceSheetReport,
} from '@/lib/accountingApi';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function parseAddresses(value: string): string[] {
  return value
    .split(/[,;\n]+/)
    .map((item) => item.trim())
    .filter((item, index, array) => item.length > 0 && array.indexOf(item) === index);
}

const comparisonOptions: Array<{ value: BalanceSheetComparisonMode; label: string }> = [
  { value: 'NONE', label: 'None' },
  { value: 'PREVIOUS_MONTH', label: 'Previous Month' },
  { value: 'PREVIOUS_YEAR', label: 'Previous Year' },
];

type FlattenedLine = {
  id: string;
  line: BalanceSheetLineItem;
  depth: number;
};

function buildLineId(prefix: string, key: string) {
  return `${prefix}/${key}`;
}

function formatCurrency(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return currencyFormatter.format(value);
}

function formatDelta(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  const formatted = currencyFormatter.format(Math.abs(value));
  if (value > 0) {
    return `+${formatted}`;
  }
  if (value < 0) {
    return `-${formatted}`;
  }
  return formatted;
}

function calculateVariance(line: BalanceSheetLineItem) {
  const comparison = line.comparisonAmount ?? 0;
  const variance = (line.amount ?? 0) - comparison;
  const variancePercent = comparison !== 0 ? variance / Math.abs(comparison) : null;
  return { variance, variancePercent };
}

function getEarliestDateString(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export default function BalanceSheet() {
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [comparison, setComparison] = useState<BalanceSheetComparisonMode>('NONE');
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());
  const [drilldownLine, setDrilldownLine] = useState<BalanceSheetLineItem | null>(null);
  const [isEmailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailSubject, setEmailSubject] = useState('Balance Sheet');
  const [emailMessage, setEmailMessage] = useState('');
  const [isSendingEmail, setSendingEmail] = useState(false);
  const [emailFormats, setEmailFormats] = useState<Set<'pdf' | 'excel'>>(new Set(['pdf']));
  const [activeExport, setActiveExport] = useState<'pdf' | 'excel' | 'quickbooks' | 'sage-xero' | null>(null);
  const { toast } = useToast();

  const isoDate = useMemo(() => getEarliestDateString(selectedDate), [selectedDate]);

  const statementQuery = useQuery<BalanceSheetReport>({
    queryKey: ['accounting', 'balance-sheet', isoDate, comparison],
    queryFn: () => fetchBalanceSheet({ date: isoDate, comparison }),
  });

  const statement = statementQuery.data;
  const isLoading = statementQuery.isLoading;
  const isFetching = statementQuery.isFetching;

  useEffect(() => {
    if (!statement) {
      setExpandedKeys(new Set());
      return;
    }
    const initial = new Set<string>();
    statement.sections.forEach((section) => {
      section.children.forEach((line) => {
        if (line.children && line.children.length > 0) {
          initial.add(buildLineId(section.key, line.key));
        }
      });
    });
    setExpandedKeys(initial);
  }, [statement?.generatedAt]);

  const expandableLineIds = useMemo(() => {
    if (!statement) {
      return new Set<string>();
    }
    const collect = (line: BalanceSheetLineItem, prefix: string, ids: Set<string>) => {
      const id = buildLineId(prefix, line.key);
      if (line.children && line.children.length > 0) {
        ids.add(id);
        line.children.forEach((child) => collect(child, id, ids));
      }
    };
    const ids = new Set<string>();
    statement.sections.forEach((section) => {
      section.children.forEach((line) => collect(line, section.key, ids));
    });
    return ids;
  }, [statement]);

  const isAllExpanded = useMemo(() => {
    if (!expandableLineIds.size) {
      return false;
    }
    return Array.from(expandableLineIds).every((id) => expandedKeys.has(id));
  }, [expandableLineIds, expandedKeys]);

  const handleExpandAll = () => {
    if (!expandableLineIds.size) {
      return;
    }
    setExpandedKeys(new Set(expandableLineIds));
  };

  const handleCollapseAll = () => {
    if (!expandedKeys.size) {
      return;
    }
    setExpandedKeys(new Set());
  };

  const hasComparison = useMemo(() => {
    if (!statement?.comparison || statement.comparison.mode === 'NONE') {
      return false;
    }
    return Boolean(statement.comparison.asOfDate);
  }, [statement?.comparison]);

  const asOfLabel = statement ? format(new Date(statement.asOfDate), 'MMMM d, yyyy') : null;
  const comparisonLabel = statement?.comparison?.asOfDate
    ? format(new Date(statement.comparison.asOfDate), 'MMMM d, yyyy')
    : null;
  const balanceDifference = statement
    ? Math.abs(
        (statement.sections
          .find((section) => section.key === 'ASSETS')
          ?.children.find((line) => line.key === 'total-assets')?.amount ?? 0) -
          (statement.sections
            .find((section) => section.key === 'LIABILITIES_EQUITY')
            ?.children.find((line) => line.key === 'total-liabilities-equity')?.amount ?? 0),
      )
    : 0;

  const handleToggle = (id: string) => {
    setExpandedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExport = useCallback(
    async (format: 'pdf' | 'excel' | 'quickbooks' | 'sage-xero') => {
      if (!statement) return;
      if (activeExport) return;
      setActiveExport(format);
      try {
        const result = await exportStatementRequest('balance-sheet', format, {
          startDate: '1970-01-01',
          endDate: `${isoDate}T23:59:59Z`,
          comparison: comparison !== 'NONE' ? comparison : undefined,
        });
        const url = URL.createObjectURL(result.blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = result.filename;
        document.body.appendChild(anchor);
        anchor.click();
        anchor.remove();
        URL.revokeObjectURL(url);
        toast({ title: 'Export complete', description: `Downloaded ${result.filename}` });
      } catch (error) {
        toast({
          title: 'Export failed',
          description: error instanceof Error ? error.message : 'Unable to export balance sheet.',
          variant: 'destructive',
        });
      } finally {
        setActiveExport(null);
      }
    },
    [activeExport, comparison, isoDate, statement, toast],
  );

  const openEmailDialog = useCallback(() => {
    const defaultSubject = `Balance Sheet – ${asOfLabel ?? isoDate}`;
    const defaultMessage = `Please find attached the balance sheet as of ${asOfLabel ?? isoDate}.`;
    setEmailSubject(defaultSubject);
    setEmailMessage(defaultMessage);
    setEmailCc('');
    setEmailFormats(new Set(['pdf']));
    setEmailDialogOpen(true);
  }, [asOfLabel, isoDate]);

  const toggleEmailFormat = useCallback((format: 'pdf' | 'excel') => {
    setEmailFormats((previous) => {
      const next = new Set(previous);
      if (next.has(format)) {
        next.delete(format);
      } else {
        next.add(format);
      }
      return next;
    });
  }, []);

  const handleEmail = useCallback(async () => {
    if (!statement) return;
    const recipients = parseAddresses(emailRecipients);
    if (!recipients.length) {
      toast({ title: 'Add recipients', description: 'Enter at least one email address.', variant: 'destructive' });
      return;
    }
    const cc = parseAddresses(emailCc);
    const formats = emailFormats.size ? Array.from(emailFormats) : ['pdf'];
    setSendingEmail(true);
    try {
      await emailStatementRequest({
        statement: 'balance-sheet',
        recipients,
        cc: cc.length ? cc : undefined,
        formats,
        subject: emailSubject.trim() || `Balance Sheet – ${asOfLabel ?? isoDate}`,
        message: emailMessage.trim() || undefined,
        startDate: '1970-01-01',
        endDate: `${isoDate}T23:59:59Z`,
        comparison: comparison !== 'NONE' ? comparison : undefined,
      });
      toast({ title: 'Email scheduled', description: 'Balance sheet email is being delivered.' });
      setEmailDialogOpen(false);
      setEmailRecipients('');
    } catch (error) {
      toast({
        title: 'Email failed',
        description: error instanceof Error ? error.message : 'Unable to email balance sheet.',
        variant: 'destructive',
      });
    } finally {
      setSendingEmail(false);
    }
  }, [
    asOfLabel,
    comparison,
    emailCc,
    emailFormats,
    emailMessage,
    emailRecipients,
    emailSubject,
    isoDate,
    statement,
    toast,
  ]);

  const handlePrint = () => {
    window.print();
  };

  if (statementQuery.isError) {
    return (
      <AccountingLayout>
        <Alert variant="destructive">
          <AlertTitle>Unable to load balance sheet</AlertTitle>
          <AlertDescription>
            {(statementQuery.error as Error).message ?? 'An unexpected error occurred loading the balance sheet.'}
          </AlertDescription>
        </Alert>
      </AccountingLayout>
    );
  }

  if (isLoading || !statement) {
    return (
      <AccountingLayout>
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-10 w-48" />
          <Skeleton className="h-[480px]" />
        </div>
      </AccountingLayout>
    );
  }

  return (
    <AccountingLayout>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="space-y-1">
            <span className="text-sm font-medium text-muted-foreground">
              {statement.dealershipName ?? 'Dealership'}
            </span>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground">Balance Sheet</h1>
            <p className="text-sm text-muted-foreground">As of {asOfLabel}</p>
            {hasComparison && comparisonLabel && (
              <p className="text-xs text-muted-foreground">Comparison: {comparisonLabel}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4" />
                  <span>{format(selectedDate, 'MMM d, yyyy')}</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(date) => {
                    if (date) setSelectedDate(date);
                  }}
                  defaultMonth={selectedDate}
                />
              </PopoverContent>
            </Popover>
            <Select value={comparison} onValueChange={(value: BalanceSheetComparisonMode) => setComparison(value)}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Comparison" />
              </SelectTrigger>
              <SelectContent>
                {comparisonOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2" disabled={isFetching || Boolean(activeExport)}>
                  {activeExport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                  Export
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => void handleExport('pdf')}>
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> PDF
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExport('excel')}>
                  <span className="flex items-center gap-2">
                    <Download className="h-4 w-4" /> Excel
                  </span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void handleExport('quickbooks')}>
                  QuickBooks IIF
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => void handleExport('sage-xero')}>
                  Sage/Xero CSV
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={openEmailDialog}>
                  <span className="flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Email
                  </span>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handlePrint}>
                  <span className="flex items-center gap-2">
                    <Printer className="h-4 w-4" /> Print
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Assets</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-emerald-600">
              {formatCurrency(statement.totals.totalAssets)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Liabilities</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-amber-600">
              {formatCurrency(statement.totals.totalLiabilities)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Equity</CardTitle>
            </CardHeader>
            <CardContent className="text-2xl font-semibold text-blue-600">
              {formatCurrency(statement.totals.totalEquity)}
            </CardContent>
          </Card>
        </div>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle>Key Ratios</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="text-sm text-muted-foreground">Current Ratio</p>
              <p className="text-lg font-semibold text-foreground">
                {statement.ratios.currentRatio !== null
                  ? numberFormatter.format(statement.ratios.currentRatio)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quick Ratio</p>
              <p className="text-lg font-semibold text-foreground">
                {statement.ratios.quickRatio !== null
                  ? numberFormatter.format(statement.ratios.quickRatio)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Debt to Equity</p>
              <p className="text-lg font-semibold text-foreground">
                {statement.ratios.debtToEquity !== null
                  ? numberFormatter.format(statement.ratios.debtToEquity)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Working Capital</p>
              <p className="text-lg font-semibold text-foreground">
                {formatCurrency(statement.ratios.workingCapital)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inventory Turnover</p>
              <p className="text-lg font-semibold text-foreground">
                {statement.ratios.inventoryTurnover !== null
                  ? numberFormatter.format(statement.ratios.inventoryTurnover)
                  : '—'}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Days Sales in Inventory</p>
              <p className="text-lg font-semibold text-foreground">
                {statement.ratios.daysSalesInInventory !== null
                  ? numberFormatter.format(statement.ratios.daysSalesInInventory)
                  : '—'}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <CardTitle>Balance Sheet Detail</CardTitle>
              {balanceDifference > 0.5 && (
                <p className="text-xs text-destructive">
                  Warning: totals are out of balance by {formatCurrency(balanceDifference)}
                </p>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExpandAll}
                disabled={isAllExpanded || !expandableLineIds.size}
              >
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={handleCollapseAll} disabled={!expandedKeys.size}>
                Collapse All
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[45%]">Line Item</TableHead>
                  <TableHead className="text-right">Current</TableHead>
                  {hasComparison && (
                    <>
                      <TableHead className="text-right">Comparison</TableHead>
                      <TableHead className="text-right">Variance</TableHead>
                      <TableHead className="text-right">Variance %</TableHead>
                    </>
                  )}
                  <TableHead className="text-right">Drilldown</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statement.sections.map((section) => {
                  const sectionRows = section.children.flatMap((line) =>
                    renderLine({ id: buildLineId(section.key, line.key), line, depth: 0 }),
                  );
                  return (
                    <Fragment key={section.key}>
                      <TableRow key={`${section.key}-header`} className="bg-muted/40 font-semibold">
                        <TableCell colSpan={hasComparison ? 6 : 3}>
                          <div className="flex items-center justify-between">
                            <span>{section.label}</span>
                            <span>{formatCurrency(section.total)}</span>
                          </div>
                        </TableCell>
                      </TableRow>
                      {sectionRows}
                    </Fragment>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEmailDialogOpen} onOpenChange={(open) => setEmailDialogOpen(open)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Email Balance Sheet</DialogTitle>
            <DialogDescription>Send the balance sheet snapshot to selected recipients.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="balance-sheet-email-to">
                Recipients
              </label>
              <Input
                id="balance-sheet-email-to"
                placeholder="finance@example.com, owner@example.com"
                value={emailRecipients}
                onChange={(event) => setEmailRecipients(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="balance-sheet-email-cc">
                CC (optional)
              </label>
              <Input
                id="balance-sheet-email-cc"
                placeholder="controller@example.com"
                value={emailCc}
                onChange={(event) => setEmailCc(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="balance-sheet-email-subject">
                Subject
              </label>
              <Input
                id="balance-sheet-email-subject"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground" htmlFor="balance-sheet-email-message">
                Message
              </label>
              <Textarea
                id="balance-sheet-email-message"
                placeholder="Optional message to include."
                value={emailMessage}
                rows={4}
                onChange={(event) => setEmailMessage(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Attachments</p>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm" htmlFor="balance-sheet-email-format-pdf">
                  <Checkbox
                    id="balance-sheet-email-format-pdf"
                    checked={emailFormats.has('pdf')}
                    onCheckedChange={() => toggleEmailFormat('pdf')}
                  />
                  <span>PDF</span>
                </label>
                <label className="flex items-center gap-2 text-sm" htmlFor="balance-sheet-email-format-excel">
                  <Checkbox
                    id="balance-sheet-email-format-excel"
                    checked={emailFormats.has('excel')}
                    onCheckedChange={() => toggleEmailFormat('excel')}
                  />
                  <span>Excel (xlsx)</span>
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                At least one format must be selected. PDF will be sent by default if none are chosen.
              </p>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setEmailDialogOpen(false)} disabled={isSendingEmail}>
              Cancel
            </Button>
            <Button onClick={() => void handleEmail()} disabled={isSendingEmail}>
              {isSendingEmail && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(drilldownLine)} onOpenChange={(open) => !open && setDrilldownLine(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{drilldownLine?.label}</DialogTitle>
            <DialogDescription>
              Detailed account activity supporting {drilldownLine?.label} as of {asOfLabel}.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4">
              {drilldownLine?.accounts?.map((account) => (
                <div key={account.accountId} className="rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-foreground">{account.accountName}</p>
                      <p className="text-sm text-muted-foreground">{account.accountNumber}</p>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <p className="text-base font-semibold text-foreground">
                        {formatCurrency(account.amount)}
                      </p>
                      {hasComparison && (
                        <p>Comparison: {formatCurrency(account.comparisonAmount)}</p>
                      )}
                    </div>
                  </div>
                  {account.entries.length > 0 ? (
                    <div className="mt-3 rounded-md border">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Entry #</TableHead>
                            <TableHead>Memo</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {account.entries.map((entry) => {
                            const amount = (entry.debit ?? 0) - (entry.credit ?? 0);
                            return (
                              <TableRow key={entry.journalEntryId}>
                                <TableCell>{format(new Date(entry.postingDate), 'MMM d, yyyy')}</TableCell>
                                <TableCell>{entry.entryNumber}</TableCell>
                                <TableCell>{entry.memo ?? '—'}</TableCell>
                                <TableCell className="text-right">{formatCurrency(amount)}</TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-muted-foreground">No transaction detail available.</p>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDrilldownLine(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );

  function renderLine(item: FlattenedLine) {
    const { line, id, depth } = item;
    const isExpandable = Boolean(line.children && line.children.length);
    const isExpanded = expandedKeys.has(id);
    const { variance, variancePercent } = calculateVariance(line);

    const row = (
      <TableRow
        key={id}
        className={cn(
          line.type === 'TOTAL' && 'bg-muted/50 font-semibold',
          line.type === 'SUBTOTAL' && 'font-semibold',
        )}
      >
        <TableCell>
          <div className="flex items-center gap-2" style={{ paddingLeft: `${depth * 1.25}rem` }}>
            {isExpandable ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => handleToggle(id)}
                aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${line.label}`}
              >
                {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
              </Button>
            ) : (
              <span className="h-6 w-6" />
            )}
            <span
              className={cn(
                'truncate text-sm',
                line.type === 'TOTAL' ? 'font-semibold text-foreground' : undefined,
                line.type === 'SUBTOTAL' ? 'font-semibold text-muted-foreground' : undefined,
              )}
            >
              {line.type === 'TOTAL' ? `= ${line.label}` : line.label}
            </span>
          </div>
        </TableCell>
        <TableCell className="text-right text-sm font-medium text-foreground">
          {formatCurrency(line.amount)}
        </TableCell>
        {hasComparison && (
          <>
            <TableCell className="text-right text-sm text-muted-foreground">
              {formatCurrency(line.comparisonAmount)}
            </TableCell>
            <TableCell
              className={cn(
                'text-right text-sm font-medium',
                variance > 0 ? 'text-emerald-600' : variance < 0 ? 'text-red-600' : 'text-foreground',
              )}
            >
              {formatDelta(variance)}
            </TableCell>
            <TableCell className="text-right text-sm text-muted-foreground">
              {variancePercent !== null ? `${numberFormatter.format(variancePercent * 100)}%` : '—'}
            </TableCell>
          </>
        )}
        <TableCell className="text-right">
          {line.accounts && line.accounts.length > 0 ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setDrilldownLine(line)}
            >
              <ListTree className="h-4 w-4" />
            </Button>
          ) : (
            <span className="h-8 w-8" />
          )}
        </TableCell>
      </TableRow>
    );

    const children =
      isExpandable && isExpanded
        ? line.children!.flatMap((child) =>
            renderLine({
              id: buildLineId(id, child.key),
              line: child,
              depth: depth + 1,
            }),
          )
        : [];

    return [row, ...children];
  }
}
