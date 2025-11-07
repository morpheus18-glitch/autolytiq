import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import {
  differenceInCalendarDays,
  endOfDay,
  endOfMonth,
  endOfQuarter,
  endOfWeek,
  endOfYear,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfQuarter,
  startOfWeek,
  startOfYear,
} from 'date-fns';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Label,
  LabelList,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  Calendar as CalendarIcon,
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  FileText,
  BarChart3,
  Layers3,
  Wallet,
  FolderTree,
  Calculator,
  ReceiptText,
  Download,
  Archive,
  Mail,
  CalendarClock,
  ExternalLink,
  Loader2,
} from 'lucide-react';

import AccountingLayout from './AccountingLayout';
import {
  emailDashboardReport,
  emailAllReportsRequest,
  exportAllReportsRequest,
  exportDashboardRequest,
  fetchAccountingDashboard,
  fetchAccountingHomeOverview,
  scheduleDashboardReport,
  type AccountingDashboardResponse,
  type AccountingHomeOverview,
  type AccountingUpcomingStatus,
} from '@/lib/accountingApi';
import { Button } from '@repo/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { Alert } from '@repo/ui';
import { Switch } from '@repo/ui';
// TODO: Migrate to Radix Popover when available in @repo/ui
import { Popover, PopoverContent, PopoverTrigger } from '@repo/ui';
import { Calendar } from '@repo/ui';
import { cn } from '@repo/ui';
import { parseEmailAddresses } from '@/lib/email';
import { Textarea } from '@repo/ui';
// TODO: Migrate to Radix Select when available in @repo/ui
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@repo/ui';
import { Label as FormLabel } from '@repo/ui';
import { Input } from '@repo/ui';
import { Checkbox } from '@repo/ui';
import {
  Modal as Dialog,
  Modal as DialogContent,
} from '@repo/ui';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';

const currencyFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

const currencyFormatterWithCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat('en-US', {
  style: 'percent',
  minimumFractionDigits: 0,
  maximumFractionDigits: 1,
});

const upcomingStatusLabels: Record<AccountingUpcomingStatus, string> = {
  ON_TRACK: 'On track',
  AT_RISK: 'At risk',
  PLANNING: 'Planning',
};

const upcomingStatusClasses: Record<AccountingUpcomingStatus, string> = {
  ON_TRACK: 'text-emerald-600',
  AT_RISK: 'text-destructive',
  PLANNING: 'text-amber-600',
};

type DatePreset =
  | 'today'
  | 'thisWeek'
  | 'thisMonth'
  | 'thisQuarter'
  | 'thisYear'
  | 'ytd'
  | 'custom';

const presetOptions: Array<{ label: string; value: DatePreset }> = [
  { label: 'Today', value: 'today' },
  { label: 'This Week', value: 'thisWeek' },
  { label: 'This Month', value: 'thisMonth' },
  { label: 'This Quarter', value: 'thisQuarter' },
  { label: 'This Year', value: 'thisYear' },
  { label: 'Year to Date', value: 'ytd' },
  { label: 'Custom', value: 'custom' },
];

interface RangeState {
  preset: DatePreset;
  startDate: Date;
  endDate: Date;
  customRange?: DateRange;
}

function getPresetRange(preset: DatePreset, now: Date): { start: Date; end: Date } {
  switch (preset) {
    case 'today':
      return { start: startOfDay(now), end: endOfDay(now) };
    case 'thisWeek': {
      const start = startOfWeek(now, { weekStartsOn: 0 });
      return { start, end: endOfWeek(now, { weekStartsOn: 0 }) };
    }
    case 'thisQuarter':
      return { start: startOfQuarter(now), end: endOfQuarter(now) };
    case 'thisYear':
      return { start: startOfYear(now), end: endOfYear(now) };
    case 'ytd':
      return { start: startOfYear(now), end: endOfDay(now) };
    case 'thisMonth':
    default:
      return { start: startOfMonth(now), end: endOfMonth(now) };
  }
}

function buildTrendSeries(metric: { trend?: number[]; current: number; previous: number }) {
  if (metric.trend && metric.trend.length > 0) {
    return metric.trend.map((value, index) => ({ index, value }));
  }
  const points = 7;
  const startValue = Number.isFinite(metric.previous) ? metric.previous : metric.current;
  const delta = (metric.current - startValue) / Math.max(points - 1, 1);
  return Array.from({ length: points }, (_, idx) => ({ index: idx, value: startValue + delta * idx }));
}

function formatChange(change: number | undefined) {
  if (change == null || Number.isNaN(change)) {
    return '0.0%';
  }
  const value = Math.abs(change);
  return `${value.toFixed(2)}%`;
}

function formatRangeDisplay(startDate: Date, endDate: Date) {
  if (!startDate || !endDate) return '';
  const sameMonth = startDate.getMonth() === endDate.getMonth() && startDate.getFullYear() === endDate.getFullYear();
  if (sameMonth) {
    return `${format(startDate, 'MMM d')} – ${format(endDate, 'd, yyyy')}`;
  }
  return `${format(startDate, 'MMM d, yyyy')} – ${format(endDate, 'MMM d, yyyy')}`;
}

function formatRevenueXAxis(value: string) {
  if (!value) return value;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return format(parseISO(value), 'MMM d');
  }
  if (/^\d{4}-\d{2}$/.test(value)) {
    return format(parseISO(`${value}-01`), 'MMM yyyy');
  }
  return value;
}

function getChangeColor(change: number | undefined) {
  if (change == null || Number.isNaN(change) || change === 0) {
    return 'text-muted-foreground';
  }
  return change > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400';
}

function getTrendColor(key: 'revenue' | 'grossProfit' | 'netIncome' | 'operatingExpenses') {
  switch (key) {
    case 'grossProfit':
      return '#16a34a';
    case 'netIncome':
      return '#0ea5e9';
    case 'operatingExpenses':
      return '#f97316';
    case 'revenue':
    default:
      return '#2563eb';
  }
}

const pieColors = ['#2563eb', '#0ea5e9', '#22c55e', '#a855f7', '#f97316'];

const departmentColors = {
  cost: '#f97316',
  revenue: '#2563eb',
};

const weeklyDays = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' },
];

function Sparkline({
  data,
  stroke,
}: {
  data: Array<{ index: number; value: number }>;
  stroke: string;
}) {
  const gradientId = `sparkline-${stroke.replace(/[^a-zA-Z0-9]/g, '')}`;
  return (
    <ResponsiveContainer width="100%" height={56}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.3} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area type="monotone" dataKey="value" stroke={stroke} strokeWidth={2} fill={`url(#${gradientId})`} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

interface KpiCardProps {
  title: string;
  metric: AccountingDashboardResponse['kpis'][keyof AccountingDashboardResponse['kpis']];
  subtitle?: string;
  trendKey: 'revenue' | 'grossProfit' | 'netIncome' | 'operatingExpenses';
}

function KpiCard({ title, metric, subtitle, trendKey }: KpiCardProps) {
  const color = getTrendColor(trendKey);
  const changeColor = getChangeColor(metric?.change);
  const TrendIcon = metric?.change == null || metric.change === 0 ? Minus : metric.change > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="mt-2 text-3xl font-semibold" style={{ fontVariantNumeric: 'tabular-nums' }}>
              {currencyFormatter.format(metric?.current ?? 0)}
            </div>
            {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="flex flex-col items-end gap-3">
            <div className={cn('flex items-center text-sm font-medium', changeColor)}>
              <TrendIcon className="mr-1 h-4 w-4" />
              {formatChange(metric?.change)} vs prev
            </div>
            <div className="h-14 w-28">
              <Sparkline data={buildTrendSeries(metric)} stroke={color} />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AccountingDashboard() {
  const now = useMemo(() => new Date(), []);
  const initialRange = useMemo(() => getPresetRange('thisMonth', now), [now]);
  const [range, setRange] = useState<RangeState>({
    preset: 'thisMonth',
    startDate: initialRange.start,
    endDate: initialRange.end,
    customRange: undefined,
  });
  const [compareToPrevious, setCompareToPrevious] = useState(false);
  const [customPickerOpen, setCustomPickerOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [scheduleDialogOpen, setScheduleDialogOpen] = useState(false);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [emailCc, setEmailCc] = useState('');
  const [emailSubject, setEmailSubject] = useState('Accounting Dashboard Report');
  const [emailMessage, setEmailMessage] = useState('Please find the attached accounting dashboard report.');
  const [emailFormats, setEmailFormats] = useState<Set<'pdf' | 'excel'>>(new Set(['pdf']));
  const [activeDashboardExport, setActiveDashboardExport] = useState<'pdf' | 'excel' | null>(null);
  const [allReportsDialogOpen, setAllReportsDialogOpen] = useState(false);
  const [allReportsFormats, setAllReportsFormats] = useState<Set<'pdf' | 'excel'>>(new Set(['pdf', 'excel']));
  const [allReportsRecipients, setAllReportsRecipients] = useState('');
  const [allReportsCc, setAllReportsCc] = useState('');
  const [allReportsSubject, setAllReportsSubject] = useState('Financial Reports Package');
  const [allReportsMessage, setAllReportsMessage] = useState(
    'Please find the attached consolidated financial reports package.',
  );
  const [isEmailingAllReports, setIsEmailingAllReports] = useState(false);
  const [isDownloadingAllReports, setIsDownloadingAllReports] = useState(false);
  const [scheduleRecipients, setScheduleRecipients] = useState('');
  const [scheduleFormats, setScheduleFormats] = useState<Array<'pdf' | 'excel'>>(['pdf']);
  const [scheduleFrequency, setScheduleFrequency] = useState<'daily' | 'weekly' | 'monthly'>('weekly');
  const [scheduleDay, setScheduleDay] = useState('monday');
  const [scheduleTime, setScheduleTime] = useState('08:00');
  const { toast } = useToast();
  const [selectedTransaction, setSelectedTransaction] = useState<
    AccountingDashboardResponse['recentTransactions'][number] | null
  >(null);

  const isoStart = useMemo(() => range.startDate.toISOString(), [range.startDate]);
  const isoEnd = useMemo(() => range.endDate.toISOString(), [range.endDate]);

  const { data: homeOverview } = useQuery<AccountingHomeOverview>({
    queryKey: ['accounting', 'home-overview'],
    queryFn: fetchAccountingHomeOverview,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['accounting', 'dashboard', isoStart, isoEnd, compareToPrevious],
    queryFn: () =>
      fetchAccountingDashboard({
        startDate: isoStart,
        endDate: isoEnd,
        compareToLast: compareToPrevious,
      }),
  });

  const emailReportMutation = useMutation({
    mutationFn: emailDashboardReport,
    onSuccess: () => {
      toast({ title: 'Report emailed', description: 'Dashboard report has been sent to the selected recipients.' });
      setEmailDialogOpen(false);
      setEmailRecipients('');
      setEmailCc('');
      setEmailFormats(new Set(['pdf']));
    },
    onError: (mutationError: unknown) => {
      toast({
        title: 'Unable to email report',
        description: mutationError instanceof Error ? mutationError.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const scheduleReportMutation = useMutation({
    mutationFn: scheduleDashboardReport,
    onSuccess: () => {
      toast({ title: 'Schedule saved', description: 'Dashboard report schedule has been updated.' });
      setScheduleDialogOpen(false);
      setScheduleRecipients('');
    },
    onError: (mutationError: unknown) => {
      toast({
        title: 'Unable to schedule report',
        description: mutationError instanceof Error ? mutationError.message : 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const handlePresetChange = useCallback(
    (value: DatePreset) => {
      if (value === 'custom') {
        setRange((current) => ({ ...current, preset: 'custom' }));
        setCustomPickerOpen(true);
        return;
      }
      const { start, end } = getPresetRange(value, new Date());
      setRange({ preset: value, startDate: start, endDate: end, customRange: undefined });
    },
    [],
  );

  const handleCustomRangeSelect = useCallback(
    (selected: DateRange | undefined) => {
      if (!selected?.from) {
        setRange((current) => ({ ...current, customRange: selected }));
        return;
      }
      if (!selected.to) {
        setRange((current) => ({ ...current, customRange: selected }));
        return;
      }
      setRange({ preset: 'custom', startDate: startOfDay(selected.from), endDate: endOfDay(selected.to), customRange: selected });
      setCustomPickerOpen(false);
    },
    [],
  );

  const dayDiff = differenceInCalendarDays(range.endDate, range.startDate);

  const revenueTimeGranularity = useMemo(() => {
    if (dayDiff <= 31) return 'Daily';
    if (dayDiff <= 180) return 'Weekly';
    return 'Monthly';
  }, [dayDiff]);

  const profitBreakdownTotal = data?.profitBreakdown.reduce((total, entry) => total + entry.value, 0) ?? 0;
  const rangeDisplay = useMemo(
    () => formatRangeDisplay(range.startDate, range.endDate),
    [range.endDate, range.startDate],
  );

  const handleDashboardExport = useCallback(
    async (format: 'pdf' | 'excel') => {
      if (activeDashboardExport) {
        return;
      }
      setActiveDashboardExport(format);
      try {
        const result = await exportDashboardRequest(format, { startDate: isoStart, endDate: isoEnd });
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
          description: error instanceof Error ? error.message : 'Unable to export dashboard.',
          variant: 'destructive',
        });
      } finally {
        setActiveDashboardExport(null);
      }
    },
    [activeDashboardExport, isoEnd, isoStart, toast],
  );

  const handleExportPdf = useCallback(() => {
    void handleDashboardExport('pdf');
  }, [handleDashboardExport]);

  const handleExportExcel = useCallback(() => {
    void handleDashboardExport('excel');
  }, [handleDashboardExport]);

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

  const toggleAllReportsFormat = useCallback((format: 'pdf' | 'excel') => {
    setAllReportsFormats((previous) => {
      const next = new Set(previous);
      if (next.has(format)) {
        next.delete(format);
      } else {
        next.add(format);
      }
      return next;
    });
  }, []);

  const openEmailDialog = useCallback(() => {
    setEmailSubject(`Accounting Dashboard – ${rangeDisplay}`);
    setEmailMessage(`Please find the accounting dashboard for ${rangeDisplay}.`);
    setEmailCc('');
    setEmailFormats(new Set(['pdf']));
    setEmailDialogOpen(true);
  }, [rangeDisplay]);

  const openAllReportsDialog = useCallback(() => {
    setAllReportsSubject(`Financial Reports Package – ${rangeDisplay}`);
    setAllReportsMessage(`Please find the consolidated financial reports covering ${rangeDisplay}.`);
    setAllReportsFormats(new Set(['pdf', 'excel']));
    setAllReportsRecipients('');
    setAllReportsCc('');
    setAllReportsDialogOpen(true);
  }, [rangeDisplay]);

  const handleDownloadAllReports = useCallback(async () => {
    if (allReportsFormats.size === 0) {
      toast({ title: 'Select formats', description: 'Choose at least one attachment type.', variant: 'destructive' });
      return;
    }
    setIsDownloadingAllReports(true);
    try {
      const result = await exportAllReportsRequest({
        formats: Array.from(allReportsFormats),
        startDate: isoStart,
        endDate: isoEnd,
      });
      const url = URL.createObjectURL(result.blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = result.filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast({ title: 'Download ready', description: `Downloaded ${result.filename}` });
    } catch (error) {
      toast({
        title: 'Export failed',
        description: error instanceof Error ? error.message : 'Unable to export reports.',
        variant: 'destructive',
      });
    } finally {
      setIsDownloadingAllReports(false);
    }
  }, [allReportsFormats, isoEnd, isoStart, toast]);

  const handleEmailAllReports = useCallback(async () => {
    const recipients = parseEmailAddresses(allReportsRecipients);
    if (recipients.length === 0) {
      toast({ title: 'Add recipients', description: 'Provide at least one recipient email.', variant: 'destructive' });
      return;
    }
    const cc = parseEmailAddresses(allReportsCc);
    const formats = allReportsFormats.size ? Array.from(allReportsFormats) : ['pdf'];
    const subject = allReportsSubject.trim() || `Financial Reports Package – ${rangeDisplay}`;
    const message = allReportsMessage.trim() || undefined;
    setIsEmailingAllReports(true);
    try {
      await emailAllReportsRequest({
        recipients,
        cc: cc.length ? cc : undefined,
        formats,
        startDate: isoStart,
        endDate: isoEnd,
        subject,
        message,
      });
      toast({ title: 'Reports emailed', description: 'Financial reports package is being delivered.' });
      setAllReportsDialogOpen(false);
      setAllReportsRecipients('');
      setAllReportsCc('');
    } catch (error) {
      toast({
        title: 'Email failed',
        description: error instanceof Error ? error.message : 'Unable to email reports.',
        variant: 'destructive',
      });
    } finally {
      setIsEmailingAllReports(false);
    }
  }, [
    allReportsCc,
    allReportsFormats,
    allReportsMessage,
    allReportsRecipients,
    allReportsSubject,
    isoEnd,
    isoStart,
    rangeDisplay,
    toast,
  ]);


  const handleEmailSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (emailFormats.size === 0) {
        toast({ title: 'Select a format', description: 'Choose at least one export format.', variant: 'destructive' });
        return;
      }
      const recipients = parseEmailAddresses(emailRecipients);
      if (recipients.length === 0) {
        toast({ title: 'Add recipients', description: 'Provide at least one recipient email.', variant: 'destructive' });
        return;
      }
      const cc = parseEmailAddresses(emailCc);
      const formats = Array.from(emailFormats);
      const subject = emailSubject.trim() || `Accounting Dashboard – ${rangeDisplay}`;
      const message = emailMessage.trim() || undefined;
      await emailReportMutation.mutateAsync({
        recipients,
        cc: cc.length ? cc : undefined,
        subject,
        message,
        formats,
        startDate: isoStart,
        endDate: isoEnd,
        compareToLast: compareToPrevious,
      });
    },
    [
      compareToPrevious,
      emailCc,
      emailFormats,
      emailMessage,
      emailRecipients,
      emailReportMutation,
      emailSubject,
      rangeDisplay,
      isoEnd,
      isoStart,
      toast,
    ],
  );

  const handleScheduleSubmit = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (scheduleFormats.length === 0) {
        toast({ title: 'Select a format', description: 'Choose at least one export format.', variant: 'destructive' });
        return;
      }
      const recipients = parseEmailAddresses(scheduleRecipients);
      if (recipients.length === 0) {
        toast({ title: 'Add recipients', description: 'Provide at least one recipient email.', variant: 'destructive' });
        return;
      }
      await scheduleReportMutation.mutateAsync({
        recipients,
        frequency: scheduleFrequency,
        time: scheduleTime,
        dayOfWeek: scheduleFrequency === 'weekly' ? scheduleDay : undefined,
        formats: scheduleFormats,
        startDate: isoStart,
        endDate: isoEnd,
        compareToLast: compareToPrevious,
      });
    },
    [
      compareToPrevious,
      isoEnd,
      isoStart,
      scheduleDay,
      scheduleFormats,
      scheduleFrequency,
      scheduleRecipients,
      scheduleReportMutation,
      scheduleTime,
      toast,
    ],
  );

  const updateFormats = useCallback((formats: Array<'pdf' | 'excel'>, value: 'pdf' | 'excel', checked: boolean) => {
    if (checked) {
      if (formats.includes(value)) return formats;
      return [...formats, value];
    }
    return formats.filter((formatValue) => formatValue !== value);
  }, []);

  const formatHomeDate = useCallback((value: string | null | undefined) => {
    if (!value) {
      return '—';
    }
    try {
      return format(parseISO(value), 'MMM d, yyyy');
    } catch (dateError) {
      console.error('Failed to format accounting home date', dateError);
      return '—';
    }
  }, []);

  const heroTitle = homeOverview?.hero.title ?? 'Accounting Dashboard';
  const heroSubtitle =
    homeOverview?.hero.subtitle ??
    'Explore dealership financial performance, profitability trends, and departmental contributions.';

  if (isLoading) {
    return (
      <AccountingLayout>
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <Skeleton className="h-9 w-64" />
            <div className="flex flex-wrap items-center gap-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-40" />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-40" />
            ))}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
            <Skeleton className="h-96" />
            <Skeleton className="h-96" />
          </div>
          <Skeleton className="h-64" />
        </div>
      </AccountingLayout>
    );
  }

  return (
    <AccountingLayout>
      <div className="space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold">{heroTitle}</h1>
            <p className="text-muted-foreground">{heroSubtitle}</p>
          </div>
          <div className="flex flex-col gap-4 lg:items-end">
            <div className="flex flex-wrap items-center gap-3">
              <Select value={range.preset} onValueChange={(value) => handlePresetChange(value as DatePreset)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  {presetOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Popover open={customPickerOpen} onOpenChange={setCustomPickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn('w-[260px] justify-start text-left font-normal', !range.startDate && 'text-muted-foreground')}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formatRangeDisplay(range.startDate, range.endDate)}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <Calendar
                    mode="range"
                    selected={range.customRange}
                    defaultMonth={range.startDate}
                    numberOfMonths={2}
                    onSelect={handleCustomRangeSelect}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <div className="flex items-center gap-2 rounded-full border px-3 py-1.5">
                <Switch id="compare-period" checked={compareToPrevious} onCheckedChange={setCompareToPrevious} />
                <FormLabel htmlFor="compare-period" className="text-sm font-medium">
                  Compare to previous period
                </FormLabel>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportPdf}
                disabled={Boolean(activeDashboardExport)}
              >
                {activeDashboardExport === 'pdf' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                Export Dashboard (PDF)
              </Button>
              <Button
                variant="outline"
                className="gap-2"
                onClick={handleExportExcel}
                disabled={Boolean(activeDashboardExport)}
              >
                {activeDashboardExport === 'excel' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <BarChart3 className="h-4 w-4" />
                )}
                Export to Excel
              </Button>
              <Button variant="outline" className="gap-2" onClick={openAllReportsDialog}>
                <Archive className="h-4 w-4" />
                Export All Reports
              </Button>
              <Button variant="outline" className="gap-2" onClick={openEmailDialog}>
                <Mail className="h-4 w-4" />
                Email Report
              </Button>
              <Button variant="outline" className="gap-2" onClick={() => setScheduleDialogOpen(true)}>
                <CalendarClock className="h-4 w-4" />
                Schedule Report
              </Button>
            </div>
          </div>
        </div>

        {homeOverview ? (
          <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
            <Card className="border border-dashed border-primary/20 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground">
                  Quick accounting navigation
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Access the ledgers, reports, and payroll workflows you manage most.
                </p>
              </CardHeader>
              <CardContent className="grid gap-3 sm:grid-cols-2">
                {homeOverview.quickLinks.map((link) => (
                  <Link
                    key={link.path}
                    href={link.path}
                    className="group block rounded-lg border border-border/60 bg-background/60 p-4 transition-all hover:border-primary/60 hover:bg-background/80"
                  >
                    <div className="text-sm font-semibold text-foreground group-hover:text-primary">{link.label}</div>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">{link.description}</p>
                  </Link>
                ))}
              </CardContent>
            </Card>
            <Card className="border border-dashed border-primary/20 bg-card/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold text-foreground">Close readiness</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Key tasks, approvals, and deadlines across the accounting team.
                </p>
              </CardHeader>
              <CardContent className="space-y-4 text-sm text-foreground">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Open tasks</span>
                    <span className="font-semibold">{homeOverview.metrics.openTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Pending approvals</span>
                    <span className="font-semibold">{homeOverview.metrics.pendingApprovals}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Unresolved alerts</span>
                    <span
                      className={cn(
                        'font-semibold',
                        homeOverview.metrics.unresolvedAlerts > 0 ? 'text-destructive' : 'text-foreground',
                      )}
                    >
                      {homeOverview.metrics.unresolvedAlerts}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Last close completed</span>
                    <span className="font-semibold">{formatHomeDate(homeOverview.metrics.lastCloseDate)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Next close target</span>
                    <span className="font-semibold">{formatHomeDate(homeOverview.metrics.nextCloseDate)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  {homeOverview.upcoming.length > 0 ? (
                    homeOverview.upcoming.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-lg border border-border/60 bg-background/60 p-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-sm font-medium text-foreground">{item.label}</span>
                          <span className="text-xs text-muted-foreground">{formatHomeDate(item.dueDate)}</span>
                        </div>
                        <span
                          className={cn(
                            'mt-1 inline-flex text-[11px] font-semibold uppercase tracking-wide',
                            upcomingStatusClasses[item.status] ?? 'text-muted-foreground',
                          )}
                        >
                          {upcomingStatusLabels[item.status] ?? item.status}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-muted-foreground">No upcoming deadlines scheduled.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}

        {isError ? (
          <Alert variant="destructive">
            <AlertTitle>Unable to load dashboard</AlertTitle>
            <AlertDescription>{error instanceof Error ? error.message : 'Something went wrong.'}</AlertDescription>
          </Alert>
        ) : null}

        {data ? (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <KpiCard
                title="Total Revenue"
                metric={data.kpis.totalRevenue}
                subtitle={`${revenueTimeGranularity} trend`}
                trendKey="revenue"
              />
              <KpiCard
                title="Gross Profit"
                metric={data.kpis.grossProfit}
                subtitle={data.kpis.grossProfit.margin != null ? `Margin ${percentFormatter.format(data.kpis.grossProfit.margin / 100)}` : undefined}
                trendKey="grossProfit"
              />
              <KpiCard
                title="Net Income"
                metric={data.kpis.netIncome}
                subtitle={data.kpis.netIncome.margin != null ? `Net margin ${percentFormatter.format(data.kpis.netIncome.margin / 100)}` : undefined}
                trendKey="netIncome"
              />
              <KpiCard
                title="Operating Expenses"
                metric={data.kpis.operatingExpenses}
                subtitle={
                  data.kpis.operatingExpenses.percentOfRevenue != null
                    ? `± ${percentFormatter.format(data.kpis.operatingExpenses.percentOfRevenue / 100)} of revenue`
                    : undefined
                }
                trendKey="operatingExpenses"
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle>Revenue Trend</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {revenueTimeGranularity} revenue performance across the selected period.
                    </p>
                  </div>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data.revenueChart} margin={{ top: 16, right: 24, left: -8, bottom: 0 }}>
                      <defs>
                        <linearGradient id="totalRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="date" tickFormatter={formatRevenueXAxis} stroke="var(--muted-foreground)" />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        tickFormatter={(value) => currencyFormatter.format(value)}
                        width={90}
                      />
                      <RechartsTooltip
                        cursor={{ stroke: '#2563eb', strokeDasharray: '4 4' }}
                        formatter={(value: number) => [currencyFormatter.format(value), 'Total Revenue']}
                        labelFormatter={(label) => `Period: ${formatRevenueXAxis(String(label))}`}
                      />
                      <Legend />
                      <Area type="monotone" name="Total Revenue" dataKey="revenue" stroke="#2563eb" fill="url(#totalRevenueGradient)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Profit Breakdown</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Contribution by business segment with share of total profitability.
                  </p>
                </CardHeader>
                <CardContent className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.profitBreakdown}
                        dataKey="value"
                        nameKey="name"
                        innerRadius={70}
                        outerRadius={110}
                        paddingAngle={4}
                      >
                        {data.profitBreakdown.map((entry, index) => (
                          <Cell key={entry.name} fill={pieColors[index % pieColors.length]} />
                        ))}
                        <Label
                          position="center"
                          content={() => (
                            <div className="text-center">
                              <div className="text-xs uppercase tracking-wide text-muted-foreground">Total</div>
                              <div className="text-lg font-semibold">{currencyFormatter.format(profitBreakdownTotal)}</div>
                            </div>
                          )}
                        />
                      </Pie>
                      <RechartsTooltip
                        formatter={(value: number, name: string, props) => [
                          currencyFormatterWithCents.format(value),
                          `${name} (${props.payload?.percentage ?? 0}%)`,
                        ]}
                      />
                      <Legend verticalAlign="bottom" height={36} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Monthly Comparison</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Revenue, operating expenses, and profit across the last six months.
                  </p>
                </CardHeader>
                <CardContent className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.monthlyComparison} barGap={6}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="month" stroke="var(--muted-foreground)" />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        tickFormatter={(value) => currencyFormatter.format(value)}
                        width={90}
                      />
                      <RechartsTooltip formatter={(value: number) => currencyFormatterWithCents.format(value)} />
                      <Legend />
                      <Bar dataKey="revenue" name="Revenue" fill="#2563eb" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="expenses" name="Expenses" fill="#f97316" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="profit" name="Profit" fill="#22c55e" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Department Performance</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Revenue and cost stack with gross margin by department.
                  </p>
                </CardHeader>
                <CardContent className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data.departmentPerformance} barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis dataKey="department" stroke="var(--muted-foreground)" />
                      <YAxis
                        stroke="var(--muted-foreground)"
                        tickFormatter={(value) => currencyFormatter.format(value)}
                        width={90}
                      />
                      <RechartsTooltip
                        formatter={(value: number, name: string) => currencyFormatterWithCents.format(value)}
                        labelFormatter={(label: string, payload) => {
                          const margin = payload?.[0]?.payload?.margin;
                          return `${label} (Gross Margin: ${margin != null ? margin.toFixed(1) : '0'}%)`;
                        }}
                      />
                      <Legend />
                      <Bar dataKey="cost" name="Cost" stackId="a" fill={departmentColors.cost} radius={[6, 6, 0, 0]}>
                        <LabelList dataKey="margin" position="top" formatter={(value: number) => `${value.toFixed(1)}%`} />
                      </Bar>
                      <Bar dataKey="revenue" name="Revenue" stackId="a" fill={departmentColors.revenue} radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Links</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Navigate to accounting workflows and detailed financial statements.
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    {
                      href: '/accounting/pl-statement',
                      label: 'P&L Statement',
                      description: 'View profitability and operating margins',
                      icon: <FileText className="h-5 w-5" />,
                    },
                    {
                      href: '/accounting/balance-sheet',
                      label: 'Balance Sheet',
                      description: 'Assets, liabilities, and equity snapshot',
                      icon: <Layers3 className="h-5 w-5" />,
                    },
                    {
                      href: '/accounting/cash-flow',
                      label: 'Cash Flow Statement',
                      description: 'Operating, investing, and financing flows',
                      icon: <Wallet className="h-5 w-5" />,
                    },
                    {
                      href: '/accounting/journal-entries',
                      label: 'Journal Entries',
                      description: 'Post and review ledger activity',
                      icon: <ReceiptText className="h-5 w-5" />,
                    },
                    {
                      href: '/accounting/gl-accounts',
                      label: 'Chart of Accounts',
                      description: 'Maintain your dealership account structure',
                      icon: <FolderTree className="h-5 w-5" />,
                    },
                    {
                      href: '/accounting/payroll',
                      label: 'Payroll',
                      description: 'Process payroll and commissions',
                      icon: <Calculator className="h-5 w-5" />,
                    },
                    {
                      href: '/accounting/tax-reports',
                      label: 'Tax Reports',
                      description: 'Generate filings and compliance packages',
                      icon: <FileText className="h-5 w-5" />,
                    },
                    {
                      href: '/accounting/reports',
                      label: 'Export All Reports',
                      description: 'Bulk export financial packages',
                      icon: <Download className="h-5 w-5" />,
                    },
                  ].map((item) => (
                    <Link key={item.href} href={item.href} className="group">
                      <Card className="h-full border-muted-foreground/20 transition-colors hover:border-primary">
                        <CardContent className="flex h-full flex-col gap-3 p-5">
                          <div className="flex items-center justify-between">
                            <div className="rounded-full bg-primary/10 p-2 text-primary">{item.icon}</div>
                            <ExternalLink className="h-4 w-4 text-muted-foreground transition-colors group-hover:text-primary" />
                          </div>
                          <div>
                            <h3 className="text-base font-semibold">{item.label}</h3>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle>Recent Transactions</CardTitle>
                  <p className="text-sm text-muted-foreground">Most recent journal entries posted to the general ledger.</p>
                </div>
                <Link href="/accounting/journal-entries" className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  View all
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </CardHeader>
              <CardContent>
                <div className="overflow-hidden rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Entry #</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Account</TableHead>
                        <TableHead className="text-right">Debit</TableHead>
                        <TableHead className="text-right">Credit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {data.recentTransactions.slice(0, 10).map((transaction) => (
                        <TableRow
                          key={transaction.id}
                          className="cursor-pointer"
                          onClick={() => setSelectedTransaction(transaction)}
                        >
                          <TableCell>{format(parseISO(transaction.date), 'MMM d, yyyy')}</TableCell>
                          <TableCell>{transaction.number ?? transaction.id}</TableCell>
                          <TableCell>{transaction.description}</TableCell>
                          <TableCell>{transaction.account}</TableCell>
                          <TableCell className="text-right">
                            {transaction.debit ? currencyFormatterWithCents.format(transaction.debit) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {transaction.credit ? currencyFormatterWithCents.format(transaction.credit) : '—'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </>
        ) : null}
      </div>

      <Dialog open={emailDialogOpen} onOpenChange={setEmailDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Email dashboard report</DialogTitle>
            <DialogDescription>
              Send the current dashboard snapshot directly to your finance stakeholders.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleEmailSubmit}>
            <div className="space-y-2">
              <FormLabel htmlFor="email-to">To</FormLabel>
              <Input
                id="email-to"
                placeholder="finance@example.com, controller@example.com"
                value={emailRecipients}
                onChange={(event) => setEmailRecipients(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate multiple addresses with commas or new lines.</p>
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="email-cc">CC (optional)</FormLabel>
              <Input
                id="email-cc"
                placeholder="cfo@example.com"
                value={emailCc}
                onChange={(event) => setEmailCc(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="email-subject">Subject</FormLabel>
              <Input
                id="email-subject"
                value={emailSubject}
                onChange={(event) => setEmailSubject(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="email-message">Message</FormLabel>
              <Textarea
                id="email-message"
                rows={4}
                value={emailMessage}
                onChange={(event) => setEmailMessage(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Formats</FormLabel>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={emailFormats.has('pdf')} onCheckedChange={() => toggleEmailFormat('pdf')} />
                  PDF
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox checked={emailFormats.has('excel')} onCheckedChange={() => toggleEmailFormat('excel')} />
                  Excel (XLSX)
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                At least one format must be selected. PDF will be attached automatically if none are chosen.
              </p>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEmailDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={emailReportMutation.isPending}>
                {emailReportMutation.isPending ? 'Sending…' : 'Send report'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={allReportsDialogOpen} onOpenChange={setAllReportsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export all financial reports</DialogTitle>
            <DialogDescription>
              Generate a consolidated package of P&amp;L, Balance Sheet, Cash Flow, and dashboard reports for {rangeDisplay}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <FormLabel htmlFor="all-reports-to">Recipients</FormLabel>
              <Input
                id="all-reports-to"
                placeholder="finance@example.com, owner@example.com"
                value={allReportsRecipients}
                onChange={(event) => setAllReportsRecipients(event.target.value)}
              />
              <p className="text-xs text-muted-foreground">Separate multiple addresses with commas or new lines.</p>
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="all-reports-cc">CC (optional)</FormLabel>
              <Input
                id="all-reports-cc"
                placeholder="auditor@example.com"
                value={allReportsCc}
                onChange={(event) => setAllReportsCc(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="all-reports-subject">Subject</FormLabel>
              <Input
                id="all-reports-subject"
                value={allReportsSubject}
                onChange={(event) => setAllReportsSubject(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel htmlFor="all-reports-message">Message</FormLabel>
              <Textarea
                id="all-reports-message"
                rows={4}
                value={allReportsMessage}
                onChange={(event) => setAllReportsMessage(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <FormLabel>Attachments</FormLabel>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={allReportsFormats.has('pdf')}
                    onCheckedChange={() => toggleAllReportsFormat('pdf')}
                  />
                  PDF bundle
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={allReportsFormats.has('excel')}
                    onCheckedChange={() => toggleAllReportsFormat('excel')}
                  />
                  Excel workbooks
                </label>
              </div>
              <p className="text-xs text-muted-foreground">
                Select the formats to include in the download or email package. At least one option must remain selected.
              </p>
            </div>
          </div>
          <DialogFooter className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setAllReportsDialogOpen(false)}
              disabled={isDownloadingAllReports || isEmailingAllReports}
            >
              Close
            </Button>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => void handleDownloadAllReports()}
                disabled={isDownloadingAllReports || isEmailingAllReports}
              >
                {isDownloadingAllReports ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Archive className="mr-2 h-4 w-4" />
                )}
                Download Package
              </Button>
              <Button
                type="button"
                onClick={() => void handleEmailAllReports()}
                disabled={isDownloadingAllReports || isEmailingAllReports}
              >
                {isEmailingAllReports ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Mail className="mr-2 h-4 w-4" />
                )}
                Email Package
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={scheduleDialogOpen} onOpenChange={setScheduleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Schedule recurring report</DialogTitle>
            <DialogDescription>
              Automate dashboard delivery with recurring email schedules.
            </DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleScheduleSubmit}>
            <div className="space-y-2">
              <FormLabel htmlFor="schedule-to">Recipients</FormLabel>
              <Input
                id="schedule-to"
                placeholder="finance@example.com, controller@example.com"
                value={scheduleRecipients}
                onChange={(event) => setScheduleRecipients(event.target.value)}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <FormLabel htmlFor="schedule-frequency">Frequency</FormLabel>
                <Select
                  value={scheduleFrequency}
                  onValueChange={(value) => setScheduleFrequency(value as 'daily' | 'weekly' | 'monthly')}
                >
                  <SelectTrigger id="schedule-frequency">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <FormLabel htmlFor="schedule-time">Delivery time</FormLabel>
                <Input id="schedule-time" type="time" value={scheduleTime} onChange={(event) => setScheduleTime(event.target.value)} />
              </div>
            </div>
            {scheduleFrequency === 'weekly' ? (
              <div className="space-y-2">
                <FormLabel htmlFor="schedule-day">Day of week</FormLabel>
                <Select value={scheduleDay} onValueChange={setScheduleDay}>
                  <SelectTrigger id="schedule-day">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {weeklyDays.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : null}
            <div className="space-y-2">
              <FormLabel>Formats</FormLabel>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={scheduleFormats.includes('pdf')}
                    onCheckedChange={(checked) =>
                      setScheduleFormats((prev) => updateFormats(prev, 'pdf', checked === true))
                    }
                  />
                  PDF
                </label>
                <label className="flex items-center gap-2 text-sm">
                  <Checkbox
                    checked={scheduleFormats.includes('excel')}
                    onCheckedChange={(checked) =>
                      setScheduleFormats((prev) => updateFormats(prev, 'excel', checked === true))
                    }
                  />
                  Excel (XLSX)
                </label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setScheduleDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={scheduleReportMutation.isPending}>
                {scheduleReportMutation.isPending ? 'Scheduling…' : 'Save schedule'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(selectedTransaction)} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Journal Entry Details</DialogTitle>
            <DialogDescription>Detailed posting information for the selected transaction.</DialogDescription>
          </DialogHeader>
          {selectedTransaction ? (
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Entry #</p>
                  <p className="text-sm font-medium">{selectedTransaction.number ?? selectedTransaction.id}</p>
                </div>
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Posting Date</p>
                  <p className="text-sm font-medium">{format(parseISO(selectedTransaction.date), 'PPPP')}</p>
                </div>
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Description</p>
                <p className="text-sm">{selectedTransaction.description}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-xs uppercase text-muted-foreground">Account</p>
                  <p className="text-sm font-medium">{selectedTransaction.account}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Debit</p>
                    <p className="text-sm font-semibold text-emerald-600">
                      {currencyFormatterWithCents.format(selectedTransaction.debit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase text-muted-foreground">Credit</p>
                    <p className="text-sm font-semibold text-rose-600">
                      {currencyFormatterWithCents.format(selectedTransaction.credit)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );
}
