# AI Chat + Analyst — Definitive Implementation Plan

> **Created:** 2026-03-21
> **For:** Lovable.dev implementation
> **Scope:** 19 remaining items — every AI chat and analyst confusion, organized by how users actually use the tool
> **Rule:** Every item has exact file paths, exact code, and a test. No ambiguity.

---

## HOW USERS USE THE CHAT + ANALYST (and what breaks)

| User Pattern | What Breaks | Fixes |
|-------------|-------------|-------|
| Asks data question ("how many articles?") | AI might generate unnecessary chart for 1 number, or call wrong tool | Phase 1 (priority rules, chart decision tree) |
| Asks AI to write content | AI picks wrong tool from 4 options | Phase 1 (tool disambiguation) |
| Asks about emailing/social | AI chains tools silently or picks wrong email tool | Phase 1 (tool disambiguation) |
| Gets tool result back | AI dumps raw JSON or shows HTML tags | Phase 1 (result formatting rules) |
| Asks "can you do X?" | AI promises things it can't do (rankings, social posting) | Phase 1 (capability boundaries) |
| Uses Gemini provider | Tool calls may silently fail, output may truncate | Phase 2 (normalize responses, increase limits) |
| Asks same data question twice | Gets different answer due to temperature randomness | Phase 2 (dynamic temperature) |
| Switches topic mid-conversation | AI still references old goal, brand voice wrong for new topic | Phase 3 (goal update, brand voice override, freshness) |
| Has analyst sidebar open + asks question | AI doesn't know what sidebar shows, contradicts visible data | Phase 4 (pass analyst state to AI) |
| Creates/deletes content via AI | Analyst sidebar shows stale numbers for 2 minutes | Phase 4 (refresh after tool calls) |
| New user with 3 articles | Health score says "critical" — discouraging | Phase 5 (stage-aware targets) |
| Returns next day | Sees yesterday's "SEO declining" alert in email conversation | Phase 6 (session memory filtering) |
| Sees analyst warnings | Same warning appears multiple times in feed | Phase 5 (anomaly dedup) |
| email_campaigns/contacts counts | Shows ALL users' data — data leak | Phase 5 (user_id filters) |

---

## PHASE 1: AI Knows What To Do (45 min)

**4 blocks added to system prompt + 2 changes to tool filtering. All in backend.**

---

### 1.1 — Priority Rules (what wins when instructions conflict)

**Why:** The AI gets ~20 instruction blocks that often contradict (be brief vs be thorough, always chart vs no chart for empty data, call tools immediately vs ask first). No rule says which wins.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Where:** Find where `systemPrompt` is first assigned or where `BASE_PROMPT` is concatenated. This new block must be the FIRST thing in the system prompt — before everything else.

**What to add:**

```ts
const PRIORITY_RULES = `## PRIORITY RULES (this section overrides ALL other instructions when they conflict)

When you receive conflicting instructions below, follow this priority order:

### Priority 1: CURRENT USER MESSAGE (highest)
What the user is asking RIGHT NOW always wins over any other instruction.
- User says "give me detail" but your calibration says BRIEF → give detail
- User says "casual tone" but brand voice says "professional" → use casual
- User says "just do it" but pushback protocol says "ask first" → just do it
- User says "show me a table" but chart module says "default to charts" → show table

### Priority 2: TOOL RESTRICTIONS
Never call a tool that doesn't exist, is unconfigured, or returned an error.
- If service status says SERP is unconfigured → don't call SERP tools even if they appear in your tool list
- If a tool returns {success: false} → tell the user what went wrong. Do NOT silently retry the same tool.

### Priority 3: RESPONSE CALIBRATION (urgency/scope)
The detected response mode (URGENT, BRIEF, THOROUGH, etc.) sets your default length.
- BUT if the user's intelligence profile says they consistently prefer brief/detailed → profile wins over calibration

### Priority 4: TASK PERSONA
Adopt the detected persona (Creative Strategist, Data Analyst, etc.).
- BUT brand voice overrides tone ONLY for content generation outputs, not for conversational chat responses

### Priority 5: BASE PROMPT (lowest)
General formatting and behavior rules. These are defaults, not absolutes.

---

### CHART DECISION TREE (use this instead of any other chart instruction):
- Query returns 3+ data points → generate chart (visualData)
- Query returns 1-2 data points → show as metric text ("You have 23 articles, 15 published") — NO chart
- Query returns 0 data points → explain what data is missing and how to get it — NO chart
- User explicitly says "show me a chart" or "graph" → generate chart even for 1-2 points
- User explicitly says "table" or "list" → use tableData format, no chart

### TOOL CALLING DECISION TREE (use this instead of any other tool instruction):
- READ query ("show me", "how many", "what's my", "list my") → call the read tool immediately. No questions. No preamble.
- WRITE query with clear parameters ("create a draft about AI in healthcare") → call the write tool immediately
- WRITE query with vague parameters ("make some content") → ask exactly ONE clarifying question ("What topic and format?"), then execute
- DESTRUCTIVE query (delete, publish to website) → use requiresConfirmation format
- MULTI-STEP query ("create content and email it to my list") → explain the 2 steps, execute step 1, then ask before step 2
`;
```

**How to add:**

Find the line where systemPrompt is first built. It likely looks like:
```ts
let systemPrompt = BASE_PROMPT;
```

Change to:
```ts
let systemPrompt = PRIORITY_RULES + '\n\n' + BASE_PROMPT;
```

**Frontend:** No changes.

**Test scenarios:**
- Send "show me my content" → AI calls get_content_items immediately, no "I'll fetch your data" preamble
- Send "how many articles do I have?" → AI returns a number in text, NO chart (1 data point)
- Send "compare my articles by SEO score" (10+ items) → AI returns a chart
- Send "write me a blog post" when BRIEF mode is detected → AI still writes the blog post (user intent > calibration)
- Send "give me detail about my keywords" when user profile says "prefers brief" → user message wins, gives detail

---

### 1.2 — Tool Disambiguation (which tool for which request)

**Why:** 4 content creation tools, 4 email tools, 4 social tools. AI picks randomly. Users get inconsistent behavior.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Where:** Add after the TOOL_USAGE_MODULE injection (find where `TOOL_USAGE_MODULE` is concatenated to systemPrompt). This block goes right after it.

```ts
const TOOL_DISAMBIGUATION = `## TOOL SELECTION RULES (read before calling ANY tool)

### CONTENT CREATION — only 2 paths:
| User says | Tool to call | What happens |
|-----------|-------------|-------------|
| "Write me a blog post about X" | \`generate_full_content\` | AI writes full article, saves as draft |
| "Help me create content" / "Let's write together" | \`launch_content_wizard\` | Opens guided wizard sidebar with SERP research |
| Not sure which one user wants? | ASK: "Want me to write it directly, or use the guided wizard with SERP analysis?" |
- NEVER call \`start_content_builder\` — it's deprecated
- NEVER call \`create_content_item\` for generation — that's for saving raw text the user provides

### CONTENT IMPROVEMENT — 2 tools:
| User says | Tool |
|-----------|------|
| "Improve my article" / "make it better" / "fix the SEO" | \`improve_content\` |
| "Make it shorter" / "more casual" / "add bullets" / "simplify" | \`reformat_content\` |

### EMAIL — always follow this order:
1. Convert article → email: \`content_to_email\` (creates campaign in draft)
2. Create email from scratch: \`create_email_campaign\` (creates draft)
3. Send or schedule: \`send_email_campaign\` (only AFTER showing draft to user)
- NEVER send without showing draft first
- NEVER silently chain create + send in one response

### SOCIAL POSTS — always 2 steps:
1. Generate posts from content: \`repurpose_for_social\`
2. Schedule the generated posts: \`schedule_social_from_repurpose\`
- After step 1, ALWAYS ask: "Posts generated for [platforms]. Want me to schedule them?"
- NEVER auto-schedule without asking

### PROPOSALS vs RECOMMENDATIONS:
- \`accept_proposal\` → SIDE EFFECT: automatically creates a calendar item
- \`accept_recommendation\` → just marks as accepted, no calendar item
- Tell user about the side effect: "Accepting this will add it to your content calendar."

### CAMPAIGNS:
- Brand new campaign → \`create_campaign\`
- Campaign from existing content → \`promote_content_to_campaign\`
- If user says "create a campaign about X" and has existing content about X → ask which path
`;

systemPrompt += TOOL_DISAMBIGUATION;
```

**Frontend:** No changes.

**Test scenarios:**
- "Write me a blog about AI" → calls `generate_full_content` (not wizard, not builder)
- "Let's create some content together" → calls `launch_content_wizard`
- "Make my article shorter" → calls `reformat_content` (not improve_content)
- "Email this article to my subscribers" → calls `content_to_email`, shows draft, then asks about sending
- "Accept this proposal" → AI says "This will add it to your calendar" before calling accept_proposal

---

### 1.3 — Tool Result Presentation + Capability Boundaries

**Why:** AI dumps raw JSON, echoes HTML tags, promises things it can't do (social posting, rank tracking).

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Where:** Add after TOOL_DISAMBIGUATION.

```ts
const TOOL_RESULT_RULES = `## HOW TO PRESENT TOOL RESULTS TO THE USER

### When a tool returns successfully:
- Lead with the KEY FINDING, not raw data: "You have 23 articles — 15 published, 8 drafts"
- NEVER show raw JSON objects like {success: true, data: [...]}
- Format numbers with commas: "12,500" not "12500"
- SEO scores always as "X/100"
- Percentages with one decimal: "45.2%"
- For content items: show title + status + SEO score. Skip IDs and internal metadata.
- For keywords: show keyword + volume + difficulty. Skip timestamps.
- If more than 5 items: show top 5 sorted by relevance, then say "and X more — want to see the rest?"

### When a tool returns an error:
- Tell the user what happened in plain language: "I couldn't find that article — it may have been deleted."
- Do NOT retry the same tool with the same parameters silently
- Suggest what the user can do: "Try a different keyword" or "Check Settings → API Keys"
- If error is about missing configuration: tell them EXACTLY where to go: "Add your SERP API key in Settings → API Keys"

### When tool results contain HTML:
- Strip HTML tags when showing titles or excerpts in your response
- NEVER echo raw HTML like <h2>Title</h2> in your message
- When referencing article content, summarize in 1-2 sentences — don't paste the full body

### When data was already fetched earlier in this conversation:
- Reference it: "Based on what we looked at earlier, your top article is..."
- Only re-fetch if user explicitly says "refresh", "update", "check again", or "latest"
`;

const TOOL_BOUNDARIES = `## WHAT YOU CANNOT DO (never promise these to the user)

You must be honest about these limitations:
- ❌ Cannot track real-time Google rankings (no rank tracker is connected)
- ❌ Cannot post directly to Twitter, LinkedIn, Facebook, or Instagram (social posts are saved as drafts for manual posting)
- ❌ Cannot run A/B tests on content
- ❌ Cannot access Google Analytics data unless the user has configured their service account in Settings → API Keys
- ❌ Cannot send emails unless Resend API key is configured in Settings → API Keys
- ❌ Cannot publish to websites unless WordPress or Wix is connected in Settings → Websites
- ❌ Cannot generate video without separate API keys (Runway, Kling, or Replicate)

If a user asks for something on this list, say honestly: "I can't do that directly, but here's what I can do: [closest alternative]"
Example: "I can't post to LinkedIn directly, but I can generate the post text — you can copy and paste it."
`;

systemPrompt += TOOL_RESULT_RULES;
systemPrompt += TOOL_BOUNDARIES;
```

**Frontend:** No changes.

**Test scenarios:**
- Ask "show me my content" → AI shows formatted list (title, status, score) — NOT raw JSON
- Ask "track my Google rankings" → AI says "I can't track rankings directly, but I can analyze your keywords and SERP positions"
- Ask "post this to LinkedIn" → AI says "I can't post directly — posts are saved as drafts. Want me to generate the post text?"
- Ask "show me my content" again 3 messages later → AI references earlier data, doesn't re-fetch

---

### 1.4 — Fix Tool Filtering (reduce from 89 to ~15 per request)

**Why:** Intent filtering has a safety net: if fewer than 5 tools match, it shows ALL 89 tools. This defeats the purpose. Also, deprecated tools still show up.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** (~line 3203):
```ts
if (toolsToUse.length < 5) toolsToUse = TOOL_DEFINITIONS;
```

**Replace with:**
```ts
// If intent filtering returns few tools, add core reads — don't flood with all 89
if (toolsToUse.length < 3) {
  const coreTools = TOOL_DEFINITIONS.filter((t: any) =>
    ['get_content_items', 'get_keywords', 'get_proposals', 'get_competitors', 'generate_full_content'].includes(t.name)
  );
  toolsToUse = [...toolsToUse, ...coreTools.filter((ct: any) => !toolsToUse.some((tu: any) => tu.name === ct.name))];
}

// Always hide deprecated/redundant tools
const HIDDEN_TOOLS = ['start_content_builder', 'create_content_item'];
toolsToUse = toolsToUse.filter((t: any) => !HIDDEN_TOOLS.includes(t.name));
```

**File:** `supabase/functions/enhanced-ai-chat/tools.ts`

**Find** `send_quick_email` in the cache invalidation map (~line 551):
```ts
send_quick_email: [],
```

**Delete that line.** This tool has no handler — if AI calls it, it errors.

**Frontend:** No changes.

**Test:** Ask a general question → AI should see ~10-20 relevant tools, not 89. Ask "write a blog" → `start_content_builder` should NOT be in the tool list.

---

## PHASE 2: Provider Normalization + Smart Tokens (25 min)

**All in `ai-proxy/index.ts` and `enhanced-ai-chat/index.ts`. No frontend.**

---

### 2.1 — Normalize Gemini + Anthropic responses to OpenAI format

**Why:** enhanced-ai-chat expects OpenAI-shaped responses (`choices[0].message.content`). Gemini returns `candidates[0].content.parts[0].text`. If the translation is wrong, tool calls silently fail.

**File:** `supabase/functions/ai-proxy/index.ts`

**Add this function** near the top of the file (after imports, before handlers):

```ts
function normalizeToOpenAIFormat(raw: any, provider: string): any {
  // OpenAI, Mistral, OpenRouter already return correct shape
  if (['openai', 'mistral', 'openrouter'].includes(provider)) {
    return raw;
  }

  const result: any = {
    choices: [{
      message: {
        role: 'assistant',
        content: '',
        tool_calls: []
      }
    }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };

  if (provider === 'gemini') {
    const candidate = raw?.candidates?.[0];
    if (candidate?.content?.parts) {
      // Extract text
      result.choices[0].message.content = candidate.content.parts
        .filter((p: any) => p.text)
        .map((p: any) => p.text)
        .join('');

      // Extract function calls
      result.choices[0].message.tool_calls = candidate.content.parts
        .filter((p: any) => p.functionCall)
        .map((p: any, i: number) => ({
          id: `call_${i}`,
          type: 'function',
          function: {
            name: p.functionCall.name,
            arguments: JSON.stringify(p.functionCall.args || {})
          }
        }));
    }
    // Usage
    const meta = raw?.usageMetadata;
    if (meta) {
      result.usage.prompt_tokens = meta.promptTokenCount || 0;
      result.usage.completion_tokens = meta.candidatesTokenCount || 0;
      result.usage.total_tokens = meta.totalTokenCount || 0;
    }
  }

  if (provider === 'anthropic') {
    const content = raw?.content || [];
    result.choices[0].message.content = content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('');
    result.choices[0].message.tool_calls = content
      .filter((b: any) => b.type === 'tool_use')
      .map((b: any) => ({
        id: b.id,
        type: 'function',
        function: { name: b.name, arguments: JSON.stringify(b.input || {}) }
      }));
    result.usage = raw?.usage || result.usage;
  }

  // Carry through auto-detected model info
  if (raw?._autoDetectedModel) result._autoDetectedModel = raw._autoDetectedModel;
  return result;
}
```

**Apply to each provider's chat handler.** Find the return statement in each handler's chat/completion path:

**handleGemini** — find where Gemini chat response is returned (after `const data = await response.json()`):
```ts
// CHANGE FROM:
return { success: true, data, provider: 'Gemini' };
// CHANGE TO:
return { success: true, data: normalizeToOpenAIFormat(data, 'gemini'), provider: 'Gemini' };
```

**handleAnthropic** — same pattern:
```ts
return { success: true, data: normalizeToOpenAIFormat(data, 'anthropic'), provider: 'Anthropic' };
```

OpenAI, Mistral, OpenRouter — no change needed (function returns input unchanged).

**Frontend:** No changes.

**Test:** With Gemini active, send "show me my keywords" → AI should call the tool and present results (not silently fail). Check that tool_calls from Gemini are properly parsed.

---

### 2.2 — Increase max output tokens for Gemini

**Why:** Gemini supports up to 65K output tokens. Currently all providers are capped at 16K. Complex responses (chart config + insights + actions) can get truncated.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** the dynamic max tokens calculation. It looks something like:
```ts
const dynamicMaxTokens = Math.min(Math.max(4096, Math.floor(totalTokens * 0.3)), 16000);
```

**Replace with:**
```ts
// Gemini supports much higher output — don't artificially limit it
const providerOutputCap = (provider?.provider === 'gemini') ? 32000 : 16000;
const dynamicMaxTokens = Math.min(
  Math.max(4096, Math.floor(totalTokens * 0.3)),
  providerOutputCap
);
```

**Frontend:** No changes.

---

### 2.3 — Dynamic temperature based on task type

**Why:** Temperature 0.7 means the AI picks different tools for the same query each time. Data lookups should be deterministic (temp 0.1). Content generation should be creative (temp 0.8).

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** where the AI call parameters are assembled (where `temperature` is set, likely hardcoded to 0.7). Add dynamic logic:

```ts
// Dynamic temperature based on what the AI is doing
let requestTemperature = 0.7; // Default

if (queryIntent.isConversational) {
  requestTemperature = 0.4; // Balanced for chat — not too random
} else if (queryIntent.scope === 'lookup' || queryIntent.scope === 'summary') {
  requestTemperature = 0.2; // Near-deterministic for data queries
} else if (queryIntent.categories?.some((c: string) => c === 'content') &&
           relevantToolNames?.some((t: string) =>
             ['generate_full_content', 'improve_content', 'reformat_content', 'repurpose_for_social'].includes(t))) {
  requestTemperature = 0.8; // Creative for content generation
}
```

Pass `requestTemperature` in the AI call params instead of hardcoded 0.7.

**Frontend:** No changes.

**Test:** Ask "how many articles do I have?" twice in a row → should get the same answer both times (low temp). Ask "write me a blog intro about AI" twice → should get different creative results (high temp).

---

## PHASE 3: Fix Stale Context (15 min)

**All in `enhanced-ai-chat/index.ts`. No frontend.**

---

### 3.1 — Update conversation goal when topic shifts

**Why:** Goal is set on first message ("SEO Research") and never updates. User switches to email campaigns — AI still thinks the goal is SEO.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Where:** After the query intent detection (after `queryIntent` is computed, before system prompt assembly). Add:

```ts
// Update conversation goal if topic shifted
const CATEGORY_TO_GOAL: Record<string, string> = {
  content: 'Content Creation',
  keywords: 'SEO Research',
  campaigns: 'Campaign Management',
  competitors: 'Competitive Analysis',
  analytics: 'Performance Analysis',
  engage: 'Email & Social',
  proposals: 'Strategy Planning'
};

const primaryCategory = queryIntent.categories?.[0];
const detectedGoal = primaryCategory ? CATEGORY_TO_GOAL[primaryCategory] : null;
const currentGoal = conversationData?.goal;

if (detectedGoal && currentGoal && detectedGoal !== currentGoal && !queryIntent.isConversational) {
  // Topic genuinely shifted (not just a casual "hi" or "thanks")
  try {
    await supabase.from('ai_conversations')
      .update({ goal: detectedGoal })
      .eq('id', conversationId);
    console.log(`🔄 Goal updated: ${currentGoal} → ${detectedGoal}`);
  } catch { /* non-blocking */ }
}
```

---

### 3.2 — Brand voice overridable per request

**Why:** Brand voice says "Professional, authoritative" but user asks "write me a casual tweet." AI tries to make a professional tweet — terrible.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** where brand voice context is appended to systemPrompt (look for `brandVoiceContext` being concatenated). After the brand voice injection, add:

```ts
systemPrompt += brandVoiceContext;
// Add override note:
systemPrompt += `\nIMPORTANT: Brand voice applies to CONTENT GENERATION outputs (blog posts, articles, emails). For conversational chat responses, match the user's tone. If the user explicitly requests a different tone for a specific piece of content (e.g., "write this casually"), override brand voice for that request.`;
```

---

### 3.3 — Data freshness note for long conversations

**Why:** User creates 5 articles during a conversation. Data context still shows old count. AI gives advice based on stale numbers.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** where real data context is injected into the prompt. Before or after that injection, add:

```ts
const messageCount = conversationMessages?.length || 0;
if (messageCount > 10) {
  systemPrompt += `\n\n**DATA FRESHNESS NOTE**: This conversation has ${messageCount} messages. The data counts below were fetched just now and are current. However, any data shown in PREVIOUS messages in the conversation history may be outdated — content may have been created, deleted, or changed during this conversation. If the user asks about data and your previous message showed different numbers, acknowledge: "The data has changed since we last looked — here are the current numbers."`;
}
```

**Frontend:** No changes for Phase 3.

---

## PHASE 4: Analyst ↔ AI Sync (35 min)

**Frontend + Backend changes. This is the most important phase — it connects the two systems.**

---

### 4.1 — Make analyst state accessible to the chat hook

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

The analyst state is computed here via `useAnalystEngine`. The chat hook (`useEnhancedAIChatDB`) sends messages but doesn't know about analyst state. We need to bridge them.

**Add a ref** for analyst state (near other refs in the component):

```ts
const analystStateRef = useRef<any>(null);

// Keep it updated when analystState changes:
useEffect(() => {
  analystStateRef.current = analystState;
}, [analystState]);
```

**Also add a ref** for analyst refresh:

```ts
const analystRefreshRef = useRef<(() => void) | null>(null);

useEffect(() => {
  analystRefreshRef.current = analystState?.triggerRefresh || null;
}, [analystState?.triggerRefresh]);
```

**Make both refs accessible** to the sendMessage flow. There are two approaches depending on how the code is structured:

**Option A** — If sendMessage is called directly in EnhancedChatInterface (wraps the hook's sendMessage):

Create a wrapper that builds analyst context before sending:

```ts
const sendMessageWithAnalyst = useCallback(async (content: string, displayContent?: string) => {
  // Build analyst summary from current state
  const state = analystStateRef.current;
  let analystSummary = null;

  if (state && analystActiveRef?.current) {
    analystSummary = {
      healthScore: state.healthScore?.total ?? null,
      healthStatus: state.healthScore?.status ?? null,
      healthTrend: state.healthScore?.trend ?? null,
      activeWarnings: (state.insightsFeed || [])
        .filter((i: any) => i.type === 'warning')
        .map((i: any) => i.content)
        .slice(0, 5),
      recommendation: state.strategicRecommendation?.stance ?? null,
      recommendationReasoning: state.strategicRecommendation?.reasoning ?? null,
      userStage: state.userStage ?? null,
      goalProgress: state.goalProgress
        ? { name: state.goalProgress.goalName, pct: state.goalProgress.percentage }
        : null
    };
  }

  // Call the actual sendMessage with analyst context
  await sendMessage(content, displayContent, {
    analystSummary,
    currentPage: window.location.pathname
  });
}, [sendMessage]);
```

Use `sendMessageWithAnalyst` everywhere that `sendMessage` is called in this component (message input, quick actions, analyst action buttons, etc.).

**Option B** — If sendMessage is in useEnhancedAIChatDB and you can't easily pass extra args:

Add a ref setter to the hook:

```ts
// In useEnhancedAIChatDB, add:
const analystContextRef = useRef<any>(null);
const setAnalystContext = useCallback((ctx: any) => {
  analystContextRef.current = ctx;
}, []);

// Return setAnalystContext from the hook
return { ...existing, setAnalystContext };
```

Then in EnhancedChatInterface:
```ts
// Update analyst context whenever analystState changes
useEffect(() => {
  if (setAnalystContext && analystState) {
    setAnalystContext({
      healthScore: analystState.healthScore?.total ?? null,
      healthStatus: analystState.healthScore?.status ?? null,
      activeWarnings: (analystState.insightsFeed || [])
        .filter((i: any) => i.type === 'warning')
        .map((i: any) => i.content)
        .slice(0, 5),
      recommendation: analystState.strategicRecommendation?.stance ?? null,
      userStage: analystState.userStage ?? null
    });
  }
}, [analystState, setAnalystContext]);
```

---

### 4.2 — Include analyst summary + page context in request body

**File:** `src/hooks/useEnhancedAIChatDB.ts`

**Find** the `sendMessage` function, specifically where the fetch request body is built. It currently looks something like:

```ts
body: JSON.stringify({
  messages: messagesToSend,
  context: {
    conversation_id: conversationId,
    analystActive: analystActiveRef.current
  },
  stream: true
})
```

**Change to:**

```ts
body: JSON.stringify({
  messages: messagesToSend,
  context: {
    conversation_id: conversationId,
    analystActive: analystActiveRef.current,
    // NEW: pass analyst state so AI knows what sidebar shows
    analystSummary: analystContextRef?.current || null,
    // NEW: pass current page so AI knows user context
    currentPage: typeof window !== 'undefined' ? window.location.pathname : '/ai-chat'
  },
  stream: true
})
```

---

### 4.3 — Edge function reads analyst summary and injects into prompt

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** the existing analyst mode injection (search for `analystActive` or `ANALYST MODE`). It currently says something like "The user has the Analyst sidebar open. They expect data-rich, visual responses. EVERY response MUST include visualData..."

**Replace the ENTIRE analyst block** with:

```ts
if (context?.analystActive) {
  let analystPrompt = '\n\n## ANALYST SIDEBAR — WHAT THE USER SEES RIGHT NOW\n';

  if (context?.analystSummary) {
    const s = context.analystSummary;

    if (s.healthScore !== null) {
      analystPrompt += `**Health Score:** ${s.healthScore}/100 (${s.healthStatus || 'unknown'}, trend: ${s.healthTrend || 'stable'})\n`;
    }
    if (s.recommendation) {
      analystPrompt += `**Strategic Stance:** ${s.recommendation}`;
      if (s.recommendationReasoning) analystPrompt += ` — ${s.recommendationReasoning}`;
      analystPrompt += '\n';
    }
    if (s.userStage) {
      analystPrompt += `**User Stage:** ${s.userStage}\n`;
    }
    if (s.activeWarnings?.length > 0) {
      analystPrompt += `**Active Warnings (visible to user):**\n`;
      s.activeWarnings.forEach((w: string) => {
        analystPrompt += `  - ${w}\n`;
      });
    }
    if (s.goalProgress) {
      analystPrompt += `**Goal:** ${s.goalProgress.name} — ${s.goalProgress.pct}% complete\n`;
    }

    analystPrompt += `\nThe user can see ALL of the above in their sidebar right now.
- If they ask about health score, warnings, or recommendations → reference these EXACT values
- If your tool calls return different numbers → acknowledge: "The sidebar shows X, but the latest data shows Y"
- Include charts and visualData when the query is about data/analytics — NOT on every response
- For simple questions ("what should I focus on?") → reference the strategic stance, don't generate a chart\n`;

  } else {
    // Analyst active but no summary data
    analystPrompt += 'The user has the Analyst sidebar open. Include charts when the query is about data or analytics, but not on every single response.\n';
  }

  if (context?.currentPage && context.currentPage !== '/ai-chat') {
    analystPrompt += `\nThe user is currently on the ${context.currentPage} page (not the main chat page). They may be asking about what they see on that page.\n`;
  }

  systemPrompt += analystPrompt;
}
```

---

### 4.4 — Refresh analyst after AI modifies data

**File:** `src/hooks/useEnhancedAIChatDB.ts` (or `src/components/ai-chat/EnhancedChatInterface.tsx`)

After the SSE response is fully received and the final message is set, check if the AI did something that changes data:

```ts
// After the final assistant message is saved to state:
// Check if the response indicates data was modified
const responseText = finalMessage?.content || '';
const dataWasModified = /✅|Created|Published|Deleted|Updated|Approved|Rejected|Improved|Reformatted|Archived|Scheduled/i.test(responseText);

if (dataWasModified && analystRefreshRef?.current) {
  // Give DB 2 seconds to settle, then refresh analyst
  setTimeout(() => {
    try {
      analystRefreshRef.current?.();
    } catch { /* non-blocking */ }
  }, 2000);
}
```

If `analystRefreshRef` is in EnhancedChatInterface but the SSE handling is in useEnhancedAIChatDB, you'll need to either:
- Expose a callback from the hook that EnhancedChatInterface can set
- Or trigger a custom event that EnhancedChatInterface listens to

The simplest approach: in EnhancedChatInterface, watch for new assistant messages and check their content:

```ts
// In EnhancedChatInterface:
const prevMessageCountRef = useRef(messages.length);

useEffect(() => {
  if (messages.length > prevMessageCountRef.current) {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant' && lastMessage?.content) {
      const modified = /✅|Created|Published|Deleted|Updated|Approved|Rejected|Improved|Reformatted/i.test(lastMessage.content);
      if (modified && analystRefreshRef.current) {
        setTimeout(() => analystRefreshRef.current?.(), 2000);
      }
    }
  }
  prevMessageCountRef.current = messages.length;
}, [messages]);
```

**Backend:** No changes for 4.4.

**Test scenarios for Phase 4:**
- With analyst open, ask "why is my health score low?" → AI references the exact score from sidebar
- With analyst showing "fix-quality" stance, ask "what should I focus on?" → AI references the stance
- Ask AI to "create a draft about AI" → wait 3 seconds → analyst sidebar draft count should update
- Ask AI "how many articles?" → analyst sidebar shows same number as AI response

---

## PHASE 5: Fix Analyst Data Accuracy (30 min)

**All changes in `src/hooks/useAnalystEngine.ts`. No backend changes.**

---

### 5.1 — CRITICAL: Fix data leak (add user_id filters)

**Find** `fetchPlatformData` function. Locate these 3 queries:

**email_campaigns query** (look for `.from('email_campaigns')`):
```ts
// FIND:
const { count } = await supabase
  .from('email_campaigns')
  .select('id', { count: 'exact', head: true });

// ADD .eq filter:
const { count } = await supabase
  .from('email_campaigns')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);
```

If the table uses `workspace_id` instead of `user_id`, use that. But add SOME user filter.

**content_performance_signals query** (look for `.from('content_performance_signals')`):
```ts
// FIND:
const { data: perfSignals } = await supabase
  .from('content_performance_signals')
  .select('content_id, signal_type')
  .limit(100);

// ADD .eq filter:
const { data: perfSignals } = await supabase
  .from('content_performance_signals')
  .select('content_id, signal_type')
  .eq('user_id', userId)
  .limit(100);
```

Note: `engage_contacts` was already fixed (has .eq('user_id', userId) per the audit). Just verify.

---

### 5.2 — Fix anomaly IDs to be content-based

**Find** all places where anomaly IDs are generated. Change from `${now.getTime()}` to stable content-based IDs:

```ts
// CHANGE EACH ONE:

// Anomalies:
`anomaly-low-seo-${now.getTime()}`        → `anomaly-low-seo`
`anomaly-stale-drafts-${now.getTime()}`    → `anomaly-stale-drafts`
`anomaly-empty-calendar-${now.getTime()}`  → `anomaly-empty-calendar`
`anomaly-stale-content-${now.getTime()}`   → `anomaly-stale-content`

// Cross-signals:
`cross-seo-declining-${now.getTime()}`     → `cross-seo-declining`
`cross-seo-improving-${now.getTime()}`     → `cross-seo-improving`
`cross-publish-gap-${now.getTime()}`       → `cross-publish-gap`
`cross-topic-concentration-${now.getTime()}` → `cross-topic-concentration-${keyword}`
`cross-cannibalization-${kw}-${now.getTime()}` → `cross-cannibalization-${kw}`
`cross-keyword-ratio-${now.getTime()}`     → `cross-keyword-ratio`
`cross-accountability-${now.getTime()}`    → `cross-accountability`
`cross-seasonal-gap-${now.getTime()}`      → (will be removed in 5.6)
```

Why: Stable IDs prevent duplicates. When anomalies are replaced (not appended), the same anomaly keeps the same ID instead of creating a new one every 2 minutes.

---

### 5.3 — Stage-aware health score targets

**Find** the Content Volume factor in `computeHealthScore` (~line 654):

```ts
// FIND:
const volumeScore = Math.min(20, Math.round((totalContent / 15) * 20));
```

**Replace with:**
```ts
const stageTargets: Record<string, number> = {
  starter: 5,
  growing: 15,
  established: 30,
  scaling: 50
};
const volumeTarget = stageTargets[userStage || 'growing'] || 15;
const volumeScore = Math.min(20, Math.round((totalContent / volumeTarget) * 20));

// Also update the detail text:
// FIND:
detail: `${totalContent} total pieces (target: 15+)`,
// REPLACE:
detail: `${totalContent} pieces (${userStage || 'growing'} stage target: ${volumeTarget}+)`,
```

---

### 5.4 — Division by zero guard on goals

**Find** the goal progress calculation (search for `goal.target_value`):

```ts
// FIND:
const percentage = Math.min(100, Math.round((currentValue / goal.target_value) * 100));

// REPLACE:
const safeTarget = goal.target_value && goal.target_value > 0 ? goal.target_value : 1;
const percentage = Math.min(100, Math.round((currentValue / safeTarget) * 100));
```

---

### 5.5 — Remove seasonal detection

**Find** the seasonal detection block in `computeCrossSignals`. It starts with something like:
```ts
const seasonalTopics: Record<number, string[]> = {
  0: ['new year', 'resolutions', ...],
  1: ['valentine', ...],
  ...
};
```

**Delete the entire block** — from the `seasonalTopics` object definition through the signal push that references seasonal gaps. This is typically ~40 lines.

Why: B2C-only topics ("valentine", "christmas", "back-to-school") cause irrelevant warnings for B2B users.

---

### 5.6 — Fix goal progress field

**Find** the publish_count goal query (search for `publish_count` or the query that uses `.gte('updated_at'`):

```ts
// FIND:
.gte('updated_at', since)

// REPLACE:
.gte('created_at', since)
```

Why: `updated_at` counts articles that had a typo fixed. `created_at` counts actually new articles.

---

### 5.7 — Strategic recommendation checks trajectory

**Find** the "fix-quality" rule (search for `stance: 'fix-quality'` or `avgSeo < 45`):

```ts
// FIND something like:
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
  return { stance: 'fix-quality', ... };
}
```

**Wrap with trajectory check — add BEFORE the existing return:**

```ts
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
  // Check if recent articles are improving despite low average
  const recentContentData = platformData
    .filter((d: PlatformDataPoint) => d.category === 'content' && d.label === 'Avg SEO Score');
  const recentAvgSeo = recentContentData.length > 0 ? recentContentData[0].value : avgSeo;

  // Also check if we have trend data from recent articles
  const trendData = platformData.filter((d: PlatformDataPoint) =>
    d.category === 'content' && d.label.startsWith('Recent')
  );

  // If recent content is good (>= 60), it's old content dragging the average down
  if (recentAvgSeo >= 60 || (trendData.length > 0 && trendData[0].value >= 60)) {
    return {
      stance: 'accelerate' as const,
      reasoning: `Your recent articles average ~${Math.round(recentAvgSeo)} SEO — quality is improving. Older content drags the overall average to ${avgSeo}. Consider rescoring old content.`,
      promptQuestion: `Your recent work is strong but older content is pulling your average down. Want me to find the weakest articles to improve?`,
      actions: [
        { label: 'Find Weakest Articles', prompt: 'Show me my published articles with the lowest SEO scores so I can improve them', effort: 'low' as const, impact: 'high' as const },
        { label: 'Rescore All Content', prompt: 'Rescore all my content to update SEO scores with the latest algorithm', effort: 'low' as const, impact: 'medium' as const }
      ]
    };
  }

  // Genuinely low quality — proceed with fix-quality
  return {
    stance: 'fix-quality' as const,
    // ... existing fix-quality recommendation
  };
}
```

**Frontend:** No changes for Phase 5.

**Test scenarios:**
- Check engage_contacts count → should only show YOUR contacts
- User with 3 articles, stage "starter" → health volume = 3/5 * 20 = 12 (warning, not critical)
- Set goal target to 0 → should NOT crash (shows 100%)
- No seasonal warnings in insights feed
- Last 3 articles score [80, 85, 82] but avg is 42 → recommendation should be "accelerate" not "fix-quality"
- Wait 5+ minutes → anomaly list should NOT have duplicates

---

## PHASE 6: Analyst Session + Topic Filtering (15 min)

**All in `src/hooks/useAnalystEngine.ts`. No backend.**

---

### 6.1 — Filter session memory by current conversation topic

**Find** where session memory is loaded (search for `loadSessionMemory` or where `restoredInsights` are merged into the insights feed).

**After loading restored insights, add filtering:**

```ts
// After: restoredInsights = memory.insights.map(...)
// Add topic filtering:

if (restoredInsights.length > 0 && topics.length > 0) {
  const currentCategories = new Set(topics.map((t: AnalystTopic) => t.category));

  restoredInsights = restoredInsights.filter((insight: InsightItem) => {
    // Always keep critical/high urgency regardless of topic
    if (insight.urgency === 'critical' || insight.urgency === 'high') return true;

    // For medium/low urgency, check if insight matches current conversation topics
    const text = (insight.content || '').toLowerCase();
    for (const cat of currentCategories) {
      if (cat === 'content' && /content|draft|seo|article|publish/.test(text)) return true;
      if (cat === 'keywords' && /keyword|serp|search|ranking/.test(text)) return true;
      if (cat === 'campaigns' && /campaign|queue|generat/.test(text)) return true;
      if (cat === 'competitors' && /competitor|rival|market/.test(text)) return true;
      if (cat === 'email' && /email|newsletter|subscriber|resend/.test(text)) return true;
      if (cat === 'social' && /social|twitter|linkedin|post/.test(text)) return true;
    }
    return false; // Hide irrelevant session insights
  });
}

// If conversation has 0 messages yet (topics empty), show ALL session insights (no filter)
```

**Frontend:** No additional changes.

**Test:** Have a conversation about SEO yesterday that generates "SEO declining" insight. Start a new conversation today about email campaigns. The "SEO declining" insight should NOT appear in the analyst feed (wrong topic). But a "critical" warning about stale drafts SHOULD appear (always shown).

---

## VERIFICATION MASTER CHECKLIST

### Phase 1 — AI knows what to do:
- [ ] "how many articles?" → text answer, NO chart (1 data point)
- [ ] "compare articles by SEO" → chart (3+ data points)
- [ ] "write me a blog" → calls `generate_full_content` NOT `start_content_builder`
- [ ] "make my article shorter" → calls `reformat_content` NOT `improve_content`
- [ ] Tool error → clear English message, no silent retry
- [ ] "post to LinkedIn" → honest message about drafts-only
- [ ] "track my rankings" → honest message about no rank tracker

### Phase 2 — Provider normalization:
- [ ] Gemini tool calls work (AI calls tool, result comes back)
- [ ] Gemini doesn't output `<think>` tags
- [ ] Long Gemini response doesn't truncate mid-JSON
- [ ] Same data question → same answer both times (low temp)
- [ ] Content generation → varied results (high temp)

### Phase 3 — Stale context:
- [ ] Start with SEO question, switch to email → goal updates
- [ ] Professional brand voice + "write casual tweet" → tweet is casual
- [ ] After 15 messages, AI acknowledges if numbers changed

### Phase 4 — Analyst ↔ AI sync:
- [ ] Analyst open + "why is my health low?" → AI cites exact score
- [ ] Analyst showing "fix-quality" + "what to focus on?" → AI aligns with recommendation
- [ ] AI creates content → analyst updates within ~3 seconds
- [ ] AI and analyst show same numbers simultaneously

### Phase 5 — Data accuracy:
- [ ] email_campaigns count = only YOUR campaigns
- [ ] content_performance_signals = only YOUR signals
- [ ] 3 articles, starter stage → health NOT "critical"
- [ ] Goal target = 0 → no crash
- [ ] No seasonal warnings
- [ ] No duplicate anomalies after 5 minutes
- [ ] Recent articles good but avg low → "accelerate" not "fix-quality"

### Phase 6 — Session memory:
- [ ] Yesterday's SEO insight NOT shown in today's email conversation
- [ ] Critical warnings always shown regardless of topic

---

## SUMMARY

| Phase | What | Backend | Frontend | Time |
|-------|------|---------|----------|------|
| 1 | Priority rules + tool disambiguation + result rules + boundaries + filtering | `enhanced-ai-chat/index.ts`, `tools.ts` | None | 45 min |
| 2 | Normalize Gemini/Anthropic + max tokens + dynamic temperature | `ai-proxy/index.ts`, `enhanced-ai-chat/index.ts` | None | 25 min |
| 3 | Goal update + brand voice override + freshness note | `enhanced-ai-chat/index.ts` | None | 15 min |
| 4 | Pass analyst state + AI reads it + refresh after actions | `enhanced-ai-chat/index.ts` | `EnhancedChatInterface.tsx`, `useEnhancedAIChatDB.ts` | 35 min |
| 5 | User_id filters + anomaly IDs + health targets + div/0 + remove seasonal + goal field + trajectory | None | `useAnalystEngine.ts` | 30 min |
| 6 | Session memory topic filter | None | `useAnalystEngine.ts` | 15 min |
| **Total** | **19 items** | **3 backend files** | **3 frontend files** | **~2.75 hrs** |

---

## FILES CHANGED

| File | Changes | Phase |
|------|---------|-------|
| `supabase/functions/enhanced-ai-chat/index.ts` | Add 4 prompt blocks, fix tool safety net, analyst summary reader, goal update, brand override, freshness note, dynamic temp, max tokens | 1, 2, 3, 4 |
| `supabase/functions/enhanced-ai-chat/tools.ts` | Remove send_quick_email, add HIDDEN_TOOLS filter | 1 |
| `supabase/functions/ai-proxy/index.ts` | Add normalizeToOpenAIFormat, apply to Gemini + Anthropic handlers | 2 |
| `src/components/ai-chat/EnhancedChatInterface.tsx` | Add analystStateRef, analystRefreshRef, sendMessageWithAnalyst wrapper, refresh trigger on data changes | 4 |
| `src/hooks/useEnhancedAIChatDB.ts` | Add analystSummary + currentPage to request body | 4 |
| `src/hooks/useAnalystEngine.ts` | Fix user_id filters, anomaly IDs, health targets, div/0 guard, remove seasonal, fix goal field, trajectory check, session memory filter | 5, 6 |
