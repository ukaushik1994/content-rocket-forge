export interface ChartTypeRecommendation {
  recommendedType: 'line' | 'bar' | 'pie' | 'area';
  confidence: number;
  reason: string;
  dataIssues?: string[];
}

/**
 * Analyzes data structure and recommends the best chart type
 */
export function recommendChartType(data: any[], chartType: string): ChartTypeRecommendation {
  // Check data structure
  const hasTimeField = data.some(d => 
    d.name?.match(/\d{4}/) || // Year
    d.name?.match(/jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec/i) || // Month
    d.name?.match(/week|day|month|quarter/i) // Time period
  );
  
  const hasMultipleValues = data.some(d => 
    Object.keys(d).filter(k => k !== 'name' && typeof d[k] === 'number').length > 1
  );
  
  const valueCount = data.length;
  const totalValue = data.reduce((sum, d) => sum + (d.value || 0), 0);
  
  // Recommendation logic
  if (chartType === 'pie') {
    // Validate pie chart suitability
    if (valueCount > 7) {
      return {
        recommendedType: 'bar',
        confidence: 0.8,
        reason: 'Too many categories for pie chart (>7). Bar chart is more readable.',
        dataIssues: [`${valueCount} categories - pie charts work best with ≤7`]
      };
    }
    if (!totalValue || totalValue === 0) {
      return {
        recommendedType: 'bar',
        confidence: 0.9,
        reason: 'Pie chart requires non-zero total value.',
        dataIssues: ['Total value is 0']
      };
    }
    return {
      recommendedType: 'pie',
      confidence: 0.9,
      reason: 'Good for showing composition/distribution'
    };
  }
  
  if (chartType === 'line') {
    if (!hasTimeField && valueCount < 5) {
      return {
        recommendedType: 'bar',
        confidence: 0.7,
        reason: 'Line charts work best with time-series or many data points. Consider bar chart.',
        dataIssues: ['No time field detected', `Only ${valueCount} points`]
      };
    }
    return {
      recommendedType: 'line',
      confidence: 0.9,
      reason: 'Good for showing trends over time'
    };
  }
  
  if (chartType === 'bar') {
    return {
      recommendedType: 'bar',
      confidence: 0.95,
      reason: 'Bar charts are versatile for categorical comparisons'
    };
  }
  
  if (chartType === 'area') {
    if (!hasTimeField) {
      return {
        recommendedType: 'bar',
        confidence: 0.75,
        reason: 'Area charts best for time-series. No time field detected.',
        dataIssues: ['No time field detected']
      };
    }
    return {
      recommendedType: 'area',
      confidence: 0.85,
      reason: 'Good for showing cumulative trends'
    };
  }
  
  return {
    recommendedType: 'bar',
    confidence: 0.6,
    reason: 'Default fallback'
  };
}

/**
 * Validates and potentially corrects chart configuration
 */
export function validateChartConfiguration(chart: any): { 
  isValid: boolean; 
  correctedChart?: any; 
  issues: string[];
  recommendation?: ChartTypeRecommendation;
} {
  const issues: string[] = [];
  
  // Check required fields
  if (!chart.type) issues.push('Missing chart type');
  if (!chart.data || chart.data.length === 0) issues.push('No data provided');
  if (!chart.title) issues.push('Missing chart title');
  
  if (issues.length > 0) {
    return { isValid: false, issues };
  }
  
  // Get recommendation
  const recommendation = recommendChartType(chart.data, chart.type);
  
  // Auto-correct if confidence is high and type is wrong
  if (recommendation.recommendedType !== chart.type && recommendation.confidence > 0.8) {
    return {
      isValid: true,
      correctedChart: {
        ...chart,
        type: recommendation.recommendedType,
        subtitle: chart.subtitle + ` (Optimized from ${chart.type} to ${recommendation.recommendedType})`
      },
      issues: recommendation.dataIssues || [],
      recommendation
    };
  }
  
  return {
    isValid: true,
    issues: recommendation.dataIssues || [],
    recommendation
  };
}
