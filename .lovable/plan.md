

# Redesign Campaigns, Keywords, and Analytics Heroes to Match Automations Style

## Reference Pattern (Automations Hero)
Centered layout with: ambient glow → glass-card badge → gradient title → subtitle → action buttons → stat cards. Clean, no oversized sections. Uses `glass-card`, spring animations, colored icon stats.

## Color Assignments

| Page | Gradient | Icon Color | Glow |
|------|----------|------------|------|
| Campaigns | `from-foreground via-green-400 to-teal-500` | `text-green-400` | `green-500/[0.06]` |
| Keywords | `from-foreground via-indigo-400 to-blue-500` | `text-indigo-400` | `indigo-500/[0.06]` |
| Analytics | `from-foreground via-cyan-400 to-blue-500` | `text-cyan-400` | `cyan-500/[0.06]` |

## Changes

### 1. `src/components/campaigns/CampaignsHero.tsx` (~lines 138-234)
Replace the hero section (ambient glow, empty badge div, title, subtitle, stats) with the Automations pattern:
- Ambient glow: `bg-green-500/[0.06]` centered radial
- Badge: `Megaphone` icon + "Campaign Command Center" + green dot, using `glass-card`
- Title: `Campaigns` with green/teal gradient
- CTA button: `from-green-400 to-teal-500` gradient for primary
- Stats: Keep existing 3 stats, use green-themed icon colors (`text-emerald-400`, `text-teal-400`, `text-green-400`)
- Remove `min-h-[60vh]` — use `pt-12 pb-8` like Automations
- Keep the mode toggle and input sections below (unchanged)

### 2. `src/components/keywords/KeywordsHero.tsx` (~lines 49-208)
Full rewrite to match Automations pattern:
- Remove `min-h-[60vh]` and `pt-24` — use `pt-12 pb-8`
- Ambient glow: `bg-indigo-500/[0.06]`
- Badge: `Database` icon + "Keyword Repository" + green dot, `glass-card`
- Title: `Keywords` (single line, no "Dashboard" subtitle), indigo/blue gradient
- Subtitle: shorter, single line
- CTA: "Create Content" button with `from-indigo-400 to-blue-500`
- Stats: Keep 3 stats, use `glass-card` containers, indigo-themed colors
- Quick filters: Keep, restyle containers to match `glass-card`
- Remove animated shimmer on CTA button

### 3. `src/pages/Analytics.tsx` (~lines 348-484)
Replace inline hero with Automations pattern:
- Ambient glow: `bg-cyan-500/[0.06]`
- Badge: `BarChart3` icon + "Real-time Performance Tracking" + green dot, `glass-card`
- Title: `Analytics` (single word), cyan/blue gradient
- Subtitle: shorter
- CTA buttons: Keep Refresh/Export CSV/Export Image, primary gets `from-cyan-400 to-blue-500`
- Stats: Keep 3 stats (Page Views, Sessions, Impressions), use cyan-themed icon colors
- Time range pills: Keep below stats, same styling

### Files changed: 3
- `src/components/campaigns/CampaignsHero.tsx`
- `src/components/keywords/KeywordsHero.tsx`
- `src/pages/Analytics.tsx`

