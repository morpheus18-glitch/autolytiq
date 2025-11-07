/**
 * Rule evaluation engine
 */

import type { DomainEvent } from '@repo/state-bus';
import type { Insight } from './signal-model.js';
import { getAllWidgets } from './registry.js';

export interface EvaluationResult {
  widgetId: string;
  insights: Insight[];
  evaluatedAt: string;
}

export function evaluate(events: DomainEvent[]): EvaluationResult[] {
  const results: EvaluationResult[] = [];

  for (const widget of getAllWidgets()) {
    try {
      const insights = widget.evaluator(events);
      results.push({
        widgetId: widget.id,
        insights,
        evaluatedAt: new Date().toISOString(),
      });
    } catch (err) {
      console.error(`Widget ${widget.id} evaluation error:`, err);
    }
  }

  return results;
}
