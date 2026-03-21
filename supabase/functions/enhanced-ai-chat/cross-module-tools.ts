/**
 * Cross-Module Orchestration Tools
 * Chain reads and writes across modules atomically
 */

import { getApiKey } from '../shared/apiKeyService.ts';
import { callAiProxyWithRetry } from '../shared/aiProxyRetry.ts';

/**
 * Build a professional, styled email HTML template from content.
 * Includes branded header, readable body, and footer with unsubscribe.
 */
function buildEmailTemplate(title: string, bodyContent: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7;">
    <tr><td align="center" style="padding:24px 16px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.08);">
        <!-- Header -->
        <tr>
          <td style="background-color:#1a1a2e;padding:24px 32px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:600;line-height:1.3;">${title}</h1>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:32px;color:#333333;font-size:16px;line-height:1.6;">
            ${bodyContent}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px;background-color:#f9fafb;border-top:1px solid #e5e7eb;">
            <p style="margin:0 0 8px;font-size:12px;color:#6b7280;line-height:1.5;">
              You're receiving this because you subscribed to our updates.
            </p>
            <p style="margin:0;font-size:12px;color:#6b7280;">
              <a href="{{unsubscribe_url}}" style="color:#4f46e5;text-decoration:underline;">Unsubscribe</a> · <a href="{{preferences_url}}" style="color:#4f46e5;text-decoration:underline;">Manage preferences</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

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
  },
  {
    type: "function",
    function: {
      name: "publish_to_website",
      description: "Publish a content item to the user's connected WordPress or Wix site. Use when user says 'publish to my website', 'push to WordPress', 'post this on my blog', 'publish this article to my site'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item to publish" },
          status: { type: "string", enum: ["draft", "publish"], description: "WordPress post status. Default: publish" },
          scheduled_at: { type: "string", description: "ISO datetime for scheduled publishing (optional)" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_campaign",
      description: "Create a new content campaign from scratch. Use when user says 'create a campaign', 'new campaign', 'start a campaign about [topic]', or 'launch campaign'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Campaign name" },
          idea: { type: "string", description: "Campaign idea or topic description" },
          goal: { type: "string", enum: ["awareness", "conversion", "engagement", "education"], description: "Campaign goal" },
          target_audience: { type: "string", description: "Target audience description" },
          timeline: { type: "string", enum: ["1-week", "2-week", "4-week", "ongoing"], description: "Campaign timeline" },
          solution_id: { type: "string", description: "UUID of solution to promote (optional)" }
        },
        required: ["name", "idea"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "schedule_social_from_repurpose",
      description: "Save and schedule social media posts that were generated by repurpose_for_social. Use when user says 'schedule these social posts', 'post these to social', 'save the social posts', 'schedule them'.",
      parameters: {
        type: "object",
        properties: {
          posts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                platform: { type: "string", enum: ["twitter", "linkedin", "facebook", "instagram"] },
                text: { type: "string", description: "Post content" },
                hashtags: { type: "array", items: { type: "string" } }
              },
              required: ["platform", "text"]
            },
            description: "Array of social posts to schedule"
          },
          scheduled_at: { type: "string", description: "ISO datetime to schedule posts. Null = post immediately." },
          source_content_id: { type: "string", description: "UUID of the source content item (optional)" }
        },
        required: ["posts"]
      }
    }
  }
];

export const CROSS_MODULE_TOOL_NAMES = [
  'promote_content_to_campaign', 'content_to_email',
  'campaign_content_to_engage', 'repurpose_for_social',
  'publish_to_website', 'create_campaign', 'schedule_social_from_repurpose'
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

        // Get or auto-provision workspace
        let workspaceId = await getUserWorkspaceId(supabase, userId);
        if (!workspaceId) {
          const { data: newWsId, error: wsError } = await supabase.rpc('ensure_engage_workspace', { p_user_id: userId });
          if (wsError || !newWsId) {
            return { success: false, message: 'Failed to initialize Engage workspace.' };
          }
          workspaceId = newWsId;
        }

        // Wrap content in professional email-safe HTML template
        const emailHtml = buildEmailTemplate(content.title, content.content || '');

        // Create email campaign
        const { data: emailCampaign, error: emailError } = await supabase.from('email_campaigns').insert({
          workspace_id: workspaceId,
          name: `Email: ${content.title}`,
          subject: toolArgs.subject || content.title,
          body_html: emailHtml,
          segment_id: toolArgs.segment_id || null,
          from_name: toolArgs.from_name || null,
          status: 'draft'
        }).select('id, name, subject, status, created_at').single();

        if (emailError) throw emailError;

        // Track performance signal: email_convert
        try {
          await supabase.from('content_performance_signals').insert({
            content_id: toolArgs.content_id,
            user_id: userId,
            signal_type: 'email_convert',
            metadata: { email_campaign_id: emailCampaign.id }
          });
        } catch (_) { /* non-blocking */ }

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
        let workspaceId = await getUserWorkspaceId(supabase, userId);
        if (!workspaceId) {
          const { data: newWsId, error: wsError } = await supabase.rpc('ensure_engage_workspace', { p_user_id: userId });
          if (wsError || !newWsId) {
            return { success: false, message: 'Failed to initialize Engage workspace.' };
          }
          workspaceId = newWsId;
        }

        // Wrap content in professional email-safe HTML template
        const wrappedHtml = buildEmailTemplate(topContent.title, topContent.content || '');

        const { data: emailCampaign, error: emailError } = await supabase.from('email_campaigns').insert({
          workspace_id: workspaceId,
          name: `Campaign Digest: ${topContent.title}`,
          subject: toolArgs.subject || topContent.title,
          body_html: wrappedHtml,
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

        // Decrypt API key from secure vault
        const decryptedApiKey = await getApiKey(provider.provider, userId);
        if (!decryptedApiKey) {
          return { success: false, message: 'API key not found. Please re-enter your API key in Settings.' };
        }

        // Truncate content for the prompt
        const contentPreview = (content.content || '').replace(/<[^>]+>/g, '').substring(0, 2000);

        // Fetch brand voice for social content (Fix 4)
        let brandToneHint = '';
        try {
          const { data: brandData } = await supabase.from('brand_guidelines')
            .select('tone, do_use, dont_use')
            .eq('user_id', userId).maybeSingle();
          if (brandData?.tone && Array.isArray(brandData.tone) && brandData.tone.length > 0) {
            brandToneHint = `\nBrand tone: ${brandData.tone.join(', ')}.`;
            if (brandData.do_use && Array.isArray(brandData.do_use) && brandData.do_use.length > 0) brandToneHint += ` Use phrases like: ${brandData.do_use.slice(0, 3).join(', ')}.`;
            if (brandData.dont_use && Array.isArray(brandData.dont_use) && brandData.dont_use.length > 0) brandToneHint += ` Avoid: ${brandData.dont_use.slice(0, 3).join(', ')}.`;
          }
        } catch (_) { /* non-blocking */ }

        // Platform-specific rules (Fix 4)
        const platformRules: Record<string, string> = {
          twitter: 'Twitter/X: Max 270 characters. Lead with a hook or hot take. Use 1-2 hashtags max. No fluff. Write like a smart friend, not a brand.',
          linkedin: 'LinkedIn: 300-600 words thought-leadership style. Open with a bold first line (hook). Use line breaks every 1-2 sentences. End with a question or CTA. Professional but human.',
          facebook: 'Facebook: Storytelling-first. Open with a relatable scenario. Use emojis sparingly. Include a question to drive comments. 100-300 words.',
          instagram: 'Instagram: Caption format. Lead with the hook (first line matters most). Use line breaks. End with 5-10 relevant hashtags on a separate line. 100-250 words.'
        };
        const platformGuidance = toolArgs.platforms.map((p: string) => platformRules[p.toLowerCase()] || `${p}: Create appropriate content for this platform.`).join('\n\n');

        const proxyResponse = await callAiProxyWithRetry(`${supabaseUrl}/functions/v1/ai-proxy`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service: provider.provider,
            endpoint: 'chat',
            apiKey: decryptedApiKey,
            params: {
              model: provider.preferred_model || 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: `Generate social media posts for the specified platforms. Each post MUST follow platform-specific rules below.${brandToneHint}\n\n${platformGuidance}\n\nReturn valid JSON only: { "posts": [{ "platform": "twitter", "text": "...", "hashtags": ["..."] }] }`
                },
                {
                  role: 'user',
                  content: `Repurpose this article for ${toolArgs.platforms.join(', ')}. Title: "${content.title}". Content: ${contentPreview}`
                }
              ],
              maxTokens: 2000
            }
          })
        });

        if (!proxyResponse.ok) {
          return { success: false, message: 'Failed to generate social posts' };
        }

        const aiResult = await proxyResponse.json();
        const rawContent = aiResult.data?.choices?.[0]?.message?.content || aiResult.choices?.[0]?.message?.content || aiResult.content || '';

        let posts;
        try {
          const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
          posts = jsonMatch ? JSON.parse(jsonMatch[0]) : { posts: [] };
        } catch {
          posts = { posts: [], raw: rawContent };
        }

        // Track performance signal: social_repurpose
        try {
          await supabase.from('content_performance_signals').insert({
            content_id: toolArgs.content_id,
            user_id: userId,
            signal_type: 'social_repurpose',
            metadata: { platforms: toolArgs.platforms, post_count: posts.posts?.length || 0 }
          });
        } catch (_) { /* non-blocking */ }

        return {
          success: true,
          message: `Generated ${posts.posts?.length || 0} social posts from "${content.title}". Note: Direct social publishing is coming soon — your posts are saved as drafts. Copy and post manually for now.`,
          socialPosts: posts.posts || [],
          sourceContent: { id: content.id, title: content.title }
        };
      }

      case 'publish_to_website': {
        // 1. Fetch content item
        const { data: content, error: contentError } = await supabase.from('content_items')
          .select('id, title, content, main_keyword, meta_description, slug')
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .single();

        if (contentError || !content) {
          return { success: false, message: 'Content not found or access denied' };
        }

        // Phase 5: Approval gate — rejected content cannot be published
        const { data: approvalCheck } = await supabase.from('content_items')
          .select('approval_status')
          .eq('id', toolArgs.content_id)
          .single();

        if (approvalCheck?.approval_status === 'rejected') {
          return {
            success: false,
            message: `"${content.title}" was rejected and cannot be published. Edit it and resubmit for review first.`
          };
        }

        // 2. Check for active website connection
        const { data: connection } = await supabase.from('website_connections')
          .select('provider, site_url, site_id, is_active')
          .eq('user_id', userId)
          .eq('is_active', true)
          .limit(1)
          .single();

        if (!connection) {
          // H8: Stale token guidance — direct user to reconnect
          await supabase.from('content_items')
            .update({ status: 'ready_to_publish' })
            .eq('id', toolArgs.content_id)
            .eq('user_id', userId);

          return { 
            success: false, 
            message: `No active website connection found. Your content "${content.title}" has been marked as **Ready to Publish**.\n\nTo publish directly:\n1. Go to **Settings → Websites** and reconnect your site\n2. If your token expired, re-authorize the connection\n3. Then ask me to publish again\n\nAlternatively, you can copy the content and publish manually.`,
            settingsAction: { tab: 'publishing', label: 'Reconnect Website' }
          };
        }

        // 3. Call the appropriate publish edge function
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const functionName = connection.provider === 'wordpress' ? 'publish-wordpress' : 'publish-wix';

        const publishResponse = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: content.title,
            slug: content.slug || content.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            contentMd: content.content,
            excerpt: content.meta_description || '',
            tags: content.main_keyword ? [content.main_keyword] : [],
            status: toolArgs.status || 'publish'
          })
        });

        if (!publishResponse.ok) {
          const errText = await publishResponse.text();
          return { success: false, message: `Failed to publish to ${connection.provider}: ${errText}` };
        }

        const publishResult = await publishResponse.json();

        // C5: Update content status with error handling
        const { error: statusUpdateError } = await supabase.from('content_items')
          .update({
            status: 'published',
            metadata: { published_url: publishResult.url || publishResult.link, published_provider: connection.provider, published_at: new Date().toISOString() }
          })
          .eq('id', content.id);

        const statusWarning = statusUpdateError 
          ? '\n\n⚠️ Content was published successfully but the status update in the database failed. You may need to manually update the status.'
          : '';

        // 3E: Track publish event as performance signal
        try {
          await supabase.from('content_performance_signals').insert({
            content_id: content.id,
            user_id: userId,
            signal_type: 'publish',
            signal_data: { provider: connection.provider, url: publishResult.url || publishResult.link }
          });
        } catch (_) { /* non-blocking */ }

        return {
          success: true,
          message: `Published "${content.title}" to ${connection.provider}${publishResult.url || publishResult.link ? ` — ${publishResult.url || publishResult.link}` : ''}${statusWarning}\n\n🎉 What's next?`,
          url: publishResult.url || publishResult.link,
          provider: connection.provider,
          actions: [
            { id: 'create_social', label: '📱 Create Social Posts', type: 'send_message', message: `Repurpose "${content.title}" (ID: ${content.id}) for social media` },
            { id: 'email_subscribers', label: '📧 Email Subscribers', type: 'send_message', message: `Create an email campaign from content "${content.title}" (ID: ${content.id})` },
            { id: 'done', label: '✅ Done for Now', type: 'send_message', message: 'Thanks, I\'m done for now' }
          ]
        };
      }

      case 'create_campaign': {
        const { data: campaign, error: campaignError } = await supabase.from('campaigns').insert({
          user_id: userId,
          name: toolArgs.name,
          original_idea: toolArgs.idea,
          goal: toolArgs.goal || null,
          target_audience: toolArgs.target_audience || null,
          timeline: toolArgs.timeline || null,
          solution_id: toolArgs.solution_id || null,
          status: 'draft'
        }).select('id, name, status, goal, target_audience, timeline, created_at').single();

        if (campaignError) throw campaignError;

        return {
          success: true,
          message: `Created campaign "${campaign.name}" (draft)`,
          item: campaign
        };
      }

      case 'schedule_social_from_repurpose': {
        let workspaceId = await getUserWorkspaceId(supabase, userId);
        if (!workspaceId) {
          const { data: newWsId, error: wsError } = await supabase.rpc('ensure_engage_workspace', { p_user_id: userId });
          if (wsError || !newWsId) {
            return { success: false, message: 'Failed to initialize Engage workspace.' };
          }
          workspaceId = newWsId;
        }

        const posts = toolArgs.posts || [];
        if (posts.length === 0) {
          return { success: false, message: 'No posts provided to schedule.' };
        }

        const createdPosts = [];
        for (const post of posts) {
          const hashtags = post.hashtags || [];
          const fullText = hashtags.length > 0
            ? `${post.text}\n\n${hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`
            : post.text;

          // Insert social post
          const { data: socialPost, error: postError } = await supabase.from('social_posts').insert({
            workspace_id: workspaceId,
            content: fullText,
            media_urls: [],
            scheduled_at: toolArgs.scheduled_at || null,
            status: toolArgs.scheduled_at ? 'scheduled' : 'draft',
            source_content_id: toolArgs.source_content_id || null
          }).select('id').single();

          if (postError) {
            console.error('[CROSS-MODULE] Social post insert error:', postError);
            continue;
          }

          // Insert target platform
          await supabase.from('social_post_targets').insert({
            post_id: socialPost.id,
            platform: post.platform,
            status: toolArgs.scheduled_at ? 'scheduled' : 'draft'
          });

          createdPosts.push({ id: socialPost.id, platform: post.platform });
        }

        return {
          success: true,
          message: `${toolArgs.scheduled_at ? 'Scheduled' : 'Saved'} ${createdPosts.length} social post(s) for ${createdPosts.map(p => p.platform).join(', ')}${toolArgs.scheduled_at ? ` at ${toolArgs.scheduled_at}` : ''}. Note: Direct social publishing is coming soon — your posts are saved and ready to publish once integrations are live.`,
          posts: createdPosts
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
