import type { ApprovalProbability } from '@/features/desking/types';
import { Card, CardContent, CardHeader, CardTitle } from '@repo/ui';
import { Badge } from '@repo/ui';
import ProbabilityIndicator from './ProbabilityIndicator';

interface LenderRecommendationCardProps {
  approval: ApprovalProbability;
}

export function LenderRecommendationCard({ approval }: LenderRecommendationCardProps) {
  return (
    <Card className="border-border/70 shadow-sm">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="text-base font-semibold text-foreground">{approval.lender}</CardTitle>
          <p className="mt-1 text-xs uppercase tracking-wide text-muted-foreground">
            Avg funding {approval.avgFundingTimeDays.toFixed(1)} days
          </p>
        </div>
        <ProbabilityIndicator value={approval.probability} size="sm" trend={approval.probability >= 0.75 ? 'up' : 'flat'} label="Approval" />
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Programs</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {approval.programs.map(program => (
              <Badge key={program} className="rounded-full bg-primary/10 px-3 text-xs font-medium text-primary">
                {program}
              </Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Highlights</p>
          <ul className="mt-1 list-disc space-y-1 pl-5">
            {approval.highlights.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

export default LenderRecommendationCard;
