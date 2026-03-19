

# Redesign CapabilitiesCard — Minimal, Drillable, Glassmorphism Theme

## Design

Replace the dense 2-column grid with a single-column accordion list matching the AI chat's glassmorphism aesthetic.

**Collapsed row**: `bg-white/[0.04] border border-white/[0.06] backdrop-blur-md rounded-2xl` — icon in `bg-white/[0.06]` rounded square, title in `text-sm font-medium`, right-aligned chevron, subtle count label (`text-muted-foreground/50`). Hover: `bg-white/[0.08]`.

**Expanded content**: Actions as a vertical list with `hover:bg-white/[0.06]` highlight rows (clickable, sends action text). Example prompts as horizontal amber-accent pills (`border-amber-300/20 text-amber-300/70 hover:bg-amber-300/10`).

**Header**: `"I can help with"` in `text-xs uppercase tracking-widest text-amber-300/70` with dot prefix (matching analyst label style).

**Animation**: `AnimatePresence` + `motion.div` for expand/collapse. Staggered row entrance (0.04s delay). One-at-a-time accordion via `expandedIndex` state.

## Changes

### 1. `src/components/ai-chat/CapabilitiesCard.tsx` — Full rewrite
- `useState<number | null>` for expanded index
- Vertical accordion list with glassmorphism card rows
- Clickable actions + amber example pills calling `onTryExample`
- Framer Motion stagger + expand animations

### 2. `src/components/ai-chat/EnhancedMessageBubble.tsx` (~line 218)
- Remove any wrapping `<Card>` around `CapabilitiesCard` since the new design handles its own styling

