import { useState, useCallback } from 'react';
import { CampaignInput, CampaignGoal, CampaignTimeline } from '@/types/campaign-types';

export type ConversationStage = 'idea' | 'audience' | 'goal' | 'timeline' | 'complete';

export interface CampaignConversationMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ConversationState {
  stage: ConversationStage;
  collectedData: Partial<CampaignInput>;
  messages: CampaignConversationMessage[];
}

const AI_QUESTIONS = {
  idea: "Great! Let's create a winning campaign together. Tell me about your campaign idea - what are you planning to promote?",
  audience: "Perfect! Now, who is your target audience? Who are you trying to reach with this campaign?",
  goal: "Got it! What's your primary goal for this campaign?",
  timeline: "Excellent! How much time do you have to execute this campaign?",
  complete: "🎉 Perfect! I have all the information I need. Let me generate some powerful strategies for you..."
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
        messages: initialMessages
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
      messages: initialMessages
    };
  });

  const addMessage = useCallback((role: 'user' | 'assistant', content: string) => {
    const newMessage: CampaignConversationMessage = {
      id: crypto.randomUUID(),
      role,
      content,
      timestamp: new Date()
    };
    
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage]
    }));
  }, []);

  const processUserResponse = useCallback((message: string) => {
    // Add user message
    addMessage('user', message);

    setState(prev => {
      const newData = { ...prev.collectedData };
      let nextStage: ConversationStage = prev.stage;

      // Process based on current stage
      switch (prev.stage) {
        case 'idea':
          newData.idea = message;
          nextStage = 'audience';
          break;
        case 'audience':
          newData.targetAudience = message;
          nextStage = 'goal';
          break;
        case 'goal':
          // Parse goal from message
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
            newData.goal = 'awareness'; // Default
          }
          nextStage = 'timeline';
          break;
        case 'timeline':
          // Parse timeline from message
          const timelineLower = message.toLowerCase();
          if (timelineLower.includes('1 week') || timelineLower.includes('one week') || timelineLower.includes('7 days')) {
            newData.timeline = '1-week';
          } else if (timelineLower.includes('2 week') || timelineLower.includes('two week') || timelineLower.includes('14 days')) {
            newData.timeline = '2-week';
          } else if (timelineLower.includes('ongoing') || timelineLower.includes('continuous')) {
            newData.timeline = 'ongoing';
          } else {
            newData.timeline = '4-week'; // Default
          }
          nextStage = 'complete';
          break;
      }

      return {
        ...prev,
        stage: nextStage,
        collectedData: newData
      };
    });

    // Add AI response after a brief delay
    setTimeout(() => {
      setState(prev => {
        if (prev.stage !== 'complete') {
          addMessage('assistant', AI_QUESTIONS[prev.stage]);
        } else {
          addMessage('assistant', AI_QUESTIONS.complete);
        }
        return prev;
      });
    }, 500);
  }, [addMessage]);

  const handleQuickReply = useCallback((value: CampaignGoal | CampaignTimeline) => {
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
    const stages: ConversationStage[] = ['idea', 'audience', 'goal', 'timeline'];
    const currentIndex = stages.indexOf(state.stage);
    return {
      current: currentIndex + 1,
      total: 4,
      percentage: ((currentIndex + 1) / 4) * 100
    };
  }, [state.stage]);

  return {
    messages: state.messages,
    stage: state.stage,
    progress: getProgress(),
    processUserResponse,
    handleQuickReply,
    getCampaignInput,
    isComplete: state.stage === 'complete'
  };
};
