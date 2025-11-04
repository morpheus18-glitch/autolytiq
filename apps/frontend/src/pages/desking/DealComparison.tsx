import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { formatISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Sparkles, Printer, Save, ArrowRight, BarChart3 } from 'lucide-react';
import { useApprovalPredictions, useDeal, useOptimizeDeal, useSimilarDeals } from '@/features/desking/hooks';
import type { DeskingDeal, PaymentScenario } from '@/features/desking/types';
import PanelErrorBoundary from '@/components/desking/PanelErrorBoundary.tsx';
import PencilPrintPreview from '@/components/desking/PencilPrintPreview.tsx';

const DEAL_ID = 'demo-deal-001';

interface ScenarioInsight {
  scenario: PaymentScenario;
  aiScore: number;
  closeProbability: number;
  approvalProbability: number;
  grossDelta: number;
}

async function persistScenarioSelection(scenarioId: string) {
  try {
    await apiRequest('POST', `/api/desking/deals/${DEAL_ID}/selection`, { scenarioId });
  } catch (error) {
    console.warn('[DealComparison] unable to persist selection', error);
  }
}

export default function DealComparison() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: deal } = useDeal(DEAL_ID);
  const { data: approvals } = useApprovalPredictions(DEAL_ID);
  const { data: similarDeals } = useSimilarDeals(DEAL_ID);
  const optimizeDeal = useOptimizeDeal(DEAL_ID);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewScenario, setPreviewScenario] = useState<PaymentScenario | undefined>(undefined);

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [],
  );

  const scenarios = deal?.scenarios ?? [];

  const scenarioInsights: ScenarioInsight[] = useMemo(() => {
    if (!deal) {
      return [];
    }
    return scenarios.map(scenario => {
      const baseScore = scenario.badges?.includes('Recommended') ? 0.88 : scenario.isCustomerCounter ? 0.74 : 0.7;
      const approvalProbability = approvals?.approvals.find(item => item.lender === scenario.lender)?.probability ?? 0.67;
      const similarMatch = similarDeals?.find(item => item.structure.includes(`${scenario.termMonths}`));
      const closeProbability = similarMatch?.closeProbability ?? (scenario.isCustomerCounter ? 0.79 : 0.72);
      const grossDelta = deal.gross.totalGross - deal.gross.targetGross;
      return {
        scenario,
        aiScore: Math.min(0.99, baseScore + (approvalProbability - 0.7) * 0.2),
        approvalProbability,
        closeProbability,
        grossDelta,
      };
    });
  }, [approvals?.approvals, deal, scenarios, similarDeals]);

  const saveSelection = useMutation({
    mutationFn: (scenarioId: string) => persistScenarioSelection(scenarioId),
    onSuccess: () => {
      toast({ title: 'Scenario saved', description: 'Selection recorded and visible to the F&I team.' });
    },
    onError: error => {
      toast({ title: 'Unable to save scenario', description: (error as Error).message, variant: 'destructive' });
    },
  });

  const handleSelectScenario = (scenario: PaymentScenario) => {
    queryClient.setQueryData<DeskingDeal | undefined>(['desking', 'deal', DEAL_ID], current => {
      if (!current) {
        return current;
      }
      const timestamp = formatISO(new Date());
      return {
        ...current,
        versions: [
          {
            id: `v${current.versions.length + 1}`,
            createdAt: timestamp,
            createdBy: 'Desk Manager',
            scenarioId: scenario.id,
            summary: `Selected ${scenario.label} from comparison.`,
          },
          ...current.versions,
        ],
        activeScenarioId: scenario.id,
      };
    });
    saveSelection.mutate(scenario.id);
    setPreviewScenario(scenario);
    setPreviewOpen(true);
    toast({ title: 'Scenario selected', description: `${scenario.label} is now the active offer.` });
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (deal?.activeScenarioId) {
          saveSelection.mutate(deal.activeScenarioId);
        }
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        optimizeDeal.mutate({ action: 'run-deal' });
        toast({ title: 'Optimization requested', description: 'Generating an aggressive gross scenario.' });
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPreviewOpen(true);
        const active = scenarios.find(item => item.id === deal?.activeScenarioId);
        setPreviewScenario(active);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [deal?.activeScenarioId, optimizeDeal, saveSelection, scenarios, toast]);

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Badge className="rounded-full bg-primary/10 px-3 text-primary">Deal Comparison</Badge>
          <h1 className="text-3xl font-semibold text-foreground">Compare scenarios</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Side-by-side intelligence shows which structure balances gross protection, customer acceptance, and lender approvals.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => deal?.activeScenarioId && saveSelection.mutate(deal.activeScenarioId)}>
            {saveSelection.isPending ? <BarChart3 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save selection
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => optimizeDeal.mutate({ action: 'run-deal' })}>
            {optimizeDeal.isPending ? <BarChart3 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Optimize
          </Button>
          <Button className="gap-2" onClick={() => setPreviewOpen(true)}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <PanelErrorBoundary title="Scenario comparison">
        <div className="grid gap-4 lg:grid-cols-3">
          {scenarioInsights.map(({ scenario, aiScore, closeProbability, approvalProbability, grossDelta }) => (
            <Card key={scenario.id} className="flex flex-col border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">{scenario.label}</CardTitle>
                  <CardDescription>{scenario.notes?.[0] ?? 'AI generated structure'}</CardDescription>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  {scenario.termMonths} mos
                </Badge>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col justify-between gap-4 text-sm">
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex items-center justify-between text-foreground">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">Monthly</span>
                    <span className="text-lg font-semibold">{currency.format(scenario.monthlyPayment)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-muted-foreground">APR</span>
                      <p className="font-semibold text-foreground">{scenario.apr.toFixed(2)}%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Due at signing</span>
                      <p className="font-semibold text-foreground">{currency.format(scenario.totalDueAtSigning)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total of payments</span>
                      <p className="font-semibold text-foreground">{currency.format(scenario.totalOfPayments)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Cash down</span>
                      <p className="font-semibold text-foreground">{currency.format(scenario.cashDown)}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <Badge variant="outline">AI score {Math.round(aiScore * 100)}%</Badge>
                    <Badge variant="outline">Close {Math.round(closeProbability * 100)}%</Badge>
                    <Badge variant="outline">Approval {Math.round(approvalProbability * 100)}%</Badge>
                    <Badge variant={grossDelta >= 0 ? 'default' : 'secondary'}>
                      Gross {grossDelta >= 0 ? '+' : ''}
                      {currency.format(grossDelta)}
                    </Badge>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex flex-wrap gap-2">
                    {scenario.badges?.map(badge => (
                      <Badge key={badge} variant="secondary" className="bg-primary/10 text-primary">
                        {badge}
                      </Badge>
                    ))}
                  </div>
                  <Button className="gap-2" onClick={() => handleSelectScenario(scenario)}>
                    Select
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </PanelErrorBoundary>

      <PencilPrintPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        deal={deal}
        scenario={previewScenario ?? scenarios.find(item => item.id === deal?.activeScenarioId)}
        predictions={approvals}
        similarDeals={similarDeals}
        formatCurrency={value => currency.format(value)}
      />
    </div>
  );
}
