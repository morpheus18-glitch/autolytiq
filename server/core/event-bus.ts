import { setImmediate } from "node:timers";
import { DomainEvent, EventBus, EventContext, EventHandler, EventSubscription } from "./domain-events";

type HandlerEntry = {
  handler: EventHandler<DomainEvent>;
  contextDefaults: EventContext;
};

/**
 * In-memory event bus implementation. Designed to be swappable with Kafka/EventBridge adapters.
 */
export class InMemoryEventBus implements EventBus {
  private readonly handlers = new Map<string, Set<HandlerEntry>>();

  constructor(private readonly globalContext: EventContext = {}) {}

  async publish<TEvent extends DomainEvent>(event: TEvent): Promise<void> {
    const handlers = this.handlers.get(event.name);
    if (!handlers?.size) {
      return;
    }

    const metadataCorrelationId =
      typeof event.metadata?.correlationId === "string" ? (event.metadata.correlationId as string) : undefined;

    const context: EventContext = {
      ...this.globalContext,
      correlationId: this.globalContext.correlationId ?? metadataCorrelationId ?? event.id,
      causationId: event.id,
    };

    await Promise.all(
      Array.from(handlers).map(
          ({ handler, contextDefaults }): Promise<void> =>
            new Promise((resolve, reject) => {
              setImmediate(async () => {
                try {
                  await handler(event, { ...context, ...contextDefaults });
                resolve();
              } catch (error) {
                reject(error);
              }
            });
          })
      )
    );
  }

  subscribe<TEvent extends DomainEvent>(
    eventName: TEvent["name"],
    handler: EventHandler<TEvent>,
    contextDefaults: EventContext = {}
  ): EventSubscription {
    const typedHandler = handler as EventHandler<DomainEvent>;
    const entry: HandlerEntry = { handler: typedHandler, contextDefaults };
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, new Set());
    }
    const bucket = this.handlers.get(eventName)!;
    bucket.add(entry);

    return {
      unsubscribe: () => {
        const bucketHandlers = this.handlers.get(eventName);
        if (!bucketHandlers) {
          return;
        }
        bucketHandlers.delete(entry);
        if (bucketHandlers.size === 0) {
          this.handlers.delete(eventName);
        }
      },
    };
  }
}
