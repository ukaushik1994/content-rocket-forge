

# Fix: Active Provider Indicator Not Showing in Navbar

## Root Cause Analysis

Two issues prevent the indicator from appearing:

1. **Missing `user_id` filter**: `ActiveProviderIndicator` queries `ai_service_providers` and `api_keys_metadata` without filtering by `user_id` (lines 37-41, 53-58). It relies entirely on RLS. If RLS isn't configured for these tables/views, `maybeSingle()` could return errors (multiple rows from all users) or no data.

2. **No cross-component sync**: When the user changes the active provider in `DefaultAiProviderSelector`, the `ActiveProviderIndicator` relies on Realtime subscriptions on `ai_service_providers` and `api_keys` tables. Realtime on views (`api_keys_metadata`) doesn't work, and the subscription may miss updates. There's no shared state or event dispatch between the two components.

3. **NotificationBell placement**: It's rendered as `fixed top-4 right-4` in `AppLayout.tsx`, floating independently from the navbar. The provider indicator should sit next to it visually.

## Fix Plan

### 1. `ActiveProviderIndicator.tsx` — Add explicit user filtering + event sync

- Add `user_id` filter to both queries (`.eq('user_id', user.id)`)
- Store `user` in state/ref so queries always have it
- Listen for a custom DOM event (`provider-changed`) dispatched by the selector, triggering a re-fetch
- Add a brief console.log for debugging if no provider is found
- Keep the realtime subscriptions as backup

### 2. `DefaultAiProviderSelector.tsx` — Dispatch sync event

- After successfully switching provider (line 59), dispatch `document.dispatchEvent(new Event('provider-changed'))` so the navbar indicator updates immediately

### 3. `Navbar.tsx` — Position indicator next to NotificationBell

- The NotificationBell is `fixed top-4 right-4` (separate from navbar). Two options:
  - **Option A**: Move the `ActiveProviderIndicator` to render inside `NotificationBell`'s fixed container in `AppLayout.tsx`, sitting to its left
  - **Option B** (simpler): Keep it in the Navbar but ensure it renders inline. The indicator already renders there (line 48) — once the data bug is fixed, it will appear.

I'll go with Option B — the data fix is the real blocker.

## Files Changed

| File | Change |
|------|--------|
| `src/components/ai/ActiveProviderIndicator.tsx` | Add `user_id` filter to queries; listen for `provider-changed` event |
| `src/components/settings/api/DefaultAiProviderSelector.tsx` | Dispatch `provider-changed` event after switching |

