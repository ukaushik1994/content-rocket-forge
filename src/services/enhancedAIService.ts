
import { EnhancedChatMessage, VisualData, WorkflowStep } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WorkflowContext {
  currentWorkflow?: string;
  stepData?: Record<string, any>;
  userPreferences?: Record<string, any>;
}

class EnhancedAIService {
  private workflowContext: WorkflowContext = {};

  async processEnhancedMessage(
    message: string, 
    conversationHistory: EnhancedChatMessage[],
    userId?: string,
    onStreamUpdate?: (content: string) => void
  ): Promise<EnhancedChatMessage> {
    try {
      if (!userId) {
        return this.createErrorMessage('User authentication required');
      }

      // Fetch user context (solutions, analytics, workflow state)
      const context = await this.fetchUserContext(userId);
      
      // Prepare messages for AI
      const messages = conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      messages.push({ role: 'user', content: message });

      // Create the streaming request
      const response = await fetch(`https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/enhanced-ai-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxaXVuZHp6Y2VwbXV5a2NuZmJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYyMTU0MTYsImV4cCI6MjA2MTc5MTQxNn0.k3PVN3ETBJ-ho4gtmTf8XisS-FbTwzTaAc62nL6cFtA`
        },
        body: JSON.stringify({
          messages,
          userId,
          conversationId: `conv_${Date.now()}`,
          solutions: context.solutions || [],
          analytics: context.analytics || {},
          workflowContext: this.workflowContext
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let fullContent = '';
      let finalData: any = {};

      // Handle streaming response
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.type === 'content_delta') {
                  fullContent = data.fullMessage;
                  onStreamUpdate?.(fullContent);
                } else if (data.type === 'response_complete') {
                  finalData = data;
                } else if (data.type === 'error') {
                  throw new Error(data.error);
                }
              } catch (e) {
                console.error('Error parsing streaming data:', e);
              }
            }
          }
        }
      }

      // Create enhanced message
      const enhancedMessage: EnhancedChatMessage = {
        id: `enhanced-${Date.now()}`,
        role: 'assistant',
        content: finalData.message || fullContent || 'Response received',
        timestamp: new Date(),
        actions: finalData.actions || [],
        visualData: finalData.visualData || null,
      };

      return enhancedMessage;
    } catch (error) {
      console.error('Error in processEnhancedMessage:', error);
      return this.createErrorMessage(error.message || 'Failed to process message');
    }
  }

  private async fetchUserContext(userId: string) {
    try {
      const response = await supabase.functions.invoke('ai-context-manager', {
        body: {
          userId,
          contextType: 'all'
        }
      });

      if (response.error) {
        console.error('Error fetching context:', response.error);
        return {};
      }

      return response.data;
    } catch (error) {
      console.error('Error fetching user context:', error);
      return {};
    }
  }

  async updateWorkflowState(userId: string, workflowType: string, currentStep: string, data: any) {
    try {
      const { error } = await supabase
        .from('ai_workflow_states')
        .upsert({
          user_id: userId,
          workflow_type: workflowType,
          current_step: currentStep,
          workflow_data: data
        });

      if (error) {
        console.error('Error updating workflow state:', error);
      }
    } catch (error) {
      console.error('Error updating workflow state:', error);
    }
  }

  private createErrorMessage(errorText: string): EnhancedChatMessage {
    return {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: `I apologize, but I encountered an error: ${errorText}. Please try again.`,
      timestamp: new Date()
    };
  }

  updateWorkflowContext(context: Partial<WorkflowContext>) {
    this.workflowContext = { ...this.workflowContext, ...context };
  }

  getWorkflowContext(): WorkflowContext {
    return this.workflowContext;
  }
}

export const enhancedAIService = new EnhancedAIService();
