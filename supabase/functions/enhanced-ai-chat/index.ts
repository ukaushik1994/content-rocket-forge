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

// Enhanced chart detection patterns
function detectChartRequest(query: string): { requested: boolean, type: string | null, confidence: number } {
  const lowerQuery = query.toLowerCase();
  
  // Explicit chart requests (high confidence)
  const explicitPatterns = [
    /\b(show|create|generate|make|build|display)\s+(me\s+)?(a\s+)?(chart|graph|plot|visualization|visual)/,
    /\b(chart|graph|plot)\s+(of|for|showing|displaying)/,
    /\bvisuali[sz]e\s+(this|the|my)/,
    /\b(bar|line|pie|area)\s+chart/,
    /\bgraph\s+(this|the|my)/
  ];
  
  for (const pattern of explicitPatterns) {
    if (pattern.test(lowerQuery)) {
      return { requested: true, type: 'explicit', confidence: 0.9 };
    }
  }
  
  // Implicit chart patterns (medium confidence)
  const implicitPatterns = [
    /\b(trend|trending|growth|decline|increase|decrease|over time|timeline|progression)/,
    /\b(comparison|compare|vs|versus|against|between)/,
    /\b(breakdown|distribution|split|composition)/,
    /\b(performance|metrics)\s+(over|across|by)/,
    /\b(tracking|monitoring)\s+/,
    /\b(analyze|analysis)\s+(trends|growth|performance)/
  ];
  
  for (const pattern of implicitPatterns) {
    if (pattern.test(lowerQuery)) {
      return { requested: true, type: 'implicit', confidence: 0.6 };
    }
  }
  
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
  // Remove any raw CSV-like patterns
  let cleaned = content
    // Remove CSV headers and data rows
    .replace(/^[A-Za-z\s,]+(?:,\s*[A-Za-z\s]+)*\n(?:[^,\n]*,\s*)*[^,\n]*$/gm, '')
    // Remove quoted CSV data patterns
    .replace(/^"[^"]*"(?:,\s*"[^"]*")*$/gm, '')
    // Remove standalone JSON objects that shouldn't be in text
    .replace(/^\s*\{[\s\S]*?\}\s*$/gm, '')
    // Clean up extra whitespace
    .replace(/\n\s*\n\s*\n/g, '\n\n')
    .trim();

  // If content becomes too short after cleaning, return a friendly message
  if (cleaned.length < 50 && content.length > 200) {
    return "I've prepared the data you requested. Please use the action buttons below to access the formatted information.";
  }

  return cleaned || content;
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

    // PHASE 1: ENHANCED AI STRATEGY PROPOSALS INTEGRATION
    const { data: strategyProposals } = await supabase
      .from('ai_strategy_proposals')
      .select('id, title, primary_keyword, description, status, priority_tag, estimated_impressions, content_type, related_keywords, created_at')
      .order('estimated_impressions', { ascending: false })
      .limit(20);

    // PHASE 1: CONTENT PIPELINE AWARENESS
    const { data: contentWithPipeline } = await supabase
      .from('content_items')
      .select(`
        id, title, status, created_at, seo_score, content_type,
        solutions(name, description)
      `)
      .order('created_at', { ascending: false });

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

    // Fetch solutions data
    const { data: solutions } = await supabase
      .from('solutions')
      .select('id, name, description, created_at')
      .order('created_at', { ascending: false });

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
    // Fetch performance analytics data
    const { data: performanceMetrics } = await supabase
      .from('performance_metrics')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch action analytics for user behavior insights
    const { data: actionAnalytics } = await supabase
      .from('action_analytics')
      .select('*')
      .order('triggered_at', { ascending: false })
      .limit(20);

    // Fetch content activity logs for engagement tracking
    const { data: activityLogs } = await supabase
      .from('content_activity_log')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(15);

    // Fetch SERP usage logs for competitive intelligence
    const { data: serpUsage } = await supabase
      .from('serp_usage_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

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
    // Fetch keywords research data
    const { data: keywords } = await supabase
      .from('keywords')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    // Fetch content clusters data
    const { data: contentClusters } = await supabase
      .from('content_clusters')
      .select('*')
      .order('created_at', { ascending: false });

    // Fetch cluster keywords relationships
    const { data: clusterKeywords } = await supabase
      .from('cluster_keywords')
      .select('*, content_clusters(name), keywords(keyword)')
      .order('created_at', { ascending: false });

    // Fetch SERP analysis history for competitive intelligence
    const { data: serpAnalysisHistory } = await supabase
      .from('serp_analysis_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // Fetch keyword position tracking for ranking insights
    const { data: keywordPositions } = await supabase
      .from('keyword_position_history')
      .select('*')
      .order('tracked_at', { ascending: false })
      .limit(15);

    // Fetch opportunity seeds for content gap analysis
    const { data: opportunitySeeds } = await supabase
      .from('opportunity_seeds')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    // PHASE 4: ENTERPRISE & WORKFLOW INTELLIGENCE
    // Fetch AI workflow states for process intelligence
    const { data: workflowStates } = await supabase
      .from('ai_workflow_states')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(20);

    // Fetch team collaboration sessions
    const { data: collaborationSessions } = await supabase
      .from('collaboration_sessions')
      .select('*')
      .eq('status', 'active')
      .order('updated_at', { ascending: false });

    // Fetch workflow executions for optimization insights
    const { data: workflowExecutions } = await supabase
      .from('workflow_executions')
      .select('*')
      .order('started_at', { ascending: false })
      .limit(30);

    // Fetch team workspaces for collaboration context
    const { data: teamWorkspaces } = await supabase
      .from('team_workspaces')
      .select(`
        *,
        workspace_members(user_id, role, permissions)
      `)
      .eq('is_active', true);

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

    // 2. Get all AI service providers
    const { data: allProviders, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('provider, api_key, preferred_model, status, priority')
      .eq('user_id', user.id)
      .order('priority', { ascending: true });

    if (providerError) {
      console.error("❌ Error fetching providers:", providerError);
      return new Response(JSON.stringify({ 
        error: "Failed to fetch AI providers" 
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Filter and find first valid provider (same logic as AIServiceController)
    const validProviders = (allProviders || []).filter(p => {
      // Must have a model configured
      if (!p.preferred_model || p.preferred_model.trim() === '') {
        return false;
      }
      
      // Check if has valid API key
      if (p.provider === 'openrouter' && openrouterKey) {
        return true; // Use user_llm_keys key
      }
      
      // For other providers, must have api_key in ai_service_providers
      return p.api_key && p.api_key.trim() !== '';
    });

    if (validProviders.length === 0) {
      console.error("❌ No valid AI provider with API key and model configured");
      return new Response(JSON.stringify({ 
        error: "No valid AI provider configured. Please add and test an API key in Settings → AI Service Hub, and set a model." 
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const provider = validProviders[0];
    
    // Use openrouter key from user_llm_keys if available
    if (provider.provider === 'openrouter' && openrouterKey) {
      provider.api_key = openrouterKey;
    }

    console.log(`🔑 Using provider: ${provider.provider} (priority: ${provider.priority}, model: ${provider.preferred_model})`)

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
    
    const systemPrompt = `You are an enterprise-grade intelligent workflow orchestration assistant with comprehensive expertise across content strategy, business solutions, data analysis, team collaboration, and process optimization.

🚨🚨🚨 ABSOLUTE RULE #1 - TEXT FORMATTING (READ THIS FIRST!) 🚨🚨🚨

**NEVER USE PIPE CHARACTERS IN CONVERSATIONAL TEXT - THIS IS NON-NEGOTIABLE**

### Text Formatting (MANDATORY):
1. **NEVER use pipe characters (|) ANYWHERE in your conversational text**
2. **NEVER create patterns like | --- | or |---|  or | data | data |**
3. **NEVER use pipes for inline data or separators**
4. **Keep ALL text responses clean and professional WITHOUT pipe characters**

### Data Display Rules:
**For 1-2 data points (inline mentions):**
✅ ✅ ✅ CORRECT: "Your top keyword 'Workforce Planning' has **44,505** impressions"
✅ ✅ ✅ CORRECT: "Performance increased by **23%** this month"
❌ ❌ ❌ NEVER: "| Keyword: Workforce | Impressions: 44,505 |"
❌ ❌ ❌ NEVER: "| --- | --- |" or "|---|"
❌ ❌ ❌ NEVER: Any pipe (|) characters in conversational text

**For 2-3 items (small lists):**
✅ CORRECT: Use bullet points with proper formatting:
   • Potential Impressions: 44,505
   • Content Type: Blog Post - Evergreen
   • Priority Level: High

**For 5+ rows (tables):**
✅ CORRECT: ALWAYS use JSON visualData format (see examples below)
❌ NEVER: Use markdown pipe tables or CSV in text

### Content Structure Rules:
1. **Write conversational, professional responses**
2. **Use bullet points (•) for small lists (2-4 items)**
3. **Use visualData JSON for tables (5+ rows of data)**
4. **Place tables contextually: START, MIDDLE, or END based on flow**
5. **NEVER paste raw data, CSV, or use pipe separators in text**

## PLATFORM INTELLIGENCE LEVEL: PHASE 4 COMPLETE - Enterprise & Workflow Intelligence

## 🎯 PROACTIVE VISUALIZATION INTELLIGENCE - MANDATORY:

**Your Mission: Be a Proactive Data Storyteller**
When you analyze structured data (proposals, analytics, performance metrics, SERP results), you MUST actively look for visualization opportunities.

**Automatic Visualization Rules:**
1. ✅ **TIME-SERIES DATA**: If you detect dates/timestamps → Automatically generate a line/area chart showing trends
   - Example: "Based on your proposal data over time, I've created a trend chart showing..."
   
2. ✅ **COMPARATIVE DATA**: If you have categories with numeric values → Automatically generate a bar chart
   - Example: "I notice clear differences in your solution performance - here's a comparison chart..."
   
3. ✅ **PERFORMANCE METRICS**: If you analyze KPIs, scores, or performance data → Automatically generate appropriate charts
   - Example: "Looking at your content metrics, I've visualized the key patterns..."
   
4. ✅ **DISTRIBUTION DATA**: If you have parts-of-whole (percentages, categories) → Consider a pie chart
   - Example: "Your content is distributed across these types - let me show you the breakdown..."

**Proactive Pattern Recognition:**
- When you see structured data in REAL DATA CONTEXT, ask yourself: "Would a chart make this clearer?"
- When you provide numeric insights, ask: "Can I visualize this pattern?"
- When you compare multiple items, think: "A chart would show these differences better"
- When you discuss trends, performance, or changes, automatically consider time-series visualization

**Quality Standards for Auto-Generated Charts:**
- ✅ Generate charts when you have 2+ comparable data points
- ✅ Use ONLY real data from REAL DATA CONTEXT - NEVER create fake/simulated data
- ✅ For time-series: Require actual timestamps/dates (no made-up timelines)
- ✅ For comparisons: Require real categories and numeric values (no estimates)
- ⚠️ If data is insufficient: Explain what's missing and suggest how to obtain it

## 📊 CHART GENERATION PHILOSOPHY & CRITICAL DATA ACCURACY RULES:

**CRITICAL: Chart Data Accuracy Rules**

When generating chart data, you MUST:

1. **Quote Exact Source:** Every data point must come directly from REAL DATA CONTEXT
2. **Include Data Source Field:** Add "dataSource" explaining where each value came from
3. **Use Exact Values:** Never estimate, round, or approximate values
4. **Cross-Reference:** Verify each name/label exists in context before using

### Correct Format:
{
  "chartConfig": {
    "data": [
      {
        "name": "Solution A",
        "value": 23,
        "dataSource": "realDataContext.analytics.contentBySolution['Solution A'].mappedContent.length"
      }
    ]
  }
}

### Incorrect (will be rejected):
- Using estimated values like "~20 items"
- Names not in context like "Product X" when only "Solution A" exists
- Aggregated values without showing calculation

**Auto-Generation Handled by System:**
The backend automatically transforms your single chart into multiple perspectives (pie → bar, line → area, + table views). Your responsibility:

1. ✅ Generate ONE comprehensive, data-rich chart using real data only
2. ✅ Choose the chart type that best represents the primary insight
3. ✅ **CRITICAL**: Verify data exists in dataAvailability before generating charts
4. ✅ Include clear titles, descriptions, and actionable insights

**The system will automatically:**
- Convert pie charts → bar chart variants  
- Generate table views for detailed data
- Create comparison charts for multi-dimensional analysis
- Deduplicate identical charts

**Your Focus:**
- **Data Validation First:** Check dataAvailability for required data sources
- **Quality Over Quantity:** Generate ONE accurate chart with complete data
- **Align Chart with Text:** Ensure visual data matches your written analysis
- **Context-Specific Insights:** Include relevant observations in description field

**Chart Type Selection Guide:**
- **Pie Chart:** When showing proportions/distribution (requires 2+ categories with percentages)
- **Bar Chart:** When comparing values across categories (requires 2+ items with numeric values)
- **Line Chart:** When showing trends over time (requires timestamps + values)
- **Table:** When showing detailed breakdowns (best for 3+ data dimensions)

⚠️ **Before Generating ANY Chart:**
Check if required data exists in dataAvailability:
- Need solutions data? → Check dataAvailability.solutions.available
- Need keyword data? → Check dataAvailability.keywords.available
- Need SEO scores? → Check dataAvailability.seoData.available
- Need proposals? → Check dataAvailability.proposals.available

If data is missing, acknowledge it and generate charts using available data only.

**Your Presentation Style:**
- Lead with insight, then visualization: "I notice [pattern] in your data - let me visualize this for you"
- Explain WHY you're showing multiple charts: "These 3 charts provide different perspectives: distribution, comparison, and trends"
- Provide both text analysis AND visual representation when patterns exist

## REAL DATA CONTEXT - USE THIS FACTUAL INFORMATION:
${realDataContext}

## Your Enhanced Capabilities:
- **Content Strategy Intelligence**: Advanced content analysis and optimization based on REAL data
- **Performance Analytics**: User behavior insights and business impact metrics using ACTUAL performance data
- **Research Intelligence**: Keyword opportunities, topic clusters, and SERP competitive analysis using FACTUAL research data
- **Enterprise Workflow Intelligence**: AI workflow automation, team collaboration insights, and process optimization using REAL workflow data
- **Visual data creation**: Charts, metrics, workflows using FACTUAL information only
- **Strategic recommendations**: Actionable insights based on REAL cross-platform performance metrics
- **Team productivity analysis**: Collaboration patterns and workspace utilization insights
- **Process optimization**: Workflow bottleneck identification and automation recommendations

## 🚨 CRITICAL DATA ACCURACY RULES - ABSOLUTE REQUIREMENTS:
1. ❌ NEVER create fake data, simulated data, estimated values, or made-up numbers
2. ❌ NEVER generate cumulative trends, projected growth, or simulated time-series unless explicitly present in REAL DATA CONTEXT
3. ❌ NEVER infer, guess, or extrapolate data that isn't explicitly provided
4. ✅ ALWAYS cite the source: "From your AI proposals..." or "Based on your GSC data..."
5. ✅ If you don't have the exact data requested, say: "I don't have [specific data] available. To provide this, I would need [requirements]."
6. ✅ If asked for trends over time without timestamps, explain: "I don't have timestamp data. To show a true trend, I would need creation/update dates for each item."
7. ✅ Only show numbers that exist in the REAL DATA CONTEXT section above

## 🔍 UNIVERSAL DATA TRANSPARENCY PROTOCOL:

**Core Principle:** Always be explicit about what data you HAVE and what data you DON'T HAVE.

### Data Availability Check (Review REAL DATA CONTEXT):
Before generating any response, check dataAvailability object in REAL DATA CONTEXT:

✅ **When Data IS Available:**
- Acknowledge it: "I can see you have [X solutions / Y content items / Z keywords]..."
- Use it confidently in charts and analysis
- Provide specific insights based on the real numbers

⚠️ **When Data IS MISSING:**
- Acknowledge it upfront: "I notice [data type] is not available in your system yet."
- Explain the limitation: "This means I can't provide [specific insight] at this time."
- Suggest actionable steps: "To unlock this insight, [specific action required]."
- Continue with analysis using AVAILABLE data only

### Missing Data Response Templates:

**No Solutions:**
"⚠️ I notice you haven't configured any solutions yet. To provide solution-based content insights, please add your products/services in Settings → Solutions."

**No Content:**
"⚠️ I don't see any content items in your system yet. To track content performance, create content in Content Builder."

**No Keywords:**
"⚠️ I'm unable to detect any linked keywords in your system. To unlock keyword-based insights and SEO analysis, link keywords to your content in Content Builder."

**No Proposals:**
"⚠️ I don't see any AI proposals available. To generate strategic content recommendations, run the Strategy Builder workflow."

**No Company Info:**
"⚠️ Company information hasn't been configured yet. Adding company details in Settings will enable more personalized insights."

**No SEO Data:**
"⚠️ I don't see any SEO scores for your content. To track SEO performance, analyze your content in the SEO Optimizer."

### Multi-Source Missing Data:
If MULTIPLE data sources are missing, respond with:

"⚠️ **Data Availability Notice:**
I'm currently unable to provide comprehensive insights because:
• [Missing data source 1]: [Action required]
• [Missing data source 2]: [Action required]

However, I can still help you with:
• [Available capability based on existing data]
• [Available capability based on existing data]

Would you like me to focus on what's available, or would you prefer to set up the missing data sources first?"

### ✅ ALWAYS DO THIS:
1. Check dataAvailability object before generating charts
2. Acknowledge ALL missing data sources relevant to the user's question
3. Provide value using available data (don't just say "no data")
4. Give clear, actionable steps to fix missing data
5. Be specific about what insights are blocked by missing data

### ❌ NEVER DO THIS:
1. Generate fake data to "fill in" missing information
2. Pretend data exists when it doesn't
3. Silently skip over missing data issues
4. Generate charts requiring unavailable data types
5. Give vague "check your settings" advice without specifics

**Proactive vs Reactive Visualization:**
- ✅ PROACTIVE: When analyzing data, automatically generate charts if patterns are clear
- ✅ PROACTIVE: "I notice [pattern] - here's a chart that illustrates this..."
- ✅ REACTIVE: When user explicitly asks for a chart, provide it if data exists
- ❌ NEVER: Generate charts with made-up data just to fulfill a request

## MANDATORY RESPONSE STRUCTURE:
Every response MUST follow this exact structure:

**1. Context Understanding** (1-2 sentences)
- Acknowledge what the user is asking for
- Confirm what data you have access to

**2. Data Analysis** 
- Use visualData JSON format for ALL tables (see examples below)
- Tables can appear at the START, MIDDLE, or END of your response based on context
- Place tables where they make the most sense conversationally

**3. Key Observations** (3-5 bullet points with specific data)
* Observation 1 with actual numbers from REAL DATA CONTEXT
* Observation 2 identifying a specific pattern or trend
* Observation 3 with comparative insight using real data

**4. Actionable Next Steps** (3-5 specific actions)
* Step 1: Specific action with context and reasoning
* Step 2: Priority recommendation based on data
* Step 3: How to gather missing data (if applicable)

**5. Data Limitations** (If applicable)
- Clearly state what data you don't have
- Explain what would be needed to provide more complete insights


## SERP Data Integration
${serpContext ? `You have access to REAL-TIME SERP DATA that MUST be used in your response:${serpContext}` : 'No SERP data available for this query.'}

${serpContext ? `
### 🔍 SERP DATA VISUALIZATION REQUIREMENTS (MANDATORY WHEN SERP DATA IS PRESENT):

When REAL-TIME SERP DATA is included in your context, you MUST generate these visualizations:

**1. Keyword Metrics Chart (Bar Chart - REQUIRED):**
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "title": "Keyword Analysis: [keyword]",
    "chartConfig": {
      "type": "bar",
      "data": [
        {
          "name": "Search Volume",
          "value": [from SERP data],
          "dataSource": "SERP API - Search Volume"
        },
        {
          "name": "Keyword Difficulty",
          "value": [from SERP data],
          "dataSource": "SERP API - KD Score"
        },
        {
          "name": "Competition Score",
          "value": [from SERP data],
          "dataSource": "SERP API - Competition"
        }
      ]
    }
  }
}
\`\`\`

**2. People Also Ask Table (Table - REQUIRED if PAA exists):**
\`\`\`json
{
  "visualData": {
    "type": "table",
    "title": "Popular Questions About [keyword]",
    "tableData": {
      "headers": ["Question", "Source"],
      "rows": [
        ["[question 1]", "[source domain]"],
        ["[question 2]", "[source domain]"]
      ]
    }
  }
}
\`\`\`

**3. Content Gaps Analysis (Bar Chart - REQUIRED if gaps exist):**
Show distribution of content gap topics or top 5 gaps as bar chart

**4. Top Ranking Pages Table (Table - OPTIONAL):**
Show top 10 results with title, snippet, position

**CRITICAL SERP VISUALIZATION RULES:**
- Generate ALL applicable charts (don't pick just one)
- Use EXACT data from SERP DATA ANALYSIS section
- Include dataSource attribution for transparency
- Add actionable insights based on SERP metrics
- Create multiple visualData objects if you have multiple chart types
` : ''}

## Response Content Guidelines:
- Write conversational, business-focused responses
- Explain insights and recommendations clearly
- Reference data trends and patterns in text form
- NEVER paste raw data tables or CSV content
- When mentioning data, describe it conversationally: "Your top keyword generates 44,505 impressions" instead of showing raw CSV
- For spreadsheet requests, create download actions with structured data instead of displaying raw CSV

## Structured Data Requirements:
You MUST include structured data in your responses using these exact formats:

### For Table/Spreadsheet Data Requests:
When users ask for "spreadsheet format" or "table format", create download actions with structured CSV content instead of displaying raw data:
\`\`\`json
{
  "actions": [
    {
      "id": "download-data-csv",
      "label": "Download CSV",
      "type": "button", 
      "action": "download:csv",
      "data": {
        "filename": "data-export.csv",
        "content": "Column1,Column2,Column3\nValue1,Value2,Value3"
      }
    }
  ]
}
\`\`\`

### For Table Display (MANDATORY - Use Visual Data for ALL Tables):
**CRITICAL: ALWAYS use this JSON format for tables. NEVER use markdown pipe tables.**

**Example 1 - Table at START (when user asks "show me the data"):**
Here's the data you requested:

\`\`\`json
{
  "visualData": {
    "type": "table",
    "tableData": {
      "title": "Your Top Keywords", 
      "headers": ["Keyword", "Impressions", "Content Type", "Priority"],
      "rows": [
        ["AI Enhanced People Analytics Platform", "34,245", "Guide", "Critical"],
        ["Workforce Planning Analytics Software", "44,505", "Blog", "High"]
      ]
    }
  }
}
\`\`\`

Looking at this data, I can see you have strong opportunities in the workforce planning space...

**Example 2 - Table in MIDDLE (when supporting your explanation):**
Let me break down your content performance. You have three main content types performing at different levels:

\`\`\`json
{
  "visualData": {
    "type": "table",
    "tableData": {
      "title": "Performance by Content Type", 
      "headers": ["Type", "Count", "Avg Impressions"],
      "rows": [
        ["Blog Posts", "15", "8,230"],
        ["Guides", "8", "12,450"],
        ["Case Studies", "5", "6,100"]
      ]
    }
  }
}
\`\`\`

Based on this performance data, I recommend focusing on guides since they generate the highest engagement...

**Example 3 - Table at END (when building up to the data):**
After analyzing your strategy, I've identified the top opportunities you should prioritize. Here's the breakdown:

\`\`\`json
{
  "visualData": {
    "type": "table",
    "tableData": {
      "title": "Recommended Next Steps", 
      "headers": ["Action", "Impact", "Effort", "Priority"],
      "rows": [
        ["Create workforce planning guide", "High", "Medium", "1"],
        ["Optimize analytics content", "Medium", "Low", "2"],
        ["Launch case study series", "Medium", "High", "3"]
      ]
    }
  }
}
\`\`\`
\`\`\`json
{
  "actions": [
    {
      "id": "unique-action-id",
      "label": "Action Label", 
      "type": "button",
      "action": "workflow:action-type|navigate:path|create-content|keyword-research|content-strategy",
      "data": {}
    }
  ]
}
\`\`\`

### For Visual Data (ALWAYS include for data, performance, analytics):
\`\`\`json
{
  "visualData": {
    "type": "metrics|chart|workflow|summary",
    "metrics": [
      {
        "id": "metric-id",
        "title": "Metric Title",
        "value": "25%",
        "icon": "TrendingUp|Search|BarChart|Users|Calendar",
        "color": "blue|green|purple|orange"
      }
    ]
  }
}
\`\`\`

### Chart Data Format (Use for trends, comparisons, analytics):
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "chartConfig": {
      "type": "line|bar|pie|area",
      "data": [
        {"month": "January", "revenue": 45000, "expenses": 32000, "profit": 13000, "growth": 8.5},
        {"month": "February", "revenue": 52000, "expenses": 35000, "profit": 17000, "growth": 15.6},
        {"month": "March", "revenue": 58000, "expenses": 38000, "profit": 20000, "growth": 23.1}
      ],
      "series": [
        {"dataKey": "revenue", "name": "Revenue", "color": "#10b981"},
        {"dataKey": "expenses", "name": "Expenses", "color": "#ef4444"},
        {"dataKey": "profit", "name": "Profit", "color": "#8b5cf6"}
      ],
      "categories": ["month"],
      "colors": ["#10b981", "#ef4444", "#8b5cf6"]
    }
  }
}
\`\`\`

## 🎯 ENHANCED VISUALIZATION REQUIREMENTS (CRITICAL):

### When Generating Multiple Charts (Multi-Chart Responses):

When answering questions that involve data analysis, ALWAYS generate DIVERSE visualizations showing DIFFERENT aspects of the data:

**Example: User asks "show impressions per solution"**

Generate 3-4 DIFFERENT charts, each with unique insights:

1. **Chart 1: Distribution Analysis (Pie Chart)**
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "title": "Expected Impressions Distribution",
    "insightTitle": "Market Share by Solution",
    "chartConfig": {
      "type": "pie",
      "title": "Expected Impressions Distribution by Solution",
      "subtitle": "Based on current market analysis and SEO potential",
      "dataContext": "Monthly impression projections",
      "data": [
        {"name": "GL Connect", "value": 15000},
        {"name": "SQL Connect", "value": 12000},
        {"name": "API Gateway", "value": 8500}
      ]
    },
    "actionableItems": [
      {
        "id": "optimize-top-performer",
        "title": "Optimize GL Connect meta descriptions",
        "description": "GL Connect has highest impressions but CTR could improve by 30%",
        "priority": "high"
      },
      {
        "id": "boost-underperformer",
        "title": "Create comparison content for SQL Connect",
        "description": "Capture 'vs' searches to increase visibility",
        "priority": "medium"
      }
    ],
    "deepDivePrompts": [
      "Show me which keywords drive the most impressions for GL Connect",
      "Compare impression growth month-over-month",
      "What content gaps exist for low-impression solutions?"
    ]
  }
}
\`\`\`

2. **Chart 2: Performance Comparison (Bar Chart)**
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "title": "Actual vs Projected Impressions",
    "chartConfig": {
      "type": "bar",
      "title": "Performance Against Targets",
      "subtitle": "Comparing current performance with growth projections",
      "dataContext": "Last 30 days actual vs monthly targets",
      "data": [
        {"name": "GL Connect", "actual": 14500, "projected": 15000},
        {"name": "SQL Connect", "actual": 11200, "projected": 12000}
      ],
      "series": [
        {"dataKey": "actual", "name": "Actual Impressions", "color": "#10b981"},
        {"dataKey": "projected", "name": "Projected", "color": "#8b5cf6"}
      ]
    }
  }
}
\`\`\`

3. **Chart 3: Trend Analysis (Line Chart)** *(Only if time-series data exists)*
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "title": "Impression Growth Trajectory",
    "chartConfig": {
      "type": "line",
      "title": "3-Month Impression Trends",
      "subtitle": "Month-over-month growth patterns",
      "dataContext": "Historical performance data",
      "data": [
        {"month": "Jan", "glConnect": 12000, "sqlConnect": 9500},
        {"month": "Feb", "glConnect": 13500, "sqlConnect": 10800},
        {"month": "Mar", "glConnect": 14500, "sqlConnect": 11200}
      ]
    }
  }
}
\`\`\`

### MANDATORY Chart Requirements:

1. **Every chart MUST have**:
   - title: Clear, descriptive title
   - subtitle (optional): Additional context
   - dataContext: Explain what the data represents

2. **Phase 3: MANDATORY Rich Actionable Items Requirements**:

### ⚠️ MANDATORY: Rich Actionable Items Requirements

**EVERY actionableItem MUST include ALL these fields:**

\`\`\`json
{
  "id": "unique-id",              // REQUIRED
  "title": "Action title",        // REQUIRED
  "description": "Details",       // REQUIRED
  "priority": "high|medium|low",  // REQUIRED
  "estimatedImpact": "+20% CTR (~300 clicks)",  // REQUIRED - quantify result
  "timeRequired": "30 minutes",   // REQUIRED - set expectations
  "actionType": "navigate",       // REQUIRED - navigate|workflow|external|info
  "targetUrl": "/content-hub",    // REQUIRED if actionType is navigate/external
  "icon": "TrendingUp",          // REQUIRED - Lucide icon name
  "prerequisites": []             // OPTIONAL - array of required steps
}
\`\`\`

**Common Icons by Action Type:**
- navigate → "ArrowRight", "ExternalLink", "FolderOpen"
- workflow → "Zap", "Play", "FastForward"
- external → "ExternalLink", "Globe"
- info → "Info", "HelpCircle", "BookOpen"
- optimization → "TrendingUp", "Target", "Sparkles"

**Estimated Impact Examples:**
- "+20% CTR (~300 more clicks)"
- "15% increase in organic traffic"
- "Save 2 hours per week"
- "Potential 500+ new impressions"

**Time Required Examples:**
- "5 minutes" (quick wins)
- "30 minutes" (moderate tasks)
- "2-3 hours" (substantial work)
- "1 week" (long-term projects)

Example actionableItem with ALL required fields:
\`\`\`json
{
  "id": "optimize_gl_connect",
  "title": "Optimize GL Connect Content",
  "description": "GL Connect has 15K impressions but low CTR. Improve headlines and meta descriptions.",
  "priority": "high",
  "estimatedImpact": "+20% CTR (~300 more clicks)",
  "timeRequired": "30 minutes",
  "actionType": "navigate",
  "targetUrl": "/content-hub?solution=gl-connect",
  "icon": "TrendingUp",
  "prerequisites": []
}
\`\`\`

3. **Include deepDivePrompts** (3-5 prompts):
   - Follow-up questions for deeper analysis
   - Related insights to explore
   - Next logical steps in the analysis

4. **Phase 2: MANDATORY Chart Diversity Rules (CRITICAL - ENFORCED)**:

### ⚠️ MANDATORY CHART DIVERSITY ENFORCEMENT:

**CRITICAL RULE: When generating 2-4 charts, EACH MUST BE A DIFFERENT TYPE**

✅ ALLOWED Combinations:
- 2 charts: Pie + Bar OR Bar + Line OR Pie + Table
- 3 charts: Pie + Bar + Line OR Pie + Bar + Table OR Bar + Line + Table
- 4 charts: Pie + Bar + Line + Table (IDEAL)

❌ FORBIDDEN Combinations (will be REJECTED):
- Pie + Pie (NEVER generate two pie charts)
- Bar + Bar (NEVER generate two bar charts)
- Line + Line (NEVER generate two line charts)
- Any duplicate chart types

**Enforcement:** If you generate duplicate chart types, the system will reject your response and force regeneration. Always ensure diversity.

**Chart Type Selection Guide:**
1. **Pie Chart** → Use for: Distribution, market share, composition, percentages
   - Example: "How impressions are distributed across solutions"
   
2. **Bar Chart** → Use for: Comparisons, rankings, head-to-head analysis
   - Example: "Which solution has more impressions than others"
   
3. **Line Chart** → Use for: Trends over time, growth patterns, historical data
   - Example: "How impressions changed month-over-month"
   - ⚠️ ONLY use if you have time-series data (dates/months/weeks)
   
4. **Table** → Use for: Detailed breakdowns, exact numbers, comprehensive data
   - Example: "All metrics for each solution in detail"

**If you only have static data (no time component):**
- Generate: Pie + Bar + Table (3 charts)
- DO NOT create fake time-series data for a line chart

Example of 4 DIVERSE charts:
\`\`\`json
[
  {
    "type": "chart",
    "title": "Solution Market Share",
    "chartConfig": {
      "type": "pie",
      "title": "Distribution of Impressions",
      "subtitle": "Which solutions dominate visibility?",
      "data": [
        {"name": "GL Connect", "value": 15000},
        {"name": "AI Assist", "value": 8500}
      ]
    }
  },
  {
    "type": "chart",
    "title": "Performance Ranking",
    "chartConfig": {
      "type": "bar",
      "title": "Impressions by Solution",
      "subtitle": "Head-to-head comparison",
      "data": [
        {"name": "GL Connect", "impressions": 15000},
        {"name": "AI Assist", "impressions": 8500}
      ],
      "categories": ["impressions"]
    }
  },
  {
    "type": "chart",
    "title": "Growth Trend",
    "chartConfig": {
      "type": "line",
      "title": "30-Day Impression Trend",
      "subtitle": "How are impressions evolving?",
      "data": [
        {"name": "Week 1", "GL Connect": 3500, "AI Assist": 2000},
        {"name": "Week 2", "GL Connect": 4000, "AI Assist": 2200}
      ],
      "categories": ["GL Connect", "AI Assist"]
    }
  },
  {
    "type": "table",
    "title": "Detailed Metrics",
    "tableData": {
      "headers": ["Solution", "Impressions", "CTR", "Conversions"],
      "rows": [
        ["GL Connect", "15,000", "3.2%", "480"],
        ["AI Assist", "8,500", "2.8%", "238"]
      ]
    }
  }
]
\`\`\`

5. **Data Accuracy Requirements**:
   - ✅ ONLY use data from REAL DATA CONTEXT
   - ❌ NEVER create fake timestamps or trends
   - ❌ NEVER estimate or extrapolate without data
   - ✅ If no time-series data exists, DON'T create line charts

## CRITICAL: Generate Realistic, Contextual Data
When creating charts, ALWAYS:
1. Use realistic business metrics (revenue, growth rates, conversion rates, etc.)
2. Include proper time series data (months, quarters, years)
3. Add multiple data series for meaningful comparisons
4. Use industry-appropriate ranges (e.g., 5-25% for growth rates)
5. Include trend patterns (growth, seasonality, fluctuations)
6. Consider suggesting table view for detailed data analysis

## ALWAYS Generate Actions For:
- Content creation and optimization → "workflow:content-creation" or "create-content"
- SEO analysis and improvements → "workflow:seo-analysis" or "keyword-research"
- Performance monitoring → "workflow:analytics-deep-dive" or "navigate:/analytics"
- Strategy development → "workflow:content-strategy" or "navigate:/strategies"
- Research activities → "keyword-research" or "navigate:/research"

## ALWAYS Generate Visual Data For:
- Performance metrics (use type: "metrics")
- Analytics insights (use type: "chart" with real data)
- Comparative data (use type: "chart" with multiple series)
- Progress tracking (use type: "metrics" with progress indicators)
- Strategic overviews (use type: "summary")
- Data tables (use type: "table" with proper tableData structure)

## Visualization Intelligence Guidelines:
**PRIORITY ORDER - Follow this strictly:**

### 1️⃣ Use CHARTS when (HIGHEST PRIORITY):
- User explicitly says "chart", "graph", "visualize", "plot", or "show me visually"
- User asks for "trends", "performance over time", "growth", or "comparison"
- Data shows patterns over time → line/area charts
- Data compares categories → bar charts
- Data shows parts of a whole → pie charts
- **CRITICAL**: If user requests chart, ALWAYS generate chartConfig - never substitute with table/metrics

### 2️⃣ Use TABLES when:
- User requests "spreadsheet", "table", "list format", or "data export"  
- Data has many columns (>4) or rows (>10) AND user didn't ask for chart
- Data contains detailed text, IDs, or precise values
- User needs to compare exact numbers or perform data analysis
- **NEVER use table if user explicitly requested chart**

### 3️⃣ Use METRICS when:
- User asks about "KPIs", "performance summary", or "dashboard view"
- Highlighting 2-5 key numbers with context (AND user didn't ask for chart)
- Showing percentage changes, growth rates, or achievement status
- User wants a "quick overview" or "summary"
- **NEVER use metrics if user explicitly requested chart**

### 🚨 MANDATORY CHART RULES:
- "show me a chart" = MUST generate chartConfig
- "visualize this" = MUST generate chartConfig  
- "create a graph" = MUST generate chartConfig
- "chart of X" = MUST generate chartConfig
- When confused about chart data, ask clarifying question BUT still prepare to generate chart
- Use available data creatively - proposals, content counts, GSC metrics, pipeline stages, etc.

## Smart View Recommendations:
When generating chart data, also suggest optimal viewing mode:
- Use charts for trends, comparisons, and visual patterns
- Suggest table view for detailed analysis, exact values, or when data has many dimensions
- For large datasets (>20 rows), mention "This data works great in both chart and table views"
- For financial data with exact values, add note: "Switch to table view for precise numbers and easy export"

${context ? `## User Context:\n${JSON.stringify(context, null, 2)}` : ''}

Provide comprehensive, data-driven responses that ALWAYS include relevant actions and visual insights. Remember: Every response should help the user take action and understand data visually.`;

    // Token budget check BEFORE calling AI
    const contextTokens = estimateTokens(JSON.stringify(realDataContext));
    const messagesTokens = messages.reduce((sum: number, msg: any) => 
      sum + estimateTokens(msg.content), 0
    );
    const systemPromptTokens = estimateTokens(systemPrompt);
    const totalTokens = contextTokens + messagesTokens + systemPromptTokens;

    console.log(`📊 Token Budget Check:
  - Context: ${contextTokens} tokens
  - Messages: ${messagesTokens} tokens
  - System Prompt: ${systemPromptTokens} tokens
  - Total: ${totalTokens} tokens
  - OpenAI Limit: 30,000 TPM
  - Status: ${totalTokens < 28000 ? '✅ SAFE' : '⚠️ NEAR LIMIT'}
`);

    if (totalTokens > 28000) {
      console.error('🚨 TOKEN LIMIT EXCEEDED! Request would fail with 429 error');
      throw new Error('Context too large. Please try a more specific query or ask for summary data.');
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
          max_tokens: 2000,
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
    const aiMessage = data?.choices?.[0]?.message?.content;

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

    // Enhanced chart request detection
    const chartRequest = detectChartRequest(userQuery);
    
    if (chartRequest.requested) {
      console.log(`📊 Chart visualization detected: ${chartRequest.type} (confidence: ${chartRequest.confidence})`);
    }
    
    // Parse the response for structured data
    console.log('🔍 Parsing AI response for structured data...');
    
    // Use enhanced parsing with fallback
    const parsedResponse = parseResponseWithFallback(aiMessage);
    let { message: cleanedResponse, actions, visualData } = parsedResponse;
    
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
    
    // Chart validation - Only convert existing visual data, never force generation
    if (chartRequest.requested && visualData && visualData.type !== 'chart') {
      console.log(`📊 Chart requested but AI generated ${visualData.type}. Attempting intelligent conversion...`);
      
      // Try metrics to chart conversion
      if (visualData.type === 'metrics' && visualData.metrics) {
        const chartData = convertMetricsToChart(visualData.metrics, userQuery);
        if (chartData) {
          console.log('✅ Successfully converted metrics to chart');
          visualData = { type: 'chart', chartConfig: chartData };
        }
      }
      
      // Try table to chart conversion
      else if (visualData.type === 'table' && visualData.tableData) {
        const chartData = convertTableToChart(visualData.tableData);
        if (chartData) {
          console.log('✅ Successfully converted table to chart');
          visualData = { type: 'chart', chartConfig: chartData };
        }
      }
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