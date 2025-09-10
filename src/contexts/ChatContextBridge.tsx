import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { ConversationMessage } from '@/hooks/useAIChat';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ChatContextState {
  // Shared conversation state
  activeConversationId: string | null;
  conversationType: 'regular' | 'streaming';
  sharedMessages: EnhancedChatMessage[];
  workflowState: Record<string, any>;
  
  // Context persistence
  contextHistory: ChatContextSnapshot[];
  persistentContext: Record<string, any>;
  
  // Real-time collaboration
  collaborators: ChatCollaborator[];
  typingUsers: string[];
  messageStatuses: Record<string, MessageStatus>;
}

interface ChatContextSnapshot {
  id: string;
  timestamp: Date;
  messages: EnhancedChatMessage[];
  workflowState: Record<string, any>;
  conversationType: 'regular' | 'streaming';
  title: string;
}

interface ChatCollaborator {
  userId: string;
  userName: string;
  avatar?: string;
  isActive: boolean;
  lastSeen: Date;
}

interface MessageStatus {
  id: string;
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'error';
  timestamp: Date;
  readBy: string[];
}

interface ChatContextBridgeProps {
  children: React.ReactNode;
}

interface ChatContextBridgeValue extends ChatContextState {
  // Context management
  switchToStreaming: (preserveContext?: boolean) => void;
  switchToRegular: (preserveContext?: boolean) => void;
  saveContextSnapshot: (title?: string) => Promise<string>;
  loadContextSnapshot: (snapshotId: string) => Promise<void>;
  
  // Message bridge
  convertToStreamingMessage: (message: ConversationMessage) => EnhancedChatMessage;
  convertToRegularMessage: (message: EnhancedChatMessage) => ConversationMessage;
  syncMessages: (messages: EnhancedChatMessage[] | ConversationMessage[]) => void;
  
  // Workflow state
  updateWorkflowState: (key: string, value: any) => void;
  getWorkflowState: (key: string) => any;
  clearWorkflowState: () => void;
  
  // Collaboration
  addCollaborator: (userId: string, userName: string) => void;
  removeCollaborator: (userId: string) => void;
  setUserTyping: (userId: string, isTyping: boolean) => void;
  updateMessageStatus: (messageId: string, status: MessageStatus['status'], userId?: string) => void;
  
  // Smart suggestions
  getContextSuggestions: () => Promise<string[]>;
  persistContext: (key: string, value: any) => void;
  retrieveContext: (key: string) => any;
}

const ChatContextBridge = createContext<ChatContextBridgeValue | null>(null);

export const useChatContextBridge = () => {
  const context = useContext(ChatContextBridge);
  if (!context) {
    throw new Error('useChatContextBridge must be used within ChatContextBridgeProvider');
  }
  return context;
};

export const ChatContextBridgeProvider: React.FC<ChatContextBridgeProps> = ({ children }) => {
  const { user } = useAuth();
  const [state, setState] = useState<ChatContextState>({
    activeConversationId: null,
    conversationType: 'regular',
    sharedMessages: [],
    workflowState: {},
    contextHistory: [],
    persistentContext: {},
    collaborators: [],
    typingUsers: [],
    messageStatuses: {}
  });

  // Load persistent context on mount
  useEffect(() => {
    const loadPersistedContext = async () => {
      if (!user) return;
      
      try {
        const { data } = await supabase
          .from('ai_context_state')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (data?.context) {
          setState(prev => ({
            ...prev,
            persistentContext: data.context,
            workflowState: data.workflow_state || {}
          }));
        }
      } catch (error) {
        console.error('Error loading persistent context:', error);
      }
    };
    
    loadPersistedContext();
  }, [user]);

  // Save context periodically
  useEffect(() => {
    const saveInterval = setInterval(async () => {
      if (!user || Object.keys(state.persistentContext).length === 0) return;
      
      try {
        await supabase
          .from('ai_context_state')
          .upsert({
            user_id: user.id,
            context: state.persistentContext,
            workflow_state: state.workflowState,
            updated_at: new Date().toISOString()
          });
      } catch (error) {
        console.error('Error saving persistent context:', error);
      }
    }, 30000); // Save every 30 seconds

    return () => clearInterval(saveInterval);
  }, [user, state.persistentContext, state.workflowState]);

  const switchToStreaming = useCallback((preserveContext = true) => {
    setState(prev => ({
      ...prev,
      conversationType: 'streaming',
      ...(preserveContext ? {} : { workflowState: {}, sharedMessages: [] })
    }));
  }, []);

  const switchToRegular = useCallback((preserveContext = true) => {
    setState(prev => ({
      ...prev,
      conversationType: 'regular',
      ...(preserveContext ? {} : { workflowState: {}, sharedMessages: [] })
    }));
  }, []);

  const convertToStreamingMessage = useCallback((message: ConversationMessage): EnhancedChatMessage => {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      actions: message.actions,
      type: message.type,
      workflowContext: {
        stepData: state.workflowState
      }
    };
  }, [state.workflowState]);

  const convertToRegularMessage = useCallback((message: EnhancedChatMessage): ConversationMessage => {
    return {
      id: message.id,
      role: message.role,
      content: message.content,
      timestamp: message.timestamp,
      actions: message.actions,
      type: message.type
    };
  }, []);

  const syncMessages = useCallback((messages: EnhancedChatMessage[] | ConversationMessage[]) => {
    const enhancedMessages = messages.map(msg => {
      if ('workflowContext' in msg) {
        return msg as EnhancedChatMessage;
      }
      return convertToStreamingMessage(msg as ConversationMessage);
    });

    setState(prev => ({
      ...prev,
      sharedMessages: enhancedMessages
    }));
  }, [convertToStreamingMessage]);

  const saveContextSnapshot = useCallback(async (title?: string): Promise<string> => {
    if (!user) throw new Error('User not authenticated');

    const snapshot: ChatContextSnapshot = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      messages: state.sharedMessages,
      workflowState: state.workflowState,
      conversationType: state.conversationType,
      title: title || `Context Snapshot ${new Date().toLocaleString()}`
    };

    try {
      const { error } = await supabase
        .from('ai_context_snapshots')
        .insert({
          id: snapshot.id,
          user_id: user.id,
          title: snapshot.title,
          messages: snapshot.messages,
          workflow_state: snapshot.workflowState,
          conversation_type: snapshot.conversationType
        });

      if (error) throw error;

      setState(prev => ({
        ...prev,
        contextHistory: [snapshot, ...prev.contextHistory]
      }));

      return snapshot.id;
    } catch (error) {
      console.error('Error saving context snapshot:', error);
      throw error;
    }
  }, [user, state]);

  const loadContextSnapshot = useCallback(async (snapshotId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_context_snapshots')
        .select('*')
        .eq('id', snapshotId)
        .single();

      if (error) throw error;

      setState(prev => ({
        ...prev,
        sharedMessages: data.messages || [],
        workflowState: data.workflow_state || {},
        conversationType: data.conversation_type || 'regular'
      }));
    } catch (error) {
      console.error('Error loading context snapshot:', error);
      throw error;
    }
  }, []);

  const updateWorkflowState = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      workflowState: {
        ...prev.workflowState,
        [key]: value
      }
    }));
  }, []);

  const getWorkflowState = useCallback((key: string) => {
    return state.workflowState[key];
  }, [state.workflowState]);

  const clearWorkflowState = useCallback(() => {
    setState(prev => ({
      ...prev,
      workflowState: {}
    }));
  }, []);

  const getContextSuggestions = useCallback(async (): Promise<string[]> => {
    if (!user) return [];
    
    try {
      const response = await supabase.functions.invoke('ai-context-manager', {
        body: {
          userId: user.id,
          contextType: 'suggestions',
          currentState: state.workflowState,
          messageHistory: state.sharedMessages.slice(-5) // Last 5 messages for context
        }
      });

      return response.data?.suggestions || [];
    } catch (error) {
      console.error('Error getting context suggestions:', error);
      return [];
    }
  }, [user, state]);

  const persistContext = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      persistentContext: {
        ...prev.persistentContext,
        [key]: value
      }
    }));
  }, []);

  const retrieveContext = useCallback((key: string) => {
    return state.persistentContext[key];
  }, [state.persistentContext]);

  const addCollaborator = useCallback((userId: string, userName: string) => {
    setState(prev => ({
      ...prev,
      collaborators: [
        ...prev.collaborators.filter(c => c.userId !== userId),
        {
          userId,
          userName,
          isActive: true,
          lastSeen: new Date()
        }
      ]
    }));
  }, []);

  const removeCollaborator = useCallback((userId: string) => {
    setState(prev => ({
      ...prev,
      collaborators: prev.collaborators.filter(c => c.userId !== userId),
      typingUsers: prev.typingUsers.filter(id => id !== userId)
    }));
  }, []);

  const setUserTyping = useCallback((userId: string, isTyping: boolean) => {
    setState(prev => ({
      ...prev,
      typingUsers: isTyping 
        ? [...prev.typingUsers.filter(id => id !== userId), userId]
        : prev.typingUsers.filter(id => id !== userId)
    }));
  }, []);

  const updateMessageStatus = useCallback((messageId: string, status: MessageStatus['status'], userId?: string) => {
    setState(prev => ({
      ...prev,
      messageStatuses: {
        ...prev.messageStatuses,
        [messageId]: {
          id: messageId,
          status,
          timestamp: new Date(),
          readBy: userId && status === 'read' 
            ? [...(prev.messageStatuses[messageId]?.readBy || []), userId]
            : (prev.messageStatuses[messageId]?.readBy || [])
        }
      }
    }));
  }, []);

  const value: ChatContextBridgeValue = {
    ...state,
    switchToStreaming,
    switchToRegular,
    saveContextSnapshot,
    loadContextSnapshot,
    convertToStreamingMessage,
    convertToRegularMessage,
    syncMessages,
    updateWorkflowState,
    getWorkflowState,
    clearWorkflowState,
    getContextSuggestions,
    persistContext,
    retrieveContext,
    addCollaborator,
    removeCollaborator,
    setUserTyping,
    updateMessageStatus
  };

  return (
    <ChatContextBridge.Provider value={value}>
      {children}
    </ChatContextBridge.Provider>
  );
};