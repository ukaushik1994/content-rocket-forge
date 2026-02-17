/**
 * Offerings/Solutions, Company & Competitor Action Tools
 * Write/Create/Update/Delete operations for business intelligence
 */

export const OFFERINGS_ACTION_TOOL_DEFINITIONS = [
  {
    type: "function",
    function: {
      name: "create_solution",
      description: "Create a new solution/offering/product. Use when user says 'add a solution', 'create offering', or 'add new product'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Solution name" },
          description: { type: "string", description: "Solution description" },
          features: { type: "array", items: { type: "string" }, description: "Key features list" },
          use_cases: { type: "array", items: { type: "string" }, description: "Use cases" },
          target_audience: { type: "string", description: "Target audience description" },
          benefits: { type: "array", items: { type: "string" }, description: "Key benefits" }
        },
        required: ["name", "description"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_solution",
      description: "Update an existing solution/offering. Use when user says 'update solution', 'edit offering', or 'change product details'.",
      parameters: {
        type: "object",
        properties: {
          solution_id: { type: "string", description: "UUID of the solution" },
          name: { type: "string" },
          description: { type: "string" },
          features: { type: "array", items: { type: "string" } },
          use_cases: { type: "array", items: { type: "string" } },
          target_audience: { type: "string" },
          benefits: { type: "array", items: { type: "string" } }
        },
        required: ["solution_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "delete_solution",
      description: "Delete a solution/offering. Use when user says 'remove solution', 'delete offering', or 'remove product'.",
      parameters: {
        type: "object",
        properties: {
          solution_id: { type: "string", description: "UUID of the solution to delete" }
        },
        required: ["solution_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_company_info",
      description: "Update company information. Use when user says 'update company info', 'change company details', or 'set company name/description/industry'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Company name" },
          description: { type: "string", description: "Company description" },
          industry: { type: "string", description: "Industry" },
          website: { type: "string", description: "Website URL" },
          mission: { type: "string", description: "Mission statement" },
          values: { type: "array", items: { type: "string" }, description: "Company values" },
          size: { type: "string", description: "Company size" },
          founded: { type: "string", description: "Founded date/year" }
        }
      }
    }
  },
  {
    type: "function",
    function: {
      name: "add_competitor",
      description: "Add a new competitor profile. Use when user says 'add competitor', 'track competitor', or 'new competitor'.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "Competitor name" },
          website: { type: "string", description: "Competitor website URL" },
          description: { type: "string", description: "Brief description" },
          market_position: { type: "string", enum: ["Market Leader", "Challenger", "Niche Player", "Emerging"], description: "Market position" }
        },
        required: ["name"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "update_competitor",
      description: "Update an existing competitor's information. Use when user says 'update competitor', 'edit competitor', or 'change competitor details'.",
      parameters: {
        type: "object",
        properties: {
          competitor_id: { type: "string", description: "UUID of the competitor" },
          name: { type: "string" },
          website: { type: "string" },
          description: { type: "string" },
          market_position: { type: "string" },
          notes: { type: "string", description: "Additional notes" }
        },
        required: ["competitor_id"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "trigger_competitor_analysis",
      description: "Trigger AI-powered competitor intelligence extraction and analysis. Use when user says 'analyze competitor', 'scan competitor', or 'get competitor intelligence'.",
      parameters: {
        type: "object",
        properties: {
          competitor_id: { type: "string", description: "UUID of competitor to analyze" },
          competitor_name: { type: "string", description: "Competitor name (used to look up ID if not provided)" }
        }
      }
    }
  }
];

export const OFFERINGS_ACTION_TOOL_NAMES = [
  'create_solution', 'update_solution', 'delete_solution',
  'update_company_info', 'add_competitor', 'update_competitor',
  'trigger_competitor_analysis'
];

export async function executeOfferingsActionTool(
  toolName: string, toolArgs: any, supabase: any, userId: string
): Promise<any> {
  console.log(`[OFFERINGS-ACTION] ${toolName} | user: ${userId}`);

  try {
    switch (toolName) {
      case 'create_solution': {
        const { data, error } = await supabase.from('solutions').insert({
          user_id: userId,
          name: toolArgs.name,
          description: toolArgs.description || '',
          features: toolArgs.features || [],
          use_cases: toolArgs.use_cases || [],
          target_audience: toolArgs.target_audience || null,
          benefits: toolArgs.benefits || []
        }).select('id, name, description, created_at').single();

        if (error) throw error;
        return { success: true, message: `Created solution "${data.name}"`, item: data };
      }

      case 'update_solution': {
        const updates: any = {};
        if (toolArgs.name) updates.name = toolArgs.name;
        if (toolArgs.description) updates.description = toolArgs.description;
        if (toolArgs.features) updates.features = toolArgs.features;
        if (toolArgs.use_cases) updates.use_cases = toolArgs.use_cases;
        if (toolArgs.target_audience) updates.target_audience = toolArgs.target_audience;
        if (toolArgs.benefits) updates.benefits = toolArgs.benefits;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('solutions')
          .update(updates)
          .eq('id', toolArgs.solution_id)
          .eq('user_id', userId)
          .select('id, name').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Solution not found or access denied' };
        return { success: true, message: `Updated solution "${data.name}"`, item: data };
      }

      case 'delete_solution': {
        const { data, error } = await supabase.from('solutions')
          .delete()
          .eq('id', toolArgs.solution_id)
          .eq('user_id', userId)
          .select('id, name').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Solution not found or access denied' };
        return { success: true, message: `Deleted solution "${data.name}"` };
      }

      case 'update_company_info': {
        // Check if company info exists
        const { data: existing } = await supabase.from('company_info')
          .select('id')
          .eq('user_id', userId)
          .limit(1).single();

        const updates: any = {};
        if (toolArgs.name) updates.name = toolArgs.name;
        if (toolArgs.description) updates.description = toolArgs.description;
        if (toolArgs.industry) updates.industry = toolArgs.industry;
        if (toolArgs.website) updates.website = toolArgs.website;
        if (toolArgs.mission) updates.mission = toolArgs.mission;
        if (toolArgs.values) updates.values = toolArgs.values;
        if (toolArgs.size) updates.size = toolArgs.size;
        if (toolArgs.founded) updates.founded = toolArgs.founded;
        updates.updated_at = new Date().toISOString();

        let data, error;
        if (existing) {
          ({ data, error } = await supabase.from('company_info')
            .update(updates)
            .eq('id', existing.id)
            .eq('user_id', userId)
            .select('id, name').single());
        } else {
          updates.user_id = userId;
          if (!updates.name) updates.name = 'My Company';
          ({ data, error } = await supabase.from('company_info')
            .insert(updates)
            .select('id, name').single());
        }

        if (error) throw error;
        return { success: true, message: `Updated company info: "${data?.name}"`, item: data };
      }

      case 'add_competitor': {
        const { data, error } = await supabase.from('company_competitors').insert({
          user_id: userId,
          name: toolArgs.name,
          website: toolArgs.website || null,
          description: toolArgs.description || null,
          market_position: toolArgs.market_position || null
        }).select('id, name, website, market_position, created_at').single();

        if (error) throw error;
        return { success: true, message: `Added competitor "${data.name}"`, item: data };
      }

      case 'update_competitor': {
        const updates: any = {};
        if (toolArgs.name) updates.name = toolArgs.name;
        if (toolArgs.website) updates.website = toolArgs.website;
        if (toolArgs.description) updates.description = toolArgs.description;
        if (toolArgs.market_position) updates.market_position = toolArgs.market_position;
        if (toolArgs.notes) updates.notes = toolArgs.notes;
        updates.updated_at = new Date().toISOString();

        const { data, error } = await supabase.from('company_competitors')
          .update(updates)
          .eq('id', toolArgs.competitor_id)
          .eq('user_id', userId)
          .select('id, name').single();

        if (error) throw error;
        if (!data) return { success: false, message: 'Competitor not found or access denied' };
        return { success: true, message: `Updated competitor "${data.name}"`, item: data };
      }

      case 'trigger_competitor_analysis': {
        let competitorId = toolArgs.competitor_id;

        // Look up by name if no ID
        if (!competitorId && toolArgs.competitor_name) {
          const { data: found } = await supabase.from('company_competitors')
            .select('id')
            .eq('user_id', userId)
            .ilike('name', `%${toolArgs.competitor_name}%`)
            .limit(1).single();
          competitorId = found?.id;
        }

        if (!competitorId) {
          return { success: false, message: 'Competitor not found. Provide a valid competitor_id or competitor_name.' };
        }

        // Trigger the competitor discovery job
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (supabaseUrl && supabaseKey) {
          // Create a discovery job
          const { data: job, error: jobError } = await supabase.from('competitor_discovery_jobs').insert({
            user_id: userId,
            competitor_id: competitorId,
            status: 'pending'
          }).select('id').single();

          if (jobError) throw jobError;

          // Trigger the analyzer (non-blocking)
          fetch(`${supabaseUrl}/functions/v1/competitor-analyzer`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ competitor_id: competitorId, user_id: userId, job_id: job?.id })
          }).catch(err => console.error('[OFFERINGS-ACTION] Analyzer trigger error:', err));

          return {
            success: true,
            message: `Started competitor analysis. This may take a few minutes. Check back for results.`,
            jobId: job?.id
          };
        }

        return { success: false, message: 'Analysis service unavailable' };
      }

      default:
        return { error: `Unknown offerings action tool: ${toolName}` };
    }
  } catch (error) {
    console.error(`[OFFERINGS-ACTION] ${toolName} | FAILED:`, error);
    return { error: String(error) };
  }
}
