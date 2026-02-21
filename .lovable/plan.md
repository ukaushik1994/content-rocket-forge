

# Persist AI Chat Proposals to Database

## Problem

When a user generates proposals via the AI Chat sidebar (`ProposalBrowserSidebar`), the proposals are only held in React state. If the user closes the sidebar or navigates away, all generated proposals are lost. They should be saved to the `ai_strategy_proposals` table automatically so they appear in the Content Strategy page for future reference.

## Current State

- `ContentStrategyContext.tsx` (lines 332-400) already has full persistence logic that inserts proposals into `ai_strategy_proposals` with proper validation, field mapping, and error handling.
- `ProposalBrowserSidebar.tsx` calls `contentStrategyService.generateAIStrategy()` directly and stores results only in local `useState`.
- The `ai_strategy_proposals` table already has all needed columns: `user_id`, `title`, `primary_keyword`, `priority_tag`, `estimated_impressions`, `status`, `solution_id`, etc.

## Solution

Add persistence logic to `ProposalBrowserSidebar.tsx` right after proposals are generated (inside `handleSolutionSelect`). This mirrors the same insert pattern used in `ContentStrategyContext`.

### File: `src/components/ai-chat/proposal-browser/ProposalBrowserSidebar.tsx`

After the proposals are enriched (line 53-56), add a database insert block:

1. Get the current user via `supabase.auth.getUser()`
2. Filter proposals to only those with valid `title` and `primary_keyword`
3. Map them to the `ai_strategy_proposals` insert shape (matching the existing pattern from `ContentStrategyContext`):
   - `user_id`, `title`, `description`, `primary_keyword`, `related_keywords`, `content_type`, `priority_tag`, `estimated_impressions`, `solution_id`, `proposal_data`, `status: 'available'`
4. Insert via `supabase.from('ai_strategy_proposals').insert(...).select()`
5. On success: use the returned rows (which have real DB `id`s) as the local state instead of the raw API response -- this ensures "Use This" passes real proposal IDs downstream
6. On failure: log the error, show a warning toast, but still display the proposals in the sidebar (graceful degradation)

### What This Achieves

- Proposals generated from AI Chat are automatically saved to the database
- They appear on the Content Strategy page under "AI Proposals" for future reference
- If the user leaves without clicking "Use This", the proposals are still accessible later
- The `status` field starts as `'available'` and transitions to `'completed'` when content is created from them (existing trigger handles this)
- No new tables, no schema changes, no new edge functions -- just one insert call in the sidebar

### Edge Cases Handled

- **Duplicate prevention**: Each generation creates new proposals with unique DB-generated UUIDs -- no conflict risk
- **Missing fields**: The mapping includes fallback defaults (`'blog'`, `'evergreen'`, `0`) matching the existing pattern
- **Auth failure**: If user isn't authenticated, the insert will fail silently and proposals still display locally

