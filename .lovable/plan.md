

# Fix: Content Wizard Not Receiving Keyword from Chat

## Problem

When a user says "I want to create a blog about AI trends", the intent detector correctly extracts `{ keyword: "AI trends" }` via `extractParams`. However, this data is **never sent** to the backend. The tool hint message is just:

```
"Please execute the action I requested. Tool hint: launch_content_wizard"
```

The AI then calls `launch_content_wizard` but has to guess the keyword from earlier conversation context -- often resulting in an empty or wrong keyword. This causes:
- Error 1: `api-proxy` gets an empty keyword for SERP analysis
- Error 2: Downstream `ai-proxy` calls fail when the wizard renders with no keyword

## Fix

Include the extracted params directly in the tool hint message so the AI passes them to the tool call.

### File 1: `src/hooks/useUnifiedChatDB.ts` (~line 844)

Change the tool hint from:
```
`Please execute the action I requested. Tool hint: ${actionIntent.toolName}`
```
To:
```
`Please execute the action I requested. Tool hint: ${actionIntent.toolName}${actionIntent.params ? ` with params: ${JSON.stringify(actionIntent.params)}` : ''}`
```

### File 2: `src/hooks/useEnhancedAIChatDB.ts` (~line 508)

Same change as above -- this is the other chat hook that also sends tool hints.

### File 3: `src/utils/actionIntentDetector.ts` (~line 375-378)

The `extractParams` for `launch_content_wizard` currently returns empty `{}` when no topic preposition ("about/on/for") is found. Improve it to also try extracting the keyword from other common patterns (e.g., "create a blog on machine learning", "write an article titled X"):

```typescript
extractParams: (msg) => {
  // Try "about/on/for [topic]"
  const topicMatch = msg.match(/(?:about|on|for)\s+["']?(.+?)["']?\s*$/i);
  if (topicMatch) return { keyword: topicMatch[1].trim() };
  // Try extracting topic after content type word
  const fallback = msg.match(/(?:blog|article|guide|content)\s+(?:about|on|for|titled|called)?\s*["']?(.+?)["']?\s*$/i);
  if (fallback) return { keyword: fallback[1].trim() };
  return {};
}
```

## Summary

| File | Change |
|------|--------|
| `src/hooks/useUnifiedChatDB.ts` | Include `actionIntent.params` in tool hint message |
| `src/hooks/useEnhancedAIChatDB.ts` | Same param inclusion in tool hint |
| `src/utils/actionIntentDetector.ts` | Improve keyword extraction fallback |

Total: ~5 lines changed across 3 files. This ensures the keyword always reaches the wizard, which then correctly calls the SERP API with the user's configured keys.
