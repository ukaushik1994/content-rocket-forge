

# Journey Builder — Premium UI Overhaul

## What I See in the Screenshot

The builder toolbar is still visually cramped and flat. The canvas is dark and lifeless. The overall feel is "developer tool" not "premium SaaS product." Here's what needs fixing:

---

## Changes

### 1. Toolbar — Clean, Spacious, Premium

**Current problem**: Too many small ghost buttons crammed together. Separators are barely visible. No visual hierarchy between actions.

**Fix**:
- Increase height to `h-16` with `px-6` for breathing room
- Journey name gets larger text (`text-base font-semibold`)
- Status badge gets a subtle dot indicator instead of text badge
- Auto-save indicator is cleaner (just a small dot, green when saved)
- **Left side**: Back arrow + name + status dot + save indicator
- **Right side**: Only 3 visible groups with clear visual separation:
  - **Tools**: Undo/Redo as a joined button group with `bg-muted/50 rounded-lg` wrapper, then Add Node button (outline, slightly larger)
  - **Quick access**: Fit View, More (⋯), Insights (chart icon) — all as `h-9 w-9` icon buttons
  - **Primary actions**: Validate (outline), Save (outline), Publish (solid pill, `h-9 rounded-full px-6`)
- Remove `Separator` components — use `gap-3` between groups and a subtle `bg-muted/30 rounded-lg px-2 py-1` wrapper around each group instead

### 2. Canvas — Depth & Premium Feel

**Current problem**: Dark void with barely visible dots. Radial gradient overlay is too subtle.

**Fix**:
- Background dots: increase size to `1.5`, use `hsl(var(--muted-foreground) / 0.12)` with gap `24`
- Add a stronger radial gradient: `bg-[radial-gradient(ellipse_at_center,hsl(var(--muted)/0.3)_0%,transparent_70%)]` — creates a subtle spotlight effect at center
- Style React Flow Controls: wrap in a floating card-like container with `rounded-xl shadow-lg bg-card border-border/50`
- Hide MiniMap by default (it adds clutter on this page) — move it into a toggle or remove
- Add subtle corner vignette for depth

### 3. Empty State — More Inviting

**Current problem**: The empty state exists but feels disconnected from the canvas.

**Fix**:
- Larger icon (h-24 w-24) with a softer background glow
- Add 3 small suggestion pills below the button: "Start with a Trigger", "Import a template", "View examples"
- Subtle floating animation on the icon

### 4. Node Dropdown — Polished

**Current**: Works but feels generic dropdown.

**Fix**:
- Wider dropdown (`w-56`)
- Each node item gets a brief description below the name in `text-[10px] text-muted-foreground`
- Category headers get a thin left accent line

### 5. Edge Styling

**Current**: Animated dashed edges with muted stroke look generic.

**Fix**:
- Solid edges instead of animated dashes (cleaner look)
- Slightly thicker stroke (`strokeWidth: 2`)
- Use `hsl(var(--border))` instead of `muted-foreground` for softer appearance
- Arrow markers in matching muted color

---

## Files to Edit

| File | Changes |
|------|---------|
| `src/components/engage/journeys/JourneyBuilder.tsx` | Toolbar redesign (layout, spacing, grouping), canvas background tuning, empty state enhancement, edge styling, hide MiniMap, node dropdown polish |
| `src/components/engage/journeys/nodes/CustomNodes.tsx` | No changes needed |

## Implementation Notes
- All changes are in a single file (`JourneyBuilder.tsx`)
- No new components needed
- No dependency changes

