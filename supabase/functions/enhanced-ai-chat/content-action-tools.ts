/**
 * Content Builder, Repository & Approval Action Tools
 * Write/Create/Update/Delete operations for content items
 */

// Inline SEO score calculator for auto-scoring on content creation
function calculateBasicSeoScore(content: string, keyword: string, metaTitle?: string, metaDescription?: string): number {
  if (!content) return 0;
  let score = 0;
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword?.toLowerCase() || '';

  // Content length (max 25 pts)
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 1500) score += 25;
  else if (wordCount >= 800) score += 20;
  else if (wordCount >= 400) score += 15;
  else if (wordCount >= 200) score += 10;
  else score += 5;

  // Keyword presence (max 25 pts)
  if (lowerKeyword) {
    const keywordCount = (lowerContent.match(new RegExp(lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')) || []).length;
    const density = keywordCount / Math.max(wordCount, 1) * 100;
    if (density >= 0.5 && density <= 3) score += 25;
    else if (density > 0 && density < 0.5) score += 15;
    else if (density > 3) score += 10;
  }

  // Heading structure (max 20 pts)
  const hasH1 = /<h1/i.test(content) || /^#\s/m.test(content);
  const hasH2 = /<h2/i.test(content) || /^##\s/m.test(content);
  const h2Count = (content.match(/<h2/gi) || content.match(/^##\s/gm) || []).length;
  if (hasH1) score += 5;
  if (hasH2) score += 5;
  if (h2Count >= 3) score += 10;
  else if (h2Count >= 1) score += 5;

  // Meta tags (max 15 pts)
  if (metaTitle && metaTitle.length >= 30 && metaTitle.length <= 60) score += 8;
  else if (metaTitle) score += 4;
  if (metaDescription && metaDescription.length >= 120 && metaDescription.length <= 160) score += 7;
  else if (metaDescription) score += 3;

  // Keyword in title/meta (max 15 pts)
  if (lowerKeyword) {
    if (metaTitle?.toLowerCase().includes(lowerKeyword)) score += 8;
    if (metaDescription?.toLowerCase().includes(lowerKeyword)) score += 7;
  }

  return Math.min(score, 100);
}

// Save SEO score to seo_content_scores table and update content_items.seo_score
async function saveAutoSeoScore(supabase: any, userId: string, contentId: string, score: number, keyword: string) {
  try {
    // Update seo_score on content_items
    await supabase.from('content_items')
      .update({ seo_score: score })
      .eq('id', contentId)
      .eq('user_id', userId);

    // Also insert into seo_content_scores for detailed tracking
    await supabase.from('seo_content_scores').upsert({
      user_id: userId,
      content_id: contentId,
      overall_score: score,
      keyword_score: Math.round(score * 0.4),
      readability_score: Math.round(score * 0.3),
      structure_score: Math.round(score * 0.3),
      main_keyword: keyword || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }, { onConflict: 'content_id' });
  } catch (err) {
    console.error('Auto SEO score save failed (non-blocking):', err);
  }
}

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
          content_type: { type: "string", enum: ["blog", "social-twitter", "social-linkedin", "social-facebook", "social-instagram", "script", "email"], description: "Type of content" },
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
          content_type: { type: "string", enum: ["blog", "social-twitter", "social-linkedin", "email"], default: "blog", description: "Type of content to generate" },
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
  },
  // === CALENDAR CRUD TOOLS ===
  {
    type: "function",
    function: {
      name: "create_calendar_item",
      description: "Schedule content on the editorial calendar. Use when user says 'schedule content', 'add to calendar', 'plan for next week', or 'put on the calendar'.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Calendar item title" },
          scheduled_date: { type: "string", description: "Scheduled date (ISO format, e.g., 2026-03-15)" },
          content_type: { type: "string", default: "blog", description: "Content type" },
          status: { type: "string", enum: ["planned", "in_progress", "completed"], default: "planned", description: "Status" },
          priority: { type: "string", enum: ["low", "medium", "high"], default: "medium", description: "Priority level" },
          notes: { type: "string", description: "Additional notes" },
          proposal_id: { type: "string", description: "Link to a strategy proposal" },
          content_id: { type: "string", description: "Link to existing content item" }
        },
        required: ["title", "scheduled_date"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_calendar_item",
      description: "Update a calendar item (reschedule, change status, etc.). Use when user says 'reschedule', 'move to next week', 'mark as done', or 'update calendar item'.",
      parameters: {
        type: "object",
        properties: {
          calendar_id: { type: "string", description: "UUID of the calendar item" },
          title: { type: "string" },
          scheduled_date: { type: "string" },
          status: { type: "string", enum: ["planned", "in_progress", "completed", "cancelled"] },
          priority: { type: "string", enum: ["low", "medium", "high"] },
          notes: { type: "string" }
        },
        required: ["calendar_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_calendar_item",
      description: "Remove a calendar item. Use when user says 'remove from calendar', 'delete calendar item', or 'cancel scheduled content'.",
      parameters: {
        type: "object",
        properties: {
          calendar_id: { type: "string", description: "UUID of the calendar item to delete" }
        },
        required: ["calendar_id"]
      }
    }
  },
  // Glossary write tool removed — feature deprecated
];

export const CONTENT_ACTION_TOOL_NAMES = [
  'create_content_item', 'update_content_item', 'delete_content_item',
  'submit_for_review', 'approve_content', 'reject_content',
  'generate_full_content', 'start_content_builder', 'launch_content_wizard',
  'create_calendar_item', 'update_calendar_item', 'delete_calendar_item'
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

        // Auto-calculate SEO score
        const seoScore = calculateBasicSeoScore(
          toolArgs.content || '', 
          toolArgs.main_keyword || '', 
          toolArgs.meta_title, 
          toolArgs.meta_description
        );
        if (seoScore > 0 && data.id) {
          await saveAutoSeoScore(supabase, userId, data.id, seoScore, toolArgs.main_keyword || '');
        }

        return { success: true, message: `Created "${data.title}" as ${data.status} (SEO: ${seoScore}/100)`, item: { ...data, seo_score: seoScore } };
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

        // Auto-calculate SEO score for generated content
        const seoScore = calculateBasicSeoScore(generatedContent, toolArgs.keyword, autoTitle, '');
        if (seoScore > 0 && saved.id) {
          await saveAutoSeoScore(supabase, userId, saved.id, seoScore, toolArgs.keyword);
        }

        const wordCount = generatedContent.split(/\s+/).length;
        return {
          success: true,
          message: `Generated and saved "${saved.title}" (~${wordCount} words, SEO: ${seoScore}/100) as draft`,
          item: { ...saved, seo_score: seoScore },
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

      // === CALENDAR CRUD ===
      case 'create_calendar_item': {
        const { data, error } = await supabase.from('content_calendar').insert({
          user_id: userId,
          title: toolArgs.title,
          scheduled_date: toolArgs.scheduled_date,
          content_type: toolArgs.content_type || 'blog',
          status: toolArgs.status || 'planned',
          priority: toolArgs.priority || 'medium',
          notes: toolArgs.notes || null,
          proposal_id: toolArgs.proposal_id || null,
          content_id: toolArgs.content_id || null
        }).select('id, title, scheduled_date, status, priority, content_type, created_at').single();

        if (error) throw error;
        return { success: true, message: `Scheduled "${data.title}" for ${data.scheduled_date}`, item: data };
      }

      case 'update_calendar_item': {
        const updates: any = {};
        if (toolArgs.title) updates.title = toolArgs.title;
        if (toolArgs.scheduled_date) updates.scheduled_date = toolArgs.scheduled_date;
        if (toolArgs.status) updates.status = toolArgs.status;
        if (toolArgs.priority) updates.priority = toolArgs.priority;
        if (toolArgs.notes !== undefined) updates.notes = toolArgs.notes;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('content_calendar')
          .update(updates)
          .eq('id', toolArgs.calendar_id)
          .eq('user_id', userId)
          .select('id, title, scheduled_date, status, priority').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Calendar item not found or access denied' };
        return { success: true, message: `Updated calendar item "${data.title}"`, item: data };
      }

      case 'delete_calendar_item': {
        const { data, error } = await supabase.from('content_calendar')
          .delete()
          .eq('id', toolArgs.calendar_id)
          .eq('user_id', userId)
          .select('id, title').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Calendar item not found or access denied' };
        return { success: true, message: `Removed "${data.title}" from calendar` };
      }

      // Glossary write removed — feature deprecated

      default:
        return { error: `Unknown content action tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[CONTENT-ACTION] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
