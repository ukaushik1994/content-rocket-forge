/**
 * Content Builder, Repository & Approval Action Tools
 * Write/Create/Update/Delete operations for content items
 */
import { getApiKey } from '../shared/apiKeyService.ts';
import { callAiProxyWithRetry } from '../shared/aiProxyRetry.ts';

// Enhanced SEO score calculator — rewards AI-generated structures generously
function calculateBasicSeoScore(content: string, keyword: string, metaTitle?: string, metaDescription?: string): number {
  if (!content) return 0;
  let score = 0;
  const lowerContent = content.toLowerCase();
  const lowerKeyword = keyword?.toLowerCase() || '';

  // Content length (max 20 pts) — generous thresholds
  const wordCount = content.split(/\s+/).length;
  if (wordCount >= 1000) score += 20;
  else if (wordCount >= 500) score += 16;
  else if (wordCount >= 300) score += 12;
  else if (wordCount >= 150) score += 8;
  else score += 4;

  // Keyword presence (max 15 pts)
  if (lowerKeyword) {
    const escaped = lowerKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const keywordCount = (lowerContent.match(new RegExp(escaped, 'gi')) || []).length;
    const density = keywordCount / Math.max(wordCount, 1) * 100;
    if (keywordCount >= 1 && density <= 4) score += 15;
    else if (keywordCount >= 1) score += 10;
  }

  // Heading structure (max 15 pts)
  const hasH1 = /<h1/i.test(content) || /^#\s/m.test(content);
  const h2Count = (content.match(/<h2/gi) || []).length + (content.match(/^##\s/gm) || []).length;
  const h3Count = (content.match(/<h3/gi) || []).length + (content.match(/^###\s/gm) || []).length;
  if (hasH1) score += 4;
  if (h2Count >= 3) score += 7;
  else if (h2Count >= 1) score += 4;
  if (h3Count >= 1) score += 4;

  // AI-generated structure bonuses (max 20 pts)
  const hasFAQ = /faq|frequently asked|common questions/i.test(content);
  const hasKeyTakeaways = /key takeaway|takeaway|summary|in summary|tl;?dr/i.test(content);
  const listCount = (content.match(/<li/gi) || []).length + (content.match(/^[-*]\s/gm) || []).length + (content.match(/^\d+\.\s/gm) || []).length;
  if (hasFAQ) score += 8;
  if (hasKeyTakeaways) score += 6;
  if (listCount >= 3) score += 6;
  else if (listCount >= 1) score += 3;

  // Meta tags (max 15 pts)
  if (metaTitle && metaTitle.length >= 30 && metaTitle.length <= 65) score += 8;
  else if (metaTitle && metaTitle.length > 0) score += 5;
  if (metaDescription && metaDescription.length >= 100 && metaDescription.length <= 165) score += 7;
  else if (metaDescription && metaDescription.length > 0) score += 4;

  // Keyword in title/meta (max 15 pts)
  if (lowerKeyword) {
    if (metaTitle?.toLowerCase().includes(lowerKeyword)) score += 8;
    if (metaDescription?.toLowerCase().includes(lowerKeyword)) score += 7;
  }

  return Math.min(score, 100);
}

// Save SEO score to content_items.seo_score
async function saveAutoSeoScore(supabase: any, userId: string, contentId: string, score: number, _keyword: string) {
  try {
    await supabase.from('content_items')
      .update({ seo_score: score })
      .eq('id', contentId)
      .eq('user_id', userId);
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
  {
    type: "function",
    function: {
      name: "get_content_versions",
      description: "Fetch version history for a content item. Shows all saved versions with timestamps, change sources, and SEO scores. Use when user asks 'show history', 'version history', or 'previous versions'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item" },
          limit: { type: "number", default: 10, description: "Number of versions to return" }
        },
        required: ["content_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "restore_content_version",
      description: "Restore a content item to a previous version. Saves current state as a new version first. Use when user says 'restore version', 'revert to', or 'go back to version'.",
      parameters: {
        type: "object",
        properties: {
          content_id: { type: "string", description: "UUID of the content item" },
          version_number: { type: "number", description: "Version number to restore" }
        },
        required: ["content_id", "version_number"]
      }
    }
  }
];

export const CONTENT_ACTION_TOOL_NAMES = [
  'create_content_item', 'update_content_item', 'delete_content_item',
  'submit_for_review', 'approve_content', 'reject_content',
  'generate_full_content', 'start_content_builder', 'launch_content_wizard',
  'create_calendar_item', 'update_calendar_item', 'delete_calendar_item',
  'get_content_versions', 'restore_content_version'
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

        const seoContext = seoScore < 40 ? ' (basic check — full SEO analysis available in the Content Wizard)' : '';
        return { success: true, message: `Created "${data.title}" as ${data.status} (SEO: ${seoScore}/100${seoContext})`, item: { ...data, seo_score: seoScore } };
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

        // Snapshot current version before updating (E1)
        try {
          const { data: current } = await supabase.from('content_items')
            .select('id, title, content, meta_title, meta_description, seo_score')
            .eq('id', toolArgs.content_id).eq('user_id', userId).single();
          if (current && current.content) {
            const { data: latestVersion } = await supabase.from('content_versions')
              .select('version_number')
              .eq('content_id', toolArgs.content_id)
              .order('version_number', { ascending: false }).limit(1).maybeSingle();
            const nextVersion = (latestVersion?.version_number || 0) + 1;
            await supabase.from('content_versions').insert({
              content_id: toolArgs.content_id,
              user_id: userId,
              content: current.content,
              title: current.title,
              meta_title: current.meta_title,
              meta_description: current.meta_description,
              seo_score: current.seo_score,
              version_number: nextVersion,
              change_source: 'pre_update_snapshot',
              change_description: `Snapshot before update`
            });
          }
        } catch (_) { /* non-blocking versioning */ }

        const { data, error } = await supabase.from('content_items')
          .update(updates)
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title, status, content_type, updated_at')
          .single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Content not found or access denied' };
        return { success: true, message: `Updated "${data.title}". 💡 Tip: Say "show version history for ${data.title}" to see all previous versions, or "undo" to restore the previous version.`, item: data };
      }

      case 'delete_content_item': {
        const { data, error } = await supabase.from('content_items')
          .update({ status: 'archived', updated_at: new Date().toISOString() })
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Content not found or access denied' };
        return { success: true, message: `Archived "${data.title}". 💡 Tip: Say "restore ${data.title}" to bring it back.` };
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
          .select('provider, preferred_model')
          .eq('user_id', userId)
          .eq('status', 'active')
          .order('priority', { ascending: true })
          .limit(1).single();

        if (!provider) {
          return { success: false, message: 'No AI provider configured. Go to Settings to add your API key.' };
        }

        // Decrypt API key from secure vault
        const decryptedApiKey = await getApiKey(provider.provider, userId);
        if (!decryptedApiKey) {
          return { success: false, message: 'API key not found. Please re-enter your API key in Settings.' };
        }

        // === ENRICHMENT: Fetch brand voice, solutions, competitors, existing content in parallel ===
        let brandContext = '';
        let solutionContext = '';
        let freshnessContext = '';
        let competitorContext = '';
        let structureGuidance = '';
        let editPatternHint = '';
        let performanceContext = '';
        let businessOutcomeContext = '';

        try {
          const [brandResult, solutionsResult, existingResult, competitorResult, topContentResult, feedbackResult, perfSignalsResult] = await Promise.allSettled([
            // Brand voice
            supabase.from('brand_guidelines')
              .select('tone, brand_personality, brand_values, target_audience, do_use, dont_use, mission_statement')
              .eq('user_id', userId).maybeSingle(),
            // Solutions
            supabase.from('solutions')
              .select('name, description, key_features, results, pain_points, use_cases, target_audience')
              .eq('user_id', userId).limit(5),
            // Content freshness — check for existing articles on same keyword
            supabase.from('content_items')
              .select('id, title, main_keyword, seo_score, created_at')
              .eq('user_id', userId).neq('status', 'archived')
              .ilike('main_keyword', `%${toolArgs.keyword}%`).limit(5),
            // Competitor intelligence
            supabase.from('company_competitors')
              .select('name, intelligence_data, strengths, weaknesses')
              .eq('user_id', userId).limit(3),
            // Top performing content for structure reuse
            supabase.from('content_items')
              .select('content, seo_score')
              .eq('user_id', userId).eq('status', 'published')
              .order('seo_score', { ascending: false }).limit(3),
            // Edit pattern feedback (Fix 9)
            supabase.from('content_generation_feedback')
              .select('feedback_data')
              .eq('user_id', userId).eq('feedback_type', 'edit_pattern')
              .order('created_at', { ascending: false }).limit(10),
            // Performance signals — most reused content (Sprint 2)
            supabase.from('content_performance_signals')
              .select('content_id, signal_type')
              .eq('user_id', userId)
              .order('created_at', { ascending: false }).limit(50)
          ]);

          // Brand voice context
          if (brandResult.status === 'fulfilled' && brandResult.value.data) {
            const b = brandResult.value.data;
            const parts: string[] = [];
            if (b.tone && Array.isArray(b.tone) && b.tone.length > 0) parts.push(`Tone: ${b.tone.join(', ')}`);
            if (b.brand_personality) parts.push(`Personality: ${b.brand_personality}`);
            if (b.brand_values) parts.push(`Values: ${b.brand_values}`);
            if (b.do_use && Array.isArray(b.do_use) && b.do_use.length > 0) parts.push(`DO use phrases like: ${b.do_use.join(', ')}`);
            if (b.dont_use && Array.isArray(b.dont_use) && b.dont_use.length > 0) parts.push(`DON'T use phrases like: ${b.dont_use.join(', ')}`);
            if (parts.length > 0) brandContext = `\n\n## Brand Voice\n${parts.join('\n')}`;

            // Reading level from target audience (Fix 17)
            if (b.target_audience) {
              const ta = b.target_audience.toLowerCase();
              if (/technical|developer|engineer/i.test(ta)) readingLevel = '\nReading level: Technical — use industry jargon freely, assume domain expertise.';
              else if (/executive|c-suite|decision.?maker|director/i.test(ta)) readingLevel = '\nReading level: Executive — concise, results-focused, minimal fluff, lead with outcomes.';
              else if (/beginner|consumer|general|everyday/i.test(ta)) readingLevel = '\nReading level: Accessible — simple language, explain concepts, avoid jargon, use analogies.';
              else readingLevel = `\nReading level: Write for ${b.target_audience} — adapt vocabulary and depth accordingly.`;
            }
          }

          // Solution context with mention density (Fix 16)
          if (solutionsResult.status === 'fulfilled' && solutionsResult.value.data?.length > 0) {
            const sols = solutionsResult.value.data;
            const solNames = sols.map((s: any) => s.name).filter(Boolean);
            const mentionFreq = targetWords >= 1500 ? '3-4 times' : targetWords >= 800 ? '2-3 times' : '1-2 times';
            solutionContext = `\n\n## Solutions to Reference\nNaturally mention these offerings ${mentionFreq} throughout the content:\n${sols.map((s: any) => `- ${s.name}: ${s.description || ''}`.trim()).join('\n')}`;
            if (sols[0]?.key_features) {
              const features = Array.isArray(sols[0].key_features) ? sols[0].key_features : [];
              if (features.length > 0) solutionContext += `\nKey features to weave in: ${features.slice(0, 5).join(', ')}`;
            }
          }

          // Content freshness detection (Fix 19)
          if (existingResult.status === 'fulfilled' && existingResult.value.data?.length > 0) {
            const existing = existingResult.value.data;
            freshnessContext = `\n\n## Content Freshness Note\nUser already has ${existing.length} article(s) on similar topics:\n${existing.map((e: any) => `- "${e.title}" (SEO: ${e.seo_score || 'N/A'})`).join('\n')}\nTake a DIFFERENT ANGLE — don't repeat the same points. Find a unique perspective, updated data, or unexplored subtopic.`;
          }

          // Competitor gap as input (Fix 11)
          if (competitorResult.status === 'fulfilled' && competitorResult.value.data?.length > 0) {
            const comps = competitorResult.value.data;
            const relevantComps = comps.filter((c: any) => {
              const intel = JSON.stringify(c.intelligence_data || {}).toLowerCase();
              return intel.includes(toolArgs.keyword.toLowerCase());
            });
            if (relevantComps.length > 0) {
              competitorContext = `\n\n## Competitive Context\nCompetitors covering this topic: ${relevantComps.map((c: any) => c.name).join(', ')}.\nWeaknesses to exploit: ${relevantComps.map((c: any) => Array.isArray(c.weaknesses) ? c.weaknesses.slice(0, 2).join(', ') : '').filter(Boolean).join('; ') || 'N/A'}.\nDifferentiate by providing more depth, better data, and unique insights they miss.`;
            }
          }

          // Top content structure reuse (Fix 10)
          if (topContentResult.status === 'fulfilled' && topContentResult.value.data?.length > 0) {
            const topArticles = topContentResult.value.data;
            const headingCounts = topArticles.map((a: any) => {
              const h2s = (a.content?.match(/<h2/gi) || a.content?.match(/^##\s/gm) || []).length;
              return h2s;
            });
            const avgHeadings = Math.round(headingCounts.reduce((a: number, b: number) => a + b, 0) / headingCounts.length);
            if (avgHeadings > 0) {
              structureGuidance = `\n\n## Structure Guidance (from top-performing content)\nUse approximately ${avgHeadings} H2 sections. Your best content averages ${avgHeadings} main sections — replicate this winning structure.`;
            }
          }

          // Edit pattern feedback — learned preferences (Fix 9 + Sprint 1 enhanced patterns)
          if (feedbackResult.status === 'fulfilled' && feedbackResult.value.data?.length >= 3) {
            const feedbackData = feedbackResult.value.data;
            const ratios = feedbackData.map((d: any) => d.feedback_data?.lengthRatio || 1);
            const avgRatio = ratios.reduce((a: number, b: number) => a + b, 0) / ratios.length;
            const hints: string[] = [];
            if (avgRatio < 0.75) hints.push('User consistently shortens AI content — write MORE CONCISELY, target 20% fewer words.');
            else if (avgRatio > 1.25) hints.push('User consistently expands AI content — write with MORE DEPTH and DETAIL, target 20% more words.');
            
            // Aggregate detected patterns from Sprint 1 enhanced tracking
            const allPatterns: string[] = feedbackData.flatMap((d: any) => d.feedback_data?.patterns || []);
            const patternCounts: Record<string, number> = {};
            for (const p of allPatterns) { patternCounts[p] = (patternCounts[p] || 0) + 1; }
            const threshold = Math.ceil(feedbackData.length * 0.3);
            const patternMessages: Record<string, string> = {
              splits_long_paragraphs: 'Keep paragraphs to 2-3 sentences max.',
              adds_examples: 'Include concrete examples and real-world scenarios.',
              removes_generic_filler: 'Avoid filler language like "in today\'s digital world".',
              adds_data_statistics: 'Include relevant numbers, percentages, and data.',
              consolidates_headings: 'Use fewer, more meaningful section headers.',
              adds_more_structure: 'Use more subheadings and clear section breaks.',
              converts_to_lists: 'Use bullet points and numbered lists where appropriate.'
            };
            for (const [pattern, count] of Object.entries(patternCounts)) {
              if (count >= threshold && patternMessages[pattern]) hints.push(patternMessages[pattern]);
            }
            if (hints.length > 0) editPatternHint = `\n\n## Learned Preferences\n${hints.join('\n')}`;
          }

          // Performance signals — content that gets reused most (Sprint 2)
          let performanceContext = '';
          if (perfSignalsResult.status === 'fulfilled' && perfSignalsResult.value.data?.length > 0) {
            const signals = perfSignalsResult.value.data;
            const contentSignalCounts: Record<string, number> = {};
            for (const s of signals) {
              contentSignalCounts[s.content_id] = (contentSignalCounts[s.content_id] || 0) + 1;
            }
            const topContentIds = Object.entries(contentSignalCounts)
              .sort(([, a], [, b]) => b - a).slice(0, 3).map(([id]) => id);
            if (topContentIds.length > 0) {
              const { data: topItems } = await supabase.from('content_items')
                .select('title, content_type, main_keyword').in('id', topContentIds).limit(3);
              if (topItems?.length) {
                performanceContext = `\n\n## Content That Gets Reused Most\nThese content pieces get the most actions (email, social, views):\n${topItems.map((t: any) => `- "${t.title}" (${t.content_type}, keyword: ${t.main_keyword || 'N/A'})`).join('\n')}\nMirror the style, depth, and angle of these high-performing pieces.`;
              }
            }
          }

          // Business Outcome Connection (Sprint 2, Enhancement 7)
          let businessOutcomeContext = '';
          if (solutionsResult.status === 'fulfilled' && solutionsResult.value.data?.length > 0) {
            const keyword = (toolArgs.keyword || '').toLowerCase();
            const matchedSolutions = solutionsResult.value.data.filter((s: any) => {
              const searchFields = [
                s.name, s.description,
                ...(Array.isArray(s.pain_points) ? s.pain_points : []),
                ...(Array.isArray(s.use_cases) ? s.use_cases : []),
                s.target_audience
              ].filter(Boolean).join(' ').toLowerCase();
              return searchFields.includes(keyword) || keyword.split(' ').some((w: string) => w.length > 3 && searchFields.includes(w));
            });
            if (matchedSolutions.length > 0) {
              businessOutcomeContext = `\n\n## Business Outcome Connection\nThis topic directly relates to the user's solution: ${matchedSolutions.map((s: any) => s.name).join(', ')}.\nWrite the content EDUCATIONALLY — help readers discover the problem and understand it deeply. Let them naturally conclude they need a solution. Do NOT hard-sell. Weave in the pain points the solution addresses: ${matchedSolutions.flatMap((s: any) => Array.isArray(s.pain_points) ? s.pain_points.slice(0, 3) : []).join(', ') || 'N/A'}.`;
            }
          }
        } catch (enrichErr) {
          console.error('[CONTENT-ACTION] Enrichment fetch failed (non-blocking):', enrichErr);
        }

        // === BUILD ENRICHED SYSTEM PROMPT ===
        const systemPrompt = `You are an expert content writer who writes like a real human — not an AI.

## Core Rules
1. NEVER use these AI-slop words/phrases: "In today's digital landscape", "game-changer", "dive into", "unlock", "unleash", "elevate", "leverage", "navigate", "supercharge", "empower", "cutting-edge", "groundbreaking", "revolutionize", "seamlessly", "harness", "landscape", "paradigm", "robust", "streamline", "synergy", "holistic", "delve", "foster", "spearhead", "pivotal", "beacon", "realm", "vibrant", "meticulous", "tapestry", "comprehensive guide", "in conclusion"
2. Write in first person plural ("we") or address the reader as "you" — never generic third person
3. Vary sentence length dramatically: mix 5-word punches with 25-word flowing sentences
4. Start some paragraphs with a bold opinion, question, or surprising fact — never "This article will..."
5. Include at least one real-world example, case study, or specific data point per major section
6. Use contractions naturally (don't, we're, it's) — stiff writing kills engagement

## Content Structure
- Open with a hook that creates curiosity or states a bold claim (2-3 sentences max, no preamble)
- Use H2 headings as section dividers — each should be specific and benefit-driven, not generic
- Include a "## Key Takeaways" section near the top (3-5 bullet points summarizing the article)
- End with a "## FAQ" section (3-5 real questions people would ask, with concise answers)
- Close with a clear next step or call-to-action paragraph (not labeled "Conclusion")

## Format
- Content type: ${toolArgs.content_type || 'blog'}
- Tone: ${toolArgs.tone || 'professional'}
- Target length: ~${targetWords} words
- Output clean HTML with proper headings (h2, h3), paragraphs, lists, and occasional <strong> for emphasis
- Do NOT include meta information or JSON — just the article content
${brandContext}${solutionContext}${readingLevel}${freshnessContext}${competitorContext}${structureGuidance}${editPatternHint}${performanceContext}${businessOutcomeContext}`;

        // Generate content via ai-proxy with retry
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
                { role: 'system', content: systemPrompt },
                {
                  role: 'user',
                  content: `Write a comprehensive ${toolArgs.content_type || 'blog post'} about "${toolArgs.keyword}".${toolArgs.additional_instructions ? ` Additional instructions: ${toolArgs.additional_instructions}` : ''}`
                }
              ],
              maxTokens: targetWords * 3
            }
          })
        });

        if (!proxyResponse.ok) {
          return { success: false, message: 'Failed to generate content. Check your AI provider settings.' };
        }

        const aiResult = await proxyResponse.json();
        const generatedContent = aiResult.data?.choices?.[0]?.message?.content || aiResult.content || aiResult.choices?.[0]?.message?.content || '';

        if (!generatedContent) {
          return { success: false, message: 'AI returned empty content. Try again or adjust your request.' };
        }

        // Extract title from first H1/H2 or use keyword
        const titleMatch = generatedContent.match(/<h[12][^>]*>(.*?)<\/h[12]>/i);
        const autoTitle = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, '') : `${toolArgs.keyword} - ${toolArgs.content_type || 'Blog Post'}`;

        // Auto meta title/description (Fix 3)
        const plainText = generatedContent.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
        const autoMetaTitle = autoTitle.length > 60 ? autoTitle.substring(0, 57) + '...' : autoTitle;
        const autoMetaDesc = plainText.length > 155 ? plainText.substring(0, 152) + '...' : plainText;

        // Save to content_items
        const { data: saved, error: saveError } = await supabase.from('content_items').insert({
          user_id: userId,
          title: autoTitle,
          content: generatedContent,
          content_type: toolArgs.content_type || 'blog',
          main_keyword: toolArgs.keyword,
          secondary_keywords: [],
          status: 'draft',
          meta_title: autoMetaTitle,
          meta_description: autoMetaDesc,
          metadata: { generated_via: 'ai_chat', keyword: toolArgs.keyword, tone: toolArgs.tone, length: toolArgs.length },
          solution_id: toolArgs.solution_id || null
        }).select('id, title, status, content_type, created_at').single();

        if (saveError) throw saveError;

        // Auto-calculate SEO score for generated content
        const seoScore = calculateBasicSeoScore(generatedContent, toolArgs.keyword, autoMetaTitle, autoMetaDesc);
        if (seoScore > 0 && saved.id) {
          await saveAutoSeoScore(supabase, userId, saved.id, seoScore, toolArgs.keyword);
        }

        // Create version 1 (E1)
        try {
          await supabase.from('content_versions').insert({
            content_id: saved.id,
            user_id: userId,
            content: generatedContent,
            title: saved.title,
            meta_title: autoMetaTitle,
            meta_description: autoMetaDesc,
            seo_score: seoScore,
            version_number: 1,
            change_source: 'ai_generation',
            change_description: `Initial generation via AI Chat`
          });
        } catch (_) { /* non-blocking */ }

        // Fact-checking flags (Fix 18)
        let factCheckWarning = '';
        try {
          const statsPattern = /(\d{1,3}(?:,\d{3})*(?:\.\d+)?%|\$\d+(?:\.\d+)?(?:\s*(?:billion|million|trillion))?|\d+%)/gi;
          const statsFound = generatedContent.match(statsPattern) || [];
          if (statsFound.length > 0) {
            factCheckWarning = `\n⚠️ **Fact-check advisory**: This article contains ${statsFound.length} statistic(s)/figure(s) that should be verified before publishing.`;
          }
        } catch (_) { /* non-blocking */ }

        // Internal linking suggestions (Fix 12)
        let linkSuggestions = '';
        try {
          const { data: published } = await supabase.from('content_items')
            .select('id, title, main_keyword')
            .eq('user_id', userId).eq('status', 'published')
            .neq('id', saved.id).limit(20);

          if (published?.length > 0) {
            const keywordLower = toolArgs.keyword.toLowerCase();
            const keywordWords = keywordLower.split(/\s+/);
            const relatedArticles = published.filter((p: any) => {
              const pKeyword = (p.main_keyword || '').toLowerCase();
              const pTitle = (p.title || '').toLowerCase();
              return keywordWords.some((w: string) => w.length > 3 && (pKeyword.includes(w) || pTitle.includes(w)));
            }).slice(0, 3);

            if (relatedArticles.length > 0) {
              linkSuggestions = `\n🔗 **Internal linking suggestions**: Consider linking to: ${relatedArticles.map((a: any) => `"${a.title}"`).join(', ')}`;
            }
          }
        } catch (_) { /* non-blocking */ }

        const wordCount = generatedContent.split(/\s+/).length;
        // Auto-suggest keywords from headings (E2)
        let keywordSuggestions = '';
        try {
          const headingMatches = generatedContent.match(/^#{1,3}\s+(.+)$/gm) || [];
          if (headingMatches.length > 0) {
            const extractedPhrases = headingMatches
              .map((h: string) => h.replace(/^#+\s+/, '').trim().toLowerCase())
              .filter((p: string) => p.length > 3 && p.length < 60)
              .slice(0, 5);
            
            if (extractedPhrases.length > 0) {
              // Check which ones are NOT already tracked
              const { data: existingKw } = await supabase
                .from('keywords')
                .select('keyword')
                .eq('user_id', userId)
                .in('keyword', extractedPhrases);
              const existingSet = new Set((existingKw || []).map((k: any) => k.keyword.toLowerCase()));
              const newPhrases = extractedPhrases.filter((p: string) => !existingSet.has(p));
              if (newPhrases.length > 0) {
                keywordSuggestions = `\n\n💡 **Keyword suggestions** from headings: ${newPhrases.map((p: string) => `"${p}"`).join(', ')}. Say "add these keywords" to start tracking them.`;
              }
            }
          }
        } catch (_) { /* non-blocking */ }

        const seoContext = seoScore < 40 ? ' (basic check — full SEO analysis available in the Content Wizard)' : '';
        return {
          success: true,
          message: `Generated and saved "${saved.title}" (~${wordCount} words, SEO: ${seoScore}/100${seoContext}) as draft${factCheckWarning}${linkSuggestions}${keywordSuggestions}`,
          item: { ...saved, seo_score: seoScore, meta_title: autoMetaTitle, meta_description: autoMetaDesc },
          wordCount,
          actions: [
            { id: 'view_content', label: '📄 View in Repository', type: 'navigate', route: '/content/repository' },
            { id: 'publish_content', label: '🚀 Publish Now', type: 'send_message', message: `Publish content "${saved.title}" (ID: ${saved.id})` },
            { id: 'email_content', label: '📧 Send as Email', type: 'send_message', message: `Create an email campaign from content "${saved.title}" (ID: ${saved.id})` },
            { id: 'social_content', label: '📱 Share on Social', type: 'send_message', message: `Repurpose "${saved.title}" (ID: ${saved.id}) for social media` }
          ]
        };
      }

      case 'start_content_builder': {
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

        // Calendar topic diversity check (Fix 15)
        let diversityNote = '';
        try {
          const scheduledMonth = toolArgs.scheduled_date?.substring(0, 7); // YYYY-MM
          if (scheduledMonth) {
            const { data: monthItems } = await supabase.from('content_calendar')
              .select('content_type')
              .eq('user_id', userId)
              .gte('scheduled_date', `${scheduledMonth}-01`)
              .lt('scheduled_date', `${scheduledMonth}-32`);

            if (monthItems && monthItems.length >= 3) {
              const typeCounts: Record<string, number> = {};
              monthItems.forEach((item: any) => { typeCounts[item.content_type] = (typeCounts[item.content_type] || 0) + 1; });
              const maxType = Object.entries(typeCounts).sort(([,a]: any, [,b]: any) => b - a)[0];
              if (maxType && (maxType[1] as number) / monthItems.length > 0.7) {
                diversityNote = ` 💡 Tip: ${Math.round((maxType[1] as number) / monthItems.length * 100)}% of your ${scheduledMonth} content is "${maxType[0]}" — consider mixing in different formats for better engagement.`;
              }
            }
          }
        } catch (_) { /* non-blocking */ }

        return { success: true, message: `Scheduled "${data.title}" for ${data.scheduled_date}${diversityNote}`, item: data };
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

      case 'get_content_versions': {
        const { data, error } = await supabase.from('content_versions')
          .select('id, version_number, title, seo_score, change_source, change_description, created_at')
          .eq('content_id', toolArgs.content_id)
          .eq('user_id', userId)
          .order('version_number', { ascending: false })
          .limit(toolArgs.limit || 10);

        if (error) throw error;

        return {
          success: true,
          versions: data || [],
          count: data?.length || 0,
          message: data?.length
            ? `Found ${data.length} version(s). Latest: v${data[0].version_number} (${data[0].change_source}).`
            : 'No version history found for this content.'
        };
      }

      case 'restore_content_version': {
        // Find the target version
        const { data: targetVersion, error: findError } = await supabase.from('content_versions')
          .select('*')
          .eq('content_id', toolArgs.content_id)
          .eq('user_id', userId)
          .eq('version_number', toolArgs.version_number)
          .single();

        if (findError || !targetVersion) {
          return { success: false, message: `Version ${toolArgs.version_number} not found.` };
        }

        // Snapshot current state first
        const { data: current } = await supabase.from('content_items')
          .select('title, content, meta_title, meta_description, seo_score')
          .eq('id', toolArgs.content_id).eq('user_id', userId).single();

        if (current) {
          const { data: latestVersion } = await supabase.from('content_versions')
            .select('version_number')
            .eq('content_id', toolArgs.content_id)
            .order('version_number', { ascending: false }).limit(1).maybeSingle();
          const nextVersion = (latestVersion?.version_number || 0) + 1;
          await supabase.from('content_versions').insert({
            content_id: toolArgs.content_id,
            user_id: userId,
            content: current.content,
            title: current.title,
            meta_title: current.meta_title,
            meta_description: current.meta_description,
            seo_score: current.seo_score,
            version_number: nextVersion,
            change_source: 'pre_restore_snapshot',
            change_description: `Snapshot before restoring to v${toolArgs.version_number}`
          });
        }

        // Restore the target version
        const restoreUpdates: any = { updated_at: new Date().toISOString() };
        if (targetVersion.content) restoreUpdates.content = targetVersion.content;
        if (targetVersion.title) restoreUpdates.title = targetVersion.title;
        if (targetVersion.meta_title) restoreUpdates.meta_title = targetVersion.meta_title;
        if (targetVersion.meta_description) restoreUpdates.meta_description = targetVersion.meta_description;

        const { data: restored, error: restoreError } = await supabase.from('content_items')
          .update(restoreUpdates)
          .eq('id', toolArgs.content_id)
          .eq('user_id', userId)
          .select('id, title, status')
          .single();

        if (restoreError) throw restoreError;

        return {
          success: true,
          message: `Restored "${restored.title}" to version ${toolArgs.version_number}. Previous state saved as a new version.`,
          item: restored
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
