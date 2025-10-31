import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import path from 'path';
import express from 'express';
import { createApp } from './server.js';
import { logger } from './lib/logger.js';

// Global error handlers for uncaught errors
process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
  logger.error('Unhandled Promise Rejection', reason as Error, {
    promise: String(promise),
  });
});

process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception', error);
  // Give time for logs to flush then exit
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

// Import socket-related modules
async function startServer() {
  try {
    logger.info('Starting AutolytiQ server...', {
      nodeEnv: process.env.NODE_ENV,
      port: process.env.PORT || 5000,
    });

    const app = await createApp();

    // Serve static client files in production (Replit single-port mode)
    if (process.env.NODE_ENV === 'production' || process.env.SERVE_STATIC === 'true') {
      const publicPath = path.resolve(process.cwd(), 'public');
      logger.info('Serving static files', { publicPath });
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
      
      logger.info('Socket.IO initialized successfully');
    } catch (err) {
      logger.warn('Socket.IO handlers not found, continuing without websockets', { error: (err as Error).message });
    }

    const PORT = Number(process.env.PORT) || 5000;
    httpServer.listen(PORT, () => {
      logger.info('AutolytiQ API server started successfully', {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        nodeVersion: process.version,
      });
      console.log(`[AutolytiQ] API listening on port ${PORT}`);
    });

    // Handle graceful shutdown
    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, shutting down gracefully...');
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });

    process.on('SIGINT', () => {
      logger.info('SIGINT received, shutting down gracefully...');
      httpServer.close(() => {
        logger.info('Server closed');
        process.exit(0);
      });
    });
  } catch (err) {
    logger.error('Failed to start server', err as Error);
    throw err;
  }
}

startServer().catch((err) => {
  logger.error('Fatal startup error', err);
  console.error('Failed to start server:', err);
  process.exit(1);
});
