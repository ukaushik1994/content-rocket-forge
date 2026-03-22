

# Remove Grid View, Enhance List View with Grid Capabilities

## What
Remove the grid/tiles view toggle and grid rendering from the keywords page entirely. The list view becomes the only view. Transfer the unique features from `KeywordCard` (grid) into `KeywordListItem` so nothing is lost.

## Features to transfer from KeywordCard → KeywordListItem

| Feature | In Grid Card | In List Item | Action |
|---------|-------------|-------------|--------|
| Sparkline trend chart | Yes | No | Add |
| SERP metrics (KD, search volume) | Yes | No | Add |
| Difficulty badge (Easy/Medium/Hard) | Yes | No | Add |
| "Write About This" button | Yes | No | Add |
| Cannibalization warning box | Yes (expanded) | Badge only | Add expandable warning |
| Copy/Delete actions | Yes | Yes (dropdown) | Keep as-is |
| Content pieces expand | Yes | Yes | Keep as-is |

## Changes — 3 files

### 1. `src/components/keywords/KeywordListItem.tsx`
- Add `search_volume` and `difficulty` to the keyword interface (matching KeywordCard)
- Add the `Sparkline` SVG component (copy from KeywordCard)
- Add `DifficultyBadge` component (copy from KeywordCard)
- In the main row layout, add:
  - Sparkline + usage count indicator (right side, before actions)
  - SERP metrics row (KD badge + search volume) below the keyword name alongside existing meta
  - Difficulty badge next to existing badges
- Add "Write About This" button to the actions area (navigates to AI chat with prompt)
- Add cannibalization warning detail in the expandable section when `publishedCount > 1`

### 2. `src/components/keywords/KeywordsFilters.tsx`
- Remove `viewMode` and `onViewModeChange` props from the interface
- Remove the grid/list toggle button group (lines 60-75)

### 3. `src/pages/keywords/KeywordsPage.tsx`
- Remove `viewMode` state
- Remove `viewMode`/`onViewModeChange` props from `KeywordsFilters`
- Remove the grid view conditional branch (lines 238-256) and the `viewMode === 'list'` check — always render the list view
- Remove `KeywordCard` import
- Update loading skeleton to always use list layout (`space-y-4`)

### Files changed: 3

