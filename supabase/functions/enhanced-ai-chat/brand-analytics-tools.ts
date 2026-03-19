/**
 * Brand Voice & Analytics Tools
 * Tools for reading/updating brand settings and fetching content performance analytics
 */

// Tool definitions
export const BRAND_ANALYTICS_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_brand_voice",
      description: "Fetch the user's brand voice and guidelines including tone, personality, colors, fonts, do/don't phrases, brand values, and target audience. Use when user asks about their brand, tone of voice, writing style, brand guidelines, or 'how should I write'.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_brand_voice",
      description: "Update the user's brand voice settings like tone, personality, do/don't phrases, brand values, or target audience. Use when user asks to change their writing style, update tone, modify brand guidelines.",
      parameters: {
        type: "object",
        properties: {
          tone: { type: "array", items: { type: "string" }, description: "Brand tone descriptors (e.g., ['professional', 'friendly', 'authoritative'])" },
          brand_personality: { type: "string", description: "Brand personality description" },
          brand_values: { type: "string", description: "Core brand values" },
          target_audience: { type: "string", description: "Target audience description" },
          do_use: { type: "array", items: { type: "string" }, description: "Phrases/patterns to use in content" },
          dont_use: { type: "array", items: { type: "string" }, description: "Phrases/patterns to avoid in content" },
          mission_statement: { type: "string", description: "Brand mission statement" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_content_performance",
      description: "Fetch real content performance analytics (page views, sessions, bounce rate, CTR, impressions) from connected Google Analytics and Search Console. Use when user asks about traffic, page views, impressions, clicks, CTR, bounce rate, or content performance. Requires API keys to be connected.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "Specific content ID to get performance for" },
          limit: { type: "number", default: 10, description: "Number of items to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "auto_detect_brand_voice",
      description: "Automatically analyze the user's published content to detect brand voice patterns (tone, style, vocabulary). Requires at least 2 published articles. Use when user says 'detect my brand voice', 'analyze my writing style', or 'learn my tone'.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", default: 5, description: "Number of published articles to analyze (max 10)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_performance_comparison",
      description: "Compare content and keyword performance between two time periods (current vs previous week/month/quarter). Use when user asks 'how did I do this week vs last week', 'compare this month', or 'show my progress'.",
      parameters: {
        type: "object",
        properties: {
          period: { type: "string", enum: ["week", "month", "quarter"], description: "Time period to compare" }
        },
        required: ["period"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_weekly_briefing",
      description: "Generate a comprehensive weekly content strategy briefing covering content performance, upcoming calendar, proposals pipeline, competitor updates, and action recommendations. Use when user asks for 'weekly briefing', 'content summary', 'what should I focus on', 'weekly report', or 'strategy update'.",
      parameters: {
        type: "object",
        properties: {}
      }
    }
  }
];

export const BRAND_ANALYTICS_TOOL_NAMES = [
  'get_brand_voice',
  'update_brand_voice',
  'get_content_performance',
  'auto_detect_brand_voice',
  'get_performance_comparison',
  'generate_weekly_briefing'
];

export async function executeBrandAnalyticsTool(
  toolName: string,
  toolArgs: any,
  supabase: any,
  userId: string
): Promise<any> {
  switch (toolName) {
    case 'get_brand_voice': {
      const { data, error } = await supabase
        .from('brand_guidelines')
        .select('id, tone, brand_personality, brand_values, target_audience, do_use, dont_use, mission_statement, brand_story, keywords, primary_color, secondary_color, accent_color, font_family, secondary_font_family, logo_usage_notes, imagery_guidelines, created_at, updated_at')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return {
          success: true,
          brand_voice: null,
          message: "No brand guidelines configured yet. The user can set up their brand voice in Settings → Prompts, or you can help them define it now using the update_brand_voice tool."
        };
      }

      return {
        success: true,
        brand_voice: data
      };
    }

    case 'update_brand_voice': {
      // Check if brand guidelines exist
      const { data: existing } = await supabase
        .from('brand_guidelines')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const updateFields: Record<string, any> = {};
      if (toolArgs.tone !== undefined) updateFields.tone = toolArgs.tone;
      if (toolArgs.brand_personality !== undefined) updateFields.brand_personality = toolArgs.brand_personality;
      if (toolArgs.brand_values !== undefined) updateFields.brand_values = toolArgs.brand_values;
      if (toolArgs.target_audience !== undefined) updateFields.target_audience = toolArgs.target_audience;
      if (toolArgs.do_use !== undefined) updateFields.do_use = toolArgs.do_use;
      if (toolArgs.dont_use !== undefined) updateFields.dont_use = toolArgs.dont_use;
      if (toolArgs.mission_statement !== undefined) updateFields.mission_statement = toolArgs.mission_statement;
      updateFields.updated_at = new Date().toISOString();

      if (existing) {
        // Update existing
        const { error } = await supabase
          .from('brand_guidelines')
          .update(updateFields)
          .eq('id', existing.id);

        if (error) throw error;

        return {
          success: true,
          action: 'updated',
          message: 'Brand voice settings updated successfully.',
          updatedFields: Object.keys(updateFields).filter(k => k !== 'updated_at')
        };
      } else {
        // Create new with required fields
        const insertData = {
          user_id: userId,
          primary_color: '#000000',
          secondary_color: '#666666',
          font_family: 'Inter',
          logo_usage_notes: '',
          ...updateFields
        };

        const { error } = await supabase
          .from('brand_guidelines')
          .insert(insertData);

        if (error) throw error;

        return {
          success: true,
          action: 'created',
          message: 'Brand voice settings created successfully.',
          updatedFields: Object.keys(updateFields).filter(k => k !== 'updated_at')
        };
      }
    }

    case 'get_content_performance': {
      // Check for API keys first (analytics-scaffold-standard)
      const { data: apiKeys } = await supabase
        .from('api_keys_metadata')
        .select('service')
        .eq('user_id', userId)
        .eq('is_active', true)
        .in('service', ['google-analytics', 'google-search-console']);

      const hasGA = apiKeys?.some((k: any) => k.service === 'google-analytics') || false;
      const hasGSC = apiKeys?.some((k: any) => k.service === 'google-search-console') || false;

      if (!hasGA && !hasGSC) {
        return {
          success: false,
          hasGoogleAnalytics: false,
          hasSearchConsole: false,
          message: "No analytics services connected. To see real performance data, connect your Google Analytics and/or Google Search Console API keys in Settings → API Keys.",
          settingsAction: "open-settings:api"
        };
      }

      // Fetch actual analytics data
      let query = supabase
        .from('content_analytics')
        .select(`
          id, content_id, published_url, analytics_data, search_console_data, last_fetched_at,
          content_items!inner(id, title, status, user_id)
        `)
        .eq('content_items.user_id', userId);

      if (toolArgs.content_id) {
        query = query.eq('content_id', toolArgs.content_id);
      }

      const { data, error } = await query
        .order('last_fetched_at', { ascending: false })
        .limit(Math.min(toolArgs.limit || 10, 50));

      if (error) throw error;

      return {
        success: true,
        hasGoogleAnalytics: hasGA,
        hasSearchConsole: hasGSC,
        performanceData: data || [],
        count: data?.length || 0,
        message: data?.length
          ? `Found performance data for ${data.length} content items.`
          : "Analytics connected but no performance data available yet. Make sure your content has published URLs and analytics tracking is configured."
      };
    }

    case 'auto_detect_brand_voice': {
      const articleLimit = Math.min(toolArgs.limit || 5, 10);
      
      // Fetch published articles
      const { data: articles, error: articlesError } = await supabase
        .from('content_items')
        .select('id, title, content')
        .eq('user_id', userId)
        .eq('status', 'published')
        .not('content', 'is', null)
        .order('created_at', { ascending: false })
        .limit(articleLimit);

      if (articlesError) throw articlesError;

      if (!articles || articles.length < 2) {
        return {
          success: false,
          message: `Need at least 2 published articles to detect brand voice (found ${articles?.length || 0}). Publish more content first.`
        };
      }

      // Extract text samples (first 500 words from each)
      const samples = articles.map((a: any) => {
        const words = (a.content || '').split(/\s+/).slice(0, 500).join(' ');
        return `[${a.title}]: ${words}`;
      }).join('\n\n---\n\n');

      // Use AI to analyze writing patterns
      const { getApiKey } = await import('../shared/apiKeyService.ts');
      const apiKey = await getApiKey('openai', userId);
      if (!apiKey) {
        return {
          success: false,
          message: '🔑 No OpenAI API key configured. Please go to **Settings → API Keys** and add your OpenAI key.'
        };
      }

      const { callAiProxyWithRetry } = await import('../shared/aiProxyRetry.ts');
      const analysisResponse = await callAiProxyWithRetry({
        service: 'openai',
        endpoint: '/v1/chat/completions',
        apiKey,
        params: {
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: 'Analyze these content samples and extract the brand voice. Return JSON with: tone (array of 3-5 descriptors), brand_personality (string), target_audience (string), do_use (array of 3-5 phrases/patterns the author uses), dont_use (array of 3-5 things the author avoids). Be specific based on actual patterns, not generic.' },
            { role: 'user', content: `Analyze this content for brand voice patterns:\n\n${samples}` }
          ],
          max_tokens: 800,
          temperature: 0.3,
          response_format: { type: 'json_object' }
        }
      });

      const voiceAnalysis = JSON.parse(analysisResponse.choices?.[0]?.message?.content || '{}');

      if (!voiceAnalysis.tone) {
        return { success: false, message: 'Could not detect brand voice patterns. Try with more diverse content.' };
      }

      // Save to brand_guidelines
      const { data: existing } = await supabase
        .from('brand_guidelines')
        .select('id')
        .eq('user_id', userId)
        .maybeSingle();

      const updateFields: Record<string, any> = {
        tone: voiceAnalysis.tone,
        brand_personality: voiceAnalysis.brand_personality,
        target_audience: voiceAnalysis.target_audience,
        do_use: voiceAnalysis.do_use,
        dont_use: voiceAnalysis.dont_use,
        updated_at: new Date().toISOString()
      };

      if (existing) {
        await supabase.from('brand_guidelines').update(updateFields).eq('id', existing.id);
      } else {
        await supabase.from('brand_guidelines').insert({
          user_id: userId,
          primary_color: '#000000',
          secondary_color: '#666666',
          font_family: 'Inter',
          logo_usage_notes: '',
          ...updateFields
        });
      }

      return {
        success: true,
        message: `Detected brand voice from ${articles.length} articles and saved to your brand guidelines.`,
        detectedVoice: voiceAnalysis,
        articlesAnalyzed: articles.length,
        actions: [
          { id: 'view_brand', label: '⚙️ View Brand Settings', type: 'navigate', route: '/settings/prompts' },
          { id: 'refine_voice', label: '✏️ Refine Voice', type: 'send_message', message: 'Show me my brand voice settings so I can refine them' }
        ]
      };
    }

    case 'get_performance_comparison': {
      const period = toolArgs.period || 'week';
      const now = new Date();
      let currentStart: Date, previousStart: Date, previousEnd: Date;

      if (period === 'week') {
        currentStart = new Date(now.getTime() - 7 * 86400000);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd.getTime() - 7 * 86400000);
      } else if (period === 'month') {
        currentStart = new Date(now.getTime() - 30 * 86400000);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd.getTime() - 30 * 86400000);
      } else {
        currentStart = new Date(now.getTime() - 90 * 86400000);
        previousEnd = new Date(currentStart.getTime() - 1);
        previousStart = new Date(previousEnd.getTime() - 90 * 86400000);
      }

      const [currentContent, previousContent, currentKeywords, previousKeywords] = await Promise.all([
        supabase.from('content_items')
          .select('id, status, seo_score', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', currentStart.toISOString()),
        supabase.from('content_items')
          .select('id, status, seo_score', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', previousStart.toISOString())
          .lt('created_at', currentStart.toISOString()),
        supabase.from('keywords')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', currentStart.toISOString()),
        supabase.from('keywords')
          .select('id', { count: 'exact' })
          .eq('user_id', userId)
          .gte('created_at', previousStart.toISOString())
          .lt('created_at', currentStart.toISOString())
      ]);

      const curItems = currentContent.data || [];
      const prevItems = previousContent.data || [];
      const curPublished = curItems.filter((i: any) => i.status === 'published').length;
      const prevPublished = prevItems.filter((i: any) => i.status === 'published').length;
      const curAvgSeo = curItems.length > 0 ? Math.round(curItems.reduce((s: number, i: any) => s + (i.seo_score || 0), 0) / curItems.length) : 0;
      const prevAvgSeo = prevItems.length > 0 ? Math.round(prevItems.reduce((s: number, i: any) => s + (i.seo_score || 0), 0) / prevItems.length) : 0;

      return {
        success: true,
        period,
        comparison: {
          current: {
            label: `This ${period}`,
            contentCreated: currentContent.count || 0,
            published: curPublished,
            avgSeoScore: curAvgSeo,
            keywordsAdded: currentKeywords.count || 0
          },
          previous: {
            label: `Last ${period}`,
            contentCreated: previousContent.count || 0,
            published: prevPublished,
            avgSeoScore: prevAvgSeo,
            keywordsAdded: previousKeywords.count || 0
          }
        },
        visualData: {
          type: 'comparison_chart',
          chartType: 'bar',
          metrics: ['Content Created', 'Published', 'Avg SEO', 'Keywords'],
          current: [currentContent.count || 0, curPublished, curAvgSeo, currentKeywords.count || 0],
          previous: [previousContent.count || 0, prevPublished, prevAvgSeo, previousKeywords.count || 0],
          labels: [`This ${period}`, `Last ${period}`]
        },
        message: `${period.charAt(0).toUpperCase() + period.slice(1)}-over-${period} comparison: Content ${(currentContent.count || 0) > (previousContent.count || 0) ? '📈 up' : '📉 down'} (${currentContent.count || 0} vs ${previousContent.count || 0}), SEO avg ${curAvgSeo > prevAvgSeo ? '📈 improved' : curAvgSeo === prevAvgSeo ? '➡️ same' : '📉 declined'} (${curAvgSeo} vs ${prevAvgSeo}).`
      };
    }

    case 'generate_weekly_briefing': {
      const now = new Date();
      const sevenDaysAgo = new Date(now.getTime() - 7 * 86400000).toISOString();
      const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000).toISOString();
      const today = now.toISOString().split('T')[0];

      const [contentResult, proposalsResult, calendarResult, competitorsResult, signalsResult, draftsResult] = await Promise.allSettled([
        // Content created this week
        supabase.from('content_items')
          .select('id, title, status, seo_score, content_type, created_at')
          .eq('user_id', userId).gte('created_at', sevenDaysAgo)
          .order('created_at', { ascending: false }).limit(20),
        // Active proposals
        supabase.from('ai_strategy_proposals')
          .select('id, title, status, primary_keyword, priority_tag')
          .eq('user_id', userId).in('status', ['available', 'scheduled'])
          .order('created_at', { ascending: false }).limit(10),
        // Upcoming calendar items
        supabase.from('content_calendar')
          .select('id, title, scheduled_date, status, content_type, priority')
          .eq('user_id', userId).gte('scheduled_date', today).lte('scheduled_date', sevenDaysFromNow)
          .order('scheduled_date', { ascending: true }).limit(10),
        // Competitors
        supabase.from('company_competitors')
          .select('id, name, last_analyzed_at')
          .eq('user_id', userId).limit(5),
        // Performance signals this week
        supabase.from('content_performance_signals')
          .select('signal_type, content_id')
          .eq('user_id', userId).gte('created_at', sevenDaysAgo),
        // Stale drafts
        supabase.from('content_items')
          .select('id, title, seo_score, updated_at')
          .eq('user_id', userId).eq('status', 'draft')
          .lt('updated_at', sevenDaysAgo)
          .order('seo_score', { ascending: false }).limit(5)
      ]);

      // Build briefing sections
      const sections: string[] = [];

      // Content created
      const content = contentResult.status === 'fulfilled' ? contentResult.value.data || [] : [];
      const published = content.filter((c: any) => c.status === 'published');
      const drafts = content.filter((c: any) => c.status === 'draft');
      sections.push(`## 📝 Content This Week\n- **${content.length}** pieces created (${published.length} published, ${drafts.length} drafts)\n${content.slice(0, 5).map((c: any) => `- "${c.title}" — ${c.status} ${c.seo_score ? `(SEO: ${c.seo_score})` : ''}`).join('\n')}`);

      // Calendar
      const calendar = calendarResult.status === 'fulfilled' ? calendarResult.value.data || [] : [];
      if (calendar.length > 0) {
        sections.push(`## 📅 Upcoming This Week\n${calendar.map((c: any) => `- **${c.scheduled_date}**: "${c.title}" (${c.status}, ${c.priority} priority)`).join('\n')}`);
      } else {
        sections.push(`## 📅 Upcoming This Week\n⚠️ **No content scheduled this week.** Consider filling your calendar from available proposals.`);
      }

      // Proposals pipeline
      const proposals = proposalsResult.status === 'fulfilled' ? proposalsResult.value.data || [] : [];
      if (proposals.length > 0) {
        sections.push(`## 🎯 Proposals Pipeline\n${proposals.slice(0, 5).map((p: any) => `- "${p.title}" — ${p.status} ${p.priority_tag ? `[${p.priority_tag}]` : ''} (keyword: ${p.primary_keyword})`).join('\n')}`);
      }

      // Stale drafts
      const stale = draftsResult.status === 'fulfilled' ? draftsResult.value.data || [] : [];
      if (stale.length > 0) {
        sections.push(`## ⏰ Drafts Needing Attention\nThese high-potential drafts haven't been touched in 7+ days:\n${stale.map((d: any) => `- "${d.title}" ${d.seo_score ? `(SEO: ${d.seo_score})` : ''}`).join('\n')}`);
      }

      // Competitor check
      const competitors = competitorsResult.status === 'fulfilled' ? competitorsResult.value.data || [] : [];
      const staleCompetitors = competitors.filter((c: any) => {
        if (!c.last_analyzed_at) return true;
        return new Date(c.last_analyzed_at).getTime() < now.getTime() - 30 * 86400000;
      });
      if (staleCompetitors.length > 0) {
        sections.push(`## 🔍 Competitor Intelligence\n${staleCompetitors.length} competitor(s) haven't been analyzed in 30+ days: ${staleCompetitors.map((c: any) => c.name).join(', ')}`);
      }

      // Performance signals
      const signals = signalsResult.status === 'fulfilled' ? signalsResult.value.data || [] : [];
      if (signals.length > 0) {
        const signalCounts: Record<string, number> = {};
        for (const s of signals) { signalCounts[s.signal_type] = (signalCounts[s.signal_type] || 0) + 1; }
        sections.push(`## 📊 Content Engagement\n${Object.entries(signalCounts).map(([type, count]) => `- ${type}: ${count} actions`).join('\n')}`);
      }

      const briefing = `# 📋 Weekly Content Strategy Briefing\n*${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}*\n\n${sections.join('\n\n')}`;

      return {
        success: true,
        briefing,
        message: briefing,
        stats: {
          contentCreated: content.length,
          published: published.length,
          calendarItems: calendar.length,
          activeProposals: proposals.length,
          staleDrafts: stale.length,
          staleCompetitors: staleCompetitors.length
        }
      };
    }

    default:
      throw new Error(`Unknown brand/analytics tool: ${toolName}`);
  }
}
