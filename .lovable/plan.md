

# Apple-Inspired Theme — Analytics Page + Audience Pages (Contacts, Segments, Activity)

## Overview

Strip all gradient fills, colored glows, scale animations, and heavy shadows from the Analytics page and the three Audience sub-pages (Contacts, Segments, Activity). This includes flattening the shared Engage components they all rely on.

---

## Phase 1: Shared Engage Components (affects all Audience pages)

### EngageHero.tsx
- Remove gradient glow orb (the `blur-xl scale-150` div behind the icon)
- Icon container: replace gradient background with `bg-transparent border border-border/20`; icon color from colored to `text-muted-foreground`
- Title: replace `bg-gradient-to-r ... bg-clip-text text-transparent` with plain `text-foreground`
- Remove all gradient props from interface (gradientFrom, gradientTo, glowFrom, glowTo) — they become unused

### EngageStatGrid / EngageStatCard.tsx
- Remove `bg-gradient-to-br ${s.color}` on the stat card — replace with `bg-background/90 backdrop-blur-md border border-border/10`
- Remove `hover:scale-[1.02] hover:-translate-y-1` hover effects — keep flat
- Icon container: replace `bg-white/[0.04] border-white/[0.06]` with `bg-transparent border border-border/20`
- Stat value: change from colored `${s.text}` to `text-foreground`
- Icon: change from colored `${s.text}` to `text-muted-foreground`

### EngageButton.tsx
- Remove `whileHover scale` and `whileTap scale` motion wrapper
- Remove `bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25`
- Replace with `bg-foreground text-background hover:bg-foreground/90` (monochrome primary action style)

### EngageDialogHeader.tsx
- Remove gradient glow blur behind icon
- Icon container: keep `bg-white/[0.06] border border-white/[0.08]`; icon stays `text-muted-foreground`
- Title: change from gradient `bg-clip-text text-transparent` to plain `text-foreground font-semibold`
- Divider: change from gradient to `bg-border/20`

### engageAnimations.ts
- Reduce stagger item `scale: 0.98` to just `scale: 1` (no scale animation, only opacity+y fade)
- Remove hero `scale: 0.96` — keep opacity+y only

---

## Phase 2: Analytics Page (src/pages/Analytics.tsx)

### Hero section (lines 284-410)
- Remove the animated gradient glow orb (`bg-gradient-to-r from-primary/10 via-transparent to-blue-500/10 ... animate`)
- Badge: remove `text-primary` on BarChart3 icon, use `text-muted-foreground`; remove green pulse dot
- Title: replace `bg-gradient-to-r from-foreground via-primary to-blue-500 bg-clip-text text-transparent` with `text-foreground`
- Remove "Performance" span with `text-primary` — just keep "Analytics Hub" in `text-foreground`
- Refresh button: replace `bg-gradient-to-r from-primary to-blue-500 ... shadow-2xl` with `bg-foreground text-background hover:bg-foreground/90`
- Time range buttons: replace active state `bg-primary text-primary-foreground shadow-lg` with `bg-foreground text-background`; remove `whileHover scale` and `whileTap scale`
- Quick stats icons: change `text-primary` to `text-muted-foreground`; remove `whileHover scale`

### Metric cards (lines 412-469)
- Remove `whileHover scale` and `y: -2` on cards
- Remove gradient icon backgrounds (`bg-gradient-to-br ${metric.color}`) — use `bg-transparent border border-border/20` with `text-muted-foreground` icon
- Remove hover gradient overlay (`group-hover:opacity-10`)
- Card: already uses `bg-background/60 backdrop-blur-xl` — change to `bg-background/90 backdrop-blur-md border border-border/10`

### Search/filter bar (lines 471-515)
- Card container: `bg-background/90 backdrop-blur-md border border-border/10`
- Input/select: `bg-transparent border-border/20`

### Tabs (lines 518-552)
- Active tab: replace `bg-primary text-primary-foreground shadow-lg` with `bg-foreground text-background`
- Tab card container: `bg-background/90 backdrop-blur-md border border-border/10`

### Performance tab (lines 566-638)
- Replace `bg-slate-700/30 hover:bg-slate-700/50` with `bg-muted/20 hover:bg-muted/30`
- Replace `text-white` with `text-foreground`
- Replace `text-slate-300` / `text-slate-400` with `text-muted-foreground`
- Replace gradient icon backgrounds with `bg-transparent border border-border/20`
- Remove colored badge fills (`bg-blue-500/10 text-blue-400 border-blue-500/30`) — use `variant="outline"` plain

### Error state (lines 240-257)
- Remove `bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950`
- Use `bg-background`
- Error card: `bg-destructive/10 border-destructive/20`

### AnimatedBackground reference (line 266)
- Already simplified in previous work — no change needed

---

## Phase 3: AnalyticsHero.tsx

- Remove animated gradient orbs (the two `blur-3xl` divs)
- Container: replace `bg-gradient-to-br from-primary/10 ... border-border/30` with `bg-background/90 backdrop-blur-md border border-border/10 rounded-3xl`
- Badge: remove `bg-gradient-to-r from-primary/20 to-blue-500/20 border-primary/30` — use `bg-transparent border border-border/20`; remove ping dot
- Title: plain `text-foreground` instead of gradient clip
- Quick stat icon containers: `bg-transparent border border-border/20` with `text-muted-foreground` icon
- Configure button: `bg-foreground text-background` instead of gradient

---

## Phase 4: SmartActionsAnalytics.tsx

- Replace `<Card>` stat cards with `GlassCard` using `bg-background/90 backdrop-blur-md border border-border/10`
- Chart bar fill: change from `hsl(var(--primary))` to `hsl(var(--foreground))` for monochrome

---

## Phase 5: Audience Pages — Caller-Side Cleanup

Since the shared components are being flattened, the callers (ContactsList, SegmentsList, ActivityLog) need minor updates:

### All three pages
- Remove gradient color props from `EngageHero` calls (gradientFrom, gradientTo, glowFrom, glowTo) — they'll be ignored/removed from the interface
- Remove color props from `EngageStatGrid` stat items (color, text) — stats become monochrome
- Empty state icons: remove gradient backgrounds (`bg-gradient-to-br from-emerald-500/30 ...`) — use `bg-transparent border border-border/20` with `text-muted-foreground` icon
- Empty state CTA buttons: replace gradient with `bg-foreground text-background`

### SegmentsList.tsx (line 301)
- Remove `bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25` on "Create First Segment" button

### SegmentsList.tsx (line 309)
- GlassCard: remove `hover:border-primary/30 hover:scale-[1.005]` — keep flat hover

### ActivityLog.tsx (line 242)
- Timeline line: change `bg-gradient-to-b from-primary/40 via-primary/20` to `bg-border/20`
- Contact name link: change `text-primary/80` to `text-foreground`

---

## Files Modified

| File | Change |
|------|--------|
| `src/components/engage/shared/EngageHero.tsx` | Flatten: remove gradients, glow orbs |
| `src/components/engage/shared/EngageStatCard.tsx` | Monochrome cards, remove scale hover |
| `src/components/engage/shared/EngageButton.tsx` | Remove scale animation, monochrome fill |
| `src/components/engage/shared/EngageDialogHeader.tsx` | Remove gradient text + glow |
| `src/components/engage/shared/engageAnimations.ts` | Remove scale from stagger/hero variants |
| `src/pages/Analytics.tsx` | Full theme overhaul: flat cards, mono buttons, no gradients |
| `src/components/analytics/AnalyticsHero.tsx` | Remove animated orbs, gradient text, colored icons |
| `src/pages/SmartActionsAnalytics.tsx` | Monochrome stat cards and chart |
| `src/components/engage/contacts/ContactsList.tsx` | Remove gradient color props from shared components |
| `src/components/engage/contacts/SegmentsList.tsx` | Same + flatten empty state and hover effects |
| `src/components/engage/activity/ActivityLog.tsx` | Same + flatten timeline line color |

## What Gets Removed
- All `bg-gradient-to-r/br` color fills across these pages
- All `shadow-lg`, `shadow-2xl`, `shadow-primary/*` colored shadows
- All `whileHover scale` / `whileTap scale` bounce animations
- All `text-primary` accent colors (to `text-foreground` or `text-muted-foreground`)
- Animated glow orbs in AnalyticsHero
- Green pulse dot in analytics badge
- Colored stat text (emerald, violet, orange, etc.)
- Slate-950/900/700 hardcoded dark backgrounds

