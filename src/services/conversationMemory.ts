import { supabase } from '@/integrations/supabase/client';

export interface UserPreference {
  id: string;
  preferenceType: string;
  preferenceValue: any;
  confidenceScore: number;
  sourceConversationId?: string;
}

export interface LearnedPattern {
  id: string;
  patternType: string;
  patternData: any;
  occurrences: number;
  confidence: number;
}

export interface ConversationInsight {
  id: string;
  conversationId: string;
  insightType: string;
  insightData: any;
  importance: number;
}

/**
 * Learn user preference from conversation
 */
export async function learnUserPreference(
  preferenceType: string,
  preferenceValue: any,
  conversationId?: string,
  confidence: number = 0.5
): Promise<boolean> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;

    // Check if preference exists
    const { data: existing } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .eq('preference_type', preferenceType)
      .maybeSingle();

    if (existing) {
      // Update confidence if we see it again
      const newConfidence = Math.min(1.0, existing.confidence_score + 0.1);
      await supabase
        .from('user_preferences')
        .update({
          preference_value: preferenceValue,
          confidence_score: newConfidence,
          source_conversation_id: conversationId
        })
        .eq('id', existing.id);
    } else {
      // Create new preference
      await supabase
        .from('user_preferences')
        .insert({
          user_id: userId,
          preference_type: preferenceType,
          preference_value: preferenceValue,
          confidence_score: confidence,
          source_conversation_id: conversationId
        });
    }

    return true;
  } catch (error) {
    console.error('Error learning user preference:', error);
    return false;
  }
}

/**
 * Get user preferences
 */
export async function getUserPreferences(
  preferenceType?: string
): Promise<UserPreference[]> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    let query = supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .order('confidence_score', { ascending: false });

    if (preferenceType) {
      query = query.eq('preference_type', preferenceType);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(p => ({
      id: p.id,
      preferenceType: p.preference_type,
      preferenceValue: p.preference_value,
      confidenceScore: p.confidence_score,
      sourceConversationId: p.source_conversation_id
    }));
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return [];
  }
}

/**
 * Record learned pattern
 */
export async function recordLearnedPattern(
  patternType: string,
  patternData: any
): Promise<boolean> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;

    // Check if pattern exists
    const { data: existing } = await supabase
      .from('learned_patterns')
      .select('*')
      .eq('user_id', userId)
      .eq('pattern_type', patternType)
      .maybeSingle();

    if (existing) {
      // Increment occurrences and confidence
      const newOccurrences = existing.occurrences + 1;
      const newConfidence = Math.min(1.0, existing.confidence + 0.05);
      
      await supabase
        .from('learned_patterns')
        .update({
          pattern_data: patternData,
          occurrences: newOccurrences,
          confidence: newConfidence,
          last_seen: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      // Create new pattern
      await supabase
        .from('learned_patterns')
        .insert({
          user_id: userId,
          pattern_type: patternType,
          pattern_data: patternData,
          occurrences: 1,
          confidence: 0.5
        });
    }

    return true;
  } catch (error) {
    console.error('Error recording learned pattern:', error);
    return false;
  }
}

/**
 * Get learned patterns
 */
export async function getLearnedPatterns(
  patternType?: string,
  minConfidence: number = 0.5
): Promise<LearnedPattern[]> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    let query = supabase
      .from('learned_patterns')
      .select('*')
      .eq('user_id', userId)
      .gte('confidence', minConfidence)
      .order('confidence', { ascending: false });

    if (patternType) {
      query = query.eq('pattern_type', patternType);
    }

    const { data, error } = await query;
    if (error || !data) return [];

    return data.map(p => ({
      id: p.id,
      patternType: p.pattern_type,
      patternData: p.pattern_data,
      occurrences: p.occurrences,
      confidence: p.confidence
    }));
  } catch (error) {
    console.error('Error getting learned patterns:', error);
    return [];
  }
}

/**
 * Store conversation insight
 */
export async function storeConversationInsight(
  conversationId: string,
  insightType: string,
  insightData: any,
  importance: number = 0.5
): Promise<boolean> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from('conversation_insights')
      .insert({
        conversation_id: conversationId,
        user_id: userId,
        insight_type: insightType,
        insight_data: insightData,
        importance
      });

    return !error;
  } catch (error) {
    console.error('Error storing conversation insight:', error);
    return false;
  }
}

/**
 * Get conversation insights
 */
export async function getConversationInsights(
  conversationId: string,
  minImportance: number = 0.3
): Promise<ConversationInsight[]> {
  try {
    const { data, error } = await supabase
      .from('conversation_insights')
      .select('*')
      .eq('conversation_id', conversationId)
      .gte('importance', minImportance)
      .order('importance', { ascending: false });

    if (error || !data) return [];

    return data.map(i => ({
      id: i.id,
      conversationId: i.conversation_id,
      insightType: i.insight_type,
      insightData: i.insight_data,
      importance: i.importance
    }));
  } catch (error) {
    console.error('Error getting conversation insights:', error);
    return [];
  }
}

/**
 * Analyze conversation patterns
 */
export async function analyzeConversationPatterns(): Promise<{
  commonTopics: string[];
  preferredTime: string;
  averageLength: number;
  sentimentTrend: 'positive' | 'negative' | 'neutral';
}> {
  try {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Not authenticated');

    // Get conversation data
    const { data: summaries } = await supabase
      .from('conversation_summaries')
      .select('key_topics, sentiment_score, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (!summaries || summaries.length === 0) {
      return {
        commonTopics: [],
        preferredTime: 'anytime',
        averageLength: 0,
        sentimentTrend: 'neutral'
      };
    }

    // Analyze topics
    const topicCounts: Record<string, number> = {};
    summaries.forEach(s => {
      s.key_topics?.forEach((topic: string) => {
        topicCounts[topic] = (topicCounts[topic] || 0) + 1;
      });
    });

    const commonTopics = Object.entries(topicCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([topic]) => topic);

    // Analyze sentiment trend
    const avgSentiment = summaries.reduce((sum, s) => sum + (s.sentiment_score || 0), 0) / summaries.length;
    const sentimentTrend = avgSentiment > 0.3 ? 'positive' : avgSentiment < -0.3 ? 'negative' : 'neutral';

    // Analyze preferred time (hour of day)
    const hours = summaries.map(s => new Date(s.created_at).getHours());
    const avgHour = Math.round(hours.reduce((sum, h) => sum + h, 0) / hours.length);
    const preferredTime = avgHour < 12 ? 'morning' : avgHour < 17 ? 'afternoon' : 'evening';

    return {
      commonTopics,
      preferredTime,
      averageLength: summaries.length,
      sentimentTrend
    };
  } catch (error) {
    console.error('Error analyzing conversation patterns:', error);
    return {
      commonTopics: [],
      preferredTime: 'anytime',
      averageLength: 0,
      sentimentTrend: 'neutral'
    };
  }
}
