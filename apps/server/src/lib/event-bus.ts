import { randomUUID } from 'node:crypto';
import { setImmediate } from 'node:timers';

export interface DomainEvent<TName extends string = string, TPayload = Record<string, unknown>> {
  readonly id: string;
  readonly name: TName;
  readonly occurredAt: Date;
  readonly payload: TPayload;
  readonly metadata?: Record<string, unknown>;
}

export interface EventContext {
  readonly correlationId?: string;
  readonly causationId?: string;
}

export type EventHandler<TEvent extends DomainEvent = DomainEvent> = (
  event: TEvent,
  context: EventContext,
) => void | Promise<void>;

export interface EventSubscription {
  unsubscribe(): void;
}

export interface EventBus {
  publish<TEvent extends DomainEvent>(event: TEvent): Promise<void>;
  subscribe<TEvent extends DomainEvent>(name: TEvent['name'], handler: EventHandler<TEvent>): EventSubscription;
}

export function createDomainEvent<TName extends string, TPayload extends Record<string, unknown>>(
  name: TName,
  payload: TPayload,
  metadata?: Record<string, unknown>,
): DomainEvent<TName, TPayload> {
  return {
    id: randomUUID(),
    name,
    occurredAt: new Date(),
    payload,
    metadata,
  };
}

class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<EventHandler<DomainEvent>>>();

  constructor(private readonly contextDefaults: EventContext = {}) {}

  async publish<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    const handlers = this.handlers.get(event.name);
    if (!handlers?.size) {
      return;
    }

    const correlationId =
      (typeof event.metadata?.correlationId === 'string' && event.metadata.correlationId) || event.id;

    await Promise.all(
      Array.from(handlers).map(
        (handler) =>
          new Promise<void>((resolve, reject) => {
            setImmediate(async () => {
              try {
                await handler(event, { ...this.contextDefaults, correlationId, causationId: event.id });
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          }),
      ),
    );
  }

  subscribe<TEvent extends DomainEvent>(name: TEvent['name'], handler: EventHandler<TEvent>): EventSubscription {
    const bucket = this.handlers.get(name) ?? new Set<EventHandler<DomainEvent>>();
    bucket.add(handler as EventHandler<DomainEvent>);
    this.handlers.set(name, bucket);

    return {
      unsubscribe: () => {
        const current = this.handlers.get(name);
        if (!current) {
          return;
        }
        current.delete(handler as EventHandler<DomainEvent>);
        if (current.size === 0) {
          this.handlers.delete(name);
        }
      },
    };
  }
}

export const eventBus: EventBus = new InMemoryEventBus();
