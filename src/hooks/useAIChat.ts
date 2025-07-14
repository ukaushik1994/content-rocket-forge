import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { sendChatRequest } from '@/services/aiService';

export interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: {
    tool_calls?: any[];
    function_results?: any[];
    context?: any;
    actions?: ChatAction[];
  };
}

export interface ChatAction {
  id: string;
  type: 'button' | 'card' | 'form';
  label: string;
  action: string;
  data?: any;
  variant?: 'default' | 'primary' | 'secondary' | 'outline';
}

export interface ChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export const useAIChat = () => {
  const [conversations, setConversations] = useState<ChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    } else {
      setMessages([]);
    }
  }, [activeConversation]);

  const loadConversations = async () => {
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user?.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages: ChatMessage[] = (data || []).map(msg => ({
        id: msg.id,
        type: msg.type as 'user' | 'assistant' | 'system',
        content: msg.content,
        timestamp: new Date(msg.created_at),
        metadata: {
          function_results: Array.isArray(msg.function_calls) ? msg.function_calls : undefined,
          actions: msg.attachments && typeof msg.attachments === 'object' && 'actions' in msg.attachments 
            ? (msg.attachments as any).actions 
            : undefined
        }
      }));
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    }
  };

  const createConversation = useCallback(async (title: string = "New Chat") => {
    if (!user) return;

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
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
    }
  }, [user, toast]);

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
  }, []);

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversation === conversationId) {
        const remaining = conversations.filter(conv => conv.id !== conversationId);
        setActiveConversation(remaining.length > 0 ? remaining[0].id : null);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  }, [activeConversation, conversations, toast]);

  const clearConversation = useCallback(async () => {
    if (!activeConversation) return;

    try {
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .eq('conversation_id', activeConversation);

      if (error) throw error;
      setMessages([]);
    } catch (error) {
      console.error('Error clearing conversation:', error);
      toast({
        title: "Error",
        description: "Failed to clear conversation",
        variant: "destructive"
      });
    }
  }, [activeConversation, toast]);

  const saveMessage = async (conversationId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    try {
      const { error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          type: message.type,
          content: message.content,
          function_calls: message.metadata?.function_results || null,
          attachments: message.metadata?.actions ? JSON.parse(JSON.stringify({ actions: message.metadata.actions })) : null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  const sendMessage = useCallback(async (content: string, context?: any) => {
    if (!activeConversation || !user) return;

    setIsLoading(true);
    setIsTyping(true);

    // Add user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    await saveMessage(activeConversation, userMessage);

    try {
      // Build conversation history for AI
      const conversationHistory = messages.map(msg => ({
        role: msg.type === 'assistant' ? 'assistant' as const : 'user' as const,
        content: msg.content
      }));

      // Add current message
      conversationHistory.push({
        role: 'user' as const,
        content
      });

      // Send to AI with system prompt for content building assistance
      const systemPrompt = `You are an AI Content Builder Assistant that can help users with all aspects of content creation, SEO optimization, keyword research, content repurposing, and more. 

You have access to the following capabilities:
- Keyword research and SERP analysis
- Content type selection and outline generation  
- Content writing and optimization
- SEO analysis and improvements
- Content repurposing across formats
- Solution integration and brand guidelines
- Performance analytics and insights

Always provide helpful responses and when appropriate, offer interactive options as actions the user can take. Respond in a conversational, helpful tone while being comprehensive and actionable.

For complex requests, break them down into steps and guide the user through the process. When providing suggestions or recommendations, always include specific, actionable advice.`;

      const response = await sendChatRequest('openai', {
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory
        ],
        temperature: 0.7,
        maxTokens: 2000
      });

      if (response?.choices?.[0]?.message?.content) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          type: 'assistant',
          content: response.choices[0].message.content,
          timestamp: new Date(),
          metadata: {
            actions: generateContextualActions(content, response.choices[0].message.content)
          }
        };

        setMessages(prev => [...prev, assistantMessage]);
        await saveMessage(activeConversation, assistantMessage);

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
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [activeConversation, user, messages, toast]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    createConversation,
    selectConversation,
    sendMessage,
    clearConversation,
    deleteConversation
  };
};

// Generate contextual actions based on message content
const generateContextualActions = (userMessage: string, aiResponse: string): ChatAction[] => {
  const actions: ChatAction[] = [];
  const lowerUser = userMessage.toLowerCase();
  const lowerAI = aiResponse.toLowerCase();

  // Content creation actions
  if (lowerUser.includes('keyword') || lowerUser.includes('seo') || lowerAI.includes('keyword')) {
    actions.push({
      id: 'keyword-research',
      type: 'button',
      label: 'Start Keyword Research',
      action: 'navigate:/research/keyword-research',
      variant: 'primary'
    });
  }

  if (lowerUser.includes('content') || lowerUser.includes('article') || lowerUser.includes('blog')) {
    actions.push({
      id: 'content-builder',
      type: 'button',
      label: 'Open Content Builder',
      action: 'navigate:/content-builder',
      variant: 'primary'
    });
  }

  if (lowerUser.includes('repurpose') || lowerAI.includes('repurpose')) {
    actions.push({
      id: 'content-repurposing',
      type: 'button',
      label: 'Repurpose Content',
      action: 'navigate:/content-repurposing',
      variant: 'secondary'
    });
  }

  // Analysis actions
  if (lowerUser.includes('analytics') || lowerUser.includes('performance')) {
    actions.push({
      id: 'view-analytics',
      type: 'button',
      label: 'View Analytics',
      action: 'navigate:/analytics',
      variant: 'outline'
    });
  }

  if (lowerUser.includes('serp') || lowerAI.includes('serp')) {
    actions.push({
      id: 'serp-analysis',
      type: 'button',
      label: 'SERP Analysis',
      action: 'navigate:/research/content-strategy',
      variant: 'secondary'
    });
  }

  // Always include helpful actions
  actions.push({
    id: 'more-help',
    type: 'button',
    label: 'More Actions',
    action: 'show-quick-actions',
    variant: 'outline'
  });

  return actions.slice(0, 4); // Limit to 4 actions max
};