import { EnhancedChatMessage, VisualData, WorkflowStep } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import AIServiceController from '@/services/aiService/AIServiceController';
import { AISolutionIntegrationService } from '@/services/aiSolutionIntegrationService';
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

      console.log('🤖 Processing enhanced message with AIServiceController:', { message, userId });

      // Fetch user context (solutions, analytics, workflow state)
      const context = await this.fetchUserContext(userId);
      
      // Build enhanced system prompt with user context
      const systemPrompt = this.buildEnhancedSystemPrompt(context, conversationHistory);

      // Debug context inclusion for verification
      const bc = (context as any)?.builderContext || {};
      console.debug('🔎 AI Chat Context Inclusion', {
        serpSelected: Array.isArray(bc.serpSelections) ? bc.serpSelections.length : 0,
        serpCounts: bc.serpSelectionCounts || {},
        hasInstructions: !!(bc.additionalInstructions && bc.additionalInstructions.length > 0),
        instructionsLength: (bc.additionalInstructions || '').length,
        hasSelectedSolution: !!bc.selectedSolution,
        contentType: bc.contentType || null,
        contentIntent: bc.contentIntent || null,
        mainKeyword: bc.mainKeyword || null
      });

      // Get decrypted API keys and call enhanced-ai-chat edge function directly
      const { getApiKey } = await import('@/services/apiKeys/crud');
      const apiKeys: Record<string, string> = {};
      
      // Try to get keys for all providers
      const providers: ('openrouter' | 'anthropic' | 'openai')[] = ['openrouter', 'anthropic', 'openai'];
      for (const providerName of providers) {
        try {
          const key = await getApiKey(providerName);
          if (key) {
            apiKeys[providerName] = key;
          }
        } catch (error) {
          console.log(`No ${providerName} key available:`, error);
        }
      }
      
      if (Object.keys(apiKeys).length === 0) {
        return this.createErrorMessage('No API keys configured. Please add at least one API key in Settings.');
      }

      // Call enhanced-ai-chat edge function with decrypted keys
      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          messages: [{ role: 'user', content: message }],
          userId,
          apiKeys,
          context,
          solutions: context?.solutions,
          analytics: context?.analytics,
          workflowContext: this.workflowContext
        }
      });

      if (error) {
        console.error('❌ Enhanced AI chat error:', error);
        return this.createErrorMessage(`AI service error: ${error.message}`);
      }

      if (!data || !data.message) {
        console.warn('❌ No response from enhanced AI service');
        return this.createErrorMessage('No response received. Please check your AI provider configuration in Settings.');
      }

      console.log('✅ Enhanced AI response received from edge function');
      
      // Use the response from the edge function
      const result = {
        content: data.message,
        provider_used: data.provider,
        model_used: data.model
      };

      // Parse response for structured data
      const parsedResponse = this.parseAIResponse(result.content);

      // Generate contextual actions based on the conversation
      const contextualActions = this.generateSmartActions(
        parsedResponse.message || result.content, 
        message, 
        context
      );
      
      // Merge actions from AI response with generated contextual actions
      const aiActions = parsedResponse.actions || [];
      const allActions = [...(Array.isArray(aiActions) ? aiActions : []), ...contextualActions];
      
      // Deduplicate actions by ID
      const uniqueActions = allActions.filter((action, index, self) => 
        index === self.findIndex(a => a.id === action.id)
      );

      const enhancedMessage: EnhancedChatMessage = {
        id: `enhanced-${Date.now()}`,
        role: 'assistant',
        content: parsedResponse.message || result.content,
        timestamp: new Date(),
        actions: uniqueActions.slice(0, 6), // Limit to 6 actions
        visualData: parsedResponse.visualData,
        workflowContext: {
          currentWorkflow: this.workflowContext.currentWorkflow,
          stepData: this.workflowContext.stepData
        }
      };

      console.log('✅ Enhanced message created:', {
        contentLength: enhancedMessage.content.length,
        actionsCount: enhancedMessage.actions?.length || 0,
        hasVisualData: !!enhancedMessage.visualData,
        hasWorkflowContext: !!enhancedMessage.workflowContext,
        providerUsed: result.provider_used,
        modelUsed: result.model_used
      });

      // Stream update callback
      if (onStreamUpdate) {
        onStreamUpdate(enhancedMessage.content);
      }

      return enhancedMessage;
    } catch (error) {
      console.error('Error in processEnhancedMessage:', error);
      return this.createErrorMessage(error.message || 'Failed to process message. Please check your AI configuration in Settings.');
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

  /**
   * Build enhanced system prompt with user context and conversation history
   */
  private buildEnhancedSystemPrompt(context: any, conversationHistory: EnhancedChatMessage[]): string {
    // Build conversation context
    const recentHistory = conversationHistory.slice(-3).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    let systemPrompt = `You are an intelligent AI assistant with enhanced capabilities. You can provide structured responses with actions and visual data.

RESPONSE FORMAT: You can optionally include structured data in your responses using JSON blocks:
- Actions: $$ACTIONS$$ [{"id": "action-id", "type": "button", "label": "Action Label", "action": "navigate:/path"}] $$ACTIONS$$
- Visual Data: $$VISUAL_DATA$$ {"type": "metrics", "metrics": [{"id": "1", "title": "Title", "value": "Value"}]} $$VISUAL_DATA$$

CONVERSATION CONTEXT:
${recentHistory ? `Recent conversation:\n${recentHistory}` : 'This is the start of a new conversation.'}
`;

    // Add user context if available
    if (context) {
      if (context.solutions?.length > 0) {
        systemPrompt += `\n\nUSER'S SOLUTIONS:\n${context.solutions.map((s: any) => `- ${s.name}: ${s.description}`).join('\n')}`;
      }
      
      if (context.analytics && Object.keys(context.analytics).length > 0) {
        systemPrompt += `\n\nUSER'S ANALYTICS DATA:\n${JSON.stringify(context.analytics, null, 2)}`;
      }
    }

    // Include Content Builder context when available
    const bc = context?.builderContext;
    if (bc) {
      // SERP selections
      if (Array.isArray(bc.serpSelections) && bc.serpSelections.length > 0) {
        const grouped: Record<string, any[]> = bc.serpSelections.reduce((acc: Record<string, any[]>, item: any) => {
          const t = item?.type || 'unknown';
          if (!acc[t]) acc[t] = [];
          acc[t].push(item);
          return acc;
        }, {});

        systemPrompt += `\n\nSERP CONTEXT (selected items):`;
        for (const [type, items] of Object.entries(grouped)) {
          const examples = items.slice(0, 5).map((i: any) => `- ${i.content}`).join('\n');
          systemPrompt += `\n${type.toUpperCase()} (${items.length}):\n${examples}`;
        }
      }

      // Additional instructions
      if (bc.additionalInstructions) {
        systemPrompt += `\n\nADDITIONAL INSTRUCTIONS:\n${bc.additionalInstructions}`;
      }

      // Selected solution context
      if (bc.selectedSolution) {
        try {
          const sol = bc.selectedSolution as any;
          systemPrompt += `\n\nSOLUTION CONTEXT:\n` +
            `Name: ${sol.name}\n` +
            (sol.description ? `Description: ${sol.description}\n` : '') +
            (sol.category ? `Category: ${sol.category}\n` : '') +
            (Array.isArray(sol.features) && sol.features.length ? `Features: ${sol.features.slice(0,5).join(', ')}\n` : '') +
            (Array.isArray(sol.painPoints) && sol.painPoints.length ? `Pain Points: ${sol.painPoints.slice(0,5).join(', ')}\n` : '') +
            (Array.isArray(sol.useCases) && sol.useCases.length ? `Use Cases: ${sol.useCases.slice(0,3).join(', ')}\n` : '') +
            (Array.isArray(sol.targetAudience) && sol.targetAudience.length ? `Target Audience: ${sol.targetAudience.join(', ')}\n` : '') +
            (Array.isArray(sol.uniqueValuePropositions) && sol.uniqueValuePropositions.length ? `Value Props: ${sol.uniqueValuePropositions.slice(0,3).join(', ')}\n` : '') +
            (Array.isArray(sol.keyDifferentiators) && sol.keyDifferentiators.length ? `Differentiators: ${sol.keyDifferentiators.slice(0,3).join(', ')}\n` : '');
        } catch (_) {
          // If parsing fails, skip gracefully
        }
      }
    }

    // Add workflow context
    if (this.workflowContext.currentWorkflow) {
      systemPrompt += `\n\nCURRENT WORKFLOW: ${this.workflowContext.currentWorkflow}`;
      if (this.workflowContext.stepData) {
        systemPrompt += `\nWorkflow Data: ${JSON.stringify(this.workflowContext.stepData, null, 2)}`;
      }
    }

    systemPrompt += `\n\nProvide helpful, accurate responses and suggest relevant actions when appropriate.`;

    // Optionally append solution-aware integration guidelines when all key pieces are present
    if (bc?.selectedSolution && bc?.contentType && bc?.contentIntent) {
      const targetKeywords = [bc.mainKeyword, ...((Array.isArray(bc.secondaryKeywords) ? bc.secondaryKeywords : []) as string[])]
        .filter(Boolean) as string[];

      systemPrompt = AISolutionIntegrationService.createSolutionAwarePrompt({
        solution: bc.selectedSolution as any,
        contentType: bc.contentType as any,
        contentIntent: bc.contentIntent as any,
        targetKeywords,
        audience: Array.isArray(bc.selectedSolution?.targetAudience) ? bc.selectedSolution.targetAudience.join(', ') : undefined
      }, systemPrompt);
    }

    // Debug what was included
    try {
      console.debug('🧩 System prompt inclusions', {
        includedSerp: !!(bc && bc.serpSelections && bc.serpSelections.length),
        includedInstructions: !!(bc && bc.additionalInstructions),
        includedSolution: !!(bc && bc.selectedSolution)
      });
    } catch {}

    return systemPrompt;
  }

  /**
   * Parse AI response for structured data
   */
  private parseAIResponse(content: string): { message: string; actions?: ContextualAction[]; visualData?: VisualData; progressIndicator?: any } {
    let message = content;
    let actions: ContextualAction[] | undefined;
    let visualData: VisualData | undefined;
    let progressIndicator: any | undefined;

    try {
      // Extract actions
      const actionsMatch = content.match(/\$\$ACTIONS\$\$(.*?)\$\$ACTIONS\$\$/s);
      if (actionsMatch) {
        actions = JSON.parse(actionsMatch[1].trim());
        message = message.replace(/\$\$ACTIONS\$\$.*?\$\$ACTIONS\$\$/s, '');
      }

      // Extract visual data
      const visualMatch = content.match(/\$\$VISUAL_DATA\$\$(.*?)\$\$VISUAL_DATA\$\$/s);
      if (visualMatch) {
        visualData = JSON.parse(visualMatch[1].trim());
        message = message.replace(/\$\$VISUAL_DATA\$\$.*?\$\$VISUAL_DATA\$\$/s, '');
      }

      // Extract progress indicator
      const progressMatch = content.match(/\$\$PROGRESS\$\$(.*?)\$\$PROGRESS\$\$/s);
      if (progressMatch) {
        progressIndicator = JSON.parse(progressMatch[1].trim());
        message = message.replace(/\$\$PROGRESS\$\$.*?\$\$PROGRESS\$\$/s, '');
      }
    } catch (error) {
      console.warn('Failed to parse structured data from AI response:', error);
    }

    return {
      message: message.trim(),
      actions,
      visualData,
      progressIndicator
    };
  }

  private createErrorMessage(errorText: string): EnhancedChatMessage {
    return {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content: `I apologize, but I encountered an error: ${errorText}. Please try again.`,
      timestamp: new Date(),
      actions: [{
        id: 'configure-ai',
        type: 'button',
        label: 'Configure AI Settings',
        action: 'open-settings:api',
        variant: 'primary'
      }]
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