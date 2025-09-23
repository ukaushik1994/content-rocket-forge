import { useState, useCallback, useEffect } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { useAuth } from '@/contexts/AuthContext';

interface SmartSuggestion {
  id: string;
  text: string;
  type: 'followup' | 'workflow' | 'optimization' | 'analysis';
  priority: number;
  context?: any;
  actionData?: any;
}

interface SuggestionConfig {
  maxSuggestions: number;
  enableContextAnalysis: boolean;
  enableWorkflowSuggestions: boolean;
  enableOptimizationSuggestions: boolean;
}

export const useSmartSuggestions = (
  messages: EnhancedChatMessage[],
  config: SuggestionConfig = {
    maxSuggestions: 3,
    enableContextAnalysis: true,
    enableWorkflowSuggestions: true,
    enableOptimizationSuggestions: true
  }
) => {
  const [suggestions, setSuggestions] = useState<SmartSuggestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const { user } = useAuth();

  // Generate contextual suggestions based on conversation
  const generateSuggestions = useCallback(async () => {
    if (messages.length === 0 || !user) return;

    setIsGenerating(true);
    
    try {
      const latestMessage = messages[messages.length - 1];
      const conversationContext = messages.slice(-3); // Last 3 messages for context
      
      const newSuggestions: SmartSuggestion[] = [];

      // Analyze conversation for patterns and topics
      const conversationTopics = analyzeConversationTopics(conversationContext);
      const hasWorkflowContext = messages.some(m => m.workflowContext?.currentWorkflow);
      const hasVisualData = messages.some(m => m.visualData);
      const hasActions = messages.some(m => m.actions && m.actions.length > 0);

      // Follow-up suggestions based on last message
      if (latestMessage.role === 'assistant') {
        const followups = generateFollowUpSuggestions(latestMessage, conversationTopics);
        newSuggestions.push(...followups);
      }

      // Workflow suggestions
      if (config.enableWorkflowSuggestions) {
        const workflowSuggestions = generateWorkflowSuggestions(conversationTopics, hasWorkflowContext);
        newSuggestions.push(...workflowSuggestions);
      }

      // Optimization suggestions
      if (config.enableOptimizationSuggestions) {
        const optimizationSuggestions = generateOptimizationSuggestions(conversationContext, hasVisualData);
        newSuggestions.push(...optimizationSuggestions);
      }

      // Analysis suggestions
      if (config.enableContextAnalysis) {
        const analysisSuggestions = generateAnalysisSuggestions(conversationTopics, messages.length);
        newSuggestions.push(...analysisSuggestions);
      }

      // Sort by priority and limit results
      const sortedSuggestions = newSuggestions
        .sort((a, b) => b.priority - a.priority)
        .slice(0, config.maxSuggestions);

      setSuggestions(sortedSuggestions);
    } catch (error) {
      console.error('Error generating suggestions:', error);
    } finally {
      setIsGenerating(false);
    }
  }, [messages, config, user]);

  // Analyze conversation for key topics and patterns
  const analyzeConversationTopics = (messages: EnhancedChatMessage[]): string[] => {
    const topics = new Set<string>();
    
    messages.forEach(message => {
      const content = message.content.toLowerCase();
      
      // Content marketing topics
      if (content.includes('seo') || content.includes('optimization')) topics.add('seo');
      if (content.includes('keyword') || content.includes('search')) topics.add('keywords');
      if (content.includes('content') || content.includes('blog')) topics.add('content');
      if (content.includes('analytics') || content.includes('performance')) topics.add('analytics');
      if (content.includes('strategy') || content.includes('plan')) topics.add('strategy');
      if (content.includes('solution') || content.includes('product')) topics.add('solutions');
      if (content.includes('audience') || content.includes('target')) topics.add('audience');
      if (content.includes('conversion') || content.includes('lead')) topics.add('conversion');
    });

    return Array.from(topics);
  };

  // Generate follow-up suggestions
  const generateFollowUpSuggestions = (lastMessage: EnhancedChatMessage, topics: string[]): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];
    
    if (lastMessage.visualData) {
      suggestions.push({
        id: `followup-data-${Date.now()}`,
        text: "Can you explain these insights in more detail?",
        type: 'followup',
        priority: 8,
        context: { hasData: true }
      });
    }

    if (lastMessage.actions && lastMessage.actions.length > 0) {
      suggestions.push({
        id: `followup-actions-${Date.now()}`,
        text: "What's the next step after these actions?",
        type: 'followup',
        priority: 7,
        context: { hasActions: true }
      });
    }

    if (topics.includes('seo')) {
      suggestions.push({
        id: `followup-seo-${Date.now()}`,
        text: "How can I improve my SEO score further?",
        type: 'followup',
        priority: 9,
        context: { topic: 'seo' }
      });
    }

    return suggestions;
  };

  // Generate workflow suggestions
  const generateWorkflowSuggestions = (topics: string[], hasWorkflow: boolean): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];

    if (!hasWorkflow && topics.includes('content')) {
      suggestions.push({
        id: `workflow-content-${Date.now()}`,
        text: "Start a content creation workflow",
        type: 'workflow',
        priority: 8,
        actionData: { workflow: 'content-creation' }
      });
    }

    if (topics.includes('analytics')) {
      suggestions.push({
        id: `workflow-analysis-${Date.now()}`,
        text: "Run a performance analysis workflow",
        type: 'workflow',
        priority: 7,
        actionData: { workflow: 'performance-analysis' }
      });
    }

    if (topics.includes('keywords')) {
      suggestions.push({
        id: `workflow-keywords-${Date.now()}`,
        text: "Optimize keywords with AI workflow",
        type: 'workflow',
        priority: 8,
        actionData: { workflow: 'keyword-optimization' }
      });
    }

    return suggestions;
  };

  // Generate optimization suggestions
  const generateOptimizationSuggestions = (messages: EnhancedChatMessage[], hasVisualData: boolean): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];

    if (!hasVisualData && messages.length > 2) {
      suggestions.push({
        id: `optimize-visuals-${Date.now()}`,
        text: "Show me visual data and charts for better insights",
        type: 'optimization',
        priority: 6,
        context: { needsVisuals: true }
      });
    }

    if (messages.length > 5) {
      suggestions.push({
        id: `optimize-summary-${Date.now()}`,
        text: "Summarize our conversation with key action items",
        type: 'optimization',
        priority: 7,
        context: { needsSummary: true }
      });
    }

    return suggestions;
  };

  // Generate analysis suggestions
  const generateAnalysisSuggestions = (topics: string[], messageCount: number): SmartSuggestion[] => {
    const suggestions: SmartSuggestion[] = [];

    if (topics.includes('content') && messageCount > 3) {
      suggestions.push({
        id: `analysis-content-${Date.now()}`,
        text: "Analyze my content strategy gaps and opportunities",
        type: 'analysis',
        priority: 8,
        context: { analysisType: 'content-strategy' }
      });
    }

    if (topics.includes('solutions')) {
      suggestions.push({
        id: `analysis-solutions-${Date.now()}`,
        text: "How well does my content align with my solutions?",
        type: 'analysis',
        priority: 7,
        context: { analysisType: 'solution-alignment' }
      });
    }

    return suggestions;
  };

  // Get suggestion by ID
  const getSuggestion = useCallback((id: string): SmartSuggestion | undefined => {
    return suggestions.find(s => s.id === id);
  }, [suggestions]);

  // Filter suggestions by type
  const getSuggestionsByType = useCallback((type: SmartSuggestion['type']): SmartSuggestion[] => {
    return suggestions.filter(s => s.type === type);
  }, [suggestions]);

  // Auto-generate suggestions when messages change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateSuggestions();
    }, 1000); // Debounce suggestion generation

    return () => clearTimeout(timeoutId);
  }, [generateSuggestions]);

  return {
    suggestions,
    isGenerating,
    generateSuggestions,
    getSuggestion,
    getSuggestionsByType,
    
    // Utilities
    hasSuggestions: suggestions.length > 0,
    suggestionsByType: {
      followup: getSuggestionsByType('followup'),
      workflow: getSuggestionsByType('workflow'),
      optimization: getSuggestionsByType('optimization'),
      analysis: getSuggestionsByType('analysis')
    }
  };
};

// Hook for conversation memory and context persistence
export const useConversationMemory = (conversationId: string | null) => {
  const [memory, setMemory] = useState<{
    topics: string[];
    preferences: Record<string, any>;
    workflow: string | null;
    context: Record<string, any>;
  }>({
    topics: [],
    preferences: {},
    workflow: null,
    context: {}
  });

  // Save conversation memory
  const saveMemory = useCallback((updates: Partial<typeof memory>) => {
    if (!conversationId) return;
    
    const newMemory = { ...memory, ...updates };
    setMemory(newMemory);
    
    // Persist to localStorage
    localStorage.setItem(`conversation-memory-${conversationId}`, JSON.stringify(newMemory));
  }, [memory, conversationId]);

  // Load conversation memory
  const loadMemory = useCallback(() => {
    if (!conversationId) return;
    
    const stored = localStorage.getItem(`conversation-memory-${conversationId}`);
    if (stored) {
      try {
        const parsedMemory = JSON.parse(stored);
        setMemory(parsedMemory);
      } catch (error) {
        console.error('Error loading conversation memory:', error);
      }
    }
  }, [conversationId]);

  // Update context
  const updateContext = useCallback((key: string, value: any) => {
    saveMemory({
      context: { ...memory.context, [key]: value }
    });
  }, [memory.context, saveMemory]);

  // Add topic
  const addTopic = useCallback((topic: string) => {
    if (!memory.topics.includes(topic)) {
      saveMemory({
        topics: [...memory.topics, topic]
      });
    }
  }, [memory.topics, saveMemory]);

  // Load memory when conversation changes
  useEffect(() => {
    loadMemory();
  }, [loadMemory]);

  return {
    memory,
    saveMemory,
    loadMemory,
    updateContext,
    addTopic,
    
    // Utilities
    hasWorkflow: !!memory.workflow,
    topicCount: memory.topics.length,
    contextKeys: Object.keys(memory.context)
  };
};