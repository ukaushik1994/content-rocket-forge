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
  }
];

export const BRAND_ANALYTICS_TOOL_NAMES = [
  'get_brand_voice',
  'update_brand_voice',
  'get_content_performance'
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

    default:
      throw new Error(`Unknown brand/analytics tool: ${toolName}`);
  }
}
