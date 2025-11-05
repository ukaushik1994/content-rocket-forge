/**
 * Auto-fix chart data to ensure valid structures
 * Prevents empty charts from reaching the frontend
 */

export interface ChartConfiguration {
  type: string;
  data: any[];
  categories?: string[];
  series?: any[];
  title?: string;
  subtitle?: string;
  colors?: string[];
  height?: number;
  isPlaceholder?: boolean;
  dataNote?: string;
}

/**
 * Validates and auto-fixes a single chart to ensure it has valid data
 */
export function validateAndFixChart(chart: any): ChartConfiguration {
  // Ensure basic structure exists
  if (!chart) {
    return createPlaceholderChart('Unknown Chart');
  }

  // Ensure data exists and is an array
  if (!chart.data || !Array.isArray(chart.data) || chart.data.length === 0) {
    console.warn(`⚠️ Chart "${chart.title || 'Untitled'}" has no data - adding placeholder`);
    chart.data = [{ name: 'No Data', value: 0 }];
    chart.isPlaceholder = true;
    chart.dataNote = 'Data is being fetched...';
  }

  // Ensure categories exist
  if (!chart.categories || !Array.isArray(chart.categories) || chart.categories.length === 0) {
    // Extract categories from data
    if (chart.data && chart.data.length > 0) {
      const firstItem = chart.data[0];
      chart.categories = Object.keys(firstItem).filter(k => 
        k !== 'name' && k !== 'label' && k !== 'category' && k !== 'type'
      );
      
      // If still no categories, use 'value' as default
      if (chart.categories.length === 0) {
        chart.categories = ['value'];
      }
    } else {
      chart.categories = ['value'];
    }
  }

  // Ensure valid chart type
  const validTypes = ['line', 'bar', 'pie', 'area'];
  if (!validTypes.includes(chart.type)) {
    console.warn(`⚠️ Invalid chart type "${chart.type}" - defaulting to bar`);
    chart.type = 'bar'; // default fallback
  }

  // Ensure numeric values for data points
  if (chart.data && Array.isArray(chart.data)) {
    chart.data = chart.data.map(item => {
      const fixedItem: any = { ...item };
      
      // Ensure all numeric fields are actually numbers
      for (const key in fixedItem) {
        if (key !== 'name' && key !== 'label' && key !== 'category') {
          const value = fixedItem[key];
          if (typeof value === 'string' && !isNaN(parseFloat(value))) {
            fixedItem[key] = parseFloat(value);
          } else if (typeof value !== 'number') {
            fixedItem[key] = 0;
          }
        }
      }
      
      return fixedItem;
    });
  }

  // Ensure title exists
  if (!chart.title) {
    chart.title = `${chart.type.charAt(0).toUpperCase() + chart.type.slice(1)} Chart`;
  }

  return chart;
}

/**
 * Creates a placeholder chart when no valid data is available
 */
function createPlaceholderChart(title: string): ChartConfiguration {
  return {
    type: 'bar',
    title: title || 'Loading Chart',
    subtitle: 'Data is being loaded...',
    data: [{ name: 'Loading...', value: 0 }],
    categories: ['value'],
    isPlaceholder: true,
    dataNote: 'Fetching data...',
    height: 300
  };
}

/**
 * Validates and fixes multi-chart analysis
 */
export function validateAndFixMultiChartAnalysis(visualData: any): any {
  if (!visualData || !visualData.charts || !Array.isArray(visualData.charts)) {
    return visualData;
  }

  console.log('🔧 Auto-fixing multi-chart analysis...');
  
  // Validate and fix each chart
  visualData.charts = visualData.charts.map(chart => validateAndFixChart(chart));
  
  // Count placeholders
  const placeholderCount = visualData.charts.filter(c => c.isPlaceholder).length;
  if (placeholderCount > 0) {
    console.warn(`⚠️ ${placeholderCount} charts required placeholders`);
  }
  
  return visualData;
}

/**
 * Main entry point for chart validation and auto-fix
 */
export function autoFixChartData(visualData: any): any {
  if (!visualData) return visualData;

  // Handle multi-chart analysis
  if (visualData.type === 'multi_chart_analysis' && visualData.charts) {
    return validateAndFixMultiChartAnalysis(visualData);
  }

  // Handle single chart
  if (visualData.type === 'chart' && visualData.chartConfig) {
    visualData.chartConfig = validateAndFixChart(visualData.chartConfig);
  }

  // Handle direct chart types (line, bar, pie, area)
  if (['line', 'bar', 'pie', 'area'].includes(visualData.type)) {
    return validateAndFixChart(visualData);
  }

  return visualData;
}
