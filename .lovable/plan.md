

# AI Chat Audit: Issues & Remaining Problems

After a thorough review of the frontend hook (`useEnhancedAIChatDB`), edge function (`enhanced-ai-chat/index.ts`, `tools.ts`, all tool modules), UI components, and data flow, here are the issues found:

---

## 1. Dead Legacy Code Still Referenced

**Files:** `src/hooks/useAIChat.ts`, `src/components/ai-chat/MessageList.tsx`, `src/components/ai-chat/MessageBubble.tsx`, `src/components/ai-chat/ChatSidebar.tsx`, `src/contexts/ChatContextBridge.tsx`

The old `useAIChat` hook and its `ConversationMessage` / `Conversation` types are still imported by `MessageList.tsx`, `MessageBubble.tsx`, `ChatSidebar.tsx`, and `ChatContextBridge.tsx`. These components appear to be unused orphans (the active chat uses `EnhancedChatInterface` + `EnhancedMessageBubble` + `ChatHistorySidebar`), but they add confusion, increase bundle size, and could cause import errors if the legacy hook is ever removed.

**Fix:** Delete `useAIChat.ts`, `MessageList.tsx`, `MessageBubble.tsx`, `ChatSidebar.tsx`, and `ChatContextBridge.tsx` (after confirming no active imports).

---

## 2. `sanitizeResponseContent` Strips Valid JSON from AI Responses

**File:** `supabase/functions/enhanced-ai-chat/index.ts` (line ~1173)

```
.replace(/^\s*\{[\s\S]*?\}\s*$/gm, '')
```

This regex removes any standalone JSON block in the AI text. If the AI places a JSON `visualData` block on its own line within the conversational text (which it's instructed to do), this sanitizer can strip it **before** the JSON parser runs if the parsing order is wrong. The `sanitizeResponseContent` function is called in `parseResponseWithFallback` and also as a fallback at line 3488. If the AI response contains a JSON block that wasn't extracted by `extractJSONBlocks`, the sanitizer deletes it silently.

**Fix:** Remove the standalone JSON regex or move it to only run **after** JSON extraction is complete.

---

## 3. `enhancedAIService` Is a Dead Code Path for Message Sending

**File:** `src/services/enhancedAIService.ts`

The `processEnhancedMessage` method in `enhancedAIService` duplicates much of what `enhanced-ai-chat` does (fetches context, calls AI providers, checks API keys). However, `useEnhancedAIChatDB.sendMessage()` calls the edge function directly via SSE fetch -- it never calls `enhancedAIService.processEnhancedMessage()`. The only active usage of `enhancedAIService` is for workflow state management (`getWorkflowState`, `updateWorkflowState`) in `handleWorkflowAction`.

**Fix:** Remove `processEnhancedMessage` and related dead methods from `enhancedAIService`. Keep only the workflow state helpers.

---

## 4. Message Edit Doesn't Re-trigger AI Response

**File:** `src/hooks/useEnhancedAIChatDB.ts` (line 1030)

When a user edits a message within the 5-minute window, the edit updates the text in the database and local state but does **not** re-send the edited message to the AI for a new response. The old AI response below the edited message remains stale and potentially incorrect. Users likely expect editing a message to regenerate the AI response (like ChatGPT behavior).

**Fix:** After editing a user message, delete the subsequent assistant message and re-invoke `sendMessage` with the new content. Add a confirmation prompt since this is destructive.

---

## 5. No Error Recovery When SSE Stream Breaks Mid-Response

**File:** `src/hooks/useEnhancedAIChatDB.ts` (lines 487-517)

The SSE stream reader loop has no timeout. If the edge function hangs or the network drops mid-stream, the `while (true)` loop will wait indefinitely until `done` is true. There's no `AbortController` timeout, so users see a perpetual loading state with no way to cancel.

**Fix:** Add an `AbortController` with a 60-second timeout. On abort, display an error message with a retry button.

---

## 6. File Upload Analysis Uses Client-Side Only -- No AI Context

**File:** `src/components/ai-chat/FileUploadHandler.tsx`

When a file is uploaded and analyzed, the `onFileAnalyzed` callback sends a summary like "Analyzed file.pdf: [summary]". However, the extracted text is discarded after generating the summary. The full document content is never sent to the AI edge function as context. This means the AI cannot answer follow-up questions about the file contents.

**Fix:** Include the extracted text (truncated to ~4000 chars) in the message sent to the AI, formatted as a system context block.

---

## 7. Conversation Title Race Condition

**File:** `src/hooks/useEnhancedAIChatDB.ts` (lines 402-420)

The title is set early (before the AI call) using `Promise.resolve(supabase.update(...)).then(...)`. This fire-and-forget pattern means:
- If the DB update fails, the conversation title in local state diverges from the database.
- The `.catch` only logs a warning but doesn't fix the state.

This is minor but can cause confusing behavior when conversations show "New Chat" in the sidebar after reload.

**Fix:** `await` the title update or add a retry on failure.

---

## 8. `handleAction` Toast Spam on Every Action

**File:** `src/hooks/useEnhancedAIChatDB.ts` (lines 619-624)

Every action execution shows a toast "Action Executed / Processing: [label]" with a 1-second duration. For deep dive prompts and navigation, this creates unnecessary toast spam that clutters the UI.

**Fix:** Remove the generic toast. Only show toasts for workflow actions and errors.

---

## 9. Missing `loadMessages` on Conversation Switch (Potential Double Load)

**File:** `src/hooks/useEnhancedAIChatDB.ts` (lines 1119-1126)

The `useEffect` on `activeConversation` calls `loadMessages(activeConversation)`. But `createConversation` already calls `setMessages([])`. When creating a new conversation and then the effect fires, it makes an unnecessary DB query for a conversation that has no messages yet.

**Fix:** Skip the `loadMessages` call for freshly created conversations (check message count or use a ref flag).

---

## Summary of Recommended Fixes (Priority Order)

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 5 | No SSE timeout / abort controller | High | Medium |
| 6 | File upload content not sent to AI | High | Medium |
| 2 | Sanitizer strips valid JSON | Medium | Small |
| 4 | Message edit doesn't regenerate AI response | Medium | Medium |
| 1 | Dead legacy code (`useAIChat`, old components) | Low | Small |
| 3 | Dead `enhancedAIService.processEnhancedMessage` | Low | Small |
| 8 | Toast spam on every action | Low | Small |
| 7 | Title update race condition | Low | Small |
| 9 | Unnecessary loadMessages on new conversation | Low | Small |

