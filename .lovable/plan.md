

# Fix Plan: API Key Security + Quick Action + Stale Routes

## Phase A: Fix API Key Resolution (P0 — 2 edge function files)

Both `generate_full_content` and `create_topic_cluster` read `api_key` directly from `ai_service_providers` which is always empty (keys are in the encrypted `api_keys` table). This breaks article generation and topic clusters.

**Fix pattern** (matches what `index.ts` line 2015 already does):

### File 1: `supabase/functions/enhanced-ai-chat/content-action-tools.ts` (lines 425-431)
- Remove `api_key` from the select: `.select('provider, preferred_model')`
- After getting provider, import and call `getApiKey(provider.provider, userId)`
- Pass decrypted key to ai-proxy via `apiKey` field in the request body params

### File 2: `supabase/functions/enhanced-ai-chat/keyword-action-tools.ts` (lines 241-246)
- Same fix: remove `api_key` from select, use `getApiKey()` to decrypt, pass to ai-proxy

Both functions need redeployment after edit.

---

## Phase B: Fix Quick Action Hardcoded Keyword (P2 — 1 file)

### File: `src/components/ai-chat/EnhancedQuickActions.tsx` (line 13)
- Change prompt from `'Add keyword "content marketing" and run SERP analysis'` to `'Help me research and find the best keywords for my niche'`

---

## Phase C: Fix Stale `/research/*` Route References (P2 — 10 files)

| File | Line(s) | Current | Replacement |
|---|---|---|---|
| `src/utils/notificationHelpers.ts` | 154 | `/research/keyword-research` | `/keywords` |
| `src/services/overdueContentService.ts` | 183, 200 | `/research/content-strategy#calendar` | `/calendar` |
| `src/services/notificationIntegrations.ts` | 145, 172, 192 | `/research/content-gaps`, `/research/topic-clusters` | `/ai-chat` |
| `src/services/aiService.ts` | 151 | `navigate:/research/keyword-research` | `navigate:/keywords` |
| `src/components/dashboard/DashboardSummary.tsx` | 152 | `/research/opportunity-hunter` | `/ai-chat` |
| `src/components/dashboard/QuickActions.tsx` | 56 | `/research/competitor-analysis` | `/ai-chat` |
| `src/components/dashboard/ModuleCarouselData.ts` | 49, 52 | `/research/keyword-research`, `/research/competitor-analysis` | `/keywords`, `/ai-chat` |
| `src/components/ai-chat/QuickActionsPanel.tsx` | 33 | `navigate:/research/keyword-research` | `navigate:/keywords` |
| `src/components/analytics/ContentAnalyticsCard.tsx` | 163 | `/research/serp?keyword=...` | `/keywords?keyword=...` |
| `src/components/research/content-strategy/KeywordLibraryStats.tsx` | 109, 246 | `/research/keyword-research` | `/keywords` |
| `src/components/ai-chat/StreamingMessageBubble.tsx` | 81 | `/research` | `/keywords` |

---

## Execution Order
1. **Phase A** first (P0 — unblocks core features)
2. **Phase B + C** in parallel (P2 — route cleanups)

Total: ~13 files modified, 2 edge functions redeployed.

