import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage } from 'http';
import { parse } from 'url';
import jwt from 'jsonwebtoken';

interface WebSocketClient {
  id: string;
  socket: WebSocket;
  storeId?: string;
  userId?: string;
  isAuthenticated: boolean;
  subscriptions: Set<string>;
  lastPing: number;
}

interface WebSocketMessage {
  type: string;
  event: string;
  data: any;
  targetStore?: string;
  targetUser?: string;
  timestamp: number;
}

export class EnterpriseWebSocketManager {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocketClient> = new Map();
  private channels: Map<string, Set<string>> = new Map();
  private heartbeatInterval!: NodeJS.Timeout;

  constructor(server: any) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/ws',
      verifyClient: this.verifyClient.bind(this)
    });

    this.wss.on('connection', this.handleConnection.bind(this));
    this.startHeartbeat();
    
    console.log('🔌 Enterprise WebSocket server initialized');
  }

  private verifyClient(info: { origin: string; secure: boolean; req: IncomingMessage }): boolean {
    // Add origin verification, rate limiting, etc.
    const allowedOrigins = ['https://autolytiq.com', 'http://localhost:5000'];
    return allowedOrigins.includes(info.origin) || process.env.NODE_ENV === 'development';
  }

  private handleConnection(socket: WebSocket, request: IncomingMessage) {
    const clientId = this.generateClientId();
    const client: WebSocketClient = {
      id: clientId,
      socket,
      isAuthenticated: false,
      subscriptions: new Set(),
      lastPing: Date.now()
    };

    this.clients.set(clientId, client);
    console.log(`🔗 WebSocket client connected: ${clientId}`);

    // Send welcome message
    this.sendToClient(clientId, {
      type: 'system',
      event: 'connected',
      data: { clientId },
      timestamp: Date.now()
    });

    socket.on('message', (data) => this.handleMessage(clientId, data));
    socket.on('close', () => this.handleDisconnection(clientId));
    socket.on('error', (error) => this.handleError(clientId, error));
    socket.on('pong', () => this.handlePong(clientId));
  }

  private handleMessage(clientId: string, data: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      const message = JSON.parse(data.toString());
      
      switch (message.type) {
        case 'auth':
          this.handleAuthentication(clientId, message);
          break;
        case 'subscribe':
          this.handleSubscription(clientId, message);
          break;
        case 'unsubscribe':
          this.handleUnsubscription(clientId, message);
          break;
        case 'deal_update':
          this.handleDealUpdate(clientId, message);
          break;
        case 'inventory_sync':
          this.handleInventorySync(clientId, message);
          break;
        case 'customer_notification':
          this.handleCustomerNotification(clientId, message);
          break;
        case 'ping':
          this.handlePing(clientId);
          break;
        default:
          console.log(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error parsing WebSocket message from ${clientId}:`, error);
    }
  }

  private async handleAuthentication(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    try {
      // Verify JWT token
      const decoded = jwt.verify(message.token, process.env.JWT_SECRET || 'fallback_secret') as any;
      
      client.userId = decoded.userId;
      client.storeId = decoded.storeId;
      client.isAuthenticated = true;

      // Subscribe to user and store channels
      this.addToChannel(`user:${client.userId}`, clientId);
      this.addToChannel(`store:${client.storeId}`, clientId);

      this.sendToClient(clientId, {
        type: 'auth',
        event: 'success',
        data: { userId: client.userId, storeId: client.storeId },
        timestamp: Date.now()
      });

      console.log(`✅ WebSocket client authenticated: ${clientId} (User: ${client.userId}, Store: ${client.storeId})`);
    } catch (error) {
      this.sendToClient(clientId, {
        type: 'auth',
        event: 'error',
        data: { error: 'Invalid token' },
        timestamp: Date.now()
      });
    }
  }

  private handleSubscription(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.isAuthenticated) return;

    const { channel } = message;
    client.subscriptions.add(channel);
    this.addToChannel(channel, clientId);

    this.sendToClient(clientId, {
      type: 'subscription',
      event: 'success',
      data: { channel },
      timestamp: Date.now()
    });
  }

  private handleUnsubscription(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client) return;

    const { channel } = message;
    client.subscriptions.delete(channel);
    this.removeFromChannel(channel, clientId);
  }

  private handleDealUpdate(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.isAuthenticated) return;

    // Broadcast deal update to store members
    this.broadcastToChannel(`store:${client.storeId}`, {
      type: 'deal_update',
      event: 'updated',
      data: {
        dealId: message.dealId,
        changes: message.changes,
        updatedBy: client.userId
      },
      timestamp: Date.now()
    }, clientId);
  }

  private handleInventorySync(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.isAuthenticated) return;

    // Broadcast inventory changes to all stores (if multi-store sync enabled)
    this.broadcastToAllStores({
      type: 'inventory_sync',
      event: 'updated',
      data: {
        vehicleId: message.vehicleId,
        changes: message.changes,
        storeId: client.storeId
      },
      timestamp: Date.now()
    });
  }

  private handleCustomerNotification(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (!client || !client.isAuthenticated) return;

    // Send notification to specific customer/user
    if (message.targetUserId) {
      this.sendToChannel(`user:${message.targetUserId}`, {
        type: 'notification',
        event: 'new',
        data: message.data,
        timestamp: Date.now()
      });
    }
  }

  private handlePing(clientId: string) {
    const client = this.clients.get(clientId);
    if (!client) return;

    client.lastPing = Date.now();
    this.sendToClient(clientId, {
      type: 'pong',
      event: 'heartbeat',
      data: { timestamp: Date.now() },
      timestamp: Date.now()
    });
  }

  private handlePong(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.lastPing = Date.now();
    }
  }

  private handleDisconnection(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      // Remove from all channels
      client.subscriptions.forEach(channel => {
        this.removeFromChannel(channel, clientId);
      });

      // Remove from user and store channels
      if (client.userId) {
        this.removeFromChannel(`user:${client.userId}`, clientId);
      }
      if (client.storeId) {
        this.removeFromChannel(`store:${client.storeId}`, clientId);
      }
    }

    this.clients.delete(clientId);
    console.log(`🔌 WebSocket client disconnected: ${clientId}`);
  }

  private handleError(clientId: string, error: Error) {
    console.error(`WebSocket error for client ${clientId}:`, error);
  }

  // Channel management
  private addToChannel(channel: string, clientId: string) {
    if (!this.channels.has(channel)) {
      this.channels.set(channel, new Set());
    }
    this.channels.get(channel)!.add(clientId);
  }

  private removeFromChannel(channel: string, clientId: string) {
    const channelClients = this.channels.get(channel);
    if (channelClients) {
      channelClients.delete(clientId);
      if (channelClients.size === 0) {
        this.channels.delete(channel);
      }
    }
  }

  // Broadcasting methods
  public broadcastToChannel(channel: string, message: WebSocketMessage, excludeClient?: string) {
    const channelClients = this.channels.get(channel);
    if (!channelClients) return;

    channelClients.forEach(clientId => {
      if (clientId !== excludeClient) {
        this.sendToClient(clientId, message);
      }
    });
  }

  public sendToChannel(channel: string, message: WebSocketMessage) {
    this.broadcastToChannel(channel, message);
  }

  public broadcastToStore(storeId: string, message: WebSocketMessage) {
    this.broadcastToChannel(`store:${storeId}`, message);
  }

  public broadcastToAllStores(message: WebSocketMessage) {
    // Get all store channels
    const storeChannels = Array.from(this.channels.keys()).filter(channel => channel.startsWith('store:'));
    storeChannels.forEach(channel => {
      this.broadcastToChannel(channel, message);
    });
  }

  public sendToUser(userId: string, message: WebSocketMessage) {
    this.sendToChannel(`user:${userId}`, message);
  }

  private sendToClient(clientId: string, message: WebSocketMessage) {
    const client = this.clients.get(clientId);
    if (client && client.socket.readyState === WebSocket.OPEN) {
      client.socket.send(JSON.stringify(message));
    }
  }

  // Heartbeat system
  private startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      const now = Date.now();
      const timeout = 30000; // 30 seconds

      this.clients.forEach((client, clientId) => {
        if (now - client.lastPing > timeout) {
          console.log(`🔌 Removing stale WebSocket client: ${clientId}`);
          client.socket.terminate();
          this.handleDisconnection(clientId);
        } else if (client.socket.readyState === WebSocket.OPEN) {
          client.socket.ping();
        }
      });
    }, 15000); // Check every 15 seconds
  }

  // Utility methods
  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  public getStats() {
    return {
      totalConnections: this.clients.size,
      authenticatedConnections: Array.from(this.clients.values()).filter(c => c.isAuthenticated).length,
      totalChannels: this.channels.size,
      channelStats: Array.from(this.channels.entries()).map(([channel, clients]) => ({
        channel,
        subscribers: clients.size
      }))
    };
  }

  public getStoreConnections(storeId: string) {
    return Array.from(this.clients.values()).filter(client => client.storeId === storeId);
  }

  // Cleanup
  public close() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.clients.forEach(client => {
      client.socket.close();
    });
    
    this.wss.close();
    console.log('🔌 Enterprise WebSocket server closed');
  }
}