import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface AIChatConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned: boolean;
  archived: boolean;
  user_id: string;
  tags: string[];
}

export const useEnhancedAIChatDB = () => {
  const [conversations, setConversations] = useState<AIChatConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  // Load conversations on mount
  useEffect(() => {
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = useCallback(async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const createConversation = useCallback(async (title: string) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert([{
          title,
          user_id: user.id,
          pinned: false,
          archived: false,
          tags: []
        }])
        .select()
        .single();

      if (error) throw error;

      setConversations(prev => [data, ...prev]);
      setActiveConversation(data.id);
      
      toast({
        title: "Success",
        description: "New conversation created"
      });

      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast({
        title: "Error",
        description: "Failed to create conversation",
        variant: "destructive"
      });
      return null;
    }
  }, [user, toast]);

  const deleteConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      if (activeConversation === conversationId) {
        setActiveConversation(null);
      }

      toast({
        title: "Success",
        description: "Conversation deleted"
      });
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  }, [user, activeConversation, toast]);

  const selectConversation = useCallback((conversationId: string) => {
    setActiveConversation(conversationId);
  }, []);

  const togglePinConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const { error } = await supabase
        .from('ai_conversations')
        .update({ pinned: !conversation.pinned })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, pinned: !c.pinned } : c
      ));

      toast({
        title: "Success",
        description: conversation.pinned ? "Conversation unpinned" : "Conversation pinned"
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive"
      });
    }
  }, [user, conversations, toast]);

  const toggleArchiveConversation = useCallback(async (conversationId: string) => {
    if (!user) return;

    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const { error } = await supabase
        .from('ai_conversations')
        .update({ archived: !conversation.archived })
        .eq('id', conversationId)
        .eq('user_id', user.id);

      if (error) throw error;

      setConversations(prev => prev.map(c => 
        c.id === conversationId ? { ...c, archived: !c.archived } : c
      ));

      toast({
        title: "Success",
        description: conversation.archived ? "Conversation unarchived" : "Conversation archived"
      });
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive"
      });
    }
  }, [user, conversations, toast]);

  return {
    conversations,
    activeConversation,
    isLoading,
    createConversation,
    deleteConversation,
    selectConversation,
    togglePinConversation,
    toggleArchiveConversation,
    loadConversations
  };
};