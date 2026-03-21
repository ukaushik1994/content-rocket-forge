# Self-Learning Fix Plan — Make the AI Actually Learn

> **For:** Lovable.dev
> **Problem:** All learning tables exist, all learning functions exist, but almost nothing is connected. The AI doesn't learn from user behavior.
> **Result after fix:** AI learns from every interaction — messages, feedback, edits, and uses that knowledge in future responses.

---

## WHAT NEEDS TO HAPPEN

5 wiring fixes. No new tables needed. No new functions needed. Just connect existing code.

---

## Fix 1: Learn From User Messages (the biggest gap)

**What's broken:** `learnUserPreference()` is only called on thumbs-down feedback. It should learn from user messages — when they say "shorter", "more detail", "casual", "formal", etc.

**File:** `src/hooks/useEnhancedAIChatDB.ts`

**Find** the `sendMessage` function. After a user message is successfully saved to DB (after the insert succeeds, before the AI call), add:

```ts
// Learn from user message patterns
try {
  const { learnUserPreference } = await import('@/services/conversationMemory');
  const lowerContent = content.toLowerCase();

  // Length preferences
  if (/\b(shorter|concise|brief|too long|cut it down|trim)\b/.test(lowerContent)) {
    await learnUserPreference('preferred_length', 'concise', activeConversation || undefined, 0.6);
  }
  if (/\b(more detail|elaborate|expand|longer|in depth|deeper)\b/.test(lowerContent)) {
    await learnUserPreference('preferred_length', 'detailed', activeConversation || undefined, 0.6);
  }

  // Tone preferences
  if (/\b(casual|conversational|informal|friendly|relaxed)\b/.test(lowerContent)) {
    await learnUserPreference('preferred_tone', 'casual', activeConversation || undefined, 0.6);
  }
  if (/\b(formal|professional|corporate|business|serious)\b/.test(lowerContent)) {
    await learnUserPreference('preferred_tone', 'formal', activeConversation || undefined, 0.6);
  }

  // Format preferences
  if (/\b(bullet|list|points|numbered)\b/.test(lowerContent)) {
    await learnUserPreference('preferred_format', 'bulleted', activeConversation || undefined, 0.5);
  }
  if (/\b(no chart|just text|plain text|without chart|skip the chart)\b/.test(lowerContent)) {
    await learnUserPreference('preferred_format', 'text_only', activeConversation || undefined, 0.5);
  }
} catch { /* non-blocking */ }
```

**Important:** Use confidence 0.6 (not 0.4) so the edge function can actually read it (it filters ≥ 0.6).

---

## Fix 2: Learn From Positive Feedback Too

**What's broken:** `handleFeedback` only learns on thumbs-down. Thumbs-up should reinforce that the response style was good.

**File:** `src/hooks/useEnhancedAIChatDB.ts`

**Find** the `handleFeedback` function (~line 1616). Currently it only has learning in the `if (newVal === false)` block.

**Add learning for positive feedback too:**

```ts
// After the DB update succeeds:
if (newVal === true) {
  // Learn from positive feedback — reinforce this response style
  try {
    const { learnUserPreference } = await import('@/services/conversationMemory');
    const msg = messages.find(m => m.id === messageId);
    if (msg?.content) {
      const wordCount = msg.content.split(/\s+/).length;
      // Learn preferred response length
      if (wordCount < 100) {
        await learnUserPreference('preferred_response_length', 'short', activeConversation || undefined, 0.5);
      } else if (wordCount > 400) {
        await learnUserPreference('preferred_response_length', 'long', activeConversation || undefined, 0.5);
      }

      // Learn if user likes charts (response had visualData)
      if (msg.content.includes('visualData') || msg.content.includes('chart')) {
        await learnUserPreference('likes_charts', 'true', activeConversation || undefined, 0.5);
      }
    }
  } catch { /* non-blocking */ }
}

if (newVal === false) {
  // EXISTING negative feedback learning — keep as is
  // BUT change confidence from 0.4 to 0.6:
  try {
    const { learnUserPreference } = await import('@/services/conversationMemory');
    const assistantMsg = messages.find(m => m.id === messageId);
    if (assistantMsg) {
      await learnUserPreference(
        'disliked_response_style',
        { messagePreview: assistantMsg.content?.substring(0, 200), timestamp: new Date().toISOString() },
        activeConversation || undefined,
        0.6  // CHANGED from 0.4 to 0.6 so edge function can read it
      );
    }
  } catch { /* non-blocking */ }
}
```

---

## Fix 3: Wire Edit Pattern Analysis Into Content Generation

**What's broken:** `trackContentEdit()` saves data to `content_generation_feedback`. `getEditPreferences()` analyzes it. But `getEditPreferences()` is NEVER called — the analysis never feeds into content generation.

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

**Find** the `generate_full_content` handler, specifically the enrichment section where brand voice, solutions, competitors are fetched in parallel (~the `Promise.allSettled` block).

One of the parallel fetches should already be "edit patterns" or "edit preferences." Check if it calls something like:

```ts
// If this fetch exists but returns empty or isn't used:
supabase.from('content_generation_feedback')
  .select('feedback_type, feedback_details')
  .eq('user_id', userId)
```

**If it already fetches edit patterns** — verify the results are actually injected into the generation prompt. Look for where `editPatternContext` or similar variable is used. If it's fetched but not concatenated to the prompt, add:

```ts
if (editPatterns && editPatterns.length > 0) {
  const patterns = editPatterns.map((p: any) => p.feedback_type).filter(Boolean);
  const uniquePatterns = [...new Set(patterns)];
  if (uniquePatterns.length > 0) {
    systemPrompt += `\n\n## LEARNED FROM USER EDITS\nThe user typically makes these changes after AI generates content:\n${uniquePatterns.map(p => `- ${p.replace(/_/g, ' ')}`).join('\n')}\nApply these preferences proactively so the user doesn't need to edit.`;
  }
}
```

**If the fetch doesn't exist**, add it to the `Promise.allSettled` array:

```ts
// Add to the parallel enrichment fetches:
supabase.from('content_generation_feedback')
  .select('feedback_type')
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .limit(20)
```

Then use the results in the prompt as shown above.

---

## Fix 4: Fix Confidence Threshold Mismatch

**What's broken:** Frontend saves preferences at confidence 0.4. Edge function filters for ≥ 0.6. Even when data exists, it's invisible to the AI.

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** the user_preferences query (~line 2125):

```ts
.gte('confidence_score', 0.6)
```

**Change to:**

```ts
.gte('confidence_score', 0.4)
```

This matches what the client saves. Preferences with confidence 0.4+ will now be injected into the prompt.

**Also:** The Fix 1 and Fix 2 above already save at 0.6 confidence for new preferences. But the existing code saves at 0.4, so lowering the threshold catches both.

---

## Fix 5: Wire recordLearnedPattern() for Conversation Patterns

**What's broken:** `recordLearnedPattern()` exists but is never called. The `learned_patterns` table is always empty.

**File:** `src/hooks/useEnhancedAIChatDB.ts`

**Add pattern recording** after each successful AI response (after the assistant message is saved to state):

```ts
// After assistant message is set in state:
try {
  const { recordLearnedPattern } = await import('@/services/conversationMemory');

  // Record what tools were used in this conversation
  const toolMention = finalContent?.match(/✅.*?(Created|Published|Generated|Improved|Reformatted|Repurposed|Analyzed)/i);
  if (toolMention) {
    await recordLearnedPattern(
      'frequent_action',
      { action: toolMention[1], conversationGoal: activeConvObj?.goal },
      activeConversation || undefined
    );
  }

  // Record topic patterns
  const goal = activeConvObj?.goal;
  if (goal) {
    await recordLearnedPattern(
      'conversation_topic',
      { topic: goal },
      activeConversation || undefined
    );
  }
} catch { /* non-blocking */ }
```

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find** where user preferences are injected (~line 2125). After that block, add a query for learned patterns:

```ts
// Also inject learned patterns
try {
  const { data: patterns } = await supabase.from('learned_patterns')
    .select('pattern_type, pattern_data, occurrence_count')
    .eq('user_id', user.id)
    .gte('occurrence_count', 3)  // Only patterns seen 3+ times
    .order('occurrence_count', { ascending: false })
    .limit(5);

  if (patterns && patterns.length > 0) {
    const patternText = patterns.map((p: any) =>
      `- ${p.pattern_type}: ${JSON.stringify(p.pattern_data)} (seen ${p.occurrence_count} times)`
    ).join('\n');
    messages.unshift({
      role: 'system',
      content: `[Learned User Patterns]:\n${patternText}\nUse these patterns to anticipate user needs.`
    });
  }
} catch { /* non-blocking */ }
```

---

## SUMMARY

| Fix | What | Where | What it enables |
|-----|------|-------|----------------|
| 1 | Learn from user messages | `useEnhancedAIChatDB.ts` | AI learns tone/length/format preferences from what user says |
| 2 | Learn from positive feedback | `useEnhancedAIChatDB.ts` | AI reinforces good response styles, not just avoids bad ones |
| 3 | Wire edit patterns into generation | `content-action-tools.ts` | AI applies user's editing habits proactively |
| 4 | Fix confidence threshold | `enhanced-ai-chat/index.ts` | Existing low-confidence preferences become visible to AI |
| 5 | Wire pattern recording + reading | `useEnhancedAIChatDB.ts` + `enhanced-ai-chat/index.ts` | AI learns frequent actions and topics |

**Files:** 3 (`useEnhancedAIChatDB.ts`, `content-action-tools.ts`, `enhanced-ai-chat/index.ts`)
**Time:** ~45 min
**Tables:** All exist, no migrations needed
**Functions:** All exist, just need to be called

**After this:** Every interaction teaches the AI something:
- User says "shorter" → AI remembers and defaults to concise
- User thumbs-up a detailed response → AI learns they like long responses
- User always edits to add bullet points → AI adds bullets proactively next time
- User asks about SEO 5 times → AI anticipates SEO-related follow-ups
- All of this feeds into the prompt on every subsequent message
