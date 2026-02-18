

# Complete Email Builder with Drag-and-Drop

## What Exists Today

The current email template editor is a raw HTML textarea with 5 formatting buttons (Bold, Italic, Heading, Link, Image), variable insertion, and an AI writer. Users must manually write HTML to build emails. There is no visual drag-and-drop, no content blocks, no layout system, and no mobile preview.

## What We're Building

A full visual email builder that replaces the existing code-only editor with a 3-mode system: **Visual Builder** (drag-and-drop blocks), **Code Editor** (existing HTML editor, preserved), and **Preview** (desktop/mobile toggle). The visual builder uses `@dnd-kit` which is already installed in the project.

---

## Architecture

The email builder will be a new full-screen dialog that opens when creating/editing templates. It contains:

1. **Left Sidebar** -- Block palette (draggable content blocks)
2. **Center Canvas** -- Drop zone where blocks are arranged vertically
3. **Right Inspector** -- Settings panel for the selected block
4. **Top Toolbar** -- Save, undo, preview mode toggle, device preview, AI writer

### Content Block Types

| Block | Description | Configurable Properties |
|-------|-------------|------------------------|
| **Header** | Logo + heading text | Text, alignment, background color, logo URL |
| **Text** | Rich paragraph | Content (inline editing), font size, color, alignment |
| **Image** | Single image | URL, alt text, width, link URL, alignment |
| **Button** | CTA button | Text, URL, color, border radius, alignment |
| **Divider** | Horizontal line | Color, thickness, margin |
| **Spacer** | Vertical spacing | Height (px) |
| **Columns** | 2 or 3 column layout | Column count, content per column |
| **Social Links** | Social media icons | Which platforms, URLs, icon style |
| **Footer** | Unsubscribe + address | Company name, address, unsubscribe text |
| **Video** | Video thumbnail with play | Thumbnail URL, video URL |

### Data Model (In-Memory, No DB Changes)

Each block is stored as a JSON object:

```
{
  id: string,          // uuid
  type: 'header' | 'text' | 'button' | ...,
  props: Record<string, any>,  // block-specific config
  order: number
}
```

The block array is converted to email-safe HTML on save (using table-based layout for email client compatibility). The existing `body_html` column stores the final output -- no schema changes needed.

---

## File Plan

### New Files

| File | Purpose |
|------|---------|
| `src/components/engage/email/builder/EmailBuilderDialog.tsx` | Full-screen dialog shell with toolbar, 3-panel layout |
| `src/components/engage/email/builder/BlockPalette.tsx` | Left sidebar with draggable block types |
| `src/components/engage/email/builder/BuilderCanvas.tsx` | Center drop zone with sortable blocks using `@dnd-kit/sortable` |
| `src/components/engage/email/builder/BlockRenderer.tsx` | Renders each block type visually on the canvas |
| `src/components/engage/email/builder/BlockInspector.tsx` | Right panel with property editors for selected block |
| `src/components/engage/email/builder/blocks/` | Individual block config components (HeaderBlock, TextBlock, ButtonBlock, etc.) |
| `src/components/engage/email/builder/useEmailBuilder.ts` | Hook managing block state, undo/redo stack, selection, HTML export |
| `src/components/engage/email/builder/htmlExporter.ts` | Converts block JSON array to email-compatible HTML (table-based) |
| `src/components/engage/email/builder/blockDefinitions.ts` | Block type registry with default props, icons, labels |
| `src/components/engage/email/builder/EmailBuilderPreview.tsx` | Desktop/mobile preview with device frame toggle |

### Modified Files

| File | Change |
|------|--------|
| `src/components/engage/email/templates/TemplatesList.tsx` | Add "Visual Builder" button alongside existing editor; wire up `EmailBuilderDialog` |

---

## UX Flow

1. User clicks **"New Template"** or edits an existing one
2. A mode selector appears: **"Visual Builder"** or **"Code Editor"**
   - Code Editor = the existing dialog (unchanged)
   - Visual Builder = opens the new `EmailBuilderDialog`
3. In the Visual Builder:
   - Left sidebar shows block categories (Content, Layout, Social)
   - User drags a block from the palette onto the canvas
   - Blocks snap into vertical order (reorderable via drag handles)
   - Clicking a block selects it and opens its inspector on the right
   - Inline text editing for Text and Header blocks
   - Top toolbar: Undo/Redo, Device Preview (desktop 600px / mobile 320px), AI Writer, Save
4. On save, the block array is exported to HTML and stored in `body_html`
5. When editing an existing template that was built with the visual builder, the block JSON is stored in the template's existing `variables` field as a special entry, allowing round-trip editing

## Design Language

- Same `bg-card border-border/50` panels as the rest of Engage
- Block palette items: `bg-muted/30 hover:bg-muted/50` with subtle borders
- Selected block: `ring-2 ring-primary` outline
- Canvas background: `bg-white` (email preview context) with centered 600px max-width
- Inspector: standard `Label` + `Input` / `Select` components
- All animations: framer-motion consistent with existing Engage patterns
- Drag overlay: slight scale + shadow during drag

## Technical Notes

- **@dnd-kit** is already installed (`@dnd-kit/core`, `@dnd-kit/sortable`, `@dnd-kit/utilities`) and used in `CompetitiveAnalysisTab.tsx`
- HTML export uses `<table>` layout for maximum email client compatibility (Outlook, Gmail, Apple Mail)
- The builder stores block JSON in a metadata field for round-trip editing, but the final output is always pure HTML in `body_html`
- Undo/redo uses a simple state history stack (max 50 entries)
- No new database tables or columns required
- No new dependencies needed

