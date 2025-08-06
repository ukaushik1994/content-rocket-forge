import { EnhancedChatMessage, VisualData, WorkflowStep } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';

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
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
      messages.push({ role: 'user', content: message });

      // Create the request using enhanced AI chat function
      console.log('🚀 Sending request to enhanced-ai-chat with context:', {
        messagesCount: messages.length,
        userId,
        hasContext: !!context,
        hasSolutions: !!(context?.solutions?.length),
        hasAnalytics: !!(context?.analytics && Object.keys(context.analytics).length),
        hasWorkflowContext: !!(this.workflowContext && Object.keys(this.workflowContext).length)
      });

      const response = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          messages,
          userId,
          solutions: context.solutions || [],
          analytics: context.analytics || {},
          workflowContext: this.workflowContext || {}
        }
      });

      console.log('📨 Edge function response:', {
        status: response.status,
        hasError: !!response.error,
        hasData: !!response.data,
        dataKeys: response.data ? Object.keys(response.data) : []
      });

      if (response.error) {
        console.error('❌ Enhanced AI Chat error:', response.error);
        throw new Error(response.error.message || 'AI service error');
      }

      const data = response.data;
      
      if (!data) {
        console.error('❌ No data received from edge function');
        throw new Error('No response data from AI service');
      }
      
      // Generate contextual actions based on the conversation
      const contextualActions = this.generateSmartActions(
        data?.content || data?.message || '', 
        message, 
        context
      );
      
      // Merge actions from AI response with generated contextual actions
      const aiActions = data?.actions || [];
      const allActions = [...(Array.isArray(aiActions) ? aiActions : []), ...contextualActions];
      
      // Deduplicate actions by ID
      const uniqueActions = allActions.filter((action, index, self) => 
        index === self.findIndex(a => a.id === action.id)
      );

      const enhancedMessage: EnhancedChatMessage = {
        id: `enhanced-${Date.now()}`,
        role: 'assistant',
        content: data?.message || data?.content || 'Response received',
        timestamp: new Date(),
        actions: uniqueActions.slice(0, 6), // Limit to 6 actions
        visualData: data?.visualData || data?.visual_data || null,
        workflowContext: data?.workflowContext || null
      };

      console.log('✅ Enhanced message created:', {
        contentLength: enhancedMessage.content.length,
        actionsCount: enhancedMessage.actions?.length || 0,
        hasVisualData: !!enhancedMessage.visualData,
        hasWorkflowContext: !!enhancedMessage.workflowContext
      });

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

  private generateSmartActions(aiResponse: string, userMessage: string, context: any): ContextualAction[] {
    const actions: ContextualAction[] = [];
    const lowerResponse = aiResponse.toLowerCase();
    const lowerMessage = userMessage.toLowerCase();

    // Extract potential keywords from the conversation
    const keywords = this.extractKeywords(userMessage + ' ' + aiResponse);
    const mainKeyword = keywords[0];

    // Content creation actions based on conversation context
    if (lowerMessage.includes('blog') || lowerResponse.includes('blog')) {
      actions.push({
        id: `create-blog-${Date.now()}`,
        label: `Create Blog Post${mainKeyword ? `: "${mainKeyword}"` : ''}`,
        action: 'create-blog-post',
        type: 'card',
        variant: 'primary',
        description: mainKeyword 
          ? `Start creating a blog post optimized for "${mainKeyword}"`
          : 'Create an SEO-optimized blog post',
        data: {
          contentType: 'blog-post',
          mainKeyword,
          keywords: keywords.slice(0, 5),
          step: 1
        }
      });
    }

    if (lowerMessage.includes('landing') || lowerResponse.includes('landing')) {
      actions.push({
        id: `create-landing-${Date.now()}`,
        label: `Create Landing Page${mainKeyword ? `: "${mainKeyword}"` : ''}`,
        action: 'create-landing-page',
        type: 'card',
        variant: 'primary',
        description: mainKeyword 
          ? `Build a high-converting landing page for "${mainKeyword}"`
          : 'Create a conversion-optimized landing page',
        data: {
          contentType: 'landing-page',
          mainKeyword,
          keywords: keywords.slice(0, 3),
          step: 1
        }
      });
    }

    // SEO and keyword actions
    if (lowerMessage.includes('keyword') || lowerResponse.includes('keyword') || lowerMessage.includes('seo')) {
      actions.push({
        id: `keyword-research-${Date.now()}`,
        label: 'Keyword Research',
        action: 'keyword-research',
        type: 'button',
        variant: 'outline',
        description: mainKeyword 
          ? `Find related keywords for "${mainKeyword}"`
          : 'Research high-value keywords for your niche',
        data: { keyword: mainKeyword }
      });
    }

    // Strategy actions for general queries
    if (actions.length === 0 || lowerMessage.includes('strategy') || lowerMessage.includes('plan')) {
      actions.push({
        id: `content-strategy-${Date.now()}`,
        label: 'Content Strategy',
        action: 'content-strategy',
        type: 'card',
        variant: 'secondary',
        description: 'Develop a comprehensive content marketing strategy',
        data: { keywords }
      });
    }

    // Always add a general content creation action if we have keywords
    if (mainKeyword && !actions.some(a => a.action.includes('create-'))) {
      actions.push({
        id: `create-content-${Date.now()}`,
        label: `Create Content: "${mainKeyword}"`,
        action: 'create-blog-post',
        type: 'card',
        variant: 'primary',
        description: `Start creating content optimized for "${mainKeyword}"`,
        data: {
          contentType: 'blog-post',
          mainKeyword,
          keywords: keywords.slice(0, 5),
          step: 1
        }
      });
    }

    return actions.slice(0, 4); // Limit to 4 actions for clean UI
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction - can be enhanced with NLP
    const words = text.toLowerCase().split(/\s+/);
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'about', 'how', 'what', 'when', 'where', 'why', 'can', 'could', 'should', 'would', 'will', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'a', 'an', 'blog', 'post', 'content', 'create', 'write', 'article'];
    
    return words
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10); // Take top 10 potential keywords
  }
}

export const enhancedAIService = new EnhancedAIService();