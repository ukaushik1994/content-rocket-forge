import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { useNavigate } from 'react-router-dom';

export const useEnhancedAIChat = () => {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingContent, setThinkingContent] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

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
          messages: [
            ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
            { role: 'user', content }
          ]
        }
      });

      if (error) throw error;

      // Add assistant message
      const assistantMessage: EnhancedChatMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: data.message || data.content || 'No response received',
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

  // Handle campaign-specific actions
  const handleCampaignAction = useCallback(async (actionType: string, actionData: any) => {
    console.log('🎯 Campaign action triggered:', actionType, actionData);
    
    switch (actionType) {
      case 'retry_failed_content':
        if (actionData?.campaignId) {
          toast({
            title: 'Retrying Failed Content',
            description: `Retrying failed items for ${actionData.campaignName || 'campaign'}...`,
          });
          
          // Send message to AI to trigger retry
          await sendMessage(`Retry failed content generation items for campaign ${actionData.campaignId}`);
        }
        break;
        
      case 'trigger_content_generation':
        if (actionData?.campaignId) {
          toast({
            title: 'Starting Generation',
            description: `Generating content for ${actionData.campaignName || 'campaign'}...`,
          });
          
          // Send message to AI to trigger generation
          await sendMessage(`Start content generation for campaign ${actionData.campaignId}`);
        }
        break;
        
      default:
        return false; // Not handled
    }
    
    return true; // Handled
  }, [sendMessage, toast]);

  const handleAction = useCallback(async (actionType: string, actionData: any) => {
    console.log('Action triggered:', actionType, actionData);
    
    // Parse colon-separated action strings (e.g., "navigate:/path")
    let parsedType = actionType;
    let parsedData = actionData || {};
    
    if (actionType?.includes(':')) {
      const colonIndex = actionType.indexOf(':');
      parsedType = actionType.substring(0, colonIndex);
      const colonValue = actionType.substring(colonIndex + 1);
      
      // Merge extracted value into data
      if (parsedType === 'navigate' && !parsedData.url) {
        parsedData = { ...parsedData, url: colonValue };
      }
    }
    
    // Handle campaign-specific actions first
    if (['retry_failed_content', 'trigger_content_generation'].includes(parsedType)) {
      await handleCampaignAction(parsedType, parsedData);
      return;
    }
    
    // Handle different action types
    switch (parsedType) {
      case 'send_message':
      case 'send-message':
        if (parsedData?.message) {
          sendMessage(parsedData.message);
        }
        break;
      case 'navigate':
        if (parsedData?.url) {
          // If payload exists, store in sessionStorage for the target page
          if (parsedData.payload) {
            try {
              sessionStorage.setItem('contentBuilderPayload', JSON.stringify(parsedData.payload));
              console.log('📦 Stored payload in sessionStorage for navigation:', parsedData.url);
            } catch (e) {
              console.warn('Failed to store navigation payload:', e);
            }
          }
          // Use React Router for internal navigation
          if (parsedData.url.startsWith('/')) {
            navigate(parsedData.url);
          } else {
            window.location.href = parsedData.url;
          }
        }
        break;
      case 'confirm_action':
        // Handle destructive action confirmation
        if (parsedData?.action && parsedData?.args) {
          const confirmMsg = `CONFIRMED: Execute ${parsedData.action} with params: ${JSON.stringify(parsedData.args)}`;
          sendMessage(confirmMsg);
        }
        break;
      default:
        console.warn('Unknown action type:', parsedType);
    }
  }, [sendMessage, navigate, handleCampaignAction]);

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
