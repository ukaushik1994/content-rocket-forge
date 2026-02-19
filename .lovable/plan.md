

# ChatGPT-Style Sidebar for AI Chat

## What We're Building

Replacing the current top navbar + floating sidebar toggle on the AI Chat page with a permanent left sidebar inspired by the ChatGPT layout. The navbar will be completely removed from the AI Chat page.

## Sidebar Structure (Top to Bottom)

```text
+----------------------------------+
| [Logo]              [Collapse]   |
+----------------------------------+
| [+] New Chat                     |
| [Q] Search chats                 |
+----------------------------------+
| Library (section label)          |
|   Repository  (navigate /repo)   |
+----------------------------------+
| Apps (section label)             |
|   > Content (collapsible)        |
|       Builder                    |
|       Approval                   |
|       Keywords                   |
|       Strategy                   |
|   > Marketing (collapsible)      |
|       Campaigns                  |
|       Email                      |
|       Social                     |
|       Automations                |
|       Journeys                   |
|   > Audience (collapsible)       |
|       Contacts                   |
|       Segments                   |
|       Activity                   |
|   Analytics                      |
+----------------------------------+
| Chats (section label)            |
|   conversation 1                 |
|   conversation 2                 |
|   conversation 3                 |
|   ...                            |
|   [Load More]                    |
+----------------------------------+
| [User avatar] Name               |
|   Settings / Sign Out            |
+----------------------------------+
```

## Key Behaviors

- Sidebar is always visible on desktop (collapsible to icon-only mini state)
- On mobile, sidebar is a sheet overlay (swipe to close)
- "Library" section has one item: Repository, which navigates to /repository
- "Apps" section has collapsible groups mirroring current navbar dropdowns
- "Chats" section replaces the old ChatHistorySidebar with the same conversation list
- User profile + settings + sign out moves to sidebar footer
- The Navbar component is NOT rendered on the /ai-chat page

## Technical Details

### New Files

| File | Purpose |
|------|---------|
| `src/components/ai-chat/AIChatSidebar.tsx` | The new unified sidebar component combining navigation, library, apps, chats, and user profile |

### Modified Files

| File | Change |
|------|--------|
| `src/pages/AIChat.tsx` | Remove `<Navbar />`, wrap content in `SidebarProvider`, render `AIChatSidebar` alongside `EnhancedChatInterface` |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Remove the floating Menu toggle button (lines 310-326), remove `ChatHistorySidebar` rendering (lines 293-296), remove `showSidebar` state. The sidebar is now managed by the parent. Pass conversation props up. |

### AIChatSidebar.tsx Structure

Uses the existing shadcn `Sidebar`, `SidebarProvider`, `SidebarContent`, `SidebarGroup`, `SidebarGroupLabel`, `SidebarMenu`, `SidebarMenuItem`, `SidebarMenuButton`, `SidebarMenuSub`, `SidebarMenuSubItem`, `SidebarMenuSubButton`, `SidebarFooter`, `SidebarHeader`, and `SidebarTrigger` components.

Sections:
1. **Header**: CreAiterLogo + SidebarTrigger (collapse)
2. **Actions**: New Chat button + Search chats input
3. **Library group**: Single item "Repository" linking to /repository
4. **Apps group**: Collapsible sub-menus for Content (5 items), Marketing (5 items), Audience (3 items), and a direct Analytics link -- all using the same routes from NavItems.tsx
5. **Chats group**: ScrollArea with conversation list (reusing the existing conversation data and handlers from useEnhancedAIChatDB), pin/archive/delete actions
6. **Footer**: User avatar, name, dropdown with Settings and Sign Out

### AIChat.tsx Layout Change

```text
Before:
  <Navbar />
  <main>
    <EnhancedChatInterface /> (contains its own sidebar toggle)
  </main>

After:
  <SidebarProvider>
    <AIChatSidebar ... />
    <main>
      <SidebarTrigger /> (top-left hamburger, always visible)
      <EnhancedChatInterface /> (no sidebar logic)
    </main>
  </SidebarProvider>
```

### What Gets Removed

- Floating sidebar toggle button from EnhancedChatInterface (lines 310-326)
- ChatHistorySidebar rendering from EnhancedChatInterface (lines 293-296)
- `showSidebar` state from EnhancedChatInterface
- `<Navbar />` from AIChat.tsx
- The old `ChatSidebar.tsx` component (already unused, superseded by ChatHistorySidebar)

### Props Flow

AIChat.tsx will call `useEnhancedAIChatDB()` and pass conversation data down to both `AIChatSidebar` and `EnhancedChatInterface`. This avoids duplicate hook calls and keeps state in sync.

### No Database or Edge Function Changes

This is a purely frontend layout change.

