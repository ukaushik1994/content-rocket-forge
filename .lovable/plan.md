
Fix the issue at the layout level, not the data level.

## What’s actually wrong
The provider logo is not showing next to the notification icon because the two controls are rendered in different places:

- `ActiveProviderIndicator` exists only in `src/components/layout/Navbar.tsx`
- authenticated pages use `AppLayout`, and `AppLayout` does not render `Navbar`
- `NotificationBell` is rendered separately as a fixed element in `src/components/layout/AppLayout.tsx`

So even if the provider state is correct, the logo can never appear “to the left of the notification icon” in the current structure.

## Implementation plan

### 1. Move the top-right controls into one shared container
Update `src/components/layout/AppLayout.tsx` so the fixed top-right area contains:
- `ActiveProviderIndicator`
- `NotificationBell`

This makes the provider logo appear exactly where you want it: immediately left of the bell.

### 2. Refactor `NotificationBell` to support inline rendering
Update `src/components/notifications/NotificationBell.tsx` so it no longer owns the outer fixed-position wrapper.
- keep the bell button and panel behavior
- remove `fixed top-4 right-4`
- let the parent layout control positioning

This avoids duplicate positioning logic and lets both controls sit side by side cleanly.

### 3. Match sizing and spacing
Use the same icon-button shell for both controls:
- same button size
- same border treatment
- small horizontal gap
- provider logo directly left of the notification bell

This will align with the screenshot request.

### 4. Keep settings-driven state intact
No change to the source of truth:
- `DefaultAiProviderSelector` remains the place where active provider is chosen
- `ActiveProviderIndicator` continues reading the active provider from `ai_service_providers` plus `api_keys_metadata`
- the existing `provider-changed` event remains the immediate sync path

## Files to update
- `src/components/layout/AppLayout.tsx`
- `src/components/notifications/NotificationBell.tsx`

## Expected result
On `/ai-chat` and other authenticated pages, the top-right fixed controls will be:

```text
[Provider Logo] [Notification Bell]
```

with the provider logo visible immediately to the left of the bell, reflecting whatever is active in Settings.

## Technical note
I also verified that your current “missing logo” problem is not primarily because `ActiveProviderIndicator` is absent or unsynced — it is because `Navbar.tsx` is effectively unused by the routes wrapped in `AppLayout`. The fix should therefore be done in `AppLayout`, where the bell currently lives.
