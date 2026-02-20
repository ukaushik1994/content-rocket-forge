
# Polish Proposal Cards UI

## Issues Identified from Screenshot

1. **"NEW" badge overlaps the priority tag** -- The NEW badge uses `absolute top-2 left-2` positioning, which sits directly on top of the "High Return" / "Evergreen" badges in the header row. This creates a visual clash where both are fighting for the same space.

2. **"Use This" button overlaps the footer** -- The button is positioned with `absolute bottom-3 right-3` on the parent wrapper in `ProposalBrowseStep`, which overlaps the card's own footer row (timestamp area). This looks cramped and inconsistent.

3. **Cards could use tighter spacing and better visual separation** for the sidebar context where space is limited.

## Changes

### File 1: `EnhancedAIProposalCard.tsx`

**Fix the NEW badge overlap:**
- Remove the absolutely-positioned NEW badge block (lines 243-254)
- Instead, integrate the NEW indicator inline in the header badge row, before the priority tag
- This keeps all badges flowing naturally without overlap

**Integrate "Use This" into the card footer:**
- Add an optional `actionSlot` prop (a `ReactNode`) that the parent can pass in
- Render it in the footer row (right side, where the action buttons go)
- This eliminates the need for absolute positioning from the parent

### File 2: `ProposalBrowseStep.tsx`

**Pass "Use This" as `actionSlot` instead of absolute overlay:**
- Remove the `absolute bottom-3 right-3` wrapper div (lines 117-129)
- Instead, pass the "Use This" button as the `actionSlot` prop to `EnhancedAIProposalCard`
- Remove the `relative` class from the parent `motion.div` since absolute positioning is no longer needed

## Summary

| File | Change |
|------|--------|
| `EnhancedAIProposalCard.tsx` | Move NEW badge inline into header row; add `actionSlot` prop rendered in footer |
| `ProposalBrowseStep.tsx` | Pass "Use This" button via `actionSlot` prop instead of absolute overlay |

Two files, focused fixes for the overlap issues. No new dependencies, no backend changes.
