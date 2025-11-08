import * as React from 'react';
import { InsightCard } from './InsightCard.js';
import type { Insight } from '@repo/insights-engine';

export interface InsightListProps {
  insights: Insight[];
  onAction?: (action: string, params?: Record<string, any>) => void;
  emptyMessage?: string;
}

export function InsightList({ insights, onAction, emptyMessage = 'No insights' }: InsightListProps) {
  if (insights.length === 0) {
    return (
      <div className="text-center py-8 text-text-secondary text-sm">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {insights.map(insight => (
        <InsightCard
          key={insight.id}
          insight={insight}
          onAction={onAction}
        />
      ))}
    </div>
  );
}
