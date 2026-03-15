

# Plan: Auto-Detect Web Search Intent in AI Chat

## Problem
The AI chat currently auto-detects SERP intent only for **keyword/SEO-focused** queries (e.g., "keyword difficulty for X", "who's ranking for Y"). It misses **general web search** queries where the user wants real-time external information, such as:
- "What's the latest Google algorithm update?"
- "What are the best practices for email marketing in 2026?"
- "How does HubSpot compare to Mailchimp?"
- "What's new in content marketing?"
- "Find me articles about AI-driven SEO"

These queries fall through to internal-only responses, producing stale or no-data answers.

## Solution
Extend the existing SERP intelligence system in `serp-intelligence.ts` to detect **general web search intent** alongside the existing keyword analysis patterns, and route those queries through the existing `searchSerpApi` function in `api-proxy`.

## Architecture

```text
User Query
    │
    ▼
analyzeQueryIntent()          ← existing (unchanged)
    │
    ▼
analyzeSerpIntent()           ← EXTENDED with web search patterns
    │
    ├─ keyword/SEO intent     → executeSerpAnalysis() (existing, unchanged)
    │
    └─ web search intent      → NEW: executeWebSearch() via api-proxy 'search' endpoint
    │
    ▼
enhanced-ai-chat/index.ts    ← minor changes to handle web search results
```

## Changes

### 1. `supabase/functions/enhanced-ai-chat/serp-intelligence.ts`

**Add web search detection patterns** to `analyzeSerpIntent()`:

New patterns to detect general web search intent:
- "what's new/latest in [topic]" 
- "best practices for [topic]"
- "how to [action]" (external knowledge queries)
- "find articles/resources about [topic]"
- "what is [concept]" (factual queries not about internal data)
- "news about [topic]"
- "compare [A] and [B]" (external product comparisons)
- "explain [concept]"
- Explicit: "search for", "look up", "google"

Add a new query type `'web_search'` to `SerpQueryPattern.type`.

**Add `INTERNAL_DATA_PATTERNS` guard**: The existing internal-data exclusion already prevents hijacking (e.g., "my campaigns" won't trigger search). The new patterns will also respect this guard.

**Add `executeWebSearch()` function**: A new exported function that calls the existing `api-proxy` with `service: 'serpapi'`, `endpoint: 'search'`, and formats the Google search results (organic results, snippets, answer boxes) into a context string the AI can use.

### 2. `supabase/functions/enhanced-ai-chat/index.ts`

In the main flow (around line 2153-2195), after `analyzeSerpIntent()`:
- Check if `serpIntelligence.queryType === 'web_search'`
- If so, call `executeWebSearch()` instead of `executeSerpAnalysis()`
- Format the web results into a `WEB SEARCH RESULTS` context block (URLs, titles, snippets) that the AI can cite in its response

### 3. System prompt addition (in `index.ts` prompt modules)

Add a small instruction block telling the AI how to handle web search results:
- Cite sources with URLs when web search data is present
- Summarize findings rather than copy-pasting
- Indicate the information is from live web search

## What stays the same
- The `api-proxy` edge function (already has `searchSerpApi` at the `'search'` endpoint)
- The SerpAPI/Serpstack API keys and fallback logic
- All existing keyword analysis patterns and internal data guards
- The SSE streaming transport and response format

## Scope
- 2 files modified: `serp-intelligence.ts` and `index.ts`
- No new edge functions, no new API keys, no database changes

