

# Fix Sidebar Spacing & Button Styling

## Problem
1. The "Updated Xm ago" label sits inside `space-y-12` (48px gap) causing excessive whitespace above "00. STRATEGIC STANCE"
2. NarrativePromptCard buttons are oversized and don't match the premium glassmorphic theme

## Changes

### 1. Remove top spacing — `AnalystNarrativeTimeline.tsx` (line 215-227)
- Change `space-y-12` → `space-y-8` on the container to reduce gaps between all sections
- Move the "Updated Xm ago" label **outside** the `space-y` container — place it as a compact right-aligned line inside the sidebar header area, or reduce its vertical footprint by removing the `space-y-12` gap above it. Simplest fix: wrap it in a `mb-0 -mt-2` or move it before the `space-y` div so it doesn't inherit the 48px gap.

### 2. Refine NarrativePromptCard buttons — `NarrativePromptCard.tsx`
- Shrink buttons: `py-2 px-4` → `py-1.5 px-3`, font `text-xs` → `text-[11px]`
- Primary button: replace solid white `bg-foreground` with a subtle gradient (`bg-gradient-to-r from-primary/80 to-primary text-primary-foreground`) matching the premium theme
- Secondary button: keep outline style but use `border-white/10` and `text-foreground/50` for subtlety
- Reduce card padding: `p-3.5` → `p-3`, question text margin `mb-3` → `mb-2`

## Files: 2
| File | Change |
|------|--------|
| `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx` | Reduce section gap, fix "Updated" label spacing |
| `src/components/ai-chat/analyst-sections/NarrativePromptCard.tsx` | Smaller, premium-themed buttons |

