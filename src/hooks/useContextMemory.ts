import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  summarizeConversation, 
  extractTopics, 
  getConversationSummary,
  ConversationSummary 
} from '@/services/contextSummarization';
import { findSimilarMessages, findSimilarTopics } from '@/services/contextEmbeddings';
import { useToast } from '@/hooks/use-toast';

export interface RelatedConversation {
  id: string;
  title: string;
  summary: string;
  similarity: number;
  topics: string[];
}

export function useContextMemory(conversationId?: string) {
  const [summary, setSummary] = useState<ConversationSummary | null>(null);
  const [relatedConversations, setRelatedConversations] = useState<RelatedConversation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  /**
   * Load conversation summary
   */
  const loadSummary = useCallback(async () => {
    if (!conversationId) return;

    try {
      const existingSummary = await getConversationSummary(conversationId);
      setSummary(existingSummary);
    } catch (error) {
      console.error('Error loading summary:', error);
    }
  }, [conversationId]);

  /**
   * Generate new summary for conversation
   */
  const generateSummary = useCallback(async (minMessages: number = 5) => {
    if (!conversationId) return;

    setIsLoading(true);
    try {
      const newSummary = await summarizeConversation(conversationId, { minMessages });
      if (newSummary) {
        setSummary(newSummary);
        await extractTopics(conversationId);
        toast({
          title: "Summary Generated",
          description: "Conversation has been analyzed and summarized."
        });
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary Failed",
        description: "Could not generate conversation summary.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, toast]);

  /**
   * Find related conversations by topic similarity
   */
  const findRelatedConversations = useCallback(async (limit: number = 5) => {
    if (!conversationId || !summary) return;

    setIsLoading(true);
    try {
      // Use current conversation topics to find similar ones
      const topicsText = summary.keyTopics.join(' ');
      const similarTopics = await findSimilarTopics(topicsText, limit);

      // Get conversations that mention these topics
      const conversationIds = new Set<string>();
      
      for (const topic of similarTopics) {
        const { data } = await supabase
          .from('conversation_summaries')
          .select('conversation_id, summary, key_topics')
          .contains('key_topics', [topic.topicName])
          .neq('conversation_id', conversationId)
          .limit(5);

        data?.forEach(conv => conversationIds.add(conv.conversation_id));
      }

      // Get conversation details
      const related: RelatedConversation[] = [];
      for (const id of Array.from(conversationIds).slice(0, limit)) {
        const { data: conv } = await supabase
          .from('ai_conversations')
          .select('id, title')
          .eq('id', id)
          .single();

        const { data: summary } = await supabase
          .from('conversation_summaries')
          .select('summary, key_topics')
          .eq('conversation_id', id)
          .single();

        if (conv && summary) {
          related.push({
            id: conv.id,
            title: conv.title || 'Untitled',
            summary: summary.summary,
            similarity: 0.8, // Placeholder
            topics: summary.key_topics || []
          });
        }
      }

      setRelatedConversations(related);
    } catch (error) {
      console.error('Error finding related conversations:', error);
    } finally {
      setIsLoading(false);
    }
  }, [conversationId, summary]);

  /**
   * Search across all conversations
   */
  const searchConversations = useCallback(async (query: string, limit: number = 10) => {
    try {
      const similarMessages = await findSimilarMessages(query, limit);
      
      // Get unique conversation IDs
      const conversationIds = new Set<string>();
      for (const msg of similarMessages) {
        const { data } = await supabase
          .from('ai_messages')
          .select('conversation_id')
          .eq('id', msg.id)
          .single();
        
        if (data) conversationIds.add(data.conversation_id);
      }

      // Get conversation details
      const results: RelatedConversation[] = [];
      for (const id of Array.from(conversationIds)) {
        const { data: conv } = await supabase
          .from('ai_conversations')
          .select('id, title')
          .eq('id', id)
          .single();

        const { data: summary } = await supabase
          .from('conversation_summaries')
          .select('summary, key_topics')
          .eq('conversation_id', id)
          .maybeSingle();

        if (conv) {
          results.push({
            id: conv.id,
            title: conv.title || 'Untitled',
            summary: summary?.summary || '',
            similarity: 0.85, // Placeholder
            topics: summary?.key_topics || []
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error searching conversations:', error);
      return [];
    }
  }, []);

  /**
   * Get context for new message
   */
  const getContextForMessage = useCallback(async (messageContent: string) => {
    try {
      // Find similar past messages
      const similar = await findSimilarMessages(messageContent, 3, 0.75);
      
      // Get the actual messages
      const contextMessages = [];
      for (const item of similar) {
        const { data } = await supabase
          .from('ai_messages')
          .select('content, created_at')
          .eq('id', item.id)
          .single();
        
        if (data) {
          contextMessages.push({
            content: data.content,
            similarity: item.similarity || 0,
            timestamp: data.created_at
          });
        }
      }

      return contextMessages;
    } catch (error) {
      console.error('Error getting context for message:', error);
      return [];
    }
  }, []);

  // Load summary on mount
  useEffect(() => {
    if (conversationId) {
      loadSummary();
    }
  }, [conversationId, loadSummary]);

  return {
    summary,
    relatedConversations,
    isLoading,
    generateSummary,
    findRelatedConversations,
    searchConversations,
    getContextForMessage,
    refreshSummary: loadSummary
  };
}
