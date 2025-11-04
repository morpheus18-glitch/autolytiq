import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { CheckCircle2, Sparkles, Printer, Save } from 'lucide-react';
import { useApprovalPredictions, useDeal, useSimilarDeals } from '@/features/desking/hooks';
import PencilPrintPreview from '@/components/desking/PencilPrintPreview.tsx';
import PanelErrorBoundary from '@/components/desking/PanelErrorBoundary.tsx';

const DEAL_ID = 'demo-deal-001';

interface LenderRow {
  lender: string;
  probability: number;
  recommendedTier: string;
  estimatedRate: number;
  reserve: number;
  stipulations: string[];
  avgFundingTimeDays: number;
}

async function submitApprovals(lenderIds: string[]) {
  try {
    await apiRequest('POST', `/api/desking/deals/${DEAL_ID}/approvals/submit`, { lenderIds });
  } catch (error) {
    console.warn('[ApprovalAnalysis] unable to submit approvals to API', error);
  }
}

export default function ApprovalAnalysis() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { data: deal } = useDeal(DEAL_ID);
  const { data: predictions } = useApprovalPredictions(DEAL_ID);
  const { data: similarDeals } = useSimilarDeals(DEAL_ID);
  const [selectedLenders, setSelectedLenders] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);

  const lenders: LenderRow[] = useMemo(() => {
    if (!predictions) {
      return [];
    }
    return predictions.approvals.map(approval => {
      const recommendedTier = approval.probability > 0.8 ? 'Tier A' : approval.probability > 0.65 ? 'Tier B' : 'Tier C';
      const estimatedRate = approval.probability > 0.8 ? 5.49 : approval.probability > 0.7 ? 5.99 : 6.49;
      const reserve = Math.max(0.8, 1.8 - (approval.probability - 0.6) * 1.5);
      const stipulations = approval.highlights.length > 0 ? approval.highlights : ['Standard proof of income and residence'];
      return {
        lender: approval.lender,
        probability: approval.probability,
        recommendedTier,
        estimatedRate,
        reserve,
        stipulations,
        avgFundingTimeDays: approval.avgFundingTimeDays,
      };
    });
  }, [predictions]);

  useEffect(() => {
    if (lenders.length && selectedLenders.length === 0) {
      setSelectedLenders([lenders[0].lender]);
    }
  }, [lenders, selectedLenders.length]);

  const submitSelection = useMutation({
    mutationFn: (lendersToSubmit: string[]) => submitApprovals(lendersToSubmit),
    onSuccess: (_, lendersToSubmit) => {
      toast({
        title: 'Submission sent',
        description: `Submitted to ${lendersToSubmit.length} lender${lendersToSubmit.length === 1 ? '' : 's'}.`,
      });
    },
    onError: error => {
      toast({ title: 'Submission failed', description: (error as Error).message, variant: 'destructive' });
    },
  });

  const toggleLender = (lender: string) => {
    setSelectedLenders(current =>
      current.includes(lender) ? current.filter(item => item !== lender) : [...current, lender],
    );
  };

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        if (selectedLenders.length) {
          submitSelection.mutate(selectedLenders);
        }
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        if (lenders.length) {
          setSelectedLenders([lenders[0].lender]);
          toast({ title: 'Optimized lender focus', description: `AI recommends starting with ${lenders[0].lender}.` });
        }
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPreviewOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lenders, selectedLenders, submitSelection, toast]);

  const handleSubmitSelected = () => {
    submitSelection.mutate(selectedLenders);
    navigate('/finance/lenders');
  };

  const handleSubmitAll = () => {
    const allLenders = lenders.map(lender => lender.lender);
    submitSelection.mutate(allLenders);
    navigate('/fi-dashboard');
  };

  const currency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [],
  );

  return (
    <div className="mx-auto max-w-[1200px] space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Badge className="rounded-full bg-primary/10 px-3 text-primary">Approval Outlook</Badge>
          <h1 className="text-3xl font-semibold text-foreground">Approval analysis</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Prioritize lenders based on probability, tier recommendations, and AI-predicted stipulations before submitting to F&I.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => submitSelection.mutate(selectedLenders)} disabled={!selectedLenders.length}>
            {submitSelection.isPending ? <CheckCircle2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => lenders.length && setSelectedLenders([lenders[0].lender])}>
            <Sparkles className="h-4 w-4" />
            Optimize
          </Button>
          <Button className="gap-2" onClick={() => setPreviewOpen(true)}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <PanelErrorBoundary title="Approval pathways">
        <Card className="border-border/70 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-foreground">Lender recommendations</CardTitle>
            <CardDescription>Focus on lenders with the highest probability of fast funding and strong reserves.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10"></TableHead>
                  <TableHead>Lender</TableHead>
                  <TableHead>Probability</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Rate</TableHead>
                  <TableHead>Reserve</TableHead>
                  <TableHead>Funding</TableHead>
                  <TableHead>Likely stipulations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lenders.map(lender => {
                  const isSelected = selectedLenders.includes(lender.lender);
                  return (
                    <TableRow key={lender.lender} className={isSelected ? 'bg-primary/5' : undefined}>
                      <TableCell>
                        <Checkbox checked={isSelected} onCheckedChange={() => toggleLender(lender.lender)} />
                      </TableCell>
                      <TableCell className="font-medium text-foreground">{lender.lender}</TableCell>
                      <TableCell>{Math.round(lender.probability * 100)}%</TableCell>
                      <TableCell>{lender.recommendedTier}</TableCell>
                      <TableCell>{lender.estimatedRate.toFixed(2)}%</TableCell>
                      <TableCell>{lender.reserve.toFixed(2)}%</TableCell>
                      <TableCell>{lender.avgFundingTimeDays.toFixed(1)} days</TableCell>
                      <TableCell>
                        <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                          {lender.stipulations.map(item => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
          <CardContent className="flex flex-wrap items-center justify-end gap-3 border-t border-border/70 bg-muted/30">
            <Button variant="outline" disabled={!selectedLenders.length} onClick={handleSubmitSelected}>
              Submit selected
            </Button>
            <Button onClick={handleSubmitAll} disabled={!lenders.length}>
              Submit all
            </Button>
          </CardContent>
        </Card>
      </PanelErrorBoundary>

      <PencilPrintPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        deal={deal}
        scenario={deal?.scenarios.find(item => item.id === deal.activeScenarioId)}
        predictions={predictions}
        similarDeals={similarDeals}
        formatCurrency={value => currency.format(value)}
      />
    </div>
  );
}
