

# Plan: Fix AI Chat Tool Execution Failures

## Problem Summary

When users ask data-retrieval questions like "List my content items" or "Research keywords," the AI returns text-only promises instead of actual data. The root cause is **not** the intent classifier (it correctly routes these to the full processing path) but rather the **LLM failing to generate `tool_calls`** in its Phase 1 response.

## Root Causes Identified

1. **LLM not generating tool_calls**: The system prompt tells the AI about tools and how to use them, but the AI sometimes responds with conversational text instead of invoking tools. The prompt says "USE TOOLS to fetch it" but doesn't enforce it strongly enough.

2. **No fallback when tool_calls are missing**: When the LLM returns text without tool_calls for a query that clearly needs data (e.g., "list my content"), there's no retry or forced tool execution — the text-only response is returned as-is.

3. **Excessive parallel queries on load**: `fetchRealDataContext` runs ~15 parallel queries plus ~5 more for Engage module, contributing to latency.

## Fixes

### Fix 1: Force tool_choice for data queries (Edge Function)

In `index.ts`, after intent analysis determines categories like `content`, `keywords`, `proposals`, etc., set `tool_choice: "required"` (or `"auto"` with a stronger prompt) to force the LLM to call tools rather than respond with text.

```
If queryIntent.categories includes data categories AND is NOT conversational:
  → Set tool_choice = "required" (OpenAI) or equivalent
```

This ensures the LLM **must** produce a tool call for data-retrieval queries.

### Fix 2: Retry with forced tool_choice on empty tool_calls (Edge Function)

After the Phase 1 AI call, if:
- The query has data categories (content, keywords, proposals, etc.)
- The LLM returned text content but **no** `tool_calls`

Then retry the call once with `tool_choice: "required"` to force tool execution. This acts as a safety net.

### Fix 3: Auto-execute tools based on intent (Edge Function)

As an additional fallback, if the LLM still fails to produce tool_calls after retry, directly execute the most relevant tool based on `queryIntent.categories`:
- `content` → execute `get_content_items` 
- `keywords` → execute `get_keywords`
- `proposals` → execute `get_proposals`
- `performance` → execute `get_content_performance`

Then inject the results into a second LLM call as tool results, forcing a data-rich response.

### Fix 4: Optimize context loading (Edge Function)

Reduce the number of parallel queries in `fetchRealDataContext`:
- Combine the two `content_items` count queries (total + draft) into a single query that returns status counts.
- Lazy-load Engage module counts only when `queryIntent.categories` includes `engage`.
- Lazy-load company info / top solutions / top competitors only when relevant categories are detected.

This reduces initial queries from ~20 to ~8 for most requests.

### Fix 5: Strengthen system prompt tool instructions (Edge Function)

Add explicit enforcement language to the `TOOL_USAGE_MODULE`:
```
MANDATORY: When the user asks about their data (content, keywords, proposals, 
campaigns, contacts, etc.), you MUST call the appropriate tool. 
DO NOT describe what you would do — actually call the tool.
DO NOT say "I'll fetch your data" — USE the tool function call.
```

## Files Modified

1. **`supabase/functions/enhanced-ai-chat/index.ts`**
   - Add `tool_choice` logic based on intent categories (~line 2490)
   - Add retry-with-forced-tools after Phase 1 if no tool_calls (~line 2545)
   - Add direct tool execution fallback (~line 2545)
   - Optimize `fetchRealDataContext` to conditionally load data (~line 1554)
   - Strengthen tool instruction text in `TOOL_USAGE_MODULE` (~line 630)

## Impact

- Data queries ("list content", "show keywords", "check performance") will reliably return actual data with charts
- Response latency reduced by ~30% for non-Engage queries
- No breaking changes to frontend — response format stays the same

