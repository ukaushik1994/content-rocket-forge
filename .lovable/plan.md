

# Codebase Cleanup & Integration Plan

## Summary of Issues

### A. Dead / Orphan Pages to Remove (6 routes)
| Route | Reason |
|---|---|
| `/ai-streaming-chat` | Redirect stub to `/ai-chat` |
| `/content-type-selection` | Single-card dead-end; Content Wizard is in the + menu |
| `/repository/backfill` | Admin-only URL hack; no UI path |
| `/notifications/demo` | Dev demo page shipped to prod |
| `/enterprise` | No sidebar link, no user path |
| `/smart-actions/analytics` | Orphan page, no navigation link |
| `/workflows/history` | Orphan page, only linked from analytics tab |

### B. Research Pages to Remove (5 routes — all duplicated in sidebar panels or AI chat)
| Route | Duplication |
|---|---|
| `/research/content-strategy` | Proposals live in AI Proposals page + sidebar panel; Calendar is its own page |
| `/research/serp-intelligence` | AI chat does SERP via tools; Keywords page shows SERP data |
| `/research/topic-clusters` | AI chat `create_topic_cluster` tool + Research Intelligence sidebar |
| `/research/content-gaps` | Research Intelligence sidebar "Content Gaps" tab |
| `/research/calendar` | Keep as the only calendar route but remove from Research grouping |

**Keep `/research/calendar`** — rename route to `/calendar` and keep it in the sidebar bottom slot where it already lives.

### C. Engage Layout Cleanup
The `EngageLayout` wraps Engage pages in its own breadcrumb/background system, disconnecting from the main `AppLayout` sidebar. Since Engage is already wrapped in `AppLayout` in `App.tsx`, the `EngageLayout` just adds unnecessary padding/breadcrumbs.

**Action**: Remove `EngageLayout` wrapper. Engage pages render directly inside `AppLayout` like everything else. Keep `WorkspaceProvider`.

### D. Disconnected Services to Integrate (4 services)

1. **Conversation Memory** (`conversationMemory.ts` + `contextSummarization.ts`) — The enhanced-ai-chat backend only sends the last 10 messages. These services can enrich context sent to the backend.

2. **Content Performance Prediction** (`contentPerformancePredictionService.ts`) — Has a hook (`useContentPerformancePrediction`) but nothing calls it. Surface in Repository content detail view.

3. **Smart Calendar Scheduling** (`smartCalendarScheduling.ts`) — Already connected to proposal scheduling flows. The calendar page itself doesn't use it for manual scheduling. Wire into the calendar "add item" flow.

4. **Due Content Notifications** (`dueContentNotificationService.ts`) — Hook exists and runs but only inside `ContentStrategyEngine` (a page being removed). Move activation to `AppLayout` so it runs globally.

### E. Services to Leave Alone (not worth integrating)
- **A/B experiments** (`experiments/ab.ts`) — Only used by smart approval recommendation. Working as intended.
- **Content compliance** (`contentComplianceService.ts`) — Already used by Content Wizard's `WizardStepGenerate`. Working.
- **Adaptive prompt service** — localStorage-only, no backend. Low value, skip.
- **Content intelligence service** — Only type imports used. Low value, skip.

---

## Phased Execution Plan

### Phase 1: Remove Dead Pages & Routes
**Files to modify:**
- `src/App.tsx` — Remove 12 routes, their imports, and add redirects for any that might have bookmarks
- Delete page files:
  - `src/pages/AIStreamingChatPage.tsx`
  - `src/pages/ContentTypeSelection.tsx`
  - `src/pages/RepositoryBackfill.tsx`
  - `src/pages/NotificationDemo.tsx`
  - `src/pages/EnterpriseHubPage.tsx`
  - `src/pages/SmartActionsAnalytics.tsx`
  - `src/components/workflow/WorkflowHistoryPage.tsx`
- Delete research page files:
  - `src/pages/research/ContentStrategy.tsx`
  - `src/pages/research/SerpIntelligence.tsx`
  - `src/pages/research/TopicClusters.tsx`
  - `src/pages/research/ContentGaps.tsx`
- Rename `/research/calendar` route to `/calendar`
- Update `src/components/layout/NavItems.tsx` — Remove `/content-type-selection` from contentItems, replace with `/ai-chat` (Builder). Remove `/research/content-strategy` from contentItems. Update references to `/research/calendar` to `/calendar`.
- Update `src/components/ai-chat/ChatHistorySidebar.tsx` — Update calendar link from `/research/calendar` to `/calendar`
- Add redirect routes: `/research/content-strategy` → `/ai-chat`, `/research/*` → `/ai-chat`, `/content-type-selection` → `/ai-chat`
- Clean up any internal references (imports, navigation links) pointing to removed pages

### Phase 2: Engage Layout Cleanup
**Files to modify:**
- `src/pages/Engage.tsx` — Remove `EngageLayout` wrapper, keep `WorkspaceProvider`, render children directly
- `src/components/engage/EngageLayout.tsx` — Delete file
- `src/components/engage/shared/EngageBreadcrumb.tsx` — Delete file (no longer needed)
- Check/update any Engage sub-pages that depend on EngageLayout's styling (add appropriate container padding if needed)

### Phase 3: Wire Due Content Notifications Globally
**Files to modify:**
- `src/components/layout/AppLayout.tsx` — Add `useDueContentNotifications()` call inside `AppLayoutInner` so it runs on every authenticated page, not just the (now-deleted) ContentStrategy page

### Phase 4: Wire Conversation Memory into AI Chat
**Files to modify:**
- `src/hooks/useEnhancedAIChatDB.ts` — Before sending messages to the backend, call `getUserPreferences()` and `getConversationSummary()` to build a condensed context block that gets prepended to the messages array. This delivers on the "learns from you" promise without changing the backend.
- The edge function already accepts a messages array; we just enrich what's sent.

### Phase 5: Surface Content Performance Prediction in Repository
**Files to modify:**
- `src/components/content/repository/ContentDetailView.tsx` (or equivalent detail component) — When viewing a draft, call `useContentPerformancePrediction` and show a small prediction card (estimated score, topic gaps) below the content metadata.

### Phase 6: Wire Smart Calendar Scheduling to Calendar UI
**Files to modify:**
- `src/pages/research/Calendar.tsx` (now `/calendar`) — When adding a new calendar item, offer "AI Schedule" button that calls `smartCalendarScheduling.findOptimalSlots()` to suggest the best date/time.

---

## What Gets Deleted (file count)
- **7 page files** (dead pages)
- **4 research page files** (duplicated)
- **2 layout/component files** (EngageLayout, EngageBreadcrumb)
- **~12 route definitions** removed from App.tsx
- **0 services deleted** — all services stay; we're wiring them in, not removing them

## What Gets Added
- Redirect routes for removed pages (so bookmarks don't 404)
- Due content notification hook in AppLayout
- Conversation memory enrichment in chat DB hook
- Performance prediction card in Repository detail view
- AI scheduling button in Calendar

