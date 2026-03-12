/**
 * Strategy Recommendation Action Tools
 * Accept and dismiss strategy recommendations from chat
 */

export const STRATEGY_ACTION_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "accept_recommendation",
      description: "Accept a strategy recommendation and mark it as accepted. Use when user says 'accept recommendation', 'follow this advice', 'implement this recommendation', or 'do this'.",
      parameters: {
        type: "object",
        properties: {
          recommendation_id: { type: "string", description: "UUID of the recommendation to accept" }
        },
        required: ["recommendation_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "dismiss_recommendation",
      description: "Dismiss a strategy recommendation. Use when user says 'dismiss recommendation', 'skip recommendation', 'ignore this advice', or 'not relevant'.",
      parameters: {
        type: "object",
        properties: {
          recommendation_id: { type: "string", description: "UUID of the recommendation to dismiss" },
          reason: { type: "string", description: "Optional reason for dismissal" }
        },
        required: ["recommendation_id"]
      }
    }
  }
];

export const STRATEGY_ACTION_TOOL_NAMES = [
  'accept_recommendation', 'dismiss_recommendation'
];

export async function executeStrategyActionTool(
  toolName: string, toolArgs: any, supabase: any, userId: string
): Promise<any> {
  console.log(`[STRATEGY-ACTION] ${toolName} | user: ${userId}`);

  try {
    switch (toolName) {
      case 'accept_recommendation': {
        const { data, error } = await supabase
          .from('strategy_recommendations')
          .update({ 
            status: 'accepted', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', toolArgs.recommendation_id)
          .eq('user_id', userId)
          .select('id, title, status, recommendation_type, priority')
          .single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Recommendation not found or access denied' };

        return {
          success: true,
          message: `Accepted recommendation "${data.title}"`,
          item: data
        };
      }

      case 'dismiss_recommendation': {
        const { data, error } = await supabase
          .from('strategy_recommendations')
          .update({ 
            status: 'dismissed', 
            updated_at: new Date().toISOString() 
          })
          .eq('id', toolArgs.recommendation_id)
          .eq('user_id', userId)
          .select('id, title, status')
          .single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Recommendation not found or access denied' };

        return {
          success: true,
          message: `Dismissed recommendation "${data.title}"${toolArgs.reason ? ` — Reason: ${toolArgs.reason}` : ''}`,
          item: data
        };
      }

      default:
        return { error: `Unknown strategy action tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[STRATEGY-ACTION] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
