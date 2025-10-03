import { ChartConfiguration } from '@/types/enhancedChat';

export interface DataAnalysis {
  dataType: 'categorical' | 'numerical' | 'time-series' | 'mixed';
  patterns: {
    trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal';
    distribution: 'normal' | 'skewed' | 'uniform' | 'bimodal';
    correlation: number; // -1 to 1
  };
  insights: string[];
  recommendations: {
    chartType: 'line' | 'bar' | 'pie' | 'area';
    reasoning: string;
    confidence: number; // 0 to 1
  };
}

export interface ChartRecommendation {
  type: 'line' | 'bar' | 'pie' | 'area';
  confidence: number;
  reasoning: string;
  suggestedOptions: {
    categories?: string[];
    colors?: string[];
    valueFormatter?: (value: number) => string;
  };
}

export class ChartIntelligenceService {
  /**
   * Analyze data and recommend optimal chart type
   */
  static analyzeDataForChart(data: any[], context?: string): DataAnalysis {
    console.log('🧠 ChartIntelligenceService: Analyzing data for optimal chart type', {
      dataLength: data.length,
      context,
      sampleData: data.slice(0, 3)
    });

    if (!data || data.length === 0) {
      return {
        dataType: 'mixed',
        patterns: { trend: 'stable', distribution: 'normal', correlation: 0 },
        insights: ['No data available for analysis'],
        recommendations: {
          chartType: 'bar',
          reasoning: 'Default chart type for empty data',
          confidence: 0
        }
      };
    }

    const sample = data[0];
    const keys = Object.keys(sample).filter(key => key !== 'name' && key !== 'label');
    
    // Detect data types
    const numericalKeys = keys.filter(key => 
      data.every(item => typeof item[key] === 'number' || !isNaN(Number(item[key])))
    );
    
    const hasTimeData = keys.some(key => 
      key.toLowerCase().includes('date') || 
      key.toLowerCase().includes('time') ||
      key.toLowerCase().includes('month') ||
      key.toLowerCase().includes('year')
    );

    const hasCategories = keys.length > numericalKeys.length;
    
    // Analyze patterns
    let trend: 'increasing' | 'decreasing' | 'stable' | 'seasonal' = 'stable';
    let correlation = 0;
    
    if (numericalKeys.length > 0) {
      const values = data.map(item => Number(item[numericalKeys[0]])).filter(v => !isNaN(v));
      if (values.length > 1) {
        const firstHalf = values.slice(0, Math.floor(values.length / 2));
        const secondHalf = values.slice(Math.floor(values.length / 2));
        const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
        
        if (secondAvg > firstAvg * 1.1) trend = 'increasing';
        else if (secondAvg < firstAvg * 0.9) trend = 'decreasing';
        
        // Simple correlation calculation for first two numerical columns
        if (numericalKeys.length > 1) {
          const values2 = data.map(item => Number(item[numericalKeys[1]])).filter(v => !isNaN(v));
          if (values.length === values2.length && values.length > 2) {
            correlation = this.calculateCorrelation(values, values2);
          }
        }
      }
    }

    // Generate insights
    const insights: string[] = [];
    if (hasTimeData) insights.push('Time-series data detected - line chart recommended for trends');
    if (numericalKeys.length > 2) insights.push('Multiple metrics detected - consider using grouped charts');
    if (data.length > 50) insights.push('Large dataset - consider data aggregation or filtering');
    if (Math.abs(correlation) > 0.7) insights.push(`Strong correlation detected (${correlation.toFixed(2)})`);

    // Recommend chart type
    let chartType: 'line' | 'bar' | 'pie' | 'area' = 'bar';
    let reasoning = '';
    let confidence = 0.8;

    if (hasTimeData && numericalKeys.length >= 1) {
      chartType = 'line';
      reasoning = 'Time-series data is best visualized with line charts to show trends over time';
      confidence = 0.9;
    } else if (data.length <= 8 && numericalKeys.length === 1) {
      chartType = 'pie';
      reasoning = 'Small categorical dataset with single metric - pie chart shows proportions well';
      confidence = 0.85;
    } else if (hasCategories && numericalKeys.length >= 1) {
      chartType = 'bar';
      reasoning = 'Categorical data with numerical values - bar chart provides clear comparisons';
      confidence = 0.8;
    } else if (trend !== 'stable') {
      chartType = 'area';
      reasoning = 'Trending data detected - area chart emphasizes magnitude of change';
      confidence = 0.75;
    }

    // Context-based adjustments
    if (context) {
      const lowerContext = context.toLowerCase();
      if (lowerContext.includes('performance') || lowerContext.includes('metric')) {
        if (chartType === 'pie') {
          chartType = 'bar';
          reasoning = 'Performance metrics are better compared using bar charts';
        }
      }
      if (lowerContext.includes('trend') || lowerContext.includes('over time')) {
        chartType = 'line';
        reasoning = 'Trend analysis requires line charts for temporal visualization';
        confidence = Math.max(confidence, 0.85);
      }
    }

    return {
      dataType: hasTimeData ? 'time-series' : hasCategories ? 'categorical' : 'numerical',
      patterns: {
        trend,
        distribution: 'normal', // Simplified for now
        correlation
      },
      insights,
      recommendations: {
        chartType,
        reasoning,
        confidence
      }
    };
  }

  /**
   * Generate comprehensive chart recommendations
   */
  static generateChartRecommendations(data: any[], context?: string): ChartRecommendation[] {
    const analysis = this.analyzeDataForChart(data, context);
    const recommendations: ChartRecommendation[] = [];

    // Primary recommendation
    recommendations.push({
      type: analysis.recommendations.chartType,
      confidence: analysis.recommendations.confidence,
      reasoning: analysis.recommendations.reasoning,
      suggestedOptions: this.getSuggestedOptions(data, analysis.recommendations.chartType)
    });

    // Alternative recommendations
    const alternatives = this.getAlternativeChartTypes(analysis.recommendations.chartType, data);
    recommendations.push(...alternatives);

    return recommendations.slice(0, 3); // Top 3 recommendations
  }

  /**
   * Auto-generate optimized chart configuration
   */
  static generateOptimalChartConfig(
    data: any[], 
    context?: string,
    preferredType?: 'line' | 'bar' | 'pie' | 'area'
  ): ChartConfiguration {
    console.log('🎯 Generating optimal chart config', { 
      dataLength: data.length, 
      context, 
      preferredType 
    });

    const analysis = this.analyzeDataForChart(data, context);
    const chartType = preferredType || analysis.recommendations.chartType;
    
    const sample = data[0] || {};
    const keys = Object.keys(sample);
    const categories = keys.filter(key => 
      key !== 'name' && 
      key !== 'label' && 
      (typeof sample[key] === 'number' || !isNaN(Number(sample[key])))
    );

    // Generate intelligent color scheme
    const colors = this.generateColorScheme(categories.length, context);
    
    // Create value formatter based on data type
    const valueFormatter = this.createValueFormatter(data, categories[0]);

    const config: ChartConfiguration = {
      type: chartType,
      title: context || 'Data Analysis',
      data: data,
      categories: categories,
      colors: colors,
      valueFormatter: valueFormatter,
      height: data.length > 20 ? 400 : 300
    };

    console.log('🎯 Generated chart config:', config);
    return config;
  }

  /**
   * Calculate correlation coefficient
   */
  private static calculateCorrelation(x: number[], y: number[]): number {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((total, xi, i) => total + xi * y[i], 0);
    const sumX2 = x.reduce((total, xi) => total + xi * xi, 0);
    const sumY2 = y.reduce((total, yi) => total + yi * yi, 0);

    const numerator = n * sumXY - sumX * sumY;
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));

    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Get alternative chart type recommendations
   */
  private static getAlternativeChartTypes(
    primaryType: 'line' | 'bar' | 'pie' | 'area',
    data: any[]
  ): ChartRecommendation[] {
    const alternatives: ChartRecommendation[] = [];

    switch (primaryType) {
      case 'line':
        alternatives.push({
          type: 'area',
          confidence: 0.7,
          reasoning: 'Area chart emphasizes magnitude while maintaining trend visibility',
          suggestedOptions: this.getSuggestedOptions(data, 'area')
        });
        if (data.length <= 12) {
          alternatives.push({
            type: 'bar',
            confidence: 0.6,
            reasoning: 'Bar chart for clearer individual value comparison',
            suggestedOptions: this.getSuggestedOptions(data, 'bar')
          });
        }
        break;

      case 'bar':
        alternatives.push({
          type: 'line',
          confidence: 0.6,
          reasoning: 'Line chart to show trends and relationships',
          suggestedOptions: this.getSuggestedOptions(data, 'line')
        });
        if (data.length <= 8) {
          alternatives.push({
            type: 'pie',
            confidence: 0.5,
            reasoning: 'Pie chart to show proportional relationships',
            suggestedOptions: this.getSuggestedOptions(data, 'pie')
          });
        }
        break;

      case 'pie':
        alternatives.push({
          type: 'bar',
          confidence: 0.8,
          reasoning: 'Bar chart for more precise value comparison',
          suggestedOptions: this.getSuggestedOptions(data, 'bar')
        });
        break;

      case 'area':
        alternatives.push({
          type: 'line',
          confidence: 0.8,
          reasoning: 'Line chart for cleaner trend visualization',
          suggestedOptions: this.getSuggestedOptions(data, 'line')
        });
        break;
    }

    return alternatives;
  }

  /**
   * Get suggested options for chart type
   */
  private static getSuggestedOptions(data: any[], chartType: 'line' | 'bar' | 'pie' | 'area') {
    const sample = data[0] || {};
    const categories = Object.keys(sample).filter(key => 
      key !== 'name' && key !== 'label' && typeof sample[key] === 'number'
    );

    return {
      categories,
      colors: this.generateColorScheme(categories.length),
      valueFormatter: this.createValueFormatter(data, categories[0])
    };
  }

  /**
   * Generate intelligent color scheme
   */
  private static generateColorScheme(count: number, context?: string): string[] {
    // Context-based color schemes
    if (context) {
      const lowerContext = context.toLowerCase();
      if (lowerContext.includes('performance') || lowerContext.includes('growth')) {
        return ['hsl(142, 76%, 36%)', 'hsl(221, 83%, 53%)', 'hsl(48, 96%, 53%)', 'hsl(0, 84%, 60%)'];
      }
      if (lowerContext.includes('analytics') || lowerContext.includes('data')) {
        return ['hsl(221, 83%, 53%)', 'hsl(262, 83%, 58%)', 'hsl(142, 76%, 36%)', 'hsl(48, 96%, 53%)'];
      }
    }

    // Default professional color scheme
    const baseColors = [
      'hsl(221, 83%, 53%)', // Blue
      'hsl(142, 76%, 36%)', // Green  
      'hsl(48, 96%, 53%)',  // Yellow
      'hsl(0, 84%, 60%)',   // Red
      'hsl(262, 83%, 58%)', // Purple
      'hsl(195, 100%, 39%)', // Cyan
      'hsl(31, 100%, 50%)',  // Orange
      'hsl(300, 76%, 72%)'   // Pink
    ];

    return baseColors.slice(0, Math.max(count, 1));
  }

  /**
   * Create value formatter based on data characteristics
   */
  private static createValueFormatter(data: any[], key?: string): (value: number) => string {
    if (!key || !data.length) {
      return (value: number) => value.toLocaleString();
    }

    const values = data.map(item => Number(item[key])).filter(v => !isNaN(v));
    const maxValue = Math.max(...values);
    const minValue = Math.min(...values);

    // Detect percentage data
    if (maxValue <= 1 && minValue >= 0) {
      return (value: number) => `${(value * 100).toFixed(1)}%`;
    }

    // Detect currency-like data
    if (key.toLowerCase().includes('price') || key.toLowerCase().includes('cost') || key.toLowerCase().includes('revenue')) {
      return (value: number) => `$${value.toLocaleString()}`;
    }

    // Large numbers
    if (maxValue > 1000000) {
      return (value: number) => `${(value / 1000000).toFixed(1)}M`;
    }
    if (maxValue > 1000) {
      return (value: number) => `${(value / 1000).toFixed(1)}K`;
    }

    return (value: number) => value.toLocaleString();
  }
}