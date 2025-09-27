import { useState, useRef, useCallback, useEffect } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';
import { supabase } from '@/integrations/supabase/client';

export interface StreamingChatState {
  messages: EnhancedChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  isAIThinking: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
}

export const useStreamingChatDB = () => {
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
  const { activeConversationId } = useChatContextBridge();

  // Save message to database
  const saveMessageToDB = useCallback(async (message: EnhancedChatMessage, conversationId: string) => {
    if (!conversationId) return;

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
        status: 'completed'
      };

      const { error } = await supabase
        .from('ai_messages')
        .insert(messageData);
      
      if (error) {
        console.error('Database error saving message:', error);
      }
    } catch (error) {
      console.error('Error saving message to database:', error);
    }
  }, []);

  // Load messages from database for active conversation
  const loadMessagesFromDB = useCallback(async (conversationId: string) => {
    if (!conversationId) return;

    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages: EnhancedChatMessage[] = (data || []).map(msg => {
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
          workflowContext
        };
      });
      
      setState(prev => ({ ...prev, messages: formattedMessages }));
    } catch (error) {
      console.error('Error loading messages from database:', error);
    }
  }, []);

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
          const completedMessage = {
            ...currentMessageRef.current,
            isStreaming: false,
            // Add actions and visual data from AI response
            actions: data.actions || [],
            visualData: data.visualData || undefined
          };

          setState(prev => ({
            ...prev,
            messages: prev.messages.map(msg => 
              msg.id === currentMessageRef.current?.id 
                ? completedMessage
                : msg
            ),
            isAIThinking: false
          }));

          // Save completed AI message to database with actions and visual data
          saveMessageToDB(completedMessage, activeConversationId);
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

    // Add user message
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));

    // Save user message to database
    await saveMessageToDB(userMessage, activeConversationId);

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
      conversationId: activeConversationId
    };

    websocketRef.current.send(JSON.stringify(chatRequest));

    // Update conversation timestamp if needed
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

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, messages: [] }));
    currentMessageRef.current = null;
  }, []);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversationId) {
      loadMessagesFromDB(activeConversationId);
    } else {
      setState(prev => ({ ...prev, messages: [] }));
    }
  }, [activeConversationId, loadMessagesFromDB]);

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
    clearMessages,
    loadMessagesFromDB
  };
};