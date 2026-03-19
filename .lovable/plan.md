

# Phase 2 Implementation Plan — Experience & Stability

## 2A: Missing API Key Guidance (IMP-4)
**Status:** Already done. All three tools already have rich guidance:
- `trigger_serp_analysis` (line 167-171): Shows "🔑 No SerpAPI key configured..." with Settings link
- `send_email_campaign` (line 502-506): Shows "🔑 No Resend API key configured..."  
- `send_quick_email` (line 629-633): Same Resend guidance
- `get_content_performance` (line 161-168): Shows missing GA/GSC message with `settingsAction`

**No work needed.**

---

## 2B: Conversation Summarization (IMP-5)
**Migration:** Add `summary TEXT` and `summary_message_count INTEGER DEFAULT 0` columns to `ai_conversations`.

**Modify:** `supabase/functions/enhanced-ai-chat/index.ts`
- After the request is parsed and messages are available, check if `conversation_id` is provided and message count > 10
- Load existing summary from `ai_conversations.summary`; if stale (message count grown by 10+), regenerate via a quick AI call
- Prepend summary as a system message to the conversation context to keep token usage low
- After generating a new summary, write it back to `ai_conversations.summary` + update `summary_message_count`

---

## 2C: Retry Wrapper for Tool AI Calls (IMP-6)
**New file:** `supabase/functions/shared/aiProxyRetry.ts`
- Export `callAiProxyWithRetry(url, options, maxRetries=3)` — wraps `fetch` with exponential backoff on 429/500/502/503
- Delays: 2s → 4s → 8s with jitter

**Modify 3 files** to replace raw `fetch(...ai-proxy...)`:
- `content-action-tools.ts` (~line 445): use `callAiProxyWithRetry`
- `keyword-action-tools.ts` (~line 261): use `callAiProxyWithRetry`  
- `cross-module-tools.ts` (~line 317): use `callAiProxyWithRetry`

---

## 2D: Tool Timeout Tiers (IMP-23)
**Modify:** `tools.ts` (~line 637-638)
- Replace flat `10000` ms timeout with a lookup:
  - AI-generation tools (`generate_full_content`, `create_topic_cluster`, `repurpose_for_social`, `trigger_competitor_analysis`, `generate_image`): **60s**
  - SERP tools (`trigger_serp_analysis`, `trigger_content_gap_analysis`): **30s**
  - All others: **10s** (unchanged)
- Add a `getToolTimeout(toolName)` helper function above `executeToolCall`

---

## 2E: Publish Error UX (IMP-8)
**Modify:** `cross-module-tools.ts` `publish_to_website` handler (~line 387-389)
- When no website connection found, instead of just returning error:
  1. Update content status to `ready_to_publish`
  2. Return richer message with setup instructions and a settings action hint

---

## Files Modified
| File | Change |
|------|--------|
| `supabase/functions/enhanced-ai-chat/index.ts` | Summarization logic (2B) |
| `supabase/functions/enhanced-ai-chat/tools.ts` | Tiered timeouts (2D) |
| `supabase/functions/enhanced-ai-chat/content-action-tools.ts` | Retry wrapper (2C) |
| `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` | Retry wrapper (2C) |
| `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` | Retry wrapper (2C) + Publish UX (2E) |
| `supabase/functions/shared/aiProxyRetry.ts` | New retry utility (2C) |
| Migration | Add `summary` + `summary_message_count` to `ai_conversations` (2B) |

## Execution Order
1. Migration (2B columns)
2. Create `aiProxyRetry.ts` (2C)
3. Update `tools.ts` timeouts (2D)
4. Update 3 tool files with retry wrapper (2C)
5. Update `cross-module-tools.ts` publish handler (2E)
6. Add summarization to `index.ts` (2B)
7. Deploy edge function

