# AI Chat Overhaul — 3:30am March 20

> 40 problems consolidated into 15 implementable fixes.
> Each fix has backend + frontend solution.

---

## CONSOLIDATION: 40 Problems → 15 Fixes

| Fix | Problems it solves |
|-----|-------------------|
| 1. Response calibration per query complexity | #1 (same depth for all), #11 (no urgency), #17 (charts nobody asked for), #32 (doesn't shut up), #37 (doesn't adapt to interaction style) |
| 2. Strategic pushback before execution | #2 (never pushes back), #8 (hallucinates actions), #12 (never says "I need more info"), #21 (show vs do confusion), #40 (exploring vs deciding) |
| 3. End-to-end workflow orchestration | #3 (generates in isolation), #6 (can't run multi-step), #24 (can't batch), #34 (no content dependencies) |
| 4. Cross-conversation intelligence | #4 (blank slate every conversation), #19 (doesn't use full context), #25 (loses thread in long conversations), #29 (doesn't surface what changed) |
| 5. Proactive opening with agenda | #5 (waits to be asked), #29 (doesn't surface changes), #36 (can't prioritize competing demands) |
| 6. Task-adaptive persona | #7 (same persona for everything), #39 (treats all content types same) |
| 7. Real-time feedback loop within conversation | #9 (doesn't learn from rejection), #31 (can't handle corrections gracefully) |
| 8. Smart quick actions based on user state | #10 (generic quick actions), #16 (doesn't celebrate momentum) |
| 9. Conversation outcome tracking | #13 (wall of text), #23 (useless titles) |
| 10. Prerequisite checking before promises | #8 (hallucinates actions), #15 (error recovery dead end) |
| 11. Fuzzy content matching by name | #22 (can't work with content by name) |
| 12. Trade-off reasoning | #27 (doesn't explain trade-offs), #30 (can't teach) |
| 13. Undo and safety net | #26 (can't undo), #28 (no conditional logic) |
| 14. Workflow resumption | #38 (can't resume mid-way), #25 (loses thread) |
| 15. Cross-content comparison and computation | #18 (can't do math on own data), #33 (can't compare multiple pieces), #35 (doesn't know audience questions) |

---

## FIX 1: Response Calibration Per Query Complexity

**Problems:** #1, #11, #17, #32, #37

**What:** The AI should give 1-sentence answers to simple questions, detailed analysis to complex ones, and emergency-mode responses to critical issues. No charts for "how many articles do I have?"

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — expand the existing `lengthGuidance` (line ~2798) into a full response calibration system.

After query intent is determined, build a calibration block:

```ts
// Response calibration (replaces simple lengthGuidance)
let responseCalibration = '';

// Detect message style: short rapid messages vs long thoughtful ones
const userMessages = messages.filter(m => m.role === 'user');
const avgUserMsgLength = userMessages.length > 0
  ? userMessages.reduce((s, m) => s + m.content.length, 0) / userMessages.length
  : 100;
const isRapidFireMode = avgUserMsgLength < 50 && userMessages.length >= 3;

// Detect urgency from keywords
const urgencyKeywords = /fail|error|broken|crash|urgent|emergency|not working|down|stuck/i;
const isUrgent = urgencyKeywords.test(userQuery);

if (isUrgent) {
  responseCalibration = `
## RESPONSE MODE: URGENT
The user has a critical issue. Respond with:
1. Immediate diagnosis (1-2 sentences)
2. Fix action (tool call or specific instruction)
3. Skip charts, skip analysis, skip pleasantries
Keep under 100 words unless the fix itself requires detail.`;
} else if (queryIntent.scope === 'conversational') {
  responseCalibration = `
## RESPONSE MODE: BRIEF
Simple question or greeting. Respond in 1-3 sentences.
NO charts. NO visualData. NO deep-dive prompts. NO action buttons unless directly relevant.
Just answer the question directly.`;
} else if (queryIntent.scope === 'summary') {
  responseCalibration = `
## RESPONSE MODE: COMPACT
Direct answer with key numbers. Under 150 words.
Include a chart ONLY if comparing 3+ data points. Otherwise use inline bold numbers.
1-2 action buttons max.`;
} else if (isRapidFireMode) {
  responseCalibration = `
## RESPONSE MODE: EXECUTION
User is sending rapid short messages — they're in execution mode.
Give quick confirmations: "Done. Article saved." / "Added. 3 keywords tracked."
Skip explanations unless asked. Match their brevity.`;
} else if (queryIntent.scope === 'detailed' || queryIntent.scope === 'full') {
  responseCalibration = `
## RESPONSE MODE: THOROUGH
User wants deep analysis. Provide:
- Charts with real data
- Metric cards
- Specific numbers and trends
- 3-5 actionable recommendations
- Deep-dive prompts for follow-up
300-600 words is appropriate.`;
}

systemPrompt += responseCalibration;
```

### Frontend

No frontend changes — calibration happens entirely in the system prompt.

---

## FIX 2: Strategic Pushback Before Execution

**Problems:** #2, #8, #12, #21, #40

**What:** Before executing any write action, the AI checks: is this on-brand? Is the prerequisite met? Does the user want to browse or execute? If anything is off, it asks instead of blindly proceeding.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — add to the system prompt, in the tool usage section:

```ts
const PUSHBACK_PROTOCOL = `
## STRATEGIC PUSHBACK PROTOCOL (MANDATORY)

Before calling ANY write tool (create, generate, update, delete, send, publish), you MUST:

1. **Check prerequisites**: Does the user have the required API key/connection? If not, tell them what's needed BEFORE attempting the tool. Never promise then fail.

2. **Check relevance**: Does the request match the user's offerings/brand? If they ask to write about a topic unrelated to their solutions, say: "This topic doesn't relate to any of your offerings ([list offerings]). Should I proceed anyway, or would you prefer a topic that supports your business?"

3. **Clarify ambiguity**: If the request is vague ("make my content better", "help with marketing"), ask ONE specific clarifying question. Don't guess. Examples:
   - "Better how? Higher SEO score, more engaging, shorter, or targeting a different audience?"
   - "Which specific article? I found 3 that match — [list titles]."

4. **Distinguish browse vs execute**: If the user says "show me", "what about", "tell me about" — they're browsing. READ tools only. If they say "create", "write", "generate", "send", "delete" — they're executing. WRITE tools.

5. **Check if this is exploration or a decision**: "Tell me about campaign strategies" → explain options. "Run this campaign" → execute. When unclear, ask: "Want me to explain the options or execute one?"

Exception: If the user explicitly says "just do it", "skip questions", or "don't ask", proceed immediately.`;

systemPrompt += PUSHBACK_PROTOCOL;
```

### Frontend

No frontend changes.

---

## FIX 3: End-to-End Workflow Orchestration

**Problems:** #3, #6, #24, #34

**What:** When the user creates content, the AI automatically suggests the full downstream workflow: schedule → social → email → publish. Multi-step workflows run conversationally with user checkpoints.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — add workflow awareness to the system prompt:

```ts
const WORKFLOW_PROTOCOL = `
## WORKFLOW ORCHESTRATION

When a user completes a significant action, proactively suggest the logical next step:

- Content created → "Want me to schedule this, create social posts, or send as an email?"
- Content published → "Should I create social media posts to promote this?"
- Campaign created → "Ready to generate strategy and content for this campaign?"
- Keyword added → "Want me to check SERP data for this keyword?"
- Competitor added → "Should I run a competitive analysis?"
- Email campaign created → "Ready to send, or schedule for a specific time?"

For MULTI-STEP workflows ("audit my content", "run full pipeline", "review everything"):
1. Execute ONE step
2. Show the result with specific data
3. Ask: "Should I continue to step 2, or adjust?"
4. Wait for confirmation
5. Never execute all steps silently

For BATCH operations ("add these keywords", "publish my top 5"):
- Parse the list/number from the message
- Execute in a single tool call if the tool supports arrays
- Confirm the batch: "Added 5 keywords: [list]. All correct?"`;

systemPrompt += WORKFLOW_PROTOCOL;
```

### Frontend

No frontend changes — the AI's conversational workflow runs through normal chat messages.

---

## FIX 4: Cross-Conversation Intelligence

**Problems:** #4, #19, #25, #29

**What:** The AI knows your strategic context from past conversations. When you open a new conversation, it already knows "you're focused on enterprise HR buyers" and "last session you decided to prioritize SEO optimization over new content."

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — the user intelligence profile injection already exists. Enhance it with conversation-level strategic context.

**File:** `supabase/functions/shared/userIntelligence.ts` — add strategic context extraction:

```ts
// In rebuildUserProfile, add:
// Extract strategic decisions from conversation goals and summaries
const { data: recentConvos } = await supabase
  .from('ai_conversations')
  .select('title, goal, summary')
  .eq('user_id', userId)
  .not('goal', 'is', null)
  .order('updated_at', { ascending: false })
  .limit(5);

const strategicContext: string[] = [];
for (const conv of (recentConvos || [])) {
  if (conv.goal) strategicContext.push(`Recent goal: ${conv.goal}`);
  if (conv.summary) strategicContext.push(`Session outcome: ${conv.summary.slice(0, 100)}`);
}

// Store in profile
await supabase.from('user_intelligence_profile').upsert({
  user_id: userId,
  // ...existing fields...
  strategic_context: strategicContext.slice(0, 5),
}, { onConflict: 'user_id' });
```

**DB migration needed:**
```sql
ALTER TABLE public.user_intelligence_profile ADD COLUMN IF NOT EXISTS strategic_context JSONB DEFAULT '[]';
```

In `getUserIntelligenceContext`, include strategic context:
```ts
if (profile.strategic_context && Array.isArray(profile.strategic_context) && profile.strategic_context.length > 0) {
  parts.push(`Recent strategic focus: ${profile.strategic_context.slice(0, 3).join('; ')}`);
}
```

### Frontend

No frontend changes.

---

## FIX 5: Proactive Opening With Agenda

**Problems:** #5, #29, #36

**What:** When the user opens the chat, the AI's first interaction (or the welcome screen) shows what needs attention RIGHT NOW, prioritized by urgency, not just badges.

### Backend

**File:** `supabase/functions/generate-proactive-insights/index.ts` — this already generates recommendations. Enhance with prioritization:

Add a `priority_score` to each recommendation (0-100) based on:
- Failed campaign items → 95 (broken, needs immediate fix)
- Content ready to publish (high SEO draft) → 80 (quick win)
- Empty calendar next 7 days → 75 (upcoming gap)
- Competitor analysis stale > 30 days → 60 (strategic)
- Unused proposals → 50 (opportunity)
- General suggestions → 30

The frontend already shows `proactive_recommendations` on the welcome screen. Just ensure they're sorted by priority.

### Frontend

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` — where proactive insights are rendered, change the format from badges to a prioritized action list:

```tsx
{recommendations.length > 0 && (
  <div className="w-full max-w-[720px] space-y-2 mb-6">
    <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">Needs your attention</p>
    {recommendations.slice(0, 3).map((rec, i) => (
      <button
        key={rec.id}
        onClick={() => sendMessage(rec.action)}
        className={cn(
          "w-full text-left p-3 rounded-xl border transition-colors",
          i === 0 ? "border-primary/20 bg-primary/5 hover:bg-primary/10" : "border-border/10 bg-muted/5 hover:bg-muted/10"
        )}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">{rec.title}</p>
          {i === 0 && <Badge variant="outline" className="text-[8px] text-primary border-primary/20">Priority</Badge>}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
      </button>
    ))}
  </div>
)}
```

---

## FIX 6: Task-Adaptive Persona

**Problems:** #7, #39

**What:** The AI's tone and format change based on what it's doing. Writing content → creative voice. Debugging failures → technical diagnostic. Analyzing data → data-dense reporting.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — after query intent detection, inject a persona:

```ts
// Task-adaptive persona
let persona = '';
const detectedTask = userQuery.toLowerCase();

if (/write|create|draft|blog|article|post/.test(detectedTask) && queryIntent.categories.includes('content')) {
  persona = '\n## PERSONA: Creative Strategist\nWrite with personality. Be opinionated about angles. Suggest unexpected hooks. Use vivid language in your suggestions. When discussing content ideas, think like a creative director, not a database.';
} else if (/fail|error|retry|broken|queue|stuck/.test(detectedTask)) {
  persona = '\n## PERSONA: Technical Diagnostician\nBe precise. State the problem, the cause, and the fix. No fluff. Use bullet points. If you need to run tools to diagnose, do it immediately. Think like a support engineer.';
} else if (/analyz|perform|metric|compare|trend|report/.test(detectedTask)) {
  persona = '\n## PERSONA: Data Analyst\nLead with numbers. Every claim needs a data point. Use charts for comparisons. Highlight anomalies. Think like a business intelligence analyst presenting to a stakeholder.';
} else if (/campaign|strategy|plan|roadmap/.test(detectedTask)) {
  persona = '\n## PERSONA: Strategy Consultant\nThink in frameworks. Present options with trade-offs. Prioritize by impact vs effort. Always end with a clear recommendation. Think like a McKinsey consultant.';
} else if (/email|social|engage|contact|segment/.test(detectedTask)) {
  persona = '\n## PERSONA: Marketing Operator\nBe practical. Focus on execution. Suggest specific subject lines, send times, audience segments. Think like a hands-on marketing manager.';
}

if (persona) systemPrompt += persona;
```

### Frontend

No frontend changes.

---

## FIX 7: Real-Time Feedback Loop Within Conversation

**Problems:** #9, #31

**What:** When the user thumbs-down or regenerates, the AI adjusts within the SAME conversation. When the user says "make it more technical", the AI surgically adjusts instead of regenerating from scratch.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — detect correction patterns in the conversation history:

```ts
// Detect correction patterns in recent messages
const recentUserMsgs = messages.filter(m => m.role === 'user').slice(-5);
const correctionPatterns: string[] = [];

for (const msg of recentUserMsgs) {
  const lower = msg.content.toLowerCase();
  if (/shorter|concise|brief|less|too long/i.test(lower)) correctionPatterns.push('User wants SHORTER responses');
  if (/longer|more detail|elaborate|expand/i.test(lower)) correctionPatterns.push('User wants MORE DETAIL');
  if (/technical|specific|precise/i.test(lower)) correctionPatterns.push('User wants MORE TECHNICAL depth');
  if (/simpler|easier|basic|eli5/i.test(lower)) correctionPatterns.push('User wants SIMPLER language');
  if (/different|not what i meant|no,|wrong|try again/i.test(lower)) correctionPatterns.push('User rejected the previous approach — try a DIFFERENT angle');
  if (/more like|similar to|in the style of/i.test(lower)) correctionPatterns.push('User wants a specific style — match it');
}

if (correctionPatterns.length > 0) {
  systemPrompt += `\n\n## IN-SESSION CORRECTIONS (apply these NOW):\n${[...new Set(correctionPatterns)].join('\n')}`;
}
```

For surgical edits (user says "make it more technical" about a generated article):

```ts
// Detect edit-in-place requests
const isEditRequest = /make it|change it to|adjust the|more |less |too /i.test(userQuery) &&
  messages.length >= 2 &&
  messages[messages.length - 2]?.role === 'assistant';

if (isEditRequest) {
  systemPrompt += `\n\n## EDIT MODE: The user wants to modify the PREVIOUS response. Do NOT regenerate from scratch. Apply the specific change they asked for while keeping everything else intact. Return ONLY the modified version.`;
}
```

### Frontend

No frontend changes.

---

## FIX 8: Smart Quick Actions Based on User State

**Problems:** #10, #16

**What:** Quick actions change based on what the user needs right now, not a static list.

### Frontend

**File:** `src/components/ai-chat/EnhancedQuickActions.tsx` — replace the static `suggestions` array with data-driven actions:

```tsx
interface SmartQuickActionsProps {
  onAction: (action: string, data?: any) => void;
  onSetVisualization?: (visualData: any) => void;
  recommendations?: Array<{ title: string; action: string; priority: number }>;
  contentCount?: number;
  publishedCount?: number;
  draftCount?: number;
}

export const EnhancedQuickActions: React.FC<SmartQuickActionsProps> = ({
  onAction, onSetVisualization, recommendations, contentCount = 0, publishedCount = 0, draftCount = 0
}) => {
  const suggestions = useMemo(() => {
    const items: Array<{ text: string; prompt: string; directWizard?: boolean; icon: any; iconColor: string }> = [];

    // Priority: proactive recommendations first
    if (recommendations?.length) {
      for (const rec of recommendations.slice(0, 2)) {
        items.push({ text: rec.title, prompt: rec.action, icon: Zap, iconColor: 'text-primary' });
      }
    }

    // State-based actions
    if (contentCount === 0) {
      items.push({ text: 'Create your first article', prompt: '', directWizard: true, icon: PenTool, iconColor: 'text-purple-400' });
    } else if (draftCount > publishedCount * 2) {
      items.push({ text: `Review ${draftCount} drafts`, prompt: 'Show my top drafts by SEO score — which should I publish?', icon: FileText, iconColor: 'text-amber-400' });
    } else {
      items.push({ text: 'Write content', prompt: '', directWizard: true, icon: PenTool, iconColor: 'text-purple-400' });
    }

    // Milestone celebrations
    if (publishedCount === 10 || publishedCount === 25 || publishedCount === 50) {
      items.push({ text: `🎉 ${publishedCount} articles! What's next?`, prompt: `I just hit ${publishedCount} published articles. What should my next strategic focus be?`, icon: Star, iconColor: 'text-yellow-400' });
    }

    // Fill remaining with contextual defaults
    const defaults = [
      { text: 'Research keywords', prompt: 'Show me my tracked keywords and suggest new opportunities', icon: Search, iconColor: 'text-amber-400' },
      { text: 'Check performance', prompt: 'How is my content performing this week vs last week?', icon: BarChart3, iconColor: 'text-orange-400' },
      { text: 'What can you do?', prompt: '/help', icon: HelpCircle, iconColor: 'text-violet-400' },
    ];

    for (const d of defaults) {
      if (items.length < 6 && !items.some(i => i.text === d.text)) items.push(d);
    }

    return items.slice(0, 6);
  }, [recommendations, contentCount, publishedCount, draftCount]);

  // ... existing render logic
};
```

Pass the data from `EnhancedChatInterface` where `PlatformSummaryCard` already fetches counts.

### Backend

No backend changes — recommendations already come from `proactive_recommendations` table.

---

## FIX 9: Conversation Outcome Tracking

**Problems:** #13, #23

**What:** Conversations get meaningful titles based on what was accomplished, and the AI periodically summarizes progress.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — after a successful tool execution, generate an outcome-based title suggestion:

```ts
// After tool execution succeeds, suggest a better conversation title
if (toolResults.some(r => r.success)) {
  const outcomes = toolResults
    .filter(r => r.success)
    .map(r => r.toolName.replace(/_/g, ' '))
    .slice(0, 2);

  // Include in response metadata for frontend to use
  responseData.suggestedTitle = outcomes.length > 0
    ? `${outcomes[0]}${outcomes.length > 1 ? ' + more' : ''}`
    : undefined;
}
```

### Frontend

**File:** `src/hooks/useEnhancedAIChatDB.ts` — after receiving a response with `suggestedTitle`:

```ts
// After parsing response, check for better title
if (response.suggestedTitle && conversationId) {
  const currentConv = conversations.find(c => c.id === conversationId);
  // Only update if current title is the default truncated first message
  if (currentConv && currentConv.title.length <= 50 && !currentConv.title.includes(':')) {
    await supabase.from('ai_conversations')
      .update({ title: response.suggestedTitle })
      .eq('id', conversationId);
    setConversations(prev => prev.map(c =>
      c.id === conversationId ? { ...c, title: response.suggestedTitle } : c
    ));
  }
}
```

For progress summaries, add to the system prompt:

```ts
// Every 8 messages, inject a summary instruction
if (messages.length > 0 && messages.length % 8 === 0) {
  systemPrompt += `\n\n## SESSION CHECKPOINT: You've exchanged ${messages.length} messages. Before answering this message, include a brief 1-2 sentence summary of what's been accomplished so far in this conversation. Format: "**Session so far:** [summary]" at the top of your response.`;
}
```

---

## FIX 10: Prerequisite Checking Before Promises

**Problems:** #8, #15

**What:** Before calling any tool that depends on external configuration (Resend, SERP, WordPress, image provider), check if the prerequisite exists and tell the user BEFORE attempting.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — add prerequisite context to the system prompt, built from actual data:

```ts
// Build prerequisite awareness
const prerequisiteContext: string[] = [];

// Check which services are configured
const { data: configuredKeys } = await supabase
  .from('api_keys')
  .select('service')
  .eq('user_id', user.id)
  .eq('is_active', true);

const configuredServices = new Set((configuredKeys || []).map(k => k.service));

if (!configuredServices.has('serp') && !configuredServices.has('serpstack')) {
  prerequisiteContext.push('SERP API: NOT configured — cannot run SERP analysis or web search');
}
if (!configuredServices.has('resend')) {
  prerequisiteContext.push('Resend (email): NOT configured — cannot send emails');
}

const { data: websiteConn } = await supabase
  .from('website_connections')
  .select('id')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .limit(1);

if (!websiteConn?.length) {
  prerequisiteContext.push('Website publishing: NOT connected — cannot publish to WordPress/Wix');
}

if (prerequisiteContext.length > 0) {
  systemPrompt += `\n\n## SERVICE STATUS (check BEFORE promising any action):\n${prerequisiteContext.join('\n')}\nIf a user asks for something that requires an unconfigured service, tell them what's needed BEFORE attempting the tool. Include an action button: "Open Settings → API Keys"`;
}
```

### Frontend

No frontend changes.

---

## FIX 11: Fuzzy Content Matching by Name

**Problems:** #22

**What:** When the user references content by name ("update my AI marketing article"), the AI fuzzy-matches against titles instead of requiring UUIDs.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — add to the system prompt:

```ts
systemPrompt += `\n\n## CONTENT MATCHING
When the user refers to content by name (not UUID), use get_content_items to search, then:
1. If exactly 1 match: proceed with that item
2. If 2-3 matches: ask the user which one: "I found [N] articles matching '[query]' — did you mean: 1) [title A] 2) [title B]?"
3. If 0 matches: say "I couldn't find an article matching '[query]'. Try a different name or say 'show my content' to browse."
Never guess when multiple matches exist.`;
```

No code changes needed — this is a system prompt instruction. The AI uses the existing `get_content_items` tool with text filtering.

### Frontend

No frontend changes.

---

## FIX 12: Trade-Off Reasoning

**Problems:** #27, #30

**What:** When the user asks "should I do X or Y?", the AI explains trade-offs with specific data. When it executes, it explains WHY it made certain choices so the user learns.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — add to the system prompt:

```ts
systemPrompt += `\n\n## TRADE-OFF REASONING
When the user asks for a choice between options, ALWAYS:
1. State both options clearly
2. Give specific advantages/disadvantages with numbers when possible
3. Recommend one based on the user's current situation (their data, their stage, their goals)
4. Explain WHY you recommend it

When you execute a tool or generate content, briefly explain one key decision you made:
"I structured this with Key Takeaways first because Google's featured snippet algorithm favors this format."
"I chose a how-to format because your how-to articles average 62 SEO vs 41 for listicles."
This teaches the user without lecturing.`;
```

### Frontend

No frontend changes.

---

## FIX 13: Undo and Safety Net

**Problems:** #26, #28

**What:** After any destructive action, show an undo window. For non-destructive but significant actions, show what was done with a revert option.

### Backend

Content versioning already exists (creates a snapshot before update). For deletes, the system already uses soft-delete (archive). The missing piece is surfacing undo in the response.

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — in tool response messages, include undo hints:

```ts
// After delete_content_item:
return {
  success: true,
  message: `Archived "${data.title}". This can be undone — say "restore [title]" to bring it back.`,
  // ...
};

// After update_content_item:
return {
  success: true,
  message: `Updated "${data.title}". Previous version saved — say "show version history for [title]" to compare or restore.`,
  // ...
};
```

### Frontend

No frontend changes — undo information is in the AI response text.

---

## FIX 14: Workflow Resumption

**Problems:** #38, #25

**What:** If the user was mid-workflow and left, the AI picks up where they stopped.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — check for incomplete workflows at the start of each conversation:

```ts
// Check for interrupted workflows
if (context?.conversation_id) {
  const { data: lastMessages } = await supabase
    .from('ai_messages')
    .select('content, function_calls')
    .eq('conversation_id', context.conversation_id)
    .order('created_at', { ascending: false })
    .limit(3);

  if (lastMessages?.length) {
    const lastAssistant = lastMessages.find(m => m.function_calls);
    if (lastAssistant?.function_calls) {
      const calls = typeof lastAssistant.function_calls === 'string'
        ? JSON.parse(lastAssistant.function_calls) : lastAssistant.function_calls;

      // Check if last action was a multi-step workflow
      const wasGenerating = calls.some((c: any) => c.name === 'generate_full_content' || c.name === 'trigger_content_generation');
      const wasAnalyzing = calls.some((c: any) => c.name === 'get_content_items' || c.name === 'get_campaign_intelligence');

      if (wasGenerating) {
        systemPrompt += `\n\n[WORKFLOW CONTEXT] Last session involved content generation. If the user's message is ambiguous, ask: "Last time we were creating content — want to continue where we left off or start something new?"`;
      } else if (wasAnalyzing) {
        systemPrompt += `\n\n[WORKFLOW CONTEXT] Last session was analytical. The user was reviewing data. Pick up from the analysis context.`;
      }
    }
  }
}
```

### Frontend

The Content Wizard already has localStorage save/restore. No additional frontend changes needed.

---

## FIX 15: Cross-Content Comparison and Computation

**Problems:** #18, #33, #35

**What:** The AI can compare multiple content pieces, do math on its own data, and proactively surface audience questions.

### Backend

Add a new tool `compare_content` to `content-action-tools.ts`:

```ts
{
  name: "compare_content",
  description: "Compare 2-5 content items by SEO score, word count, keyword usage, and structure. Use when user says 'compare my articles', 'which article is best', or 'rank my content'.",
  parameters: {
    type: "object",
    properties: {
      content_ids: { type: "array", items: { type: "string" }, description: "UUIDs of content items to compare" },
      search_query: { type: "string", description: "Search term to find articles to compare (if no IDs provided)" },
      limit: { type: "number", default: 5 }
    }
  }
}
```

Handler:
```ts
case 'compare_content': {
  let articles;
  if (toolArgs.content_ids?.length) {
    const { data } = await supabase.from('content_items')
      .select('id, title, seo_score, content, content_type, main_keyword, created_at')
      .in('id', toolArgs.content_ids).eq('user_id', userId);
    articles = data;
  } else if (toolArgs.search_query) {
    const { data } = await supabase.from('content_items')
      .select('id, title, seo_score, content, content_type, main_keyword, created_at')
      .eq('user_id', userId).ilike('title', `%${toolArgs.search_query}%`)
      .limit(toolArgs.limit || 5);
    articles = data;
  }

  if (!articles?.length) return { success: false, message: 'No matching articles found.' };

  const comparison = articles.map((a: any) => ({
    title: a.title,
    seo_score: a.seo_score || 0,
    word_count: (a.content || '').split(/\s+/).length,
    headings: ((a.content || '').match(/<h2/gi) || []).length,
    has_faq: /FAQ|Frequently Asked/i.test(a.content || ''),
    keyword: a.main_keyword,
    age_days: Math.round((Date.now() - new Date(a.created_at).getTime()) / 86400000)
  }));

  const best = comparison.sort((a, b) => b.seo_score - a.seo_score)[0];
  const worst = comparison.sort((a, b) => a.seo_score - b.seo_score)[0];

  return {
    success: true,
    message: `Compared ${comparison.length} articles:\n\n**Best:** "${best.title}" (SEO: ${best.seo_score}, ${best.word_count} words)\n**Weakest:** "${worst.title}" (SEO: ${worst.seo_score}, ${worst.word_count} words)`,
    comparison,
    visualData: {
      type: 'chart',
      title: 'Article Comparison',
      chartConfig: {
        type: 'bar',
        data: comparison.map(c => ({ name: c.title.slice(0, 20), seo_score: c.seo_score, word_count: Math.round(c.word_count / 100) })),
        categories: ['name'],
        series: [{ dataKey: 'seo_score', name: 'SEO Score' }, { dataKey: 'word_count', name: 'Words (×100)' }]
      }
    }
  };
}
```

### Frontend

No new components — the comparison data renders as a chart via existing `VisualDataRenderer`.

---

## IMPLEMENTATION ORDER

| Sprint | Fixes | Backend | Frontend | Effort |
|--------|-------|:-------:|:--------:|--------|
| 1 | Fix 1 (Response calibration) + Fix 2 (Strategic pushback) + Fix 6 (Task persona) | System prompt additions | None | 1 hr |
| 2 | Fix 3 (Workflow orchestration) + Fix 7 (Feedback loop) + Fix 12 (Trade-offs) | System prompt additions | None | 45 min |
| 3 | Fix 5 (Proactive opening) + Fix 8 (Smart quick actions) + Fix 9 (Outcome tracking) | Recommendation priority + title suggestion | Quick actions component + title update | 2 hrs |
| 4 | Fix 10 (Prerequisite checking) + Fix 11 (Fuzzy matching) + Fix 13 (Undo) | Service status context + response hints | None | 1 hr |
| 5 | Fix 4 (Cross-conversation intelligence) + Fix 14 (Workflow resumption) + Fix 15 (Content comparison) | Profile enhancement + workflow context + new tool | None | 2 hrs |

**Total: ~7 hours across 5 sprints.**

**Sprint 1 is the highest-impact, zero-frontend sprint.** Three system prompt additions — response calibration, strategic pushback, and task persona — that immediately change how the AI behaves. Under 1 hour of work, all backend.
