

# Collapsed Sidebar — Icon-Only Strip (Claude/ChatGPT Style)

## Problem
Currently when the sidebar is "collapsed", it completely disappears. The reference images (Claude) show two distinct states:
1. **Expanded**: Full sidebar with logo, labels, chat history, profile
2. **Collapsed**: A narrow ~48px icon-only vertical strip that persists on screen (never fully hidden)

## Current Behavior
- `AppLayout.tsx` wraps sidebar in `AnimatePresence` and only renders it when `isSidebarOpen === true`
- When closed, a floating hamburger button appears — but the sidebar is gone entirely

## Plan

### 1. Always render the sidebar — switch between expanded and collapsed views

In `AppLayout.tsx`:
- Remove the `AnimatePresence` conditional. The sidebar is **always rendered**.
- Pass `isCollapsed={!isSidebarOpen}` to `ChatHistorySidebar`.
- Adjust main content margin: when collapsed, use `sm:ml-14` (56px icon strip); when expanded, use `sm:ml-72 lg:ml-80`.
- Remove the floating toggle button — the toggle will live inside the sidebar itself.

### 2. Rebuild `ChatHistorySidebar` with collapsed icon-only mode

When `isCollapsed` is true, render a narrow strip (~48-56px wide) showing only icons vertically, matching the Claude reference:

**Collapsed layout (top to bottom):**
- Sidebar toggle icon (top — to expand)
- `+` (New Chat)
- Search icon
- Divider
- Section icons: Repository (FileText), Offerings (Puzzle), Approvals (CheckCircle), Content Wizard (PenLine), Campaigns (Megaphone), Keywords (Search), Analytics (BarChart3), Email (Mail), Social (Share2), Contacts (Users), Automations (Zap), Journeys (GitBranch)
- Spacer
- Download/export icon (bottom area)
- User avatar circle (very bottom)

Each icon gets a `Tooltip` on hover showing the label.

**Expanded layout** stays as-is (current implementation), but add the toggle button in the header row.

### 3. Files Changed

| File | Change |
|------|--------|
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Add `isCollapsed` prop; render icon-only strip when collapsed, full sidebar when expanded; add toggle button in both states |
| `src/components/layout/AppLayout.tsx` | Always render sidebar (no AnimatePresence conditional); pass `isCollapsed`; remove floating toggle button; adjust margins for collapsed state (`sm:ml-14`) |
| `src/contexts/SidebarContext.tsx` | No changes needed |

### 4. Key Details
- Collapsed width: `w-14` (56px) matching Claude's narrow strip
- Icons wrapped in `TooltipProvider` / `Tooltip` for hover labels
- Toggle button: sidebar-panel icon (matching Claude's top-left icon) in both states
- Smooth width transition via CSS `transition-all duration-300`
- Mobile: collapsed state not used — mobile keeps the overlay behavior (full sidebar or hidden with backdrop)

