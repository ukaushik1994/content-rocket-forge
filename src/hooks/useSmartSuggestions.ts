import { useState, useCallback, useEffect } from 'react';
import { EnhancedChatMessage } from '@/types/enhancedChat';
import { useAuth } from '@/contexts/AuthContext';

interface SmartSuggestion {
  id: string;
  type: 'keyword' | 'content' | 'optimization' | 'strategy' | 'competitive';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  action: string;
  data?: any;
  confidence?: number;
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
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sortedSuggestions = newSuggestions
        .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority])
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
        type: 'content',
        title: "Explain Insights",
        description: "Can you explain these insights in more detail?",
        priority: 'high',
        action: "Get Details",
        confidence: 85
      });
    }

    if (lastMessage.actions && lastMessage.actions.length > 0) {
      suggestions.push({
        id: `followup-actions-${Date.now()}`,
        type: 'strategy',
        title: "Next Steps",
        description: "What's the next step after these actions?",
        priority: 'medium',
        action: "Show Next Steps",
        confidence: 75
      });
    }

    if (topics.includes('seo')) {
      suggestions.push({
        id: `followup-seo-${Date.now()}`,
        type: 'optimization',
        title: "Improve SEO",
        description: "How can I improve my SEO score further?",
        priority: 'high',
        action: "Analyze SEO",
        confidence: 90
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
        type: 'content',
        title: "Content Workflow",
        description: "Start a content creation workflow",
        priority: 'high',
        action: "Start Workflow"
      });
    }

    if (topics.includes('analytics')) {
      suggestions.push({
        id: `workflow-analysis-${Date.now()}`,
        type: 'strategy',
        title: "Performance Analysis",
        description: "Run a performance analysis workflow",
        priority: 'medium',
        action: "Analyze Performance"
      });
    }

    if (topics.includes('keywords')) {
      suggestions.push({
        id: `workflow-keywords-${Date.now()}`,
        type: 'keyword',
        title: "Keyword Optimization",
        description: "Optimize keywords with AI workflow",
        priority: 'high',
        action: "Optimize Keywords"
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
        type: 'optimization',
        title: "Visual Insights",
        description: "Show me visual data and charts for better insights",
        priority: 'medium',
        action: "Show Visuals"
      });
    }

    if (messages.length > 5) {
      suggestions.push({
        id: `optimize-summary-${Date.now()}`,
        type: 'strategy',
        title: "Conversation Summary",
        description: "Summarize our conversation with key action items",
        priority: 'medium',
        action: "Summarize"
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
        type: 'competitive',
        title: "Content Strategy",
        description: "Analyze my content strategy gaps and opportunities",
        priority: 'high',
        action: "Analyze Strategy"
      });
    }

    if (topics.includes('solutions')) {
      suggestions.push({
        id: `analysis-solutions-${Date.now()}`,
        type: 'strategy',
        title: "Solution Alignment",
        description: "How well does my content align with my solutions?",
        priority: 'medium',
        action: "Check Alignment"
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
      keyword: getSuggestionsByType('keyword'),
      content: getSuggestionsByType('content'),
      optimization: getSuggestionsByType('optimization'),
      strategy: getSuggestionsByType('strategy'),
      competitive: getSuggestionsByType('competitive')
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