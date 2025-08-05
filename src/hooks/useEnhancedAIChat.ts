
import { useState, useCallback } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { enhancedAIService } from '@/services/enhancedAIService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { ContextualAction } from '@/services/aiService';

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

    // Add placeholder AI message for streaming
    const placeholderAI: EnhancedChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, placeholderAI]);

    try {
      // Get enhanced AI response
      const aiResponse = await enhancedAIService.processEnhancedMessage(
        content,
        [...messages, userMessage],
        user.id
      );

      // Update with final response
      setMessages(prev => prev.map(msg => 
        msg.id === placeholderAI.id ? aiResponse : msg
      ));
    } catch (error) {
      console.error('Error sending enhanced message:', error);
      
      // Remove placeholder and show error
      setMessages(prev => prev.filter(msg => msg.id !== placeholderAI.id));
      
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
    if (!user || !action) return;

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

    // Send contextual messages based on workflow action with real data context
    switch (workflowAction) {
      case 'keyword-optimization':
        await sendMessage('Analyze my current content and solutions to find high-impact keyword opportunities. Show me visual data on keyword gaps and optimization potential.');
        break;
      case 'content-creation':
        await sendMessage('Based on my solutions and target audience, help me create a high-performing content strategy with specific recommendations and metrics.');
        break;
      case 'performance-analysis':
        await sendMessage('Show me a comprehensive performance analysis of my content with charts, metrics, and actionable optimization recommendations.');
        break;
      case 'solution-integration':
        await sendMessage('Analyze how well my current content integrates with my solutions and show me specific opportunities to improve solution visibility and conversion.');
        break;
      default:
        // Handle custom workflow actions with data
        if (data?.workflow) {
          await sendMessage(`Execute the ${data.workflow} workflow and provide detailed insights with visual data.`);
        } else {
          console.log('Unknown workflow action:', workflowAction);
        }
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
