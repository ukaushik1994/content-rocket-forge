

# Sidebar Footer Redesign -- Matching ChatGPT Layout

## What Changes

The current sidebar footer hides Settings and Sign Out inside a dropdown menu triggered by clicking the user avatar. The ChatGPT reference shows these as **separate, always-visible items** stacked at the bottom of the sidebar.

## New Footer Layout

```text
+----------------------------------+
| ... (rest of sidebar above) ...  |
+----------------------------------+
|  [Bell icon]  Notifications      |
|  [Gear icon]  Settings           |
|  [User avatar] Sharath           |
|               user@email.com     |
|               [Sign Out]         |
+----------------------------------+
```

### When collapsed (icon-only):
```text
+------+
| Bell |
| Gear |
| [AV] |
+------+
```

## Specific Changes

### File: `src/components/ai-chat/AIChatSidebar.tsx`

**Footer section (lines 360-387)** -- Replace the single dropdown button with three distinct items:

1. **Notifications** -- A `SidebarMenuButton` with Bell icon that navigates to `/notification-settings` (or opens the settings modal on the notifications tab). Shows label text when expanded, icon-only when collapsed.

2. **Settings** -- A `SidebarMenuButton` with Gear icon that calls `openSettings('api')`. Shows label text when expanded, icon-only when collapsed.

3. **Profile row** -- User avatar + name + email displayed as a row. Clicking opens a small dropdown with just "Sign Out". When collapsed, shows only the avatar icon.

### Visual Treatment

- Each footer item gets the same `SidebarMenuButton` styling as the rest of the sidebar for consistency
- A `SidebarSeparator` above the footer section to visually separate from Chats
- Items stack vertically with minimal spacing (gap-0.5)

### Lines of Change

| Area | Approx Lines |
|------|-------------|
| Footer rewrite | ~40 lines replaced |
| Total | ~40 lines |

No other files need changes. No database or edge function modifications.

