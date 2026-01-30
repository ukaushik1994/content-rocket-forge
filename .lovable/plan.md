

# Streaming Implementation Plan for AI Chat

## What We're Building

We're going to make your AI chat respond **instantly** - word by word as the AI thinks, just like ChatGPT or Claude.

---

## Current State vs Goal

```text
TODAY (What You Experience)
┌─────────────────────────────────────────────┐
│  You: "Analyze my content performance"      │
│                                             │
│  [────────────  10-15 seconds  ─────────]   │
│       (blank screen, waiting...)            │
│                                             │
│  AI: [FULL RESPONSE APPEARS AT ONCE]        │
└─────────────────────────────────────────────┘

AFTER (What You'll Experience)  
┌─────────────────────────────────────────────┐
│  You: "Analyze my content performance"      │
│                                             │
│  AI: "Based on..." ← appears in 0.5 seconds │
│  AI: "Based on your data..." ← keeps typing │
│  AI: "Based on your data, I can see..."     │
│       (words flow naturally like typing)    │
│                                             │
│  [Charts appear when ready]                 │
└─────────────────────────────────────────────┘
```

---

## Implementation Overview

### What Needs to Change

| Component | Current | After |
|-----------|---------|-------|
| `enhanced-ai-chat` | Waits for full response | Streams tokens via SSE |
| `ai-proxy` | Returns complete JSON | Passes through AI provider stream |
| `useUnifiedChatDB` | Waits for response | Updates UI per token |
| Chat UI | Shows message when complete | Renders text progressively |

---

## Phase 1: Backend Streaming (Edge Functions)

### 1.1 Modify `ai-proxy/index.ts`

Add streaming handlers for each provider (OpenAI, OpenRouter, Anthropic, Gemini):

- Detect when `stream: true` is requested
- Instead of waiting for full response, return the raw SSE stream from the AI provider
- Pass through tokens as they arrive

### 1.2 Modify `enhanced-ai-chat/index.ts`

Add a new streaming mode:

- Accept `stream: true` parameter in request
- When streaming enabled:
  - Send context/charts separately via initial SSE event
  - Stream AI text response token-by-token
  - Send completion event with final metadata
- Keep existing non-streaming path as fallback

---

## Phase 2: Frontend Streaming

### 2.1 Modify `useUnifiedChatDB.ts`

Update the HTTP mode to support streaming:

- Detect when response is `text/event-stream`
- Parse SSE events line-by-line as they arrive
- Update the assistant message content progressively
- Handle charts/actions when they arrive in completion event

### 2.2 Update Message Rendering

Ensure `StreamingMessageBubble` and `EnhancedMessageBubble` handle:

- Partial content that's still being received
- Smooth text rendering without flickering
- Cursor/typing indicator while streaming

---

## Files to Create/Modify

| File | Change Type | Description |
|------|-------------|-------------|
| `supabase/functions/ai-proxy/index.ts` | Modify | Add streaming handlers per provider |
| `supabase/functions/enhanced-ai-chat/index.ts` | Modify | Add SSE streaming response mode |
| `src/hooks/useUnifiedChatDB.ts` | Modify | Add SSE parsing for streaming responses |
| `src/hooks/useStreamingAI.ts` | Modify | Update to use enhanced-ai-chat streaming |
| `src/components/ai-chat/StreamingMessageBubble.tsx` | Modify | Improve progressive rendering |

---

## How Streaming Will Work

```text
User sends message
       │
       ▼
┌──────────────────┐
│ Frontend sends   │
│ stream: true     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ enhanced-ai-chat │
│ edge function    │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐     ┌─────────────────┐
│ ai-proxy calls   │────▶│ OpenAI/etc with │
│ provider         │     │ stream: true    │
└────────┬─────────┘     └────────┬────────┘
         │                        │
         │◀───────────────────────┘
         │  (tokens flow back)
         ▼
┌──────────────────┐
│ SSE events sent  │
│ to frontend      │
│                  │
│ data: {"token"}  │
│ data: {"token"}  │
│ data: [DONE]     │
└────────┬─────────┘
         │
         ▼
┌──────────────────┐
│ UI updates       │
│ word by word     │
└──────────────────┘
```

---

## Technical Details

### SSE Event Format

```javascript
// Token event (sent many times)
data: {"type":"token","content":"Based "}

data: {"type":"token","content":"on "}

data: {"type":"token","content":"your "}

// Completion event (sent once at end)
data: {"type":"complete","visualData":[...],"actions":[...]}

// Done signal
data: [DONE]
```

### Frontend Parsing

```javascript
// Parse SSE line-by-line as bytes arrive
while ((newlineIndex = textBuffer.indexOf("\n")) !== -1) {
  let line = textBuffer.slice(0, newlineIndex);
  textBuffer = textBuffer.slice(newlineIndex + 1);
  
  if (!line.startsWith("data: ")) continue;
  
  const jsonStr = line.slice(6).trim();
  if (jsonStr === "[DONE]") break;
  
  const parsed = JSON.parse(jsonStr);
  if (parsed.type === "token") {
    // Append token to message content
    updateMessageContent(prev => prev + parsed.content);
  }
}
```

---

## Expected Results

| Metric | Before | After |
|--------|--------|-------|
| Time to first word | 5-15 seconds | Under 1 second |
| Perceived responsiveness | Slow, feels broken | Instant, natural |
| User experience | Frustrating wait | Engaging conversation |

---

## Rollout Safety

- **Fallback Mode**: If streaming fails, automatically fall back to current HTTP mode
- **Error Handling**: Graceful degradation if connection drops mid-stream
- **Cancel Support**: Users can stop generation mid-response
- **Provider Compatibility**: Works with all configured AI providers

---

## Summary

This implementation will transform your AI chat from a "wait and see" experience to a fluid, real-time conversation that feels as responsive as ChatGPT.

