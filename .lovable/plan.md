

# Fix Plan — Make Everything Real (7 Active Phases + 6 Deferred)

45 items total: 32 active fixes, 6 deferred infrastructure items, 1 explicitly ignored.

---

## Phase 1: Remove Fake UI (6 items, ~30 min)

| # | Action | What | File |
|---|--------|------|------|
| 1.1 | REMOVE | Analytics "Performance" tab — hardcoded fake session/bounce data | `src/pages/Analytics.tsx` — delete tab option + `TabsContent value="performance"` block |
| 1.2 | REMOVE | "Save Context" button — toast with no storage | `src/components/ai-chat/AdvancedChatFeatures.tsx` |
| 1.3 | REMOVE | "Smart Suggestions" section — hardcoded placeholder strings | Same file |
| 1.4 | REMOVE | Screen Capture button — auto-disabling stub | Same file |
| 1.5 | REMOVE | Collaboration features — typing indicators, collaborator status | Same file |
| 1.6 | IGNORE | `summary` DB column — leave as-is, invisible to users | No changes |

---

## Phase 2: Honest Labels (5 items, ~30 min)

| # | Action | What | File |
|---|--------|------|------|
| 2.1 | LABEL | Analytics titles claim "Google Analytics" — change to "Content Performance (Internal)" | `src/pages/Analytics.tsx` |
| 2.2 | LABEL | Traffic/impression numbers show as real data — append "(est.)" + tooltip | `ProposalCard.tsx` + topic cluster displays |
| 2.3 | LABEL | Fact-check warning implies verification — change to "Statistics detected, not verified" | `content-action-tools.ts` (edge fn) |
| 2.4 | LABEL | AI detection score implies blocking — add "informational only" note | `WizardStepGenerate.tsx` |
| 2.5 | HIDE | Keyword difficulty filter shown when no keywords have difficulty data | Keywords page filter component |

---

## Phase 3: Wire Disconnected Systems (5 items, ~2 hrs)

| # | Action | What | Files |
|---|--------|------|-------|
| 3A | WIRE | Conversation memory — `learnUserPreference` and `recordLearnedPattern` are defined but never called on user messages or feedback | `useEnhancedAIChatDB.ts` (call learn functions), `enhanced-ai-chat/index.ts` (read prefs into prompt). May need `user_preferences` table migration. |
| 3B | WIRE | Intelligence profile aggregation — `aggregate-user-intelligence` edge fn exists, nothing calls it | `engage-job-runner/index.ts` — add daily trigger |
| 3C | WIRE | Analyst benchmarks — `BENCHMARKS` + `getUserStage()` defined but `getMetricContext()` never receives stage | `useAnalystEngine.ts` — pass `userStage` to all `getMetricContext` calls |
| 3D | WIRE | Feedback thumbs — `feedback_helpful` saved to DB but never read back into prompt | `enhanced-ai-chat/index.ts` — count negatives, inject quality alert |
| 3E | WIRE | Publish event signal — `content_performance_signals` misses publish events | `cross-module-tools.ts` + `content-action-tools.ts` — insert signal on publish/approve |

**DB migration needed**: `user_preferences` table (if not exists) with RLS.

---

## Phase 4: Fix Real Bugs (5 items, ~1.5 hrs)

| # | Action | What | Files |
|---|--------|------|-------|
| 4A | FIX | Streaming shows all-at-once instead of word-by-word — update message state on every SSE `progress` event, add blinking cursor | `useEnhancedAIChatDB.ts` (SSE loop), `EnhancedMessageBubble.tsx` (cursor) |
| 4B | FIX | Regenerate prepends hack text — should delete old response + resend original user message | `EnhancedChatInterface.tsx` |
| 4C | FIX | Message edit doesn't trigger new AI response — should delete subsequent messages + resend | `useEnhancedAIChatDB.ts` or `EnhancedChatInterface.tsx` |
| 4D | FIX | Email template is bare `<body>` — add header, styled content, footer with unsubscribe | `cross-module-tools.ts` (both `content_to_email` and `campaign_content_to_engage`) |
| 4E | FIX | Approval workflow has no enforcement — block resubmit of unmodified rejected content, quality gate on approve (SEO < 20) | `content-action-tools.ts` |

---

## Phase 5: Surface Silent Failures (4 items, ~45 min)

| # | Action | What | Files |
|---|--------|------|-------|
| 5A | FIX | Content enrichment failures invisible — after `Promise.allSettled()`, warn user which enrichments failed | `content-action-tools.ts` |
| 5B | FIX | Analyst shows stale data silently — add `lastRefreshError` + `dataAgeSeconds` to state, show "Last updated Xm ago" | `useAnalystEngine.ts`, `AnalystNarrativeTimeline.tsx` |
| 5C | FIX | Session memory timestamp bug — restored insights appear fresh; prefix with actual age | `useAnalystEngine.ts` |
| 5D | FIX | File upload fails silently when bucket missing — show error toast | `FileUploadHandler.tsx` or upload handler |

---

## Phase 6: Analyst Sections Show Real Data (4 items, ~1 hr)

| # | Action | What | Files |
|---|--------|------|-------|
| 6A | FIX | CompetitivePositionSection — query `company_competitors` table instead of text-parsing topics | `CompetitivePositionSection.tsx` |
| 6B | FIX | KeywordLandscapeSection — query `keywords` table for real keyword data | `KeywordLandscapeSection.tsx` |
| 6C | FIX | CampaignPulseSection — query `campaigns` table for name/status breakdown | `CampaignPulseSection.tsx` |
| 6D | FIX | Empty sections hide completely — show onboarding nudges instead of `return null` | All 4 analyst section components |

---

## Phase 7: Content Generation Quality (2 items, ~30 min)

| # | Action | What | Files |
|---|--------|------|-------|
| 7A | FIX | SERP selections not explicitly in user prompt — append selected items to generation prompt | `src/services/advancedContentGeneration.ts` |
| 7B | FIX | No word count feedback — show info note when generated content deviates >25% from target | `WizardStepGenerate.tsx` |

---

## Phase 8: Deferred Infrastructure (6 items — NOT built now)

These each need new DB tables + UI. Blueprints are documented. Build when ready:

| # | Feature | Blocker |
|---|---------|---------|
| 8.1 | M1-3 Content Value Metric | No `content_value_score` column or formula |
| 8.2 | M1-5 Cross-Content Consistency | No brand voice model or claim extraction |
| 8.3 | M1-9 Proposal Validation | No Google Search Console integration |
| 8.4 | M1-15 Funnel Stage Tagging | No `funnel_stage` column or wizard UI |
| 8.5 | M1-16 Outline Learning | Outlines not saved to DB yet |
| 8.6 | M1-21 User Goals Tracking | No `user_goals` table or goal-setting UI |

---

## Execution Rules

1. Each phase is completed fully before starting the next
2. Edge function changes deploy after each backend phase
3. If a migration or deploy blocks, I stop and report immediately
4. Phase 8 items are documented but NOT implemented — only built when you say go

## Totals

- **32 active items** across 7 phases (~6.5 hrs estimated)
- **6 deferred items** with full blueprints ready
- **1 ignored** (dead DB column)

Ready to start Phase 1 on your go.

