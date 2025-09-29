import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { extractJSONBlocks, removeExtractedJSON } from './json-parser.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';
import { 
  analyzeSerpIntent, 
  executeSerpAnalysis, 
  generateSerpContext, 
  generateSmartSuggestions 
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

// Enhanced real data fetching function with Phase 1 & Phase 2 intelligence including GSC
async function fetchRealDataContext() {
  try {
    // PHASE 1: GOOGLE SEARCH CONSOLE INTEGRATION
    const { data: gscData } = await supabase
      .from('content_analytics')
      .select('*')
      .order('last_fetched_at', { ascending: false })
      .limit(20);

    // Calculate GSC insights
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

### AI STRATEGY PROPOSALS (REAL DATA):
- Total Proposals: ${strategyProposals?.length || 0}
- Available Opportunities: ${availableProposals} (ready for content creation)
- Scheduled: ${scheduledProposals} | Completed: ${completedProposals}
- Total Potential Impressions: ${totalImpressions.toLocaleString()}
- Highest Opportunity: ${topOpportunities[0]?.keyword || 'No proposals'} (${(topOpportunities[0]?.impressions || 0).toLocaleString()} impressions)

### TOP 5 CONTENT OPPORTUNITIES (REAL PROPOSALS):
${topOpportunities.map((opp, i) => 
  `${i + 1}. "${opp.keyword}" - ${opp.impressions?.toLocaleString() || 0} impressions (${opp.contentType}, ${opp.priority})`
).join('\n')}

### PHASE 2: PERFORMANCE & ANALYTICS INTELLIGENCE (REAL DATA):
- Total User Actions Tracked: ${totalActions}
- Action Success Rate: ${actionSuccessRate.toFixed(1)}% (${successfulActions}/${totalActions})
- Top Action Types: ${Object.entries(actionTypes).map(([type, count]) => `${type}: ${count}`).join(', ') || 'No actions tracked'}
- Content Activity Events: ${recentActivity} recent events
- Active Content Modules: ${Object.entries(contentModules).map(([module, count]) => `${module}: ${count}`).join(', ') || 'No activity'}
- SERP API Usage: ${serpApiCalls} calls (${serpSuccessRate.toFixed(1)}% success rate)

### PHASE 3: RESEARCH & INTELLIGENCE ENHANCEMENT (REAL DATA):
- **Keyword Research Portfolio**: ${totalKeywords} keywords tracked
- **Topic Clusters**: ${totalClusters} clusters (${totalClusterRelations} keyword-cluster relationships)
- **Keyword Intent Distribution**: ${Object.entries(keywordCategories).map(([intent, count]) => `${intent}: ${count}`).join(', ') || 'No categorization'}
- **SERP Competitive Analysis**: ${serpAnalysisCount} historical analyses
- **Position Tracking**: ${positionTrackingCount} position records
- **Content Opportunities**: ${opportunitiesCount} opportunity seeds identified

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

### PHASE 4: ENTERPRISE & WORKFLOW INTELLIGENCE (REAL DATA):
- **AI Workflow States**: ${totalWorkflowStates} total workflows (${activeWorkflows} active, ${completedWorkflows} completed, ${stalledWorkflows} stalled)
- **Team Collaboration**: ${activeCollaborationSessions} active sessions across ${totalWorkspaces} workspaces
- **Workflow Executions**: ${totalWorkflowExecutions} executions (${workflowSuccessRate.toFixed(1)}% success rate)
- **Team Members**: ${totalTeamMembers} members across all workspaces
- **Workspace Utilization**: ${workspaceUtilization.toFixed(1)}% (collaboration sessions per workspace)

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
    const { messages, context } = await req.json();
    console.log("🚀 Processing enhanced AI chat request");

    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the LOVABLE_API_KEY from environment
    const apiKey = Deno.env.get("LOVABLE_API_KEY");

    if (!apiKey) {
      console.error("LOVABLE_API_KEY not found in environment, please enable the AI gateway");
      return new Response(JSON.stringify({ error: "AI service unavailable" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Analyze the user query for intent and SERP opportunities
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = lastUserMessage?.content || '';
    
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
          serpData = {
            keywords: serpIntelligence.keywords,
            results: serpResults,
            analysisType: serpIntelligence.queryType,
            suggestions: generateSmartSuggestions(serpResults)
          };
          console.log("✅ SERP data successfully integrated into AI context");
        }
      } catch (error) {
        console.error("❌ SERP analysis failed, continuing without SERP data:", error);
      }
    }

    // Build enhanced system prompt with context
    // Fetch real data from database
    const realDataContext = await fetchRealDataContext();
    
    const systemPrompt = `You are an enterprise-grade intelligent workflow orchestration assistant with comprehensive expertise across content strategy, business solutions, data analysis, team collaboration, and process optimization.

## PLATFORM INTELLIGENCE LEVEL: PHASE 4 COMPLETE - Enterprise & Workflow Intelligence

## 🚨 CRITICAL CHART GENERATION RULES - MANDATORY:
**ONLY generate charts when you have proper, actual data:**
1. ✅ Generate a chartConfig ONLY if you have real numeric data with proper structure
2. ✅ For time-series charts (line/area): You MUST have actual timestamps or dates
3. ✅ For comparison charts (bar): You MUST have real categories and numeric values
4. ✅ For distribution charts (pie): You MUST have actual parts-of-whole data
5. ❌ NEVER create fake data, simulated trends, or estimated values for charts
6. ❌ NEVER generate cumulative or projected data unless explicitly in the REAL DATA CONTEXT
7. ⚠️ If user requests a chart but data is missing: Explain what data is needed and how to obtain it

**Chart Validation Examples:**
- User: "show trend of proposal impressions" + No timestamp data → Explain: "I don't have generation dates for each proposal. To show a true trend, I would need timestamps for when each proposal was created."
- User: "chart performance over time" + Have GSC data with dates → ✅ Generate line chart with ACTUAL dates
- User: "show me a chart" + No specific data → Ask: "What specific data would you like to visualize? (e.g., proposals by status, GSC clicks, content types)"

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

## MANDATORY RESPONSE STRUCTURE:
Every response MUST follow this exact structure:

**1. Context Understanding** (1-2 sentences)
- Acknowledge what the user is asking for
- Confirm what data you have access to

**2. Data Analysis** (Use markdown tables for organizing information)
Example format:
| Metric | Value | Source |
| --- | --- | --- |
| Total Proposals | 89 | From your AI proposals |
| Available Opportunities | 67 | Status: Available |

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

## CONTENT FORMATTING RULES:
1. **NEVER include raw CSV data, spreadsheet formats, or comma-separated values in your text response**
2. **NEVER display JSON structures or technical data formats in your text content**
3. **ALWAYS use markdown tables for structured information**
4. **Keep your text response conversational and professional**
5. **Use visual data structures for complex data displays**

## SERP Data Integration
${serpContext ? `You have access to REAL-TIME SERP DATA that MUST be used in your response:${serpContext}` : 'No SERP data available for this query.'}

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

### For Table Display (Use Visual Data for Clean Tables):
\`\`\`json
{
  "visualData": {
    "type": "table",
    "tableData": {
      "title": "Data Overview", 
      "headers": ["Keyword", "Impressions", "Content Type", "Priority"],
      "rows": [
        ["AI Enhanced People Analytics Platform", "34,245", "Guide", "Critical"],
        ["Workforce Planning Analytics Software", "44,505", "Blog", "High"]
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

    // Call the Lovable AI Gateway
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          {
            role: "system",
            content: systemPrompt,
          },
          ...messages,
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI Gateway error:", errorText);
      return new Response(JSON.stringify({ 
        error: "Failed to get AI response",
        details: errorText,
        message: "AI service temporarily unavailable. Please try again in a moment."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const aiMessage = data.choices?.[0]?.message?.content;

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
      
      for (const block of jsonBlocks) {
        console.log('🔍 Processing JSON block:', JSON.stringify(block).substring(0, 200));
        
        // Check for visual data (direct or nested)
        if (block.visualData) {
          try {
            visualData = typeof block.visualData === 'string' ? JSON.parse(block.visualData) : block.visualData;
            console.log('📊 Found nested visual data:', visualData);
          } catch (e) {
            console.log('Failed to parse nested visual data:', e);
          }
        } else if (block.type && (block.metrics || block.charts || block.data)) {
          // Direct visual data object
          visualData = block;
          console.log('📊 Found direct visual data:', visualData);
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

    const responseData = {
      message: finalContent,
      content: finalContent, // Fallback for different response formats
      actions: actions || undefined,
      visualData: visualData || undefined,
      serpData: serpData || undefined, // Include SERP data from our analysis
      metadata: {
        processed_at: new Date().toISOString(),
        has_actions: !!actions,
        has_visual_data: !!visualData,
        has_serp_data: !!serpData,
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