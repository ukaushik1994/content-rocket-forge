/**
 * Unified Chat Database Hook
 * 
 * Consolidates useEnhancedAIChatDB, useStreamingChatDB, and useEnhancedStreamingChat
 * into a single source of truth for chat state management.
 * 
 * Features:
 * - Supports both HTTP and WebSocket modes
 * - Automatic reconnection with exponential backoff
 * - Message persistence with status tracking
 * - Real-time subscriptions for live updates
 * - Context and workflow state management
 * - Message filtering and search
 */

import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { EnhancedChatMessage, ChartConfiguration } from '@/types/enhancedChat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { supabase } from '@/integrations/supabase/client';
import { parseVisualDataFromContent, mergeVisualData } from '@/utils/visualDataParser';

export interface AIChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  archived: boolean;
  user_id: string;
  tags: string[];
}

export type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
export type TransportMode = 'http' | 'websocket';

export interface UnifiedChatState {
  // Conversations
  conversations: AIChatConversation[];
  activeConversation: string | null;
  
  // Messages
  messages: EnhancedChatMessage[];
  isLoading: boolean;
  isTyping: boolean;
  
  // Connection (WebSocket mode)
  isConnected: boolean;
  connectionStatus: ConnectionStatus;
  
  // Collaboration
  typingUsers: string[];
  messageStatuses: Record<string, 'sending' | 'sent' | 'delivered' | 'read' | 'error'>;
  
  // Filtering
  searchQuery: string;
  typeFilter: 'user' | 'assistant' | 'system' | 'all';
  
  // Pagination
  hasMoreMessages: boolean;
  isLoadingMoreMessages: boolean;
}

interface UseUnifiedChatDBOptions {
  mode?: TransportMode;
  autoConnect?: boolean;
}

// Dynamic WebSocket URL construction
const getWebSocketUrl = (): string => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co';
  const wsUrl = supabaseUrl
    .replace('https://', 'wss://')
    .replace('.supabase.co', '.functions.supabase.co');
  return `${wsUrl}/functions/v1/ai-streaming-chat`;
};

export const useUnifiedChatDB = (options: UseUnifiedChatDBOptions = {}) => {
  const { mode = 'http', autoConnect = true } = options;
  
  const [state, setState] = useState<UnifiedChatState>({
    conversations: [],
    activeConversation: null,
    messages: [],
    isLoading: false,
    isTyping: false,
    isConnected: false,
    connectionStatus: 'disconnected',
    typingUsers: [],
    messageStatuses: {},
    searchQuery: '',
    typeFilter: 'all',
    hasMoreMessages: true,
    isLoadingMoreMessages: false
  });

  const websocketRef = useRef<WebSocket | null>(null);
  const currentMessageRef = useRef<EnhancedChatMessage | null>(null);
  const realtimeChannelRef = useRef<any>(null);
  const reconnectAttemptsRef = useRef(0);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const { user } = useAuth();
  const { toast } = useToast();
  const { 
    activeConversationId, 
    updateActiveConversation,
    updateMessageStatus: updateContextMessageStatus 
  } = useChatContextBridge();

  const MAX_RECONNECT_ATTEMPTS = 5;
  const BASE_RECONNECT_DELAY = 1000;

  // ============================================
  // CONVERSATION MANAGEMENT
  // ============================================

  const loadConversations = useCallback(async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setState(prev => ({ ...prev, conversations: data || [] }));
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const createConversation = useCallback(async (title: string = "New Chat") => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert([{
          title,
          user_id: user.id,
          pinned: false,
          archived: false,
          tags: []
        }])
        .select()
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        conversations: [data, ...prev.conversations],
        activeConversation: data.id
      }));
      
      updateActiveConversation(data.id);
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast, updateActiveConversation]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.filter(c => c.id !== conversationId),
        activeConversation: prev.activeConversation === conversationId ? null : prev.activeConversation,
        messages: prev.activeConversation === conversationId ? [] : prev.messages
      }));
      
      if (state.activeConversation === conversationId) {
        updateActiveConversation(null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  }, [user, state.activeConversation, toast, updateActiveConversation]);

  const selectConversation = useCallback(async (conversationId: string) => {
    setState(prev => ({ ...prev, activeConversation: conversationId, messages: [] }));
    updateActiveConversation(conversationId);
  }, [updateActiveConversation]);

  const togglePinConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    const conversation = state.conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ pinned: !conversation.pinned })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversationId ? { ...c, pinned: !c.pinned } : c
        )
      }));
    } catch (error) {
      console.error('Error toggling pin:', error);
    }
  }, [user, state.conversations]);

  const toggleArchiveConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    const conversation = state.conversations.find(c => c.id === conversationId);
    if (!conversation) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ archived: !conversation.archived })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        conversations: prev.conversations.map(c => 
          c.id === conversationId ? { ...c, archived: !c.archived } : c
        )
      }));
    } catch (error) {
      console.error('Error toggling archive:', error);
    }
  }, [user, state.conversations]);

  // ============================================
  // MESSAGE MANAGEMENT
  // ============================================

  const saveMessageToDB = useCallback(async (
    message: EnhancedChatMessage, 
    conversationId: string, 
    status: string = 'sent'
  ) => {
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

  const loadMessagesFromDB = useCallback(async (conversationId: string, limit: number = 50, offset: number = 0) => {
    if (!conversationId) return { messages: [], hasMore: false };

    try {
      const { data, error } = await supabase.rpc('get_conversation_messages', {
        conv_id: conversationId,
        limit_count: limit + 1,
        offset_count: offset
      });

      if (error) throw error;
      
      const hasMore = (data || []).length > limit;
      const messages = (data || []).slice(0, limit);
      
      const formattedMessages: EnhancedChatMessage[] = messages.map((msg: any) => {
        let actions, visualData, progressIndicator, workflowContext;
        
        try {
          if (msg.function_calls) {
            const parsed = typeof msg.function_calls === 'string' 
              ? JSON.parse(msg.function_calls) 
              : msg.function_calls;
            if (Array.isArray(parsed)) actions = parsed;
          }
          
          if (msg.visual_data) {
            visualData = typeof msg.visual_data === 'string' 
              ? JSON.parse(msg.visual_data) 
              : msg.visual_data;
          }
          if (msg.progress_indicator) {
            progressIndicator = typeof msg.progress_indicator === 'string' 
              ? JSON.parse(msg.progress_indicator) 
              : msg.progress_indicator;
          }
          if (msg.workflow_context) {
            workflowContext = typeof msg.workflow_context === 'string' 
              ? JSON.parse(msg.workflow_context) 
              : msg.workflow_context;
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
        setState(prev => ({ 
          ...prev, 
          messages: formattedMessages.reverse(),
          hasMoreMessages: hasMore
        }));
      } else {
        setState(prev => ({ 
          ...prev, 
          messages: [...formattedMessages.reverse(), ...prev.messages],
          hasMoreMessages: hasMore
        }));
      }

      return { messages: formattedMessages, hasMore };
    } catch (error) {
      console.error('Error loading messages from database:', error);
      return { messages: [], hasMore: false };
    }
  }, []);

  const updateMessageStatus = useCallback(async (
    messageId: string, 
    status: 'sent' | 'delivered' | 'read' | 'error'
  ) => {
    if (!user) return;

    // Update local state immediately
    setState(prev => ({
      ...prev,
      messageStatuses: { ...prev.messageStatuses, [messageId]: status }
    }));

    // Persist to database
    try {
      await supabase
        .from('ai_messages')
        .update({ message_status: status })
        .eq('id', messageId);
        
      updateContextMessageStatus(messageId, status, user.id);
    } catch (error) {
      console.error('Failed to persist message status:', error);
    }
  }, [user, updateContextMessageStatus]);

  // ============================================
  // WEBSOCKET CONNECTION (Streaming Mode)
  // ============================================

  const attemptReconnect = useCallback(() => {
    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      setState(prev => ({ ...prev, connectionStatus: 'error' }));
      toast({
        title: "Connection Failed",
        description: "Unable to reconnect. Please refresh the page.",
        variant: "destructive"
      });
      return;
    }

    const delay = BASE_RECONNECT_DELAY * Math.pow(2, reconnectAttemptsRef.current);
    reconnectAttemptsRef.current++;
    
    setState(prev => ({ ...prev, connectionStatus: 'reconnecting' }));
    
    reconnectTimeoutRef.current = setTimeout(() => {
      connect();
    }, delay);
  }, [toast]);

  const connect = useCallback(() => {
    if (mode !== 'websocket') return;
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

        // Authenticate
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
          isTyping: false
        }));
        
        // Attempt reconnection
        attemptReconnect();
      };

      websocketRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        setState(prev => ({ ...prev, connectionStatus: 'error' }));
      };

    } catch (error) {
      console.error('Failed to connect:', error);
      setState(prev => ({ ...prev, connectionStatus: 'error' }));
    }
  }, [mode, user, toast, activeConversationId, attemptReconnect]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (websocketRef.current) {
      websocketRef.current.close();
      websocketRef.current = null;
    }
    
    if (realtimeChannelRef.current) {
      supabase.removeChannel(realtimeChannelRef.current);
      realtimeChannelRef.current = null;
    }
  }, []);

  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'ai_thinking_start':
        setState(prev => ({ ...prev, isTyping: true }));
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
          const parsedFromContent = parseVisualDataFromContent(data.content || '');
          const responseVisualData = data.visualData 
            ? (Array.isArray(data.visualData) ? data.visualData : [data.visualData]) 
            : undefined;
          const allVisualData = mergeVisualData(responseVisualData, parsedFromContent.visualData);
          const primaryVisualData = allVisualData?.[0];
          
          const completedMessage: EnhancedChatMessage = {
            ...currentMessageRef.current,
            content: parsedFromContent.content || data.content,
            isStreaming: false,
            actions: data.actions || [],
            visualData: primaryVisualData,
            allVisualData: allVisualData
          };

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === currentMessageRef.current?.id ? completedMessage : msg
            ),
            isTyping: false
          }));

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

      case 'error':
        console.error('WebSocket error:', data.message);
        toast({
          title: "Error",
          description: data.message,
          variant: "destructive"
        });
        break;
    }
  }, [activeConversationId, saveMessageToDB, toast]);

  // ============================================
  // SEND MESSAGE (Both Modes - with SSE Streaming for HTTP)
  // ============================================

  const sendMessage = useCallback(async (content: string, useStreaming: boolean = true) => {
    if (!user) return;
    
    const conversationId = state.activeConversation || activeConversationId;
    
    // Create conversation if none exists
    let targetConversationId = conversationId;
    if (!targetConversationId) {
      targetConversationId = await createConversation("New Chat");
      if (!targetConversationId) return;
    }

    // Add user message immediately
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date(),
      messageStatus: 'sending'
    };

    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, userMessage],
      messageStatuses: { ...prev.messageStatuses, [userMessage.id]: 'sending' },
      isTyping: true
    }));

    // Save user message
    await saveMessageToDB(userMessage, targetConversationId, 'sent');
    
    setState(prev => ({
      ...prev,
      messageStatuses: { ...prev.messageStatuses, [userMessage.id]: 'sent' }
    }));

    if (mode === 'websocket' && websocketRef.current?.readyState === WebSocket.OPEN) {
      // WebSocket mode
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

      websocketRef.current.send(JSON.stringify({
        type: 'chat_request',
        messages: [...state.messages, userMessage].map(msg => ({
          role: msg.role,
          content: msg.content
        })),
        conversationId: targetConversationId
      }));
    } else if (useStreaming) {
      // HTTP mode with SSE streaming - TRUE STREAMING
      try {
        console.log('🚀 Starting SSE streaming request...');
        
        // Create placeholder AI message
        const aiMessageId = `ai-${Date.now()}`;
        const aiMessage: EnhancedChatMessage = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
          isStreaming: true,
          messageStatus: 'sending'
        };

        setState(prev => ({ ...prev, messages: [...prev.messages, aiMessage] }));
        currentMessageRef.current = aiMessage;

        // Get auth token
        const session = await supabase.auth.getSession();
        const token = session.data.session?.access_token;
        
        if (!token) {
          throw new Error('Not authenticated');
        }

        // Call streaming endpoint
        const streamUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-streaming`;
        
        const response = await fetch(streamUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({
            messages: [...state.messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            })),
            userId: user.id
          })
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
          throw new Error(errorData.error || `Request failed: ${response.status}`);
        }

        // Check for SSE stream
        const contentType = response.headers.get('content-type');
        if (contentType?.includes('text/event-stream') && response.body) {
          // Process SSE stream
          const reader = response.body.getReader();
          const decoder = new TextDecoder();
          let fullContent = '';
          let buffer = '';

          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            
            // Process complete lines
            let newlineIndex: number;
            while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
              let line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);

              if (line.endsWith('\r')) line = line.slice(0, -1);
              if (line.trim() === '' || line.startsWith(':')) continue;

              if (line.startsWith('data: ')) {
                const data = line.slice(6).trim();
                if (data === '[DONE]') continue;

                try {
                  const parsed = JSON.parse(data);
                  
                  if (parsed.type === 'token' && parsed.content) {
                    fullContent += parsed.content;
                    
                    // Update the message content progressively
                    setState(prev => ({
                      ...prev,
                      messages: prev.messages.map(msg => 
                        msg.id === aiMessageId 
                          ? { ...msg, content: fullContent }
                          : msg
                      )
                    }));
                  } else if (parsed.type === 'complete') {
                    if (parsed.content) fullContent = parsed.content;
                    console.log('✅ Stream complete:', fullContent.length, 'chars');
                  } else if (parsed.type === 'error') {
                    throw new Error(parsed.error || 'Stream error');
                  }
                } catch (e) {
                  if (e instanceof SyntaxError) {
                    buffer = line + '\n' + buffer;
                    break;
                  }
                }
              }
            }
          }

          // Finalize the message
          const parsedFromContent = parseVisualDataFromContent(fullContent);
          const finalMessage: EnhancedChatMessage = {
            id: aiMessageId,
            role: 'assistant',
            content: parsedFromContent.content || fullContent,
            timestamp: new Date(),
            isStreaming: false,
            visualData: parsedFromContent.visualData?.[0],
            messageStatus: 'sent'
          };

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === aiMessageId ? finalMessage : msg
            ),
            isTyping: false
          }));

          await saveMessageToDB(finalMessage, targetConversationId);
          currentMessageRef.current = null;
          
        } else {
          // Fallback: non-streaming JSON response
          const data = await response.json();
          
          const finalMessage: EnhancedChatMessage = {
            id: aiMessageId,
            role: 'assistant',
            content: data.content || data.message || '',
            timestamp: new Date(),
            actions: data.actions || [],
            visualData: data.visualData,
            messageStatus: 'sent'
          };

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === aiMessageId ? finalMessage : msg
            ),
            isTyping: false
          }));

          await saveMessageToDB(finalMessage, targetConversationId);
          currentMessageRef.current = null;
        }

      } catch (error: any) {
        console.error('Error in streaming message:', error);
        setState(prev => ({ ...prev, isTyping: false }));
        currentMessageRef.current = null;
        
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          variant: "destructive"
        });
      }
    } else {
      // HTTP mode without streaming - fallback to enhanced-ai-chat
      try {
        const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
          body: {
            conversationId: targetConversationId,
            messages: [...state.messages, userMessage].map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          }
        });

        if (error) throw error;

        const aiMessage: EnhancedChatMessage = {
          id: `ai-${Date.now()}`,
          role: 'assistant',
          content: data.content || data.message || '',
          timestamp: new Date(),
          actions: data.actions || [],
          visualData: data.visualData,
          messageStatus: 'sent'
        };

        setState(prev => ({ 
          ...prev, 
          messages: [...prev.messages, aiMessage],
          isTyping: false
        }));

        await saveMessageToDB(aiMessage, targetConversationId);
      } catch (error: any) {
        console.error('Error sending message:', error);
        setState(prev => ({ ...prev, isTyping: false }));
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive"
        });
      }
    }

    // Update conversation timestamp
    try {
      await supabase
        .from('ai_conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', targetConversationId);
    } catch (error) {
      console.warn('Failed to update conversation timestamp:', error);
    }
  }, [user, state.messages, state.activeConversation, activeConversationId, mode, createConversation, saveMessageToDB, toast]);

  // ============================================
  // FILTERING & SEARCH
  // ============================================

  const searchMessages = useCallback((query: string) => {
    setState(prev => ({ ...prev, searchQuery: query }));
  }, []);

  const filterMessagesByType = useCallback((type: 'user' | 'assistant' | 'system' | 'all') => {
    setState(prev => ({ ...prev, typeFilter: type }));
  }, []);

  const filteredMessages = useMemo(() => {
    let filtered = state.messages;

    // Apply type filter
    if (state.typeFilter !== 'all') {
      filtered = filtered.filter(msg => msg.role === state.typeFilter);
    }

    // Apply search filter
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [state.messages, state.typeFilter, state.searchQuery]);

  // ============================================
  // LIFECYCLE
  // ============================================

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user, loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    const convId = state.activeConversation || activeConversationId;
    if (convId) {
      loadMessagesFromDB(convId);
    }
  }, [state.activeConversation, activeConversationId, loadMessagesFromDB]);

  // Auto-connect for WebSocket mode
  useEffect(() => {
    if (mode === 'websocket' && autoConnect && user && !state.isConnected) {
      connect();
    }

    return () => {
      disconnect();
    };
  }, [mode, autoConnect, user, state.isConnected, connect, disconnect]);

  // ============================================
  // RETURN
  // ============================================

  return {
    // State
    ...state,
    filteredMessages,
    
    // Conversation management
    loadConversations,
    createConversation,
    deleteConversation,
    selectConversation,
    togglePinConversation,
    toggleArchiveConversation,
    
    // Message management
    sendMessage,
    loadMessagesFromDB,
    updateMessageStatus,
    clearMessages: () => setState(prev => ({ ...prev, messages: [], messageStatuses: {} })),
    
    // Connection (WebSocket mode)
    connect,
    disconnect,
    
    // Filtering
    searchMessages,
    filterMessagesByType,
    
    // Legacy compatibility
    handleAction: (action: any) => {
      if (action.action === 'send_message' && action.data?.message) {
        sendMessage(action.data.message);
      }
    },
    handleLegacyAction: (action: any) => {
      if (typeof action === 'string') {
        if (action.startsWith('send:')) {
          sendMessage(action.substring(5));
        } else if (action.startsWith('workflow:')) {
          const workflow = action.substring(9).replace(/-/g, ' ');
          sendMessage(`Help me with ${workflow}`);
        } else {
          sendMessage(action);
        }
      }
    }
  };
};
