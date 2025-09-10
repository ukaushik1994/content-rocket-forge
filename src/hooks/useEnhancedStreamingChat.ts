import { useState, useRef, useCallback, useEffect } from 'react';
import { EnhancedChatMessage, VisualData } from '@/types/enhancedChat';
import { ContextualAction } from '@/services/aiService';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

export interface EnhancedStreamingChatState {
  messages: EnhancedChatMessage[];
  isConnected: boolean;
  isTyping: boolean;
  isAIThinking: boolean;
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  currentVisualData?: VisualData;
  currentActions?: ContextualAction[];
  contextData: {
    solutions?: any[];
    analytics?: any;
    workflowContext?: any;
  };
}

export interface FileAnalysisResult {
  name: string;
  size: number;
  type: string;
  insights: string[];
  extractedText?: string;
  metadata?: any;
}

export const useEnhancedStreamingChat = () => {
  const [state, setState] = useState<EnhancedStreamingChatState>({
    messages: [],
    isConnected: false,
    isTyping: false,
    isAIThinking: false,
    connectionStatus: 'disconnected',
    contextData: {}
  });
  
  const { user } = useAuth();
  const { toast } = useToast();

  // Load context data when hook initializes
  useEffect(() => {
    if (user) {
      loadContextData();
    }
  }, [user]);

  const loadContextData = useCallback(async () => {
    if (!user) return;

    try {
      // Load user solutions
      const { data: solutions } = await supabase
        .from('solutions')
        .select('*')
        .eq('user_id', user.id);

      // Load analytics data
      const { data: analyticsData } = await supabase
        .from('content_items')
        .select('approval_status, content_type, seo_score')
        .eq('user_id', user.id);

      const analytics = analyticsData ? {
        totalContent: analyticsData.length,
        published: analyticsData.filter(item => item.approval_status === 'approved').length,
        inReview: analyticsData.filter(item => item.approval_status === 'pending_review').length,
        avgSeoScore: analyticsData.reduce((acc, item) => acc + (item.seo_score || 0), 0) / analyticsData.length || 0,
        contentByType: analyticsData.reduce((acc, item) => {
          acc[item.content_type || 'unknown'] = (acc[item.content_type || 'unknown'] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      } : {};

      setState(prev => ({
        ...prev,
        contextData: {
          solutions: solutions || [],
          analytics,
          workflowContext: {}
        }
      }));

    } catch (error) {
      console.error('Error loading context data:', error);
    }
  }, [user]);

  const sendMessage = useCallback(async (content: string, additionalContext?: any) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the chat",
        variant: "destructive"
      });
      return;
    }

    setState(prev => ({ ...prev, isAIThinking: true }));

    // Add user message
    const userMessage: EnhancedChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date()
    };

    setState(prev => ({ ...prev, messages: [...prev.messages, userMessage] }));

    try {
      // Prepare messages for AI
      const chatMessages = [...state.messages, userMessage].map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Call enhanced AI chat function
      const { data, error } = await supabase.functions.invoke('enhanced-ai-chat', {
        body: {
          messages: chatMessages,
          userId: user.id,
          conversationId: `conv-${Date.now()}`,
          context: {
            ...state.contextData,
            ...additionalContext
          }
        }
      });

      if (error) throw error;

      // Create AI response message
      const aiMessage: EnhancedChatMessage = {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        content: data.message,
        timestamp: new Date(),
        visualData: data.visualData,
        actions: data.actions,
        metadata: {
          reasoning: data.reasoning,
          confidence: data.confidence,
          sources: data.sources
        }
      };

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, aiMessage],
        isAIThinking: false,
        currentVisualData: data.visualData,
        currentActions: data.actions
      }));

    } catch (error) {
      console.error('Error sending message:', error);
      setState(prev => ({ ...prev, isAIThinking: false }));
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, state.messages, state.contextData, toast]);

  const analyzeFile = useCallback(async (file: File): Promise<FileAnalysisResult> => {
    if (!user) {
      throw new Error('Authentication required for file analysis');
    }

    try {
      // Convert file to base64 for processing
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          const base64 = result.split(',')[1];
          resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      // For now, provide basic file analysis
      // This can be enhanced with actual AI-powered analysis
      const basicAnalysis: FileAnalysisResult = {
        name: file.name,
        size: file.size,
        type: file.type,
        insights: [
          `File size: ${(file.size / 1024).toFixed(2)} KB`,
          `File type: ${file.type || 'Unknown'}`,
          file.type.startsWith('image/') ? 'Image file detected - can analyze visual content' :
          file.type === 'application/pdf' ? 'PDF document - can extract text and analyze content' :
          file.type.startsWith('text/') ? 'Text file - can analyze content and extract insights' :
          'File uploaded successfully - ready for analysis'
        ],
        metadata: {
          uploadedAt: new Date().toISOString(),
          userId: user.id
        }
      };

      return basicAnalysis;

    } catch (error) {
      console.error('Error analyzing file:', error);
      throw new Error('Failed to analyze file');
    }
  }, [user]);

  const handleAction = useCallback(async (action: ContextualAction) => {
    if (!user) return;

    try {
      // Handle different action types
      switch (action.action) {
        case 'workflow:performance-deep-dive':
          await sendMessage('I want to perform a deep dive analysis of my content performance', {
            workflowContext: { action: 'performance-deep-dive', data: action.data }
          });
          break;

        case 'workflow:content-optimization':
          await sendMessage('Help me optimize my low-performing content', {
            workflowContext: { action: 'content-optimization', data: action.data }
          });
          break;

        case 'send:analytics':
          await getPerformanceAnalytics();
          break;

        default:
          // Generic action handling
          toast({
            title: "Action Executed",
            description: action.description || `${action.label} completed`,
          });
      }
    } catch (error) {
      console.error('Error handling action:', error);
      toast({
        title: "Action Failed",
        description: "Failed to execute action. Please try again.",
        variant: "destructive"
      });
    }
  }, [user, sendMessage, toast]);

  const getPerformanceAnalytics = useCallback(async () => {
    if (!user) return null;

    try {
      // Query actual performance data
      const { data: contentData } = await supabase
        .from('content_items')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!contentData?.length) {
        await sendMessage('Show me my content performance analytics', {
          analytics: { message: 'No content data available yet' }
        });
        return null;
      }

      // Calculate performance metrics
      const analytics = {
        totalContent: contentData.length,
        published: contentData.filter(item => item.approval_status === 'approved').length,
        inReview: contentData.filter(item => item.approval_status === 'pending_review').length,
        avgSeoScore: Math.round(contentData.reduce((acc, item) => acc + (item.seo_score || 0), 0) / contentData.length),
        recentPerformance: contentData.slice(0, 7).map(item => ({
          date: new Date(item.created_at).toLocaleDateString(),
          content: 1,
          seoScore: item.seo_score || 0,
          status: item.approval_status
        }))
      };

      await sendMessage('Please analyze my content performance and provide actionable insights with visualizations', {
        analytics,
        requestType: 'performance-analysis'
      });

      return analytics;

    } catch (error) {
      console.error('Error getting performance analytics:', error);
      toast({
        title: "Analytics Error",
        description: "Failed to load performance data",
        variant: "destructive"
      });
      return null;
    }
  }, [user, sendMessage, toast]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ 
      ...prev, 
      messages: [],
      currentVisualData: undefined,
      currentActions: undefined
    }));
  }, []);

  const updateContextData = useCallback((newContext: Partial<EnhancedStreamingChatState['contextData']>) => {
    setState(prev => ({
      ...prev,
      contextData: { ...prev.contextData, ...newContext }
    }));
  }, []);

  return {
    ...state,
    sendMessage,
    analyzeFile,
    handleAction,
    getPerformanceAnalytics,
    clearMessages,
    updateContextData,
    loadContextData
  };
};