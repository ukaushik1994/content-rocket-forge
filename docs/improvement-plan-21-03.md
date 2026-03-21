# Creaiter Improvement Plan — All Sections

> **Created:** 2026-03-21
> **For:** Lovable.dev implementation
> **Rule:** No changes that disrupt the frontend. Backend-first where possible. No extra cost.

---

## ~~SECTION 1: AI Model + Cost + Context Window~~ — DEFERRED

> Will be addressed separately after all other sections are done. Includes: smart model routing, context window expansion, system prompt token reduction.

---

## SECTION 2: Content Generation Quality Fixes

All backend changes. No frontend disruption.

### 2A — Enforce Word Count Target

**Backend:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

In `generate_full_content`, add explicit word count instruction to the generation prompt:

```ts
// Add to the AI generation prompt, after the topic/keyword instructions:
const wordCountInstruction = toolArgs.word_count
  ? `\n\nCRITICAL: This article MUST be approximately ${toolArgs.word_count} words (±10%). Count your output carefully. If you're running short, add another substantive section. If running long, tighten your prose.`
  : '\n\nTarget 1,200-1,500 words for blog posts, 200-400 for social, 300-600 for email.';

prompt += wordCountInstruction;
```

### 2B — Verify SERP Selections Reach AI in All Code Paths

**Backend:** `src/services/advancedContentGeneration.ts`

The main `buildAdvancedContentPrompt` already includes SERP items. But the chunked generation path (~line 165) may lose them. Verify that `generateInChunks()` passes SERP context to every chunk:

```ts
// In generateInChunks(), for each chunk after the first:
const chunkPrompt = `Continue writing the article. You are on section ${chunkIndex + 1} of ${totalChunks}.

SERP ITEMS TO STILL INCORPORATE (if not yet used):
${remainingSerpItems.map((item, i) => `${i + 1}. ${item.title}: ${item.snippet}`).join('\n')}

Continue from where the previous section ended. Write the next ${wordsPerChunk} words.`;
```

### 2C — Preserve Outline Structure in Chunked Generation

**Backend:** `src/services/advancedContentGeneration.ts`

In `generateInChunks()`, pass the specific outline sections for each chunk instead of the full outline:

```ts
// Assign outline sections to chunks
const sectionsPerChunk = Math.ceil(outline.length / totalChunks);
const chunkOutline = outline.slice(
  chunkIndex * sectionsPerChunk,
  (chunkIndex + 1) * sectionsPerChunk
);

const chunkPrompt += `\n\nSECTIONS TO WRITE IN THIS CHUNK:\n${chunkOutline.map(s => `- ${s.heading} (${s.type}): ${s.description || ''}`).join('\n')}`;
```

### 2D — Improve SEO Scoring Accuracy

**Backend:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

In `calculateBasicSeoScore()`, add penalties for common quality issues:

```ts
// After existing scoring, add penalties:
// Penalty: keyword stuffing (density > 3%)
const keywordCount = (content.match(new RegExp(keyword, 'gi')) || []).length;
const density = wordCount > 0 ? (keywordCount / wordCount) * 100 : 0;
if (density > 3) score -= 10;

// Penalty: no internal links
if (!content.includes('<a ')) score -= 5;

// Penalty: all paragraphs are similar length (AI pattern)
const paragraphs = content.split(/<\/p>/i).filter(p => p.trim().length > 20);
if (paragraphs.length > 3) {
  const lengths = paragraphs.map(p => p.replace(/<[^>]+>/g, '').split(/\s+/).length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / lengths.length;
  if (variance < 50) score -= 5; // Too uniform = likely AI
}

// Penalty: no questions in content (engagement signal)
if (!content.includes('?')) score -= 3;

// Bonus: has FAQ section
if (/<h[23][^>]*>.*FAQ|frequently asked/i.test(content)) score += 5;
```

### 2E — Surface Readability Score

**Backend:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

After calculating SEO score, also compute readability and include in the response:

```ts
// Simple readability calculation
const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 5);
const avgSentenceLength = sentences.length > 0
  ? Math.round(plainText.split(/\s+/).length / sentences.length)
  : 0;

const readabilityNote = avgSentenceLength > 25
  ? `Readability: Long sentences (avg ${avgSentenceLength} words) — consider breaking up for easier reading.`
  : avgSentenceLength > 18
    ? `Readability: Good (avg ${avgSentenceLength} words per sentence).`
    : `Readability: Excellent (avg ${avgSentenceLength} words per sentence).`;

// Append to response message
```

**Frontend:** No changes to any of these. All improvements are in the generation pipeline.

---

## SECTION 3: Data Architecture (Indexes + Retention)

All database changes. No frontend disruption.

### 3A — Add Performance Indexes

**Migration:**

```sql
-- High-traffic queries that need indexes
CREATE INDEX IF NOT EXISTS idx_content_items_user_status ON content_items(user_id, status);
CREATE INDEX IF NOT EXISTS idx_content_items_user_keyword ON content_items(user_id, main_keyword);
CREATE INDEX IF NOT EXISTS idx_content_items_user_seo ON content_items(user_id, seo_score DESC);
CREATE INDEX IF NOT EXISTS idx_content_items_user_created ON content_items(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ai_messages_conversation ON ai_messages(conversation_id, created_at);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user ON ai_conversations(user_id, updated_at DESC);

CREATE INDEX IF NOT EXISTS idx_keywords_user ON keywords(user_id);
CREATE INDEX IF NOT EXISTS idx_proposals_user_status ON ai_strategy_proposals(user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_calendar_user_date ON content_calendar(user_id, scheduled_date);
CREATE INDEX IF NOT EXISTS idx_campaigns_user ON campaigns(user_id, status);

CREATE INDEX IF NOT EXISTS idx_content_analytics_content ON content_analytics(content_id);
CREATE INDEX IF NOT EXISTS idx_content_performance_signals_content ON content_performance_signals(content_id, signal_type);
```

### 3B — Data Retention Policy (cleanup old data)

**Migration — add a cleanup function:**

```sql
-- Cleanup function for old data (run via cron)
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS void AS $$
BEGIN
  -- Delete conversation messages older than 1 year for archived conversations
  DELETE FROM ai_messages WHERE conversation_id IN (
    SELECT id FROM ai_conversations WHERE is_archived = true AND updated_at < NOW() - INTERVAL '365 days'
  );

  -- Delete old proactive recommendations (acted on + 90 days old)
  DELETE FROM proactive_recommendations WHERE acted_on = true AND created_at < NOW() - INTERVAL '90 days';

  -- Delete old content performance signals (older than 1 year)
  DELETE FROM content_performance_signals WHERE created_at < NOW() - INTERVAL '365 days';

  -- Vacuum analyze affected tables
  -- (Supabase handles this automatically, but log for tracking)
  RAISE NOTICE 'Data cleanup completed at %', NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

**Backend:** Add to a weekly cron (or add to `engage-job-runner`):

```ts
// Run cleanup weekly
const dayOfWeek = new Date().getDay();
if (dayOfWeek === 0) { // Sunday
  await supabase.rpc('cleanup_old_data');
}
```

**Frontend:** No changes.

---

## SECTION 4: User Experience Fixes

### 4A — Show Conversation Goal in Header

**Frontend:** `src/components/ai-chat/EnhancedChatInterface.tsx`

Find the conversation header area (where the conversation title is shown). Add the detected goal:

```tsx
{activeConvObj?.goal && (
  <span className="text-xs text-muted-foreground/60 ml-2 px-2 py-0.5 rounded-full border border-border/30">
    {activeConvObj.goal}
  </span>
)}
```

**Backend:** No changes.

### 4B — Empty State Guidance for New Users

**Frontend:** For pages that show nothing when user has no data, add helpful empty states:

**Analytics page** — when no data:
```tsx
<div className="text-center py-12">
  <BarChart3 className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
  <p className="text-sm text-muted-foreground">No analytics data yet</p>
  <p className="text-xs text-muted-foreground/60 mt-1">
    Publish content and connect Google Analytics in Settings to see performance data
  </p>
</div>
```

Apply similar pattern to: Keywords page, Calendar (when empty), Competitors section.

**Backend:** No changes.

### 4C — Notification Auto-Triggers

**Backend:** `supabase/functions/generate-proactive-insights/index.ts`

This function already creates proactive recommendations. Add notification creation alongside:

```ts
// After inserting a proactive recommendation, also create a dashboard alert
if (recommendation.priority === 'high') {
  await supabase.from('dashboard_alerts').insert({
    user_id: userId,
    type: recommendation.type,
    title: recommendation.title,
    message: recommendation.description,
    severity: 'info',
    read: false
  });
}
```

This makes the notification bell actually show things.

**Frontend:** No changes (bell already reads from `dashboard_alerts`).

### 4D — Repository Bulk Archive

**Frontend:** `src/components/content/repository/RepositoryBulkBar.tsx`

Add an "Archive" button alongside the existing "Delete" button:

```tsx
<Button
  variant="outline"
  size="sm"
  onClick={() => handleBulkArchive(selectedIds)}
>
  <Archive className="h-3.5 w-3.5 mr-1" />
  Archive ({selectedIds.length})
</Button>
```

Handler:
```ts
const handleBulkArchive = async (ids: string[]) => {
  await supabase.from('content_items')
    .update({ status: 'archived' })
    .in('id', ids);
  refreshContent();
  clearSelection();
  toast({ title: `${ids.length} items archived` });
};
```

**Backend:** No changes.

---

## SECTION 5: Analyst Sidebar Improvements

### 5A — Competitive Position: Show Full Data

**Frontend:** `src/components/ai-chat/analyst-sections/CompetitivePositionSection.tsx`

The section already queries `company_competitors`. Enhance it to show more fields:

```tsx
// For each competitor, show:
<div>
  <p className="font-medium text-sm">{comp.name}</p>
  {comp.strengths && (
    <p className="text-xs text-green-400/70">Strengths: {comp.strengths.slice(0, 2).join(', ')}</p>
  )}
  {comp.weaknesses && (
    <p className="text-xs text-red-400/70">Gaps: {comp.weaknesses.slice(0, 2).join(', ')}</p>
  )}
  <p className="text-[10px] text-muted-foreground/40">
    Analyzed {daysSince(comp.last_analyzed_at)}d ago
  </p>
</div>
```

**Backend:** No changes.

### 5B — Campaign Pulse: Show Performance Not Just Counts

**Frontend:** `src/components/ai-chat/analyst-sections/CampaignPulseSection.tsx`

Add a query for campaign content performance:

```ts
// Query campaign content items for SEO average
const campaignContentAvgSeo = platformData
  .filter(d => d.category === 'campaigns' && d.label.includes('Avg SEO'))
  .map(d => d.value)[0] || null;
```

Show: "3 campaigns — avg content SEO: 62/100" instead of just "3 campaigns".

### 5C — Health Score: Fix Hardcoded SEO Factor

**Frontend:** `src/hooks/useAnalystEngine.ts`

Find the health score SEO factor (~line 673). Replace the hardcoded fallback:

```ts
// Instead of counting anomaly warnings:
// Actually compute from real content SEO scores
const avgSeo = platformData.find(d => d.label === 'Avg SEO Score')?.value || 0;
const seoFactor = Math.min(20, Math.round(avgSeo / 5)); // 0-20 points based on avg SEO
```

**Backend:** No changes.

---

## SECTION 6: Scalability Fixes (No Cost Impact)

### 6A — Add Pagination to List Views

**Frontend:** For pages that load all items at once, add cursor-based pagination.

Key files: Repository content list, Keywords list, Proposals list.

Pattern:
```ts
const PAGE_SIZE = 20;
const [page, setPage] = useState(0);

const { data } = useQuery({
  queryKey: ['content', page],
  queryFn: () => supabase
    .from('content_items')
    .select('*')
    .eq('user_id', userId)
    .range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1)
    .order('created_at', { ascending: false })
});
```

Add "Load more" button or infinite scroll at the bottom of lists.

### 6B — Reduce Analyst Query Frequency

**Frontend:** `src/hooks/useAnalystEngine.ts`

Change the auto-refresh interval from 60 seconds to 120 seconds:

```ts
// Change from:
const REFRESH_INTERVAL = 60 * 1000;
// Change to:
const REFRESH_INTERVAL = 120 * 1000;
```

Also: skip refresh if the tab is not visible:

```ts
if (document.hidden) return; // Don't fetch when tab is in background
```

This halves the query load with zero UX impact.

### 6C — Cache Supabase Queries in React Query

**Frontend:** Ensure all Supabase queries use React Query with `staleTime`:

```ts
const { data } = useQuery({
  queryKey: ['content-items', userId],
  queryFn: () => fetchContentItems(userId),
  staleTime: 30 * 1000, // Don't refetch within 30 seconds
  cacheTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
});
```

Apply to: content items, keywords, proposals, campaigns, competitors. This prevents duplicate fetches on component re-renders.

**Backend:** No changes for any of 6A-6C.

---

## SECTION 7: Code Quality (No Disruption, No Cost)

### 7A — Remove Hardcoded Supabase Fallbacks

**Frontend:** Search for hardcoded Supabase URLs and keys used as fallbacks. Replace with environment variable reads only:

```ts
// Instead of:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://iqiundzzcepmuykcnfbc.supabase.co';

// Use:
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
if (!SUPABASE_URL) throw new Error('VITE_SUPABASE_URL not configured');
```

Files to check: `useEnhancedAIChatDB.ts`, `TestOpenRouterButton.tsx`, any file with a hardcoded `.supabase.co` URL.

**Why:** Hardcoded URLs/keys are a security risk and make environment switching impossible.

### 7B — Add ESLint + Prettier Config

**Frontend:** Create two files at project root:

`.eslintrc.json`:
```json
{
  "extends": ["react-app", "react-app/jest"],
  "rules": {
    "no-console": "warn",
    "no-unused-vars": "warn"
  }
}
```

`.prettierrc`:
```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "es5",
  "printWidth": 100,
  "tabWidth": 2
}
```

Don't run the formatter on everything now — just set the config so new code follows consistent style.

### 7C — Add Error Boundary to App Root

**Frontend:** `src/App.tsx`

Wrap the router with an error boundary so the app doesn't white-screen on crashes:

```tsx
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h2 className="text-lg font-bold mb-2">Something went wrong</h2>
        <p className="text-sm text-muted-foreground mb-4">{error.message}</p>
        <Button onClick={resetErrorBoundary}>Try again</Button>
      </div>
    </div>
  );
}

// Wrap router:
<ErrorBoundary FallbackComponent={ErrorFallback}>
  <RouterProvider router={router} />
</ErrorBoundary>
```

**Backend:** No changes.

---

## SECTION 8: Business Viability

### 8A — Token Usage Tracking (show users what they're spending)

**Backend:** `supabase/functions/enhanced-ai-chat/index.ts`

After every AI call, log token usage:

```ts
// After AI response is received:
const usage = aiResponse.usage || {};
try {
  await supabase.from('ai_usage_log').insert({
    user_id: userId,
    conversation_id: conversationId,
    model: selectedModel,
    prompt_tokens: usage.prompt_tokens || 0,
    completion_tokens: usage.completion_tokens || 0,
    total_tokens: (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
    tool_name: currentToolName || null,
    created_at: new Date().toISOString()
  });
} catch { /* non-blocking */ }
```

**Migration:**

```sql
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id uuid,
  model text,
  prompt_tokens integer DEFAULT 0,
  completion_tokens integer DEFAULT 0,
  total_tokens integer DEFAULT 0,
  tool_name text,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users see own usage" ON ai_usage_log FOR SELECT USING (auth.uid() = user_id);
CREATE INDEX idx_ai_usage_user_date ON ai_usage_log(user_id, created_at DESC);
```

**Frontend:** Add a "Usage" tab in Settings:

```tsx
// Query daily usage
const { data: usage } = useQuery({
  queryKey: ['ai-usage', userId],
  queryFn: async () => {
    const { data } = await supabase
      .from('ai_usage_log')
      .select('model, total_tokens, created_at')
      .eq('user_id', userId)
      .gte('created_at', thirtyDaysAgo)
      .order('created_at', { ascending: false });
    return data;
  }
});

// Show: "This month: 450K tokens (~$0.67 with GPT-4o-mini)"
```

### 8B — Soft Delete Pattern

**Migration:**

```sql
-- Add deleted_at to key tables for soft delete
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE ai_conversations ADD COLUMN IF NOT EXISTS deleted_at timestamptz;
ALTER TABLE campaigns ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

-- Update RLS policies to exclude soft-deleted rows
-- For content_items:
DROP POLICY IF EXISTS "Users view own content" ON content_items;
CREATE POLICY "Users view own content" ON content_items
  FOR SELECT USING (auth.uid() = user_id AND deleted_at IS NULL);
```

**Backend:** Change delete handlers to soft-delete:

```ts
// Instead of:
await supabase.from('content_items').delete().eq('id', id);

// Use:
await supabase.from('content_items')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', id);
```

**Frontend:** No changes needed — RLS hides soft-deleted rows automatically.

---

## WHAT I'M NOT TOUCHING (per your instructions)

- Rate limiting — not in production
- Social platform API integration — separate project
- Team/collaboration features — separate project
- Billing/Stripe — separate project
- CI/CD pipeline — separate project
- Mobile responsiveness — needs separate audit
- Tests — needs separate dedicated effort

---

## IMPLEMENTATION ORDER

| Phase | Section | Items | Time | Frontend | Backend |
|-------|---------|-------|------|----------|---------|
| ~~1~~ | ~~AI Model~~ | ~~DEFERRED~~ | — | — | — |
| 1 | Content Quality | 2A-2E word count, SERP, outline, SEO scoring, readability | 1.5 hrs | 0 | 5 changes |
| 2 | Data Architecture | 3A indexes, 3B retention | 30 min | 0 | 2 migrations |
| 3 | UX Flow | 4A goals, 4B empty states, 4C notifications, 4D bulk archive | 1 hr | 4 changes | 1 change |
| 4 | Analyst | 5A competitors, 5B campaigns, 5C health score | 45 min | 3 changes | 0 |
| 5 | Scalability | 6A pagination, 6B analyst frequency, 6C query caching | 1 hr | 3 changes | 0 |
| 6 | Code Quality | 7A remove hardcoded, 7B lint config, 7C error boundary | 30 min | 3 changes | 0 |
| 7 | Business | 8A usage tracking, 8B soft delete | 1 hr | 1 change | 2 changes + 2 migrations |
| **Total** | | **24 items** | **~6.5 hrs** | **14** | **10 + 4 migrations** |

> **After all 7 phases are done:** We'll come back and address AI model selection, smart routing, context window, and prompt token optimization as a dedicated effort.
