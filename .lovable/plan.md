

# Remaining Fixes — Phase-by-Phase Plan

After cross-referencing the uploaded document against the current codebase, here is the status and execution plan.

---

## Already Fixed (skip these)

| Item | Evidence |
|------|----------|
| Fix 7 (Context limit) | Lines 419-425: first message + last 9 already implemented |
| Loading placeholder | Line 391: already shows "Analyzing your request..." with rotating steps |

---

## Still Open — 14 items across 5 phases

### Phase 1: Unblock AI Chat (P0 — critical)

**P0-0: Provider key lookup uses plaintext column — chat fails**
- `enhanced-ai-chat/index.ts` line 1700 selects `api_key` from `ai_service_providers` and line 1728 filters on it being non-empty
- Fix: Stop selecting `api_key`, use `shared/apiKeyService.ts` `getApiKey()` to decrypt from `api_keys` table instead
- This also fixes P1-1 (plaintext keys)

**P0-2: SERP tool uses wrong service name `'serpapi'` instead of `'serp'`**
- `keyword-action-tools.ts` line 164: `getApiKey('serpapi', userId)` — but keys stored as `service = 'serp'`
- Fix: Change to `getApiKey('serp', userId)`. Also add normalization in `shared/apiKeyService.ts` as safety net.

**P1-6: No error UI when backend fails**
- Lines 491-495: silently removes placeholder, shows easily-missed toast
- Fix: Replace placeholder with error message containing retry + settings buttons instead of removing it

**P1-7: Auto-naming fails on backend error**
- Lines 475-490: title update is after AI response, inside try block
- Fix: Move title update to right after user message is added, before AI call

---

### Phase 2: Security Fixes (P1)

**P1-1: Plaintext keys written to ai_service_providers**
- `src/services/apiKeyService.ts` lines 418-431 (update path) and 444-468 (insert path) decrypt and write plaintext keys
- Fix: Remove `api_key` from both update and insert objects — edge functions now use encrypted `api_keys` table directly (after Phase 1 P0-0 fix)

**P1-2: Email builder BlockRenderer unsanitized HTML**
- `BlockRenderer.tsx` line 182 and line 252: `dangerouslySetInnerHTML` without DOMPurify
- Fix: Import DOMPurify, wrap both usages

**P1-3: HubSpot API key sent from browser**
- `marketingIntegrationHooks.ts` line 252: direct `fetch` to `hubapi.com` with key in header
- Fix: Add a prominent console warning and toast. Full fix (edge function proxy) is out of scope for now.

**P1-4: .gitignore missing .env files**
- Current `.gitignore` has no `.env` entries
- Fix: Add `.env`, `.env.*`, `.env.local`, `.env.production`

**P1-5: Social poster activity log shows "social_failed"**
- `engage-social-poster/index.ts` line 76: uses `social_failed` when `allPosted` is false
- Fix: Change to `social_pending` with honest messaging

---

### Phase 3: UX & Code Quality (P2)

**P2-1 / P3-2: Dead LM Studio handlers (~100 lines)**
- `ai-proxy/index.ts` lines 825-928: `handleLMStudio`, `testLMStudio`, `chatLMStudio` — unreachable because line 87 returns error before reaching them
- Fix: Delete all three functions

**P2-3: Glossary references still in code**
- `NavItems.tsx` line 157: `/glossary-builder` in route array
- `ContentDetailModal.tsx` line 277: navigates to `/glossary-builder`
- `RepositoryDetailView.tsx` line 90: same
- `EmptyState.tsx` line 53: navigates to `/glossary-builder`
- Fix: Remove from NavItems, change navigations to `/ai-chat`

**P2-4: Content-repurposing components**
- 27 files still import from `src/components/content-repurposing/` — these are actively used by ContentRepurposingModal, RepurposePanel, ContentBuilder, etc.
- Status: **Keep** — these are live components, only the page files were dead

---

### Phase 4: Build & Cleanup (P3)

**P3-1: Console logs in production**
- 1,143 console calls ship in production
- Fix: Add `esbuild: { drop: mode === 'production' ? ['console', 'debugger'] : [] }` to `vite.config.ts`

**P3-3: Hardcoded Supabase URL**
- Low priority, Lovable-generated pattern. Skip — document only.

**P3-4: `transition: all` performance**
- 330 elements affected. Plugin-level issue. Skip for now — note for future optimization.

---

### Phase 5: Streaming (P0-1) — Optional / Complex

**P0-1: AI Chat has no real streaming**
- Currently blocks 5-30s with fake rotating text
- Implement Option B: Convert `enhanced-ai-chat` to return `ReadableStream` with progress events during tool execution, then stream final AI response tokens
- Frontend: Replace `supabase.functions.invoke()` with direct `fetch()` + stream reader
- This is the biggest UX improvement but also the highest-effort item (2-4 hours)

---

## Summary

| Phase | Items | Effort |
|-------|-------|--------|
| 1: Unblock AI Chat | P0-0, P0-2, P1-6, P1-7 | 45 min |
| 2: Security | P1-1, P1-2, P1-3, P1-4, P1-5 | 30 min |
| 3: UX & Quality | P2-1, P2-3, P2-4 (keep) | 15 min |
| 4: Build Cleanup | P3-1 | 5 min |
| 5: Streaming | P0-1 | 2-4 hrs |

