

# Fix: Persistent Sidebar Across All Pages

## Problem
The `ChatHistorySidebar` only exists inside `EnhancedChatInterface`, which only renders on `/ai-chat`. When navigating to standalone pages (`/campaigns`, `/engage/automations`, `/engage/journeys`, `/research/calendar`), the sidebar disappears entirely. This breaks the ChatGPT-like experience where the sidebar persists across all views.

## Solution
Create a shared **AppLayout** wrapper that renders the sidebar alongside any page content. All protected routes use this layout, so the sidebar is always visible — collapsed or expanded.

## Implementation

### 1. Create `AppLayout.tsx` — shared layout with persistent sidebar

**`src/components/layout/AppLayout.tsx`** (NEW)

- Renders `Navbar` at top
- Renders `ChatHistorySidebar` on the left (always present)
- Renders `{children}` (the page content) in the main area with responsive left margin (`sm:ml-72 lg:ml-80`) to account for sidebar width
- Manages sidebar open/collapsed state
- Passes `onOpenPanel` to sidebar — when a panel item is clicked, navigates to `/ai-chat` and triggers the panel there (or uses a shared context)
- The sidebar toggle button remains visible even when collapsed

### 2. Extract sidebar state into a shared context

**`src/contexts/SidebarContext.tsx`** (NEW)

- Stores: `isSidebarOpen`, `toggleSidebar`, `activePanel`
- When a sidebar panel item is clicked from a standalone page, it navigates to `/ai-chat` and sets `activePanel` so the panel opens automatically
- Wraps the app at the provider level in `App.tsx`

### 3. Update `App.tsx` — wrap protected routes with AppLayout

Replace individual `<ProtectedRoute><Page /></ProtectedRoute>` patterns with:

```
<ProtectedRoute>
  <AppLayout>
    <Page />
  </AppLayout>
</ProtectedRoute>
```

For the `/ai-chat` route specifically, `AppLayout` detects it's the chat page and renders `EnhancedChatInterface` as the main content (no Navbar duplication).

### 4. Update `AIChat.tsx` — remove duplicate Navbar and sidebar

Since `AppLayout` now provides the Navbar and sidebar, `AIChat.tsx` should only render `EnhancedChatInterface` without its own Navbar. The `EnhancedChatInterface` already manages the sidebar internally, so for `/ai-chat` we let it handle its own layout and skip the AppLayout sidebar to avoid duplication.

**Simpler approach**: Keep `/ai-chat` using its current full layout (it already has sidebar + navbar). Wrap only the *other* protected routes with `AppLayout` so they gain the sidebar.

### 5. Update standalone pages — remove their own Navbar

Pages like `Campaigns.tsx`, `Repository.tsx`, `Solutions.tsx`, `Analytics.tsx`, `Engage.tsx`, `KeywordsPage.tsx`, and `CalendarPage.tsx` each render their own `<Navbar />`. Remove those since `AppLayout` provides it.

### 6. Sidebar behavior on standalone pages

When clicking a panel item (Repository, Campaigns, etc.) while already on a standalone page:
- Navigate to `/ai-chat` 
- Set `activePanel` in context so the panel opens automatically
- This maintains the chat-first architecture

When clicking Automations/Journeys (standalone pages):
- Navigate directly to `/engage/automations` or `/engage/journeys`
- Sidebar stays visible on those pages

## Files Changed

| File | Change |
|------|--------|
| `src/components/layout/AppLayout.tsx` | NEW — shared layout with persistent sidebar |
| `src/contexts/SidebarContext.tsx` | NEW — shared sidebar state context |
| `src/App.tsx` | Wrap non-chat protected routes with `<AppLayout>`, add `SidebarProvider` |
| `src/pages/AIChat.tsx` | No change (keeps its own layout) |
| `src/pages/Campaigns.tsx` | Remove `<Navbar />` |
| `src/pages/Repository.tsx` | Remove `<Navbar />` |
| `src/pages/Solutions.tsx` | Remove `<Navbar />` |
| `src/pages/Analytics.tsx` | Remove `<Navbar />` |
| `src/pages/Engage.tsx` | Remove `<Navbar />` |
| `src/pages/keywords/KeywordsPage.tsx` | Remove `<Navbar />` |
| `src/pages/research/Calendar.tsx` | Remove `<Navbar />` |
| `src/pages/research/ContentStrategy.tsx` | Remove `<Navbar />` if present |
| `src/pages/ContentApproval.tsx` | Remove `<Navbar />` if present |

## Architecture

```text
┌──────────────────────────────────────────────────┐
│                    Navbar                         │
├────────────┬─────────────────────────────────────┤
│            │                                     │
│  Sidebar   │         Page Content                │
│  (always   │    (/campaigns, /analytics,         │
│   visible) │     /engage/automations, etc.)      │
│            │                                     │
│  - Library │    OR                               │
│  - Tools   │                                     │
│  - Engage  │    EnhancedChatInterface            │
│  - Chats   │    (when on /ai-chat)               │
│            │                                     │
└────────────┴─────────────────────────────────────┘
```

## Key Decisions
- `/ai-chat` keeps its own layout to avoid breaking existing sidebar+panel integration
- All other protected routes get wrapped in `AppLayout` for sidebar persistence
- Panel clicks from standalone pages navigate back to `/ai-chat` with panel context
- Automations & Journeys navigate directly (full-page views with sidebar visible)

