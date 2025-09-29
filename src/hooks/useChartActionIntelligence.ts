import React, { useState, useCallback } from 'react';
import { ChartConfiguration } from '@/types/enhancedChat';
import { 
  MessageSquare, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  PenTool, 
  Search,
  Download,
  Calendar,
  Target,
  Lightbulb,
  Zap
} from 'lucide-react';

interface ActionSuggestion {
  title: string;
  description: string;
  icon: any;
  type: 'chat' | 'navigation' | 'data';
}

interface ChatAction extends ActionSuggestion {
  prompt: string;
}

interface NavigationAction extends ActionSuggestion {
  path: string;
  context?: any;
}

interface DataAction extends ActionSuggestion {
  handler: () => void;
}

interface ActionSuggestions {
  summary: string;
  chatActions: ChatAction[];
  navigationActions: NavigationAction[];
  dataActions: DataAction[];
}

interface AnalysisContext {
  chartData: any[];
  chartType: string;
  title?: string;
  description?: string;
  chatContext?: string;
  conversationHistory?: any[];
}

export const useChartActionIntelligence = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const generateActionSuggestions = useCallback((context: AnalysisContext): ActionSuggestions => {
    setIsAnalyzing(true);
    
    try {
      const { chartData, chartType, title, description, chatContext, conversationHistory = [] } = context;
      
      // Enhanced analysis with conversation history
      const dataPatterns = analyzeDataPatterns(chartData);
      const chartInsights = analyzeChartType(chartType, chartData);
      const contextualHints = analyzeContextWithHistory(chatContext, title, description, conversationHistory);
      
      // Generate enhanced AI summary
      const summary = generateInsightSummary(dataPatterns, chartInsights, contextualHints);
      
      // Generate contextual actions with conversation awareness
      const chatActions = generateChatActions(dataPatterns, chartInsights, contextualHints);
      const navigationActions = generateNavigationActions(dataPatterns, chartInsights, contextualHints);
      const dataActions = generateDataActions(chartData, chartType);
      
      return {
        summary,
        chatActions,
        navigationActions,
        dataActions
      };
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const renderChart = useCallback((chartConfig: ChartConfiguration): React.ReactElement | null => {
    // For simplicity, we'll return a placeholder that the modal component will replace
    // with the actual chart rendering logic from InteractiveChart
    return React.createElement('div', {
      className: 'chart-placeholder w-full h-full',
      'data-chart-config': JSON.stringify(chartConfig)
    }, 'Chart will be rendered here');
  }, []);

  return {
    generateActionSuggestions,
    renderChart,
    isAnalyzing
  };
};

// Helper functions for analysis
function analyzeDataPatterns(data: any[]) {
  if (!data || data.length === 0) return { trend: 'none', volatility: 'low', size: 'empty' };
  
  const numericKeys = Object.keys(data[0] || {}).filter(key => 
    key !== 'name' && key !== 'label' && typeof data[0][key] === 'number'
  );
  
  if (numericKeys.length === 0) return { trend: 'none', volatility: 'low', size: 'small' };
  
  const firstKey = numericKeys[0];
  const values = data.map(item => item[firstKey]).filter(v => typeof v === 'number');
  
  const trend = values.length > 1 ? (values[values.length - 1] > values[0] ? 'increasing' : 'decreasing') : 'stable';
  const variance = values.length > 1 ? Math.sqrt(values.reduce((acc, val, i, arr) => {
    const mean = arr.reduce((a, b) => a + b, 0) / arr.length;
    return acc + Math.pow(val - mean, 2);
  }, 0) / values.length) : 0;
  
  const volatility = variance > 10 ? 'high' : variance > 5 ? 'medium' : 'low';
  const size = data.length > 20 ? 'large' : data.length > 10 ? 'medium' : 'small';
  
  return { trend, volatility, size };
}

function analyzeChartType(type: string, data: any[]) {
  const insights = {
    line: 'Shows trends over time, ideal for tracking changes and patterns',
    bar: 'Compares different categories, good for seeing relative sizes',
    pie: 'Shows proportions and parts of a whole',
    area: 'Emphasizes magnitude of change over time'
  };
  
  return {
    type,
    insight: insights[type as keyof typeof insights] || 'Custom visualization',
    dataPoints: data.length
  };
}

function analyzeContext(chatContext?: string, title?: string, description?: string) {
  const context = [chatContext, title, description].filter(Boolean).join(' ').toLowerCase();
  
  const keywords = {
    strategy: ['strategy', 'plan', 'opportunity', 'market', 'competitive'],
    content: ['content', 'blog', 'article', 'post', 'writing', 'seo'],
    analytics: ['analytics', 'performance', 'metrics', 'traffic', 'conversion'],
    research: ['research', 'analysis', 'data', 'insights', 'trends']
  };
  
  const detected = Object.entries(keywords).find(([category, words]) =>
    words.some(word => context.includes(word))
  );
  
  return {
    category: detected?.[0] || 'general',
    hasStrategy: keywords.strategy.some(word => context.includes(word)),
    hasContent: keywords.content.some(word => context.includes(word)),
    hasAnalytics: keywords.analytics.some(word => context.includes(word))
  };
}

function analyzeContextWithHistory(chatContext?: string, title?: string, description?: string, conversationHistory: any[] = []) {
  // First get base context analysis
  const baseContext = analyzeContext(chatContext, title, description);
  
  // Analyze conversation history for additional context
  const conversationText = conversationHistory
    .map(msg => msg.content || msg.text || '')
    .join(' ')
    .toLowerCase();
  
  const historyKeywords = {
    userIntent: ['help', 'need', 'want', 'looking for', 'trying to'],
    urgency: ['urgent', 'asap', 'quickly', 'immediate', 'deadline'],
    exploration: ['explore', 'brainstorm', 'ideas', 'options', 'possibilities'],
    implementation: ['implement', 'create', 'build', 'start', 'launch']
  };
  
  const intentAnalysis = Object.entries(historyKeywords).reduce((acc, [intent, words]) => {
    acc[intent] = words.some(word => conversationText.includes(word));
    return acc;
  }, {} as Record<string, boolean>);
  
  // Enhanced context understanding
  return {
    ...baseContext,
    conversationLength: conversationHistory.length,
    userIntent: intentAnalysis,
    isDeepConversation: conversationHistory.length > 5,
    hasExplorationNeeds: intentAnalysis.exploration,
    hasImplementationNeeds: intentAnalysis.implementation
  };
}

function generateInsightSummary(dataPatterns: any, chartInsights: any, contextualHints: any): string {
  const { trend, volatility, size } = dataPatterns;
  const { type, dataPoints } = chartInsights;
  const { category } = contextualHints;
  
  let summary = `This ${type} chart displays ${dataPoints} data points`;
  
  if (trend !== 'none') {
    summary += ` showing a ${trend} trend`;
  }
  
  if (volatility !== 'low') {
    summary += ` with ${volatility} volatility`;
  }
  
  summary += `. Based on the ${category} context, this data could help inform strategic decisions and next steps.`;
  
  return summary;
}

function generateChatActions(dataPatterns: any, chartInsights: any, contextualHints: any): ChatAction[] {
  const actions: ChatAction[] = [];
  
  // Base actions for all contexts
  if (contextualHints.hasExplorationNeeds || !contextualHints.isDeepConversation) {
    actions.push({
      title: 'Analyze Trends Deeper',
      description: 'Get detailed insights about patterns and correlations',
      icon: TrendingUp,
      type: 'chat',
      prompt: 'Can you analyze the trends in this data more deeply and explain what patterns you see? Focus on actionable insights.'
    });
  }
  
  if (contextualHints.userIntent?.exploration || dataPatterns.volatility === 'high') {
    actions.push({
      title: 'Brainstorm Improvements',
      description: 'Explore ways to optimize based on this data',
      icon: Lightbulb,
      type: 'chat',
      prompt: 'Based on this data, what are some creative improvements or optimizations we could implement? Think outside the box.'
    });
  }
  
  // Context-specific actions
  if (contextualHints.hasStrategy) {
    actions.push({
      title: 'Strategic Recommendations',
      description: 'Get strategic advice based on this data',
      icon: Target,
      type: 'chat',
      prompt: 'What strategic recommendations do you have based on this data analysis? Consider both short-term and long-term implications.'
    });
  }
  
  if (contextualHints.hasContent) {
    actions.push({
      title: 'Content Ideas',
      description: 'Generate content ideas from this data',
      icon: PenTool,
      type: 'chat',
      prompt: 'What content ideas could we create based on these insights? Include specific angles and messaging strategies.'
    });
  }
  
  // Predictive prompts based on conversation history
  if (contextualHints.isDeepConversation) {
    actions.push({
      title: 'Next Steps Planning',
      description: 'Plan concrete next steps based on our discussion',
      icon: Zap,
      type: 'chat',
      prompt: 'Based on our conversation and this data, what should be our immediate next steps? Create a prioritized action plan.'
    });
  }
  
  return actions.slice(0, 4); // Limit to most relevant actions
}

function generateNavigationActions(dataPatterns: any, chartInsights: any, contextualHints: any): NavigationAction[] {
  const actions: NavigationAction[] = [];
  
  if (contextualHints.hasStrategy || contextualHints.userIntent?.exploration) {
    actions.push({
      title: 'Explore Opportunities',
      description: 'View strategic opportunities based on this analysis',
      icon: Search,
      type: 'navigation',
      path: '/opportunities',
      context: { 
        dataPattern: dataPatterns.trend,
        chartType: chartInsights.type,
        source: 'chart-analysis'
      }
    });
  }
  
  if (contextualHints.hasContent || contextualHints.hasImplementationNeeds) {
    actions.push({
      title: 'Create Content',
      description: 'Build content pieces using these insights',
      icon: PenTool,
      type: 'navigation',
      path: '/content-builder',
      context: { 
        insights: chartInsights,
        dataPatterns: dataPatterns,
        suggestedTopics: generateContentTopics(dataPatterns, chartInsights)
      }
    });
  }
  
  if (contextualHints.hasAnalytics || dataPatterns.volatility === 'high') {
    actions.push({
      title: 'View Analytics Dashboard',
      description: 'See detailed analytics and performance metrics',
      icon: BarChart3,
      type: 'navigation',
      path: '/analytics',
      context: { 
        focusMetric: determineFocusMetric(dataPatterns, chartInsights),
        timeframe: 'current'
      }
    });
  }
  
  return actions;
}

function generateContentTopics(dataPatterns: any, chartInsights: any): string[] {
  const topics = [];
  
  if (dataPatterns.trend === 'increasing') {
    topics.push('Growth Strategies', 'Success Stories', 'Scaling Tips');
  } else if (dataPatterns.trend === 'decreasing') {
    topics.push('Recovery Plans', 'Optimization Guide', 'Problem Solving');
  }
  
  if (chartInsights.type === 'pie') {
    topics.push('Market Share Analysis', 'Distribution Strategies');
  } else if (chartInsights.type === 'line') {
    topics.push('Trend Analysis', 'Forecasting Guide');
  }
  
  return topics;
}

function determineFocusMetric(dataPatterns: any, chartInsights: any): string {
  if (dataPatterns.volatility === 'high') return 'volatility';
  if (dataPatterns.trend === 'increasing') return 'growth';
  if (dataPatterns.trend === 'decreasing') return 'retention';
  return 'overview';
}

function generateDataActions(chartData: any[], chartType: string): DataAction[] {
  return [
    {
      title: 'Export Data',
      description: 'Download this chart data as JSON or CSV',
      icon: Download,
      type: 'data',
      handler: () => {
        const dataStr = JSON.stringify(chartData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        const exportFileDefaultName = `chart-data-${Date.now()}.json`;
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
      }
    },
    {
      title: 'Schedule Report',
      description: 'Add this analysis to a recurring report',
      icon: Calendar,
      type: 'data',
      handler: () => {
        // This would integrate with a reporting system
        console.log('Schedule report functionality would be implemented here');
      }
    }
  ];
}