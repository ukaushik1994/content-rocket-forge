

# Fix: VisualizationSidebar Hooks Ordering Error

## Problem
In `VisualizationSidebar.tsx`, early returns for specialized panels (content_wizard, proposal_browser, etc.) at lines 600-609 occur **between** hooks:
- Hooks at lines 95-292 run first (useState, useEffect, useMemo, useAuth, useSidebarTrendData)
- Early returns at lines 600-609 exit before reaching:
  - `useResponsiveBreakpoint()` at line 597
  - `useMemo` (mergedInsightsFeed) at line 620

When `visualData.type` changes (e.g., from `'analyst'` to `'content_wizard'`), React sees fewer hooks on re-render, causing the crash.

## Fix
**File:** `src/components/ai-chat/VisualizationSidebar.tsx`

Move the two late hooks (`useResponsiveBreakpoint` at line 597 and `mergedInsightsFeed` useMemo at line 620) to **before** the early return block (before line 600). This ensures all hooks always execute regardless of which panel type is rendered.

Specifically:
1. Move `const { isMobile, isTablet } = useResponsiveBreakpoint();` from line 597 up to ~line 294 (after the last existing hook block)
2. Move the `mergedInsightsFeed` useMemo (lines 620-636) up to right after it
3. Keep the early returns at their current position (they'll now be after all hooks)

No logic changes -- just reordering to satisfy React's rules of hooks.

