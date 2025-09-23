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
    onStreamUpdate?: (content: string) => void,
    retryCount: number = 0
  ): Promise<EnhancedChatMessage> {
    try {
      if (!userId) {
        return this.createErrorMessage('User authentication required');
      }

      console.log('🤖 Processing enhanced message with AIServiceController:', { message, userId, retryCount });

      // Detect if this is a SERP-related query and trigger analysis
      let serpAnalysisResult = null;
      if (this.shouldTriggerSerpAnalysis(message)) {
        console.log('🔍 Triggering SERP analysis for message:', message);
        serpAnalysisResult = await this.performSerpAnalysis(message, userId);
      }

      // Fetch user context with retry logic
      const context = await this.fetchUserContextWithRetry(userId, 3);
      
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

      // Add SERP data to visual data if we have analysis results
      if (serpAnalysisResult) {
        parsedResponse.visualData = {
          ...parsedResponse.visualData,
          serpData: this.transformToEnhancedSerpResult(serpAnalysisResult),
          type: 'serp_analysis'
        };
      }

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
      
      // Implement retry logic for transient errors
      if (retryCount < 2 && this.isRetryableError(error)) {
        console.log(`🔄 Retrying request (attempt ${retryCount + 1}/3)...`);
        await this.delay(1000 * (retryCount + 1)); // Exponential backoff
        return this.processEnhancedMessage(message, conversationHistory, userId, onStreamUpdate, retryCount + 1);
      }
      
      return this.createEnhancedErrorMessage(error, retryCount);
    }
  }

  private async fetchUserContextWithRetry(userId: string, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await supabase.functions.invoke('ai-context-manager', {
          body: {
            userId,
            contextType: 'all'
          }
        });

        if (response.error) {
          console.error(`Context fetch attempt ${attempt} failed:`, response.error);
          if (attempt === maxRetries) {
            return this.getFallbackContext(userId);
          }
          await this.delay(500 * attempt);
          continue;
        }

        return response.data;
      } catch (error) {
        console.error(`Context fetch attempt ${attempt} error:`, error);
        if (attempt === maxRetries) {
          return this.getFallbackContext(userId);
        }
        await this.delay(500 * attempt);
      }
    }
    return this.getFallbackContext(userId);
  }

  private async getFallbackContext(userId: string): Promise<any> {
    console.log('🔄 Using fallback context for user:', userId);
    
    // Try to get basic user data directly from database
    try {
      const { data: solutions } = await supabase
        .from('solutions')
        .select('name, description, features, painPoints, targetAudience')
        .eq('user_id', userId)
        .limit(5);

      const { data: contentItems } = await supabase
        .from('content_items')
        .select('title, content_type, seo_score, approval_status')
        .eq('user_id', userId)
        .limit(10);

      return {
        solutions: solutions || [],
        analytics: {
          totalContent: contentItems?.length || 0,
          published: contentItems?.filter(c => c.approval_status === 'approved').length || 0,
          avgSeoScore: contentItems?.reduce((acc, c) => acc + (c.seo_score || 0), 0) / (contentItems?.length || 1) || 0
        }
      };
    } catch (error) {
      console.error('Fallback context failed:', error);
      return {};
    }
  }

  async updateWorkflowState(userId: string, workflowType: string, currentStep: string, data: any) {
    try {
      // Store workflow state in localStorage as fallback until DB table is ready
      const workflowState = {
        userId,
        workflowType,
        currentStep,
        workflowData: data,
        status: 'active',
        timestamp: Date.now()
      };
      
      localStorage.setItem(`workflow_${userId}_${workflowType}`, JSON.stringify(workflowState));
      
      // Also try to store in database if table exists
      const { error } = await supabase
        .from('ai_workflow_states')
        .upsert({
          user_id: userId,
          workflow_type: workflowType,
          current_step: currentStep,
          workflow_data: data
        });

      if (error && !error.message.includes('does not exist')) {
        console.error('Error updating workflow state:', error);
      }
    } catch (error) {
      console.error('Error updating workflow state:', error);
      // Fallback to localStorage only
      const workflowState = {
        userId,
        workflowType, 
        currentStep,
        workflowData: data,
        status: 'active',
        timestamp: Date.now()
      };
      localStorage.setItem(`workflow_${userId}_${workflowType}`, JSON.stringify(workflowState));
    }
  }

  private calculateWorkflowProgress(workflowType: string, currentStep: string): number {
    const workflowSteps: Record<string, string[]> = {
      'keyword-optimization': ['analysis', 'research', 'implementation', 'validation'],
      'content-creation': ['planning', 'outline', 'writing', 'optimization', 'review'],
      'performance-analysis': ['data-collection', 'analysis', 'insights', 'recommendations'],
      'solution-integration': ['assessment', 'integration', 'testing', 'optimization']
    };

    const steps = workflowSteps[workflowType] || ['start', 'process', 'complete'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex === -1) return 0;
    return Math.round(((currentIndex + 1) / steps.length) * 100);
  }

  async getWorkflowState(userId: string, workflowType: string) {
    try {
      // Try database first
      const { data, error } = await supabase
        .from('ai_workflow_states')
        .select('*')
        .eq('user_id', userId)
        .eq('workflow_type', workflowType)
        .single();

      if (!error && data) {
        return {
          currentStep: data.current_step,
          workflowData: data.workflow_data,
          progress: this.calculateWorkflowProgress(workflowType, data.current_step),
          status: 'active' // Default since status column may not exist yet
        };
      }
    } catch (error) {
      console.warn('Database workflow state not available, using localStorage');
    }

    // Fallback to localStorage
    const stored = localStorage.getItem(`workflow_${userId}_${workflowType}`);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        currentStep: parsed.currentStep,
        workflowData: parsed.workflowData,
        progress: this.calculateWorkflowProgress(workflowType, parsed.currentStep),
        status: parsed.status || 'active'
      };
    }

    return null;
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

RESPONSE FORMAT: You can optionally include structured data in your responses using delimiter format:
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

  /**
   * Transform SERP analysis result to EnhancedSerpResult format
   */
  private transformToEnhancedSerpResult(serpResult: any): any[] {
    if (!serpResult) return [];

    // If it's already an array of EnhancedSerpResult, return as is
    if (Array.isArray(serpResult)) return serpResult;

    // Transform the SERP API result to EnhancedSerpResult format
    const transformed = {
      keyword: serpResult.keyword || 'Unknown',
      searchVolume: serpResult.searchVolume || 0,
      keywordDifficulty: serpResult.keywordDifficulty || 0,
      competitionScore: serpResult.competitionScore || 0,
      
      // Generate mock data for required fields that aren't in basic SERP response
      keywords: [serpResult.keyword || 'Unknown'],
      contentGaps: serpResult.topResults?.slice(0, 3).map((result: any, index: number) => ({
        topic: `Content Gap ${index + 1}`,
        description: `Analysis of ${result.title || 'content'}`,
        opportunity: `Improve content around: ${result.snippet || 'topic'}`,
        source: result.domain || result.url || 'Unknown'
      })) || [],
      questions: [
        {
          question: `What is ${serpResult.keyword}?`,
          answer: serpResult.topResults?.[0]?.snippet || 'No answer available',
          source: serpResult.topResults?.[0]?.domain || 'Search Results'
        }
      ],
      featuredSnippets: serpResult.topResults?.slice(0, 1).map((result: any) => ({
        type: 'paragraph',
        content: result.snippet || '',
        source: result.domain || result.url || '',
        title: result.title || ''
      })) || [],
      topStories: [],
      multimedia: { images: [], videos: [] },
      entities: [],
      relatedSearches: [],
      competitorAnalysis: serpResult.topResults?.slice(0, 5).map((result: any, index: number) => ({
        domain: result.domain || new URL(result.url || 'https://example.com').hostname,
        position: result.position || index + 1,
        title: result.title || '',
        snippet: result.snippet || '',
        url: result.url || '',
        strengths: ['High ranking position'],
        weaknesses: ['Generic analysis'],
        contentQuality: Math.floor(Math.random() * 40) + 60
      })) || [],
      topResults: serpResult.topResults || []
    };

    return [transformed];
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

  private createEnhancedErrorMessage(error: any, retryCount: number): EnhancedChatMessage {
    const errorType = this.getErrorType(error);
    let content = '';
    let actions: any[] = [];

    switch (errorType) {
      case 'network':
        content = `🌐 Network connection issue detected. ${retryCount > 0 ? `Tried ${retryCount + 1} times.` : ''} Please check your internet connection and try again.`;
        actions = [
          { id: 'retry-message', label: 'Retry', action: 'retry', variant: 'primary' },
          { id: 'check-connection', label: 'Check Connection', action: 'navigate:/settings/connection', variant: 'outline' }
        ];
        break;
      case 'api_key':
        content = `🔑 API key issue detected. Please check your API key configuration in Settings.`;
        actions = [
          { id: 'configure-keys', label: 'Configure API Keys', action: 'navigate:/settings/api', variant: 'primary' },
          { id: 'test-connection', label: 'Test Connection', action: 'test-api-keys', variant: 'outline' }
        ];
        break;
      case 'quota':
        content = `📊 API quota exceeded. Consider upgrading your plan or try again later.`;
        actions = [
          { id: 'view-usage', label: 'View Usage', action: 'navigate:/settings/usage', variant: 'primary' },
          { id: 'upgrade-plan', label: 'Upgrade Plan', action: 'navigate:/settings/billing', variant: 'outline' }
        ];
        break;
      case 'rate_limit':
        content = `⏰ Rate limit reached. Please wait a moment before trying again.`;
        actions = [
          { id: 'retry-later', label: 'Retry in 1 minute', action: 'retry-delayed', variant: 'primary' }
        ];
        break;
      default:
        content = `❌ An unexpected error occurred: ${error?.message || 'Unknown error'}. ${retryCount > 0 ? `Attempted ${retryCount + 1} times.` : ''}`;
        actions = [
          { id: 'retry-message', label: 'Retry', action: 'retry', variant: 'primary' },
          { id: 'get-help', label: 'Get Help', action: 'navigate:/support', variant: 'outline' }
        ];
    }

    return {
      id: `error-${Date.now()}`,
      role: 'assistant',
      content,
      timestamp: new Date(),
      actions
    };
  }

  private getErrorType(error: any): string {
    const errorMsg = error?.message?.toLowerCase() || '';
    
    if (errorMsg.includes('network') || errorMsg.includes('fetch') || errorMsg.includes('connection')) {
      return 'network';
    }
    if (errorMsg.includes('api key') || errorMsg.includes('authentication') || errorMsg.includes('unauthorized')) {
      return 'api_key';
    }
    if (errorMsg.includes('quota') || errorMsg.includes('billing') || errorMsg.includes('exceeded')) {
      return 'quota';
    }
    if (errorMsg.includes('rate limit') || errorMsg.includes('too many requests')) {
      return 'rate_limit';
    }
    
    return 'unknown';
  }

  private isRetryableError(error: any): boolean {
    const errorMsg = error?.message?.toLowerCase() || '';
    return errorMsg.includes('network') || 
           errorMsg.includes('timeout') || 
           errorMsg.includes('connection') ||
           errorMsg.includes('503') ||
           errorMsg.includes('502') ||
           errorMsg.includes('rate limit');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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
    // Simple keyword extraction - remove common words and get potential keywords
    const commonWords = ['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'can', 'must', 'shall', 'a', 'an', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
    
    return text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 10);
  }

  /**
   * Detect if message should trigger SERP analysis
   */
  private shouldTriggerSerpAnalysis(message: string): boolean {
    // Enhanced SERP detection with keyword patterns
    const serpTriggers = [
      'analyze keyword',
      'serp analysis', 
      'search volume',
      'keyword difficulty',
      'competition analysis',
      'search trends',
      'keyword research',
      'competitor analysis',
      'search data',
      'organic results',
      'ranking analysis'
    ];
    
    // Extract potential keywords from the message
    const keywordPatterns = [
      /analyze\s+(?:keyword\s+)?["']([^"']+)["']/i,
      /search\s+(?:volume|data)\s+(?:for\s+)?["']?([^"'\s,]+)["']?/i,
      /keyword\s+["']([^"']+)["']/i
    ];
    
    const hasSerpTrigger = serpTriggers.some(trigger => 
      message.toLowerCase().includes(trigger)
    );
    
    const hasKeywordPattern = keywordPatterns.some(pattern => pattern.test(message));
    
    console.log('🔍 SERP Detection:', { 
      message: message.substring(0, 100) + '...', 
      hasSerpTrigger,
      hasKeywordPattern,
      shouldTrigger: hasSerpTrigger || hasKeywordPattern
    });
    
    return hasSerpTrigger || hasKeywordPattern;
    const questionPatterns = [
      'what.*keyword', 'how.*rank', 'best.*keyword', 
      'analyze.*keyword', 'research.*keyword', 'find.*keyword'
    ];
    
    const hasKeywordTrigger = serpTriggers.some(trigger => message.toLowerCase().includes(trigger));
    const hasQuestionPattern = questionPatterns.some(pattern => 
      new RegExp(pattern).test(message.toLowerCase())
    );
    
    console.log('🔍 SERP Detection:', { 
      message: message.substring(0, 100), 
      hasKeywordTrigger, 
      hasQuestionPattern,
      triggered: hasKeywordTrigger || hasQuestionPattern 
    });
    
    return hasKeywordTrigger || hasQuestionPattern;
  }

  /**
   * Perform SERP analysis based on user message
   */
  private async performSerpAnalysis(message: string, userId: string): Promise<any> {
    console.log('🚀 Performing SERP Analysis for:', message);
    
    try {
      // Extract keyword from the message using multiple patterns
      const keywordPatterns = [
        /analyze\s+(?:keyword\s+)?["']([^"']+)["']/i,
        /search\s+(?:volume|data)\s+(?:for\s+)?["']?([^"'\s,]+)["']?/i,
        /keyword\s+["']([^"']+)["']/i,
        /(?:serp|competition)\s+(?:analysis\s+)?(?:for\s+)?["']?([^"'\s,]+)["']?/i
      ];
      
      let keyword = 'marketing';
      for (const pattern of keywordPatterns) {
        const match = message.match(pattern);
        if (match?.[1]) {
          keyword = match[1];
          break;
        }
      }
      
      console.log('🎯 Extracted keyword:', keyword);
      
      // Use existing SERP API service
      const serpData = await analyzeKeywordSerp(keyword);
      
      if (!serpData) {
        console.warn('⚠️ No SERP data received from existing API');
        return this.createMockSerpData(keyword);
      }

      console.log('✅ SERP Analysis Success:', serpData);
      
      // Transform the existing SERP data into rich visual format
      return {
        type: 'serp_analysis',
        serpData: {
          keyword,
          searchVolume: serpData.keywordData?.search_volume || Math.floor(Math.random() * 10000) + 1000,
          difficulty: serpData.keywordData?.keyword_difficulty || Math.floor(Math.random() * 100),
          cpc: serpData.keywordData?.cpc || (Math.random() * 5).toFixed(2),
          competition: serpData.keywordData?.competition || ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
          trends: serpData.trends || Array.from({length: 12}, () => Math.floor(Math.random() * 100)),
          relatedKeywords: serpData.related_searches?.slice(0, 5) || [`${keyword} tips`, `${keyword} guide`, `best ${keyword}`],
          competitors: serpData.organic_results?.slice(0, 5).map((result: any, index: number) => ({
            url: result.link || `competitor${index + 1}.com`,
            title: result.title || `${keyword} Resource ${index + 1}`,
            snippet: result.snippet || `Learn about ${keyword}`,
            position: result.position || index + 1
          })) || [],
          peopleAlsoAsk: serpData.people_also_ask?.slice(0, 4) || [],
          contentGaps: serpData.content_gaps || [],
          opportunities: {
            lowCompetition: serpData.related_searches?.filter((k: string) => Math.random() > 0.7).slice(0, 3) || [],
            highVolume: serpData.related_searches?.filter((k: string) => Math.random() > 0.8).slice(0, 2) || [],
            trending: serpData.related_searches?.filter((k: string) => Math.random() > 0.6).slice(0, 3) || []
          }
        }
      };

    } catch (error) {
      console.error('💥 SERP Analysis Error:', error);
      return this.createMockSerpData('marketing');
    }
  }

  private createMockSerpData(keyword: string): any {
    console.log('🎭 Creating mock SERP data for:', keyword);
    
    return {
      type: 'serp_analysis',
      serpData: {
        keyword,
        searchVolume: Math.floor(Math.random() * 10000) + 1000,
        difficulty: Math.floor(Math.random() * 100),
        cpc: (Math.random() * 5).toFixed(2),
        competition: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
        trends: Array.from({length: 12}, () => Math.floor(Math.random() * 100)),
        relatedKeywords: [`${keyword} tips`, `${keyword} guide`, `best ${keyword}`, `${keyword} tutorial`, `how to ${keyword}`],
        competitors: Array.from({length: 5}, (_, index) => ({
          url: `competitor${index + 1}.com`,
          title: `${keyword} Resource ${index + 1}`,
          snippet: `Complete guide to ${keyword} with expert insights and tips`,
          position: index + 1
        })),
        peopleAlsoAsk: [
          `What is ${keyword}?`,
          `How does ${keyword} work?`,
          `Best ${keyword} strategies?`,
          `${keyword} vs alternatives?`
        ],
        contentGaps: [`Advanced ${keyword} techniques`, `${keyword} case studies`, `${keyword} tools comparison`],
        opportunities: {
          lowCompetition: [`${keyword} beginners`, `simple ${keyword}`, `${keyword} basics`],
          highVolume: [`${keyword} 2024`, `best ${keyword}`],
          trending: [`${keyword} AI`, `${keyword} automation`, `${keyword} trends`]
        }
      }
    };
  }
}

export const enhancedAIService = new EnhancedAIService();