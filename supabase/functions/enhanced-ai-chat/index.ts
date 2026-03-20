// Deploy v12: 2026-03-20T12:00:00Z - Phase 1: Smart Model Routing, Expanded Context, Prompt Token Optimization
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { z } from "npm:zod@3.22.4";
import { extractJSONBlocks, removeExtractedJSON } from './json-parser.ts';
// query-analyzer is now inlined below to fix Deno edge runtime module resolution issues
import { createClient } from "npm:@supabase/supabase-js@2.39.6";
import { TOOL_DEFINITIONS, executeToolCall } from './tools.ts';
import { CAMPAIGN_STRATEGY_TOOL } from './campaign-strategy-tool.ts';
import { 
  analyzeSerpIntent, 
  executeSerpAnalysis,
  executeWebSearch,
  generateSerpContext, 
  generateSmartSuggestions,
  generateStructuredSerpData,
  generateWebSearchContext
} from './serp-intelligence.ts';
import { generateChartPerspectives } from './chart-intelligence.ts';
import { autoFixChartData } from './chart-auto-fix.ts';
import { aiRequestQueue } from './request-queue.ts';

const DEPLOY_VERSION = 'enhanced-ai-chat-v19-2026-03-20T12:00:00Z-phase1';

// ===== PHASE 1A: Smart Model Routing =====
// Routes cheap model for lookups/chat, premium model for generation/heavy tools
const GENERATION_INTENTS = ['generate_full_content', 'launch_content_wizard', 'start_content_builder', 'create_content_item', 'improve_content', 'reformat_content'];
const HEAVY_CATEGORIES = ['image_generation'];

function selectModelForIntent(
  baseModel: string,
  queryIntent: QueryIntent,
  hasWriteIntent: boolean
): string {
  // Map provider models to their cheap/premium variants
  const modelTiers: Record<string, { cheap: string; premium: string }> = {
    // OpenAI
    'gpt-4o': { cheap: 'gpt-4o-mini', premium: 'gpt-4o' },
    'gpt-4o-mini': { cheap: 'gpt-4o-mini', premium: 'gpt-4o' },
    'gpt-4': { cheap: 'gpt-4o-mini', premium: 'gpt-4' },
    'gpt-4-turbo': { cheap: 'gpt-4o-mini', premium: 'gpt-4-turbo' },
    // Anthropic
    'claude-3-5-sonnet-20241022': { cheap: 'claude-3-5-haiku-20241022', premium: 'claude-3-5-sonnet-20241022' },
    'claude-3-opus-20240229': { cheap: 'claude-3-5-haiku-20241022', premium: 'claude-3-opus-20240229' },
    // Gemini
    'gemini-2.0-flash-exp': { cheap: 'gemini-2.0-flash-exp', premium: 'gemini-2.0-flash-exp' },
    'gemini-1.5-pro': { cheap: 'gemini-2.0-flash-exp', premium: 'gemini-1.5-pro' },
    // OpenRouter models — pass through (user chose specific model)
  };

  const tier = modelTiers[baseModel];
  if (!tier) {
    // Unknown model (e.g. OpenRouter custom) — don't override user's choice
    return baseModel;
  }

  // Use premium model for: generation tools, content creation writes, heavy categories, detailed/full scope
  const needsPremium =
    hasWriteIntent && queryIntent.categories.includes('content') ||
    queryIntent.categories.some(c => HEAVY_CATEGORIES.includes(c)) ||
    queryIntent.scope === 'full';

  const selectedModel = needsPremium ? tier.premium : tier.cheap;
  if (selectedModel !== baseModel) {
    console.log(`🧠 Smart routing: ${baseModel} → ${selectedModel} (${needsPremium ? 'premium' : 'cheap'})`);
  }
  return selectedModel;
}

// ===== PHASE 1B: Expanded Context Window Constants =====
const MAX_HISTORY_MESSAGES = 15;  // was 5
const SUMMARIZE_THRESHOLD = 25;   // was 10
const RESUMMARIZE_INTERVAL = 15;  // was 10

// Data categories that REQUIRE tool execution (not conversational text)
const DATA_CATEGORIES = [
  'content', 'keywords', 'proposals', 'solutions', 'seo', 'campaigns',
  'competitors', 'analytics', 'performance', 'engage', 'approvals',
  'calendar', 'research', 'social', 'templates', 'topic_clusters',
  'content_gaps', 'recommendations', 'repurposed', 'email_threads',
  'activity_log', 'brand_voice', 'content_performance', 'image_generation'
];

function queryRequiresToolExecution(queryIntent: QueryIntent): boolean {
  if (queryIntent.isConversational) return false;
  if (queryIntent.categories.includes('action')) return true;
  return queryIntent.categories.some(c => DATA_CATEGORIES.includes(c));
}

// Token estimation (inlined from shared to avoid cross-folder import issues)
function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// =============================================================================
// QUERY ANALYZER (inlined from query-analyzer.ts to fix Deno module resolution)
// =============================================================================

interface QueryIntent {
  scope: 'summary' | 'detailed' | 'full' | 'conversational';
  categories: string[];
  estimatedTokens: number;
  requiresVisualData: boolean;
  confidence: number;
  isConversational: boolean;
  panelHint?: 'repository' | 'approvals' | 'content_repurpose' | null;
  disambiguationHint?: string | null;
}

const CONVERSATIONAL_PATTERNS = [
  /^(hi|hello|hey|greetings|good\s*(morning|afternoon|evening|day))[\s!.?]*$/i,
  /^(thanks|thank\s*you|thx|ty|ok|okay|got\s*it|understood|sure|great|perfect|awesome|cool)[\s!.?]*$/i,
  /^(test|testing|check)[\s!.?]*$/i,
  /^(yes|no|maybe|yep|nope|yeah|nah)[\s!.?]*$/i,
  /^(who are you|what are you|what can you do|help|capabilities)[\s!?.]*$/i,
  /^(bye|goodbye|see you|later|cya)[\s!.?]*$/i,
];

function isConversationalQuery(query: string): boolean {
  const trimmed = query.trim();
  if (CONVERSATIONAL_PATTERNS.some(p => p.test(trimmed))) {
    return true;
  }
  const words = trimmed.split(/\s+/).filter(w => w.length > 0);
  if (words.length <= 2 && !/\?$/.test(trimmed)) {
    const actionVerbs = /show|get|find|analyze|compare|create|generate|list|display|fetch|search/i;
    if (!actionVerbs.test(trimmed)) {
      return true;
    }
  }
  return false;
}

function analyzeQueryIntent(query: string): QueryIntent {
  const q = query.toLowerCase();
  
  if (isConversationalQuery(query)) {
    console.log('⚡ Conversational query detected - using fast-path');
    return {
      scope: 'conversational',
      categories: [],
      estimatedTokens: 500,
      requiresVisualData: false,
      confidence: 0.95,
      isConversational: true,
      panelHint: null
    };
  }
  
  const needsContent = /content|article|blog|post|writing|publish/i.test(q);
  const needsKeywords = /keyword|seo|search|rank|serp|search engine/i.test(q);
  const needsSolutions = /solution|product|service|compare|offering/i.test(q);
  const needsProposals = /proposal|strateg|recommend|suggest|idea|plan/i.test(q);
  const needsSEO = /seo|score|optimi|performance|google|ranking/i.test(q);
  const needsCampaigns = /campaign|generation|queue|progress|active campaign|generating/i.test(q);
  const needsCompetitors = /competitor|competition|rival|market leader|swot|versus|vs\b/i.test(q);
  const needsAnalytics = /analytics|metrics|views|clicks|conversion|traffic|engagement/i.test(q);
  const needsPerformance = /performing|performance|how.*(doing|going)|status|health/i.test(q);
  const needsEngage = /contact|subscriber|audience|segment|journey|automation|email campaign|newsletter|crm|engage|drip|funnel|unsubscrib/i.test(q);
  const needsApprovals = /approv|review|pending review|reject|needs changes|submission/i.test(q);
  const needsCalendar = /calendar|schedule|editorial|planned|upcoming/i.test(q);
  const needsResearch = /research|topic cluster|content gap|serp intelligence|pillar|topical authority/i.test(q);
  const needsSocial = /social|instagram|twitter|linkedin|facebook|tiktok|post|hashtag|mention|dm|comment/i.test(q);
  const needsWriteAction = /create|add|make|build|write|draft|generate|new/i.test(q);
  const needsUpdateAction = /update|edit|change|modify|rename/i.test(q);
  const needsDeleteAction = /delete|remove|archive|trash/i.test(q);
  const needsSendAction = /send|publish|schedule|activate|trigger|start|launch/i.test(q);
  const needsApprovalAction = /approve|reject|review|submit/i.test(q);
  const needsTagAction = /tag|label|categorize/i.test(q);
  const needsCrossModule = /enroll|add to|move to|promote|repurpose|turn into|convert to/i.test(q);
  const needsProposalAction = /accept proposal|reject proposal|dismiss proposal|approve proposal|schedule proposal|create proposal/i.test(q);
  const needsRecommendationAction = /accept recommendation|dismiss recommendation|follow.*advice|implement.*recommendation/i.test(q);
  const needsCampaignAction = /create.*campaign|new campaign|start.*campaign|launch.*campaign/i.test(q);
  const needsSocialAction = /update.*social|edit.*post|schedule.*post|change.*post|modify.*post|reschedule.*post|update.*post|edit.*social/i.test(q);
  const needsTemplateAction = /update.*template|edit.*template|modify.*template/i.test(q);
  const hasActionIntent = needsWriteAction || needsUpdateAction || needsDeleteAction || needsSendAction || needsApprovalAction || needsTagAction || needsCrossModule || needsProposalAction || needsRecommendationAction || needsCampaignAction || needsSocialAction || needsTemplateAction;
  
  const needsInternalTrends = /trend|trending/i.test(q) && 
    (/campaign|proposal|strategy|content|my|our/i.test(q) || needsCampaigns || needsProposals);
  
  if (needsInternalTrends) {
    console.log('📊 Internal trend analysis detected - prioritizing campaign/proposal data');
  }
  if (hasActionIntent) {
    console.log('🎯 Action intent detected - write/update/delete/send operation');
  }
  
  let scope: 'summary' | 'detailed' | 'full' | 'conversational' = 'summary';
  if (/all|everything|complete|full|comprehensive|detailed|entire/i.test(q)) {
    scope = 'full';
  } else if (/detail|specific|deep|analyze|compare|breakdown|in-depth/i.test(q)) {
    scope = 'detailed';
  }
  
  const categories: string[] = [];
  if (needsContent) categories.push('content');
  if (needsKeywords && !needsInternalTrends) categories.push('keywords');
  if (needsSolutions) categories.push('solutions');
  if (needsProposals) categories.push('proposals');
  if (needsSEO && !needsInternalTrends) categories.push('seo');
  if (needsCampaigns || needsInternalTrends) categories.push('campaigns');
  if (needsCompetitors) {
    categories.push('competitors');
    const idx = categories.indexOf('solutions');
    if (idx > -1 && !needsSolutions) categories.splice(idx, 1);
  }
  if (needsAnalytics) categories.push('analytics');
  if (needsPerformance || needsInternalTrends) categories.push('performance');
  if (needsEngage || needsSocial) categories.push('engage');
  if (needsApprovals) categories.push('approvals');
  if (needsCalendar) categories.push('calendar');
  if (needsResearch) categories.push('research');
  if (needsSocial) categories.push('social');
  if (hasActionIntent) categories.push('action');
  
  const needsTemplates = /template|email template|newsletter template|reusable email/i.test(q);
  const needsTopicClusters = /topic cluster|pillar|topical authority|cluster performance/i.test(q);
  const needsContentGaps = /content gap|missing topic|gap analysis|what.*(miss|lack|don't cover)/i.test(q);
  const needsRecommendations = /recommend|suggestion|what should i|next step|strategic advice|action item/i.test(q);
  const needsRepurposed = /repurpos|reformat|content variation|different format|converted content/i.test(q);
  const needsEmailThreads = /inbox|email thread|recent email|email message|did.*reply/i.test(q);
  const needsActivityLog = /activity|what happened|audit|event log|workspace history|recent event/i.test(q);
  const needsBrandVoice = /brand voice|brand guideline|tone of voice|writing style|brand personality|how should i write|do.*don't.*phrase/i.test(q);
  const needsContentPerformance = /page view|traffic|impression|click through|bounce rate|session duration|ctr|content performance|real analytics/i.test(q);
  const needsImageGeneration = /generate.*image|create.*image|make.*image|draw|make.*picture|create.*picture|generate.*picture|create.*illustration|generate.*visual|edit.*image|modify.*image|design.*image|ai.*image|image.*generat/i.test(q);
  
  if (needsTemplates) categories.push('templates');
  if (needsTopicClusters) categories.push('topic_clusters');
  if (needsContentGaps) categories.push('content_gaps');
  if (needsRecommendations) categories.push('recommendations');
  if (needsRepurposed) categories.push('repurposed');
  if (needsEmailThreads) categories.push('email_threads');
  if (needsActivityLog) categories.push('activity_log');
  if (needsBrandVoice) categories.push('brand_voice');
  if (needsContentPerformance) categories.push('content_performance');
  if (needsImageGeneration) categories.push('image_generation');
  
  if (categories.length === 0) {
    categories.push('content', 'solutions', 'proposals');
    scope = 'summary';
  }
  
  const tokenEstimates = {
    summary: 5000,
    detailed: 25000,
    full: 80000,
    conversational: 500
  };
  
  const visualTriggers = [
    /chart|graph|visual|show|display|visuali[sz]e/i,
    /performance|analytics|trend|compare|comparison/i,
    /how (is|are|did|does|many|much)/i,
    /what (is|are|were|did)/i,
    /tell me about|show me|give me/i,
    /\d+/
  ];
  const visualDataRequired: boolean = visualTriggers.some(pattern => pattern.test(q));
  
  const repositoryPatterns = /find\s+(my|the)\s+(blog|article|content|post)|show\s+(my|me)\s+(content|articles|blogs|posts)|what\s+did\s+i\s+write|open\s+(my\s+)?(content\s+)?library|read\s+my\s+(article|blog|post)|search\s+(my\s+)?content|browse\s+(my\s+)?content/i;
  const approvalsPatterns = /pending\s+(approval|review)|what('s|\s+is)\s+pending|approve\s+the|reject\s+the|items?\s+need\s+review|show\s+(my\s+)?approvals|needs?\s+(my\s+)?review/i;
  const repurposePatterns = /repurpos|reformat\s+(my|this|the)\s+(article|blog|content|post)|convert\s+(my|this).*(to|into|for)\s+(social|email|twitter|linkedin)/i;
  
  let panelHint: 'repository' | 'approvals' | 'content_repurpose' | null = null;
  if (repositoryPatterns.test(q)) {
    panelHint = 'repository';
  } else if (approvalsPatterns.test(q) || (needsApprovals && !hasActionIntent)) {
    panelHint = 'approvals';
  } else if (repurposePatterns.test(q)) {
    panelHint = 'content_repurpose';
  }

  let disambiguationHint: string | null = null;
  const emailAmbiguous = /^(show|list|get)\s+(my\s+)?emails?$/i.test(q.trim());
  if (emailAmbiguous) {
    disambiguationHint = 'EMAIL_AMBIGUOUS: User said "show my emails" which could mean email templates, email campaigns, or email threads/inbox. Ask the user which they mean before fetching data.';
  }
  const nextStepAmbiguous = /what\s+should\s+i\s+(do|work on|focus on)\s*(next)?/i.test(q);
  if (nextStepAmbiguous) {
    disambiguationHint = 'NEXT_STEP: User wants strategic guidance. Use get_strategy_recommendations (NOT get_proposals). Recommendations are curated next-best-actions; proposals are content ideas.';
  }

  return {
    scope,
    categories,
    estimatedTokens: tokenEstimates[scope],
    requiresVisualData: visualDataRequired,
    confidence: categories.length > 0 ? 0.8 : 0.5,
    isConversational: false,
    panelHint,
    disambiguationHint
  };
}

// =============================================================================
// PROMPT MODULES (inlined from shared/prompt-modules.ts to avoid cross-folder imports)
// =============================================================================

// Base prompt (always included) - ~1,000 tokens
const BASE_PROMPT = `You are an enterprise AI assistant for content strategy with comprehensive expertise in data analysis, workflow automation, and business intelligence.

{THINKING_INSTRUCTION}
🚨 CRITICAL TEXT FORMATTING RULES:
• **NEVER** use pipe characters (|) in conversational text or regular responses
• **ONLY** use pipes for properly formatted markdown tables with headers AND data rows (minimum 2 rows)
• NEVER create separator patterns like | --- | or |---| - use dashes (---) instead
• For visual separators in text: Use --- (three dashes) on a new line, NOT pipes
• For inline data: Use bold formatting: "Your keyword **Workforce Planning** has **44,505** impressions"
• For small lists (2-4 items): Use bullet points (•)
• For tables (5+ rows): Use JSON visualData format or properly formatted markdown tables only

🚨 ABSOLUTE DATA ACCURACY RULES:
1. ❌ NEVER create fake data, estimates, or simulated values
2. ❌ NEVER infer data that isn't in REAL DATA CONTEXT
3. ✅ ONLY use exact numbers from REAL DATA CONTEXT
4. ✅ Always cite sources: "From your AI proposals..." or "Based on your content data..."
5. ✅ If data is missing, acknowledge it: "I don't have [data type]. To provide this, you need [action]."

📊 DATA TRANSPARENCY PROTOCOL:
Before ANY response, check dataAvailability in REAL DATA CONTEXT:
• If data EXISTS → Use it confidently in analysis
• If data MISSING → Acknowledge upfront: "I notice [data type] isn't available yet."
• Never generate charts requiring unavailable data
• Provide actionable steps to fix missing data

🎯 SMART VISUALIZATION GUIDANCE (CHART-ELIGIBLE MODULES ONLY):
Chart-eligible modules: Keywords, Analytics, Campaigns, Content performance, Proposals, SEO scores.

**WHEN to include visualData charts:**
- 3+ data points that benefit from comparison (e.g., keyword rankings, proposal statuses, content metrics over time)
- Trend data, distributions, or category breakdowns

**WHEN NOT to include visualData charts:**
- Simple counts or single values (e.g., "You have 7 proposals" → use bold text, no chart)
- Yes/no answers or single lookups
- Conversational responses, greetings, or explanations
- When fewer than 3 data points exist

For chart-eligible data WITH 3+ comparable points: Include visualData with charts, metric cards, actionable items, insights, deepDivePrompts.
For simple data queries: Use bold inline formatting ("You have **7 proposals**: **4 available**, **2 scheduled**, **1 completed**") + action suggestions.

TEXT-ONLY MODULES (NO charts, NO visualData):
Offerings, Contacts, Email, Social, Journeys, Automations — respond with formatted text + markdown link to the full page.
Format: Include a line like "👉 [Open Offerings →](/offerings)" in your text response so users can navigate.

📊 VISUALIZATION PRIORITY:

**🎯 VISUAL-FIRST PHILOSOPHY:**
Default to CHARTS for ALL analytical queries to create engaging, visual experiences.

**When to use CHARTS (DEFAULT for most queries):**
• Any query with data → Generate appropriate chart type
• Trends over time → Line/Area chart
• Comparing values → Bar chart
• Proportions → Pie chart
• Performance metrics → Multi-chart dashboard
• "Show me", "Tell me", "How is" → Chart + metrics + insights

**When to use TABLES (ONLY for explicit requests):**
• User explicitly says "table", "spreadsheet", "list all items"
• User says "export data" or "raw data"
• Query specifically asks for tabular format

**Default behavior**: ALWAYS use charts for data visualization unless explicitly told otherwise`;

// Chart generation module - ~800 tokens
const CHART_MODULE = `
📊 VISUAL-FIRST RESPONSE ARCHITECTURE:

**🎯 EVERY data response must include:**
1. **visualData** - Chart showing the data
2. **summaryInsights.metricCards** - 2-4 key statistics
3. **actionableItems** - 2-5 contextual actions user can take
4. **insights** - 2-3 AI-generated observations
5. **deepDivePrompts** - 2-3 smart follow-up questions

📊 VISUALIZATION GENERATION RULES:

**🎯 VISUAL-FIRST: Chart vs Table Decision**

Generate TABLE ONLY if query explicitly says:
• "table", "spreadsheet", "tabular format"
• "export data", "raw data", "data dump"

For ALL other queries → Generate CHART (default):
• "top 5 proposals" → Bar chart showing rankings
• "compare items" → Comparison chart with metrics
• "show me my content" → Chart showing content metrics
• "tell me about X" → Dashboard with chart + metrics + insights
• ANY analytical query → Visual representation first

**CHART FORMAT (use for all other queries):**
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "title": "Clear descriptive title",
    "chartConfig": {
      "type": "bar",
      "data": [
        {
          "name": "Solution A",
          "value": 23,
          "dataSource": "realDataContext.analytics.contentBySolution['Solution A'].length"
        }
      ]
    }
  }
}
\`\`\`

**Chart Type Selection:**
• Bar Chart: Comparing values across categories (2+ items)
• Line Chart: Trends over time (requires time series data)
• Pie Chart: Proportions/distribution (shows percentages)
• Area Chart: Trends with volume emphasis (stacked data over time)
• Radar Chart: Multi-dimensional comparison (e.g., content quality across 5+ metrics like SEO, readability, engagement)
• Funnel Chart: Conversion/workflow stages (e.g., content pipeline: Draft → Review → Published)
• Scatter Chart: Relationship analysis with two numeric axes (e.g., keyword difficulty vs search volume)
• Radial Bar Chart: Progress/completion indicators (e.g., campaign progress circles)
• Composed Chart: Mixed bar + line overlay for comparing different metric types

**Radar Chart Example:**
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "chartConfig": {
      "type": "radar",
      "data": [
        { "name": "Content A", "seo": 85, "readability": 92, "engagement": 78, "structure": 88 }
      ],
      "categories": ["name"],
      "series": [
        { "dataKey": "seo", "name": "SEO Score" },
        { "dataKey": "readability", "name": "Readability" },
        { "dataKey": "engagement", "name": "Engagement" }
      ]
    }
  }
}
\`\`\`

**Funnel Chart Example:**
\`\`\`json
{
  "visualData": {
    "type": "chart",
    "chartConfig": {
      "type": "funnel",
      "data": [
        { "name": "Draft", "value": 100 },
        { "name": "Review", "value": 75 },
        { "name": "Published", "value": 50 }
      ],
      "categories": ["name"],
      "series": [{ "dataKey": "value", "name": "Count" }]
    }
  }
}
\`\`\`

**Data Accuracy Requirements (applies to BOTH tables and charts):**
1. Every value MUST come from REAL DATA CONTEXT
2. Use exact values - never estimate or round
3. Cross-reference: Verify each name/label exists in context
4. Include "dataSource" or caption explaining data source`;

// PHASE 2: Multi-chart intelligence module - ~1200 tokens
const MULTI_CHART_MODULE = `
📊📊📊 MULTI-CHART ANALYSIS MODE (ACTIVATED FOR: performance, analyze, overview, compare queries)

**When This Mode Activates:**
• User asks about "performance", "analyze", "overview", or "show me all"
• User wants comparisons or comprehensive analysis
• User asks about time periods ("last month", "this quarter")
• Query indicates need for multiple perspectives

**Multi-Chart Response Format:**
\`\`\`json
{
  "visualData": {
    "type": "multi_chart_analysis",
    "title": "AI-Generated Analysis Title (based on user query)",
    "subtitle": "What this analysis reveals (1 sentence)",
    
    "summaryInsights": {
      "metricCards": [
        {
          "id": "1",
          "title": "Total Content",
          "value": "24",
          "change": { "value": 15, "type": "increase", "period": "vs last month" },
          "icon": "FileText",
          "color": "green"
        }
      ],
      "bulletPoints": [
        "Key finding with specific numbers from data",
        "Trend or pattern identified",
        "Opportunity or issue highlighted"
      ],
      "paragraphSummary": "Narrative connecting all insights with strategic context",
      "alerts": [
        { "type": "warning", "message": "Items needing immediate attention" }
      ]
    },
    
    "charts": [
      {
        "type": "line",
        "title": "Performance Trend Over Time",
        "subtitle": "Last 30 days performance progression",
        "data": [...real data from context...],
        "categories": ["Week 1", "Week 2", "Week 3", "Week 4"],
        "series": [{ "dataKey": "value", "name": "Performance Score" }],
        "chartInsights": [
          "25% upward trend detected",
          "Peak performance in week 3"
        ]
      }
    ],
    
    "actionableItems": [
      {
        "id": "1",
        "title": "Publish Draft Content",
        "description": "19 draft articles ready for review and publishing",
        "priority": "high",
        "actionType": "navigate",
        "targetUrl": "/repository",
        "icon": "FileText",
        "estimatedImpact": "+40% visibility",
        "timeRequired": "2 hours"
      }
    ],
    
    "deepDivePrompts": [
      "Which solution has the best content performance?",
      "Show me SEO scores for published content",
      "What topics are underperforming?"
    ]
  }
}
\`\`\`

**Multi-Chart Generation Rules:**
1. **Generate 2-4 charts** showing different perspectives
2. **Each chart MUST have:** Unique perspective, clear title, 2-5 specific insights
3. **Summary Insights:** 2-4 metric cards, 3-5 bullet points, 1 paragraph, 0-2 alerts
4. **Actionable Items (3-5 actions):** With targetUrl, estimatedImpact, timeRequired
5. **Deep Dive Prompts (3-5 questions):** Context-aware follow-ups`;

// Table formatting module - ~300 tokens
const TABLE_MODULE = `
📋 TABLE DISPLAY RULES:

**When to Use Tables (ONLY IF):**
• User explicitly asks: "show me a table", "tabular format", "spreadsheet", "list all data"
• User wants to export raw data: "give me the data", "export this"
• Data has 5+ columns AND user requests detailed breakdown

**DEFAULT BEHAVIOR: Use charts instead of tables for visualization**

**Table Format:**
\`\`\`json
{
  "visualData": {
    "type": "table",
    "tableData": {
      "title": "Descriptive Table Title",
      "headers": ["Column1", "Column2", "Column3"],
      "rows": [
        ["Value1", "Value2", "Value3"],
        ["Value4", "Value5", "Value6"]
      ]
    }
  }
}
\`\`\`

**NEVER:**
• Use markdown pipe tables (| --- |)
• Paste raw CSV in conversational text
• Display data without proper formatting`;

// SERP visualization module - ~500 tokens
const SERP_MODULE = `
🔍 SERP DATA VISUALIZATION (MANDATORY WHEN SERP DATA PRESENT):

When REAL-TIME SERP DATA is in context, generate these visualizations:

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
        }
      ]
    }
  }
}
\`\`\`

**SERP Rules:**
• Generate ALL applicable charts (don't pick just one)
• Use EXACT data from SERP DATA section
• Include dataSource attribution
• Add actionable insights`;

// Action generation module - ~300 tokens
const ACTION_MODULE = `
🎯 ACTION GENERATION RULES:

**Always include actions when relevant:**
• Navigation: "action": "navigate:/path"
• Workflows: "action": "workflow:workflow-name"
• Downloads: "action": "download:csv" with data payload
• Settings: "action": "open-settings"

**Smart Actions:**
Generate context-aware actions based on user needs and available data`;

// Minimal emergency prompt - ~200 tokens
const MINIMAL_PROMPT = `You are an AI assistant for content strategy.

CRITICAL RULES:
• Never use pipe characters (|) in text
• Never fake data - only use REAL DATA CONTEXT
• Use JSON visualData for tables/charts
• Acknowledge missing data upfront

Format tables as:
\`\`\`json
{"visualData": {"type": "table", "tableData": {"headers": [...], "rows": [...]}}}
\`\`\`

Format charts as:
\`\`\`json
{"visualData": {"type": "chart", "chartConfig": {"type": "bar", "data": [...]}}}
\`\`\``;

// Response structure template - ~200 tokens
const RESPONSE_STRUCTURE = `
MANDATORY RESPONSE STRUCTURE:

1. **Context Understanding** (1-2 sentences)
   - Acknowledge what user is asking
   - Confirm data availability

2. **Data Analysis & Visualization**
   - DEFAULT: Use visualData JSON with chartConfig for numerical data
   - Use tableData ONLY when user explicitly requests "table" or "tabular format"
   - Place visuals where they make sense contextually

3. **Key Observations** (3-5 bullets with real data)
   * Observation with actual numbers
   * Pattern identification
   * Comparative insights

4. **Actionable Next Steps** (3-5 specific actions)
   * Priority recommendations
   * Data gathering steps (if needed)

5. **Data Limitations** (If applicable)
   - State missing data clearly
   - Explain what's needed for complete insights

6. **EMPTY DATA RULE** (CRITICAL):
   - If a tool returns 0 items or empty results, do NOT generate a chart or table with fake/placeholder data.
   - Instead, tell the user what data is missing and suggest the specific action to create it.
   - Example: If get_content_items returns 0 → "You don't have any content yet. Would you like me to help you create your first article?"
   - NEVER fabricate numbers or show empty charts.`;

// Tool usage module with dynamic counts - ~600 tokens
const TOOL_USAGE_MODULE = `
🔧 TOOL-BASED ARCHITECTURE (CRITICAL — MANDATORY COMPLIANCE):

You have access to specialized tools to fetch AND act on data. You MUST use them.

**⛔ ABSOLUTE RULES — VIOLATIONS ARE UNACCEPTABLE:**
1. When the user asks about their data (content, keywords, proposals, campaigns, contacts, performance, etc.), you MUST call the appropriate tool function. NO EXCEPTIONS.
2. DO NOT describe what you would do — actually call the tool.
3. DO NOT say "I'll fetch your data" or "Let me retrieve..." — USE the tool function call immediately.
4. DO NOT provide placeholder/generic responses when tools are available.
5. If you respond with text instead of calling a tool for a data query, that is a FAILURE.

**Examples of CORRECT behavior:**
- User: "Show my content" → CALL get_content_items (do NOT say "I can help you view your content")
- User: "How are my keywords doing?" → CALL get_keywords (do NOT describe keyword analysis)
- User: "Check performance" → CALL get_content_items or get_content_performance (do NOT write a generic response)
- User: "List proposals" → CALL get_proposals (do NOT say "Let me fetch your proposals")

**Available Data Summary:**
• Content Items: {contentCount} pieces ({draftCount} drafts, {publishedCount} published)
• AI Proposals: {proposalCount} strategies  
• Keywords: {keywordCount} tracked
• Solutions: {solutionCount} offerings
• Active Campaigns: {activeCampaignCount} running
• Queue Status: {pendingQueueCount} pending, {completedQueueCount} completed, {failedQueueCount} failed

**📖 READ Tools (29 total — Fetch Data):**
- get_content_items, get_keywords, get_proposals, get_solutions, get_seo_scores, get_serp_analysis
- get_competitors, get_competitor_solutions, get_company_info
- get_campaign_intelligence, get_queue_status, get_campaign_content
- get_calendar_items, get_pending_approvals, get_social_posts, get_email_templates
- get_topic_clusters, get_content_gaps, get_strategy_recommendations, get_repurposed_content
- get_email_threads, get_activity_log
- get_engage_contacts, get_engage_segments, get_engage_journeys, get_engage_automations, get_engage_email_campaigns
- get_brand_voice, get_content_performance

**✏️ WRITE Tools (Take Actions):**
Content: create_content_item, update_content_item, delete_content_item, generate_full_content, start_content_builder, launch_content_wizard
Approvals: submit_for_review, approve_content, reject_content
Keywords: add_keywords, remove_keywords, trigger_serp_analysis, trigger_content_gap_analysis, create_topic_cluster
Offerings: create_solution, update_solution, delete_solution, update_company_info, add_competitor, update_competitor, trigger_competitor_analysis
Engage: create_contact, update_contact, tag_contacts, create_segment, create_email_campaign, send_email_campaign, create_journey, activate_journey, create_automation, toggle_automation, enroll_contacts_in_journey, send_quick_email, delete_contact, delete_segment, delete_email_campaign, delete_journey, delete_automation, delete_social_post
Cross-Module: promote_content_to_campaign, content_to_email, campaign_content_to_engage, repurpose_for_social, publish_to_website, schedule_social_from_repurpose, create_campaign
Social: create_social_post, update_social_post, schedule_social_post
Email Templates: create_email_template, update_email_template
Proposals: accept_proposal, reject_proposal, create_proposal
Strategy: accept_recommendation, dismiss_recommendation
Brand: update_brand_voice

**Campaign Tools:** trigger_content_generation, retry_failed_content

**When to Use Write Tools:**
- User explicitly asks to create, add, update, edit, delete, remove, send, publish, schedule, approve, reject, accept, dismiss
- User says "write an article about X", "create content about X", "generate a blog post about X" → ALWAYS use launch_content_wizard (NOT generate_full_content) unless user explicitly says "quick generate" or "generate directly"
- User says "generate an article about X" → launch_content_wizard (prefer wizard for better quality)
- User says "add contact john@example.com" → create_contact
- User says "email this content to VIP contacts" → content_to_email
- User says "create a segment of active users" → create_segment
- User says "repurpose for social" → repurpose_for_social
- User says "repurpose this content" or "repurpose my article" → respond with visualData: {"type": "content_repurpose", "contentId": null} to open the Repurpose panel
- User says "accept this proposal" → accept_proposal
- User says "reject proposal" → reject_proposal
- User says "create a campaign about X" → create_campaign
- User says "schedule this social post" → schedule_social_post
- User says "edit my post" or "modify my social post" → update_social_post
- User says "accept the recommendation" → accept_recommendation
- User says "update the email template" → update_email_template
- User says "what's my brand voice" or "show brand guidelines" → get_brand_voice
- User says "change my tone to professional" → update_brand_voice with tone parameter
- User says "how is my content performing" or "show traffic" → get_content_performance (checks API keys first)

**🚫 CROSS-MODULE CHAIN CONFIRMATION (CRITICAL):**
When user requests involve 2+ write tools chained together (e.g., "turn my blog into a campaign and email it"):
1. Execute the FIRST tool only
2. Report the result to the user
3. Ask: "Should I proceed with the next step ([describe next action])?"
4. Only execute the next tool after user confirms
NEVER silently chain multiple write operations.

**📧 EMAIL DISAMBIGUATION RULE:**
When user says "show my emails" without context, ASK which they mean:
- "Email campaigns" (sent/scheduled marketing emails)
- "Email templates" (reusable templates)
- "Email inbox" (recent email threads)
Do NOT guess — ask the user to clarify.

**🎯 RECOMMENDATIONS vs PROPOSALS RULE:**
- "What should I do next?" → Use get_strategy_recommendations (curated next-best-actions)
- "Show my proposals" → Use get_proposals (content strategy ideas)
These are DIFFERENT datasets. Don't mix them.

**Important:** Always check counts above first. If a count is 0, inform the user no data exists rather than calling the tool. For write operations, confirm the action with the user in your response.

**🔍 PROACTIVE TOOL DISCOVERY (SB-11):**
When responding to ANY user question, proactively suggest relevant tools the user may not know about:
- If discussing content → mention the Content Wizard, content builder, and repurpose tools
- If discussing keywords → mention SERP analysis, topic clusters, and content gap analysis
- If discussing competitors → mention competitor analysis and competitor solutions discovery
- If discussing campaigns → mention campaign intelligence and content generation queue
- If discussing email/social → mention the cross-module tools (content_to_email, repurpose_for_social)
- If user seems stuck or asks "what can you do?" → give a structured overview of your 5 key capabilities: Content Creation, Research & Keywords, Campaigns, Engage (Email/Social), and Analytics
Format suggestions as actionable next steps, e.g.: "💡 You can also say 'analyze SERP for [keyword]' to get live search data."

{proactiveInsights}
`;

// Lightweight platform basics (~200 tokens) - used by default
const PLATFORM_BASICS = `
You are the AI brain of **Creaiter** — an AI-powered content marketing platform.
Key routes: /repository (content), /campaigns, /keywords, /analytics, /ai-proposals, /calendar, /offerings, /content-approval.
Engage: /engage/email, /engage/contacts, /engage/segments, /engage/journeys, /engage/automations, /engage/social, /engage/activity.
Sidebar panels: Content Wizard, Research Intelligence, Analyst, Repository, Approvals.
Tools: 29 read tools + write tools for content, engage, campaigns, keywords, offerings, and cross-module actions.`;

// Platform Knowledge module - comprehensive understanding of the entire platform (full version)
const PLATFORM_KNOWLEDGE_MODULE = `
🏗️ PLATFORM ARCHITECTURE & COMPLETE MODULE KNOWLEDGE:

You are the AI brain of **Creaiter** — an end-to-end AI-powered content marketing platform. You MUST know every module, its route, purpose, and how they interconnect.

## 🗂️ SIDEBAR NAVIGATION STRUCTURE

### CHATS
- **AI Chat** (/ai-chat) — Control Centre & command hub. This is you.

### LIBRARY
- **Repository** (/repository) — All content organized by format tabs (Blog, Social, Email, Ad, etc.). Includes repurposed content variants.
- **Offerings** (/offerings) — Product/service profiles. Each stores: target_audience, pain_points[], use_cases[], features[], benefits[], unique_value_propositions[], pricing{}, technical_specs{}, case_studies[]. Auto-fills content briefs via mapOfferingToBrief().
- **Content Approval** (/content-approval) — Review workflows with status tracking (pending_review, approved, rejected, needs_changes). Assignment system, reviewer comments, approval history.

### TOOLS
- **Campaigns** (/campaigns) — Strategy-to-execution pipeline. Idea → AI strategies with briefs → Select → Generate via content_generation_queue → Track real-time → Active. Offerings pre-populate strategy context.
- **Keywords** (/keywords) — Keyword library with SERP data, position tracking, search volume, difficulty, People Also Ask, content gap analysis. Feeds Strategy and Wizard research.
- **Analytics** (/analytics) — Performance dashboards with ranking tracking, traffic analytics, conversion metrics, ROI reports. Date-range filtering.

### RESEARCH
- **AI Proposals** (/ai-proposals) — SERP-driven keyword strategies and proposals. Proposals link to offerings/competitors. Pipeline management.
- **Keywords** (/keywords) — Keyword library with SERP data, position tracking, search volume, difficulty, People Also Ask, content gap analysis.
- **Editorial Calendar** (/calendar) — Schedule content, drag-and-drop calendar, status tracking. Calendar scheduling auto-updates proposal status (available→scheduled→completed).

### ENGAGE
- **Email** (/engage/email) — Full email marketing suite: Inbox (3-panel layout), Campaigns (A/B testing, timezone scheduling), Drafts, Scheduled, Templates (drag-drop builder + HTML editor), Reporting (7d/30d/90d analytics).
- **Contacts** (/engage/contacts) — CRM with tags, custom fields, bulk actions, import/export. Contact lifecycle tracking.
- **Segments** (/engage/segments) — Dynamic audience segmentation with rule-based filters (field operators: equals, contains, starts_with, etc.). Auto-evaluates membership.
- **Journeys** (/engage/journeys) — Multi-step visual workflow builder for automated customer paths.
- **Automations** (/engage/automations) — Trigger-based rules (event → condition → action). Execution tracking, version history.
- **Social** (/engage/social) — Multi-platform publishing with calendar scheduling, hashtag intelligence, optimal timing. Social inbox for mentions/comments/DMs with AI-suggested replies. Platform-specific analytics.
- **Activity** (/engage/activity) — Unified event log across all Engage modules.

### OTHER
- **AI Settings** (modal via /ai-settings) — AI provider configuration (OpenAI, etc.), preferred models, API keys.
- **Brand Guidelines** (within settings) — Colors, fonts, tone, personality, do/don't phrases. Injected into content generation.
- **Competitors** (within settings/strategy) — Profiles, solution discovery (auto-scrapes websites), SWOT analysis.

## 🧩 AI CHAT SIDEBAR PANELS (opened from + menu)
- **Content Wizard** — Guided creation. Blog: 5-step (Topic→Research→Outline→Config→Generate). Quick formats (social, email, ad): 2-step. Offerings auto-fill brief fields.
- **Research Intelligence** — Topic clusters, content gaps, strategy planning within chat context.
- **Analyst** — Data visualization companion for charts and performance analysis.
- **Repository** — Quick-access content browser. Search & read content inline.
- **Approvals** — Quick approve/comment workflow for pending content.

## 🚦 SIDEBAR & NAVIGATION RULES (CRITICAL — follow strictly):

**RIGHT SIDEBAR PANELS (only these open as sidebar):**
- **Repository** (visualData type: "repository") — When user asks to find/search/browse/read content. 
- **Approvals** (visualData type: "approvals") — When user asks about pending approvals or wants to approve/reject content.
- **Content Wizard** (visualData type: "content_wizard") — When user wants to create/write new content.
- **Research Intelligence** (visualData type: "research_intelligence") — When user wants to plan strategy or research topics.
- **Analyst** (visualData type: "analyst") — When user asks for data analysis/charts. Opens automatically.

**REPOSITORY PANEL TRIGGER — JSON FORMAT:**
When user asks to find, search, browse, or read content, return this EXACT format:
\`\`\`json
{"visualData": {"type": "repository", "title": "Content Search Results"}}
\`\`\`
Trigger phrases: "find my blog about", "show my content", "what did I write about", "open my library", "read my article on", "search my content"

**APPROVALS PANEL TRIGGER — JSON FORMAT:**
When user asks about approvals, pending reviews, or wants to approve/reject content, return this EXACT format:
\`\`\`json
{"visualData": {"type": "approvals", "title": "Pending Approvals"}}
\`\`\`
Trigger phrases: "what's pending approval", "approve the blog", "items need review", "reject the article", "pending review", "show approvals"

**TEXT-ONLY MODULES (NEVER open sidebar panels for these):**
- **Offerings** — Answer in text. Mention "Go to Offerings page (/offerings) for details."
- **Contacts** — Answer in text (count, tags, details). Link to /engage/contacts.
- **Campaigns** — Answer in text + charts. Link to /campaigns.
- **Email** — Draft emails via tools. Link to /engage/email for template builder.
- **Social** — Create/schedule posts via tools. Link to /engage/social for calendar.
- **Keywords** — Show keyword data in charts/text. Link to /keywords.
- **Analytics** — Show performance in charts. Link to /analytics.
- **Journeys** — List journeys, show status in text. Link to /engage/journeys.
- **Automations** — List automations in text. Link to /engage/automations.

**RULE: For text-only modules, always include an actionableItem with "Open [Module]" linking to the full page route.**

## 🔗 KEY DATA PIPELINES
- **Offering → Content**: Offering → mapOfferingToBrief() → Brief → AI generation → Repository (/repository)
- **Offering → Campaign**: Offering → auto-fill strategy → AI briefs → queue → Repository → Campaign active (/campaigns)
- **Strategy → Calendar → Content**: SERP → Proposals (/ai-proposals) → Calendar (/calendar) → Builder/Wizard → Repository (auto-completes proposal)
- **Content → Approval**: Repository → Submit for review → Content Approval (/content-approval) → Approved/Rejected → Back to Repository
- **Content → Email/Social**: Repository → Repurpose → Email campaign (/engage/email) or Social post (/engage/social)
- **Contacts → Segments → Journeys**: Import contacts (/engage/contacts) → Build segments (/engage/segments) → Enroll in journeys (/engage/journeys) or automations (/engage/automations)

## 🛠️ YOUR CAPABILITIES (AI Chat Tools)
**Read (29 tools):** content_items, keywords, proposals, solutions, seo_scores, serp_analysis, competitors, competitor_solutions, campaign_intelligence, queue_status, campaign_content, contacts, segments, journeys, automations, email_campaigns, **calendar_items**, **pending_approvals**, **social_posts**, **email_templates**, **topic_clusters**, **content_gaps**, **strategy_recommendations**, **repurposed_content**, **email_threads**, **activity_log**, **get_brand_voice**, **get_content_performance**, company_info.
**Write — Content:** Create/update/delete content, generate full articles, start builder/wizard. **Calendar CRUD** (create/update/delete calendar items).
**Write — Engage:** Create/update contacts, segments, journeys, automations. Draft & send emails. Create social posts. **Create email templates.**
**Write — Campaigns:** Trigger content generation, retry failed content.
**Write — Keywords:** Add/remove keywords, trigger SERP analysis, create topic clusters, trigger content gap analysis.
**Write — Offerings:** Create/update/delete solutions, update company info, add/update competitors, trigger competitor analysis.
**Cross-module:** Promote content→campaign, content→email, repurpose→social, enroll contact→journey, content→approval, schedule→calendar.

## 🧠 SMART BEHAVIORS
- When user asks about a module, reference its exact route so they can navigate there.
- When user asks "where is X", provide the sidebar section + route.
- When data is needed from a module, use the appropriate read tool before responding.
- For write operations, confirm the action with the user before executing.
- If a count is 0, inform the user no data exists rather than calling the tool.
- For calendar queries, auto-detect "this week" / "next week" and compute date ranges.
- For approval queries, default to pending_review unless user specifies otherwise.
`;

// =============================================================================
// END PROMPT MODULES
// =============================================================================

// ⚡ ISSUE #5 FIX: Fast-path conversational responses (no AI call needed)
function generateConversationalResponse(query: string): string {
  const q = query.toLowerCase().trim();
  const hour = new Date().getHours();
  const timeGreeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  
  // Greetings
  if (/^(hi|hello|hey|greetings)[\s!.?]*$/i.test(q)) {
    return `${timeGreeting}! 👋 I'm your AI content strategy assistant. I can help you with:

• **Content Analysis** - Review and optimize your articles
• **Keyword Research** - Discover high-performing keywords
• **Campaign Management** - Track and manage your campaigns
• **Performance Insights** - Visualize your data with charts

What would you like to explore today?`;
  }
  
  if (/^good\s*(morning|afternoon|evening|day)[\s!.?]*$/i.test(q)) {
    return `${timeGreeting} to you too! 👋 How can I help you with your content strategy today?`;
  }
  
  // Acknowledgments
  if (/^(thanks|thank\s*you|thx|ty)[\s!.?]*$/i.test(q)) {
    return `You're welcome! 😊 Let me know if you need anything else.`;
  }
  
  if (/^(ok|okay|got\s*it|understood|sure|great|perfect|awesome|cool)[\s!.?]*$/i.test(q)) {
    return `Great! Feel free to ask if you have any questions or need help with anything.`;
  }
  
  // Test messages
  if (/^test(ing)?[\s!.?]*$/i.test(q)) {
    return `✅ Test successful! I'm working properly. You can ask me about your content, keywords, campaigns, or request data visualizations.`;
  }
  
  // Help/capabilities
  if (/^(who are you|what are you|what can you do|help|capabilities)[\s!?.]*$/i.test(q)) {
    return `I'm your AI-powered content strategy assistant! Here's what I can help you with:

## 📊 Data & Analytics
- Analyze your content performance
- Track keyword rankings and opportunities
- Monitor campaign progress and queue status

## 📝 Content Actions
- **Create** content, articles, and blog posts
- **Generate** full articles from keywords (end-to-end)
- **Submit, approve, or reject** content for review
- **Repurpose** content for social media

## 🔑 Keywords & Research
- **Add/remove** keywords from your library
- **Trigger** SERP analysis and content gap analysis
- **Build** topic clusters from pillar topics

## 🏢 Business Intelligence
- **Create/update** solutions, company info, and competitors
- **Trigger** competitor analysis

## 📬 Engage CRM & Email
- **Create** contacts, segments, journeys, and automations
- **Send** email campaigns and quick emails
- **Enroll** contacts in journeys
- **Toggle** automations on/off

## 🔗 Cross-Module
- **Promote** content to campaigns
- **Email** content to segments
- **Repurpose** articles for social platforms

Try asking "Generate an article about AI trends", "Create a segment of VIP contacts", or "Email my best content to subscribers"!`;
  }
  
  // Farewells
  if (/^(bye|goodbye|see you|later|cya)[\s!.?]*$/i.test(q)) {
    return `Goodbye! 👋 Come back anytime you need help with your content strategy.`;
  }
  
  // Yes/No
  if (/^(yes|yeah|yep)[\s!.?]*$/i.test(q)) {
    return `Great! What would you like me to help you with?`;
  }
  
  if (/^(no|nope|nah)[\s!.?]*$/i.test(q)) {
    return `No problem! Let me know if you need anything else.`;
  }
  
  // Default fallback for other short queries
  return `I'm here to help! You can ask me about your content, keywords, campaigns, or competitors. What would you like to know?`;
}

// Input validation schemas
const MessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string().max(100000, 'Message content too long')
});

const ContextSchema = z.object({
  use_case: z.string().max(100).optional(),
  conversation_id: z.string().uuid().optional(),
  include_charts: z.boolean().optional(),
  include_multi_charts: z.boolean().optional()
}).passthrough().optional();

const EnhancedAIChatSchema = z.object({
  messages: z.array(MessageSchema).min(1).max(100),
  context: ContextSchema,
  useCampaignStrategyTool: z.boolean().optional(),
  stream: z.boolean().optional()
});

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
    // NOTE: Removed standalone JSON regex that was stripping valid visualData blocks
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
        "targetUrl": "/repository",
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

// Phase 3: Generate proactive insights based on data state
function generateProactiveInsights(counts: Record<string, number>): string {
  const insights: string[] = [];
  
  // Content insights
  if (counts.draftCount > 5) {
    insights.push(`📝 You have ${counts.draftCount} draft articles ready for review`);
  }
  if (counts.contentCount === 0) {
    insights.push(`💡 No content yet - consider creating your first piece or starting a campaign`);
  }
  
  // Queue insights  
  if (counts.failedQueueCount > 0) {
    insights.push(`⚠️ ${counts.failedQueueCount} content items failed generation - consider retrying`);
  }
  if (counts.pendingQueueCount > 0) {
    insights.push(`⏳ ${counts.pendingQueueCount} items pending in generation queue`);
  }
  if (counts.processingQueueCount > 0) {
    insights.push(`🔄 ${counts.processingQueueCount} items currently being generated`);
  }
  
  // Campaign insights
  if (counts.activeCampaignCount === 0 && counts.contentCount > 0) {
    insights.push(`🚀 No active campaigns - consider starting one to boost content production`);
  }
  if (counts.activeCampaignCount > 0) {
    insights.push(`📊 ${counts.activeCampaignCount} active campaign(s) running`);
  }
  
  // Keyword insights
  if (counts.keywordCount === 0) {
    insights.push(`🔍 Add keywords to unlock SEO insights and content recommendations`);
  }
  
  // Proposal insights
  if (counts.proposalCount > 0 && counts.contentCount === 0) {
    insights.push(`💡 You have ${counts.proposalCount} strategy proposals - consider converting some to content`);
  }
  
  if (insights.length === 0) {
    return '';
  }
  
  return `
**🎯 PROACTIVE INSIGHTS:**
${insights.map(i => `• ${i}`).join('\n')}
`;
}

// Enhanced real data fetching function with Smart Context Loading (Phase 3 Enhanced)
async function fetchRealDataContext(userId: string, queryIntent: QueryIntent, userQuery: string = '') {
  try {
    // TOOL-BASED APPROACH: Fetch counts with intent-aware lazy loading
    console.log('📊 Fetching data counts (optimized - intent-aware)...');
    
    // Core counts (always needed for prompt context) — 7 queries
    const coreQueries: Promise<any>[] = [
      supabase.from('content_items').select('status', { count: 'exact' }).eq('user_id', userId),
      supabase.from('ai_strategy_proposals').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('keywords').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('company_competitors').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
      supabase.from('content_generation_queue').select('status').eq('user_id', userId),
    ];

    // Conditional queries based on intent categories
    const needsEngage = queryIntent.categories.includes('engage') || queryIntent.categories.includes('social');
    const needsIdentity = queryIntent.categories.some(c => ['competitors', 'solutions', 'campaigns', 'proposals'].includes(c));
    const needsRecent = queryIntent.categories.some(c => ['content', 'performance', 'activity_log'].includes(c));

    const [
      contentStatusResult,
      proposalResult,
      keywordResult,
      solutionResult,
      competitorResult,
      campaignResult,
      queueResult,
    ] = await Promise.all(coreQueries);

    // Calculate content status counts from single query
    const contentStatusData = contentStatusResult.data || [];
    const contentCount = contentStatusResult.count || contentStatusData.length;
    const draftCount = contentStatusData.filter((c: any) => c.status === 'draft').length;
    const publishedCount = contentStatusData.filter((c: any) => c.status === 'published').length;
    const proposalCount = proposalResult.count || 0;
    const keywordCount = keywordResult.count || 0;
    const solutionCount = solutionResult.count || 0;
    const competitorCount = competitorResult.count || 0;
    const activeCampaignCount = campaignResult.count || 0;

    // Conditional: recent content
    let recentContent: any[] = [];
    if (needsRecent) {
      const recentContentResult = await supabase.from('content_items').select('title, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5);
      recentContent = recentContentResult.data || [];
    }

    // Conditional: Engage module counts (only when engage-related)
    let engageWorkspaceId: string | null = null;
    let engageContactCount = 0, engageSegmentCount = 0, engageJourneyCount = 0, engageAutomationCount = 0, engageEmailCampaignCount = 0;
    
    if (needsEngage) {
      const engageWorkspaceResult = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).maybeSingle();
      engageWorkspaceId = engageWorkspaceResult.data?.workspace_id || null;
      
      if (engageWorkspaceId) {
        const [contactsR, segmentsR, journeysR, automationsR, emailCampaignsR] = await Promise.all([
          supabase.from('engage_contacts').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
          supabase.from('engage_segments').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
          supabase.from('journeys').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
          supabase.from('engage_automations').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
          supabase.from('email_campaigns').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
        ]);
        engageContactCount = contactsR.count || 0;
        engageSegmentCount = segmentsR.count || 0;
        engageJourneyCount = journeysR.count || 0;
        engageAutomationCount = automationsR.count || 0;
        engageEmailCampaignCount = emailCampaignsR.count || 0;
      }
    } else {
      // Only query for workspace ID if engage context might be needed downstream
      // Skip unnecessary query when engage is not relevant
      engageWorkspaceId = null;
    }

    // Conditional: Business identity (only when relevant)
    let companyInfo: any = null;
    let topSolutions: string[] = [];
    let topCompetitors: string[] = [];
    
    if (needsIdentity) {
      const [companyInfoResult, topSolutionsResult, topCompetitorsResult] = await Promise.all([
        supabase.from('company_info').select('name, industry, website, description').eq('user_id', userId).limit(1).maybeSingle(),
        supabase.from('solutions').select('name').eq('user_id', userId).order('created_at', { ascending: false }).limit(3),
        supabase.from('company_competitors').select('name').eq('user_id', userId).order('priority_order', { ascending: true }).limit(3)
      ]);
      companyInfo = companyInfoResult.data;
      topSolutions = (topSolutionsResult.data || []).map((s: any) => s.name);
      topCompetitors = (topCompetitorsResult.data || []).map((c: any) => c.name);
    }
    
    const competitorSolutionCount = 0; // Only fetched on-demand via tools now
    
    // Calculate queue status counts
    const queueItems = queueResult.data || [];
    const pendingQueueCount = queueItems.filter((i: any) => i.status === 'pending').length;
    const processingQueueCount = queueItems.filter((i: any) => i.status === 'processing').length;
    const completedQueueCount = queueItems.filter((i: any) => i.status === 'completed').length;
    const failedQueueCount = queueItems.filter((i: any) => i.status === 'failed').length;
    
    // Recent activity section
    const recentActivitySection = recentContent.length > 0
      ? `\n## Recent Activity:\n${recentContent.map((c: any) => `• "${c.title}" (${new Date(c.created_at).toLocaleDateString()})`).join('\n')}`
      : '';
    
    const identitySnippet = companyInfo ? `
## 🏢 Business Identity:
- **Company**: ${companyInfo.name || 'Not set'}${companyInfo.industry ? ` (${companyInfo.industry})` : ''}${companyInfo.website ? ` — ${companyInfo.website}` : ''}
${companyInfo.description ? `- **About**: ${companyInfo.description.slice(0, 200)}` : ''}
${topSolutions.length > 0 ? `- **Offerings**: ${topSolutions.join(', ')}${solutionCount > 3 ? ` (+${solutionCount - 3} more)` : ''}` : ''}
${topCompetitors.length > 0 ? `- **Competitors**: ${topCompetitors.join(', ')}${competitorCount > 3 ? ` (+${competitorCount - 3} more)` : ''}` : ''}
` : (topSolutions.length > 0 || topCompetitors.length > 0 ? `
## 🏢 Business Identity:
${topSolutions.length > 0 ? `- **Offerings**: ${topSolutions.join(', ')}${solutionCount > 3 ? ` (+${solutionCount - 3} more)` : ''}` : '- No offerings defined yet'}
${topCompetitors.length > 0 ? `- **Competitors**: ${topCompetitors.join(', ')}${competitorCount > 3 ? ` (+${competitorCount - 3} more)` : ''}` : '- No competitors tracked yet'}
` : '');

    // Build minimal context string with enhanced stats
    const contextString = `
${identitySnippet}
## Available Data Summary (${new Date().toISOString()}):
- **Content Items**: ${contentCount} total (${draftCount} drafts, ${publishedCount} published)
- **AI Strategy Proposals**: ${proposalCount} total
- **Keywords**: ${keywordCount} researched
- **Solutions/Products**: ${solutionCount} defined
- **Competitors**: ${competitorCount} tracked
- **Competitor Solutions**: ${competitorSolutionCount} products analyzed
- **Active Campaigns**: ${activeCampaignCount} running
- **Queue Status**: ${pendingQueueCount} pending, ${processingQueueCount} processing, ${completedQueueCount} completed, ${failedQueueCount} failed
${engageWorkspaceId ? `
## Engage Module (CRM & Email Marketing):
- **Contacts**: ${engageContactCount} in CRM
- **Segments**: ${engageSegmentCount} audience segments
- **Journeys**: ${engageJourneyCount} customer journeys
- **Automations**: ${engageAutomationCount} automation rules
- **Email Campaigns**: ${engageEmailCampaignCount} email campaigns
` : ''}
${recentActivitySection}
`;

    // 4d: Performance-driven topic prioritization
    let topicPrioritization = '';
    try {
      const { data: topicPerf } = await supabase.from('content_items')
        .select('main_keyword, seo_score')
        .eq('user_id', userId).not('main_keyword', 'is', null).not('seo_score', 'is', null)
        .order('seo_score', { ascending: false }).limit(50);
      if (topicPerf?.length > 3) {
        const topTopics = topicPerf.slice(0, 3).map((t: any) => `${t.main_keyword} (SEO: ${t.seo_score})`);
        const weakTopics = topicPerf.filter((t: any) => t.seo_score < 40).slice(0, 3).map((t: any) => `${t.main_keyword} (SEO: ${t.seo_score})`);
        topicPrioritization = `\n## Topic Performance:\n- **Top performing**: ${topTopics.join(', ')}${weakTopics.length > 0 ? `\n- **Needs improvement**: ${weakTopics.join(', ')}` : ''}`;
      }
    } catch (_) { /* non-blocking */ }

    const contextString2 = `${topicPrioritization}
## How to Access Detailed Data:

You have access to powerful tools to fetch exactly the data you need:

**Core Tools:**
1. **get_content_items** - Fetch content with filters (status, SEO score, type)
2. **get_keywords** - Fetch keyword data (volume, difficulty)
3. **get_proposals** - Fetch AI proposals (status, priority, impressions)
4. **get_solutions** - Fetch solutions/products
5. **get_seo_scores** - Fetch SEO performance metrics
6. **get_serp_analysis** - Fetch fresh SERP analysis data
7. **get_competitors** - Fetch competitor profiles, SWOT, intelligence
8. **get_competitor_solutions** - Fetch competitor products, features, pricing

**Campaign Intelligence Tools:**
9. **get_campaign_intelligence** - Fetch campaign performance overview
10. **get_queue_status** - Fetch content generation queue status
11. **get_campaign_content** - Fetch content items for a specific campaign
12. **trigger_content_generation** - Start content generation process
13. **retry_failed_content** - Retry failed queue items

**Engage CRM & Email Marketing Tools:**
14. **get_engage_contacts** - Fetch contacts with tag/subscription filters
15. **get_engage_segments** - Fetch audience segments with member counts
16. **get_engage_journeys** - Fetch customer journeys with enrollment stats
17. **get_engage_automations** - Fetch automation rules with execution stats
18. **get_engage_email_campaigns** - Fetch email campaigns with delivery analytics (sent, opened, clicked, bounced)
19. **get_company_info** - Fetch company/business information (name, industry, website, mission, values)

**CRITICAL INSTRUCTIONS:**
- When user asks about specific data, USE TOOLS to fetch it
- Start with small limits (5-10 items) unless user asks for "all"
- Only fetch what you actually need to answer the question
- Use filters to get precise data (e.g., status="published", min_seo_score=70)
- For campaign queries, use campaign intelligence tools
- For contacts, segments, journeys, automations, emails, use engage tools

**Examples:**
- User: "Show my best content" → Call get_content_items with min_seo_score=80, limit=5
- User: "What proposals are available?" → Call get_proposals with status="available", limit=10
- User: "Analyze keyword performance" → Call get_keywords with limit=20
- User: "Who are my competitors?" → Call get_competitors with limit=10, include_intelligence=true
- User: "What products does [competitor] offer?" → Call get_competitor_solutions with competitor_name="...", limit=10
- User: "Tell me about GL Connect" → Call get_solutions with name="GL Connect"
- User: "What are our offerings?" → Call get_solutions with limit=10
- User: "How is my campaign doing?" → Call get_campaign_intelligence with campaign_name
- User: "What's failing in my queue?" → Call get_queue_status
- User: "Retry failed items" → Call retry_failed_content
- User: "How many contacts do I have?" → Call get_engage_contacts with limit=1 (use totalCount)
- User: "Show my audience segments" → Call get_engage_segments
- User: "What journeys are active?" → Call get_engage_journeys with status="active"
- User: "Show email campaign performance" → Call get_engage_email_campaigns with status="sent"
- User: "What automations are running?" → Call get_engage_automations with is_active=true
- User: "What's my company info?" → Call get_company_info
- User: "Tell me about our business" → Call get_company_info

**Remember:** The counts above show total data available. Use tools to dive deeper when needed.
`;

    // Build counts object with all Phase 3 + Phase 4 additions
    const counts = {
      contentCount,
      proposalCount,
      keywordCount,
      solutionCount,
      competitorCount,
      competitorSolutionCount,
      activeCampaignCount,
      draftCount,
      publishedCount,
      pendingQueueCount,
      processingQueueCount,
      completedQueueCount,
      failedQueueCount,
      engageContactCount,
      engageSegmentCount,
      engageJourneyCount,
      engageAutomationCount,
      engageEmailCampaignCount
    };

    // Store counts for TOOL_USAGE_MODULE replacement
    return {
      contextString: contextString + contextString2,
      counts,
      proactiveInsights: generateProactiveInsights(counts)
    };
  } catch (error) {
    console.error('❌ Error fetching context:', error);
    return { 
      contextString: `## Error Loading Context\nUnable to fetch data: ${error.message}`,
      counts: {},
      proactiveInsights: ''
    };
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

    // Parse and validate input
    let rawBody: unknown;
    try {
      rawBody = await req.json();
    } catch {
      console.error('❌ Invalid JSON in request body');
      return new Response(JSON.stringify({ error: 'Invalid JSON in request body' }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Validate input against schema
    const validationResult = EnhancedAIChatSchema.safeParse(rawBody);
    if (!validationResult.success) {
      console.error('❌ Input validation failed:', validationResult.error.errors);
      return new Response(JSON.stringify({ 
        error: 'Invalid input', 
        details: validationResult.error.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }))
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages, context, useCampaignStrategyTool, stream: streamMode } = validationResult.data;
    const use_case = context?.use_case;
    const conversationId = context?.conversation_id;
    console.log("🚀 Processing enhanced AI chat request for user:", user.id, use_case ? `(use_case: ${use_case})` : '', useCampaignStrategyTool ? '(Campaign Strategy Tool)' : '');

    // ── CONVERSATION SUMMARIZATION (Phase 1B: expanded thresholds) ──
    // If conversation has SUMMARIZE_THRESHOLD+ messages, generate/load a summary
    if (conversationId && messages.length > SUMMARIZE_THRESHOLD) {
      try {
        const { data: convo } = await supabase.from('ai_conversations')
          .select('summary, summary_message_count')
          .eq('id', conversationId)
          .single();

        const currentCount = messages.length;
        const lastSummarizedAt = convo?.summary_message_count || 0;
        const needsNewSummary = !convo?.summary || (currentCount - lastSummarizedAt >= RESUMMARIZE_INTERVAL);

        if (needsNewSummary) {
          // Build a condensed version of older messages for summarization (keep last MAX_HISTORY_MESSAGES)
          const olderMessages = messages.slice(0, -MAX_HISTORY_MESSAGES).map((m: any) => 
            `${m.role}: ${(m.content || '').substring(0, 200)}`
          ).join('\n');

          if (olderMessages.length > 100) {
            // Get user's AI provider for the summary call
            const { data: sumProvider } = await supabase.from('ai_service_providers')
              .select('provider, preferred_model')
              .eq('user_id', user.id)
              .eq('status', 'active')
              .order('priority', { ascending: true })
              .limit(1).single();

            if (sumProvider) {
              const { getApiKey } = await import('../shared/apiKeyService.ts');
              const sumKey = await getApiKey(sumProvider.provider, user.id);
              
              if (sumKey) {
                const { callAiProxyWithRetry } = await import('../shared/aiProxyRetry.ts');
                const sumResponse = await callAiProxyWithRetry(`${supabaseUrl}/functions/v1/ai-proxy`, {
                  method: 'POST',
                  headers: {
                    'Authorization': `Bearer ${supabaseKey}`,
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    service: sumProvider.provider,
                    endpoint: 'chat',
                    apiKey: sumKey,
                    params: {
                      model: sumProvider.preferred_model || 'gpt-4',
                      messages: [
                        { role: 'system', content: 'Summarize this conversation concisely in 2-3 sentences. Focus on key topics discussed, decisions made, and any pending actions. Be factual.' },
                        { role: 'user', content: olderMessages }
                      ],
                      maxTokens: 300
                    }
                  })
                }, { maxRetries: 1, baseDelay: 1000 });

                if (sumResponse.ok) {
                  const sumResult = await sumResponse.json();
                  const summary = sumResult.content || sumResult.choices?.[0]?.message?.content || '';
                  
                  if (summary) {
                    // Save summary back to DB
                    await supabase.from('ai_conversations')
                      .update({ summary, summary_message_count: currentCount })
                      .eq('id', conversationId);

                    // Prepend summary as system message, keep only last 5 messages
                    const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
                    messages.length = 0;
                    messages.push({ role: 'system', content: `[Previous conversation summary]: ${summary}` });
                    messages.push(...recentMessages);
                    
                    console.log(`📝 Conversation summarized (${currentCount} msgs → summary + last ${MAX_HISTORY_MESSAGES})`);
                  }
                }
              }
            }
          }
        } else if (convo?.summary) {
          // Use existing summary — keep only last 5 messages
          const recentMessages = messages.slice(-MAX_HISTORY_MESSAGES);
          messages.length = 0;
          messages.push({ role: 'system', content: `[Previous conversation summary]: ${convo.summary}` });
          messages.push(...recentMessages);
          console.log(`📝 Using cached conversation summary (summarized at ${lastSummarizedAt} msgs)`);
        }
      } catch (sumError: any) {
        console.warn('⚠️ Conversation summarization failed (non-blocking):', sumError?.message);
      }
    }

    // ── PINNED MESSAGES + FEEDBACK + GOAL CONTEXT (Phase 2-4) ──
    if (conversationId) {
      try {
        // Fetch pinned messages — always include in context regardless of message limit
        const { data: pinnedMsgs } = await supabase.from('ai_messages')
          .select('content, type')
          .eq('conversation_id', conversationId)
          .eq('is_pinned', true)
          .order('message_sequence', { ascending: true })
          .limit(5);
        
        if (pinnedMsgs && pinnedMsgs.length > 0) {
          const pinnedContext = pinnedMsgs.map((m: any) => `[PINNED ${m.type}]: ${(m.content || '').substring(0, 300)}`).join('\n');
          messages.unshift({ role: 'system', content: `[Important pinned messages from this conversation]:\n${pinnedContext}` });
          console.log(`📌 Injected ${pinnedMsgs.length} pinned messages into context`);
        }

        // Check recent negative feedback — inject hint to try different approach
        const { data: recentFeedback } = await supabase.from('ai_messages')
          .select('feedback_helpful')
          .eq('conversation_id', conversationId)
          .not('feedback_helpful', 'is', null)
          .order('message_sequence', { ascending: false })
          .limit(10);
        
        if (recentFeedback) {
          const negCount = recentFeedback.filter((m: any) => m.feedback_helpful === false).length;
          if (negCount >= 3) {
            messages.unshift({ role: 'system', content: '[Context]: The user has indicated multiple recent responses were not helpful. Try a DIFFERENT approach — be more specific, use concrete examples, provide actionable steps, and ask clarifying questions when unsure.' });
            console.log(`⚠️ ${negCount} negative feedback signals — injecting improvement hint`);
          }
        }

        // Fetch conversation goal
        const { data: convoGoal } = await supabase.from('ai_conversations')
          .select('goal')
          .eq('id', conversationId)
          .single();
        
        if (convoGoal?.goal) {
          messages.unshift({ role: 'system', content: `[Conversation goal]: ${convoGoal.goal}. Keep responses focused on this objective.` });
          console.log(`🎯 Conversation goal: ${convoGoal.goal}`);
        }

        // 3A: Inject learned user preferences into prompt
        try {
          const { data: userPrefs } = await supabase.from('user_preferences')
            .select('preference_type, preference_value, confidence_score')
            .eq('user_id', userId)
            .gte('confidence_score', 0.6)
            .order('confidence_score', { ascending: false })
            .limit(5);
          
          if (userPrefs && userPrefs.length > 0) {
            const prefsText = userPrefs.map((p: any) => `- ${p.preference_type}: ${JSON.stringify(p.preference_value)}`).join('\n');
            messages.unshift({ role: 'system', content: `[Learned User Preferences (high confidence)]:\n${prefsText}\nAdapt your responses to respect these preferences.` });
            console.log(`🧠 Injected ${userPrefs.length} user preferences into context`);
          }
        } catch (prefErr) {
          console.warn('⚠️ Failed to load user preferences (non-blocking):', prefErr);
        }
      } catch (ctxErr) {
        console.warn('⚠️ Failed to load pinned/feedback/goal context (non-blocking):', ctxErr);
      }
    }

    // ✅ NEW: Analyze query intent BEFORE fetching context (with runtime-safe fallback)
    let userQuery = messages[messages.length - 1]?.content || '';
    
    // ── DETECT & STRIP [web-search] PREFIX ──
    let forceWebSearch = false;
    let forceVariation = false;
    if (userQuery.startsWith('[web-search]')) {
      forceWebSearch = true;
      userQuery = userQuery.replace(/^\[web-search\]\s*/, '').trim();
      console.log('🌐 [web-search] prefix detected — forcing web search for:', userQuery);
    }
    // Smart retry with variation (Phase 4b)
    if (userQuery.startsWith('[Regenerate with different approach]')) {
      forceVariation = true;
      userQuery = userQuery.replace(/^\[Regenerate with different approach\]\s*/, '').trim();
      console.log('🔄 Regeneration with variation requested');
    }

    // Response format preference detection (Phase 3b)
    let formatPreference = '';
    if (/shorter|concise|brief|bullet|summary/i.test(userQuery)) {
      formatPreference = '\n[User format preference]: The user prefers SHORT, concise responses. Use bullet points and keep responses under 200 words when possible.';
    } else if (/elaborate|detail|explain|in.?depth|comprehensive/i.test(userQuery)) {
      formatPreference = '\n[User format preference]: The user wants DETAILED, comprehensive responses. Provide thorough explanations with examples.';
    }
    if (formatPreference) {
      messages.unshift({ role: 'system', content: formatPreference });
    }
    if (forceVariation) {
      messages.unshift({ role: 'system', content: '[REGENERATION REQUEST]: The user wants a GENUINELY DIFFERENT response to the same query. Use a different structure, angle, examples, and writing style. Do NOT repeat the previous response pattern.' });
    }

    console.log('🎯 Analyzing query intent...');

    let queryIntent;
    try {
      queryIntent = analyzeQueryIntent(userQuery);
    } catch (intentError: any) {
      console.error('⚠️ Query intent analysis failed, using safe fallback:', intentError?.message || intentError);
      queryIntent = {
        scope: 'summary',
        categories: [],
        estimatedTokens: 1000,
        requiresVisualData: false,
        confidence: 0.3,
        isConversational: false,
        panelHint: null,
        disambiguationHint: null,
      };
    }

    console.log(`📊 Intent Analysis:`, {
      scope: queryIntent.scope,
      categories: queryIntent.categories,
      estimatedTokens: queryIntent.estimatedTokens,
      confidence: queryIntent.confidence,
      isConversational: queryIntent.isConversational,
      panelHint: queryIntent.panelHint || 'none'
    });

    // Runtime-safe alias to prevent out-of-scope ReferenceError in any prompt path
    const isVisualPromptRequired = queryIntent?.requiresVisualData === true;
    
    if (queryIntent.isConversational) {
      console.log('⚡ FAST-PATH: Conversational query detected - skipping heavy processing');
      
      // Simple conversational response without data fetching or chart generation
      const conversationalResponse = generateConversationalResponse(userQuery);
      
      const fastPathPayload = JSON.stringify({
        message: conversationalResponse,
        content: conversationalResponse,
        fastPath: true,
        queryType: 'conversational',
        metadata: {
          processed_at: new Date().toISOString(),
          has_actions: false,
          has_visual_data: false
        }
      });

      // If client requested streaming, return SSE-formatted response
      if (streamMode) {
        const sseBody = `event: done\ndata: ${fastPathPayload}\n\n`;
        return new Response(sseBody, {
          headers: { ...corsHeaders, "Content-Type": "text/event-stream", "Cache-Control": "no-cache" }
        });
      }

      return new Response(fastPathPayload, {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // Get active providers — all keys resolved from encrypted api_keys table via getApiKey()
    const { data: allProviders, error: providerError } = await supabase
      .from('ai_service_providers')
      .select('provider, preferred_model, status, priority')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .limit(1); // Only one provider should be active at a time

    if (providerError) {
      console.error("❌ Error fetching providers:", providerError);
      return new Response(JSON.stringify({ error: "Failed to fetch AI providers", deployVersion: DEPLOY_VERSION }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    // 3. Filter valid providers with models configured
    const validProviders = (allProviders || []).filter(p => {
      if (!p.preferred_model || p.preferred_model.trim() === '') {
        return false;
      }
      return true;
    });

    if (validProviders.length === 0) {
      console.log("⚠️ No active provider in ai_service_providers — checking api_keys fallback...");
      
      // FALLBACK: Check api_keys table directly for any active AI key
      const AI_SERVICES = ['openai', 'anthropic', 'gemini', 'mistral', 'openrouter'];
      const { data: activeKeys } = await supabase
        .from('api_keys')
        .select('service')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .in('service', AI_SERVICES)
        .limit(1);
      
      if (activeKeys && activeKeys.length > 0) {
        const fallbackService = activeKeys[0].service;
        console.log(`🔧 Self-healing: Found active key for ${fallbackService}, auto-activating provider...`);
        
        // Default models per provider
        const defaultModels: Record<string, string> = {
          openai: 'gpt-4o-mini',
          anthropic: 'claude-3-5-sonnet-20241022',
          gemini: 'gemini-2.0-flash-exp',
          mistral: 'mistral-large-latest',
          openrouter: 'openai/gpt-4o-mini'
        };
        const preferredModel = defaultModels[fallbackService] || 'gpt-4o-mini';
        
        // Auto-heal: upsert provider to active
        await supabase
          .from('ai_service_providers')
          .upsert({
            user_id: user.id,
            provider: fallbackService,
            status: 'active',
            preferred_model: preferredModel,
            api_key: '',
            priority: 1,
            error_message: null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'user_id,provider' });
        
        // Use this as the active provider
        validProviders.push({
          provider: fallbackService,
          preferred_model: preferredModel,
          status: 'active',
          priority: 1
        });
        
        console.log(`✅ Self-healed provider: ${fallbackService} (model: ${preferredModel})`);
      } else {
        console.error("❌ No active AI provider found (no fallback keys either)");
        return new Response(JSON.stringify({ 
          error: "No AI provider configured. Please add and test an API key in Settings → AI Service Hub.",
          deployVersion: DEPLOY_VERSION
        }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
    }

    // Get the single active provider (only one should be active at a time)
    const provider = validProviders[0] as any;
    
    // 4. Resolve API key from encrypted api_keys table
    const { getApiKey } = await import('../shared/apiKeyService.ts');
    const decryptedKey = await getApiKey(provider.provider, user.id);
    if (!decryptedKey) {
      console.error(`❌ No decrypted API key found for provider: ${provider.provider}`);
      return new Response(JSON.stringify({ error: `No API key found for ${provider.provider}. Please add your API key in Settings → API Keys.`, deployVersion: DEPLOY_VERSION }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    provider.api_key = decryptedKey;

    console.log(`🔑 Using active provider: ${provider.provider} (model: ${provider.preferred_model})`)
    
    // FAST PATH: Campaign strategy generation - skip expensive context fetching
    if (useCampaignStrategyTool) {
      console.log('🎯 Campaign strategy fast path - minimal context, direct tool execution');
      console.log('🎯 Messages:', messages.length, 'messages');
      
      // Retry logic with exponential backoff
      let aiProxyResult = null;
      let aiProxyError = null;
      const maxRetries = 3;
      
      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        console.log(`🎯 AI call attempt ${attempt}/${maxRetries} with campaign strategy tool`);
        
        const result = await aiRequestQueue.enqueue(() =>
          supabase.functions.invoke('ai-proxy', {
            body: {
              service: provider.provider,
              endpoint: 'chat',
              apiKey: provider.api_key,
              params: {
                model: provider.preferred_model,
                messages: messages,
                tools: [CAMPAIGN_STRATEGY_TOOL],
                tool_choice: { type: "function", function: { name: "generate_campaign_strategies" } },
                temperature: 0.7,
                max_tokens: 4096,
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
        console.error("🎯❌ Campaign strategy generation failed after all retries:", aiProxyError);
        return new Response(JSON.stringify({ 
          error: "Failed to generate campaign strategies",
          details: typeof aiProxyError === 'string' ? aiProxyError : (aiProxyError?.message || aiProxyResult?.error),
          message: "AI service temporarily unavailable. Please try again in a moment."
        }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      // Extract tool calls from response
      const data = aiProxyResult.data;
      const toolCalls = data?.choices?.[0]?.message?.tool_calls;
      
      console.log('🎯 AI response received:', {
        hasData: !!data,
        hasChoices: !!data?.choices,
        choicesLength: data?.choices?.length || 0,
        hasMessage: !!data?.choices?.[0]?.message,
        hasToolCalls: !!toolCalls
      });
      
      if (toolCalls && toolCalls.length > 0) {
        console.log('🎯✅ Returning campaign strategy tool data:', {
          toolCallCount: toolCalls.length,
          functionName: toolCalls[0]?.function?.name,
          hasArguments: !!toolCalls[0]?.function?.arguments
        });
        
        // Log arguments preview for debugging
        try {
          const args = JSON.parse(toolCalls[0].function.arguments);
          console.log('🎯 Tool arguments preview:', {
            hasStrategies: !!args.strategies,
            strategiesCount: args.strategies?.length || 0,
            firstStrategyTitle: args.strategies?.[0]?.title
          });
        } catch (e) {
          console.error('🎯 Failed to parse tool arguments for logging:', e);
        }
        
        return new Response(JSON.stringify({ choices: [{ message: { tool_calls: toolCalls } }], deployVersion: DEPLOY_VERSION }), {
          status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Fallback if no tool call (shouldn't happen)
      console.error('🎯❌ No tool call in campaign strategy response');
      console.error('🎯 Response data:', JSON.stringify(data, null, 2));
      return new Response(JSON.stringify({ error: 'Failed to generate campaign strategies', details: 'AI did not return a tool call', deployVersion: DEPLOY_VERSION }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

    console.log('📡 Researching market intelligence...');

    // Analyze the user query for intent and SERP opportunities
    const lastUserMessage = messages.filter(m => m.role === 'user').pop();
    
    console.log("🧠 Analyzing query for context and SERP opportunities:", userQuery);
    
    // STEP 1: Detect if query would benefit from SERP data or web search
    const serpIntelligence = forceWebSearch
      ? { shouldTriggerSerp: true, queryType: 'web_search', keywords: [userQuery], priority: 10, suggestedAnalysis: ['organic_results'] }
      : analyzeSerpIntent(userQuery);
    let serpContext = '';
    let serpData = null;
    let webSearchContext = '';
    
    if (serpIntelligence.shouldTriggerSerp && serpIntelligence.keywords.length > 0) {
      // Decrypt user's SERP API key ONCE for both paths
      let serpApiKey: string | null = null;
      try {
        const { getApiKey } = await import('../shared/apiKeyService.ts');
        serpApiKey = await getApiKey('serp', user.id);
        if (!serpApiKey) {
          serpApiKey = await getApiKey('serpstack', user.id);
        }
      } catch (e) {
        console.warn('⚠️ Failed to decrypt SERP key:', e);
      }

      // Route based on query type: web_search vs keyword/SEO analysis
      if (serpIntelligence.queryType === 'web_search') {
        // ── WEB SEARCH PATH ──
        console.log("🌐 Web search intent detected, fetching live results:", serpIntelligence.keywords);
        try {
          if (!serpApiKey) {
            console.warn('⚠️ No SERP API key found in user settings');
            webSearchContext = '\n\n⚠️ Web search was requested but no SERP API key is configured. Please add a SerpAPI or Serpstack API key in **Settings → API Keys** to enable web search and live data.\n';
          } else {
            const searchQuery = serpIntelligence.keywords.join(' ');
            const webResults = await executeWebSearch(searchQuery, 'us', serpApiKey);
            if (webResults.results.length > 0) {
              webSearchContext = generateWebSearchContext(webResults);
              console.log(`✅ Web search returned ${webResults.results.length} results`);
            } else {
              console.warn('⚠️ Web search returned no results');
              if (forceWebSearch) {
                webSearchContext = '\n\n⚠️ Web search returned no results for this query. The AI will respond using its training data.\n';
              }
            }
          }
        } catch (error: any) {
          console.error("❌ Web search failed, continuing without:", error);
          if (forceWebSearch) {
            webSearchContext = '\n\n⚠️ Web search encountered an error. The AI will respond using its training data.\n';
          }
        }
      } else {
        // ── KEYWORD/SEO SERP PATH (existing) ──
        console.log("🔍 SERP opportunity detected, fetching real-time data:", serpIntelligence);
        try {
          const serpResults = await executeSerpAnalysis(serpIntelligence.keywords, serpIntelligence.queryType, 'us', serpApiKey);
          if (serpResults.length > 0) {
            serpContext = generateSerpContext(serpResults);
            
            const structuredSerpData = generateStructuredSerpData(serpResults);
            
            serpData = {
              keywords: serpIntelligence.keywords,
              results: serpResults,
              analysisType: serpIntelligence.queryType,
              suggestions: generateSmartSuggestions(serpResults),
              structured: structuredSerpData
            };
            
            if (structuredSerpData) {
              serpContext += `\n\n📊 STRUCTURED SERP DATA FOR CHARTS:\n\`\`\`json\n${JSON.stringify(structuredSerpData, null, 2)}\n\`\`\`\n`;
            }
            
            console.log("✅ SERP data successfully integrated into AI context with structured data");
          }
        } catch (error: any) {
          if (error.message?.includes('rate limit') || error.message?.includes('exceeded')) {
            console.warn("⚠️ SERP API rate limited - continuing without SERP data");
            serpContext = `\n\n⚠️ Note: SERP data temporarily unavailable due to API rate limits. Providing analysis based on internal data.\n`;
          } else {
            console.error("❌ SERP analysis failed, continuing without SERP data:", error);
          }
        }
      }
    } else {
      console.log('❌ No SERP/web search intent detected');
    }

    // Build enhanced system prompt with context
    // Fetch real data from database using tiered context (Phase 3 enhanced)
    console.log('📦 Loading workspace data...');
    const contextResult = await fetchRealDataContext(user.id, queryIntent, userQuery);
    const realDataContext = contextResult.contextString || contextResult;
    const counts = contextResult.counts || {};
    const proactiveInsights = contextResult.proactiveInsights || '';
    
    // Prompt modules are now inlined at the top of this file to avoid cross-folder import issues

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
      
      // Replace count placeholders in TOOL_USAGE_MODULE (Phase 3 enhanced)
      const toolUsageWithCounts = TOOL_USAGE_MODULE
        .replace('{contentCount}', (counts.contentCount || 0).toString())
        .replace('{draftCount}', (counts.draftCount || 0).toString())
        .replace('{publishedCount}', (counts.publishedCount || 0).toString())
        .replace('{proposalCount}', (counts.proposalCount || 0).toString())
        .replace('{keywordCount}', (counts.keywordCount || 0).toString())
        .replace('{solutionCount}', (counts.solutionCount || 0).toString())
        .replace('{activeCampaignCount}', (counts.activeCampaignCount || 0).toString())
        .replace('{pendingQueueCount}', (counts.pendingQueueCount || 0).toString())
        .replace('{completedQueueCount}', (counts.completedQueueCount || 0).toString())
        .replace('{failedQueueCount}', (counts.failedQueueCount || 0).toString())
        .replace('{proactiveInsights}', proactiveInsights);
      systemPrompt += '\n\n' + toolUsageWithCounts;
      systemPrompt += '\n\n' + RESPONSE_STRUCTURE;
      systemPrompt += '\n\n' + CHART_MODULE;
      
      // Add SERP module if SERP data present (critical for SERP queries)
      if (serpContext) {
        systemPrompt += '\n\n' + SERP_MODULE;
        systemPrompt += `\n\n### 🔍 SERP DATA (USE THIS REAL DATA):\n${serpContext}`;
      }
      // Add web search results if present
      if (webSearchContext) {
        systemPrompt += webSearchContext;
      }
    } else {
      // NORMAL: Full prompt with intent-gated modules (Phase 4: Prompt Efficiency)
      console.log('✅ Normal token usage (<25k) - using intent-gated dynamic prompt');
      
      // START WITH TOOL USAGE MODULE (most critical for tool-based architecture)
      systemPrompt = BASE_PROMPT;
      
      // Replace count placeholders in TOOL_USAGE_MODULE (Phase 3 enhanced)
      const toolUsageWithCounts = TOOL_USAGE_MODULE
        .replace('{contentCount}', (counts.contentCount || 0).toString())
        .replace('{draftCount}', (counts.draftCount || 0).toString())
        .replace('{publishedCount}', (counts.publishedCount || 0).toString())
        .replace('{proposalCount}', (counts.proposalCount || 0).toString())
        .replace('{keywordCount}', (counts.keywordCount || 0).toString())
        .replace('{solutionCount}', (counts.solutionCount || 0).toString())
        .replace('{activeCampaignCount}', (counts.activeCampaignCount || 0).toString())
        .replace('{pendingQueueCount}', (counts.pendingQueueCount || 0).toString())
        .replace('{completedQueueCount}', (counts.completedQueueCount || 0).toString())
        .replace('{failedQueueCount}', (counts.failedQueueCount || 0).toString())
        .replace('{proactiveInsights}', proactiveInsights);
      systemPrompt += '\n\n' + toolUsageWithCounts;
      systemPrompt += '\n\n' + RESPONSE_STRUCTURE;
      
      // === INTENT-GATED MODULE LOADING (PE Fix 1) ===
      const categories = queryIntent.categories || [];
      const queryLower = userQuery.toLowerCase();
      
      // Chart modules: only for data-heavy categories
      const needsCharts = categories.some((c: string) => ['content', 'keywords', 'campaigns', 'analytics', 'performance', 'competitors'].includes(c)) ||
        /chart|graph|trend|analyz|metric|dashboard|report|compare/i.test(queryLower);
      
      // Table module: only when explicitly requested
      const needsTable = /table|spreadsheet|list all|export|raw data|csv|show me all/i.test(queryLower);
      
      // Action module: for non-summary queries involving action-oriented categories
      const needsActions = queryIntent.scope !== 'summary' && (
        categories.some((c: string) => ['campaigns', 'engage', 'content', 'calendar', 'approvals'].includes(c)) ||
        /create|generate|write|schedule|send|update|delete|remove|submit|approve/i.test(queryLower)
      );
      
      // Platform knowledge: only for navigation/general queries
      const needsPlatformKnowledge = categories.some((c: string) => ['navigation', 'general', 'help'].includes(c)) ||
        /where|how do i|find|navigate|what is|help|tutorial|guide me/i.test(queryLower);
      
      // PHASE 3: Check if multi-chart mode should be activated
      const needsMultiChart = shouldGenerateMultipleCharts(userQuery);
      
      if (needsMultiChart) {
        console.log('📊📊📊 MULTI-CHART MODE ACTIVATED - Enhanced analysis with multiple perspectives');
        systemPrompt += '\n\n' + MULTI_CHART_MODULE;
        if (needsTable) systemPrompt += '\n\n' + TABLE_MODULE;
        if (needsActions) systemPrompt += '\n\n' + ACTION_MODULE;
      } else {
        if (needsCharts) {
          const shouldPrioritizeVisualPrompt =
            queryIntent.scope === 'detailed' ||
            queryIntent.scope === 'full' ||
            isVisualPromptRequired === true;

          if (shouldPrioritizeVisualPrompt) {
            console.log('📊 Using standard chart analysis prompt');
          }
          systemPrompt += '\n\n' + CHART_MODULE;
        }
        if (needsTable) systemPrompt += '\n\n' + TABLE_MODULE;
      }
      
      // Add SERP module if SERP data present
      if (serpContext) {
        systemPrompt += '\n\n' + SERP_MODULE;
        systemPrompt += `\n\n### 🔍 SERP DATA (USE THIS REAL DATA):\n${serpContext}`;
      }
      // Add web search results if present
      if (webSearchContext) {
        systemPrompt += webSearchContext;
      }
      
      // Add action module for actionable queries
      if (needsActions) {
        systemPrompt += '\n\n' + ACTION_MODULE;
      }
      
      // Phase 1C: Skip platform knowledge for experienced users (10+ conversations)
      // Also skip for non-navigation queries to save tokens
      let skipFullPlatformKnowledge = false;
      try {
        const { count: convoCount } = await supabase.from('ai_conversations')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id);
        if ((convoCount || 0) >= 10) {
          skipFullPlatformKnowledge = true;
          console.log(`🧠 Experienced user (${convoCount} convos) — skipping full platform knowledge`);
        }
      } catch (_) { /* non-blocking */ }

      if (needsPlatformKnowledge && !skipFullPlatformKnowledge) {
        systemPrompt += '\n\n' + PLATFORM_KNOWLEDGE_MODULE;
      } else {
        systemPrompt += '\n\n' + PLATFORM_BASICS;
      }
      
      console.log(`🎯 Intent-gated modules: charts=${needsCharts}, table=${needsTable}, actions=${needsActions}, platform=${needsPlatformKnowledge}, multiChart=${needsMultiChart}`);
    }

    // Inject Analyst context if active (user has Analyst panel open)
    if (context?.analystActive) {
      systemPrompt += `\n\n## 📊 ANALYST MODE ACTIVE
The user has the Analyst sidebar panel open. They expect data-rich, visual responses.
CRITICAL: For EVERY response while Analyst is active:
1. ALWAYS include visualData with charts showing relevant metrics
2. ALWAYS include summaryInsights.metricCards (2-4 key stats)
3. ALWAYS include actionableItems and deepDivePrompts
4. Proactively surface data insights even if the user asks a general question
5. Default to multi-chart analysis when possible
Make every response a mini-dashboard. The Analyst panel will auto-render your chart data.`;
    }

    // Inject panel hint from query analyzer
    if (queryIntent.panelHint === 'repository') {
      systemPrompt += `\n\n## 🎯 PANEL HINT: REPOSITORY
The user's query matches a repository/content browsing intent. You MUST include this in your response:
\`\`\`json
{"visualData": {"type": "repository", "title": "Content Search Results"}}
\`\`\`
This will open the Repository quick-access panel. Also provide a brief text answer.`;
    } else if (queryIntent.panelHint === 'approvals') {
      systemPrompt += `\n\n## 🎯 PANEL HINT: APPROVALS
The user's query matches an approvals intent. You MUST include this in your response:
\`\`\`json
{"visualData": {"type": "approvals", "title": "Pending Approvals"}}
\`\`\`
This will open the Approvals quick-action panel. Also provide a brief text answer.`;
    } else if (queryIntent.panelHint === 'content_repurpose') {
      systemPrompt += `\n\n## 🎯 PANEL HINT: CONTENT REPURPOSE
The user wants to repurpose content. You MUST include this in your response:
\`\`\`json
{"visualData": {"type": "content_repurpose", "contentId": null}}
\`\`\`
This will open the Repurpose panel. Also provide a brief text answer explaining the repurpose options.`;
    }
    
    // Inject disambiguation hint if present
    if (queryIntent.disambiguationHint) {
      systemPrompt += `\n\n## ⚠️ DISAMBIGUATION REQUIRED:\n${queryIntent.disambiguationHint}`;
    }
    
    // ===== Parallelized: Brand voice + User intelligence + Standing instructions (TTFT optimization) =====
    let brandVoiceContext = '';
    let userIntelligenceContext = '';
    let standingInstructionsContext = '';

    const [brandResult, profileResult, apiKeysResult, websiteConnsResult, instructionsResult] = await Promise.allSettled([
      supabase.from('brand_guidelines')
        .select('tone, brand_personality, brand_values, target_audience, do_use, dont_use')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.from('profiles')
        .select('first_name, last_name, company')
        .eq('id', user.id)
        .maybeSingle(),
      supabase.from('api_keys')
        .select('service, is_active')
        .eq('user_id', user.id)
        .eq('is_active', true),
      supabase.from('website_connections')
        .select('provider, site_name, site_url, status')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      supabase.from('user_content_instructions')
        .select('instruction_text, use_case')
        .eq('user_id', user.id)
        .order('applied_count', { ascending: false })
        .limit(5),
    ]);

    // Process brand voice result
    if (brandResult.status === 'fulfilled' && brandResult.value.data) {
      const brandData = brandResult.value.data;
      const bParts: string[] = [];
      if (brandData.tone && Array.isArray(brandData.tone) && brandData.tone.length > 0) bParts.push(`Tone: ${brandData.tone.join(', ')}`);
      if (brandData.brand_personality) bParts.push(`Personality: ${brandData.brand_personality}`);
      if (brandData.brand_values) bParts.push(`Values: ${brandData.brand_values}`);
      if (brandData.target_audience) bParts.push(`Target Audience: ${brandData.target_audience}`);
      if (brandData.do_use && Array.isArray(brandData.do_use) && brandData.do_use.length > 0) bParts.push(`Preferred phrases: ${brandData.do_use.slice(0, 5).join(', ')}`);
      if (brandData.dont_use && Array.isArray(brandData.dont_use) && brandData.dont_use.length > 0) bParts.push(`Avoid phrases: ${brandData.dont_use.slice(0, 5).join(', ')}`);
      if (bParts.length > 0) brandVoiceContext = `\n\n## USER'S BRAND VOICE\nWhen generating any content, writing suggestions, or creative output, follow these guidelines:\n${bParts.join('\n')}`;
    } else if (brandResult.status === 'rejected') {
      console.warn('[BRAND-VOICE] Failed to fetch brand guidelines (non-blocking):', brandResult.reason);
    }

    // Process standing user instructions
    if (instructionsResult.status === 'fulfilled' && instructionsResult.value.data?.length) {
      const instructions = instructionsResult.value.data.map((i: any) => `- ${i.instruction_text}`).join('\n');
      standingInstructionsContext = `\n\n## STANDING INSTRUCTIONS (user-defined preferences)\n${instructions}\nApply these preferences to all relevant responses.`;
    }

    // Inject real data context + brand voice + standing instructions
    systemPrompt += brandVoiceContext;
    systemPrompt += standingInstructionsContext;

    // Process user intelligence result
    if (profileResult.status === 'fulfilled' && profileResult.value.data) {
      const profile = profileResult.value.data;
      const parts: string[] = [];
      if (profile.preferred_length && profile.preferred_length !== 'medium') {
        parts.push(`Content length preference: ${profile.preferred_length} (adjust word count accordingly)`);
      }
      if (profile.preferred_tone && Array.isArray(profile.preferred_tone) && profile.preferred_tone.length > 0) {
        parts.push(`Preferred tone: ${profile.preferred_tone.join(', ')}`);
      }
      if (profile.preferred_formats && Array.isArray(profile.preferred_formats) && profile.preferred_formats.length > 0) {
        parts.push(`Preferred content formats: ${profile.preferred_formats.join(', ')}`);
      }
      if (profile.editing_patterns && typeof profile.editing_patterns === 'object') {
        const ep = profile.editing_patterns as Record<string, any>;
        const patternInstructions: string[] = [];
        if (ep.splits_long_paragraphs) patternInstructions.push('Keep paragraphs to 2-3 sentences max');
        if (ep.adds_examples) patternInstructions.push('Include concrete examples and real-world scenarios');
        if (ep.removes_generic_filler) patternInstructions.push('Avoid filler phrases like "in today\'s digital world"');
        if (ep.adds_data_statistics) patternInstructions.push('Include relevant numbers, percentages, and data');
        if (ep.consolidates_headings) patternInstructions.push('Use fewer, more meaningful section headers');
        if (ep.adds_more_structure) patternInstructions.push('Use more subheadings and clear section breaks');
        if (ep.converts_to_lists) patternInstructions.push('Use bullet points and numbered lists where appropriate');
        if (patternInstructions.length > 0) parts.push(`Editing patterns learned:\n- ${patternInstructions.join('\n- ')}`);
      }
      if (profile.top_topics && Array.isArray(profile.top_topics) && profile.top_topics.length > 0) {
        parts.push(`User's top topics: ${profile.top_topics.slice(0, 5).join(', ')}`);
      }
      if (profile.top_solutions && Array.isArray(profile.top_solutions) && profile.top_solutions.length > 0) {
        parts.push(`User's key solutions/products: ${profile.top_solutions.slice(0, 5).join(', ')}`);
      }
      if (!profile.prefers_negotiation) {
        parts.push('User prefers direct content generation — minimize pre-generation questions');
      }
      if (profile.avg_response_detail === 'brief') {
        parts.push('User prefers brief, concise responses');
      } else if (profile.avg_response_detail === 'detailed') {
        parts.push('User prefers detailed, thorough responses');
      }

      if (parts.length > 0) {
        userIntelligenceContext = `\n\n## USER INTELLIGENCE PROFILE\nThese are learned preferences from this user's history. Apply them to ALL responses:\n${parts.join('\n')}`;
        console.log('🧠 Injected User Intelligence Profile');
      }
    } else if (profileResult.status === 'rejected') {
      console.warn('[USER-INTELLIGENCE] Failed to fetch profile (non-blocking):', profileResult.reason);
    }
    systemPrompt += userIntelligenceContext;

    // ===== PHASE 4 FIX 10: Service Status Injection =====
    try {
      const configuredServices = new Set<string>();
      if (apiKeysResult.status === 'fulfilled' && apiKeysResult.value.data) {
        for (const key of apiKeysResult.value.data) {
          configuredServices.add(key.service);
        }
      }
      const connectedPlatforms = new Set<string>();
      if (websiteConnsResult.status === 'fulfilled' && websiteConnsResult.value.data) {
        for (const conn of websiteConnsResult.value.data) {
          if (conn.status === 'active' || conn.status === 'connected') connectedPlatforms.add(conn.platform);
        }
      }
      const unconfigured: string[] = [];
      if (!configuredServices.has('serp') && !configuredServices.has('serpstack') && !configuredServices.has('serpapi')) {
        unconfigured.push('SERP API (needed for keyword research, web search, and content gap analysis)');
      }
      if (!configuredServices.has('resend')) {
        unconfigured.push('Resend (needed for sending emails)');
      }
      if (!connectedPlatforms.has('wordpress') && !connectedPlatforms.has('wp')) {
        unconfigured.push('WordPress (needed for publish_to_website)');
      }
      if (unconfigured.length > 0) {
        systemPrompt += `\n\n## ⚠️ SERVICE STATUS — UNCONFIGURED
The following services are NOT configured for this user. Do NOT promise these capabilities:
${unconfigured.map(s => `- ${s}`).join('\n')}
If the user asks for a feature that requires an unconfigured service, inform them: "This requires [service] to be configured. You can set it up in Settings → API Keys."`;
        console.log(`🔒 Service status: ${unconfigured.length} unconfigured service(s) flagged`);
      }
    } catch (svcErr) {
      console.warn('[SERVICE-STATUS] Failed to check (non-blocking):', svcErr);
    }

    const isContentCreation = /write|create|generate|draft|blog|article|post/i.test(userQuery) && queryIntent.categories?.includes('content');
    const skipNegotiation = /just write|skip questions|don't ask|no questions|quick generate/i.test(userQuery);
    
    if (isContentCreation && !skipNegotiation) {
      systemPrompt += `\n\n## CONTENT CREATION PROTOCOL
Before generating any content, you MUST follow this protocol:
1. **Check Existing Coverage**: Use get_content_items to check if similar content already exists. If it does, mention it and ask if the user wants to update it or create a new angle.
2. **Suggest Best Format**: Based on the topic, suggest the most effective content format (long-form blog, listicle, comparison post, how-to guide, case study). Explain WHY that format would perform better.
3. **Competitor Angle**: If competitor data is available, mention what competitors are covering on this topic and suggest a differentiation angle.
4. **Solution Integration**: Ask if the user wants to naturally integrate any of their solutions/products into the content.
5. **Confirm Before Writing**: Summarize your recommendations and get user confirmation before generating.

EXCEPTION: If the user explicitly says "just write it", "skip questions", or "quick generate", skip this protocol and generate immediately.
Do NOT mention this protocol to the user — just naturally ask the strategic questions.`;
      console.log('🤝 Injected Content Creation Negotiation Protocol');
    }

    // ===== ENHANCEMENT 8: Conversational Multi-Step Workflows =====
    const isMultiStepIntent = /pipeline|full|comprehensive|audit|sweep|review all|analyze everything/i.test(userQuery);
    
    if (isMultiStepIntent) {
      systemPrompt += `\n\n## MULTI-STEP WORKFLOW PROTOCOL
This request requires a multi-step approach. Follow this protocol:
1. **Break Down**: Identify all steps needed to fulfill this request completely.
2. **Execute One Step**: Perform ONLY the first step and present results clearly.
3. **Confirm Before Continuing**: Ask the user "Should I proceed to Step X?" before moving on.
4. **Progressive Depth**: Each step should build on previous findings.

Example flow for "audit my content":
- Step 1: "I'll start by analyzing your content library for gaps and quality scores. Here's what I found: [results]. Ready for Step 2: competitor comparison?"
- Step 2: "Now comparing against competitor coverage. [results]. Ready for Step 3: priority recommendations?"
- Step 3: "Based on the full audit, here are your top 5 priorities with specific action items."

Never try to do everything in one response. Quality over speed.`;
      console.log('🔄 Injected Multi-Step Workflow Protocol');
    }

    // PE Fix 4: Compress data context for simple/summary queries
    if (queryIntent.scope === 'summary' && realDataContext.length > 500) {
      // For summary queries, inject only a compact snapshot
      const snapshotLines = realDataContext.split('\n').filter((l: string) => l.includes(':') || l.includes('—')).slice(0, 10);
      systemPrompt += `\n\n## DATA SNAPSHOT:\n${snapshotLines.join('\n')}`;
      console.log(`📦 Compressed data context: ${realDataContext.length} → ${snapshotLines.join('\n').length} chars`);
    } else {
      systemPrompt += `\n\n## REAL DATA CONTEXT - USE THIS FACTUAL INFORMATION:\n${realDataContext}`;
    }

    // ===== Phase 2 Fix 3a: Conditional thinking instruction based on provider =====
    const isAnthropicProvider = provider.provider === 'anthropic' || (provider.preferred_model || '').toLowerCase().includes('claude');
    const thinkingInstruction = isAnthropicProvider
      ? `🧠 THINKING PROCESS (CRITICAL FORMAT):
• You MUST wrap your reasoning in <think></think> tags
• <think> tags are INTERNAL ONLY - they will be processed separately by the system
• NEVER include <think> tags in your conversational response text
• Structure: <think>your reasoning</think> THEN your user-facing response
• Show your step-by-step analysis process inside <think> tags only
• Users will see thinking in a special UI indicator, not in the main chat
• Example: <think>Let me analyze...</think> then your response.
• NEVER mix <think> tags with conversational text!`
      : `Go straight to your response. Do not use any special thinking tags.`;
    
    systemPrompt = systemPrompt.replace('{THINKING_INSTRUCTION}', thinkingInstruction);

    // ===== PHASE 1 FIX 1: Response Calibration Per Query Complexity =====
    const userMessages = messages.filter((m: any) => m.role === 'user');
    const avgUserMsgLen = userMessages.length > 0 
      ? userMessages.reduce((s: number, m: any) => s + (m.content?.length || 0), 0) / userMessages.length 
      : 100;
    const isUrgent = /fail|error|broken|crash|down|bug|wrong|issue|problem|404|500/i.test(userQuery);
    const isRapidFire = avgUserMsgLen < 50 && userMessages.length >= 3;

    let responseCalibration = '';
    if (isUrgent) {
      responseCalibration = `\n\n🚨 RESPONSE MODE: URGENT
Detected urgency keywords. Rules:
- Under 100 words. Direct answer first, explanation second.
- No charts or visualizations unless explicitly asked.
- End with ONE concrete next step.`;
    } else if (isRapidFire) {
      responseCalibration = `\n\n⚡ RESPONSE MODE: EXECUTION
User is in rapid-fire mode (short, quick messages). Rules:
- Maximum 2-3 sentences per response.
- Execute immediately, confirm briefly.
- Skip preambles, explanations, and "Let me help you with that."
- If unclear, ask ONE clarifying question max.`;
    } else if (queryIntent.scope === 'conversational') {
      responseCalibration = `\n\n💬 RESPONSE MODE: BRIEF
Conversational query. Rules:
- 1-3 sentences max. No charts, no data dumps.
- Be warm and direct. Match the user's energy.`;
    } else if (queryIntent.scope === 'summary') {
      responseCalibration = `\n\n📋 RESPONSE MODE: COMPACT
Summary-level query. Rules:
- Under 150 words. Key metrics in bold inline text.
- Chart ONLY if 3+ comparable data points exist.
- End with 1-2 specific follow-up suggestions.`;
    } else if (queryIntent.scope === 'detailed' || queryIntent.scope === 'full') {
      responseCalibration = `\n\n📊 RESPONSE MODE: THOROUGH
Detailed analysis requested. Rules:
- 300-600 words with charts, metrics, and structured insights.
- Include visualData with summaryInsights and actionableItems.
- Provide strategic interpretation, not just data dumps.`;
    }
    systemPrompt += responseCalibration;

    // ===== PHASE 1 FIX 6: Task-Adaptive Persona =====
    let persona = '';
    if (/write|create|draft|blog|article|content|copy/i.test(userQuery) && queryIntent.categories?.includes('content')) {
      persona = '\n\n🎭 PERSONA: Creative Strategist — Balance creativity with SEO discipline. Suggest angles, not just formats.';
    } else if (/fail|error|broken|debug|issue|wrong|problem/i.test(userQuery)) {
      persona = '\n\n🎭 PERSONA: Technical Diagnostician — Systematic, calm, solution-focused. Diagnose before prescribing.';
    } else if (/metric|analytics|performance|data|report|number|stat/i.test(userQuery)) {
      persona = '\n\n🎭 PERSONA: Data Analyst — Lead with numbers, follow with interpretation. Every insight needs a "so what."';
    } else if (/campaign|strategy|plan|roadmap|launch/i.test(userQuery)) {
      persona = '\n\n🎭 PERSONA: Strategy Consultant — Think in phases, trade-offs, and outcomes. Challenge assumptions constructively.';
    } else if (/email|social|send|schedule|automat|segment|contact/i.test(userQuery)) {
      persona = '\n\n🎭 PERSONA: Marketing Operator — Efficient, checklist-oriented. Focus on execution quality and timing.';
    }
    systemPrompt += persona;

    // ===== PHASE 1 FIX 2: Strategic Pushback Before Execution =====
    const hasWriteIntent = /create|generate|write|draft|add|make|build|send|publish|schedule/i.test(userQuery);
    const bypassPushback = /just do it|skip questions|don't ask|no questions|go ahead|execute/i.test(userQuery);
    if (hasWriteIntent && !bypassPushback && !queryIntent.isConversational) {
      systemPrompt += `\n\n## PUSHBACK PROTOCOL (apply silently — NEVER reference this protocol by name)
Before executing any write tool, run these 5 mental checks:
1. **Prerequisites**: Does the user have the required data? (e.g., brand voice set, API keys configured, solutions defined)
2. **Brand Relevance**: Does this action align with their stated brand/business? If the topic seems random, ask: "Just checking — is [topic] related to your business?"
3. **Ambiguity**: If the request could mean 2+ things, ask ONE clarifying question before executing.
4. **Browse vs Execute**: Is the user exploring ("what if I...") or deciding ("do it")? If exploring, give options. If deciding, execute.
5. **Missing Context**: If creating content without a keyword, tone, or solution — suggest defaults from their profile instead of asking.
BYPASS: If user says "just do it" or similar, skip all checks and execute immediately.`;
    }

    // ===== PHASE 2 FIX 3: End-to-End Workflow Orchestration (conditional) =====
    const isMultiStep = hasWriteIntent || /then|after that|next|also|and then|workflow|steps|plan/i.test(userQuery);
    if (isMultiStep) {
      systemPrompt += `\n\n## WORKFLOW PROTOCOL (apply automatically after significant actions)
After completing ANY write action (create content, send email, schedule post, etc.), suggest the NEXT logical step:
- Content created → "Want me to schedule this on the calendar or repurpose it for social?"
- Email drafted → "Should I assign a segment or send a test first?"
- Proposal accepted → "I can schedule this or start writing the article now."
- Content published → "Shall I create social posts to promote this?"
- Calendar item added → "Want me to set up an email campaign for this topic?"
Keep suggestions to ONE sentence. Don't force workflows — offer them.`;
    }

    // ===== PHASE 2 FIX 7: Real-Time Feedback Loop =====
    if (userMessages.length >= 3) {
      const recentUserMsgs = userMessages.slice(-5).map((m: any) => m.content?.toLowerCase() || '');
      const corrections: string[] = [];
      if (recentUserMsgs.some((m: string) => /shorter|briefer|concise|too long|tldr/i.test(m))) corrections.push('User wants SHORTER responses');
      if (recentUserMsgs.some((m: string) => /more detail|elaborate|expand|longer|deeper/i.test(m))) corrections.push('User wants MORE DETAIL');
      if (recentUserMsgs.some((m: string) => /simpler|plain|easy|less technical|non-technical/i.test(m))) corrections.push('User wants SIMPLER language');
      if (recentUserMsgs.some((m: string) => /more technical|code|specific|exact/i.test(m))) corrections.push('User wants MORE TECHNICAL depth');
      if (recentUserMsgs.some((m: string) => /no|wrong|incorrect|not what i|that's not/i.test(m))) corrections.push('User REJECTED previous response — change approach completely');

      if (corrections.length > 0) {
        systemPrompt += `\n\n## IN-SESSION CORRECTIONS (learned from this conversation)
${corrections.map(c => `- ${c}`).join('\n')}
Apply these adjustments to THIS and ALL subsequent responses in this session.`;
      }
    }

    // ===== PHASE 2 FIX 7b: Edit Mode Detection =====
    const isEditRequest = /make it more|make it less|change the tone|rewrite|rephrase|shorten this|expand this|more formal|more casual|add more|remove the/i.test(userQuery);
    if (isEditRequest) {
      systemPrompt += `\n\n## EDIT MODE
The user wants to MODIFY the previous response, not get a new one. Rules:
- Identify the specific change requested (tone, length, style, content).
- Apply ONLY that change to the previous response.
- Do NOT regenerate from scratch — surgical modification only.
- Show the modified version directly without explaining what you changed.`;
    }

    // ===== PHASE 2 FIX 12: Trade-Off Reasoning =====
    const isComparisonQuery = /\bor\b|versus|vs\b|compare|which.*better|should i|difference between/i.test(userQuery);
    if (isComparisonQuery) {
      systemPrompt += `\n\n## TRADE-OFF REASONING
The user is comparing options. Provide:
1. A structured side-by-side comparison using data when available.
2. Your recommendation with ONE clear reason backed by their data.
3. When executing tools, explain ONE key decision: "I chose [X] because your [data shows Y]."
Never sit on the fence — give a clear recommendation.`;
    }

    // ===== PHASE 4 FIX 11: Fuzzy Content Matching (conditional) =====
    const referencesContent = /my (article|blog|post|content|draft|page)|the one about|update .*(article|blog|post|content)|delete .*(article|blog|post|content)|edit .*(article|blog|post|content)/i.test(userQuery);
    if (referencesContent) {
      systemPrompt += `\n\n## CONTENT MATCHING PROTOCOL
When the user references content by name (e.g., "update my SEO article", "delete the blog about marketing"):
1. Use get_content_items to search for matching content.
2. If 1 match → proceed with the action.
3. If 2-3 matches → list them and ask the user to pick: "I found these matches: [list]. Which one?"
4. If 0 matches → say "I couldn't find content matching '[name]'. Want me to search your full library?"
NEVER guess or assume which content the user means when multiple matches exist.`;
    }

    // ===== PHASE 4 FIX 10: Service Status (injected dynamically above) =====
    // Service status is built from api_keys/website_connections query results

    // ===== PHASE 2 FIX 9b: Session Checkpoint =====
    const totalMessages = messages.length;
    if (totalMessages > 0 && totalMessages % 8 === 0) {
      systemPrompt += `\n\n## SESSION CHECKPOINT (message #${totalMessages})
Before answering the current question, provide a 1-2 sentence progress summary of what was accomplished in this session so far. Format: "📍 **Session progress**: [summary]." Then answer the question normally.`;
    }

    // ===== PHASE 5 FIX 14: Workflow Resumption =====
    if (totalMessages <= 2 && messages.length >= 1) {
      // Check last few messages for function_calls indicating unfinished work
      const recentAssistantMsgs = messages.filter((m: any) => m.role === 'assistant').slice(-3);
      const hasRecentToolCalls = recentAssistantMsgs.some((m: any) => {
        try {
          const content = typeof m.content === 'string' ? m.content : '';
          return content.includes('generate_full_content') || content.includes('launch_content_wizard') || 
                 content.includes('create_content_item') || content.includes('Created "');
        } catch { return false; }
      });
      if (hasRecentToolCalls) {
        systemPrompt += `\n\n## WORKFLOW CONTEXT
Recent messages suggest the user was working on content creation. If their new message seems related, ask: "I see you were working on content earlier. Want to continue where you left off, or start something new?"
Only ask once — if they respond with a new topic, don't ask again.`;
      }
    }

    // ===== FIX 10: Data Reuse from Earlier in Conversation =====
    const recentAssistantContent = messages.filter((m: any) => m.role === 'assistant').slice(-4);
    const hasToolResultsInHistory = recentAssistantContent.some((m: any) => {
      const c = typeof m.content === 'string' ? m.content : '';
      return c.includes('SEO score') || c.includes('word count') || c.includes('proposals') || 
             c.includes('content items') || c.includes('SERP') || c.includes('competitors');
    });
    if (hasToolResultsInHistory && !queryIntent.isConversational) {
      systemPrompt += `\n\n## DATA REUSE
Previous messages in this conversation contain tool results and data. BEFORE calling a tool to re-fetch data:
1. Check if the data is already in this conversation's history.
2. If it is, reference it directly: "Based on the data we looked at earlier..."
3. Only re-fetch if the user explicitly asks for fresh/updated data or the request requires different parameters.`;
    }

    // ===== FIX 13: Long Response Scanability =====
    systemPrompt += `\n\n## FORMATTING
For responses over 200 words: use **H2/H3 headings** for sections, **bold** key numbers and metrics, bullet points for 3+ items. Keep paragraphs to 2-3 sentences max.`;

    // ===== Original length guidance (enhanced) =====
    const lengthGuidance: Record<string, string> = {
      conversational: '', // Handled by responseCalibration above
      summary: '', // Handled by responseCalibration above
      detailed: '', // Handled by responseCalibration above
      full: '' // No constraint for full-depth responses
    };
    systemPrompt += lengthGuidance[queryIntent.scope] || '';

    console.log(`✅ Dynamic system prompt built:
  - Scope: ${queryIntent.scope}
  - Provider: ${provider.provider} (thinking: ${isAnthropicProvider ? 'enabled' : 'disabled'})
  - Modules: ${preliminaryTotal > 20000 ? 'MINIMAL' : 'BASE + conditional modules'}
  - Estimated prompt tokens: ${estimateTokens(systemPrompt)}`);

    // Token budget check BEFORE calling AI (reusing variables from preliminary check)
    const systemPromptTokens = estimateTokens(systemPrompt);
    const totalTokens = contextTokens + messagesTokens + systemPromptTokens;

    // Phase 6: Dynamic token budget -- safe cap for OpenAI models
    const dynamicMaxTokens = Math.min(
      Math.max(4096, Math.floor(totalTokens * 0.3)),
      16000 // Safe cap for OpenAI models (max_tokens limit is 16384)
    );

    console.log(`📊 Token Budget Check:
  - Context: ${contextTokens} tokens
  - Messages: ${messagesTokens} tokens
  - System Prompt: ${systemPromptTokens} tokens
  - Total Input: ${totalTokens} tokens
  - Dynamic Max Output Tokens: ${dynamicMaxTokens}
`);

    // Validate input token limit (120K safe cap)
    const maxInputTokens = 120000;
    if (totalTokens > maxInputTokens) {
      console.error(`🚨 INPUT TOKEN LIMIT EXCEEDED: ${totalTokens} > ${maxInputTokens}`);
      throw new Error(`Context too large (${totalTokens} tokens). Maximum input: ${maxInputTokens.toLocaleString()} tokens. Please reduce context or use more specific queries.`);
    }

    // =========================================================================
    // MAIN PROCESSING — wrapped in doProcessing() for SSE streaming support
    // =========================================================================
    const doProcessing = async (
      emitProgress: (stage: string, message: string) => void
    ): Promise<{ data: any; status: number }> => {

      emitProgress('provider', 'Connecting to AI service...');

    // Initialize tool cache for this request
    const toolCache = new Map<string, { data: any; timestamp: number }>();

    // Determine which tools to use (PE Fix 2: Intent-gated tool filtering)
    let toolsToUse = TOOL_DEFINITIONS; // Default: all tools
    let toolChoice: any = undefined; // Default: let AI decide
    
    // Check if campaign strategy tool is requested
    if (useCampaignStrategyTool) {
      const { CAMPAIGN_STRATEGY_TOOL } = await import('./campaign-strategy-tool.ts');
      toolsToUse = [CAMPAIGN_STRATEGY_TOOL]; // Use only this tool for focused generation
      toolChoice = { type: "function", function: { name: "generate_campaign_strategies" } };
      console.log('🎯 Using campaign strategy tool for structured generation');
    } else {
      // PE Fix 2: Filter tools by intent categories
      const intentCategories = queryIntent.categories || [];
      const categoryToolMap: Record<string, string[]> = {
        'content': ['get_content_items', 'create_content_item', 'update_content_item', 'delete_content_item', 'generate_full_content', 'launch_content_wizard', 'start_content_builder', 'submit_for_review', 'approve_content', 'reject_content'],
        'keywords': ['get_keyword_data', 'get_content_items'],
        'campaigns': ['get_campaigns', 'create_campaign', 'update_campaign', 'get_content_items'],
        'calendar': ['get_calendar_items', 'create_calendar_item', 'update_calendar_item', 'delete_calendar_item'],
        'engage': ['get_contacts', 'create_contact', 'create_email_campaign', 'send_email_campaign', 'create_segment'],
        'analytics': ['get_content_performance', 'get_content_items'],
        'competitors': ['get_competitors', 'get_content_items'],
        'approvals': ['get_approval_queue', 'submit_for_review', 'approve_content', 'reject_content'],
        'brand': ['get_brand_voice', 'update_brand_voice'],
        'social': ['repurpose_for_social', 'get_content_items'],
        'proposals': ['get_proposals', 'get_content_items']
      };

      // Build set of relevant tool names
      const relevantToolNames = new Set<string>();
      // Always include these core tools
      ['get_content_items', 'get_brand_voice', 'generate_full_content', 'launch_content_wizard'].forEach(t => relevantToolNames.add(t));
      
      for (const cat of intentCategories) {
        const tools = categoryToolMap[cat];
        if (tools) tools.forEach(t => relevantToolNames.add(t));
      }
      
      // If we have specific intent categories, filter tools; otherwise use all
      if (intentCategories.length > 0 && intentCategories[0] !== 'general') {
        toolsToUse = TOOL_DEFINITIONS.filter((t: any) => relevantToolNames.has(t.function?.name));
        // Ensure we always have at least 5 tools (safety net)
        if (toolsToUse.length < 5) toolsToUse = TOOL_DEFINITIONS;
        console.log(`🔧 Intent-filtered tools: ${toolsToUse.length}/${TOOL_DEFINITIONS.length} (categories: ${intentCategories.join(', ')})`);
      }

      // Phase 1C: Compress tool descriptions for non-action read-only queries
      // Keep only name + first sentence of description to save ~2000 tokens
      const hasActionCategory = intentCategories.includes('action');
      if (!hasActionCategory && toolsToUse.length > 10) {
        toolsToUse = toolsToUse.map((t: any) => {
          if (!t.function?.description) return t;
          const firstSentence = t.function.description.split(/[.!]\s/)[0] + '.';
          return {
            ...t,
            function: {
              ...t.function,
              description: firstSentence,
            }
          };
        });
        console.log(`📦 Compressed ${toolsToUse.length} tool descriptions (read-only query)`);
      }

      if (queryRequiresToolExecution(queryIntent)) {
        // Fix 1: Force tool_choice for data queries
        toolChoice = "required";
        console.log('🔧 Forcing tool_choice=required for data query (categories:', queryIntent.categories.join(', '), ')');
      }
    }

    // Call ai-proxy edge function with user's provider (including tools) with retry logic
    let aiProxyResult = null;
    let aiProxyError = null;
    const maxRetries = 3;
    
    emitProgress('ai_call', 'Processing with AI...');
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      console.log(`🔄 AI call attempt ${attempt}/${maxRetries}`);
      
      const result = await aiRequestQueue.enqueue(() =>
        supabase.functions.invoke('ai-proxy', {
          body: {
            service: provider.provider,
            endpoint: 'chat',
            apiKey: provider.api_key,
            params: {
              model: selectModelForIntent(provider.preferred_model, queryIntent, /create|generate|write|draft|add|make|build|send|publish|schedule/i.test(userQuery)),
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                ...messages,
              ],
              tools: toolsToUse, // ✅ Use conditional tools
              tool_choice: toolChoice, // ✅ Force campaign tool when requested
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
      return { data: { 
        error: "Failed to get AI response",
        details: typeof aiProxyError === 'string' ? aiProxyError : (aiProxyError?.message || aiProxyResult?.error),
        message: "AI service temporarily unavailable. Please try again in a moment."
      }, status: 500 };
    }

    const data = aiProxyResult.data;
    let aiMessage = data?.choices?.[0]?.message?.content;
    let toolCalls = data?.choices?.[0]?.message?.tool_calls;

    // Declare request-scoped variables for promoted actions and fallback charts
    let requestPromotedActions: any[] = [];
    let requestFallbackChartData: any = null;

    // Helper: generate fallback chart from auto-executed tool results
    const generateFallbackChartFromAutoResults = (results: any[], query: string): any => {
      for (const result of results) {
        try {
          const data = JSON.parse(result.content);
          if (!data || (Array.isArray(data) && data.length === 0)) continue;
          
          if (result.name === 'get_content_items' && Array.isArray(data) && data.length > 0) {
            return {
              type: 'chart', title: 'Content Overview',
              chartConfig: {
                type: 'bar',
                data: data.slice(0, 10).map((c: any) => ({
                  name: (c.title || 'Untitled').substring(0, 30),
                  seoScore: c.seo_score || 0,
                })),
                categories: ['name'],
                series: [{ dataKey: 'seoScore', name: 'SEO Score' }]
              },
              summaryInsights: {
                metricCards: [
                  { id: '1', title: 'Total Content', value: data.length.toString(), icon: 'FileText', color: 'blue' },
                  { id: '2', title: 'Published', value: data.filter((c: any) => c.status === 'published').length.toString(), icon: 'Globe', color: 'green' },
                  { id: '3', title: 'Drafts', value: data.filter((c: any) => c.status === 'draft').length.toString(), icon: 'Edit', color: 'amber' }
                ]
              }
            };
          }
          if (result.name === 'get_keywords' && Array.isArray(data) && data.length > 0) {
            return {
              type: 'chart', title: 'Keywords Overview',
              chartConfig: {
                type: 'bar',
                data: data.slice(0, 10).map((k: any) => ({
                  name: (k.keyword || 'Unknown').substring(0, 25),
                  volume: k.search_volume || 0,
                  difficulty: k.difficulty || 0
                })),
                categories: ['name'],
                series: [{ dataKey: 'volume', name: 'Search Volume' }]
              },
              summaryInsights: {
                metricCards: [
                  { id: '1', title: 'Total Keywords', value: data.length.toString(), icon: 'Search', color: 'blue' },
                  { id: '2', title: 'Avg Volume', value: Math.round(data.reduce((s: number, k: any) => s + (k.search_volume || 0), 0) / data.length).toString(), icon: 'TrendingUp', color: 'green' }
                ]
              }
            };
          }
          if (result.name === 'get_proposals' && Array.isArray(data) && data.length > 0) {
            return {
              type: 'chart', title: 'AI Proposals Overview',
              chartConfig: {
                type: 'bar',
                data: data.slice(0, 10).map((p: any) => ({
                  name: (p.title || 'Untitled').substring(0, 30),
                  impressions: p.estimated_impressions || 0,
                })),
                categories: ['name'],
                series: [{ dataKey: 'impressions', name: 'Est. Impressions' }]
              },
              summaryInsights: {
                metricCards: [
                  { id: '1', title: 'Total Proposals', value: data.length.toString(), icon: 'FileText', color: 'blue' },
                  { id: '2', title: 'Available', value: data.filter((p: any) => p.status === 'available').length.toString(), icon: 'CheckCircle', color: 'green' }
                ]
              }
            };
          }
        } catch (_) { /* skip */ }
      }
      return null;
    };

    // Fix 2: RETRY with forced tool_choice if data query got no tool_calls
    // =========================================================================
    if ((!toolCalls || toolCalls.length === 0) && queryRequiresToolExecution(queryIntent) && !useCampaignStrategyTool) {
      console.log('⚠️ Data query returned text-only response without tool_calls. Retrying with tool_choice=required...');
      emitProgress('retry', 'Refining response...');
      
      const retryResult = await aiRequestQueue.enqueue(() =>
        supabase.functions.invoke('ai-proxy', {
          body: {
            service: provider.provider,
            endpoint: 'chat',
            apiKey: provider.api_key,
            params: {
              model: selectModelForIntent(provider.preferred_model, queryIntent, /create|generate|write|draft|add|make|build|send|publish|schedule/i.test(userQuery)),
              messages: [
                { role: "system", content: systemPrompt },
                ...messages,
              ],
              tools: toolsToUse,
              tool_choice: "required",
              temperature: 0.5, // Lower temp for more deterministic tool calls
              max_tokens: dynamicMaxTokens,
            }
          }
        })
      );
      
      if (!retryResult.error && retryResult.data?.success) {
        const retryData = retryResult.data.data;
        const retryToolCalls = retryData?.choices?.[0]?.message?.tool_calls;
        if (retryToolCalls && retryToolCalls.length > 0) {
          console.log(`✅ Retry succeeded: got ${retryToolCalls.length} tool calls`);
          toolCalls = retryToolCalls;
          // Update the data reference so tool results flow correctly
          aiProxyResult.data.data = retryData;
          aiMessage = retryData?.choices?.[0]?.message?.content;
        } else {
          console.warn('⚠️ Retry also returned no tool_calls. Falling back to auto-execute...');
        }
      } else {
        console.warn('⚠️ Retry AI call failed:', retryResult.error);
      }
    }

    // =========================================================================
    // Fix 3: AUTO-EXECUTE tools based on intent when LLM completely fails
    // =========================================================================
    if ((!toolCalls || toolCalls.length === 0) && queryRequiresToolExecution(queryIntent) && !useCampaignStrategyTool) {
      console.log('🔧 Auto-executing tools based on intent categories:', queryIntent.categories);
      
      const categoryToTool: Record<string, { name: string; args: Record<string, any> }> = {
        'content': { name: 'get_content_items', args: {} },
        'keywords': { name: 'get_keywords', args: {} },
        'proposals': { name: 'get_proposals', args: {} },
        'solutions': { name: 'get_solutions', args: {} },
        'seo': { name: 'get_seo_scores', args: {} },
        'campaigns': { name: 'get_campaign_intelligence', args: {} },
        'competitors': { name: 'get_competitors', args: {} },
        'performance': { name: 'get_content_items', args: {} },
        'approvals': { name: 'get_pending_approvals', args: {} },
        'calendar': { name: 'get_calendar_items', args: {} },
        'engage': { name: 'get_engage_contacts', args: {} },
        'social': { name: 'get_social_posts', args: {} },
        'templates': { name: 'get_email_templates', args: {} },
        'topic_clusters': { name: 'get_topic_clusters', args: {} },
        'content_gaps': { name: 'get_content_gaps', args: {} },
        'recommendations': { name: 'get_strategy_recommendations', args: {} },
        'brand_voice': { name: 'get_brand_voice', args: {} },
        'content_performance': { name: 'get_content_performance', args: {} },
      };
      
      // Execute the most relevant tool(s)
      const autoToolResults: any[] = [];
      const executedTools: string[] = [];
      
      for (const category of queryIntent.categories) {
        const toolMapping = categoryToTool[category];
        if (toolMapping && !executedTools.includes(toolMapping.name)) {
          try {
            console.log(`[AUTO-TOOL] Executing ${toolMapping.name} for category: ${category}`);
            const toolData = await executeToolCall(toolMapping.name, toolMapping.args, supabase, user.id, new Map(), conversationId);
            autoToolResults.push({
              tool_call_id: `auto-${category}-${Date.now()}`,
              role: "tool",
              name: toolMapping.name,
              content: JSON.stringify(toolData)
            });
            executedTools.push(toolMapping.name);
            console.log(`[AUTO-TOOL] ${toolMapping.name} returned ${Array.isArray(toolData) ? toolData.length : 'N/A'} items`);
          } catch (e) {
            console.warn(`[AUTO-TOOL] ${toolMapping.name} failed:`, e);
          }
          // Limit to 2 auto-executed tools to prevent overload
          if (executedTools.length >= 2) break;
        }
      }
      
      // If we got auto-tool results, call AI again with them injected
      if (autoToolResults.length > 0) {
        console.log(`🔧 Calling AI with ${autoToolResults.length} auto-executed tool results`);
        emitProgress('tools', 'Fetching your data...');
        
        // Build synthetic tool_calls message for the AI
        const syntheticToolCallMessage = {
          role: "assistant",
          content: null,
          tool_calls: autoToolResults.map((r, i) => ({
            id: r.tool_call_id,
            type: "function",
            function: {
              name: r.name,
              arguments: "{}"
            }
          }))
        };
        
        const autoResult = await supabase.functions.invoke('ai-proxy', {
          body: {
            service: provider.provider,
            endpoint: 'chat',
            apiKey: provider.api_key,
            params: {
              model: selectModelForIntent(provider.preferred_model, queryIntent, /create|generate|write|draft|add|make|build|send|publish|schedule/i.test(userQuery)),
              messages: [
                { role: "system", content: systemPrompt },
                ...messages,
                syntheticToolCallMessage,
                ...autoToolResults
              ],
              temperature: 0.7,
              max_tokens: dynamicMaxTokens,
            }
          }
        });
        
        if (!autoResult.error && autoResult.data?.success) {
          aiMessage = autoResult.data.data?.choices?.[0]?.message?.content;
          toolCalls = null; // Already handled
          console.log(`✅ Auto-execute response received (${aiMessage?.length || 0} chars)`);
          
          // Generate fallback charts from auto-tool results
          const autoFallbackChart = generateFallbackChartFromAutoResults(autoToolResults, userQuery);
          if (autoFallbackChart) {
            requestFallbackChartData = autoFallbackChart;
          }
        }
      }
    }

    // ✅ Handle tool calls if AI requested them
    // Destructive tools that require user confirmation
    const DESTRUCTIVE_TOOLS = [
      'delete_content_item', 'delete_solution',
      'send_email_campaign', 'send_quick_email',
      'toggle_automation', 'activate_journey',
      'delete_contact', 'delete_segment',
      'delete_email_campaign', 'delete_journey',
      'delete_automation', 'delete_social_post',
      'delete_calendar_item', 'publish_to_website'
    ];

    let requestPromotedVisualData: any = null;

    // Tool-aware progress messages with time estimates
    const TOOL_TIME_ESTIMATES: Record<string, string> = {
      generate_full_content: 'Generating article (~20-30s)...',
      create_content_item: 'Creating content item (~5s)...',
      update_content_item: 'Updating content (~5s)...',
      delete_content_item: 'Deleting content...',
      get_content_items: 'Searching your content library...',
      serp_analysis: 'Running SERP analysis (~10s)...',
      analyze_serp: 'Running SERP analysis (~10s)...',
      get_serp_data: 'Fetching search data (~10s)...',
      analyze_content_gap: 'Analyzing content gaps (~15s)...',
      launch_content_wizard: 'Opening content wizard...',
      schedule_content: 'Scheduling content...',
      create_calendar_item: 'Adding to calendar...',
      send_email_campaign: 'Preparing email campaign...',
      send_quick_email: 'Preparing email...',
      get_strategy_proposals: 'Fetching strategy proposals...',
      create_social_post: 'Creating social post...',
      repurpose_content: 'Repurposing content (~15s)...',
      compare_content: 'Comparing content items...',
    };

    if (toolCalls && toolCalls.length > 0) {
      const firstToolName = toolCalls[0]?.function?.name || '';
      const progressMsg = TOOL_TIME_ESTIMATES[firstToolName] || `Executing ${toolCalls.length > 1 ? toolCalls.length + ' actions' : 'action'}...`;
      emitProgress('tools', progressMsg);
      console.log(`🔧 AI requested ${toolCalls.length} tool calls`);
      
      const toolResults = [];
      const toolExecutionStart = Date.now();
      
      for (const toolCall of toolCalls) {
        const toolName = toolCall.function.name;
        const toolArgs = JSON.parse(toolCall.function.arguments);
        const toolStart = Date.now();
        
        console.log(`[TOOL] ${toolName} | user: ${user.id} | params:`, toolArgs);

        // Check if this is a destructive action needing confirmation
        // The user can bypass by including "CONFIRMED:" prefix in their message
        const userMessage = messages[messages.length - 1]?.content || '';
        const isConfirmed = userMessage.startsWith('CONFIRMED:');
        
        if (DESTRUCTIVE_TOOLS.includes(toolName) && !isConfirmed) {
          console.log(`[TOOL] ${toolName} | BLOCKED - requires user confirmation`);
          toolResults.push({
            tool_call_id: toolCall.id,
            role: "tool",
            name: toolName,
            content: JSON.stringify({
              requires_confirmation: true,
              action: toolName,
              args: toolArgs,
              message: `This action (${toolName}) requires your confirmation before executing. Please confirm to proceed.`
            })
          });
          continue;
        }
        
        try {
          const toolData = await executeToolCall(toolName, toolArgs, supabase, user.id, toolCache, conversationId);
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
      
      // =============================================================================
      // PROMOTE EMBEDDED NAVIGATION/CONFIRM ACTIONS FROM TOOL RESULTS
      // =============================================================================
      const promotedActions: any[] = [];
      for (const result of toolResults) {
        try {
          const parsed = JSON.parse(result.content);
          // Promote navigation actions from tool results
          if (parsed?.action?.type === 'navigate' && parsed?.action?.url) {
            promotedActions.push({
              id: `tool-nav-${Date.now()}`,
              label: parsed.action.label || 'Open',
              type: 'button',
              action: 'navigate',
              data: { url: parsed.action.url, payload: parsed.action.payload || {} }
            });
          }
          // Promote confirmation actions from destructive tool guards
          if (parsed?.requires_confirmation) {
            promotedActions.push({
              id: `confirm-${Date.now()}`,
              label: `Confirm: ${parsed.action || 'action'}`,
              type: 'button',
              action: 'confirm_action',
              data: { action: parsed.action, args: parsed.args || {} }
            });
          }
          // Promote visualData from tool results (e.g., launch_content_wizard)
          // Always overwrite so repeat requests show the choice card again
          if (parsed?.visualData) {
            requestPromotedVisualData = parsed.visualData;
            console.log('📊 Promoted visualData from tool result:', parsed.visualData.type);
          }
        } catch (_e) { /* not JSON, skip */ }
      }
      // Store promoted actions in request-scoped variable (no globalThis)
      if (promotedActions.length > 0) {
        requestPromotedActions = promotedActions;
        console.log(`🎯 Promoted ${promotedActions.length} actions from tool results`);
      }
      
      // Call AI again with tool results
      emitProgress('final', 'Generating your response...');
      console.log(`🔧 Calling AI again with ${toolResults.length} tool results`);
      
      let secondCallResult = null;
      let secondCallError = null;
      const maxRetriesPhase2 = 3;
      
      // Use the latest data reference (may have been updated by retry path)
      const latestData = aiProxyResult.data.data || aiProxyResult.data;
      const toolCallsMessage = latestData?.choices?.[0]?.message;

      for (let attempt = 1; attempt <= maxRetriesPhase2; attempt++) {
        const result = await supabase.functions.invoke('ai-proxy', {
          body: {
            service: provider.provider,
            endpoint: 'chat',
            apiKey: provider.api_key,
            params: {
              model: selectModelForIntent(provider.preferred_model, queryIntent, /create|generate|write|draft|add|make|build|send|publish|schedule/i.test(userQuery)),
              messages: [
                {
                  role: "system",
                  content: systemPrompt,
                },
                ...messages,
                toolCallsMessage, // Use latest (possibly retried) AI message with tool_calls
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
          console.warn(`⏰ Rate limit hit on second call, attempt ${attempt}/${maxRetriesPhase2}`);
          if (attempt < maxRetriesPhase2) {
            const waitTime = 5000 * attempt;
            console.log(`⏳ Waiting ${waitTime}ms before retry...`);
            await new Promise(r => setTimeout(r, waitTime));
            continue;
          }
        } else if (attempt < maxRetriesPhase2) {
          await new Promise(r => setTimeout(r, 2000 * attempt));
        }
      }
      
      if (secondCallError || !secondCallResult?.success) {
        console.error("❌ Second AI call failed after tools:", secondCallError);
        throw new Error("Second AI call failed after tool execution");
      }
      
      aiMessage = secondCallResult.data?.choices?.[0]?.message?.content;
      console.log(`✅ Received final AI response after tool execution (${aiMessage?.length || 0} chars)`);
      
      // =============================================================================
      // FIX: FALLBACK CHART GENERATION FROM TOOL RESULTS
      // =============================================================================
      // If AI didn't generate visualData, create charts from tool results automatically
      // Reuse the same function used by auto-execute path
      const fallbackChartData = generateFallbackChartFromAutoResults(toolResults, userQuery);
      if (fallbackChartData) {
        console.log('📊 Generated fallback chart from tool results - will use if AI response lacks visualData');
      }
      
      // Attach to scope for later access
      requestFallbackChartData = fallbackChartData;
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
      return { data: { 
        error: "No response content received",
        message: "The AI service returned an empty response. Please try rephrasing your question or try again in a moment.",
        details: "Empty AI response"
      }, status: 500 };
    }

    console.log(`📝 AI Response received (${aiMessage.length} characters)`);
    console.log("🔍 Response preview:", aiMessage.substring(0, 300));
    
    // ✅ CRITICAL: Bypass JSON parser for strategy generation
    if (use_case === 'strategy') {
      console.log('📋 Strategy use case detected - returning raw JSON response');
      return { data: {
        response: aiMessage,
        content: aiMessage,
        metadata: {
          processed_at: new Date().toISOString(),
          use_case: 'strategy',
          bypass_json_parser: true
        }
      }, status: 200 };
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
    if (visualData && visualData.type !== 'chart' && visualData.type !== 'content_wizard' && visualData.type !== 'content_creation_choice' && visualData.type !== 'proposal_browser' && visualData.type !== 'content_repurpose' && visualData.type !== 'repository' && visualData.type !== 'approvals' && chartRequest.type !== 'table_explicit') {
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
    
    if (needsDataRecovery) {
      console.warn('⚠️ Empty visualization detected — fallback chart generation will handle this downstream');
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

    // =============================================================================
    // FIX: USE FALLBACK CHART DATA IF AI DIDN'T GENERATE VISUALDATA
    // =============================================================================
    // Promoted tool visualData takes priority (e.g., content_wizard)
    if (!visualData && requestPromotedVisualData) {
      console.log('📊 Using promoted visualData from tool result');
      visualData = requestPromotedVisualData;
    }
    
    if (!visualData && requestFallbackChartData) {
      console.log('📊 AI response lacks visualData - injecting fallback chart from tool results');
      visualData = requestFallbackChartData;
    }
    
    // Only provide basic contextual actions if AI didn't return structured data
    // NO MOCK DATA GENERATION - Let the AI create appropriate responses based on real data
    if (!actions && !visualData) {
      console.log("⚠️ No structured data returned from AI - providing basic navigation only");
      
      actions = [{
        id: "explore-dashboard",
        label: "View Dashboard",
        type: "button", 
        action: "navigate:/ai-chat",
        data: {}
      }];
    } else if (!actions && visualData) {
      // If we have visualData but no actions, generate contextual actions
      console.log("📊 VisualData present but no actions - generating contextual actions");
      
      const actionsFromVisualData = visualData.actionableItems || [];
      if (actionsFromVisualData.length > 0) {
        actions = actionsFromVisualData.map((item: any) => ({
          id: item.id || `action-${Math.random().toString(36).substr(2, 9)}`,
          label: item.title || item.label,
          type: "button",
          action: item.actionType === 'navigate' ? `navigate:${item.targetUrl}` : item.actionType,
          data: item
        }));
      }
    }

    console.log(`✅ Parsed response: { hasActions: ${!!actions}, hasVisualData: ${!!visualData}, messageLength: ${cleanedResponse?.length || aiMessage.length} }`);

    // Validate response before sending
    const finalContent = cleanedResponse || aiMessage;
    if (!finalContent || finalContent.trim().length === 0) {
      console.error("❌ Empty clean content after processing");
      return { data: {
        error: "No response content received",
        message: "Failed to process AI response properly. Please try again.",
        details: "Empty content after processing"
      }, status: 500 };
    }

    // Access allVisualData from scope (includes expanded multi-perspective charts)
    const allCharts = typeof allVisualData !== 'undefined' && allVisualData.length > 1 ? allVisualData : undefined;
    
    // Merge promoted tool actions into response actions (request-scoped, no globalThis)
    if (requestPromotedActions.length > 0) {
      actions = [...(actions || []), ...requestPromotedActions];
      console.log(`🎯 Merged ${requestPromotedActions.length} promoted tool actions into response`);
    }
    
    // Build analystContext when analyst mode is active
    let analystContext: any = undefined;
    if (context?.analystActive) {
      try {
        const analyticsInsights: string[] = [];
        
        // Pull lightweight platform stats for analyst enrichment
        const platformFetches: Promise<void>[] = [];
        const platformStats: Record<string, number> = {};

        // Core stats
        platformFetches.push((async () => {
          const { count } = await supabase.from('content_items').select('id', { count: 'exact', head: true }).eq('user_id', userId);
          if (count !== null) { platformStats['totalContent'] = count; analyticsInsights.push(`You have ${count} content items in your repository`); }
        })());
        platformFetches.push((async () => {
          const { count } = await supabase.from('campaigns').select('id', { count: 'exact', head: true }).eq('user_id', userId);
          if (count !== null) { platformStats['totalCampaigns'] = count; analyticsInsights.push(`${count} campaigns tracked`); }
        })());
        platformFetches.push((async () => {
          const { count } = await supabase.from('ai_strategy_proposals').select('id', { count: 'exact', head: true }).eq('user_id', userId);
          if (count !== null) { platformStats['totalProposals'] = count; analyticsInsights.push(`${count} strategy proposals available`); }
        })());

        // Email stats (engage_email_campaigns)
        platformFetches.push((async () => {
          try {
            // Get user's workspace for proper filtering
            const { data: wsData } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).maybeSingle();
            const analystWorkspaceId = wsData?.workspace_id;
            const emailQuery = analystWorkspaceId 
              ? supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).eq('workspace_id', analystWorkspaceId)
              : supabase.from('email_campaigns').select('id', { count: 'exact', head: true }).eq('user_id', userId);
            const { count } = await emailQuery;
            if (count !== null && count > 0) { platformStats['totalEmailCampaigns'] = count; analyticsInsights.push(`${count} email campaigns in Engage`); }
          } catch (_) { /* table may not exist */ }
        })());

        // Competitor stats
        platformFetches.push((async () => {
          const { count } = await supabase.from('company_competitors').select('id', { count: 'exact', head: true }).eq('user_id', userId);
          if (count !== null && count > 0) { platformStats['totalCompetitors'] = count; analyticsInsights.push(`${count} competitors tracked`); }
        })());

        await Promise.all(platformFetches);

        // Build analyst context object
        analystContext = {
          insights: analyticsInsights.length > 0 ? analyticsInsights : undefined,
          platformStats: Object.keys(platformStats).length > 0 ? platformStats : undefined,
        };

        // Attach web search results if available (webSearchContext is set earlier in the pipeline)
        if (typeof webSearchContext === 'string' && webSearchContext.length > 0) {
          // Re-parse from the webResults variable captured in the web search path
          // We store the raw results in a closure-accessible variable
          try {
            // webResults was captured in the web search block above - we need to hoist it
            // Since webSearchContext exists, we know the search succeeded
            // Extract structured data from the context string for the frontend
            const searchQuery = serpIntelligence?.keywords?.join(' ') || userQuery;
            const contextLines = webSearchContext.split('\n').filter((l: string) => l.trim());
            const searchResults: Array<{title: string; url: string; snippet: string; position: number}> = [];
            
            let currentResult: any = null;
            for (const line of contextLines) {
              const titleMatch = line.match(/^(\d+)\.\s+(.+)/);
              const urlMatch = line.match(/^\s+URL:\s+(.+)/);
              const snippetMatch = line.match(/^\s+(?:Summary|Snippet):\s+(.+)/);
              
              if (titleMatch) {
                if (currentResult) searchResults.push(currentResult);
                currentResult = { title: titleMatch[2], url: '', snippet: '', position: parseInt(titleMatch[1]) };
              } else if (urlMatch && currentResult) {
                currentResult.url = urlMatch[1];
              } else if (snippetMatch && currentResult) {
                currentResult.snippet = snippetMatch[1];
              }
            }
            if (currentResult) searchResults.push(currentResult);

            if (searchResults.length > 0) {
              analystContext.webSearchResults = {
                query: searchQuery,
                results: searchResults,
              };
              console.log(`🌐 Analyst context enriched with ${searchResults.length} web search results`);
            }
          } catch (wsErr) {
            console.error('Web search results parsing for analyst failed (non-critical):', wsErr);
          }
        }

        console.log(`📊 Analyst context enriched with ${analyticsInsights.length} insights`);
      } catch (acErr) {
        console.error('Analyst context enrichment failed (non-critical):', acErr);
      }
    }

    // ===== Phase 8A: Token Usage Logging (non-blocking) =====
    try {
      const usageData = aiProxyResult?.data?.usage || aiProxyResult?.data?.choices?.[0]?.usage || {};
      const promptTokens = usageData.prompt_tokens || 0;
      const completionTokens = usageData.completion_tokens || 0;
      const totalTokensUsed = usageData.total_tokens || (promptTokens + completionTokens);
      const modelUsed = selectModelForIntent(provider.preferred_model, queryIntent, /create|generate|write|draft|add|make|build|send|publish|schedule/i.test(userQuery));
      
      if (totalTokensUsed > 0 || promptTokens > 0) {
        const costPerMToken: Record<string, { input: number; output: number }> = {
          'gpt-4o': { input: 2.5, output: 10 },
          'gpt-4o-mini': { input: 0.15, output: 0.6 },
          'gpt-4': { input: 30, output: 60 },
          'gpt-4-turbo': { input: 10, output: 30 },
          'claude-3-5-sonnet-20241022': { input: 3, output: 15 },
          'claude-3-5-haiku-20241022': { input: 0.8, output: 4 },
          'gemini-2.0-flash-exp': { input: 0.1, output: 0.4 },
          'gemini-1.5-pro': { input: 1.25, output: 5 },
        };
        const rates = costPerMToken[modelUsed] || { input: 1, output: 3 };
        const estimatedCost = (promptTokens * rates.input + completionTokens * rates.output) / 1_000_000;

        supabase.from('llm_usage_logs').insert({
          user_id: user.id,
          provider: provider.provider,
          model: modelUsed,
          prompt_tokens: promptTokens,
          completion_tokens: completionTokens,
          total_tokens: totalTokensUsed,
          cost_estimate: estimatedCost,
          success: true,
        }).then(({ error }) => {
          if (error) console.warn('Token usage log failed:', error.message);
          else console.log(`📊 Logged ${totalTokensUsed} tokens (~$${estimatedCost.toFixed(6)}) for ${modelUsed}`);
        });
      }
    } catch (logErr) {
      console.warn('Token usage logging error (non-critical):', logErr);
    }

    const responseData = {
      message: finalContent,
      content: finalContent,
      actions: actions || undefined,
      visualData: visualData || undefined,
      allVisualData: allCharts,
      serpData: serpData || undefined,
      insights: aiInsights.length > 0 ? aiInsights : undefined,
      analystContext: analystContext || undefined,
      metadata: {
        processed_at: new Date().toISOString(),
        has_actions: !!actions,
        has_visual_data: !!visualData,
        visual_data_count: allCharts ? allCharts.length : (visualData ? 1 : 0),
        has_serp_data: !!serpData,
        insights_generated: aiInsights.length,
        serp_keywords: serpData?.keywords || [],
        has_analyst_context: !!analystContext,
      }
    };

    // 5% chance: non-blocking rebuild of user intelligence profile
    if (Math.random() < 0.05) {
      console.log('🧠 Triggering 5% profile rebuild...');
      try {
        const rebuildUrl = `${Deno.env.get('SUPABASE_URL')}/functions/v1/aggregate-user-intelligence`;
        fetch(rebuildUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
          },
          body: JSON.stringify({ user_id: userId })
        }).catch(e => console.error('Profile rebuild fire-and-forget error:', e));
      } catch (e) {
        console.error('Profile rebuild trigger error (non-critical):', e);
      }
    }

    return { data: responseData, status: 200 };

    }; // end doProcessing

    // =========================================================================
    // RESPONSE DISPATCH — SSE stream vs JSON
    // =========================================================================
    if (streamMode) {
      const enc = new TextEncoder();
      const readable = new ReadableStream({
        async start(controller) {
          const emit = (evt: string, d: any) => {
            try { controller.enqueue(enc.encode(`event: ${evt}\ndata: ${JSON.stringify(d)}\n\n`)); } catch {}
          };
          try {
            const result = await doProcessing((stage, msg) => emit('progress', { stage, message: msg }));
            emit(result.status >= 400 ? 'error' : 'done', result.data);
          } catch (error) {
            emit('error', { 
              error: 'Internal server error',
              message: error instanceof Error ? error.message : 'Unknown error',
              deployVersion: DEPLOY_VERSION
            });
          }
          controller.close();
        }
      });
      return new Response(readable, { 
        headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' } 
      });
    } else {
      const result = await doProcessing(() => {});
      return new Response(JSON.stringify(result.data), {
        status: result.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

  } catch (error) {
    console.error("❌ Error in enhanced AI chat:", error);
    console.error("Error details:", error instanceof Error ? error.message : String(error));
    
    return new Response(JSON.stringify({ 
      error: "Internal server error",
      message: "An unexpected error occurred while processing your request. Please try again.",
      details: error instanceof Error ? error.message : "Unknown error",
      deployVersion: DEPLOY_VERSION
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});