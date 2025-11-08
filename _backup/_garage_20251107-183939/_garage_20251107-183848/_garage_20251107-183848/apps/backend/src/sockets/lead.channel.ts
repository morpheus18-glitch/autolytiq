import type { Socket } from 'socket.io';
import { emitTenantEvent, getTenantRoom } from '../lib/socket';

const PUBLIC_TENANT_ID = 'public';
const LEAD_ROOM_PREFIX = 'lead';

type LeadIdentifier = string | { leadId: string } | { id: string };

type LeadUpdatePayload = {
  id: string;
  [key: string]: unknown;
};

function resolveTenantId(tenantId?: string): string {
  return tenantId && tenantId.length > 0 ? tenantId : PUBLIC_TENANT_ID;
}

function extractLeadId(input: LeadIdentifier | undefined): string | undefined {
  if (!input) {
    return undefined;
  }

  if (typeof input === 'string') {
    return input;
  }

  if (typeof input === 'object') {
    if ('leadId' in input && typeof input.leadId === 'string') {
      return input.leadId;
    }

    if ('id' in input && typeof input.id === 'string') {
      return input.id;
    }
  }

  return undefined;
}

function getLeadRoomName(tenantRoom: string, leadId: string): string {
  return `${tenantRoom}:${LEAD_ROOM_PREFIX}:${leadId}`;
}

export function registerLeadChannel(socket: Socket, tenantId?: string): void {
  const resolvedTenantId = resolveTenantId(tenantId);
  const tenantRoom = getTenantRoom(resolvedTenantId);

  const joinLeadRoom = (leadIdentifier: LeadIdentifier | undefined) => {
    const leadId = extractLeadId(leadIdentifier);
    if (!leadId) {
      return;
    }

    const leadRoom = getLeadRoomName(tenantRoom, leadId);
    socket.join(leadRoom);
  };

  const leaveLeadRoom = (leadIdentifier: LeadIdentifier | undefined) => {
    const leadId = extractLeadId(leadIdentifier);
    if (!leadId) {
      return;
    }

    const leadRoom = getLeadRoomName(tenantRoom, leadId);
    socket.leave(leadRoom);
  };

  socket.on('lead:subscribe', (leadIdentifier: LeadIdentifier) => {
    joinLeadRoom(leadIdentifier);
  });

  socket.on('lead:unsubscribe', (leadIdentifier: LeadIdentifier) => {
    leaveLeadRoom(leadIdentifier);
  });

  socket.on('lead:updated', (payload: LeadUpdatePayload) => {
    emitTenantEvent(resolvedTenantId, 'lead:updated', payload);

    if (payload?.id) {
      const leadRoom = getLeadRoomName(tenantRoom, payload.id);
      socket.to(leadRoom).emit('lead:updated', payload);
    }
  });
}
