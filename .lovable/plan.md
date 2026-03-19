

# Refine Analyst Sidebar to Match Reference Design

## Key Differences from Current Implementation

The reference screenshots show a more editorial, magazine-style layout compared to what we have. The main gaps:

| Element | Current | Reference |
|---------|---------|-----------|
| **Headlines** | `text-lg font-semibold` (small) | `text-2xl md:text-3xl font-bold` (large, editorial) |
| **Section labels** | Bright purple (`text-primary`) | Muted warm gold (`text-amber-300/70`) — subdued, not competing with headlines |
| **Section dot** | Purple `bg-primary` | Muted `bg-muted-foreground/40` |
| **Headline keyword colors** | Multiple bright colors (emerald, blue, amber, red) | Restrained palette: amber/gold for warnings, soft green for positive, soft rose for critical — all at lower saturation |
| **Data cards** | Small `p-3.5`, compact grid | Larger `p-5`, more breathing room, bigger value text (`text-2xl`) |
| **Insight cards** | Small dot + text | Icon in a rounded-lg dark background square + text + arrow — much more prominent |
| **Narrative prompt** | Gradient top glow, inline buttons | Cyan/teal left border accent, italic question text, **full-width stacked buttons** (white primary, outline secondary) |
| **Section spacing** | `space-y-8` | `space-y-12` or more — generous breathing room |
| **Chart card** | Standard glass card | Larger with prominent delta value (`+12.4k Delta`) and trend badge |
| **Progress bars** | Tailwind Progress component | Custom thin colored bars (amber/gold) |

## Files to Modify

### 1. `AnalystSectionWrapper.tsx`
- Headline: `text-lg` → `text-2xl font-bold leading-tight`
- Section label: `text-primary` → `text-amber-300/70` (warm muted gold)
- Dot: `bg-primary` → `bg-muted-foreground/40`
- Increase `mb-4` → `mb-6` after headline

### 2. `AnalystDataCard.tsx`
- Increase padding `p-3.5` → `p-5`
- Value text: `text-xl` → `text-2xl`
- Remove multi-color value mapping — keep values white (`text-foreground`), only use color on progress bar
- Progress bar: replace `<Progress>` with custom thin bar matching reference (amber for partial, green for full)

### 3. `AnalystInsightCard.tsx`
- Replace small dot with an icon in a `w-10 h-10 rounded-lg bg-white/[0.06]` container
- Add `AlertTriangle` for warnings, `Sparkles` for opportunities, `TrendingUp` for trends
- Icon colors: muted warm tones (`text-amber-400/70`, `text-emerald-400/70`)
- Arrow: `ChevronRight` → `ArrowRight`
- Increase padding

### 4. `NarrativePromptCard.tsx`
- Remove gradient top glow
- Add left border accent: `border-l-2 border-cyan-400/50`
- Question text: make italic
- Buttons: stack vertically, full width
- Primary button: `bg-white text-background font-semibold rounded-full` (white pill)
- Secondary button: `border border-white/20 text-foreground/70 rounded-full` (outline pill)

### 5. `HealthAssessmentSection.tsx`
- Reduce keyword color saturation (e.g. `text-amber-300` instead of `text-amber-400`)
- Health factor bars: use amber/gold thin bars instead of bright emerald/red

### 6. `PerformanceTrajectorySection.tsx`
- Add prominent delta value above chart (`+12.4k Delta` style with `text-2xl font-bold`)
- Add label above delta (`GLOBAL REACH GROWTH` style uppercase)
- Trend badge: `bg-emerald-500/10 text-emerald-400 rounded-md` positioned top-right
- Chart line color: use cyan (`#06b6d4`) as primary line — single color, not multi

### 7. `StrategicDivergenceSection.tsx`
- Headline keyword: use `underline decoration-2 underline-offset-4` instead of just color (matching reference "immediate triage" underline)

### 8. `AnalystNarrativeTimeline.tsx`
- Section spacing: `space-y-8` → `space-y-12`

### 9. All section headline colors
- Consolidate to 3 muted tones: `text-amber-300` (warning/attention), `text-emerald-400/80` (positive), `text-rose-300` (critical) — no bright blue

## Result
A more editorial, restrained aesthetic matching the reference — large bold headlines, muted warm accents, generous whitespace, prominent insight cards with icons, and full-width stacked action buttons in narrative prompts.

