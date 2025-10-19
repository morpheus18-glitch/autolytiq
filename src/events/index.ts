import { createDomainEvent, eventBus, type DomainEvent, type EventHandler } from '../lib/event-bus.js';
import { EVENT_TOPICS, type DomainEventPayloads, type DomainTopic } from './topics.js';

export { EVENT_TOPICS };
export type { DomainEvent };

export function emitEvent<TTopic extends DomainTopic>(
  topic: TTopic,
  payload: DomainEventPayloads[TTopic],
  metadata?: Record<string, unknown>,
): Promise<void> {
  const event = createDomainEvent(topic, payload, metadata);
  return eventBus.publish(event);
}

export function subscribeToEvent<TTopic extends DomainTopic>(
  topic: TTopic,
  handler: EventHandler<DomainEvent<TTopic, DomainEventPayloads[TTopic]>>,
) {
  return eventBus.subscribe(topic, handler as EventHandler);
}
