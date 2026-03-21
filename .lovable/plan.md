

# Refine Chat Bubbles & Content Creation Card

## Changes

### 1. `src/components/ai-chat/EnhancedMessageBubble.tsx` (line 183)
- Change AI message width from `'w-full max-w-4xl'` → `'max-w-[85%] sm:max-w-[75%] lg:max-w-[65%]'`
- This prevents AI responses from stretching to the far right edge

### 2. `src/components/ai-chat/ContentCreationChoiceCard.tsx`
- Replace the bulky `Card` with a compact inline design
- Smaller text (text-[11px]), tighter padding (p-3), smaller gap
- Buttons: replace large full-width buttons with compact pill-style buttons using `rounded-full`, `text-xs`, `py-1.5 px-4`
- Use glassmorphism styling: `bg-white/[0.04] backdrop-blur-sm border-white/[0.08]`
- Smaller icons (h-3 w-3)
- AI Proposals button: subtle gradient instead of solid primary fill
- Overall: refined, compact, premium inline card

