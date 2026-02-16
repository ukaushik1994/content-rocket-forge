/**
 * Engage Module Intelligence Tools for AI Chat
 * Provides data access to contacts, segments, journeys, automations, and email campaigns
 */

export const ENGAGE_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "get_engage_contacts",
      description: "Fetch contacts from the Engage CRM module with optional filtering by tags, subscription status, or date range. Use when user asks about contacts, subscribers, audience, or CRM data.",
      parameters: {
        type: "object",
        properties: {
          tag: { type: "string", description: "Filter contacts by a specific tag" },
          unsubscribed: { type: "boolean", description: "Filter by subscription status (true=unsubscribed only, false=subscribed only)" },
          limit: { type: "number", default: 20, description: "Number of contacts to return (default 20, max 100)" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_engage_segments",
      description: "Fetch audience segments with member counts. Use when user asks about segments, audience groups, or targeting.",
      parameters: {
        type: "object",
        properties: {
          limit: { type: "number", default: 20, description: "Number of segments to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_engage_journeys",
      description: "Fetch customer journeys with status, step counts, and enrollment data. Use when user asks about journeys, workflows, funnels, or drip campaigns.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["draft", "active", "paused", "completed"], description: "Filter by journey status" },
          limit: { type: "number", default: 10, description: "Number of journeys to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_engage_automations",
      description: "Fetch automation rules with trigger info, execution counts, and success rates. Use when user asks about automations, triggers, or automated workflows.",
      parameters: {
        type: "object",
        properties: {
          is_active: { type: "boolean", description: "Filter by active/inactive status" },
          limit: { type: "number", default: 10, description: "Number of automations to return" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "get_engage_email_campaigns",
      description: "Fetch email campaigns with delivery analytics (sent, opened, clicked, bounced). Use when user asks about email campaigns, newsletters, email performance, or delivery stats.",
      parameters: {
        type: "object",
        properties: {
          status: { type: "string", enum: ["draft", "scheduled", "sending", "sent", "paused"], description: "Filter by campaign status" },
          limit: { type: "number", default: 10, description: "Number of email campaigns to return" }
        }
      }
    }
  }
];

export const ENGAGE_TOOL_NAMES = [
  'get_engage_contacts',
  'get_engage_segments',
  'get_engage_journeys',
  'get_engage_automations',
  'get_engage_email_campaigns'
];

/**
 * Get the user's workspace ID from team_members
 */
async function getUserWorkspaceId(supabase: any, userId: string): Promise<string | null> {
  const { data } = await supabase
    .from('team_members')
    .select('workspace_id')
    .eq('user_id', userId)
    .limit(1)
    .single();
  return data?.workspace_id || null;
}

/**
 * Execute an engage intelligence tool call
 */
export async function executeEngageIntelligenceTool(
  toolName: string,
  toolArgs: any,
  supabase: any,
  userId: string
): Promise<any> {
  const workspaceId = await getUserWorkspaceId(supabase, userId);
  
  if (!workspaceId) {
    return { data: [], message: 'No Engage workspace found. Visit the Engage module to get started.' };
  }

  switch (toolName) {
    case 'get_engage_contacts': {
      let query = supabase
        .from('engage_contacts')
        .select('id, first_name, last_name, email, tags, unsubscribed, created_at')
        .eq('workspace_id', workspaceId);
      
      if (toolArgs.tag) query = query.contains('tags', [toolArgs.tag]);
      if (toolArgs.unsubscribed !== undefined) query = query.eq('unsubscribed', toolArgs.unsubscribed);
      
      const { data, error, count } = await query
        .order('created_at', { ascending: false })
        .limit(Math.min(toolArgs.limit || 20, 100));
      
      if (error) throw error;
      
      // Also get total count
      const { count: totalCount } = await supabase
        .from('engage_contacts')
        .select('*', { count: 'exact', head: true })
        .eq('workspace_id', workspaceId);
      
      return { data: data || [], totalCount: totalCount || 0 };
    }

    case 'get_engage_segments': {
      const { data, error } = await supabase
        .from('engage_segments')
        .select('id, name, description, definition, created_at')
        .eq('workspace_id', workspaceId)
        .order('created_at', { ascending: false })
        .limit(Math.min(toolArgs.limit || 20, 50));
      
      if (error) throw error;

      // Get member counts per segment
      const segmentsWithCounts = await Promise.all(
        (data || []).map(async (segment: any) => {
          const { count } = await supabase
            .from('engage_segment_memberships')
            .select('*', { count: 'exact', head: true })
            .eq('segment_id', segment.id);
          return { ...segment, memberCount: count || 0 };
        })
      );
      
      return { data: segmentsWithCounts };
    }

    case 'get_engage_journeys': {
      let query = supabase
        .from('engage_journeys')
        .select('id, name, description, status, trigger_type, trigger_config, created_at, updated_at')
        .eq('workspace_id', workspaceId);
      
      if (toolArgs.status) query = query.eq('status', toolArgs.status);
      
      const { data, error } = await query
        .order('updated_at', { ascending: false })
        .limit(Math.min(toolArgs.limit || 10, 50));
      
      if (error) throw error;

      // Get step counts and enrollment counts per journey
      const journeysWithDetails = await Promise.all(
        (data || []).map(async (journey: any) => {
          const [stepsResult, enrollmentResult] = await Promise.all([
            supabase.from('engage_journey_steps').select('*', { count: 'exact', head: true }).eq('journey_id', journey.id),
            supabase.from('engage_journey_enrollments').select('*', { count: 'exact', head: true }).eq('journey_id', journey.id)
          ]);
          return {
            ...journey,
            stepCount: stepsResult.count || 0,
            enrollmentCount: enrollmentResult.count || 0
          };
        })
      );
      
      return { data: journeysWithDetails };
    }

    case 'get_engage_automations': {
      let query = supabase
        .from('engage_automations')
        .select('id, name, description, trigger_type, trigger_config, actions, is_active, execution_count, last_triggered_at, created_at')
        .eq('workspace_id', workspaceId);
      
      if (toolArgs.is_active !== undefined) query = query.eq('is_active', toolArgs.is_active);
      
      const { data, error } = await query
        .order('execution_count', { ascending: false })
        .limit(Math.min(toolArgs.limit || 10, 50));
      
      if (error) throw error;
      return { data: data || [] };
    }

    case 'get_engage_email_campaigns': {
      let query = supabase
        .from('engage_email_campaigns')
        .select('id, name, subject, status, scheduled_at, sent_at, created_at')
        .eq('workspace_id', workspaceId);
      
      if (toolArgs.status) query = query.eq('status', toolArgs.status);
      
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(Math.min(toolArgs.limit || 10, 50));
      
      if (error) throw error;

      // Get delivery analytics per campaign
      const campaignsWithAnalytics = await Promise.all(
        (data || []).map(async (campaign: any) => {
          const { data: logs } = await supabase
            .from('engage_email_logs')
            .select('status')
            .eq('campaign_id', campaign.id);
          
          const analytics = {
            total: logs?.length || 0,
            sent: logs?.filter((l: any) => l.status === 'sent').length || 0,
            delivered: logs?.filter((l: any) => l.status === 'delivered').length || 0,
            opened: logs?.filter((l: any) => l.status === 'opened').length || 0,
            clicked: logs?.filter((l: any) => l.status === 'clicked').length || 0,
            bounced: logs?.filter((l: any) => l.status === 'bounced').length || 0,
          };
          return { ...campaign, analytics };
        })
      );
      
      return { data: campaignsWithAnalytics };
    }

    default:
      throw new Error(`Unknown engage tool: ${toolName}`);
  }
}
