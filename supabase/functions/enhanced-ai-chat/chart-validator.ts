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

export function extractDataSource(chartConfig: any, realContext: any): any {
  // Add data source attribution to each data point
  return {
    ...chartConfig,
    data: chartConfig.data.map((point: any) => ({
      ...point,
      dataSource: `Extracted from ${point.category || 'context'} data`
    }))
  };
}
