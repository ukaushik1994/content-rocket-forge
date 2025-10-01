import { supabase } from '@/integrations/supabase/client';

export interface EmbeddingResult {
  id: string;
  embedding: number[];
  similarity?: number;
}

/**
 * Generate embedding for text using AI
 */
export async function generateEmbedding(text: string): Promise<number[] | null> {
  try {
    const { data, error } = await supabase.functions.invoke('ai-streaming', {
      body: {
        action: 'embedding',
        text: text.slice(0, 8000) // Limit text length
      }
    });

    if (error) throw error;
    return data?.embedding || null;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return null;
  }
}

/**
 * Store message embedding for semantic search
 */
export async function storeMessageEmbedding(
  messageId: string,
  content: string
): Promise<boolean> {
  try {
    const embedding = await generateEmbedding(content);
    if (!embedding) return false;

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from('message_embeddings')
      .insert({
        message_id: messageId,
        user_id: userId,
        embedding: JSON.stringify(embedding)
      });

    return !error;
  } catch (error) {
    console.error('Error storing message embedding:', error);
    return false;
  }
}

/**
 * Store topic embedding for semantic search
 */
export async function storeTopicEmbedding(
  topicName: string,
  description?: string
): Promise<boolean> {
  try {
    const text = description || topicName;
    const embedding = await generateEmbedding(text);
    if (!embedding) return false;

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return false;

    const { error } = await supabase
      .from('context_topics')
      .update({ embedding: JSON.stringify(embedding) })
      .eq('user_id', userId)
      .eq('topic_name', topicName);

    return !error;
  } catch (error) {
    console.error('Error storing topic embedding:', error);
    return false;
  }
}

/**
 * Find similar messages using vector similarity
 */
export async function findSimilarMessages(
  queryText: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<EmbeddingResult[]> {
  try {
    const queryEmbedding = await generateEmbedding(queryText);
    if (!queryEmbedding) return [];

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    // Use cosine similarity to find similar messages
    const { data, error } = await (supabase.rpc as any)('match_messages', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: threshold,
      match_count: limit
    }) as { data: any[] | null; error: any };

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.message_id,
      embedding: item.embedding,
      similarity: item.similarity
    }));
  } catch (error) {
    console.error('Error finding similar messages:', error);
    return [];
  }
}

/**
 * Find similar topics using vector similarity
 */
export async function findSimilarTopics(
  queryText: string,
  limit: number = 5,
  threshold: number = 0.7
): Promise<Array<{ id: string; topicName: string; similarity: number }>> {
  try {
    const queryEmbedding = await generateEmbedding(queryText);
    if (!queryEmbedding) return [];

    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) return [];

    const { data, error } = await (supabase.rpc as any)('match_topics', {
      query_embedding: JSON.stringify(queryEmbedding),
      match_threshold: threshold,
      match_count: limit
    }) as { data: any[] | null; error: any };

    if (error || !data) return [];

    return data.map((item: any) => ({
      id: item.id,
      topicName: item.topic_name,
      similarity: item.similarity
    }));
  } catch (error) {
    console.error('Error finding similar topics:', error);
    return [];
  }
}

/**
 * Calculate relevance score for context
 */
export function calculateRelevanceScore(
  similarity: number,
  recency: number,
  importance: number
): number {
  // Weighted combination: 50% similarity, 30% recency, 20% importance
  return (similarity * 0.5) + (recency * 0.3) + (importance * 0.2);
}
