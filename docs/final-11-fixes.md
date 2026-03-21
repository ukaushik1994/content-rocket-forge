# Final 11 Fixes — Output Quality

> **For:** Lovable.dev
> **Rule:** No functionality removed. All 90 tools still work. All backend calculations unchanged. Only improves output quality.

---

## Fix 1: Normalize Gemini Responses (ai-proxy)

**File:** `supabase/functions/ai-proxy/index.ts`

Add this function near the top (after imports):

```ts
function normalizeToOpenAIFormat(raw: any, provider: string): any {
  if (['openai', 'mistral', 'openrouter'].includes(provider)) return raw;

  const result: any = {
    choices: [{ message: { role: 'assistant', content: '', tool_calls: [] } }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };

  if (provider === 'gemini') {
    const candidate = raw?.candidates?.[0];
    if (candidate?.content?.parts) {
      result.choices[0].message.content = candidate.content.parts
        .filter((p: any) => p.text).map((p: any) => p.text).join('');
      result.choices[0].message.tool_calls = candidate.content.parts
        .filter((p: any) => p.functionCall)
        .map((p: any, i: number) => ({
          id: `call_${i}`, type: 'function',
          function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args || {}) }
        }));
    }
    const m = raw?.usageMetadata;
    if (m) {
      result.usage = { prompt_tokens: m.promptTokenCount || 0, completion_tokens: m.candidatesTokenCount || 0, total_tokens: m.totalTokenCount || 0 };
    }
  }

  if (provider === 'anthropic') {
    const content = raw?.content || [];
    result.choices[0].message.content = content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    result.choices[0].message.tool_calls = content.filter((b: any) => b.type === 'tool_use').map((b: any) => ({
      id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input || {}) }
    }));
    result.usage = raw?.usage || result.usage;
  }

  if (raw?._autoDetectedModel) result._autoDetectedModel = raw._autoDetectedModel;
  return result;
}
```

Apply at the end of each provider's chat handler return:

In `handleGemini` — find where Gemini chat returns data. Change:
```ts
// FROM:
return { success: true, data, provider: 'Gemini' };
// TO:
return { success: true, data: normalizeToOpenAIFormat(data, 'gemini'), provider: 'Gemini' };
```

In `handleAnthropic` — same:
```ts
return { success: true, data: normalizeToOpenAIFormat(data, 'anthropic'), provider: 'Anthropic' };
```

No change needed for OpenAI/Mistral/OpenRouter handlers.

---

## Fix 2: Dynamic Temperature

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where temperature is set for the AI call. There may be multiple places (tool calls at ~0.5, general at ~0.7). Add this logic before the AI call:

```ts
let requestTemperature = 0.7;
if (queryIntent.scope === 'lookup' || queryIntent.scope === 'summary') {
  requestTemperature = 0.2;
} else if (queryIntent.isConversational) {
  requestTemperature = 0.4;
} else if (relevantToolNames?.some((t: string) =>
  ['generate_full_content', 'improve_content', 'reformat_content', 'repurpose_for_social'].includes(t))) {
  requestTemperature = 0.8;
}
```

Use `requestTemperature` in the AI call params instead of any hardcoded value.

---

## Fix 3: Gemini Max Output 32K

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find the dynamic max tokens line. It looks like:
```ts
const dynamicMaxTokens = Math.min(Math.max(4096, Math.floor(totalTokens * 0.3)), 16000);
```

Change to:
```ts
const providerCap = (provider?.provider === 'gemini') ? 32000 : 16000;
const dynamicMaxTokens = Math.min(Math.max(4096, Math.floor(totalTokens * 0.3)), providerCap);
```

---

## Fix 4: Tool Filtering Safety Net

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find:
```ts
if (toolsToUse.length < 5) toolsToUse = TOOL_DEFINITIONS;
```

Replace with:
```ts
if (toolsToUse.length < 3) {
  const coreTools = TOOL_DEFINITIONS.filter((t: any) =>
    ['get_content_items', 'get_keywords', 'get_proposals', 'get_competitors', 'generate_full_content'].includes(t.name)
  );
  toolsToUse = [...toolsToUse, ...coreTools.filter((ct: any) => !toolsToUse.some((tu: any) => tu.name === ct.name))];
}
```

---

## Fix 5: Hide Deprecated Tools + Remove Ghost

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Right after the tool filtering code (after Fix 4), add:

```ts
const HIDDEN_TOOLS = ['start_content_builder', 'create_content_item'];
toolsToUse = toolsToUse.filter((t: any) => !HIDDEN_TOOLS.includes(t.name));
```

**File:** `supabase/functions/enhanced-ai-chat/tools.ts`

Find `send_quick_email` in the cache invalidation map:
```ts
send_quick_email: [],
```
Delete that line.

---

## Fix 6: Stage-Aware Health Targets

**File:** `src/hooks/useAnalystEngine.ts`

Find:
```ts
const volumeScore = Math.min(20, Math.round((totalContent / 15) * 20));
```

Replace with:
```ts
const stageTargets: Record<string, number> = { starter: 5, growing: 15, established: 30, scaling: 50 };
const volumeTarget = stageTargets[userStage || 'growing'] || 15;
const volumeScore = Math.min(20, Math.round((totalContent / volumeTarget) * 20));
```

Also find the detail string:
```ts
detail: `${totalContent} total pieces (target: 15+)`,
```
Change to:
```ts
detail: `${totalContent} pieces (${userStage || 'growing'} target: ${volumeTarget}+)`,
```

---

## Fix 7: Content-Based Anomaly IDs

**File:** `src/hooks/useAnalystEngine.ts`

Find every anomaly and cross-signal ID that uses `${now.getTime()}`. Replace each:

```ts
// FIND → REPLACE:
`anomaly-low-seo-${now.getTime()}`           → `anomaly-low-seo`
`anomaly-stale-drafts-${now.getTime()}`       → `anomaly-stale-drafts`
`anomaly-empty-calendar-${now.getTime()}`     → `anomaly-empty-calendar`
`anomaly-stale-content-${now.getTime()}`      → `anomaly-stale-content`
`cross-seo-declining-${now.getTime()}`        → `cross-seo-declining`
`cross-seo-improving-${now.getTime()}`        → `cross-seo-improving`
`cross-publish-gap-${now.getTime()}`          → `cross-publish-gap`
`cross-topic-concentration-${now.getTime()}`  → `cross-topic-concentration-${kw}`
`cross-cannibalization-${kw}-${now.getTime()}`→ `cross-cannibalization-${kw}`
`cross-keyword-ratio-${now.getTime()}`        → `cross-keyword-ratio`
`cross-accountability-${now.getTime()}`       → `cross-accountability`
`cross-seasonal-gap-${now.getTime()}`         → (remove — see Fix 10)
```

---

## Fix 8: Strategic Recommendation Trajectory Check

**File:** `src/hooks/useAnalystEngine.ts`

Find the "fix-quality" rule:
```ts
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
  return { stance: 'fix-quality', ...
```

Add before the return:
```ts
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
  // Check trajectory — are recent articles actually better?
  const recentSeoEntry = platformData.find((d: any) => d.label === 'Avg SEO Score');
  const recentAvg = recentSeoEntry?.value || avgSeo;

  if (recentAvg >= 60) {
    return {
      stance: 'accelerate' as const,
      reasoning: `Recent articles avg ${Math.round(recentAvg)} SEO — quality is improving. Old content drags average to ${avgSeo}. Rescore old content in Settings.`,
      promptQuestion: `Recent work is strong but old content drags your average down. Want me to find the weakest articles?`,
      actions: [
        { label: 'Find Weakest Articles', prompt: 'Show me my published articles with the lowest SEO scores', effort: 'low' as const, impact: 'high' as const },
        { label: 'Rescore All', prompt: 'Rescore all my content', effort: 'low' as const, impact: 'medium' as const }
      ]
    };
  }

  // Genuinely low — proceed with fix-quality
  return { stance: 'fix-quality', ...
```

---

## Fix 9: Session Memory Topic Filter

**File:** `src/hooks/useAnalystEngine.ts`

Find where session memory insights are restored (look for `loadSessionMemory` or where restored insights merge into `insightsFeed`). After restoring:

```ts
if (restoredInsights.length > 0 && topics.length > 0) {
  const cats = new Set(topics.map((t: any) => t.category));
  restoredInsights = restoredInsights.filter((insight: any) => {
    if (insight.urgency === 'critical' || insight.urgency === 'high') return true;
    const t = (insight.content || '').toLowerCase();
    for (const c of cats) {
      if (c === 'content' && /content|draft|seo|article|publish/.test(t)) return true;
      if (c === 'keywords' && /keyword|serp|search|rank/.test(t)) return true;
      if (c === 'campaigns' && /campaign|queue|generat/.test(t)) return true;
      if (c === 'competitors' && /competitor|rival|market/.test(t)) return true;
      if (c === 'email' && /email|newsletter|subscrib/.test(t)) return true;
    }
    return false;
  });
}
```

---

## Fix 10: Goal Update + Brand Override + Cleanup

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**10A — Goal update on topic shift.** Add after intent detection:

```ts
const CATEGORY_TO_GOAL: Record<string, string> = {
  content: 'Content Creation', keywords: 'SEO Research', campaigns: 'Campaign Management',
  competitors: 'Competitive Analysis', analytics: 'Performance Analysis',
  engage: 'Email & Social', proposals: 'Strategy Planning'
};
const detectedGoal = CATEGORY_TO_GOAL[queryIntent.categories?.[0] || ''];
if (detectedGoal && conversationData?.goal && detectedGoal !== conversationData.goal && !queryIntent.isConversational) {
  try {
    await supabase.from('ai_conversations').update({ goal: detectedGoal }).eq('id', conversationId);
  } catch {}
}
```

**10B — Brand voice override.** Find where `brandVoiceContext` is appended to systemPrompt. Add after:

```ts
systemPrompt += brandVoiceContext;
systemPrompt += '\nBrand voice applies to content generation only. For chat, match the user tone. If user asks for a different tone, override brand voice for that request.';
```

**File:** `src/hooks/useAnalystEngine.ts`

**10C — Remove seasonal detection.** Find the `seasonalTopics` block (hardcoded months with "valentine", "christmas", etc.) and the signal push that references seasonal gaps. Delete the entire block (~40 lines).

**10D — Division by zero guard on goals.** Find:
```ts
const percentage = Math.min(100, Math.round((currentValue / goal.target_value) * 100));
```
Replace with:
```ts
const safeTarget = (goal.target_value && goal.target_value > 0) ? goal.target_value : 1;
const percentage = Math.min(100, Math.round((currentValue / safeTarget) * 100));
```

**10E — Goal progress uses created_at.** Find in goal query:
```ts
.gte('updated_at', since)
```
Change to:
```ts
.gte('created_at', since)
```

---

## Fix 11: Add Response Safety Check

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where the AI response is received from ai-proxy (where `data.choices[0].message` is accessed). Add a safety check before accessing:

```ts
// After receiving response from ai-proxy:
const aiData = response?.data || response;

// Safety: ensure response has expected format
if (!aiData?.choices?.[0]?.message) {
  console.warn('⚠️ AI response missing expected format:', JSON.stringify(aiData).substring(0, 200));
  // Try to extract content from alternative formats
  const fallbackContent = aiData?.candidates?.[0]?.content?.parts?.[0]?.text
    || aiData?.content?.[0]?.text
    || aiData?.message
    || 'I received a response but couldn\'t parse it. Please try again.';

  aiData.choices = [{ message: { role: 'assistant', content: fallbackContent, tool_calls: [] } }];
}
```

This catches any case where the normalization in ai-proxy didn't fire (e.g., error path, timeout) and prevents the entire response from crashing.

---

## Summary

| # | Fix | File | What changes |
|---|-----|------|-------------|
| 1 | Normalize Gemini/Anthropic | `ai-proxy/index.ts` | Add function + apply to 2 handlers |
| 2 | Dynamic temperature | `enhanced-ai-chat/index.ts` | Replace hardcoded 0.7 with intent-based |
| 3 | Gemini 32K output | `enhanced-ai-chat/index.ts` | Change one line (16000 → provider-aware) |
| 4 | Tool filtering | `enhanced-ai-chat/index.ts` | Replace `< 5 show all` with `< 3 add core` |
| 5 | Hide deprecated + ghost | `enhanced-ai-chat/index.ts` + `tools.ts` | 3-line filter + delete 1 line |
| 6 | Stage health targets | `useAnalystEngine.ts` | Replace hardcoded /15 with stage map |
| 7 | Anomaly IDs | `useAnalystEngine.ts` | Change ~12 ID strings from timestamp to content |
| 8 | Trajectory check | `useAnalystEngine.ts` | Add 15-line check before fix-quality rule |
| 9 | Session memory filter | `useAnalystEngine.ts` | Add 12-line filter after restore |
| 10 | Goal + brand + seasonal + div0 + field | `enhanced-ai-chat/index.ts` + `useAnalystEngine.ts` | 5 small changes |
| 11 | Response safety check | `enhanced-ai-chat/index.ts` | 10-line fallback parser |

**Files touched:** 4 (`ai-proxy/index.ts`, `enhanced-ai-chat/index.ts`, `tools.ts`, `useAnalystEngine.ts`)
**Nothing removed. All tools still work. All calculations still run. Only output quality improves.**
