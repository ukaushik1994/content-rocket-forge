

# Align Sidebar Top to Chat & Make Header Sticky

## Problem
The sidebar starts at `top-20` (80px) while the chat content starts higher, creating a visual misalignment. The header section (Content Overview title, close button, topics, data source, goal progress) scrolls away with the content instead of staying pinned.

## Changes

### `src/components/ai-chat/VisualizationSidebar.tsx`

**1. Align top position (line 671)**
- Change `top-20` to `top-16` (64px) to match the overlay and align with the chat area top edge

**2. Make header row sticky**
The header `div` at line 679 (`flex-shrink-0 px-6 py-5 border-b`) already has `flex-shrink-0` and the sidebar is `flex flex-col`, so it naturally stays at the top while `ScrollArea` below it scrolls. This is already correct — the title + close button won't scroll.

The only fix needed is the `top` positioning to push the sidebar up by 16px so it aligns with the page top.

### Also update the mobile overlay (line 661)
Already at `top-16` — no change needed.

## Summary
Single line change: `top-20` → `top-16` on line 671 of `VisualizationSidebar.tsx`.

