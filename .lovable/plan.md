

# Harmonize Sidebar Header with Analyst Narrative Sections

## Problem
The top portion of the Intelligence Panel (topic badges, data context badges, goal progress card) uses generic shadcn Badge/Progress styling that clashes with the premium editorial aesthetic of the narrative sections below (glass-cards, amber-gold labels, warm muted tones).

## What Changes

**File: `src/components/ai-chat/VisualizationSidebar.tsx`** (lines 703-762)

### 1. Topic Tags (line 704-713)
- Replace `Badge variant="outline"` with styled spans using the analyst palette: `bg-white/[0.04] border border-white/[0.06] text-muted-foreground/70` with `text-amber-300/70` for the mention count
- Add the warm gold section label above: `TOPICS DISCUSSED`

### 2. Data Context Badges (lines 716-739)
- Restyle the badge row (AI Analysis, pts, timeframe, quality) to use glass-card micro-badges: `bg-white/[0.04] border-white/[0.06] backdrop-blur-sm rounded-full`
- Quality badge uses analyst color tokens: emerald for high, amber for medium, rose for low — matching the palette in AnalystDataCard
- Wrap in a subtle section label `DATA SOURCE`

### 3. Goal Progress Card (lines 742-762)
- Already uses `glass-card` — enhance with:
  - Section label in warm gold uppercase (`text-amber-300/70 text-[10px] tracking-[0.15em]`) matching `AnalystSectionWrapper`
  - Progress bar color: replace default primary with amber gradient (`bg-gradient-to-r from-amber-300/60 to-amber-400/40`) to match the AnalystDataCard progress bars
  - Status pill: use the same `text-[9px]` pill styling but with analyst palette backgrounds (`bg-emerald-400/10`, `bg-amber-300/10`)
  - "Next:" text in `text-muted-foreground/50` to match analyst subtitle typography

### 4. Spacing & Dividers
- Add a subtle `border-b border-white/[0.04]` between header metadata and the scrollable narrative content to create a clean visual transition
- Increase `mt-3` gaps to `mt-4` for breathing room matching the editorial layout

All changes are cosmetic — no logic, no new components, single file edit.

