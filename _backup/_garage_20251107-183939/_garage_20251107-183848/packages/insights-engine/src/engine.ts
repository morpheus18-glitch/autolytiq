/**
 * Main engine - connects to state-bus
 */

import { subscribe, Channels } from '@repo/state-bus';
import type { DomainEvent } from '@repo/state-bus';
import { appendEvent, getRecentEvents } from './memory.js';
import { evaluate } from './rules-core.js';

export interface EngineOptions {
  tenantId: string;
  evaluationIntervalMs?: number;
}

export function startEngine(options: EngineOptions): () => void {
  const { tenantId, evaluationIntervalMs = 30000 } = options;

  // Subscribe to all tenant events
  const unsubscribe = subscribe(
    Channels.tenant(tenantId),
    (event: DomainEvent) => {
      appendEvent(event);
    }
  );

  // Periodic evaluation
  const interval = setInterval(() => {
    const recentEvents = getRecentEvents({
      since: new Date(Date.now() - 300000).toISOString(), // Last 5 min
    });

    const results = evaluate(recentEvents);

    // Emit results (for now, just log)
    if (results.some(r => r.insights.length > 0)) {
      console.log('[Insight Engine] Evaluation results:', results);
    }
  }, evaluationIntervalMs);

  // Return cleanup function
  return () => {
    unsubscribe();
    clearInterval(interval);
  };
}
