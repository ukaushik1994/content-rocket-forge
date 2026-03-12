/**
 * Tool Functions for AI Function Calling
 * Provides data fetching, campaign intelligence, and action tools for AI
 */

import { 
  CAMPAIGN_INTELLIGENCE_TOOL_DEFINITIONS, 
  executeCampaignIntelligenceTool 
} from './campaign-intelligence-tool.ts';

import {
  ENGAGE_TOOL_DEFINITIONS,
  ENGAGE_TOOL_NAMES,
  executeEngageIntelligenceTool
} from './engage-intelligence-tool.ts';

import {
  CONTENT_ACTION_TOOL_DEFINITIONS,
  CONTENT_ACTION_TOOL_NAMES,
  executeContentActionTool
} from './content-action-tools.ts';

import {
  KEYWORD_ACTION_TOOL_DEFINITIONS,
  KEYWORD_ACTION_TOOL_NAMES,
  executeKeywordActionTool
} from './keyword-action-tools.ts';

import {
  OFFERINGS_ACTION_TOOL_DEFINITIONS,
  OFFERINGS_ACTION_TOOL_NAMES,
  executeOfferingsActionTool
} from './offerings-action-tools.ts';

import {
  ENGAGE_ACTION_TOOL_DEFINITIONS,
  ENGAGE_ACTION_TOOL_NAMES,
  executeEngageActionTool
} from './engage-action-tools.ts';

import {
  CROSS_MODULE_TOOL_DEFINITIONS,
  CROSS_MODULE_TOOL_NAMES,
  executeCrossModuleTool
} from './cross-module-tools.ts';

import {
  PROPOSAL_ACTION_TOOL_DEFINITIONS,
  PROPOSAL_ACTION_TOOL_NAMES,
  executeProposalActionTool
} from './proposal-action-tools.ts';

import {
  STRATEGY_ACTION_TOOL_DEFINITIONS,
  STRATEGY_ACTION_TOOL_NAMES,
  executeStrategyActionTool
} from './strategy-action-tools.ts';

const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Core data tools
const CORE_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_content_items",
      description: "Fetch user's content items with optional filtering by status, SEO score range, content type, or date range. Use this when user asks about their content, articles, or posts.",
      parameters: {
        type: "object",
        properties: {
          status: { 
            type: "string", 
            enum: ["draft", "published", "archived"],
            description: "Filter by content status"
          },
          min_seo_score: { 
            type: "number",
            description: "Minimum SEO score (0-100)"
          },
          max_seo_score: { 
            type: "number",
            description: "Maximum SEO score (0-100)"
          },
          content_type: { 
            type: "string",
            description: "Filter by content type (e.g., 'blog', 'article', 'video')"
          },
          limit: { 
            type: "number", 
            default: 10,
            description: "Number of items to return (default 10, max 50)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_keywords",
      description: "Fetch keyword research data with optional filtering by volume or difficulty. Use when user asks about keywords, search terms, or SEO opportunities.",
      parameters: {
        type: "object",
        properties: {
          min_volume: { 
            type: "number",
            description: "Minimum search volume"
          },
          max_difficulty: { 
            type: "number",
            description: "Maximum keyword difficulty (0-100)"
          },
          limit: { 
            type: "number", 
            default: 10,
            description: "Number of keywords to return (default 10, max 50)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_proposals",
      description: "Fetch AI strategy proposals with filtering by status, priority, estimated impressions. Use when user asks about content opportunities, proposals, or strategy suggestions.",
      parameters: {
        type: "object",
        properties: {
          status: { 
            type: "string", 
            enum: ["available", "scheduled", "completed"],
            description: "Filter by proposal status"
          },
          priority_tag: { 
            type: "string",
            description: "Filter by priority (e.g., 'high', 'quick-win', 'evergreen')"
          },
          min_impressions: { 
            type: "number",
            description: "Minimum estimated impressions"
          },
          limit: { 
            type: "number", 
            default: 10,
            description: "Number of proposals to return (default 10, max 50)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_solutions",
      description: "Fetch solutions/products data including features, benefits, pain points, target audience, use cases, pricing, and technical specs. Use when user asks about their products, services, offerings, or solutions.",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Search by offering/product name (case-insensitive partial match)"
          },
          limit: { 
            type: "number", 
            default: 5,
            description: "Number of solutions to return (default 5, max 20)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_seo_scores",
      description: "Fetch SEO content scores and performance metrics. Use when user asks about SEO performance, scores, or optimization.",
      parameters: {
        type: "object",
        properties: {
          content_id: { 
            type: "string",
            description: "Specific content ID to fetch scores for"
          },
          limit: { 
            type: "number", 
            default: 10,
            description: "Number of scores to return (default 10, max 50)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_serp_analysis",
      description: "Fetch SERP analysis data for keywords (always fetches fresh data, no cache). Use when user asks about search results, competition, or SERP features.",
      parameters: {
        type: "object",
        properties: {
          keyword: { 
            type: "string",
            description: "Specific keyword to analyze"
          },
          limit: { 
            type: "number", 
            default: 5,
            description: "Number of SERP records to return (default 5, max 20)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_competitors",
      description: "Fetch competitor profiles with market position, SWOT analysis, intelligence data, and overview. Use when user asks about competitors, competitive landscape, market analysis, competitor strengths/weaknesses, or competitive intelligence.",
      parameters: {
        type: "object",
        properties: {
          competitor_name: { 
            type: "string",
            description: "Filter by specific competitor name (case-insensitive partial match)"
          },
          market_position: { 
            type: "string",
            description: "Filter by market position (e.g., 'Market Leader', 'Challenger', 'Niche Player')"
          },
          include_intelligence: { 
            type: "boolean",
            default: true,
            description: "Include intelligence_data, overview, swot_analysis fields (default: true)"
          },
          include_solutions: { 
            type: "boolean",
            default: false,
            description: "Include nested competitor_solutions data (default: false)"
          },
          limit: { 
            type: "number", 
            default: 10,
            description: "Number of competitors to return (default 10, max 50)"
          }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_competitor_solutions",
      description: "Fetch competitor products/services with features, pricing, positioning, and technical specs. Use when user asks about competitor offerings, product comparisons, feature analysis, competitor pricing, or technical specifications.",
      parameters: {
        type: "object",
        properties: {
          competitor_id: { 
            type: "string",
            description: "Filter by specific competitor UUID"
          },
          competitor_name: { 
            type: "string",
            description: "Filter by competitor name (case-insensitive partial match)"
          },
          category: { 
            type: "string",
            description: "Filter by product category (e.g., 'Software', 'Service', 'Platform')"
          },
          include_pricing: { 
            type: "boolean",
            default: true,
            description: "Include pricing information (default: true)"
          },
          include_technical_specs: { 
            type: "boolean",
            default: true,
            description: "Include technical specifications and integrations (default: true)"
          },
          limit: { 
            type: "number", 
            default: 10,
            description: "Number of solutions to return (default 10, max 50)"
          }
        }
      }
    }
  },
  // === NEW READ TOOLS: Calendar, Glossary, Approvals, Social, Templates, Clusters, Gaps, Recommendations, Repurposed, Email Threads, Activity ===
  {
    type: "function",
    function: {
      name: "get_calendar_items",
      description: "Fetch editorial calendar items with optional date range and status filtering. Use when user asks about schedule, calendar, upcoming content, deadlines, or planned content.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["planned", "in_progress", "completed", "cancelled"], description: "Filter by status" },
          from_date: { type: "string", description: "Start date (ISO format) for date range filter" },
          to_date: { type: "string", description: "End date (ISO format) for date range filter" },
          limit: { type: "number", default: 20, description: "Number of items to return (default 20, max 50)" }
        }
      }
    }
  },
  // glossary read tool removed — feature deprecated
  {
    type: "function",
    function: {
      name: "get_pending_approvals",
      description: "Fetch content items pending approval review. Use when user asks about pending reviews, approval queue, what needs review, or content waiting for approval.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["pending_review", "approved", "rejected", "needs_changes"], description: "Filter by approval status (default: pending_review)" },
          limit: { type: "number", default: 20, description: "Number of items to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_social_posts",
      description: "Fetch social media posts with status and scheduling info. Use when user asks about social posts, scheduled posts, social media calendar, or social content.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["draft", "scheduled", "published", "failed"], description: "Filter by post status" },
          limit: { type: "number", default: 20, description: "Number of posts to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_email_templates",
      description: "Fetch email templates. Use when user asks about templates, email templates, newsletter templates, or reusable emails.",
      parameters: {
        type: "object",
        properties: {
          category: { type: "string", description: "Filter by template category (e.g., newsletter, transactional, marketing)" },
          limit: { type: "number", default: 20, description: "Number of templates to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_topic_clusters",
      description: "Fetch topic clusters with performance data. Use when user asks about topic clusters, pillar content, topical authority, or content clusters.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", default: 20, description: "Number of clusters to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_content_gaps",
      description: "Fetch identified content gaps and opportunities. Use when user asks about content gaps, missing topics, content opportunities, or what competitors cover.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter by gap status (e.g., identified, in_progress, resolved)" },
          limit: { type: "number", default: 20, description: "Number of gaps to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_strategy_recommendations",
      description: "Fetch strategy recommendations. Use when user asks about recommendations, strategy suggestions, what should I do next, or strategic advice.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", description: "Filter by status (e.g., pending, accepted, completed)" },
          priority: { type: "string", description: "Filter by priority (e.g., high, medium, low)" },
          limit: { type: "number", default: 20, description: "Number of recommendations to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_repurposed_content",
      description: "Fetch repurposed content versions. Use when user asks about repurposed content, content variations, format versions, or content in different formats.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "Filter by source content ID" },
          format_code: { type: "string", description: "Filter by format (e.g., social-twitter, email, ad)" },
          limit: { type: "number", default: 20, description: "Number of items to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_email_threads",
      description: "Fetch email inbox threads. Use when user asks about email inbox, recent emails, email threads, or messages.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["open", "closed", "archived"], description: "Filter by thread status" },
          limit: { type: "number", default: 20, description: "Number of threads to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_activity_log",
      description: "Fetch recent workspace activity events. Use when user asks about recent activity, what happened, audit trail, event log, or workspace history.",
      parameters: {
        type: "object",
        properties: {
          channel: { type: "string", description: "Filter by channel (e.g., email, social, automation)" },
          limit: { type: "number", default: 30, description: "Number of events to return" }
        }
      }
    }
  },
  // Company info read tool
  {
    type: "function",
    function: {
      name: "get_company_info",
      description: "Fetch the user's company/business information including name, description, industry, website, mission, and values. Use when user asks about their company, business info, organization details, or 'who are we'.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

// Campaign intelligence tools (imported from dedicated module)
const CAMPAIGN_TOOLS = CAMPAIGN_INTELLIGENCE_TOOL_DEFINITIONS;

// Engage intelligence tools (imported from dedicated module)
const ENGAGE_TOOLS = ENGAGE_TOOL_DEFINITIONS;

// Export combined tool definitions (READ + WRITE tools)
export const TOOL_DEFINITIONS = [
  ...CORE_TOOL_DEFINITIONS,
  ...CAMPAIGN_TOOLS,
  ...ENGAGE_TOOLS,
  ...CONTENT_ACTION_TOOL_DEFINITIONS,
  ...KEYWORD_ACTION_TOOL_DEFINITIONS,
  ...OFFERINGS_ACTION_TOOL_DEFINITIONS,
  ...ENGAGE_ACTION_TOOL_DEFINITIONS,
  ...CROSS_MODULE_TOOL_DEFINITIONS
];

// List of campaign tool names for routing
const CAMPAIGN_TOOL_NAMES = [
  'get_campaign_intelligence',
  'get_queue_status',
  'get_campaign_content',
  'trigger_content_generation',
  'retry_failed_content'
];

// New read tool names for routing
const NEW_READ_TOOL_NAMES = [
  'get_calendar_items', 'get_pending_approvals',
  'get_social_posts', 'get_email_templates', 'get_topic_clusters',
  'get_content_gaps', 'get_strategy_recommendations', 'get_repurposed_content',
  'get_email_threads', 'get_activity_log', 'get_company_info'
];

// Write tool names that should trigger cache invalidation
const WRITE_TOOL_CACHE_INVALIDATION: Record<string, string[]> = {
  // Content actions invalidate content reads
  create_content_item: ['get_content_items', 'get_seo_scores'],
  update_content_item: ['get_content_items', 'get_seo_scores'],
  delete_content_item: ['get_content_items', 'get_seo_scores'],
  submit_for_review: ['get_content_items', 'get_pending_approvals'],
  approve_content: ['get_content_items', 'get_pending_approvals'],
  reject_content: ['get_content_items', 'get_pending_approvals'],
  generate_full_content: ['get_content_items', 'get_seo_scores'],
  // Calendar actions
  create_calendar_item: ['get_calendar_items'],
  update_calendar_item: ['get_calendar_items'],
  delete_calendar_item: ['get_calendar_items'],
  // Glossary removed
  // Email template actions
  create_email_template: ['get_email_templates'],
  // Keyword actions invalidate keyword reads
  add_keywords: ['get_keywords'],
  remove_keywords: ['get_keywords'],
  trigger_serp_analysis: ['get_serp_analysis'],
  create_topic_cluster: ['get_keywords', 'get_topic_clusters'],
  // Offerings actions invalidate solution/competitor reads
  create_solution: ['get_solutions'],
  update_solution: ['get_solutions'],
  delete_solution: ['get_solutions'],
  update_company_info: [],
  add_competitor: ['get_competitors', 'get_competitor_solutions'],
  update_competitor: ['get_competitors'],
  trigger_competitor_analysis: ['get_competitors'],
  // Engage actions invalidate engage reads
  create_contact: ['get_engage_contacts'],
  update_contact: ['get_engage_contacts'],
  tag_contacts: ['get_engage_contacts'],
  create_segment: ['get_engage_segments'],
  create_email_campaign: ['get_engage_email_campaigns'],
  send_email_campaign: ['get_engage_email_campaigns'],
  create_journey: ['get_engage_journeys'],
  activate_journey: ['get_engage_journeys'],
  create_automation: ['get_engage_automations'],
  toggle_automation: ['get_engage_automations'],
  // Cross-module
  promote_content_to_campaign: ['get_campaign_intelligence', 'get_content_items'],
  content_to_email: ['get_engage_email_campaigns'],
  campaign_content_to_engage: ['get_engage_email_campaigns'],
  repurpose_for_social: ['get_repurposed_content'],
  // Publishing & social
  publish_to_website: ['get_content_items'],
  create_social_post: ['get_social_posts'],
  schedule_social_from_repurpose: ['get_social_posts'],
  enroll_contacts_in_journey: ['get_engage_journeys'],
  send_quick_email: [],
  trigger_content_gap_analysis: ['get_keywords', 'get_content_items', 'get_content_gaps'],
  start_content_builder: [],
  launch_content_wizard: [],
  // Delete tools
  delete_contact: ['get_engage_contacts'],
  delete_segment: ['get_engage_segments'],
  delete_email_campaign: ['get_engage_email_campaigns'],
  delete_journey: ['get_engage_journeys'],
  delete_automation: ['get_engage_automations'],
  delete_social_post: ['get_social_posts'],
};

/**
 * Invalidate cache entries for related read tools after a write operation
 */
function invalidateCacheForWrite(
  toolName: string,
  userId: string,
  cache: Map<string, { data: any; timestamp: number }>
) {
  const toolsToInvalidate = WRITE_TOOL_CACHE_INVALIDATION[toolName];
  if (!toolsToInvalidate || toolsToInvalidate.length === 0) return;

  let invalidated = 0;
  for (const key of cache.keys()) {
    for (const readTool of toolsToInvalidate) {
      if (key.startsWith(`${readTool}:${userId}:`)) {
        cache.delete(key);
        invalidated++;
      }
    }
  }
  if (invalidated > 0) {
    console.log(`[CACHE] Invalidated ${invalidated} entries after ${toolName}`);
  }
}

/**
 * Execute a tool call with caching support
 */
export async function executeToolCall(
  toolName: string,
  toolArgs: any,
  supabase: any,
  userId: string,
  cache: Map<string, { data: any; timestamp: number }>
): Promise<any> {
  const executionStart = Date.now();
  console.log(`[TOOL] executeToolCall | tool: ${toolName} | user: ${userId}`);
  
  // Check cache (except for serp_analysis which is always fresh)
  if (toolName !== 'get_serp_analysis') {
    const cacheKey = `${toolName}:${userId}:${JSON.stringify(toolArgs)}`;
    const cached = cache.get(cacheKey);
    
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      const cacheAge = Math.round((Date.now() - cached.timestamp) / 1000);
      console.log(`[TOOL] ${toolName} | cache: HIT | age: ${cacheAge}s`);
      return cached.data;
    } else {
      console.log(`[TOOL] ${toolName} | cache: MISS`);
    }
  } else {
    console.log(`[TOOL] ${toolName} | cache: SKIP (always fresh)`);
  }
  
  // Wrap in try-catch with timeout
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Tool execution timeout (10s)')), 10000)
  );
  
  let result;
  
  try {
    result = await Promise.race([
      (async () => {
        // Route campaign tools to dedicated handler
        if (CAMPAIGN_TOOL_NAMES.includes(toolName)) {
          console.log(`[TOOL] ${toolName} | Routing to campaign intelligence handler`);
          const campaignResult = await executeCampaignIntelligenceTool(toolName, toolArgs, supabase, userId);
          return { data: campaignResult, error: null };
        }
        
        // Route engage tools to dedicated handler
        if (ENGAGE_TOOL_NAMES.includes(toolName)) {
          console.log(`[TOOL] ${toolName} | Routing to engage intelligence handler`);
          const engageResult = await executeEngageIntelligenceTool(toolName, toolArgs, supabase, userId);
          return { data: engageResult, error: null };
        }

        // Route content action tools
        if (CONTENT_ACTION_TOOL_NAMES.includes(toolName)) {
          console.log(`[TOOL] ${toolName} | Routing to content action handler`);
          const result = await executeContentActionTool(toolName, toolArgs, supabase, userId);
          return { data: result, error: null };
        }

        // Route keyword action tools
        if (KEYWORD_ACTION_TOOL_NAMES.includes(toolName)) {
          console.log(`[TOOL] ${toolName} | Routing to keyword action handler`);
          const result = await executeKeywordActionTool(toolName, toolArgs, supabase, userId);
          return { data: result, error: null };
        }

        // Route offerings action tools
        if (OFFERINGS_ACTION_TOOL_NAMES.includes(toolName)) {
          console.log(`[TOOL] ${toolName} | Routing to offerings action handler`);
          const result = await executeOfferingsActionTool(toolName, toolArgs, supabase, userId);
          return { data: result, error: null };
        }

        // Route engage action tools
        if (ENGAGE_ACTION_TOOL_NAMES.includes(toolName)) {
          console.log(`[TOOL] ${toolName} | Routing to engage action handler`);
          const result = await executeEngageActionTool(toolName, toolArgs, supabase, userId);
          return { data: result, error: null };
        }

        // Route cross-module tools
        if (CROSS_MODULE_TOOL_NAMES.includes(toolName)) {
          console.log(`[TOOL] ${toolName} | Routing to cross-module handler`);
          const result = await executeCrossModuleTool(toolName, toolArgs, supabase, userId);
          return { data: result, error: null };
        }
        
        switch (toolName) {
          case 'get_content_items': {
            let query = supabase
              .from('content_items')
              .select('id, title, status, created_at, seo_score, content_type, metadata, campaign_id')
              .eq('user_id', userId);
            
            if (toolArgs.status) query = query.eq('status', toolArgs.status);
            if (toolArgs.min_seo_score) query = query.gte('seo_score', toolArgs.min_seo_score);
            if (toolArgs.max_seo_score) query = query.lte('seo_score', toolArgs.max_seo_score);
            if (toolArgs.content_type) query = query.eq('content_type', toolArgs.content_type);
            
            return await query
              .order('created_at', { ascending: false })
              .limit(Math.min(toolArgs.limit || 10, 50));
          }
            
          case 'get_keywords': {
            let kwQuery = supabase
              .from('keywords')
              .select('keyword, volume, difficulty, created_at')
              .eq('user_id', userId);
            
            if (toolArgs.min_volume) kwQuery = kwQuery.gte('volume', toolArgs.min_volume);
            if (toolArgs.max_difficulty) kwQuery = kwQuery.lte('difficulty', toolArgs.max_difficulty);
            
            return await kwQuery
              .order('volume', { ascending: false })
              .limit(Math.min(toolArgs.limit || 10, 50));
          }
            
          case 'get_proposals': {
            let propQuery = supabase
              .from('ai_strategy_proposals')
              .select('id, title, primary_keyword, description, status, priority_tag, estimated_impressions, content_type, created_at')
              .eq('user_id', userId);
            
            if (toolArgs.status) propQuery = propQuery.eq('status', toolArgs.status);
            if (toolArgs.priority_tag) propQuery = propQuery.eq('priority_tag', toolArgs.priority_tag);
            if (toolArgs.min_impressions) propQuery = propQuery.gte('estimated_impressions', toolArgs.min_impressions);
            
            return await propQuery
              .order('estimated_impressions', { ascending: false })
              .limit(Math.min(toolArgs.limit || 10, 50));
          }
            
          case 'get_solutions': {
            let solQuery = supabase
              .from('solutions')
              .select('id, name, description, short_description, category, features, benefits, pain_points, target_audience, use_cases, unique_value_propositions, positioning_statement, key_differentiators, pricing_model, technical_specs, case_studies, external_url, created_at')
              .eq('user_id', userId);
            
            if (toolArgs.name) solQuery = solQuery.ilike('name', `%${toolArgs.name}%`);
            
            return await solQuery
              .order('created_at', { ascending: false })
              .limit(Math.min(toolArgs.limit || 5, 20));
          }
            
          case 'get_seo_scores': {
            let seoQuery = supabase
              .from('seo_content_scores')
              .select('*')
              .eq('user_id', userId);
            
            if (toolArgs.content_id) seoQuery = seoQuery.eq('content_id', toolArgs.content_id);
            
            return await seoQuery
              .order('created_at', { ascending: false })
              .limit(Math.min(toolArgs.limit || 10, 50));
          }
            
          case 'get_serp_analysis': {
            let serpQuery = supabase
              .from('serp_analysis_history')
              .select('*')
              .eq('user_id', userId);
            
            if (toolArgs.keyword) serpQuery = serpQuery.eq('keyword', toolArgs.keyword);
            
            return await serpQuery
              .order('created_at', { ascending: false })
              .limit(Math.min(toolArgs.limit || 5, 20));
          }
            
          case 'get_competitors': {
            let compQuery = supabase
              .from('company_competitors')
              .select(`
                id, name, website, description, logo_url, 
                market_position, strengths, weaknesses, notes,
                priority_order, last_analyzed_at,
                ${toolArgs.include_intelligence !== false ? 'intelligence_data, overview, swot_analysis,' : ''}
                ${toolArgs.include_solutions ? 'competitor_solutions (id, name, category, short_description, positioning, features, pricing),' : ''}
                resources, quality_metrics, created_at
              `)
              .eq('user_id', userId);
            
            if (toolArgs.competitor_name) {
              compQuery = compQuery.ilike('name', `%${toolArgs.competitor_name}%`);
            }
            if (toolArgs.market_position) {
              compQuery = compQuery.eq('market_position', toolArgs.market_position);
            }
            
            return await compQuery
              .order('priority_order', { ascending: true })
              .limit(Math.min(toolArgs.limit || 10, 50));
          }
            
          case 'get_competitor_solutions': {
            let solQuery = supabase
              .from('competitor_solutions')
              .select(`
                id, competitor_id, name, category, 
                short_description, long_description, external_url, logo_url,
                positioning, unique_value_propositions, key_differentiators,
                features, use_cases, pain_points, target_audience, benefits,
                ${toolArgs.include_pricing !== false ? 'pricing,' : ''}
                ${toolArgs.include_technical_specs !== false ? 'technical_specs, integrations,' : ''}
                case_studies, resources, tags, market_data,
                last_analyzed_at, created_at,
                company_competitors!competitor_solutions_competitor_id_fkey (name, website)
              `)
              .eq('user_id', userId);
            
            if (toolArgs.competitor_id) {
              solQuery = solQuery.eq('competitor_id', toolArgs.competitor_id);
            }
            if (toolArgs.competitor_name) {
              const { data: matchingCompetitors } = await supabase
                .from('company_competitors')
                .select('id')
                .eq('user_id', userId)
                .ilike('name', `%${toolArgs.competitor_name}%`);
              
              if (matchingCompetitors && matchingCompetitors.length > 0) {
                const competitorIds = matchingCompetitors.map(c => c.id);
                solQuery = solQuery.in('competitor_id', competitorIds);
              } else {
                return { data: [], error: null };
              }
            }
            if (toolArgs.category) {
              solQuery = solQuery.eq('category', toolArgs.category);
            }
            
            return await solQuery
              .order('created_at', { ascending: false })
              .limit(Math.min(toolArgs.limit || 10, 50));
          }
            
          case 'generate_campaign_strategies':
            console.log(`[TOOL] ${toolName} | FORMATTING TOOL | Returning AI-structured data`);
            return { data: toolArgs, error: null };

          // === NEW READ TOOLS ===
          case 'get_calendar_items': {
            let calQuery = supabase
              .from('content_calendar')
              .select('id, title, scheduled_date, status, content_type, priority, assigned_to, proposal_id, content_id, notes, tags, created_at')
              .eq('user_id', userId);
            if (toolArgs.status) calQuery = calQuery.eq('status', toolArgs.status);
            if (toolArgs.from_date) calQuery = calQuery.gte('scheduled_date', toolArgs.from_date);
            if (toolArgs.to_date) calQuery = calQuery.lte('scheduled_date', toolArgs.to_date);
            return await calQuery.order('scheduled_date', { ascending: true }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          // get_glossary_terms removed — feature deprecated

          case 'get_pending_approvals': {
            const approvalStatus = toolArgs.status || 'pending_review';
            let apQuery = supabase
              .from('content_items')
              .select('id, title, content_type, status, approval_status, submitted_for_review_at, created_at, updated_at')
              .eq('user_id', userId)
              .eq('approval_status', approvalStatus);
            return await apQuery.order('submitted_for_review_at', { ascending: false }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_social_posts': {
            // Social posts use workspace_id, need to get it first
            const { data: tm } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).single();
            if (!tm?.workspace_id) return { data: [], error: null };
            let spQuery = supabase
              .from('social_posts')
              .select('id, content, status, scheduled_at, created_at, media_urls, approval_status')
              .eq('workspace_id', tm.workspace_id);
            if (toolArgs.status) spQuery = spQuery.eq('status', toolArgs.status);
            return await spQuery.order('created_at', { ascending: false }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_email_templates': {
            const { data: tm2 } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).single();
            if (!tm2?.workspace_id) return { data: [], error: null };
            let etQuery = supabase
              .from('email_templates')
              .select('id, name, subject, category, variables, created_at, updated_at')
              .eq('workspace_id', tm2.workspace_id);
            if (toolArgs.category) etQuery = etQuery.eq('category', toolArgs.category);
            return await etQuery.order('created_at', { ascending: false }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_topic_clusters': {
            return await supabase
              .from('topic_clusters')
              .select('id, cluster_name, description, importance_score, topic_count, parent_cluster_id, metadata, created_at')
              .eq('user_id', userId)
              .order('importance_score', { ascending: false })
              .limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_content_gaps': {
            let cgQuery = supabase
              .from('content_gaps')
              .select('id, title, description, gap_type, competition_level, opportunity_score, search_volume, potential_traffic, status, keywords, target_cluster_id, created_at')
              .eq('user_id', userId);
            if (toolArgs.status) cgQuery = cgQuery.eq('status', toolArgs.status);
            return await cgQuery.order('opportunity_score', { ascending: false }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_strategy_recommendations': {
            let srQuery = supabase
              .from('strategy_recommendations')
              .select('id, title, description, recommendation_type, priority, status, confidence_score, expected_impact, effort_estimate, action_items, reasoning, created_at')
              .eq('user_id', userId);
            if (toolArgs.status) srQuery = srQuery.eq('status', toolArgs.status);
            if (toolArgs.priority) srQuery = srQuery.eq('priority', toolArgs.priority);
            return await srQuery.order('created_at', { ascending: false }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_repurposed_content': {
            let rcQuery = supabase
              .from('repurposed_contents')
              .select('id, content_id, format_code, title, status, version, created_at')
              .eq('user_id', userId);
            if (toolArgs.content_id) rcQuery = rcQuery.eq('content_id', toolArgs.content_id);
            if (toolArgs.format_code) rcQuery = rcQuery.eq('format_code', toolArgs.format_code);
            return await rcQuery.order('created_at', { ascending: false }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_email_threads': {
            const { data: tm3 } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).single();
            if (!tm3?.workspace_id) return { data: [], error: null };
            let thQuery = supabase
              .from('email_threads')
              .select('id, subject, status, last_activity_at, sentiment, tags, contact_id, created_at')
              .eq('workspace_id', tm3.workspace_id);
            if (toolArgs.status) thQuery = thQuery.eq('status', toolArgs.status);
            return await thQuery.order('last_activity_at', { ascending: false }).limit(Math.min(toolArgs.limit || 20, 50));
          }

          case 'get_activity_log': {
            const { data: tm4 } = await supabase.from('team_members').select('workspace_id').eq('user_id', userId).limit(1).single();
            if (!tm4?.workspace_id) return { data: [], error: null };
            let alQuery = supabase
              .from('engage_activity_log')
              .select('id, type, channel, message, payload, contact_id, created_at, created_by')
              .eq('workspace_id', tm4.workspace_id);
            if (toolArgs.channel) alQuery = alQuery.eq('channel', toolArgs.channel);
            return await alQuery.order('created_at', { ascending: false }).limit(Math.min(toolArgs.limit || 30, 100));
          }

          case 'get_company_info': {
            return await supabase
              .from('company_info')
              .select('id, name, description, industry, website, mission, size, founded, logo_url, values, created_at, updated_at')
              .eq('user_id', userId)
              .limit(1);
          }

          default:
            throw new Error(`Unknown tool: ${toolName}`);
        }
      })(),
      timeoutPromise
    ]);
  } catch (error) {
    const duration = Date.now() - executionStart;
    console.error(`[TOOL] ${toolName} | FAILED | time: ${duration}ms | error:`, error);
    
    // Return empty array for graceful degradation
    return [];
  }
  
  if (result.error) {
    console.error(`[TOOL] ${toolName} | DB error:`, result.error);
    return [];
  }
  
  // Invalidate related caches after write operations
  if (toolName in WRITE_TOOL_CACHE_INVALIDATION) {
    invalidateCacheForWrite(toolName, userId, cache);
  }

  // Cache result (except serp_analysis and write tools)
  if (toolName !== 'get_serp_analysis' && !(toolName in WRITE_TOOL_CACHE_INVALIDATION) && result.data) {
    const cacheKey = `${toolName}:${userId}:${JSON.stringify(toolArgs)}`;
    cache.set(cacheKey, { data: result.data, timestamp: Date.now() });
    console.log(`[TOOL] ${toolName} | cache: STORED`);
  }
  
  const duration = Date.now() - executionStart;
  const itemCount = result.data?.length || 0;
  console.log(`[TOOL] ${toolName} | SUCCESS | time: ${duration}ms | results: ${itemCount} items`);
  
  return result.data || [];
}
