/**
 * Domain Events - Typed event definitions for deal|ro|vehicle|title|parts|inventory
 */

export type DomainEventType =
  | 'deal.created' | 'deal.updated' | 'deal.stateChanged' | 'deal.assigned' | 'deal.closed'
  | 'ro.created' | 'ro.updated' | 'ro.stateChanged' | 'ro.closed'
  | 'vehicle.acquired' | 'vehicle.priced' | 'vehicle.sold' | 'vehicle.aged'
  | 'title.received' | 'title.submitted' | 'title.cleared' | 'title.issue'
  | 'parts.ordered' | 'parts.received' | 'parts.installed'
  | 'inventory.added' | 'inventory.updated' | 'inventory.removed';

export interface DomainEvent<T = any> {
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

// Deal Events
export interface DealCreatedEvent extends DomainEvent {
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

export interface DealStateChangedEvent extends DomainEvent {
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

// RO (Repair Order) Events
export interface ROCreatedEvent extends DomainEvent {
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

export interface ROStateChangedEvent extends DomainEvent {
  type: 'ro.stateChanged';
  entityType: 'ro';
  payload: {
    roId: string;
    fromState: string;
    toState: string;
    stateChangedAt: string;
  };
}

// Vehicle Events
export interface VehicleAcquiredEvent extends DomainEvent {
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

export interface VehicleAgedEvent extends DomainEvent {
  type: 'vehicle.aged';
  entityType: 'vehicle';
  payload: {
    vehicleId: string;
    daysInInventory: number;
    threshold: number;
  };
}

// Title Events
export interface TitleReceivedEvent extends DomainEvent {
  type: 'title.received';
  entityType: 'title';
  payload: {
    titleId: string;
    vehicleId: string;
    receivedAt: string;
  };
}

export interface TitleIssueEvent extends DomainEvent {
  type: 'title.issue';
  entityType: 'title';
  payload: {
    titleId: string;
    issue: string;
    severity: 'minor' | 'major' | 'critical';
  };
}
