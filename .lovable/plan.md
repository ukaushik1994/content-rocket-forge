

# Fix Proposal Browser: Better Cards + State Reset

## Problem 1: Proposal Cards Look Plain
The current proposal cards in the sidebar use basic `Card` with minimal styling. The strategy page uses the `EnhancedAIProposalCard` component which has:
- Status badges with color coding (Draft, Ready, etc.)
- SEO score with progress bar
- Word count and reading time estimates
- Keyword tooltips
- Hover glow effects and action icons
- Content stats grid

**Fix**: Reuse `EnhancedAIProposalCard` directly inside `ProposalBrowseStep`, passing `showActions={false}` (since sidebar actions differ) and adding a "Use This" button overlay. This ensures visual consistency with the strategy page without duplicating styling code.

## Problem 2: Stale Proposals Across Chat Sessions
The `ProposalBrowserSidebar` stores proposals in React `useState`. When the user navigates to a different chat and opens "AI Proposals" again, the component is not remounted -- it keeps the old proposals from the previous session.

**Fix**: Reset all sidebar state (`step`, `proposals`, `wizardData`) whenever the sidebar opens. Add a `useEffect` that watches `isOpen` and resets to the initial `'solutions'` step when it transitions to `true`. This guarantees a fresh start every time the user clicks "AI Proposals."

## Changes

### File 1: `src/components/ai-chat/proposal-browser/ProposalBrowseStep.tsx`
- Import and use `EnhancedAIProposalCard` from the strategy components
- Replace the plain `Card` rendering with `EnhancedAIProposalCard` for each proposal
- Keep the "Use This" button as an overlay action on each card
- Retain the loading skeleton and empty state as-is (those already look good)

### File 2: `src/components/ai-chat/proposal-browser/ProposalBrowserSidebar.tsx`
- Add a `useEffect` that resets state when `isOpen` transitions from `false` to `true`:
  - `setStep('solutions')`
  - `setProposals([])`
  - `setWizardData(null)`
  - `setIsGenerating(false)`
- This ensures every new sidebar open starts fresh with solution selection

## Technical Notes
- No new files created
- No backend changes needed
- The `EnhancedAIProposalCard` component is already exported and accepts the same proposal shape
- The state reset uses a simple `useEffect` with `isOpen` dependency and a `prevOpen` ref to detect the false-to-true transition

