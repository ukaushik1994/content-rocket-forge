

# Intelligence Panel — Visual-First Premium Redesign

## Problem
The panel layout is functional but visually flat: dense text, small elements, uniform spacing, and no visual hierarchy. It reads like a data dump rather than a premium dashboard. The screenshot confirms cramped metric cards, a modest health ring, and no ambient visual polish.

## Design Direction
Transform from "data list" to "visual-first intelligence dashboard" — larger focal elements, ambient glows, gradient accents, and breathing room. Every section becomes a visual moment.

## Changes

### 1. Panel Container (`VisualizationSidebar.tsx` — outer shell)
- Add a subtle radial gradient glow at top: `radial-gradient(ellipse at 50% 0%, rgba(139,92,246,0.08) 0%, transparent 60%)` as a pseudo-element
- Header: increase title to `text-lg`, add a subtle gradient accent line below header (2px, primary gradient)
- Increase section spacing from `space-y-5` to `space-y-8`
- Section labels: upgrade from `text-[10px]` to `text-[11px]` with a faint left accent dot (colored by section)

### 2. Workspace Health (`VisualizationSidebar.tsx` — health section)
- Enlarge ring from `w-24 h-24` to `w-32 h-32` with `text-2xl` score
- Add ambient glow behind ring: `box-shadow: 0 0 60px rgba(color, 0.15)` matching score color
- Add animated gradient ring stroke (SVG gradient instead of flat color)
- Score breakdown bars: increase width, add glass-card wrapping, use gradient fills
- Health card: increase padding to `p-8`, center the ring with text beside it

### 3. Metric Cards (`PremiumMetricCard.tsx`)
- Add a subtle top gradient glow strip (4px, colored by trend: emerald/red/muted)
- Increase value text from `text-2xl` to `text-3xl` for impact
- Add a faint background pattern/gradient per card (e.g., `radial-gradient(circle at top right, rgba(color, 0.05), transparent)`)
- Increase card padding from `p-5` to `p-6`

### 4. Platform Stats (`VisualizationSidebar.tsx` — platform data section)
- Increase sparkline size from `h-16 w-40` to `h-20 w-48` for visual presence
- Add gradient fills to sparklines instead of flat lines
- Value text: bump to `text-xl`

### 5. Chart Container (`VisualizationSidebar.tsx` — chart section)
- Add ambient glow behind chart container matching primary color
- Increase chart height from 260 to 300px
- Add gradient background inside chart card

### 6. Insights Feed (`VisualizationSidebar.tsx` — insights section)
- Replace colored dots with small gradient icon badges (rounded square, `w-7 h-7`, glass background with colored icon)
- Increase insight text from `text-xs` to `text-sm`
- Add subtle left gradient border on each insight card

### 7. Quick Actions (`SidebarActionPanel.tsx`)
- Each action button gets a subtle icon background circle (`w-8 h-8 rounded-full glass-card`)
- Increase button height from `h-9` to `h-10`

### 8. Explore Next Pills
- Add gradient border on hover (primary gradient)
- Increase pill padding and font size slightly

### 9. Goal Progress
- Replace thin progress bar with a wider gradient bar (`h-2.5` with rounded ends and glow)
- Wrap in a more prominent glass-card with ambient glow

### 10. Empty State
- Add animated gradient orb background behind the icon
- Increase icon container size

## Files Changed

| File | Changes |
|------|---------|
| `VisualizationSidebar.tsx` | Ambient glow header, larger health ring with SVG gradient + glow shadow, bigger section spacing, enhanced section labels with accent dots, larger sparklines, chart container glow, insight icon badges, wider goal progress bar, enhanced empty state |
| `PremiumMetricCard.tsx` | Top gradient glow strip, larger value text, ambient background gradient per card, more padding |
| `SidebarActionPanel.tsx` | Icon background circles, larger buttons |
| `AISummaryCard.tsx` | Subtle gradient left border accent, slightly larger text |
| `MiniSparkline.tsx` | Increase default dimensions, add area fill gradient |

