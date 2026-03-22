# Cowork UX Audit — Fix Plan

> **Source:** Cowork UX Audit Report dated March 22, 2026
> **Findings:** 5 bugs + 8 recommendations
> **Plan:** 4 phases, prioritized by severity

---

## PHASE 1: Critical Bugs (30 min)

### Bug 1: Raw JSON in AI Proposals — HIGH

**What Cowork found:** Primary Keyword field shows `{"keyword":"self-service SQL querying for finance"}` instead of just the keyword text. Related Keywords show same raw JSON.

**Current code:** `ProposalCard.tsx` already has a `normalizeKeyword()` function (line 38) that handles object → string extraction. BUT the data stored in the DB may have inconsistent formats — some are strings, some are JSON objects.

**Fix — File:** `src/components/research/content-strategy/ProposalCard.tsx`

The `normalizeKeyword` function exists but may not cover all edge cases. Verify and harden:

```ts
// Ensure normalizeKeyword handles ALL formats:
function normalizeKeyword(kw: any): string {
  if (!kw) return '';
  if (typeof kw === 'string') {
    // Try parsing in case it's a JSON string
    try {
      const parsed = JSON.parse(kw);
      if (typeof parsed === 'object' && parsed.keyword) return String(parsed.keyword);
      if (typeof parsed === 'string') return parsed;
    } catch { /* not JSON, use as-is */ }
    return kw;
  }
  if (typeof kw === 'object') {
    if (kw.keyword) return String(kw.keyword);
    if (kw.name) return String(kw.name);
    // Last resort: stringify but strip braces
    return JSON.stringify(kw).replace(/[{}"]/g, '').replace(/keyword:/g, '');
  }
  return String(kw);
}
```

Also check where Related Keywords render — apply the same normalization to each item in the array.

**Frontend:** `ProposalCard.tsx` — harden normalizeKeyword + apply to related keywords display
**Backend:** No changes

---

### Bug 2: Campaigns Stats vs List Mismatch — HIGH

**What Cowork found:** Header shows "4 Active" campaigns but "My Campaigns" section shows empty state.

**Root cause:** Line 511 in `Campaigns.tsx`:
```ts
activeCampaigns: campaigns.filter(c => c.status === 'active' || c.status === 'planned').length,
```

The `campaigns` array comes from a query that may include campaigns from the `ai_strategy_conversations` table (strategy conversations, not actual campaigns) or from a different user's data. The "My Campaigns" list below may filter differently or query a different table.

**Fix — File:** `src/pages/Campaigns.tsx`

1. Verify both the hero stats AND the campaign list query the SAME `campaigns` table with the SAME user_id filter
2. The stats should be computed FROM the same array that renders the list — not from a separate query
3. If `campaigns` array is empty but stats show 4, the stats query is pulling from a different source

Check: do the hero stats come from `useCampaignStats()` hook while the list comes from a direct query? If so, make them use the same source.

```ts
// Both should use the same data:
const { data: campaigns = [] } = useQuery({
  queryKey: ['campaigns', user?.id],
  queryFn: async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    return data || [];
  }
});

// Stats derived from same array:
const stats = {
  activeCampaigns: campaigns.filter(c => c.status === 'active').length,
  contentPiecesCreated: campaigns.reduce((sum, c) => sum + (c.content_count || 0), 0),
  completedCampaigns: campaigns.filter(c => c.status === 'completed').length,
};

// List renders same array:
{campaigns.length === 0 ? <EmptyState /> : campaigns.map(c => <CampaignCard key={c.id} campaign={c} />)}
```

**Frontend:** `Campaigns.tsx` — ensure stats and list use identical data source
**Backend:** No changes

---

### Bug 3: /content-calendar 404 — MEDIUM

**What Cowork found:** Navigating to `/content-calendar` returns 404. Sidebar button routes to `/calendar`.

**Current state:** No `/content-calendar` route exists in App.tsx. The calendar route is `/calendar`.

**Fix — File:** `src/App.tsx`

Add a redirect:

```tsx
<Route path="/content-calendar" element={<Navigate to="/calendar" replace />} />
```

This is a one-line fix. Add it near the other redirect routes (where `/content-type-selection` redirects to `/ai-chat`, etc.).

**Frontend:** `App.tsx` — add redirect
**Backend:** No changes

---

## PHASE 2: Medium Bugs + Quick Wins (20 min)

### Bug 4: AI Chat Blank on Navigation — MEDIUM

**What Cowork found:** Navigating back to `/ai-chat` from another page shows blank content for several seconds.

**Fix:** Add a loading skeleton or quick fallback while the chat interface mounts.

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

If there's no loading indicator during initial mount, add one:

```tsx
// At the top of the component render:
if (!user) {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
```

Also check if the `useEnhancedAIChatDB` hook has a loading state that should be shown.

**Frontend:** `EnhancedChatInterface.tsx` — add loading fallback
**Backend:** No changes

---

### Bug 5: Sidebar Expand/Collapse — LOW-MEDIUM

**What Cowork found:** TOOLS and ENGAGE sidebar sections require multiple clicks to expand. Clickable area too narrow.

**Fix — File:** `src/components/ai-chat/ChatHistorySidebar.tsx`

Find the section headers (TOOLS, ENGAGE). Increase the clickable area:

```tsx
// Change from:
<button className="text-xs ..." onClick={toggleSection}>
  TOOLS <ChevronDown />
</button>

// To (larger hit area):
<button className="w-full text-left px-3 py-2 text-xs ... hover:bg-muted/20 transition-colors" onClick={toggleSection}>
  TOOLS <ChevronDown />
</button>
```

Ensure `onClick` is on the ENTIRE row, not just the text or icon.

**Frontend:** `ChatHistorySidebar.tsx` — widen clickable area for section headers
**Backend:** No changes

---

### Rec 6: Make Home Stats Cards Clickable

**What Cowork found:** Content (17), Published (4), In Review (0), SEO Score (16%) should link to filtered views.

**Fix — File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Find where the stats cards render on the welcome screen. Make them clickable:

```tsx
<div onClick={() => navigate('/repository')} className="cursor-pointer ...">
  <span>Content</span>
  <span>17</span>
</div>
<div onClick={() => navigate('/repository?status=published')} className="cursor-pointer ...">
  <span>Published</span>
  <span>4</span>
</div>
<div onClick={() => navigate('/content-approval')} className="cursor-pointer ...">
  <span>In Review</span>
  <span>0</span>
</div>
<div onClick={() => navigate('/analytics')} className="cursor-pointer ...">
  <span>SEO Score</span>
  <span>16%</span>
</div>
```

**Frontend:** `EnhancedChatInterface.tsx` — add onClick + cursor-pointer to stats cards
**Backend:** No changes

---

## PHASE 3: Recommendations (15 min)

### Rec 3: Fix page load times (3-5 sec skeletons)

**What Cowork found:** Email, Journeys, Offerings show 3-5 second skeleton states.

**Fix:** Add `staleTime` and `gcTime` to React Query hooks on these pages so data is cached:

```ts
// In each page's useQuery:
{
  staleTime: 30_000, // Don't refetch within 30 seconds
  gcTime: 5 * 60_000, // Keep in cache for 5 minutes
}
```

This prevents re-fetching on every navigation. Data loads instantly from cache on repeat visits.

**Frontend:** Email, Journeys, Offerings page hooks — add staleTime/gcTime
**Backend:** No changes

---

### Rec 7: Global Search Enhancement

**What Cowork found:** Search only works for chat conversations.

**Current state:** `GlobalSearchResults.tsx` already exists and searches across content, keywords, contacts, campaigns. It's in the chat sidebar.

**The issue:** Users may not find it because it's inside the chat sidebar, not a top-level search bar.

**Fix:** The search icon is already in the top-right corner (`SearchIconButton` in AppLayout). Verify it's visible on ALL pages (not just AI Chat). If it only shows on `/ai-chat`, extend it.

**File:** `src/components/layout/AppLayout.tsx`

Check if `SearchIconButton` renders on all routes or just `/ai-chat`. If conditional:

```tsx
// Change from conditional to always:
<SearchIconButton /> // Should render on every page
```

**Frontend:** `AppLayout.tsx` — verify search button renders globally
**Backend:** No changes

---

### Rec 8: Social "Coming Soon" Badge

**What Cowork found:** Social posting isn't functional. Should have a badge.

**Current state:** Honesty banner already exists on social dashboard (SB-6 fix). But the sidebar nav link has no indicator.

**Fix — File:** `src/components/ai-chat/ChatHistorySidebar.tsx`

Find the Social nav item. Add a small badge:

```tsx
// Next to "Social" label:
<span>Social</span>
<span className="text-[8px] px-1 py-0.5 rounded bg-yellow-500/20 text-yellow-400 ml-1">Beta</span>
```

**Frontend:** `ChatHistorySidebar.tsx` — add Beta badge next to Social nav item
**Backend:** No changes

---

## PHASE 4: Polish (10 min)

### Rec 4: Loading indicators on chat navigation

Already addressed in Phase 2 Bug 4.

### Rec 5: Sidebar fix

Already addressed in Phase 2 Bug 5.

### ContentPiecesCreated always 0

**File:** `src/pages/Campaigns.tsx` line 512

```ts
contentPiecesCreated: 0, // Hardcoded to 0
```

**Fix:** Count content items linked to campaigns:

```ts
contentPiecesCreated: campaigns.reduce((sum, c) => {
  // Count content items with this campaign_id
  return sum + (c.content_count || c.contentBriefs?.length || 0);
}, 0),
```

Or query the actual count from `content_items` where `campaign_id` is not null.

---

## SUMMARY

| Phase | Items | Time | Priority |
|-------|:-----:|:----:|----------|
| 1 | Bug 1 (JSON), Bug 2 (stats mismatch), Bug 3 (/content-calendar 404) | 30 min | Critical |
| 2 | Bug 4 (blank chat), Bug 5 (sidebar), Rec 6 (clickable stats) | 20 min | Medium |
| 3 | Rec 3 (load times), Rec 7 (global search), Rec 8 (beta badge) | 15 min | Low |
| 4 | ContentPiecesCreated fix | 10 min | Low |

**Total: ~1.25 hours**

---

## WHAT COWORK GOT RIGHT (already fixed by us)

| Their Finding | Our Status |
|--------------|-----------|
| "Stats cards not clickable" | Not yet fixed — in this plan (Rec 6) |
| "Coming soon features need badges" | Honesty banner exists on social page, video providers marked (Beta) |
| "Setup banner for Resend clear" | Already done (SB-7) |
| "Tags vs Segments explanation clear" | Already done (our contacts subtitle change) |
| "Calendar clean but empty" | Calendar works, "Content Schedule" label updated |
| "Offerings page well-designed" | Agreed — our progress bar + step labels made it better |
| "Global search needed" | GlobalSearchResults exists but may be hidden on non-chat pages |

## WHAT COWORK FOUND THAT WE MISSED

| Their Finding | We Missed It? |
|--------------|:------------:|
| Raw JSON in proposals | **YES** — we didn't test the actual data rendering |
| Campaign stats mismatch | **YES** — we didn't compare hero vs list data sources |
| /content-calendar 404 | **PARTIAL** — we found other 404s but missed this specific one |
| Chat blank on navigation | **YES** — we tested functionality but not mount performance |
| Sidebar click area too narrow | **YES** — we tested buttons work but not click UX |
