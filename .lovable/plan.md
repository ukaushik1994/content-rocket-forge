

# Sidebar Footer Redesign -- Matching ChatGPT Layout

## What Changes

Replace the single dropdown footer in `AIChatSidebar.tsx` (lines 360-387) with three stacked, always-visible items: Notifications, Settings, and Profile row.

## New Footer Layout

```text
+----------------------------------+
|  [Bell icon]  Notifications      |
|  [Gear icon]  Settings           |
|  [User avatar] Sharath           |
|               user@email.com     |
|               [Sign Out]         |
+----------------------------------+
```

When collapsed (icon-only): Bell, Gear, Avatar icons only.

## Changes

### File: `src/components/ai-chat/AIChatSidebar.tsx`

1. **Add `Bell` import** to the lucide-react import (line 7 area)

2. **Replace footer section (lines 360-387)** with:
   - `SidebarSeparator` or `border-t` divider
   - **Notifications button**: `SidebarMenuButton` with `Bell` icon, calls `openSettings('notifications')`. Shows label when expanded, icon-only when collapsed.
   - **Settings button**: `SidebarMenuButton` with `Settings` icon, calls `openSettings('api')`. Shows label when expanded, icon-only when collapsed.
   - **Profile row**: Avatar + name + email. Small dropdown on click with just "Sign Out". When collapsed, shows only avatar.

### No other files change. No database or edge function modifications.

### Approximate scope: ~40 lines replaced in 1 file.

