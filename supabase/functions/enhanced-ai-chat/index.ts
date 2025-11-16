// Force redeploy: 2025-06-05T14:30:00Z - NUCLEAR CACHE CLEAR
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { extractJSONBlocks, removeExtractedJSON } from './json-parser.ts';
import { analyzeQueryIntent } from './query-analyzer.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { estimateTokens } from '../shared/token-counter.ts';
import { TOOL_DEFINITIONS, executeToolCall } from './tools.ts';
import { 
  analyzeSerpIntent, 
  executeSerpAnalysis,
  generateSerpContext, 
  generateSmartSuggestions,
  generateStructuredSerpData
} from './serp-intelligence.ts';
import { generateChartPerspectives } from './chart-intelligence.ts';
import { autoFixChartData } from './chart-auto-fix.ts';
import { aiRequestQueue } from './request-queue.ts';

// PHASE 1: Multi-chart detection - detects when user needs multiple perspectives
function shouldGenerateMultipleCharts(query: string): boolean {
  const lowerQuery = query.toLowerCase();
  
  const multiChartTriggers = [
    /\b(performance|performing|how (is|are|did|does))\b.*\b(solution|content|keyword|proposal)/i,
    /\b(analyze|analysis|deep dive|comprehensive|detailed)\b/i,
    /\b(overview|summary|show (me |)all|everything about)\b/i,
    /\b(compare|comparison|vs|versus|against|between)\b/i,
    /\b(trend|breakdown|distribution|split)\b.*\b(by|across|for)\b/i,
    /\b(what('s| is) (my|the)|how (many|much))\b.*\b(total|all|entire)\b/i,
    /\blast (month|week|quarter|30 days)\b/i
  ];
  
  const hasMultiChartTrigger = multiChartTriggers.some(pattern => pattern.test(lowerQuery));
  
  // Check for data breadth indicators (multiple entities = multiple charts)
  const hasBreadthIndicators = /\b(all|multiple|various|different|across)\b/i.test(lowerQuery);
  
  if (hasMultiChartTrigger || hasBreadthIndicators) {
    console.log('📊📊📊 MULTI-CHART MODE ACTIVATED - Will generate 2-4 related charts');
    return true;
  }
  
  return false;
}

// Enhanced chart detection patterns - DEFAULT TO CHARTS
function detectChartRequest(query: string): { requested: boolean, type: string | null, confidence: number } {
  const lowerQuery = query.toLowerCase();
  
  // Check for EXPLICIT TABLE requests first (these override default chart behavior)
  const explicitTablePatterns = [
    /\b(show|give|list|display)\s+(me\s+)?(a\s+)?(table|tabular|spreadsheet)/,
    /\btable\s+(of|for|showing|with)/,
    /\blist\s+all\s+(data|items|records|rows)/,
    /\bexport\s+(data|this|the)/,
    /\b(raw|detailed)\s+data/
  ];
  
  for (const pattern of explicitTablePatterns) {
    if (pattern.test(lowerQuery)) {
      console.log('🚫 Explicit TABLE request detected - skipping chart generation');
      return { requested: false, type: 'table_explicit', confidence: 0.95 };
    }
  }
  
  // Explicit chart requests (high confidence)
  const explicitChartPatterns = [
    /\b(show|create|generate|make|build|display)\s+(me\s+)?(a\s+)?(chart|graph|plot|visualization|visual)/,
    /\b(chart|graph|plot)\s+(of|for|showing|displaying)/,
    /\bvisuali[sz]e\s+(this|the|my)/,
    /\b(bar|line|pie|area)\s+chart/,
    /\bgraph\s+(this|the|my)/
  ];
  
  for (const pattern of explicitChartPatterns) {
    if (pattern.test(lowerQuery)) {
      console.log('📊 Explicit CHART request detected');
      return { requested: true, type: 'explicit', confidence: 0.9 };
    }
  }
  
  // Competitor-specific chart patterns
  if (/competitor|competitive/i.test(lowerQuery)) {
    if (/compare|comparison|vs|versus/i.test(lowerQuery)) {
      console.log('📊🏆 Competitor COMPARISON chart detected');
      return { requested: true, type: 'competitor_comparison', confidence: 0.85 };
    }
    if (/landscape|market|position/i.test(lowerQuery)) {
      console.log('📊🌍 Market LANDSCAPE chart detected');
      return { requested: true, type: 'market_overview', confidence: 0.8 };
    }
  }
  
  // Implicit chart patterns (medium-high confidence)
  const implicitChartPatterns = [
    /\b(trend|trending|growth|decline|increase|decrease|over time|timeline|progression)/,
    /\b(comparison|compare|vs|versus|against|between)/,
    /\b(breakdown|distribution|split|composition)/,
    /\b(performance|metrics)\s+(over|across|by)/,
    /\b(tracking|monitoring)\s+/,
    /\b(analyze|analysis)\s+(trends|growth|performance)/
  ];
  
  for (const pattern of implicitChartPatterns) {
    if (pattern.test(lowerQuery)) {
      console.log('📊 Implicit CHART pattern detected');
      return { requested: true, type: 'implicit', confidence: 0.7 };
    }
  }
  
  // DEFAULT: Any data query should return a chart
  const dataKeywords = ['show', 'how many', 'what', 'analyze', 'data', 'metrics', 'stats', 'count', 'total', 'performance', 'content', 'keyword', 'solution', 'proposal', 'competitor'];
  const hasDataKeyword = dataKeywords.some(kw => lowerQuery.includes(kw));
  
  if (hasDataKeyword) {
    console.log('📊 Data query detected - defaulting to CHART (default behavior)');
    return { requested: true, type: 'implicit_data', confidence: 0.6 };
  }
  
  console.log('❓ No specific visualization type detected');
  return { requested: false, type: null, confidence: 0 };
}

// Enhanced conversion function with intelligent chart type selection
function convertMetricsToChart(metrics: any[], userQuery: string): any | null {
  if (!metrics || metrics.length === 0) return null;
  
  try {
    // Check if data is chart-compatible
    const hasNumericValues = metrics.some(m => {
      const value = m.value || m.count || m.total || m.amount || m.score;
      return typeof value === 'number' || !isNaN(parseFloat(value));
    });
    
    if (!hasNumericValues) {
      console.log('❌ Metrics not chart-compatible: no numeric values found');
      return null;
    }
    
    // Intelligent chart type selection
    let chartType = 'bar'; // default
    const queryLower = userQuery.toLowerCase();
    
    if (queryLower.includes('trend') || queryLower.includes('over time') || queryLower.includes('timeline')) {
      chartType = 'line';
    } else if (queryLower.includes('pie') || queryLower.includes('distribution') || queryLower.includes('breakdown')) {
      chartType = 'pie';
    } else if (queryLower.includes('area') || queryLower.includes('growth')) {
      chartType = 'area';
    }
    
    // Create enhanced chart data
    const chartData = {
      type: chartType,
      data: metrics.map(metric => {
        const value = metric.value || metric.count || metric.total || metric.amount || metric.score;
        return {
          name: metric.title || metric.label || metric.name || 'Unknown',
          value: typeof value === 'number' ? value : parseFloat(value) || 0
        };
      }),
      categories: ['value'],
      colors: ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))'],
      height: 300
    };
    
    console.log(`✅ Successfully converted ${metrics.length} metrics to ${chartType} chart`);
    return chartData;
  } catch (error) {
    console.error('Error converting metrics to chart:', error);
    return null;
  }
}

// Enhanced table to chart conversion
function convertTableToChart(tableData: any): any | null {
  if (!tableData || !tableData.rows || !tableData.headers) return null;
  
  try {
    const headers = tableData.headers;
    const rows = tableData.rows;
    
    // Find numeric columns
    const numericColumns = headers.slice(1).filter((_: string, colIndex: number) => {
      return rows.some((row: any[]) => !isNaN(parseFloat(row[colIndex + 1])));
    });
    
    if (numericColumns.length === 0) return null;
    
    // Use first numeric column for chart
    const valueColumnIndex = headers.indexOf(numericColumns[0]);
    const labelColumnIndex = 0; // Assume first column is labels
    
    const chartData = {
      type: 'bar',
      data: rows.slice(0, 10).map((row: any[]) => ({ // Limit to 10 items for readability
        name: row[labelColumnIndex] || 'Unknown',
        value: parseFloat(row[valueColumnIndex]) || 0
      })),
      categories: ['value'],
      height: 300
    };
    
    console.log(`✅ Successfully converted table to chart (${rows.length} rows)`);
    return chartData;
  } catch (error) {
    console.error('Error converting table to chart:', error);
    return null;
  }
}

// Content sanitization function to prevent raw data leakage
function sanitizeResponseContent(content: string): string {
  // Remove <think> tags FIRST (both complete blocks and orphaned tags)
  let cleaned = content
    // Remove complete <think>...</think> blocks with their content
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    // Remove any orphaned or malformed <think> or </think> tags
    .replace(/<\/?think>/gi, '')
    // Remove any raw CSV-like patterns
    .replace(/^[A-Za-z\s,]+(?:,\s*[A-Za-z\s]+)*\n(?:[^,\n]*,\s*)*[^,\n]*$/gm, '')
    // Remove quoted CSV data patterns
    .replace(/^"[^"]*"(?:,\s*"[^"]*")*$/gm, '')
    // Remove standalone JSON objects that shouldn't be in text
    .replace(/^\s*\{[\s\S]*?\}\s*$/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  // Only replace if content is virtually empty after cleaning
  if (cleaned.length < 10 && content.length > 500) {
    console.log('⚠️ Content too short after sanitization, using fallback message');
    return "I've prepared the data you requested. Please use the action buttons below to access the formatted information.";
  }

  return cleaned || content;
}

/**
 * Build multi-chart system prompt for structured AI responses
 */
function buildMultiChartSystemPrompt(): string {
  return `You are an advanced business intelligence AI assistant. When users ask data-related questions, you MUST return a structured JSON response with the following format:

{
  "visualData": {
    "type": "multi_chart_analysis",
    "title": "AI-Generated Title Based on User Query",
    "subtitle": "Brief description of what this analysis shows",
    
    "summaryInsights": {
      "metricCards": [
        { "id": "1", "title": "Key Metric", "value": "123", "change": { "value": 12, "type": "increase", "period": "vs last month" }, "icon": "TrendingUp", "color": "green" }
      ],
      "bulletPoints": [
        "Key insight with specific data",
        "Trend or comparison insight",
        "Opportunity or issue highlight"
      ],
      "paragraphSummary": "Narrative summary connecting insights with strategic context.",
      "alerts": [
        { "type": "warning", "message": "Items needing attention" }
      ]
    },
    
    "charts": [
      {
        "type": "line",
        "title": "Trend Over Time",
        "subtitle": "Performance progression",
        "data": [...],
        "categories": ["Jan", "Feb"],
        "series": [{ "dataKey": "value", "name": "Performance" }],
        "chartInsights": ["25% upward trend", "Peak in March"]
      }
    ],
    
    "actionableItems": [
      {
        "id": "1",
        "title": "Action Title",
        "description": "Action description",
        "priority": "high",
        "actionType": "navigate",
        "targetUrl": "/content-builder",
        "icon": "FileText",
        "estimatedImpact": "+20% engagement",
        "timeRequired": "15 minutes"
      }
    ],
    
    "deepDivePrompts": [
      "How does this compare to previous period?",
      "What factors contributed to changes?",
      "Show detailed breakdown"
    ]
  }
}

CRITICAL FORMATTING RULES FOR CONVERSATIONAL RESPONSES:

## MARKDOWN TABLE RULES (EXTREMELY IMPORTANT)

When presenting tabular data, you MUST follow this EXACT format:

✅ CORRECT MARKDOWN TABLE FORMAT:
| Header 1 | Header 2 | Header 3 |
| --- | --- | --- |
| Data 1 | Data 2 | Data 3 |
| Data 4 | Data 5 | Data 6 |

MANDATORY TABLE RULES:
1. Line 1: Header row with pipes at start and end: | Header | Header |
2. Line 2: Separator row with ONLY dashes: | --- | --- |
3. Line 3+: Data rows, ONE per line: | Data | Data |
4. Each cell MUST be on the SAME ROW, separated by single pipes |
5. NEVER put header separator (---) on the same line as data
6. NEVER mix header content and data on one line
7. Empty cells: Use spaces between pipes: |  | Data |
8. Column count MUST be consistent across all rows

❌ NEVER DO THIS (these break rendering):
| Header | Data --- More Data | Values |
| Mixed content --- separator | all | wrong |
| Query Type | Impressions | What This Means | --- | --- | --- |

📝 WHEN TO USE TABLES vs LISTS:
- Tables: Comparing 3+ data points across 2+ distinct categories
- Lists: Sequential information, single-column data, narratives

IF DATA DOESN'T FIT TABLE FORMAT, use bulleted lists:
- **Item 1**: Value (description)
- **Item 2**: Value (description)

## GENERAL TEXT FORMATTING RULES:
1. NEVER use pipe characters (|) in conversational text - they break markdown rendering
2. Use markdown headers (## Section, ### Subsection) to structure content
3. Use bullet lists (- item) or numbered lists (1. item) for data presentation
4. Use **bold** for emphasis, not surrounded by ASCII separators
5. Separate sections with blank lines, not with | --- | or similar patterns
   
   GOOD EXAMPLE:
   ## Content Analysis
   
   ### Key Findings:
   1. **Content Status**: 6 draft articles, 1 published (total 7)
   2. **SEO Health**: All content has 0/100 SEO scores
   3. **Top Performing Topic**: People Analytics with 6 pieces
   
   ### Recommendations:
   - Optimize SEO scores across all content
   - Publish draft articles
   - Focus on high-performing topics
   
   BAD EXAMPLE (NEVER DO THIS):
   | --- | --- |
   | Topic | Content pieces |
   | SEO Health | 0/100 scores |

7. Only use proper markdown tables when explicitly asked or when data has 3+ columns
8. Keep responses clean, scannable, and professional

CRITICAL CHART DATA FORMAT RULES:
9. **Pie Charts** require STRICT data format:
   - MANDATORY format: [{ name: 'Category Name', value: 123 }]
   - 'name' field: string category label (REQUIRED)
   - 'value' field: numeric value (REQUIRED, must be number type, not string)
   - NO nested objects, NO additional fields in data array
   - Example CORRECT: [{ name: 'Draft', value: 6 }, { name: 'Published', value: 1 }]
   - Example WRONG: [{ label: 'Draft', count: '6' }] (wrong keys, string value)
   - If data doesn't match this exact format, use a bar chart instead
10. **Bar/Line Charts**: Use consistent dataKey names across series
11. **All Charts**: Ensure numeric values are numbers, not strings

CRITICAL: Include 2-4 charts, all summary types, 3-5 actions with targetUrl, 3-5 deep dive questions. Use accurate data.`;
}

/**
 * Validate AI-generated data
 */
async function validateAIGeneratedData(visualData: any, supabase: any): Promise<any> {
  console.log('🔍 Validating AI-generated data...');
  
  const warnings: string[] = [];
  let confidence = 100;
  
  if (!visualData.charts || visualData.charts.length === 0) {
    warnings.push('No charts generated');
    confidence -= 20;
  }
  
  if (visualData.charts) {
    for (const chart of visualData.charts) {
      if (!chart.data || chart.data.length === 0) {
        warnings.push(`Chart "${chart.title}" has no data`);
        confidence -= 15;
      }
    }
  }
  
  if (!visualData.summaryInsights) {
    warnings.push('Missing summary insights');
    confidence -= 15;
  }
  
  if (visualData.actionableItems) {
    visualData.actionableItems = visualData.actionableItems.map((item: any) => {
      if (item.actionType === 'navigate' && !item.targetUrl) {
        warnings.push(`Action "${item.title}" missing targetUrl`);
        confidence -= 5;
        item.targetUrl = '/';
      }
      return item;
    });
  }
  
  console.log(`✅ Validation: ${confidence}% confidence, ${warnings.length} warnings`);
  
  return {
    ...visualData,
    validationStatus: {
      isValid: confidence > 60,
      confidence,
      warnings: warnings.length > 0 ? warnings : undefined
    }
  };
}

/**
 * Generate multiple chart perspectives from a single chart
 * This ensures we always show data from multiple angles
 */
function generateMultipleChartPerspectives(originalChart: any): any[] {
  const charts: any[] = [];
  
  // Always include the original chart first
  charts.push(originalChart);
  
  const chartType = originalChart.chartConfig?.type;
  const chartData = originalChart.chartConfig?.data || [];
  
  // Only generate alternatives if we have valid data
  if (!chartData || chartData.length === 0) {
    return charts;
  }
  
  // 1. If it's a pie chart, generate a bar chart variant
  if (chartType === 'pie' && chartData.length > 0) {
    const barChart = {
      ...originalChart,
      title: `${originalChart.title} (Bar View)`,
      description: originalChart.description,
      chartConfig: {
        ...originalChart.chartConfig,
        type: 'bar',
        xAxis: { dataKey: 'name', label: 'Category' },
        yAxis: { label: 'Value' },
        bars: [{ dataKey: 'value', fill: '#8884d8', name: 'Value' }]
      }
    };
    charts.push(barChart);
  }
  
  // 2. If it's a bar/line chart with time data, generate area chart
  if ((chartType === 'bar' || chartType === 'line') && hasTimeSeriesData(chartData)) {
    const areaChart = {
      ...originalChart,
      title: `${originalChart.title} (Trend View)`,
      description: `Trend analysis: ${originalChart.description}`,
      chartConfig: {
        ...originalChart.chartConfig,
        type: 'area',
        areas: originalChart.chartConfig.bars?.map((bar: any) => ({
          dataKey: bar.dataKey,
          fill: bar.fill,
          stroke: bar.fill,
          name: bar.name
        })) || originalChart.chartConfig.lines || []
      }
    };
    charts.push(areaChart);
  }
  
  // 3. Always generate a table view for data inspection
  if (chartData.length > 0 && chartData.length <= 20) {
    const tableChart = {
      ...originalChart,
      title: `${originalChart.title} (Data Table)`,
      description: 'Detailed data breakdown',
      chartConfig: {
        type: 'table',
        data: chartData,
        columns: Object.keys(chartData[0] || {}).map(key => ({
          key,
          label: key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')
        }))
      }
    };
    charts.push(tableChart);
  }
  
  // 4. If data has comparison potential, generate comparison chart
  if (hasComparisonData(chartData) && chartType !== 'pie') {
    const comparisonChart = {
      ...originalChart,
      title: `${originalChart.title} (Comparison)`,
      description: `Comparative analysis: ${originalChart.description}`,
      chartConfig: {
        ...originalChart.chartConfig,
        type: 'bar',
        layout: 'horizontal',
        bars: originalChart.chartConfig.bars || []
      }
    };
    charts.push(comparisonChart);
  }
  
  console.log(`📊 Generated ${charts.length} chart perspectives:`, charts.map(c => c.title));
  return charts;
}

/**
 * Check if data contains time series information
 */
function hasTimeSeriesData(data: any[]): boolean {
  if (!data || data.length === 0) return false;
  
  const firstItem = data[0];
  const keys = Object.keys(firstItem);
  
  // Look for common time-related keys
  const timeKeys = ['date', 'time', 'month', 'year', 'week', 'day', 'timestamp', 'created_at'];
  return keys.some(key => timeKeys.some(timeKey => key.toLowerCase().includes(timeKey)));
}

/**
 * Check if data has comparison potential (multiple numeric columns)
 */
function hasComparisonData(data: any[]): boolean {
  if (!data || data.length === 0) return false;
  
  const firstItem = data[0];
  const numericKeys = Object.keys(firstItem).filter(key => {
    const value = firstItem[key];
    return typeof value === 'number' && !key.toLowerCase().includes('id');
  });
  
  // If we have multiple numeric columns, it's good for comparison
  return numericKeys.length >= 2 || data.length >= 3;
}

// Enhanced JSON parsing with better error recovery
function parseResponseWithFallback(content: string): { message: string; actions?: any[]; visualData?: any; } {
  try {
    const jsonBlocks = extractJSONBlocks(content);
    let actions, visualData;
    
    for (const block of jsonBlocks) {
      if (block.actions) {
        actions = Array.isArray(block.actions) ? block.actions : JSON.parse(block.actions);
      }
      if (block.visualData) {
        visualData = block.visualData;
      } else if (block.type && (block.metrics || block.data || block.headers)) {
        visualData = block;
      }
    }
    
    const cleanedMessage = sanitizeResponseContent(removeExtractedJSON(content));
    
    return {
      message: cleanedMessage,
      actions,
      visualData
    };
  } catch (error) {
    console.log('Parsing failed, using content sanitization only:', error);
    return {
      message: sanitizeResponseContent(content)
    };
  }
}

// Enhanced real data fetching function with Smart Context Loading (Option B)
async function fetchRealDataContext(userId: string, queryIntent: QueryIntent, userQuery: string = '') {
  try {
    // TOOL-BASED APPROACH: Fetch ONLY basic counts
    console.log('📊 Fetching basic data counts only (tools will fetch detailed data on demand)...');
    
    const { count: contentCount } = await supabase
      .from('content_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: proposalCount } = await supabase
      .from('ai_strategy_proposals')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: keywordCount } = await supabase
      .from('keywords')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: solutionCount } = await supabase
      .from('solutions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: competitorCount } = await supabase
      .from('company_competitors')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: competitorSolutionCount } = await supabase
      .from('competitor_solutions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Build minimal context string with basic stats
    const contextString = `
## Available Data Summary (${new Date().toISOString()}):
- **Content Items**: ${contentCount || 0} total
- **AI Strategy Proposals**: ${proposalCount || 0} total
- **Keywords**: ${keywordCount || 0} researched
- **Solutions/Products**: ${solutionCount || 0} defined
- **Competitors**: ${competitorCount || 0} tracked
- **Competitor Solutions**: ${competitorSolutionCount || 0} products analyzed

## How to Access Detailed Data:

You have access to 8 powerful tools to fetch exactly the data you need:

1. **get_content_items** - Fetch content with filters (status, SEO score, type)
2. **get_keywords** - Fetch keyword data (volume, difficulty)
3. **get_proposals** - Fetch AI proposals (status, priority, impressions)
4. **get_solutions** - Fetch solutions/products
5. **get_seo_scores** - Fetch SEO performance metrics
6. **get_serp_analysis** - Fetch fresh SERP analysis data
7. **get_competitors** - Fetch competitor profiles, SWOT, intelligence (NEW)
8. **get_competitor_solutions** - Fetch competitor products, features, pricing (NEW)

**CRITICAL INSTRUCTIONS:**
- When user asks about specific data, USE TOOLS to fetch it
- Start with small limits (5-10 items) unless user asks for "all"
- Only fetch what you actually need to answer the question
- Use filters to get precise data (e.g., status="published", min_seo_score=70)

**Examples:**
- User: "Show my best content" → Call get_content_items with min_seo_score=80, limit=5
- User: "What proposals are available?" → Call get_proposals with status="available", limit=10
- User: "Analyze keyword performance" → Call get_keywords with limit=20
- User: "Who are my competitors?" → Call get_competitors with limit=10, include_intelligence=true
- User: "What products does [competitor] offer?" → Call get_competitor_solutions with competitor_name="...", limit=10
- User: "Show competitor SWOT analysis" → Call get_competitors with include_intelligence=true
- User: "Compare competitor pricing" → Call get_competitor_solutions with include_pricing=true

**Remember:** The counts above show total data available. Use tools to dive deeper when needed.
`;

    // Store counts for TOOL_USAGE_MODULE replacement
    return {
      contextString,
      counts: {
        contentCount: contentCount || 0,
        proposalCount: proposalCount || 0,
        keywordCount: keywordCount || 0,
        solutionCount: solutionCount || 0,
        competitorCount: competitorCount || 0,
        competitorSolutionCount: competitorSolutionCount || 0
      }
    };
  } catch (error) {
    console.error('❌ Error fetching context:', error);
    return `## Error Loading Context\nUnable to fetch data: ${error.message}`;
  }
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Initialize Supabase client for SERP operations
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate user
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid authorization' }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, context } = await req.json();
    const use_case = context?.use_case; // Extract use_case from context
    console.log("🚀 Processing enhanced AI chat request for user:", user.id, use_case ? `(use_case: ${use_case})` : '');

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ✅ NEW: Analyze query intent BEFORE fetching context
    const userQuery = messages[messages.length - 1]?.content || '';
    console.log('🎯 Analyzing query intent...');
    const queryIntent = analyzeQueryIntent(userQuery);
    console.log(`📊 Intent Analysis:`, {
      scope: queryIntent.scope,
      categories: queryIntent.categories,
      estimatedTokens: queryIntent.estimatedTokens,
      confidence: queryIntent.confidence
    });

    // Get active providers using same logic as Content Builder (AIServiceController)
    // 1. Check user_llm_keys for OpenRouter
    let openrouterKey = null;
    const { data: llmKey } = await supabase
      .from('user_llm_keys')
      .select('api_key, provider')
      .eq('user_id', user.id)
      .eq('provider', 'openrouter')
      .eq('is_active', true)
      .maybeSingle();
    
    if (llmKey?.api_key) {
      openrouterKey = llmKey.api_key;
    }

    // 2. Get the single active AI service provider (Single Active Provider Mode)
    const { data: allProviders, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('provider, api_key, preferred_model, status, priority')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1); // Only one provider should be active at a time

    if (providerError) {
      console.error("❌ Error fetching providers:", providerError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch AI providers" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Filter valid providers with API keys and models
    const validProviders = (allProviders || []).filter(p => {
      // Must have a model configured
      if (!p.preferred_model || p.preferred_model.trim() === '') {
        return false;
      }
      
      // OpenRouter uses user_llm_keys table
      if (p.provider === 'openrouter' && openrouterKey) {
        return true;
      }
      
      // Other providers must have api_key in ai_service_providers
      return p.api_key && p.api_key.trim() !== '';
    });

    if (validProviders.length === 0) {
      console.error("❌ No active AI provider with valid API key found");
      const hasInactive = (allProviders || []).length > 0;
      return new Response(JSON.stringify({ 
        error: hasInactive 
          ? "No active AI provider found. Please toggle ON a provider in Settings → AI Service Hub." 
          : "No AI provider configured. Please add and test an API key in Settings → AI Service Hub."
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the single active provider (only one should be active at a time)
    const provider = validProviders[0];
    
    // Use openrouter key from user_llm_keys if available
    if (provider.provider === 'openrouter' && openrouterKey) {
      provider.api_key = openrouterKey;
    }

    console.log(`🔑 Using active provider: ${provider.provider} (model: ${provider.preferred_model})`)

    // Analyze the user query for intent and SERP opportunities
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    console.log("🧠 Analyzing query for context and SERP opportunities:", userQuery);
    
    // STEP 1: Detect if query would benefit from SERP data
    const serpIntelligence = await analyzeSerpIntent(userQuery);
    let serpContext = '';
    let serpData = null;
    
    if (serpIntelligence.shouldTriggerSerp && serpIntelligence.keywords.length > 0) {
      console.log("🔍 SERP opportunity detected, fetching real-time data:", serpIntelligence);
      try {
        const serpResults = await executeSerpAnalysis(serpIntelligence.keywords, serpIntelligence.queryType);
        if (serpResults.length > 0) {
          serpContext = generateSerpContext(serpResults);
          
          // Generate structured SERP data for chart generation
          const structuredSerpData = generateStructuredSerpData(serpResults);
          
          serpData = {
            keywords: serpIntelligence.keywords,
            results: serpResults,
            analysisType: serpIntelligence.queryType,
            suggestions: generateSmartSuggestions(serpResults),
            structured: structuredSerpData
          };
          
          // Add structured data to context as JSON for easy AI parsing
          if (structuredSerpData) {
            serpContext += `\n\n📊 STRUCTURED SERP DATA FOR CHARTS:\n\`\`\`json\n${JSON.stringify(structuredSerpData, null, 2)}\n\`\`\`\n`;
          }
          
          console.log("✅ SERP data successfully integrated into AI context with structured data");
        }
      } catch (error: any) {
        // Check if it's a rate limit error
        if (error.message?.includes('rate limit') || error.message?.includes('exceeded')) {
          console.warn("⚠️ SERP API rate limited - continuing without SERP data");
          // Add informative message to context instead of failing
          serpContext = `\n\n⚠️ Note: SERP data temporarily unavailable due to API rate limits. Providing analysis based on internal data.\n`;
        } else {
          console.error("❌ SERP analysis failed, continuing without SERP data:", error);
        }
      }
    } else {
      console.log('❌ No SERP intent detected');
    }

    // Build enhanced system prompt with context
    // Fetch real data from database using tiered context
    const { contextString: realDataContext, counts } = await fetchRealDataContext(user.id, queryIntent, userQuery);
    
    // Import prompt modules
    const {
      BASE_PROMPT,
      CHART_MODULE,
      MULTI_CHART_MODULE,
      TABLE_MODULE,
      SERP_MODULE,
      ACTION_MODULE,
      MINIMAL_PROMPT,
      RESPONSE_STRUCTURE,
      TOOL_USAGE_MODULE
    } = await import('../shared/prompt-modules.ts');

    // Build dynamic system prompt based on query intent
    let systemPrompt = '';
    
    // Check token budget early
    const contextTokens = estimateTokens(JSON.stringify(realDataContext));
    const messagesTokens = messages.reduce((sum: number, msg: any) => 
      sum + estimateTokens(msg.content), 0
    );
    
    const preliminaryTotal = contextTokens + messagesTokens;
    
    console.log(`📊 Preliminary Token Check:
  - Context: ${contextTokens} tokens
  - Messages: ${messagesTokens} tokens
  - Total (before system prompt): ${preliminaryTotal} tokens`);
    
    // GRADUATED PROMPT FALLBACK SYSTEM (Phase 3 Fix)
    if (preliminaryTotal > 40000) {
      // EXTREME: Strip everything for token emergency (very rare)
      console.error('🚨 EXTREME token usage (>40k) - using MINIMAL_PROMPT');
      systemPrompt = MINIMAL_PROMPT;
    } else if (preliminaryTotal > 25000) {
      // HIGH: Keep essentials + tools + charts (preserve core functionality)
      console.warn('⚠️ High token usage (25k-40k) - using BASE + TOOL_USAGE + CHART_MODULE only');
      systemPrompt = BASE_PROMPT;
      
      // Replace count placeholders in TOOL_USAGE_MODULE
      const toolUsageWithCounts = TOOL_USAGE_MODULE
        .replace('{contentCount}', counts.contentCount.toString())
        .replace('{proposalCount}', counts.proposalCount.toString())
        .replace('{keywordCount}', counts.keywordCount.toString())
        .replace('{solutionCount}', counts.solutionCount.toString());
      
      systemPrompt += '\n\n' + toolUsageWithCounts; // Critical for tool-based architecture
      systemPrompt += '\n\n' + RESPONSE_STRUCTURE;
      systemPrompt += '\n\n' + CHART_MODULE;
      
      // Add SERP module if SERP data present (critical for SERP queries)
      if (serpContext) {
        systemPrompt += '\n\n' + SERP_MODULE;
        systemPrompt += `\n\n### 🔍 SERP DATA (USE THIS REAL DATA):\n${serpContext}`;
      }
    } else {
      // NORMAL: Full prompt with all modules
      console.log('✅ Normal token usage (<25k) - using full dynamic prompt');
      
      // START WITH TOOL USAGE MODULE (most critical for tool-based architecture)
      systemPrompt = BASE_PROMPT;
      
      // Replace count placeholders in TOOL_USAGE_MODULE
      const toolUsageWithCounts = TOOL_USAGE_MODULE
        .replace('{contentCount}', counts.contentCount.toString())
        .replace('{proposalCount}', counts.proposalCount.toString())
        .replace('{keywordCount}', counts.keywordCount.toString())
        .replace('{solutionCount}', counts.solutionCount.toString());
      
      systemPrompt += '\n\n' + toolUsageWithCounts;
      systemPrompt += '\n\n' + RESPONSE_STRUCTURE;
      
      // PHASE 3: Check if multi-chart mode should be activated
      const needsMultiChart = shouldGenerateMultipleCharts(userQuery);
      
      if (needsMultiChart) {
        console.log('📊📊📊 MULTI-CHART MODE ACTIVATED - Enhanced analysis with multiple perspectives');
        systemPrompt += '\n\n' + MULTI_CHART_MODULE; // Use multi-chart module instead of regular CHART_MODULE
        systemPrompt += '\n\n' + TABLE_MODULE;
        systemPrompt += '\n\n' + ACTION_MODULE;
      } else if (queryIntent.requiresVisualData || queryIntent.scope === 'detailed' || queryIntent.scope === 'full') {
        console.log('📊 Using standard chart analysis prompt');
        systemPrompt += '\n\n' + CHART_MODULE;
        systemPrompt += '\n\n' + TABLE_MODULE;
      } else {
        systemPrompt += '\n\n' + CHART_MODULE;
        systemPrompt += '\n\n' + TABLE_MODULE;
      }
      
      // Add SERP module if SERP data present
      if (serpContext) {
        systemPrompt += '\n\n' + SERP_MODULE;
        systemPrompt += `\n\n### 🔍 SERP DATA (USE THIS REAL DATA):\n${serpContext}`;
      }
      
      // Add action module for complex queries
      if (queryIntent.scope !== 'summary') {
        systemPrompt += '\n\n' + ACTION_MODULE;
      }
    }
    
    // Inject real data context
    systemPrompt += `\n\n## REAL DATA CONTEXT - USE THIS FACTUAL INFORMATION:\n${realDataContext}`;
    
    console.log(`✅ Dynamic system prompt built:
  - Scope: ${queryIntent.scope}
  - Modules: ${preliminaryTotal > 20000 ? 'MINIMAL' : 'BASE + conditional modules'}
  - Estimated prompt tokens: ${estimateTokens(systemPrompt)}`);

    // Token budget check BEFORE calling AI (reusing variables from preliminary check)
    const systemPromptTokens = estimateTokens(systemPrompt);
    const totalTokens = contextTokens + messagesTokens + systemPromptTokens;

    // Phase 6: Dynamic token budget scaling for large context models (260K)
    const estimatedModelContext = 260000; // LM Studio model context window
    const outputTokenRatio = 0.15; // Allow ~15% for output (~39K), enabling ~220K input
    const dynamicMaxTokens = Math.min(
      Math.max(
        Math.floor(estimatedModelContext * outputTokenRatio),
        30000 // Minimum 30K tokens for detailed responses
      ),
      100000 // Maximum 100K tokens (reasonable cap)
    );

    console.log(`📊 Token Budget Check:
  - Context: ${contextTokens} tokens
  - Messages: ${messagesTokens} tokens
  - System Prompt: ${systemPromptTokens} tokens
  - Total Input: ${totalTokens} tokens (Max: 220,000)
  - Model Context Window: ${estimatedModelContext}
  - Dynamic Max Output Tokens: ${dynamicMaxTokens}
  - Total With Output: ${totalTokens + dynamicMaxTokens}
  - Remaining Budget: ${estimatedModelContext - (totalTokens + dynamicMaxTokens)}
  - Input Utilization: ${((totalTokens / 220000) * 100).toFixed(1)}%
  - Status: ${totalTokens < 220000 ? '✅ INPUT SAFE' : '⚠️ INPUT EXCEEDS 220K'}
`);

    // Validate input token limit (220K max)
    const maxInputTokens = 220000;
    if (totalTokens > maxInputTokens) {
      console.error(`🚨 INPUT TOKEN LIMIT EXCEEDED: ${totalTokens} > ${maxInputTokens}`);
      throw new Error(`Context too large (${totalTokens} tokens). Maximum input: ${maxInputTokens.toLocaleString()} tokens. Please reduce context or use more specific queries.`);
    }

    // Safety check: total (input + output) shouldn't exceed model context
    if ((totalTokens + dynamicMaxTokens) > estimatedModelContext) {
      console.warn(`⚠️ Total tokens (${totalTokens + dynamicMaxTokens}) approaches model limit (${estimatedModelContext})`);
    }


    // Initialize tool cache for this request
    const toolCache = new Map<string, { data: any; timestamp: number }>();

    // Call ai-proxy edge function with user's provider (including tools) with retry logic
    let aiProxyResult = null;
    let aiProxyError = null;
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 AI call attempt ${attempt}/${maxRetries}`);
      
      const result = await aiRequestQueue.enqueue(() =>
        supabase.functions.invoke('ai-proxy', {
          body: {
            service: provider.provider,
            endpoint: 'chat',
            apiKey: provider.api_key,
            params: {
              model: provider.preferred_model,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                ...messages,
              ],
              tools: TOOL_DEFINITIONS, // ✅ Add tools for function calling
              temperature: 0.7,
              max_tokens: dynamicMaxTokens,
            }
          }
        })
      );
      
      if (!result.error && result.data?.success) {
        aiProxyResult = result.data;
        aiProxyError = null;
        console.log(`✅ AI call succeeded on attempt ${attempt}`);
        break;
      }
      
      aiProxyError = result.error || result.data?.error;
      
      // Handle rate limiting with exponential backoff
      const errorMsg = (typeof aiProxyError === 'string' ? aiProxyError : aiProxyError?.message) || '';
      if (errorMsg.includes('429') || 
          errorMsg.toLowerCase().includes('rate limit') ||
          errorMsg.includes('Please try again')) {
        console.warn(`⏰ Rate limit hit, attempt ${attempt}/${maxRetries}`);
        if (attempt < maxRetries) {
          const waitTime = 5000 * attempt;
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(r => setTimeout(r, waitTime));
          continue;
        }
      } else if (attempt < maxRetries) {
        const waitTime = 2000 * attempt;
        console.log(`⏳ Waiting ${waitTime}ms before retry...`);
        await new Promise(r => setTimeout(r, waitTime));
      }
    }

    if (aiProxyError || !aiProxyResult?.success) {
      console.error("AI request failed after all retries:", aiProxyError);
      return new Response(JSON.stringify({ 
        error: "Failed to get AI response",
        details: typeof aiProxyError === 'string' ? aiProxyError : (aiProxyError?.message || aiProxyResult?.error),
        message: "AI service temporarily unavailable. Please try again in a moment."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = aiProxyResult.data;
    let aiMessage = data?.choices?.[0]?.message?.content;
    const toolCalls = data?.choices?.[0]?.message?.tool_calls;

    // ✅ Handle tool calls if AI requested them
    if (toolCalls && toolCalls.length > 0) {
      console.log(`🔧 AI requested ${toolCalls.length} tool calls`);
      
      const toolResults = [];
      const toolExecutionStart = Date.now();
      
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const toolStart = Date.now();
        
        console.log(`[TOOL] ${toolName} | user: ${user.id} | params:`, toolArgs);
        
        try {
          const toolData = await executeToolCall(toolName, toolArgs, supabase, user.id, toolCache);
          const toolDuration = Date.now() - toolStart;
          
          console.log(`[TOOL] ${toolName} | SUCCESS | time: ${toolDuration}ms | results: ${Array.isArray(toolData) ? toolData.length : 'N/A'} items`);
          
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolName,
            content: JSON.stringify(toolData)
          });
        } catch (error) {
          const toolDuration = Date.now() - toolStart;
          console.error(`[TOOL] ${toolName} | FAILED | time: ${toolDuration}ms | error:`, error);
          
          // Return empty array instead of error to allow AI to continue
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolName,
            content: JSON.stringify([]) // Empty array for graceful degradation
          });
        }
      }
      
      const totalToolTime = Date.now() - toolExecutionStart;
      console.log(`✅ All tools executed in ${totalToolTime}ms`);
      
      // Call AI again with tool results
      console.log(`🔧 Calling AI again with ${toolResults.length} tool results`);
      
      let secondCallResult = null;
      let secondCallError = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        const result = await supabase.functions.invoke('ai-proxy', {
          body: {
            service: provider.provider,
            endpoint: 'chat',
            apiKey: provider.api_key,
            params: {
              model: provider.preferred_model,
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                ...messages,
                data.choices[0].message, // Original AI message with tool_calls
                ...toolResults // Tool results
              ],
              temperature: 0.7,
              max_tokens: dynamicMaxTokens,
            }
          }
        });
        
        if (!result.error && result.data?.success) {
          secondCallResult = result.data;
          secondCallError = null;
          console.log(`✅ Second AI call succeeded on attempt ${attempt}`);
          break;
        }
        
        secondCallError = result.error;
        
        // Handle rate limiting with exponential backoff
        if (secondCallError && (
          secondCallError.message?.includes('429') || 
          secondCallError.message?.includes('rate limit') || 
          secondCallError.message?.includes('Rate limit')
        )) {
          console.warn(`⏰ Rate limit hit on second call, attempt ${attempt}/${maxRetries}`);
          if (attempt < maxRetries) {
            const waitTime = 5000 * attempt;
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(r => setTimeout(r, waitTime));
            continue;
          }
        } else if (attempt < maxRetries) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
      
      if (secondCallError || !secondCallResult?.success) {
        console.error("❌ Second AI call failed after tools:", secondCallError);
        throw new Error("Second AI call failed after tool execution");
      }
      
      aiMessage = secondCallResult.data?.choices?.[0]?.message?.content;
      console.log(`✅ Received final AI response after tool execution (${aiMessage?.length || 0} chars)`);
    }

    // Remove <think> tags AGGRESSIVELY before any other processing
    if (aiMessage) {
      const originalLength = aiMessage.length;
      const hadThinkTags = aiMessage.includes('<think>') || aiMessage.includes('< think>');
      
      // Multiple passes to catch all variations
      aiMessage = aiMessage
        // Remove with any amount of whitespace in tags
        .replace(/<\s*think\s*>[\s\S]*?<\s*\/\s*think\s*>/gi, '')
        // Standard tags
        .replace(/<think>[\s\S]*?<\/think>/gi, '')
        // With newlines
        .replace(/<think>\n[\s\S]*?\n<\/think>/gi, '')
        // Orphaned opening/closing tags
        .replace(/<\/?think>/gi, '')
        // Any remaining variations
        .replace(/< ?\/?think ?>/gi, '')
        .trim();
      
      if (hadThinkTags) {
        console.log(`🧠 Removed <think> tags: ${originalLength} → ${aiMessage.length} chars`);
      }
      
      // Final safety check
      if (aiMessage.includes('think>')) {
        console.warn('⚠️ WARNING: <think> tag remnants still detected in response!');
        console.log('Problematic content:', aiMessage.substring(0, 500));
      }
    }

    if (!aiMessage) {
      console.error("No response from AI", data);
      console.log("Full AI response data:", JSON.stringify(data, null, 2));
      return new Response(JSON.stringify({ 
        error: "No response content received",
        message: "The AI service returned an empty response. Please try rephrasing your question or try again in a moment.",
        details: "Empty AI response"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`📝 AI Response received (${aiMessage.length} characters)`);
    console.log("🔍 Response preview:", aiMessage.substring(0, 300));
    
    // ✅ CRITICAL: Bypass JSON parser for strategy generation
    if (use_case === 'strategy') {
      console.log('📋 Strategy use case detected - returning raw JSON response');
      return new Response(
        JSON.stringify({
          response: aiMessage, // Raw JSON array for strategies
          content: aiMessage,  // Fallback
          metadata: {
            processed_at: new Date().toISOString(),
            use_case: 'strategy',
            bypass_json_parser: true
          }
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Phase 4: Response size monitoring for large context models
    if (aiMessage.length > 15000) {
      console.warn(`⚠️ Very long AI response (${aiMessage.length} chars) - may contain truncation issues`);
      console.warn('💡 Consider adjusting max_tokens or using streaming for better UX');
    }

    // Check if response appears truncated mid-code-block
    if (aiMessage.endsWith('```') && !aiMessage.endsWith('```\n')) {
      console.error('🚨 Response appears truncated mid-code-block!');
    }

    // Enhanced chart request detection
    const chartRequest = detectChartRequest(userQuery);
    
    if (chartRequest.requested) {
      console.log(`📊 Chart visualization detected: ${chartRequest.type} (confidence: ${chartRequest.confidence})`);
    }
    
    // Parse the response for structured data
    console.log('🔍 Parsing AI response for structured data...');
    
    // Phase 5: Minimal pipe cleaning - trust AI formatting from strict prompt
    const cleanAIPipes = (text: string): string => {
      if (!text) return text;
      
      // ONLY remove truly impossible patterns - trust everything else
      return text
        .replace(/\|\|\|+/g, '|') // Triple pipes → single pipe
        .replace(/\|\s*\|\s*\|/g, '| |'); // Empty repeated pipes → single empty cell
    };
    
    // Response validation to catch formatting issues
    const validateResponseFormatting = (text: string): { isValid: boolean; issues: string[] } => {
      const issues: string[] = [];
      
      // Check for repeated pipe separators (sign of malformation)
      const separatorPattern = /\|\s*-+\s*\|\s*-+\s*\|/g;
      if (separatorPattern.test(text)) {
        issues.push('Repeated pipe separators detected');
      }
      
      // Check for excessive pipes in non-table context
      const lines = text.split('\n');
      const suspiciousLines = lines.filter(line => {
        const trimmed = line.trim();
        const pipeCount = (line.match(/\|/g) || []).length;
        // Suspicious if has pipes but not a proper table row
        return pipeCount > 0 && pipeCount < 3 && 
               !(trimmed.startsWith('|') && trimmed.endsWith('|'));
      });
      
      if (suspiciousLines.length > 3) {
        issues.push(`Excessive pipe characters in conversational text (${suspiciousLines.length} lines)`);
      }
      
      // Check for duplicate sections (same header appearing twice)
      const headers = lines.filter(l => l.trim().startsWith('##'));
      const headerTexts = headers.map(h => h.trim());
      const uniqueHeaders = new Set(headerTexts);
      if (headerTexts.length > uniqueHeaders.size) {
        const duplicates = headerTexts.filter((h, i) => headerTexts.indexOf(h) !== i);
        issues.push(`Duplicate sections detected: ${[...new Set(duplicates)].join(', ')}`);
      }
      
      // Phase 5: Check for invalid table structures (telemetry)
      const tableLines = lines.filter(line => {
        const trimmed = line.trim();
        return trimmed.startsWith('|') && trimmed.endsWith('|');
      });
      
      if (tableLines.length >= 3) {
        // Basic table validation
        const header = tableLines[0];
        const separator = tableLines[1];
        
        const headerCols = (header.match(/\|/g) || []).length - 1;
        const isSeparator = /^\|[\s\-|]+\|$/.test(separator) && separator.includes('---');
        
        if (!isSeparator) {
          issues.push('table_missing_separator');
          console.error('🚨 AI GENERATED INVALID TABLE - Missing separator row', {
            userQuery: userQuery.substring(0, 100),
            tablePreview: tableLines.slice(0, 3).join('\n'),
            timestamp: new Date().toISOString()
          });
        } else {
          const separatorCols = (separator.match(/\|/g) || []).length - 1;
          if (headerCols !== separatorCols) {
            issues.push('table_column_mismatch');
            console.error('🚨 AI GENERATED INVALID TABLE - Column mismatch', {
              userQuery: userQuery.substring(0, 100),
              headerCols,
              separatorCols,
              tablePreview: tableLines.slice(0, 3).join('\n'),
              timestamp: new Date().toISOString()
            });
          }
        }
      }
      
      return {
        isValid: issues.length === 0,
        issues
      };
    };
    
    let cleanedResponse: string;
    let actions: any[] | undefined;
    let visualData: any | undefined;
    
    try {
      const parsedResponse = parseResponseWithFallback(aiMessage);
      cleanedResponse = parsedResponse.message;
      actions = parsedResponse.actions;
      visualData = parsedResponse.visualData;
      
      // Clean pipe characters from the response text
      if (cleanedResponse) {
        const beforeClean = cleanedResponse;
        cleanedResponse = cleanAIPipes(cleanedResponse);
        
        // Validate formatting quality
        const validation = validateResponseFormatting(cleanedResponse);
        if (!validation.isValid) {
          console.warn('⚠️ Response formatting issues detected:', validation.issues);
          console.warn('📝 Response preview:', cleanedResponse.substring(0, 200));
        } else {
          console.log('✅ Response formatting validation passed');
        }
      }
      
      // If parsing fails but response is valid text, use it anyway
      if (!cleanedResponse && aiMessage.length > 50) {
        console.warn('⚠️ JSON parsing failed, using raw response as fallback');
        cleanedResponse = cleanAIPipes(aiMessage);
        visualData = undefined;
        actions = undefined;
      }
    } catch (parseError) {
      console.error('❌ Critical parsing error:', parseError);
      // Fallback to raw message with pipe cleaning
      cleanedResponse = cleanAIPipes(aiMessage);
      visualData = undefined;
      actions = undefined;
    }
    
    // Import validation functions
    const { validateChartData, validateMultiChartAnalysis, extractDataSource } = await import('./chart-validator.ts');
    
    // Validate multi-chart analysis data
    if (visualData && visualData.type === 'multi_chart_analysis') {
      console.log('🔍 Validating multi-chart analysis data...');
      try {
        // Use the new comprehensive multi-chart validator
        const multiChartValidation = validateMultiChartAnalysis(visualData, context);
        
        if (!multiChartValidation.isValid) {
          console.error('❌ Multi-chart validation failed:', multiChartValidation.errors);
          // Downgrade to basic validation
          visualData = await validateAIGeneratedData(visualData, supabase);
        } else {
          console.log(`✅ Multi-chart validation passed with ${multiChartValidation.warnings.length} warnings`);
          if (multiChartValidation.warnings.length > 0) {
            console.warn('⚠️ Multi-chart warnings:', multiChartValidation.warnings);
          }
          // Add validation metadata
          visualData.validationStatus = {
            isValid: true,
            confidence: 100 - (multiChartValidation.warnings.length * 10),
            warnings: multiChartValidation.warnings.length > 0 ? multiChartValidation.warnings : undefined
          };
        }
      } catch (validationError) {
        console.error('❌ Multi-chart validation error:', validationError);
        // Fallback to basic validation
        visualData = await validateAIGeneratedData(visualData, supabase);
      }
    }
    // Validate single chart data accuracy
    else if (visualData && visualData.chartConfig) {
      console.log('🔍 Validating chart data accuracy...');
      
      const validation = validateChartData(visualData.chartConfig, context);
      
      if (!validation.isValid) {
        console.error('❌ Chart validation failed:', validation.errors);
        // Hard validation - reject chart
        visualData = null;
        
        // Add feedback message for user
        cleanedResponse = (cleanedResponse || aiMessage) + "\n\n⚠️ Chart data validation failed. Please ensure all data comes from your actual content.";
      } else if (validation.warnings.length > 0) {
        console.warn('⚠️ Chart validation warnings:', validation.warnings);
        // Add warning banner to chart
        visualData.warnings = validation.warnings;
      }
      
      // Add data source attribution
      if (visualData) {
        visualData = extractDataSource(visualData, context);
      }
      
      console.log('✅ Chart validation complete');
    }
    // Validate table data
    else if (visualData && visualData.type === 'table' && visualData.tableData) {
      console.log('🔍 Validating table data...');
      
      const { validateTableData } = await import('./chart-validator.ts');
      const validation = validateTableData(visualData.tableData);
      
      if (!validation.isValid) {
        console.error('❌ Table validation failed:', validation.errors);
        visualData = null;
        cleanedResponse = (cleanedResponse || aiMessage) + "\n\n⚠️ Table data validation failed. The AI may have used incorrect format.";
      } else if (validation.warnings.length > 0) {
        console.warn('⚠️ Table validation warnings:', validation.warnings);
      }
      
      console.log('✅ Table validation complete');
    }
    
    // AUTO-CONVERT TO CHARTS (unless user explicitly asked for table)
    if (visualData && visualData.type !== 'chart' && chartRequest.type !== 'table_explicit') {
      console.log(`📊 Auto-converting ${visualData.type} to chart (default behavior)...`);
      
      // Try metrics to chart conversion
      if (visualData.type === 'metrics' && visualData.metrics) {
        const chartData = convertMetricsToChart(visualData.metrics, userQuery);
        if (chartData) {
          console.log('✅ Successfully converted metrics to chart');
          visualData = { type: 'chart', chartConfig: chartData };
        }
      }
      
      // Try table to chart conversion ONLY if user didn't explicitly ask for table
      else if (visualData.type === 'table' && visualData.tableData) {
        const wantsTable = /table|list|top \d+|rank|compare|show me all|tell me about|what are|show my|proposals|content items/i.test(userQuery);
        const isProposalQuery = /proposals|proposal list/i.test(userQuery);
        
        if (!wantsTable && !isProposalQuery) {
          const chartData = convertTableToChart(visualData.tableData);
          if (chartData) {
            console.log('✅ Successfully auto-converted table to chart');
            visualData = { type: 'chart', chartConfig: chartData };
          }
        } else {
          console.log('✅ User requested table format - keeping as table');
        }
      }
      
      // Auto-convert chart types (line, bar, pie, area) to proper chart structure
      else if (['line', 'bar', 'pie', 'area'].includes(visualData.type)) {
        console.log(`📊 Auto-converting ${visualData.type} chart type to proper structure...`);
        
        // The AI generated data with chart type as main type - restructure it
        const chartType = visualData.type;
        const chartConfig = {
          type: chartType,
          data: visualData.data || [],
          categories: visualData.categories || [],
          series: visualData.series || [],
          title: visualData.title || `${chartType.charAt(0).toUpperCase() + chartType.slice(1)} Chart`,
          subtitle: visualData.subtitle || '',
          colors: visualData.colors,
          height: visualData.height || 300,
          dataContext: visualData.dataContext,
          perspectives: visualData.perspectives,
          chartInsights: visualData.chartInsights,
          chartActions: visualData.chartActions
        };
        
        // Restructure to proper format
        visualData = {
          type: 'chart',
          chartConfig: chartConfig,
          title: visualData.title,
          subtitle: visualData.subtitle,
          actionableItems: visualData.actionableItems,
          deepDivePrompts: visualData.deepDivePrompts,
          insights: visualData.insights,
          chartPerspectives: visualData.chartPerspectives,
          validationStatus: visualData.validationStatus
        };
        
        console.log('✅ Successfully converted chart type to proper structure');
      }
    }
    
    // If user explicitly requested table, keep it as table
    else if (chartRequest.type === 'table_explicit' && visualData) {
      console.log('📋 Keeping table format as explicitly requested by user');
    }
    
    // Proactive empty data validation and recovery
    console.log('🔍 Checking for empty visualizations that need data recovery...');
    
    // PHASE 6: Auto-fix chart data to ensure valid structures
    if (visualData) {
      console.log('🔧 Running chart auto-fix validation...');
      visualData = autoFixChartData(visualData);
      console.log('✅ Chart auto-fix complete');
    }
    
    const needsDataRecovery = (() => {
      if (!visualData) return false;
      
      // Check single charts
      if (visualData.type === 'chart' && visualData.chartConfig) {
        const data = visualData.chartConfig.data;
        return !data || !Array.isArray(data) || data.length === 0;
      }
      
      // Check multi-chart analysis
      if (visualData.charts && Array.isArray(visualData.charts)) {
        return visualData.charts.every(chart => {
          const data = chart.data;
          return !data || !Array.isArray(data) || data.length === 0;
        });
      }
      
      return false;
    })();
    
    if (needsDataRecovery && !hasAttemptedToolCalls) {
      console.warn('⚠️ Empty visualization detected - attempting automatic data recovery...');
      
      // Generate intelligent tool call based on query intent
      const recoveryToolCall = (() => {
        const query = userQuery.toLowerCase();
        
        if (query.includes('proposal')) {
          return {
            type: 'function' as const,
            function: {
              name: 'get_proposals',
              arguments: JSON.stringify({ limit: 10, status: 'available' })
            }
          };
        }
        
        if (query.includes('content')) {
          return {
            type: 'function' as const,
            function: {
              name: 'get_content_items',
              arguments: JSON.stringify({ limit: 10, sort_by: 'seo_score', sort_order: 'desc' })
            }
          };
        }
        
        if (query.includes('keyword')) {
          return {
            type: 'function' as const,
            function: {
              name: 'get_keywords',
              arguments: JSON.stringify({ limit: 20 })
            }
          };
        }
        
        // Fallback - use the most likely tool based on context
        if (context?.proposalCount > 0) {
          return {
            type: 'function' as const,
            function: {
              name: 'get_proposals',
              arguments: JSON.stringify({ limit: 10 })
            }
          };
        }
        
        return null;
      })();
      
      if (recoveryToolCall) {
        console.log('🔧 Triggering automatic tool call for data recovery:', recoveryToolCall.function.name);
        
        // Create simulated tool call result
        const toolCall = {
          id: `recovery-${Date.now()}`,
          ...recoveryToolCall
        };
        
        // Execute the tool
        try {
          const toolResult = await executeToolCall(toolCall, userId, supabase);
          
          if (toolResult.success && toolResult.data) {
            console.log(`✅ Recovery tool call successful, got ${Array.isArray(toolResult.data) ? toolResult.data.length : 'some'} results`);
            
            // Call AI again with tool result to regenerate visualization
            const recoveryMessages = [
              ...messages,
              {
                role: 'assistant' as const,
                content: aiMessage,
                tool_calls: [toolCall]
              },
              {
                role: 'tool' as const,
                tool_call_id: toolCall.id,
                content: JSON.stringify(toolResult.data)
              }
            ];
            
            console.log('🔄 Calling AI again with recovered data...');
            const recoveryResponse = await callAI(recoveryMessages, supabase);
            
            if (recoveryResponse && recoveryResponse.choices?.[0]?.message?.content) {
              const recoveryMessage = recoveryResponse.choices[0].message.content;
              console.log('✅ Recovery successful, re-parsing response with data');
              
              // Parse the new response
              const recoveryParsed = parseResponseWithFallback(recoveryMessage);
              if (recoveryParsed.visualData) {
                visualData = recoveryParsed.visualData;
                cleanedResponse = recoveryParsed.message;
                console.log('🎉 Data recovery complete - visualization now has data');
              }
            }
          }
        } catch (recoveryError) {
          console.error('❌ Data recovery failed:', recoveryError);
          // Continue with empty data - user can manually retry
        }
      } else {
        console.log('💡 No suitable recovery tool found for this query');
      }
    }
    
    console.log('✅ Parsed response:', {
      hasActions: !!actions && actions.length > 0,
      hasVisualData: !!visualData,
      messageLength: cleanedResponse?.length || 0
    });
    
    // Declare allVisualData in outer scope so it's accessible later for multi-chart modal
    let allVisualData: any[] = [];
    
    // If no structured data was found, try legacy parsing
    if (!actions && !visualData) {
      const jsonBlocks = extractJSONBlocks(aiMessage);
      allVisualData = []; // Reset and collect ALL charts instead of overwriting
      
      for (const block of jsonBlocks) {
        console.log('🔍 Processing JSON block:', JSON.stringify(block).substring(0, 200));
        
        // Check for visual data (direct or nested)
        if (block.visualData) {
          try {
            const parsed = typeof block.visualData === 'string' ? JSON.parse(block.visualData) : block.visualData;
            allVisualData.push(parsed); // PUSH instead of overwrite
            console.log('📊 Found nested visual data:', parsed);
          } catch (e) {
            console.log('Failed to parse nested visual data:', e);
          }
        } else if (block.type && (block.metrics || block.charts || block.data || block.chartConfig || block.tableData)) {
          // Direct visual data object
          allVisualData.push(block); // PUSH instead of overwrite
          console.log('📊 Found direct visual data:', block);
        }
        
        // Check for actions (direct or nested)
        if (block.actions) {
          try {
            actions = Array.isArray(block.actions) ? block.actions : JSON.parse(block.actions);
            console.log('🎯 Found actions:', actions);
          } catch (e) {
            console.log('Failed to parse actions:', e);
          }
        }
      }
      
      // Deduplicate charts based on title or data similarity
      const uniqueCharts = allVisualData.filter((chart, index, self) => 
        index === self.findIndex(c => 
          c.title === chart.title || 
          JSON.stringify(c.chartConfig?.data) === JSON.stringify(chart.chartConfig?.data)
        )
      );
      
      // Generate multiple chart perspectives from the first chart
      if (uniqueCharts.length > 0) {
        const expandedCharts = generateMultipleChartPerspectives(uniqueCharts[0]);
        
        // Auto-convert legacy chart objects to proper structure
        const convertedCharts = expandedCharts.map(chart => {
          // If it's a direct chart type, convert to proper chart structure
          if (chart.type && ['line', 'bar', 'pie', 'area'].includes(chart.type)) {
            console.log(`📊 Auto-converting legacy ${chart.type} chart to proper structure`);
            return {
              type: 'chart',
              chartConfig: {
                type: chart.type,
                data: chart.data || [],
                categories: chart.categories || [],
                series: chart.series || [],
                title: chart.title || `${chart.type} Chart`,
                subtitle: chart.subtitle || '',
                colors: chart.colors,
                height: chart.height || 300
              },
              title: chart.title,
              subtitle: chart.subtitle
            };
          }
          return chart;
        });
        
        visualData = convertedCharts[0];
        allVisualData = convertedCharts; // Always include expanded array
        console.log(`✅ Generated ${convertedCharts.length} chart perspectives from ${uniqueCharts.length} original chart(s)`);
      }
      
      // If still no response from legacy parsing, use sanitized original content
      if (!cleanedResponse) {
        cleanedResponse = sanitizeResponseContent(removeExtractedJSON(aiMessage));
      }
    }
    
    console.log('✅ Parsed response:', { 
      hasActions: !!actions, 
      hasVisualData: !!visualData,
      originalLength: aiMessage.length,
      cleanedLength: cleanedResponse?.length || aiMessage.length
    });
    
    // Generate contextual insights from chart data
    function generateInsights(visualData: any, context: any): string[] {
      const insights: string[] = [];
      
      if (visualData?.chartConfig?.data) {
        const data = visualData.chartConfig.data;
        
        // Find max value
        const maxItem = data.reduce((max: any, item: any) => {
          const value = Object.values(item).find(v => typeof v === 'number') as number;
          const maxValue = Object.values(max).find(v => typeof v === 'number') as number;
          return value > maxValue ? item : max;
        }, data[0]);
        
        if (maxItem) {
          insights.push(`Top performer: "${maxItem.name}" with highest values`);
        }
        
        // Count low performers
        const lowPerformers = data.filter((item: any) => {
          const value = Object.values(item).find(v => typeof v === 'number') as number;
          return value < 60;
        });
        
        if (lowPerformers.length > 0) {
          insights.push(`${lowPerformers.length} items below 60 need optimization`);
        }
        
        // Distribution insight
        const total = data.length;
        insights.push(`Content distribution: ${total} items across ${Object.keys(context.analytics?.contentBySolution || {}).length} solutions`);
      }
      
      return insights.slice(0, 5);
    }
    
    // Generate AI insights for visual data
    const aiInsights = visualData ? generateInsights(visualData, context) : [];
    console.log(`🤖 Generated ${aiInsights.length} AI insights`);
    
    // Phase 3: Generate multi-perspective chart context when we have chart data
    if (visualData?.chartConfig && visualData.type === 'chart') {
      console.log('🧠 Generating multi-perspective chart insights...');
      try {
        const perspectives = await generateChartPerspectives(
          visualData.chartConfig,
          userQuery,
          supabase
        );
        
        if (perspectives) {
          // Attach perspectives to chart config
          visualData.chartConfig.perspectives = perspectives;
          visualData.chartPerspectives = perspectives;
          
          // Generate insights array from perspectives for display
          visualData.insights = [
            `📊 ${perspectives.descriptive}`,
            `💡 ${perspectives.strategic}`,
            `📈 ${perspectives.analytical}`,
            `🎯 ${perspectives.comparative}`
          ];
          
          console.log('✅ Chart perspectives generated and attached');
        }
      } catch (error) {
        console.error('Failed to generate chart perspectives:', error);
        // Non-critical - continue without perspectives
      }
    }

    // Only provide basic contextual actions if AI didn't return structured data
    // NO MOCK DATA GENERATION - Let the AI create appropriate responses based on real data
    if (!actions && !visualData) {
      console.log("⚠️ No structured data returned from AI - providing basic navigation only");
      
      actions = [{
        id: "explore-dashboard",
        label: "View Dashboard",
        type: "button", 
        action: "navigate:/dashboard",
        data: {}
      }];
    }

    console.log(`✅ Parsed response: { hasActions: ${!!actions}, hasVisualData: ${!!visualData}, messageLength: ${cleanedResponse?.length || aiMessage.length} }`);

    // Validate response before sending
    const finalContent = cleanedResponse || aiMessage;
    if (!finalContent || finalContent.trim().length === 0) {
      console.error("❌ Empty clean content after processing");
      return new Response(JSON.stringify({
        error: "No response content received",
        message: "Failed to process AI response properly. Please try again.",
        details: "Empty content after processing"
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Access allVisualData from scope (includes expanded multi-perspective charts)
    const allCharts = typeof allVisualData !== 'undefined' && allVisualData.length > 1 ? allVisualData : undefined;
    
    const responseData = {
      message: finalContent,
      content: finalContent, // Fallback for different response formats
      actions: actions || undefined,
      visualData: visualData || undefined, // First chart for inline display
      allVisualData: allCharts, // All charts for modal (only if multiple exist)
      serpData: serpData || undefined, // Include SERP data from our analysis
      insights: aiInsights.length > 0 ? aiInsights : undefined, // Include AI-generated insights
      metadata: {
        processed_at: new Date().toISOString(),
        has_actions: !!actions,
        has_visual_data: !!visualData,
        visual_data_count: allCharts ? allCharts.length : (visualData ? 1 : 0),
        has_serp_data: !!serpData,
        insights_generated: aiInsights.length,
        serp_keywords: serpData?.keywords || []
      }
    };

    return new Response(JSON.stringify(responseData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("❌ Error in enhanced AI chat:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: "An unexpected error occurred while processing your request. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});