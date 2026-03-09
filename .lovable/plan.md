

# Remove Navbar, Merge Controls into Sidebar

## Problem
The current layout has both a Navbar and a Sidebar, but the reference (ChatGPT) has no navbar at all -- everything lives in the sidebar. The user wants to eliminate the navbar and move its elements (logo, calendar, profile) into the sidebar, plus make Library/Tools/Engage collapsible.

## Changes

### 1. Remove Navbar from AppLayout
- Delete `<Navbar />` from `AppLayout.tsx`
- Remove `pt-16` padding (no navbar height to offset)
- Update sidebar `top-16` to `top-0` (sidebar now spans full height)

### 2. Restructure ChatHistorySidebar layout

**Top of sidebar (when expanded):**
- CreAiter logo (replaces the ChatGPT icon in reference) + "New Chat" button on same row
- Notification bell inline at top

**Navigation sections — make collapsible:**
- Wrap Library, Tools, Engage in Radix `Collapsible` components
- Section headers become clickable toggles with a chevron indicator
- Default: all expanded

**Bottom of sidebar:**
- Calendar shortcut icon + label
- User profile row (avatar + name, click for dropdown with Settings/Sign Out)
- Replace current "Settings" bottom item

### 3. Collapsed sidebar state (icon-only strip)
When sidebar is collapsed, show a narrow strip (~48px) with:
- Logo icon at top
- New chat (+) icon
- Section icons vertically
- Calendar + Profile at bottom

This matches the reference image showing just icons in a vertical column.

### 4. Update AppLayout
- Remove Navbar import and rendering
- Sidebar starts at `top-0` and spans full viewport height
- When collapsed, show the narrow icon strip instead of hiding completely

### 5. Update EnhancedChatInterface
- Remove its own `<Navbar />` if present
- Adjust top offset from `top-16` to `top-0` for its internal sidebar

### 6. File cleanup
- Remove Navbar imports from any remaining pages
- `Navbar.tsx` can be kept but is no longer rendered anywhere

## Files Changed

| File | Change |
|------|--------|
| `src/components/layout/AppLayout.tsx` | Remove Navbar, adjust offsets, handle collapsed icon strip |
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Add logo + notifications at top, collapsible sections, profile/calendar at bottom, support collapsed icon-only mode |
| `src/contexts/SidebarContext.tsx` | No change needed (already has open/toggle) |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Remove Navbar reference, adjust top offset |
| Pages with residual Navbar references | Clean up if any remain |

