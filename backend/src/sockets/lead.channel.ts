import type { Socket } from 'socket.io';
import { getSocketServer, getTenantRoomName } from '../lib/socket.js';

const EVENTS = {
  created: 'lead:created',
  updated: 'lead:updated',
  deleted: 'lead:deleted',
  assigned: 'lead:assigned',
  converted: 'lead:converted',
  scoreUpdated: 'lead:scoreUpdated',
} as const;

function leadRoom(tenantId: string, leadId: string) {
  return `${getTenantRoomName(tenantId)}:lead:${leadId}`;
}

function broadcast(tenantId: string, event: string, payload: unknown, leadId?: string) {
  const io = getSocketServer();
  if (!io) {
    return;
  }
  io.to(getTenantRoomName(tenantId)).emit(event, payload);
  if (leadId) {
    io.to(leadRoom(tenantId, leadId)).emit(event, payload);
  }
}

export function registerLeadChannel(socket: Socket, tenantId?: string) {
  if (!tenantId) {
    return;
  }

  socket.on('lead:subscribe', (leadId: unknown) => {
    if (typeof leadId === 'string' && leadId.trim().length > 0) {
      socket.join(leadRoom(tenantId, leadId));
    }
  });

  socket.on('lead:unsubscribe', (leadId: unknown) => {
    if (typeof leadId === 'string' && leadId.trim().length > 0) {
      socket.leave(leadRoom(tenantId, leadId));
    }
  });
}

export function emitLeadCreated(tenantId: string, lead: unknown) {
  broadcast(tenantId, EVENTS.created, lead, (lead as any)?.id);
}

export function emitLeadUpdated(tenantId: string, lead: unknown) {
  broadcast(tenantId, EVENTS.updated, lead, (lead as any)?.id);
}

export function emitLeadDeleted(tenantId: string, leadId: string) {
  broadcast(tenantId, EVENTS.deleted, { id: leadId }, leadId);
}

export function emitLeadAssigned(tenantId: string, lead: unknown) {
  broadcast(tenantId, EVENTS.assigned, lead, (lead as any)?.id);
}

export function emitLeadConverted(tenantId: string, lead: unknown) {
  broadcast(tenantId, EVENTS.converted, lead, (lead as any)?.id);
}

export function emitLeadScoreUpdated(
  tenantId: string,
  payload: { leadId: string; score: number; scoreDelta: number | null },
) {
  broadcast(tenantId, EVENTS.scoreUpdated, payload, payload.leadId);
}

