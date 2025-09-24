import { EnhancedChatMessage, VisualData, WorkflowStep } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
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
      
      // Enhance context with AI workflow intelligence
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
      
      const providers = ['openrouter', 'openai', 'anthropic', 'gemini', 'mistral'];
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

      const data = {
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        context: enhancedContext,
        userId,
        features: ['visual_data', 'solution_intelligence', 'context_awareness'],
        apiKeys
      };

      console.log('🔄 Calling enhanced-ai-chat with comprehensive context:', {
        messagesCount: data.messages.length,
        contextKeys: Object.keys(enhancedContext || {}),
        features: data.features
      });

      const { data: response, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: data
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

      const responseContent = response?.message || response?.content;
      if (!responseContent) {
        console.error('No content in enhanced AI response:', response);
        return this.createErrorMessage('No response content received');
      }

      console.log('✅ Enhanced AI Response received with context awareness');

      // Create enhanced message with all data
      const enhancedMessage: EnhancedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        visualData: response.visualData,
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
            userId,
            contextType: 'comprehensive' 
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
      actions: []
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
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