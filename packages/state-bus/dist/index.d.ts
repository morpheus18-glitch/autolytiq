/**
 * Domain Events - Typed event definitions for deal|ro|vehicle|title|parts|inventory
 */
type DomainEventType = 'deal.created' | 'deal.updated' | 'deal.stateChanged' | 'deal.assigned' | 'deal.closed' | 'ro.created' | 'ro.updated' | 'ro.stateChanged' | 'ro.closed' | 'vehicle.acquired' | 'vehicle.priced' | 'vehicle.sold' | 'vehicle.aged' | 'title.received' | 'title.submitted' | 'title.cleared' | 'title.issue' | 'parts.ordered' | 'parts.received' | 'parts.installed' | 'inventory.added' | 'inventory.updated' | 'inventory.removed';
interface DomainEvent<T = any> {
    id: string;
    type: DomainEventType;
    tenantId: string;
    entityType: 'deal' | 'ro' | 'vehicle' | 'title' | 'parts' | 'inventory';
    entityId: string;
    timestamp: string;
    userId?: string;
    payload: T;
    metadata?: Record<string, any>;
}
interface DealCreatedEvent extends DomainEvent {
    type: 'deal.created';
    entityType: 'deal';
    payload: {
        dealId: string;
        customerId: string;
        vehicleId: string;
        salesPersonId: string;
        state: 'pending' | 'fi' | 'closed' | 'cancelled';
        value: number;
    };
}
interface DealStateChangedEvent extends DomainEvent {
    type: 'deal.stateChanged';
    entityType: 'deal';
    payload: {
        dealId: string;
        fromState: string;
        toState: string;
        reason?: string;
        triggeredBy: string;
    };
}
interface ROCreatedEvent extends DomainEvent {
    type: 'ro.created';
    entityType: 'ro';
    payload: {
        roId: string;
        customerId: string;
        vehicleId: string;
        advisorId: string;
        state: 'open' | 'pending' | 'approved' | 'closed';
    };
}
interface ROStateChangedEvent extends DomainEvent {
    type: 'ro.stateChanged';
    entityType: 'ro';
    payload: {
        roId: string;
        fromState: string;
        toState: string;
        stateChangedAt: string;
    };
}
interface VehicleAcquiredEvent extends DomainEvent {
    type: 'vehicle.acquired';
    entityType: 'vehicle';
    payload: {
        vehicleId: string;
        vin: string;
        make: string;
        model: string;
        year: number;
        acquiredAt: string;
        cost: number;
    };
}
interface VehicleAgedEvent extends DomainEvent {
    type: 'vehicle.aged';
    entityType: 'vehicle';
    payload: {
        vehicleId: string;
        daysInInventory: number;
        threshold: number;
    };
}
interface TitleReceivedEvent extends DomainEvent {
    type: 'title.received';
    entityType: 'title';
    payload: {
        titleId: string;
        vehicleId: string;
        receivedAt: string;
    };
}
interface TitleIssueEvent extends DomainEvent {
    type: 'title.issue';
    entityType: 'title';
    payload: {
        titleId: string;
        issue: string;
        severity: 'minor' | 'major' | 'critical';
    };
}

/**
 * Event Projector - Normalize events → canonical entity state
 */

interface EntityState {
    id: string;
    type: 'deal' | 'ro' | 'vehicle' | 'title' | 'parts' | 'inventory';
    tenantId: string;
    currentState: string;
    ownerId?: string;
    ownerRole?: string;
    teamId?: string;
    nextState?: string;
    timeInState: number;
    lastUpdated: string;
    metadata: Record<string, any>;
}
/**
 * Project event into entity state
 */
declare function projectEvent(event: DomainEvent): EntityState;
/**
 * Get current entity state
 */
declare function getEntityState(entityType: string, entityId: string): EntityState | undefined;
/**
 * Query states by criteria
 */
declare function queryStates(filter: {
    type?: string;
    tenantId?: string;
    currentState?: string;
    ownerId?: string;
    minTimeInState?: number;
}): EntityState[];
/**
 * Clear all states (testing)
 */
declare function clearStates(): void;

/**
 * PubSub - Redis channels for real-time updates
 * (Simplified in-memory implementation; replace with Redis in production)
 */

type Subscriber = (event: DomainEvent) => void;
/**
 * Publish event to channel
 */
declare function publish(channel: string, event: DomainEvent): void;
/**
 * Subscribe to channel
 */
declare function subscribe(channel: string, handler: Subscriber): () => void;
/**
 * Unsubscribe all from channel
 */
declare function unsubscribeAll(channel: string): void;
/**
 * Get channel patterns
 */
declare const Channels: {
    readonly tenant: (tenantId: string) => string;
    readonly deal: (tenantId: string) => string;
    readonly ro: (tenantId: string) => string;
    readonly vehicle: (tenantId: string) => string;
    readonly title: (tenantId: string) => string;
    readonly entity: (tenantId: string, type: string, id: string) => string;
    readonly user: (tenantId: string, userId: string) => string;
};

export { Channels, type DealCreatedEvent, type DealStateChangedEvent, type DomainEvent, type DomainEventType, type EntityState, type ROCreatedEvent, type ROStateChangedEvent, type TitleIssueEvent, type TitleReceivedEvent, type VehicleAcquiredEvent, type VehicleAgedEvent, clearStates, getEntityState, projectEvent, publish, queryStates, subscribe, unsubscribeAll };
