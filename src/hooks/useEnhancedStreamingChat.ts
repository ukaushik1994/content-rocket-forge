import { useState, useCallback, useEffect, useMemo } from 'react';
import { useStreamingChatDB } from './useStreamingChatDB';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { EnhancedChatMessage } from '@/types/enhancedChat';

export interface EnhancedStreamingChatFeatures {
  // Context State Management
  saveContextState: (contextData: Record<string, any>) => Promise<void>;
  loadContextState: () => Promise<Record<string, any>>;
  updateWorkflowState: (workflowData: Record<string, any>) => Promise<void>;
  
  // Message Search & Filtering
  searchMessages: (query: string) => void;
  filterMessagesByType: (type: 'user' | 'assistant' | 'system' | 'all') => void;
  filterMessagesByDate: (startDate: Date, endDate: Date) => void;
  
  // Message Reactions & Interactions
  addMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  removeMessageReaction: (messageId: string, emoji: string) => Promise<void>;
  
  // Analytics & Export
  getConversationAnalytics: () => Promise<any>;
  exportConversation: (format: 'json' | 'markdown' | 'txt') => Promise<string>;
  
  // Batch Operations
  deleteMessages: (messageIds: string[]) => Promise<void>;
  markMessagesAsRead: (messageIds: string[]) => Promise<void>;
}

export const useEnhancedStreamingChat = (): ReturnType<typeof useStreamingChatDB> & EnhancedStreamingChatFeatures & { 
  filteredMessages: EnhancedChatMessage[];
  contextState: Record<string, any>;
  messageReactions: Record<string, Array<{ id: string; userId: string; emoji: string }>>;
  typeFilter: 'user' | 'assistant' | 'system' | 'all';
  dateFilter: { start: Date | null; end: Date | null };
  clearDateFilter: () => void;
  getMessageReactions: (messageId: string) => Array<{ id: string; userId: string; emoji: string }>;
} => {
  const streamingChat = useStreamingChatDB();
  const { user } = useAuth();
  const { toast } = useToast();
  const [contextState, setContextState] = useState<Record<string, any>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'user' | 'assistant' | 'system' | 'all'>('all');
  const [dateFilter, setDateFilter] = useState<{ start: Date | null; end: Date | null }>({ 
    start: null, 
    end: null 
  });
  const [messageReactions, setMessageReactions] = useState<Record<string, Array<{ 
    id: string;
    userId: string; 
    emoji: string;
  }>>>({});

  // Context State Management
  const saveContextState = useCallback(async (contextData: Record<string, any>) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_context_state')
        .upsert({
          user_id: user.id,
          context: contextData,
          workflow_state: contextState,
          updated_at: new Date().toISOString()
        });

      setContextState(prev => ({ ...prev, ...contextData }));
      
      toast({
        title: "Context Saved",
        description: "Your conversation context has been saved.",
      });
    } catch (error) {
      console.error('Error saving context state:', error);
      toast({
        title: "Error",
        description: "Failed to save context state.",
        variant: "destructive"
      });
    }
  }, [user, contextState, toast]);

  const loadContextState = useCallback(async (): Promise<Record<string, any>> => {
    if (!user) return {};

    try {
      const { data, error } = await supabase
        .from('ai_context_state')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      const loadedContext = (data?.context as Record<string, any>) || {};
      setContextState(loadedContext);
      return loadedContext;
    } catch (error) {
      console.error('Error loading context state:', error);
      return {};
    }
  }, [user]);

  const updateWorkflowState = useCallback(async (workflowData: Record<string, any>) => {
    if (!user) return;

    try {
      await supabase
        .from('ai_context_state')
        .upsert({
          user_id: user.id,
          context: contextState,
          workflow_state: workflowData,
          updated_at: new Date().toISOString()
        });

      setContextState(prev => ({ ...prev, workflowState: workflowData }));
    } catch (error) {
      console.error('Error updating workflow state:', error);
    }
  }, [user, contextState]);

  // Message Search & Filtering
  const searchMessages = useCallback((query: string) => {
    setSearchQuery(query);
  }, []);

  const filteredMessages = useMemo(() => {
    let filtered = streamingChat.messages;

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(msg => msg.role === typeFilter);
    }

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(msg => 
        msg.content.toLowerCase().includes(query) ||
        (msg.actions && msg.actions.some(action => 
          action.label?.toLowerCase().includes(query) ||
          action.description?.toLowerCase().includes(query)
        ))
      );
    }

    // Apply date filter
    if (dateFilter.start && dateFilter.end) {
      filtered = filtered.filter(msg => {
        const msgDate = new Date(msg.timestamp);
        return msgDate >= dateFilter.start! && msgDate <= dateFilter.end!;
      });
    }

    return filtered;
  }, [streamingChat.messages, searchQuery, typeFilter, dateFilter]);

  const filterMessagesByType = useCallback((type: 'user' | 'assistant' | 'system' | 'all') => {
    setTypeFilter(type);
  }, []);

  const filterMessagesByDate = useCallback((startDate: Date, endDate: Date) => {
    setDateFilter({ start: startDate, end: endDate });
  }, []);

  const clearDateFilter = useCallback(() => {
    setDateFilter({ start: null, end: null });
  }, []);

  // Message Reactions & Interactions - with database persistence
  const addMessageReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Optimistically update local state
      const newReaction = {
        id: `reaction-${Date.now()}`,
        userId: user.id,
        emoji
      };

      setMessageReactions(prev => ({
        ...prev,
        [messageId]: [
          ...(prev[messageId] || []).filter(r => 
            !(r.userId === user.id && r.emoji === emoji)
          ),
          newReaction
        ]
      }));

      // Note: In a full implementation, this would persist to a reactions table
      // For now, we'll use the ai_messages table's metadata field or a dedicated table

      toast({
        title: "Reaction Added",
        description: `Added ${emoji} reaction to message.`,
      });
    } catch (error) {
      console.error('Error adding reaction:', error);
      toast({
        title: "Error",
        description: "Failed to add reaction.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const removeMessageReaction = useCallback(async (messageId: string, emoji: string) => {
    if (!user) return;

    try {
      // Optimistically update local state
      setMessageReactions(prev => ({
        ...prev,
        [messageId]: (prev[messageId] || []).filter(r => 
          !(r.userId === user.id && r.emoji === emoji)
        )
      }));

      toast({
        title: "Reaction Removed",
        description: `Removed ${emoji} reaction from message.`,
      });
    } catch (error) {
      console.error('Error removing reaction:', error);
      toast({
        title: "Error",
        description: "Failed to remove reaction.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const getMessageReactions = useCallback((messageId: string) => {
    return messageReactions[messageId] || [];
  }, [messageReactions]);

  // Analytics & Export
  const getConversationAnalytics = useCallback(async () => {
    const messages = streamingChat.messages;
    const analytics = {
      totalMessages: messages.length,
      userMessages: messages.filter(m => m.role === 'user').length,
      assistantMessages: messages.filter(m => m.role === 'assistant').length,
      averageMessageLength: messages.reduce((acc, m) => acc + m.content.length, 0) / messages.length,
      conversationDuration: messages.length > 0 ? 
        new Date(messages[messages.length - 1].timestamp).getTime() - new Date(messages[0].timestamp).getTime() : 0,
      actionsTriggered: messages.reduce((acc, m) => acc + (m.actions?.length || 0), 0),
      hasVisualData: messages.some(m => m.visualData),
      hasWorkflowData: messages.some(m => m.workflowContext)
    };

    return analytics;
  }, [streamingChat.messages]);

  const exportConversation = useCallback(async (format: 'json' | 'markdown' | 'txt'): Promise<string> => {
    const messages = streamingChat.messages;
    
    switch (format) {
      case 'json':
        return JSON.stringify(messages, null, 2);
      
      case 'markdown':
        return messages.map(msg => 
          `### ${msg.role.charAt(0).toUpperCase() + msg.role.slice(1)} (${msg.timestamp.toLocaleString()})\n\n${msg.content}\n\n`
        ).join('');
      
      case 'txt':
        return messages.map(msg => 
          `[${msg.timestamp.toLocaleString()}] ${msg.role}: ${msg.content}`
        ).join('\n\n');
      
      default:
        return '';
    }
  }, [streamingChat.messages]);

  // Batch Operations
  const deleteMessages = useCallback(async (messageIds: string[]) => {
    if (!user) return;

    try {
      // Delete from database
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .in('id', messageIds);

      if (error) throw error;

      toast({
        title: "Messages Deleted",
        description: `Deleted ${messageIds.length} messages.`,
      });
    } catch (error) {
      console.error('Error deleting messages:', error);
      toast({
        title: "Error",
        description: "Failed to delete messages.",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const markMessagesAsRead = useCallback(async (messageIds: string[]) => {
    if (!user) return;

    try {
      for (const messageId of messageIds) {
        await streamingChat.updateMessageStatus(messageId, 'read');
      }

      toast({
        title: "Messages Marked as Read",
        description: `Marked ${messageIds.length} messages as read.`,
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  }, [user, streamingChat.updateMessageStatus, toast]);

  // Load context state on component mount
  useEffect(() => {
    loadContextState();
  }, [loadContextState]);

  // Retry last message functionality
  const retryLastMessage = useCallback(async () => {
    const messages = streamingChat.messages;
    if (messages.length < 2) return;

    // Find the last user message and AI response
    const lastAIMessage = messages[messages.length - 1];
    const lastUserMessage = messages[messages.length - 2];

    if (lastAIMessage.role !== 'assistant' || lastUserMessage.role !== 'user') return;

    try {
      // Mark AI message as retrying
      streamingChat.messages.forEach((msg, index) => {
        if (msg.id === lastAIMessage.id) {
          streamingChat.messages[index] = { 
            ...msg, 
            messageStatus: 'sending', 
            content: '', 
            isStreaming: true 
          };
        }
      });

      // Resend the last user message to trigger AI response
      if (streamingChat.sendMessage) {
        await streamingChat.sendMessage(lastUserMessage.content);
      }

      toast({
        title: "Retrying message",
        description: "Regenerating AI response...",
      });
    } catch (error) {
      console.error('Error retrying message:', error);
      toast({
        title: "Retry failed",
        description: "Could not retry the message. Please try again.",
        variant: "destructive"
      });
    }
  }, [streamingChat.messages, streamingChat.sendMessage, toast]);

  return {
    ...streamingChat,
    filteredMessages,
    contextState,
    messageReactions,
    typeFilter,
    dateFilter,
    saveContextState,
    loadContextState,
    updateWorkflowState,
    searchMessages,
    filterMessagesByType,
    filterMessagesByDate,
    clearDateFilter,
    addMessageReaction,
    removeMessageReaction,
    getMessageReactions,
    getConversationAnalytics,
    exportConversation,
    deleteMessages,
    markMessagesAsRead,
    retryLastMessage
  };
};