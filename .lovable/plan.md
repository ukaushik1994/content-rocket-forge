

# Implementation Plan — Full Audit Fixes + Enhancements

Based on the March 19 audit: **0 production blockers**, **4 issues to fix**, **6 enhancements to build**.

---

## Phase 1: Fix 4 Issues (Quick Wins)

### 1a. `start_content_builder` no-op fix
**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` (~line 701-714)
- Change the `start_content_builder` handler to return the same `content_creation_choice` visualData that `launch_content_wizard` returns, instead of navigating to `/ai-chat`.

### 1b. Social post limitation messaging
**File:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`
- In `create_social_post` and `schedule_social_post` return messages, append: "Direct publishing to platforms is coming soon — for now, copy the text and post manually."
- Add a `copy` action button to social post responses.

### 1c. SEO score contextualization
**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`
- Where SEO score is returned in `generate_full_content` and `get_content_items`, add context: "Basic check — full SEO analysis available in the Content Wizard" when score < 40.

### 1d. Cron auth verification note
The cron jobs use the anon key but edge functions create their own service-role client internally via `Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')`. Since `verify_jwt: false` is set, the anon key just passes the gateway. **No code change needed** — this works as-is.

---

## Phase 2: Enhancements E2 + E4 (No DB Migration)

### 2a. Auto-suggest keywords from content (E2)
**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`
- After `generate_full_content` saves content (~line 689), extract 2-5 keyword phrases from headings.
- Cross-check against existing `keywords` table to avoid duplicates.
- Append suggestions to the response message with "say 'add these keywords' to track them."

### 2b. Email template suggestions (E4)
**File:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts`
- After `create_email_campaign` succeeds, query last 10 sent campaigns.
- Analyze subject line patterns (question-style, short vs long).
- Append a tip to the response if 3+ past campaigns exist.

---

## Phase 3: Enhancements E6 + E3 (No DB Migration)

### 3a. Brand voice auto-learn (E6)
**File:** `supabase/functions/enhanced-ai-chat/brand-analytics-tools.ts`
- Add `auto_detect_brand_voice` tool definition + handler.
- Fetches top 5 published articles, sends to AI for tone/style analysis, saves to `brand_guidelines`.

**File:** `supabase/functions/enhanced-ai-chat/tools.ts`
- Register the new tool definition.

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`
- Add "Detect my brand voice" button on welcome screen (shown when user has 2+ published articles).

### 3b. One-click campaign pipeline (E3)
**File:** `supabase/functions/enhanced-ai-chat/campaign-intelligence-tool.ts`
- Add `run_campaign_pipeline` tool: generates strategy → saves to campaign → triggers content generation in one call.
- Add progress events via `emitProgress`.

**File:** `supabase/functions/enhanced-ai-chat/tools.ts`
- Register the tool. Add "Run Full Pipeline" action button to `create_campaign` responses.

---

## Phase 4: Enhancement E1 — Content Versioning (DB Migration Required)

### 4a. Database migration
- Create `content_versions` table (id, content_id, user_id, content, title, meta_title, meta_description, seo_score, version_number, change_source, change_description, created_at).
- RLS: users manage own versions.
- Index on (content_id, version_number DESC).

### 4b. Backend versioning logic
**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`
- In `update_content_item`: snapshot current content to `content_versions` before overwriting.
- In `generate_full_content`: create version 1 after saving.

### 4c. New tools
- `get_content_versions` — fetches version history for a content item.
- `restore_content_version` — restores a version (snapshots current first).

### 4d. Frontend history UI
**File:** `src/components/content/` — Add a "History" tab in content detail view showing versions with timestamps and change sources.

---

## Phase 5: Enhancement E5 — Analyst Time Comparison

### 5a. New tool
**File:** `supabase/functions/enhanced-ai-chat/brand-analytics-tools.ts`
- Add `get_performance_comparison` tool with period param (week/month/quarter).
- Queries content_items and keywords for current vs previous period.
- Returns structured comparison data.

### 5b. Frontend chart
**File:** `src/components/ai-chat/VisualizationSidebar.tsx` or analyst engine
- Detect comparison responses and render side-by-side bar chart (current vs previous period).

---

## Phase 6: Deploy & Verify

1. Deploy `enhanced-ai-chat` edge function (covers all backend changes).
2. Run migration for `content_versions` table.
3. End-to-end test: generate content → check keyword suggestions → check version created → compare periods.

---

## Summary

| Phase | What | Files changed | DB migration |
|-------|------|:---:|:---:|
| 1 | Fix 4 issues (no-op tool, social msg, SEO context, cron) | 2 edge function files | No |
| 2 | Auto-keywords + email template tips | 2 edge function files | No |
| 3 | Brand voice auto-learn + campaign pipeline | 3 edge + 1 frontend | No |
| 4 | Content versioning (full stack) | 2 edge + 1 frontend + migration | Yes |
| 5 | Analyst time comparison | 1 edge + 1 frontend | No |
| 6 | Deploy & verify | — | — |

