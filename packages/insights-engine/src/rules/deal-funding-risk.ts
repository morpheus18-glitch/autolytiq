import type { DomainEvent } from '@repo/state-bus';
import type { Insight } from '../signal-model.js';
import { registerWidget } from '../registry.js';

/**
 * Rule: Deal funding at risk if CIT (Contracted In Transit) > 48 hours
 * and missing stipulations
 */
function evaluateDealFundingRisk(events: DomainEvent[]): Insight[] {
  const insights: Insight[] = [];

  // Find deal.stateChanged events where toState = 'CIT' or 'pending_funding'
  const citDeals = events.filter(e =>
    e.type === 'deal.stateChanged' &&
    (e.payload?.toState === 'pending_funding' || e.payload?.toState === 'CIT')
  );

  const now = Date.now();

  for (const event of citDeals) {
    const hoursSince = (now - new Date(event.timestamp).getTime()) / (1000 * 60 * 60);

    if (hoursSince > 48) {
      insights.push({
        id: `funding-risk-${event.entityId}`,
        type: 'deal.fundingAtRisk',
        severity: hoursSince > 72 ? 'critical' : 'high',
        status: 'new',
        summary: `Deal #${event.entityId.slice(0, 8)} funding at risk - ${Math.floor(hoursSince)}hrs in CIT`,
        entityRef: {
          type: 'deal',
          id: event.entityId,
        },
        quickAction: {
          label: 'View Deal',
          action: 'navigate',
          params: { path: `/deals/${event.entityId}` },
        },
        createdAt: new Date().toISOString(),
        metadata: {
          hoursSince,
          originalState: event.payload?.fromState,
        },
      });
    }
  }

  return insights;
}

registerWidget('deal-funding-risk', {
  id: 'deal-funding-risk',
  type: 'insight-widget',
  label: 'Deal Funding Risk',
  description: 'Alerts for deals with funding delays',
  evaluator: evaluateDealFundingRisk,
});
