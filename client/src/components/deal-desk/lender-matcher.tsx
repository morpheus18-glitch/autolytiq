import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Building2, CheckCircle2, TrendingUp, DollarSign, Clock, Star } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface LenderMatch {
  lenderName: string;
  lenderCode: string;
  tier: string;
  rate: number;
  maxLTV: number;
  maxTerm: number;
  approvalOdds: number;
  isPreferred: boolean;
  estimatedPayment: number;
  contactInfo?: {
    primaryContact: string;
    phone: string;
    email: string;
  };
}

interface LenderMatcherProps {
  creditScore?: number;
  loanAmount: number;
  vehicleValue: number;
  term: number;
  storeId?: string;
  onSelectLender?: (lender: LenderMatch) => void;
}

export function LenderMatcher({
  creditScore = 700,
  loanAmount,
  vehicleValue,
  term,
  storeId,
  onSelectLender
}: LenderMatcherProps) {
  // Fetch lender matches from API
  const { data: matches, isLoading } = useQuery<LenderMatch[]>({
    queryKey: ['/api/lenders/match', { storeId, creditScore, loanAmount, vehicleValue, term }],
    enabled: !!storeId && loanAmount > 0 && vehicleValue > 0,
    staleTime: 60000 // Cache for 1 minute
  });

  // Calculate LTV
  const ltv = vehicleValue > 0 ? (loanAmount / vehicleValue) * 100 : 0;

  // Determine credit tier from score
  const getCreditTier = (score: number) => {
    if (score >= 780) return 'A+';
    if (score >= 720) return 'A';
    if (score >= 660) return 'B';
    if (score >= 620) return 'C';
    return 'D';
  };

  const creditTier = getCreditTier(creditScore);

  // Get badge color by tier
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'A+': return 'bg-green-600 dark:bg-green-700';
      case 'A': return 'bg-blue-600 dark:bg-blue-700';
      case 'B': return 'bg-yellow-600 dark:bg-yellow-700';
      case 'C': return 'bg-orange-600 dark:bg-orange-700';
      case 'D': return 'bg-red-600 dark:bg-red-700';
      default: return 'bg-gray-600 dark:bg-gray-700';
    }
  };

  // Get approval odds color
  const getOddsColor = (odds: number) => {
    if (odds >= 85) return 'text-green-600 dark:text-green-400';
    if (odds >= 70) return 'text-blue-600 dark:text-blue-400';
    if (odds >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-orange-600 dark:text-orange-400';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Finding Best Lenders...
          </CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </CardContent>
      </Card>
    );
  }

  if (!matches || matches.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Lender Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            No lenders available. Configure lenders in dealer settings.
          </div>
        </CardContent>
      </Card>
    );
  }

  // Separate preferred and standard lenders
  const preferredLenders = matches.filter(m => m.isPreferred);
  const standardLenders = matches.filter(m => !m.isPreferred);

  const LenderCard = ({ lender }: { lender: LenderMatch }) => (
    <div 
      className="p-4 border rounded-lg hover:bg-accent/50 transition-colors space-y-3"
      data-testid={`lender-card-${lender.lenderCode}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold">{lender.lenderName}</h4>
            {lender.isPreferred && (
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge className={getTierColor(lender.tier)} variant="default">
              Tier {lender.tier}
            </Badge>
            <span className={`text-sm font-medium ${getOddsColor(lender.approvalOdds)}`}>
              {lender.approvalOdds}% Approval
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <div className="flex items-center gap-2">
          <DollarSign className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Rate</div>
            <div className="font-semibold">{lender.rate.toFixed(2)}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Payment</div>
            <div className="font-semibold">${lender.estimatedPayment.toFixed(0)}/mo</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Max LTV</div>
            <div className="font-semibold">{lender.maxLTV}%</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-muted-foreground" />
          <div>
            <div className="text-muted-foreground">Max Term</div>
            <div className="font-semibold">{lender.maxTerm} mo</div>
          </div>
        </div>
      </div>

      {onSelectLender && (
        <Button
          onClick={() => onSelectLender(lender)}
          variant="outline"
          size="sm"
          className="w-full"
          data-testid={`button-select-lender-${lender.lenderCode}`}
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          Select This Lender
        </Button>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Lender Recommendations
        </CardTitle>
        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
          <div>Credit: <span className="font-semibold">{creditScore}</span></div>
          <div>Tier: <Badge className={getTierColor(creditTier)} variant="default">{creditTier}</Badge></div>
          <div>LTV: <span className="font-semibold">{ltv.toFixed(1)}%</span></div>
        </div>
      </CardHeader>
      <CardContent>
        {preferredLenders.length > 0 ? (
          <Tabs defaultValue="preferred" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="preferred" data-testid="tab-preferred-lenders">
                <Star className="h-4 w-4 mr-2" />
                Preferred ({preferredLenders.length})
              </TabsTrigger>
              <TabsTrigger value="all" data-testid="tab-all-lenders">
                All Lenders ({matches.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="preferred" className="space-y-3 mt-4">
              {preferredLenders.map((lender) => (
                <LenderCard key={lender.lenderCode} lender={lender} />
              ))}
            </TabsContent>
            <TabsContent value="all" className="space-y-3 mt-4">
              {matches.map((lender) => (
                <LenderCard key={lender.lenderCode} lender={lender} />
              ))}
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-3">
            {matches.map((lender) => (
              <LenderCard key={lender.lenderCode} lender={lender} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
