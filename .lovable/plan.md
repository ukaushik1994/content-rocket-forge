

# AI Chat Universal Action Engine -- Complete Implementation Plan

## Problem Statement

The AI Chat page (`/ai-chat`) uses `useEnhancedAIChatDB.ts` which streams text via the `ai-streaming` edge function -- but this function **only streams text**. It has NO tool-calling capability. The `enhanced-ai-chat` function has 40+ tools for reading and writing across all modules, but it's only used as a blocking fallback when streaming fails. The result: users can ask the AI questions and get text answers, but **write actions never execute**.

Meanwhile, the alternate `useUnifiedChatDB.ts` hook already implements a "Two-Phase Streaming" pattern where it detects action intent after streaming and makes a secondary call to `enhanced-ai-chat` for tool execution -- but **this hook isn't connected to the AI Chat page**.

## Architecture Overview

```text
CURRENT FLOW (broken for actions):
  User message --> ai-streaming (SSE) --> text tokens --> done
                                                         (no tools ever called)

TARGET FLOW (two-phase):
  User message --> ai-streaming (SSE) --> text tokens --> done
                                                            |
                                                            v
                                                    actionIntentDetector
                                                            |
                                              (if write intent detected)
                                                            |
                                                            v
                                                  enhanced-ai-chat (tools)
                                                            |
                                                            v
                                                   ActionResultCard UI
```

## Implementation -- 3 Steps

### Step 1: Wire Two-Phase Tool Execution into `useEnhancedAIChatDB.ts`

This is the core fix. After the streaming loop completes successfully (`streamSuccess = true`), we add the same pattern from `useUnifiedChatDB.ts`:

1. Import `detectActionIntent` from `@/utils/actionIntentDetector`
2. After `streamSuccess` is set to `true` and the final message is saved (around line 372), add:
   - Call `detectActionIntent(content)` where `content` is the original user message (not the AI response)
   - If `detected === true` and `confidence !== 'low'`:
     - Add a temporary "Executing..." message to the UI
     - Call `supabase.functions.invoke('enhanced-ai-chat', { body: { messages: conversationHistory } })`
     - Replace the temporary message with the tool result (content, actions, visualData)
     - Save the result message to the database
   - If tool execution fails, show an error message in the chat

**Key detail**: The user's original message is `content` (line 229 param). The AI's streaming response is `fullContent`. We send both to `enhanced-ai-chat` so it has full context to execute the right tool.

### Step 2: Render Action Results in the Chat UI

The `EnhancedMessageBubble` component already renders `actions` and `visualData` from messages. The tool execution result from `enhanced-ai-chat` returns these fields. We need to ensure:

1. The tool result message includes `actions` and `visualData` parsed from the response
2. The `ActionResultCard` component (already exists at `src/components/ai-chat/ActionResultCard.tsx`) renders success/failure states
3. Navigation actions from tool results work (e.g., "View content" button navigates to `/repository`)

No new components needed -- `ActionResultCard` and `EnhancedMessageBubble` already handle this.

### Step 3: Confirmation Flow for Destructive Actions

The memory context mentions a "recursive confirmation loop" for destructive operations. We need to add a simple confirmation step:

1. In the `actionIntentDetector`, mark certain tools as `requiresConfirmation: true` (e.g., `delete_content_item`, `send_email_campaign`, `send_quick_email`)
2. When a destructive action is detected, instead of executing immediately, show a confirmation card in the chat with "Confirm" and "Cancel" buttons
3. On confirm, prepend the message with `CONFIRMED: Execute [tool] with params: [args]` and send to `enhanced-ai-chat`
4. On cancel, dismiss the confirmation card

## Technical Details

### File Changes

| File | Change | Lines |
|------|--------|-------|
| `src/hooks/useEnhancedAIChatDB.ts` | Add Phase 2 tool execution after streaming completes | ~40 lines added after line 372 |
| `src/utils/actionIntentDetector.ts` | Add `requiresConfirmation` flag to destructive tool rules | ~10 lines modified |
| `src/components/ai-chat/EnhancedMessageBubble.tsx` | Ensure ActionResultCard renders for tool results (may already work) | Verify only |

### Code Flow in `useEnhancedAIChatDB.ts`

After the streaming block (line 363-373), the new code will:

```text
1. const actionIntent = detectActionIntent(content)  // 'content' = user's original message
2. if (actionIntent.detected && confidence !== 'low'):
   a. If requiresConfirmation:
      - Show ConfirmationCard message in chat
      - Wait for user click
      - On confirm: proceed to step 2b
      - On cancel: remove card, done
   b. Show "Executing [tool]..." placeholder message
   c. Build conversation history including streaming response
   d. Call enhanced-ai-chat with full conversation
   e. Parse response (content, actions, visualData)
   f. Replace placeholder with ActionResultCard
   g. Save to database
```

### What Actions Will Work After This

All 40+ tools defined in `enhanced-ai-chat/tools.ts` will be executable from chat:

**Content Module**: Create, update, delete, publish, generate full articles, submit/approve/reject for review
**Keywords Module**: Add/remove keywords, trigger SERP analysis, create topic clusters, content gap analysis
**Offerings Module**: Create/update/delete solutions, add competitors, trigger competitor analysis, update company info
**Engage Module**: Create contacts, segments, email campaigns, journeys, automations; send emails; enroll contacts; toggle automations
**Cross-Module**: Promote content to campaigns, convert content to email, repurpose for social media
**Campaigns**: Trigger content generation, retry failed items

### Testing

After implementation, test with these commands in AI Chat:
- "Create a blog post about AI trends" (content creation)
- "Add keyword 'machine learning'" (keyword action)
- "Show my contacts" (read action -- already works via streaming)
- "Send a quick email to test@example.com" (destructive -- should show confirmation)
- "Create a segment of VIP contacts" (engage action)

## What This Does NOT Change

- The `ai-streaming` edge function stays unchanged (text-only streaming)
- The `enhanced-ai-chat` edge function stays unchanged (already has all tools)
- The `useUnifiedChatDB.ts` hook stays unchanged (it's a separate implementation)
- No database migrations needed
- No new edge functions needed

