import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './app.js';
import { env } from './config/env.js';

const app = await createApp();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.SOCKET_IO_CORS_ORIGIN.split(',').map((entry) => entry.trim()),
    credentials: true,
  },
});

io.on('connection', (socket) => {
  socket.join(`tenant:${socket.handshake.query.tenantId ?? 'public'}`);

  socket.on('disconnect', () => {
    // noop for now; hooks reserved for future realtime CRM events
  });
});

httpServer.listen(env.PORT, () => {
  console.log(`[AutolytiQ] API listening on port ${env.PORT}`);
});
