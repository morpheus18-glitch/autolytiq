import type { Server as SocketIOServer } from 'socket.io';

let io: SocketIOServer | null = null;

export function registerSocketServer(server: SocketIOServer) {
  io = server;
}

export function getSocketServer(): SocketIOServer | null {
  return io;
}

export function getTenantRoomName(tenantId: string) {
  return `tenant:${tenantId}`;
}

export function emitToTenantRoom(tenantId: string, event: string, payload: unknown) {
  const server = getSocketServer();
  if (!server) {
    return;
  }
  server.to(getTenantRoomName(tenantId)).emit(event, payload);
}

