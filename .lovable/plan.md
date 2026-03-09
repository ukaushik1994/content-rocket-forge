

# Library Items → Separate Pages (Keep Sidebar)

## Problem
Library sub-items (Repository, Offerings, Approvals) currently open as right-side panels via `handlePanel()`. They should navigate to their dedicated full-page routes instead, while the sidebar stays visible.

## Solution
Routes already exist: `/repository`, `/offerings`, `/content-approval` — all wrapped in `AppLayout` so the sidebar persists. Just need to change Library items from panel-opening to page navigation.

## Changes

### 1. `src/components/ai-chat/ChatHistorySidebar.tsx`
Change `libraryItems` actions from `handlePanel(...)` to `handleNavigation(...)`:
- Repository → `/repository`
- Offerings → `/offerings`
- Approvals → `/content-approval`

### 2. `src/components/layout/AppLayout.tsx`
Update `onOpenPanel` handler to route Library panel types to their pages instead of using `setPendingPanel`:
- `repository` → `/repository`
- `offerings` → `/offerings`
- `approvals` → `/content-approval`

| File | Change |
|------|--------|
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Library items use `handleNavigation` instead of `handlePanel` |
| `src/components/layout/AppLayout.tsx` | Route library panel types to page navigation |

