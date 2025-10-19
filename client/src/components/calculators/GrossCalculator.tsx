import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCcw } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useDebouncedValue } from '@/hooks/use-debounced-value';

interface GrossCalculatorProps {
  dealId: string;
  targetGross?: number;
}

interface GrossCalculationInput {
  salePrice: number;
  vehicleCost: number;
  accessories: number;
  docFee: number;
  otherFees: number;
  tradeAllowance: number;
  tradePayoff: number;
  financeProducts: number;
}

interface GrossCalculationResult {
  frontGross: number;
  backGross: number;
  totalGross: number;
  effectiveGross: number;
  narrative: string;
}

async function requestGrossCalculation(
  dealId: string,
  payload: GrossCalculationInput,
): Promise<GrossCalculationResult> {
  try {
    const response = await apiRequest('POST', `/api/desking/deals/${dealId}/gross`, payload);
    return (await response.json()) as GrossCalculationResult;
  } catch (error) {
    console.warn('[GrossCalculator] falling back to local calculation', error);
    const frontGross = payload.salePrice - payload.vehicleCost - payload.accessories - payload.docFee - payload.otherFees;
    const backGross = payload.financeProducts + Math.max(0, payload.tradeAllowance - payload.tradePayoff);
    const totalGross = frontGross + backGross;
    return {
      frontGross,
      backGross,
      totalGross,
      effectiveGross: totalGross,
      narrative:
        'Using local calculator fallback. Front gross accounts for sale price minus cost and fees; back gross adds finance products and trade equity.',
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

export function GrossCalculator({ dealId, targetGross }: GrossCalculatorProps) {
  const [inputs, setInputs] = useState<GrossCalculationInput>({
    salePrice: 102450,
    vehicleCost: 96400,
    accessories: 1450,
    docFee: 399,
    otherFees: 590,
    tradeAllowance: 25000,
    tradePayoff: 21400,
    financeProducts: 1225,
  });

  const debouncedInputs = useDebouncedValue(inputs, 450);

  const { data, isFetching, refetch } = useQuery({
    queryKey: ['desking', 'gross-calculator', dealId, debouncedInputs],
    queryFn: () => requestGrossCalculation(dealId, debouncedInputs),
  });

  const handleChange = (field: keyof GrossCalculationInput) => (event: React.ChangeEvent<HTMLInputElement>) => {
    const next = Number.parseFloat(event.target.value) || 0;
    setInputs(prev => ({ ...prev, [field]: next }));
  };

  const result = useMemo(() => data, [data]);

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between gap-4">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">Gross Calculator</CardTitle>
          <CardDescription>Validate gross impact as you adjust deal economics.</CardDescription>
        </div>
        <Button variant="outline" size="sm" className="gap-2" onClick={() => refetch()} disabled={isFetching}>
          {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Sync
        </Button>
      </CardHeader>
      <Separator />
      <CardContent className="grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Structure</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Sale price</span>
                <Input inputMode="decimal" value={inputs.salePrice} onChange={handleChange('salePrice')} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Vehicle cost</span>
                <Input inputMode="decimal" value={inputs.vehicleCost} onChange={handleChange('vehicleCost')} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Accessories</span>
                <Input inputMode="decimal" value={inputs.accessories} onChange={handleChange('accessories')} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Doc fee</span>
                <Input inputMode="decimal" value={inputs.docFee} onChange={handleChange('docFee')} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Other fees</span>
                <Input inputMode="decimal" value={inputs.otherFees} onChange={handleChange('otherFees')} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Finance products</span>
                <Input inputMode="decimal" value={inputs.financeProducts} onChange={handleChange('financeProducts')} />
              </label>
            </div>
          </fieldset>
          <fieldset className="space-y-3">
            <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Trade</legend>
            <div className="grid grid-cols-2 gap-3">
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Trade allowance</span>
                <Input inputMode="decimal" value={inputs.tradeAllowance} onChange={handleChange('tradeAllowance')} />
              </label>
              <label className="space-y-1 text-sm">
                <span className="text-muted-foreground">Trade payoff</span>
                <Input inputMode="decimal" value={inputs.tradePayoff} onChange={handleChange('tradePayoff')} />
              </label>
            </div>
          </fieldset>
        </div>
        <div className="space-y-4 rounded-lg border border-border/60 bg-muted/40 p-4">
          {targetGross !== undefined && (
            <Badge className="bg-primary/10 text-primary" variant="secondary">
              Target Gross {formatCurrency(targetGross)}
            </Badge>
          )}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Front gross</Label>
              <p className="text-base font-semibold text-foreground">{formatCurrency(result?.frontGross ?? 0)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Back gross</Label>
              <p className="text-base font-semibold text-foreground">{formatCurrency(result?.backGross ?? 0)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Total gross</Label>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(result?.totalGross ?? 0)}</p>
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Effective gross</Label>
              <p className="text-lg font-semibold text-foreground">{formatCurrency(result?.effectiveGross ?? 0)}</p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">{result?.narrative ?? 'Enter deal details to calculate gross.'}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default GrossCalculator;
