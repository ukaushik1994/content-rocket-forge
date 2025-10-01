import { supabase } from '@/integrations/supabase/client';

export interface ConversationSummary {
  id: string;
  conversationId: string;
  summary: string;
  keyTopics: string[];
  entities: any[];
  sentimentScore?: number;
  importanceScore: number;
}

export interface SummarizationOptions {
  minMessages?: number;
  includeEntities?: boolean;
  includeSentiment?: boolean;
}

/**
 * Generate AI-powered summary of a conversation
 */
export async function summarizeConversation(
  conversationId: string,
  options: SummarizationOptions = {}
): Promise<ConversationSummary | null> {
  try {
    const { data: messages, error: messagesError } = await supabase
      .from('ai_messages')
      .select('content, type, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (messagesError || !messages || messages.length < (options.minMessages || 5)) {
      return null;
    }

    // Call AI to generate summary
    const { data, error } = await supabase.functions.invoke('ai-streaming', {
      body: {
        messages: [
          {
            role: 'system',
            content: `Analyze this conversation and provide:
1. A concise summary (2-3 sentences)
2. Key topics discussed (comma-separated)
3. Important entities mentioned (people, places, things)
4. Overall sentiment (-1 to 1, where -1 is negative, 0 is neutral, 1 is positive)
5. Importance score (0 to 1, based on depth and significance)

Respond in JSON format:
{
  "summary": "...",
  "keyTopics": ["topic1", "topic2"],
  "entities": ["entity1", "entity2"],
  "sentimentScore": 0.5,
  "importanceScore": 0.7
}`
          },
          {
            role: 'user',
            content: `Conversation:\n${messages.map(m => `${m.type}: ${m.content}`).join('\n')}`
          }
        ],
        stream: false
      }
    });

    if (error) throw error;

    const analysis = typeof data === 'string' ? JSON.parse(data) : data;

    // Store summary in database
    const { data: summary, error: summaryError } = await supabase
      .from('conversation_summaries')
      .insert({
        conversation_id: conversationId,
        user_id: (await supabase.auth.getUser()).data.user?.id,
        summary: analysis.summary,
        key_topics: analysis.keyTopics,
        entities: analysis.entities as any,
        sentiment_score: analysis.sentimentScore,
        importance_score: analysis.importanceScore
      })
      .select()
      .single();

    if (summaryError) throw summaryError;

    return {
      id: summary.id,
      conversationId: summary.conversation_id,
      summary: summary.summary,
      keyTopics: Array.isArray(summary.key_topics) ? summary.key_topics : [],
      entities: Array.isArray(summary.entities) ? summary.entities : [],
      sentimentScore: summary.sentiment_score || undefined,
      importanceScore: summary.importance_score || 0.5
    };
  } catch (error) {
    console.error('Error summarizing conversation:', error);
    return null;
  }
}

/**
 * Extract and store topics from conversation
 */
export async function extractTopics(conversationId: string): Promise<string[]> {
  try {
    const { data: summary } = await supabase
      .from('conversation_summaries')
      .select('key_topics')
      .eq('conversation_id', conversationId)
      .single();

    if (!summary?.key_topics) return [];
    
    const topics = (summary.key_topics as string[]) || [];

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    // Upsert topics
    for (const topic of topics) {
      await supabase
        .from('context_topics')
        .upsert({
          user_id: userId,
          topic_name: topic,
          last_mentioned: new Date().toISOString()
        }, {
          onConflict: 'user_id,topic_name',
          ignoreDuplicates: false
        })
        .select()
        .single();

      // Increment frequency
      await (supabase.rpc as any)('increment_topic_frequency', {
        p_user_id: userId,
        p_topic_name: topic
      });
    }

    return topics;
  } catch (error) {
    console.error('Error extracting topics:', error);
    return [];
  }
}

/**
 * Get conversation summary
 */
export async function getConversationSummary(
  conversationId: string
): Promise<ConversationSummary | null> {
  try {
    const { data, error } = await supabase
      .from('conversation_summaries')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    return {
      id: data.id,
      conversationId: data.conversation_id,
      summary: data.summary,
      keyTopics: Array.isArray(data.key_topics) ? data.key_topics : [],
      entities: Array.isArray(data.entities) ? data.entities : [],
      sentimentScore: data.sentiment_score || undefined,
      importanceScore: data.importance_score || 0.5
    };
  } catch (error) {
    console.error('Error getting conversation summary:', error);
    return null;
  }
}
