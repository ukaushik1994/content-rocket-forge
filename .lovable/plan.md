

# Premium Chart System Upgrade

## Current State
- **3 chart types** in `chart.tsx` (Line, Bar, Pie) — basic, no animations, flat styling
- **9 chart types** in `InteractiveChart.tsx` (line, bar, pie, area, radar, funnel, scatter, radial, composed) — functional but visually plain: no gradients, no animations, no custom tooltips, no glassmorphism
- **MiniSparkline** — simple area chart, already has gradient fill
- Charts use raw Recharts defaults: plain tooltips, no animated entry, no glow effects, no hover interactions

## Problems
1. **No visual polish**: Charts render with Recharts defaults — flat fills, basic grid, generic tooltips
2. **No animations**: No entry animations, no hover effects on data points, no transition between chart types
3. **Tooltips are ugly**: Generic white/black box with no glass effect or premium styling
4. **Missing chart types**: No treemap, no gauge/donut, no stacked area, no waterfall
5. **No interactive states**: No click-to-drill, no hover highlight, no crosshair cursor
6. **Color palette is scattered**: Different color arrays hardcoded in each file — no unified system

## Plan

### 1. Premium Chart Theme System (`src/utils/chartTheme.ts`) — NEW
- Unified color palette with gradient pairs (e.g., `['#8B5CF6', '#6366F1']`)
- Reusable glassmorphism tooltip style object
- Animated gradient `<defs>` generator for any color
- Standardized axis styling (muted, thin, clean)
- Glow shadow filter SVG definitions

### 2. Premium Custom Tooltip (`src/components/ui/PremiumChartTooltip.tsx`) — NEW
- Glassmorphism container: `backdrop-blur-xl bg-black/60 border border-white/10 rounded-xl`
- Color dot per series, formatted values, date/label header
- Subtle entry animation via framer-motion
- Used by all chart components

### 3. Upgrade `InteractiveChart.tsx` — Major visual overhaul
- **All charts**: Apply gradient fills via `<defs><linearGradient>` for area/bar fills
- **Line charts**: Add `activeDot` with glow effect (`filter: drop-shadow`), animated stroke via `strokeDasharray` + `strokeDashoffset` CSS animation
- **Bar charts**: Rounded corners (`radius={[6,6,0,0]}`), gradient fills, hover brightness increase via `activeBar`
- **Pie charts**: Inner radius for donut style, animated entry, label lines with custom styling
- **Area charts**: Gradient fills with 0.4→0 opacity, glowing stroke
- **All**: Replace default `<Tooltip>` with `PremiumChartTooltip`, apply `<CartesianGrid stroke="rgba(255,255,255,0.04)">`
- **All**: Add `animationBegin={0} animationDuration={800} animationEasing="ease-out"`

### 4. Add New Chart Types to `InteractiveChart.tsx`
- **Donut**: Pie with `innerRadius={60}`, center stat label
- **Stacked Bar**: New case with stacked bars + gradient fills
- **Horizontal Bar**: `layout="vertical"` BarChart variant
- Update `ChartConfiguration.type` union in `enhancedChat.ts` to include `'donut' | 'stacked-bar' | 'horizontal-bar'`

### 5. Upgrade `chart.tsx` — Match premium style
- Apply the same gradient fills, premium tooltip, glow dots, and animation config
- Pie → Donut with inner radius and center label
- Remove console.log debug statements

### 6. Upgrade `MiniSparkline.tsx` — Subtler refinement
- Reduce stroke to 1.2, gradient opacity to 0.2
- Add animated dot at the last data point (pulsing)

## Files Changed

| File | Action |
|------|--------|
| `src/utils/chartTheme.ts` | **New** — unified colors, gradient generators, tooltip styles, axis config |
| `src/components/ui/PremiumChartTooltip.tsx` | **New** — glassmorphism tooltip component |
| `src/components/ai-chat/visualization/InteractiveChart.tsx` | Major visual upgrade + 3 new chart types |
| `src/components/ui/chart.tsx` | Premium styling alignment |
| `src/components/ai-chat/MiniSparkline.tsx` | Subtle refinements |
| `src/types/enhancedChat.ts` | Add new chart type literals |

