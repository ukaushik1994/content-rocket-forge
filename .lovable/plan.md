

# Automations Page UI Overhaul

## Problems

1. **Hero takes 40vh** — `EngagePageHero` uses `min-h-[40vh]` with centered layout, pushing the actual automation list far below the fold. For a workhorse page, this is wasted space.
2. **Duplicate stats** — Stats appear in both the hero (Active, Paused, Total Runs, Success) AND again in `EngageStatGrid` below. Double display of the same data.
3. **Action button soup** — 4 buttons ("View All Runs", "Run Now", "Templates", "New Automation") stacked horizontally in the hero, all similar size with no hierarchy.
4. **Chart clutter** — A stacked bar chart sits between the filter bar and the list, adding scroll distance before users see their automations.
5. **Dense automation cards** — Each card packs status badge, health badge, execution count badge, trigger info, action list, conditions count, timestamps — all in one visual row with no breathing room.

## Plan

### 1. Replace Hero with Compact Header

Swap `EngagePageHero` for a simple inline header row (~64px):
- **Left**: Icon + "Automations" title + subtitle text
- **Right**: Secondary actions in a `DropdownMenu` (Run Now, Templates, View Runs) + primary "New Automation" button (gradient pill)
- No glow, no 40vh, no centered layout

### 2. Inline Stats Bar

Replace both the hero stats and `EngageStatGrid` with a single compact row of 4 mini-stat pills below the header. Each pill: icon + value + label, all in one horizontal line inside a `GlassCard`.

### 3. Move Chart to Collapsible

Wrap the executions chart in a collapsible section with a "Show Analytics" toggle. Default collapsed so the list is immediately visible.

### 4. Clean Up Automation Cards

- **Two-column layout**: Left side = name + description + trigger/actions summary. Right side = status switch + health badge + dropdown menu.
- Remove inline execution count badge (already in health badge)
- Remove timestamp from card face (move to dropdown or hover tooltip)
- Add a subtle left border accent color based on status (emerald for active, muted for paused)

### 5. Filter Bar Enhancement

Keep `EngageFilterBar` but add quick filter pills for "All", "Active", "Paused" inline next to search.

## Files to Edit

| File | Changes |
|------|---------|
| `AutomationsList.tsx` | Replace hero, consolidate stats, collapse chart, clean cards, add status filter pills |

No new files or dependencies needed. Single file edit.

