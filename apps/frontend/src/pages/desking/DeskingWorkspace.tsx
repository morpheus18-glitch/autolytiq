import { useEffect, useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Car,
  User,
  Save,
  Printer,
  Sparkles,
  GaugeCircle,
  Brain,
  History,
  Users,
  Target,
  Lightbulb,
  LineChart,
} from 'lucide-react';
import PaymentScenarioCard from '@/components/desking/PaymentScenarioCard.tsx';
import GrossMeter from '@/components/desking/GrossMeter.tsx';
import ProbabilityIndicator from '@/components/desking/ProbabilityIndicator.tsx';
import LenderRecommendationCard from '@/components/desking/LenderRecommendationCard.tsx';
import DealTimelineTracker from '@/components/desking/DealTimelineTracker.tsx';
import AIInsightPanel from '@/components/desking/AIInsightPanel.tsx';
import PencilPrintPreview from '@/components/desking/PencilPrintPreview.tsx';
import {
  useDeal,
  useOptimizeDeal,
  useApprovalPredictions,
  useSimilarDeals,
} from '@/features/desking/hooks';
import type { DeskingDeal, PaymentScenario } from '@/features/desking/types';

const DEAL_ID = 'demo-deal-001';

export default function DeskingWorkspace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const { data: deal, isLoading: dealLoading } = useDeal(DEAL_ID);
  const { data: predictions } = useApprovalPredictions(DEAL_ID);
  const { data: similarDeals } = useSimilarDeals(DEAL_ID);
  const optimizeDeal = useOptimizeDeal(DEAL_ID);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (deal?.activeScenarioId) {
      setSelectedScenarioId(deal.activeScenarioId);
    }
  }, [deal?.activeScenarioId]);

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [],
  );

  const formatCurrency = (value: number) => currencyFormatter.format(value);

  const activeScenario = useMemo(
    () => deal?.scenarios.find(scenario => scenario.id === selectedScenarioId),
    [deal?.scenarios, selectedScenarioId],
  );

  const handleSelectScenario = (scenario: PaymentScenario) => {
    setSelectedScenarioId(scenario.id);
    queryClient.setQueryData<DeskingDeal | undefined>(['desking', 'deal', DEAL_ID], current => {
      if (!current) {
        return current;
      }
      return {
        ...current,
        activeScenarioId: scenario.id,
      };
    });
  };

  const handleSaveWorkspace = () => {
    toast({
      title: 'Workspace saved',
      description: 'Your in-progress pencil has been saved for collaboration.',
    });
  };

  const triggerOptimization = (action: 'initial' | 'customer-counter' | 'run-deal') => {
    optimizeDeal.mutate({ action });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <Badge className="rounded-full bg-primary/10 px-3 text-primary">Live Deal Structuring</Badge>
            {deal && (
              <span>Desk Manager: <span className="font-medium text-foreground">{deal.deskManager}</span></span>
            )}
            {deal && <span>Deal #{deal.id}</span>}
          </div>
          <h1 className="text-3xl font-semibold text-foreground">Desking Workspace</h1>
          {deal && (
            <p className="max-w-2xl text-sm text-muted-foreground">
              Coaching-enabled workspace for {deal.customer.name}. Keep gross on target while aligning with payment expectations
              and lender appetite.
            </p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={handleSaveWorkspace} data-testid="save-deal">
            <Save className="h-4 w-4" />
            Save
          </Button>
          <Button className="gap-2" onClick={() => setPrintPreviewOpen(true)} data-testid="header-print">
            <Printer className="h-4 w-4" />
            Print Worksheet
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,2.15fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <Card className="border-border/70 shadow-sm">
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="flex items-start gap-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Car className="h-5 w-5" />
                </span>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Vehicle Overview</CardTitle>
                  {deal && (
                    <p className="text-sm text-muted-foreground">
                      {deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model} • {deal.vehicle.trim}
                    </p>
                  )}
                </div>
              </div>
              {deal && (
                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                  <span>VIN {deal.vehicle.vin}</span>
                  <Separator orientation="vertical" className="hidden h-5 md:block" />
                  <span>Stock {deal.vehicle.stockNumber}</span>
                  <Separator orientation="vertical" className="hidden h-5 md:block" />
                  <span>{deal.vehicle.mileage.toLocaleString()} miles</span>
                </div>
              )}
            </CardHeader>
            {deal && (
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <User className="h-4 w-4 text-primary" /> Customer
                  </h3>
                  <p className="text-base font-medium text-foreground">{deal.customer.name}</p>
                  <p className="text-sm text-muted-foreground">{deal.customer.email}</p>
                  <p className="text-sm text-muted-foreground">{deal.customer.phone}</p>
                  <Badge className="mt-2 w-max rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                    FICO {deal.customer.creditScore}
                  </Badge>
                </div>
                <div className="space-y-2 rounded-lg border border-border/70 bg-muted/30 p-4">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">MSRP</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(deal.vehicle.msrp)}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Sale Price</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(deal.vehicle.salePrice)}</p>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Discount</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(deal.vehicle.msrp - deal.vehicle.salePrice)}</p>
                </div>
              </CardContent>
            )}
          </Card>

          <Card className="border-border/70 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-semibold text-foreground">Pricing Breakdown</CardTitle>
            </CardHeader>
            {deal && (
              <CardContent className="grid grid-cols-2 gap-4 text-sm text-muted-foreground md:grid-cols-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Sale price</p>
                  <p className="text-base font-semibold text-foreground">{formatCurrency(deal.vehicle.salePrice)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Fees</p>
                  <p className="text-base font-semibold text-foreground">{formatCurrency(deal.fees.docFee + deal.fees.acquisitionFee + deal.fees.licenseFee + deal.fees.registration)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Taxes</p>
                  <p className="text-base font-semibold text-foreground">{formatCurrency(deal.fees.taxes)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Gross objective</p>
                  <p className="text-base font-semibold text-foreground">{formatCurrency(deal.gross.targetGross)}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current gross</p>
                  <p className="text-base font-semibold text-foreground">{formatCurrency(deal.gross.totalGross)}</p>
                </div>
              </CardContent>
            )}
          </Card>

          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-foreground">Payment Scenarios</h2>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => triggerOptimization('initial')}
                  disabled={optimizeDeal.isPending}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Initial Pencil
                </Button>
                <Button
                  variant="outline"
                  className="gap-2"
                  onClick={() => triggerOptimization('customer-counter')}
                  disabled={optimizeDeal.isPending}
                >
                  <Lightbulb className="h-4 w-4" />
                  Customer Counter
                </Button>
                <Button
                  className="gap-2"
                  onClick={() => triggerOptimization('run-deal')}
                  disabled={optimizeDeal.isPending}
                  data-testid="ai-optimize-deal"
                >
                  <GaugeCircle className="h-4 w-4" />
                  Run Deal
                </Button>
              </div>
            </div>
            <div className="grid gap-4 xl:grid-cols-2" data-testid="optimization-results">
              {dealLoading && (
                <div className="rounded-lg border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
                  Loading scenarios…
                </div>
              )}
              {deal?.scenarios.map((scenario, index) => {
                const isRecommended = scenario.badges?.some((badge) => badge.toLowerCase() === 'recommended');
                return (
                  <PaymentScenarioCard
                    key={scenario.id}
                    scenario={scenario}
                    isActive={scenario.id === activeScenario?.id}
                    onSelect={handleSelectScenario}
                    formatCurrency={formatCurrency}
                    dataTestId={`scenario-card-${index}`}
                    recommendedTestId={isRecommended ? 'scenario-card-recommended' : undefined}
                  />
                );
              })}
            </div>
            {optimizeDeal.isPending && (
              <p className="text-sm text-muted-foreground">AI is optimizing the deal…</p>
            )}
          </div>

          {deal && <GrossMeter gross={deal.gross} formatCurrency={formatCurrency} />}

          {deal && <DealTimelineTracker events={deal.timeline} />}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <AIInsightPanel
            title="Deal Coaching"
            description="AI review of the selected scenario, highlighting payment alignment and gross opportunities."
            icon={<Brain className="h-5 w-5" />}
            badgeText={activeScenario ? activeScenario.label : undefined}
            badgeTone="accent"
          >
            {activeScenario ? (
              <ul className="list-disc space-y-2 pl-5">
                {activeScenario.notes?.map(note => (
                  <li key={note}>{note}</li>
                ))}
                {!activeScenario.notes?.length && <li>AI recommends finalizing lender submission to preserve Tier A approval.</li>}
              </ul>
            ) : (
              <p>Select a scenario to receive targeted coaching.</p>
            )}
          </AIInsightPanel>

          {predictions && (
            <AIInsightPanel
              title="Lender Intelligence"
              description="Probability-weighted lender matches ranked by funding speed."
              icon={<Target className="h-5 w-5" />}
              badgeText={`${Math.round(predictions.overallProbability * 100)}% overall`}
              badgeTone="primary"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-4">
                  <ProbabilityIndicator value={predictions.overallProbability} size="md" label="Approval" trend="up" />
                  <div className="text-sm text-muted-foreground">
                    <p>Expected funding window: <span className="font-medium text-foreground">{predictions.likelyFundingWindowHours} hours</span></p>
                    <p className="mt-1">Risk signals:</p>
                    <ul className="list-disc space-y-1 pl-5">
                      {predictions.riskSignals.map(signal => (
                        <li key={signal}>{signal}</li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="space-y-3">
                  {predictions.approvals.map(approval => (
                    <LenderRecommendationCard key={approval.lender} approval={approval} />
                  ))}
                </div>
              </div>
            </AIInsightPanel>
          )}

          {deal && (
            <AIInsightPanel
              title="History & Versions"
              description="Track how the pencil evolved during negotiations."
              icon={<History className="h-5 w-5" />}
              badgeText={`${deal.versions.length} versions`}
              badgeTone="neutral"
            >
              <div className="space-y-3">
                {deal.versions.map(version => {
                  const scenario = deal.scenarios.find(s => s.id === version.scenarioId);
                  const isCurrent = scenario?.id === activeScenario?.id;
                  return (
                    <div key={version.id} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-foreground">{scenario?.label ?? 'Scenario'}</span>
                        <div className="flex items-center gap-2">
                          {isCurrent && (
                            <Badge variant="secondary" data-testid="version-current-badge" className="text-xs">
                              Current
                            </Badge>
                          )}
                          <span className="text-xs text-muted-foreground">{new Date(version.createdAt).toLocaleString()}</span>
                        </div>
                      </div>
                      <p className="mt-2 text-sm text-muted-foreground">{version.summary}</p>
                      <p className="mt-1 text-xs text-muted-foreground">Created by {version.createdBy}</p>
                    </div>
                  );
                })}
              </div>
            </AIInsightPanel>
          )}

          {similarDeals && (
            <AIInsightPanel
              title="Similar Deals"
              description="Comparables from the last 90 days informing the pencil."
              icon={<Users className="h-5 w-5" />}
              badgeText={`${similarDeals.length} comps`}
              badgeTone="neutral"
            >
              <div className="space-y-3">
                {similarDeals.map(item => (
                  <div key={item.id} className="rounded-lg border border-border/60 bg-muted/30 p-3">
                    <p className="text-sm font-semibold text-foreground">{item.vehicle}</p>
                    <p className="text-xs text-muted-foreground">{item.customer} • {item.structure}</p>
                    <div className="mt-2 flex items-center justify-between text-sm">
                      <span>Payment {formatCurrency(item.payment)}</span>
                      <span>Close {Math.round(item.closeProbability * 100)}%</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">{item.highlights.join(' • ')}</p>
                  </div>
                ))}
              </div>
            </AIInsightPanel>
          )}

          {deal && (
            <AIInsightPanel
              title="Customer Signals"
              description="Engagement patterns and readiness indicators."
              icon={<LineChart className="h-5 w-5" />}
            >
              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Digital retail steps</p>
                  <p className="text-lg font-semibold text-foreground">7 of 8</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Appointment kept</p>
                  <p className="text-lg font-semibold text-foreground">Yes</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Trade equity</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(4800)}</p>
                </div>
                <div className="rounded-lg border border-border/70 bg-muted/30 p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Budget shared</p>
                  <p className="text-lg font-semibold text-foreground">{formatCurrency(620)} / mo</p>
                </div>
              </div>
            </AIInsightPanel>
          )}
        </aside>
      </div>

      <PencilPrintPreview
        open={printPreviewOpen}
        onOpenChange={setPrintPreviewOpen}
        deal={deal}
        scenario={activeScenario}
        predictions={predictions}
        similarDeals={similarDeals}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}
