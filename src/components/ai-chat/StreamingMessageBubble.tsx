import React from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { EnhancedMessageBubble } from './EnhancedMessageBubble';
import { ContextualAction } from '@/services/aiService';
import { useNavigate } from 'react-router-dom';
import { useRealtimeMessageStatus } from '@/hooks/useRealtimeMessageStatus';
import { useChatContextBridge } from '@/contexts/ChatContextBridge';

interface StreamingMessageBubbleProps {
  message: EnhancedChatMessage;
  isLatest: boolean;
  onRetry?: () => void;
  isRetrying?: boolean;
  onSendMessage?: (message: string) => void;
}

export const StreamingMessageBubble: React.FC<StreamingMessageBubbleProps> = ({ 
  message, 
  isLatest,
  onRetry,
  isRetrying = false,
  onSendMessage
}) => {
  const navigate = useNavigate();
  const { activeConversationId } = useChatContextBridge();
  const { markAsDelivered, markAsRead } = useRealtimeMessageStatus(activeConversationId);

  // Add retry functionality
  const handleRetry = React.useCallback(() => {
    if (onRetry) {
      onRetry();
    }
  }, [onRetry]);
  
  // Mark message as delivered when it appears
  React.useEffect(() => {
    if (message.role === 'assistant' && message.id && !message.isStreaming) {
      markAsDelivered(message.id);
    }
  }, [message.id, message.role, message.isStreaming, markAsDelivered]);
  
  // Mark as read when user views it (on scroll into view)
  React.useEffect(() => {
    if (isLatest && message.role === 'assistant' && message.id) {
      const timer = setTimeout(() => {
        markAsRead(message.id);
      }, 1000); // Mark as read after 1 second of being visible
      
      return () => clearTimeout(timer);
    }
  }, [isLatest, message.id, message.role, markAsRead]);

  const handleAction = (action: ContextualAction) => {
    console.log('🎯 Action triggered:', action);
    
    // Handle different action types
    if (action.action === 'send_message') {
      // For SERP analysis actions that generate messages
      console.log('Sending message:', action.data?.message);
      // This would trigger a new message - for now just log
      return;
    }
    
    // Handle content creation actions with navigation
    if (action.action?.includes('create-') || action.action?.includes('content-')) {
      const preloadData = {
        mainKeyword: action.data?.keyword || action.data?.mainKeyword || action.label,
        selectedKeywords: action.data?.keywords || [],
        contentType: action.data?.contentType || 'blog-post',
        contentTitle: action.data?.title || action.label,
        location: action.data?.location,
        step: action.data?.step || 1,
        description: action.description,
        ...action.data
      };

      navigate('/content', { 
        state: { prefilledData: preloadData }
      });
    } else if (action.action?.includes('keyword-research') || action.action?.includes('research')) {
      navigate('/research', { 
        state: { 
          prefilledKeyword: action.data?.keyword || action.data?.mainKeyword || action.label 
        }
      });
    } else if (action.action?.includes('strategy')) {
      navigate('/strategies');
    }
  };

  return (
      <EnhancedMessageBubble
        message={message}
        isLatest={isLatest}
        onAction={handleAction}
        onRetry={handleRetry}
        isRetrying={isRetrying}
        onSendMessage={onSendMessage}
      />
  );
};