import type { Express } from "express";
import type { IStorage } from "../storage";
import type { EventBus, EventSubscription, EventContext } from "./domain-events";

export interface ModuleContext {
  readonly eventBus: EventBus;
  readonly storage: IStorage;
  readonly logger: Pick<Console, "info" | "warn" | "error">;
  readonly context?: EventContext;
}

export interface ModuleRegistrationResult {
  subscriptions?: EventSubscription[];
  shutdown?(): Promise<void> | void;
}

export interface ModuleDefinition {
  readonly name: string;
  register(app: Express, context: ModuleContext): Promise<ModuleRegistrationResult> | ModuleRegistrationResult;
}

export class ModuleRegistry {
  private readonly activeModules = new Map<string, ModuleRegistrationResult>();

  constructor(private readonly baseContext: ModuleContext) {}

  async registerModule(app: Express, definition: ModuleDefinition): Promise<void> {
    if (this.activeModules.has(definition.name)) {
      throw new Error(`Module ${definition.name} is already registered.`);
    }

    const result = await definition.register(app, this.baseContext);
    this.activeModules.set(definition.name, result);
    this.baseContext.logger.info?.(`Module ${definition.name} registered.`);
  }

  async shutdown(): Promise<void> {
    for (const [name, moduleResult] of Array.from(this.activeModules.entries())) {
      try {
        moduleResult.subscriptions?.forEach((subscription: EventSubscription) => subscription.unsubscribe());
        await moduleResult.shutdown?.();
        this.baseContext.logger.info?.(`Module ${name} shut down.`);
      } catch (error) {
        this.baseContext.logger.error?.(`Failed to shutdown module ${name}: ${(error as Error).message}`);
      }
    }
    this.activeModules.clear();
  }
}
