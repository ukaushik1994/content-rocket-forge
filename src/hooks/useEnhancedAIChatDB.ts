import { useState, useCallback, useEffect } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { enhancedAIService } from '@/services/enhancedAIService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export const useEnhancedAIChatDB = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Load conversations from database
  const loadConversations = useCallback(async () => {
    if (!user) return;
    
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
          // Parse attachments for actions
          if (msg.attachments && typeof msg.attachments === 'string') {
            const attachments = JSON.parse(msg.attachments);
            if (attachments.actions && Array.isArray(attachments.actions)) {
              actions = attachments.actions;
            }
          } else if (msg.function_calls) {
            actions = typeof msg.function_calls === 'string' ? JSON.parse(msg.function_calls) : msg.function_calls;
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
      const messageData = {
        conversation_id: conversationId,
        type: message.role,
        content: message.content,
        visual_data: message.visualData ? JSON.stringify(message.visualData) : null,
        progress_indicator: message.progressIndicator ? JSON.stringify(message.progressIndicator) : null,
        workflow_context: message.workflowContext ? JSON.stringify(message.workflowContext) : null,
        attachments: message.actions ? JSON.stringify({ actions: message.actions }) : null
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

  const handleAction = useCallback(async (action: string, data?: any) => {
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

    // Update workflow context in service
    enhancedAIService.updateWorkflowContext({
      currentWorkflow: workflowAction,
      stepData: { ...enhancedAIService.getWorkflowContext().stepData, ...data }
    });

    // Update workflow state in database
    await enhancedAIService.updateWorkflowState(
      user.id,
      workflowAction,
      'initiated',
      data || {}
    );

    // Send contextual messages based on workflow action
    switch (workflowAction) {
      case 'keyword-optimization':
        await sendMessage('Analyze my current content and solutions to find high-impact keyword opportunities. Show me visual data on keyword gaps and optimization potential.');
        break;
      case 'content-creation':
        await sendMessage('Based on my solutions and target audience, help me create a high-performing content strategy with specific recommendations and metrics.');
        break;
      case 'performance-analysis':
        await sendMessage('Show me a comprehensive performance analysis of my content with charts, metrics, and actionable optimization recommendations.');
        break;
      case 'solution-integration':
        await sendMessage('Analyze how well my current content integrates with my solutions and show me specific opportunities to improve solution visibility and conversion.');
        break;
      default:
        if (data?.workflow) {
          await sendMessage(`Execute the ${data.workflow} workflow and provide detailed insights with visual data.`);
        }
    }
  }, [sendMessage, user]);

  // Load conversations on user change
  useEffect(() => {
    if (user) {
      loadConversations();
    } else {
      setConversations([]);
      setActiveConversation(null);
      setMessages([]);
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
    loadConversations,
    createConversation,
    deleteConversation,
    sendMessage,
    handleAction,
    selectConversation: setActiveConversation
  };
};