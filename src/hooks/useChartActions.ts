import { useCallback } from 'react';
import { ActionableItem } from '@/types/enhancedChat';
import { useToast } from '@/hooks/use-toast';

interface UseChartActionsProps {
  onSendMessage?: (message: string) => void;
  onActionTrigger?: (action: string) => void;
}

export const useChartActions = ({ onSendMessage, onActionTrigger }: UseChartActionsProps = {}) => {
  const { toast } = useToast();

  const handleActionClick = useCallback((action: ActionableItem) => {
    console.log('🎯 Action clicked:', action);
    
    if (action.action && onActionTrigger) {
      // Trigger specific action
      onActionTrigger(action.action);
      toast({
        title: 'Action Triggered',
        description: action.title,
      });
    } else if (onSendMessage) {
      // Send contextual follow-up message
      const message = `Based on the "${action.title}" recommendation: ${action.description}. What specific steps should I take?`;
      onSendMessage(message);
    }
  }, [onSendMessage, onActionTrigger, toast]);

  const handleDeepDiveClick = useCallback((prompt: string) => {
    console.log('🔍 Deep dive prompt clicked:', prompt);
    if (onSendMessage) {
      onSendMessage(prompt);
    }
  }, [onSendMessage]);

  return {
    handleActionClick,
    handleDeepDiveClick,
  };
};
