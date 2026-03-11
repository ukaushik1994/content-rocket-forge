

# Simplify AI Chat Welcome — Dynamic, Catchy Header

## What Changes

### Remove clutter
- **Delete** the "Content Studio" gradient title (lines 470-478)
- **Delete** the subtitle "Your AI-powered workspace..." (lines 480-488)
- **Merge** the greeting into the hero — one big dynamic headline instead of separate title + greeting

### Dynamic rotating header
Replace the static greeting with a catchy, time-aware phrase system that rotates. The badge stays as-is ("AI Command Centre").

**Phrase pools by time period:**

| Period (hours) | Phrases |
|---|---|
| Morning (5-12) | "Rise and create.", "Morning momentum.", "Fresh ideas await.", "Let's make today count." |
| Afternoon (12-17) | "Back at it.", "Afternoon hustle.", "Keep the momentum.", "Let's power through." |
| Evening (17-21) | "Evening flow.", "Winding down? Or warming up?", "Creative hours.", "One more thing?" |
| Night (21-5) | "Night owl mode.", "Burning the midnight oil.", "Late night brilliance.", "The quiet hours." |

On mount, pick a random phrase from the current period's pool. Rotate to a new one every 8 seconds with a subtle fade transition.

### Simplified layout (top to bottom)
1. Badge pill — "AI Command Centre" (unchanged)
2. **Dynamic phrase** — large `text-3xl sm:text-4xl` heading, e.g. "Night owl mode, Utkarsh."
3. **Sub-line** — "What would you like to work on today?" (smaller, muted)
4. Stats circles (unchanged)
5. Quick action grid (unchanged)

This removes two entire text blocks and consolidates into one punchy headline.

### Files Changed

| File | Change |
|---|---|
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Remove "Content Studio" title + subtitle. Replace greeting block with rotating dynamic phrase using `useState` + `useEffect` interval. Move it directly under the badge. |

