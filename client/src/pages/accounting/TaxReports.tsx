import { useMemo, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Contractors1099Response,
  PayrollQuarter,
  Payroll941Report,
  SalesTaxReport,
  YearEndSummary,
  exportContractor1099Report,
  exportPayroll941Report,
  exportSalesTaxReport,
  exportYearEndPack,
  fetchContractors1099,
  fetchPayroll941Report,
  fetchSalesTaxReport,
  fetchYearEndSummary,
  markTaxReportFiled,
} from '@/lib/accountingApi';
import AccountingLayout from './AccountingLayout';
import { StatementHeader } from '@/components/accounting/StatementHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  FileArchive,
  FileDown,
  FileSpreadsheet,
  FileText,
  Send,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const STATE_OPTIONS = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'DC', label: 'District of Columbia' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' },
] as const;

type TabValue = 'sales-tax' | '941' | '1099' | 'year-end';

type DownloadTask = Promise<{ blob: Blob; filename: string }>;

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const numberFormatter = new Intl.NumberFormat('en-US', {
  maximumFractionDigits: 2,
});

export default function TaxReports() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabValue>('sales-tax');

  const [salesRange, setSalesRange] = useState<{ start: Date; end: Date }>(() => ({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date()),
  }));
  const [salesJurisdictions, setSalesJurisdictions] = useState<string[]>([]);
  const [jurisdictionPopoverOpen, setJurisdictionPopoverOpen] = useState(false);

  const [payrollQuarter, setPayrollQuarter] = useState<PayrollQuarter>('Q1');
  const [payrollYear, setPayrollYear] = useState<number>(new Date().getFullYear());

  const [contractorYear, setContractorYear] = useState<number>(new Date().getFullYear());
  const [yearEndYear, setYearEndYear] = useState<number>(new Date().getFullYear());

  const salesRangeQueryKey = useMemo(
    () => [
      'tax-reports',
      'sales-tax',
      format(salesRange.start, 'yyyy-MM-dd'),
      format(salesRange.end, 'yyyy-MM-dd'),
      salesJurisdictions.slice().sort().join(','),
    ],
    [salesRange.start, salesRange.end, salesJurisdictions],
  );

  const salesTaxQuery = useQuery<SalesTaxReport>({
    queryKey: salesRangeQueryKey,
    queryFn: () =>
      fetchSalesTaxReport({
        startDate: format(salesRange.start, 'yyyy-MM-dd'),
        endDate: format(salesRange.end, 'yyyy-MM-dd'),
        jurisdictions: salesJurisdictions,
      }),
    enabled: activeTab === 'sales-tax',
    staleTime: 1000 * 60 * 5,
    keepPreviousData: true,
  });

  const payrollQuery = useQuery<Payroll941Report>({
    queryKey: ['tax-reports', '941', payrollQuarter, payrollYear],
    queryFn: () => fetchPayroll941Report({ quarter: payrollQuarter, year: payrollYear }),
    enabled: activeTab === '941',
    staleTime: 1000 * 60 * 5,
  });

  const contractorsQuery = useQuery<Contractors1099Response>({
    queryKey: ['tax-reports', '1099', contractorYear],
    queryFn: () => fetchContractors1099({ year: contractorYear }),
    enabled: activeTab === '1099',
    staleTime: 1000 * 60 * 5,
  });

  const yearEndQuery = useQuery<YearEndSummary>({
    queryKey: ['tax-reports', 'year-end', yearEndYear],
    queryFn: () => fetchYearEndSummary(yearEndYear),
    enabled: activeTab === 'year-end',
    staleTime: 1000 * 60 * 5,
  });

  const markFiledMutation = useMutation({
    mutationFn: markTaxReportFiled,
    onSuccess: (_, variables) => {
      toast({
        title: 'Filed status updated',
        description: 'The filing date has been recorded successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['tax-reports', variables.type] });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to update filing',
        description: error instanceof Error ? error.message : 'Please try again in a few moments.',
        variant: 'destructive',
      });
    },
  });

  const handleDownload = async (task: DownloadTask, successMessage?: string) => {
    try {
      const { blob, filename } = await task;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Download ready', description: successMessage ?? `Saved ${filename}` });
    } catch (error) {
      toast({
        title: 'Download failed',
        description: error instanceof Error ? error.message : 'Unable to export the report right now.',
        variant: 'destructive',
      });
    }
  };

  const toggleJurisdiction = (value: string) => {
    setSalesJurisdictions((prev) =>
      prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value],
    );
  };

  const selectedJurisdictionOptions = useMemo(
    () => STATE_OPTIONS.filter((option) => salesJurisdictions.includes(option.value)),
    [salesJurisdictions],
  );

  const payrollYears = useMemo(() => {
    const current = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, index) => current - index);
  }, []);

  const jurisdictionBreakdown = salesTaxQuery.data?.jurisdictions ?? [];

  const salesTotals = salesTaxQuery.data?.totals;

  const handleSalesMarkFiled = () => {
    markFiledMutation.mutate({
      type: 'sales-tax',
      context: {
        startDate: format(salesRange.start, 'yyyy-MM-dd'),
        endDate: format(salesRange.end, 'yyyy-MM-dd'),
        jurisdictions: salesJurisdictions,
      },
    });
  };

  const handlePayrollMarkFiled = () => {
    markFiledMutation.mutate({
      type: '941',
      context: {
        quarter: payrollQuarter,
        year: payrollYear,
      },
    });
  };

  const handleContractorMarkFiled = () => {
    markFiledMutation.mutate({
      type: '1099',
      context: {
        year: contractorYear,
      },
    });
  };

  const handleYearEndMarkFiled = () => {
    markFiledMutation.mutate({
      type: 'year-end',
      context: {
        year: yearEndYear,
      },
    });
  };

  const renderPayrollAmount = (line: Payroll941Report['lines'][number]) => {
    switch (line.format) {
      case 'number':
        return numberFormatter.format(line.amount);
      case 'percentage':
        return `${numberFormatter.format(line.amount)}%`;
      default:
        return currencyFormatter.format(line.amount);
    }
  };

  return (
    <AccountingLayout>
      <TooltipProvider>
        <StatementHeader title="Tax Reports" />

        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabValue)} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="sales-tax">Sales Tax</TabsTrigger>
            <TabsTrigger value="941">Payroll Tax (941)</TabsTrigger>
            <TabsTrigger value="1099">1099 Contractors</TabsTrigger>
            <TabsTrigger value="year-end">Year-End Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="sales-tax" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Sales tax liability</CardTitle>
                <CardDescription>
                  Filter invoices by date and jurisdiction to calculate sales tax obligations and filing readiness.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex min-w-[260px] items-center justify-start gap-2"
                        >
                          <CalendarIcon className="h-4 w-4" />
                          {`${format(salesRange.start, 'MMM d, yyyy')} – ${format(salesRange.end, 'MMM d, yyyy')}`}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="range"
                          selected={{ from: salesRange.start, to: salesRange.end }}
                          onSelect={(range: DateRange | undefined) => {
                            if (range?.from && range?.to) {
                              setSalesRange({ start: range.from, end: range.to });
                            }
                          }}
                          numberOfMonths={2}
                          defaultMonth={salesRange.start}
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover open={jurisdictionPopoverOpen} onOpenChange={setJurisdictionPopoverOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex min-w-[260px] items-center justify-between gap-2"
                        >
                          <span className="truncate text-left">
                            {selectedJurisdictionOptions.length > 0
                              ? `${selectedJurisdictionOptions.length} jurisdiction${
                                  selectedJurisdictionOptions.length > 1 ? 's' : ''
                                } selected`
                              : 'All jurisdictions'}
                          </span>
                          <ChevronsUpDown className="h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[280px] p-0" align="start">
                        <Command>
                          <CommandInput placeholder="Search jurisdictions" />
                          <CommandList>
                            <CommandEmpty>No jurisdictions found.</CommandEmpty>
                            <CommandGroup>
                              {STATE_OPTIONS.map((option) => {
                                const selected = salesJurisdictions.includes(option.value);
                                return (
                                  <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                      toggleJurisdiction(option.value);
                                    }}
                                  >
                                    <Check
                                      className={cn(
                                        'mr-2 h-4 w-4',
                                        selected ? 'opacity-100' : 'opacity-0',
                                      )}
                                    />
                                    {option.label}
                                  </CommandItem>
                                );
                              })}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(
                          exportSalesTaxReport('pdf', {
                            startDate: format(salesRange.start, 'yyyy-MM-dd'),
                            endDate: format(salesRange.end, 'yyyy-MM-dd'),
                            jurisdictions: salesJurisdictions,
                          }),
                          'Generated sales tax PDF',
                        )
                      }
                      disabled={salesTaxQuery.isLoading}
                      className="gap-2"
                    >
                      <FileDown className="h-4 w-4" />
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleDownload(
                          exportSalesTaxReport('excel', {
                            startDate: format(salesRange.start, 'yyyy-MM-dd'),
                            endDate: format(salesRange.end, 'yyyy-MM-dd'),
                            jurisdictions: salesJurisdictions,
                          }),
                          'Generated Excel workbook',
                        )
                      }
                      disabled={salesTaxQuery.isLoading}
                      className="gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export Excel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSalesMarkFiled}
                      disabled={markFiledMutation.isPending}
                      className="gap-2"
                    >
                      <Send className="h-4 w-4" />
                      Remit to State
                    </Button>
                  </div>
                </div>

                {selectedJurisdictionOptions.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedJurisdictionOptions.map((option) => (
                      <Badge key={option.value} variant="secondary" className="gap-1">
                        {option.label}
                        <button
                          type="button"
                          className="rounded-full p-0.5 hover:bg-muted"
                          onClick={() => toggleJurisdiction(option.value)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {salesTaxQuery.data?.filedAt && (
                  <p className="text-sm text-muted-foreground">
                    Last filed {format(new Date(salesTaxQuery.data.filedAt), 'MMM d, yyyy')}
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle>Taxable invoices</CardTitle>
                  <CardDescription>Line-item breakdown of taxable sales within the selected period.</CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  {salesTaxQuery.isLoading ? (
                    <div className="space-y-3 p-6">
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                    </div>
                  ) : salesTaxQuery.data && salesTaxQuery.data.invoices.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[140px]">Invoice #</TableHead>
                            <TableHead className="w-[140px]">Date</TableHead>
                            <TableHead className="w-[220px]">Customer</TableHead>
                            <TableHead className="text-right">Subtotal</TableHead>
                            <TableHead className="text-right">Tax Rate</TableHead>
                            <TableHead className="text-right">Tax Amount</TableHead>
                            <TableHead className="text-right">Total</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {salesTaxQuery.data.invoices.map((invoice) => (
                            <TableRow key={`${invoice.invoiceNumber}-${invoice.invoiceDate}`}>
                              <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                              <TableCell>{format(new Date(invoice.invoiceDate), 'MMM d, yyyy')}</TableCell>
                              <TableCell className="max-w-[220px] truncate">{invoice.customerName}</TableCell>
                              <TableCell className="text-right">{currencyFormatter.format(invoice.subtotal)}</TableCell>
                              <TableCell className="text-right">{numberFormatter.format(invoice.taxRate)}%</TableCell>
                              <TableCell className="text-right">{currencyFormatter.format(invoice.taxAmount)}</TableCell>
                              <TableCell className="text-right font-semibold">
                                {currencyFormatter.format(invoice.total)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="p-6 text-sm text-muted-foreground">
                      No taxable invoices were found for the selected period.
                    </div>
                  )}

                  {salesTotals && (
                    <div className="border-t bg-muted/40 p-4">
                      <div className="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:justify-between">
                        <div className="font-medium">Footer totals</div>
                        <div className="flex flex-wrap items-center gap-6">
                          <span className="text-muted-foreground">
                            Total Sales:{' '}
                            <strong className="text-foreground">
                              {currencyFormatter.format(salesTotals.taxableSales)}
                            </strong>
                          </span>
                          <span className="text-muted-foreground">
                            Total Tax Collected:{' '}
                            <strong className="text-foreground">
                              {currencyFormatter.format(salesTotals.taxCollected)}
                            </strong>
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Jurisdiction breakdown</CardTitle>
                  <CardDescription>Sales and tax collected by state jurisdiction.</CardDescription>
                </CardHeader>
                <CardContent>
                  {salesTaxQuery.isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-14" />
                      <Skeleton className="h-14" />
                      <Skeleton className="h-14" />
                    </div>
                  ) : jurisdictionBreakdown.length > 0 ? (
                    <ul className="space-y-4">
                      {jurisdictionBreakdown.map((item) => (
                        <li key={item.jurisdiction} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-semibold text-foreground">{item.jurisdiction}</p>
                            <p className="text-xs text-muted-foreground">{numberFormatter.format(item.taxRate)}% rate</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-foreground">
                              {currencyFormatter.format(item.taxCollected)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Sales {currencyFormatter.format(item.taxableSales)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      No jurisdiction data available for this selection.
                    </p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="941" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quarterly payroll tax</CardTitle>
                <CardDescription>Select a quarter and year to preview the pre-filled Form 941 totals.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="flex flex-1 flex-col gap-4 sm:flex-row">
                    <Select value={payrollQuarter} onValueChange={(value) => setPayrollQuarter(value as PayrollQuarter)}>
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Quarter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Q1">Q1</SelectItem>
                        <SelectItem value="Q2">Q2</SelectItem>
                        <SelectItem value="Q3">Q3</SelectItem>
                        <SelectItem value="Q4">Q4</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={payrollYear.toString()}
                      onValueChange={(value) => setPayrollYear(Number(value))}
                    >
                      <SelectTrigger className="w-[160px]">
                        <SelectValue placeholder="Year" />
                      </SelectTrigger>
                      <SelectContent>
                        {payrollYears.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={payrollQuery.isLoading}
                      onClick={() =>
                        handleDownload(
                          exportPayroll941Report({ quarter: payrollQuarter, year: payrollYear }),
                          'Generated pre-filled 941 PDF',
                        )
                      }
                    >
                      <FileText className="h-4 w-4" />
                      Export PDF
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={markFiledMutation.isPending}
                      onClick={handlePayrollMarkFiled}
                    >
                      <Send className="h-4 w-4" />
                      Mark as Filed
                    </Button>
                  </div>
                </div>

                {payrollQuery.data?.filedAt && (
                  <p className="text-sm text-muted-foreground">
                    Filed on {format(new Date(payrollQuery.data.filedAt), 'MMM d, yyyy')}.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Computed Form 941 lines</CardTitle>
                <CardDescription>Review headcount, taxable wages, and federal withholdings before submission.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {payrollQuery.isLoading ? (
                  <div className="space-y-3">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-48" />
                  </div>
                ) : payrollQuery.data ? (
                  <>
                    <div className="grid gap-4 md:grid-cols-4">
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Taxable wages</p>
                        <p className="text-lg font-semibold">
                          {currencyFormatter.format(payrollQuery.data.totals.taxableWages)}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total liability</p>
                        <p className="text-lg font-semibold">
                          {currencyFormatter.format(payrollQuery.data.totals.totalLiability)}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Total deposits</p>
                        <p className="text-lg font-semibold">
                          {currencyFormatter.format(payrollQuery.data.totals.totalDeposits)}
                        </p>
                      </div>
                      <div className="rounded-lg border bg-muted/30 p-4">
                        <p className="text-xs uppercase text-muted-foreground">Balance due / (Credit)</p>
                        <p className="text-lg font-semibold">
                          {currencyFormatter.format(payrollQuery.data.totals.balanceDue)}
                        </p>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[220px]">Line</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payrollQuery.data.lines.map((line) => (
                            <TableRow key={line.key}>
                              <TableCell className="font-medium">{line.label}</TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {line.description ?? '—'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {renderPayrollAmount(line)}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    No payroll tax information available for the selected quarter.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="1099" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Contractor compliance</CardTitle>
                <CardDescription>Select a filing year and generate contractor 1099 statements in bulk or individually.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <Select
                    value={contractorYear.toString()}
                    onValueChange={(value) => setContractorYear(Number(value))}
                  >
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={contractorsQuery.isLoading}
                      onClick={() =>
                        handleDownload(
                          exportContractor1099Report({
                            year: contractorYear,
                            format: 'zip',
                          }),
                          'Generated 1099 package',
                        )
                      }
                    >
                      <FileArchive className="h-4 w-4" />
                      Generate All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={contractorsQuery.isLoading}
                      onClick={() =>
                        handleDownload(
                          exportContractor1099Report({ year: contractorYear, format: 'csv' }),
                          'Exported contractor CSV',
                        )
                      }
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export CSV
                    </Button>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="outline" size="sm" disabled className="gap-2">
                          <Send className="h-4 w-4" />
                          E-file (Soon)
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>IRS e-file integration is under development.</TooltipContent>
                    </Tooltip>
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={markFiledMutation.isPending}
                      onClick={handleContractorMarkFiled}
                    >
                      <Send className="h-4 w-4" />
                      Mark as Filed
                    </Button>
                  </div>
                </div>

                {contractorsQuery.data?.filedAt && (
                  <p className="text-sm text-muted-foreground">
                    Filed on {format(new Date(contractorsQuery.data.filedAt), 'MMM d, yyyy')}.
                  </p>
                )}
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle>Contractor roster</CardTitle>
                <CardDescription>Verify tax IDs, total compensation, and generate individual forms.</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {contractorsQuery.isLoading ? (
                  <div className="space-y-3 p-6">
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                    <Skeleton className="h-10" />
                  </div>
                ) : contractorsQuery.data && contractorsQuery.data.contractors.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead className="w-[160px]">SSN / EIN</TableHead>
                          <TableHead className="w-[220px]">Address</TableHead>
                          <TableHead className="text-right">Total Paid</TableHead>
                          <TableHead className="w-[160px] text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {contractorsQuery.data.contractors.map((contractor) => (
                          <TableRow key={contractor.id}>
                            <TableCell className="font-medium">{contractor.name}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{contractor.taxId}</TableCell>
                            <TableCell className="max-w-[220px] truncate text-sm text-muted-foreground">
                              {contractor.address}
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              {currencyFormatter.format(contractor.totalPaid)}
                            </TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="gap-2"
                                onClick={() =>
                                  handleDownload(
                                    exportContractor1099Report({
                                      year: contractorYear,
                                      format: 'pdf',
                                      contractorId: contractor.id,
                                    }),
                                    `Generated 1099 for ${contractor.name}`,
                                  )
                                }
                              >
                                <FileText className="h-4 w-4" />
                                Generate 1099
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="p-6 text-sm text-muted-foreground">
                    No contractors with reportable payments for {contractorYear}.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="year-end" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Year-end CPA package</CardTitle>
                <CardDescription>
                  Consolidated financial schedules, depreciation, and key deductions ready for your tax advisor.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <Select value={yearEndYear.toString()} onValueChange={(value) => setYearEndYear(Number(value))}>
                    <SelectTrigger className="w-[160px]">
                      <SelectValue placeholder="Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {payrollYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      disabled={yearEndQuery.isLoading}
                      onClick={() => handleDownload(exportYearEndPack(yearEndYear), 'Downloaded year-end package')}
                    >
                      <FileArchive className="h-4 w-4" />
                      Export full package
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2"
                      disabled={markFiledMutation.isPending}
                      onClick={handleYearEndMarkFiled}
                    >
                      <Send className="h-4 w-4" />
                      Mark as Filed
                    </Button>
                  </div>
                </div>

                {yearEndQuery.data?.filedAt && (
                  <p className="text-sm text-muted-foreground">
                    Filed on {format(new Date(yearEndQuery.data.filedAt), 'MMM d, yyyy')}.
                  </p>
                )}
              </CardContent>
            </Card>

            <div className="grid gap-6 xl:grid-cols-[2fr,1fr]">
              <Card>
                <CardHeader>
                  <CardTitle>Revenue &amp; expenses</CardTitle>
                  <CardDescription>Category-level view for the CPA working papers.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Revenue</h4>
                    <ul className="mt-3 space-y-3">
                      {yearEndQuery.isLoading ? (
                        <>
                          <Skeleton className="h-6" />
                          <Skeleton className="h-6" />
                          <Skeleton className="h-6" />
                        </>
                      ) : yearEndQuery.data?.revenueByCategory.length ? (
                        yearEndQuery.data.revenueByCategory.map((line) => (
                          <li key={line.label} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{line.label}</span>
                            <span className="font-medium text-foreground">
                              {currencyFormatter.format(line.amount)}
                            </span>
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No revenue categories provided.</p>
                      )}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-muted-foreground">Expenses</h4>
                    <ul className="mt-3 space-y-3">
                      {yearEndQuery.isLoading ? (
                        <>
                          <Skeleton className="h-6" />
                          <Skeleton className="h-6" />
                          <Skeleton className="h-6" />
                        </>
                      ) : yearEndQuery.data?.expenseByCategory.length ? (
                        yearEndQuery.data.expenseByCategory.map((line) => (
                          <li key={line.label} className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">{line.label}</span>
                            <span className="font-medium text-foreground">
                              {currencyFormatter.format(line.amount)}
                            </span>
                          </li>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No expense categories provided.</p>
                      )}
                    </ul>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Estimated tax liability</CardTitle>
                  <CardDescription>Snapshot of the expected year-end remittance.</CardDescription>
                </CardHeader>
                <CardContent>
                  {yearEndQuery.isLoading ? (
                    <Skeleton className="h-12" />
                  ) : yearEndQuery.data ? (
                    <div className="rounded-lg border bg-muted/30 p-6 text-center">
                      <p className="text-xs uppercase text-muted-foreground">Estimated liability</p>
                      <p className="mt-2 text-2xl font-semibold">
                        {currencyFormatter.format(yearEndQuery.data.estimatedTaxLiability)}
                      </p>
                      {yearEndQuery.data.generatedAt && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          Generated {format(new Date(yearEndQuery.data.generatedAt), 'MMM d, yyyy h:mma')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No liability estimate available.</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Depreciation schedule</CardTitle>
                  <CardDescription>Book value and current year depreciation by asset.</CardDescription>
                </CardHeader>
                <CardContent>
                  {yearEndQuery.isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-10" />
                      <Skeleton className="h-10" />
                    </div>
                  ) : yearEndQuery.data?.depreciationSchedule.length ? (
                    <ul className="space-y-3 text-sm">
                      {yearEndQuery.data.depreciationSchedule.map((row) => (
                        <li key={`${row.label}-${row.date ?? ''}`} className="flex items-start justify-between gap-4">
                          <div>
                            <p className="font-medium text-foreground">{row.label}</p>
                            {row.notes && <p className="text-xs text-muted-foreground">{row.notes}</p>}
                            {row.date && (
                              <p className="text-xs text-muted-foreground">Placed in service {format(new Date(row.date), 'MMM d, yyyy')}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-foreground">
                              {currencyFormatter.format(row.amount)}
                            </p>
                            {row.priorYearAmount != null && (
                              <p className="text-xs text-muted-foreground">
                                Prior year {currencyFormatter.format(row.priorYearAmount)}
                              </p>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No depreciation schedule uploaded.</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Asset purchases &amp; financing</CardTitle>
                  <CardDescription>Capital additions, debt principal changes, and owner draws.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <section>
                    <h4 className="text-xs uppercase text-muted-foreground">Asset purchases</h4>
                    {yearEndQuery.isLoading ? (
                      <Skeleton className="mt-3 h-10" />
                    ) : yearEndQuery.data?.assetPurchases.length ? (
                      <ul className="mt-3 space-y-2 text-sm">
                        {yearEndQuery.data.assetPurchases.map((row) => (
                          <li key={`${row.label}-${row.date ?? ''}`} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-medium text-foreground">
                              {currencyFormatter.format(row.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">No new assets recorded.</p>
                    )}
                  </section>

                  <section>
                    <h4 className="text-xs uppercase text-muted-foreground">Debt principal</h4>
                    {yearEndQuery.isLoading ? (
                      <Skeleton className="mt-3 h-10" />
                    ) : yearEndQuery.data?.debtPrincipal.length ? (
                      <ul className="mt-3 space-y-2 text-sm">
                        {yearEndQuery.data.debtPrincipal.map((row) => (
                          <li key={`${row.label}-${row.amount}`} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{row.label}</span>
                            <span className="font-medium text-foreground">
                              {currencyFormatter.format(row.amount)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">No principal movements documented.</p>
                    )}
                  </section>

                  <section>
                    <h4 className="text-xs uppercase text-muted-foreground">Owner draws &amp; deductions</h4>
                    {yearEndQuery.isLoading ? (
                      <Skeleton className="mt-3 h-10" />
                    ) : yearEndQuery.data ? (
                      <div className="mt-3 space-y-4">
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Owner draws</p>
                          {yearEndQuery.data.ownerDraws.length ? (
                            <ul className="mt-2 space-y-2 text-sm">
                              {yearEndQuery.data.ownerDraws.map((row) => (
                                <li key={`${row.label}-${row.amount}`} className="flex items-center justify-between">
                                  <span className="text-muted-foreground">{row.label}</span>
                                  <span className="font-medium text-foreground">
                                    {currencyFormatter.format(row.amount)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm text-muted-foreground">No owner draws recorded.</p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-muted-foreground">Key deductions</p>
                          {yearEndQuery.data.keyDeductions.length ? (
                            <ul className="mt-2 space-y-2 text-sm">
                              {yearEndQuery.data.keyDeductions.map((row) => (
                                <li key={`${row.label}-${row.amount}`} className="flex items-center justify-between">
                                  <span className="text-muted-foreground">{row.label}</span>
                                  <span className="font-medium text-foreground">
                                    {currencyFormatter.format(row.amount)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="mt-2 text-sm text-muted-foreground">No special deductions flagged.</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-muted-foreground">No owner or deduction data available.</p>
                    )}
                  </section>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </TooltipProvider>
    </AccountingLayout>
  );
}
