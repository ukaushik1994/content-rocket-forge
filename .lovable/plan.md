

# Remaining Fixes — Phase-by-Phase Plan

After thorough investigation, here is the definitive list of what's still broken, cross-referenced against the codebase AND the migration schemas.

---

## Verified Remaining Issues

### P0 — Runtime Crashes (Table Name Mismatches)

The original migration (`20260215195844`) creates tables WITHOUT `engage_` prefix for 4 tables, but the edge function code uses prefixed names:

| Code references | Actual DB table | Affected files |
|---|---|---|
| `engage_email_campaigns` | `email_campaigns` | `engage-action-tools.ts`, `engage-intelligence-tool.ts`, `cross-module-tools.ts`, `index.ts`, `tools.ts`, `engage-ai-analytics/index.ts` |
| `engage_journeys` | `journeys` | `engage-action-tools.ts`, `engage-intelligence-tool.ts`, `index.ts`, `tools.ts`, `engage-ai-analytics/index.ts` |
| `engage_journey_enrollments` | `journey_enrollments` | `engage-action-tools.ts`, `engage-intelligence-tool.ts` |
| `engage_journey_steps` | `journey_steps` | `engage-intelligence-tool.ts` |

Additionally, `email_campaigns` is missing columns the code tries to insert: `subject`, `body_html`, `segment_id`, `from_name`, `from_email`. And `journeys` is missing `description` and `trigger_type`. And `journey_enrollments` is missing `current_step_index`.

### P1 — Security: Shared Conversation RLS

The policy `"Shared conversations accessible by token"` allows any user to `SELECT` all shared conversations. The frontend filters by `share_token` but the DB doesn't enforce it.

### P1 — Missing Cron Jobs

4 edge functions exist but are never scheduled: `engage-journey-processor`, `engage-social-poster`, `process-content-queue`, `engage-job-runner`.

### P2 — Value Gaps (verified NOT done)

| # | Item | Status |
|---|---|---|
| 1 | Performance-driven topic prioritization (value-logic Fix 14) | Not done |
| 2 | Smart follow-up suggestions on every AI response (ai-chat-value Fix 2) | Not done — no client-side generator |
| 3 | Proactive insights on welcome screen (ai-chat-value Fix 6) | Not done |
| 4 | Quick-apply distribution actions on generated content (ai-chat-value Fix 9) | Not done in edge function return |
| 5 | Conversation templates from patterns (ai-chat-value Fix 10) | Not done |
| 6 | PLATFORM_KNOWLEDGE_MODULE not split into light/full (PE Fix 3) | Not done |

### Already Done (confirmed in code)
- Fix 13 (audience-aware tone) -- DONE
- Fix 15 (calendar diversity) -- DONE  
- Fix 5 (format preference) -- DONE
- Fix 3 (context indicator) -- DONE
- Fix 12 (SERP value labels) -- DONE
- Fix 14 (quality check) -- DONE
- Fix 18 (analyst dynamic prompts) -- DONE
- PE Fix 1 (intent-gated modules) -- DONE
- PE Fix 2 (intent-gated tools) -- DONE
- Email send fire-and-forget -- DONE (already awaits + resets status)

---

## Phase 1: Database Schema Fix (Migration)

**New migration** to add missing columns and fix table name mismatches. The safest approach: add the missing columns to the existing tables rather than renaming, since the frontend Engage UI components likely use the correct names already.

1. Add to `email_campaigns`: `subject text`, `body_html text`, `segment_id uuid`, `from_name text`, `from_email text`
2. Add to `journeys`: `description text`, `trigger_type text DEFAULT 'manual'`  
3. Add to `journey_enrollments`: `current_step_index integer DEFAULT 0`

**Risk**: Zero — additive column additions, no existing data affected.

---

## Phase 2: Table Name Fixes in Edge Functions

Global find-and-replace across 6 files:

| Find | Replace | Files |
|---|---|---|
| `'engage_email_campaigns'` | `'email_campaigns'` | `engage-action-tools.ts`, `engage-intelligence-tool.ts`, `cross-module-tools.ts`, `index.ts`, `engage-ai-analytics/index.ts` |
| `'engage_journeys'` | `'journeys'` | `engage-action-tools.ts`, `engage-intelligence-tool.ts`, `index.ts`, `engage-ai-analytics/index.ts` |
| `'engage_journey_enrollments'` | `'journey_enrollments'` | `engage-action-tools.ts`, `engage-intelligence-tool.ts` |
| `'engage_journey_steps'` | `'journey_steps'` | `engage-intelligence-tool.ts` |

Also update string references in `tools.ts` (tool dependency map uses `get_engage_email_campaigns` etc. — these are tool NAMES not table names, so they stay, but the refresh-after list should be checked).

Deploy: `enhanced-ai-chat` and `engage-ai-analytics` edge functions.

**Risk**: Zero — pure string replacement, makes code match actual DB.

---

## Phase 3: Security + Cron Jobs (Migration)

### 3a. Fix shared conversation RLS
- Drop the broad `"Shared conversations accessible by token"` policy
- Create `get_shared_conversation(p_token text)` SECURITY DEFINER function
- Update `SharedConversation.tsx` to use `supabase.rpc('get_shared_conversation', { p_token: shareToken })`

### 3b. Add 4 cron jobs
SQL migration using `cron.schedule()` and `net.http_post()` for:
- `engage-social-poster` (every 5 min)
- `engage-journey-processor` (every 10 min)
- `process-content-queue` (every 5 min)
- `engage-job-runner` (every 15 min)

**Risk**: Low — RLS change is a tightening (more secure), cron jobs are new additions.

---

## Phase 4: Remaining Value Features

### 4a. Smart follow-up suggestions (ai-chat-value Fix 2)
**File**: `EnhancedMessageBubble.tsx`
- Add `generateFollowUps(content: string): string[]` helper — pattern-matches keywords (blog, SEO, email, campaign, keyword, social) to produce 2-3 contextual follow-up chips
- Render below message content when no `deepDivePrompts` exist
- Pure client-side, no API call

### 4b. Proactive insights on welcome screen (ai-chat-value Fix 6)
**File**: `EnhancedChatInterface.tsx` welcome section
- On mount with no messages, run 4 non-blocking queries: stale drafts (>14 days), failed queue items, empty calendar next 7 days, pending approvals
- Show as compact alert badges above the quick actions

### 4c. Quick-apply actions on generated content (ai-chat-value Fix 9)
**File**: `content-action-tools.ts` `generate_full_content` return
- Add `actions` array to the return object with: View in Repository, Publish, Send as Email, Share on Social
- These use existing `ModernActionButtons` rendering in the frontend

### 4d. Performance-driven topic prioritization (value-logic Fix 14)
**File**: `enhanced-ai-chat/index.ts` in `realDataContext` building
- Query `content_items` grouped by keyword/topic with avg SEO scores
- Append top/bottom performing topics to context so AI can prioritize recommendations

### 4e. Conversation templates from patterns (ai-chat-value Fix 10)
**File**: `EnhancedChatInterface.tsx` welcome section
- Query last 20 conversation titles, find common verb patterns (e.g., "Write a blog", "Analyze keywords")
- Show as "Your workflows" chips

### 4f. Split PLATFORM_KNOWLEDGE_MODULE (PE Fix 3)
**File**: `modules.ts` or wherever PLATFORM_KNOWLEDGE_MODULE is defined
- Extract lightweight `PLATFORM_BASICS` (~200 tokens) with just page routes
- Keep full version as `PLATFORM_KNOWLEDGE_MODULE`
- In `index.ts`, use `PLATFORM_BASICS` by default, full only when `needsPlatformKnowledge` is true

---

## Phase 5: Deploy & Verify

1. Deploy `enhanced-ai-chat` and `engage-ai-analytics` edge functions
2. Run migrations (schema columns + RLS fix + cron jobs)
3. Test: create email campaign, create journey, enroll contacts — all should work without "relation does not exist" errors
4. Test: shared conversation only accessible with valid token
5. Test: AI chat welcome screen shows proactive insights

---

## Summary

| Phase | Scope | Risk |
|---|---|---|
| 1 | Add missing DB columns (3 tables) | Zero |
| 2 | Fix 4 table name mismatches in 6 files | Zero |
| 3 | RLS security fix + 4 cron jobs | Low |
| 4 | 6 value features (follow-ups, insights, templates, etc.) | Low |
| 5 | Deploy & verify | None |

Total: 4 crash fixes, 1 security fix, 4 cron jobs, 6 value features across 5 phases.

