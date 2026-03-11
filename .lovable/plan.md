

# Smooth Welcome-to-Chat Transition & Better Thinking State

## Two Issues to Solve

### 1. Welcome hero should collapse smoothly when first message is sent
Currently the welcome section (badge, greeting, stats, quick actions) disappears instantly via `AnimatePresence` with a quick 0.2s fade. When the user sends their first message, we need a polished collapse: scale down, fade out, and slide up — then the chat messages area takes over.

### 2. Typing indicator needs a rotating "thinking text" instead of just dots
The current indicator shows "Thinking..." with bouncing dots. Instead, show rotating contextual phrases like "Analyzing your request...", "Crafting a response...", "Connecting the dots..." that cycle every 2-3 seconds while `isTyping` is true. Once the first token arrives (`isTyping` becomes false), the indicator exits and the streamed response appears.

---

## File Changes

### `src/components/ai-chat/EnhancedChatInterface.tsx`

**Welcome exit animation** — Update `welcomeVariants.exit` to use a more dramatic collapse:
```
exit: {
  opacity: 0,
  y: -40,
  scale: 0.95,
  filter: "blur(4px)",
  transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
}
```

**Replace typing indicator** (lines 516-553) — Swap the static "Thinking..." card with a new `ThinkingTextRotator` that cycles through phrases with fade transitions. The indicator still uses `isTyping` to control visibility.

### `src/components/ai-chat/ThinkingTextRotator.tsx` (new file)

A lightweight component that:
- Has a pool of ~8 phrases: "Analyzing your request...", "Crafting a response...", "Pulling it together...", "Connecting the dots...", "Almost there...", "Thinking deeply...", "Working on it...", "Processing..."
- Rotates every 2.5 seconds with a subtle fade transition
- Shows the Brain icon + animated dots (same style) + the rotating text
- No typewriter effect — just clean fade swaps
- Exits smoothly when `isTyping` goes false

