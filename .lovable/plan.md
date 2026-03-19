

# Unify Intelligence Panel Theme — Premium Glassmorphism

## Problem
The sidebar uses 5+ different card styles: plain `bg-transparent border-border/20`, `bg-muted/10 border-border/20`, `bg-muted/5 border-border/15`, collapsible cards with colored left borders, outline buttons, etc. The result is a fragmented visual identity across sections.

## Design Direction
Adopt the Workspace Health section's aesthetic as the single source of truth: glass backgrounds, soft ambient glows, generous padding, and clean typography. Every section card uses the same `.glass-card` recipe.

## Unified Component Styles

| Element | Current | New |
|---------|---------|-----|
| **Section cards** (metrics, platform stats, session charts, insights, web intel) | Mixed `bg-transparent`, `bg-muted/10`, `bg-muted/5` with varying border opacities | `glass-card` — `bg-white/[0.04] backdrop-blur-md border border-white/[0.06] rounded-2xl` |
| **Section labels** | `text-[10px] uppercase tracking-widest text-muted-foreground/50` | Keep — this is already clean |
| **Workspace Health ring** | `w-16 h-16` | Enlarge to `w-24 h-24` with bigger score text (`text-xl`), wrap in a dedicated glass-card with more padding |
| **Metric cards** (`PremiumMetricCard`) | `bg-transparent border border-border/20 border-l-2` with colored left border | `glass-card` with subtle top-glow gradient instead of left border. Keep trend color as text only |
| **Platform Stats cards** | `bg-muted/10 border-border/20` via `<Card>` | `glass-card` with same inner layout |
| **Session Chart cards** | `bg-muted/5 border-border/15` | `glass-card` |
| **Insight Feed items** | `bg-transparent border-border/15 border-l-2` colored left border | `glass-card` with a subtle colored dot indicator instead of left border |
| **Quick Actions** (`SidebarActionPanel`) | Outline buttons in 2x2 grid | Ghost buttons inside a single `glass-card` container |
| **Web Intelligence cards** | `bg-transparent border-border/15 border-l-2 border-l-cyan` | `glass-card` with cyan dot |
| **AI Summary card** | `bg-transparent border border-border/20` | `glass-card` |
| **Chart container** | `rounded-xl bg-transparent border border-border/20` | `glass-card` |
| **Explore Next pills** | `bg-muted/40 border-border/20` | `glass-card` inline style: `bg-white/[0.04] border-white/[0.06]` rounded-full |

## Files Changed

| File | Changes |
|------|---------|
| `VisualizationSidebar.tsx` | Replace all inline card styles with `glass-card` class. Enlarge health ring to w-24/h-24 + wrap in glass-card. Update chart containers, platform stat cards, session chart cards, insight items, web intel cards, explore pills. |
| `PremiumMetricCard.tsx` | Replace `bg-transparent border border-border/20 border-l-2` with `glass-card`. Remove colored left border, keep trend icon/text color. |
| `AISummaryCard.tsx` | Replace `bg-transparent border border-border/20` with `glass-card`. |
| `SidebarActionPanel.tsx` | Wrap action grid in a `glass-card` container. Change buttons from `variant="outline"` to ghost style with `hover:bg-white/[0.06]`. |

## Result
Every card in the panel shares the same glass material — consistent depth, blur, and border luminance. The Workspace Health ring becomes the visual anchor at a larger size. No more competing card recipes.

