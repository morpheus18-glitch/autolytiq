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
  Eye,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Share2,
  TrendingUp,
  TrendingDown,
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

// Real-time collaboration simulation
const ACTIVE_VIEWERS = [
  { id: '1', name: 'Sarah J.', role: 'F&I Manager', avatar: 'SJ', color: 'bg-blue-500' },
  { id: '2', name: 'Mike C.', role: 'Sales Manager', avatar: 'MC', color: 'bg-green-500' },
];

// Approval workflow stages
const APPROVAL_STAGES = [
  { id: 1, label: 'Sales Manager', status: 'completed', completedBy: 'Mike Chen', completedAt: '10:30 AM' },
  { id: 2, label: 'F&I Manager', status: 'current', user: 'Sarah Johnson' },
  { id: 3, label: 'General Manager', status: 'pending' },
  { id: 4, label: 'Lender Submission', status: 'pending' },
];

// Friction points detection
const FRICTION_POINTS = [
  { id: 1, type: 'warning', message: 'Payment $45/mo above customer budget', severity: 'medium' },
  { id: 2, type: 'info', message: 'Trade appraisal pending final inspection', severity: 'low' },
];

export default function DeskingWorkspace() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [printPreviewOpen, setPrintPreviewOpen] = useState(false);
  const [customerMode, setCustomerMode] = useState(false);
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
        maximumFractionDigits: 0,
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
      title: 'Saved',
      description: 'Deal structure saved.',
    });
  };

  const triggerOptimization = (action: 'initial' | 'customer-counter' | 'run-deal') => {
    optimizeDeal.mutate({ action });
  };

  // Calculate deal structure metrics
  const dealMetrics = useMemo(() => {
    if (!deal) return null;
    const frontGross = deal.vehicle.salePrice - deal.vehicle.msrp;
    const backGross = deal.gross.totalGross - frontGross;
    const totalGross = deal.gross.totalGross;
    const targetGross = deal.gross.targetGross;
    const variance = totalGross - targetGross;

    return { frontGross, backGross, totalGross, targetGross, variance };
  }, [deal]);

  return (
    <div className="mx-auto max-w-[1800px] px-4 py-4 space-y-4">
      {/* Header with collaboration indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-2xl font-bold text-foreground">Deal #{deal?.id || DEAL_ID}</h1>
              <Badge variant="outline" className="rounded-full">Live</Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              {deal?.customer.name} • {deal?.vehicle.year} {deal?.vehicle.make} {deal?.vehicle.model}
            </p>
          </div>

          {/* Real-time collaboration indicators */}
          <div className="flex items-center gap-2 ml-4">
            <Eye className="w-4 h-4 text-muted-foreground" />
            <div className="flex -space-x-2">
              {ACTIVE_VIEWERS.map((viewer) => (
                <div
                  key={viewer.id}
                  className={`w-8 h-8 rounded-full ${viewer.color} flex items-center justify-center text-white text-xs font-medium border-2 border-background`}
                  title={`${viewer.name} (${viewer.role})`}
                >
                  {viewer.avatar}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={customerMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCustomerMode(!customerMode)}
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            {customerMode ? 'Manager View' : 'Customer View'}
          </Button>
          <Button variant="outline" size="sm" className="gap-2" onClick={handleSaveWorkspace}>
            <Save className="w-4 h-4" />
            Save
          </Button>
          <Button size="sm" className="gap-2" onClick={() => setPrintPreviewOpen(true)}>
            <Printer className="w-4 h-4" />
            Print
          </Button>
        </div>
      </div>

      {/* Friction Alerts */}
      {FRICTION_POINTS.length > 0 && (
        <div className="flex gap-3">
          {FRICTION_POINTS.map((point) => (
            <div
              key={point.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm ${
                point.severity === 'medium'
                  ? 'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-800'
                  : 'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{point.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Main content grid */}
      <div className="grid grid-cols-12 gap-4">
        {/* Left column - Deal structure and scenarios */}
        <div className="col-span-8 space-y-4">
          {/* Visual Deal Structure */}
          {!customerMode && dealMetrics && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Deal Structure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4">
                  {/* Front Gross */}
                  <div className="text-center p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                    <p className="text-xs text-blue-600 dark:text-blue-400 mb-1">Front Gross</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {formatCurrency(dealMetrics.frontGross)}
                    </p>
                  </div>

                  {/* Back Gross */}
                  <div className="text-center p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800">
                    <p className="text-xs text-purple-600 dark:text-purple-400 mb-1">Back Gross</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {formatCurrency(dealMetrics.backGross)}
                    </p>
                  </div>

                  {/* Total Gross */}
                  <div className="text-center p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                    <p className="text-xs text-green-600 dark:text-green-400 mb-1">Total Gross</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {formatCurrency(dealMetrics.totalGross)}
                    </p>
                  </div>

                  {/* Target vs Actual */}
                  <div className={`text-center p-4 rounded-lg ${
                    dealMetrics.variance >= 0
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                      : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                  }`}>
                    <p className={`text-xs mb-1 ${
                      dealMetrics.variance >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}>
                      vs Target
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      {dealMetrics.variance >= 0 ? (
                        <TrendingUp className={`w-4 h-4 text-emerald-600 dark:text-emerald-400`} />
                      ) : (
                        <TrendingDown className={`w-4 h-4 text-red-600 dark:text-red-400`} />
                      )}
                      <p className={`text-2xl font-bold ${
                        dealMetrics.variance >= 0
                          ? 'text-emerald-700 dark:text-emerald-300'
                          : 'text-red-700 dark:text-red-300'
                      }`}>
                        {formatCurrency(Math.abs(dealMetrics.variance))}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Customer & Vehicle Info - Condensed */}
          {deal && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Customer</p>
                    <p className="font-semibold">{deal.customer.name}</p>
                    <Badge className="mt-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                      FICO {deal.customer.creditScore}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Vehicle</p>
                    <p className="font-semibold">{deal.vehicle.year} {deal.vehicle.make} {deal.vehicle.model}</p>
                    <p className="text-sm text-muted-foreground">Stock {deal.vehicle.stockNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Pricing</p>
                    <p className="font-semibold">{formatCurrency(deal.vehicle.salePrice)}</p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                      {formatCurrency(deal.vehicle.msrp - deal.vehicle.salePrice)} off MSRP
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Payment Scenarios */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Payment Options</h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => triggerOptimization('initial')}
                  disabled={optimizeDeal.isPending}
                  className="gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  AI Pencil
                </Button>
                <Button
                  size="sm"
                  onClick={() => triggerOptimization('run-deal')}
                  disabled={optimizeDeal.isPending}
                  className="gap-1.5"
                >
                  <GaugeCircle className="w-3.5 h-3.5" />
                  Submit
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {deal?.scenarios.map((scenario, index) => (
                <PaymentScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  isActive={scenario.id === activeScenario?.id}
                  onSelect={handleSelectScenario}
                  formatCurrency={formatCurrency}
                  dataTestId={`scenario-card-${index}`}
                />
              ))}
            </div>
          </div>

          {/* Approval Workflow */}
          {!customerMode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Approval Workflow</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  {APPROVAL_STAGES.map((stage, index) => (
                    <div key={stage.id} className="flex items-center flex-1">
                      <div className="flex-1">
                        <div
                          className={`p-3 rounded-lg border-2 ${
                            stage.status === 'completed'
                              ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                              : stage.status === 'current'
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/20'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {stage.status === 'completed' ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            ) : stage.status === 'current' ? (
                              <Clock className="w-4 h-4 text-blue-600 animate-pulse" />
                            ) : (
                              <Clock className="w-4 h-4 text-gray-400" />
                            )}
                            <span className="text-sm font-semibold">{stage.label}</span>
                          </div>
                          {stage.status === 'completed' && (
                            <p className="text-xs text-muted-foreground">
                              {stage.completedBy} • {stage.completedAt}
                            </p>
                          )}
                          {stage.status === 'current' && stage.user && (
                            <p className="text-xs text-blue-600 dark:text-blue-400">
                              Reviewing: {stage.user}
                            </p>
                          )}
                        </div>
                      </div>
                      {index < APPROVAL_STAGES.length - 1 && (
                        <ArrowRight className="w-5 h-5 text-gray-400 mx-2" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right column - Intelligence & Insights */}
        <div className="col-span-4 space-y-3">
          {/* Lender Intelligence - Compact */}
          {predictions && !customerMode && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Lender Match</CardTitle>
                  <Badge variant="outline">{Math.round(predictions.overallProbability * 100)}%</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {predictions.approvals.slice(0, 3).map(approval => (
                  <div key={approval.lender} className="p-3 rounded-lg bg-muted/50 border border-border">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-sm">{approval.lender}</span>
                      <Badge variant="secondary">{Math.round(approval.probability * 100)}%</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{approval.rate}% • {approval.term}mo</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* AI Coaching - Minimal */}
          {activeScenario && !customerMode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="w-4 h-4" />
                  AI Insights
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  {activeScenario.notes?.slice(0, 3).map((note, i) => (
                    <li key={i} className="flex gap-2">
                      <Lightbulb className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                      <span>{note}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Customer Signals - Compact */}
          {deal && !customerMode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Customer Readiness</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Steps</p>
                  <p className="font-semibold">7/8</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Equity</p>
                  <p className="font-semibold">{formatCurrency(4800)}</p>
                </div>
                <div className="p-2 rounded bg-muted/50">
                  <p className="text-xs text-muted-foreground">Budget</p>
                  <p className="font-semibold">{formatCurrency(620)}/mo</p>
                </div>
                <div className="p-2 rounded bg-green-50 dark:bg-green-900/20">
                  <p className="text-xs text-green-600 dark:text-green-400">Appointment</p>
                  <p className="font-semibold text-green-700 dark:text-green-300">Kept</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Similar Deals - Minimal */}
          {similarDeals && !customerMode && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Recent Comps</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {similarDeals.slice(0, 2).map(item => (
                  <div key={item.id} className="p-2 rounded-lg bg-muted/50 border border-border">
                    <p className="text-sm font-semibold">{item.vehicle}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs text-muted-foreground">{formatCurrency(item.payment)}/mo</span>
                      <span className="text-xs text-green-600 dark:text-green-400">
                        {Math.round(item.closeProbability * 100)}% close
                      </span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
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
