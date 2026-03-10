

# Premium Audit Implementation Plan — Phased Execution

This is a large specification with 4 bugs + 15 tasks. Many items overlap with work already done in prior rounds. Below is the status of each item and the phased plan for what remains.

---

## Already Done (No Work Needed)

| Item | Status |
|------|--------|
| Bug 1: Raw HTML in Repository cards | Already fixed — `SimplifiedRepositoryCard.tsx` uses `DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })` and `extractTitle.ts` strips HTML |
| Bug 3: Social duplicate stats | Already fixed — `EngageStatGrid` removed, comment at line 408 confirms |
| Task 8 (partial): Most Helmet titles | AI Chat, Analytics, Social, Contacts, Automations, Journeys, Email already have correct `| Creaiter` titles |
| Task 13: Calendar today highlight | Already implemented with `isToday` check and ring styling |
| Task 11: Chat auto-naming | Already implemented in `useEnhancedAIChatDB.ts` |

---

## Phase 1: Remaining Bug Fixes (2 items)

### Bug 2: Campaigns Stats Mismatch
**File**: `src/hooks/useCampaignStats.ts`
**Issue**: `useCampaignStats` queries the `campaigns` table for `active`/`planned` status, but `useCampaigns` may use different filters. The stats hook is correct — it queries the same table. The real issue is campaigns exist in DB with `active`/`planned` status but aren't showing in the list.
**Fix**: In `src/components/campaigns/CampaignList.tsx`, verify it uses the same `useCampaigns` hook. The empty state message is already good. The stat numbers from DB are accurate — this may be a data consistency issue rather than a code bug. No code change needed unless we want to force stats to match the list count exactly.
**Decision**: Wire the campaigns hero stats to use the same `campaigns` array from `useCampaigns()` passed as props, rather than an independent `useCampaignStats` hook, ensuring 1:1 match.

### Bug 4: Global Search
**File**: `src/components/ai-chat/ChatHistorySidebar.tsx`
**Scope**: This is a significant feature — searching across content, keywords, contacts, campaigns. Will create a `GlobalSearchResults` component that queries multiple tables and groups results.
**Approach**: When the sidebar search input is focused and has text, show a dropdown with grouped results from: conversations (existing), content_items (title search), keyword_library (keyword search), contacts (name/email search). Each result navigates to its page.

---

## Phase 2: Hero & Stats Additions (5 items)

### Task 1: AI Chat Hero Header
**File**: `src/components/ai-chat/EnhancedChatInterface.tsx` (welcome state, lines 448-484)
**Approach**: Replace the minimal Brain icon + greeting with a proper hero matching `EngagePageHero` pattern: badge pill ("AI Content Assistant" + sparkles icon + green dot), gradient title "Content Studio", subtitle, and 4 circular stats (Content, Published, In Review, SEO Score) pulled from `PlatformSummaryCard` data. Keep greeting text, quick actions, and chat input below.

### Task 2: Repository Circular Stats
**File**: `src/components/repository/RepositoryHero.tsx`
**Approach**: Add 3 circular stat icons (Total Content, Published, Drafts) between the "Create Content" button and feature tags. Use the same glassmorphic circle pattern from `EngagePageHero`. Pull counts from `useContent()` context.

### Task 3: Offerings Circular Stats
**File**: `src/pages/Solutions.tsx` — within the `SolutionManager` section
**Approach**: Add 3 circular stats (Total Offerings, Active, Featured) to the offerings section. Remove the existing "X Offerings Available" box.

### Task 4: Automations Circular Stats
**File**: `src/components/engage/automations/AutomationsList.tsx`
**Approach**: Add 3 circular stats (Active, Paused, Total Runs) with orange-tinted backgrounds between CTA buttons and search bar.

### Task 5: Campaigns Stats → Circular Format
**File**: `src/components/campaigns/CampaignsHero.tsx` (lines 210-246)
**Approach**: Replace the 3 rectangular stat cards with circular icon stats matching `EngagePageHero` pattern. Use green/teal tint.

---

## Phase 3: Visual Polish (4 items)

### Task 6: Standardize CTA Buttons
**Files**: Multiple pages
**Changes needed** (only non-gradient primaries):
- Offerings "Edit Company Details" → purple gradient
- Approvals "Analyze All Content" → purple gradient
- Keywords "Create Content" → purple gradient
- Analytics "Refresh Data" → purple gradient
- Social "+ New Post" → purple gradient
- Contacts "+ Add Contact" → purple gradient
- Automations "+ New Automation" → orange gradient
- Journeys "+ New Journey" → purple gradient
- Calendar "+ Add Content" → purple gradient

### Task 7: Breadcrumbs on All Pages
**Approach**: Create a reusable `PageBreadcrumb` component (similar to `EngageBreadcrumb`) that maps routes to section/page labels. Add it to: AI Chat, Repository, Offerings, Approvals, Campaigns, Keywords, Analytics, Calendar.

### Task 8: Remaining Helmet Titles
**Changes needed**:
- Campaigns: `"Campaigns — AI-Powered..."` → `"Campaigns | Creaiter"`
- Keywords: `"Keywords — Keyword Repository..."` → `"Keywords | Creaiter"`
- Calendar: Check and fix to `"Calendar | Creaiter"`

### Task 9: Card Hover Effects
Already partially done — `SimplifiedRepositoryCard` has `whileHover`. Ensure consistent hover (subtle scale + shadow) across all card types app-wide.

---

## Phase 4: Micro-Interactions & Polish (4 items)

### Task 10: Standardize Empty States
Verify all pages use `UnifiedEmptyState` or a consistent pattern with icon + title + subtitle + CTA.

### Task 12: Skeleton Loading States
Add shimmer skeleton loading to pages that flash empty before data loads. Key targets: Repository grid, Keywords grid, Campaigns list.

### Task 14: Page Transition Animations
Add a fade-in-up animation wrapper to each page's root element. Most pages already use framer-motion `initial/animate` — verify consistency and add where missing.

### Task 15: Button Press Feedback
Add `active:scale-[0.97] transition-transform` to the base `Button` component in `src/components/ui/button.tsx`. This applies globally to all buttons.

---

## Implementation Order

1. **Phase 1** — Bug 2 (campaigns stats sync), Bug 4 (global search) — ~2 messages
2. **Phase 2** — AI Chat hero, Repository stats, Offerings stats, Automations stats, Campaigns circular stats — ~2 messages
3. **Phase 3** — CTA buttons, breadcrumbs, Helmet titles, card hovers — ~2 messages
4. **Phase 4** — Empty states, skeletons, transitions, button press — ~1 message

**Total estimated**: ~7 implementation messages across 4 phases.

