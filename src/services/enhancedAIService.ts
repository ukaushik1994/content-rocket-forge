import { EnhancedChatMessage } from '@/types/enhancedChat';

export interface WorkflowContext {
  currentWorkflow?: string;
  stepData?: Record<string, any>;
  userPreferences?: Record<string, any>;
}

/**
 * EnhancedAIService — stripped to workflow state helpers only.
 * Message processing is handled by the enhanced-ai-chat edge function via SSE.
 */
class EnhancedAIService {
  async updateWorkflowState(userId: string, workflowType: string, currentStep: string, data: any) {
    const workflowState = {
      userId,
      workflowType,
      currentStep,
      data
    };
    localStorage.setItem(`workflow_${workflowType}_${userId}`, JSON.stringify(workflowState));
  }

  async getWorkflowState(userId: string, workflowType: string) {
    const stored = localStorage.getItem(`workflow_${workflowType}_${userId}`);
    return stored ? JSON.parse(stored) : null;
  }
}

export const enhancedAIService = new EnhancedAIService();
