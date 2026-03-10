

# Creaiter Premium Audit — Implementation Plan

## Scope Assessment

After auditing the codebase against the 16-page report, many items are already addressed. Here is what remains, organized by priority.

---

## Phase 1: Critical Bugs (P0)

### 1.1 Raw HTML in Repository Card Titles
**File**: `src/components/repository/SimplifiedRepositoryCard.tsx`
**Root cause**: `getDisplayTitle()` calls `extractTitleFromContent()` which strips markdown (`#`, `**`) but not HTML tags (`<h2>`, `<p>`). The `EnhancedContentCard` path uses `DOMPurify.sanitize(title, { ALLOWED_TAGS: [] })` but `SimplifiedRepositoryCard` does not.
**Fix**: Import `DOMPurify` and strip HTML in `getDisplayTitle()` before returning — add `DOMPurify.sanitize(title, { ALLOWED_TAGS: [] })` as a final pass on the returned string. Also fix `extractTitleFromContent` in `src/utils/content/extractTitle.ts` to strip HTML tags after stripping markdown.

### 1.2 Social Page Duplicate Stats
**File**: `src/components/engage/social/SocialDashboard.tsx`
**Root cause**: Stats are rendered twice — once via `EngagePageHero` (line 279-283 `stats` prop) AND again via `EngageStatGrid` (lines 403-410). Both show Scheduled/Posted/Connected.
**Fix**: Remove the `EngageStatGrid` block (lines 403-410) since the hero already displays the same stats.

### 1.3 Campaigns Stats Mismatch
**File**: `src/components/campaigns/CampaignsHero.tsx`
**Root cause**: The hero uses `useCampaignStats()` which queries the DB independently, while the campaign list uses `useCampaigns()`. If the stats hook counts strategies while the list shows saved campaigns, there's a mismatch.
**Fix**: Audit `useCampaignStats` to ensure it queries the same `campaigns` table/view as `useCampaigns`. Add an empty state message in `CampaignList` when `campaigns.length === 0 && !isLoading` that says "No campaigns yet — start a conversation above to create one."

### 1.4 Search Only Searches Chats
**File**: `src/components/ai-chat/ChatHistorySidebar.tsx`
**Assessment**: The sidebar search is scoped to chat history, which is correct for its location. A global search (Cmd+K) is a P3 feature — not a bug. However, we should update the placeholder to be clearer.
**Fix**: Change placeholder from "Search chats..." to "Search conversations..." (minor). Global command palette deferred to Phase 4.

---

## Phase 2: Visual Consistency (P1)

### 2.1 AI Chat Missing Gradient Hero
**File**: `src/pages/AIChat.tsx`
**Current state**: Has animated gradient blobs in background but no structured hero header matching other pages.
**Decision**: AI Chat is intentionally different — it's a chat-first interface, not a content page. Adding a full hero would push the chat below the fold. Instead, enhance the welcome state in `EnhancedChatInterface.tsx` with a subtle gradient treatment on the greeting text to match the brand language without disrupting the chat-first UX.

### 2.2 Keywords Already Has Hero
**File**: `src/components/keywords/KeywordsHero.tsx`
**Status**: Already has a gradient hero with badge ("Keyword Repository"), gradient title ("Keyword Management Dashboard"), and animated background. The audit finding is incorrect — this is already implemented.

### 2.3 Browser Tab Titles
**Files**: Multiple pages
**Audit**: Some pages use generic titles. Verify and fix:
- AI Chat → "AI Chat — Creaiter"
- Keywords → already has Helmet
- Social, Contacts, Automations, Journeys → check if `<Helmet>` is set in each Engage sub-component

### 2.4 Consistent Empty States
**Assessment**: Most pages already use `UnifiedEmptyState`. Verify Social, Contacts, and Automations use it consistently.

---

## Phase 3: Premium Polish (P2)

### 3.1 AI Chat Welcome State Enhancement
**File**: `src/components/ai-chat/EnhancedChatInterface.tsx`
**Fix**: Add a gradient text treatment to the "Good morning" greeting and enhance the stats bar with color-coded values and subtle glassmorphic card backgrounds.

### 3.2 Chat Auto-Naming
**File**: `src/contexts/AIChatDBContext.tsx` or equivalent
**Fix**: When saving a conversation's first message, auto-generate a title from the first 50 chars of the user's message instead of "New Chat". This is a UX improvement.

### 3.3 Calendar Today Highlight
**File**: Calendar component (under `/research/calendar`)
**Fix**: Add a visual indicator (ring or background highlight) for today's date.

---

## Phase 4: Advanced Features (P3) — Deferred

These are noted but not planned for this round:
- Global command palette (Cmd+K)
- Dashboard home page
- Theme customization
- Onboarding walkthrough
- Keyboard shortcuts

---

## Implementation Summary

| # | Task | File(s) | Effort |
|---|------|---------|--------|
| 1 | Strip HTML from repository card titles | `SimplifiedRepositoryCard.tsx`, `extractTitle.ts` | Small |
| 2 | Remove duplicate stats on Social page | `SocialDashboard.tsx` | Tiny |
| 3 | Fix campaigns stats/empty state mismatch | `CampaignsHero.tsx`, `CampaignList.tsx`, `useCampaignStats.ts` | Small |
| 4 | Enhance AI Chat welcome gradient treatment | `EnhancedChatInterface.tsx` | Small |
| 5 | Add `<Helmet>` titles to Engage sub-pages | `SocialDashboard.tsx`, `ContactsHub.tsx`, etc. | Small |
| 6 | Auto-name chat conversations | `AIChatDBContext.tsx` | Medium |
| 7 | Calendar today highlight | Calendar component | Small |

Total: ~7 focused edits across ~10 files. No new dependencies needed.

