
# Email Builder -- Major Feature & Polish Upgrade

## Current State

The builder has a solid foundation: 10 block types, drag-and-drop with DragOverlay, sortable reordering, block palette, inspector panel, Build/Code/Preview modes, global styles, 5 starter templates, undo/redo, keyboard shortcuts, quick-add menu, color picker with presets, lock/hide, unsaved changes guard, and round-trip persistence. It's functional but lacks the depth and polish of a production-grade email builder.

## What's Missing (Organized by Priority)

---

### TIER 1: Core UX Gaps (Must Fix)

#### 1. No Rich Text Toolbar for Text Blocks
Text blocks currently require writing raw HTML in the inspector textarea or using contentEditable with no formatting controls. Need a floating mini-toolbar (Bold, Italic, Link, List) that appears when a text block is selected and being edited on the canvas.

**File:** New `InlineTextToolbar.tsx` -- floating toolbar using `document.execCommand` for B/I/U/Link/List
**File:** `BlockRenderer.tsx` -- show toolbar above text block when editing

#### 2. No Block Between-Insert Button
Users can only add blocks by dragging or appending. Add a "+" button that appears between blocks on hover, opening the quick-add menu at that position.

**File:** `BuilderCanvas.tsx` -- add hover-triggered "+" insert buttons between blocks

#### 3. Social Block Shows Plain Text Instead of Icons
The social links block renders platform names as plain text. Should render recognizable social media icons (using simple SVG circles with letters or unicode).

**File:** `BlockRenderer.tsx` -- upgrade social block rendering with styled icon circles
**File:** `htmlExporter.ts` -- export social links with styled inline icons

#### 4. No Padding/Margin Controls on Most Blocks
Only header and text have padding controls. Button, image, columns, social, and footer blocks need padding/spacing controls in the inspector.

**File:** `BlockInspector.tsx` -- add universal padding controls to all block types
**File:** `blockDefinitions.ts` -- add `paddingX`, `paddingY` defaults to blocks that lack them

---

### TIER 2: Professional Features

#### 5. Responsive Preview Isn't Actually Responsive
The mobile preview just shrinks the canvas width. The HTML export doesn't include any responsive `@media` queries, so emails look identical on mobile. Add basic responsive CSS in the HTML export wrapper.

**File:** `htmlExporter.ts` -- add `@media` query in `<style>` for max-width breakpoints (stack columns, scale images, adjust font sizes)

#### 6. Template Thumbnail Preview on Cards
Template cards in the list show no visual preview. Generate a tiny HTML preview thumbnail using an iframe for each template card.

**File:** `TemplatesList.tsx` -- add a small iframe-based thumbnail preview on each template card

#### 7. Block Layers Panel (Outline View)
No way to see the full structure at a glance. Add a collapsible layers panel at the bottom of the left sidebar showing all blocks as a compact ordered list with drag-to-reorder.

**File:** New `BlockLayersPanel.tsx` -- compact sortable list of blocks with type icons, lock/hide indicators
**File:** `EmailBuilderDialog.tsx` -- integrate layers panel below palette with a toggle

#### 8. AI Content Assistant Integration
The AI writer exists in the code editor but isn't wired into the visual builder. Add an AI button to the text block inspector that generates/rewrites content.

**File:** `BlockInspector.tsx` -- add "AI Rewrite" button for text blocks that calls the AI writer
**File:** `EmailBuilderDialog.tsx` -- wire AI dialog for visual builder context

#### 9. Drag-to-Resize Spacer
Spacer blocks require opening the inspector to change height. Should be directly resizable on the canvas by dragging the bottom edge.

**File:** `BlockRenderer.tsx` -- add a resize handle on spacer blocks with `onMouseDown` drag-to-resize behavior

---

### TIER 3: Enhancement & Delight

#### 10. Block Animations on Hover
Blocks should have a subtle lift/shadow effect on hover to communicate interactivity, not just a ring outline.

**File:** `BlockRenderer.tsx` -- add `hover:shadow-md hover:-translate-y-px` transition

#### 11. Zoom Controls for Canvas
Add zoom in/out (75%, 100%, 125%) for the canvas area so users can see more or less of their email.

**File:** `EmailBuilderDialog.tsx` -- add zoom state and CSS transform scale on the canvas wrapper
**File:** `BuilderCanvas.tsx` -- apply zoom transform

#### 12. Block Context Menu (Right-Click)
Right-clicking a block should show a context menu with: Duplicate, Delete, Move Up, Move Down, Lock, Hide -- matching the floating toolbar options.

**File:** `BlockRenderer.tsx` -- add `onContextMenu` handler with a custom context menu using Radix `ContextMenu`

#### 13. Gradient Background Support
Header and button blocks should support gradient backgrounds in addition to solid colors. Add a simple "Gradient" toggle in the inspector with start/end color + direction.

**File:** `BlockInspector.tsx` -- add gradient toggle for header/button blocks
**File:** `blockDefinitions.ts` -- add `gradientEnabled`, `gradientEndColor`, `gradientDirection` props
**File:** `BlockRenderer.tsx` and `htmlExporter.ts` -- render gradient backgrounds

#### 14. Border Controls
Add border width, color, and radius controls for image, button, and column blocks.

**File:** `BlockInspector.tsx` -- add border section (width, color, radius, style)
**File:** `blockDefinitions.ts` -- add border defaults
**File:** `BlockRenderer.tsx` and `htmlExporter.ts` -- render borders

#### 15. Save as Reusable Block
Allow users to save a configured block (e.g., a styled CTA button) as a "Saved Block" that appears in the palette for reuse across templates.

**File:** New logic in `BlockPalette.tsx` -- "Saved Blocks" section at bottom of palette
**File:** `BlockRenderer.tsx` -- "Save as reusable" option in block toolbar
**File:** Database: store saved blocks in a new table or in workspace settings

---

## Technical Plan -- Files

| File | Action | Changes |
|------|--------|---------|
| `BlockRenderer.tsx` | Edit | Rich text toolbar integration, social icons, spacer resize handle, hover animations, context menu, gradient rendering, borders |
| `BuilderCanvas.tsx` | Edit | Between-block "+" insert buttons, zoom transform |
| `BlockInspector.tsx` | Edit | Universal padding controls, gradient toggle, border section, AI rewrite button |
| `blockDefinitions.ts` | Edit | Add missing padding defaults, gradient props, border props |
| `htmlExporter.ts` | Edit | Responsive media queries, social icons export, gradient backgrounds, borders |
| `EmailBuilderDialog.tsx` | Edit | Zoom controls, layers panel integration, AI writer wiring |
| `TemplatesList.tsx` | Edit | Template thumbnail previews |
| **New:** `InlineTextToolbar.tsx` | Create | Floating B/I/U/Link toolbar for text blocks |
| **New:** `BlockLayersPanel.tsx` | Create | Compact outline/layers view of all blocks |

## Implementation Order

1. Tier 1 items first (1-4) -- these fix core UX gaps
2. Tier 2 items next (5-9) -- these add professional depth
3. Tier 3 items last (10-15) -- these add delight and power-user features

Due to the scope, this will be implemented in 2-3 passes to keep each change set manageable and testable.
