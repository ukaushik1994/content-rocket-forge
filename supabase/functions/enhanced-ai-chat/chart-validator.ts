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
