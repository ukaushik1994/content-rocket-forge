
import { useState, useCallback } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { enhancedAIService } from '@/services/enhancedAIService';
import { useToast } from '@/hooks/use-toast';

export const useEnhancedAIChat = () => {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();

  const sendMessage = useCallback(async (content: string) => {
    setIsLoading(true);
    setIsTyping(true);

    // Add user message
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    try {
      // Get enhanced AI response
      const aiResponse = await enhancedAIService.processEnhancedMessage(
        content,
        [...messages, userMessage]
      );

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error sending enhanced message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [messages, toast]);

  const handleAction = useCallback((action: string, data?: any) => {
    if (action.startsWith('navigate:')) {
      const path = action.replace('navigate:', '');
      window.location.href = path;
    } else if (action.startsWith('workflow:')) {
      // Handle workflow actions
      const workflowAction = action.replace('workflow:', '');
      handleWorkflowAction(workflowAction, data);
    } else if (action.startsWith('send:')) {
      const message = action.replace('send:', '');
      sendMessage(message);
    }
  }, [sendMessage]);

  const handleWorkflowAction = useCallback(async (workflowAction: string, data?: any) => {
    // Update workflow context
    enhancedAIService.updateWorkflowContext({
      currentWorkflow: workflowAction,
      stepData: { ...enhancedAIService.getWorkflowContext().stepData, ...data }
    });

    // Send appropriate message based on workflow action
    switch (workflowAction) {
      case 'keyword-start':
        await sendMessage('I want to start keyword research and optimization');
        break;
      case 'keyword-input':
        await sendMessage('Let me enter a primary keyword for optimization');
        break;
      case 'content-blog':
        await sendMessage('I want to create a blog post');
        break;
      default:
        console.log('Unknown workflow action:', workflowAction);
    }
  }, [sendMessage]);

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    handleAction
  };
};
