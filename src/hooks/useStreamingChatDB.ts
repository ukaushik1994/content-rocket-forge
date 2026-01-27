import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { useMessagePagination } from './useMessagePagination';
import { supabase } from '@/integrations/supabase/client';
import { parseVisualDataFromContent, mergeVisualData } from '@/utils/visualDataParser';

export interface StreamingChatState {
  messages: EnhancedChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  isAIThinking: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  messageStatuses: Record<string, 'sending' | 'sent' | 'delivered' | 'read' | 'error'>;
  typingUsers: string[];
  collaborators: Array<{
    userId: string;
    userName: string;
    isActive: boolean;
  }>;
  contextState: Record<string, any>;
  searchQuery: string;
  filteredMessages: EnhancedChatMessage[];
  hasMoreMessages: boolean;
  isLoadingMoreMessages: boolean;
  messageReactions: Record<string, Array<{ userId: string; emoji: string }>>;
}

export const useStreamingChatDB = () => {
  const [state, setState] = useState<StreamingChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    isAIThinking: false,
    connectionStatus: 'disconnected',
    messageStatuses: {},
    typingUsers: [],
    collaborators: [],
    contextState: {},
    searchQuery: '',
    filteredMessages: [],
    hasMoreMessages: true,
    isLoadingMoreMessages: false,
    messageReactions: {}
  });
  
  const websocketRef = useRef<WebSocket | null>(null);
  const currentMessageRef = useRef<EnhancedChatMessage | null>(null);
  const realtimeChannelRef = useRef<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();
  const { activeConversationId, updateMessageStatus: updateContextMessageStatus } = useChatContextBridge();

  // Save message to database with enhanced status tracking
  const saveMessageToDB = useCallback(async (message: EnhancedChatMessage, conversationId: string, status: string = 'sent') => {
    if (!conversationId) return null;

    try {
      const validType = message.role === 'user' ? 'user' : 
                       message.role === 'assistant' ? 'assistant' :
                       message.role === 'system' ? 'system' : 'assistant';

      const messageData = {
        conversation_id: conversationId,
        type: validType,
        content: message.content,
        visual_data: message.visualData ? JSON.stringify(message.visualData) : null,
        progress_indicator: message.progressIndicator ? JSON.stringify(message.progressIndicator) : null,
        workflow_context: message.workflowContext ? JSON.stringify(message.workflowContext) : null,
        function_calls: message.actions ? JSON.stringify(message.actions) : null,
        status: 'completed',
        message_status: status,
        is_streaming: message.isStreaming || false
      };

      const { data, error } = await supabase
        .from('ai_messages')
        .insert(messageData)
        .select()
        .single();
      
      if (error) {
        console.error('Database error saving message:', error);
        return null;
      }

      // Update message status in local state
      setState(prev => ({
        ...prev,
        messageStatuses: {
          ...prev.messageStatuses,
          [message.id]: status as any
        }
      }));

      return data?.id;
    } catch (error) {
      console.error('Error saving message to database:', error);
      return null;
    }
  }, []);

  // Load messages from database with enhanced pagination support
  const loadMessagesFromDB = useCallback(async (conversationId: string, limit: number = 50, offset: number = 0) => {
    if (!conversationId) return { messages: [], hasMore: false };

    try {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        conv_id: conversationId,
        limit_count: limit + 1, // Get one extra to check if there are more
        offset_count: offset
      });

      if (error) throw error;
      
      const hasMore = (data || []).length > limit;
      const messages = (data || []).slice(0, limit);
      
      const formattedMessages: EnhancedChatMessage[] = messages.map((msg: any) => {
        let actions, visualData, progressIndicator, workflowContext;
        
        try {
          if (msg.function_calls) {
            const parsedFunctionCalls = typeof msg.function_calls === 'string' ? JSON.parse(msg.function_calls) : msg.function_calls;
            if (Array.isArray(parsedFunctionCalls)) {
              actions = parsedFunctionCalls;
            }
          }
          
          if (msg.visual_data) {
            visualData = typeof msg.visual_data === 'string' ? JSON.parse(msg.visual_data) : msg.visual_data;
          }
          if (msg.progress_indicator) {
            progressIndicator = typeof msg.progress_indicator === 'string' ? JSON.parse(msg.progress_indicator) : msg.progress_indicator;
          }
          if (msg.workflow_context) {
            workflowContext = typeof msg.workflow_context === 'string' ? JSON.parse(msg.workflow_context) : msg.workflow_context;
          }
        } catch (parseError) {
          console.warn('Error parsing message data:', parseError);
        }

        return {
          id: msg.id,
          role: msg.type as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          visualData,
          actions,
          progressIndicator,
          workflowContext,
          isStreaming: msg.is_streaming || false,
          messageStatus: msg.message_status || 'sent'
        };
      });
      
      if (offset === 0) {
        setState(prev => ({ ...prev, messages: formattedMessages.reverse() }));
      } else {
        setState(prev => ({ ...prev, messages: [...formattedMessages.reverse(), ...prev.messages] }));
      }

      return { messages: formattedMessages, hasMore };
    } catch (error) {
      console.error('Error loading messages from database:', error);
      return { messages: [], hasMore: false };
    }
  }, []);

  // Setup real-time subscriptions for message updates and typing indicators
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!activeConversationId || realtimeChannelRef.current) return;

    console.log('🔄 Setting up real-time subscriptions for conversation:', activeConversationId);

    const channel = supabase.channel(`conversation:${activeConversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          console.log('📨 New message received via realtime:', payload);
          const newMessage = payload.new as any;
          
          // Only add if it's not from current user to avoid duplicates
          if (newMessage.type !== 'user' || !user || newMessage.user_id !== user.id) {
            const formattedMessage: EnhancedChatMessage = {
              id: newMessage.id,
              role: newMessage.type,
              content: newMessage.content,
              timestamp: new Date(newMessage.created_at),
              isStreaming: newMessage.is_streaming || false,
              messageStatus: newMessage.message_status || 'sent'
            };

            setState(prev => ({
              ...prev,
              messages: [...prev.messages, formattedMessage]
            }));
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'ai_messages',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          console.log('✏️ Message updated via realtime:', payload);
          const updatedMessage = payload.new as any;
          
          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === updatedMessage.id 
                ? { ...msg, messageStatus: updatedMessage.message_status }
                : msg
            )
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_typing_indicators',
          filter: `conversation_id=eq.${activeConversationId}`
        },
        (payload) => {
          console.log('⌨️ Typing indicator update:', payload);
          const indicator = payload.new as any;
          
          if (indicator && indicator.user_id !== user?.id) {
            setState(prev => ({
              ...prev,
              typingUsers: indicator.is_typing 
                ? [...prev.typingUsers.filter(id => id !== indicator.user_id), indicator.user_id]
                : prev.typingUsers.filter(id => id !== indicator.user_id)
            }));
          }
        }
      )
      .subscribe();

    realtimeChannelRef.current = channel;
  }, [activeConversationId, user]);

  // Cleanup real-time subscriptions
  const cleanupRealtimeSubscriptions = useCallback(() => {
    if (realtimeChannelRef.current) {
      console.log('🧹 Cleaning up real-time subscriptions');
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  }, []);

  // Dynamic WebSocket URL from environment
  const getWebSocketUrl = (): string => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co';
    const wsUrl = supabaseUrl
      .replace('https://', 'wss://')
      .replace('.supabase.co', '.functions.supabase.co');
    return `${wsUrl}/functions/v1/ai-streaming-chat`;
  };

  // Reconnection with exponential backoff
  const reconnectAttemptsRef = useRef(0);
  const maxReconnectAttempts = 5;
  const baseDelay = 1000;
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= maxReconnectAttempts) {
      setState(prev => ({ ...prev, connectionStatus: 'error' }));
      toast({
        title: "Connection Failed",
        description: "Unable to reconnect. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    const delay = baseDelay * Math.pow(2, reconnectAttemptsRef.current);
    reconnectAttemptsRef.current++;
    
    setState(prev => ({ ...prev, connectionStatus: 'reconnecting' as any }));
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [toast]);

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
      const wsUrl = getWebSocketUrl();
      websocketRef.current = new WebSocket(wsUrl);

      websocketRef.current.onopen = () => {
        console.log('🔗 Connected to streaming chat WebSocket');
        reconnectAttemptsRef.current = 0; // Reset on successful connection
        setState(prev => ({ 
          ...prev, 
          isConnected: true, 
          connectionStatus: 'connected' 
        }));

        // Authenticate with the WebSocket
        if (websocketRef.current && user) {
          websocketRef.current.send(JSON.stringify({
            type: 'authenticate',
            userId: user.id,
            conversationId: activeConversationId
          }));
        }
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
        console.log('🔌 Disconnected from streaming chat WebSocket');
        setState(prev => ({ 
          ...prev, 
          isConnected: false, 
          connectionStatus: 'disconnected',
          isAIThinking: false
        }));
        
        // Attempt reconnection
        attemptReconnect();
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
  }, [user, toast, activeConversationId, attemptReconnect]);

  const disconnect = useCallback(() => {
    // Clear any pending reconnection
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    cleanupRealtimeSubscriptions();
  }, [cleanupRealtimeSubscriptions]);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'connection_established':
        console.log('✅ WebSocket connection established');
        break;

      case 'authenticated':
        console.log('🔐 Authenticated with WebSocket');
        break;

      case 'ai_thinking_start':
        setState(prev => ({ ...prev, isAIThinking: true }));
        break;

      case 'ai_response_delta':
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
        if (currentMessageRef.current && activeConversationId) {
          // Parse visual data from the content if not provided directly
          const parsedFromContent = parseVisualDataFromContent(data.content || '');
          
          // Merge visual data from response and parsed from content
          const responseVisualData = data.visualData 
            ? (Array.isArray(data.visualData) ? data.visualData : [data.visualData]) 
            : undefined;
          const allVisualData = mergeVisualData(responseVisualData, parsedFromContent.visualData);
          
          // Use first visual data item as primary, store all in allVisualData
          const primaryVisualData = allVisualData?.[0];
          
          const completedMessage: EnhancedChatMessage = {
            ...currentMessageRef.current,
            content: parsedFromContent.content || data.content,
            isStreaming: false,
            actions: data.actions || [],
            visualData: primaryVisualData,
            allVisualData: allVisualData
          };

          console.log('📊 AI response complete with visual data:', {
            hasVisualData: !!primaryVisualData,
            visualDataCount: allVisualData?.length,
            types: allVisualData?.map(v => v.type)
          });

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === currentMessageRef.current?.id 
                ? completedMessage
                : msg
            ),
            isAIThinking: false
          }));

          // Save completed AI message to database
          saveMessageToDB(completedMessage, activeConversationId);
          currentMessageRef.current = null;
        }
        break;

      case 'user_typing':
        setState(prev => ({
          ...prev,
          typingUsers: [...prev.typingUsers.filter(id => id !== data.userId), data.userId]
        }));
        break;

      case 'user_typing_stopped':
        setState(prev => ({
          ...prev,
          typingUsers: prev.typingUsers.filter(id => id !== data.userId)
        }));
        break;

      case 'user_joined':
      case 'user_disconnected':
        // Handle collaborator updates
        console.log(`👥 User ${data.type}:`, data.userId);
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
  }, [user, toast, activeConversationId, saveMessageToDB]);

  const sendMessage = useCallback(async (content: string) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN) {
      toast({
        title: "Not connected",
        description: "Please connect to start chatting",
        variant: "destructive"
      });
      return;
    }

    if (!user || !activeConversationId) return;

    // Add user message immediately for instant feedback
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      messageStatus: 'sending'
    };

    // Show user message immediately
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMessage],
      messageStatuses: { ...prev.messageStatuses, [userMessage.id]: 'sending' }
    }));

    // Save user message to database
    const messageId = await saveMessageToDB(userMessage, activeConversationId, 'sent');
    
    if (messageId) {
      // Update message status to sent
      setState(prev => ({
        ...prev,
        messageStatuses: { ...prev.messageStatuses, [userMessage.id]: 'sent' }
      }));
    }

    // Create placeholder AI message for streaming
    const aiMessage: EnhancedChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
      messageStatus: 'sending'
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, aiMessage] }));
    currentMessageRef.current = aiMessage;

    // Send chat request via WebSocket
    const chatRequest = {
      type: 'chat_request',
      messages: [...state.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      conversationId: activeConversationId
    };

    websocketRef.current.send(JSON.stringify(chatRequest));

    // Update conversation timestamp
    if (activeConversationId) {
      try {
        await supabase
          .from('ai_conversations')
          .update({ updated_at: new Date().toISOString() })
          .eq('id', activeConversationId);
      } catch (error) {
        console.warn('Failed to update conversation timestamp:', error);
      }
    }
  }, [state.messages, user, toast, activeConversationId, saveMessageToDB]);

  const sendTypingIndicator = useCallback((isTyping: boolean) => {
    if (!websocketRef.current || websocketRef.current.readyState !== WebSocket.OPEN || !user) return;

    websocketRef.current.send(JSON.stringify({
      type: isTyping ? 'typing_start' : 'typing_stop',
      userId: user.id
    }));
  }, [user]);

  const updateMessageStatus = useCallback(async (messageId: string, status: 'sent' | 'delivered' | 'read' | 'error') => {
    if (!user) return;

    try {
      await supabase.rpc('update_message_status', {
        message_id: messageId,
        new_status: status,
        user_id: user.id
      });

      setState(prev => ({
        ...prev,
        messageStatuses: { ...prev.messageStatuses, [messageId]: status }
      }));

      // Update context bridge
      updateContextMessageStatus(messageId, status, user.id);
    } catch (error) {
      console.error('Error updating message status:', error);
    }
  }, [user, updateContextMessageStatus]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [], messageStatuses: {} }));
    currentMessageRef.current = null;
  }, []);

  // Enhanced pagination integration
  const paginationConfig = useMemo(() => ({
    pageSize: 50,
    enableVirtualization: true,
    preloadPages: 2
  }), []);

  const messagesPagination = useMessagePagination(state.messages, paginationConfig);

  // Load more messages with enhanced pagination
  const loadMoreMessages = useCallback(async () => {
    if (!activeConversationId || state.isLoadingMoreMessages || !state.hasMoreMessages) {
      return { messages: [], hasMore: false };
    }
    
    setState(prev => ({ ...prev, isLoadingMoreMessages: true }));
    
    try {
      const offset = state.messages.length;
      const result = await loadMessagesFromDB(activeConversationId, 20, offset);
      
      setState(prev => ({ 
        ...prev, 
        hasMoreMessages: result.hasMore,
        isLoadingMoreMessages: false 
      }));
      
      return result;
    } catch (error) {
      console.error('Error loading more messages:', error);
      setState(prev => ({ ...prev, isLoadingMoreMessages: false }));
      return { messages: [], hasMore: false };
    }
  }, [activeConversationId, state.messages.length, state.isLoadingMoreMessages, state.hasMoreMessages, loadMessagesFromDB]);

  // Load messages and setup subscriptions when active conversation changes
  useEffect(() => {
    cleanupRealtimeSubscriptions();
    
    if (activeConversationId) {
      loadMessagesFromDB(activeConversationId);
      setupRealtimeSubscriptions();
      
      // Join conversation via WebSocket if connected
      if (websocketRef.current?.readyState === WebSocket.OPEN) {
        websocketRef.current.send(JSON.stringify({
          type: 'join_conversation',
          conversationId: activeConversationId
        }));
      }
    } else {
      setState(prev => ({ ...prev, messages: [], messageStatuses: {} }));
    }
  }, [activeConversationId, loadMessagesFromDB, setupRealtimeSubscriptions, cleanupRealtimeSubscriptions]);

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
    updateMessageStatus,
    clearMessages,
    loadMessagesFromDB,
    loadMoreMessages,
    setupRealtimeSubscriptions,
    cleanupRealtimeSubscriptions,
    retryLastMessage: () => {}, // Placeholder for now
    isRetryingMessage: false
  };
};