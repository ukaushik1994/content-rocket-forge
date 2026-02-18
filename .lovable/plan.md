

# Email Builder -- Remaining Features Implementation

## What's Already Done (13 of 15 features complete)

The builder already has: rich text toolbar, between-block insert buttons, social media icons, universal padding controls, responsive HTML export, block layers panel, drag-to-resize spacer, hover animations, zoom controls, gradient backgrounds, border controls, quick-add menu, and color picker with presets.

## What's Left to Implement

### 1. Template Thumbnail Previews on Cards
Currently template cards in the list show only text metadata (name, subject, variables, date). Add a small iframe-based HTML preview thumbnail so users can visually identify templates at a glance.

**File:** `src/components/engage/email/templates/TemplatesList.tsx`
- Add a 120px-tall iframe with `srcDoc={t.body_html}` inside each template card
- Use `pointer-events-none` and `transform: scale(0.25)` with a fixed-size container to create a miniature preview
- Wrap in a container with `overflow-hidden` and `aspect-ratio` for consistent sizing

### 2. AI Content Assistant in Visual Builder
The AI writer dialog exists for the code editor but isn't wired into the visual builder's block inspector. Add an "AI Rewrite" button for text blocks.

**File:** `src/components/engage/email/builder/BlockInspector.tsx`
- Add an "AI Rewrite" button (with Sparkles icon) in the `text` block section
- The button triggers a callback (`onAIRewrite`) passed from the parent

**File:** `src/components/engage/email/builder/EmailBuilderDialog.tsx`
- Pass `onAIRewrite` callback to `BlockInspector`
- Open `AIEmailWriterDialog` when triggered, with the current text block content as context
- On AI result, call `builder.updateBlockProps(blockId, { content: aiResult })`

**File:** `src/components/engage/email/templates/TemplatesList.tsx`
- Import and render `AIEmailWriterDialog` within the visual builder context (it may already be available -- reuse the existing component)

### 3. Right-Click Context Menu on Blocks
Add a context menu using Radix `ContextMenu` that appears on right-click with: Duplicate, Delete, Move Up, Move Down, Lock, Hide.

**File:** `src/components/engage/email/builder/BlockRenderer.tsx`
- Wrap the block's outer `motion.div` with Radix `ContextMenu` + `ContextMenuTrigger`
- Add a `ContextMenuContent` with menu items matching the floating toolbar actions
- Respect `locked` state (disable move/delete when locked)
- Each item calls the same handlers already passed as props

### 4. Save as Reusable Block
Allow users to save a configured block as a "Saved Block" for reuse across templates. Store in localStorage (no DB schema change needed).

**File:** `src/components/engage/email/builder/BlockRenderer.tsx`
- Add a "Save as reusable" option in the toolbar (bookmark icon) and context menu
- Calls `onSaveAsReusable(block)` callback

**File:** `src/components/engage/email/builder/BlockPalette.tsx`
- Add a "Saved Blocks" section at the bottom of the palette
- Read saved blocks from localStorage key `email_builder_saved_blocks`
- Each saved block shows its type icon and a custom name
- Click to insert, with a small "x" to remove from saved

**File:** `src/components/engage/email/builder/EmailBuilderDialog.tsx`
- Manage saved blocks state, read/write from localStorage
- Pass `onSaveAsReusable` handler to `BlockRenderer` via `BuilderCanvas`
- Prompt for a name via `window.prompt` when saving

**File:** `src/components/engage/email/builder/BuilderCanvas.tsx`
- Accept and pass through `onSaveAsReusable` prop to `SortableBlock` and `BlockRenderer`

---

## Technical Summary

| File | Action | Changes |
|------|--------|---------|
| `TemplatesList.tsx` | Edit | Add iframe thumbnail preview to template cards |
| `BlockInspector.tsx` | Edit | Add AI Rewrite button for text blocks |
| `EmailBuilderDialog.tsx` | Edit | Wire AI writer dialog, saved blocks localStorage, pass new callbacks |
| `BlockRenderer.tsx` | Edit | Add right-click context menu (Radix ContextMenu), save-as-reusable button |
| `BuilderCanvas.tsx` | Edit | Pass through onSaveAsReusable prop |
| `BlockPalette.tsx` | Edit | Add "Saved Blocks" section with localStorage persistence |

Total: 6 files modified, 0 new files.

## Implementation Notes

- The right-click context menu uses `@radix-ui/react-context-menu` which is already installed
- Saved blocks use localStorage to avoid database schema changes -- simple and immediate
- Template thumbnails use a scaled-down iframe approach which is lightweight and requires no server-side rendering
- The AI integration reuses the existing `AIEmailWriterDialog` component
