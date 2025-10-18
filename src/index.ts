import { createServer } from 'node:http';
import { Server as SocketIOServer } from 'socket.io';
import { createApp } from './server.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = createApp();
const httpServer = createServer(app);

const io = new SocketIOServer(httpServer, {
  cors: {
    origin: env.SOCKET_IO_CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
});

io.on('connection', (socket) => {
  socket.on('disconnect', () => {
    // intentionally empty for foundational setup
  });
});

const port = env.PORT;

httpServer.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`API listening on port ${port}`);
});

const shutdown = async () => {
  await io.close();
  await prisma.$disconnect();
  httpServer.close(() => process.exit(0));
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
