import { useState, useRef, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface WebSocketConfig {
  url: string;
  reconnectAttempts?: number;
  reconnectInterval?: number;
  heartbeatInterval?: number;
  onMessage?: (data: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: any) => void;
}

interface WebSocketState {
  isConnected: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error' | 'offline';
  reconnectCount: number;
  lastError: string | null;
}

export const useRobustWebSocket = (config: WebSocketConfig) => {
  const [state, setState] = useState<WebSocketState>({
    isConnected: false,
    connectionStatus: 'disconnected',
    reconnectCount: 0,
    lastError: null,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const messageQueueRef = useRef<any[]>([]);
  const reconnectAttemptsRef = useRef(0);
  const isIntentionalCloseRef = useRef(false);
  const { toast } = useToast();

  // Exponential backoff calculator
  const getReconnectDelay = useCallback((attempt: number): number => {
    const baseDelay = config.reconnectInterval || 1000;
    const maxDelay = 30000; // 30 seconds max
    const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * 1000;
  }, [config.reconnectInterval]);

  // Send heartbeat ping
  const sendHeartbeat = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
      } catch (error) {
        console.error('Error sending heartbeat:', error);
      }
    }
  }, []);

  // Start heartbeat mechanism
  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }

    const interval = config.heartbeatInterval || 30000; // 30 seconds default
    heartbeatIntervalRef.current = setInterval(sendHeartbeat, interval);
  }, [config.heartbeatInterval, sendHeartbeat]);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  }, []);

  // Flush message queue when connected
  const flushMessageQueue = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN && messageQueueRef.current.length > 0) {
      console.log(`📤 Flushing ${messageQueueRef.current.length} queued messages`);
      
      while (messageQueueRef.current.length > 0) {
        const message = messageQueueRef.current.shift();
        try {
          wsRef.current.send(JSON.stringify(message));
        } catch (error) {
          console.error('Error sending queued message:', error);
          // Re-queue if send fails
          messageQueueRef.current.unshift(message);
          break;
        }
      }
    }
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      console.log('Already connected to WebSocket');
      return;
    }

    // Check if offline
    if (!navigator.onLine) {
      setState(prev => ({ ...prev, connectionStatus: 'offline' }));
      toast({
        title: "Offline",
        description: "No internet connection. Messages will be queued.",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, connectionStatus: 'connecting' }));
    isIntentionalCloseRef.current = false;

    try {
      console.log('🔗 Connecting to WebSocket:', config.url);
      wsRef.current = new WebSocket(config.url);

      wsRef.current.onopen = () => {
        console.log('✅ WebSocket connected');
        setState(prev => ({
          ...prev,
          isConnected: true,
          connectionStatus: 'connected',
          reconnectCount: 0,
          lastError: null,
        }));
        
        reconnectAttemptsRef.current = 0;
        config.onConnect?.();
        startHeartbeat();
        flushMessageQueue();

        toast({
          title: "Connected",
          description: "Real-time connection established",
        });
      };

      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle pong response
          if (data.type === 'pong') {
            return;
          }
          
          config.onMessage?.(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('🔌 WebSocket closed:', event.code, event.reason);
        stopHeartbeat();
        
        setState(prev => ({
          ...prev,
          isConnected: false,
          connectionStatus: 'disconnected',
        }));

        config.onDisconnect?.();

        // Attempt reconnection if not intentional close
        if (!isIntentionalCloseRef.current && reconnectAttemptsRef.current < (config.reconnectAttempts || 5)) {
          reconnectAttemptsRef.current++;
          const delay = getReconnectDelay(reconnectAttemptsRef.current - 1);
          
          console.log(`🔄 Reconnecting in ${delay}ms (attempt ${reconnectAttemptsRef.current})`);
          
          setState(prev => ({
            ...prev,
            reconnectCount: reconnectAttemptsRef.current,
          }));

          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, delay);
        } else if (reconnectAttemptsRef.current >= (config.reconnectAttempts || 5)) {
          toast({
            title: "Connection Failed",
            description: "Unable to establish connection. Please refresh the page.",
            variant: "destructive"
          });
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('❌ WebSocket error:', error);
        setState(prev => ({
          ...prev,
          connectionStatus: 'error',
          lastError: 'Connection error occurred',
        }));
        
        config.onError?.(error);
      };

    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      setState(prev => ({
        ...prev,
        connectionStatus: 'error',
        lastError: error instanceof Error ? error.message : 'Unknown error',
      }));
    }
  }, [config, toast, startHeartbeat, stopHeartbeat, flushMessageQueue, getReconnectDelay]);

  // Disconnect from WebSocket
  const disconnect = useCallback(() => {
    console.log('🔌 Disconnecting WebSocket...');
    isIntentionalCloseRef.current = true;
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    stopHeartbeat();

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect');
      wsRef.current = null;
    }

    setState({
      isConnected: false,
      connectionStatus: 'disconnected',
      reconnectCount: 0,
      lastError: null,
    });
  }, [stopHeartbeat]);

  // Send message with offline queuing
  const sendMessage = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      try {
        wsRef.current.send(JSON.stringify(data));
        return true;
      } catch (error) {
        console.error('Error sending message:', error);
        return false;
      }
    } else {
      // Queue message for later
      console.log('📥 Queuing message (offline/disconnected)');
      messageQueueRef.current.push(data);
      
      toast({
        title: "Message Queued",
        description: "Your message will be sent when connection is restored",
      });
      
      return false;
    }
  }, [toast]);

  // Handle online/offline events
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network online');
      setState(prev => ({ ...prev, connectionStatus: 'disconnected' }));
      
      toast({
        title: "Back Online",
        description: "Reconnecting...",
      });
      
      // Attempt to reconnect
      if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
        connect();
      }
    };

    const handleOffline = () => {
      console.log('📴 Network offline');
      setState(prev => ({ ...prev, connectionStatus: 'offline' }));
      
      toast({
        title: "Offline",
        description: "No internet connection",
        variant: "destructive"
      });
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connect, toast]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    isOnline: navigator.onLine,
    queuedMessages: messageQueueRef.current.length,
  };
};
