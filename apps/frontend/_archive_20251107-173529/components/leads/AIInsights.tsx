import { Lightbulb, TrendingUp, Users } from 'lucide-react';
import { Card, CardContent } from '@repo/ui';
import { Badge } from '@repo/ui';
import { Button } from '@repo/ui';
import type { AIInsight } from '@/types/leads';
import { cn } from '@/lib/utils';

interface AIInsightsProps {
  insights: AIInsight[];
  onAction?: (insight: AIInsight) => void;
}

const impactVariant: Record<AIInsight['impact'], string> = {
  high: 'bg-red-100 text-red-700 border-red-200',
  medium: 'bg-amber-100 text-amber-700 border-amber-200',
  low: 'bg-slate-100 text-slate-600 border-slate-200',
};

function getIcon(action: AIInsight['cta']['action']) {
  switch (action) {
    case 'call':
      return <Users className="h-4 w-4" />;
    case 'sms':
      return <TrendingUp className="h-4 w-4" />;
    default:
      return <Lightbulb className="h-4 w-4" />;
  }
}

export function AIInsights({ insights, onAction }: AIInsightsProps) {
  if (!insights.length) {
    return null;
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => (
        <Card key={insight.id} className="border-emerald-200/70 bg-emerald-50/70">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h4 className="text-sm font-semibold text-emerald-900">{insight.title}</h4>
                <p className="mt-1 text-sm text-emerald-800/80">{insight.description}</p>
              </div>
              <Badge className={cn('border font-semibold uppercase tracking-wide', impactVariant[insight.impact])}>
                {insight.impact} impact
              </Badge>
            </div>
            {insight.supportingPoints?.length ? (
              <ul className="list-disc space-y-1 pl-5 text-sm text-emerald-900/80">
                {insight.supportingPoints.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            ) : null}
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="secondary"
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => onAction?.(insight)}
              >
                {getIcon(insight.cta.action)}
                <span className="ml-2">{insight.cta.label}</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default AIInsights;
