import type { PaymentScenario } from '@/features/desking/types';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ArrowRightCircle, CheckCircle2 } from 'lucide-react';

interface PaymentScenarioCardProps {
  scenario: PaymentScenario;
  isActive?: boolean;
  onSelect?: (scenario: PaymentScenario) => void;
  formatCurrency: (value: number) => string;
}

export function PaymentScenarioCard({ scenario, isActive, onSelect, formatCurrency }: PaymentScenarioCardProps) {
  return (
    <Card
      className={cn(
        'transition-shadow duration-200 border-border/70 hover:border-primary/60',
        isActive ? 'border-primary shadow-lg shadow-primary/10' : 'shadow-sm'
      )}
    >
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Version {scenario.version.toUpperCase()}</p>
            <h3 className="mt-1 text-lg font-semibold text-foreground">{scenario.label}</h3>
          </div>
          <div className="flex flex-wrap justify-end gap-2">
            {isActive && (
              <Badge className="rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
                Active Scenario
              </Badge>
            )}
            {scenario.badges?.map(badge => (
              <Badge key={badge} className="rounded-full bg-primary/10 px-3 text-xs font-medium text-primary">
                {badge}
              </Badge>
            ))}
            {scenario.isCustomerCounter && (
              <Badge className="rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">
                Customer Counter
              </Badge>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-3xl font-semibold text-foreground">{formatCurrency(scenario.monthlyPayment)}</span>
          <span className="text-sm text-muted-foreground">/ month</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">APR</p>
            <p className="text-base font-semibold text-foreground">{scenario.apr.toFixed(2)}%</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Term</p>
            <p className="text-base font-semibold text-foreground">{scenario.termMonths} months</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Due at signing</p>
            <p className="text-base font-semibold text-foreground">{formatCurrency(scenario.totalDueAtSigning)}</p>
          </div>
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Cash down</p>
            <p className="text-base font-semibold text-foreground">{formatCurrency(scenario.cashDown)}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Total of payments</p>
            <p className="text-base font-semibold text-foreground">{formatCurrency(scenario.totalOfPayments)}</p>
          </div>
          {scenario.residual && (
            <div className="text-right">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground/70">Residual</p>
              <p className="text-base font-semibold text-foreground">{formatCurrency(scenario.residual)}</p>
            </div>
          )}
        </div>
        <Separator />
        {scenario.notes && scenario.notes.length > 0 && (
          <ul className="list-disc space-y-1 pl-5">
            {scenario.notes.map(note => (
              <li key={note} className="leading-relaxed text-muted-foreground">
                {note}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
      <CardFooter className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isActive ? (
            <>
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              <span className="font-medium text-emerald-600">Active scenario</span>
            </>
          ) : (
            <>
              <ArrowRightCircle className="h-4 w-4 text-primary" />
              <span>Select to make active</span>
            </>
          )}
        </div>
        <Button
          size="sm"
          variant={isActive ? 'secondary' : 'outline'}
          onClick={() => onSelect?.(scenario)}
        >
          {isActive ? 'Active' : 'Make Active'}
        </Button>
      </CardFooter>
    </Card>
  );
}

export default PaymentScenarioCard;
