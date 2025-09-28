import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { extractJSONBlocks, removeExtractedJSON } from './json-parser.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';
import { 
  analyzeSerpIntent, 
  executeSerpAnalysis, 
  generateSerpContext, 
  generateSmartSuggestions 
} from './serp-intelligence.ts';

// Enhanced real data fetching function with Phase 1 intelligence
async function fetchRealDataContext() {
  try {
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
    const avgSeoScore = contentWithPipeline?.reduce((sum, item) => sum + (item.seo_score || 0), 0) / (totalContent || 1);
    
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
    const totalImpressions = strategyProposals?.reduce((sum, p) => sum + (p.estimated_impressions || 0), 0) || 0;
    
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
## REAL CONTENT STRATEGY DATA (Phase 1 Enhanced - ${new Date().toISOString()}):

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
${availableProposals > 50 ? `🎯 MAJOR OPPORTUNITY: ${availableProposals} untapped content proposals worth ${totalImpressions.toLocaleString()} potential impressions` : ''}
${avgSeoScore === 0 ? '❌ SEO system not functional - all content has 0 SEO scores' : ''}
${publishedContent === 0 ? '❌ No published content - publishing workflow needs attention' : ''}
${contentInPipeline === 0 ? '⚠️ No content in pipeline - content workflow not being used' : ''}
${upcomingItems === 0 ? '📅 No scheduled content - editorial calendar needs planning' : ''}

### ACTIONABLE NEXT STEPS:
${availableProposals > 0 ? `✅ ${availableProposals} AI-generated proposals ready for immediate content creation` : ''}
${draftContent > 0 ? `✅ ${draftContent} draft articles ready for review and publishing` : ''}
${solutions && solutions.length > 0 ? `✅ ${solutions.length} solutions available for content mapping` : ''}
${recentContent > 0 ? `✅ Active content creation (${recentContent} items in last 30 days)` : ''}

CRITICAL: This is REAL data from the user's actual strategy proposals and content pipeline. Provide specific, actionable recommendations based on these exact numbers and opportunities.
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
    
    const systemPrompt = `You are an intelligent workflow orchestration assistant with deep expertise in content strategy, business solutions, and data analysis.

## REAL DATA CONTEXT - USE THIS FACTUAL INFORMATION:
${realDataContext}

## Your Capabilities:
- Advanced content analysis and optimization based on REAL data
- Solution integration and positioning using ACTUAL solution data
- Visual data creation (charts, metrics, workflows) using FACTUAL information only
- Strategic recommendations with actionable insights based on REAL performance metrics
- Contextual action generation using ACTUAL content and solution data

## CRITICAL RULES:
1. NEVER create fake data, metrics, or numbers
2. ALWAYS base responses on the REAL DATA CONTEXT provided above
3. When data is missing, clearly state that and suggest how to obtain it
4. For EVERY response, include contextual actions AND visual data when relevant

## SERP Data Integration
${serpContext ? `You have access to REAL-TIME SERP DATA that MUST be used in your response:${serpContext}` : 'No SERP data available for this query.'}

## Response Format Instructions:
You MUST include structured data in your responses using these exact formats:

### For Contextual Actions (ALWAYS include when recommending next steps):
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

    // Parse the response for structured data
    console.log('🔍 Parsing AI response for structured data...');
    const jsonBlocks = extractJSONBlocks(aiMessage);
    
    let visualData = null;
    let actions = null;
    
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
    
    // Clean the response text by removing extracted JSON
    const cleanedResponse = removeExtractedJSON(aiMessage);
    
    console.log('✅ Parsed response:', { 
      hasActions: !!actions, 
      hasVisualData: !!visualData,
      originalLength: aiMessage.length,
      cleanedLength: cleanedResponse.length,
      blocksFound: jsonBlocks.length
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