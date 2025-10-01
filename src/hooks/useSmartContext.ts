import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { calculateRelevanceScore } from '@/services/contextEmbeddings';
import { getUserPreferences, getLearnedPatterns, analyzeConversationPatterns } from '@/services/conversationMemory';

export interface ContextSuggestion {
  id: string;
  type: 'topic' | 'conversation' | 'preference' | 'pattern';
  title: string;
  description: string;
  relevance: number;
  data?: any;
}

export interface ConversationContext {
  currentTopics: string[];
  userPreferences: any[];
  recentPatterns: any[];
  suggestions: ContextSuggestion[];
  analysisComplete: boolean;
}

export function useSmartContext(conversationId?: string) {
  const [context, setContext] = useState<ConversationContext>({
    currentTopics: [],
    userPreferences: [],
    recentPatterns: [],
    suggestions: [],
    analysisComplete: false
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Analyze current conversation context
   */
  const analyzeContext = useCallback(async () => {
    if (!conversationId) return;

    setIsAnalyzing(true);
    try {
      // Get conversation summary
      const { data: summary } = await supabase
        .from('conversation_summaries')
        .select('key_topics, entities')
        .eq('conversation_id', conversationId)
        .maybeSingle();

      const currentTopics = summary?.key_topics || [];

      // Get user preferences
      const preferences = await getUserPreferences();

      // Get learned patterns
      const patterns = await getLearnedPatterns();

      // Get conversation patterns analysis
      const analysis = await analyzeConversationPatterns();

      setContext({
        currentTopics,
        userPreferences: preferences,
        recentPatterns: patterns,
        suggestions: [],
        analysisComplete: true
      });
    } catch (error) {
      console.error('Error analyzing context:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [conversationId]);

  /**
   * Generate context suggestions
   */
  const generateSuggestions = useCallback(async () => {
    if (!conversationId) return;

    try {
      const suggestions: ContextSuggestion[] = [];

      // Get related topics
      const { data: topics } = await supabase
        .from('context_topics')
        .select('*')
        .order('frequency', { ascending: false })
        .limit(5);

      if (topics) {
        topics.forEach(topic => {
          // Calculate recency score (0-1, where 1 is most recent)
          const daysSinceLastMention = Math.floor(
            (Date.now() - new Date(topic.last_mentioned).getTime()) / (1000 * 60 * 60 * 24)
          );
          const recency = Math.max(0, 1 - (daysSinceLastMention / 30));

          // Calculate importance based on frequency
          const importance = Math.min(1, topic.frequency / 10);

          suggestions.push({
            id: topic.id,
            type: 'topic',
            title: `Continue discussing: ${topic.topic_name}`,
            description: `You've mentioned this ${topic.frequency} times`,
            relevance: calculateRelevanceScore(0.8, recency, importance),
            data: topic
          });
        });
      }

      // Get related conversations
      const { data: recentSummaries } = await supabase
        .from('conversation_summaries')
        .select('conversation_id, summary, key_topics, importance_score')
        .neq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (recentSummaries) {
        recentSummaries.forEach(summary => {
          const hasCommonTopics = context.currentTopics.some(topic =>
            summary.key_topics?.includes(topic)
          );

          if (hasCommonTopics) {
            suggestions.push({
              id: summary.conversation_id,
              type: 'conversation',
              title: 'Related to previous conversation',
              description: summary.summary.slice(0, 100) + '...',
              relevance: summary.importance_score || 0.5,
              data: summary
            });
          }
        });
      }

      // Add preference-based suggestions
      context.userPreferences
        .filter(p => p.confidenceScore > 0.7)
        .forEach(pref => {
          suggestions.push({
            id: pref.id,
            type: 'preference',
            title: `Based on your preferences`,
            description: `You prefer: ${JSON.stringify(pref.preferenceValue)}`,
            relevance: pref.confidenceScore,
            data: pref
          });
        });

      // Sort by relevance and take top 5
      const topSuggestions = suggestions
        .sort((a, b) => b.relevance - a.relevance)
        .slice(0, 5);

      setContext(prev => ({
        ...prev,
        suggestions: topSuggestions
      }));
    } catch (error) {
      console.error('Error generating suggestions:', error);
    }
  }, [conversationId, context.currentTopics, context.userPreferences]);

  /**
   * Get smart context for AI prompt
   */
  const getSmartContextPrompt = useCallback(async (): Promise<string> => {
    if (!context.analysisComplete) {
      await analyzeContext();
    }

    const parts: string[] = [];

    // Add current topics
    if (context.currentTopics.length > 0) {
      parts.push(`Current topics: ${context.currentTopics.join(', ')}`);
    }

    // Add relevant user preferences
    const relevantPreferences = context.userPreferences
      .filter(p => p.confidenceScore > 0.7)
      .slice(0, 3);
    
    if (relevantPreferences.length > 0) {
      parts.push(`User preferences: ${relevantPreferences.map(p => 
        `${p.preferenceType}: ${JSON.stringify(p.preferenceValue)}`
      ).join('; ')}`);
    }

    // Add learned patterns
    const relevantPatterns = context.recentPatterns
      .filter(p => p.confidence > 0.7)
      .slice(0, 2);

    if (relevantPatterns.length > 0) {
      parts.push(`Learned patterns: ${relevantPatterns.map(p =>
        p.patternType
      ).join(', ')}`);
    }

    return parts.join('\n\n');
  }, [context, analyzeContext]);

  /**
   * Update context with new information
   */
  const updateContext = useCallback(async (updates: Partial<ConversationContext>) => {
    setContext(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Analyze context on mount
  useEffect(() => {
    if (conversationId) {
      analyzeContext();
    }
  }, [conversationId, analyzeContext]);

  // Generate suggestions when analysis is complete
  useEffect(() => {
    if (context.analysisComplete) {
      generateSuggestions();
    }
  }, [context.analysisComplete, generateSuggestions]);

  return {
    context,
    isAnalyzing,
    analyzeContext,
    generateSuggestions,
    getSmartContextPrompt,
    updateContext
  };
}
