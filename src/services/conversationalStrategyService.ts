import { supabase } from '@/integrations/supabase/client';

export interface ConversationStep {
  id: string;
  step_number: number;
  step_name: string;
  ai_input: any;
  ai_output: any;
  user_feedback?: any;
  processing_time_ms?: number;
  status: 'pending' | 'processing' | 'completed' | 'error';
  error_message?: string;
  created_at: string;
  completed_at?: string;
}

export interface StrategyConversation {
  id: string;
  user_id: string;
  status: 'in_progress' | 'completed' | 'error';
  current_step: number;
  total_steps: number;
  goals: any;
  company_context: any;
  solutions_context: any;
  final_strategy_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface ConversationState {
  conversation: StrategyConversation | null;
  steps: ConversationStep[];
  currentStepData: any;
  isProcessing: boolean;
  error?: string;
}

export class ConversationalStrategyService {
  async startConversation(
    goals: any,
    companyContext: any,
    solutionsContext: any
  ): Promise<{ conversation: StrategyConversation; currentStep: ConversationStep; nextStep: any }> {
    console.log('🚀 Starting conversational AI strategy generation...');
    
    const { data, error } = await supabase.functions.invoke('ai-strategy-conversation', {
      body: {
        action: 'start_conversation',
        goals,
        companyContext,
        solutionsContext
      }
    });

    if (error) {
      console.error('Error starting conversation:', error);
      throw new Error(`Failed to start conversation: ${error.message}`);
    }

    return data;
  }

  async processStep(conversationId: string, stepData: any): Promise<any> {
    console.log(`🔄 Processing step for conversation: ${conversationId}`);
    
    const { data, error } = await supabase.functions.invoke('ai-strategy-conversation', {
      body: {
        action: 'process_step',
        conversationId,
        stepData
      }
    });

    if (error) {
      console.error('Error processing step:', error);
      throw new Error(`Failed to process step: ${error.message}`);
    }

    return data;
  }

  async getConversation(conversationId: string): Promise<{
    conversation: StrategyConversation;
    steps: ConversationStep[];
    allSteps: any[];
  }> {
    const { data, error } = await supabase.functions.invoke('ai-strategy-conversation', {
      body: {
        action: 'get_conversation',
        conversationId
      }
    });

    if (error) {
      console.error('Error getting conversation:', error);
      throw new Error(`Failed to get conversation: ${error.message}`);
    }

    return data;
  }

  async getUserConversations(): Promise<StrategyConversation[]> {
    const { data, error } = await supabase
      .from('ai_strategy_conversations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as 'in_progress' | 'completed' | 'error'
    }));
  }

  async deleteConversation(conversationId: string): Promise<void> {
    const { error } = await supabase
      .from('ai_strategy_conversations')
      .delete()
      .eq('id', conversationId);

    if (error) {
      console.error('Error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }

  // Helper to get company and solutions context
  async getContextData(): Promise<{ companyContext: any; solutionsContext: any }> {
    const [companyResult, solutionsResult] = await Promise.all([
      supabase.from('company_info').select('*').maybeSingle(),
      supabase.from('solutions').select('*')
    ]);

    return {
      companyContext: companyResult.data || {},
      solutionsContext: solutionsResult.data || []
    };
  }
}

export const conversationalStrategyService = new ConversationalStrategyService();