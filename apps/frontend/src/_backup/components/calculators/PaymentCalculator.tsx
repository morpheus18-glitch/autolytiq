import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCcw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

interface PaymentCalculatorProps {
  dealId: string;
  customerBudget?: number;
}

interface PaymentCalculationInput {
  amountFinanced: number;
  apr: number;
  termMonths: number;
  cashDown: number;
  taxes: number;
  fees: number;
  residual?: number;
}

interface PaymentCalculationResult {
  monthlyPayment: number;
  totalOfPayments: number;
  totalDueAtSigning: number;
  interestPaid: number;
  principalPaid: number;
  narrative: string;
}

async function requestPaymentCalculation(
  dealId: string,
  payload: PaymentCalculationInput,
): Promise<PaymentCalculationResult> {
  try {
    const response = await apiRequest('POST', `/api/desking/deals/${dealId}/payment`, payload);
    return (await response.json()) as PaymentCalculationResult;
  } catch (error) {
    console.warn('[PaymentCalculator] using local amortization fallback', error);
    const monthlyRate = payload.apr / 1200;
    const financed = payload.amountFinanced - payload.cashDown + payload.fees + payload.taxes;
    const monthlyPayment =
      payload.residual && payload.residual > 0
        ? ((financed - payload.residual / (1 + monthlyRate) ** payload.termMonths) * monthlyRate) /
            (1 - (1 + monthlyRate) ** -payload.termMonths) +
          payload.residual / payload.termMonths
        : (financed * monthlyRate) / (1 - (1 + monthlyRate) ** -payload.termMonths);
    const totalOfPayments = monthlyPayment * payload.termMonths;
    return {
      monthlyPayment,
      totalOfPayments,
      totalDueAtSigning: payload.cashDown + payload.fees + payload.taxes,
      interestPaid: totalOfPayments - financed,
      principalPaid: financed,
      narrative:
        'Local amortization estimate based on the requested APR, amount financed, and optional residual structure.',
    };
  }
}

const currency = new Intl.NumberFormat(undefined, {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

function formatCurrency(value: number) {
  return currency.format(value);
}

export function PaymentCalculator({ dealId, customerBudget }: PaymentCalculatorProps) {
  const [inputs, setInputs] = useState<PaymentCalculationInput>({
    amountFinanced: 86500,
    apr: 6.49,
    termMonths: 72,
    cashDown: 2500,
    taxes: 6123,
    fees: 1484,
    residual: undefined,
  });

  const debouncedInputs = useDebouncedValue(inputs, 450);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['desking', 'payment-calculator', dealId, debouncedInputs],
    queryFn: () => requestPaymentCalculation(dealId, debouncedInputs),
  });

  const handleChange = (field: keyof PaymentCalculationInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseFloat(event.target.value) || 0;
    setInputs(prev => ({ ...prev, [field]: next }));
  };

  const result = useMemo(() => data, [data]);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">Payment Calculator</CardTitle>
          <CardDescription>Project the customer&apos;s payment and drive-off using live financing terms.</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Sync
        </Button>
      </CardHeader>
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <label className="space-y-1">
              <span className="text-muted-foreground">Amount financed</span>
              <Input inputMode="decimal" value={inputs.amountFinanced} onChange={handleChange('amountFinanced')} />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">APR %</span>
              <Input inputMode="decimal" value={inputs.apr} onChange={handleChange('apr')} />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Term (months)</span>
              <Input inputMode="numeric" value={inputs.termMonths} onChange={handleChange('termMonths')} />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Cash down</span>
              <Input inputMode="decimal" value={inputs.cashDown} onChange={handleChange('cashDown')} />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Taxes</span>
              <Input inputMode="decimal" value={inputs.taxes} onChange={handleChange('taxes')} />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Fees</span>
              <Input inputMode="decimal" value={inputs.fees} onChange={handleChange('fees')} />
            </label>
            <label className="space-y-1">
              <span className="text-muted-foreground">Residual (optional)</span>
              <Input inputMode="decimal" value={inputs.residual ?? ''} onChange={handleChange('residual')} placeholder="0" />
            </label>
          </div>
        </div>
        <div className="space-y-3 rounded-lg border border-border/60 bg-muted/40 p-4">
          {customerBudget !== undefined && (
            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200" variant="secondary">
              Customer goal {formatCurrency(customerBudget)}
            </Badge>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Monthly payment</Label>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(result?.monthlyPayment ?? 0)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Total of payments</Label>
              <p className="text-base font-semibold text-foreground">{formatCurrency(result?.totalOfPayments ?? 0)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Due at signing</Label>
              <p className="text-base font-semibold text-foreground">{formatCurrency(result?.totalDueAtSigning ?? 0)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Interest paid</Label>
              <p className="text-base font-semibold text-foreground">{formatCurrency(result?.interestPaid ?? 0)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Principal</Label>
              <p className="text-base font-semibold text-foreground">{formatCurrency(result?.principalPaid ?? 0)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{result?.narrative ?? 'Provide finance inputs to calculate payments.'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default PaymentCalculator;
