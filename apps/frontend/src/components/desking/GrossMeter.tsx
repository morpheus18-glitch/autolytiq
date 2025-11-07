import type { DealGrossMetrics } from '@/features/desking/types';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Progress } from '@repo/ui';
import { Separator } from '@repo/ui';

interface GrossMeterProps {
  gross: DealGrossMetrics;
  formatCurrency: (value: number) => string;
}

export function GrossMeter({ gross, formatCurrency }: GrossMeterProps) {
  const attainment = Math.min(100, Math.round((gross.totalGross / gross.targetGross) * 100));
  const categories: Array<{ label: string; value: number }> = [
    { label: 'Front', value: gross.frontGross },
    { label: 'Back', value: gross.backGross },
    { label: 'F&I', value: gross.fAndIGross },
  ];

  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader>
        <CardTitle className="text-base font-semibold text-foreground">Gross Performance</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-semibold text-foreground">{formatCurrency(gross.totalGross)}</p>
            <span className="text-xs uppercase tracking-wide text-muted-foreground">Target {formatCurrency(gross.targetGross)}</span>
          </div>
          <Progress value={attainment} className="mt-3 h-3 bg-muted" />
          <p className="mt-2 text-xs text-muted-foreground">{attainment}% to gross objective</p>
        </div>
        <Separator />
        <div className="grid grid-cols-3 gap-3">
          {categories.map(category => (
            <div key={category.label} className="rounded-lg border border-border/60 bg-muted/40 p-3">
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{category.label}</p>
              <p className="mt-1 text-lg font-semibold text-foreground">{formatCurrency(category.value)}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default GrossMeter;
