
# Email Builder -- Sidebar Fix & Feature Continuation

## Current State (Tested End-to-End)

### Working
- Starter template picker (5 templates + start from scratch)
- Block palette with 10 block types across 3 categories
- Block selection, floating toolbar (lock, hide, move, duplicate, save, delete)
- Inspector with full controls (text, colors, alignment, spacing, borders, gradients)
- AI Rewrite on text blocks
- Preview mode with Desktop/Mobile device frames
- Code view with copy button
- Undo/Redo, zoom controls
- Canvas dot-grid background
- Drag-and-drop reordering

### Issues Found

1. **Layers panel barely visible** -- Only the "LAYERS 6" header and first row ("1 Header") peek above the bottom edge. The rest of the 6 layers are completely hidden. The sidebar palette takes up all vertical space and doesn't leave enough room.

2. **Sidebar has no collapsible sections** -- Users can't collapse palette categories to make room for layers. The palette and layers compete for the same vertical space.

3. **Variable placeholders not replaced in Preview** -- The preview shows `{{company_name}}` literally in the header instead of replacing it with the preview variable. The text body correctly shows "Hi John," but the header doesn't resolve.

## Fixes

### 1. Make Sidebar Properly Split (`EmailBuilderDialog.tsx`)
- Use a **resizable split** approach: palette gets `flex-1 min-h-0 overflow-y-auto` and layers gets a guaranteed minimum height
- Add a **collapsible toggle** for the palette section so users can collapse it and see just layers
- When blocks exist, layers section gets at minimum ~200px of guaranteed space

### 2. Add Collapsible Categories to Palette (`BlockPalette.tsx`)
- Make each category header clickable to collapse/expand its grid
- This lets users collapse "Content" or "Layout" to save space
- Add a small chevron indicator on each category header
- Default all expanded, remembers state during session

### 3. Compact Palette Cards Further
- Reduce card padding from `p-3` to `p-2.5`
- Reduce icon from `h-8 w-8` to `h-7 w-7`
- Reduce font from `text-[11px]` to `text-[10px]`
- This saves another ~80px of vertical space

### 4. Fix Variable Resolution in Preview Header
- The `EmailBuilderPreview` component likely replaces variables in text blocks but may miss the header block's `text` prop
- Ensure all block types get variable substitution in preview mode

---

## Technical Summary

| File | Changes |
|------|---------|
| `EmailBuilderDialog.tsx` | Guaranteed min-height for layers section, collapse toggle for palette |
| `BlockPalette.tsx` | Collapsible category sections with chevrons, slightly more compact cards |
| `BlockLayersPanel.tsx` | Minor: remove max-height cap since parent now controls sizing |
| `EmailBuilderPreview.tsx` | Fix variable replacement to cover header block text |

Total: 4 files modified, 0 new files.
