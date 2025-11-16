import { useState, useCallback, useEffect } from 'react';
import { CampaignInput, CampaignGoal, CampaignTimeline, CampaignStrategySummary } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';
import { generateAIQuestion, getFallbackQuestion } from '@/services/campaignConversationAI';
import { generateCampaignSummaries } from '@/services/campaignSummaryAI';

export type ConversationStage = 
  | 'goal-idea'          // Combined: idea + goal in one question
  | 'solution-detection' // Optional: only if solutions exist
  | 'audience'           // Simplified: single audience question
  | 'timeline'           // Quick selection
  | 'complete'
  | 'strategy-selection'
  | 'generating-full';

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
    case 'goal-idea':
      return "Let's create a winning campaign! Tell me:\n\n• What product/service are you promoting?\n• What do you want to achieve? (e.g., increase signups, boost awareness, drive sales)\n\nBe as specific as you like - I'll use this to create targeted campaign strategies.";
    
    case 'solution-detection':
      const solutions = (data as any).availableSolutions || [];
      if (solutions.length > 0) {
        const solutionList = solutions.map((s: any) => `• ${s.name}`).join('\n');
        return `Are you promoting one of these solutions?\n\n${solutionList}\n\nReply with the solution name, or type "None" if promoting something else.`;
      }
      return "Are you promoting one of your existing solutions? Please reply with the solution name, or type 'None' if this is for something else.";
    
    case 'audience':
      return `Great! Now, who is this campaign for?\n\nDescribe your target audience (e.g., "B2B SaaS founders", "enterprise CFOs", "small business owners"). Include company size or roles if relevant.`;
    
    case 'timeline':
      return `Perfect! What's your timeline for this campaign?`;
    
    case 'complete':
      return "🎉 Perfect! I have everything I need. Let me generate highly targeted campaign strategies for you...";
    
    default:
      return "Tell me more...";
  }
};

const AI_QUESTIONS = {
  'goal-idea': generateDynamicQuestion('goal-idea', {} as EnhancedCampaignData),
  'solution-detection': '',
  audience: '',
  timeline: '',
  complete: ''
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
        content: generateDynamicQuestion('audience', { idea: initialMessage }),
        timestamp: new Date()
      });
      return {
        stage: 'audience',
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
      content: AI_QUESTIONS['goal-idea'],
      timestamp: new Date()
    });
    
    return {
      stage: 'goal-idea',
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
    
    // Process based on current stage
    switch (state.stage) {
      case 'goal-idea':
        // Extract both idea and goal from single response
        newData.idea = message;
        
        // Parse goal from message (AI will also infer this during generation)
        const goalLower = message.toLowerCase();
        if (goalLower.includes('awareness') || goalLower.includes('brand')) {
          newData.goal = 'awareness';
        } else if (goalLower.includes('conversion') || goalLower.includes('sale') || goalLower.includes('signup')) {
          newData.goal = 'conversion';
        } else if (goalLower.includes('engagement') || goalLower.includes('engage')) {
          newData.goal = 'engagement';
        } else if (goalLower.includes('education') || goalLower.includes('educate')) {
          newData.goal = 'education';
        } else {
          newData.goal = 'awareness'; // Default
        }
        
        // Check if user has solutions to detect
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            const { data: solutions } = await supabase
              .from('solutions')
              .select('id, name')
              .eq('user_id', user.id)
              .limit(5);
            
            if (solutions && solutions.length > 0) {
              // Store solutions for next stage
              (newData as any).availableSolutions = solutions;
              nextStage = 'solution-detection';
            } else {
              // No solutions, skip to audience
              nextStage = 'audience';
            }
          } else {
            nextStage = 'audience';
          }
        } catch (error) {
          console.error('Failed to fetch solutions:', error);
          nextStage = 'audience';
        }
        break;
      
      case 'solution-detection':
        const userResponse = message.toLowerCase();
        const availableSolutions = (newData as any).availableSolutions || [];
        
        if (userResponse === 'none' || userResponse.includes('no') || userResponse.includes('not')) {
          // User is not promoting an existing solution
          newData.solutionId = null;
        } else {
          // Try to match user response to a solution
          const matchedSolution = availableSolutions.find((sol: any) => 
            userResponse.includes(sol.name.toLowerCase())
          );
          
          if (matchedSolution) {
            newData.solutionId = matchedSolution.id;
          }
        }
        
        // Clean up temporary data
        delete (newData as any).availableSolutions;
        nextStage = 'audience';
        break;
      
      case 'audience':
        newData.targetAudience = message;
        nextStage = 'timeline';
        break;
      
      case 'timeline':
        const timelineLower = message.toLowerCase();
        if (timelineLower.includes('1 week') || timelineLower.includes('one week') || timelineLower.includes('7 days') || timelineLower.includes('1-week')) {
          newData.timeline = '1-week';
        } else if (timelineLower.includes('2 week') || timelineLower.includes('two week') || timelineLower.includes('14 days') || timelineLower.includes('2-week')) {
          newData.timeline = '2-week';
        } else if (timelineLower.includes('ongoing') || timelineLower.includes('continuous')) {
          newData.timeline = 'ongoing';
        } else {
          newData.timeline = '4-week'; // Default
        }
        nextStage = 'strategy-selection';
        break;
    }
    
    console.log('[Campaign] Next stage:', nextStage);
    
    // Create user message
    const userMessage: CampaignConversationMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    // Build conversation history BEFORE setState (includes new user message)
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

    // If we're at strategy-selection stage, generate summaries
    if (nextStage === 'strategy-selection') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        // Get solutionId from collectedData
        const solutionId = newData.solutionId || null;
        
        const summaries = await generateCampaignSummaries(newData, solutionId, user.id);
        
        setState(prev => ({
          ...prev,
          strategySummaries: summaries,
          isLoadingAI: false,
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '🎯 Perfect! I\'ve analyzed your needs and created 3-4 distinct strategy options for you. Select the one that best fits your goals and resources.',
            timestamp: new Date()
          }]
        }));
      } catch (error) {
        console.error('[Campaign] Error generating summaries:', error);
        setState(prev => ({
          ...prev,
          isLoadingAI: false,
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'I had trouble generating strategy options. Let me try again...',
            timestamp: new Date()
          }]
        }));
      }
      return;
    }

    // Generate AI response with correct conversation history
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      let aiQuestion: string;
      
      try {
        // Now we have the complete conversation history including user's message
        aiQuestion = await generateAIQuestion(
          nextStage,  // Use calculated nextStage, not state.stage
          newData,    // Use calculated newData, not state.collectedData
          conversationHistory,  // Manually built history with all messages
          user.id
        );
      } catch (aiError) {
        console.warn('[Campaign] AI generation failed, using fallback:', aiError);
        aiQuestion = getFallbackQuestion(nextStage, newData);
      }

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
    
    if (state.stage === 'timeline') {
      const timelineLabels: Record<CampaignTimeline, string> = {
        '1-week': '1 Week',
        '2-week': '2 Weeks',
        '4-week': '4 Weeks',
        'ongoing': 'Ongoing'
      };
      message = timelineLabels[value as CampaignTimeline];
    }
    
    if (message) {
      processUserResponse(message);
    }
  }, [state.stage, processUserResponse]);

  const getCampaignInput = useCallback((): CampaignInput | null => {
    if (state.stage !== 'generating-full') return null;
    
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
      stage: 'generating-full'
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
    const stages: ConversationStage[] = [
      'goal-idea',
      'solution-detection',
      'audience',
      'timeline'
    ];
    
    const currentIndex = stages.indexOf(state.stage);
    let total = 3;
    if (state.collectedData.solutionId !== undefined) {
      total = 4;
    }
    
    const current = currentIndex >= 0 ? currentIndex + 1 : 0;
    
    return {
      current: Math.min(current, total),
      total,
      percentage: ((currentIndex + 1) / 10) * 100
    };
  }, [state.stage]);

  return {
    messages: state.messages,
    stage: state.stage,
    progress: getProgress(),
    processUserResponse,
    handleQuickReply,
    getCampaignInput,
    isComplete: state.stage === 'generating-full',
    isLoading: state.isLoadingAI,
    strategySummaries: state.strategySummaries,
    selectedSummaryId: state.selectedSummaryId,
    selectSummary,
    regenerateSummaries,
    goBackToStage,
    collectedData: state.collectedData
  };
};
