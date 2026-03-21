

# Move Topics/DataSource/GoalProgress to Bottom of Sidebar

## What
Move the three metadata sections (Topics Discussed, Data Source, Goal Progress) from the header area to the bottom of the sidebar, below the scrollable narrative content. The header keeps only the title row + close button.

## Changes in `src/components/ai-chat/VisualizationSidebar.tsx`

### 1. Remove metadata from header (lines 703-791)
Cut the three blocks (Topics Discussed, Data Source, Goal Progress) and the trailing divider from inside the header `div` (lines 703-791).

### 2. Add metadata as a sticky footer
After the `ScrollArea` (line 805) and before the closing `motion.div`, add a new `flex-shrink-0` footer div with `border-t border-border/10 px-6 py-4` containing the same three sections (Topics, Data Source, Goal Progress) in a compact layout. Use `max-h-[240px] overflow-y-auto` so it doesn't overwhelm the panel if content is tall.

### 3. Compact spacing
Reduce `mt-4` gaps to `mt-2` between the three sections in the footer to keep it tight at the bottom.

## Result
Header becomes minimal (icon + title + close). Metadata lives at the bottom, always visible without scrolling, matching the screenshot reference.

