

# Remove "View Dashboard" Button & Fix Retry Deleting Messages

## Issue 1: "View Dashboard" button
The edge function `supabase/functions/enhanced-ai-chat/index.ts` (line 4331-4337) injects a default "View Dashboard" action button whenever the AI returns no structured actions. This is unnecessary — if the AI has no actions, show nothing.

**Fix**: Remove the fallback action assignment so `actions` stays `null`/empty when no structured data is returned.

### `supabase/functions/enhanced-ai-chat/index.ts` (lines 4328-4337)
- Change the `if (!actions && !visualData)` block to NOT assign the "View Dashboard" fallback
- Just leave the log warning, set `actions` to empty array or leave undefined

## Issue 2: Retry button deletes the error message
In `EnhancedChatInterface.tsx` (lines 839-846), the retry handler calls `deleteMessage(message.id)` before resending. This deletes the error message from the conversation permanently.

**Fix**: Instead of deleting, just resend the last user message without removing the error. The new response will naturally replace the error in the flow. Or better: delete only the error message from local state (not DB) and then resend.

### `src/components/ai-chat/EnhancedChatInterface.tsx` (lines 839-846)
- Remove the `await deleteMessage(message.id)` call
- Just find the last user message before the error and resend it
- The streaming response will append after, and the error message can be removed from local state only

