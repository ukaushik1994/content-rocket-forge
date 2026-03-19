

# Analyst Sidebar — Premium Overhaul

## Critique

**Design problems:**
- Information overload: 9+ sections stacked vertically with thin dividers — reads like a settings page, not a dashboard
- Everything is small: metric cards, sparklines, health breakdown bars, insight text — nothing has visual weight
- Header clutter: source badge, point count, quality badge, timeframe selector, loading spinner all in one row
- Collapsibles hide value: Insights Feed and Score Breakdown are collapsed by default — the most valuable content is hidden
- Section labels (10-11px uppercase) are so subtle they disappear — no visual anchoring
- Explore Next pills and Quick Actions feel like afterthoughts at the bottom

**Interactiveness problems:**
- Insight cards have a tiny "Explore →" link at 9px — nearly invisible
- No hover previews, no expandable detail states, no micro-interactions
- Platform stats cards are static blocks with no click behavior
- Health ring has no interaction — tapping a factor should do something

**Value problems:**
- AI Summary card is hidden below the chart — should be prominent
- Session charts dashboard (mini 2x2 grid) is too small to read
- Web Intelligence results are collapsed — high-value content is buried

## Design Direction

Reduce section count by consolidating. Make each remaining section a visual moment with generous sizing. Add interactive hover/click states throughout.

## Changes

### 1. Consolidate layout from 9 sections to 5 hero sections

Current 9 sections → 5:
1. **Hero Health** (health ring + AI summary merged — always visible, no collapsible)
2. **Metrics** (key metrics grid — larger cards, max 4)
3. **Intelligence** (chart + platform stats tabs — switchable, not stacked)
4. **Insights & Actions** (insights always visible, explore next + quick actions merged inline)
5. **Web Intelligence** (only when data exists)

### 2. Hero Health Section (`VisualizationSidebar.tsx`)
- Merge Workspace Health + AI Summary into one hero card
- Health ring stays at w-32 but score breakdown bars are always visible (remove collapsible)
- AI summary text sits below the ring as a pull-quote with larger text (text-sm → text-base)
- Add subtle animated pulse on the ring glow
- Remove the separate AISummaryCard section below chart

### 3. Header cleanup (`VisualizationSidebar.tsx`)
- Move data source/quality/timeframe into a minimal bottom bar of the header (single line, smaller)
- Remove individual badges, use a single compact row: `Content Analytics · 30d · High`
- Topic tags: limit to 3 with a "+N more" overflow

### 4. Metrics section (`PremiumMetricCard.tsx`)
- Increase card min-height to 120px for breathing room
- Add hover state: on hover, show a mini sparkline that slides in from the right
- Add click behavior: clicking a metric card sends a prompt like "Tell me more about {label}"
- Comparison period text: bump from 10px to 11px

### 5. Intelligence tab section (`VisualizationSidebar.tsx`)
- Replace stacked chart + platform stats with a tab switcher: "Charts" | "Platform" 
- Charts tab: current chart/table view
- Platform tab: platform stats in larger cards (bump value to text-2xl, sparkline to h-32 w-full)
- Session charts: show as a horizontal scroll strip instead of 2x2 grid (each 200px wide)

### 6. Insights & Actions merged section
- Insights Feed: remove collapsible — always show top 4, "Show all" link for more
- Each insight card: add a visible "Explore" button (not 9px text)
- Explore Next pills: merge into the same section as a row below insights
- Quick Actions: convert from collapsible 2x2 grid to an inline row of icon-only buttons with tooltips (saves vertical space)

### 7. Interactive enhancements throughout
- Platform stat cards: clickable → sends "Analyze my {label} in detail"
- Health ring factors: clickable → sends "How can I improve my {factor} score?"
- Metric cards: hover reveals sparkline + click drills down
- Insight "Explore" button: visible at all times, not hidden as 9px text
- Web search results: expand inline on click instead of separate collapsible

### 8. Visual polish
- Section transitions: stagger delay 0.08s (currently 0.05s) for more deliberate feel
- Remove all `border-t border-border/10` dividers — use spacing (gap-10) instead of lines
- Increase ScrollArea content padding from p-6 to p-8
- Increase section gap from space-y-8 to space-y-10

## Files Changed

| File | Changes |
|------|---------|
| `VisualizationSidebar.tsx` | Consolidate to 5 sections; merge health+summary hero; add Charts/Platform tab switcher; make insights always visible; inline quick actions as icon row; remove dividers; increase spacing; add click handlers to platform stats, health factors, metrics; horizontal scroll for session charts |
| `PremiumMetricCard.tsx` | Add hover sparkline reveal; add onClick prop for drill-down; increase min-height; bump comparison text size |
| `SidebarActionPanel.tsx` | Convert to horizontal icon-only button row with tooltips (not collapsible grid) |
| `AISummaryCard.tsx` | Increase text to text-base; make standalone or embeddable in hero section |

