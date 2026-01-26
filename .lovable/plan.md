

# Phase 3: Improve AI Context & Intelligence

## Executive Summary

Building on the completed Phase 1 (Fix & Stabilize) and Phase 2 (New Chart Types), this phase enhances the AI's intelligence and context awareness. We will **extend existing mechanisms** rather than rebuild - using the current tool-based architecture, query analyzer, and context fetching patterns.

---

## Current State Analysis

### What Already Exists (We Will Extend)

| Component | Location | Current Capability |
|-----------|----------|-------------------|
| Query Analyzer | `query-analyzer.ts` | Detects 5 categories (content, keywords, solutions, proposals, seo) |
| Data Context | `index.ts:1038-1130` | Fetches counts only, tools fetch detailed data |
| Tool Definitions | `tools.ts` | 8 core tools + 5 campaign intelligence tools |
| Intent Detection | `index.ts:473-497` | Multi-chart trigger detection |
| System Prompts | `index.ts:30-421` | BASE_PROMPT, CHART_MODULE, MULTI_CHART_MODULE |

### What's Missing (Phase 3 Additions)

1. **Campaign context** not included in base data context
2. **Recent analytics trends** not summarized for AI
3. **User preferences** not tracked or considered
4. **Proactive insights** not generated based on available data
5. **Query category detection** missing campaigns, competitors, analytics

---

## Implementation Plan

### 3.1 Enhance Query Intent Detection

**File:** `supabase/functions/enhanced-ai-chat/query-analyzer.ts`

**Changes:** Add detection for campaigns, competitors, analytics queries

```text
Current categories: content, keywords, solutions, proposals, seo
New categories: +campaigns, +competitors, +analytics, +performance
```

**Technical Implementation:**
- Add `needsCampaigns` pattern: `/campaign|generation|queue|progress|active campaign/i`
- Add `needsCompetitors` pattern: `/competitor|competition|rival|market|swot/i`
- Add `needsAnalytics` pattern: `/analytics|metrics|views|clicks|conversion|traffic/i`
- Add `needsPerformance` pattern: `/performing|performance|how.*(doing|going)/i`
- Update categories array to include new detections

---

### 3.2 Expand Real Data Context

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Function:** `fetchRealDataContext()` (lines 1038-1130)

**Changes:** Add campaign and analytics summary counts

**Current Context:**
```
- Content Items: X total
- AI Strategy Proposals: X total
- Keywords: X researched
- Solutions/Products: X defined
- Competitors: X tracked
- Competitor Solutions: X products analyzed
```

**Enhanced Context (additions):**
```
- Active Campaigns: X running
- Queue Items: X pending, Y completed, Z failed
- Recent Performance: X% engagement rate (last 7 days)
- Content by Status: X draft, Y published, Z archived
```

**Technical Implementation:**
- Add count queries for:
  - `campaigns` table (filter by status='active')
  - `content_generation_queue` table (group by status)
  - `campaign_analytics` table (sum last 7 days)
- Include these in the context string

---

### 3.3 Add Smart Context Suggestions

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Changes:** Generate proactive insights based on data state

**New Helper Function:** `generateProactiveInsights(counts)`

This function analyzes the user's data counts and generates contextual suggestions:

```text
Examples:
- If draft content > 5: "You have X draft articles ready for review"
- If failed queue items > 0: "X content items failed generation"
- If active campaigns = 0: "No active campaigns - consider starting one"
- If keywords = 0: "Add keywords to unlock SEO insights"
```

**Integration Point:** Add to system prompt as "PROACTIVE INSIGHTS" section

---

### 3.4 Enhance Tool Usage Prompts

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Changes:** Update TOOL_USAGE_MODULE with campaign-specific examples

**Current Examples:**
```
- "Show my best content" → get_content_items
- "Available proposals?" → get_proposals
- "Keyword performance" → get_keywords
```

**New Examples:**
```
- "How is my campaign doing?" → get_campaign_intelligence with campaign_name
- "What's the queue status?" → get_queue_status with campaign_id
- "Show campaign content" → get_campaign_content with campaign_id
- "Start generating content" → trigger_content_generation
- "Retry failed items" → retry_failed_content
```

---

### 3.5 Add Recent Activity Context

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Changes:** Fetch and include recent activity summary

**New Data Fetched:**
- Last 5 content items created (titles only)
- Last campaign status change
- Queue processing status (if any active)

**Implementation:**
```typescript
// Add to fetchRealDataContext
const { data: recentContent } = await supabase
  .from('content_items')
  .select('title, created_at')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(5);

// Add to context string
## Recent Activity:
- Last content: "[title]" (created [date])
- Active queue: [X] items processing
```

---

## Files to Modify

| File | Changes | Complexity |
|------|---------|------------|
| `query-analyzer.ts` | Add 4 new category detections | Low |
| `index.ts` (fetchRealDataContext) | Add campaign/queue counts | Medium |
| `index.ts` (TOOL_USAGE_MODULE) | Add campaign tool examples | Low |
| `index.ts` (new function) | Add generateProactiveInsights() | Medium |

---

## What Stays Unchanged

- All existing tool definitions and execution logic
- Chart generation and validation
- SERP analysis integration
- Multi-chart generation logic
- Campaign intelligence tool implementations
- Real-time queue subscriptions (frontend)
- All existing prompt modules (extended, not replaced)

---

## Expected Outcomes

After Phase 3:

1. **AI understands campaign context** - Knows about active campaigns without explicit tool calls
2. **Smarter tool selection** - Uses get_campaign_intelligence when user mentions "campaign"
3. **Proactive suggestions** - AI notices and mentions important data states (e.g., failed items)
4. **Better query routing** - Competitors, analytics, and performance queries get correct tools
5. **Recent activity awareness** - AI knows what user worked on recently

---

## Testing Strategy

Test prompts after implementation:

1. "How is my campaign doing?" → Should use get_campaign_intelligence
2. "What competitors do I have?" → Should use get_competitors
3. "Show me analytics" → Should reference campaign_analytics data
4. "What's failing in my queue?" → Should use get_queue_status
5. General "Hi, what's new?" → Should include proactive insights about data state

---

## Technical Notes

### Token Budget Considerations

Current base context: ~500 tokens
Enhanced context additions: ~200-300 tokens (counts only)
Proactive insights: ~100-150 tokens

**Total addition:** ~400 tokens - well within safe limits

### Performance Impact

- Additional 4 count queries: ~50ms total
- Recent activity fetch (5 items): ~20ms
- No impact on existing response generation

