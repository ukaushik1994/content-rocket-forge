import { useState, useCallback, useEffect } from 'react';
import { CampaignInput, CampaignGoal, CampaignTimeline } from '@/types/campaign-types';
import { supabase } from '@/integrations/supabase/client';
import { generateAIQuestion, getFallbackQuestion } from '@/services/campaignConversationAI';

export type ConversationStage = 
  | 'idea' 
  | 'pain-points' 
  | 'market-context' 
  | 'unique-value'
  | 'audience' 
  | 'audience-details'
  | 'goal' 
  | 'success-metrics'
  | 'timeline' 
  | 'resources'
  | 'complete';

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
}

interface ConversationState {
  stage: ConversationStage;
  collectedData: EnhancedCampaignData;
  messages: CampaignConversationMessage[];
  isLoadingAI: boolean;
}

const generateDynamicQuestion = (stage: ConversationStage, data: EnhancedCampaignData): string => {
  switch (stage) {
    case 'idea':
      return "Great! Let's create a winning campaign together. Tell me about your campaign idea - what specific product, feature, or service are you planning to promote?";
    
    case 'pain-points':
      return `Interesting! So you're promoting "${data.idea}". Before we go further, let's dig deeper:\n\nWhat specific problem does this solve for your users? What pain point are you addressing? Be as specific as possible.`;
    
    case 'market-context':
      return `Got it - you're solving ${data.painPoints ? 'the problem of ' + data.painPoints.toLowerCase() : 'a key problem'}.\n\nNow, let's talk competitive landscape:\n• Who are your main competitors in this space?\n• How does your approach differ from existing solutions?\n• What makes your timing right for this campaign?`;
    
    case 'unique-value':
      return `Thanks for that context! Now, here's the million-dollar question:\n\nWhat's the ONE thing that sets you apart from ${data.competitors || 'competitors'}? What's your unique value proposition that no one else can claim?`;
    
    case 'audience':
      return `Perfect! Now let's identify who feels this pain the most.\n\nWho is your ideal customer? Think about:\n• Their role/job title\n• Industry they work in\n• Company size\n• Current challenges they face`;
    
    case 'audience-details':
      return `Great start! Let's get more specific about ${data.targetAudience || 'your audience'}:\n\n• What level of seniority? (Individual contributor, manager, executive?)\n• Do they have budget authority or need to convince someone?\n• What tools/solutions are they currently using?\n• What's their technical sophistication level?`;
    
    case 'goal':
      return `Excellent! Now, what's your primary goal for this campaign with ${data.targetAudience || 'this audience'}?`;
    
    case 'success-metrics':
      return `Good! You want to achieve ${data.goal}. But let's get specific:\n\nWhat numbers define success for you?\n• What KPIs will you track daily/weekly?\n• What's a realistic benchmark based on past campaigns?\n• What would make you say "This campaign was a huge success"?`;
    
    case 'timeline':
      return `Perfect! Now, how much time do you have to execute this campaign and hit those metrics?`;
    
    case 'resources':
      return `Almost done! Let's talk resources:\n\n• What's your budget range for this campaign?\n• Who's on your team? What skills do you have access to?\n• What marketing channels have worked best for you in the past?\n• Any constraints or limitations I should know about?`;
    
    case 'complete':
      return "🎉 Excellent! I have everything I need. Let me analyze all this strategic context and generate highly targeted campaign strategies for you...";
    
    default:
      return "Tell me more...";
  }
};

const AI_QUESTIONS = {
  idea: generateDynamicQuestion('idea', {} as EnhancedCampaignData),
  'pain-points': '',
  'market-context': '',
  'unique-value': '',
  audience: '',
  'audience-details': '',
  goal: '',
  'success-metrics': '',
  timeline: '',
  resources: '',
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
        content: AI_QUESTIONS.audience,
        timestamp: new Date()
      });
      return {
        stage: 'audience',
        collectedData: { idea: initialMessage },
        messages: initialMessages,
        isLoadingAI: false
      };
    }
    
    initialMessages.push({
      id: crypto.randomUUID(),
      role: 'assistant',
      content: AI_QUESTIONS.idea,
      timestamp: new Date()
    });
    
    return {
      stage: 'idea',
      collectedData: {},
      messages: initialMessages,
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
    
    // First, add user message and update collected data
    setState(prev => {
      console.log('[Campaign] Current stage:', prev.stage);
      console.log('[Campaign] Current messages count:', prev.messages.length);
      
      const newData = { ...prev.collectedData };
      let nextStage: ConversationStage = prev.stage;
      
      // Process based on current stage
      switch (prev.stage) {
        case 'idea':
          newData.idea = message;
          nextStage = 'pain-points';
          break;
        
        case 'pain-points':
          newData.painPoints = message;
          nextStage = 'market-context';
          break;
        
        case 'market-context':
          newData.competitors = message;
          newData.marketContext = message;
          nextStage = 'unique-value';
          break;
        
        case 'unique-value':
          newData.uniqueValue = message;
          nextStage = 'audience';
          break;
        
        case 'audience':
          newData.targetAudience = message;
          nextStage = 'audience-details';
          break;
        
        case 'audience-details':
          const audienceText = message.toLowerCase();
          if (audienceText.includes('manager') || audienceText.includes('executive') || audienceText.includes('director')) {
            newData.audienceRoles = message;
          }
          newData.audienceCurrentSolutions = message;
          nextStage = 'goal';
          break;
        
        case 'goal':
          const goalLower = message.toLowerCase();
          if (goalLower.includes('awareness') || goalLower.includes('brand')) {
            newData.goal = 'awareness';
          } else if (goalLower.includes('conversion') || goalLower.includes('sale')) {
            newData.goal = 'conversion';
          } else if (goalLower.includes('engagement') || goalLower.includes('engage')) {
            newData.goal = 'engagement';
          } else if (goalLower.includes('education') || goalLower.includes('educate')) {
            newData.goal = 'education';
          } else {
            newData.goal = 'awareness';
          }
          nextStage = 'success-metrics';
          break;
        
        case 'success-metrics':
          newData.successMetrics = message;
          nextStage = 'timeline';
          break;
        
        case 'timeline':
          const timelineLower = message.toLowerCase();
          if (timelineLower.includes('1 week') || timelineLower.includes('one week') || timelineLower.includes('7 days')) {
            newData.timeline = '1-week';
          } else if (timelineLower.includes('2 week') || timelineLower.includes('two week') || timelineLower.includes('14 days')) {
            newData.timeline = '2-week';
          } else if (timelineLower.includes('ongoing') || timelineLower.includes('continuous')) {
            newData.timeline = 'ongoing';
          } else {
            newData.timeline = '4-week';
          }
          nextStage = 'resources';
          break;
        
        case 'resources':
          newData.budget = message;
          newData.teamSkills = message;
          nextStage = 'complete';
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
      
      return {
        ...prev,
        collectedData: newData,
        stage: nextStage,
        messages: [...prev.messages, userMessage],
        isLoadingAI: true
      };
    });

    // Then, generate AI response
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      // Get current state for AI generation
      const currentState = state;
      const conversationHistory = currentState.messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      let aiQuestion: string;
      
      try {
        // Try to generate AI question
        aiQuestion = await generateAIQuestion(
          currentState.stage,
          currentState.collectedData,
          conversationHistory,
          user.id
        );
      } catch (aiError) {
        console.warn('[Campaign] AI generation failed, using fallback:', aiError);
        // Fallback to static question
        aiQuestion = getFallbackQuestion(currentState.stage, currentState.collectedData);
      }

      console.log('[Campaign] Generated question (first 100 chars):', aiQuestion.substring(0, 100));

      // Add AI message
      setState(prev => {
        const aiMessage: CampaignConversationMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiQuestion,
          timestamp: new Date()
        };

        return {
          ...prev,
          messages: [...prev.messages, aiMessage],
          isLoadingAI: false
        };
      });
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
    
    if (state.stage === 'goal') {
      const goalLabels: Record<CampaignGoal, string> = {
        awareness: 'Brand Awareness',
        conversion: 'Conversions',
        engagement: 'Engagement',
        education: 'Education'
      };
      message = goalLabels[value as CampaignGoal];
    } else if (state.stage === 'timeline') {
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
    if (state.stage !== 'complete') return null;
    
    const { idea, targetAudience, goal, timeline } = state.collectedData;
    
    if (!idea) return null;
    
    return {
      idea,
      targetAudience,
      goal: goal || 'awareness',
      timeline: timeline || '4-week',
      useSerpData: true
    };
  }, [state]);

  const getProgress = useCallback(() => {
    const stages: ConversationStage[] = [
      'idea', 
      'pain-points', 
      'market-context', 
      'unique-value',
      'audience', 
      'audience-details',
      'goal', 
      'success-metrics',
      'timeline', 
      'resources'
    ];
    const currentIndex = stages.indexOf(state.stage);
    return {
      current: currentIndex + 1,
      total: 10,
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
    isComplete: state.stage === 'complete',
    isLoading: state.isLoadingAI
  };
};
