import { useState, useRef, useCallback, useEffect } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface StreamingChatState {
  messages: EnhancedChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  isAIThinking: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const useStreamingChat = () => {
  const [state, setState] = useState<StreamingChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    isAIThinking: false,
    connectionStatus: 'disconnected'
  });
  
  const websocketRef = useRef<WebSocket | null>(null);
  const currentMessageRef = useRef<EnhancedChatMessage | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const connect = useCallback(() => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the streaming chat",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, connectionStatus: 'connecting' }));

    try {
      // Use full URL to Supabase edge function
      const wsUrl = 'wss://iqiundzzcepmuykcnfbc.functions.supabase.co/functions/v1/ai-streaming-chat';
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('🔗 Connected to streaming chat');
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          connectionStatus: 'connected' 
        }));
      };

      websocketRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          handleWebSocketMessage(data);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocketRef.current.onclose = () => {
        console.log('🔌 Disconnected from streaming chat');
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          connectionStatus: 'disconnected',
          isAIThinking: false
        }));
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, connectionStatus: 'error' }));
        toast({
          title: "Connection Error",
          description: "Failed to connect to streaming chat",
          variant: "destructive"
        });
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      setState(prev => ({ ...prev, connectionStatus: 'error' }));
    }
  }, [user, toast]);

  const disconnect = useCallback(() => {
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
  }, []);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'connection_established':
        console.log('✅ Connection established');
        break;

      case 'ai_thinking_start':
        setState(prev => ({ ...prev, isAIThinking: true }));
        break;

      case 'ai_response_delta':
        // Update the current streaming message
        if (currentMessageRef.current) {
          const updatedMessage = {
            ...currentMessageRef.current,
            content: data.fullContent,
            isStreaming: true
          };

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === currentMessageRef.current?.id ? updatedMessage : msg
            )
          }));
        }
        break;

      case 'ai_response_complete':
        if (currentMessageRef.current) {
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === currentMessageRef.current?.id 
                ? { ...msg, isStreaming: false }
                : msg
            ),
            isAIThinking: false
          }));
          currentMessageRef.current = null;
        }
        break;

      case 'user_typing':
        if (data.userId !== user?.id) {
          setState(prev => ({ ...prev, isTyping: true }));
        }
        break;

      case 'user_typing_stopped':
        setState(prev => ({ ...prev, isTyping: false }));
        break;

      case 'error':
        console.error('WebSocket error:', data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
        break;
    }
  }, [user, toast]);

  const sendMessage = useCallback(async (content: string) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not connected",
        description: "Please connect to start chatting",
        variant: "destructive"
      });
      return;
    }

    if (!user) return;

    // Add user message
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));

    // Create placeholder AI message for streaming
    const aiMessage: EnhancedChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, aiMessage] }));
    currentMessageRef.current = aiMessage;

    // Send chat request
    const chatRequest = {
      type: 'chat_request',
      messages: [...state.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      userId: user.id,
      conversationId: `conv-${Date.now()}`
    };

    websocketRef.current.send(JSON.stringify(chatRequest));
  }, [state.messages, user, toast]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN || !user) return;

    websocketRef.current.send(JSON.stringify({
      type: isTyping ? 'typing_start' : 'typing_stop',
      userId: user.id
    }));
  }, [user]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
    currentMessageRef.current = null;
  }, []);

  // Auto-connect when component mounts and user is available
  useEffect(() => {
    if (user && !state.isConnected && state.connectionStatus === 'disconnected') {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [user, connect, disconnect, state.isConnected, state.connectionStatus]);

  return {
    ...state,
    connect,
    disconnect,
    sendMessage,
    sendTypingIndicator,
    clearMessages
  };
};