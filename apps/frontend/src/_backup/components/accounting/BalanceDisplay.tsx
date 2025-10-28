import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

interface BalanceDisplayProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: {
    label: string;
    value: number;
  };
}

export function BalanceDisplay({ title, value, subtitle, trend }: BalanceDisplayProps) {
  return (
    <Card className="bg-gradient-to-br from-card to-muted/40">
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-2xl font-semibold text-foreground">{currency.format(value)}</div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend && (
          <p className="text-xs font-medium text-emerald-600">
            {trend.label}: {trend.value > 0 ? '+' : ''}
            {trend.value.toFixed(1)}%
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default BalanceDisplay;
