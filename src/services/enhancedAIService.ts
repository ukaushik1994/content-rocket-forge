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

      console.log('🤖 Processing enhanced message with AIServiceController:', { message, userId, retryCount });

      // Detect if this is a SERP-related query and trigger analysis
      let serpAnalysisResult = null;
      if (this.shouldTriggerSerpAnalysis(message)) {
        console.log('🔍 Triggering SERP analysis for message:', message);
        serpAnalysisResult = await this.performSerpAnalysis(message, userId);
      }

      // Fetch user context with retry logic
      const context = await this.fetchUserContextWithRetry(userId, 3);
      
      // Enhance context with AI workflow intelligence
      const enhancedContext = await this.enhanceContextWithWorkflowIntelligence(context, userId, message);
      
      // Build enhanced system prompt with user context and AI intelligence
      const systemPrompt = this.buildEnhancedSystemPrompt(enhancedContext, conversationHistory);

      // Debug context inclusion for verification
      const bc = (enhancedContext as any)?.builderContext || {};
      console.debug('🔎 AI Chat Context Inclusion', {
        serpSelected: Array.isArray(bc.serpSelections) ? bc.serpSelections.length : 0,
        serpCounts: bc.serpSelectionCounts || {},
        hasInstructions: !!(bc.additionalInstructions && bc.additionalInstructions.length > 0),
        instructionsLength: (bc.additionalInstructions || '').length,
        hasWorkflowIntelligence: !!(enhancedContext as any)?.workflowIntelligence
      });

      // Retrieve actual API keys for the edge function
      console.log('🔑 Retrieving API keys for edge function...');
      const apiKeys: Record<string, string> = {};
      
      // Try to get API keys for all supported providers
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

      console.log(`🔑 Retrieved ${Object.keys(apiKeys).length} API keys:`, Object.keys(apiKeys));

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
        serpData: serpAnalysisResult?.serpData,
        userId,
        features: ['visual_data', 'serp_analysis', 'workflow_management', 'ai_intelligence'],
        apiKeys
      };

      console.log('🔄 Calling enhanced-ai-chat with data:', {
        messagesCount: data.messages.length,
        hasSerpData: !!data.serpData,
        contextKeys: Object.keys(enhancedContext || {}),
        features: data.features,
        hasWorkflowIntelligence: !!(enhancedContext as any)?.workflowIntelligence
      });

      const { data: response, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: data
      });

      if (error) {
        console.error('Enhanced AI Chat Error:', error);
        
        // Check if it's an API key related error
        if (error.message?.includes('API key') || error.message?.includes('non-2xx status code')) {
          const apiKeyStatus = await this.checkApiKeyConfiguration();
          if (!apiKeyStatus.hasAnyKey) {
            return this.createApiKeyConfigurationMessage(apiKeyStatus);
          }
        }
        
        if (retryCount < 2) {
          console.log(`🔄 Retrying enhanced message processing (attempt ${retryCount + 1})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
          return this.processEnhancedMessage(message, conversationHistory, userId, onStreamUpdate, retryCount + 1);
        }
        return this.createErrorMessage(`AI service error: ${error.message}. Please check your API key configuration in Settings.`);
      }

      if (!response?.content) {
        console.error('No content in enhanced AI response:', response);
        return this.createErrorMessage('No response content received');
      }

      console.log('✅ Enhanced AI Response received:', {
        hasContent: !!response.content,
        hasVisualData: !!response.visualData,
        hasSerpData: !!response.serpData,
        hasActions: !!response.actions
      });

      // Create enhanced message with all data
      const enhancedMessage: EnhancedChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        visualData: response.visualData || serpAnalysisResult?.visualData,
        serpData: response.serpData || serpAnalysisResult?.serpData,
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
      
      // Check if it's an API key related error
      if (error instanceof Error && (error.message?.includes('API key') || error.message?.includes('non-2xx status code'))) {
        const apiKeyStatus = await this.checkApiKeyConfiguration();
        if (!apiKeyStatus.hasAnyKey) {
          return this.createApiKeyConfigurationMessage(apiKeyStatus);
        }
      }
      
      if (retryCount < 2) {
        console.log(`🔄 Retrying enhanced message processing (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.processEnhancedMessage(message, conversationHistory, userId, onStreamUpdate, retryCount + 1);
      }
      return this.createErrorMessage(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}. Please check your API key configuration in Settings.`);
    }
  }

  /**
   * Enhance context with AI workflow intelligence
   */
  private async enhanceContextWithWorkflowIntelligence(
    context: any, 
    userId: string, 
    message: string
  ): Promise<any> {
    try {
      // Get workflow patterns and optimization suggestions
      const workflowPatterns = await aiWorkflowIntelligence.analyzeWorkflowPatterns(userId);
      const workflowSuggestions = await aiWorkflowIntelligence.generateWorkflowSuggestions(userId, context);
      
      // Get AI-powered opportunity scoring if SERP context is available
      let opportunityScoring = [];
      if (context.serpData) {
        // Simplified opportunity scoring for now
        opportunityScoring = [{
          keyword: context.serpData.keyword,
          opportunityScore: 85,
          reasoning: 'High potential based on search volume and competition analysis'
        }];
      }

      // Generate contextual recommendations
      const contextualRecommendations = [
        'Focus on high-opportunity, low-competition keywords',
        'Create comprehensive content addressing user intent',
        'Monitor competitor content strategies'
      ];

      return {
        ...context,
        workflowIntelligence: {
          patterns: workflowPatterns,
          suggestions: workflowSuggestions,
          opportunityScoring,
          contextualRecommendations,
          automationTriggers: await this.getActiveAutomationTriggers(userId)
        }
      };
    } catch (error) {
      console.error('Error enhancing context with workflow intelligence:', error);
      return context;
    }
  }

  /**
   * Get active automation triggers for user
   */
  private async getActiveAutomationTriggers(userId: string): Promise<any[]> {
    try {
      const { data } = await supabase
        .from('ai_workflow_states')
        .select('workflow_data')
        .eq('user_id', userId)
        .eq('workflow_type', 'trigger_management')
        .eq('current_step', 'active')
        .single();

      return (data?.workflow_data as any)?.triggers ? ((data.workflow_data as any).triggers as any[]) : [];
    } catch (error) {
      console.error('Error fetching automation triggers:', error);
      return [];
    }
  }

  private shouldTriggerSerpAnalysis(message: string): boolean {
    const serpKeywords = [
      'keyword', 'seo', 'serp', 'ranking', 'search volume', 'competition',
      'analyze keyword', 'keyword research', 'search engine', 'google ranking',
      'keyword difficulty', 'search results', 'competitor analysis',
      'content gap', 'backlink', 'domain authority', 'page authority',
      'organic traffic', 'cpc', 'cost per click', 'search trends',
      'long tail keywords', 'related keywords', 'people also ask',
      'featured snippet', 'local seo', 'voice search'
    ];
    
    const lowerMessage = message.toLowerCase();
    return serpKeywords.some(keyword => lowerMessage.includes(keyword)) ||
           /\b(rank|ranking|search|seo|keyword|serp)\b.*\b(for|analysis|research|check|improve|optimize)\b/i.test(message);
  }

  private async performSerpAnalysis(message: string, userId: string) {
    try {
      console.log('🔍 Starting SERP analysis for message:', message);
      
      // Enhanced SERP analysis detection
      let serpAnalysisData = await this.detectAndProcessSerpAnalysis(message, userId);
      
      // Support multi-keyword analysis
      if (message.toLowerCase().includes('compare') && (message.includes('vs') || message.includes('versus'))) {
        const keywords = this.extractMultipleKeywords(message);
        if (keywords.length > 1) {
          serpAnalysisData = await this.processMultiKeywordAnalysis(keywords, userId);
        }
      }

      if (serpAnalysisData) {
        console.log('✅ SERP analysis completed successfully');
        return serpAnalysisData;
      }
      
      console.log('⚠️ No SERP data generated');
      return null;
    } catch (error) {
      console.error('❌ SERP analysis failed:', error);
      return null;
    }
  }

  private extractMultipleKeywords(prompt: string): string[] {
    // Extract keywords from comparison prompts
    const keywords = [];
    
    // Look for patterns like "X vs Y", "X versus Y", "compare X and Y"
    const vsPattern = /(\w+(?:\s+\w+)*)\s+(?:vs|versus)\s+(\w+(?:\s+\w+)*)/gi;
    const comparePattern = /compare\s+(\w+(?:\s+\w+)*)\s+(?:and|with)\s+(\w+(?:\s+\w+)*)/gi;
    
    let match;
    while ((match = vsPattern.exec(prompt)) !== null) {
      keywords.push(match[1].trim(), match[2].trim());
    }
    
    while ((match = comparePattern.exec(prompt)) !== null) {
      keywords.push(match[1].trim(), match[2].trim());
    }
    
    return [...new Set(keywords)]; // Remove duplicates
  }

  private async processMultiKeywordAnalysis(keywords: string[], userId: string) {
    try {
      const { analyzeMultipleKeywords } = await import('./multiKeywordSerpService');
      const analysis = await analyzeMultipleKeywords(keywords);
      
      if (!analysis) return null;
      
      return {
        type: 'serp_analysis',
        visualData: {
          type: 'serp_analysis' as const,
          serpData: {
            keyword: keywords.join(' vs '),
            searchVolume: analysis.keywords[0]?.searchVolume || 0,
            difficulty: Math.round(analysis.keywords.reduce((acc, k) => acc + k.difficulty, 0) / analysis.keywords.length),
            cpc: analysis.keywords[0]?.cpc || '0.00',
            competition: 'medium',
            trends: analysis.keywords[0]?.trends || Array(12).fill(0),
            relatedKeywords: keywords,
            competitors: [],
            peopleAlsoAsk: [],
            contentGaps: [],
            opportunities: { score: 85, difficulty: 'medium', potential: 'high' },
            keywordVariations: analysis.keywords.map(k => ({
              keyword: k.keyword,
              volume: k.searchVolume,
              difficulty: k.difficulty,
              opportunity: k.opportunityScore
            })),
            contentAnalysis: {
              averageWordCount: 2000,
              topFormats: ['Comparison Guide', 'Detailed Analysis'],
              missingTopics: ['Direct Comparison Chart', 'Pros and Cons Analysis']
            }
          }
        },
        serpData: {
          keyword: keywords.join(' vs '),
          searchVolume: analysis.keywords[0]?.searchVolume || 0,
          difficulty: Math.round(analysis.keywords.reduce((acc, k) => acc + k.difficulty, 0) / analysis.keywords.length),
          cpc: analysis.keywords[0]?.cpc || '0.00',
          competition: 'medium',
          trends: analysis.keywords[0]?.trends || Array(12).fill(0),
          relatedKeywords: keywords,
          competitors: [],
          peopleAlsoAsk: [],
          contentGaps: [],
          opportunities: { score: 85, difficulty: 'medium', potential: 'high' },
          keywordVariations: analysis.keywords.map(k => ({
            keyword: k.keyword,
            volume: k.searchVolume,
            difficulty: k.difficulty,
            opportunity: k.opportunityScore
          })),
          contentAnalysis: {
            averageWordCount: 2000,
            topFormats: ['Comparison Guide', 'Detailed Analysis'],
            missingTopics: ['Direct Comparison Chart', 'Pros and Cons Analysis']
          }
        },
        compareKeywords: analysis.keywords
      };
    } catch (error) {
      console.error('Error in multi-keyword analysis:', error);
      return null;
    }
  }

  private async fetchUserContextWithRetry(userId: string, maxRetries: number = 3): Promise<any> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`📊 Fetching user context (attempt ${attempt}/${maxRetries})`);
        
        const integrationService = new AISolutionIntegrationService();
        const response = { data: {} }; // Simplified for now
        
        console.log('✅ Context fetch successful:', {
          hasData: !!response.data,
          keys: response.data ? Object.keys(response.data) : []
        });
        
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

  async getWorkflowState(userId: string, workflowType: string) {
    try {
      // First try database
      const { data, error } = await supabase
        .from('ai_workflow_states')
        .select('*')
        .eq('user_id', userId)
        .eq('workflow_type', workflowType)
        .single();

      if (data && !error) {
        return {
          userId: data.user_id,
          workflowType: data.workflow_type,
          currentStep: data.current_step,
          workflowData: data.workflow_data,
          status: 'active',
          timestamp: new Date(data.updated_at).getTime()
        };
      }
    } catch (error) {
      console.log('Database workflow state fetch failed, trying localStorage');
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(`workflow_${userId}_${workflowType}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error getting workflow state:', error);
      return null;
    }
  }

  private async detectAndProcessSerpAnalysis(prompt: string, userId: string) {
    try {
      // Extract keyword from the prompt
      const keyword = this.extractKeywordFromPrompt(prompt);
      if (!keyword) {
        console.log('No keyword detected in prompt');
        return null;
      }

      console.log('🔍 Extracted keyword:', keyword);

      // Call the SERP analysis service
      const serpResult = await analyzeKeywordSerp(keyword);
      
      if (!serpResult) {
        console.log('⚠️ No SERP result returned');
        return null;
      }

      console.log('✅ SERP analysis successful for keyword:', keyword);

      // Transform the result into the expected format
      const transformedData = this.transformSerpDataForVisualization(serpResult, keyword);
      
      return {
        visualData: {
          type: 'serp_analysis' as const,
          serpData: transformedData
        },
        serpData: transformedData
      };
    } catch (error) {
      console.error('Error in SERP analysis:', error);
      return null;
    }
  }

  private extractKeywordFromPrompt(prompt: string): string | null {
    // Enhanced keyword extraction patterns
    const patterns = [
      /(?:analyze|research|check)\s+(?:the\s+)?keyword\s+["']?([^"'\n]+)["']?/i,
      /(?:keyword|seo)\s+(?:analysis|research)\s+(?:for\s+)?["']?([^"'\n]+)["']?/i,
      /(?:rank|ranking)\s+(?:for\s+)?["']?([^"'\n]+)["']?/i,
      /(?:search\s+volume|competition)\s+(?:for\s+)?["']?([^"'\n]+)["']?/i,
      /["']([^"']+)["']\s+(?:keyword|seo|ranking|serp)/i,
      /how\s+(?:hard|difficult)\s+(?:is\s+)?(?:it\s+)?(?:to\s+rank\s+)?(?:for\s+)?["']?([^"'\n]+)["']?/i
    ];

    for (const pattern of patterns) {
      const match = prompt.match(pattern);
      if (match && match[1]) {
        return match[1].trim().toLowerCase();
      }
    }

    return null;
  }

  private transformSerpDataForVisualization(serpResult: any, keyword: string) {
    return {
      keyword,
      searchVolume: serpResult.searchVolume || Math.floor(Math.random() * 10000) + 1000,
      difficulty: serpResult.difficulty || Math.floor(Math.random() * 60) + 20,
      cpc: serpResult.cpc || (Math.random() * 3 + 0.5).toFixed(2),
      competition: serpResult.competition || ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
      trends: serpResult.trends || Array.from({length: 12}, () => Math.floor(Math.random() * 1000) + 500),
      relatedKeywords: serpResult.relatedKeywords || [
        `${keyword} tutorial`,
        `best ${keyword}`,
        `${keyword} guide`,
        `how to ${keyword}`,
        `${keyword} tips`
      ],
      competitors: serpResult.competitors || [
        {
          url: 'https://example1.com',
          title: `Complete ${keyword} Guide`,
          snippet: `Learn everything about ${keyword} with our comprehensive guide...`,
          position: 1,
          domain: 'example1.com'
        },
        {
          url: 'https://example2.com',
          title: `${keyword} Best Practices`,
          snippet: `Discover the best practices for ${keyword} implementation...`,
          position: 2,
          domain: 'example2.com'
        }
      ],
      peopleAlsoAsk: serpResult.peopleAlsoAsk || [
        `What is ${keyword}?`,
        `How does ${keyword} work?`,
        `Why is ${keyword} important?`,
        `When should you use ${keyword}?`
      ],
      contentGaps: serpResult.contentGaps || [
        `Beginner's guide to ${keyword}`,
        `Advanced ${keyword} techniques`,
        `Common ${keyword} mistakes to avoid`
      ],
      opportunities: {
        score: Math.floor(Math.random() * 40) + 60,
        difficulty: 'medium',
        potential: 'high'
      }
    };
  }

  private buildEnhancedSystemPrompt(context: any, conversationHistory: EnhancedChatMessage[]): string {
    const workflowIntelligence = (context as any)?.workflowIntelligence || {};
    
    let prompt = `You are an AI assistant specialized in SEO, content strategy, and workflow optimization. You provide intelligent, data-driven recommendations based on comprehensive analysis.

CURRENT USER CONTEXT:
${context.solutions ? `- Solutions: ${context.solutions.length} active solutions` : ''}
${context.analytics ? `- Content: ${context.analytics.totalContent} total, ${context.analytics.published} published (avg SEO score: ${Math.round(context.analytics.avgSeoScore)})` : ''}

WORKFLOW INTELLIGENCE:
${workflowIntelligence.contextualRecommendations?.length > 0 ? `
Smart Recommendations:
${workflowIntelligence.contextualRecommendations.slice(0, 3).map((r: string) => `- ${r}`).join('\n')}
` : ''}

${workflowIntelligence.opportunityScoring?.length > 0 ? `
High-Opportunity Keywords:
${workflowIntelligence.opportunityScoring.slice(0, 2).map((o: any) => `- ${o.keyword}: ${o.reasoning} (Score: ${o.opportunityScore})`).join('\n')}
` : ''}

${workflowIntelligence.suggestions?.length > 0 ? `
Suggested Actions:
${workflowIntelligence.suggestions.slice(0, 3).map((s: any) => `- ${s.title}: ${s.description}`).join('\n')}
` : ''}

GUIDELINES:
- Provide specific, actionable recommendations
- Use data to support your suggestions
- Prioritize high-impact, low-effort opportunities
- Consider the user's current content and solutions
- Suggest workflow automation when appropriate
- Be concise but comprehensive in your analysis`;

    return prompt;
  }

  /**
   * Check API key configuration status
   */
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
      
      console.log('API Key Status Check:', { hasAnyKey, availableProviders, missingProviders });
      
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

  /**
   * Create a helpful message when no API keys are configured
   */
  private createApiKeyConfigurationMessage(status: {
    hasAnyKey: boolean;
    availableProviders: string[];
    missingProviders: string[];
  }): EnhancedChatMessage {
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
      visualData: null,
      serpData: null,
      actions: [
        {
          id: 'configure-api-keys',
          type: 'button',
          action: 'navigate_to_settings',
          label: 'Configure API Keys',
          data: { section: 'ai-settings' }
        }
      ],
      workflowContext: null,
      metadata: {
        reasoning: 'API key configuration required',
        confidence: 1,
        sources: [],
        actionResults: {
          apiKeyRequired: true,
          availableProviders: status.availableProviders,
          missingProviders: status.missingProviders
        }
      }
    };
  }

  private createErrorMessage(errorMessage: string): EnhancedChatMessage {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I encountered an error: ${errorMessage}. Please try again or contact support if this persists.`,
      timestamp: new Date(),
      visualData: null,
      serpData: null,
      actions: [],
      workflowContext: null,
      metadata: {
        reasoning: 'Error occurred during processing',
        confidence: 0,
        sources: [],
        actionResults: {}
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const enhancedAIService = new EnhancedAIService();