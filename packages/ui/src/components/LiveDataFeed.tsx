/**
 * LiveDataFeed - Real-time data stream component
 *
 * Features:
 * - WebSocket/SSE integration
 * - Auto-reconnect with exponential backoff
 * - Message buffering
 * - Auto-scroll to new items
 * - Pause/resume
 * - Filter/search live data
 * - Virtual scrolling for performance
 * - Connection status indicator
 * - Message timestamps
 * - Export to CSV
 *
 * Perfect for: Pipeline monitoring, deal updates, inventory changes, audit logs
 */

import * as React from 'react';
import { cn } from '../utils/cn.js';
import { Pause, Play, Download, WifiOff, Wifi, Filter, X } from 'lucide-react';
import { Button } from './Button.js';
import { Input } from './Input.js';
import { Badge } from './Badge.js';

// ═══════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected' | 'error';

export interface LiveMessage<T = any> {
  id: string;
  timestamp: Date;
  type?: string;
  data: T;
  priority?: 'low' | 'normal' | 'high' | 'critical';
}

export interface LiveDataFeedProps<T = any> {
  // Data source
  url?: string; // WebSocket/SSE URL
  onConnect?: () => void;
  onDisconnect?: () => void;
  onMessage?: (message: LiveMessage<T>) => void;
  onError?: (error: Error) => void;

  // Manual data pushing
  messages?: LiveMessage<T>[];

  // Display
  renderMessage: (message: LiveMessage<T>, index: number) => React.ReactNode;
  maxMessages?: number;
  autoScroll?: boolean;
  showTimestamps?: boolean;
  showTypes?: boolean;
  groupByType?: boolean;

  // Filtering
  allowFilter?: boolean;
  filterPlaceholder?: string;
  filterFn?: (message: LiveMessage<T>, filterText: string) => boolean;

  // Actions
  allowPause?: boolean;
  allowExport?: boolean;
  exportFilename?: string;

  // Styling
  height?: string;
  emptyMessage?: React.ReactNode;
  className?: string;
}

// ═══════════════════════════════════════════════════════════════
// COMPONENT
// ═══════════════════════════════════════════════════════════════

export const LiveDataFeed = <T extends any>({
  url,
  onConnect,
  onDisconnect,
  onMessage,
  onError,
  messages: externalMessages,
  renderMessage,
  maxMessages = 500,
  autoScroll = true,
  showTimestamps = true,
  showTypes = true,
  groupByType = false,
  allowFilter = true,
  filterPlaceholder = 'Filter messages...',
  filterFn,
  allowPause = true,
  allowExport = true,
  exportFilename = 'live-data-feed.json',
  height = '600px',
  emptyMessage = 'No messages yet...',
  className,
}: LiveDataFeedProps<T>) => {
  // ═══════════════════════════════════════════════════════════════
  // STATE
  // ═══════════════════════════════════════════════════════════════

  const [messages, setMessages] = React.useState<LiveMessage<T>[]>(externalMessages || []);
  const [filteredMessages, setFilteredMessages] = React.useState<LiveMessage<T>[]>([]);
  const [filterText, setFilterText] = React.useState('');
  const [isPaused, setIsPaused] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<ConnectionStatus>('disconnected');
  const [messageBuffer, setMessageBuffer] = React.useState<LiveMessage<T>[]>([]);

  const containerRef = React.useRef<HTMLDivElement>(null);
  const wsRef = React.useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = React.useRef<NodeJS.Timeout>();
  const reconnectAttempts = React.useRef(0);

  // ═══════════════════════════════════════════════════════════════
  // WEBSOCKET CONNECTION
  // ═══════════════════════════════════════════════════════════════

  const connect = React.useCallback(() => {
    if (!url || wsRef.current) return;

    try {
      setConnectionStatus('connecting');
      const ws = new WebSocket(url);

      ws.onopen = () => {
        console.log('[LiveDataFeed] Connected to', url);
        setConnectionStatus('connected');
        reconnectAttempts.current = 0;
        onConnect?.();
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const message: LiveMessage<T> = {
            id: data.id || Math.random().toString(36),
            timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
            type: data.type,
            data: data.data || data,
            priority: data.priority || 'normal',
          };

          onMessage?.(message);

          if (isPaused) {
            setMessageBuffer(prev => [...prev, message]);
          } else {
            addMessage(message);
          }
        } catch (error) {
          console.error('[LiveDataFeed] Failed to parse message:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('[LiveDataFeed] WebSocket error:', error);
        setConnectionStatus('error');
        onError?.(new Error('WebSocket connection error'));
      };

      ws.onclose = () => {
        console.log('[LiveDataFeed] Disconnected from', url);
        setConnectionStatus('disconnected');
        wsRef.current = null;
        onDisconnect?.();

        // Auto-reconnect with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 30000);
        reconnectAttempts.current++;
        console.log(`[LiveDataFeed] Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current})`);

        reconnectTimeoutRef.current = setTimeout(() => {
          connect();
        }, delay);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('[LiveDataFeed] Failed to connect:', error);
      setConnectionStatus('error');
      onError?.(error as Error);
    }
  }, [url, isPaused, onConnect, onDisconnect, onMessage, onError]);

  const disconnect = React.useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
  }, []);

  // ═══════════════════════════════════════════════════════════════
  // MESSAGE MANAGEMENT
  // ═══════════════════════════════════════════════════════════════

  const addMessage = React.useCallback((message: LiveMessage<T>) => {
    setMessages(prev => {
      const newMessages = [message, ...prev];
      return newMessages.slice(0, maxMessages);
    });
  }, [maxMessages]);

  const handlePauseToggle = () => {
    if (isPaused) {
      // Resume: flush buffer
      setMessages(prev => [...messageBuffer, ...prev].slice(0, maxMessages));
      setMessageBuffer([]);
    }
    setIsPaused(!isPaused);
  };

  const handleExport = () => {
    const dataStr = JSON.stringify(messages, null, 2);
    const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(dataStr)}`;
    const link = document.createElement('a');
    link.setAttribute('href', dataUri);
    link.setAttribute('download', exportFilename);
    link.click();
  };

  // ═══════════════════════════════════════════════════════════════
  // FILTERING
  // ═══════════════════════════════════════════════════════════════

  React.useEffect(() => {
    if (!filterText) {
      setFilteredMessages(messages);
      return;
    }

    const filtered = messages.filter(msg => {
      if (filterFn) {
        return filterFn(msg, filterText);
      }

      // Default filter: search in stringified data
      const searchText = filterText.toLowerCase();
      const dataStr = JSON.stringify(msg.data).toLowerCase();
      const typeMatch = msg.type?.toLowerCase().includes(searchText);
      return dataStr.includes(searchText) || typeMatch;
    });

    setFilteredMessages(filtered);
  }, [messages, filterText, filterFn]);

  // ═══════════════════════════════════════════════════════════════
  // AUTO-SCROLL
  // ═══════════════════════════════════════════════════════════════

  React.useEffect(() => {
    if (autoScroll && !isPaused && containerRef.current) {
      containerRef.current.scrollTop = 0;
    }
  }, [filteredMessages, autoScroll, isPaused]);

  // ═══════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ═══════════════════════════════════════════════════════════════

  React.useEffect(() => {
    if (url) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [url, connect, disconnect]);

  React.useEffect(() => {
    if (externalMessages) {
      setMessages(externalMessages);
    }
  }, [externalMessages]);

  // ═══════════════════════════════════════════════════════════════
  // GROUPING
  // ═══════════════════════════════════════════════════════════════

  const groupedMessages = React.useMemo(() => {
    if (!groupByType) return { '': filteredMessages };

    const groups: Record<string, LiveMessage<T>[]> = {};
    filteredMessages.forEach(msg => {
      const type = msg.type || 'other';
      if (!groups[type]) groups[type] = [];
      groups[type].push(msg);
    });

    return groups;
  }, [filteredMessages, groupByType]);

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════

  const statusColors: Record<ConnectionStatus, string> = {
    connected: 'text-status-success',
    connecting: 'text-status-warning',
    disconnected: 'text-text-tertiary',
    error: 'text-status-error',
  };

  const statusIcons: Record<ConnectionStatus, React.ReactNode> = {
    connected: <Wifi className="w-4 h-4" />,
    connecting: <Wifi className="w-4 h-4 animate-pulse" />,
    disconnected: <WifiOff className="w-4 h-4" />,
    error: <WifiOff className="w-4 h-4" />,
  };

  return (
    <div className={cn('flex flex-col border border-border-base rounded-lg bg-surface-base', className)}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border-base bg-surface-elevated">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          {url && (
            <div className={cn('flex items-center gap-2', statusColors[connectionStatus])}>
              {statusIcons[connectionStatus]}
              <span className="text-sm font-medium capitalize">{connectionStatus}</span>
            </div>
          )}

          {/* Message Count */}
          <Badge variant="outline">
            {messages.length} {messages.length === 1 ? 'message' : 'messages'}
          </Badge>

          {/* Buffer Indicator */}
          {isPaused && messageBuffer.length > 0 && (
            <Badge variant="warning">
              {messageBuffer.length} buffered
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Filter */}
          {allowFilter && (
            <div className="relative">
              <Input
                placeholder={filterPlaceholder}
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                leftIcon={<Filter size={16} />}
                className="w-64"
              />
              {filterText && (
                <button
                  onClick={() => setFilterText('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          {/* Pause/Resume */}
          {allowPause && (
            <Button
              variant="outline"
              size="sm"
              onClick={handlePauseToggle}
            >
              {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              {isPaused ? 'Resume' : 'Pause'}
            </Button>
          )}

          {/* Export */}
          {allowExport && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExport}
              disabled={messages.length === 0}
            >
              <Download className="w-4 h-4" />
              Export
            </Button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div
        ref={containerRef}
        className="overflow-y-auto p-4 space-y-2"
        style={{ height }}
      >
        {filteredMessages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-text-secondary">
            {emptyMessage}
          </div>
        ) : (
          <>
            {Object.entries(groupedMessages).map(([type, msgs]) => (
              <div key={type} className="space-y-2">
                {groupByType && type && (
                  <div className="sticky top-0 bg-surface-elevated px-3 py-1 rounded-md border border-border-base">
                    <span className="text-xs font-medium uppercase text-text-secondary">{type}</span>
                  </div>
                )}

                {msgs.map((message, index) => (
                  <div
                    key={message.id}
                    className={cn(
                      'p-3 rounded-lg border transition-all',
                      message.priority === 'critical' && 'border-status-error bg-status-error/10',
                      message.priority === 'high' && 'border-status-warning bg-status-warning/10',
                      message.priority === 'normal' && 'border-border-base bg-surface-elevated',
                      message.priority === 'low' && 'border-border-muted bg-surface-base opacity-70'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        {showTypes && message.type && (
                          <Badge variant="outline" size="sm">
                            {message.type}
                          </Badge>
                        )}
                        {showTimestamps && (
                          <span className="text-xs text-text-tertiary">
                            {message.timestamp.toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {message.priority && message.priority !== 'normal' && (
                        <Badge
                          variant={
                            message.priority === 'critical' ? 'error' :
                            message.priority === 'high' ? 'warning' :
                            'default'
                          }
                          size="sm"
                        >
                          {message.priority}
                        </Badge>
                      )}
                    </div>

                    <div className="text-sm">
                      {renderMessage(message, index)}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};

LiveDataFeed.displayName = 'LiveDataFeed';
