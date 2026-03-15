

# Add "AI Proposals" Page to Library Section

## What's Happening
AI Proposals are generated and saved to the `ai_strategy_proposals` database table, but there's no dedicated page to browse all of them. They're only visible in the sidebar during generation. We'll add a full page under the Library section.

## Plan

### 1. Create the AI Proposals page (`src/pages/AIProposals.tsx`)
- Fetch all proposals from `ai_strategy_proposals` table for the current user, ordered by `created_at` desc
- Use the existing `EnhancedAIProposalCard` component to render each proposal (same look as the proposal browser sidebar)
- Add filtering by status (available, scheduled, completed, archived) and content type
- Include the standard `PageBreadcrumb` with section="Library" page="AI Proposals"
- Wrap in the glassmorphic card style consistent with Repository page
- Add a "Use This" action on each card that navigates to AI Chat with the proposal context

### 2. Add route in `src/App.tsx`
- Add `/ai-proposals` route wrapped in `ProtectedRoute > AppLayout`
- Import the new page component

### 3. Add to sidebar navigation (`src/components/ai-chat/ChatHistorySidebar.tsx`)
- Add "AI Proposals" entry to `libraryItems` array with a `Target` or `Sparkles` icon
- Links to `/ai-proposals`

### Technical Notes
- Reuses `EnhancedAIProposalCard` from `src/components/research/content-strategy/components/`
- Queries `ai_strategy_proposals` table directly via Supabase client
- Auth-guarded: waits for `user` from `useAuth()` before fetching
- Consistent with existing Library pages (Repository, Offerings, Approvals)

