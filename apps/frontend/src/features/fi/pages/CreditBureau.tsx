import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import type { DealJacketDto } from '../api';
import { fetchCreditApplication, fetchCreditReport, pullCredit, shareCreditReport } from '../api';
import type { CreditApplicationDto, CreditReportDto } from '../api';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';

const bureauOptions: Array<{ label: string; value: 'experian' | 'transunion' | 'equifax' | 'tri-merge' }> = [
  { label: 'Experian', value: 'experian' },
  { label: 'TransUnion', value: 'transunion' },
  { label: 'Equifax', value: 'equifax' },
  { label: 'Tri-Merge', value: 'tri-merge' },
];

const pullTypeOptions: Array<{ label: string; value: 'soft' | 'hard' }> = [
  { label: 'Soft Pull', value: 'soft' },
  { label: 'Hard Pull', value: 'hard' },
];

export interface CreditBureauProps {
  deal: DealJacketDto;
  active?: boolean;
}

function formatCurrency(value: string) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numeric);
}

function formatPercent(value: string) {
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '—';
  return `${numeric.toFixed(2)}%`;
}

function formatScore(score?: number | null) {
  if (score === null || score === undefined) return '—';
  return score.toString();
}

function formatDate(value: string) {
  try {
    return format(new Date(value), 'MMM d, yyyy p');
  } catch {
    return '—';
  }
}

function ScoreCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-bold">{value}</p>
    </div>
  );
}

function TradeLineTable({ tradeLines }: { tradeLines: CreditReportDto['tradeLines'] }) {
  if (!tradeLines.length) {
    return <p className="text-sm text-muted-foreground">No trade lines returned from bureau.</p>;
  }

  return (
    <div className="overflow-hidden rounded-lg border">
      <table className="min-w-full divide-y divide-border text-sm">
        <thead className="bg-muted/60 text-muted-foreground">
          <tr>
            <th className="px-3 py-2 text-left font-semibold">Creditor</th>
            <th className="px-3 py-2 text-left font-semibold">Type</th>
            <th className="px-3 py-2 text-left font-semibold">Balance</th>
            <th className="px-3 py-2 text-left font-semibold">Status</th>
            <th className="px-3 py-2 text-left font-semibold">Opened</th>
            <th className="px-3 py-2 text-left font-semibold">Updated</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border/70">
          {tradeLines.map((line, index) => (
            <tr key={`${line.creditor ?? 'line'}-${index}`} className="bg-background">
              <td className="px-3 py-2 font-medium">{String(line.creditor ?? '—')}</td>
              <td className="px-3 py-2">{String(line.accountType ?? '—')}</td>
              <td className="px-3 py-2">{formatCurrency(String(line.balance ?? '0'))}</td>
              <td className="px-3 py-2">{String(line.status ?? '—')}</td>
              <td className="px-3 py-2">{formatDate(String(line.openedOn ?? ''))}</td>
              <td className="px-3 py-2">{formatDate(String(line.lastUpdatedOn ?? ''))}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CreditBureau({ deal, active }: CreditBureauProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedBureau, setSelectedBureau] = useState<'experian' | 'transunion' | 'equifax' | 'tri-merge'>('experian');
  const [pullType, setPullType] = useState<'soft' | 'hard'>('soft');
  const [shareOpen, setShareOpen] = useState(false);
  const [shareEmails, setShareEmails] = useState('');
  const [shareMessage, setShareMessage] = useState('');

  const { data: application } = useQuery<CreditApplicationDto | null>({
    queryKey: ['fi', 'deal', deal.id, 'credit-application'],
    queryFn: () => fetchCreditApplication(deal.id),
  });

  const {
    data: report,
    isLoading: reportLoading,
  } = useQuery<CreditReportDto | null>({
    queryKey: ['fi', 'deal', deal.id, 'credit-report'],
    queryFn: () => fetchCreditReport(deal.id),
  });

  const consentsComplete = Boolean(
    application?.authorizeCredit && application?.certifyAccuracy && application?.privacyConsent,
  );

  const handlePullTypeChange = (value: 'soft' | 'hard') => {
    if (value === 'hard' && !consentsComplete) {
      toast({
        title: 'Consent required for hard pull',
        description: 'Authorize credit, certify accuracy, and accept privacy disclosures before performing a hard pull.',
        variant: 'destructive',
      });
      return;
    }
    setPullType(value);
  };

  const pullMutation = useMutation({
    mutationFn: () => pullCredit({ dealId: deal.id, bureau: selectedBureau, pullType }),
    onSuccess: (result) => {
      queryClient.setQueryData(['fi', 'deal', deal.id, 'credit-report'], result);
      toast({ title: 'Credit report retrieved successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to pull credit',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const shareMutation = useMutation({
    mutationFn: () =>
      shareCreditReport({
        dealId: deal.id,
        emails: shareEmails
          .split(',')
          .map((email) => email.trim())
          .filter((email) => email.length > 0),
        message: shareMessage.trim() || undefined,
      }),
    onSuccess: () => {
      toast({ title: 'Credit report shared' });
      setShareOpen(false);
      setShareEmails('');
      setShareMessage('');
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to share credit report',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const scores = useMemo(() => {
    if (!report) {
      return [] as Array<{ label: string; value: string }>;
    }
    return [
      { label: 'Experian', value: formatScore(report.experianScore) },
      { label: 'TransUnion', value: formatScore(report.transUnionScore) },
      { label: 'Equifax', value: formatScore(report.equifaxScore) },
      { label: 'Merged', value: formatScore(report.mergedScore) },
    ];
  }, [report]);

  const canPull = Boolean(application);

  return (
    <Card className={cn('shadow-sm', active && 'border-primary')}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Step 2 · Credit Bureau</CardTitle>
        <div className="flex gap-2">
          <div className="flex rounded-full border bg-muted/40 px-3 py-1 text-xs text-muted-foreground">
            {report?.pulledAt ? `Last pull ${format(new Date(report.pulledAt), 'MMM d, yyyy p')}` : 'No report yet'}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <section className="space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium">Select bureau</p>
            <div className="flex flex-wrap gap-2">
              {bureauOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={selectedBureau === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedBureau(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-medium">Pull type</p>
            <div className="flex flex-wrap gap-2">
              {pullTypeOptions.map((option) => (
                <Button
                  key={option.value}
                  type="button"
                  variant={pullType === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePullTypeChange(option.value)}
                  disabled={option.value === 'hard' && !consentsComplete}
                >
                  {option.label}
                </Button>
              ))}
            </div>
            {!consentsComplete && (
              <Badge variant="outline" className="text-xs">
                Hard pull locked until consent captured
              </Badge>
            )}
          </div>
          <div>
            <Button
              type="button"
              onClick={() => pullMutation.mutate()}
              disabled={!canPull || pullMutation.isPending}
            >
              {pullMutation.isPending ? 'Pulling…' : 'Pull Credit'}
            </Button>
            {!canPull && (
              <p className="mt-2 text-xs text-muted-foreground">
                Complete and save the credit application before pulling credit.
              </p>
            )}
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Report Summary</h3>
            {report && (
              <div className="flex gap-2">
                {report.pdfUrl && (
                  <Button type="button" variant="outline" size="sm" onClick={() => window.open(report.pdfUrl!, '_blank')}>
                    Download PDF
                  </Button>
                )}
                <Dialog open={shareOpen} onOpenChange={setShareOpen}>
                  <DialogTrigger asChild>
                    <Button type="button" size="sm" variant="outline">
                      Share
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Share credit report</DialogTitle>
                      <DialogDescription>Send the summary and PDF link via email.</DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="share-emails">Recipient emails</Label>
                        <Input
                          id="share-emails"
                          placeholder="finance@dealer.com, compliance@dealer.com"
                          value={shareEmails}
                          onChange={(event) => setShareEmails(event.target.value)}
                        />
                        <p className="text-xs text-muted-foreground">Separate multiple emails with commas.</p>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="share-message">Message</Label>
                        <Textarea
                          id="share-message"
                          rows={3}
                          placeholder="Including the latest credit score for your review."
                          value={shareMessage}
                          onChange={(event) => setShareMessage(event.target.value)}
                        />
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setShareOpen(false)}>
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          onClick={() => shareMutation.mutate()}
                          disabled={shareMutation.isPending || !shareEmails.trim()}
                        >
                          {shareMutation.isPending ? 'Sending…' : 'Send'}
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}
          </div>

          {reportLoading ? (
            <p className="text-sm text-muted-foreground">Loading credit report…</p>
          ) : report ? (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                {scores.map((score) => (
                  <ScoreCard key={score.label} label={score.label} value={score.value} />
                ))}
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Profile Overview</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt>Total Accounts</dt>
                      <dd className="font-medium">{report.totalAccounts}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Open Accounts</dt>
                      <dd className="font-medium">{report.openAccounts}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Revolving Credit</dt>
                      <dd className="font-medium">{formatCurrency(report.totalRevolvingCredit)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Revolving Balance</dt>
                      <dd className="font-medium">{formatCurrency(report.totalRevolvingBalance)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Utilization</dt>
                      <dd className="font-medium">{formatPercent(report.utilizationPercent)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Installment Debt</dt>
                      <dd className="font-medium">{formatCurrency(report.totalInstallmentDebt)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Monthly Obligations</dt>
                      <dd className="font-medium">{formatCurrency(report.monthlyDebtObligations)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>On-Time Payments</dt>
                      <dd className="font-medium">{formatPercent(report.onTimePaymentPercent)}</dd>
                    </div>
                  </dl>
                </div>
                <div className="rounded-lg border bg-card p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Derogatory Items</p>
                  <dl className="mt-3 space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt>30+ Days Late</dt>
                      <dd className="font-medium">{report.late30Days}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>60+ Days Late</dt>
                      <dd className="font-medium">{report.late60Days}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>90+ Days Late</dt>
                      <dd className="font-medium">{report.late90PlusDays}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Collections</dt>
                      <dd className="font-medium">{report.collections}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Charge-offs</dt>
                      <dd className="font-medium">{report.chargeOffs}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Bankruptcies</dt>
                      <dd className="font-medium">{report.bankruptcies}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Foreclosures</dt>
                      <dd className="font-medium">{report.foreclosures}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Hard Inquiries</dt>
                      <dd className="font-medium">{report.hardInquiries}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Soft Inquiries</dt>
                      <dd className="font-medium">{report.softInquiries}</dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-muted-foreground">Trade Lines</h4>
                <TradeLineTable tradeLines={report.tradeLines} />
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No credit report available yet.</p>
          )}
        </section>
      </CardContent>
    </Card>
  );
}
