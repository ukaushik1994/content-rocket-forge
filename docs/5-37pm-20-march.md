# Fix Plan — Make Everything Real

> **Created:** 2026-03-20 5:37 PM
> **For:** Lovable.dev implementation
> **Scope:** 45 broken promises + 6 deferred Month 1 items
> **Philosophy:** Remove lies, wire disconnected systems, add honesty labels. Don't build new features — make existing ones real.

---

## HOW TO READ THIS PLAN

Every item has **exactly two sections**: what to change in the **frontend** and what to change in the **backend** (Supabase edge functions). If a section says "No changes" — skip it.

**Four action types:**

| Action | Meaning | Typical time |
|--------|---------|-------------|
| **REMOVE** | Delete UI that has no backend | 5 min |
| **LABEL** | Change text/copy to be honest | 5-10 min |
| **WIRE** | Connect existing code that isn't imported/called | 15-30 min |
| **FIX** | Write new logic to make something actually work | 20-60 min |

**Rules:**
1. Complete each phase before starting the next
2. Don't skip items within a phase — they're ordered by dependency
3. If something blocks, stop and report before moving on
4. Test each item by using the feature as a user would

---

## PHASE 1: Remove Fake UI (30 min)

These features show buttons/data that don't do anything. Remove them.

---

### 1.1 — REMOVE: Analytics "Performance" tab (hardcoded fake data)

**What's wrong:** The Performance tab shows "Avg. Session Duration: 4:32", "Bounce Rate: 24.3%", "Top Performing Links: Project Management Tools (2,450 clicks)" — all hardcoded static values. This is fake data that never changes.

**Frontend:**
- File: `src/pages/Analytics.tsx`
- Find the Performance tab content section (~lines 593-665) that renders hardcoded engagement metrics and "Top Performing Links"
- Delete the entire Performance tab content
- Keep all other tabs (the main 8 metrics from `useAnalyticsData` hook are real)
- If the tab switcher references "Performance", remove that tab option too

**Backend:** No changes.

---

### 1.2 — REMOVE: "Save Context" button (fake toast, no storage)

**What's wrong:** Button shows toast "Context saved" but stores nothing. No retrieval, no implementation.

**Frontend:**
- File: `src/components/ai-chat/AdvancedChatFeatures.tsx`
- Find the "Save Context" button and its click handler
- Delete the button, the handler, and any "Context History" section that says "No saved contexts yet"

**Backend:** No changes.

---

### 1.3 — REMOVE: "Smart Suggestions" section (hardcoded placeholders)

**What's wrong:** Shows "Quick optimization", "Generate summary", "Extract actions" — static strings, not computed from anything.

**Frontend:**
- File: `src/components/ai-chat/AdvancedChatFeatures.tsx`
- Find the Smart Suggestions section with hardcoded suggestion strings
- Delete the entire section

**Backend:** No changes.

---

### 1.4 — REMOVE: Screen Capture button (auto-disables, stub)

**What's wrong:** Screen capture button exists but auto-disables after 5 seconds. It's a demo stub.

**Frontend:**
- File: `src/components/ai-chat/AdvancedChatFeatures.tsx`
- Find the screen capture button and its handler (look for `getUserMedia` or `getDisplayMedia`)
- Delete the button and handler

**Backend:** No changes.

---

### 1.5 — REMOVE: Collaboration features (single-user app)

**What's wrong:** Shows collaborator status and typing indicators for a single-user product.

**Frontend:**
- File: `src/components/ai-chat/AdvancedChatFeatures.tsx`
- Find any "collaborators", "typing users", or real-time presence UI
- Delete it

**Backend:** No changes.

---

### 1.6 — IGNORE: Conversation `summary` column

**What's wrong:** DB columns `summary` and `summary_message_count` exist but are never written to or read from.

**Frontend:** No changes needed — column is invisible to users.
**Backend:** No changes needed — leave the dead column. Don't waste time on it.

---

**Phase 1 test:** Open the app. The Analytics page should have no "Performance" tab. AdvancedChatFeatures should have no Save Context, Smart Suggestions, Screen Capture, or Collaboration sections. Everything remaining should show real data.

---

## PHASE 2: Add Honesty Labels (30 min)

These features work but users think they do more than they actually do. Change the copy.

---

### 2.1 — LABEL: Analytics claims "Google Analytics + Search Console"

**What's wrong:** Section titles imply data comes from Google Analytics/Search Console. It's actually from the internal `content_analytics` Supabase table — no external API integration exists.

**Frontend:**
- File: `src/pages/Analytics.tsx`
- Find any section title that says "Search Console Data" or "Google Analytics" or similar
- Change to: **"Content Performance (Internal)"**
- Add subtitle text: "Connect Google Analytics in Settings for external data"
- File: `src/hooks/useAnalyticsData.ts`
- If there are comments referencing "Google Analytics" data, update them to say "internal DB data"

**Backend:** No changes.

---

### 2.2 — LABEL: Traffic/impression estimates say "(estimated)"

**What's wrong:** `estimated_impressions` on proposals and `estimated_traffic` on topic clusters show numbers that look like real analytics. They're calculated as `searchVolume × 0.15` (hardcoded 15% CTR assumption) or AI-generated guesses.

**Frontend:**
- Find every place that displays `estimated_impressions` or `estimated_traffic`:
  - Proposal cards (`src/components/research/content-strategy/ProposalCard.tsx`)
  - Topic cluster displays
  - Any analytics showing "impressions" or "traffic"
- Append **"(est.)"** to the displayed number
- Add a tooltip on hover: "Based on search volume estimates, not actual traffic data"

**Backend:** No changes.

---

### 2.3 — LABEL: Fact-check warning text is misleading

**What's wrong:** Warning says "Fact-check advisory" implying verification was done. It's just regex counting numbers in the text.

**Backend:**
- File: `supabase/functions/enhanced-ai-chat/content-action-tools.ts`
- Find the `factCheckWarning` string (~line 836 area)
- Change from: `"⚠️ **Fact-check advisory**: ...X statistic(s)..."`
- Change to: `"⚠️ **Statistics detected** — ${statsFound.length} number(s) found in this content. Please verify these before publishing (auto-detected, not verified)."`

**Frontend:** No changes.

---

### 2.4 — LABEL: AI detection score is informational only

**What's wrong:** Content Wizard shows an AI detection score after generation. Users might think low scores block publishing. They don't — content saves regardless.

**Frontend:**
- File: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`
- Find where the AI detection / human score is displayed
- Add a small note below it: "For your awareness only — content is saved regardless of this score."

**Backend:** No changes.

---

### 2.5 — LABEL/HIDE: Keyword difficulty filter shows with no data

**What's wrong:** Keywords page has difficulty range filters but no keywords actually have difficulty data populated. Filtering by difficulty returns 0 results.

**Frontend:**
- File: Keywords page filters component
- Add a conditional check: if zero keywords have non-null `difficulty` values, **hide the difficulty filter entirely**
- Show it only when at least some keywords have difficulty data (e.g., from SERP research)

**Backend:** No changes.

---

**Phase 2 test:** Analytics page titles are honest. Proposal cards show "(est.)" on traffic numbers. Fact-check warning says "not verified". AI detection note is visible. Difficulty filter is hidden when empty.

---

## PHASE 3: Wire Disconnected Systems (2 hours)

Code exists in two places but isn't connected. Import and call.

---

### 3A — WIRE: Conversation Memory Into Chat (45 min)

**What's wrong:** `src/services/conversationMemory.ts` has a complete learning system: `learnUserPreference()`, `recordLearnedPattern()`, `getUserPreferences()`. **Zero imports anywhere.** The AI doesn't learn anything between conversations.

**Frontend — Step 1: Learn from user messages**
- File: `src/hooks/useEnhancedAIChatDB.ts`
- Add import at top: `import { learnUserPreference, recordLearnedPattern } from '@/services/conversationMemory';`
- After a user message is successfully saved to DB (look for the message insert success handler), add:

```ts
// Learn from user's explicit preferences
try {
  const lowerContent = content.toLowerCase();
  if (lowerContent.includes('shorter') || lowerContent.includes('more concise') || lowerContent.includes('too long')) {
    await learnUserPreference(userId, 'preferred_length', 'concise');
  }
  if (lowerContent.includes('more detail') || lowerContent.includes('expand') || lowerContent.includes('elaborate')) {
    await learnUserPreference(userId, 'preferred_length', 'detailed');
  }
  if (lowerContent.includes('casual') || lowerContent.includes('conversational')) {
    await learnUserPreference(userId, 'preferred_tone', 'casual');
  }
  if (lowerContent.includes('formal') || lowerContent.includes('professional')) {
    await learnUserPreference(userId, 'preferred_tone', 'formal');
  }
} catch { /* non-blocking */ }
```

**Frontend — Step 2: Learn from negative feedback**
- File: `src/hooks/useEnhancedAIChatDB.ts`
- In the `handleFeedback` function, after the DB update succeeds, add:

```ts
if (!isHelpful) {
  try {
    await recordLearnedPattern(userId, 'negative_feedback', {
      messageSnippet: message.content?.substring(0, 200),
      conversationGoal: activeConversation?.goal
    });
  } catch { /* non-blocking */ }
}
```

**Backend — Step 3: Read preferences into prompt**
- File: `supabase/functions/enhanced-ai-chat/index.ts`
- After the existing user intelligence profile fetch (~line 2676 area), add a new query:

```ts
// Fetch learned conversation memory preferences
let memoryContext = '';
try {
  const { data: prefs } = await supabase
    .from('user_preferences')
    .select('preference_key, preference_value, confidence')
    .eq('user_id', userId)
    .gte('confidence', 0.5)
    .order('confidence', { ascending: false })
    .limit(10);

  if (prefs && prefs.length > 0) {
    memoryContext = '\n\n## Learned User Preferences (from past conversations)\n' +
      prefs.map((p: any) => `- ${p.preference_key}: ${p.preference_value} (confidence: ${(p.confidence * 100).toFixed(0)}%)`).join('\n') +
      '\nAdapt your responses to match these preferences unless the user explicitly asks otherwise.';
  }
} catch { /* non-blocking */ }

systemPrompt += memoryContext;
```

**Important:** Check if the `user_preferences` table exists in Supabase. If not, create it:

```sql
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  preference_key text NOT NULL,
  preference_value text NOT NULL,
  confidence numeric DEFAULT 0.5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, preference_key)
);
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own preferences" ON user_preferences FOR ALL USING (auth.uid() = user_id);
```

---

### 3B — WIRE: User Intelligence Profile Aggregation (15 min)

**What's wrong:** `aggregate-user-intelligence` edge function exists with real aggregation logic but nothing ever calls it. No cron job, no trigger.

**Backend:**
- File: `supabase/functions/engage-job-runner/index.ts`
- This function already runs every 15 minutes. Add intelligence aggregation that runs once daily:

```ts
// Near the top of the handler, after getting the user list:
// Aggregate user intelligence once daily
try {
  const { data: profiles } = await supabase
    .from('user_intelligence_profile')
    .select('user_id, last_aggregated_at');

  for (const profile of (profiles || [])) {
    const lastAgg = profile.last_aggregated_at ? new Date(profile.last_aggregated_at) : new Date(0);
    const hoursSince = (Date.now() - lastAgg.getTime()) / (1000 * 60 * 60);
    if (hoursSince >= 24) {
      await supabase.functions.invoke('aggregate-user-intelligence', {
        body: { user_id: profile.user_id }
      });
    }
  }
} catch (err) {
  console.error('Intelligence aggregation failed:', err);
}
```

**Frontend:** No changes.

---

### 3C — WIRE: Analyst Benchmarks Into Metric Context (15 min)

**What's wrong:** `BENCHMARKS` object and `getUserStage()` are defined in `useAnalystEngine.ts` but never used to contextualize the data shown to users.

**Frontend:**
- File: `src/hooks/useAnalystEngine.ts`
- Find the `getMetricContext()` function (~line 149 area)
- It accepts `stage?: UserStage` but is never called with a stage value
- Find ALL calls to `getMetricContext` in the same file and pass the computed `userStage`:

```ts
// Before (example):
getMetricContext('totalContent', totalContent)
// After:
getMetricContext('totalContent', totalContent, userStage)
```

- Inside `getMetricContext`, add stage-aware messaging for each metric:

```ts
function getMetricContext(metric: string, value: number, stage?: UserStage): string {
  const benchmark = stage ? BENCHMARKS[stage] : null;

  if (metric === 'totalContent' && benchmark) {
    if (value >= benchmark.contentTarget) return `On track — ${value} articles meets your ${stage} stage target of ${benchmark.contentTarget}`;
    return `${value} of ${benchmark.contentTarget} articles for ${stage} stage — keep creating`;
  }
  if (metric === 'publishedContent' && benchmark) {
    const target = Math.round(benchmark.contentTarget * 0.6);
    if (value >= target) return `${value} published — solid for ${stage} stage`;
    return `${value} published — aim for ${target} at ${stage} stage`;
  }
  // ... keep existing fallback logic for each metric
}
```

**Backend:** No changes.

---

### 3D — WIRE: Feedback Thumbs Into Prompt Assembly (15 min)

**What's wrong:** Thumbs up/down saves `feedback_helpful` boolean to `ai_messages` table but **no code ever reads it back** to adjust AI behavior.

**Backend:**
- File: `supabase/functions/enhanced-ai-chat/index.ts`
- There may already be partial code (~line 2850 area) that checks for negative feedback. Find it and verify it reads from the `feedback_helpful` column specifically.
- If it doesn't exist or doesn't work, add this after fetching conversation messages:

```ts
// Count negative feedback in this conversation
const negativeCount = conversationMessages.filter(
  (m: any) => m.role === 'assistant' && m.feedback_helpful === false
).length;
const positiveCount = conversationMessages.filter(
  (m: any) => m.role === 'assistant' && m.feedback_helpful === true
).length;

if (negativeCount >= 2 && negativeCount > positiveCount) {
  systemPrompt += `\n\n## QUALITY ALERT
The user has marked ${negativeCount} of your responses as unhelpful in this conversation.
Adjust your approach:
- Be more specific and actionable — avoid generic advice
- Use real data from their workspace instead of general statements
- Ask a clarifying question if the request is ambiguous
- Keep responses shorter unless the user asks for detail`;
}
```

**Frontend:** No changes (feedback buttons already work and save to DB).

---

### 3E — WIRE: Content Performance Signals for Publish Events (15 min)

**What's wrong:** `content_performance_signals` table only records internal repurposing actions (email_convert, social_repurpose). It misses publish events, so "Most Engaged Content" in the analyst is inaccurate.

**Backend — File 1:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`
- In the `publish_to_website` handler, after the publish succeeds and content status is updated, add:

```ts
// Record publish signal
try {
  await supabase.from('content_performance_signals').insert({
    content_id: content.id,
    user_id: userId,
    signal_type: 'publish',
    signal_data: { provider: connection.provider, url: publishResult.url || publishResult.link }
  });
} catch { /* non-blocking */ }
```

**Backend — File 2:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`
- In the `approve_content` handler, after setting status to 'published', add:

```ts
// Record approval-publish signal
try {
  await supabase.from('content_performance_signals').insert({
    content_id: toolArgs.content_id,
    user_id: userId,
    signal_type: 'approve_publish',
    signal_data: { approved_at: new Date().toISOString() }
  });
} catch { /* non-blocking */ }
```

**Frontend:** No changes.

---

**Phase 3 test:**
- Send a message saying "I prefer shorter responses" → future conversations should inject this preference into the AI prompt
- Give a thumbs-down on 2+ AI responses → next AI response should be more specific
- Check `user_intelligence_profile` table → `last_aggregated_at` should update within 24 hours
- Analyst metric context messages should mention the user's stage (starter/growing/established/scaling)
- Publish content → `content_performance_signals` should have a new `publish` row

---

## PHASE 4: Fix Real Bugs (1.5 hours)

These need actual code changes — not just wiring.

---

### 4A — FIX: Make Streaming Show Progressive Text (30 min)

**What's wrong:** Backend sends SSE `progress` events correctly. Frontend collects them in a buffer but renders the **full message only when complete**. Users see a loading spinner, then the entire response appears at once. No word-by-word streaming.

**Frontend — File 1:** `src/hooks/useEnhancedAIChatDB.ts`
- Find the SSE parsing loop (~line 667-697 area) where `progress` events are handled
- Currently it accumulates text in a variable and only updates state on `done` event
- Change it to update the message state on **every** `progress` event:

```ts
if (event === 'progress' && parsedData.text) {
  accumulatedText += parsedData.text;

  // Update the assistant message content in real-time
  setMessages(prev => prev.map(m =>
    m.id === assistantMessageId
      ? { ...m, content: accumulatedText, status: 'streaming' as any }
      : m
  ));
}

// On 'done' event, finalize:
if (event === 'done') {
  setMessages(prev => prev.map(m =>
    m.id === assistantMessageId
      ? { ...m, content: parsedData.fullText || accumulatedText, status: 'completed' as any }
      : m
  ));
}
```

**Frontend — File 2:** `src/components/ai-chat/EnhancedMessageBubble.tsx`
- Add a streaming indicator: if `message.status === 'streaming'`, append a blinking cursor character after the content:

```tsx
{message.status === 'streaming' && (
  <span className="animate-pulse text-primary">▊</span>
)}
```

**Backend:** No changes (SSE events are already sent correctly).

---

### 4B — FIX: Regenerate Actually Regenerates (15 min)

**What's wrong:** Clicking "Regenerate" on an AI message prepends `[Regenerate with different approach]` to the user's original message and resends. This is a hack — not a real regeneration.

**Frontend:**
- File: `src/components/ai-chat/EnhancedChatInterface.tsx`
- Find the `handleRegenerate` function (~line 830 area)
- Replace the entire function with:

```ts
const handleRegenerate = useCallback(async (messageId: string) => {
  // Find the user message that preceded this AI response
  const messageIndex = messages.findIndex(m => m.id === messageId);
  if (messageIndex <= 0) return;

  const precedingUserMessage = [...messages]
    .slice(0, messageIndex)
    .reverse()
    .find(m => m.role === 'user');

  if (!precedingUserMessage) return;

  // Delete the old AI response from DB and state
  await handleDeleteMessage(messageId);

  // Resend the exact same user message — AI temperature randomness gives a different result
  await sendMessage(precedingUserMessage.content, precedingUserMessage.content);
}, [messages, handleDeleteMessage, sendMessage]);
```

**Backend:** No changes.

---

### 4C — FIX: Message Edit Triggers New AI Response (15 min)

**What's wrong:** User edits their message (within 5-min window), text updates locally, but the edit is **never sent to the AI** for a new response. The old AI response stays.

**Frontend:**
- File: `src/hooks/useEnhancedAIChatDB.ts` or `src/components/ai-chat/EnhancedChatInterface.tsx`
- Find the `handleEditMessage` function
- After updating the message text in DB, also:
  1. Delete all messages after the edited one (both user and AI)
  2. Resend the edited message to get a new AI response

```ts
const handleEditMessage = useCallback(async (messageId: string, newContent: string) => {
  // 1. Update the edited message in DB
  await supabase.from('ai_messages')
    .update({ content: newContent })
    .eq('id', messageId);

  // 2. Find this message's position
  const msgIndex = messages.findIndex(m => m.id === messageId);
  if (msgIndex === -1) return;

  // 3. Delete all subsequent messages from DB
  const subsequentIds = messages.slice(msgIndex + 1).map(m => m.id);
  if (subsequentIds.length > 0) {
    await supabase.from('ai_messages')
      .delete()
      .in('id', subsequentIds);
  }

  // 4. Update local state — keep only messages up to and including the edited one
  setMessages(prev => prev.slice(0, msgIndex + 1).map(m =>
    m.id === messageId ? { ...m, content: newContent } : m
  ));

  // 5. Send the edited message to AI for a new response
  await sendMessage(newContent, newContent);
}, [messages, sendMessage, supabase]);
```

**Backend:** No changes.

---

### 4D — FIX: Email Template Has Real Structure (20 min)

**What's wrong:** `content_to_email` and `campaign_content_to_engage` wrap raw content in bare `<body>` tags. No header, no footer, no branding, no unsubscribe link (CAN-SPAM violation risk).

**Backend:**
- File: `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`
- Find the email HTML template in `content_to_email` handler (~line 220 area)
- Replace the bare template with:

```ts
const emailHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f5f5f5; }
    .container { max-width: 600px; margin: 0 auto; background: #ffffff; }
    .header { padding: 24px 32px; border-bottom: 1px solid #eee; }
    .header h1 { font-size: 20px; margin: 0; color: #333; }
    .body-content { padding: 32px; color: #333; line-height: 1.7; font-size: 15px; }
    .body-content h2, .body-content h3 { color: #111; }
    .body-content a { color: #2563eb; }
    .body-content img { max-width: 100%; height: auto; }
    .footer { padding: 24px 32px; background: #f9f9f9; border-top: 1px solid #eee; font-size: 12px; color: #999; text-align: center; }
    .footer a { color: #666; text-decoration: underline; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${content.title}</h1>
    </div>
    <div class="body-content">
      ${content.content}
    </div>
    <div class="footer">
      <p>You received this because you're subscribed to updates.</p>
      <p><a href="{{unsubscribe_url}}">Unsubscribe</a> | <a href="{{preferences_url}}">Manage preferences</a></p>
    </div>
  </div>
</body>
</html>`;
```

- Find the same bare template in `campaign_content_to_engage` handler and replace it with the same template above
- The `{{unsubscribe_url}}` and `{{preferences_url}}` are Resend template variables — they get replaced at send time

**Frontend:** No changes.

---

### 4E — FIX: Approval Workflow Has Consequences (15 min)

**What's wrong:** `submit_for_review` accepts any content. `reject_content` has no enforcement — rejected content can be resubmitted unchanged. `approve_content` auto-publishes with no quality check.

**Backend:**
- File: `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

**In `submit_for_review` handler** — block resubmission of rejected content that hasn't been modified:

```ts
// After fetching the content item, before updating status:
if (content.approval_status === 'rejected') {
  // Check if content was modified since rejection
  const { count } = await supabase.from('content_versions')
    .select('id', { count: 'exact', head: true })
    .eq('content_id', toolArgs.content_id)
    .gte('created_at', content.updated_at);

  if ((count || 0) === 0) {
    return JSON.stringify({
      success: false,
      message: 'This content was rejected and hasn\'t been modified since. Edit the content before resubmitting for review.'
    });
  }
}
```

**In `approve_content` handler** — add minimum quality gate:

```ts
// Before setting status to published:
if ((content.seo_score || 0) < 20) {
  return JSON.stringify({
    success: false,
    message: `SEO score is ${content.seo_score || 0}/100 — too low to publish. Improve the content first.`
  });
}
```

**Frontend:** No changes.

---

**Phase 4 test:**
- Send a message in AI chat → text should appear word-by-word with a blinking cursor, not all at once
- Click "Regenerate" on an AI response → old response should be deleted and a new, different response should appear
- Edit a user message → all subsequent messages should be deleted and AI should respond to the edited version
- Use `content_to_email` tool → email HTML should have a header, styled content area, and footer with unsubscribe link
- Try to resubmit rejected content without editing → should get a rejection message
- Try to approve content with SEO < 20 → should get a quality gate message

---

## PHASE 5: Surface Silent Failures (45 min)

These features fail silently — user doesn't know something went wrong.

---

### 5A — FIX: Surface Content Enrichment Failures (15 min)

**What's wrong:** When generating content via `generate_full_content`, 7 enrichment queries run in parallel via `Promise.allSettled()`. If brand voice, competitors, or solutions fetch fails, content generates without them — **no warning to user**.

**Backend:**
- File: `supabase/functions/enhanced-ai-chat/content-action-tools.ts`
- After the `Promise.allSettled()` resolves (~line 590 area), add:

```ts
// Check which enrichments failed
const enrichmentNames = ['brand voice', 'solutions', 'existing content', 'competitors', 'top content structure', 'edit preferences', 'performance signals'];
const failedEnrichments = enrichmentResults
  .map((result: any, i: number) => result.status === 'rejected' ? enrichmentNames[i] : null)
  .filter(Boolean);

let enrichmentWarning = '';
if (failedEnrichments.length > 0) {
  enrichmentWarning = `\n\n> **Note:** Could not load ${failedEnrichments.join(', ')} data for this generation. Content was created without this context. If the result doesn't match your brand voice or miss competitor angles, try regenerating.`;
}
```

- Append `enrichmentWarning` to the final response message returned to the user

**Frontend:** No changes.

---

### 5B — FIX: Analyst Shows Data Freshness (15 min)

**What's wrong:** If analyst data queries fail, the sidebar keeps showing stale data without any indicator. User doesn't know they're looking at old information.

**Frontend — File 1:** `src/hooks/useAnalystEngine.ts`
- Add two new fields to the `AnalystState` interface:

```ts
export interface AnalystState {
  // ... existing fields ...
  lastRefreshError: string | null;
  dataAgeSeconds: number;
}
```

- In the `fetchPlatformData` function:
  - On success: set `lastRefreshError` to null, record `lastSuccessfulFetch` timestamp
  - On error: set `lastRefreshError` to `'Data refresh failed — showing cached results'`
- Compute `dataAgeSeconds` as `Math.round((Date.now() - lastSuccessfulFetch) / 1000)`

**Frontend — File 2:** `src/components/ai-chat/analyst-sections/AnalystNarrativeTimeline.tsx`
- At the top of the timeline, if `analystState.dataAgeSeconds > 300` (5+ minutes), show:

```tsx
{analystState.dataAgeSeconds > 300 && (
  <div className="text-xs text-muted-foreground/50 mb-2">
    Last updated {Math.round(analystState.dataAgeSeconds / 60)}m ago
  </div>
)}
{analystState.lastRefreshError && (
  <div className="text-xs text-amber-400/70 mb-2">
    {analystState.lastRefreshError}
  </div>
)}
```

**Backend:** No changes.

---

### 5C — FIX: Session Memory Timestamp Bug (10 min)

**What's wrong:** When restoring analyst session memory from localStorage, timestamps are reset to the original save time. 3-day-old insights appear as fresh data.

**Frontend:**
- File: `src/hooks/useAnalystEngine.ts`
- Find the session memory restore logic (~line 859 area)
- When restoring insights, prefix them with their actual age:

```ts
const ageHours = Math.round((Date.now() - memory.timestamp) / (1000 * 60 * 60));
const ageLabel = ageHours < 1 ? 'recent' : ageHours < 24 ? `${ageHours}h ago` : `${Math.round(ageHours / 24)}d ago`;

restoredInsights = memory.insights.map((insight: any) => ({
  ...insight,
  content: `[From ${ageLabel}] ${insight.content}`,
  timestamp: Date.now() // Use current time so sorting works correctly
}));
```

**Backend:** No changes.

---

### 5D — FIX: File Upload Shows Error When Bucket Missing (5 min)

**What's wrong:** If the `documents` Supabase Storage bucket doesn't exist, file upload silently fails. User gets no error.

**Frontend:**
- File: `src/components/ai-chat/FileUploadHandler.tsx` (or wherever upload logic lives)
- After the upload attempt, check for errors:

```ts
if (uploadError) {
  toast.error('File upload failed. Please try again or check your storage settings.');
  return; // Stop processing — don't pretend the file was analyzed
}
```

**Backend:** No changes.

---

**Phase 5 test:**
- Generate content when brand_guidelines table is empty or unreachable → response should include "Note: Could not load brand voice data"
- Watch the analyst sidebar for 5+ minutes without interacting → should show "Last updated Xm ago"
- Close and reopen the app → restored analyst insights should show "[From Xh ago]" prefix
- Upload a file with the storage bucket disabled → should see error toast

---

## PHASE 6: Analyst Sections Show Real Data (1 hour)

The pattern: every analyst section just counts things instead of showing intelligence. Fix the worst offenders.

---

### 6A — FIX: CompetitivePositionSection Uses Real Competitor Data (20 min)

**What's wrong:** Currently text-parses the conversation for the word "competitor" and counts mentions. Doesn't query actual competitor data.

**Frontend:**
- File: `src/components/ai-chat/analyst-sections/CompetitivePositionSection.tsx`
- Instead of filtering `topics` for category === 'competitors', query real data:

```ts
// Add a Supabase query (or pass from useAnalystEngine):
const { data: competitors } = useQuery({
  queryKey: ['analyst-competitors', userId],
  queryFn: async () => {
    const { data } = await supabase
      .from('company_competitors')
      .select('name, strengths, weaknesses, last_analyzed_at')
      .eq('user_id', userId)
      .limit(5);
    return data || [];
  },
  enabled: !!userId
});
```

- Display: competitor name, top 2 strengths, top 2 weaknesses, "last analyzed X days ago"
- Add a "Refresh Analysis" action button that sends "Analyze my competitors" to the chat

**Backend:** No changes (data already exists in `company_competitors` table).

---

### 6B — FIX: KeywordLandscapeSection Shows Real Keywords (20 min)

**What's wrong:** Just counts how many proposals mention keywords. Doesn't show actual keyword data.

**Frontend:**
- File: `src/components/ai-chat/analyst-sections/KeywordLandscapeSection.tsx`
- Query real keyword data:

```ts
const { data: keywords } = useQuery({
  queryKey: ['analyst-keywords', userId],
  queryFn: async () => {
    const { data } = await supabase
      .from('keywords')
      .select('keyword, search_volume, difficulty, content_pieces')
      .eq('user_id', userId)
      .order('search_volume', { ascending: false, nullsFirst: false })
      .limit(10);
    return data || [];
  },
  enabled: !!userId
});
```

- Display: keyword name, search volume (if available), difficulty (if available), number of content pieces targeting it
- If no keywords exist, show: "No keywords tracked yet — ask me to research keywords for your topic"

**Backend:** No changes.

---

### 6C — FIX: CampaignPulseSection Shows Status Breakdown (15 min)

**What's wrong:** Just counts active campaigns and failed queue items.

**Frontend:**
- File: `src/components/ai-chat/analyst-sections/CampaignPulseSection.tsx`
- Query campaign breakdown:

```ts
const { data: campaigns } = useQuery({
  queryKey: ['analyst-campaigns', userId],
  queryFn: async () => {
    const { data } = await supabase
      .from('campaigns')
      .select('name, status, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    return data || [];
  },
  enabled: !!userId
});
```

- Display: campaign names with status badges (active/completed/draft), creation date
- Summary line: "3 active, 1 completed, 2 drafts"

**Backend:** No changes.

---

### 6D — FIX: Empty Sections Show Onboarding Nudges (5 min)

**What's wrong:** When analyst sections have no data, they hide completely. Users don't know these features exist.

**Frontend:**
- In each analyst section component, instead of `if (data.length === 0) return null`, show:

| Section | Empty state message |
|---------|-------------------|
| CompetitivePosition | "No competitors added yet — say 'analyze [competitor.com]' to start" |
| KeywordLandscape | "No keywords tracked — say 'research keywords for [your topic]'" |
| CampaignPulse | "No campaigns yet — say 'create a campaign' to get started" |
| EngagementMetrics | "No engagement data yet — create contacts and email campaigns to see metrics" |

**Backend:** No changes.

---

**Phase 6 test:**
- Open analyst sidebar with competitors in the DB → should see actual competitor names, strengths, weaknesses
- Open analyst with keywords → should see keyword list with volumes
- Open analyst with campaigns → should see campaign names and status badges
- Open analyst with no data → should see helpful onboarding messages, not empty space

---

## PHASE 7: Content Generation Quality (30 min)

---

### 7A — FIX: SERP Selections Explicitly in User Prompt (15 min)

**What's wrong:** User selects SERP items in the wizard. The system prompt says "use SERP elements" but the **user prompt sent to the AI may not list the actual items**. The AI might ignore them.

**Backend:**
- File: `src/services/advancedContentGeneration.ts` (this runs on the frontend, not edge function)
- Find the `buildAdvancedContentPrompt()` function
- After building the main prompt, explicitly append selected SERP items:

```ts
if (config.serpSelections && config.serpSelections.length > 0) {
  prompt += '\n\n---\nSERP ITEMS TO INCORPORATE (user selected these during research):\n';
  config.serpSelections.forEach((item: any, i: number) => {
    prompt += `${i + 1}. ${item.title || item.heading || 'Item'}: ${item.snippet || item.text || item.description || ''}\n`;
  });
  prompt += '\nYou MUST reference or incorporate each of these points in the article. Do not ignore them.\n';
}
```

**Frontend:** This IS the frontend (the function runs client-side). Apply the change in the same file.

---

### 7B — FIX: Post-Generation Word Count Warning (15 min)

**What's wrong:** Wizard shows "~1500 words" target. Content can be 900 or 2200 words. No feedback when it misses.

**Frontend:**
- File: `src/components/ai-chat/content-wizard/WizardStepGenerate.tsx`
- After content generation completes, add a word count check:

```ts
// After generation succeeds and content is available:
const actualWords = generatedContent.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const targetWords = wizardState.wordCount || 1500;
const deviation = Math.abs(actualWords - targetWords) / targetWords;

if (deviation > 0.25) {
  // Show an info message — don't block saving
  const direction = actualWords < targetWords ? 'shorter' : 'longer';
  setWordCountNote(`Generated ${actualWords.toLocaleString()} words (target: ${targetWords.toLocaleString()}). Content is ${direction} than expected.`);
}
```

- Display `wordCountNote` as a subtle info banner below the generated content (not a blocking error)

**Backend:** No changes.

---

**Phase 7 test:**
- Use Content Wizard → select SERP items in research step → generated content should clearly reference the selected items
- Set word count to 1500 → if generated content is under 1000 or over 2000, an info note should appear

---

## PHASE 8: Deferred Items — Infrastructure First (build when ready)

These 6 Month 1 items each need **new DB tables + UI** before the feature can be built. They are NOT broken promises — they're features that were planned but lack foundation. Build the infrastructure first, then the feature.

---

### 8.1 — DEFERRED: M1-3 Content Value Metric

**Why deferred:** No `content_value_score` field or formula exists. No UI to display it.

**When to build:** After Analytics page is mature and users ask "which content is most valuable?"

**Infrastructure needed:**

**Database migration:**
```sql
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS content_value_score numeric DEFAULT 0;
```

**Backend** — New computation (add to `content-action-tools.ts` or a scheduled function):
```ts
// content_value_score = (seo_score * 0.4) + (repurpose_count * 10) + (freshness_factor * 0.2)
// where freshness_factor = max(0, 100 - days_since_update)
// and repurpose_count = count of content_performance_signals for this content
```

**Frontend** — Display on:
- Repository content cards (next to SEO score)
- Analytics content tab (sortable column)
- Analyst ContentIntelligenceSection

---

### 8.2 — DEFERRED: M1-5 Cross-Content Consistency Checking

**Why deferred:** No brand voice model defined. No claim extraction logic. High false-positive risk.

**When to build:** After content volume > 50 articles per user and users report contradictions.

**Infrastructure needed:**

**Backend** — New function in `content-action-tools.ts`:
```ts
// After generate_full_content, compare key claims against existing published content
// Extract: numbers, percentages, feature counts, pricing mentions
// Compare against same fields in other articles with similar keywords
// Flag conflicts: "Your new article says '5 features' but existing article says '7 features'"
```

**Frontend:**
- Show conflict warnings in the generation result (similar to fact-check flags)
- Add "Consistency Check" button in content detail view

---

### 8.3 — DEFERRED: M1-9 Proposal Validation Against Results

**Why deferred:** No validation criteria framework. No Google Search Console integration to compare predicted vs actual impressions.

**When to build:** After Google Search Console is connected and content has 30+ days of ranking data.

**Infrastructure needed:**

**Database migration:**
```sql
CREATE TABLE IF NOT EXISTS proposal_validations (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  proposal_id uuid REFERENCES ai_strategy_proposals(id),
  content_id uuid REFERENCES content_items(id),
  predicted_impressions integer,
  actual_impressions integer,
  accuracy_score numeric,
  validated_at timestamptz DEFAULT now()
);
```

**Backend** — Scheduled check (monthly):
```ts
// For each proposal with status='completed' and linked content published 30+ days ago:
// Fetch actual impressions from Search Console API
// Compare against predicted_impressions
// Store accuracy_score = actual / predicted (1.0 = perfect prediction)
```

**Frontend:**
- Show accuracy badge on proposals: "This proposal predicted 500 impressions → actual: 380 (76% accurate)"

---

### 8.4 — DEFERRED: M1-15 Funnel Stage Tagging

**Why deferred:** No funnel model in DB. Content Wizard doesn't capture intent/purpose. No filtering UI.

**When to build:** When content strategy features mature and users want to balance TOFU/MOFU/BOFU.

**Infrastructure needed:**

**Database migration:**
```sql
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS funnel_stage text CHECK (funnel_stage IN ('tofu', 'mofu', 'bofu'));
```

**Frontend — Content Wizard:**
- In `WizardStepSolution.tsx`, add a "Content Purpose" selector:
  - "Awareness (top of funnel)" → `tofu`
  - "Consideration (middle of funnel)" → `mofu`
  - "Decision (bottom of funnel)" → `bofu`

**Frontend — Repository:**
- Add funnel stage filter to `EnhancedContentFilters.tsx`
- Show funnel stage badge on content cards

**Backend:**
- Pass `funnel_stage` to content generation prompt for tone/depth adjustment

---

### 8.5 — DEFERRED: M1-16 Outline Learning From Past Content

**Why deferred:** Outlines are generated in the wizard but **never saved to DB**. There's nothing to learn from.

**When to build:** After outlines are persisted. Requires two steps: save outlines, then learn patterns.

**Infrastructure needed:**

**Step 1 — Save outlines:**

**Database migration:**
```sql
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS outline jsonb;
```

**Frontend** — `WizardStepGenerate.tsx`:
- When saving generated content, also save the outline used:
```ts
await supabase.from('content_items').update({
  outline: wizardState.outline  // Array of section objects
}).eq('id', savedContentId);
```

**Step 2 — Learn patterns (build later):**

**Backend:**
```ts
// Query top 10 highest-SEO-score articles for this user
// Extract outline patterns: heading count, section types, avg words per section
// Feed winning patterns into wizard outline generation prompt:
// "Your best-performing articles use 8-10 sections with H2+H3 structure and ~200 words per section"
```

---

### 8.6 — DEFERRED: M1-21 User Goals Tracking

**Why deferred:** No `user_goals` table. `GoalProgress` interface in useAnalystEngine is defined but computed as `null` — dead code. No UI to set or display goals.

**When to build:** When analyst sidebar gets a goal tracking section and users want to set content targets.

**Infrastructure needed:**

**Database migration:**
```sql
CREATE TABLE IF NOT EXISTS user_goals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type text NOT NULL CHECK (goal_type IN ('monthly_articles', 'weekly_publish', 'seo_target', 'keyword_coverage', 'publish_streak')),
  target_value integer NOT NULL,
  current_value integer DEFAULT 0,
  period text DEFAULT 'monthly',
  starts_at timestamptz DEFAULT now(),
  ends_at timestamptz,
  status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'expired')),
  created_at timestamptz DEFAULT now()
);
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own goals" ON user_goals FOR ALL USING (auth.uid() = user_id);
```

**Frontend — Set goals:**
- Add "Set Goal" button in analyst sidebar or Settings
- Modal: select goal type, enter target value, select period

**Frontend — Track goals:**
- Wire `GoalProgress` computation in `useAnalystEngine.ts` to query `user_goals` and compute progress
- Display in `GoalProgressSection.tsx` (already exists but receives null data)

**Backend:**
- Add `get_goal_progress` tool to AI chat so users can ask "how am I doing on my goals?"

---

## SUMMARY

| Phase | Items | Frontend changes | Backend changes | Time |
|-------|:-----:|:-----:|:-----:|:----:|
| 1 — Remove lies | 6 | 5 file edits | 0 | 30 min |
| 2 — Honest labels | 6 | 4 file edits | 1 file edit | 30 min |
| 3 — Wire systems | 5 | 2 file edits | 3 file edits | 2 hrs |
| 4 — Fix bugs | 5 | 3 file edits | 2 file edits | 1.5 hrs |
| 5 — Surface failures | 4 | 3 file edits | 1 file edit | 45 min |
| 6 — Analyst real data | 4 | 4 file edits | 0 | 1 hr |
| 7 — Generation quality | 2 | 2 file edits | 0 | 30 min |
| **Active total** | **32** | **23** | **7** | **~6.5 hrs** |
| 8 — Deferred | 6 | — | — | When ready |

**After all 7 active phases:**
- 0 fake features visible
- 0 silent failures
- AI learns from conversations and feedback
- Analyst shows real competitor, keyword, and campaign data
- Content generation uses SERP research properly
- Streaming, regenerate, and edit work as users expect
- All emails have proper templates with unsubscribe links

**6 deferred items** wait for their infrastructure (new tables, new UI) — each has a complete blueprint above for when it's time to build them.
