

# Implementation Checklist — Status Report

## Phase 1: Remove Dead Pages & Routes

| Item | Status | Notes |
|---|---|---|
| Remove `/ai-streaming-chat` route | ✅ Done | Redirect to `/ai-chat` in App.tsx line 153 |
| Remove `/content-type-selection` route | ✅ Done | Redirect to `/ai-chat` in App.tsx line 154 |
| Remove `/repository/backfill` route | ✅ Done | Redirect to `/repository` in App.tsx line 155 |
| Remove `/notifications/demo` route | ✅ Done | Redirect to `/ai-chat` in App.tsx line 156 |
| Remove `/enterprise` route | ✅ Done | Redirect to `/ai-settings` in App.tsx line 157 |
| Remove `/smart-actions/analytics` route | ✅ Done | Redirect to `/analytics` in App.tsx line 158 |
| Remove `/workflows/history` route | ✅ Done | Redirect to `/ai-chat` in App.tsx line 159 |
| Delete `AIStreamingChatPage.tsx` | ✅ Done | File no longer exists |
| Delete `ContentTypeSelection.tsx` | ✅ Done | File no longer exists |
| Delete `RepositoryBackfill.tsx` | ✅ Done | File no longer exists |
| Delete `NotificationDemo.tsx` page | ⚠️ Partial | Route removed, but `src/components/notifications/NotificationDemo.tsx` component still exists (orphan) |
| Delete `EnterpriseHubPage.tsx` | ⚠️ Partial | Page deleted, but `src/components/enterprise/EnterpriseHub.tsx` component still exists (orphan) |
| Delete `SmartActionsAnalytics.tsx` | ⚠️ Partial | Page deleted, but `src/hooks/analytics/useSmartActionsAnalytics.ts` hook still exists (orphan) |
| Delete `WorkflowHistoryPage.tsx` | ✅ Done | File no longer exists |

## Phase 1B: Remove Research Pages

| Item | Status | Notes |
|---|---|---|
| Delete `ContentStrategy.tsx` | ✅ Done | `src/pages/research/` only contains `Calendar.tsx` |
| Delete `SerpIntelligence.tsx` | ✅ Done | |
| Delete `TopicClusters.tsx` | ✅ Done | |
| Delete `ContentGaps.tsx` | ✅ Done | |
| Rename `/research/calendar` to `/calendar` | ✅ Done | Route at line 144, redirect at line 164 |
| Add redirect routes for removed research pages | ✅ Done | Lines 160-166 |

## Phase 2: Engage Layout Cleanup

| Item | Status | Notes |
|---|---|---|
| Remove `EngageLayout.tsx` | ✅ Done | No references found in codebase |
| Remove `EngageBreadcrumb.tsx` | ✅ Done | No references found in codebase |
| Engage uses `WorkspaceProvider` only | ✅ Done | `Engage.tsx` wraps in `WorkspaceProvider` directly |
| Engage wrapped in `AppLayout` in App.tsx | ✅ Done | Line 150 |

## Phase 3: Wire Due Content Notifications Globally

| Item | Status | Notes |
|---|---|---|
| `useDueContentNotifications()` in `AppLayoutInner` | ✅ Done | Line 23 of AppLayout.tsx |

## Phase 4: Wire Conversation Memory into AI Chat

| Item | Status | Notes |
|---|---|---|
| Import `getUserPreferences` in `useEnhancedAIChatDB` | ✅ Done | Line 10 |
| Call `getUserPreferences()` before sending messages | ✅ Done | Lines 422-426 enrich context with preferences |

## Phase 5: Surface Content Performance Prediction in Repository

| Item | Status | Notes |
|---|---|---|
| `useContentPerformancePrediction` in `ContentDetailView` | ✅ Done | Line 30, with predict button and results card |

## Phase 6: Wire Smart Calendar Scheduling to Calendar UI

| Item | Status | Notes |
|---|---|---|
| `smartCalendarScheduling` in `CalendarItemDialog` | ✅ Done | Imported at line 12, used for AI scheduling |

---

## Summary

**Fully complete**: 20 of 23 items

**Remaining orphan files to clean up** (3 items):

1. `src/components/notifications/NotificationDemo.tsx` — Component file still exists even though the page/route was removed. Should be deleted.
2. `src/components/enterprise/EnterpriseHub.tsx` — Component file still exists even though the page/route was removed. Should be deleted.
3. `src/hooks/analytics/useSmartActionsAnalytics.ts` — Hook still exists even though the page was removed. Should be deleted.

### Plan: Delete 3 orphan files
- Delete `src/components/notifications/NotificationDemo.tsx`
- Delete `src/components/enterprise/EnterpriseHub.tsx` (and any sub-components in `src/components/enterprise/`)
- Delete `src/hooks/analytics/useSmartActionsAnalytics.ts`

No other code references these files, so deletion is safe.

