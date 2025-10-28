import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, Scale, Clock, AlertTriangle, Info } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import StipulationTracker from '../components/StipulationTracker';
import {
  type DealJacketDto,
  type LenderDto,
  type LenderSubmissionDto,
  fetchDealJacket,
  fetchLenderDecisions,
  listLenders,
  satisfyStipulation,
  selectLenderSubmission,
  submitCounterOffer,
  submitLenders,
} from '../api';

export interface LenderSubmissionWorkspaceProps {
  dealId: string;
  showBackButton?: boolean;
  padded?: boolean;
  onNavigateBack?: () => void;
}

function formatCurrency(value?: string | null) {
  if (!value) return '—';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numeric);
}

function formatPercent(value?: string | null) {
  if (!value) return '—';
  const numeric = Number(value);
  if (Number.isNaN(numeric)) return '—';
  return `${numeric.toFixed(2)}%`;
}

function toNumber(value?: string | null) {
  const numeric = Number(value ?? 0);
  return Number.isFinite(numeric) ? numeric : 0;
}

function formatStatus(value: string) {
  return value
    .toLowerCase()
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function classByStatus(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === 'APPROVED' || normalized === 'SELECTED') return 'bg-emerald-100 text-emerald-900';
  if (normalized === 'DECLINED') return 'bg-rose-100 text-rose-900';
  if (normalized === 'CONDITIONAL') return 'bg-amber-100 text-amber-900';
  if (normalized === 'COUNTERED') return 'bg-sky-100 text-sky-900';
  return 'bg-slate-100 text-slate-900';
}

function computeRecommendation(deal: DealJacketDto | undefined, submissions: LenderSubmissionDto[]) {
  if (!deal || !submissions.length) {
    return { recommendationId: null as string | null, rows: [] as typeof submissions };
  }
  const amountFinanced = toNumber(deal.amountFinanced);
  let recommendationId: string | null = null;
  let recommendationScore = Number.POSITIVE_INFINITY;

  for (const submission of submissions) {
    const apr = submission.apr ? Number(submission.apr) : null;
    const reserve = submission.dealerReserve ? Number(submission.dealerReserve) : 0;
    const score = (apr ?? 99) - reserve;
    if (score < recommendationScore) {
      recommendationScore = score;
      recommendationId = submission.id;
    }
  }

  return { recommendationId, rows: submissions, amountFinanced };
}

function tierLabel(tier: string) {
  return tier || 'Other';
}

function LenderSubmissionView({
  dealId: providedDealId,
  showBackButton = true,
  padded = true,
  onNavigateBack,
}: Partial<LenderSubmissionWorkspaceProps>) {
  const { id: routeDealId } = useParams<{ id: string }>();
  const id = providedDealId ?? routeDealId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'select' | 'status' | 'compare'>('select');
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [desiredTerm, setDesiredTerm] = useState<number | ''>(72);
  const [counterState, setCounterState] = useState<{
    open: boolean;
    submission: LenderSubmissionDto | null;
    amount: string;
    apr: string;
    term: string;
    message: string;
  }>({ open: false, submission: null, amount: '', apr: '', term: '', message: '' });
  const [detailsSubmission, setDetailsSubmission] = useState<LenderSubmissionDto | null>(null);

  const horizontalPadding = padded ? 'px-6' : '';
  const containerClass = cn('space-y-6', horizontalPadding, padded ? 'py-8' : 'py-6');
  const sectionPaddingClass = cn(horizontalPadding, padded ? 'py-8' : 'py-6');

  const {
    data: deal,
    isLoading: dealLoading,
    isError: dealError,
  } = useQuery<DealJacketDto>({
    queryKey: ['fi', 'deal', id],
    queryFn: () => fetchDealJacket(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (typeof deal?.term === 'number' && !Number.isNaN(deal.term)) {
      setDesiredTerm(deal.term);
    }
  }, [deal?.term]);

  const { data: lenders = [], isLoading: lendersLoading } = useQuery<LenderDto[]>({
    queryKey: ['fi', 'lenders'],
    queryFn: () => listLenders(),
  });

  const { data: submissions = [], isFetching: submissionsLoading } = useQuery<LenderSubmissionDto[]>({
    queryKey: ['fi', 'lenders', 'decisions', id],
    queryFn: () => fetchLenderDecisions(id!),
    enabled: Boolean(id),
  });

  const submitMutation = useMutation({
    mutationFn: submitLenders,
    onSuccess: () => {
      toast({ title: 'Submissions sent to lenders' });
      queryClient.invalidateQueries({ queryKey: ['fi', 'lenders', 'decisions', id] });
      setSelectedLenders([]);
      setActiveTab('status');
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to submit to lenders',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const selectMutation = useMutation({
    mutationFn: selectLenderSubmission,
    onSuccess: () => {
      toast({ title: 'Offer selected' });
      queryClient.invalidateQueries({ queryKey: ['fi', 'lenders', 'decisions', id] });
      queryClient.invalidateQueries({ queryKey: ['fi', 'deal', id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to select offer',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const counterMutation = useMutation({
    mutationFn: submitCounterOffer,
    onSuccess: () => {
      toast({ title: 'Counter offer sent' });
      queryClient.invalidateQueries({ queryKey: ['fi', 'lenders', 'decisions', id] });
      setCounterState({ open: false, submission: null, amount: '', apr: '', term: '', message: '' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to send counter offer',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  const satisfyMutation = useMutation({
    mutationFn: satisfyStipulation,
    onSuccess: () => {
      toast({ title: 'Stipulation marked satisfied' });
      queryClient.invalidateQueries({ queryKey: ['fi', 'lenders', 'decisions', id] });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to update stipulation',
        description: error?.message ?? 'An unexpected error occurred',
        variant: 'destructive',
      });
    },
  });

  if (!id) {
    return (
      <div className={sectionPaddingClass}>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Deal identifier is required to manage lender submissions.
          </CardContent>
        </Card>
      </div>
    );
  }

  const tierGroups = useMemo(() => {
    const map = new Map<string, LenderDto[]>();
    for (const lender of lenders) {
      const key = lender.tierRange || 'Other';
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(lender);
    }
    return Array.from(map.entries());
  }, [lenders]);

  const recommendation = useMemo(() => computeRecommendation(deal, submissions), [deal, submissions]);

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
      return;
    }

    if (id) {
      setLocation(`/fi/deal-jackets/${id}`);
    } else {
      setLocation('/finance');
    }
  };

  const handleToggleLender = (lenderId: string) => {
    setSelectedLenders((prev) =>
      prev.includes(lenderId) ? prev.filter((entry) => entry !== lenderId) : [...prev, lenderId],
    );
  };

  const handleTierSelect = (tier: string) => {
    const tierMatches = lenders.filter((lender) => lender.tierRange.toLowerCase().includes(tier.toLowerCase()));
    const ids = tierMatches.map((entry) => entry.id);
    setSelectedLenders((prev) => Array.from(new Set([...prev, ...ids])));
  };

  const handleSubmit = () => {
    if (!id) return;
    const numericTerm = typeof desiredTerm === 'number' ? desiredTerm : Number(desiredTerm);
    submitMutation.mutate({
      dealId: id,
      lenderIds: selectedLenders,
      desiredTerm: Number.isFinite(numericTerm) ? numericTerm : undefined,
    });
  };

  const openCounter = (submission: LenderSubmissionDto) => {
    setCounterState({
      open: true,
      submission,
      amount: submission.amountApproved ?? '',
      apr: submission.apr ?? '',
      term: submission.term ? String(submission.term) : '',
      message: '',
    });
  };

  const handleCounterSubmit = () => {
    if (!counterState.submission) return;
    counterMutation.mutate({
      submissionId: counterState.submission.id,
      amount: counterState.amount ? Number(counterState.amount) : null,
      apr: counterState.apr ? Number(counterState.apr) : null,
      term: counterState.term ? Number(counterState.term) : null,
      message: counterState.message || null,
    });
  };

  const handleSatisfy = (submissionId: string, stipulationId: string) => {
    satisfyMutation.mutate({ submissionId, stipulationId });
  };

  const renderSelection = () => (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-4 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Deal Structure</CardTitle>
            <CardDescription>Review the working numbers before submitting to lenders.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-muted-foreground">Amount Financed</p>
                <p className="font-semibold">{formatCurrency(deal?.amountFinanced)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Cash Down</p>
                <p className="font-semibold">{formatCurrency(deal?.cashDown)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Vehicle Price</p>
                <p className="font-semibold">{formatCurrency(deal?.sellingPrice)}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Trade Allowance</p>
                <p className="font-semibold">{formatCurrency(deal?.tradeValue)}</p>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="desired-term">
                Desired term (months)
              </label>
              <Input
                id="desired-term"
                type="number"
                min={12}
                max={120}
                value={desiredTerm}
                onChange={(event) => {
                  const value = event.target.value;
                  setDesiredTerm(value === '' ? '' : Number(value));
                }}
              />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Tier Shortcuts</CardTitle>
            <CardDescription>Select lenders by preset tier groupings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => handleTierSelect('tier 1')}>
                Select Tier 1
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleTierSelect('tier 2')}>
                Select Tier 2
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleTierSelect('subprime')}>
                Select Subprime
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedLenders([])}>
                Clear selection
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Tier groupings are derived from lender configuration. Adjust as needed before submitting.
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="lg:col-span-8 space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Available Lenders</CardTitle>
            <CardDescription>Select one or more lenders to receive this deal structure.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {lendersLoading ? (
              <p className="text-sm text-muted-foreground">Loading lenders…</p>
            ) : lenders.length === 0 ? (
              <p className="text-sm text-muted-foreground">No lenders configured for this rooftop.</p>
            ) : (
              tierGroups.map(([tier, tierLenders]) => (
                <div key={tier} className="space-y-3">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <Badge variant="secondary">{tierLabel(tier)}</Badge>
                    <span className="text-xs text-muted-foreground">{tierLenders.length} lender(s)</span>
                  </h3>
                  <div className="grid gap-3 md:grid-cols-2">
                    {tierLenders.map((lender) => {
                      const checked = selectedLenders.includes(lender.id);
                      return (
                        <label
                          key={lender.id}
                          className={cn(
                            'flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition',
                            checked ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50',
                          )}
                        >
                          <Checkbox
                            checked={checked}
                            onCheckedChange={() => handleToggleLender(lender.id)}
                            className="mt-1"
                          />
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-foreground">{lender.name}</span>
                              <Badge variant="outline">{lender.type}</Badge>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Max term {lender.maxTerm} • Max LTV {Number(lender.maxLtv).toFixed(2)}%
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Min score {lender.minCreditScore ?? '—'} • Max score {lender.maxCreditScore ?? '—'}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
        <div className="flex justify-end gap-3">
          {showBackButton ? (
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to deal
            </Button>
          ) : null}
          <Button
            onClick={handleSubmit}
            disabled={selectedLenders.length === 0 || submitMutation.isPending}
          >
            {submitMutation.isPending ? 'Submitting…' : 'Submit to selected lenders'}
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStatus = () => (
    <div className="space-y-4">
      {submissionsLoading ? (
        <p className="text-sm text-muted-foreground">Loading submission statuses…</p>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No lender submissions yet. Select lenders and submit the deal to begin tracking decisions.
          </CardContent>
        </Card>
      ) : (
        submissions.map((submission) => {
          const statusClass = classByStatus(submission.status);
          const isSelected = submission.isSelected;
          return (
            <Card key={submission.id} className={cn(isSelected && 'border-primary shadow-md shadow-primary/10')}>
              <CardHeader className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className={statusClass}>
                    {formatStatus(submission.status)}
                  </Badge>
                  <h3 className="text-lg font-semibold text-foreground">{submission.lender.name}</h3>
                  {isSelected ? (
                    <Badge className="bg-primary text-primary-foreground">Selected Offer</Badge>
                  ) : null}
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span>Submitted {new Date(submission.submittedAt).toLocaleString()}</span>
                  {submission.respondedAt ? <span>Decision {new Date(submission.respondedAt).toLocaleString()}</span> : null}
                  {submission.expiresAt ? <span>Expires {new Date(submission.expiresAt).toLocaleDateString()}</span> : null}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-5">
                  <div>
                    <p className="text-xs text-muted-foreground">Amount Approved</p>
                    <p className="font-semibold">{formatCurrency(submission.amountApproved)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">APR</p>
                    <p className="font-semibold">{formatPercent(submission.apr)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Buy Rate</p>
                    <p className="font-semibold">{formatPercent(submission.buyRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Monthly Payment</p>
                    <p className="font-semibold">{formatCurrency(submission.monthlyPayment)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Dealer Reserve</p>
                    <p className="font-semibold">{formatPercent(submission.dealerReserve)}</p>
                  </div>
                </div>
                {submission.declineReason ? (
                  <div className="flex items-start gap-2 rounded-md bg-rose-50 p-3 text-sm text-rose-700">
                    <AlertTriangle className="mt-0.5 h-4 w-4" />
                    <span>{submission.declineReason}</span>
                  </div>
                ) : null}
                {submission.stipulations?.length ? (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold text-foreground">Stipulations</h4>
                    <StipulationTracker
                      stipulations={submission.stipulations}
                      onSatisfy={(stipulationId) => handleSatisfy(submission.id, stipulationId)}
                      disabled={satisfyMutation.isPending}
                    />
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="default"
                    onClick={() => selectMutation.mutate({ submissionId: submission.id })}
                    disabled={isSelected || selectMutation.isPending || submission.status === 'DECLINED'}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" /> Select this offer
                  </Button>
                  <Button variant="outline" onClick={() => openCounter(submission)} disabled={counterMutation.isPending}>
                    <Scale className="mr-2 h-4 w-4" /> Counter offer
                  </Button>
                  <Button variant="ghost" onClick={() => setDetailsSubmission(submission)}>
                    <Info className="mr-2 h-4 w-4" /> View details
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })
      )}
    </div>
  );

  const renderComparison = () => (
    <div className="space-y-4">
      {submissions.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Submit to at least one lender to view comparison data.
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Offer Comparison</CardTitle>
            <CardDescription>Evaluate lender offers side-by-side with an automated recommendation.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Lender</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Status</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">APR</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Monthly Payment</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Total Interest</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Reserve</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground">Stipulations</th>
                </tr>
              </thead>
              <tbody>
                {recommendation.rows.map((submission) => {
                  const payment = toNumber(submission.monthlyPayment);
                  const term = submission.term ?? deal?.term ?? 0;
                  const totalInterest = term && payment && recommendation.amountFinanced
                    ? payment * term - recommendation.amountFinanced
                    : null;
                  const isRecommended = recommendation.recommendationId === submission.id;
                  return (
                    <tr
                      key={submission.id}
                      className={cn('border-b border-border', isRecommended && 'bg-primary/5')}
                    >
                      <td className="px-4 py-3 font-medium text-foreground">
                        <div className="flex items-center gap-2">
                          {submission.lender.name}
                          {isRecommended ? (
                            <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={classByStatus(submission.status)}>
                          {formatStatus(submission.status)}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">{formatPercent(submission.apr)}</td>
                      <td className="px-4 py-3">{formatCurrency(submission.monthlyPayment)}</td>
                      <td className="px-4 py-3">{totalInterest !== null ? formatCurrency(String(totalInterest)) : '—'}</td>
                      <td className="px-4 py-3">{formatPercent(submission.dealerReserve)}</td>
                      <td className="px-4 py-3">{submission.stipulations?.length ?? 0}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}
    </div>
  );

  if (dealLoading) {
    return (
      <div className={containerClass}>
        <div className="h-10 w-64 rounded bg-muted animate-pulse" />
        <div className="h-[400px] rounded-lg border border-dashed border-muted" />
      </div>
    );
  }

  if (dealError || !deal) {
    return (
      <div className={sectionPaddingClass}>
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            Unable to load deal. Please return to the deal desk and try again.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Lender Submissions</h1>
          <p className="text-sm text-muted-foreground">
            Manage submissions for deal {deal.dealNumber} — {deal.customer.firstName} {deal.customer.lastName}
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" /> Pending: {submissions.filter((item) => item.status === 'PENDING').length}
          </span>
          <span className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4" /> Approved: {submissions.filter((item) => item.status === 'APPROVED' || item.status === 'CONDITIONAL').length}
          </span>
          <span className="flex items-center gap-1">
            <AlertTriangle className="h-4 w-4" /> Declined: {submissions.filter((item) => item.status === 'DECLINED').length}
          </span>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
        <TabsList>
          <TabsTrigger value="select">Select Lenders</TabsTrigger>
          <TabsTrigger value="status" disabled={submissions.length === 0 && activeTab !== 'select'}>
            Submission Status
          </TabsTrigger>
          <TabsTrigger value="compare" disabled={submissions.length === 0}>
            Compare Offers
          </TabsTrigger>
        </TabsList>
        <TabsContent value="select" className="mt-6">
          {renderSelection()}
        </TabsContent>
        <TabsContent value="status" className="mt-6">
          {renderStatus()}
        </TabsContent>
        <TabsContent value="compare" className="mt-6">
          {renderComparison()}
        </TabsContent>
      </Tabs>

      <Dialog
        open={counterState.open}
        onOpenChange={(open) => {
          if (!open) {
            setCounterState({ open: false, submission: null, amount: '', apr: '', term: '', message: '' });
          } else {
            setCounterState((prev) => ({ ...prev, open }));
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send counter offer</DialogTitle>
            <DialogDescription>
              Provide updated terms to send back to {counterState.submission?.lender.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="counter-amount">
                Amount approved
              </label>
              <Input
                id="counter-amount"
                placeholder="Leave blank to keep current"
                value={counterState.amount}
                onChange={(event) => setCounterState((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="grid gap-2 md:grid-cols-2">
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="counter-apr">
                  APR
                </label>
                <Input
                  id="counter-apr"
                  placeholder="e.g. 7.49"
                  value={counterState.apr}
                  onChange={(event) => setCounterState((prev) => ({ ...prev, apr: event.target.value }))}
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium" htmlFor="counter-term">
                  Term (months)
                </label>
                <Input
                  id="counter-term"
                  placeholder="e.g. 72"
                  value={counterState.term}
                  onChange={(event) => setCounterState((prev) => ({ ...prev, term: event.target.value }))}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <label className="text-sm font-medium" htmlFor="counter-message">
                Message to lender
              </label>
              <Textarea
                id="counter-message"
                placeholder="Add supporting context or doc notes"
                value={counterState.message}
                onChange={(event) => setCounterState((prev) => ({ ...prev, message: event.target.value }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCounterState({ open: false, submission: null, amount: '', apr: '', term: '', message: '' })}>
              Cancel
            </Button>
            <Button onClick={handleCounterSubmit} disabled={counterMutation.isPending}>
              {counterMutation.isPending ? 'Sending…' : 'Send counter'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={Boolean(detailsSubmission)} onOpenChange={(open) => !open && setDetailsSubmission(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission details</DialogTitle>
            <DialogDescription>
              Review payload and response data exchanged with {detailsSubmission?.lender.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Request Payload</h4>
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(detailsSubmission?.requestPayload ?? {}, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="mb-2 text-sm font-semibold text-foreground">Response Payload</h4>
              <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-xs">
                {JSON.stringify(detailsSubmission?.responsePayload ?? {}, null, 2)}
              </pre>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export function LenderSubmissionWorkspace(props: LenderSubmissionWorkspaceProps) {
  return <LenderSubmissionView {...props} />;
}

export default function LenderSubmissionPage() {
  return <LenderSubmissionView />;
}
