

# Master Fix List — Implementation Plan

## Status Assessment

Reviewing all 25 items against the current codebase:

**Already Done (skip):**
- #4-8: `glass-card` CSS class already has the correct recipe (`rgba(255,255,255,0.06)`, `blur(12px)`, `16px` radius, shadow)
- #9-11: Apple Typography Scale exists (`text-hero`, `text-headline`, `text-body`, etc.)
- #12: `PageContainer` with `fadeUp` (0.3s ease) exists
- #13: `glass-card-hover` with `translateY(-1px)` + shadow increase exists
- #15: Dialog already has `zoom-in-95` / `zoom-out-95` spring animation
- #16: Sidebar border exists (recently strengthened to `border-border/15`)
- #18: Radial ambient glow applied to `EngagePageHero`
- #21: Reject action exists in approval system (buttons, batch operations, status tracking all present)

**Backend-Only / Out of Scope:**
- #2: Email ESP integration (SendGrid/Resend) — requires backend service setup, not a UI fix
- #3: Social OAuth integration — requires OAuth app registration, not a UI fix

**Remaining Items to Implement (13 items):**

---

## Round 1: Critical Bug + Global CSS Utilities

### #1 — Chat input latency (multiple clicks to send)
- Investigate the `ContextAwareMessageInput` submit handler — likely a focus/state issue where `isLoading` or debounce blocks rapid sends
- Ensure the form `onSubmit` properly prevents default and doesn't re-render unnecessarily
- Fix any event propagation issues with the nested button/form structure

### #14 — Button press `scale(0.97)` active state
- Add global CSS utility `.btn-press` with `active:scale-[0.97]` transition
- Apply to all `Button` components via the base button variant in `button.tsx`

### #17 — Tab sliding underline
- Add a reusable `layoutId`-based animated indicator (already done for Analytics tabs) — extend to remaining tab components like `TabSelector` in drafts

---

## Round 2: Page-Level Consistency

### #4-8 — Card system normalization (pages not yet using `glass-card`)
- **Keywords page**: `KeywordCard` uses plain `Card` — add `glass-card` class
- **Calendar**: Check and normalize card backgrounds
- **Campaigns**: Wrap flat content sections in `glass-card` where missing
- Audit all pages to ensure cards use the unified `glass-card` class

### #12 — Pages missing `PageContainer` wrapper
- Wrap these pages in `PageContainer` for consistent `fadeUp` entrance:
  - `Analytics.tsx`
  - `ContentApproval.tsx`
  - `KeywordsPage.tsx`
  - `Repository.tsx`
  - `Engage.tsx` sub-pages (Email, Social, Contacts, etc.)

---

## Round 3: Empty States

### #19 — Empty states for Email / Social / Contacts / Calendar
- Create empty states using the existing `UnifiedEmptyState` component for:
  - **Email**: "No emails yet" with Mail icon + "Compose" CTA
  - **Social**: "No posts yet" with Share icon + "Create Post" CTA
  - **Contacts**: "No contacts yet" with Users icon + "Import" CTA
  - **Calendar**: "No events scheduled" with Calendar icon + "Create" CTA
- Wire each to the appropriate action handler

---

## Round 4: Feature Enhancements

### #20 — Repository card hover feedback
- Add `glass-card-hover` class to `EnhancedContentCard` if not already present
- Ensure hover state shows `translateY(-1px)` + shadow increase

### #22 — Offerings internal detail view
- Create an in-app detail page/modal for offerings instead of external links
- Add a route `/offerings/:id` or a slide-over panel showing full offering details

### #23 — Keyword sparklines & difficulty indicators
- Add sparkline mini-charts to `KeywordCard` showing usage trends over time
- Add difficulty badge (easy/medium/hard) based on competition data
- Use recharts `<Sparklines>` or simple SVG path for compact visualization

### #24 — Toast notifications for all actions
- Audit Save/Delete/Approve actions across all pages
- Add `toast.success()` / `toast.error()` calls where missing
- Focus on: Settings save, Content delete, Approval actions, Keyword operations

### #25 — Password change in Settings
- Add a "Security" tab to Settings with password change form
- Fields: current password, new password, confirm password
- Use Supabase `updateUser({ password })` API

---

## Implementation Order

| Round | Items | Scope |
|-------|-------|-------|
| 1 | #1, #14, #17 | Critical bug + global CSS |
| 2 | #4-8, #12 | Page consistency (cards + PageContainer) |
| 3 | #19 | Empty states |
| 4 | #20, #22, #23, #24, #25 | Feature enhancements |

Total: 13 actionable items across 4 rounds. Items #2 and #3 (ESP/OAuth) require external service setup and are deferred.

