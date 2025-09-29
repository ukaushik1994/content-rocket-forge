import { useState, useCallback } from 'react';
import { ChartConfiguration, VisualData } from '@/types/enhancedChat';
import { AIChartGenerator, ChartGenerationRequest } from '@/services/aiChartGenerator';
import { useChartIntelligence } from './useChartIntelligence';

export interface UseSmartChartGenerationReturn {
  // Chart generation
  generateChart: (request: ChartGenerationRequest) => Promise<VisualData | null>;
  generateFromConversation: (userMessage: string, aiResponse: string, data?: any[]) => Promise<VisualData | null>;
  
  // Auto-detection
  shouldGenerateChart: (content: string, data?: any[]) => boolean;
  
  // State
  isGenerating: boolean;
  lastGenerated: VisualData | null;
  
  // Intelligence integration
  enhanceExistingChart: (config: ChartConfiguration) => ChartConfiguration;
}

export const useSmartChartGeneration = (): UseSmartChartGenerationReturn => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [lastGenerated, setLastGenerated] = useState<VisualData | null>(null);
  
  const { optimizeExistingChart } = useChartIntelligence();

  /**
   * Generate chart from request
   */
  const generateChart = useCallback(async (request: ChartGenerationRequest): Promise<VisualData | null> => {
    console.log('🤖 useSmartChartGeneration: Generating chart from request');
    setIsGenerating(true);
    
    try {
      const result = await AIChartGenerator.generateChart(request);
      setLastGenerated(result.visualData);
      return result.visualData;
    } catch (error) {
      console.error('Smart chart generation failed:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Generate chart from conversation context
   */
  const generateFromConversation = useCallback(async (
    userMessage: string, 
    aiResponse: string, 
    data?: any[]
  ): Promise<VisualData | null> => {
    console.log('🤖 useSmartChartGeneration: Generating chart from conversation');
    setIsGenerating(true);
    
    try {
      const result = await AIChartGenerator.generateFromConversation(userMessage, aiResponse, data);
      if (result) {
        setLastGenerated(result.visualData);
        return result.visualData;
      }
      return null;
    } catch (error) {
      console.error('Conversation chart generation failed:', error);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  /**
   * Check if chart should be generated from content
   */
  const shouldGenerateChart = useCallback((content: string, data?: any[]): boolean => {
    return AIChartGenerator.detectChartOpportunities(content, data);
  }, []);

  /**
   * Enhance existing chart with intelligence
   */
  const enhanceExistingChart = useCallback((config: ChartConfiguration): ChartConfiguration => {
    console.log('🧠 useSmartChartGeneration: Enhancing existing chart');
    return optimizeExistingChart(config);
  }, [optimizeExistingChart]);

  return {
    generateChart,
    generateFromConversation,
    shouldGenerateChart,
    isGenerating,
    lastGenerated,
    enhanceExistingChart
  };
};