

# Fix Onboarding Modal Content Clipping

## Problem Summary

The fixed-height modal (`h-[680px]`) combined with `overflow-hidden` is causing the CTA button and bottom content to be cropped. The content needs to adapt to the available space using flexible distribution.

## Solution Strategy

Instead of fighting the fixed height, we'll:
1. **Remove the icon badge** at the top of the right column (saves ~70px vertical space)
2. **Use `justify-between` flex layout** on the content column so elements distribute evenly
3. **Group content logically** - Top group (subtitle, title, description, benefits) and bottom group (Pro Tip + CTA)
4. **Add auto-growing spacer** between the main content and footer elements
5. **Ensure `max-h-[90vh]`** takes priority and content adapts

## Layout Structure (After Fix)

```
Right Content Column (flex flex-col justify-between h-full)
┌─────────────────────────────────────┐
│  Subtitle (uppercase label)         │  ← Top Group
│  Title (main heading)               │
│  Description (paragraph)            │
│  Benefits (2x2 grid)                │
├─────────────────────────────────────┤
│          [flexible space]           │  ← Grows to fill gap
├─────────────────────────────────────┤
│  Pro Tip box                        │  ← Bottom Group
│  CTA Button                         │
└─────────────────────────────────────┘
```

## Technical Changes

### File 1: `OnboardingStep.tsx`

**Remove Icon Badge Section:**
- Delete lines 92-118 (the `motion.div` containing the icon badge with glow)
- This saves significant vertical space

**Restructure Content Layout:**
- Change `space-y-5` to `flex flex-col h-full`
- Wrap subtitle, title, description, and benefits in a `<div>` (top content group)
- Wrap Pro Tip and CTA button in a `<div className="mt-auto">` (pushes to bottom)
- Add `space-y-4` within each group for consistent internal spacing

**Updated structure:**
```jsx
<motion.div className="flex flex-col h-full py-2">
  {/* Top content group */}
  <div className="space-y-4">
    {/* Subtitle */}
    {/* Title */}
    {/* Description */}
    {/* Benefits grid */}
  </div>
  
  {/* Bottom content group - pushed to bottom */}
  <div className="mt-auto space-y-4 pt-4">
    {/* Pro Tip */}
    {/* CTA Button */}
  </div>
</motion.div>
```

### File 2: `OnboardingCarousel.tsx`

**Adjust Content Area:**
- Keep `flex-1 overflow-hidden` on content wrapper
- Remove `overflow-y-auto` from content column (not needed if layout is proper)
- Ensure the content wrapper passes `h-full` down properly

## Expected Result

After these changes:
- Modal maintains consistent fixed height
- **No content clipping** - everything fits within the container
- Pro Tip and CTA button are **always visible at the bottom**
- Extra space is distributed **between the main content and footer elements**
- Navigation buttons remain **stable in position**
- Cleaner look without the redundant icon at the top (icon is already in the footer/header)

## Visual Before/After

```
BEFORE (clipped):                 AFTER (properly distributed):
┌─────────────────────┐           ┌─────────────────────┐
│ [Icon Badge]        │           │ CONTENT SUITE       │
│ CONTENT SUITE       │           │ Content Creation... │
│ Content Creation... │           │ Build content...    │
│ Build content...    │           │ ✓ Feature  ✓ Feat   │
│ ✓ Feature  ✓ Feat   │           │ ✓ Feature  ✓ Feat   │
│ ✓ Feature  ✓ Feat   │           │                     │
│ 💡 Pro Tip          │           │ [grows to fill]     │
│ Hover to pause...   │           │                     │
│ ▬▬▬ CROPPED ▬▬▬     │           │ 💡 Pro Tip          │
└─────────────────────┘           │ [Try Content Build] │
                                  └─────────────────────┘
```

