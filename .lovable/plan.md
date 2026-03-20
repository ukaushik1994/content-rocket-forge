

# Simplify Analytics Page — Minimal Premium Redesign

## Problem
The Analytics page hero section is overloaded: large gradient title, subtitle paragraph, 3 oversized action buttons, 3 stat icons, a time range picker bar, then a search/filter card, then tabs. Too many visual layers before real content.

## Design Direction
Collapse everything above the metric cards into a single compact toolbar row. Kill the hero entirely. Content should start immediately.

## Changes — `src/pages/Analytics.tsx`

### Remove entirely (lines 298-434)
- Hero section with gradient title, subtitle, badge pill, animated background glow
- 3 large CTA buttons (Refresh Data, Export CSV, Export Image)
- 3 stat preview icons (Page Views, Sessions, Impressions) — redundant with metric cards below
- Time range picker bar

### Replace with a single compact header row
```
┌─────────────────────────────────────────────────────────────┐
│ Analytics          [24h][7d][30d][90d]   [↓ CSV] [⟳] │
└─────────────────────────────────────────────────────────────┘
```
- Left: "Analytics" as a clean `text-2xl font-bold`
- Center: Time range as small pill toggle buttons (no icons, no card wrapper)
- Right: Compact icon buttons — CSV export + Refresh (small, ghost/outline style)
- Remove Export Image button (rarely used, accessible elsewhere)

### Simplify search/filter section (lines 496-539)
- Remove the Card wrapper — make it a simple inline row with no background
- Smaller search input, keep sort dropdown and refresh button but as small ghost buttons

### Keep as-is
- Metric cards grid (lines 436-493) — already clean
- Tabs section (lines 542-586) — already uses layoutId animation
- Breadcrumb (line 284)

## Result
Page loads directly into: Breadcrumb → compact toolbar → metric cards → tabs. No hero, no large buttons, no redundant stats. Clean, premium, data-first.

