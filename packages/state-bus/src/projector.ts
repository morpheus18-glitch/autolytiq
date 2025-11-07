/**
 * Event Projector - Normalize events → canonical entity state
 */

import type { DomainEvent } from './events.js';

export interface EntityState {
  id: string;
  type: 'deal' | 'ro' | 'vehicle' | 'title' | 'parts' | 'inventory';
  tenantId: string;
  currentState: string;
  ownerId?: string;
  ownerRole?: string;
  teamId?: string;
  nextState?: string;
  timeInState: number; // milliseconds
  lastUpdated: string;
  metadata: Record<string, any>;
}

const stateStore = new Map<string, EntityState>();

/**
 * Project event into entity state
 */
export function projectEvent(event: DomainEvent): EntityState {
  const key = `${event.entityType}:${event.entityId}`;
  const existing = stateStore.get(key);
  
  const now = new Date(event.timestamp);
  const lastUpdated = existing ? new Date(existing.lastUpdated) : now;
  const timeInState = existing 
    ? (now.getTime() - lastUpdated.getTime())
    : 0;
  
  let state: EntityState;
  
  switch (event.type) {
    case 'deal.created':
      state = {
        id: event.payload.dealId,
        type: 'deal',
        tenantId: event.tenantId,
        currentState: event.payload.state,
        ownerId: event.payload.salesPersonId,
        ownerRole: 'SALESPERSON',
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload,
      };
      break;
      
    case 'deal.stateChanged':
      state = existing || createDefaultState(event);
      state.currentState = event.payload.toState;
      state.timeInState = 0; // Reset on state change
      state.lastUpdated = event.timestamp;
      state.metadata.previousState = event.payload.fromState;
      break;
      
    case 'ro.created':
      state = {
        id: event.payload.roId,
        type: 'ro',
        tenantId: event.tenantId,
        currentState: event.payload.state,
        ownerId: event.payload.advisorId,
        ownerRole: 'SERVICE_ADVISOR',
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload,
      };
      break;
      
    case 'ro.stateChanged':
      state = existing || createDefaultState(event);
      state.currentState = event.payload.toState;
      state.timeInState = 0;
      state.lastUpdated = event.timestamp;
      break;
      
    case 'vehicle.acquired':
      state = {
        id: event.payload.vehicleId,
        type: 'vehicle',
        tenantId: event.tenantId,
        currentState: 'in-stock',
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload,
      };
      break;
      
    case 'title.received':
      state = {
        id: event.payload.titleId,
        type: 'title',
        tenantId: event.tenantId,
        currentState: 'received',
        timeInState: 0,
        lastUpdated: event.timestamp,
        metadata: event.payload,
      };
      break;
      
    default:
      // Generic projection
      state = existing || createDefaultState(event);
      state.lastUpdated = event.timestamp;
      if (existing) {
        state.timeInState = timeInState;
      }
  }
  
  stateStore.set(key, state);
  return state;
}

/**
 * Create default state from event
 */
function createDefaultState(event: DomainEvent): EntityState {
  return {
    id: event.entityId,
    type: event.entityType,
    tenantId: event.tenantId,
    currentState: 'unknown',
    timeInState: 0,
    lastUpdated: event.timestamp,
    metadata: event.payload,
  };
}

/**
 * Get current entity state
 */
export function getEntityState(entityType: string, entityId: string): EntityState | undefined {
  return stateStore.get(`${entityType}:${entityId}`);
}

/**
 * Query states by criteria
 */
export function queryStates(filter: {
  type?: string;
  tenantId?: string;
  currentState?: string;
  ownerId?: string;
  minTimeInState?: number;
}): EntityState[] {
  return Array.from(stateStore.values()).filter(state => {
    if (filter.type && state.type !== filter.type) return false;
    if (filter.tenantId && state.tenantId !== filter.tenantId) return false;
    if (filter.currentState && state.currentState !== filter.currentState) return false;
    if (filter.ownerId && state.ownerId !== filter.ownerId) return false;
    if (filter.minTimeInState && state.timeInState < filter.minTimeInState) return false;
    return true;
  });
}

/**
 * Clear all states (testing)
 */
export function clearStates(): void {
  stateStore.clear();
}
