import { useCallback, useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui';
import { Input } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { useToast } from '@repo/ui';
import { apiRequest } from '@/lib/queryClient';
import { Loader2, MessageCircle, Save, Sparkles, Printer, ArrowUpRight, History } from 'lucide-react';
import { useDeal } from '@/features/desking/hooks';
import type { DeskingDeal, PaymentScenario } from '@/features/desking/types';
import PanelErrorBoundary from '@/components/desking/PanelErrorBoundary.tsx';
import PencilPrintPreview from '@/components/desking/PencilPrintPreview.tsx';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { Checkbox } from '@repo/ui';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@repo/ui';

const DEAL_ID = 'demo-deal-001';

interface CounterFormValues {
  customerAsk: string;
  paymentTarget: number;
  competitor: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
  objections: string;
  notes: string;
  selectedObjections: string[];
  sellingPrice: number;
}

interface CounterScenarioOption {
  id: string;
  label: string;
  summary: string;
  aiScore: number;
  closeProbability: number;
  approvalProbability: number;
  grossImpact: number;
  concession: string;
  scenario: PaymentScenario;
}

interface CounterAnalysisResponse {
  options: CounterScenarioOption[];
}

const defaultOptions: CounterScenarioOption[] = [
  {
    id: 'option-a',
    label: 'Option A • Maintain gross',
    summary: 'Extend to 75 months, move $400 from drive-off to rate to absorb budget gap.',
    aiScore: 0.82,
    closeProbability: 0.74,
    approvalProbability: 0.79,
    grossImpact: -175,
    concession: 'Term stretch + rate buydown',
    scenario: {
      id: 'counter-option-a',
      label: 'AI Counter 75 @ 5.84%',
      monthlyPayment: 589.14,
      apr: 5.84,
      termMonths: 75,
      totalDueAtSigning: 1800,
      totalOfPayments: 589.14 * 75,
      cashDown: 1500,
      badges: ['AI Recommended', 'Protects Gross'],
      notes: ['Term stretch retains payment in requested range.', 'Back-end reserve preserved with accessory bundle.'],
      version: 'pending',
    },
  },
  {
    id: 'option-b',
    label: 'Option B • Payment win',
    summary: 'Add $1000 loyalty rebate, hold term 72, match competitor payment.',
    aiScore: 0.77,
    closeProbability: 0.81,
    approvalProbability: 0.73,
    grossImpact: -425,
    concession: 'Stack loyalty + dealer cash',
    scenario: {
      id: 'counter-option-b',
      label: 'AI Counter 72 @ 5.49%',
      monthlyPayment: 572.31,
      apr: 5.49,
      termMonths: 72,
      totalDueAtSigning: 1500,
      totalOfPayments: 572.31 * 72,
      cashDown: 1000,
      badges: ['Customer Ask', 'Rebate Stack'],
      notes: ['Matches competitor quote while keeping trade equity positive.'],
      version: 'pending',
    },
  },
  {
    id: 'option-c',
    label: 'Option C • Equity builder',
    summary: 'Switch to 36-month lease with maintenance pack for fast turnover.',
    aiScore: 0.69,
    closeProbability: 0.6,
    approvalProbability: 0.83,
    grossImpact: 210,
    concession: 'Lease alternative',
    scenario: {
      id: 'counter-option-c',
      label: 'AI Lease Backup 36/12 @ 4.29%',
      monthlyPayment: 648.55,
      apr: 4.29,
      termMonths: 36,
      totalDueAtSigning: 3200,
      totalOfPayments: 648.55 * 36,
      cashDown: 2800,
      residual: 61400,
      badges: ['Lease Alternative', 'Equity Builder'],
      notes: ['Leverage maintenance to justify payment difference.'],
      version: 'pending',
    },
  },
];

const OBJECTION_OPTIONS = [
  { id: 'selling-price', label: 'Selling price gap' },
  { id: 'payment', label: 'Payment too high' },
  { id: 'trade', label: 'Trade allowance concern' },
  { id: 'rate', label: 'APR too high' },
];

async function requestCounterAnalysis(values: CounterFormValues): Promise<CounterAnalysisResponse> {
  try {
    const response = await apiRequest('POST', `/api/desking/deals/${DEAL_ID}/counter`, values);
    return (await response.json()) as CounterAnalysisResponse;
  } catch (error) {
    console.warn('[CustomerCounter] Falling back to default AI counter options', error);
    return { options: defaultOptions };
  }
}

async function persistCounterDraft(values: CounterFormValues) {
  try {
    await apiRequest('POST', `/api/desking/deals/${DEAL_ID}/counter/draft`, values);
  } catch (error) {
    console.warn('[CustomerCounter] Unable to persist draft to API', error);
  }
}

async function notifyCounterSelection(option: CounterScenarioOption) {
  try {
    await apiRequest('POST', `/api/desking/deals/${DEAL_ID}/counter/selection`, {
      optionId: option.id,
      scenarioId: option.scenario.id,
    });
  } catch (error) {
    console.warn('[CustomerCounter] Selection notification failed', error);
  }
}

export default function CustomerCounter() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: deal } = useDeal(DEAL_ID);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewScenario, setPreviewScenario] = useState<PaymentScenario | undefined>(undefined);
  const [historyOpen, setHistoryOpen] = useState(false);

  const form = useForm<CounterFormValues>({
    defaultValues: {
      customerAsk: 'We need to be under $580 with $1500 total out of pocket.',
      paymentTarget: 580,
      competitor: 'Lexus of Austin • $579 @ 72 / $0 down',
      urgency: 'HIGH',
      objections: 'Worried about payment and wants price protection if the order takes longer than 30 days.',
      notes: 'Customer loves the Escalade but is waiting on spouse approval. Highlight VIP delivery perks.',
      selectedObjections: [],
      sellingPrice: 0,
    },
  });

  const debouncedValues = useDebouncedValue(form.watch(), 450);

  const { data: analysis, isFetching, refetch } = useQuery({
    queryKey: ['desking', 'customer-counter', DEAL_ID, debouncedValues],
    queryFn: () => requestCounterAnalysis(debouncedValues),
  });

  const saveDraft = useMutation({
    mutationFn: (values: CounterFormValues) => persistCounterDraft(values),
    onSuccess: () => {
      toast({ title: 'Counter saved', description: 'Updates saved for collaboration with the desk manager.' });
    },
    onError: error => {
      toast({ title: 'Unable to save counter', description: (error as Error).message, variant: 'destructive' });
    },
  });

  const triggerAnalysis = useCallback(() => {
    toast({ title: 'Analyzing counter request', description: 'AI is refreshing customer counter options.' });
    refetch();
  }, [refetch, toast]);

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveDraft.mutate(form.getValues());
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        triggerAnalysis();
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPreviewOpen(true);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [form, saveDraft, triggerAnalysis]);

  const handleSelectOption = (option: CounterScenarioOption) => {
    queryClient.setQueryData<DeskingDeal | undefined>(['desking', 'deal', DEAL_ID], current => {
      if (!current) {
        return current;
      }
      const timestamp = formatISO(new Date());
      const versionId = `v${current.versions.length + 1}`;
      const scenario: PaymentScenario = { ...option.scenario, version: versionId };
      return {
        ...current,
        scenarios: [scenario, ...current.scenarios],
        versions: [
          {
            id: versionId,
            createdAt: timestamp,
            createdBy: 'Customer Counter',
            scenarioId: scenario.id,
            summary: option.summary,
          },
          ...current.versions,
        ],
        activeScenarioId: scenario.id,
      };
    });
    setPreviewScenario({ ...option.scenario, version: option.scenario.version ?? 'latest' });
    setPreviewOpen(true);
    toast({ title: 'Counter option selected', description: `${option.label} saved to history.` });
    notifyCounterSelection(option);
  };

  const options = analysis?.options ?? defaultOptions;

  const recommendedOptionId = useMemo(() => {
    if (!options.length) {
      return undefined;
    }
    return options.reduce((best, current) => (current.aiScore > best.aiScore ? current : best)).id;
  }, [options]);

  const formatCurrency = useMemo(
    () =>
      new Intl.NumberFormat(undefined, {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 2,
      }),
    [],
  );

  const handleRunAnalysis = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    triggerAnalysis();
  };

  const handlePreviewSave = () => {
    toast({ title: 'Scenario saved to deal', description: 'Counter recommendation shared with the desk team.' });
  };

  return (
    <div className="mx-auto max-w-[1400px] space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Badge className="rounded-full bg-primary/10 px-3 text-primary">Customer Counter</Badge>
          <h1 className="text-3xl font-semibold text-foreground">Capture and solve the counter</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Document the customer&apos;s request and let AI produce counter structures that balance gross, approval, and payment expectations.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => saveDraft.mutate(form.getValues())}>
            {saveDraft.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={triggerAnalysis}
            data-testid="counter-run-analysis"
          >
            <Sparkles className="h-4 w-4" />
            Optimize
          </Button>
          <Button className="gap-2" onClick={() => setPreviewOpen(true)}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
          <Button variant="ghost" className="gap-2" onClick={() => setHistoryOpen(true)} data-testid="panel-history-open">
            <History className="h-4 w-4" />
            View history
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form
          className="grid gap-6 xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]"
          onSubmit={handleRunAnalysis}
          data-testid="counter-form"
        >
          <PanelErrorBoundary title="Customer ask">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start gap-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-semibold text-foreground">Customer ask</CardTitle>
                  <CardDescription>Capture the objection and motivation in their words.</CardDescription>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerAsk"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Customer statement</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="selectedObjections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Key objections</FormLabel>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {OBJECTION_OPTIONS.map(option => {
                          const checked = field.value?.includes(option.id) ?? false;
                          return (
                            <label
                              key={option.id}
                              className="flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                            >
                              <Checkbox
                                checked={checked}
                                onCheckedChange={value => {
                                  const next = new Set(field.value ?? []);
                                  if (value === true) {
                                    next.add(option.id);
                                  } else {
                                    next.delete(option.id);
                                  }
                                  field.onChange(Array.from(next));
                                }}
                                data-testid={`obj-${option.id}`}
                              />
                              <span className="text-foreground">{option.label}</span>
                            </label>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="paymentTarget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Payment target</FormLabel>
                        <FormControl>
                          <Input type="number" inputMode="decimal" {...field} onChange={event => field.onChange(Number(event.target.value) || 0)} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="sellingPrice"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requested selling price</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            inputMode="decimal"
                            {...field}
                            data-testid="counter-selling-price"
                            onChange={event => field.onChange(Number(event.target.value) || 0)}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="competitor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Competitor quote</FormLabel>
                        <FormControl>
                          <Input placeholder="Dealer • Structure" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="urgency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Urgency</FormLabel>
                        <FormControl>
                          <select
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                            value={field.value}
                            onChange={event => field.onChange(event.target.value as CounterFormValues['urgency'])}
                            data-testid="urgency-level"
                          >
                            <option value="HIGH">High — needs decision today</option>
                            <option value="MEDIUM">Medium — deciding this week</option>
                            <option value="LOW">Low — exploratory</option>
                          </select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Internal notes</FormLabel>
                        <FormControl>
                          <Textarea rows={2} {...field} data-testid="counter-notes" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="objections"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary objections</FormLabel>
                      <FormControl>
                        <Textarea rows={3} {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </PanelErrorBoundary>

          <PanelErrorBoundary title="Counter intelligence">
            <Card className="border-border/70 shadow-sm">
              <CardHeader className="flex flex-row items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-base font-semibold text-foreground">AI counter options</CardTitle>
                  <CardDescription>Pick an option to create a new version instantly.</CardDescription>
                </div>
                {isFetching && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
              </CardHeader>
              <CardContent className="grid gap-4" data-testid="counter-options-grid">
                {options.map(option => (
                  <Card
                    key={option.id}
                    className="border border-border/60 bg-muted/30 p-4"
                    data-testid={option.id === recommendedOptionId ? 'counter-option-recommended' : undefined}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-2">
                        <h3 className="text-sm font-semibold text-foreground">{option.label}</h3>
                        <p className="text-xs text-muted-foreground">{option.summary}</p>
                        <div className="flex flex-wrap gap-2 text-xs">
                          <Badge variant="outline">AI score {Math.round(option.aiScore * 100)}%</Badge>
                          <Badge variant="outline">Close {Math.round(option.closeProbability * 100)}%</Badge>
                          <Badge variant="outline">Approval {Math.round(option.approvalProbability * 100)}%</Badge>
                          <Badge variant={option.grossImpact >= 0 ? 'default' : 'secondary'}>
                            Gross {option.grossImpact >= 0 ? '+' : ''}
                            {formatCurrency.format(option.grossImpact)}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">{formatCurrency.format(option.scenario.monthlyPayment)}</p>
                        <p>{option.scenario.termMonths} mos • {option.scenario.apr.toFixed(2)}%</p>
                        <p>Due at signing {formatCurrency.format(option.scenario.totalDueAtSigning)}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-muted-foreground">{option.concession}</span>
                      <Button size="sm" className="gap-2" onClick={() => handleSelectOption(option)} data-testid="select-option">
                        Select option
                        <ArrowUpRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  className="mt-2 w-full justify-center gap-2"
                  onClick={() => {
                    const fallbackScenario = deal?.scenarios[0] ?? options[0]?.scenario;
                    if (fallbackScenario) {
                      setPreviewScenario(fallbackScenario);
                      setPreviewOpen(true);
                    }
                  }}
                  data-testid="generate-new-pencil"
                >
                  Generate new pencil
                  <ArrowUpRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </PanelErrorBoundary>
        </form>
      </Form>

      <Dialog open={historyOpen} onOpenChange={setHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            {(deal?.versions ?? []).length === 0 ? (
              <p className="text-sm text-muted-foreground">No history available yet.</p>
            ) : (
              deal?.versions.map((version, index) => {
                const linkedScenario = deal?.scenarios.find(scenario => scenario.id === version.scenarioId);
                return (
                  <div
                    key={version.id}
                    className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm"
                    data-testid={index === 0 ? 'history-version-latest' : undefined}
                  >
                    <p className="font-semibold text-foreground">{linkedScenario?.label ?? version.summary}</p>
                    <p className="text-xs text-muted-foreground">{new Date(version.createdAt).toLocaleString()}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{version.summary}</p>
                    <p className="mt-1 text-xs text-muted-foreground">By {version.createdBy}</p>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>

      <PencilPrintPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        deal={deal}
        scenario={previewScenario}
        predictions={undefined}
        similarDeals={undefined}
        formatCurrency={value => formatCurrency.format(value)}
        onSaveToDeal={handlePreviewSave}
      />
    </div>
  );
}
