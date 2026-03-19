

# Fix Analyst Sidebar — Phase-by-Phase Plan

Two documents define all the work: **fix-2-59am.md** (per-conversation state isolation) and **analyst-narrative-fix-plan.md** (data-driven sections). 14 total fixes across 16 files.

---

## Phase 1: Per-Conversation State Isolation (3 files)

Fixes the core bug: Analyst opens identically for every conversation and bleeds state across chats.

**Fix A — Stop auto-open on every conversation switch**
- `src/hooks/useEnhancedAIChatDB.ts`: Add `justCreatedConversationRef`, set `true` in `createConversation`, expose in return object
- `src/contexts/AIChatDBContext.tsx`: Add `justCreatedConversation` to fallback context
- `src/components/ai-chat/EnhancedChatInterface.tsx`: Guard auto-open with `justCreatedConversation.current === true`, reset to false after opening

**Fix B — Reset engine state on conversation switch**
- `src/hooks/useAnalystEngine.ts`: Add `activeConversationId` parameter. Add reset effect that clears `crossSignalInsights`, `previousSessionInsights`, `platformData`, and all fetch refs when ID changes
- `src/components/ai-chat/EnhancedChatInterface.tsx`: Pass `activeConversation` as 5th arg to `useAnalystEngine`; change `isActive` from `true` to `isAnalystVisible` (sidebar open + type === analyst)

**Fix D — Save/restore Analyst open state per conversation**
- `src/components/ai-chat/EnhancedChatInterface.tsx`: Add `saveAnalystOpenState`/`getAnalystOpenState` localStorage helpers (capped at 30 entries). Replace conversation-switch reset effect to restore saved state. Call `saveAnalystOpenState` in `handleCloseSidebar`, analyst open handler, and auto-open for new conversations

---

## Phase 2: Quick Frontend Fixes (5 files, no backend)

All are small, isolated, zero-risk changes.

**Fix 1 — Connect PreviousSessionSection**
- `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx`: Replace placeholder comment with conditional render checking `analystState.insightsFeed.some(i => i.source === 'memory')`

**Fix 4 — Fix hardcoded "Global Reach Growth" label**
- `src/components/ai-chat/analyst-sections/PerformanceTrajectorySection.tsx` line 43: Replace `Global Reach Growth` with `{dataKeys[0]?.replace(/_/g, ' ').toUpperCase() || 'PERFORMANCE METRIC'}`

**Fix 5 — Multi data key support in chart**
- Same file: Change `dataKeys.slice(0, 1)` to `dataKeys.slice(0, 3)` with distinct colors (`#06b6d4`, `#a855f7`, `#22c55e`), add gradient defs for each

**Fix 8 — Null safety on WebIntelligenceSection**
- `src/components/ai-chat/analyst-sections/WebIntelligenceSection.tsx`: Guard `ws.results` with `(ws.results || [])` and `ws.relatedSearches` with `(ws.relatedSearches || [])`

**Fix 10 — Empty secondary action dismiss**
- `src/components/ai-chat/analyst-sections/NarrativePromptCard.tsx`: When `secondaryAction` is empty/whitespace, render a no-op dismiss button instead of calling `onSendMessage("")`

---

## Phase 3: Data-Specific Narrative Prompts (3 files)

Make NarrativePromptCard questions reference actual data instead of generic text.

**Fix 6a — HealthAssessmentSection**
- `src/components/ai-chat/analyst-sections/HealthAssessmentSection.tsx`: Reference `health.total` and `health.topCritical` in the prompt question and primary action text

**Fix 6b — StrategicDivergenceSection**
- `src/components/ai-chat/analyst-sections/StrategicDivergenceSection.tsx`: Reference actual anomaly count and first anomaly content in prompt question and action

**Fix 9 — ExploreSection cross-signal prompts**
- `src/components/ai-chat/analyst-sections/ExploreSection.tsx`: After existing topic prompts, add cross-signal warning insights as "Investigate: ..." pills

---

## Phase 4: Dynamic Headlines + New Prompts (5 files)

Replace static headlines with `getHeadline()` functions driven by actual platformData values.

**Fix 3 — Dynamic headlines for 5 sections**
- `KeywordLandscapeSection.tsx`: Headline based on keyword count (0 = "blind", <10 = "emerging", else = "{N} targets tracked")
- `CampaignPulseSection.tsx`: Headline based on campaign count + failed count (0 = "idle", failures = "{N} failures", else = "operational")
- `EngagementMetricsSection.tsx`: Headline based on contacts + email campaigns (0/0 = "dormant", both = "active", else = "partially online")
- `CompetitivePositionSection.tsx`: Headline based on competitor count (0 = "blind spot", else = "{N} signals detected")

**Fix 7 — Add NarrativePromptCards to sections that lack them**
- `KeywordLandscapeSection.tsx`: Prompt when `kwCount === 0` ("Auto-Detect Keywords" / "I'll Add Manually")
- `CampaignPulseSection.tsx`: Prompt when `queueFailed > 0` ("Retry Failed Items" / "Show Details")
- `CompetitivePositionSection.tsx`: Prompt when no competitors ("Find Competitors" / "Skip")

---

## Phase 5: Content Intelligence Rewrite + Backend Queries (2 files)

**Fix 2 — Backend: Add content-specific data points**
- `src/hooks/useAnalystEngine.ts` inside `fetchPlatformData`:
  - Add Avg SEO Score query (from `content_items` where published + seo_score not null)
  - Add Top Article by SEO query (single best article title + score, category `content_detail`)
  - Add Queue Failed/Pending counts (from `content_generation_queue`, category `campaigns`)
  - Add Contacts count + Email Campaigns count (from `engage_contacts` / `email_campaigns`, categories `engage`/`email`)

**Fix 2 — Frontend: Rewrite ContentIntelligenceSection**
- `src/components/ai-chat/analyst-sections/ContentIntelligenceSection.tsx`: Full rewrite with dynamic `getHeadline()` based on avgSeo/publishRate/drafts, top performer card, and contextual draft prompt when `drafts > 5`

---

## Files Summary

| Phase | File | Action |
|-------|------|--------|
| 1 | `useEnhancedAIChatDB.ts` | Add justCreatedConversationRef |
| 1 | `AIChatDBContext.tsx` | Add ref to fallback |
| 1 | `EnhancedChatInterface.tsx` | Auto-open guard, localStorage, engine params |
| 1 | `useAnalystEngine.ts` | Add conversationId param + reset effect |
| 2 | `AnalystNarrativeTimeline.tsx` | Render PreviousSession |
| 2 | `PerformanceTrajectorySection.tsx` | Dynamic label + multi-key chart |
| 2 | `WebIntelligenceSection.tsx` | Null safety |
| 2 | `NarrativePromptCard.tsx` | Empty secondary guard |
| 3 | `HealthAssessmentSection.tsx` | Specific prompt text |
| 3 | `StrategicDivergenceSection.tsx` | Specific prompt text |
| 3 | `ExploreSection.tsx` | Cross-signal prompts |
| 4 | `KeywordLandscapeSection.tsx` | Dynamic headline + prompt |
| 4 | `CampaignPulseSection.tsx` | Dynamic headline + failure prompt |
| 4 | `EngagementMetricsSection.tsx` | Dynamic headline |
| 4 | `CompetitivePositionSection.tsx` | Dynamic headline + prompt |
| 5 | `useAnalystEngine.ts` | New backend queries |
| 5 | `ContentIntelligenceSection.tsx` | Full rewrite |

