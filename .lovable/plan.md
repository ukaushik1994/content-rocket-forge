

# Redesign Repository Cards — Clean Editorial Style

## Reference (Image 1)
The target design is a clean, minimal card:
- Top row: Platform icon (circle) + platform name badge + status badge (right-aligned)
- Title: Clean, bold, 2-line clamp
- Content preview: Muted text, 2-3 lines
- Source link: Subtle pill with link icon
- Footer: Timestamp left, "View" button right (solid, rounded)
- No heavy gradients, no neon glows, no excessive hover effects

## Current Problems (Image 2)
- Oversized content-type icon with heavy gradient glow
- Status badge has neon shadow effects
- "Video Soon" badge clutters the top-right
- Footer is cramped with Edit, Delete, View all fighting for space
- Excessive hover effects (scale 1.03, neon borders, drop shadows)
- Solution logo competes with content-type icon

## Plan — Rewrite `SimplifiedRepositoryCard.tsx`

### Layout (top to bottom):
1. **Header row**: Content-type icon (40px circle, subtle bg) + content-type label badge + status badge (right-aligned, no glow)
2. **Solution logo**: If present, small 24px icon in header row (right of status)
3. **Title**: `text-base font-semibold line-clamp-2`, no hover glow effects
4. **Preview text**: Strip HTML from `content.content`, show 2-3 lines muted, `text-sm text-muted-foreground line-clamp-3`
5. **Source link pill**: If `metadata?.sourceUrl` exists, show as a compact pill with link icon
6. **Repurposed format icons**: Keep existing platform icon row but move into preview area
7. **Footer**: Timestamp left (`text-xs text-muted-foreground`), View button right (solid `bg-muted/60` rounded pill with Eye icon)

### Style changes:
- Card: `glass-card` with simple `hover:border-white/20` — remove `neon-border`, `card-3d`, all `before:` pseudo-element overlays, and `hover:shadow-[0_20px_40px...]`
- Motion: Keep fade-in, remove `whileHover` scale/translate, keep subtle `whileTap: { scale: 0.98 }`
- Icon container: `bg-primary/15 rounded-xl p-2.5` — no gradient, no glow shadow
- Status badge: Simple `bg-white/10 text-xs` — no neon shadow
- Remove `VideoComingSoonBadge` from card (move to detail view only)
- Edit/Delete buttons: Move to a hover-revealed overlay or dropdown menu to keep footer clean — or keep just Edit icon + View button

### Footer simplification:
- Left: repurposed platform icons (if any) + timestamp
- Right: Edit (ghost icon-only) + View (outline pill button)
- Delete stays via the existing AlertDialog but triggered from a small trash icon

### Files changed:
- `src/components/repository/SimplifiedRepositoryCard.tsx` — full rewrite of JSX and styles

### No structural changes to:
- `RepositoryGrid.tsx` — grid layout stays the same
- `RepositoryCard.tsx` — passthrough stays the same
- Props interface — no changes needed

