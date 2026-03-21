

# Breakpoints Fix Plan — 39 Items Across 23 Modules

## Audit Summary

After reviewing the entire codebase against the plan, here's the status:

**Already Fixed (7 items — no work needed):**
- **H5** — ContentDetailView null guard: already has `if (!item)` at line 44
- **H9** — Legacy key toast: already handled in `apiKeyService.ts` line 182-184
- **H15** — promote_content_to_campaign validation: already checks content existence at line 214
- **M10** — SharedConversation error: already handles missing conversation at line 62-66
- **C5** — Publish status update: already updates status at line 525-530 (plan says "status stays draft" but code already updates it; only edge case is if the DB update itself fails — we'll add a warning for that)
- **H6** — Keywords error: already has toast.error at line 65 of KeywordsPage.tsx
- **M15** — Analyst query failures: already has `lastRefreshError` tracking

**Remaining: 32 items to implement**

---

## Implementation Phases (ordered by priority)

### Phase 1: CRITICAL Frontend Fixes (4 items)
**File: `src/hooks/useEnhancedAIChatDB.ts`**

**C1** — Before the rate limit check in catch block (~line 844), add a check for "No AI provider" / status 400 errors. Show a clear message directing user to Settings → API Keys instead of "rate limited."

**C2** — After the SSE `while` loop (after line 737), add a check: if `!response` and we got no content, update the assistant message with "Connection lost" error instead of leaving a blank bubble. Also enhance the catch block to handle empty-content assistant messages.

**H1** — Change session refresh threshold from `120` to `300` seconds (line 659) for more aggressive token refresh.

**H2** — Where `createConversation` returns null, add toast error and remove the optimistically-added user message.

### Phase 2: CRITICAL Frontend Fixes (3 items)

**C3 — File: `src/pages/Campaigns.tsx`**
Before `handleStartGeneration` maps over assets (~line 256), add a guard: if `allBriefs.length === 0`, show toast and return early.

**C4 — File: `src/pages/Analytics.tsx`**
Add a `safeNum` helper at the top. Replace all `.toFixed()` calls on metrics with `safeNum()` to prevent NaN when GA/GSC isn't configured. Apply to lines 134, 143, 152, 161, 203, 207, 208.

**C6 — File: `src/hooks/use-notifications.ts`**
The notification system uses `subscribeToEnhancedAlerts` which may silently fail. Wrap the subscription in the hook with error handling and a 30s retry on `CHANNEL_ERROR`.

### Phase 3: CRITICAL Backend Fixes (3 items, need deploy)

**C7 — File: `supabase/functions/generate-proactive-insights/index.ts`**
Wrap the user loop body (lines 38-173) in per-user try/catch with `continue` so one user's failure doesn't stop all others.

**C8 — File: `supabase/functions/engage-journey-processor/index.ts`**
After marking a step as "failed" (when node not found or template deleted), add auto-advance logic: if 3+ failures on same enrollment, skip to next node or mark enrollment complete.

**C9 — File: `supabase/functions/engage-journey-processor/index.ts`**
Add processing lock: after fetching pending steps, atomically claim them with `update({ status: 'processing' }).eq('status', 'pending')` to prevent duplicate processing by concurrent runs.

### Phase 4: HIGH Frontend Fixes (6 items)

**H3 — Content Wizard SERP check**: Before triggering SERP research, check `api_keys_metadata` for active SERP key. Show clear toast if missing.

**H4 — Content Wizard empty briefs** (Backend): In content generation, validate brief has real title/keyword before generating.

**H10 — Provider switch warning** (`DefaultAiProviderSelector.tsx`): Show informational toast when user switches AI provider during a conversation.

**H11 — Onboarding skip** (`OnboardingContext.tsx`): In `skipOnboarding`, insert a default `company_info` row if none exists, so downstream features don't crash.

**M1 — Repository bulk delete** (`RepositoryBulkBar.tsx` or equivalent): Collect success/failure counts and report partial failures via toast.

**M2 — Repository metadata crash** (`ContentDetailView.tsx`): Wrap any JSON.parse calls in try/catch with safe fallback.

### Phase 5: HIGH Backend Fixes (5 items, need deploy)

**C5 enhancement** — `cross-module-tools.ts`: After publish succeeds, if the DB status update fails, return a warning message telling user content is live but status update failed.

**H7 — Proposal accept** (`proposal-action-tools.ts`): Reorder flow — insert calendar item first, only update proposal status if calendar insert succeeds.

**H8 — Stale token guidance** (`cross-module-tools.ts`): When connection lookup returns null, return message directing user to Settings → Websites to reconnect.

**H12 — Email campaign stuck** (`engage-email-send/index.ts`): After all sends complete, always update campaign status to 'sent' or 'failed' in a finally block.

**H13 — Null email body** (`engage-email-send/index.ts`): Before sending, validate `bodyHtml` is non-empty. If empty, mark campaign as failed with clear error.

### Phase 6: HIGH + MEDIUM Backend Fixes (4 items, need deploy)

**H14 — Social post orphan** (`engage-action-tools.ts`): After creating social post, if targets insert fails, delete the orphaned post and return error.

**M6 — Duplicate contact** (`engage-action-tools.ts`): Before inserting contact, check for existing email and return error if duplicate.

**M7 — Batch tagging** (`engage-action-tools.ts`): Track and report partial failures when tagging multiple contacts.

**M13 — Job runner status** (`engage-job-runner/index.ts`): Check if any sub-job result has errors, return 207 with `partial_failure` status instead of blanket 200.

### Phase 7: MEDIUM Frontend Fixes (7 items)

**M3 — Analyst health NaN** (`useAnalystEngine.ts`): Guard division in health score computation with `isNaN` checks.

**M4 — Analyst refresh loop** (`useAnalystEngine.ts`): Wrap refresh interval callback in try/catch.

**M5 — Notification polling** (`use-notifications.ts`): Add 5-minute polling fallback to re-fetch unread count.

**M8 — Calendar overdue JSON** (`overdueContentService.ts`): Wrap JSON.parse in try/catch.

**M9 — Proposals overdue parse**: Same pattern as M8.

**M11 — Video not implemented**: Add "Coming Soon" label if video generation UI is visible.

**M12 — Quality gate** (`process-content-queue/index.ts`): Verify low-SEO content gets `needs_review` status.

**M14 — Competitor empty page**: Add null guard on competitor array before mapping.

---

## Files Changed Summary

| File | Fixes |
|------|-------|
| `src/hooks/useEnhancedAIChatDB.ts` | C1, C2, H1, H2 |
| `src/pages/Analytics.tsx` | C4 |
| `src/pages/Campaigns.tsx` | C3 |
| `src/hooks/use-notifications.ts` | C6, M5 |
| `src/hooks/useAnalystEngine.ts` | M3, M4 |
| `src/components/onboarding/OnboardingContext.tsx` | H11 |
| `src/services/overdueContentService.ts` | M8 |
| `supabase/functions/generate-proactive-insights/index.ts` | C7 |
| `supabase/functions/engage-journey-processor/index.ts` | C8, C9 |
| `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` | C5, H8 |
| `supabase/functions/engage-email-send/index.ts` | H12, H13 |
| `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` | H14, M6, M7 |
| `supabase/functions/enhanced-ai-chat/proposal-action-tools.ts` | H7 |
| `supabase/functions/engage-job-runner/index.ts` | M13 |
| Various frontend components | H3, H10, M1, M2, M9, M11, M12, M14 |

**Total: 32 fixes across ~18 files. 7 already done. Backend changes require edge function redeployment.**

I recommend implementing in the phase order above — Critical first (Phases 1-3), then High (4-5), then Medium (6-7). Each phase can be approved and implemented independently.

