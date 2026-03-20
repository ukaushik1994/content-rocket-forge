

# Fix: AI Chat — Response Parsing + Bad Request + userId Error

## Diagnosis

**Your API key is fine.** The Gemini API is responding successfully (the logs show `✅ Gemini chat successful` with valid content). There are 3 bugs on our side preventing the response from reaching you:

### Bug 1: Response format mismatch (root cause of "No response content received")
- `chatGemini()` in `ai-proxy` returns raw Gemini format: `candidates[0].content.parts[0].text`
- `enhanced-ai-chat` expects OpenAI format: `choices[0].message.content`
- Result: AI responds, but our code can't find the text → "No response from AI"

### Bug 2: Tool calls cause "Bad Request"
- When `enhanced-ai-chat` sends OpenAI-format `tools` and `tool_choice` params, `chatGemini()` passes them through to Gemini's API which doesn't understand that format → 400 Bad Request

### Bug 3: `userId is not defined` at line 2100
- Code uses `userId` but the variable in scope is `user.id`

---

## Fix Plan

### 1. Normalize Gemini response to OpenAI format (ai-proxy/index.ts, `chatGemini`)

After `const data = await response.json()`, convert to OpenAI format before returning:

```typescript
const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
const normalizedData = {
  choices: [{
    message: {
      role: 'assistant',
      content: text,
      tool_calls: null  // Gemini function calls handled separately
    }
  }],
  usage: {
    prompt_tokens: data?.usageMetadata?.promptTokenCount || 0,
    completion_tokens: data?.usageMetadata?.candidatesTokenCount || 0,
    total_tokens: data?.usageMetadata?.totalTokenCount || 0
  }
};
return { success: true, data: normalizedData, provider: 'Gemini' };
```

### 2. Convert OpenAI tools format to Gemini function declarations (ai-proxy/index.ts, `chatGemini`)

Before sending to Gemini API, convert `params.tools` to Gemini's `tools` format and `params.tool_choice` to `toolConfig`. Also handle Gemini function call responses by mapping them back to OpenAI `tool_calls` format.

### 3. Fix userId reference (enhanced-ai-chat/index.ts, line 2100)

Change `.eq('user_id', userId)` → `.eq('user_id', user.id)`

---

## Files Changed

| File | Change |
|------|--------|
| `supabase/functions/ai-proxy/index.ts` | Normalize Gemini responses to OpenAI format; convert tools/tool_choice to Gemini format |
| `supabase/functions/enhanced-ai-chat/index.ts` | Fix `userId` → `user.id` at line 2100 |

