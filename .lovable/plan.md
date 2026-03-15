

# Remove Solution Detail Dialog

The card currently has two popups:
1. **SolutionDetailDialog** — opens when clicking anywhere on the card (the one shown in your screenshot)
2. **Edit dialog** — opens when clicking the "Edit" button

You want to remove the detail dialog (1) and keep only the edit dialog (2).

## Changes

### 1. `src/components/solutions/EnhancedSolutionCard.tsx`
- Remove `onViewDetail` prop
- Remove `onClick={onViewDetail}` from the Card element (line 58) so clicking the card does nothing

### 2. `src/components/solutions/EnhancedSolutionGrid.tsx`
- Remove `onViewDetail={() => setDetailSolution(solution)}` prop from `EnhancedSolutionCard` (line 83)
- Remove the `detailSolution` state variable (line 31)
- Remove the `<SolutionDetailDialog>` component and its import (lines 5, 92-108)

### 3. Optionally delete `src/components/solutions/SolutionDetailDialog.tsx`
- No longer used anywhere

