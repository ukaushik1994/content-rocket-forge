

# Make Hero Icon Fill the Space

## What
The small "AI Command Centre" badge pill with the tiny Brain icon is too compact and doesn't use the visual space well. Replace the small badge with a larger, more prominent branding element that fills the area — a bigger icon with the label below it, similar to the Claude.ai centered welcome pattern.

## Changes — 1 file

### `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 731-741)

Replace the compact badge pill with a larger hero icon element:

- **Large icon container**: `w-16 h-16` (or similar) rounded-2xl with gradient background, housing a bigger `Brain` or `Sparkles` icon (`h-8 w-8`)
- **Glow effect**: Subtle animated box-shadow pulse around the icon container
- **Label below**: "AI Command Centre" text + green dot moved below the icon, not crammed inline
- Layout: icon block stacked vertically with the greeting below

```text
Before:  [ ✦ AI Command Centre ● ]   (tiny pill)

After:   ┌──────────┐
         │    ✦     │              (large icon block)
         └──────────┘
         AI Command Centre ●
```

The icon container uses the existing brand gradient (`from-primary to-neon-blue`) with a soft glow animation, matching the dark glassmorphism theme.

### Files changed: 1
- `src/components/ai-chat/EnhancedChatInterface.tsx`

