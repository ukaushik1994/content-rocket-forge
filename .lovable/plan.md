

# Replace Send Button with Stop Icon During Generation

## What
When the AI is generating, the send button (arrow icon) should transform into a red stop icon — no floating "Stop generating" pill. Clicking the stop icon dispatches the abort event. Remove the separate floating stop button.

## Changes

**File: `src/components/ai-chat/ContextAwareMessageInput.tsx`** (lines 383-401)
- When `isLoading`, render a red square-stop icon instead of the spinning loader
- Make it clickable (not disabled) — clicking dispatches `abortAIRequest` custom event
- Style: `text-destructive` or red fill, same button size as send

**File: `src/components/ai-chat/EnhancedChatInterface.tsx`** (lines 559-576)
- Remove the entire "Stop generating" pill button and its wrapper from next to the `ThinkingTextRotator`
- Keep just `<ThinkingTextRotator>` in the typing indicator section

**File: `src/components/ai-chat/ContextAwareMessageInput.tsx`**
- The component needs an `onStop` callback or can dispatch the event directly
- The send button area becomes: `isLoading ? <StopCircle onClick={abort} className="text-destructive" /> : <Send />`

