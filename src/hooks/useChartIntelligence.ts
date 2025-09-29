import { useState, useEffect, useCallback } from 'react';
import { ChartConfiguration } from '@/types/enhancedChat';
import { ChartIntelligenceService, ChartRecommendation } from '@/services/chartIntelligenceService';

export interface UseChartIntelligenceReturn {
  // Chart analysis
  analyzeData: (data: any[], context?: string) => ChartRecommendation[];
  generateChart: (data: any[], context?: string, preferredType?: 'line' | 'bar' | 'pie' | 'area') => ChartConfiguration;
  
  // Smart recommendations
  recommendations: ChartRecommendation[];
  isAnalyzing: boolean;
  
  // Chart optimization
  optimizeExistingChart: (config: ChartConfiguration, newData?: any[]) => ChartConfiguration;
  suggestChartImprovements: (config: ChartConfiguration) => string[];
  
  // Auto-detection
  detectDataPatterns: (data: any[]) => {
    hasTimeData: boolean;
    hasCategoricalData: boolean;
    numericalColumns: string[];
    suggestedGrouping: string[];
  };
}

export const useChartIntelligence = (): UseChartIntelligenceReturn => {
  const [recommendations, setRecommendations] = useState<ChartRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  /**
   * Analyze data and generate chart recommendations
   */
  const analyzeData = useCallback((data: any[], context?: string): ChartRecommendation[] => {
    console.log('🧠 useChartIntelligence: Analyzing data for chart recommendations');
    setIsAnalyzing(true);
    
    try {
      const newRecommendations = ChartIntelligenceService.generateChartRecommendations(data, context);
      setRecommendations(newRecommendations);
      return newRecommendations;
    } catch (error) {
      console.error('Chart analysis failed:', error);
      return [];
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  /**
   * Generate optimized chart configuration
   */
  const generateChart = useCallback((
    data: any[], 
    context?: string, 
    preferredType?: 'line' | 'bar' | 'pie' | 'area'
  ): ChartConfiguration => {
    console.log('📊 useChartIntelligence: Generating optimized chart configuration');
    return ChartIntelligenceService.generateOptimalChartConfig(data, context, preferredType);
  }, []);

  /**
   * Optimize existing chart configuration
   */
  const optimizeExistingChart = useCallback((
    config: ChartConfiguration, 
    newData?: any[]
  ): ChartConfiguration => {
    console.log('🔄 useChartIntelligence: Optimizing existing chart configuration');
    
    const dataToAnalyze = newData || config.data;
    if (!dataToAnalyze || dataToAnalyze.length === 0) {
      return config;
    }

    // Re-analyze with new data
    const analysis = ChartIntelligenceService.analyzeDataForChart(dataToAnalyze);
    
    // Update colors if more categories detected
    const sample = dataToAnalyze[0] || {};
    const keys = Object.keys(sample);
    const categories = keys.filter(key => 
      key !== 'name' && 
      key !== 'label' && 
      (typeof sample[key] === 'number' || !isNaN(Number(sample[key])))
    );

    return {
      ...config,
      data: dataToAnalyze,
      categories: categories.length > 0 ? categories : config.categories,
      colors: ChartIntelligenceService['generateColorScheme'](categories.length),
      height: dataToAnalyze.length > 20 ? 400 : config.height || 300
    };
  }, []);

  /**
   * Suggest improvements for existing chart
   */
  const suggestChartImprovements = useCallback((config: ChartConfiguration): string[] => {
    const suggestions: string[] = [];
    
    // Data-based suggestions
    if (config.data.length > 50) {
      suggestions.push('Consider data aggregation or filtering for better readability');
    }
    
    if (config.categories && config.categories.length > 6) {
      suggestions.push('Too many categories - consider grouping or using a different chart type');
    }
    
    // Chart type suggestions
    const hasTimeData = config.data.some(item => 
      Object.keys(item).some(key => 
        key.toLowerCase().includes('date') || 
        key.toLowerCase().includes('time')
      )
    );
    
    if (hasTimeData && config.type !== 'line' && config.type !== 'area') {
      suggestions.push('Line or area charts work better for time-series data');
    }
    
    if (config.type === 'pie' && config.data.length > 8) {
      suggestions.push('Pie charts become hard to read with many categories - consider bar chart');
    }
    
    // Visual suggestions
    if (!config.colors || config.colors.length < config.categories?.length) {
      suggestions.push('Ensure sufficient colors for all data categories');
    }
    
    if (config.height && config.height < 200) {
      suggestions.push('Increase chart height for better readability');
    }
    
    return suggestions;
  }, []);

  /**
   * Detect data patterns for smart chart selection
   */
  const detectDataPatterns = useCallback((data: any[]) => {
    if (!data || data.length === 0) {
      return {
        hasTimeData: false,
        hasCategoricalData: false,
        numericalColumns: [],
        suggestedGrouping: []
      };
    }

    const sample = data[0];
    const keys = Object.keys(sample);
    
    const hasTimeData = keys.some(key => 
      key.toLowerCase().includes('date') || 
      key.toLowerCase().includes('time') ||
      key.toLowerCase().includes('month') ||
      key.toLowerCase().includes('year')
    );
    
    const numericalColumns = keys.filter(key => 
      data.every(item => typeof item[key] === 'number' || !isNaN(Number(item[key])))
    );
    
    const categoricalColumns = keys.filter(key => 
      !numericalColumns.includes(key) && 
      key !== 'name' && 
      key !== 'label'
    );
    
    const hasCategoricalData = categoricalColumns.length > 0;
    
    // Suggest grouping based on unique values
    const suggestedGrouping = categoricalColumns.filter(key => {
      const uniqueValues = [...new Set(data.map(item => item[key]))];
      return uniqueValues.length <= Math.max(8, data.length * 0.1);
    });

    return {
      hasTimeData,
      hasCategoricalData,
      numericalColumns,
      suggestedGrouping
    };
  }, []);

  return {
    analyzeData,
    generateChart,
    recommendations,
    isAnalyzing,
    optimizeExistingChart,
    suggestChartImprovements,
    detectDataPatterns
  };
};