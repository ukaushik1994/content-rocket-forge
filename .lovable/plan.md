

# AI Chat — Missing & Incomplete Features Audit

After reviewing the full frontend (components, hooks, context) and backend (edge function, tools), here is everything that is still missing, incomplete, or non-functional — beyond the bugs we already fixed.

---

## 1. No Markdown Rendering for AI Responses on Mobile Viewport

The current viewport is 411px. The `FormattedResponseRenderer` uses `SafeMarkdown` which works, but the message area uses `max-w-6xl` and `px-6` padding. On 411px screens, long tables, code blocks, and chart visualizations will overflow horizontally. There is no `overflow-x-auto` wrapper around the rendered markdown content or visual data.

**Fix:** Add `overflow-x-auto` to the content wrapper inside `EnhancedMessageBubble` and `FormattedResponseRenderer`.

---

## 2. File Upload Has No Backend Processing

`FileUploadHandler.tsx` uploads files to Supabase Storage and calls `enhancedFileAnalysisService` for client-side analysis. But the analysis result is just appended to the chat input as text — it's never sent to the AI as part of the conversation context. The user uploads a file, gets a local summary, but the AI has no awareness of the file content.

**Fix:** After file analysis, auto-send the extracted text/summary as a user message to the AI (or inject it into the conversation history as a system message).

---

## 3. Web Search Mode Toggle Does Nothing

`ContextAwareMessageInput` has a `webSearchMode` state and `onWebSearch` prop, but `EnhancedChatInterface` never passes `onWebSearch`. The `handleWebSearchClick` in `ContextAwareMessageInput` just toggles a local boolean that prepends `[Web Search] ` to the message. The backend SERP intelligence tools are triggered by query analysis, not by this prefix — so the toggle is cosmetic only.

**Fix:** Either wire `onWebSearch` from `EnhancedChatInterface` to explicitly trigger web search mode in the backend payload, or remove the toggle if backend auto-detects search intent.

---

## 4. Image Generation Tools Exist but No Frontend Trigger

The backend has `generate_image` and `edit_image` tools registered. `GeneratedImageCard.tsx` and `VisualDataRenderer.tsx` can render generated images. But there's no explicit UI to trigger image generation — users must type "generate an image of..." and hope the AI picks the right tool. The `PlusMenuDropdown` has no image generation option.

**Fix:** Add an "Image" option to `PlusMenuDropdown` that opens a prompt dialog or prefills the input with an image generation command.

---

## 5. Conversation Export Only Supports JSON

`exportConversation` creates a JSON blob. Users likely expect PDF or plain text export options. The `ExportDropdown.tsx` component exists but isn't wired into the conversation export flow.

**Fix:** Wire `ExportDropdown` into the chat header or conversation menu, offering JSON, TXT, and optionally PDF export formats.

---

## 6. No Conversation Rename UI

Conversations auto-title from the first message (truncated to 40 chars). There's no way for users to rename a conversation. The sidebar shows titles but has no edit/rename action in the dropdown menu.

**Fix:** Add a "Rename" option to the conversation dropdown in `ChatHistorySidebar` that opens an inline edit input or dialog.

---

## 7. Error Messages Don't Persist Retry Button on Reload (Partially Fixed)

We added `messageStatus` persistence to the `status` column. But the `loadMessages` function only maps `status: 'error'` → `messageStatus: 'error'`. The error message `content` is preserved, but the `actions` array (containing the Retry and API Settings buttons) is stored in `function_calls` column. Need to verify that `loadMessages` correctly restores the `actions` from `function_calls` for error messages.

**Fix:** Verify and fix `loadMessages` to parse `function_calls` JSON back into `actions` for error messages so the Retry button appears after reload.

---

## 8. `ContextDisplayIndicator` Shows Hardcoded 88% Confidence

In `EnhancedChatInterface.tsx` line 568:
```tsx
overallConfidence={88}
```
This is never updated. The context indicator is also never shown because `showContextIndicator` starts as `false` and is never set to `true`.

**Fix:** Either wire the context indicator to real data from the AI response (e.g., from `analystContext`), or remove the dead UI.

---

## 9. `ConversationAnalyticsModal` — Empty `onShowAnalytics` Handler

Line 447: `onShowAnalytics={() => {}}` — the analytics button in the search bar does nothing. `ConversationAnalyticsModal.tsx` exists but is never rendered.

**Fix:** Import and render `ConversationAnalyticsModal` when triggered, passing conversation data.

---

## 10. No Loading Skeleton When Switching Conversations

When the user clicks a different conversation in the sidebar, `loadMessages` fetches from DB. During this time, the chat area shows the previous conversation's messages briefly before swapping. There's no loading state between conversations.

**Fix:** Clear messages immediately on conversation switch and show a skeleton loader while `loadMessages` completes.

---

## 11. Analyst Panel Data Is Client-Side Only

The `useAnalystEngine` hook extracts topics from messages and builds cumulative state, but it's entirely derived from message text parsing. The backend sends `analystContext` in the SSE payload with real platform stats, but the frontend `VisualizationSidebar` only receives `analystState` from the client-side hook — it doesn't merge in the backend `analystContext`.

**Fix:** In `EnhancedChatInterface`, extract `analystContext` from the latest assistant message and merge it into the analyst panel data passed to `VisualizationSidebar`.

---

## Summary Table

| # | Issue | Impact | Effort |
|---|-------|--------|--------|
| 1 | Mobile content overflow | UX on mobile | Small |
| 2 | File upload not sent to AI | Feature broken | Medium |
| 3 | Web search toggle is cosmetic | Misleading UI | Small |
| 4 | No image generation UI trigger | Feature hidden | Small |
| 5 | Export only JSON | Limited utility | Medium |
| 6 | No conversation rename | Missing basic feature | Small |
| 7 | Error actions not restored on reload | Partial fix gap | Small |
| 8 | Hardcoded context indicator | Dead/misleading UI | Small |
| 9 | Analytics modal never shown | Dead UI | Small |
| 10 | No loading state on conversation switch | Janky UX | Small |
| 11 | Analyst panel ignores backend context | Feature incomplete | Medium |

---

## Recommended Implementation Order

**Phase 1 — Functional Gaps (Issues 2, 3, 7)**
Fix file upload → AI pipeline, remove/wire web search toggle, verify error action restoration.

**Phase 2 — Missing UX (Issues 1, 6, 10)**
Mobile overflow fix, conversation rename, conversation switch skeleton.

**Phase 3 — Feature Completion (Issues 4, 5, 8, 9, 11)**
Image gen trigger, export formats, clean up dead UI, wire analyst backend context.

