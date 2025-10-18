import { useEffect, useMemo, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertTriangle,
  ArrowLeft,
  BadgeCheck,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Loader2,
  Send,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  cancelFunding,
  fetchFundingStatus,
  markDealFunded,
  submitFundingRequest,
  type FundingCancellationPayload,
  type FundingStatusDto,
  type FundingSubmissionPayload,
  type FundingTimelineEntryDto,
} from '../api';
import { updateDealJacket } from '../api';

export interface DealFundingWorkspaceProps {
  dealId: string;
  showBackButton?: boolean;
  padded?: boolean;
  onNavigateBack?: () => void;
}

const fundingMethods = [
  { label: 'ACH', value: 'ACH' },
  { label: 'Wire', value: 'WIRE' },
  { label: 'Check', value: 'CHECK' },
] as const;

const submissionModes = [
  { label: 'Integrated', value: 'INTEGRATION' },
  { label: 'Manual', value: 'MANUAL' },
] as const;

function formatCurrency(value?: number | null) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '—';
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatDate(value?: string | null) {
  if (!value) {
    return '—';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

function getTimelineStatusStyles(status: FundingTimelineEntryDto['status']) {
  switch (status) {
    case 'COMPLETED':
      return 'bg-emerald-100 text-emerald-700';
    case 'FAILED':
      return 'bg-destructive/10 text-destructive';
    case 'CANCELLED':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-amber-100 text-amber-700';
  }
}

function ChecklistItem({
  complete,
  label,
  description,
}: {
  complete: boolean;
  label: string;
  description?: string;
}) {
  const Icon = complete ? CheckCircle2 : Circle;
  return (
    <div className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/80 p-3">
      <Icon className={cn('mt-0.5 h-4 w-4', complete ? 'text-emerald-500' : 'text-muted-foreground')} />
      <div className="space-y-1">
        <p className="font-medium leading-none">{label}</p>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
    </div>
  );
}

export function DealFundingWorkspace(props: DealFundingWorkspaceProps) {
  return <DealFundingView {...props} />;
}

export default function DealFundingPage() {
  return <DealFundingView />;
}

interface SubmissionFormState {
  fundingMethod: 'ACH' | 'WIRE' | 'CHECK';
  submissionType: 'INTEGRATION' | 'MANUAL';
  amount: string;
  bankAccountId: string;
  externalReference: string;
  notes: string;
}

interface FundedFormState {
  amount: string;
  fundedAt: string;
  lenderRefNumber: string;
  notes: string;
}

function DealFundingView({
  dealId: providedDealId,
  showBackButton = true,
  padded = true,
  onNavigateBack,
}: Partial<DealFundingWorkspaceProps>) {
  const { id: routeDealId } = useParams<{ id: string }>();
  const dealId = providedDealId ?? routeDealId;
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [fundedDialogOpen, setFundedDialogOpen] = useState(false);
  const [submissionForm, setSubmissionForm] = useState<SubmissionFormState>({
    fundingMethod: 'ACH',
    submissionType: 'INTEGRATION',
    amount: '',
    bankAccountId: '',
    externalReference: '',
    notes: '',
  });
  const [fundedForm, setFundedForm] = useState<FundedFormState>({
    amount: '',
    fundedAt: '',
    lenderRefNumber: '',
    notes: '',
  });

  const horizontalPadding = padded ? 'px-6' : '';
  const containerClass = cn('space-y-6', horizontalPadding, padded ? 'py-8' : 'py-6');
  const sectionPaddingClass = cn(horizontalPadding, padded ? 'py-8' : 'py-6');

  const handleBack = () => {
    if (onNavigateBack) {
      onNavigateBack();
      return;
    }

    if (dealId) {
      setLocation(`/fi/deal-jackets/${dealId}`);
    } else {
      setLocation('/finance');
    }
  };

  const fundingQuery = useQuery<FundingStatusDto>({
    queryKey: ['fi', 'funding', dealId],
    queryFn: () => fetchFundingStatus(dealId!),
    enabled: Boolean(dealId),
  });

  if (!dealId) {
    return (
      <div className={sectionPaddingClass}>
        <Card>
          <CardContent className="py-12 text-center text-sm text-muted-foreground">
            Deal identifier is required to manage funding.
          </CardContent>
        </Card>
      </div>
    );
  }

  useEffect(() => {
    if (!fundingQuery.data) {
      return;
    }
    setSubmissionForm((prev) => {
      const defaultAmount = fundingQuery.data.request?.amountRequested ?? fundingQuery.data.deal.amountFinanced;
      const derivedMethod = fundingQuery.data.request?.fundingMethod as SubmissionFormState['fundingMethod'] | undefined;
      const bankAccountId = fundingQuery.data.request?.bankAccountId ?? '';
      const externalRef = fundingQuery.data.request?.lenderRefNumber ?? '';
      return {
        ...prev,
        amount: defaultAmount !== undefined && defaultAmount !== null ? String(defaultAmount) : prev.amount,
        fundingMethod: derivedMethod ?? prev.fundingMethod,
        bankAccountId,
        externalReference: externalRef,
      };
    });
    setFundedForm((prev) => {
      const defaultAmount =
        fundingQuery.data.request?.fundedAmount ??
        fundingQuery.data.request?.amountRequested ??
        fundingQuery.data.deal.amountFinanced;
      const fundedAt = fundingQuery.data.request?.fundedAt ?? '';
      return {
        ...prev,
        amount: defaultAmount !== undefined && defaultAmount !== null ? String(defaultAmount) : prev.amount,
        fundedAt: fundedAt ? fundedAt.slice(0, 16) : prev.fundedAt,
        lenderRefNumber: fundingQuery.data.request?.lenderRefNumber ?? prev.lenderRefNumber,
      };
    });
  }, [fundingQuery.data]);

  const submitFundingMutation = useMutation({
    mutationFn: (payload: FundingSubmissionPayload) => submitFundingRequest(payload),
    onSuccess: (response, variables) => {
      if (dealId) {
        queryClient.setQueryData(['fi', 'funding', dealId], response);
        queryClient.invalidateQueries({ queryKey: ['fi', 'deal', dealId] });
      }
      if (variables.previewOnly) {
        toast({ title: 'Funding packet refreshed', description: 'A fresh packet is ready for review.' });
        if (response.packet?.url) {
          window.open(response.packet.url, '_blank', 'noopener,noreferrer');
        }
      } else {
        toast({ title: 'Funding submitted', description: 'The funding packet has been sent to the lender.' });
        setSubmitDialogOpen(false);
      }
    },
    onError: (error: any, variables) => {
      toast({
        title: variables?.previewOnly ? 'Unable to refresh funding packet' : 'Unable to submit funding',
        description: error?.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const markFundedMutation = useMutation({
    mutationFn: (payload: { dealId: string; fundedAmount: number; fundedAt?: string | null; lenderRefNumber?: string | null; notes?: string | null }) =>
      markDealFunded(payload),
    onSuccess: (response) => {
      if (dealId) {
        queryClient.setQueryData(['fi', 'funding', dealId], response);
        queryClient.invalidateQueries({ queryKey: ['fi', 'deal', dealId] });
      }
      toast({ title: 'Deal marked as funded', description: 'Accounting entry was generated successfully.' });
      setFundedDialogOpen(false);
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to mark deal funded',
        description: error?.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const cancelFundingMutation = useMutation({
    mutationFn: (payload: FundingCancellationPayload) => cancelFunding(payload),
    onSuccess: (response) => {
      if (dealId) {
        queryClient.setQueryData(['fi', 'funding', dealId], response);
        queryClient.invalidateQueries({ queryKey: ['fi', 'deal', dealId] });
      }
      toast({ title: 'Funding request cancelled', description: 'The lender will be notified of the cancellation.' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to cancel funding request',
        description: error?.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const markDeliveredMutation = useMutation({
    mutationFn: () => updateDealJacket(dealId!, { status: 'Delivered' }),
    onSuccess: (response) => {
      queryClient.setQueryData(['fi', 'deal', dealId], response);
      toast({ title: 'Deal marked as delivered' });
    },
    onError: (error: any) => {
      toast({
        title: 'Unable to mark deal delivered',
        description: error?.message ?? 'An unexpected error occurred.',
        variant: 'destructive',
      });
    },
  });

  const fundingStatus = fundingQuery.data;
  const canSubmit = Boolean(fundingStatus?.preFunding.ready);
  const isFunded = fundingStatus?.request?.status?.toUpperCase() === 'FUNDED';
  const timeline = fundingStatus?.request?.timeline ?? [];

  const outstandingSummary = useMemo(() => {
    if (!fundingStatus) {
      return [] as string[];
    }
    const parts: string[] = [];
    if (!fundingStatus.preFunding.contractsComplete) {
      parts.push('Contracts pending');
    }
    if (!fundingStatus.preFunding.complianceComplete) {
      parts.push('Compliance checks incomplete');
    }
    if (!fundingStatus.preFunding.stipulationsComplete) {
      parts.push('Outstanding lender stipulations');
    }
    if (!fundingStatus.preFunding.fundingChecklistComplete) {
      parts.push('Funding checklist not complete');
    }
    return parts;
  }, [fundingStatus]);

  const handleSubmitFunding = (previewOnly = false) => {
    if (!dealId) {
      return;
    }
    const amount = Number.parseFloat(submissionForm.amount.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: 'Enter a valid amount',
        description: 'Amount requested must be a positive number.',
        variant: 'destructive',
      });
      return;
    }
    submitFundingMutation.mutate({
      dealId,
      fundingMethod: submissionForm.fundingMethod,
      amountRequested: amount,
      bankAccountId: submissionForm.bankAccountId.trim() ? submissionForm.bankAccountId.trim() : undefined,
      submissionType: submissionForm.submissionType,
      externalReference: submissionForm.externalReference.trim() || undefined,
      notes: submissionForm.notes.trim() || undefined,
      previewOnly,
    });
  };

  const handleMarkFunded = () => {
    if (!dealId) {
      return;
    }
    const amount = Number.parseFloat(fundedForm.amount.replace(/[^0-9.-]/g, ''));
    if (!Number.isFinite(amount) || amount <= 0) {
      toast({
        title: 'Enter a valid funded amount',
        description: 'Funded amount must be a positive number.',
        variant: 'destructive',
      });
      return;
    }
    markFundedMutation.mutate({
      dealId,
      fundedAmount: amount,
      fundedAt: fundedForm.fundedAt ? new Date(fundedForm.fundedAt).toISOString() : undefined,
      lenderRefNumber: fundedForm.lenderRefNumber.trim() || undefined,
      notes: fundedForm.notes.trim() || undefined,
    });
  };

  const handleCancel = () => {
    if (!dealId) {
      return;
    }
    cancelFundingMutation.mutate({ dealId, reason: undefined });
  };

  if (fundingQuery.isLoading || !fundingStatus) {
    return (
      <div className={containerClass}>
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (fundingQuery.isError) {
    const error = fundingQuery.error as Error;
    return (
      <div className={sectionPaddingClass}>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Unable to load funding status</AlertTitle>
          <AlertDescription>{error?.message ?? 'An unexpected error occurred.'}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          {showBackButton ? (
            <Button variant="ghost" className="w-fit px-0" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Deal Jacket
            </Button>
          ) : null}
          <div>
            <h1 className="text-2xl font-semibold">Funding &amp; Delivery</h1>
            <p className="text-sm text-muted-foreground">
              Manage pre-funding checks, lender submissions, and record funding outcomes for this deal.
            </p>
          </div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => fundingQuery.refetch()}
            disabled={fundingQuery.isRefetching}
          >
            {fundingQuery.isRefetching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Clock className="mr-2 h-4 w-4" />}Check Status
          </Button>
          <Button onClick={() => setSubmitDialogOpen(true)} disabled={!canSubmit || submitFundingMutation.isPending}>
            <Send className="mr-2 h-4 w-4" /> Submit for Funding
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Pre-funding Checklist</CardTitle>
              <CardDescription>
                All items must be complete before a funding request can be submitted.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!fundingStatus.preFunding.ready ? (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Funding gated</AlertTitle>
                  <AlertDescription>
                    Resolve the following before submitting:
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                      {outstandingSummary.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                      {fundingStatus.preFunding.outstandingContracts.map((item) => (
                        <li key={item}>Contract pending: {item}</li>
                      ))}
                      {fundingStatus.preFunding.outstandingStipulations.map((item) => (
                        <li key={item.id}>Stipulation outstanding: {item.description}</li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-900">
                  <BadgeCheck className="h-4 w-4" />
                  <AlertTitle>Ready for funding</AlertTitle>
                  <AlertDescription>All checklist items are complete.</AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3 md:grid-cols-2">
                <ChecklistItem
                  complete={fundingStatus.preFunding.contractsComplete}
                  label="Contracts executed"
                  description="Retail installment contracts and disclosures are signed."
                />
                <ChecklistItem
                  complete={fundingStatus.preFunding.complianceComplete}
                  label="Compliance cleared"
                  description="State and federal compliance obligations satisfied."
                />
                <ChecklistItem
                  complete={fundingStatus.preFunding.stipulationsComplete}
                  label="Lender stipulations met"
                  description="All lender requests have been satisfied or waived."
                />
                <ChecklistItem
                  complete={fundingStatus.preFunding.fundingChecklistComplete}
                  label="Internal funding checklist"
                  description="Deal packet verified for internal delivery."
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Funding Packet</CardTitle>
                <CardDescription>Preview and share the compiled packet sent to the lender.</CardDescription>
              </div>
              <Badge variant={fundingStatus.packet ? 'secondary' : 'outline'}>
                {fundingStatus.packet ? 'Latest packet ready' : 'Not generated'}
              </Badge>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => handleSubmitFunding(true)}
                disabled={!canSubmit || submitFundingMutation.isPending}
              >
                {submitFundingMutation.isPending && submitFundingMutation.variables?.previewOnly ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <FileText className="mr-2 h-4 w-4" />
                )}
                Preview Funding Packet
              </Button>
              <Button
                variant="ghost"
                className="flex-1"
                onClick={() => {
                  if (fundingStatus.packet?.url) {
                    window.open(fundingStatus.packet.url, '_blank', 'noopener,noreferrer');
                  } else {
                    toast({
                      title: 'No packet available',
                      description: 'Generate the packet before attempting to open it.',
                      variant: 'destructive',
                    });
                  }
                }}
              >
                <FileText className="mr-2 h-4 w-4" /> Open Latest Packet
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funding Timeline</CardTitle>
              <CardDescription>Track updates from submission through funding.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {timeline.length === 0 ? (
                <p className="text-sm text-muted-foreground">No timeline entries yet.</p>
              ) : (
                <ul className="space-y-4">
                  {timeline
                    .slice()
                    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                    .map((entry) => (
                      <li key={entry.id} className="rounded-lg border border-border/60 bg-background/80 p-4">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="font-medium">{entry.label}</p>
                            <p className="text-xs text-muted-foreground">{formatDate(entry.timestamp)}</p>
                          </div>
                          <Badge className={cn('px-2 py-0.5 text-xs font-medium', getTimelineStatusStyles(entry.status))}>
                            {entry.status}
                          </Badge>
                        </div>
                        {entry.message ? (
                          <p className="mt-2 text-sm text-muted-foreground">{entry.message}</p>
                        ) : null}
                        {entry.expectedAt ? (
                          <p className="mt-2 text-xs text-muted-foreground">
                            Expected completion: {formatDate(entry.expectedAt)}
                          </p>
                        ) : null}
                        {entry.metadata && Object.keys(entry.metadata).length > 0 ? (
                          <div className="mt-3 rounded-md bg-muted/40 p-2">
                            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                              Details
                            </p>
                            <ul className="mt-1 space-y-1 text-sm">
                              {Object.entries(entry.metadata).map(([key, value]) => (
                                <li key={key} className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                                  <span>{String(value)}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </li>
                    ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Deal Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Deal Number</span>
                <span className="font-medium">{fundingStatus.deal.dealNumber}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Customer</span>
                <span className="font-medium">{fundingStatus.deal.customerName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Lender</span>
                <span className="font-medium">{fundingStatus.deal.lenderName ?? '—'}</span>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount Financed</span>
                <span className="font-semibold">{formatCurrency(fundingStatus.deal.amountFinanced)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Cash Down</span>
                <span>{formatCurrency(fundingStatus.deal.cashDown)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">APR</span>
                <span>{fundingStatus.deal.apr !== null && fundingStatus.deal.apr !== undefined ? `${fundingStatus.deal.apr.toFixed(3)}%` : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Term</span>
                <span>{fundingStatus.deal.term ? `${fundingStatus.deal.term} mo` : '—'}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Funding Request</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant="secondary">{fundingStatus.request?.status ?? 'Not submitted'}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Amount Requested</span>
                <span>{fundingStatus.request ? formatCurrency(fundingStatus.request.amountRequested) : '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Funding Method</span>
                <span>{fundingStatus.request?.fundingMethod ?? '—'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span>{formatDate(fundingStatus.request?.submittedAt)}</span>
              </div>
              {fundingStatus.request?.lenderRefNumber ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lender Reference</span>
                  <span>{fundingStatus.request.lenderRefNumber}</span>
                </div>
              ) : null}
              {fundingStatus.request?.fundedAmount ? (
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Funded Amount</span>
                  <span>{formatCurrency(fundingStatus.request.fundedAmount)}</span>
                </div>
              ) : null}
              {fundingStatus.request?.journalEntryId ? (
                <Button
                  variant="link"
                  className="px-0"
                  onClick={() => setLocation(`/accounting/journal-entries/${fundingStatus.request?.journalEntryId}`)}
                >
                  View journal entry
                </Button>
              ) : null}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  variant="secondary"
                  disabled={!fundingStatus.request || isFunded || markFundedMutation.isPending}
                  onClick={() => setFundedDialogOpen(true)}
                >
                  {markFundedMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}Mark as Funded
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={!fundingStatus.request || isFunded || cancelFundingMutation.isPending}
                >
                  {cancelFundingMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Cancel Funding Request
                </Button>
                {isFunded ? (
                  <Button
                    variant="ghost"
                    onClick={() => markDeliveredMutation.mutate()}
                    disabled={markDeliveredMutation.isPending}
                  >
                    {markDeliveredMutation.isPending ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="mr-2 h-4 w-4" />
                    )}
                    Mark Deal as Delivered
                  </Button>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Submit for Funding</DialogTitle>
            <DialogDescription>
              Confirm the funding method and amount before submitting to the lender.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="funding-amount">Amount Requested</Label>
              <Input
                id="funding-amount"
                inputMode="decimal"
                value={submissionForm.amount}
                onChange={(event) => setSubmissionForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funding-method">Funding Method</Label>
              <Select
                value={submissionForm.fundingMethod}
                onValueChange={(value) => setSubmissionForm((prev) => ({ ...prev, fundingMethod: value as SubmissionFormState['fundingMethod'] }))}
              >
                <SelectTrigger id="funding-method">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fundingMethods.map((method) => (
                    <SelectItem key={method.value} value={method.value}>
                      {method.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="submission-type">Submission Mode</Label>
              <Select
                value={submissionForm.submissionType}
                onValueChange={(value) => setSubmissionForm((prev) => ({ ...prev, submissionType: value as SubmissionFormState['submissionType'] }))}
              >
                <SelectTrigger id="submission-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {submissionModes.map((mode) => (
                    <SelectItem key={mode.value} value={mode.value}>
                      {mode.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funding-bank">Bank Account ID (optional)</Label>
              <Input
                id="funding-bank"
                value={submissionForm.bankAccountId}
                onChange={(event) => setSubmissionForm((prev) => ({ ...prev, bankAccountId: event.target.value }))}
                placeholder="Account identifier for ACH/Wire"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funding-reference">External Reference (optional)</Label>
              <Input
                id="funding-reference"
                value={submissionForm.externalReference}
                onChange={(event) => setSubmissionForm((prev) => ({ ...prev, externalReference: event.target.value }))}
                placeholder="Lender confirmation number"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funding-notes">Notes</Label>
              <Textarea
                id="funding-notes"
                value={submissionForm.notes}
                onChange={(event) => setSubmissionForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Include any details to send with the packet"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-3">
            <Button variant="outline" onClick={() => handleSubmitFunding(true)} disabled={submitFundingMutation.isPending}>
              {submitFundingMutation.isPending && submitFundingMutation.variables?.previewOnly ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Preview Packet
            </Button>
            <Button onClick={() => handleSubmitFunding(false)} disabled={submitFundingMutation.isPending}>
              {submitFundingMutation.isPending && !submitFundingMutation.variables?.previewOnly ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Submit to Lender
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={fundedDialogOpen} onOpenChange={setFundedDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Mark Deal as Funded</DialogTitle>
            <DialogDescription>Capture final funding details and generate accounting entries.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="grid gap-2">
              <Label htmlFor="funded-amount">Funded Amount</Label>
              <Input
                id="funded-amount"
                inputMode="decimal"
                value={fundedForm.amount}
                onChange={(event) => setFundedForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funded-at">Funded Date</Label>
              <Input
                id="funded-at"
                type="datetime-local"
                value={fundedForm.fundedAt}
                onChange={(event) => setFundedForm((prev) => ({ ...prev, fundedAt: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funded-reference">Lender Reference (optional)</Label>
              <Input
                id="funded-reference"
                value={fundedForm.lenderRefNumber}
                onChange={(event) => setFundedForm((prev) => ({ ...prev, lenderRefNumber: event.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="funded-notes">Notes</Label>
              <Textarea
                id="funded-notes"
                value={fundedForm.notes}
                onChange={(event) => setFundedForm((prev) => ({ ...prev, notes: event.target.value }))}
                placeholder="Include settlement details or exceptions"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleMarkFunded} disabled={markFundedMutation.isPending}>
              {markFundedMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BadgeCheck className="mr-2 h-4 w-4" />}Confirm Funding
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
