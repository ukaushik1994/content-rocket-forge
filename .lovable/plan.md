

# Fix: Remove Double Bubble During AI Loading

## Problem
When a message is sent, two assistant bubbles appear simultaneously:
1. A placeholder message "Analyzing your request..." added to the messages array (rendered as a full message bubble)
2. The `ThinkingTextRotator` component shown below it (another bubble with rotating text)

## Solution
Remove the placeholder message from the messages array during loading. Instead, pipe SSE progress updates into the `ThinkingTextRotator` so there's only one loading indicator. Add the assistant message to the array only when the final response arrives.

## Changes

### 1. `src/hooks/useEnhancedAIChatDB.ts`
- **Remove** the placeholder message creation and `setMessages` call (lines ~386-395)
- **Add** a `progressText` state variable to hold SSE progress updates
- On `progress` SSE events (line ~478), update `progressText` instead of updating a placeholder message
- On `done` event, create and insert the final assistant message directly into messages
- Export `progressText` from the hook

### 2. `src/components/ai-chat/ThinkingTextRotator.tsx`
- Accept an optional `progressText` prop
- When `progressText` is provided, display it instead of cycling through the default phrases
- When `progressText` is empty/null, keep the existing rotating behavior as fallback

### 3. `src/components/ai-chat/EnhancedChatInterface.tsx`
- Pass `progressText` from the hook to `ThinkingTextRotator`

## Result
Single loading bubble that shows real-time progress from the backend, replaced by the final message when complete.

