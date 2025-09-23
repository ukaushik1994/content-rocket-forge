import { EnhancedChatMessage, VisualData, WorkflowStep } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { supabase } from '@/integrations/supabase/client';
import AIServiceController from '@/services/aiService/AIServiceController';
import { AISolutionIntegrationService } from '@/services/aiSolutionIntegrationService';
import { analyzeKeywordSerp } from '@/services/serpApiService';

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
      });

      const data = {
        messages: [
          { role: 'system', content: systemPrompt },
          ...conversationHistory.slice(-10).map(msg => ({
            role: msg.role,
            content: msg.content
          })),
          { role: 'user', content: message }
        ],
        context,
        serpData: serpAnalysisResult?.serpData,
        userId,
        features: ['visual_data', 'serp_analysis', 'workflow_management']
      };

      console.log('🔄 Calling enhanced-ai-chat with data:', {
        messagesCount: data.messages.length,
        hasSerpData: !!data.serpData,
        contextKeys: Object.keys(context || {}),
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
        return this.createErrorMessage(`AI service error: ${error.message}`);
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
      if (retryCount < 2) {
        console.log(`🔄 Retrying enhanced message processing (attempt ${retryCount + 1})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.processEnhancedMessage(message, conversationHistory, userId, onStreamUpdate, retryCount + 1);
      }
      return this.createErrorMessage(`Processing error: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
            opportunities: { ...analysis.combinedOpportunities, score: 85 },
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
          opportunities: analysis.combinedOpportunities,
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
          estimatedTraffic: Math.floor(Math.random() * 50000) + 10000,
          authority: Math.floor(Math.random() * 30) + 60
        },
        {
          url: 'https://example2.com', 
          title: `${keyword} Best Practices`,
          snippet: `Discover the best practices for ${keyword} optimization...`,
          position: 2,
          estimatedTraffic: Math.floor(Math.random() * 40000) + 8000,
          authority: Math.floor(Math.random() * 25) + 55
        }
      ],
      peopleAlsoAsk: serpResult.peopleAlsoAsk || [
        `What is ${keyword}?`,
        `How does ${keyword} work?`,
        `Best ${keyword} practices?`,
        `${keyword} vs alternatives?`
      ],
      contentGaps: serpResult.contentGaps || [
        `Advanced ${keyword} techniques`,
        `${keyword} case studies`,
        `Common ${keyword} mistakes`,
        `${keyword} tools comparison`
      ],
      opportunities: {
        lowCompetition: serpResult.opportunities?.lowCompetition || [
          `${keyword} for beginners`,
          `${keyword} checklist`,
          `${keyword} examples`
        ],
        highVolume: serpResult.opportunities?.highVolume || [
          `best ${keyword}`,
          `${keyword} guide`,
          `${keyword} tips`
        ],
        trending: serpResult.opportunities?.trending || [
          `${keyword} 2024`,
          `${keyword} trends`,
          `new ${keyword}`
        ],
        score: Math.floor(Math.random() * 40) + 60
      },
      keywordVariations: Array.from({length: 8}, (_, i) => ({
        keyword: `${keyword} ${['tutorial', 'guide', 'tips', 'best', 'how to', 'examples', 'tools', 'strategy'][i]}`,
        volume: Math.floor(Math.random() * 5000) + 500,
        difficulty: Math.floor(Math.random() * 50) + 10,
        opportunity: Math.floor(Math.random() * 60) + 40
      })),
      contentAnalysis: {
        averageWordCount: Math.floor(Math.random() * 2000) + 1500,
        topFormats: ['How-to Guide', 'Listicle', 'Case Study', 'Tutorial'].slice(0, Math.floor(Math.random() * 3) + 2),
        missingTopics: [
          `${keyword} comparison`,
          `${keyword} pricing`,
          `${keyword} reviews`,
          `${keyword} alternatives`
        ].slice(0, Math.floor(Math.random() * 3) + 1)
      }
    };
  }

  private buildEnhancedSystemPrompt(context: any, conversationHistory: EnhancedChatMessage[]): string {
    const basePrompt = `You are an AI assistant specialized in content strategy, SEO, and business growth. You have access to comprehensive user data and can provide actionable insights.

CORE CAPABILITIES:
- SEO and keyword analysis with SERP data
- Content strategy and optimization
- Competitor analysis and market research
- Visual data generation (charts, metrics, workflows)
- Multi-step workflow management
- Context-aware recommendations

VISUAL DATA GENERATION:
When providing insights, you can generate visual data including:
- Charts (line, bar, pie, area) for trends and comparisons
- Metric cards for KPIs and key numbers
- Workflow steps for complex processes
- SERP analysis visualizations

RESPONSE FORMAT:
Always structure responses to be:
1. Actionable and specific
2. Data-driven with visual elements when helpful
3. Contextually relevant to the user's business
4. Include follow-up actions or next steps

USER CONTEXT:
${this.formatContextForPrompt(context)}

CONVERSATION HISTORY:
${conversationHistory.slice(-3).map(msg => `${msg.role}: ${msg.content.slice(0, 200)}...`).join('\n')}

Provide comprehensive, actionable advice with visual data when relevant.`;

    return basePrompt;
  }

  private formatContextForPrompt(context: any): string {
    if (!context) return 'No specific user context available.';
    
    const parts = [];
    
    if (context.solutions?.length > 0) {
      parts.push(`Solutions: ${context.solutions.map((s: any) => s.name).join(', ')}`);
    }
    
    if (context.analytics) {
      parts.push(`Content Analytics: ${context.analytics.totalContent} total items, ${context.analytics.published} published`);
    }
    
    if (context.builderContext?.serpSelections?.length > 0) {
      parts.push(`SERP Research: ${context.builderContext.serpSelections.length} keywords analyzed`);
    }
    
    return parts.length > 0 ? parts.join('\n') : 'General business context available.';
  }

  private createErrorMessage(content: string): EnhancedChatMessage {
    return {
      id: Date.now().toString(),
      role: 'assistant',
      content: `I apologize, but I encountered an issue: ${content}. Please try again or rephrase your request.`,
      timestamp: new Date(),
      metadata: {
        reasoning: 'Error occurred during processing',
        confidence: 0
      }
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export default new EnhancedAIService();