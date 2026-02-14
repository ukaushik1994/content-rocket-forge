

# Redesign KeywordSelectionStep - Cleaner Layout with Auto-Popup

## What Changes

### 1. Move Stats Above the Search Bar
The 3 stat badges (15+ SERP Features, 200+ Data Points, < 30s Analysis Time) move from **below** the search bar to **above** it, sitting between the subtitle text and the search input.

### 2. Remove Everything Below the Search Bar
Delete the entire "Dynamic Content Area" below the search bar:
- The "Ready to Analyze" welcome state (spinning search icon, text)
- The inline SERP results area (the big glassmorphic card with "SERP Intelligence", InlineSerpAnalysis, DataSourceIndicator)
- The loading/analyzing spinner state
- The "No Data Available" empty state

The page becomes clean -- just hero + stats + search bar + content config below.

### 3. Auto-Open SERP Modal After Search
When `analyzeKeyword` completes and `serpData` becomes available, automatically open the existing `SerpAnalysisModal` popup. The user gets all their SERP data (volume, questions, headings, gaps, keywords) in the familiar centered modal instead of inline.

### 4. Add Content Type/Solution Selector Below Search
Move the `ContentTypeStep` component (solution avatars + content type dropdown) from Step 2 into this page, placed below the search bar in a compact glassmorphic card. This eliminates the need to go to Step 2 just to pick a solution.

---

## Technical Details

### File Modified: `src/components/content-builder/steps/KeywordSelectionStep.tsx`

**Structural changes:**
- Lines 220-253 (stats section): Move above the search input (before line 199)
- Lines 258-456 (entire AnimatePresence block with welcome state, loading state, SERP results, empty state): Remove completely
- Add `useEffect` watching `serpData` -- when it transitions from null to populated after a search, set `showSerpAnalysisModal = true`
- Import and render `ContentTypeStep` below the search bar in a new compact card
- Keep: FloatingSelectionWindow, SerpAnalysisModal, SelectionManagerModal, ServiceCheckModal (all stay as-is)

**New layout order inside the hero section:**
1. "AI-Powered SERP Intelligence" pill badge
2. "Discover Content Opportunities" heading + subtitle
3. Stats row (15+ SERP Features, 200+ Data Points, < 30s Analysis Time)
4. Search bar (KeywordSearch)
5. Content Configuration card (ContentTypeStep) -- compact glassmorphic card below search

**Auto-popup logic:**
```
useEffect -- when serpData changes from null/undefined to a valid object AND hasSearched is true, auto-open the SERP modal
```

### Files Untouched
- `SerpAnalysisModal.tsx` -- no changes, just auto-triggered
- `ContentTypeStep.tsx` -- reused as-is, just rendered in a new location
- All context, reducer, save hooks, Repository, Approvals -- zero impact
- `ContentTypeAndOutlineStep.tsx` -- still renders ContentTypeStep in Step 2 as well (user can change selection there too)

