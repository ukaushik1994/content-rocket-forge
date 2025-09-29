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
   * Detect chart opportunities in text/data
   */
  static detectChartOpportunities(content: string, data?: any[]): boolean {
    const chartKeywords = [
      'chart', 'graph', 'visualize', 'plot', 'trend', 'comparison',
      'analytics', 'data', 'metrics', 'performance', 'statistics',
      'growth', 'decline', 'correlation', 'distribution'
    ];

    const lowerContent = content.toLowerCase();
    const hasChartKeywords = chartKeywords.some(keyword => lowerContent.includes(keyword));
    const hasNumericData = data && data.length > 0 && this.hasNumericColumns(data);

    return hasChartKeywords || hasNumericData;
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