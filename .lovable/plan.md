

# Status Check: Analyst & Web Search Features

## 1. Analyst Panel — Status: COMPLETE

All planned components are in place:
- **`useAnalystEngine.ts`** — Fully built with topic extraction, cumulative insights feed, metric accumulation, chart waterfall, suggested actions, and platform data enrichment (queries `content_items`, `campaigns`, `ai_strategy_proposals`, `company_competitors` from Supabase).
- **Backend enrichment** — `enhanced-ai-chat/index.ts` builds `analystContext` (platform stats + insights) when `analystActive` is true and includes it in the SSE `done` payload.
- **`VisualizationSidebar.tsx`** — Analyst feed layout is complete with topic tags, cumulative metrics strip, platform data cards, chart waterfall, live insights feed, smart suggestions, and empty state with prompt pills.
- **`EnhancedChatInterface.tsx`** — Wires `useAnalystEngine`, syncs `isAnalystPanelActive` with `setAnalystActive`, passes `analystState` to sidebar.
- **Types** — `AnalystContext` interface and `analystContext` field on `EnhancedChatMessage` are defined.
- **DB hook** — `useEnhancedAIChatDB.ts` parses `analystContext` from response and stores it on the message.

No gaps found.

## 2. Web Search — Status: COMPLETE

All planned components are in place:
- **Intent detection** — `analyzeSerpIntent()` in `serp-intelligence.ts` detects `web_search` query type via regex patterns.
- **Execution** — `executeWebSearch()` calls the existing `api-proxy` edge function with SerpAPI, normalizes results (up to 8), extracts answer box and related searches.
- **Context injection** — `generateWebSearchContext()` formats results into a structured text block injected into the system prompt.
- **Routing** — `enhanced-ai-chat/index.ts` routes `web_search` queries to `executeWebSearch()` and SEO/keyword queries to `executeSerpAnalysis()`.

No gaps found.

---

## Potential Improvements (Not Bugs — Enhancement Opportunities)

### A. Web search results not surfaced visually in the sidebar
Currently web search results are injected as text context into the AI prompt — the AI references them in its response, but there's no structured `webSearchData` passed to the frontend for rich display (cards with titles/URLs/snippets). The analyst feed could show web search results as dedicated insight cards.

### B. Analyst engine doesn't extract web search insights
The `useAnalystEngine` has an `InsightItem.type` of `'search'` and `source: 'web'` defined but nothing currently produces items with those values. When the backend returns web search data, it could be tagged and displayed distinctly in the analyst feed.

### C. No email/social platform data in analyst enrichment
The backend `analystContext` enrichment only queries `content_items`, `campaigns`, and `ai_strategy_proposals`. Topics like Email and Social are detected by the engine but have no corresponding Supabase queries for platform stats.

---

## Plan: Wire Web Search Results into Analyst Feed

### 1. Backend: Include web search results in `analystContext` (`enhanced-ai-chat/index.ts`)
When `analystActive` is true AND web search was executed, add the raw `WebSearchResponse` to the `analystContext` payload so the frontend can render rich search result cards.

### 2. Types: Add `webSearchResults` to `AnalystContext` (`src/types/enhancedChat.ts`)
Add an optional `webSearchResults` field containing the structured search response (query, results with title/url/snippet, answer box, related searches).

### 3. Analyst Engine: Extract web search insights (`src/hooks/useAnalystEngine.ts`)
When a message's `analystContext.webSearchResults` exists, generate `InsightItem` entries with `type: 'search'` and `source: 'web'`, making web search data visible in the analyst feed.

### 4. Sidebar: Render web search cards (`src/components/ai-chat/VisualizationSidebar.tsx`)
Add a "Web Intelligence" section in the analyst feed that shows search result cards (title, snippet, link) with proper styling distinct from platform insights.

### 5. Backend: Add email/social platform stats to analyst enrichment (`enhanced-ai-chat/index.ts`)
When Email or Social topics are detected, query `engage_email_campaigns` and `social_posts` tables for counts to enrich the analyst context.

### Files to modify:
- `supabase/functions/enhanced-ai-chat/index.ts` — pass web search results + email/social stats into analystContext
- `src/types/enhancedChat.ts` — add `webSearchResults` to `AnalystContext`
- `src/hooks/useAnalystEngine.ts` — extract web search insights into feed
- `src/components/ai-chat/VisualizationSidebar.tsx` — render web search result cards in analyst mode

