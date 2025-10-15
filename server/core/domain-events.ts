import { randomUUID } from "crypto";

/**
 * Base interface for domain events emitted by the platform.
 */
export interface DomainEvent<TName extends string = string, TPayload = Record<string, unknown>> {
  /**
   * Globally unique identifier for the event.
   */
  readonly id: string;
  /**
   * Semantic name of the event (e.g. `crm.lead.created`).
   */
  readonly name: TName;
  /**
   * Timestamp when the event occurred. Should be in UTC.
   */
  readonly occurredAt: Date;
  /**
   * Payload describing the event specific data.
   */
  readonly payload: TPayload;
  /**
   * Optional metadata for correlation IDs, tenant identifiers, etc.
   */
  readonly metadata?: Record<string, unknown>;
}

export interface EventContext {
  /**
   * Correlation identifier propagated across services.
   */
  readonly correlationId?: string;
  /**
   * Identifier for the event that triggered the current execution.
   */
  readonly causationId?: string;
}

export type EventHandler<TEvent extends DomainEvent = DomainEvent> = (
  event: TEvent,
  context: EventContext
) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe(): void;
}

export interface EventBus {
  publish<TEvent extends DomainEvent>(event: TEvent): Promise<void>;
  subscribe<TEvent extends DomainEvent>(
    eventName: TEvent["name"],
    handler: EventHandler<TEvent>
  ): EventSubscription;
}

export function createDomainEvent<TName extends string, TPayload extends Record<string, unknown>>(
  name: TName,
  payload: TPayload,
  metadata?: Record<string, unknown>
): DomainEvent<TName, TPayload> {
  return {
    id: randomUUID(),
    name,
    occurredAt: new Date(),
    payload,
    metadata,
  };
}
