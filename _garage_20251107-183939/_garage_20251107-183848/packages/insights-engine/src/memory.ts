/**
 * Ring buffer for recent events (in-memory, 1000 max)
 */

import type { DomainEvent } from '@repo/state-bus';

const buffer: DomainEvent[] = [];
const MAX_SIZE = 1000;

export function appendEvent(event: DomainEvent): void {
  buffer.push(event);
  if (buffer.length > MAX_SIZE) {
    buffer.shift();
  }
}

export function getRecentEvents(filter?: {
  entityType?: string;
  since?: string;
}): DomainEvent[] {
  let events = [...buffer];

  if (filter?.entityType) {
    events = events.filter(e => e.entityType === filter.entityType);
  }

  if (filter?.since) {
    const sinceDate = new Date(filter.since);
    events = events.filter(e => new Date(e.timestamp) > sinceDate);
  }

  return events;
}

export function clearMemory(): void {
  buffer.length = 0;
}
