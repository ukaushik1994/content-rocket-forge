

# Final Output Quality Fixes — Implementation Plan

## Status Check
Most fixes from the document are already implemented from prior phases. **5 gaps remain:**

---

## Phase 1: Normalize Anthropic Responses
**File:** `supabase/functions/ai-proxy/index.ts` (lines 581-586)

Gemini normalization is already done (lines 751-789). Anthropic still returns raw `data` without OpenAI-format normalization.

**Change:** After `const data = await response.json()` in the Anthropic handler, normalize the response to OpenAI format before returning — extract `content[].text` into `choices[0].message.content` and `content[].tool_use` into `choices[0].message.tool_calls`, matching the same structure already used for Gemini.

---

## Phase 2: Refine Tool Filtering Fallback
**File:** `supabase/functions/enhanced-ai-chat/index.ts` (lines 3255-3258)

Currently uses `< 5` threshold and a different tool list (`get_seo_scores` instead of `generate_full_content`). The document specifies `< 3` with additive merging (not replacement).

**Change:** Update threshold from `< 5` to `< 3`, change core list to `['get_content_items', 'get_keywords', 'get_proposals', 'get_competitors', 'generate_full_content']`, and use additive merge instead of full replacement.

---

## Phase 3: Remove Ghost Tool Entry
**File:** `supabase/functions/enhanced-ai-chat/tools.ts` (line 551)

`send_quick_email: []` still exists in the cache invalidation map even though the tool is filtered from use.

**Change:** Delete that line.

---

## Phase 4: Auto-Update Conversation Goal on Topic Shift
**File:** `supabase/functions/enhanced-ai-chat/index.ts`

When user switches from SEO to email mid-conversation, the `goal` field in `ai_conversations` should update automatically so the AI's advice stays relevant.

**Change:** After intent detection, add a `CATEGORY_TO_GOAL` mapping and update the conversation goal if it differs from the detected category (non-conversational queries only). Silent `try/catch` — non-blocking.

---

## Phase 5: Response Safety Check
**File:** `supabase/functions/enhanced-ai-chat/index.ts` (around line 3364)

If normalization in `ai-proxy` fails (error path, timeout), `data?.choices?.[0]?.message` will be undefined and crash the handler.

**Change:** After `const data = aiProxyResult.data`, add a safety check: if `data?.choices?.[0]?.message` is missing, attempt to extract content from Gemini (`candidates`) or Anthropic (`content`) raw formats. Fallback to a user-friendly error message. This prevents the entire response from crashing.

---

## Files Changed: 3

| File | Phase |
|------|-------|
| `supabase/functions/ai-proxy/index.ts` | 1 |
| `supabase/functions/enhanced-ai-chat/index.ts` | 2, 4, 5 |
| `supabase/functions/enhanced-ai-chat/tools.ts` | 3 |

All changes are additive or surgical replacements. No tools removed, no calculations changed.

