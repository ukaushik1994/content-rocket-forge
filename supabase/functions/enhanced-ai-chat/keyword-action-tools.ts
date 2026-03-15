/**
 * Keyword & Research Action Tools
 * Write/Create/Delete operations for keywords and SERP analysis
 */

export const KEYWORD_ACTION_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "add_keywords",
      description: "Add one or more keywords to the user's keyword library. Use when user says 'add keyword', 'track this keyword', or 'save these keywords'.",
      parameters: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string", description: "The keyword text" },
                volume: { type: "number", description: "Optional search volume" },
                difficulty: { type: "number", description: "Optional difficulty score (0-100)" }
              },
              required: ["keyword"]
            },
            description: "Array of keywords to add"
          }
        },
        required: ["keywords"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "remove_keywords",
      description: "Remove keywords from the library by ID or keyword text. Use when user says 'remove keyword', 'delete keyword', or 'stop tracking'.",
      parameters: {
        type: "object",
        properties: {
          keyword_ids: { type: "array", items: { type: "string" }, description: "UUIDs of keywords to remove" },
          keyword_names: { type: "array", items: { type: "string" }, description: "Keyword text to match and remove (case-insensitive)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "trigger_serp_analysis",
      description: "Trigger a live SERP analysis for a keyword via the SERP API. Use when user says 'analyze keyword', 'check SERP for', or 'research this keyword'.",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Keyword to analyze in search engines" },
          location: { type: "string", description: "Optional location for localized results (e.g., 'United States')" }
        },
        required: ["keyword"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "trigger_content_gap_analysis",
      description: "Analyze content gaps for a topic based on existing content and keywords. Use when user says 'find content gaps', 'what am I missing', or 'topic gap analysis'.",
      parameters: {
        type: "object",
        properties: {
          topic: { type: "string", description: "Topic or keyword to analyze gaps for" }
        },
        required: ["topic"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_topic_cluster",
      description: "Generate a topic cluster structure from a pillar topic with subtopics. Use when user says 'create topic cluster', 'build content hub', or 'generate subtopics'.",
      parameters: {
        type: "object",
        properties: {
          pillar_topic: { type: "string", description: "Main pillar topic" },
          subtopic_count: { type: "number", default: 8, description: "Number of subtopics to generate (default 8)" }
        },
        required: ["pillar_topic"]
      }
    }
  }
];

export const KEYWORD_ACTION_TOOL_NAMES = [
  'add_keywords', 'remove_keywords', 'trigger_serp_analysis',
  'trigger_content_gap_analysis', 'create_topic_cluster'
];

export async function executeKeywordActionTool(
  toolName: string, toolArgs: any, supabase: any, userId: string
): Promise<any> {
  console.log(`[KEYWORD-ACTION] ${toolName} | user: ${userId}`);

  try {
    switch (toolName) {
      case 'add_keywords': {
        const keywordsToInsert = (toolArgs.keywords || []).map((kw: any) => ({
          user_id: userId,
          keyword: kw.keyword,
          volume: kw.volume || null,
          difficulty: kw.difficulty || null
        }));

        if (keywordsToInsert.length === 0) {
          return { success: false, message: 'No keywords provided' };
        }

        const { data, error } = await supabase.from('keywords')
          .upsert(keywordsToInsert, { onConflict: 'user_id,keyword', ignoreDuplicates: true })
          .select('keyword, volume, difficulty');

        if (error) throw error;
        return {
          success: true,
          message: `Added ${data?.length || keywordsToInsert.length} keyword(s) to your library`,
          keywords: data || keywordsToInsert.map((k: any) => k.keyword)
        };
      }

      case 'remove_keywords': {
        let removed = 0;

        if (toolArgs.keyword_ids?.length) {
          const { error } = await supabase.from('keywords')
            .delete()
            .eq('user_id', userId)
            .in('id', toolArgs.keyword_ids);
          if (error) throw error;
          removed += toolArgs.keyword_ids.length;
        }

        if (toolArgs.keyword_names?.length) {
          for (const name of toolArgs.keyword_names) {
            const { error } = await supabase.from('keywords')
              .delete()
              .eq('user_id', userId)
              .ilike('keyword', name);
            if (!error) removed++;
          }
        }

        return { success: true, message: `Removed ${removed} keyword(s) from your library` };
      }

      case 'trigger_serp_analysis': {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
          return { success: false, message: 'SERP analysis service unavailable' };
        }

        // Check if user has a SERP API key configured
        const { getApiKey } = await import('../shared/apiKeyService.ts');
        const serpKey = await getApiKey('serp', userId);
        if (!serpKey) {
          return {
            success: false,
            message: '🔑 No SerpAPI key configured. Please go to **Settings → API Keys** and add your SerpAPI key to use SERP analysis.'
          };
        }

        // Call the serp-api edge function
        const response = await fetch(`${supabaseUrl}/functions/v1/serp-api`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            keyword: toolArgs.keyword,
            location: toolArgs.location || 'United States',
            userId
          })
        });

        if (!response.ok) {
          const errorText = await response.text();
          return { success: false, message: `SERP analysis failed: ${errorText}` };
        }

        const serpData = await response.json();
        return {
          success: true,
          message: `SERP analysis complete for "${toolArgs.keyword}"`,
          data: serpData
        };
      }

      case 'trigger_content_gap_analysis': {
        // Fetch existing content and keywords to find gaps
        const [contentResult, keywordResult] = await Promise.all([
          supabase.from('content_items')
            .select('title, main_keyword, content_type')
            .eq('user_id', userId)
            .limit(50),
          supabase.from('keywords')
            .select('keyword, volume, difficulty')
            .eq('user_id', userId)
            .limit(50)
        ]);

        const existingTopics = (contentResult.data || []).map((c: any) => c.main_keyword || c.title);
        const trackedKeywords = (keywordResult.data || []).map((k: any) => k.keyword);

        // Find keywords not covered by content
        const uncoveredKeywords = trackedKeywords.filter(
          (kw: string) => !existingTopics.some((t: string) => t?.toLowerCase().includes(kw.toLowerCase()))
        );

        return {
          success: true,
          message: `Content gap analysis for "${toolArgs.topic}"`,
          data: {
            topic: toolArgs.topic,
            totalContent: contentResult.data?.length || 0,
            totalKeywords: trackedKeywords.length,
            uncoveredKeywords,
            gapCount: uncoveredKeywords.length,
            recommendation: uncoveredKeywords.length > 0
              ? `Found ${uncoveredKeywords.length} keywords without matching content. Consider creating content for: ${uncoveredKeywords.slice(0, 5).join(', ')}`
              : 'Great coverage! All tracked keywords have matching content.'
          }
        };
      }

      case 'create_topic_cluster': {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        // Get user's AI provider
        const { data: provider } = await supabase.from('ai_service_providers')
          .select('api_key, provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!provider) {
          return { success: false, message: 'No AI provider configured. Go to Settings to add your API key.' };
        }

        const count = toolArgs.subtopic_count || 8;

        const proxyResponse = await fetch(`${supabaseUrl}/functions/v1/ai-proxy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            params: {
              provider: provider.provider,
              model: provider.preferred_model || 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: `Generate a topic cluster for content marketing. Return valid JSON only.`
                },
                {
                  role: 'user',
                  content: `Create a topic cluster with "${toolArgs.pillar_topic}" as the pillar topic. Generate ${count} subtopics. Return JSON: { "pillar": "topic", "subtopics": [{ "title": "...", "keyword": "...", "content_type": "blog", "search_intent": "informational|transactional|navigational" }] }`
                }
              ],
              maxTokens: 2000,
              userId
            }
          })
        });

        if (!proxyResponse.ok) {
          return { success: false, message: 'Failed to generate topic cluster. Check AI provider settings.' };
        }

        const aiResult = await proxyResponse.json();
        const rawContent = aiResult.content || aiResult.choices?.[0]?.message?.content || '';

        // Parse JSON from response
        let cluster;
        try {
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          cluster = jsonMatch ? JSON.parse(jsonMatch[0]) : { pillar: toolArgs.pillar_topic, subtopics: [] };
        } catch {
          cluster = { pillar: toolArgs.pillar_topic, subtopics: [], raw: rawContent };
        }

        return {
          success: true,
          message: `Generated topic cluster for "${toolArgs.pillar_topic}" with ${cluster.subtopics?.length || 0} subtopics`,
          data: cluster
        };
      }

      default:
        return { error: `Unknown keyword action tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[KEYWORD-ACTION] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
