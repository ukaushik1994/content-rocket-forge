

# Analyst Sidebar: Web Intelligence + Dashboard Multi-Chart + Auto-Preload

## Current State

The unified sidebar has 8 sections (header → chart → AI summary → health score → metrics → platform stats → insights feed → explore next). Web Intelligence was removed in the last merge. The analyst engine already tracks `webSearchResults` and `platformData` but:
1. Web search results are only surfaced as text in the insights feed (type: 'search')
2. No multi-chart dashboard view — only one chart from the current response
3. Sidebar only populates when AI responds with `visualData` or user clicks Analyst button

## Plan

### Phase 1: Auto-Preload Analyst Data on Chat Start

**File:** `useAnalystEngine.ts`

- Change: On first message send (not just on Analyst button), trigger `fetchPlatformData(true)` immediately. Currently gated behind `hasInitialFetchedRef` which only fires when `isActive` flips. Since we made `isActive: true` always, it already fires — but only once. Add a second trigger: when `messages.length` goes from 0 to 1, re-fetch to ensure data is fresh for the session.

**File:** `EnhancedChatInterface.tsx`

- On first user message, auto-open the sidebar with the analyst view (not just when AI returns `visualData`). Change the auto-open logic: if sidebar hasn't been explicitly closed and messages go from 0→1, set visualization to `{ type: 'analyst' }` and open sidebar.

### Phase 2: Web Intelligence Section in Sidebar

**File:** `VisualizationSidebar.tsx`

Add a new section between "Platform Stats" (#5) and "Insights Feed" (#6):

**Web Intelligence** — renders when `analystState.webSearchResults.length > 0` OR when context-relevant SERP/competitor data exists in the chat session.

Content:
- Each web search query shown as a collapsible card with query text + result count
- Top 3 results per query: title (linked), snippet, source domain
- Classified with the existing insight icons (🌐 Web source label)
- "Search more" button that sends a web search prompt to the chat

Also add context-aware auto-detection: scan the analyst engine's `topics` to determine if SERP or competitor data should be fetched proactively. If topics include 'keywords' or 'competitors' and no web results exist yet, show a subtle "Get web intel" prompt button.

### Phase 3: Dashboard Multi-Chart View

**File:** `VisualizationSidebar.tsx`

Replace the single "Current Response" chart section with a smart dashboard layout:

**When current response has chart data:**
- Show it as the primary (larger) chart with chart/table toggle + type picker (existing behavior)

**Below it, add "Session Charts" grid** — always visible when `analystState.accumulatedCharts.length > 0`:
- 2-column grid of mini-charts (height: 140px each) from `analystState.accumulatedCharts`
- Each mini-chart: title label, small chart using `renderChart()` with reduced height, click to expand as primary
- Max 4 mini-charts shown, with "Show all (N)" expand button if more
- Uses the same `renderChart` function but with a compact flag (no legend, smaller margins)

**When NO current response data but analyst has accumulated charts:**
- Show all accumulated charts in a 1-column stack (larger, 200px each) as the "dashboard view"
- This is the "bigger picture" — all charts from the session in one scrollable view

### Phase 4: Visual Polish

**File:** `VisualizationSidebar.tsx`

- Add subtle section dividers (thin `border-border/10` lines between major sections)
- Ensure web intelligence cards use the same card style as insights feed (border-l-2 with cyan color for web source)
- Mini-charts get a hover state that highlights the card border
- Add a small "session summary" counter at the bottom of the sidebar: "3 charts · 12 insights · 2 web searches"

### Phase 5: Analyst Button Behavior Update

**File:** `EnhancedChatInterface.tsx` (onOpenAnalyst handler)

Currently sets `type: 'analyst'` which was used for the old branch. Now it should:
- If sidebar is already open → close it (toggle behavior)
- If sidebar is closed → open it with the unified view, trigger a fresh `fetchPlatformData(true)`

## Files Changed

| File | Change |
|------|--------|
| `VisualizationSidebar.tsx` | Add Web Intelligence section, mini-chart dashboard grid, section dividers, session counter |
| `EnhancedChatInterface.tsx` | Auto-open on first message, toggle behavior for Analyst button |
| `useAnalystEngine.ts` | Re-fetch platform data when messages go 0→1 |

