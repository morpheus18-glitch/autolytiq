import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import express from 'express';
import { createApp } from './server.js';

// Import socket-related modules
async function startServer() {
  const app = await createApp();

  // Serve static client files in production (Replit single-port mode)
  if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
    const publicPath = path.resolve(process.cwd(), 'public');
    app.use(express.static(publicPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(publicPath, 'index.html'));
    });
  }

  const httpServer = createServer(app);

  // Set up Socket.IO if needed
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.SOCKET_IO_CORS_ORIGIN?.split(',').map((entry) => entry.trim()) || '*',
      credentials: true,
    },
  });

  // Register socket handlers (if they exist)
  try {
    const { registerSocket, getTenantRoom } = await import('./lib/socket.js');
    const { registerLeadChannel } = await import('./sockets/lead.channel.js');

    registerSocket(io);

    io.on('connection', (socket) => {
      const rawTenantId = socket.handshake.query.tenantId;
      const tenantId = typeof rawTenantId === 'string' && rawTenantId.length > 0 ? rawTenantId : undefined;
      socket.join(getTenantRoom(tenantId ?? 'public'));
      registerLeadChannel(socket, tenantId);

      socket.on('disconnect', () => {
        // noop for now; hooks reserved for future realtime CRM events
      });
    });
  } catch (err) {
    console.warn('Socket.IO handlers not found, continuing without websockets', err);
  }

  const PORT = Number(process.env.PORT) || 5000;
  httpServer.listen(PORT, () => {
    console.log(`[AutolytiQ] API listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
