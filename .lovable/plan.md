

# Floating Notification Bell — Top Right

## Current State
The `NotificationBell` is rendered in two places: inside `ChatHistorySidebar` header and inside `Navbar`. Neither is floating — they're inline within their parent layouts.

## Plan

### 1. Make NotificationBell fixed/floating (`NotificationBell.tsx`)
- Change the wrapper `div` from `relative p-1` to `fixed top-4 right-4 z-50`
- Add a subtle background blur and shadow for the floating button: `bg-background/80 backdrop-blur-md rounded-full shadow-lg`

### 2. Remove from ChatHistorySidebar (`ChatHistorySidebar.tsx`)
- Remove the `<NotificationBell />` from the sidebar header area (around line 375) to avoid duplication

### 3. Remove from Navbar (`Navbar.tsx`)
- Remove `<NotificationBell />` (line 61) since it will now float independently

### 4. Mount independently in AppLayout or App root
- Add `<NotificationBell />` directly in `AppLayout.tsx` so it floats globally above all content, independent of sidebar or navbar state

### Files Changed
| File | Change |
|------|--------|
| `src/components/notifications/NotificationBell.tsx` | Make wrapper `fixed top-4 right-4 z-50` with blur/shadow |
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Remove `NotificationBell` from sidebar header |
| `src/components/layout/Navbar.tsx` | Remove `NotificationBell` from navbar |
| `src/components/layout/AppLayout.tsx` | Add `<NotificationBell />` as a floating global element |

