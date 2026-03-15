

# Fix: Remove White Outline on Chat Input & White Scrollbar

## Issues
1. **White outline on chat input**: The `ContextAwareMessageInput` container uses `border-border/20` which renders as a visible light border against the dark background. The `border-t border-border/20` on the fixed input wrapper also adds a white-ish top line.
2. **White scrollbar**: The `ScrollAreaThumb` in `scroll-area.tsx` uses `bg-black/80` — on a dark theme this is nearly invisible, but the scrollbar *track* and its `border-l-transparent` styling can still show a faint white bar. The real issue is the scrollbar thumb being too visible/contrasting.

## Changes

### 1. `src/components/ui/scroll-area.tsx` (line 43)
- Change `ScrollAreaThumb` from `bg-black/80` to `bg-white/10 hover:bg-white/20` — a subtle, dark-theme-appropriate scrollbar that only becomes visible on hover.

### 2. `src/components/ai-chat/EnhancedChatInterface.tsx` (line 534)
- Change `border-t border-border/20` on the fixed input wrapper to `border-t border-white/5` — nearly invisible separator that doesn't break the dark aesthetic.

### 3. `src/components/ai-chat/ContextAwareMessageInput.tsx` (line 288)
- Change the default (unfocused) border from `border-border/20` to `border-white/8` — reduces the visible outline while keeping a subtle boundary.

