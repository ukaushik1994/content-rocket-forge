# Analyst ↔ AI Chat Sync + Data Accuracy Fix Plan

> **Created:** 2026-03-21
> **For:** Lovable.dev implementation
> **Scope:** 3 parts — make analyst react to conversation, pass analyst state to AI, fix data accuracy
> **Time estimate:** ~1.5 hours

---

## THE PROBLEM

The Analyst sidebar and the AI Chat are two independent systems running in parallel with no shared state:

- The AI doesn't know what the analyst is showing the user
- The analyst doesn't know what the AI just did
- Both query the same DB at different times → show conflicting numbers
- Anomalies pile up without deduplication
- Some queries are missing user_id filters (data leak)

---

## PART 1: Make Analyst React to Conversation (30 min)

These changes make the analyst sidebar update when the AI does things, instead of waiting for the 120-second timer.

---

### 1A — Refresh platformData after AI tool calls

**What's wrong:** User asks AI to "publish my top 3 drafts" → AI publishes them → analyst sidebar still shows old publish count for up to 2 minutes.

**File:** `src/hooks/useAnalystEngine.ts`

The engine exposes `triggerRefresh()`. The problem is nothing calls it after tool actions.

**File:** `src/hooks/useEnhancedAIChatDB.ts`

After a successful AI response that contains tool results, trigger an analyst refresh. Find where the AI response is parsed (after SSE `done` event). Add:

```ts
// After AI response is fully received and message is saved:
// Check if the response contained tool actions that modified data
const hasWriteAction = finalMessage.content?.match(/✅|Created|Published|Deleted|Updated|Approved|Rejected|Improved|Reformatted/i);
if (hasWriteAction && analystRefreshRef.current) {
  // Trigger analyst refresh after a short delay (let DB settle)
  setTimeout(() => {
    analystRefreshRef.current?.();
  }, 2000);
}
```

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Pass the analyst's `triggerRefresh` to the chat hook via ref:

```ts
// Create a ref for analyst refresh
const analystRefreshRef = useRef<(() => void) | null>(null);

// When analyst state is available:
useEffect(() => {
  analystRefreshRef.current = analystState?.triggerRefresh || null;
}, [analystState?.triggerRefresh]);

// Pass ref to chat hook or make it available where SSE response is handled
```

**Backend:** No changes.

---

### 1B — Clear and replace anomalies on refresh (don't append)

**What's wrong:** Every 120 seconds, `detectAnomalies()` adds NEW anomaly insights but never removes old ones. User sees duplicate "5 stale drafts" warnings piling up.

**File:** `src/hooks/useAnalystEngine.ts`

Find the anomaly detection effect (look for `detectAnomalies` or where `anomalyInsights` state is set). Currently it likely does:

```ts
setAnomalyInsights(prev => [...prev, ...newAnomalies]);
```

**Change to REPLACE instead of append:**

```ts
setAnomalyInsights(newAnomalies); // Replace entirely — don't accumulate
```

Also, use content-based IDs instead of timestamp-based to enable deduplication:

```ts
// Instead of:
id: `anomaly-low-seo-${now.getTime()}`

// Use:
id: `anomaly-low-seo-${lowSeoCount}`  // Stable ID based on content
```

Do the same for ALL anomaly ID generation:
- `anomaly-stale-drafts-${staleDraftCount}`
- `anomaly-empty-calendar-${hasCalendar ? 0 : 1}`
- `anomaly-stale-published-${stalePublishedCount}`

And for cross-signal IDs:
- `cross-publish-gap-${daysSinceLast}`
- `cross-seo-trend-${direction}`
- `cross-topic-concentration-${keyword}`
- `cross-cannibalization-${keyword}`

**Backend:** No changes.

---

### 1C — Invalidate session memory when topic changes

**What's wrong:** Previous session saved "SEO declining" insight. Today's conversation is about email campaigns. Analyst still shows "[From 18h ago] SEO declining" at the top — irrelevant.

**File:** `src/hooks/useAnalystEngine.ts`

Find the session memory restore logic (where `loadSessionMemory` is called). After loading, filter by relevance:

```ts
// After loading session memory insights:
if (restoredInsights.length > 0 && topics.length > 0) {
  const currentTopicCategories = topics.map(t => t.category);

  // Only show session insights that match current conversation topics
  restoredInsights = restoredInsights.filter(insight => {
    // Keep warnings (always relevant)
    if (insight.urgency === 'critical' || insight.urgency === 'high') return true;

    // For medium/low, check topic relevance
    const insightText = insight.content.toLowerCase();
    return currentTopicCategories.some(cat => {
      if (cat === 'content' && (insightText.includes('content') || insightText.includes('draft') || insightText.includes('seo'))) return true;
      if (cat === 'keywords' && insightText.includes('keyword')) return true;
      if (cat === 'campaigns' && insightText.includes('campaign')) return true;
      if (cat === 'competitors' && insightText.includes('competitor')) return true;
      if (cat === 'email' && (insightText.includes('email') || insightText.includes('engage'))) return true;
      return false;
    });
  });
}
```

If the conversation has 0 messages yet (fresh start), show ALL session insights (no filter). Once user sends the first message and topics are detected, filter kicks in.

**Backend:** No changes.

---

### 1D — NarrativePromptCard uses live data at click time

**What's wrong:** Action buttons hardcode numbers from when the section rendered. "I have 7 drafts" button was true 2 minutes ago but user just published 2 — now it's 5.

**File:** `src/components/ai-chat/analyst-sections/StrategicStanceSection.tsx` (and any other section with NarrativePromptCard actions)

Instead of passing static prompt strings, compute at click time:

```tsx
// Instead of:
<NarrativePromptCard
  primaryAction="I have 7 unpublished drafts. Help me prioritize which to publish first."
  onSendMessage={onSendMessage}
/>

// Use a dynamic handler:
<NarrativePromptCard
  primaryAction="" // placeholder, overridden by custom handler
  onSendMessage={(msg) => {
    const draftCount = platformData.find(d => d.label === 'Drafts')?.value || '?';
    const avgSeo = platformData.find(d => d.label === 'Avg SEO Score')?.value || '?';
    onSendMessage(`I have ${draftCount} unpublished drafts (avg SEO: ${avgSeo}). Help me prioritize which to publish first based on SEO potential.`);
  }}
/>
```

Apply this pattern to ALL NarrativePromptCard instances that reference data counts:
- StrategicStanceSection — draft count, SEO score
- HealthAssessmentSection — health score value
- CampaignPulseSection — campaign count, failed items
- KeywordLandscapeSection — keyword count, proposal count

**Backend:** No changes.

---

### 1E — Strategic recommendation re-computes on data change

**What's wrong:** Recommendation is computed via `useMemo` and might have stale deps. If user publishes all drafts during conversation, recommendation still says "stop-creating, publish first."

**File:** `src/hooks/useAnalystEngine.ts`

Find the `strategicRecommendation` useMemo. Verify the dependency array includes `platformData`:

```ts
const strategicRecommendation = useMemo(() => {
  // ... recommendation logic
}, [platformData, isActive]); // Make sure platformData is in deps
```

If `platformData` is already in the deps, the recommendation will re-compute when `fetchPlatformData` runs. The fix in 1A (triggering refresh after tool calls) will cascade here automatically.

**Backend:** No changes.

---

## PART 2: Pass Analyst State to AI (20 min)

This closes the gap where the AI has no idea what the user sees in the sidebar.

---

### 2A — Include analyst summary in chat request

**File:** `src/hooks/useEnhancedAIChatDB.ts`

In the `sendMessage` function, where the request body is built, add analyst context:

```ts
// Build analyst context from the current analyst state
// (analystState needs to be accessible here — pass via ref or prop)
let analystSummary = null;
if (analystActiveRef.current && analystStateRef.current) {
  const state = analystStateRef.current;
  analystSummary = {
    healthScore: state.healthScore?.total ?? null,
    healthStatus: state.healthScore?.status ?? null,
    healthTrend: state.healthScore?.trend ?? null,
    activeWarnings: state.insightsFeed
      ?.filter((i: any) => i.type === 'warning')
      .map((i: any) => i.content)
      .slice(0, 5) || [],
    recommendation: state.strategicRecommendation?.stance ?? null,
    recommendationReasoning: state.strategicRecommendation?.reasoning ?? null,
    userStage: state.userStage ?? null,
    topAnomalies: (state.crossSignalInsights || [])
      .slice(0, 3)
      .map((i: any) => i.content),
    goalProgress: state.goalProgress
      ? { name: state.goalProgress.goalName, percentage: state.goalProgress.percentage }
      : null
  };
}

// Add to request body:
body: JSON.stringify({
  messages: messagesToSend,
  context: {
    conversation_id: conversationId,
    analystActive: analystActiveRef.current,
    analystSummary: analystSummary  // NEW
  },
  stream: true
})
```

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Make analystState accessible to the chat hook via ref:

```ts
const analystStateRef = useRef(analystState);
useEffect(() => {
  analystStateRef.current = analystState;
}, [analystState]);

// Pass to chat hook or make available where sendMessage builds request body
```

---

### 2B — AI prompt references analyst data

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find the existing analyst mode injection (where `context?.analystActive` is checked). Replace or extend it with:

```ts
if (context?.analystActive) {
  let analystPrompt = `\n\n## 📊 ANALYST SIDEBAR — WHAT THE USER SEES RIGHT NOW\n`;

  if (context?.analystSummary) {
    const s = context.analystSummary;

    if (s.healthScore !== null) {
      analystPrompt += `**Health Score:** ${s.healthScore}/100 (${s.healthStatus || 'unknown'}, trend: ${s.healthTrend || 'stable'})\n`;
    }

    if (s.recommendation) {
      analystPrompt += `**Strategic Stance:** ${s.recommendation}`;
      if (s.recommendationReasoning) {
        analystPrompt += ` — ${s.recommendationReasoning}`;
      }
      analystPrompt += '\n';
    }

    if (s.userStage) {
      analystPrompt += `**User Stage:** ${s.userStage}\n`;
    }

    if (s.activeWarnings?.length > 0) {
      analystPrompt += `**Active Warnings the user can see:**\n`;
      s.activeWarnings.forEach((w: string) => {
        analystPrompt += `- ${w}\n`;
      });
    }

    if (s.topAnomalies?.length > 0) {
      analystPrompt += `**Cross-Signal Alerts:**\n`;
      s.topAnomalies.forEach((a: string) => {
        analystPrompt += `- ${a}\n`;
      });
    }

    if (s.goalProgress) {
      analystPrompt += `**Goal:** ${s.goalProgress.name} — ${s.goalProgress.percentage}% complete\n`;
    }

    analystPrompt += `\nIMPORTANT: The user can see ALL of this in their sidebar right now. If they ask about their health score, warnings, or recommendations, reference these EXACT values. Do not re-compute or show different numbers — it will confuse them.\n`;
    analystPrompt += `If your tool calls return different numbers than the sidebar shows, acknowledge the difference: "The sidebar shows X, but the latest data shows Y — looks like things changed since the sidebar last refreshed."\n`;
  } else {
    // Analyst is active but no summary sent — use the existing lightweight injection
    analystPrompt += `The user has the Analyst sidebar open. Include charts and data-rich responses when relevant.\n`;
  }

  systemPrompt += analystPrompt;
}
```

**Remove the existing heavy-handed analyst injection** that says "EVERY response MUST include visualData charts." Replace it with the context-aware version above. The AI should include charts when relevant, not on every single message.

**Frontend:** No additional changes beyond 2A.

---

## PART 3: Fix Analyst Data Accuracy (45 min)

---

### 3A — Add user_id filter to contacts, email, and signals queries

**CRITICAL BUG:** These queries return data from ALL users.

**File:** `src/hooks/useAnalystEngine.ts`

**Find the contacts query** (in `fetchPlatformData`, ~line 1318):
```ts
// BROKEN — no user filter:
const { count } = await supabase
  .from('engage_contacts')
  .select('id', { count: 'exact', head: true });
```

**Fix — add workspace/user filter:**
```ts
const { count } = await supabase
  .from('engage_contacts')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);

// If engage_contacts uses workspace_id instead of user_id:
// .eq('workspace_id', userId)
```

**Find the email campaigns query** (~line 1327) — same fix:
```ts
const { count } = await supabase
  .from('email_campaigns')
  .select('id', { count: 'exact', head: true })
  .eq('user_id', userId);
```

**Find the performance signals query** (~line 1335) — same fix:
```ts
const { data: perfSignals } = await supabase
  .from('content_performance_signals')
  .select('content_id, signal_type')
  .eq('user_id', userId)  // ADD THIS
  .limit(100);
```

**Backend:** No changes.

---

### 3B — Fix SEO trend to use all 5 articles (not just 2)

**File:** `src/hooks/useAnalystEngine.ts`

Find the SEO trend detection in `computeCrossSignals` (~line 204). Currently:
```ts
const avgFirst = (scores[0] + scores[1]) / 2;
const avgLast = (scores[scores.length - 2] + scores[scores.length - 1]) / 2;
```

**Replace with proper moving average:**
```ts
if (recentArticles && recentArticles.length >= 4) {
  const scores = recentArticles.map((a: any) => a.seo_score as number).filter((s: number) => s > 0);
  if (scores.length >= 4) {
    // Compare first half vs second half
    const midpoint = Math.floor(scores.length / 2);
    const recentHalf = scores.slice(0, midpoint);
    const olderHalf = scores.slice(midpoint);
    const recentAvg = recentHalf.reduce((a: number, b: number) => a + b, 0) / recentHalf.length;
    const olderAvg = olderHalf.reduce((a: number, b: number) => a + b, 0) / olderHalf.length;
    const delta = recentAvg - olderAvg;

    if (delta < -10) {
      // Declining — but only if consistent, not just one outlier
      const outliers = recentHalf.filter((s: number) => s < olderAvg - 15).length;
      if (outliers <= 1 && recentHalf.length > 2) {
        // Single outlier — don't trigger
      } else {
        signals.push({
          id: `cross-seo-trend-declining`,
          type: 'warning',
          content: `📉 SEO scores trending down: recent avg ${Math.round(recentAvg)} vs older avg ${Math.round(olderAvg)}`,
          // ...
        });
      }
    } else if (delta > 10) {
      signals.push({
        id: `cross-seo-trend-improving`,
        type: 'opportunity',
        content: `📈 SEO scores improving: recent avg ${Math.round(recentAvg)} vs older avg ${Math.round(olderAvg)}`,
        // ...
      });
    }
  }
}
```

**Backend:** No changes.

---

### 3C — Stage-aware health score targets

**File:** `src/hooks/useAnalystEngine.ts`

Find the Content Volume factor in `computeHealthScore` (~line 654):
```ts
const volumeScore = Math.min(20, Math.round((totalContent / 15) * 20));
```

**Replace with stage-aware targets:**
```ts
const stageTargets: Record<string, number> = {
  starter: 5,
  growing: 15,
  established: 30,
  scaling: 50
};
const target = stageTargets[userStage || 'growing'] || 15;
const volumeScore = Math.min(20, Math.round((totalContent / target) * 20));

factors.push({
  name: 'Content Volume',
  score: volumeScore,
  maxScore: 20,
  status: volumeScore >= 14 ? 'good' : volumeScore >= 8 ? 'warning' : 'critical',
  detail: `${totalContent} total pieces (target for ${userStage || 'growing'} stage: ${target}+)`,
});
```

This way a "starter" user with 5 articles gets full marks (not penalized for being new).

**Backend:** No changes.

---

### 3D — Guard against division by zero in goals

**File:** `src/hooks/useAnalystEngine.ts`

Find the goal progress calculation (~line 1648):
```ts
const percentage = Math.min(100, Math.round((currentValue / goal.target_value) * 100));
```

**Add guard:**
```ts
const targetValue = goal.target_value || 1; // Prevent division by zero
const percentage = Math.min(100, Math.round((currentValue / targetValue) * 100));
```

**Backend:** No changes.

---

### 3E — Remove seasonal detection (B2C-only, irrelevant for most users)

**File:** `src/hooks/useAnalystEngine.ts`

Find the seasonal detection block in `computeCrossSignals` (~line 511-549). This has hardcoded consumer topics ("valentine", "christmas", "back-to-school") that are irrelevant for B2B users.

**Remove the entire seasonal block.** Or if you want to keep it, gate it behind a user setting:

```ts
// Option A: Remove entirely
// Delete lines 511-549

// Option B: Gate behind setting (add later)
// if (userPreferences?.businessType === 'b2c') {
//   ... seasonal detection
// }
```

For now, just remove it. It causes more confusion than value.

**Backend:** No changes.

---

### 3F — Fix goal progress to use created_at not updated_at

**File:** `src/hooks/useAnalystEngine.ts`

Find the goal progress query (~line 1633):
```ts
.gte('updated_at', since)
```

**Change to:**
```ts
.gte('created_at', since)
```

This ensures "publish 5 articles this month" counts newly created articles, not articles that had a typo fixed.

**Backend:** No changes.

---

### 3G — Strategic recommendation checks trajectory, not just average

**File:** `src/hooks/useAnalystEngine.ts`

Find the "fix-quality" rule (~line 1700):
```ts
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
  return { stance: 'fix-quality', ... };
}
```

**Add trajectory check:**
```ts
if (avgSeo > 0 && avgSeo < 45 && published >= 3) {
  // Check if recent articles are actually improving
  const recentScores = platformData
    .filter(d => d.category === 'content' && d.label.startsWith('SEO:'))
    .map(d => d.value)
    .slice(0, 3);

  const recentAvg = recentScores.length > 0
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    : avgSeo;

  if (recentAvg >= 60) {
    // Recent articles are good — old articles drag down average
    // Don't recommend "fix quality" — recommend "rescore old content"
    return {
      stance: 'accelerate',
      reasoning: `Your recent articles average ${Math.round(recentAvg)} SEO, but older content drags your overall average to ${avgSeo}. Consider rescoring old content in Settings.`,
      // ...
    };
  }

  // Recent articles also bad — genuinely need quality fix
  return { stance: 'fix-quality', ... };
}
```

**Backend:** No changes.

---

## VERIFICATION CHECKLIST

After implementation, test:

**Part 1 — Analyst reacts to conversation:**
- [ ] Ask AI to "create a draft about AI" → analyst sidebar draft count updates within ~3 seconds (not 2 minutes)
- [ ] Wait 5 minutes → anomaly insights should NOT have duplicates
- [ ] Start new conversation about email → "[From yesterday] SEO declining" should NOT appear if yesterday's conversation was about SEO
- [ ] Click "Triage My Drafts" button → prompt should show current draft count (not stale)

**Part 2 — AI knows analyst state:**
- [ ] With analyst open, ask "why is my health score low?" → AI should reference the exact score and factors from the sidebar
- [ ] With analyst showing "fix-quality" recommendation, ask "what should I focus on?" → AI should align with the recommendation
- [ ] AI publishes content → analyst updates → AI's next response reflects new numbers

**Part 3 — Data accuracy:**
- [ ] Check engage contacts count → should only show YOUR contacts (not all users)
- [ ] User with 3 articles → health score should NOT be "critical" (stage-aware target for starter = 5)
- [ ] 5 recent articles with scores [85, 55, 80, 82, 83] → should NOT trigger "SEO declining" (single outlier)
- [ ] Set goal target_value to 0 → should NOT crash (shows 100% or "no target set")
- [ ] No seasonal topic warnings in the insights feed

---

## SUMMARY

| Part | Items | What | Files | Time |
|------|:-----:|------|-------|------|
| 1 | 1A-1E | Analyst reacts to conversation | `useAnalystEngine.ts`, `useEnhancedAIChatDB.ts`, `EnhancedChatInterface.tsx`, analyst section components | 30 min |
| 2 | 2A-2B | Pass analyst state to AI | `useEnhancedAIChatDB.ts`, `EnhancedChatInterface.tsx`, `enhanced-ai-chat/index.ts` | 20 min |
| 3 | 3A-3G | Fix data accuracy | `useAnalystEngine.ts` | 45 min |
| **Total** | **14 items** | | **5 files** | **~1.5 hrs** |

**After this:**
- Analyst updates immediately when AI does things (not 2 min delay)
- No duplicate anomaly alerts
- AI knows exactly what the user sees in the sidebar
- AI and sidebar show consistent numbers
- Session memory only shows relevant insights
- Health score is fair for new users
- SEO trends use proper statistics
- No multi-tenant data leaks
- No division by zero crashes
- No irrelevant seasonal alerts
