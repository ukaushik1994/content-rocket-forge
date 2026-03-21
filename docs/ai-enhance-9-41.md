# AI Chat Enhancement — 9:41pm March 19

> Problems found through deep-dive. Each one affects real user experience.

---

## PROBLEM 1: Analyst sidebar bleeds across conversations

**What happens:** Open Analyst in conversation A, build up insights. Switch to conversation B — Analyst sidebar still shows conversation A's data for a moment. Sidebar open state persists across conversation switches.

**Root cause:** `isAnalystPanelActive`, `showVisualizationSidebar`, `sidebarInteracted`, and `visualizationData` are all `useState` on `EnhancedChatInterface` — they don't reset when `activeConversation` changes. Only `userClosedSidebar` resets (line 326).

### Fix

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` — line 324-327

Find:
```ts
  // Reset close intent when starting a new conversation
  useEffect(() => {
    setUserClosedSidebar(false);
  }, [activeConversation]);
```

Replace with:
```ts
  // Reset ALL sidebar state when switching conversations
  useEffect(() => {
    setUserClosedSidebar(false);
    setIsAnalystPanelActive(false);
    setShowVisualizationSidebar(false);
    setSidebarInteracted(false);
    setVisualizationData(null);
  }, [activeConversation]);
```

**Frontend only.** No backend changes.

---

## PROBLEM 2: Sidebar auto-opens on old conversations

**What happens:** Switch to an old conversation that has messages with `visualData` — the sidebar immediately pops open with that old chart, even though the user didn't ask for it. Jarring UX.

**Root cause:** The auto-open effect (line 279-322) runs on every `messages` change, including when loading historical messages. It can't distinguish "new message just arrived" from "loaded old messages."

### Fix

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Track the previous message count to detect new messages vs loaded messages:

```ts
const prevMessageCountRef = useRef(0);

// Replace the existing auto-open effect (lines 279-322) with:
useEffect(() => {
  if (userClosedSidebar) return;

  const isNewMessage = messages.length > prevMessageCountRef.current && prevMessageCountRef.current > 0;
  prevMessageCountRef.current = messages.length;

  // Only auto-open for NEW messages, not loaded history
  if (!isNewMessage) {
    // On conversation load, close sidebar unless user explicitly opened it
    if (!sidebarInteracted) {
      setShowVisualizationSidebar(false);
    }
    return;
  }

  // Check if the latest (new) message has visual data
  const latest = messages[messages.length - 1];
  if (latest?.role === 'assistant' && latest.visualData &&
      latest.visualData.type !== 'serp_analysis' &&
      latest.visualData.type !== 'content_creation_choice') {
    setVisualizationData({
      visualData: latest.visualData,
      chartConfig: latest.visualData?.chartConfig || null,
      title: latest.visualData?.title || 'Data Visualization',
      description: latest.visualData?.description
    });
    setShowVisualizationSidebar(true);
  }
}, [messages, sidebarInteracted, userClosedSidebar]);

// Reset message count ref on conversation switch
useEffect(() => {
  prevMessageCountRef.current = 0;
}, [activeConversation]);
```

**Frontend only.** No backend changes.

---

## PROBLEM 3: AI response quality is mediocre

Three sub-problems that compound:

### 3a: `<think>` tags waste tokens on models that don't benefit

**What happens:** The BASE_PROMPT forces ALL AI providers to use `<think>` tags. This is useful for reasoning-focused models (Claude, o3) but wastes tokens on GPT-4o-mini, Gemini, Mistral. The thinking output gets stripped (line 1180) but the tokens are already consumed.

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — line 250-272

### Fix

Make `<think>` conditional on the provider:

```ts
// After resolving the provider (around line 2150), before building systemPrompt:
const supportsThinking = ['anthropic', 'openrouter'].includes(provider.provider) &&
  (provider.preferred_model || '').includes('claude');

// In BASE_PROMPT, split the thinking instruction:
const THINKING_INSTRUCTION = `
🧠 THINKING PROCESS (CRITICAL FORMAT):
• You MUST wrap your reasoning in <think></think> tags
• <think> tags are INTERNAL ONLY - they will be processed separately by the system
• NEVER include <think> tags in your conversational response text
• Structure: <think>your reasoning</think> THEN your user-facing response`;

const NO_THINKING_INSTRUCTION = `
🧠 RESPONSE FORMAT:
• Go straight to your answer — no preamble or meta-commentary
• Structure your response clearly with headings and bullet points when appropriate`;

// When building systemPrompt:
const thinkingBlock = supportsThinking ? THINKING_INSTRUCTION : NO_THINKING_INSTRUCTION;
systemPrompt = BASE_PROMPT_WITHOUT_THINKING + thinkingBlock + restOfPrompt;
```

This requires splitting `BASE_PROMPT` so the thinking instruction is separate from the rest of the base instructions.

### 3b: Visual-first mandate forces chart generation on everything

**What happens:** The system prompt says "ALWAYS include visualData with charts, metric cards, actionable items, insights, deepDivePrompts" for data queries. But the line between "data query" and "simple question" is blurry. "What keywords do I have?" triggers chart generation when a simple list would be better.

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — CHART_MODULE and the visual mandate instructions

### Fix

Replace the blanket visual mandate with a smarter instruction:

```ts
// In CHART_MODULE, replace the "ALWAYS include visualData" instruction with:
const VISUAL_GUIDANCE = `
📊 VISUALIZATION DECISION:
Generate charts and visualData ONLY when the response includes 3+ data points that benefit from visual comparison.

USE charts for:
- Comparing values across items (SEO scores, keyword volumes, campaign metrics)
- Showing trends over time
- Distribution/proportion analysis

DO NOT generate charts for:
- Simple counts ("you have 20 articles" — just say the number)
- Yes/no answers
- Single-item lookups
- Conversational responses
- Lists of items (use markdown lists instead)

When you DO generate a chart, also include a brief text summary so the response works even without the visual.`;
```

### 3c: Response length doesn't adapt to query complexity

**What happens:** A simple "what's my SEO score?" gets the same treatment as "analyze my content strategy against all competitors." Both get massive system prompts, chart mandates, and deep-dive prompts.

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — after query intent analysis

### Fix

Add response length guidance based on query scope:

```ts
// After queryIntent is determined, inject length guidance:
let lengthGuidance = '';
switch (queryIntent.scope) {
  case 'conversational':
    lengthGuidance = '\n\nRESPONSE LENGTH: Keep under 100 words. Be direct and friendly.';
    break;
  case 'summary':
    lengthGuidance = '\n\nRESPONSE LENGTH: Keep under 200 words. Give the answer with key numbers, no fluff.';
    break;
  case 'detailed':
    lengthGuidance = '\n\nRESPONSE LENGTH: 200-500 words. Provide analysis with specific recommendations.';
    break;
  case 'full':
    lengthGuidance = '\n\nRESPONSE LENGTH: As thorough as needed. Include charts, multiple perspectives, and detailed action items.';
    break;
}
systemPrompt += lengthGuidance;
```

---

## PROBLEM 4: No notifications from background jobs

**What happens:** Email sends, social posts, content queue processing, journey steps, competitor analysis — none of these write to the notification system. The user has no idea when background work completes or fails.

**Root cause:** The edge functions (`engage-email-send`, `engage-social-poster`, `process-content-queue`, `engage-journey-processor`) don't insert into `dashboard_alerts`.

### Fix

Add notification writes to each background edge function.

**File:** `supabase/functions/engage-email-send/index.ts` — after successful send or failure:

```ts
// After processing a campaign (success or failure):
async function notifyUser(supabase: any, workspaceId: string, title: string, message: string, type: string) {
  try {
    // Get user_id from workspace
    const { data: member } = await supabase
      .from('team_members')
      .select('user_id')
      .eq('workspace_id', workspaceId)
      .eq('role', 'owner')
      .limit(1)
      .single();

    if (member?.user_id) {
      await supabase.from('dashboard_alerts').insert({
        user_id: member.user_id,
        title,
        message,
        category: type, // 'success', 'error', 'info'
        is_read: false,
        action_url: '/engage/email',
        created_at: new Date().toISOString()
      });
    }
  } catch (_) { /* non-blocking */ }
}

// After successful send:
await notifyUser(supabase, workspaceId, 'Email Campaign Sent',
  `Campaign "${campaignName}" sent to ${recipientCount} contacts.`, 'success');

// After failure:
await notifyUser(supabase, workspaceId, 'Email Campaign Failed',
  `Campaign "${campaignName}" failed: ${errorMessage}`, 'error');
```

**Same pattern for:**

**`process-content-queue/index.ts`:**
```ts
// After queue processing completes:
await notifyUser(supabase, userId, 'Content Generation Complete',
  `${successful} of ${processed} items generated for campaign.`, 'success');

// On failures:
await notifyUser(supabase, userId, 'Content Generation Partially Failed',
  `${failed} items failed. Retry from campaign dashboard.`, 'error');
```

Note: `process-content-queue` uses `user_id` directly (from queue items), not `workspace_id`. Adjust the `notifyUser` function accordingly.

**`engage-social-poster/index.ts`:**
```ts
// After processing scheduled posts:
if (processed > 0) {
  await notifyUser(supabase, post.workspace_id, 'Social Posts Processed',
    `${processed} social post(s) processed. Status: pending integration.`, 'info');
}
```

**`engage-journey-processor/index.ts`:**
```ts
// After journey step execution:
await notifyUser(supabase, workspaceId, 'Journey Step Executed',
  `Journey "${journeyName}" advanced ${enrollmentCount} enrollment(s).`, 'info');
```

---

## PROBLEM 5: No loading skeleton when switching conversations

**What happens:** Click a different conversation → messages clear → welcome screen flashes briefly → messages load from DB. Creates a jarring flash.

### Fix

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Track loading state for conversation switches:

```tsx
const [isLoadingConversation, setIsLoadingConversation] = useState(false);

// Wrap the conversation switch in loading state:
// In the existing selectConversation handler (from AppLayout or sidebar):
const handleSelectConversation = async (id: string) => {
  setIsLoadingConversation(true);
  selectConversation(id);
  // loadMessages is called inside the hook — add a callback or await
  setTimeout(() => setIsLoadingConversation(false), 300); // Fallback timeout
};
```

In the message area, show a skeleton during loading:

```tsx
{isLoadingConversation ? (
  <div className="space-y-4 p-6">
    {[1, 2, 3].map(i => (
      <div key={i} className={`flex ${i % 2 === 0 ? 'justify-end' : 'justify-start'}`}>
        <Skeleton className={`h-16 ${i % 2 === 0 ? 'w-2/3' : 'w-3/4'} rounded-2xl`} />
      </div>
    ))}
  </div>
) : messages.length === 0 ? (
  // Welcome screen
) : (
  // Messages
)}
```

**Frontend only.**

---

## PROBLEM 6: Notifications don't aggregate

**What happens:** 585 individual notification items. "Content generated", "Content generated", "Content generated" x50. No grouping.

### Fix

The `useNotifications` hook already passes `grouped: true` to `fetchEnhancedAlerts` (line 41). Let me check if the grouping is implemented:

**File:** `src/services/enhancedNotificationsService.ts` — check if `grouped` does anything in `fetchEnhancedAlerts`:

If grouping isn't implemented, add client-side grouping in the notifications center:

```ts
// In EnhancedNotificationsCenter or use-notifications hook:
function groupNotifications(notifications: EnhancedDashboardAlert[]): GroupedNotification[] {
  const groups = new Map<string, { items: EnhancedDashboardAlert[]; latestAt: Date }>();

  for (const n of notifications) {
    // Group by title + same hour
    const hour = new Date(n.created_at).toISOString().slice(0, 13); // YYYY-MM-DDTHH
    const key = `${n.title}:${hour}`;

    const existing = groups.get(key);
    if (existing) {
      existing.items.push(n);
      if (new Date(n.created_at) > existing.latestAt) {
        existing.latestAt = new Date(n.created_at);
      }
    } else {
      groups.set(key, { items: [n], latestAt: new Date(n.created_at) });
    }
  }

  return Array.from(groups.values()).map(g => ({
    ...g.items[0],
    count: g.items.length,
    message: g.items.length > 1
      ? `${g.items[0].title} (${g.items.length} items)`
      : g.items[0].message,
    created_at: g.latestAt.toISOString()
  }));
}
```

**Frontend only.**

---

## PROBLEM 7: Tool results and AI conversation look identical

**What happens:** When the AI fetches data via a tool (e.g., gets content items) and then provides analysis, both appear as regular message bubbles. The user can't distinguish "here's your data" from "here's my opinion."

### Fix

**File:** `src/components/ai-chat/EnhancedMessageBubble.tsx`

When a message has `actions` from tool execution or has `visualData`, give it a subtle visual treatment:

```tsx
// In the assistant message container, add a data indicator:
{!isUser && (message.visualData || message.actions?.length > 0) && (
  <div className="flex items-center gap-1.5 mb-1.5">
    <div className="w-1.5 h-1.5 rounded-full bg-primary/50" />
    <span className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">
      {message.visualData ? 'Data Analysis' : 'Action Result'}
    </span>
  </div>
)}
```

This adds a tiny "Data Analysis" or "Action Result" label before tool-enriched responses, helping users distinguish data from opinion.

**Frontend only.**

---

## IMPLEMENTATION ORDER

### Sprint 1: Fix broken UX (Problems 1, 2, 5) — ~1 hour

| # | Fix | File | Effort |
|---|-----|------|--------|
| 1 | Reset sidebar state on conversation switch | `EnhancedChatInterface.tsx` | 5 min |
| 2 | Only auto-open sidebar for NEW messages, not loaded history | `EnhancedChatInterface.tsx` | 15 min |
| 5 | Loading skeleton during conversation switch | `EnhancedChatInterface.tsx` | 15 min |

### Sprint 2: Improve response quality (Problem 3) — ~1.5 hours

| # | Fix | File | Effort |
|---|-----|------|--------|
| 3a | Conditional `<think>` tags per provider | `enhanced-ai-chat/index.ts` | 30 min |
| 3b | Replace blanket visual mandate with smart guidance | `enhanced-ai-chat/index.ts` | 20 min |
| 3c | Response length guidance per query scope | `enhanced-ai-chat/index.ts` | 15 min |

### Sprint 3: Notifications from background jobs (Problem 4) — ~1 hour

| # | Fix | File | Effort |
|---|-----|------|--------|
| 4a | Email send notifications | `engage-email-send/index.ts` | 15 min |
| 4b | Content queue notifications | `process-content-queue/index.ts` | 15 min |
| 4c | Social poster notifications | `engage-social-poster/index.ts` | 10 min |
| 4d | Journey processor notifications | `engage-journey-processor/index.ts` | 10 min |

### Sprint 4: Polish (Problems 6, 7) — ~30 min

| # | Fix | File | Effort |
|---|-----|------|--------|
| 6 | Notification aggregation/grouping | `use-notifications.ts` or notification center | 20 min |
| 7 | Visual distinction for tool results | `EnhancedMessageBubble.tsx` | 10 min |

**Total: ~4 hours across 4 sprints.**

---

## WHAT THIS FIXES IN PRACTICE

| Before | After |
|--------|-------|
| Switch conversation → old Analyst data shows | Switch → clean slate, sidebar closed |
| Open old conversation → chart sidebar pops up uninvited | Old conversations load quietly, no sidebar pop |
| Ask simple question → get 500-word response with chart JSON | Simple question → concise answer, no unnecessary charts |
| Campaign finishes generating → silence | Campaign finishes → notification bell rings "3 articles generated" |
| 585 individual notifications | Grouped: "Content generated (12 items)" |
| Tool data and AI opinion look the same | Tool results have "Data Analysis" label |
| Switch conversation → welcome screen flash | Switch → loading skeleton → messages |
