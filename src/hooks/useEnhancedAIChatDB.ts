import { useState, useCallback, useEffect } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import enhancedAIService from '@/services/enhancedAIService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ContextualAction } from '@/services/aiService';

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
  archived?: boolean;
  tags?: string[];
}

export const useEnhancedAIChatDB = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();
  const { user } = useAuth();

  // Load conversations from database with search and filter support
  const loadConversations = useCallback(async (options?: {
    search?: string;
    includeArchived?: boolean;
  }) => {
    if (!user) return;
    
    try {
      let query = supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id);

      // Apply archived filter
      if (!options?.includeArchived) {
        query = query.neq('archived', true);
      }

      // Apply search filter
      if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
      }

      const { data, error } = await query
        .order('pinned', { ascending: false })
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  }, [user]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      const formattedMessages: EnhancedChatMessage[] = (data || []).map(msg => {
        // Safely parse JSON fields
        let actions = undefined;
        let visualData = undefined;
        let progressIndicator = undefined;
        let workflowContext = undefined;
        
        try {
          // Parse function_calls for actions (preferred) or fallback to attachments
          if (msg.function_calls) {
            const parsedFunctionCalls = typeof msg.function_calls === 'string' ? JSON.parse(msg.function_calls) : msg.function_calls;
            if (Array.isArray(parsedFunctionCalls)) {
              actions = parsedFunctionCalls;
            } else if (parsedFunctionCalls.actions && Array.isArray(parsedFunctionCalls.actions)) {
              actions = parsedFunctionCalls.actions;
            }
          } else if (msg.attachments && typeof msg.attachments === 'string') {
            const attachments = JSON.parse(msg.attachments);
            if (attachments.actions && Array.isArray(attachments.actions)) {
              actions = attachments.actions;
            }
          }
          
          // Parse other JSON fields
          if (msg.visual_data) {
            visualData = typeof msg.visual_data === 'string' ? JSON.parse(msg.visual_data) : msg.visual_data;
          }
          if (msg.progress_indicator) {
            progressIndicator = typeof msg.progress_indicator === 'string' ? JSON.parse(msg.progress_indicator) : msg.progress_indicator;
          }
          if (msg.workflow_context) {
            workflowContext = typeof msg.workflow_context === 'string' ? JSON.parse(msg.workflow_context) : msg.workflow_context;
          }
        } catch (parseError) {
          console.warn('Error parsing message data:', parseError);
        }

        return {
          id: msg.id,
          role: msg.type as 'user' | 'assistant' | 'system',
          content: msg.content,
          timestamp: new Date(msg.created_at),
          visualData,
          actions,
          progressIndicator,
          workflowContext
        };
      });
      
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load conversation messages",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Create new conversation
  const createConversation = useCallback(async (title: string = "New Chat") => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('ai_conversations')
        .insert({
          title,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      
      setConversations(prev => [data, ...prev]);
      setActiveConversation(data.id);
      setMessages([]);
      
      // Reload conversations to ensure they're fresh
      await loadConversations();
      
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
  }, [user, toast, loadConversations]);

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('ai_conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      
      setConversations(prev => prev.filter(conv => conv.id !== conversationId));
      
      if (activeConversation === conversationId) {
        setActiveConversation(null);
        setMessages([]);
      }
    } catch (error) {
      console.error('Error deleting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive"
      });
    }
  }, [activeConversation, toast]);

  // Save message to database
  const saveMessage = useCallback(async (message: EnhancedChatMessage, conversationId: string) => {
    try {
      // Ensure message type matches database constraint
      const validType = message.role === 'user' ? 'user' : 
                       message.role === 'assistant' ? 'assistant' :
                       message.role === 'system' ? 'system' : 'assistant';

      const messageData = {
        conversation_id: conversationId,
        type: validType, // Ensure valid type for database constraint
        content: message.content,
        visual_data: message.visualData ? JSON.stringify(message.visualData) : null,
        progress_indicator: message.progressIndicator ? JSON.stringify(message.progressIndicator) : null,
        workflow_context: message.workflowContext ? JSON.stringify(message.workflowContext) : null,
        function_calls: message.actions ? JSON.stringify(message.actions) : null, // Use function_calls instead of attachments
        status: 'completed'
      };

      const { error } = await supabase
        .from('ai_messages')
        .insert(messageData);
      
      if (error) {
        console.error('Database error saving message:', error);
      }
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, []);

  // Send message with enhanced features
  const sendMessage = useCallback(async (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the AI assistant",
        variant: "destructive"
      });
      return;
    }

    // Create conversation if none active
    let conversationId = activeConversation;
    if (!conversationId) {
      conversationId = await createConversation(content.slice(0, 50));
      if (!conversationId) return;
    }

    setIsLoading(true);
    setIsTyping(true);

    // Add user message
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);

    // Save user message to database
    await saveMessage(userMessage, conversationId);

    try {
      // Get enhanced AI response
      const aiResponse = await enhancedAIService.processEnhancedMessage(
        content,
        [...messages, userMessage],
        user.id
      );

      // Update messages and save AI response
      setMessages(prev => [...prev, aiResponse]);
      await saveMessage(aiResponse, conversationId);

      // Show workflow progress if this was part of a workflow
      if (aiResponse.workflowContext?.currentWorkflow) {
        toast({
          title: "Workflow Progress",
          description: `${aiResponse.workflowContext.currentWorkflow.replace(/-/g, ' ')} workflow updated`,
          duration: 1500
        });
      }

      // Update conversation title if it's the first exchange
      if (messages.length === 0) {
        const title = content.slice(0, 50) + (content.length > 50 ? '...' : '');
        await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', conversationId);
        
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, title }
              : conv
          )
        );
      }
    } catch (error) {
      console.error('Error sending enhanced message:', error);
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [messages, toast, user, activeConversation, createConversation, saveMessage]);

  const handleAction = useCallback(async (action: ContextualAction) => {
    console.log('🎬 Handling action:', action);
    
    try {
      const actionString = action.action;
      console.log('🎯 Action string:', actionString);
      
      // Log action execution for debugging
      toast({
        title: "Action Executed",
        description: `Processing: ${action.label || actionString}`,
        duration: 1000
      });
      
      if (actionString.startsWith('workflow:')) {
        const workflowAction = actionString.replace('workflow:', '');
        console.log('⚙️ Executing workflow:', workflowAction);
        await handleWorkflowAction(workflowAction, action.data);
      } else if (actionString.startsWith('send:')) {
        const message = actionString.replace('send:', '');
        console.log('💬 Sending message:', message);
        await sendMessage(message);
      } else if (actionString.startsWith('navigate:')) {
        const path = actionString.replace('navigate:', '');
        console.log('🧭 Navigating to:', path);
        // Use React Router navigation instead of window.location
        window.history.pushState({}, '', path);
        window.dispatchEvent(new PopStateEvent('popstate'));
      } else {
        // Handle action types based on patterns
        switch (actionString) {
          case 'create-blog-post':
            console.log('📝 Creating blog post');
            window.history.pushState({}, '', '/content-builder?type=blog-post');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          case 'create-landing-page':
            console.log('🏗️ Creating landing page');
            window.history.pushState({}, '', '/content-builder?type=landing-page');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          case 'keyword-research':
            console.log('🔍 Opening keyword research');
            window.history.pushState({}, '', '/research');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          case 'content-strategy':
            console.log('📊 Opening content strategy');
            window.history.pushState({}, '', '/strategies');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          case 'navigate-content-builder':
            window.history.pushState({}, '', '/content-builder');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          case 'navigate-analytics':
            window.history.pushState({}, '', '/analytics');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          case 'navigate-keyword-research':
            window.history.pushState({}, '', '/research');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          case 'navigate-strategy':
            window.history.pushState({}, '', '/strategies');
            window.dispatchEvent(new PopStateEvent('popstate'));
            break;
          default:
            console.warn('❓ Unknown action:', actionString);
            toast({
              title: "Unknown Action",
              description: `Action "${actionString}" not recognized`,
              variant: "destructive"
            });
            break;
        }
      }
    } catch (error) {
      console.error('❌ Error handling action:', error);
      toast({
        title: "Action Failed",
        description: `Failed to execute action: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [sendMessage, user, toast]);

  const handleLegacyAction = useCallback(async (action: string, data?: any) => {
    if (!user || !action) return;

    if (action.startsWith('workflow:')) {
      const workflowAction = action.replace('workflow:', '');
      await handleWorkflowAction(workflowAction, data);
    } else if (action.startsWith('send:')) {
      const message = action.replace('send:', '');
      await sendMessage(message);
    }
  }, [sendMessage, user]);

  const handleWorkflowAction = useCallback(async (workflowAction: string, data?: any) => {
    if (!user) return;

    console.log('🔄 Executing workflow action:', workflowAction);

    // Update workflow state in service
    const currentState = await enhancedAIService.getWorkflowState(user.id, workflowAction);
    const updatedData = { ...currentState?.workflowData, ...data };

    // Update workflow state with progress tracking
    await enhancedAIService.updateWorkflowState(
      user.id,
      workflowAction,
      'initiated',
      data || {}
    );

    // Show progress indicator
    toast({
      title: "Workflow Started",
      description: `Starting ${workflowAction.replace(/-/g, ' ')} workflow...`,
      duration: 2000
    });

    // Send contextual messages based on workflow action
    const workflowMessages = {
      'keyword-optimization': 'Analyze my current content and solutions to find high-impact keyword opportunities. Show me visual data on keyword gaps and optimization potential with charts and metrics.',
      'content-creation': 'Based on my solutions and target audience, help me create a high-performing content strategy with specific recommendations, visual metrics, and actionable next steps.',
      'performance-analysis': 'Show me a comprehensive performance analysis of my content with interactive charts, key metrics, trend analysis, and actionable optimization recommendations.',
      'solution-integration': 'Analyze how well my current content integrates with my solutions and show me specific opportunities to improve solution visibility and conversion with data visualization.',
      'performance-deep-dive': 'Provide a detailed deep-dive analysis of my content performance including visual charts, trend analysis, top performers, and specific optimization opportunities.',
      'content-optimization': 'Analyze my low-performing content and show optimization recommendations with before/after projections and visual improvement metrics.'
    };

    const message = workflowMessages[workflowAction as keyof typeof workflowMessages] || 
                    (data?.workflow ? `Execute the ${data.workflow} workflow and provide detailed insights with visual data and actionable recommendations.` : 
                    `Help me with ${workflowAction.replace(/-/g, ' ')} and provide visual insights and actionable recommendations.`);

    console.log('💬 Sending workflow message:', message);
    
    try {
      await sendMessage(message);
      
      // Update workflow progress
      setTimeout(async () => {
        await enhancedAIService.updateWorkflowState(
          user.id,
          workflowAction,
          'processing',
          { ...data, startedAt: Date.now() }
        );
      }, 1000);
    } catch (error) {
      console.error('❌ Workflow action failed:', error);
      toast({
        title: "Workflow Error",
        description: `Failed to execute ${workflowAction}: ${error.message}`,
        variant: "destructive"
      });
    }
  }, [sendMessage, user, toast]);

  // Pin/Unpin conversation
  const togglePinConversation = useCallback(async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const { error } = await supabase
        .from('ai_conversations')
        .update({ pinned: !conversation.pinned })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, pinned: !conv.pinned }
            : conv
        )
      );

      toast({
        title: conversation.pinned ? "Conversation unpinned" : "Conversation pinned",
        description: `Conversation has been ${conversation.pinned ? 'unpinned' : 'pinned'}`,
      });
    } catch (error) {
      console.error('Error toggling pin:', error);
      toast({
        title: "Error",
        description: "Failed to update conversation",
        variant: "destructive"
      });
    }
  }, [conversations, toast]);

  // Archive/Unarchive conversation
  const toggleArchiveConversation = useCallback(async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const { error } = await supabase
        .from('ai_conversations')
        .update({ archived: !conversation.archived })
        .eq('id', conversationId);

      if (error) throw error;

      // Remove from current list if archiving, or reload if unarchiving
      if (!conversation.archived) {
        setConversations(prev => prev.filter(conv => conv.id !== conversationId));
        if (activeConversation === conversationId) {
          setActiveConversation(null);
          setMessages([]);
        }
      } else {
        await loadConversations();
      }

      toast({
        title: conversation.archived ? "Conversation unarchived" : "Conversation archived",
        description: `Conversation has been ${conversation.archived ? 'restored' : 'archived'}`,
      });
    } catch (error) {
      console.error('Error toggling archive:', error);
      toast({
        title: "Error", 
        description: "Failed to update conversation",
        variant: "destructive"
      });
    }
  }, [conversations, activeConversation, toast, loadConversations]);

  // Add tag to conversation
  const addTagToConversation = useCallback(async (conversationId: string, tag: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const currentTags = conversation.tags || [];
      if (currentTags.includes(tag)) return;

      const newTags = [...currentTags, tag];
      
      const { error } = await supabase
        .from('ai_conversations')
        .update({ tags: newTags })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, tags: newTags }
            : conv
        )
      );
    } catch (error) {
      console.error('Error adding tag:', error);
      toast({
        title: "Error",
        description: "Failed to add tag",
        variant: "destructive"
      });
    }
  }, [conversations, toast]);

  // Remove tag from conversation
  const removeTagFromConversation = useCallback(async (conversationId: string, tag: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      const newTags = (conversation.tags || []).filter(t => t !== tag);
      
      const { error } = await supabase
        .from('ai_conversations')
        .update({ tags: newTags })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => 
        prev.map(conv => 
          conv.id === conversationId 
            ? { ...conv, tags: newTags }
            : conv
        )
      );
    } catch (error) {
      console.error('Error removing tag:', error);
      toast({
        title: "Error",
        description: "Failed to remove tag",
        variant: "destructive"
      });
    }
  }, [conversations, toast]);

  // Export conversation
  const exportConversation = useCallback(async (conversationId: string) => {
    try {
      const conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) return;

      // Load all messages for this conversation
      const { data: messagesData, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const exportData = {
        conversation: {
          title: conversation.title,
          created_at: conversation.created_at,
          updated_at: conversation.updated_at,
          tags: conversation.tags || []
        },
        messages: (messagesData || []).map(msg => ({
          role: msg.type,
          content: msg.content,
          timestamp: msg.created_at,
          visual_data: msg.visual_data && typeof msg.visual_data === 'string' ? JSON.parse(msg.visual_data) : msg.visual_data,
          actions: msg.function_calls && typeof msg.function_calls === 'string' ? JSON.parse(msg.function_calls) : msg.function_calls
        })),
        exported_at: new Date().toISOString()
      };

      // Create and download file
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${conversation.title.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export successful",
        description: "Conversation exported successfully",
      });
    } catch (error) {
      console.error('Error exporting conversation:', error);
      toast({
        title: "Error",
        description: "Failed to export conversation",
        variant: "destructive"
      });
    }
  }, [conversations, toast]);

  // Share conversation (generate shareable link)
  const shareConversation = useCallback(async (conversationId: string) => {
    try {
      const shareUrl = `${window.location.origin}/shared-conversation/${conversationId}`;
      
      if (navigator.share) {
        await navigator.share({
          title: 'AI Conversation',
          text: 'Check out this AI conversation',
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link copied",
          description: "Conversation link copied to clipboard",
        });
      }
    } catch (error) {
      console.error('Error sharing conversation:', error);
      toast({
        title: "Error",
        description: "Failed to share conversation",
        variant: "destructive"
      });
    }
  }, [toast]);

  // Search conversations
  const searchConversations = useCallback(async (term: string) => {
    setSearchTerm(term);
    await loadConversations({ search: term });
  }, [loadConversations]);

  // Clear search
  const clearSearch = useCallback(async () => {
    setSearchTerm('');
    await loadConversations();
  }, [loadConversations]);

  // Load conversations on user change
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
      setSearchTerm('');
    }
  }, [user, loadConversations]);

  // Load messages when active conversation changes
  useEffect(() => {
    if (activeConversation) {
      loadMessages(activeConversation);
    } else {
      setMessages([]);
    }
  }, [activeConversation, loadMessages]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    searchTerm,
    loadConversations,
    createConversation,
    deleteConversation,
    sendMessage,
    handleAction,
    handleLegacyAction,
    selectConversation: setActiveConversation,
    togglePinConversation,
    toggleArchiveConversation,
    addTagToConversation,
    removeTagFromConversation,
    exportConversation,
    shareConversation,
    searchConversations,
    clearSearch
  };
};