import React, { createContext, useContext, useState, useCallback } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';

// Inline legacy type to remove useAIChat dependency
interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  actions?: ContextualAction[];
  type?: 'user' | 'assistant' | 'system';
}

interface ChatContextState {
  // Shared conversation state
  activeConversationId: string | null;
  conversationType: 'regular' | 'streaming';
  sharedMessages: EnhancedChatMessage[];
  workflowState: Record<string, any>;
  
  // Context persistence (in-memory only — no DB round-trips)
  persistentContext: Record<string, any>;
  
  // Real-time collaboration
  collaborators: ChatCollaborator[];
  typingUsers: string[];
  messageStatuses: Record<string, MessageStatus>;
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
  
  // State management
  updateActiveConversation: (conversationId: string | null) => void;
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
  const [state, setState] = useState<ChatContextState>({
    activeConversationId: null,
    conversationType: 'regular',
    sharedMessages: [],
    workflowState: {},
    persistentContext: {},
    collaborators: [],
    typingUsers: [],
    messageStatuses: {}
  });

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

  const updateActiveConversation = useCallback((conversationId: string | null) => {
    setState(prev => ({ ...prev, activeConversationId: conversationId }));
  }, []);

  const value: ChatContextBridgeValue = {
    ...state,
    switchToStreaming,
    switchToRegular,
    convertToStreamingMessage,
    convertToRegularMessage,
    syncMessages,
    updateWorkflowState,
    getWorkflowState,
    clearWorkflowState,
    persistContext,
    retrieveContext,
    updateActiveConversation,
    
    // Collaboration
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
