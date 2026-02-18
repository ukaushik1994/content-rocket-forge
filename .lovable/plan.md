

# Complete Email Builder -- Gap Analysis and Enhancement Plan

## What Already Exists (Fully Built)

The visual email builder is already implemented with:
- 10 block types (Header, Text, Image, Button, Divider, Spacer, Columns, Social, Footer, Video)
- Drag-and-drop via @dnd-kit with sortable reordering
- Block palette (left sidebar) with categories
- Block inspector (right sidebar) with full property editors
- Desktop/mobile preview toggle
- Undo/redo with 50-entry history and keyboard shortcuts (Cmd+Z)
- 5 starter templates (Welcome, Newsletter, Promotional, Announcement, Event)
- Table-based HTML export for email client compatibility
- Template name and subject line editing in toolbar
- Save to database with metadata persistence

## What's Missing for a "Complete" Builder

After reviewing every file, here are the gaps:

### 1. No Drag Overlay (blocks disappear during drag)
When dragging a block on the canvas, the original block goes to 50% opacity but there's no visual ghost/overlay following the cursor. This makes drag feel broken. Need a `DragOverlay` component from @dnd-kit.

### 2. Palette-to-Canvas Drop Doesn't Insert at Position
Dragging from the palette calls `builder.addBlock(type)` which always appends to the end. It ignores WHERE you drop it on the canvas. The drop should insert at the hovered position.

### 3. No Inline Text Editing
Text and Header blocks require using the inspector panel to edit content. Users expect to click on text directly on the canvas and type. Add inline contentEditable for text/header blocks.

### 4. No Block Move Buttons (Up/Down Arrows)
The only way to reorder is drag. For accessibility and precision, blocks should have up/down arrow buttons in the toolbar overlay.

### 5. Missing "Code" Mode (HTML Editor)
The dialog only has "Build" and "Preview" modes. The plan specified a 3-mode system including a Code editor so advanced users can hand-edit the generated HTML.

### 6. No Global Email Styles Panel
There's no way to set global email background color, content width, or default font. These are hardcoded in the HTML exporter.

### 7. Block JSON Not Persisted for Round-Trip Editing
The save function stores `__builder_blocks__` in the variables array as a flag, but never actually stores the block JSON. When reopening a template built with the visual builder, the blocks are lost -- it can't round-trip.

---

## Implementation Plan

### File: `src/components/engage/email/builder/EmailBuilderDialog.tsx`
- Add `DragOverlay` from @dnd-kit showing a miniature preview of the dragged block
- Add a "Code" mode tab between Build and Preview that shows the generated HTML in a read/write textarea
- Track the over-index during drag for positional insertion from palette

### File: `src/components/engage/email/builder/BuilderCanvas.tsx`
- Accept `onDragOver` info to show a blue insertion line between blocks where a new block would land
- Add drop position indicator (animated blue line)

### File: `src/components/engage/email/builder/BlockRenderer.tsx`
- Add Up/Down arrow buttons to the floating toolbar
- Add inline `contentEditable` for text and header block content
- Pass `onMoveUp` and `onMoveDown` callbacks

### File: `src/components/engage/email/builder/useEmailBuilder.ts`
- Add `moveBlockUp(id)` and `moveBlockDown(id)` convenience methods

### File: `src/components/engage/email/builder/GlobalStylesPanel.tsx` (NEW)
- A collapsible section at the top of the inspector when no block is selected
- Controls: email background color, content area width (500-700px), default font family, content background color

### File: `src/components/engage/email/builder/htmlExporter.ts`
- Accept global styles config and use them in the wrapper HTML instead of hardcoded values

### File: `src/components/engage/email/templates/TemplatesList.tsx`
- Store block JSON in the template's `variables` field (as a JSON-encoded string entry) on save
- Parse it back when opening the visual builder for an existing template
- This enables round-trip editing: Visual Builder saves blocks, and reopening restores them

---

## Technical Details

### DragOverlay Implementation
```text
DndContext
  +-- DragOverlay dropAnimation={...}>
        <BlockRenderer block={activeBlock} isSelected={false} ... />
      </DragOverlay>
```
Uses `activeDragId` (already tracked) to render a floating preview.

### Round-Trip Block Persistence
On save: store `JSON.stringify(blocks)` as a special entry in the `variables` JSONB field with key `_builder_blocks`.
On load: check if `variables._builder_blocks` exists, parse it, and pass as `initialBlocks` to the builder.

### Inline Editing
For `header` and `text` blocks, wrap the text content in a `contentEditable` div. On blur, call `onUpdate` with the new text. Suppress the drag handle during editing to avoid conflicts.

### Global Styles Data Flow
```text
useEmailBuilder stores globalStyles: { bgColor, contentWidth, fontFamily }
  --> passed to exportBlocksToHtml(blocks, globalStyles)
  --> passed to GlobalStylesPanel for editing when no block selected
```

## Files Summary

| File | Action |
|------|--------|
| `EmailBuilderDialog.tsx` | Add DragOverlay, Code mode, positional palette drops |
| `BuilderCanvas.tsx` | Drop position indicator line |
| `BlockRenderer.tsx` | Inline editing, up/down move buttons |
| `useEmailBuilder.ts` | moveBlockUp/Down, globalStyles state |
| `htmlExporter.ts` | Accept and apply global styles |
| `GlobalStylesPanel.tsx` | NEW -- global email style controls |
| `BlockInspector.tsx` | Show GlobalStylesPanel when no block selected |
| `TemplatesList.tsx` | Round-trip block JSON persistence |

