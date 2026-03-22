

# Fix "Response May Not Persist" Warning + Incomplete Responses

## Problem 1: False Warning Toast
The `saveMessage` function in `useEnhancedAIChatDB.ts` has two bugs causing false-positive warnings:

- **Double-stringification**: `visual_data`, `progress_indicator`, `workflow_context`, and `function_calls` are wrapped in `JSON.stringify()` before being passed to Supabase. But the Supabase JS client already serializes objects to JSONB automatically — so these become string literals (`"\"[...]\""`), which can cause insert failures or data corruption.
- **Missing return in catch**: The `catch` block (line 314-316) doesn't `return null`, so it implicitly returns `undefined`, which is falsy and triggers the warning toast even for caught exceptions.

### Fix (lines 290-317):
- Remove `JSON.stringify()` wrappers — pass objects directly
- Add `return null` to the catch block

## Problem 2: Incomplete/Truncated AI Responses
Edge function logs show `🚨 Response appears truncated mid-code-block!` — the AI model is running out of output tokens. The `dynamicMaxTokens` variable controls this but may be too low for data-heavy responses.

Need to check where `dynamicMaxTokens` is defined and increase it for data analysis queries. Also need to find the `truncated` detection logic to understand the current mitigation.

### Fix in `supabase/functions/enhanced-ai-chat/index.ts`:
- Find `dynamicMaxTokens` definition and increase the ceiling (likely needs to go from ~2000 to ~4000 for data queries)
- Ensure the truncation repair logic handles the case properly

## Files Changed: 2
1. `src/hooks/useEnhancedAIChatDB.ts` — fix saveMessage serialization + catch block
2. `supabase/functions/enhanced-ai-chat/index.ts` — increase max_tokens for data queries

