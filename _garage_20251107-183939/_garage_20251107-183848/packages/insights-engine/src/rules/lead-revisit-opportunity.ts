import type { DomainEvent } from '@repo/state-bus';
import type { Insight } from '../signal-model.js';
import { registerWidget } from '../registry.js';

/**
 * Rule: Lead revisit opportunity if BDC lead engaged < 48hrs ago, no follow-up
 */
function evaluateLeadRevisit(events: DomainEvent[]): Insight[] {
  const insights: Insight[] = [];

  // Note: This uses deal.created as proxy for lead conversion
  // In production, would use 'lead.engaged' event type
  const recentDeals = events.filter(e => e.type === 'deal.created');

  const now = Date.now();

  for (const event of recentDeals) {
    const hoursSince = (now - new Date(event.timestamp).getTime()) / (1000 * 60 * 60);

    // If deal created but no follow-up state change in 24-48 hours
    if (hoursSince > 24 && hoursSince < 48) {
      const hasFollowUp = events.some(e =>
        e.type === 'deal.stateChanged' &&
        e.entityId === event.entityId
      );

      if (!hasFollowUp) {
        insights.push({
          id: `lead-revisit-${event.entityId}`,
          type: 'lead.revisitOpportunity',
          severity: 'normal',
          status: 'new',
          summary: `Deal #${event.entityId.slice(0, 8)} created ${Math.floor(hoursSince)}hrs ago - no follow-up`,
          entityRef: {
            type: 'deal',
            id: event.entityId,
          },
          quickAction: {
            label: 'Follow Up',
            action: 'navigate',
            params: { path: `/deals/${event.entityId}` },
          },
          createdAt: new Date().toISOString(),
          metadata: {
            hoursSince,
            customerId: event.payload?.customerId,
          },
        });
      }
    }
  }

  return insights;
}

registerWidget('lead-revisit', {
  id: 'lead-revisit',
  type: 'insight-widget',
  label: 'Lead Revisit Opportunities',
  description: 'Recent leads needing follow-up',
  evaluator: evaluateLeadRevisit,
});
