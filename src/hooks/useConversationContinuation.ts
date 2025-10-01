import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getConversationSummary } from '@/services/contextSummarization';
import { getUserPreferences } from '@/services/conversationMemory';

export interface ContinuationContext {
  summary: string;
  lastTopics: string[];
  suggestedPrompts: string[];
  continuationText: string;
}

export function useConversationContinuation() {
  /**
   * Get context for resuming a conversation
   */
  const getContinuationContext = useCallback(async (
    conversationId: string
  ): Promise<ContinuationContext | null> => {
    try {
      // Get conversation summary
      const summary = await getConversationSummary(conversationId);
      if (!summary) return null;

      // Get last few messages
      const { data: messages } = await supabase
        .from('ai_messages')
        .select('content, type')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: false })
        .limit(5);

      // Get user preferences for this type of conversation
      const preferences = await getUserPreferences();

      // Generate suggested prompts
      const suggestedPrompts = [
        `Continue where we left off about ${summary.keyTopics[0]}`,
        `Let's dive deeper into ${summary.keyTopics[1] || summary.keyTopics[0]}`,
        'Summarize what we discussed so far',
        'What should we explore next?'
      ];

      // Generate continuation text
      const continuationText = `Welcome back! Last time we discussed ${summary.keyTopics.slice(0, 2).join(' and ')}. ${summary.summary}`;

      return {
        summary: summary.summary,
        lastTopics: summary.keyTopics,
        suggestedPrompts,
        continuationText
      };
    } catch (error) {
      console.error('Error getting continuation context:', error);
      return null;
    }
  }, []);

  /**
   * Generate smart continuation prompt for AI
   */
  const generateContinuationPrompt = useCallback(async (
    conversationId: string
  ): Promise<string> => {
    try {
      const context = await getContinuationContext(conversationId);
      if (!context) return '';

      return `You're continuing a previous conversation. Here's what was discussed:

${context.summary}

Key topics: ${context.lastTopics.join(', ')}

Please acknowledge this context naturally and help the user continue from where they left off.`;
    } catch (error) {
      console.error('Error generating continuation prompt:', error);
      return '';
    }
  }, [getContinuationContext]);

  /**
   * Suggest next steps in conversation
   */
  const suggestNextSteps = useCallback(async (
    conversationId: string
  ): Promise<string[]> => {
    try {
      const summary = await getConversationSummary(conversationId);
      if (!summary) return [];

      const suggestions = [
        `Explore ${summary.keyTopics[0]} in more detail`,
        'Ask clarifying questions',
        'Apply this to a real-world scenario',
        'Compare different approaches'
      ];

      // Filter based on entities mentioned
      if (summary.entities.length > 0) {
        suggestions.push(`Learn more about ${summary.entities[0]}`);
      }

      return suggestions;
    } catch (error) {
      console.error('Error suggesting next steps:', error);
      return [];
    }
  }, []);

  /**
   * Branch conversation at a specific point
   */
  const branchConversation = useCallback(async (
    originalConversationId: string,
    branchPoint: string,
    newTitle: string
  ): Promise<string | null> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) return null;

      // Create new conversation
      const { data: newConv, error: convError } = await supabase
        .from('ai_conversations')
        .insert({
          user_id: userId,
          title: newTitle
        })
        .select()
        .single();

      if (convError || !newConv) throw convError;

      // Copy messages up to branch point
      const { data: messages } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', originalConversationId)
        .lte('created_at', branchPoint)
        .order('created_at', { ascending: true });

      if (messages) {
        const newMessages = messages.map(msg => ({
          conversation_id: newConv.id,
          type: msg.type,
          content: msg.content,
          visual_data: msg.visual_data,
          progress_indicator: msg.progress_indicator,
          workflow_context: msg.workflow_context,
          status: msg.status
        }));

        await supabase
          .from('ai_messages')
          .insert(newMessages);
      }

      return newConv.id;
    } catch (error) {
      console.error('Error branching conversation:', error);
      return null;
    }
  }, []);

  return {
    getContinuationContext,
    generateContinuationPrompt,
    suggestNextSteps,
    branchConversation
  };
}
