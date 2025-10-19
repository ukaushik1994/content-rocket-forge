import { useState, useCallback } from 'react';
import { VisualData, ChartConfiguration } from '@/types/enhancedChat';

interface RecoveryResult {
  needsRecovery: boolean;
  recoveryPrompt: string;
  confidence: number;
}

// Global debounce tracker to prevent rapid-fire recovery attempts
const lastRecoveryAttempt = { timestamp: 0, prompt: '' };

/**
 * Hook to detect empty/invalid chart data and automatically generate
 * intelligent follow-up prompts to fetch the missing data via AI tools
 */
export const useChartDataRecovery = (
  onSendMessage?: (message: string) => void
) => {
  const [isRecovering, setIsRecovering] = useState(false);

  /**
   * Detects if chart data is empty or invalid
   */
  const detectEmptyData = useCallback((visualData?: VisualData): boolean => {
    if (!visualData) return true;

    // Check if it's a chart with empty data
    if (visualData.type === 'chart') {
      const chartConfig = visualData.chartConfig;
      if (!chartConfig) return true;
      
      const data = chartConfig.data;
      if (!data || !Array.isArray(data) || data.length === 0) {
        return true;
      }
    }

    // Check if it's multi-chart analysis with all empty charts
    if (visualData.charts && Array.isArray(visualData.charts)) {
      const allEmpty = visualData.charts.every(chart => {
        const data = chart.data;
        return !data || !Array.isArray(data) || data.length === 0;
      });
      return allEmpty;
    }

    return false;
  }, []);

  /**
   * Generates an intelligent recovery prompt based on the context
   */
  const generateRecoveryPrompt = useCallback((
    visualData?: VisualData,
    originalQuery?: string
  ): string => {
    // Extract chart title or type for context
    const chartTitle = visualData?.title || 
                       visualData?.chartConfig?.title || 
                       'this visualization';
    
    // Analyze the original query to understand intent
    const query = originalQuery?.toLowerCase() || '';
    
    // Context-specific recovery prompts
    if (query.includes('proposal') || chartTitle.toLowerCase().includes('proposal')) {
      return 'Please use the get_proposals tool to fetch AI strategy proposals with limit 10 and show them in the visualization';
    }
    
    if (query.includes('content') || chartTitle.toLowerCase().includes('content')) {
      return 'Please use the get_content_items tool to fetch content items with limit 10, sorted by SEO score descending, and visualize the data';
    }
    
    if (query.includes('keyword') || chartTitle.toLowerCase().includes('keyword')) {
      return 'Please use the get_keywords tool to fetch keyword data with limit 20 and create the visualization';
    }
    
    if (query.includes('solution') || chartTitle.toLowerCase().includes('solution')) {
      return 'Please use the get_solutions tool to fetch all solutions and create the requested visualization';
    }
    
    // Generic recovery prompt
    return `I need data for \"${chartTitle}\". Please use the appropriate tools to fetch the data and create the visualization. Original request: ${originalQuery || 'show data'}`;
  }, []);

  /**
   * Determines if automatic recovery should be attempted
   */
  const shouldAttemptRecovery = useCallback((visualData?: VisualData): RecoveryResult => {
    const needsRecovery = detectEmptyData(visualData);
    
    if (!needsRecovery) {
      return { needsRecovery: false, recoveryPrompt: '', confidence: 0 };
    }

    // Check if this looks like a legitimate data request
    const hasValidStructure = visualData?.type === 'chart' || 
                              (visualData?.charts && Array.isArray(visualData.charts));
    
    const confidence = hasValidStructure ? 0.9 : 0.6;
    
    const recoveryPrompt = generateRecoveryPrompt(visualData);
    
    return {
      needsRecovery: true,
      recoveryPrompt,
      confidence
    };
  }, [detectEmptyData, generateRecoveryPrompt]);

  /**
   * Attempts to recover data by sending intelligent follow-up to AI
   */
  const attemptRecovery = useCallback(async (
    visualData?: VisualData,
    originalQuery?: string
  ): Promise<boolean> => {
    if (!onSendMessage) {
      console.warn('⚠️ Cannot attempt recovery: onSendMessage not provided');
      return false;
    }

    // Debounce check - prevent duplicate attempts within 1 second
    const now = Date.now();
    const prompt = generateRecoveryPrompt(visualData, originalQuery);
    
    if (now - lastRecoveryAttempt.timestamp < 1000 && lastRecoveryAttempt.prompt === prompt) {
      console.log('🔄 Skipping recovery - duplicate attempt blocked (debounced)');
      return false;
    }
    
    lastRecoveryAttempt.timestamp = now;
    lastRecoveryAttempt.prompt = prompt;

    const result = shouldAttemptRecovery(visualData);
    
    if (!result.needsRecovery || result.confidence < 0.5) {
      return false;
    }

    console.log('🔄 Attempting automatic data recovery:', {
      confidence: result.confidence,
      prompt: prompt
    });

    setIsRecovering(true);
    
    try {
      // Send recovery prompt to AI
      onSendMessage(prompt);
      
      // Recovery will be handled by the normal message flow
      return true;
    } catch (error) {
      console.error('❌ Failed to attempt recovery:', error);
      return false;
    } finally {
      // Keep recovering state for a bit to show loading
      setTimeout(() => setIsRecovering(false), 2000);
    }
  }, [shouldAttemptRecovery, onSendMessage, generateRecoveryPrompt]);

  return {
    detectEmptyData,
    generateRecoveryPrompt,
    shouldAttemptRecovery,
    attemptRecovery,
    isRecovering
  };
};

