import { createServer } from 'node:http';
import { Server as SocketIOServer, type Socket } from 'socket.io';
import { createApp } from './server.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';
import { getTenantRoom, registerSocket } from './lib/socket.js';
import { initializeQueues, shutdownQueues } from './queues/index.js';

const app = createApp();
const httpServer = createServer(app);

type ClientToServerEvents = {
  'tenant:subscribe': (
    tenantId: string,
    ack?: (response: { ok: boolean; message?: string }) => void,
  ) => void;
  'tenant:unsubscribe': (
    tenantId: string,
    ack?: (response: { ok: boolean; message?: string }) => void,
  ) => void;
};

type ServerToClientEvents = {
  ready: (payload: { socketId: string }) => void;
  error: (payload: { message: string }) => void;
};

type InterServerEvents = Record<string, never>;

interface TenantSocketData {
  tenantId?: string;
}

type TenantSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  TenantSocketData
>;

const io = new SocketIOServer<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  TenantSocketData
>(httpServer, {
  cors: {
    origin: env.SOCKET_IO_CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

registerSocket(io);

async function joinTenantRoom(socket: TenantSocket, tenantId: string) {
  await socket.join(getTenantRoom(tenantId));
  socket.data.tenantId = tenantId;
}

async function leaveTenantRoom(socket: TenantSocket, tenantId?: string) {
  if (!tenantId) {
    return;
  }

  await socket.leave(getTenantRoom(tenantId));
  delete socket.data.tenantId;
}

io.on('connection', (socket) => {
  socket.emit('ready', { socketId: socket.id });

  socket.on('tenant:subscribe', async (tenantId, ack) => {
    if (!tenantId) {
      ack?.({ ok: false, message: 'tenantId is required' });
      socket.emit('error', { message: 'Unable to subscribe without a tenantId.' });
      return;
    }

    try {
      await joinTenantRoom(socket, tenantId);
      ack?.({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to join tenant room';
      ack?.({ ok: false, message });
      socket.emit('error', { message });
    }
  });

  socket.on('tenant:unsubscribe', async (tenantId, ack) => {
    const targetTenantId = tenantId || socket.data.tenantId;

    if (!targetTenantId) {
      ack?.({ ok: false, message: 'No tenant subscription found to remove.' });
      return;
    }

    try {
      await leaveTenantRoom(socket, targetTenantId);
      ack?.({ ok: true });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to leave tenant room';
      ack?.({ ok: false, message });
      socket.emit('error', { message });
    }
  });

  socket.on('disconnect', async () => {
    await leaveTenantRoom(socket, socket.data.tenantId);
  });
});

const port = env.PORT;

initializeQueues();

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});

const shutdown = async () => {
  await io.close();
  await prisma.$disconnect();
  await shutdownQueues();
  httpServer.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
