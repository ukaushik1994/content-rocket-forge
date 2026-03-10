

# Phase 3: Breadcrumbs + Remaining CTA Fixes

## Status Check — What's Already Done

| Item | Status |
|------|--------|
| Task 8 (Helmet titles) | All pages already have correct `[Page] \| Creaiter` format |
| Task 14 (Page transitions) | `PageContainer` already implements fade-in-up animation |
| Task 15 (Button press feedback) | Already added to base `Button` component |
| Task 6 (most CTAs) | Offerings, Approvals, Keywords, Analytics, Automations already have gradient fills. Social/Contacts/Journeys use `EngageButton` which defaults to gradient. |

## Remaining Work

### 1. Calendar "Add Content" Button → Gradient CTA
**File**: `src/components/research/content-strategy/calendar/EditorialCalendar.tsx` (line 431)
Currently: `className="bg-primary/20 hover:bg-primary/30"` — a ghost/transparent style.
Change to: `className="bg-gradient-to-r from-primary to-primary/80 hover:shadow-lg hover:shadow-primary/25 text-white"` — matching the gradient primary pattern.

### 2. Breadcrumbs on All Non-Engage Pages (Task 7)
**New file**: `src/components/shared/PageBreadcrumb.tsx`

A simple reusable component that accepts `section` and `page` props and renders a breadcrumb matching the `EngageBreadcrumb` style (small muted text, chevron separator).

Route-to-breadcrumb mapping:

| Route | Section | Page |
|-------|---------|------|
| `/ai-chat` | Chats | AI Chat |
| `/repository` | Library | Repository |
| `/offerings` | Library | Offerings |
| `/content-approval` | Library | Approvals |
| `/campaigns` | Tools | Campaigns |
| `/keywords` | Tools | Keywords |
| `/analytics` | Tools | Analytics |
| `/research/calendar` | Calendar | Editorial Calendar |

**Integration**: Add `<PageBreadcrumb>` to each of these 8 pages, placed at the top of the main content area (above the hero header), inside the existing `<main>` or page wrapper.

**Files to edit** (add breadcrumb import + render):
- `src/components/ai-chat/EnhancedChatInterface.tsx`
- `src/pages/Repository.tsx`
- `src/pages/Solutions.tsx`
- `src/pages/ContentApproval.tsx`
- `src/pages/Campaigns.tsx`
- `src/pages/keywords/KeywordsPage.tsx`
- `src/pages/Analytics.tsx`
- `src/pages/research/Calendar.tsx`

### 3. Card Hover Effects (Task 9)
Add consistent `hover:scale-[1.02] hover:shadow-lg transition-all duration-200` to card components that lack hover effects. Most cards already have this via `glass-card-hover` or framer-motion `whileHover`. Quick scan and add where missing.

---

**Total**: 1 new file, ~10 files edited with small changes each.

