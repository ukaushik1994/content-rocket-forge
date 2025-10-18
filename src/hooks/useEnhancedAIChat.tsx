import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { useEnhancedAIChatDB } from './useEnhancedAIChatDB';

export const useEnhancedAIChat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [thinkingContent, setThinkingContent] = useState('');
  const { toast } = useToast();
  
  const { messages, sendMessage: sendMessageDB, handleAction: handleActionDB } = useEnhancedAIChatDB();

  // Expose the database hook's sendMessage directly
  const sendMessage = sendMessageDB;
  const handleAction = handleActionDB;

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
