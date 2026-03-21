

# Unify Sidebar Header Colors to Primary Theme

## Problem
The top section of the Intelligence Panel (Topics Discussed, Goal Progress, Data Source badges) still uses the old amber/gold and emerald/rose colors, while the sections below now use the unified primary/neon-blue theme.

## Changes in `src/components/ai-chat/VisualizationSidebar.tsx`

### Line 708 — "Topics Discussed" label
- `text-amber-300/70` → `text-primary/50`

### Line 714 — Topic mention count
- `text-amber-300/70` → `text-primary/60`

### Line 726 — "Data Source" label
- `text-amber-300/70` → `text-primary/50`

### Line 730 — Database icon
- `text-amber-300/50` → `text-primary/40`

### Line 738 — Clock icon
- `text-amber-300/50` → `text-primary/40`

### Lines 749-751 — Quality badge (High/Medium/Low)
- High: `bg-emerald-400/10 border-emerald-400/20 text-emerald-400/80` → `bg-primary/10 border-primary/20 text-primary/80`
- Medium: `bg-amber-300/10 border-amber-300/20 text-amber-300/80` → `bg-primary/10 border-primary/20 text-primary/60`
- Low: `bg-rose-300/10 border-rose-300/20 text-rose-300/80` → `bg-primary/10 border-primary/20 text-primary/40`

### Line 763 — "Goal Progress" label
- `text-amber-300/70` → `text-primary/50`

### Line 767 — Goal percentage
- `text-amber-300/80` → `text-primary/80`

### Line 771 — Goal progress bar gradient
- `from-amber-300/60 to-amber-400/40` → `from-primary/60 to-primary/40`

### Lines 778-781 — Goal status badges
- completed: `bg-emerald-400/10 text-emerald-400/80` → `bg-primary/10 text-primary/80`
- nearly_done: `bg-emerald-400/10 text-emerald-400/70` → `bg-primary/10 text-primary/70`
- in_progress: `bg-amber-300/10 text-amber-300/70` → `bg-neon-blue/10 text-neon-blue/70`
- default: stays as-is (muted)

## Files
- `src/components/ai-chat/VisualizationSidebar.tsx` (single file, ~15 color replacements)

## Result
The entire sidebar — header and content sections — will use a consistent primary/neon-blue palette.

