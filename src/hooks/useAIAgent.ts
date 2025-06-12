
import { useState, useCallback } from 'react';
import { aiAgentService, type AgentResponse, type MessageContext } from '@/services/aiAgentService';

export const useAIAgent = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResponse, setLastResponse] = useState<AgentResponse | null>(null);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);

  const sendMessage = useCallback(async (
    message: string, 
    context?: Partial<MessageContext>
  ): Promise<AgentResponse> => {
    setIsProcessing(true);
    
    try {
      const fullContext: MessageContext = {
        conversationHistory,
        currentContext: null,
        userPreferences: {},
        ...context
      };
      
      const response = await aiAgentService.processMessage(message, fullContext);
      
      // Update conversation history
      setConversationHistory(prev => [
        ...prev,
        { type: 'user', content: message, timestamp: new Date() },
        { type: 'agent', content: response.content, timestamp: new Date() }
      ]);
      
      setLastResponse(response);
      return response;
    } finally {
      setIsProcessing(false);
    }
  }, [conversationHistory]);

  const executeFunction = useCallback(async (functionName: string, parameters: any) => {
    try {
      return await aiAgentService.executeFunction(functionName, parameters);
    } catch (error) {
      console.error('Function execution error:', error);
      throw error;
    }
  }, []);

  const clearHistory = useCallback(() => {
    setConversationHistory([]);
    setLastResponse(null);
  }, []);

  return {
    sendMessage,
    executeFunction,
    clearHistory,
    isProcessing,
    lastResponse,
    conversationHistory
  };
};
