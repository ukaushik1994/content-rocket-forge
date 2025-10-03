import { ChartConfiguration, VisualData } from '@/types/enhancedChat';
import { ChartIntelligenceService } from './chartIntelligenceService';

export interface ChartGenerationRequest {
  data: any[];
  context?: string;
  title?: string;
  description?: string;
  preferredType?: 'line' | 'bar' | 'pie' | 'area';
  autoOptimize?: boolean;
}

export interface ChartGenerationResponse {
  visualData: VisualData;
  recommendations: string[];
  confidence: number;
  alternatives: Array<{
    type: 'line' | 'bar' | 'pie' | 'area';
    reason: string;
  }>;
}

export class AIChartGenerator {
  /**
   * Generate intelligent chart configuration from data
   */
  static async generateChart(request: ChartGenerationRequest): Promise<ChartGenerationResponse> {
    console.log('🤖 AIChartGenerator: Generating intelligent chart from request:', request);

    const {
      data,
      context,
      title = 'AI Generated Chart',
      description = 'Automatically optimized visualization',
      preferredType,
      autoOptimize = true
    } = request;

    try {
      // Use chart intelligence service for optimal configuration
      const chartConfig = ChartIntelligenceService.generateOptimalChartConfig(
        data,
        context,
        preferredType
      );

      // Generate recommendations and alternatives
      const analysis = ChartIntelligenceService.analyzeDataForChart(data, context);
      const alternatives = ChartIntelligenceService.generateChartRecommendations(data, context);

      // Create visual data object
      const visualData: VisualData = {
        type: 'chart',
        chartConfig: {
          ...chartConfig,
          // Add AI-enhanced options
          height: data.length > 20 ? 400 : 300
        }
      };

      // Generate intelligent recommendations
      const recommendations = [
        ...analysis.insights,
        ...(autoOptimize ? this.generateOptimizationTips(data, chartConfig) : [])
      ];

      return {
        visualData,
        recommendations,
        confidence: analysis.recommendations.confidence,
        alternatives: alternatives.slice(1).map(alt => ({
          type: alt.type,
          reason: alt.reasoning
        }))
      };

    } catch (error) {
      console.error('Chart generation failed:', error);
      
      // Fallback to basic chart
      return {
        visualData: {
          type: 'chart',
          chartConfig: {
            type: 'bar',
            title: 'Data Visualization',
            data,
            categories: Object.keys(data[0] || {}).filter(k => k !== 'name'),
            colors: ['hsl(var(--primary))', 'hsl(var(--secondary))'],
            height: 300
          }
        },
        recommendations: ['Using fallback chart configuration'],
        confidence: 0.5,
        alternatives: []
      };
    }
  }

  /**
   * Detect chart opportunities in text/data with intelligent pattern recognition
   */
  static detectChartOpportunities(content: string, data?: any[]): boolean {
    console.log('🔍 Detecting chart opportunities:', { contentLength: content.length, dataLength: data?.length });
    
    // Check for explicit chart requests
    const chartKeywords = [
      'chart', 'graph', 'visualize', 'plot', 'show', 'display'
    ];
    const lowerContent = content.toLowerCase();
    const hasExplicitRequest = chartKeywords.some(keyword => lowerContent.includes(keyword));
    
    // If no data, no chart opportunity
    if (!data || data.length === 0) {
      return hasExplicitRequest; // Only return true if explicitly requested
    }

    // Analyze data structure for automatic visualization opportunities
    const dataPatterns = this.analyzeDataPatterns(data);
    
    // Automatic chart generation criteria (proactive)
    const shouldAutoGenerate = 
      dataPatterns.hasTimeSeriesData ||        // Has dates/timestamps → line chart
      dataPatterns.hasComparativeData ||       // Multiple categories with values → bar chart
      dataPatterns.hasDistributionData ||      // Parts of whole → pie chart
      dataPatterns.hasPerformanceMetrics;      // KPIs, scores → appropriate chart

    console.log('📊 Chart opportunity analysis:', {
      hasExplicitRequest,
      shouldAutoGenerate,
      patterns: dataPatterns
    });

    return hasExplicitRequest || shouldAutoGenerate;
  }

  /**
   * Analyze data structure to detect visualization patterns
   */
  private static analyzeDataPatterns(data: any[]): {
    hasTimeSeriesData: boolean;
    hasComparativeData: boolean;
    hasDistributionData: boolean;
    hasPerformanceMetrics: boolean;
    hasNumericColumns: boolean;
  } {
    if (!data || data.length === 0) {
      return {
        hasTimeSeriesData: false,
        hasComparativeData: false,
        hasDistributionData: false,
        hasPerformanceMetrics: false,
        hasNumericColumns: false
      };
    }

    const sample = data[0];
    const keys = Object.keys(sample);
    
    // Check for time-series data (dates, timestamps, time-based keys)
    const hasTimeSeriesData = keys.some(key => {
      const lowerKey = key.toLowerCase();
      return (
        lowerKey.includes('date') || 
        lowerKey.includes('time') || 
        lowerKey.includes('created') ||
        lowerKey.includes('updated') ||
        lowerKey.includes('month') ||
        lowerKey.includes('year')
      ) || data.every(item => {
        const value = item[key];
        return value instanceof Date || 
               (typeof value === 'string' && !isNaN(Date.parse(value)));
      });
    });

    // Check for comparative data (multiple items with numeric values)
    const hasNumericColumns = this.hasNumericColumns(data);
    const hasComparativeData = data.length >= 2 && hasNumericColumns;

    // Check for distribution data (percentage, ratio, parts-of-whole patterns)
    const hasDistributionData = keys.some(key => {
      const lowerKey = key.toLowerCase();
      return lowerKey.includes('percent') || 
             lowerKey.includes('ratio') || 
             lowerKey.includes('share') ||
             lowerKey.includes('distribution');
    });

    // Check for performance metrics (scores, rates, KPIs)
    const hasPerformanceMetrics = keys.some(key => {
      const lowerKey = key.toLowerCase();
      return lowerKey.includes('score') ||
             lowerKey.includes('rate') ||
             lowerKey.includes('metric') ||
             lowerKey.includes('kpi') ||
             lowerKey.includes('performance') ||
             lowerKey.includes('impression') ||
             lowerKey.includes('click') ||
             lowerKey.includes('conversion');
    });

    return {
      hasTimeSeriesData,
      hasComparativeData,
      hasDistributionData,
      hasPerformanceMetrics,
      hasNumericColumns
    };
  }

  /**
   * Auto-generate chart from conversational context
   */
  static async generateFromConversation(
    userMessage: string,
    aiResponse: string,
    contextData?: any[]
  ): Promise<ChartGenerationResponse | null> {
    console.log('🤖 AIChartGenerator: Analyzing conversation for chart opportunities');

    // Check if chart generation is warranted
    const shouldGenerateChart = this.detectChartOpportunities(
      userMessage + ' ' + aiResponse,
      contextData
    );

    if (!shouldGenerateChart || !contextData || contextData.length === 0) {
      return null;
    }

    // Extract context from conversation
    const context = this.extractChartContext(userMessage, aiResponse);
    
    return await this.generateChart({
      data: contextData,
      context,
      title: this.extractTitle(userMessage, aiResponse),
      description: 'Generated from conversation context',
      autoOptimize: true
    });
  }

  /**
   * Generate optimization tips for chart configuration
   */
  private static generateOptimizationTips(data: any[], config: ChartConfiguration): string[] {
    const tips: string[] = [];

    // Data size recommendations
    if (data.length > 50) {
      tips.push('Consider data aggregation or pagination for better performance');
    }

    // Chart type specific tips
    switch (config.type) {
      case 'pie':
        if (data.length > 8) {
          tips.push('Pie charts work best with 8 or fewer categories');
        }
        break;
      case 'line':
        tips.push('Line charts are excellent for showing trends over time');
        break;
      case 'bar':
        tips.push('Bar charts allow easy comparison between categories');
        break;
    }

    // Color scheme tips
    if (config.categories && config.categories.length > (config.colors?.length || 0)) {
      tips.push('Consider using a consistent color scheme for all data categories');
    }

    return tips;
  }

  /**
   * Check if data has numeric columns suitable for charting
   */
  private static hasNumericColumns(data: any[]): boolean {
    if (!data || data.length === 0) return false;
    
    const sample = data[0];
    const keys = Object.keys(sample);
    
    return keys.some(key => 
      key !== 'name' && 
      key !== 'label' &&
      data.every(item => typeof item[key] === 'number' || !isNaN(Number(item[key])))
    );
  }

  /**
   * Extract chart context from conversation
   */
  private static extractChartContext(userMessage: string, aiResponse: string): string {
    const combined = (userMessage + ' ' + aiResponse).toLowerCase();
    
    if (combined.includes('performance') || combined.includes('metric')) {
      return 'performance analytics';
    }
    if (combined.includes('trend') || combined.includes('over time')) {
      return 'trend analysis';
    }
    if (combined.includes('comparison') || combined.includes('compare')) {
      return 'comparative analysis';
    }
    if (combined.includes('growth') || combined.includes('increase')) {
      return 'growth analysis';
    }
    
    return 'data visualization';
  }

  /**
   * Extract title from conversation
   */
  private static extractTitle(userMessage: string, aiResponse: string): string {
    // Simple title extraction - can be enhanced with NLP
    const titles = [
      'Performance Metrics',
      'Trend Analysis', 
      'Data Comparison',
      'Analytics Overview',
      'Key Insights'
    ];
    
    return titles[Math.floor(Math.random() * titles.length)];
  }
}