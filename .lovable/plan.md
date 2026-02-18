

# Visualization Sidebar Sub-Components — Apple-Inspired Theme Alignment

## Current Issues

The main `VisualizationSidebar.tsx` container was already flattened in the previous round, but the **internal interactive components** still use the old visual language:

- **SegmentedControl**: Uses `bg-white/[0.04]`, `border-white/8`, and `shadow-sm` on the sliding indicator — too heavy
- **PremiumChartTypeSelect**: Uses `bg-muted/30`, `border-border/50`, `focus:ring-1 ring-primary/30`, and `bg-primary/10` icon containers with `text-primary` — too colorful
- **PremiumMetricCard**: Uses `bg-card/50`, `border-border/50` — too opaque for the transparent theme
- **AISummaryCard**: Uses `bg-muted/30`, `border-border/30` — close but not matching; Sparkles icon uses `text-primary/60`
- **ExportDropdown**: Uses default `variant="outline"` buttons which inherit heavier borders; includes a keyboard hints text row at the bottom that adds clutter

## Changes

### 1. SegmentedControl.tsx
- Container: Change `bg-white/[0.04] border-white/8` to `bg-transparent border border-border/20`
- Sliding indicator: Change `bg-white/10 shadow-sm shadow-black/10` to `bg-muted/30` with no shadow
- Remove `backdrop-blur-sm` from container (unnecessary layer)

### 2. PremiumChartTypeSelect.tsx
- **Trigger**: Change from `bg-muted/30 border-border/50 hover:bg-muted/50 hover:border-border focus:ring-1 focus:ring-primary/30` to `bg-transparent border-border/20 hover:border-border/40 hover:bg-muted/20 focus:ring-0`
- **Icon container in trigger**: Change from `bg-primary/10` with `text-primary` to no background, just `text-muted-foreground`
- **Dropdown content**: Change from `bg-popover/95 backdrop-blur-xl border-border/50` to `bg-popover/90 backdrop-blur-md border-border/20`
- **Option icon containers**: Change active state from `bg-primary/20 text-primary` to `bg-muted/40 text-foreground`; inactive stays `bg-muted text-muted-foreground` but lighten to `bg-muted/30`
- **Separator**: Change from `bg-border/50` to `bg-border/10`

### 3. PremiumMetricCard.tsx
- Card container: Change from `bg-card/50 border-border/50` to `bg-transparent border-border/20`
- Keep the colored left-border (trend indicator) but it already looks fine at current opacity

### 4. AISummaryCard.tsx
- Container: Change from `bg-muted/30 border-border/30` to `bg-transparent border border-border/20`
- Sparkles icon: Change from `text-primary/60` to `text-muted-foreground`

### 5. ExportDropdown.tsx
- Remove the keyboard hints paragraph ("Esc to close / Tab to switch view") — this belongs in a tooltip, not persistent text
- Buttons: Already `variant="outline"` which is fine, but ensure icon-only buttons use `border-border/20` for consistency

## Files Changed

| File | What |
|------|------|
| `SegmentedControl.tsx` | Transparent container, muted sliding indicator, remove shadow |
| `PremiumChartTypeSelect.tsx` | Flatten trigger, remove primary tints from icons, lighten dropdown |
| `PremiumMetricCard.tsx` | Transparent card background, thinner border |
| `AISummaryCard.tsx` | Transparent background, muted sparkles icon |
| `ExportDropdown.tsx` | Remove keyboard hints text, ensure consistent border opacity |

