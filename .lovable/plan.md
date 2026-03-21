

# Move Message Search to Top-Right Icon Button

## What
Remove the inline "Search" button and `MessageSearchBar` from the chat messages area. Instead, add a small search icon button to the fixed top-right control group in `AppLayout.tsx` (right of the notification bell). Clicking it opens a floating search overlay/popover anchored to that button.

## Changes

### 1. `src/components/layout/AppLayout.tsx`
- Import `MessageSearchBar` state/toggle logic
- Add a `Search` icon button after `NotificationBell` in the fixed top-right group, matching the same icon-button style
- On click, toggle a small floating popover/dropdown below the button containing the `MessageSearchBar`
- Layout becomes: `[Provider Logo] [Bell] [Search]`

### 2. `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 662-700)
- Remove the entire "Message Search Bar" block (the toggle button + the `AnimatePresence` with `MessageSearchBar`)
- Expose search state (`messageSearchQuery`, `setMessageSearchQuery`, `messageSearchResults`, etc.) upward via context or a shared hook so the top-right search can drive it

### 3. Approach: Shared state via context
Since `EnhancedChatInterface` owns the message search state but the trigger moves to `AppLayout`:
- Create a lightweight context (`ChatSearchContext`) that exposes: `showSearch`, `toggleSearch`, `searchQuery`, `setSearchQuery`, `results`, `navigateMatch`, `currentMatch`, `totalMatches`, `exportConversation`, `showAnalytics`
- `EnhancedChatInterface` provides this context
- `AppLayout` consumes it for the icon button + popover

### 4. Search popover design
- Small rounded popover (`w-80`) with glassmorphism (`bg-background/95 backdrop-blur-sm border-white/10`)
- Contains the existing `MessageSearchBar` component (already well-designed)
- Appears below the search icon, aligned to the right

## Files
| File | Change |
|------|--------|
| `src/contexts/ChatSearchContext.tsx` | New — lightweight context for search state |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Remove inline search block; provide `ChatSearchContext` |
| `src/components/layout/AppLayout.tsx` | Add Search icon button + popover after NotificationBell |

