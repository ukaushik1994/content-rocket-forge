# Value Logic — Fixes for Lovable

> Every content output path audited. Each fix has the exact file, exact code to find, and exact code to replace.

---

## FIX 1: Enrich `generate_full_content` with brand voice + humanization + SEO rules

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

**Find the system message inside the `generate_full_content` case (lines 458-462):**
```ts
              {
                role: 'system',
                content: `You are an expert content writer. Write a ${toolArgs.content_type || 'blog'} article. Tone: ${toolArgs.tone || 'professional'}. Target length: ~${targetWords} words. Output clean HTML content with proper headings (h2, h3), paragraphs, and lists. Do NOT include meta information or JSON - just the article content.`
              },
```

**Replace the entire system message `content` value with:**
```ts
              {
                role: 'system',
                content: `You are an expert content writer creating a ${toolArgs.content_type || 'blog'} article.

HUMANIZATION (MANDATORY — prevents AI detection):
- Write in first person occasionally: "I've found...", "In my experience...", "What most people miss is..."
- Vary sentence length dramatically: mix 5-word punchy sentences with 25-word explanatory ones
- Include at least 1 personal anecdote or opinion per major section
- Use conversational transitions: "Here's the thing:", "You might be wondering..."
- Challenge assumptions at least once: "Most guides say X, but actually..."
- NEVER start with "In today's digital landscape" or any generic opener
- NEVER use: "game-changer", "revolutionize", "leverage", "delve into", "comprehensive guide", "navigate", "landscape", "realm", "tapestry", "robust", "seamless"
- Start with a specific fact, statistic, question, or real scenario

SEO STRUCTURE (MANDATORY):
- Include the keyword "${toolArgs.keyword}" in the first 100 characters
- Add a "Key Takeaways" section after the intro with 3-5 bullet points
- Include a FAQ section at the end with 3-5 questions
- Use numbered lists and bullet points in at least 2 sections
- Use proper H2 and H3 headings throughout

Tone: ${toolArgs.tone || 'professional'}. Target: ~${targetWords} words.
Output clean HTML with headings (h2, h3), paragraphs, and lists. No meta info or JSON.`
              },
```

**Also add brand voice + solution context.** Before the `callAiProxyWithRetry` call (around line 445), add:

```ts
        // Fetch brand voice if configured
        let brandContext = '';
        try {
          const { data: brand } = await supabase
            .from('brand_guidelines')
            .select('tone, brand_personality, do_use, dont_use, target_audience')
            .eq('user_id', userId)
            .maybeSingle();
          if (brand) {
            brandContext = `\n\nBRAND VOICE: Tone: ${brand.tone || ''}. Personality: ${brand.brand_personality || ''}. ${brand.do_use?.length ? `DO use: ${brand.do_use.join(', ')}.` : ''} ${brand.dont_use?.length ? `DON'T use: ${brand.dont_use.join(', ')}.` : ''} ${brand.target_audience?.length ? `Audience: ${brand.target_audience.join(', ')}.` : ''}`;
          }
        } catch (e) { /* non-blocking */ }

        // Fetch solution context if provided
        let solutionContext = '';
        if (toolArgs.solution_id) {
          try {
            const { data: sol } = await supabase.from('solutions')
              .select('name, description, features, pain_points, use_cases, target_audience')
              .eq('id', toolArgs.solution_id).eq('user_id', userId).single();
            if (sol) {
              solutionContext = `\n\nSOLUTION TO REFERENCE NATURALLY: "${sol.name}" — ${sol.description || ''}. Features: ${(sol.features || []).join(', ')}. Pain points it solves: ${(sol.pain_points || []).join(', ')}. Mention as a natural recommendation, NOT sales copy.`;
            }
          } catch (e) { /* non-blocking */ }
        }
```

Then append `brandContext` and `solutionContext` to the system message content string (before the closing backtick).

**Also fix the response parsing (line 478):**

Find:
```ts
        const generatedContent = aiResult.content || aiResult.choices?.[0]?.message?.content || '';
```

Replace with:
```ts
        const generatedContent = aiResult.data?.choices?.[0]?.message?.content || aiResult.choices?.[0]?.message?.content || aiResult.data?.content || aiResult.content || '';
```

---

## FIX 2: Inject brand voice into the main AI chat system prompt

**File:** `supabase/functions/enhanced-ai-chat/index.ts`

**Find the section where `realDataContext` is appended to `systemPrompt` (around line 2500-2510).** There should be a line like:
```ts
systemPrompt += `\n\n## REAL DATA CONTEXT - USE THIS FACTUAL INFORMATION:\n${realDataContext}`;
```

**Add BEFORE that line:**
```ts
    // Inject brand voice into system prompt (if configured)
    try {
      const { data: brandVoice } = await supabase
        .from('brand_guidelines')
        .select('tone, brand_personality, do_use, dont_use, target_audience')
        .eq('user_id', user.id)
        .maybeSingle();
      if (brandVoice && (brandVoice.tone || brandVoice.brand_personality)) {
        systemPrompt += `\n\n## BRAND VOICE (apply to ALL responses — match the user's configured style):\n`;
        if (brandVoice.tone) systemPrompt += `Tone: ${brandVoice.tone}\n`;
        if (brandVoice.brand_personality) systemPrompt += `Personality: ${brandVoice.brand_personality}\n`;
        if (brandVoice.do_use?.length) systemPrompt += `DO use these phrases/patterns: ${brandVoice.do_use.join(', ')}\n`;
        if (brandVoice.dont_use?.length) systemPrompt += `DON'T use these phrases/patterns: ${brandVoice.dont_use.join(', ')}\n`;
        if (brandVoice.target_audience?.length) systemPrompt += `Target audience: ${brandVoice.target_audience.join(', ')}\n`;
      }
    } catch (e) {
      console.warn('⚠️ Brand voice injection failed (non-blocking):', e);
    }
```

---

## FIX 3: Auto-generate meta title and description after `generate_full_content`

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts`

**Find the return statement in `generate_full_content` (around line 510-513):**
```ts
        const wordCount = generatedContent.split(/\s+/).length;
        return {
          success: true,
          message: `Generated and saved "${saved.title}" (~${wordCount} words, SEO: ${seoScore}/100) as draft`,
```

**Add BEFORE the return, after the `saveAutoSeoScore` call (line 506-507):**
```ts
        // Auto-generate meta title and description
        try {
          const plainText = generatedContent.replace(/<[^>]+>/g, '').substring(0, 500);
          const metaTitle = autoTitle.length <= 60 ? autoTitle : autoTitle.substring(0, 57) + '...';
          const metaDesc = plainText.replace(/\s+/g, ' ').trim().substring(0, 155) + '...';
          await supabase.from('content_items')
            .update({ meta_title: metaTitle, meta_description: metaDesc })
            .eq('id', saved.id)
            .eq('user_id', userId);
        } catch (e) {
          console.warn('Meta generation failed (non-blocking):', e);
        }
```

---

## FIX 4: Platform-specific social repurposing

**File:** `supabase/functions/enhanced-ai-chat/cross-module-tools.ts`

**Find the system message in `repurpose_for_social` (around line 334):**
```ts
                  content: `Generate social media posts for the specified platforms. Return valid JSON only: { "posts": [{ "platform": "twitter", "text": "...", "hashtags": ["..."] }] }`
```

**Replace with:**
```ts
                  content: `Generate social media posts optimized for each platform. Return valid JSON: { "posts": [{ "platform": "...", "text": "...", "hashtags": ["..."] }] }

PLATFORM RULES (STRICT):
- twitter: MAX 270 characters (leave room for link). Punchy, no fluff. 2-3 hashtags max. No emojis in body.
- linkedin: 300-600 words. Professional thought-leadership tone. Hook in first line (question or bold claim). Use line breaks every 2-3 sentences. End with a question to drive comments. No hashtags in body, put 3-5 at end.
- facebook: 150-300 words. Conversational and warm. Storytelling hook. Include a clear CTA. 1-2 relevant hashtags max.
- instagram: 100-200 word caption. Start with a hook line. Use relevant emojis (not excessive). Clear CTA mid-caption. Put 15-25 hashtags on a separate line at the end.

Each post MUST be tailored to the platform's style — do NOT use the same text for all platforms.`
```

**Also add brand voice to this tool.** Before the `callAiProxyWithRetry` call in `repurpose_for_social`, add:
```ts
        // Fetch brand voice for consistent tone across platforms
        let brandTone = '';
        try {
          const { data: brand } = await supabase
            .from('brand_guidelines')
            .select('tone, brand_personality')
            .eq('user_id', userId)
            .maybeSingle();
          if (brand?.tone) brandTone = `\nBrand tone: ${brand.tone}. ${brand.brand_personality ? `Personality: ${brand.brand_personality}.` : ''}`;
        } catch (e) { /* non-blocking */ }
```

Then append `brandTone` to the system message content string.

---

## FIX 5: Inject existing content + performance data into proposal generation

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — inside the campaign strategy fast path (around line 2035)

**Find where the campaign strategy messages are built (the `messages` array passed to ai-proxy).** Before the AI call, add context about existing content:

```ts
      // Enrich strategy generation with existing content knowledge
      let existingContentContext = '';
      try {
        const { data: existingContent } = await supabase
          .from('content_items')
          .select('title, main_keyword, seo_score, status')
          .eq('user_id', user.id)
          .order('seo_score', { ascending: false })
          .limit(20);

        if (existingContent?.length) {
          const published = existingContent.filter(c => c.status === 'published');
          const topics = existingContent.map(c => c.main_keyword).filter(Boolean);

          existingContentContext = `\n\nEXISTING CONTENT (do NOT suggest topics already covered):\n`;
          existingContentContext += existingContent.slice(0, 10).map(c =>
            `- "${c.title}" (keyword: ${c.main_keyword || 'none'}, SEO: ${c.seo_score || 0}, ${c.status})`
          ).join('\n');

          if (published.length > 0) {
            const avgSeo = Math.round(published.reduce((s, c) => s + (c.seo_score || 0), 0) / published.length);
            existingContentContext += `\n\nPerformance insight: ${published.length} published articles, average SEO score: ${avgSeo}/100.`;
          }
          existingContentContext += `\n\nSuggest NEW topics that complement (not duplicate) existing content.`;
        }
      } catch (e) { /* non-blocking */ }
```

Then append `existingContentContext` to the system message in the strategy generation prompt.

---

## FIX 6: Brand voice in `advancedContentGeneration.ts` (Content Wizard path)

**File:** `src/services/advancedContentGeneration.ts`

**Find the system prompt string (around line 358-399).** It starts with:
```ts
    let systemPrompt = formatSystemPrompt || `You are an expert content writer specializing in...
```

**After the system prompt is built (around line 399), add brand voice injection:**

```ts
    // Inject user's brand voice if configured
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: brand } = await supabase
          .from('brand_guidelines')
          .select('tone, brand_personality, do_use, dont_use, target_audience')
          .eq('user_id', user.id)
          .maybeSingle();
        if (brand && (brand.tone || brand.brand_personality)) {
          systemPrompt += `\n\nUSER'S BRAND VOICE (apply throughout):`;
          if (brand.tone) systemPrompt += `\nTone: ${brand.tone}`;
          if (brand.brand_personality) systemPrompt += `\nPersonality: ${brand.brand_personality}`;
          if (brand.do_use?.length) systemPrompt += `\nPreferred phrases: ${brand.do_use.join(', ')}`;
          if (brand.dont_use?.length) systemPrompt += `\nAvoid these phrases: ${brand.dont_use.join(', ')}`;
          if (brand.target_audience?.length) systemPrompt += `\nWriting for: ${brand.target_audience.join(', ')}`;
        }
      }
    } catch (e) {
      console.warn('Brand voice injection failed (non-blocking):', e);
    }
```

---

## FIX 7: Brand voice in campaign content generation

**File:** `supabase/functions/campaign-content-generator/index.ts`

**Find the system prompt (search for the system message in the AI call).** Add the same brand voice injection pattern:

```ts
    // Fetch brand voice
    let brandPrompt = '';
    const { data: brand } = await supabase
      .from('brand_guidelines')
      .select('tone, brand_personality, do_use, dont_use')
      .eq('user_id', userId)
      .maybeSingle();
    if (brand?.tone) {
      brandPrompt = `\nBrand voice: Tone is ${brand.tone}. ${brand.brand_personality ? `Personality: ${brand.brand_personality}.` : ''} ${brand.do_use?.length ? `Use: ${brand.do_use.join(', ')}.` : ''} ${brand.dont_use?.length ? `Avoid: ${brand.dont_use.join(', ')}.` : ''}`;
    }
```

Append `brandPrompt` to the system message content.

---

## FIX 8: Track content edits as feedback

**File:** `src/hooks/useEnhancedAIChatDB.ts` — inside `editMessage` (or create a new utility)

**This is bigger — create a new service file.** Create `src/services/contentFeedbackService.ts`:

```ts
import { supabase } from '@/integrations/supabase/client';

export async function trackContentEdit(
  contentId: string,
  originalContent: string,
  editedContent: string,
  userId: string
) {
  try {
    const originalWords = originalContent.split(/\s+/).length;
    const editedWords = editedContent.split(/\s+/).length;
    const originalHeadings = (originalContent.match(/<h[2-3][^>]*>/gi) || []).length;
    const editedHeadings = (editedContent.match(/<h[2-3][^>]*>/gi) || []).length;

    await supabase.from('content_generation_feedback').insert({
      user_id: userId,
      content_id: contentId,
      feedback_type: 'edit',
      feedback_data: {
        word_count_change: editedWords - originalWords,
        headings_change: editedHeadings - originalHeadings,
        length_ratio: editedWords / Math.max(originalWords, 1),
        shortened: editedWords < originalWords,
        expanded: editedWords > originalWords
      }
    });
  } catch (e) {
    console.warn('Content feedback tracking failed:', e);
  }
}
```

**Then in the Repository content editor** (wherever content is saved after user edits), call:
```ts
import { trackContentEdit } from '@/services/contentFeedbackService';
// After save:
if (content.metadata?.generated_via) {
  await trackContentEdit(content.id, originalContent, editedContent, user.id);
}
```

**This also needs a DB migration.** Create `supabase/migrations/YYYYMMDD_content_generation_feedback.sql`:
```sql
CREATE TABLE IF NOT EXISTS public.content_generation_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID REFERENCES public.content_items(id) ON DELETE SET NULL,
  feedback_type TEXT NOT NULL DEFAULT 'edit',
  feedback_data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.content_generation_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own feedback"
  ON public.content_generation_feedback
  FOR ALL
  USING (user_id = auth.uid());
```

---

## FIX 9: Inject edit feedback into future generation prompts

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — inside `generate_full_content`

**After the brand voice fetch (from FIX 1), add:**
```ts
        // Fetch content edit patterns for personalized generation
        let editFeedback = '';
        try {
          const { data: feedback } = await supabase
            .from('content_generation_feedback')
            .select('feedback_data')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(10);

          if (feedback?.length >= 3) {
            const shortened = feedback.filter(f => f.feedback_data?.shortened).length;
            const expanded = feedback.filter(f => f.feedback_data?.expanded).length;
            const avgRatio = feedback.reduce((s, f) => s + (f.feedback_data?.length_ratio || 1), 0) / feedback.length;

            editFeedback = '\n\nLEARNED FROM USER EDITS:';
            if (shortened > expanded) editFeedback += '\n- User tends to shorten AI content — be more concise, cut filler';
            if (expanded > shortened) editFeedback += '\n- User tends to expand AI content — add more detail and examples';
            if (avgRatio < 0.85) editFeedback += '\n- User typically removes ~' + Math.round((1 - avgRatio) * 100) + '% of generated content — write tighter';
            if (avgRatio > 1.15) editFeedback += '\n- User typically adds ~' + Math.round((avgRatio - 1) * 100) + '% more content — leave room for expansion';
          }
        } catch (e) { /* non-blocking */ }
```

Append `editFeedback` to the system message.

---

## IMPLEMENTATION ORDER FOR LOVABLE

### Do these in order:

| # | Fix | File | Time |
|---|-----|------|------|
| 1 | Enrich `generate_full_content` prompt | `content-action-tools.ts` | 15 min |
| 2 | Inject brand voice into main chat | `index.ts` | 10 min |
| 3 | Auto-generate meta title/description | `content-action-tools.ts` | 5 min |
| 4 | Platform-specific social repurposing | `cross-module-tools.ts` | 10 min |
| 5 | Existing content context in proposals | `index.ts` | 15 min |
| 6 | Brand voice in Content Wizard | `advancedContentGeneration.ts` | 10 min |
| 7 | Brand voice in campaign generator | `campaign-content-generator/index.ts` | 10 min |
| 8 | Content edit tracking (new service + migration) | New files | 20 min |
| 9 | Edit feedback in generation prompts | `content-action-tools.ts` | 10 min |

**Total: ~2 hours of work.**

---

## INTELLIGENCE LAYER — Making Output Actually Smart (Fixes 10-19)

Everything below uses data that ALREADY EXISTS in the user's Supabase tables. No new APIs needed — just connecting dots between tables that are populated but never flow into generation prompts.

---

### FIX 10: Feed winning content structure back into generation

**The insight:** The user already has published content with SEO scores. Before generating anything new, analyze their top-performing articles and replicate the structure.

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — inside `generate_full_content`, after brand voice fetch (FIX 1)

**Add:**
```ts
        // Analyze user's top-performing content structure
        let contentPatternContext = '';
        try {
          const { data: topContent } = await supabase
            .from('content_items')
            .select('content, seo_score, content_type')
            .eq('user_id', userId)
            .eq('status', 'published')
            .order('seo_score', { ascending: false })
            .limit(3);

          if (topContent?.length >= 2) {
            const avgHeadings = topContent.reduce((sum, c) => {
              return sum + ((c.content || '').match(/<h[23][^>]*>/gi) || []).length;
            }, 0) / topContent.length;

            const avgWordsPer = topContent.reduce((sum, c) => {
              const words = (c.content || '').split(/\s+/).length;
              const headings = ((c.content || '').match(/<h[23][^>]*>/gi) || []).length || 1;
              return sum + (words / headings);
            }, 0) / topContent.length;

            const avgScore = Math.round(topContent.reduce((s, c) => s + (c.seo_score || 0), 0) / topContent.length);

            contentPatternContext = `\n\nCONTENT STRUCTURE LEARNED FROM USER'S TOP ARTICLES (avg SEO score: ${avgScore}/100):\n- Use approximately ${Math.round(avgHeadings)} H2/H3 sections\n- Average ~${Math.round(avgWordsPer)} words per section\n- Match this structure for optimal performance with this user's audience`;
          }
        } catch (e) { /* non-blocking */ }
```

Append `contentPatternContext` to the system message.

**Also add to:** `src/services/advancedContentGeneration.ts` — same pattern before building the prompt.

---

### FIX 11: Competitor content gap as generation input

**The insight:** When generating content about a topic, check if competitors have content on the same topic. If yes, tell the AI to cover everything they cover PLUS what they miss.

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — inside `generate_full_content`, after content pattern fetch

**Add:**
```ts
        // Check competitor coverage for this topic
        let competitorContext = '';
        try {
          const { data: competitors } = await supabase
            .from('company_competitors')
            .select('name, intelligence_data')
            .eq('user_id', userId)
            .limit(5);

          if (competitors?.length) {
            // Check if any competitor intelligence mentions this keyword
            const relevantCompetitors = competitors.filter(c => {
              const intel = JSON.stringify(c.intelligence_data || {}).toLowerCase();
              return intel.includes((toolArgs.keyword || '').toLowerCase());
            });

            if (relevantCompetitors.length > 0) {
              competitorContext = `\n\nCOMPETITOR INTELLIGENCE:\n${relevantCompetitors.map(c => `- ${c.name} covers this topic`).join('\n')}\nEnsure your article covers everything competitors cover AND adds unique angles they miss. Differentiate with original insights, specific data, and practical examples competitors lack.`;
            }
          }
        } catch (e) { /* non-blocking */ }
```

Append `competitorContext` to the system message.

---

### FIX 12: Internal linking suggestions after generation

**The insight:** After generating content, scan existing published articles for keyword overlaps and suggest internal links. This is a massive SEO signal.

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — after the content is saved (around line 509), before the return statement

**Add:**
```ts
        // Suggest internal links from existing content
        let internalLinks: { title: string; keyword: string; id: string }[] = [];
        try {
          const { data: published } = await supabase
            .from('content_items')
            .select('id, title, main_keyword')
            .eq('user_id', userId)
            .eq('status', 'published')
            .neq('id', saved.id)
            .limit(50);

          if (published?.length) {
            const contentLower = generatedContent.toLowerCase();
            internalLinks = published.filter(p => {
              const kw = (p.main_keyword || '').toLowerCase();
              return kw.length > 3 && contentLower.includes(kw);
            }).slice(0, 5);
          }
        } catch (e) { /* non-blocking */ }
```

Then update the return to include link suggestions:
```ts
        return {
          success: true,
          message: `Generated and saved "${saved.title}" (~${wordCount} words, SEO: ${seoScore}/100) as draft${internalLinks.length ? `\n\n📎 **Internal link opportunities:** ${internalLinks.map(l => `"${l.title}" (keyword: ${l.keyword})`).join(', ')}` : ''}`,
          item: { ...saved, seo_score: seoScore },
          wordCount,
          internalLinks: internalLinks.length > 0 ? internalLinks : undefined
        };
```

---

### FIX 13: Audience-aware tone shifting for emails

**The insight:** When generating email content, check who it's for. VIP customers get different language than new leads.

**File:** `supabase/functions/enhanced-ai-chat/engage-action-tools.ts` — inside `create_email_campaign`, before the insert

**Add (when a segment_id is provided):**
```ts
        // Adapt tone based on target segment
        let audienceHint = '';
        if (toolArgs.segment_id) {
          try {
            const { data: segment } = await supabase
              .from('engage_segments')
              .select('name, description')
              .eq('id', toolArgs.segment_id)
              .single();

            if (segment) {
              const segName = (segment.name || '').toLowerCase();
              if (segName.includes('vip') || segName.includes('loyal') || segName.includes('premium')) {
                audienceHint = ' [Audience: VIP/loyal customers — use appreciative, exclusive tone]';
              } else if (segName.includes('new') || segName.includes('lead') || segName.includes('trial')) {
                audienceHint = ' [Audience: New leads — use welcoming, educational tone with clear value proposition]';
              } else if (segName.includes('inactive') || segName.includes('churned') || segName.includes('lapsed')) {
                audienceHint = ' [Audience: Inactive users — use re-engagement tone, highlight what they are missing]';
              }
            }
          } catch (e) { /* non-blocking */ }
        }
```

Then append `audienceHint` to the campaign name or subject line context if AI is generating the body.

---

### FIX 14: Performance-driven topic prioritization

**The insight:** When user asks "what should I write about," weight suggestions by what has historically performed well.

**File:** `supabase/functions/enhanced-ai-chat/index.ts` — in the system prompt where proposals/strategy context is injected

**Find the section where `realDataContext` is built. Add performance analysis:**

```ts
    // Analyze content performance by topic for strategy recommendations
    let performanceInsight = '';
    try {
      const { data: scoredContent } = await supabase
        .from('content_items')
        .select('main_keyword, seo_score, content_type')
        .eq('user_id', user.id)
        .not('seo_score', 'is', null)
        .order('seo_score', { ascending: false })
        .limit(30);

      if (scoredContent?.length >= 5) {
        // Group by keyword theme (first word of keyword as proxy)
        const themes: Record<string, { scores: number[]; count: number }> = {};
        for (const c of scoredContent) {
          const theme = (c.main_keyword || '').split(/\s+/)[0]?.toLowerCase();
          if (!theme || theme.length < 3) continue;
          if (!themes[theme]) themes[theme] = { scores: [], count: 0 };
          themes[theme].scores.push(c.seo_score || 0);
          themes[theme].count++;
        }

        const rankedThemes = Object.entries(themes)
          .filter(([_, v]) => v.count >= 2)
          .map(([k, v]) => ({ theme: k, avg: Math.round(v.scores.reduce((s, n) => s + n, 0) / v.scores.length), count: v.count }))
          .sort((a, b) => b.avg - a.avg)
          .slice(0, 5);

        if (rankedThemes.length >= 2) {
          performanceInsight = `\n\nCONTENT PERFORMANCE BY TOPIC (use for strategy recommendations):\n${rankedThemes.map(t => `- "${t.theme}" topics: avg SEO ${t.avg}/100 across ${t.count} articles`).join('\n')}\nRecommend more content in high-performing topic areas.`;
        }
      }
    } catch (e) { /* non-blocking */ }
```

Append `performanceInsight` to the system prompt alongside `realDataContext`.

---

### FIX 15: Content calendar topic diversity

**The insight:** When scheduling content, flag topic imbalance in the calendar.

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — inside `create_calendar_item`, after the successful insert (before the return)

**Add:**
```ts
        // Check calendar topic diversity for this month
        let diversityNote = '';
        try {
          const monthStart = new Date();
          monthStart.setDate(1);
          const monthEnd = new Date(monthStart);
          monthEnd.setMonth(monthEnd.getMonth() + 1);

          const { data: monthItems } = await supabase
            .from('content_calendar')
            .select('title, content_type')
            .eq('user_id', userId)
            .gte('scheduled_date', monthStart.toISOString().split('T')[0])
            .lt('scheduled_date', monthEnd.toISOString().split('T')[0]);

          if (monthItems && monthItems.length >= 3) {
            const types = monthItems.reduce((acc: Record<string, number>, item) => {
              const t = item.content_type || 'blog';
              acc[t] = (acc[t] || 0) + 1;
              return acc;
            }, {});

            const dominant = Object.entries(types).sort((a, b) => b[1] - a[1])[0];
            if (dominant && dominant[1] >= monthItems.length * 0.7) {
              diversityNote = ` Note: ${Math.round(dominant[1] / monthItems.length * 100)}% of this month's calendar is ${dominant[0]} content — consider diversifying formats.`;
            }
          }
        } catch (e) { /* non-blocking */ }

        return { success: true, message: `Scheduled "${data.title}" for ${data.scheduled_date}${diversityNote}`, item: data };
```

---

### FIX 16: Solution mention density control

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — in the system prompt for `generate_full_content` (FIX 1)

**Add to the solution context string (inside `solutionContext`):**
```ts
if (sol) {
  const mentionTarget = targetWords < 1000 ? '1-2' : targetWords < 2000 ? '2-3' : '3-5';
  solutionContext = `\n\nSOLUTION TO REFERENCE: "${sol.name}" — ${sol.description || ''}...
Mention the solution exactly ${mentionTarget} times across the article:
- NEVER in the introduction (establish value first)
- NEVER in consecutive paragraphs
- ALWAYS after providing genuine educational value
- Frame as a natural recommendation, not an advertisement
- First mention: after demonstrating you understand the reader's problem
- Last mention: in a practical "next steps" context`;
}
```

---

### FIX 17: Reading level adaptation from audience

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — in the system prompt for `generate_full_content`

**Add after the brand voice context:**
```ts
        // Adapt reading level to target audience
        let readingLevel = '';
        try {
          const { data: brand } = await supabase
            .from('brand_guidelines')
            .select('target_audience')
            .eq('user_id', userId)
            .maybeSingle();

          if (brand?.target_audience?.length) {
            const audience = brand.target_audience.join(' ').toLowerCase();
            if (audience.match(/cto|cio|engineer|developer|technical|architect/)) {
              readingLevel = '\nReading level: Technical — assume domain expertise, use industry jargon, skip basic explanations, focus on implementation details and architecture decisions.';
            } else if (audience.match(/executive|ceo|founder|director|vp|c-suite/)) {
              readingLevel = '\nReading level: Executive — concise, focus on business impact, ROI, and strategic implications. No technical deep-dives unless directly tied to outcomes.';
            } else if (audience.match(/beginner|student|small business|starter|new to/)) {
              readingLevel = '\nReading level: Accessible — explain concepts clearly, define jargon when used, provide step-by-step guidance, use analogies for complex topics.';
            } else {
              readingLevel = '\nReading level: Professional — balance depth with clarity, explain technical concepts briefly, focus on practical application.';
            }
          }
        } catch (e) { /* non-blocking */ }
```

Append `readingLevel` to the system message.

---

### FIX 18: Fact-checking flags on generated content

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — after content is generated and saved, before the return

**Add:**
```ts
        // Flag statistics and claims for verification
        const statClaims = generatedContent.match(/\d{1,3}%\s+of\s+\w+|\d{1,3}\s+percent|according to\s+[A-Z][a-z]+|\b(study|survey|report|research)\s+by\s+[A-Z]/gi) || [];
        const factCheckNote = statClaims.length > 0
          ? `\n\n⚠️ **${statClaims.length} statistic(s)/citation(s) detected** — verify before publishing:\n${statClaims.slice(0, 5).map(s => `- "${s.trim().substring(0, 80)}..."`).join('\n')}`
          : '';
```

Append `factCheckNote` to the return message.

---

### FIX 19: Content freshness detection — update vs create new

**File:** `supabase/functions/enhanced-ai-chat/content-action-tools.ts` — at the TOP of `generate_full_content`, before any generation logic

**Add:**
```ts
        // Check if user already has content on this topic
        let freshnessNote = '';
        try {
          const { data: existing } = await supabase
            .from('content_items')
            .select('id, title, seo_score, created_at, status')
            .eq('user_id', userId)
            .ilike('main_keyword', `%${toolArgs.keyword}%`)
            .limit(3);

          if (existing?.length) {
            const mostRecent = existing[0];
            const ageMonths = Math.round((Date.now() - new Date(mostRecent.created_at).getTime()) / (30 * 24 * 60 * 60 * 1000));

            if (ageMonths > 6) {
              freshnessNote = `\n\nNOTE: User has an existing article "${mostRecent.title}" on this topic from ${ageMonths} months ago (SEO: ${mostRecent.seo_score || 'N/A'}). Consider this a REFRESH — improve upon and update the existing angle rather than writing a completely overlapping piece. Reference new developments since the original was written.`;
            } else if (ageMonths <= 6) {
              freshnessNote = `\n\nNOTE: User recently published "${mostRecent.title}" on this topic (${ageMonths} months ago, SEO: ${mostRecent.seo_score || 'N/A'}). Take a DIFFERENT ANGLE — cover aspects the existing article doesn't, target a different search intent, or address a more specific sub-topic to avoid cannibalization.`;
            }
          }
        } catch (e) { /* non-blocking */ }
```

Append `freshnessNote` to the system message.

---

## COMPLETE IMPLEMENTATION ORDER

### Sprint 1: Core quality (Fixes 1-4) — ~1 hour
| # | Fix | Impact |
|---|-----|--------|
| 1 | Enriched `generate_full_content` prompt | Generic → quality content |
| 2 | Brand voice in main chat | All responses match user's tone |
| 3 | Auto meta title/description | SEO-ready on every article |
| 4 | Platform-specific social | Posts actually fit each platform |

### Sprint 2: Intelligence layer (Fixes 5-9) — ~1.5 hours
| # | Fix | Impact |
|---|-----|--------|
| 5 | Existing content in proposals | No duplicate topic suggestions |
| 6 | Brand voice in wizard | Best content path respects brand |
| 7 | Brand voice in campaigns | Campaign content matches brand |
| 8 | Edit tracking service + DB | Foundation for "learns from you" |
| 9 | Edit feedback in prompts | Content improves over time |

### Sprint 3: Competitive intelligence (Fixes 10-14) — ~2 hours
| # | Fix | Impact |
|---|-----|--------|
| 10 | Winning content structure reuse | Replicates what works |
| 11 | Competitor gap as input | Every article beats competitors |
| 12 | Internal linking suggestions | Major SEO boost, zero effort |
| 13 | Audience-aware email tone | Emails match segment expectations |
| 14 | Performance-driven topics | Strategy based on real data |

### Sprint 4: Polish (Fixes 15-19) — ~1 hour
| # | Fix | Impact |
|---|-----|--------|
| 15 | Calendar topic diversity | Balanced content mix |
| 16 | Solution mention density | Natural product placement |
| 17 | Reading level from audience | Content resonates with readers |
| 18 | Fact-checking flags | Credibility protection |
| 19 | Content freshness detection | Refresh vs new, no cannibalization |

### Verification after all fixes:
1. Configure brand voice in Settings → Prompts (set tone to "witty and direct")
2. Chat: "Write a blog post about remote work tools" → article should use witty tone, no AI slop phrases, have Key Takeaways + FAQ sections, start with a specific stat, include internal link suggestions, flag any stats for verification
3. Chat: "Repurpose my latest article for Twitter and LinkedIn" → Twitter post under 280 chars, LinkedIn post 300-600 words with line breaks
4. Content Wizard: generate blog → same brand voice applied
5. Generate 5 articles → edit 3 of them (shorten) → generate 6th → should be more concise based on feedback
6. Schedule content → see diversity note if calendar is imbalanced
7. Ask "what should I write next" → suggestions weighted by past performance, no duplicate topics
8. Generate about a topic you already covered → AI acknowledges existing article, takes different angle
