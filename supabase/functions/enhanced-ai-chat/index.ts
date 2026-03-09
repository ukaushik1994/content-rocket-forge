// Force redeploy: 2025-01-15T14:00:00Z - Removed xhr polyfill, using npm: imports
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { z } from "npm:zod@3.22.4";
import { extractJSONBlocks, removeExtractedJSON } from './json-parser.ts';
import { analyzeQueryIntent } from './query-analyzer.ts';
import { createClient } from "npm:@supabase/supabase-js@2.39.6";
import { TOOL_DEFINITIONS, executeToolCall } from './tools.ts';
import { CAMPAIGN_STRATEGY_TOOL } from './campaign-strategy-tool.ts';
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

// Token estimation (inlined from shared to avoid cross-folder import issues)
function estimateTokens(text: string): number {
  if (!text) return 0;
  return Math.ceil(text.length / 4);
}

// =============================================================================
// PROMPT MODULES (inlined from shared/prompt-modules.ts to avoid cross-folder imports)
// =============================================================================

// Base prompt (always included) - ~1,000 tokens
const BASE_PROMPT = `You are an enterprise AI assistant for content strategy with comprehensive expertise in data analysis, workflow automation, and business intelligence.

🧠 THINKING PROCESS (CRITICAL FORMAT):
• You MUST wrap your reasoning in <think></think> tags
• <think> tags are INTERNAL ONLY - they will be processed separately by the system
• NEVER include <think> tags in your conversational response text
• Structure: <think>your reasoning</think> THEN your user-facing response
• Show your step-by-step analysis process inside <think> tags only
• Users will see thinking in a special UI indicator, not in the main chat
• Example CORRECT format:
  <think>
  Let me analyze the user's request...
  1. They're asking about keyword performance
  2. I need to check the REAL DATA CONTEXT for keyword data
  3. I'll create a bar chart to visualize the comparison
  </think>
  
  ## Keyword Performance Analysis
  Based on your keyword data, here's what I found...
  
• Example WRONG format (DO NOT DO THIS):
  Here's my analysis <think>reasoning</think> of your data...
  ^^ NEVER mix <think> tags with conversational text!

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

🎯 VISUAL-FIRST MANDATE:
Your responses must be HIGHLY VISUAL by default. For ANY data-related query:
✅ ALWAYS include visualData with charts (even for simple questions)
✅ ALWAYS include 2-4 metric cards showing key statistics
✅ ALWAYS include 2-5 actionable items with navigation links
✅ ALWAYS include 2-3 insights (AI observations)
✅ ALWAYS include 2-3 deepDivePrompts (smart follow-up questions)

Example: User asks "How many proposals do I have?"
❌ WRONG: "You have 7 proposals."
✅ CORRECT: Chart showing proposals by status + metric cards (total, completion rate) + actions (review drafts, create new) + insights (5 ready to send) + follow-ups (which has best SEO score?)

Make every response a mini-dashboard, not just text.

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
        "targetUrl": "/content",
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
   - Explain what's needed for complete insights`;

// Tool usage module with dynamic counts - ~600 tokens
const TOOL_USAGE_MODULE = `
🔧 TOOL-BASED ARCHITECTURE (CRITICAL):

You have access to specialized tools to fetch AND act on data. Use them smartly:

**Available Data Summary:**
• Content Items: {contentCount} pieces ({draftCount} drafts, {publishedCount} published)
• AI Proposals: {proposalCount} strategies  
• Keywords: {keywordCount} tracked
• Solutions: {solutionCount} offerings
• Active Campaigns: {activeCampaignCount} running
• Queue Status: {pendingQueueCount} pending, {completedQueueCount} completed, {failedQueueCount} failed

**📖 READ Tools (Fetch Data):**
- get_content_items, get_keywords, get_proposals, get_solutions, get_seo_scores, get_serp_analysis
- get_competitors, get_competitor_solutions
- get_campaign_intelligence, get_queue_status, get_campaign_content
- get_engage_contacts, get_engage_segments, get_engage_journeys, get_engage_automations, get_engage_email_campaigns

**✏️ WRITE Tools (Take Actions):**
Content: create_content_item, update_content_item, delete_content_item, generate_full_content, start_content_builder, launch_content_wizard
Approvals: submit_for_review, approve_content, reject_content
Keywords: add_keywords, remove_keywords, trigger_serp_analysis, trigger_content_gap_analysis, create_topic_cluster
Offerings: create_solution, update_solution, delete_solution, update_company_info, add_competitor, update_competitor, trigger_competitor_analysis
Engage: create_contact, update_contact, tag_contacts, create_segment, create_email_campaign, send_email_campaign, create_journey, activate_journey, create_automation, toggle_automation, enroll_contacts_in_journey, send_quick_email, delete_contact, delete_segment, delete_email_campaign, delete_journey, delete_automation, delete_social_post
Cross-Module: promote_content_to_campaign, content_to_email, campaign_content_to_engage, repurpose_for_social, publish_to_website, schedule_social_from_repurpose
Social: create_social_post

**Campaign Tools:** trigger_content_generation, retry_failed_content

**When to Use Write Tools:**
- User explicitly asks to create, add, update, edit, delete, remove, send, publish, schedule, approve, reject
- User says "generate an article about X" → generate_full_content
- User says "add contact john@example.com" → create_contact
- User says "email this content to VIP contacts" → content_to_email
- User says "create a segment of active users" → create_segment
- User says "repurpose for social" → repurpose_for_social

**Important:** Always check counts above first. If a count is 0, inform the user no data exists rather than calling the tool. For write operations, confirm the action with the user in your response.

{proactiveInsights}
`;

// Platform Knowledge module - comprehensive understanding of the entire platform
const PLATFORM_KNOWLEDGE_MODULE = `
🏗️ PLATFORM ARCHITECTURE & MODULE KNOWLEDGE:

You are the AI brain of **creAIter** — an end-to-end AI-powered content marketing platform.

## 📦 MODULES OVERVIEW

### 1. Offerings Hub (/solutions)
Central intelligence repository for products/services. Each offering stores: target_audience, pain_points[], use_cases[], features[], benefits[], unique_value_propositions[], pricing{}, technical_specs{}, case_studies[], competitive_positioning.
**Cross-module:** Selecting an offering auto-fills content briefs (audience, tone, specific points) via mapOfferingToBrief(). Campaigns auto-populate strategy context. Strategy proposals link to offerings.

### 2. Content Wizard (AI Chat Sidebar)
Guided creation. Blog formats: 5-step (Topic→Research→Outline→Config→Generate). Quick formats (social, email, ad): 2-step. Offerings auto-fill brief fields. "Defaults set from [Offering]" badge confirms auto-fill.

### 3. Content Builder (/content-builder)
Full editor with SEO analysis, brief config, SERP metrics. Same offering auto-fill as Wizard via mapOfferingToBrief().

### 4. Content Repository (/content)
All content stored here. Status management (draft/published/archived), SEO scores, approval workflows, repurposing.

### 5. Campaigns (/campaigns)
Idea → AI strategies with briefs → Select → Generate via content_generation_queue → Track real-time → Active. Offerings pre-populate strategy context.

### 6. Strategy Engine (/strategy)
SERP-driven keyword strategies and proposals. Proposals link to offerings/competitors. Calendar scheduling auto-updates proposal status.

### 7. Keywords & SERP (/keywords)
Position tracking, search volume, difficulty, People Also Ask, content gap analysis. Feeds Strategy and Wizard research.

### 8. Competitors (/competitors)
Profiles, solution discovery (auto-scrapes websites), SWOT analysis. Informs strategy competitive angles.

### 9. Brand Guidelines (/brand)
Colors, fonts, tone, personality, do/don't phrases. Injected into content generation for consistent voice.

### 10. Engage CRM (/engage)
Contacts, segments, email campaigns, journeys, automations, AI scoring. Team workspace model.

## 🔗 KEY PIPELINES
- **Offering → Content**: Offering data → mapOfferingToBrief() → Brief → AI generation with full context → Repository
- **Offering → Campaign**: Offering → auto-fill strategy → AI briefs → queue → Repository → Campaign active
- **Strategy → Calendar → Content**: SERP → Proposals → Calendar (auto-schedules) → Builder/Wizard → Repository (auto-completes)
- **Onboarding**: Website URL → AI scraper → company_info + solutions + brand_guidelines
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
  useCampaignStrategyTool: z.boolean().optional()
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
    // TOOL-BASED APPROACH: Fetch counts + new Phase 3 context data
    console.log('📊 Fetching data counts with Phase 3 enhancements...');
    
    // Parallel fetch all counts for efficiency
    const [
      contentResult,
      proposalResult,
      keywordResult,
      solutionResult,
      competitorResult,
      competitorSolutionResult,
      // Phase 3 additions
      campaignResult,
      queueResult,
      draftContentResult,
      publishedContentResult,
      recentContentResult,
      // Phase 4: Engage module counts
      engageWorkspaceResult
    ] = await Promise.all([
      supabase.from('content_items').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('ai_strategy_proposals').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('keywords').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('solutions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('company_competitors').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      supabase.from('competitor_solutions').select('*', { count: 'exact', head: true }).eq('user_id', userId),
      // Phase 3: Campaign counts
      supabase.from('campaigns').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'active'),
      // Phase 3: Queue status counts
      supabase.from('content_generation_queue').select('status').eq('user_id', userId),
      // Phase 3: Content by status
      supabase.from('content_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'draft'),
      supabase.from('content_items').select('*', { count: 'exact', head: true }).eq('user_id', userId).eq('status', 'published'),
      // Phase 3: Recent activity
      supabase.from('content_items').select('title, created_at').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      // Phase 4: Engage workspace
      supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).maybeSingle()
    ]);

    const contentCount = contentResult.count || 0;
    const proposalCount = proposalResult.count || 0;
    const keywordCount = keywordResult.count || 0;
    const solutionCount = solutionResult.count || 0;
    const competitorCount = competitorResult.count || 0;
    const competitorSolutionCount = competitorSolutionResult.count || 0;
    const activeCampaignCount = campaignResult.count || 0;
    const draftCount = draftContentResult.count || 0;
    const publishedCount = publishedContentResult.count || 0;
    
    // Calculate queue status counts
    const queueItems = queueResult.data || [];
    const pendingQueueCount = queueItems.filter(i => i.status === 'pending').length;
    const processingQueueCount = queueItems.filter(i => i.status === 'processing').length;
    const completedQueueCount = queueItems.filter(i => i.status === 'completed').length;
    const failedQueueCount = queueItems.filter(i => i.status === 'failed').length;
    
    // Recent content for activity context
    const recentContent = recentContentResult.data || [];
    const recentActivitySection = recentContent.length > 0
      ? `\n## Recent Activity:\n${recentContent.map(c => `• "${c.title}" (${new Date(c.created_at).toLocaleDateString()})`).join('\n')}`
      : '';

    // Phase 4: Engage module counts
    const engageWorkspaceId = engageWorkspaceResult.data?.workspace_id || null;
    let engageContactCount = 0, engageSegmentCount = 0, engageJourneyCount = 0, engageAutomationCount = 0, engageEmailCampaignCount = 0;
    
    if (engageWorkspaceId) {
      const [contactsR, segmentsR, journeysR, automationsR, emailCampaignsR] = await Promise.all([
        supabase.from('engage_contacts').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
        supabase.from('engage_segments').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
        supabase.from('engage_journeys').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
        supabase.from('engage_automations').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
        supabase.from('engage_email_campaigns').select('*', { count: 'exact', head: true }).eq('workspace_id', engageWorkspaceId),
      ]);
      engageContactCount = contactsR.count || 0;
      engageSegmentCount = segmentsR.count || 0;
      engageJourneyCount = journeysR.count || 0;
      engageAutomationCount = automationsR.count || 0;
      engageEmailCampaignCount = emailCampaignsR.count || 0;
    }

    // Build minimal context string with enhanced stats
    const contextString = `
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

## How to Access Detailed Data:

You have access to 18 powerful tools to fetch exactly the data you need:

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
- User: "How is my campaign doing?" → Call get_campaign_intelligence with campaign_name
- User: "What's failing in my queue?" → Call get_queue_status
- User: "Retry failed items" → Call retry_failed_content
- User: "How many contacts do I have?" → Call get_engage_contacts with limit=1 (use totalCount)
- User: "Show my audience segments" → Call get_engage_segments
- User: "What journeys are active?" → Call get_engage_journeys with status="active"
- User: "Show email campaign performance" → Call get_engage_email_campaigns with status="sent"
- User: "What automations are running?" → Call get_engage_automations with is_active=true

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
      contextString,
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

    const { messages, context, useCampaignStrategyTool } = validationResult.data;
    const use_case = context?.use_case; // Extract use_case from context
    console.log("🚀 Processing enhanced AI chat request for user:", user.id, use_case ? `(use_case: ${use_case})` : '', useCampaignStrategyTool ? '(Campaign Strategy Tool)' : '');

    // ✅ NEW: Analyze query intent BEFORE fetching context
    const userQuery = messages[messages.length - 1]?.content || '';
    console.log('🎯 Analyzing query intent...');
    const queryIntent = analyzeQueryIntent(userQuery);
    console.log(`📊 Intent Analysis:`, {
      scope: queryIntent.scope,
      categories: queryIntent.categories,
      estimatedTokens: queryIntent.estimatedTokens,
      confidence: queryIntent.confidence,
      isConversational: queryIntent.isConversational
    });
    
    // ⚡ ISSUE #5 FIX: Fast-path for conversational queries (greetings, thanks, test, etc.)
    if (queryIntent.isConversational) {
      console.log('⚡ FAST-PATH: Conversational query detected - skipping heavy processing');
      
      // Simple conversational response without data fetching or chart generation
      const conversationalResponse = generateConversationalResponse(userQuery);
      
      return new Response(JSON.stringify({
        message: conversationalResponse,
        content: conversationalResponse,
        fastPath: true,
        queryType: 'conversational',
        metadata: {
          processed_at: new Date().toISOString(),
          has_actions: false,
          has_visual_data: false
        }
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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
        
        return new Response(JSON.stringify({
          choices: [{
            message: {
              tool_calls: toolCalls
            }
          }]
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Fallback if no tool call (shouldn't happen)
      console.error('🎯❌ No tool call in campaign strategy response');
      console.error('🎯 Response data:', JSON.stringify(data, null, 2));
      return new Response(JSON.stringify({ 
        error: 'Failed to generate campaign strategies',
        details: 'AI did not return a tool call',
        response: data
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }

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
    // Fetch real data from database using tiered context (Phase 3 enhanced)
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
      
      // Add platform knowledge for comprehensive understanding
      systemPrompt += '\n\n' + PLATFORM_KNOWLEDGE_MODULE;
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
    
    // Inject real data context
    systemPrompt += `\n\n## REAL DATA CONTEXT - USE THIS FACTUAL INFORMATION:\n${realDataContext}`;
    
    console.log(`✅ Dynamic system prompt built:
  - Scope: ${queryIntent.scope}
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


    // Initialize tool cache for this request
    const toolCache = new Map<string, { data: any; timestamp: number }>();

    // Determine which tools to use
    let toolsToUse = TOOL_DEFINITIONS; // Default tools
    let toolChoice: any = undefined; // Default: let AI decide
    
    // Check if campaign strategy tool is requested
    if (useCampaignStrategyTool) {
      const { CAMPAIGN_STRATEGY_TOOL } = await import('./campaign-strategy-tool.ts');
      toolsToUse = [CAMPAIGN_STRATEGY_TOOL]; // Use only this tool for focused generation
      toolChoice = { type: "function", function: { name: "generate_campaign_strategies" } };
      console.log('🎯 Using campaign strategy tool for structured generation');
    }

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
    // Destructive tools that require user confirmation
    const DESTRUCTIVE_TOOLS = [
      'delete_content_item', 'delete_solution',
      'send_email_campaign', 'send_quick_email',
      'toggle_automation', 'activate_journey'
    ];

    let requestPromotedActions: any[] = [];
    let requestFallbackChartData: any = null;
    let requestPromotedVisualData: any = null;

    if (toolCalls && toolCalls.length > 0) {
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
      
      // =============================================================================
      // FIX: FALLBACK CHART GENERATION FROM TOOL RESULTS
      // =============================================================================
      // If AI didn't generate visualData, create charts from tool results automatically
      const generateFallbackChartFromToolResults = (results: any[], userQuery: string): any => {
        // Parse tool results
        for (const result of results) {
          try {
            const data = JSON.parse(result.content);
            const toolName = result.name;
            
            // Skip empty results
            if (!data || (Array.isArray(data) && data.length === 0)) continue;
            
            console.log(`📊 Generating fallback chart from ${toolName} tool (${Array.isArray(data) ? data.length : 1} items)`);
            
            // Generate chart based on tool type
            if (toolName === 'get_proposals' && Array.isArray(data) && data.length > 0) {
              return {
                type: 'chart',
                title: 'AI Strategy Proposals Analysis',
                chartConfig: {
                  type: 'bar',
                  data: data.slice(0, 10).map((p: any) => ({
                    name: (p.title || 'Untitled').substring(0, 35),
                    impressions: p.estimated_impressions || 0,
                    status: p.status || 'draft'
                  })),
                  categories: ['name'],
                  series: [{ dataKey: 'impressions', name: 'Est. Impressions' }]
                },
                summaryInsights: {
                  metricCards: [
                    { id: '1', title: 'Total Proposals', value: data.length.toString(), icon: 'FileText', color: 'blue' },
                    { id: '2', title: 'Avg Impressions', value: Math.round(data.reduce((s: number, p: any) => s + (p.estimated_impressions || 0), 0) / data.length).toLocaleString(), icon: 'TrendingUp', color: 'green' },
                    { id: '3', title: 'Available', value: data.filter((p: any) => p.status === 'available').length.toString(), icon: 'CheckCircle', color: 'emerald' }
                  ],
                  bulletPoints: [
                    `${data.length} total AI strategy proposals in your database`,
                    `Top proposal: "${(data[0]?.title || 'N/A').substring(0, 40)}" with ${(data[0]?.estimated_impressions || 0).toLocaleString()} est. impressions`,
                    data.filter((p: any) => p.status === 'available').length > 0 
                      ? `${data.filter((p: any) => p.status === 'available').length} proposals ready for action`
                      : 'Consider scheduling proposals for content generation'
                  ]
                },
                actionableItems: [
                  { id: '1', title: 'View Strategy Proposals', actionType: 'navigate', targetUrl: '/content-strategy', icon: 'FileText' },
                  { id: '2', title: 'Create New Strategy', actionType: 'navigate', targetUrl: '/content-strategy?new=true', icon: 'Plus' }
                ],
                deepDivePrompts: [
                  'Which proposal has the best potential?',
                  'Show me proposals by content type',
                  'What keywords are these proposals targeting?'
                ]
              };
            }
            
            if (toolName === 'get_content_items' && Array.isArray(data) && data.length > 0) {
              return {
                type: 'chart',
                title: 'Content Performance Overview',
                chartConfig: {
                  type: 'bar',
                  data: data.slice(0, 10).map((c: any) => ({
                    name: (c.title || 'Untitled').substring(0, 30),
                    seoScore: c.seo_score || 0,
                    wordCount: c.word_count || 0
                  })),
                  categories: ['name'],
                  series: [{ dataKey: 'seoScore', name: 'SEO Score' }]
                },
                summaryInsights: {
                  metricCards: [
                    { id: '1', title: 'Total Content', value: data.length.toString(), icon: 'FileText', color: 'blue' },
                    { id: '2', title: 'Avg SEO Score', value: Math.round(data.reduce((s: number, c: any) => s + (c.seo_score || 0), 0) / data.length).toString(), icon: 'Search', color: 'amber' },
                    { id: '3', title: 'Published', value: data.filter((c: any) => c.status === 'published').length.toString(), icon: 'Globe', color: 'green' }
                  ]
                },
                actionableItems: [
                  { id: '1', title: 'View All Content', actionType: 'navigate', targetUrl: '/content', icon: 'FileText' },
                  { id: '2', title: 'Create New Content', actionType: 'navigate', targetUrl: '/content-builder', icon: 'Plus' }
                ]
              };
            }
            
            if (toolName === 'get_campaign_intelligence' && data) {
              const campaigns = Array.isArray(data) ? data : [data];
              if (campaigns.length > 0 && campaigns[0].campaign) {
                return {
                  type: 'chart',
                  title: 'Campaign Intelligence Dashboard',
                  chartConfig: {
                    type: 'bar',
                    data: campaigns.slice(0, 5).map((c: any) => ({
                      name: (c.campaign?.name || 'Campaign').substring(0, 25),
                      completed: c.queueStatus?.completed || 0,
                      pending: c.queueStatus?.pending || 0,
                      failed: c.queueStatus?.failed || 0
                    })),
                    categories: ['name'],
                    series: [
                      { dataKey: 'completed', name: 'Completed' },
                      { dataKey: 'pending', name: 'Pending' }
                    ]
                  },
                  summaryInsights: {
                    metricCards: [
                      { id: '1', title: 'Active Campaigns', value: campaigns.length.toString(), icon: 'Zap', color: 'purple' },
                      { id: '2', title: 'Content Generated', value: campaigns.reduce((s: number, c: any) => s + (c.queueStatus?.completed || 0), 0).toString(), icon: 'CheckCircle', color: 'green' },
                      { id: '3', title: 'Queue Pending', value: campaigns.reduce((s: number, c: any) => s + (c.queueStatus?.pending || 0), 0).toString(), icon: 'Clock', color: 'amber' }
                    ]
                  },
                  actionableItems: [
                    { id: '1', title: 'View Campaigns', actionType: 'navigate', targetUrl: '/campaigns', icon: 'Zap' }
                  ]
                };
              }
            }
            
          } catch (e) {
            console.warn('Failed to parse tool result for chart generation:', e);
          }
        }
        return null;
      };
      
      // Store fallback chart data for later use
      const fallbackChartData = generateFallbackChartFromToolResults(toolResults, userQuery);
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
    if (visualData && visualData.type !== 'chart' && visualData.type !== 'content_wizard' && visualData.type !== 'content_creation_choice' && visualData.type !== 'proposal_browser' && chartRequest.type !== 'table_explicit') {
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
    
    // Merge promoted tool actions into response actions (request-scoped, no globalThis)
    if (requestPromotedActions.length > 0) {
      actions = [...(actions || []), ...requestPromotedActions];
      console.log(`🎯 Merged ${requestPromotedActions.length} promoted tool actions into response`);
    }
    
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