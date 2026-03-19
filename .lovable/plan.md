

# Fix Chat Input: Focus Outline, Alignment, and Scrollbar

## Problems Identified

1. **White focus outline**: The base `Textarea` component applies `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`. The chat input overrides `focus:ring-0` but not the `focus-visible:` variants, so clicking the textarea shows a white ring.

2. **Placeholder not vertically centered**: The container uses `items-end` (for multi-line expansion), but the textarea's internal padding and min-height cause the single-line placeholder text to sit misaligned relative to the flanking buttons.

3. **White scrollbar inside textarea**: The textarea can scroll (max-h-[160px]) and shows the browser's default white scrollbar, which clashes with the dark theme.

## Changes

### File 1: `src/components/ai-chat/ContextAwareMessageInput.tsx`

**Textarea className** (line 373): Add `focus-visible:ring-0 focus-visible:ring-offset-0` to fully suppress the focus ring, and add custom scrollbar classes to hide/darken the scrollbar.

Change the container `items-end` to `items-center` (line 328) so the placeholder and buttons align vertically when the textarea is a single line. Keep the textarea's auto-grow behavior so it still expands.

Also update the focus border style (line 334) from purple (`border-primary/40`) to a subtler `border-white/[0.15]` to match the glassmorphism aesthetic.

### File 2: `src/index.css` (or global styles)

Add a utility for transparent/dark scrollbar styling on the textarea:
```css
.scrollbar-thin-dark::-webkit-scrollbar { width: 4px; }
.scrollbar-thin-dark::-webkit-scrollbar-track { background: transparent; }
.scrollbar-thin-dark::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
```

## Scope
- 2 files, purely cosmetic
- No logic changes

