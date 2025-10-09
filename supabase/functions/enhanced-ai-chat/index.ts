// Force redeploy: 2025-06-05T14:30:00Z - NUCLEAR CACHE CLEAR
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { extractJSONBlocks, removeExtractedJSON } from './json-parser.ts';
import { analyzeQueryIntent } from './query-analyzer.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { estimateTokens } from '../shared/token-counter.ts';
import { 
  analyzeSerpIntent, 
  executeSerpAnalysis, 
  generateSerpContext, 
  generateSmartSuggestions,
  generateStructuredSerpData
} from './serp-intelligence.ts';
import { generateChartPerspectives } from './chart-intelligence.ts';

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
  const dataKeywords = ['show', 'how many', 'what', 'analyze', 'data', 'metrics', 'stats', 'count', 'total', 'performance', 'content', 'keyword', 'solution', 'proposal'];
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
async function fetchRealDataContext(userId: string, queryIntent: QueryIntent) {
  try {
    console.log(`📊 Fetching ${queryIntent.scope} scope context (~${queryIntent.estimatedTokens} tokens)`);
    
    // ✅ NEW: Fetch tiered context based on query intent
    const { data: tieredContext, error: contextError } = await supabase.functions.invoke(
      'ai-context-manager',
      {
        body: {
          action: 'get_tiered_context',
          userId: userId,
          data: {
            intent: queryIntent
          }
        }
      }
    );

    if (contextError) {
      console.error('❌ Error fetching tiered context:', contextError);
      return `## REAL DATA UNAVAILABLE\nError fetching current data: ${contextError.message}`;
    }

    const context = tieredContext || {};
    
    // Build lightweight context string based on scope
    const analytics = context.analytics || {};
    const dataAvailability = analytics.dataAvailability || {};
    
    let contextString = `
## REAL DATA CONTEXT (${queryIntent.scope.toUpperCase()} SCOPE - ~${queryIntent.estimatedTokens} tokens) - ${new Date().toISOString()}

### 📊 Context Scope & Progressive Disclosure

You currently have access to **${queryIntent.scope.toUpperCase()} SCOPE** data (~${queryIntent.estimatedTokens} tokens):
${queryIntent.categories.map(c => `- ${c.toUpperCase()} data`).join('\n')}

### 🎯 Data Availability Status:
${Object.entries(dataAvailability).map(([key, value]: [string, any]) => 
  `${value.available ? '✅' : '⚠️'} **${key}**: ${value.status}`
).join('\n')}

`;

    // Add category-specific data based on query intent
    if (queryIntent.categories.includes('solutions') && context.solutions) {
      contextString += `
### 💼 SOLUTIONS (${queryIntent.scope === 'summary' ? 'Top 3' : 'Detailed'}):
${context.solutions.map((s: any, i: number) => 
  `${i + 1}. "${s.name}" - ${s.category || 'Uncategorized'}\n   ${s.description || 'No description'}`
).join('\n')}
${queryIntent.scope === 'summary' && analytics.solutionsCount > 3 ? 
  `\n💡 **${analytics.solutionsCount - 3} more solutions available** - ask "show all solutions" for complete list` : ''}
`;
    }

    if (queryIntent.categories.includes('content') && analytics.contentBySolution) {
      const contentData = Object.entries(analytics.contentBySolution);
      contextString += `
### 📝 CONTENT BY SOLUTION (${queryIntent.scope === 'summary' ? 'Summary' : 'Detailed'}):
${contentData.map(([solution, data]: [string, any]) => {
  const mappedContent = data.mappedContent || [];
  return `
**${solution}** (${data.contentCount || mappedContent.length} items):
${mappedContent.slice(0, queryIntent.scope === 'summary' ? 2 : 5).map((c: any, i: number) => 
  `  ${i + 1}. "${c.title}" (${c.content_type}) - SEO: ${c.seo_score || 0}/100`
).join('\n')}`;
}).join('\n')}
${queryIntent.scope === 'summary' ? '\n💡 **Ask for details to see more content items**' : ''}
`;
    }

    if (queryIntent.categories.includes('proposals') && context.proposals) {
      contextString += `
### 💡 AI STRATEGY PROPOSALS (${queryIntent.scope === 'summary' ? 'Top 5' : 'Top 15'}):
- Total Available: ${analytics.proposalsCount || context.proposals.length}
${context.proposals.map((p: any, i: number) => 
  `${i + 1}. "${p.title}" - ${p.primary_keyword} (${p.estimated_impressions?.toLocaleString() || 0} impressions, ${p.priority_tag})`
).join('\n')}
${queryIntent.scope === 'summary' && analytics.proposalsCount > 5 ? 
  `\n💡 **${analytics.proposalsCount - 5} more proposals available** - ask "show all proposals" for complete list` : ''}
`;
    }

    if (queryIntent.categories.includes('seo')) {
      contextString += `
### 🎯 SEO & PERFORMANCE:
- Average SEO Score: ${analytics.avgSeoScore || 0}/100
- Published Content: ${analytics.published || 0}
- Draft Content: ${analytics.draft || 0}
- Recent Content (30 days): ${analytics.recentContent || 0}
${analytics.avgSeoScore === 0 ? '⚠️ **No SEO scores available** - analyze content in SEO Optimizer' : ''}
`;
    }

    // Always include summary analytics
    contextString += `
### 📊 Quick Stats:
- Total Content: ${analytics.totalContent || 0}
- Published: ${analytics.published || 0}
- Draft: ${analytics.draft || 0}
- AI Proposals: ${analytics.proposals || 0}
- Avg SEO Score: ${analytics.avgSeoScore || 0}/100

### 🔄 Need More Data?
When the user asks for comprehensive analysis or more details than currently available, respond with:

"I currently have ${queryIntent.scope} level data loaded. To provide a more comprehensive analysis, would you like me to:
${!queryIntent.categories.includes('content') ? '- Load detailed content data' : ''}
${!queryIntent.categories.includes('proposals') ? '- Show all strategy proposals' : ''}
${!queryIntent.categories.includes('solutions') ? '- Include full solutions data' : ''}
${queryIntent.scope !== 'full' ? '- Load complete dataset for in-depth analysis' : ''}

Just ask! Examples: 'Show me all content' or 'Load full data'"

**REMEMBER:** All data is available - you just need to ask the user which details they want to explore further.
`;

    console.log(`✅ Context string built successfully (${queryIntent.scope} scope)`);
    return contextString;
    const totalImpressions = gscData?.reduce((sum, item) => sum + (item.search_console_data?.impressions || 0), 0) || 0;
    const totalClicks = gscData?.reduce((sum, item) => sum + (item.search_console_data?.clicks || 0), 0) || 0;
    const averageCTR = totalClicks > 0 && totalImpressions > 0 ? (totalClicks / totalImpressions * 100) : 0;
    const topPerformingPages = gscData?.filter(item => item.search_console_data?.clicks > 0)
      .sort((a, b) => (b.search_console_data?.clicks || 0) - (a.search_console_data?.clicks || 0))
      .slice(0, 5) || [];

    // SMART LIMITS based on query scope
    const limits = {
      summary: { main: 5, related: 3, logs: 5 },
      detailed: { main: 10, related: 8, logs: 10 },
      full: { main: 20, related: 15, logs: 20 }
    };
    
    const scope = queryIntent.scope || 'summary';
    const limit = limits[scope];
    
    console.log(`📊 Fetching context with ${scope} scope (limits: main=${limit.main}, related=${limit.related}, logs=${limit.logs})`);

    // PHASE 1: ENHANCED AI STRATEGY PROPOSALS INTEGRATION
    const { data: strategyProposals } = await supabase
      .from('ai_strategy_proposals')
      .select('id, title, primary_keyword, description, status, priority_tag, estimated_impressions, content_type, created_at')
      .order('estimated_impressions', { ascending: false })
      .limit(limit.main);

    // PHASE 1: CONTENT PIPELINE AWARENESS (Smart Limited)
    const { data: contentWithPipeline } = await supabase
      .from('content_items')
      .select('id, title, status, created_at, seo_score, content_type')
      .order('created_at', { ascending: false })
      .limit(limit.main);

    // Get pipeline data separately and join manually
    const { data: pipelineData } = await supabase
      .from('content_pipeline')
      .select('content_id, stage, priority, notes, created_at');

    // PHASE 1: EDITORIAL CALENDAR INTEGRATION
    const { data: calendarItems } = await supabase
      .from('content_calendar')
      .select('id, title, scheduled_date, status, content_type, created_at, proposal_id')
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(10);

    // Fetch solutions data (Smart Limited)
    const { data: solutions } = await supabase
      .from('solutions')
      .select('id, name, description')
      .order('created_at', { ascending: false })
      .limit(limit.related);

    // Calculate enhanced statistics
    const totalContent = contentWithPipeline?.length || 0;
    const publishedContent = contentWithPipeline?.filter(item => item.status === 'published').length || 0;
    const draftContent = contentWithPipeline?.filter(item => item.status === 'draft').length || 0;
    const avgSeoScore = (contentWithPipeline?.reduce((sum, item) => sum + (item.seo_score || 0), 0) || 0) / (totalContent || 1);
    
    // Pipeline statistics - create a map for easy lookup
    const pipelineMap = pipelineData?.reduce((map, pipeline) => {
      map[pipeline.content_id] = pipeline;
      return map;
    }, {} as Record<string, any>) || {};
    
    const contentInPipeline = contentWithPipeline?.filter(item => pipelineMap[item.id]).length || 0;
    const pipelineStages = pipelineData?.reduce((acc, pipeline) => {
      if (pipeline.stage) {
        acc[pipeline.stage] = (acc[pipeline.stage] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Strategy proposal statistics
    const availableProposals = strategyProposals?.filter(p => p.status === 'available').length || 0;
    const scheduledProposals = strategyProposals?.filter(p => p.status === 'scheduled').length || 0;
    const completedProposals = strategyProposals?.filter(p => p.status === 'completed').length || 0;
    const proposalTotalImpressions = strategyProposals?.reduce((sum, p) => sum + (p.estimated_impressions || 0), 0) || 0;
    
    // Top opportunity keywords from proposals
    const topOpportunities = strategyProposals?.slice(0, 5).map(p => ({
      keyword: p.primary_keyword,
      impressions: p.estimated_impressions,
      contentType: p.content_type,
      priority: p.priority_tag
    })) || [];

    // Calendar insights
    const upcomingItems = calendarItems?.length || 0;
    const nextDeadline = calendarItems?.[0]?.scheduled_date || 'No upcoming deadlines';

    // Get content creation timeline (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentContent = contentWithPipeline?.filter(item => 
      new Date(item.created_at) > thirtyDaysAgo
    ).length || 0;

    return `
## REAL CONTENT STRATEGY DATA (Phase 1 Enhanced with GSC - ${new Date().toISOString()}):

### GOOGLE SEARCH CONSOLE INSIGHTS (REAL DATA):
- Total Tracked Pages: ${gscData?.length || 0}
- Total Impressions (Last 30 days): ${totalImpressions.toLocaleString()}
- Total Clicks: ${totalClicks.toLocaleString()}
- Average CTR: ${averageCTR.toFixed(2)}%
- Top Performing Pages: ${topPerformingPages.length} pages with clicks
${topPerformingPages.map((page, i) => 
  `  ${i + 1}. ${page.published_url} - ${page.search_console_data?.clicks || 0} clicks, ${page.search_console_data?.impressions || 0} impressions`
).join('\n')}
${gscData?.length === 0 ? '⚠️ No Search Console data available - connect GSC API for insights' : ''}

### AI STRATEGY PROPOSALS (REAL DATA):
- Total Proposals: ${strategyProposals?.length || 0}
- Available Opportunities: ${availableProposals} (ready for content creation)
- Scheduled: ${scheduledProposals} | Completed: ${completedProposals}
- Total Potential Impressions: ${proposalTotalImpressions.toLocaleString()}
- Highest Opportunity: ${topOpportunities[0]?.keyword || 'No proposals'} (${(topOpportunities[0]?.impressions || 0).toLocaleString()} impressions)

### TOP 5 CONTENT OPPORTUNITIES (REAL PROPOSALS):
${topOpportunities.map((opp, i) => 
  `${i + 1}. "${opp.keyword}" - ${opp.impressions?.toLocaleString() || 0} impressions (${opp.contentType}, ${opp.priority})`
).join('\n')}

### CONTENT PIPELINE STATUS (REAL DATA):
- Total Content Items: ${totalContent}
- In Pipeline: ${contentInPipeline} (${totalContent > 0 ? Math.round((contentInPipeline/totalContent)*100) : 0}%)
- Published: ${publishedContent} (${totalContent > 0 ? Math.round((publishedContent/totalContent)*100) : 0}% publication rate)
- Draft: ${draftContent} (${totalContent > 0 ? Math.round((draftContent/totalContent)*100) : 0}% unpublished)
- Pipeline Stages: ${Object.entries(pipelineStages).map(([stage, count]) => `${stage}: ${count}`).join(', ') || 'No stages tracked'}

### EDITORIAL CALENDAR (REAL DATA):
- Upcoming Scheduled Items: ${upcomingItems}
- Next Deadline: ${nextDeadline}
- Calendar Integration: ${calendarItems && calendarItems.length > 0 ? 'Active' : 'No items scheduled'}

### PERFORMANCE METRICS (REAL DATA):
- Average SEO Score: ${avgSeoScore.toFixed(1)}/100 ${avgSeoScore === 0 ? '⚠️ CRITICAL: All SEO scores are 0' : ''}
- Content Created (Last 30 days): ${recentContent}

### SOLUTIONS DATA (REAL):
${solutions && solutions.length > 0 ? solutions.map(solution => 
  `- "${solution.name}": ${solution.description?.substring(0, 100)}...`
).join('\n') : 'No solutions found'}

### CRITICAL STRATEGIC INSIGHTS:
${availableProposals > 50 ? `🎯 MAJOR OPPORTUNITY: ${availableProposals} untapped content proposals worth ${proposalTotalImpressions.toLocaleString()} potential impressions` : ''}
${avgSeoScore === 0 ? '❌ SEO system not functional - all content has 0 SEO scores' : ''}
${publishedContent === 0 ? '❌ No published content - publishing workflow needs attention' : ''}
${contentInPipeline === 0 ? '⚠️ No content in pipeline - content workflow not being used' : ''}
${upcomingItems === 0 ? '📅 No scheduled content - editorial calendar needs planning' : ''}
${totalClicks === 0 && totalImpressions > 0 ? '⚠️ GSC: High impressions but no clicks - CTR optimization needed' : ''}
${averageCTR > 0 && averageCTR < 2 ? `⚠️ GSC: Low average CTR (${averageCTR.toFixed(2)}%) - meta descriptions and titles need optimization` : ''}
${totalImpressions === 0 ? '❌ GSC: No search visibility detected - SEO and content discovery issues' : ''}

### ACTIONABLE NEXT STEPS:
${availableProposals > 0 ? `✅ ${availableProposals} AI-generated proposals ready for immediate content creation` : ''}
${draftContent > 0 ? `✅ ${draftContent} draft articles ready for review and publishing` : ''}
${solutions && solutions.length > 0 ? `✅ ${solutions.length} solutions available for content mapping` : ''}
${recentContent > 0 ? `✅ Active content creation (${recentContent} items in last 30 days)` : ''}
${topPerformingPages.length > 0 ? `🔍 GSC: Optimize top performing pages for higher CTR and expand similar content` : ''}
${totalImpressions > 1000 && totalClicks < 50 ? `🎯 GSC: Focus on improving meta titles/descriptions for ${totalImpressions.toLocaleString()} impressions` : ''}
${gscData && gscData.length > 0 ? `📊 GSC: ${gscData.length} pages tracked - analyze query data for content optimization opportunities` : ''}

CRITICAL: This is REAL data from the user's actual strategy proposals and content pipeline. Provide specific, actionable recommendations based on these exact numbers and opportunities.
     `;

    // PHASE 2: PERFORMANCE & ANALYTICS INTELLIGENCE
    // Fetch performance analytics data (Smart Limited)
    const { data: performanceMetrics } = await supabase
      .from('performance_metrics')
      .select('metric_name, value, timestamp')
      .order('created_at', { ascending: false })
      .limit(limit.logs);

    // Fetch action analytics for user behavior insights (Smart Limited)
    const { data: actionAnalytics } = await supabase
      .from('action_analytics')
      .select('action_type, action_label, success, triggered_at')
      .order('triggered_at', { ascending: false })
      .limit(limit.logs);

    // Fetch content activity logs for engagement tracking (Smart Limited)
    const { data: activityLogs } = await supabase
      .from('content_activity_log')
      .select('action, content_type, module, timestamp')
      .order('timestamp', { ascending: false })
      .limit(limit.logs);

    // Fetch SERP usage logs for competitive intelligence (Smart Limited)
    const { data: serpUsage } = await supabase
      .from('serp_usage_logs')
      .select('provider, operation, success, created_at')
      .order('created_at', { ascending: false })
      .limit(limit.logs);

    // Calculate Phase 2 analytics
    const totalActions = actionAnalytics?.length || 0;
    const successfulActions = actionAnalytics?.filter(action => action.success).length || 0;
    const actionSuccessRate = totalActions > 0 ? (successfulActions / totalActions * 100) : 0;
    
    // User behavior patterns
    const actionTypes = actionAnalytics?.reduce((acc, action) => {
      const type = action.action_type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Content engagement metrics
    const recentActivity = activityLogs?.length || 0;
    const contentModules = activityLogs?.reduce((acc, log) => {
      const module = log.module || 'unknown';
      acc[module] = (acc[module] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // SERP intelligence
    const serpApiCalls = serpUsage?.length || 0;
    const serpSuccess = serpUsage?.filter(usage => usage.success).length || 0;
    const serpSuccessRate = serpApiCalls > 0 ? (serpSuccess / serpApiCalls * 100) : 0;

    // PHASE 3: RESEARCH & INTELLIGENCE ENHANCEMENT
    // Fetch keywords research data (Smart Limited)
    const { data: keywords } = await supabase
      .from('keywords')
      .select('keyword, volume, difficulty, created_at')
      .order('created_at', { ascending: false })
      .limit(limit.main);

    // Fetch content clusters data (Smart Limited)
    const { data: contentClusters } = await supabase
      .from('content_clusters')
      .select('id, name, description, status')
      .order('created_at', { ascending: false })
      .limit(limit.related);

    // Fetch cluster keywords relationships (Smart Limited)
    const { data: clusterKeywords } = await supabase
      .from('cluster_keywords')
      .select('cluster_id, keyword_id, is_primary')
      .order('created_at', { ascending: false })
      .limit(limit.related);

    // Fetch SERP analysis history for competitive intelligence (Smart Limited)
    const { data: serpAnalysisHistory } = await supabase
      .from('serp_analysis_history')
      .select('keyword, analysis_type, created_at')
      .order('created_at', { ascending: false })
      .limit(limit.logs);

    // Fetch keyword position tracking for ranking insights (Smart Limited)
    const { data: keywordPositions } = await supabase
      .from('keyword_position_history')
      .select('keyword, position, tracked_at')
      .order('tracked_at', { ascending: false })
      .limit(limit.logs);

    // Fetch opportunity seeds for content gap analysis (Smart Limited)
    const { data: opportunitySeeds } = await supabase
      .from('opportunity_seeds')
      .select('seed_keyword, opportunity_score, created_at')
      .order('created_at', { ascending: false })
      .limit(limit.logs);

    // PHASE 4: ENTERPRISE & WORKFLOW INTELLIGENCE
    // Fetch AI workflow states for process intelligence (Smart Limited)
    const { data: workflowStates } = await supabase
      .from('ai_workflow_states')
      .select('workflow_type, current_step, updated_at')
      .order('updated_at', { ascending: false })
      .limit(limit.logs);

    // Fetch team collaboration sessions (Smart Limited)
    const { data: collaborationSessions } = await supabase
      .from('collaboration_sessions')
      .select('session_name, status, started_at')
      .eq('status', 'active')
      .order('updated_at', { ascending: false })
      .limit(limit.related);

    // Fetch workflow executions for optimization insights (Smart Limited)
    const { data: workflowExecutions } = await supabase
      .from('workflow_executions')
      .select('workflow_type, status, started_at')
      .order('started_at', { ascending: false })
      .limit(limit.logs);

    // Fetch team workspaces for collaboration context (Smart Limited)
    const { data: teamWorkspaces } = await supabase
      .from('team_workspaces')
      .select('name, is_active')
      .eq('is_active', true)
      .limit(limit.related);

    // Calculate Phase 3 research intelligence metrics
    const totalKeywords = keywords?.length || 0;
    const totalClusters = contentClusters?.length || 0;
    const totalClusterRelations = clusterKeywords?.length || 0;
    const serpAnalysisCount = serpAnalysisHistory?.length || 0;
    const positionTrackingCount = keywordPositions?.length || 0;
    const opportunitiesCount = opportunitySeeds?.length || 0;

    // Calculate Phase 4 enterprise intelligence metrics
    const totalWorkflowStates = workflowStates?.length || 0;
    const activeWorkflows = workflowStates?.filter(w => w.current_step !== 'completed').length || 0;
    const completedWorkflows = workflowStates?.filter(w => w.current_step === 'completed').length || 0;
    const stalledWorkflows = workflowStates?.filter(w => w.current_step === 'stalled' || w.current_step === 'error').length || 0;
    
    const activeCollaborationSessions = collaborationSessions?.length || 0;
    const totalWorkflowExecutions = workflowExecutions?.length || 0;
    const successfulExecutions = workflowExecutions?.filter(w => w.status === 'completed').length || 0;
    const failedExecutions = workflowExecutions?.filter(w => w.status === 'failed').length || 0;
    
    const totalWorkspaces = teamWorkspaces?.length || 0;
    const totalTeamMembers = teamWorkspaces?.reduce((acc, workspace) => 
      acc + (workspace.workspace_members?.length || 0), 0) || 0;

    // Keyword categorization and analysis
    const keywordCategories = keywords?.reduce((acc, kw) => {
      // Simple categorization based on keyword patterns
      if (kw.keyword.includes('how to') || kw.keyword.includes('what is') || kw.keyword.includes('guide')) {
        acc.informational = (acc.informational || 0) + 1;
      } else if (kw.keyword.includes('best') || kw.keyword.includes('top') || kw.keyword.includes('review')) {
        acc.commercial = (acc.commercial || 0) + 1;
      } else if (kw.keyword.includes('buy') || kw.keyword.includes('price') || kw.keyword.includes('cost')) {
        acc.transactional = (acc.transactional || 0) + 1;
      } else {
        acc.navigational = (acc.navigational || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>) || {};

    // Workflow pattern analysis
    const workflowTypes = workflowStates?.reduce((acc, workflow) => {
      const type = workflow.workflow_type || 'unknown';
      if (!acc[type]) acc[type] = { total: 0, completed: 0, active: 0, stalled: 0 };
      acc[type].total++;
      if (workflow.current_step === 'completed') acc[type].completed++;
      else if (workflow.current_step === 'stalled' || workflow.current_step === 'error') acc[type].stalled++;
      else acc[type].active++;
      return acc;
    }, {} as Record<string, any>) || {};

    // Team productivity metrics
    const workspaceUtilization = totalWorkspaces > 0 && activeCollaborationSessions > 0 ? 
      (activeCollaborationSessions / totalWorkspaces) * 100 : 0;
    
    const workflowSuccessRate = totalWorkflowExecutions > 0 ? 
      (successfulExecutions / totalWorkflowExecutions) * 100 : 0;

    // Content gap analysis
    const contentGaps = {
      missingClusters: totalKeywords > 0 && totalClusters === 0,
      orphanedKeywords: totalKeywords - totalClusterRelations,
      lackingPositionData: totalKeywords > 0 && positionTrackingCount === 0,
      missingSerpIntelligence: serpAnalysisCount === 0,
      untappedOpportunities: opportunitiesCount === 0
    };

    // Top research insights
    const researchInsights = [];
    if (totalKeywords > 20) researchInsights.push(`Rich keyword portfolio: ${totalKeywords} keywords ready for optimization`);
    if (contentGaps.missingClusters) researchInsights.push('OPPORTUNITY: Keywords not organized into topic clusters');
    if (contentGaps.orphanedKeywords > 10) researchInsights.push(`ATTENTION: ${contentGaps.orphanedKeywords} keywords not assigned to clusters`);
    if (contentGaps.lackingPositionData) researchInsights.push('MISSING: Keyword position tracking for ranking insights');
    if (contentGaps.missingSerpIntelligence) researchInsights.push('OPPORTUNITY: SERP analysis for competitive intelligence');

    // Enterprise workflow insights
    const enterpriseInsights = [];
    if (activeWorkflows > 10) enterpriseInsights.push(`High workflow activity: ${activeWorkflows} active automation processes`);
    if (stalledWorkflows > 0) enterpriseInsights.push(`ATTENTION: ${stalledWorkflows} workflows need troubleshooting`);
    if (workflowSuccessRate < 70) enterpriseInsights.push(`OPTIMIZATION NEEDED: Workflow success rate at ${workflowSuccessRate.toFixed(1)}%`);
    if (totalTeamMembers > 1 && activeCollaborationSessions === 0) enterpriseInsights.push('OPPORTUNITY: Team collaboration features underutilized');
    if (workspaceUtilization > 80) enterpriseInsights.push(`Excellent workspace utilization: ${workspaceUtilization.toFixed(1)}%`);

    return `
## REAL CONTENT STRATEGY DATA (ALL PHASES 1-4 ENHANCED - ${new Date().toISOString()}):

### 📊 VISUALIZATION-READY DATA - PROACTIVE INTELLIGENCE:
**This data is structured for automatic visualization. Consider generating charts when analyzing:**

### AI STRATEGY PROPOSALS (REAL DATA) [CHART-READY: Bar chart for top opportunities]:
- Total Proposals: ${strategyProposals?.length || 0}
- Available Opportunities: ${availableProposals} (ready for content creation)
- Scheduled: ${scheduledProposals} | Completed: ${completedProposals}
- Total Potential Impressions: ${totalImpressions.toLocaleString()}
- Highest Opportunity: ${topOpportunities[0]?.keyword || 'No proposals'} (${(topOpportunities[0]?.impressions || 0).toLocaleString()} impressions)

**💡 VISUALIZATION HINT**: This data shows comparative performance across proposals - ideal for a bar chart comparing impressions.

### TOP 5 CONTENT OPPORTUNITIES (REAL PROPOSALS) [CHART-READY: Comparison data]:
${topOpportunities.map((opp, i) => 
  `${i + 1}. "${opp.keyword}" - ${opp.impressions?.toLocaleString() || 0} impressions (${opp.contentType}, ${opp.priority})`
).join('\n')}

**💡 CHART DATA AVAILABLE**: 
\`\`\`json
${JSON.stringify(topOpportunities.slice(0, 5).map(opp => ({
  name: opp.keyword?.substring(0, 40) || 'Unknown',
  impressions: opp.impressions || 0,
  priority: opp.priority
})), null, 2)}
\`\`\`

### PHASE 2: PERFORMANCE & ANALYTICS INTELLIGENCE (REAL DATA) [CHART-READY: Success rate trends]:
- Total User Actions Tracked: ${totalActions}
- Action Success Rate: ${actionSuccessRate.toFixed(1)}% (${successfulActions}/${totalActions})
- Top Action Types: ${Object.entries(actionTypes).map(([type, count]) => `${type}: ${count}`).join(', ') || 'No actions tracked'}
- Content Activity Events: ${recentActivity} recent events
- Active Content Modules: ${Object.entries(contentModules).map(([module, count]) => `${module}: ${count}`).join(', ') || 'No activity'}
- SERP API Usage: ${serpApiCalls} calls (${serpSuccessRate.toFixed(1)}% success rate)

**💡 VISUALIZATION HINT**: Action types show clear distribution - ideal for a pie or bar chart showing usage patterns.

### PHASE 3: RESEARCH & INTELLIGENCE ENHANCEMENT (REAL DATA) [CHART-READY: Keyword distribution]:
- **Keyword Research Portfolio**: ${totalKeywords} keywords tracked
- **Topic Clusters**: ${totalClusters} clusters (${totalClusterRelations} keyword-cluster relationships)
- **Keyword Intent Distribution**: ${Object.entries(keywordCategories).map(([intent, count]) => `${intent}: ${count}`).join(', ') || 'No categorization'}
- **SERP Competitive Analysis**: ${serpAnalysisCount} historical analyses
- **Position Tracking**: ${positionTrackingCount} position records
- **Content Opportunities**: ${opportunitiesCount} opportunity seeds identified

**💡 VISUALIZATION HINT**: Keyword intent distribution is perfect for a pie chart showing content strategy balance.
${Object.keys(keywordCategories).length > 0 ? `
**💡 CHART DATA AVAILABLE**:
\`\`\`json
${JSON.stringify(Object.entries(keywordCategories).map(([intent, count]) => ({
  name: intent,
  value: count
})), null, 2)}
\`\`\`
` : ''}

### KEYWORD RESEARCH INSIGHTS (PHASE 3):
${keywords?.length ? 
`**Top Keywords (Sample)**:
${(keywords || []).slice(0, 8).map((kw, i) => `${i + 1}. "${kw.keyword}" (added ${new Date(kw.created_at).toLocaleDateString()})`).join('\n')}` 
: 'No keywords in research database'}

### CONTENT GAP ANALYSIS (PHASE 3):
${contentGaps.missingClusters ? '⚠️ CRITICAL: Keywords not organized into topic clusters - missing topical authority strategy' : ''}
${contentGaps.orphanedKeywords > 0 ? `⚠️ GAP: ${contentGaps.orphanedKeywords} keywords not assigned to content clusters` : ''}
${contentGaps.lackingPositionData ? '❌ MISSING: No keyword position tracking - blind to ranking performance' : ''}
${contentGaps.missingSerpIntelligence ? '❌ OPPORTUNITY: No SERP competitive analysis - missing competitor insights' : ''}
${contentGaps.untappedOpportunities ? '⚠️ POTENTIAL: No opportunity seeds identified - content gap analysis needed' : ''}

### PHASE 4: ENTERPRISE & WORKFLOW INTELLIGENCE (REAL DATA) [CHART-READY: Workflow status distribution]:
- **AI Workflow States**: ${totalWorkflowStates} total workflows (${activeWorkflows} active, ${completedWorkflows} completed, ${stalledWorkflows} stalled)
- **Team Collaboration**: ${activeCollaborationSessions} active sessions across ${totalWorkspaces} workspaces
- **Workflow Executions**: ${totalWorkflowExecutions} executions (${workflowSuccessRate.toFixed(1)}% success rate)
- **Team Members**: ${totalTeamMembers} members across all workspaces
- **Workspace Utilization**: ${workspaceUtilization.toFixed(1)}% (collaboration sessions per workspace)

**💡 VISUALIZATION HINT**: Workflow status breakdown is ideal for visualizing with a stacked bar or pie chart.
${totalWorkflowStates > 0 ? `
**💡 CHART DATA AVAILABLE**:
\`\`\`json
${JSON.stringify([
  { name: 'Active', value: activeWorkflows },
  { name: 'Completed', value: completedWorkflows },
  { name: 'Stalled', value: stalledWorkflows }
], null, 2)}
\`\`\`
` : ''}

### WORKFLOW TYPE BREAKDOWN (PHASE 4):
${totalWorkflowStates > 0 ? 
  Object.entries(workflowTypes).map(([type, stats]: [string, any]) => 
    `**${type}**: ${stats.total} total (${stats.active} active, ${stats.completed} completed, ${stats.stalled} stalled)`
  ).join('\n') 
  : 'No workflow states tracked'}

### ENTERPRISE INTELLIGENCE INSIGHTS (PHASE 4):
${enterpriseInsights.map(insight => `✅ ${insight}`).join('\n')}
${stalledWorkflows > 0 ? `🔧 PRIORITY: Resolve ${stalledWorkflows} stalled workflows for improved efficiency` : ''}
${workflowSuccessRate < 70 && totalWorkflowExecutions > 0 ? `📊 OPTIMIZATION: Workflow success rate needs improvement (currently ${workflowSuccessRate.toFixed(1)}%)` : ''}
${totalTeamMembers > 1 && activeCollaborationSessions === 0 ? '👥 OPPORTUNITY: Enable team collaboration features to boost productivity' : ''}

### RESEARCH INTELLIGENCE RECOMMENDATIONS (PHASE 3):
${researchInsights.map(insight => `✅ ${insight}`).join('\n')}
${totalKeywords > 0 && totalClusters === 0 ? '🎯 PRIORITY: Create topic clusters to organize your ' + totalKeywords + ' keywords for better content strategy' : ''}
${totalKeywords > 0 && positionTrackingCount === 0 ? '📈 PRIORITY: Implement position tracking to monitor keyword ranking performance' : ''}
${serpAnalysisCount === 0 ? '🔍 PRIORITY: Enable SERP analysis for competitive intelligence and content gap identification' : ''}

### BUSINESS IMPACT & ROI INSIGHTS (PHASE 2):
${actionSuccessRate < 70 ? '⚠️ ACTION SUCCESS RATE BELOW 70% - User experience optimization needed' : '✅ High action success rate indicates good UX'}
${totalActions === 0 ? '❌ NO USER ACTIONS TRACKED - Analytics integration not working' : `✅ Active user engagement: ${totalActions} tracked actions`}
${recentActivity === 0 ? '⚠️ No recent content activity - Content workflow may be stagnant' : `✅ Active content workflow: ${recentActivity} recent events`}
${serpApiCalls === 0 ? '❌ No SERP intelligence usage - Missing competitive insights' : `✅ SERP intelligence active: ${serpApiCalls} API calls`}

### CONTENT PIPELINE STATUS (REAL DATA):
- Total Content Items: ${totalContent}
- In Pipeline: ${contentInPipeline} (${totalContent > 0 ? Math.round((contentInPipeline/totalContent)*100) : 0}%)
- Published: ${publishedContent} (${totalContent > 0 ? Math.round((publishedContent/totalContent)*100) : 0}% publication rate)
- Draft: ${draftContent} (${totalContent > 0 ? Math.round((draftContent/totalContent)*100) : 0}% unpublished)
- Pipeline Stages: ${Object.entries(pipelineStages).map(([stage, count]) => `${stage}: ${count}`).join(', ') || 'No stages tracked'}

### EDITORIAL CALENDAR (REAL DATA):
- Upcoming Scheduled Items: ${upcomingItems}
- Next Deadline: ${nextDeadline}
- Calendar Integration: ${(calendarItems?.length || 0) > 0 ? 'Active' : 'No items scheduled'}

### SEO & PERFORMANCE METRICS (REAL DATA):
- Average SEO Score: ${avgSeoScore.toFixed(1)}/100 ${avgSeoScore === 0 ? '⚠️ CRITICAL: All SEO scores are 0' : ''}
- Content Created (Last 30 days): ${recentContent}
- Performance Metrics Available: ${performanceMetrics?.length || 0} records

### SOLUTIONS DATA (REAL):
${(solutions?.length || 0) > 0 ? solutions!.map(solution => 
  `- "${solution.name}": ${solution.description?.substring(0, 100)}...`
).join('\n') : 'No solutions found'}

### CRITICAL STRATEGIC INSIGHTS (ALL PHASES 1-4):
${availableProposals > 50 ? `🎯 MAJOR OPPORTUNITY: ${availableProposals} untapped content proposals worth ${totalImpressions.toLocaleString()} potential impressions` : ''}
${avgSeoScore === 0 ? '❌ SEO system not functional - all content has 0 SEO scores' : ''}
${publishedContent === 0 ? '❌ No published content - publishing workflow needs attention' : ''}
${contentInPipeline === 0 ? '⚠️ No content in pipeline - content workflow not being used' : ''}
${upcomingItems === 0 ? '📅 No scheduled content - editorial calendar needs planning' : ''}
${actionSuccessRate < 50 ? `❌ LOW USER SUCCESS RATE (${actionSuccessRate.toFixed(1)}%) - Critical UX issues detected` : ''}
${totalActions < 10 ? '⚠️ Low user engagement - Need to drive more platform usage' : ''}
${stalledWorkflows > 5 ? `❌ WORKFLOW BOTTLENECKS: ${stalledWorkflows} stalled workflows impacting productivity` : ''}
${workflowSuccessRate < 50 ? `❌ WORKFLOW EFFICIENCY CRITICAL: ${workflowSuccessRate.toFixed(1)}% success rate needs immediate attention` : ''}
${totalTeamMembers > 5 && activeCollaborationSessions === 0 ? '❌ TEAM COLLABORATION INACTIVE: Underutilized team features' : ''}

### ACTIONABLE NEXT STEPS (ALL PHASES 1-4):
${availableProposals > 0 ? `✅ ${availableProposals} AI-generated proposals ready for immediate content creation` : ''}
${draftContent > 0 ? `✅ ${draftContent} draft articles ready for review and publishing` : ''}
${(solutions?.length || 0) > 0 ? `✅ ${solutions!.length} solutions available for content mapping` : ''}
${recentContent > 0 ? `✅ Active content creation (${recentContent} items in last 30 days)` : ''}
${actionSuccessRate > 80 ? `✅ High user engagement quality (${actionSuccessRate.toFixed(1)}% success rate)` : ''}
${serpApiCalls > 0 ? `✅ SERP intelligence active - competitive positioning data available` : ''}
${activeWorkflows > 5 ? `✅ Strong workflow automation: ${activeWorkflows} active processes` : ''}
${workflowSuccessRate > 80 ? `✅ High workflow efficiency: ${workflowSuccessRate.toFixed(1)}% success rate` : ''}
${totalTeamMembers > 0 && activeCollaborationSessions > 0 ? `✅ Active team collaboration: ${activeCollaborationSessions} sessions running` : ''}

CRITICAL: This includes REAL performance data, user behavior analytics, workflow intelligence, and enterprise metrics. Provide specific, data-driven recommendations based on content strategy, performance insights, research intelligence, AND enterprise workflow optimization.
     `;
  } catch (error) {
    console.error('Error fetching real data context:', error);
    return `
## REAL DATA UNAVAILABLE
Error fetching current data. Recommend checking database connection.
IMPORTANT: Do not generate fake data. Inform user that real-time data is currently unavailable.
    `;
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
    console.log("🚀 Processing enhanced AI chat request for user:", user.id);

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
      } catch (error) {
        console.error("❌ SERP analysis failed, continuing without SERP data:", error);
      }
    }

    // Build enhanced system prompt with context
    // Fetch real data from database using tiered context
    const realDataContext = await fetchRealDataContext(user.id, queryIntent);
    
    // Import prompt modules
    const {
      BASE_PROMPT,
      CHART_MODULE,
      TABLE_MODULE,
      SERP_MODULE,
      ACTION_MODULE,
      MINIMAL_PROMPT,
      RESPONSE_STRUCTURE
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
      // HIGH: Keep essentials + charts (preserve visualization)
      console.warn('⚠️ High token usage (25k-40k) - using BASE + CHART_MODULE only');
      systemPrompt = BASE_PROMPT;
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
      systemPrompt = BASE_PROMPT;
      
      // Add data transparency and response structure (always needed)
      systemPrompt += '\n\n' + RESPONSE_STRUCTURE;
      
      // Add visualization modules based on intent
      if (queryIntent.requiresVisualData || queryIntent.scope === 'detailed' || queryIntent.scope === 'full') {
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


    // Call ai-proxy edge function with user's provider
    const { data: aiProxyResult, error: aiProxyError } = await supabase.functions.invoke('ai-proxy', {
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
          temperature: 0.7,
          max_tokens: dynamicMaxTokens, // Phase 1: Increased from 2000 to support 260K context models
        }
      }
    });

    if (aiProxyError || !aiProxyResult?.success) {
      console.error("AI request failed:", aiProxyError?.message || aiProxyResult?.error);
      return new Response(JSON.stringify({ 
        error: "Failed to get AI response",
        details: aiProxyError?.message || aiProxyResult?.error,
        message: "AI service temporarily unavailable. Please try again in a moment."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = aiProxyResult.data;
    let aiMessage = data?.choices?.[0]?.message?.content;

    // Remove <think> tags IMMEDIATELY before any other processing
    if (aiMessage) {
      console.log(`🧠 Original AI message length: ${aiMessage.length}, has <think>: ${aiMessage.includes('<think>')}`);
      
      aiMessage = aiMessage
        .replace(/<\s*think\s*>[\s\S]*?<\s*\/\s*think\s*>/gi, '') // Handle tags with spaces
        .replace(/<think>[\s\S]*?<\/think>/gi, '') // Standard tags
        .replace(/<\/?think>/gi, '') // Orphaned tags
        .trim();
      
      console.log(`✅ Cleaned AI message length: ${aiMessage.length}, still has <think>: ${aiMessage.includes('<think>')}`);
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
    
    // Phase 5: Enhanced parsing with graceful degradation
    // Helper function to clean pipe characters from AI responses
    const cleanAIPipes = (text: string): string => {
      if (!text) return text;
      
      // Only remove pipes that aren't part of valid markdown tables
      const lines = text.split('\n');
      const cleanedLines = lines.map(line => {
        const trimmed = line.trim();
        
        // Keep lines that are clearly markdown table rows (start and end with |)
        if (trimmed.startsWith('|') && trimmed.endsWith('|') && (trimmed.match(/\|/g) || []).length >= 3) {
          return line;
        }
        
        // Remove pipe patterns from conversational text
        return line
          .replace(/\|\s*-+\s*\|/g, '---') // Replace | --- | with ---
          .replace(/\|\|/g, '') // Remove double pipes
          .replace(/\s+\|\s+/g, ' '); // Remove isolated pipes with spaces
      });
      
      return cleanedLines.join('\n');
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
        cleanedResponse = cleanAIPipes(cleanedResponse);
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
    const { validateChartData, extractDataSource } = await import('./chart-validator.ts');
    
    // Validate chart data accuracy
    if (visualData && visualData.chartConfig) {
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
      
      // Try table to chart conversion (unless explicitly requested table)
      else if (visualData.type === 'table' && visualData.tableData) {
        const chartData = convertTableToChart(visualData.tableData);
        if (chartData) {
          console.log('✅ Successfully auto-converted table to chart');
          visualData = { type: 'chart', chartConfig: chartData };
        }
      }
    }
    
    // If user explicitly requested table, keep it as table
    else if (chartRequest.type === 'table_explicit' && visualData) {
      console.log('📋 Keeping table format as explicitly requested by user');
    }
    
    // If no structured data was found, try legacy parsing
    if (!actions && !visualData) {
      const jsonBlocks = extractJSONBlocks(aiMessage);
      const allVisualData: any[] = []; // Collect ALL charts instead of overwriting
      
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
        visualData = expandedCharts[0];
        allVisualData = expandedCharts; // Always include expanded array
        console.log(`✅ Generated ${expandedCharts.length} chart perspectives from ${uniqueCharts.length} original chart(s)`);
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

    // Access uniqueCharts from scope (defined in legacy parsing section)
    const allCharts = typeof uniqueCharts !== 'undefined' && uniqueCharts.length > 1 ? uniqueCharts : undefined;
    
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