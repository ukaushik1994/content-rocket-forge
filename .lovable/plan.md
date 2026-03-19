

# Move Message Actions to Bottom-Left Below AI Bubble

## What
Relocate the Copy, Regenerate, and More (Edit/Delete) action buttons from the top-right corner inside the card to below the bubble on the bottom-left — matching the reference image style (icons sitting underneath the response).

## How

**File: `src/components/ai-chat/EnhancedMessageBubble.tsx`**

1. Remove the `absolute top-2 right-2` wrapper (lines 215-226) from inside the `<Card>`
2. Add a new `<div>` **after** the `</Card>` closing tag (after line 227), rendering `<MessageActions>` below the bubble, left-aligned
3. Only show for AI messages (not user messages — user actions stay in the card or are removed)

**File: `src/components/ai-chat/MessageActions.tsx`**

4. Remove the `opacity-0 group-hover:opacity-100` hide-on-desktop classes — buttons should always be visible (subtle but present)
5. Keep icons small (h-3.5 w-3.5), use `text-muted-foreground` for a subdued look
6. Layout: horizontal row with `gap-1`, no background, just icon buttons

Result: Copy | Regenerate | ••• sitting below the AI bubble's bottom-left edge, always visible.

