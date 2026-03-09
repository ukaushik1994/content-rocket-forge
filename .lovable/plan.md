

# Make Library, Tools, Engage Items Visible with Icons

## Problem
The Library, Tools, and Engage sections are set to `defaultOpen={false}`, so they appear collapsed and the user never sees the icon+text items. The reference image shows these items displayed openly in a flat list with clear icons — like "Projects" with a folder icon, "Artifacts" with a grid icon, "Code" with a `</>` icon.

## Changes — `src/components/ai-chat/ChatHistorySidebar.tsx`

### 1. Make sections open by default
Change `defaultOpen={false}` to `defaultOpen={true}` for Library, Tools, and Engage sections (lines 389, 396, 403).

### 2. Add section header icons
Update `CollapsibleSection` component to accept an optional `icon` prop, and display it next to the label — matching the reference style where section groups have a visual identifier.

### 3. Refine item icon styling
Make the icons slightly more prominent (remove the `/60` opacity reduction on the icon span in `SidebarNavItem`) so they match the reference image's clear, visible icon style.

### 4. Update specific icons to better match reference
- Repository → `FolderOpen` (folder icon like "Projects" in reference)
- Offerings → `Package` (product/package icon)  
- Content Wizard → `Wand2` (creative tool)
- Keywords → `Key` (more distinct than reusing Search)

### Files Changed
| File | Change |
|------|--------|
| `src/components/ai-chat/ChatHistorySidebar.tsx` | Open sections by default, add section icons, refine icon visibility, update specific icons |

