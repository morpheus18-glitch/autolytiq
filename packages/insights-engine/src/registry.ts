/**
 * Widget registry
 */

import type { Signal, Insight } from './signal-model.js';
import type { DomainEvent } from '@repo/state-bus';

export type RuleEvaluator = (events: DomainEvent[]) => Insight[];

export interface WidgetDefinition {
  id: string;
  type: string;
  label: string;
  description?: string;
  evaluator: RuleEvaluator;
}

const registry = new Map<string, WidgetDefinition>();

export function registerWidget(id: string, definition: WidgetDefinition): void {
  registry.set(id, definition);
}

export function getWidget(id: string): WidgetDefinition | undefined {
  return registry.get(id);
}

export function getAllWidgets(): WidgetDefinition[] {
  return Array.from(registry.values());
}

export function unregisterWidget(id: string): void {
  registry.delete(id);
}
