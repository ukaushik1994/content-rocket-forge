

# AI Chat Fix List — Audit Results

## Already Fixed (12 of 16)

| # | Item | Status | Evidence |
|---|------|--------|----------|
| 1 | Chat input multiple clicks to send | **Done** | `requestAnimationFrame` refocus after send (line 144), `onKeyDown` replaces `onKeyPress` |
| 2 | Send button no `aria-label` / `type="submit"` | **Done** | `aria-label="Send message"` + `type="submit"` (lines 334-338) |
| 3 | Textarea doesn't auto-grow | **Done** | `useEffect` auto-resize up to 120px (lines 200-206) |
| 4 | Input missing `backdrop-blur` | **Done** | `backdrop-blur-xl` on container (line 283) |
| 5 | Input missing `box-shadow` | **Done** | `shadow-[0_2px_8px_rgba(0,0,0,0.3)]` (line 283) |
| 6 | Textarea font 14→15px | **Done** | `text-[15px] leading-relaxed` (line 320) |
| 7 | Sidebar section labels hierarchy | **Done** | `text-[11px] font-semibold uppercase tracking-[0.06em]` (line 158) |
| 8 | Active chat highlight | **Done** | 3px primary left-border accent (lines 458-459) |
| 9 | Hover state on chat items | **Done** | `hover:bg-accent/30` (line 454) |
| 11 | No fadeUp on welcome content | **Done** | `welcomeVariants` with `y: 20 → 0` animation (lines 346-366) |
| 12 | Send button aria-label | **Done** | Same as #2 |
| 13 | Attach button aria-label | **Done** | `aria-label="Open tools menu"` on PlusMenuDropdown (line 61) |

## Still Remaining (4 items)

### #10 — Residual `transition-all` usage
Three components still use `transition-all` instead of scoped transitions:
- **ChatHistorySidebar.tsx line 587**: User profile button uses `transition-all duration-200`
- **EnhancedQuickActions.tsx line 41**: Quick action pills use `transition-all duration-200`
- **VoiceInputHandler.tsx line 187**: Voice button uses `transition-all`

**Fix**: Replace each with scoped `transition-[background-color,color,border-color]` or `transition-colors`.

### #14 — Voice input button missing `aria-label`
The `VoiceInputHandler` button (line 180-203) has no `aria-label`. Needs `aria-label={isListening ? "Stop voice input" : "Start voice input"}`.

### #15 — Chat history items missing `role="listitem"` / `aria-selected`
The conversation list items (ChatHistorySidebar lines 447-524) are plain `<div>` elements. Need:
- Wrap the list in a container with `role="list"`
- Each item gets `role="listitem"` and `aria-selected={activeConversation === conversation.id}`

### #16 — Quick action buttons missing `role` attributes
The `EnhancedQuickActions` suggestion buttons (line 39-48) have no semantic role. Add `role="option"` or wrap in a group with `role="group" aria-label="Quick actions"`.

---

## Implementation Summary

4 small, surgical edits across 4 files:

1. **ChatHistorySidebar.tsx** — Scope `transition-all` on profile button; add `role="list"` wrapper + `role="listitem"` / `aria-selected` on chat items
2. **EnhancedQuickActions.tsx** — Scope `transition-all`; add `role="group"` wrapper with `aria-label`
3. **VoiceInputHandler.tsx** — Scope `transition-all`; add `aria-label` to mic button
4. No new files or dependencies needed

