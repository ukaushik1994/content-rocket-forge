import { supabase } from '@/integrations/supabase/client';
import { EnhancedChatMessage } from '@/types/enhancedChat';

interface ContextRelationship {
  sourceId: string;
  targetId: string;
  relationshipType: 'similar_topic' | 'follow_up' | 'related_project' | 'user_pattern';
  strength: number; // 0-1
  metadata?: Record<string, any>;
}

interface SmartSuggestion {
  id: string;
  type: 'context_switch' | 'related_conversation' | 'workflow_continuation' | 'performance_insight';
  title: string;
  description: string;
  confidence: number;
  actionData: Record<string, any>;
  priority: 'high' | 'medium' | 'low';
}

interface ProjectContext {
  projectId: string;
  name: string;
  conversations: string[];
  keywords: string[];
  lastActivity: Date;
  workflowState: Record<string, any>;
}

export class EnhancedContextManager {
  private userId: string | null = null;
  private contextCache = new Map<string, any>();
  private relationshipCache = new Map<string, ContextRelationship[]>();

  constructor(userId?: string) {
    this.userId = userId || null;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  // Enhanced Context Persistence with Smart Suggestions
  async getSmartSuggestions(
    currentConversationId?: string,
    recentMessages?: EnhancedChatMessage[]
  ): Promise<SmartSuggestion[]> {
    if (!this.userId) return [];

    try {
      const suggestions: SmartSuggestion[] = [];

      // Analyze recent messages for context
      const messageContext = this.extractMessageContext(recentMessages);
      
      // Get related conversations based on topics
      const relatedConversations = await this.findRelatedConversations(messageContext.topics);
      
      // Generate suggestions based on conversation relationships
      for (const conversation of relatedConversations) {
        suggestions.push({
          id: `related-${conversation.id}`,
          type: 'related_conversation',
          title: `Continue discussion: ${conversation.title}`,
          description: `Similar topics: ${conversation.similarTopics.join(', ')}`,
          confidence: conversation.similarity,
          actionData: { conversationId: conversation.id },
          priority: conversation.similarity > 0.8 ? 'high' : 'medium'
        });
      }

      // Check for workflow continuations
      const workflowSuggestions = await this.getWorkflowContinuationSuggestions(messageContext);
      suggestions.push(...workflowSuggestions);

      // Performance insights based on context
      const performanceSuggestions = await this.getPerformanceInsights(messageContext);
      suggestions.push(...performanceSuggestions);

      // Sort by priority and confidence
      return suggestions
        .sort((a, b) => {
          const priorityWeight = { high: 3, medium: 2, low: 1 };
          return (priorityWeight[b.priority] * b.confidence) - (priorityWeight[a.priority] * a.confidence);
        })
        .slice(0, 5); // Top 5 suggestions
    } catch (error) {
      console.error('Error generating smart suggestions:', error);
      return [];
    }
  }

  // Project-Specific Context Isolation
  async getProjectContext(projectId: string): Promise<ProjectContext | null> {
    if (!this.userId) return null;

    const cacheKey = `project-${projectId}`;
    if (this.contextCache.has(cacheKey)) {
      return this.contextCache.get(cacheKey);
    }

    try {
      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('id, title, tags, updated_at')
        .eq('user_id', this.userId)
        .contains('tags', [projectId]);

      if (!conversations) return null;

      const projectContext: ProjectContext = {
        projectId,
        name: projectId, // Could be enhanced with actual project names
        conversations: conversations.map(c => c.id),
        keywords: this.extractKeywordsFromConversations(conversations),
        lastActivity: new Date(Math.max(...conversations.map(c => new Date(c.updated_at).getTime()))),
        workflowState: await this.getProjectWorkflowState(projectId)
      };

      this.contextCache.set(cacheKey, projectContext);
      return projectContext;
    } catch (error) {
      console.error('Error getting project context:', error);
      return null;
    }
  }

  // Context Relationship Mapping
  async buildContextRelationships(conversationId: string): Promise<ContextRelationship[]> {
    if (!this.userId) return [];

    if (this.relationshipCache.has(conversationId)) {
      return this.relationshipCache.get(conversationId) || [];
    }

    try {
      const { data: conversation } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!conversation) return [];

      const { data: messages } = await supabase
        .from('ai_messages')
        .select('content')
        .eq('conversation_id', conversationId);

      const conversationTopics = this.extractTopicsFromMessages(messages || []);
      
      // Find similar conversations
      const { data: allConversations } = await supabase
        .from('ai_conversations')
        .select('id, title, tags')
        .eq('user_id', this.userId)
        .neq('id', conversationId);

      const relationships: ContextRelationship[] = [];

      for (const otherConversation of allConversations || []) {
        const similarity = this.calculateTopicSimilarity(
          conversationTopics,
          otherConversation.tags || []
        );

        if (similarity > 0.3) {
          relationships.push({
            sourceId: conversationId,
            targetId: otherConversation.id,
            relationshipType: similarity > 0.7 ? 'similar_topic' : 'related_project',
            strength: similarity,
            metadata: {
              topics: conversationTopics,
              targetTitle: otherConversation.title
            }
          });
        }
      }

      this.relationshipCache.set(conversationId, relationships);
      return relationships;
    } catch (error) {
      console.error('Error building context relationships:', error);
      return [];
    }
  }

  // Cross-Session Context Search
  async searchContextAcrossSessions(
    query: string,
    filters?: {
      projectId?: string;
      dateRange?: { start: Date; end: Date };
      conversationType?: 'regular' | 'streaming';
    }
  ): Promise<Array<{
    conversationId: string;
    title: string;
    relevantMessages: Array<{ content: string; relevance: number }>;
    lastActivity: Date;
  }>> {
    if (!this.userId) return [];

    try {
      let conversationsQuery = supabase
        .from('ai_conversations')
        .select('id, title, updated_at, tags')
        .eq('user_id', this.userId);

      // Apply filters
      if (filters?.projectId) {
        conversationsQuery = conversationsQuery.contains('tags', [filters.projectId]);
      }

      if (filters?.dateRange) {
        conversationsQuery = conversationsQuery
          .gte('updated_at', filters.dateRange.start.toISOString())
          .lte('updated_at', filters.dateRange.end.toISOString());
      }

      const { data: conversations } = await conversationsQuery;
      if (!conversations) return [];

      const results = [];
      const queryKeywords = query.toLowerCase().split(' ');

      for (const conversation of conversations) {
        const { data: messages } = await supabase
          .from('ai_messages')
          .select('content')
          .eq('conversation_id', conversation.id);

        if (!messages) continue;

        const relevantMessages = messages
          .map(msg => ({
            content: msg.content,
            relevance: this.calculateQueryRelevance(msg.content, queryKeywords)
          }))
          .filter(msg => msg.relevance > 0.2)
          .sort((a, b) => b.relevance - a.relevance)
          .slice(0, 3);

        if (relevantMessages.length > 0) {
          results.push({
            conversationId: conversation.id,
            title: conversation.title || 'Untitled Conversation',
            relevantMessages,
            lastActivity: new Date(conversation.updated_at)
          });
        }
      }

      return results.sort((a, b) => {
        const avgRelevanceA = a.relevantMessages.reduce((sum, msg) => sum + msg.relevance, 0) / a.relevantMessages.length;
        const avgRelevanceB = b.relevantMessages.reduce((sum, msg) => sum + msg.relevance, 0) / b.relevantMessages.length;
        return avgRelevanceB - avgRelevanceA;
      });
    } catch (error) {
      console.error('Error searching context across sessions:', error);
      return [];
    }
  }

  // Private helper methods
  private extractMessageContext(messages?: EnhancedChatMessage[]): {
    topics: string[];
    keywords: string[];
    workflowStage?: string;
    contentType?: string;
  } {
    if (!messages || messages.length === 0) {
      return { topics: [], keywords: [] };
    }

    const recentContent = messages
      .slice(-5) // Last 5 messages
      .map(m => m.content)
      .join(' ');

    const topics = this.extractTopicsFromText(recentContent);
    const keywords = this.extractKeywordsFromText(recentContent);

    return {
      topics,
      keywords,
      workflowStage: this.detectWorkflowStage(recentContent),
      contentType: this.detectContentType(recentContent)
    };
  }

  private async findRelatedConversations(topics: string[]): Promise<Array<{
    id: string;
    title: string;
    similarity: number;
    similarTopics: string[];
  }>> {
    if (!this.userId || topics.length === 0) return [];

    try {
      const { data: conversations } = await supabase
        .from('ai_conversations')
        .select('id, title, tags')
        .eq('user_id', this.userId);

      if (!conversations) return [];

      return conversations
        .map(conv => {
          const similarTopics = (conv.tags || []).filter(tag => 
            topics.some(topic => 
              topic.toLowerCase().includes(tag.toLowerCase()) || 
              tag.toLowerCase().includes(topic.toLowerCase())
            )
          );

          const similarity = similarTopics.length / Math.max(topics.length, (conv.tags || []).length);

          return {
            id: conv.id,
            title: conv.title || 'Untitled',
            similarity,
            similarTopics
          };
        })
        .filter(conv => conv.similarity > 0.2)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, 3);
    } catch (error) {
      console.error('Error finding related conversations:', error);
      return [];
    }
  }

  private async getWorkflowContinuationSuggestions(context: any): Promise<SmartSuggestion[]> {
    const suggestions: SmartSuggestion[] = [];

    if (context.workflowStage === 'content_creation') {
      suggestions.push({
        id: 'continue-content',
        type: 'workflow_continuation',
        title: 'Continue Content Creation',
        description: 'Pick up where you left off with content optimization',
        confidence: 0.8,
        actionData: { workflow: 'content_creation', stage: 'optimization' },
        priority: 'high'
      });
    }

    if (context.contentType === 'blog') {
      suggestions.push({
        id: 'seo-analysis',
        type: 'workflow_continuation',
        title: 'Run SEO Analysis',
        description: 'Analyze your blog content for SEO opportunities',
        confidence: 0.7,
        actionData: { workflow: 'seo_analysis', contentType: 'blog' },
        priority: 'medium'
      });
    }

    return suggestions;
  }

  private async getPerformanceInsights(context: any): Promise<SmartSuggestion[]> {
    if (!this.userId) return [];

    try {
      // Get recent content performance
      const { data: analytics } = await supabase
        .from('content_analytics')
        .select('analytics_data')
        .limit(5);

      if (!analytics || analytics.length === 0) return [];

      const suggestions: SmartSuggestion[] = [];

      // Analyze patterns for suggestions
      const avgPerformance = analytics.reduce((sum, item) => {
        const data = item.analytics_data as any;
        return sum + (data.score || 0);
      }, 0) / analytics.length;

      if (avgPerformance < 70) {
        suggestions.push({
          id: 'performance-improvement',
          type: 'performance_insight',
          title: 'Improve Content Performance',
          description: `Average score is ${Math.round(avgPerformance)}%. Let's optimize your content strategy.`,
          confidence: 0.9,
          actionData: { action: 'performance_analysis', avgScore: avgPerformance },
          priority: 'high'
        });
      }

      return suggestions;
    } catch (error) {
      console.error('Error getting performance insights:', error);
      return [];
    }
  }

  private extractTopicsFromMessages(messages: Array<{ content: string }>): string[] {
    return messages
      .flatMap(msg => this.extractTopicsFromText(msg.content))
      .filter((topic, index, arr) => arr.indexOf(topic) === index)
      .slice(0, 10);
  }

  private extractTopicsFromText(text: string): string[] {
    const keywords = text.toLowerCase().match(/\b\w{4,}\b/g) || [];
    return [...new Set(keywords)].slice(0, 5);
  }

  private extractKeywordsFromText(text: string): string[] {
    return text.toLowerCase().match(/\b\w{3,}\b/g) || [];
  }

  private extractKeywordsFromConversations(conversations: any[]): string[] {
    return conversations
      .flatMap(conv => conv.tags || [])
      .filter((tag, index, arr) => arr.indexOf(tag) === index)
      .slice(0, 10);
  }

  private async getProjectWorkflowState(projectId: string): Promise<Record<string, any>> {
    try {
      const { data } = await supabase
        .from('ai_workflow_states')
        .select('workflow_data')
        .eq('user_id', this.userId)
        .contains('workflow_data', { projectId });

      return data?.[0]?.workflow_data || {};
    } catch (error) {
      return {};
    }
  }

  private calculateTopicSimilarity(topics1: string[], topics2: string[]): number {
    if (topics1.length === 0 || topics2.length === 0) return 0;

    const intersection = topics1.filter(topic => 
      topics2.some(t2 => t2.toLowerCase().includes(topic.toLowerCase()))
    );
    
    return intersection.length / Math.max(topics1.length, topics2.length);
  }

  private calculateQueryRelevance(content: string, queryKeywords: string[]): number {
    const contentLower = content.toLowerCase();
    const matches = queryKeywords.filter(keyword => contentLower.includes(keyword));
    return matches.length / queryKeywords.length;
  }

  private detectWorkflowStage(content: string): string | undefined {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('create') || contentLower.includes('write')) {
      return 'content_creation';
    }
    if (contentLower.includes('review') || contentLower.includes('approve')) {
      return 'review';
    }
    if (contentLower.includes('optimize') || contentLower.includes('seo')) {
      return 'optimization';
    }
    if (contentLower.includes('publish') || contentLower.includes('share')) {
      return 'publishing';
    }
    
    return undefined;
  }

  private detectContentType(content: string): string | undefined {
    const contentLower = content.toLowerCase();
    
    if (contentLower.includes('blog') || contentLower.includes('article')) {
      return 'blog';
    }
    if (contentLower.includes('social') || contentLower.includes('post')) {
      return 'social';
    }
    if (contentLower.includes('email') || contentLower.includes('newsletter')) {
      return 'email';
    }
    
    return undefined;
  }
}

// Export singleton instance
export const enhancedContextManager = new EnhancedContextManager();