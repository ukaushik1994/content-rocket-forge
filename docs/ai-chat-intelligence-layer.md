# AI Chat Intelligence Layer — From Order-Taker to Strategist

> 8 enhancements that give the AI initiative, memory, and strategic reasoning.
> Each has full backend + frontend implementation.

---

## 1. Cross-Conversation User Intelligence Profile

**What:** A persistent profile that accumulates across ALL conversations — topics explored, formats preferred, edits made, proposals accepted, responses rated. Injected as context into every new conversation so the AI knows you from message one.

### DB Migration

```sql
CREATE TABLE public.user_intelligence_profile (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Content preferences (learned from generation + edits)
  preferred_format TEXT,              -- 'blog', 'how-to', 'listicle' (most generated)
  preferred_length TEXT,              -- 'short', 'medium', 'long' (most generated)
  avg_edit_ratio NUMERIC(4,2),        -- <1 = shortens, >1 = expands
  edit_patterns JSONB DEFAULT '[]',   -- ["adds examples", "removes conclusions", "shortens paragraphs"]

  -- Topic preferences (learned from conversations + content)
  top_topics JSONB DEFAULT '[]',      -- [{"topic": "AI", "count": 15}, {"topic": "marketing", "count": 8}]
  avoided_topics JSONB DEFAULT '[]',  -- topics user never engages with

  -- Quality signals (learned from feedback)
  thumbs_up_patterns JSONB DEFAULT '[]',   -- what kinds of responses get thumbs up
  thumbs_down_patterns JSONB DEFAULT '[]', -- what kinds get thumbs down

  -- Strategic preferences
  accepted_proposal_types JSONB DEFAULT '[]', -- content types from accepted proposals
  rejected_proposal_types JSONB DEFAULT '[]',

  -- Behavioral signals
  avg_messages_per_conversation NUMERIC(5,1),
  most_used_tools JSONB DEFAULT '[]',    -- [{"tool": "generate_full_content", "count": 12}]
  last_active_modules JSONB DEFAULT '[]', -- ["content", "keywords", "campaigns"]

  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  last_computed_at TIMESTAMPTZ
);

ALTER TABLE public.user_intelligence_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own profile" ON public.user_intelligence_profile FOR ALL USING (user_id = auth.uid());
```

### Backend — Profile Builder

**New file:** `supabase/functions/shared/userIntelligence.ts`

```ts
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.6';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

export async function getUserIntelligenceContext(userId: string): Promise<string> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: profile } = await supabase
    .from('user_intelligence_profile')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (!profile) return '';

  const parts: string[] = [];

  if (profile.preferred_format) {
    parts.push(`Preferred content format: ${profile.preferred_format}`);
  }
  if (profile.avg_edit_ratio) {
    if (profile.avg_edit_ratio < 0.85) parts.push('User consistently shortens AI output — write 15-20% more concisely');
    else if (profile.avg_edit_ratio > 1.15) parts.push('User consistently expands AI output — write with more depth and examples');
  }
  if (profile.edit_patterns && Array.isArray(profile.edit_patterns) && profile.edit_patterns.length > 0) {
    parts.push(`Editing patterns: ${profile.edit_patterns.slice(0, 5).join(', ')}`);
  }
  if (profile.top_topics && Array.isArray(profile.top_topics) && profile.top_topics.length > 0) {
    const topThree = profile.top_topics.slice(0, 3).map((t: any) => t.topic);
    parts.push(`Most engaged topics: ${topThree.join(', ')}`);
  }
  if (profile.thumbs_down_patterns && Array.isArray(profile.thumbs_down_patterns) && profile.thumbs_down_patterns.length > 0) {
    parts.push(`Avoid response patterns: ${profile.thumbs_down_patterns.slice(0, 3).join(', ')}`);
  }
  if (profile.most_used_tools && Array.isArray(profile.most_used_tools) && profile.most_used_tools.length > 0) {
    const topTools = profile.most_used_tools.slice(0, 3).map((t: any) => t.tool.replace(/_/g, ' '));
    parts.push(`Most-used features: ${topTools.join(', ')}`);
  }

  if (parts.length === 0) return '';

  return `\n\n## USER INTELLIGENCE PROFILE (learned from past behavior)\n${parts.join('\n')}`;
}

export async function rebuildUserProfile(userId: string): Promise<void> {
  const supabase = createClient(supabaseUrl, supabaseKey);

  // 1. Content format preferences
  const { data: content } = await supabase
    .from('content_items')
    .select('content_type, metadata')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(30);

  const formatCounts: Record<string, number> = {};
  for (const c of (content || [])) {
    const fmt = c.content_type || 'blog';
    formatCounts[fmt] = (formatCounts[fmt] || 0) + 1;
  }
  const preferredFormat = Object.entries(formatCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null;

  // 2. Edit patterns from feedback
  const { data: feedback } = await supabase
    .from('content_generation_feedback')
    .select('feedback_data')
    .eq('user_id', userId)
    .eq('feedback_type', 'edit_pattern')
    .order('created_at', { ascending: false })
    .limit(20);

  let avgEditRatio = 1.0;
  const editPatterns: string[] = [];
  if (feedback && feedback.length >= 3) {
    const ratios = feedback.map((f: any) => f.feedback_data?.lengthRatio || 1);
    avgEditRatio = ratios.reduce((a: number, b: number) => a + b, 0) / ratios.length;

    const shortened = feedback.filter((f: any) => f.feedback_data?.shortened).length;
    const expanded = feedback.filter((f: any) => f.feedback_data?.expanded).length;
    const headingsAdded = feedback.filter((f: any) => (f.feedback_data?.headingsAdded || 0) > 0).length;

    if (shortened > expanded) editPatterns.push('tends to shorten content');
    if (expanded > shortened) editPatterns.push('tends to add more detail');
    if (headingsAdded > feedback.length * 0.3) editPatterns.push('adds more section headings');
  }

  // 3. Topic preferences from conversations
  const { data: convos } = await supabase
    .from('ai_conversations')
    .select('title, goal')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(50);

  const topicCounts: Record<string, number> = {};
  for (const c of (convos || [])) {
    const words = ((c.title || '') + ' ' + (c.goal || '')).toLowerCase().split(/\s+/);
    for (const word of words) {
      if (word.length >= 4 && !['what', 'that', 'this', 'with', 'from', 'your', 'about', 'have', 'been'].includes(word)) {
        topicCounts[word] = (topicCounts[word] || 0) + 1;
      }
    }
  }
  const topTopics = Object.entries(topicCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([topic, count]) => ({ topic, count }));

  // 4. Feedback patterns
  const { data: messages } = await supabase
    .from('ai_messages')
    .select('content, feedback_helpful')
    .not('feedback_helpful', 'is', null)
    .limit(50);

  const thumbsUpPatterns: string[] = [];
  const thumbsDownPatterns: string[] = [];
  if (messages) {
    const positiveMessages = messages.filter(m => m.feedback_helpful === true).map(m => m.content);
    const negativeMessages = messages.filter(m => m.feedback_helpful === false).map(m => m.content);

    // Simple pattern detection
    if (positiveMessages.length >= 3) {
      const avgPosLength = positiveMessages.reduce((s, m) => s + m.length, 0) / positiveMessages.length;
      if (avgPosLength < 500) thumbsUpPatterns.push('prefers concise responses');
      if (avgPosLength > 1500) thumbsUpPatterns.push('prefers detailed responses');
      if (positiveMessages.some(m => m.includes('```') || m.includes('|'))) thumbsUpPatterns.push('likes structured data (tables, code)');
    }
    if (negativeMessages.length >= 2) {
      const avgNegLength = negativeMessages.reduce((s, m) => s + m.length, 0) / negativeMessages.length;
      if (avgNegLength > 2000) thumbsDownPatterns.push('dislikes overly long responses');
      if (avgNegLength < 200) thumbsDownPatterns.push('dislikes too-brief responses');
    }
  }

  // 5. Tool usage from conversations
  const { data: toolMessages } = await supabase
    .from('ai_messages')
    .select('function_calls')
    .not('function_calls', 'is', null)
    .limit(100);

  const toolCounts: Record<string, number> = {};
  for (const msg of (toolMessages || [])) {
    try {
      const calls = typeof msg.function_calls === 'string' ? JSON.parse(msg.function_calls) : msg.function_calls;
      if (Array.isArray(calls)) {
        for (const call of calls) {
          const name = call.name || call.action || '';
          if (name) toolCounts[name] = (toolCounts[name] || 0) + 1;
        }
      }
    } catch (_) {}
  }
  const mostUsedTools = Object.entries(toolCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([tool, count]) => ({ tool, count }));

  // 6. Avg messages per conversation
  const { data: msgCounts } = await supabase.rpc('avg_messages_per_conversation', { p_user_id: userId });
  const avgMessages = msgCounts || 0;

  // Upsert profile
  await supabase.from('user_intelligence_profile').upsert({
    user_id: userId,
    preferred_format: preferredFormat,
    avg_edit_ratio: Math.round(avgEditRatio * 100) / 100,
    edit_patterns: editPatterns,
    top_topics: topTopics,
    thumbs_up_patterns: thumbsUpPatterns,
    thumbs_down_patterns: thumbsDownPatterns,
    most_used_tools: mostUsedTools,
    avg_messages_per_conversation: avgMessages,
    updated_at: new Date().toISOString(),
    last_computed_at: new Date().toISOString()
  }, { onConflict: 'user_id' });
}
```

### Backend — Injection into AI Chat

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — after brand voice injection

```ts
// Inject user intelligence profile
try {
  const { getUserIntelligenceContext } = await import('../shared/userIntelligence.ts');
  const intelligenceContext = await getUserIntelligenceContext(user.id);
  if (intelligenceContext) {
    systemPrompt += intelligenceContext;
  }
} catch (e) {
  console.warn('User intelligence profile injection failed (non-blocking):', e);
}
```

### Backend — Profile Rebuild Trigger

Rebuild the profile periodically. Add to the `enhanced-ai-chat` edge function, after a successful response (non-blocking):

```ts
// Rebuild intelligence profile every 20 conversations (non-blocking)
if (Math.random() < 0.05) { // ~5% of requests trigger rebuild
  import('../shared/userIntelligence.ts').then(({ rebuildUserProfile }) => {
    rebuildUserProfile(user.id).catch(e => console.warn('Profile rebuild failed:', e));
  });
}
```

### Frontend

No frontend changes needed — the profile is invisible infrastructure. The user just notices the AI getting smarter over time.

---

## 2. Proactive Strategic Recommendations

**What:** The AI proactively surfaces strategic recommendations based on data patterns, without being asked. Appears in the welcome screen and optionally as a periodic digest.

### Backend — New Edge Function

**New file:** `supabase/functions/generate-proactive-insights/index.ts`

This function runs on a schedule (daily) or on-demand, analyzes the user's data, and stores recommendations:

```ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.6";

serve(async (req) => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  // Get all active users (had a conversation in last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { data: activeUsers } = await supabase
    .from('ai_conversations')
    .select('user_id')
    .gte('updated_at', sevenDaysAgo)
    .limit(100);

  const uniqueUsers = [...new Set((activeUsers || []).map(u => u.user_id))];

  for (const userId of uniqueUsers) {
    try {
      const recommendations: Array<{ type: string; title: string; description: string; action: string; priority: number }> = [];

      // 1. Stale high-potential content
      const { data: staleDrafts } = await supabase
        .from('content_items')
        .select('id, title, seo_score, updated_at')
        .eq('user_id', userId)
        .eq('status', 'draft')
        .gte('seo_score', 50)
        .lt('updated_at', new Date(Date.now() - 7 * 86400000).toISOString())
        .order('seo_score', { ascending: false })
        .limit(3);

      if (staleDrafts?.length) {
        recommendations.push({
          type: 'publish',
          title: `Publish "${staleDrafts[0].title}"`,
          description: `This draft has an SEO score of ${staleDrafts[0].seo_score}/100 and hasn't been touched in a week. It's ready.`,
          action: `Publish content "${staleDrafts[0].title}" (ID: ${staleDrafts[0].id}) to my website`,
          priority: 90
        });
      }

      // 2. Content refresh opportunity
      const sixMonthsAgo = new Date(Date.now() - 180 * 86400000).toISOString();
      const { data: oldContent } = await supabase
        .from('content_items')
        .select('id, title, main_keyword, seo_score, created_at')
        .eq('user_id', userId)
        .eq('status', 'published')
        .lt('created_at', sixMonthsAgo)
        .order('seo_score', { ascending: false })
        .limit(3);

      if (oldContent?.length) {
        recommendations.push({
          type: 'refresh',
          title: `Refresh "${oldContent[0].title}"`,
          description: `Published ${Math.round((Date.now() - new Date(oldContent[0].created_at).getTime()) / 86400000 / 30)} months ago. Updating with fresh data could boost rankings.`,
          action: `Analyze and suggest updates for my article "${oldContent[0].title}" about "${oldContent[0].main_keyword}"`,
          priority: 75
        });
      }

      // 3. Unused proposals
      const { data: availableProposals } = await supabase
        .from('ai_strategy_proposals')
        .select('id, title, primary_keyword, estimated_impressions')
        .eq('user_id', userId)
        .eq('status', 'available')
        .order('estimated_impressions', { ascending: false })
        .limit(3);

      if (availableProposals && availableProposals.length >= 5) {
        recommendations.push({
          type: 'proposal',
          title: `Act on top proposal: "${availableProposals[0].title}"`,
          description: `${availableProposals.length} unused proposals. Top one targets "${availableProposals[0].primary_keyword}" with ~${availableProposals[0].estimated_impressions} estimated impressions.`,
          action: `Accept proposal "${availableProposals[0].title}" and start content creation`,
          priority: 70
        });
      }

      // 4. Competitor activity gap
      const { data: competitors } = await supabase
        .from('company_competitors')
        .select('name, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: true })
        .limit(1);

      if (competitors?.length) {
        const daysSinceAnalysis = Math.round((Date.now() - new Date(competitors[0].updated_at).getTime()) / 86400000);
        if (daysSinceAnalysis > 30) {
          recommendations.push({
            type: 'competitor',
            title: `Refresh competitor analysis: ${competitors[0].name}`,
            description: `Last analyzed ${daysSinceAnalysis} days ago. Competitors change — re-run analysis to catch new threats and opportunities.`,
            action: `Run competitor analysis for "${competitors[0].name}"`,
            priority: 60
          });
        }
      }

      // 5. Calendar gap
      const nextTwoWeeks = new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      const { count: scheduledCount } = await supabase
        .from('content_calendar')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('scheduled_date', today)
        .lte('scheduled_date', nextTwoWeeks);

      if ((scheduledCount || 0) < 2) {
        recommendations.push({
          type: 'calendar',
          title: 'Your calendar is light for the next 2 weeks',
          description: `Only ${scheduledCount || 0} items scheduled. Consistent publishing improves SEO authority.`,
          action: 'Help me plan content for the next 2 weeks based on my top proposals and keyword gaps',
          priority: 65
        });
      }

      // Store recommendations (overwrite previous)
      if (recommendations.length > 0) {
        // Delete old recommendations
        await supabase.from('proactive_recommendations')
          .delete()
          .eq('user_id', userId);

        // Insert new ones
        await supabase.from('proactive_recommendations').insert(
          recommendations.map(r => ({
            user_id: userId,
            ...r,
            created_at: new Date().toISOString()
          }))
        );
      }
    } catch (e) {
      console.error(`Failed to generate insights for ${userId}:`, e);
    }
  }

  return new Response(JSON.stringify({ processed: uniqueUsers.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

### DB Migration for recommendations

```sql
CREATE TABLE public.proactive_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  action TEXT, -- AI chat prompt to execute this recommendation
  priority INTEGER DEFAULT 50,
  dismissed BOOLEAN DEFAULT false,
  acted_on BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.proactive_recommendations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own recommendations" ON public.proactive_recommendations FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_proactive_recs_user ON public.proactive_recommendations(user_id, dismissed, priority DESC);
```

### Cron job

```sql
SELECT cron.schedule('generate-proactive-insights', '0 6 * * *', -- daily at 6am
  $$SELECT net.http_post(
    url:='https://iqiundzzcepmuykcnfbc.supabase.co/functions/v1/generate-proactive-insights',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer <service-key>"}'::jsonb
  )$$
);
```

### Frontend — Welcome Screen

**File:** `src/components/ai-chat/EnhancedChatInterface.tsx` — in the welcome screen section

```tsx
// Query recommendations on mount
const [recommendations, setRecommendations] = useState<any[]>([]);
useEffect(() => {
  if (!user || messages.length > 0) return;
  supabase
    .from('proactive_recommendations')
    .select('*')
    .eq('user_id', user.id)
    .eq('dismissed', false)
    .eq('acted_on', false)
    .order('priority', { ascending: false })
    .limit(3)
    .then(({ data }) => { if (data) setRecommendations(data); });
}, [user, messages.length]);

// Render above quick actions:
{recommendations.length > 0 && (
  <div className="space-y-2 mb-4 w-full max-w-[720px]">
    <p className="text-xs font-medium text-muted-foreground/60 uppercase tracking-wider">Recommended for you</p>
    {recommendations.map(rec => (
      <button
        key={rec.id}
        onClick={() => {
          sendMessage(rec.action);
          // Mark as acted on
          supabase.from('proactive_recommendations').update({ acted_on: true }).eq('id', rec.id);
        }}
        className="w-full text-left p-3 rounded-xl border border-primary/10 bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        <p className="text-sm font-medium text-foreground">{rec.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{rec.description}</p>
      </button>
    ))}
  </div>
)}
```

---

## 3. Content Performance Feedback Loop

**What:** Track internal performance signals (views, shares, repurposes) even without Google Analytics. Feed results back into future generation prompts.

### DB Migration

```sql
CREATE TABLE public.content_performance_signals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content_id UUID NOT NULL REFERENCES public.content_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  signal_type TEXT NOT NULL, -- 'view', 'export', 'repurpose', 'email_convert', 'social_repurpose', 'publish'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.content_performance_signals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signals" ON public.content_performance_signals FOR ALL USING (user_id = auth.uid());
CREATE INDEX idx_content_signals ON public.content_performance_signals(content_id, signal_type);
```

### Backend — Signal Tracking

**File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts` — after each cross-module action, log a signal:

```ts
// After content_to_email succeeds:
await supabase.from('content_performance_signals').insert({
  content_id: content.id,
  user_id: userId,
  signal_type: 'email_convert'
}).catch(() => {});

// After repurpose_for_social succeeds:
await supabase.from('content_performance_signals').insert({
  content_id: toolArgs.content_id,
  user_id: userId,
  signal_type: 'social_repurpose'
}).catch(() => {});

// After publish_to_website succeeds:
await supabase.from('content_performance_signals').insert({
  content_id: toolArgs.content_id,
  user_id: userId,
  signal_type: 'publish'
}).catch(() => {});
```

### Backend — Performance Context in Generation

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — in `generate_full_content` enrichment section:

```ts
// Fetch performance signals for learning
let performanceContext = '';
try {
  const { data: signals } = await supabase
    .from('content_performance_signals')
    .select('content_id, signal_type')
    .eq('user_id', userId);

  if (signals && signals.length >= 5) {
    // Find most-actioned content
    const contentSignals: Record<string, number> = {};
    for (const s of signals) {
      contentSignals[s.content_id] = (contentSignals[s.content_id] || 0) + 1;
    }
    const topContentIds = Object.entries(contentSignals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([id]) => id);

    if (topContentIds.length > 0) {
      const { data: topContent } = await supabase
        .from('content_items')
        .select('title, main_keyword, content_type')
        .in('id', topContentIds);

      if (topContent?.length) {
        performanceContext = `\n\n## CONTENT THAT GETS REUSED MOST\nThese articles are your most-actioned (repurposed, emailed, published):\n${topContent.map(c => `- "${c.title}" (${c.content_type}, keyword: ${c.main_keyword || 'N/A'})`).join('\n')}\nCreate similar content for maximum downstream value.`;
      }
    }
  }
} catch (_) {}
```

### Frontend — Signal Tracking on Repository View

**File:** `src/components/ai-chat/panels/RepositoryPanel.tsx` — when user clicks to view content:

```ts
// When content is selected for reading:
if (selectedItem) {
  supabase.from('content_performance_signals').insert({
    content_id: selectedItem.id,
    user_id: user.id,
    signal_type: 'view'
  }).catch(() => {});
}
```

---

## 4. AI Negotiation Before Generation

**What:** When the user asks to create content, the AI checks existing data FIRST and asks clarifying questions before generating. Turns the AI from an order-taker to a strategist.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — add a pre-generation negotiation instruction to the system prompt, specifically for content creation intents:

```ts
// After queryIntent detection, if the intent involves content creation:
const isContentCreation = /write|create|generate|draft|blog|article|post/i.test(userQuery) &&
  queryIntent.categories.includes('content');

if (isContentCreation) {
  systemPrompt += `\n\n## CONTENT CREATION PROTOCOL (MANDATORY)
When the user asks to create content, you MUST check these data points BEFORE generating:

1. **Existing coverage**: Use get_content_items to check if the user already has content on this topic. If they do, ask: "You already have [title] on a similar topic. Should I take a different angle, update the existing piece, or proceed with a new article?"

2. **Top-performing format**: Check their content history — if their how-to articles consistently score higher than listicles, suggest the better format: "Your how-to articles typically score better. Want me to use that format?"

3. **Competitor angle**: If competitors are tracked, check if any competitor covers this topic and suggest differentiation: "Your competitor [name] covers this. I'll differentiate by focusing on [angle]."

4. **Solution integration**: If the topic relates to one of their offerings, ask: "This relates to your [solution name]. Should I weave in product references naturally?"

Only proceed to generate AFTER asking at least one strategic question. Do NOT silently generate — negotiate first.

Exception: If the user explicitly says "just write it" or "quick generate" or "skip questions", proceed immediately.`;
}
```

### Frontend

No changes needed — the AI's negotiation happens in the chat conversation naturally. The user sees questions like "You already have 2 articles about AI marketing — should I take a different angle?" and responds before generation begins.

---

## 5. Weekly Content Strategy Briefing

**What:** A scheduled analysis that generates a personalized weekly content plan based on all the user's data — proposals, competitor activity, calendar gaps, performance trends.

### Backend — New Tool

**File:** `supabase/functions/enhanced-ai-chat/brand-analytics-tools.ts` — add:

```ts
{
  name: "generate_weekly_briefing",
  description: "Generate a personalized weekly content strategy briefing based on current data. Use when user asks 'what should I do this week', 'weekly plan', 'content briefing', or 'what's my strategy'.",
  parameters: { type: "object", properties: {} }
}
```

Handler:
```ts
case 'generate_weekly_briefing': {
  // Gather all relevant data in parallel
  const [contentResult, proposalResult, calendarResult, competitorResult, performanceResult] = await Promise.allSettled([
    supabase.from('content_items').select('title, status, seo_score, main_keyword, created_at')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
    supabase.from('ai_strategy_proposals').select('title, primary_keyword, estimated_impressions, status')
      .eq('user_id', userId).eq('status', 'available')
      .order('estimated_impressions', { ascending: false }).limit(5),
    supabase.from('content_calendar').select('title, scheduled_date, status')
      .eq('user_id', userId)
      .gte('scheduled_date', new Date().toISOString().split('T')[0])
      .lte('scheduled_date', new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0])
      .order('scheduled_date', { ascending: true }),
    supabase.from('company_competitors').select('name, updated_at')
      .eq('user_id', userId).limit(5),
    supabase.from('content_items').select('seo_score, content_type, main_keyword')
      .eq('user_id', userId).eq('status', 'published')
      .order('seo_score', { ascending: false }).limit(10)
  ]);

  const content = contentResult.status === 'fulfilled' ? contentResult.value.data || [] : [];
  const proposals = proposalResult.status === 'fulfilled' ? proposalResult.value.data || [] : [];
  const calendar = calendarResult.status === 'fulfilled' ? calendarResult.value.data || [] : [];
  const competitors = competitorResult.status === 'fulfilled' ? competitorResult.value.data || [] : [];
  const topPerformers = performanceResult.status === 'fulfilled' ? performanceResult.value.data || [] : [];

  const drafts = content.filter((c: any) => c.status === 'draft');
  const recentPublished = content.filter((c: any) => c.status === 'published');
  const calendarGaps = 14 - (calendar?.length || 0); // Days in next 2 weeks without content

  // Build briefing
  const briefingParts: string[] = [];
  briefingParts.push(`## 📋 Your Weekly Content Briefing\n`);

  // Current state
  briefingParts.push(`**This week's snapshot:** ${recentPublished.length} recently published, ${drafts.length} drafts in progress, ${calendar?.length || 0} items on calendar for next 2 weeks.\n`);

  // Recommendations
  briefingParts.push(`### Recommended actions this week:\n`);

  let actionNum = 1;

  // Publish-ready drafts
  const highScoreDrafts = drafts.filter((d: any) => (d.seo_score || 0) >= 50);
  if (highScoreDrafts.length > 0) {
    briefingParts.push(`**${actionNum++}. Publish "${highScoreDrafts[0].title}"** — SEO score ${highScoreDrafts[0].seo_score}/100, ready to go.\n`);
  }

  // Top proposal to act on
  if (proposals.length > 0) {
    briefingParts.push(`**${actionNum++}. Create content for "${proposals[0].title}"** — targets "${proposals[0].primary_keyword}" with ~${proposals[0].estimated_impressions} estimated impressions.\n`);
  }

  // Calendar gap
  if (calendarGaps > 5) {
    briefingParts.push(`**${actionNum++}. Fill calendar gaps** — ${calendarGaps} days in the next 2 weeks have no content scheduled.\n`);
  }

  // Competitor check
  const staleCompetitors = competitors.filter((c: any) => {
    const daysSince = (Date.now() - new Date(c.updated_at).getTime()) / 86400000;
    return daysSince > 30;
  });
  if (staleCompetitors.length > 0) {
    briefingParts.push(`**${actionNum++}. Re-analyze ${staleCompetitors[0].name}** — last checked ${Math.round((Date.now() - new Date(staleCompetitors[0].updated_at).getTime()) / 86400000)} days ago.\n`);
  }

  // Performance insight
  if (topPerformers.length >= 3) {
    const topType = topPerformers.reduce((acc: Record<string, number>, c: any) => {
      acc[c.content_type] = (acc[c.content_type] || 0) + 1; return acc;
    }, {});
    const bestType = Object.entries(topType).sort((a: any, b: any) => b[1] - a[1])[0];
    if (bestType) {
      briefingParts.push(`\n### Performance insight\nYour **${bestType[0]}** content performs best. Focus this week's creation on that format.\n`);
    }
  }

  return {
    success: true,
    message: briefingParts.join('\n'),
    actions: [
      ...(highScoreDrafts.length > 0 ? [{
        id: 'publish-draft', label: `Publish "${highScoreDrafts[0].title}"`, type: 'send_message',
        message: `Publish content "${highScoreDrafts[0].title}" (ID: ${highScoreDrafts[0].id})`
      }] : []),
      ...(proposals.length > 0 ? [{
        id: 'act-proposal', label: `Create: ${proposals[0].title}`, type: 'send_message',
        message: `Write a blog post about "${proposals[0].primary_keyword}" based on proposal "${proposals[0].title}"`
      }] : [])
    ]
  };
}
```

### Frontend

No additional frontend work — the tool returns markdown text + action buttons. The existing `ModernActionButtons` renders the action buttons. User can ask "what should I do this week?" and gets a full briefing.

---

## 6. Automatic Edit Pattern Learning

**What:** When the user edits AI-generated content, automatically detect what changed and extract rules. "Always adds specific examples", "always removes generic conclusions", "always shortens paragraphs over 100 words."

### Backend — Enhanced Edit Tracker

**File:** `src/services/contentFeedbackService.ts` — replace the basic `trackContentEdit` with a deeper analysis:

```ts
export async function trackContentEdit(
  contentId: string,
  originalContent: string,
  editedContent: string
): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const origWords = originalContent.split(/\s+/);
    const editWords = editedContent.split(/\s+/);
    const lengthRatio = editWords.length / Math.max(origWords.length, 1);

    // Paragraph analysis
    const origParas = originalContent.split(/\n\n+/).filter(p => p.trim().length > 0);
    const editParas = editedContent.split(/\n\n+/).filter(p => p.trim().length > 0);

    // Heading analysis
    const origH2 = (originalContent.match(/<h2|^## /gm) || []).length;
    const editH2 = (editedContent.match(/<h2|^## /gm) || []).length;

    // Detect specific patterns
    const patterns: string[] = [];

    // Pattern: shortened long paragraphs
    const origLongParas = origParas.filter(p => p.split(/\s+/).length > 100).length;
    const editLongParas = editParas.filter(p => p.split(/\s+/).length > 100).length;
    if (origLongParas > editLongParas) patterns.push('splits long paragraphs');

    // Pattern: added examples/specifics
    const origExamples = (originalContent.match(/for example|for instance|such as|e\.g\.|specifically|in particular/gi) || []).length;
    const editExamples = (editedContent.match(/for example|for instance|such as|e\.g\.|specifically|in particular/gi) || []).length;
    if (editExamples > origExamples + 1) patterns.push('adds specific examples');

    // Pattern: removed generic phrases
    const genericPhrases = /in today's|it's important to note|in conclusion|without further ado|at the end of the day/gi;
    const origGeneric = (originalContent.match(genericPhrases) || []).length;
    const editGeneric = (editedContent.match(genericPhrases) || []).length;
    if (origGeneric > editGeneric) patterns.push('removes generic filler phrases');

    // Pattern: added data/numbers
    const origNumbers = (originalContent.match(/\d+%|\d+\s*(million|billion|thousand|users|customers|companies)/gi) || []).length;
    const editNumbers = (editedContent.match(/\d+%|\d+\s*(million|billion|thousand|users|customers|companies)/gi) || []).length;
    if (editNumbers > origNumbers + 1) patterns.push('adds data and statistics');

    // Pattern: restructured headings
    if (editH2 > origH2 + 1) patterns.push('adds more section headings');
    if (editH2 < origH2 - 1) patterns.push('consolidates sections');

    // Only track significant edits
    if (Math.abs(lengthRatio - 1) < 0.1 && patterns.length === 0) return;

    await (supabase as any).from('content_generation_feedback').insert({
      user_id: user.id,
      content_id: contentId,
      feedback_type: 'edit_pattern',
      feedback_data: {
        lengthRatio: Math.round(lengthRatio * 100) / 100,
        shortened: lengthRatio < 0.85,
        expanded: lengthRatio > 1.15,
        originalWordCount: origWords.length,
        editedWordCount: editWords.length,
        headingsAdded: Math.max(0, editH2 - origH2),
        headingsRemoved: Math.max(0, origH2 - editH2),
        patterns,
        significantEdit: true
      }
    });
  } catch (err) {
    console.warn('Edit tracking failed:', err);
  }
}
```

### Backend — Pattern Injection

Already exists in `content-action-tools.ts` (lines 548-554). The patterns stored by the enhanced tracker will automatically be read by the existing feedback injection — no additional backend changes needed.

---

## 7. Content-to-Business Outcome Connections

**What:** The AI connects content topics to the user's solutions/offerings and suggests content that directly supports business goals.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — in `generate_full_content`, after the existing solution context enrichment:

```ts
// Connect content to business outcomes
let businessContext = '';
try {
  const { data: solutions } = await supabase
    .from('solutions')
    .select('name, description, pain_points, use_cases, target_audience')
    .eq('user_id', userId);

  if (solutions && solutions.length > 0) {
    // Check if the keyword relates to any solution
    const keyword = toolArgs.keyword.toLowerCase();
    const relatedSolutions = solutions.filter((s: any) => {
      const solText = [
        s.name, s.description,
        ...(s.pain_points || []),
        ...(s.use_cases || []),
        ...(s.target_audience || [])
      ].join(' ').toLowerCase();
      return solText.includes(keyword) || keyword.split(/\s+/).some(w => w.length > 3 && solText.includes(w));
    });

    if (relatedSolutions.length > 0) {
      const sol = relatedSolutions[0];
      businessContext = `\n\n## BUSINESS OUTCOME CONNECTION
This content topic directly relates to your offering "${sol.name}".
Pain points it addresses: ${(sol.pain_points || []).slice(0, 3).join(', ')}.
Target audience: ${(sol.target_audience || []).slice(0, 2).join(', ')}.

Write the content so that readers naturally discover they have the problem your solution solves. Do NOT pitch — educate. By the end, the reader should think "I need a tool for this" before you ever mention ${sol.name}. Include a natural mention of ${sol.name} as ONE of the solutions in a comparative context, not as the only option.`;
    }
  }
} catch (_) {}
```

Append `businessContext` to the system prompt.

### Frontend

No changes needed — the business connection is embedded in the generated content.

---

## 8. Conversational Multi-Step Workflows

**What:** Long workflows (campaign pipeline, content audit, competitor sweep) run conversationally — the AI executes a step, shows results, asks for confirmation, then proceeds.

### Backend

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — add a workflow continuation instruction to the system prompt:

```ts
// Add to system prompt for multi-step queries:
const isMultiStepIntent = /pipeline|full|comprehensive|audit|sweep|review all|analyze everything/i.test(userQuery);

if (isMultiStepIntent) {
  systemPrompt += `\n\n## MULTI-STEP WORKFLOW PROTOCOL
The user wants a comprehensive multi-step operation. Execute it CONVERSATIONALLY:

1. **Execute ONE step** — the most logical first step
2. **Show the result** with data/charts
3. **Ask what to do next** — "Should I proceed to step 2, or adjust anything first?"
4. **Wait for confirmation** before continuing

NEVER execute all steps silently. The user wants to guide the process.

Example flow for "audit my content":
- Step 1: "I've analyzed your 20 articles. Here's the SEO score distribution: [chart]. 5 articles score below 30. Want me to show you which ones need the most work?"
- Step 2 (after user confirms): "Here are the 5 lowest-scoring articles with specific improvement suggestions: [list]. Want me to start optimizing the worst one?"
- Step 3 (after user confirms): "I've rewritten the intro and added an FAQ section to '[title]'. SEO score improved from 22 to 58. Want me to do the same for the next one?"

This approach gives the user control while the AI handles execution.`;
}
```

### Frontend

No changes needed — the conversational protocol works through the existing chat flow. The AI sends a message, the user responds, the AI continues. Action buttons enable one-click continuation.

---

## IMPLEMENTATION ORDER

| Sprint | Enhancement | Backend | Frontend | DB Migration | Effort |
|--------|-----------|:-------:|:--------:|:------------:|--------|
| 1 | **4: AI negotiation before generation** | System prompt addition | None | None | 30 min |
| 1 | **8: Conversational workflows** | System prompt addition | None | None | 20 min |
| 1 | **6: Enhanced edit pattern learning** | `contentFeedbackService.ts` | None | None | 30 min |
| 2 | **3: Performance signal tracking** | Cross-module signal logging | Repository panel tracking | 1 table | 1 hr |
| 2 | **7: Business outcome connections** | Content-action enrichment | None | None | 30 min |
| 3 | **5: Weekly briefing tool** | New tool + handler | None | None | 1 hr |
| 3 | **2: Proactive recommendations** | New edge function + cron | Welcome screen cards | 1 table | 2 hrs |
| 4 | **1: User intelligence profile** | New shared service + injection | None | 1 table + RPC | 3 hrs |

**Total: ~9 hours across 4 sprints. 3 DB migrations.**

**Sprint 1 is the highest-impact, lowest-effort sprint.** Two system prompt additions (negotiation + conversational workflows) and an enhanced edit tracker. ~80 minutes of work. Zero migrations. The AI immediately starts asking strategic questions before generating and running workflows conversationally.
