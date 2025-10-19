import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedChatMessage } from '@/types/enhancedChat';

export const useEnhancedAIChat = () => {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingContent, setThinkingContent] = useState('');
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    try {
      setIsLoading(true);
      setIsTyping(true);

      // Add user message
      const userMessage: EnhancedChatMessage = {
        id: crypto.randomUUID(),
        role: 'user',
        content,
        timestamp: new Date().toISOString()
      };

      setMessages(prev => [...prev, userMessage]);

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Call enhanced AI chat function
      // Only send last 10 messages to prevent token bloat and maintain focus on recent context
      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          message: content,
          conversationHistory: messages.slice(-10),
          userId: user.id
        }
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: EnhancedChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.response || 'No response received',
        timestamp: new Date().toISOString(),
        visualData: data.visualData || [],
        contextualActions: data.actions || [],
        insights: data.insights || []
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send message',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setIsThinking(false);
      setThinkingContent('');
    }
  }, [messages, toast]);

  const handleAction = useCallback((actionType: string, actionData: any) => {
    console.log('Action triggered:', actionType, actionData);
    
    // Handle different action types
    switch (actionType) {
      case 'send_message':
        if (actionData?.message) {
          sendMessage(actionData.message);
        }
        break;
      case 'navigate':
        if (actionData?.url) {
          window.location.href = actionData.url;
        }
        break;
      default:
        console.warn('Unknown action type:', actionType);
    }
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    isTyping,
    isThinking,
    thinkingContent,
    sendMessage,
    handleAction
  };
};
