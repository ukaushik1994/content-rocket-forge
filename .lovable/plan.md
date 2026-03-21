

# Self-Learning Wiring — Implementation Plan

## Overview
Wire the existing `learnUserPreference()` and `recordLearnedPattern()` functions into the chat flow so the AI learns from every interaction. All 5 phases, 3 files.

---

## Phase 1: Learn From User Messages
**File:** `src/hooks/useEnhancedAIChatDB.ts` — after line 549 (after user message saved, before assistant call)

Insert a `try/catch` block that imports `learnUserPreference` and pattern-matches the user's message content:
- `/shorter|concise|brief|too long/` → `learnUserPreference('preferred_length', 'short', ..., 0.6)`
- `/more detail|elaborate|expand|longer/` → `learnUserPreference('preferred_length', 'long', ..., 0.6)`
- `/casual|informal|friendly/` → `learnUserPreference('preferred_tone', 'casual', ..., 0.6)`
- `/formal|professional|corporate/` → `learnUserPreference('preferred_tone', 'formal', ..., 0.6)`
- `/bullet|list|points/` → `learnUserPreference('preferred_format', 'bullet_points', ..., 0.6)`
- `/no chart|just text|plain text/` → `learnUserPreference('preferred_format', 'text_only', ..., 0.6)`

All non-blocking, wrapped in `try/catch`.

---

## Phase 2: Learn From Positive Feedback
**File:** `src/hooks/useEnhancedAIChatDB.ts` — in `handleFeedback` (lines 1633-1647)

**Before** the existing `if (newVal === false)` block, add a `if (newVal === true)` block:
- Check liked message word count: `< 150` → learn `preferred_response_length` = `'short'`; `> 400` → learn `'long'`
- Check if message has `visualData` → learn `likes_charts` = `true`
- Confidence 0.5

**Also:** Change existing negative feedback confidence from `0.4` to `0.6` (line 1644).

---

## Phase 3: Verify Edit Patterns (Already Done)
`content-action-tools.ts` already fetches edit patterns and injects `editPatternHint`. No changes needed.

---

## Phase 4: Lower Confidence Threshold
**File:** `supabase/functions/enhanced-ai-chat/index.ts` — line 2128

Change `.gte('confidence_score', 0.6)` → `.gte('confidence_score', 0.4)` so preferences saved at 0.5-0.6 are visible to the AI.

---

## Phase 5A: Record Patterns After Assistant Response
**File:** `src/hooks/useEnhancedAIChatDB.ts` — after line 808 (after mutation keyword check)

Insert a `try/catch` block:
- If `responseContent` matches tool-action keywords (`Created|Published|Generated|Scheduled|Sent`), call `recordLearnedPattern('frequent_action', { action: matchedKeyword })`
- Record conversation topic from detected goal: `recordLearnedPattern('conversation_topic', { topic: detectedGoal })`

---

## Phase 5B: Read Learned Patterns in Backend
**File:** `supabase/functions/enhanced-ai-chat/index.ts` — after the user_preferences query (~line 2138)

Add a second query:
```typescript
const { data: patterns } = await supabase.from('learned_patterns')
  .select('pattern_type, pattern_data, occurrences')
  .eq('user_id', user.id)
  .gte('occurrences', 3)
  .order('occurrences', { ascending: false })
  .limit(5);

if (patterns?.length) {
  const patternsText = patterns.map(p => `- ${p.pattern_type}: ${JSON.stringify(p.pattern_data)} (seen ${p.occurrences}x)`).join('\n');
  messages.unshift({ role: 'system', content: `[Learned User Patterns]:\n${patternsText}\nAnticipate these recurring needs.` });
}
```

---

## Files Changed: 2 (+1 deploy)

| File | Phases |
|------|--------|
| `src/hooks/useEnhancedAIChatDB.ts` | 1, 2, 5A |
| `supabase/functions/enhanced-ai-chat/index.ts` | 4, 5B |

All changes are additive, non-blocking, and use existing table structures and service functions.

