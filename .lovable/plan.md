

# Loading Skeleton for Proposal Browser + Handoff Verification + E2E Testing

## 1. Loading Skeleton in ProposalBrowseStep

**File: `src/components/ai-chat/proposal-browser/ProposalBrowseStep.tsx`**

Add an `isLoading` prop. When true, render 4 shimmer skeleton cards instead of the empty state or proposals list. Each skeleton card mimics the real proposal card layout:
- Two small badge skeletons (priority + type)
- A title skeleton (75% width)
- A description skeleton (full width + 66% width)
- Three keyword pill skeletons
- Bottom row with impressions skeleton + button skeleton

Uses the existing `Skeleton` component from `@/components/ui/skeleton` with `animate-pulse`.

**File: `src/components/ai-chat/proposal-browser/ProposalBrowserSidebar.tsx`**

Pass `isGenerating` state as `isLoading` prop to `ProposalBrowseStep`. Show the skeleton view during the generation phase (between clicking "Generate Proposals" and receiving results) by transitioning to the `proposals` step immediately when generation starts, rather than waiting for completion.

Changes:
- In `handleSolutionSelect`, call `setStep('proposals')` before the API call starts (move it before the `try` block)
- Pass `isGenerating` to `ProposalBrowseStep` as `isLoading`

## 2. Handoff Verification (Already Correct)

The code already correctly handles the proposal-to-wizard handoff:
- `ProposalBrowserSidebar.handleUseProposal` extracts `primary_keyword`, `solution_id`, and `content_type` from the selected proposal
- It sets `wizardData` and transitions `step` to `'wizard'`
- When `step === 'wizard'`, it renders `ContentWizardSidebar` with `keyword`, `solutionId`, and `contentType` props
- `ContentWizardSidebar` accepts these props (lines 16-22) and uses them to pre-fill the wizard state

No code changes needed for this -- it's already wired.

## 3. E2E Flow Verification (Testing Only)

The full flow is already implemented:
1. User types "create a blog about X" in AI Chat
2. Edge function returns `content_creation_choice` visual type with the keyword
3. `EnhancedMessageBubble` renders `ContentCreationChoiceCard` inline
4. "Start from Scratch" sets visualization to `content_wizard` type, opening `ContentWizardSidebar`
5. "AI Proposals" sets visualization to `proposal_browser` type, opening `ProposalBrowserSidebar`
6. `VisualizationSidebar` routes to the correct sidebar component based on type

This will be tested after implementation.

## Summary of Changes

| File | Change |
|------|--------|
| `ProposalBrowseStep.tsx` | Add `isLoading` prop + skeleton card UI (4 shimmer cards) |
| `ProposalBrowserSidebar.tsx` | Move step transition before API call, pass `isGenerating` to browse step |

Two files modified, zero new files created.

