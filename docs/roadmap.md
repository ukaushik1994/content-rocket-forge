# Creaiter — Complete Roadmap

> **Last updated:** 2026-03-22
> **Current state:** Phase 1 complete. All critical/high/medium fixes done. Tool is functional and self-learning.

---

## STATUS SNAPSHOT

### What's Done (everything below is verified in code)

**Foundation:**
- 80/80 Major items (23 Ship Blockers, 25 Month 1, 32 parked Tier 3)
- 37/37 Fix Plan items
- 9/9 Critical break points fixed
- 15/15 High break points fixed
- 25/25 Medium break points fixed (Phase 1D — last one pushed by Claude)

**AI Chat:**
- Priority rules + chart/tool decision trees in prompt
- Tool disambiguation (content creation, email, social, improvement)
- Tool result presentation rules + capability boundaries
- Tool filtering (core fallback, deprecated tools hidden, compressed descriptions)
- Dynamic temperature (0.2 lookups, 0.4 chat, 0.8 content generation)
- Gemini response normalization (inline in ai-proxy)
- Gemini max output 32K
- Brand voice overridable per request
- Conversation goal auto-updates on topic shift
- Data freshness note for long conversations
- Response safety fallback parser

**Analyst:**
- Content-based anomaly IDs (no duplicates)
- Stage-aware health score targets
- NaN/division-by-zero guards
- Refresh loop crash protection
- Session memory filtered by current topic
- Strategic recommendation trajectory-aware
- Analyst state passed to AI (partial — via window.__analystSummary)
- Analyst refresh after AI tool actions

**Self-Learning:**
- Learns from user messages (shorter/longer/casual/formal preferences)
- Learns from positive AND negative feedback
- recordLearnedPattern wired (tracks frequent actions + topics)
- Edit patterns tracked and injected into content generation
- Confidence threshold fixed (0.4)
- Learned patterns + preferences injected into AI prompt

**API & Providers:**
- 3 tables consolidated to 2 (api_keys + ai_service_providers)
- OpenRouter migrated off legacy table
- Auto-detect models from provider API
- Self-heal on retired models (404 retry)
- Default AI Provider selector wired
- Dead providers removed (6)

**Data Safety:**
- User_id filters on all analyst queries
- Duplicate contact detection
- Batch tagging error reporting
- Bulk delete partial failure reporting
- Email blank body validation
- Social post target rollback on failure
- Journey duplicate processing lock
- Journey failed step auto-advance
- Cron job runner partial_failure status
- Proactive insights per-user error isolation

---

## PHASE 1: Code Quality Fixes — COMPLETE ✅

All 25 items implemented. Nothing remaining.

---

## PHASE 2: UI Improvements — COMPLETE ✅

Implemented by Claude (matching existing theme/style).

| # | What | Why | Priority |
|---|------|-----|----------|
| 1 | **Conversation goal label in chat header** | Goal is auto-detected and updates on topic shift, but user can never see it. Small label/badge next to conversation title. | Medium |
| 2 | **Settings: legacy key re-entry UI** | Users with old encrypted key format hit a dead end — error says LEGACY_KEY_REQUIRES_REENTRY but no UI catches it. Need a modal: "Please re-enter your API key." | High |
| 3 | **Settings: provider switch warning** | When switching AI provider during an active conversation, show toast: "New messages will use [provider]. Current in-flight messages will complete with the previous provider." | Low |
| 4 | **Keywords: error state with retry** | When keyword fetch fails, page looks empty with no error. Add "Failed to load keywords. Retry" message. | Medium |
| 5 | **Competitor: empty state** | If competitors array is undefined (not just empty), mapping crashes. Add guard. | Medium |
| 6 | **Video: label or hide** | Video generation providers are listed but not fully implemented. Either hide them or add "Coming Soon" label. | Low |
| 7 | **Campaign: detail null guard** | Campaign detail view crashes when contentBriefs is undefined. Add null guard. | Medium |

**Time estimate:** ~1-2 hours in Lovable.

---

## PHASE 3: AI Model Optimization — COMPLETE ✅

All implemented by Lovable in earlier sessions.

| # | What | Impact | Effort |
|---|------|--------|--------|
| 1 | **Smart model routing** | Route cheap queries to `gemini-2.0-flash` and premium queries to `gemini-2.5-pro`. Your intent detection already distinguishes them. | 90%+ cost savings on routine queries |
| 2 | **Expand context window** | Change from first + last 5 messages to first + last 15. Gemini's 1M context can handle it. Summarization threshold from 25 to 50. | Users stop losing mid-conversation context |
| 3 | **Compress tool definitions** | For non-action queries, send only tool name + first sentence of description instead of full schema. Already partially done. | ~2000 fewer tokens per request |
| 4 | **Skip platform knowledge for returning users** | If user has 10+ conversations, they know the platform. Skip the 2500-token PLATFORM_KNOWLEDGE_MODULE. Already partially done. | Faster responses |
| 5 | **Lazy-load chart modules** | Only include CHART_MODULE/MULTI_CHART_MODULE when query mentions data/analytics. Already partially done. | ~1000 fewer tokens for non-data queries |

**Time estimate:** ~1 hour of backend changes. Claude can do this.
**When:** When you're ready to optimize costs. Not blocking launch.

---

## PHASE 4: Post-Launch — PARTIALLY COMPLETE

| # | What | Status |
|---|------|--------|
| 1 | **Rate limiting** | **DONE** — 30 req/min per user via llm_usage_logs |
| 2 | **CORS lockdown** | **DONE** — unknown origins get production URL, not `*` |
| 3 | **Soft delete enforcement** | **DONE** — content + conversations use deleted_at |
| 4 | **Token usage tracking** | **DONE** — llm_usage_logs + UsageSettingsTab |
| 5 | **Google Analytics sync** | DEFERRED — edge functions exist, needs user credentials |
| 6 | **Social platform APIs** | DEFERRED — drafts-only for now |
| 7 | **Team features** | DEFERRED — single user for now |
| 8 | **Billing (Stripe)** | DEFERRED — when ready to charge |
| 9 | **Integration tests** | DEFERRED — before scaling |
| 10 | **Mobile responsiveness** | DEFERRED — when mobile users report issues |

---

## PHASE 5: Tier 3 Features (user-driven)

32 items from Major 80 Tier 3. Not planned. Built only when real users request them:
- A/B test content variations
- Content dependency tracking
- Multi-language support
- Content pillar-cluster orchestration
- Campaign ROI tracking
- Google indexing verification
- Per-channel brand voice
- And 25 more (full list in docs/major80.md)

---

## WHAT TO DO RIGHT NOW

| Priority | Action | Who |
|----------|--------|-----|
| **1** | Give Phase 2 list to Lovable (7 UI fixes) | You → Lovable |
| **2** | Test the tool end-to-end as a real user | You |
| **3** | Phase 3 AI optimization when ready | Claude |
| **4** | Launch to first users | You |
| **5** | Phase 4 based on user feedback | Claude + Lovable |

---

## LOCAL DEVELOPMENT

### Run frontend locally:

```bash
cd /Users/URK/content-rocket-forge
npm install          # first time only
npm run dev          # starts at http://localhost:5173
```

Connects to live Supabase (same DB, same edge functions, same auth).

### Push changes:

```bash
git add <files>
git commit -m "description"
git push origin main
```

### Ground rules:
1. Always `git pull` before making changes
2. Don't change while Lovable is working
3. Commit small — one fix per commit
4. Edge functions deploy when Lovable syncs
