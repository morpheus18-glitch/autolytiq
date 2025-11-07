import type { Server as SocketIOServer } from 'socket.io';

const TENANT_ROOM_PREFIX = 'tenant:' as const;

let socketServer: SocketIOServer | undefined;

export function registerSocket(server: SocketIOServer) {
  socketServer = server;
}

export const registerSocketServer = registerSocket;

export function getSocketServer(): SocketIOServer | undefined {
  return socketServer;
}

export function getTenantRoom(tenantId: string): string {
  return `${TENANT_ROOM_PREFIX}${tenantId}`;
}

export const getTenantRoomName = getTenantRoom;

export function emitTenantEvent<T>(tenantId: string, event: string, payload: T): void {
  socketServer?.to(getTenantRoom(tenantId)).emit(event, payload);
}

export { TENANT_ROOM_PREFIX };
