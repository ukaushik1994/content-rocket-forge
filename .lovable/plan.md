

# Auto-Collapse Sidebar on User Engagement

## What
When the user starts engaging with the AI chat page (sends a message, clicks a quick action chip, or interacts with the input), the left sidebar should automatically collapse to give the content area full focus.

## Changes — 1 file

### `src/components/ai-chat/EnhancedChatInterface.tsx`

The component already imports `useSidebarContext`. Add a call to `setSidebarOpen(false)` at the start of `handleSendMessage`:

```tsx
const handleSendMessage = async (message: string) => {
  setSidebarOpen(false);
  await sendMessage(message);
};
```

Destructure `setSidebarOpen` from `useSidebarContext()` (currently only `setPendingPanel` is used — need to check and add `setSidebarOpen` to the destructure).

This covers all engagement paths since every interaction (quick action chips, insight buttons, input send) routes through `handleSendMessage`.

### Files changed: 1

