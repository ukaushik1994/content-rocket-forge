
# Fix: Apply firstToken Fix to the Correct Hook

## Root Cause

The `/ai-chat` page uses `EnhancedChatInterface.tsx`, which calls `useEnhancedAIChatDB.ts` -- NOT `useUnifiedChatDB.ts`. The previous fix was applied to the wrong hook.

In `useEnhancedAIChatDB.ts`:
- Line 247: `setIsTyping(true)` when message is sent
- Lines 332-341: Tokens arrive and update message content, but `isTyping` stays `true`
- Line 424: `setIsTyping(false)` only in the `finally` block after everything completes

This means the "Thinking..." card and the growing text bubble render simultaneously for the entire stream duration.

## Fix

**File: `src/hooks/useEnhancedAIChatDB.ts`**

Same pattern as the previous fix, but applied to the correct file:

1. Add a `let firstToken = true;` flag before the streaming loop (around line 305)
2. Inside the token handler (line 332-341), call `setIsTyping(false)` on the first token received
3. Set `firstToken = false` after the first update

The token handler block (lines 332-341) changes from:

```
if (parsed.type === 'token' && parsed.content) {
  fullContent += parsed.content;
  setMessages(prev =>
    prev.map(m =>
      m.id === assistantId
        ? { ...m, content: fullContent }
        : m
    )
  );
}
```

To:

```
if (parsed.type === 'token' && parsed.content) {
  fullContent += parsed.content;
  if (firstToken) {
    setIsTyping(false);
    firstToken = false;
  }
  setMessages(prev =>
    prev.map(m =>
      m.id === assistantId
        ? { ...m, content: fullContent }
        : m
    )
  );
}
```

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useEnhancedAIChatDB.ts` | Add `firstToken` flag; call `setIsTyping(false)` on first streamed token |

## Result

- "Thinking..." appears only during the brief wait before the AI starts responding
- Disappears the instant the first word streams in
- No more flashing or dual-rendering
