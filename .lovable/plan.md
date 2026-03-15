

# Fix AI Proposals Page: Use Original Card Style + Detail Modal

## Problems
1. The page uses `EnhancedAIProposalCard` (a compact, simplified card) instead of the original `ProposalCard` which has richer content (impressions stats, related keywords, content suggestions, status badges, media indicators)
2. Clicking any card navigates to `/ai-chat` instead of opening the `OpportunityDetailModal` with full proposal details
3. Cards lack the built-in scheduling dialog and "Create Content" action

## Solution

### Modify `src/pages/AIProposals.tsx`

Replace `EnhancedAIProposalCard` with the original `ProposalCard` component (from `src/components/research/content-strategy/ProposalCard.tsx`), which already has:
- Click-to-open `OpportunityDetailModal` (no navigation away)
- Built-in schedule-to-calendar dialog
- "Create Content" / "Send to Builder" action
- Richer layout: impressions bar, related keywords, content ideas, status badge, media indicators

Changes:
- Import `ProposalCard` instead of `EnhancedAIProposalCard`
- Add selection state (`selected` object) and a handler for `onSendToBuilder` that navigates to content strategy builder
- Pass proper props: `index`, `isSelected`, `onSelectionChange`, `onSendToBuilder`
- Remove the `onViewDetails={() => navigate('/ai-chat')}` — `ProposalCard` handles detail viewing internally via its modal
- Add a view toggle (tiles/rows) using the existing `ViewToggle` component for consistency with the Content Strategy page

This is a single-file change to `src/pages/AIProposals.tsx`.

