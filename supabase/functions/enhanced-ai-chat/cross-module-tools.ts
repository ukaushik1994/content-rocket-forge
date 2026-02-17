/**
 * Cross-Module Orchestration Tools
 * Chain reads and writes across modules atomically
 */

export const CROSS_MODULE_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "promote_content_to_campaign",
      description: "Take an existing content item and create a new campaign around it. Use when user says 'turn this content into a campaign', 'promote article', or 'create campaign from content'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item to promote" },
          campaign_name: { type: "string", description: "Name for the new campaign" },
          objective: { type: "string", description: "Campaign objective" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "content_to_email",
      description: "Take content from the repository and create an email campaign from it. Use when user says 'email this content', 'send article as email', or 'create email from content'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item" },
          segment_id: { type: "string", description: "Target segment for the email" },
          subject: { type: "string", description: "Custom email subject (auto-generated from title if empty)" },
          from_name: { type: "string", description: "Sender name" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "campaign_content_to_engage",
      description: "Find content from a campaign and create an Engage email campaign from it. Use when user says 'email campaign content to contacts', 'send campaign results to audience'.",
      parameters: {
        type: "object",
        properties: {
          campaign_id: { type: "string", description: "UUID of the content campaign" },
          segment_id: { type: "string", description: "Target segment for the email" },
          subject: { type: "string", description: "Custom email subject" }
        },
        required: ["campaign_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "repurpose_for_social",
      description: "Take content and generate social media posts for specified platforms. Use when user says 'repurpose for social', 'create social posts from article', or 'share content on social media'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item to repurpose" },
          platforms: { type: "array", items: { type: "string", enum: ["twitter", "linkedin", "facebook", "instagram"] }, description: "Target social platforms" }
        },
        required: ["content_id", "platforms"]
      }
    }
  }
];

export const CROSS_MODULE_TOOL_NAMES = [
  'promote_content_to_campaign', 'content_to_email',
  'campaign_content_to_engage', 'repurpose_for_social'
];

async function getUserWorkspaceId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase.from('team_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1).single();
  return data?.workspace_id || null;
}

export async function executeCrossModuleTool(
  toolName: string, toolArgs: any, supabase: any, userId: string
): Promise<any> {
  console.log(`[CROSS-MODULE] ${toolName} | user: ${userId}`);

  try {
    switch (toolName) {
      case 'promote_content_to_campaign': {
        // Get content item
        const { data: content, error: contentError } = await supabase.from('content_items')
          .select('id, title, content, content_type, main_keyword, solution_id')
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .single();

        if (contentError || !content) {
          return { success: false, message: 'Content not found or access denied' };
        }

        // Create campaign
        const { data: campaign, error: campaignError } = await supabase.from('campaigns').insert({
          user_id: userId,
          name: toolArgs.campaign_name || `Campaign: ${content.title}`,
          original_idea: `Promoted from content: ${content.title}`,
          objective: toolArgs.objective || `Promote "${content.title}" across channels`,
          solution_id: content.solution_id || null,
          status: 'draft'
        }).select('id, name, status, created_at').single();

        if (campaignError) throw campaignError;

        // Link content to campaign
        await supabase.from('content_items')
          .update({ campaign_id: campaign.id })
          .eq('id', content.id);

        return {
          success: true,
          message: `Created campaign "${campaign.name}" from content "${content.title}"`,
          campaign,
          contentLinked: content.id
        };
      }

      case 'content_to_email': {
        // Get content
        const { data: content, error: contentError } = await supabase.from('content_items')
          .select('id, title, content, content_type')
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .single();

        if (contentError || !content) {
          return { success: false, message: 'Content not found or access denied' };
        }

        // Get workspace
        const workspaceId = await getUserWorkspaceId(supabase, userId);
        if (!workspaceId) {
          return { success: false, message: 'No Engage workspace found. Visit the Engage module first.' };
        }

        // Create email campaign
        const { data: emailCampaign, error: emailError } = await supabase.from('engage_email_campaigns').insert({
          workspace_id: workspaceId,
          name: `Email: ${content.title}`,
          subject: toolArgs.subject || content.title,
          body_html: content.content,
          segment_id: toolArgs.segment_id || null,
          from_name: toolArgs.from_name || null,
          status: 'draft'
        }).select('id, name, subject, status, created_at').single();

        if (emailError) throw emailError;

        return {
          success: true,
          message: `Created email campaign "${emailCampaign.name}" from content "${content.title}"`,
          emailCampaign,
          sourceContent: { id: content.id, title: content.title }
        };
      }

      case 'campaign_content_to_engage': {
        // Get campaign's best content
        const { data: items, error: itemsError } = await supabase.from('content_items')
          .select('id, title, content, seo_score')
          .eq('campaign_id', toolArgs.campaign_id)
          .eq('user_id', userId)
          .order('seo_score', { ascending: false })
          .limit(1);

        if (itemsError || !items?.length) {
          return { success: false, message: 'No content found for this campaign' };
        }

        const topContent = items[0];
        const workspaceId = await getUserWorkspaceId(supabase, userId);
        if (!workspaceId) {
          return { success: false, message: 'No Engage workspace found.' };
        }

        const { data: emailCampaign, error: emailError } = await supabase.from('engage_email_campaigns').insert({
          workspace_id: workspaceId,
          name: `Campaign Digest: ${topContent.title}`,
          subject: toolArgs.subject || topContent.title,
          body_html: topContent.content,
          segment_id: toolArgs.segment_id || null,
          status: 'draft'
        }).select('id, name, subject, status').single();

        if (emailError) throw emailError;

        return {
          success: true,
          message: `Created email from campaign's top content "${topContent.title}"`,
          emailCampaign,
          sourceContent: topContent
        };
      }

      case 'repurpose_for_social': {
        // Get content
        const { data: content, error: contentError } = await supabase.from('content_items')
          .select('id, title, content, main_keyword')
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .single();

        if (contentError || !content) {
          return { success: false, message: 'Content not found or access denied' };
        }

        // Call ai-proxy to generate social posts
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        const { data: provider } = await supabase.from('ai_service_providers')
          .select('provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!provider) {
          return { success: false, message: 'No AI provider configured.' };
        }

        // Truncate content for the prompt
        const contentPreview = (content.content || '').replace(/<[^>]+>/g, '').substring(0, 2000);

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
                  content: `Generate social media posts for the specified platforms. Return valid JSON only: { "posts": [{ "platform": "twitter", "text": "...", "hashtags": ["..."] }] }`
                },
                {
                  role: 'user',
                  content: `Repurpose this article for ${toolArgs.platforms.join(', ')}. Title: "${content.title}". Content: ${contentPreview}`
                }
              ],
              maxTokens: 1500,
              userId
            }
          })
        });

        if (!proxyResponse.ok) {
          return { success: false, message: 'Failed to generate social posts' };
        }

        const aiResult = await proxyResponse.json();
        const rawContent = aiResult.content || aiResult.choices?.[0]?.message?.content || '';

        let posts;
        try {
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          posts = jsonMatch ? JSON.parse(jsonMatch[0]) : { posts: [] };
        } catch {
          posts = { posts: [], raw: rawContent };
        }

        return {
          success: true,
          message: `Generated ${posts.posts?.length || 0} social posts from "${content.title}"`,
          socialPosts: posts.posts || [],
          sourceContent: { id: content.id, title: content.title }
        };
      }

      default:
        return { error: `Unknown cross-module tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[CROSS-MODULE] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
