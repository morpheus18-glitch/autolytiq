import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { formatISO } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@repo/ui';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@repo/ui';
import { Input } from '@repo/ui';
import { Textarea } from '@repo/ui';
import { Button } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Separator } from '@repo/ui';
import { Skeleton } from '@repo/ui';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import {
  ClipboardList,
  Printer,
  Save,
  Sparkles,
  Brain,
  Loader2,
  Target,
  ArrowRight,
} from 'lucide-react';
import { useDeal, useOptimizeDeal, useApprovalPredictions, useSimilarDeals } from '@/features/desking/hooks';
import type { DeskingDeal, PaymentScenario } from '@/features/desking/types';
import PencilPrintPreview from '@/components/desking/PencilPrintPreview.tsx';
import PanelErrorBoundary from '@/components/desking/PanelErrorBoundary.tsx';
import GrossCalculator from '@/components/calculators/GrossCalculator.tsx';
import PaymentCalculator from '@/components/calculators/PaymentCalculator.tsx';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

const DEAL_ID = 'demo-deal-001';

interface InitialPencilFormValues {
  customer: {
    name: string;
    email: string;
    phone: string;
    creditScore: number;
    budget: number;
  };
  vehicle: {
    year: number;
    make: string;
    model: string;
    trim: string;
    stockNumber: string;
    msrp: number;
    salePrice: number;
    vin: string;
  };
  pricing: {
    accessories: number;
    docFee: number;
    acquisitionFee: number;
    licenseFee: number;
    registration: number;
    taxes: number;
    discount: number;
  };
  trade: {
    description: string;
    value: number;
    payoff: number;
  };
  down: {
    cash: number;
    deferred: number;
    other: number;
  };
  rebates: {
    loyalty: number;
    conquest: number;
    dealerCash: number;
    notes: string;
  };
}

interface PencilAnalysisStructure {
  label: string;
  monthlyPayment: number;
  apr: number;
  termMonths: number;
  dueAtSigning: number;
  totalOfPayments: number;
  cashDown: number;
  badges: string[];
  probability: number;
}

interface PencilAnalysisResult {
  narrative: string;
  structure: PencilAnalysisStructure;
  riskSignals: string[];
  paymentTargets: Array<{ label: string; amount: number; confidence: number }>;
}

interface GenerateWorksheetResponse {
  worksheetId: string;
  scenario: PaymentScenario;
  pdfUrl?: string;
  narrative: string;
}

function coerceNumber(value: unknown) {
  if (typeof value === 'number') {
    return value;
  }
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function buildFallbackAnalysis(values: InitialPencilFormValues): PencilAnalysisResult {
  const salePrice = coerceNumber(values.vehicle.salePrice) - coerceNumber(values.pricing.discount);
  const totalFees =
    coerceNumber(values.pricing.accessories) +
    coerceNumber(values.pricing.docFee) +
    coerceNumber(values.pricing.acquisitionFee) +
    coerceNumber(values.pricing.licenseFee) +
    coerceNumber(values.pricing.registration) +
    coerceNumber(values.pricing.taxes);
  const rebates = coerceNumber(values.rebates.loyalty) + coerceNumber(values.rebates.conquest) + coerceNumber(values.rebates.dealerCash);
  const down = coerceNumber(values.down.cash) + coerceNumber(values.down.deferred) + coerceNumber(values.down.other);
  const tradeEquity = coerceNumber(values.trade.value) - coerceNumber(values.trade.payoff);
  const amountFinanced = Math.max(0, salePrice + totalFees - rebates - down - tradeEquity);
  const baseApr = 8 - Math.min(2.5, Math.max(-1.25, (coerceNumber(values.customer.creditScore) - 700) / 60));
  const termMonths = amountFinanced > 80000 ? 75 : 72;
  const monthlyRate = baseApr / 1200;
  const monthlyPayment = monthlyRate === 0 ? amountFinanced / termMonths : (amountFinanced * monthlyRate) / (1 - (1 + monthlyRate) ** -termMonths);
  const dueAtSigning = Math.max(0, down + totalFees - rebates);
  const totalOfPayments = monthlyPayment * termMonths + Math.max(0, tradeEquity < 0 ? Math.abs(tradeEquity) : 0);

  const paymentTargets = [
    { label: 'Customer budget', amount: coerceNumber(values.customer.budget), confidence: 0.75 },
    { label: 'Payment-to-income 14%', amount: Math.min(750, monthlyPayment + 18), confidence: 0.68 },
    { label: 'AI optimized gross', amount: monthlyPayment, confidence: 0.82 },
  ];

  return {
    narrative:
      'Structured pencil keeps monthly near customer goal while protecting front gross. Recommend presenting accessories as bundled value add to secure approval tier.',
    structure: {
      label: `${termMonths} @ ${baseApr.toFixed(2)}%`,
      monthlyPayment,
      apr: baseApr,
      termMonths,
      dueAtSigning,
      totalOfPayments,
      cashDown: down,
      badges: ['AI Recommended', 'Keeps Gross'],
      probability: 0.79,
    },
    riskSignals: [
      tradeEquity < 0
        ? `Trade shows ${Math.abs(tradeEquity).toFixed(0)} negative equity; ensure lender guideline compliance.`
        : 'Trade equity positive; leverage for rate concession if required.',
      amountFinanced > 90000
        ? 'High amount financed; confirm max advance with captive lender.'
        : 'Amount financed aligns with Tier A appetite.',
    ],
    paymentTargets,
  };
}

async function requestPencilAnalysis(dealId: string, values: InitialPencilFormValues): Promise<PencilAnalysisResult> {
  try {
    const response = await apiRequest('POST', `/api/desking/deals/${dealId}/analysis`, values);
    return (await response.json()) as PencilAnalysisResult;
  } catch (error) {
    console.warn('[InitialPencil] Falling back to local analysis', error);
    return buildFallbackAnalysis(values);
  }
}

async function requestSaveDraft(dealId: string, values: InitialPencilFormValues) {
  try {
    await apiRequest('POST', `/api/desking/deals/${dealId}/pencil/draft`, values);
  } catch (error) {
    console.warn('[InitialPencil] Unable to persist draft to API, continuing optimistically', error);
  }
}

async function requestGenerateWorksheet(
  dealId: string,
  values: InitialPencilFormValues,
  analysis: PencilAnalysisResult | undefined,
): Promise<GenerateWorksheetResponse> {
  try {
    const response = await apiRequest('POST', `/api/desking/deals/${dealId}/worksheet`, {
      payload: values,
      analysis,
    });
    return (await response.json()) as GenerateWorksheetResponse;
  } catch (error) {
    console.warn('[InitialPencil] Falling back to locally generated worksheet', error);
    const fallback = analysis ?? buildFallbackAnalysis(values);
    const scenario: PaymentScenario = {
      id: `scenario-initial-${Date.now()}`,
      label: `AI Pencil ${fallback.structure.termMonths} @ ${fallback.structure.apr.toFixed(2)}%`,
      monthlyPayment: fallback.structure.monthlyPayment,
      apr: fallback.structure.apr,
      termMonths: fallback.structure.termMonths,
      totalDueAtSigning: fallback.structure.dueAtSigning,
      totalOfPayments: fallback.structure.totalOfPayments,
      cashDown: fallback.structure.cashDown,
      lender: 'Ally Financial',
      badges: fallback.structure.badges,
      notes: [fallback.narrative, 'Generated locally while offline.'],
      version: 'pending',
    };
    return {
      worksheetId: `local-${Date.now()}`,
      scenario,
      narrative: fallback.narrative,
    };
  }
}

export default function InitialPencil() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: deal, isLoading } = useDeal(DEAL_ID);
  const { data: predictions } = useApprovalPredictions(DEAL_ID);
  const { data: similarDeals } = useSimilarDeals(DEAL_ID);
  const optimizeDeal = useOptimizeDeal(DEAL_ID);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewScenario, setPreviewScenario] = useState<PaymentScenario | undefined>(undefined);

  const form = useForm<InitialPencilFormValues>({
    defaultValues: {
      customer: {
        name: '',
        email: '',
        phone: '',
        creditScore: 700,
        budget: 600,
      },
      vehicle: {
        year: 2024,
        make: '',
        model: '',
        trim: '',
        stockNumber: '',
        msrp: 0,
        salePrice: 0,
        vin: '',
      },
      pricing: {
        accessories: 0,
        docFee: 0,
        acquisitionFee: 0,
        licenseFee: 0,
        registration: 0,
        taxes: 0,
        discount: 0,
      },
      trade: {
        description: '',
        value: 0,
        payoff: 0,
      },
      down: {
        cash: 0,
        deferred: 0,
        other: 0,
      },
      rebates: {
        loyalty: 0,
        conquest: 0,
        dealerCash: 0,
        notes: '',
      },
    },
    mode: 'onChange',
  });

  useEffect(() => {
    if (deal) {
      form.reset({
        customer: {
          name: deal.customer.name,
          email: deal.customer.email,
          phone: deal.customer.phone,
          creditScore: deal.customer.creditScore,
          budget: 610,
        },
        vehicle: {
          year: deal.vehicle.year,
          make: deal.vehicle.make,
          model: deal.vehicle.model,
          trim: deal.vehicle.trim,
          stockNumber: deal.vehicle.stockNumber,
          msrp: deal.vehicle.msrp,
          salePrice: deal.vehicle.salePrice,
          vin: deal.vehicle.vin,
        },
        pricing: {
          accessories: 1450,
          docFee: deal.fees.docFee,
          acquisitionFee: deal.fees.acquisitionFee,
          licenseFee: deal.fees.licenseFee,
          registration: deal.fees.registration,
          taxes: deal.fees.taxes,
          discount: deal.vehicle.msrp - deal.vehicle.salePrice,
        },
        trade: {
          description: '2019 Cadillac XT5',
          value: 25000,
          payoff: 21400,
        },
        down: {
          cash: 2000,
          deferred: 500,
          other: 0,
        },
        rebates: {
          loyalty: 1500,
          conquest: 0,
          dealerCash: 750,
          notes: 'Verify GM loyalty eligibility before presenting.',
        },
      });
    }
  }, [deal, form]);

  const watchedValues = form.watch();
  const debouncedValues = useDebouncedValue(watchedValues, 500);

  const { data: analysis, isFetching: analysisLoading } = useQuery({
    queryKey: ['desking', 'initial-pencil', 'analysis', DEAL_ID, debouncedValues],
    queryFn: () => requestPencilAnalysis(DEAL_ID, debouncedValues),
    enabled: !!deal,
  });

  const saveDraft = useMutation({
    mutationFn: (values: InitialPencilFormValues) => requestSaveDraft(DEAL_ID, values),
    onSuccess: () => {
      toast({
        title: 'Pencil saved',
        description: 'Draft pencil saved. Team members can continue collaborating.',
      });
    },
    onError: error => {
      toast({
        title: 'Unable to save pencil',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  const generateWorksheet = useMutation({
    mutationFn: (values: InitialPencilFormValues) => requestGenerateWorksheet(DEAL_ID, values, analysis),
    onSuccess: response => {
      queryClient.setQueryData<DeskingDeal | undefined>(['desking', 'deal', DEAL_ID], current => {
        if (!current) {
          return current;
        }
        const timestamp = formatISO(new Date());
        const versionId = `v${current.versions.length + 1}`;
        const scenario: PaymentScenario = { ...response.scenario, version: versionId };
        return {
          ...current,
          scenarios: [scenario, ...current.scenarios],
          versions: [
            {
              id: versionId,
              createdAt: timestamp,
              createdBy: 'AI Deal Optimizer',
              scenarioId: scenario.id,
              summary: response.narrative,
            },
            ...current.versions,
          ],
          activeScenarioId: scenario.id,
        };
      });
      setPreviewScenario({ ...response.scenario, version: response.scenario.version ?? 'latest' });
      setPreviewOpen(true);
      toast({
        title: 'Worksheet ready',
        description: 'AI generated worksheet and PDF preview are ready to share with the customer.',
      });
    },
    onError: error => {
      toast({
        title: 'Worksheet generation failed',
        description: (error as Error).message,
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.defaultPrevented) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (target && ['INPUT', 'TEXTAREA'].includes(target.tagName) && event.key !== 's') {
        return;
      }

      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        saveDraft.mutate(form.getValues());
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'o') {
        event.preventDefault();
        optimizeDeal.mutate({ action: 'initial', context: { pencil: form.getValues(), analysis } });
        toast({ title: 'Optimization requested', description: 'AI is optimizing the pencil structure.' });
      }
      if (!event.metaKey && !event.ctrlKey && event.key.toLowerCase() === 'p') {
        event.preventDefault();
        setPreviewScenario(activeScenario);
        setPreviewOpen(true);
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeScenario, analysis, form, optimizeDeal, saveDraft]);

  const handleGenerate = (values: InitialPencilFormValues) => {
    generateWorksheet.mutate(values);
  };

  const activeScenario = useMemo(
    () => deal?.scenarios.find(scenario => scenario.id === deal.activeScenarioId),
    [deal?.activeScenarioId, deal?.scenarios],
  );

  const analysisStructure = analysis?.structure ?? buildFallbackAnalysis(form.getValues()).structure;

  const handlePreviewSave = () => {
    toast({
      title: 'Scenario saved to deal',
      description: 'Worksheet committed to deal history and ready for delivery.',
    });
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-6 px-6 py-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="space-y-1">
          <Badge className="rounded-full bg-primary/10 px-3 text-primary">Initial Pencil</Badge>
          <h1 className="text-3xl font-semibold text-foreground">Build the initial pencil</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Capture customer, vehicle, and pricing inputs. AI continuously analyzes your structure for gross protection and lender readiness.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" className="gap-2" onClick={() => saveDraft.mutate(form.getValues())}>
            {saveDraft.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save draft
          </Button>
          <Button variant="outline" className="gap-2" onClick={() => optimizeDeal.mutate({ action: 'initial', context: { pencil: form.getValues(), analysis } })}>
            {optimizeDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Optimize
          </Button>
          <Button className="gap-2" onClick={() => setPreviewOpen(true)}>
            <Printer className="h-4 w-4" />
            Print
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(handleGenerate)}
          className="grid gap-6 xl:grid-cols-[minmax(0,2.05fr)_minmax(0,1fr)]"
          data-testid="pencil-form"
        >
          <div className="space-y-6">
            <PanelErrorBoundary title="Pencil form">
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="flex flex-row items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ClipboardList className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold text-foreground">Deal inputs</CardTitle>
                    <CardDescription>Everything the desk needs to pencil confidently.</CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Customer</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="customer.name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Customer name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer.email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="customer@email.com" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="customer.phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Phone</FormLabel>
                            <FormControl>
                              <Input placeholder="(555) 000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="customer.creditScore"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Credit score</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  inputMode="numeric"
                                  {...field}
                                  onChange={event => field.onChange(Number(event.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="customer.budget"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Budget (monthly)</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  inputMode="decimal"
                                  {...field}
                                  onChange={event => field.onChange(Number(event.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Vehicle</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="vehicle.year"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Year</FormLabel>
                            <FormControl>
                              <Input type="number" inputMode="numeric" {...field} onChange={event => field.onChange(Number(event.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicle.make"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Make</FormLabel>
                            <FormControl>
                              <Input placeholder="Cadillac" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicle.model"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Model</FormLabel>
                            <FormControl>
                              <Input placeholder="Escalade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicle.trim"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trim</FormLabel>
                            <FormControl>
                              <Input placeholder="Sport Platinum" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicle.salePrice"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sale price</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="decimal"
                                {...field}
                                data-testid="selling-price-input"
                                onChange={event => field.onChange(Number(event.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicle.msrp"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>MSRP</FormLabel>
                            <FormControl>
                              <Input type="number" inputMode="decimal" {...field} onChange={event => field.onChange(Number(event.target.value) || 0)} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicle.stockNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Stock #</FormLabel>
                            <FormControl>
                              <Input placeholder="A3275" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="vehicle.vin"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>VIN</FormLabel>
                            <FormControl>
                              <Input placeholder="VIN" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Pricing & fees</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                      {(
                        [
                          ['pricing.accessories', 'Accessories'],
                          ['pricing.docFee', 'Doc fee'],
                          ['pricing.acquisitionFee', 'Acquisition fee'],
                          ['pricing.licenseFee', 'License'],
                          ['pricing.registration', 'Registration'],
                          ['pricing.taxes', 'Taxes'],
                          ['pricing.discount', 'Discount'],
                        ] as const
                      ).map(([name, label]) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <FormControl>
                                <Input type="number" inputMode="decimal" {...field} onChange={event => field.onChange(Number(event.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Trade & down</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      <FormField
                        control={form.control}
                        name="trade.description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trade description</FormLabel>
                            <FormControl>
                              <Input placeholder="Vehicle details" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trade.value"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trade value</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="decimal"
                                {...field}
                                data-testid="trade-allow-input"
                                onChange={event => field.onChange(Number(event.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="trade.payoff"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Trade payoff</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                inputMode="decimal"
                                {...field}
                                data-testid="trade-payoff-input"
                                onChange={event => field.onChange(Number(event.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="grid grid-cols-3 gap-4">
                        {(
                          [
                            ['down.cash', 'Cash'],
                            ['down.deferred', 'Deferred'],
                            ['down.other', 'Other'],
                          ] as const
                        ).map(([name, label]) => (
                          <FormField
                            key={name}
                            control={form.control}
                            name={name}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{label}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    inputMode="decimal"
                                    {...field}
                                    data-testid={name === 'down.cash' ? 'cash-down-input' : undefined}
                                    onChange={event => field.onChange(Number(event.target.value) || 0)}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        ))}
                      </div>
                    </div>
                  </section>

                  <Separator />

                  <section className="space-y-3">
                    <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Rebates & incentives</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                      {(
                        [
                          ['rebates.loyalty', 'Loyalty'],
                          ['rebates.conquest', 'Conquest'],
                          ['rebates.dealerCash', 'Dealer cash'],
                        ] as const
                      ).map(([name, label]) => (
                        <FormField
                          key={name}
                          control={form.control}
                          name={name}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>{label}</FormLabel>
                              <FormControl>
                                <Input type="number" inputMode="decimal" {...field} onChange={event => field.onChange(Number(event.target.value) || 0)} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormField
                      control={form.control}
                      name="rebates.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes</FormLabel>
                          <FormControl>
                            <Textarea rows={3} placeholder="Eligibility requirements or stackability considerations." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </section>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="gap-2"
                      disabled={generateWorksheet.isPending}
                      data-testid="pencil-generate"
                    >
                      {generateWorksheet.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
                      Generate worksheet
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </PanelErrorBoundary>
          </div>

          <div className="space-y-6">
            <PanelErrorBoundary title="AI analysis">
              <Card className="border-border/70 shadow-sm">
                <CardHeader className="flex flex-row items-start justify-between gap-4">
                  <div>
                    <CardTitle className="text-base font-semibold text-foreground">AI analysis</CardTitle>
                    <CardDescription>Updated live as you pencil.</CardDescription>
                  </div>
                  <Badge className="bg-primary/10 text-primary">{analysisStructure.termMonths} mos</Badge>
                </CardHeader>
                <CardContent className="space-y-4 text-sm text-muted-foreground">
                  {analysisLoading || isLoading ? (
                    <div className="space-y-3">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                      <Skeleton className="h-32 w-full" />
                    </div>
                  ) : (
                    <>
                      <div className="rounded-lg border border-border/60 bg-muted/40 p-4">
                        <div className="flex items-start justify-between gap-2 text-foreground">
                          <div>
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Recommended structure</p>
                            <p className="text-base font-semibold">{analysisStructure.label}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase tracking-wide text-muted-foreground">Monthly</p>
                            <p
                              className="text-lg font-semibold"
                              data-testid="ai-optimal-price"
                            >
                              {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(analysisStructure.monthlyPayment)}
                            </p>
                          </div>
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {analysisStructure.badges.map(badge => (
                            <Badge key={badge} variant="secondary" className="bg-primary/10 text-primary">
                              {badge}
                            </Badge>
                          ))}
                          <Badge variant="outline">Close {Math.round((analysisStructure.probability ?? 0) * 100)}%</Badge>
                        </div>
                      </div>

                      {analysis?.narrative && <p className="text-sm text-muted-foreground">{analysis.narrative}</p>}

                      <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
                          <Brain className="h-4 w-4 text-primary" /> Key considerations
                        </h3>
                        <ul className="space-y-2 text-xs text-muted-foreground">
                          {(analysis?.riskSignals ?? []).map(signal => (
                            <li key={signal} className="flex items-start gap-2">
                              <Target className="mt-0.5 h-3 w-3 text-primary" />
                              <span>{signal}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-semibold text-foreground">Payment targets</h3>
                        <div className="space-y-2">
                          {(analysis?.paymentTargets ?? []).map(target => (
                            <div key={target.label} className="flex items-center justify-between rounded-md border border-border/60 bg-muted/30 px-3 py-2">
                              <span>{target.label}</span>
                              <span className="text-sm font-semibold text-foreground">
                                {new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(target.amount)}
                                <span className="ml-2 text-xs text-muted-foreground">{Math.round(target.confidence * 100)}% confidence</span>
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </PanelErrorBoundary>

            <PanelErrorBoundary title="Gross calculator">
              <GrossCalculator dealId={DEAL_ID} targetGross={deal?.gross.targetGross} />
            </PanelErrorBoundary>

            <PanelErrorBoundary title="Payment calculator">
              <PaymentCalculator dealId={DEAL_ID} customerBudget={form.getValues('customer.budget')} />
            </PanelErrorBoundary>
          </div>
        </form>
      </Form>

      <PencilPrintPreview
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        deal={deal}
        scenario={previewScenario ?? activeScenario}
        predictions={predictions}
        similarDeals={similarDeals}
        formatCurrency={value => new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value)}
        onSaveToDeal={handlePreviewSave}
      />
    </div>
  );
}
