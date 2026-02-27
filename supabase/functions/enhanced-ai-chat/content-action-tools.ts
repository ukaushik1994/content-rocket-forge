/**
 * Content Builder, Repository & Approval Action Tools
 * Write/Create/Update/Delete operations for content items
 */

export const CONTENT_ACTION_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "create_content_item",
      description: "Create a new content draft in the repository. Use when user says 'create content', 'write an article', 'draft a post', or 'add new content'.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Content title" },
          content: { type: "string", description: "Content body (HTML or markdown)" },
          content_type: { type: "string", enum: ["blog", "social-twitter", "social-linkedin", "social-facebook", "social-instagram", "script", "email", "glossary"], description: "Type of content" },
          main_keyword: { type: "string", description: "Primary keyword for the content" },
          secondary_keywords: { type: "array", items: { type: "string" }, description: "Secondary keywords" },
          status: { type: "string", enum: ["draft", "published"], default: "draft", description: "Initial status" },
          meta_title: { type: "string", description: "SEO meta title" },
          meta_description: { type: "string", description: "SEO meta description" },
          solution_id: { type: "string", description: "Link to a specific solution/offering" },
          campaign_id: { type: "string", description: "Link to a specific campaign" }
        },
        required: ["title", "content"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_content_item",
      description: "Update an existing content item's title, content, status, or metadata. Use when user says 'update content', 'edit article', 'change status', or 'modify content'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item to update" },
          title: { type: "string", description: "New title" },
          content: { type: "string", description: "New content body" },
          status: { type: "string", enum: ["draft", "published", "archived"], description: "New status" },
          content_type: { type: "string", description: "New content type" },
          meta_title: { type: "string", description: "New SEO meta title" },
          meta_description: { type: "string", description: "New SEO meta description" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_content_item",
      description: "Archive (soft delete) a content item. Use when user says 'delete content', 'remove article', or 'archive content'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item to archive" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "submit_for_review",
      description: "Submit a content item for approval review. Use when user says 'submit for review', 'send for approval', or 'request review'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item" },
          notes: { type: "string", description: "Optional notes for the reviewer" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "approve_content",
      description: "Approve a content item that's pending review. Use when user says 'approve content', 'accept this article', or 'mark as approved'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item" },
          notes: { type: "string", description: "Approval notes" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reject_content",
      description: "Reject a content item or request changes. Use when user says 'reject content', 'needs changes', or 'request revisions'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item" },
          notes: { type: "string", description: "Rejection reason or change requests" },
          action: { type: "string", enum: ["reject", "request_changes"], default: "request_changes", description: "Whether to fully reject or request changes" }
        },
        required: ["content_id", "notes"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "generate_full_content",
      description: "Generate a complete article end-to-end from a keyword. Creates full content and saves to repository as draft. Use when user says 'generate an article about X', 'write a blog post on X', or 'create full content for keyword X'.",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Primary keyword/topic for the article" },
          content_type: { type: "string", enum: ["blog", "social-twitter", "social-linkedin", "email", "glossary"], default: "blog", description: "Type of content to generate" },
          tone: { type: "string", enum: ["professional", "casual", "technical", "persuasive", "educational"], default: "professional", description: "Writing tone" },
          length: { type: "string", enum: ["short", "medium", "long"], default: "medium", description: "Content length (short ~500 words, medium ~1000, long ~2000)" },
          solution_id: { type: "string", description: "Optional solution to tie the content to" },
          additional_instructions: { type: "string", description: "Any extra instructions for the AI writer" }
        },
        required: ["keyword"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "start_content_builder",
      description: "Open the Content Builder with pre-filled data for the user to refine. Use when user wants guided content creation with SERP analysis, outline editing, etc. Returns navigation action.",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "Pre-fill keyword in the builder" },
          solution_id: { type: "string", description: "Pre-select a solution" },
          suggested_title: { type: "string", description: "Suggested title to pre-fill" }
        },
        required: ["keyword"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "launch_content_wizard",
      description: "Launch the interactive content creation wizard. The 'keyword' parameter is REQUIRED and must be a specific subject matter topic. Common words like 'post', 'blog', 'blog post', 'article', 'content', 'piece', 'write' are NOT valid keywords — these are format descriptors, not topics. A valid keyword is a specific subject (e.g. 'AI in healthcare', 'email marketing', 'best running shoes'). If the user has NOT specified a clear topic (e.g. they just say 'create a blog' or 'write a post'), you MUST ask them: 'What topic or keyword would you like to write about?' BEFORE calling this tool. Never call with a generic or format-only keyword.",
      parameters: {
        type: "object",
        properties: {
          keyword: { type: "string", description: "The specific subject matter topic the user wants to write about. Must be a real topic (e.g. 'AI in healthcare'), NOT a format word like 'post' or 'blog'. REQUIRED - never leave empty or generic." },
          solution_id: { type: "string", description: "Optional solution ID to pre-select" },
          content_type: { type: "string", enum: ["blog", "article", "guide"], default: "blog", description: "Type of content to create" }
        },
        required: ["keyword"]
      }
    }
  }
];

export const CONTENT_ACTION_TOOL_NAMES = [
  'create_content_item', 'update_content_item', 'delete_content_item',
  'submit_for_review', 'approve_content', 'reject_content',
  'generate_full_content', 'start_content_builder', 'launch_content_wizard'
];

export async function executeContentActionTool(
  toolName: string, toolArgs: any, supabase: any, userId: string
): Promise<any> {
  console.log(`[CONTENT-ACTION] ${toolName} | user: ${userId}`);

  try {
    switch (toolName) {
      case 'create_content_item': {
        const { data, error } = await supabase.from('content_items').insert({
          user_id: userId,
          title: toolArgs.title,
          content: toolArgs.content || '',
          content_type: toolArgs.content_type || 'blog',
          main_keyword: toolArgs.main_keyword || '',
          secondary_keywords: toolArgs.secondary_keywords || [],
          status: toolArgs.status || 'draft',
          meta_title: toolArgs.meta_title || null,
          meta_description: toolArgs.meta_description || null,
          solution_id: toolArgs.solution_id || null,
          campaign_id: toolArgs.campaign_id || null,
          metadata: {}
        }).select('id, title, status, content_type, created_at').single();

        if (error) throw error;
        return { success: true, message: `Created "${data.title}" as ${data.status}`, item: data };
      }

      case 'update_content_item': {
        const updates: any = {};
        if (toolArgs.title) updates.title = toolArgs.title;
        if (toolArgs.content) updates.content = toolArgs.content;
        if (toolArgs.status) updates.status = toolArgs.status;
        if (toolArgs.content_type) updates.content_type = toolArgs.content_type;
        if (toolArgs.meta_title !== undefined) updates.meta_title = toolArgs.meta_title;
        if (toolArgs.meta_description !== undefined) updates.meta_description = toolArgs.meta_description;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('content_items')
          .update(updates)
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title, status, content_type, updated_at')
          .single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Content not found or access denied' };
        return { success: true, message: `Updated "${data.title}"`, item: data };
      }

      case 'delete_content_item': {
        const { data, error } = await supabase.from('content_items')
          .update({ status: 'archived', updated_at: new Date().toISOString() })
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Content not found or access denied' };
        return { success: true, message: `Archived "${data.title}"` };
      }

      case 'submit_for_review': {
        const { data, error } = await supabase.from('content_items')
          .update({ approval_status: 'pending_review', submitted_for_review_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Content not found or access denied' };
        return { success: true, message: `Submitted "${data.title}" for review` };
      }

      case 'approve_content': {
        const { data, error } = await supabase.from('content_items')
          .update({ approval_status: 'approved', updated_at: new Date().toISOString() })
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Content not found or access denied' };

        // Log approval
        await supabase.from('approval_history').insert({
          content_id: toolArgs.content_id,
          user_id: userId,
          action: 'approved',
          from_status: 'pending_review',
          to_status: 'approved',
          notes: toolArgs.notes || 'Approved via AI Chat'
        });

        return { success: true, message: `Approved "${data.title}"` };
      }

      case 'reject_content': {
        const newStatus = toolArgs.action === 'reject' ? 'rejected' : 'needs_changes';
        const { data, error } = await supabase.from('content_items')
          .update({ approval_status: newStatus, updated_at: new Date().toISOString() })
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Content not found or access denied' };

        await supabase.from('approval_history').insert({
          content_id: toolArgs.content_id,
          user_id: userId,
          action: newStatus === 'rejected' ? 'rejected' : 'requested_changes',
          from_status: 'pending_review',
          to_status: newStatus,
          notes: toolArgs.notes
        });

        return { success: true, message: `${newStatus === 'rejected' ? 'Rejected' : 'Requested changes for'} "${data.title}"` };
      }

      case 'generate_full_content': {
        const lengthMap: Record<string, number> = { short: 500, medium: 1000, long: 2000 };
        const targetWords = lengthMap[toolArgs.length || 'medium'];

        // Call ai-proxy for content generation
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

        // Generate content via ai-proxy
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
                  content: `You are an expert content writer. Write a ${toolArgs.content_type || 'blog'} article. Tone: ${toolArgs.tone || 'professional'}. Target length: ~${targetWords} words. Output clean HTML content with proper headings (h2, h3), paragraphs, and lists. Do NOT include meta information or JSON - just the article content.`
                },
                {
                  role: 'user',
                  content: `Write a comprehensive ${toolArgs.content_type || 'blog post'} about "${toolArgs.keyword}".${toolArgs.additional_instructions ? ` Additional instructions: ${toolArgs.additional_instructions}` : ''}`
                }
              ],
              maxTokens: targetWords * 3,
              userId
            }
          })
        });

        if (!proxyResponse.ok) {
          return { success: false, message: 'Failed to generate content. Check your AI provider settings.' };
        }

        const aiResult = await proxyResponse.json();
        const generatedContent = aiResult.content || aiResult.choices?.[0]?.message?.content || '';

        if (!generatedContent) {
          return { success: false, message: 'AI returned empty content. Try again or adjust your request.' };
        }

        // Extract title from first H1/H2 or use keyword
        const titleMatch = generatedContent.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        const autoTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : `${toolArgs.keyword} - ${toolArgs.content_type || 'Blog Post'}`;

        // Save to content_items
        const { data: saved, error: saveError } = await supabase.from('content_items').insert({
          user_id: userId,
          title: autoTitle,
          content: generatedContent,
          content_type: toolArgs.content_type || 'blog',
          main_keyword: toolArgs.keyword,
          secondary_keywords: [],
          status: 'draft',
          metadata: { generated_via: 'ai_chat', keyword: toolArgs.keyword, tone: toolArgs.tone, length: toolArgs.length },
          solution_id: toolArgs.solution_id || null
        }).select('id, title, status, content_type, created_at').single();

        if (saveError) throw saveError;

        const wordCount = generatedContent.split(/\s+/).length;
        return {
          success: true,
          message: `Generated and saved "${saved.title}" (~${wordCount} words) as draft`,
          item: saved,
          wordCount
        };
      }

      case 'start_content_builder': {
        return {
          success: true,
          message: `Opening Content Builder with keyword "${toolArgs.keyword}"`,
          action: {
            type: 'navigate',
            url: '/content-builder',
            payload: {
              keyword: toolArgs.keyword,
              solution_id: toolArgs.solution_id,
              suggested_title: toolArgs.suggested_title
            }
          }
        };
      }

      case 'launch_content_wizard': {
        return {
          success: true,
          message: `Ready to create content about "${toolArgs.keyword}". Choose how you'd like to proceed.`,
          visualData: {
            type: 'content_creation_choice',
            keyword: toolArgs.keyword,
            solution_id: toolArgs.solution_id || null,
            content_type: toolArgs.content_type || 'blog'
          }
        };
      }

      default:
        return { error: `Unknown content action tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[CONTENT-ACTION] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
