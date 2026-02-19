/**
 * AI Chat Backend Services Integrator
 * Coordinates all Phase 1-3 backend services for the chat interface
 */

import { supabase } from '@/integrations/supabase/client';

interface ChatIntegrationConfig {
  userId: string;
  conversationId?: string;
  context?: any;
}

interface AIResponse {
  content: string;
  actions?: any[];
  visualData?: any;
  workflowContext?: any;
}

export class AIChatIntegrator {
  /**
   * Enhanced AI Chat with full backend integration
   */
  static async processMessage(
    message: string,
    config: ChatIntegrationConfig,
    messageHistory: any[] = []
  ): Promise<AIResponse> {
    try {
      console.log('🚀 Processing enhanced message with full backend integration');

      // Step 1: Use AI Proxy for intelligent routing
      const { data: proxyResponse, error: proxyError } = await supabase.functions.invoke('ai-proxy', {
        body: {
          service: 'openai',
          endpoint: 'chat',
          params: {
            model: 'gpt-5-2025-08-07',
            messages: [
              {
                role: 'system',
                content: `You are an AI assistant with access to advanced tools for content strategy, analytics, and workflow automation. 

Available Tools:
- Content Strategy Engine: Generate data-driven content strategies
- OpenRouter Content Generator: Create optimized content 
- Google Analytics: Fetch real performance data
- Search Console: Get search performance insights
- Dashboard Summary: Comprehensive overview data

When users ask about content, strategy, analytics, or performance, proactively use these tools to provide rich, data-driven responses with actionable insights.`
              },
              ...messageHistory.map(msg => ({
                role: msg.role,
                content: msg.content
              })),
              { role: 'user', content: message }
            ],
            max_completion_tokens: 2000
          }
        }
      });

      if (proxyError) {
        console.error('AI Proxy error:', proxyError);
        throw new Error(`AI processing failed: ${proxyError.message}`);
      }

      let aiResponse = proxyResponse?.response?.choices?.[0]?.message?.content || '';

      // Step 2: Check if we need content strategy assistance
      if (this.shouldUseContentStrategy(message)) {
        console.log('🎯 Triggering content strategy engine');
        const strategyData = await this.getContentStrategyInsights(message, config);
        if (strategyData) {
          aiResponse += `\n\n**📊 Content Strategy Insights:**\n${strategyData}`;
        }
      }

      // Step 3: Check if we need content generation
      if (this.shouldGenerateContent(message)) {
        console.log('📝 Triggering content generator');
        const contentData = await this.generateContent(message, config);
        if (contentData) {
          aiResponse += `\n\n**✨ Generated Content:**\n${contentData}`;
        }
      }

      // Step 4: Check if we need analytics data
      if (this.shouldFetchAnalytics(message)) {
        console.log('📈 Fetching analytics data');
        const analyticsData = await this.getAnalyticsInsights(config);
        if (analyticsData) {
          aiResponse += `\n\n**📈 Analytics Overview:**\n${analyticsData}`;
        }
      }

      // Step 5: Use context manager to maintain conversation context
      await this.updateConversationContext(config, message, aiResponse);

      return {
        content: aiResponse,
        actions: this.extractActions(message, aiResponse),
        visualData: this.extractVisualData(aiResponse),
        workflowContext: { 
          servicesUsed: this.getUsedServices(message),
          integrationLevel: 'full'
        }
      };

    } catch (error) {
      console.error('❌ AI Chat Integration error:', error);
      return {
        content: `I apologize, but I encountered an issue processing your request: ${error.message}. Please try again.`,
        actions: [],
        visualData: null,
        workflowContext: { error: true }
      };
    }
  }

  /**
   * Get content strategy insights
   */
  private static async getContentStrategyInsights(
    message: string, 
    config: ChatIntegrationConfig
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('content-strategy-engine', {
        body: {
          user_id: config.userId,
          query: message,
          context: config.context || {},
          analysis_type: 'chat_integration'
        }
      });

      if (error) throw error;

      if (data?.strategy) {
        const strategy = data.strategy;
        return `
**Primary Keywords:** ${strategy.primary_keywords?.join(', ') || 'N/A'}
**Content Opportunities:** ${strategy.opportunities?.length || 0} identified
**Competitive Advantage:** ${strategy.competitive_insights || 'Analysis complete'}
**Recommended Actions:** ${strategy.next_steps?.join(' • ') || 'Strategy optimized'}`;
      }
      
      return null;
    } catch (error) {
      console.error('Content strategy error:', error);
      return null;
    }
  }

  /**
   * Generate content using OpenRouter
   */
  private static async generateContent(
    message: string,
    config: ChatIntegrationConfig
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('openrouter-content-generator', {
        body: {
          user_id: config.userId,
          content_type: this.detectContentType(message),
          prompt: message,
          context: config.context || {}
        }
      });

      if (error) throw error;

      return data?.generated_content || null;
    } catch (error) {
      console.error('Content generation error:', error);
      return null;
    }
  }

  /**
   * Get analytics insights
   */
  private static async getAnalyticsInsights(
    config: ChatIntegrationConfig
  ): Promise<string | null> {
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-summary', {
        body: { user_id: config.userId }
      });

      if (error) throw error;

      if (data?.summary) {
        const summary = data.summary;
        return `
**Total Content:** ${summary.total_content || 'N/A'} pieces
**Active Goals:** ${summary.active_goals || 0} in progress  
**Top Performer:** ${summary.top_content?.title || 'Analysis in progress'}
**Growth Trend:** ${summary.performance_trend || 'Positive'}`;
      }
      
      return null;
    } catch (error) {
      console.error('Analytics error:', error);
      return null;
    }
  }

  /**
   * Update conversation context using context manager
   */
  private static async updateConversationContext(
    config: ChatIntegrationConfig,
    userMessage: string,
    aiResponse: string
  ): Promise<void> {
    try {
      await supabase.functions.invoke('ai-context-manager', {
        body: {
          user_id: config.userId,
          conversation_id: config.conversationId,
          action: 'update_context',
          context: {
            last_user_message: userMessage,
            last_ai_response: aiResponse,
            timestamp: new Date().toISOString(),
            services_integrated: true
          }
        }
      });
    } catch (error) {
      console.error('Context update error:', error);
    }
  }

  // Helper methods for intelligent service triggering
  private static shouldUseContentStrategy(message: string): boolean {
    const strategyKeywords = ['strategy', 'keywords', 'seo', 'optimize', 'competition', 'research', 'planning'];
    return strategyKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private static shouldGenerateContent(message: string): boolean {
    const contentKeywords = ['write', 'create', 'generate', 'blog post', 'article', 'content', 'draft'];
    return contentKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private static shouldFetchAnalytics(message: string): boolean {
    const analyticsKeywords = ['performance', 'analytics', 'stats', 'metrics', 'data', 'insights', 'dashboard'];
    return analyticsKeywords.some(keyword => 
      message.toLowerCase().includes(keyword)
    );
  }

  private static detectContentType(message: string): string {
    if (message.toLowerCase().includes('blog')) return 'blog_post';
    if (message.toLowerCase().includes('landing')) return 'landing_page';
    if (message.toLowerCase().includes('social')) return 'social_media';
    if (message.toLowerCase().includes('email')) return 'email';
    return 'general';
  }

  private static getUsedServices(message: string): string[] {
    const services = [];
    if (this.shouldUseContentStrategy(message)) services.push('content-strategy-engine');
    if (this.shouldGenerateContent(message)) services.push('openrouter-content-generator');
    if (this.shouldFetchAnalytics(message)) services.push('analytics-dashboard');
    services.push('ai-proxy');
    return services;
  }

  private static extractActions(message: string, response: string): any[] {
    const actions = [];
    
    // Add contextual actions based on response content
    if (response.includes('Content Strategy Insights')) {
      actions.push({
        type: 'navigate',
        label: 'View Full Strategy',
        action: 'navigate:/strategies',
        icon: 'target'
      });
    }
    
    if (response.includes('Generated Content')) {
      actions.push({
        type: 'action',
        label: 'Refine Content',
        action: 'workflow:content-optimization',
        icon: 'edit'
      });
    }
    
    if (response.includes('Analytics Overview')) {
      actions.push({
        type: 'navigate',
        label: 'Detailed Analytics',
        action: 'navigate:/analytics',
        icon: 'bar-chart'
      });
    }

    return actions;
  }

  private static extractVisualData(response: string): any {
    // Extract any data that could be visualized
    const hasMetrics = /(\d+\.?\d*%|\d+\s*(views|clicks|conversions))/i.test(response);
    
    if (hasMetrics) {
      return {
        type: 'metrics_summary',
        showCharts: true,
        dataAvailable: true
      };
    }
    
    return null;
  }
}