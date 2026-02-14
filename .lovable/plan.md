

# Improve SolutionSelectionModal - Opaque Background & Polished Design

## Issues from Screenshot

1. The modal overlay is semi-transparent -- page content bleeds through making it hard to read
2. The modal itself has `bg-background/80` which also lets content show behind it
3. The dropdown menu for content types appears separately from the modal (floating off to the side)
4. Solution avatars section looks sparse and unpolished

## Changes

### 1. Make the overlay nearly opaque/black
In `SolutionSelectionModal.tsx`, pass a custom overlay class to the Dialog that uses `bg-black/95` instead of the default `bg-black/80`. This will be done by overriding the DialogContent's overlay via a className prop on DialogOverlay or by wrapping with a custom overlay.

### 2. Make the modal body fully opaque
Change the modal content from `bg-background/80 backdrop-blur-xl` to `bg-background backdrop-blur-xl` (fully opaque background, no transparency).

### 3. Polish the layout
- Remove the separate gradient header section -- merge it into a single cohesive card
- Make solution avatars slightly larger and add labels below each
- Add a subtle selected state with a glow effect on the chosen solution
- Show content type inline within the modal after selection (not as a separate floating dropdown that overlaps other elements)
- Add a "Confirm" footer button instead of relying purely on auto-close (keeps auto-close as backup)

### 4. Better empty/loading states
- Skeleton loaders instead of a single spinner
- Better "no solutions" messaging with a link to add solutions

## Technical Details

### File: `src/components/content-builder/SolutionSelectionModal.tsx`
- Line 164: Change `bg-background/80` to `bg-background` for fully opaque modal body
- Add a custom `DialogOverlay` override with `bg-black/95` class
- Use a custom portal structure: render `DialogPortal` manually with `DialogOverlay` having `className="bg-black/95"` and then `DialogPrimitive.Content`
- Restructure the inner layout: single section with compact header, solution grid, and selection confirmation
- Keep the DropdownMenu for content types but ensure `side="bottom"` and `align="start"` so it renders inside the modal area
- Keep auto-close logic but add 800ms delay instead of 500ms for smoother UX

### File: No other files need changes
The dialog.tsx overlay already uses `bg-black/80` as default -- we override it at the component level.

