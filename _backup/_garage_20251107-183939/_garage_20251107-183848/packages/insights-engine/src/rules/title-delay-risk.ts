import type { DomainEvent } from '@repo/state-bus';
import type { Insight } from '../signal-model.js';
import { registerWidget } from '../registry.js';

/**
 * Rule: Title delay risk if not filed after N days
 */
function evaluateTitleDelayRisk(events: DomainEvent[]): Insight[] {
  const insights: Insight[] = [];

  // Find title.received events without corresponding title.submitted
  const receivedTitles = events.filter(e => e.type === 'title.received');
  const submittedTitleIds = new Set(
    events
      .filter(e => e.type === 'title.submitted')
      .map(e => e.payload?.titleId)
  );

  const now = Date.now();
  const THRESHOLD_DAYS = 7;

  for (const event of receivedTitles) {
    const titleId = event.payload?.titleId;

    if (!submittedTitleIds.has(titleId)) {
      const daysSince = (now - new Date(event.timestamp).getTime()) / (1000 * 60 * 60 * 24);

      if (daysSince > THRESHOLD_DAYS) {
        insights.push({
          id: `title-delay-${titleId}`,
          type: 'title.delayRisk',
          severity: daysSince > 14 ? 'critical' : 'high',
          status: 'new',
          summary: `Title for ${event.payload?.vehicleId?.slice(0, 8)} not filed - ${Math.floor(daysSince)} days`,
          entityRef: {
            type: 'title',
            id: titleId,
          },
          quickAction: {
            label: 'File Title',
            action: 'modal',
            params: { modal: 'file-title', titleId },
          },
          createdAt: new Date().toISOString(),
          metadata: {
            daysSince,
            vehicleId: event.payload?.vehicleId,
          },
        });
      }
    }
  }

  return insights;
}

registerWidget('title-delay-risk', {
  id: 'title-delay-risk',
  type: 'insight-widget',
  label: 'Title Delay Risk',
  description: 'Titles not filed on time',
  evaluator: evaluateTitleDelayRisk,
});
