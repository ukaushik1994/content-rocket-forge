

# Premium Welcome Screen — Summary + Insights Redesign

## What
The Platform Summary metrics and Insights/Recommended sections look plain. Redesign them with premium glassmorphism, staggered animations, and cleaner typography matching the page's dark editorial theme.

## Changes — 2 files

### 1. `src/components/ai-chat/PlatformSummaryCard.tsx`
- Wrap each metric in a `glass-card` container with subtle border (`border-white/[0.08]`) and `backdrop-blur-md`
- Reduce icon circle size to `w-11 h-11`, icon to `h-5 w-5` — more refined
- Use `text-xl` for values instead of `text-2xl` — less shouty
- Add staggered entrance: each metric fades up with `delay: index * 0.08`
- Add subtle `whileHover: { y: -3, scale: 1.02 }` spring animation
- Use `font-mono` (Spline Sans Mono) for numeric values for editorial feel
- Keep colored icons and backgrounds as-is

### 2. `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 751-810)
**Insights & Recommended columns:**
- Add staggered `motion.button` entrance per item (`delay: 0.4 + index * 0.06`)
- Each item gets a subtle left accent line on hover (`before:` pseudo or border-left)
- Insight icons: add unique colors per type — `stale: text-amber-400`, `failed: text-rose-400`, `empty_cal: text-blue-400`, `approvals: text-emerald-400`
- Recommended `✦` icon: replace with a subtle `Sparkles` lucide icon in `text-primary/60`
- Section labels: add a thin horizontal line after label (`border-b border-white/[0.06]`) for visual separation
- Hover state: `bg-white/[0.04]` instead of `bg-accent/5` — matches glass theme
- Add `backdrop-blur-sm` to each row on hover for depth

### Files changed: 2

