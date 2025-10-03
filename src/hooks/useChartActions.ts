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
    
    // Phase 4: Enhanced action handling with actionType
    switch (action.actionType) {
      case 'navigate':
        // Navigate to internal page
        if (action.targetUrl) {
          window.location.href = action.targetUrl;
        }
        toast({
          title: 'Navigating',
          description: action.title,
        });
        break;
        
      case 'external':
        // Open external link
        if (action.targetUrl) {
          window.open(action.targetUrl, '_blank');
        }
        toast({
          title: 'Opening Link',
          description: action.title,
        });
        break;
        
      case 'workflow':
        // Trigger workflow
        if (onActionTrigger) {
          onActionTrigger(action.action || action.id);
        }
        toast({
          title: 'Workflow Started',
          description: action.title,
        });
        break;
        
      case 'info':
        // Show detailed info in chat
        if (onSendMessage) {
          onSendMessage(`Tell me more about: ${action.title}`);
        }
        break;
        
      default:
        // Legacy behavior for backward compatibility
        if (action.action && onActionTrigger) {
          onActionTrigger(action.action);
          toast({
            title: 'Action Triggered',
            description: action.title,
          });
        } else if (onSendMessage) {
          const message = `Based on the "${action.title}" recommendation: ${action.description}. What specific steps should I take?`;
          onSendMessage(message);
        }
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
