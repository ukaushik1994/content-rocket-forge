

# Merge Visualization Sidebar: Unified Intelligence Panel

## What Exists Today

Two separate rendering paths inside `VisualizationSidebar.tsx` (1841 lines):

| Feature | Regular Mode | Analyst Mode |
|---------|-------------|--------------|
| Scope | Single AI response | Entire session |
| Charts | 1 primary + 1 secondary | Accumulated waterfall |
| Metrics | Auto-generated from chart data | Platform-fetched with sparklines |
| Insights | From `visualData.insights` | Cumulative feed (trend/warning/opportunity) |
| Health Score | No | Yes (SVG ring) |
| Goal Progress | No | Yes |
| Web Intelligence | No | Yes |
| Context labels | Data source + quality badge | Topic tags + "Why This Matters" |
| Session memory | No | Yes (72h localStorage) |

**Problem**: They never combine. Regular mode shows shallow single-response data. Analyst mode only activates manually and starts empty. The inline chart bubble duplicates the sidebar chart.

## Plan: Unified Panel

Merge both into a single smart sidebar that always accumulates and always shows the latest response prominently.

### Phase 1: Restructure Sidebar Layout (VisualizationSidebar.tsx)

Remove the `if (visualData?.type === 'analyst')` branch. Create one unified layout:

```text
+----------------------------------+
| Header: Title + close            |
| [Data source] [pts] [timeframe]  |
| Topic tags (from analyst engine) |
+----------------------------------+
| CURRENT RESPONSE (if has data)   |
|   Chart/Table toggle + type pick |
|   Primary chart                  |
|   AI Summary card                |
+----------------------------------+
| WORKSPACE HEALTH (if active)     |
|   Score ring + trend             |
|   Goal progress bar              |
+----------------------------------+
| KEY METRICS (2x2 grid)           |
|   Platform stats w/ sparklines   |
|   OR auto-generated from chart   |
+----------------------------------+
| INSIGHTS FEED (collapsible)      |
|   Cumulative: all session items  |
|   Classified: trend/warn/opp     |
+----------------------------------+
| EXPLORE NEXT                     |
|   Dynamic prompts from topics    |
+----------------------------------+
```

Key changes:
- Remove secondary chart (duplicative, clutters UI)
- "Current Response" section only renders when the latest message has `visualData` with chart data
- Health score, metrics, insights always accumulate from `analystState` regardless of mode
- `analystState` is ALWAYS passed to sidebar (remove the `isAnalystPanelActive ? analystState : null` conditional in `EnhancedChatInterface.tsx`)

### Phase 2: Fix Chart Label Truncation

In `renderChart()`, add `tick` formatter to XAxis across all chart types:
- Truncate labels to 20 chars with ellipsis
- Add `angle={-35}` and `textAnchor="end"` for bar/line/area charts when data has 5+ items
- Increase bottom margin from 8 to 24 when labels are rotated

### Phase 3: Remove Inline Chart from Message Bubble

In `EnhancedMessageBubble.tsx`, remove the inline `InlineVisualization` / chart rendering. The sidebar is the single source of truth for charts. The message bubble should only show:
- The text response
- A small "View data" chip that opens/focuses the sidebar (if `visualData` exists)

This eliminates the duplication seen in the screenshots.

### Phase 4: Always-On Analyst Engine

In `EnhancedChatInterface.tsx`:
- Remove `isAnalystPanelActive` state entirely
- Always pass `analystState` to the sidebar
- The "Analyst" button in the input bar becomes a toggle for the sidebar itself (same as any visualization open), not a separate mode
- `useAnalystEngine` always runs with `isActive: true` (it's lightweight — just memo-scanning messages)

### Phase 5: Cleanup

- Remove the 500-line analyst branch from `VisualizationSidebar.tsx` (now merged)
- Remove Web Intelligence section (rarely populated, adds noise)
- File should drop from ~1841 to ~1200 lines

## Files Changed

| File | Change |
|------|--------|
| `VisualizationSidebar.tsx` | Merge two branches into unified layout, fix chart labels |
| `EnhancedChatInterface.tsx` | Remove `isAnalystPanelActive`, always pass `analystState` |
| `EnhancedMessageBubble.tsx` | Replace inline chart with "View data" chip |
| `useAnalystEngine.ts` | Remove `isActive` gate (always accumulate) |

