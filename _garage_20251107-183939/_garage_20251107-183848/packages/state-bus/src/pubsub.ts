/**
 * PubSub - Redis channels for real-time updates
 * (Simplified in-memory implementation; replace with Redis in production)
 */

import type { DomainEvent } from './events.js';

type Subscriber = (event: DomainEvent) => void;

const channels = new Map<string, Set<Subscriber>>();

/**
 * Publish event to channel
 */
export function publish(channel: string, event: DomainEvent): void {
  const subscribers = channels.get(channel);
  if (subscribers) {
    subscribers.forEach(fn => {
      try {
        fn(event);
      } catch (err) {
        console.error(`Subscriber error on channel ${channel}:`, err);
      }
    });
  }
}

/**
 * Subscribe to channel
 */
export function subscribe(channel: string, handler: Subscriber): () => void {
  if (!channels.has(channel)) {
    channels.set(channel, new Set());
  }
  
  channels.get(channel)!.add(handler);
  
  // Return unsubscribe function
  return () => {
    channels.get(channel)?.delete(handler);
  };
}

/**
 * Unsubscribe all from channel
 */
export function unsubscribeAll(channel: string): void {
  channels.delete(channel);
}

/**
 * Get channel patterns
 */
export const Channels = {
  // All events for a tenant
  tenant: (tenantId: string) => `tenant:${tenantId}:*`,
  
  // Specific entity type events
  deal: (tenantId: string) => `tenant:${tenantId}:deal:*`,
  ro: (tenantId: string) => `tenant:${tenantId}:ro:*`,
  vehicle: (tenantId: string) => `tenant:${tenantId}:vehicle:*`,
  title: (tenantId: string) => `tenant:${tenantId}:title:*`,
  
  // Specific entity
  entity: (tenantId: string, type: string, id: string) => 
    `tenant:${tenantId}:${type}:${id}`,
    
  // User's owned entities
  user: (tenantId: string, userId: string) => 
    `tenant:${tenantId}:user:${userId}:*`,
} as const;
