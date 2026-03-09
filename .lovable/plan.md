

# Phase 1 Remaining + Phase 2 Quick Wins — Implementation Plan

## Audit Status After Previous Session

Already done or already existed:
- 1.1/1.2 AI Chat blank screen + no visible message — **Fixed** (deleted duplicate hook)
- 1.3 Campaigns tab spinner — **Already has** empty state + loading fallback
- 1.4 Repository delete — **Already exists** in ContentDetailModal
- 1.5 Approvals reject/request changes — **Already implemented** in ModernContentApproval
- 1.7 HTML sanitize titles — **Fixed** (DOMPurify in ContentCardPreview)
- 1.8 Dashboard stats clickable — **Fixed** (navigate on click)
- 1.9 Notifications dedup — **Already has** `groupNotifications()` function
- 2.2 Collapsed sidebar tooltips — **Already has** `CollapsedIconButton` with `Tooltip`
- 2.7 Journey Builder node deletion — **Already has** Delete key + button in inspector

## What Still Needs Implementation (3 items)

### 1. Password Change — Replace "Coming Soon" with real Supabase Auth

**Files:** `ProfileSettingsTab.tsx`, `ProfileSettings.tsx`

Both files have identical pattern: `onClick={() => toast.info('Password change functionality will be implemented soon!')}`. Replace with:
- Validate new password ≥ 6 chars and matches confirm field
- Call `supabase.auth.updateUser({ password: newPass })`
- Show success/error toast, clear inputs on success
- Add `import { supabase } from '@/integrations/supabase/client'` to `ProfileSettingsTab.tsx` (ProfileSettings already has it)

### 2. Delete Button on Repository Cards

**File:** `SimplifiedRepositoryCard.tsx`

Add a delete button (Trash2 icon) next to the Edit button in the footer (line ~269). On click:
- Show `AlertDialog` confirmation ("Delete this content? This cannot be undone.")
- Call `deleteContentItem(content.id)` from `useContent()`
- Show success toast
- Need to accept `onDelete` prop or use `useContent` directly

### 3. Campaign Conversation Validation

**File:** `CampaignsHero.tsx`

In `handleSubmit` (line 76), the code already checks `campaignIdea.trim()` but doesn't validate solution selection. Add:
```tsx
if (!selectedSolutionId) {
  toast.error('Please select an offering before starting');
  return;
}
```

Same for `handleExpressSubmit` (line 85).

---

## Summary

| File | Change |
|------|--------|
| `ProfileSettingsTab.tsx` | Wire password change to `supabase.auth.updateUser` |
| `ProfileSettings.tsx` | Same password change wiring |
| `SimplifiedRepositoryCard.tsx` | Add Trash2 delete button + AlertDialog |
| `CampaignsHero.tsx` | Add solution validation before submit |

4 files. No new dependencies. No database changes needed.

