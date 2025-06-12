import { useState, useCallback, useRef } from 'react';
import { aiAgentService, type AgentResponse, type MessageContext } from '@/services/aiAgentService';
import { conversationService, type Conversation, type ConversationMessage } from '@/services/conversationService';
import { enhancedAiAgentService } from '@/services/enhancedAiAgentService';
import { type SmartSuggestion } from '@/services/smartSuggestionEngine';
import { type IntelligentInsights } from '@/services/intelligentWorkflowService';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export interface EnhancedMessage extends ConversationMessage {
  functionCalls?: any[];
  attachments?: any[];
  isStreaming?: boolean;
  suggestions?: SmartSuggestion[];
  insights?: IntelligentInsights;
}

export const useEnhancedAIAgent = () => {
  const { user } = useAuth();
  const location = useLocation();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<EnhancedMessage[]>([]);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const currentContextRef = useRef<any>(null);

  // Update current context when location or user changes
  const updateContext = useCallback(() => {
    currentContextRef.current = {
      currentPage: location.pathname,
      pageName: getPageName(location.pathname),
      timestamp: new Date().toISOString(),
      userInfo: {
        name: user?.user_metadata?.first_name || 'User',
        email: user?.email
      }
    };
  }, [location.pathname, user]);

  const getPageName = (pathname: string) => {
    const routes = {
      '/': 'Dashboard',
      '/content-builder': 'Content Builder',
      '/settings': 'Settings',
      '/analytics': 'Analytics',
      '/solutions': 'Solutions',
      '/drafts': 'Drafts',
      '/ai-assistant': 'AI Assistant'
    };
    return routes[pathname] || 'Unknown Page';
  };

  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    setIsLoadingConversations(true);
    setError(null);
    
    try {
      const convs = await conversationService.getConversations();
      setConversations(convs);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      setError('Failed to load conversations');
      toast.error('Failed to load conversations');
    } finally {
      setIsLoadingConversations(false);
    }
  }, [user]);

  const createNewConversation = useCallback(async (title?: string) => {
    if (!user) {
      toast.error('Please sign in to create conversations');
      return null;
    }

    try {
      const conversation = await conversationService.createConversation(title);
      setConversations(prev => [conversation, ...prev]);
      setCurrentConversation(conversation);
      setMessages([]);
      return conversation;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
      return null;
    }
  }, [user]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsProcessing(true);
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        throw new Error('Conversation not found');
      }

      setCurrentConversation(conversation);
      const msgs = await conversationService.getConversationMessages(conversationId);
      setMessages(msgs.map(msg => ({
        ...msg,
        functionCalls: msg.function_calls,
        attachments: msg.attachments
      })));
    } catch (error: any) {
      console.error('Error loading conversation:', error);
      toast.error('Failed to load conversation');
    } finally {
      setIsProcessing(false);
    }
  }, [conversations]);

  const sendMessage = useCallback(async (content: string): Promise<AgentResponse | null> => {
    if (!user) {
      toast.error('Please sign in to chat');
      return null;
    }

    if (!content.trim()) return null;

    setIsProcessing(true);
    setError(null);
    updateContext();

    try {
      // Create conversation if none exists
      let conversation = currentConversation;
      if (!conversation) {
        conversation = await createNewConversation();
        if (!conversation) return null;
      }

      // Add user message to UI immediately
      const userMessage: EnhancedMessage = {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        type: 'user',
        content,
        status: 'completed',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, userMessage]);

      // Get enhanced context with platform intelligence
      const enhancedContext = await enhancedAiAgentService.getEnhancedContext(currentContextRef.current);
      
      console.log('Enhanced context:', enhancedContext);

      // Process message with intelligence
      const intelligentResponse = await enhancedAiAgentService.processMessageWithIntelligence(content, enhancedContext);
      
      console.log('Intelligent response:', intelligentResponse);

      // Create response object
      const response: AgentResponse = {
        content: intelligentResponse.userResponse || "I'll help you with that.",
        functionCalls: intelligentResponse.functions || [],
        context: intelligentResponse
      };

      // Save user message to database
      await conversationService.saveMessage(conversation.id, 'user', content);

      // Add agent response to UI with enhanced data
      const agentMessage: EnhancedMessage = {
        id: (Date.now() + 1).toString(),
        conversation_id: conversation.id,
        type: 'agent',
        content: response.content,
        functionCalls: response.functionCalls,
        attachments: response.attachments,
        suggestions: intelligentResponse.suggestions,
        insights: intelligentResponse.insights,
        status: 'completed',
        created_at: new Date().toISOString()
      };

      // Save agent message to database
      await conversationService.saveMessage(
        conversation.id,
        'agent',
        response.content,
        response.functionCalls,
        response.attachments
      );

      // Update conversation title if it's the first message
      if (messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await conversationService.updateConversationTitle(conversation.id, title);
        setCurrentConversation(prev => prev ? { ...prev, title } : null);
        setConversations(prev => prev.map(c => 
          c.id === conversation.id ? { ...c, title } : c
        ));
      }

      return response;
    } catch (error: any) {
      console.error('Error sending message:', error);
      const errorMsg = error.message || 'Failed to send message';
      setError(errorMsg);
      toast.error(errorMsg);

      // Add error message to UI
      const errorMessage: EnhancedMessage = {
        id: (Date.now() + 2).toString(),
        conversation_id: currentConversation?.id || '',
        type: 'agent',
        content: `I apologize, but I encountered an error: ${errorMsg}. Please try again with more specific information.`,
        status: 'error',
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);

      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [user, currentConversation, messages, createNewConversation, updateContext]);

  const executeFunction = useCallback(async (functionName: string, parameters: any) => {
    try {
      return await aiAgentService.executeFunction(functionName, parameters);
    } catch (error) {
      console.error('Function execution error:', error);
      throw error;
    }
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await conversationService.deleteConversation(conversationId);
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (currentConversation?.id === conversationId) {
        setCurrentConversation(null);
        setMessages([]);
      }
      
      toast.success('Conversation deleted');
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  }, [currentConversation]);

  const clearCurrentChat = useCallback(() => {
    setCurrentConversation(null);
    setMessages([]);
    setError(null);
  }, []);

  return {
    // State
    isProcessing,
    conversations,
    currentConversation,
    messages,
    isLoadingConversations,
    error,
    
    // Actions
    sendMessage,
    executeFunction,
    loadConversations,
    createNewConversation,
    loadConversation,
    deleteConversation,
    clearCurrentChat,
    
    // Context
    updateContext
  };
};
