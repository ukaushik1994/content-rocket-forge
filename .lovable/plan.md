

# Plan: Wire AI Proposals into the + Menu

The infrastructure already exists — `ProposalBrowserSidebar` with solution selection and proposal generation is built, and `PlusMenuDropdown` already has an unused `onAIProposals` prop. We just need to connect the dots.

## Changes

### 1. PlusMenuDropdown.tsx
Add AI Proposals to the menu items array. The `onAIProposals` prop already exists in the interface but is never destructured or used. Wire it into the menu items list with a `Lightbulb` icon.

### 2. ContextAwareMessageInput.tsx
Pass `onOpenProposals` (which already exists as a prop) through to `PlusMenuDropdown` as `onAIProposals`.

That's it — two small wiring changes. When clicked:
1. Plus menu shows "AI Proposals" option
2. Click triggers `onOpenProposals` → bubbles up to `EnhancedChatInterface`
3. `EnhancedChatInterface` already sets `visualData` to `{ type: 'proposal_browser' }`
4. `VisualizationSidebar` already renders `ProposalBrowserSidebar` for that type
5. User picks solutions → proposals are generated

