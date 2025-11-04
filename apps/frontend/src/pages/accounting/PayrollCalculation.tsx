import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useLocation } from 'wouter';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, endOfMonth, format, parseISO, setDate, startOfDay, startOfMonth, startOfWeek } from 'date-fns';
import {
  BadgeCheck,
  Calculator,
  CheckCircle2,
  Circle,
  ClipboardList,
  Download,
  Edit3,
  FileText,
  ShieldCheck,
  UserMinus,
  XCircle,
} from 'lucide-react';
import AccountingLayout from './AccountingLayout';
import { StatementHeader } from '@/components/accounting/StatementHeader.tsx';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  finalizePayrollRequest,
  previewPayrollRequest,
  type PayrollPreview,
  type PayrollPreviewLine,
  type PayrollResponse,
} from '@/lib/accountingApi';
import type { SubmitHandler } from 'react-hook-form';

const currency = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });

type PayrollFrequency = 'weekly' | 'bi-weekly' | 'semi-monthly' | 'monthly';

type CalculationFormValues = {
  frequency: PayrollFrequency;
  periodStart: string;
  periodEnd: string;
  includeChargebacks: boolean;
  applyVolumeBonus: boolean;
  managerOverride: boolean;
};

type DeductionBreakdown = {
  fit: number;
  sit: number;
  socialSecurity: number;
  medicare: number;
  health: number;
  retirement: number;
  garnishments: number;
};

type ManualOverride = {
  baseComp?: number;
  commissions?: number;
  bonuses?: number;
  adjustments?: number;
  gross?: number;
  deductions?: number;
  net?: number;
  breakdown?: DeductionBreakdown;
  reason: string;
  updatedBy: string;
  updatedAt: string;
};

type AuditEntry = {
  id: string;
  employeeId: string;
  employeeName: string;
  updatedBy: string;
  timestamp: string;
  reason: string;
  fields: string[];
};

const COMMISSION_TIERS = [
  { threshold: 0, rate: 0.03 },
  { threshold: 1000, rate: 0.04 },
  { threshold: 2000, rate: 0.05 },
];

function computePeriod(date: Date, frequency: PayrollFrequency) {
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

function deriveBreakdown(gross: number, deductionTotal: number, override?: DeductionBreakdown): DeductionBreakdown {
  if (override) {
    return override;
  }
  const socialSecurity = Math.min(gross * 0.062, deductionTotal);
  const medicareCap = Math.max(deductionTotal - socialSecurity, 0);
  const medicare = Math.min(gross * 0.0145, medicareCap);
  const remaining = Math.max(deductionTotal - socialSecurity - medicare, 0);
  const fit = Number((remaining * 0.45).toFixed(2));
  const sit = Number((remaining * 0.2).toFixed(2));
  const voluntary = Math.max(remaining - fit - sit, 0);
  const health = Number((voluntary * 0.55).toFixed(2));
  const retirement = Number((voluntary * 0.3).toFixed(2));
  const garnishments = Number((voluntary - health - retirement).toFixed(2));
  return { fit, sit, socialSecurity, medicare, health, retirement, garnishments };
}

function sumBreakdown(breakdown: DeductionBreakdown) {
  return (
    breakdown.fit +
    breakdown.sit +
    breakdown.socialSecurity +
    breakdown.medicare +
    breakdown.health +
    breakdown.retirement +
    breakdown.garnishments
  );
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

export default function PayrollCalculation() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const queryDefaults = useMemo(() => {
    if (typeof window === 'undefined') {
      return null;
    }
    const params = new URLSearchParams(window.location.search);
    if (!params.has('startDate') || !params.has('endDate')) {
      return null;
    }
    const frequency = (params.get('frequency') as PayrollFrequency | null) ?? 'semi-monthly';
    return {
      frequency,
      periodStart: params.get('startDate')!,
      periodEnd: params.get('endDate')!,
    };
  }, []);

  const form = useForm<CalculationFormValues>({
    defaultValues: {
      frequency: queryDefaults?.frequency ?? 'semi-monthly',
      periodStart: queryDefaults?.periodStart ?? format(computePeriod(new Date(), 'semi-monthly').start, 'yyyy-MM-dd'),
      periodEnd: queryDefaults?.periodEnd ?? format(computePeriod(new Date(), 'semi-monthly').end, 'yyyy-MM-dd'),
      includeChargebacks: true,
      applyVolumeBonus: true,
      managerOverride: true,
    },
  });

  const queryFrequency = form.watch('frequency');
  const queryStart = form.watch('periodStart');
  const queryEnd = form.watch('periodEnd');

  useEffect(() => {
    const { start, end } = computePeriod(parseISO(queryStart), queryFrequency);
    form.setValue('periodStart', format(start, 'yyyy-MM-dd'));
    form.setValue('periodEnd', format(end, 'yyyy-MM-dd'));
  }, [queryFrequency]);

  const [preview, setPreview] = useState<PayrollPreview | null>(null);
  const [overrides, setOverrides] = useState<Record<string, ManualOverride>>({});
  const [excludedEmployees, setExcludedEmployees] = useState<Set<string>>(new Set());
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [manualEdit, setManualEdit] = useState<PayrollPreviewLine | null>(null);
  const [manualEditValues, setManualEditValues] = useState<{
    baseComp: number;
    commissions: number;
    bonuses: number;
    adjustments: number;
    gross: number;
    deductions: number;
    net: number;
    fit: number;
    sit: number;
    socialSecurity: number;
    medicare: number;
    health: number;
    retirement: number;
    garnishments: number;
    reason: string;
  } | null>(null);
  const [payrollStatus, setPayrollStatus] = useState<'Draft' | 'Finalized'>('Draft');
  const [finalizedPayroll, setFinalizedPayroll] = useState<PayrollResponse | null>(null);
  const [workflowStatus, setWorkflowStatus] = useState({
    journalEntry: false,
    paystubs: false,
    nacha: false,
    ytd: false,
    paid: false,
  });

  const previewMutation = useMutation({
    mutationFn: previewPayrollRequest,
    onSuccess: (data: PayrollPreview) => {
      setPreview(data);
      setModalOpen(true);
      setPayrollStatus('Draft');
      setFinalizedPayroll(null);
      setWorkflowStatus({ journalEntry: false, paystubs: false, nacha: false, ytd: false, paid: false });
      toast({
        title: 'Payroll preview ready',
        description: `Net payroll ${currency.format(data.totals.net)} for ${formatPeriod(
          new Date(data.periodStart),
          new Date(data.periodEnd),
        )}.`,
      });
    },
    onError: (error: unknown) => {
      toast({
        title: 'Unable to calculate payroll',
        description:
          error instanceof Error ? error.message : 'Review payroll configuration and retry.',
        variant: 'destructive',
      });
    },
  });

  const finalizeMutation = useMutation({
    mutationFn: finalizePayrollRequest,
    onSuccess: (payload: PayrollResponse) => {
      setPayrollStatus(payload.status === 'FINALIZED' ? 'Finalized' : 'Draft');
      setFinalizedPayroll(payload);
      setWorkflowStatus({ journalEntry: true, paystubs: true, nacha: true, ytd: true, paid: payload.status === 'FINALIZED' });
      queryClient.invalidateQueries({ queryKey: ['accounting', 'payrolls'] });
      toast({
        title: 'Payroll finalized',
        description: `Journal entry ${payload.journalEntryId ?? 'pending'} created for ${formatPeriod(
          new Date(payload.periodStart),
          new Date(payload.periodEnd),
        )}.`,
      });
      navigate('/accounting/payroll');
    },
    onError: (error: unknown) => {
      toast({
        title: 'Finalization failed',
        description: error instanceof Error ? error.message : 'Resolve issues and try again.',
        variant: 'destructive',
      });
    },
  });

  const submitPreview: SubmitHandler<CalculationFormValues> = (values) => {
    const payload = {
      periodStart: new Date(values.periodStart).toISOString(),
      periodEnd: new Date(values.periodEnd).toISOString(),
      commissionTiers: COMMISSION_TIERS,
      deductionRates: {
        federal: 0.18,
        state: 0.04,
      },
      employerTaxRate: 0.0765,
      adjustments: values.includeChargebacks ? {} : undefined,
    };
    previewMutation.mutate(payload);
  };

  const filteredLines = useMemo(() => {
    if (!preview) {
      return [] as PayrollPreviewLine[];
    }
    return preview.lines.filter((line) => !excludedEmployees.has(line.userId));
  }, [preview, excludedEmployees]);

  const displayLines = useMemo(() => {
    return filteredLines.map((line) => {
      const override = overrides[line.userId];
      const baseComp = override?.baseComp ?? line.basePay;
      const commissions = override?.commissions ?? line.commissionTotal;
      const bonuses = override?.bonuses ?? line.commissionBonus;
      const adjustments = override?.adjustments ?? line.adjustments;
      const gross = override?.gross ?? baseComp + commissions + bonuses + adjustments;
      const deductions = override?.deductions ?? line.deductions;
      const net = override?.net ?? gross - deductions;
      const breakdown = deriveBreakdown(gross, deductions, override?.breakdown);
      return {
        line,
        baseComp,
        commissions,
        bonuses,
        adjustments,
        gross,
        deductions,
        net,
        breakdown,
      };
    });
  }, [filteredLines, overrides]);

  const totals = useMemo(() => {
    return displayLines.reduce(
      (acc, item) => {
        acc.baseComp += item.baseComp;
        acc.commissions += item.commissions;
        acc.bonuses += item.bonuses;
        acc.adjustments += item.adjustments;
        acc.gross += item.gross;
        acc.deductions += item.deductions;
        acc.net += item.net;
        return acc;
      },
      {
        baseComp: 0,
        commissions: 0,
        bonuses: 0,
        adjustments: 0,
        gross: 0,
        deductions: 0,
        net: 0,
      },
    );
  }, [displayLines]);

  const periodLabel = formatPeriod(parseISO(queryStart), parseISO(queryEnd));

  const openManualEdit = (line: PayrollPreviewLine) => {
    const override = overrides[line.userId];
    const computed = displayLines.find((entry) => entry.line.userId === line.userId);
    const reference = computed ?? {
      baseComp: line.basePay,
      commissions: line.commissionTotal,
      bonuses: line.commissionBonus,
      adjustments: line.adjustments,
      gross: line.grossPay,
      deductions: line.deductions,
      net: line.netPay,
      breakdown: deriveBreakdown(line.grossPay, line.deductions, override?.breakdown),
    };
    setManualEdit(line);
    setManualEditValues({
      baseComp: reference.baseComp,
      commissions: reference.commissions,
      bonuses: reference.bonuses,
      adjustments: reference.adjustments,
      gross: reference.gross,
      deductions: reference.deductions,
      net: reference.net,
      fit: reference.breakdown.fit,
      sit: reference.breakdown.sit,
      socialSecurity: reference.breakdown.socialSecurity,
      medicare: reference.breakdown.medicare,
      health: reference.breakdown.health,
      retirement: reference.breakdown.retirement,
      garnishments: reference.breakdown.garnishments,
      reason: '',
    });
  };

  const handleManualEditChange = (field: keyof NonNullable<typeof manualEditValues>, value: number | string) => {
    if (!manualEditValues) return;
    setManualEditValues((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [field]: typeof value === 'number' ? value : value };
      if (['baseComp', 'commissions', 'bonuses', 'adjustments', 'gross', 'deductions'].includes(field)) {
        const baseComp = Number(field === 'baseComp' ? value : prev.baseComp);
        const commissions = Number(field === 'commissions' ? value : prev.commissions);
        const bonuses = Number(field === 'bonuses' ? value : prev.bonuses);
        const adjustments = Number(field === 'adjustments' ? value : prev.adjustments);
        const gross = Number(field === 'gross' ? value : baseComp + commissions + bonuses + adjustments);
        const deductions = Number(field === 'deductions' ? value : prev.deductions);
        next.gross = gross;
        next.deductions = deductions;
        next.net = gross - deductions;
      }
      if (
        ['fit', 'sit', 'socialSecurity', 'medicare', 'health', 'retirement', 'garnishments'].includes(field)
      ) {
        const breakdown: DeductionBreakdown = {
          fit: Number(field === 'fit' ? value : prev.fit),
          sit: Number(field === 'sit' ? value : prev.sit),
          socialSecurity: Number(field === 'socialSecurity' ? value : prev.socialSecurity),
          medicare: Number(field === 'medicare' ? value : prev.medicare),
          health: Number(field === 'health' ? value : prev.health),
          retirement: Number(field === 'retirement' ? value : prev.retirement),
          garnishments: Number(field === 'garnishments' ? value : prev.garnishments),
        };
        next.deductions = Number(sumBreakdown(breakdown).toFixed(2));
        next.net = Number((next.gross - next.deductions).toFixed(2));
      }
      return next;
    });
  };

  const submitManualEdit = () => {
    if (!manualEdit || !manualEditValues) {
      return;
    }
    if (!manualEditValues.reason || manualEditValues.reason.trim().length < 5) {
      toast({
        title: 'Reason required',
        description: 'Document a clear business justification for the override.',
        variant: 'destructive',
      });
      return;
    }
    const breakdown: DeductionBreakdown = {
      fit: manualEditValues.fit,
      sit: manualEditValues.sit,
      socialSecurity: manualEditValues.socialSecurity,
      medicare: manualEditValues.medicare,
      health: manualEditValues.health,
      retirement: manualEditValues.retirement,
      garnishments: manualEditValues.garnishments,
    };
    const override: ManualOverride = {
      baseComp: manualEditValues.baseComp,
      commissions: manualEditValues.commissions,
      bonuses: manualEditValues.bonuses,
      adjustments: manualEditValues.adjustments,
      gross: manualEditValues.gross,
      deductions: manualEditValues.deductions,
      net: manualEditValues.net,
      breakdown,
      reason: manualEditValues.reason,
      updatedBy: user?.firstName ? `${user.firstName} ${user.lastName ?? ''}`.trim() : 'System User',
      updatedAt: new Date().toISOString(),
    };
    setOverrides((previous) => ({ ...previous, [manualEdit.userId]: override }));
    setAuditLog((previous) => [
      {
        id: crypto.randomUUID(),
        employeeId: manualEdit.userId,
        employeeName: manualEdit.userName,
        updatedBy: override.updatedBy,
        timestamp: override.updatedAt,
        reason: override.reason,
        fields: ['BASE COMP', 'COMMISSIONS', 'BONUSES', 'DEDUCTIONS', 'NET'],
      },
      ...previous,
    ]);
    setManualEdit(null);
    setManualEditValues(null);
    toast({
      title: 'Manual override saved',
      description: `Updated ${manualEdit.userName} with net pay ${currency.format(override.net ?? manualEdit.netPay)}.`,
    });
  };

  const toggleExclude = (userId: string) => {
    setExcludedEmployees((previous) => {
      const next = new Set(previous);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };

  const finalizePayroll = () => {
    if (!preview) {
      toast({
        title: 'Preview required',
        description: 'Run a payroll preview before finalizing.',
        variant: 'destructive',
      });
      return;
    }
    const payload = {
      periodStart: preview.periodStart,
      periodEnd: preview.periodEnd,
      commissionTiers: COMMISSION_TIERS,
      deductionRates: {
        federal: 0.18,
        state: 0.04,
      },
      employerTaxRate: 0.0765,
      approve: true,
    };
    finalizeMutation.mutate(payload);
  };

  const exportDirectDeposit = () => {
    if (!finalizedPayroll) {
      toast({
        title: 'Finalize payroll first',
        description: 'Generate NACHA files after payroll has been finalized.',
        variant: 'destructive',
      });
      return;
    }
    window.open(`/api/accounting/payroll/${finalizedPayroll.id}/export-dd`, '_blank', 'noopener,noreferrer');
  };

  return (
    <AccountingLayout>
      <StatementHeader
        title="Payroll Calculation"
        description="Configure pay periods, commission programs, and tax deductions before posting payroll to the ledger."
      />

      <form onSubmit={form.handleSubmit(submitPreview)} className="space-y-6">
        <Card>
          <CardHeader className="gap-2 sm:flex sm:items-start sm:justify-between">
            <div>
              <CardTitle>Pay Period Configuration</CardTitle>
              <CardDescription>Align payroll cadence, adjust for chargebacks, and preview gross-to-net impact.</CardDescription>
            </div>
            <Badge variant={payrollStatus === 'Finalized' ? 'default' : 'secondary'}>{payrollStatus}</Badge>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <div className="flex items-center gap-2">
                <select
                  id="frequency"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  {...form.register('frequency')}
                >
                  <option value="weekly">Weekly</option>
                  <option value="bi-weekly">Bi-weekly</option>
                  <option value="semi-monthly">Semi-monthly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodStart">Period start</Label>
              <Input id="periodStart" type="date" {...form.register('periodStart')} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periodEnd">Period end</Label>
              <Input id="periodEnd" type="date" {...form.register('periodEnd')} />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Include chargebacks</p>
                <p className="text-xs text-muted-foreground">Reverse deals canceled within 90 days automatically.</p>
              </div>
              <Switch checked={form.watch('includeChargebacks')} onCheckedChange={(checked) => form.setValue('includeChargebacks', checked)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Apply volume bonuses</p>
                <p className="text-xs text-muted-foreground">$500 for 10–14 units, $1,000 for 15–19, $1,500 for 20+.</p>
              </div>
              <Switch checked={form.watch('applyVolumeBonus')} onCheckedChange={(checked) => form.setValue('applyVolumeBonus', checked)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-4 py-3">
              <div>
                <p className="text-sm font-medium">Manager override</p>
                <p className="text-xs text-muted-foreground">Allocate 1% override to desk and F&I managers.</p>
              </div>
              <Switch checked={form.watch('managerOverride')} onCheckedChange={(checked) => form.setValue('managerOverride', checked)} />
            </div>
          </CardContent>
          <div className="flex flex-col gap-3 border-t bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm text-muted-foreground">{periodLabel}</div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={() => form.reset()}>
                Reset
              </Button>
              <Button type="submit" disabled={previewMutation.isLoading}>
                <Calculator className="mr-2 h-4 w-4" />
                {previewMutation.isLoading ? 'Calculating…' : 'Calculate Payroll'}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.7fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Commission & Incentive Programs</CardTitle>
              <CardDescription>Preview how gross, backend reserve, and spiffs roll into each paycheck.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-md border border-dashed bg-muted/30 p-4">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Front-End Commission Tiers</h4>
                <ul className="mt-2 space-y-1">
                  <li>• 3% on the first $1,000 of front-end gross</li>
                  <li>• 4% on the next $1,000</li>
                  <li>• 5% above $2,000</li>
                </ul>
              </div>
              <div className="rounded-md border border-dashed bg-muted/30 p-4">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Backend (F&amp;I) Reserve</h4>
                <p className="leading-relaxed">
                  Flat 5% of F&amp;I gross on VSC, GAP, maintenance, and reserve products. Manager overrides distribute 1% of team
                  deals to desk and F&amp;I leaders.
                </p>
              </div>
              <div className="rounded-md border border-dashed bg-muted/30 p-4">
                <h4 className="text-xs font-semibold uppercase text-muted-foreground">Spiffs & Bonuses</h4>
                <p className="leading-relaxed">
                  Spiffs can be rule-driven or manually entered per employee. Volume bonuses automatically trigger when unit
                  counts hit published thresholds.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>Manual overrides require a justification and are logged with user, timestamp, and changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-64 pr-2">
                {auditLog.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No manual overrides recorded for this payroll cycle.</p>
                ) : (
                  <div className="space-y-3 text-xs">
                    {auditLog.map((entry) => (
                      <div key={entry.id} className="rounded-md border bg-muted/30 p-3">
                        <div className="flex items-center justify-between text-sm font-medium">
                          <span>{entry.employeeName}</span>
                          <span className="text-xs text-muted-foreground">{format(new Date(entry.timestamp), 'MMM d, yyyy h:mma')}</span>
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-muted-foreground">
                          <Badge variant="outline">{entry.updatedBy}</Badge>
                          {entry.fields.map((field) => (
                            <Badge key={field} variant="secondary">
                              {field}
                            </Badge>
                          ))}
                        </div>
                        <p className="mt-2 text-muted-foreground">Reason: {entry.reason}</p>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Finalization Workflow</CardTitle>
            <CardDescription>Checklist for the five-step closing process once payroll is approved.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {[
                {
                  key: 'journalEntry' as const,
                  label: 'Create Journal Entry',
                  description: 'DR Salary, Commission, Payroll Tax — CR Payroll Payable, Tax Withholding, 401k Payable.',
                },
                {
                  key: 'paystubs' as const,
                  label: 'Generate Pay Stubs',
                  description: 'Produce PDFs with gross-to-net breakdown and distribute to employees.',
                },
                {
                  key: 'nacha' as const,
                  label: 'Export NACHA File',
                  description: 'Send ACH file to the bank for direct deposit funding.',
                },
                {
                  key: 'ytd' as const,
                  label: 'Update YTD Totals',
                  description: 'Refresh gross, deductions, and net balances for compliance reporting.',
                },
                {
                  key: 'paid' as const,
                  label: 'Mark Period as Paid',
                  description: 'Close the payroll cycle after deposits settle and liabilities clear.',
                },
              ].map((step) => {
                const completed = workflowStatus[step.key];
                return (
                  <div key={step.key} className="flex items-start gap-3 rounded-lg border bg-muted/20 p-4">
                    {completed ? (
                      <CheckCircle2 className="mt-1 h-5 w-5 text-emerald-500" />
                    ) : (
                      <Circle className="mt-1 h-5 w-5 text-muted-foreground" />
                    )}
                    <div>
                      <p className="font-medium">{step.label}</p>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="button" onClick={finalizePayroll} disabled={finalizeMutation.isLoading || !preview}>
                <BadgeCheck className="mr-2 h-4 w-4" />
                {finalizeMutation.isLoading ? 'Finalizing…' : 'Finalize Payroll'}
              </Button>
              <Button type="button" variant="outline" onClick={exportDirectDeposit}>
                <Download className="mr-2 h-4 w-4" /> Export NACHA File
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      <Dialog open={modalOpen && Boolean(preview)} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-5xl">
          <DialogHeader>
            <DialogTitle>Payroll Calculation — {periodLabel}</DialogTitle>
            <DialogDescription>
              Status: <Badge variant={payrollStatus === 'Finalized' ? 'default' : 'secondary'}>{payrollStatus}</Badge> · Gross{' '}
              {currency.format(totals.gross)} · Net {currency.format(totals.net)}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-6">
              {displayLines.map((item) => (
                <Card key={item.line.userId}>
                  <CardHeader className="flex flex-col gap-1">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <CardTitle className="text-lg">{item.line.userName}</CardTitle>
                        <CardDescription className="text-xs uppercase tracking-wide text-muted-foreground">
                          Employee ID {item.line.userId}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">Gross {currency.format(item.gross)}</Badge>
                        <Badge variant="outline">Net {currency.format(item.net)}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="rounded-md border bg-muted/20 p-4">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Base Compensation</h4>
                        <p className="mt-2 text-sm">{currency.format(item.baseComp)}</p>
                        <Separator className="my-3" />
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Bonuses &amp; Spiffs</h4>
                        <p className="mt-2 text-sm">{currency.format(item.bonuses)}</p>
                        <Separator className="my-3" />
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Adjustments</h4>
                        <p className="mt-2 text-sm">{currency.format(item.adjustments)}</p>
                      </div>
                      <div className="rounded-md border bg-muted/20 p-4">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Commissions by Deal</h4>
                        <ul className="mt-2 space-y-1 text-sm">
                          {item.line.commissionIds.length === 0 ? (
                            <li className="text-muted-foreground">No commissionable deals in this period.</li>
                          ) : (
                            item.line.commissionIds.map((dealId, index) => (
                              <li key={dealId} className="flex items-center justify-between">
                                <span>Deal #{dealId}</span>
                                <span className="font-medium">
                                  {currency.format(item.commissions / item.line.commissionIds.length)}
                                </span>
                              </li>
                            ))
                          )}
                        </ul>
                        <Separator className="my-3" />
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Backend Reserve</h4>
                        <p className="mt-2 text-sm">{currency.format(item.line.commissionTotal - item.commissions)}</p>
                      </div>
                    </div>

                    <div className="rounded-md border bg-muted/20 p-4">
                      <h4 className="text-xs font-semibold uppercase text-muted-foreground">Deductions</h4>
                      <Table className="mt-2 text-xs">
                        <TableHeader>
                          <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow>
                            <TableCell>Federal Income Tax</TableCell>
                            <TableCell className="text-right">{currency.format(item.breakdown.fit)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>State Income Tax</TableCell>
                            <TableCell className="text-right">{currency.format(item.breakdown.sit)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Social Security (6.2%)</TableCell>
                            <TableCell className="text-right">{currency.format(item.breakdown.socialSecurity)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Medicare (1.45%)</TableCell>
                            <TableCell className="text-right">{currency.format(item.breakdown.medicare)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Health Insurance</TableCell>
                            <TableCell className="text-right">{currency.format(item.breakdown.health)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>401k</TableCell>
                            <TableCell className="text-right">{currency.format(item.breakdown.retirement)}</TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell>Garnishments</TableCell>
                            <TableCell className="text-right">{currency.format(item.breakdown.garnishments)}</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="sm" onClick={() => openManualEdit(item.line)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit Manually
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={!finalizedPayroll}
                        onClick={() => finalizedPayroll && window.open(`/api/accounting/payroll/${finalizedPayroll.id}/${item.line.userId}/paystub`, '_blank', 'noopener,noreferrer')}
                      >
                        <FileText className="mr-2 h-4 w-4" /> View Pay Stub
                      </Button>
                      <Button
                        type="button"
                        variant={excludedEmployees.has(item.line.userId) ? 'secondary' : 'destructive'}
                        size="sm"
                        onClick={() => toggleExclude(item.line.userId)}
                      >
                        {excludedEmployees.has(item.line.userId) ? (
                          <ShieldCheck className="mr-2 h-4 w-4" />
                        ) : (
                          <UserMinus className="mr-2 h-4 w-4" />
                        )}
                        {excludedEmployees.has(item.line.userId) ? 'Include in Payroll' : 'Exclude from Payroll'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {displayLines.length === 0 && (
                <div className="rounded-md border border-dashed bg-muted/20 p-6 text-center text-sm text-muted-foreground">
                  No eligible employees in the current preview. Adjust filters or run the calculation again.
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="flex flex-col items-stretch gap-3 border-t bg-muted/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
              <span className="font-medium">Summary</span>
              <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                <span>Base: {currency.format(totals.baseComp)}</span>
                <span>Commissions: {currency.format(totals.commissions)}</span>
                <span>Bonuses: {currency.format(totals.bonuses)}</span>
                <span>Deductions: {currency.format(totals.deductions)}</span>
                <span>Net: {currency.format(totals.net)}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                <XCircle className="mr-2 h-4 w-4" /> Close
              </Button>
              <Button type="button" onClick={finalizePayroll} disabled={finalizeMutation.isLoading}>
                <ClipboardList className="mr-2 h-4 w-4" />
                {finalizeMutation.isLoading ? 'Posting…' : 'Finalize Payroll'}
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog
        open={Boolean(manualEdit && manualEditValues)}
        onOpenChange={(open) => {
          if (!open) {
            setManualEdit(null);
            setManualEditValues(null);
          }
        }}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Manual Override — {manualEdit?.userName}</DialogTitle>
            <DialogDescription>Override calculated values with a documented justification. All changes are audited.</DialogDescription>
          </DialogHeader>
          {manualEdit && manualEditValues && (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="manual-base">Base Compensation</Label>
                  <Input
                    id="manual-base"
                    type="number"
                    value={manualEditValues.baseComp}
                    onChange={(event) => handleManualEditChange('baseComp', Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-commissions">Commissions</Label>
                  <Input
                    id="manual-commissions"
                    type="number"
                    value={manualEditValues.commissions}
                    onChange={(event) => handleManualEditChange('commissions', Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-bonuses">Bonuses &amp; Spiffs</Label>
                  <Input
                    id="manual-bonuses"
                    type="number"
                    value={manualEditValues.bonuses}
                    onChange={(event) => handleManualEditChange('bonuses', Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-adjustments">Adjustments</Label>
                  <Input
                    id="manual-adjustments"
                    type="number"
                    value={manualEditValues.adjustments}
                    onChange={(event) => handleManualEditChange('adjustments', Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-gross">Gross Pay</Label>
                  <Input
                    id="manual-gross"
                    type="number"
                    value={manualEditValues.gross}
                    onChange={(event) => handleManualEditChange('gross', Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-deductions">Total Deductions</Label>
                  <Input
                    id="manual-deductions"
                    type="number"
                    value={manualEditValues.deductions}
                    onChange={(event) => handleManualEditChange('deductions', Number(event.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-net">Net Pay</Label>
                  <Input id="manual-net" type="number" value={manualEditValues.net} disabled />
                </div>
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                {(
                  [
                    ['fit', 'Federal Income Tax'],
                    ['sit', 'State Income Tax'],
                    ['socialSecurity', 'Social Security'],
                    ['medicare', 'Medicare'],
                    ['health', 'Health Insurance'],
                    ['retirement', '401k'],
                    ['garnishments', 'Garnishments'],
                  ] as const
                ).map(([key, label]) => (
                  <div key={key} className="space-y-2">
                    <Label htmlFor={`manual-${key}`}>{label}</Label>
                    <Input
                      id={`manual-${key}`}
                      type="number"
                      value={manualEditValues[key]}
                      onChange={(event) => handleManualEditChange(key, Number(event.target.value))}
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Label htmlFor="manual-reason">Reason for Override</Label>
                <Textarea
                  id="manual-reason"
                  value={manualEditValues.reason}
                  onChange={(event) => handleManualEditChange('reason', event.target.value)}
                  placeholder="Document why this payroll line is being adjusted and reference supporting documentation."
                />
              </div>
            </div>
          )}
          <DialogFooter className="flex flex-col gap-2 border-t bg-muted/20 p-4">
            <div className="flex flex-wrap justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setManualEdit(null);
                  setManualEditValues(null);
                }}
              >
                Cancel
              </Button>
              <Button type="button" onClick={submitManualEdit}>
                Save Override
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AccountingLayout>
  );
}
