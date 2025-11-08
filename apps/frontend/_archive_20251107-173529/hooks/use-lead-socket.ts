import { useEffect, useMemo, useState } from 'react';
import type { Socket } from 'socket.io-client';
import { io } from 'socket.io-client';
import { API_BASE_URL } from '@/config/api';
import type { Lead, LeadActivityItem, LeadStatus } from '@/types/leads';

export interface LeadSocketHandlers {
  onLeadCreated?: (lead: Lead) => void;
  onLeadUpdated?: (lead: Lead) => void;
  onLeadStatusChanged?: (payload: { id: string; status: LeadStatus }) => void;
  onActivityCreated?: (activity: LeadActivityItem) => void;
}

export interface UseLeadSocketOptions extends LeadSocketHandlers {
  tenantId?: string | null;
  autoJoin?: boolean;
}

const SOCKET_PATH = '/socket.io';

function resolveTenantId(explicitTenantId?: string | null): string {
  if (explicitTenantId) {
    return explicitTenantId;
  }

  if (typeof window !== 'undefined') {
    return (
      window.localStorage.getItem('autolytiq_tenant_id') ||
      window.sessionStorage.getItem('autolytiq_tenant_id') ||
      'default'
    );
  }

  return 'default';
}

export function useLeadSocket({ tenantId: providedTenantId, autoJoin = true, ...handlers }: UseLeadSocketOptions) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const resolvedTenantId = useMemo(() => resolveTenantId(providedTenantId), [providedTenantId]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const instance = io(API_BASE_URL || window.location.origin, {
      path: SOCKET_PATH,
      transports: ['websocket'],
      withCredentials: true,
      autoConnect: false,
    });

    setSocket(instance);

    return () => {
      instance.disconnect();
      setSocket(null);
    };
  }, []);

  useEffect(() => {
    if (!socket) {
      return;
    }

    socket.connect();

    const handleConnect = () => {
      setIsConnected(true);

      if (autoJoin) {
        socket.emit('leads:join', { tenantId: resolvedTenantId });
      }
    };

    const handleDisconnect = () => setIsConnected(false);

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);

    if (handlers.onLeadCreated) {
      socket.on('leads:created', handlers.onLeadCreated);
    }

    if (handlers.onLeadUpdated) {
      socket.on('leads:updated', handlers.onLeadUpdated);
    }

    if (handlers.onLeadStatusChanged) {
      socket.on('leads:status', handlers.onLeadStatusChanged);
    }

    if (handlers.onActivityCreated) {
      socket.on('leads:activity', handlers.onActivityCreated);
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);

      if (handlers.onLeadCreated) {
        socket.off('leads:created', handlers.onLeadCreated);
      }

      if (handlers.onLeadUpdated) {
        socket.off('leads:updated', handlers.onLeadUpdated);
      }

      if (handlers.onLeadStatusChanged) {
        socket.off('leads:status', handlers.onLeadStatusChanged);
      }

      if (handlers.onActivityCreated) {
        socket.off('leads:activity', handlers.onActivityCreated);
      }
    };
  }, [socket, resolvedTenantId, autoJoin, handlers.onLeadCreated, handlers.onLeadStatusChanged, handlers.onLeadUpdated, handlers.onActivityCreated]);

  return { socket, isConnected, tenantId: resolvedTenantId } as const;
}
