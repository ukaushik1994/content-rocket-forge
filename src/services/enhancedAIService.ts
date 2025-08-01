
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
    userId?: string
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

      // Call enhanced AI function
      const response = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          messages,
          userId,
          ...context
        }
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const { message: aiMessage, actions, visualData } = response.data;

      // Create enhanced message
      const enhancedMessage: EnhancedChatMessage = {
        id: `enhanced-${Date.now()}`,
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date(),
        actions: actions || [],
        visualData: visualData || null,
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
