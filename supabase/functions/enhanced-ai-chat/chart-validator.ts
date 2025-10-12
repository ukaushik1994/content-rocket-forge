export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  correctedData?: any;
}

export function validateChartData(
  chartConfig: any,
  realContext: any
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  if (!chartConfig?.data || !Array.isArray(chartConfig.data)) {
    return { isValid: false, errors: ['Chart data is missing or invalid'], warnings: [] };
  }
  
  // Validate each data point
  chartConfig.data.forEach((dataPoint: any, index: number) => {
    // Check if name exists in real context
    const name = dataPoint.name || dataPoint.label;
    
    if (name) {
      // Check solutions
      const solutionExists = realContext.solutions?.some((s: any) => 
        s.name === name || s.short_description?.includes(name)
      );
      
      // Check content
      const contentExists = Object.keys(realContext.analytics?.contentBySolution || {})
        .some(key => key === name);
      
      if (!solutionExists && !contentExists) {
        warnings.push(`Data point "${name}" not found in real context`);
      }
    }
    
    // Validate numeric values
    Object.entries(dataPoint).forEach(([key, value]) => {
      if (typeof value === 'number' && key !== 'name' && key !== 'label') {
        // Check if value is suspiciously large
        if (value > 10000) {
          warnings.push(`Value for "${key}" (${value}) seems unusually large`);
        }
      }
    });
  });
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

// PHASE 5: Multi-chart validation
export function validateMultiChartAnalysis(
  visualData: any,
  realContext: any
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Validate structure
  if (visualData.type !== 'multi_chart_analysis') {
    return { isValid: false, errors: ['Not a multi-chart analysis'], warnings: [] };
  }
  
  // Validate charts array
  if (!visualData.charts || !Array.isArray(visualData.charts)) {
    errors.push('Multi-chart analysis missing charts array');
  } else {
    // Should have 2-4 charts
    if (visualData.charts.length < 2) {
      warnings.push(`Only ${visualData.charts.length} chart(s) - expected 2-4 for multi-chart`);
    } else if (visualData.charts.length > 4) {
      warnings.push(`Too many charts (${visualData.charts.length}) - optimal is 2-4`);
    }
    
    // Validate each chart
    let validCharts = 0;
    visualData.charts.forEach((chart: any, index: number) => {
      if (!chart.data || chart.data.length === 0) {
        warnings.push(`Chart ${index + 1} "${chart.title}" has no data`);
      } else if (!chart.title || !chart.subtitle) {
        warnings.push(`Chart ${index + 1} missing title or subtitle`);
      } else {
        validCharts++;
        // Validate individual chart data
        const chartValidation = validateChartData(chart, realContext);
        warnings.push(...chartValidation.warnings);
        errors.push(...chartValidation.errors);
      }
    });
    
    // Must have at least 1 valid chart
    if (validCharts === 0) {
      errors.push('No valid charts in multi-chart analysis');
    }
  }
  
  // Validate summary insights
  if (!visualData.summaryInsights) {
    warnings.push('Missing summary insights section');
  } else {
    if (!visualData.summaryInsights.metricCards || visualData.summaryInsights.metricCards.length === 0) {
      warnings.push('No metric cards in summary');
    }
    if (!visualData.summaryInsights.bulletPoints || visualData.summaryInsights.bulletPoints.length === 0) {
      warnings.push('No bullet points in summary');
    }
  }
  
  // Validate actionable items
  if (!visualData.actionableItems || visualData.actionableItems.length === 0) {
    warnings.push('No actionable items provided');
  } else {
    visualData.actionableItems.forEach((action: any, index: number) => {
      if (action.actionType === 'navigate' && !action.targetUrl) {
        warnings.push(`Action ${index + 1} "${action.title}" missing targetUrl`);
      }
    });
  }
  
  // Validate deep dive prompts
  if (!visualData.deepDivePrompts || visualData.deepDivePrompts.length < 3) {
    warnings.push('Insufficient deep dive prompts (expected 3-5)');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

export function extractDataSource(chartConfig: any, realContext: any): any {
  // NULL SAFETY: Handle all visualData structures
  if (!chartConfig) {
    console.warn('⚠️ extractDataSource: chartConfig is null/undefined');
    return null;
  }
  
  // Handle chart data (has chartConfig.data array)
  if (chartConfig.data && Array.isArray(chartConfig.data)) {
    return {
      ...chartConfig,
      data: chartConfig.data.map((point: any) => ({
        ...point,
        dataSource: `Extracted from ${point.category || 'context'} data`
      }))
    };
  }
  
  // Handle table data (has tableData instead)
  if (chartConfig.tableData) {
    console.log('✅ Table data structure detected');
    return {
      ...chartConfig,
      tableData: {
        ...chartConfig.tableData,
        dataSource: 'Extracted from database context'
      }
    };
  }
  
  // Handle metrics or other structures
  console.log('✅ Other visual data structure detected');
  return {
    ...chartConfig,
    dataSource: 'Extracted from real-time context'
  };
}
