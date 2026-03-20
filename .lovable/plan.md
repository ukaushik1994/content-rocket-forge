

# Simplify Default AI Provider Selector UI

## Current State
The component uses a Card with header/description, a RadioGroup with inline badges ("Recommended", "High Performance", "Active", "No key"), and a fallback toggle section. It's functional but visually busy with many badges and inconsistent spacing.

## Design Direction
Minimal, clean layout following the app's glassmorphism aesthetic. Reduce visual noise by:
- Removing the Card wrapper — use a subtle glass container instead
- Replacing RadioGroup with clickable pill-style provider buttons
- Showing status through subtle visual cues (border glow, opacity) instead of multiple badges
- Condensing the fallback toggle into a single clean line
- Using the active provider's accent color as a soft glow indicator

## Changes — Single File

**`src/components/settings/api/DefaultAiProviderSelector.tsx`** — Full rewrite of the render:

1. Replace `Card`/`CardHeader`/`CardContent` with a single `div` using glass styling (`bg-white/5 border border-white/10 rounded-2xl backdrop-blur`)
2. Replace `RadioGroup` with a clean grid of clickable provider tiles:
   - Each tile: provider icon + name, subtle glass background
   - Active tile: highlighted border (green glow), no separate "Active" badge
   - Unconfigured tile: muted opacity + "No key" text below name (no badge)
   - Remove "Recommended" and "High Performance" badges entirely — cleaner without them
3. Title: simple "AI Provider" label, smaller description text
4. Fallback toggle: slim single-line row at the bottom, no border-top separator
5. Empty state: minimal text with a subtle icon, no card wrapper

## Visual Result
- Fewer visual elements (no badges clutter)
- Active state shown via border highlight + subtle checkmark
- Unconfigured providers are clearly dimmed
- Overall cleaner, more Apple-like aesthetic matching the app's design system

