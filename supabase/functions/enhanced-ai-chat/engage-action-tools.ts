/**
 * Engage Module Action Tools
 * Full CRUD for contacts, emails, segments, journeys, automations
 */

async function getUserWorkspaceId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('team_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1).single();
  return data?.workspace_id || null;
}

async function ensureWorkspace(supabase: any, userId: string): Promise<string> {
  const existing = await getUserWorkspaceId(supabase, userId);
  if (existing) return existing;

  // Create workspace via RPC
  const { data } = await supabase.rpc('ensure_engage_workspace', { p_user_id: userId });
  return data;
}

export const ENGAGE_ACTION_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "create_contact",
      description: "Create a new contact in the Engage CRM. Use when user says 'add contact', 'create subscriber', or 'new contact'.",
      parameters: {
        type: "object",
        properties: {
          email: { type: "string", description: "Contact email (required)" },
          first_name: { type: "string", description: "First name" },
          last_name: { type: "string", description: "Last name" },
          tags: { type: "array", items: { type: "string" }, description: "Tags to apply" },
          attributes: { type: "object", description: "Custom attributes as key-value pairs" }
        },
        required: ["email"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_contact",
      description: "Update an existing contact's information. Use when user says 'update contact', 'edit subscriber', or 'change contact details'.",
      parameters: {
        type: "object",
        properties: {
          contact_id: { type: "string", description: "UUID of the contact" },
          email: { type: "string" },
          first_name: { type: "string" },
          last_name: { type: "string" },
          tags: { type: "array", items: { type: "string" }, description: "Replace all tags" },
          unsubscribed: { type: "boolean", description: "Set subscription status" }
        },
        required: ["contact_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "tag_contacts",
      description: "Add tags to one or more contacts. Use when user says 'tag contacts', 'label subscribers', or 'add tag to'.",
      parameters: {
        type: "object",
        properties: {
          contact_ids: { type: "array", items: { type: "string" }, description: "UUIDs of contacts to tag" },
          tags: { type: "array", items: { type: "string" }, description: "Tags to add" }
        },
        required: ["contact_ids", "tags"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_segment",
      description: "Create a new audience segment. Supports natural language rule descriptions. Use when user says 'create segment', 'build audience', or 'segment contacts'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Segment name" },
          description: { type: "string", description: "Natural language description of the segment (e.g., 'active users who opened an email in the last 30 days')" },
          rules: { type: "object", description: "JSON rules object with match ('all'|'any') and rules array. If not provided, description will be used to auto-generate rules." }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_email_campaign",
      description: "Create a new email campaign in draft status. Use when user says 'create email campaign', 'new newsletter', or 'draft an email blast'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Campaign name" },
          subject: { type: "string", description: "Email subject line" },
          body_html: { type: "string", description: "Email body HTML content" },
          template_id: { type: "string", description: "Use an existing template ID instead of body_html" },
          segment_id: { type: "string", description: "Target segment ID" },
          from_name: { type: "string", description: "Sender name" },
          from_email: { type: "string", description: "Sender email" }
        },
        required: ["name", "subject"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_email_campaign",
      description: "Schedule or immediately send an email campaign. Use when user says 'send campaign', 'schedule email', or 'blast it now'.",
      parameters: {
        type: "object",
        properties: {
          campaign_id: { type: "string", description: "UUID of the email campaign" },
          scheduled_at: { type: "string", description: "ISO datetime to schedule. Null = send immediately." }
        },
        required: ["campaign_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_journey",
      description: "Create a new customer journey in draft status. Use when user says 'create journey', 'new drip campaign', 'build workflow', or 'automation sequence'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Journey name" },
          description: { type: "string", description: "Journey description" },
          trigger_type: { type: "string", enum: ["manual", "tag_added", "segment_entry", "event"], description: "What triggers enrollment" },
          trigger_config: { type: "object", description: "Trigger configuration (e.g., { tag: 'VIP' })" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "activate_journey",
      description: "Activate a draft journey to start processing enrollments. Use when user says 'activate journey', 'start journey', or 'go live with journey'.",
      parameters: {
        type: "object",
        properties: {
          journey_id: { type: "string", description: "UUID of the journey to activate" }
        },
        required: ["journey_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_automation",
      description: "Create a new automation rule. Use when user says 'create automation', 'add trigger', or 'set up auto-action'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Automation name" },
          trigger_type: { type: "string", enum: ["tag_added", "segment_entry", "event_occurred", "contact_created"], description: "Trigger type" },
          trigger_config: { type: "object", description: "Trigger config (e.g., { tag: 'VIP' } or { event: 'purchase' })" },
          actions: { type: "array", items: { type: "object" }, description: "Actions to perform (e.g., [{ type: 'send_email', template_id: '...' }])" },
          is_active: { type: "boolean", default: false, description: "Start active immediately" }
        },
        required: ["name", "trigger_type"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "toggle_automation",
      description: "Activate or deactivate an automation. Use when user says 'turn on/off automation', 'enable/disable automation', or 'pause automation'.",
      parameters: {
        type: "object",
        properties: {
          automation_id: { type: "string", description: "UUID of the automation" },
          is_active: { type: "boolean", description: "True to activate, false to deactivate" }
        },
        required: ["automation_id", "is_active"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "enroll_contacts_in_journey",
      description: "Manually enroll contacts into a journey. Use when user says 'enroll contacts', 'add contacts to journey', or 'put them in the sequence'.",
      parameters: {
        type: "object",
        properties: {
          journey_id: { type: "string", description: "UUID of the journey" },
          contact_ids: { type: "array", items: { type: "string" }, description: "UUIDs of contacts to enroll" }
        },
        required: ["journey_id", "contact_ids"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "send_quick_email",
      description: "Send a one-off email to specific contacts (not a campaign). Use when user says 'send email to', 'quick email', or 'email this person'.",
      parameters: {
        type: "object",
        properties: {
          to_emails: { type: "array", items: { type: "string" }, description: "Recipient email addresses" },
          subject: { type: "string", description: "Email subject" },
          body_html: { type: "string", description: "Email body in HTML" }
        },
        required: ["to_emails", "subject", "body_html"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_social_post",
      description: "Create and optionally schedule a social media post directly. Use when user says 'create a social post', 'schedule a tweet', 'post on LinkedIn', 'write a social update', 'post on Twitter/Facebook/Instagram'.",
      parameters: {
        type: "object",
        properties: {
          content: { type: "string", description: "The post content/text" },
          platforms: { type: "array", items: { type: "string", enum: ["twitter", "linkedin", "facebook", "instagram"] }, description: "Target platforms" },
          media_urls: { type: "array", items: { type: "string" }, description: "Media attachment URLs (optional)" },
          scheduled_at: { type: "string", description: "ISO datetime to schedule. Null = save as draft." },
          hashtags: { type: "array", items: { type: "string" }, description: "Hashtags to append" }
        },
        required: ["content", "platforms"]
      }
    }
  },
  // Delete tools
  {
    type: "function",
    function: {
      name: "delete_contact",
      description: "Delete a contact from the CRM. Use when user says 'delete contact', 'remove contact'.",
      parameters: { type: "object", properties: { contact_id: { type: "string", description: "UUID of the contact to delete" } }, required: ["contact_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_segment",
      description: "Delete an audience segment. Use when user says 'delete segment', 'remove segment'.",
      parameters: { type: "object", properties: { segment_id: { type: "string", description: "UUID of the segment to delete" } }, required: ["segment_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_email_campaign",
      description: "Delete an email campaign. Use when user says 'delete campaign', 'remove email campaign'.",
      parameters: { type: "object", properties: { campaign_id: { type: "string", description: "UUID of the campaign to delete" } }, required: ["campaign_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_journey",
      description: "Delete a customer journey. Use when user says 'delete journey', 'remove journey'.",
      parameters: { type: "object", properties: { journey_id: { type: "string", description: "UUID of the journey to delete" } }, required: ["journey_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_automation",
      description: "Delete an automation rule. Use when user says 'delete automation', 'remove automation'.",
      parameters: { type: "object", properties: { automation_id: { type: "string", description: "UUID of the automation to delete" } }, required: ["automation_id"] }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_social_post",
      description: "Delete a social media post. Use when user says 'delete social post', 'remove social post'.",
      parameters: { type: "object", properties: { post_id: { type: "string", description: "UUID of the social post to delete" } }, required: ["post_id"] }
    }
  }
];

export const ENGAGE_ACTION_TOOL_NAMES = [
  'create_contact', 'update_contact', 'tag_contacts',
  'create_segment', 'create_email_campaign', 'send_email_campaign',
  'create_journey', 'activate_journey', 'create_automation',
  'toggle_automation', 'enroll_contacts_in_journey', 'send_quick_email',
  'create_social_post',
  'delete_contact', 'delete_segment', 'delete_email_campaign',
  'delete_journey', 'delete_automation', 'delete_social_post'
];

export async function executeEngageActionTool(
  toolName: string, toolArgs: any, supabase: any, userId: string
): Promise<any> {
  console.log(`[ENGAGE-ACTION] ${toolName} | user: ${userId}`);

  try {
    const workspaceId = await ensureWorkspace(supabase, userId);
    if (!workspaceId) {
      return { success: false, message: 'Could not find or create Engage workspace.' };
    }

    switch (toolName) {
      case 'create_contact': {
        const { data, error } = await supabase.from('engage_contacts').insert({
          workspace_id: workspaceId,
          email: toolArgs.email,
          first_name: toolArgs.first_name || null,
          last_name: toolArgs.last_name || null,
          tags: toolArgs.tags || [],
          attributes: toolArgs.attributes || {}
        }).select('id, email, first_name, last_name, tags, created_at').single();

        if (error) throw error;
        return { success: true, message: `Created contact "${data.email}"`, item: data };
      }

      case 'update_contact': {
        const updates: any = {};
        if (toolArgs.email) updates.email = toolArgs.email;
        if (toolArgs.first_name) updates.first_name = toolArgs.first_name;
        if (toolArgs.last_name) updates.last_name = toolArgs.last_name;
        if (toolArgs.tags) updates.tags = toolArgs.tags;
        if (toolArgs.unsubscribed !== undefined) updates.unsubscribed = toolArgs.unsubscribed;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('engage_contacts')
          .update(updates)
          .eq('id', toolArgs.contact_id)
          .eq('workspace_id', workspaceId)
          .select('id, email, first_name, last_name').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Contact not found or access denied' };
        return { success: true, message: `Updated contact "${data.email}"`, item: data };
      }

      case 'tag_contacts': {
        let taggedCount = 0;
        for (const contactId of (toolArgs.contact_ids || [])) {
          const { data: contact } = await supabase.from('engage_contacts')
            .select('tags')
            .eq('id', contactId)
            .eq('workspace_id', workspaceId)
            .single();

          if (contact) {
            const existingTags = contact.tags || [];
            const newTags = [...new Set([...existingTags, ...(toolArgs.tags || [])])];
            await supabase.from('engage_contacts')
              .update({ tags: newTags, updated_at: new Date().toISOString() })
              .eq('id', contactId);
            taggedCount++;
          }
        }
        return { success: true, message: `Tagged ${taggedCount} contact(s) with: ${(toolArgs.tags || []).join(', ')}` };
      }

      case 'create_segment': {
        const definition = toolArgs.rules || {
          match: 'all',
          rules: []
        };

        // If natural language description provided and no rules, note it for the user
        const needsRuleGeneration = !toolArgs.rules && toolArgs.description;

        const { data, error } = await supabase.from('engage_segments').insert({
          workspace_id: workspaceId,
          name: toolArgs.name,
          description: toolArgs.description || '',
          definition
        }).select('id, name, description, created_at').single();

        if (error) throw error;

        // Evaluate segment
        let memberCount = 0;
        try {
          const { data: count } = await supabase.rpc('evaluate_segment', { p_segment_id: data.id });
          memberCount = count || 0;
        } catch (e) {
          console.warn('[ENGAGE-ACTION] Segment evaluation failed:', e);
        }

        return {
          success: true,
          message: `Created segment "${data.name}" with ${memberCount} matching contacts`,
          item: { ...data, memberCount },
          needsRuleGeneration
        };
      }

      case 'create_email_campaign': {
        const insertData: any = {
          workspace_id: workspaceId,
          name: toolArgs.name,
          subject: toolArgs.subject,
          status: 'draft'
        };

        if (toolArgs.body_html) insertData.body_html = toolArgs.body_html;
        if (toolArgs.template_id) insertData.template_id = toolArgs.template_id;
        if (toolArgs.segment_id) insertData.segment_id = toolArgs.segment_id;
        if (toolArgs.from_name) insertData.from_name = toolArgs.from_name;
        if (toolArgs.from_email) insertData.from_email = toolArgs.from_email;

        const { data, error } = await supabase.from('engage_email_campaigns')
          .insert(insertData)
          .select('id, name, subject, status, created_at').single();

        if (error) throw error;
        return { success: true, message: `Created email campaign "${data.name}" (draft)`, item: data };
      }

      case 'send_email_campaign': {
        const updates: any = {};
        if (toolArgs.scheduled_at) {
          updates.status = 'scheduled';
          updates.scheduled_at = toolArgs.scheduled_at;
        } else {
          updates.status = 'sending';
        }
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('engage_email_campaigns')
          .update(updates)
          .eq('id', toolArgs.campaign_id)
          .eq('workspace_id', workspaceId)
          .select('id, name, status').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Email campaign not found or access denied' };

        // If sending now, trigger the email send function
        if (!toolArgs.scheduled_at) {
          const supabaseUrl = Deno.env.get('SUPABASE_URL');
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
          if (supabaseUrl && supabaseKey) {
            fetch(`${supabaseUrl}/functions/v1/engage-email-send`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ campaign_id: toolArgs.campaign_id, workspace_id: workspaceId })
            }).catch(err => console.error('[ENGAGE-ACTION] Email send trigger error:', err));
          }
        }

        return {
          success: true,
          message: toolArgs.scheduled_at
            ? `Scheduled "${data.name}" for ${toolArgs.scheduled_at}`
            : `Sending "${data.name}" now`
        };
      }

      case 'create_journey': {
        const { data, error } = await supabase.from('engage_journeys').insert({
          workspace_id: workspaceId,
          name: toolArgs.name,
          description: toolArgs.description || '',
          status: 'draft',
          trigger_type: toolArgs.trigger_type || 'manual',
          trigger_config: toolArgs.trigger_config || {}
        }).select('id, name, status, trigger_type, created_at').single();

        if (error) throw error;
        return { success: true, message: `Created journey "${data.name}" (draft)`, item: data };
      }

      case 'activate_journey': {
        const { data, error } = await supabase.from('engage_journeys')
          .update({ status: 'active', updated_at: new Date().toISOString() })
          .eq('id', toolArgs.journey_id)
          .eq('workspace_id', workspaceId)
          .eq('status', 'draft')
          .select('id, name, status').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Journey not found, not in draft status, or access denied' };
        return { success: true, message: `Activated journey "${data.name}"`, item: data };
      }

      case 'create_automation': {
        const { data, error } = await supabase.from('engage_automations').insert({
          workspace_id: workspaceId,
          name: toolArgs.name,
          trigger_type: toolArgs.trigger_type,
          trigger_config: toolArgs.trigger_config || {},
          actions: toolArgs.actions || [],
          is_active: toolArgs.is_active || false
        }).select('id, name, trigger_type, is_active, created_at').single();

        if (error) throw error;
        return { success: true, message: `Created automation "${data.name}" (${data.is_active ? 'active' : 'inactive'})`, item: data };
      }

      case 'toggle_automation': {
        const { data, error } = await supabase.from('engage_automations')
          .update({ is_active: toolArgs.is_active, updated_at: new Date().toISOString() })
          .eq('id', toolArgs.automation_id)
          .eq('workspace_id', workspaceId)
          .select('id, name, is_active').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Automation not found or access denied' };
        return { success: true, message: `${data.is_active ? 'Activated' : 'Deactivated'} automation "${data.name}"` };
      }

      case 'enroll_contacts_in_journey': {
        const enrollments = (toolArgs.contact_ids || []).map((contactId: string) => ({
          workspace_id: workspaceId,
          journey_id: toolArgs.journey_id,
          contact_id: contactId,
          status: 'active',
          current_step_index: 0
        }));

        if (enrollments.length === 0) {
          return { success: false, message: 'No contact IDs provided' };
        }

        const { data, error } = await supabase.from('engage_journey_enrollments')
          .insert(enrollments)
          .select('id');

        if (error) throw error;
        return { success: true, message: `Enrolled ${data?.length || 0} contact(s) in journey` };
      }

      case 'send_quick_email': {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseKey) {
          return { success: false, message: 'Email service unavailable' };
        }

        const response = await fetch(`${supabaseUrl}/functions/v1/engage-email-send`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            workspace_id: workspaceId,
            quick_send: true,
            to_emails: toolArgs.to_emails,
            subject: toolArgs.subject,
            body_html: toolArgs.body_html
          })
        });

        if (!response.ok) {
          return { success: false, message: 'Failed to send email' };
        }

        return { success: true, message: `Sent email to ${toolArgs.to_emails.length} recipient(s)` };
      }

      case 'create_social_post': {
        const hashtags = toolArgs.hashtags || [];
        const fullContent = hashtags.length > 0
          ? `${toolArgs.content}\n\n${hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' ')}`
          : toolArgs.content;

        const platforms = toolArgs.platforms || ['twitter'];

        // Insert social post
        const { data: socialPost, error: postError } = await supabase.from('social_posts').insert({
          workspace_id: workspaceId,
          content: fullContent,
          media_urls: toolArgs.media_urls || [],
          scheduled_at: toolArgs.scheduled_at || null,
          status: toolArgs.scheduled_at ? 'scheduled' : 'draft'
        }).select('id, content, status, scheduled_at, created_at').single();

        if (postError) throw postError;

        // Insert target platforms
        const targets = platforms.map((platform: string) => ({
          post_id: socialPost.id,
          platform,
          status: toolArgs.scheduled_at ? 'pending' : 'draft'
        }));

        await supabase.from('social_post_targets').insert(targets);

        return {
          success: true,
          message: toolArgs.scheduled_at
            ? `Scheduled social post for ${platforms.join(', ')} at ${toolArgs.scheduled_at}`
            : `Created draft social post for ${platforms.join(', ')}`,
          item: { ...socialPost, platforms }
        };
      }

      case 'delete_contact': {
        const { error } = await supabase.from('engage_contacts')
          .delete()
          .eq('id', toolArgs.contact_id)
          .eq('workspace_id', workspaceId);
        if (error) throw error;
        return { success: true, message: `Deleted contact ${toolArgs.contact_id}` };
      }

      case 'delete_segment': {
        // Delete memberships first
        await supabase.from('engage_segment_memberships')
          .delete()
          .eq('segment_id', toolArgs.segment_id)
          .eq('workspace_id', workspaceId);
        const { error } = await supabase.from('engage_segments')
          .delete()
          .eq('id', toolArgs.segment_id)
          .eq('workspace_id', workspaceId);
        if (error) throw error;
        return { success: true, message: `Deleted segment ${toolArgs.segment_id}` };
      }

      case 'delete_email_campaign': {
        const { error } = await supabase.from('engage_email_campaigns')
          .delete()
          .eq('id', toolArgs.campaign_id)
          .eq('workspace_id', workspaceId);
        if (error) throw error;
        return { success: true, message: `Deleted email campaign ${toolArgs.campaign_id}` };
      }

      case 'delete_journey': {
        const { error } = await supabase.from('engage_journeys')
          .delete()
          .eq('id', toolArgs.journey_id)
          .eq('workspace_id', workspaceId);
        if (error) throw error;
        return { success: true, message: `Deleted journey ${toolArgs.journey_id}` };
      }

      case 'delete_automation': {
        const { error } = await supabase.from('engage_automations')
          .delete()
          .eq('id', toolArgs.automation_id)
          .eq('workspace_id', workspaceId);
        if (error) throw error;
        return { success: true, message: `Deleted automation ${toolArgs.automation_id}` };
      }

      case 'delete_social_post': {
        // Delete targets first
        await supabase.from('social_post_targets')
          .delete()
          .eq('post_id', toolArgs.post_id);
        const { error } = await supabase.from('social_posts')
          .delete()
          .eq('id', toolArgs.post_id)
          .eq('workspace_id', workspaceId);
        if (error) throw error;
        return { success: true, message: `Deleted social post ${toolArgs.post_id}` };
      }

      default:
        return { error: `Unknown engage action tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[ENGAGE-ACTION] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
