

# Plan: Deprecate Content Builder

## Key Discovery

The Content Builder has two layers:
1. **UI Layer** — the `/content-builder` page, route, and step-based wizard components (~30 files in `src/components/content-builder/`)
2. **Shared Layer** — the context types in `src/contexts/content-builder/types/` are imported by **181 files** including Solutions, Campaigns, Research, and the Wizard itself

We **cannot** delete the shared types. We deprecate the UI and redirect users.

## Phase 1: Redirect the Route (Safe, immediate)

**`src/App.tsx`**
- Replace the `/content-builder` route with a redirect to `/ai-chat` (the Wizard)
- Remove the `ContentBuilderPage` import

**`src/pages/ContentBuilder.tsx`**
- Replace entire file with a `<Navigate to="/ai-chat" replace />` redirect component

## Phase 2: Update All Navigation References (~15 files)

Change every `navigate('/content-builder')` to `navigate('/ai-chat')` in:
- `src/components/dashboard/WelcomeSection.tsx`
- `src/components/dashboard/QuickActionsGrid.tsx`
- `src/components/dashboard/EnhancedQuickActions.tsx`
- `src/components/repository/RepositoryHeader.tsx`
- `src/components/repository/RepositoryHero.tsx`
- `src/components/drafts/DraftsHeader.tsx`
- `src/components/drafts/list/EmptyState.tsx`
- `src/components/analytics/ContentAnalyticsTab.tsx`
- `src/components/ai-chat/ModernActionButtons.tsx`
- `src/components/research/content-strategy/opportunity/BriefModal.tsx`
- `src/hooks/useEnhancedAIChatDB.ts`
- `src/services/aiService.ts`
- `src/pages/ContentTypeSelection.tsx`

Update labels from "Content Builder" to "Content Wizard" or "Create Content" where shown in UI text.

## Phase 3: Keep Shared Infrastructure (No changes)

The following stay **untouched** — they are shared platform types, not builder-specific:
- `src/contexts/content-builder/types/` (solution types, company types, offering types, etc.)
- `src/contexts/content-builder/ContentBuilderContext.tsx` (used by Solutions page and Strategy Dialog)
- `src/contexts/ContentBuilderContext.tsx` (re-export wrapper)

## Phase 4: Remove Builder UI Components (Optional, future cleanup)

These components become dead code after Phase 1-2 but are safe to leave for now:
- `src/components/content-builder/` (the step wizard UI)
- `src/pages/ContentBuilder.tsx` (after redirect)
- `src/hooks/useFinalReview.ts` and `src/hooks/final-review/`

**Not removing now** because the `StrategyBuilderDialog` still imports `SerpAnalysisStep` from the builder, and Solutions page wraps in `ContentBuilderProvider`.

## Summary

| Phase | Action | Files Changed | Risk |
|-------|--------|---------------|------|
| 1 | Redirect route | 2 | None |
| 2 | Update nav references | ~15 | Low |
| 3 | Keep shared types | 0 | None |
| 4 | Dead code cleanup | Deferred | — |

Total: ~17 files changed. No functionality lost — users land on the superior Wizard instead.

