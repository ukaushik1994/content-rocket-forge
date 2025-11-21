import { useState, useCallback, useEffect } from 'react';
import { CampaignInput, CampaignGoal, CampaignTimeline, CampaignStrategySummary } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';
import { generateAIQuestion, getFallbackQuestion } from '@/services/campaignConversationAI';
import { generateCampaignSummaries } from '@/services/campaignSummaryAI';

export type ConversationStage = 
  | 'collecting'    // Gathering all required data dynamically
  | 'generating'    // Generating strategies
  | 'complete';     // Ready to use strategies

export interface CampaignConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface EnhancedCampaignData {
  idea?: string;
  painPoints?: string;
  competitors?: string;
  uniqueValue?: string;
  marketContext?: string;
  targetAudience?: string;
  audienceRoles?: string;
  audienceCompanySize?: string;
  audienceCurrentSolutions?: string;
  goal?: CampaignGoal;
  successMetrics?: string;
  timeline?: CampaignTimeline;
  budget?: string;
  teamSkills?: string;
  pastResults?: string;
  solutionId?: string | null;
}

interface ConversationState {
  stage: ConversationStage;
  collectedData: EnhancedCampaignData;
  messages: CampaignConversationMessage[];
  strategySummaries: CampaignStrategySummary[];
  selectedSummaryId: string | null;
  isLoadingAI: boolean;
}

const generateDynamicQuestion = (stage: ConversationStage, data: EnhancedCampaignData): string => {
  switch (stage) {
    case 'collecting':
      return "Let's create a winning campaign! Tell me:\n\n• What product/service are you promoting?\n• Who is your target audience?\n• What do you want to achieve?\n• What's your timeline?\n\nBe as specific as you like - I'll use this to create targeted campaign strategies.";
    
    case 'generating':
      return "🎉 Perfect! I have everything I need. Let me generate highly targeted campaign strategies for you...";
    
    case 'complete':
      return "✅ Your campaign strategies are ready!";
    
    default:
      return "Tell me more...";
  }
};

const AI_QUESTIONS = {
  'collecting': generateDynamicQuestion('collecting', {} as EnhancedCampaignData),
  'generating': '',
  'complete': ''
};

export const useCampaignConversation = (initialMessage?: string) => {
  const [state, setState] = useState<ConversationState>(() => {
    const initialMessages: CampaignConversationMessage[] = [];
    
    if (initialMessage) {
      initialMessages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: initialMessage,
        timestamp: new Date()
      });
      initialMessages.push({
        id: crypto.randomUUID(),
        role: 'assistant',
        content: generateDynamicQuestion('collecting', { idea: initialMessage }),
        timestamp: new Date()
      });
      return {
        stage: 'collecting',
        collectedData: { idea: initialMessage },
        messages: initialMessages,
        strategySummaries: [],
        selectedSummaryId: null,
        isLoadingAI: false
      };
    }
    
    initialMessages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: AI_QUESTIONS['collecting'],
      timestamp: new Date()
    });
    
    return {
      stage: 'collecting',
      collectedData: {},
      messages: initialMessages,
      strategySummaries: [],
      selectedSummaryId: null,
      isLoadingAI: false
    };
  });

  // State persistence debug logging
  useEffect(() => {
    console.log('[Campaign State] Messages count:', state.messages.length);
    if (state.messages.length > 0) {
      const lastMsg = state.messages[state.messages.length - 1];
      console.log('[Campaign State] Last message:', lastMsg.role, lastMsg.content.substring(0, 30));
    }
  }, [state.messages]);

  const processUserResponse = useCallback(async (message: string) => {
    console.log('[Campaign] Processing user response:', message);
    
    // Calculate next state values BEFORE setState
    const newData = { ...state.collectedData };
    let nextStage: ConversationStage = state.stage;
    
    // Extract data from message
    newData.idea = newData.idea || message;
    
    // Parse goal from message
    const messageLower = message.toLowerCase();
    if (messageLower.includes('awareness') || messageLower.includes('brand')) {
      newData.goal = 'awareness';
    } else if (messageLower.includes('conversion') || messageLower.includes('sale') || messageLower.includes('signup')) {
      newData.goal = 'conversion';
    } else if (messageLower.includes('engagement') || messageLower.includes('engage')) {
      newData.goal = 'engagement';
    } else if (messageLower.includes('education') || messageLower.includes('educate')) {
      newData.goal = 'education';
    } else if (!newData.goal) {
      newData.goal = 'awareness'; // Default
    }
    
    // Parse target audience if not set
    if (!newData.targetAudience && (messageLower.includes('target') || messageLower.includes('audience'))) {
      newData.targetAudience = message;
    }
    
    // Parse timeline if not set
    if (!newData.timeline) {
      if (messageLower.includes('1 week') || messageLower.includes('one week') || messageLower.includes('7 days')) {
        newData.timeline = '1-week';
      } else if (messageLower.includes('2 week') || messageLower.includes('two week') || messageLower.includes('14 days')) {
        newData.timeline = '2-week';
      } else if (messageLower.includes('ongoing') || messageLower.includes('continuous')) {
        newData.timeline = 'ongoing';
      } else {
        newData.timeline = '4-week'; // Default
      }
    }
    
    // Check if we have all required data
    const hasAllData = newData.idea && newData.goal && newData.targetAudience && newData.timeline;
    
    if (hasAllData) {
      nextStage = 'generating';
    }
    
    console.log('[Campaign] Next stage:', nextStage);
    
    // Create user message
    const userMessage: CampaignConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    // Build conversation history BEFORE setState
    const conversationHistory = [
      ...state.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      {
        role: userMessage.role,
        content: userMessage.content
      }
    ];
    
    console.log('[Campaign] Conversation history length:', conversationHistory.length);
    
    // Update state with user message
    setState(prev => ({
      ...prev,
      collectedData: newData,
      stage: nextStage,
      messages: [...prev.messages, userMessage],
      isLoadingAI: true
    }));

    // If we're at generating stage, trigger strategy generation
    if (nextStage === 'generating') {
      try {
        setState(prev => ({
          ...prev,
          isLoadingAI: false,
          stage: 'complete',
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '🎯 Perfect! I have everything I need. Generating comprehensive campaign strategies...',
            timestamp: new Date()
          }]
        }));
      } catch (error) {
        console.error('[Campaign] Error:', error);
        setState(prev => ({
          ...prev,
          isLoadingAI: false,
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'I had trouble processing your request. Please try again.',
            timestamp: new Date()
          }]
        }));
      }
      return;
    }

    // Generate AI response
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const aiQuestion = await generateAIQuestion(
        nextStage,
        newData,
        conversationHistory,
        user.id
      );

      console.log('[Campaign] Generated question (first 100 chars):', aiQuestion.substring(0, 100));

      // Add AI message
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiQuestion,
          timestamp: new Date()
        }],
        isLoadingAI: false
      }));
    } catch (error) {
      console.error('[Campaign] Error generating AI response:', error);
      
      // Add fallback message
      setState(prev => {
        const fallbackMessage: CampaignConversationMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: getFallbackQuestion(prev.stage, prev.collectedData),
          timestamp: new Date()
        };

        return {
          ...prev,
          messages: [...prev.messages, fallbackMessage],
          isLoadingAI: false
        };
      });
    }
  }, [state]);

  const handleQuickReply = useCallback((value: string) => {
    console.log('[Campaign] Quick reply selected:', value);
    processUserResponse(value);
  }, [processUserResponse]);

  const handleQuickReplyOld = useCallback((value: CampaignGoal | CampaignTimeline) => {
    let message = '';
    
    const timelineLabels: Record<CampaignTimeline, string> = {
      '1-week': '1 Week',
      '2-week': '2 Weeks',
      '4-week': '4 Weeks',
      'ongoing': 'Ongoing'
    };
    message = timelineLabels[value as CampaignTimeline];
    
    if (message) {
      processUserResponse(message);
    }
  }, [processUserResponse]);

  const getCampaignInput = useCallback((): CampaignInput | null => {
    if (state.stage !== 'complete') return null;
    
    const { idea, targetAudience, goal, timeline, solutionId } = state.collectedData;
    
    if (!idea) return null;
    
    return {
      idea,
      targetAudience,
      goal: goal || 'awareness',
      timeline: timeline || '4-week',
      useSerpData: true,
      solutionId: solutionId || undefined
    };
  }, [state]);

  const selectSummary = useCallback((summaryId: string) => {
    setState(prev => ({
      ...prev,
      selectedSummaryId: summaryId,
      stage: 'complete'
    }));
  }, []);

  const regenerateSummaries = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingAI: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const solutionId = state.collectedData.solutionId || null;
      const summaries = await generateCampaignSummaries(state.collectedData, solutionId, user.id);
      
      setState(prev => ({
        ...prev,
        strategySummaries: summaries,
        isLoadingAI: false,
        messages: [...prev.messages, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '🔄 I\'ve generated fresh strategy options for you. Take a look!',
          timestamp: new Date()
        }]
      }));
    } catch (error) {
      console.error('[Campaign] Error regenerating summaries:', error);
      setState(prev => ({ ...prev, isLoadingAI: false }));
    }
  }, [state.collectedData]);

  const goBackToStage = useCallback((targetStage: ConversationStage) => {
    // Reset to the target stage while keeping collected data up to that point
    setState(prev => ({
      ...prev,
      stage: targetStage,
      strategySummaries: [],
      selectedSummaryId: null,
      isLoadingAI: false
    }));
  }, []);

  const getProgress = useCallback(() => {
    const stages: ConversationStage[] = ['collecting', 'generating', 'complete'];
    const currentIndex = stages.indexOf(state.stage);
    
    return {
      current: currentIndex + 1,
      total: 3,
      percentage: ((currentIndex + 1) / 3) * 100
    };
  }, [state.stage]);

  return {
    messages: state.messages,
    stage: state.stage,
    progress: getProgress(),
    processUserResponse,
    handleQuickReply,
    getCampaignInput,
    isComplete: state.stage === 'complete',
    isLoading: state.isLoadingAI,
    strategySummaries: state.strategySummaries,
    selectedSummaryId: state.selectedSummaryId,
    selectSummary,
    regenerateSummaries,
    goBackToStage,
    collectedData: state.collectedData
  };
};
