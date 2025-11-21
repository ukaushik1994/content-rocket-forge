import { useState, useCallback, useEffect } from 'react';
import { CampaignInput, CampaignGoal, CampaignTimeline, CampaignStrategy } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';
import { generateAIQuestion, getFallbackQuestion } from '@/services/campaignConversationAI';
import { useCampaignStrategies, ServiceStatusCallback } from './useCampaignStrategies';

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
  distributionChannels?: string[];
}

interface ConversationState {
  stage: ConversationStage;
  collectedData: EnhancedCampaignData;
  messages: CampaignConversationMessage[];
  strategies: CampaignStrategy[];
  selectedStrategyId: string | null;
  isLoadingAI: boolean;
  showChannelSelector: boolean;
}

const generateDynamicQuestion = (stage: ConversationStage, data: EnhancedCampaignData): string => {
  switch (stage) {
    case 'collecting':
      if (data.idea) {
        return "Great! I can help you create a campaign for that. Just tell me a bit more about your target audience and timeline, or I can generate strategies right away if you'd like.";
      }
      return "Let's create a winning campaign! What's your campaign idea or what are you looking to promote?";
    
    case 'generating':
      return "🎉 Perfect! I have everything I need. Let me generate highly targeted campaign strategies for you...";
    
    case 'complete':
      return "✅ Your campaign strategies are ready!";
    
    default:
      return "Tell me more...";
  }
};

// Detect if message mentions a solution/product/feature
const detectSolutionContext = (message: string): boolean => {
  const solutionKeywords = ['solution', 'feature', 'product', 'service', 'tool', 'platform'];
  const messageLower = message.toLowerCase();
  return solutionKeywords.some(keyword => messageLower.includes(keyword));
};

const AI_QUESTIONS = {
  'collecting': generateDynamicQuestion('collecting', {} as EnhancedCampaignData),
  'generating': '',
  'complete': ''
};

export const useCampaignConversation = (
  initialMessage?: string, 
  onStatusUpdate?: ServiceStatusCallback
) => {
  const { generateStrategies } = useCampaignStrategies();
  
  const [state, setState] = useState<ConversationState>(() => {
    const initialMessages: CampaignConversationMessage[] = [];
    
    if (initialMessage) {
      const hasSolutionContext = detectSolutionContext(initialMessage);
      
      initialMessages.push({
        id: crypto.randomUUID(),
        role: 'user',
        content: initialMessage,
        timestamp: new Date()
      });
      
      if (hasSolutionContext) {
        // Skip detailed questions - go straight to minimal data collection
        initialMessages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: `Perfect! I'll create campaign strategies to promote "${initialMessage}". 

Quick question: Who's your target audience? (e.g., "B2B SaaS founders" or "Enterprise CTOs")`,
          timestamp: new Date()
        });
      } else {
        // Regular question for non-solution campaigns
        initialMessages.push({
          id: crypto.randomUUID(),
          role: 'assistant',
          content: generateDynamicQuestion('collecting', { idea: initialMessage }),
          timestamp: new Date()
        });
      }
      
      return {
        stage: 'collecting',
        collectedData: { idea: initialMessage },
        messages: initialMessages,
        strategies: [],
        selectedStrategyId: null,
        isLoadingAI: false,
        showChannelSelector: false
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
      strategies: [],
      selectedStrategyId: null,
      isLoadingAI: false,
      showChannelSelector: false
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
    
    // Try to detect solution from message
    const messageLower = message.toLowerCase();
    try {
      const { data: solutions } = await supabase
        .from('solutions')
        .select('id, name')
        .ilike('name', `%${message}%`)
        .limit(1);
      
      if (solutions && solutions.length > 0 && !newData.solutionId) {
        newData.solutionId = solutions[0].id;
        console.log('[Campaign] Auto-detected solution:', solutions[0].name);
      }
    } catch (error) {
      console.error('[Campaign] Solution detection error:', error);
    }
    
    // Parse goal from message
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
    
    // Parse distribution channels from message
    const channelKeywords = {
      'social': 'Social Media',
      'email': 'Email Marketing',
      'webinar': 'Webinars',
      'blog': 'Blog/Content',
      'paid ad': 'Paid Ads',
      'event': 'Events',
      'seo': 'SEO/Organic',
      'outreach': 'Direct Outreach'
    };
    
    if (!newData.distributionChannels) {
      newData.distributionChannels = [];
    }
    
    Object.entries(channelKeywords).forEach(([keyword, channelName]) => {
      if (messageLower.includes(keyword) && !newData.distributionChannels?.includes(channelName)) {
        newData.distributionChannels!.push(channelName);
      }
    });
    
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
    
    // Simplified data requirements - only need WHAT and WHO
    const hasWhatTheyrePromoting = newData.idea && newData.idea.length > 10;
    const hasWhoItsFor = newData.targetAudience && newData.targetAudience.length > 5;
    
    // Auto-generate as soon as we know WHAT and WHO
    if (hasWhatTheyrePromoting && hasWhoItsFor) {
      // We have enough! Use smart defaults for the rest
      if (!newData.goal) newData.goal = 'awareness';
      if (!newData.timeline) newData.timeline = '4-week';
      
      nextStage = 'generating'; // Go straight to generation
    }
    
    console.log('[Campaign] Next stage:', nextStage);
    
    // Check if we should show channel selector
    const shouldShowChannelSelector = 
      nextStage === 'collecting' && 
      hasWhatTheyrePromoting && 
      hasWhoItsFor && 
      (!newData.distributionChannels || newData.distributionChannels.length === 0);
    
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
      isLoadingAI: true,
      showChannelSelector: shouldShowChannelSelector
    }));

    // If we're at generating stage, trigger strategy generation
    if (nextStage === 'generating') {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');
        
        setState(prev => ({
          ...prev,
          isLoadingAI: true,
          stage: 'generating',
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: '🎯 Perfect! I have everything I need. Generating comprehensive campaign strategies...',
            timestamp: new Date()
          }]
        }));
        
        // Generate full strategies directly (no summaries)
        const input: CampaignInput = {
          idea: newData.idea || '',
          targetAudience: newData.targetAudience,
          goal: newData.goal || 'awareness',
          timeline: newData.timeline || '4-week',
          useSerpData: true,
          solutionId: newData.solutionId
        };
        
        const strategies = await generateStrategies(input, user.id, undefined, onStatusUpdate);
        
        setState(prev => ({
          ...prev,
          strategies,
          isLoadingAI: false,
          stage: 'complete',
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: `✅ Generated ${strategies.length} comprehensive campaign strategies! Review them below and select the one that best fits your needs.`,
            timestamp: new Date()
          }]
        }));
      } catch (error) {
        console.error('[Campaign] Error generating strategies:', error);
        setState(prev => ({
          ...prev,
          isLoadingAI: false,
          stage: 'collecting',
          messages: [...prev.messages, {
            id: crypto.randomUUID(),
            role: 'assistant',
            content: 'I had trouble generating strategies. Please try again or provide more details.',
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

      // Detect if AI is asking about channels
      const askingAboutChannels = aiQuestion.toLowerCase().includes('channel') || 
                                   aiQuestion.toLowerCase().includes('promote') ||
                                   aiQuestion.toLowerCase().includes('distribution');
      
      // Add AI message
      setState(prev => ({
        ...prev,
        messages: [...prev.messages, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiQuestion,
          timestamp: new Date()
        }],
        isLoadingAI: false,
        showChannelSelector: askingAboutChannels && !prev.collectedData.distributionChannels?.length
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

  const selectStrategy = useCallback((strategyId: string) => {
    setState(prev => ({
      ...prev,
      selectedStrategyId: strategyId,
      stage: 'complete'
    }));
  }, []);

  const regenerateSummaries = useCallback(async () => {
    setState(prev => ({ ...prev, isLoadingAI: true }));
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const input: CampaignInput = {
        idea: state.collectedData.idea || '',
        targetAudience: state.collectedData.targetAudience,
        goal: state.collectedData.goal || 'awareness',
        timeline: state.collectedData.timeline || '4-week',
        useSerpData: true,
        solutionId: state.collectedData.solutionId
      };
      
      const strategies = await generateStrategies(input, user.id, undefined, onStatusUpdate);
      
      setState(prev => ({
        ...prev,
        strategies,
        isLoadingAI: false,
        messages: [...prev.messages, {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: '🔄 I\'ve generated fresh strategy options for you. Take a look!',
          timestamp: new Date()
        }]
      }));
    } catch (error) {
      console.error('[Campaign] Error regenerating strategies:', error);
      setState(prev => ({ ...prev, isLoadingAI: false }));
    }
  }, [state.collectedData, generateStrategies]);

  const goBackToStage = useCallback((targetStage: ConversationStage) => {
    // Reset to the target stage while keeping collected data up to that point
    setState(prev => ({
      ...prev,
      stage: targetStage,
      strategies: [],
      selectedStrategyId: null,
      isLoadingAI: false,
      showChannelSelector: false
    }));
  }, []);

  const selectChannels = useCallback((channels: string[]) => {
    console.log('[Campaign] Channels selected:', channels);
    setState(prev => ({
      ...prev,
      collectedData: {
        ...prev.collectedData,
        distributionChannels: channels
      },
      showChannelSelector: false
    }));
    
    // Auto-submit the selected channels as a message
    const channelMessage = `I want to use: ${channels.join(', ')}`;
    processUserResponse(channelMessage);
  }, [processUserResponse]);

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
    strategySummaries: state.strategies,
    selectedSummaryId: state.selectedStrategyId,
    selectSummary: selectStrategy,
    regenerateSummaries,
    goBackToStage,
    collectedData: state.collectedData,
    showChannelSelector: state.showChannelSelector,
    selectChannels
  };
};
