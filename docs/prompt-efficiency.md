# Prompt Efficiency — Reducing Token Waste Without Losing Intelligence

> The system prompt is smart but heavy. Every normal query sends ~10k tokens of instructions + 92 tool definitions + data context, even when the query only needs a fraction of it. This document maps exactly what's wasted and how to fix it.

---

## CURRENT STATE

### What's already smart (keep this)
- **Intent-aware data loading** — `fetchRealDataContext` only queries DB categories matching `queryIntent.categories`
- **3-tier prompt fallback** — NORMAL (<25k), HIGH (25-40k strips modules), EXTREME (>40k minimal)
- **Fast-path** — greetings/conversational skip all heavy processing
- **Token budget** — hard cap at 120k, dynamic output tokens

### What's wasteful

**Problem 1: All instruction modules loaded on every normal query**

The NORMAL path (<25k) always appends ALL of these:

| Module | Est. tokens | Needed for |
|--------|------------|------------|
| BASE_PROMPT | ~1,000 | Always |
| TOOL_USAGE_MODULE | ~2,000 | Always (tool routing) |
| RESPONSE_STRUCTURE | ~500 | Always |
| CHART_MODULE | ~800 | Only data/analytics queries |
| MULTI_CHART_MODULE | ~1,200 | Only "overview/analyze/compare" queries |
| TABLE_MODULE | ~400 | Only when user says "table/spreadsheet/list all" |
| SERP_MODULE | ~400 | Only when SERP data is present |
| ACTION_MODULE | ~300 | Only complex/multi-step queries |
| PLATFORM_KNOWLEDGE_MODULE | ~1,500 | Only when AI needs to know about app structure |
| **Total instructions** | **~8,100** | |

Then on top of that:
| Data | Est. tokens | Needed for |
|------|------------|------------|
| 92 tool definitions | ~4,000-6,000 | Only tools matching query intent |
| Real data context | ~1,000-5,000 | Only relevant categories |
| SERP/web search context | ~500-2,000 | Only when triggered |
| Analyst mode injection | ~200 | Only when analyst panel is open |
| Panel hints | ~100 | Only when panel detected |
| Conversation history (10 msgs) | ~1,000-3,000 | Always |
| **Total data** | **~7,000-16,000** | |

**A simple "show my content" query sends ~15,000-24,000 tokens** when it only needs ~6,000 (BASE + TOOL_USAGE + CHART + content tool definitions + content data counts).

---

**Problem 2: All 92 tool definitions sent every time**

The AI receives definitions for ALL tools regardless of what the user asked. Token cost by tool group:

| Tool group | Tool count | Est. tokens | When needed |
|------------|-----------|------------|-------------|
| Core read (content, keywords, proposals, solutions, competitors, calendar, approvals, social, email, clusters, gaps, activity, company, brand) | 19 | ~2,000 | Based on query category |
| Content write (create, update, delete, generate, wizard, calendar CRUD) | 12 | ~1,200 | When user wants to create/edit |
| Keyword write (add, remove, SERP, gaps, clusters) | 5 | ~500 | When query is about keywords/research |
| Offerings write (CRUD solutions, competitors, analysis) | 7 | ~700 | When query is about offerings |
| Engage write (contacts, segments, email, journeys, automations, social) | 23 | ~2,500 | When query is about engage/CRM |
| Cross-module (promote, convert, repurpose, publish, campaign) | 7 | ~800 | When user wants cross-module action |
| Proposals write (accept, reject, create) | 3 | ~300 | When query is about proposals |
| Strategy (accept, dismiss) | 2 | ~200 | When query is about strategy |
| Brand (get, update) | 2 | ~200 | When query is about brand |
| Campaign intelligence (get intel, queue, content, trigger, retry) | 5 | ~600 | When query is about campaigns |
| Image generation (generate, edit) | 2 | ~300 | When user asks for images |
| **Total** | **92** | **~9,300** | |

A "show my keywords" query sends all 92 definitions (~9,300 tokens) when it only needs ~5 keyword tools (~500 tokens). That's **18x more tool tokens than needed**.

---

**Problem 3: PLATFORM_KNOWLEDGE_MODULE is always included but rarely needed**

This module (~1,500 tokens) describes the entire app structure — every page, every route, every data pipeline. It's only useful when the AI needs to understand how modules connect (cross-module actions, navigation suggestions). For "show my content" or "what's my SEO score?" it's pure waste.

---

## THE FIX: Intent-Gated Module and Tool Loading

### Principle
**Match prompt modules AND tool definitions to `queryIntent.categories` and `queryIntent.scope` — not just the fallback tier.**

### Fix 1: Conditional module loading

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — the NORMAL path (lines 2447-2508)

**Current:** All modules appended unconditionally.

**Replace with intent-gated loading:**

```ts
// NORMAL: Intent-gated module loading
systemPrompt = BASE_PROMPT;

// TOOL_USAGE always included (tool routing is always needed)
systemPrompt += '\n\n' + toolUsageWithCounts;
systemPrompt += '\n\n' + RESPONSE_STRUCTURE;

// CHART_MODULE: only for data/analytics/performance queries
const needsCharts = queryIntent.categories.some(c =>
  ['content', 'keywords', 'campaigns', 'analytics', 'proposals', 'performance'].includes(c)
) || queryIntent.scope === 'detailed' || queryIntent.scope === 'full';

if (needsCharts) {
  const needsMultiChart = shouldGenerateMultipleCharts(userQuery);
  if (needsMultiChart) {
    systemPrompt += '\n\n' + MULTI_CHART_MODULE;
  } else {
    systemPrompt += '\n\n' + CHART_MODULE;
  }
}

// TABLE_MODULE: only when explicitly requested
const needsTable = /table|spreadsheet|list all|export|raw data|csv/i.test(userQuery);
if (needsTable) {
  systemPrompt += '\n\n' + TABLE_MODULE;
}

// ACTION_MODULE: only for complex/multi-step or write queries
const needsActions = queryIntent.scope !== 'summary' &&
  queryIntent.categories.some(c => ['campaigns', 'engage', 'content'].includes(c));
if (needsActions) {
  systemPrompt += '\n\n' + ACTION_MODULE;
}

// PLATFORM_KNOWLEDGE_MODULE: only for navigation/cross-module queries
const needsPlatformKnowledge = queryIntent.categories.some(c =>
  ['navigation', 'general'].includes(c)
) || /where|how do i|find|navigate|go to|open/i.test(userQuery);
if (needsPlatformKnowledge) {
  systemPrompt += '\n\n' + PLATFORM_KNOWLEDGE_MODULE;
}

// SERP: only when SERP data exists
if (serpContext) {
  systemPrompt += '\n\n' + SERP_MODULE;
  systemPrompt += `\n\n### 🔍 SERP DATA:\n${serpContext}`;
}
if (webSearchContext) {
  systemPrompt += webSearchContext;
}
```

**Token savings:** For a typical "show my content" query: ~3,500 tokens saved (TABLE + MULTI_CHART + ACTION + PLATFORM_KNOWLEDGE + SERP all skipped).

---

### Fix 2: Intent-gated tool definitions

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — where `TOOL_DEFINITIONS` is passed to the AI call

**Current:** All 92 tools sent every time.

**Replace with category-filtered tools:**

```ts
// Build tool set based on query intent
function getToolsForIntent(queryIntent: QueryIntent): any[] {
  const tools: any[] = [];

  // Always include: core read tools for detected categories
  const CATEGORY_TO_READ_TOOLS: Record<string, string[]> = {
    content: ['get_content_items', 'get_calendar_items', 'get_seo_scores', 'get_repurposed_content', 'get_pending_approvals'],
    keywords: ['get_keywords', 'get_serp_analysis', 'get_topic_clusters', 'get_content_gaps'],
    proposals: ['get_proposals', 'get_strategy_recommendations'],
    solutions: ['get_solutions', 'get_company_info'],
    competitors: ['get_competitors', 'get_competitor_solutions'],
    campaigns: ['get_campaign_intelligence', 'get_queue_status', 'get_campaign_content'],
    engage: ['get_engage_contacts', 'get_engage_segments', 'get_engage_email_campaigns', 'get_engage_journeys', 'get_engage_automations'],
    social: ['get_social_posts'],
    email: ['get_email_templates', 'get_engage_email_campaigns', 'get_email_threads'],
    brand_voice: ['get_brand_voice'],
    activity_log: ['get_activity_log'],
    performance: ['get_content_performance'],
    image_generation: ['generate_image', 'edit_image'],
  };

  const CATEGORY_TO_WRITE_TOOLS: Record<string, string[]> = {
    content: ['create_content_item', 'update_content_item', 'delete_content_item', 'generate_full_content', 'start_content_builder', 'launch_content_wizard', 'create_calendar_item', 'update_calendar_item', 'delete_calendar_item', 'submit_for_review', 'approve_content', 'reject_content'],
    keywords: ['add_keywords', 'remove_keywords', 'trigger_serp_analysis', 'trigger_content_gap_analysis', 'create_topic_cluster'],
    solutions: ['create_solution', 'update_solution', 'delete_solution', 'update_company_info'],
    competitors: ['add_competitor', 'update_competitor', 'trigger_competitor_analysis'],
    campaigns: ['trigger_content_generation', 'retry_failed_content', 'create_campaign'],
    engage: ['create_contact', 'update_contact', 'tag_contacts', 'delete_contact', 'create_segment', 'delete_segment', 'create_email_campaign', 'send_email_campaign', 'delete_email_campaign', 'send_quick_email', 'create_email_template', 'update_email_template', 'create_journey', 'activate_journey', 'delete_journey', 'create_automation', 'toggle_automation', 'delete_automation', 'enroll_contacts_in_journey', 'create_social_post', 'update_social_post', 'schedule_social_post', 'delete_social_post'],
    proposals: ['accept_proposal', 'reject_proposal', 'create_proposal', 'accept_recommendation', 'dismiss_recommendation'],
    brand_voice: ['update_brand_voice'],
    cross_module: ['promote_content_to_campaign', 'content_to_email', 'campaign_content_to_engage', 'repurpose_for_social', 'schedule_social_from_repurpose', 'publish_to_website'],
    image_generation: ['generate_image', 'edit_image'],
  };

  // Collect tool names for detected categories
  const toolNames = new Set<string>();

  for (const category of queryIntent.categories) {
    (CATEGORY_TO_READ_TOOLS[category] || []).forEach(t => toolNames.add(t));
    (CATEGORY_TO_WRITE_TOOLS[category] || []).forEach(t => toolNames.add(t));
  }

  // Always include a minimum set for general queries
  if (toolNames.size === 0 || queryIntent.categories.includes('general')) {
    // General: include content + keyword reads + brand voice
    ['get_content_items', 'get_keywords', 'get_proposals', 'get_solutions', 'get_brand_voice', 'get_company_info',
     'create_content_item', 'launch_content_wizard', 'generate_full_content', 'add_keywords'].forEach(t => toolNames.add(t));
  }

  // Cross-module tools only when intent suggests cross-module action
  if (queryIntent.categories.length > 1 || /repurpose|convert|promote|publish|email.*content|content.*email/i.test(userQuery)) {
    (CATEGORY_TO_WRITE_TOOLS['cross_module'] || []).forEach(t => toolNames.add(t));
  }

  // Filter TOOL_DEFINITIONS to only include matching tools
  return TOOL_DEFINITIONS.filter(td => toolNames.has(td.function.name));
}

const filteredTools = getToolsForIntent(queryIntent);
console.log(`🔧 Tool set: ${filteredTools.length} tools (filtered from ${TOOL_DEFINITIONS.length} based on intent: ${queryIntent.categories.join(', ')})`);
```

Then pass `filteredTools` instead of `TOOL_DEFINITIONS` to the AI call.

**Token savings:** For a "show my content" query: sends ~12 content tools (~1,200 tokens) instead of all 92 (~9,300 tokens). **Saves ~8,000 tokens per request.**

---

### Fix 3: Slim down PLATFORM_KNOWLEDGE_MODULE

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — the `PLATFORM_KNOWLEDGE_MODULE` constant

This module describes every page, route, and data pipeline in the app. Most of this is only needed when the AI is navigating the user or doing cross-module work.

**Split into two:**

```ts
// PLATFORM_BASICS: Always included (lightweight — ~200 tokens)
const PLATFORM_BASICS = `
Key pages: Repository (/repository), Keywords (/keywords), Campaigns (/campaigns), Analytics (/analytics), Calendar (/calendar), AI Proposals (/ai-proposals), Offerings (/offerings).
Engage: Email (/engage/email), Social (/engage/social), Contacts (/engage/contacts), Automations (/engage/automations), Journeys (/engage/journeys).
For text-only modules, include navigation links like: 👉 [Open Keywords →](/keywords)
`;

// PLATFORM_DEEP: Only loaded for navigation/cross-module queries (~1,300 tokens)
const PLATFORM_DEEP = `
[keep the existing full PLATFORM_KNOWLEDGE_MODULE content here]
`;
```

Load `PLATFORM_BASICS` always. Load `PLATFORM_DEEP` only when `needsPlatformKnowledge` is true.

---

### Fix 4: Compress real data context for simple queries

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — where `realDataContext` is appended

**Current:** Always appends the full context string with counts, recent activity, identity, etc.

**For `queryIntent.scope === 'summary'` or `queryIntent.scope === 'conversational'`, use a minimal context:**

```ts
// Minimal context for simple queries
if (queryIntent.scope === 'summary') {
  systemPrompt += `\n\n## DATA SNAPSHOT: ${counts.contentCount} content items, ${counts.keywordCount} keywords, ${counts.proposalCount} proposals, ${counts.activeCampaignCount} active campaigns.`;
} else {
  // Full context for detailed/full queries
  systemPrompt += `\n\n## REAL DATA CONTEXT:\n${realDataContext}`;
}
```

---

## EXPECTED SAVINGS

| Query type | Current tokens | After fix | Savings |
|-----------|---------------|-----------|---------|
| "show my content" | ~20,000 | ~8,000 | 60% |
| "write a blog post about X" | ~22,000 | ~10,000 | 55% |
| "hi, quick question" | ~15,000 (if not fast-path) | ~5,000 | 67% |
| "analyze my keyword performance across campaigns" | ~25,000 | ~18,000 | 28% |
| "full overview of everything" | ~25,000 | ~25,000 | 0% (needs everything) |

**Average savings across typical usage: ~50% fewer tokens per request.**

This means:
- **Faster responses** — less for the AI to read
- **Lower API costs** — fewer input tokens billed
- **Fewer token limit errors** — more headroom for large data contexts
- **Better AI focus** — less noise in the prompt = more relevant responses

---

## IMPLEMENTATION ORDER

| # | Fix | Effort | Savings |
|---|-----|--------|---------|
| 1 | Intent-gated module loading | 30 min | ~3,500 tokens/request |
| 2 | Intent-gated tool definitions | 45 min | ~8,000 tokens/request |
| 3 | Split PLATFORM_KNOWLEDGE_MODULE | 15 min | ~1,300 tokens/request |
| 4 | Compress context for simple queries | 15 min | ~2,000 tokens/request |

**Total: ~2 hours → ~50% token reduction on average requests.**
