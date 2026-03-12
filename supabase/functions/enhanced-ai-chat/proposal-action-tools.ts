/**
 * Proposal Action Tools
 * Accept, reject, and create AI strategy proposals from chat
 */

export const PROPOSAL_ACTION_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "accept_proposal",
      description: "Accept an AI strategy proposal and schedule it to the editorial calendar. Use when user says 'accept proposal', 'schedule this proposal', 'approve proposal', or 'add proposal to calendar'.",
      parameters: {
        type: "object",
        properties: {
          proposal_id: { type: "string", description: "UUID of the proposal to accept" },
          scheduled_date: { type: "string", description: "ISO date to schedule (defaults to 7 days from now)" }
        },
        required: ["proposal_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "reject_proposal",
      description: "Reject/dismiss an AI strategy proposal. Use when user says 'reject proposal', 'dismiss proposal', 'skip this proposal', or 'not interested in proposal'.",
      parameters: {
        type: "object",
        properties: {
          proposal_id: { type: "string", description: "UUID of the proposal to reject" },
          reason: { type: "string", description: "Optional reason for rejection" }
        },
        required: ["proposal_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "create_proposal",
      description: "Create a new AI strategy proposal manually. Use when user says 'create a proposal', 'add a content proposal', 'suggest a new article idea', or 'new proposal for [topic]'.",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string", description: "Proposal title" },
          primary_keyword: { type: "string", description: "Primary keyword to target" },
          description: { type: "string", description: "Description of the proposal" },
          content_type: { type: "string", enum: ["blog", "article", "video", "infographic", "social", "email", "whitepaper", "case_study"], description: "Content type" },
          priority_tag: { type: "string", enum: ["high", "medium", "low", "quick-win", "evergreen"], description: "Priority level" },
          estimated_impressions: { type: "number", description: "Estimated impressions" },
          solution_id: { type: "string", description: "UUID of related solution (optional)" }
        },
        required: ["title", "primary_keyword"]
      }
    }
  }
];

export const PROPOSAL_ACTION_TOOL_NAMES = [
  'accept_proposal', 'reject_proposal', 'create_proposal'
];

export async function executeProposalActionTool(
  toolName: string, toolArgs: any, supabase: any, userId: string
): Promise<any> {
  console.log(`[PROPOSAL-ACTION] ${toolName} | user: ${userId}`);

  try {
    switch (toolName) {
      case 'accept_proposal': {
        // 1. Fetch the proposal
        const { data: proposal, error: fetchError } = await supabase
          .from('ai_strategy_proposals')
          .select('id, title, primary_keyword, content_type, description, status')
          .eq('id', toolArgs.proposal_id)
          .eq('user_id', userId)
          .single();

        if (fetchError || !proposal) {
          return { success: false, message: 'Proposal not found or access denied' };
        }

        if (proposal.status === 'scheduled' || proposal.status === 'completed') {
          return { success: false, message: `Proposal is already ${proposal.status}` };
        }

        // 2. Create calendar item (trigger will auto-update proposal status to 'scheduled')
        const scheduledDate = toolArgs.scheduled_date || 
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const { data: calItem, error: calError } = await supabase
          .from('content_calendar')
          .insert({
            user_id: userId,
            title: proposal.title,
            scheduled_date: scheduledDate,
            content_type: proposal.content_type || 'blog',
            status: 'planned',
            priority: 'medium',
            proposal_id: proposal.id,
            notes: proposal.description || '',
            proposal_data: { primary_keyword: proposal.primary_keyword }
          })
          .select('id, title, scheduled_date, status')
          .single();

        if (calError) throw calError;

        return {
          success: true,
          message: `Accepted proposal "${proposal.title}" and scheduled for ${scheduledDate}`,
          proposal: { id: proposal.id, title: proposal.title, status: 'scheduled' },
          calendarItem: calItem
        };
      }

      case 'reject_proposal': {
        const { data, error } = await supabase
          .from('ai_strategy_proposals')
          .update({ 
            status: 'dismissed', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', toolArgs.proposal_id)
          .eq('user_id', userId)
          .select('id, title, status')
          .single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Proposal not found or access denied' };

        return {
          success: true,
          message: `Dismissed proposal "${data.title}"${toolArgs.reason ? ` — Reason: ${toolArgs.reason}` : ''}`,
          proposal: data
        };
      }

      case 'create_proposal': {
        const { data, error } = await supabase
          .from('ai_strategy_proposals')
          .insert({
            user_id: userId,
            title: toolArgs.title,
            primary_keyword: toolArgs.primary_keyword,
            description: toolArgs.description || '',
            content_type: toolArgs.content_type || 'blog',
            priority_tag: toolArgs.priority_tag || 'medium',
            estimated_impressions: toolArgs.estimated_impressions || null,
            solution_id: toolArgs.solution_id || null,
            status: 'available'
          })
          .select('id, title, primary_keyword, content_type, priority_tag, status, created_at')
          .single();

        if (error) throw error;

        return {
          success: true,
          message: `Created proposal "${data.title}" targeting "${data.primary_keyword}"`,
          item: data
        };
      }

      default:
        return { error: `Unknown proposal action tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[PROPOSAL-ACTION] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
