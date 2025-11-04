/**
 * useLivePricing Hook
 *
 * WebSocket connection for live pricing updates from Rust service
 * Subscribes to real-time market pricing and rate changes
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getPricingWebSocket } from '@/lib/pricingService';

export interface PricingUpdate {
  type: 'pricing-update' | 'rate-update' | 'market-change';
  timestamp: number;
  data: {
    vehicleId?: string;
    marketPrice?: number;
    estimatedValue?: number;
    apr?: number;
    lenderName?: string;
    change?: number;
    changePercent?: number;
  };
}

interface UseLivePricingOptions {
  /** Vehicle ID to track */
  vehicleId?: string;
  /** Auto-connect on mount */
  autoConnect?: boolean;
  /** Reconnect on disconnect */
  autoReconnect?: boolean;
  /** Callback when pricing updates */
  onPricingUpdate?: (update: PricingUpdate) => void;
  /** Callback when rate updates */
  onRateUpdate?: (update: PricingUpdate) => void;
  /** Callback on connection error */
  onError?: (error: Error) => void;
}

interface UseLivePricingReturn {
  /** Whether WebSocket is connected */
  isConnected: boolean;
  /** Latest pricing update */
  latestUpdate: PricingUpdate | null;
  /** Manually connect */
  connect: () => void;
  /** Manually disconnect */
  disconnect: () => void;
  /** Subscribe to vehicle pricing updates */
  subscribeToVehicle: (vehicleId: string) => void;
  /** Unsubscribe from vehicle */
  unsubscribeFromVehicle: (vehicleId: string) => void;
}

/**
 * Hook for live pricing updates via WebSocket
 */
export function useLivePricing(
  options: UseLivePricingOptions = {}
): UseLivePricingReturn {
  const {
    vehicleId,
    autoConnect = true,
    autoReconnect = true,
    onPricingUpdate,
    onRateUpdate,
    onError,
  } = options;

  const [isConnected, setIsConnected] = useState(false);
  const [latestUpdate, setLatestUpdate] = useState<PricingUpdate | null>(null);

  const wsRef = useRef<ReturnType<typeof getPricingWebSocket> | null>(null);
  const subscribedVehiclesRef = useRef<Set<string>>(new Set());

  /**
   * Connect to WebSocket
   */
  const connect = useCallback(() => {
    try {
      if (!wsRef.current) {
        wsRef.current = getPricingWebSocket();
      }

      // Subscribe to pricing updates
      wsRef.current.subscribe('pricing-update', (data: any) => {
        const update: PricingUpdate = {
          type: 'pricing-update',
          timestamp: Date.now(),
          data,
        };

        setLatestUpdate(update);

        if (onPricingUpdate) {
          onPricingUpdate(update);
        }
      });

      // Subscribe to rate updates
      wsRef.current.subscribe('rate-update', (data: any) => {
        const update: PricingUpdate = {
          type: 'rate-update',
          timestamp: Date.now(),
          data,
        };

        setLatestUpdate(update);

        if (onRateUpdate) {
          onRateUpdate(update);
        }
      });

      // Subscribe to market changes
      wsRef.current.subscribe('market-change', (data: any) => {
        const update: PricingUpdate = {
          type: 'market-change',
          timestamp: Date.now(),
          data,
        };

        setLatestUpdate(update);
      });

      setIsConnected(true);
    } catch (err) {
      console.error('WebSocket connection failed:', err);
      setIsConnected(false);

      if (onError) {
        onError(err as Error);
      }

      // Auto-reconnect if enabled
      if (autoReconnect) {
        setTimeout(() => {
          connect();
        }, 5000);
      }
    }
  }, [autoReconnect, onPricingUpdate, onRateUpdate, onError]);

  /**
   * Disconnect from WebSocket
   */
  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.disconnect();
      wsRef.current = null;
    }

    setIsConnected(false);
    subscribedVehiclesRef.current.clear();
  }, []);

  /**
   * Subscribe to specific vehicle updates
   */
  const subscribeToVehicle = useCallback((vid: string) => {
    subscribedVehiclesRef.current.add(vid);

    // Send subscription message to WebSocket
    // (Implementation depends on Rust WebSocket protocol)
    if (wsRef.current) {
      // TODO: Send subscription message
      console.log(`Subscribed to vehicle: ${vid}`);
    }
  }, []);

  /**
   * Unsubscribe from vehicle updates
   */
  const unsubscribeFromVehicle = useCallback((vid: string) => {
    subscribedVehiclesRef.current.delete(vid);

    // Send unsubscription message to WebSocket
    if (wsRef.current) {
      // TODO: Send unsubscription message
      console.log(`Unsubscribed from vehicle: ${vid}`);
    }
  }, []);

  /**
   * Auto-connect on mount
   */
  useEffect(() => {
    if (autoConnect) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [autoConnect]);

  /**
   * Auto-subscribe to vehicleId
   */
  useEffect(() => {
    if (vehicleId && isConnected) {
      subscribeToVehicle(vehicleId);

      return () => {
        unsubscribeFromVehicle(vehicleId);
      };
    }
  }, [vehicleId, isConnected, subscribeToVehicle, unsubscribeFromVehicle]);

  return {
    isConnected,
    latestUpdate,
    connect,
    disconnect,
    subscribeToVehicle,
    unsubscribeFromVehicle,
  };
}

/**
 * Hook for tracking pricing staleness
 * Shows "Updated X seconds ago" timestamp
 */
export function usePricingStaleness(lastUpdate: PricingUpdate | null) {
  const [staleness, setStaleness] = useState<string>('Never updated');

  useEffect(() => {
    if (!lastUpdate) {
      setStaleness('Never updated');
      return;
    }

    const updateStaleness = () => {
      const now = Date.now();
      const diff = now - lastUpdate.timestamp;
      const seconds = Math.floor(diff / 1000);

      if (seconds < 5) {
        setStaleness('Just now');
      } else if (seconds < 60) {
        setStaleness(`${seconds}s ago`);
      } else {
        const minutes = Math.floor(seconds / 60);
        setStaleness(`${minutes}m ago`);
      }
    };

    updateStaleness();

    const interval = setInterval(updateStaleness, 1000);

    return () => clearInterval(interval);
  }, [lastUpdate]);

  return staleness;
}

/**
 * Hook for automatic pricing refresh
 * Polls for updates if WebSocket is disconnected
 */
export function useAutoRefreshPricing(
  vehicleId: string | undefined,
  isWebSocketConnected: boolean,
  refreshIntervalMs: number = 30000 // 30 seconds
) {
  const [lastRefresh, setLastRefresh] = useState<number>(Date.now());

  useEffect(() => {
    // Only poll if WebSocket is not connected
    if (!vehicleId || isWebSocketConnected) {
      return;
    }

    const interval = setInterval(() => {
      // TODO: Fetch latest pricing via REST API
      console.log(`Polling pricing for vehicle: ${vehicleId}`);
      setLastRefresh(Date.now());
    }, refreshIntervalMs);

    return () => clearInterval(interval);
  }, [vehicleId, isWebSocketConnected, refreshIntervalMs]);

  return lastRefresh;
}
