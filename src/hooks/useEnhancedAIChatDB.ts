import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { enhancedAIService } from '@/services/enhancedAIService';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ContextualAction } from '@/services/aiService';
import { useNavigate } from 'react-router-dom';

// Module-level constants — single source of truth for Supabase connection
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

async function getAuthHeaders() {
  const { data: { session } } = await supabase.auth.getSession();
  const accessToken = session?.access_token || SUPABASE_KEY;
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`,
    'apikey': SUPABASE_KEY,
  };
}
import { detectActionIntent, detectAIResponseIntent, detectContextualContentIntent } from '@/utils/actionIntentDetector';
import { getUserPreferences } from '@/services/conversationMemory';

export interface AIConversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
  pinned?: boolean;
  archived?: boolean;
  tags?: string[];
  goal?: string | null;
}

export const useEnhancedAIChatDB = () => {
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    toolName: string;
    originalMessage: string;
    conversationId: string;
    conversationHistory: Array<{ role: string; content: string }>;
  } | null>(null);
  const analystActiveRef = useRef(false);
  const freshConversationRef = useRef<string | null>(null);
  const justCreatedConversationRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const messagesRef = useRef<EnhancedChatMessage[]>([]);
  const isSendingRef = useRef(false);
  const isEditingRef = useRef(false);
  const loadRequestRef = useRef(0);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Keep messagesRef in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);

  // Listen for abort requests from the UI stop button
  useEffect(() => {
    const handler = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    window.addEventListener('abortAIRequest', handler);
    return () => window.removeEventListener('abortAIRequest', handler);
  }, []);

  // Load conversations from database with search and filter support
  const loadConversations = useCallback(async (options?: {
    search?: string;
    includeArchived?: boolean;
  }) => {
    if (!user) return;
    
    try {
      // Auto-cleanup empty conversations on full load (no search active)
      if (!options?.search) {
        const activeId = activeConversation;
        
        // Get all conversation IDs for this user
        const { data: allConvs } = await supabase
          .from('ai_conversations')
          .select('id')
          .eq('user_id', user.id);
        
        if (allConvs && allConvs.length > 0) {
          // Get conversation IDs that have at least one message
          const { data: withMessages } = await supabase
            .from('ai_messages')
            .select('conversation_id')
            .in('conversation_id', allConvs.map(c => c.id));
          
          const idsWithMessages = new Set((withMessages || []).map(m => m.conversation_id));
          const emptyIds = allConvs
            .map(c => c.id)
            .filter(id => !idsWithMessages.has(id) && id !== activeId);
          
          if (emptyIds.length > 0) {
            await supabase
              .from('ai_conversations')
              .delete()
              .in('id', emptyIds);
          }
        }
      }

      let query = supabase
        .from('ai_conversations')
        .select('*')
        .eq('user_id', user.id)
        .is('deleted_at', null);

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
    const requestId = ++loadRequestRef.current;
    try {
      const { data, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      
      // Ignore stale results if conversation changed during fetch
      if (loadRequestRef.current !== requestId) return;
      
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
          messageStatus: msg.status === 'error' ? 'error' as const : undefined,
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
      freshConversationRef.current = data.id;
      justCreatedConversationRef.current = true;
      
      // Local state already updated above — no redundant refetch needed
      
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

  // Delete conversation
  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      // Soft delete: set deleted_at instead of hard deleting
      const { error } = await supabase
        .from('ai_conversations')
        .update({ deleted_at: new Date().toISOString() } as any)
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
        status: message.messageStatus === 'error' ? 'error' : 'completed'
      };

      const { data: insertedData, error } = await supabase
        .from('ai_messages')
        .insert(messageData)
        .select('id')
        .single();
      
      if (error) {
        console.error('Database error saving message:', error);
        return null;
      }
      
      // Return the DB-generated UUID so callers can update local state
      return insertedData?.id || null;
    } catch (error) {
      console.error('Error saving message:', error);
    }
  }, []);

  // Execute tool action via enhanced-ai-chat
  const executeToolAction = useCallback(async (
    conversationForTools: Array<{ role: string; content: string }>,
    conversationId: string,
    toolName: string
  ) => {
    const executingId = `action-${Date.now()}`;
    const executingMessage: EnhancedChatMessage = {
      id: executingId,
      role: 'assistant',
      content: `⚙️ Executing: ${toolName.replace(/_/g, ' ')}...`,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, executingMessage]);
    setIsTyping(true);
    setProgressText('Executing action...');

    try {
      // Use SSE fetch pattern (same as sendMessage) for progress + timeout protection
      const headers = await getAuthHeaders();

      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const timeoutId = setTimeout(() => abortController.abort(), 90000);

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/enhanced-ai-chat`, {
        method: 'POST',
        signal: abortController.signal,
        headers,
        body: JSON.stringify({
          messages: conversationForTools,
          context: { conversation_id: conversationId },
          stream: true
        })
      });

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || errData.message || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let toolResponse: any = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          const lines = textBuffer.split('\n');
          textBuffer = lines.pop() || '';

          let currentEvent = '';
          for (const line of lines) {
            const trimmed = line.replace(/\r$/, '');
            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.slice(7).trim();
            } else if (trimmed.startsWith('data: ') && currentEvent) {
              try {
                const payload = JSON.parse(trimmed.slice(6));
                if (currentEvent === 'progress') {
                  setProgressText(payload.message || 'Processing...');
                } else if (currentEvent === 'done') {
                  toolResponse = payload;
                } else if (currentEvent === 'error') {
                  throw new Error(payload.error || payload.message || 'Tool execution failed');
                }
              } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
              }
              currentEvent = '';
            }
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // Fallback: try plain JSON
      if (!toolResponse && textBuffer.trim()) {
        try { toolResponse = JSON.parse(textBuffer.trim()); } catch (_) {}
      }

      if (!toolResponse) throw new Error('No response received from tool execution');

      const toolContent = toolResponse?.content || toolResponse?.message || 'Action completed.';
      const toolActions = toolResponse?.actions || [];
      const toolVisualData = toolResponse?.visualData;

      const actionResultMessage: EnhancedChatMessage = {
        id: executingId,
        role: 'assistant',
        content: toolContent,
        timestamp: new Date(),
        actions: toolActions,
        visualData: toolVisualData,
      };

      setMessages(prev =>
        prev.map(m => m.id === executingId ? actionResultMessage : m)
      );
      setIsTyping(false);
      setProgressText('');
      await saveMessage(actionResultMessage, conversationId);
    } catch (toolExecError: any) {
      console.error('❌ Tool execution failed:', toolExecError);
      const isTimeout = toolExecError?.name === 'AbortError';
      const errorMessage: EnhancedChatMessage = {
        id: executingId,
        role: 'assistant',
        content: isTimeout
          ? '⏱️ Action timed out. Please try again.'
          : `❌ Action failed: ${toolExecError.message || 'Could not execute the requested action.'}`,
        timestamp: new Date(),
        messageStatus: 'error',
      };
      setMessages(prev =>
        prev.map(m => m.id === executingId ? errorMessage : m)
      );
      setIsTyping(false);
      setProgressText('');
    }
  }, [saveMessage]);

  // Handle confirmation button clicks (from ActionConfirmationCard)
  const handleConfirmAction = useCallback(async (confirmationMsgId: string) => {
    if (!pendingConfirmation) return;
    const { conversationHistory, conversationId: confConvId, toolName } = pendingConfirmation;
    setPendingConfirmation(null);

    // Remove the confirmation card message
    setMessages(prev => prev.filter(m => m.id !== confirmationMsgId));

    const confirmedHistory = [
      ...conversationHistory,
      { role: 'user' as const, content: `CONFIRMED: Execute ${toolName}` }
    ];
    await executeToolAction(confirmedHistory, confConvId, toolName);
  }, [pendingConfirmation, executeToolAction]);

  const handleCancelAction = useCallback(async (confirmationMsgId: string) => {
    setPendingConfirmation(null);
    // Replace card with cancelled note
    setMessages(prev =>
      prev.map(m => m.id === confirmationMsgId
        ? { ...m, content: '🚫 Action cancelled.', confirmationData: undefined }
        : m
      )
    );
  }, []);

  // Send message with streaming SSE support + fallback to blocking
  const sendMessage = useCallback(async (content: string, displayContent?: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the AI assistant",
        variant: "destructive"
      });
      return;
    }

    // Prevent rapid-fire messages — block while AI is still responding
    if (isSendingRef.current) {
      toast({
        title: "Please wait",
        description: "The AI is still processing your previous message",
      });
      return;
    }
    isSendingRef.current = true;

    // Handle /help command
    const trimmedLower = content.trim().toLowerCase();
    if (trimmedLower === '/help' || trimmedLower === 'what can you do' || trimmedLower === 'what can you do?') {
      // Create conversation if needed
      let conversationId = activeConversation;
      if (!conversationId) {
        conversationId = await createConversation('Capabilities');
        if (!conversationId) {
          toast({ title: "Error", description: "Failed to create conversation. Please try again.", variant: "destructive" });
          return;
        }
      }

      const userMsg: EnhancedChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: displayContent || content,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, userMsg]);
      await saveMessage(userMsg, conversationId);

      const helpMsg: EnhancedChatMessage = {
        id: `help-${Date.now()}`,
        role: 'assistant',
        content: '__CAPABILITIES_CARD__',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, helpMsg]);
      await saveMessage(helpMsg, conversationId);
      return;
    }

    // Create conversation if none active
    let conversationId = activeConversation;
    if (!conversationId) {
      conversationId = await createConversation((displayContent || content).slice(0, 50));
      if (!conversationId) {
        toast.error('Failed to create conversation. Please try again.');
        return;
      }
    }

    setIsLoading(true);
    setIsTyping(true);

    // Add user message
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: displayContent || content,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userDbId = await saveMessage(userMessage, conversationId);
    if (userDbId) {
      setMessages(prev => prev.map(m => m.id === userMessage.id ? { ...m, id: userDbId } : m));
    }

    // Phase 1: Learn from user message patterns (non-blocking)
    try {
      const msgLower = (displayContent || content).toLowerCase();
      const { learnUserPreference } = await import('@/services/conversationMemory');
      if (/shorter|concise|brief|too long/i.test(msgLower)) {
        learnUserPreference('preferred_length', 'short', activeConversation || undefined, 0.6);
      } else if (/more detail|elaborate|expand|longer/i.test(msgLower)) {
        learnUserPreference('preferred_length', 'long', activeConversation || undefined, 0.6);
      }
      if (/casual|informal|friendly/i.test(msgLower)) {
        learnUserPreference('preferred_tone', 'casual', activeConversation || undefined, 0.6);
      } else if (/formal|professional|corporate/i.test(msgLower)) {
        learnUserPreference('preferred_tone', 'formal', activeConversation || undefined, 0.6);
      }
      if (/bullet|list|points/i.test(msgLower)) {
        learnUserPreference('preferred_format', 'bullet_points', activeConversation || undefined, 0.6);
      } else if (/no chart|just text|plain text/i.test(msgLower)) {
        learnUserPreference('preferred_format', 'text_only', activeConversation || undefined, 0.6);
      }
    } catch (_) { /* non-blocking */ }

    // Track assistant message ID for later insertion (no placeholder in messages array)
    const assistantId = `assistant-${Date.now()}`;
    setProgressText('');

    // Auto-name conversation early (before AI call) — await to prevent race condition
    if (messages.length === 0 && conversationId) {
      const rawTitle = content.slice(0, 50);
      const title = rawTitle.length > 40
        ? rawTitle.slice(0, rawTitle.lastIndexOf(' ', 40) || 40) + '...'
        : rawTitle;
      try {
        const { error: titleError } = await supabase
          .from('ai_conversations')
          .update({ title })
          .eq('id', conversationId);
        if (!titleError) {
          setConversations(prev => 
            prev.map(conv => 
              conv.id === conversationId 
                ? { ...conv, title }
                : conv
            )
          );
        }
      } catch (titleErr) {
        console.warn('Failed to update conversation title:', titleErr);
      }

      // Auto-detect conversation goal from first message
      try {
        let goal: string | null = null;
        const cl = content.toLowerCase();
        if (/write|create|generate|draft/i.test(cl) && /blog|article|post|content/i.test(cl)) goal = 'Content Creation';
        else if (/keyword|seo|rank|serp/i.test(cl)) goal = 'SEO Research';
        else if (/email|campaign|send|newsletter/i.test(cl)) goal = 'Email Campaign';
        else if (/strategy|plan|roadmap/i.test(cl)) goal = 'Strategy Planning';
        else if (/analyz|metric|performance|report/i.test(cl)) goal = 'Performance Analysis';
        else if (/competitor|market|benchmark/i.test(cl)) goal = 'Competitive Analysis';
        
        if (goal) {
          await supabase
            .from('ai_conversations')
            .update({ goal } as any)
            .eq('id', conversationId);
        }
      } catch (goalErr) {
        console.warn('Failed to set conversation goal:', goalErr);
      }
    }

    try {
      // Smart context: keep first message (original intent) + last 9 messages
      const allMessages = [...messagesRef.current, userMessage];
      let conversationHistory: Array<{ role: string; content: string }>;
      if (allMessages.length <= 10) {
        conversationHistory = allMessages.map(m => ({ role: m.role, content: m.content }));
      } else {
        const first = allMessages[0];
        const recent = allMessages.slice(-9);
        conversationHistory = [first, ...recent].map(m => ({ role: m.role, content: m.content }));
      }

      // Enrich context with conversation memory (non-blocking, graceful fallback)
      try {
        const prefs = await getUserPreferences();
        if (prefs.length > 0) {
          const highConfPrefs = prefs.filter(p => p.confidenceScore >= 0.4).slice(0, 8);
          if (highConfPrefs.length > 0) {
            const prefSummary = highConfPrefs
              .map(p => `${p.preferenceType}: ${typeof p.preferenceValue === 'string' ? p.preferenceValue : JSON.stringify(p.preferenceValue)}`)
              .join('; ');
            conversationHistory.unshift({
              role: 'system',
              content: `[User memory context] Known preferences: ${prefSummary}`
            });
          }
        }
      } catch (memoryError) {
        console.warn('⚠️ Conversation memory enrichment failed (non-critical):', memoryError);
      }

      // C1: Refresh session before sending to prevent stale token errors
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData?.session) {
          const expiresAt = sessionData.session.expires_at || 0;
          const nowSecs = Math.floor(Date.now() / 1000);
          if (expiresAt - nowSecs < 300) {
            await supabase.auth.refreshSession();
          }
        }
      } catch (_refreshErr) {
        console.warn('⚠️ Session refresh failed (non-critical):', _refreshErr);
      }

      // SSE streaming: use fetch() with AbortController for timeout
      const headers = await getAuthHeaders();

      // Cancel any in-flight request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const timeoutId = setTimeout(() => abortController.abort(), 90000); // 90s timeout

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/enhanced-ai-chat`, {
        method: 'POST',
        signal: abortController.signal,
        headers,
        body: JSON.stringify({
          messages: conversationHistory,
          context: { 
            conversation_id: conversationId, 
            analystActive: analystActiveRef.current,
            // Phase 4: Pass analyst state summary to backend
            analystSummary: (window as any).__analystSummary || null,
          },
          stream: true
        })
      });
      // Don't clear timeout here — wait until stream reading is complete

      if (!resp.ok || !resp.body) {
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || errData.message || `HTTP ${resp.status}`);
      }

      // Parse SSE events
      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let response: any = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });

          const lines = textBuffer.split('\n');
          textBuffer = lines.pop() || '';

          let currentEvent = '';
          for (const line of lines) {
            const trimmed = line.replace(/\r$/, '');
            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.slice(7).trim();
            } else if (trimmed.startsWith('data: ') && currentEvent) {
              try {
                const payload = JSON.parse(trimmed.slice(6));
                if (currentEvent === 'progress') {
                  setProgressText(payload.message || 'Processing...');
                } else if (currentEvent === 'done') {
                  response = payload;
                } else if (currentEvent === 'error') {
                  throw new Error(payload.error || payload.message || 'AI processing failed');
                }
              } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
              }
              currentEvent = '';
            }
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }

      // Safety net: if no SSE 'done' event found, try parsing full buffer as plain JSON
      if (!response && textBuffer.trim()) {
        try {
          response = JSON.parse(textBuffer.trim());
          console.log('⚠️ Parsed response from plain JSON fallback');
        } catch (_) { /* not valid JSON */ }
      }

      // C2: Handle empty response — update assistant bubble with error instead of blank
      if (!response) {
        const emptyMsg: EnhancedChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: '⚠️ Connection lost — no response received from the AI service. Please check your internet connection and try again.',
          timestamp: new Date(),
          messageStatus: 'error',
          actions: [
            {
              id: 'retry-' + assistantId,
              type: 'button' as const,
              label: '🔄 Retry',
              action: 'send_message',
              data: { message: content }
            }
          ]
        };
        setMessages(prev => prev.map(m => m.id === assistantId ? emptyMsg : m));
        if (conversationId) {
          await saveMessage(emptyMsg, conversationId);
        }
        return;
      }

      const responseContent = response?.message || response?.content || 'No response received';
      const responseActions = response?.actions || [];
      const responseVisualData = response?.visualData;
      const responseAnalystContext = response?.analystContext;

      // Check if response contains a confirmation action from destructive tool guard
      const confirmAction = responseActions.find((a: any) => a.action === 'confirm_action');
      const confirmationData = confirmAction ? {
        toolName: confirmAction.data?.action || 'unknown',
        originalMessage: content,
      } : undefined;

      // If confirmation needed, store pending state for handler
      if (confirmationData) {
        setPendingConfirmation({
          toolName: confirmationData.toolName,
          originalMessage: content,
          conversationId: conversationId!,
          conversationHistory,
        });
      }

      const finalMessage: EnhancedChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: confirmationData ? '' : responseContent,
        timestamp: new Date(),
        actions: responseActions.filter((a: any) => a.action !== 'confirm_action'),
        visualData: responseVisualData,
        analystContext: responseAnalystContext,
        confirmationData,
      };

      setMessages(prev => [...prev, finalMessage]);
      const assistantDbId = await saveMessage(finalMessage, conversationId);
      if (assistantDbId) {
        setMessages(prev => prev.map(m => m.id === finalMessage.id ? { ...m, id: assistantDbId } : m));
      }

      // Phase 3 Fix 9: Auto-update conversation title from suggestedTitle
      const suggestedTitle = response?.suggestedTitle;
      if (suggestedTitle && conversationId) {
        try {
          const currentConv = conversations.find(c => c.id === conversationId);
          const isDefaultTitle = currentConv?.title?.endsWith('...') || (currentConv?.title?.length || 0) <= 50;
          if (isDefaultTitle) {
            await supabase.from('ai_conversations').update({ title: suggestedTitle }).eq('id', conversationId);
            setConversations(prev => prev.map(c => c.id === conversationId ? { ...c, title: suggestedTitle } : c));
          }
        } catch (_) { /* non-blocking */ }
      }

      // Phase 3: Auto-update conversation goal when topic shifts
      const responseContentLower = (responseContent || '').toLowerCase();
      let detectedGoal: string | null = null;
      if (conversationId && messages.length >= 4) {
        try {
          if (/email|campaign|newsletter/.test(responseContentLower) && !/content|article|blog/.test(responseContentLower)) detectedGoal = 'Email Campaign';
          else if (/keyword|seo|rank|serp/.test(responseContentLower) && !/write|create|draft/.test(responseContentLower)) detectedGoal = 'SEO Research';
          else if (/competitor|swot|market position/.test(responseContentLower)) detectedGoal = 'Competitive Analysis';
          
          if (detectedGoal) {
            const currentConv = conversations.find(c => c.id === conversationId);
            if (currentConv && currentConv.goal !== detectedGoal) {
              await supabase.from('ai_conversations').update({ goal: detectedGoal } as any).eq('id', conversationId);
            }
          }
        } catch (_) { /* non-blocking */ }
      }

      // Phase 4: Refresh analyst after mutations
      const mutationKeywords = /\b(Created|Deleted|Published|Scheduled|Sent|Updated|Generated|Approved|Rejected)\b/;
      if (mutationKeywords.test(responseContent)) {
        setTimeout(() => {
          // Trigger analyst refresh via custom event
          window.dispatchEvent(new CustomEvent('refreshAnalyst'));
        }, 2000);
      }

      // Phase 5A: Record learned patterns after assistant response (non-blocking)
      try {
        const { recordLearnedPattern } = await import('@/services/conversationMemory');
        const actionMatch = responseContent.match(/\b(Created|Published|Generated|Scheduled|Sent)\b/);
        if (actionMatch) {
          recordLearnedPattern('frequent_action', { action: actionMatch[1] });
        }
        if (detectedGoal) {
          recordLearnedPattern('conversation_topic', { topic: detectedGoal });
        }
      } catch (_) { /* non-blocking */ }

      // Title already set early (line 392-408) — no duplicate update needed
    } catch (error: any) {
      console.error('Error sending enhanced message:', error);
      
      const isTimeout = error?.name === 'AbortError';
      const errorMsg = error?.message || '';
      const isRateLimit = errorMsg.includes('429') || errorMsg.toLowerCase().includes('rate limit');
      const isContextLength = errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('context length');
      const isNoProvider = errorMsg.includes('400') || errorMsg.toLowerCase().includes('no ai provider') || errorMsg.toLowerCase().includes('api key');
      
      // C1: No AI provider — direct user to settings
      if (isNoProvider && !isRateLimit) {
        const providerMsg: EnhancedChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: '⚙️ No AI provider configured. Please go to **Settings → API Keys** and add your API key to start chatting.',
          timestamp: new Date(),
          messageStatus: 'error',
          actions: [
            {
              id: 'settings-' + assistantId,
              type: 'button' as const,
              label: '⚙️ Open API Settings',
              action: 'open_settings',
              data: { tab: 'api' }
            }
          ]
        };
        setMessages(prev => [...prev.filter(m => m.id !== assistantId), providerMsg]);
        if (conversationId) {
          await saveMessage(providerMsg, conversationId);
        }
        return;
      }

      // Auto-retry on rate limit
      if (isRateLimit) {
        const retryMsg: EnhancedChatMessage = {
          id: assistantId,
          role: 'assistant',
          content: '⏳ Rate limited by AI provider. Automatically retrying in 30 seconds...',
          timestamp: new Date(),
          actions: [
            {
              id: 'retry-now-' + assistantId,
              type: 'button' as const,
              label: '🔄 Retry Now',
              action: 'send_message',
              data: { message: content }
            },
            {
              id: 'cancel-retry-' + assistantId,
              type: 'button' as const,
              label: '✕ Cancel',
              action: 'dismiss',
              data: {}
            }
          ]
        };
        setMessages(prev => [...prev.filter(m => m.id !== assistantId), retryMsg]);
        
        // Auto-retry after 30s
        const retryTimer = setTimeout(() => {
          setMessages(prev => prev.filter(m => m.id !== assistantId));
          sendMessage(content, activeConversation || undefined);
        }, 30000);
        
        // Store timer for cleanup
        (window as any).__rateLimitRetryTimer = retryTimer;
        return;
      }

      const errorContent = isTimeout
        ? "The request timed out. The AI might be processing a complex query. You can retry or check your API key settings."
        : isContextLength
        ? "This conversation is too long for the AI model's context window. Please start a new conversation to continue."
        : "I wasn't able to process your request. This could be due to a missing API key or a temporary service issue. You can retry or check your API key settings.";
      
      const errorActions = [
        {
          id: 'retry-' + assistantId,
          type: 'button' as const,
          label: '🔄 Retry',
          action: 'send_message',
          data: { message: content }
        },
        {
          id: 'settings-' + assistantId,
          type: 'button' as const,
          label: '⚙️ API Settings',
          action: 'open_settings',
          data: { tab: 'api' }
        }
      ];

      const errorMessage: EnhancedChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: errorContent,
        timestamp: new Date(),
        messageStatus: 'error',
        actions: errorActions
      };
      setMessages(prev => [...prev, errorMessage]);

      // Persist error message to DB so it survives reload
      if (conversationId) {
        await saveMessage(errorMessage, conversationId);
      }
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setProgressText('');
      isSendingRef.current = false;
    }
  }, [messages, toast, user, activeConversation, createConversation, saveMessage, executeToolAction]);

  const handleAction = useCallback(async (action: ContextualAction) => {
    console.log('🎬 Handling action:', action);
    
    try {
      // Handle send_message action for deep dive questions
      if (action.action === 'send_message' && action.data?.message) {
        console.log('💬 Sending deep dive message:', action.data.message);
        await sendMessage(action.data.message);
        return;
      }
      
      const actionString = action.action;
      console.log('🎯 Action string:', actionString);
      
      // Only show toast for workflow actions, not for navigation/deep-dive
      
      if (actionString.startsWith('workflow:')) {
        const workflowAction = actionString.replace('workflow:', '');
        console.log('⚙️ Executing workflow:', workflowAction);
        toast({ title: "Workflow Started", description: `Processing: ${action.label || workflowAction}`, duration: 2000 });
        await handleWorkflowAction(workflowAction, action.data);
      } else if (actionString.startsWith('send:')) {
        const message = actionString.replace('send:', '');
        console.log('💬 Sending message:', message);
        await sendMessage(message);
      } else if (actionString.startsWith('navigate:')) {
        const path = actionString.replace('navigate:', '');
        console.log('🧭 Navigating to:', path);
        navigate(path);
      } else {
        // Handle action types based on patterns
        switch (actionString) {
          case 'open_settings':
            window.dispatchEvent(new CustomEvent('openSettings', { detail: { tab: action.data?.tab || 'api' } }));
            break;
          case 'create-blog-post':
            console.log('📝 Creating blog post');
            navigate('/repository');
            break;
          case 'create-landing-page':
            console.log('🏗️ Creating landing page');
            navigate('/repository');
            break;
          case 'keyword-research':
            console.log('🔍 Opening keyword research');
            navigate('/keywords');
            break;
          case 'content-strategy':
            console.log('📊 Opening content strategy');
            navigate('/ai-chat');
            break;
          case 'navigate-content-builder':
            navigate('/ai-chat');
            break;
          case 'navigate-analytics':
            navigate('/analytics');
            break;
          case 'navigate-keyword-research':
            navigate('/keywords');
            break;
          case 'navigate-strategy':
            navigate('/ai-chat');
            break;
          case 'confirm_action':
            const confirmedMsg = `CONFIRMED: Execute ${action.data?.action || action.label || 'action'} with params: ${JSON.stringify(action.data?.args || action.data || {})}`;
            await sendMessage(confirmedMsg);
            break;
          default:
            // Convert unknown actions into chat follow-up messages instead of showing error
            console.warn('❓ Unknown action, converting to chat message:', actionString);
            const fallbackMessage = action.data?.message || `Help me with: ${action.label || actionString}`;
            await sendMessage(fallbackMessage);
            break;
        }
      }
    } catch (error) {
      console.error('❌ Error handling action:', error);
      toast({
        title: "Action Failed",
        description: `Failed to execute action: ${(error as Error).message || String(error)}`,
        variant: "destructive"
      });
    }
  }, [sendMessage, user, toast, navigate]);

  const handleLegacyAction = useCallback(async (action: string, data?: any) => {
    if (!user || !action) return;

    if (action.startsWith('workflow:')) {
      const workflowAction = action.replace('workflow:', '');
      await handleWorkflowAction(workflowAction, data);
    } else if (action.startsWith('send:')) {
      const message = action.replace('send:', '');
      const displayText = data?.displayText || message;
      await sendMessage(message, displayText);
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
        description: `Failed to execute ${workflowAction}: ${(error as Error).message || String(error)}`,
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

  // Rename conversation
  const renameConversation = useCallback(async (conversationId: string, newTitle: string) => {
    // Guard against empty string rename
    if (!newTitle.trim()) {
      toast({ title: "Invalid name", description: "Conversation name cannot be empty", variant: "destructive" });
      return;
    }

    try {
      const { error } = await supabase
        .from('ai_conversations')
        .update({ title: newTitle.trim() })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.map(conv =>
        conv.id === conversationId ? { ...conv, title: newTitle.trim() } : conv
      ));

      toast({ title: "Renamed", description: "Conversation renamed successfully" });
    } catch (error) {
      console.error('Error renaming conversation:', error);
      toast({ title: "Error", description: "Failed to rename conversation", variant: "destructive" });
    }
  }, [toast]);

  // Export conversation (supports JSON, TXT, and Markdown)
  const exportConversation = useCallback(async (conversationId: string, format: 'json' | 'txt' | 'markdown' = 'json') => {
    try {
      let conversation = conversations.find(c => c.id === conversationId);
      if (!conversation) {
        // Fallback: fetch from Supabase if not in local state
        const { data: convData } = await supabase
          .from('ai_conversations')
          .select('*')
          .eq('id', conversationId)
          .maybeSingle();
        if (!convData) {
          toast({ title: "Export failed", description: "Conversation not found", variant: "destructive" });
          return;
        }
        conversation = {
          id: convData.id,
          title: convData.title || 'Untitled',
          created_at: convData.created_at,
          updated_at: convData.updated_at,
          pinned: convData.pinned ?? false,
          archived: convData.archived ?? false,
          tags: convData.tags ?? [],
        };
      }

      // Load all messages for this conversation
      const { data: messagesData, error } = await supabase
        .from('ai_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Guard against exporting empty conversations
      if (!messagesData || messagesData.length === 0) {
        toast({ title: "Nothing to export", description: "This conversation has no messages yet" });
        return;
      }

      const safeTitle = conversation.title.replace(/[^a-z0-9]/gi, '_');

      const downloadFile = (blob: Blob, filename: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      };

      if (format === 'markdown') {
        const lines = [`# ${conversation.title}`, '', `> Exported: ${new Date().toLocaleString()}`, '---', ''];
        (messagesData || []).forEach(msg => {
          const role = msg.type === 'user' ? '**You**' : '**AI**';
          lines.push(`### ${role} — _${new Date(msg.created_at).toLocaleString()}_`);
          lines.push('');
          lines.push(msg.content);
          lines.push('');
          lines.push('---');
          lines.push('');
        });
        downloadFile(new Blob([lines.join('\n')], { type: 'text/markdown' }), `conversation-${safeTitle}.md`);
      } else if (format === 'txt') {
        const lines = [`# ${conversation.title}`, `Exported: ${new Date().toLocaleString()}`, ''];
        (messagesData || []).forEach(msg => {
          const role = msg.type === 'user' ? 'You' : 'AI';
          lines.push(`[${role}] ${new Date(msg.created_at).toLocaleString()}`);
          lines.push(msg.content);
          lines.push('');
        });
        downloadFile(new Blob([lines.join('\n')], { type: 'text/plain' }), `conversation-${safeTitle}.txt`);
      } else {
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

        downloadFile(new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' }), `conversation-${safeTitle}.json`);
      }

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

  // Share conversation with secure token-based sharing
  const shareConversation = useCallback(async (conversationId: string) => {
    try {
      // Check if conversation already has a share token
      const { data: conv } = await supabase
        .from('ai_conversations')
        .select('share_token, is_shared')
        .eq('id', conversationId)
        .single();

      let shareToken = conv?.share_token;

      if (!shareToken || !conv?.is_shared) {
        // Generate a new share token
        shareToken = crypto.randomUUID().replace(/-/g, '') + crypto.randomUUID().replace(/-/g, '');
        
        const { error: updateError } = await supabase
          .from('ai_conversations')
          .update({ is_shared: true, share_token: shareToken })
          .eq('id', conversationId);

        if (updateError) throw updateError;
      }

      const shareUrl = `${window.location.origin}/shared-conversation/${shareToken}`;
      
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
          description: "Conversation share link copied to clipboard",
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

  // Edit message (within 5-minute window) — regenerates AI response inline (no duplicate)
  const editMessage = useCallback(async (messageId: string, newContent: string) => {
    if (!user) return;
    
    // Prevent rapid double-edit race condition
    if (isEditingRef.current) {
      toast({
        title: "Please wait",
        description: "An edit is already in progress",
      });
      return;
    }
    isEditingRef.current = true;
    
    // Enforce 5-minute edit window
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    
    const msgTime = new Date(msg.timestamp).getTime();
    const fiveMinutes = 5 * 60 * 1000;
    if (Date.now() - msgTime > fiveMinutes) {
      toast({
        title: "Edit window expired",
        description: "Messages can only be edited within 5 minutes of sending.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // 1. Update message in DB
      const { error } = await supabase
        .from('ai_messages')
        .update({ content: newContent })
        .eq('id', messageId);
      if (error) throw error;

      // 2. Find and delete the subsequent assistant message
      const msgIndex = messages.findIndex(m => m.id === messageId);
      const nextAssistant = msgIndex >= 0 ? messages[msgIndex + 1] : null;
      
      if (nextAssistant && nextAssistant.role === 'assistant') {
        await supabase.from('ai_messages').delete().eq('id', nextAssistant.id);
      }

      // 3. Build updated messages array with edited content and without the old assistant response
      const updatedMessages = messages
        .filter(m => !(nextAssistant && nextAssistant.role === 'assistant' && m.id === nextAssistant.id))
        .map(m => m.id === messageId ? { ...m, content: newContent } : m);
      
      setMessages(updatedMessages);

      // 4. Build conversation history from updated messages up to and including the edited message
      const historyUpToEdit = updatedMessages
        .slice(0, updatedMessages.findIndex(m => m.id === messageId) + 1)
        .map(m => ({ role: m.role, content: m.content }));

      // 5. Re-trigger AI inline — reuse the SSE fetch logic without creating a new user message
      setIsLoading(true);
      setIsTyping(true);
      setProgressText('');

      const conversationId = activeConversation;
      if (!conversationId) throw new Error('No active conversation');

      const headers = await getAuthHeaders();

      if (abortControllerRef.current) abortControllerRef.current.abort();
      const abortController = new AbortController();
      abortControllerRef.current = abortController;
      const timeoutId = setTimeout(() => abortController.abort(), 90000);

      const resp = await fetch(`${SUPABASE_URL}/functions/v1/enhanced-ai-chat`, {
        method: 'POST',
        signal: abortController.signal,
        headers,
        body: JSON.stringify({
          messages: historyUpToEdit,
          context: { conversation_id: conversationId, analystActive: analystActiveRef.current },
          stream: true
        })
      });

      if (!resp.ok || !resp.body) {
        clearTimeout(timeoutId);
        const errData = await resp.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(errData.error || errData.message || `HTTP ${resp.status}`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let response: any = null;

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          textBuffer += decoder.decode(value, { stream: true });
          const lines = textBuffer.split('\n');
          textBuffer = lines.pop() || '';
          let currentEvent = '';
          for (const line of lines) {
            const trimmed = line.replace(/\r$/, '');
            if (trimmed.startsWith('event: ')) {
              currentEvent = trimmed.slice(7).trim();
            } else if (trimmed.startsWith('data: ') && currentEvent) {
              try {
                const payload = JSON.parse(trimmed.slice(6));
                if (currentEvent === 'progress') setProgressText(payload.message || 'Processing...');
                else if (currentEvent === 'done') response = payload;
                else if (currentEvent === 'error') throw new Error(payload.error || payload.message || 'AI processing failed');
              } catch (e) {
                if (e instanceof SyntaxError) continue;
                throw e;
              }
              currentEvent = '';
            }
          }
        }
      } finally {
        clearTimeout(timeoutId);
      }

      if (!response && textBuffer.trim()) {
        try { response = JSON.parse(textBuffer.trim()); } catch (_) {}
      }
      if (!response) throw new Error('No response received from AI');

      const responseContent = response?.message || response?.content || 'No response received';
      const responseActions = response?.actions || [];
      const responseVisualData = response?.visualData;

      const assistantId = `assistant-edit-${Date.now()}`;
      const newAssistantMsg: EnhancedChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: responseContent,
        timestamp: new Date(),
        actions: responseActions,
        visualData: responseVisualData,
      };

      // Insert assistant message right after the edited message
      setMessages(prev => {
        const editIdx = prev.findIndex(m => m.id === messageId);
        if (editIdx === -1) return [...prev, newAssistantMsg];
        const before = prev.slice(0, editIdx + 1);
        const after = prev.slice(editIdx + 1);
        return [...before, newAssistantMsg, ...after];
      });

      const assistantDbId = await saveMessage(newAssistantMsg, conversationId);
      if (assistantDbId) {
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, id: assistantDbId } : m));
      }
    } catch (error) {
      console.error('Error editing message:', error);
      toast({
        title: "Error",
        description: "Failed to edit message.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      setProgressText('');
      isEditingRef.current = false;
    }
  }, [user, toast, messages, activeConversation, saveMessage]);

  // Delete message — also removes orphaned assistant response if deleting a user message
  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user) return;
    
    try {
      // Check if we need to also delete an orphaned assistant reply
      const currentMessages = messagesRef.current;
      const idx = currentMessages.findIndex(m => m.id === messageId);
      const targetMsg = idx >= 0 ? currentMessages[idx] : null;
      const nextMsg = idx >= 0 && idx < currentMessages.length - 1 ? currentMessages[idx + 1] : null;

      const idsToDelete = [messageId];
      if (targetMsg?.role === 'user' && nextMsg?.role === 'assistant') {
        idsToDelete.push(nextMsg.id);
      }

      // Single DB call to delete one or both messages
      const { error } = await supabase
        .from('ai_messages')
        .delete()
        .in('id', idsToDelete);

      if (error) throw error;

      // Update local state
      const deleteSet = new Set(idsToDelete);
      setMessages(prev => prev.filter(msg => !deleteSet.has(msg.id)));

      toast({
        title: "Message Deleted",
        description: idsToDelete.length > 1
          ? "Your message and its AI response have been removed."
          : "Your message has been removed."
      });
    } catch (error) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: "Failed to delete message.",
        variant: "destructive"
      });
      throw error;
    }
  }, [user, toast]);

  // Feedback on AI messages (thumbs up/down)
  const handleFeedback = useCallback(async (messageId: string, helpful: boolean) => {
    if (!user) return;
    try {
      // Toggle: if same value, clear it
      const msg = messages.find(m => m.id === messageId);
      const currentVal = (msg as any)?.feedbackHelpful;
      const newVal = currentVal === helpful ? null : helpful;

      await supabase
        .from('ai_messages')
        .update({ feedback_helpful: newVal } as any)
        .eq('id', messageId);

      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, feedbackHelpful: newVal } : m
      ));

      // Phase 2: Learn from positive feedback
      if (newVal === true) {
        try {
          const { learnUserPreference } = await import('@/services/conversationMemory');
          const likedMsg = messages.find(m => m.id === messageId);
          if (likedMsg) {
            const wordCount = likedMsg.content?.split(/\s+/).length || 0;
            if (wordCount < 150) {
              learnUserPreference('preferred_response_length', 'short', activeConversation || undefined, 0.5);
            } else if (wordCount > 400) {
              learnUserPreference('preferred_response_length', 'long', activeConversation || undefined, 0.5);
            }
            if (likedMsg.visualData) {
              learnUserPreference('likes_charts', true, activeConversation || undefined, 0.5);
            }
          }
        } catch (_) { /* non-blocking */ }
      }

      // 3A: Learn from feedback — record preference when user gives negative feedback
      if (newVal === false) {
        try {
          const { learnUserPreference } = await import('@/services/conversationMemory');
          const assistantMsg = messages.find(m => m.id === messageId);
          if (assistantMsg) {
            await learnUserPreference(
              'disliked_response_style',
              { messagePreview: assistantMsg.content?.substring(0, 200), timestamp: new Date().toISOString() },
              activeConversation || undefined,
              0.6
            );
          }
        } catch (_) { /* non-blocking */ }
      }
    } catch (error) {
      console.error('Error setting feedback:', error);
    }
  }, [user, messages, activeConversation]);

  // Pin/Unpin message
  const handlePinMessage = useCallback(async (messageId: string) => {
    if (!user) return;
    try {
      const msg = messages.find(m => m.id === messageId);
      const newPinned = !((msg as any)?.isPinned);

      await supabase
        .from('ai_messages')
        .update({ is_pinned: newPinned } as any)
        .eq('id', messageId);

      setMessages(prev => prev.map(m =>
        m.id === messageId ? { ...m, isPinned: newPinned } : m
      ));

      toast({ title: newPinned ? 'Message pinned' : 'Message unpinned' });
    } catch (error) {
      console.error('Error pinning message:', error);
    }
  }, [user, messages, toast]);

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

  // Load messages when active conversation changes (skip freshly created)
  // Clear messages immediately to prevent stale content flash
  useEffect(() => {
    if (activeConversation) {
      if (freshConversationRef.current === activeConversation) {
        freshConversationRef.current = null; // Clear flag, skip the load
      } else {
        setMessages([]); // Clear immediately to show loading state
        loadMessages(activeConversation);
      }
    } else {
      setMessages([]);
    }
  }, [activeConversation, loadMessages]);

  const setAnalystActive = useCallback((active: boolean) => {
    analystActiveRef.current = active;
  }, []);

  // Cross-tab synchronization via Supabase Realtime
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('ai-chat-sync')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ai_messages', filter: `conversation_id=eq.${activeConversation}` },
        (payload) => {
          const newMsg = payload.new as any;
          // Skip if message already exists in local state (own write)
          setMessages(prev => {
            if (prev.some(m => m.id === newMsg.id)) return prev;
            return [...prev, {
              id: newMsg.id,
              role: newMsg.type === 'user' ? 'user' as const : 'assistant' as const,
              content: newMsg.content,
              timestamp: new Date(newMsg.created_at),
              status: newMsg.status as any,
              visualData: newMsg.visual_data,
              actions: [],
            }];
          });
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'ai_messages' },
        (payload) => {
          const deletedId = (payload.old as any).id;
          setMessages(prev => prev.filter(m => m.id !== deletedId));
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ai_conversations', filter: `user_id=eq.${user.id}` },
        () => {
          // Refresh conversation list on any change from other tabs
          loadConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, activeConversation, loadConversations]);

  return {
    conversations,
    activeConversation,
    messages,
    isLoading,
    isTyping,
    progressText,
    searchTerm,
    pendingConfirmation,
    loadConversations,
    createConversation,
    deleteConversation,
    renameConversation,
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
    clearSearch,
    editMessage,
    deleteMessage,
    handleConfirmAction,
    handleCancelAction,
    setAnalystActive,
    handleFeedback,
    handlePinMessage,
    justCreatedConversation: justCreatedConversationRef,
  };
};