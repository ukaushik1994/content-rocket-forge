
import { useState, useCallback } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { enhancedAIService } from '@/services/enhancedAIService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export const useEnhancedAIChat = () => {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the AI assistant",
        variant: "destructive"
      });
      return;
    }

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
        [...messages, userMessage],
        user.id
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
  }, [messages, toast, user]);

  const handleAction = useCallback(async (action: string, data?: any) => {
    if (!user) return;

    if (action.startsWith('workflow:')) {
      const workflowAction = action.replace('workflow:', '');
      await handleWorkflowAction(workflowAction, data);
    } else if (action.startsWith('send:')) {
      const message = action.replace('send:', '');
      await sendMessage(message);
    }
  }, [sendMessage, user]);

  const handleWorkflowAction = useCallback(async (workflowAction: string, data?: any) => {
    if (!user) return;

    // Update workflow context in service
    enhancedAIService.updateWorkflowContext({
      currentWorkflow: workflowAction,
      stepData: { ...enhancedAIService.getWorkflowContext().stepData, ...data }
    });

    // Update workflow state in database
    await enhancedAIService.updateWorkflowState(
      user.id,
      workflowAction,
      'initiated',
      data || {}
    );

    // Send appropriate message based on workflow action
    switch (workflowAction) {
      case 'keyword-optimization':
        await sendMessage('I want to start keyword research and optimization for my content');
        break;
      case 'content-creation':
        await sendMessage('Help me create high-performing content');
        break;
      case 'performance-analysis':
        await sendMessage('Show me my content performance and optimization opportunities');
        break;
      case 'solution-integration':
        await sendMessage('Help me better integrate my solutions into my content strategy');
        break;
      default:
        console.log('Unknown workflow action:', workflowAction);
    }
  }, [sendMessage, user]);

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    handleAction
  };
};
