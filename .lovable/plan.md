

# Redesign Repository & Approvals Heroes to Match Automations Style

## Color Assignments

| Page | Gradient | Icon Color | Glow |
|------|----------|------------|------|
| Repository | `from-foreground via-violet-400 to-purple-500` | `text-violet-400` | `violet-500/[0.06]` |
| Approvals | `from-foreground via-orange-400 to-red-400` | `text-orange-400` | `orange-500/[0.06]` |

## Changes

### 1. `src/components/repository/RepositoryHero.tsx`
Full rewrite to match Automations pattern:
- Ambient glow: centered radial `bg-violet-500/[0.06]` (replace animated gradient-to-r)
- Badge: `Layers` icon + "Content Hub" + green dot, `glass-card`
- Title: single line "Repository" with violet/purple gradient
- Subtitle: shorter, single line
- CTA: "Create Content" button with `from-violet-400 to-purple-500`
- Stats: keep existing 3 stats, use violet-themed icon colors (`text-violet-400`, `text-emerald-400`, `text-amber-400`)
- Remove empty lines/dead code blocks (lines 24-38, 100-121)

### 2. `src/components/approval/modern/ContentApprovalHero.tsx`
Rewrite to match Automations pattern:
- Ambient glow: centered radial `bg-orange-500/[0.06]` (replace animated gradient-to-r)
- Badge: `Sparkles` icon + "AI Review Engine" + green dot, `glass-card`
- Title: single line "Approvals" with orange/red gradient
- Subtitle: shorter
- CTA: keep "Analyze All Content" button, restyle with `from-orange-400 to-red-400`
- Remove shimmer animation on CTA
- Stats: keep 3 stats, use orange-themed icon colors

### Files changed: 2

