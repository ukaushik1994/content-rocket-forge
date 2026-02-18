

# Delete Research Hub Page Completely

## Scope

Remove the Research Hub page, its navigation entry, all routes, all dedicated components, and all references across the codebase.

## Changes

### 1. Remove Nav Item (`src/components/layout/NavItems.tsx`)
- Delete lines 151-157 (the Research Hub `NavItem` block)

### 2. Remove Routes (`src/App.tsx`)
- Delete the `/research/research-hub` route (line 153)
- Delete the redirect routes that point to it:
  - `/research/keyword-research` -> redirect to research-hub (line 155)
  - `/research/answer-the-people` -> redirect to research-hub (line 156)
  - `/research` -> redirect to research-hub (line 181)

### 3. Delete Page File
- `src/pages/research/ResearchHub.tsx`

### 4. Delete All Research Hub Components (entire folder)
- `src/components/research/research-hub/ContentPipelineTab.tsx`
- `src/components/research/research-hub/EnhancedContentGapsTab.tsx`
- `src/components/research/research-hub/EnhancedPeopleQuestionsTab.tsx`
- `src/components/research/research-hub/KeywordIntelligenceTab.tsx`
- `src/components/research/research-hub/KeywordResearchTab.tsx`
- `src/components/research/research-hub/KeywordSerpTab.tsx`
- `src/components/research/research-hub/PeopleQuestionsTab.tsx`
- `src/components/research/research-hub/ResearchDataExporter.tsx`
- `src/components/research/research-hub/ResearchHubHero.tsx`
- `src/components/research/research-hub/ResearchInsightsTab.tsx`

### 5. Update References
- `src/hooks/useEnhancedAIChatDB.ts`: Change navigation from `/research/research-hub` to `/research/content-strategy` (lines 474, 487)
- `src/components/dashboard/SetupChecklist.tsx`: Change route from `/research/research-hub` to `/research/content-strategy` (line 81)
- `src/components/ai-chat/ModernActionButtons.tsx`: Change navigation from `/research/research-hub` to `/research/content-strategy` (line 147)
- `src/services/notificationIntegrations.ts`: Change URL from `/research/research-hub` to `/research/content-strategy` (line 119)
- `src/App.tsx`: Remove the `ResearchHub` import

### 6. Also Delete Legacy Pages That Redirected to Research Hub
- `src/pages/research/KeywordResearch.tsx` (route already redirects to research-hub)
- `src/pages/research/AnswerThePeople.tsx` (route already redirects to research-hub)

## Summary

| Action | Count |
|--------|-------|
| Files deleted | 13 (1 page + 10 components + 2 legacy pages) |
| Files modified | 5 (NavItems, App.tsx, useEnhancedAIChatDB, SetupChecklist, ModernActionButtons, notificationIntegrations) |

All references that previously pointed to `/research/research-hub` will be redirected to `/research/content-strategy` (Strategy page) as the closest replacement.

