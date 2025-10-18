import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { getTenantRoomName, registerSocketServer } from './lib/socket.js';
import { registerLeadChannel } from './sockets/lead.channel.js';

const app = await createApp();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.SOCKET_IO_CORS_ORIGIN.split(',').map((entry) => entry.trim()),
    credentials: true,
  },
});

registerSocketServer(io);

io.on('connection', (socket) => {
  const rawTenantId = socket.handshake.query.tenantId;
  const tenantId = typeof rawTenantId === 'string' && rawTenantId.length > 0 ? rawTenantId : undefined;
  socket.join(getTenantRoomName(tenantId ?? 'public'));
  registerLeadChannel(socket, tenantId);

  socket.on('disconnect', () => {
    // noop for now; hooks reserved for future realtime CRM events
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`[AutolytiQ] API listening on port ${env.PORT}`);
});
