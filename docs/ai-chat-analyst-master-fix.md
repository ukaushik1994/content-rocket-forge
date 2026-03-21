# AI Chat + Analyst — Master Fix Plan

> **Created:** 2026-03-21
> **For:** Lovable.dev implementation
> **Scope:** Every remaining AI chat confusion + analyst data issue consolidated into one plan
> **Sources:** ai-confusion-fix-plan.md (12 TODO), analyst-ai-sync-plan.md (10 TODO)
> **Total: 22 items across 6 phases, ~3.5 hours**

---

## PHASE 1: Priority Rules + Tool Clarity (30 min)

The AI has conflicting instructions with no way to resolve them. These 4 changes go into `supabase/functions/enhanced-ai-chat/index.ts`.

---

### 1.1 — Add priority hierarchy to top of system prompt

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Add this as the VERY FIRST block in the system prompt, before BASE_PROMPT:

```ts
const PRIORITY_RULES = `## PRIORITY RULES (override everything below when conflicts arise)

When instructions in this prompt conflict, follow this order — higher beats lower:

1. **CURRENT USER MESSAGE** — what the user is asking RIGHT NOW always wins
   - If user says "give me detail" but calibration says BRIEF → give detail
   - If user says "casual tone" but brand voice says "professional" → use casual for this response
   - If user says "just tell me" but pushback says "ask first" → just tell them

2. **TOOL RESTRICTIONS** — never call a tool that doesn't exist or is unconfigured
   - If service status says SERP is unconfigured → don't call SERP tools even if listed
   - If a tool returns an error → tell the user, don't retry silently

3. **RESPONSE CALIBRATION** — urgency/scope detection
   - But user intelligence profile overrides for recurring preferences

4. **TASK PERSONA** — adopt the detected persona
   - But brand voice overrides tone ONLY for content generation, not for chat

5. **BASE PROMPT** — general instructions (lowest priority)

### CHART DECISION TREE:
- 3+ data points → generate chart
- 1-2 data points → show as metric cards in text (no chart)
- 0 data points → explain what's missing and how to get data (no chart)
- User explicitly asks for table → use tableData format
- User explicitly asks for chart → generate chart regardless

### TOOL CALLING DECISION TREE:
- READ query ("show me", "how many", "what's my") → call tool immediately, no questions
- WRITE query, simple ("create a draft about X") → call tool immediately
- WRITE query, ambiguous ("make content") → ask ONE clarifying question, then execute
- WRITE query, destructive (delete, publish) → require confirmation
- MULTI-STEP query → explain the steps, execute first step, ask before continuing
`;

// In prompt assembly:
let systemPrompt = PRIORITY_RULES;
systemPrompt += BASE_PROMPT;
// ... rest of assembly
```

---

### 1.2 — Add tool disambiguation rules

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Add this block AFTER the TOOL_USAGE_MODULE injection:

```ts
const TOOL_DISAMBIGUATION = `## TOOL SELECTION RULES

### Content Creation — use ONLY these:
- User wants AI to write automatically → \`generate_full_content\`
- User wants guided wizard with SERP research → \`launch_content_wizard\`
- When in doubt → ask: "Want me to write it directly, or use the guided wizard?"
- NEVER use \`start_content_builder\` or \`create_content_item\` for creation requests

### Email — always this sequence:
- Convert article to email → \`content_to_email\` (creates draft)
- Create email from scratch → \`create_email_campaign\` (draft)
- Send/schedule existing campaign → \`send_email_campaign\`
- NEVER chain create+send silently — show draft first

### Social Posts — always 2 steps:
- Generate from article → \`repurpose_for_social\`
- Then schedule → \`schedule_social_from_repurpose\`
- Tell user: "Posts generated. Want me to schedule them?"

### Content Improvement:
- General improvement ("make better", "improve SEO") → \`improve_content\`
- Specific format change ("shorter", "casual", "add bullets") → \`reformat_content\`

### Proposals vs Recommendations:
- \`accept_proposal\` → creates a calendar item automatically
- \`accept_recommendation\` → just marks accepted, no side effects
`;

systemPrompt += TOOL_DISAMBIGUATION;
```

---

### 1.3 — Add tool result presentation rules

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Add after TOOL_DISAMBIGUATION:

```ts
const TOOL_RESULT_RULES = `## HOW TO PRESENT TOOL RESULTS

### Success:
- Lead with the key finding: "You have 23 articles, 15 published" — NOT raw JSON
- Format numbers with commas: 12,500 not 12500
- SEO scores as "X/100", percentages as "45.2%"
- Content items: show title, status, SEO score — skip IDs
- More than 5 items: show top 5, say "and X more"

### Errors:
- Tell user what went wrong in plain language
- NEVER retry same tool with same params silently
- Suggest what to do: "Try a different spelling" or "Configure this in Settings"

### HTML in results:
- Strip HTML tags when showing content titles/excerpts
- NEVER echo raw HTML in your response
- Summarize articles — don't paste full HTML

### Previous data:
- If data was fetched earlier in conversation, reference it: "Based on what we looked at..."
- Only re-fetch if user says "refresh", "update", or "check again"
`;

const TOOL_BOUNDARIES = `## WHAT YOU CANNOT DO (never promise these)
- Cannot track real-time Google rankings
- Cannot post directly to social media platforms (posts saved as drafts only)
- Cannot run A/B tests
- Cannot access Google Analytics unless configured in Settings
- Cannot send emails unless Resend is configured in Settings
- Cannot publish to websites unless WordPress/Wix is connected in Settings
- If asked, say so honestly and suggest the closest alternative.
`;

systemPrompt += TOOL_RESULT_RULES;
systemPrompt += TOOL_BOUNDARIES;
```

---

### 1.4 — Fix tool filtering safety net + hide redundant tools

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find line ~3203:
```ts
if (toolsToUse.length < 5) toolsToUse = TOOL_DEFINITIONS;
```

**Replace with:**
```ts
// If intent filtering returns few tools, add core reads only — don't flood with all 89
if (toolsToUse.length < 3) {
  const coreTools = TOOL_DEFINITIONS.filter(t =>
    ['get_content_items', 'get_keywords', 'get_proposals'].includes(t.name)
  );
  toolsToUse = [...new Set([...toolsToUse, ...coreTools])];
}
```

**File:** `supabase/functions/enhanced-ai-chat/tools.ts`

Add filtering to always exclude redundant tools:

```ts
const HIDDEN_TOOLS = ['start_content_builder', 'create_content_item'];

// In the function that returns tool definitions for a request:
// After intent filtering:
toolsToUse = toolsToUse.filter(t => !HIDDEN_TOOLS.includes(t.name));
```

Also remove `send_quick_email` from the cache invalidation map (~line 551):
```ts
// DELETE:
send_quick_email: [],
```

**Frontend:** No changes.

---

## PHASE 2: Provider Normalization + Tokens (20 min)

---

### 2.1 — Normalize AI provider responses in ai-proxy

**File:** `supabase/functions/ai-proxy/index.ts`

Add a normalization function that ensures every provider returns the same shape:

```ts
function normalizeProviderResponse(raw: any, provider: string): any {
  // OpenAI/Mistral/OpenRouter already return correct format
  if (['openai', 'mistral', 'openrouter'].includes(provider)) return raw;

  const normalized: any = {
    choices: [{ message: { role: 'assistant', content: '', tool_calls: [] } }],
    usage: { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 }
  };

  if (provider === 'gemini') {
    const candidate = raw?.candidates?.[0];
    if (candidate?.content?.parts) {
      const textParts = candidate.content.parts.filter((p: any) => p.text);
      normalized.choices[0].message.content = textParts.map((p: any) => p.text).join('');

      const funcParts = candidate.content.parts.filter((p: any) => p.functionCall);
      normalized.choices[0].message.tool_calls = funcParts.map((p: any, i: number) => ({
        id: `call_${i}`,
        type: 'function',
        function: { name: p.functionCall.name, arguments: JSON.stringify(p.functionCall.args || {}) }
      }));
    }
    const meta = raw?.usageMetadata;
    if (meta) {
      normalized.usage = {
        prompt_tokens: meta.promptTokenCount || 0,
        completion_tokens: meta.candidatesTokenCount || 0,
        total_tokens: meta.totalTokenCount || 0
      };
    }
  } else if (provider === 'anthropic') {
    const content = raw?.content || [];
    normalized.choices[0].message.content = content.filter((b: any) => b.type === 'text').map((b: any) => b.text).join('');
    normalized.choices[0].message.tool_calls = content.filter((b: any) => b.type === 'tool_use').map((b: any) => ({
      id: b.id, type: 'function', function: { name: b.name, arguments: JSON.stringify(b.input || {}) }
    }));
    normalized.usage = raw?.usage || normalized.usage;
  }

  if (raw?._autoDetectedModel) normalized._autoDetectedModel = raw._autoDetectedModel;
  return normalized;
}
```

Apply at the end of each provider's chat handler before returning:
```ts
// handleGemini chat: return normalizeProviderResponse(data, 'gemini');
// handleAnthropic chat: return normalizeProviderResponse(data, 'anthropic');
```

---

### 2.2 — Increase max output tokens for Gemini

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find the dynamic max tokens calculation (~line 3130):
```ts
const dynamicMaxTokens = Math.min(Math.max(4096, Math.floor(totalTokens * 0.3)), 16000);
```

**Replace with:**
```ts
const providerOutputLimit = provider?.provider === 'gemini' ? 32000 : 16000;
const dynamicMaxTokens = Math.min(Math.max(4096, Math.floor(totalTokens * 0.3)), providerOutputLimit);
```

---

### 2.3 — Dynamic temperature per task type

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where the AI call is made with temperature. Add dynamic logic:

```ts
let temperature = 0.7;
if (queryIntent.scope === 'lookup' || queryIntent.isConversational) {
  temperature = 0.3; // More deterministic for data queries and chat
}
if (queryIntent.categories?.some((c: string) => ['content'].includes(c)) &&
    toolsToCall?.some((t: string) => ['generate_full_content', 'improve_content', 'reformat_content'].includes(t))) {
  temperature = 0.8; // More creative for content generation
}
```

Pass `temperature` in the AI call params.

**Frontend:** No changes.

---

## PHASE 3: Fix Stale Context (20 min)

---

### 3.1 — Update conversation goal when topic shifts

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

After intent detection, add goal update logic:

```ts
const CATEGORY_TO_GOAL: Record<string, string> = {
  content: 'Content Creation',
  keywords: 'SEO Research',
  campaigns: 'Campaign Management',
  competitors: 'Competitive Analysis',
  analytics: 'Performance Analysis',
  engage: 'Email & Social',
  proposals: 'Strategy Planning'
};

const detectedGoal = CATEGORY_TO_GOAL[queryIntent.categories?.[0] || ''];
const currentGoal = conversationData?.goal;
if (detectedGoal && currentGoal && detectedGoal !== currentGoal) {
  try {
    await supabase.from('ai_conversations')
      .update({ goal: detectedGoal })
      .eq('id', conversationId);
  } catch { /* non-blocking */ }
}
```

---

### 3.2 — Brand voice overridable per request

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Where brand voice is injected, add:

```ts
systemPrompt += brandVoiceContext;
systemPrompt += '\nNote: Brand voice applies to CONTENT GENERATION only. For chat responses, match the user\'s tone. If user asks for a specific tone (e.g., "write casually"), override brand voice for that request.';
```

---

### 3.3 — Data freshness note for long conversations

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Before injecting real data context, add:

```ts
if (conversationMessages.length > 10) {
  systemPrompt += `\n\n**DATA FRESHNESS**: This conversation has ${conversationMessages.length} messages. Data counts below are current, but data in PREVIOUS messages may be outdated if content was created/deleted during this conversation. Re-fetch before answering if uncertain.`;
}
```

**Frontend:** No changes for Phase 3.

---

## PHASE 4: Analyst ↔ AI Sync (30 min)

---

### 4.1 — Pass analyst state to AI in request body

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Create a ref for analyst state:

```ts
const analystStateRef = useRef(analystState);
useEffect(() => {
  analystStateRef.current = analystState;
}, [analystState]);
```

**File:** `src/hooks/useEnhancedAIChatDB.ts`

In `sendMessage`, build and include analyst summary. The hook needs access to the analyst state ref — either pass it as a parameter to sendMessage or accept it via a ref setter.

In the request body construction:

```ts
let analystSummary = null;
if (analystActiveRef.current && analystStateRef?.current) {
  const s = analystStateRef.current;
  analystSummary = {
    healthScore: s.healthScore?.total ?? null,
    healthStatus: s.healthScore?.status ?? null,
    activeWarnings: (s.insightsFeed || [])
      .filter((i: any) => i.type === 'warning')
      .map((i: any) => i.content)
      .slice(0, 5),
    recommendation: s.strategicRecommendation?.stance ?? null,
    userStage: s.userStage ?? null,
    goalProgress: s.goalProgress
      ? { name: s.goalProgress.goalName, pct: s.goalProgress.percentage }
      : null
  };
}

// In fetch body:
body: JSON.stringify({
  messages: messagesToSend,
  context: {
    conversation_id: conversationId,
    analystActive: analystActiveRef.current,
    analystSummary,
    currentPage: typeof window !== 'undefined' ? window.location.pathname : '/ai-chat'
  },
  stream: true
})
```

---

### 4.2 — AI prompt uses analyst summary

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find the existing `analystActive` injection. **Replace** it with:

```ts
if (context?.analystActive) {
  let analystPrompt = '\n\n## ANALYST SIDEBAR — WHAT THE USER SEES RIGHT NOW\n';

  if (context?.analystSummary) {
    const s = context.analystSummary;
    if (s.healthScore !== null) analystPrompt += `Health Score: ${s.healthScore}/100 (${s.healthStatus || '?'})\n`;
    if (s.recommendation) analystPrompt += `Strategic Stance: ${s.recommendation}\n`;
    if (s.userStage) analystPrompt += `User Stage: ${s.userStage}\n`;
    if (s.activeWarnings?.length > 0) {
      analystPrompt += `Active Warnings:\n${s.activeWarnings.map((w: string) => `- ${w}`).join('\n')}\n`;
    }
    if (s.goalProgress) analystPrompt += `Goal: ${s.goalProgress.name} — ${s.goalProgress.pct}%\n`;
    analystPrompt += '\nThe user sees this in the sidebar. Reference these exact values when asked. Don\'t show different numbers.\n';
    analystPrompt += 'Include charts when relevant, but NOT on every response — only when the query is about data or analytics.\n';
  } else {
    analystPrompt += 'Analyst sidebar is open. Include charts when relevant to the query.\n';
  }

  systemPrompt += analystPrompt;
}
```

**Important:** Remove the old heavy-handed injection that says "EVERY response MUST include visualData." Charts should be contextual, not mandatory.

---

### 4.3 — Refresh analyst after AI tool calls

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Create a ref for analyst refresh:

```ts
const analystRefreshRef = useRef<(() => void) | null>(null);
useEffect(() => {
  analystRefreshRef.current = analystState?.triggerRefresh || null;
}, [analystState?.triggerRefresh]);
```

**File:** `src/hooks/useEnhancedAIChatDB.ts` (or wherever the SSE response is fully received)

After a successful AI response, check if it contained write actions and trigger refresh:

```ts
// After final message is set:
const hadWriteAction = finalContent?.match(/✅|Created|Published|Deleted|Updated|Approved|Rejected|Improved|Reformatted/i);
if (hadWriteAction && analystRefreshRef?.current) {
  setTimeout(() => analystRefreshRef.current?.(), 2000);
}
```

**Frontend:** These are the only frontend changes in this plan.

---

## PHASE 5: Fix Analyst Data Accuracy (30 min)

All changes in `src/hooks/useAnalystEngine.ts`.

---

### 5.1 — CRITICAL: Add user_id filter to leaking queries

Find `fetchPlatformData`. Fix these 3 queries:

**engage_contacts** (~line 1319):
```ts
// ADD .eq('user_id', userId)
const { count } = await supabase
  .from('engage_contacts')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);  // ← ADD THIS
```

**email_campaigns** (~line 1327):
```ts
const { count } = await supabase
  .from('email_campaigns')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);  // ← ADD THIS
```

**content_performance_signals** (~line 1337):
```ts
const { data: perfSignals } = await supabase
  .from('content_performance_signals')
  .select('content_id, signal_type')
  .eq('user_id', userId)  // ← ADD THIS
  .limit(100);
```

---

### 5.2 — Fix anomaly IDs to be content-based (not timestamp)

Find all anomaly ID generation. Change from timestamp to content-based:

```ts
// CHANGE ALL THESE:
id: `anomaly-low-seo-${now.getTime()}`      → id: `anomaly-low-seo-${lowSeoCount}`
id: `anomaly-stale-drafts-${now.getTime()}`  → id: `anomaly-stale-drafts-${staleDraftCount}`
id: `anomaly-empty-calendar-${now.getTime()}`→ id: `anomaly-empty-calendar`
id: `anomaly-stale-content-${now.getTime()}` → id: `anomaly-stale-content-${staleCount}`

// AND CROSS-SIGNALS:
id: `cross-seo-declining-${now.getTime()}`   → id: `cross-seo-declining`
id: `cross-seo-improving-${now.getTime()}`   → id: `cross-seo-improving`
id: `cross-publish-gap-${now.getTime()}`     → id: `cross-publish-gap`
id: `cross-topic-concentration-${now.getTime()}` → id: `cross-topic-concentration-${keyword}`
id: `cross-cannibalization-${kw}-${now.getTime()}` → id: `cross-cannibalization-${kw}`
```

This ensures the same anomaly doesn't appear multiple times.

---

### 5.3 — Fix SEO trend to use proper half-split

Find the SEO trend detection in `computeCrossSignals` (~line 204):

```ts
// REPLACE the avgFirst/avgLast calculation with:
if (recentArticles && recentArticles.length >= 4) {
  const scores = recentArticles
    .map((a: any) => a.seo_score as number)
    .filter((s: number) => s != null && s > 0);

  if (scores.length >= 4) {
    const mid = Math.floor(scores.length / 2);
    const recentAvg = scores.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const olderAvg = scores.slice(mid).reduce((a, b) => a + b, 0) / (scores.length - mid);
    const delta = recentAvg - olderAvg;

    // Only trigger if delta is significant AND not caused by single outlier
    if (delta < -10) {
      const outlierCount = scores.slice(0, mid).filter(s => s < olderAvg - 20).length;
      if (outlierCount > 1 || mid <= 2) {
        // Genuine decline, not outlier
        signals.push({ id: 'cross-seo-declining', type: 'warning',
          content: `SEO scores trending down: recent avg ${Math.round(recentAvg)} vs older avg ${Math.round(olderAvg)}` });
      }
    } else if (delta > 10) {
      signals.push({ id: 'cross-seo-improving', type: 'opportunity',
        content: `SEO scores improving: recent avg ${Math.round(recentAvg)} vs older avg ${Math.round(olderAvg)}` });
    }
  }
}
```

---

### 5.4 — Stage-aware health score targets

Find Content Volume factor (~line 654):

```ts
// REPLACE hardcoded /15 with stage-aware target:
const stageTargets: Record<string, number> = {
  starter: 5, growing: 15, established: 30, scaling: 50
};
const target = stageTargets[userStage || 'growing'] || 15;
const volumeScore = Math.min(20, Math.round((totalContent / target) * 20));

factors.push({
  name: 'Content Volume',
  score: volumeScore,
  maxScore: 20,
  status: volumeScore >= 14 ? 'good' : volumeScore >= 8 ? 'warning' : 'critical',
  detail: `${totalContent} pieces (${userStage || 'growing'} target: ${target}+)`,
});
```

---

### 5.5 — Division by zero guard on goals

Find goal progress calculation (~line 1648):

```ts
// REPLACE:
const percentage = Math.min(100, Math.round((currentValue / goal.target_value) * 100));
// WITH:
const targetValue = goal.target_value || 1;
const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
```

---

### 5.6 — Remove seasonal detection

Find the seasonal detection block (~lines 511-549). **Delete the entire block** — the `seasonalTopics` object and the signal generation loop. It's B2C-only and causes irrelevant warnings.

---

### 5.7 — Fix goal progress to use created_at

Find the publish_count goal query (~line 1633):

```ts
// CHANGE:
.gte('updated_at', since)
// TO:
.gte('created_at', since)
```

---

### 5.8 — Strategic recommendation checks trajectory

Find the "fix-quality" rule (~line 1703):

```ts
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
```

**Wrap with trajectory check:**

```ts
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
  // Check if recent articles are improving
  const recentSeoData = platformData
    .filter(d => d.category === 'content' && d.metadata?.seo_score)
    .slice(0, 3);
  const recentAvg = recentSeoData.length > 0
    ? recentSeoData.reduce((sum, d) => sum + (d.metadata?.seo_score || 0), 0) / recentSeoData.length
    : avgSeo;

  if (recentAvg >= 60) {
    // Trajectory is positive — old articles drag avg down
    return {
      stance: 'accelerate',
      reasoning: `Recent articles avg ${Math.round(recentAvg)} SEO — your quality is improving. Old content drags the overall average to ${avgSeo}. Consider rescoring old content in Settings.`,
      promptQuestion: `Your recent content quality is strong. Want me to find your weakest older articles to improve?`,
      actions: [
        { label: 'Find Weakest Articles', prompt: `Show me my published articles with the lowest SEO scores so I can improve them`, effort: 'low', impact: 'high' },
        { label: 'Rescore All Content', prompt: `Rescore all my content to update SEO scores`, effort: 'low', impact: 'medium' }
      ]
    };
  }
  // Genuinely low quality — proceed with fix-quality recommendation
  // ... existing logic
}
```

---

## PHASE 6: Analyst Session + Conversation Reactivity (20 min)

---

### 6.1 — Filter session memory by current topic

**File:** `src/hooks/useAnalystEngine.ts`

Find where session memory is loaded and insights are restored. After restoring:

```ts
// After loading session insights:
if (restoredInsights.length > 0 && topics.length > 0) {
  const currentCategories = topics.map(t => t.category);
  restoredInsights = restoredInsights.filter(insight => {
    // Always keep critical/high urgency
    if (insight.urgency === 'critical' || insight.urgency === 'high') return true;
    // For others, check topic relevance
    const text = (insight.content || '').toLowerCase();
    return currentCategories.some(cat =>
      (cat === 'content' && /content|draft|seo|article/.test(text)) ||
      (cat === 'keywords' && /keyword/.test(text)) ||
      (cat === 'campaigns' && /campaign/.test(text)) ||
      (cat === 'competitors' && /competitor/.test(text)) ||
      (cat === 'email' && /email|engage/.test(text))
    );
  });
}
// If no messages yet (fresh conversation), show all session insights (no filter)
```

---

### 6.2 — NarrativePromptCard actions reference current data

**File:** `src/components/ai-chat/analyst-sections/StrategicStanceSection.tsx`

The actions are already inside `strategicRecommendation` which recomputes via useMemo when platformData changes (1E confirmed DONE). However, make the prompt text explicitly reference live values:

Find where the action prompts are built in the useMemo (~line 1682-1739 of useAnalystEngine.ts). Verify the prompt strings use the current `drafts`, `published`, `avgSeo` variables — not hardcoded numbers.

If they already do (via template literals in the useMemo), this is already handled. Just verify.

---

## VERIFICATION CHECKLIST

**Phase 1:**
- [ ] Ask "show my content" when BRIEF mode detected → AI gives content list (user intent wins over calibration)
- [ ] Ask "write a blog post" → AI calls `generate_full_content` or asks wizard choice — NOT `start_content_builder`
- [ ] Tool returns error → AI says what went wrong in plain English, doesn't retry silently
- [ ] AI never promises to "track your rankings" or "post to LinkedIn directly"

**Phase 2:**
- [ ] With Gemini, AI response works for tool calls (normalized format)
- [ ] With Gemini, max output is 32K (not 16K)
- [ ] Data lookup query → consistent answer both times (low temperature)
- [ ] Content generation → varied/creative output (high temperature)

**Phase 3:**
- [ ] Start conversation about SEO, then switch to email → goal updates from "SEO Research" to "Email & Social"
- [ ] With professional brand voice, ask "write a casual tweet" → tweet is casual (override works)
- [ ] After 15 messages, data numbers reflect current state (freshness note works)

**Phase 4:**
- [ ] With analyst open, ask "why is my health score low?" → AI references exact score and factors from sidebar
- [ ] AI publishes content → analyst sidebar updates within ~3 seconds (not 2 minutes)
- [ ] AI and sidebar show same numbers (not contradicting)

**Phase 5:**
- [ ] engage_contacts count shows only YOUR contacts (not all users')
- [ ] email_campaigns count shows only YOUR campaigns
- [ ] User with 3 articles → health NOT "critical" (starter target = 5)
- [ ] 5 articles [85, 55, 80, 82, 83] → NOT "SEO declining" (single outlier)
- [ ] No seasonal warnings appear
- [ ] Goal target = 0 → no crash
- [ ] Anomaly list has no duplicates after 5 minutes

**Phase 6:**
- [ ] Start email conversation → yesterday's "SEO declining" insight NOT shown
- [ ] Strategic stance action buttons show current draft count

---

## SUMMARY

| Phase | Items | Focus | Files | Time |
|-------|:-----:|-------|-------|:----:|
| 1 | 1.1-1.4 | Priority rules + tool clarity | `enhanced-ai-chat/index.ts`, `tools.ts` | 30 min |
| 2 | 2.1-2.3 | Provider normalization + tokens + temperature | `ai-proxy/index.ts`, `enhanced-ai-chat/index.ts` | 20 min |
| 3 | 3.1-3.3 | Fix stale context | `enhanced-ai-chat/index.ts` | 20 min |
| 4 | 4.1-4.3 | Analyst ↔ AI sync | `EnhancedChatInterface.tsx`, `useEnhancedAIChatDB.ts`, `enhanced-ai-chat/index.ts` | 30 min |
| 5 | 5.1-5.8 | Analyst data accuracy | `useAnalystEngine.ts` | 30 min |
| 6 | 6.1-6.2 | Session memory + action buttons | `useAnalystEngine.ts` | 20 min |
| **Total** | **22** | | **6 files** | **~3.5 hrs** |

**After this plan:**
- AI has clear priority rules for every conflict
- AI sees only relevant tools with clear disambiguation
- AI knows what the analyst sidebar is showing the user
- Analyst updates immediately after AI actions
- No multi-tenant data leaks
- No duplicate anomalies
- Health score is fair for all user stages
- Session memory is topic-relevant
- Temperature matches the task (deterministic for data, creative for content)
- Gemini gets proper output limits and response normalization
