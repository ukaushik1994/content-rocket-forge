
import { useState, useCallback } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { enhancedAIService } from '@/services/enhancedAIService';
import AIServiceController from '@/services/aiService/AIServiceController';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useSettings } from '@/contexts/SettingsContext';
import { ContextualAction } from '@/services/aiService';

export const useEnhancedAIChat = () => {
  const [messages, setMessages] = useState<EnhancedChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const { openSettings } = useSettings();

  const sendMessage = useCallback(async (content: string) => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to use the AI assistant",
        variant: "destructive"
      });
      return;
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

    // Add placeholder AI message for streaming
    const placeholderAI: EnhancedChatMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, placeholderAI]);

    try {
      // Get enhanced AI response
      const aiResponse = await enhancedAIService.processEnhancedMessage(
        content,
        [...messages, userMessage],
        user.id
      );

      // Update with final response
      setMessages(prev => prev.map(msg => 
        msg.id === placeholderAI.id ? aiResponse : msg
      ));
    } catch (error) {
      console.error('Error sending enhanced message:', error);
      
      // Remove placeholder and show error
      setMessages(prev => prev.filter(msg => msg.id !== placeholderAI.id));
      
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [messages, toast, user]);

  const handleAction = useCallback(async (action: string, data?: any) => {
    if (!user || !action) return;

    if (action.startsWith('open-settings')) {
      const tab = action.split(':')[1] || 'api';
      openSettings(tab);
    } else if (action.startsWith('workflow:')) {
      const workflowAction = action.replace('workflow:', '');
      await handleWorkflowAction(workflowAction, data);
    } else if (action.startsWith('send:')) {
      const message = action.replace('send:', '');
      await sendMessage(message);
    } else if (['create-content-strategy', 'analyze-competitors', 'explore-related-keywords'].includes(action)) {
      // Handle SERP-specific actions
      await handleSerpAction(action, data);
    } else if (action === 'optimize-content-gaps') {
      // Handle content gap optimization
      await handleSerpAction(action, data);
    }
  }, [sendMessage, user, openSettings]);

  const handleSerpAction = useCallback(async (action: string, data?: any) => {
    if (!user) return;

    // Generate contextual message based on SERP action
    const serpActionMessages = {
      'create-content-strategy': `Based on the SERP analysis for "${data?.keyword || 'the analyzed keyword'}", create a comprehensive content strategy. Include:
        - Content gaps to exploit based on competitor analysis
        - Optimal content formats and lengths (current average: ${data?.contentAnalysis?.averageWordCount || 'unknown'} words)
        - Target keywords and semantic variations from ${data?.keywordVariations?.length || 0} opportunities
        - Competition analysis with ${data?.competitors?.length || 0} top competitors
        - Content calendar suggestions with priority ranking
        - Specific recommendations to outrank competitors with ${data?.difficulty}% difficulty`,
      
      'analyze-competitors': `Provide a detailed competitor analysis for "${data?.keyword || 'the analyzed keyword'}". Focus on:
        - Analysis of ${data?.competitors?.length || 0} top ranking competitors and their content strategies
        - Traffic estimates and domain authority insights: ${data?.competitors?.map((c: any) => `${c.domain} (${c.estimatedTraffic} visits, ${c.authority} DA)`).join(', ')}
        - Content gaps and opportunities they're missing
        - Their backlink and authority analysis
        - Weaknesses we can exploit based on opportunity scores
        - Specific recommendations to outrank them with actionable tactics`,
      
      'explore-related-keywords': `Expand the keyword research for "${data?.keyword || 'the analyzed keyword'}". Show me:
        - Analysis of ${data?.relatedKeywords?.length || 0} related keywords
        - Long-tail keyword opportunities from ${data?.keywordVariations?.length || 0} variations
        - Semantic keyword clusters and topics
        - Question-based keywords from "People Also Ask": ${data?.peopleAlsoAsk?.slice(0, 3).join(', ')}
        - Low competition opportunities: ${data?.opportunities?.lowCompetition?.length || 0} keywords
        - High volume opportunities: ${data?.opportunities?.highVolume?.length || 0} keywords
        - Trending keywords: ${data?.opportunities?.trending?.length || 0} keywords`,
      
      'optimize-content-gaps': `Create a content gap optimization strategy for "${data?.keyword || 'the analyzed keyword'}". Focus on:
        - ${data?.contentGaps?.length || 0} identified content gaps in the current SERP
        - Missing topics analysis: ${data?.missingTopics?.slice(0, 5).join(', ')}
        - Content length optimization (current average: ${data?.averageWordCount || 'unknown'} words)
        - Format recommendations based on competitor analysis
        - Priority ranking of content opportunities
        - Specific action plan to fill these gaps and outrank competitors`
    };

    const message = serpActionMessages[action as keyof typeof serpActionMessages] || 
                   `Provide detailed insights for ${action} based on the SERP data for ${data?.keyword || 'the keyword'}`;

    // Send the contextual message as a new AI request
    await sendMessage(message);
  }, [sendMessage, user]);

  const handleWorkflowAction = useCallback(async (workflowAction: string, data?: any) => {
    if (!user) return;

    try {
      // Update workflow state in service
      const currentState = await enhancedAIService.getWorkflowState(user.id, workflowAction);
      const updatedData = { ...currentState?.workflowData, ...data };

      // Update workflow state in database
      await enhancedAIService.updateWorkflowState(
        user.id,
        workflowAction,
        'initiated',
        data || {}
      );

      // Send contextual messages based on workflow action with real data context
      // Use AIServiceController for workflow-specific messages
      const workflowMessages = {
        'keyword-optimization': 'Analyze my current content and solutions to find high-impact keyword opportunities. Show me visual data on keyword gaps and optimization potential.',
        'content-creation': 'Based on my solutions and target audience, help me create a high-performing content strategy with specific recommendations and metrics.',
        'performance-analysis': 'Show me a comprehensive performance analysis of my content with charts, metrics, and actionable optimization recommendations.',
        'solution-integration': 'Analyze how well my current content integrates with my solutions and show me specific opportunities to improve solution visibility and conversion.'
      };

      const message = workflowMessages[workflowAction as keyof typeof workflowMessages] || 
                     (data?.workflow ? `Execute the ${data.workflow} workflow and provide detailed insights with visual data.` : 
                     `Help me with ${workflowAction}`);

      // Use AIServiceController instead of sendMessage to ensure centralized AI handling
      const result = await AIServiceController.generate({
        input: message,
        use_case: 'chat'
      });

      if (result) {
        const aiMessage: EnhancedChatMessage = {
          id: `ai-workflow-${Date.now()}`,
          role: 'assistant',
          content: result.content,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
      }
      } catch (error) {
        console.error('Workflow action failed:', error);
      }
    }, [user]);

  return {
    messages,
    isLoading,
    isTyping,
    sendMessage,
    handleAction,
    handleSerpAction,
    handleWorkflowAction
  };
};
