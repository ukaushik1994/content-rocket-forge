

# Fix: Remove Duplicate Sidebar from EnhancedChatInterface

## Root Cause
`EnhancedChatInterface.tsx` renders its **own** `ChatHistorySidebar` (line 382) with `AnimatePresence` that fully hides it when closed, plus a **floating hamburger button** (lines 403-419) using local `showSidebar` state. This completely overrides the persistent collapsed sidebar from `AppLayout.tsx`.

The user sees the hamburger from `EnhancedChatInterface`, not the collapsed icon strip from `AppLayout`.

## Fix

**File: `src/components/ai-chat/EnhancedChatInterface.tsx`**

1. **Remove** the duplicate `ChatHistorySidebar` block (lines 380-389)
2. **Remove** the floating sidebar toggle button (lines 403-419)
3. **Remove** the `showSidebar` local state (line 112)
4. **Connect** the hamburger (if still needed anywhere) to `useSidebarContext().toggleSidebar` instead of local state
5. Remove unused imports (`ChatHistorySidebar`, `Menu`, etc.)

This lets `AppLayout`'s sidebar take over — which already handles the collapsed icon strip correctly.

## Result
- Collapsed state: persistent icon strip from `AppLayout` is visible
- Expanded state: full sidebar from `AppLayout` slides in
- No more floating hamburger competing with the sidebar toggle

## Files Changed
| File | Change |
|------|--------|
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Remove duplicate sidebar, floating toggle, and `showSidebar` state |

