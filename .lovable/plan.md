

# Fix: AI Chat Failing Due to Retired Gemini Model

## Root Cause

The error logs show: **`Gemini chat failed: Not Found`** (HTTP 404) repeated 3 times, then the enhanced-ai-chat gives up.

The default Gemini model is `gemini-2.0-flash-exp` (line 656 of `ai-proxy/index.ts`), which Google has retired. The self-heal logic detects the 404 and calls `listModels` + `pickBestModel`, but the preference list **also starts with `gemini-2.0-flash-exp`**, so it picks the same broken model and fails again.

Secondary issue: `userId is not defined` warning at line 2076 in `enhanced-ai-chat/index.ts`.

---

## Fix Plan

### 1. Update Gemini model preferences and default (ai-proxy/index.ts)

**Line 15** — Update `MODEL_PREFERENCES.gemini` to current model names:
```
gemini: ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro']
```

**Line 656** — Change default model from `gemini-2.0-flash-exp` to `gemini-2.5-flash`:
```
const originalModel = params.model || 'gemini-2.5-flash';
```

Also update other provider preferences to current model names:
- OpenAI: add `gpt-4.1-mini`, `gpt-4.1` as top preferences
- Anthropic: ensure `claude-sonnet-4-20250514` stays first

### 2. Update frontend fallback models (apiKeyService.ts)

Update `FALLBACK_MODELS` map to match the new defaults so the frontend stays consistent.

### 3. Fix `userId is not defined` warning (enhanced-ai-chat/index.ts)

At ~line 2076, a block references `userId` but it's out of scope. Fix the variable reference to use the correct scoped variable name (likely `user.id` or the variable holding the authenticated user ID in that context).

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/ai-proxy/index.ts` | Update model preferences (line 12-17) and default Gemini model (line 656) |
| `src/services/apiKeyService.ts` | Update `FALLBACK_MODELS` to current model names |
| `supabase/functions/enhanced-ai-chat/index.ts` | Fix `userId` reference at ~line 2076 |

