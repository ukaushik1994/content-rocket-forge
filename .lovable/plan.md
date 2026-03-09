

# Sidebar Style Cleanup — Match Reference Design

## What Changes

The reference images show a minimal, flat list style:
- **New Chat**: plain text item with a `+` icon, not a full-width outlined button
- **Search**: plain text item with a magnifying glass icon, not an input field (clicking it could activate search mode)
- **Library / Tools / Engage**: displayed as simple section labels (like current) but their child items use a clean icon + text row style — no button backgrounds, no badges, just clean rows

## Specific Changes in `ChatHistorySidebar.tsx`

### 1. New Chat — change from `<Button>` to a plain nav item
Replace the outlined button (lines 359-366) with a `SidebarNavItem`-style row:
- `+` icon + "New chat" text, same style as other nav items

### 2. Search — change from `<Input>` to a clickable nav item
Replace the search input (lines 367-375) with a clickable row:
- Magnifying glass icon + "Search" text
- Clicking it toggles a search input inline (or activates search mode)

### 3. Section items (Library, Tools, Engage) — keep collapsible but refine styling
- Keep `CollapsibleSection` structure but make the section label style match the reference (lighter, smaller)
- Items already use `SidebarNavItem` which is close to the reference — just ensure consistent spacing

### 4. SidebarNavItem refinement
- Slightly increase vertical padding to match the reference image spacing
- Keep icon + label layout as-is (already matches)

## File Changed
| File | Change |
|------|--------|
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Replace New Chat button and Search input with plain nav-item rows; refine item spacing |

