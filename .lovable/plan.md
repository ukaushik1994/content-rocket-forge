

# Email Builder -- Polish and Enhancement Pass

## Current State Assessment

The builder has solid foundations: 10 block types, drag-and-drop, DragOverlay, positional insertion, inline editing, Code/Build/Preview modes, global styles, starter templates, undo/redo, and round-trip persistence. However, there are several rough edges and missing "must-have" features that prevent it from feeling complete and professional.

---

## Part 1: Polish (Fixing What Exists)

### 1. Template Card Variables Leak Builder Metadata
The template cards in the list show `__builder_blocks__` and the raw JSON string as variable badges. The variables array filter needs to strip these internal entries before display.

**File:** `TemplatesList.tsx` -- filter out `__builder_blocks__` and the JSON blob from the displayed variable badges.

### 2. BlockRenderer Inline Edit Bug for Text Blocks
The text block uses `dangerouslySetInnerHTML` when NOT selected but sets no initial content when selected (both branches render `undefined`). When a user clicks to edit, the block goes blank. Need to set `editRef.current.innerHTML` on focus instead.

**File:** `BlockRenderer.tsx` -- fix the text block to populate innerHTML in the contentEditable div on selection, and properly sync back on blur.

### 3. Code Mode is View-Only (Misleading)
The Code tab says "Changes here are view-only and won't modify visual blocks" but still allows editing. Either make it truly editable (syncing HTML back to blocks is too complex) or make it read-only with a copy button.

**File:** `EmailBuilderDialog.tsx` -- make Code textarea read-only, add a "Copy HTML" button.

### 4. Preview Mode Should Use iframe
Using `dangerouslySetInnerHTML` for preview breaks when email CSS leaks into the app. The preview should render inside a sandboxed iframe for accurate representation.

**File:** `EmailBuilderPreview.tsx` -- render HTML in an iframe via `srcdoc` instead of `dangerouslySetInnerHTML`.

### 5. Canvas Width Should Sync with Global Styles
The canvas `maxWidth` is driven by the `previewWidth` state (600/320 toggle) but ignores the `globalStyles.contentWidth` setting. When the user sets content width to 700px in Global Styles, the canvas should reflect that.

**File:** `BuilderCanvas.tsx` and `EmailBuilderDialog.tsx` -- pass `globalStyles.contentWidth` as the desktop width baseline.

### 6. Empty State Deselect Click Propagation
Clicking the empty canvas area should deselect any selected block. Currently clicking between blocks doesn't deselect because `stopPropagation` prevents the outer handler.

**File:** `BuilderCanvas.tsx` -- ensure clicking empty space within the canvas deselects blocks.

---

## Part 2: Must-Have Enhancements

### 7. Block Locking (Prevent Accidental Edits)
Add a lock toggle to any block. Locked blocks cannot be moved, edited, or deleted -- useful for headers/footers that should stay fixed.

**Files:** `blockDefinitions.ts` (add `locked` field), `BlockRenderer.tsx` (show lock icon, disable toolbar actions), `BlockInspector.tsx` (add lock toggle).

### 8. Block Visibility Toggle (Hide Without Deleting)
Allow hiding a block temporarily without removing it. Useful for A/B testing sections or seasonal content.

**Files:** `blockDefinitions.ts` (add `hidden` field), `BlockRenderer.tsx` (show opacity overlay + eye icon), `htmlExporter.ts` (skip hidden blocks in export).

### 9. Confirmation Before Discarding Unsaved Changes
If the user has made edits and clicks X or changes mode, show a confirmation dialog to prevent accidental loss.

**File:** `EmailBuilderDialog.tsx` -- track dirty state, intercept close with an AlertDialog.

### 10. Block Search / Quick Add (Slash Command)
When the canvas is focused and user types `/`, show a floating command palette to quickly insert a block type without dragging. This is a major productivity UX pattern.

**Files:** New `QuickAddMenu.tsx` component, wire into `EmailBuilderDialog.tsx`.

### 11. Export Options (Download HTML, Copy to Clipboard)
Add a dropdown next to Save with: "Download .html", "Copy HTML to clipboard". Currently the only way to get HTML out is the Code tab.

**File:** `EmailBuilderDialog.tsx` -- add export dropdown next to Save button.

### 12. Responsive Preview with Device Frame
The preview mode shows plain HTML. Add a device frame (phone bezel, desktop browser chrome) around the preview for a more realistic feel.

**File:** `EmailBuilderPreview.tsx` -- wrap iframe in a styled device frame with rounded corners and mock browser/phone UI.

### 13. Block Count and Template Stats in Toolbar
Show a subtle block count badge in the toolbar (e.g., "8 blocks") so users have context about template complexity.

**File:** `EmailBuilderDialog.tsx` -- add block count indicator.

---

## Part 3: Enhancement Features

### 14. Color Picker Upgrade with Presets
Replace raw `<input type="color">` with a proper color picker that includes preset brand colors and recently used colors. This is a visual builder -- the color picker matters.

**Files:** New `ColorPickerField.tsx` component with swatches + hex input + custom color picker. Update `BlockInspector.tsx` and `GlobalStylesPanel.tsx` to use it.

### 15. Image Block Upload Placeholder
The image block requires a URL. Add a visual upload placeholder that shows a dashed border with "Click to add image URL" and a URL input that appears on click.

**File:** `BlockRenderer.tsx` -- improve image block rendering with a visual placeholder when URL is the default placeholder.

### 16. Button Block Hover Preview
Show a subtle hover state preview on the button block in the canvas so users can see what the button will feel like.

**File:** `BlockRenderer.tsx` -- add hover brightness filter on button blocks.

### 17. Keyboard Shortcuts Panel
Add a `?` keyboard shortcut that shows a floating panel listing all available shortcuts (Cmd+Z, Cmd+S, Delete, arrows, etc.).

**File:** `EmailBuilderDialog.tsx` -- add shortcut handler and floating help panel.

### 18. Block Duplicate Animation
When duplicating a block, add a brief flash/highlight animation on the new block so the user sees where it was inserted.

**File:** `BuilderCanvas.tsx` / `BlockRenderer.tsx` -- add a `justCreated` animation state.

---

## Technical Summary

| File | Changes |
|------|---------|
| `TemplatesList.tsx` | Filter builder metadata from variable badges |
| `BlockRenderer.tsx` | Fix inline edit bug, add lock/hide UI, image placeholder, button hover, duplicate animation |
| `EmailBuilderDialog.tsx` | Read-only Code mode + copy, unsaved changes guard, block count, export dropdown, keyboard help, quick-add wiring, sync canvas width |
| `EmailBuilderPreview.tsx` | iframe-based preview with device frames |
| `BuilderCanvas.tsx` | Deselect fix, sync canvas width with global styles, animation states |
| `BlockInspector.tsx` | Lock toggle, hide toggle, use ColorPickerField |
| `GlobalStylesPanel.tsx` | Use ColorPickerField |
| `blockDefinitions.ts` | Add `locked` and `hidden` fields |
| `htmlExporter.ts` | Skip hidden blocks |
| **New:** `ColorPickerField.tsx` | Color picker with presets + hex input |
| **New:** `QuickAddMenu.tsx` | Slash-command block insertion palette |

Total: 9 files modified, 2 new files created.

