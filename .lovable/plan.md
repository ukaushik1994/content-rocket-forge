

# Email Builder -- Sidebar & Design Polish Pass

## Problem

The left sidebar (Block Palette + Layers panel) looks utilitarian and plain. The Layers section (shown in the screenshot) is a flat, unstyled list with no visual hierarchy, no depth, and no premium feel. The overall sidebar lacks the glassmorphic, polished aesthetic that the rest of the Engage module follows.

## What Will Change

### 1. Left Sidebar Container Redesign
**File:** `EmailBuilderDialog.tsx` (line 413)

- Increase sidebar width from `w-56` (224px) to `w-64` (256px) for better breathing room
- Add subtle gradient background instead of flat `bg-card/80`
- Add a proper sidebar header with "Blocks" title and a collapsible Layers toggle button
- Separate Palette and Layers into two distinct visual sections with proper headers and dividers

### 2. Block Palette Visual Upgrade
**File:** `BlockPalette.tsx`

- Redesign palette items as a compact 2-column grid instead of a stacked list (icon + label in a card)
- Each item gets a subtle glass-card treatment: `bg-white/5 border-white/10 backdrop-blur` with hover glow
- Category headers get small decorative accent lines
- Saved Blocks section gets a distinct visual treatment with a gradient accent border

### 3. Layers Panel Premium Redesign
**File:** `BlockLayersPanel.tsx`

- Add a proper section header with a "Layers" label and block count badge
- Each layer row gets:
  - A numbered index indicator (1, 2, 3...) on the left
  - Block type icon with a subtle colored background circle
  - The block label with truncation
  - Lock/hidden status indicators
  - Move arrows that appear on hover with smooth transitions
- Selected layer gets a premium highlight: gradient left border + subtle bg glow
- Add smooth reorder animations
- Add a subtle scrollbar styling for the list
- Increase max-height for better usability

### 4. Inspector Panel Header Polish
**File:** `BlockInspector.tsx`

- Add a subtle gradient accent on the inspector header when a block is selected
- Improve the empty state (no block selected) with a more visual "Global Styles" presentation

### 5. Canvas Background & Empty State
**File:** `BuilderCanvas.tsx`

- Add a subtle dot-grid pattern to the canvas background (like Figma/design tools) for a professional feel
- Polish the empty state with better spacing and a more inviting design

### 6. Overall Color & Spacing Consistency
Apply consistent micro-spacing, font sizes, and the premium glassmorphic treatment across all sidebar components to match the Engage module's established visual system.

---

## Technical File Changes

| File | Changes |
|------|---------|
| `BlockLayersPanel.tsx` | Full redesign: numbered rows, icon backgrounds, gradient selected state, better spacing, scrollbar styling |
| `BlockPalette.tsx` | 2-column grid layout, glass-card items, improved category headers, polished saved blocks section |
| `EmailBuilderDialog.tsx` | Wider sidebar, gradient bg, proper section headers with Layers toggle |
| `BlockInspector.tsx` | Gradient header accent, improved empty state |
| `BuilderCanvas.tsx` | Dot-grid background pattern, polished empty state |
| `GlobalStylesPanel.tsx` | Minor styling polish to match new inspector aesthetic |

Total: 6 files modified, 0 new files.
