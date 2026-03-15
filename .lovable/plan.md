

# Creaiter — Full Bug Fix & Feature Delivery Plan

I've verified every issue from both documents against the actual codebase. Here's the phase-by-phase plan.

---

## Status Summary

| ID | Issue | Confirmed? |
|----|-------|-----------|
| P0-01 | Anthropic uses `Bearer` instead of `x-api-key` | Yes |
| P0-02 | `...params` spread pollutes request bodies | Yes (5 locations) |
| P0-03 | CORS has `creaitesr` typo | Yes (both files) |
| P0-04 | Streaming URL has no fallback | Yes |
| P1-01 | OpenRouter referer shows `localhost:5173` | Yes |
| P1-02 | LM Studio can't work from edge functions | Yes |
| P1-03 | Webhook responses never checked | Yes |
| P1-04 | Webhook test uses `no-cors` | Yes |
| P1-05 | SerpAPI test calls API from browser | Yes |
| P1-06 | Image download crashes on expired URLs | Yes |
| P2-01 | Repository double `refreshContent()` | Yes |
| P2-02 | `deleteApiKey` doesn't normalize serpapi | Yes |
| P2-03 | Window event listener leak in App.tsx | Yes |
| P3-01 | Dead code — GlossaryBuilder (19 files) | Yes |
| P3-02 | Dead code — ContentRepurposing (9 files) | Yes |
| P3-03 | Dead code — NotificationSettings page | Yes |
| P3-04 | Duplicate CORS files | Yes |
| Audit: AI Proposals missing | **Not confirmed** — code exists and prop is passed |
| Audit: Auto-naming fails | Needs backend fix (edge function 500) |
| Audit: No error UI on 500 | Frontend UX issue |

---

## Phase 1: P0 Critical Fixes (Backend)

These 4 fixes address the core reason the AI chat returns 500 errors.

**1a. P0-01 — Fix Anthropic auth header**
- File: `supabase/functions/ai-proxy/index.ts`
- Change `'Authorization': \`Bearer ${apiKey}\`` to `'x-api-key': apiKey` in `testAnthropic` (~line 453) and `chatAnthropic` (~line 498)

**1b. P0-02 — Remove `...params` spread from all chat handlers**
- File: `supabase/functions/ai-proxy/index.ts`
- Remove `...params` from request bodies in: `chatOpenAI` (~line 210), `chatAnthropic` (~line 491), `chatOpenRouter` (~line 678), `chatMistral` (~line 786), `chatLMStudio` (~line 894)
- Add `system` param explicitly for Anthropic

**1c. P0-03 — Fix CORS URL typo**
- Files: `supabase/functions/shared/cors.ts` and `supabase/functions/_shared/cors.ts`
- Change `creaitesr` to `creaiter` in both

**1d. P0-04 — Add streaming URL fallback**
- File: `src/hooks/useStreamingAI.ts` (line 54)
- Add fallback: `import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co'`

---

## Phase 2: P1 Silent Failures

**2a. P1-01 — Fix OpenRouter HTTP-Referer**
- File: `supabase/functions/ai-proxy/index.ts` (~line 707)
- Change `localhost:5173` to `creaiter.lovable.app`, `X-Title` to `Creaiter`

**2b. P1-02 — LM Studio clear error messaging**
- File: `supabase/functions/ai-proxy/index.ts` — return 400 error for lmstudio case in serve handler

**2c. P1-03 — Add webhook response checking**
- File: `src/services/marketingIntegrationHooks.ts` — add `if (!response.ok) throw` after all 7 `fetch()` calls

**2d. P1-04 — Fix webhook test (remove `no-cors`)**
- File: `src/components/enterprise/ThirdPartyIntegrations.tsx` (~line 256) — remove `mode: "no-cors"`, add proper response/error handling

**2e. P1-05 — Route SerpAPI test through edge function**
- File: `src/utils/apiKeyTestUtils.ts` (~line 108) — replace direct `fetch` with `supabase.functions.invoke('api-proxy')`

**2f. P1-06 — Handle expired image URLs**
- File: `src/components/ai-chat/GeneratedImageCard.tsx` (~line 82) — add `if (!response.ok)` check with toast

---

## Phase 3: P2 UX Bugs

**3a. P2-01 — Remove duplicate refresh**
- File: `src/pages/Repository.tsx` (lines 29-30) — remove one `refreshContent()` call

**3b. P2-02 — Normalize serpapi in deleteApiKey**
- File: `src/services/apiKeyService.ts` (~line 217) — add `const normalizedService = service === 'serpapi' ? 'serp' : service;`

**3c. P2-03 — Remove leaked event listener**
- File: `src/App.tsx` (~lines 201-208) — delete the module-level `window.addEventListener('openSettings', ...)` block

---

## Phase 4: P3 Dead Code Cleanup

**4a. P3-01 — Delete GlossaryBuilder** (19 files)
- Delete `src/pages/GlossaryBuilder.tsx`, `src/contexts/glossary-builder/`, `src/components/glossary-builder/`, and verify no remaining imports

**4b. P3-02 — Delete ContentRepurposing** (9 files)
- Delete `src/pages/ContentRepurposing.tsx`, `src/pages/content-repurposing/`, dead component files — verify imports first

**4c. P3-03 — Delete NotificationSettings page**
- Delete `src/pages/NotificationSettings.tsx`

**4d. P3-04 — Consolidate CORS files**
- Keep `supabase/functions/shared/cors.ts`, update all imports from `_shared/cors` to `shared/cors`, delete `_shared/cors.ts`

---

## Phase 5: Walkthrough Audit Fixes (Frontend UX)

**5a. Add error state UI when backend returns 500**
- Show "Something went wrong. Retry?" in the chat when AI response fails, instead of silently clearing the spinner

**5b. Fix auto-naming** (should work once backend is fixed — verify after Phase 1)

---

## Execution Approach

We'll go **one phase at a time**, implementing all items within a phase, then confirming before moving to the next. After all phases, I'll produce a final checklist of everything completed vs. still outstanding.

Shall I start with **Phase 1: P0 Critical Fixes**?

