

# Fix AI Chat: Enable Tool Execution in Streaming Mode

## Problem

The AI Chat currently uses two separate edge functions:
- **`ai-streaming`**: Used for ALL chat messages (default). Has NO tools -- just a 4-line system prompt ("You are an AI content strategy assistant. Be helpful."). This is why the AI told you to "copy and paste" instead of saving the blog post.
- **`enhanced-ai-chat`**: Has all 37 tools, rich system prompt, data context. Only used as a dead-code fallback that never triggers.

Result: The AI can never take actions (save content, create contacts, send emails, etc.) because the streaming path has zero tool access.

## Solution: Two-Phase Streaming with Tool Execution

Instead of rewriting the streaming function (which would be massive), we use a **post-stream tool detection** approach:

### Phase 1: Detect Tool Intent After Streaming

**File: `src/hooks/useUnifiedChatDB.ts`**

After the streaming response completes, check if the user's message requested an action (save, create, delete, send, etc.). If so, make a secondary call to `enhanced-ai-chat` to execute the tool, then append/update the response with the tool result.

Flow:
1. Stream text response via `ai-streaming` (fast, gives instant feedback)
2. After stream completes, analyze if the user asked for a write action
3. If yes, call `enhanced-ai-chat` with the conversation to execute tools
4. Update the message with tool results (using ActionResultCard)

### Phase 2: Enrich Streaming System Prompt

**File: `supabase/functions/ai-streaming/index.ts`**

Update the minimal system prompt to include:
- Awareness of available tools (so it says "I'll save that for you" instead of "copy and paste")
- Instruction to format action requests as structured hints the frontend can detect
- Context about the user's data (content count, etc.)

The function will also receive a `context` parameter from the frontend with basic data counts so it can reference them.

### Phase 3: Action Detection Logic

**New file: `src/utils/actionIntentDetector.ts`**

A lightweight utility that checks the user's message for action intent:
- "save this" / "create a" / "delete" / "send" / "add contact" etc.
- Returns the likely tool name and extracted parameters
- Used by the hook to decide whether to make the secondary `enhanced-ai-chat` call

## Implementation Details

### `src/hooks/useUnifiedChatDB.ts` Changes
- After streaming completes (line ~790), add action detection
- If action detected, show a brief "Executing..." indicator
- Call `enhanced-ai-chat` with the full conversation + action context
- Parse tool results and update the message with ActionResultCard data
- If tool returns navigation links or confirmation buttons, add them to the message

### `supabase/functions/ai-streaming/index.ts` Changes
- Replace the 4-line `buildStreamingSystemPrompt()` with a richer prompt that:
  - Lists available actions the user can request
  - Instructs the AI to acknowledge action requests confidently ("I'll save this as a draft for you")
  - Uses markdown formatting properly
- Accept optional `context` param with data counts

### `src/utils/actionIntentDetector.ts` (New)
- Pattern-based detection for write intents
- Maps user phrases to tool names
- Returns `{ detected: boolean, toolName: string, params: object }`

## Files Modified

| File | Change |
|------|--------|
| `src/hooks/useUnifiedChatDB.ts` | Add post-stream tool execution flow |
| `supabase/functions/ai-streaming/index.ts` | Enrich system prompt with action awareness |
| `src/utils/actionIntentDetector.ts` | **New** — detect write action intent from messages |

## Why This Approach

- Preserves fast streaming UX (no latency added for read-only queries)
- Only adds a secondary call when the user explicitly requests an action
- Leverages the fully-tested `enhanced-ai-chat` tool execution (37 tools, all working)
- No need to rebuild tool-calling into the streaming function (would be 3000+ lines)

