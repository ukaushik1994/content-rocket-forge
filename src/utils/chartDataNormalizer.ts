/**
 * Chart Data Normalizer
 * Transforms various AI output formats into consistent chart-ready data structures
 */

export interface NormalizedChartData {
  name: string;
  value?: number;
  [key: string]: string | number | undefined;
}

export interface ChartNormalizationResult {
  data: NormalizedChartData[];
  categories: string[];
  series: Array<{ dataKey: string; name: string }>;
  wasNormalized: boolean;
  normalizations: string[];
}

/**
 * Common key mappings from various AI output formats to standard format
 */
const KEY_MAPPINGS: Record<string, string> = {
  label: 'name',
  category: 'name',
  title: 'name',
  item: 'name',
  key: 'name',
  count: 'value',
  amount: 'value',
  total: 'value',
  number: 'value',
  quantity: 'value',
  score: 'value',
  percent: 'value',
  percentage: 'value',
  // New mappings for radar/funnel/scatter charts
  stage: 'name',
  step: 'name',
  metric: 'value',
  x: 'x',
  y: 'y',
  size: 'z',
};

/**
 * Normalize a single data point
 */
function normalizeDataPoint(item: any, normalizations: string[]): NormalizedChartData {
  const normalized: NormalizedChartData = { name: '' };

  for (const [key, value] of Object.entries(item)) {
    const lowerKey = key.toLowerCase();
    
    // Map common alternative keys to standard keys
    if (KEY_MAPPINGS[lowerKey] && !item[KEY_MAPPINGS[lowerKey]]) {
      const standardKey = KEY_MAPPINGS[lowerKey];
      normalized[standardKey] = normalizeValue(value, standardKey);
      if (!normalizations.includes(`${key}→${standardKey}`)) {
        normalizations.push(`${key}→${standardKey}`);
      }
    } else {
      normalized[key] = normalizeValue(value, key);
    }
  }

  // Ensure 'name' exists
  if (!normalized.name && typeof normalized.name !== 'string') {
    // Try to find any string field to use as name
    const stringField = Object.entries(normalized).find(
      ([k, v]) => typeof v === 'string' && k !== 'name'
    );
    if (stringField) {
      normalized.name = stringField[1] as string;
      normalizations.push(`Used ${stringField[0]} as name`);
    } else {
      normalized.name = 'Unknown';
      normalizations.push('Added default name');
    }
  }

  return normalized;
}

/**
 * Normalize a value - convert strings to numbers where appropriate
 */
function normalizeValue(value: any, key: string): string | number {
  // If it's a numeric key and value is a numeric string, convert to number
  const numericKeys = ['value', 'count', 'amount', 'total', 'score', 'percent', 'percentage'];
  
  if (typeof value === 'string') {
    // Remove common formatting
    const cleanValue = value.replace(/[,$%]/g, '').trim();
    const numValue = parseFloat(cleanValue);
    
    if (!isNaN(numValue) && numericKeys.includes(key.toLowerCase())) {
      return numValue;
    }
  }
  
  if (typeof value === 'number') {
    return value;
  }
  
  return String(value ?? '');
}

/**
 * Validate if data is compatible with radar chart format
 * Radar charts need at least 3 numeric dimensions per data point
 */
export function isValidRadarData(data: any[]): boolean {
  if (!data || data.length === 0) return false;
  
  const sample = data[0];
  const numericKeys = Object.keys(sample).filter(
    k => typeof sample[k] === 'number' && k.toLowerCase() !== 'name'
  );
  return numericKeys.length >= 3;
}

/**
 * Validate if data is compatible with funnel chart format
 * Funnel charts need name and value fields with decreasing values (typically)
 */
export function isValidFunnelData(data: any[]): boolean {
  if (!data || data.length < 2) return false;
  
  return data.every(item => {
    const hasName = 'name' in item || 'stage' in item || 'step' in item;
    const hasValue = typeof item.value === 'number' || typeof item.count === 'number';
    return hasName && hasValue;
  });
}

/**
 * Validate if data is compatible with scatter chart format
 * Scatter charts need at least x and y numeric values
 */
export function isValidScatterData(data: any[]): boolean {
  if (!data || data.length === 0) return false;
  
  const sample = data[0];
  const numericKeys = Object.keys(sample).filter(
    k => typeof sample[k] === 'number'
  );
  return numericKeys.length >= 2;
}

/**
 * Detect the best chart type based on data structure
 */
export function detectOptimalChartType(data: any[], requestedType?: string): string {
  if (!data || data.length === 0) return requestedType || 'bar';

  const sample = data[0];
  const numericKeys = Object.keys(sample).filter(
    k => typeof sample[k] === 'number' && k !== 'name'
  );

  // Honor explicit chart type requests if data is compatible
  if (requestedType) {
    switch (requestedType) {
      case 'radar':
        if (isValidRadarData(data)) return 'radar';
        break;
      case 'funnel':
        if (isValidFunnelData(data)) return 'funnel';
        break;
      case 'scatter':
        if (isValidScatterData(data)) return 'scatter';
        break;
      case 'radial':
      case 'composed':
      case 'pie':
      case 'line':
      case 'area':
      case 'bar':
        return requestedType;
    }
  }

  // If only one numeric field and few data points, pie chart works well
  if (numericKeys.length === 1 && data.length <= 8) {
    return requestedType === 'pie' ? 'pie' : requestedType || 'bar';
  }

  // Multiple numeric fields (3+) suggest radar chart for multi-dimensional comparison
  if (numericKeys.length >= 3 && data.length <= 10) {
    return 'radar';
  }

  // Multiple numeric fields suggest line or bar chart
  if (numericKeys.length > 1) {
    return requestedType === 'line' ? 'line' : 'bar';
  }

  // Time-series data suggests line chart
  const hasTimeKey = Object.keys(sample).some(k => 
    ['date', 'time', 'month', 'year', 'day', 'week', 'period'].includes(k.toLowerCase())
  );
  if (hasTimeKey) {
    return 'line';
  }

  return requestedType || 'bar';
}

/**
 * Validate if data is compatible with pie chart format
 */
export function isValidPieData(data: any[]): boolean {
  if (!data || data.length === 0) return false;
  
  return data.every(item => {
    const hasName = 'name' in item && typeof item.name === 'string';
    const hasValue = 'value' in item && typeof item.value === 'number';
    return hasName && hasValue;
  });
}

/**
 * Convert data to pie-chart compatible format
 */
export function convertToPieFormat(data: any[]): NormalizedChartData[] {
  return data.map(item => {
    // Find the name field
    let name = item.name || item.label || item.category || item.title || 'Unknown';
    
    // Find the value field
    let value = item.value ?? item.count ?? item.amount ?? item.total ?? 0;
    
    // Ensure value is a number
    if (typeof value === 'string') {
      value = parseFloat(value.replace(/[,$%]/g, '')) || 0;
    }
    
    return { name: String(name), value: Number(value) };
  });
}

/**
 * Extract series configuration from data
 */
export function extractSeriesFromData(data: any[]): Array<{ dataKey: string; name: string }> {
  if (!data || data.length === 0) return [{ dataKey: 'value', name: 'Value' }];

  const sample = data[0];
  const numericKeys = Object.keys(sample).filter(
    k => typeof sample[k] === 'number' && k.toLowerCase() !== 'name'
  );

  if (numericKeys.length === 0) {
    return [{ dataKey: 'value', name: 'Value' }];
  }

  return numericKeys.map(key => ({
    dataKey: key,
    name: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')
  }));
}

/**
 * Main normalization function - transforms AI output to chart-ready format
 */
export function normalizeChartData(
  rawData: any[],
  requestedType?: string
): ChartNormalizationResult {
  const normalizations: string[] = [];

  if (!rawData || !Array.isArray(rawData) || rawData.length === 0) {
    return {
      data: [],
      categories: ['name'],
      series: [{ dataKey: 'value', name: 'Value' }],
      wasNormalized: false,
      normalizations: ['Empty data array']
    };
  }

  // Normalize each data point
  const normalizedData = rawData.map(item => normalizeDataPoint(item, normalizations));

  // Extract categories (the x-axis key)
  const categories = ['name'];

  // Extract series from the normalized data
  const series = extractSeriesFromData(normalizedData);

  // Special handling for pie charts
  if (requestedType === 'pie' && !isValidPieData(normalizedData)) {
    const pieData = convertToPieFormat(normalizedData);
    normalizations.push('Converted to pie format');
    return {
      data: pieData,
      categories: ['name'],
      series: [{ dataKey: 'value', name: 'Value' }],
      wasNormalized: true,
      normalizations
    };
  }

  return {
    data: normalizedData,
    categories,
    series,
    wasNormalized: normalizations.length > 0,
    normalizations
  };
}

/**
 * Full chart configuration normalizer
 */
export function normalizeChartConfig(config: any): {
  type: string;
  data: any[];
  categories: string[];
  series: Array<{ dataKey: string; name: string }>;
  title?: string;
  subtitle?: string;
  colors?: string[];
  height?: number;
  wasNormalized: boolean;
  normalizations: string[];
} {
  const normalizations: string[] = [];
  
  // Extract and normalize data
  const rawData = config.data || [];
  const normalizedResult = normalizeChartData(rawData, config.type);
  
  // Detect optimal chart type if current type doesn't fit data
  let chartType = config.type || 'bar';
  if (chartType === 'pie' && !isValidPieData(normalizedResult.data)) {
    chartType = 'bar';
    normalizations.push('Switched from pie to bar (incompatible data)');
  }
  
  // Use provided series/categories or fall back to detected ones
  const series = config.series || normalizedResult.series;
  const categories = config.categories || normalizedResult.categories;

  return {
    type: chartType,
    data: normalizedResult.data,
    categories,
    series,
    title: config.title,
    subtitle: config.subtitle,
    colors: config.colors,
    height: config.height || 300,
    wasNormalized: normalizedResult.wasNormalized || normalizations.length > 0,
    normalizations: [...normalizedResult.normalizations, ...normalizations]
  };
}
