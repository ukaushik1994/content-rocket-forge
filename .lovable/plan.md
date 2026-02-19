
# Fix: Streaming Text Flashing + "Processing" Overlap

## Root Cause

When the user sends a message, `isTyping` is set to `true` (line 649 in `useUnifiedChatDB.ts`). This triggers the "Thinking..." indicator in the UI. As streaming tokens arrive (lines 764-774), the message content updates progressively -- but `isTyping` is never turned off until the stream is fully complete (line 808). This means for the entire duration of streaming, **both the growing text bubble and the "Thinking..." card are visible simultaneously**, causing the visual flashing.

## Fix

**File: `src/hooks/useUnifiedChatDB.ts`**

Inside the token processing loop (around line 763), set `isTyping: false` on the very first token received. This makes the "Thinking..." indicator disappear the instant real text starts appearing.

```
// Before the streaming loop, add a flag
let firstToken = true;

// Inside the token handler (line 763-774):
if (parsed.type === 'token' && parsed.content) {
  fullContent += parsed.content;

  setState(prev => ({
    ...prev,
    isTyping: firstToken ? false : prev.isTyping,  // Kill typing indicator on first token
    messages: prev.messages.map(msg =>
      msg.id === aiMessageId
        ? { ...msg, content: fullContent }
        : msg
    )
  }));
  firstToken = false;
}
```

This is a single-line change inside one setState call. No new files, no new components.

## What Changes

- "Thinking..." shows only during the brief pause before the AI starts responding (typically under 1 second)
- Once the first word appears, "Thinking..." disappears and only the growing text bubble remains
- No more dual-rendering / flashing

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useUnifiedChatDB.ts` | Add `firstToken` flag; set `isTyping: false` on first streamed token |
