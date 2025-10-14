import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calculator, DollarSign, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PaymentScenario {
  id: string;
  label: string;
  downPayment: number;
  term: number;
  apr: number;
  monthlyPayment: number;
  totalInterest: number;
  totalCost: number;
  recommended?: boolean;
}

interface PaymentScenariosProps {
  vehiclePrice: number;
  tradeValue?: number;
  tradePayoff?: number;
  apr: number;
  onSelectScenario?: (scenario: PaymentScenario) => void;
}

export function PaymentScenarios({
  vehiclePrice,
  tradeValue = 0,
  tradePayoff = 0,
  apr = 6.99,
  onSelectScenario
}: PaymentScenariosProps) {
  const netTradeValue = tradeValue - tradePayoff;

  // Calculate payment for given parameters
  const calculatePayment = (principal: number, rate: number, months: number): number => {
    if (principal <= 0 || months <= 0) return 0;
    const monthlyRate = rate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    return (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  };

  // Generate scenarios
  const scenarios = useMemo((): PaymentScenario[] => {
    // Ensure basePrice is never negative (handle high trade equity scenarios)
    const basePrice = Math.max(0, vehiclePrice - netTradeValue);
    
    // If basePrice is zero or very small, return cash/no-finance scenarios
    if (basePrice < 100) {
      return [{
        id: 'cash',
        label: 'Cash Deal (Fully Covered by Trade)',
        downPayment: 0,
        term: 0,
        apr: 0,
        monthlyPayment: 0,
        totalInterest: 0,
        totalCost: 0,
        recommended: true
      }];
    }
    
    const scenarioConfigs = [
      { id: 'zero-down', label: 'Zero Down', downPayment: 0, term: 72, recommended: false },
      { id: 'low-down', label: 'Low Down Payment', downPayment: basePrice * 0.10, term: 72, recommended: false },
      { id: 'standard', label: 'Standard (20% Down)', downPayment: basePrice * 0.20, term: 72, recommended: true },
      { id: 'high-down', label: 'High Down Payment', downPayment: basePrice * 0.30, term: 60, recommended: false },
      { id: 'short-term', label: 'Short Term (48mo)', downPayment: basePrice * 0.20, term: 48, recommended: false },
      { id: 'long-term', label: 'Long Term (84mo)', downPayment: basePrice * 0.10, term: 84, recommended: false },
    ];

    return scenarioConfigs.map(config => {
      // Clamp down payment to basePrice (can't put down more than the price)
      const downPayment = Math.min(config.downPayment, basePrice);
      const principal = Math.max(0, basePrice - downPayment);
      const monthlyPayment = calculatePayment(principal, apr, config.term);
      const totalPaid = monthlyPayment * config.term;
      const totalInterest = Math.max(0, totalPaid - principal);
      const totalCost = downPayment + totalPaid;

      return {
        ...config,
        downPayment,
        apr,
        monthlyPayment,
        totalInterest,
        totalCost
      };
    });
  }, [vehiclePrice, netTradeValue, apr]);

  // Find lowest payment and lowest total cost
  const lowestPayment = Math.min(...scenarios.map(s => s.monthlyPayment));
  const lowestCost = Math.min(...scenarios.map(s => s.totalCost));

  // Calculate max values for bar chart scaling (guard against division by zero)
  const maxPayment = Math.max(...scenarios.map(s => s.monthlyPayment), 1);
  const maxCost = Math.max(...scenarios.map(s => s.totalCost), 1);

  const ScenarioCard = ({ scenario }: { scenario: PaymentScenario }) => {
    const isLowestPayment = scenario.monthlyPayment === lowestPayment;
    const isLowestCost = scenario.totalCost === lowestCost;

    return (
      <div 
        className={`p-4 border rounded-lg hover:bg-accent/50 transition-colors ${
          scenario.recommended ? 'border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' : ''
        }`}
        data-testid={`scenario-card-${scenario.id}`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h4 className="font-semibold flex items-center gap-2">
              {scenario.label}
              {scenario.recommended && (
                <Badge variant="default" className="bg-blue-600">Recommended</Badge>
              )}
            </h4>
            <div className="text-sm text-muted-foreground mt-1">
              ${scenario.downPayment.toFixed(0)} down • {scenario.term} months @ {scenario.apr}%
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {/* Monthly Payment */}
          <div className="p-3 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm text-muted-foreground">Monthly Payment</span>
              </div>
              {isLowestPayment && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <TrendingDown className="h-3 w-3 mr-1" />
                  Lowest
                </Badge>
              )}
            </div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              ${scenario.monthlyPayment.toFixed(0)}/mo
            </div>
            {/* Payment bar */}
            <div className="mt-2 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-600 dark:bg-blue-400 transition-all"
                style={{ width: `${(scenario.monthlyPayment / maxPayment) * 100}%` }}
              />
            </div>
          </div>

          {/* Total Cost */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
              <div className="text-muted-foreground">Total Interest</div>
              <div className="font-semibold text-orange-600 dark:text-orange-400">
                ${scenario.totalInterest.toFixed(0)}
              </div>
            </div>
            <div className="p-2 bg-gray-50 dark:bg-gray-800/50 rounded">
              <div className="text-muted-foreground flex items-center gap-1">
                Total Cost
                {isLowestCost && (
                  <TrendingDown className="h-3 w-3 text-green-600" />
                )}
              </div>
              <div className={`font-semibold ${isLowestCost ? 'text-green-600 dark:text-green-400' : ''}`}>
                ${scenario.totalCost.toFixed(0)}
              </div>
            </div>
          </div>

          {/* Cost bar */}
          <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${
                isLowestCost ? 'bg-green-600 dark:bg-green-400' : 'bg-gray-400 dark:bg-gray-500'
              }`}
              style={{ width: `${(scenario.totalCost / maxCost) * 100}%` }}
            />
          </div>

          {onSelectScenario && (
            <Button
              onClick={() => onSelectScenario(scenario)}
              variant={scenario.recommended ? "default" : "outline"}
              size="sm"
              className="w-full mt-2"
              data-testid={`button-select-scenario-${scenario.id}`}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {scenario.recommended ? 'Use Recommended' : 'Use This Option'}
            </Button>
          )}
        </div>
      </div>
    );
  };

  // Group scenarios explicitly by ID
  const downPaymentScenarios = scenarios.filter(s => 
    ['zero-down', 'low-down', 'standard', 'high-down', 'cash'].includes(s.id)
  );
  const termScenarios = scenarios.filter(s => 
    ['short-term', 'long-term'].includes(s.id)
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Payment Scenarios
        </CardTitle>
        <div className="text-sm text-muted-foreground mt-2">
          Vehicle Price: ${vehiclePrice.toLocaleString()} 
          {netTradeValue > 0 && ` • Trade Equity: $${netTradeValue.toLocaleString()}`}
        </div>
      </CardHeader>
      <CardContent>
        {termScenarios.length > 0 ? (
          <Tabs defaultValue="down-payment" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="down-payment" data-testid="tab-down-payment">
                Down Payment Options
              </TabsTrigger>
              <TabsTrigger value="term" data-testid="tab-term-options">
                Term Options
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="down-payment" className="space-y-3 mt-4">
              {downPaymentScenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </TabsContent>
            
            <TabsContent value="term" className="space-y-3 mt-4">
              {termScenarios.map((scenario) => (
                <ScenarioCard key={scenario.id} scenario={scenario} />
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-3">
            {downPaymentScenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        )}

        {/* Summary Stats */}
        <div className="mt-4 pt-4 border-t grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="text-xs text-muted-foreground">Lowest Payment</div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              ${lowestPayment.toFixed(0)}/mo
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Lowest Total Cost</div>
            <div className="font-semibold text-green-600 dark:text-green-400">
              ${lowestCost.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">APR</div>
            <div className="font-semibold">{apr.toFixed(2)}%</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
