

# Plan: Style collapsed section headers like nav items

Currently, the Library/Tools/Engage section headers show as small uppercase labels with chevrons. The user wants them to look like the "New chat" and "Search" items above — icon + text in a full-width row.

## Changes in `ChatHistorySidebar.tsx`

### 1. Update `CollapsibleSection` component
- Add required `icon` prop (already optional but unused)
- When **collapsed**, render the trigger styled like `SidebarNavItem`: full row with icon + label text at 13px, same padding/hover as nav items, with a small chevron on the right
- When **expanded**, show the same row but with chevron rotated down, followed by children

### 2. Pass icons to each CollapsibleSection usage
- Library: `<BookOpen />`
- Tools: `<Wrench />`
- Engage: `<MessageCircle />`
- Chats: `<CalendarDays />` (or keep current style for Chats)

The trigger row will use the same classes as `SidebarNavItem`: `px-3 py-2 rounded-lg text-[13px] font-medium`, with the chevron as a small indicator on the right side.

