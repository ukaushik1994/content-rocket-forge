# AI Response Confusion — Fix Plan

> **Created:** 2026-03-21
> **For:** Lovable.dev implementation
> **Scope:** 35 identified confusion sources, organized by root cause
> **Rule:** Backend-only changes to `enhanced-ai-chat/index.ts` and `ai-proxy/index.ts`. No frontend disruption.

---

## SIX ROOT PROBLEMS → SIX FIXES

| # | Root Problem | Issues it fixes | Time |
|---|-------------|----------------|------|
| 1 | No priority hierarchy when instructions conflict | #4, 5, 6, 7, 10, 12, 29 | 15 min |
| 2 | Too many tools visible (89) | #2, 8, 9, 13, 14, 21, 22 | 30 min |
| 3 | Provider differences not abstracted | #17, 18, 19, 27 | 20 min |
| 4 | No tool result formatting rules | #1, 23, 24, 25, 33, 34 | 15 min |
| 5 | Stale/wrong context during conversation | #28, 30, 31, 32 | 20 min |
| 6 | Temperature wrong for task type | #20, 26 | 10 min |

**Total: ~2 hours. All backend. No frontend changes.**

---

## FIX 1: Add Priority Hierarchy to System Prompt (15 min)

**What it fixes:** When multiple instructions conflict (response length, tone, chart vs no chart, tool vs ask first), the AI has no rule for which one wins.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Where:** At the very top of the system prompt, BEFORE the base prompt. This must be the first thing the AI reads.

**Add this block as the very first content in systemPrompt:**

```ts
const PRIORITY_RULES = `## PRIORITY RULES (override everything below when conflicts arise)

When instructions in this prompt conflict, follow this order — higher beats lower:

1. **CURRENT USER MESSAGE** — what the user is asking RIGHT NOW always wins
   - If user says "give me detail" but calibration says BRIEF → give detail
   - If user says "casual tone" but brand voice says "professional" → use casual for this response
   - If user says "just tell me" but pushback says "ask first" → just tell them

2. **TOOL RESTRICTIONS** — never call a tool that doesn't exist or is unconfigured
   - If service status says SERP is unconfigured → don't call SERP tools even if they're in the tool list
   - If a tool returns an error → tell the user, don't retry silently

3. **RESPONSE CALIBRATION** — urgency/scope detection
   - But user intelligence profile overrides for recurring preferences (e.g., "user always wants brief")

4. **TASK PERSONA** — adopt the detected persona
   - But brand voice overrides tone ONLY for content generation, not for chat responses

5. **BASE PROMPT** — general instructions (lowest priority)

### CHART DECISION TREE (replaces all conflicting chart rules):
- 3+ data points → generate chart
- 1-2 data points → show as metric cards in text (no chart)
- 0 data points → explain what's missing and how to get data (no chart)
- User explicitly asks for table → use tableData format
- User explicitly asks for chart → generate chart even with 1-2 points

### TOOL CALLING DECISION TREE (replaces all conflicting tool rules):
- READ query ("show me", "how many", "what's my") → call tool immediately, no questions
- WRITE query, simple ("create a draft about X") → call tool immediately
- WRITE query, ambiguous ("make content") → ask ONE clarifying question, then execute
- WRITE query, destructive (delete, publish) → require confirmation via requiresConfirmation
- MULTI-STEP query → explain the steps, then execute first step, ask before continuing

`;
```

Add this to the prompt assembly:
```ts
// At the very start of prompt building:
let systemPrompt = PRIORITY_RULES;
systemPrompt += BASE_PROMPT;
// ... rest of assembly
```

**Frontend:** No changes.

---

## FIX 2: Reduce Tools Per Request + Fix Overlaps (30 min)

### 2A — Remove the "< 5 tools → show all" safety net

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find the safety net (~line 3202):
```ts
if (toolsToUse.length < 5) toolsToUse = TOOL_DEFINITIONS;
```

**Replace with:**
```ts
// If intent filtering returns few tools, that's fine — AI will ask if it needs something else
// Don't flood with 89 tools. Minimum 3 is enough.
if (toolsToUse.length < 3) {
  // Add just the core read tools as safety net
  const coreReadTools = TOOL_DEFINITIONS.filter(t =>
    ['get_content_items', 'get_keywords', 'get_proposals'].includes(t.name)
  );
  toolsToUse = [...toolsToUse, ...coreReadTools];
}
```

### 2B — Consolidate overlapping content creation tools

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

In the prompt, BEFORE the tool definitions are injected, add a disambiguation block:

```ts
const TOOL_DISAMBIGUATION = `## TOOL SELECTION RULES (read before calling any tool)

### Content Creation — use ONLY these:
- User wants AI to write automatically → \`generate_full_content\` (saves as draft)
- User wants guided wizard with SERP research → \`launch_content_wizard\` (opens sidebar)
- NEVER use \`start_content_builder\` or \`create_content_item\` for content creation requests
- When in doubt between auto-generate and wizard → ask: "Want me to write it directly, or use the guided wizard with SERP analysis?"

### Email — follow this sequence:
- Convert article to email → \`content_to_email\` (creates campaign draft)
- Create email from scratch → \`create_email_campaign\` (draft)
- Send/schedule existing campaign → \`send_email_campaign\`
- NEVER chain create+send silently. Always show the draft first.

### Social Posts:
- Generate from article → \`repurpose_for_social\` (generates text)
- Then schedule → \`schedule_social_from_repurpose\` (sets date)
- These are always 2 steps. Tell the user: "Posts generated. Want me to schedule them?"

### Content Improvement:
- General improvement ("make better", "improve SEO") → \`improve_content\`
- Specific format change ("shorter", "more casual", "add bullets") → \`reformat_content\`

### Proposals vs Recommendations:
- \`accept_proposal\` → creates a calendar item (has side effect)
- \`accept_recommendation\` → just marks accepted (no side effect)

### Campaigns:
- New campaign from scratch → \`create_campaign\`
- Campaign from existing content → \`promote_content_to_campaign\`
`;

systemPrompt += TOOL_DISAMBIGUATION;
```

### 2C — Remove or hide `send_quick_email` reference

**File:** `supabase/functions/enhanced-ai-chat/tools.ts`

Find `send_quick_email` in the cache invalidation map (~line 551). Remove it:

```ts
// DELETE this line:
send_quick_email: [],
```

If there's a tool definition for it anywhere, remove that too. This tool has no handler.

### 2D — Hide redundant tools from AI

**File:** `supabase/functions/enhanced-ai-chat/tools.ts`

In the tool filtering logic, always exclude these redundant tools (they have better alternatives):

```ts
const HIDDEN_TOOLS = [
  'start_content_builder',  // Use launch_content_wizard instead
  'create_content_item',    // Use generate_full_content instead (unless user provides raw content)
];

// In the filtering function:
toolsToUse = toolsToUse.filter(t => !HIDDEN_TOOLS.includes(t.name));
```

**Frontend:** No changes.

---

## FIX 3: Normalize Provider Differences (20 min)

### 3A — Strip thinking tags for non-Anthropic providers

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where `THINKING_INSTRUCTION` is injected into the prompt. It should ONLY be added for Anthropic:

```ts
// Find the thinking instruction injection and wrap it:
if (provider.provider === 'anthropic') {
  systemPrompt = systemPrompt.replace('{THINKING_INSTRUCTION}', THINKING_INSTRUCTION);
} else {
  // Remove thinking instruction entirely for non-Anthropic
  systemPrompt = systemPrompt.replace('{THINKING_INSTRUCTION}', '');
}
```

If the thinking instruction is always added (not via placeholder), find it and wrap:
```ts
if (provider.provider === 'anthropic') {
  systemPrompt += THINKING_INSTRUCTION;
}
// Don't add for Gemini, OpenAI, etc.
```

### 3B — Normalize tool call responses in ai-proxy

**File:** `supabase/functions/ai-proxy/index.ts`

After each provider handler returns, normalize the response format so `enhanced-ai-chat` gets a consistent shape regardless of provider:

```ts
// Add after every provider's chat handler returns:
function normalizeResponse(providerResponse: any, provider: string): any {
  // Ensure consistent shape
  const normalized: any = {
    choices: [{
      message: {
        role: 'assistant',
        content: '',
        tool_calls: []
      }
    }],
    usage: {
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0
    }
  };

  if (provider === 'gemini') {
    const candidate = providerResponse?.candidates?.[0];
    if (candidate?.content?.parts) {
      // Text content
      const textParts = candidate.content.parts.filter((p: any) => p.text);
      normalized.choices[0].message.content = textParts.map((p: any) => p.text).join('');

      // Function calls
      const funcParts = candidate.content.parts.filter((p: any) => p.functionCall);
      normalized.choices[0].message.tool_calls = funcParts.map((p: any, i: number) => ({
        id: `call_${i}`,
        type: 'function',
        function: {
          name: p.functionCall.name,
          arguments: JSON.stringify(p.functionCall.args || {})
        }
      }));
    }
    // Usage
    const meta = providerResponse?.usageMetadata;
    if (meta) {
      normalized.usage.prompt_tokens = meta.promptTokenCount || 0;
      normalized.usage.completion_tokens = meta.candidatesTokenCount || 0;
      normalized.usage.total_tokens = meta.totalTokenCount || 0;
    }
  } else if (provider === 'anthropic') {
    // Anthropic already close to OpenAI format but check tool_use blocks
    const content = providerResponse?.content || [];
    const textBlocks = content.filter((b: any) => b.type === 'text');
    const toolBlocks = content.filter((b: any) => b.type === 'tool_use');

    normalized.choices[0].message.content = textBlocks.map((b: any) => b.text).join('');
    normalized.choices[0].message.tool_calls = toolBlocks.map((b: any) => ({
      id: b.id,
      type: 'function',
      function: {
        name: b.name,
        arguments: JSON.stringify(b.input || {})
      }
    }));
    normalized.usage = providerResponse?.usage || normalized.usage;
  } else {
    // OpenAI, Mistral, OpenRouter — already in correct format
    return providerResponse;
  }

  // Carry over auto-detected model info
  if (providerResponse._autoDetectedModel) {
    normalized._autoDetectedModel = providerResponse._autoDetectedModel;
  }

  return normalized;
}
```

Apply at the end of each provider's chat handler:
```ts
// In handleGemini chat, before returning:
return normalizeResponse(data, 'gemini');

// In handleAnthropic chat:
return normalizeResponse(data, 'anthropic');
```

### 3C — Increase max output tokens for complex responses

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find the dynamic token limit (~line 3087):
```ts
const dynamicMaxTokens = Math.min(
  Math.max(4096, Math.floor(totalTokens * 0.3)),
  16000
);
```

**Change to:**
```ts
// Gemini supports up to 65K output tokens, OpenAI up to 16K
const providerOutputLimit = provider.provider === 'gemini' ? 32000 : 16000;

const dynamicMaxTokens = Math.min(
  Math.max(4096, Math.floor(totalTokens * 0.3)),
  providerOutputLimit
);
```

This prevents truncated responses when the AI generates a chart config + insights + actions in a single response.

**Frontend:** No changes.

---

## FIX 4: Tool Result Formatting Rules + Fix Ghost Tool (15 min)

### 4A — Add tool result presentation rules to prompt

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Add this block after the TOOL_DISAMBIGUATION block:

```ts
const TOOL_RESULT_RULES = `## HOW TO PRESENT TOOL RESULTS

When a tool returns data, follow these rules:

### Success results:
- Lead with the key finding, not the raw data: "You have 23 articles, 15 published" not "{success: true, data: [...]}"
- NEVER dump raw JSON to the user
- Format numbers with commas: 12,500 not 12500
- Show SEO scores as "X/100"
- Show percentages with one decimal: "45.2%"
- For content items: show title, status, and SEO score — skip IDs and metadata
- For keyword data: show keyword, volume, difficulty — skip internal fields
- If more than 5 items: show top 5 and say "and X more"

### Error results:
- If tool returns {success: false}: tell the user what went wrong in plain language
- NEVER retry the same tool with same parameters silently
- Suggest what the user can do: "This keyword wasn't found. Try a different spelling or add it first."
- If the error is about missing configuration: say exactly what to configure and where

### HTML content in results:
- When displaying content titles/excerpts from tool results, strip HTML tags
- NEVER echo raw HTML tags in your response text
- When referencing article content, summarize — don't paste the full HTML

### Data from previous messages:
- If the user asks about data that was already fetched earlier in this conversation, reference it: "Based on what we looked at earlier..."
- Only re-fetch if the user explicitly says "refresh", "update", or "check again"
`;

systemPrompt += TOOL_RESULT_RULES;
```

### 4B — Add tool capability boundaries

Add this to the same block:

```ts
const TOOL_BOUNDARIES = `## WHAT YOU CANNOT DO (do not promise these)

- You cannot track real-time Google rankings (no rank tracker connected)
- You cannot post directly to social media platforms (posts are saved as drafts)
- You cannot run A/B tests on content
- You cannot access the user's Google Analytics unless they've configured it in Settings
- You cannot send emails unless Resend is configured in Settings
- You cannot publish to websites unless WordPress/Wix is connected in Settings
- You cannot generate video (video tools exist but require separate API keys)

If a user asks for something you can't do, say so honestly and suggest the closest alternative.
`;

systemPrompt += TOOL_BOUNDARIES;
```

**Frontend:** No changes.

---

## FIX 5: Fix Stale Context During Conversations (20 min)

### 5A — Update conversation goal when topic changes

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where the conversation goal is fetched and injected. Currently it's set once (on first message) and never updated.

Add goal re-detection when the query intent changes significantly:

```ts
// After intent detection, check if goal should update
const currentGoal = conversationData?.goal;
const detectedCategory = queryIntent.categories?.[0] || 'general';

const CATEGORY_TO_GOAL: Record<string, string> = {
  content: 'Content Creation',
  keywords: 'SEO Research',
  campaigns: 'Campaign Management',
  competitors: 'Competitive Analysis',
  analytics: 'Performance Analysis',
  engage: 'Email & Social',
  proposals: 'Strategy Planning'
};

const newGoal = CATEGORY_TO_GOAL[detectedCategory];
if (newGoal && currentGoal && newGoal !== currentGoal) {
  // Topic shifted — update goal
  try {
    await supabase.from('ai_conversations')
      .update({ goal: newGoal })
      .eq('id', conversationId);
  } catch { /* non-blocking */ }
}
```

### 5B — Brand voice is overridable per request

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Where brand voice is injected into the prompt, add an override note:

```ts
// Change from just injecting brand voice:
systemPrompt += brandVoiceContext;

// Change to:
systemPrompt += brandVoiceContext;
systemPrompt += '\nNote: Brand voice applies to CONTENT GENERATION only. For chat responses, match the user\'s tone. If the user asks for a specific tone (e.g., "write this casually"), override brand voice for that request.';
```

### 5C — Refresh data context for long conversations

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where the real data context is built. Add a freshness check:

```ts
// Before injecting real data context, add a staleness note if conversation is long
const messageCount = conversationMessages.length;
if (messageCount > 10) {
  systemPrompt += `\n\n**DATA FRESHNESS NOTE**: This conversation has ${messageCount} messages. Data counts shown below were fetched at request time and reflect the CURRENT state, but any data shown in PREVIOUS messages may be outdated. If the user created/deleted content during this conversation, always re-fetch before answering.`;
}
```

### 5D — Tell the AI what the user can see

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

The request from the frontend can include sidebar state. If it does, inject it:

```ts
// If the request includes UI state context:
if (requestBody.uiContext) {
  const ctx = requestBody.uiContext;
  let uiNote = '\n\n## USER SCREEN CONTEXT\n';
  if (ctx.analystOpen) uiNote += '- Analyst sidebar is open (user can see health scores and insights)\n';
  if (ctx.wizardOpen) uiNote += '- Content Wizard is open in the sidebar\n';
  if (ctx.currentPage) uiNote += `- User is on the ${ctx.currentPage} page\n`;
  systemPrompt += uiNote;
}
```

**Frontend — small addition needed:** `src/hooks/useEnhancedAIChatDB.ts`

In the `sendMessage` function, include UI context in the request body:

```ts
body: JSON.stringify({
  messages: messagesToSend,
  context: contextPayload,
  // Add UI context
  uiContext: {
    analystOpen: analystActiveRef.current || false,
    wizardOpen: false, // set from props if wizard sidebar is open
    currentPage: window.location.pathname
  }
})
```

This is the ONE frontend change in this plan. It adds 3 fields to the existing request body — no UI changes.

---

## FIX 6: Temperature Per Task Type (10 min)

### 6A — Use temperature 0 for tool selection, 0.7 for generation

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where the AI call is made with temperature parameter. Change it to be dynamic:

```ts
// Determine temperature based on what the AI is doing
let temperature = 0.7; // Default for content/chat

// Use low temperature for tool calling and data queries
if (queryIntent.scope === 'lookup' || queryIntent.isToolCall) {
  temperature = 0.1; // Near-deterministic for tool selection
} else if (queryIntent.categories?.includes('content') && toolsToCall?.includes('generate_full_content')) {
  temperature = 0.8; // More creative for content generation
} else if (queryIntent.isConversational) {
  temperature = 0.5; // Balanced for chat
}

// Pass to AI call
const aiParams = {
  messages: messagesToSend,
  temperature: temperature,
  max_tokens: dynamicMaxTokens,
  // ... other params
};
```

### 6B — Pass temperature through to ai-proxy

**File:** `supabase/functions/ai-proxy/index.ts`

Make sure temperature from the caller is respected, not overridden:

```ts
// In each provider's chat handler, use the passed temperature:
const requestBody = {
  // ...
  temperature: params.temperature ?? 0.7,  // Use caller's temperature, fallback to 0.7
};
```

Check that ALL provider handlers (handleOpenAI, handleGemini, handleAnthropic, handleMistral, handleOpenRouter) use `params.temperature` not a hardcoded value.

**Frontend:** No changes (beyond the uiContext addition in Fix 5D).

---

## WHAT THIS DOESN'T FIX (and why)

| Issue | Why Not Now |
|-------|-----------|
| Platform knowledge duplication | Low impact — only ~200 extra tokens. Fix when optimizing prompt size. |
| Service status vs tool list conflict | The TOOL_BOUNDARIES section (Fix 4B) addresses this more simply. |
| Pinned message staleness | Per-conversation, user-controlled. Not a systemic issue. |
| Number formatting consistency | TOOL_RESULT_RULES (Fix 4A) covers this. AI will follow the rules. |
| File upload text truncation | 4000 chars is a reasonable limit. Surfacing this to user was done in earlier plan. |

---

## VERIFICATION CHECKLIST

After implementation, test these scenarios:

- [ ] **Priority test:** Send "give me detail about my content" when response calibration is BRIEF → should give detail (user intent wins)
- [ ] **Chart decision:** Ask "how many articles do I have?" (1 number) → should NOT generate chart, just text
- [ ] **Chart decision:** Ask "compare my articles by SEO score" (10+ items) → SHOULD generate chart
- [ ] **Tool selection:** Say "write me a blog post about X" → should call `generate_full_content` OR ask wizard/auto choice — NOT `start_content_builder`
- [ ] **Tool error:** Delete a content item, then ask "show me that article" → AI should say "not found" clearly
- [ ] **Email flow:** Say "email this article to subscribers" → should call `content_to_email`, show draft, NOT auto-send
- [ ] **Gemini tool calls:** Say "show me my keywords" with Gemini → tool should execute and return data (not silently fail)
- [ ] **Thinking tags:** With Gemini active, AI should NOT output `<think>` tags in visible response
- [ ] **Temperature:** Ask "how many articles do I have?" twice → should get same answer both times (low temperature for lookups)
- [ ] **Brand voice override:** With professional brand voice, say "write a casual tweet" → should be casual
- [ ] **Stale context:** Create content mid-conversation, then ask "how many articles?" → should show updated count
- [ ] **Mixed intent:** Ask "compare my keywords with competitor strengths" → should handle both aspects

---

## SUMMARY

| Fix | What | Files | Time |
|-----|------|-------|------|
| 1 | Priority hierarchy + decision trees | `enhanced-ai-chat/index.ts` | 15 min |
| 2 | Reduce tools + disambiguation + remove ghost tool | `enhanced-ai-chat/index.ts`, `tools.ts` | 30 min |
| 3 | Normalize providers + thinking tags + output tokens | `ai-proxy/index.ts`, `enhanced-ai-chat/index.ts` | 20 min |
| 4 | Tool result rules + capability boundaries | `enhanced-ai-chat/index.ts` | 15 min |
| 5 | Goal update + brand voice override + freshness + UI context | `enhanced-ai-chat/index.ts`, `useEnhancedAIChatDB.ts` | 20 min |
| 6 | Dynamic temperature per task | `enhanced-ai-chat/index.ts`, `ai-proxy/index.ts` | 10 min |
| **Total** | **6 fixes** | **4 files** | **~2 hours** |

**After this:** The AI has clear rules for every conflict, sees only relevant tools, handles Gemini correctly, presents results consistently, works with fresh context, and uses appropriate creativity levels per task.
