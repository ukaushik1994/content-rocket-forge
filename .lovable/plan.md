

# Tool Improvements — Full Implementation Plan

## Already Done (from previous phases)
IMP-9 (error persist), IMP-10 (empty rename), IMP-11 (logout state), IMP-12 (rapid-edit), IMP-13 (stale messages), IMP-14 (empty export), IMP-26 original (accept_proposal) — all verified complete.

---

## Phase 1: CRITICAL — Users Can't Function Without These

### 1A: API Key Onboarding Modal (IMP-1)
- **New file:** `src/components/onboarding/APIKeyOnboarding.tsx` — blocking modal on first login
- Query `api_keys` table for active keys; if 0, show modal instead of chat
- 3 provider options (OpenRouter recommended, OpenAI, Anthropic) with "Get Key" links + input + "Test & Save"
- Reuse existing Settings API Keys tab UI patterns
- **Modify:** `src/components/ai-chat/EnhancedChatInterface.tsx` — gate chat behind key check

### 1B: Social Posting Honesty (IMP-2)
- **Modify:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` — `create_social_post` response: "I've drafted your post. Direct publishing coming soon — copy and post manually."
- **Modify:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — same for `repurpose_for_social`, `schedule_social_from_repurpose`
- **Modify:** Social dashboard — add "Publishing coming soon" banner

### 1C: Content Wizard as Default (IMP-3)
- **Modify:** `supabase/functions/enhanced-ai-chat/index.ts` system prompt (~line 699) — "When user asks to write content, ALWAYS use `launch_content_wizard` unless they say 'quick generate'."

---

## Phase 2: HIGH — Experience Degraders

### 2A: Missing API Key Guidance (IMP-4)
- **Modify:** `keyword-action-tools.ts` — `trigger_serp_analysis`: when no key, return rich help text with link to get key + link to Settings
- **Modify:** `engage-action-tools.ts` — `send_email_campaign`/`send_quick_email`: same pattern for Resend key
- **Modify:** `brand-analytics-tools.ts` — `get_content_performance`: guide to GA/Search Console setup

### 2B: Conversation Summarization (IMP-5)
- **Migration:** Add `summary` + `summary_message_count` columns to `ai_conversations`
- **Modify:** `supabase/functions/enhanced-ai-chat/index.ts` — after loading messages, if >10, generate/load summary and prepend as system message
- Summary regenerated every 10 new messages

### 2C: Retry Wrapper for Tool AI Calls (IMP-6)
- **New:** shared `callAiProxyWithRetry()` utility in `supabase/functions/enhanced-ai-chat/` or `shared/`
- **Modify:** `content-action-tools.ts`, `keyword-action-tools.ts`, `cross-module-tools.ts` — replace raw `fetch` to `ai-proxy` with retry wrapper (3 attempts, exponential backoff on 429)

### 2D: Tool Timeout Tiers (IMP-23)
- **Modify:** `supabase/functions/enhanced-ai-chat/tools.ts` (~line 637) — replace flat 10s timeout:
  - AI-calling tools (`generate_full_content`, `create_topic_cluster`, `repurpose_for_social`, `trigger_competitor_analysis`, `generate_image`): 60s
  - SERP tools: 30s
  - Everything else: 10s

### 2E: Publish Error UX (IMP-8)
- **Modify:** `cross-module-tools.ts` `publish_to_website` handler — when no website connected, save as `ready_to_publish`, return helpful message with action buttons

---

## Phase 3: SECURITY + INTEGRITY

### 3A: Destructive Tools Guard (IMP-26 replaced / IMP-32)
- **Modify:** `index.ts` line 2820 — expand `DESTRUCTIVE_TOOLS` array to include:
  `delete_contact`, `delete_segment`, `delete_email_campaign`, `delete_journey`, `delete_automation`, `delete_social_post`, `delete_calendar_item`, `publish_to_website`

### 3B: Shared Conversation RLS Fix (IMP-24)
- **Migration:** Replace overly broad `is_shared = true` RLS policy with a function-based policy that requires the query to filter by `share_token`

### 3C: File Upload Size Guard (IMP-25)
- **Modify:** `src/components/ai-chat/ContextAwareMessageInput.tsx` — truncate `analysis.summary` to 4000 chars before building the message

### 3D: .gitignore (IMP-15)
- **Modify:** `.gitignore` — add `.env`, `.env.*`, `.env.local`, `.env.production`

---

## Phase 4: MEDIUM — Polish & Consistency

### 4A: Empty Data Rule in System Prompt (IMP-21)
- **Modify:** `index.ts` system prompt — add: "If a read tool returns 0 items, do NOT generate a chart. Tell the user what's missing and suggest the creation action."

### 4B: Silent Web Search Fallback (IMP-29)
- **Modify:** `index.ts` ~line 2228 — when auto-detected web search has no SERP key, add note about adding key (currently only shows for `forceWebSearch`)

### 4C: Competitor Analysis Honest Messaging (IMP-30)
- **Modify:** `offerings-action-tools.ts` line 295 — replace `competitor-analyzer` (doesn't exist) with `competitor-intel` (does exist), or return "coming soon" message

### 4D: Fire-and-Forget Verification (IMP-31)
- **Modify:** `content-action-tools.ts` (`trigger_content_generation`, `retry_failed_content`) — after triggering, verify the edge function responded, else return honest error

### 4E: Email HTML from Markdown (IMP-34)
- **Modify:** `cross-module-tools.ts` `content_to_email` handler — wrap `content.content` in basic email-safe HTML template instead of raw markdown

### 4F: Engage Workspace Notification (IMP-28)
- **Modify:** Engage tool handlers — after `ensure_engage_workspace` auto-creates, append message: "I've set up your Engage workspace."

---

## Phase 5: LOW — Nice to Have

### 5A: Image Generation Key Guidance (IMP-16)
- When no image provider key found, show help text in wizard

### 5B: Journey Cron Documentation (IMP-17)
- Add note in Engage settings about cron requirement for journey processing

### 5C: Activity Log Sidebar Link (IMP-18)
- Add "Activity" link to Engage section in sidebar

### 5D: Image Generation Provider Fallback (IMP-33)
- Check `api_keys` table as fallback when `ai_service_providers` has no image entry

### 5E: AI Provider Auto-Fallback (IMP-7)
- **Modify:** `ai-proxy` to support `service: 'auto'` — pick first available provider
- Tool handlers pass `service: 'auto'` instead of hardcoded provider

### 5F: Campaign Queue Monitoring (IMP-22)
- Add follow-up status check after content generation trigger; show "delayed" message if stuck

---

## Execution Order

```text
Phase 1 (Critical)     → 3 items, ~4 files + 1 new component
Phase 2 (High)         → 5 items, ~6 edge function files + 1 migration
Phase 3 (Security)     → 4 items, ~3 files + 1 migration
Phase 4 (Polish)       → 6 items, ~4 edge function files
Phase 5 (Nice-to-have) → 6 items, ~5 files
```

Total: 24 remaining items across 5 phases. Each phase is independently deployable and testable.

