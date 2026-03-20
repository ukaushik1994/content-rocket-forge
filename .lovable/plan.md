

# Remove Excess Top Spacing on Analytics Page

## Problem
The Analytics page has excessive vertical space at the top due to:
- `pt-24` on the main container (line 283)
- `pt-16` on the hero inner div (line 305)
- `mb-16` on the text-center wrapper (line 307)
- `mb-8` on the badge pill (line 320)
- `mb-12` on the description and buttons (lines 337, 343)

## Changes — `src/pages/Analytics.tsx`

1. **Line 283**: Reduce `pt-24` → `pt-6`
2. **Line 300**: Change `min-h-[5vh]` → remove min-height
3. **Line 305**: Change `pt-16 pb-8` → `pt-4 pb-4`
4. **Line 307**: Change `mb-16` → `mb-6`
5. **Line 320**: Change `mb-8` → `mb-4`
6. **Line 337**: Change `mb-12` → `mb-6`
7. **Line 343**: Change `mb-12` → `mb-6`

This removes roughly 200px of dead space above the hero content.

