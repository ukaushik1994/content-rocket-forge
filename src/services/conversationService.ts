
import { supabase } from '@/integrations/supabase/client';

export interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  message_count?: number;
}

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  type: 'user' | 'agent';
  content: string;
  function_calls?: any;
  attachments?: any;
  status: string;
  created_at: string;
}

class ConversationService {
  async createConversation(title?: string): Promise<Conversation> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          title: title || 'New Conversation',
          user_id: user.data.user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      throw new Error(`Failed to create conversation: ${error.message}`);
    }
  }

  async getConversations(): Promise<Conversation[]> {
    try {
      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('ai_conversations')
        .select(`
          *,
          ai_messages(count)
        `)
        .eq('user_id', user.data.user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      
      return data.map(conv => ({
        ...conv,
        message_count: conv.ai_messages?.[0]?.count || 0
      }));
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      throw new Error(`Failed to fetch conversations: ${error.message}`);
    }
  }

  async getConversationMessages(conversationId: string): Promise<ConversationMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  }

  async saveMessage(
    conversationId: string,
    type: 'user' | 'agent',
    content: string,
    functionCalls?: any,
    attachments?: any,
    status: string = 'completed'
  ): Promise<ConversationMessage> {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .insert({
          conversation_id: conversationId,
          type,
          content,
          function_calls: functionCalls,
          attachments,
          status
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error: any) {
      console.error('Error saving message:', error);
      throw new Error(`Failed to save message: ${error.message}`);
    }
  }

  async updateConversationTitle(conversationId: string, title: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title })
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error updating conversation title:', error);
      throw new Error(`Failed to update conversation title: ${error.message}`);
    }
  }

  async deleteConversation(conversationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      throw new Error(`Failed to delete conversation: ${error.message}`);
    }
  }
}

export const conversationService = new ConversationService();
