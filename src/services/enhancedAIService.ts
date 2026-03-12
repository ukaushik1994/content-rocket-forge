import { EnhancedChatMessage, VisualData, WorkflowStep } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import { AIChatIntegrator } from './aiChatIntegrator';
import AIServiceController from '@/services/aiService/AIServiceController';
import { AISolutionIntegrationService } from '@/services/aiSolutionIntegrationService';
import { analyzeKeywordSerp } from '@/services/serpApiService';
import { aiWorkflowIntelligence } from '@/services/aiWorkflowIntelligence';
import { getApiKey } from '@/services/apiKeys/crud';

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

      // Check for API key configuration before making any calls
      const apiKeyStatus = await this.checkApiKeyConfiguration();
      if (!apiKeyStatus.hasAnyKey) {
        return this.createApiKeyConfigurationMessage(apiKeyStatus);
      }

      console.log('🤖 Processing enhanced message with comprehensive context:', { message, userId, retryCount });

      // Fetch comprehensive user context using ai-context-manager
      const context = await this.fetchUserContextWithRetry(userId, 3);
      
      // STEP 1: Detect if this query would benefit from intelligent workflow execution
      const workflowDetection = await this.detectWorkflowOpportunity(message, context);
      
      if (workflowDetection.shouldUseWorkflow) {
        console.log('🔄 Workflow detected - executing intelligent workflow:', workflowDetection.workflowType);
        return await this.executeIntelligentWorkflow(workflowDetection, message, conversationHistory, userId, context);
      }
      
      // STEP 2: Continue with regular enhanced processing if no workflow needed
      const enhancedContext = await this.enhanceContextWithWorkflowIntelligence(context, userId, message);
      
      // Build enhanced system prompt with solution intelligence
      const systemPrompt = this.buildEnhancedSystemPrompt(enhancedContext, conversationHistory);

      // Debug context inclusion
      console.debug('🔎 AI Context Verification', {
        solutionsCount: enhancedContext?.solutions?.length || 0,
        hasCompanyInfo: !!enhancedContext?.companyInfo,
        hasAnalytics: !!enhancedContext?.analytics,
        hasWorkflowIntelligence: !!enhancedContext?.workflowIntelligence
      });

      // Retrieve API keys for the edge function
      console.log('🔑 Retrieving API keys for edge function...');
      const apiKeys: Record<string, string> = {};
      
      const providers = ['openrouter', 'openai', 'anthropic', 'gemini', 'mistral', 'lmstudio'];
      for (const provider of providers) {
        try {
          const key = await getApiKey(provider as any);
          if (key) {
            apiKeys[provider] = key;
            console.log(`✅ Retrieved ${provider} API key`);
          }
        } catch (error) {
          console.log(`❌ Failed to retrieve ${provider} API key:`, error);
        }
      }

      if (Object.keys(apiKeys).length === 0) {
        console.error('❌ No API keys retrieved, edge function will fail');
        return this.createErrorMessage('No API keys available. Please configure at least one AI provider in Settings.');
      }

      // Schema-compliant payload: only { messages, context }
      const payload = {
        messages: [
          ...conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        context: {
          analystActive: false,
        }
      };

      console.log('🔄 Calling enhanced-ai-chat with schema-compliant payload:', {
        messagesCount: payload.messages.length,
      });

      const { data: response, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: payload
      });

      if (error) {
        console.error('Enhanced AI Chat Error:', error);
        
        if (retryCount < 2) {
          console.log(`🔄 Retrying enhanced message processing (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.processEnhancedMessage(message, conversationHistory, userId, onStreamUpdate, retryCount + 1);
        }
        return this.createErrorMessage(`AI service error: ${error.message}. Please check your API key configuration in Settings.`);
      }

      const responseContent = response?.message || response?.content || response?.response;
      if (!responseContent) {
        console.error('No content in enhanced AI response:', response);
        
        // Check if we have an error message from the backend
        if (response?.error) {
          return this.createErrorMessage(response.message || response.error);
        }
        
        return this.createErrorMessage('No response content received. Please try again or contact support if this persists.');
      }

      console.log('✅ Enhanced AI Response received with context awareness');

      // Create enhanced message with validated visual data
      // Phase 1: Store ALL charts in allVisualData, display first in visualData
      const validatedData = this.validateVisualData(response.visualData);
      const enhancedMessage: EnhancedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        visualData: Array.isArray(validatedData) ? validatedData[0] : validatedData,
        allVisualData: Array.isArray(validatedData) ? validatedData : (validatedData ? [validatedData] : undefined), // Store all charts
        serpData: response.serpData,
        actions: response.actions || [],
        workflowContext: response.workflowContext,
        metadata: {
          reasoning: response.reasoning,
          confidence: response.confidence,
          sources: response.sources,
          actionResults: response.actionResults
        }
      };

      return enhancedMessage;

    } catch (error) {
      console.error('Error in processEnhancedMessage:', error);
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying enhanced message processing (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.processEnhancedMessage(message, conversationHistory, userId, onStreamUpdate, retryCount + 1);
      }
      return this.createErrorMessage(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key configuration in Settings.`);
    }
  }

  private async fetchUserContextWithRetry(userId: string, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📊 Fetching comprehensive user context (attempt ${attempt}/${maxRetries})`);
        
        // Call the ai-context-manager function for comprehensive context
        const { data: contextResponse, error } = await supabase.functions.invoke('ai-context-manager', {
          body: { 
            action: 'get_context_state',
            userId,
            data: { contextType: 'comprehensive' }
          }
        });
        
        if (error) {
          console.error(`Context manager error (attempt ${attempt}):`, error);
          throw error;
        }
        
        console.log('✅ Comprehensive context fetch successful:', {
          hasData: !!contextResponse,
          keys: contextResponse ? Object.keys(contextResponse) : [],
          solutionsCount: contextResponse?.solutions?.length || 0,
          contentCount: contextResponse?.content?.length || 0,
          strategiesCount: contextResponse?.strategies?.length || 0
        });
        
        return contextResponse || {};
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
    
    try {
      const { data: solutions } = await supabase
        .from('solutions')
        .select('name, description, features, painPoints, targetAudience')
        .eq('user_id', userId)
        .limit(5);

      return {
        solutions: solutions || [],
        analytics: {
          totalContent: 0,
          published: 0,
          avgSeoScore: 0
        }
      };
    } catch (error) {
      console.error('Fallback context failed:', error);
      return {};
    }
  }

  private buildEnhancedSystemPrompt(context: any, conversationHistory: any[]): string {
    const basePrompt = `You are an intelligent content marketing AI assistant with deep expertise in SEO, content strategy, and business solutions.

## Your Capabilities:
- Advanced content analysis and optimization
- Solution integration and positioning
- Visual data creation (charts, metrics, workflows)
- Strategic recommendations with actionable insights
- Fuzzy search and solution intelligence

## User's Business Context:
${this.formatContextForPrompt(context)}

## Solution Intelligence:
${this.formatSolutionIntelligence(context?.solutions)}

## Response Requirements:
1. **Always be contextually aware** - Reference specific solutions, content, and strategies from the user's data
2. **Use fuzzy matching** - If user mentions "GLConnect", "SQL Connect", etc., match to actual solution names like "GL Connect", "SQL Connect"
3. **Provide actionable insights** - Include specific metrics, recommendations, and next steps
4. **Be solution-focused** - Always consider how your recommendations tie to their business solutions

## Response Format:
Provide comprehensive, data-driven responses that reference specific information from the user's context. Always recognize solution names even with variations (GLConnect = GL Connect).`;

    return basePrompt;
  }

  private formatContextForPrompt(context: any): string {
    if (!context) return 'No specific context available.';
    
    let formatted = '';
    
    if (context.solutions?.length > 0) {
      formatted += `\n### Solutions Portfolio (${context.solutions.length}):\n`;
      context.solutions.forEach((solution: any, index: number) => {
        formatted += `${index + 1}. **${solution.name}**\n`;
        formatted += `   - Description: ${solution.description}\n`;
        if (solution.features?.length > 0) {
          formatted += `   - Key Features: ${solution.features.slice(0, 3).join(', ')}\n`;
        }
        formatted += '\n';
      });
    }
    
    if (context.analytics) {
      formatted += `\n### Content Analytics:\n`;
      formatted += `- Total Content: ${context.analytics.totalContent}\n`;
      formatted += `- Published: ${context.analytics.published}\n`;
      formatted += `- Avg SEO Score: ${context.analytics.avgSeoScore?.toFixed(1)}/100\n`;
    }
    
    return formatted || 'Limited context available.';
  }

  private formatSolutionIntelligence(solutions: any[]): string {
    if (!solutions?.length) return 'No solutions available.';
    
    let intelligence = '\n### Solution Name Mapping (for fuzzy matching):\n';
    solutions.forEach((solution: any) => {
      const variations = this.generateSolutionVariations(solution.name);
      intelligence += `- "${solution.name}" (variations: ${variations.join(', ')})\n`;
    });
    
    return intelligence;
  }

  private generateSolutionVariations(name: string): string[] {
    const variations = [name];
    
    variations.push(name.replace(/\s+/g, ''));
    
    if (name.includes(' Connect')) {
      variations.push(name.replace(' Connect', 'Connect'));
    }
    
    variations.push(name.toLowerCase());
    variations.push(name.toLowerCase().replace(/\s+/g, ''));
    
    return [...new Set(variations)];
  }

  private async enhanceContextWithWorkflowIntelligence(context: any, userId: string, message: string): Promise<any> {
    try {
      const workflowPatterns = await aiWorkflowIntelligence.analyzeWorkflowPatterns(userId);
      const workflowSuggestions = await aiWorkflowIntelligence.generateWorkflowSuggestions(userId, context);
      
      return {
        ...context,
        workflowIntelligence: {
          patterns: workflowPatterns,
          suggestions: workflowSuggestions,
          automationTriggers: await this.getActiveAutomationTriggers(userId)
        }
      };
    } catch (error) {
      console.error('Error enhancing context with workflow intelligence:', error);
      return context;
    }
  }

  private async getActiveAutomationTriggers(userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('ai_workflow_states')
        .select('workflow_data')
        .eq('user_id', userId)
        .eq('workflow_type', 'trigger_management')
        .eq('current_step', 'active')
        .single();

      return (data?.workflow_data as any)?.triggers || [];
    } catch (error) {
      console.error('Error fetching automation triggers:', error);
      return [];
    }
  }

  private async checkApiKeyConfiguration(): Promise<{
    hasAnyKey: boolean;
    availableProviders: string[];
    missingProviders: string[];
  }> {
    try {
      const { getAllApiKeysStatusSimple } = await import('@/services/apiKeys/crud');
      const apiKeysStatus = await getAllApiKeysStatusSimple();
      
      const availableProviders = Object.entries(apiKeysStatus)
        .filter(([, hasKey]) => hasKey)
        .map(([provider]) => provider);
        
      const missingProviders = Object.entries(apiKeysStatus)
        .filter(([, hasKey]) => !hasKey)
        .map(([provider]) => provider);
      
      const hasAnyKey = availableProviders.length > 0;
      
      return {
        hasAnyKey,
        availableProviders,
        missingProviders
      };
    } catch (error) {
      console.error('Error checking API key configuration:', error);
      return {
        hasAnyKey: false,
        availableProviders: [],
        missingProviders: ['openrouter', 'openai', 'anthropic', 'gemini']
      };
    }
  }

  private createApiKeyConfigurationMessage(status: any): EnhancedChatMessage {
    const content = `To start using AI chat, you need to configure at least one AI provider API key.

**Available Providers:**
- **OpenRouter** (Recommended): Access to multiple AI models with one key
- **OpenAI**: GPT models (GPT-4, GPT-3.5-turbo)
- **Anthropic**: Claude models
- **Google**: Gemini models

**How to configure:**
1. Go to Settings → AI Service Hub → Provider Management
2. Add your API key for any supported provider
3. Test the connection to ensure it's working

Once configured, you'll be able to chat with AI assistants, analyze content, perform keyword research, and much more!`;

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      actions: [
        {
          id: 'open-settings-api',
          label: 'Configure API Keys',
          action: 'open-settings:api',
          type: 'button',
          variant: 'primary'
        }
      ]
    };
  }

  private createErrorMessage(errorMessage: string): EnhancedChatMessage {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I encountered an error: ${errorMessage}. Please try again or contact support if this persists.`,
      timestamp: new Date(),
      messageStatus: 'error',
      actions: []
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private validateVisualData(visualData?: VisualData | VisualData[]): VisualData | VisualData[] | undefined {
    if (!visualData) return undefined;
    
    // Phase 2: Chart diversity ENFORCEMENT (not just warning)
    if (Array.isArray(visualData)) {
      const chartTypes = visualData
        .map(vd => vd.chartConfig?.type)
        .filter(type => type !== undefined);
      
      const uniqueTypes = new Set(chartTypes);
      
      if (uniqueTypes.size < chartTypes.length) {
        console.error('❌ CRITICAL: Duplicate chart types detected:', {
          total: chartTypes.length,
          unique: uniqueTypes.size,
          types: chartTypes,
          duplicates: chartTypes.filter((type, index) => chartTypes.indexOf(type) !== index)
        });
        
        // ENFORCE: Remove duplicate charts, keep only first of each type
        const seenTypes = new Set();
        const deduplicatedData = visualData.filter(vd => {
          const chartType = vd.chartConfig?.type;
          if (!chartType || seenTypes.has(chartType)) {
            console.warn(`⚠️ Removing duplicate ${chartType} chart`);
            return false;
          }
          seenTypes.add(chartType);
          return true;
        });
        
        console.log('✅ Deduplication complete:', {
          before: chartTypes.length,
          after: deduplicatedData.length,
          types: Array.from(seenTypes)
        });
        
        // Continue with deduplicated data
        visualData = deduplicatedData;
      }
    }
    
    const validateSingleVisualData = (vd: VisualData, index: number = 0): VisualData => ({
      ...vd,
      title: vd.title || vd.chartConfig?.title || `Visualization ${index + 1}`,
      chartConfig: vd.chartConfig ? {
        ...vd.chartConfig,
        title: vd.chartConfig.title || vd.title || `Chart ${index + 1}`,
        dataContext: vd.chartConfig.dataContext || 'Data visualization'
      } : undefined,
      actionableItems: vd.actionableItems && vd.actionableItems.length > 0 
        ? this.enrichActionableItems(vd.actionableItems)
        : [
        {
          id: 'explore-more',
          title: 'Explore this data further',
          description: 'Get deeper insights and analysis',
          priority: 'medium'
        }
      ],
      deepDivePrompts: vd.deepDivePrompts && vd.deepDivePrompts.length > 0 ? vd.deepDivePrompts : [
        'Show me more details about this data',
        'How does this compare to previous periods?',
        'What are the key insights here?'
      ]
    });

    if (Array.isArray(visualData)) {
      return visualData.map((vd, index) => validateSingleVisualData(vd, index));
    }
    
    return validateSingleVisualData(visualData);
  }

  // Phase 3: Enrich actionable items with defaults for missing metadata
  private enrichActionableItems(items: any[]): any[] {
    if (!items || items.length === 0) return [];
    
    return items.map(item => ({
      ...item,
      // Add defaults for missing fields
      estimatedImpact: item.estimatedImpact || 'Potential improvement',
      timeRequired: item.timeRequired || '30 minutes',
      actionType: item.actionType || 'info',
      icon: item.icon || this.getDefaultIcon(item.actionType, item.priority),
      prerequisites: item.prerequisites || []
    }));
  }

  private getDefaultIcon(actionType?: string, priority?: string): string {
    if (actionType === 'navigate') return 'ArrowRight';
    if (actionType === 'external') return 'ExternalLink';
    if (actionType === 'workflow') return 'Zap';
    if (priority === 'high') return 'TrendingUp';
    return 'Info';
  }

  // NEW: Automatic Workflow Detection with Priority-based Pattern Matching
  // IMPORTANT: Order matters! More specific patterns are checked FIRST to avoid mis-routing
  private async detectWorkflowOpportunity(message: string, context: any): Promise<{
    shouldUseWorkflow: boolean;
    workflowType?: string;
    confidence: number;
    reasoning?: string;
  }> {
    const lowerMessage = message.toLowerCase();
    
    // PRIORITY 1: Performance Analysis (check FIRST - avoids "content" triggering content-strategy)
    // Exclusion logic: if "performance" or "analytics" is present, don't match content-strategy
    if (this.matchesPattern(lowerMessage, [
      'performance analysis', 'analyze performance', 'performance of my content',
      'content performance', 'show me analytics', 'analytics report', 'analytics dashboard',
      'how is my content performing', 'performance metrics', 'solution performance',
      'how are my solutions performing', 'interactive charts', 'performance with charts'
    ])) {
      return {
        shouldUseWorkflow: true,
        workflowType: 'solution-performance-analyzer',
        confidence: 0.92,
        reasoning: 'User wants comprehensive performance analysis with metrics and charts'
      };
    }
    
    // PRIORITY 2: Solution Integration Analysis (NEW workflow type)
    if (this.matchesPattern(lowerMessage, [
      'solution integration', 'integrate solution', 'solution visibility',
      'content integrates', 'integration analysis', 'solution coverage',
      'how well my current content integrates', 'solution alignment'
    ])) {
      return {
        shouldUseWorkflow: true,
        workflowType: 'solution-integration-analyzer',
        confidence: 0.88,
        reasoning: 'User wants to analyze how content integrates with business solutions'
      };
    }
    
    // PRIORITY 3: Content Creation Assistant (NEW workflow type)
    if (this.matchesPattern(lowerMessage, [
      'create content', 'write content', 'generate content', 'help me create',
      'create a high-performing', 'content creation', 'write a blog', 'write an article',
      'create blog post', 'generate blog'
    ])) {
      return {
        shouldUseWorkflow: true,
        workflowType: 'content-creation-assistant',
        confidence: 0.87,
        reasoning: 'User wants assistance creating specific content pieces'
      };
    }
    
    // PRIORITY 4: Content Strategy (general planning - only if not caught by performance/creation)
    // Skip if message contains performance-related terms
    const hasPerformanceTerms = this.matchesPattern(lowerMessage, ['performance', 'analytics', 'performing', 'metrics']);
    if (!hasPerformanceTerms && this.matchesPattern(lowerMessage, [
      'content strategy', 'content plan', 'editorial calendar', 'content creation plan',
      'what content should', 'content ideas', 'content planning', 'strategy for content'
    ])) {
      return {
        shouldUseWorkflow: true,
        workflowType: 'content-strategy-generator',
        confidence: 0.9,
        reasoning: 'User is asking for comprehensive content strategy planning'
      };
    }
    
    // PRIORITY 5: SEO & Keyword Research
    if (this.matchesPattern(lowerMessage, [
      'keyword research', 'seo analysis', 'keyword opportunities', 'search optimization',
      'ranking', 'keywords for', 'seo strategy', 'optimize for search'
    ])) {
      return {
        shouldUseWorkflow: true,
        workflowType: 'seo-keyword-researcher',
        confidence: 0.88,
        reasoning: 'User needs comprehensive SEO and keyword analysis'
      };
    }
    
    return {
      shouldUseWorkflow: false,
      confidence: 0
    };
  }

  private matchesPattern(message: string, patterns: string[]): boolean {
    return patterns.some(pattern => message.includes(pattern));
  }

  // NEW: Execute Intelligent Workflow with Progress Tracking
  private async executeIntelligentWorkflow(
    detection: any,
    message: string,
    conversationHistory: EnhancedChatMessage[],
    userId: string,
    context: any
  ): Promise<EnhancedChatMessage> {
    // Create initial progress message
    const progressMessage = this.createProgressMessage(detection.workflowType, 'Starting intelligent workflow analysis...');
    
    try {
      // Call the intelligent workflow executor (now returns JSON directly, no streaming for simplicity)
      const { data: workflowResult, error } = await supabase.functions.invoke('intelligent-workflow-executor', {
        body: {
          workflowType: detection.workflowType,
          userQuery: message,
          userId,
          context,
          conversationHistory
        }
      });

      if (error) {
        console.error('Workflow execution error:', error);
        return this.createErrorMessage(`Workflow execution failed: ${error.message}`);
      }

      // Transform workflow result into enhanced chat message
      return this.transformWorkflowResult(workflowResult, detection);

    } catch (error) {
      console.error('Error in executeIntelligentWorkflow:', error);
      return this.createErrorMessage(`Workflow error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private transformWorkflowResult(workflowResult: any, detection: any): EnhancedChatMessage {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: workflowResult.summary || 'Analysis completed successfully.',
      timestamp: new Date(),
      visualData: workflowResult.visualData || workflowResult.chartConfig ? {
        type: workflowResult.visualData?.type || 'chart',
        chartConfig: workflowResult.chartConfig,
        metrics: workflowResult.visualData?.metrics || workflowResult.metrics,
        summary: workflowResult.visualData?.summary,
        workflowStep: workflowResult.workflowStep
      } : undefined,
      actions: workflowResult.actions || [
        { label: 'View Details', action: 'view-details', type: 'button' },
        { label: 'Create Follow-up', action: 'create-followup', type: 'button' }
      ],
      progressIndicator: {
        currentStep: 100,
        totalSteps: 100,
        stepName: 'Analysis Complete',
        completedSteps: ['analysis', 'processing', 'results']
      },
      workflowContext: {
        currentWorkflow: detection.workflowType,
        stepData: {
          confidence: workflowResult.confidence || detection.confidence,
          reasoning: workflowResult.reasoning || detection.reasoning
        }
      },
      metadata: {
        reasoning: workflowResult.reasoning,
        confidence: workflowResult.confidence,
        sources: workflowResult.sources,
        actionResults: workflowResult
      }
    };
  }

  private createProgressMessage(workflowType: string, status: string): EnhancedChatMessage {
    const workflowNames = {
      'content-strategy-generator': 'Content Strategy Generator',
      'solution-performance-analyzer': 'Solution Performance Analyzer', 
      'seo-keyword-researcher': 'SEO & Keyword Research'
    };

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `🔄 **${workflowNames[workflowType as keyof typeof workflowNames] || workflowType}**\n\n${status}`,
      timestamp: new Date(),
      progressIndicator: {
        currentStep: 1,
        totalSteps: 4,
        stepName: 'Initializing workflow...',
        completedSteps: ['workflow-detected']
      }
    };
  }

  private formatWorkflowResultAsMessage(workflowResult: any, workflowType: string): EnhancedChatMessage {
    const workflowNames = {
      'content-strategy-generator': 'Content Strategy Analysis',
      'solution-performance-analyzer': 'Performance Analysis Results', 
      'seo-keyword-researcher': 'SEO & Keyword Analysis'
    };

    // Format the response content
    let content = `✅ **${workflowNames[workflowType as keyof typeof workflowNames] || workflowType} Complete**\n\n`;
    content += workflowResult.summary || 'Analysis completed successfully.';

    // Create visual data from workflow results
    const visualData = this.createVisualDataFromWorkflow(workflowResult, workflowType);
    
    // Create contextual actions
    const actions = this.createWorkflowActions(workflowResult, workflowType);

    return {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      timestamp: new Date(),
      visualData,
      actions,
      workflowContext: {
        currentWorkflow: workflowType,
        stepData: workflowResult
      },
      metadata: {
        reasoning: workflowResult.reasoning,
        confidence: workflowResult.confidence || 0.9,
        sources: workflowResult.sources || []
      }
    };
  }

  private createVisualDataFromWorkflow(result: any, workflowType: string): any {
    if (!result.metrics && !result.charts && !result.data) {
      return undefined;
    }

    // Content Strategy Visualization
    if (workflowType === 'content-strategy-generator') {
      return {
        type: 'workflow',
        workflowStep: {
          id: 'strategy-results',
          title: 'Content Strategy Recommendations',
          description: 'AI-generated content strategy based on your solutions and market analysis',
          actions: result.recommendations?.map((rec: any, index: number) => ({
            id: `rec-${index}`,
            label: rec.title || `Recommendation ${index + 1}`,
            action: `send:Tell me more about: ${rec.title}`,
            type: 'button'
          })) || []
        }
      };
    }

    // Performance Analysis Visualization  
    if (workflowType === 'solution-performance-analyzer') {
      return {
        type: 'metrics',
        metrics: result.metrics || [
          {
            id: 'performance-score',
            title: 'Overall Performance',
            value: result.overallScore || 'N/A',
            color: 'blue'
          }
        ]
      };
    }

    // SEO Analysis Visualization
    if (workflowType === 'seo-keyword-researcher') {
      return {
        type: 'chart',
        chartConfig: {
          type: 'bar',
          data: result.keywordData || [],
          categories: ['Keyword Difficulty', 'Search Volume', 'Opportunity Score'],
          height: 300
        }
      };
    }

    return undefined;
  }

  private createWorkflowActions(result: any, workflowType: string): any[] {
    const baseActions = [
      {
        id: 'export-results',
        label: 'Export Results',
        action: `send:Export the ${workflowType} analysis results to a document`,
        type: 'button',
        variant: 'outline'
      }
    ];

    if (workflowType === 'content-strategy-generator') {
      baseActions.push({
        id: 'create-content',
        label: 'Start Creating Content',
        action: 'navigate:/ai-chat',
        type: 'button',
        variant: 'primary'
      });
    }

    if (workflowType === 'solution-performance-analyzer') {
      baseActions.push({
        id: 'optimize-solutions',
        label: 'Optimize Solutions',
        action: 'send:Show me specific optimization recommendations for my underperforming solutions',
        type: 'button',
        variant: 'primary'
      });
    }

    return baseActions;
  }

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