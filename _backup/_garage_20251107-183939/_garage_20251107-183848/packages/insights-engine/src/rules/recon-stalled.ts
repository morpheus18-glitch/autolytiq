import type { DomainEvent } from '@repo/state-bus';
import type { Insight } from '../signal-model.js';
import { registerWidget } from '../registry.js';

/**
 * Rule: RO (Repair Order) stalled if vehicle > X days in recon step
 */
function evaluateReconStalled(events: DomainEvent[]): Insight[] {
  const insights: Insight[] = [];

  // Find ro.stateChanged events where toState = 'recon' or 'pending_parts'
  const reconOrders = events.filter(e =>
    e.type === 'ro.stateChanged' &&
    (e.payload?.toState === 'recon' || e.payload?.toState === 'pending_parts')
  );

  const now = Date.now();
  const THRESHOLD_DAYS = 10;

  for (const event of reconOrders) {
    const daysSince = (now - new Date(event.timestamp).getTime()) / (1000 * 60 * 60 * 24);

    if (daysSince > THRESHOLD_DAYS) {
      insights.push({
        id: `recon-stalled-${event.entityId}`,
        type: 'recon.stalled',
        severity: daysSince > 20 ? 'high' : 'normal',
        status: 'new',
        summary: `RO #${event.entityId.slice(0, 8)} stalled in recon for ${Math.floor(daysSince)} days`,
        entityRef: {
          type: 'ro',
          id: event.entityId,
        },
        quickAction: {
          label: 'Check Status',
          action: 'navigate',
          params: { path: `/service/ro/${event.entityId}` },
        },
        createdAt: new Date().toISOString(),
        metadata: {
          daysSince,
          currentState: event.payload?.toState,
        },
      });
    }
  }

  return insights;
}

registerWidget('recon-stalled', {
  id: 'recon-stalled',
  type: 'insight-widget',
  label: 'Recon Stalled',
  description: 'Vehicles stuck in reconditioning',
  evaluator: evaluateReconStalled,
});
