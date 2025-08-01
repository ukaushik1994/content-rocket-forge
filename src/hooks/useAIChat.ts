
import { useState, useCallback } from 'react';
import { sendChatMessage, ChatMessage, ChatResponse, ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface ConversationMessage extends ChatMessage {
  id: string;
  timestamp: Date;
  actions?: ContextualAction[];
}

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

// Export ChatMessage for other components
export type { ChatMessage };

export const useAIChat = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load conversations from database
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages: ConversationMessage[] = (data || []).map(msg => {
        let actions: ContextualAction[] = [];
        
        // Safely parse attachments
        if (msg.attachments && typeof msg.attachments === 'object') {
          const attachments = msg.attachments as { actions?: ContextualAction[] };
          actions = attachments.actions || [];
        }
        
        return {
          id: msg.id,
          role: msg.type as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          actions
        };
      });
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, []);

  // Create new conversation
  const createConversation = useCallback(async (title: string = "New Chat") => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          title,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setActiveConversation(data.id);
      setMessages([]);
      
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
  }, [user, toast]);

  // Send message
  const sendMessage = useCallback(async (content: string) => {
    if (!activeConversation || !user) return;

    setIsLoading(true);
    setIsTyping(true);

    // Add user message immediately
    const userMessage: ConversationMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Save user message to database
      await supabase
        .from('ai_messages')
        .insert({
          conversation_id: activeConversation,
          type: 'user',
          content
        });

      // Build conversation history
      const conversationHistory: ChatMessage[] = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      conversationHistory.push({ role: 'user', content });

      // Get AI response
      const response = await sendChatMessage(conversationHistory);

      if (response) {
        const assistantMessage: ConversationMessage = {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          content: response.message,
          timestamp: new Date(),
          actions: response.actions
        };

        setMessages(prev => [...prev, assistantMessage]);

        // Save assistant message to database with proper JSON serialization
        await supabase
          .from('ai_messages')
          .insert({
            conversation_id: activeConversation,
            type: 'assistant',
            content: response.message,
            attachments: response.actions ? JSON.parse(JSON.stringify({ actions: response.actions })) : null
          });

        // Update conversation title if it's the first exchange
        if (messages.length === 0) {
          const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
          await supabase
            .from('ai_conversations')
            .update({ title })
            .eq('id', activeConversation);
          
          setConversations(prev => 
            prev.map(conv => 
              conv.id === activeConversation 
                ? { ...conv, title }
                : conv
            )
          );
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [activeConversation, user, messages, toast]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversation === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  }, [activeConversation, toast]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    loadConversations,
    loadMessages,
    createConversation,
    sendMessage,
    deleteConversation,
    selectConversation: setActiveConversation
  };
};
