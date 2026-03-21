# Final 3 Items — Implementation Plan

> **Created:** 2026-03-21
> **For:** Lovable.dev implementation
> **Scope:** 2 TODO + 1 PARTIAL remaining from improvement plan
> **Time estimate:** ~1.5 hours

---

## ITEM 1: Pagination on List Views (45 min)

**What's wrong:** Repository, Keywords, and Proposals pages load ALL items from the database at once. With 200+ content items or 1000+ keywords, this will be slow and use excessive memory.

---

### 1A — Repository Page

**Frontend — File:** `src/pages/Repository.tsx` and `src/contexts/content/ContentProvider.tsx`

The content provider fetches all content items. Add pagination:

**In ContentProvider.tsx** — find the content fetch query. Change it to use range-based pagination:

```ts
const PAGE_SIZE = 20;
const [page, setPage] = useState(0);

// Change the query from:
const { data } = await supabase
  .from('content_items')
  .select('*')
  .eq('user_id', userId)
  .order('created_at', { ascending: false });

// To:
const { data, count } = await supabase
  .from('content_items')
  .select('*', { count: 'exact' })
  .eq('user_id', userId)
  .is('deleted_at', null)  // respect soft delete
  .order('created_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

Expose `page`, `setPage`, `totalCount` (from `count`), and `PAGE_SIZE` from the provider.

**In Repository.tsx** — add a "Load More" button at the bottom of the content list:

```tsx
{totalCount > (page + 1) * PAGE_SIZE && (
  <div className="flex justify-center py-6">
    <Button
      variant="outline"
      onClick={() => setPage(prev => prev + 1)}
      className="text-sm"
    >
      Load more ({(page + 1) * PAGE_SIZE} of {totalCount})
    </Button>
  </div>
)}
```

**Important:** When loading more, APPEND to existing items, don't replace:

```ts
// In the provider, when page changes:
if (page === 0) {
  setContentItems(data);
} else {
  setContentItems(prev => [...prev, ...data]);
}
```

**Backend:** No changes.

---

### 1B — Keywords Page

**Frontend — File:** `src/pages/keywords/KeywordsPage.tsx`

Find the keywords fetch. Add the same pagination pattern:

```ts
const PAGE_SIZE = 30;
const [page, setPage] = useState(0);

const { data, count } = await supabase
  .from('keywords')
  .select('*', { count: 'exact' })
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

Add "Load more" button at the bottom of the keyword list (same pattern as Repository).

**Backend:** No changes.

---

### 1C — Proposals Page

**Frontend — File:** `src/pages/AIProposals.tsx` (or wherever proposals are fetched)

Find the proposals fetch. Add pagination:

```ts
const PAGE_SIZE = 20;
const [page, setPage] = useState(0);

const { data, count } = await supabase
  .from('ai_strategy_proposals')
  .select('*', { count: 'exact' })
  .eq('user_id', userId)
  .order('created_at', { ascending: false })
  .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
```

Add "Load more" button (same pattern).

**Backend:** No changes.

**Important for all three:** When filters change (status, search, sort), reset page back to 0:

```ts
// In filter change handlers:
setPage(0);
```

**Test:**
- Repository with 25+ items → should show 20 initially with "Load more (20 of 25)" button
- Click "Load more" → remaining 5 items appear
- Change a filter → list resets to page 0
- Same behavior for Keywords and Proposals

---

## ITEM 2: Token Usage Tracking (30 min)

**What's wrong:** The AI edge function computes tokens used but never saves them. The UsageSettingsTab component exists but has no data source. Users can't see what their AI calls cost.

---

### 2A — Create the ai_usage_log table

**Migration:**

```sql
-- Token usage tracking table
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid,
  model text,
  provider text,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  tool_name text,
  created_at timestamptz DEFAULT now()
);

-- RLS
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own usage" ON ai_usage_log
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Service inserts usage" ON ai_usage_log
  FOR INSERT WITH CHECK (true);

-- Index for fast queries
CREATE INDEX idx_ai_usage_user_date ON ai_usage_log(user_id, created_at DESC);
CREATE INDEX idx_ai_usage_user_model ON ai_usage_log(user_id, model);
```

---

### 2B — Log token usage after every AI call

**Backend — File:** `supabase/functions/enhanced-ai-chat/index.ts`

Find where the AI response is received (after the `ai-proxy` call returns). The response object typically has a `usage` field with `prompt_tokens` and `completion_tokens`.

Add this immediately after the AI response is parsed:

```ts
// Log token usage (non-blocking)
try {
  const usage = aiResponse?.usage || {};
  if (usage.prompt_tokens || usage.completion_tokens || usage.total_tokens) {
    await supabase.from('ai_usage_log').insert({
      user_id: userId,
      conversation_id: conversationId || null,
      model: selectedModel || provider?.preferred_model || 'unknown',
      provider: provider?.provider || 'unknown',
      prompt_tokens: usage.prompt_tokens || 0,
      completion_tokens: usage.completion_tokens || 0,
      total_tokens: usage.total_tokens || (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
      tool_name: currentToolName || null
    });
  }
} catch (usageErr) {
  console.warn('Token usage logging failed (non-blocking):', usageErr);
}
```

**Important:** This must be non-blocking (wrapped in try-catch) — a logging failure should never break the chat response.

Also log usage for tool-specific AI calls. Find where `callAiProxyWithRetry` is called in content-action-tools.ts (for `generate_full_content`, `improve_content`, `reformat_content`, `repurpose_for_social`). Add the same logging after each call:

```ts
// After any callAiProxyWithRetry call that returns aiResponse:
try {
  const toolUsage = aiResponse?.usage || {};
  if (toolUsage.prompt_tokens || toolUsage.completion_tokens) {
    await supabase.from('ai_usage_log').insert({
      user_id: userId,
      conversation_id: null,
      model: 'tool-call',
      provider: provider?.provider || 'unknown',
      prompt_tokens: toolUsage.prompt_tokens || 0,
      completion_tokens: toolUsage.completion_tokens || 0,
      total_tokens: (toolUsage.prompt_tokens || 0) + (toolUsage.completion_tokens || 0),
      tool_name: toolName
    });
  }
} catch { /* non-blocking */ }
```

---

### 2C — Wire UsageSettingsTab to real data

**Frontend — File:** `src/components/settings/UsageSettingsTab.tsx`

This component already exists. It needs to query the `ai_usage_log` table. Replace any placeholder/mock data with:

```ts
const { data: usageData } = useQuery({
  queryKey: ['ai-usage', user?.id],
  queryFn: async () => {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { data } = await supabase
      .from('ai_usage_log')
      .select('model, provider, prompt_tokens, completion_tokens, total_tokens, tool_name, created_at')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false });
    return data || [];
  },
  enabled: !!user?.id,
  staleTime: 60_000
});

// Compute summary metrics
const totalTokens = usageData?.reduce((sum, row) => sum + (row.total_tokens || 0), 0) || 0;
const totalCalls = usageData?.length || 0;
const modelBreakdown = usageData?.reduce((acc, row) => {
  const key = row.model || 'unknown';
  acc[key] = (acc[key] || 0) + (row.total_tokens || 0);
  return acc;
}, {} as Record<string, number>) || {};

// Rough cost estimate (based on GPT-4o-mini pricing)
const estimatedCost = (totalTokens / 1_000_000) * 0.15; // $0.15 per 1M input tokens (approximate)
```

Display:
- "This month: X,XXX total tokens across Y calls"
- "Estimated cost: $X.XX" (rough, based on model pricing)
- Breakdown by model (table or bar chart)
- Top tools by token usage

**Backend:** No changes (data comes from the table populated in 2B).

**Test:**
- Send a few messages in AI chat
- Go to Settings → Usage tab → should see token counts, call counts, model breakdown
- If no data yet, should show "No usage data — send a message in AI Chat to start tracking"

---

## ITEM 3: Soft Delete Enforcement (15 min)

**What's wrong:** `deleted_at` column exists on some tables from a migration, but delete handlers still hard-delete rows.

---

### 3A — Content Items: Soft Delete

**Frontend — File:** `src/contexts/content/actions/deleteContentAction.ts`

Find the delete function. Change from hard delete to soft delete:

```ts
// Instead of:
await supabase.from('content_items').delete().eq('id', contentId);

// Use:
await supabase.from('content_items')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', contentId)
  .eq('user_id', userId);
```

**Frontend — File:** `src/components/repository/RepositoryBulkBar.tsx`

Find `handleBulkDelete`. Change from hard delete to soft delete:

```ts
// Instead of:
for (const id of selectedIds) {
  await deleteContentItem(id);
}

// Use:
await supabase.from('content_items')
  .update({ deleted_at: new Date().toISOString() })
  .in('id', selectedIds);
```

### 3B — Conversations: Soft Delete

**Frontend — File:** `src/hooks/useEnhancedAIChatDB.ts`

Find the conversation delete function. Change from hard delete to soft delete:

```ts
// Instead of:
await supabase.from('ai_conversations').delete().eq('id', conversationId);

// Use:
await supabase.from('ai_conversations')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', conversationId)
  .eq('user_id', userId);
```

### 3C — Exclude Soft-Deleted Rows from Queries

All existing queries that fetch content_items or ai_conversations should add `.is('deleted_at', null)` to exclude soft-deleted rows. Key places:

**ContentProvider.tsx:**
```ts
.from('content_items')
.select('*')
.eq('user_id', userId)
.is('deleted_at', null)  // Add this line
```

**useEnhancedAIChatDB.ts** (conversation list fetch):
```ts
.from('ai_conversations')
.select('*')
.eq('user_id', userId)
.is('deleted_at', null)  // Add this line
```

**Backend:** No changes needed — RLS policies should ideally also filter by `deleted_at IS NULL`, but that can be done in a future migration. The frontend filter is sufficient for now.

**Test:**
- Delete a content item → it should disappear from Repository
- Check DB directly → row should still exist with `deleted_at` set to a timestamp
- Delete a conversation → should disappear from sidebar
- Check DB → row still exists with `deleted_at` timestamp

---

## SUMMARY

| # | Item | Frontend | Backend | Time |
|---|------|----------|---------|------|
| 1 | Pagination (Repository + Keywords + Proposals) | 3 page files + 1 provider | 0 | 45 min |
| 2 | Token usage tracking | UsageSettingsTab.tsx | index.ts + migration | 30 min |
| 3 | Soft delete enforcement | deleteAction + bulkBar + chatDB + provider | 0 | 15 min |
| **Total** | | **7 files** | **1 file + 1 migration** | **~1.5 hrs** |

---

## AFTER THIS

**Everything from every plan is complete:**
- Major 80: 80/80 (23 SB + 25 M1 + 32 parked)
- Fix Plan (5:37pm): 37/37
- Final 7 (8:55pm): 7/7
- Improvement Plan: 24/24
- This plan: 3/3

**Only deferred item:** AI model selection, smart routing, context window, prompt optimization — to be addressed as a separate effort.
